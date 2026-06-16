import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { IDE_BRIDGE_FILES, upsertAceIdeRulesBlock } from './ace-uninstall-utils.mjs'
import { ensureAgentMemory } from './agent-memory-lib.mjs'
import { readTextIfExists, writeAceBanner } from './ai-memory-utils.mjs'

const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()

writeAceBanner()

const result = await ensureAgentMemory(targetDir)
const ideResult = await ensureIdeRuleBridges(targetDir)

result.createdFiles.push(...ideResult.createdFiles)
result.updatedFiles.push(...ideResult.updatedFiles)

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

async function ensureIdeRuleBridges(rootDir) {
  const createdFiles = []
  const updatedFiles = []

  for (const relativePath of IDE_BRIDGE_FILES) {
    const filePath = path.join(rootDir, relativePath)
    const existingContent = await readTextIfExists(filePath)
    const nextResult = upsertAceIdeRulesBlock(relativePath, existingContent ?? '')

    if (existingContent !== null && !nextResult.changed) {
      continue
    }

    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, nextResult.content, 'utf8')

    if (existingContent === null) {
      createdFiles.push(relativePath)
    } else {
      updatedFiles.push(relativePath)
    }
  }

  return { createdFiles, updatedFiles }
}
