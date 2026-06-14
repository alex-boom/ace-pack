# ACE Hub Context
- Mode: architect (AI Architect Context)
- Generated: 2026-06-14T08:24:51.939Z
- Included files: AGENTS.md, .ai/tech-docs.md, .ai/decisions.md, .ai/product-roadmap.md, .ai/report-brief.md
- Missing optional files: none

# --- FILE: AGENTS.md ---

> [!WARNING]
> **META-ARCHITECTURE WARNING:** This repository BUILDS the ACE product, but also USES ACE locally. If you are instructed to modify ACE behavior for users, edit the product source and templates in `scripts/`. Do not edit this local `AGENTS.md`, `CLAUDE.md`, or `.ai/**` to change global product behavior.

# AGENTS.md

Repository rules for AI coding agents working in this project.

## Project Rules

- Read `DEVELOPING.md` before changing package behavior. It defines the
  boundary between shipped ACE product files and repo-local dogfooding memory.
- Read `ROADMAP.md` before product or architecture changes. Preserve the
  anti-goals, zero-bloat constraints, and explicit AI opt-in policy.
- This package supports npm-based local workflow commands. If `pnpm` is not on
  PATH, use `npm run ace:check`, `npm run ace:classify`, `npm run ace:finish`,
  and related `npm run ace:*` scripts.
- The active default Node on this machine may be older than the package engine.
  Use the currently selected Node version for simple repo inspection, but
  switch through nvm to any installed Node `>=20` before running Vitest,
  payload checks, or npm publish flows. Do not hardcode a local Node executable
  path in repo scripts or instructions.
- For npm publishing, use `npm run preview:npm` and `npm run publish:npm` so
  the staged package uses `README.npm.md` and `logo-npm.svg`.
- Versioning policy: before publishing any change that affects the shipped
  package payload or user-visible ACE behavior, bump `package.json` version
  with semver. Use `patch` for fixes/docs in the published payload, `minor` for
  new backward-compatible behavior, and `major` for breaking CLI/template
  changes. Do not bump solely for repo-local dogfooding files excluded from npm
  such as `.ai/**`, `AGENTS.md`, `CLAUDE.md`, `DEVELOPING.md`, or `ROADMAP.md`.
- NPM publish decision: after every task, explicitly tell the maintainer
  `NPM publish: required` or `NPM publish: not required`, with the reason.
  Publish is required only when the staged npm payload or user-visible installed
  ACE behavior changes. GitHub-only docs, local `.ai/**` memory, `AGENTS.md`,
  `CLAUDE.md`, `DEVELOPING.md`, `ROADMAP.md`, `.vscode/**`, `.local/**`, and
  `tools/**` changes do not require npm publish by themselves.

<!-- agent-memory-workflow:start -->
## ACE (Agentic Context Engine) Workflow

ACE is the local automation framework for managing AI context, code quality,
and decision history. Use this workflow on top of the repo rules above;
`AGENTS.md` remains the authoritative source for stack, architecture, and
quality constraints.

Before starting work:

1. Read `AGENTS.md` first.
2. If available, read `.ai/report-brief.md` first for a compact summary,
   including recent unresolved reflections.
3. Treat `.ai/*` as authoritative and read `.ai/current-task.md`,
   `.ai/session-handoff.md`, `.ai/decisions.md`, and
   `.ai/changed-files.md` when you need detail or verification.
4. Run `pnpm ace:classify` before implementation to identify whether the
   task is small, standard, or large.
5. If this is a newly installed or unknown project and `.ai/memory-config.json`
   is still marked `unprofiled`, run `pnpm ace:onboard` and apply an
   approved profile before implementation.
6. For large tasks, and standard tasks with high-risk signals, complete the
   `.ai/current-task.md` Business Value and Technical Approach sections before
   writing code. Compare at least two viable patterns and choose explicitly.
7. Read `.ai/work-log.md` only when you need extra historical context.
8. If the memory files are missing, run `pnpm ace:init`.

