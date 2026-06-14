# Changed Files

[package.json]
- Bumped `ace-pack` to `2.1.0` for the shipped backward-compatible uninstall
  feature.

[scripts/ace-eject.mjs]
- Added the safe data-takeout command that detects active ACE memory and writes
  searchable `ace-export-*` folders with `RESTORE.md`.

[scripts/ace-destroy.mjs]
- Added guarded cleanup that refuses active memory without export, protects the
  ACE product repo, and removes only ACE-owned files/scripts.

[scripts/ace-uninstall-utils.mjs]
- Centralized managed script names, package script defaults, IDE bridge
  templates, exact-template checks, export discovery, and active-memory
  detection shared by install/eject/destroy.

[install-ace-pack.mjs]
- Reused the shared managed-file definitions and added eject/destroy utilities
  to installed consumer projects.

[scripts/ace-cli.mjs]
- Routed `eject`, `destroy`, and `purge`, plus legacy `ace:*` variants, through
  the single ACE router.

[README.md, README.npm.md, docs/schema-compatibility.md, ROADMAP.md]
- Documented the prominent Safe Eject and Uninstall flow, CLI contract, and
  v2.1 shipped roadmap state.

[tests/ace-uninstall.test.ts, tests/**]
- Added focused uninstall safety coverage and extended router, installer, and
  schema compatibility assertions.

[.ai/**]
- Updated current task, handoff, changed files, tech docs, product roadmap,
  durable decision, and generated context for the v2.1.0 closeout.
