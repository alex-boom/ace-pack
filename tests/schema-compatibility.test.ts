import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  AGENTS_WORKFLOW_END_MARKER,
  AGENTS_WORKFLOW_MARKER,
  ensureAgentMemory,
  validateAgentMemory,
} from '../scripts/agent-memory-lib.mjs'
import { readMemoryConfig } from '../scripts/ai-memory-config.mjs'
import { runAceMigration } from '../scripts/ace-migrate.mjs'
import { installAcePack } from '../scripts/ace-install-lib.mjs'

const tempDirs: string[] = []
const aceValidatePlaceholder = 'echo "Add project mechanical checks here: lint, typecheck, test"'

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createRepo(prefix = 'ace-schema-compat-') {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), prefix))
  tempDirs.push(rootDir)
  await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep me.\n')
  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

describe('v3 schema and compatibility contract', () => {
  it('preserves existing project-owned ACE memory files during install', async () => {
    const rootDir = await createRepo()
    const customTask = `# Task State

## Lifecycle & Meta

### Feature Name
Custom task

### Lifecycle
Status: active
Version: v7
Task Tier: small
Design Review Required: no
Started: 2026-06-14 13:30
Ready For Archive: no

### Goal
Keep a custom historical task.

## Business Value & Approach

### Business Value / Product Alignment
The project owns this memory.

### Technical Approach
Option 1:
- Keep it.

Option 2:
- Replace it.

Chosen Approach:
- Keep it.

## Changed Files / Diff

[custom]
- Keep it.

## Handoff & Next Steps

### Acceptance Criteria
- Custom content survives install.

### Completion Checklist
- [ ] Custom checklist survives.
`

    await writeRepoFile(rootDir, '.ai/task-state.md', customTask)

    await installAcePack(rootDir)

    await expect(readFile(path.join(rootDir, '.ai/task-state.md'), 'utf8')).resolves.toBe(
      customTask,
    )
  })

  it('auto-migrates legacy task memory into schema v3 task-state and backs up old files', async () => {
    const rootDir = await createRepo()
    const legacyTask = `# Current Task

## Lifecycle
Status: active
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-14 15:30
Ready For Archive: no

## Goal
Preserve legacy task memory.

## Business Value / Product Alignment
Legacy projects own their memory.

## Technical Approach
Option 1:
- Drop old files.

Option 2:
- Merge old files into v3 task state.

Chosen Approach:
- Migrate because it preserves compatibility.

## Acceptance Criteria
- Legacy memory is preserved in task-state with a backup.

## Completion Checklist
- [ ] Migration checked.
`

    await writeRepoFile(rootDir, '.ai/current-task.md', legacyTask)

    const result = await runAceMigration(rootDir)

    expect(result.createdFiles).toContain('.ai/state/task-state.md')
    expect(result.removedFiles).toContain('.ai/current-task.md')
    expect(result.backupDir).toMatch(/^.ai\/archive\/migrations\/v3-task-state-/u)
    await expect(readFile(path.join(rootDir, '.ai/current-task.md'), 'utf8')).rejects.toThrow()
    await expect(
      readFile(path.join(rootDir, result.backupDir ?? '', '.ai/current-task.md'), 'utf8'),
    ).resolves.toContain('Preserve legacy task memory.')
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      'Preserve legacy task memory.',
    )
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      '## Handoff & Next Steps',
    )
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      'Current Phase: Planning',
    )
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      'Friction Encountered: no',
    )
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      'Next Autonomous Action: Analyze task and update Business Value & Approach.',
    )
    await expect(readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')).resolves.toContain(
      '### Edge Cases & Red Teaming',
    )
  })

  it('updates only the marked ACE workflow section in AGENTS.md', async () => {
    const rootDir = await createRepo()
    const agentsContent = `# AGENTS.md

## Project Rules

Do not rewrite this project-specific rule.

${AGENTS_WORKFLOW_MARKER}
## Agent Memory Workflow

Legacy body.
${AGENTS_WORKFLOW_END_MARKER}

## Extra Human Notes

Keep this too.
`

    await writeRepoFile(rootDir, 'AGENTS.md', agentsContent)

    await ensureAgentMemory(rootDir)

    const nextAgentsContent = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')

    expect(nextAgentsContent).toContain('Do not rewrite this project-specific rule.')
    expect(nextAgentsContent).toContain('## Extra Human Notes')
    expect(nextAgentsContent).toContain('Keep this too.')
    expect(nextAgentsContent).toContain('## ACE (Agentic Context Engine) Workflow')
    expect(nextAgentsContent).not.toContain('## Agent Memory Workflow')
  })

  it('normalizes memory config v1 with unknown fields and legacy string rules', async () => {
    const rootDir = await createRepo()

    await writeRepoFile(
      rootDir,
      '.ai/memory-config.json',
      `${JSON.stringify(
        {
          version: 1,
          customTeamField: {
            owner: 'platform',
          },
          thresholds: {
            small: {
              maxFiles: 1,
            },
          },
          highRiskPaths: ['src/auth/**'],
          highRiskKeywords: ['token'],
        },
        null,
        2,
      )}\n`,
    )

    const config = await readMemoryConfig(rootDir)

    expect(config.version).toBe(1)
    expect(config.thresholds.small.maxFiles).toBe(1)
    expect(config.thresholds.small.maxDiffLines).toBe(80)
    expect(config.thresholds.large.minFiles).toBe(8)
    expect(config.highRiskPaths[0]).toMatchObject({
      label: 'src/auth/**',
      pattern: 'src/auth/**',
      requiresDesignReview: true,
      tier: 'large',
    })
    expect(config.highRiskKeywords[0]).toMatchObject({
      keyword: 'token',
      label: 'token',
      requiresDesignReview: true,
      tier: 'large',
    })
  })

  it('keeps installed package scripts minimal while routing legacy aliases', async () => {
    const rootDir = await createRepo()

    await installAcePack(rootDir)

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:validate']).toBe(aceValidatePlaceholder)
    expect(Object.keys(packageJson.scripts).sort()).toEqual(['ace', 'ace:validate'])
  })

  it('documents the v3 contract and keeps docs out of the npm package file list', async () => {
    const schemaDocs = await readFile('docs/schema-compatibility.md', 'utf8')
    const readme = await readFile('README.md', 'utf8')
    const npmReadme = await readFile('README.npm.md', 'utf8')
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      files?: string[]
    }

    expect(schemaDocs).toContain('ACE v3.5 Schema and Compatibility')
    expect(schemaDocs).toContain('Installed repositories expose only:')
    expect(schemaDocs).toContain('remain accepted only as router arguments')
    expect(schemaDocs).toContain('Canonical v3 Memory Layout')
    expect(schemaDocs).toContain('project-conventions.md')
    expect(schemaDocs).toContain('`.ai/config/memory-config.json` Schema Version 1')
    expect(schemaDocs).toContain('.ai/state/task-state.md')
    expect(schemaDocs).toContain('Current Phase:')
    expect(schemaDocs).toContain('Next Autonomous Action:')
    expect(schemaDocs).toContain('Friction Encountered:')
    expect(schemaDocs).toContain('Autonomous Phase Routing')
    expect(schemaDocs).toContain('Friction Tracking')
    expect(schemaDocs).toContain('Knowledge Promotion and Context Pruning')
    expect(schemaDocs).toContain('ace hub distill')
    expect(schemaDocs).toContain('ace hub promote')
    expect(schemaDocs).toContain('ace archive')
    expect(schemaDocs).toContain('decisions.md` remains active durable')
    expect(schemaDocs).toContain('Agentic Evaluation Review Mode')
    expect(schemaDocs).toContain('ace hub review')
    expect(schemaDocs).toContain('Agentic Red Team Planning Mode')
    expect(schemaDocs).toContain('ace hub red-team')
    expect(schemaDocs).toContain('v2 Legacy Auto-Migration')
    expect(schemaDocs).toContain('IDE Managed Blocks')
    expect(schemaDocs).toContain('Small Task Finish')
    expect(schemaDocs).toContain('Package Payload Boundary')
    expect(readme).toContain('./docs/schema-compatibility.md')
    expect(npmReadme).toContain(
      'https://github.com/alex-boom/ace-pack/blob/main/docs/schema-compatibility.md',
    )
    expect(packageJson.files).not.toContain('docs')
    expect(packageJson.files).not.toContain('docs/**')
  })

  it('validates a freshly installed v3 repository', async () => {
    const rootDir = await createRepo()

    await installAcePack(rootDir)

    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })

  it('keeps existing v3 task-state files without red-team or friction fields valid', async () => {
    const rootDir = await createRepo()
    await installAcePack(rootDir)
    const taskStatePath = path.join(rootDir, '.ai/state/task-state.md')
    const taskState = await readFile(taskStatePath, 'utf8')
    const legacyCompatibleTaskState = taskState
      .replace(/\nFriction Encountered: no/u, '')
      .replace(
        /\n### Edge Cases & Red Teaming\nIdentify at least two potential failure modes, edge cases, or security risks in the chosen approach, and how to mitigate them\.\n/u,
        '\n',
      )

    await writeFile(taskStatePath, legacyCompatibleTaskState, 'utf8')

    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })
})
