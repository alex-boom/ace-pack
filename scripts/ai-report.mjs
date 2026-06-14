import { spawn } from 'node:child_process'
import path from 'node:path'

import {
  buildStartSnapshot,
  countCheckboxes,
  extractChangedFileTitles,
  extractLabeledValue,
  extractMarkdownSection,
  extractTopDecision,
  extractUnresolvedReflections,
  formatStartSnapshot,
  formatTimestamp,
  getFreshnessStatus,
  getMemoryPath,
  readMemoryFile,
  readMemoryFileTimestamp,
  readTextIfExists,
  resolveStackSummary,
  summarizeVerification,
  writeMemoryFile,
} from './ai-memory-utils.mjs'

const rootDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()
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
  readMemoryFile(rootDir, 'workLog'),
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
const stack = resolveStackSummary(agentsContent, projectProfileContent ?? '')
const startSnapshot = await buildStartSnapshot({
  currentTaskContent,
  handoffContent,
  rootDir,
})
let xmlReportStatus = '- XML bundle skipped because `AI_REPORT_SKIP_XML=1`.'

if (!shouldSkipXml) {
  try {
    await runRepomix(rootDir)
    xmlReportStatus = '- XML bundle generated at `.ai/generated/report-full.xml` for parsable handoff.'
  } catch (error) {
    xmlReportStatus = `- XML bundle not generated: ${formatErrorMessage(error)}`
    process.stderr.write(`Skipped XML report: ${formatErrorMessage(error)}\n`)
  }
}

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

## Start Snapshot
${formatStartSnapshot(startSnapshot)}

## Stack
${stack}

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
${xmlReportStatus}
`

const [fullReportPath] = await writeMemoryFile(rootDir, 'reportFull', fullReport)
process.stderr.write(`Generated ${path.join(rootDir, fullReportPath)}\n`)

if (!shouldSkipXml && xmlReportStatus.includes('generated at')) {
  process.stderr.write(`Generated ${path.join(rootDir, getMemoryPath('reportFullXml'))}\n`)
}

async function runRepomix(cwd) {
  const command =
    process.platform === 'win32'
      ? 'pnpm.cmd dlx repomix --include ".ai/state/current-task.md,.ai/state/session-handoff.md,.ai/knowledge/work-log.md,.ai/state/changed-files.md,.ai/knowledge/decisions.md,.ai/knowledge/reflection-log.md,.ai/config/memory-config.json,AGENTS.md" --output .ai/generated/report-full.xml --style xml --parsable-style --no-default-patterns'
      : 'pnpm dlx repomix --include ".ai/state/current-task.md,.ai/state/session-handoff.md,.ai/knowledge/work-log.md,.ai/state/changed-files.md,.ai/knowledge/decisions.md,.ai/knowledge/reflection-log.md,.ai/config/memory-config.json,AGENTS.md" --output .ai/generated/report-full.xml --style xml --parsable-style --no-default-patterns'

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

  const xmlContent = await readTextIfExists(path.join(cwd, getMemoryPath('reportFullXml')))

  if (xmlContent !== null) {
    await writeMemoryFile(cwd, 'reportFullXml', xmlContent)
  }
}

function formatErrorMessage(error) {
  return error instanceof Error ? error.message.replace(/\s+/g, ' ').trim() : String(error)
}
