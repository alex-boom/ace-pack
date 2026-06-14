# AI Full Report

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

## Architecture Rules


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

## Technical Approach
Option 1:
- Use an official MCP SDK. This reduces protocol code, but adds dependencies
  and risks pulling SDK bloat into the core ACE package.

Option 2:
- Implement a small stdio JSON-RPC resource server with Node built-ins only.
  It supports MCP initialization plus read-only `resources/list` and
  `resources/read` for selected ACE Markdown files.

Chosen Approach:
- Use Option 2. The adapter remains inspectable, local, and zero-dependency.
  It exposes resources only, no tools, no writes, no network service, and no AI
  provider calls.

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

## What Was Done
- Confirmed `ace-pack@0.4.1` is published on npm and started the next planned
  release: v0.5 Read-Only MCP Adapter.
- Bumped local package version to `0.5.0`.
- Added `scripts/ace-mcp-server.mjs`, a zero-dependency stdio JSON-RPC MCP
  resource server.
- Exposed existing ACE Markdown memory as read-only MCP resources:
  `.ai/report-brief.md`, `.ai/current-task.md`, `.ai/session-handoff.md`,
  `.ai/decisions.md`, `.ai/product-roadmap.md`, `.ai/tech-docs.md`, and
  `.ai/generated-context.md`.
- Added the MCP script to the installer-managed script list so fresh ACE
  installs receive it.
- Updated README/README.npm with MCP client configuration guidance and the
  direct `node ./scripts/ace-mcp-server.mjs` stdio rule.
- Added MCP tests for resource listing/reading, initialize capabilities,
  JSON-RPC stdio framing, errors, and install coverage.

## Current State
- npm latest is `ace-pack@0.4.1`.
- Local candidate is `ace-pack@0.5.0`.
- v0.5.0 is implemented locally and passed release-readiness verification.
- MCP is intentionally not exposed through an npm script because stdio MCP
  stdout must contain only JSON-RPC messages.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.5.0 live.
- After publish, run `npm.cmd view ace-pack version`.
- Apply published ACE to this repo only as an explicit dogfood sync.
- Next planning target after v0.5.0: v0.6 Product Growth Kit.

## Known Issues
- None known for v0.5.0.

## Quality Review
Product Alignment:
- v0.5 improves context loading for MCP-capable tools without turning ACE into
  an AI agent, SaaS service, or editor-specific integration.

Architecture:
- The adapter is an isolated script using Node built-ins and existing Markdown
  files. It exposes MCP resources only, with no tools, writes, background
  service, network listener, schema change, or dependency on an MCP SDK.

Security:
- The server is read-only and local. It performs no AI calls, no hidden network
  calls, and no repository writes. Missing files are simply omitted from
  `resources/list` and unavailable resources return JSON-RPC errors.

Code Quality:
- Tests cover the protocol surface added in v0.5 and verify installed repos
  receive `scripts/ace-mcp-server.mjs`.

## Verification
- `npm.cmd test` passed: 10 files, 83 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the current work as large.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.5.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
created or updated installed files.

## Recent Decisions
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

## Changed Areas
- `package.json`
- `scripts/ace-mcp-server.mjs`
- `install-ace-pack.mjs`
- `tests/ace-mcp-server.test.ts`
- `tests/install-agent-memory-pack.test.ts`
- `README.md`
- `README.npm.md`
- `.ai/**`

## Latest Work Log
# Work Log

## 2026-06-13 20:59

- Initialized ACE in the repository using the local installer with `--apply`.
- Confirmed generated memory files and root agent instruction files were created.
- Verified `npm run ace:check`, `npm run ace:classify`, and Vitest on an active
  Node version that satisfies `>=20`.
- Fixed and covered report decision extraction after ACE setup exposed the issue.
- Added project-specific command notes so future agents use `npm run ace:*`
  when `pnpm` is unavailable.
- Made XML report generation non-blocking when `pnpm.cmd` is unavailable.

## 2026-06-13 21:19

