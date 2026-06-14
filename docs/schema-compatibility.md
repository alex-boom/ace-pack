# ACE v2.0 Schema and Compatibility

This document defines the compatibility contract for installed ACE repositories
starting with `ace-pack@2.0.0`.

ACE remains Markdown-first and zero-dependency. v2 changes the canonical memory
layout, but it keeps v1 paths readable as deterministic migration aliases so
existing repositories can upgrade without losing local memory.

## Stable CLI Surface

v2 adds a single command router:

- `ace` -> `node ./scripts/ace-cli.mjs`

Use it as:

```bash
npm run ace -- finish
pnpm ace finish
```

The router supports modern commands:

- `init`
- `check`
- `classify`
- `eject`
- `destroy`
- `finish`
- `gate`
- `hub`
- `migrate`
- `onboard`
- `report`
- `report brief`
- `current-task-code`

Installed repositories expose only:

- `ace`
- `ace:validate`

`ace check` validates ACE memory. `ace:validate` is a project-owned mechanical
gate for lint, typecheck, tests, or equivalent project checks. Fresh installs
add a placeholder `ace:validate` only when the script is absent, and the
installer must not overwrite a project-owned `ace:validate` script.

Previous ACE package script names remain supported only as router arguments:

- `ace:init`
- `ace:check`
- `ace:onboard`
- `ace:classify`
- `ace:finish`
- `ace:eject`
- `ace:destroy`
- `ace:purge`
- `ace:gate`
- `ace:hub`
- `ace:report`
- `ace:report:brief`

Legacy aliases remain supported:

- `agent-memory:init`
- `agent-memory:check`
- `ai:project:onboard`
- `ai:report`
- `ai:report:brief`
- `ai:task:classify`
- `ai:task:finish`
- `ai:update:*`

The generic `ace` router script is added only when the project does not already
own an `ace` script. During upgrades, the installer removes old ACE-managed
script aliases only when their values exactly match known ACE defaults; custom
project scripts are preserved.

## Safe Eject and Destroy

ACE supports a two-step uninstall flow:

```bash
pnpm ace eject
pnpm ace destroy
```

`ace eject` inspects canonical v2 memory paths and legacy aliases. If the ACE
memory is template-only, it reports that ACE is safe to remove. If active memory
exists, it creates a searchable `ace-export-YYYYMMDD-HHMMSS/` folder containing
`.ai/`, agent rule files, IDE bridge files, and `RESTORE.md`.

`ace destroy` refuses to remove active memory unless an `ace-export-*` backup is
present. It removes only ACE-owned artifacts: `.ai/`, exact ACE-generated files,
managed ACE scripts, and ACE-owned package scripts. It preserves custom
`AGENTS.md`, custom `CLAUDE.md`, custom `ace:validate`, project-owned scripts,
`DEVELOPING.md`, and `ROADMAP.md`.

## Canonical v2 Memory Layout

v2 organizes ACE memory by category:

```text
.ai/
  config/
    memory-config.json
    memory-config.recommended.json
    project-profile.md

  state/
    current-task.md
    session-handoff.md
    changed-files.md

  knowledge/
    decisions.md
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
    tasks/
```

For v1 compatibility, ACE reads legacy root `.ai/*` paths as migration aliases
where those paths existed:

The legacy root `.ai/*` paths remain compatible read aliases, not the canonical
v2 layout. v2 writes canonical paths by default so fresh installs keep `.ai/`
visibly organized.

| Canonical v2 path | Legacy compatible path |
| --- | --- |
| `.ai/config/memory-config.json` | `.ai/memory-config.json` |
| `.ai/config/memory-config.recommended.json` | `.ai/memory-config.recommended.json` |
| `.ai/config/project-profile.md` | `.ai/project-profile.md` |
| `.ai/state/current-task.md` | `.ai/current-task.md` |
| `.ai/state/session-handoff.md` | `.ai/session-handoff.md` |
| `.ai/state/changed-files.md` | `.ai/changed-files.md` |
| `.ai/knowledge/decisions.md` | `.ai/decisions.md` |
| `.ai/knowledge/tech-docs.md` | `.ai/tech-docs.md` |
| `.ai/knowledge/product-roadmap.md` | `.ai/product-roadmap.md` |
| `.ai/knowledge/reflection-log.md` | `.ai/reflection-log.md` |
| `.ai/knowledge/work-log.md` | `.ai/work-log.md` |
| `.ai/generated/context.md` | `.ai/generated-context.md` |
| `.ai/generated/report-brief.md` | `.ai/report-brief.md` |
| `.ai/generated/report-full.md` | `.ai/report-full.md` |
| `.ai/generated/report-full.xml` | `.ai/report-full.xml` |

