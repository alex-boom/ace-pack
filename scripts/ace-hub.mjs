import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline'
import { pathToFileURL } from 'node:url'
import { getMemoryPath, readMemoryFile, writeMemoryFile } from './ai-memory-utils.mjs'
export const GENERATED_CONTEXT_PATH = getMemoryPath('generatedContext')
function requiredFile(filePath) { return { path: filePath, required: true } }
function optionalFile(filePath) { return { path: filePath, required: false } }
export const HUB_MODES = [
  {
    id: 'start',
    number: '1',
    aliases: ['coder'],
    label: 'Start / AI Coder Context',
    description: 'Brief, active task state, conventions, and reflection.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/state/task-state.md'),
      requiredFile('.ai/knowledge/reflection-log.md'),
    ],
  },
  {
    id: 'architect',
    number: '2',
    aliases: [],
    label: 'AI Architect Context',
    description: 'Repo rules, technical docs, decisions, roadmap, and brief.',
    files: [
      requiredFile('AGENTS.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/knowledge/tech-docs.md'),
      requiredFile('.ai/knowledge/decisions.md'),
      requiredFile('.ai/knowledge/product-roadmap.md'),
      optionalFile('.ai/generated/report-brief.md'),
    ],
  },
  {
    id: 'architect-lite',
    aliases: ['plan'],
    label: 'AI Architect Lite Context',
    description: 'Brief, repo rules, roadmap, and technical docs without full decisions history.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('AGENTS.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/knowledge/product-roadmap.md'),
      requiredFile('.ai/knowledge/tech-docs.md'),
    ],
  },
  {
    id: 'business',
    number: '3',
    aliases: [],
    label: 'Business Report',
    description: 'Roadmap and recent work log for human review.',
    files: [requiredFile('.ai/knowledge/product-roadmap.md'), requiredFile('.ai/knowledge/work-log.md')],
  },
  {
    id: 'docs',
    number: '4',
    aliases: [],
    label: 'Developer Docs',
    description: 'Technical docs and optional setup/devops notes.',
    files: [requiredFile('.ai/knowledge/tech-docs.md'), optionalFile('DEVOPS.md')],
  },
  {
    id: 'handoff',
    aliases: [],
    label: 'Agent Handoff Context',
    description: 'Brief, task state, and decisions.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('.ai/state/task-state.md'),
      requiredFile('.ai/knowledge/decisions.md'),
    ],
  },
  {
    id: 'pr',
    aliases: [],
    label: 'PR Summary Context',
    description: 'Brief, task state, verification, and git summary.',
    includeGitSummary: true,
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('.ai/state/task-state.md'),
    ],
  },
]
export const HUB_MENU = `[ACE] Agentic Context Engine - Knowledge Hub
Select the context payload you want to generate:
${HUB_MODES.map((mode) => {
  const selector = mode.number ?? mode.id
  return `[${selector}] ${mode.label} (${mode.description})`
})
  .join('\n')}
`
export function listHubModes() {
  return HUB_MODES.map((mode) => {
    const names = [mode.number, mode.id, ...mode.aliases].filter(Boolean).join(', ')
    return `${names.padEnd(20)} ${mode.label} - ${mode.description}`
  }).join('\n')
}
export function resolveHubMode(selection) {
  const normalized = String(selection ?? '')
    .trim()
    .toLowerCase()
  const mode = HUB_MODES.find((candidate) => {
    return (
      candidate.id === normalized ||
      candidate.number === normalized ||
      candidate.aliases.includes(normalized)
    )
  })
  if (!mode) {
    throw new Error(`Invalid ACE hub mode: ${selection}`)
  }
  return mode
}
export async function generateContextPayload(rootDir, selection, options = {}) {
  const mode = resolveHubMode(selection)
  const sections = []
  const includedFiles = []
  const missingOptionalFiles = []
  for (const file of mode.files) {
    const content = await readContextFile(rootDir, file)
    if (content === null) {
      missingOptionalFiles.push(file.path)
      continue
    }
    includedFiles.push(file.path)
    sections.push(formatContextSection(file.path, content))
  }
  const gitSummary = mode.includeGitSummary ? await collectGitSummary(rootDir) : null
  const generatedAt = new Date().toISOString()
  const payload = formatContextPayload({
    generatedAt,
    gitSummary,
    includedFiles,
    missingOptionalFiles,
    mode,
    sections,
  })
  const shouldWrite = options.writeOutput !== false
  let outputPath = null
  if (shouldWrite && options.outputPath) {
    outputPath = resolveOutputPath(rootDir, options.outputPath)
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, payload, 'utf8')
  } else if (shouldWrite) {
    const [relativeOutputPath] = await writeMemoryFile(rootDir, 'generatedContext', payload)
    outputPath = path.join(rootDir, relativeOutputPath)
  }
  return {
    generatedAt,
    gitSummary,
    includedFiles,
    missingOptionalFiles,
    mode: {
      id: mode.id,
      label: mode.label,
    },
    outputPath,
    payload,
  }
}
function resolveOutputPath(rootDir, outputPath) {
  if (path.isAbsolute(outputPath)) {
    return outputPath
  }
  return path.join(rootDir, outputPath)
}
async function readContextFile(rootDir, file) {
  const content = await readMemoryFile(rootDir, file.path)
  if (content !== null) {
    return content
  }
  try {
    return await readFile(path.join(rootDir, file.path), 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      throw error
    }
  }
  if (file.required) {
    throw new Error(`Missing required context file: ${file.path}`)
  }
  return null
}
function formatContextPayload({
  generatedAt,
  gitSummary,
  includedFiles,
  missingOptionalFiles,
  mode,
  sections,
}) {
  const header = [
    '# ACE Hub Context',
    `- Mode: ${mode.id} (${mode.label})`,
    `- Generated: ${generatedAt}`,
    `- Included files: ${includedFiles.length > 0 ? includedFiles.join(', ') : 'none'}`,
    `- Missing optional files: ${
      missingOptionalFiles.length > 0 ? missingOptionalFiles.join(', ') : 'none'
    }`,
  ]
  if (gitSummary) {
    header.push(`- Git summary: ${gitSummary.status}`, '', '## Git Summary', '```text')
    header.push(gitSummary.details.trimEnd())
    header.push('```')
  }
  return `${header.join('\n')}\n\n${sections.join('\n\n')}\n`
}
function formatContextSection(filePath, content) {
  return `# --- FILE: ${filePath} ---\n\n${content.trimEnd()}`
}
async function collectGitSummary(rootDir) {
  const [statusResult, diffStatResult] = await Promise.allSettled([
    execGit(rootDir, ['status', '--short']),
    execGit(rootDir, ['diff', '--stat', 'HEAD']),
  ])
  if (statusResult.status === 'rejected' || diffStatResult.status === 'rejected') {
    return {
      status: 'unknown',
      details: 'Git summary: unknown',
    }
  }
  const status = statusResult.value.trim() || 'clean'
  const diffStat = diffStatResult.value.trim() || 'No diff stat.'
  return {
    status: 'available',
    details: `Status:\n${status}\n\nDiff stat:\n${diffStat}`,
  }
}
function execGit(rootDir, args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: rootDir, timeout: 5000 }, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
}
function parseHubArgs(argv) {
  const parsed = {
    json: false,
    list: false,
    mode: null,
    outputPath: null,
    stdout: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      parsed.help = true
      continue
    }
    if (arg === '--list') {
      parsed.list = true
      continue
    }
    if (arg === '--stdout') {
      parsed.stdout = true
      continue
    }
    if (arg === '--json') {
      parsed.json = true
      continue
    }
    if (arg === '--mode') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --mode')
      }
      parsed.mode = value
      index += 1
      continue
    }
    if (arg === '--output') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --output')
      }
      parsed.outputPath = value
      index += 1
      continue
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown ACE hub option: ${arg}`)
    }
    if (parsed.mode) {
      throw new Error(`Unexpected ACE hub argument: ${arg}`)
    }
    parsed.mode = arg
  }
  if (parsed.json && parsed.stdout) {
    throw new Error('--json cannot be combined with --stdout')
  }
  return parsed
}
function formatHelp() {
  return `ACE Hub
