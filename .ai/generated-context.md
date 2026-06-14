# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T10:49:50.955Z
- Included files: .ai/report-brief.md, .ai/current-task.md, .ai/session-handoff.md, .ai/changed-files.md, .ai/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 13:49
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 13:48
- Source session-handoff: 2026-06-14 13:49
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (17 changed files)
- Last commit: 24a3f8d Promote ACE to v1.0 by documenting the stability contract, including command names, installed file expectations, and migration policy. Bump package version to 1.0.0 and add regression tests for backward compatibility. Update README and npm README with links to the v1.0 stability documentation.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: No command detected
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v1.0.1 Final Adoption Hardening

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 13:52
Ready For Archive: yes

## Goal
Add final adoption guidance for teams evaluating ACE after v1.0, while batching
the next npm publish until the maintainer decides the final release is ready.

## Business Value
After v1.0, teams need a concise rollout path and FAQ more than new runtime
features. This reduces adoption friction without changing ACE's zero-bloat core.

## Current Status
- [x] Confirmed `ace-pack@1.0.0` is published on npm.
- [x] Confirmed working tree was clean before v1.0.1 work.
- [x] Bumped package version to `1.0.1`.
- [x] Added adoption checklist and FAQ docs.
- [x] Linked adoption docs from README and README.npm.
- [x] Added tests for adoption docs and payload boundary.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Next Steps
- No terminal command is required right now.
- Do not publish until the maintainer says the final batch is ready.
- When the maintainer chooses to publish the final batch, run
  npm.cmd run release:npm.

## Risks / Blockers
- None known for v1.0.1.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0.1 as large.
- `npm.cmd test` passed: 13 files, 96 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.1`.

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
- `docs/adoption-checklist.md`
- `docs/faq.md`
- `README.md`
- `README.npm.md`
- `tests/adoption-docs.test.ts`

## Overall Progress
- Completion checklist: 8/8
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/current-task.md ---

# Current Task

## Feature Name
v1.0.1 Final Adoption Hardening

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 13:52
Ready For Archive: yes

## Goal
Add final adoption guidance for teams evaluating ACE after v1.0, while batching
the next npm publish until the maintainer decides the final release is ready.

## Business Value / Product Alignment
After v1.0, teams need a concise rollout path and FAQ more than new runtime
features. This reduces adoption friction without changing ACE's zero-bloat core.

## Technical Approach
Option 1:
- Add new CLI onboarding prompts or interactive adoption commands. This would
  surface guidance in terminal, but adds behavior and maintenance for a docs
  problem.

Option 2:
- Add GitHub-only adoption docs and concise README/npm README links, backed by
  tests that keep the docs discoverable and out of the npm runtime payload.

Chosen Approach:
- Use Option 2. Keep this as documentation hardening only: no new commands,
  dependencies, schemas, hooks, network calls, or installer behavior.

## Current Status
- [x] Confirmed `ace-pack@1.0.0` is published on npm.
- [x] Confirmed working tree was clean before v1.0.1 work.
- [x] Bumped package version to `1.0.1`.
- [x] Added adoption checklist and FAQ docs.
- [x] Linked adoption docs from README and README.npm.
- [x] Added tests for adoption docs and payload boundary.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Affected Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/**`
- `tests/**`
- `.ai/**` closeout notes

## Constraints
- No runtime dependencies, AI calls, network calls, hooks, schemas, CLI command
  changes, or installer behavior changes.
- Keep adoption docs GitHub-only; npm README may link to them but docs must stay
  out of the npm package payload.
- Do not publish intermediate npm versions until the maintainer explicitly
  decides the final batch is ready.

## Acceptance Criteria
- Teams have a clear adoption checklist from first repo to CI gate.
- FAQ answers common adoption objections: privacy, dependencies, non-JS repos,
  strict gates, MCP, upgrades, and when not to use ACE.
- README and npm README link to adoption docs without bloating the package.
- Tests verify adoption docs remain discoverable and excluded from npm payload.

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
2026-06-14 13:47

## What Was Done
- Confirmed `ace-pack@1.0.0` is published on npm and the working tree was clean
  before v1.0.1 work.
- Started the next final-release batch as `ace-pack@1.0.1`; npm publish is
  intentionally deferred until the maintainer decides the final batch is ready.
- Added `docs/adoption-checklist.md` with a gradual rollout path from first
  repository to optional PR/CI gates.
- Added `docs/faq.md` covering common adoption objections around AI calls,
  dependencies, non-JS repositories, strict gates, MCP, upgrades, and when not
  to use ACE.
- Added README and npm README links to the adoption docs.
- Added tests for adoption doc links, content focus, and npm payload boundary.

## Current State
- npm latest is `ace-pack@1.0.0`.
- Local candidate is `ace-pack@1.0.1`.
- v1.0.1 is implemented locally and passed release-readiness verification.
- No intermediate npm publish should happen until the maintainer explicitly
  decides this final batch is ready.

## Quality Review
Product Alignment:
- v1.0.1 improves team adoption after the stable v1.0 contract without adding
  new runtime concepts or commands.

Architecture:
- The change is documentation hardening only. Adoption docs are GitHub-only,
  while README.npm links to them without adding docs to the npm payload.

Security:
- No AI calls, network calls, hooks, credentials, migrations, or automatic
  runtime behavior were added.

Code Quality:
- Tests verify adoption docs are linked from both README surfaces, answer common
  objections, and remain outside the package file list.

## Next Steps
- No terminal command is required right now.
- Do not publish until the maintainer says the final batch is ready.
- When the maintainer chooses to publish the final batch, run
  npm.cmd run release:npm.

## Known Issues
- None known for v1.0.1.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0.1 as large.
- `npm.cmd test` passed: 13 files, 96 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.1`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/changed-files.md ---

# Changed Files

[package.json]
- Bumped package version to `1.0.1` for the final adoption-hardening candidate.

[docs/adoption-checklist.md]
- Added a gradual team rollout checklist from first repository to optional CI
  gate adoption and safe upgrades.

[docs/faq.md]
- Added answers for common adoption questions about AI calls, dependencies,
  non-JS repos, memory preservation, gates, MCP, upgrades, and when not to use
  ACE.

[README.md]
- Added Adoption Guides links to the GitHub README.

[README.npm.md]
- Added npm-facing Adoption Guides links to GitHub docs.

[tests/adoption-docs.test.ts]
- Added coverage for README links, adoption checklist focus, FAQ coverage, and
  npm payload boundary expectations.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, roadmap, technical
  docs, and reports for v1.0.1 closeout.

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
