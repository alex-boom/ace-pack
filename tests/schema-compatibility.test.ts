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
import { migrateMemorySchemaV2 } from '../scripts/ai-memory-utils.mjs'
import { installAcePack } from '../install-ace-pack.mjs'

const tempDirs: string[] = []

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

describe('v2 schema and compatibility contract', () => {
  it('preserves existing project-owned ACE memory files during install', async () => {
    const rootDir = await createRepo()
    const customTask = `# Current Task

## Lifecycle
Status: active
Version: v7
Task Tier: small
Design Review Required: no
Started: 2026-06-14 13:30
Ready For Archive: no

## Goal
Keep a custom historical task.

## Business Value / Product Alignment
The project owns this memory.

## Technical Approach
Option 1:
- Keep it.

Option 2:
- Replace it.

Chosen Approach:
- Keep it.

## Acceptance Criteria
- Custom content survives install.

## Completion Checklist
- [ ] Custom checklist survives.
`

    await writeRepoFile(rootDir, '.ai/current-task.md', customTask)

    await installAcePack(rootDir)

    await expect(readFile(path.join(rootDir, '.ai/current-task.md'), 'utf8')).resolves.toBe(
      customTask,
    )
  })

  it('migrates legacy v1 memory into schema v2 canonical paths without deleting legacy files', async () => {
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
- Mirror old files into v2 canonical paths.

Chosen Approach:
- Mirror because it preserves compatibility.

## Acceptance Criteria
- Legacy and canonical files both exist.

## Completion Checklist
- [ ] Migration checked.
`

    await writeRepoFile(rootDir, '.ai/current-task.md', legacyTask)

    const result = await migrateMemorySchemaV2(rootDir)

    expect(result.createdFiles).toContain('.ai/state/current-task.md')
    await expect(readFile(path.join(rootDir, '.ai/current-task.md'), 'utf8')).resolves.toBe(
      legacyTask,
    )
    await expect(readFile(path.join(rootDir, '.ai/state/current-task.md'), 'utf8')).resolves.toBe(
      legacyTask,
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

  it('keeps stable commands and legacy aliases in installed package scripts', async () => {
    const rootDir = await createRepo()

    await installAcePack(rootDir)

    const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts['ace:init']).toBe('node ./scripts/bootstrap-agent-memory.mjs')
    expect(packageJson.scripts.ace).toBe('node ./scripts/ace-cli.mjs')
    expect(packageJson.scripts['ace:check']).toBe('node ./scripts/check-agent-memory.mjs')
    expect(packageJson.scripts['ace:validate']).toBe('node ./scripts/check-agent-memory.mjs')
    expect(packageJson.scripts['ace:onboard']).toBe('node ./scripts/ace-onboard.mjs')
    expect(packageJson.scripts['ace:classify']).toBe('node ./scripts/ai-task-classify.mjs')
    expect(packageJson.scripts['ace:finish']).toBe('node ./scripts/ai-task-finish.mjs')
    expect(packageJson.scripts['ace:gate']).toBe('node ./scripts/ace-quality-gate.mjs')
    expect(packageJson.scripts['ace:hub']).toBe('node ./scripts/ace-hub.mjs')
    expect(packageJson.scripts['ace:report']).toBe('node ./scripts/ai-report.mjs')
    expect(packageJson.scripts['ace:report:brief']).toBe(
      'node ./scripts/ai-report-brief.mjs',
    )
    expect(packageJson.scripts['agent-memory:init']).toBe(
      'node ./scripts/bootstrap-agent-memory.mjs',
    )
    expect(packageJson.scripts['ai:task:classify']).toBe('node ./scripts/ai-task-classify.mjs')
    expect(packageJson.scripts['ai:task:finish']).toBe('node ./scripts/ai-task-finish.mjs')
  })

  it('documents the v2 contract and keeps docs out of the npm package file list', async () => {
    const schemaDocs = await readFile('docs/schema-compatibility.md', 'utf8')
    const readme = await readFile('README.md', 'utf8')
    const npmReadme = await readFile('README.npm.md', 'utf8')
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      files?: string[]
    }

    expect(schemaDocs).toContain('ACE v2.0 Schema and Compatibility')
    expect(schemaDocs).toContain('Canonical v2 Memory Layout')
    expect(schemaDocs).toContain('`.ai/config/memory-config.json` Schema Version 1')
    expect(schemaDocs).toContain('legacy root `.ai/*` paths')
    expect(schemaDocs).toContain('optional IDE bridge files')
    expect(schemaDocs).toContain('not required by `ace:check`')
    expect(schemaDocs).toContain('Migration Policy')
    expect(readme).toContain('./docs/schema-compatibility.md')
    expect(npmReadme).toContain(
      'https://github.com/alex-boom/ace-pack/blob/main/docs/schema-compatibility.md',
    )
    expect(packageJson.files).not.toContain('docs')
    expect(packageJson.files).not.toContain('docs/**')
  })

  it('validates a freshly installed v2 repository', async () => {
    const rootDir = await createRepo()

    await installAcePack(rootDir)

    await expect(validateAgentMemory(rootDir)).resolves.toEqual([])
  })
})
