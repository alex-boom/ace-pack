# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-14T13:41:38.500Z
- Included files: .ai/generated/report-brief.md, .ai/state/current-task.md, .ai/state/session-handoff.md, .ai/state/changed-files.md, .ai/knowledge/reflection-log.md
- Missing optional files: none

# --- FILE: .ai/generated/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 16:39
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 16:39
- Source session-handoff: 2026-06-14 16:38
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (36 changed files)
- Last commit: ed45f5b Update documentation to reflect changes in ACE memory paths and command usage. Replace references to legacy `.ai/report-brief.md` with the new `.ai/generated/report-brief.md` format across various files, ensuring consistency in the workflow instructions. Adjust command formats in the IDE bridge scripts to align with the new command structure. Remove outdated `.ai/changed-files.md`, `.ai/current-task.md`, `.ai/decisions.md`, and memory configuration files as part of the transition to the new memory schema.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.0.1 Single ACE Router Cleanup

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 16:26
Ready For Archive: yes

## Goal
Clean the shipped ACE command surface so installed repositories expose only the
single `ace` router plus a project-owned `ace:validate` mechanical gate.

## Business Value
This protects consumer repositories from script bloat and keeps ACE aligned
with its zero-bloat DevEx promise. The `ace:validate` correction preserves the
project-owned quality-gate concept instead of replacing real code checks with
ACE Markdown validation.

## Current Status
- Implemented the single-router cleanup for `ace-pack@2.0.1`.
- Consumer installs now expose only `ace` plus a project-owned `ace:validate`
  placeholder when missing.
