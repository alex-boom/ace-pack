# Product Roadmap

Use `ROADMAP.md` as the full strategic compass. Keep this file concise for AI
handoff and browser-context workflows.

## Business Goals

- Make ACE the standard local AgentOps control layer for vibe coding.
- Preserve the product promise: "Vibe coding that survives real repositories."
- Keep ACE local-first, Markdown-first, zero-lock-in, and zero-bloat.
- Give teams memory, guardrails, and closeout discipline for AI-generated code.

## Anti-Goals

- Do not make ACE an AI agent that writes code.
- Do not require Cloud, SaaS, GPUs, local LLMs, or cloud API keys.
- Do not lock ACE to one IDE, model provider, LLM, or agent vendor.
- Do not add heavy runtime dependencies.
- Do not reduce ACE to a prompt library.

## Completed Epics

- **ACE dogfooding foundation.** The ACE repository now uses ACE memory,
  handoff, reports, and payload guards while preserving the product-vs-local
  boundary.
- **Vibe coding positioning.** README and npm metadata now position ACE as the
  memory and guardrail layer for natural-language coding in real repositories.
- **New-chat start snapshot.** Brief/full reports now expose branch, worktree
  state, task lifecycle, next command, and publish decision; AI Coder hub
  context starts with the brief report.
- **Closeout priority ladder.** Installed workflow templates now tell agents to
  close tasks by priority, preserving future context and safety without
  ceremony.
- **v0.2 onboarding scanner.** `ace:onboard` now recognizes broader JS/TS,
  Python, Go, Rust, .NET, and monorepo signals, explains why each ecosystem was
  detected, and prints a concise terminal summary.
- **v0.3 ACE Hub primary UX.** `ace:hub` now provides focused start/coder,
  architect, handoff, PR, business, and docs context modes with metadata
  headers and local PR git summaries.
- **v0.4 PR and CI Quality Gates.** `ace:gate` now verifies ACE memory,
  risk classification, design/quality closeout, PR refs, and handoff
  verification, with opt-in GitHub Actions and native pre-push helpers.
  Release readiness now includes local fake-project smoke and explicit dogfood
  self-checks before final npm publish.

## Planned Features

- **v0.5: Read-Only MCP Adapter.** Expose ACE memory to tools without moving
  the core away from Markdown and local scripts.
- **v1.0: Stable Schema and Compatibility.** Document stable file formats,
  migration rules, and backward compatibility guarantees.

## Long-Term Research and Development (v2.0+)

- **Standalone ACE Engine.** Research native binaries for macOS, Linux, and
  Windows so teams can use ACE without Node.js/npm on developer machines.
- **Automated PR/CI Reviewer.** Research GitHub Action and GitLab CI templates
  that inspect PR diffs, validate ACE memory, and publish concise review
  summaries.
- **Optional Offline Memory Generation.** Research Ollama or llama.cpp adapters
  for private local summaries, while keeping manual and active-agent-assisted
  Markdown closeout as the baseline.

## Explicit AI Opt-In Policy

- Default provider is always `off`.
- ACE must never make hidden local or cloud AI calls.
- Future auto-documentation providers must be explicit repo-owned config.
- Cloud providers require explicit API keys and team privacy approval.
- Local providers require explicit local setup and may trade quality, speed, and
  battery life for privacy.
- Missing, invalid, unavailable, or timed-out providers must fail open into the
  manual or active-agent-assisted Markdown workflow.

## Open Product Questions

- Which project presets should be prioritized after the existing SaaS monorepo
  preset work?
- Which CI provider should receive the next official template after GitHub
  Actions?