Command note: examples use `pnpm`. On Windows PowerShell, use
`pnpm.cmd ace:classify`, `pnpm.cmd ace:validate`, and similar commands if
the `pnpm` shim is blocked by execution policy.

Legacy commands such as `pnpm ai:task:classify`, `pnpm ai:task:finish`,
and `pnpm agent-memory:init` remain supported for compatibility.

While working:

- Prefer minimal, safe diffs that preserve existing UI and API contracts.
- Do not rewrite large components or architecture unless the task requires it.
- Keep `.ai/current-task.md` aligned with the active task when scope changes.
- Keep project-specific tier and risk rules in `.ai/memory-config.json`, the
  canonical ACE config, not inside the scripts, so the toolset remains
  portable.
- Use `pnpm ace:onboard` to generate `.ai/project-profile.md` and
  recommended project-specific risk rules when ACE is installed into an
  unfamiliar repo.
- When updating `.ai/session-handoff.md`, `.ai/work-log.md`,
  `.ai/reflection-log.md`, or `.ai/decisions.md`, use timestamps in
  `YYYY-MM-DD HH:mm` format.
- Keep `.ai/current-task.md`, `.ai/session-handoff.md`,
  `.ai/reflection-log.md`, and `.ai/changed-files.md` compact.
- Archive only `.ai/work-log.md`, `.ai/reflection-log.md`, and
  `.ai/decisions.md` into `.ai/archive/` when they grow past the documented
  thresholds.
- Use `.ai/current-task.md` lifecycle fields for task/version transitions.
  When a large task version is complete, mark its completion checklist and let
  `pnpm ace:finish` archive a final snapshot.

After completing a task:

1. Update the authoritative `.ai/*` files directly or through
   `ai:update:*` helpers.
2. Run `pnpm ace:validate` and fix any mechanical quality gate failures.
3. Run `pnpm ace:finish` to validate the adaptive closeout and generate
   reports.
4. Small tasks need compact handoff, changed-files, work-log, and brief report.
5. Standard tasks also need product, architecture, security, and code-quality
   review notes.
6. Large tasks also need design review, reflection entry when useful, archive
   snapshot, full report, and a review of `.ai/tech-docs.md` or
   `.ai/product-roadmap.md` when technical or business state changed.
<!-- agent-memory-workflow:end -->

# --- FILE: .ai/tech-docs.md ---

# Technical Docs

Use this file as the project-agnostic technical context source for ACE.
Keep it high-signal so browser-based AI architects can understand the system
without reading large implementation files.

## Architecture
- ACE is a scaffold CLI package. Consumers run `ace-pack init`; the package
  copies local scripts and Markdown memory into the target repository.
- Shipped product behavior lives in `install-ace-pack.mjs`,
  `install-agent-memory-pack.mjs`, root command shims, and `scripts/*.mjs`.
- Repo-local dogfooding state lives in `AGENTS.md`, `CLAUDE.md`, and `.ai/**`;
  those files are excluded from the npm payload.
- Report generation is deterministic and local. `ai-report-brief.mjs` and
  `ai-report.mjs` read Markdown memory, use helpers from
  `ai-memory-utils.mjs`, and write `.ai/report-brief.md` /
  `.ai/report-full.md`.
- `ace:hub` builds focused context payloads in `.ai/generated-context.md`.
  Numeric options remain compatible, and named modes now cover start/coder,
  architect, handoff, PR, business, and docs contexts. AI Coder Context starts
  with `.ai/report-brief.md` when available so new chats see the Start Snapshot
  first, but fresh repos still work before the first report is generated.
- `ace:onboard` performs a bounded local file scan and package/content signal
  scan to recommend conservative repository-specific risk rules. It writes
  `.ai/project-profile.md` and `.ai/memory-config.recommended.json`, and applies
  those rules to `.ai/memory-config.json` only when invoked with `--apply`.

## Data Model / DB Schema
- Durable state is plain Markdown under `.ai/**` plus JSON configuration in
  `.ai/memory-config.json`.
