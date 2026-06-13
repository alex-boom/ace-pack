import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { formatTimestamp, readTextIfExists, writeTextFile } from './ai-memory-utils.mjs'

const execFileAsync = promisify(execFile)

const rootDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()
const aiDir = path.join(rootDir, '.ai')
const outputMdPath = path.join(aiDir, 'report-current-task-code.md')
const outputXmlPath = path.join(aiDir, 'report-current-task-code.xml')

const packageJsonContent = await readTextIfExists(path.join(rootDir, 'package.json'))
if (packageJsonContent === null) {
  throw new Error('Missing package.json for ai:report:current-task-code.')
}

const packageJson = JSON.parse(packageJsonContent)
const generatedAt = new Date()

const isCodeFile = (filePath) =>
  !filePath.startsWith('.ai/') &&
  !filePath.startsWith('node_modules/') &&
  (/\.(ts|tsx|js|mjs|cjs|json)$/u.test(filePath) || filePath === 'package.json')

const getTrackedAndUntrackedFiles = async () => {
  const [statusResult, untrackedResult] = await Promise.all([
    execFileAsync('git', ['status', '--porcelain'], { cwd: rootDir, encoding: 'utf8' }),
    execFileAsync('git', ['ls-files', '--others', '--exclude-standard'], {
      cwd: rootDir,
      encoding: 'utf8',
    }),
  ])

  const trackedModifiedFiles = statusResult.stdout
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((filePath) => filePath.length > 0)

  const untrackedFiles = untrackedResult.stdout
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)

  return [...new Set([...trackedModifiedFiles, ...untrackedFiles])].filter(isCodeFile)
}

const safeReadFile = async (filePath) => {
  try {
    return await readFile(path.join(rootDir, filePath), 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const codeFiles = await getTrackedAndUntrackedFiles()
const fileEntries = await Promise.all(
  codeFiles.map(async (filePath) => ({
    path: filePath,
    content: await safeReadFile(filePath),
  })),
)

const entries = fileEntries.filter((entry) => entry.content !== null)
const missingFiles = fileEntries.filter((entry) => entry.content === null)

const md = [
  '# AI Current Task Code Report',
  '',
  `Project: \`${packageJson.name}\``,
  `Generated: ${formatTimestamp(generatedAt)}`,
  '',
  ...(missingFiles.length > 0
    ? [
        '## Missing Files',
        ...missingFiles.map((entry) => `- \`${entry.path}\` (file missing at report time)`),
        '',
      ]
    : []),
  '## Files',
  ...entries.flatMap((entry) => [
    `### \`${entry.path}\``,
    '```ts',
    entry.content.trimEnd(),
    '```',
    '',
  ]),
].join('\n')

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<current-task-code-report project="${escapeXml(packageJson.name)}" generated="${escapeXml(formatTimestamp(generatedAt))}">`,
  ...(missingFiles.length > 0
    ? [
        '  <missing-files>',
        ...missingFiles.map(
          (entry) => `    <file path="${escapeXml(entry.path)}" reason="missing-at-report-time" />`,
        ),
        '  </missing-files>',
      ]
    : []),
  ...entries.map(
    (entry) =>
      `  <file path="${escapeXml(entry.path)}"><![CDATA[${entry.content.trimEnd()}]]></file>`,
  ),
  '</current-task-code-report>',
].join('\n')

await writeTextFile(outputMdPath, md)
await writeTextFile(outputXmlPath, xml)

process.stderr.write(`Generated ${outputMdPath}\nGenerated ${outputXmlPath}\n`)
