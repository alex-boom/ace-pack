import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { archiveMemoryLogs } from '../scripts/ace-archive.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const archiveScriptPath = path.resolve('scripts/ace-archive.mjs')

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createArchiveRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-archive-'))
  tempDirs.push(rootDir)

  await writeRepoFile(
    rootDir,
    '.ai/knowledge/work-log.md',
    '# Work Log\n\n## 2026-06-17\n- One\n- Two\n- Three\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/knowledge/reflection-log.md',
    '# Reflection Log\n\n## Unresolved\n- One\n\n## Resolved\n- Two\n',
  )

  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

describe('archiveMemoryLogs', () => {
  it('reports dry-run archive candidates without writing files', async () => {
    const rootDir = await createArchiveRepo()
    const beforeWorkLog = await readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8')

    const { stdout } = await execFileAsync(
      process.execPath,
      [archiveScriptPath, '--dry-run', '--max-lines', '3'],
      { cwd: rootDir },
    )

    expect(stdout).toContain('Would archive .ai/knowledge/work-log.md')
    expect(stdout).toContain('Would archive .ai/knowledge/reflection-log.md')
    await expect(readFile(path.join(rootDir, '.ai/archive/2026-06-17-work-log.md'), 'utf8'))
      .rejects
      .toThrow()
    await expect(readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8'))
      .resolves
      .toBe(beforeWorkLog)
  })

  it('moves oversized active logs into archive and writes clickable links', async () => {
    const rootDir = await createArchiveRepo()
    const now = new Date(2026, 5, 17, 12, 0, 0)

    const result = await archiveMemoryLogs(rootDir, { maxLines: 3, now })
    const workArchive = await readFile(
      path.join(rootDir, '.ai/archive/2026-06-17-work-log.md'),
      'utf8',
    )
    const reflectionArchive = await readFile(
      path.join(rootDir, '.ai/archive/2026-06-17-reflection-log.md'),
      'utf8',
    )
    const activeWorkLog = await readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8')
    const activeReflectionLog = await readFile(
      path.join(rootDir, '.ai/knowledge/reflection-log.md'),
      'utf8',
    )

    expect(result.results.map((item) => item.action)).toEqual(['archived', 'archived'])
    expect(workArchive).toContain('- Three')
    expect(reflectionArchive).toContain('## Resolved')
    expect(activeWorkLog).toContain(
      '*Archived history can be found in [2026-06-17-work-log.md](../archive/2026-06-17-work-log.md)*',
    )
    expect(activeReflectionLog).toContain(
      '*Archived history can be found in [2026-06-17-reflection-log.md](../archive/2026-06-17-reflection-log.md)*',
    )
    expect(activeReflectionLog).toContain('## Unresolved')
    expect(activeReflectionLog).toContain('## Resolved')
  })

  it('leaves under-limit files unchanged', async () => {
    const rootDir = await createArchiveRepo()
    const beforeWorkLog = await readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8')

    const result = await archiveMemoryLogs(rootDir, { maxLines: 100 })

    expect(result.results.map((item) => item.action)).toEqual(['unchanged', 'unchanged'])
    await expect(readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8'))
      .resolves
      .toBe(beforeWorkLog)
    await expect(readdir(path.join(rootDir, '.ai/archive'))).rejects.toThrow()
  })

  it('adds a suffix when archiving again on the same day', async () => {
    const rootDir = await createArchiveRepo()
    const now = new Date(2026, 5, 17, 12, 0, 0)

    await archiveMemoryLogs(rootDir, { maxLines: 3, now })
    await writeRepoFile(
      rootDir,
      '.ai/knowledge/work-log.md',
      '# Work Log\n\n## 2026-06-17\n- A\n- B\n- C\n',
    )
    await archiveMemoryLogs(rootDir, { maxLines: 3, now })

    await expect(readFile(path.join(rootDir, '.ai/archive/2026-06-17-work-log.md'), 'utf8'))
      .resolves
      .toContain('- Three')
    await expect(readFile(path.join(rootDir, '.ai/archive/2026-06-17-work-log-2.md'), 'utf8'))
      .resolves
      .toContain('- C')
  })
})
