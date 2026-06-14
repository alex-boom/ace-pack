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
    '.ai/current-task.md',
    '# Current Task\n\n## Goal\nTask notes.\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/session-handoff.md',
    '# Session Handoff\n\n## Next Steps\n- Continue.\n\n## Verification\n- `npm.cmd test`\n',
  )
  await writeRepoFile(
    rootDir,
    '.ai/changed-files.md',
    '# Changed Files\n\n[README.md]\n- Updated docs.\n',
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
      '.ai/report-brief.md',
      '.ai/current-task.md',
      '.ai/session-handoff.md',
      '.ai/changed-files.md',
      '.ai/reflection-log.md',
    ])
    expect(generatedContent).toContain('# ACE Hub Context')
    expect(generatedContent).toContain('- Mode: start (Start / AI Coder Context)')
    expect(generatedContent.indexOf('# --- FILE: .ai/report-brief.md ---')).toBeLessThan(
      generatedContent.indexOf('# --- FILE: .ai/current-task.md ---'),
    )
  })

  it('keeps coder context usable before a report brief exists', async () => {
    const rootDir = await createHubRepo()

    await unlink(path.join(rootDir, '.ai', 'report-brief.md'))

    const result = await generateContextPayload(rootDir, 'coder')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.mode.id).toBe('start')
    expect(result.includedFiles).toEqual([
      '.ai/current-task.md',
      '.ai/session-handoff.md',
      '.ai/changed-files.md',
      '.ai/reflection-log.md',
    ])
    expect(result.missingOptionalFiles).toEqual(['.ai/report-brief.md'])
    expect(generatedContent).toContain('- Missing optional files: .ai/report-brief.md')
    expect(generatedContent).not.toContain('# --- FILE: .ai/report-brief.md ---')
    expect(generatedContent).toContain('# --- FILE: .ai/current-task.md ---')
  })

  it('keeps numeric architect, business, and docs modes compatible', async () => {
    const rootDir = await createHubRepo()

    const architect = await generateContextPayload(rootDir, '2')
    const business = await generateContextPayload(rootDir, '3')
    const docs = await generateContextPayload(rootDir, '4')

    expect(architect.mode.id).toBe('architect')
    expect(architect.includedFiles).toEqual([
      'AGENTS.md',
      '.ai/tech-docs.md',
      '.ai/decisions.md',
      '.ai/product-roadmap.md',
      '.ai/report-brief.md',
    ])
    expect(business.mode.id).toBe('business')
    expect(business.includedFiles).toEqual(['.ai/product-roadmap.md', '.ai/work-log.md'])
    expect(docs.mode.id).toBe('docs')
    expect(docs.includedFiles).toEqual(['.ai/tech-docs.md'])
    expect(docs.missingOptionalFiles).toEqual(['DEVOPS.md'])
  })

  it('generates named handoff and PR modes', async () => {
    const rootDir = await createHubRepo()

    const handoff = await generateContextPayload(rootDir, 'handoff')
    const pr = await generateContextPayload(rootDir, 'pr')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(handoff.includedFiles).toEqual([
      '.ai/report-brief.md',
      '.ai/session-handoff.md',
      '.ai/changed-files.md',
      '.ai/current-task.md',
      '.ai/decisions.md',
    ])
    expect(pr.mode.id).toBe('pr')
    expect(pr.gitSummary?.status).toBe('unknown')
    expect(generatedContent).toContain('## Git Summary')
    expect(generatedContent).toContain('Git summary: unknown')
  })

  it('fails clearly when required files are missing', async () => {
    const rootDir = await createHubRepo()

    await unlink(path.join(rootDir, '.ai', 'current-task.md'))

    await expect(generateContextPayload(rootDir, 'start')).rejects.toThrow(
      'Missing required context file: .ai/current-task.md',
    )
  })

  it('includes git status and diff stat for PR mode', async () => {
    const rootDir = await createHubRepo()

    await initGitRepo(rootDir)
    await writeRepoFile(rootDir, '.ai/current-task.md', '# Current Task\n\n## Goal\nChanged.\n')

    const result = await generateContextPayload(rootDir, 'pr')
    const generatedContent = await readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')

    expect(result.gitSummary?.status).toBe('available')
    expect(generatedContent).toContain('- Git summary: available')
    expect(generatedContent).toContain('Status:')
    expect(generatedContent).toContain('M .ai/current-task.md')
    expect(generatedContent).toContain('Diff stat:')
    expect(generatedContent).toContain('.ai/current-task.md')
  })
})

describe('ace hub CLI', () => {
  it('lists available modes', () => {
    const list = listHubModes()

    expect(list).toContain('1, start, coder')
    expect(list).toContain('handoff')
    expect(list).toContain('pr')
    expect(HUB_MENU).toContain('[handoff] Agent Handoff Context')
    expect(HUB_MENU).toContain('[pr] PR Summary Context')
  })

  it('prints available modes with --list', async () => {
    const { stdout } = await execFileAsync(process.execPath, [hubScriptPath, '--list'])

    expect(stdout).toContain('1, start, coder')
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
    expect(parsed.includedFiles[0]).toBe('.ai/report-brief.md')
    expect(generatedContent).toContain('# ACE Hub Context')
  })

  it('prints payload to stdout without writing the default output file', async () => {
    const rootDir = await createHubRepo()

    const { stdout } = await execFileAsync(process.execPath, [hubScriptPath, 'start', '--stdout'], {
      cwd: rootDir,
    })

    await expect(readFile(path.join(rootDir, GENERATED_CONTEXT_PATH), 'utf8')).rejects.toThrow()
    expect(stdout).toContain('# ACE Hub Context')
    expect(stdout).toContain('# --- FILE: .ai/report-brief.md ---')
  })
})
