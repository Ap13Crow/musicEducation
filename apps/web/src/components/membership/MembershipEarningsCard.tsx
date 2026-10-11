'use client';

import { gql, useQuery } from '@apollo/client';

// A teacher's mymusic.coach Plus earnings: for each membership month, two
// thirds of the member's fee shared equally among the courses they completed
// that month (lib/membershipRevenue.ts). Paid out to the connected Stripe
// account.

const EARNINGS = gql`
  query MyMembershipEarnings {
    myMembershipEarnings { month amountCents paidCents completions courses { courseId title completions amountCents } }
  }
`;

const chf = (cents: number) => `CHF ${(cents / 100).toFixed(2)}`;
const monthName = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function MembershipEarningsCard() {
  const { data, loading } = useQuery(EARNINGS, { fetchPolicy: 'network-only' });
  const months: any[] = data?.myMembershipEarnings ?? [];
  const total = months.reduce((sum, month) => sum + month.amountCents, 0);
  const unpaid = months.reduce((sum, month) => sum + month.amountCents - month.paidCents, 0);

  return (
    <section className="card space-y-4 p-6" data-testid="membership-earnings">
      <div>
        <h2 className="text-lg font-semibold">mymusic.coach Plus earnings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Each Plus member pays CHF 15 a month (or CHF 150 a year). CHF 10 of every member month (CHF 8.33 of a yearly member&rsquo;s month) goes to
          the teachers whose courses the member completed that month, shared equally per completed course.
        </p>
      </div>
      {loading ? (
        <div className="h-16 animate-pulse rounded bg-gray-100" />
      ) : months.length === 0 ? (
        <p className="text-sm text-gray-500">No Plus earnings yet - they appear here when members complete your courses.</p>
      ) : (
        <>
          <p className="text-sm">
            <span className="font-semibold">{chf(total)}</span> earned in total
            {unpaid > 0 && <span className="text-gray-600"> · {chf(unpaid)} waiting for the next payout</span>}
          </p>
          <ul className="divide-y divide-gray-100">
            {months.map((month) => (
              <li key={month.month} className="py-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>{monthName(month.month)}</span>
                  <span>{chf(month.amountCents)}</span>
                </div>
                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                  {month.courses.map((course: any) => (
                    <li key={course.courseId} className="flex justify-between gap-4">
                      <span className="truncate">{course.title} · {course.completions} completion{course.completions === 1 ? '' : 's'}</span>
                      <span className="shrink-0">{chf(course.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
