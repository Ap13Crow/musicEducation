'use client';

import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getSession } from 'next-auth/react';

const graphQlHttpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/api/graphql';
const graphQlWsUrl = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL;

const httpLink = createHttpLink({
  uri: graphQlHttpUrl,
});

// Resolve the bearer token used for API calls. Authenticated users sign in
// through Keycloak (NextAuth), so the Keycloak access token on the session is
// the source of truth; the API verifies it against the realm JWKS. A locally
// issued token in localStorage (email/password login flow) is used as a
// fallback. See apps/api/src/middleware/keycloak.ts for the verification side.
async function resolveAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const session = (await getSession()) as { accessToken?: string } | null;
    if (session?.accessToken) return session.accessToken;
  } catch {
    /* fall through to localStorage */
  }
  return localStorage.getItem('accessToken');
}

// NOTE: Prefer httpOnly cookies / the Keycloak OIDC session over localStorage
// to prevent XSS-based token theft. If localStorage must be used, ensure the
// application has strict Content-Security-Policy headers in place.
const authLink = setContext(async (_, { headers }) => {
  const token = await resolveAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: 'Bearer ' + token } : {}),
    },
  };
});

const wsLink =
  typeof window !== 'undefined' && graphQlWsUrl
    ? new GraphQLWsLink(
        createClient({
          url: graphQlWsUrl,
          connectionParams: async () => {
            const token = await resolveAuthToken();
            return token ? { authorization: 'Bearer ' + token } : {};
          },
        }),
      )
    : null;

const splitLink =
  wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        authLink.concat(httpLink),
      )
    : authLink.concat(httpLink);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-first' },
  },
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
