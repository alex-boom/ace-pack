import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const tempDirs: string[] = []

async function createReportFixture() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ai-report-fixture-'))
  const aiDir = path.join(rootDir, '.ai')

  tempDirs.push(rootDir)

  await mkdir(aiDir, { recursive: true })
  await writeFile(
    path.join(rootDir, 'package.json'),
    JSON.stringify({ name: 'fixture-repo' }, null, 2),
    'utf8',
  )
  await writeFile(
    path.join(rootDir, 'AGENTS.md'),
    `# AGENTS.md

## Stack (non-negotiable)

Next.js 16 • TypeScript strict • Vitest

## Architecture rules

- Keep it simple.
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'current-task.md'),
    `# Current Task

## Feature Name
Compact reports

## Goal
Keep reports short and reliable.

## Lifecycle
Status: in_progress
Version: v99
Task Tier: standard
Design Review Required: no
Started: 2026-04-24 12:00
Ready For Archive: no

## Business Value / Product Alignment
This keeps agent handoffs fast without losing important context.

## Technical Approach
Option 1:
- Keep reports unchanged.

Option 2:
- Add compact metadata for adaptive workflows.

Chosen Approach:
- Add compact metadata because it improves startup context.

## Current Status
- [x] Report scripts exist.

## Completion Checklist
- [x] Reports generated
- [ ] Final approval
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'session-handoff.md'),
    `# Session Handoff

## Last Update
2026-04-24 12:05

## What Was Done
- Tightened report output.

## Current State
- Report scripts are available.

## Quality Review
Product Alignment:
- Reports preserve the stated handoff goal.

Architecture:
- Report scripts stay local and derive from .ai files.

Security:
- No sensitive token data is included.

Code Quality:
- Output remains compact and covered by tests.

## Next Steps
- Keep changes minimal.

## Known Issues
- XML generation depends on repomix.

## Verification
- \`pnpm.cmd lint\` passed.
- \`pnpm.cmd test\` passed.
- \`pnpm.cmd agent-memory:check\` passed in
  \`D:\\All\\alex-work\\tmp\\starter-smoke\`.
- Loaded \`/dashboard\` in the browser.
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'decisions.md'),
    `# Decisions

## 2026-04-24 12:10 (reporting)

Decision:
- Keep reports compact.

Reason:
- Token cost matters.

Impact:
- Prefer summaries over repetition.

## 2026-04-24 12:30 (release)

Decision:
- Use the latest durable decision in generated reports.

Reason:
- Handoffs should surface the newest policy.

Impact:
- Brief and full reports should not pin old decisions.
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'changed-files.md'),
    `# Changed Files

[Historical task - 2026-04-24 10:00]
- Old summary heading.

[README.md]
- Updated docs.

[scripts/ai-report.mjs]
- Tightened report output.

[D:\\All\\alex-work\\tools\\agent-memory-pack\\scripts\\ai-report.mjs]
- Synced toolkit copy.
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'work-log.md'),
    `# Work Log

## 2026-04-24 12:12

- Tightened report output.
`,
    'utf8',
  )
  await writeFile(
    path.join(aiDir, 'reflection-log.md'),
    `# Reflection Log

## Unresolved

### 2026-04-24 12:20 Reports can hide recurring friction
Status: unresolved
- Stuck Point: New sessions did not see prior process issues.
- Likely Cause: Brief reports omitted reflection entries.
- Proposed Improvement: Surface unresolved reflections in the brief report.

## Resolved
`,
    'utf8',
  )

  return rootDir
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('ai report scripts', () => {
  it('generates compact brief and full reports with normalized metadata', async () => {
    const rootDir = await createReportFixture()
    const briefScriptPath = path.join(process.cwd(), 'scripts', 'ai-report-brief.mjs')
    const fullScriptPath = path.join(process.cwd(), 'scripts', 'ai-report.mjs')

    await execFileAsync(process.execPath, [briefScriptPath, rootDir], {
      cwd: process.cwd(),
    })
    await execFileAsync(process.execPath, [fullScriptPath, rootDir], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        AI_REPORT_SKIP_XML: '1',
      },
    })

    const briefReport = await readFile(path.join(rootDir, '.ai', 'report-brief.md'), 'utf8')
    const fullReport = await readFile(path.join(rootDir, '.ai', 'report-full.md'), 'utf8')

    expect(briefReport).toContain('## Report Metadata')
    expect(briefReport).toContain('Freshness: Fresh')
    expect(briefReport).toContain('Current task version: v99')
    expect(briefReport).toContain('Current task tier: standard')
    expect(briefReport).toContain('## Business Value')
    expect(briefReport).toContain('Reports can hide recurring friction')
    expect(briefReport).toContain('Verification level: smoke-tested')
    expect(briefReport).toContain('Use the latest durable decision in generated reports.')
    expect(briefReport).not.toContain('Keep reports compact.')
    expect(briefReport).toContain('Next.js 16 | TypeScript strict | Vitest')
    expect(briefReport).not.toContain('Historical task - 2026-04-24 10:00')
    expect(briefReport).toContain(
      '`D:\\All\\alex-work\\tools\\agent-memory-pack\\scripts\\ai-report.mjs`',
    )
    expect(briefReport).toContain('`scripts/ai-report.mjs`')
    expect(briefReport).toContain('`pnpm.cmd agent-memory:check` passed in')
    expect(briefReport).toContain('`D:\\All\\alex-work\\tmp\\starter-smoke`.')

    expect(fullReport).toContain('## Report Metadata')
    expect(fullReport).toContain('Verification level: smoke-tested')
    expect(fullReport).toContain('## Verification')
    expect(fullReport).toContain('## Technical Approach')
    expect(fullReport).toContain('## Quality Review')
    expect(fullReport).toContain('Use the latest durable decision in generated reports.')
    expect(fullReport).not.toContain('Keep reports compact.')
    expect(fullReport).toContain('Reports can hide recurring friction')
    expect(fullReport).toContain('`pnpm.cmd agent-memory:check` passed in')
    expect(fullReport).toContain('Loaded `/dashboard` in the browser.')
    expect(fullReport).toContain('Next.js 16 | TypeScript strict | Vitest')
    expect(fullReport).toContain('XML bundle skipped because `AI_REPORT_SKIP_XML=1`.')
  })
})
