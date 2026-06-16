import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkedDirectories = ['.', 'scripts', 'tools']
const grandfatheredFiles = new Set([
  // Existing long modules; split in a dedicated refactor to avoid mixing behavior changes.
  'scripts/ace-discover.mjs',
  'scripts/ace-onboard.mjs',
])
const maxLines = 400
const violations = []

for (const filePath of await listSourceFiles()) {
  if (grandfatheredFiles.has(filePath)) {
    continue
  }

  const content = await readFile(path.join(rootDir, filePath), 'utf8')
  const lineCount = content.replace(/\r?\n$/u, '').split(/\r?\n/u).length

  if (lineCount > maxLines) {
    violations.push(`${filePath}: ${lineCount} lines`)
  }
}

if (violations.length > 0) {
  process.stderr.write(`Files exceed ${maxLines} lines:\n`)
  for (const violation of violations) {
    process.stderr.write(`- ${violation}\n`)
  }
  process.exit(1)
}

process.stdout.write('[ACE CHECK] Line limit check passed.\n')

async function listSourceFiles() {
  const files = []

  for (const directory of checkedDirectories) {
    const entries = await readdir(path.join(rootDir, directory), { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && /\.(?:mjs|js)$/u.test(entry.name)) {
        files.push(path.posix.join(directory, entry.name).replace(/^\.\//u, ''))
      }
    }
  }

  return files.sort()
}
