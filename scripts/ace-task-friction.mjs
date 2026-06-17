import {
  extractMarkdownSection,
  replaceMarkdownSection,
} from './ai-memory-utils.mjs'

export const FRICTION_ENCOUNTERED_LABEL = 'Friction Encountered'
export const DEFAULT_FRICTION_ENCOUNTERED = 'no'

export function ensureFrictionLifecycleField(lifecycleContent) {
  if (hasLifecycleLabel(lifecycleContent, FRICTION_ENCOUNTERED_LABEL)) {
    return lifecycleContent
  }
  return setLifecycleLabel(lifecycleContent, FRICTION_ENCOUNTERED_LABEL, DEFAULT_FRICTION_ENCOUNTERED)
}

export function extractFrictionEncountered(taskStateContent) {
  const lifecycle = extractMarkdownSection(taskStateContent, 'Lifecycle')
  return extractLifecycleValue(lifecycle, FRICTION_ENCOUNTERED_LABEL).toLowerCase() === 'yes'
}

export function setTaskFrictionEncountered(taskStateContent, value = 'yes') {
  const lifecycle = extractMarkdownSection(taskStateContent, 'Lifecycle')
  if (!lifecycle) {
    return taskStateContent
  }
  const nextLifecycle = setLifecycleLabel(
    lifecycle,
    FRICTION_ENCOUNTERED_LABEL,
    normalizeFrictionValue(value),
  )
  return replaceMarkdownSection(taskStateContent, 'Lifecycle', nextLifecycle)
}

export function normalizeFrictionValue(value) {
  return String(value).trim().toLowerCase() === 'yes' ? 'yes' : 'no'
}

function setLifecycleLabel(lifecycleContent, label, value) {
  const lines = lifecycleContent.trimEnd().split(/\r?\n/u)
  const pattern = new RegExp(`^${escapeRegExp(label)}:`, 'u')
  const existingIndex = lines.findIndex((line) => pattern.test(line))
  if (existingIndex !== -1) {
    lines[existingIndex] = `${label}: ${value}`
    return lines.join('\n')
  }
  const insertIndex = getFrictionInsertIndex(lines)
  lines.splice(insertIndex + 1, 0, `${label}: ${value}`)
  return lines.join('\n')
}

function hasLifecycleLabel(lifecycleContent, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:`, 'm')
  return pattern.test(lifecycleContent)
}

function extractLifecycleValue(lifecycleContent, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm')
  return lifecycleContent.match(pattern)?.[1]?.trim() ?? ''
}

function getFrictionInsertIndex(lines) {
  const preferredLabels = ['Design Review Required', 'Task Tier', 'Version', 'Status']
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
