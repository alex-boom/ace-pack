#!/usr/bin/env node
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  getArgValue,
  getMemoryPath,
  nowTimestamp,
  parseCliArgs,
  readMemoryFile,
  readTextIfExists,
  writeAceBanner,
  writeMemoryFile,
} from './ai-memory-utils.mjs'

export const PROJECT_CONVENTIONS_MARKER = '<!-- ace-discover:managed -->'
export const PROJECT_CONVENTIONS_PATH = getMemoryPath('projectConventions')

const MAX_SCAN_DEPTH = 8
const MAX_SCANNED_FILES = 5000
const MAX_SOURCE_FILES_READ = 1000
const MAX_FILE_BYTES = 64 * 1024
const MAX_ITEMS = 5
const SKIPPED_DIRS = new Set([
  '.ai',
  '.git',
  '.next',
  '.npm-publish',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
])
const SOURCE_EXTENSIONS = new Set([
  '.cs',
  '.go',
  '.js',
  '.jsx',
  '.mjs',
  '.py',
  '.rs',
  '.ts',
  '.tsx',
  '.vue',
])

export async function discoverProjectConventions(rootDir, options = {}) {
  const normalizedRootDir = path.resolve(rootDir)
  const timestamp = nowTimestamp()
  const scan = await scanRepoFiles(normalizedRootDir)
  const packageSignals = await collectPackageSignals(normalizedRootDir, scan.files)
  const sourceSignals = await collectSourceSignals(normalizedRootDir, scan.files)
  const summary = buildConventionSummary({
    packageSignals,
    scan,
    sourceSignals,
    timestamp,
  })
  const markdown = formatProjectConventions(summary)
  const shouldWrite = options.write !== false
  let outputPath = null

  if (shouldWrite) {
    const existingContent = await readMemoryFile(normalizedRootDir, 'projectConventions')

    if (
      existingContent !== null &&
      !existingContent.includes(PROJECT_CONVENTIONS_MARKER) &&
      options.force !== true
    ) {
      throw new Error(
        `${PROJECT_CONVENTIONS_PATH} already exists and is not ACE-managed. Re-run with --force to overwrite it.`,
      )
    }

    await mkdir(path.dirname(path.join(normalizedRootDir, PROJECT_CONVENTIONS_PATH)), {
      recursive: true,
    })
    await writeMemoryFile(normalizedRootDir, 'projectConventions', markdown)
    outputPath = path.join(normalizedRootDir, PROJECT_CONVENTIONS_PATH)
  }

  return {
    detectedEcosystems: summary.detectedEcosystems,
    filesRead: sourceSignals.filesRead,
    filesScanned: scan.files.length,
    generatedAt: timestamp,
    markdown,
    outputPath,
    status: 'ok',
    truncated: scan.truncated,
    written: shouldWrite,
  }
}

async function scanRepoFiles(rootDir) {
  const files = []
  let truncated = false

  async function visit(directory, depth) {
    if (files.length >= MAX_SCANNED_FILES || depth > MAX_SCAN_DEPTH) {
      truncated = true
      return
    }

    let entries

    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (files.length >= MAX_SCANNED_FILES) {
        truncated = true
        return
      }

      const absolutePath = path.join(directory, entry.name)
      const relativePath = normalizeRepoPath(path.relative(rootDir, absolutePath))

      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) {
          await visit(absolutePath, depth + 1)
        }

        continue
      }

      if (entry.isFile()) {
        files.push(relativePath)
      }
    }
  }

  await visit(rootDir, 0)

  return { files: files.sort(), truncated }
}

async function collectPackageSignals(rootDir, files) {
  const dependencies = new Set()
  const manifestText = new Map()
  const packageJsonFiles = files.filter((file) => path.basename(file) === 'package.json').slice(0, 20)

  for (const file of packageJsonFiles) {
    const content = await readTextIfExists(path.join(rootDir, file))

    if (!content) {
      continue
    }

    manifestText.set(file, content)

    try {
      const packageJson = JSON.parse(stripByteOrderMark(content))
      const allDependencies = {
        ...(packageJson.dependencies ?? {}),
        ...(packageJson.devDependencies ?? {}),
      }

      for (const dependencyName of Object.keys(allDependencies)) {
        dependencies.add(dependencyName)
      }

      if (packageJson.workspaces) {
        dependencies.add('package-workspaces')
      }
    } catch {
      // Ignore malformed package metadata during discovery.
    }
  }

  for (const manifestName of [
    'requirements.txt',
    'pyproject.toml',
    'Pipfile',
    'go.mod',
    'Cargo.toml',
  ]) {
    if (!files.includes(manifestName)) {
      continue
    }

    const content = await readTextIfExists(path.join(rootDir, manifestName))

    if (content) {
      manifestText.set(manifestName, content)
    }
  }

  return { dependencies, manifestText }
}

