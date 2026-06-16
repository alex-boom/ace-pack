# ACE Hub Context
- Mode: start (Start / AI Coder Context)
- Generated: 2026-06-16T09:38:11.668Z
- Included files: .ai/generated/report-brief.md, .ai/state/current-task.md, .ai/state/session-handoff.md, .ai/state/changed-files.md, .ai/knowledge/reflection-log.md
- Missing optional files: .ai/knowledge/project-conventions.md

# --- FILE: .ai/generated/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-16 12:38
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-16 12:36
- Source session-handoff: 2026-06-16 12:38
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (28 changed files)
- Last commit: 0cbaa26 Add Project Conventions and Pattern Discovery to ROADMAP.md as a long-term research item. Mirrored the concept in product-roadmap.md, ensuring documentation-only changes with no impact on CLI behavior or package version.
- Task: active (tier: large, version: v1, ready for archive: no)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; blocked by npm permission.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.2.0 Project Conventions Discovery

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-16 12:33
Ready For Archive: no

## Goal
Ship `ace discover` so installed repositories can generate a concise local
Project Conventions and Pattern Registry for AI agents.

## Business Value
This directly addresses architectural drift in established codebases. ACE will
help agents reuse a project's existing UI, routing, logging, error-handling,
database, and package-layout patterns instead of inventing parallel ones.

## Current Status
- [x] Implement `ace discover` scanner and overwrite protection.
- [x] Wire router, install, hub, memory paths, MCP, docs, and version.
- [x] Add focused tests and release-readiness checks.
- [ ] Publish `ace-pack@2.2.0` after npm permissions are available.

## Next Steps
- Fix npm auth/package permissions for ace-pack.
- Run `npm.cmd run release:npm`.
- Verify `npm.cmd view ace-pack version` returns `2.2.0`.

## Risks / Blockers
- None known for the v2.2.0 candidate.

## Verification
- `npm.cmd run ace -- classify` passed before implementation; the clean
worktree detected as `small`, but the shipped command scope is treated as
large.
- Focused Vitest passed: 7 files, 54 tests.
- `npm.cmd run test` passed: 16 files, 123 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS projects.

## Recent Decision
## 2026-06-16 12:33

Decision:
- Implement Project Conventions Discovery as deterministic local `ace discover`
  heuristics instead of AI-provider analysis.

Reason:
- ACE must preserve its local-first, zero-dependency, no-hidden-AI-calls
  promise while still helping agents reuse established repository patterns.
  Simple import/dependency/path signals are less brittle than pseudo-AST regex
  parsing and safer for large private repositories.

Impact:
- `ace discover` writes `.ai/knowledge/project-conventions.md` with a managed
  marker and protects human-written files unless `--force` is passed.
- `ace hub` and the read-only MCP adapter can expose the conventions summary
  when it exists.
- Future AI-assisted convention discovery remains a separate explicit opt-in
  feature, not part of the default v2.2 workflow.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `scripts/ace-discover.mjs`
- `scripts/ace-cli.mjs, scripts/ai-memory-utils.mjs, scripts/ace-hub.mjs, scripts/ace-mcp-server.mjs`
- `scripts/ace-uninstall-utils.mjs, install/tests`
- `README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md`
- `.ai/**`

## Overall Progress
- Completion checklist: 0/9
- Source of truth: `.ai/*` files remain authoritative.

# --- FILE: .ai/state/current-task.md ---

# Current Task

## Feature Name
v2.2.0 Project Conventions Discovery

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-16 12:33
Ready For Archive: no

## Goal
Ship `ace discover` so installed repositories can generate a concise local
Project Conventions and Pattern Registry for AI agents.

## Business Value / Product Alignment
This directly addresses architectural drift in established codebases. ACE will
help agents reuse a project's existing UI, routing, logging, error-handling,
database, and package-layout patterns instead of inventing parallel ones.

## Technical Approach
Option 1:
- Add an AI-provider-backed discovery flow. This may produce richer analysis,
  but it requires API keys, privacy configuration, provider fallback policy, and
  more release risk.

Option 2:
- Add a deterministic local scanner that uses simple path, dependency, and
  import-string heuristics to write a short Markdown conventions summary.

Chosen Approach:
- Use Option 2 for v2.2.0. It preserves ACE's local-first, zero-dependency,
  zero-hidden-AI-calls promise while still giving agents useful repo-specific
  convention context.

## Current Status
- [x] Implement `ace discover` scanner and overwrite protection.
- [x] Wire router, install, hub, memory paths, MCP, docs, and version.
- [x] Add focused tests and release-readiness checks.
- [ ] Publish `ace-pack@2.2.0` after npm permissions are available.

## Affected Areas
- `package.json`
- `scripts/ace-discover.mjs`
- ACE router, memory utils, hub, MCP, installer-managed script lists
- README surfaces, schema docs, roadmap, tests, smoke tooling

## Constraints
- Use native Node.js APIs only. Do not add dependencies.
- Do not make AI calls, network calls, AST parsing, or complex regex analysis.
- Keep regex heuristics simple: detect imports, dependencies, and obvious path
  patterns.
- Keep generated `project-conventions.md` concise and aggregated so it does not
  bloat `ace hub` context.
