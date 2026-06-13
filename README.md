<p align="center">
  <img src="./logo.svg" alt="ACE Pack logo" width="72" height="72" />
</p>

<h1 align="center">ACE Pack</h1>

[![npm version](https://img.shields.io/npm/v/ace-pack?color=0f766e)](https://www.npmjs.com/package/ace-pack)
[![zero dependencies](https://img.shields.io/badge/runtime-zero_dependencies-111827)](#)
[![license](https://img.shields.io/badge/license-MIT-2563eb)](#)

**The zero-dependency cognitive architecture framework for AI-driven development.**

ACE (Agentic Context Engine) gives AI coding agents a deterministic memory
layer, repository-aware risk rules, and repeatable quality gates using plain
Markdown and native Node.js scripts.

AI agents are brilliant, but stateless by default. ACE gives them the project
memory, guardrails, and closeout discipline they need to behave like reliable
engineering teammates inside real repositories.

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
- `.ai/memory-config.json` marks high-risk paths and keywords for the current
  repository.
- `ace:validate` starts as an ACE memory check and can be replaced by each
  repo with its real mechanical quality gate.

## ACE vs. Just Chatting With AI

A chat session is a smart one-off conversation. ACE is a governed agent
workflow.

With ordinary chat, the developer carries the discipline: gather context, repeat
rules, ask for alternatives, remember security constraints, run checks, and
write handoff notes.

With ACE, the repository carries the discipline:

- `ace:classify` detects whether the change is small, standard, or large.
- Large and high-risk work starts with a shift-left design review before code.
- `ace:hub` generates focused context instead of manual copy/paste bundles.
- `ace:finish` commits decisions, changed files, validation notes, and
  reflection back into project memory.

ACE is not a prompt library. It is cognitive architecture for managing AI
coding agents inside real repositories.

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

The key behavior is **Shift-Left Design Review**. For large or high-risk tasks,
the agent must stop before implementation, fill `.ai/current-task.md` with the
business value and technical approach, compare viable patterns, and choose one
explicitly. The code comes after the architectural decision, not before it.

Unknown repositories start with a neutral memory config. Then `ace:onboard`
profiles the repo and recommends project-specific risk rules before they are
applied.

## Quick Start

Install ACE into the current repository:

```bash
pnpm dlx ace-pack init
```

Or with npm:

```bash
npx ace-pack init
```

Install into another repository:

```bash
pnpm dlx ace-pack init ./my-project
```

Profile the project:

```bash
pnpm ace:onboard
pnpm ace:onboard -- --apply
```

For Python, Go, Rust, .NET, or any repo without `package.json`, ACE creates a
lightweight private runner package:

```json
{
  "description": "Auto-generated lightweight runner for ACE (Agentic Context Engine) scripts. No node_modules required."
}
```

No dependency install is required for ACE itself. The runner only exposes
commands such as `ace:onboard`, `ace:hub`, `ace:classify`, and `ace:finish`.

On Windows PowerShell, use `pnpm.cmd` if script execution policy blocks the
regular `pnpm` shim:

```bash
pnpm.cmd ace:onboard -- --apply
pnpm.cmd ace:classify
pnpm.cmd ace:validate
```

Known SaaS monorepo? Apply the built-in preset:

```bash
pnpm ace:onboard -- --preset next-trpc-drizzle-saas --apply
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
pnpm ace:onboard -- --preset next-trpc-drizzle-saas --apply
pnpm ace:classify
pnpm ace:validate
pnpm ace:finish
```

### Python FastAPI

ACE detects `requirements.txt`, `pyproject.toml`, `fastapi`,
`app/core/security.py`, `app/**/auth*.py`, `app/api/**`, and `alembic/**`. The
active project can keep using Poetry, uv, pytest, ruff, or any other Python
tooling; ACE only provides the agent memory and workflow layer.

```bash
pnpm dlx ace-pack init
pnpm ace:onboard -- --apply
pnpm ace:hub
```

### Go Microservice

ACE detects `go.mod`, `internal/auth/**`, `internal/middleware/**`,
`internal/handlers/**`, and `migrations/**`. It gives AI agents the same memory
and risk workflow without changing the Go build pipeline.

```bash
pnpm dlx ace-pack init
pnpm ace:onboard -- --apply
pnpm ace:classify
```

## CLI Reference

| Command | Purpose |
| --- | --- |
| `ace:onboard` | Smart repository profiling. Writes `.ai/project-profile.md` and `.ai/memory-config.recommended.json` without changing active config. |
| `ace:onboard -- --apply` | Merges recommendations into `.ai/memory-config.json` and marks the repo as profiled. |
| `ace:onboard -- --preset next-trpc-drizzle-saas --apply` | Applies the built-in Next.js + tRPC + Drizzle SaaS profile. |
| `ace:onboard -- --check` | Fails if the repository is still unprofiled. |
| `ace:classify` | Git diff risk analysis for small, standard, and large tasks. |
| `ace:validate` | Default mechanical quality gate alias for `ace:check`. Projects may replace it with a stricter local gate. |
| `ace:finish` | Adaptive closeout, memory documentation, reports, and reflection. |
| `ace:hub` | Interactive context generator for copying focused project context into AI tools. |

## Installed Project Files

ACE installs or updates:

- `AGENTS.md` workflow section
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
- `scripts/*` managed ACE automation

Existing memory files are not overwritten. Existing `package.json` files are
preserved and updated idempotently.

## Development

```bash
git clone https://github.com/alex-boom/ace-pack.git
cd ace-pack
pnpm install
pnpm test
```

Optional local link:

```bash
pnpm link --global
ace-pack init ./target-project
```
