import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { ensureAgentMemory } from '../scripts/agent-memory-lib.mjs'
import {
  RECOMMENDED_CONFIG_PATH,
  onboardRepository,
  profileRepository,
} from '../scripts/ace-onboard.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)

async function createRepo(prefix: string) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), prefix))

  tempDirs.push(rootDir)

  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('ace:onboard', () => {
  it('profiles a Next/tRPC/Drizzle repository without changing the active config by default', async () => {
    const rootDir = await createRepo('ace-onboard-next-')

    await writeRepoFile(
      rootDir,
      'package.json',
      JSON.stringify(
        {
          dependencies: {
            '@trpc/server': '^11.0.0',
            'drizzle-orm': '^0.38.0',
            next: '^16.0.0',
          },
        },
        null,
        2,
      ),
    )
    await writeRepoFile(rootDir, 'next.config.ts', 'export default {}\n')
    await writeRepoFile(rootDir, 'packages/auth/src/index.ts', 'export const auth = true\n')
    await writeRepoFile(rootDir, 'packages/db/src/schema/users.ts', 'export const users = true\n')
    await writeRepoFile(rootDir, 'packages/api/src/routers/users.ts', 'export const router = true\n')
    await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep rules here.\n')
    await ensureAgentMemory(rootDir)

    const result = await onboardRepository(rootDir)
    const activeConfig = JSON.parse(await readFile(path.join(rootDir, '.ai/memory-config.json'), 'utf8'))
    const recommendedConfig = JSON.parse(
      await readFile(path.join(rootDir, RECOMMENDED_CONFIG_PATH), 'utf8'),
    )
    const recommendedPaths = recommendedConfig.highRiskPaths.map(
      (rule: { pattern: string }) => rule.pattern,
    )

    expect(result.applied).toBe(false)
    expect(result.detectedEcosystems).toEqual(
      expect.arrayContaining([
        'Next.js / TypeScript',
        'tRPC / API routers',
        'Drizzle / database',
      ]),
    )
    expect(activeConfig._profile.status).toBe('unprofiled')
    expect(recommendedPaths).toEqual(
      expect.arrayContaining([
        'packages/api/src/routers/**',
        'packages/db/src/schema/**',
        'packages/auth/**',
      ]),
    )
  })

  it('applies detected recommendations and passes the onboarding check', async () => {
    const rootDir = await createRepo('ace-onboard-apply-')

    await writeRepoFile(rootDir, 'requirements.txt', 'fastapi==0.115.0\n')
    await writeRepoFile(rootDir, 'app/core/security.py', 'def verify():\n    return True\n')

    const beforeApply = await onboardRepository(rootDir, { check: true })

    expect(beforeApply.status).toBe('failed')

    const applyResult = await onboardRepository(rootDir, { apply: true })
    const checkResult = await onboardRepository(rootDir, { check: true })
    const activeConfig = JSON.parse(await readFile(path.join(rootDir, '.ai/memory-config.json'), 'utf8'))
    const activePaths = activeConfig.highRiskPaths.map((rule: { pattern: string }) => rule.pattern)

    expect(applyResult.applied).toBe(true)
    expect(checkResult).toEqual({ issues: [], status: 'ok' })
    expect(activeConfig._profile.status).toBe('profiled')
    expect(activePaths).toContain('app/core/security.py')
  })

  it('applies the Next/tRPC/Drizzle SaaS preset explicitly', async () => {
    const rootDir = await createRepo('ace-onboard-preset-')

    const result = await onboardRepository(rootDir, {
      apply: true,
      preset: 'next-trpc-drizzle-saas',
    })
    const activeConfig = JSON.parse(await readFile(path.join(rootDir, '.ai/memory-config.json'), 'utf8'))
    const activePaths = activeConfig.highRiskPaths.map((rule: { pattern: string }) => rule.pattern)

    expect(result.applied).toBe(true)
    expect(activeConfig._profile).toMatchObject({
      preset: 'next-trpc-drizzle-saas',
      status: 'profiled',
    })
    expect(activePaths).toEqual(
      expect.arrayContaining([
        'packages/auth/**',
        'packages/db/src/schema/**',
        'packages/api/src/routers/**',
      ]),
    )
  })

  it('profiles Python FastAPI and Go repositories with ecosystem-specific paths', async () => {
    const pythonRoot = await createRepo('ace-onboard-python-')
    const goRoot = await createRepo('ace-onboard-go-')

    await writeRepoFile(pythonRoot, 'requirements.txt', 'fastapi==0.115.0\n')
    await writeRepoFile(pythonRoot, 'app/core/security.py', 'def verify():\n    return True\n')
    await writeRepoFile(goRoot, 'go.mod', 'module example.com/service\n')
    await writeRepoFile(goRoot, 'internal/auth/token.go', 'package auth\n')

    const pythonProfile = await profileRepository(pythonRoot)
    const goProfile = await profileRepository(goRoot)

    expect(pythonProfile.ecosystems).toContain('Python / FastAPI')
    expect(pythonProfile.recommendedPaths.map((rule) => rule.pattern)).toContain(
      'app/core/security.py',
    )
    expect(goProfile.ecosystems).toContain('Go service')
    expect(goProfile.recommendedPaths.map((rule) => rule.pattern)).toContain('internal/auth/**')
  })

  it('keeps JSON output parseable while writing the ACE banner to stderr', async () => {
    const rootDir = await createRepo('ace-onboard-json-')

    await writeRepoFile(rootDir, 'go.mod', 'module example.com/service\n')

    const { stderr, stdout } = await execFileAsync(process.execPath, [
      path.resolve('scripts/ace-onboard.mjs'),
      '--root',
      rootDir,
      '--json',
    ])
    const parsed = JSON.parse(stdout)

    expect(stderr).toContain('[ACE] Agentic Context Engine initialized...')
    expect(parsed.status).toBe('ok')
    expect(parsed.detectedEcosystems).toContain('Go service')
  })
})
