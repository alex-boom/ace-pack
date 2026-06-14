export const DEFAULT_THRESHOLDS = {
  large: {
    minDiffLines: 300,
    minFiles: 8,
  },
  small: {
    maxDiffLines: 80,
    maxFiles: 2,
  },
}

export const UNIVERSAL_HIGH_RISK_PATHS = [
  { label: 'agent instructions', pattern: 'AGENTS.md', tier: 'large' },
  { label: 'agent instructions', pattern: 'CLAUDE.md', tier: 'large' },
  { label: 'agent memory workflow', pattern: '.ai/**', tier: 'large' },
  { label: 'CI workflow', pattern: '.github/workflows/**', tier: 'large' },
  { label: 'CI workflow', pattern: '.gitlab-ci.yml', tier: 'large' },
  { label: 'deployment configuration', pattern: 'Dockerfile', tier: 'large' },
  { label: 'deployment configuration', pattern: 'docker-compose*', tier: 'large' },
  { label: 'deployment configuration', pattern: 'compose.y*ml', tier: 'large' },
  { label: 'automation scripts', pattern: 'scripts/**', tier: 'large' },
  { label: 'request middleware', pattern: '**/middleware.*', tier: 'large' },
  { label: 'database migration', pattern: '**/migrations/**', tier: 'large' },
  { label: 'secret handling', pattern: '**/*secret*', tier: 'large' },
  { label: 'token handling', pattern: '**/*token*', tier: 'large' },
  { label: 'token or crypto handling', pattern: '**/*crypto*', tier: 'large' },
  { label: 'authentication', pattern: '**/*auth*', tier: 'large' },
]

export const UNIVERSAL_HIGH_RISK_KEYWORDS = [
  { keyword: 'auth', label: 'authentication', tier: 'large' },
  { keyword: 'authentication', label: 'authentication', tier: 'large' },
  { keyword: 'permission', label: 'permissions', tier: 'large' },
  { keyword: 'permissions', label: 'permissions', tier: 'large' },
  { keyword: 'secret', label: 'secret handling', tier: 'large' },
  { keyword: 'secrets', label: 'secret handling', tier: 'large' },
  { keyword: 'credential', label: 'credential handling', tier: 'large' },
  { keyword: 'credentials', label: 'credential handling', tier: 'large' },
  { keyword: 'password', label: 'password handling', tier: 'large' },
  { keyword: 'passwords', label: 'password handling', tier: 'large' },
  { keyword: 'token', label: 'token handling', tier: 'large' },
  { keyword: 'tokens', label: 'token handling', tier: 'large' },
  { keyword: 'crypto', label: 'token or crypto handling', tier: 'large' },
  { keyword: 'migration', label: 'database migration', tier: 'large' },
  { keyword: 'migrations', label: 'database migration', tier: 'large' },
  { keyword: 'environment', label: 'environment isolation', tier: 'large' },
  { keyword: 'production', label: 'production safety', tier: 'large' },
  { keyword: 'deploy', label: 'deployment', tier: 'large' },
  { keyword: 'delete', label: 'destructive operation', tier: 'standard' },
  { keyword: 'destroy', label: 'destructive operation', tier: 'standard' },
]

const NEXT_TRPC_DRIZZLE_PATHS = [
  { label: 'auth package', pattern: 'packages/auth/**', tier: 'large' },
  { label: 'database schema', pattern: 'packages/db/src/schema/**', tier: 'large' },
  { label: 'database migration', pattern: 'packages/db/migrations/**', tier: 'large' },
  { label: 'database migration', pattern: 'packages/db/drizzle/**', tier: 'large' },
  { label: 'tRPC router', pattern: 'packages/api/src/routers/**', tier: 'large' },
  { label: 'Next.js middleware', pattern: 'middleware.ts', tier: 'large' },
  { label: 'Next.js middleware', pattern: '**/middleware.ts', tier: 'large' },
  { label: 'tenant isolation', pattern: '**/*tenant*', tier: 'large' },
]

const NEXT_TRPC_DRIZZLE_KEYWORDS = [
  { keyword: 'tenant', label: 'tenant isolation', tier: 'large' },
  { keyword: 'tenancy', label: 'tenant isolation', tier: 'large' },
]

export const PROJECT_PRESETS = {
  'next-trpc-drizzle-saas': {
    description: 'Next.js + tRPC + Drizzle SaaS monorepo risk profile.',
    highRiskKeywords: dedupeKeywordRules([
      ...UNIVERSAL_HIGH_RISK_KEYWORDS,
      ...NEXT_TRPC_DRIZZLE_KEYWORDS,
    ]),
    highRiskPaths: dedupePathRules([...UNIVERSAL_HIGH_RISK_PATHS, ...NEXT_TRPC_DRIZZLE_PATHS]),
    id: 'next-trpc-drizzle-saas',
    name: 'Next/tRPC/Drizzle SaaS',
  },
}

export const NEUTRAL_MEMORY_CONFIG = buildMemoryConfig({
  highRiskKeywords: UNIVERSAL_HIGH_RISK_KEYWORDS,
  highRiskPaths: UNIVERSAL_HIGH_RISK_PATHS,
  profile: {
    note: 'Run pnpm ace onboard to profile this repository and apply project-specific risk rules.',
    status: 'unprofiled',
  },
})

export function getProjectPreset(id) {
  return PROJECT_PRESETS[id] ?? null
}

export function buildPresetMemoryConfig(id, profile = {}) {
  const preset = getProjectPreset(id)

  if (!preset) {
    throw new Error(`Unknown ACE project preset: ${id}`)
  }

  return buildMemoryConfig({
    highRiskKeywords: preset.highRiskKeywords,
    highRiskPaths: preset.highRiskPaths,
    profile: {
      preset: id,
      status: 'profiled',
      ...profile,
    },
  })
}

export function buildMemoryConfig({ highRiskKeywords, highRiskPaths, profile }) {
  return {
    _name: 'ACE (Agentic Context Engine) Configuration',
    _profile: profile,
    highRiskKeywords: dedupeKeywordRules(highRiskKeywords),
    highRiskPaths: dedupePathRules(highRiskPaths),
    thresholds: DEFAULT_THRESHOLDS,
    version: 1,
  }
}

export function dedupePathRules(rules) {
  const seen = new Set()
  const result = []

  for (const rule of rules) {
    const key = `${rule.pattern}:${rule.tier}:${rule.label}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(rule)
  }

  return result
}

export function dedupeKeywordRules(rules) {
  const seen = new Set()
  const result = []

  for (const rule of rules) {
    const key = `${rule.keyword}:${rule.tier}:${rule.label}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(rule)
  }

  return result
}
