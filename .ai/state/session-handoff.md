# Session Handoff

## Last Update
2026-06-14 16:37

## What Was Done
- Implemented the single-router cleanup for `ace-pack@2.0.1`.
- Removed exposed granular `ace:*`, `ai:*`, and `agent-memory:*` package
  scripts from this repo.
- Updated the installer so consumer repositories get only `ace` and a missing
  project-owned `ace:validate` placeholder.
- Added safe upgrade pruning for old ACE-managed default aliases while
  preserving custom user scripts.
- Expanded `ace-cli.mjs` to route legacy command names as router arguments,
  including `ai:update:*` / `update:*` aliases with internal subcommands.
- Updated generated hooks/workflows, README surfaces, docs, templates, local
  AGENTS/CLAUDE instructions, smoke tools, and tests for router syntax.

## Current State
- Local candidate is `ace-pack@2.0.1`.
- Root `package.json` exposes `ace`, `ace:validate`, `test`, and internal
  development/release scripts; old daily ACE aliases are removed.
- `ace check` is the ACE memory validation path.
- `ace:validate` is now the project-owned mechanical gate; in this repo it runs
  `npm run test`.

## Quality Review
Product Alignment:
- The cleanup directly supports ACE's zero-bloat DevEx promise by keeping
  consumer package scripts clean and predictable.

Architecture:
- Command compatibility moved into the router instead of package.json aliases.
  Installer pruning uses exact known-default values so user-owned scripts are
  preserved.

Security:
- No network calls, AI calls, credential handling, SaaS behavior, or automatic
  hooks were added. The mechanical gate distinction reduces the chance that
  agents skip real project validation.

Code Quality:
- Focused tests cover router alias resolution, fresh install script minimalism,
  safe pruning, docs wording, generated gate commands, and smoke installation.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.0.1`.

## Known Issues
- None known for the v2.0.1 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
  because the working tree was clean, but the product scope was treated as
  large.
- `npm.cmd test` passed: 14 files, 110 tests.
- `pnpm.cmd ace check` passed.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run check:npm-payload` passed and checked 31 packed files.
- `npm.cmd run ace:validate` passed, invoking the project-owned mechanical
  test gate.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed; it reported the
  expected ACE-managed `AGENTS.md` sync and no created files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
