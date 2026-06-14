import { NEUTRAL_MEMORY_CONFIG } from './ace-project-presets.mjs'
import { productRoadmapTemplate, techDocsTemplate } from './ace-universal-doc-templates.mjs'

export const AGENTS_WORKFLOW_HEADER = '## ACE (Agentic Context Engine) Workflow'
export const AGENTS_WORKFLOW_MARKER = '<!-- agent-memory-workflow:start -->'
export const AGENTS_WORKFLOW_END_MARKER = '<!-- agent-memory-workflow:end -->'
export const CLAUDE_REQUIRED_SNIPPETS = ['AGENTS.md', '.ai/current-task.md']

export const memoryConfigTemplate = JSON.stringify(NEUTRAL_MEMORY_CONFIG, null, 2)

export const currentTaskTemplate = `# Current Task

## Feature Name
[Set the active feature or task name]

## Lifecycle
Status: active
Version: v1
Task Tier: standard
Design Review Required: no
Started: [YYYY-MM-DD HH:mm]
Ready For Archive: no

## Goal
[Describe what is being built or changed]

## Business Value / Product Alignment
[Explain in 1-2 sentences why this matters to users or the business]

## Technical Approach
Option 1:
- [Describe one viable approach and tradeoffs]

Option 2:
- [Describe another viable approach and tradeoffs]

Chosen Approach:
- [Explain why the selected approach best fits security, flexibility, architecture, and business value]

## Current Status
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Affected Areas
- [List the apps, packages, or files in scope]

## Constraints
- [List must-not-break rules or important boundaries]

## Acceptance Criteria
- [Describe the expected final behavior]

## Completion Checklist
- [ ] Goal completed
- [ ] Always: summarize what changed in \`.ai/session-handoff.md\`
- [ ] Always: update \`.ai/changed-files.md\`, record verification, and run \`ace:validate\`
- [ ] Always: state publish/deploy decision when relevant
- [ ] If standard/large: add product, architecture, security, and code-quality review notes
- [ ] If large/high-risk: confirm design approach, add useful reflection, and let \`ace:finish\` archive the snapshot
- [ ] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [ ] \`ace:finish\` passed and generated reports
`

export const handoffTemplate = `# Session Handoff

## Last Update
[YYYY-MM-DD HH:mm]

## What Was Done
- [Summarize the latest completed work]

## Current State
- [Describe the current project or feature state]

## Quality Review
Product Alignment:
- [Confirm the work still serves the stated business value]

Architecture:
- [Note the pattern used and why it fits the repo]

Security:
- [Note relevant auth, RBAC, tenancy, token, or data exposure risks]

Code Quality:
- [Note file size, duplication, strict typing, and test coverage risks]

## Next Steps
- [List the next concrete steps]

## Known Issues
- [List known gaps, risks, or blockers]

## Verification
- [List checks that passed or could not be run]

## Notes
- [Add publish/deploy decision when relevant and any extra context another agent will need]
`

export const decisionsTemplate = `# Decisions

## [YYYY-MM-DD HH:mm]

Decision:
- [Document the durable decision]

Reason:
- [Explain why it was made]

Impact:
- [Explain what this changes]
`

export const changedFilesTemplate = `# Changed Files

[path/to/file]
- [Short reason for the change]
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

1. \`.ai/report-brief.md\` if available for compact context.
2. \`.ai/current-task.md\`
3. \`.ai/session-handoff.md\`
4. \`.ai/decisions.md\`
5. \`.ai/changed-files.md\`
6. Recent unresolved entries in \`.ai/reflection-log.md\`

Read \`.ai/work-log.md\` only when you need additional history for the current
task.

## Working Rules

- Prefer minimal diffs over rewrites.
- Preserve existing TypeScript, UI, and API contracts unless the task says
  otherwise.
- Use \`pnpm ace:classify\` to select the adaptive task tier.
- Run \`pnpm ace:onboard\` after fresh installation in an unfamiliar project
  before trusting project-specific risk rules.
- On Windows PowerShell, use \`pnpm.cmd ace:classify\`,
  \`pnpm.cmd ace:validate\`, and similar commands if script execution policy
  blocks the \`pnpm\` shim.
- For large or high-risk standard tasks, complete \`.ai/current-task.md\`
  Business Value and Technical Approach before writing code.
- Treat \`.ai/*\` as the current source of task context and handoff state.
- Use \`YYYY-MM-DD HH:mm\` timestamps in \`.ai/session-handoff.md\`,
  \`.ai/work-log.md\`, \`.ai/reflection-log.md\`, and \`.ai/decisions.md\`.

## End-of-Task Routine

Do the smallest closeout that preserves future agent context and project
safety:

1. Always summarize what changed, update changed files, record verification,
   run \`pnpm ace:validate\`, and state publish/deploy decision when relevant.
2. For standard or large tasks, add product, architecture, security, and
   code-quality review notes.
3. For large or high-risk tasks, confirm the design approach, add reflection
   only when useful, and let \`pnpm ace:finish\` archive the snapshot.
4. Update tech docs, product roadmap, durable decisions, or release notes only
   when those facts actually changed.
`

