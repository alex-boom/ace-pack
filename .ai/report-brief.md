# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 13:21
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 13:19
- Source session-handoff: 2026-06-14 13:20
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (22 changed files)
- Last commit: b6c1835 Implement v0.5.0 with a read-only MCP adapter that exposes ACE Markdown memory as a zero-dependency stdio JSON-RPC resource server. Update package version to 0.5.0, add `ace-mcp-server.mjs` to managed scripts, and enhance documentation with configuration guidance for MCP clients. Include tests for resource handling and JSON-RPC protocol compliance.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v0.6.0 Product Growth Kit

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 13:07
Ready For Archive: yes

## Goal
Make ACE understandable in 60 seconds through concise demo materials, launch
copy, and a small repository scenario while keeping marketing artifacts out of
runtime behavior.

## Business Value
v0.6 should help new users quickly understand why ACE exists, what problem it
solves for AI coding agents, and how to try the workflow without reading the
full technical documentation first.

## Current Status
- [x] Confirmed `ace-pack@0.5.0` is published on npm.
- [x] Confirmed working tree was clean before v0.6 work.
- [x] Bumped package version to `0.6.0`.
- [x] Added README/npm README demo entry point.
- [x] Added demo script, launch copy, and demo fixture.
- [x] Added tests that protect the growth kit and payload boundary.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.6.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `0.6.0`.

## Risks / Blockers
- None known for v0.6.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v0.6 as large.
- `npm.cmd test` passed: 11 files, 86 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.6.0`.

## Recent Decision
## 2026-06-14 13:17

Decision:
- Implement v0.6 Product Growth Kit as static README, docs, and example
  materials, while explicitly excluding `docs/**` and `examples/**` from the
  npm runtime payload.

Reason:
- ACE needs a clearer first impression and launch material, but product growth
  assets should not add dependencies, commands, installer behavior, or package
  bloat for repositories that only need the scaffold.

Impact:
- README and npm README now point users to a 60-second before/after demo.
- GitHub-only docs contain the demo script and launch copy.
- A tiny context-loss fixture demonstrates auth/session risk for demos.
- Payload guard now rejects accidental `docs/**` or `examples/**` inclusion.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/demo-script.md`
- `docs/launch-copy.md`
- `examples/context-loss-demo/**`

## Overall Progress
- Completion checklist: 8/8
- Source of truth: `.ai/*` files remain authoritative.
