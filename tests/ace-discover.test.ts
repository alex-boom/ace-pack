import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import {
  PROJECT_CONVENTIONS_MARKER,
  PROJECT_CONVENTIONS_PATH,
  discoverProjectConventions,
} from '../scripts/ace-discover.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)
const discoverScriptPath = path.resolve('scripts/ace-discover.mjs')

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

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

describe('ace discover', () => {
  it('discovers React and Tailwind UI conventions as a concise summary', async () => {
    const rootDir = await createRepo('ace-discover-react-')

    await writeRepoFile(
      rootDir,
      'package.json',
      JSON.stringify(
        {
          dependencies: {
            '@radix-ui/react-dialog': '^1.0.0',
            next: '^16.0.0',
            react: '^19.0.0',
            tailwindcss: '^4.0.0',
          },
        },
        null,
        2,
      ),
    )
    await writeRepoFile(rootDir, 'tailwind.config.ts', 'export default {}\n')
    await writeRepoFile(
      rootDir,
      'src/components/Button.tsx',
      'export function Button() { return <button className="rounded" /> }\n',
    )
    await writeRepoFile(rootDir, 'src/components/forms/Input.tsx', 'export function Input() {}\n')
    await writeRepoFile(rootDir, 'app/api/users/route.ts', 'export const GET = () => Response.json({})\n')

    const result = await discoverProjectConventions(rootDir)
    const conventions = await readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')

    expect(result.detectedEcosystems).toEqual(expect.arrayContaining(['Next.js / TypeScript', 'React']))
    expect(conventions).toContain(PROJECT_CONVENTIONS_MARKER)
    expect(conventions).toContain('Component folders: `src/components`')
    expect(conventions).toContain('Styling uses Tailwind CSS.')
    expect(conventions).toContain('UI uses Radix primitives.')
    expect(conventions).toContain('Next.js app-router API routes are present.')
  })

  it('discovers Go service logging, error handling, and package layout', async () => {
    const rootDir = await createRepo('ace-discover-go-')

    await writeRepoFile(rootDir, 'go.mod', 'module example.com/service\nrequire go.uber.org/zap v1.27.0\n')
    await writeRepoFile(
      rootDir,
      'internal/handlers/users.go',
      'package handlers\n\nimport "go.uber.org/zap"\n\nfunc h() { _ = apperrors.Wrap(nil, "users") }\n',
    )
    await writeRepoFile(rootDir, 'internal/router/router.go', 'package router\n')
    await writeRepoFile(rootDir, 'internal/models/user.go', 'package models\n')

    const result = await discoverProjectConventions(rootDir)
    const conventions = await readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')

    expect(result.detectedEcosystems).toContain('Go service')
    expect(conventions).toContain('Logging uses zap')
    expect(conventions).toContain('Errors are wrapped with `apperrors.Wrap(...)`.')
    expect(conventions).toContain('Go HTTP handlers live under `internal/handlers`.')
    expect(conventions).toContain('Data/model folders: `internal/models`')
  })

  it('discovers Python FastAPI, Pydantic, SQLAlchemy, and dependency injection', async () => {
    const rootDir = await createRepo('ace-discover-fastapi-')

    await writeRepoFile(
      rootDir,
      'pyproject.toml',
      '[project]\ndependencies = ["fastapi", "sqlalchemy", "pydantic"]\n',
    )
    await writeRepoFile(
      rootDir,
      'app/api/users.py',
      'from fastapi import APIRouter, Depends\nfrom sqlalchemy.orm import Session\nfrom pydantic import BaseModel\n\nrouter = APIRouter()\n',
    )
    await writeRepoFile(rootDir, 'app/db/session.py', 'from sqlalchemy import create_engine\n')
    await writeRepoFile(rootDir, 'app/schemas/user.py', 'from pydantic import BaseModel\n')

    const result = await discoverProjectConventions(rootDir)
    const conventions = await readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')

    expect(result.detectedEcosystems).toContain('Python / FastAPI')
    expect(conventions).toContain('Routing uses FastAPI routers.')
    expect(conventions).toContain('FastAPI dependency injection uses `Depends(...)`.')
    expect(conventions).toContain('ORM/data access uses SQLAlchemy imports.')
    expect(conventions).toContain('Schemas use Pydantic imports.')
  })

  it('preserves unmanaged conventions files unless force is passed', async () => {
    const rootDir = await createRepo('ace-discover-preserve-')
    const customContent = '# Project Conventions\n\nHuman-written rules.\n'

    await writeRepoFile(rootDir, PROJECT_CONVENTIONS_PATH, customContent)

    await expect(discoverProjectConventions(rootDir)).rejects.toThrow('not ACE-managed')
    await expect(readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')).resolves.toBe(
      customContent,
    )

    await discoverProjectConventions(rootDir, { force: true })

    await expect(readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')).resolves.toContain(
      PROJECT_CONVENTIONS_MARKER,
    )
  })

  it('prints markdown to stdout mode without writing the default file', async () => {
    const rootDir = await createRepo('ace-discover-stdout-')

    await writeRepoFile(rootDir, 'go.mod', 'module example.com/service\n')

    const result = await discoverProjectConventions(rootDir, { write: false })

    expect(result.written).toBe(false)
    expect(result.markdown).toContain('# Project Conventions and Pattern Registry')
    await expect(readFile(path.join(rootDir, PROJECT_CONVENTIONS_PATH), 'utf8')).rejects.toThrow()
  })

  it('prints parseable JSON metadata from the CLI', async () => {
    const rootDir = await createRepo('ace-discover-json-')

    await writeRepoFile(rootDir, 'go.mod', 'module example.com/service\n')

    const { stderr, stdout } = await execFileAsync(process.execPath, [
      discoverScriptPath,
      '--root',
      rootDir,
      '--json',
    ])
    const parsed = JSON.parse(stdout)

    expect(stderr).toContain('[ACE] Agentic Context Engine initialized...')
    expect(parsed).toMatchObject({
      status: 'ok',
      written: true,
    })
    expect(parsed.detectedEcosystems).toContain('Go service')
  })

  it('keeps generated markdown concise for large component folders', async () => {
    const rootDir = await createRepo('ace-discover-large-')

    await writeRepoFile(
      rootDir,
      'package.json',
      JSON.stringify({ dependencies: { react: '^19.0.0', tailwindcss: '^4.0.0' } }, null, 2),
    )

    for (let index = 0; index < 30; index += 1) {
      await writeRepoFile(
        rootDir,
        `src/components/Component${index}.tsx`,
        `export function Component${index}() { return <div className="p-2" /> }\n`,
      )
    }

    const result = await discoverProjectConventions(rootDir)

    expect(result.markdown).toContain('Component folders: `src/components`')
    expect(result.markdown).not.toContain('Component29')
    expect(result.markdown.split('\n').length).toBeLessThan(60)
  })
})
