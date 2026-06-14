import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

export const ACE_BANNER = '[ACE] Agentic Context Engine initialized...'

const timestampFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: '2-digit',
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const execFileAsync = promisify(execFile)
const PLACEHOLDER_PATTERN = /\[[^\]]+\]|\bTODO\b|\bTBD\b|No .* recorded/i

export const ACE_MEMORY_SCHEMA_VERSION = 2

export const ACE_MEMORY_PATHS = {
  changedFiles: {
    aliases: ['.ai/changed-files.md'],
    canonical: '.ai/state/changed-files.md',
  },
  currentTask: {
    aliases: ['.ai/current-task.md'],
    canonical: '.ai/state/current-task.md',
  },
  decisions: {
    aliases: ['.ai/decisions.md'],
    canonical: '.ai/knowledge/decisions.md',
  },
  generatedContext: {
    aliases: ['.ai/generated-context.md'],
    canonical: '.ai/generated/context.md',
  },
  memoryConfig: {
    aliases: ['.ai/memory-config.json'],
    canonical: '.ai/config/memory-config.json',
  },
  memoryConfigRecommended: {
    aliases: ['.ai/memory-config.recommended.json'],
    canonical: '.ai/config/memory-config.recommended.json',
  },
  productRoadmap: {
    aliases: ['.ai/product-roadmap.md'],
    canonical: '.ai/knowledge/product-roadmap.md',
  },
  projectProfile: {
    aliases: ['.ai/project-profile.md'],
    canonical: '.ai/config/project-profile.md',
  },
  reflectionLog: {
    aliases: ['.ai/reflection-log.md'],
    canonical: '.ai/knowledge/reflection-log.md',
  },
  reportBrief: {
    aliases: ['.ai/report-brief.md'],
    canonical: '.ai/generated/report-brief.md',
  },
  reportCurrentTaskCode: {
    aliases: ['.ai/report-current-task-code.md'],
    canonical: '.ai/generated/report-current-task-code.md',
  },
  reportCurrentTaskCodeXml: {
    aliases: ['.ai/report-current-task-code.xml'],
    canonical: '.ai/generated/report-current-task-code.xml',
  },
  reportFull: {
    aliases: ['.ai/report-full.md'],
    canonical: '.ai/generated/report-full.md',
  },
  reportFullXml: {
    aliases: ['.ai/report-full.xml'],
    canonical: '.ai/generated/report-full.xml',
  },
  sessionHandoff: {
    aliases: ['.ai/session-handoff.md'],
    canonical: '.ai/state/session-handoff.md',
  },
  techDocs: {
    aliases: ['.ai/tech-docs.md'],
    canonical: '.ai/knowledge/tech-docs.md',
  },
  workLog: {
    aliases: ['.ai/work-log.md'],
    canonical: '.ai/knowledge/work-log.md',
  },
}

const PATH_TO_MEMORY_KEY = new Map()

for (const [key, spec] of Object.entries(ACE_MEMORY_PATHS)) {
  PATH_TO_MEMORY_KEY.set(normalizeRelativePath(spec.canonical), key)

  for (const alias of spec.aliases) {
    PATH_TO_MEMORY_KEY.set(normalizeRelativePath(alias), key)
  }
}

export function normalizeTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}

export async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export async function writeTextFile(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, normalizeTrailingNewline(content), 'utf8')
}

export function normalizeRelativePath(relativePath) {
  return relativePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

export function getMemoryPath(memoryKey) {
  const spec = ACE_MEMORY_PATHS[memoryKey]

  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }

  return spec.canonical
}

export function getLegacyMemoryPaths(memoryKey) {
  const spec = ACE_MEMORY_PATHS[memoryKey]

  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }

  return [...spec.aliases]
}

export function resolveMemoryKeyByPath(relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath)

  return (
    PATH_TO_MEMORY_KEY.get(normalizedPath) ??
    (!normalizedPath.includes('/') ? PATH_TO_MEMORY_KEY.get(`.ai/${normalizedPath}`) : null) ??
    null
  )
}

