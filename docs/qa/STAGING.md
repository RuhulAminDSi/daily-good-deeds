# Staging (local + Tailscale)

Staging is a **production build running on the developer machine**, published on the internet with **Tailscale Funnel** as `https://daily-deeds.<tailnet>.ts.net`, currently **https://daily-deeds.ilish-denebola.ts.net/** (DL-040). It is **public**: anyone with the URL can open it, from any network, without Tailscale. Before login and accounts ship (T-P2-AUTH-*), revisit whether staging should stay public: staging data must stay synthetic. It uses Neon's **`staging`** branch, never `dev`, `test` or `main`.

```
pnpm staging                  # build → migrate → start → publish → smoke test
pnpm staging -- --skip-build  # same, reusing the last build
```

Ctrl+C stops everything and unpublishes the URL. If any process (API, worker, web) exits, staging stops entirely rather than serving half an app.

If staging is killed some other way, for example by closing the terminal, Windows leaves its processes running. The next `pnpm staging` then refuses to start because its ports are in use. Stop the leftovers in PowerShell:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'dist[\\/](main|worker)\.js|next start --port 3200|staging\.js' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

## What runs

| Process | Where | Notes |
|---|---|---|
| API | `127.0.0.1:4100` | `apps/api/dist/main.js`, `NODE_ENV=production`. Not published; only the web server calls it. |
| Worker | — | `apps/api/dist/worker.js` (pg-boss) |
| Web | `127.0.0.1:3200` | `next start`, `API_URL=http://127.0.0.1:4100` |
| Tailnet node `daily-deeds` | userspace `tailscaled` | `tailscale funnel` on 443 → web. This is a second node with its own state (`%LOCALAPPDATA%\dgd-tailscale`) and socket (`\\.\pipe\dgd-tailscaled`), so the machine's own node and anything it serves or funnels are untouched. |

The release (`APP_RELEASE`, `NEXT_PUBLIC_APP_RELEASE`) is the git short SHA, with `-dirty` added when the tree has uncommitted changes.

## Release steps (in order)

1. **Tailnet node.** Started if not already running. The very first run prints a login URL: approve the `daily-deeds` device once in the browser. It runs **unattended**, because on Windows a node otherwise stops when the CLI that logged it in exits.
2. **Build:** `turbo build` for the API and web.
3. **Migrations:** `prisma migrate deploy` against the staging branch (`DIRECT_URL`). This is the release step; a failed migration aborts before anything starts.
4. **Start** the API, worker and web.
5. **Publish:** `tailscale funnel --https=443`. The first request fetches the TLS certificate, which can take up to a minute.
6. **Smoke test** (`tools/staging/smoke.js`) through the public URL. It checks:
   - API readiness, including the database.
   - Both locales render and the page reports the API as working.
   - CSP nonce, `X-Request-Id` and the security headers.
   - Locale redirects.
   - The CSP report endpoint.

   A failed check stops staging. Rendering details belong to the web E2E suite; the smoke test checks the deployment itself (real API and database, public URL).

## Configuration and secrets

`apps/api/.env.staging` is git-ignored and must never be committed. Create it from `apps/api/.env.example` with:

- `NODE_ENV=production` and `PORT=4100`.
- `DATABASE_URL` (pooled) and `DIRECT_URL` for the **staging** branch. Get them with `npx neonctl connection-string staging --database-name dgd [--pooled]`, and write them straight into the file rather than displaying them. Use `sslmode=verify-full`.
- `WEB_ORIGINS` is not needed: staging sets it to the node's public URL.
- `TRUST_PROXY=0`. The API isn't behind a proxy; only the local web server reaches it.

## Probes

- `/health/live` is used to wait for startup.
- `/health/ready` is checked once by the smoke test, as deploy gating. No probe runs while staging is idle, so Neon compute can autosuspend.

## Not covered yet (DL-040)

- Cloud hosting (ADR-017) and merge-triggered deploys.
- Production.
- Private source-map upload to Sentry.
- Uptime checks.

These come back when a host is chosen. Staging is only up while the machine and `pnpm staging` are running.
