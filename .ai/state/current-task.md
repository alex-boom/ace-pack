# Current Task

## Feature Name
v2.2.0 Project Conventions Discovery

## Lifecycle
Status: active
Version: v1
Task Tier: large
Design Review Required: yes
Started: 2026-06-16 12:33
Ready For Archive: no

## Goal
Ship `ace discover` so installed repositories can generate a concise local
Project Conventions and Pattern Registry for AI agents.

## Business Value / Product Alignment
This directly addresses architectural drift in established codebases. ACE will
help agents reuse a project's existing UI, routing, logging, error-handling,
database, and package-layout patterns instead of inventing parallel ones.

## Technical Approach
Option 1:
- Add an AI-provider-backed discovery flow. This may produce richer analysis,
  but it requires API keys, privacy configuration, provider fallback policy, and
  more release risk.

Option 2:
- Add a deterministic local scanner that uses simple path, dependency, and
  import-string heuristics to write a short Markdown conventions summary.

Chosen Approach:
- Use Option 2 for v2.2.0. It preserves ACE's local-first, zero-dependency,
  zero-hidden-AI-calls promise while still giving agents useful repo-specific
  convention context.

## Current Status
- [x] Implement `ace discover` scanner and overwrite protection.
- [x] Wire router, install, hub, memory paths, MCP, docs, and version.
- [x] Add focused tests and release-readiness checks.
- [ ] Publish `ace-pack@2.2.0` after npm permissions are available.

## Affected Areas
- `package.json`
- `scripts/ace-discover.mjs`
- ACE router, memory utils, hub, MCP, installer-managed script lists
- README surfaces, schema docs, roadmap, tests, smoke tooling

## Constraints
- Use native Node.js APIs only. Do not add dependencies.
- Do not make AI calls, network calls, AST parsing, or complex regex analysis.
- Keep regex heuristics simple: detect imports, dependencies, and obvious path
  patterns.
- Keep generated `project-conventions.md` concise and aggregated so it does not
  bloat `ace hub` context.
- Protect human-written conventions files; overwrite unmanaged files only with
  `--force`.

## Acceptance Criteria
- `ace discover` writes `.ai/knowledge/project-conventions.md` with a managed
  marker and concise detected conventions.
- `ace discover --stdout` prints without writing, and `--json` prints parseable
  metadata.
- Router, install, hub, MCP, README, schema docs, and tests cover the new
  shipped command and memory file.
- Package version is `2.2.0`.

## Completion Checklist
- [ ] Goal completed
- [ ] Always: summarize what changed in `.ai/session-handoff.md`
- [ ] Always: update `.ai/changed-files.md`, record verification, and run project-owned `ace:validate`
- [ ] Always: state publish/deploy decision when relevant
- [ ] If standard/large: add product, architecture, security, and code-quality review notes
- [ ] If large/high-risk: confirm design approach, add useful reflection, and let `ace finish` archive the snapshot
- [ ] If release-bound shipped behavior changed: run local smoke and dogfood/self-check routines when available
- [ ] Only if changed: update tech docs, product roadmap, durable decisions, or release notes
- [ ] `ace finish` passed and generated reports
