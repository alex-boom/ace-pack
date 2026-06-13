# Changed Files

[AGENTS.md]
- Added ACE agent workflow instructions, project-specific npm/Node/publish notes, first-block meta-architecture warning, and versioning policy.
- Replaced maintainer-local Node executable guidance with generic active Node `>=20` guidance.

[CLAUDE.md]
- Added Claude-compatible agent workflow instructions with npm-based local commands, first-block meta-architecture warning, and versioning policy.

[.ai/**]
- Added ACE memory, onboarding, task, handoff, work-log, reflection, archive files, and `.ai/README.md` dogfooding marker.
- Recorded that local Node paths must not be hardcoded; use the active nvm-selected Node and switch to any compatible `>=20` version for verification.

[package.json]
- Added ACE workflow scripts and npm payload guard while preserving existing test and npm publish scripts.
- Updated package version to `0.1.4` and replaced npm keywords with targeted AgentOps SEO terms.

[README.md]
- Linked local ACE dogfooding development guidance from the development section.

[DEVELOPING.md]
- Documented the product layer, repo-local dogfooding layer, npm payload boundary, and semver policy.

[tools/check-npm-payload.mjs]
- Added repeatable guard for excluding repo-local ACE files from the npm package.

[scripts/ai-memory-utils.mjs]
- Fixed durable decision extraction so reports use the latest decision section.

[scripts/ai-report.mjs]
- Made XML bundle generation best-effort while preserving Markdown report output.

[tests/ai-report.test.ts]
- Covered report output for latest durable decisions and skipped XML status.
