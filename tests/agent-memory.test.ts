import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { ensureAgentMemory, validateAgentMemory } from '../scripts/agent-memory-lib.mjs'
import { getProjectPreset } from '../scripts/ace-project-presets.mjs'

const tempDirs: string[] = []

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
    const currentTaskContent = await readFile(path.join(rootDir, '.ai', 'current-task.md'), 'utf8')
    const memoryConfigContent = await readFile(
      path.join(rootDir, '.ai', 'memory-config.json'),
      'utf8',
    )

    expect(firstRun.updatedFiles).toEqual(['AGENTS.md'])
    expect(firstRun.createdFiles).toContain('CLAUDE.md')
    expect(firstRun.createdFiles).toContain('.ai/memory-config.json')
    expect(firstRun.createdFiles).toContain('.ai/current-task.md')
    expect(firstRun.createdFiles).toContain('.ai/product-roadmap.md')
    expect(firstRun.createdFiles).toContain('.ai/tech-docs.md')
    expect(firstRun.createdFiles).toContain('.ai/reflection-log.md')
    expect(firstRun.createdFiles).toContain('.ai/archive/.gitkeep')
    expect(firstRun.createdFiles).toContain('.ai/archive/tasks/.gitkeep')
    expect(secondRun).toEqual({ createdFiles: [], updatedFiles: [] })
    expect(agentsContent.match(/agent-memory-workflow:start/gm)).toHaveLength(1)
    expect(agentsContent).toContain('## ACE (Agentic Context Engine) Workflow')
    expect(agentsContent).toContain('ACE is the local automation framework')
    expect(agentsContent).toContain('pnpm ace:classify')
    expect(agentsContent).toContain('pnpm.cmd ace:validate')
    expect(agentsContent).toContain('pnpm ai:task:classify')
    expect(agentsContent).toContain(
      'Do the smallest closeout that preserves future agent context and project',
    )
    expect(agentsContent).toContain('state publish/deploy decision when relevant')
    expect(agentsContent).toContain('If release is deferred, say so explicitly.')
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
    expect(claudeContent).toContain('.ai/report-brief.md')
    expect(claudeContent).toContain('pnpm.cmd ace:validate')
    expect(claudeContent).toContain(
      'Do the smallest closeout that preserves future agent context and project',
    )
    expect(claudeContent).toContain('If release is deferred, say so explicitly.')
    expect(currentTaskContent).toContain(
      'Always: update `.ai/changed-files.md`, record verification, and run `ace:validate`',
    )
    expect(currentTaskContent).toContain(
      'Only if changed: update tech docs, product roadmap, durable decisions, or release notes',
    )
    expect(currentTaskContent).toContain('deferred release wording')
    expect(currentTaskContent).toContain('run local smoke and dogfood/self-check routines')
  })

  it('does not overwrite existing memory files', async () => {
    const rootDir = await createRepo()

    await mkdir(path.join(rootDir, '.ai'), { recursive: true })
    await writeFile(path.join(rootDir, 'CLAUDE.md'), '# Custom Claude\n', 'utf8')
    await writeFile(path.join(rootDir, '.ai/current-task.md'), '# Custom Task\n', 'utf8')

    await ensureAgentMemory(rootDir)

    await expect(readFile(path.join(rootDir, 'CLAUDE.md'), 'utf8')).resolves.toBe(
      '# Custom Claude\n',
    )
    await expect(readFile(path.join(rootDir, '.ai/current-task.md'), 'utf8')).resolves.toBe(
      '# Custom Task\n',
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
    expect(issues).toContain('Missing .ai/memory-config.json')
    expect(issues).toContain('Missing .ai/current-task.md')
    expect(issues).toContain('Missing .ai/product-roadmap.md')
    expect(issues).toContain('Missing .ai/tech-docs.md')
    expect(issues).toContain('Missing .ai/reflection-log.md')
    expect(issues).toContain('Missing .ai/archive/.gitkeep')
    expect(issues).toContain('Missing .ai/archive/tasks/.gitkeep')
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
