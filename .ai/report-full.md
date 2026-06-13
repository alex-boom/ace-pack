# AI Full Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 01:17
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 01:14
- Source session-handoff: 2026-06-14 01:16
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (18 changed files)
- Last commit: a7aaed8 Update package version to 0.1.6, revise description to emphasize local AgentOps for AI coding agents, and enhance discoverability with new keywords for Cursor, Claude Code, Aider, GitHub Copilot, and ChatGPT. Align README.md and README.npm.md content to reflect these changes while maintaining existing product behavior.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Architecture Rules


## Current Task
ACE 0.1.7 New-Chat Start Snapshot

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 01:07
Ready For Archive: yes

## Goal
Ship a patch release that makes `.ai/report-brief.md` the primary startup
artifact for a brand-new AI chat by showing repo state, task state, next
terminal command, and release decision through deterministic local parsing.

## Business Value
New AI sessions should recover project state quickly without relying on chat
history. The change strengthens ACE's local-first AgentOps promise while
preserving the zero-network, zero-hidden-AI constraints.

## Technical Approach
Option 1:
- Add the snapshot only to `.ai/report-brief.md`. This is the smallest change,
  but it leaves full reports and `ace:hub` less useful for new-agent handoff.

Option 2:
- Add a shared local snapshot helper used by brief and full reports, improve
  stack fallback, and include the brief first in `ace:hub` coder context.

Chosen Approach:
- Use Option 2. It keeps parsing deterministic, avoids network or AI calls, and
  improves every startup path without changing CLI names or adding config.

## Current Status
- [x] Plan approved for v0.1.7.
- [x] Task classified as large because shipped scripts are changing.
- [x] Implement report snapshot helpers.
- [x] Update brief/full report output.
- [x] Update `ace:hub` coder payload.
- [x] Add tests and verify release dry run.

## What Was Done
- Bumped `ace-pack` to version `0.1.7`.
- Added `## Start Snapshot` to brief and full report generation.
- Added deterministic local helpers for git branch, `git status --porcelain`
  changed-file count, last commit, lifecycle status, next command, release
  decision, and stack fallback.
- Updated `ace:hub` AI Coder Context so `.ai/report-brief.md` is included first
  when available, without breaking fresh repos before the first report.
- Added tests for snapshot output, first-backtick command parsing, missing
  `Next Steps`, flexible `NPM publish:` parsing, stack fallback, and hub order.

## Current State
- Product behavior changed only in shipped local scripts and generated reports.
- No CLI command names, config files, schemas, network calls, or AI calls were
  added.
- The staged npm payload now carries `ace-pack@0.1.7`.
- The live brief report shows Start Snapshot data for this dirty worktree and
  extracts `npm.cmd run release:npm` as the next command.

## Next Steps
- Publish with `npm.cmd run release:npm` when ready.

## Known Issues
- None for this report and hub improvement.

## Quality Review
Product Alignment:
- New chats can recover operational state faster, directly supporting ACE's
  local AgentOps promise for AI coding agents.

Architecture:
- The implementation keeps Markdown as the source of truth and centralizes
  deterministic parsing in `scripts/ai-memory-utils.mjs`.

Security:
- No hidden AI calls, registry lookups, network calls, credentials, auth, or
  publish-secret handling changed. Git failures degrade to `unknown`.

Code Quality:
- The parser intentionally uses the first backticked command from `Next Steps`
  only, and tests cover the main fallbacks and formatting edge cases.

## Verification
- `npm.cmd run ace:classify -- --tier large --reason "v0.1.7 changes shipped report and hub scripts"` passed before implementation.
- `npm.cmd test` passed: 7 files, 47 tests.
- `npm.cmd run ace:check` passed.
- `npm.cmd run check:npm-payload` passed and checked 27 packed files.
- `npm.cmd run release:npm:dry` passed and dry-ran `ace-pack@0.1.7`.

## Recent Decisions
## 2026-06-13 23:12

Decision:
- Require every future task handoff to state whether npm publish is required.

Reason:
- GitHub-only docs and repo-local ACE memory changes can look important but do
  not ship to npm. The maintainer needs a clear yes/no signal after each task to
  avoid republishing existing versions or skipping real payload updates.

Impact:
- Future final responses should include `NPM publish: required` or
  `NPM publish: not required`, plus the reason.
- The decision boundary is the staged npm payload and user-visible installed ACE
  behavior, not the full git diff.

## Changed Areas
- `package.json`
- `scripts/ai-memory-utils.mjs`
- `scripts/ai-report-brief.mjs`
- `scripts/ai-report.mjs`
- `scripts/ace-hub.mjs`
- `tests/ai-report.test.ts`
- `tests/ace-hub.test.ts`
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

## Unresolved Reflections
- No unresolved reflections recorded.

## Overall Progress
- Completion checklist: 13/13
- Canonical context lives in `.ai/*`.
- XML bundle generated at `.ai/report-full.xml` for parsable handoff.
