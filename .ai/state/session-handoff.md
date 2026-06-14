# Session Handoff

## Last Update
2026-06-14 15:48

## What Was Done
- Bumped package version to `2.0.0` for the schema v2 candidate.
- Added the `ace` command router and kept all existing `ace:*`, `ai:*`, and `agent-memory:*` scripts.
- Added canonical v2 memory categories under `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` with legacy mirror compatibility.
- Moved generated hub/report outputs to `.ai/generated/**` while mirroring old paths.
- Updated installer, templates, README surfaces, schema compatibility docs, roadmap, tests, and dogfood ACE memory.
- Applied v2 migration to this repository and ran dogfood self-check.

## Current State
- Local candidate is `ace-pack@2.0.0`.
- npm latest remains `ace-pack@1.1.0` until the maintainer publishes.
- v2 implementation is complete and release-readiness checks passed.

## Quality Review
Product Alignment:
- The work targets daily UX and long-term maintainability after v1.1 while
  preserving the ACE promise of local, inspectable, zero-bloat workflows.

Architecture:
- Major-version schema work stayed compatibility-first: new categorized memory
  paths and generated artifact paths have deterministic migration and legacy
  mirrors/read fallbacks.

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

## Notes
- NPM publish: required before final release; deferred by maintainer.