export function getMemoryPathCandidates(memoryKeyOrPath) {
  const memoryKey = ACE_MEMORY_PATHS[memoryKeyOrPath]
    ? memoryKeyOrPath
    : resolveMemoryKeyByPath(memoryKeyOrPath)

  if (!memoryKey) {
    return [memoryKeyOrPath]
  }

  const spec = ACE_MEMORY_PATHS[memoryKey]
  return [spec.canonical, ...spec.aliases]
}

export async function readMemoryFile(rootDir, memoryKeyOrPath) {
  const candidates = []

  for (const [index, relativePath] of getMemoryPathCandidates(memoryKeyOrPath).entries()) {
    const absolutePath = path.join(rootDir, relativePath)
    const [content, timestamp] = await Promise.all([
      readTextIfExists(absolutePath),
      readFileTimestamp(absolutePath),
    ])

    if (content !== null) {
      candidates.push({ content, index, timestamp })
    }
  }

  return candidates
    .sort((left, right) => {
      const timeDelta = (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0)
      return timeDelta === 0 ? right.index - left.index : timeDelta
    })
    .at(0)?.content ?? null
}

export async function readMemoryFileTimestamp(rootDir, memoryKeyOrPath) {
  const timestamps = []

  for (const relativePath of getMemoryPathCandidates(memoryKeyOrPath)) {
    const timestamp = await readFileTimestamp(path.join(rootDir, relativePath))

    if (timestamp !== null) {
      timestamps.push(timestamp)
    }
  }

  return timestamps.sort((left, right) => right.getTime() - left.getTime()).at(0) ?? null
}

export async function writeMemoryFile(rootDir, memoryKeyOrPath, content, options = {}) {
  const memoryKey = ACE_MEMORY_PATHS[memoryKeyOrPath]
    ? memoryKeyOrPath
    : resolveMemoryKeyByPath(memoryKeyOrPath)
  const mirrorLegacy = options.mirrorLegacy === true
  const paths = memoryKey
    ? [
        ACE_MEMORY_PATHS[memoryKey].canonical,
        ...(mirrorLegacy ? ACE_MEMORY_PATHS[memoryKey].aliases : []),
      ]
    : [memoryKeyOrPath]

  for (const relativePath of paths) {
    await writeTextFile(path.join(rootDir, relativePath), content)
  }

  return paths
}

export async function ensureMemoryFileMirror(rootDir, memoryKey, options = {}) {
  const spec = ACE_MEMORY_PATHS[memoryKey]

  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }

  const createdFiles = []
  const removedFiles = []
  const updatedFiles = []
  const canonicalPath = path.join(rootDir, spec.canonical)
  let canonicalContent = await readTextIfExists(canonicalPath)

  if (canonicalContent === null) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)

      if (aliasContent !== null) {
        await writeTextFile(canonicalPath, aliasContent)
        canonicalContent = aliasContent
        createdFiles.push(spec.canonical)
        break
      }
    }
  }

  if (canonicalContent === null && options.template !== undefined) {
    await writeTextFile(canonicalPath, options.template)
    canonicalContent = options.template
    createdFiles.push(spec.canonical)
  }

  if (canonicalContent !== null && isPlaceholderDocument(canonicalContent)) {
    for (const alias of spec.aliases) {
      const aliasContent = await readTextIfExists(path.join(rootDir, alias))

      if (aliasContent !== null && !isPlaceholderDocument(aliasContent)) {
        await writeTextFile(canonicalPath, aliasContent)
        canonicalContent = aliasContent
        updatedFiles.push(spec.canonical)
        break
      }
    }
  }

  if (canonicalContent !== null && options.mirrorLegacy === true) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)

      if (aliasContent === null) {
        await writeTextFile(aliasPath, canonicalContent)
        createdFiles.push(alias)
      }
    }
  }

  if (canonicalContent !== null && options.pruneLegacy === true) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)

      if (aliasContent !== null) {
        await rm(aliasPath, { force: true })
        removedFiles.push(alias)
      }
    }
  }

  return { createdFiles, removedFiles, updatedFiles }
}

