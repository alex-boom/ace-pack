# AI Full Report

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

## Architecture Rules


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

## Technical Approach
Option 1:
- Add marketing content directly into the installer or runtime workflow. This
  makes it visible, but pollutes ACE behavior and risks adding ceremony for
  existing users.

Option 2:
- Keep the growth kit as docs and demo fixtures: a README demo section, a
  short scriptable demo, reusable launch copy, and a tiny fixture repository
  that illustrates context loss vs ACE guardrails.

Chosen Approach:
- Use Option 2. The release improves first impression and launch readiness
  without adding dependencies, CLI commands, config files, hooks, network calls,
  or runtime behavior.

## Current Status
- [x] Confirmed `ace-pack@0.5.0` is published on npm.
- [x] Confirmed working tree was clean before v0.6 work.
- [x] Bumped package version to `0.6.0`.
- [x] Added README/npm README demo entry point.
- [x] Added demo script, launch copy, and demo fixture.
- [x] Added tests that protect the growth kit and payload boundary.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## What Was Done
- Confirmed `ace-pack@0.5.0` is published on npm and local `package.json`
  started from `0.5.0`.
- Started v0.6 Product Growth Kit and bumped local package version to `0.6.0`.
- Added a 60-second demo entry point to README and README.npm.
- Added GitHub-only demo materials:
  - `docs/demo-script.md`
  - `docs/launch-copy.md`
  - `examples/context-loss-demo/**`
- Strengthened npm payload guard so `docs/**` and `examples/**` cannot enter
  the runtime package by accident.
- Added tests that verify README demo links, demo fixture focus, and payload
  boundary expectations.

## Current State
- npm latest is `ace-pack@0.5.0`.
- Local candidate is `ace-pack@0.6.0`.
- v0.6.0 is implemented locally and passed release-readiness verification.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.6.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `0.6.0`.

## Known Issues
- None known for v0.6.0.

## Quality Review
Product Alignment:
- v0.6 improves the first impression and launch readiness without changing ACE's
  core workflow or asking users to learn a new command.

Architecture:
- Growth material is static documentation and a tiny fixture. It stays outside
  runtime scripts, schemas, installers, and MCP/CI behavior.

Security:
- No AI calls, network calls, hooks, credentials, or executable package runtime
  behavior were added. The demo fixture is deliberately local and disposable.

Code Quality:
- Tests cover the README entry points, docs/example presence, fixture focus, and
  package payload boundary. The payload guard also rejects accidental docs or
  examples inclusion.

## Verification
- `npm.cmd run ace:classify` passed and classified v0.6 as large.
- `npm.cmd test` passed: 11 files, 86 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.6.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
created or updated installed files.

## Recent Decisions
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

## Changed Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/demo-script.md`
- `docs/launch-copy.md`
- `examples/context-loss-demo/**`
- `tools/check-npm-payload.mjs`
- `tests/product-growth-kit.test.ts`

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

## Unresolved Reflections
- No unresolved reflections recorded.

## Overall Progress
- Completion checklist: 8/8
- Canonical context lives in `.ai/*`.
- XML bundle generated at `.ai/report-full.xml` for parsable handoff.
