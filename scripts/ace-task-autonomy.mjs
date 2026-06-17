import {
  extractLabeledValue,
  extractMarkdownSection,
  replaceMarkdownSection,
} from './ai-memory-utils.mjs'

export const AUTONOMY_PHASES = ['Planning', 'Implementation', 'Review', 'Complete']
export const DEFAULT_CURRENT_PHASE = 'Planning'
export const DEFAULT_NEXT_AUTONOMOUS_ACTION =
  'Analyze task and update Business Value & Approach.'
export const COMPLETED_NEXT_AUTONOMOUS_ACTION =
  'No further autonomous action; task is complete.'

export function setTaskAutonomyFields(taskStateContent, {
  nextAction,
  phase,
} = {}) {
  const lifecycle = extractMarkdownSection(taskStateContent, 'Lifecycle')
  if (!lifecycle) {
    return taskStateContent
  }
  let nextLifecycle = lifecycle
  if (phase !== undefined) {
    assertAutonomyPhase(phase)
    nextLifecycle = setLifecycleLabel(nextLifecycle, 'Current Phase', phase)
  }
  if (nextAction !== undefined) {
    nextLifecycle = setLifecycleLabel(nextLifecycle, 'Next Autonomous Action', nextAction)
  }
  return replaceMarkdownSection(taskStateContent, 'Lifecycle', nextLifecycle)
}

export function markTaskAutonomyComplete(taskStateContent) {
  return setTaskAutonomyFields(taskStateContent, {
    nextAction: COMPLETED_NEXT_AUTONOMOUS_ACTION,
    phase: 'Complete',
  })
}

export function ensureAutonomyLifecycleFields(lifecycleContent) {
  let nextLifecycle = lifecycleContent
  if (!hasLifecycleLabel(nextLifecycle, 'Current Phase')) {
    nextLifecycle = setLifecycleLabel(nextLifecycle, 'Current Phase', DEFAULT_CURRENT_PHASE)
  }
  if (!hasLifecycleLabel(nextLifecycle, 'Next Autonomous Action')) {
    nextLifecycle = setLifecycleLabel(
      nextLifecycle,
      'Next Autonomous Action',
      DEFAULT_NEXT_AUTONOMOUS_ACTION,
    )
  }
  return nextLifecycle
}

export function extractTaskAutonomy(taskStateContent) {
  const lifecycle = taskStateContent ? extractMarkdownSection(taskStateContent, 'Lifecycle') : ''
  return {
    currentPhase: extractLabeledValue(lifecycle, 'Current Phase') || 'unknown',
    nextAutonomousAction:
      extractLabeledValue(lifecycle, 'Next Autonomous Action') || 'unknown',
  }
}

function assertAutonomyPhase(phase) {
  if (!AUTONOMY_PHASES.includes(phase)) {
    throw new Error(
      `Invalid Current Phase: ${phase}. Expected one of ${AUTONOMY_PHASES.join(', ')}.`,
    )
  }
}

function setLifecycleLabel(lifecycleContent, label, value) {
  const lines = lifecycleContent.trimEnd().split(/\r?\n/u)
  const pattern = new RegExp(`^${escapeRegExp(label)}:`, 'u')
  const existingIndex = lines.findIndex((line) => pattern.test(line))
  if (existingIndex !== -1) {
    lines[existingIndex] = `${label}: ${value}`
    return lines.join('\n')
  }
  const insertIndex = getLifecycleInsertIndex(lines, label)
  lines.splice(insertIndex + 1, 0, `${label}: ${value}`)
  return lines.join('\n')
}

function hasLifecycleLabel(lifecycleContent, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:`, 'm')
  return pattern.test(lifecycleContent)
}

function getLifecycleInsertIndex(lines, label) {
  const preferredLabels =
    label === 'Next Autonomous Action'
      ? ['Current Phase', 'Design Review Required', 'Task Tier', 'Version', 'Status']
      : ['Design Review Required', 'Task Tier', 'Version', 'Status']
  for (const preferredLabel of preferredLabels) {
    const index = lines.findIndex((line) => line.startsWith(`${preferredLabel}:`))
    if (index !== -1) {
      return index
    }
  }
  return lines.length - 1
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