export const agentsWorkflowSection = `<!-- agent-memory-workflow:start -->
## ACE (Agentic Context Engine) Workflow

ACE is the local automation framework for managing AI context, code quality,
and decision history. Use this workflow on top of the repo rules above;
\`AGENTS.md\` remains the authoritative source for stack, architecture, and
quality constraints.

Before starting work:

1. Read \`AGENTS.md\` first.
2. If available, read \`.ai/report-brief.md\` first for a compact summary,
   including recent unresolved reflections.
3. Treat \`.ai/*\` as authoritative and read \`.ai/current-task.md\`,
   \`.ai/session-handoff.md\`, \`.ai/decisions.md\`, and
   \`.ai/changed-files.md\` when you need detail or verification.
4. Run \`pnpm ace:classify\` before implementation to identify whether the
   task is small, standard, or large.
5. If this is a newly installed or unknown project and \`.ai/memory-config.json\`
   is still marked \`unprofiled\`, run \`pnpm ace:onboard\` and apply an
   approved profile before implementation.
6. For large tasks, and standard tasks with high-risk signals, complete the
   \`.ai/current-task.md\` Business Value and Technical Approach sections before
   writing code. Compare at least two viable patterns and choose explicitly.
7. Read \`.ai/work-log.md\` only when you need extra historical context.
8. If the memory files are missing, run \`pnpm ace:init\`.

Command note: examples use \`pnpm\`. On Windows PowerShell, use
\`pnpm.cmd ace:classify\`, \`pnpm.cmd ace:validate\`, and similar commands if
the \`pnpm\` shim is blocked by execution policy.

Legacy commands such as \`pnpm ai:task:classify\`, \`pnpm ai:task:finish\`,
and \`pnpm agent-memory:init\` remain supported for compatibility.

While working:

- Prefer minimal, safe diffs that preserve existing UI and API contracts.
- Do not rewrite large components or architecture unless the task requires it.
- Keep \`.ai/current-task.md\` aligned with the active task when scope changes.
- Keep project-specific tier and risk rules in \`.ai/memory-config.json\`, the
  canonical ACE config, not inside the scripts, so the toolset remains
  portable.
- Use \`pnpm ace:onboard\` to generate \`.ai/project-profile.md\` and
  recommended project-specific risk rules when ACE is installed into an
  unfamiliar repo.
- When updating \`.ai/session-handoff.md\`, \`.ai/work-log.md\`,
  \`.ai/reflection-log.md\`, or \`.ai/decisions.md\`, use timestamps in
  \`YYYY-MM-DD HH:mm\` format.
- Keep \`.ai/current-task.md\`, \`.ai/session-handoff.md\`,
  \`.ai/reflection-log.md\`, and \`.ai/changed-files.md\` compact.
- Archive only \`.ai/work-log.md\`, \`.ai/reflection-log.md\`, and
  \`.ai/decisions.md\` into \`.ai/archive/\` when they grow past the documented
  thresholds.
- Use \`.ai/current-task.md\` lifecycle fields for task/version transitions.
  When a large task version is complete, mark its completion checklist and let
  \`pnpm ace:finish\` archive a final snapshot.

After completing a task:

Do the smallest closeout that preserves future agent context and project
safety:

1. Always summarize what changed, update changed files, record verification,
   run \`pnpm ace:validate\`, and state publish/deploy decision when relevant.
2. For standard or large tasks, add product, architecture, security, and
   code-quality review notes.
3. For large or high-risk tasks, confirm the design approach, add reflection
   only when useful, and let \`pnpm ace:finish\` archive the snapshot.
4. Update \`.ai/tech-docs.md\`, \`.ai/product-roadmap.md\`, durable decisions,
   or release notes only when those facts actually changed.
<!-- agent-memory-workflow:end -->
`

export const AI_FILE_SPECS = [
  {
    path: '.ai/memory-config.json',
    requiredSnippets: [
      '"_name": "ACE (Agentic Context Engine) Configuration"',
      '"version": 1',
      '"thresholds"',
      '"highRiskPaths"',
    ],
    template: memoryConfigTemplate,
  },
  {
    path: '.ai/current-task.md',
    requiredSnippets: [
      '# Current Task',
      '## Lifecycle',
      'Task Tier:',
      'Design Review Required:',
      '## Goal',
      '## Business Value / Product Alignment',
      '## Technical Approach',
      '## Acceptance Criteria',
      '## Completion Checklist',
    ],
    template: currentTaskTemplate,
  },
  {
    path: '.ai/session-handoff.md',
    requiredSnippets: [
      '# Session Handoff',
      '## What Was Done',
      '## Quality Review',
      '## Next Steps',
    ],
    template: handoffTemplate,
  },
  {
    path: '.ai/decisions.md',
    requiredSnippets: ['# Decisions', 'Decision:', 'Impact:'],
    template: decisionsTemplate,
  },
  {
    path: '.ai/product-roadmap.md',
    requiredSnippets: [
      '# Product Roadmap',
      '## Business Goals',
      '## Completed Epics',
      '## Planned Features',
    ],
    template: productRoadmapTemplate,
  },
  {
    path: '.ai/tech-docs.md',
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
    path: '.ai/changed-files.md',
    requiredSnippets: ['# Changed Files'],
    template: changedFilesTemplate,
  },
  {
    path: '.ai/work-log.md',
    requiredSnippets: ['# Work Log'],
    template: workLogTemplate,
  },
  {
    path: '.ai/reflection-log.md',
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
