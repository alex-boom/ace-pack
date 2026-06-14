# Changed Files

[package.json]
- Added `smoke:fake-project`, `dogfood:self-check`, and `release:ready`
  scripts for local release-readiness validation.

[tools/smoke-fake-project.mjs]
- Added disposable JS and non-JS project smoke that installs ACE from the local
  staged package and runs onboarding, memory check, hub start context, and gate.

[tools/dogfood-self-check.mjs]
- Added explicit local candidate self-apply check with clean-worktree guard,
  core ACE workflow verification, and unexpected changed-file detection.

[scripts/agent-memory-templates.mjs]
- Added deferred release wording and release-bound smoke/dogfood guidance to
  shipped closeout templates.

[README.md]
- Documented fake-project smoke, `release:ready`, and explicit dogfood
  self-check for ACE maintainers.

[README.npm.md]
- Mirrored npm-facing release-readiness documentation.

[DEVELOPING.md]
- Documented deferred publish wording, release-readiness sequence, and explicit
  dogfood self-check policy.

[ROADMAP.md]
- Noted that v0.4 release readiness includes local fake-project smoke and
  explicit dogfood self-checks.

[tests/smoke-release.test.ts]
- Added coverage for JS/non-JS smoke, dogfood self-check pass, and dirty repo
  guard behavior including explicit allow-dirty release-readiness mode.

[tests/agent-memory.test.ts]
- Added assertions for deferred release and dogfood/self-check template wording
  plus package script entries.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, tech docs,
  product roadmap, generated context, and regenerated reports for this closeout.
