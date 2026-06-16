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

## 2026-06-15 12:30

- Added Project Conventions and Pattern Discovery to long-term roadmap research.
- Mirrored the item in canonical `.ai/knowledge/product-roadmap.md`.
- Kept the task documentation-only with no package version or CLI behavior
  changes.

## 2026-06-16 12:33

- Implemented the v2.2.0 Project Conventions Discovery candidate.
- Added `ace discover`, project conventions memory path support, hub and MCP
  integration, installer sync, shipped docs, schema docs, roadmap updates, and
  focused tests.
- Verified focused Vitest, full Vitest, fake-project smoke, npm payload guard,
  and npm release dry-run.
- Ran gate, dogfood self-check, and project-owned `ace:validate`.
- Attempted `npm.cmd run release:npm`; npm rejected publish with `E404` /
  permission error, and registry latest remains `2.1.0`.
- NPM publish: required before final release; blocked by npm permission.