When both canonical and legacy files exist, ACE reads the newest copy. If a
canonical file is still a template placeholder but the legacy file contains
meaningful project memory, migration promotes the legacy content into the
canonical file. Legacy aliases can be removed after canonical files exist with
`npm run ace -- migrate --prune-legacy`.

## Installed Files

ACE installs or updates:

- `AGENTS.md`
- `CLAUDE.md`
- canonical v2 `.ai/**` files listed above
- `.ai/archive/.gitkeep`
- `.ai/archive/tasks/.gitkeep`
- `scripts/*.mjs`

Existing memory files are project-owned after creation. The installer may create
missing canonical files and deterministic migration copies, but it must not
overwrite meaningful project memory. It does not create legacy root mirrors by
default.

ACE may also create optional IDE bridge files such as `.cursorrules`,
`.windsurfrules`, and `.github/copilot-instructions.md` when they are missing.
These are thin adapters back to `AGENTS.md` and local ACE commands. They are not
required by `ace check`, and existing project-owned IDE rule files must not be
overwritten.
IDE bridge files are optional and not required by `ace check`.

`AGENTS.md` is updated only inside this marked section:

```md
<!-- agent-memory-workflow:start -->
...
<!-- agent-memory-workflow:end -->
```

The marker names are stable. Future releases may replace the marked ACE
workflow body, but they must preserve content outside the markers.

## Markdown Section Expectations

ACE tools rely on headings, not exact prose. v2 tools expect these sections to
exist in either canonical or legacy paths:

| File | Required sections or signals |
| --- | --- |
| current task | `## Lifecycle`, `## Goal`, `## Business Value / Product Alignment`, `## Technical Approach`, `## Acceptance Criteria`, `## Completion Checklist` |
| session handoff | `## What Was Done`, `## Quality Review`, `## Next Steps` |
| decisions | `Decision:`, `Impact:` |
| product roadmap | `## Business Goals`, `## Completed Epics`, `## Planned Features` |
| technical docs | `## Architecture`, `## Data Model / DB Schema`, `## Auth, RBAC, and Security`, `## External APIs and Integrations` |
| changed files | `# Changed Files` |
| work log | `# Work Log` |
| reflection log | `## Unresolved`, `## Resolved` |

The wording inside sections may evolve. Agents and scripts should avoid
depending on entire paragraphs when a heading or labeled value is enough.

## `.ai/config/memory-config.json` Schema Version 1

The active config schema remains version `1` in v2.0. The memory layout changed;
the risk-rule config did not.

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
  "highRiskPaths": [
    {
      "pattern": "scripts/**",
      "label": "ACE automation",
      "tier": "large",
      "requiresDesignReview": true
    }
  ],
  "highRiskKeywords": [
    {
      "keyword": "auth",
      "label": "Authentication",
      "tier": "large",
      "requiresDesignReview": true
    }
  ]
}
```

Compatibility rules:

- Unknown top-level fields are allowed and must not break readers.
- Missing threshold fields fall back to ACE defaults.
- `highRiskPaths` may contain strings or objects.
- `highRiskKeywords` may contain strings or objects.
- Unknown `tier` values fall back to `large`.
- `requiresDesignReview` defaults to `true`.

ACE scripts may normalize config in memory, but they should not rewrite
project-owned config unless the user explicitly runs a command that applies
changes, such as `ace onboard --apply`.

## Migration Policy

The v2 migration is deterministic and local:

- `ace-pack init`, `ace init`, and `npm run ace -- migrate` create canonical v2
  files from existing v1 legacy files when canonical files are missing.
- Generated reports and hub context write canonical `.ai/generated/**` files.
- Readers accept both canonical and legacy paths.
- `npm run ace -- migrate --prune-legacy` removes legacy root aliases after
  canonical files exist.
- `npm run ace -- migrate --mirror-legacy` can recreate legacy root aliases for
  teams that still depend on old path conventions.
- Migration never calls AI, network services, or package registries.
- If both paths contain meaningful but different content, ACE preserves them and
  reads the newest copy instead of guessing intent.

For future schema versions:

- Document the reason for the schema bump before implementation.
- Provide deterministic local migration behavior.
- Keep a dry-run or reviewable migration path when changes are destructive.
- Add fixture tests for repositories created by older ACE releases.
- Fail clearly with actionable instructions if automatic migration is unsafe.

## Package Payload Boundary

Repo-local memory and GitHub-only growth materials are not part of the npm
runtime payload:

- `.ai/**`
- `AGENTS.md`
- `CLAUDE.md`
- `DEVELOPING.md`
- `ROADMAP.md`
- `docs/**`
- `examples/**`

The npm payload contains the package README, license, logos, CLI entrypoints,
root `.mjs` files, root `.cmd` shims, and `scripts/*.mjs`.
