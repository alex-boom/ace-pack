import { execFile } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stagingDir = path.join(rootDir, '.npm-publish')
const forbiddenExactPaths = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'DEVELOPING.md',
  'ROADMAP.md',
  'README.npm.md',
  '.ai',
])
const forbiddenPathPrefixes = ['.ai/', 'package/.ai/']
const requiredPaths = new Set([
  'README.md',
  'LICENSE',
  'package.json',
  'logo.svg',
  'logo-npm.svg',
  'install-ace-pack.mjs',
  'install-agent-memory-pack.mjs',
  'scripts/agent-memory-templates.mjs',
])

async function execNpm(args) {
  const options = {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  }

  if (process.platform !== 'win32') {
    return execFileAsync('npm', args, options)
  }

  const command = ['npm.cmd', ...args].join(' ')

  return execFileAsync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], options)
}

function normalizePackagePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^package\//, '')
}

function isForbiddenPath(filePath) {
  const normalizedPath = normalizePackagePath(filePath)

  return (
    forbiddenExactPaths.has(normalizedPath) ||
    forbiddenPathPrefixes.some((prefix) => normalizedPath.startsWith(prefix))
  )
}

async function collectFiles(directory, baseDirectory = directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, baseDirectory)))
      continue
    }

    if (entry.isFile()) {
      files.push(normalizePackagePath(path.relative(baseDirectory, absolutePath)))
    }
  }

  return files.sort()
}

async function getDryRunFiles() {
  const { stdout } = await execNpm([
    'pack',
    path.relative(rootDir, stagingDir),
    '--dry-run',
    '--json',
  ])
  const payload = JSON.parse(stdout)
  const packageInfo = Array.isArray(payload) ? payload[0] : payload

  return packageInfo.files.map((file) => normalizePackagePath(file.path)).sort()
}

function assertNoForbiddenFiles(label, files) {
  const forbiddenFiles = files.filter(isForbiddenPath)

  if (forbiddenFiles.length > 0) {
    throw new Error(`${label} contains forbidden repo-local files: ${forbiddenFiles.join(', ')}`)
  }
}

function assertRequiredFiles(files) {
  const missingFiles = [...requiredPaths].filter((filePath) => !files.includes(filePath))

  if (missingFiles.length > 0) {
    throw new Error(`npm payload is missing required files: ${missingFiles.join(', ')}`)
  }
}

async function assertStagedPackageUsesNpmReadme() {
  const readme = await readFile(path.join(stagingDir, 'README.md'), 'utf8')

  if (!readme.includes('./logo-npm.svg')) {
    throw new Error('Staged npm README must reference ./logo-npm.svg.')
  }
}

async function main() {
  await assertStagedPackageUsesNpmReadme()

  const stagedFiles = await collectFiles(stagingDir)
  const packedFiles = await getDryRunFiles()

  assertNoForbiddenFiles('Staged npm package', stagedFiles)
  assertNoForbiddenFiles('npm pack dry-run payload', packedFiles)
  assertRequiredFiles(packedFiles)

  process.stdout.write(`npm payload guard passed: ${packedFiles.length} packed files checked.\n`)
}

await main()
