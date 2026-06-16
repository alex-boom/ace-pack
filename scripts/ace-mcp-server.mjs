import { readFile } from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { readMemoryFile } from './ai-memory-utils.mjs'

export const MCP_PROTOCOL_VERSION = '2025-06-18'

const currentFilePath = fileURLToPath(import.meta.url)
const packageRoot = path.resolve(path.dirname(currentFilePath), '..')

export const ACE_MCP_RESOURCE_SPECS = [
  {
    description: 'Compact ACE startup snapshot and current project state.',
    filePath: '.ai/generated/report-brief.md',
    name: 'ACE Brief Report',
    title: 'ACE Brief Report',
    uri: 'ace://memory/report-brief',
  },
  {
    description: 'Unified ACE task lifecycle, approach, changed files, handoff, and next steps.',
    filePath: '.ai/state/task-state.md',
    name: 'ACE Task State',
    title: 'ACE Task State',
    uri: 'ace://memory/task-state',
  },
  {
    description: 'Deprecated alias for ACE Task State.',
    filePath: '.ai/state/task-state.md',
    name: 'ACE Current Task (Deprecated Alias)',
    title: 'ACE Current Task (Deprecated Alias)',
    uri: 'ace://memory/current-task',
  },
  {
    description: 'Deprecated alias for ACE Task State.',
    filePath: '.ai/state/task-state.md',
    name: 'ACE Session Handoff (Deprecated Alias)',
    title: 'ACE Session Handoff (Deprecated Alias)',
    uri: 'ace://memory/session-handoff',
  },
  {
    description: 'Durable ACE project decisions and rationale.',
    filePath: '.ai/knowledge/decisions.md',
    name: 'ACE Decisions',
    title: 'ACE Decisions',
    uri: 'ace://memory/decisions',
  },
  {
    description: 'Concise product roadmap and strategic context for ACE handoff.',
    filePath: '.ai/knowledge/product-roadmap.md',
    name: 'ACE Product Roadmap',
    title: 'ACE Product Roadmap',
    uri: 'ace://memory/product-roadmap',
  },
  {
    description: 'Technical architecture and operational context for the repository.',
    filePath: '.ai/knowledge/tech-docs.md',
    name: 'ACE Technical Docs',
    title: 'ACE Technical Docs',
    uri: 'ace://memory/tech-docs',
  },
  {
    description: 'Generated project conventions and pattern registry for agent context.',
    filePath: '.ai/knowledge/project-conventions.md',
    name: 'ACE Project Conventions',
    title: 'ACE Project Conventions',
    uri: 'ace://memory/project-conventions',
  },
  {
    description: 'Last generated ACE hub payload, when available.',
    filePath: '.ai/generated/context.md',
    name: 'ACE Generated Context',
    title: 'ACE Generated Context',
    uri: 'ace://memory/generated-context',
  },
]

export async function listAceMcpResources(rootDir) {
  const resources = []

  for (const resourceSpec of ACE_MCP_RESOURCE_SPECS) {
    const content = await readMemoryFile(rootDir, resourceSpec.filePath)

    if (content === null) {
      continue
    }

    resources.push(formatResource(resourceSpec))
  }

  return resources
}

export async function readAceMcpResource(rootDir, uri) {
  const resourceSpec = ACE_MCP_RESOURCE_SPECS.find((candidate) => candidate.uri === uri)

  if (!resourceSpec) {
    throw createRpcError(-32602, `Unknown ACE MCP resource: ${uri}`)
  }

  const text = await readMemoryFile(rootDir, resourceSpec.filePath)

  if (text === null) {
    throw createRpcError(-32002, `ACE MCP resource is not available: ${uri}`)
  }

  return {
    contents: [
      {
        mimeType: 'text/markdown',
        text,
        uri: resourceSpec.uri,
      },
    ],
  }
}

