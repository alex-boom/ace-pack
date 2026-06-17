import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { classifyRepositoryTask } from './ai-task-classify.mjs'
import { extractMarkdownSection, readMemoryFile } from './ai-memory-utils.mjs'

const execFileAsync = promisify(execFile)
const MAX_UNTRACKED_FILE_BYTES = 200 * 1024
const MAX_UNTRACKED_TOTAL_BYTES = 1024 * 1024
export const REVIEW_SYSTEM_INSTRUCTION =
  'You are an expert strict code reviewer. Evaluate the following diff against the Business Value, Acceptance Criteria, and Project Conventions.'

export async function buildReviewPayload(rootDir, {
  generatedAt,
  mode,
  taskAutonomy,
}) {
  const [
    taskStateContent,
    memoryConfigContent,
    projectConventionsContent,
    classification,
    gitStatus,
    gitDiff,
  ] = await Promise.all([
    readMemoryFile(rootDir, 'taskState'),
    readMemoryFile(rootDir, 'memoryConfig'),
    readMemoryFile(rootDir, 'projectConventions'),
    classifyRepositoryTask(rootDir),
    readGitOutput(rootDir, ['status', '--short', '-uall'], 'clean'),
    collectGitDiff(rootDir),
  ])

  if (taskStateContent === null) {
    throw new Error('Missing required context file: .ai/state/task-state.md')
  }

  const missingOptionalFiles = []
  const includedFiles = ['.ai/state/task-state.md']
  if (memoryConfigContent !== null) {
    includedFiles.push('.ai/config/memory-config.json')
  }
  if (projectConventionsContent === null) {
    missingOptionalFiles.push('.ai/knowledge/project-conventions.md')
  } else {
    includedFiles.push('.ai/knowledge/project-conventions.md')
  }

  return {
    gitSummary: null,
    includedFiles,
    missingOptionalFiles,
    payload: formatReviewPayload({
      classification,
      generatedAt,
      gitDiff,
      gitStatus,
      mode,
      projectConventionsContent,
      taskAutonomy,
      taskStateContent,
    }),
  }
}

function formatReviewPayload({
  classification,
  generatedAt,
  gitDiff,
  gitStatus,
  mode,
  projectConventionsContent,
  taskAutonomy,
  taskStateContent,
}) {
  return `# ACE Agentic Evaluation Context
- Mode: ${mode.id} (${mode.label})
- Current Phase: ${taskAutonomy.currentPhase}
- Next Autonomous Action: ${taskAutonomy.nextAutonomousAction}
- Generated: ${generatedAt}

## System Instruction
${REVIEW_SYSTEM_INSTRUCTION}

## Reviewer Task
- Decide whether the diff satisfies the original intent and acceptance criteria.
- Flag missing behavior, scope drift, risky changes, security concerns, and convention violations.
- If the review fails, state the exact fixes required before implementation continues.
- If the review passes, state that the project mechanical gate should run next.

## Original Intent

### Goal
${sectionOrFallback(taskStateContent, 'Goal')}

### Acceptance Criteria
${sectionOrFallback(taskStateContent, 'Acceptance Criteria')}

### Business Value & Approach
${sectionOrFallback(taskStateContent, 'Business Value & Approach')}

## Governance

### Project Conventions
${projectConventionsContent?.trim() || '- Project conventions file not found.'}

### Triggered High-Risk Rules
${formatRiskMatches(classification)}

## Current State

### Git Status
\`\`\`text
${gitStatus.trim() || 'clean'}
\`\`\`

### Git Diff
\`\`\`diff
${gitDiff.trim() || 'No git diff against HEAD.'}
\`\`\`
`
}

function sectionOrFallback(content, heading) {
  return extractMarkdownSection(content, heading) || '- Not recorded.'
}

function formatRiskMatches(classification) {
  if (classification.gitError) {
    return `- Unable to inspect git diff: ${classification.gitError}`
  }
  if (classification.riskMatches.length === 0) {
    return '- No high-risk rules triggered by current diff.'
  }
  return classification.riskMatches.map((match) => {
    const matched = match.matched.length > 0 ? match.matched.join(', ') : 'diff content'
    return `- ${match.label} (${match.kind}: \`${match.pattern}\`, tier: ${match.tier}, requires design review: ${match.requiresDesignReview ? 'yes' : 'no'}; matched: ${matched})`
  }).join('\n')
}

async function readGitOutput(rootDir, args, emptyFallback) {
  try {
    const result = await execFileAsync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })
    return result.stdout.trim() || emptyFallback
  } catch (error) {
    return `Git ${args[0]} unavailable: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function collectGitDiff(rootDir) {
  const [trackedDiff, untrackedFiles] = await Promise.all([
    readGitOutput(rootDir, ['diff', 'HEAD', '--'], ''),
    listUntrackedFiles(rootDir),
  ])
  const untrackedDiff = await formatUntrackedFilesDiff(rootDir, untrackedFiles)

  return [trackedDiff.trim(), untrackedDiff.trim()]
    .filter(Boolean)
    .join('\n\n') || 'No git diff against HEAD.'
}

async function listUntrackedFiles(rootDir) {
  const output = await readGitOutput(rootDir, ['ls-files', '--others', '--exclude-standard', '-z'], '')
  if (output.startsWith('Git ls-files unavailable:')) {
    return []
  }

  return output
    .split('\0')
    .map((filePath) => filePath.trim())
    .filter(Boolean)
    .sort()
}

async function formatUntrackedFilesDiff(rootDir, files) {
  const chunks = []
  let totalBytes = 0

  for (const filePath of files) {
    const resolvedPath = resolveRepoPath(rootDir, filePath)
    if (resolvedPath === null) {
      continue
    }

    const buffer = await readFile(resolvedPath)
    if (buffer.includes(0)) {
      chunks.push(formatOmittedUntrackedFileDiff(filePath, 'binary file'))
      continue
    }
    if (buffer.byteLength > MAX_UNTRACKED_FILE_BYTES) {
      chunks.push(formatOmittedUntrackedFileDiff(filePath, 'file exceeds 200 KiB'))
      continue
    }
    if (totalBytes + buffer.byteLength > MAX_UNTRACKED_TOTAL_BYTES) {
      chunks.push(formatOmittedUntrackedFileDiff(filePath, 'untracked diff budget exceeded'))
      continue
    }

    totalBytes += buffer.byteLength
    chunks.push(formatUntrackedFileDiff(filePath, buffer.toString('utf8')))
  }

  return chunks.join('\n')
}

function resolveRepoPath(rootDir, filePath) {
  const resolvedRoot = path.resolve(rootDir)
  const resolvedPath = path.resolve(resolvedRoot, filePath)
  const relativePath = path.relative(resolvedRoot, resolvedPath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null
  }

  return resolvedPath
}

function formatUntrackedFileDiff(filePath, content) {
  const lines = content.replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').split('\n')
  if (lines.at(-1) === '') {
    lines.pop()
  }
  const addedLines = lines.length > 0 ? lines.map((line) => `+${line}`).join('\n') : '+'

  return `diff --git a/${filePath} b/${filePath}
new file mode 100644
--- /dev/null
+++ b/${filePath}
@@
${addedLines}`
}

function formatOmittedUntrackedFileDiff(filePath, reason) {
  return `diff --git a/${filePath} b/${filePath}
new file mode 100644
--- /dev/null
+++ b/${filePath}
@@
+<untracked file omitted: ${reason}>`
}
