import { execFile } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import { getRiskMatches, normalizeRepoPath, readMemoryConfig } from './ai-memory-config.mjs'
import { getArgValue, parseCliArgs, writeAceBanner } from './ai-memory-utils.mjs'

const execFileAsync = promisify(execFile)
const TIER_RANK = {
  small: 0,
  standard: 1,
  large: 2,
}

export async function classifyRepositoryTask(rootDir, options = {}) {
  const [changedFiles, diffStats, diffText, config] = await Promise.all([
    getChangedFiles(rootDir),
    getDiffStats(rootDir),
    getDiffText(rootDir),
    readMemoryConfig(rootDir),
  ])

  return classifyTask({
    changedFiles,
    config,
    diffLineCount: diffStats.diffLineCount,
    diffText,
    overrideReason: options.overrideReason,
    overrideTier: options.overrideTier,
  })
}

export function classifyTask({
  changedFiles,
  config,
  diffLineCount,
  diffText = '',
  overrideReason,
  overrideTier,
}) {
  const normalizedFiles = [...new Set(changedFiles.map(normalizeRepoPath))].sort()
  const riskMatches = getRiskMatches({
    changedFiles: normalizedFiles,
    config,
    diffText,
  })
  const reasons = []
  let detectedTier = getBaselineTier(normalizedFiles.length, diffLineCount, config)

  if (normalizedFiles.length === 0 && diffLineCount === 0) {
    reasons.push('No working-tree changes detected.')
  } else {
    reasons.push(`${normalizedFiles.length} changed file(s), ${diffLineCount} diff line(s).`)
  }

  for (const match of riskMatches) {
    detectedTier = maxTier(detectedTier, match.tier)
    reasons.push(`${match.label} risk matched ${match.kind} rule \`${match.pattern}\`.`)
  }

  const finalTier = applyOverride(detectedTier, overrideTier, overrideReason)
  const designReviewRequired =
    finalTier === 'large' || riskMatches.some((match) => match.requiresDesignReview)

  if (overrideTier && overrideTier !== detectedTier) {
    reasons.push(`Override selected \`${overrideTier}\`: ${overrideReason}`)
  }

  return {
    changedFiles: normalizedFiles,
    detectedTier,
    designReviewRequired,
    diffLineCount,
    reasons,
    requiredWorkflow: getRequiredWorkflow(finalTier, designReviewRequired),
    riskMatches,
    tier: finalTier,
  }
}

export function getRequiredWorkflow(tier, designReviewRequired) {
  const workflow = [
    'Update .ai/session-handoff.md with latest state.',
    'Update .ai/changed-files.md for touched areas.',
    'Append a compact .ai/work-log.md entry.',
    'Generate pnpm ace:report:brief.',
  ]

  if (tier === 'standard' || tier === 'large') {
    workflow.push('Fill product, architecture, security, and code-quality review notes.')
  }

  if (designReviewRequired) {
    workflow.unshift('Complete .ai/current-task.md Technical Approach before coding.')
  }

  if (tier === 'large') {
    workflow.push('Maintain lifecycle goal fields and archive a final task snapshot.')
    workflow.push(
      'Review .ai/tech-docs.md or .ai/product-roadmap.md when technical or business state changed.',
    )
    workflow.push('Add a reflection entry when the task exposes friction or repeated mistakes.')
    workflow.push('Generate pnpm ace:report.')
  }

  return workflow
}

export function formatClassification(classification) {
  return [
    'AI task classification',
    `Tier: ${classification.tier}`,
    `Detected tier: ${classification.detectedTier}`,
    `Design review required: ${classification.designReviewRequired ? 'yes' : 'no'}`,
    '',
    'Reasons:',
    ...classification.reasons.map((reason) => `- ${reason}`),
    '',
    'Required workflow:',
    ...classification.requiredWorkflow.map((item) => `- ${item}`),
  ].join('\n')
}

async function getChangedFiles(rootDir) {
  const output = await gitOutput(rootDir, ['status', '--porcelain'])

  return output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((filePath) => filePath.split(' -> ').at(-1) ?? filePath)
    .map(normalizeRepoPath)
    .filter(Boolean)
}

async function getDiffStats(rootDir) {
  const output = await gitOutput(rootDir, ['diff', '--numstat', 'HEAD', '--'])
  let diffLineCount = 0

  for (const line of output.split('\n')) {
    const [added, removed] = line.split('\t')
    const addedLines = Number.parseInt(added, 10)
    const removedLines = Number.parseInt(removed, 10)

    if (Number.isFinite(addedLines)) {
      diffLineCount += addedLines
    }

    if (Number.isFinite(removedLines)) {
      diffLineCount += removedLines
    }
  }

  return { diffLineCount }
}

async function getDiffText(rootDir) {
  return gitOutput(rootDir, ['diff', '--unified=0', 'HEAD', '--'])
}

async function gitOutput(rootDir, args) {
  try {
    const result = await execFileAsync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })

    return result.stdout
  } catch {
    return ''
  }
}

function getBaselineTier(fileCount, diffLineCount, config) {
  if (
    fileCount <= config.thresholds.small.maxFiles &&
    diffLineCount <= config.thresholds.small.maxDiffLines
  ) {
    return 'small'
  }

  if (
    fileCount >= config.thresholds.large.minFiles ||
    diffLineCount >= config.thresholds.large.minDiffLines
  ) {
    return 'large'
  }

  return 'standard'
}

function maxTier(left, right) {
  return TIER_RANK[right] > TIER_RANK[left] ? right : left
}

function applyOverride(detectedTier, overrideTier, overrideReason) {
  if (!overrideTier) {
    return detectedTier
  }

  if (!(overrideTier in TIER_RANK)) {
    throw new Error(`Invalid override tier: ${overrideTier}`)
  }

  if (overrideTier !== detectedTier && !overrideReason) {
    throw new Error('Task tier override requires --reason.')
  }

  return overrideTier
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

  if (getArgValue(args, 'json') === 'true') {
    process.stdout.write(`${JSON.stringify(classification, null, 2)}\n`)
    return
  }

  process.stdout.write(`${formatClassification(classification)}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
