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
    const activeConfig = JSON.parse(
      await readFile(path.join(rootDir, '.ai/config/memory-config.json'), 'utf8'),
    )
    const profileContent = await readFile(
      path.join(rootDir, '.ai/config/project-profile.md'),
      'utf8',
    )
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
    expect(profileContent).toContain('## Why Detected')
    expect(profileContent).toContain('Next.js / TypeScript: `next.config.ts`')
    expect(profileContent).toContain('tRPC / API routers: `@trpc/server`')
    expect(profileContent).toContain('Drizzle / database: `drizzle-orm`')
  })

  it('applies detected recommendations and passes the onboarding check', async () => {
    const rootDir = await createRepo('ace-onboard-apply-')

    await writeRepoFile(rootDir, 'requirements.txt', 'fastapi==0.115.0\n')
    await writeRepoFile(rootDir, 'app/core/security.py', 'def verify():\n    return True\n')

    const beforeApply = await onboardRepository(rootDir, { check: true })

    expect(beforeApply.status).toBe('failed')

    const applyResult = await onboardRepository(rootDir, { apply: true })
    const checkResult = await onboardRepository(rootDir, { check: true })
    const activeConfig = JSON.parse(
      await readFile(path.join(rootDir, '.ai/config/memory-config.json'), 'utf8'),
    )
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
    const activeConfig = JSON.parse(
      await readFile(path.join(rootDir, '.ai/config/memory-config.json'), 'utf8'),
    )
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

  it('profiles JS and TypeScript backend signals conservatively', async () => {
    const rootDir = await createRepo('ace-onboard-node-api-')

    await writeRepoFile(
      rootDir,
      'package.json',
      JSON.stringify(
        {
          dependencies: {
            '@nestjs/core': '^11.0.0',
            '@prisma/client': '^6.0.0',
            express: '^5.0.0',
            fastify: '^5.0.0',
            typeorm: '^0.3.0',
          },
        },
        null,
        2,
      ),
    )
    await writeRepoFile(rootDir, 'src/routes/users.ts', 'export const routes = true\n')
    await writeRepoFile(rootDir, 'src/middleware/auth.ts', 'export const middleware = true\n')
    await writeRepoFile(rootDir, 'prisma/schema.prisma', 'model User { id String @id }\n')
    await writeRepoFile(rootDir, 'apps/web/src/index.ts', 'export const app = true\n')
    await writeRepoFile(rootDir, 'packages/ui/button.ts', 'export const Button = true\n')

    const profile = await profileRepository(rootDir)
    const paths = profile.recommendedPaths.map((rule) => rule.pattern)

    expect(profile.ecosystems).toContain('Node.js API / backend')
    expect(paths).toEqual(
      expect.arrayContaining(['src/routes/**', 'src/middleware/**', 'prisma/schema.prisma']),
    )
    expect(paths).not.toContain('apps/**')
    expect(paths).not.toContain('packages/**')
  })

  it('profiles Python Django, Flask, and database tooling signals', async () => {
    const rootDir = await createRepo('ace-onboard-python-web-')

    await writeRepoFile(
      rootDir,
      'pyproject.toml',
      '[project]\ndependencies = ["django", "flask", "sqlalchemy", "alembic"]\n',
    )
    await writeRepoFile(rootDir, 'project/settings.py', 'SECRET_KEY = "test"\n')
    await writeRepoFile(rootDir, 'project/urls.py', 'urlpatterns = []\n')
    await writeRepoFile(rootDir, 'app/routes/users.py', 'routes = []\n')
    await writeRepoFile(rootDir, 'app/db/session.py', 'engine = None\n')
    await writeRepoFile(rootDir, 'alembic/env.py', 'config = None\n')

    const profile = await profileRepository(rootDir)
    const paths = profile.recommendedPaths.map((rule) => rule.pattern)

    expect(profile.ecosystems).toEqual(
      expect.arrayContaining(['Python / Django', 'Python / Flask', 'Python / database']),
    )
    expect(paths).toEqual(
      expect.arrayContaining(['**/settings.py', 'app/routes/**', 'app/db/**', 'alembic/**']),
    )
  })

  it('profiles Rust service signals and package manager', async () => {
    const rootDir = await createRepo('ace-onboard-rust-')

    await writeRepoFile(
      rootDir,
      'Cargo.toml',
      '[package]\nname = "api"\n[dependencies]\naxum = "0.8"\nsqlx = "0.8"\n',
    )
    await writeRepoFile(rootDir, 'src/auth/mod.rs', 'pub fn auth() {}\n')
    await writeRepoFile(rootDir, 'src/middleware/mod.rs', 'pub fn middleware() {}\n')
    await writeRepoFile(rootDir, 'src/handlers/users.rs', 'pub fn handler() {}\n')
    await writeRepoFile(rootDir, 'migrations/001_init.sql', 'select 1;\n')

    const profile = await profileRepository(rootDir)
    const paths = profile.recommendedPaths.map((rule) => rule.pattern)

    expect(profile.ecosystems).toContain('Rust service')
    expect(profile.packageManager).toBe('cargo')
    expect(paths).toEqual(
      expect.arrayContaining([
        'src/auth/**',
        'src/middleware/**',
        'src/handlers/**',
        'migrations/**',
      ]),
    )
  })

  it('profiles generic monorepos without broad apps or packages rules', async () => {
    const rootDir = await createRepo('ace-onboard-monorepo-')

    await writeRepoFile(
      rootDir,
      'package.json',
      JSON.stringify({ private: true, workspaces: ['apps/*', 'packages/*'] }, null, 2),
    )
    await writeRepoFile(rootDir, 'pnpm-workspace.yaml', 'packages:\n  - apps/*\n  - packages/*\n')
    await writeRepoFile(rootDir, 'turbo.json', '{"tasks":{}}\n')
    await writeRepoFile(rootDir, 'apps/web/src/app/api/users/route.ts', 'export const GET = true\n')
    await writeRepoFile(rootDir, 'apps/web/src/index.ts', 'export const app = true\n')
    await writeRepoFile(rootDir, 'packages/auth/src/index.ts', 'export const auth = true\n')
    await writeRepoFile(rootDir, 'packages/ui/button.ts', 'export const Button = true\n')

    const profile = await profileRepository(rootDir)
    const paths = profile.recommendedPaths.map((rule) => rule.pattern)

    expect(profile.ecosystems).toContain('Generic monorepo')
    expect(paths).toEqual(
      expect.arrayContaining(['apps/*/src/app/api/**', 'packages/auth/**']),
    )
    expect(paths).not.toContain('apps/**')
    expect(paths).not.toContain('packages/**')
  })

  it('prints a concise onboarding summary for dry-run UX', async () => {
    const rootDir = await createRepo('ace-onboard-cli-summary-')

    await writeRepoFile(rootDir, 'go.mod', 'module example.com/service\n')
    await writeRepoFile(rootDir, 'internal/auth/token.go', 'package auth\n')

    const { stdout } = await execFileAsync(process.execPath, [
      path.resolve('scripts/ace-onboard.mjs'),
      '--root',
      rootDir,
    ])

    expect(stdout).toContain('[ACE] Detected Go service.')
    expect(stdout).toContain('[ACE] Found 1 project-specific high-risk path rule.')
    expect(stdout).toContain('ACE project profile generated.')
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
