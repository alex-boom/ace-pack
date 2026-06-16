# ACE Adoption Checklist

Use this checklist when introducing ACE into a real repository or a small team.
It is intentionally lightweight: start with memory and risk visibility, then add
stricter gates only where they reduce real merge risk.

## 1. Start With One Repository

Pick one active repository where AI agents already touch real code.

Good first candidates:

- a service with auth, API, database, or deployment risk;
- a repo where multiple AI chats lose context between sessions;
- a team that already uses PR review and local test scripts.

Avoid starting with:

- a throwaway prototype;
- a repo with no tests and no maintainer willing to own the workflow;
- a repo where every new tool is expected to be invisible.

## 2. Install And Profile

```bash
npx ace-pack@latest init
npm run ace -- onboard --apply
npm run ace -- check
```

For pnpm:

```bash
pnpm dlx ace-pack init
pnpm ace onboard --apply
pnpm ace check
```

Review:

- `.ai/config/project-profile.md`
- `.ai/config/memory-config.json`
- `AGENTS.md`
- `.ai/state/task-state.md`

The goal is not to make every file high-risk. The goal is to make sensitive
paths visible before an AI agent edits them.

## 3. Connect The Real Validation Command

`ace:validate` is project-owned. ACE installs a placeholder when it is
missing; replace it with the real project gate when useful:

```json
{
  "scripts": {
    "ace:validate": "npm run lint && npm test"
  }
}
```

ACE will not overwrite a project-owned `ace:validate` script on reinstall.

## 4. Use The Daily Agent Loop

Before work:

```bash
npm run ace -- hub start
npm run ace -- classify
```

After work:

```bash
npm run ace:validate
npm run ace -- finish
```

For a new AI chat, start from `.ai/generated/report-brief.md` or use:

```bash
npm run ace -- hub start
```

## 5. Add PR/CI Gate Only After The Team Accepts The Workflow

Run the gate locally first:

```bash
npm run ace -- gate
```

Then generate an optional GitHub Actions workflow:

```bash
npm run ace -- gate --write-github-action
```

Use strict gates for large or high-risk work. For intentional human-reviewed
small changes, record the override reason:

```bash
npm run ace -- gate --human-override "Human reviewed typo-only docs change."
```

## 6. Optional MCP Context

For MCP-capable tools, expose ACE memory read-only:

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

Run the MCP script directly with `node`. Do not wrap it in `npm run`, because
stdio MCP requires stdout to contain only JSON-RPC messages.

## 7. Roll Out To More Repositories

Before expanding, check:

- Did agents actually use `.ai/generated/report-brief.md` or `ace hub start`?
- Did high-risk paths catch real review needs?
- Did `ace finish` improve handoff quality?
- Did `ace gate` block only changes worth blocking?
- Did the team replace `ace:validate` with real project checks?

If the answer is no, tune the current repo before copying ACE everywhere.

## 8. Upgrade Safely

To upgrade ACE in an installed repo:

```bash
npx ace-pack@latest init
npm run ace -- check
```

Expected behavior:

- existing `.ai/*` memory is not overwritten;
- `AGENTS.md` changes only inside ACE workflow markers;
- project-owned `ace:validate` remains intact;
- package scripts are updated idempotently.

For ACE maintainers, run release readiness before final npm publish:

```bash
npm run release:ready
npm run dogfood:self-check
```
