# Changed Files

[package.json]
- Bumped package version from `0.2.0` to `0.3.0`.

[scripts/ace-hub.mjs]
- Added named hub modes and aliases while preserving numeric selections.
- Added `--list`, `--mode`, `--stdout`, `--output`, and `--json` CLI handling.
- Added generated context metadata headers with included/missing file lists.
- Added PR-only local git status/stat summary with graceful fallback.
- Kept runtime zero-dependency and local-only.

[tests/ace-hub.test.ts]
- Added coverage for numeric compatibility, named modes, report-brief ordering,
  optional and required file behavior, CLI list/stdout/output/json behavior,
  and PR git summary fallback.

[README.md]
- Documented ACE Hub modes and automation flags.

[README.npm.md]
- Mirrored npm-facing ACE Hub mode and flag documentation.

[ROADMAP.md]
- Marked v0.3 ACE Hub as shipped.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, and report
  state for v0.3 closeout.
