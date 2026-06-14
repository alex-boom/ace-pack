# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T10:42:37.126Z
- Included files: .ai/report-brief.md, .ai/current-task.md, .ai/session-handoff.md, .ai/changed-files.md, .ai/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/report-brief.md ---

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

# --- FILE: .ai/current-task.md ---

# Current Task

## Feature Name
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

## Business Value / Product Alignment
v1.0 gives teams confidence that adopting ACE will not silently rewrite their
local memory, break existing commands, or make future template changes
unpredictable.

## Technical Approach
Option 1:
- Add a formal migration engine and schema registry now. This creates strong
  machinery, but adds code and process before ACE has a real schema migration
  problem.

Option 2:
- Document the stable v1.0 contract and add focused regression tests around the
  guarantees ACE already has: idempotent install, no `.ai/*` overwrites, stable
  workflow markers, schema version `1`, tolerated unknown config fields, and
  legacy command compatibility.

Chosen Approach:
- Use Option 2. v1.0 should stabilize the existing lightweight contract without
  inventing a migration platform. Future schema v2 work can add a migrator only
  when a real breaking schema change exists.

## Current Status
- [x] Confirmed `ace-pack@0.6.0` is published on npm.
- [x] Confirmed working tree was clean before v1.0 work.
- [x] Bumped package version to `1.0.0`.
- [x] Added stable schema and compatibility documentation.
- [x] Updated README/npm README with v1.0 stability links.
- [x] Added backward-compatibility regression tests.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Affected Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/**`
- `tests/**`
- `.ai/**` closeout notes

## Constraints
- No runtime dependencies, AI calls, network calls, hooks, config schema bump, or
  CLI command removals.
- Do not add a migration engine until there is a real schema migration to run.
- Keep v1.0 docs precise and enforceable; avoid broad promises ACE cannot test.

## Acceptance Criteria
- Stable `.ai/*` file expectations and `.ai/memory-config.json` schema version
  `1` are documented.
- Migration policy explains additive changes, compatibility tests, and future
  schema bump rules.
- README and npm README link users to the v1.0 compatibility contract.
- Tests cover legacy installed repositories, custom memory preservation,
  unknown config fields, legacy commands, and AGENTS marker stability.

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
2026-06-14 13:37

## What Was Done
- Confirmed `ace-pack@0.6.0` is published on npm and the working tree was clean
  before v1.0 work.
- Bumped local package version to `1.0.0`.
- Added `docs/schema-compatibility.md` with the v1.0 stable contract:
  command names, installed files, Markdown section expectations,
  `.ai/memory-config.json` schema version `1`, migration policy, and payload
  boundary.
- Added README and npm README links to the v1.0 stability contract.
- Added schema compatibility tests for project-owned memory preservation,
  AGENTS marker stability, memory-config v1 normalization, legacy command
  aliases, docs links, and fresh install validation.

## Current State
- npm latest is `ace-pack@0.6.0`.
- Local candidate is `ace-pack@1.0.0`.
- v1.0.0 is implemented locally and passed release-readiness verification.

## Quality Review
Product Alignment:
- v1.0 gives teams a stable adoption contract for installed ACE repositories and
  makes future changes easier to evaluate.

Architecture:
- The release documents and tests existing behavior rather than introducing a
  schema registry or migration engine without a real schema v2 problem.

Security:
- No AI calls, network calls, hooks, credentials, or automatic migration writes
  were added. Existing `.ai/*` memory remains project-owned.

Code Quality:
- Regression tests protect compatibility promises around installer behavior,
  config normalization, AGENTS workflow markers, command names, legacy aliases,
  and documentation links.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v1.0.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `1.0.0`.

## Known Issues
- None known for v1.0.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0 as large.
- `npm.cmd test` passed: 12 files, 92 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/changed-files.md ---

# Changed Files

[package.json]
- Bumped package version to `1.0.0`.

[docs/schema-compatibility.md]
- Added the v1.0 stable compatibility contract for commands, installed files,
  Markdown sections, memory-config schema version `1`, migration policy, and
  npm payload boundary.

[README.md]
- Added a v1.0 stability-contract section linking to the full schema and
  compatibility document.

[README.npm.md]
- Added npm-facing v1.0 stability-contract copy with a GitHub link to the full
  document.

[tests/schema-compatibility.test.ts]
- Added regression coverage for project-owned memory preservation, AGENTS
  marker stability, memory-config v1 normalization, stable commands, legacy
  aliases, docs links, and fresh install validation.

[ROADMAP.md]
- Marked v1.0 Stable Schema and Compatibility as shipped locally.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, roadmap,
  technical docs, and reports for v1.0 closeout.

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

### 2026-06-14 13:37 Stability docs before migration machinery
Status: resolved
- Stuck Point: A v1.0 stability milestone can tempt agents to build a migration
  framework before ACE has a concrete breaking schema change.
- Likely Cause: "Stable schema" sounds like an engine requirement, but the
  current product already has a lightweight compatibility contract.
- Proposed Improvement: Document and test the existing contract first; add a
  deterministic migrator only when a future schema version actually needs it.

### 2026-06-14 13:17 Growth assets must not become runtime bloat
Status: resolved
- Stuck Point: Product launch material can accidentally creep into package
  payload or runtime behavior.
- Likely Cause: Demo scripts and fixtures are useful for adoption but not needed
  by installed consumer repositories.
- Proposed Improvement: Keep growth assets GitHub-only, link to them from the
  npm README, and enforce the payload boundary in tests and payload guard.

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
