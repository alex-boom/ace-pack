# Session Handoff

## Last Update
2026-06-15 12:30

## What Was Done
- Added Project Conventions and Pattern Discovery to `ROADMAP.md` as a
  long-term research item.
- Mirrored the same strategic item in `.ai/knowledge/product-roadmap.md`.
- Kept the change documentation-only: no CLI behavior, scripts, tests,
  package metadata, or package version changes.

## Current State
- Local package version remains `ace-pack@2.1.0`.
- The future `ace discover` concept is documented as explicit opt-in,
  agent-assisted, stack-agnostic research.
- The canonical future conventions memory path is documented as
  `.ai/knowledge/project-conventions.md`, with `.ai/project-conventions.md` as
  a possible legacy alias.

## Quality Review
Product Alignment:
- The roadmap item targets a core ACE adoption problem: helping AI agents reuse
  established project conventions instead of inventing duplicate patterns.

Architecture:
- The item is framed as research, not a shipped interface. It uses v2 canonical
  command and memory naming while preserving room for legacy aliases.

Security:
- The roadmap explicitly keeps any automated AI-assisted discovery under ACE's
  no-hidden-AI-calls and explicit opt-in policy.

Code Quality:
- Markdown-only edit; no implementation code or runtime behavior was changed.

## Next Steps
- Publish when ready with `npm.cmd run release:npm`.
- After publishing the already completed v2.1.0 candidate, verify
  `npm.cmd view ace-pack version` and update repo-local ACE memory to mark npm
  latest as `2.1.0`.

## Known Issues
- None known for the v2.1.0 candidate.

## Verification
- `npm.cmd run ace -- classify` passed and classified this as `small`.
- `npm.cmd run ace:validate` passed.
- `npm.cmd run ace -- check` passed.
- `npm.cmd run ace -- brief` regenerated `.ai/generated/report-brief.md`.
- Confirmed `package.json` version remains `2.1.0`.

## Notes
- NPM publish: not required. Reason: documentation-only; no npm payload change.
