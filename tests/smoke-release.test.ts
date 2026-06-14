import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { installAcePack } from '../install-ace-pack.mjs'
import { runDogfoodSelfCheck } from '../tools/dogfood-self-check.mjs'
import { runSmokeFakeProjects } from '../tools/smoke-fake-project.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createTempRepo(prefix: string) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), prefix))
  tempDirs.push(rootDir)
  await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep rules.\n')
  return rootDir
}

async function createInstalledDogfoodRepo(prefix = 'ace-dogfood-') {
  const rootDir = await createTempRepo(prefix)

  await installAcePack(rootDir)
  await writeCompleteTaskState(rootDir)
  await initGitRepo(rootDir)

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

async function writeCompleteTaskState(rootDir: string) {
  await writeRepoFile(
    rootDir,
    '.ai/state/current-task.md',
    `# Current Task

## Feature Name
Dogfood fixture

## Lifecycle
Status: complete
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-14 12:00
Ready For Archive: yes

## Goal
Verify that ACE can be applied to a repository that already uses ACE.

## Business Value / Product Alignment
Dogfood self-check protects release readiness before maintainers publish ACE.

## Technical Approach
Option 1:
- Trust package unit tests only.

Option 2:
- Apply the candidate ACE package to an installed repo and run local checks.

Chosen Approach:
- Use candidate self-apply because it validates packaging, install, gate, and hub behavior together.

## Current Status
- [x] Fixture prepared.

## Affected Areas
- .ai
- scripts

## Constraints
- Keep checks local and deterministic.

## Acceptance Criteria
- ACE check, gate, and hub pass after self-apply.

## Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] \`ace:validate\` and \`ace:finish\` passed
`,
  )
  await writeRepoFile(
    rootDir,
    '.ai/state/session-handoff.md',
    `# Session Handoff

## Last Update
2026-06-14 12:00

## What Was Done
- Prepared an installed ACE repo for dogfood self-check.

## Current State
- Candidate self-apply can run.

## Quality Review
Product Alignment:
- Dogfood validation protects release quality.

Architecture:
- The check uses installed scripts rather than source-only assumptions.

Security:
- No network calls or secrets are used.

Code Quality:
- The check covers install sync, memory validation, gate, and hub output.

## Next Steps
- Run dogfood self-check.

## Known Issues
- None.

## Verification
- \`ace:check\` passed.

## Notes
- NPM publish: required before final release; deferred by maintainer.
`,
  )
  await writeRepoFile(
    rootDir,
    '.ai/state/changed-files.md',
    `# Changed Files

[dogfood-fixture]
- Fixture files for release-readiness testing.
`,
  )
  await writeRepoFile(
    rootDir,
    '.ai/knowledge/reflection-log.md',
    `# Reflection Log

## Unresolved

## Resolved

### 2026-06-14 12:00 Dogfood fixture
Status: resolved
- Stuck Point: Release candidates need installed-repo validation.
- Likely Cause: Package tests can miss install sync behavior.
- Proposed Improvement: Run dogfood self-check before final release.
`,
  )
}

describe('release readiness smoke routines', () => {
  it('runs ACE against JS and non-JS fake projects from the local candidate package', async () => {
    const results = await runSmokeFakeProjects({
      keepOnFailure: false,
    })

    expect(results.map((result) => result.caseName)).toEqual(['js', 'non-js'])
    expect(results.every((result) => result.verification.profileStatus === 'profiled')).toBe(true)
    expect(results.every((result) => result.verification.generatedContext)).toBe(true)
    expect(results.every((result) => result.verification.bridges.length === 3)).toBe(true)
    expect(results.every((result) => result.verification.smallAutoCloseout)).toBe(true)
  })

  it('applies the candidate ACE package to an installed repo and reruns core workflow checks', async () => {
    const rootDir = await createInstalledDogfoodRepo()

    const result = await runDogfoodSelfCheck({ rootDir })

    expect(result.passed).toBe(true)
    expect(result.beforeStatus).toEqual([])
    expect(result.afterStatus.every((entry) => entry.path.startsWith('.ai/'))).toBe(true)
  })

  it('blocks dogfood self-check on a dirty repo unless explicitly allowed', async () => {
    const rootDir = await createInstalledDogfoodRepo('ace-dogfood-dirty-')
    await writeRepoFile(rootDir, 'dirty.txt', 'dirty\n')

    await expect(runDogfoodSelfCheck({ rootDir })).rejects.toThrow('requires a clean git worktree')
  })

  it('allows pre-existing dirty paths during an explicit dogfood release-readiness pass', async () => {
    const rootDir = await createInstalledDogfoodRepo('ace-dogfood-allow-dirty-')
    await writeRepoFile(rootDir, 'dirty.txt', 'dirty\n')

    const result = await runDogfoodSelfCheck({ allowDirty: true, rootDir })

    expect(result.passed).toBe(true)
    expect(result.beforeStatus.map((entry) => entry.path)).toContain('dirty.txt')
    expect(result.afterStatus.map((entry) => entry.path)).toContain('dirty.txt')
  })

  it('allows expected IDE bridge creation during dogfood sync', async () => {
    const rootDir = await createInstalledDogfoodRepo('ace-dogfood-bridges-')

    await rm(path.join(rootDir, '.cursorrules'), { force: true })
    await rm(path.join(rootDir, '.windsurfrules'), { force: true })
    await rm(path.join(rootDir, '.github/copilot-instructions.md'), { force: true })
    await git(rootDir, ['add', '-u'])
    await git(rootDir, ['commit', '-m', 'Remove IDE bridges from older install'])

    const result = await runDogfoodSelfCheck({ rootDir })
    const changedPaths = result.afterStatus.map((entry) => entry.path)

    expect(result.passed).toBe(true)
    expect(changedPaths).toContain('.cursorrules')
    expect(changedPaths).toContain('.windsurfrules')
    expect(changedPaths).toContain('.github/copilot-instructions.md')
  })
})
