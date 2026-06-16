# Changed Files

[package.json]
- Bumped `ace-pack` to `2.2.0` for the shipped `ace discover` feature.

[scripts/ace-discover.mjs]
- Added deterministic local Project Conventions discovery with managed-marker
  overwrite protection, concise Markdown output, `--stdout`, `--json`,
  `--root`, and `--force`.

[scripts/ace-cli.mjs, scripts/ai-memory-utils.mjs, scripts/ace-hub.mjs, scripts/ace-mcp-server.mjs]
- Registered discover routing, project conventions memory aliases, optional hub
  inclusion, and the read-only MCP resource.

[scripts/ace-uninstall-utils.mjs, install/tests]
- Added `ace-discover.mjs` to installed managed scripts and covered install,
  router, hub, MCP, smoke, and discover behavior.

[README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md]
- Documented Project Conventions Discovery, CLI usage, schema compatibility,
  hub/MCP integration, and v2.2 roadmap status.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, product roadmap,
  durable decision, work log, generated context, and brief report for v2.2.0
  release work.
