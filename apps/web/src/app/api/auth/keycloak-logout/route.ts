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

  const response = NextResponse.json({ ok: true });
  const authCookiePrefixes = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
  ];

  // NextAuth splits large JWT sessions into numbered cookies such as
  // __Secure-next-auth.session-token.0. Clear every matching cookie, not only
  // the unchunked base name, otherwise the browser reconstructs the session.
  const cookieNames = new Set([
    ...authCookiePrefixes,
    ...req.cookies
      .getAll()
      .map(({ name }) => name)
      .filter((name) => authCookiePrefixes.some((prefix) => name === prefix || name.startsWith(`${prefix}.`))),
  ]);

  for (const name of cookieNames) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
      secure: name.startsWith('__Secure-') || name.startsWith('__Host-'),
    });
  }
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
