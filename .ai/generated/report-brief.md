# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 16:14
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 16:09
- Source session-handoff: 2026-06-14 16:13
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (47 changed files)
- Last commit: 6a1022a Upgrade to version 2.0.0, introducing a unified command router (`npm run ace -- <command>` / `pnpm ace <command>`) and a new memory schema with categorized paths under `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated`. Legacy paths are preserved for compatibility. Updated documentation and tests to reflect these changes, ensuring a smooth transition for existing repositories.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.0.0 Command Router and Memory Schema v2

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 15:24
Ready For Archive: yes

## Goal
Implement the planned command-surface cleanup, generated artifact hygiene, and
memory schema v2 migration while preserving old ACE commands and old `.ai/*`
paths as compatibility aliases.

## Business Value
This keeps ACE easier to use daily while reducing long-term memory clutter. A
single `ace` router lowers `package.json` script noise, generated reports move
out of the main memory surface, and schema v2 gives future agents clearer
categories without abandoning existing installed repositories.

## Current Status
- Bumped package version to `2.0.0`.
- Added `npm run ace -- <command>` / `pnpm ace <command>` router while preserving existing scripts.
- Added canonical `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` memory layout with legacy read aliases.
- Changed v2 writes to canonical-only defaults so fresh installs keep `.ai/` folder-structured.
- Added `ace migrate -- --prune-legacy` and pruned this repository

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local ACE memory to mark npm latest as `2.0.0`.

## Risks / Blockers
- None known for the v2.0.0 candidate.

## Verification
- `npm.cmd run ace:classify` passed before implementation, but detected `small`
only because the working tree was clean. The requested product scope is being
treated as large.
- `npm.cmd test` passed: 14 files, 108 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the work as large.

## Recent Decision
## 2026-06-14 15:46

Decision:
- Implement v2.0 as a compatibility-first command router and memory layout
  release: add `npm run ace -- <command>` / `pnpm ace <command>`, canonical
  `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` paths, and
  deterministic v1 legacy migration aliases.

Reason:
- The repo had accumulated many package scripts and high-churn root `.ai/*`
  files. A single router and categorized memory layout improve daily UX and
  reduce future context clutter, but existing installed repositories and agent
  habits must keep working.

Impact:
- The package version moves to `2.0.0` because the canonical memory layout
  changes.
- Existing `ace:*`, `ai:*`, and `agent-memory:*` scripts remain valid.
- Legacy `.ai/*.md`, `.ai/report-*`, and `.ai/generated-context.md` paths remain
  readable during migration without cluttering fresh v2 installs.
- Future schema work must use deterministic migration and old-repo fixture tests
  before changing memory contracts again.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `scripts/ace-migrate.mjs`
- `scripts/ai-memory-utils.mjs`
- `scripts/agent-memory-lib.mjs`

## Overall Progress
- Completion checklist: 0/7
- Source of truth: `.ai/*` files remain authoritative.
