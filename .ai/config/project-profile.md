# ACE Project Profile

Generated: 2026-06-13 20:58

Applied recommendation source: repository scan.

## Detected Ecosystems
- Generic repository

## Repository Shape
- Files scanned: 79
- Package manager: pnpm

## Recommended High-Risk Paths
- `AGENTS.md` - agent instructions (large)
- `CLAUDE.md` - agent instructions (large)
- `.ai/**` - agent memory workflow (large)
- `.github/workflows/**` - CI workflow (large)
- `.gitlab-ci.yml` - CI workflow (large)
- `Dockerfile` - deployment configuration (large)
- `docker-compose*` - deployment configuration (large)
- `compose.y*ml` - deployment configuration (large)
- `scripts/**` - automation scripts (large)
- `**/middleware.*` - request middleware (large)
- `**/migrations/**` - database migration (large)
- `**/*secret*` - secret handling (large)
- `**/*token*` - token handling (large)
- `**/*crypto*` - token or crypto handling (large)
- `**/*auth*` - authentication (large)

## Recommended High-Risk Keywords
- `auth` - authentication (large)
- `authentication` - authentication (large)
- `permission` - permissions (large)
- `permissions` - permissions (large)
- `secret` - secret handling (large)
- `secrets` - secret handling (large)
- `credential` - credential handling (large)
- `credentials` - credential handling (large)
- `password` - password handling (large)
- `passwords` - password handling (large)
- `token` - token handling (large)
- `tokens` - token handling (large)
- `crypto` - token or crypto handling (large)
- `migration` - database migration (large)
- `migrations` - database migration (large)
- `environment` - environment isolation (large)
- `production` - production safety (large)
- `deploy` - deployment (large)
- `delete` - destructive operation (standard)
- `destroy` - destructive operation (standard)

## Next Step
- Review `.ai/memory-config.recommended.json`.
- Run `pnpm ace:onboard -- --apply` to apply the recommended profile.
- For known Next/tRPC/Drizzle SaaS repos, run `pnpm ace:onboard -- --preset next-trpc-drizzle-saas --apply`.
