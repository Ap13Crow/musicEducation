import { encode } from 'next-auth/jwt';
import type { BrowserContext } from '@playwright/test';
import type { AppRole } from '../../src/lib/roles';

// Must match playwright.config.ts's webServer env — this signs a session
// cookie the running Next.js server will accept as if NextAuth itself had
// issued it, without driving a real Keycloak OIDC redirect.
const NEXTAUTH_SECRET = 'e2e-test-secret-do-not-use-outside-tests';
const COOKIE_NAME = 'next-auth.session-token';

/**
 * Sign the browser context in as a user with the given platform role(s),
 * bypassing the Keycloak login redirect.
 *
 * `accessToken` is present (matching a real session) so the NextAuth
 * `session` callback takes its normal "ask the API for the authoritative
 * role" path; with no API reachable in this environment that call fails and
 * the callback falls back to the token's own `roles` — which is exactly
 * what's set here. See apps/web/src/app/api/auth/[...nextauth]/route.ts.
 */
export async function signInAs(
  context: BrowserContext,
  options: { roles: AppRole[]; name?: string; email?: string },
) {
  const { roles, name = 'E2E Test User', email = 'e2e-user@example.test' } = options;

  const token = await encode({
    secret: NEXTAUTH_SECRET,
    token: {
      sub: 'e2e-test-user',
      name,
      email,
      accessToken: 'e2e-fake-access-token',
      accessTokenExpires: Date.now() + 60 * 60 * 1000,
      roles,
    },
  });

  await context.addCookies([
    {
      name: COOKIE_NAME,
      value: token,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
