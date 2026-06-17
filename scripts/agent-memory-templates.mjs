import { NEUTRAL_MEMORY_CONFIG } from './ace-project-presets.mjs'
import { taskStateTemplate } from './ace-task-state.mjs'
import { productRoadmapTemplate, techDocsTemplate } from './ace-universal-doc-templates.mjs'

export const AGENTS_WORKFLOW_HEADER = '## ACE (Agentic Context Engine) Workflow'
export const AGENTS_WORKFLOW_MARKER = '<!-- agent-memory-workflow:start -->'
export const AGENTS_WORKFLOW_END_MARKER = '<!-- agent-memory-workflow:end -->'
export const CLAUDE_REQUIRED_SNIPPETS = ['AGENTS.md', '.ai/']

export const memoryConfigTemplate = JSON.stringify(NEUTRAL_MEMORY_CONFIG, null, 2)


export const decisionsTemplate = `# Decisions

## [YYYY-MM-DD HH:mm]

Decision:
- [Document the durable decision]

Reason:
- [Explain why it was made]

Impact:
- [Explain what this changes]
`

export const workLogTemplate = `# Work Log

## [YYYY-MM-DD HH:mm]

- [Append short session summaries here]
`

export const reflectionLogTemplate = `# Reflection Log

Use this file for short, actionable agent-process reflections. Do not log every
minor task; record repeated tool friction, unclear prompts, poor assumptions,
or workflow improvements worth carrying into future sessions.

## Unresolved

### [YYYY-MM-DD HH:mm] [Short issue title]
Status: unresolved
- Stuck Point: [Where the agent got stuck]
- Likely Cause: [Tooling, prompt, missing context, or process issue]
- Proposed Improvement: [Concrete change to try next time]

## Resolved
`

export const claudeTemplate = `# CLAUDE.md

## Repository Rules

\`AGENTS.md\` is the authoritative source for repository constraints, stack
choices, architecture rules, and quality gates. Read it first in every session.

## Startup Workflow

After reading \`AGENTS.md\`, read:

1. \`.ai/generated/report-brief.md\` if available for compact context.
2. \`.ai/state/task-state.md\`
3. \`.ai/knowledge/decisions.md\`
4. Recent unresolved entries in \`.ai/knowledge/reflection-log.md\`

Legacy root \`.ai/*.md\` files remain readable as migration aliases. Read
\`.ai/knowledge/work-log.md\` only when you need additional history for the
current task.

## Working Rules

- Prefer minimal diffs over rewrites.
- Preserve existing TypeScript, UI, and API contracts unless the task says
  otherwise.
- Use \`pnpm ace classify\` to select the adaptive task tier. With npm, use
  \`npm run ace -- classify\`.
- Run \`pnpm ace onboard\` after fresh installation in an unfamiliar project
  before trusting project-specific risk rules.
- On Windows PowerShell, use \`pnpm.cmd ace classify\`,
  \`pnpm.cmd ace check\`, and project-owned \`pnpm.cmd ace:validate\` if script
  execution policy blocks the \`pnpm\` shim.
- For large or high-risk standard tasks, complete the
  \`.ai/state/task-state.md\` Business Value & Approach section before writing
  code.
- Use \`.ai/state/task-state.md\` Current Phase and Next Autonomous Action as
  the autonomous handoff bus. Update those fields directly in Markdown when
  switching Planning, Implementation, Review, or Complete; CLI update commands
  are optional for scripts.
- When Current Phase is \`Review\`, act as a strict reviewer. Run
  \`pnpm ace hub review\` (or \`npm run ace -- hub review\`) to read the
  evaluation context, compare the original intent and conventions against the
  git diff, then either return to Implementation with specific fixes in
  \`Next Autonomous Action\` or run \`ace:validate\` and \`pnpm ace finish\`
  when review passes.
- Treat \`.ai/*\` as the current source of task context and handoff state.
- Use \`YYYY-MM-DD HH:mm\` timestamps in task state, work-log, reflection-log,
  and decisions entries.

## End-of-Task Routine

Do the smallest closeout that preserves future agent context and project
safety:

1. Always summarize what changed, update changed files, record verification,
   run project-owned \`pnpm ace:validate\`, and state publish/deploy decision when relevant.
   If release is deferred, say so explicitly.
2. For small low-risk tasks, \`pnpm ace finish\` auto-closes compact
   task-state, work-log, and brief report notes without manual ceremony.
3. For standard or large tasks, add product, architecture, security, and
   code-quality review notes.
4. For large or high-risk tasks, confirm the design approach, add reflection
   only when useful, and let \`pnpm ace finish\` archive the snapshot.
5. Update tech docs, product roadmap, durable decisions, or release notes only
   when those facts actually changed.
6. For release-bound shipped changes, run the project's local smoke and
   dogfood/self-check routines before final publish or deploy when available.
`

