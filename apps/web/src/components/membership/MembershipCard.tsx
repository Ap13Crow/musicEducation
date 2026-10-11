'use client';

import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CheckCircle2 } from 'lucide-react';
import { PlusOffer, usePlusOffer } from './PlusOffer';

// The member's own Plus membership on their profile: status, renewal date,
// cancel at period end (or keep renewing) - or the offer, for non-members.

const MY_MEMBERSHIP = gql`
  query ProfileMembership { myMembership { plan status active currentPeriodEnd cancelAtPeriodEnd } }
`;
const AUTO_RENEW = gql`
  mutation ProfileMembershipAutoRenew($autoRenew: Boolean!) {
    setMembershipAutoRenew(autoRenew: $autoRenew) { plan status active currentPeriodEnd cancelAtPeriodEnd }
  }
`;

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' });

export function MembershipCard() {
  const { data, loading, refetch } = useQuery(MY_MEMBERSHIP, { fetchPolicy: 'network-only' });
  const [setAutoRenew, { loading: changing, error }] = useMutation(AUTO_RENEW);
  const { offer } = usePlusOffer();
  const membership = data?.myMembership;

  if (loading) return null;
  if (!membership?.active) {
    if (!offer?.available) return null;
    return (
      <section className="card p-6" data-testid="membership-card">
        <h2 className="mb-4 text-lg font-semibold">mymusic.coach Plus</h2>
        <PlusOffer heading={false} returnTo="/dashboard/profile" />
      </section>
    );
  }

  const yearly = membership.plan === 'YEARLY';
  async function toggle() {
    const cancelling = !membership.cancelAtPeriodEnd;
    if (cancelling && !window.confirm(`Cancel your membership? You keep every course until ${day(membership.currentPeriodEnd)}; nothing more will be charged.`)) return;
    await setAutoRenew({ variables: { autoRenew: membership.cancelAtPeriodEnd } }).catch(() => null);
    void refetch();
  }

  return (
    <section className="card space-y-3 p-6" data-testid="membership-card">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <CheckCircle2 className="h-5 w-5 text-green-600" /> mymusic.coach Plus · {yearly ? 'yearly' : 'monthly'}
      </h2>
      <p className="text-sm text-gray-700">
        {membership.cancelAtPeriodEnd
          ? `Cancelled - you keep access to every course until ${day(membership.currentPeriodEnd)}. Nothing more will be charged.`
          : `Every course is included. Your membership renews on ${day(membership.currentPeriodEnd)}.`}
        {membership.status === 'past_due' && ' Your last payment did not go through - please check your card.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/courses" className="btn-primary">Browse courses</Link>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={changing}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {membership.cancelAtPeriodEnd ? 'Keep my membership' : `Cancel at the end of this ${yearly ? 'year' : 'month'}`}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error.message}</p>}
    </section>
  );
}
