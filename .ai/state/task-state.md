# Task State

## Lifecycle & Meta

### Feature Name
ACE Pack v3.2 Agentic Evaluation Review Hub Mode

### Lifecycle
Status: complete
Version: v3.2.0
Task Tier: large
Design Review Required: yes
Current Phase: Complete
Next Autonomous Action: Ready for maintainer review and npm publish preparation.
Started: 2026-06-17 19:33
Ready For Archive: yes

### Goal
Add a local `ace hub review` mode that generates a strict LLM reviewer context
from task intent, project conventions, triggered risk rules, and the current
git diff without adding network calls or dependencies.

### Current Status
- [x] Added review payload generation for `ace hub review`.
- [x] Updated shipped AGENTS and CLAUDE templates for Review phase behavior.
- [x] Updated v3.2 docs, npm README, package version, and install script list.
- [x] Added focused tests for review mode, missing conventions, install sync,
  and shipped instructions.
- [x] Included untracked text files in review payload as bounded pseudo-diff.
- [x] Full validation, fake-project smoke, ACE check/classify, review output,
  and payload guard passed.

### Affected Areas
- `scripts/ace-hub*.mjs`
- `scripts/ai-task-classify.mjs`
- `scripts/agent-memory-templates.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `README.md`, `README.npm.md`, `docs/schema-compatibility.md`
- `package.json`
- `tests/**`

### Constraints
- Keep ACE local-first, zero-dependency, and zero hidden AI/network calls.
- Preserve existing hub modes and CLI compatibility.
- Keep scripts under the 400 non-empty-line guard.
- Do not edit repo-local root `AGENTS.md` or `CLAUDE.md` to change product behavior.

### Acceptance Criteria
- `pnpm ace hub review` / `npm run ace -- hub review` emits a strict review prompt.
- Review payload includes system instruction, original intent, governance, status, and diff.
- Missing `project-conventions.md` is handled gracefully.
- Review phase instructions define fail/pass transitions.
- Tests, fake-project smoke, ACE check/classify, and npm payload guard pass.

### Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] `ace:validate` and release checks passed

## Business Value & Approach

### Business Value / Product Alignment
Agentic evaluation reduces the review bottleneck for AI-generated code by giving
reviewer agents the original intent, conventions, risk context, and local diff
in one deterministic payload.

### Technical Approach
Option 1:
- Add a new standalone `ace review` command. This would be discoverable but
  expands the command surface and risks implying ACE performs AI review itself.

Option 2:
- Add `review` as a focused `ace hub` mode that emits a strict prompt/context
  for any explicitly chosen reviewer tool.

Chosen Approach:
- Use Option 2. It preserves ACE's local Markdown context model, avoids provider
  coupling, keeps zero hidden AI calls, and fits the existing hub UX.

## Changed Files / Diff

[scripts/ace-hub.mjs, scripts/ace-hub-modes.mjs, scripts/ace-hub-review.mjs]
- Added review mode dispatch, moved hub mode registry into a small module, and
  generated the deterministic review prompt from task-state, conventions,
  classification risk matches, git status, and git diff.
- Included untracked text files as bounded pseudo-diff entries so new files can
  be reviewed before staging.

[scripts/ai-task-classify.mjs, scripts/agent-memory-templates.mjs, scripts/ace-uninstall-utils.mjs]
- Made repository classification inspect untracked files with `-uall` so risk
  rules see concrete new file paths.
- Added Review phase workflow instructions and ensured new hub helper scripts
  are installed into consumer repositories.

[README.md, README.npm.md, docs/schema-compatibility.md, package.json]
- Documented v3.2 review mode and bumped the package version to `3.2.0`.

[tests/**]
- Added coverage for review mode output, missing conventions, install sync,
  shipped instructions, and compatibility docs.

## Handoff & Next Steps

### Last Update
2026-06-17 19:39

### What Was Done
- Implemented the v3.2 review hub mode and supporting tests/docs.
- Kept review generation deterministic and local-only.
- Completed full validation and release payload checks.

### Current State
- Ready for maintainer review and release preparation.

### Quality Review
Product Alignment:
- The mode directly supports stricter AI-code evaluation against original task
  intent and project conventions.

Architecture:
- Review prompt construction is isolated in `ace-hub-review.mjs`; hub mode
  routing lives in `ace-hub-modes.mjs`, keeping `ace-hub.mjs` small.

Security:
- No external services, network calls, credentials, or LLM providers are used.

Code Quality:
- The implementation reuses existing Markdown readers, classification logic,
  and Git primitives with targeted tests.

### Next Steps
- Maintainer review, then run the npm release flow when ready.

### Known Issues
- None known.

### Verification
- `npm.cmd run ace:validate` passed: typecheck, line-limit lint, and Vitest
  16 files / 131 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace -- hub review --stdout` passed and showed phase/action,
  triggered risk rules, and pseudo-diff entries for new untracked files.
- `npm.cmd run ace -- check` passed.
- `npm.cmd run ace -- classify` passed; current diff is large and design review
  is required.
- `npm.cmd run check:npm-payload` passed; 42 packed files checked.
- `git diff --check` passed.

### Notes
- NPM publish: required because shipped scripts/templates/docs and package
  version changed.
