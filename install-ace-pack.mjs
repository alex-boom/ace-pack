#!/usr/bin/env node
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { onboardRepository } from './scripts/ace-onboard.mjs'
import { ensureAgentMemory } from './scripts/agent-memory-lib.mjs'

const ACE_ROUTER_SCRIPT = 'node ./scripts/ace-cli.mjs'
const ACE_VALIDATE_PLACEHOLDER_SCRIPT =
  'echo "Add project mechanical checks here: lint, typecheck, test"'

const OLD_ACE_PACKAGE_SCRIPTS = {
  'ace:init': 'node ./scripts/bootstrap-agent-memory.mjs',
  'ace:check': 'node ./scripts/check-agent-memory.mjs',
  'ace:classify': 'node ./scripts/ai-task-classify.mjs',
  'ace:finish': 'node ./scripts/ai-task-finish.mjs',
  'ace:gate': 'node ./scripts/ace-quality-gate.mjs',
  'ace:hub': 'node ./scripts/ace-hub.mjs',
  'ace:onboard': 'node ./scripts/ace-onboard.mjs',
  'ace:report': 'node ./scripts/ai-report.mjs',
  'ace:report:brief': 'node ./scripts/ai-report-brief.mjs',
  'agent-memory:init': 'node ./scripts/bootstrap-agent-memory.mjs',
  'agent-memory:check': 'node ./scripts/check-agent-memory.mjs',
  'ai:project:onboard': 'node ./scripts/ace-onboard.mjs',
  'ai:report': 'node ./scripts/ai-report.mjs',
  'ai:report:brief': 'node ./scripts/ai-report-brief.mjs',
  'ai:report:currentTaskCode': 'node ./scripts/ai-report-current-task-code.mjs',
  'ai:task:classify': 'node ./scripts/ai-task-classify.mjs',
  'ai:task:finish': 'node ./scripts/ai-task-finish.mjs',
  'ai:update:task': 'node ./scripts/ai-update.mjs task',
  'ai:update:handoff': 'node ./scripts/ai-update.mjs handoff',
  'ai:update:log': 'node ./scripts/ai-update.mjs log',
  'ai:update:decision': 'node ./scripts/ai-update.mjs decision',
  'ai:update:changed': 'node ./scripts/ai-update.mjs changed',
  'ace:validate': 'node ./scripts/check-agent-memory.mjs',
}

const DEFAULT_PACKAGE_SCRIPTS = {
  ace: ACE_ROUTER_SCRIPT,
  'ace:validate': ACE_VALIDATE_PLACEHOLDER_SCRIPT,
}

const MANAGED_SCRIPT_FILES = [
  'ace-cli.mjs',
  'ace-hub.mjs',
  'ace-migrate.mjs',
  'ace-mcp-server.mjs',
  'ace-onboard.mjs',
  'ace-project-presets.mjs',
  'ace-quality-gate.mjs',
  'ace-universal-doc-templates.mjs',
  'agent-memory-lib.mjs',
  'agent-memory-templates.mjs',
  'ai-memory-config.mjs',
  'ai-memory-utils.mjs',
  'ai-report-brief.mjs',
  'ai-report-current-task-code.mjs',
  'ai-report.mjs',
  'ai-task-classify.mjs',
  'ai-task-finish.mjs',
  'ai-update.mjs',
  'bootstrap-agent-memory.mjs',
  'check-agent-memory.mjs',
]

const defaultAgentsTemplate = `# AGENTS.md

Repository rules for AI coding agents working in this project.

## Project Rules

- Add project-specific stack, architecture, and workflow rules here.
`

const currentFilePath = fileURLToPath(import.meta.url)
const currentScriptDir = path.join(path.dirname(currentFilePath), 'scripts')
const RUNNER_PACKAGE_DESCRIPTION =
  'Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required.'
const KNOWN_PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun'])
const IDE_BRIDGE_FILES = [
  '.cursorrules',
  '.windsurfrules',
  '.github/copilot-instructions.md',
]

function normalizeTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}

async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

async function ensureDefaultAgentsFile(rootDir) {
  const agentsPath = path.join(rootDir, 'AGENTS.md')
  const existingContent = await readTextIfExists(agentsPath)

  if (existingContent !== null) {
    return { created: false, path: 'AGENTS.md' }
  }

  await writeFile(agentsPath, normalizeTrailingNewline(defaultAgentsTemplate), 'utf8')
  return { created: true, path: 'AGENTS.md' }
}

