import { NextRequest, NextResponse } from 'next/server';

// Uploaded files (slides, lesson audio, documents) kept in our own media
// store - served by the API, passed through here with range support so
// audio can seek and long cache headers so repeat views stay local.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');
const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.map(encodeURIComponent).join('/');
    const range = req.headers.get('range');
    const upstream = await fetch(`${API_ORIGIN}/files/${path}`, { cache: 'no-store', headers: range ? { range } : undefined });
    const headers = new Headers();
    for (const name of PASSTHROUGH_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (_err) {
    return new NextResponse('File temporarily unavailable.', { status: 503 });
  }
}