- Protect human-written conventions files; overwrite unmanaged files only with
  `--force`.

## Acceptance Criteria
- `ace discover` writes `.ai/knowledge/project-conventions.md` with a managed
  marker and concise detected conventions.
- `ace discover --stdout` prints without writing, and `--json` prints parseable
  metadata.
- Router, install, hub, MCP, README, schema docs, and tests cover the new
  shipped command and memory file.
- Package version is `2.2.0`.

## Completion Checklist
- [ ] Goal completed
- [ ] Always: summarize what changed in `.ai/session-handoff.md`
- [ ] Always: update `.ai/changed-files.md`, record verification, and run project-owned `ace:validate`
- [ ] Always: state publish/deploy decision when relevant
- [ ] If standard/large: add product, architecture, security, and code-quality review notes
- [ ] If large/high-risk: confirm design approach, add useful reflection, and let `ace finish` archive the snapshot
- [ ] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [ ] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [ ] `ace finish` passed and generated reports

# --- FILE: .ai/state/session-handoff.md ---

# Session Handoff

## Last Update
2026-06-16 12:33

## What Was Done
- Implemented `ace discover` as a deterministic local project conventions
  scanner for `ace-pack@2.2.0`.
- Added `.ai/knowledge/project-conventions.md` with
  `.ai/project-conventions.md` as a legacy read alias.
- Wired discover into the ACE router, installer-managed scripts, hub context,
  MCP resources, README surfaces, schema docs, roadmap, smoke tests, and
  focused unit tests.
- Bumped package version from `2.1.0` to `2.2.0`.

## Current State
- `ace discover` writes a concise ACE-managed conventions registry with
  `<!-- ace-discover:managed -->`.
- Existing human-written conventions files are preserved unless `--force` is
  used.
- `ace hub` includes project conventions in start, architect, and
  architect-lite contexts when the file exists.
- Release dry-run passed for `ace-pack@2.2.0`.
- Real npm publish was attempted, but npm returned `E404 Not Found ... or you
  do not have permission to access it`; registry latest remains `2.1.0`.

## Quality Review
Product Alignment:
- The feature addresses architectural drift by giving agents a local summary of
  existing UI, routing, logging, error-handling, package-layout, and persistence
  patterns.

Architecture:
- The scanner is a zero-dependency managed script using simple file, dependency,
  and import-string heuristics. It avoids AST parsing and keeps generated
  Markdown aggregated for LLM context safety.

Security:
- No AI providers, API keys, network calls, dependency installs, or external
  services were added. Discovery reads local files only and skips heavy
  generated directories.

Code Quality:
- Focused tests cover React/Tailwind, Go, FastAPI, overwrite protection,
  stdout/JSON behavior, concise output, router/install/hub/MCP integration, and
  release smoke coverage.

## Next Steps
- Fix npm auth/package permissions for ace-pack.
- Run `npm.cmd run release:npm`.
- Verify `npm.cmd view ace-pack version` returns `2.2.0`.

## Known Issues
- None known for the v2.2.0 candidate.

## Verification
- `npm.cmd run ace -- classify` passed before implementation; the clean
  worktree detected as `small`, but the shipped command scope is treated as
  large.
- Focused Vitest passed: 7 files, 54 tests.
- `npm.cmd run test` passed: 16 files, 123 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS projects.
- `npm.cmd run check:npm-payload` passed and checked 35 packed files.
- `npm.cmd run release:npm:dry` passed for `ace-pack@2.2.0`.
- `npm.cmd run ace -- gate` passed with tier `large`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed with no created or
  updated installed files.
- `npm.cmd run ace:validate` passed after closeout updates: 16 files,
  123 tests.
- `npm.cmd run release:npm` failed at publish with npm `E404` permission/package
  access error.
- `npm.cmd view ace-pack version` still returns `2.1.0`.
- `npm.cmd run ace -- check` passed after blocked-publish memory updates.
- `npm.cmd run ace -- brief` regenerated `.ai/generated/report-brief.md`.
- Final `npm.cmd run ace -- gate` passed with tier `large`.

## Notes
- NPM publish: required before final release; blocked by npm permission.

# --- FILE: .ai/state/changed-files.md ---

# Changed Files

[package.json]
- Bumped `ace-pack` to `2.2.0` for the shipped `ace discover` feature.

[scripts/ace-discover.mjs]
- Added deterministic local Project Conventions discovery with managed-marker
  overwrite protection, concise Markdown output, `--stdout`, `--json`,
  `--root`, and `--force`.

[scripts/ace-cli.mjs, scripts/ai-memory-utils.mjs, scripts/ace-hub.mjs, scripts/ace-mcp-server.mjs]
- Registered discover routing, project conventions memory aliases, optional hub
  inclusion, and the read-only MCP resource.

[scripts/ace-uninstall-utils.mjs, install/tests]
- Added `ace-discover.mjs` to installed managed scripts and covered install,
  router, hub, MCP, smoke, and discover behavior.

[README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md]
- Documented Project Conventions Discovery, CLI usage, schema compatibility,
  hub/MCP integration, and v2.2 roadmap status.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, product roadmap,
  durable decision, work log, generated context, and brief report for v2.2.0
  release work.

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
