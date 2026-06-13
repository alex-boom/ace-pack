import path from 'node:path'

import {
  countCheckboxes,
  extractChangedFileTitles,
  extractLabeledValue,
  extractMarkdownSection,
  extractTopDecision,
  extractUnresolvedReflections,
  formatTimestamp,
  getFreshnessStatus,
  normalizeStackText,
  readFileTimestamp,
  readTextIfExists,
  summarizeVerification,
  writeTextFile,
} from './ai-memory-utils.mjs'

const rootDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()
const aiDir = path.join(rootDir, '.ai')
const currentTaskPath = path.join(aiDir, 'current-task.md')
const handoffPath = path.join(aiDir, 'session-handoff.md')

const [
  packageJsonContent,
  agentsContent,
  currentTaskContent,
  handoffContent,
  decisionsContent,
  changedFilesContent,
  reflectionLogContent,
  currentTaskTimestamp,
  handoffTimestamp,
] = await Promise.all([
  readTextIfExists(path.join(rootDir, 'package.json')),
  readTextIfExists(path.join(rootDir, 'AGENTS.md')),
  readTextIfExists(currentTaskPath),
  readTextIfExists(handoffPath),
  readTextIfExists(path.join(aiDir, 'decisions.md')),
  readTextIfExists(path.join(aiDir, 'changed-files.md')),
  readTextIfExists(path.join(aiDir, 'reflection-log.md')),
  readFileTimestamp(currentTaskPath),
  readFileTimestamp(handoffPath),
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
const stack = normalizeStackText(extractMarkdownSection(agentsContent, 'Stack (non-negotiable)'))
const checklist = countCheckboxes(
  extractMarkdownSection(currentTaskContent, 'Completion Checklist'),
)
const changedAreas = extractChangedFileTitles(changedFilesContent, 6)
const topDecision = extractTopDecision(decisionsContent)
const unresolvedReflections = extractUnresolvedReflections(reflectionLogContent ?? '', 5)
const freshness = getFreshnessStatus(generatedAt, currentTaskTimestamp, handoffTimestamp)
const currentTaskVersion = extractLabeledValue(lifecycle, 'Version') || 'unknown'
const currentTaskTier = extractLabeledValue(lifecycle, 'Task Tier') || 'unknown'

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

const outputPath = path.join(aiDir, 'report-brief.md')
await writeTextFile(outputPath, briefReport)
process.stderr.write(`Generated ${outputPath}\n`)
