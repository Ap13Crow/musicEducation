import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';

function forwardHeaders(req: NextRequest) {
  const headers: Record<string, string> = {
    'content-type': req.headers.get('content-type') ?? 'application/json',
  };
  const authorization = req.headers.get('authorization');
  if (authorization) headers.authorization = authorization;
  return headers;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const upstream = await fetch(GRAPHQL_UPSTREAM, {
      method: 'POST',
      headers: forwardHeaders(req),
      body,
      cache: 'no-store',
    });

    const payload = await upstream.text();
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (_err) {
    return NextResponse.json(
      { errors: [{ message: 'GraphQL service is temporarily unavailable.' }] },
      { status: 503 },
    );
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.search;
  if (!query) {
    return NextResponse.json({ status: 'ok' });
  }

  try {
    const upstream = await fetch(`${GRAPHQL_UPSTREAM}${query}`, {
      method: 'GET',
      headers: forwardHeaders(req),
      cache: 'no-store',
    });

    const payload = await upstream.text();
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (_err) {
    return NextResponse.json(
      { errors: [{ message: 'GraphQL service is temporarily unavailable.' }] },
      { status: 503 },
    );
  }
}
