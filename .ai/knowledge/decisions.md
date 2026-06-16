# Decisions

## 2026-06-13 20:59

Decision:
- Initialize this repository with its own local ACE installer instead of
  hand-writing the memory scaffold.

Reason:
- The repository should validate the same init path that package consumers use,
  and future chats need project state stored in files rather than conversation
  history.

Impact:
- `AGENTS.md`, `CLAUDE.md`, `.ai/*`, and additive `ace:*` package scripts are
  now part of the project workflow.

## 2026-06-13 21:19

Decision:
- Keep the ACE product layer and repo-local ACE dogfooding layer explicitly
  labeled in committed documentation and agent instruction files.

Reason:
- This repository builds ACE while also using ACE locally, so fork maintainers
  and AI agents need a first-context warning that global product behavior lives
  in `scripts/*`, not local `.ai/**` state.

Impact:
- `AGENTS.md` and `CLAUDE.md` start with a meta-architecture warning.
- `DEVELOPING.md` and `.ai/README.md` document file ownership boundaries.
- `npm run check:npm-payload` protects the published package from local AI
  history, reports, and archive snapshots.

## 2026-06-13 21:19

Decision:
- Require a semver bump before publishing shipped package changes, but do not
  require a bump for repo-local dogfooding-only files excluded from npm.

Reason:
- npm rejects republishing the same version, and consumers need version changes
  to discover package updates. Pure `.ai/**`, `AGENTS.md`, `CLAUDE.md`, and
  `DEVELOPING.md` changes do not ship in the npm payload, so bumping for those
  alone creates noisy releases.

Impact:
- Future agents should check whether a change affects the npm payload or
  user-visible ACE behavior before publishing.
- Use patch for fixes/docs/packaging, minor for backward-compatible features,
  and major for breaking CLI/template/workflow changes.

## 2026-06-13 21:35

Decision:
- Publish the npm keyword SEO update as patch version `0.1.4`.

Reason:
- Keyword metadata is part of the shipped npm payload and affects package
  discoverability, but it does not change CLI behavior or installed templates.

Impact:
- `package.json` now uses targeted AgentOps and AI engineering keywords.
- No code behavior, README copy, or lockfile changes are required for this
  metadata release.

## 2026-06-13 21:42

Decision:
- Keep Node guidance generic and never hardcode a maintainer-local Node
  executable path in repo scripts or instructions.

Reason:
- Maintainers may switch between Node versions with nvm. The package only needs
  a semantic runtime requirement, not a path to one developer's local install.

Impact:
- `package.json` keeps the public `node >=20` engine requirement.
- Tests, payload checks, and publish flows should run under any active
  nvm-selected Node version satisfying `>=20`.

## 2026-06-13 22:25

Decision:
- Make npm release verification npm-first and Windows-safe.

Reason:
- VS Code and Git Bash may invoke package scripts through `pnpm`, but the release
  pipeline itself publishes to npm and should not rely on pnpm-specific behavior.
  Directly spawning `npm.cmd` from Node can fail on Windows with `spawn EINVAL`.

Impact:
- `release:npm:dry` now verifies payload guard, `npm pack --dry-run`, and
  `npm publish --dry-run`.
- Windows npm subprocesses inside tooling route through `cmd.exe` with a
  relative `.npm-publish` path.
- VS Code tasks and local helpers call `npm.cmd` explicitly for predictable
  Windows behavior.

## 2026-06-13 22:28

Decision:
- Publish vibe coding positioning as patch version `0.1.5`.

Reason:
- `vibe-coding` is part of the shipped npm metadata and README positioning, so
  it affects package discoverability without changing CLI behavior.

Impact:
- `package.json` includes the `vibe-coding` keyword.
- GitHub and npm README surfaces explain ACE as a memory and guardrail layer for
  scaling natural-language coding beyond small scripts.

## 2026-06-13 23:05

