# Changed Files

[package.json]
- Bumped package version to `2.0.0`.
- Added the unified `ace` router script while keeping existing `ace:*` scripts.

[install-ace-pack.mjs]
- Installs `scripts/ace-cli.mjs` and `scripts/ace-migrate.mjs`.
- Adds the `ace` router script only when the target project does not already
  own one.

[scripts/ace-cli.mjs]
- Added the zero-dependency command router for `npm run ace -- <command>` and
  `pnpm ace <command>`.

[scripts/ace-migrate.mjs]
- Added the deterministic schema v2 migration entrypoint.
- Added `--prune-legacy`, `--mirror-legacy`, and `--root` option handling.

[scripts/ai-memory-utils.mjs]
- Added canonical v2 memory path definitions, legacy alias resolution,
  canonical-only writes, and schema v2 migration helpers.

[scripts/agent-memory-lib.mjs]
- Runs schema v2 migration during ACE memory initialization.
- Validates memory through the canonical/legacy resolver.
- Updates the managed AGENTS workflow block idempotently when templates change.

[scripts/ai-report-brief.mjs]
- Writes brief reports to `.ai/generated/report-brief.md`.

[scripts/ai-report.mjs]
- Writes full reports and XML bundles under `.ai/generated/**`.

[scripts/ace-hub.mjs]
- Writes generated hub context to `.ai/generated/context.md`.
- Displays canonical v2 context paths in generated headers.

[scripts/ace-onboard.mjs]
- Writes profile and recommended config under `.ai/config/**`.

[scripts/ace-mcp-server.mjs]
- Exposes canonical v2 memory resources while continuing to read legacy files.

[scripts/ai-task-finish.mjs]
- Reads and writes closeout memory through canonical/legacy helpers.

[scripts/ace-quality-gate.mjs]
- Reads current task, handoff, and reflection memory through canonical/legacy
  helpers.

[scripts/ai-update.mjs]
- Writes task, handoff, decision, work-log, and changed-file updates to
  canonical v2 paths.

[scripts/check-agent-memory.mjs]
- Reads freshness hints through canonical/legacy memory helpers.

[scripts/ai-memory-config.mjs]
- Reads memory config through the v2 config path resolver.

[scripts/ai-report-current-task-code.mjs]
- Updated generated report behavior for schema v2 compatibility.

[scripts/agent-memory-templates.mjs]
- Updated installed workflow templates to describe canonical v2 paths, legacy
  migration aliases, and router usage.

[README.md]
- Documented the router, schema v2 layout, generated artifact hygiene, and
  compatibility contract.

[README.npm.md]
- Mirrored npm-facing v2 documentation.

[docs/schema-compatibility.md]
- Replaced the v1 contract with the v2 command/router, canonical memory layout,
  legacy migration alias, and migration policy contract.
- Documented canonical-only writes, explicit legacy mirror mode, and
  `--prune-legacy`.

[ROADMAP.md]
- Marked v2.0 command router and memory schema v2 as shipped.

[tools/smoke-fake-project.mjs]
- Improved fake-project smoke failure reporting for installed script failures.

[tests/ace-cli.test.ts]
- Added router resolution tests.

[tests/ace-hub.test.ts]
- Updated hub tests for canonical generated context paths.

[tests/agent-memory.test.ts]
- Updated memory initialization expectations for the router and v2 migration.

[tests/ai-report.test.ts]
- Added canonical generated report assertions.

[tests/install-agent-memory-pack.test.ts]
- Added install coverage for router/migration scripts and package-owned `ace`
  preservation.

[tests/schema-compatibility.test.ts]
- Added schema v2 migration and compatibility contract coverage.

[AGENTS.md]
- Synced the repo-local managed ACE workflow block to canonical v2 paths.

[CLAUDE.md]
- Synced repo-local Claude instructions to canonical v2 paths and router
  commands.

[.cursorrules]
- Updated the repo-local Cursor bridge to read canonical brief reports and use
  router commands.

[.windsurfrules]
- Updated the repo-local Windsurf bridge to read canonical brief reports and use
  router commands.

[.github/copilot-instructions.md]
- Updated the repo-local Copilot bridge to read canonical brief reports and use
  router commands.

[.ai/**]
- Applied schema v2 dogfood migration to canonical `.ai/config`, `.ai/state`,
  `.ai/knowledge`, and `.ai/generated` categories, then pruned legacy root
  aliases for a folder-only `.ai` surface.
- Moved `.ai/README.md` to `.ai/knowledge/README.md`.
