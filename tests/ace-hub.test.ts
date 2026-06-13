import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { GENERATED_CONTEXT_PATH, generateContextPayload } from '../scripts/ace-hub.mjs'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createHubRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-hub-'))
  tempDirs.push(rootDir)

  await mkdir(path.join(rootDir, '.ai'), { recursive: true })
  await writeFile(path.join(rootDir, 'AGENTS.md'), '# AGENTS.md\n\nRules.\n', 'utf8')
  await writeFile(
    path.join(rootDir, '.ai', 'report-brief.md'),
    '# AI Brief Report\n\n## Start Snapshot\n- Branch: main\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'current-task.md'),
    '# Current Task\n\n## Goal\nTask notes.\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'session-handoff.md'),
    '# Session Handoff\n\n## Next Steps\n- Continue.\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'changed-files.md'),
    '# Changed Files\n\n[README.md]\n- Updated docs.\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'reflection-log.md'),
    '# Reflection Log\n\n## Unresolved\n\n## Resolved\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'tech-docs.md'),
    '# Technical Docs\n\n## Architecture\nArchitecture notes.\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'decisions.md'),
    '# Decisions\n\nDecision:\n- Keep ACE portable.\nImpact:\n- No package coupling.\n',
    'utf8',
  )
  await writeFile(
    path.join(rootDir, '.ai', 'product-roadmap.md'),
    '# Product Roadmap\n\n## Business Goals\nBusiness notes.\n',
    'utf8',
  )

  return rootDir
}

describe('generateContextPayload', () => {
  it('writes the coder context payload with report brief first', async () => {
    const rootDir = await createHubRepo()

    const result = await generateContextPayload(rootDir, '1')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.includedFiles).toEqual([
      '.ai/report-brief.md',
      '.ai/current-task.md',
      '.ai/session-handoff.md',
      '.ai/changed-files.md',
      '.ai/reflection-log.md',
    ])
    expect(generatedContent.indexOf('# --- FILE: .ai/report-brief.md ---')).toBeLessThan(
      generatedContent.indexOf('# --- FILE: .ai/current-task.md ---'),
    )
  })

  it('keeps coder context usable before a report brief exists', async () => {
    const rootDir = await createHubRepo()

    await unlink(path.join(rootDir, '.ai', 'report-brief.md'))

    const result = await generateContextPayload(rootDir, '1')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.includedFiles).toEqual([
      '.ai/current-task.md',
      '.ai/session-handoff.md',
      '.ai/changed-files.md',
      '.ai/reflection-log.md',
    ])
    expect(generatedContent).not.toContain('# --- FILE: .ai/report-brief.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/current-task.md ---')
  })

  it('writes the architect context payload with deterministic file separators', async () => {
    const rootDir = await createHubRepo()

    const result = await generateContextPayload(rootDir, '2')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.includedFiles).toEqual([
      'AGENTS.md',
      '.ai/tech-docs.md',
      '.ai/decisions.md',
      '.ai/product-roadmap.md',
    ])
    expect(generatedContent).toContain('# --- FILE: AGENTS.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/tech-docs.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/decisions.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/product-roadmap.md ---')
    expect(generatedContent.indexOf('# --- FILE: AGENTS.md ---')).toBeLessThan(
      generatedContent.indexOf('# --- FILE: .ai/tech-docs.md ---'),
    )
  })

  it('skips optional DEVOPS.md for developer docs', async () => {
    const rootDir = await createHubRepo()

    const result = await generateContextPayload(rootDir, '4')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.includedFiles).toEqual(['.ai/tech-docs.md'])
    expect(generatedContent).toContain('# --- FILE: .ai/tech-docs.md ---')
    expect(generatedContent).not.toContain('DEVOPS.md')
  })
})
