#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const COMMANDS = new Map([
  ['init', ['bootstrap-agent-memory.mjs']],
  ['check', ['check-agent-memory.mjs']],
  ['validate', ['check-agent-memory.mjs']],
  ['classify', ['ai-task-classify.mjs']],
  ['finish', ['ai-task-finish.mjs']],
  ['gate', ['ace-quality-gate.mjs']],
  ['hub', ['ace-hub.mjs']],
  ['migrate', ['ace-migrate.mjs']],
  ['onboard', ['ace-onboard.mjs']],
  ['report', ['ai-report.mjs']],
  ['report:brief', ['ai-report-brief.mjs']],
  ['brief', ['ai-report-brief.mjs']],
  ['current-task-code', ['ai-report-current-task-code.mjs']],
])

const currentFilePath = fileURLToPath(import.meta.url)
const scriptsDir = path.dirname(currentFilePath)

export function resolveAceCommand(argv) {
  const [command, ...rest] = argv

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    return {
      help: true,
      rest: [],
      scriptName: null,
    }
  }

  if (command === 'report' && rest[0] === 'brief') {
    return {
      help: false,
      rest: rest.slice(1),
      scriptName: 'ai-report-brief.mjs',
    }
  }

  const commandSpec = COMMANDS.get(command)

  if (!commandSpec) {
    throw new Error(`Unknown ACE command: ${command}`)
  }

  return {
    help: false,
    rest,
    scriptName: commandSpec[0],
  }
}

export function getAceHelpText() {
  return `ACE command router

Usage:
  npm run ace -- <command> [args]
  pnpm ace <command> [args]

Commands:
  init                 Initialize ACE memory files.
  check, validate      Validate ACE memory.
  classify             Classify current repository changes.
  finish               Run adaptive task finish.
  gate                 Run PR/CI quality gate.
  hub [mode]           Generate focused context payload.
  migrate              Create schema v2 canonical memory mirrors.
  onboard              Scan project and recommend risk rules.
  report               Generate full report.
  report brief         Generate brief report.
  current-task-code    Generate current-task code report.

Existing scripts such as ace:finish, ace:gate, and ai:task:finish remain
supported for compatibility.
`
}

export async function runAceCommand(argv, options = {}) {
  const resolved = resolveAceCommand(argv)

  if (resolved.help) {
    ;(options.stdout ?? process.stdout).write(getAceHelpText())
    return 0
  }

  const scriptPath = path.join(options.scriptsDir ?? scriptsDir, resolved.scriptName)
  const child = spawn(process.execPath, [scriptPath, ...resolved.rest], {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    stdio: options.stdio ?? 'inherit',
  })

  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === currentFilePath

if (isMainModule) {
  try {
    const exitCode = await runAceCommand(process.argv.slice(2))
    process.exit(exitCode)
  } catch (error) {
    process.stderr.write(`[ACE] ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
}
