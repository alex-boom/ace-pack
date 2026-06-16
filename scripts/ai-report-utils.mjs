import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

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

export function normalizeStackText(content) {
  return content
    .replace(/РІР‚Сћ/g, ' | ')
    .replace(/[вЂўВ·]/g, ' | ')
    .replace(/[\u2022\u00b7]/g, ' | ')
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

export async function buildStartSnapshot({ currentTaskContent, handoffContent, rootDir }) {
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

  return { checks: checks.slice(0, limit), level }
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

function extractMarkdownSection(content, heading) {
  const lines = content.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => getMarkdownHeading(line)?.title === heading)

  if (startIndex === -1) {
    return ''
  }

  const headingInfo = getMarkdownHeading(lines[startIndex])
  let endIndex = lines.length

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const currentHeading = getMarkdownHeading(lines[index])

    if (currentHeading && currentHeading.level <= headingInfo.level) {
      endIndex = index
      break
    }
  }

  return lines.slice(startIndex + 1, endIndex).join('\n').trim()
}

function extractLabeledValue(content, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm')
  return content.match(pattern)?.[1]?.trim() ?? ''
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

      currentEntry = { bodyLines: [], title: line.slice(headingMarker.length + 1).trim() }
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

function getMarkdownHeading(line) {
  const match = line.match(/^(#{2,6})\s+(.+)$/u)
  return match ? { level: match[1].length, title: match[2].trim() } : null
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

function formatChangedFileCount(count) {
  return count === null ? 'unknown' : count > 100 ? '99+' : String(count)
}

function formatOptionalCommand(command) {
  return command === 'No command detected' ? command : `\`${command}\``
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
