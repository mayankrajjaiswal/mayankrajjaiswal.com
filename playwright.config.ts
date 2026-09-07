import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Several tests loop over every route x both themes and run multiple axe
  // scans, which is slow enough to hit the default 30s limit when three engines
  // compete for CPU. A single retry absorbs that contention without masking a
  // genuine failure (a real break fails twice).
  retries: process.env.CI ? 2 : 1,
  // Cap local parallelism: unbounded workers x 3 engines starved the preview
  // server and produced timeouts that moved between runs.
  workers: process.env.CI ? 1 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    // PUBLIC_PLAYWRIGHT=1 tells Layout.astro to omit `upgrade-insecure-requests` from
    // the CSP. That directive rewrites http:// to https://, and this server is
    // plain HTTP on localhost — WebKit honours the upgrade and the page then
    // loads with no CSS, fonts, or service worker. Chromium and Firefox exempt
    // localhost, so the breakage only ever showed up in WebKit.
    command: 'npm run build && npm run preview',
    // Set via `env` rather than inline `VAR=... cmd`, which is not valid syntax
    // on Windows shells.
    env: { PUBLIC_PLAYWRIGHT: '1' },
    url: 'http://localhost:4321',
    // NOTE: if you reuse a server started outside Playwright, make sure its
    // dist/ was built with PUBLIC_PLAYWRIGHT=1. A dist/ from a plain
    // `npm run build` still contains `upgrade-insecure-requests`, which makes
    // every WebKit test fail with a confusing "no CSS / no fonts" symptom that
    // looks like a real regression. `npm test` on its own always builds
    // correctly; kill any stray preview server first.
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
