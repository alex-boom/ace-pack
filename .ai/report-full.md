# AI Full Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-13 23:14
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-13 23:14
- Source session-handoff: 2026-06-13 23:14
- Verification level: test-backed

## Stack


## Architecture Rules


## Current Task
Initialize ACE in this repository and mark dogfooding boundaries

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-13 20:59
Ready For Archive: yes

## Goal
Install ACE project memory and workflow files into the ACE package repository
itself so future agent sessions can recover project rules and release context
from the repo. Clearly separate the ACE product layer from this repository's
repo-local ACE dogfooding layer.

## Business Value
The repository now carries its own agent instructions, memory, and handoff
discipline instead of depending on chat history. This makes future package,
README, and npm release work easier to resume.

## Technical Approach
Option 1:
- Manually create `.ai/*`, `AGENTS.md`, and scripts. This risks drifting from
  the package's own installer behavior.

Option 2:
- Run the local `install-ace-pack.mjs init . --apply` installer. This uses the
  same path consumers use and validates the package against itself.

Chosen Approach:
- Use the local installer with `--apply`, then run ACE and test checks. This is
  the least surprising path and keeps the repository aligned with shipped
  scaffold behavior.

## Current Status
- [x] Ran local ACE installer in the repository root.
- [x] Applied onboarding recommendations.
- [x] Verified `ace:check`, `ace:classify`, and tests.
- [x] Fixed report decision extraction so the latest durable decision appears in generated reports.
- [x] Added project-specific command notes for npm-based ACE usage when `pnpm` is unavailable.
- [x] Made XML report generation best-effort so Markdown reports still complete without `pnpm.cmd`.
- [x] Added top-level meta-architecture warnings to local agent instruction files.
- [x] Documented product-vs-dogfooding file ownership for fork maintainers.
- [x] Added repeatable npm payload guard to prevent repo-local ACE history from shipping.
- [x] Added versioning policy for publishable package changes.
- [x] Updated npm keywords for AgentOps SEO and bumped package version to 0.1.4.
- [x] Replaced local Node path/version hardcoding with generic active Node `>=20` guidance.
- [x] Hardened npm release commands for Windows/Git Bash and verified dry publish flow.
- [x] Added vibe coding positioning and bumped package version to 0.1.5.
- [x] Formalized ACE roadmap, anti-goals, minimalism constraints, and explicit AI opt-in policy.
- [x] Added a mandatory npm publish decision rule for future task handoffs.

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
- Hardened the npm release flow for Windows/Git Bash by avoiding direct
  `execFile('npm.cmd')`, adding `publish:npm:dry`, expanding
  `release:npm:dry`, switching local dev docs to npm, and adding VS Code tasks
  that call `npm.cmd` directly.
- Added `vibe-coding` npm keyword, updated GitHub/npm README positioning, and
  bumped package version to `0.1.5`.
- Added GitHub-only `ROADMAP.md` as the ACE strategic compass and recorded
  anti-goals, minimalism constraints, v2.0+ research seeds, and explicit AI
  opt-in policy.
- Added a mandatory npm publish decision rule so future agents explicitly tell
  the maintainer whether npm publish is required after each task.
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
- Current metadata release target is `0.1.5`.
- No repo scripts or instructions should hardcode a local Node executable path;
  use the active nvm-selected Node and switch to any installed Node `>=20` for
  tests, payload checks, and publish flows.
- Preferred release verification command is `npm.cmd run release:npm:dry` on
  Windows PowerShell. It runs payload guard, `npm pack --dry-run`, and
  `npm publish --dry-run`.
- `pnpm run release:npm:dry` from Git Bash is verified to pass, but npm may
  print warnings about pnpm-specific env config. Use the committed VS Code
  tasks or `npm.cmd` commands for cleaner output.
- `ROADMAP.md` is GitHub-only and must stay out of npm payload. It is the first
  reference for product vision, anti-goals, minimalism constraints, and future
  AI provider policy.
- Future AI-assisted documentation generation must default to provider `off`.
  ACE must not make hidden local or cloud AI calls; unavailable providers fail
  open into manual or active-agent-assisted Markdown closeout.
- Future task handoffs must include `NPM publish: required` or
  `NPM publish: not required`. The decision is based on staged npm payload or
  user-visible installed ACE behavior, not on GitHub-only docs or local memory.

## Next Steps
- Commit the ACE initialization files when ready.
- Use `npm run ace:check` before handoff and `npm run ace:finish` for future
  large tasks after updating `.ai/*` notes.

## Known Issues
- Plain `npm test` fails if the active Node version is below the package engine
  requirement because Vitest/Rolldown expects newer Node APIs.

## Quality Review
Product Alignment:
- The repo now preserves agent workflow and release context locally, which
  addresses the need to avoid relying on chat memory. npm keywords now better
  match AgentOps, context management, guardrails, vibe coding, and AI coding
  discovery terms. `ROADMAP.md` now records the product promise and anti-goals
  that future features must preserve.

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

