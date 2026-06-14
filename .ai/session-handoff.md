# Session Handoff

## Last Update
2026-06-14 13:47

## What Was Done
- Confirmed `ace-pack@1.0.0` is published on npm and the working tree was clean
  before v1.0.1 work.
- Started the next final-release batch as `ace-pack@1.0.1`; npm publish is
  intentionally deferred until the maintainer decides the final batch is ready.
- Added `docs/adoption-checklist.md` with a gradual rollout path from first
  repository to optional PR/CI gates.
- Added `docs/faq.md` covering common adoption objections around AI calls,
  dependencies, non-JS repositories, strict gates, MCP, upgrades, and when not
  to use ACE.
- Added README and npm README links to the adoption docs.
- Added tests for adoption doc links, content focus, and npm payload boundary.

## Current State
- npm latest is `ace-pack@1.0.0`.
- Local candidate is `ace-pack@1.0.1`.
- v1.0.1 is implemented locally and passed release-readiness verification.
- No intermediate npm publish should happen until the maintainer explicitly
  decides this final batch is ready.

## Quality Review
Product Alignment:
- v1.0.1 improves team adoption after the stable v1.0 contract without adding
  new runtime concepts or commands.

Architecture:
- The change is documentation hardening only. Adoption docs are GitHub-only,
  while README.npm links to them without adding docs to the npm payload.

Security:
- No AI calls, network calls, hooks, credentials, migrations, or automatic
  runtime behavior were added.

Code Quality:
- Tests verify adoption docs are linked from both README surfaces, answer common
  objections, and remain outside the package file list.

## Next Steps
- No terminal command is required right now.
- Do not publish until the maintainer says the final batch is ready.
- When the maintainer chooses to publish the final batch, run
  npm.cmd run release:npm.

## Known Issues
- None known for v1.0.1.

## Verification
- `npm.cmd run ace:classify` passed and classified v1.0.1 as large.
- `npm.cmd test` passed: 13 files, 96 tests.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@1.0.1`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