export async function migrateMemorySchemaV2(rootDir, options = {}) {
  const createdFiles = []
  const removedFiles = []
  const updatedFiles = []
  const mirrorLegacy = options.mirrorLegacy === true
  const pruneLegacy = options.pruneLegacy === true

  for (const memoryKey of Object.keys(ACE_MEMORY_PATHS)) {
    const result = await ensureMemoryFileMirror(rootDir, memoryKey, {
      mirrorLegacy,
      pruneLegacy,
    })
    createdFiles.push(...result.createdFiles)
    removedFiles.push(...result.removedFiles)
    updatedFiles.push(...result.updatedFiles)
  }

  await mkdir(path.join(rootDir, '.ai', 'config'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'state'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'knowledge'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'generated'), { recursive: true })

  return { createdFiles, removedFiles, updatedFiles }
}

export async function readFileTimestamp(filePath) {
  try {
    return (await stat(filePath)).mtime
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export function formatTimestamp(value) {
  return timestampFormatter.format(value)
}

export function nowTimestamp() {
  return formatTimestamp(new Date())
}

export function writeAceBanner(output = process.stderr) {
  output.write(`${ACE_BANNER}\n`)
}

export function parseCliArgs(args) {
  const parsed = {}

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]

    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const nextToken = args[index + 1]
    const value = nextToken && !nextToken.startsWith('--') ? nextToken : 'true'

    if (value !== 'true') {
      index += 1
    }

    const currentValue = parsed[key]

    if (currentValue === undefined) {
      parsed[key] = value
      continue
    }

    if (Array.isArray(currentValue)) {
      currentValue.push(value)
      continue
    }

    parsed[key] = [currentValue, value]
  }

  return parsed
}

export function getArgList(args, key) {
  const value = args[key]

  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export function getArgValue(args, key) {
  const value = args[key]

  if (Array.isArray(value)) {
    return value.at(-1)
  }

  return value
}

export function formatBullets(items, fallback = '- [Add content here]') {
  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => `- ${item}`).join('\n')
}

export function formatChecklist(items, fallback = '- [ ] Add checklist item') {
  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => (item.startsWith('- [') ? item : `- [ ] ${item}`)).join('\n')
}

export function replaceMarkdownSection(content, heading, body) {
  const lines = content.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => line === `## ${heading}`)

  if (startIndex === -1) {
    return content
  }

  let endIndex = lines.length

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) {
      endIndex = index
      break
    }
  }

  const replacementLines = [`## ${heading}`, ...body.trimEnd().split('\n')]
  const nextLines = [
    ...lines.slice(0, startIndex),
    ...replacementLines,
    '',
    ...lines.slice(endIndex),
  ]

  return normalizeTrailingNewline(nextLines.join('\n')).replace(/\n{3,}/g, '\n\n')
}

export function extractMarkdownSection(content, heading) {
  const lines = content.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => line === `## ${heading}`)

  if (startIndex === -1) {
    return ''
  }

  let endIndex = lines.length

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) {
      endIndex = index
      break
    }
  }

  return lines
    .slice(startIndex + 1, endIndex)
    .join('\n')
    .trim()
}

