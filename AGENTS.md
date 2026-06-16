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
  PATH, use `npm run ace -- check`, `npm run ace -- classify`,
  `npm run ace -- finish`, and related `npm run ace -- <command>` router calls.
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

ACE v3 canonical memory is organized under `.ai/config`, `.ai/state`,
`.ai/knowledge`, and `.ai/generated`. Active task context lives in
`.ai/state/task-state.md`.

Before starting work:

1. Read `AGENTS.md` first.
2. If available, read `.ai/generated/report-brief.md` first for a compact
   summary, including recent unresolved reflections.
3. Treat `.ai/*` as authoritative and read `.ai/state/task-state.md` and
   `.ai/knowledge/decisions.md` when you need detail or verification.
4. Run `pnpm ace classify` before implementation to
   identify whether the task is small, standard, or large.
5. If this is a newly installed or unknown project and
   `.ai/config/memory-config.json` is still marked `unprofiled`, run
   `pnpm ace onboard` and apply an approved profile
   before implementation.
6. For large tasks, and standard tasks with high-risk signals, complete the
   `.ai/state/task-state.md` Business Value & Approach section before writing
   code. Compare at least two viable patterns and choose explicitly.
7. Read `.ai/knowledge/work-log.md` only when you need extra historical
   context.
8. If the memory files are missing, run `pnpm ace init`.

Command note: all ACE commands are routed through the single `ace` command.
Examples use `pnpm`: `pnpm ace finish`, `pnpm ace hub`, and
`pnpm ace check`. npm users must pass router arguments after `--`, such as
`npm run ace -- finish`. On Windows PowerShell, use `pnpm.cmd ace classify`
or `pnpm.cmd ace check` if the `pnpm` shim is blocked by execution policy.
`ace:validate` is the project-owned mechanical gate script for lint,
typecheck, tests, or equivalent project checks.

Legacy command names are supported only as router arguments, such as
`pnpm ace ai:task:classify`, `pnpm ace ai:task:finish`, and
`pnpm ace agent-memory:init`.

IDE rule files such as `.cursorrules`, `.windsurfrules`, and
`.github/copilot-instructions.md` are thin bridges into this workflow.
`AGENTS.md` remains authoritative.

While working:

- Prefer minimal, safe diffs that preserve existing UI and API contracts.
- Do not rewrite large components or architecture unless the task requires it.
- Keep `.ai/state/task-state.md` aligned with the active task when scope
  changes.
- Keep project-specific tier and risk rules in
  `.ai/config/memory-config.json`, the canonical ACE config, not inside the
  scripts, so the toolset remains portable.
- Use `pnpm ace onboard` to generate
  `.ai/config/project-profile.md` and recommended project-specific risk rules
  when ACE is installed into an unfamiliar repo.
- When updating task state, work-log, reflection-log, or decisions, use
  timestamps in `YYYY-MM-DD HH:mm` format.
- Keep `.ai/state/task-state.md` and `.ai/knowledge/reflection-log.md`
  compact.
- Archive only `.ai/knowledge/work-log.md`,
  `.ai/knowledge/reflection-log.md`, and `.ai/knowledge/decisions.md` into
  `.ai/archive/` when they grow past the documented thresholds.
- Use `.ai/state/task-state.md` lifecycle fields for task/version
  transitions.
  When a large task version is complete, mark its completion checklist and let
  `pnpm ace finish` archive a final snapshot.

After completing a task:

Do the smallest closeout that preserves future agent context and project
safety:

1. Always summarize what changed, update changed files, record verification,
   run project-owned `pnpm ace:validate`, and state publish/deploy decision when relevant.
   If release is deferred, say so explicitly.
2. For small low-risk tasks, `pnpm ace finish` auto-closes compact
   task-state, work-log, and brief report notes without manual ceremony.
3. For standard or large tasks, add product, architecture, security, and
   code-quality review notes.
4. For large or high-risk tasks, confirm the design approach, add reflection
   only when useful, and let `pnpm ace finish` archive the snapshot.
5. Update `.ai/tech-docs.md`, `.ai/product-roadmap.md`, durable decisions,
   or release notes only when those facts actually changed.
6. For release-bound shipped changes, run the project's local smoke and
   dogfood/self-check routines before final publish or deploy when available.
<!-- agent-memory-workflow:end -->
