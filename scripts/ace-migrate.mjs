#!/usr/bin/env node
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { migrateMemorySchemaV2, writeAceBanner } from './ai-memory-utils.mjs'

export async function runAceMigration(rootDir) {
  return migrateMemorySchemaV2(rootDir)
}

async function main() {
  writeAceBanner()

  const rootDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()
  const result = await runAceMigration(rootDir)

  if (result.createdFiles.length === 0 && result.updatedFiles.length === 0) {
    process.stderr.write(`ACE memory schema v2 is already up to date in ${rootDir}\n`)
    return
  }

  if (result.createdFiles.length > 0) {
    process.stderr.write(`Created: ${result.createdFiles.join(', ')}\n`)
  }

  if (result.updatedFiles.length > 0) {
    process.stderr.write(`Updated: ${result.updatedFiles.join(', ')}\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
