import { execFile } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import {
  extractLabeledValue,
  extractMarkdownSection,
  extractUnresolvedReflections,
  formatTimestamp,
  getArgValue,
  hasMeaningfulContent,
  parseCliArgs,
  readTextIfExists,
  replaceMarkdownSection,
  writeAceBanner,
  writeTextFile,
} from './ai-memory-utils.mjs'
import { classifyRepositoryTask } from './ai-task-classify.mjs'

const execFileAsync = promisify(execFile)
const SMALL_CLOSEOUT_START = '<!-- ace-small-closeout:start -->'
const SMALL_CLOSEOUT_END = '<!-- ace-small-closeout:end -->'

export function validateFinishRequirements({
  classification,
  currentTaskContent,
  handoffContent,
  reflectionLogContent,
}) {
  const missing = []
  const businessValue = extractMarkdownSection(
    currentTaskContent,
    'Business Value / Product Alignment',
  )
  const technicalApproach = extractMarkdownSection(currentTaskContent, 'Technical Approach')
  const qualityReview = extractMarkdownSection(handoffContent, 'Quality Review')

  if (!isSmallLowRiskClassification(classification) && !hasMeaningfulContent(businessValue)) {
    missing.push('Fill .ai/current-task.md Business Value / Product Alignment.')
  }

  if (classification.designReviewRequired && !hasDesignReview(technicalApproach)) {
    missing.push(
      'Fill .ai/current-task.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  }

  if (
    (classification.tier === 'standard' || classification.tier === 'large') &&
    !hasQualityReview(qualityReview)
  ) {
    missing.push(
      'Fill .ai/session-handoff.md Quality Review for product, architecture, security, and code quality.',
    )
  }

  if (classification.tier === 'large' && !hasMeaningfulReflection(reflectionLogContent)) {
    missing.push('Add a compact .ai/reflection-log.md entry for this large task.')
  }

  return missing
}

export function isSmallLowRiskClassification(classification) {
  return (
    classification.tier === 'small' &&
    classification.designReviewRequired === false &&
    (classification.riskMatches?.length ?? 0) === 0
  )
}

export async function archiveCurrentTask(rootDir) {
  const currentTaskPath = path.join(rootDir, '.ai', 'current-task.md')
  const currentTaskContent = await readTextIfExists(currentTaskPath)

  if (currentTaskContent === null) {
    throw new Error('Cannot archive missing .ai/current-task.md.')
  }

  const lifecycle = extractMarkdownSection(currentTaskContent, 'Lifecycle')
  const version = extractLabeledValue(lifecycle, 'Version') || 'task'
  const featureName = extractMarkdownSection(currentTaskContent, 'Feature Name') || 'task'
  const timestamp = formatTimestamp(new Date()).replace(/[: ]/g, '-')
  const baseName = `${slugify(version)}-${slugify(featureName)}-${timestamp}`
  let outputPath = path.join(rootDir, '.ai', 'archive', 'tasks', `${baseName}.md`)
  let suffix = 2

  while ((await readTextIfExists(outputPath)) !== null) {
    outputPath = path.join(rootDir, '.ai', 'archive', 'tasks', `${baseName}-${suffix}.md`)
    suffix += 1
  }

  await writeTextFile(outputPath, currentTaskContent)
  return outputPath
}

async function main() {
  writeAceBanner()

  const rawArgs = process.argv.slice(2)
  const args = parseCliArgs(rawArgs)
  const rootDir = path.resolve(process.cwd(), getArgValue(args, 'root') ?? '.')
  const classification = await classifyRepositoryTask(rootDir, {
    overrideReason: getArgValue(args, 'reason'),
    overrideTier: getArgValue(args, 'tier'),
  })
  const [currentTaskContent, handoffContent, reflectionLogContent] = await Promise.all([
    requireAiFile(rootDir, 'current-task.md'),
    requireAiFile(rootDir, 'session-handoff.md'),
    requireAiFile(rootDir, 'reflection-log.md'),
  ])
  const missing = validateFinishRequirements({
    classification,
    currentTaskContent,
    handoffContent,
    reflectionLogContent,
  })

  if (missing.length > 0) {
    process.stderr.write('Adaptive task finish blocked by missing closeout notes:\n')

    for (const item of missing) {
      process.stderr.write(`- ${item}\n`)
    }

    process.exit(1)
  }

  if (isSmallLowRiskClassification(classification)) {
    await autoCloseSmallTask(rootDir, {
      classification,
      handoffContent,
    })
  }

  await runNodeScript(rootDir, 'ai-report-brief.mjs')

  if (classification.tier === 'large') {
    process.stderr.write(
      'Large task reminder: update .ai/tech-docs.md for architecture changes and .ai/product-roadmap.md for business or roadmap changes when applicable.\n',
    )
    const archivePath = await archiveCurrentTask(rootDir)
    process.stderr.write(`Archived current task to ${archivePath}\n`)
    await runNodeScript(rootDir, 'ai-report.mjs')
  }

  process.stderr.write(`Adaptive task finish passed for ${classification.tier} task.\n`)
}

async function autoCloseSmallTask(rootDir, { classification, handoffContent }) {
  const timestamp = formatTimestamp(new Date())
  const changedFiles = classification.changedFiles ?? []
  const changedFileSummary =
    changedFiles.length > 0 ? changedFiles.join(', ') : 'No working-tree changes detected'
  const verification = extractMarkdownSection(handoffContent, 'Verification')
  const verificationLine = hasMeaningfulContent(verification)
    ? 'Existing verification notes were preserved.'
    : 'No explicit verification was recorded for this small low-risk auto-closeout.'

  await Promise.all([
    writeSmallHandoff(rootDir, {
      changedFileSummary,
      handoffContent,
      timestamp,
      verificationLine,
    }),
    writeSmallChangedFiles(rootDir, {
      changedFiles,
    }),
    writeSmallWorkLog(rootDir, {
      changedFileSummary,
      timestamp,
      verificationLine,
    }),
  ])
}

async function writeSmallHandoff(rootDir, {
  changedFileSummary,
  handoffContent,
  timestamp,
  verificationLine,
}) {
  const handoffPath = path.join(rootDir, '.ai', 'session-handoff.md')
  let nextContent = replaceMarkdownSection(handoffContent, 'Last Update', timestamp)

  nextContent = mergeSection(nextContent, 'What Was Done', [
    'ACE small-task auto-closeout:',
    '- Classified as small low-risk.',
    `- Changed files: ${changedFileSummary}.`,
  ].join('\n'))
  nextContent = mergeSection(nextContent, 'Current State', [
    'ACE small-task auto-closeout:',
    '- Small low-risk closeout artifacts are synchronized.',
    '- Current task lifecycle was left unchanged.',
  ].join('\n'))
  nextContent = mergeSection(nextContent, 'Verification', [
    'ACE small-task auto-closeout:',
    `- ${verificationLine}`,
  ].join('\n'))
  nextContent = mergeSection(nextContent, 'Next Steps', [
    'ACE small-task auto-closeout:',
    '- No terminal command detected for this small low-risk closeout.',
  ].join('\n'))
  nextContent = mergeSection(nextContent, 'Notes', [
    'ACE small-task auto-closeout:',
    '- NPM publish: not required for this small low-risk closeout unless repository release policy says otherwise.',
  ].join('\n'))

  await writeTextFile(handoffPath, nextContent)
}

async function writeSmallChangedFiles(rootDir, { changedFiles }) {
  const changedFilesPath = path.join(rootDir, '.ai', 'changed-files.md')
  const currentContent = (await readTextIfExists(changedFilesPath)) ?? '# Changed Files\n'
  const missingEntries =
    changedFiles.length > 0
      ? changedFiles.filter((filePath) => !currentContent.includes(`[${filePath}]`))
      : currentContent.includes('[No working-tree changes]')
        ? []
        : ['No working-tree changes']

  if (missingEntries.length === 0) {
    return
  }

  const entries = missingEntries
    .map((filePath) => {
      if (filePath === 'No working-tree changes') {
        return `[${filePath}]\n- Small low-risk auto-closeout found no changed files.`
      }

      return `[${filePath}]\n- Small low-risk auto-closeout recorded this changed path.`
    })
    .join('\n\n')

  await writeTextFile(changedFilesPath, `${currentContent.trimEnd()}\n\n${entries}\n`)
}

async function writeSmallWorkLog(rootDir, {
  changedFileSummary,
  timestamp,
  verificationLine,
}) {
  const workLogPath = path.join(rootDir, '.ai', 'work-log.md')
  const currentContent = (await readTextIfExists(workLogPath)) ?? '# Work Log\n'
  const entry = [
    `## ${timestamp}`,
    '',
    '- ACE auto-closed a small low-risk task.',
    `- Changed files: ${changedFileSummary}.`,
    `- ${verificationLine}`,
    '- NPM publish: not required for this small low-risk closeout unless repository release policy says otherwise.',
  ].join('\n')

  await writeTextFile(workLogPath, `${currentContent.trimEnd()}\n\n${entry}\n`)
}

function mergeSection(content, heading, generatedBody) {
  const currentSection = extractMarkdownSection(content, heading)
  const generatedBlock = formatSmallCloseoutBlock(generatedBody)

  if (!hasMeaningfulContent(currentSection)) {
    return replaceMarkdownSection(content, heading, generatedBlock)
  }

  if (currentSection.includes(SMALL_CLOSEOUT_START)) {
    const pattern = new RegExp(
      `${escapeRegExp(SMALL_CLOSEOUT_START)}[\\s\\S]*?${escapeRegExp(SMALL_CLOSEOUT_END)}`,
      'm',
    )
    return replaceMarkdownSection(content, heading, currentSection.replace(pattern, generatedBlock))
  }

  return replaceMarkdownSection(content, heading, `${currentSection}\n\n${generatedBlock}`)
}

function formatSmallCloseoutBlock(body) {
  return `${SMALL_CLOSEOUT_START}\n${body}\n${SMALL_CLOSEOUT_END}`
}

async function requireAiFile(rootDir, fileName) {
  const filePath = path.join(rootDir, '.ai', fileName)
  const content = await readTextIfExists(filePath)

  if (content === null) {
    throw new Error(`Missing required file: ${filePath}`)
  }

  return content
}

async function runNodeScript(rootDir, scriptName) {
  await execFileAsync(process.execPath, [path.join(rootDir, 'scripts', scriptName), rootDir], {
    cwd: rootDir,
    env: process.env,
  })
}

function hasDesignReview(section) {
  return (
    hasMeaningfulContent(section) &&
    /Option\s*1:/i.test(section) &&
    /Option\s*2:/i.test(section) &&
    /Chosen Approach:/i.test(section)
  )
}

function hasQualityReview(section) {
  return (
    hasMeaningfulContent(section) &&
    hasQualityLabel(section, 'Product Alignment') &&
    hasQualityLabel(section, 'Architecture') &&
    hasQualityLabel(section, 'Security') &&
    hasQualityLabel(section, 'Code Quality')
  )
}

function hasQualityLabel(section, label) {
  const pattern = new RegExp(
    `${escapeRegExp(label)}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Za-z ]+:|$)`,
    'i',
  )
  const match = section.match(pattern)

  return Boolean(match?.[1] && hasMeaningfulContent(match[1]))
}

function hasMeaningfulReflection(content) {
  return (
    extractUnresolvedReflections(content, 1).length > 0 || /## Resolved[\s\S]*^### /m.test(content)
  )
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
