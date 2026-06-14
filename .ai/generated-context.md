# ACE Hub Context
- Mode: architect (AI Architect Context)
- Generated: 2026-06-14T11:40:38.151Z
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
  architect-lite/plan, architect, handoff, PR, business, and docs contexts.
  AI Coder Context starts with `.ai/report-brief.md` when available so new chats
  see the Start Snapshot first, but fresh repos still work before the first
  report is generated.
- `ace:onboard` performs a bounded local file scan and package/content signal
  scan to recommend conservative repository-specific risk rules. It writes
  `.ai/project-profile.md` and `.ai/memory-config.recommended.json`, and applies
  those rules to `.ai/memory-config.json` only when invoked with `--apply`.
- `ace:gate` is the optional PR/CI quality gate. It reuses ACE memory
  validation, task classification, finish requirements, and shared Markdown
  helpers instead of maintaining a second policy engine. v0.4.1 keeps strict
  Quality Review enforcement for large or high-risk changes, but lets standard
  low-risk changes pass without review ceremony. v1.1 keeps `ace:gate`
  consistent with `ace:finish` so small low-risk changes do not require
  Business Value, Quality Review, or Verification ceremony.
- `ace:finish` can auto-close small low-risk changes by writing compact
  handoff, changed-files, work-log, and brief report updates from deterministic
  local git/classification data. It does not change `.ai/current-task.md`
  lifecycle and still keeps stricter closeout for standard, large, high-risk,
  and design-review-required work.
- `ace-pack init` creates optional IDE rule bridges for `.cursorrules`,
  `.windsurfrules`, and `.github/copilot-instructions.md` when missing. These
  files are package-manager-aware pointers back to `AGENTS.md` and local
  `ace:*` scripts; existing project-owned IDE rule files are not overwritten.
- `ace-mcp-server.mjs` is the optional read-only MCP stdio adapter. It exposes
  selected ACE Markdown files through `resources/list` and `resources/read`,
  with no tools, writes, SDK dependency, network listener, or npm-script wrapper.
- Product growth materials live outside runtime code. `docs/demo-script.md`,
  `docs/launch-copy.md`, and `examples/context-loss-demo/**` support demos and
  launch work, while README/README.npm provide only the concise entry point.
- v1.0 stability documentation lives in `docs/schema-compatibility.md`. It
  defines stable command names, installed file expectations, Markdown section
  expectations, `.ai/memory-config.json` schema version `1`, and migration
  policy.
- v1.0.1 adoption documentation lives in `docs/adoption-checklist.md` and
  `docs/faq.md`. These are GitHub-only rollout aids linked from README surfaces,
  not installed workflow or runtime behavior.
- Release-readiness tooling lives in `tools/`. `smoke:fake-project` builds the
  local staged package and validates ACE inside disposable JS and non-JS
  projects. `dogfood:self-check` explicitly reapplies the local candidate to
  this repository after checking git state.

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
- Gate output is ephemeral CLI output or optional JSON. No new persistent config
  or memory schema fields were added for `0.4.0` or `0.4.1`.
- v1.1 IDE bridges and `architect-lite` are additive optional behavior, not new
  required schema fields or validation requirements.
- MCP output is ephemeral JSON-RPC over stdio. No new persistent config,
  schema fields, or generated memory files were added for `0.5.0`.
- v0.6 growth-kit output is static documentation and demo fixtures only. No
  persistent ACE schema, config fields, generated files, or installed workflow
  files were added.
- v1.0 keeps `.ai/memory-config.json` at schema version `1`. Unknown config
  fields are tolerated by readers, string rules remain compatible, and missing
  thresholds fall back to defaults.
- Smoke and dogfood readiness output is ephemeral. The tools do not add config
  files or schema fields.

## Auth, RBAC, and Security
- ACE has no authentication layer and does not manage user credentials.
- Core workflows must not make hidden AI, SaaS, registry, or network calls.
- `0.1.7` report snapshots use local git commands only and degrade to
  `unknown` if git is unavailable or the target is not a git repository.
