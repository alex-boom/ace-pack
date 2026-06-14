# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T09:54:16.614Z
- Included files: .ai/report-brief.md, .ai/current-task.md, .ai/session-handoff.md, .ai/changed-files.md, .ai/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/report-brief.md ---

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

# --- FILE: .ai/current-task.md ---

# Current Task

## Feature Name
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

## Business Value / Product Alignment
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

## Affected Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-mcp-server.mjs`
- `README.md`
- `README.npm.md`
- `tests/**`
- `.ai/**` closeout notes

## Constraints
- No new dependencies, schemas, config files, AI calls, network calls, or hidden
  hook installation.
- MCP adapter must be read-only resources only; no tools and no writes.
- MCP clients should run the script directly with `node`, not through `npm run`,
  because stdio transport requires stdout to contain only JSON-RPC messages.
- Core ACE must remain Markdown-first and zero-runtime-dependency.

## Acceptance Criteria
- The MCP server responds to `initialize` with resource capabilities.
- `resources/list` exposes the selected ACE memory resources that exist.
- `resources/read` returns Markdown text for known ACE resource URIs.
- Unknown resource URIs and unknown methods return JSON-RPC errors.
- The server writes no non-JSON text to stdout in stdio mode.
- Installed repositories receive the MCP script without adding dependencies.

## Completion Checklist
- [x] Goal completed
- [x] Always: summarize what changed in `.ai/session-handoff.md`
- [x] Always: update `.ai/changed-files.md`, record verification, and run `ace:validate`
- [x] Always: state publish/deploy decision when relevant
- [x] If standard/large: add product, architecture, security, and code-quality review notes
- [x] If large/high-risk: confirm design approach, add useful reflection, and let `ace:finish` archive the snapshot
- [x] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [x] `ace:finish` passed and generated reports

# --- FILE: .ai/session-handoff.md ---

# Session Handoff

## Last Update
2026-06-14 12:56

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

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.5.0 live.
- After publish, run `npm.cmd view ace-pack version`.
- Apply published ACE to this repo only as an explicit dogfood sync.
- Next planning target after v0.5.0: v0.6 Product Growth Kit.

## Known Issues
- None known for v0.5.0.

## Verification
- `npm.cmd test` passed: 10 files, 83 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the current work as large.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.5.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/changed-files.md ---

# Changed Files

[package.json]
- Bumped package version to `0.5.0`.

[scripts/ace-mcp-server.mjs]
- Added a zero-dependency stdio JSON-RPC MCP server.
- Exposes existing ACE Markdown memory as read-only MCP resources.
- Supports `initialize`, `ping`, `resources/list`, and `resources/read`.
- Returns JSON-RPC errors for unknown methods, unknown resources, missing
  resources, invalid requests, and parse errors.

[install-ace-pack.mjs]
- Added `ace-mcp-server.mjs` to the managed script files copied into installed
  ACE repositories.

[tests/ace-mcp-server.test.ts]
- Added coverage for resource listing, Markdown resource reads, initialize
  capabilities, JSON-RPC stdio framing, and error responses.

[tests/install-agent-memory-pack.test.ts]
- Added install-flow coverage for `scripts/ace-mcp-server.mjs`.

[README.md]
- Documented the read-only MCP adapter, exposed resources, and direct `node`
  stdio configuration guidance.

[README.npm.md]
- Mirrored npm-facing MCP adapter documentation.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, roadmap,
  technical docs, reflections, and generated reports for v0.5 closeout.

# --- FILE: .ai/reflection-log.md ---

# Reflection Log

Use this file for short, actionable agent-process reflections. Do not log every
minor task; record repeated tool friction, unclear prompts, poor assumptions,
or workflow improvements worth carrying into future sessions.

## Unresolved

### [YYYY-MM-DD HH:mm] [Short issue title]
Status: unresolved
- Stuck Point: [Where the agent got stuck]
- Likely Cause: [Tooling, prompt, missing context, or process issue]
- Proposed Improvement: [Concrete change to try next time]

## Resolved

### 2026-06-14 12:56 MCP stdio must stay dependency-light
Status: resolved
- Stuck Point: Adding MCP support can easily pull SDK dependencies or wrapper
  command output into the core package.
- Likely Cause: MCP examples often use SDKs, while stdio JSON-RPC requires
  stdout framing that npm lifecycle output can corrupt.
- Proposed Improvement: Keep ACE MCP as a direct `node` stdio resource adapter
  with Node built-ins only, and consider a separate optional package only if
  future MCP features truly require dependencies.

### 2026-06-14 12:22 Strict gates can hurt adoption
Status: resolved
- Stuck Point: A quality gate that blocks small human edits may train users to
  bypass or remove ACE entirely.
- Likely Cause: Standard task closeout expectations were being reused directly
  inside PR/CI gate behavior.
- Proposed Improvement: Keep `ace:finish` disciplined, but make `ace:gate`
  stricter only for large or high-risk changes and require an explicit reason
  for human overrides.

### 2026-06-14 11:56 Release readiness needs install-level smoke
Status: resolved
- Stuck Point: Unit tests and dry-run publish can pass while installed ACE
  behavior in a fresh repository or dogfooding sync still has regressions.
- Likely Cause: Packaging and self-apply paths cross repository boundaries that
  source-only tests do not fully exercise.
- Proposed Improvement: Run fake-project smoke from the local staged package and
  use explicit dogfood self-check before final release, never as hidden publish
  automation.

### 2026-06-14 11:40 CI gates need actionable failures
Status: resolved
- Stuck Point: A failing PR gate is only useful if the developer can fix it
  from plain CI logs.
- Likely Cause: Generic gate failures hide which ACE memory section needs
  attention.
- Proposed Improvement: Keep gate failures file-specific and include the exact
  next fix, while reusing existing ACE validation logic.

### 2026-06-14 10:59 First-run onboarding needs terminal feedback
Status: resolved
- Stuck Point: A useful `.ai/project-profile.md` can still hide the onboarding
  “aha” moment if the terminal only says to open another file.
- Likely Cause: Early onboarding output focused on generated artifacts rather
  than the detected project shape.
- Proposed Improvement: Keep the scanner deterministic, but print a concise CLI
  summary of detected ecosystems and project-specific risk rules.

### 2026-06-14 01:26 Flat closeout checklists invite overwork
Status: resolved
- Stuck Point: Agents can treat every ACE closeout instruction as equally
  mandatory and spend effort on docs or ceremony that does not reduce risk.
- Likely Cause: The default completion checklist and end-of-task instructions
  were presented as a flat list instead of a priority ladder.
- Proposed Improvement: Keep closeout guidance template-only and instruct
  agents to do the smallest closeout that preserves future context and safety.

### 2026-06-14 01:15 New chats need an operational start snapshot
Status: resolved
- Stuck Point: A new AI chat had to read several `.ai/*` files and run git
  commands to answer simple "where are we?" questions.
- Likely Cause: The brief report summarized task memory but did not surface
  repo state, next command, or publish decision as a first-class startup block.
- Proposed Improvement: Generate `## Start Snapshot` in brief/full reports and
  put `.ai/report-brief.md` first in AI Coder hub context.

### 2026-06-13 20:59 Persist release process outside chat
Status: resolved
- Stuck Point: npm publishing details and README/logo split can be forgotten in
  a new chat.
- Likely Cause: Release steps were previously only discussed in conversation.
- Proposed Improvement: Keep publish commands discoverable through
  `package.json` scripts and record npm publishing notes in `.ai/session-handoff.md`.
