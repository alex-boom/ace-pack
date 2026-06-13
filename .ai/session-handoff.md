# Session Handoff

## Last Update
2026-06-13 21:46

## What Was Done
- Ran `node ./install-ace-pack.mjs init . --apply` in this repository.
- Created root agent instruction files and `.ai/*` memory files.
- Added ACE workflow scripts to `package.json`.
- Added project-specific command notes for using `npm run ace:*` when `pnpm`
  is unavailable on PATH.
- Fixed `extractTopDecision` so generated reports show the latest durable
  decision even when it is the final section in `.ai/decisions.md`.
- Made XML report generation best-effort; missing `pnpm.cmd` no longer blocks
  Markdown report generation.
- Added explicit product-vs-dogfooding documentation for fork maintainers.
- Added top-level meta-architecture warnings to `AGENTS.md` and `CLAUDE.md`.
- Added an npm payload guard that fails if repo-local ACE files enter the
  package tarball.
- Added versioning policy: bump `package.json` before publishing shipped
  package changes, but not for repo-local dogfooding-only changes excluded from
  npm.
- Updated npm SEO keywords to targeted AgentOps/AI engineering terms and bumped
  package version to `0.1.4`.
- Verified the setup with `npm run ace:check`, `npm run ace:classify`, and the
  Vitest suite on an active Node version that satisfies `>=20`.

## Current State
- ACE is installed in the repo and onboarding has been applied.
- Product source and repo-local dogfooding state are documented separately in
  `DEVELOPING.md` and `.ai/README.md`.
- Current change set is classified as large because it touches `AGENTS.md`,
  `CLAUDE.md`, and `.ai/**`.
- Use `npm run ace:*` commands in this environment unless `pnpm` has been
  explicitly added to PATH.
- Current metadata release target is `0.1.4`.
- No repo scripts or instructions should hardcode a local Node executable path;
  use the active nvm-selected Node and switch to any installed Node `>=20` for
  tests, payload checks, and publish flows.

## Quality Review
Product Alignment:
- The repo now preserves agent workflow and release context locally, which
  addresses the need to avoid relying on chat memory. npm keywords now better
  match AgentOps, context management, guardrails, and AI coding discovery terms.

Architecture:
- Used the package's own installer instead of hand-writing the scaffold, so the
  repository mirrors the shipped ACE initialization path. Project-specific
  command notes live above the generated ACE workflow block. Global behavior
  changes must happen under `scripts/*`, not in repo-local `.ai/**`.

Security:
- No auth, token, credential, or production data paths were changed. The npm
  payload guard protects against publishing local AI history and archive files.

Code Quality:
- Existing package scripts were preserved. New scripts are additive aliases for
  ACE workflow commands. Report decision extraction and XML-skip reporting now
  have test coverage. npm payload exclusion is now repeatable via
  `npm run check:npm-payload`. Release versioning rules are documented in
  `DEVELOPING.md` and local agent instructions. Keyword update is metadata-only.

## Next Steps
- Commit the ACE initialization files when ready.
- Use `npm run ace:check` before handoff and `npm run ace:finish` for future
  large tasks after updating `.ai/*` notes.

## Known Issues
- Plain `npm test` fails if the active Node version is below the package engine
  requirement because Vitest/Rolldown expects newer Node APIs.

## Verification
- `npm run ace:check` passed.
- `npm run ace:classify` passed and reported tier `large`.
- Vitest passed on an active Node version that satisfies `>=20`: 7 files, 38 tests.
- Report parser test coverage added for durable decisions.
- Report parser now selects the latest decision section, so versioning policy
  appears in fresh reports.
- Full XML report generation works when the active PATH exposes `pnpm.cmd`;
  Markdown report generation is covered even when XML is skipped.
- Markdown report generation also has coverage for `AI_REPORT_SKIP_XML=1`.
- `npm run check:npm-payload` passed and checked 27 packed files.
- `npm run preview:npm` passed; tarball contents exclude repo-local ACE files.
- First-block warning check passed for `AGENTS.md` and `CLAUDE.md`.
- `npm run ace:check` passed.
- Vitest passed on an active Node version that satisfies `>=20`: 7 files, 38 tests.
- Package metadata JSON parse passed for version `0.1.4` and approved keywords.
- `npm run check:npm-payload` passed and checked 27 packed files.
- `npm run preview:npm` passed and produced dry-run package `ace-pack-0.1.4.tgz`.
- Vitest passed on an active Node version that satisfies `>=20`: 7 files, 38 tests.
- `pnpm lint` was skipped because `pnpm` is not on PATH and this package has no `lint` script.

## Notes
- For npm publishing, use `npm run preview:npm` and `npm run publish:npm` so the
  package is built from `.npm-publish/` with `README.npm.md` and
  `logo-npm.svg`.
- Use `DEVELOPING.md` as the first reference for future fork maintainers who
  need to distinguish shipped ACE behavior from this repo's local ACE memory.
- Before publishing shipped product changes, run `npm version patch --no-git-tag-version`
  or choose the appropriate semver level, then run `npm run check:npm-payload`
  and `npm run publish:npm`.
