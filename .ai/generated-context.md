# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T09:03:46.474Z
- Included files: .ai/report-brief.md, .ai/current-task.md, .ai/session-handoff.md, .ai/changed-files.md, .ai/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 12:03
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 11:57
- Source session-handoff: 2026-06-14 12:02
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (24 changed files)
- Last commit: 6220d45 Implement v0.4.0 with the new `ace:gate` command for PR/CI quality gates, enhancing governance for AI-generated changes. Bump package version to 0.4.0, add support for PR diff classification, and include actionable failure messages for CI logs. Update documentation to reflect new features, including GitHub Actions workflow generation and pre-push hook installation. Mark v0.4 as shipped in the roadmap.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:ready`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
ACE Smoke Testing and Dogfood Upgrade Routine

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 11:49
Ready For Archive: yes

## Goal
Add release-readiness checks that validate the local ACE candidate in disposable
fake projects and make self-dogfooding an explicit, reviewed step before final
publish.

## Business Value
This reduces release risk without forcing npm publish after every task. ACE can
now batch intermediate shipped changes while still proving the final candidate
works when installed into fresh projects and when re-applied to this repository.

## Current Status
- [x] Added local fake-project smoke tooling for JS and non-JS fixtures.
- [x] Added explicit dogfood self-check tooling with clean-worktree protection.
- [x] Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready`
  npm scripts.
- [x] Updated shipped closeout templates with deferred release wording and
  release-readiness smoke/self-check guidance.
- [x] Updated README, npm README, DEVELOPING, and roadmap documentation.
- [x] Added automated tests for smoke, dogfood pass, and dirty-worktree guard.
- [x] Ran the release-readiness verification sequence.

## Next Steps
- Run `npm.cmd run release:ready` before the final npm release.
- Commit this smoke/dogfood routine with the pending v0.4.0 work.
- After committing or during an explicit reviewed release-readiness pass, run
  `npm.cmd run dogfood:self-check`.
- Publish only when the maintainer decides the final v0.4.0 batch is ready.

## Risks / Blockers
- Dogfood self-check was validated in an installed temp repository through
  automated tests. It was not run against this source repo in the active dirty
  worktree; that is intentional and should happen after commit or with an
  explicit release-readiness pass.

## Verification
- `npm.cmd test` passed: 9 files, 73 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the work as large.
- `npm.cmd run check:npm-payload` passed and checked 28 packed files.

## Recent Decision
## 2026-06-14 11:56

Decision:
- Treat fake-project smoke and explicit dogfood self-check as release-readiness
  checks for shipped ACE changes, not as automatic npm publish triggers.

Reason:
- The maintainer wants to batch intermediate versions and publish only the final
  release, but the final candidate still needs installation-level validation in
  disposable projects and in this dogfooding repository.

Impact:
- `smoke:fake-project` validates the local staged package without network or
  npm-latest dependence.
- `dogfood:self-check` applies the local staged package only during an explicit
  reviewed pass and refuses dirty worktrees by default.
- Future handoffs may state `NPM publish: required before final release;
  deferred by maintainer` when shipped changes are intentionally batched.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `tools/smoke-fake-project.mjs`
- `tools/dogfood-self-check.mjs`
- `scripts/agent-memory-templates.mjs`
- `README.md`
- `README.npm.md`

## Overall Progress
- Completion checklist: 6/6
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/current-task.md ---

# Current Task

## Feature Name
ACE Smoke Testing and Dogfood Upgrade Routine

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 11:49
Ready For Archive: yes

## Goal
Add release-readiness checks that validate the local ACE candidate in disposable
fake projects and make self-dogfooding an explicit, reviewed step before final
publish.

## Business Value / Product Alignment
This reduces release risk without forcing npm publish after every task. ACE can
now batch intermediate shipped changes while still proving the final candidate
works when installed into fresh projects and when re-applied to this repository.

## Technical Approach
Option 1:
- Document the smoke and dogfood expectations only. This is cheap, but future
  agents can skip or inconsistently perform the checks.

Option 2:
- Add local zero-dependency tools for fake-project smoke and explicit dogfood
  self-check, wire them into npm scripts, and cover the workflow with tests.

Chosen Approach:
- Use Option 2. It keeps the process local and deterministic, avoids network or
  npm-latest dependence, and turns release readiness into a repeatable command
  sequence without publishing intermediate versions.

