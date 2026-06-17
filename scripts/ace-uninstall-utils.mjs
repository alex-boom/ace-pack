import { access, cp, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  AGENTS_WORKFLOW_END_MARKER,
  AGENTS_WORKFLOW_MARKER,
  AI_FILE_SPECS,
  claudeTemplate,
} from './agent-memory-templates.mjs'
import {
  getMemoryPathCandidates,
  normalizeRelativePath,
  readTextIfExists,
} from './ai-memory-utils.mjs'
export const ACE_ROUTER_SCRIPT = 'node ./scripts/ace-cli.mjs'
export const ACE_VALIDATE_PLACEHOLDER_SCRIPT =
  'echo "Add project mechanical checks here: lint, typecheck, test"'
export const RUNNER_PACKAGE_DESCRIPTION =
  'Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required.'
export const OLD_ACE_PACKAGE_SCRIPTS = {
  'ace:init': 'node ./scripts/bootstrap-agent-memory.mjs',
  'ace:check': 'node ./scripts/check-agent-memory.mjs',
  'ace:classify': 'node ./scripts/ai-task-classify.mjs',
  'ace:discover': 'node ./scripts/ace-discover.mjs',
  'ace:finish': 'node ./scripts/ai-task-finish.mjs',
  'ace:archive': 'node ./scripts/ace-archive.mjs',
  'ace:gate': 'node ./scripts/ace-quality-gate.mjs',
  'ace:hub': 'node ./scripts/ace-hub.mjs',
  'ace:onboard': 'node ./scripts/ace-onboard.mjs',
  'ace:report': 'node ./scripts/ai-report.mjs',
  'ace:report:brief': 'node ./scripts/ai-report-brief.mjs',
  'agent-memory:init': 'node ./scripts/bootstrap-agent-memory.mjs',
  'agent-memory:check': 'node ./scripts/check-agent-memory.mjs',
  'ai:project:onboard': 'node ./scripts/ace-onboard.mjs',
  'ai:report': 'node ./scripts/ai-report.mjs',
  'ai:report:brief': 'node ./scripts/ai-report-brief.mjs',
  'ai:report:currentTaskCode': 'node ./scripts/ai-report-current-task-code.mjs',
  'ai:task:classify': 'node ./scripts/ai-task-classify.mjs',
  'ai:task:finish': 'node ./scripts/ai-task-finish.mjs',
  'ai:update:task': 'node ./scripts/ai-update.mjs task',
  'ai:update:handoff': 'node ./scripts/ai-update.mjs handoff',
  'ai:update:log': 'node ./scripts/ai-update.mjs log',
  'ai:update:decision': 'node ./scripts/ai-update.mjs decision',
  'ai:update:changed': 'node ./scripts/ai-update.mjs changed',
  'ace:validate': 'node ./scripts/check-agent-memory.mjs',
}
export const DEFAULT_PACKAGE_SCRIPTS = {
  ace: ACE_ROUTER_SCRIPT,
  'ace:validate': ACE_VALIDATE_PLACEHOLDER_SCRIPT,
}
export const MANAGED_SCRIPT_FILES = [
  'ace-cli.mjs',
  'ace-archive.mjs',
  'ace-discover.mjs',
  'ace-destroy.mjs',
  'ace-eject.mjs',
  'ace-hub.mjs',
  'ace-hub-distill.mjs',
  'ace-hub-modes.mjs',
  'ace-hub-red-team.mjs',
  'ace-hub-review.mjs',
  'ace-migrate.mjs',
  'ace-mcp-server.mjs',
  'ace-onboard.mjs',
  'ace-project-presets.mjs',
  'ace-quality-gate.mjs',
  'ace-task-autonomy.mjs',
  'ace-task-friction.mjs',
  'ace-task-state.mjs',
  'ace-uninstall-utils.mjs',
  'ace-universal-doc-templates.mjs',
  'agent-memory-lib.mjs',
  'agent-memory-templates.mjs',
  'ai-memory-config.mjs',
  'ai-memory-utils.mjs',
  'ai-markdown-utils.mjs',
  'ai-report-brief.mjs',
  'ai-report-current-task-code.mjs',
  'ai-report.mjs',
  'ai-report-utils.mjs',
  'ai-task-classify.mjs',
  'ai-task-finish.mjs',
  'ai-update.mjs',
  'bootstrap-agent-memory.mjs',
  'check-agent-memory.mjs',
]
export const IDE_BRIDGE_FILES = [
  '.cursorrules',
  '.windsurfrules',
  '.github/copilot-instructions.md',
]
export const IDE_RULES_START_MARKER = '<!-- ace-managed-ide-rules:start -->'
export const IDE_RULES_END_MARKER = '<!-- ace-managed-ide-rules:end -->'
export const DEFAULT_AGENTS_TEMPLATE = `# AGENTS.md
Repository rules for AI coding agents working in this project.
## Project Rules
- Add project-specific stack, architecture, and workflow rules here.
`
const ACE_EXPORT_PATTERN = /^ace-export-\d{8}-\d{6}(?:-\d+)?$/u
const KNOWN_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun']
export async function pathExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}
export async function copyRelativePathIfExists(rootDir, relativePath, exportDir) {
  const sourcePath = path.join(rootDir, relativePath)
  if (!(await pathExists(sourcePath))) {
    return false
  }
  const targetPath = path.join(exportDir, relativePath)
  await mkdir(path.dirname(targetPath), { recursive: true })
  await cp(sourcePath, targetPath, { force: true, recursive: true })
  return true
}
export async function findAceExportDirs(rootDir) {
  let entries = []
  try {
    entries = await readdir(rootDir, { withFileTypes: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return []
    }
    throw error
  }
  const exports = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !ACE_EXPORT_PATTERN.test(entry.name)) {
      continue
    }
    if (await pathExists(path.join(rootDir, entry.name, 'RESTORE.md'))) {
      exports.push(entry.name)
    }
  }
  return exports.sort().reverse()
}
export async function createUniqueExportDir(rootDir, date = new Date()) {
  const baseName = `ace-export-${formatExportTimestamp(date)}`
  for (let index = 0; index < 100; index += 1) {
    const directoryName = index === 0 ? baseName : `${baseName}-${index + 1}`
    const exportDir = path.join(rootDir, directoryName)
    if (await pathExists(exportDir)) {
      continue
    }
    await mkdir(exportDir, { recursive: false })
    return { directoryName, exportDir }
  }
  throw new Error(`Unable to create a unique ACE export directory for ${baseName}.`)
}
export function formatIdeBridgeContent(packageManager, relativePath) {
  return `${IDE_RULES_START_MARKER}
You are managed by ACE (Agentic Context Engine).
1. ALWAYS read \`AGENTS.md\` before starting work.
2. Read \`.ai/generated/report-brief.md\` to understand the current repo state.
3. All project context is located in the \`.ai/\` directory.
4. When finishing a task, you MUST run \`pnpm ace finish\` (or \`npm run ace -- finish\`).
${IDE_RULES_END_MARKER}
`
}
export function isExactAceIdeBridge(relativePath, content) {
  return KNOWN_PACKAGE_MANAGERS.some(
    (packageManager) =>
      normalizeComparableText(content) ===
        normalizeComparableText(formatIdeBridgeContent(packageManager, relativePath)) ||
      normalizeComparableText(content) ===
        normalizeComparableText(formatLegacyIdeBridgeContent(packageManager, relativePath)),
  )
}
function formatLegacyIdeBridgeContent(packageManager, relativePath) {
  const hubCommand = formatAceRouterCommand(packageManager, 'hub start')
  const classifyCommand = formatAceRouterCommand(packageManager, 'classify')
  const finishCommand = formatAceRouterCommand(packageManager, 'finish')
  const checkCommand = formatAceRouterCommand(packageManager, 'check')
  const heading =
    relativePath.endsWith('.md') ? '# ACE IDE Agent Instructions' : '# ACE IDE Agent Bridge'
  return `${heading}
Follow AGENTS.md as the authoritative repository instruction file.
For new work:
- Read .ai/generated/report-brief.md first when it exists.
- Generate startup context with ${hubCommand}.
- Classify the task with ${classifyCommand} before implementation.
- Validate ACE memory with ${checkCommand} when context may be stale.
- Close the task with ${finishCommand} before handoff.
Do not replace AGENTS.md or .ai/* workflow rules with IDE-specific policy. This
file is only a thin bridge from the IDE agent to ACE.
`
}
export function upsertAceIdeRulesBlock(relativePath, content) {
  const managedBlock = formatIdeBridgeContent('npm', relativePath).trimEnd()
  if (isExactAceIdeBridge(relativePath, content)) {
    return {
      changed: normalizeComparableText(content) !== normalizeComparableText(managedBlock),
      content: `${managedBlock}\n`,
    }
  }
  const startIndex = content.indexOf(IDE_RULES_START_MARKER)
  const endIndex = content.indexOf(IDE_RULES_END_MARKER, startIndex)
  if (startIndex !== -1 && endIndex !== -1) {
    const afterEndIndex = endIndex + IDE_RULES_END_MARKER.length
    const prefix = content.slice(0, startIndex)
    const suffix = content.slice(afterEndIndex)

    if (isExactAceIdeBridge(relativePath, prefix) && normalizeComparableText(suffix) === '') {
      return {
        changed: normalizeComparableText(content) !== normalizeComparableText(managedBlock),
        content: `${managedBlock}\n`,
      }
    }

    const nextContent = `${content.slice(0, startIndex)}${managedBlock}${content.slice(afterEndIndex)}`
    return {
      changed: nextContent !== content,
      content: normalizeContentSpacing(nextContent),
    }
  }
  const prefix = content.trimEnd()
  const nextContent = prefix ? `${prefix}\n\n${managedBlock}\n` : `${managedBlock}\n`
  return {
    changed: nextContent !== content,
    content: nextContent,
  }
}
export function removeAceIdeRulesBlock(content) {
  const startIndex = content.indexOf(IDE_RULES_START_MARKER)
  const endIndex = content.indexOf(IDE_RULES_END_MARKER, startIndex)
  if (startIndex === -1 || endIndex === -1) {
    return { changed: false, content }
  }
  const afterEndIndex = endIndex + IDE_RULES_END_MARKER.length
  return {
    changed: true,
    content: normalizeContentSpacing(`${content.slice(0, startIndex)}${content.slice(afterEndIndex)}`),
  }
}
export function isExactClaudeTemplate(content) {
  return normalizeComparableText(content) === normalizeComparableText(claudeTemplate)
}
export function removeAceWorkflowSection(content) {
  const startIndex = content.indexOf(AGENTS_WORKFLOW_MARKER)
  const endIndex = content.indexOf(AGENTS_WORKFLOW_END_MARKER, startIndex)
  if (startIndex === -1 || endIndex === -1) {
    return { changed: false, content }
  }
  const afterEndIndex = endIndex + AGENTS_WORKFLOW_END_MARKER.length
  const nextContent = `${content.slice(0, startIndex)}${content.slice(afterEndIndex)}`
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
  return { changed: true, content: nextContent ? `${nextContent}\n` : '' }
}
export function isDefaultAgentsContent(content) {
  return normalizeComparableText(content) === normalizeComparableText(DEFAULT_AGENTS_TEMPLATE)
}
export async function hasActiveAceMemory(rootDir) {
  const activeFiles = []
  const checkedPaths = new Set()
  const templateByPath = new Map()
  for (const fileSpec of AI_FILE_SPECS) {
    for (const relativePath of getMemoryPathCandidates(fileSpec.path)) {
      templateByPath.set(normalizeRelativePath(relativePath), fileSpec.template)
    }
  }
  for (const [relativePath, template] of templateByPath.entries()) {
    checkedPaths.add(relativePath)
    const content = await readTextIfExists(path.join(rootDir, relativePath))
    if (content === null || isEmptyOrTemplate(content, template)) {
      continue
    }
    activeFiles.push(relativePath)
  }
  for (const relativePath of await listAiFiles(rootDir)) {
    if (checkedPaths.has(relativePath) || isIgnoredMemoryPath(relativePath)) {
      continue
    }
    const content = await readTextIfExists(path.join(rootDir, relativePath))
    if (content !== null && normalizeComparableText(content).length > 0) {
      activeFiles.push(relativePath)
    }
  }
  return {
    active: activeFiles.length > 0,
    activeFiles: [...new Set(activeFiles)].sort(),
  }
}
export async function isProductRepository(rootDir) {
  const packageJson = await readJsonIfExists(path.join(rootDir, 'package.json'))
  return (
    packageJson?.name === 'ace-pack' &&
    (await pathExists(path.join(rootDir, 'install-ace-pack.mjs'))) &&
    (await pathExists(path.join(rootDir, 'DEVELOPING.md'))) &&
    (await pathExists(path.join(rootDir, 'ROADMAP.md')))
  )
}
export async function readJsonIfExists(filePath) {
  const content = await readTextIfExists(filePath)
  if (content === null) {
    return null
  }
  return JSON.parse(content.replace(/^\uFEFF/u, ''))
}
async function listAiFiles(rootDir) {
  const aiDir = path.join(rootDir, '.ai')
  if (!(await pathExists(aiDir))) {
    return []
  }
  const files = []
  await collectFiles(aiDir, '.ai', files)
  return files.map(normalizeRelativePath)
}
async function collectFiles(directory, relativeDirectory, files) {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const childPath = path.join(directory, entry.name)
    const childRelativePath = path.posix.join(relativeDirectory, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(childPath, childRelativePath, files)
      continue
    }
    if (entry.isFile()) {
      files.push(childRelativePath)
    }
  }
}
function isEmptyOrTemplate(content, template) {
  const normalizedContent = normalizeComparableText(content)
  return normalizedContent.length === 0 || normalizedContent === normalizeComparableText(template)
}
function isIgnoredMemoryPath(relativePath) {
  return (
    relativePath.startsWith('.ai/generated/') ||
    relativePath === '.ai/archive/.gitkeep' ||
    relativePath === '.ai/archive/tasks/.gitkeep'
  )
}
function normalizeComparableText(content) {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .join('\n')
    .trim()
}
function normalizeContentSpacing(content) {
  const nextContent = content.replace(/\n{3,}/g, '\n\n').trimEnd()
  return nextContent ? `${nextContent}\n` : ''
}
function formatExportTimestamp(date) {
  const parts = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((part) => String(part).padStart(2, '0'))
  return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`
}
function formatAceRouterCommand(packageManager, command) {
  if (packageManager === 'npm') {
    return `npm run ace -- ${command}`
  }
  if (packageManager === 'yarn') {
    return `yarn ace ${command}`
  }
  if (packageManager === 'bun') {
    return `bun run ace -- ${command}`
  }
  return `pnpm ace ${command}`
}
