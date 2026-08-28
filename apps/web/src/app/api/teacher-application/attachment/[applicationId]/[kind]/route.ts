import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { applicationId: string; kind: string } },
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (typeof token?.accessToken !== 'string') {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const index = req.nextUrl.searchParams.get('index');
  const internalGraphql = process.env.INTERNAL_GRAPHQL_URL ?? process.env.GRAPHQL_SERVER_URL ?? 'http://api:4000/graphql';
  const apiBase = internalGraphql.replace(/\/graphql\/?$/, '');
  const backendPath = `/teacher-application/${encodeURIComponent(params.applicationId)}/attachment/${encodeURIComponent(params.kind)}${index ? `/${encodeURIComponent(index)}` : ''}`;
  const response = await fetch(`${apiBase}${backendPath}`, {
    headers: { authorization: `Bearer ${token.accessToken}` },
    cache: 'no-store',
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    return location
      ? NextResponse.redirect(location)
      : NextResponse.json({ error: 'Attachment redirect was missing.' }, { status: 502 });
  }

  const headers = new Headers();
  for (const name of ['content-type', 'content-length', 'content-disposition', 'cache-control']) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(await response.arrayBuffer(), { status: response.status, headers });
}