- Legacy command names route through `ace` arguments instead of package scripts.
- Verification passed for tests, router check, fake-project smoke, payload
  guard, and the project-owned mechanical gate.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.0.1`.

## Risks / Blockers
- None known for the v2.0.1 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
because the working tree was clean, but the product scope was treated as
large.
- `npm.cmd test` passed: 14 files, 110 tests.
- `pnpm.cmd ace check` passed.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.

## Recent Decision
## 2026-06-14 16:26

Decision:
- Tighten the ACE command surface to a single installed `ace` router plus a
  project-owned `ace:validate` mechanical gate.

Reason:
- Injecting many `ace:*`, `ai:*`, and `agent-memory:*` scripts into consumer
  repositories makes ACE look intrusive. `ace:validate` must remain a project
  code-quality gate rather than an alias for ACE memory validation.

Impact:
- Fresh installs expose only `ace` and `ace:validate` in package scripts.
- `ace check` runs ACE memory validation.
- Legacy command names remain available only as router arguments such as
  `pnpm ace ai:task:finish`.
- Installer upgrades prune only old ACE-managed default aliases and preserve
  custom user scripts.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `scripts/*`
- `README.md, README.npm.md, docs/**`
- `AGENTS.md, CLAUDE.md, scripts/agent-memory-templates.mjs`

## Overall Progress
- Completion checklist: 9/9
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/state/current-task.md ---

# Current Task

## Feature Name
v2.0.1 Single ACE Router Cleanup

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 16:26
Ready For Archive: yes

## Goal
Clean the shipped ACE command surface so installed repositories expose only the
single `ace` router plus a project-owned `ace:validate` mechanical gate.

## Business Value / Product Alignment
This protects consumer repositories from script bloat and keeps ACE aligned
with its zero-bloat DevEx promise. The `ace:validate` correction preserves the
project-owned quality-gate concept instead of replacing real code checks with
ACE Markdown validation.

## Technical Approach
Option 1:
- Keep old `ace:*`, `ai:*`, and `agent-memory:*` package scripts for maximum
  invocation compatibility. This preserves old habits but keeps the intrusive
  package.json surface that prompted the task.

Option 2:
- Move old names behind `scripts/ace-cli.mjs`, install only `ace` plus a
  project-owned `ace:validate`, and prune only known ACE-managed old aliases
  when their values exactly match defaults.

Chosen Approach:
- Use Option 2. It gives fresh installs a clean package.json, preserves legacy
  behavior through router arguments, and avoids deleting user-owned custom
  scripts during upgrades.

## Current Status
- Implemented the single-router cleanup for `ace-pack@2.0.1`.
- Consumer installs now expose only `ace` plus a project-owned `ace:validate`
  placeholder when missing.
- Legacy command names route through `ace` arguments instead of package scripts.
- Verification passed for tests, router check, fake-project smoke, payload
  guard, and the project-owned mechanical gate.

## Affected Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`
- `scripts/agent-memory-templates.mjs`
- README/docs/tests and generated hook workflow text

## Constraints
- Do not map `ace:validate` to `check-agent-memory.mjs` for consumers.
- Keep `ace check` as the ACE memory validation command.
- Preserve custom user scripts during installer upgrades.
- Do not add dependencies, AI calls, network calls, or SaaS behavior.
- Do not bump major version; use a patch bump to `2.0.1`.

## Acceptance Criteria
- Fresh installs add only `ace` and a placeholder `ace:validate` among ACE
  package scripts.
- Upgrades prune only known old ACE default aliases and keep custom scripts.
- `ace-cli.mjs` supports modern commands and legacy router argument aliases.
- Docs and templates state npm users must pass router args after `--`.
- Tests, smoke, payload checks, and `pnpm.cmd ace check` pass.

## Completion Checklist
- [x] Goal completed
- [x] Always: summarize what changed in `.ai/session-handoff.md`
- [x] Always: update `.ai/changed-files.md`, record verification, and run `ace:validate`
- [x] Always: state publish/deploy decision when relevant
- [x] If standard/large: add product, architecture, security, and code-quality review notes
- [x] If large/high-risk: confirm design approach, add useful reflection, and let `ace finish` archive the snapshot
- [x] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [x] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [x] `ace finish` passed and generated reports

# --- FILE: .ai/state/session-handoff.md ---

# Session Handoff

## Last Update
2026-06-14 16:37

## What Was Done
- Implemented the single-router cleanup for `ace-pack@2.0.1`.
- Removed exposed granular `ace:*`, `ai:*`, and `agent-memory:*` package
  scripts from this repo.
- Updated the installer so consumer repositories get only `ace` and a missing
  project-owned `ace:validate` placeholder.
- Added safe upgrade pruning for old ACE-managed default aliases while
  preserving custom user scripts.
- Expanded `ace-cli.mjs` to route legacy command names as router arguments,
  including `ai:update:*` / `update:*` aliases with internal subcommands.
- Updated generated hooks/workflows, README surfaces, docs, templates, local
  AGENTS/CLAUDE instructions, smoke tools, and tests for router syntax.

## Current State
- Local candidate is `ace-pack@2.0.1`.
- Root `package.json` exposes `ace`, `ace:validate`, `test`, and internal
  development/release scripts; old daily ACE aliases are removed.
- `ace check` is the ACE memory validation path.
- `ace:validate` is now the project-owned mechanical gate; in this repo it runs
  `npm run test`.

## Quality Review
Product Alignment:
- The cleanup directly supports ACE's zero-bloat DevEx promise by keeping
  consumer package scripts clean and predictable.

Architecture:
- Command compatibility moved into the router instead of package.json aliases.
  Installer pruning uses exact known-default values so user-owned scripts are
  preserved.

Security:
- No network calls, AI calls, credential handling, SaaS behavior, or automatic
  hooks were added. The mechanical gate distinction reduces the chance that
  agents skip real project validation.

Code Quality:
- Focused tests cover router alias resolution, fresh install script minimalism,
  safe pruning, docs wording, generated gate commands, and smoke installation.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.0.1`.

## Known Issues
- None known for the v2.0.1 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
  because the working tree was clean, but the product scope was treated as
  large.
- `npm.cmd test` passed: 14 files, 110 tests.
- `pnpm.cmd ace check` passed.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run check:npm-payload` passed and checked 31 packed files.
- `npm.cmd run ace:validate` passed, invoking the project-owned mechanical
  test gate.

## Notes
- NPM publish: required before final release; deferred by maintainer.

# --- FILE: .ai/state/changed-files.md ---

# Changed Files

[package.json]
- Bumped `ace-pack` to `2.0.1`.
- Removed exposed granular `ace:*`, `ai:*`, and `agent-memory:*` aliases.
- Kept the `ace` router and changed `ace:validate` to this repo's mechanical
  test gate.

[install-ace-pack.mjs]
- Installs only `ace` plus a missing project-owned `ace:validate` placeholder.
- Prunes old ACE-managed alias scripts only when their values exactly match
  known defaults.
- Prints next-step commands through the router.

[scripts/ace-cli.mjs]
- Routes modern commands and legacy alias arguments through the single entry
  point.
- Supports legacy update aliases with required internal `ai-update.mjs`
  subcommands.

[scripts/*]
- Updated command text, generated hooks/workflows, onboarding messages, and
  classify guidance from old package scripts to router syntax.

[README.md, README.npm.md, docs/**]
- Documented the minimal installed script surface, npm `--` separator, router
  commands, and project-owned `ace:validate` behavior.

[AGENTS.md, CLAUDE.md, scripts/agent-memory-templates.mjs]
- Synced local and installed agent instructions to use `pnpm ace <command>` or
  `npm run ace -- <command>`.
- Clarified that `ace:validate` is the mechanical project gate, while
  `ace check` validates ACE memory.

[tests/**, tools/**]
- Updated install, schema, router, docs, smoke, and quality-gate coverage for
  the clean command surface.
- Fake-project smoke now exercises the installed router and asserts old default
  scripts are not exposed.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, and durable
  decisions for the v2.0.1 command cleanup.

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
