#!/usr/bin/env node
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ensureAgentMemory } from './scripts/agent-memory-lib.mjs'

const REQUIRED_PACKAGE_SCRIPTS = {
  'ace:init': 'node ./scripts/bootstrap-agent-memory.mjs',
  'ace:check': 'node ./scripts/check-agent-memory.mjs',
  'ace:classify': 'node ./scripts/ai-task-classify.mjs',
  'ace:finish': 'node ./scripts/ai-task-finish.mjs',
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
}

const DEFAULT_PACKAGE_SCRIPTS = {
  'ace:validate': 'node ./scripts/check-agent-memory.mjs',
}

const MANAGED_SCRIPT_FILES = [
  'ace-hub.mjs',
  'ace-onboard.mjs',
  'ace-project-presets.mjs',
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

  for (const [scriptName, scriptValue] of Object.entries(REQUIRED_PACKAGE_SCRIPTS)) {
    if (nextScripts[scriptName] === scriptValue) {
      continue
    }

    nextScripts[scriptName] = scriptValue
    changed = true
  }

  for (const [scriptName, scriptValue] of Object.entries(DEFAULT_PACKAGE_SCRIPTS)) {
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

  const memoryResult = await ensureAgentMemory(normalizedTargetDir)
  createdFiles.push(...memoryResult.createdFiles)
  updatedFiles.push(...memoryResult.updatedFiles)

  return {
    createdFiles,
    targetDir: normalizedTargetDir,
    updatedFiles,
  }
}

export function resolveTargetDir(args, cwd = process.cwd()) {
  const [commandOrTarget, maybeTarget] = args

  if (commandOrTarget === 'init') {
    return maybeTarget ? path.resolve(cwd, maybeTarget) : cwd
  }

  return commandOrTarget ? path.resolve(cwd, commandOrTarget) : cwd
}

export function printInstallResult(result) {
  if (result.updatedFiles.length === 0 && result.createdFiles.length === 0) {
    process.stderr.write(`ACE pack is already up to date in ${result.targetDir}\n`)
  }

  if (result.updatedFiles.length > 0) {
    process.stderr.write(`Updated: ${result.updatedFiles.join(', ')}\n`)
  }

  if (result.createdFiles.length > 0) {
    process.stderr.write(`Created: ${result.createdFiles.join(', ')}\n`)
  }

  process.stderr.write('Next: run pnpm.cmd ace:onboard\n')
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  const targetDir = resolveTargetDir(process.argv.slice(2))
  const result = await installAcePack(targetDir)
  printInstallResult(result)
}
