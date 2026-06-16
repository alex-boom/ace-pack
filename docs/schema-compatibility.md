# ACE v3.0 Schema and Compatibility

This document defines the compatibility contract for installed ACE repositories
starting with `ace-pack@3.0.0`.

ACE remains Markdown-first, local-first, and zero-dependency. v3 consolidates
active task memory into one task-state file and keeps migration deterministic.

## Stable CLI Surface

Installed repositories expose only:

- `ace`
- `ace:validate`

Use the router as:

```bash
npm run ace -- finish
pnpm ace finish
```

The router supports `init`, `check`, `classify`, `discover`, `eject`,
`destroy`, `finish`, `gate`, `hub`, `migrate`, `onboard`, and reports. Legacy
router names such as `ace:finish`, `agent-memory:init`, and `ai:task:finish`
remain accepted only as router arguments.

## Canonical v3 Memory Layout

```text
.ai/
  config/
    memory-config.json
    memory-config.recommended.json
    project-profile.md

  state/
    task-state.md

  knowledge/
    decisions.md
    project-conventions.md
    tech-docs.md
    product-roadmap.md
    reflection-log.md
    work-log.md

  generated/
    context.md
    report-brief.md
    report-full.md
    report-full.xml
    report-current-task-code.md
    report-current-task-code.xml

  archive/
    migrations/
    tasks/
```

The legacy root alias for task state is `.ai/task-state.md`. Fresh installs do
not create `.ai/current-task.md`, `.ai/session-handoff.md`, or
`.ai/changed-files.md`.

## Task State Expectations

`task-state.md` is the active task source of truth. ACE tools expect these
sections or signals:

| Section | Required signals |
| --- | --- |
| `## Lifecycle & Meta` | `### Feature Name`, `### Lifecycle`, `Task Tier:`, `Design Review Required:`, `### Goal`, `### Completion Checklist` |
| `## Business Value & Approach` | `### Business Value / Product Alignment`, `### Technical Approach` |
| `## Changed Files / Diff` | path headings such as `[README.md]` when changes are recorded |
| `## Handoff & Next Steps` | `### Quality Review`, `### Next Steps`, `### Verification`, `### Notes` |

ACE tools rely on headings and labeled values, not exact prose.

## v2 Legacy Auto-Migration

When `ace init`, `ace check`, `ace migrate`, or the `ace` router detects legacy
task files and no meaningful `task-state.md` exists, ACE automatically:

- reads legacy canonical and root files for current task, handoff, and changed
  files;
- writes `.ai/state/task-state.md`;
- copies originals into `.ai/archive/migrations/v3-task-state-YYYYMMDD-HHMMSS/`;
- removes the migrated legacy files;
- prints one concise success message.

If meaningful `task-state.md` already exists, ACE does not overwrite it. Legacy
files are preserved and reported so a maintainer can review or prune them.

Migration never calls AI providers, package registries, network services, or
external tools.

## IDE Managed Blocks

ACE creates or updates these IDE bridge files during install/init:

- `.cursorrules`
- `.windsurfrules`
- `.github/copilot-instructions.md`

ACE owns only the marked block:

```md
<!-- ace-managed-ide-rules:start -->
...
<!-- ace-managed-ide-rules:end -->
```

Existing custom IDE rules are preserved. `ace destroy` removes only the managed
block and deletes an IDE file only when it becomes empty.

## Small Task Finish

For small low-risk tasks, `ace finish` is zero-ceremony. It reads the task title
from `task-state.md`, records current uncommitted/staged git state with
`git diff HEAD --stat` or `git status --short`, appends a compact `work-log.md`
entry, resets `task-state.md` to a complete empty state, and regenerates the
brief report.

Standard and large tasks still require meaningful approach, review,
verification, and handoff sections in `task-state.md`.

## `.ai/config/memory-config.json` Schema Version 1

The active config schema remains version `1`. The memory layout changed in
ACE v3; risk-rule config did not.

Stable fields:

```json
{
  "version": 1,
  "thresholds": {
    "small": {
      "maxFiles": 2,
      "maxDiffLines": 80
    },
    "large": {
      "minFiles": 8,
      "minDiffLines": 300
    }
  },
  "highRiskPaths": [],
  "highRiskKeywords": []
}
```

Unknown top-level fields are allowed. Missing threshold fields fall back to ACE
defaults. Unknown `tier` values fall back to `large`, and
`requiresDesignReview` defaults to `true`.

## Package Payload Boundary

Repo-local memory and GitHub-only materials are not part of the npm runtime
payload:

- `.ai/**`
- `AGENTS.md`
- `CLAUDE.md`
- `DEVELOPING.md`
- `ROADMAP.md`
- `docs/**`
- `examples/**`

The npm payload contains the package README, license, logos, CLI entrypoints,
root `.mjs` files, root `.cmd` shims, and `scripts/*.mjs`.