async function collectSourceSignals(rootDir, files) {
  const signals = {
    dependencyInjection: new Set(),
    errorHandling: new Set(),
    logging: new Set(),
    persistence: new Set(),
    routing: new Set(),
    styling: new Set(),
    uiLibraries: new Set(),
  }
  let filesRead = 0
  const sourceFiles = files.filter(isSourceFile).slice(0, MAX_SOURCE_FILES_READ)

  for (const relativePath of sourceFiles) {
    const absolutePath = path.join(rootDir, relativePath)
    let fileStat

    try {
      fileStat = await stat(absolutePath)
    } catch {
      continue
    }

    if (fileStat.size > MAX_FILE_BYTES) {
      continue
    }

    const content = await readTextIfExists(absolutePath)

    if (!content) {
      continue
    }

    filesRead += 1
    collectSimpleImportSignals(content, signals)
  }

  return { filesRead, signals }
}

function collectSimpleImportSignals(content, signals) {
  const lowerContent = content.toLowerCase()

  if (content.includes('go.uber.org/zap')) {
    signals.logging.add('Logging uses zap (`go.uber.org/zap`).')
  }

  if (content.includes('github.com/rs/zerolog')) {
    signals.logging.add('Logging uses zerolog (`github.com/rs/zerolog`).')
  }

  if (content.includes('github.com/sirupsen/logrus')) {
    signals.logging.add('Logging uses logrus (`github.com/sirupsen/logrus`).')
  }

  if (content.includes('"log/slog"')) {
    signals.logging.add('Logging uses Go `log/slog`.')
  }

  if (content.includes('from sqlalchemy') || content.includes('import sqlalchemy')) {
    signals.persistence.add('ORM/data access uses SQLAlchemy imports.')
  }

  if (content.includes('from pydantic') || content.includes('import pydantic')) {
    signals.persistence.add('Schemas use Pydantic imports.')
  }

  if (content.includes('from fastapi') || content.includes('APIRouter(')) {
    signals.routing.add('Routing uses FastAPI routers.')
  }

  if (content.includes('Depends')) {
    signals.dependencyInjection.add('FastAPI dependency injection uses `Depends(...)`.')
  }

  if (content.includes('apperrors.Wrap')) {
    signals.errorHandling.add('Errors are wrapped with `apperrors.Wrap(...)`.')
  }

  if (content.includes('errors.Wrap')) {
    signals.errorHandling.add('Errors are wrapped with `errors.Wrap(...)`.')
  }

  if (content.includes('fmt.Errorf(') && content.includes('%w')) {
    signals.errorHandling.add('Go errors use `fmt.Errorf(... %w ...)` wrapping.')
  }

  if (lowerContent.includes("from 'pino'") || lowerContent.includes('from "pino"')) {
    signals.logging.add('Logging uses pino imports.')
  }

  if (lowerContent.includes("require('pino')") || lowerContent.includes('require("pino")')) {
    signals.logging.add('Logging uses pino imports.')
  }

  if (lowerContent.includes("from 'winston'") || lowerContent.includes('from "winston"')) {
    signals.logging.add('Logging uses winston imports.')
  }

  if (content.includes('@mui/material')) {
    signals.uiLibraries.add('UI uses Material UI imports.')
  }

  if (content.includes('@radix-ui/')) {
    signals.uiLibraries.add('UI uses Radix primitives.')
  }

  if (content.includes('@/components/ui') || content.includes('components/ui')) {
    signals.uiLibraries.add('UI imports shared `components/ui` primitives.')
  }

  if (content.includes('className=')) {
    signals.styling.add('Components use `className` styling hooks.')
  }
}

