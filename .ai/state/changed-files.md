# Changed Files

[package.json]
- Bumped `ace-pack` to `2.0.1`.
- Removed exposed granular `ace:*`, `ai:*`, and `agent-memory:*` aliases.
- Kept the `ace` router and changed `ace:validate` to this repo's mechanical
  test gate.

[install-ace-pack.mjs]
- Installs only `ace` plus a missing project-owned `ace:validate` placeholder.
- Prunes old ACE-managed alias scripts only when their values exactly match
  known defaults.
- Prints next-step commands through the router.

[scripts/ace-cli.mjs]
- Routes modern commands and legacy alias arguments through the single entry
  point.
- Supports legacy update aliases with required internal `ai-update.mjs`
  subcommands.

[scripts/*]
- Updated command text, generated hooks/workflows, onboarding messages, and
  classify guidance from old package scripts to router syntax.

[README.md, README.npm.md, docs/**]
- Documented the minimal installed script surface, npm `--` separator, router
  commands, and project-owned `ace:validate` behavior.

[AGENTS.md, CLAUDE.md, scripts/agent-memory-templates.mjs]
- Synced local and installed agent instructions to use `pnpm ace <command>` or
  `npm run ace -- <command>`.
- Clarified that `ace:validate` is the mechanical project gate, while
  `ace check` validates ACE memory.

[tests/**, tools/**]
- Updated install, schema, router, docs, smoke, and quality-gate coverage for
  the clean command surface.
- Fake-project smoke now exercises the installed router and asserts old default
  scripts are not exposed.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, and durable
  decisions for the v2.0.1 command cleanup.
- Regenerated ACE reports and refreshed generated start context during
  dogfood self-check.