export async function handleMcpRequest(message, options = {}) {
  const rootDir = path.resolve(options.rootDir ?? process.cwd())
  const packageVersion = options.packageVersion ?? (await readPackageVersion())

  if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    throw createRpcError(-32600, 'Invalid JSON-RPC request.')
  }

  if (message.method === 'initialize') {
    const requestedVersion = message.params?.protocolVersion

    return {
      capabilities: {
        resources: {},
      },
      instructions:
        'ACE MCP exposes read-only Markdown memory resources. It provides no tools and performs no writes.',
      protocolVersion:
        typeof requestedVersion === 'string' && requestedVersion.trim()
          ? requestedVersion
          : MCP_PROTOCOL_VERSION,
      serverInfo: {
        name: 'ace-pack',
        title: 'ACE Pack Read-Only Memory',
        version: packageVersion,
      },
    }
  }

  if (message.method === 'ping') {
    return {}
  }

  if (message.method === 'resources/list') {
    return {
      resources: await listAceMcpResources(rootDir),
    }
  }

  if (message.method === 'resources/read') {
    const uri = message.params?.uri

    if (typeof uri !== 'string' || !uri.trim()) {
      throw createRpcError(-32602, 'resources/read requires params.uri.')
    }

    return readAceMcpResource(rootDir, uri)
  }

  throw createRpcError(-32601, `Unsupported MCP method: ${message.method}`)
}

export async function runMcpStdioServer(options = {}) {
  const input = options.input ?? process.stdin
  const output = options.output ?? process.stdout
  const rootDir = path.resolve(options.rootDir ?? process.cwd())
  const rl = readline.createInterface({
    crlfDelay: Number.POSITIVE_INFINITY,
    input,
  })

  for await (const line of rl) {
    if (!line.trim()) {
      continue
    }

    await handleMcpLine(line, {
      output,
      rootDir,
    })
  }
}

async function handleMcpLine(line, options) {
  let message

  try {
    message = JSON.parse(line)
  } catch {
    writeMcpMessage(options.output, {
      error: {
        code: -32700,
        message: 'Parse error.',
      },
      id: null,
      jsonrpc: '2.0',
    })
    return
  }

  if (message.id === undefined) {
    try {
      await handleMcpRequest(message, options)
    } catch {
      // Notifications do not receive responses.
    }
    return
  }

  try {
    const result = await handleMcpRequest(message, options)
    writeMcpMessage(options.output, {
      id: message.id,
      jsonrpc: '2.0',
      result,
    })
  } catch (error) {
    const rpcError = normalizeRpcError(error)

    writeMcpMessage(options.output, {
      error: rpcError,
      id: message.id ?? null,
      jsonrpc: '2.0',
    })
  }
}

function formatResource(resourceSpec) {
  return {
    description: resourceSpec.description,
    mimeType: 'text/markdown',
    name: resourceSpec.name,
    title: resourceSpec.title,
    uri: resourceSpec.uri,
  }
}

async function readPackageVersion() {
  const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))

  return packageJson.version
}

function writeMcpMessage(output, message) {
  output.write(`${JSON.stringify(message)}\n`)
}

function createRpcError(code, message, data) {
  const error = new Error(message)
  error.code = code
  error.data = data
  return error
}

function normalizeRpcError(error) {
  if (error && typeof error === 'object' && 'code' in error && Number.isInteger(error.code)) {
    return {
      code: error.code,
      data: error.data,
      message: error.message,
    }
  }

  return {
    code: -32603,
    message: error instanceof Error ? error.message : String(error),
  }
}

function parseArgs(argv) {
  const rootIndex = argv.indexOf('--root')

  if (rootIndex === -1) {
    return {
      rootDir: process.cwd(),
    }
  }

  const rootDir = argv[rootIndex + 1]

  if (!rootDir || rootDir.startsWith('-')) {
    throw new Error('Missing value for --root.')
  }

  return {
    rootDir: path.resolve(process.cwd(), rootDir),
  }
}

const isMainModule =
  process.argv[1] !== undefined && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isMainModule) {
  const options = parseArgs(process.argv.slice(2))

  await runMcpStdioServer(options).catch((error) => {
    process.stderr.write(`[ACE MCP] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
