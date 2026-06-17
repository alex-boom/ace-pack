import { classifyRepositoryTask } from './ai-task-classify.mjs'
import { readMemoryConfig } from './ai-memory-config.mjs'
import { extractMarkdownSection, readMemoryFile } from './ai-memory-utils.mjs'

export const RED_TEAM_SYSTEM_INSTRUCTION =
  'You are a ruthless Red Team adversarial architect. Your job is to aggressively find flaws, security vulnerabilities, performance bottlenecks, and unhandled edge cases in the proposed approach.'

export async function buildRedTeamPayload(rootDir, {
  generatedAt,
  mode,
  taskAutonomy,
}) {
  const [
    taskStateContent,
    memoryConfigContent,
    memoryConfig,
    projectConventionsContent,
    classification,
  ] = await Promise.all([
    readMemoryFile(rootDir, 'taskState'),
    readMemoryFile(rootDir, 'memoryConfig'),
    readMemoryConfig(rootDir),
    readMemoryFile(rootDir, 'projectConventions'),
    classifyRepositoryTask(rootDir),
  ])

  if (taskStateContent === null) {
    throw new Error('Missing required context file: .ai/state/task-state.md')
  }

  const missingOptionalFiles = []
  const includedFiles = ['.ai/state/task-state.md']
  if (memoryConfigContent !== null) {
    includedFiles.push('.ai/config/memory-config.json')
  }
  if (projectConventionsContent === null) {
    missingOptionalFiles.push('.ai/knowledge/project-conventions.md')
  } else {
    includedFiles.push('.ai/knowledge/project-conventions.md')
  }

  return {
    gitSummary: null,
    includedFiles,
    missingOptionalFiles,
    payload: formatRedTeamPayload({
      classification,
      generatedAt,
      memoryConfig,
      mode,
      projectConventionsContent,
      taskAutonomy,
      taskStateContent,
    }),
  }
}

function formatRedTeamPayload({
  classification,
  generatedAt,
  memoryConfig,
  mode,
  projectConventionsContent,
  taskAutonomy,
  taskStateContent,
}) {
  return `# ACE Agentic Red Team Context
- Mode: ${mode.id} (${mode.label})
- Current Phase: ${taskAutonomy.currentPhase}
- Next Autonomous Action: ${taskAutonomy.nextAutonomousAction}
- Generated: ${generatedAt}

## System Instruction
${RED_TEAM_SYSTEM_INSTRUCTION}

## Red Team Task
- Attack the proposed approach before implementation starts.
- Identify at least two concrete failure modes, edge cases, security risks, or performance bottlenecks.
- For every flaw, propose a practical mitigation that can be documented in task-state.
- Call out missing acceptance criteria or planning gaps that should block Implementation.

## Proposed Work

### Goal
${sectionOrFallback(taskStateContent, 'Goal')}

### Business Value & Approach
${sectionOrFallback(taskStateContent, 'Business Value & Approach')}

## Governance

### Project Conventions
${projectConventionsContent?.trim() || '- Project conventions file not found.'}

### Configured High-Risk Rules
${formatConfiguredRiskRules(memoryConfig)}

### Triggered High-Risk Rules
${formatTriggeredRiskRules(classification)}
`
}

function sectionOrFallback(content, heading) {
  return extractMarkdownSection(content, heading) || '- Not recorded.'
}

function formatConfiguredRiskRules(memoryConfig) {
  const pathRules = memoryConfig.highRiskPaths.map((rule) => {
    return `- Path: ${rule.label} (\`${rule.pattern}\`, tier: ${rule.tier}, requires design review: ${rule.requiresDesignReview ? 'yes' : 'no'})`
  })
  const keywordRules = memoryConfig.highRiskKeywords.map((rule) => {
    return `- Keyword: ${rule.label} (\`${rule.keyword}\`, tier: ${rule.tier}, requires design review: ${rule.requiresDesignReview ? 'yes' : 'no'})`
  })
  const rules = [...pathRules, ...keywordRules]

  return rules.length > 0 ? rules.join('\n') : '- No high-risk rules configured.'
}

function formatTriggeredRiskRules(classification) {
  if (classification.gitError) {
    return `- Unable to inspect git diff: ${classification.gitError}`
  }
  if (classification.riskMatches.length === 0) {
    return '- No high-risk rules triggered by current diff.'
  }

  return classification.riskMatches.map((match) => {
    const matched = match.matched.length > 0 ? match.matched.join(', ') : 'diff content'
    return `- ${match.label} (${match.kind}: \`${match.pattern}\`, tier: ${match.tier}, requires design review: ${match.requiresDesignReview ? 'yes' : 'no'}; matched: ${matched})`
  }).join('\n')
}
