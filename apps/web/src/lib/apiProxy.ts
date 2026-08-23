import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Shared by every small inline-upload POST route (account avatar, teacher
// application photo/CV/audio/document, teacher profile photo) - forwards
// the authenticated request straight to the API server's own REST route
// (not GraphQL). These bodies are small base64 data: URLs saved directly to
// Postgres server-side, never routed through S3.
export async function proxyAuthenticatedPost(req: NextRequest, backendPath: string): Promise<NextResponse> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (typeof token?.accessToken !== 'string') {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const internalGraphql = process.env.INTERNAL_GRAPHQL_URL ?? process.env.GRAPHQL_SERVER_URL ?? 'http://api:4000/graphql';
  const apiBase = internalGraphql.replace(/\/graphql\/?$/, '');
  const response = await fetch(`${apiBase}${backendPath}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token.accessToken}`,
    },
    body: await req.text(),
    cache: 'no-store',
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