export function replaceLabeledValue(content, label, value) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:.*$`, 'm')
  return content.replace(pattern, `${label}: ${value}`)
}

export function countCheckboxes(content) {
  const total = (content.match(/^- \[(?: |x)\]/gm) ?? []).length
  const complete = (content.match(/^- \[x\]/gm) ?? []).length

  return { complete, total }
}

export function extractTopDecision(content) {
  const headings = [...content.matchAll(/^## .+$/gm)]
  const heading = headings.at(-1)

  if (!heading || heading.index === undefined) {
    return ''
  }

  const start = heading.index

  return content.slice(start).trim()
}

export function extractChangedFileTitles(content, limit = 8) {
  const headings = [...content.matchAll(/^\[(.+?)\]$/gm)].map((match) => match[1])
  const recentPaths = []

  for (const heading of headings) {
    if (!isChangedPathHeading(heading) || recentPaths.includes(heading)) {
      continue
    }

    recentPaths.push(heading)

    if (recentPaths.length >= limit) {
      break
    }
  }

  return recentPaths
}

export function extractUnresolvedReflections(content, limit = 5) {
  const unresolvedSection = extractMarkdownSection(content, 'Unresolved')

  if (!unresolvedSection) {
    return []
  }

  const entries = extractHeadingBlocks(unresolvedSection, '###')
    .filter((entry) => !/Status:\s*resolved/i.test(entry.body))
    .filter((entry) => !/\[[^\]]+\]/.test(`${entry.title}\n${entry.body}`))

  return entries.slice(0, limit).map((entry) => {
    const summary =
      entry.body
        .split(/\r?\n/)
        .map((line) => line.replace(/^- /, '').trim())
        .find((line) => line.length > 0 && !line.startsWith('Status:')) ?? 'No summary recorded.'

    return `${entry.title} - ${summary}`
  })
}

function extractHeadingBlocks(content, headingMarker) {
  const lines = content.split(/\r?\n/)
  const entries = []
  let currentEntry = null

  for (const line of lines) {
    if (line.startsWith(`${headingMarker} `)) {
      if (currentEntry) {
        entries.push(currentEntry)
      }

      currentEntry = {
        bodyLines: [],
        title: line.slice(headingMarker.length + 1).trim(),
      }
      continue
    }

    if (currentEntry) {
      currentEntry.bodyLines.push(line)
    }
  }

  if (currentEntry) {
    entries.push(currentEntry)
  }

  return entries.map((entry) => ({
    body: entry.bodyLines.join('\n').trim(),
    title: entry.title,
  }))
}

export function normalizeStackText(content) {
  return content
    .replace(/вЂў/g, ' | ')
    .replace(/[•·]/g, ' | ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolveStackSummary(agentsContent, projectProfileContent = '') {
  const agentsStack = normalizeStackText(extractMarkdownSection(agentsContent, 'Stack (non-negotiable)'))

  if (agentsStack) {
    return agentsStack
  }

  const ecosystems = extractMarkdownSection(projectProfileContent, 'Detected Ecosystems')
    .split(/\r?\n/)
    .map((line) => line.replace(/^- /, '').trim())
    .filter(Boolean)
    .join(', ')
  const packageManager = extractLabeledValue(
    extractMarkdownSection(projectProfileContent, 'Repository Shape'),
    '- Package manager',
  )
  const fallbackParts = []

  if (ecosystems) {
    fallbackParts.push(`Detected ecosystems: ${ecosystems}`)
  }

  if (packageManager) {
    fallbackParts.push(`Package manager: ${packageManager}`)
  }

  return fallbackParts.length > 0 ? fallbackParts.join(' | ') : 'Not recorded'
}

export function extractNextCommand(nextStepsContent) {
  for (const line of nextStepsContent.split(/\r?\n/)) {
    const match = line.match(/`([^`]+)`/)

    if (match?.[1]?.trim()) {
      return match[1].trim()
    }
  }

  return ''
}

export function extractReleaseDecision(handoffContent) {
  const match = handoffContent.match(/npm\s+publish\s*:\s*((?:not\s+required|required)[^\r\n]*)/i)

  if (!match?.[1]) {
    return ''
  }

  const decision = match[1]
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^not required/i, 'not required')
    .replace(/^required/i, 'required')

  return `NPM publish: ${decision}`
}

export async function buildStartSnapshot({
  currentTaskContent,
  handoffContent,
  rootDir,
}) {
  const lifecycle = extractMarkdownSection(currentTaskContent, 'Lifecycle')
  const gitSnapshot = await readGitSnapshot(rootDir)
  const nextCommand = extractNextCommand(extractMarkdownSection(handoffContent, 'Next Steps'))
  const releaseDecision = extractReleaseDecision(handoffContent)

  return {
    branch: gitSnapshot.branch,
    changedFileCountDisplay: formatChangedFileCount(gitSnapshot.changedFileCount),
    lastCommit: gitSnapshot.lastCommit,
    nextCommand: nextCommand || 'No command detected',
    readyForArchive: extractLabeledValue(lifecycle, 'Ready For Archive') || 'unknown',
    releaseDecision: releaseDecision || 'Not recorded',
    taskStatus: extractLabeledValue(lifecycle, 'Status') || 'unknown',
    taskTier: extractLabeledValue(lifecycle, 'Task Tier') || 'unknown',
    taskVersion: extractLabeledValue(lifecycle, 'Version') || 'unknown',
    worktreeState: gitSnapshot.worktreeState,
  }
}

