# Reflection Log

Use this file for short, actionable agent-process reflections. Do not log every
minor task; record repeated tool friction, unclear prompts, poor assumptions,
or workflow improvements worth carrying into future sessions.

## Unresolved

### [YYYY-MM-DD HH:mm] [Short issue title]
Status: unresolved
- Stuck Point: [Where the agent got stuck]
- Likely Cause: [Tooling, prompt, missing context, or process issue]
- Proposed Improvement: [Concrete change to try next time]

## Resolved

### 2026-06-13 20:59 Persist release process outside chat
Status: resolved
- Stuck Point: npm publishing details and README/logo split can be forgotten in
  a new chat.
- Likely Cause: Release steps were previously only discussed in conversation.
- Proposed Improvement: Keep publish commands discoverable through
  `package.json` scripts and record npm publishing notes in `.ai/session-handoff.md`.
