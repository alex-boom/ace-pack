import path from 'node:path'

import { ensureAgentMemory } from './agent-memory-lib.mjs'
import { writeAceBanner } from './ai-memory-utils.mjs'

const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()

writeAceBanner()

const result = await ensureAgentMemory(targetDir)

if (result.createdFiles.length === 0 && result.updatedFiles.length === 0) {
  process.stderr.write(`ACE memory is already up to date in ${targetDir}\n`)
  process.exit(0)
}

if (result.updatedFiles.length > 0) {
  process.stderr.write(`Updated: ${result.updatedFiles.join(', ')}\n`)
}

if (result.createdFiles.length > 0) {
  process.stderr.write(`Created: ${result.createdFiles.join(', ')}\n`)
}
