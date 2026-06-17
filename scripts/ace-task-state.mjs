import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  extractMarkdownSection,
  formatTimestamp,
  getMemoryPathCandidates,
  hasMeaningfulContent,
  normalizeRelativePath,
  readFileTimestamp,
  readTextIfExists,
  writeTextFile,
} from './ai-memory-utils.mjs'
import {
  COMPLETED_NEXT_AUTONOMOUS_ACTION,
  DEFAULT_CURRENT_PHASE,
  DEFAULT_NEXT_AUTONOMOUS_ACTION,
  ensureAutonomyLifecycleFields,
} from './ace-task-autonomy.mjs'
export const LEGACY_TASK_STATE_PATHS = {
  changedFiles: ['.ai/state/changed-files.md', '.ai/changed-files.md'],
  currentTask: ['.ai/state/current-task.md', '.ai/current-task.md'],
  sessionHandoff: ['.ai/state/session-handoff.md', '.ai/session-handoff.md'],
}
const DEFAULT_LIFECYCLE = `Status: active
Version: v1
Task Tier: standard
Design Review Required: no
Current Phase: ${DEFAULT_CURRENT_PHASE}
Next Autonomous Action: ${DEFAULT_NEXT_AUTONOMOUS_ACTION}
Started: [YYYY-MM-DD HH:mm]
Ready For Archive: no`
const DEFAULT_QUALITY_REVIEW = `Product Alignment:
- [Confirm the work still serves the stated business value]
Architecture:
- [Note the pattern used and why it fits the repo]
Security:
- [Note relevant auth, RBAC, tenancy, token, or data exposure risks]
Code Quality:
- [Note file size, duplication, strict typing, and test coverage risks]`
export const DEFAULT_RED_TEAMING_PROMPT =
  'Identify at least two potential failure modes, edge cases, or security risks in the chosen approach, and how to mitigate them.'