- Task lifecycle state is stored in `.ai/current-task.md`.
- Handoff state, next steps, verification, and publish decisions are stored in
  `.ai/session-handoff.md`.
- Report Start Snapshot values are generated from local git state and existing
  Markdown sections; no new persistent schema fields were added for `0.1.7`.
- Onboarding profile output includes detected ecosystems, a concise
  `Why Detected` signal summary, repository shape, recommended high-risk paths,
  and recommended high-risk keywords. The memory config schema remains version
  `1` for `0.2.0`.
- Hub output includes a generated metadata header with mode, timestamp, included
  files, and missing optional files. PR mode also includes local git status and
  diff stat, degrading to `unknown` when git is unavailable.

## Auth, RBAC, and Security
- ACE has no authentication layer and does not manage user credentials.
- Core workflows must not make hidden AI, SaaS, registry, or network calls.
- `0.1.7` report snapshots use local git commands only and degrade to
  `unknown` if git is unavailable or the target is not a git repository.
- Publish-secret handling is outside ACE scripts; release commands delegate to
  the user's configured npm environment.

## External APIs and Integrations
- Core ACE scripts use Node.js built-ins and local git commands.
- npm is used only by maintainer-invoked package scripts such as
  `release:npm`, `release:npm:dry`, `check:npm-payload`, and `preview:npm`.
- Future AI-assisted documentation generation remains explicit opt-in per
  `ROADMAP.md`; default provider behavior is `off`.

## DevOps and Quality Gates
- Use `npm.cmd test` for Vitest on Windows.
- Use `npm.cmd run ace:check` for ACE memory validation.
- Use `npm.cmd run check:npm-payload` to verify the staged npm tarball excludes
  repo-local dogfooding files.
- Use `npm.cmd run release:npm:dry` before telling the maintainer to publish.
- Publish with `npm.cmd run release:npm` only when the staged npm payload or
  installed ACE behavior changed.

# --- FILE: .ai/decisions.md ---

# Decisions

## 2026-06-13 20:59

Decision:
- Initialize this repository with its own local ACE installer instead of
  hand-writing the memory scaffold.

Reason:
- The repository should validate the same init path that package consumers use,
  and future chats need project state stored in files rather than conversation
  history.

Impact:
- `AGENTS.md`, `CLAUDE.md`, `.ai/*`, and additive `ace:*` package scripts are
  now part of the project workflow.

## 2026-06-13 21:19

Decision:
- Keep the ACE product layer and repo-local ACE dogfooding layer explicitly
  labeled in committed documentation and agent instruction files.

Reason:
- This repository builds ACE while also using ACE locally, so fork maintainers
  and AI agents need a first-context warning that global product behavior lives
  in `scripts/*`, not local `.ai/**` state.

Impact:
- `AGENTS.md` and `CLAUDE.md` start with a meta-architecture warning.
- `DEVELOPING.md` and `.ai/README.md` document file ownership boundaries.
- `npm run check:npm-payload` protects the published package from local AI
  history, reports, and archive snapshots.

## 2026-06-13 21:19

Decision:
- Require a semver bump before publishing shipped package changes, but do not
  require a bump for repo-local dogfooding-only files excluded from npm.

Reason:
- npm rejects republishing the same version, and consumers need version changes
  to discover package updates. Pure `.ai/**`, `AGENTS.md`, `CLAUDE.md`, and
  `DEVELOPING.md` changes do not ship in the npm payload, so bumping for those
  alone creates noisy releases.

Impact:
- Future agents should check whether a change affects the npm payload or
  user-visible ACE behavior before publishing.
- Use patch for fixes/docs/packaging, minor for backward-compatible features,
  and major for breaking CLI/template/workflow changes.

## 2026-06-13 21:35

Decision:
- Publish the npm keyword SEO update as patch version `0.1.4`.

Reason:
- Keyword metadata is part of the shipped npm payload and affects package
  discoverability, but it does not change CLI behavior or installed templates.

