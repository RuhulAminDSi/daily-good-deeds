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
```

Branching: work happens on `dev`. `main` receives reviewed merges only.
