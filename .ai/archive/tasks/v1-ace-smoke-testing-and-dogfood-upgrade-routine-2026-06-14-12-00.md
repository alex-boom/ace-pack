# Current Task

## Feature Name
ACE Smoke Testing and Dogfood Upgrade Routine

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 11:49
Ready For Archive: yes

## Goal
Add release-readiness checks that validate the local ACE candidate in disposable
fake projects and make self-dogfooding an explicit, reviewed step before final
publish.

## Business Value / Product Alignment
This reduces release risk without forcing npm publish after every task. ACE can
now batch intermediate shipped changes while still proving the final candidate
works when installed into fresh projects and when re-applied to this repository.

## Technical Approach
Option 1:
- Document the smoke and dogfood expectations only. This is cheap, but future
  agents can skip or inconsistently perform the checks.

Option 2:
- Add local zero-dependency tools for fake-project smoke and explicit dogfood
  self-check, wire them into npm scripts, and cover the workflow with tests.

Chosen Approach:
- Use Option 2. It keeps the process local and deterministic, avoids network or
  npm-latest dependence, and turns release readiness into a repeatable command
  sequence without publishing intermediate versions.

## Current Status
- [x] Added local fake-project smoke tooling for JS and non-JS fixtures.
- [x] Added explicit dogfood self-check tooling with clean-worktree protection.
- [x] Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready`
  npm scripts.
- [x] Updated shipped closeout templates with deferred release wording and
  release-readiness smoke/self-check guidance.
- [x] Updated README, npm README, DEVELOPING, and roadmap documentation.
- [x] Added automated tests for smoke, dogfood pass, and dirty-worktree guard.
- [x] Ran the release-readiness verification sequence.

## Affected Areas
- `package.json`
- `tools/smoke-fake-project.mjs`
- `tools/dogfood-self-check.mjs`
- `scripts/agent-memory-templates.mjs`
- `README.md`
- `README.npm.md`
- `DEVELOPING.md`
- `ROADMAP.md`
- `tests/smoke-release.test.ts`
- `tests/agent-memory.test.ts`
- `.ai/**` closeout notes

## Constraints
- No dependencies, AI calls, network calls, automatic npm publish, or automatic
  hook installation.
- Smoke tests must use the local candidate package, not `npm latest`.
- Dogfood self-check must be explicit and reviewed; it must not blindly run over
  a dirty product worktree.
- Intermediate versions may remain unpublished until the maintainer decides to
  cut the final release.

## Acceptance Criteria
- `npm run smoke:fake-project` creates disposable JS and non-JS projects,
  installs ACE from the local candidate, runs onboarding, `ace:check`,
  `ace:hub start`, and `ace:gate`.
- `npm run dogfood:self-check` checks git state first, applies the local staged
  ACE package, runs `ace:check`, `ace:gate`, and `ace:hub start`, and fails on
  unexpected changed files.
- `npm run release:ready` runs tests, fake-project smoke, `ace:gate`, npm
  payload guard, and npm release dry-run.
- Future handoffs can state `NPM publish: required before final release;
  deferred by maintainer`.

## Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] `ace:validate` and `ace:finish` passed
