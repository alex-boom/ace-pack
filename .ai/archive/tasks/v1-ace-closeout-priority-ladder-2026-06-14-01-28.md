# Current Task

## Feature Name
ACE Closeout Priority Ladder

## Lifecycle
Status: complete
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-14 01:25
Ready For Archive: yes

## Goal
Make ACE task closeout instructions easier for different AI agents to follow by
turning the flat completion checklist into a priority ladder.

## Business Value / Product Alignment
Agents should preserve future context and project safety without doing ceremony
or writing documentation that does not reduce real risk. This keeps ACE fast,
local-first, and useful for practical AI coding workflows.

## Technical Approach
Option 1:
- Change only the product templates. This keeps the improvement lightweight and
  avoids adding validation code or new schema.

Option 2:
- Add new `ace:finish` logic that prints or enforces a tiered closeout recipe.
  This could help agents but risks new blockers and extra code for a guidance
  problem.

Chosen Approach:
- Use Option 1. The approved scope is templates only; clear instructions solve
  the agent-behavior issue without overengineering ACE.

## Current Status
- [x] Plan approved for template-only closeout priority ladder.
- [x] Confirmed latest npm registry version is `0.1.6`, so this stays in
  pending `0.1.7`.
- [x] Update shipped ACE workflow and task templates.
- [x] Update template tests.
- [x] Run verification and closeout.

## Affected Areas
- `scripts/agent-memory-templates.mjs`
- `tests/agent-memory.test.ts`
- `.ai/**` closeout notes

## Constraints
- Do not change CLI command names.
- Do not add new parser, schema, config, or validation gates.
- Keep `ace:finish` logic unchanged.
- Keep the guidance short and priority-based.
- Do not bump beyond `0.1.7` unless npm already has `0.1.7` published.

## Acceptance Criteria
- Installed AGENTS workflow says to do the smallest closeout that preserves
  future agent context and project safety.
- Default completion checklist reads as conditional priorities, not a flat wall
  of mandatory chores.
- CLAUDE end-of-task guidance describes the same closeout priority ladder.
- Template tests assert the new priority language.
- `npm.cmd test`, `npm.cmd run ace:check`, `npm.cmd run check:npm-payload`, and
  `npm.cmd run release:npm:dry` pass.

## Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] `ace:validate` and `ace:finish` passed
