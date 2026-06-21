# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Current Phase: Review
- Next Autonomous Action: Run release readiness checks and final ACE closeout.
- Generated: 2026-06-21T09:51:58.570Z
- Included files: .ai/generated/report-brief.md, .ai/state/task-state.md, .ai/knowledge/reflection-log.md
- Missing optional files: .ai/knowledge/project-conventions.md

# --- FILE: .ai/generated/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-19 15:33
- Freshness: Fresh
- Current task version: v3.5.1
- Current task tier: large
- Source task-state: 2026-06-19 15:32
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (14 changed files)
- Last commit: 0e0d184 Update version to `3.5.0` and introduce knowledge promotion and context pruning features. Implemented `ace hub distill` for generating durable project conventions from resolved reflections, and added `ace archive` for deterministic log rotation of work and reflection logs. Enhanced documentation to reflect these new functionalities and updated schema compatibility for v3.5, ensuring clarity on new features while maintaining backward compatibility.
- Task: complete (tier: large, version: v3.5.1, ready for archive: yes)
- Current Phase: Complete
- Next Autonomous Action: No further autonomous action; task is complete.
- Next command: No command detected
- Release decision: Not recorded

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
ACE v3.5.1 Safe Migration Patch and Platform Upgrade

## Lifecycle
Status: complete
Version: v3.5.1
Task Tier: large
Design Review Required: yes
Friction Encountered: no
Current Phase: Complete
Next Autonomous Action: No further autonomous action; task is complete.
Started: 2026-06-19 15:05
Ready For Archive: yes

## Goal
Fix ACE legacy task-state migration so real Markdown checklists and bracketed
content are preserved, then safely migrate `D:\All\alex-work\platform` to the
patched v3 canonical ACE layout without losing existing `.ai` memory.

## Business Value
This patch protects installed repositories from losing meaningful legacy task
checklists during v3 migration, which is essential for safe ACE upgrades in real
projects with existing `.ai` history.

## Current Status
- [x] Migration issue reproduced on a temporary copy of `platform`.
- [x] User approved patch-first, canonical-only cleanup, and SaaS preset apply.
- [x] Patch ACE placeholder detection and regression tests.
- [x] Validate ACE package and npm payload dry-run.
- [x] Back up and migrate `platform`.
- [x] Validate platform ACE state and review diffs.

## Next Steps
- Review and commit both repository diffs.

## Risks / Blockers
- None known.

## Verification
- `npm.cmd run ace -- classify` ran before edits; it reported `small` only
because no diff existed yet.
- `npm.cmd test -- tests/schema-compatibility.test.ts` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.

## Recent Decision
## 2026-06-16 13:51

Decision:
- Implement ACE Pack v3.0.0 as a consolidated task-state memory schema with
  deterministic legacy auto-migration, managed IDE rule blocks, and
  zero-ceremony small-task finish.

Reason:
- The old current-task, session-handoff, and changed-files split created
  avoidable file sprawl and agent desynchronization. IDE rule bridging must be
  native but must never overwrite user-owned editor instructions.

Impact:
- `.ai/state/task-state.md` is the canonical active task file, with
  `.ai/task-state.md` as a legacy alias.
- Legacy task files are backed up under `.ai/archive/migrations/` before safe
  cleanup.
- `.cursorrules`, `.windsurfrules`, and Copilot instructions use
  `ace-managed-ide-rules` blocks that `ace destroy` can remove surgically.
- `ace-pack@3.0.0` is a major release; npm publish is required only for the
  final reviewed release.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- No changed files recorded.

## Overall Progress
- Completion checklist: 6/6
- Source of truth: `.ai/state/task-state.md` and `.ai/*` files remain authoritative.

# --- FILE: .ai/state/task-state.md ---

# Task State

## Lifecycle & Meta

### Feature Name
ACE Scoped Fast Fix Workflow

### Lifecycle
Status: active
Version: v3.6.0
Task Tier: large
Design Review Required: yes
Friction Encountered: no
Current Phase: Review
Next Autonomous Action: Run release readiness checks and final ACE closeout.
Started: 2026-06-21 12:39
Ready For Archive: no

### Goal
Reduce ACE ceremony for urgent, low-risk hotfixes in dirty worktrees by letting
users classify and finish only the staged or explicitly selected paths while
preserving existing risk rules and required validation.

### Current Status
- [x] User confirmed the fast-fix friction should be addressed.
- [x] `npm.cmd run ace -- classify` ran before implementation and reported
  `small` on a clean worktree.
- [x] Implement scoped classify and finish flags.
- [x] Add focused regression coverage.
- [x] Update shipped documentation and templates.
- [x] Update durable ACE knowledge and reflection notes.
- [ ] Run release readiness checks and close out ACE state.

