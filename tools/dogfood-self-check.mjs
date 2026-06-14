import { execFile } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stagingDir = path.join(sourceRoot, '.npm-publish')

const EXPECTED_DOGFOOD_PATHS = [
  '.cursorrules',
  '.github/copilot-instructions.md',
  '.ai/',
  'AGENTS.md',
  'CLAUDE.md',
  'package.json',
  'scripts/',
  '.windsurfrules',
]

export async function runDogfoodSelfCheck(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? sourceRoot)
  const beforeStatus = await readGitStatus(rootDir)

  if (beforeStatus.length > 0 && !options.allowDirty) {
    throw new Error(
      [
        'Dogfood self-check requires a clean git worktree by default.',
        'Commit/stash current changes first, or rerun with --allow-dirty during an explicit release-readiness pass.',
      ].join(' '),
    )
  }

  await buildStagedPackage()
  const installResult = await installFromStagedPackage(rootDir)

  await runNodeScript(rootDir, 'ace-cli.mjs', ['check'])
  await runNodeScript(rootDir, 'ace-cli.mjs', ['gate'])
  await runNodeScript(rootDir, 'ace-cli.mjs', ['hub', '--mode', 'start'])

  const afterStatus = await readGitStatus(rootDir)
  const preExistingPaths = new Set(beforeStatus.map((entry) => entry.path))
  const unexpectedChanges = afterStatus.filter((entry) => {
    if (isExpectedDogfoodChange(entry.path)) {
      return false
    }

    return !options.allowDirty || !preExistingPaths.has(entry.path)
  })

  if (unexpectedChanges.length > 0) {
    throw new Error(
      [
        'Dogfood self-check changed unexpected files:',
        unexpectedChanges.map((entry) => `${entry.status} ${entry.path}`).join(', '),
        'Review the diff before continuing.',
      ].join(' '),
    )
  }

  return {
    afterStatus,
    beforeStatus,
    installResult,
    passed: true,
    rootDir,
  }
}

async function buildStagedPackage() {
  await execFileAsync(process.execPath, [path.join(sourceRoot, 'tools', 'build-npm-package.mjs')], {
    cwd: sourceRoot,
  })
}

async function installFromStagedPackage(rootDir) {
  const installerUrl = pathToFileURL(path.join(stagingDir, 'install-ace-pack.mjs')).href
  const { installAcePack } = await import(`${installerUrl}?t=${Date.now()}`)

  return installAcePack(rootDir)
}

async function runNodeScript(rootDir, scriptName, args) {
  await execFileAsync(process.execPath, [path.join(rootDir, 'scripts', scriptName), ...args], {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
}

async function readGitStatus(rootDir) {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--short', '--untracked-files=all'], {
      cwd: rootDir,
      encoding: 'utf8',
    })

    return stdout
      .split(/\r?\n/u)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map(parseStatusLine)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Dogfood self-check requires a git worktree: ${message}`)
  }
}

function parseStatusLine(line) {
  const rawPath = line.slice(3)
  const normalizedPath = rawPath.includes(' -> ') ? rawPath.split(' -> ').at(-1) : rawPath

  return {
    path: normalizeStatusPath(normalizedPath),
    status: line.slice(0, 2).trim() || 'changed',
  }
}

function normalizeStatusPath(filePath) {
  return filePath.replace(/\\/gu, '/')
}

function isExpectedDogfoodChange(filePath) {
  return EXPECTED_DOGFOOD_PATHS.some((expectedPath) => {
    if (expectedPath.endsWith('/')) {
      return filePath.startsWith(expectedPath)
    }

    return filePath === expectedPath
  })
}

function parseArgs(argv) {
  const options = {
    allowDirty: argv.includes('--allow-dirty'),
    rootDir: sourceRoot,
  }

  const rootIndex = argv.indexOf('--root')

  if (rootIndex !== -1) {
    const rootDir = argv[rootIndex + 1]

    if (!rootDir || rootDir.startsWith('-')) {
      throw new Error('Missing value for --root.')
    }

    options.rootDir = path.resolve(process.cwd(), rootDir)
  }

  return options
}

async function main() {
  const result = await runDogfoodSelfCheck(parseArgs(process.argv.slice(2)))

  process.stdout.write(`[ACE DOGFOOD] Passed for ${result.rootDir}\n`)
  process.stdout.write(`[ACE DOGFOOD] Updated: ${result.installResult.updatedFiles.join(', ') || 'none'}\n`)
  process.stdout.write(`[ACE DOGFOOD] Created: ${result.installResult.createdFiles.join(', ') || 'none'}\n`)
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  await main().catch((error) => {
    process.stderr.write(`[ACE DOGFOOD] Failed: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
