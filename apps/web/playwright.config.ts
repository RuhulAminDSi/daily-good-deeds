import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

// Smoke suite against a dedicated production build that includes the `*.e2e.tsx` test routes
// (E2E_ROUTES=1 → separate `.next-e2e` output). Shared test infrastructure arrives with T-P2-QA-001.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  // Aria snapshots match exactly: an extra (e.g. untranslated) element fails, not only a changed one.
  expect: { toMatchAriaSnapshot: { children: 'deep-equal' } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Only layout-dependent tests need a phone viewport.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@responsive/ },
  ],
  webServer: {
    command: `pnpm exec next build && pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    timeout: 240_000,
    // Never attach to a server started without the e2e routes and env below.
    reuseExistingServer: false,
    // No API runs during the smoke suite, so pages must degrade gracefully.
    env: { E2E_ROUTES: '1', API_URL: 'http://127.0.0.1:1' },
  },
});
