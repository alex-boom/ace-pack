# Changed Files

[scripts/agent-memory-templates.mjs]
- Replaced the flat default completion checklist with priority-based closeout
  guidance.
- Updated installed AGENTS and CLAUDE workflow text to tell agents to do the
  smallest closeout that preserves future context and project safety.
- Clarified handoff notes for publish/deploy decisions when relevant.

[tests/agent-memory.test.ts]
- Added assertions that generated AGENTS, CLAUDE, and current-task templates
  include the closeout priority ladder language.

[.ai/**]
- Updated current task, session handoff, changed-files, work-log, decisions,
  product roadmap, and reflection notes for the closeout priority ladder task.
