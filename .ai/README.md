# ACE Dogfooding Memory

This `.ai/**` directory is the ACE instance used to develop the ACE package
itself. It is repo-local dogfooding state, not the consumer scaffold.

If you need to change ACE behavior for users, edit the product source in
`scripts/`, especially `scripts/agent-memory-templates.mjs` and the related
workflow scripts. Do not edit this `.ai/**` directory to change global ACE
behavior.

This directory is intentionally committed for fork continuity and future AI
agent handoffs, but it must remain excluded from the published npm package.
