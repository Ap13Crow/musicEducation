import type { Account, NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { normalizeRoles, type AppRole } from '@/lib/roles';

type AuthToken = {
  accessToken?: string;
  accessTokenExpires?: number;
  idToken?: string;
  refreshToken?: string;
  roles?: AppRole[];
  error?: 'RefreshAccessTokenError';
};

const issuer = process.env.KEYCLOAK_ISSUER ?? '';
const clientId = process.env.KEYCLOAK_CLIENT_ID ?? '';
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';

function rolesFromAccessToken(accessToken?: string): AppRole[] {
  if (!accessToken) return [];
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'));
    return normalizeRoles(payload.realm_access?.roles);
  } catch {
    return [];
  }
}

function tokenFromAccount(account: Account): AuthToken {
  return {
    accessToken: account.access_token,
    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 5 * 60_000,
    idToken: account.id_token,
    refreshToken: account.refresh_token,
    roles: rolesFromAccessToken(account.access_token),
  };
}

async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
  if (!token.refreshToken) return { ...token, error: 'RefreshAccessTokenError' };
  try {
    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
      cache: 'no-store',
    });
    const refreshed = await response.json();
    if (!response.ok) throw new Error('Keycloak token refresh failed');
    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      idToken: refreshed.id_token ?? token.idToken,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      roles: rolesFromAccessToken(refreshed.access_token),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

const authOptions: NextAuthOptions = {
  providers: [KeycloakProvider({ clientId, clientSecret, issuer })],
  session: { strategy: 'jwt' },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // Fall through to the trusted application origin.
      }
      return baseUrl;
    },
    async jwt({ token, account }) {
      if (account) return { ...token, ...tokenFromAccount(account) };
      const current = token as typeof token & AuthToken;
      if (current.accessTokenExpires && Date.now() < current.accessTokenExpires - 30_000) return current;
      return { ...token, ...(await refreshAccessToken(current)) };
    },
    async session({ session, token }) {
      const authToken = token as typeof token & AuthToken;
      return Object.assign(session, {
        accessToken: authToken.accessToken,
        roles: authToken.roles ?? [],
        error: authToken.error,
      });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
