import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const issuer = process.env.KEYCLOAK_ISSUER;
  const appUrl = process.env.NEXTAUTH_URL;
  if (!issuer || !appUrl) {
    return NextResponse.json({ error: 'Logout is not configured.' }, { status: 503 });
  }

  const url = new URL(`${issuer}/protocol/openid-connect/logout`);
  url.searchParams.set('post_logout_redirect_uri', appUrl);
  url.searchParams.set('client_id', process.env.KEYCLOAK_CLIENT_ID ?? 'mymusic-coach-web');
  if (typeof token?.idToken === 'string') url.searchParams.set('id_token_hint', token.idToken);
  return NextResponse.json({ url: url.toString() });
}
