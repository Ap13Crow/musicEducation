'use client';

import { useEffect } from 'react';
import { SessionProvider, signOut, useSession } from 'next-auth/react';

// The NextAuth [...nextauth]/route.ts jwt callback sets session.error =
// 'RefreshAccessTokenError' once the Keycloak refresh token itself expires
// (the SSO session timing out, not just the short-lived access token) - but
// a JWT-strategy session cookie stays valid and decodable regardless, so
// useSession() kept reporting status: 'authenticated' with the stale
// cached name. Nothing read session.error, so the navbar looked signed in
// until a GraphQL call using the now-dead accessToken actually failed.
// Force a real sign-out the moment that error shows up, so "signed in" in
// the UI always means the tokens backing it are actually still good.
function SessionExpiryWatcher() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      void signOut({ callbackUrl: '/' });
    }
  }, [session?.error]);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    // refetchInterval keeps the session (and therefore session.error)
    // current even in a background/unfocused tab - without it, a lapsed
    // session would only self-correct on the next window focus or
    // navigation, which could be a long time in an open tab left idle.
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      <SessionExpiryWatcher />
      {children}
    </SessionProvider>
  );
}
