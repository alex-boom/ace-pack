import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
    expect(classification.requiredWorkflow).toContain('Generate pnpm ace report brief.')
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
      'Review .ai/knowledge/tech-docs.md or .ai/knowledge/product-roadmap.md when technical or business state changed.',
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

  it('classifies only staged changes when --staged is used', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-staged-'))
    tempDirs.push(rootDir)

    await writeRepoFile(rootDir, 'README.md', 'base\n')
    await initGitFixture(rootDir)
    await writeRepoFile(rootDir, 'README.md', 'base\nstaged hotfix\n')
    await execFileAsync('git', ['add', 'README.md'], { cwd: rootDir })
    for (let index = 0; index < 8; index += 1) {
      await writeRepoFile(rootDir, `unrelated-${index}.ts`, `export const v${index} = true\n`)
    }

    const parsed = await runClassifyJson(rootDir, ['--staged'])

    expect(parsed.scope).toMatchObject({ mode: 'staged', paths: [] })
    expect(parsed.tier).toBe('small')
    expect(parsed.changedFiles).toEqual(['readme.md'])
  })

  it('classifies only selected working-tree paths when --path is used', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-path-'))
    tempDirs.push(rootDir)

    await writeRepoFile(rootDir, 'src/button.ts', 'export const label = "Save"\n')
    await initGitFixture(rootDir)
    await writeRepoFile(rootDir, 'src/button.ts', 'export const label = "Save now"\n')
    for (let index = 0; index < 8; index += 1) {
      await writeRepoFile(rootDir, `unrelated-${index}.ts`, `export const v${index} = true\n`)
    }

    const full = await runClassifyJson(rootDir)
    const scoped = await runClassifyJson(rootDir, ['--path', 'src/button.ts'])

    expect(full.tier).toBe('large')
    expect(scoped.scope).toMatchObject({ mode: 'working-tree', paths: ['src/button.ts'] })
    expect(scoped.tier).toBe('small')
    expect(scoped.changedFiles).toEqual(['src/button.ts'])
  })

  it('still escalates scoped high-risk paths', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-risk-path-'))
    tempDirs.push(rootDir)

    await writeRepoFile(
      rootDir,
      '.ai/config/memory-config.json',
      JSON.stringify({
        highRiskPaths: [{ label: 'auth boundary', pattern: 'src/auth/**', tier: 'large' }],
        thresholds: baseConfig.thresholds,
        version: 1,
      }),
    )
    await writeRepoFile(rootDir, 'src/auth/session.ts', 'export const timeout = 30\n')
    await initGitFixture(rootDir)
    await writeRepoFile(rootDir, 'src/auth/session.ts', 'export const timeout = 60\n')

    const parsed = await runClassifyJson(rootDir, ['--path', 'src/auth/session.ts'])

    expect(parsed.tier).toBe('large')
    expect(parsed.designReviewRequired).toBe(true)
    expect(parsed.reasons.join('\n')).toContain('auth boundary')
  })

  it('refuses to combine PR refs with local scope flags', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-classify-scope-error-'))
    tempDirs.push(rootDir)

    await writeRepoFile(rootDir, 'README.md', 'base\n')
    await initGitFixture(rootDir)

    const error = await execFileAsync(process.execPath, [
      path.resolve('scripts', 'ai-task-classify.mjs'),
      '--root',
      rootDir,
      '--base',
      'HEAD',
      '--head',
      'HEAD',
      '--staged',
      '--json',
    ]).catch((caught) => caught)

    expect(error.code).toBe(1)
    const parsed = JSON.parse(error.stdout)
    expect(parsed.gitError).toContain('Cannot combine --base/--head')
  })
})

async function runClassifyJson(rootDir: string, args: string[] = []) {
  const { stdout } = await execFileAsync(process.execPath, [
    path.resolve('scripts', 'ai-task-classify.mjs'),
    '--root',
    rootDir,
    '--json',
    ...args,
  ])

  return JSON.parse(stdout)
}

async function initGitFixture(rootDir: string) {
  await execFileAsync('git', ['init'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.email', 'ace@example.com'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.name', 'ACE Test'], { cwd: rootDir })
  await execFileAsync('git', ['add', '.'], { cwd: rootDir })
  await execFileAsync('git', ['commit', '-m', 'Initial fixture'], { cwd: rootDir })
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}
