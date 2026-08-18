import { defineConfig, devices } from '@playwright/test';

// Port deliberately not 3000, so a local `npm run dev` isn't accidentally
// reused by a developer's own dev server pointed at the live/dev API.
const PORT = process.env.PLAYWRIGHT_WEB_PORT ?? '3100';
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * These tests exercise pages against a `next dev` server with no live API,
 * Keycloak, or database behind it. Two techniques make that possible:
 *
 * - `e2e/fixtures/auth.ts` mints a NextAuth session cookie directly (same
 *   `next-auth/jwt` encoding NextAuth itself uses), so tests can act as a
 *   signed-in user of a given role without driving a real Keycloak login.
 * - `page.route('**\/graphql', ...)` intercepts Apollo's requests and
 *   fulfills them with fixture data, so assertions can inspect exactly what
 *   the browser sent (see e2e/availability-save.spec.ts) or control exactly
 *   what it receives back (see e2e/admin-stats.spec.ts).
 *
 * This intentionally does not cover the real Keycloak OIDC redirect flow or
 * live API/database behavior — those need an environment with the full
 * stack running (see docs/development.md's Compose reference stack) and are
 * out of scope for this first suite.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    // Escape hatch for environments with a pre-provisioned Chromium build
    // that doesn't match this package's pinned browser revision (so
    // `playwright install` isn't an option) — unset by default everywhere
    // else, including CI, which installs its own matching browser.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT,
      NODE_ENV: 'development',
      NEXT_PUBLIC_ENABLE_LIVE_API: 'false',
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXTAUTH_URL: baseURL,
      NEXTAUTH_SECRET: 'e2e-test-secret-do-not-use-outside-tests',
      KEYCLOAK_ISSUER: 'http://localhost:8080/realms/mymusic-coach',
      KEYCLOAK_CLIENT_ID: 'mymusic-coach-web',
      KEYCLOAK_CLIENT_SECRET: 'e2e-placeholder',
      NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: 'mymusic-coach-web',
      NEXT_PUBLIC_KEYCLOAK_ISSUER: 'http://localhost:8080/realms/mymusic-coach',
      // Deliberately unroutable: the NextAuth session callback tries this
      // for the authoritative role/name (see route.ts's fetchIdentity) and
      // must fall back to the token's own roles when it's unreachable, so
      // point it at a closed local port for a fast, deterministic failure
      // instead of a real DNS/timeout delay.
      GRAPHQL_SERVER_URL: 'http://127.0.0.1:9/graphql',
      INTERNAL_GRAPHQL_URL: 'http://127.0.0.1:9/graphql',
    },
  },
});
