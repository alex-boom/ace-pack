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
  helpers instead of maintaining a second policy engine. v0.4.1 keeps strict
  Quality Review enforcement for large or high-risk changes, but lets standard
  low-risk changes pass without review ceremony.
- `ace-mcp-server.mjs` is the optional read-only MCP stdio adapter. It exposes
  selected ACE Markdown files through `resources/list` and `resources/read`,
  with no tools, writes, SDK dependency, network listener, or npm-script wrapper.
- Product growth materials live outside runtime code. `docs/demo-script.md`,
  `docs/launch-copy.md`, and `examples/context-loss-demo/**` support demos and
  launch work, while README/README.npm provide only the concise entry point.
- v1.0 stability documentation lives in `docs/schema-compatibility.md`. It
  defines stable command names, installed file expectations, Markdown section
  expectations, `.ai/memory-config.json` schema version `1`, and migration
  policy.
- Release-readiness tooling lives in `tools/`. `smoke:fake-project` builds the
  local staged package and validates ACE inside disposable JS and non-JS
  projects. `dogfood:self-check` explicitly reapplies the local candidate to
  this repository after checking git state.

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
  or memory schema fields were added for `0.4.0` or `0.4.1`.
- MCP output is ephemeral JSON-RPC over stdio. No new persistent config,
  schema fields, or generated memory files were added for `0.5.0`.
- v0.6 growth-kit output is static documentation and demo fixtures only. No
  persistent ACE schema, config fields, generated files, or installed workflow
  files were added.
- v1.0 keeps `.ai/memory-config.json` at schema version `1`. Unknown config
  fields are tolerated by readers, string rules remain compatible, and missing
  thresholds fall back to defaults.
- Smoke and dogfood readiness output is ephemeral. The tools do not add config
  files or schema fields.

## Auth, RBAC, and Security
- ACE has no authentication layer and does not manage user credentials.
- Core workflows must not make hidden AI, SaaS, registry, or network calls.
- `0.1.7` report snapshots use local git commands only and degrade to
  `unknown` if git is unavailable or the target is not a git repository.
- `0.4.0` gate checks use local git commands only. GitHub Actions workflow and
  pre-push hook files are generated only when explicitly requested.
- `0.4.1` human override requires a reason and surfaces that reason in CLI/JSON
  output; it does not hide failures or create persistent policy state.
- `0.5.0` MCP support is read-only resources only. The adapter omits missing
  files from resource discovery and performs no repository writes.
- `0.6.0` marketing/demo materials are excluded from the npm payload through the
  package file list and payload guard; they do not run automatically.
- `1.0.0` compatibility guarantees are documentation and tests around existing
  behavior; no migration engine, network behavior, or automatic writes were
  added.
- Dogfood self-check refuses dirty git worktrees by default and stops when
  unexpected files change after candidate self-apply.
- Publish-secret handling is outside ACE scripts; release commands delegate to
  the user's configured npm environment.

## External APIs and Integrations
- Core ACE scripts use Node.js built-ins and local git commands.
- MCP clients should run `node ./scripts/ace-mcp-server.mjs` directly from the
  target repository. Do not wrap the stdio adapter with `npm run`, because npm
  lifecycle output can corrupt JSON-RPC stdout framing.
- npm is used only by maintainer-invoked package scripts such as
  `release:npm`, `release:npm:dry`, `check:npm-payload`, and `preview:npm`.
- Future AI-assisted documentation generation remains explicit opt-in per
  `ROADMAP.md`; default provider behavior is `off`.

## DevOps and Quality Gates
- Use `npm.cmd test` for Vitest on Windows.
- Use `npm.cmd run ace:check` for ACE memory validation.
- Use `npm.cmd run ace:gate` for optional PR/CI quality gate validation.
- Use `npm.cmd run smoke:fake-project` to validate the local staged package in
  disposable projects before final release.
- Use `npm.cmd run release:ready` for the full pre-final-release sequence:
  tests, fake-project smoke, `ace:gate`, payload guard, and npm dry-run.
- Use `npm.cmd run dogfood:self-check` only during an explicit reviewed
  release-readiness pass on a clean or intentionally accepted worktree.
- Use `npm.cmd run check:npm-payload` to verify the staged npm tarball excludes
  repo-local dogfooding files.
- Use `npm.cmd run release:npm:dry` before telling the maintainer to publish.
- Publish with `npm.cmd run release:npm` only when the staged npm payload or
  installed ACE behavior changed.
