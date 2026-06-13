#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { installAcePack, printInstallResult, resolveTargetDir } from './install-ace-pack.mjs'

export const installAgentMemoryPack = installAcePack

const currentFilePath = fileURLToPath(import.meta.url)
const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  const targetDir = resolveTargetDir(process.argv.slice(2))
  const result = await installAcePack(targetDir)
  printInstallResult(result)
}
