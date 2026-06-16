import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { ensureAgentMemory, validateAgentMemory } from '../scripts/agent-memory-lib.mjs'
import { getProjectPreset } from '../scripts/ace-project-presets.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)

async function createRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'agent-memory-'))

  tempDirs.push(rootDir)

  await writeFile(
    path.join(rootDir, 'AGENTS.md'),
    '# AGENTS.md\n\n## Existing Rules\n\nKeep repo rules here.\n',
    'utf8',
  )

  return rootDir
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('ensureAgentMemory', () => {
  it('creates the memory files and appends the AGENTS workflow once', async () => {
    const rootDir = await createRepo()

    const firstRun = await ensureAgentMemory(rootDir)
    const secondRun = await ensureAgentMemory(rootDir)
    const agentsContent = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')
    const claudeContent = await readFile(path.join(rootDir, 'CLAUDE.md'), 'utf8')
    const taskStateContent = await readFile(
      path.join(rootDir, '.ai', 'state', 'task-state.md'),
      'utf8',
    )
    const memoryConfigContent = await readFile(
      path.join(rootDir, '.ai', 'config', 'memory-config.json'),
      'utf8',
    )

    expect(firstRun.updatedFiles).toEqual(['AGENTS.md'])
    expect(firstRun.createdFiles).toContain('CLAUDE.md')
    expect(firstRun.createdFiles).toContain('.ai/config/memory-config.json')
    expect(firstRun.createdFiles).toContain('.ai/state/task-state.md')
    expect(firstRun.createdFiles).toContain('.ai/knowledge/product-roadmap.md')
    expect(firstRun.createdFiles).toContain('.ai/knowledge/tech-docs.md')
    expect(firstRun.createdFiles).toContain('.ai/knowledge/reflection-log.md')
    expect(firstRun.createdFiles).toContain('.ai/archive/.gitkeep')
    expect(firstRun.createdFiles).toContain('.ai/archive/tasks/.gitkeep')
    expect(secondRun).toEqual({ createdFiles: [], updatedFiles: [] })
    expect(agentsContent.match(/agent-memory-workflow:start/gm)).toHaveLength(1)
    expect(agentsContent).toContain('## ACE (Agentic Context Engine) Workflow')
    expect(agentsContent).toContain('ACE is the local automation framework')
    expect(agentsContent).toContain('pnpm ace classify')
    expect(agentsContent).toContain('npm run ace -- finish')
    expect(agentsContent).toContain('pnpm.cmd ace check')
    expect(agentsContent).toContain('pnpm ace ai:task:classify')
    expect(agentsContent).toContain(
      'Do the smallest closeout that preserves future agent context and project',
    )
    expect(agentsContent).toContain('state publish/deploy decision when relevant')
    expect(agentsContent).toContain('If release is deferred, say so explicitly.')
    expect(agentsContent).toContain('For small low-risk tasks')
    expect(agentsContent).toContain('task-state')
    expect(agentsContent).toContain('.cursorrules')
    expect(agentsContent).toContain('dogfood/self-check routines before final publish')
    expect(memoryConfigContent).toContain('"ACE (Agentic Context Engine) Configuration"')
    const memoryConfig = JSON.parse(memoryConfigContent) as {
      _profile?: { status?: string }
      highRiskPaths?: Array<{ pattern: string }>
    }

    expect(memoryConfig._profile?.status).toBe('unprofiled')
    expect(memoryConfig.highRiskPaths?.map((rule) => rule.pattern)).toEqual(
      expect.arrayContaining(['.ai/**', 'AGENTS.md', 'scripts/**']),
    )
    expect(memoryConfig.highRiskPaths?.map((rule) => rule.pattern)).not.toContain(
      'packages/auth/**',
    )
    expect(memoryConfig.highRiskPaths?.map((rule) => rule.pattern)).not.toContain(
      'packages/db/src/schema/**',
    )
    expect(memoryConfig.highRiskPaths?.map((rule) => rule.pattern)).not.toContain(
      'packages/api/src/routers/**',
    )
    expect(claudeContent).toContain('.ai/generated/report-brief.md')
    expect(claudeContent).toContain('pnpm.cmd ace:validate')
    expect(claudeContent).toContain(
      'Do the smallest closeout that preserves future agent context and project',
    )
    expect(claudeContent).toContain('If release is deferred, say so explicitly.')
    expect(taskStateContent).toContain(
      'Always: update changed files, record verification, and run project-owned `ace:validate`',
    )
    expect(taskStateContent).toContain(
      'Only if changed: update tech docs, product roadmap, durable decisions, or release notes',
    )
    expect(taskStateContent).toContain('deferred release wording')
    expect(taskStateContent).toContain('If small/low-risk')
    expect(taskStateContent).toContain('run local smoke and dogfood/self-check routines')
  })

  it('does not overwrite existing memory files', async () => {
    const rootDir = await createRepo()

    await mkdir(path.join(rootDir, '.ai'), { recursive: true })
    await writeFile(path.join(rootDir, 'CLAUDE.md'), '# Custom Claude\n', 'utf8')
    await writeFile(path.join(rootDir, '.ai/task-state.md'), '# Custom Task State\n', 'utf8')

    await ensureAgentMemory(rootDir)

    await expect(readFile(path.join(rootDir, 'CLAUDE.md'), 'utf8')).resolves.toBe(
      '# Custom Claude\n',
    )
    await expect(readFile(path.join(rootDir, '.ai/task-state.md'), 'utf8')).resolves.toBe(
      '# Custom Task State\n',
    )
  })

  it('upgrades a legacy marked workflow section to ACE wording', async () => {
    const rootDir = await createRepo()

    await writeFile(
      path.join(rootDir, 'AGENTS.md'),
      `# AGENTS.md

<!-- agent-memory-workflow:start -->
## Agent Memory Workflow

Legacy body.
<!-- agent-memory-workflow:end -->
`,
      'utf8',
    )

    const result = await ensureAgentMemory(rootDir)
    const agentsContent = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')

    expect(result.updatedFiles).toContain('AGENTS.md')
    expect(agentsContent).toContain('## ACE (Agentic Context Engine) Workflow')
    expect(agentsContent).not.toContain('## Agent Memory Workflow')
  })
})

