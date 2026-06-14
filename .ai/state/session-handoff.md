# Session Handoff

## Last Update
2026-06-14 17:10

## What Was Done
- Implemented `ace-pack@2.1.0` Safe Eject and Uninstall.
- Added `ace eject` to export active ACE memory into searchable
  `ace-export-YYYYMMDD-HHMMSS/` folders with `RESTORE.md`.
- Added guarded `ace destroy` / `ace purge` cleanup that removes only ACE-owned
  artifacts after an export exists.
- Centralized managed ACE script, package script, IDE bridge, and template
  definitions so install and uninstall behavior cannot drift.
- Updated router, installer, README surfaces, schema compatibility docs,
  roadmap, and tests for the new uninstall flow.

## Current State
- Local candidate is `ace-pack@2.1.0`.
- Fresh installs include the new eject/destroy managed scripts.
- `ace destroy` preserves custom `AGENTS.md`, custom `CLAUDE.md`, custom
  `ace:validate`, project-owned scripts, `DEVELOPING.md`, and `ROADMAP.md`.
- `ROADMAP.md` and `.ai/knowledge/product-roadmap.md` now list v2.1 Safe Eject
  and Uninstall as shipped.

## Quality Review
Product Alignment:
- The feature directly supports ACE's zero-lock-in promise and makes uninstall
  transparency visible near the top of both README surfaces.

Architecture:
- A shared uninstall utility owns managed-file/script definitions and exact IDE
  bridge templates. `ace eject` handles data takeout; `ace destroy` handles
  guarded cleanup and package.json surgery.

Security:
- No dependencies, network calls, AI calls, credentials, SaaS behavior, or zip
  archives were added. Destroy refuses active memory without an export and
  refuses the ACE product repository without an explicit internal override.

Code Quality:
- Focused tests cover empty vs active eject, export contents, destroy refusal,
  custom-file preservation, runner-package cleanup, product-repo guard, router
  aliases, installer managed scripts, and docs contract.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.1.0`.

## Known Issues
- None known for the v2.1.0 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
  because the working tree was clean, but the shipped product scope was treated
  as large.
- Focused Vitest passed for uninstall, router, installer, and schema docs:
  4 files, 31 tests.
- `npm.cmd test` passed: 15 files, 116 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run check:npm-payload` passed and checked 34 packed files.
- `npm.cmd run ace:validate` passed, invoking the project-owned test gate.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed with no created or
  updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
