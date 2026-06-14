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