Decision:
- Treat `ROADMAP.md` as the GitHub-only strategic compass for ACE.

Reason:
- Future human and AI contributors need a durable source of product direction,
  anti-goals, minimalism constraints, and long-term research seeds without
  relying on chat history.

Impact:
- Product and architecture changes should preserve the roadmap anti-goals:
  local-first, zero-lock-in, zero-bloat, no hidden AI calls, no SaaS
  requirement, no prompt-library positioning, and no IDE/model lock-in.
- `ROADMAP.md` stays excluded from npm payload unless a future release
  intentionally changes that boundary.

## 2026-06-13 23:05

Decision:
- Future AI-assisted documentation generation must be explicit opt-in.

Reason:
- Hidden local or cloud AI calls can leak code, violate corporate privacy
  policy, consume unexpected tokens, drain batteries, or block the developer
  workflow.

Impact:
- The default provider is `off`.
- Optional local providers such as Ollama or llama.cpp are privacy/cost
  optimizations, not baseline dependencies.
- Optional cloud providers require explicit repo-owned config, API keys, and a
  privacy decision.
- Missing, invalid, unavailable, or timed-out providers must fail open into the
  existing manual or active-agent-assisted Markdown closeout workflow.

## 2026-06-13 23:12

Decision:
- Require every future task handoff to state whether npm publish is required.

Reason:
- GitHub-only docs and repo-local ACE memory changes can look important but do
  not ship to npm. The maintainer needs a clear yes/no signal after each task to
  avoid republishing existing versions or skipping real payload updates.

Impact:
- Future final responses should include `NPM publish: required` or
  `NPM publish: not required`, plus the reason.
- The decision boundary is the staged npm payload and user-visible installed ACE
  behavior, not the full git diff.

## 2026-06-14 01:26

Decision:
- Improve ACE closeout prioritization through shipped templates only, not new
  `ace:finish` enforcement logic.

Reason:
- Different AI agents over-close tasks in different ways when presented with a
  flat wall of rules. A priority ladder gives universal guidance while avoiding
  new blockers, schemas, parsers, or code written for ceremony.

Impact:
- Installed AGENTS, CLAUDE, current-task, and handoff templates now emphasize
  the smallest closeout that preserves future agent context and project safety.
- Future changes should add stricter closeout gates only when there is a real
  safety or handoff failure that template guidance cannot solve.

## 2026-06-14 10:59

Decision:
- Implement v0.2 onboarding by extending the existing `ace:onboard` scanner
  instead of adding a second preset engine or new CLI flow.

Reason:
- The current scanner already has the right zero-dependency shape. Extending its
  rules, signal explanation, and terminal summary gives users the first-run
  value without adding runtime bloat or command complexity.

Impact:
- `ace:onboard` now detects broader JS/TS, Python, Go, Rust, .NET, and monorepo
  signals while keeping `.ai/memory-config.json` schema version `1`.
- Future onboarding improvements should continue using conservative path rules
  and explicit signal summaries before considering new config or preset layers.

## 2026-06-14 11:13

Decision:
- Implement v0.3 Hub UX by extending `ace:hub` with named modes and output
  controls instead of adding a new top-level `ace` router, clipboard
  integration, MCP adapter, or dependency-backed UX layer.

Reason:
- The roadmap goal is daily context generation, not a broader command platform.
  Extending the existing local script gives agents focused payloads while
  preserving zero-dependency, Markdown-first behavior.

Impact:
- `ace:hub` now supports start/coder, architect, handoff, PR, business, and
  docs contexts with metadata headers and PR git summaries.
- Future command consolidation can build on the stable hub modes after real
  usage proves which flows deserve first-class routing.

## 2026-06-14 11:40

Decision:
- Implement v0.4 quality gates as a thin `ace:gate` orchestration layer that
  reuses existing ACE memory validation, task classification, finish
  requirements, and shared Markdown helpers.

