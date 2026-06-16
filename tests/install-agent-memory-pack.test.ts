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
} from '../scripts/ace-install-lib.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const installAgentMemoryPack = installAcePack
const runnerPackageDescription =
  'Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required.'
const aceValidatePlaceholder = 'echo "Add project mechanical checks here: lint, typecheck, test"'

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
    expect(result.createdFiles).toContain('scripts/ace-cli.mjs')
    expect(result.createdFiles).toContain('scripts/ace-discover.mjs')
    expect(result.createdFiles).toContain('scripts/ace-destroy.mjs')
    expect(result.createdFiles).toContain('scripts/ace-eject.mjs')
    expect(result.createdFiles).toContain('scripts/ace-hub.mjs')
    expect(result.createdFiles).toContain('scripts/ace-migrate.mjs')
    expect(result.createdFiles).toContain('scripts/ace-mcp-server.mjs')
    expect(result.createdFiles).toContain('scripts/ace-onboard.mjs')
    expect(result.createdFiles).toContain('scripts/ace-project-presets.mjs')
    expect(result.createdFiles).toContain('scripts/ace-quality-gate.mjs')
    expect(result.createdFiles).toContain('scripts/ace-task-state.mjs')
    expect(result.createdFiles).toContain('scripts/ace-uninstall-utils.mjs')
    expect(result.createdFiles).toContain('scripts/agent-memory-lib.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-classify.mjs')
    expect(result.createdFiles).toContain('scripts/ai-task-finish.mjs')
    expect(result.createdFiles).toContain('scripts/ai-report.mjs')
    expect(result.createdFiles).toContain('scripts/ai-update.mjs')
    expect(result.createdFiles).toContain('.cursorrules')
    expect(result.createdFiles).toContain('.windsurfrules')
    expect(result.createdFiles).toContain('.github/copilot-instructions.md')
    expect(result.updatedFiles).toContain('package.json')
    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    for (const removedScript of [
      'ace:init',
      'ace:check',
      'ace:classify',
      'ace:discover',
      'ace:finish',
      'ace:gate',
      'ace:hub',
      'ace:onboard',
      'ace:report',
      'ace:report:brief',
      'agent-memory:init',
      'agent-memory:check',
      'ai:project:onboard',
      'ai:report',
      'ai:report:brief',
      'ai:task:classify',
      'ai:task:finish',
      'ai:update:task',
    ]) {
      expect(packageJson.scripts).not.toHaveProperty(removedScript)
    }
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      '# Task State',
    )
    await expect(
      readFile(path.join(rootDir, '.ai/config/memory-config.json'), 'utf8'),
    ).resolves.toContain('"ACE (Agentic Context Engine) Configuration"')
    await expect(
      readFile(path.join(rootDir, '.ai/knowledge/tech-docs.md'), 'utf8'),
    ).resolves.toContain('# Technical Docs')
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
      expect(content).toContain('ace-managed-ide-rules:start')
      expect(content).toContain('ALWAYS read `AGENTS.md`')
      expect(content).toContain('Read `.ai/generated/report-brief.md`')
      expect(content).toContain('pnpm ace finish')
    }
  })

  it('appends managed blocks to existing project-owned IDE bridge files', async () => {
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

    expect(result.updatedFiles).toEqual(
      expect.arrayContaining(['.cursorrules', '.windsurfrules', '.github/copilot-instructions.md']),
    )
    await expect(readFile(path.join(rootDir, '.cursorrules'), 'utf8')).resolves.toContain(
      'custom cursor rules',
    )
    await expect(readFile(path.join(rootDir, '.cursorrules'), 'utf8')).resolves.toContain(
      'ace-managed-ide-rules:start',
    )
    await expect(readFile(path.join(rootDir, '.windsurfrules'), 'utf8')).resolves.toContain(
      'custom windsurf rules',
    )
    await expect(
      readFile(path.join(rootDir, '.github/copilot-instructions.md'), 'utf8'),
    ).resolves.toContain('# Custom Copilot')
  })

  it('upgrades old ACE-only IDE bridge files to managed-block form', async () => {
    const rootDir = await createTargetRepo()
    const oldBridge = `# ACE IDE Agent Bridge

Follow AGENTS.md as the authoritative repository instruction file.

For new work:
- Read .ai/generated/report-brief.md first when it exists.
- Generate startup context with pnpm ace hub start.
- Classify the task with pnpm ace classify before implementation.
- Validate ACE memory with pnpm ace check when context may be stale.
- Close the task with pnpm ace finish before handoff.

Do not replace AGENTS.md or .ai/* workflow rules with IDE-specific policy. This
file is only a thin bridge from the IDE agent to ACE.
`

    await writeFile(path.join(rootDir, '.cursorrules'), oldBridge, 'utf8')

    const result = await installAcePack(rootDir)
    const cursorRules = await readFile(path.join(rootDir, '.cursorrules'), 'utf8')

    expect(result.updatedFiles).toContain('.cursorrules')
    expect(cursorRules).toContain('ace-managed-ide-rules:start')
    expect(cursorRules).not.toContain('Follow AGENTS.md as the authoritative')
    expect(cursorRules.match(/ace-managed-ide-rules:start/gm)).toHaveLength(1)
  })

  it('cleans old ACE bridge text when a managed block was previously appended', async () => {
    const rootDir = await createTargetRepo()
    const mixedBridge = `# ACE IDE Agent Bridge

Follow AGENTS.md as the authoritative repository instruction file.

For new work:
- Read .ai/generated/report-brief.md first when it exists.
- Generate startup context with pnpm ace hub start.
- Classify the task with pnpm ace classify before implementation.
- Validate ACE memory with pnpm ace check when context may be stale.
- Close the task with pnpm ace finish before handoff.

Do not replace AGENTS.md or .ai/* workflow rules with IDE-specific policy. This
file is only a thin bridge from the IDE agent to ACE.

<!-- ace-managed-ide-rules:start -->
stale block
<!-- ace-managed-ide-rules:end -->
`

    await writeFile(path.join(rootDir, '.cursorrules'), mixedBridge, 'utf8')

    await installAcePack(rootDir)
    const cursorRules = await readFile(path.join(rootDir, '.cursorrules'), 'utf8')

    expect(cursorRules).toContain('ALWAYS read `AGENTS.md`')
    expect(cursorRules).not.toContain('Follow AGENTS.md as the authoritative')
    expect(cursorRules).not.toContain('stale block')
    expect(cursorRules.match(/ace-managed-ide-rules:start/gm)).toHaveLength(1)
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
    expect(updatedPackageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(updatedPackageJson.scripts).not.toHaveProperty('ace:check')
  })

  it('does not overwrite a project-owned ace router script', async () => {
    const rootDir = await createTargetRepo()

    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.scripts.ace = 'node ./custom-ace.js'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

    await installAcePack(rootDir)

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

    expect(updatedPackageJson.scripts.ace).toBe('node ./custom-ace.js')
    expect(updatedPackageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(updatedPackageJson.scripts).not.toHaveProperty('ace:finish')
  })

  it('prunes old ACE-owned default aliases without deleting custom scripts', async () => {
    const rootDir = await createTargetRepo()

    const packageJsonPath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    packageJson.scripts['ace:check'] = 'node ./scripts/check-agent-memory.mjs'
    packageJson.scripts['ai:task:finish'] = 'node ./scripts/ai-task-finish.mjs'
    packageJson.scripts['ace:finish'] = 'echo custom finish'
    packageJson.scripts['ace:validate'] = 'node ./scripts/check-agent-memory.mjs'
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

    await installAcePack(rootDir)

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

    expect(updatedPackageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(updatedPackageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(updatedPackageJson.scripts).not.toHaveProperty('ace:check')
    expect(updatedPackageJson.scripts).not.toHaveProperty('ai:task:finish')
    expect(updatedPackageJson.scripts['ace:finish']).toBe('echo custom finish')
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
    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(packageJson.scripts).not.toHaveProperty('ace:onboard')
    expect(packageJson.scripts).not.toHaveProperty('ace:gate')
  })

  it('supports npm-ready ace-pack init target syntax', async () => {
    const rootDir = await createTargetRepoWithoutPackageJson()

    await execFileAsync(process.execPath, [path.resolve('install-ace-pack.mjs'), 'init', rootDir])

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))

    expect(packageJson.description).toBe(runnerPackageDescription)
    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(packageJson.scripts).not.toHaveProperty('ace:init')
    expect(packageJson.scripts).not.toHaveProperty('ace:onboard')
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
      await readFile(path.join(rootDir, '.ai', 'config', 'memory-config.json'), 'utf8'),
    )
    const projectProfile = await readFile(
      path.join(rootDir, '.ai', 'config', 'project-profile.md'),
      'utf8',
    )

    expect(memoryConfig._profile.status).toBe('profiled')
    expect(projectProfile).toContain('# ACE Project Profile')
    expect(stderr).toContain('Onboarded:')
    expect(stderr).toMatch(/(?:npm run ace -- check|pnpm ace check)/u)
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

    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(packageJson.scripts).not.toHaveProperty('ace:onboard')
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
    expect(formatScriptCommand('npm', 'ace', ['onboard', '--apply'])).toBe(
      'npm run ace -- onboard --apply',
    )
    expect(formatScriptCommand('pnpm', 'ace', ['onboard', '--apply'])).toBe(
      'pnpm ace onboard --apply',
    )
    expect(formatScriptCommand('yarn', 'ace', ['onboard', '--apply'])).toBe(
      'yarn ace onboard --apply',
    )
    expect(formatScriptCommand('bun', 'ace', ['onboard', '--apply'])).toBe(
      'bun run ace -- onboard --apply',
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
