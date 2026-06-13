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
