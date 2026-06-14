# Session Handoff

## Last Update
2026-06-14 11:13

## What Was Done
- Bumped package version from `0.2.0` to `0.3.0`.
- Reworked `ace:hub` around named modes while preserving numeric options:
  `1`/`start`/`coder`, `2`/`architect`, `3`/`business`, `4`/`docs`,
  plus new `handoff` and `pr` modes.
- Added CLI flags: `--list`, `--mode <mode>`, `--stdout`, `--output <path>`,
  and `--json`.
- Added generated context metadata headers with mode, timestamp, included
  files, missing optional files, and PR-only git summary.
- Added PR mode local git status/stat summary with graceful `unknown` fallback.
- Updated GitHub/npm README hub documentation and marked v0.3 shipped in
  `ROADMAP.md`.

## Current State
- `ace:hub` remains deterministic, local, and zero-dependency.
- Existing numeric menu selections remain compatible.
- No clipboard automation, MCP, CI gates, network calls, AI calls, schema
  changes, or `.ai/*` file merging were added.
- The staged npm payload carries `ace-pack@0.3.0`.

## Quality Review
Product Alignment:
- v0.3 turns Hub into the daily context surface promised in the roadmap and
  reduces manual context gathering for new agent sessions, architecture review,
  PR summaries, and handoffs.

Architecture:
- The implementation extends the existing hub script instead of adding a new
  top-level router or dependency-backed clipboard feature.

Security:
- PR summaries use local `git status --short` and `git diff --stat HEAD` only.
  No file contents beyond selected local Markdown context are sent anywhere.

Code Quality:
- Hub tests now cover numeric compatibility, named modes, metadata headers,
  optional/required file handling, CLI flags, custom output, JSON metadata,
  stdout payloads, and git fallback behavior.

## Next Steps
- Publish with `npm.cmd run release:npm` when ready.

## Known Issues
- npm registry still showed `ace-pack@0.1.7` before this task, so v0.2 was not
  separately published. If publishing now, publish the current `0.3.0` payload.

## Verification
- `npm.cmd run ace:classify` passed before implementation.
- `npm.cmd test` passed: 7 files, 58 tests.
- `npm.cmd run ace:check` passed.
- `npm.cmd run check:npm-payload` passed and checked 27 packed files.
- `npm.cmd run release:npm:dry` passed and dry-ran `ace-pack@0.3.0`.
- `npm.cmd run ace:validate` passed.
- `npm.cmd run ace:finish` passed and archived the v0.3 task snapshot.

## Notes
- NPM publish: required, because `package.json`, `README.npm.md`, and shipped
  `scripts/ace-hub.mjs` changed the npm payload and installed behavior.
