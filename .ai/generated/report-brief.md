# AI Brief Report

Project: `ace-pack`

## Report Metadata
- Generated: 2026-06-14 19:43
- Freshness: Fresh
- Current task version: v1
- Current task tier: large
- Source current-task: 2026-06-14 19:43
- Source session-handoff: 2026-06-14 19:42
- Verification level: smoke-tested

## Start Snapshot
- Branch: main
- Worktree: dirty (27 changed files)
- Last commit: dca94cd Refactor ACE command structure to unify under a single `ace` router, replacing legacy command scripts with router arguments. Update documentation to reflect changes in command usage and memory validation processes. Bump version to 2.0.1, ensuring compatibility with existing repositories while streamlining the user experience.
- Task: complete (tier: large, version: v1, ready for archive: yes)
- Next command: `npm.cmd run release:npm`
- Release decision: NPM publish: required before final release; deferred by maintainer.

## Stack
Detected ecosystems: Generic repository | Package manager: pnpm

## Current Task
v2.1.0 Safe ACE Eject & Destroy

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 17:10
Ready For Archive: yes

## Goal
Add a safe two-step uninstall flow so installed repositories can export ACE
memory before removing ACE-owned files.

## Business Value
This strengthens ACE's zero-lock-in promise. Developers can inspect how to leave
before adopting the tool, keep their AI memory in a searchable export, and avoid
destructive cleanup of project-owned files.

## Current Status
- [x] Implement eject/export command.
- [x] Implement guarded destroy command.
- [x] Wire router, installer, docs, version, and tests.
- [x] Run validation and closeout.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publish, verify `npm.cmd view ace-pack version` and update repo-local
  ACE memory to mark npm latest as `2.1.0`.

## Risks / Blockers
- None known for the v2.1.0 candidate.

## Verification
- `pnpm.cmd ace classify` passed before implementation; it detected `small`
because the working tree was clean, but the shipped product scope was treated
as large.
- Focused Vitest passed for uninstall, router, installer, and schema docs:
4 files, 31 tests.
- `npm.cmd test` passed: 15 files, 116 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.

## Recent Decision
## 2026-06-14 17:10

Decision:
- Implement ACE uninstall as a guarded two-step `ace eject` then `ace destroy`
  workflow.

Reason:
- ACE needs to demonstrate zero-lock-in while protecting project-owned AI
  memory from accidental deletion. A direct destructive command would undermine
  the product promise.

Impact:
- `ace eject` exports active `.ai/**` memory and agent rule files into a
  searchable `ace-export-*` folder with manual restore instructions.
- `ace destroy` refuses active memory without an export, refuses the ACE
  product repository unless explicitly overridden for internal tests, and
  removes only ACE-owned files/scripts while preserving custom project content.
- Installer, router, docs, payload, and tests now treat eject/destroy as shipped
  `ace-pack@2.1.0` behavior.

## Unresolved Reflections
- No unresolved reflections recorded.

## Changed Areas
- `package.json`
- `scripts/ace-eject.mjs`
- `scripts/ace-destroy.mjs`
- `scripts/ace-uninstall-utils.mjs`
- `install-ace-pack.mjs`
- `scripts/ace-cli.mjs`

## Overall Progress
- Completion checklist: 9/9
- Source of truth: `.ai/*` files remain authoritative.