export function formatStartSnapshot(snapshot) {
  return [
    `- Branch: ${snapshot.branch}`,
    `- Worktree: ${snapshot.worktreeState} (${snapshot.changedFileCountDisplay} changed files)`,
    `- Last commit: ${snapshot.lastCommit}`,
    `- Task: ${snapshot.taskStatus} (tier: ${snapshot.taskTier}, version: ${snapshot.taskVersion}, ready for archive: ${snapshot.readyForArchive})`,
    `- Next command: ${formatOptionalCommand(snapshot.nextCommand)}`,
    `- Release decision: ${snapshot.releaseDecision}`,
  ].join('\n')
}

async function readGitSnapshot(rootDir) {
  const [branch, statusOutput, lastCommit] = await Promise.all([
    gitOutput(rootDir, ['branch', '--show-current']),
    gitOutput(rootDir, ['status', '--porcelain']),
    gitOutput(rootDir, ['log', '-1', '--pretty=format:%h %s']),
  ])
  const changedFileCount = statusOutput === null ? null : statusOutput.split('\n').filter(Boolean).length

  return {
    branch: branch?.trim() || 'unknown',
    changedFileCount,
    lastCommit: lastCommit?.trim() || 'unknown',
    worktreeState:
      changedFileCount === null ? 'unknown' : changedFileCount > 0 ? 'dirty' : 'clean',
  }
}

async function gitOutput(rootDir, args) {
  try {
    const result = await execFileAsync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    })

    return result.stdout
  } catch {
    return null
  }
}

function formatChangedFileCount(count) {
  if (count === null) {
    return 'unknown'
  }

  return count > 100 ? '99+' : String(count)
}

function formatOptionalCommand(command) {
  return command === 'No command detected' ? command : `\`${command}\``
}

export function summarizeVerification(content, limit = 4) {
  const checks = extractBulletBlocks(content)
  const signals = checks.join('\n').toLowerCase()

  let level = 'not recorded'

  if (/smoke|browser|playwright|manual|loaded /.test(signals)) {
    level = 'smoke-tested'
  } else if (/\btest\b|vitest|passed/.test(signals)) {
    level = 'test-backed'
  } else if (/typecheck|tsc/.test(signals)) {
    level = 'typecheck-only'
  } else if (/\blint\b/.test(signals)) {
    level = 'static checks only'
  }

  return {
    checks: checks.slice(0, limit),
    level,
  }
}

export function getFreshnessStatus(generatedAt, ...sourceDates) {
  const latestSource = sourceDates
    .filter((value) => value instanceof Date)
    .sort((left, right) => right.getTime() - left.getTime())
    .at(0)

  if (!latestSource) {
    return 'Possibly stale'
  }

  return generatedAt.getTime() >= latestSource.getTime() ? 'Fresh' : 'Possibly stale'
}

export function extractLabeledValue(content, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm')
  return content.match(pattern)?.[1]?.trim() ?? ''
}

export function hasMeaningfulContent(content) {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()

  return normalizedContent.length > 0 && !PLACEHOLDER_PATTERN.test(normalizedContent)
}

function isChangedPathHeading(heading) {
  if (/\s-\s\d{4}-\d{2}-\d{2}(?:[ -]\d{2}:\d{2})?$/.test(heading)) {
    return false
  }

  return (
    heading.startsWith('.') ||
    heading.includes('*') ||
    heading.includes('/') ||
    heading.includes('\\') ||
    /\.[a-z0-9]+(?:$|\s)/i.test(heading)
  )
}

function extractBulletBlocks(content) {
  const lines = content.split(/\r?\n/)
  const blocks = []
  let currentBlock = []

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n').trim())
      }

      currentBlock = [line.slice(2)]
      continue
    }

    if (currentBlock.length > 0 && (/^\s{2,}\S/.test(line) || line.trim() === '')) {
      currentBlock.push(line.trim())
      continue
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n').trim())
      currentBlock = []
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n').trim())
  }

  return blocks.filter(Boolean)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isPlaceholderDocument(content) {
  const placeholderMatches =
    content.match(
      /\[(?:YYYY|Set|Describe|Explain|List|Add|Summarize|Confirm|Note|Short|Run|Document|path\/to\/file|content here|latest completed work|current project|next concrete steps|known gaps|publish\/deploy decision)[^\]]*\]|\bTODO\b|\bTBD\b/giu,
    ) ?? []

  return content.trim().length === 0 || placeholderMatches.length >= 2
}
