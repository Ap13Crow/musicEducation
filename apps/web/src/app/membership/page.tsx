'use client';

import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { BookOpen, CheckCircle2, GraduationCap, Library, Sparkles } from 'lucide-react';

// mymusic.coach Plus - one membership, every course included (API:
// lib/membership.ts). Prices come from the admin settings; until one is set
// the page says the membership is coming soon.

const MEMBERSHIP = gql`
  query MembershipPage {
    membershipOffer { available monthlyPrice yearlyPrice currency publishedCourses launchAfterCourses }
  }
`;
const MY_MEMBERSHIP = gql`
  query MyMembershipPage {
    myMembership { plan status active currentPeriodEnd cancelAtPeriodEnd }
  }
`;
const CHECKOUT = gql`
  mutation StartMembershipCheckout($plan: String!) { startMembershipCheckout(plan: $plan) { checkoutUrl } }
`;
const AUTO_RENEW = gql`
  mutation SetMembershipAutoRenew($autoRenew: Boolean!) {
    setMembershipAutoRenew(autoRenew: $autoRenew) { plan status active currentPeriodEnd cancelAtPeriodEnd }
  }
`;

const BENEFITS = [
  { icon: GraduationCap, text: 'Every paid course on mymusic.coach - start as many as you like' },
  { icon: BookOpen, text: 'New courses included as soon as they are published' },
  { icon: Library, text: 'The Library: scores, recordings and books, with XP for reading and listening' },
  { icon: Sparkles, text: 'Cancel any time - you keep access until the end of the paid period' },
];

const money = (currency: string, amount: number) => `${currency} ${amount.toFixed(2)}`;

export default function MembershipPage() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const { data } = useQuery(MEMBERSHIP);
  const { data: mine, refetch } = useQuery(MY_MEMBERSHIP, { skip: !signedIn, fetchPolicy: 'network-only' });
  const [checkout, { loading: checkingOut, error: checkoutError }] = useMutation(CHECKOUT);
  const [autoRenew, { loading: changing, error: changeError }] = useMutation(AUTO_RENEW);
  const offer = data?.membershipOffer;
  const membership = mine?.myMembership;

  async function buy(plan: 'MONTHLY' | 'YEARLY') {
    if (!signedIn) return void signIn('keycloak');
    const result = await checkout({ variables: { plan } }).catch(() => null);
    const url = result?.data?.startMembershipCheckout?.checkoutUrl;
    if (url) window.location.href = url;
  }

  const yearlySaving =
    offer?.monthlyPrice && offer?.yearlyPrice ? Math.round((1 - offer.yearlyPrice / (offer.monthlyPrice * 12)) * 100) : 0;

  return (
    <main className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">mymusic.coach Plus</p>
        <h1 className="mb-4 text-4xl font-bold">Every course, one membership</h1>
        <p className="mb-8 max-w-2xl text-gray-600">
          Learn with all the courses on mymusic.coach - composers, instruments, theory - for one monthly or yearly price.
        </p>

        <ul className="mb-10 space-y-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-gray-700">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /> {text}
            </li>
          ))}
        </ul>

        {membership?.active ? (
          <section className="card space-y-3 p-6" data-testid="membership-active">
            <p className="flex items-center gap-2 text-lg font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" /> You are a member ({membership.plan === 'YEARLY' ? 'yearly' : 'monthly'})
            </p>
            <p className="text-sm text-gray-600">
              {membership.cancelAtPeriodEnd
                ? `Your membership ends on ${new Date(membership.currentPeriodEnd).toLocaleDateString()} and will not renew.`
                : `Renews on ${new Date(membership.currentPeriodEnd).toLocaleDateString()}.`}
              {membership.status === 'past_due' && ' Your last payment did not go through - please check your card with your bank.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/courses" className="btn-primary">Browse courses</Link>
              <button
                type="button"
                disabled={changing}
                onClick={() => void autoRenew({ variables: { autoRenew: membership.cancelAtPeriodEnd } }).then(() => refetch())}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {membership.cancelAtPeriodEnd ? 'Keep renewing' : 'Cancel at period end'}
              </button>
            </div>
            {changeError && <p className="text-sm text-red-700">{changeError.message}</p>}
          </section>
        ) : !offer ? null : !offer.available ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700">
            The membership opens soon{offer.launchAfterCourses ? ` - as soon as more than ${offer.launchAfterCourses} courses are online (${offer.publishedCourses} so far)` : ''}
            {offer.monthlyPrice ? `, at ${offer.currency} ${Number(offer.monthlyPrice).toFixed(2)} a month` : ''}. Until then, each course can be bought on its own.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            {offer.monthlyPrice && (
              <div className="card flex flex-col p-6">
                <h2 className="text-lg font-semibold">Monthly</h2>
                <p className="my-3 text-3xl font-bold">{money(offer.currency, offer.monthlyPrice)}<span className="text-base font-normal text-gray-500"> / month</span></p>
                <p className="mb-5 text-sm text-gray-600">Cancel any time.</p>
                <button type="button" onClick={() => void buy('MONTHLY')} disabled={checkingOut} className="btn-primary mt-auto w-full py-3">
                  {signedIn ? 'Become a member' : 'Sign in to join'}
                </button>
              </div>
            )}
            {offer.yearlyPrice && (
              <div className="card flex flex-col border-primary-300 p-6">
                <h2 className="text-lg font-semibold">
                  Yearly {yearlySaving > 0 && <span className="ml-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">save {yearlySaving}%</span>}
                </h2>
                <p className="my-3 text-3xl font-bold">{money(offer.currency, offer.yearlyPrice)}<span className="text-base font-normal text-gray-500"> / year</span></p>
                <p className="mb-5 text-sm text-gray-600">One payment a year.</p>
                <button type="button" onClick={() => void buy('YEARLY')} disabled={checkingOut} className="btn-primary mt-auto w-full py-3">
                  {signedIn ? 'Become a member' : 'Sign in to join'}
                </button>
              </div>
            )}
          </section>
        )}
        {checkoutError && <p className="mt-4 text-sm text-red-700">{checkoutError.message}</p>}

        <p className="mt-10 text-sm text-gray-500">
          Taking lessons with a teacher on mymusic.coach? Their own courses are free for their students and subscribers - no membership
          needed.
        </p>
      </div>
    </main>
  );
}
