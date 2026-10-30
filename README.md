# Daily Good Deeds

> Small Good Deeds, Every Day. A Better You, Every Day.

A bilingual (English / বাংলা) platform for personal growth, good deeds, Islamic lifestyle, family, and community. It is web-first and installable as a PWA, with a companion Android home-screen widget.

**Status:** Planning stage. Specifications are in [`docs/`](docs/README.md) and awaiting approval. No application code yet.

Start with [docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md).

## Development setup

Requirements: **Node 24** (see `.nvmrc`) and **pnpm** via Corepack. The version is pinned in `package.json` → `packageManager`.

```sh
corepack enable pnpm   # if this fails without admin rights: corepack enable --install-directory ~/bin pnpm
pnpm install
pnpm lint && pnpm typecheck && pnpm test
pnpm docs:check        # planning docs are consistent and up to date
```

Database (Neon Postgres): copy `apps/api/.env.example` to `apps/api/.env` and `apps/api/.env.test`, using the `dev` and `test` branch connection strings respectively. Then run:

```sh
cd apps/api
pnpm db:deploy         # apply migrations (uses DIRECT_URL)
pnpm build && pnpm db:seed   # insert missing reference data (idempotent)
pnpm dev               # http://localhost:4000/api/v1/health/ready
pnpm worker            # background jobs (after pnpm build)
```

API contract: hand-written Zod schemas live in `packages/contracts`. The typed client (`packages/api-client`) is generated from the API. After changing routes or response schemas, regenerate it:

```sh
pnpm --filter @dgd/api openapi   # rewrites packages/api-client; the API tests fail if it's stale
pnpm check                       # docs/plan integrity + OpenAPI draft-vs-implemented overlap
```

Web app (needs the API running for live status):

```sh
cd apps/web
pnpm dev               # http://localhost:3000/en  (PORT=3210 pnpm dev if 3000 is taken)
pnpm e2e               # Playwright smoke tests (first time: pnpm exec playwright install chromium)
```

Branching: work happens on `dev`. `main` receives reviewed merges only.
