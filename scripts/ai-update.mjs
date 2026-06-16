import {
  formatBullets,
  formatChecklist,
  getArgList,
  getArgValue,
  nowTimestamp,
  parseCliArgs,
  readMemoryFile,
  extractMarkdownSection,
  replaceLabeledValue,
  replaceMarkdownSection,
  writeMemoryFile,
} from './ai-memory-utils.mjs'

const command = process.argv[2]
const args = parseCliArgs(process.argv.slice(3))
const rootDir = process.cwd()

if (!command) {
  throw new Error(
    'Usage: node ./scripts/ai-update.mjs <task|handoff|log|decision|changed> [--flags]',
  )
}

switch (command) {
  case 'task':
    await updateTask()
    break
  case 'handoff':
    await updateHandoff()
    break
  case 'log':
    await appendWorkLog()
    break
  case 'decision':
    await appendDecision()
    break
  case 'changed':
    await appendChangedFile()
    break
  default:
    throw new Error(`Unknown ai:update command: ${command}`)
}

async function updateTask() {
  const existingContent = await requireFile('taskState')
  let nextContent = existingContent

  const feature = getArgValue(args, 'feature')
  const goal = getArgValue(args, 'goal')
  const status = getArgValue(args, 'status')
  const version = getArgValue(args, 'version')
  const started = getArgValue(args, 'started')
  const ready = getArgValue(args, 'ready')

  if (feature) {
    nextContent = replaceMarkdownSection(nextContent, 'Feature Name', feature)
  }

  if (goal) {
    nextContent = replaceMarkdownSection(nextContent, 'Goal', goal)
  }

  if (status) {
    nextContent = replaceLabeledValue(nextContent, 'Status', status)
  }

  if (version) {
    nextContent = replaceLabeledValue(nextContent, 'Version', version)
  }

  if (started) {
    nextContent = replaceLabeledValue(
      nextContent,
      'Started',
      started === 'now' ? nowTimestamp() : started,
    )
  }

  if (ready) {
    nextContent = replaceLabeledValue(nextContent, 'Ready For Archive', ready)
  }

  const current = getArgList(args, 'current')
  const affected = getArgList(args, 'affected')
  const constraints = getArgList(args, 'constraint')
  const acceptance = getArgList(args, 'accept')
  const checklist = getArgList(args, 'check')

  if (current.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Current Status', formatBullets(current))
  }

  if (affected.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Affected Areas', formatBullets(affected))
  }

  if (constraints.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Constraints', formatBullets(constraints))
  }

  if (acceptance.length > 0) {
    nextContent = replaceMarkdownSection(
      nextContent,
      'Acceptance Criteria',
      formatBullets(acceptance),
    )
  }

  if (checklist.length > 0) {
    nextContent = replaceMarkdownSection(
      nextContent,
      'Completion Checklist',
      formatChecklist(checklist),
    )
  }

  await writeMemoryFile(rootDir, 'taskState', nextContent)
  process.stderr.write('Updated .ai/state/task-state.md\n')
}

async function updateHandoff() {
  const existingContent = await requireFile('taskState')
  let nextContent = existingContent

  const updated = getArgValue(args, 'updated')

  if (updated || Object.keys(args).length > 0) {
    nextContent = replaceMarkdownSection(
      nextContent,
      'Last Update',
      updated === undefined || updated === 'now' ? nowTimestamp() : updated,
    )
  }

  const done = getArgList(args, 'done')
  const state = getArgList(args, 'state')
  const next = getArgList(args, 'next')
  const issues = getArgList(args, 'issue')
  const notes = getArgList(args, 'note')

  if (done.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'What Was Done', formatBullets(done))
  }

  if (state.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Current State', formatBullets(state))
  }

  if (next.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Next Steps', formatBullets(next))
  }

  if (issues.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Known Issues', formatBullets(issues))
  }

  if (notes.length > 0) {
    nextContent = replaceMarkdownSection(nextContent, 'Notes', formatBullets(notes))
  }

  await writeMemoryFile(rootDir, 'taskState', nextContent)
  process.stderr.write('Updated .ai/state/task-state.md\n')
}

async function appendWorkLog() {
  const existingContent = await requireFile('workLog')
  const timestamp = getArgValue(args, 'timestamp')
  const messages = getArgList(args, 'message')

  if (messages.length === 0) {
    throw new Error('ai:update:log requires at least one --message value.')
  }

  const nextContent = `${existingContent.trimEnd()}\n\n## ${
    timestamp === undefined || timestamp === 'now' ? nowTimestamp() : timestamp
  }\n\n${formatBullets(messages)}\n`
  await writeMemoryFile(rootDir, 'workLog', nextContent)
  process.stderr.write('Updated .ai/knowledge/work-log.md\n')
}

async function appendDecision() {
  const existingContent = await requireFile('decisions')
  const timestamp = getArgValue(args, 'timestamp')
  const title = getArgValue(args, 'title')
  const decision = getArgList(args, 'decision')
  const reason = getArgList(args, 'reason')
  const impact = getArgList(args, 'impact')

  if (decision.length === 0 || reason.length === 0 || impact.length === 0) {
    throw new Error('ai:update:decision requires --decision, --reason, and --impact values.')
  }

  const heading = title
    ? `## ${timestamp === undefined || timestamp === 'now' ? nowTimestamp() : timestamp} (${title})`
    : `## ${timestamp === undefined || timestamp === 'now' ? nowTimestamp() : timestamp}`

  const block = `${heading}\n\nDecision:\n${formatBullets(decision)}\n\nReason:\n${formatBullets(reason)}\n\nImpact:\n${formatBullets(impact)}\n`
  const nextContent = existingContent.replace(/^# Decisions\r?\n\r?\n/, `# Decisions\n\n${block}\n`)

  await writeMemoryFile(rootDir, 'decisions', nextContent)
  process.stderr.write('Updated .ai/knowledge/decisions.md\n')
}

async function appendChangedFile() {
  const existingContent = await requireFile('taskState')
  const changedFile = getArgValue(args, 'file')
  const notes = getArgList(args, 'note')

  if (!changedFile || notes.length === 0) {
    throw new Error('ai:update:changed requires --file and at least one --note value.')
  }

  const block = `\n[${changedFile}]\n${formatBullets(notes)}\n`
  const changedSection = extractMarkdownSection(existingContent, 'Changed Files / Diff')
  const nextContent = replaceMarkdownSection(
    existingContent,
    'Changed Files / Diff',
    `${changedSection.trimEnd()}${block}`,
  )

  await writeMemoryFile(rootDir, 'taskState', nextContent)
  process.stderr.write('Updated .ai/state/task-state.md\n')
}

async function requireFile(memoryKey) {
  const content = await readMemoryFile(rootDir, memoryKey)

  if (content === null) {
    throw new Error(`Missing required ACE memory file: ${memoryKey}`)
  }

  return content
}