Impact:
- `package.json` now uses targeted AgentOps and AI engineering keywords.
- No code behavior, README copy, or lockfile changes are required for this
  metadata release.

## 2026-06-13 21:42

Decision:
- Keep Node guidance generic and never hardcode a maintainer-local Node
  executable path in repo scripts or instructions.

Reason:
- Maintainers may switch between Node versions with nvm. The package only needs
  a semantic runtime requirement, not a path to one developer's local install.

Impact:
- `package.json` keeps the public `node >=20` engine requirement.
- Tests, payload checks, and publish flows should run under any active
  nvm-selected Node version satisfying `>=20`.

## 2026-06-13 22:25

Decision:
- Make npm release verification npm-first and Windows-safe.

Reason:
- VS Code and Git Bash may invoke package scripts through `pnpm`, but the release
  pipeline itself publishes to npm and should not rely on pnpm-specific behavior.
  Directly spawning `npm.cmd` from Node can fail on Windows with `spawn EINVAL`.

Impact:
- `release:npm:dry` now verifies payload guard, `npm pack --dry-run`, and
  `npm publish --dry-run`.
- Windows npm subprocesses inside tooling route through `cmd.exe` with a
  relative `.npm-publish` path.
- VS Code tasks and local helpers call `npm.cmd` explicitly for predictable
  Windows behavior.

## 2026-06-13 22:28

Decision:
- Publish vibe coding positioning as patch version `0.1.5`.

Reason:
- `vibe-coding` is part of the shipped npm metadata and README positioning, so
  it affects package discoverability without changing CLI behavior.

Impact:
- `package.json` includes the `vibe-coding` keyword.
- GitHub and npm README surfaces explain ACE as a memory and guardrail layer for
  scaling natural-language coding beyond small scripts.

## 2026-06-13 23:05

Decision:
- Treat `ROADMAP.md` as the GitHub-only strategic compass for ACE.

Reason:
- Future human and AI contributors need a durable source of product direction,
  anti-goals, minimalism constraints, and long-term research seeds without
  relying on chat history.

Impact:
- Product and architecture changes should preserve the roadmap anti-goals:
  local-first, zero-lock-in, zero-bloat, no hidden AI calls, no SaaS
  requirement, no prompt-library positioning, and no IDE/model lock-in.
- `ROADMAP.md` stays excluded from npm payload unless a future release
  intentionally changes that boundary.

## 2026-06-13 23:05

Decision:
- Future AI-assisted documentation generation must be explicit opt-in.

Reason:
- Hidden local or cloud AI calls can leak code, violate corporate privacy
  policy, consume unexpected tokens, drain batteries, or block the developer
  workflow.

Impact:
- The default provider is `off`.
- Optional local providers such as Ollama or llama.cpp are privacy/cost
  optimizations, not baseline dependencies.
- Optional cloud providers require explicit repo-owned config, API keys, and a
  privacy decision.
- Missing, invalid, unavailable, or timed-out providers must fail open into the
  existing manual or active-agent-assisted Markdown closeout workflow.

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

## 2026-06-14 01:26

Decision:
- Improve ACE closeout prioritization through shipped templates only, not new
  `ace:finish` enforcement logic.

Reason:
- Different AI agents over-close tasks in different ways when presented with a
  flat wall of rules. A priority ladder gives universal guidance while avoiding
  new blockers, schemas, parsers, or code written for ceremony.

Impact:
- Installed AGENTS, CLAUDE, current-task, and handoff templates now emphasize
  the smallest closeout that preserves future agent context and project safety.
- Future changes should add stricter closeout gates only when there is a real
  safety or handoff failure that template guidance cannot solve.

## 2026-06-14 10:59

Decision:
- Implement v0.2 onboarding by extending the existing `ace:onboard` scanner
  instead of adding a second preset engine or new CLI flow.

