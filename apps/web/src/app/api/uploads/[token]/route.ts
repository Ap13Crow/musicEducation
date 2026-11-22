import { NextRequest, NextResponse } from 'next/server';

// Same-origin target for file uploads when files are kept in our own media
// store (apps/api lib/storage.ts): the signed token in the URL is the
// permission; the bytes are passed through to the API unchanged.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ token: string }> }) {
  const params = await paramsPromise;
  try {
    const upstream = await fetch(`${API_ORIGIN}/uploads/${encodeURIComponent(params.token)}`, {
      method: 'PUT',
      headers: { 'content-type': req.headers.get('content-type') ?? 'application/octet-stream' },
      body: req.body,
      // Streams the request body instead of buffering it.
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    return new NextResponse(await upstream.text(), { status: upstream.status });
  } catch (_err) {
    return new NextResponse('Upload failed - please try again.', { status: 502 });
  }
}
