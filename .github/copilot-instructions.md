# ACE IDE Agent Instructions

Follow AGENTS.md as the authoritative repository instruction file.

For new work:
- Read .ai/report-brief.md first when it exists.
- Generate startup context with pnpm ace:hub start.
- Classify the task with pnpm ace:classify before implementation.
- Validate ACE memory with pnpm ace:check when context may be stale.
- Close the task with pnpm ace:finish before handoff.

Do not replace AGENTS.md or .ai/* workflow rules with IDE-specific policy. This
file is only a thin bridge from the IDE agent to ACE.
