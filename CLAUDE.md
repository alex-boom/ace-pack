> [!WARNING]
> **META-ARCHITECTURE WARNING:** This repository BUILDS the ACE product, but also USES ACE locally. If you are instructed to modify ACE behavior for users, edit the product source and templates in `scripts/`. Do not edit this local `AGENTS.md`, `CLAUDE.md`, or `.ai/**` to change global product behavior.

# CLAUDE.md

## Repository Rules

`AGENTS.md` is the authoritative source for repository constraints, stack
choices, architecture rules, and quality gates. Read it first in every session.
Read `DEVELOPING.md` before changing package behavior; it separates shipped ACE
product files from repo-local dogfooding memory.

## Startup Workflow

After reading `AGENTS.md`, read:

1. `.ai/report-brief.md` if available for compact context.
2. `.ai/current-task.md`
3. `.ai/session-handoff.md`
4. `.ai/decisions.md`
5. `.ai/changed-files.md`
6. Recent unresolved entries in `.ai/reflection-log.md`

Read `.ai/work-log.md` only when you need additional history for the current
task.

## Working Rules

- Prefer minimal diffs over rewrites.
- Preserve existing TypeScript, UI, and API contracts unless the task says
  otherwise.
- Use `npm run ace:classify` to select the adaptive task tier when `pnpm` is
  unavailable on PATH.
- Run `npm run ace:onboard -- --apply` after fresh installation in an unfamiliar project
  before trusting project-specific risk rules.
- On Windows PowerShell in this repository, use `npm.cmd run ace:classify`,
  `npm.cmd run ace:validate`, and similar commands if script execution policy
  blocks the regular `npm` shim.
- For large or high-risk standard tasks, complete `.ai/current-task.md`
  Business Value and Technical Approach before writing code.
- Treat `.ai/*` as the current source of task context and handoff state.
- Before publishing shipped package changes, bump `package.json` version with
  semver. Do not bump solely for repo-local dogfooding files excluded from npm.
- Use `YYYY-MM-DD HH:mm` timestamps in `.ai/session-handoff.md`,
  `.ai/work-log.md`, `.ai/reflection-log.md`, and `.ai/decisions.md`.

## End-of-Task Routine

Run `npm run ace:validate`, fix failures, then run `npm run ace:finish` after
updating the relevant `.ai/*` files. The finish script validates the
required closeout depth for the detected task tier and generates the
appropriate reports.
