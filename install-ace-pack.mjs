#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { runInstallCli } from './scripts/ace-install-lib.mjs'

export {
  detectPackageManager,
  formatScriptCommand,
  getHelpText,
  installAcePack,
  parseInstallArgs,
  printInstallResult,
  resolveTargetDir,
  runInstallCli,
} from './scripts/ace-install-lib.mjs'

const currentFilePath = fileURLToPath(import.meta.url)
const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  await runInstallCli(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n\nRun ace-pack --help for usage.\n`)
    process.exit(1)
  })
}