Reason:
- The current scanner already has the right zero-dependency shape. Extending its
  rules, signal explanation, and terminal summary gives users the first-run
  value without adding runtime bloat or command complexity.

Impact:
- `ace:onboard` now detects broader JS/TS, Python, Go, Rust, .NET, and monorepo
  signals while keeping `.ai/memory-config.json` schema version `1`.
- Future onboarding improvements should continue using conservative path rules
  and explicit signal summaries before considering new config or preset layers.

## 2026-06-14 11:13

Decision:
- Implement v0.3 Hub UX by extending `ace:hub` with named modes and output
  controls instead of adding a new top-level `ace` router, clipboard
  integration, MCP adapter, or dependency-backed UX layer.

Reason:
- The roadmap goal is daily context generation, not a broader command platform.
  Extending the existing local script gives agents focused payloads while
  preserving zero-dependency, Markdown-first behavior.

Impact:
- `ace:hub` now supports start/coder, architect, handoff, PR, business, and
  docs contexts with metadata headers and PR git summaries.
- Future command consolidation can build on the stable hub modes after real
  usage proves which flows deserve first-class routing.

# --- FILE: .ai/product-roadmap.md ---

# Product Roadmap

Use `ROADMAP.md` as the full strategic compass. Keep this file concise for AI
handoff and browser-context workflows.

## Business Goals

- Make ACE the standard local AgentOps control layer for vibe coding.
- Preserve the product promise: "Vibe coding that survives real repositories."
- Keep ACE local-first, Markdown-first, zero-lock-in, and zero-bloat.
- Give teams memory, guardrails, and closeout discipline for AI-generated code.

## Anti-Goals

- Do not make ACE an AI agent that writes code.
- Do not require Cloud, SaaS, GPUs, local LLMs, or cloud API keys.
- Do not lock ACE to one IDE, model provider, LLM, or agent vendor.
- Do not add heavy runtime dependencies.
- Do not reduce ACE to a prompt library.

## Completed Epics

- **ACE dogfooding foundation.** The ACE repository now uses ACE memory,
  handoff, reports, and payload guards while preserving the product-vs-local
  boundary.
- **Vibe coding positioning.** README and npm metadata now position ACE as the
  memory and guardrail layer for natural-language coding in real repositories.
- **New-chat start snapshot.** Brief/full reports now expose branch, worktree
  state, task lifecycle, next command, and publish decision; AI Coder hub
  context starts with the brief report.
- **Closeout priority ladder.** Installed workflow templates now tell agents to
  close tasks by priority, preserving future context and safety without
  ceremony.
- **v0.2 onboarding scanner.** `ace:onboard` now recognizes broader JS/TS,
  Python, Go, Rust, .NET, and monorepo signals, explains why each ecosystem was
  detected, and prints a concise terminal summary.
- **v0.3 ACE Hub primary UX.** `ace:hub` now provides focused start/coder,
  architect, handoff, PR, business, and docs context modes with metadata
  headers and local PR git summaries.

## Planned Features

- **v0.4: PR and CI Quality Gates.** Verify `.ai/**` state, design reviews,
  risk classification, and handoffs before merge. Prefer native hooks and CI
  templates over Husky-style stacks.
- **v0.5: Read-Only MCP Adapter.** Expose ACE memory to tools without moving
  the core away from Markdown and local scripts.
- **v1.0: Stable Schema and Compatibility.** Document stable file formats,
  migration rules, and backward compatibility guarantees.

## Long-Term Research and Development (v2.0+)

- **Standalone ACE Engine.** Research native binaries for macOS, Linux, and
  Windows so teams can use ACE without Node.js/npm on developer machines.
- **Automated PR/CI Reviewer.** Research GitHub Action and GitLab CI templates
  that inspect PR diffs, validate ACE memory, and publish concise review
  summaries.
- **Optional Offline Memory Generation.** Research Ollama or llama.cpp adapters
  for private local summaries, while keeping manual and active-agent-assisted
  Markdown closeout as the baseline.

## Explicit AI Opt-In Policy