function buildConventionSummary({ packageSignals, scan, sourceSignals, timestamp }) {
  const { dependencies, manifestText } = packageSignals
  const files = scan.files
  const detectedEcosystems = detectEcosystems({ dependencies, files, manifestText })
  const stylingSignals = detectStylingSignals({ dependencies, files, sourceSignals })
  const uiLibraries = detectUiLibraries({ dependencies, sourceSignals })
  const componentFolders = topFolders(files, isComponentLikePath)
  const routeFolders = topFolders(files, isRouteLikePath)
  const dataFolders = topFolders(files, isDataLikePath)
  const packageLayout = topFolders(files, isSourceLikePath, (file) => layoutBucket(file))

  return {
    componentFolders,
    dataFolders,
    dependencyInjection: [...sourceSignals.signals.dependencyInjection].slice(0, MAX_ITEMS),
    detectedEcosystems,
    errorHandling: [...sourceSignals.signals.errorHandling].slice(0, MAX_ITEMS),
    filesRead: sourceSignals.filesRead,
    filesScanned: files.length,
    generatedAt: timestamp,
    logging: detectLoggingSignals({ dependencies, sourceSignals }),
    packageLayout,
    persistence: detectPersistenceSignals({ dependencies, files, sourceSignals }),
    routeFolders,
    routing: detectRoutingSignals({ dependencies, files, sourceSignals }),
    stylingSignals,
    truncated: scan.truncated,
    uiLibraries,
  }
}

function detectEcosystems({ dependencies, files, manifestText }) {
  const ecosystems = []
  const rootText = [...manifestText.values()].join('\n').toLowerCase()

  if (dependencies.has('next') || hasFile(files, 'next.config.ts') || hasFile(files, 'next.config.js')) {
    ecosystems.push('Next.js / TypeScript')
  }

  if (dependencies.has('react')) {
    ecosystems.push('React')
  }

  if (dependencies.has('express') || dependencies.has('fastify') || dependencies.has('@nestjs/core')) {
    ecosystems.push('Node.js API / backend')
  }

  if (dependencies.has('@trpc/server')) {
    ecosystems.push('tRPC / API routers')
  }

  if (files.includes('go.mod')) {
    ecosystems.push('Go service')
  }

  if (rootText.includes('fastapi')) {
    ecosystems.push('Python / FastAPI')
  }

  if (rootText.includes('django')) {
    ecosystems.push('Python / Django')
  }

  if (rootText.includes('flask')) {
    ecosystems.push('Python / Flask')
  }

  if (files.includes('Cargo.toml')) {
    ecosystems.push('Rust service')
  }

  if (files.some((file) => file.endsWith('.csproj') || file.endsWith('.sln'))) {
    ecosystems.push('.NET service')
  }

  if (
    files.includes('pnpm-workspace.yaml') ||
    files.includes('turbo.json') ||
    files.includes('nx.json') ||
    dependencies.has('package-workspaces')
  ) {
    ecosystems.push('Generic monorepo')
  }

  return ecosystems.length > 0 ? ecosystems : ['Generic repository']
}

function detectStylingSignals({ dependencies, files, sourceSignals }) {
  const signals = [...sourceSignals.signals.styling]

  if (
    dependencies.has('tailwindcss') ||
    files.some((file) => file.startsWith('tailwind.config.'))
  ) {
    signals.unshift('Styling uses Tailwind CSS.')
  }

  if (files.some((file) => file.endsWith('.module.css') || file.endsWith('.module.scss'))) {
    signals.push('Styling uses CSS modules.')
  }

  if (files.some((file) => file.endsWith('.css') || file.endsWith('.scss'))) {
    signals.push('CSS/SCSS files are present.')
  }

  return unique(signals).slice(0, MAX_ITEMS)
}

function detectUiLibraries({ dependencies, sourceSignals }) {
  const libraries = [...sourceSignals.signals.uiLibraries]

  if (dependencies.has('@mui/material')) {
    libraries.unshift('UI uses Material UI.')
  }

  if ([...dependencies].some((name) => name.startsWith('@radix-ui/'))) {
    libraries.unshift('UI uses Radix primitives.')
  }

  if (dependencies.has('antd')) {
    libraries.unshift('UI uses Ant Design.')
  }

  return unique(libraries).slice(0, MAX_ITEMS)
}

