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
