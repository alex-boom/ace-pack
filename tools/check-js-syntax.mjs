import { execFile } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const directories = ['.', 'scripts', 'tools']

for (const filePath of await listJavaScriptFiles()) {
  await execFileAsync(process.execPath, ['--check', filePath], { cwd: rootDir })
}

process.stdout.write('[ACE CHECK] JavaScript syntax check passed.\n')

async function listJavaScriptFiles() {
  const files = []

  for (const directory of directories) {
    const absoluteDirectory = path.join(rootDir, directory)
    const entries = await readdir(absoluteDirectory, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile() || !/\.(?:mjs|js)$/u.test(entry.name)) {
        continue
      }

      files.push(path.join(directory, entry.name))
    }
  }

  return files.sort()
}
