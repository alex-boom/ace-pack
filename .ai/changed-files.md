# Changed Files

[package.json]
- Bumped package version to `0.5.0`.

[scripts/ace-mcp-server.mjs]
- Added a zero-dependency stdio JSON-RPC MCP server.
- Exposes existing ACE Markdown memory as read-only MCP resources.
- Supports `initialize`, `ping`, `resources/list`, and `resources/read`.
- Returns JSON-RPC errors for unknown methods, unknown resources, missing
  resources, invalid requests, and parse errors.

[install-ace-pack.mjs]
- Added `ace-mcp-server.mjs` to the managed script files copied into installed
  ACE repositories.

[tests/ace-mcp-server.test.ts]
- Added coverage for resource listing, Markdown resource reads, initialize
  capabilities, JSON-RPC stdio framing, and error responses.

[tests/install-agent-memory-pack.test.ts]
- Added install-flow coverage for `scripts/ace-mcp-server.mjs`.

[README.md]
- Documented the read-only MCP adapter, exposed resources, and direct `node`
  stdio configuration guidance.

[README.npm.md]
- Mirrored npm-facing MCP adapter documentation.

[.ai/**]
- Updated current task, handoff, changed-files, work-log, decisions, roadmap,
  technical docs, reflections, and generated reports for v0.5 closeout.
