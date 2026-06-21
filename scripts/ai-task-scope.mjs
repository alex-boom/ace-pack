import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { normalizeRepoPath } from './ai-memory-config.mjs'

const execFileAsync = promisify(execFile)

export function normalizeClassificationScope(options = {}) {
  const paths = normalizeScopePaths(options.paths)
  const staged = options.staged === true || options.staged === 'true'
  const hasRefs = Boolean(options.baseRef || options.headRef)

  if (hasRefs && (staged || paths.length > 0)) {
    return {
      baseRef: options.baseRef ?? null,
      error: 'Cannot combine --base/--head PR diff classification with --staged or --path scope.',
      headRef: options.headRef ?? null,
      mode: 'refs',
      paths,
    }
  }

  if (hasRefs) {
    return {
      baseRef: options.baseRef ?? null,
      headRef: options.headRef ?? null,
      mode: 'refs',
      paths: [],
    }
  }

  return {
    mode: staged ? 'staged' : 'working-tree',
    paths,
  }
}

export async function getDiffInputs(rootDir, scope) {
  if (scope.error) {
    return {
      changedFiles: [],
      diffLineCount: 0,
      diffText: '',
      gitError: scope.error,
      scope,
    }
  }

  if (scope.mode === 'refs') {
    return getDiffInputsForRefs(rootDir, scope)
  }

  if (scope.mode === 'staged') {
    return getStagedDiffInputs(rootDir, scope)
  }

  return getWorkingTreeDiffInputs(rootDir, scope)
}

export function formatClassificationScope(scope = { mode: 'working-tree', paths: [] }) {
  const pathList = scope.paths?.length ? ` (${scope.paths.join(', ')})` : ''

  if (scope.mode === 'refs') {
    return `PR diff ${scope.baseRef}...${scope.headRef}`
  }

  if (scope.mode === 'staged') {
    return `staged changes${pathList}`
  }

  return scope.paths?.length ? `working-tree paths${pathList}` : 'working tree'
}

export async function readGitDiffSummary(rootDir, scope) {
  const diffStat = await gitOutput(rootDir, getDiffSummaryArgs(scope))

  if (diffStat.trim()) {
    return diffStat.trim()
  }

  if (scope?.mode === 'staged') {
    const stagedStatus = await gitOutput(rootDir, [
      'diff',
      '--cached',
      '--name-status',
      '--',
      ...(scope.paths ?? []),
    ])
    return stagedStatus.trim() || 'No staged changes detected.'
  }

  const status = await gitOutput(rootDir, ['status', '--short', '--', ...(scope?.paths ?? [])])
  return status.trim() || 'No working-tree changes detected.'
}

async function getChangedFiles(rootDir, scope) {
  const output = await gitOutput(rootDir, [
    'status',
    '--porcelain',
    '-uall',
    '--',
    ...scope.paths,
  ])

  return output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((filePath) => filePath.split(' -> ').at(-1) ?? filePath)
    .map(normalizeRepoPath)
    .filter(Boolean)
}

async function getWorkingTreeDiffInputs(rootDir, scope) {
  const [changedFiles, diffStats, diffText] = await Promise.all([
    getChangedFiles(rootDir, scope),
    getDiffStats(rootDir, scope),
    getDiffText(rootDir, scope),
  ])

  return {
    changedFiles,
    diffLineCount: diffStats.diffLineCount,
    diffText,
    gitError: null,
    scope,
  }
}

async function getStagedDiffInputs(rootDir, scope) {
  const pathArgs = ['--', ...scope.paths]
  const [changedFilesOutput, diffStatsOutput, diffText] = await Promise.all([
    gitOutput(rootDir, [
      'diff',
      '--cached',
      '--name-only',
      '--find-renames',
      '--diff-filter=ACMRD',
      ...pathArgs,
    ]),
    gitOutput(rootDir, ['diff', '--cached', '--numstat', ...pathArgs]),
    gitOutput(rootDir, ['diff', '--cached', '--unified=0', ...pathArgs]),
  ])

  return {
    changedFiles: changedFilesOutput
      .split('\n')
      .map((line) => normalizeRepoPath(line.trim()))
      .filter(Boolean),
    diffLineCount: countDiffNumstatLines(diffStatsOutput),
    diffText,
    gitError: null,
    scope,
  }
}

async function getDiffInputsForRefs(rootDir, scope) {
  if (!scope.baseRef || !scope.headRef) {
    return {
      changedFiles: [],
      diffLineCount: 0,
      diffText: '',
      gitError: 'Both --base and --head are required for PR diff classification.',
      scope,
    }
  }

  const rangeArgs = [`${scope.baseRef}...${scope.headRef}`, '--']
  const [changedFilesResult, diffStatsResult, diffTextResult] = await Promise.all([
    gitOutputResult(rootDir, [
      'diff',
      '--name-only',
      '--find-renames',
      '--diff-filter=ACMR',
      ...rangeArgs,
    ]),
    gitOutputResult(rootDir, ['diff', '--numstat', ...rangeArgs]),
    gitOutputResult(rootDir, ['diff', '--unified=0', ...rangeArgs]),
  ])
  const failedResult = [changedFilesResult, diffStatsResult, diffTextResult].find(
    (result) => !result.ok,
  )

  if (failedResult) {
    return {
      changedFiles: [],
      diffLineCount: 0,
      diffText: '',
      gitError: `Unable to read git diff for ${scope.baseRef}...${scope.headRef}: ${failedResult.message}`,
      scope,
    }
  }

  return {
    changedFiles: changedFilesResult.stdout
      .split('\n')
      .map((line) => normalizeRepoPath(line.trim()))
      .filter(Boolean),
    diffLineCount: countDiffNumstatLines(diffStatsResult.stdout),
    diffText: diffTextResult.stdout,
    gitError: null,
    scope,
  }
}

async function getDiffStats(rootDir, scope) {
  const output = await gitOutput(rootDir, ['diff', '--numstat', 'HEAD', '--', ...scope.paths])

  return { diffLineCount: countDiffNumstatLines(output) }
}

function countDiffNumstatLines(output) {
  let diffLineCount = 0

  for (const line of output.split('\n')) {
    const [added, removed] = line.split('\t')
    const addedLines = Number.parseInt(added, 10)
    const removedLines = Number.parseInt(removed, 10)

    if (Number.isFinite(addedLines)) {
      diffLineCount += addedLines
    }

    if (Number.isFinite(removedLines)) {
      diffLineCount += removedLines
    }
  }

  return diffLineCount
}

async function getDiffText(rootDir, scope) {
  return gitOutput(rootDir, ['diff', '--unified=0', 'HEAD', '--', ...scope.paths])
}

function getDiffSummaryArgs(scope) {
  if (scope?.mode === 'staged') {
    return ['diff', '--cached', '--stat', '--', ...(scope.paths ?? [])]
  }

  return ['diff', '--stat', 'HEAD', '--', ...(scope?.paths ?? [])]
}

function normalizeScopePaths(value) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : []
  const paths = rawValues
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim().replace(/\\/g, '/').replace(/^\.\//, ''))
    .filter(Boolean)

  return [...new Set(paths)]
}

async function gitOutput(rootDir, args) {
  try {
    const result = await execFileAsync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })

    return result.stdout
  } catch {
    return ''
  }
}

async function gitOutputResult(rootDir, args) {
  try {
    const result = await execFileAsync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })

    return {
      ok: true,
      stdout: result.stdout,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return {
      message,
      ok: false,
      stdout: '',
    }
  }
}
