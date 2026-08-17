import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const issuer = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  if (issuer && clientId && clientSecret && typeof token?.refreshToken === 'string') {
    try {
      await fetch(`${issuer}/protocol/openid-connect/logout`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: token.refreshToken,
        }),
        cache: 'no-store',
      });
    } catch {
      // Local sign-out must still complete. Registration forces a fresh login.
    }
  }

  return NextResponse.json({ ok: true });
}
