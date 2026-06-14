# Changed Files

[package.json]
- Bumped package version to `0.4.0`.
- Added `ace:gate` package script.

[install-ace-pack.mjs]
- Added `ace:gate` to installed package scripts.
- Added `scripts/ace-quality-gate.mjs` to managed installed scripts.

[scripts/ace-quality-gate.mjs]
- Added the new PR/CI quality gate command.
- Reused existing memory validation, classification, finish validation, and
  Markdown helpers.
- Added actionable console failures, JSON output, PR refs, GitHub workflow
  generation, and safe pre-push hook installation.

[scripts/ai-task-classify.mjs]
- Added optional `--base` and `--head` PR diff classification support while
  preserving default working-tree classification.

[scripts/ai-memory-utils.mjs]
- Added shared meaningful-content helper for gate and finish validation.

[scripts/ai-task-finish.mjs]
- Reused the shared meaningful-content helper instead of a local duplicate.

[tests/ace-quality-gate.test.ts]
- Added coverage for gate pass/fail behavior, actionable failures, PR refs,
  JSON output, hooks, and GitHub workflow generation.

[tests/install-agent-memory-pack.test.ts]
- Verified installed repos receive `ace:gate` and `scripts/ace-quality-gate.mjs`.

[README.md]
- Documented `ace:gate`, PR refs, JSON output, GitHub workflow generation, and
  safe pre-push hook installation.

[README.npm.md]
- Mirrored npm-facing `ace:gate` documentation.

[ROADMAP.md]
- Marked v0.4 PR and CI Quality Gates as shipped.

[.ai/**]
- Updated v0.4 task, handoff, changed-files, work-log, decisions, tech docs,
  product roadmap, reflection, and generated reports.
