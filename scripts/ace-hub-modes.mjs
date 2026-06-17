function requiredFile(filePath) { return { path: filePath, required: true } }
function optionalFile(filePath) { return { path: filePath, required: false } }

export const HUB_MODES = [
  {
    id: 'start',
    number: '1',
    aliases: ['coder'],
    label: 'Start / AI Coder Context',
    description: 'Brief, active task state, conventions, and reflection.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/state/task-state.md'),
      requiredFile('.ai/knowledge/reflection-log.md'),
    ],
  },
  {
    id: 'architect',
    number: '2',
    aliases: [],
    label: 'AI Architect Context',
    description: 'Repo rules, technical docs, decisions, roadmap, and brief.',
    files: [
      requiredFile('AGENTS.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/knowledge/tech-docs.md'),
      requiredFile('.ai/knowledge/decisions.md'),
      requiredFile('.ai/knowledge/product-roadmap.md'),
      optionalFile('.ai/generated/report-brief.md'),
    ],
  },
  {
    id: 'architect-lite',
    aliases: ['plan'],
    label: 'AI Architect Lite Context',
    description: 'Brief, repo rules, roadmap, and technical docs without full decisions history.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('AGENTS.md'),
      optionalFile('.ai/knowledge/project-conventions.md'),
      requiredFile('.ai/knowledge/product-roadmap.md'),
      requiredFile('.ai/knowledge/tech-docs.md'),
    ],
  },
  {
    id: 'business',
    number: '3',
    aliases: [],
    label: 'Business Report',
    description: 'Roadmap and recent work log for human review.',
    files: [requiredFile('.ai/knowledge/product-roadmap.md'), requiredFile('.ai/knowledge/work-log.md')],
  },
  {
    id: 'docs',
    number: '4',
    aliases: [],
    label: 'Developer Docs',
    description: 'Technical docs and optional setup/devops notes.',
    files: [requiredFile('.ai/knowledge/tech-docs.md'), optionalFile('DEVOPS.md')],
  },
  {
    id: 'handoff',
    aliases: [],
    label: 'Agent Handoff Context',
    description: 'Brief, task state, and decisions.',
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('.ai/state/task-state.md'),
      requiredFile('.ai/knowledge/decisions.md'),
    ],
  },
  {
    id: 'review',
    aliases: ['eval', 'evaluate'],
    label: 'Agentic Evaluation Review',
    description: 'Strict reviewer prompt with intent, conventions, risk rules, and git diff.',
    reviewPayload: true,
    files: [],
  },
  {
    id: 'red-team',
    aliases: ['redteam', 'adversarial'],
    label: 'Agentic Red Team Planning',
    description: 'Adversarial planning prompt for edge cases, risks, and mitigations.',
    redTeamPayload: true,
    files: [],
  },
  {
    id: 'pr',
    aliases: [],
    label: 'PR Summary Context',
    description: 'Brief, task state, verification, and git summary.',
    includeGitSummary: true,
    files: [
      optionalFile('.ai/generated/report-brief.md'),
      requiredFile('.ai/state/task-state.md'),
    ],
  },
]

export const HUB_MENU = `[ACE] Agentic Context Engine - Knowledge Hub
Select the context payload you want to generate:
${HUB_MODES.map((mode) => {
  const selector = mode.number ?? mode.id
  return `[${selector}] ${mode.label} (${mode.description})`
})
  .join('\n')}
`

export function listHubModes() {
  return HUB_MODES.map((mode) => {
    const names = [mode.number, mode.id, ...mode.aliases].filter(Boolean).join(', ')
    return `${names.padEnd(20)} ${mode.label} - ${mode.description}`
  }).join('\n')
}

export function resolveHubMode(selection) {
  const normalized = String(selection ?? '')
    .trim()
    .toLowerCase()
  const mode = HUB_MODES.find((candidate) => {
    return (
      candidate.id === normalized ||
      candidate.number === normalized ||
      candidate.aliases.includes(normalized)
    )
  })
  if (!mode) {
    throw new Error(`Invalid ACE hub mode: ${selection}`)
  }
  return mode
}
