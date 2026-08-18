'use client';

import { ShieldAlert } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { type AppRole, hasRole } from '@/lib/roles';

export default function RoleGate({
  allow,
  callbackUrl,
  children,
}: {
  allow: AppRole[];
  callbackUrl: string;
  children: ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('keycloak', { callbackUrl });
    }
  }, [callbackUrl, status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6 text-sm text-gray-500">
        {status === 'loading' ? 'Checking access…' : 'Redirecting to secure sign-in…'}
      </div>
    );
  }

  if (!hasRole(session?.roles, ...allow)) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6">
        <div className="card max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-11 w-11 text-amber-500" />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-gray-900">Access restricted</h1>
          <p className="mt-2 text-sm text-gray-600">
            This workspace requires {allow.map((role) => role.toLowerCase()).join(' or ')} access.
            Ask an administrator to assign that role from the admin dashboard — it applies on your
            next page load, no need to sign out.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
