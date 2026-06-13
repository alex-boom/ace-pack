# Changed Files

[package.json]
- Bumped package version from `0.1.6` to `0.1.7`.

[scripts/ai-memory-utils.mjs]
- Added Start Snapshot helpers for local git state, task lifecycle, next
  command parsing, release decision extraction, and stack fallback.

[scripts/ai-report-brief.mjs]
- Added `## Start Snapshot` and project-profile stack fallback to the generated
  brief report.

[scripts/ai-report.mjs]
- Added matching `## Start Snapshot` and stack fallback behavior to the full
  report.

[scripts/ace-hub.mjs]
- Included `.ai/report-brief.md` first in AI Coder Context payloads when it is
  available, while preserving fresh-init behavior when it is not generated yet.

[tests/ai-report.test.ts]
- Covered snapshot output, first-backtick command extraction, missing Next
  Steps, flexible `NPM publish:` parsing, git fallback, capped dirty counts, and
  stack fallback.

[tests/ace-hub.test.ts]
- Covered AI Coder Context ordering with `.ai/report-brief.md` first and the
  missing-brief fallback path.

[.ai/**]
- Updated task, handoff, changed-files, work-log, tech-docs, reflection, and
  generated report closeout state for the `0.1.7` release.
