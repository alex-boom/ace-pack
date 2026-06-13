import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stagingDir = path.join(sourceDir, '.npm-publish')

function assertSafeStagingDir(dir) {
  const resolvedDir = path.resolve(dir)

  if (path.basename(resolvedDir) !== '.npm-publish' || path.dirname(resolvedDir) !== sourceDir) {
    throw new Error(`Refusing to rebuild unexpected staging directory: ${resolvedDir}`)
  }
}

async function copyToStage(sourceRelativePath, targetRelativePath = sourceRelativePath) {
  const sourcePath = path.join(sourceDir, sourceRelativePath)
  const targetPath = path.join(stagingDir, targetRelativePath)

  await mkdir(path.dirname(targetPath), { recursive: true })
  await copyFile(sourcePath, targetPath)
}

async function copyRootFilesByExtension(extension) {
  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(extension)) {
      await copyToStage(entry.name)
    }
  }
}

async function copyManagedScripts() {
  const scriptDir = path.join(sourceDir, 'scripts')
  const entries = await readdir(scriptDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mjs')) {
      await copyToStage(path.join('scripts', entry.name))
    }
  }
}

async function buildNpmPackage() {
  assertSafeStagingDir(stagingDir)

  await rm(stagingDir, { recursive: true, force: true })
  await mkdir(stagingDir, { recursive: true })

  await copyToStage('package.json')
  await copyToStage('LICENSE')
  await copyToStage('logo.svg')
  await copyToStage('logo-npm.svg')
  await copyToStage('README.npm.md', 'README.md')
  await copyRootFilesByExtension('.cmd')
  await copyRootFilesByExtension('.mjs')
  await copyManagedScripts()

  const readme = await readFile(path.join(stagingDir, 'README.md'), 'utf8')

  if (!readme.includes('./logo-npm.svg')) {
    throw new Error('Generated npm README does not reference ./logo-npm.svg.')
  }

  process.stdout.write(`Built npm package staging directory: ${path.relative(sourceDir, stagingDir)}\n`)
}

await buildNpmPackage()
