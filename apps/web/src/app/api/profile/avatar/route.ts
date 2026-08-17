import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (typeof token?.accessToken !== 'string') {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const internalGraphql = process.env.INTERNAL_GRAPHQL_URL ?? process.env.GRAPHQL_SERVER_URL ?? 'http://api:4000/graphql';
  const apiBase = internalGraphql.replace(/\/graphql\/?$/, '');
  const response = await fetch(`${apiBase}/profile/avatar`, {
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
