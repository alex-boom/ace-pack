import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import {
  GENERATED_CONTEXT_PATH,
  HUB_MENU,
  generateContextPayload,
  listHubModes,
} from '../scripts/ace-hub.mjs'
import { REVIEW_SYSTEM_INSTRUCTION } from '../scripts/ace-hub-review.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const hubScriptPath = path.resolve('scripts/ace-hub.mjs')

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createHubRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-hub-'))
  tempDirs.push(rootDir)

  await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\nRules.\n')
  await writeRepoFile(
    rootDir,
    '.ai/report-brief.md',
    '# AI Brief Report\n\n## Start Snapshot\n- Branch: main\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/task-state.md',
    `# Task State

## Lifecycle & Meta

### Feature Name
Hub fixture

### Lifecycle
Status: active
Version: v1
Task Tier: small
Design Review Required: no
Current Phase: Implementation
Next Autonomous Action: Continue hub fixture implementation.
Started: 2026-06-14 12:00
Ready For Archive: no

### Goal
Task notes.

### Acceptance Criteria
- Hub review payload includes task intent.

### Completion Checklist
- [ ] Finish hub fixture.

## Business Value & Approach

### Business Value / Product Alignment
Hub tests need context.

### Technical Approach
Fixture.

## Changed Files / Diff

[README.md]
- Updated docs.

## Handoff & Next Steps

### Next Steps
- Continue.

### Verification
- \`npm.cmd test\`
`,
  )
  await writeRepoFile(
    rootDir,
    '.ai/reflection-log.md',
    '# Reflection Log\n\n## Unresolved\n\n## Resolved\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/tech-docs.md',
    '# Technical Docs\n\n## Architecture\nArchitecture notes.\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/decisions.md',
    '# Decisions\n\nDecision:\n- Keep ACE portable.\nImpact:\n- No package coupling.\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/product-roadmap.md',
    '# Product Roadmap\n\n## Business Goals\nBusiness notes.\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/project-conventions.md',
    '# Project Conventions and Pattern Registry\n\n## Summary\nConventions.\n',
  )
  await writeRepoFile(rootDir, '.ai/work-log.md', '# Work Log\n\n## 2026-06-14\n- Work.\n')

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
  await git(rootDir, ['commit', '-m', 'Initial hub fixture'])
}

async function git(rootDir: string, args: string[]) {
  await execFileAsync('git', args, {
    cwd: rootDir,
  })
}

