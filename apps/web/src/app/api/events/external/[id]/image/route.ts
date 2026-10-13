import { NextRequest, NextResponse } from 'next/server';

// Same-origin proxy for apps/api's /events/external/:id/image (an external
// event's picture cropped to the card shape), like the /api/library proxy.
// The API's cache headers are kept so Cloudflare and browsers absorb repeat
// views.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');
const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'cache-control'];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(`${API_ORIGIN}/events/external/${encodeURIComponent(params.id)}/image`, { cache: 'no-store' });
    const headers = new Headers();
    for (const name of PASSTHROUGH_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (_err) {
    return new NextResponse('Event image is temporarily unavailable.', { status: 503 });
  }
}
