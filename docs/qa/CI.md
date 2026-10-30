# Continuous integration

There are two workflows: [`ci.yml`](../../.github/workflows/ci.yml) and [`security.yml`](../../.github/workflows/security.yml). The YAML is the source of truth for exact commands. This page covers what the YAML can't express.

## Required checks

Make these required when `main` gets branch protection.

| Check | Why it gates a merge |
|---|---|
| `verify` | The code builds, lints and type-checks. It runs unit and API tests, plus integration tests against a real Postgres. It also checks the OpenAPI contract snapshot (CI never rewrites it), the plan/spec integrity and the OpenAPI draft-vs-implemented overlap. |
| `e2e` | The app renders and degrades correctly in a real browser (desktop, plus mobile for `@responsive` tests). |
| `security` | No secrets are in the pushed or PR commits. On `dev`/`main` pushes, no high or critical advisories are in the dependencies. On PRs the audit only warns, because new advisories appear independently of the change. |

The daily `security` run also scans the **full** git history.

## Database for integration tests

Each `verify` run creates its own Neon branch from `test`, which only ever holds synthetic test data, never production data. The tests apply migrations themselves, and the branch is deleted at the end (a one-day expiry is the safety net). Runs never share data.

Without `NEON_API_KEY`, the integration tests **fail** rather than skip. This applies to:
- **Pull requests from forks:** GitHub withholds secrets from them, so their `verify` cannot pass. A maintainer re-runs the change from a branch in this repository.
- **Dependabot:** add `NEON_API_KEY` as a *Dependabot* secret too.

## One-time setup (repository owner)

| Name | Kind | Value |
|---|---|---|
| `NEON_API_KEY` | Actions secret | A Neon API key scoped to the `daily-good-deeds` project only |
| `NEON_PROJECT_ID` | Actions variable | `lingering-wind-02311152` |

The key goes straight from Neon into the secret, so it never appears on screen:

```sh
npx --yes neonctl@8.14.0 api-keys create --name github-actions-ci \
  --project-id lingering-wind-02311152 --output json \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const k=JSON.parse(s).key;if(!k)process.exit(1);process.stdout.write(k)})' \
  | gh secret set NEON_API_KEY --repo RuhulAminDSi/daily-good-deeds
gh variable set NEON_PROJECT_ID --body lingering-wind-02311152 --repo RuhulAminDSi/daily-good-deeds
```

To rotate the key, revoke the old one with `neonctl api-keys revoke <id>` (find the id with `neonctl api-keys list`), then repeat the commands above.

## Running the same checks locally

```sh
pnpm format:check
pnpm exec turbo run build lint typecheck test check   # integration tests use apps/api/.env.test
pnpm exec turbo run e2e --filter=@dgd/web
pnpm audit --audit-level high
```
