import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { normalizeMemoryConfig } from '../scripts/ai-memory-config.mjs'
import { ACE_BANNER } from '../scripts/ai-memory-utils.mjs'
import { classifyTask } from '../scripts/ai-task-classify.mjs'

const execFileAsync = promisify(execFile)
const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

const baseConfig = normalizeMemoryConfig({
  thresholds: {
    small: {
      maxDiffLines: 80,
      maxFiles: 2,
    },
    large: {
      minDiffLines: 300,
      minFiles: 8,
    },
  },
})

describe('normalizeMemoryConfig', () => {
  it('ignores ACE metadata while preserving behavior fields', () => {
    const config = normalizeMemoryConfig({
      _name: 'ACE (Agentic Context Engine) Configuration',
      highRiskPaths: [{ pattern: 'scripts/**', tier: 'large', label: 'automation scripts' }],
      thresholds: {
        small: {
          maxDiffLines: 40,
          maxFiles: 1,
        },
      },
    })

    expect(config.thresholds.small.maxFiles).toBe(1)
    expect(config.thresholds.small.maxDiffLines).toBe(40)
    expect(config.thresholds.large.minFiles).toBe(8)
    expect(config.highRiskPaths).toHaveLength(1)
  })
})

describe('classifyTask', () => {
  it('keeps tiny low-risk changes small', () => {
    const classification = classifyTask({
      changedFiles: ['apps/web/src/app/page.tsx'],
      config: baseConfig,
      diffLineCount: 12,
    })

    expect(classification.tier).toBe('small')
    expect(classification.designReviewRequired).toBe(false)
    expect(classification.requiredWorkflow).toContain('Generate pnpm ace:report:brief.')
  })

  it('classifies large changes by configured thresholds', () => {
    const classification = classifyTask({
      changedFiles: Array.from({ length: 8 }, (_, index) => `src/file-${index}.ts`),
      config: baseConfig,
      diffLineCount: 120,
    })

    expect(classification.tier).toBe('large')
    expect(classification.designReviewRequired).toBe(true)
    expect(classification.requiredWorkflow).toContain(
      'Review .ai/tech-docs.md or .ai/product-roadmap.md when technical or business state changed.',
    )
  })

  it('uses configured risk paths instead of hardcoded project paths', () => {
    const config = normalizeMemoryConfig({
      highRiskPaths: [{ pattern: 'custom/secure/**', tier: 'large', label: 'custom secure area' }],
      thresholds: baseConfig.thresholds,
    })
    const configuredPath = classifyTask({
      changedFiles: ['custom/secure/session.ts'],
      config,
      diffLineCount: 8,
    })
    const hardcodedLookingPath = classifyTask({
      changedFiles: ['packages/auth/session.ts'],
      config: normalizeMemoryConfig({ thresholds: baseConfig.thresholds }),
      diffLineCount: 8,
    })

    expect(configuredPath.tier).toBe('large')
    expect(configuredPath.reasons.join('\n')).toContain('custom secure area')
    expect(hardcodedLookingPath.tier).toBe('small')
  })

  it('requires design review for high-risk standard tasks', () => {
    const config = normalizeMemoryConfig({
      highRiskPaths: [{ pattern: 'src/payments/**', tier: 'standard', label: 'payments' }],
      thresholds: baseConfig.thresholds,
    })
    const classification = classifyTask({
      changedFiles: ['src/payments/model.ts'],
      config,
      diffLineCount: 20,
    })

    expect(classification.tier).toBe('standard')
    expect(classification.designReviewRequired).toBe(true)
  })

  it('requires a reason when overriding the detected tier', () => {
    expect(() =>
      classifyTask({
        changedFiles: Array.from({ length: 8 }, (_, index) => `src/file-${index}.ts`),
        config: baseConfig,
        diffLineCount: 120,
        overrideTier: 'standard',
      }),
    ).toThrow('Task tier override requires --reason.')
  })
})

describe('ai-task-classify CLI', () => {
  it('writes the ACE banner to stderr and keeps json stdout parseable', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-'))
    tempDirs.push(rootDir)

    const { stderr, stdout } = await execFileAsync(process.execPath, [
      path.resolve('scripts', 'ai-task-classify.mjs'),
      '--root',
      rootDir,
      '--json',
    ])
    const parsed = JSON.parse(stdout) as { tier?: string }

    expect(stderr).toContain(ACE_BANNER)
    expect(stdout).not.toContain('[ACE]')
    expect(parsed.tier).toBe('small')
  })

  it('keeps normal classification output on stdout', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-'))
    tempDirs.push(rootDir)

    const { stderr, stdout } = await execFileAsync(process.execPath, [
      path.resolve('scripts', 'ai-task-classify.mjs'),
      '--root',
      rootDir,
    ])

    expect(stderr).toContain(ACE_BANNER)
    expect(stdout).toContain('AI task classification')
  })
})
