# Session Handoff

## Last Update
2026-06-14 10:59

## What Was Done
- Bumped package version from `0.1.7` to `0.2.0`.
- Expanded `ace:onboard` detection for JS/TS API backends, Python web/database
  tooling, Go services, Rust services, .NET services, and generic monorepos.
- Added `## Why Detected` to `.ai/project-profile.md` so users can see the
  signals behind each detected ecosystem.
- Added concise CLI summary output for `ace:onboard` dry-run/apply flows.
- Kept CLI names, config schema, runtime dependencies, network behavior, and
  AI behavior unchanged.
- Updated GitHub/npm README onboarding docs and added test fixtures for the new
  scanner coverage.

## Current State
- `ace:onboard` remains deterministic, local, and zero-dependency.
- `.ai/memory-config.json` schema remains version `1`.
- Rules stay conservative: sensitive workspace paths are marked, but generic
  `apps/**` and `packages/**` are not blindly high-risk.
- The staged npm payload carries `ace-pack@0.2.0`.

## Quality Review
Product Alignment:
- v0.2 improves first-install value by making ACE recognize common repository
  shapes and explain what it found immediately in terminal and profile output.

Architecture:
- The implementation extends the existing scanner rather than adding a second
  preset system or new CLI surface, preserving the local Markdown architecture.

Security:
- No auth, credential, token, external network, SaaS, or hidden AI behavior
  changed. Risk rules remain conservative and local.

Code Quality:
- New fixtures cover JS/TS backend, Python web/database, Go, Rust, monorepo,
  conservative rule behavior, profile explanation, and CLI summary output.

## Next Steps
- Publish with `npm.cmd run release:npm` when ready.

## Known Issues
- None for this v0.2 onboarding expansion.

## Verification
- `npm.cmd run ace:classify -- --tier large --reason "v0.2 onboarding scanner expands shipped repository profiling behavior"` passed before implementation.
- `npm.cmd test` passed: 7 files, 52 tests.
- `npm.cmd run ace:check` passed.
- `npm.cmd run check:npm-payload` passed and checked 27 packed files.
- `npm.cmd run release:npm:dry` passed and dry-ran `ace-pack@0.2.0`.

## Notes
- NPM publish: required, because `package.json`, `README.npm.md`, and shipped
  `scripts/ace-onboard.mjs` changed the npm payload and installed behavior.