async function syncManagedScripts(rootDir) {
  const createdFiles = []
  const updatedFiles = []
  const targetScriptDir = path.join(rootDir, 'scripts')

  await mkdir(targetScriptDir, { recursive: true })

  for (const filename of MANAGED_SCRIPT_FILES) {
    const sourcePath = path.join(currentScriptDir, filename)
    const targetPath = path.join(targetScriptDir, filename)
    const sourceContent = await readFile(sourcePath, 'utf8')
    const targetContent = await readTextIfExists(targetPath)

    if (targetContent === sourceContent) {
      continue
    }

    await copyFile(sourcePath, targetPath)

    if (targetContent === null) {
      createdFiles.push(`scripts/${filename}`)
    } else {
      updatedFiles.push(`scripts/${filename}`)
    }
  }

  return { createdFiles, updatedFiles }
}

async function ensurePackageScripts(rootDir) {
  const { packageJson, packageJsonPath } = await ensurePackageJson(rootDir)
  const nextScripts = {
    ...(packageJson.scripts ?? {}),
  }
  let changed = false

  for (const [scriptName, scriptValue] of Object.entries(OLD_ACE_PACKAGE_SCRIPTS)) {
    if (scriptName === 'ace:validate' || nextScripts[scriptName] !== scriptValue) {
      continue
    }

    delete nextScripts[scriptName]
    changed = true
  }

  for (const [scriptName, scriptValue] of Object.entries(DEFAULT_PACKAGE_SCRIPTS)) {
    const isOldAceValidateDefault =
      scriptName === 'ace:validate' &&
      nextScripts[scriptName] === OLD_ACE_PACKAGE_SCRIPTS[scriptName]

    if (isOldAceValidateDefault) {
      nextScripts[scriptName] = scriptValue
      changed = true
      continue
    }

    if (scriptName in nextScripts) {
      continue
    }

    nextScripts[scriptName] = scriptValue
    changed = true
  }

  if (!changed) {
    return false
  }

  await writeFile(
    packageJsonPath,
    `${JSON.stringify({ ...packageJson, scripts: nextScripts }, null, 2)}\n`,
    'utf8',
  )

  return true
}

async function ensureIdeRuleBridges(rootDir, packageManager) {
  const createdFiles = []

  for (const relativePath of IDE_BRIDGE_FILES) {
    const filePath = path.join(rootDir, relativePath)
    const existingContent = await readTextIfExists(filePath)

    if (existingContent !== null) {
      continue
    }

    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(
      filePath,
      normalizeTrailingNewline(formatIdeBridgeContent(packageManager, relativePath)),
      'utf8',
    )
    createdFiles.push(relativePath)
  }

  return { createdFiles }
}

function formatIdeBridgeContent(packageManager, relativePath) {
  const hubCommand = formatAceRouterCommand(packageManager, 'hub start')
  const classifyCommand = formatAceRouterCommand(packageManager, 'classify')
  const finishCommand = formatAceRouterCommand(packageManager, 'finish')
  const checkCommand = formatAceRouterCommand(packageManager, 'check')
  const heading =
    relativePath.endsWith('.md') ? '# ACE IDE Agent Instructions' : '# ACE IDE Agent Bridge'

  return `${heading}

Follow AGENTS.md as the authoritative repository instruction file.

For new work:
- Read .ai/generated/report-brief.md first when it exists.
- Generate startup context with ${hubCommand}.
- Classify the task with ${classifyCommand} before implementation.
- Validate ACE memory with ${checkCommand} when context may be stale.
- Close the task with ${finishCommand} before handoff.

Do not replace AGENTS.md or .ai/* workflow rules with IDE-specific policy. This
file is only a thin bridge from the IDE agent to ACE.
`
}

function formatAceRouterCommand(packageManager, command) {
  if (packageManager === 'npm') {
    return `npm run ace -- ${command}`
  }

  if (packageManager === 'yarn') {
    return `yarn ace ${command}`
  }

  if (packageManager === 'bun') {
    return `bun run ace -- ${command}`
  }

  return `pnpm ace ${command}`
}

function buildPackageName(rootDir) {
  const folderName = path.basename(rootDir).toLowerCase()
  const packageName = folderName
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')

  return packageName || 'ace-project'
}

