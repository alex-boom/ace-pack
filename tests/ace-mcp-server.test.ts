import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { PassThrough, Writable } from 'node:stream'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { ensureAgentMemory } from '../scripts/agent-memory-lib.mjs'
import {
  handleMcpRequest,
  listAceMcpResources,
  readAceMcpResource,
  runMcpStdioServer,
} from '../scripts/ace-mcp-server.mjs'

const tempDirs: string[] = []
const execFileAsync = promisify(execFile)

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

async function createMcpRepo() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ace-mcp-'))
  tempDirs.push(rootDir)

  await writeRepoFile(rootDir, 'AGENTS.md', '# AGENTS.md\n\n## Project Rules\n\nKeep rules.\n')
  await ensureAgentMemory(rootDir)
  await writeRepoFile(rootDir, '.ai/report-brief.md', '# AI Brief Report\n\nReady.\n')
  await writeRepoFile(rootDir, '.ai/generated-context.md', '# ACE Hub Context\n\nReady.\n')
  await writeRepoFile(
    rootDir,
    '.ai/project-conventions.md',
    '# Project Conventions and Pattern Registry\n\nReady.\n',
  )

  return rootDir
}

async function writeRepoFile(rootDir: string, relativePath: string, content: string) {
  const filePath = path.join(rootDir, relativePath)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

describe('ace MCP read-only server', () => {
  it('lists available ACE memory resources', async () => {
    const rootDir = await createMcpRepo()

    const resources = await listAceMcpResources(rootDir)

    expect(resources.map((resource) => resource.uri)).toEqual(
      expect.arrayContaining([
        'ace://memory/report-brief',
        'ace://memory/task-state',
        'ace://memory/current-task',
        'ace://memory/session-handoff',
        'ace://memory/decisions',
        'ace://memory/product-roadmap',
        'ace://memory/project-conventions',
        'ace://memory/tech-docs',
        'ace://memory/generated-context',
      ]),
    )
    expect(resources.every((resource) => resource.mimeType === 'text/markdown')).toBe(true)
  })

  it('reads a known ACE memory resource as markdown text', async () => {
    const rootDir = await createMcpRepo()

    const result = await readAceMcpResource(rootDir, 'ace://memory/report-brief')

    expect(result.contents).toEqual([
      {
        mimeType: 'text/markdown',
        text: '# AI Brief Report\n\nReady.\n',
        uri: 'ace://memory/report-brief',
      },
    ])
  })

  it('returns an initialize response with resource capabilities only', async () => {
    const rootDir = await createMcpRepo()

    const result = await handleMcpRequest(
      {
        id: 1,
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
        },
      },
      {
        packageVersion: '0.5.0-test',
        rootDir,
      },
    )

    expect(result).toMatchObject({
      capabilities: {
        resources: {},
      },
      protocolVersion: '2025-06-18',
      serverInfo: {
        name: 'ace-pack',
        version: '0.5.0-test',
      },
    })
    expect(result).not.toHaveProperty('capabilities.tools')
  })

  it('handles newline-delimited stdio JSON-RPC without non-JSON stdout', async () => {
    const rootDir = await createMcpRepo()
    const input = new PassThrough()
    const output = createMemoryOutput()
    const serverPromise = runMcpStdioServer({ input, output, rootDir })

    input.write(
      `${JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
        },
      })}\n`,
    )
    input.write(
      `${JSON.stringify({
        id: 2,
        jsonrpc: '2.0',
        method: 'resources/list',
      })}\n`,
    )
    input.write(
      `${JSON.stringify({
        id: 3,
        jsonrpc: '2.0',
        method: 'resources/read',
        params: {
          uri: 'ace://memory/current-task',
        },
      })}\n`,
    )
    input.end()

    await serverPromise

    const messages = output
      .content()
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))

    expect(messages).toHaveLength(3)
    expect(messages[0].result.capabilities).toEqual({ resources: {} })
    expect(messages[1].result.resources.length).toBeGreaterThan(0)
    expect(messages[2].result.contents[0].text).toContain('# Task State')
  })

  it('returns JSON-RPC errors for unknown resources and methods', async () => {
    const rootDir = await createMcpRepo()

    await expect(readAceMcpResource(rootDir, 'ace://memory/missing')).rejects.toMatchObject({
      code: -32602,
    })
    await expect(
      handleMcpRequest(
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'tools/list',
        },
        { rootDir },
      ),
    ).rejects.toMatchObject({
      code: -32601,
    })
  })

  it('is included in the installed ACE managed scripts', async () => {
    const rootDir = await createMcpRepo()

    await execFileAsync(process.execPath, [path.resolve('install-ace-pack.mjs'), 'init', rootDir])

    const mcpServer = await readFile(path.join(rootDir, 'scripts/ace-mcp-server.mjs'), 'utf8')

    expect(mcpServer).toContain('runMcpStdioServer')
  })
})

function createMemoryOutput() {
  let buffer = ''

  const stream = new Writable({
    write(chunk, _encoding, callback) {
      buffer += chunk.toString('utf8')
      callback()
    },
  })

  return Object.assign(stream, {
    content: () => buffer,
  })
}