- `0.4.0` gate checks use local git commands only. GitHub Actions workflow and
  pre-push hook files are generated only when explicitly requested.
- `0.4.1` human override requires a reason and surfaces that reason in CLI/JSON
  output; it does not hide failures or create persistent policy state.
- `0.5.0` MCP support is read-only resources only. The adapter omits missing
  files from resource discovery and performs no repository writes.
- `0.6.0` marketing/demo materials are excluded from the npm payload through the
  package file list and payload guard; they do not run automatically.
- `1.0.0` compatibility guarantees are documentation and tests around existing
  behavior; no migration engine, network behavior, or automatic writes were
  added.
- `1.0.1` adoption docs add no runtime behavior and remain outside the npm
  payload except for README links.
- Dogfood self-check refuses dirty git worktrees by default and stops when
  unexpected files change after candidate self-apply.
- Publish-secret handling is outside ACE scripts; release commands delegate to
  the user's configured npm environment.

## External APIs and Integrations
- Core ACE scripts use Node.js built-ins and local git commands.
- MCP clients should run `node ./scripts/ace-mcp-server.mjs` directly from the
  target repository. Do not wrap the stdio adapter with `npm run`, because npm
  lifecycle output can corrupt JSON-RPC stdout framing.
- npm is used only by maintainer-invoked package scripts such as
  `release:npm`, `release:npm:dry`, `check:npm-payload`, and `preview:npm`.
- Future AI-assisted documentation generation remains explicit opt-in per
  `ROADMAP.md`; default provider behavior is `off`.

## DevOps and Quality Gates
- Use `npm.cmd test` for Vitest on Windows.
- Use `npm.cmd run ace:check` for ACE memory validation.
- Use `npm.cmd run ace:gate` for optional PR/CI quality gate validation.
- Use `npm.cmd run smoke:fake-project` to validate the local staged package in
  disposable projects before final release.
- Use `npm.cmd run release:ready` for the full pre-final-release sequence:
  tests, fake-project smoke, `ace:gate`, payload guard, and npm dry-run.
- Use `npm.cmd run dogfood:self-check` only during an explicit reviewed
  release-readiness pass on a clean or intentionally accepted worktree.
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

## 2026-06-14 11:40

Decision:
- Implement v0.4 quality gates as a thin `ace:gate` orchestration layer that
  reuses existing ACE memory validation, task classification, finish
  requirements, and shared Markdown helpers.

Reason:
- PR/CI gates must stay consistent with local ACE workflow. Duplicating
  Markdown parsing or risk policy would create drift and make CI failures less
  trustworthy.

Impact:
- `ace:gate` now provides optional local/CI governance with actionable failure
  messages, PR refs, JSON output, GitHub Actions workflow generation, and safe
  pre-push hook installation.
- Future CI providers should build on the same gate command instead of adding
  provider-specific policy engines.

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

## 2026-06-14 12:22

Decision:
- Tune `ace:gate` for DevEx by allowing standard low-risk changes without
  Quality Review and adding explicit human override with a required reason.

Reason:
- PR/CI gates should prevent risky AI-assisted merges, not punish humans for
  small safe edits. A visible override keeps accountability without encouraging
  users to delete hooks or disable ACE.

Impact:
- Strict gate review remains for large tasks and high-risk matches.
- `ace:gate -- --human-override <reason>` records intentional bypasses in CLI
  and JSON output.
- `ace:finish` closeout requirements remain unchanged.

## 2026-06-14 12:56

Decision:
- Implement v0.5 MCP support as a read-only stdio resource adapter using Node
  built-ins, without adding an MCP SDK, tools, writes, network listeners, or an
  npm wrapper script.

