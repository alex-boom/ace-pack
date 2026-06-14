# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 12:54
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 12:51
- Source session-handoff: 2026-06-14 12:52
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (21 changed files)
- Last commit: dc42c81 Bump package version to 0.4.1 and enhance `ace:gate` with explicit `--human-override <reason>` support for low-risk changes. Relax quality-review enforcement for standard tasks while maintaining strict checks for large or high-risk changes. Update documentation to reflect new override functionality and improve clarity on CLI usage.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v0.5.0 Read-Only MCP Adapter

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 12:30
Ready For Archive: yes

## Goal
Expose ACE memory to MCP-capable tools through a read-only stdio adapter while
keeping the core ACE package zero-dependency and Markdown-first.

## Business Value
v0.5 lets tools such as Claude Desktop, Cursor, and other MCP clients inspect
ACE project memory without manual file copying. This improves context loading
while preserving ACE's local-first and no-hidden-AI-calls promise.

## Current Status
- [x] Confirmed `ace-pack@0.4.1` is published on npm.
- [x] Confirmed working tree only had repo-local generated context drift before
  v0.5 work.
- [x] Checked current MCP 2025-06-18 spec for resources, lifecycle, and stdio
  transport behavior.
- [x] Bumped package version to `0.5.0`.
- [x] Added read-only stdio MCP resource server.
- [x] Added the MCP script to installed managed scripts.
- [x] Updated README/README.npm docs and tests.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.5.0 live.
- After publish, run `npm.cmd view ace-pack version`.
- Apply published ACE to this repo only as an explicit dogfood sync.
- Next planning target after v0.5.0: v0.6 Product Growth Kit.

## Risks / Blockers
- None known for v0.5.0.

## Verification
- `npm.cmd test` passed: 10 files, 83 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the current work as large.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.

## Recent Decision
## 2026-06-14 12:56

Decision:
- Implement v0.5 MCP support as a read-only stdio resource adapter using Node
  built-ins, without adding an MCP SDK, tools, writes, network listeners, or an
  npm wrapper script.

Reason:
- MCP is useful for letting tools inspect ACE memory, but the core product
  promise is still zero-dependency, local-first, Markdown-first behavior.
  Running through `npm run` can also print lifecycle text to stdout and break
  stdio JSON-RPC framing.

Impact:
- Consumers can configure MCP clients to run
  `node ./scripts/ace-mcp-server.mjs` directly in their repository.
- The adapter exposes selected `.ai/*` Markdown files as resources only.
- Future MCP expansion should preserve the resource-only boundary unless a
  separate optional package is deliberately introduced.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `scripts/ace-mcp-server.mjs`
- `install-ace-pack.mjs`
- `tests/ace-mcp-server.test.ts`
- `tests/install-agent-memory-pack.test.ts`
- `README.md`

## Overall Progress
- Completion checklist: 8/8
- Source of truth: `.ai/*` files remain authoritative.
