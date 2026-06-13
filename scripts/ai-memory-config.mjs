import path from 'node:path'

import { readTextIfExists } from './ai-memory-utils.mjs'

const DEFAULT_MEMORY_CONFIG = {
  version: 1,
  thresholds: {
    small: {
      maxFiles: 2,
      maxDiffLines: 80,
    },
    large: {
      minFiles: 8,
      minDiffLines: 300,
    },
  },
  highRiskPaths: [],
  highRiskKeywords: [],
}

const VALID_TIERS = new Set(['small', 'standard', 'large'])

export async function readMemoryConfig(rootDir) {
  const configPath = path.join(rootDir, '.ai', 'memory-config.json')
  const content = await readTextIfExists(configPath)

  if (content === null) {
    return DEFAULT_MEMORY_CONFIG
  }

  return normalizeMemoryConfig(JSON.parse(content))
}

export function normalizeMemoryConfig(config) {
  const thresholds = {
    small: {
      maxFiles: numberOrDefault(config?.thresholds?.small?.maxFiles, 2),
      maxDiffLines: numberOrDefault(config?.thresholds?.small?.maxDiffLines, 80),
    },
    large: {
      minFiles: numberOrDefault(config?.thresholds?.large?.minFiles, 8),
      minDiffLines: numberOrDefault(config?.thresholds?.large?.minDiffLines, 300),
    },
  }

  return {
    version: numberOrDefault(config?.version, 1),
    thresholds,
    highRiskPaths: normalizeRules(config?.highRiskPaths),
    highRiskKeywords: normalizeKeywordRules(config?.highRiskKeywords),
  }
}

export function getRiskMatches({ changedFiles, config, diffText = '' }) {
  const matches = []
  const normalizedFiles = changedFiles.map(normalizeRepoPath)
  const normalizedDiffText = diffText.toLowerCase()

  for (const rule of config.highRiskPaths) {
    const matchedFiles = normalizedFiles.filter((filePath) =>
      matchConfigPattern(filePath, rule.pattern),
    )

    if (matchedFiles.length > 0) {
      matches.push({
        kind: 'path',
        label: rule.label,
        matched: matchedFiles,
        pattern: rule.pattern,
        requiresDesignReview: rule.requiresDesignReview,
        tier: rule.tier,
      })
    }
  }

  for (const rule of config.highRiskKeywords) {
    const keyword = rule.keyword.toLowerCase()
    const pathMatches = normalizedFiles.filter((filePath) => keywordMatches(filePath, keyword))
    const diffMatches = keywordMatches(normalizedDiffText, keyword)

    if (pathMatches.length > 0 || diffMatches) {
      matches.push({
        kind: 'keyword',
        label: rule.label,
        matched: pathMatches,
        pattern: rule.keyword,
        requiresDesignReview: rule.requiresDesignReview,
        tier: rule.tier,
      })
    }
  }

  return matches
}

export function matchConfigPattern(filePath, pattern) {
  return globToRegExp(normalizeRepoPath(pattern)).test(normalizeRepoPath(filePath))
}

export function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase()
}

function normalizeRules(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((rule) => {
      if (typeof rule === 'string') {
        return normalizeRule({ pattern: rule })
      }

      return normalizeRule(rule)
    })
    .filter((rule) => rule.pattern.length > 0)
}

function normalizeKeywordRules(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((rule) => {
      if (typeof rule === 'string') {
        return normalizeRule({ keyword: rule, label: rule })
      }

      return normalizeRule(rule)
    })
    .filter((rule) => rule.keyword.length > 0)
}

function normalizeRule(rule) {
  const tier = VALID_TIERS.has(rule?.tier) ? rule.tier : 'large'
  const pattern = typeof rule?.pattern === 'string' ? rule.pattern : ''
  const keyword = typeof rule?.keyword === 'string' ? rule.keyword : ''
  const label = typeof rule?.label === 'string' ? rule.label : pattern || keyword

  return {
    keyword,
    label,
    pattern,
    requiresDesignReview: rule?.requiresDesignReview !== false,
    tier,
  }
}

function numberOrDefault(value, fallback) {
  return Number.isFinite(value) ? value : fallback
}

function globToRegExp(pattern) {
  const escapedPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*')

  return new RegExp(`^${escapedPattern}$`, 'u')
}

function keywordMatches(value, keyword) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}($|[^a-z0-9])`, 'iu').test(value)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
