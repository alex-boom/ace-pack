# ACE Roadmap

ACE is the local AgentOps control layer for AI-driven and vibe coding
development. It is not an AI coding agent. It is the memory, guardrail, and
workflow layer that lets AI agents behave like disciplined engineers inside real
repositories.

## Vision

ACE should become the standard local safety and memory layer for repositories
that use AI coding agents.

**Product promise:** Vibe coding that survives real repositories.

ACE stays useful because its durable state is plain Markdown, its automation is
local, and its core workflow does not depend on any single IDE, model provider,
cloud service, or hosted database.

## Anti-Goals

ACE will not become:

- An AI agent that writes code.
- A Cloud or SaaS requirement.
- A tool locked to one IDE, editor, LLM, or agent vendor.
- A heavy runtime dependency bundle.
- A prompt library.

These anti-goals are product constraints. Future features must preserve the
local-first, zero-lock-in, zero-bloat character of the tool.

## Minimalism Principles

- Prefer native Node.js and Git primitives over framework or service
  dependencies.
- Keep installed consumer repositories lightweight and self-owned.
- Treat generated Markdown files as the source of truth.
- Prefer small, inspectable scripts over hidden automation.
- Never require GPUs, local LLMs, cloud API keys, or SaaS accounts for the core
  ACE workflow.

Build tools for future distribution formats may be used inside ACE development,
but they must not leak into consumer repositories or become part of the installed
runtime contract.

## Explicit AI Opt-In Policy

Future AI-assisted documentation generation must be explicit opt-in.

Default behavior:

- The default provider is always `off`.
- ACE must not make automatic AI calls or network requests without explicit
  repository configuration.
- Manual or active-agent-assisted Markdown closeout remains the guaranteed
  fallback.

Future configuration may live in a repo-owned file such as
`.ai/agentops.config.json`:

```json
{
  "ace": {
    "autoDocumentation": {
      "enabled": true,
      "provider": "off",
      "model": "",
      "privacyMode": "strict"
    }
  }
}
```

Provider expectations:

- `off`: no automatic AI generation; the active coding agent or developer fills
  Markdown memory files.
- `ollama`: local and private, but requires explicit local setup and may trade
  quality, speed, and battery life for privacy.
- `openai` or `anthropic`: higher-quality cloud generation, but requires
  explicit team approval, API keys, and a privacy decision.

If a provider is missing, invalid, unavailable, or times out, ACE must fail open
into the existing manual or active-agent-assisted Markdown workflow. Hidden
fallbacks from local to cloud are not allowed.

## Release Roadmap

### v0.2: Preset Platform and Onboarding (shipped)

Make project profiling immediately useful across common stacks. Ship smart,
inspectable risk rules for Next.js, FastAPI, Go, .NET, Rust, and generic
monorepos.

### v0.3: ACE Hub as Primary UX

Turn `ace:hub` into the daily context surface for AI work. Add focused modes for
start context, architect review, PR summary, and agent handoff.

### v0.4: PR and CI Quality Gates

Add governance for teams using AI-generated code. Verify `.ai/**` state, design
reviews, risk classification, and handoffs before merge. Prefer native Git hooks
and CI templates over Husky-style dependency stacks.

### v0.5: Read-Only MCP Adapter

Expose ACE memory to tools through a read-only Model Context Protocol adapter.
The MCP layer is an adapter only; the core remains Markdown and local scripts.

### v1.0: Stable Schema and Compatibility

Document stable file formats, config expectations, migration rules, and backward
compatibility guarantees for installed repositories.

## Long-Term Research and Development (v2.0+)

### Standalone ACE Engine

Research single-file native binaries for macOS, Linux, and Windows so teams can
use ACE without a Node.js or npm runtime on developer machines. This is a
distribution strategy, not permission to add runtime bloat.

### Automated PR/CI Reviewer

Research official GitHub Action and GitLab CI templates that inspect PR diffs,
verify ACE memory updates, compare changes against technical docs, and publish a
compact Markdown review summary.

### Optional Offline Memory Generation

Research optional local documentation generation through Ollama or llama.cpp for
teams that want private, offline summaries. This must remain optional. The
manual and active-agent-assisted closeout workflow remains the baseline.
