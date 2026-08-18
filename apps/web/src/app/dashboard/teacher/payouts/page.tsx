'use client';

import { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const GET = gql`
  query PayoutStatus {
    me {
      id
      teacherProfile { id stripeAccountId stripePayoutsEnabled }
    }
  }
`;
const CREATE_LINK = gql`mutation ConnectPayouts { createStripeConnectOnboardingLink { url } }`;

export default function PayoutsPage() {
  const { data, loading, error, refetch } = useQuery(GET, { fetchPolicy: 'cache-and-network' });
  const [createLink, { loading: linking }] = useMutation(CREATE_LINK);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [justOnboarded, setJustOnboarded] = useState(false);
  useEffect(() => {
    setJustOnboarded(new URLSearchParams(window.location.search).get('onboarded') === 'true');
  }, []);

  const profile = data?.me?.teacherProfile;
  const connected = Boolean(profile?.stripeAccountId);
  const payoutsEnabled = Boolean(profile?.stripePayoutsEnabled);

  async function connect() {
    setLinkError(null);
    try {
      const { data: res } = await createLink();
      if (res?.createStripeConnectOnboardingLink?.url) {
        window.location.href = res.createStripeConnectOnboardingLink.url;
      }
    } catch (e: any) {
      setLinkError(e.message ?? 'Could not start Stripe onboarding.');
    }
  }

  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/payouts">
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Payouts</h1>
        <p className="mt-2 text-gray-600">
          Connect a Stripe account so your share of course sales, lesson bookings, and event tickets pays out directly to you.
        </p>

        {justOnboarded && !payoutsEnabled && (
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Thanks — Stripe is finishing verification. This page updates automatically once it&rsquo;s done.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">Failed to load payout status: {error.message}</p>}
        {linkError && <p className="mt-4 text-sm text-red-600">{linkError}</p>}

        <section className="card mt-6 p-6">
          {loading && !data ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : payoutsEnabled ? (
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <div>
                <p className="font-semibold text-gray-900">Payouts active</p>
                <p className="text-sm text-gray-600">Your share of future sales transfers to your connected Stripe account automatically.</p>
              </div>
            </div>
          ) : connected ? (
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div>
                  <p className="font-semibold text-gray-900">Verification pending</p>
                  <p className="text-sm text-gray-600">Stripe still needs a few details before payouts can start.</p>
                </div>
              </div>
              <button className="btn-primary mt-4 rounded-lg px-4 py-2" disabled={linking} onClick={connect}>
                {linking ? 'Opening Stripe…' : 'Finish verification'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">You&rsquo;re not connected yet — sales settle to the platform account until you do.</p>
              <button className="btn-primary mt-4 rounded-lg px-4 py-2" disabled={linking} onClick={connect}>
                {linking ? 'Opening Stripe…' : 'Connect with Stripe'}
              </button>
            </div>
          )}
        </section>

        <button className="mt-4 text-sm text-primary-700" onClick={() => refetch()}>Refresh status</button>
      </main>
    </RoleGate>
  );
}