export const agentsWorkflowSection = `<!-- agent-memory-workflow:start -->
## ACE (Agentic Context Engine) Workflow

ACE is the local automation framework for managing AI context, code quality,
and decision history. Use this workflow on top of the repo rules above;
\`AGENTS.md\` remains the authoritative source for stack, architecture, and
quality constraints.

ACE v3 canonical memory is organized under \`.ai/config\`, \`.ai/state\`,
\`.ai/knowledge\`, and \`.ai/generated\`. Active task context lives in
\`.ai/state/task-state.md\`.

Before starting work:

1. Read \`AGENTS.md\` first.
2. If available, read \`.ai/generated/report-brief.md\` first for a compact
   summary, including recent unresolved reflections.
3. Treat \`.ai/*\` as authoritative and read \`.ai/state/task-state.md\` and
   \`.ai/knowledge/decisions.md\` when you need detail or verification.
4. Run \`pnpm ace classify\` before implementation to
   identify whether the task is small, standard, or large.
5. If this is a newly installed or unknown project and
   \`.ai/config/memory-config.json\` is still marked \`unprofiled\`, run
   \`pnpm ace onboard\` and apply an approved profile
   before implementation.
6. For large tasks, and standard tasks with high-risk signals, complete the
   \`.ai/state/task-state.md\` Business Value & Approach section before writing
   code. Compare at least two viable patterns and choose explicitly.
7. Read \`.ai/knowledge/work-log.md\` only when you need extra historical
   context.
8. If the memory files are missing, run \`pnpm ace init\`.

Command note: all ACE commands are routed through the single \`ace\` command.
Examples use \`pnpm\`: \`pnpm ace finish\`, \`pnpm ace hub\`, and
\`pnpm ace check\`. npm users must pass router arguments after \`--\`, such as
\`npm run ace -- finish\`. On Windows PowerShell, use \`pnpm.cmd ace classify\`
or \`pnpm.cmd ace check\` if the \`pnpm\` shim is blocked by execution policy.
\`ace:validate\` is the project-owned mechanical gate script for lint,
typecheck, tests, or equivalent project checks.

Legacy command names are supported only as router arguments, such as
\`pnpm ace ai:task:classify\`, \`pnpm ace ai:task:finish\`, and
\`pnpm ace agent-memory:init\`.

IDE rule files such as \`.cursorrules\`, \`.windsurfrules\`, and
\`.github/copilot-instructions.md\` are thin bridges into this workflow.
\`AGENTS.md\` remains authoritative.

While working:

- Prefer minimal, safe diffs that preserve existing UI and API contracts.
- Do not rewrite large components or architecture unless the task requires it.
- Keep \`.ai/state/task-state.md\` aligned with the active task when scope
  changes.
- ACE supports autonomous phase transitions through \`.ai/state/task-state.md\`.
  When you complete the current objective, directly edit \`Current Phase\` and
  \`Next Autonomous Action\`, then proceed to that next action without asking
  the human for permission. Ask only when blocked, when a highly sensitive
  architecture decision is required, or when required validation cannot be run
  or interpreted safely. If blocked, set \`Status: blocked\` and
  \`Next Autonomous Action: Needs Human: <specific request>\`.
- When \`Current Phase\` is \`Review\`, act as a strict reviewer. Run
  \`pnpm ace hub review\` (or \`npm run ace -- hub review\`) and compare the
  original intent, acceptance criteria, project conventions, and triggered risk
  rules against the git diff. If review fails, set \`Current Phase:
  Implementation\` and update \`Next Autonomous Action\` with the exact fixes.
  If review passes, run the project-owned \`ace:validate\` gate and then
  \`pnpm ace finish\`.
- Keep project-specific tier and risk rules in
  \`.ai/config/memory-config.json\`, the canonical ACE config, not inside the
  scripts, so the toolset remains portable.
- Use \`pnpm ace onboard\` to generate
  \`.ai/config/project-profile.md\` and recommended project-specific risk rules
  when ACE is installed into an unfamiliar repo.
- When updating task state, work-log, reflection-log, or decisions, use
  timestamps in \`YYYY-MM-DD HH:mm\` format.
- Keep \`.ai/state/task-state.md\` and \`.ai/knowledge/reflection-log.md\`
  compact.
- Archive only \`.ai/knowledge/work-log.md\`,
  \`.ai/knowledge/reflection-log.md\`, and \`.ai/knowledge/decisions.md\` into
  \`.ai/archive/\` when they grow past the documented thresholds.
- Use \`.ai/state/task-state.md\` lifecycle fields for task/version
  transitions.
  When a large task version is complete, mark its completion checklist and let
  \`pnpm ace finish\` archive a final snapshot.

After completing a task:

Do the smallest closeout that preserves future agent context and project
safety:

1. Always summarize what changed, update changed files, record verification,
   run project-owned \`pnpm ace:validate\`, and state publish/deploy decision when relevant.
   If release is deferred, say so explicitly.
2. For small low-risk tasks, \`pnpm ace finish\` auto-closes compact
   task-state, work-log, and brief report notes without manual ceremony.
3. For standard or large tasks, add product, architecture, security, and
   code-quality review notes.
4. For large or high-risk tasks, confirm the design approach, add reflection
   only when useful, and let \`pnpm ace finish\` archive the snapshot.
5. Update \`.ai/tech-docs.md\`, \`.ai/product-roadmap.md\`, durable decisions,
   or release notes only when those facts actually changed.
6. For release-bound shipped changes, run the project's local smoke and
   dogfood/self-check routines before final publish or deploy when available.
<!-- agent-memory-workflow:end -->
`