export const taskStateTemplate = `# Task State
## Lifecycle & Meta
### Feature Name
[Set the active feature or task name]
### Lifecycle
${DEFAULT_LIFECYCLE}
### Goal
[Describe what is being built or changed]
### Current Status
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
### Affected Areas
- [List the apps, packages, or files in scope]
### Constraints
- [List must-not-break rules or important boundaries]
### Acceptance Criteria
- [Describe the expected final behavior]
### Completion Checklist
- [ ] Goal completed
- [ ] Always: summarize what changed in this task state
- [ ] Always: update changed files, record verification, and run project-owned \`ace:validate\`
- [ ] Always: state publish/deploy decision when relevant, including deferred release wording
- [ ] If small/low-risk: let \`ace finish\` auto-close compact handoff when manual notes add no value
- [ ] If standard/large: add product, architecture, security, and code-quality review notes
- [ ] If large/high-risk: confirm design approach, add useful reflection, and let \`ace finish\` archive the snapshot
- [ ] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [ ] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [ ] \`ace finish\` passed and generated reports
## Business Value & Approach
### Business Value / Product Alignment
[Explain in 1-2 sentences why this matters to users or the business]
### Technical Approach
Option 1:
- [Describe one viable approach and tradeoffs]
Option 2:
- [Describe another viable approach and tradeoffs]
Chosen Approach:
- [Explain why the selected approach best fits security, flexibility, architecture, and business value]
### Edge Cases & Red Teaming
${DEFAULT_RED_TEAMING_PROMPT}
## Changed Files / Diff
[path/to/file]
- [Short reason for the change]
## Handoff & Next Steps
### Last Update
[YYYY-MM-DD HH:mm]
### What Was Done
- [Summarize the latest completed work]
### Current State
- [Describe the current project or feature state]
### Quality Review
${DEFAULT_QUALITY_REVIEW}
### Next Steps
- [List the next concrete steps]
### Known Issues
- [List known gaps, risks, or blockers]
### Verification
- [List checks that passed or could not be run]
### Notes
- [Add publish/deploy decision when relevant. If batching releases, use "NPM publish: required before final release; deferred by maintainer."]
`
export function buildCompletedTaskState({
  changedSummary = 'No working-tree changes detected.',
  taskTitle = 'No active task',
  timestamp = formatTimestamp(new Date()),
  verificationLine = 'No explicit verification was recorded for this small low-risk auto-closeout.',
} = {}) {
  return `# Task State
## Lifecycle & Meta
### Feature Name
${taskTitle}
### Lifecycle
Status: complete
Version: v1
Task Tier: small
Design Review Required: no
Current Phase: Complete
Next Autonomous Action: ${COMPLETED_NEXT_AUTONOMOUS_ACTION}
Started: ${timestamp}
Ready For Archive: yes
### Goal
ACE auto-closed a small low-risk task.
### Current Status
- [x] Small task auto-closeout completed.
### Affected Areas
- ${changedSummary}
### Constraints
- Preserve compact task state for the next session.
### Acceptance Criteria
- ACE task state is ready for the next task.
### Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded or explicitly noted
- [x] Publish/deploy decision recorded
## Business Value & Approach
### Business Value / Product Alignment
Small low-risk task completed with zero-ceremony ACE closeout.
### Technical Approach
Option 1:
- Require manual handoff notes for every small task.
Option 2:
- Let ACE write compact deterministic closeout notes.
Chosen Approach:
- Use deterministic closeout because the task was classified as small and low risk.
### Edge Cases & Red Teaming
Small low-risk closeout only; no additional adversarial planning was required.
## Changed Files / Diff
[Small task diff]
- ${changedSummary}
## Handoff & Next Steps
### Last Update
${timestamp}
### What Was Done
- ACE auto-closed a small low-risk task: ${taskTitle}.
### Current State
- Task state is complete and ready for the next task.
### Quality Review
Product Alignment:
- Small task closeout preserved project memory without extra ceremony.
Architecture:
- ACE used local git state and Markdown memory only.
Security:
- No secrets, network calls, or external services were used.
Code Quality:
- The closeout is compact and generated from deterministic local inputs.
### Next Steps
- Start the next task when ready.
### Known Issues
- None recorded for this small closeout.
### Verification
- ${verificationLine}
### Notes
- NPM publish: not required for this small low-risk closeout unless repository release policy says otherwise.
`
}
export async function autoMigrateLegacyTaskState(rootDir, options = {}) {
  const taskState = await readNewestTaskState(rootDir)
  const legacyFiles = await listLegacyTaskStateFiles(rootDir)
  if (legacyFiles.length === 0) {
    return { migrated: false, preservedLegacy: false }
  }
  if (taskState && hasMeaningfulContent(taskState.content)) {
    options.stderr?.write(
      '[ACE] Legacy task memory files remain beside task-state.md; review and prune them when ready.\n',
    )
    return { migrated: false, preservedLegacy: true }
  }
  const [currentTask, sessionHandoff, changedFiles] = await Promise.all([
    readNewestLegacyContent(rootDir, LEGACY_TASK_STATE_PATHS.currentTask),
    readNewestLegacyContent(rootDir, LEGACY_TASK_STATE_PATHS.sessionHandoff),
    readNewestLegacyContent(rootDir, LEGACY_TASK_STATE_PATHS.changedFiles),
  ])
  const backupDir = path.join(
    rootDir,
    '.ai',
    'archive',
    'migrations',
    `v3-task-state-${formatMigrationTimestamp(new Date())}`,
  )
  await backupLegacyFiles(rootDir, backupDir, legacyFiles)
  await writeTextFile(path.join(rootDir, '.ai/state/task-state.md'), mergeLegacyTaskState({
    changedFilesContent: changedFiles?.content ?? '',
    currentTaskContent: currentTask?.content ?? '',
    sessionHandoffContent: sessionHandoff?.content ?? '',
  }))
  for (const relativePath of legacyFiles) {
    await rm(path.join(rootDir, relativePath), { force: true })
  }
  options.stderr?.write('[ACE] Seamlessly auto-migrated legacy memory files to v3 task-state.md\n')
  return {
    backupDir: normalizeRelativePath(path.relative(rootDir, backupDir)),
    migrated: true,
    removedFiles: legacyFiles,
  }
}
export function extractTaskTitle(taskStateContent) {
  const title = extractMarkdownSection(taskStateContent, 'Feature Name')
  const goal = extractMarkdownSection(taskStateContent, 'Goal')
  return firstMeaningfulLine(title) || firstMeaningfulLine(goal) || 'Small ACE task'
}
function mergeLegacyTaskState({
  changedFilesContent,
  currentTaskContent,
  sessionHandoffContent,
}) {
  return `# Task State
## Lifecycle & Meta
### Feature Name
${sectionOrFallback(currentTaskContent, 'Feature Name', '[Set the active feature or task name]')}
### Lifecycle
${ensureAutonomyLifecycleFields(sectionOrFallback(currentTaskContent, 'Lifecycle', DEFAULT_LIFECYCLE))}
### Goal
${sectionOrFallback(currentTaskContent, 'Goal', '[Describe what is being built or changed]')}
### Current Status
${sectionOrFallback(currentTaskContent, 'Current Status', '- [ ] Step 1')}
### Affected Areas
${sectionOrFallback(currentTaskContent, 'Affected Areas', '- [List the apps, packages, or files in scope]')}
### Constraints
${sectionOrFallback(currentTaskContent, 'Constraints', '- [List must-not-break rules or important boundaries]')}
### Acceptance Criteria
${sectionOrFallback(currentTaskContent, 'Acceptance Criteria', '- [Describe the expected final behavior]')}
### Completion Checklist
${sectionOrFallback(currentTaskContent, 'Completion Checklist', '- [ ] Goal completed')}
## Business Value & Approach
### Business Value / Product Alignment
${sectionOrFallback(currentTaskContent, 'Business Value / Product Alignment', '[Explain in 1-2 sentences why this matters to users or the business]')}
### Technical Approach
${sectionOrFallback(currentTaskContent, 'Technical Approach', 'Option 1:\n- [Describe one viable approach and tradeoffs]\n\nOption 2:\n- [Describe another viable approach and tradeoffs]\n\nChosen Approach:\n- [Explain why the selected approach best fits security, flexibility, architecture, and business value]')}
### Edge Cases & Red Teaming
${sectionOrFallback(currentTaskContent, 'Edge Cases & Red Teaming', DEFAULT_RED_TEAMING_PROMPT)}
## Changed Files / Diff
${normalizeChangedFiles(changedFilesContent)}
## Handoff & Next Steps
### Last Update
${sectionOrFallback(sessionHandoffContent, 'Last Update', '[YYYY-MM-DD HH:mm]')}
### What Was Done
${sectionOrFallback(sessionHandoffContent, 'What Was Done', '- [Summarize the latest completed work]')}
### Current State
${sectionOrFallback(sessionHandoffContent, 'Current State', '- [Describe the current project or feature state]')}
### Quality Review
${sectionOrFallback(sessionHandoffContent, 'Quality Review', DEFAULT_QUALITY_REVIEW)}
### Next Steps
${sectionOrFallback(sessionHandoffContent, 'Next Steps', '- [List the next concrete steps]')}
### Known Issues
${sectionOrFallback(sessionHandoffContent, 'Known Issues', '- [List known gaps, risks, or blockers]')}
### Verification
${sectionOrFallback(sessionHandoffContent, 'Verification', '- [List checks that passed or could not be run]')}
### Notes
${sectionOrFallback(sessionHandoffContent, 'Notes', '- [Add publish/deploy decision when relevant.]')}
`
}
async function listLegacyTaskStateFiles(rootDir) {
  const files = []
  for (const paths of Object.values(LEGACY_TASK_STATE_PATHS)) {
    for (const relativePath of paths) {
      if ((await readTextIfExists(path.join(rootDir, relativePath))) !== null) {
        files.push(relativePath)
      }
    }
  }
  return [...new Set(files)]
}
async function readNewestLegacyContent(rootDir, paths) {
  const candidates = []
  for (const relativePath of paths) {
    const absolutePath = path.join(rootDir, relativePath)
    const [content, timestamp] = await Promise.all([
      readTextIfExists(absolutePath),
      readFileTimestamp(absolutePath),
    ])
    if (content !== null) {
      candidates.push({ content, timestamp })
    }
  }
  return candidates.sort((left, right) => {
    return (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0)
  }).at(0) ?? null
}
async function readNewestTaskState(rootDir) {
  const candidates = []
  for (const relativePath of getMemoryPathCandidates('taskState')) {
    const absolutePath = path.join(rootDir, relativePath)
    const [content, timestamp] = await Promise.all([
      readTextIfExists(absolutePath),
      readFileTimestamp(absolutePath),
    ])
    if (content !== null) {
      candidates.push({ content, timestamp })
    }
  }
  return candidates.sort((left, right) => {
    return (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0)
  }).at(0) ?? null
}
async function backupLegacyFiles(rootDir, backupDir, legacyFiles) {
  for (const relativePath of legacyFiles) {
    const content = await readTextIfExists(path.join(rootDir, relativePath))
    if (content === null) {
      continue
    }
    const backupPath = path.join(backupDir, relativePath)
    await mkdir(path.dirname(backupPath), { recursive: true })
    await writeFile(backupPath, content, 'utf8')
  }
}
function sectionOrFallback(content, heading, fallback) {
  const section = extractMarkdownSection(content, heading)
  return hasMeaningfulContent(section) ? section : fallback
}
function normalizeChangedFiles(content) {
  const body = content.replace(/^# Changed Files\r?\n\r?\n?/u, '').trim()
  return body || '[path/to/file]\n- [Short reason for the change]'
}
function firstMeaningfulLine(content) {
  return content
    .split(/\r?\n/u)
    .map((line) => line.replace(/^- /u, '').trim())
    .find((line) => line && hasMeaningfulContent(line))
}
function formatMigrationTimestamp(date) {
  const parts = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((part) => String(part).padStart(2, '0'))
  return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`
}
