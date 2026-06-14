# Session Handoff

## Last Update
2026-06-14 01:26

## What Was Done
- Added template-only closeout priority guidance to shipped ACE workflow
  templates.
- Shortened the default completion checklist into conditional priority levels:
  always, standard/large, large/high-risk, and only-if-changed.
- Updated CLAUDE end-of-task guidance to match the same priority ladder.
- Clarified handoff notes so publish/deploy decisions are captured when
  relevant.
- Added template tests that assert the priority language is installed.

## Current State
- `ace:finish` logic, CLI names, schemas, config, report generation, and
  validation gates are unchanged.
- The change stays in the pending `ace-pack@0.1.7` release because npm registry
  latest is still `0.1.6`.
- Product behavior changed only in shipped templates that future repositories
  receive on init.

## Quality Review
Product Alignment:
- The new wording keeps ACE focused on future context and project safety while
  reducing ceremony for agents that otherwise over-close small tasks.

Architecture:
- The change is template-only and avoids adding enforcement logic for a guidance
  problem, preserving ACE's low-bloat local architecture.

Security:
- No auth, credentials, network behavior, hidden AI calls, or publish-secret
  handling changed.

Code Quality:
- Existing template tests now cover the new closeout priority language without
  adding brittle parser behavior.

## Next Steps
- Publish with `npm.cmd run release:npm` when ready.

## Known Issues
- None for this template-only closeout guidance change.

## Verification
- `npm.cmd view ace-pack version` returned `0.1.6`, so no `0.1.8` bump was needed.
- `npm.cmd run ace:classify -- --tier large --reason "template closeout priority ladder changes shipped ACE workflow behavior"` passed before implementation.
- `npm.cmd test` passed: 7 files, 47 tests.
- `npm.cmd run ace:check` passed.
- `npm.cmd run check:npm-payload` passed and checked 27 packed files.
- `npm.cmd run release:npm:dry` passed and dry-ran `ace-pack@0.1.7`.

## Notes
- NPM publish: required, because shipped ACE templates in `scripts/*.mjs` changed
  installed workflow behavior.
