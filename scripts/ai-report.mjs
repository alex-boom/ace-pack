import { spawn } from 'node:child_process'
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
const fullReportPath = path.join(aiDir, 'report-full.md')
const xmlReportPath = path.join(aiDir, 'report-full.xml')
const currentTaskPath = path.join(aiDir, 'current-task.md')
const handoffPath = path.join(aiDir, 'session-handoff.md')
const shouldSkipXml = process.env.AI_REPORT_SKIP_XML === '1'

const [
  packageJsonContent,
  agentsContent,
  currentTaskContent,
  handoffContent,
  decisionsContent,
  changedFilesContent,
  workLogContent,
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
  readTextIfExists(path.join(aiDir, 'work-log.md')),
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
  changedFilesContent === null ||
  workLogContent === null
) {
  throw new Error('Missing package, AGENTS.md, or required .ai/* files for ai:report.')
}

const packageJson = JSON.parse(packageJsonContent)
const lifecycle = extractMarkdownSection(currentTaskContent, 'Lifecycle')
const generatedAt = new Date()
const checklist = countCheckboxes(
  extractMarkdownSection(currentTaskContent, 'Completion Checklist'),
)
const changedAreas = extractChangedFileTitles(changedFilesContent, 8)
const verification = summarizeVerification(
  extractMarkdownSection(handoffContent, 'Verification'),
  6,
)
const freshness = getFreshnessStatus(generatedAt, currentTaskTimestamp, handoffTimestamp)
const currentTaskVersion = extractLabeledValue(lifecycle, 'Version') || 'unknown'
const currentTaskTier = extractLabeledValue(lifecycle, 'Task Tier') || 'unknown'
const unresolvedReflections = extractUnresolvedReflections(reflectionLogContent ?? '', 5)
const fullReport = `# AI Full Report

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
${normalizeStackText(extractMarkdownSection(agentsContent, 'Stack (non-negotiable)'))}

## Architecture Rules
${extractMarkdownSection(agentsContent, 'Architecture rules').trim()}

## Current Task
${extractMarkdownSection(currentTaskContent, 'Feature Name')}

## Lifecycle
${lifecycle}

## Goal
${extractMarkdownSection(currentTaskContent, 'Goal')}

## Business Value
${extractMarkdownSection(currentTaskContent, 'Business Value / Product Alignment') || '- Not recorded.'}

## Technical Approach
${extractMarkdownSection(currentTaskContent, 'Technical Approach') || '- Not recorded.'}

## Current Status
${extractMarkdownSection(currentTaskContent, 'Current Status')}

## What Was Done
${extractMarkdownSection(handoffContent, 'What Was Done')}

## Current State
${extractMarkdownSection(handoffContent, 'Current State')}

## Next Steps
${extractMarkdownSection(handoffContent, 'Next Steps')}

## Known Issues
${extractMarkdownSection(handoffContent, 'Known Issues')}

## Quality Review
${extractMarkdownSection(handoffContent, 'Quality Review') || '- Not recorded.'}

## Verification
${verification.checks.length > 0 ? verification.checks.map((item) => `- ${item}`).join('\n') : '- No verification recorded.'}

## Recent Decisions
${extractTopDecision(decisionsContent) || 'No durable decisions recorded yet.'}

## Changed Areas
${changedAreas.length > 0 ? changedAreas.map((item) => `- \`${item}\``).join('\n') : '- No changed files recorded.'}

## Latest Work Log
${workLogContent.trim()}

## Unresolved Reflections
${unresolvedReflections.length > 0 ? unresolvedReflections.map((item) => `- ${item}`).join('\n') : '- No unresolved reflections recorded.'}

## Overall Progress
- Completion checklist: ${checklist.complete}/${checklist.total}
- Canonical context lives in \`.ai/*\`.
- XML bundle generated at \`.ai/report-full.xml\` for parsable handoff.
`

await writeTextFile(fullReportPath, fullReport)
if (!shouldSkipXml) {
  await runRepomix(rootDir)
}
process.stderr.write(`Generated ${fullReportPath}\n`)

if (!shouldSkipXml) {
  process.stderr.write(`Generated ${xmlReportPath}\n`)
}

async function runRepomix(cwd) {
  const command =
    process.platform === 'win32'
      ? 'pnpm.cmd dlx repomix --include ".ai/current-task.md,.ai/session-handoff.md,.ai/work-log.md,.ai/changed-files.md,.ai/decisions.md,.ai/reflection-log.md,.ai/memory-config.json,AGENTS.md" --output .ai/report-full.xml --style xml --parsable-style --no-default-patterns'
      : 'pnpm dlx repomix --include ".ai/current-task.md,.ai/session-handoff.md,.ai/work-log.md,.ai/changed-files.md,.ai/decisions.md,.ai/reflection-log.md,.ai/memory-config.json,AGENTS.md" --output .ai/report-full.xml --style xml --parsable-style --no-default-patterns'

  await new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      cwd,
      shell: true,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`repomix exited with code ${code ?? 'unknown'}`))
    })
  })
}