## Current Status
- [x] Added local fake-project smoke tooling for JS and non-JS fixtures.
- [x] Added explicit dogfood self-check tooling with clean-worktree protection.
- [x] Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready`
  npm scripts.
- [x] Updated shipped closeout templates with deferred release wording and
  release-readiness smoke/self-check guidance.
- [x] Updated README, npm README, DEVELOPING, and roadmap documentation.
- [x] Added automated tests for smoke, dogfood pass, and dirty-worktree guard.
- [x] Ran the release-readiness verification sequence.

## Affected Areas
- `package.json`
- `tools/smoke-fake-project.mjs`
- `tools/dogfood-self-check.mjs`
- `scripts/agent-memory-templates.mjs`
- `README.md`
- `README.npm.md`
- `DEVELOPING.md`
- `ROADMAP.md`
- `tests/smoke-release.test.ts`
- `tests/agent-memory.test.ts`
- `.ai/**` closeout notes

## Constraints
- No dependencies, AI calls, network calls, automatic npm publish, or automatic
  hook installation.
- Smoke tests must use the local candidate package, not `npm latest`.
- Dogfood self-check must be explicit and reviewed; it must not blindly run over
  a dirty product worktree.
- Intermediate versions may remain unpublished until the maintainer decides to
  cut the final release.

## Acceptance Criteria
- `npm run smoke:fake-project` creates disposable JS and non-JS projects,
  installs ACE from the local candidate, runs onboarding, `ace:check`,
  `ace:hub start`, and `ace:gate`.
- `npm run dogfood:self-check` checks git state first, applies the local staged
  ACE package, runs `ace:check`, `ace:gate`, and `ace:hub start`, and fails on
  unexpected changed files.
- `npm run release:ready` runs tests, fake-project smoke, `ace:gate`, npm
  payload guard, and npm release dry-run.
- Future handoffs can state `NPM publish: required before final release;
  deferred by maintainer`.

## Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] `ace:validate` and `ace:finish` passed

# --- FILE: .ai/session-handoff.md ---

# Session Handoff

## Last Update
2026-06-14 12:02

## What Was Done
- Added `tools/smoke-fake-project.mjs` to validate the local ACE candidate in
  disposable JS and non-JS repositories.
- Added `tools/dogfood-self-check.mjs` for explicit self-dogfooding with a
  clean-worktree guard and unexpected-diff detection.
- Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready` npm
  scripts.
- Updated shipped ACE workflow templates so future agents can record deferred
  release decisions and run smoke/self-check routines before final publish.
- Updated README surfaces, `DEVELOPING.md`, and `ROADMAP.md` with the new
  release-readiness routine.
- Added tests covering fake-project smoke, dogfood self-check, dirty-worktree
  protection, template wording, and package scripts.

## Current State
- Local package version remains `0.4.0`; intermediate npm publish is deferred
  by maintainer.
- `npm run release:ready` is the main pre-final-release command.
- `npm run dogfood:self-check` is intentionally separate because it should run
  only during an explicit release-readiness pass on a clean or reviewed tree.
- The current worktree contains active product and repo-local memory changes
  for this routine.

## Quality Review
Product Alignment:
- The routine supports the maintainer's decision to batch intermediate changes
  and publish only a final version while still preserving release confidence.

Architecture:
- Fake-project smoke builds the local staged package and imports its installer,
  so the check exercises packaged install behavior instead of source-only
  assumptions. Dogfood self-check uses the same staged candidate and installed
  scripts.

Security:
- No network calls, AI calls, hidden npm publish, or hook installation were
  added. Dogfood self-check refuses dirty worktrees by default to avoid mixing
  sync changes with active product edits.

Code Quality:
- The tools use Node built-ins, fail with actionable messages, and are covered
  by Vitest. `release:ready` verifies tests, smoke, gate, payload guard, and npm
  dry-run in one command.

## Next Steps
- Run `npm.cmd run release:ready` before the final npm release.
- Commit this smoke/dogfood routine with the pending v0.4.0 work.
- After committing or during an explicit reviewed release-readiness pass, run
  `npm.cmd run dogfood:self-check`.
- Publish only when the maintainer decides the final v0.4.0 batch is ready.

## Known Issues
- Dogfood self-check was validated in an installed temp repository through
  automated tests. It was not run against this source repo in the active dirty
  worktree; that is intentional and should happen after commit or with an
  explicit release-readiness pass.

## Verification
- `npm.cmd test` passed: 9 files, 73 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the work as large.
- `npm.cmd run check:npm-payload` passed and checked 28 packed files.
- `npm.cmd run release:npm:dry` passed for `ace-pack@0.4.0`.
- `npm.cmd run release:ready` passed the full readiness sequence.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/changed-files.md ---

# Changed Files

[package.json]
- Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready`
  scripts for local release-readiness validation.

[tools/smoke-fake-project.mjs]
- Added disposable JS and non-JS project smoke that installs ACE from the local
  staged package and runs onboarding, memory check, hub start context, and gate.

[tools/dogfood-self-check.mjs]
- Added explicit local candidate self-apply check with clean-worktree guard,
  core ACE workflow verification, and unexpected changed-file detection.

[scripts/agent-memory-templates.mjs]
- Added deferred release wording and release-bound smoke/dogfood guidance to
  shipped closeout templates.

[README.md]
- Documented fake-project smoke, `release:ready`, and explicit dogfood
  self-check for ACE maintainers.

[README.npm.md]
- Mirrored npm-facing release-readiness documentation.

[DEVELOPING.md]
- Documented deferred publish wording, release-readiness sequence, and explicit
  dogfood self-check policy.

[ROADMAP.md]
- Noted that v0.4 release readiness includes local fake-project smoke and
  explicit dogfood self-checks.

[tests/smoke-release.test.ts]
- Added coverage for JS/non-JS smoke, dogfood self-check pass, and dirty repo
  guard behavior including explicit allow-dirty release-readiness mode.

[tests/agent-memory.test.ts]
- Added assertions for deferred release and dogfood/self-check template wording
  plus package script entries.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, tech docs,
  product roadmap, and regenerated reports for this closeout.

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