- Added first-block meta-architecture warnings to local agent instruction files.
- Documented ACE product files vs repo-local dogfooding files for fork maintainers.
- Added npm payload guard to prevent `.ai/**`, `AGENTS.md`, `CLAUDE.md`, and
  other repo-local files from entering the package tarball.
- Recorded semver policy for shipped package changes vs repo-local dogfooding changes.
- Corrected report decision extraction so brief/full reports surface the newest
  durable decision, including the versioning policy.

## 2026-06-13 21:35

- Replaced generic npm keywords with targeted AgentOps, context-management,
  guardrails, cursor-rules, and AI-coding terms.
- Bumped package metadata version from `0.1.3` to `0.1.4` for this publishable
  metadata release.

## 2026-06-13 21:42

- Removed local Node executable/version hardcoding from repo-local ACE
  instructions and memory.
- Kept the public package requirement as generic `node >=20`, so maintainers can
  switch with nvm and use any compatible Node version.

## 2026-06-13 22:25

- Fixed `tools/check-npm-payload.mjs` so Windows/Git Bash release checks no
  longer fail with `spawn EINVAL` when npm dry-run inspection is executed.
- Added `publish:npm:dry` and made `release:npm:dry` run payload guard,
  pack dry-run, and publish dry-run.
- Switched repo development/link commands and local helper scripts to npm/npm.cmd.
- Added VS Code tasks that explicitly call `npm.cmd` for clean Windows task runs.
- Verified `npm.cmd run release:npm:dry`, `npm.cmd run publish:npm:dry`,
  `.local/publish-npm.cmd`, Git Bash `pnpm run release:npm:dry`, `npm.cmd run test`,
  and `npm.cmd run ace:check`.

## 2026-06-13 22:28

- Added `vibe-coding` to npm keywords and bumped package version to `0.1.5`.
- Added subtle vibe coding positioning to both GitHub and npm README surfaces.
- Kept the change metadata/docs-only with no CLI, template, or runtime behavior changes.
- Verified JSON metadata, npm payload guard, full dry npm release, staged npm
  README content, Vitest, and ACE memory check.

## 2026-06-13 23:05

- Added GitHub-only `ROADMAP.md` with ACE vision, product promise, anti-goals,
  release roadmap, v2.0+ research seeds, and explicit AI opt-in policy.
- Updated `DEVELOPING.md`, `AGENTS.md`, README, and `.ai/product-roadmap.md`
  to align future product work with zero-bloat and privacy-safe defaults.
- Added `ROADMAP.md` to the npm payload guard's forbidden paths so strategy docs
  stay out of the package tarball.
- Added a required task handoff rule: future agents must explicitly report
  whether npm publish is required, using staged npm payload impact as the
  decision boundary.

## 2026-06-14 00:29

- Refreshed package metadata and README positioning around zero-dependency
  local AgentOps for AI coding agents.
- Bumped package version to `0.1.6` because `package.json` and
  `README.npm.md` are shipped npm payload files.
- Added Cursor, Claude Code, Aider, GitHub Copilot, and ChatGPT discovery
  keywords while keeping product behavior unchanged.
- Verified `ace:check`, npm payload guard, npm pack preview, and npm publish
  dry-run.

## 2026-06-14 01:15

- Bumped package version to `0.1.7` for shipped report and hub improvements.
- Added `## Start Snapshot` to brief/full reports with local git state, task
  lifecycle, first-backtick next command, release decision, and stack fallback.
- Updated `ace:hub` option 1 so new AI coder context starts with
  `.ai/report-brief.md` when available and still works before first report
  generation.
- Verified Vitest, ACE memory check, npm payload guard, and full npm release
  dry-run for `ace-pack@0.1.7`.

## 2026-06-14 01:26

- Added template-only closeout priority ladder guidance to installed AGENTS,
  CLAUDE, current-task, and handoff templates.
- Kept `ace:finish` logic unchanged so the improvement remains guidance, not a
  new validation burden.
- Confirmed npm latest is still `0.1.6`, so the change remains part of the
  pending `0.1.7` release.
- Verified Vitest after the template test updates.

## 2026-06-14 10:46

