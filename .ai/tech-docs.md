# Technical Docs

Use this file as the project-agnostic technical context source for ACE.
Keep it high-signal so browser-based AI architects can understand the system
without reading large implementation files.

## Architecture
- ACE is a scaffold CLI package. Consumers run `ace-pack init`; the package
  copies local scripts and Markdown memory into the target repository.
- Shipped product behavior lives in `install-ace-pack.mjs`,
  `install-agent-memory-pack.mjs`, root command shims, and `scripts/*.mjs`.
- Repo-local dogfooding state lives in `AGENTS.md`, `CLAUDE.md`, and `.ai/**`;
  those files are excluded from the npm payload.
- Report generation is deterministic and local. `ai-report-brief.mjs` and
  `ai-report.mjs` read Markdown memory, use helpers from
  `ai-memory-utils.mjs`, and write `.ai/report-brief.md` /
  `.ai/report-full.md`.
- `ace:hub` builds focused context payloads in `.ai/generated-context.md`.
  Numeric options remain compatible, and named modes now cover start/coder,
  architect, handoff, PR, business, and docs contexts. AI Coder Context starts
  with `.ai/report-brief.md` when available so new chats see the Start Snapshot
  first, but fresh repos still work before the first report is generated.
- `ace:onboard` performs a bounded local file scan and package/content signal
  scan to recommend conservative repository-specific risk rules. It writes
  `.ai/project-profile.md` and `.ai/memory-config.recommended.json`, and applies
  those rules to `.ai/memory-config.json` only when invoked with `--apply`.
- `ace:gate` is the optional PR/CI quality gate. It reuses ACE memory
  validation, task classification, finish requirements, and shared Markdown
  helpers instead of maintaining a second policy engine.

## Data Model / DB Schema
- Durable state is plain Markdown under `.ai/**` plus JSON configuration in
  `.ai/memory-config.json`.
- Task lifecycle state is stored in `.ai/current-task.md`.
- Handoff state, next steps, verification, and publish decisions are stored in
  `.ai/session-handoff.md`.
- Report Start Snapshot values are generated from local git state and existing
  Markdown sections; no new persistent schema fields were added for `0.1.7`.
- Onboarding profile output includes detected ecosystems, a concise
  `Why Detected` signal summary, repository shape, recommended high-risk paths,
  and recommended high-risk keywords. The memory config schema remains version
  `1` for `0.2.0`.
- Hub output includes a generated metadata header with mode, timestamp, included
  files, and missing optional files. PR mode also includes local git status and
  diff stat, degrading to `unknown` when git is unavailable.
- Gate output is ephemeral CLI output or optional JSON. No new persistent config
  or memory schema fields were added for `0.4.0`.

## Auth, RBAC, and Security
- ACE has no authentication layer and does not manage user credentials.
- Core workflows must not make hidden AI, SaaS, registry, or network calls.
- `0.1.7` report snapshots use local git commands only and degrade to
  `unknown` if git is unavailable or the target is not a git repository.
- `0.4.0` gate checks use local git commands only. GitHub Actions workflow and
  pre-push hook files are generated only when explicitly requested.
- Publish-secret handling is outside ACE scripts; release commands delegate to
  the user's configured npm environment.

## External APIs and Integrations
- Core ACE scripts use Node.js built-ins and local git commands.
- npm is used only by maintainer-invoked package scripts such as
  `release:npm`, `release:npm:dry`, `check:npm-payload`, and `preview:npm`.
- Future AI-assisted documentation generation remains explicit opt-in per
  `ROADMAP.md`; default provider behavior is `off`.

## DevOps and Quality Gates
- Use `npm.cmd test` for Vitest on Windows.
- Use `npm.cmd run ace:check` for ACE memory validation.
- Use `npm.cmd run ace:gate` for optional PR/CI quality gate validation.
- Use `npm.cmd run check:npm-payload` to verify the staged npm tarball excludes
  repo-local dogfooding files.
- Use `npm.cmd run release:npm:dry` before telling the maintainer to publish.
- Publish with `npm.cmd run release:npm` only when the staged npm payload or
  installed ACE behavior changed.