describe('generateContextPayload', () => {
  it('keeps numeric coder context compatible and puts report brief first', async () => {
    const rootDir = await createHubRepo()

    const result = await generateContextPayload(rootDir, '1')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.mode.id).toBe('start')
    expect(result.includedFiles).toEqual([
      '.ai/generated/report-brief.md',
      '.ai/knowledge/project-conventions.md',
      '.ai/state/task-state.md',
      '.ai/knowledge/reflection-log.md',
    ])
    expect(generatedContent).toContain('# ACE Hub Context')
    expect(generatedContent).toContain('- Mode: start (Start / AI Coder Context)')
    expect(generatedContent).toContain('- Current Phase: Implementation')
    expect(generatedContent).toContain(
      '- Next Autonomous Action: Continue hub fixture implementation.',
    )
    expect(generatedContent.indexOf('# --- FILE: .ai/generated/report-brief.md ---')).toBeLessThan(
      generatedContent.indexOf('# --- FILE: .ai/state/task-state.md ---'),
    )
  })

  it('keeps coder context usable before a report brief exists', async () => {
    const rootDir = await createHubRepo()

    await unlink(path.join(rootDir, '.ai', 'report-brief.md'))

    const result = await generateContextPayload(rootDir, 'coder')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.mode.id).toBe('start')
    expect(result.includedFiles).toEqual([
      '.ai/knowledge/project-conventions.md',
      '.ai/state/task-state.md',
      '.ai/knowledge/reflection-log.md',
    ])
    expect(result.missingOptionalFiles).toEqual(['.ai/generated/report-brief.md'])
    expect(generatedContent).toContain('- Missing optional files: .ai/generated/report-brief.md')
    expect(generatedContent).not.toContain('# --- FILE: .ai/generated/report-brief.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/state/task-state.md ---')
  })

  it('keeps numeric architect, business, and docs modes compatible', async () => {
    const rootDir = await createHubRepo()

    const architect = await generateContextPayload(rootDir, '2')
    const business = await generateContextPayload(rootDir, '3')
    const docs = await generateContextPayload(rootDir, '4')

    expect(architect.mode.id).toBe('architect')
    expect(architect.includedFiles).toEqual([
      'AGENTS.md',
      '.ai/knowledge/project-conventions.md',
      '.ai/knowledge/tech-docs.md',
      '.ai/knowledge/decisions.md',
      '.ai/knowledge/product-roadmap.md',
      '.ai/generated/report-brief.md',
    ])
    expect(business.mode.id).toBe('business')
    expect(business.includedFiles).toEqual([
      '.ai/knowledge/product-roadmap.md',
      '.ai/knowledge/work-log.md',
    ])
    expect(docs.mode.id).toBe('docs')
    expect(docs.includedFiles).toEqual(['.ai/knowledge/tech-docs.md'])
    expect(docs.missingOptionalFiles).toEqual(['DEVOPS.md'])
  })

  it('generates strict review context with intent, risk rules, status, and diff', async () => {
    const rootDir = await createHubRepo()
    await writeRepoFile(
      rootDir,
      '.ai/config/memory-config.json',
      `${JSON.stringify({
        version: 1,
        thresholds: {
          small: { maxFiles: 2, maxDiffLines: 80 },
          large: { minFiles: 8, minDiffLines: 300 },
        },
        highRiskPaths: [
          {
            label: 'Auth',
            pattern: 'src/auth/**',
            requiresDesignReview: true,
            tier: 'large',
          },
        ],
        highRiskKeywords: [],
      }, null, 2)}\n`,
    )
    await initGitRepo(rootDir)
    await writeRepoFile(rootDir, 'src/auth/session.ts', 'export const session = "changed"\n')

    const result = await generateContextPayload(rootDir, 'review')

    expect(result.mode.id).toBe('review')
    expect(result.includedFiles).toEqual([
      '.ai/state/task-state.md',
      '.ai/config/memory-config.json',
      '.ai/knowledge/project-conventions.md',
    ])
    expect(result.payload).toContain(REVIEW_SYSTEM_INSTRUCTION)
    expect(result.payload).toContain('## Original Intent')
    expect(result.payload).toContain('Task notes.')
    expect(result.payload).toContain('- Hub review payload includes task intent.')
    expect(result.payload).toContain('Hub tests need context.')
    expect(result.payload).toContain('## Governance')
    expect(result.payload).toContain('Auth (path: `src/auth/**`, tier: large')
    expect(result.payload).toContain('matched: src/auth/session.ts')
    expect(result.payload).toContain('## Current State')
    expect(result.payload).toContain('?? src/auth/session.ts')
    expect(result.payload).toContain('new file mode 100644')
    expect(result.payload).toContain('+export const session = "changed"')
  })

  it('generates review context when project conventions are missing', async () => {
    const rootDir = await createHubRepo()
    await unlink(path.join(rootDir, '.ai', 'project-conventions.md'))

    const result = await generateContextPayload(rootDir, 'eval')

    expect(result.mode.id).toBe('review')
    expect(result.missingOptionalFiles).toEqual(['.ai/knowledge/project-conventions.md'])
    expect(result.payload).toContain('- Project conventions file not found.')
    expect(result.payload).toContain('- No high-risk rules triggered by current diff.')
  })

  it('generates architect-lite planning context without full decisions history', async () => {
    const rootDir = await createHubRepo()

    const result = await generateContextPayload(rootDir, 'plan')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.mode.id).toBe('architect-lite')
    expect(result.includedFiles).toEqual([
      '.ai/generated/report-brief.md',
      'AGENTS.md',
      '.ai/knowledge/project-conventions.md',
      '.ai/knowledge/product-roadmap.md',
      '.ai/knowledge/tech-docs.md',
    ])
    expect(generatedContent).toContain('- Mode: architect-lite (AI Architect Lite Context)')
    expect(generatedContent).not.toContain('# --- FILE: .ai/knowledge/decisions.md ---')
  })

  it('generates named handoff and PR modes', async () => {
    const rootDir = await createHubRepo()

    const handoff = await generateContextPayload(rootDir, 'handoff')
    const pr = await generateContextPayload(rootDir, 'pr')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(handoff.includedFiles).toEqual([
      '.ai/generated/report-brief.md',
      '.ai/state/task-state.md',
      '.ai/knowledge/decisions.md',
    ])
    expect(handoff.payload).toContain('- Current Phase: Implementation')
    expect(handoff.payload).toContain(
      '- Next Autonomous Action: Continue hub fixture implementation.',
    )
    expect(pr.mode.id).toBe('pr')
    expect(pr.gitSummary?.status).toBe('unknown')
    expect(generatedContent).toContain('## Git Summary')
    expect(generatedContent).toContain('Git summary: unknown')
    expect(generatedContent).toContain('- Current Phase: Implementation')
  })

  it('fails clearly when required files are missing', async () => {
    const rootDir = await createHubRepo()

    await unlink(path.join(rootDir, '.ai', 'task-state.md'))

    await expect(generateContextPayload(rootDir, 'start')).rejects.toThrow(
      'Missing required context file: .ai/state/task-state.md',
    )
  })

  it('includes git status and diff stat for PR mode', async () => {
    const rootDir = await createHubRepo()

    await initGitRepo(rootDir)
    await writeRepoFile(rootDir, '.ai/task-state.md', '# Task State\n\n### Goal\nChanged.\n')

    const result = await generateContextPayload(rootDir, 'pr')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.gitSummary?.status).toBe('available')
    expect(generatedContent).toContain('- Git summary: available')
    expect(generatedContent).toContain('Status:')
    expect(generatedContent).toContain('M .ai/task-state.md')
    expect(generatedContent).toContain('Diff stat:')
    expect(generatedContent).toContain('.ai/task-state.md')
  })
})

