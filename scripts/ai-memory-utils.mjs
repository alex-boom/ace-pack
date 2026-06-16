import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
export {
  buildStartSnapshot,
  extractChangedFileTitles,
  extractNextCommand,
  extractReleaseDecision,
  extractUnresolvedReflections,
  formatStartSnapshot,
  getFreshnessStatus,
  normalizeStackText,
  resolveStackSummary,
  summarizeVerification,
} from './ai-report-utils.mjs'
export {
  countCheckboxes,
  extractLabeledValue,
  extractMarkdownSection,
  extractTopDecision,
  formatBullets,
  formatChecklist,
  hasMeaningfulContent,
  replaceLabeledValue,
  replaceMarkdownSection,
} from './ai-markdown-utils.mjs'
export const ACE_BANNER = '[ACE] Agentic Context Engine initialized...'
const timestampFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: '2-digit',
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const PLACEHOLDER_PATTERN = /\[[^\]]+\]|\bTODO\b|\bTBD\b|No .* recorded/i
export const ACE_MEMORY_SCHEMA_VERSION = 3
export const ACE_MEMORY_PATHS = {
  decisions: {
    aliases: ['.ai/decisions.md'],
    canonical: '.ai/knowledge/decisions.md',
  },
  generatedContext: {
    aliases: ['.ai/generated-context.md'],
    canonical: '.ai/generated/context.md',
  },
  memoryConfig: {
    aliases: ['.ai/memory-config.json'],
    canonical: '.ai/config/memory-config.json',
  },
  memoryConfigRecommended: {
    aliases: ['.ai/memory-config.recommended.json'],
    canonical: '.ai/config/memory-config.recommended.json',
  },
  productRoadmap: {
    aliases: ['.ai/product-roadmap.md'],
    canonical: '.ai/knowledge/product-roadmap.md',
  },
  projectConventions: {
    aliases: ['.ai/project-conventions.md'],
    canonical: '.ai/knowledge/project-conventions.md',
  },
  projectProfile: {
    aliases: ['.ai/project-profile.md'],
    canonical: '.ai/config/project-profile.md',
  },
  reflectionLog: {
    aliases: ['.ai/reflection-log.md'],
    canonical: '.ai/knowledge/reflection-log.md',
  },
  reportBrief: {
    aliases: ['.ai/report-brief.md'],
    canonical: '.ai/generated/report-brief.md',
  },
  reportCurrentTaskCode: {
    aliases: ['.ai/report-current-task-code.md'],
    canonical: '.ai/generated/report-current-task-code.md',
  },
  reportCurrentTaskCodeXml: {
    aliases: ['.ai/report-current-task-code.xml'],
    canonical: '.ai/generated/report-current-task-code.xml',
  },
  reportFull: {
    aliases: ['.ai/report-full.md'],
    canonical: '.ai/generated/report-full.md',
  },
  reportFullXml: {
    aliases: ['.ai/report-full.xml'],
    canonical: '.ai/generated/report-full.xml',
  },
  taskState: {
    aliases: ['.ai/task-state.md'],
    canonical: '.ai/state/task-state.md',
  },
  techDocs: {
    aliases: ['.ai/tech-docs.md'],
    canonical: '.ai/knowledge/tech-docs.md',
  },
  workLog: {
    aliases: ['.ai/work-log.md'],
    canonical: '.ai/knowledge/work-log.md',
  },
}
const PATH_TO_MEMORY_KEY = new Map()
for (const [key, spec] of Object.entries(ACE_MEMORY_PATHS)) {
  PATH_TO_MEMORY_KEY.set(normalizeRelativePath(spec.canonical), key)
  for (const alias of spec.aliases) {
    PATH_TO_MEMORY_KEY.set(normalizeRelativePath(alias), key)
  }
}
export function normalizeTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}
export async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}
export async function writeTextFile(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, normalizeTrailingNewline(content), 'utf8')
}
export function normalizeRelativePath(relativePath) {
  return relativePath.replace(/\\/g, '/').replace(/^\.\//, '')
}
export function getMemoryPath(memoryKey) {
  const spec = ACE_MEMORY_PATHS[memoryKey]
  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }
  return spec.canonical
}
export function getLegacyMemoryPaths(memoryKey) {
  const spec = ACE_MEMORY_PATHS[memoryKey]
  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }
  return [...spec.aliases]
}
export function resolveMemoryKeyByPath(relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath)
  return (
    PATH_TO_MEMORY_KEY.get(normalizedPath) ??
    (!normalizedPath.includes('/') ? PATH_TO_MEMORY_KEY.get(`.ai/${normalizedPath}`) : null) ??
    null
  )
}
export function getMemoryPathCandidates(memoryKeyOrPath) {
  const memoryKey = ACE_MEMORY_PATHS[memoryKeyOrPath]
    ? memoryKeyOrPath
    : resolveMemoryKeyByPath(memoryKeyOrPath)
  if (!memoryKey) {
    return [memoryKeyOrPath]
  }
  const spec = ACE_MEMORY_PATHS[memoryKey]
  return [spec.canonical, ...spec.aliases]
}
export async function readMemoryFile(rootDir, memoryKeyOrPath) {
  const candidates = []
  for (const [index, relativePath] of getMemoryPathCandidates(memoryKeyOrPath).entries()) {
    const absolutePath = path.join(rootDir, relativePath)
    const [content, timestamp] = await Promise.all([
      readTextIfExists(absolutePath),
      readFileTimestamp(absolutePath),
    ])
    if (content !== null) {
      candidates.push({ content, index, timestamp })
    }
  }
  return candidates
    .sort((left, right) => {
      const timeDelta = (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0)
      return timeDelta === 0 ? right.index - left.index : timeDelta
    })
    .at(0)?.content ?? null
}
export async function readMemoryFileTimestamp(rootDir, memoryKeyOrPath) {
  const timestamps = []
  for (const relativePath of getMemoryPathCandidates(memoryKeyOrPath)) {
    const timestamp = await readFileTimestamp(path.join(rootDir, relativePath))
    if (timestamp !== null) {
      timestamps.push(timestamp)
    }
  }
  return timestamps.sort((left, right) => right.getTime() - left.getTime()).at(0) ?? null
}
export async function writeMemoryFile(rootDir, memoryKeyOrPath, content, options = {}) {
  const memoryKey = ACE_MEMORY_PATHS[memoryKeyOrPath]
    ? memoryKeyOrPath
    : resolveMemoryKeyByPath(memoryKeyOrPath)
  const mirrorLegacy = options.mirrorLegacy === true
  const paths = memoryKey
    ? [
        ACE_MEMORY_PATHS[memoryKey].canonical,
        ...(mirrorLegacy ? ACE_MEMORY_PATHS[memoryKey].aliases : []),
      ]
    : [memoryKeyOrPath]
  for (const relativePath of paths) {
    await writeTextFile(path.join(rootDir, relativePath), content)
  }
  return paths
}
export async function ensureMemoryFileMirror(rootDir, memoryKey, options = {}) {
  const spec = ACE_MEMORY_PATHS[memoryKey]
  if (!spec) {
    throw new Error(`Unknown ACE memory path key: ${memoryKey}`)
  }
  const createdFiles = []
  const removedFiles = []
  const updatedFiles = []
  const canonicalPath = path.join(rootDir, spec.canonical)
  let canonicalContent = await readTextIfExists(canonicalPath)
  if (canonicalContent === null) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)
      if (aliasContent !== null) {
        await writeTextFile(canonicalPath, aliasContent)
        canonicalContent = aliasContent
        createdFiles.push(spec.canonical)
        break
      }
    }
  }
  if (canonicalContent === null && options.template !== undefined) {
    await writeTextFile(canonicalPath, options.template)
    canonicalContent = options.template
    createdFiles.push(spec.canonical)
  }
  if (canonicalContent !== null && isPlaceholderDocument(canonicalContent)) {
    for (const alias of spec.aliases) {
      const aliasContent = await readTextIfExists(path.join(rootDir, alias))
      if (aliasContent !== null && !isPlaceholderDocument(aliasContent)) {
        await writeTextFile(canonicalPath, aliasContent)
        canonicalContent = aliasContent
        updatedFiles.push(spec.canonical)
        break
      }
    }
  }
  if (canonicalContent !== null && options.mirrorLegacy === true) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)
      if (aliasContent === null) {
        await writeTextFile(aliasPath, canonicalContent)
        createdFiles.push(alias)
      }
    }
  }
  if (canonicalContent !== null && options.pruneLegacy === true) {
    for (const alias of spec.aliases) {
      const aliasPath = path.join(rootDir, alias)
      const aliasContent = await readTextIfExists(aliasPath)
      if (aliasContent !== null) {
        await rm(aliasPath, { force: true })
        removedFiles.push(alias)
      }
    }
  }
  return { createdFiles, removedFiles, updatedFiles }
}
export async function migrateMemorySchemaV3(rootDir, options = {}) {
  const createdFiles = []
  const removedFiles = []
  const updatedFiles = []
  const mirrorLegacy = options.mirrorLegacy === true
  const pruneLegacy = options.pruneLegacy === true
  for (const memoryKey of Object.keys(ACE_MEMORY_PATHS)) {
    const result = await ensureMemoryFileMirror(rootDir, memoryKey, {
      mirrorLegacy,
      pruneLegacy,
    })
    createdFiles.push(...result.createdFiles)
    removedFiles.push(...result.removedFiles)
    updatedFiles.push(...result.updatedFiles)
  }
  await mkdir(path.join(rootDir, '.ai', 'config'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'state'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'knowledge'), { recursive: true })
  await mkdir(path.join(rootDir, '.ai', 'generated'), { recursive: true })
  return { createdFiles, removedFiles, updatedFiles }
}
export const migrateMemorySchemaV2 = migrateMemorySchemaV3
export async function readFileTimestamp(filePath) {
  try {
    return (await stat(filePath)).mtime
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}
export function formatTimestamp(value) {
  return timestampFormatter.format(value)
}
export function nowTimestamp() {
  return formatTimestamp(new Date())
}
export function writeAceBanner(output = process.stderr) {
  output.write(`${ACE_BANNER}\n`)
}
export function parseCliArgs(args) {
  const parsed = {}
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]
    if (!token.startsWith('--')) {
      continue
    }
    const key = token.slice(2)
    const nextToken = args[index + 1]
    const value = nextToken && !nextToken.startsWith('--') ? nextToken : 'true'
    if (value !== 'true') {
      index += 1
    }
    const currentValue = parsed[key]
    if (currentValue === undefined) {
      parsed[key] = value
      continue
    }
    if (Array.isArray(currentValue)) {
      currentValue.push(value)
      continue
    }
    parsed[key] = [currentValue, value]
  }
  return parsed
}
export function getArgList(args, key) {
  const value = args[key]
  if (value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}
export function getArgValue(args, key) {
  const value = args[key]
  if (Array.isArray(value)) {
    return value.at(-1)
  }
  return value
}
function isPlaceholderDocument(content) {
  const placeholderMatches =
    content.match(
      /\[(?:YYYY|Set|Describe|Explain|List|Add|Summarize|Confirm|Note|Short|Run|Document|path\/to\/file|content here|latest completed work|current project|next concrete steps|known gaps|publish\/deploy decision)[^\]]*\]|\bTODO\b|\bTBD\b/giu,
    ) ?? []
  return content.trim().length === 0 || placeholderMatches.length >= 2
}