Usage:
  ace hub
  ace hub <mode>
  ace hub --mode <mode>
  ace hub --list
Options:
  --mode <mode>    Generate a named or numeric mode.
  --output <path>  Write context to a custom path.
  --stdout         Print context payload instead of writing a file.
  --json           Print generation metadata as JSON.
  --list           List available modes.
  --help           Show this help.
Modes:
${listHubModes()}
`
}
function formatCliSummary(result) {
  const lines = [
    `[ACE] Context generated for ${result.mode.id} (${result.mode.label}).`,
    `[ACE] Included ${result.includedFiles.length} file(s).`,
  ]
  if (result.missingOptionalFiles.length > 0) {
    lines.push(`[ACE] Missing optional files: ${result.missingOptionalFiles.join(', ')}`)
  }
  if (result.outputPath) {
    lines.push(`[ACE] Saved to ${path.relative(process.cwd(), result.outputPath) || result.outputPath}.`)
  }
  return `${lines.join('\n')}\n`
}
function formatJsonResult(result) {
  return JSON.stringify(
    {
      generatedAt: result.generatedAt,
      gitSummary: result.gitSummary,
      includedFiles: result.includedFiles,
      missingOptionalFiles: result.missingOptionalFiles,
      mode: result.mode,
      outputPath: result.outputPath,
    },
    null,
    2,
  )
}
async function promptSelection() {
  const rl = readline.createInterface({ input, output })
  return new Promise((resolve) => {
    rl.question('Enter option: ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}
async function main() {
  try {
    const args = parseHubArgs(process.argv.slice(2))
    if (args.help) {
      process.stdout.write(formatHelp())
      return
    }
    if (args.list) {
      process.stdout.write(`${listHubModes()}\n`)
      return
    }
    let selection = args.mode
    if (!selection) {
      process.stdout.write(`${HUB_MENU}\n`)
      selection = await promptSelection()
    }
    const result = await generateContextPayload(process.cwd(), selection, {
      outputPath: args.outputPath,
      writeOutput: !args.stdout,
    })
    if (args.json) {
      process.stdout.write(`${formatJsonResult(result)}\n`)
      return
    }
    if (args.stdout) {
      process.stdout.write(result.payload)
      return
    }
    process.stdout.write(formatCliSummary(result))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exit(1)
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
