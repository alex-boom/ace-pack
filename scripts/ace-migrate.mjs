#!/usr/bin/env node
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  getArgValue,
  migrateMemorySchemaV2,
  parseCliArgs,
  writeAceBanner,
} from './ai-memory-utils.mjs'

export async function runAceMigration(rootDir, options = {}) {
  return migrateMemorySchemaV2(rootDir, options)
}

async function main() {
  writeAceBanner()

  const rawArgs = process.argv.slice(2)
  const args = parseCliArgs(rawArgs)
  const rootArg = getArgValue(args, 'root')
  const positionalRoot = rawArgs.find((token) => !token.startsWith('--'))
  const rootDir = path.resolve(process.cwd(), rootArg ?? positionalRoot ?? '.')
  const result = await runAceMigration(rootDir, {
    mirrorLegacy: args['mirror-legacy'] === 'true',
    pruneLegacy: args['prune-legacy'] === 'true',
  })

  if (
    result.createdFiles.length === 0 &&
    result.updatedFiles.length === 0 &&
    result.removedFiles.length === 0
  ) {
    process.stderr.write(`ACE memory schema v2 is already up to date in ${rootDir}\n`)
    return
  }

  if (result.createdFiles.length > 0) {
    process.stderr.write(`Created: ${result.createdFiles.join(', ')}\n`)
  }

  if (result.updatedFiles.length > 0) {
    process.stderr.write(`Updated: ${result.updatedFiles.join(', ')}\n`)
  }

  if (result.removedFiles.length > 0) {
    process.stderr.write(`Removed legacy aliases: ${result.removedFiles.join(', ')}\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
