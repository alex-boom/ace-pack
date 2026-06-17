# Task State

## Lifecycle & Meta

### Feature Name
ACE Pack v3.3 Agentic Red Teaming Hub Mode

### Lifecycle
Status: complete
Version: v3.3.0
Task Tier: large
Design Review Required: yes
Current Phase: Complete
Next Autonomous Action: Ready for maintainer review and npm publish preparation.
Started: 2026-06-17 19:45
Ready For Archive: yes

### Goal
Add a local `ace hub red-team` mode and task-state schema section that make
agents adversarially evaluate failure modes, security risks, and edge cases
before moving from Planning to Implementation.

### Current Status
- [x] Classified clean baseline as small before implementation.
- [x] Chosen local hub-mode approach that keeps ACE zero-dependency.
- [x] Implemented red-team schema, hub payload, instructions, docs, and tests.
- [x] Ran validation, fake-project smoke, ACE check/classify, red-team output,
  and npm payload guard.

### Affected Areas
- `scripts/ace-task-state.mjs`
- `scripts/ace-hub*.mjs`
- `scripts/agent-memory-templates.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `README.md`, `README.npm.md`, `docs/schema-compatibility.md`
- `package.json`
- `tests/**`

### Constraints
- Keep ACE local-first, zero-dependency, and zero hidden AI/network calls.
- Preserve existing hub modes and CLI compatibility.
- Legacy task-state files without `Edge Cases & Red Teaming` must remain valid.
- Do not edit repo-local root `AGENTS.md` or `CLAUDE.md` to change product behavior.

### Acceptance Criteria
- Fresh `ace init` creates `### Edge Cases & Red Teaming`.
- `ace hub red-team` emits a strict adversarial planning prompt.
- Red-team payload includes Goal, Business Value & Approach, high-risk rules,
  and project conventions when present.
- Missing `project-conventions.md` is handled gracefully.
- Planning phase instructions require red-team notes for standard, large, or
  high-risk tasks before Implementation.
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
Agentic red teaming reduces fragile AI-generated code by making planning
explicitly consider failure modes, security risks, and edge cases before coding.

### Technical Approach
Option 1:
- Add a top-level `ace red-team` command. This is discoverable but expands the
  command surface and makes ACE look like it performs AI work itself.

Option 2:
- Add `red-team` as an `ace hub` planning payload mode plus a new Markdown
  task-state subsection.

Chosen Approach:
- Use Option 2. It matches the existing hub pattern, keeps ACE declarative and
  local-only, and lets any explicit external reviewer/agent consume the prompt.

### Edge Cases & Red Teaming
- Failure mode: legacy v3 task-state files do not contain the new subsection.
  Mitigation: keep `ace check` compatibility additive and only require the
  section in fresh templates/tests.
- Failure mode: red-team payload could imply hidden AI execution. Mitigation:
  implement it as deterministic Markdown generation only, with docs stating no
  network or provider calls are made.

## Changed Files / Diff

[scripts/ace-task-state.mjs]
- Added `### Edge Cases & Red Teaming` to fresh task-state, completed
  task-state, and legacy migration fallback.

[scripts/ace-hub.mjs, scripts/ace-hub-modes.mjs, scripts/ace-hub-red-team.mjs]
- Added `red-team` / `redteam` / `adversarial` hub mode with deterministic
  adversarial planning context.

[scripts/agent-memory-templates.mjs, scripts/ace-uninstall-utils.mjs]
- Updated shipped AGENTS/CLAUDE planning rules and included the new red-team
  hub helper in managed install files.

[README.md, README.npm.md, docs/schema-compatibility.md, package.json]
- Documented v3.3 red-team behavior and bumped package version to `3.3.0`.

[tests/**]
- Added hub, install, template, schema migration, and backward-compatibility
  coverage for red-team mode and the new task-state subsection.

## Handoff & Next Steps

### Last Update
2026-06-17 20:16

### What Was Done
- Prepared v3.3 task state and selected the hub-mode architecture.
- Implemented the shipped red-team hub mode, schema addition, docs, and tests.

### Current State
- Complete and ready for maintainer review.

### Quality Review
Product Alignment:
- The feature directly supports planning-time edge-case discovery for AI work.
Architecture:
- The chosen path reuses the existing hub and task-state surfaces.
Security:
- No external services, credentials, or hidden AI calls will be introduced.
Code Quality:
- Changes are focused around task-state templates, hub payload generation, docs,
  and targeted tests.

### Next Steps
- Maintainer review, then run the npm release flow when ready.

### Known Issues
- None known.

### Verification
- `npm.cmd run ace -- classify` passed on clean baseline as small.
- Focused checks passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and
  `npm.cmd test -- tests/ace-hub.test.ts tests/agent-memory.test.ts tests/install-agent-memory-pack.test.ts tests/schema-compatibility.test.ts`.
- `npm.cmd run ace:validate` passed: typecheck, line-limit lint, and Vitest
  16 files / 135 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace -- hub red-team --stdout` passed and showed phase/action,
  configured high-risk rules, and triggered high-risk rules.
- `npm.cmd run ace -- check` passed.
- `npm.cmd run ace -- classify` passed; current diff is large and design review
  is required.
- `npm.cmd run check:npm-payload` passed; 43 packed files checked.
- `git diff --check` passed.

### Notes
- NPM publish: required because shipped scripts/templates/docs and package
  version changed.