Reason:
- PR/CI gates must stay consistent with local ACE workflow. Duplicating
  Markdown parsing or risk policy would create drift and make CI failures less
  trustworthy.

Impact:
- `ace:gate` now provides optional local/CI governance with actionable failure
  messages, PR refs, JSON output, GitHub Actions workflow generation, and safe
  pre-push hook installation.
- Future CI providers should build on the same gate command instead of adding
  provider-specific policy engines.

## 2026-06-14 11:56

Decision:
- Treat fake-project smoke and explicit dogfood self-check as release-readiness
  checks for shipped ACE changes, not as automatic npm publish triggers.

Reason:
- The maintainer wants to batch intermediate versions and publish only the final
  release, but the final candidate still needs installation-level validation in
  disposable projects and in this dogfooding repository.

Impact:
- `smoke:fake-project` validates the local staged package without network or
  npm-latest dependence.
- `dogfood:self-check` applies the local staged package only during an explicit
  reviewed pass and refuses dirty worktrees by default.
- Future handoffs may state `NPM publish: required before final release;
  deferred by maintainer` when shipped changes are intentionally batched.

## 2026-06-14 12:22

Decision:
- Tune `ace:gate` for DevEx by allowing standard low-risk changes without
  Quality Review and adding explicit human override with a required reason.

Reason:
- PR/CI gates should prevent risky AI-assisted merges, not punish humans for
  small safe edits. A visible override keeps accountability without encouraging
  users to delete hooks or disable ACE.

Impact:
- Strict gate review remains for large tasks and high-risk matches.
- `ace:gate -- --human-override <reason>` records intentional bypasses in CLI
  and JSON output.
- `ace:finish` closeout requirements remain unchanged.

## 2026-06-14 12:56

Decision:
- Implement v0.5 MCP support as a read-only stdio resource adapter using Node
  built-ins, without adding an MCP SDK, tools, writes, network listeners, or an
  npm wrapper script.

Reason:
- MCP is useful for letting tools inspect ACE memory, but the core product
  promise is still zero-dependency, local-first, Markdown-first behavior.
  Running through `npm run` can also print lifecycle text to stdout and break
  stdio JSON-RPC framing.

Impact:
- Consumers can configure MCP clients to run
  `node ./scripts/ace-mcp-server.mjs` directly in their repository.
- The adapter exposes selected `.ai/*` Markdown files as resources only.
- Future MCP expansion should preserve the resource-only boundary unless a
  separate optional package is deliberately introduced.

## 2026-06-14 13:17

Decision:
- Implement v0.6 Product Growth Kit as static README, docs, and example
  materials, while explicitly excluding `docs/**` and `examples/**` from the
  npm runtime payload.

Reason:
- ACE needs a clearer first impression and launch material, but product growth
  assets should not add dependencies, commands, installer behavior, or package
  bloat for repositories that only need the scaffold.

Impact:
- README and npm README now point users to a 60-second before/after demo.
- GitHub-only docs contain the demo script and launch copy.
- A tiny context-loss fixture demonstrates auth/session risk for demos.
- Payload guard now rejects accidental `docs/**` or `examples/**` inclusion.

## 2026-06-14 13:37

Decision:
- Promote ACE to v1.0 by documenting and testing the existing compatibility
  contract instead of adding a migration engine before a real schema migration
  exists.

Reason:
- ACE's current stability comes from additive install behavior, project-owned
  Markdown memory, stable command names, and schema version `1`. A migration
  platform would add code and ceremony without a concrete schema change to
  execute.

Impact:
- `docs/schema-compatibility.md` defines stable commands, file expectations,
  Markdown sections, memory-config v1 behavior, and future migration policy.
- Regression tests protect installed-repo compatibility and legacy aliases.
- Future schema v2 work must document the reason, add deterministic migration
  behavior, and include old-repo fixture tests.

## 2026-06-14 14:34

