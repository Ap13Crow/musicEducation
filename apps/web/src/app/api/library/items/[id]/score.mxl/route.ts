import { NextRequest, NextResponse } from 'next/server';

// Same-origin proxy for apps/api's /library/items/:id/score.mxl (the API is
// only reachable inside the cluster - see the calendar feed route this
// mirrors). Scores are immutable at their pinned upstream URL, so the API's
// long-lived cache header is passed through.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(`${API_ORIGIN}/library/items/${encodeURIComponent(params.id)}/score.mxl`, {
      cache: 'no-store',
    });
    if (!upstream.ok) return new NextResponse('Score not available.', { status: upstream.status });
    return new NextResponse(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/vnd.recordare.musicxml',
        'cache-control': upstream.headers.get('cache-control') ?? 'public, max-age=3600',
      },
    });
  } catch (_err) {
    return new NextResponse('Score service is temporarily unavailable.', { status: 503 });
  }
}