- Default provider is always `off`.
- ACE must never make hidden local or cloud AI calls.
- Future auto-documentation providers must be explicit repo-owned config.
- Cloud providers require explicit API keys and team privacy approval.
- Local providers require explicit local setup and may trade quality, speed, and
  battery life for privacy.
- Missing, invalid, unavailable, or timed-out providers must fail open into the
  manual or active-agent-assisted Markdown workflow.

## Open Product Questions

- Which project presets should be prioritized after the existing SaaS monorepo
  preset work?
- Which CI providers should receive official templates first?

# --- FILE: .ai/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 11:22
- Freshness: Fresh
- Current task version: v1
- Current task tier: standard
- Source current-task: 2026-06-14 11:21
- Source session-handoff: 2026-06-14 11:21
- Verification level: test-backed

## Start Snapshot
- Branch: main
- Worktree: dirty (4 changed files)
- Last commit: 798023e Implement v0.3 ACE Hub as the primary UX, introducing named modes for context generation including start, architect, handoff, PR, business, and docs. Bump package version to 0.3.0 and enhance CLI with new flags for output control and metadata headers. Update documentation to reflect changes and mark v0.3 as shipped in the roadmap.
- Task: complete (tier: standard, version: v1, ready for archive: yes)
- Next command: No command detected
- Release decision: NPM publish: not required

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v0.3 ACE Hub Primary UX

## Lifecycle
Status: complete
Version: v1
Task Tier: standard
Design Review Required: no
Started: 2026-06-14 11:03
Ready For Archive: yes

## Goal
Make `ace:hub` the primary daily context launcher for agents and humans while
preserving the existing numeric menu options and zero-dependency local design.

## Business Value
v0.3 reduces prompt fatigue by letting developers generate focused start,
architect, handoff, PR, business, and docs context without manually opening and
copying multiple `.ai/*` files.

## Current Status
- [x] Plan approved for v0.3 ACE Hub Primary UX.
- [x] Bumped package version to `0.3.0`.
- [x] Added named hub modes: `start`, `coder`, `architect`, `handoff`, `pr`,
  `business`, and `docs`.
- [x] Added `--list`, `--mode`, `--stdout`, `--output`, and `--json` CLI UX.
- [x] Added metadata headers and PR git summary fallback behavior.
- [x] Updated GitHub/npm README hub documentation.
- [x] Added hub tests for numeric compatibility, named modes, CLI flags,
  missing files, and PR git summary behavior.
- [x] Ran release verification.
- [x] Published `ace-pack@0.3.0` to npm and committed the v0.3 release.

## Next Steps
- v0.3 is released. Next planning target: v0.4 PR and CI Quality Gates.

## Risks / Blockers
- None for the v0.3 release closeout.

## Verification
- `npm.cmd run ace:classify` passed before implementation.
- `npm.cmd test` passed: 7 files, 58 tests.
- `npm.cmd run ace:check` passed.
- `npm.cmd run check:npm-payload` passed and checked 27 packed files.

## Recent Decision
## 2026-06-14 11:13

Decision:
- Implement v0.3 Hub UX by extending `ace:hub` with named modes and output
  controls instead of adding a new top-level `ace` router, clipboard
  integration, MCP adapter, or dependency-backed UX layer.

Reason:
- The roadmap goal is daily context generation, not a broader command platform.
  Extending the existing local script gives agents focused payloads while
  preserving zero-dependency, Markdown-first behavior.

Impact:
- `ace:hub` now supports start/coder, architect, handoff, PR, business, and
  docs contexts with metadata headers and PR git summaries.
- Future command consolidation can build on the stable hub modes after real
  usage proves which flows deserve first-class routing.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `.ai/session-handoff.md`
- `.ai/current-task.md`
- `.ai/report-brief.md`
- `.ai/report-full.md`
- `.ai/report-full.xml`

## Overall Progress
- Completion checklist: 6/6
- Source of truth: `.ai/*` files remain authoritative.