### Affected Areas
- `scripts/ai-task-classify.mjs`
- `scripts/ai-task-finish.mjs`
- `scripts/ai-task-scope.mjs`
- `scripts/ace-cli.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `scripts/agent-memory-templates.mjs`
- `tests/ai-task-classify.test.ts`
- `tests/ai-task-finish.test.ts`
- `tests/install-agent-memory-pack.test.ts`
- `README.md`
- `README.npm.md`
- `package.json`
- `.ai/knowledge/tech-docs.md`
- `.ai/knowledge/product-roadmap.md`
- `.ai/knowledge/decisions.md`
- `.ai/knowledge/reflection-log.md`

### Constraints
- Preserve ACE local-first, zero-dependency, no hidden AI/network calls.
- Keep existing default behavior for full working-tree classification.
- Do not weaken high-risk path or keyword rules.
- Keep fast-fix scope explicit and auditable in CLI output, JSON, task-state,
  and work-log summaries.
- Bump semver because shipped user-visible CLI behavior changes.

### Acceptance Criteria
- [x] `ace classify --staged` classifies only staged changes.
- [x] `ace classify --path <path>` / repeated `--path` classifies only selected
  paths from the working tree.
- [x] `ace finish` supports the same scope flags so small low-risk auto-closeout can
  operate on the intended hotfix instead of unrelated dirty files.
- [x] Scoped classification refuses ambiguous combinations such as PR refs plus
  staged/path scope.
- [x] High-risk rules still escalate scoped changes when selected files or diff
  content match configured policy.
- [x] Tests cover staged and path-scoped false-positive reduction.
- [x] Docs explain fast-fix usage as scoped safety, not a bypass.

### Completion Checklist
- [ ] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish decision recorded
- [ ] `ace finish` passed or explicit reason recorded

## Business Value & Approach

### Business Value / Product Alignment
ACE is valuable when it behaves like a safety belt: it should keep validation,
risk detection, and durable memory, but it should not force a large-task ritual
for a two-line hotfix just because unrelated work is already dirty. Scoped
fast-fix support directly addresses daily DevEx friction while preserving the
local Markdown, no-dependency product promise.

### Technical Approach
Option 1:
- Add a new top-level `ace fast-fix` command that wraps classify, validation,
  and finish. This is discoverable, but it expands the command surface and risks
  becoming a bypass path with separate policy.

Option 2:
- Extend existing `ace classify` and `ace finish` with explicit scope flags
  (`--staged`, `--path`) and keep the existing tier/risk/finish machinery. This
  keeps one policy engine and makes fast fixes a scoped version of the normal
  workflow.

Chosen Approach:
- Use Option 2. The problem is scope selection, not missing policy. Reusing the
  current classifier and finish path keeps behavior predictable and avoids a
  second ritual.

### Edge Cases & Red Teaming
- Failure mode: a user scopes away real risk. Mitigation: flags are explicit,
  classification output records the scope, and selected paths still run all
  configured path and keyword risk rules.
- Failure mode: `--path` ignores untracked files. Mitigation: path scope uses
  `git status --porcelain -uall -- <paths>` plus `git diff HEAD -- <paths>`.
- Failure mode: staged scope includes unrelated staged work. Mitigation: this is
  still explicit Git staging behavior and can be reviewed with `git diff
  --cached`.
- Failure mode: combining PR refs with local scope is ambiguous. Mitigation:
  reject `--base/--head` with `--staged` or `--path`.

## Changed Files / Diff

[scripts/ai-task-scope.mjs]
- Added shared scoped git diff input, scope formatting, and scoped diff summary
  helpers for classifier and finish flows.

[scripts/ai-task-classify.mjs]
- Added `--staged`, repeated `--path`, and comma-separated `--paths` support,
  scope metadata in JSON/CLI output, and PR/local scope conflict handling.

[scripts/ai-task-finish.mjs]
- Added matching scope flags for adaptive finish and scoped small-task
  auto-closeout summaries.

[scripts/ace-uninstall-utils.mjs, scripts/ace-cli.mjs]
- Added the new managed script to install/destroy ownership lists and refreshed
  router help text.

[README.md, README.npm.md, scripts/agent-memory-templates.mjs]
- Documented scoped fast fixes as an explicit low-risk hotfix workflow, not a
  risk bypass.

[tests]
- Added staged/path-scope classifier coverage, high-risk scoped escalation,
  invalid scope combination coverage, path-scoped finish coverage, and install
  coverage for the new managed script.

[package.json]
- Bumped package version to `3.6.0` for the backward-compatible CLI workflow.

## Handoff & Next Steps

### Last Update
2026-06-21 12:50

### What Was Done
- Added scoped classification and finish behavior.
- Added regression coverage and shipped docs/templates.
- Updated durable ACE tech docs, roadmap, decisions, and reflection notes.

### Current State
- Implementation is complete and project validation has passed. Release
  readiness checks remain.

### Quality Review
Product Alignment:
- The change targets a named daily DevEx pain without reducing ACE safety for
  high-risk tasks.

Architecture:
- The planned implementation extends the existing classifier and finish flow
  instead of adding a separate command or dependency.

Security:
- No new network calls, providers, secrets, or external services are planned.

Code Quality:
- Focused unit/integration tests will cover scoped diff inputs and closeout.

### Next Steps
- Implement the scoped diff input selection.
- Add tests and docs.
- Run validation.

### Known Issues
- None known.

### Verification
- `npm.cmd run ace -- classify` passed before implementation.
- `npm.cmd test -- tests/ai-task-classify.test.ts` passed before extraction.
- `npm.cmd test -- tests/ai-task-finish.test.ts` passed before extraction.
- `npm.cmd test -- tests/ai-task-classify.test.ts tests/ai-task-finish.test.ts tests/install-agent-memory-pack.test.ts` passed after extraction.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run ace -- classify` passed after implementation and reported
  `large`, as expected for shipped `scripts/**` and `.ai/**` changes.
- `npm.cmd run ace:validate` passed: 17 test files, 152 tests.

### Notes
- NPM publish: required before final release because shipped ACE CLI behavior,
  installed scripts, package version, and npm payload documentation changed.

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

### 2026-06-21 12:50 Dirty worktrees can inflate hotfix ceremony
Status: resolved
- Stuck Point: A two-line low-risk hotfix can be classified as large when the
  repository already has unrelated dirty files.
- Likely Cause: ACE classified the full working tree by default and had no
  first-class way to tell classify/finish which local scope belonged to the
  current task.
- Proposed Improvement: Keep full working-tree classification as the default,
  but support explicit `--staged` and `--path` scopes that still run normal
  risk rules and record the selected scope in closeout output.

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
