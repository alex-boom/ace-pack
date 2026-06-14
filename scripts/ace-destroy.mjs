#!/usr/bin/env node
import { readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  ACE_ROUTER_SCRIPT,
  ACE_VALIDATE_PLACEHOLDER_SCRIPT,
  IDE_BRIDGE_FILES,
  MANAGED_SCRIPT_FILES,
  OLD_ACE_PACKAGE_SCRIPTS,
  RUNNER_PACKAGE_DESCRIPTION,
  findAceExportDirs,
  hasActiveAceMemory,
  isDefaultAgentsContent,
  isExactAceIdeBridge,
  isExactClaudeTemplate,
  isProductRepository,
  pathExists,
  readJsonIfExists,
  removeAceWorkflowSection,
} from './ace-uninstall-utils.mjs'
import {
  getArgValue,
  parseCliArgs,
  readTextIfExists,
  writeAceBanner,
} from './ai-memory-utils.mjs'

export async function runAceDestroy(rootDir, options = {}) {
  if ((await isProductRepository(rootDir)) && options.allowProductRepo !== true) {
    throw new Error(
      'Refusing to destroy ACE inside the ACE product repository. Use --allow-product-repo only for explicit internal tests.',
    )
  }

  const memoryState = await hasActiveAceMemory(rootDir)
  const exportDirs = await findAceExportDirs(rootDir)

  if (memoryState.active && exportDirs.length === 0) {
    throw new Error('Active ACE memory found. Run `ace eject` before `ace destroy`.')
  }

  const result = {
    activeFiles: memoryState.activeFiles,
    preservedFiles: [],
    removedFiles: [],
    updatedFiles: [],
    usedExport: exportDirs[0] ?? null,
  }

  await removeAiDirectory(rootDir, result)
  await removeAgentsWorkflow(rootDir, result)
  await removeExactFile(rootDir, 'CLAUDE.md', isExactClaudeTemplate, result)

  for (const relativePath of IDE_BRIDGE_FILES) {
    await removeExactFile(
      rootDir,
      relativePath,
      (content) => isExactAceIdeBridge(relativePath, content),
      result,
    )
  }

  await removeManagedScripts(rootDir, result)
  await cleanupPackageJson(rootDir, result)

  options.stdout?.write('[ACE] Agentic Context Engine has been removed from this project.\n')

  if (result.usedExport) {
    options.stdout?.write(`[ACE] Preserved export: ./${result.usedExport}/\n`)
  }

  if (result.preservedFiles.length > 0) {
    options.stdout?.write(`[ACE] Preserved project-owned files: ${result.preservedFiles.join(', ')}\n`)
  }

  return result
}

async function removeAiDirectory(rootDir, result) {
  const aiPath = path.join(rootDir, '.ai')

  if (!(await pathExists(aiPath))) {
    return
  }

  await rm(aiPath, { force: true, recursive: true })
  result.removedFiles.push('.ai/')
}

async function removeAgentsWorkflow(rootDir, result) {
  const agentsPath = path.join(rootDir, 'AGENTS.md')
  const content = await readTextIfExists(agentsPath)

  if (content === null) {
    return
  }

  const workflowResult = removeAceWorkflowSection(content)
  const nextContent = workflowResult.content

  if (nextContent.trim().length === 0 || isDefaultAgentsContent(nextContent)) {
    await rm(agentsPath, { force: true })
    result.removedFiles.push('AGENTS.md')
    return
  }

  if (workflowResult.changed) {
    await writeFile(agentsPath, nextContent, 'utf8')
    result.updatedFiles.push('AGENTS.md')
    return
  }

  result.preservedFiles.push('AGENTS.md')
}

async function removeExactFile(rootDir, relativePath, predicate, result) {
  const filePath = path.join(rootDir, relativePath)
  const content = await readTextIfExists(filePath)

  if (content === null) {
    return
  }

  if (!predicate(content)) {
    result.preservedFiles.push(relativePath)
    return
  }

  await rm(filePath, { force: true })
  result.removedFiles.push(relativePath)

  await removeEmptyParentDirectories(rootDir, relativePath)
}

async function removeManagedScripts(rootDir, result) {
  for (const filename of MANAGED_SCRIPT_FILES) {
    const relativePath = path.posix.join('scripts', filename)
    const filePath = path.join(rootDir, relativePath)

    if (!(await pathExists(filePath))) {
      continue
    }

    await rm(filePath, { force: true })
    result.removedFiles.push(relativePath)
  }

  await removeDirectoryIfEmpty(path.join(rootDir, 'scripts'), result, 'scripts/')
}

async function cleanupPackageJson(rootDir, result) {
  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = await readJsonIfExists(packageJsonPath)

  if (packageJson === null) {
    return
  }

  const nextScripts = { ...(packageJson.scripts ?? {}) }
  let changed = false

  if (nextScripts.ace === ACE_ROUTER_SCRIPT) {
    delete nextScripts.ace
    changed = true
  }

  for (const [scriptName, scriptValue] of Object.entries(OLD_ACE_PACKAGE_SCRIPTS)) {
    if (nextScripts[scriptName] === scriptValue) {
      delete nextScripts[scriptName]
      changed = true
    }
  }

  if (nextScripts['ace:validate'] === ACE_VALIDATE_PLACEHOLDER_SCRIPT) {
    delete nextScripts['ace:validate']
    changed = true
  }

  if (!changed) {
    return
  }

  if (isAceRunnerPackage(packageJson, nextScripts)) {
    await rm(packageJsonPath, { force: true })
    result.removedFiles.push('package.json')
    return
  }

  const nextPackageJson = {
    ...packageJson,
    scripts: nextScripts,
  }

  await writeFile(packageJsonPath, `${JSON.stringify(nextPackageJson, null, 2)}\n`, 'utf8')
  result.updatedFiles.push('package.json')
}

function isAceRunnerPackage(packageJson, nextScripts) {
  const allowedKeys = new Set(['name', 'private', 'description', 'scripts'])

  return (
    packageJson.private === true &&
    packageJson.description === RUNNER_PACKAGE_DESCRIPTION &&
    Object.keys(nextScripts).length === 0 &&
    Object.keys(packageJson).every((key) => allowedKeys.has(key))
  )
}

async function removeEmptyParentDirectories(rootDir, relativePath) {
  let currentDir = path.dirname(path.join(rootDir, relativePath))

  while (currentDir.startsWith(rootDir) && currentDir !== rootDir) {
    try {
      await readdir(currentDir).then((entries) => {
        if (entries.length > 0) {
          throw new Error('not-empty')
        }
      })
      await rm(currentDir, { force: true, recursive: true })
      currentDir = path.dirname(currentDir)
    } catch {
      return
    }
  }
}

async function removeDirectoryIfEmpty(directoryPath, result, relativePath) {
  try {
    const entries = await readdir(directoryPath)

    if (entries.length > 0) {
      return
    }

    await rm(directoryPath, { force: true, recursive: true })
    result.removedFiles.push(relativePath)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return
    }

    throw error
  }
}

async function main() {
  writeAceBanner()

  const rawArgs = process.argv.slice(2)
  const args = parseCliArgs(rawArgs)
  const rootArg = getArgValue(args, 'root')
  const positionalRoot = rawArgs.find((token) => !token.startsWith('--'))
  const rootDir = path.resolve(process.cwd(), rootArg ?? positionalRoot ?? '.')

  await runAceDestroy(rootDir, {
    allowProductRepo: getArgValue(args, 'allow-product-repo') === 'true',
    stdout: process.stdout,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
