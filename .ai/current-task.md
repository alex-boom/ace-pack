# Current Task

## Feature Name
Initialize ACE in this repository and mark dogfooding boundaries

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-13 20:59
Ready For Archive: yes

## Goal
Install ACE project memory and workflow files into the ACE package repository
itself so future agent sessions can recover project rules and release context
from the repo. Clearly separate the ACE product layer from this repository's
repo-local ACE dogfooding layer.

## Business Value / Product Alignment
The repository now carries its own agent instructions, memory, and handoff
discipline instead of depending on chat history. This makes future package,
README, and npm release work easier to resume.

## Technical Approach
Option 1:
- Manually create `.ai/*`, `AGENTS.md`, and scripts. This risks drifting from
  the package's own installer behavior.

Option 2:
- Run the local `install-ace-pack.mjs init . --apply` installer. This uses the
  same path consumers use and validates the package against itself.

Chosen Approach:
- Use the local installer with `--apply`, then run ACE and test checks. This is
  the least surprising path and keeps the repository aligned with shipped
  scaffold behavior.

## Current Status
- [x] Ran local ACE installer in the repository root.
- [x] Applied onboarding recommendations.
- [x] Verified `ace:check`, `ace:classify`, and tests.
- [x] Fixed report decision extraction so the latest durable decision appears in generated reports.
- [x] Added project-specific command notes for npm-based ACE usage when `pnpm` is unavailable.
- [x] Made XML report generation best-effort so Markdown reports still complete without `pnpm.cmd`.
- [x] Added top-level meta-architecture warnings to local agent instruction files.
- [x] Documented product-vs-dogfooding file ownership for fork maintainers.
- [x] Added repeatable npm payload guard to prevent repo-local ACE history from shipping.
- [x] Added versioning policy for publishable package changes.
- [x] Updated npm keywords for AgentOps SEO and bumped package version to 0.1.4.
- [x] Replaced local Node path/version hardcoding with generic active Node `>=20` guidance.

## Affected Areas
- `package.json`
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/**`
- `DEVELOPING.md`
- `README.md`
- `tools/check-npm-payload.mjs`
- `scripts/ai-memory-utils.mjs`
- `scripts/ai-report.mjs`
- `tests/ai-report.test.ts`

## Constraints
- Preserve existing package scripts and npm publish workflow.
- Do not overwrite source scripts or README/logo work outside ACE setup.
- Keep generated ACE files plain Markdown/JSON for future agent sessions.
- Prefer `npm run ace:*` commands in this repo when `pnpm` is not available on PATH.
- XML report generation should not block Markdown report generation or task closeout.
- Repo-local dogfooding files must stay excluded from the npm payload.
- Changes to ACE behavior for users belong in `scripts/*`, not local `.ai/**`.
- Bump `package.json` before publishing changes that affect shipped package
  payload or user-visible ACE behavior.
- Keep keyword updates metadata-only: do not change CLI behavior, templates, or README copy.
- Do not hardcode a maintainer-local Node executable path; switch with nvm and
  use any active Node version that satisfies the package engine for tests and
  publish checks.

## Acceptance Criteria
- ACE memory files exist in `.ai/`.
- Agent instruction files exist at repo root.
- `package.json` exposes `ace:*` workflow scripts.
- `npm run ace:check` passes.
- Generated reports include the latest durable decision from `.ai/decisions.md`.
- `ai-report.mjs` writes the Markdown report even when XML generation is skipped or unavailable.
- `AGENTS.md` and `CLAUDE.md` start with the meta-architecture warning block.
- `npm run check:npm-payload` fails if `.ai/**`, `AGENTS.md`, `CLAUDE.md`, or `DEVELOPING.md` enter the package.
- Versioning policy distinguishes publishable product changes from repo-local
  dogfooding changes.
- `package.json` keywords match the approved AgentOps SEO list.
- `package.json` version is `0.1.4`.
- Repo-local instructions do not point to a maintainer-specific Node executable.

## Completion Checklist
- [x] Goal completed
- [x] Acceptance criteria met
- [x] Tests/checks passed
- [x] `.ai/session-handoff.md` updated
- [x] `.ai/changed-files.md` updated
- [x] `.ai/work-log.md` updated
- [x] `npm run ace:check` passed
- [x] `.ai/reflection-log.md` updated if the task exposed friction or repeated mistakes
- [x] `.ai/decisions.md` updated if needed
- [x] `.ai/tech-docs.md` updated if architecture or technical state changed
- [x] `.ai/product-roadmap.md` updated if business or roadmap state changed
- [x] Final snapshot archived to `.ai/archive/tasks/` for large tasks
- [x] Next version/task defined if work continues
