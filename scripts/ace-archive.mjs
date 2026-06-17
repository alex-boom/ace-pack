#!/usr/bin/env node
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  getArgValue,
  getMemoryPath,
  parseCliArgs,
  readTextIfExists,
  writeAceBanner,
  writeTextFile,
} from './ai-memory-utils.mjs'

export const DEFAULT_ARCHIVE_MAX_LINES = 100

export const ARCHIVE_TARGETS = [
  {
    archiveBaseName: 'work-log',
    defaultHeading: '# Work Log',
    memoryKey: 'workLog',
  },
  {
    archiveBaseName: 'reflection-log',
    defaultHeading: '# Reflection Log',
    memoryKey: 'reflectionLog',
    requiredSections: ['## Unresolved', '## Resolved'],
  },
]

export async function archiveMemoryLogs(rootDir, options = {}) {
  const maxLines = normalizeMaxLines(options.maxLines ?? DEFAULT_ARCHIVE_MAX_LINES)
  const dryRun = options.dryRun === true
  const now = options.now ?? new Date()
  const results = []

  for (const target of ARCHIVE_TARGETS) {
    results.push(await inspectArchiveTarget(rootDir, target, { dryRun, maxLines, now }))
  }

  return { dryRun, maxLines, results }
}

async function inspectArchiveTarget(rootDir, target, { dryRun, maxLines, now }) {
  const sourceRelativePath = getMemoryPath(target.memoryKey)
  const sourcePath = path.join(rootDir, sourceRelativePath)
  const content = await readTextIfExists(sourcePath)

  if (content === null) {
    return {
      action: 'missing',
      lineCount: 0,
      sourceRelativePath,
    }
  }

  const lineCount = countLines(content)
  if (lineCount <= maxLines) {
    return {
      action: 'unchanged',
      lineCount,
      sourceRelativePath,
    }
  }

  const archiveFileName = await resolveArchiveFileName(rootDir, target.archiveBaseName, now)
  const archiveRelativePath = path.posix.join('.ai/archive', archiveFileName)
  const nextContent = formatFreshLogContent({
    archiveFileName,
    heading: extractFirstHeading(content) || target.defaultHeading,
    requiredSections: target.requiredSections ?? [],
  })

  if (!dryRun) {
    await mkdir(path.join(rootDir, '.ai', 'archive'), { recursive: true })
    await writeTextFile(path.join(rootDir, archiveRelativePath), content)
    await writeTextFile(sourcePath, nextContent)
  }

  return {
    action: dryRun ? 'would-archive' : 'archived',
    archiveFileName,
    archiveRelativePath,
    lineCount,
    sourceRelativePath,
  }
}

function countLines(content) {
  if (content.length === 0) {
    return 0
  }
  return content.replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').replace(/\n$/u, '').split('\n').length
}

async function resolveArchiveFileName(rootDir, baseName, date) {
  const datePrefix = formatArchiveDate(date)
  for (let index = 0; index < 100; index += 1) {
    const suffix = index === 0 ? '' : `-${index + 1}`
    const fileName = `${datePrefix}-${baseName}${suffix}.md`
    const content = await readTextIfExists(path.join(rootDir, '.ai', 'archive', fileName))
    if (content === null) {
      return fileName
    }
  }
  throw new Error(`Unable to create a unique archive file name for ${datePrefix}-${baseName}.md.`)
}

function formatFreshLogContent({ archiveFileName, heading, requiredSections }) {
  const link = `*Archived history can be found in [${archiveFileName}](../archive/${archiveFileName})*`
  const sections = requiredSections.length > 0 ? `\n\n${requiredSections.join('\n\n')}` : ''

  return `${heading.trim()}\n\n${link}${sections}\n`
}

function extractFirstHeading(content) {
  return content
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .find((line) => /^#\s+\S/u.test(line)) ?? ''
}

function formatArchiveDate(date) {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].map((part) => String(part).padStart(2, '0')).join('-')
}

function normalizeMaxLines(value) {
  const normalizedValue = String(value).trim()
  if (!/^\d+$/u.test(normalizedValue)) {
    throw new Error('--max-lines must be a positive integer.')
  }
  const parsed = Number.parseInt(normalizedValue, 10)
  if (parsed < 1) {
    throw new Error('--max-lines must be a positive integer.')
  }
  return parsed
}

function parseArchiveArgs(argv) {
  const args = parseCliArgs(argv)
  return {
    dryRun: getArgValue(args, 'dry-run') === 'true',
    help: getArgValue(args, 'help') === 'true' || argv.includes('-h'),
    maxLines: getArgValue(args, 'max-lines') ?? DEFAULT_ARCHIVE_MAX_LINES,
  }
}

function formatHelp() {
  return `ACE Archive
Usage:
  ace archive
  ace archive --max-lines <n>
  ace archive --dry-run --max-lines <n>
Options:
  --max-lines <n>  Archive active logs when they exceed this many lines. Default: ${DEFAULT_ARCHIVE_MAX_LINES}.
  --dry-run        Report what would be archived without writing files.
  --help           Show this help.
`
}

export function formatArchiveCliSummary(result) {
  const lines = []
  for (const item of result.results) {
    if (item.action === 'missing') {
      lines.push(`[ACE] Missing ${item.sourceRelativePath}; skipped.`)
      continue
    }
    if (item.action === 'unchanged') {
      lines.push(`[ACE] ${item.sourceRelativePath} is within limit (${item.lineCount}/${result.maxLines} lines).`)
      continue
    }
    const verb = item.action === 'would-archive' ? 'Would archive' : 'Archived'
    lines.push(`[ACE] ${verb} ${item.sourceRelativePath} to ${item.archiveRelativePath} (${item.lineCount} lines > ${result.maxLines}).`)
  }
  return `${lines.join('\n')}\n`
}

async function main() {
  try {
    const args = parseArchiveArgs(process.argv.slice(2))
    if (args.help) {
      process.stdout.write(formatHelp())
      return
    }
    writeAceBanner()
    const result = await archiveMemoryLogs(process.cwd(), args)
    process.stdout.write(formatArchiveCliSummary(result))
  } catch (error) {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
