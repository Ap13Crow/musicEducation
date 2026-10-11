'use client';

import { gql, useMutation, useQuery } from '@apollo/client';

// Admin overview of the Plus revenue share by month (lib/membershipRevenue.ts):
// what members paid, what teachers earned for completions, what the platform
// kept - and the payout of teachers' unpaid shares to their Stripe accounts.

const REVENUE = gql`
  query AdminMembershipRevenue {
    membershipRevenue { month memberMonths revenueCents teachersCents platformCents unsettledCents unpaidTeacherCents completions }
  }
`;
const SETTLE = gql`mutation AdminRunMembershipSettlement { runMembershipSettlement { newSlices settled shares } }`;
const PAY_OUT = gql`mutation AdminPayOutMembershipShares { payOutMembershipShares { paidTeachers paidCents waitingTeachers waitingCents } }`;

const chf = (cents: number) => `CHF ${(cents / 100).toFixed(2)}`;

export function MembershipRevenueCard() {
  const { data, refetch } = useQuery(REVENUE, { fetchPolicy: 'network-only' });
  const [settle, { loading: settling, data: settled, error: settleError }] = useMutation(SETTLE);
  const [payOut, { loading: paying, data: paid, error: payError }] = useMutation(PAY_OUT);
  const months: any[] = data?.membershipRevenue ?? [];
  const unpaid = months.reduce((sum, month) => sum + month.unpaidTeacherCents, 0);

  async function pay() {
    if (!window.confirm(`Transfer ${chf(unpaid)} in unpaid teacher shares to the teachers' Stripe accounts?`)) return;
    await payOut().catch(() => null);
    void refetch();
  }

  return (
    <div className="card space-y-4 p-5" data-testid="membership-revenue">
      <div>
        <h3 className="font-semibold">mymusic.coach Plus revenue share</h3>
        <p className="mt-1 text-sm text-gray-600">
          Each paid member month: two thirds to the teachers of the courses the member completed that month (equally per course), one third - or
          everything, without completions - to the platform. Months are settled daily once they are over.
        </p>
      </div>
      {months.length === 0 ? (
        <p className="text-sm text-gray-500">No paid membership months yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-1 pr-3">Month</th>
                <th className="py-1 pr-3 text-right">Member months</th>
                <th className="py-1 pr-3 text-right">Revenue</th>
                <th className="py-1 pr-3 text-right">Teachers</th>
                <th className="py-1 pr-3 text-right">Platform</th>
                <th className="py-1 pr-3 text-right">Not settled</th>
                <th className="py-1 text-right">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {months.map((month) => (
                <tr key={month.month}>
                  <td className="py-1.5 pr-3">{month.month}</td>
                  <td className="py-1.5 pr-3 text-right">{month.memberMonths}</td>
                  <td className="py-1.5 pr-3 text-right">{chf(month.revenueCents)}</td>
                  <td className="py-1.5 pr-3 text-right">{chf(month.teachersCents)}</td>
                  <td className="py-1.5 pr-3 text-right">{chf(month.platformCents)}</td>
                  <td className="py-1.5 pr-3 text-right">{month.unsettledCents ? chf(month.unsettledCents) : '-'}</td>
                  <td className="py-1.5 text-right">{month.completions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" disabled={settling} onClick={() => void settle().then(() => refetch()).catch(() => null)}>
          {settling ? 'Settling…' : 'Settle now'}
        </button>
        <button type="button" className="btn-primary" disabled={paying || unpaid === 0} onClick={() => void pay()}>
          {paying ? 'Paying out…' : `Pay out ${chf(unpaid)} to teachers`}
        </button>
      </div>
      {settled && (
        <p className="text-xs text-gray-600">
          {settled.runMembershipSettlement.newSlices} new member months recorded, {settled.runMembershipSettlement.settled} settled,{' '}
          {settled.runMembershipSettlement.shares} teacher shares.
        </p>
      )}
      {paid && (
        <p className="text-xs text-gray-600">
          Paid {chf(paid.payOutMembershipShares.paidCents)} to {paid.payOutMembershipShares.paidTeachers} teachers.
          {paid.payOutMembershipShares.waitingTeachers > 0 &&
            ` ${chf(paid.payOutMembershipShares.waitingCents)} for ${paid.payOutMembershipShares.waitingTeachers} teachers waits until they connect Stripe.`}
        </p>
      )}
      {(settleError || payError) && <p className="text-sm text-red-700">{(settleError ?? payError)?.message}</p>}
    </div>
  );
}