async function ensurePackageJson(rootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJsonContent = await readTextIfExists(packageJsonPath)

  if (packageJsonContent !== null) {
    return {
      created: false,
      packageJson: JSON.parse(stripByteOrderMark(packageJsonContent)),
      packageJsonPath,
    }
  }

  const packageJson = {
    name: buildPackageName(rootDir),
    private: true,
    description: RUNNER_PACKAGE_DESCRIPTION,
    scripts: {},
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

  return {
    created: true,
    packageJson,
    packageJsonPath,
  }
}

function stripByteOrderMark(content) {
  return content.replace(/^\uFEFF/u, '')
}

export async function installAcePack(targetDir) {
  const normalizedTargetDir = path.resolve(targetDir)
  const createdFiles = []
  const updatedFiles = []

  const packageResult = await ensurePackageJson(normalizedTargetDir)

  if (packageResult.created) {
    createdFiles.push('package.json')
  }

  const agentsResult = await ensureDefaultAgentsFile(normalizedTargetDir)

  if (agentsResult.created) {
    createdFiles.push(agentsResult.path)
  }

  const scriptResult = await syncManagedScripts(normalizedTargetDir)
  createdFiles.push(...scriptResult.createdFiles)
  updatedFiles.push(...scriptResult.updatedFiles)

  if (await ensurePackageScripts(normalizedTargetDir)) {
    updatedFiles.push('package.json')
  }

  const packageManager = await detectPackageManager(normalizedTargetDir)
  const bridgeResult = await ensureIdeRuleBridges(normalizedTargetDir, packageManager)
  createdFiles.push(...bridgeResult.createdFiles)

  const memoryResult = await ensureAgentMemory(normalizedTargetDir)
  createdFiles.push(...memoryResult.createdFiles)
  updatedFiles.push(...memoryResult.updatedFiles)

  const createdFileSet = new Set(createdFiles)

  return {
    createdFiles,
    targetDir: normalizedTargetDir,
    updatedFiles: updatedFiles.filter((filePath) => !createdFileSet.has(filePath)),
  }
}

export function resolveTargetDir(args, cwd = process.cwd()) {
  return parseInstallArgs(args, cwd).targetDir
}

export function parseInstallArgs(args, cwd = process.cwd()) {
  if (args.includes('--help') || args.includes('-h') || args[0] === 'help') {
    return {
      apply: false,
      help: true,
      preset: null,
      targetDir: cwd,
    }
  }

  const remainingArgs = [...args]

  if (remainingArgs[0] === 'init') {
    remainingArgs.shift()
  }

  let apply = false
  let preset = null
  let target = null

  for (let index = 0; index < remainingArgs.length; index += 1) {
    const arg = remainingArgs[index]

    if (arg === '--') {
      continue
    }

    if (arg === '--apply') {
      apply = true
      continue
    }

    if (arg === '--no-apply') {
      apply = false
      continue
    }

    if (arg === '--preset') {
      const nextArg = remainingArgs[index + 1]

      if (!nextArg || nextArg.startsWith('-')) {
        throw new Error('Missing value for --preset.')
      }

      preset = nextArg
      index += 1
      continue
    }

    if (arg.startsWith('--preset=')) {
      preset = arg.slice('--preset='.length)

      if (!preset) {
        throw new Error('Missing value for --preset.')
      }

      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    if (target !== null) {
      throw new Error(`Unexpected extra argument: ${arg}`)
    }

    target = arg
  }

  if (preset && !apply) {
    throw new Error('Use --preset together with --apply.')
  }

  return {
    apply,
    help: false,
    preset,
    targetDir: path.resolve(cwd, target ?? '.'),
  }
}

export function getHelpText(commandName = 'ace-pack') {
  return `ACE Pack - install AI project memory into a repository.

Usage:
  ${commandName} init [target] [--apply] [--preset <name>]
  ${commandName} [target]

Recommended:
  npx ace-pack@latest init
  pnpm dlx ace-pack init

Options:
  --apply            Run ace onboard --apply after installation.
  --preset <name>    Apply a built-in project preset during onboarding.
  -h, --help         Show this help.

Examples:
  npx ace-pack@latest init
  npx ace-pack@latest init D:\\All\\alex-work\\my-project --apply
  pnpm dlx ace-pack init . --apply

Do not use npm install ace-pack for setup. ACE is a scaffold CLI: run init so it
can add AGENTS.md, .ai/*, scripts/*, and package.json commands to the project.
`
}

function getPackageManagerFromPackageJson(packageJson) {
  if (typeof packageJson.packageManager !== 'string') {
    return null
  }

  const packageManagerName = packageJson.packageManager.split('@')[0]

  return KNOWN_PACKAGE_MANAGERS.has(packageManagerName) ? packageManagerName : null
}

function getPackageManagerFromUserAgent(userAgent = process.env.npm_config_user_agent) {
  if (!userAgent) {
    return null
  }

  const packageManagerName = userAgent.split('/')[0]

  return KNOWN_PACKAGE_MANAGERS.has(packageManagerName) ? packageManagerName : null
}

export async function detectPackageManager(rootDir) {
  const packageJsonContent = await readTextIfExists(path.join(rootDir, 'package.json'))

  if (packageJsonContent !== null) {
    const packageJson = JSON.parse(stripByteOrderMark(packageJsonContent))
    const packageManager = getPackageManagerFromPackageJson(packageJson)

    if (packageManager) {
      return packageManager
    }
  }

  const lockFileChecks = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
  ]

  for (const [filename, packageManager] of lockFileChecks) {
    if (await fileExists(path.join(rootDir, filename))) {
      return packageManager
    }
  }

  return getPackageManagerFromUserAgent() ?? 'npm'
}

export function formatScriptCommand(packageManager, scriptName, args = []) {
  const extraArgs = args.length > 0 ? args.join(' ') : ''

  if (scriptName === 'ace') {
    if (packageManager === 'npm') {
      return `npm run ace${extraArgs ? ` -- ${extraArgs}` : ''}`
    }

    if (packageManager === 'yarn') {
      return `yarn ace${extraArgs ? ` ${extraArgs}` : ''}`
    }

    if (packageManager === 'bun') {
      return `bun run ace${extraArgs ? ` -- ${extraArgs}` : ''}`
    }

    return `pnpm ace${extraArgs ? ` ${extraArgs}` : ''}`
  }

  if (packageManager === 'npm') {
    return `npm run ${scriptName}${extraArgs ? ` -- ${extraArgs}` : ''}`
  }

  if (packageManager === 'yarn') {
    return `yarn ${scriptName}${extraArgs ? ` ${extraArgs}` : ''}`
  }

  if (packageManager === 'bun') {
    return `bun run ${scriptName}${extraArgs ? ` ${extraArgs}` : ''}`
  }

  return `pnpm ${scriptName}${extraArgs ? ` -- ${extraArgs}` : ''}`
}

function formatPowerShellPnpmCommand(command) {
  return command.replace(/^pnpm /u, 'pnpm.cmd ')
}

export async function printInstallResult(result, options = {}) {
  const packageManager = options.packageManager ?? (await detectPackageManager(result.targetDir))

  if (result.updatedFiles.length === 0 && result.createdFiles.length === 0) {
    process.stderr.write(`ACE pack is already up to date in ${result.targetDir}\n`)
  }

  if (result.updatedFiles.length > 0) {
    process.stderr.write(`Updated: ${result.updatedFiles.join(', ')}\n`)
  }

  if (result.createdFiles.length > 0) {
    process.stderr.write(`Created: ${result.createdFiles.join(', ')}\n`)
  }

  if (result.onboarding?.applied) {
    process.stderr.write(`Onboarded: ${result.onboarding.writtenFiles.join(', ')}\n`)
  }

  const nextCommands = []

  if (!result.onboarding?.applied) {
    nextCommands.push(formatScriptCommand(packageManager, 'ace', ['onboard', '--apply']))
  }

  nextCommands.push(formatScriptCommand(packageManager, 'ace', ['check']))
  nextCommands.push(formatScriptCommand(packageManager, 'ace', ['hub']))

  process.stderr.write('\nNext:\n')

  for (const command of nextCommands) {
    process.stderr.write(`  ${command}\n`)
  }

  if (packageManager === 'pnpm' && process.platform === 'win32') {
    process.stderr.write(
      `\nWindows PowerShell note: if pnpm is blocked, use ${formatPowerShellPnpmCommand(
        nextCommands[0],
      )}\n`,
    )
  }
}

export async function runInstallCli(args, options = {}) {
  const commandName = options.commandName ?? 'ace-pack'
  const parsedArgs = parseInstallArgs(args)

  if (parsedArgs.help) {
    process.stdout.write(getHelpText(commandName))
    return
  }

  const result = await installAcePack(parsedArgs.targetDir)

  if (parsedArgs.apply) {
    result.onboarding = await onboardRepository(parsedArgs.targetDir, {
      apply: true,
      preset: parsedArgs.preset ?? undefined,
    })
  }

  await printInstallResult(result)
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  await runInstallCli(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n\nRun ace-pack --help for usage.\n`)
    process.exit(1)
  })
}