describe('validateAgentMemory', () => {
  it('returns no issues after a complete bootstrap', async () => {
    const rootDir = await createRepo()

    await ensureAgentMemory(rootDir)

    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })

  it('reports missing files and sections', async () => {
    const rootDir = await createRepo()

    const issues = await validateAgentMemory(rootDir)

    expect(issues).toContain(
      'AGENTS.md is missing the ## ACE (Agentic Context Engine) Workflow section',
    )
    expect(issues).toContain('Missing CLAUDE.md')
    expect(issues).toContain('Missing .ai/config/memory-config.json')
    expect(issues).toContain('Missing .ai/state/task-state.md')
    expect(issues).toContain('Missing .ai/knowledge/product-roadmap.md')
    expect(issues).toContain('Missing .ai/knowledge/tech-docs.md')
    expect(issues).toContain('Missing .ai/knowledge/reflection-log.md')
    expect(issues).toContain('Missing .ai/archive/.gitkeep')
    expect(issues).toContain('Missing .ai/archive/tasks/.gitkeep')
  })

  it('prints freshness warnings without failing validation', async () => {
    const rootDir = await createRepo()

    await ensureAgentMemory(rootDir)
    await writeFile(
      path.join(rootDir, '.ai/state/task-state.md'),
      `# Task State

## Lifecycle & Meta

### Feature Name
Complete fixture

### Lifecycle
Status: complete
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-01 10:00
Ready For Archive: yes

### Goal
Fixture.

### Current Status
- [x] Fixture.

### Acceptance Criteria
- Fixture passes.

### Completion Checklist
- [x] Goal completed

## Business Value & Approach

### Business Value / Product Alignment
Fixture value.

### Technical Approach
Fixture approach.

## Changed Files / Diff

[fixture]
- Fixture.

## Handoff & Next Steps

### Last Update
2026-01-01 10:00

### What Was Done
- Fixture.

### Quality Review
Product Alignment:
- Fixture.

Architecture:
- Fixture.

Security:
- Fixture.

Code Quality:
- Fixture.

### Next Steps
TODO
`,
    )
    await writeFile(
      path.join(rootDir, '.ai/generated/report-brief.md'),
      `# AI Brief Report

## Report Metadata
- Freshness: Possibly stale
`,
    )

    const { stderr } = await execFileAsync(process.execPath, [
      path.resolve('scripts/check-agent-memory.mjs'),
      rootDir,
    ])

    expect(stderr).toContain('ACE memory check passed')
    expect(stderr).toContain('Warnings:')
    expect(stderr).toContain('Last Update is')
    expect(stderr).toContain('freshness is "Possibly stale"')
    expect(stderr).toContain('Current task is complete')
  })
})

describe('package metadata', () => {
  it('keeps the legacy bin while exposing the ACE bin', async () => {
    const packageJson = JSON.parse(await readFile(path.resolve('package.json'), 'utf8')) as {
      bin?: Record<string, string>
      scripts?: Record<string, string>
    }

    expect(packageJson.bin?.['ace-pack']).toBe('install-ace-pack.mjs')
    expect(packageJson.bin?.['agent-memory-pack']).toBe('install-agent-memory-pack.mjs')
    expect(packageJson.scripts?.['install:pack']).toBe('node ./install-ace-pack.mjs')
    expect(packageJson.scripts?.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts?.test).toBe('vitest run')
    expect(packageJson.scripts?.['smoke:fake-project']).toBe(
      'node ./tools/smoke-fake-project.mjs',
    )
    expect(packageJson.scripts?.['dogfood:self-check']).toBe(
      'node ./tools/dogfood-self-check.mjs',
    )
  })
})

describe('project presets', () => {
  it('keeps the Next/tRPC/Drizzle SaaS profile as an explicit preset', () => {
    const preset = getProjectPreset('next-trpc-drizzle-saas')
    const pathPatterns = preset?.highRiskPaths.map((rule) => rule.pattern)

    expect(preset).not.toBeNull()
    expect(pathPatterns).toEqual(
      expect.arrayContaining([
        'packages/auth/**',
        'packages/db/src/schema/**',
        'packages/db/migrations/**',
        'packages/api/src/routers/**',
      ]),
    )
  })
})
