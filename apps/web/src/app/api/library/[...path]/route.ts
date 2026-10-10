import { NextRequest, NextResponse } from 'next/server';

// Same-origin proxy for apps/api's public /library/* media routes (MusicXML
// scores, Gallica page scans and tracks) - the API is only reachable inside
// the cluster (see the calendar feed route this mirrors). Range is
// forwarded so the audio player can seek; the API's cache headers are kept
// so Cloudflare and browsers absorb repeat views.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');
const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'content-disposition'];

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.map(encodeURIComponent).join('/');
    const range = req.headers.get('range');
    const upstream = await fetch(`${API_ORIGIN}/library/${path}${req.nextUrl.search}`, {
      cache: 'no-store',
      headers: range ? { range } : undefined,
    });
    const headers = new Headers();
    for (const name of PASSTHROUGH_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (_err) {
    return new NextResponse('Library media is temporarily unavailable.', { status: 503 });
  }
}
