import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    // Playwright's e2e specs use their own test runner/CLI (`playwright
    // test`) -- exclude them so Vitest's default `*.spec.ts` glob doesn't
    // also try to execute them.
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
})
