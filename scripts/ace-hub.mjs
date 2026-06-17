import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline'
import { pathToFileURL } from 'node:url'
import { HUB_MENU, listHubModes, resolveHubMode } from './ace-hub-modes.mjs'
import { buildRedTeamPayload } from './ace-hub-red-team.mjs'
import { buildReviewPayload } from './ace-hub-review.mjs'
import { extractTaskAutonomy } from './ace-task-autonomy.mjs'
import { getMemoryPath, readMemoryFile, writeMemoryFile } from './ai-memory-utils.mjs'
export { HUB_MENU, listHubModes, resolveHubMode } from './ace-hub-modes.mjs'
export const GENERATED_CONTEXT_PATH = getMemoryPath('generatedContext')
export async function generateContextPayload(rootDir, selection, options = {}) {
  const mode = resolveHubMode(selection)
  const sections = [], includedFiles = [], missingOptionalFiles = []
  const taskAutonomy = extractTaskAutonomy(await readMemoryFile(rootDir, 'taskState'))
  const generatedAt = new Date().toISOString()
  if (mode.reviewPayload) {
    return writePayloadResult(rootDir, {
      ...(await buildReviewPayload(rootDir, { generatedAt, mode, taskAutonomy })),
      generatedAt,
      mode,
      options,
    })
  }
  if (mode.redTeamPayload) {
    return writePayloadResult(rootDir, {
      ...(await buildRedTeamPayload(rootDir, { generatedAt, mode, taskAutonomy })),
      generatedAt,
      mode,
      options,
    })
  }
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
  const payload = formatContextPayload({
    generatedAt,
    gitSummary,
    includedFiles,
    missingOptionalFiles,
    mode,
    sections,
    taskAutonomy,
  })
  return writePayloadResult(rootDir, {
    generatedAt,
    gitSummary,
    includedFiles,
    missingOptionalFiles,
    mode,
    options,
    payload,
  })
}
async function writePayloadResult(rootDir, {
  generatedAt,
  gitSummary,
  includedFiles,
  missingOptionalFiles,
  mode,
  options,
  payload,
}) {
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
  taskAutonomy,
}) {
  const header = [
    '# ACE Hub Context',
    `- Mode: ${mode.id} (${mode.label})`,
    `- Current Phase: ${taskAutonomy.currentPhase}`,
    `- Next Autonomous Action: ${taskAutonomy.nextAutonomousAction}`,
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
  const parsed = { json: false, list: false, mode: null, outputPath: null, stdout: false }
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
