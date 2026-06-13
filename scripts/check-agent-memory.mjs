import path from 'node:path'

import { validateAgentMemory } from './agent-memory-lib.mjs'
import { writeAceBanner } from './ai-memory-utils.mjs'

const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()

writeAceBanner()

const issues = await validateAgentMemory(targetDir)

if (issues.length > 0) {
  process.stderr.write(`ACE memory check failed for ${targetDir}\n`)

  for (const issue of issues) {
    process.stderr.write(`- ${issue}\n`)
  }

  process.exit(1)
}

process.stderr.write(`ACE memory check passed for ${targetDir}\n`)
