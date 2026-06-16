# Session Handoff

## Last Update
2026-06-16 12:33

## What Was Done
- Implemented `ace discover` as a deterministic local project conventions
  scanner for `ace-pack@2.2.0`.
- Added `.ai/knowledge/project-conventions.md` with
  `.ai/project-conventions.md` as a legacy read alias.
- Wired discover into the ACE router, installer-managed scripts, hub context,
  MCP resources, README surfaces, schema docs, roadmap, smoke tests, and
  focused unit tests.
- Bumped package version from `2.1.0` to `2.2.0`.

## Current State
- `ace discover` writes a concise ACE-managed conventions registry with
  `<!-- ace-discover:managed -->`.
- Existing human-written conventions files are preserved unless `--force` is
  used.
- `ace hub` includes project conventions in start, architect, and
  architect-lite contexts when the file exists.
- Release dry-run passed for `ace-pack@2.2.0`.
- Real npm publish was attempted, but npm returned `E404 Not Found ... or you
  do not have permission to access it`; registry latest remains `2.1.0`.

## Quality Review
Product Alignment:
- The feature addresses architectural drift by giving agents a local summary of
  existing UI, routing, logging, error-handling, package-layout, and persistence
  patterns.

Architecture:
- The scanner is a zero-dependency managed script using simple file, dependency,
  and import-string heuristics. It avoids AST parsing and keeps generated
  Markdown aggregated for LLM context safety.

Security:
- No AI providers, API keys, network calls, dependency installs, or external
  services were added. Discovery reads local files only and skips heavy
  generated directories.

Code Quality:
- Focused tests cover React/Tailwind, Go, FastAPI, overwrite protection,
  stdout/JSON behavior, concise output, router/install/hub/MCP integration, and
  release smoke coverage.

## Next Steps
- Fix npm auth/package permissions for ace-pack.
- Run `npm.cmd run release:npm`.
- Verify `npm.cmd view ace-pack version` returns `2.2.0`.

## Known Issues
- None known for the v2.2.0 candidate.

## Verification
- `npm.cmd run ace -- classify` passed before implementation; the clean
  worktree detected as `small`, but the shipped command scope is treated as
  large.
- Focused Vitest passed: 7 files, 54 tests.
- `npm.cmd run test` passed: 16 files, 123 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS projects.
- `npm.cmd run check:npm-payload` passed and checked 35 packed files.
- `npm.cmd run release:npm:dry` passed for `ace-pack@2.2.0`.
- `npm.cmd run ace -- gate` passed with tier `large`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed with no created or
  updated installed files.
- `npm.cmd run ace:validate` passed after closeout updates: 16 files,
  123 tests.
- `npm.cmd run release:npm` failed at publish with npm `E404` permission/package
  access error.
- `npm.cmd view ace-pack version` still returns `2.1.0`.
- `npm.cmd run ace -- check` passed after blocked-publish memory updates.
- `npm.cmd run ace -- brief` regenerated `.ai/generated/report-brief.md`.
- Final `npm.cmd run ace -- gate` passed with tier `large`.

## Notes
- NPM publish: required before final release; blocked by npm permission.
