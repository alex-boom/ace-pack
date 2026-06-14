import path from 'node:path'

import { validateAgentMemory } from './agent-memory-lib.mjs'
import {
  extractLabeledValue,
  extractMarkdownSection,
  hasMeaningfulContent,
  readMemoryFile,
  writeAceBanner,
} from './ai-memory-utils.mjs'

const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd()

writeAceBanner()

const issues = await validateAgentMemory(targetDir)

if (issues.length > 0) {
  process.stderr.write(`ACE memory check failed for ${targetDir}\n`)

  for (const issue of issues) {
    process.stderr.write(`- ${issue}\n`)
  }

  process.exit(1)
}

process.stderr.write(`ACE memory check passed for ${targetDir}\n`)

const warnings = await collectMemoryWarnings(targetDir)

if (warnings.length > 0) {
  process.stderr.write('Warnings:\n')

  for (const warning of warnings) {
    process.stderr.write(`- ${warning}\n`)
  }
}

async function collectMemoryWarnings(rootDir) {
  const [currentTaskContent, handoffContent, reportBriefContent] = await Promise.all([
    readMemoryFile(rootDir, 'currentTask'),
    readMemoryFile(rootDir, 'sessionHandoff'),
    readMemoryFile(rootDir, 'reportBrief'),
  ])
  const warnings = []

  if (handoffContent !== null) {
    const lastUpdate = extractMarkdownSection(handoffContent, 'Last Update')
    const handoffAgeDays = getAgeInDays(lastUpdate)

    if (handoffAgeDays !== null && handoffAgeDays > 7) {
      warnings.push(
        `.ai/session-handoff.md Last Update is ${handoffAgeDays} day(s) old; refresh handoff if work is active.`,
      )
    }
  }

  if (reportBriefContent !== null) {
    const metadata = extractMarkdownSection(reportBriefContent, 'Report Metadata')
    const freshness =
      extractLabeledValue(metadata, '- Freshness') || extractLabeledValue(metadata, 'Freshness')

    if (freshness && freshness.toLowerCase() !== 'fresh') {
      warnings.push(`.ai/report-brief.md freshness is "${freshness}"; regenerate reports if context changed.`)
    }
  }

  if (currentTaskContent !== null && handoffContent !== null) {
    const lifecycle = extractMarkdownSection(currentTaskContent, 'Lifecycle')
    const taskStatus = extractLabeledValue(lifecycle, 'Status')
    const nextSteps = extractMarkdownSection(handoffContent, 'Next Steps')

    if (taskStatus.toLowerCase() === 'complete' && !hasMeaningfulContent(nextSteps)) {
      warnings.push(
        'Current task is complete but .ai/session-handoff.md Next Steps is empty or placeholder text.',
      )
    }
  }

  return warnings
}

function getAgeInDays(value) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'))

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  const ageMs = Date.now() - parsedDate.getTime()

  return Math.floor(ageMs / (24 * 60 * 60 * 1000))
}
