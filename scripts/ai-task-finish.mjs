import { execFile } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import {
  buildCompletedTaskState,
  extractTaskTitle,
} from './ace-task-state.mjs'
import {
  extractLabeledValue,
  extractMarkdownSection,
  extractUnresolvedReflections,
  formatTimestamp,
  getArgValue,
  hasMeaningfulContent,
  parseCliArgs,
  readMemoryFile,
  readTextIfExists,
  writeAceBanner,
  writeMemoryFile,
  writeTextFile,
} from './ai-memory-utils.mjs'
import { classifyRepositoryTask } from './ai-task-classify.mjs'

const execFileAsync = promisify(execFile)

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
    missing.push('Fill .ai/state/task-state.md Business Value / Product Alignment.')
  }

  if (classification.designReviewRequired && !hasDesignReview(technicalApproach)) {
    missing.push(
      'Fill .ai/state/task-state.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  }

  if (
    (classification.tier === 'standard' || classification.tier === 'large') &&
    !hasQualityReview(qualityReview)
  ) {
    missing.push(
      'Fill .ai/state/task-state.md Quality Review for product, architecture, security, and code quality.',
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
  const currentTaskContent = await readMemoryFile(rootDir, 'taskState')

  if (currentTaskContent === null) {
    throw new Error('Cannot archive missing .ai/state/task-state.md.')
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
    requireAiFile(rootDir, 'taskState', '.ai/state/task-state.md'),
    requireAiFile(rootDir, 'taskState', '.ai/state/task-state.md'),
    requireAiFile(rootDir, 'reflectionLog', '.ai/knowledge/reflection-log.md'),
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
      taskStateContent: currentTaskContent,
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

async function autoCloseSmallTask(rootDir, { taskStateContent }) {
  const timestamp = formatTimestamp(new Date())
  const taskTitle = extractTaskTitle(taskStateContent)
  const diffSummary = await readGitDiffSummary(rootDir)
  const changedSummary = summarizeGitState(diffSummary)
  const verification = extractMarkdownSection(taskStateContent, 'Verification')
  const verificationLine = hasMeaningfulContent(verification)
    ? 'Existing verification notes were preserved.'
    : 'No explicit verification was recorded for this small low-risk auto-closeout.'

  await Promise.all([
    writeSmallWorkLog(rootDir, {
      diffSummary,
      taskTitle,
      timestamp,
      verificationLine,
    }),
    writeMemoryFile(rootDir, 'taskState', buildCompletedTaskState({
      changedSummary,
      taskTitle,
      timestamp,
      verificationLine,
    })),
  ])
}

async function writeSmallWorkLog(rootDir, {
  diffSummary,
  taskTitle,
  timestamp,
  verificationLine,
}) {
  const currentContent = (await readMemoryFile(rootDir, 'workLog')) ?? '# Work Log\n'
  const entry = [
    `## ${timestamp}`,
    '',
    `- ACE auto-closed small task: ${taskTitle}.`,
    `- ${verificationLine}`,
    '- NPM publish: not required for this small low-risk closeout unless repository release policy says otherwise.',
    '',
    '```text',
    diffSummary,
    '```',
  ].join('\n')

  await writeMemoryFile(rootDir, 'workLog', `${currentContent.trimEnd()}\n\n${entry}\n`)
}

async function requireAiFile(rootDir, memoryKey, displayPath) {
  const content = await readMemoryFile(rootDir, memoryKey)

  if (content === null) {
    throw new Error(`Missing required file: ${displayPath}`)
  }

  return content
}

async function readGitDiffSummary(rootDir) {
  const diffStat = await gitOutput(rootDir, ['diff', '--stat', 'HEAD', '--'])

  if (diffStat.trim()) {
    return diffStat.trim()
  }

  const status = await gitOutput(rootDir, ['status', '--short'])
  return status.trim() || 'No working-tree changes detected.'
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
    return ''
  }
}

function summarizeGitState(diffSummary) {
  return diffSummary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join('; ') || 'No working-tree changes detected.'
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