function detectRoutingSignals({ dependencies, files, sourceSignals }) {
  const signals = [...sourceSignals.signals.routing]

  if (files.some((file) => file.startsWith('app/api/') && file.endsWith('/route.ts'))) {
    signals.unshift('Next.js app-router API routes are present.')
  }

  if (files.some((file) => file.startsWith('pages/api/'))) {
    signals.unshift('Next.js pages API routes are present.')
  }

  if (dependencies.has('express')) {
    signals.unshift('Express is present in dependencies.')
  }

  if (dependencies.has('fastify')) {
    signals.unshift('Fastify is present in dependencies.')
  }

  if (files.some((file) => file.startsWith('internal/handlers/'))) {
    signals.unshift('Go HTTP handlers live under `internal/handlers`.')
  }

  return unique(signals).slice(0, MAX_ITEMS)
}

function detectLoggingSignals({ dependencies, sourceSignals }) {
  const signals = [...sourceSignals.signals.logging]

  if (dependencies.has('pino')) {
    signals.unshift('Logging uses pino.')
  }

  if (dependencies.has('winston')) {
    signals.unshift('Logging uses winston.')
  }

  return unique(signals).slice(0, MAX_ITEMS)
}

function detectPersistenceSignals({ dependencies, files, sourceSignals }) {
  const signals = [...sourceSignals.signals.persistence]

  if (dependencies.has('drizzle-orm')) {
    signals.unshift('Database access uses Drizzle ORM.')
  }

  if (dependencies.has('@prisma/client') || dependencies.has('prisma') || files.includes('prisma/schema.prisma')) {
    signals.unshift('Database access uses Prisma.')
  }

  if (dependencies.has('typeorm')) {
    signals.unshift('Database access uses TypeORM.')
  }

  if (files.some((file) => file.startsWith('migrations/') || file.includes('/migrations/'))) {
    signals.push('Database migrations are present.')
  }

  if (files.some((file) => file.startsWith('internal/models/'))) {
    signals.push('Go models live under `internal/models`.')
  }

  return unique(signals).slice(0, MAX_ITEMS)
}

export function formatProjectConventions(summary) {
  const scanLimitNote = summary.truncated
    ? `- Scan limit reached after ${summary.filesScanned} files; results are partial.`
    : `- Files scanned: ${summary.filesScanned}.`

  return `# Project Conventions and Pattern Registry
${PROJECT_CONVENTIONS_MARKER}

Generated: ${summary.generatedAt}
Source: \`ace discover\`

## Summary
- Detected ecosystems: ${summary.detectedEcosystems.join(', ')}
${scanLimitNote}
- Source files sampled for import signals: ${summary.filesRead}.
- Keep this file concise; it is intended for \`ace hub\` context.

## Frontend and UI
${formatBullets([
  ...prefixItems('Component folders', summary.componentFolders),
  ...summary.uiLibraries,
  ...summary.stylingSignals,
])}

## Routing and API
${formatBullets([
  ...prefixItems('Route/API folders', summary.routeFolders),
  ...summary.routing,
  ...summary.dependencyInjection,
])}

## Logging
${formatBullets(summary.logging)}

## Error Handling
${formatBullets(summary.errorHandling)}

## Data and Persistence
${formatBullets([...prefixItems('Data/model folders', summary.dataFolders), ...summary.persistence])}

## Package Layout
${formatBullets(prefixItems('Primary source roots', summary.packageLayout))}

## Agent Notes
- Reuse these project conventions before adding new utilities, components, or architectural patterns.
- Treat this registry as a generated summary. Verify nearby code before changing high-risk paths.
`
}

