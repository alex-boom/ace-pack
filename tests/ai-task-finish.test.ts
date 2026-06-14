import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { installAcePack } from '../install-ace-pack.mjs'
import { validateFinishRequirements } from '../scripts/ai-task-finish.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

const currentTaskWithReview = `# Current Task

## Business Value / Product Alignment
This improves support quality by making risky work explicit before implementation.

## Technical Approach
Option 1:
- Keep the process manual, which is fast but easy to skip.

Option 2:
- Validate closeout by task tier, which adds guardrails without CI blockers.

Chosen Approach:
- Use tier validation because it preserves speed for small tasks and rigor for risky work.
`

const handoffWithQuality = `# Session Handoff

## Quality Review
Product Alignment:
- The work preserves the stated product outcome.

Architecture:
- The chosen local script pattern fits the existing ACE workflow.

Security:
- Security-sensitive areas are surfaced for explicit review.

Code Quality:
- The implementation stays split into focused files and has targeted tests.
`

const reflectionLog = `# Reflection Log

## Unresolved

### 2026-06-12 13:00 Repeated closeout overhead on small tasks
Status: unresolved
- Stuck Point: Small tasks paid the same documentation cost as large tasks.
- Likely Cause: The workflow lacked a task-tier classifier.
- Proposed Improvement: Use adaptive closeout gates.

## Resolved
`

describe('validateFinishRequirements', () => {
  it('allows small low-risk tasks without business value or quality review ceremony', () => {
    const missing = validateFinishRequirements({
      classification: {
        designReviewRequired: false,
        riskMatches: [],
        tier: 'small',
      },
      currentTaskContent: '# Current Task\n\n## Business Value / Product Alignment\nTODO\n',
      handoffContent: '# Session Handoff\n\n## Quality Review\nTODO\n',
      reflectionLogContent: '# Reflection Log\n\n## Unresolved\n\n## Resolved\n',
    })

    expect(missing).toEqual([])
  })

  it('blocks large tasks without design review', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'large' },
      currentTaskContent: currentTaskWithReview.replace('Option 2:', 'Second path:'),
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/current-task.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  })

  it('blocks high-risk standard tasks without design review', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'standard' },
      currentTaskContent: currentTaskWithReview.replace('Chosen Approach:', 'Decision:'),
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/current-task.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  })

  it('requires quality review notes for standard tasks', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: false, tier: 'standard' },
      currentTaskContent: currentTaskWithReview,
      handoffContent: '# Session Handoff\n\n## Quality Review\n[Add content here]\n',
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/session-handoff.md Quality Review for product, architecture, security, and code quality.',
    )
  })

  it('passes when large-task closeout notes are present', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'large' },
      currentTaskContent: currentTaskWithReview,
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toEqual([])
  })
})

describe('ace:finish small auto-closeout', () => {
  it('auto-writes compact closeout for small low-risk tasks without changing lifecycle', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-finish-small-'))
    tempDirs.push(rootDir)

    await writeFile(path.join(rootDir, 'AGENTS.md'), '# AGENTS.md\n\n## Project Rules\n\nTest.\n')
    await installAcePack(rootDir)
    await writeFile(
      path.join(rootDir, '.ai/current-task.md'),
      `# Current Task

## Feature Name
Small typo fix

## Lifecycle
Status: active
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-14 14:30
Ready For Archive: no

## Goal
Fix a small typo.

## Business Value / Product Alignment
TODO

## Technical Approach
TODO

## Current Status
- [ ] Fix typo.

## Affected Areas
- README.md

## Constraints
- Keep the change small.

## Acceptance Criteria
- Typo is fixed.

## Completion Checklist
- [ ] Goal completed
`,
    )
    await writeFile(
      path.join(rootDir, '.ai/session-handoff.md'),
      `# Session Handoff

## Last Update
2026-06-14 14:30

## What Was Done
TODO

## Current State
TODO

## Quality Review
TODO

## Next Steps
TODO

## Known Issues
None.

## Verification
TODO

## Notes
TODO
`,
    )

    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts/ai-task-finish.mjs')], {
      cwd: rootDir,
    })

    const currentTask = await readFile(path.join(rootDir, '.ai/current-task.md'), 'utf8')
    const handoff = await readFile(path.join(rootDir, '.ai/session-handoff.md'), 'utf8')
    const changedFiles = await readFile(path.join(rootDir, '.ai/changed-files.md'), 'utf8')
    const workLog = await readFile(path.join(rootDir, '.ai/work-log.md'), 'utf8')
    const archiveFiles = await readdir(path.join(rootDir, '.ai/archive/tasks'))

    expect(currentTask).toContain('Status: active')
    expect(currentTask).toContain('Ready For Archive: no')
    expect(handoff).toContain('ACE small-task auto-closeout')
    expect(handoff).toContain('No explicit verification was recorded')
    expect(handoff).toContain('NPM publish: not required')
    expect(changedFiles).toContain('[No working-tree changes]')
    expect(workLog).toContain('ACE auto-closed a small low-risk task.')
    expect(archiveFiles).toEqual(['.gitkeep'])
  })
})
