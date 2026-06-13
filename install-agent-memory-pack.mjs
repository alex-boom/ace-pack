#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { installAcePack, runInstallCli } from './install-ace-pack.mjs'

export const installAgentMemoryPack = installAcePack

const currentFilePath = fileURLToPath(import.meta.url)
const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  await runInstallCli(process.argv.slice(2), { commandName: 'agent-memory-pack' }).catch(
    (error) => {
      const message = error instanceof Error ? error.message : String(error)
      process.stderr.write(`${message}\n\nRun agent-memory-pack --help for usage.\n`)
      process.exit(1)
    },
  )
}
