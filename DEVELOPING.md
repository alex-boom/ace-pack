# Developing ACE with ACE

This repository has two ACE layers:

- **Product layer**: the source code and assets that build, publish, and install
  ACE for other repositories.
- **Repo-local dogfooding layer**: the ACE memory used by this repository while
  developing ACE itself.

Do not confuse them. If a task asks to change ACE behavior for users, edit the
product layer. If a task asks to update this repository's current AI working
state, edit the dogfooding layer.

## Product / Shipped Layer

These files define the package users install:

- `install-ace-pack.mjs` and `install-agent-memory-pack.mjs`
- `scripts/*.mjs`
- root CLI shims such as `ace-pack.cmd` and `install-ace-pack.cmd`
- `README.md`, `README.npm.md`, `logo.svg`, and `logo-npm.svg`
- `tests/**`
- `package.json` package metadata, `bin`, `files`, and publish scripts

Consumer-installed ACE behavior comes from `scripts/agent-memory-templates.mjs`
and related `scripts/*` source files. Edit those files when changing the
instructions, memory templates, reports, onboarding, classification, or finish
workflow installed into other repositories.

## Product Philosophy

Read `ROADMAP.md` before product or architecture changes. It is the strategic
compass for ACE's vision, anti-goals, roadmap, minimalism constraints, and
future AI provider policy.

ACE is the local AgentOps control layer for vibe coding. It must remain useful
without local LLMs, cloud API keys, GPUs, SaaS accounts, or hidden network
calls. The durable source of truth is plain Markdown in the repository.

Minimalism constraints:

- Prefer native Node.js built-in modules and Git primitives over heavy
  dependencies.
- Keep installed consumer repositories self-owned and lightweight.
- Do not add Cloud or SaaS requirements to the core workflow.
- Do not lock ACE to one IDE, editor, LLM, or agent vendor.
- Do not turn ACE into an AI agent that writes code or a prompt library.
- Prefer native Git hooks and CI templates over Husky-style dependency stacks.
- For ACE's own future test infrastructure, prefer Node's native `node:test`
  where practical. Migrating existing tests is a separate task.

Future AI-assisted documentation generation must be explicit opt-in. The default
provider is always `off`; ACE must never call local or cloud AI providers without
repo-owned configuration. If an optional provider such as `ollama`, `openai`, or
`anthropic` is unavailable, invalid, or times out, ACE must fail open into the
manual or active-agent-assisted Markdown closeout workflow.

## Repo-Local Dogfooding Layer

These files are ACE running inside this repository:

- `AGENTS.md`
- `CLAUDE.md`
- `.ai/**`
- `.ai/report-*.md`
- `.ai/report-full.xml`
- `.ai/archive/**`

These files are useful for future maintainers and forks, but they are not the
consumer scaffold. Editing them changes only how AI agents work in this repo.

## NPM Payload Boundary

The published npm package must not include repo-local dogfooding state. The
package payload is controlled by `package.json.files` and the staged publish
flow:

```bash
npm run preview:npm
npm run check:npm-payload
```

The npm tarball should contain only the package README, logos, CLI entrypoints,
root `.mjs` files, root `.cmd` shims, and `scripts/*.mjs`. It must exclude
`.ai/**`, `AGENTS.md`, `CLAUDE.md`, `DEVELOPING.md`, `ROADMAP.md`, `docs/**`,
`examples/**`, reports, and archive snapshots.

## Versioning Policy

Before publishing, bump `package.json` whenever the shipped package payload or
user-visible ACE behavior changed.

- Use `npm version patch --no-git-tag-version` for bug fixes, docs included in
  the npm README, packaging fixes, and small compatible behavior changes.
- Use `npm version minor --no-git-tag-version` for new backward-compatible
  commands, templates, reports, onboarding behavior, or workflow features.
- Use `npm version major --no-git-tag-version` for breaking CLI, template,
  install, or workflow changes.
- Do not bump solely for repo-local dogfooding files that are excluded from npm:
  `.ai/**`, `AGENTS.md`, `CLAUDE.md`, `DEVELOPING.md`, reports, and archive
  snapshots.
- If a change includes both repo-local memory and shipped product files, bump
  based on the shipped product impact.

## NPM Publish Decision Rule

Every task handoff must explicitly state one of:

- `NPM publish: required`
- `NPM publish: not required`
- `NPM publish: required before final release; deferred by maintainer`

Use the staged npm payload as the decision boundary. Publishing is required only
when a change affects files that consumers receive from `.npm-publish/` or
changes installed ACE behavior:

- `package.json` package metadata, `bin`, `files`, `engines`, or published
  scripts.
- `README.npm.md`, because it becomes the npm package `README.md`.
- `logo.svg`, `logo-npm.svg`, `LICENSE`, root CLI shims, root `.mjs`
  entrypoints, or `scripts/*.mjs`.
- Any packaging change that changes the tarball contents or install behavior.

Publishing is not required for GitHub-only or repo-local changes by themselves:

- `README.md` when `README.npm.md` is unchanged.
- `ROADMAP.md`, `DEVELOPING.md`, `AGENTS.md`, `CLAUDE.md`, `.ai/**`,
  `.vscode/**`, `.local/**`, `tools/**`, reports, and archive snapshots.

Intermediate versions may remain unpublished while a final release is still
being assembled. In that case, use the deferred publish wording above and keep
the next release-readiness checks in `.ai/state/task-state.md`.

## Release Readiness Checks

Before final npm publish for shipped package changes, run the local candidate
through both automated release checks and explicit dogfood validation:

```bash
npm run release:ready
```

`release:ready` runs unit tests, the fake-project smoke, `ace:gate`, npm payload
guard, and npm dry-run publishing. The fake-project smoke installs ACE from the
local staged package into disposable JS and non-JS repositories; it never uses
`npm latest`.

Run dogfood self-check only as an explicit release-readiness pass:

```bash
git status --short
npm run dogfood:self-check
```

The dogfood self-check requires a clean git worktree by default, applies the
local staged ACE package to this repository, then runs `ace:check`, `ace:gate`,
and `ace:hub start`. If only expected ACE-managed files changed, review and keep
them as dogfood sync. If unexpected product files changed, stop and inspect the
diff before continuing.

Before telling the maintainer to publish, run `npm.cmd run release:npm:dry`.
If npm says the current version already exists, bump semver first. Use
`npm.cmd view ace-pack version` when confirming whether the current
`package.json` version is already published.

Release flow:

```bash
npm version patch --no-git-tag-version
npm run check:npm-payload
npm run publish:npm
```

## Rule of Thumb

- Change `scripts/*` to change ACE for users.
- Change `.ai/**`, `AGENTS.md`, or `CLAUDE.md` to change only this repo's AI
  development workflow.
- Bump `package.json` before publishing shipped package changes.
- Always tell the maintainer whether npm publish is required.
- Run `npm run check:npm-payload` before publishing.
