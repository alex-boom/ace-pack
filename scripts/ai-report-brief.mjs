import path from 'node:path'

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

const [
  packageJsonContent,
  agentsContent,
  currentTaskContent,
  handoffContent,
  decisionsContent,
  changedFilesContent,
  reflectionLogContent,
  projectProfileContent,
  currentTaskTimestamp,
  handoffTimestamp,
] = await Promise.all([
  readTextIfExists(path.join(rootDir, 'package.json')),
  readTextIfExists(path.join(rootDir, 'AGENTS.md')),
  readMemoryFile(rootDir, 'currentTask'),
  readMemoryFile(rootDir, 'sessionHandoff'),
  readMemoryFile(rootDir, 'decisions'),
  readMemoryFile(rootDir, 'changedFiles'),
  readMemoryFile(rootDir, 'reflectionLog'),
  readMemoryFile(rootDir, 'projectProfile'),
  readMemoryFileTimestamp(rootDir, 'currentTask'),
  readMemoryFileTimestamp(rootDir, 'sessionHandoff'),
])

if (
  packageJsonContent === null ||
  agentsContent === null ||
  currentTaskContent === null ||
  handoffContent === null ||
  decisionsContent === null ||
  changedFilesContent === null
) {
  throw new Error('Missing package, AGENTS.md, or required .ai/* files for ai:report:brief.')
}

const packageJson = JSON.parse(packageJsonContent)
const lifecycle = extractMarkdownSection(currentTaskContent, 'Lifecycle')
const currentStatus = extractMarkdownSection(currentTaskContent, 'Current Status')
const nextSteps = extractMarkdownSection(handoffContent, 'Next Steps')
const knownIssues = extractMarkdownSection(handoffContent, 'Known Issues')
const verification = summarizeVerification(extractMarkdownSection(handoffContent, 'Verification'))
const generatedAt = new Date()
const stack = resolveStackSummary(agentsContent, projectProfileContent ?? '')
const checklist = countCheckboxes(
  extractMarkdownSection(currentTaskContent, 'Completion Checklist'),
)
const changedAreas = extractChangedFileTitles(changedFilesContent, 6)
const topDecision = extractTopDecision(decisionsContent)
const unresolvedReflections = extractUnresolvedReflections(reflectionLogContent ?? '', 5)
const freshness = getFreshnessStatus(generatedAt, currentTaskTimestamp, handoffTimestamp)
const currentTaskVersion = extractLabeledValue(lifecycle, 'Version') || 'unknown'
const currentTaskTier = extractLabeledValue(lifecycle, 'Task Tier') || 'unknown'
const startSnapshot = await buildStartSnapshot({
  currentTaskContent,
  handoffContent,
  rootDir,
})

const briefReport = `# AI Brief Report

Project: \`${packageJson.name}\`

## Report Metadata
- Generated: ${formatTimestamp(generatedAt)}
- Freshness: ${freshness}
- Current task version: ${currentTaskVersion}
- Current task tier: ${currentTaskTier}
- Source current-task: ${currentTaskTimestamp ? formatTimestamp(currentTaskTimestamp) : 'Unknown'}
- Source session-handoff: ${handoffTimestamp ? formatTimestamp(handoffTimestamp) : 'Unknown'}
- Verification level: ${verification.level}

## Start Snapshot
${formatStartSnapshot(startSnapshot)}

## Stack
${stack}

## Current Task
${extractMarkdownSection(currentTaskContent, 'Feature Name')}

## Lifecycle
${lifecycle}

## Goal
${extractMarkdownSection(currentTaskContent, 'Goal')}

## Business Value
${extractMarkdownSection(currentTaskContent, 'Business Value / Product Alignment') || '- Not recorded.'}

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
- Source of truth: \`.ai/*\` files remain authoritative.
`

const [outputPath] = await writeMemoryFile(rootDir, 'reportBrief', briefReport)
process.stderr.write(`Generated ${path.join(rootDir, outputPath)}\n`)
