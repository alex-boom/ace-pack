import path from 'node:path'

import { autoMigrateLegacyTaskState } from './ace-task-state.mjs'
import {
  countCheckboxes,
  buildStartSnapshot,
  extractChangedFileTitles,
  extractLabeledValue,
  extractMarkdownSection,
  extractTopDecision,
  extractUnresolvedReflections,
  formatStartSnapshot,
  formatTimestamp,
  getFreshnessStatus,
  readMemoryFile,
  readMemoryFileTimestamp,
  readTextIfExists,
  resolveStackSummary,
  summarizeVerification,
  writeMemoryFile,
} from './ai-memory-utils.mjs'

const rootDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()

await autoMigrateLegacyTaskState(rootDir, { stderr: process.stderr })

const [
  packageJsonContent,
  agentsContent,
  taskStateContent,
  decisionsContent,
  reflectionLogContent,
  projectProfileContent,
  taskStateTimestamp,
] = await Promise.all([
  readTextIfExists(path.join(rootDir, 'package.json')),
  readTextIfExists(path.join(rootDir, 'AGENTS.md')),
  readMemoryFile(rootDir, 'taskState'),
  readMemoryFile(rootDir, 'decisions'),
  readMemoryFile(rootDir, 'reflectionLog'),
  readMemoryFile(rootDir, 'projectProfile'),
  readMemoryFileTimestamp(rootDir, 'taskState'),
])

if (
  packageJsonContent === null ||
  agentsContent === null ||
  taskStateContent === null ||
  decisionsContent === null
) {
  throw new Error('Missing package, AGENTS.md, or required .ai/* files for ai:report:brief.')
}

const packageJson = JSON.parse(packageJsonContent)
const lifecycle = extractMarkdownSection(taskStateContent, 'Lifecycle')
const currentStatus = extractMarkdownSection(taskStateContent, 'Current Status')
const nextSteps = extractMarkdownSection(taskStateContent, 'Next Steps')
const knownIssues = extractMarkdownSection(taskStateContent, 'Known Issues')
const verification = summarizeVerification(extractMarkdownSection(taskStateContent, 'Verification'))
const generatedAt = new Date()
const stack = resolveStackSummary(agentsContent, projectProfileContent ?? '')
const checklist = countCheckboxes(
  extractMarkdownSection(taskStateContent, 'Completion Checklist'),
)
const changedAreas = extractChangedFileTitles(taskStateContent, 6)
const topDecision = extractTopDecision(decisionsContent)
const unresolvedReflections = extractUnresolvedReflections(reflectionLogContent ?? '', 5)
const freshness = getFreshnessStatus(generatedAt, taskStateTimestamp)
const currentTaskVersion = extractLabeledValue(lifecycle, 'Version') || 'unknown'
const currentTaskTier = extractLabeledValue(lifecycle, 'Task Tier') || 'unknown'
const startSnapshot = await buildStartSnapshot({
  currentTaskContent: taskStateContent,
  handoffContent: taskStateContent,
  rootDir,
})

const briefReport = `# AI Brief Report

Project: \`${packageJson.name}\`

## Report Metadata
- Generated: ${formatTimestamp(generatedAt)}
- Freshness: ${freshness}
- Current task version: ${currentTaskVersion}
- Current task tier: ${currentTaskTier}
- Source task-state: ${taskStateTimestamp ? formatTimestamp(taskStateTimestamp) : 'Unknown'}
- Verification level: ${verification.level}

## Start Snapshot
${formatStartSnapshot(startSnapshot)}

## Stack
${stack}

## Current Task
${extractMarkdownSection(taskStateContent, 'Feature Name')}

## Lifecycle
${lifecycle}

## Goal
${extractMarkdownSection(taskStateContent, 'Goal')}

## Business Value
${extractMarkdownSection(taskStateContent, 'Business Value / Product Alignment') || '- Not recorded.'}

## Current Status
${currentStatus}

## Next Steps
${nextSteps || '- No next steps recorded.'}

## Risks / Blockers
${knownIssues || '- No known issues recorded.'}

## Verification
${verification.checks.length > 0 ? verification.checks.map((item) => `- ${item}`).join('\n') : '- No verification recorded.'}

## Recent Decision
${topDecision || 'No durable decisions recorded yet.'}

## Unresolved Reflections
${unresolvedReflections.length > 0 ? unresolvedReflections.map((item) => `- ${item}`).join('\n') : '- No unresolved reflections recorded.'}

## Changed Areas
${changedAreas.length > 0 ? changedAreas.map((item) => `- \`${item}\``).join('\n') : '- No changed files recorded.'}

## Overall Progress
- Completion checklist: ${checklist.complete}/${checklist.total}
- Source of truth: \`.ai/state/task-state.md\` and \`.ai/*\` files remain authoritative.
`

const [outputPath] = await writeMemoryFile(rootDir, 'reportBrief', briefReport)
process.stderr.write(`Generated ${path.join(rootDir, outputPath)}\n`)
