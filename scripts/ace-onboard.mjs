import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  UNIVERSAL_HIGH_RISK_KEYWORDS,
  UNIVERSAL_HIGH_RISK_PATHS,
  buildMemoryConfig,
  buildPresetMemoryConfig,
  dedupeKeywordRules,
  dedupePathRules,
  getProjectPreset,
} from './ace-project-presets.mjs'
import {
  getArgValue,
  nowTimestamp,
  parseCliArgs,
  readTextIfExists,
  writeAceBanner,
} from './ai-memory-utils.mjs'

export const PROJECT_PROFILE_PATH = '.ai/project-profile.md'
export const RECOMMENDED_CONFIG_PATH = '.ai/memory-config.recommended.json'

const MAX_SCANNED_FILES = 5000
const MAX_SCAN_DEPTH = 8
const SKIPPED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
])

const DETECTION_RULES = [
  {
    ecosystem: 'Next.js / TypeScript',
    paths: [
      { label: 'auth package', pattern: 'packages/auth/**', tier: 'large' },
      { label: 'Next.js app router', pattern: 'app/**', tier: 'standard' },
      { label: 'Next.js app router', pattern: 'apps/*/src/app/**', tier: 'standard' },
      { label: 'Next.js middleware', pattern: 'middleware.ts', tier: 'large' },
      { label: 'Next.js middleware', pattern: '**/middleware.ts', tier: 'large' },
    ],
    signals: ['next.config.ts', 'next.config.js'],
  },
  {
    ecosystem: 'tRPC / API routers',
    paths: [
      { label: 'tRPC router', pattern: 'packages/api/src/routers/**', tier: 'large' },
      { label: 'tRPC router', pattern: 'src/server/api/**', tier: 'large' },
      { label: 'API routes', pattern: '**/api/**', tier: 'standard' },
    ],
    signals: ['@trpc/server'],
  },
  {
    ecosystem: 'Drizzle / database',
    paths: [
      { label: 'database schema', pattern: 'packages/db/src/schema/**', tier: 'large' },
      { label: 'database migration', pattern: 'packages/db/drizzle/**', tier: 'large' },
      { label: 'database migration', pattern: 'packages/db/migrations/**', tier: 'large' },
      { label: 'database schema', pattern: 'src/db/**', tier: 'large' },
    ],
    signals: ['drizzle-orm', 'drizzle-kit'],
  },
  {
    ecosystem: 'Python / FastAPI',
    paths: [
      { label: 'Python security module', pattern: 'app/core/security.py', tier: 'large' },
      { label: 'Python auth module', pattern: 'app/**/auth*.py', tier: 'large' },
      { label: 'FastAPI routers', pattern: 'app/api/**', tier: 'standard' },
      { label: 'Python database migration', pattern: 'alembic/**', tier: 'large' },
    ],
    signals: ['requirements.txt', 'pyproject.toml', 'fastapi'],
  },
  {
    ecosystem: 'Go service',
    paths: [
      { label: 'Go auth package', pattern: 'internal/auth/**', tier: 'large' },
      { label: 'Go middleware', pattern: 'internal/middleware/**', tier: 'large' },
      { label: 'Go API handlers', pattern: 'internal/handlers/**', tier: 'standard' },
      { label: 'Go database migration', pattern: 'migrations/**', tier: 'large' },
    ],
    signals: ['go.mod'],
  },
  {
    ecosystem: '.NET service',
    paths: [
      { label: '.NET auth module', pattern: '**/Auth/**', tier: 'large' },
      { label: '.NET middleware', pattern: '**/Middleware/**', tier: 'large' },
      { label: '.NET migration', pattern: '**/Migrations/**', tier: 'large' },
    ],
    signals: ['.csproj', '.sln'],
  },
]

export async function onboardRepository(rootDir, options = {}) {
  if (options.check) {
    return checkOnboarding(rootDir)
  }

  const timestamp = nowTimestamp()
  const profile = await profileRepository(rootDir)
  const recommendedConfig = options.preset
    ? buildPresetMemoryConfig(options.preset, {
        generatedAt: timestamp,
        source: 'ace:onboard',
        status: options.apply ? 'profiled' : 'recommended',
      })
    : buildRecommendedMemoryConfig(profile, timestamp)

  const profileContent = formatProjectProfile(profile, recommendedConfig, {
    preset: options.preset,
    timestamp,
  })
  const writtenFiles = await writeOnboardingFiles(rootDir, profileContent, recommendedConfig)

  if (options.apply) {
    const appliedConfig = options.preset
      ? recommendedConfig
      : await mergeRecommendedConfig(rootDir, recommendedConfig, timestamp)

    await writeJsonFile(path.join(rootDir, '.ai', 'memory-config.json'), appliedConfig)
    writtenFiles.push('.ai/memory-config.json')
  }

  return {
    applied: Boolean(options.apply),
    detectedEcosystems: profile.ecosystems,
    recommendedConfig,
    recommendedRuleCount:
      recommendedConfig.highRiskPaths.length + recommendedConfig.highRiskKeywords.length,
    status: 'ok',
    writtenFiles,
  }
}