export const AI_FILE_SPECS = [
  {
    path: '.ai/config/memory-config.json',
    requiredSnippets: [
      '"_name": "ACE (Agentic Context Engine) Configuration"',
      '"version": 1',
      '"thresholds"',
      '"highRiskPaths"',
    ],
    template: memoryConfigTemplate,
  },
  {
    path: '.ai/state/task-state.md',
    requiredSnippets: [
      '# Task State',
      '## Lifecycle & Meta',
      '## Business Value & Approach',
      '## Changed Files / Diff',
      '## Handoff & Next Steps',
      'Task Tier:',
      'Design Review Required:',
      '### Goal',
      '### Business Value / Product Alignment',
      '### Technical Approach',
      '### Acceptance Criteria',
      '### Completion Checklist',
      '### Quality Review',
      '### Next Steps',
    ],
    template: taskStateTemplate,
  },
  {
    path: '.ai/knowledge/decisions.md',
    requiredSnippets: ['# Decisions', 'Decision:', 'Impact:'],
    template: decisionsTemplate,
  },
  {
    path: '.ai/knowledge/product-roadmap.md',
    requiredSnippets: [
      '# Product Roadmap',
      '## Business Goals',
      '## Completed Epics',
      '## Planned Features',
    ],
    template: productRoadmapTemplate,
  },
  {
    path: '.ai/knowledge/tech-docs.md',
    requiredSnippets: [
      '# Technical Docs',
      '## Architecture',
      '## Data Model / DB Schema',
      '## Auth, RBAC, and Security',
      '## External APIs and Integrations',
    ],
    template: techDocsTemplate,
  },
  {
    path: '.ai/knowledge/work-log.md',
    requiredSnippets: ['# Work Log'],
    template: workLogTemplate,
  },
  {
    path: '.ai/knowledge/reflection-log.md',
    requiredSnippets: ['# Reflection Log', '## Unresolved', '## Resolved'],
    template: reflectionLogTemplate,
  },
  {
    path: '.ai/archive/.gitkeep',
    requiredSnippets: [],
    template: '',
  },
  {
    path: '.ai/archive/tasks/.gitkeep',
    requiredSnippets: [],
    template: '',
  },
]
