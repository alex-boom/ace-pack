# ACE v1.0 Schema and Compatibility

This document defines the stable compatibility contract for installed ACE
repositories starting with `ace-pack@1.0.0`.

ACE is intentionally Markdown-first. The stable contract is not a database
schema; it is a set of file, section, command, and migration rules that future
ACE releases must preserve unless a breaking major version intentionally changes
them.

## Stable CLI Surface

These command names are stable in v1.x:

- `ace:init`
- `ace:check`
- `ace:validate`
- `ace:onboard`
- `ace:classify`
- `ace:finish`
- `ace:gate`
- `ace:hub`
- `ace:report`
- `ace:report:brief`

Legacy aliases remain supported in v1.x:

- `agent-memory:init`
- `agent-memory:check`
- `ai:project:onboard`
- `ai:report`
- `ai:report:brief`
- `ai:task:classify`
- `ai:task:finish`
- `ai:update:*`

Projects may replace `ace:validate` with their own stricter local validation
command. The installer must not overwrite a project-owned `ace:validate` script.

## Stable Installed Files

ACE installs or updates these files in consumer repositories:

- `AGENTS.md`
- `CLAUDE.md`
- `.ai/current-task.md`
- `.ai/session-handoff.md`
- `.ai/decisions.md`
- `.ai/changed-files.md`
- `.ai/work-log.md`
- `.ai/reflection-log.md`
- `.ai/product-roadmap.md`
- `.ai/tech-docs.md`
- `.ai/memory-config.json`
- `.ai/archive/.gitkeep`
- `.ai/archive/tasks/.gitkeep`
- `scripts/*.mjs`

Existing `.ai/*` memory files are project-owned after creation. The installer
may create missing files, but it must not overwrite existing memory content.

`AGENTS.md` is updated only inside this marked section:

```md
<!-- agent-memory-workflow:start -->
...
<!-- agent-memory-workflow:end -->
```

The marker names are stable in v1.x. Future releases may replace the marked ACE
workflow body, but they must preserve content outside the markers.

## Markdown Section Expectations

ACE tools rely on headings, not exact prose. v1.x tools expect these sections to
exist:

| File | Required sections or signals |
| --- | --- |
| `.ai/current-task.md` | `## Lifecycle`, `## Goal`, `## Business Value / Product Alignment`, `## Technical Approach`, `## Acceptance Criteria`, `## Completion Checklist` |
| `.ai/session-handoff.md` | `## What Was Done`, `## Quality Review`, `## Next Steps` |
| `.ai/decisions.md` | `Decision:`, `Impact:` |
| `.ai/product-roadmap.md` | `## Business Goals`, `## Completed Epics`, `## Planned Features` |
| `.ai/tech-docs.md` | `## Architecture`, `## Data Model / DB Schema`, `## Auth, RBAC, and Security`, `## External APIs and Integrations` |
| `.ai/changed-files.md` | `# Changed Files` |
| `.ai/work-log.md` | `# Work Log` |
| `.ai/reflection-log.md` | `## Unresolved`, `## Resolved` |

The wording inside sections may evolve. Agents and scripts should avoid
depending on entire paragraphs when a heading or labeled value is enough.

## `.ai/memory-config.json` Schema Version 1

The active config schema remains version `1` in v1.0.

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
changes, such as `ace:onboard -- --apply`.

## Migration Policy

Within v1.x:

- Prefer additive Markdown sections and optional config fields.
- Keep existing command names and legacy aliases.
- Preserve existing `.ai/*` files during install.
- Preserve `AGENTS.md` content outside ACE markers.
- Add regression tests for compatibility behavior before changing templates,
  parser assumptions, or install behavior.

For a future schema version `2`:

- Document the reason for the schema bump before implementation.
- Provide deterministic local migration behavior.
- Keep a dry-run or reviewable migration path.
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