export async function profileRepository(rootDir) {
  const files = await scanRepoFiles(rootDir)
  const fileSet = new Set(files)
  const packageMetadata = await readPackageMetadata(rootDir)
  const contentSignals = await readContentSignals(rootDir, files)
  const signals = new Set([
    ...files.map((file) => path.basename(file)),
    ...packageMetadata.packageSignals,
    ...contentSignals,
  ])
  const ecosystems = []
  const recommendedPaths = [...UNIVERSAL_HIGH_RISK_PATHS]
  const recommendedKeywords = [...UNIVERSAL_HIGH_RISK_KEYWORDS]

  for (const rule of DETECTION_RULES) {
    if (!rule.signals.some((signal) => signalMatches(signal, signals))) {
      continue
    }

    ecosystems.push(rule.ecosystem)

    for (const pathRule of rule.paths) {
      if (files.some((file) => pathRuleMatchesFile(pathRule.pattern, file, fileSet))) {
        recommendedPaths.push(pathRule)
      }
    }
  }

  return {
    ecosystems: ecosystems.length > 0 ? ecosystems : ['Generic repository'],
    filesScanned: files.length,
    packageManager: detectPackageManager(fileSet),
    recommendedKeywords: dedupeKeywordRules(recommendedKeywords),
    recommendedPaths: dedupePathRules(recommendedPaths),
    signals: [...signals].sort(),
  }
}

export function buildRecommendedMemoryConfig(profile, timestamp = nowTimestamp()) {
  return buildMemoryConfig({
    highRiskKeywords: profile.recommendedKeywords,
    highRiskPaths: profile.recommendedPaths,
    profile: {
      detectedEcosystems: profile.ecosystems,
      generatedAt: timestamp,
      source: 'ace:onboard',
      status: 'recommended',
    },
  })
}

async function checkOnboarding(rootDir) {
  const configContent = await readTextIfExists(path.join(rootDir, '.ai', 'memory-config.json'))
  const profileContent = await readTextIfExists(path.join(rootDir, PROJECT_PROFILE_PATH))
  const issues = []

  if (configContent === null) {
    issues.push('Missing .ai/memory-config.json.')
  } else {
    const config = JSON.parse(configContent)

    if (config?._profile?.status !== 'profiled') {
      issues.push('ACE project profile is not applied. Run pnpm ace:onboard -- --apply.')
    }
  }

  if (profileContent === null) {
    issues.push(`Missing ${PROJECT_PROFILE_PATH}. Run pnpm ace:onboard.`)
  }

  if (issues.length > 0) {
    return { issues, status: 'failed' }
  }

  return { issues: [], status: 'ok' }
}

async function mergeRecommendedConfig(rootDir, recommendedConfig, timestamp) {
  const existingContent = await readTextIfExists(path.join(rootDir, '.ai', 'memory-config.json'))
  const existingConfig = existingContent ? JSON.parse(existingContent) : {}

  return {
    ...existingConfig,
    _name: 'ACE (Agentic Context Engine) Configuration',
    _profile: {
      detectedEcosystems: recommendedConfig._profile.detectedEcosystems,
      profiledAt: timestamp,
      source: 'ace:onboard',
      status: 'profiled',
    },
    highRiskKeywords: dedupeKeywordRules([
      ...(existingConfig.highRiskKeywords ?? []),
      ...recommendedConfig.highRiskKeywords,
    ]),
    highRiskPaths: dedupePathRules([
      ...(existingConfig.highRiskPaths ?? []),
      ...recommendedConfig.highRiskPaths,
    ]),
    thresholds: existingConfig.thresholds ?? recommendedConfig.thresholds,
    version: existingConfig.version ?? recommendedConfig.version,
  }
}

async function writeOnboardingFiles(rootDir, profileContent, recommendedConfig) {
  const writtenFiles = []
  const profilePath = path.join(rootDir, PROJECT_PROFILE_PATH)
  const recommendedPath = path.join(rootDir, RECOMMENDED_CONFIG_PATH)

  await writeTextFile(profilePath, profileContent)
  writtenFiles.push(PROJECT_PROFILE_PATH)
  await writeJsonFile(recommendedPath, recommendedConfig)
  writtenFiles.push(RECOMMENDED_CONFIG_PATH)

  return writtenFiles
}

