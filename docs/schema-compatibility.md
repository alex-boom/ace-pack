# ACE v3.4 Schema and Compatibility

This document defines the compatibility contract for installed ACE repositories
starting with `ace-pack@3.0.0`, including additive v3.1 task-state fields and
the v3.2 review, v3.3 red-team, and v3.4 friction-tracking additions.

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
| `## Lifecycle & Meta` | `### Feature Name`, `### Lifecycle`, `Task Tier:`, `Design Review Required:`, `Friction Encountered:` in fresh v3.4 templates, `### Goal`, `### Completion Checklist` |
| `## Business Value & Approach` | `### Business Value / Product Alignment`, `### Technical Approach`, `### Edge Cases & Red Teaming` in fresh v3.3 templates |
| `## Changed Files / Diff` | path headings such as `[README.md]` when changes are recorded |
| `## Handoff & Next Steps` | `### Quality Review`, `### Next Steps`, `### Verification`, `### Notes` |

ACE tools rely on headings and labeled values, not exact prose.

## Autonomous Phase Routing

Fresh v3.1 task-state files include two additive lifecycle labels:

```md
Current Phase: Planning
Next Autonomous Action: Analyze task and update Business Value & Approach.
```

Allowed `Current Phase` values are `Planning`, `Implementation`, `Review`, and
`Complete`. Agents may update these labels directly in Markdown when switching
roles or handing work to another agent. Scripted integrations may also use:

```bash
npm run ace -- update:task --phase Review --next-action "Review diff against intent."
pnpm ace update:task --phase Review --next-action "Review diff against intent."
```

For blocked work, use `Status: blocked` and set
`Next Autonomous Action: Needs Human: <specific request>`.

Existing meaningful v3 task-state files without these fields remain valid.
`ace check` does not fail old task-state files solely because the v3.1 labels
are missing.

## Friction Tracking

Fresh v3.4 task-state files include an additive lifecycle label:

```md
Friction Encountered: no
```

Agents set this to `yes` when the task experiences systemic friction, such as
repeated validation failures, Review -> Implementation loops, or undocumented
architecture. Before finish, the agent records the stuck point and likely cause
in `.ai/knowledge/reflection-log.md`.

Humans can force the same closeout path with:

```bash
pnpm ace finish --friction "Unclear API docs caused repeated validation loops"
npm run ace -- finish --friction "Unclear API docs caused repeated validation loops"
```

`ace finish --friction` marks `Friction Encountered: yes`, appends a compact
reflection entry, prints a warning, and records friction status in the
work-log entry. Existing meaningful v3 task-state files without the v3.4 label
remain valid; missing friction is treated as `no`.

## Agentic Red Team Planning Mode

Fresh v3.3 task-state files add an `### Edge Cases & Red Teaming` subsection
under `## Business Value & Approach`. Existing meaningful v3 task-state files
without the subsection remain valid; `ace check` does not fail old task-state
files solely because the v3.3 subsection is missing.

`ace hub red-team` generates a local adversarial planning prompt. ACE does not
call an LLM or network service; it writes or prints deterministic Markdown that
users may hand to an explicitly chosen reviewer or planning agent.

The red-team payload includes:

- a strict adversarial architect system instruction;
- Goal and Business Value & Approach from `.ai/state/task-state.md`;
- `.ai/knowledge/project-conventions.md` when present;
- configured high-risk path and keyword rules from
  `.ai/config/memory-config.json`;
- currently triggered high-risk rules from the local working tree diff.

If `project-conventions.md` is missing, the payload records that fact and still
generates the red-team prompt.

## Agentic Evaluation Review Mode

`ace hub review` generates a local reviewer prompt for AI-assisted code review.
ACE does not call an LLM or network service; it writes or prints deterministic
Markdown that users may hand to an explicitly chosen reviewer tool.

The review payload includes:

- a strict system instruction for code evaluation;
- original intent from `.ai/state/task-state.md`, including Goal, Acceptance
  Criteria, and Business Value & Approach;
- `.ai/knowledge/project-conventions.md` when present;
- triggered high-risk rules from `.ai/config/memory-config.json`;
- detailed `git status --short -uall` and `git diff HEAD --`. Untracked text
  files are added as bounded pseudo-diff entries so reviewer agents can
  evaluate newly created files before they are staged.

If `project-conventions.md` is missing, the payload records that fact and still
generates the review prompt.

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
entry, resets `task-state.md` to a complete empty state with
`Current Phase: Complete`, records `Friction Encountered: yes/no`, and
regenerates the brief report.

Standard and large tasks still require meaningful approach, red-team planning,
review, verification, and handoff sections in `task-state.md`. Successful
standard and large finishes mark `Current Phase: Complete` before report
generation, append a compact work-log entry with friction status, and large
task archives therefore contain the completed phase metadata.

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