Reason:
- MCP is useful for letting tools inspect ACE memory, but the core product
  promise is still zero-dependency, local-first, Markdown-first behavior.
  Running through `npm run` can also print lifecycle text to stdout and break
  stdio JSON-RPC framing.

Impact:
- Consumers can configure MCP clients to run
  `node ./scripts/ace-mcp-server.mjs` directly in their repository.
- The adapter exposes selected `.ai/*` Markdown files as resources only.
- Future MCP expansion should preserve the resource-only boundary unless a
  separate optional package is deliberately introduced.

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

## 2026-06-14 13:37

Decision:
- Promote ACE to v1.0 by documenting and testing the existing compatibility
  contract instead of adding a migration engine before a real schema migration
  exists.

Reason:
- ACE's current stability comes from additive install behavior, project-owned
  Markdown memory, stable command names, and schema version `1`. A migration
  platform would add code and ceremony without a concrete schema change to
  execute.

Impact:
- `docs/schema-compatibility.md` defines stable commands, file expectations,
  Markdown sections, memory-config v1 behavior, and future migration policy.
- Regression tests protect installed-repo compatibility and legacy aliases.
- Future schema v2 work must document the reason, add deterministic migration
  behavior, and include old-repo fixture tests.

## 2026-06-14 14:34

Decision:
- Implement v1.1 daily DevEx polish as additive runtime behavior: small
  low-risk auto-closeout, finish/gate consistency, optional IDE bridges,
  `architect-lite` planning context, and warning-only freshness hints.

Reason:
- v1.0.1 solved adoption documentation, but daily use still had unnecessary
  ceremony for trivial edits and weak native IDE-agent onboarding. These issues
  can be solved without schema v2, dependencies, AI calls, or breaking CLI
  changes.

Impact:
- `ace:finish` and `ace:gate` now share the same small low-risk boundary.
- `ace-pack init` may create missing IDE bridge files but must not overwrite
  project-owned rule files.
- Memory consolidation, docs-only classify tuning, offline adoption docs, and
  mechanical classify-before-code enforcement remain deferred.

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
- **v0.4 PR and CI Quality Gates.** `ace:gate` now verifies ACE memory,
  risk classification, design/quality closeout, PR refs, and handoff
  verification, with opt-in GitHub Actions and native pre-push helpers.
  Release readiness now includes local fake-project smoke and explicit dogfood
  self-checks before final npm publish. v0.4.1 adds explicit human override and
  reduces gate friction for standard low-risk changes.
- **v0.5 Read-Only MCP Adapter.** ACE now exposes selected Markdown memory to
  MCP-capable tools through a zero-dependency stdio resource server. The adapter
  is read-only, exposes no tools, performs no writes, and keeps core ACE
  Markdown-first.
- **v0.6 Product Growth Kit.** README surfaces a 60-second demo path, while
  GitHub-only docs and examples provide a scriptable demo, launch copy, and a
  tiny context-loss fixture without adding runtime behavior or npm payload
  bloat.
- **v1.0 Stable Schema and Compatibility.** ACE now documents stable command
  names, installed file expectations, `.ai/memory-config.json` schema version
  `1`, AGENTS workflow markers, and migration policy, with regression tests for
  older installed repositories.
- **v1.0.1 Adoption Hardening.** ACE now has GitHub-only adoption checklist and
  FAQ docs linked from README surfaces, helping teams roll out ACE without new
  runtime behavior or npm payload bloat.
- **v1.1 Daily DevEx Runtime Polish.** ACE now reduces daily friction with
  small low-risk auto-closeout in `ace:finish`, matching `ace:gate` behavior,
  optional IDE rule bridges for Cursor, Windsurf, and GitHub Copilot, an
  `architect-lite` / `plan` hub mode, and warning-only freshness hints in
  `ace:check`.

## Planned Features

- No next v1.x feature is selected yet. Future work should preserve the v1.0
  compatibility contract unless a deliberate major-version migration is planned.

## Long-Term Research and Development (v2.0+)