function formatProjectProfile(profile, recommendedConfig, { preset, timestamp }) {
  const ecosystemLines = profile.ecosystems.map((ecosystem) => `- ${ecosystem}`).join('\n')
  const pathLines = recommendedConfig.highRiskPaths
    .slice(0, 20)
    .map((rule) => `- \`${rule.pattern}\` - ${rule.label} (${rule.tier})`)
    .join('\n')
  const keywordLines = recommendedConfig.highRiskKeywords
    .slice(0, 20)
    .map((rule) => `- \`${rule.keyword}\` - ${rule.label} (${rule.tier})`)
    .join('\n')
  const modeLine = preset
    ? `Applied recommendation source: preset \`${preset}\`.`
    : 'Applied recommendation source: repository scan.'

  return `# ACE Project Profile

Generated: ${timestamp}

${modeLine}

## Detected Ecosystems
${ecosystemLines}

## Repository Shape
- Files scanned: ${profile.filesScanned}
- Package manager: ${profile.packageManager}

## Recommended High-Risk Paths
${pathLines}

## Recommended High-Risk Keywords
${keywordLines}

## Next Step
- Review \`.ai/memory-config.recommended.json\`.
- Run \`pnpm ace:onboard -- --apply\` to apply the recommended profile.
- For known Next/tRPC/Drizzle SaaS repos, run \`pnpm ace:onboard -- --preset next-trpc-drizzle-saas --apply\`.
`
}

async function scanRepoFiles(rootDir) {
  const files = []

  async function visit(directory, depth) {
    if (files.length >= MAX_SCANNED_FILES || depth > MAX_SCAN_DEPTH) {
      return
    }

    let entries

    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (files.length >= MAX_SCANNED_FILES) {
        return
      }

      const absolutePath = path.join(directory, entry.name)
      const relativePath = normalizeRepoPath(path.relative(rootDir, absolutePath))

      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) {
          await visit(absolutePath, depth + 1)
        }

        continue
      }

      if (entry.isFile()) {
        files.push(relativePath)
      }
    }
  }

  await visit(rootDir, 0)

  return files.sort()
}

async function readPackageMetadata(rootDir) {
  const packageSignals = []
  const packageContent = await readTextIfExists(path.join(rootDir, 'package.json'))

  if (!packageContent) {
    return { packageSignals }
  }

  try {
    const packageJson = JSON.parse(stripByteOrderMark(packageContent))
    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    }

    packageSignals.push(...Object.keys(dependencies))
  } catch {
    return { packageSignals }
  }

  return { packageSignals }
}

async function readContentSignals(rootDir, files) {
  const signals = []

  for (const file of ['requirements.txt', 'pyproject.toml', 'go.mod']) {
    if (!files.includes(file)) {
      continue
    }

    const content = await readTextIfExists(path.join(rootDir, file))

    if (content?.toLowerCase().includes('fastapi')) {
      signals.push('fastapi')
    }
  }

  return signals
}

function detectPackageManager(fileSet) {
  if (fileSet.has('pnpm-lock.yaml')) {
    return 'pnpm'
  }

  if (fileSet.has('yarn.lock')) {
    return 'yarn'
  }

  if (fileSet.has('package-lock.json')) {
    return 'npm'
  }

  if (fileSet.has('uv.lock')) {
    return 'uv'
  }

  if (fileSet.has('poetry.lock')) {
    return 'poetry'
  }

  if (fileSet.has('go.mod')) {
    return 'go'
  }

  return 'not detected'
}

function signalMatches(signal, signals) {
  if (signal.startsWith('.')) {
    return [...signals].some((value) => value.endsWith(signal))
  }

  return signals.has(signal)
}

function pathRuleMatchesFile(pattern, file, fileSet) {
  if (pattern.includes('*')) {
    return globToRegExp(pattern).test(file)
  }

  return file === pattern || fileSet.has(pattern)
}

function globToRegExp(pattern) {
  const escapedPattern = normalizeRepoPath(pattern)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*')

  return new RegExp(`^${escapedPattern}$`, 'u')
}

function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

function stripByteOrderMark(content) {
  return content.replace(/^\uFEFF/u, '')
}

async function writeTextFile(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, normalizeTrailingNewline(content), 'utf8')
}

async function writeJsonFile(filePath, value) {
  await writeTextFile(filePath, JSON.stringify(value, null, 2))
}

function normalizeTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}

async function main() {
  writeAceBanner()

  const args = parseCliArgs(process.argv.slice(2))
  const rootDir = path.resolve(process.cwd(), getArgValue(args, 'root') ?? '.')
  const preset = getArgValue(args, 'preset')

  if (preset && !getProjectPreset(preset)) {
    throw new Error(`Unknown ACE project preset: ${preset}`)
  }

  const result = await onboardRepository(rootDir, {
    apply: getArgValue(args, 'apply') === 'true',
    check: getArgValue(args, 'check') === 'true',
    preset,
  })

  if (getArgValue(args, 'json') === 'true') {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  if (result.status === 'failed') {
    process.stderr.write('ACE onboarding check failed:\n')

    for (const issue of result.issues) {
      process.stderr.write(`- ${issue}\n`)
    }

    process.exit(1)
  }

  process.stdout.write(
    result.applied
      ? `ACE project profile applied. Updated: ${result.writtenFiles.join(', ')}\n`
      : `ACE project profile generated. Review ${RECOMMENDED_CONFIG_PATH}, then run pnpm ace:onboard -- --apply.\n`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exit(1)
  })
}
