import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { installAcePack } from '../install-ace-pack.mjs'
import { runAceDestroy } from '../scripts/ace-destroy.mjs'
import { runAceEject } from '../scripts/ace-eject.mjs'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createRepo(prefix = 'ace-uninstall-') {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), prefix))
  tempDirs.push(rootDir)

  await writeRepoFile(
    rootDir,
    'package.json',
    `${JSON.stringify(
      {
        name: 'target-repo',
        private: true,
        scripts: {
          test: 'echo "ok"',
        },
      },
      null,
      2,
    )}\n`,
  )

  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

async function exists(filePath: string) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeActiveDecision(rootDir: string) {
  await writeRepoFile(
    rootDir,
    '.ai/knowledge/decisions.md',
    `# Decisions

## 2026-06-14 17:20

Decision:
- Keep the payment adapter boundary.

Reason:
- It protects project architecture.

Impact:
- Future agents should preserve the adapter.
`,
  )
}

describe('ACE eject and destroy', () => {
  it('does not create an export for template-only ACE memory', async () => {
    const rootDir = await createRepo()
    await installAcePack(rootDir)

    const result = await runAceEject(rootDir)

    expect(result.active).toBe(false)
    expect(result.exportDir).toBeNull()
  })

  it('exports active ACE memory with restore instructions', async () => {
    const rootDir = await createRepo()
    await installAcePack(rootDir)
    await writeActiveDecision(rootDir)

    const result = await runAceEject(rootDir)

    expect(result.active).toBe(true)
    expect(result.exportDir).toMatch(/^ace-export-\d{8}-\d{6}$/u)
    expect(result.exportedFiles).toEqual(
      expect.arrayContaining(['.ai', 'AGENTS.md', 'CLAUDE.md', '.cursorrules', 'RESTORE.md']),
    )

    const exportDir = path.join(rootDir, result.exportDir ?? '')
    await expect(readFile(path.join(exportDir, '.ai/knowledge/decisions.md'), 'utf8')).resolves.toContain(
      'payment adapter boundary',
    )
    await expect(readFile(path.join(exportDir, 'RESTORE.md'), 'utf8')).resolves.toContain(
      'npx ace-pack@latest init',
    )
  })

  it('refuses to destroy active memory before eject creates an export', async () => {
    const rootDir = await createRepo()
    await installAcePack(rootDir)
    await writeActiveDecision(rootDir)

    await expect(runAceDestroy(rootDir)).rejects.toThrow('Active ACE memory found')
    await expect(exists(path.join(rootDir, '.ai/knowledge/decisions.md'))).resolves.toBe(true)
  })

  it('destroys only ACE-owned artifacts after export and preserves custom project files', async () => {
    const rootDir = await createRepo()
    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.scripts['ace:validate'] = 'npm run lint && npm test'
    packageJson.scripts['ace:finish'] = 'echo custom finish'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
    await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep custom rules.\n')
    await writeRepoFile(rootDir, 'CLAUDE.md', '# Custom Claude\n')
    await writeRepoFile(rootDir, 'DEVELOPING.md', '# Developing\n')
    await writeRepoFile(rootDir, 'ROADMAP.md', '# Roadmap\n')
    await writeRepoFile(rootDir, 'scripts/build.mjs', 'console.log("build")\n')

    await installAcePack(rootDir)
    await writeActiveDecision(rootDir)
    await runAceEject(rootDir)

    const result = await runAceDestroy(rootDir)

    expect(result.usedExport).toMatch(/^ace-export-/u)
    await expect(exists(path.join(rootDir, '.ai'))).resolves.toBe(false)
    await expect(exists(path.join(rootDir, 'scripts/ace-cli.mjs'))).resolves.toBe(false)
    await expect(exists(path.join(rootDir, 'scripts/build.mjs'))).resolves.toBe(true)
    await expect(readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')).resolves.toBe(
      '# AGENTS.md\n\n## Project Rules\n\nKeep custom rules.\n',
    )
    await expect(readFile(path.join(rootDir, 'CLAUDE.md'), 'utf8')).resolves.toBe('# Custom Claude\n')
    await expect(exists(path.join(rootDir, 'DEVELOPING.md'))).resolves.toBe(true)
    await expect(exists(path.join(rootDir, 'ROADMAP.md'))).resolves.toBe(true)

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    expect(updatedPackageJson.scripts.test).toBe('echo "ok"')
    expect(updatedPackageJson.scripts['ace:validate']).toBe('npm run lint && npm test')
    expect(updatedPackageJson.scripts['ace:finish']).toBe('echo custom finish')
    expect(updatedPackageJson.scripts).not.toHaveProperty('ace')
  })

  it('removes ACE-created runner package.json when no project package existed', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-uninstall-runner-'))
    tempDirs.push(rootDir)

    await installAcePack(rootDir)
    await runAceDestroy(rootDir)

    await expect(exists(path.join(rootDir, 'package.json'))).resolves.toBe(false)
    await expect(exists(path.join(rootDir, '.ai'))).resolves.toBe(false)
    await expect(exists(path.join(rootDir, 'scripts'))).resolves.toBe(false)
  })

  it('refuses to destroy the ACE product repository without explicit override', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-product-guard-'))
    tempDirs.push(rootDir)

    await writeRepoFile(
      rootDir,
      'package.json',
      `${JSON.stringify({ name: 'ace-pack', private: true, scripts: {} }, null, 2)}\n`,
    )
    await writeRepoFile(rootDir, 'install-ace-pack.mjs', '')
    await writeRepoFile(rootDir, 'DEVELOPING.md', '# Developing\n')
    await writeRepoFile(rootDir, 'ROADMAP.md', '# Roadmap\n')

    await expect(runAceDestroy(rootDir)).rejects.toThrow('ACE product repository')
  })
})
