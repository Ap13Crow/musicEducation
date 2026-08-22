import { NextRequest, NextResponse } from 'next/server';

// apps/api is only reachable inside the cluster (see the GraphQL proxy
// route this mirrors) - a calendar app (Apple Calendar, Google Calendar,
// Outlook "subscribe from web") can only ever reach this public web
// service, never api.mymusic-coach.svc.cluster.local directly. Derived
// from the same env var the GraphQL proxy uses, not a new one.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';
const API_ORIGIN = GRAPHQL_UPSTREAM.replace(/\/graphql\/?$/, '');

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const upstream = await fetch(`${API_ORIGIN}/calendar/feed/${params.token}`, { cache: 'no-store' });
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'text/calendar; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (_err) {
    return new NextResponse('Calendar feed service is temporarily unavailable.', { status: 503 });
  }
}
