# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-13 21:26
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-13 21:25
- Source session-handoff: 2026-06-13 21:26
- Verification level: test-backed

## Stack


## Current Task
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

## Business Value
The repository now carries its own agent instructions, memory, and handoff
discipline instead of depending on chat history. This makes future package,
README, and npm release work easier to resume.

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

## Next Steps
- Commit the ACE initialization files when ready.
- Use `npm run ace:check` before handoff and `npm run ace:finish` for future
  large tasks after updating `.ai/*` notes.

## Risks / Blockers
- Plain `npm test` uses the active Node 16.18.0 and fails before tests because
  Vitest/Rolldown expects a newer `node:util.styleText` API.

## Verification
- `npm run ace:check` passed.
- `npm run ace:classify` passed and reported tier `large`.
- `C:\Users\redmi\AppData\Local\nvm\v24.14.0\node.exe .\node_modules\vitest\vitest.mjs run` passed: 7 files, 38 tests.
- Report parser test coverage added for durable decisions.

## Recent Decision
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

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/**`
- `package.json`
- `README.md`
- `DEVELOPING.md`

## Overall Progress
- Completion checklist: 13/13
- Source of truth: `.ai/*` files remain authoritative.