function prefixItems(label, items) {
  if (items.length === 0) {
    return []
  }

  return [`${label}: ${items.map((item) => `\`${item}\``).join(', ')}.`]
}

function formatBullets(items) {
  const uniqueItems = unique(items)

  if (uniqueItems.length === 0) {
    return '- Not detected by local heuristics.'
  }

  return uniqueItems.slice(0, MAX_ITEMS).map((item) => `- ${item}`).join('\n')
}

function topFolders(files, predicate, bucketFn = (file) => path.posix.dirname(file)) {
  const counts = new Map()

  for (const file of files) {
    if (!predicate(file)) {
      continue
    }

    const bucket = bucketFn(file)

    if (!bucket || bucket === '.') {
      continue
    }

    counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((left, right) => {
      const countDelta = right[1] - left[1]
      return countDelta === 0 ? left[0].localeCompare(right[0]) : countDelta
    })
    .slice(0, MAX_ITEMS)
    .map(([folder]) => folder)
}

function isComponentLikePath(file) {
  return (
    /\.(jsx|tsx|vue)$/u.test(file) &&
    (file.includes('/components/') ||
      file.startsWith('components/') ||
      file.includes('/ui/') ||
      file.startsWith('ui/'))
  )
}

function isRouteLikePath(file) {
  return (
    file.includes('/routes/') ||
    file.startsWith('routes/') ||
    file.includes('/routers/') ||
    file.startsWith('routers/') ||
    file.includes('/controllers/') ||
    file.startsWith('controllers/') ||
    file.startsWith('app/api/') ||
    file.startsWith('pages/api/') ||
    file.startsWith('internal/handlers/') ||
    file.startsWith('internal/router/') ||
    file.startsWith('app/api/')
  )
}

function isDataLikePath(file) {
  return (
    file.startsWith('prisma/') ||
    file.includes('/drizzle/') ||
    file.includes('/migrations/') ||
    file.startsWith('migrations/') ||
    file.startsWith('internal/models/') ||
    file.includes('/models/') ||
    file.includes('/schemas/') ||
    file.startsWith('app/db/') ||
    file.includes('/db/')
  )
}

function isSourceLikePath(file) {
  return isSourceFile(file)
}

function layoutBucket(file) {
  const parts = file.split('/')

  if (parts.length >= 2 && ['apps', 'packages', 'internal', 'src', 'app'].includes(parts[0])) {
    return parts.slice(0, 2).join('/')
  }

  return parts[0]
}

function isSourceFile(file) {
  return SOURCE_EXTENSIONS.has(path.extname(file))
}

function hasFile(files, fileName) {
  return files.includes(fileName)
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

function stripByteOrderMark(content) {
  return content.replace(/^\uFEFF/u, '')
}

function parseDiscoverArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    return { help: true }
  }

  const args = parseCliArgs(argv)

  if (getArgValue(args, 'json') === 'true' && getArgValue(args, 'stdout') === 'true') {
    throw new Error('--json cannot be combined with --stdout')
  }

  return {
    force: getArgValue(args, 'force') === 'true',
    help: false,
    json: getArgValue(args, 'json') === 'true',
    rootDir: path.resolve(process.cwd(), getArgValue(args, 'root') ?? '.'),
    stdout: getArgValue(args, 'stdout') === 'true',
  }
}

function formatHelp() {
  return `ACE Discover

Usage:
  ace discover [--root <path>] [--json]
  ace discover --stdout
  ace discover --force

Options:
  --root <path>  Scan another repository root.
  --json         Print parseable metadata as JSON.
  --stdout       Print generated Markdown without writing a file.
  --force        Overwrite an existing non-managed conventions file.
  --help         Show this help.
`
}

function formatCliSummary(result) {
  const lines = [
    `[ACE] Project conventions discovered for ${result.detectedEcosystems.join(', ')}.`,
    `[ACE] Scanned ${result.filesScanned} file(s), sampled ${result.filesRead} source file(s).`,
  ]

  if (result.truncated) {
    lines.push('[ACE] Scan limit reached; conventions are partial.')
  }

  if (result.outputPath) {
    lines.push(`[ACE] Saved to ${path.relative(process.cwd(), result.outputPath) || result.outputPath}.`)
  }

  return `${lines.join('\n')}\n`
}

function formatJsonResult(result) {
  return JSON.stringify(
    {
      detectedEcosystems: result.detectedEcosystems,
      filesRead: result.filesRead,
      filesScanned: result.filesScanned,
      generatedAt: result.generatedAt,
      outputPath: result.outputPath,
      status: result.status,
      truncated: result.truncated,
      written: result.written,
    },
    null,
    2,
  )
}

async function main() {
  const args = parseDiscoverArgs(process.argv.slice(2))

  if (args.help) {
    process.stdout.write(formatHelp())
    return
  }

  writeAceBanner()

  const result = await discoverProjectConventions(args.rootDir, {
    force: args.force,
    write: !args.stdout,
  })

  if (args.json) {
    process.stdout.write(`${formatJsonResult(result)}\n`)
    return
  }

  if (args.stdout) {
    process.stdout.write(result.markdown)
    return
  }

  process.stdout.write(formatCliSummary(result))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exit(1)
  })
}
