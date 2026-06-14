# ACE Context Loss Demo

This tiny fixture is for ACE demos and launch material. It shows why a request
that sounds small can still be risky when an AI coding agent lacks repository
memory.

## Story

The product has login sessions, token expiry, and an audit trail. A human asks:

```text
Update the login session helper so expired sessions are rejected earlier.
```

Without ACE, the request can look like a small utility edit. With ACE, onboarding
and classification make the risk visible:

- `src/auth/session.ts` is auth/session code.
- `src/auth/tokens.ts` handles token expiry.
- `migrations/` changes would affect persisted security state.
- The agent should document approach, verification, and handoff before merge.

## Demo Flow

From this directory:

```bash
npx ace-pack@latest init
npm run ace:onboard -- --apply
npm run ace:classify
npm run ace:hub start
```

For local ACE development, run from the repository root:

```bash
node ../../install-ace-pack.mjs examples/context-loss-demo
```

## What To Show

- `.ai/project-profile.md` explains why ACE detected a JS/TS service shape.
- `.ai/memory-config.json` marks auth/session/token paths as high-risk.
- `ace:classify` tells the agent the work needs more care than a trivial edit.
- `ace:hub start` gives the next chat a compact state snapshot.

This fixture is not a production app. It is deliberately small so the demo stays
focused on context, risk, and handoff.
