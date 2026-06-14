# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T16:44:30.396Z
- Included files: .ai/generated/report-brief.md, .ai/state/current-task.md, .ai/state/session-handoff.md, .ai/state/changed-files.md, .ai/knowledge/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/generated/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 19:43
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 19:43
- Source session-handoff: 2026-06-14 19:42
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (27 changed files)
- Last commit: dca94cd Refactor ACE command structure to unify under a single `ace` router, replacing legacy command scripts with router arguments. Update documentation to reflect changes in command usage and memory validation processes. Bump version to 2.0.1, ensuring compatibility with existing repositories while streamlining the user experience.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.1.0 Safe ACE Eject & Destroy

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 17:10
Ready For Archive: yes

## Goal
Add a safe two-step uninstall flow so installed repositories can export ACE
memory before removing ACE-owned files.

## Business Value
This strengthens ACE's zero-lock-in promise. Developers can inspect how to leave
before adopting the tool, keep their AI memory in a searchable export, and avoid
destructive cleanup of project-owned files.

## Current Status
- [x] Implement eject/export command.
- [x] Implement guarded destroy command.
- [x] Wire router, installer, docs, version, and tests.
- [x] Run validation and closeout.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.1.0`.

## Risks / Blockers
- None known for the v2.1.0 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
because the working tree was clean, but the shipped product scope was treated
as large.
- Focused Vitest passed for uninstall, router, installer, and schema docs:
4 files, 31 tests.
- `npm.cmd test` passed: 15 files, 116 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.

## Recent Decision
## 2026-06-14 17:10

Decision:
- Implement ACE uninstall as a guarded two-step `ace eject` then `ace destroy`
  workflow.

Reason:
- ACE needs to demonstrate zero-lock-in while protecting project-owned AI
  memory from accidental deletion. A direct destructive command would undermine
  the product promise.

Impact:
- `ace eject` exports active `.ai/**` memory and agent rule files into a
  searchable `ace-export-*` folder with manual restore instructions.
- `ace destroy` refuses active memory without an export, refuses the ACE
  product repository unless explicitly overridden for internal tests, and
  removes only ACE-owned files/scripts while preserving custom project content.
- Installer, router, docs, payload, and tests now treat eject/destroy as shipped
  `ace-pack@2.1.0` behavior.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `scripts/ace-eject.mjs`
- `scripts/ace-destroy.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`

## Overall Progress
- Completion checklist: 9/9
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/state/current-task.md ---

# Current Task

## Feature Name
v2.1.0 Safe ACE Eject & Destroy

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 17:10
Ready For Archive: yes

## Goal
Add a safe two-step uninstall flow so installed repositories can export ACE
memory before removing ACE-owned files.

## Business Value / Product Alignment
This strengthens ACE's zero-lock-in promise. Developers can inspect how to leave
before adopting the tool, keep their AI memory in a searchable export, and avoid
destructive cleanup of project-owned files.

## Technical Approach
Option 1:
- Implement a single destructive `ace uninstall` command. This is simpler but
  risks accidental loss of `.ai` memory and does not model the data-takeout
  flow.

Option 2:
- Implement `ace eject` as the export/preflight step and `ace destroy` as the
  guarded cleanup step. Cleanup removes only ACE-owned artifacts and refuses
  active memory without an export.

Chosen Approach:
- Use Option 2. It preserves developer trust, matches ACE's local-first product
  philosophy, and keeps destructive behavior explicit and reversible by default.

## Current Status
- [x] Implement eject/export command.
- [x] Implement guarded destroy command.
- [x] Wire router, installer, docs, version, and tests.
- [x] Run validation and closeout.

## Affected Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `scripts/ace-eject.mjs`
- `scripts/ace-destroy.mjs`
- README/docs/tests and smoke tooling

## Constraints
- Do not delete project-owned files such as custom `AGENTS.md`, custom
  `CLAUDE.md`, `DEVELOPING.md`, `ROADMAP.md`, custom scripts, or custom
  `ace:validate`.
- Refuse destructive cleanup in the ACE product repository unless an explicit
  internal override is provided.
- Use native Node.js APIs only. Do not add dependencies, AI calls, network
  calls, zip archives, or restore automation scripts.
- Use ASCII CLI output for Windows/npm reliability.

## Acceptance Criteria
- `ace eject` exports active ACE memory to `ace-export-YYYYMMDD-HHMMSS/` with
  `RESTORE.md`, and reports safe removal for template-only memory.
- `ace destroy` removes only ACE-owned artifacts, preserves custom project
  content, and refuses active memory unless an export exists.
- Router, installer, README surfaces, compatibility docs, and tests cover the
  new commands.
- Package version is `2.1.0`.

## Completion Checklist
- [x] Goal completed
- [x] Always: summarize what changed in `.ai/session-handoff.md`
- [x] Always: update `.ai/changed-files.md`, record verification, and run project-owned `ace:validate`
- [x] Always: state publish/deploy decision when relevant
- [x] If standard/large: add product, architecture, security, and code-quality review notes
- [x] If large/high-risk: confirm design approach, add useful reflection, and let `ace finish` archive the snapshot
- [x] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [x] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [x] `ace finish` passed and generated reports

# --- FILE: .ai/state/session-handoff.md ---

# Session Handoff

## Last Update
2026-06-14 17:10

## What Was Done
- Implemented `ace-pack@2.1.0` Safe Eject and Uninstall.
- Added `ace eject` to export active ACE memory into searchable
  `ace-export-YYYYMMDD-HHMMSS/` folders with `RESTORE.md`.
- Added guarded `ace destroy` / `ace purge` cleanup that removes only ACE-owned
  artifacts after an export exists.
- Centralized managed ACE script, package script, IDE bridge, and template
  definitions so install and uninstall behavior cannot drift.
- Updated router, installer, README surfaces, schema compatibility docs,
  roadmap, and tests for the new uninstall flow.

## Current State
- Local candidate is `ace-pack@2.1.0`.
- Fresh installs include the new eject/destroy managed scripts.
- `ace destroy` preserves custom `AGENTS.md`, custom `CLAUDE.md`, custom
  `ace:validate`, project-owned scripts, `DEVELOPING.md`, and `ROADMAP.md`.
- `ROADMAP.md` and `.ai/knowledge/product-roadmap.md` now list v2.1 Safe Eject
  and Uninstall as shipped.

## Quality Review
Product Alignment:
- The feature directly supports ACE's zero-lock-in promise and makes uninstall
  transparency visible near the top of both README surfaces.

Architecture:
- A shared uninstall utility owns managed-file/script definitions and exact IDE
  bridge templates. `ace eject` handles data takeout; `ace destroy` handles
  guarded cleanup and package.json surgery.

Security:
- No dependencies, network calls, AI calls, credentials, SaaS behavior, or zip
  archives were added. Destroy refuses active memory without an export and
  refuses the ACE product repository without an explicit internal override.

Code Quality:
- Focused tests cover empty vs active eject, export contents, destroy refusal,
  custom-file preservation, runner-package cleanup, product-repo guard, router
  aliases, installer managed scripts, and docs contract.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.1.0`.

## Known Issues
- None known for the v2.1.0 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
  because the working tree was clean, but the shipped product scope was treated
  as large.
- Focused Vitest passed for uninstall, router, installer, and schema docs:
  4 files, 31 tests.
- `npm.cmd test` passed: 15 files, 116 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run check:npm-payload` passed and checked 34 packed files.
- `npm.cmd run ace:validate` passed, invoking the project-owned test gate.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed with no created or
  updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/state/changed-files.md ---

# Changed Files

[package.json]
- Bumped `ace-pack` to `2.1.0` for the shipped backward-compatible uninstall
  feature.

[scripts/ace-eject.mjs]
- Added the safe data-takeout command that detects active ACE memory and writes
  searchable `ace-export-*` folders with `RESTORE.md`.

[scripts/ace-destroy.mjs]
- Added guarded cleanup that refuses active memory without export, protects the
  ACE product repo, and removes only ACE-owned files/scripts.

[scripts/ace-uninstall-utils.mjs]
- Centralized managed script names, package script defaults, IDE bridge
  templates, exact-template checks, export discovery, and active-memory
  detection shared by install/eject/destroy.

[install-ace-pack.mjs]
- Reused the shared managed-file definitions and added eject/destroy utilities
  to installed consumer projects.

[scripts/ace-cli.mjs]
- Routed `eject`, `destroy`, and `purge`, plus legacy `ace:*` variants, through
  the single ACE router.

[README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md]
- Documented the prominent Safe Eject and Uninstall flow, CLI contract, and
  v2.1 shipped roadmap state.

[tests/ace-uninstall.test.ts, tests/**]
- Added focused uninstall safety coverage and extended router, installer, and
  schema compatibility assertions.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, product roadmap,
  durable decision, and generated context for the v2.1.0 closeout.

# --- FILE: .ai/knowledge/reflection-log.md ---

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

### 2026-06-14 17:10 Uninstall must share install ownership rules
Status: resolved
- Stuck Point: A cleanup command can easily delete project-owned files if it
  uses broad paths such as `scripts/` or assumes all agent rule files belong to
  ACE.
- Likely Cause: ACE is a scaffold that copies files into consumer repositories,
  so file ownership becomes mixed after installation.
- Proposed Improvement: Keep install and uninstall on the same managed-file
  definitions, remove exact generated content only, and require export before
  deleting active memory.

### 2026-06-14 15:46 Schema v2 needs a mirror layer before file moves
Status: resolved
- Stuck Point: Reorganizing `.ai/**` by category can desynchronize older agents,
  tests, and local memory if files are moved without a compatibility layer.
- Likely Cause: Markdown memory is both product data and agent operating
  context, so path cleanup has to preserve human and agent habits.
- Proposed Improvement: Add shared canonical/legacy path helpers first, read
  both paths, write mirrors, and require old-repo fixture tests before future
  schema migrations.

### 2026-06-14 14:34 External agent feedback exposed daily DevEx friction
Status: resolved
- Stuck Point: After v1.0.1 adoption hardening, fast low-risk edits still paid
  too much closeout ceremony and IDE-native agents had no automatic bridge into
  ACE rules.
- Likely Cause: v1.0 focused on stability and rollout documentation, leaving
  daily-loop polish as planned but not shipped behavior.
- Proposed Improvement: Ship v1.1 with small low-risk auto-closeout,
  finish/gate consistency, optional IDE rule bridges, slim planning context,
  and warning-only freshness hints.

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
