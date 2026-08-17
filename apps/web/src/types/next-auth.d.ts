import type { DefaultSession } from 'next-auth';
import type { AppRole } from '@/lib/roles';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    roles: AppRole[];
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    idToken?: string;
    refreshToken?: string;
    roles?: AppRole[];
    error?: 'RefreshAccessTokenError';
  }
}
