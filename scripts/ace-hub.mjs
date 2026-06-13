import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline'
import { pathToFileURL } from 'node:url'

export const GENERATED_CONTEXT_PATH = '.ai/generated-context.md'

export const HUB_MENU = `[ACE] Agentic Context Engine - Knowledge Hub
Select the context payload you want to generate:

[1] AI Coder Context (For Cursor/VSCode agent: Task, changed files, handoff, reflection)
[2] AI Architect Context (For Browser AI: Strict rules, tech docs, decisions, roadmap. HIGH DENSITY, LOW TOKEN)
[3] Business Report (For Humans: Roadmap and recent work log)
[4] Developer Docs (For Onboarding: Tech docs and devops/setup)
`

const CONTEXT_PAYLOADS = {
  1: [
    optionalFile('.ai/report-brief.md'),
    requiredFile('.ai/current-task.md'),
    requiredFile('.ai/session-handoff.md'),
    requiredFile('.ai/changed-files.md'),
    requiredFile('.ai/reflection-log.md'),
  ],
  2: [
    requiredFile('AGENTS.md'),
    requiredFile('.ai/tech-docs.md'),
    requiredFile('.ai/decisions.md'),
    requiredFile('.ai/product-roadmap.md'),
  ],
  3: [requiredFile('.ai/product-roadmap.md'), requiredFile('.ai/work-log.md')],
  4: [requiredFile('.ai/tech-docs.md'), optionalFile('DEVOPS.md')],
}

export async function generateContextPayload(rootDir, selection) {
  const files = getPayloadFiles(selection)
  const sections = []
  const includedFiles = []

  for (const file of files) {
    const content = await readContextFile(rootDir, file)

    if (content === null) {
      continue
    }

    includedFiles.push(file.path)
    sections.push(formatContextSection(file.path, content))
  }

  const outputPath = path.join(rootDir, GENERATED_CONTEXT_PATH)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${sections.join('\n\n')}\n`, 'utf8')

  return {
    includedFiles,
    outputPath,
  }
}

function getPayloadFiles(selection) {
  const payload = CONTEXT_PAYLOADS[selection.trim()]

  if (!payload) {
    throw new Error(`Invalid ACE hub option: ${selection}`)
  }

  return payload
}

async function readContextFile(rootDir, file) {
  const filePath = path.join(rootDir, file.path)

  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      if (file.required) {
        throw new Error(`Missing required context file: ${file.path}`)
      }

      return null
    }

    throw error
  }
}

function formatContextSection(filePath, content) {
  return `# --- FILE: ${filePath} ---\n\n${content.trimEnd()}`
}

function requiredFile(filePath) {
  return {
    path: filePath,
    required: true,
  }
}

function optionalFile(filePath) {
  return {
    path: filePath,
    required: false,
  }
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
  process.stdout.write(`${HUB_MENU}\n`)

  const selection = process.argv[2] ?? (await promptSelection())

  try {
    await generateContextPayload(process.cwd(), selection)
    process.stdout.write(
      "Context generated and saved to .ai/generated-context.md. Copy this file's content to your AI.\n",
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exit(1)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