- **Memory Consolidation and Schema v2 Research.** Research merging high-churn
  `.ai` files such as `current-task`, `session-handoff`, and `changed-files`
  into fewer state files to reduce token load and LLM desync, with deterministic
  migration rules before any schema change.
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
- Which CI provider should receive the next official template after GitHub
  Actions?

# --- FILE: .ai/report-brief.md ---

# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 14:40
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 14:38
- Source session-handoff: 2026-06-14 14:40
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (36 changed files)
- Last commit: f368325 Finalize v1.0.1 by confirming publication of `ace-pack@1.0.1` on npm and updating project documentation. Added future DevEx roadmap tracks for IDE rule bridging, zero-ceremony small tasks, and memory consolidation/schema v2 research. Closed the current product milestone, with no active implementation tasks remaining.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v1.1.0 Daily DevEx Runtime Polish

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 14:20
Ready For Archive: yes

## Goal
Reduce daily ACE friction after the v1.0.1 adoption release by making small
low-risk closeout lighter, bridging IDE-native agents into ACE rules, and
adding a lower-token planning context.

## Business Value
v1.1.0 makes ACE more comfortable as a daily driver. Teams keep the v1.0 safety
contract, while trivial edits need less ceremony and IDE agents are more likely
to start from the same repository protocol.

## Current Status
- [x] Bumped package version to `1.1.0`.
- [x] Added small low-risk auto-closeout in `ace:finish`.
- [x] Aligned `ace:gate` with relaxed small low-risk closeout.
- [x] Added optional IDE bridge files during `ace-pack init`.
- [x] Added `architect-lite` / `plan` hub mode.
- [x] Added warning-only freshness hints to `ace:check`.
- [x] Updated shipped templates, README surfaces, compatibility docs, roadmap,
  and tests.
- [x] Ran targeted and full Vitest suites.
- [x] Run release-readiness checks.
- [x] Run explicit dogfood self-check before final publish.

## Next Steps
- Run `npm.cmd run release:npm` when the maintainer is ready to publish ace-pack@1.1.0.
- After publish, verify npm latest with `npm.cmd view ace-pack version`.

## Risks / Blockers
- None known for v1.1.0 at this stage.

## Verification
- `npm.cmd test -- tests/ai-task-finish.test.ts tests/ace-quality-gate.test.ts tests/install-agent-memory-pack.test.ts tests/ace-hub.test.ts tests/agent-memory.test.ts tests/smoke-release.test.ts` passed: 6 files, 58 tests.
- `npm.cmd test` passed: 13 files, 103 tests.
- `npm.cmd run release:ready` passed: 13 files, 104 tests, fake-project smoke,
`ace:gate`, npm payload guard, and npm publish dry-run.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed after adding IDE
bridge files to the expected dogfood sync allowlist.

## Recent Decision
## 2026-06-14 14:34

Decision:
- Implement v1.1 daily DevEx polish as additive runtime behavior: small
  low-risk auto-closeout, finish/gate consistency, optional IDE bridges,
  `architect-lite` planning context, and warning-only freshness hints.

Reason:
- v1.0.1 solved adoption documentation, but daily use still had unnecessary
  ceremony for trivial edits and weak native IDE-agent onboarding. These issues
  can be solved without schema v2, dependencies, AI calls, or breaking CLI
  changes.

Impact:
- `ace:finish` and `ace:gate` now share the same small low-risk boundary.
- `ace-pack init` may create missing IDE bridge files but must not overwrite
  project-owned rule files.
- Memory consolidation, docs-only classify tuning, offline adoption docs, and
  mechanical classify-before-code enforcement remain deferred.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `install-ace-pack.mjs`
- `.cursorrules`
- `.windsurfrules`
- `.github/copilot-instructions.md`
- `scripts/ai-task-finish.mjs`

## Overall Progress
- Completion checklist: 9/9
- Source of truth: `.ai/*` files remain authoritative.
