# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 16:42
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 16:42
- Source session-handoff: 2026-06-14 16:42
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (37 changed files)
- Last commit: ed45f5b Update documentation to reflect changes in ACE memory paths and command usage. Replace references to legacy `.ai/report-brief.md` with the new `.ai/generated/report-brief.md` format across various files, ensuring consistency in the workflow instructions. Adjust command formats in the IDE bridge scripts to align with the new command structure. Remove outdated `.ai/changed-files.md`, `.ai/current-task.md`, `.ai/decisions.md`, and memory configuration files as part of the transition to the new memory schema.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.0.1 Single ACE Router Cleanup

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 16:26
Ready For Archive: yes

## Goal
Clean the shipped ACE command surface so installed repositories expose only the
single `ace` router plus a project-owned `ace:validate` mechanical gate.

## Business Value
This protects consumer repositories from script bloat and keeps ACE aligned
with its zero-bloat DevEx promise. The `ace:validate` correction preserves the
project-owned quality-gate concept instead of replacing real code checks with
ACE Markdown validation.

## Current Status
- Implemented the single-router cleanup for `ace-pack@2.0.1`.
- Consumer installs now expose only `ace` plus a project-owned `ace:validate`
  placeholder when missing.
- Legacy command names route through `ace` arguments instead of package scripts.
- Verification passed for tests, router check, fake-project smoke, payload
  guard, dogfood self-check, and the project-owned mechanical gate.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.0.1`.

## Risks / Blockers
- None known for the v2.0.1 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
because the working tree was clean, but the product scope was treated as
large.
- `npm.cmd test` passed: 14 files, 110 tests.
- `pnpm.cmd ace check` passed.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.

## Recent Decision
## 2026-06-14 16:26

Decision:
- Tighten the ACE command surface to a single installed `ace` router plus a
  project-owned `ace:validate` mechanical gate.

Reason:
- Injecting many `ace:*`, `ai:*`, and `agent-memory:*` scripts into consumer
  repositories makes ACE look intrusive. `ace:validate` must remain a project
  code-quality gate rather than an alias for ACE memory validation.

Impact:
- Fresh installs expose only `ace` and `ace:validate` in package scripts.
- `ace check` runs ACE memory validation.
- Legacy command names remain available only as router arguments such as
  `pnpm ace ai:task:finish`.
- Installer upgrades prune only old ACE-managed default aliases and preserve
  custom user scripts.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `scripts/*`
- `README.md, README.npm.md, docs/**`
- `AGENTS.md, CLAUDE.md, scripts/agent-memory-templates.mjs`

## Overall Progress
- Completion checklist: 9/9
- Source of truth: `.ai/*` files remain authoritative.
