# AI Full Report

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

## Architecture Rules


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

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.1.0`.

## Known Issues
- None known for the v2.1.0 candidate.

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

## Recent Decisions
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

## Changed Areas
- `package.json`
- `scripts/ace-eject.mjs`
- `scripts/ace-destroy.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md`
- `tests/ace-uninstall.test.ts, tests/**`

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

## 2026-06-14 13:17

- Confirmed `ace-pack@0.5.0` is published on npm before starting v0.6 work.
- Bumped package version to `0.6.0`.
- Added README and npm README 60-second demo entry points.
- Added GitHub-only demo script, launch copy, and context-loss fixture.
- Strengthened npm payload guard to reject accidental `docs/**` and
  `examples/**` inclusion.
- Added growth-kit tests and verified `npm.cmd run release:ready` plus explicit
  `npm.cmd run dogfood:self-check -- --allow-dirty` for the v0.6.0 candidate.

## 2026-06-14 13:37

- Confirmed `ace-pack@0.6.0` is published on npm before starting v1.0 work.
- Bumped package version to `1.0.0`.
- Added `docs/schema-compatibility.md` to define the stable v1.0 contract for
  commands, installed files, Markdown sections, memory-config schema version
  `1`, migration policy, and npm payload boundary.
- Added README and npm README stability-contract entry points.
- Added compatibility regression tests for project-owned memory preservation,
  AGENTS marker stability, memory-config v1 normalization, stable commands,
  legacy aliases, docs links, and fresh install validation.
- Verified Vitest and npm payload guard for the v1.0.0 candidate.

## 2026-06-14 13:47

- Confirmed `ace-pack@1.0.0` is published on npm before starting v1.0.1 work.
- Bumped package version to `1.0.1` for a final adoption-hardening candidate.
- Added GitHub-only adoption checklist and FAQ docs.
- Linked adoption docs from README and README.npm.
- Added tests for adoption doc discoverability, FAQ/checklist coverage, and npm
  payload boundary.
- Verified Vitest and npm payload guard for the v1.0.1 candidate.

## 2026-06-14 14:09

- Confirmed `ace-pack@1.0.1` is published on npm and matches local
  `package.json`.
- Confirmed this repository's ACE dogfood install is up to date.
- Added future DevEx roadmap tracks for IDE rule bridging, zero-ceremony small
  tasks, and memory consolidation / schema v2 research.
- Closed the current product milestone. No active implementation task remains.

## 2026-06-14 14:34

- Started `ace-pack@1.1.0` Daily DevEx Runtime Polish.
- Added deterministic small low-risk auto-closeout to `ace:finish` and aligned
  `ace:gate` with the same relaxed boundary.
- Added optional package-manager-aware IDE bridges for Cursor, Windsurf, and
  GitHub Copilot during `ace-pack init`.
- Added `architect-lite` / `plan` hub context and warning-only freshness hints
  in `ace:check`.
- Updated shipped templates, README surfaces, compatibility docs, roadmap,
  fake-project smoke, and tests.
- Verified full Vitest: 13 files, 103 tests.
- Fixed dogfood self-check allowlist so v1.1 IDE bridge files are accepted as
  expected ACE-managed sync output.
- Verified `npm.cmd run release:ready`: 13 files, 104 tests, fake-project
  smoke, `ace:gate`, payload guard, and npm publish dry-run passed.
- Verified `npm.cmd run dogfood:self-check -- --allow-dirty` passed for this
  repository with local `ace-pack@1.1.0`.

## 2026-06-14 15:13

- Confirmed `ace-pack@1.1.0` is published on npm and matches local
  `package.json`.
- Updated ACE handoff/current-task memory so future agents do not attempt to
  republish v1.1.0.
- Current product milestone is complete and no active implementation task is
  open.

## 2026-06-14 15:46

- Implemented the combined v2.0 candidate: command router, generated artifact hygiene, and categorized ACE memory layout with legacy mirrors.
- Updated installer, shared memory helpers, reports, hub, onboard, MCP, finish, gate, check, update helpers, templates, README surfaces, schema docs, roadmap, and tests.
- Applied v2 migration to this repository and verified tests, fake-project smoke, ace:gate, npm payload guard, npm dry-run, and dogfood self-check.
- NPM publish: required before final release; deferred by maintainer.

## 2026-06-14 17:10

- Implemented the v2.1.0 Safe Eject and Uninstall candidate.
- Added `ace eject`, guarded `ace destroy` / `ace purge`, shared uninstall
  utilities, installer/router wiring, README/schema docs, roadmap updates, and
  focused uninstall safety tests.
- Verified focused Vitest, full Vitest, fake-project smoke, npm payload guard,
  project-owned `ace:validate`, and dogfood self-check.
- NPM publish: required before final release; deferred by maintainer.

## Unresolved Reflections
- No unresolved reflections recorded.

## Overall Progress
- Completion checklist: 9/9
- Canonical context lives in `.ai/*`.
- XML bundle generated at `.ai/generated/report-full.xml` for parsable handoff.