Decision:
- Implement v1.1 daily DevEx polish as additive runtime behavior: small
  low-risk auto-closeout, finish/gate consistency, optional IDE bridges,
  `architect-lite` planning context, and warning-only freshness hints.

Reason:
- v1.0.1 solved adoption documentation, but daily use still had unnecessary
  ceremony for trivial edits and weak native IDE-agent onboarding. These issues
  can be solved without schema v2, dependencies, AI calls, or breaking CLI
  changes.

Impact:
- `ace:finish` and `ace:gate` now share the same small low-risk boundary.
- `ace-pack init` may create missing IDE bridge files but must not overwrite
  project-owned rule files.
- Memory consolidation, docs-only classify tuning, offline adoption docs, and
  mechanical classify-before-code enforcement remain deferred.

## 2026-06-14 15:46

Decision:
- Implement v2.0 as a compatibility-first command router and memory layout
  release: add `npm run ace -- <command>` / `pnpm ace <command>`, canonical
  `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` paths, and
  deterministic v1 legacy migration aliases.

Reason:
- The repo had accumulated many package scripts and high-churn root `.ai/*`
  files. A single router and categorized memory layout improve daily UX and
  reduce future context clutter, but existing installed repositories and agent
  habits must keep working.

Impact:
- The package version moves to `2.0.0` because the canonical memory layout
  changes.
- Existing `ace:*`, `ai:*`, and `agent-memory:*` scripts remain valid.
- Legacy `.ai/*.md`, `.ai/report-*`, and `.ai/generated-context.md` paths remain
  readable during migration without cluttering fresh v2 installs.
- Future schema work must use deterministic migration and old-repo fixture tests
  before changing memory contracts again.

## 2026-06-14 16:26

Decision:
- Tighten the ACE command surface to a single installed `ace` router plus a
  project-owned `ace:validate` mechanical gate.

Reason:
- Injecting many `ace:*`, `ai:*`, and `agent-memory:*` scripts into consumer
  repositories makes ACE look intrusive. `ace:validate` must remain a project
  code-quality gate rather than an alias for ACE memory validation.

Impact:
- Fresh installs expose only `ace` and `ace:validate` in package scripts.
- `ace check` runs ACE memory validation.
- Legacy command names remain available only as router arguments such as
  `pnpm ace ai:task:finish`.
- Installer upgrades prune only old ACE-managed default aliases and preserve
  custom user scripts.

## 2026-06-14 17:10

Decision:
- Implement ACE uninstall as a guarded two-step `ace eject` then `ace destroy`
  workflow.

Reason:
- ACE needs to demonstrate zero-lock-in while protecting project-owned AI
  memory from accidental deletion. A direct destructive command would undermine
  the product promise.

Impact:
- `ace eject` exports active `.ai/**` memory and agent rule files into a
  searchable `ace-export-*` folder with manual restore instructions.
- `ace destroy` refuses active memory without an export, refuses the ACE
  product repository unless explicitly overridden for internal tests, and
  removes only ACE-owned files/scripts while preserving custom project content.
- Installer, router, docs, payload, and tests now treat eject/destroy as shipped
  `ace-pack@2.1.0` behavior.

## 2026-06-16 12:33

Decision:
- Implement Project Conventions Discovery as deterministic local `ace discover`
  heuristics instead of AI-provider analysis.

Reason:
- ACE must preserve its local-first, zero-dependency, no-hidden-AI-calls
  promise while still helping agents reuse established repository patterns.
  Simple import/dependency/path signals are less brittle than pseudo-AST regex
  parsing and safer for large private repositories.

Impact:
- `ace discover` writes `.ai/knowledge/project-conventions.md` with a managed
  marker and protects human-written files unless `--force` is passed.
- `ace hub` and the read-only MCP adapter can expose the conventions summary
  when it exists.
- Future AI-assisted convention discovery remains a separate explicit opt-in
  feature, not part of the default v2.2 workflow.
