import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { validateAgentMemory } from '../scripts/agent-memory-lib.mjs'
import {
  detectPackageManager,
  formatScriptCommand,
  installAcePack,
  parseInstallArgs,
} from '../install-ace-pack.mjs'
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
    expect(result.createdFiles).toContain('scripts/ace-mcp-server.mjs')
    expect(result.createdFiles).toContain('scripts/ace-onboard.mjs')
    expect(result.createdFiles).toContain('scripts/ace-project-presets.mjs')
    expect(result.createdFiles).toContain('scripts/ace-quality-gate.mjs')
    expect(result.createdFiles).toContain('scripts/agent-memory-lib.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-classify.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-finish.mjs')
    expect(result.createdFiles).toContain('scripts/ai-report.mjs')
    expect(result.createdFiles).toContain('scripts/ai-update.mjs')
    expect(result.createdFiles).toContain('.cursorrules')
    expect(result.createdFiles).toContain('.windsurfrules')
    expect(result.createdFiles).toContain('.github/copilot-instructions.md')
    expect(result.updatedFiles).toContain('package.json')
    expect(packageJson.scripts['ace:init']).toBe('node ./scripts/bootstrap-agent-memory.mjs')
    expect(packageJson.scripts['ace:check']).toBe('node ./scripts/check-agent-memory.mjs')
    expect(packageJson.scripts['ace:classify']).toBe('node ./scripts/ai-task-classify.mjs')
    expect(packageJson.scripts['ace:finish']).toBe('node ./scripts/ai-task-finish.mjs')
    expect(packageJson.scripts['ace:gate']).toBe('node ./scripts/ace-quality-gate.mjs')
    expect(packageJson.scripts['ace:hub']).toBe('node ./scripts/ace-hub.mjs')
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
    expect(packageJson.scripts['ace:report']).toBe('node ./scripts/ai-report.mjs')
    expect(packageJson.scripts['ace:report:brief']).toBe('node ./scripts/ai-report-brief.mjs')
    expect(packageJson.scripts['ace:validate']).toBe('node ./scripts/check-agent-memory.mjs')
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
    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })

  it('creates package-manager-aware IDE bridge files', async () => {
    const rootDir = await createTargetRepo()
    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.packageManager = 'pnpm@10.0.0'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

    await installAcePack(rootDir)

    const cursorRules = await readFile(path.join(rootDir, '.cursorrules'), 'utf8')
    const windsurfRules = await readFile(path.join(rootDir, '.windsurfrules'), 'utf8')
    const copilotInstructions = await readFile(
      path.join(rootDir, '.github/copilot-instructions.md'),
      'utf8',
    )

    for (const content of [cursorRules, windsurfRules, copilotInstructions]) {
      expect(content).toContain('Follow AGENTS.md')
      expect(content).toContain('Read .ai/report-brief.md')
      expect(content).toContain('pnpm ace:hub start')
      expect(content).toContain('pnpm ace:classify')
      expect(content).toContain('pnpm ace:finish')
    }
  })

  it('does not overwrite existing project-owned IDE bridge files', async () => {
    const rootDir = await createTargetRepo()

    await mkdir(path.join(rootDir, '.github'), { recursive: true })
    await writeFile(path.join(rootDir, '.cursorrules'), 'custom cursor rules\n', 'utf8')
    await writeFile(path.join(rootDir, '.windsurfrules'), 'custom windsurf rules\n', 'utf8')
    await writeFile(
      path.join(rootDir, '.github/copilot-instructions.md'),
      '# Custom Copilot\n',
      'utf8',
    )

    const result = await installAcePack(rootDir)

    expect(result.createdFiles).not.toContain('.cursorrules')
    expect(result.createdFiles).not.toContain('.windsurfrules')
    expect(result.createdFiles).not.toContain('.github/copilot-instructions.md')
    await expect(readFile(path.join(rootDir, '.cursorrules'), 'utf8')).resolves.toBe(
      'custom cursor rules\n',
    )
    await expect(readFile(path.join(rootDir, '.windsurfrules'), 'utf8')).resolves.toBe(
      'custom windsurf rules\n',
    )
    await expect(
      readFile(path.join(rootDir, '.github/copilot-instructions.md'), 'utf8'),
    ).resolves.toBe('# Custom Copilot\n')
  })

  it('does not overwrite a project-owned ace:validate script', async () => {
    const rootDir = await createTargetRepo()

    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.scripts['ace:validate'] = 'npm run lint && npm test'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

    await installAcePack(rootDir)

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

    expect(updatedPackageJson.scripts['ace:validate']).toBe('npm run lint && npm test')
    expect(updatedPackageJson.scripts['ace:check']).toBe('node ./scripts/check-agent-memory.mjs')
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
    expect(packageJson.scripts['ace:gate']).toBe('node ./scripts/ace-quality-gate.mjs')
    expect(packageJson.scripts['ace:validate']).toBe('node ./scripts/check-agent-memory.mjs')
  })

  it('supports npm-ready ace-pack init target syntax', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    await execFileAsync(process.execPath, [path.resolve('install-ace-pack.mjs'), 'init', rootDir])

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(packageJson.description).toBe(runnerPackageDescription)
    expect(packageJson.scripts['ace:init']).toBe('node ./scripts/bootstrap-agent-memory.mjs')
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
  })

  it('supports help output without installing files', async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      path.resolve('install-ace-pack.mjs'),
      '--help',
    ])

    expect(stdout).toContain('Usage:')
    expect(stdout).toContain('npx ace-pack@latest init')
    expect(stdout).toContain('Do not use npm install ace-pack for setup.')
  })

  it('supports init --apply to install and profile in one command', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    const { stderr } = await execFileAsync(process.execPath, [
      path.resolve('install-ace-pack.mjs'),
      'init',
      rootDir,
      '--apply',
    ])
    const memoryConfig = JSON.parse(
      await readFile(path.join(rootDir, '.ai', 'memory-config.json'), 'utf8'),
    )
    const projectProfile = await readFile(path.join(rootDir, '.ai', 'project-profile.md'), 'utf8')

    expect(memoryConfig._profile.status).toBe('profiled')
    expect(projectProfile).toContain('# ACE Project Profile')
    expect(stderr).toContain('Onboarded:')
    expect(stderr).toContain('ace:check')
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

describe('install CLI helpers', () => {
  it('parses init arguments and legacy target syntax', () => {
    const cwd = path.resolve('tmp-root')

    expect(parseInstallArgs(['init', './app', '--apply'], cwd)).toMatchObject({
      apply: true,
      help: false,
      targetDir: path.resolve(cwd, './app'),
    })
    expect(parseInstallArgs(['./legacy-app'], cwd).targetDir).toBe(
      path.resolve(cwd, './legacy-app'),
    )
    expect(parseInstallArgs(['init', '--apply', '--preset=next-trpc-drizzle-saas'], cwd)).toMatchObject(
      {
        apply: true,
        preset: 'next-trpc-drizzle-saas',
        targetDir: cwd,
      },
    )
  })

  it('formats package-manager-specific script commands', () => {
    expect(formatScriptCommand('npm', 'ace:onboard', ['--apply'])).toBe(
      'npm run ace:onboard -- --apply',
    )
    expect(formatScriptCommand('pnpm', 'ace:onboard', ['--apply'])).toBe(
      'pnpm ace:onboard -- --apply',
    )
    expect(formatScriptCommand('yarn', 'ace:onboard', ['--apply'])).toBe(
      'yarn ace:onboard --apply',
    )
    expect(formatScriptCommand('bun', 'ace:onboard', ['--apply'])).toBe(
      'bun run ace:onboard --apply',
    )
  })

  it('detects the project package manager for next-step output', async () => {
    const rootDir = await createTargetRepo()
    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.packageManager = 'pnpm@10.0.0'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

    await expect(detectPackageManager(rootDir)).resolves.toBe('pnpm')
  })
})