- Confirmed `ace-pack@0.1.7` is published on npm.
- Updated repo-local ACE handoff/current-task state so future sessions do not
  keep recommending another `0.1.7` publish.

## 2026-06-14 10:59

- Implemented v0.2 onboarding scanner expansion and bumped package version to
  `0.2.0`.
- Added richer JS/TS, Python, Go, Rust, and generic monorepo detection while
  keeping rules conservative and dependency-free.
- Added `## Why Detected` project-profile output plus concise CLI summary lines
  for the first-run “aha” moment.
- Verified Vitest, ACE memory check, npm payload guard, and full npm release
  dry-run for `ace-pack@0.2.0`.

## 2026-06-14 11:13

- Implemented v0.3 ACE Hub Primary UX and bumped package version to `0.3.0`.
- Added named hub modes, direct mode selection, stdout/custom-output/JSON
  output controls, metadata headers, and PR git summary context.
- Kept numeric options compatible and avoided new dependencies, schemas,
  clipboard automation, MCP, CI gates, network calls, or AI calls.
- Verified Vitest, ACE memory check, npm payload guard, and full npm release
  dry-run for `ace-pack@0.3.0`.

## 2026-06-14 11:20

- Confirmed `ace-pack@0.3.0` is published on npm and the v0.3 release commit is
  in git.
- Updated repo-local ACE handoff/current-task state so future sessions do not
  keep recommending another `0.3.0` publish.
- Marked the next planning target as v0.4 PR and CI Quality Gates.

## 2026-06-14 11:40

- Implemented v0.4.0 PR and CI Quality Gates and bumped package version to
  `0.4.0`.
- Added `ace:gate` with reusable ACE validation/classification/finish checks,
  actionable CI failures, JSON output, PR refs, opt-in GitHub Actions workflow
  generation, and safe native pre-push hook installation.
- Updated install flow, README surfaces, roadmap, and tests.
- Verified Vitest, ACE memory check, npm payload guard, and full npm release
  dry-run for `ace-pack@0.4.0`.

## 2026-06-14 11:56

- Added local release-readiness smoke for disposable JS and non-JS fake projects.
- Added explicit dogfood self-check that refuses dirty worktrees by default and
  stops on unexpected changed files.
- Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready` npm
  scripts.
- Updated shipped closeout templates and maintainer docs to support deferred
  npm publish wording for batched releases.
- Verified `npm.cmd run release:ready` for the pending `0.4.0` candidate.
- Ran `npm.cmd run dogfood:self-check -- --allow-dirty` as an explicit reviewed
  self-dogfood pass; it reported no created or updated installed files.

## 2026-06-14 12:22

- Confirmed `ace-pack@0.4.0` is published on npm and applied the published
  installer to this repository; the repo was already up to date.
- Started v0.4.1 Gate DevEx Polish and bumped local package version to `0.4.1`.
- Added explicit `ace:gate -- --human-override <reason>` support with CLI/JSON
  metadata.
- Relaxed `ace:gate` Quality Review enforcement for standard low-risk changes
  while preserving strict checks for large or high-risk changes.
- Updated README surfaces and gate tests for the new DevEx behavior.

## 2026-06-14 12:56

- Confirmed `ace-pack@0.4.1` is published on npm before starting v0.5 work.
- Bumped package version to `0.5.0`.
- Added `scripts/ace-mcp-server.mjs` as a zero-dependency, read-only stdio MCP
  resource server for ACE Markdown memory.
- Added the MCP server to installed managed scripts without adding an npm script,
  preserving clean JSON-RPC stdout for MCP clients.
- Updated README surfaces and tests for MCP resource listing, resource reads,
  initialize capabilities, stdio framing, errors, and install coverage.
- Verified `npm.cmd run release:ready` and explicit
  `npm.cmd run dogfood:self-check -- --allow-dirty` for the v0.5.0 candidate.

## Unresolved Reflections
- No unresolved reflections recorded.

## Overall Progress
- Completion checklist: 8/8
- Canonical context lives in `.ai/*`.
- XML bundle generated at `.ai/report-full.xml` for parsable handoff.
