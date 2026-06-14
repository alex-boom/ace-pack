# Changed Files

[package.json]
- Bumped package version to `0.4.1`.

[scripts/ace-quality-gate.mjs]
- Added explicit `--human-override <reason>` support that passes the gate while
  preserving original issues and override metadata.
- Relaxed Quality Review enforcement for standard low-risk changes, while
  keeping strict enforcement for large tasks and high-risk matches.

[tests/ace-quality-gate.test.ts]
- Added coverage for standard low-risk pass behavior, large quality-review
  enforcement, human override metadata, missing override reason, and JSON output.

[README.md]
- Documented explicit human override usage and updated the CLI reference.

[README.npm.md]
- Mirrored npm-facing human override documentation.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, reports,
  and generated context for the v0.4.1 closeout.
