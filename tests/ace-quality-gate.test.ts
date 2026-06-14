import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { ensureAgentMemory } from '../scripts/agent-memory-lib.mjs'
import {
  installPrePushHook,
  runQualityGate,
  writeGithubActionWorkflow,
} from '../scripts/ace-quality-gate.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const gateScriptPath = path.resolve('scripts/ace-quality-gate.mjs')

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createRepo(prefix: string) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), prefix))
  tempDirs.push(rootDir)
  await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep rules.\n')
  return rootDir
}

async function createCompleteGateRepo(prefix = 'ace-gate-') {
  const rootDir = await createRepo(prefix)

  await ensureAgentMemory(rootDir)
  await writeRepoFile(rootDir, '.ai/current-task.md', currentTaskContent())
  await writeRepoFile(rootDir, '.ai/session-handoff.md', handoffContent())
  await writeRepoFile(rootDir, '.ai/reflection-log.md', reflectionLogContent())

  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

async function initGitRepo(rootDir: string) {
  await git(rootDir, ['init'])
  await git(rootDir, ['config', 'user.email', 'ace@example.com'])
  await git(rootDir, ['config', 'user.name', 'ACE Test'])
  await git(rootDir, ['add', '.'])
  await git(rootDir, ['commit', '-m', 'Initial fixture'])
}

async function git(rootDir: string, args: string[]) {
  const { stdout } = await execFileAsync('git', args, { cwd: rootDir })
  return stdout.trim()
}

function currentTaskContent(overrides: { technicalApproach?: string } = {}) {
  return `# Current Task

## Feature Name
Gate fixture

## Lifecycle
Status: complete
Version: v1
Task Tier: standard
Design Review Required: no
Started: 2026-06-14 11:30
Ready For Archive: yes

## Goal
Verify ACE quality gate behavior.

## Business Value / Product Alignment
This protects PR merges by ensuring AI-assisted work leaves useful project memory.

## Technical Approach
${overrides.technicalApproach ?? `Option 1:
- Skip PR validation.

Option 2:
- Reuse ACE memory validation and classification.

Chosen Approach:
- Reuse ACE checks because it keeps gate behavior consistent.`}

## Current Status
- [x] Fixture is ready.

## Affected Areas
- src

## Constraints
- Keep checks local.

## Acceptance Criteria
- Gate reports useful pass/fail output.

## Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] \`ace:validate\` and \`ace:finish\` passed
`
}

function handoffContent(overrides: { qualityReview?: string; verification?: string } = {}) {
  return `# Session Handoff

## Last Update
2026-06-14 11:30

## What Was Done
- Built the gate fixture.

## Current State
- Ready for PR validation.

## Quality Review
${overrides.qualityReview ?? `Product Alignment:
- Gate supports safer merges.

Architecture:
- Gate reuses ACE logic.

Security:
- No network calls are made.

Code Quality:
- Tests cover pass and fail paths.`}

## Next Steps
- Merge when gate passes.

## Known Issues
- None.

## Verification
${overrides.verification ?? '- `npm.cmd test` passed.'}

## Notes
- NPM publish: not required
`
}

function reflectionLogContent() {
  return `# Reflection Log

## Unresolved

## Resolved

### 2026-06-14 11:30 Gate fixture
Status: resolved
- Stuck Point: PR checks need clear failures.
- Likely Cause: CI logs are terse.
- Proposed Improvement: Use actionable gate messages.
`
}

describe('ace quality gate', () => {
  it('passes on complete small-task memory state', async () => {
    const rootDir = await createCompleteGateRepo()

    const result = await runQualityGate(rootDir)

    expect(result.passed).toBe(true)
    expect(result.issues).toEqual([])
    expect(result.classification.tier).toBe('small')
  })

  it('fails with actionable messages when ACE memory is missing', async () => {
    const rootDir = await createRepo('ace-gate-missing-')

    const result = await runQualityGate(rootDir)

    expect(result.passed).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'memory-invalid',
      fix: expect.stringContaining('ace:init'),
    })
  })

  it('fails when handoff verification is missing or placeholder text', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-verification-')

    await writeRepoFile(
      rootDir,
      '.ai/session-handoff.md',
      handoffContent({ verification: '- [List checks that passed or could not be run]' }),
    )

    const result = await runQualityGate(rootDir)

    expect(result.passed).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'handoff-verification-missing',
        message: expect.stringContaining('Verification'),
      }),
    )
  })

  it('requires technical approach notes for high-risk changes', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-high-risk-')
    const memoryConfig = JSON.parse(await readFile(path.join(rootDir, '.ai/memory-config.json'), 'utf8'))
    memoryConfig.highRiskPaths = [
        {
          label: 'Auth',
          pattern: 'src/auth/**',
          requiresDesignReview: true,
          tier: 'large',
        },
      ]

    await writeRepoFile(rootDir, '.ai/memory-config.json', `${JSON.stringify(memoryConfig, null, 2)}\n`)
    await writeRepoFile(rootDir, '.ai/current-task.md', currentTaskContent({ technicalApproach: 'TODO' }))
    await writeRepoFile(rootDir, 'src/auth/token.ts', 'export const token = "initial"\n')
    await initGitRepo(rootDir)
    await writeRepoFile(rootDir, 'src/auth/token.ts', 'export const token = "changed"\n')

    const result = await runQualityGate(rootDir)

    expect(result.passed).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'technical-approach-missing',
        fix: expect.stringContaining('Option 1, Option 2, and Chosen Approach'),
        message: expect.stringContaining('src/auth/token.ts'),
      }),
    )
  })

  it('requires quality review notes for standard or large changes', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-standard-')

    await writeRepoFile(rootDir, '.ai/session-handoff.md', handoffContent({ qualityReview: 'TODO' }))
    await initGitRepo(rootDir)
    await writeRepoFile(rootDir, 'a.ts', 'export const a = true\n')
    await writeRepoFile(rootDir, 'b.ts', 'export const b = true\n')
    await writeRepoFile(rootDir, 'c.ts', 'export const c = true\n')

    const result = await runQualityGate(rootDir)

    expect(result.classification.tier).toBe('standard')
    expect(result.passed).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'quality-review-missing',
        message: expect.stringContaining('standard task detected'),
      }),
    )
  })

  it('supports base/head PR diff classification', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-pr-')

    await writeRepoFile(rootDir, 'README.md', 'Initial\n')
    await initGitRepo(rootDir)
    const baseRef = await git(rootDir, ['rev-parse', 'HEAD'])
    await writeRepoFile(rootDir, 'README.md', 'Changed\n')
    await git(rootDir, ['add', 'README.md'])
    await git(rootDir, ['commit', '-m', 'Change readme'])

    const result = await runQualityGate(rootDir, {
      baseRef,
      headRef: 'HEAD',
    })

    expect(result.passed).toBe(true)
    expect(result.classification.changedFiles).toEqual(['readme.md'])
    expect(result.classification.baseRef).toBe(baseRef)
    expect(result.classification.headRef).toBe('HEAD')
  })

  it('handles missing git refs without crashing', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-missing-ref-')

    await initGitRepo(rootDir)

    const result = await runQualityGate(rootDir, {
      baseRef: 'missing-ref',
      headRef: 'HEAD',
    })

    expect(result.passed).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'git-diff-unavailable',
        fix: expect.stringContaining('Fetch the PR base ref'),
      }),
    )
  })

  it('prints parseable JSON from the CLI', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-json-')

    const { stdout } = await execFileAsync(process.execPath, [
      gateScriptPath,
      '--root',
      rootDir,
      '--json',
    ])
    const parsed = JSON.parse(stdout)

    expect(parsed.passed).toBe(true)
    expect(parsed.classification.tier).toBe('small')
  })

  it('installs a native pre-push hook idempotently', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-hook-')

    await mkdir(path.join(rootDir, '.git'), { recursive: true })

    const firstRun = await installPrePushHook(rootDir)
    const secondRun = await installPrePushHook(rootDir)
    const hookContent = await readFile(path.join(rootDir, '.git/hooks/pre-push'), 'utf8')

    expect(firstRun.action).toBe('created')
    expect(secondRun.action).toBe('unchanged')
    expect(hookContent).toContain('ACE QUALITY GATE HOOK')
    expect(hookContent).toContain('npm run ace:gate')
  })

  it('does not overwrite existing non-ACE pre-push hooks', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-existing-hook-')

    await writeRepoFile(rootDir, '.git/hooks/pre-push', '#!/bin/sh\necho custom\n')

    const result = await installPrePushHook(rootDir)
    const existingHook = await readFile(path.join(rootDir, '.git/hooks/pre-push'), 'utf8')
    const sampleHook = await readFile(path.join(rootDir, '.git/hooks/pre-push.ace.sample'), 'utf8')

    expect(result.action).toBe('sample-written')
    expect(existingHook).toBe('#!/bin/sh\necho custom\n')
    expect(sampleHook).toContain('npm run ace:gate')
  })

  it('writes a GitHub Actions workflow', async () => {
    const rootDir = await createCompleteGateRepo('ace-gate-action-')

    const result = await writeGithubActionWorkflow(rootDir)
    const workflow = await readFile(path.join(rootDir, '.github/workflows/ace-quality-gate.yml'), 'utf8')

    expect(result).toEqual({
      action: 'written',
      path: '.github/workflows/ace-quality-gate.yml',
    })
    expect(workflow).toContain('node-version: 20')
    expect(workflow).toContain('npm run ace:gate -- --base origin/${{ github.base_ref }} --head HEAD')
  })
})
