# ACE FAQ

## Is ACE another AI coding agent?

No. ACE does not write code. It gives existing AI coding agents local memory,
risk rules, context bundles, and quality gates inside the repository.

## Does ACE call OpenAI, Anthropic, Ollama, or any model provider?

No. Core ACE makes no AI calls. Future AI-assisted documentation features must
be explicit opt-in and fail open into the manual Markdown workflow.

## Does ACE require SaaS, a cloud account, or a database?

No. Durable state is Markdown under `.ai/**` plus JSON configuration in
`.ai/config/memory-config.json`.

## Does ACE add runtime dependencies to my app?

No. ACE is a scaffold CLI. It copies local scripts into the repository and does
not need to remain installed as an application dependency.

## Can ACE work in Python, Go, Rust, or .NET repositories?

Yes. ACE creates a small private `package.json` runner when a repository does
not already have one. The project can keep its own build and test tools.

## Will ACE overwrite my existing memory files?

No. Existing `.ai/*` files are project-owned. The installer creates missing
files but does not replace existing memory content.

## What does ACE change in AGENTS.md?

ACE writes inside a marked workflow section:

```md
<!-- agent-memory-workflow:start -->
...
<!-- agent-memory-workflow:end -->
```

Project-specific content outside those markers is preserved.

## What if `ace gate` is too strict?

Keep `ace gate` strict for large or high-risk changes. For intentional
human-reviewed small changes, use:

```bash
npm run ace -- gate --human-override "Human reviewed typo-only docs change."
```

The override is explicit and visible in CLI/JSON output.

## Should every repository install the pre-push hook?

No. Hooks are opt-in. Start with local `ace gate`, then add GitHub Actions or a
pre-push hook only after the team accepts the workflow.

## How should teams use `ace:validate`?

It is project-owned. ACE installs a placeholder when it is missing; teams
should replace it with their real project gate, for example:

```json
{
  "scripts": {
    "ace:validate": "npm run lint && npm test"
  }
}
```

ACE will not overwrite a project-owned `ace:validate` script.

## How do I give MCP-capable tools access to ACE memory?

Use the read-only MCP adapter:

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

Run it directly with `node`, not through `npm run`, so stdout stays valid
JSON-RPC for stdio MCP.

## When should I not use ACE?

ACE is probably too much for a throwaway single-file script, a one-off prototype
with no future AI sessions, or a team that is not willing to keep lightweight
project memory.

## How do I upgrade ACE safely?

Run:

```bash
npx ace-pack@latest init
npm run ace -- check
```

The v2 compatibility contract is documented in
[`docs/schema-compatibility.md`](./schema-compatibility.md).
