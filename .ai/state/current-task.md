# Current Task

## Feature Name
v2.0.0 Command Router and Memory Schema v2

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 15:24
Ready For Archive: yes

## Goal
Implement the planned command-surface cleanup, generated artifact hygiene, and
memory schema v2 migration while preserving old ACE commands and old `.ai/*`
paths as compatibility aliases.

## Business Value / Product Alignment
This keeps ACE easier to use daily while reducing long-term memory clutter. A
single `ace` router lowers `package.json` script noise, generated reports move
out of the main memory surface, and schema v2 gives future agents clearer
categories without abandoning existing installed repositories.

## Technical Approach
Option 1:
- Physically move all `.ai` files immediately and remove old `ace:*` scripts.
  This makes the repository tidy, but it breaks the v1 compatibility promise and
  existing user habits.

Option 2:
- Add a router and schema v2 layout as compatibility-first behavior. Keep all
  existing `ace:*`, `ai:*`, and `agent-memory:*` scripts, write generated
  artifacts to new canonical paths, keep legacy paths readable as migration
  aliases, and migrate memory files deterministically only when safe.

Chosen Approach:
- Use Option 2. The final package version becomes `2.0.0` because schema v2 is
  a new memory layout, but old commands and old paths remain readable/writable
  during the transition.

## Current Status
- Bumped package version to `2.0.0`.
- Added `npm run ace -- <command>` / `pnpm ace <command>` router while preserving existing scripts.
- Added canonical `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` memory layout with legacy read aliases.
- Changed v2 writes to canonical-only defaults so fresh installs keep `.ai/` folder-structured.
- Added `ace migrate -- --prune-legacy` and pruned this repository

## Affected Areas
- `package.json`
- `install-ace-pack.mjs`
- `scripts/*`
- `README.md`
- `README.npm.md`
- `docs/schema-compatibility.md`
- `ROADMAP.md`
- `tests/**`
- `.ai/**` local memory and generated reports

## Constraints
- Preserve existing command names and legacy aliases.
- Preserve old `.ai/*.md` path compatibility for v1 repositories.
- No new dependencies, AI calls, network calls, automatic hooks, or SaaS
  behavior.
- Deterministic migration only; do not infer project intent with AI.
- Do not overwrite meaningful project-owned memory.

## Acceptance Criteria
- `npm run ace -- <command>` routes to the same commands as existing `ace:*`
  scripts.
- Existing `ace:*`, `ai:*`, and `agent-memory:*` scripts remain valid.
- New reports/generated contexts are written under `.ai/generated/**`; legacy
  `.ai/report-*` / `.ai/generated-context.md` paths remain readable during
  migration.
- Fresh install creates the schema v2 categorized layout or migration-ready
  metadata without breaking `ace:check`.
- Existing v1 repositories can be upgraded deterministically without losing
  memory.
- Tests cover router, generated path compatibility, schema v2 migration, and
  legacy command/path behavior.

## Completion Checklist
- [ ] Always: update `.ai/changed-files.md`, record verification, and run `ace:validate`
- [ ] Always: state publish/deploy decision when relevant
- [ ] If standard/large: add product, architecture, security, and code-quality review notes
- [ ] If large/high-risk: confirm design approach, add useful reflection, and let `ace:finish` archive the snapshot
- [ ] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [ ] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [ ] `ace:finish` passed and generated reports
