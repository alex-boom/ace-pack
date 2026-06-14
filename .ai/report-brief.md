# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 13:42
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 13:42
- Source session-handoff: 2026-06-14 13:40
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (19 changed files)
- Last commit: f382abb Implement v0.6.0 Product Growth Kit, enhancing ACE's onboarding experience with a 60-second demo section in README and GitHub-only demo materials. Bump package version to 0.6.0, add demo script, launch copy, and context-loss fixture while ensuring `docs/**` and `examples/**` are excluded from the npm payload. Strengthen tests to verify demo links and payload boundaries.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v1.0.0 Stable Schema and Compatibility

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 13:31
Ready For Archive: yes

## Goal
Promote ACE to a stable v1.0 contract by documenting file/schema expectations,
CLI compatibility rules, and migration policy while adding regression tests for
older installed repositories.

## Business Value
v1.0 gives teams confidence that adopting ACE will not silently rewrite their
local memory, break existing commands, or make future template changes
unpredictable.

## Current Status
- [x] Confirmed `ace-pack@0.6.0` is published on npm.
- [x] Confirmed working tree was clean before v1.0 work.
- [x] Bumped package version to `1.0.0`.
- [x] Added stable schema and compatibility documentation.
- [x] Updated README/npm README with v1.0 stability links.
- [x] Added backward-compatibility regression tests.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v1.0.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `1.0.0`.

## Risks / Blockers
- None known for v1.0.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0 as large.
- `npm.cmd test` passed: 12 files, 92 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.0`.

## Recent Decision
## 2026-06-14 13:37

Decision:
- Promote ACE to v1.0 by documenting and testing the existing compatibility
  contract instead of adding a migration engine before a real schema migration
  exists.

Reason:
- ACE's current stability comes from additive install behavior, project-owned
  Markdown memory, stable command names, and schema version `1`. A migration
  platform would add code and ceremony without a concrete schema change to
  execute.

Impact:
- `docs/schema-compatibility.md` defines stable commands, file expectations,
  Markdown sections, memory-config v1 behavior, and future migration policy.
- Regression tests protect installed-repo compatibility and legacy aliases.
- Future schema v2 work must document the reason, add deterministic migration
  behavior, and include old-repo fixture tests.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `docs/schema-compatibility.md`
- `README.md`
- `README.npm.md`
- `tests/schema-compatibility.test.ts`
- `ROADMAP.md`

## Overall Progress
- Completion checklist: 8/8
- Source of truth: `.ai/*` files remain authoritative.
