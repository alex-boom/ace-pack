# Session Handoff

## Last Update
2026-06-14 12:02

## What Was Done
- Added `tools/smoke-fake-project.mjs` to validate the local ACE candidate in
  disposable JS and non-JS repositories.
- Added `tools/dogfood-self-check.mjs` for explicit self-dogfooding with a
  clean-worktree guard and unexpected-diff detection.
- Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready` npm
  scripts.
- Updated shipped ACE workflow templates so future agents can record deferred
  release decisions and run smoke/self-check routines before final publish.
- Updated README surfaces, `DEVELOPING.md`, and `ROADMAP.md` with the new
  release-readiness routine.
- Added tests covering fake-project smoke, dogfood self-check, dirty-worktree
  protection, template wording, and package scripts.
- Ran explicit `dogfood:self-check -- --allow-dirty` against this repository as
  a reviewed release-readiness pass.

## Current State
- Local package version remains `0.4.0`; intermediate npm publish is deferred
  by maintainer.
- `npm run release:ready` is the main pre-final-release command.
- `npm run dogfood:self-check` is intentionally separate because it should run
  only during an explicit release-readiness pass on a clean or reviewed tree.
- The current worktree contains active product and repo-local memory changes
  for this routine.
- The self-dogfood pass did not create or update product files; it refreshed
  `.ai/generated-context.md` through `ace:hub start`.

## Quality Review
Product Alignment:
- The routine supports the maintainer's decision to batch intermediate changes
  and publish only a final version while still preserving release confidence.

Architecture:
- Fake-project smoke builds the local staged package and imports its installer,
  so the check exercises packaged install behavior instead of source-only
  assumptions. Dogfood self-check uses the same staged candidate and installed
  scripts.

Security:
- No network calls, AI calls, hidden npm publish, or hook installation were
  added. Dogfood self-check refuses dirty worktrees by default to avoid mixing
  sync changes with active product edits.

Code Quality:
- The tools use Node built-ins, fail with actionable messages, and are covered
  by Vitest. `release:ready` verifies tests, smoke, gate, payload guard, and npm
  dry-run in one command.

## Next Steps
- Run `npm.cmd run release:ready` before the final npm release.
- Commit this smoke/dogfood routine with the pending v0.4.0 work.
- After committing or during an explicit reviewed release-readiness pass, run
  `npm.cmd run dogfood:self-check`.
- Publish only when the maintainer decides the final v0.4.0 batch is ready.

## Known Issues
- None known for this routine. Dogfood self-check was run on this repository
  with `--allow-dirty` because product changes are still uncommitted; the guard
  would still fail on newly introduced unexpected paths.

## Verification
- `npm.cmd test` passed: 9 files, 73 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the work as large.
- `npm.cmd run check:npm-payload` passed and checked 28 packed files.
- `npm.cmd run release:npm:dry` passed for `ace-pack@0.4.0`.
- `npm.cmd run release:ready` passed the full readiness sequence.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