describe('ace hub CLI', () => {
  it('lists available modes', () => {
    const list = listHubModes()

    expect(list).toContain('1, start, coder')
    expect(list).toContain('architect-lite, plan')
    expect(list).toContain('handoff')
    expect(list).toContain('review, eval, evaluate')
    expect(list).toContain('pr')
    expect(HUB_MENU).toContain('[architect-lite] AI Architect Lite Context')
    expect(HUB_MENU).toContain('[handoff] Agent Handoff Context')
    expect(HUB_MENU).toContain('[review] Agentic Evaluation Review')
    expect(HUB_MENU).toContain('[pr] PR Summary Context')
  })

  it('prints available modes with --list', async () => {
    const { stdout } = await execFileAsync(process.execPath, [hubScriptPath, '--list'])

    expect(stdout).toContain('1, start, coder')
    expect(stdout).toContain('architect-lite, plan')
    expect(stdout).toContain('review, eval, evaluate')
    expect(stdout).toContain('pr')
  })

  it('supports --mode, --output, and JSON metadata', async () => {
    const rootDir = await createHubRepo()
    const outputPath = path.join(rootDir, 'tmp', 'context.md')

    const { stdout } = await execFileAsync(
      process.execPath,
      [hubScriptPath, '--mode', 'start', '--output', outputPath, '--json'],
      { cwd: rootDir },
    )
    const parsed = JSON.parse(stdout)
    const generatedContent = await readFile(outputPath, 'utf8')

    expect(parsed.mode).toEqual({ id: 'start', label: 'Start / AI Coder Context' })
    expect(parsed.outputPath).toBe(outputPath)
    expect(parsed.includedFiles[0]).toBe('.ai/generated/report-brief.md')
    expect(generatedContent).toContain('# ACE Hub Context')
  })

  it('prints payload to stdout without writing the default output file', async () => {
    const rootDir = await createHubRepo()

    const { stdout } = await execFileAsync(process.execPath, [hubScriptPath, 'start', '--stdout'], {
      cwd: rootDir,
    })

    await expect(readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')).rejects.toThrow()
    expect(stdout).toContain('# ACE Hub Context')
    expect(stdout).toContain('# --- FILE: .ai/generated/report-brief.md ---')
  })

  it('prints review payload to stdout', async () => {
    const rootDir = await createHubRepo()

    const { stdout } = await execFileAsync(
      process.execPath,
      [hubScriptPath, 'review', '--stdout'],
      { cwd: rootDir },
    )

    await expect(readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')).rejects.toThrow()
    expect(stdout).toContain('# ACE Agentic Evaluation Context')
    expect(stdout).toContain(REVIEW_SYSTEM_INSTRUCTION)
  })
})
