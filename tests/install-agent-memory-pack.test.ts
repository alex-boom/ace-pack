import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { validateAgentMemory } from '../scripts/agent-memory-lib.mjs'
import { installAcePack } from '../install-ace-pack.mjs'
import { installAgentMemoryPack } from '../install-agent-memory-pack.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const runnerPackageDescription =
  'Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required.'

async function createTargetRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'agent-memory-toolkit-install-'))

  tempDirs.push(rootDir)

  await writeFile(
    path.join(rootDir, 'package.json'),
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
    'utf8',
  )

  return rootDir
}

async function createTargetRepoWithoutPackageJson() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'agent-memory-toolkit-no-package-'))

  tempDirs.push(rootDir)

  return rootDir
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('installAcePack', () => {
  it('installs the ACE pack into another repository', async () => {
    const rootDir = await createTargetRepo()

    const result = await installAcePack(rootDir)
    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(result.createdFiles).toContain('AGENTS.md')
    expect(result.createdFiles).toContain('CLAUDE.md')
    expect(result.createdFiles).toContain('scripts/ace-hub.mjs')
    expect(result.createdFiles).toContain('scripts/ace-onboard.mjs')
    expect(result.createdFiles).toContain('scripts/ace-project-presets.mjs')
    expect(result.createdFiles).toContain('scripts/agent-memory-lib.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-classify.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-finish.mjs')
    expect(result.createdFiles).toContain('scripts/ai-report.mjs')
    expect(result.createdFiles).toContain('scripts/ai-update.mjs')
    expect(result.updatedFiles).toContain('package.json')
    expect(packageJson.scripts['ace:init']).toBe('node ./scripts/bootstrap-agent-memory.mjs')
    expect(packageJson.scripts['ace:check']).toBe('node ./scripts/check-agent-memory.mjs')
    expect(packageJson.scripts['ace:classify']).toBe('node ./scripts/ai-task-classify.mjs')
    expect(packageJson.scripts['ace:finish']).toBe('node ./scripts/ai-task-finish.mjs')
    expect(packageJson.scripts['ace:hub']).toBe('node ./scripts/ace-hub.mjs')
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
    expect(packageJson.scripts['ace:report']).toBe('node ./scripts/ai-report.mjs')
    expect(packageJson.scripts['ace:report:brief']).toBe('node ./scripts/ai-report-brief.mjs')
    expect(packageJson.scripts['agent-memory:init']).toBe(
      'node ./scripts/bootstrap-agent-memory.mjs',
    )
    expect(packageJson.scripts['agent-memory:check']).toBe('node ./scripts/check-agent-memory.mjs')
    expect(packageJson.scripts['ai:project:onboard']).toBe('node ./scripts/ace-onboard.mjs')
    expect(packageJson.scripts['ai:report']).toBe('node ./scripts/ai-report.mjs')
    expect(packageJson.scripts['ai:report:brief']).toBe('node ./scripts/ai-report-brief.mjs')
    expect(packageJson.scripts['ai:task:classify']).toBe('node ./scripts/ai-task-classify.mjs')
    expect(packageJson.scripts['ai:task:finish']).toBe('node ./scripts/ai-task-finish.mjs')
    expect(packageJson.scripts['ai:update:task']).toBe('node ./scripts/ai-update.mjs task')
    expect(packageJson.scripts['ace:validate']).toBeUndefined()
    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })

  it('is idempotent when installed again into the same repository', async () => {
    const rootDir = await createTargetRepo()

    const firstRun = await installAgentMemoryPack(rootDir)
    const secondRun = await installAcePack(rootDir)
    const agentsContent = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')

    expect(firstRun.createdFiles.length).toBeGreaterThan(0)
    expect(secondRun).toEqual({
      createdFiles: [],
      targetDir: rootDir,
      updatedFiles: [],
    })
    expect(agentsContent.match(/agent-memory-workflow:start/gm)).toHaveLength(1)
  })

  it('creates a lightweight package runner for non-JS repositories', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    const result = await installAcePack(rootDir)
    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(result.createdFiles).toContain('package.json')
    expect(packageJson).toMatchObject({
      description: runnerPackageDescription,
      private: true,
    })
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
  })

  it('supports npm-ready ace-pack init target syntax', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    await execFileAsync(process.execPath, [path.resolve('install-ace-pack.mjs'), 'init', rootDir])

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(packageJson.description).toBe(runnerPackageDescription)
    expect(packageJson.scripts['ace:init']).toBe('node ./scripts/bootstrap-agent-memory.mjs')
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
  })

  it('accepts existing package.json files with a UTF-8 byte order mark', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    await writeFile(
      path.join(rootDir, 'package.json'),
      '\uFEFF{"name":"bom-repo","private":true,"scripts":{}}\n',
      'utf8',
    )

    await installAcePack(rootDir)

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
  })
})
