<p align="center">
  <img src="./logo-npm.svg" alt="ACE Pack logo" width="72" height="72" />
</p>

<h1 align="center">ACE Pack</h1>

[![npm version](https://img.shields.io/npm/v/ace-pack?color=0f766e)](https://www.npmjs.com/package/ace-pack)
[![zero dependencies](https://img.shields.io/badge/runtime-zero_dependencies-111827)](#)
[![license](https://img.shields.io/badge/license-MIT-2563eb)](#)

**Zero-dependency local AgentOps for AI coding agents. Vibe coding that survives real repositories.**

```bash
npx ace-pack@latest init
```

- **Project memory**: keep decisions, handoffs, and task state in plain Markdown.
- **Risk rules**: mark auth, data, migrations, and other sensitive paths before edits.
- **Repeatable workflow**: classify, review, validate, and finish AI-assisted changes.

Vibe coding is fast, but it gets fragile when projects grow and AI loses
context. ACE adds the memory and guardrails that let natural-language coding
scale beyond single-file scripts.

ACE (Agentic Context Engine) is a local AgentOps control layer for developers
using Cursor, Claude Code, Aider, ChatGPT, GitHub Copilot, and other AI coding
assistants. It gives agents durable project memory, repository-aware risk
rules, and repeatable quality gates through plain Markdown and native Node.js
scripts.

AI coding assistants are powerful, but stateless by default. ACE gives them the
project memory, guardrails, and closeout discipline they need to behave like
reliable engineering teammates inside real repositories.

## 60-Second Demo

ACE is easiest to understand as a before/after:

1. Without ACE, an AI chat edits `src/auth/session.ts` without loading project
   memory, risk rules, or prior decisions.
2. With ACE, onboarding marks auth as high-risk, `ace classify` forces the
   right task tier, and the agent records approach, verification, and handoff.
3. The next chat starts from `ace hub start` instead of asking the human to
   rebuild context manually.

GitHub includes the full demo kit:

- [Scriptable demo walkthrough](https://github.com/alex-boom/ace-pack/blob/main/docs/demo-script.md)
- [Launch copy](https://github.com/alex-boom/ace-pack/blob/main/docs/launch-copy.md)
- [Tiny context-loss demo fixture](https://github.com/alex-boom/ace-pack/blob/main/examples/context-loss-demo/README.md)

## Quick Start

Install ACE into the current repository. Use `init`; do not use
`npm install ace-pack` for project setup.

```bash
npx ace-pack@latest init
```

Then profile the project:

```bash
npm run ace -- onboard --apply
npm run ace -- check
```

Prefer pnpm? Use the same flow through `pnpm dlx`:

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace check
```

Install into another repository:

```bash
npx ace-pack@latest init ./my-project
```

Install and apply onboarding in one command:

```bash
npx ace-pack@latest init --apply
```

Need help?

```bash
npx ace-pack@latest --help
npx ace-pack@latest init --help
```

## Project Conventions Discovery

After onboarding, run `ace discover` to generate a compact registry of the
project's existing patterns:

```bash
pnpm ace discover
npm run ace -- discover
```

ACE writes `.ai/knowledge/project-conventions.md` with a local, deterministic
summary of conventions such as UI component folders, styling tools, routing
boundaries, logging packages, error wrappers, data models, and persistence
patterns. The scanner uses simple path, dependency, and import-string
heuristics only. It does not parse ASTs, call AI providers, make network
requests, or enumerate every file in large projects.

`ace hub` includes the conventions file when present, so agents can reuse
existing project idioms instead of creating duplicate utilities, components, or
architecture.

## Safe Eject & Uninstall

ACE is zero-lock-in. Before removing it, export your project memory into a
searchable folder:

```bash
pnpm ace eject
pnpm ace destroy
```

Using npm:

```bash
npm run ace -- eject
npm run ace -- destroy
```

`ace eject` creates `ace-export-YYYYMMDD-HHMMSS/` with `.ai/`, agent rule
files, IDE bridge files, and `RESTORE.md` when active memory exists. `ace
destroy` then removes only ACE-owned artifacts: `.ai/`, exact ACE-generated
files, managed ACE scripts, and ACE-owned package scripts. Custom project files,
custom scripts, `DEVELOPING.md`, and `ROADMAP.md` are preserved.

## Why ACE Exists

AI-assisted development has a new set of failure modes that ordinary chat does
not solve:

- **Context Amnesia** - the agent forgets last week's architecture decisions
  and suggests reworking settled systems.
- **Architectural Drift** - the agent invents new patterns, libraries, or
  boundaries because the project rules are not loaded every time.
- **Security Blind Spots** - auth, tokens, private data, migrations, and
  environment isolation look like ordinary code unless they are marked as
  high-risk.
- **Prompt Fatigue** - humans waste time collecting files, repeating rules, and
  reminding the agent to validate, document, and hand off its work.

ACE turns those soft expectations into local project structure:

- `.ai/*` Markdown files keep task state, decisions, handoffs, and reflection
  readable by any LLM.
- `AGENTS.md` keeps stack, architecture, and workflow rules close to the code.
- `.ai/config/memory-config.json` marks high-risk paths and keywords for the
  current repository; legacy `.ai/memory-config.json` is still readable during
  migration.
- `ace check` validates ACE memory. `ace:validate` is a project-owned
  mechanical gate placeholder for lint, typecheck, tests, or equivalent checks.

## ACE vs. Just Chatting With AI

A chat session is a smart one-off conversation. ACE is a governed agent
workflow.

With ordinary chat, the developer carries the discipline: gather context, repeat
rules, ask for alternatives, remember security constraints, run checks, and
write handoff notes.

With ACE, the repository carries the discipline:

- `ace classify` detects whether the change is small, standard, or large,
  including staged-only and path-scoped hotfixes.
- Large and high-risk work starts with a shift-left design review before code.
- `ace hub` generates focused context instead of manual copy/paste bundles.
- `task-state.md` carries `Current Phase` and `Next Autonomous Action`, so solo
  agents can switch roles and multi-agent workflows can hand off through local
  Markdown.
- `ace finish` commits decisions, changed files, validation notes, and
  reflection back into project memory; small low-risk changes can auto-close
  with compact notes.

ACE is not a prompt library. It is a local AgentOps control layer for managing
AI coding agents inside real repositories.

## What ACE Boosts

**For the AI agent**

- Context packing that points the model at the right files first.
- Strict guardrails for high-risk code paths and keywords.
- Stateful reflection so repeated mistakes become visible project memory.
- A universal Markdown format readable by GPT, Claude, Cursor, Aider, and other
  coding agents.

**For the human developer**

- Automated review prompts and closeout discipline.
- Self-documenting architecture and decision history.
- Zero framework lock-in and no runtime dependencies.
- Less boilerplate in every agent session.

## How It Works

```text
Classify Risk -> Shift-Left Design Review -> Write Code -> Validate -> Commit to Memory
```

ACE is intentionally boring technology: standard Markdown in `.ai/`, standard
`package.json` scripts, and native Node.js.

From v2 onward, daily commands can use a single router:

```bash
npm run ace -- hub start
npm run ace -- classify
npm run ace -- finish
```

Legacy command names remain supported only as router arguments, such as
`pnpm ace ai:task:finish` or `npm run ace -- ai:task:finish`.

When a repository already has unrelated local work, scope the hotfix instead of
letting the whole dirty worktree inflate the task tier:

```bash
pnpm ace classify --staged
pnpm ace finish --staged

pnpm ace classify --path src/button.tsx --path tests/button.test.ts
pnpm ace finish --path src/button.tsx --path tests/button.test.ts
```

Use `--staged` after staging only the intended fix, or repeat `--path` for the
files in scope. `--paths a,b` is also supported. Scoped fast fixes still run the
same path and keyword risk rules, and PR refs (`--base` / `--head`) cannot be
combined with local scope flags.

The key behavior is **Shift-Left Design Review**. For large or high-risk tasks,
the agent must fill `.ai/state/task-state.md` with the business value and
technical approach, compare viable patterns, and choose one explicitly before
implementation. Standard, large, and high-risk tasks also document
`Edge Cases & Red Teaming` before Implementation. It then updates
`Current Phase` and `Next Autonomous Action` directly in Markdown and keeps
moving unless it is genuinely blocked. If the task bogs down, ACE exposes that
friction through `Friction Encountered: yes`, reflection-log notes, and the
finish work-log entry.

Unknown repositories start with a neutral memory config. Then `ace onboard`
profiles the repo and recommends project-specific risk rules before they are
applied. The scanner recognizes common JS/TS, Python, Go, Rust, .NET, and
monorepo signals without installing dependencies or calling external services.

## What Init Does

`ace-pack init` adds or updates local project files:

- `AGENTS.md` and `CLAUDE.md`
- `.ai/config`, `.ai/state`, `.ai/knowledge`, and `.ai/generated` memory files
  with legacy `.ai/*` paths readable during migration
- `scripts/*` ACE automation copied into the project
- `package.json` scripts for the `ace` router and project-owned
  `ace:validate` mechanical gate

ACE does not need to remain installed as a runtime dependency. The npm package
acts as a scaffold CLI, then the project owns the copied scripts.

For Python, Go, Rust, .NET, or any repo without `package.json`, ACE creates a
lightweight private runner package so the same commands are available:

```json
{
  "description": "Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required."
}
```

On Windows PowerShell, use `pnpm.cmd` if script execution policy blocks the
regular `pnpm` shim:

```bash
pnpm.cmd dlx ace-pack init
pnpm.cmd ace onboard --apply
pnpm.cmd ace check
```

Known SaaS monorepo? Apply the built-in preset:

```bash
pnpm ace onboard --preset next-trpc-drizzle-saas --apply
```

Legacy entry points remain available:

```bash
pnpm dlx agent-memory-pack ./my-project
```

## Multi-Language Examples

### Next.js + tRPC + Drizzle

ACE detects signals such as `next.config.ts`, `@trpc/server`, `drizzle-orm`,
`middleware.ts`, `packages/api/src/routers/**`, and
`packages/db/src/schema/**`. These become high-risk rules so auth, middleware,
routers, and migrations get stricter review before code changes.

```bash
pnpm ace onboard --preset next-trpc-drizzle-saas --apply
pnpm ace classify
pnpm ace:validate
pnpm ace finish
```

### Python FastAPI

ACE detects `requirements.txt`, `pyproject.toml`, `fastapi`,
`app/core/security.py`, `app/**/auth*.py`, `app/api/**`, and `alembic/**`. The
active project can keep using Poetry, uv, pytest, ruff, or any other Python
tooling; ACE only provides the agent memory and workflow layer.

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace hub
```

### Go Microservice

ACE detects `go.mod`, `internal/auth/**`, `internal/middleware/**`,
`internal/handlers/**`, and `migrations/**`. It gives AI agents the same memory
and risk workflow without changing the Go build pipeline.

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace classify
```

### Rust Service

ACE detects `Cargo.toml`, web framework signals such as Axum, Actix, and
Rocket, database tooling such as SQLx and Diesel, plus auth, middleware,
handlers, routes, schema, and migrations.

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace hub
```

### Generic Monorepo

ACE detects `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, and
`package.json` workspaces. It keeps rules conservative, marking sensitive
workspace auth, database, middleware, and API paths without treating every
`apps/**` or `packages/**` file as high-risk.

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace classify
```

## ACE Hub

`ace hub` is the daily context launcher. Every payload header includes
`Current Phase` and `Next Autonomous Action` before the file sections, so a
newly awakened agent sees the handoff state immediately. Use the interactive
menu, or generate a specific payload directly:

```bash
pnpm ace hub
pnpm ace hub start
pnpm ace hub red-team
pnpm ace hub review
pnpm ace hub distill
pnpm ace hub --mode pr
pnpm ace hub --list
```

Available modes:

- `start` / `coder` - startup context with `.ai/generated/report-brief.md`
  first, plus project conventions when available.
- `architect` - repo rules, project conventions, technical docs, decisions,
  roadmap, and brief.
- `architect-lite` / `plan` - lower-token planning context without full
  decisions history.
- `handoff` - compact agent handoff context.
- `red-team` / `redteam` - adversarial planning prompt with task intent,
  project conventions, configured risk rules, and mitigation pressure.
- `review` / `eval` - strict agentic evaluation prompt with original intent,
  project conventions, triggered risk rules, and current git diff.
- `distill` / `promote` - knowledge promotion prompt that turns resolved
  reflections into durable project conventions.
- `pr` - PR summary context with local git status and diff stat.
- `business` - roadmap and work log.
- `docs` - technical docs and optional setup/devops notes.

By default ACE writes `.ai/generated/context.md`. Legacy
`.ai/generated-context.md` remains readable during migration. For automation:

```bash
pnpm ace hub --mode start --stdout
pnpm ace hub --mode red-team --stdout
pnpm ace hub --mode review --stdout
pnpm ace hub --mode distill --stdout
pnpm ace hub --mode architect-lite --stdout
pnpm ace hub --mode architect --output .ai/architect-context.md
pnpm ace hub --mode pr --json
```

## Context Hygiene

Use `ace hub distill` when resolved reflections should become permanent project
rules. ACE generates a strict knowledge-promotion prompt from
`.ai/knowledge/reflection-log.md` and the current
`.ai/knowledge/project-conventions.md`; it does not call an LLM or edit files
for you.

Use `ace archive` when active logs get too large for daily context. The command
mechanically rotates only `.ai/knowledge/work-log.md` and
`.ai/knowledge/reflection-log.md` into `.ai/archive/`, then creates fresh active
files with clickable links back to the archived history. `decisions.md` remains
active durable history in v3.5.

```bash
pnpm ace hub distill --stdout
pnpm ace archive --dry-run --max-lines 100
pnpm ace archive --max-lines 100
```

## PR and CI Quality Gates

`ace gate` is an optional pre-merge check for teams using AI-generated changes.
It reuses ACE memory validation, task classification, and closeout rules, then
prints actionable failures for CI logs.

Small low-risk changes stay low-ceremony: `ace finish` can write compact
closeout notes, and `ace gate` does not demand design or quality-review
sections for those changes. Standard, large, high-risk, and
design-review-required work keeps stricter review expectations.

For urgent hotfixes inside a dirty worktree, classify and finish the same
explicit scope with `--staged` or repeated `--path` flags. This keeps the
fast-fix path auditable without bypassing ACE risk rules.

```bash
pnpm ace gate
pnpm ace gate --base origin/main --head HEAD
pnpm ace gate --json
```

For small human-reviewed changes where the team intentionally accepts a gate
bypass, record the reason explicitly:

```bash
pnpm ace gate --human-override "Human reviewed typo-only docs change."
```

For manual closeout when the task was unusually hard, record friction directly:

```bash
pnpm ace finish --friction "Unclear API docs caused repeated validation loops"
```

Generate an opt-in GitHub Actions workflow:

```bash
pnpm ace gate --write-github-action
```

Install a native pre-push hook when you want local protection before pushing:

```bash
pnpm ace gate --install-pre-push
```

ACE never installs hooks automatically. If a non-ACE pre-push hook already
exists, ACE writes `.git/hooks/pre-push.ace.sample` instead of overwriting it.

## Read-Only MCP Adapter

ACE includes a zero-dependency, read-only MCP stdio adapter for tools that can
consume Model Context Protocol resources. It exposes selected `.ai/*` Markdown
memory as resources and performs no writes, no AI calls, and no network calls.

For MCP client configuration, run the script directly with `node` so stdout
contains only JSON-RPC messages:

```json
{
  "mcpServers": {
    "ace": {
      "command": "node",
      "args": ["./scripts/ace-mcp-server.mjs"],
      "cwd": "/absolute/path/to/your/repo"
    }
  }
}
```

Do not configure MCP clients through `npm run`; npm may print lifecycle output
to stdout, which breaks stdio MCP framing.

Exposed resources include the brief report, task state, decisions, roadmap,
technical docs, project conventions, and generated hub context when those files
exist. Legacy current-task and handoff MCP URIs remain deprecated aliases for
the consolidated task state.

## v3.5 Schema and Compatibility

ACE v3.5 keeps categorized canonical memory paths under `.ai/config`,
`.ai/state`, `.ai/knowledge`, and `.ai/generated`, and consolidates active task
memory into `.ai/state/task-state.md`. The config schema remains version `1`.
Fresh v3 installs create only the consolidated task-state file. Existing v2
task files are auto-migrated locally with a timestamped backup before cleanup.
Existing memory remains project-owned, and the installer stays additive and
idempotent.

Task state now includes additive autonomous routing labels:
`Current Phase: Planning` and `Next Autonomous Action: Analyze task and update
Business Value & Approach.` Existing v3 task-state files without these labels
remain valid.

Fresh task-state now also includes `### Edge Cases & Red Teaming` under
Business Value & Approach. Standard, large, and high-risk planning can use
`ace hub red-team` to generate an adversarial critique before Implementation.

Fresh task-state also includes `Friction Encountered: no`. Agents flip it to
`yes` when validation loops, repeated review failures, or missing architecture
context slow the task down, then record the cause in
`.ai/knowledge/reflection-log.md`. Humans can use `ace finish --friction
"<reason>"` to force the same log during closeout.

`ace hub review` adds agentic evaluation without hidden AI calls. It generates a
strict reviewer prompt from task intent, acceptance criteria, project
conventions, triggered high-risk rules, and the current local git diff,
including bounded pseudo-diff entries for new untracked text files.

`ace hub distill` adds knowledge promotion without hidden AI calls. It generates
a prompt for turning resolved reflections into durable project conventions.
`ace archive` adds deterministic log rotation for only `work-log.md` and
`reflection-log.md`; the fresh active files link to the archived Markdown with
relative clickable links.

Read the full contract on GitHub:
[ACE v3.5 Schema and Compatibility](https://github.com/alex-boom/ace-pack/blob/main/docs/schema-compatibility.md).

## Adoption Guides

Rolling ACE into a team should start small: install it in one repository,
profile risk, connect the real validation command, and add CI gates only after
the workflow proves useful.

- [ACE Adoption Checklist](https://github.com/alex-boom/ace-pack/blob/main/docs/adoption-checklist.md)
- [ACE FAQ](https://github.com/alex-boom/ace-pack/blob/main/docs/faq.md)

## Release Readiness for ACE Maintainers

ACE maintainers can batch shipped changes and publish only a final release. For
local candidate validation, run the disposable fake-project smoke before final
publish:

```bash
npm run smoke:fake-project
```

The smoke creates temporary JS and non-JS projects, installs ACE from the local
candidate package, runs onboarding, validates memory, generates start context,
and runs `ace gate`. It does not use `npm latest`.

Before a final release, run the release-readiness sequence:

```bash
npm run release:ready
```

When explicitly dogfooding the candidate against this repository, use:

```bash
npm run dogfood:self-check
```

The dogfood self-check requires a clean git worktree by default, applies the
local staged ACE package, runs `ace check`, `ace gate`, and `ace hub start`, and
then stops if unexpected files changed.

## CLI Reference

| Command | Purpose |
| --- | --- |
| `ace <command>` | Unified router for daily commands, used as `npm run ace -- <command>` or `pnpm ace <command>`. |
| `ace onboard` | Smart repository profiling with terminal summary. Writes `.ai/config/project-profile.md` and `.ai/config/memory-config.recommended.json` without changing active config. |
| `ace onboard --apply` | Merges recommendations into `.ai/config/memory-config.json` and marks the repo as profiled. |
| `ace onboard --preset next-trpc-drizzle-saas --apply` | Applies the built-in Next.js + tRPC + Drizzle SaaS profile. |
| `ace onboard --check` | Fails if the repository is still unprofiled. |
| `ace discover` | Generate a concise local project conventions and pattern registry. |
| `ace classify` | Git diff risk analysis for small, standard, and large tasks, with `--staged` and `--path` scope flags for fast fixes. |
| `ace:validate` | Project-owned mechanical quality gate for lint, typecheck, tests, or equivalent checks. ACE installs a placeholder only when absent. |
| `ace eject` | Safe data-takeout step that exports active ACE memory before uninstall. |
| `ace destroy` | Guarded cleanup that removes only ACE-owned files after export. |
| `ace finish` | Adaptive closeout, phase completion, friction tracking, scoped small low-risk auto-closeout, memory documentation, reports, and reflection. |
| `ace gate` | Optional PR/CI quality gate with actionable failures, PR refs, JSON output, explicit human override, and opt-in hook/workflow generation. |
| `ace hub` | Interactive and named-mode context generator with phase/action metadata for start, red-team, review, distill, architect-lite, architect, handoff, PR, business, and docs payloads. |
| `ace archive` | Deterministic active-log rotation for work-log and reflection-log into `.ai/archive/`. |

## Installed Project Files

ACE installs or updates:

- `AGENTS.md` workflow section
- `CLAUDE.md`
- `.ai/config/**`
- `.ai/state/**`
- `.ai/knowledge/**`
- `.ai/generated/**`
- legacy `.ai/*.md` and `.ai/*.json` mirrors for compatibility
- `.ai/archive/.gitkeep`
- `.ai/archive/tasks/.gitkeep`
- `scripts/*` managed ACE automation
- optional IDE bridge files: `.cursorrules`, `.windsurfrules`, and
  `.github/copilot-instructions.md`

Existing memory files are not overwritten. Existing `package.json` files are
preserved and updated idempotently. Existing IDE rule files are not overwritten;
ACE-created bridge files only point native IDE agents back to `AGENTS.md` and
the local `ace` router and `ace:validate` gate.

`ace discover` can later create `.ai/knowledge/project-conventions.md`; init
does not create it automatically.

## Development

```bash
git clone https://github.com/alex-boom/ace-pack.git
cd ace-pack
npm install
npm test
```

Optional local link:

```bash
npm link
ace-pack init ./target-project
```
