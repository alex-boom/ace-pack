# ACE 60-Second Demo Script

Use this script for a short screen recording, GIF, livestream segment, or
conference hallway demo. Keep the pace tight: the point is not to show every ACE
file, but to make the before/after obvious.

## Setup

Use the fixture in `examples/context-loss-demo`.

```bash
cd examples/context-loss-demo
npx ace-pack@latest init
npm run ace:onboard -- --apply
```

For local release candidates, run the installer from the repository root instead
of npm latest:

```bash
node ../../install-ace-pack.mjs .
npm run ace:onboard -- --apply
```

## Scene 1: Ordinary AI Chat

Prompt:

```text
Update the login session helper so expired sessions are rejected earlier.
```

Show the risk:

- The relevant file is `src/auth/session.ts`.
- A stateless chat has no durable memory of prior security decisions.
- The change looks small, but auth and token expiry are high-risk.
- Without a handoff, the next chat cannot tell what was changed or verified.

Narration:

```text
This is where vibe coding breaks down. The request sounds tiny, but it touches
auth. Without project memory, the AI treats it like normal code.
```

## Scene 2: ACE Onboarding

Run:

```bash
npm run ace:onboard -- --apply
npm run ace:classify
```

Show:

- `.ai/project-profile.md` explains why the repo was detected.
- `.ai/memory-config.json` contains high-risk auth/session/token paths.
- `ace:classify` gives the agent the right task tier and workflow.

Narration:

```text
ACE makes the repository carry the rules. Auth, sessions, and tokens are marked
as risky before the model writes code.
```

## Scene 3: Guarded AI Work

Open `.ai/current-task.md` and show the design fields:

- Business Value / Product Alignment
- Technical Approach
- Option 1
- Option 2
- Chosen Approach

Narration:

```text
For risky work, the agent has to explain the approach before implementation.
That shifts architecture and security review left, where it belongs.
```

## Scene 4: Handoff To The Next Chat

Run:

```bash
npm run ace:finish
npm run ace:hub start
```

Show:

- `.ai/report-brief.md` Start Snapshot
- `.ai/session-handoff.md` verification and next steps
- `.ai/generated-context.md` with the brief report first

Narration:

```text
The next AI chat starts with the current state, risk context, verification, and
next command. The human does not have to reconstruct the project from memory.
```

## Closing Line

```text
ACE is not another AI agent. It is the local memory and guardrail layer that
makes AI agents behave inside real repositories.
```