## Verification
- `npm run ace:check` passed.
- `npm run ace:classify` passed and reported tier `large`.
- Vitest passed on an active Node version that satisfies `>=20`: 7 files, 38 tests.
- Report parser test coverage added for durable decisions.
- Report parser now selects the latest decision section, so versioning policy
appears in fresh reports.
- Full XML report generation works when the active PATH exposes `pnpm.cmd`;
Markdown report generation is covered even when XML is skipped.

## Recent Decisions
## 2026-06-13 23:12

Decision:
- Require every future task handoff to state whether npm publish is required.

Reason:
- GitHub-only docs and repo-local ACE memory changes can look important but do
  not ship to npm. The maintainer needs a clear yes/no signal after each task to
  avoid republishing existing versions or skipping real payload updates.

Impact:
- Future final responses should include `NPM publish: required` or
  `NPM publish: not required`, plus the reason.
- The decision boundary is the staged npm payload and user-visible installed ACE
  behavior, not the full git diff.

## Changed Areas
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/**`
- `package.json`
- `README.md`
- `README.npm.md`
- `DEVELOPING.md`
- `ROADMAP.md`

## Latest Work Log
# Work Log

## 2026-06-13 20:59

- Initialized ACE in the repository using the local installer with `--apply`.
- Confirmed generated memory files and root agent instruction files were created.
- Verified `npm run ace:check`, `npm run ace:classify`, and Vitest on an active
  Node version that satisfies `>=20`.
- Fixed and covered report decision extraction after ACE setup exposed the issue.
- Added project-specific command notes so future agents use `npm run ace:*`
  when `pnpm` is unavailable.
- Made XML report generation non-blocking when `pnpm.cmd` is unavailable.

## 2026-06-13 21:19

- Added first-block meta-architecture warnings to local agent instruction files.
- Documented ACE product files vs repo-local dogfooding files for fork maintainers.
- Added npm payload guard to prevent `.ai/**`, `AGENTS.md`, `CLAUDE.md`, and
  other repo-local files from entering the package tarball.
- Recorded semver policy for shipped package changes vs repo-local dogfooding changes.
- Corrected report decision extraction so brief/full reports surface the newest
  durable decision, including the versioning policy.

## 2026-06-13 21:35

- Replaced generic npm keywords with targeted AgentOps, context-management,
  guardrails, cursor-rules, and AI-coding terms.
- Bumped package metadata version from `0.1.3` to `0.1.4` for this publishable
  metadata release.

## 2026-06-13 21:42

- Removed local Node executable/version hardcoding from repo-local ACE
  instructions and memory.
- Kept the public package requirement as generic `node >=20`, so maintainers can
  switch with nvm and use any compatible Node version.

## 2026-06-13 22:25

- Fixed `tools/check-npm-payload.mjs` so Windows/Git Bash release checks no
  longer fail with `spawn EINVAL` when npm dry-run inspection is executed.
- Added `publish:npm:dry` and made `release:npm:dry` run payload guard,
  pack dry-run, and publish dry-run.
- Switched repo development/link commands and local helper scripts to npm/npm.cmd.
- Added VS Code tasks that explicitly call `npm.cmd` for clean Windows task runs.
- Verified `npm.cmd run release:npm:dry`, `npm.cmd run publish:npm:dry`,
  `.local/publish-npm.cmd`, Git Bash `pnpm run release:npm:dry`, `npm.cmd run test`,
  and `npm.cmd run ace:check`.

## 2026-06-13 22:28

- Added `vibe-coding` to npm keywords and bumped package version to `0.1.5`.
- Added subtle vibe coding positioning to both GitHub and npm README surfaces.
- Kept the change metadata/docs-only with no CLI, template, or runtime behavior changes.
- Verified JSON metadata, npm payload guard, full dry npm release, staged npm
  README content, Vitest, and ACE memory check.

## 2026-06-13 23:05

- Added GitHub-only `ROADMAP.md` with ACE vision, product promise, anti-goals,
  release roadmap, v2.0+ research seeds, and explicit AI opt-in policy.
- Updated `DEVELOPING.md`, `AGENTS.md`, README, and `.ai/product-roadmap.md`
  to align future product work with zero-bloat and privacy-safe defaults.
- Added `ROADMAP.md` to the npm payload guard's forbidden paths so strategy docs
  stay out of the package tarball.
- Added a required task handoff rule: future agents must explicitly report
  whether npm publish is required, using staged npm payload impact as the
  decision boundary.

## Unresolved Reflections
- No unresolved reflections recorded.

## Overall Progress
- Completion checklist: 13/13
- Canonical context lives in `.ai/*`.
- XML bundle generated at `.ai/report-full.xml` for parsable handoff.
