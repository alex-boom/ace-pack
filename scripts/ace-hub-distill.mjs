import { extractMarkdownSection, readMemoryFile } from './ai-memory-utils.mjs'

export const DISTILL_SYSTEM_INSTRUCTION =
  'You are a Knowledge Engineer. Your task is to distill resolved friction and reflections into permanent project rules to prevent future AI agents from making the same mistakes.'

const RESOLVED_HEADING_PATTERN = /^##\s+Resolved\s*$/mu
const FALLBACK_FOCUS_INSTRUCTION =
  'Focus ONLY on the ## Resolved section. Ignore ## Unresolved.'

export async function buildDistillPayload(rootDir, {
  generatedAt,
  mode,
  taskAutonomy,
}) {
  const [reflectionLogContent, projectConventionsContent] = await Promise.all([
    readMemoryFile(rootDir, 'reflectionLog'),
    readMemoryFile(rootDir, 'projectConventions'),
  ])

  if (reflectionLogContent === null) {
    throw new Error('Missing required context file: .ai/knowledge/reflection-log.md')
  }

  const includedFiles = ['.ai/knowledge/reflection-log.md']
  const missingOptionalFiles = []
  if (projectConventionsContent === null) {
    missingOptionalFiles.push('.ai/knowledge/project-conventions.md')
  } else {
    includedFiles.push('.ai/knowledge/project-conventions.md')
  }

  return {
    gitSummary: null,
    includedFiles,
    missingOptionalFiles,
    payload: formatDistillPayload({
      generatedAt,
      mode,
      projectConventionsContent,
      reflectionContext: extractResolvedReflectionContext(reflectionLogContent),
      taskAutonomy,
    }),
  }
}

function formatDistillPayload({
  generatedAt,
  mode,
  projectConventionsContent,
  reflectionContext,
  taskAutonomy,
}) {
  return `# ACE Knowledge Promotion Context
- Mode: ${mode.id} (${mode.label})
- Current Phase: ${taskAutonomy.currentPhase}
- Next Autonomous Action: ${taskAutonomy.nextAutonomousAction}
- Generated: ${generatedAt}

## System Instruction
${DISTILL_SYSTEM_INSTRUCTION}

## Knowledge Promotion Task
- Extract durable project rules, guardrails, and conventions from resolved reflections.
- Add only broadly reusable rules to \`.ai/knowledge/project-conventions.md\`.
- Preserve concrete evidence when it helps future agents avoid the same issue.
- After promoting rules, remove the promoted resolved items from \`.ai/knowledge/reflection-log.md\`.

## Current Project Conventions
${projectConventionsContent?.trim() || '- Project conventions file not found.'}

${reflectionContext}
`
}

function extractResolvedReflectionContext(reflectionLogContent) {
  if (!RESOLVED_HEADING_PATTERN.test(reflectionLogContent)) {
    return `## Reflection Log Fallback
${FALLBACK_FOCUS_INSTRUCTION}

\`\`\`markdown
${reflectionLogContent.trimEnd()}
\`\`\``
  }

  const resolvedSection = extractMarkdownSection(reflectionLogContent, 'Resolved')
  if (!resolvedSection.trim()) {
    return `## Resolved Reflections
- No resolved reflections recorded. Nothing is ready to promote.`
  }

  return `## Resolved Reflections
${resolvedSection}`
}
