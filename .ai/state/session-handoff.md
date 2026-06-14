# Session Handoff

## Last Update
2026-06-14 16:10

## What Was Done
- Bumped package version to `2.0.0` for the schema v2 candidate.
- Added the `ace` command router and kept existing `ace:*`, `ai:*`, and
  `agent-memory:*` scripts.
- Added canonical v2 memory categories under `.ai/config`, `.ai/state`,
  `.ai/knowledge`, and `.ai/generated`.
- Changed v2 writes to canonical-only defaults so fresh installs keep `.ai/`
  folder-structured.
- Kept legacy root `.ai/*` paths readable as migration aliases.
- Added `ace migrate -- --prune-legacy` and `--mirror-legacy` behavior.
- Pruned this repository's root `.ai/*` legacy files and moved `.ai/README.md`
  to `.ai/knowledge/README.md`.
- Updated docs, templates, tests, smoke tooling, and local ACE memory for
  canonical-only v2.

## Current State
- Local candidate is `ace-pack@2.0.0`.
- The `.ai` root now contains only folders: `archive`, `config`, `generated`,
  `knowledge`, and `state`.
- npm latest remains `ace-pack@1.1.0` until the maintainer publishes.
- v2 implementation is complete and release-readiness checks passed after the
  canonical-only refinement.

## Quality Review
Product Alignment:
- The work targets daily UX and long-term maintainability after v1.1 while
  preserving the ACE promise of local, inspectable, zero-bloat workflows.

Architecture:
- Major-version schema work stayed compatibility-first: new categorized memory
  paths and generated artifact paths have deterministic migration and legacy
  read fallbacks.

Security:
- No network calls, AI calls, SaaS behavior, credential handling, or automatic
  hook installation were added.

Code Quality:
- Shared path helpers resolve canonical v2 paths and legacy aliases, avoiding a
  second path-policy engine across scripts.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local ACE memory to mark npm latest as `2.0.0`.

## Known Issues
- None known for the v2.0.0 candidate.

## Verification
- `npm.cmd run ace:classify` passed before implementation, but detected `small`
  only because the working tree was clean. The requested product scope is being
  treated as large.
- `npm.cmd test` passed: 14 files, 108 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the work as large.
- `npm.cmd run check:npm-payload` passed and checked 31 packed files.
- `npm.cmd run release:npm:dry` passed for `ace-pack@2.0.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed with no updated or
  created files.
- `npm.cmd run release:ready` passed for the final `ace-pack@2.0.0` candidate.
- `npm.cmd test` passed after canonical-only write/prune refinement: 14 files,
  108 tests.
- `npm.cmd run release:ready` passed after canonical-only write/prune
  refinement; npm dry-run packed 31 files for `ace-pack@2.0.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed after refinement
  with no updated or created files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
