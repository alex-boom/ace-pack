# Current Task

## Feature Name
ACE 0.1.7 New-Chat Start Snapshot

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 01:07
Ready For Archive: yes

## Goal
Ship a patch release that makes `.ai/report-brief.md` the primary startup
artifact for a brand-new AI chat by showing repo state, task state, next
terminal command, and release decision through deterministic local parsing.

## Business Value / Product Alignment
New AI sessions should recover project state quickly without relying on chat
history. The change strengthens ACE's local-first AgentOps promise while
preserving the zero-network, zero-hidden-AI constraints.

## Technical Approach
Option 1:
- Add the snapshot only to `.ai/report-brief.md`. This is the smallest change,
  but it leaves full reports and `ace:hub` less useful for new-agent handoff.

Option 2:
- Add a shared local snapshot helper used by brief and full reports, improve
  stack fallback, and include the brief first in `ace:hub` coder context.

Chosen Approach:
- Use Option 2. It keeps parsing deterministic, avoids network or AI calls, and
  improves every startup path without changing CLI names or adding config.

## Current Status
- [x] Plan approved for v0.1.7.
- [x] Task classified as large because shipped scripts are changing.
- [x] Implement report snapshot helpers.
- [x] Update brief/full report output.
- [x] Update `ace:hub` coder payload.
- [x] Add tests and verify release dry run.

## Affected Areas
- `package.json`
- `scripts/ai-memory-utils.mjs`
- `scripts/ai-report-brief.mjs`
- `scripts/ai-report.mjs`
- `scripts/ace-hub.mjs`
- `tests/**`
- `.ai/**` closeout notes

## Constraints
- Do not add network calls, AI calls, new config files, or required schema
  fields.
- Parse next command only from the first backtick-delimited value in the
  `## Next Steps` section.
- Use `git status --porcelain` for changed-file counting.
- Make git failures degrade to `unknown` values instead of failing reports.
- Keep `NPM publish:` extraction case-insensitive and tolerant of spacing.

## Acceptance Criteria
- `package.json` version is `0.1.7`.
- Brief and full reports include `## Start Snapshot`.
- Snapshot includes branch, worktree state, capped changed count, last commit,
  lifecycle state, next command, and release decision.
- Missing `## Next Steps` or missing backticked command prints
  `No command detected`.
- `ace:hub` option 1 includes `.ai/report-brief.md` first.
- Tests cover the parser, snapshot, stack fallback, and hub payload behavior.
- `npm.cmd test`, `npm.cmd run ace:check`, `npm.cmd run check:npm-payload`,
  and `npm.cmd run release:npm:dry` pass.

## Completion Checklist
- [x] Goal completed
- [x] Acceptance criteria met
- [x] Tests/checks passed
- [x] `.ai/session-handoff.md` updated
- [x] `.ai/changed-files.md` updated
- [x] `.ai/work-log.md` updated
- [x] `npm.cmd run ace:check` passed
- [x] `.ai/reflection-log.md` updated if the task exposed friction or repeated mistakes
- [x] `.ai/decisions.md` updated if needed
- [x] `.ai/tech-docs.md` updated if architecture or technical state changed
- [x] `.ai/product-roadmap.md` updated if business or roadmap state changed
- [x] Final snapshot archived to `.ai/archive/tasks/` for large tasks
- [x] NPM publish decision recorded in handoff/final response
