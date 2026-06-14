#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  IDE_BRIDGE_FILES,
  copyRelativePathIfExists,
  createUniqueExportDir,
  hasActiveAceMemory,
} from './ace-uninstall-utils.mjs'
import { getArgValue, parseCliArgs, writeAceBanner } from './ai-memory-utils.mjs'

const EXPORT_PATHS = ['.ai', 'AGENTS.md', 'CLAUDE.md', ...IDE_BRIDGE_FILES]

export async function runAceEject(rootDir, options = {}) {
  const memoryState = await hasActiveAceMemory(rootDir)

  if (!memoryState.active) {
    options.stdout?.write('[ACE] No active project history found. ACE is safe to remove.\n')
    options.stdout?.write('[ACE] Next: run `ace destroy` to remove ACE-owned files.\n')

    return {
      active: false,
      activeFiles: [],
      exportDir: null,
      exportedFiles: [],
    }
  }

  const { directoryName, exportDir } = await createUniqueExportDir(rootDir)
  const exportedFiles = []

  for (const relativePath of EXPORT_PATHS) {
    if (await copyRelativePathIfExists(rootDir, relativePath, exportDir)) {
      exportedFiles.push(relativePath)
    }
  }

  await writeFile(path.join(exportDir, 'RESTORE.md'), formatRestoreInstructions(directoryName), 'utf8')
  exportedFiles.push('RESTORE.md')

  options.stdout?.write(`[ACE] Project memory safely exported to ./${directoryName}/\n`)
  options.stdout?.write('[ACE] Next: run `ace destroy` to remove ACE-owned files and scripts.\n')

  return {
    active: true,
    activeFiles: memoryState.activeFiles,
    exportDir: directoryName,
    exportedFiles,
  }
}

function formatRestoreInstructions(directoryName) {
  return `# Restore ACE Memory

This folder was created by \`ace eject\` before ACE removal.

To restore ACE memory:
1. Run \`npx ace-pack@latest init\` in the repository root.
2. Copy the exported \`.ai/\` directory from \`${directoryName}/\` back to the repository root.
3. Review \`AGENTS.md\`, \`CLAUDE.md\`, and IDE bridge files in this export before copying them back, because the project may have changed after export.

No restore script is included intentionally. Plain files are easier to inspect,
search, commit, and restore manually.
`
}

async function main() {
  writeAceBanner()

  const rawArgs = process.argv.slice(2)
  const args = parseCliArgs(rawArgs)
  const rootArg = getArgValue(args, 'root')
  const positionalRoot = rawArgs.find((token) => !token.startsWith('--'))
  const rootDir = path.resolve(process.cwd(), rootArg ?? positionalRoot ?? '.')

  await runAceEject(rootDir, { stdout: process.stdout })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
