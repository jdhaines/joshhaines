import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const baseURL = `http://localhost:${PORT}`

/**
 * Smoke-tests run against the actual static export (`nuxt generate` output
 * served by `serve`), the same artifact that gets deployed. Testing the
 * static build -- rather than `nuxt dev`/`nuxt preview` -- is deliberate: it
 * is the only way to catch static-hosting-specific regressions (e.g. the
 * `@nuxt/image` IPX provider producing `/_ipx/*` URLs that 404 once there's
 * no Nitro server behind them).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `bunx serve -l ${PORT} .output/public`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
