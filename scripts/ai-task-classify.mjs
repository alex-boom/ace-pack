import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { getRiskMatches, normalizeRepoPath, readMemoryConfig } from './ai-memory-config.mjs'
import { getArgList, getArgValue, parseCliArgs, writeAceBanner } from './ai-memory-utils.mjs'
import {
  formatClassificationScope,
  getDiffInputs,
  normalizeClassificationScope,
} from './ai-task-scope.mjs'

const TIER_RANK = {
  small: 0,
  standard: 1,
  large: 2,
}

export async function classifyRepositoryTask(rootDir, options = {}) {
  const scope = normalizeClassificationScope(options)
  const diffInputs = await getDiffInputs(rootDir, scope)
  const config = await readMemoryConfig(rootDir)

  const classification = classifyTask({
    changedFiles: diffInputs.changedFiles,
    config,
    diffLineCount: diffInputs.diffLineCount,
    diffText: diffInputs.diffText,
    overrideReason: options.overrideReason,
    overrideTier: options.overrideTier,
  })

  return {
    ...classification,
    baseRef: options.baseRef ?? null,
    gitError: diffInputs.gitError,
    headRef: options.headRef ?? null,
    scope: diffInputs.scope,
  }
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
    'Update .ai/state/task-state.md with latest state and touched areas.',
    'Append a compact .ai/work-log.md entry.',
    'Generate pnpm ace report brief.',
  ]

  if (tier === 'standard' || tier === 'large') {
    workflow.push('Fill product, architecture, security, and code-quality review notes.')
  }

  if (designReviewRequired) {
    workflow.unshift('Complete .ai/state/task-state.md Technical Approach before coding.')
  }

  if (tier === 'large') {
    workflow.push('Maintain lifecycle goal fields and archive a final task snapshot.')
    workflow.push(
      'Review .ai/knowledge/tech-docs.md or .ai/knowledge/product-roadmap.md when technical or business state changed.',
    )
    workflow.push('Add a reflection entry when the task exposes friction or repeated mistakes.')
    workflow.push('Generate pnpm ace report.')
  }

  return workflow
}

export function formatClassification(classification) {
  const lines = [
    'AI task classification',
    `Tier: ${classification.tier}`,
    `Detected tier: ${classification.detectedTier}`,
    `Design review required: ${classification.designReviewRequired ? 'yes' : 'no'}`,
    `Scope: ${formatClassificationScope(classification.scope)}`,
    '',
    'Reasons:',
    ...classification.reasons.map((reason) => `- ${reason}`),
  ]

  if (classification.gitError) {
    lines.push('', 'Git issue:', `- ${classification.gitError}`)
  }

  lines.push(
    '',
    'Required workflow:',
    ...classification.requiredWorkflow.map((item) => `- ${item}`),
  )

  return lines.join('\n')
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
  const paths = [...getArgList(args, 'path'), ...getArgList(args, 'paths')]
  const classification = await classifyRepositoryTask(rootDir, {
    baseRef: getArgValue(args, 'base'),
    headRef: getArgValue(args, 'head'),
    overrideReason: getArgValue(args, 'reason'),
    overrideTier: getArgValue(args, 'tier'),
    paths,
    staged: getArgValue(args, 'staged') === 'true',
  })

  if (getArgValue(args, 'json') === 'true') {
    process.stdout.write(`${JSON.stringify(classification, null, 2)}\n`)
    if (classification.gitError) {
      process.exit(1)
    }
    return
  }

  process.stdout.write(`${formatClassification(classification)}\n`)
  if (classification.gitError) {
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
