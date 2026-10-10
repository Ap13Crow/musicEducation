// Server-side (RSC / route handler) GraphQL call straight to the in-cluster
// API, for the few public pages that must render data before any client JS -
// link previews (OpenGraph) and the permanent /l/<shortId> redirects.
const GRAPHQL_UPSTREAM =
  process.env.GRAPHQL_SERVER_URL ?? process.env.INTERNAL_GRAPHQL_URL ?? 'http://api:4000/graphql';

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://mymusic.coach').replace(/\/$/, '');

export async function serverGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(GRAPHQL_UPSTREAM, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return (payload?.data as T) ?? null;
  } catch {
    return null;
  }
}
