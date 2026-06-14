import path from 'node:path'

import {
  AGENTS_WORKFLOW_END_MARKER,
  AGENTS_WORKFLOW_HEADER,
  AGENTS_WORKFLOW_MARKER,
  AI_FILE_SPECS,
  CLAUDE_REQUIRED_SNIPPETS,
  agentsWorkflowSection,
  claudeTemplate,
} from './agent-memory-templates.mjs'
import {
  migrateMemorySchemaV2,
  readMemoryFile,
  readTextIfExists,
  writeTextFile,
} from './ai-memory-utils.mjs'

export {
  AGENTS_WORKFLOW_END_MARKER,
  AGENTS_WORKFLOW_HEADER,
  AGENTS_WORKFLOW_MARKER,
  AI_FILE_SPECS,
  CLAUDE_REQUIRED_SNIPPETS,
}

async function ensureFile(filePath, content) {
  const existingContent = await readTextIfExists(filePath)

  if (existingContent !== null) {
    return false
  }

  await writeTextFile(filePath, content)
  return true
}

async function ensureAgentsWorkflow(filePath) {
  const currentContent = await readTextIfExists(filePath)

  if (currentContent === null) {
    throw new Error(`Missing AGENTS.md at ${filePath}`)
  }

  if (currentContent.includes(AGENTS_WORKFLOW_MARKER)) {
    const upgradedContent = replaceMarkedSection(currentContent, agentsWorkflowSection)

    if (upgradedContent !== currentContent) {
      await writeTextFile(filePath, upgradedContent)
      return true
    }

    return false
  }

  const nextContent = `${currentContent.trimEnd()}\n\n${agentsWorkflowSection}`
  await writeTextFile(filePath, nextContent)
  return true
}

function replaceMarkedSection(content, replacement) {
  const startIndex = content.indexOf(AGENTS_WORKFLOW_MARKER)
  const endIndex = content.indexOf(AGENTS_WORKFLOW_END_MARKER, startIndex)

  if (startIndex === -1 || endIndex === -1) {
    return content
  }

  const afterEndIndex = endIndex + AGENTS_WORKFLOW_END_MARKER.length
  const suffix = content.slice(afterEndIndex)
  const normalizedSuffix =
    replacement.endsWith('\n') && suffix.startsWith('\n') ? suffix.replace(/^\r?\n/, '') : suffix

  return `${content.slice(0, startIndex)}${replacement}${normalizedSuffix}`
}

export async function ensureAgentMemory(rootDir) {
  const createdFiles = []
  const updatedFiles = []
  const agentsPath = path.join(rootDir, 'AGENTS.md')
  const claudePath = path.join(rootDir, 'CLAUDE.md')

  if (await ensureAgentsWorkflow(agentsPath)) {
    updatedFiles.push('AGENTS.md')
  }

  if (await ensureFile(claudePath, claudeTemplate)) {
    createdFiles.push('CLAUDE.md')
  }

  for (const fileSpec of AI_FILE_SPECS) {
    const absolutePath = path.join(rootDir, fileSpec.path)

    if (await ensureFile(absolutePath, fileSpec.template)) {
      createdFiles.push(fileSpec.path)
    }
  }

  const migrationResult = await migrateMemorySchemaV2(rootDir)
  createdFiles.push(...migrationResult.createdFiles)
  updatedFiles.push(...migrationResult.updatedFiles)

  return {
    createdFiles,
    updatedFiles,
  }
}

export async function validateAgentMemory(rootDir) {
  const issues = []
  const agentsPath = path.join(rootDir, 'AGENTS.md')
  const claudePath = path.join(rootDir, 'CLAUDE.md')
  const agentsContent = await readTextIfExists(agentsPath)
  const claudeContent = await readTextIfExists(claudePath)

  if (agentsContent === null) {
    issues.push('Missing AGENTS.md')
  } else if (!agentsContent.includes(AGENTS_WORKFLOW_MARKER)) {
    issues.push(`AGENTS.md is missing the ${AGENTS_WORKFLOW_HEADER} section`)
  } else if (!agentsContent.includes(AGENTS_WORKFLOW_HEADER)) {
    issues.push(`AGENTS.md is missing the ${AGENTS_WORKFLOW_HEADER} section`)
  }

  if (claudeContent === null) {
    issues.push('Missing CLAUDE.md')
  } else {
    for (const snippet of CLAUDE_REQUIRED_SNIPPETS) {
      if (!claudeContent.includes(snippet)) {
        issues.push(`CLAUDE.md is missing required content: ${snippet}`)
      }
    }
  }

  for (const fileSpec of AI_FILE_SPECS) {
    const content = await readMemoryFile(rootDir, fileSpec.path)

    if (content === null) {
      issues.push(`Missing ${fileSpec.path}`)
      continue
    }

    for (const snippet of fileSpec.requiredSnippets) {
      if (!content.includes(snippet)) {
        issues.push(`${fileSpec.path} is missing required content: ${snippet}`)
      }
    }
  }

  return issues
}
