import { NextRequest, NextResponse } from 'next/server';

// Same raw-body proxy as ../stripe/route.ts, forwarding to the API's
// separate v2 thin-event endpoint (apps/api/src/index.ts) instead - v1 and
// v2 Stripe events use different signing secrets and can't share a route.
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  const internalGraphql = process.env.INTERNAL_GRAPHQL_URL ?? process.env.GRAPHQL_SERVER_URL ?? 'http://api:4000/graphql';
  const apiBase = internalGraphql.replace(/\/graphql\/?$/, '');
  const response = await fetch(`${apiBase}/webhooks/stripe-v2`, {
    method: 'POST',
    headers: {
      'content-type': req.headers.get('content-type') ?? 'application/json',
      'stripe-signature': signature,
    },
    body: await req.arrayBuffer(),
    cache: 'no-store',
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
