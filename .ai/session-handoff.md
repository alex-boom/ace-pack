# Session Handoff

## Last Update
2026-06-14 13:37

## What Was Done
- Confirmed `ace-pack@0.6.0` is published on npm and the working tree was clean
  before v1.0 work.
- Bumped local package version to `1.0.0`.
- Added `docs/schema-compatibility.md` with the v1.0 stable contract:
  command names, installed files, Markdown section expectations,
  `.ai/memory-config.json` schema version `1`, migration policy, and payload
  boundary.
- Added README and npm README links to the v1.0 stability contract.
- Added schema compatibility tests for project-owned memory preservation,
  AGENTS marker stability, memory-config v1 normalization, legacy command
  aliases, docs links, and fresh install validation.

## Current State
- npm latest is `ace-pack@0.6.0`.
- Local candidate is `ace-pack@1.0.0`.
- v1.0.0 is implemented locally and passed release-readiness verification.

## Quality Review
Product Alignment:
- v1.0 gives teams a stable adoption contract for installed ACE repositories and
  makes future changes easier to evaluate.

Architecture:
- The release documents and tests existing behavior rather than introducing a
  schema registry or migration engine without a real schema v2 problem.

Security:
- No AI calls, network calls, hooks, credentials, or automatic migration writes
  were added. Existing `.ai/*` memory remains project-owned.

Code Quality:
- Regression tests protect compatibility promises around installer behavior,
  config normalization, AGENTS workflow markers, command names, legacy aliases,
  and documentation links.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v1.0.0 live.
- After publish, run `npm.cmd view ace-pack version` and update repo-local ACE
  memory so future agents see npm latest as `1.0.0`.

## Known Issues
- None known for v1.0.0.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0 as large.
- `npm.cmd test` passed: 12 files, 92 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
