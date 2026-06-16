# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-16 12:38
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-16 12:36
- Source session-handoff: 2026-06-16 12:38
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (28 changed files)
- Last commit: 0cbaa26 Add Project Conventions and Pattern Discovery to ROADMAP.md as a long-term research item. Mirrored the concept in product-roadmap.md, ensuring documentation-only changes with no impact on CLI behavior or package version.
- Task: active (tier: large, version: v1, ready for archive: no)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; blocked by npm permission.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.2.0 Project Conventions Discovery

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-16 12:33
Ready For Archive: no

## Goal
Ship `ace discover` so installed repositories can generate a concise local
Project Conventions and Pattern Registry for AI agents.

## Business Value
This directly addresses architectural drift in established codebases. ACE will
help agents reuse a project's existing UI, routing, logging, error-handling,
database, and package-layout patterns instead of inventing parallel ones.

## Current Status
- [x] Implement `ace discover` scanner and overwrite protection.
- [x] Wire router, install, hub, memory paths, MCP, docs, and version.
- [x] Add focused tests and release-readiness checks.
- [ ] Publish `ace-pack@2.2.0` after npm permissions are available.

## Next Steps
- Fix npm auth/package permissions for ace-pack.
- Run `npm.cmd run release:npm`.
- Verify `npm.cmd view ace-pack version` returns `2.2.0`.

## Risks / Blockers
- None known for the v2.2.0 candidate.

## Verification
- `npm.cmd run ace -- classify` passed before implementation; the clean
worktree detected as `small`, but the shipped command scope is treated as
large.
- Focused Vitest passed: 7 files, 54 tests.
- `npm.cmd run test` passed: 16 files, 123 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS projects.

## Recent Decision
## 2026-06-16 12:33

Decision:
- Implement Project Conventions Discovery as deterministic local `ace discover`
  heuristics instead of AI-provider analysis.

Reason:
- ACE must preserve its local-first, zero-dependency, no-hidden-AI-calls
  promise while still helping agents reuse established repository patterns.
  Simple import/dependency/path signals are less brittle than pseudo-AST regex
  parsing and safer for large private repositories.

Impact:
- `ace discover` writes `.ai/knowledge/project-conventions.md` with a managed
  marker and protects human-written files unless `--force` is passed.
- `ace hub` and the read-only MCP adapter can expose the conventions summary
  when it exists.
- Future AI-assisted convention discovery remains a separate explicit opt-in
  feature, not part of the default v2.2 workflow.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `scripts/ace-discover.mjs`
- `scripts/ace-cli.mjs, scripts/ai-memory-utils.mjs, scripts/ace-hub.mjs, scripts/ace-mcp-server.mjs`
- `scripts/ace-uninstall-utils.mjs, install/tests`
- `README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md`
- `.ai/**`

## Overall Progress
- Completion checklist: 0/9
- Source of truth: `.ai/*` files remain authoritative.
