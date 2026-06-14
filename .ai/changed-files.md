# Changed Files

[package.json]
- Bumped package version from `0.1.7` to `0.2.0`.

[scripts/ace-onboard.mjs]
- Added broader JS/TS, Python, Go, Rust, and generic monorepo detection rules.
- Added detected signal tracking for profile output.
- Added CLI summary output for detected ecosystems and project-specific
  high-risk path rule count.
- Kept config schema and CLI names unchanged.

[tests/ace-onboard.test.ts]
- Added fixture coverage for Node API, Python web/database, Rust, generic
  monorepo, conservative rules, profile explanation, and CLI summary output.

[README.md]
- Documented v0.2 onboarding scanner coverage and added Rust/monorepo examples.

[README.npm.md]
- Mirrored npm-facing v0.2 onboarding documentation and examples.

[ROADMAP.md]
- Marked v0.2 onboarding as shipped and moved the forward roadmap to v0.3+.

[.ai/**]
- Updated task, handoff, changed-files, work-log, decisions, tech docs,
  product roadmap, reflection, and generated report state for v0.2.
