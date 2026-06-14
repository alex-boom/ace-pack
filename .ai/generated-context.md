# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T10:21:00.826Z
- Included files: .ai/report-brief.md, .ai/current-task.md, .ai/session-handoff.md, .ai/changed-files.md, .ai/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/report-brief.md ---

# AI Brief Report

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

## Current Status
- [x] Confirmed `ace-pack@0.5.0` is published on npm.
- [x] Confirmed working tree was clean before v0.6 work.
- [x] Bumped package version to `0.6.0`.
- [x] Added README/npm README demo entry point.
- [x] Added demo script, launch copy, and demo fixture.
- [x] Added tests that protect the growth kit and payload boundary.
- [x] Ran release-readiness checks and explicit dogfood self-check.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.6.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `0.6.0`.

## Risks / Blockers
- None known for v0.6.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v0.6 as large.
- `npm.cmd test` passed: 11 files, 86 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.6.0`.

## Recent Decision
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

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/demo-script.md`
- `docs/launch-copy.md`
- `examples/context-loss-demo/**`

## Overall Progress
- Completion checklist: 8/8
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/current-task.md ---

# Current Task

## Feature Name
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

## Business Value / Product Alignment
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

## Affected Areas
- `package.json`
- `README.md`
- `README.npm.md`
- `docs/**`
- `examples/**`
- `tests/**`
- `.ai/**` closeout notes

## Constraints
- No new runtime dependencies, CLI commands, config files, AI calls, network
  calls, hook installs, or MCP changes.
- Marketing/demo assets must stay out of runtime behavior and out of the npm
  payload unless deliberately shipped through README.npm.
- Keep the main README concise; move detailed scripts and launch copy into docs.

## Acceptance Criteria
- README surfaces a 60-second ACE demo path.
- A scriptable demo document explains the before/after scenario.
- Launch copy exists for GitHub/npm/social/community posts.
- A tiny fixture repo demonstrates sensitive code paths and expected ACE
  guardrail behavior.
- Tests verify the growth kit references exist and docs/examples are not added
  to the npm package payload.

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
2026-06-14 13:17

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

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.6.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `0.6.0`.

## Known Issues
- None known for v0.6.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v0.6 as large.
- `npm.cmd test` passed: 11 files, 86 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.6.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/changed-files.md ---

# Changed Files

[package.json]
- Bumped package version to `0.6.0`.

[README.md]
- Added a 60-second demo section with links to the demo script, launch copy, and
  context-loss fixture.

[README.npm.md]
- Added npm-facing 60-second demo copy with GitHub links to the full demo kit.

[docs/demo-script.md]
- Added a scriptable before/after demo walkthrough for ACE presentations,
  recordings, and launch material.

[docs/launch-copy.md]
- Added reusable positioning, release copy, npm copy, blog opening, Reddit post,
  Twitter/X thread, and demo CTA.

[examples/context-loss-demo/**]
- Added a tiny auth/session fixture that demonstrates why context loss is risky
  for AI coding agents.

[tools/check-npm-payload.mjs]
- Added `docs/**` and `examples/**` to forbidden npm payload paths.

[tests/product-growth-kit.test.ts]
- Added coverage for README demo links, demo docs, fixture focus, and package
  payload boundary expectations.

[DEVELOPING.md]
- Documented that `docs/**` and `examples/**` stay out of the npm payload.

[ROADMAP.md]
- Marked v0.6 Product Growth Kit as shipped locally.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, roadmap,
  technical docs, and reports for v0.6 closeout.

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
