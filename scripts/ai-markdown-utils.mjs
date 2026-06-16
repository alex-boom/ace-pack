const PLACEHOLDER_PATTERN = /\[[^\]]+\]|\bTODO\b|\bTBD\b|No .* recorded/i

export function formatBullets(items, fallback = '- [Add content here]') {
  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => `- ${item}`).join('\n')
}

export function formatChecklist(items, fallback = '- [ ] Add checklist item') {
  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => (item.startsWith('- [') ? item : `- [ ] ${item}`)).join('\n')
}

export function replaceMarkdownSection(content, heading, body) {
  const lines = content.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => getMarkdownHeading(line)?.title === heading)

  if (startIndex === -1) {
    return content
  }

  const headingInfo = getMarkdownHeading(lines[startIndex])
  let endIndex = lines.length

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const currentHeading = getMarkdownHeading(lines[index])

    if (currentHeading && currentHeading.level <= headingInfo.level) {
      endIndex = index
      break
    }
  }

  const replacementLines = [`${'#'.repeat(headingInfo.level)} ${heading}`, ...body.trimEnd().split('\n')]
  const nextLines = [
    ...lines.slice(0, startIndex),
    ...replacementLines,
    '',
    ...lines.slice(endIndex),
  ]

  return normalizeTrailingNewline(nextLines.join('\n')).replace(/\n{3,}/g, '\n\n')
}

export function extractMarkdownSection(content, heading) {
  const lines = content.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => getMarkdownHeading(line)?.title === heading)

  if (startIndex === -1) {
    return ''
  }

  const headingInfo = getMarkdownHeading(lines[startIndex])
  let endIndex = lines.length

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const currentHeading = getMarkdownHeading(lines[index])

    if (currentHeading && currentHeading.level <= headingInfo.level) {
      endIndex = index
      break
    }
  }

  return lines.slice(startIndex + 1, endIndex).join('\n').trim()
}

export function replaceLabeledValue(content, label, value) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:.*$`, 'm')
  return content.replace(pattern, `${label}: ${value}`)
}

export function countCheckboxes(content) {
  const total = (content.match(/^- \[(?: |x)\]/gm) ?? []).length
  const complete = (content.match(/^- \[x\]/gm) ?? []).length
  return { complete, total }
}

export function extractTopDecision(content) {
  const headings = [...content.matchAll(/^## .+$/gm)]
  const heading = headings.at(-1)

  if (!heading || heading.index === undefined) {
    return ''
  }

  return content.slice(heading.index).trim()
}

export function extractLabeledValue(content, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm')
  return content.match(pattern)?.[1]?.trim() ?? ''
}

export function hasMeaningfulContent(content) {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  return normalizedContent.length > 0 && !PLACEHOLDER_PATTERN.test(normalizedContent)
}

function getMarkdownHeading(line) {
  const match = line.match(/^(#{2,6})\s+(.+)$/u)
  return match ? { level: match[1].length, title: match[2].trim() } : null
}

function normalizeTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
