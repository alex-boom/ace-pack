import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { installAcePack } from '../scripts/ace-install-lib.mjs'
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
      'Fill .ai/state/task-state.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
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
      'Fill .ai/state/task-state.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
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
      'Fill .ai/state/task-state.md Quality Review for product, architecture, security, and code quality.',
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
      path.join(rootDir, '.ai/state/task-state.md'),
      `# Task State

## Lifecycle & Meta

### Feature Name
Small typo fix

### Lifecycle
Status: active
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-14 14:30
Ready For Archive: no

### Goal
Fix a small typo.

### Current Status
- [ ] Fix typo.

### Affected Areas
- README.md

### Constraints
- Keep the change small.

### Acceptance Criteria
- Typo is fixed.

### Completion Checklist
- [ ] Goal completed

## Business Value & Approach

### Business Value / Product Alignment
TODO

### Technical Approach
TODO

## Changed Files / Diff

[README.md]
- Typo fix.

## Handoff & Next Steps

### Last Update
2026-06-14 14:30

### What Was Done
TODO

### Current State
TODO

### Quality Review
TODO

### Next Steps
TODO

### Known Issues
None.

### Verification
TODO

### Notes
TODO
`,
    )
    await execFileAsync('git', ['init'], { cwd: rootDir })
    await execFileAsync('git', ['config', 'user.email', 'ace@example.com'], { cwd: rootDir })
    await execFileAsync('git', ['config', 'user.name', 'ACE Test'], { cwd: rootDir })
    await execFileAsync('git', ['add', '.'], { cwd: rootDir })
    await execFileAsync('git', ['commit', '-m', 'Initial fixture'], { cwd: rootDir })
    await writeFile(path.join(rootDir, 'README.md'), 'changed\n', 'utf8')

    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts/ai-task-finish.mjs')], {
      cwd: rootDir,
    })

    const taskState = await readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')
    const workLog = await readFile(path.join(rootDir, '.ai/knowledge/work-log.md'), 'utf8')
    const archiveFiles = await readdir(path.join(rootDir, '.ai/archive/tasks'))

    expect(taskState).toContain('Status: complete')
    expect(taskState).toContain('Ready For Archive: yes')
    expect(taskState).toContain('Current Phase: Complete')
    expect(taskState).toContain('Next Autonomous Action: No further autonomous action; task is complete.')
    expect(taskState).toContain('Small typo fix')
    expect(taskState).toContain('NPM publish: not required')
    expect(workLog).toContain('ACE auto-closed small task: Small typo fix.')
    expect(workLog).toContain('README.md')
    expect(archiveFiles).toEqual(['.gitkeep'])
  })

  it('marks standard task autonomy complete without archiving', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-finish-standard-'))
    tempDirs.push(rootDir)

    await writeFile(path.join(rootDir, 'AGENTS.md'), '# AGENTS.md\n\n## Project Rules\n\nTest.\n')
    await installAcePack(rootDir)
    await writeFile(path.join(rootDir, '.ai/state/task-state.md'), finishReadyTaskState())
    await initGitFixture(rootDir)
    await writeFile(path.join(rootDir, 'a.ts'), 'export const a = true\n', 'utf8')
    await writeFile(path.join(rootDir, 'b.ts'), 'export const b = true\n', 'utf8')
    await writeFile(path.join(rootDir, 'c.ts'), 'export const c = true\n', 'utf8')

    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts/ai-task-finish.mjs')], {
      cwd: rootDir,
    })

    const taskState = await readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')
    const archiveFiles = await readdir(path.join(rootDir, '.ai/archive/tasks'))

    expect(taskState).toContain('Current Phase: Complete')
    expect(taskState).toContain('Next Autonomous Action: No further autonomous action; task is complete.')
    expect(archiveFiles).toEqual(['.gitkeep'])
  })

  it('archives large task after marking autonomy complete', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-finish-large-'))
    tempDirs.push(rootDir)

    await writeFile(path.join(rootDir, 'AGENTS.md'), '# AGENTS.md\n\n## Project Rules\n\nTest.\n')
    await installAcePack(rootDir)
    await writeFile(path.join(rootDir, '.ai/state/task-state.md'), finishReadyTaskState())
    await writeFile(
      path.join(rootDir, '.ai/knowledge/reflection-log.md'),
      `# Reflection Log

## Unresolved

## Resolved

### 2026-06-14 14:30 Large finish fixture
Status: resolved
- Stuck Point: Large tasks need archived complete state.
- Likely Cause: Archive timing can capture stale lifecycle fields.
- Proposed Improvement: Mark phase complete before archiving.
`,
      'utf8',
    )
    await initGitFixture(rootDir)
    for (let index = 0; index < 8; index += 1) {
      await writeFile(path.join(rootDir, `large-${index}.ts`), `export const v${index} = true\n`, 'utf8')
    }

    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts/ai-task-finish.mjs')], {
      cwd: rootDir,
      env: {
        ...process.env,
        AI_REPORT_SKIP_XML: '1',
      },
    })

    const archiveFiles = await readdir(path.join(rootDir, '.ai/archive/tasks'))
    const archivedTask = archiveFiles.find((fileName) => fileName.endsWith('.md'))

    expect(archivedTask).toBeDefined()
    const archivedContent = await readFile(
      path.join(rootDir, '.ai/archive/tasks', archivedTask ?? ''),
      'utf8',
    )

    expect(archivedContent).toContain('Current Phase: Complete')
    expect(archivedContent).toContain(
      'Next Autonomous Action: No further autonomous action; task is complete.',
    )
  })
})

async function initGitFixture(rootDir: string) {
  await execFileAsync('git', ['init'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.email', 'ace@example.com'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.name', 'ACE Test'], { cwd: rootDir })
  await execFileAsync('git', ['add', '.'], { cwd: rootDir })
  await execFileAsync('git', ['commit', '-m', 'Initial fixture'], { cwd: rootDir })
}

function finishReadyTaskState() {
  return `# Task State

## Lifecycle & Meta

### Feature Name
Finish fixture

### Lifecycle
Status: active
Version: v1
Task Tier: standard
Design Review Required: no
Current Phase: Review
Next Autonomous Action: Run finish.
Started: 2026-06-14 14:30
Ready For Archive: no

### Goal
Verify finish phase behavior.

### Current Status
- [x] Fixture is ready.

### Affected Areas
- src

### Constraints
- Keep checks local.

### Acceptance Criteria
- Finish marks autonomy complete.

### Completion Checklist
- [x] Goal completed

## Business Value & Approach

### Business Value / Product Alignment
This keeps handoff and archive state coherent for agent workflows.

### Technical Approach
Option 1:
- Leave phase unchanged during finish.

Option 2:
- Mark phase complete before reports and archive.

Chosen Approach:
- Mark phase complete because finish means autonomous work is done.

## Changed Files / Diff

[src]
- Fixture files.

## Handoff & Next Steps

### Last Update
2026-06-14 14:30

### What Was Done
- Prepared finish fixture.

### Current State
- Ready to finish.

### Quality Review
Product Alignment:
- Phase metadata supports agent handoff.

Architecture:
- Finish reuses task-state Markdown.

Security:
- No network calls are required.

Code Quality:
- Tests cover standard and large finish paths.

### Next Steps
- Run finish.

### Known Issues
- None.

### Verification
- Fixture prepared.

### Notes
- NPM publish: not required
`
}
