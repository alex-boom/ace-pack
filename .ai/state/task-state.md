# Task State

## Lifecycle & Meta

### Feature Name
ACE Pack v3.0.0 DevEx Overhaul

### Lifecycle
Status: complete
Version: v3.0.0
Task Tier: large
Design Review Required: yes
Started: 2026-06-16 13:00
Ready For Archive: yes

### Goal
Ship the v3 memory schema and DevEx overhaul as one npm major release without
publishing intermediate package versions.

### Current Status
- [x] Consolidated active task memory into `.ai/state/task-state.md`.
- [x] Added deterministic v2 legacy task-file auto-migration with backups.
- [x] Added managed IDE bridge blocks and safe destroy cleanup.
- [x] Made small low-risk finish zero-ceremony from task-state plus current git state.
- [x] Updated docs, package version, tests, smoke, and release dry-run.

### Affected Areas
- `package.json`
- `install-ace-pack.mjs`, `install-agent-memory-pack.mjs`
- `scripts/*.mjs`
- `README.md`, `README.npm.md`, `ROADMAP.md`, `docs/schema-compatibility.md`
- `AGENTS.md`, `CLAUDE.md`, `DEVELOPING.md`
- `tests/**`, `tools/**`
- repo-local `.ai/**` dogfooding memory

### Constraints
- Keep ACE local-first and zero hidden AI/network calls for migration.
- Do not overwrite project-owned IDE rule files.
- Preserve existing installed-repo compatibility through deterministic aliases
  and migration.
- Keep touched scripts within the 400 non-empty-line limit.
- Publish only the final `ace-pack@3.0.0` release when the maintainer is ready.

### Acceptance Criteria
- Fresh installs create `task-state.md`, not `current-task.md`,
  `session-handoff.md`, or `changed-files.md`.
- `ace init`, `ace check`, router startup, and `ace migrate` auto-migrate safe
  legacy task files with timestamped backups.
- IDE rules use `ace-managed-ide-rules` blocks and `ace destroy` removes only
  those blocks.
- Small finish writes work-log from task title and current diff/status without
  reading latest commits.
- Reports, hub, gate, MCP, update helpers, smoke fixtures, docs, and tests all
  use task-state behavior.

### Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] `ace:validate` and release checks passed

## Business Value & Approach

### Business Value / Product Alignment
This release removes ACE's highest-friction daily DevEx issues: active task
state no longer sprawls across three files, IDE agents get native startup
bridges without clobbering user rules, and small tasks can close without manual
handoff ceremony.

### Technical Approach
Option 1:
- Introduce the v3 file but leave old task files in place indefinitely as
  mirrors. This minimizes migration risk but keeps the file sprawl and agent
  desynchronization problem alive.

Option 2:
- Consolidate into task-state with a deterministic auto-migrator, backup legacy
  files before cleanup, and keep old reader/MCP aliases as compatibility paths.

Chosen Approach:
- Use Option 2. It is a clean major-version schema change while preserving local
  recovery, no-network migration, and compatibility for older installed repos.

## Changed Files / Diff

[scripts/ace-task-state.mjs]
- Added task-state template, legacy file detection, safe backup migration,
  title extraction, and completed-state generation.

[scripts/ai-memory-utils.mjs, scripts/ai-markdown-utils.mjs, scripts/ai-report-utils.mjs]
- Moved shared Markdown/report helpers into focused modules and registered
  task-state as the canonical memory key.

[scripts/agent-memory-templates.mjs, scripts/agent-memory-lib.mjs, scripts/ace-cli.mjs, scripts/ace-migrate.mjs]
- Fresh installs and router/init/check/migrate flows now create or migrate
  `task-state.md`.

[scripts/ai-report*.mjs, scripts/ace-hub.mjs, scripts/ace-quality-gate.mjs, scripts/ai-update.mjs, scripts/ace-mcp-server.mjs]
- Updated reports, hub, gate, update helpers, and MCP resources to use
  task-state; deprecated old MCP task/handoff URIs now alias task-state.

[scripts/ai-task-finish.mjs]
- Small low-risk finish now uses task title and current git diff/status, writes
  a compact work-log entry, resets task-state, and skips manual handoff prompts.

[scripts/ace-uninstall-utils.mjs, install-ace-pack.mjs, install-agent-memory-pack.mjs, scripts/ace-install-lib.mjs, scripts/bootstrap-agent-memory.mjs, scripts/ace-destroy.mjs]
- Added managed IDE rule block upsert/removal, safe destroy cleanup, and split
  the installer into an importable library plus CLI wrappers.

[README.md, README.npm.md, ROADMAP.md, docs/schema-compatibility.md, AGENTS.md, CLAUDE.md, DEVELOPING.md, docs/*.md]
- Documented v3 task-state schema, migration, managed IDE rules, and one major
  npm release strategy.

[tests/**, tools/**]
- Added and updated migration, install, schema, hub, report, gate, finish, MCP,
  uninstall, smoke, syntax, and line-limit coverage.

## Handoff & Next Steps

### Last Update
2026-06-16 13:51

### What Was Done
- Implemented ACE Pack v3.0.0 as one major release candidate with Memory Schema
  v3 and config schema still at version `1`.
- Added zero-human-effort migration from legacy task files to task-state with
  local backups under `.ai/archive/migrations/`.
- Added idempotent managed IDE rule blocks for Cursor, Windsurf, and Copilot,
  plus surgical cleanup in `ace destroy`.
- Updated small-task finish to avoid latest commits and use task-state plus
  current git diff/status.
- Updated docs, package version, tests, smoke fixtures, payload checks, and npm
  dry-run release path.

### Current State
- `npm.cmd run release:ready` passes for `ace-pack@3.0.0`.
- `npm.cmd run release:npm:dry` passes and stages a 39-file npm payload.
- This repo's local `.ai` dogfood memory was migrated to `.ai/state/task-state.md`
  during release checks with a backup under `.ai/archive/migrations/`.
- No intermediate npm versions were published.

### Quality Review
Product Alignment:
- The release directly addresses the requested DevEx outcomes: cleaner memory,
  safer IDE integration, and lower small-task ceremony.

Architecture:
- Migration and IDE block handling are centralized in shared helpers, while
  old MCP/task reader surfaces remain compatibility aliases instead of parallel
  state.

Security:
- Migration uses only local filesystem reads/writes and timestamped backups.
  IDE cleanup removes only ACE-managed blocks and preserves custom user rules.

Code Quality:
- Large modules were split where needed to satisfy the 400 non-empty-line guard.
  Tests cover migration, install, destroy, finish, reports, gate, hub, MCP, and
  release smoke paths.

### Next Steps
- Maintainer can review the diff and run `npm.cmd run publish:npm` to publish
  `ace-pack@3.0.0` when ready.

### Known Issues
- None known after release-readiness checks.

### Verification
- `pnpm.cmd typecheck` passed.
- `pnpm.cmd lint` passed.
- `pnpm.cmd test` passed: 16 files, 123 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS projects.
- `npm.cmd run release:ready` passed.
- `npm.cmd run release:npm:dry` passed.

### Notes
- NPM publish: required before final release; deferred by maintainer.
