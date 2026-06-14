# Session Handoff

## Last Update
2026-06-14 12:56

## What Was Done
- Confirmed `ace-pack@0.4.1` is published on npm and started the next planned
  release: v0.5 Read-Only MCP Adapter.
- Bumped local package version to `0.5.0`.
- Added `scripts/ace-mcp-server.mjs`, a zero-dependency stdio JSON-RPC MCP
  resource server.
- Exposed existing ACE Markdown memory as read-only MCP resources:
  `.ai/report-brief.md`, `.ai/current-task.md`, `.ai/session-handoff.md`,
  `.ai/decisions.md`, `.ai/product-roadmap.md`, `.ai/tech-docs.md`, and
  `.ai/generated-context.md`.
- Added the MCP script to the installer-managed script list so fresh ACE
  installs receive it.
- Updated README/README.npm with MCP client configuration guidance and the
  direct `node ./scripts/ace-mcp-server.mjs` stdio rule.
- Added MCP tests for resource listing/reading, initialize capabilities,
  JSON-RPC stdio framing, errors, and install coverage.

## Current State
- npm latest is `ace-pack@0.4.1`.
- Local candidate is `ace-pack@0.5.0`.
- v0.5.0 is implemented locally and passed release-readiness verification.
- MCP is intentionally not exposed through an npm script because stdio MCP
  stdout must contain only JSON-RPC messages.

## Quality Review
Product Alignment:
- v0.5 improves context loading for MCP-capable tools without turning ACE into
  an AI agent, SaaS service, or editor-specific integration.

Architecture:
- The adapter is an isolated script using Node built-ins and existing Markdown
  files. It exposes MCP resources only, with no tools, writes, background
  service, network listener, schema change, or dependency on an MCP SDK.

Security:
- The server is read-only and local. It performs no AI calls, no hidden network
  calls, and no repository writes. Missing files are simply omitted from
  `resources/list` and unavailable resources return JSON-RPC errors.

Code Quality:
- Tests cover the protocol surface added in v0.5 and verify installed repos
  receive `scripts/ace-mcp-server.mjs`.

## Next Steps
- Publish with `npm.cmd run release:npm` when the maintainer wants v0.5.0 live.
- After publish, run `npm.cmd view ace-pack version`.
- Apply published ACE to this repo only as an explicit dogfood sync.
- Next planning target after v0.5.0: v0.6 Product Growth Kit.

## Known Issues
- None known for v0.5.0.

## Verification
- `npm.cmd test` passed: 10 files, 83 tests.
- `npm.cmd run smoke:fake-project` passed for JS and non-JS fake projects.
- `npm.cmd run ace:gate` passed and classified the current work as large.
- `npm.cmd run check:npm-payload` passed and checked 29 packed files.
- `npm.cmd run release:ready` passed for `ace-pack@0.5.0`.
- `npm.cmd run dogfood:self-check -- --allow-dirty` passed and reported no
  created or updated installed files.

## Notes
- NPM publish: required before final release; deferred by maintainer.
