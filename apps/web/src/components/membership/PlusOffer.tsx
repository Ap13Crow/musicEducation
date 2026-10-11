'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { signIn, useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';

// mymusic.coach Plus - the offer (monthly or yearly) with its checkout, used
// in onboarding, in front of a single-course purchase and on the profile.
// Renders nothing until the membership is on sale (MembershipOffer.available).

export const MEMBERSHIP_OFFER = gql`
  query PlusOffer { membershipOffer { available monthlyPrice yearlyPrice currency publishedCourses } }
`;
const MY_MEMBERSHIP = gql`
  query PlusOfferMembership { myMembership { active } }
`;
const START_CHECKOUT = gql`
  mutation StartPlusCheckout($plan: String!, $returnTo: String) {
    startMembershipCheckout(plan: $plan, returnTo: $returnTo) { checkoutUrl }
  }
`;

export function usePlusOffer() {
  const { data, loading } = useQuery(MEMBERSHIP_OFFER);
  return { offer: data?.membershipOffer ?? null, loading };
}

const money = (currency: string, amount: number) => `${currency} ${Number(amount).toFixed(2)}`;

export function PlusOffer({ returnTo, heading = true }: { returnTo?: string; heading?: boolean }) {
  const { status } = useSession();
  const { offer } = usePlusOffer();
  const { data: mine } = useQuery(MY_MEMBERSHIP, { skip: status !== 'authenticated' });
  const [startCheckout, { loading, error }] = useMutation(START_CHECKOUT);
  const [plan, setPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  if (!offer?.available) return null;
  if (mine?.myMembership?.active) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800" data-testid="plus-offer">
        <CheckCircle2 className="h-4 w-4" /> You are a mymusic.coach Plus member - every course is included.
      </p>
    );
  }

  const saving = offer.monthlyPrice && offer.yearlyPrice ? Math.round((1 - offer.yearlyPrice / (offer.monthlyPrice * 12)) * 100) : 0;

  async function join() {
    if (status !== 'authenticated') {
      // Back to the same place once signed in, ready to choose again.
      void signIn('keycloak', { callbackUrl: `${window.location.pathname}${window.location.search}` });
      return;
    }
    const result = await startCheckout({ variables: { plan, returnTo: returnTo ?? window.location.pathname } }).catch(() => null);
    const url = result?.data?.startMembershipCheckout?.checkoutUrl;
    if (url) window.location.href = url;
  }

  return (
    <div className="space-y-4" data-testid="plus-offer">
      {heading && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">mymusic.coach Plus</p>
          <p className="text-lg font-semibold text-gray-900">All {offer.publishedCourses} courses, one membership</p>
        </div>
      )}
      <ul className="space-y-1.5 text-sm text-gray-700">
        <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /> Every course, in English, German and French</li>
        <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /> New courses included as soon as they are published</li>
        <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /> Cancel any time - you keep access to the end of the paid period</li>
      </ul>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Membership plan">
        {offer.monthlyPrice && (
          <button
            type="button"
            role="radio"
            aria-checked={plan === 'MONTHLY'}
            onClick={() => setPlan('MONTHLY')}
            className={`rounded-lg border p-3 text-left ${plan === 'MONTHLY' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="block text-xs text-gray-500">Monthly</span>
            <span className="block text-lg font-bold">{money(offer.currency, offer.monthlyPrice)}</span>
            <span className="block text-xs text-gray-500">per month</span>
          </button>
        )}
        {offer.yearlyPrice && (
          <button
            type="button"
            role="radio"
            aria-checked={plan === 'YEARLY'}
            onClick={() => setPlan('YEARLY')}
            className={`rounded-lg border p-3 text-left ${plan === 'YEARLY' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="block text-xs text-gray-500">Yearly {saving > 0 && <span className="font-medium text-green-700">· save {saving}%</span>}</span>
            <span className="block text-lg font-bold">{money(offer.currency, offer.yearlyPrice)}</span>
            <span className="block text-xs text-gray-500">per year</span>
          </button>
        )}
      </div>
      <button type="button" onClick={() => void join()} disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
        {loading ? 'Opening checkout…' : status === 'authenticated' ? 'Join mymusic.coach Plus' : 'Sign in and join Plus'}
      </button>
      {error && <p className="text-sm text-red-700">{error.message}</p>}
    </div>
  );
}
