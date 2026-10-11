import Stripe from 'stripe';
import type { PrismaClient } from '@my-music-coach/database';

// mymusic.coach Plus revenue share.
//
// Every paid membership month is a "slice": a monthly invoice is one slice,
// a yearly invoice twelve (one per month, the amount split evenly). Of each
// slice two thirds are the teachers' pool (CHF 10 of a CHF 15 month,
// CHF 8.33 of a yearly CHF 12.50 month) and one third stays with the platform.
//
// Once a slice's month is over it is settled: the pool is divided equally
// among the courses the member completed during that month through the
// membership (Enrollment.accessReason MEMBERSHIP, Enrollment.completedAt
// inside the slice), and each course's teacher earns that course's part -
// two completed courses by the same teacher earn that teacher two parts.
// No completion in the month: the whole slice stays with the platform.
// Cents that do not divide evenly also stay with the platform.
//
// Slices come from Stripe's paid invoices (the record of what was actually
// charged); payouts to teachers are Stripe transfers to their connected
// accounts, made when an admin pays out.

export const TEACHER_SHARE = 2 / 3;
const SETTLEMENT_GRACE_MS = 60 * 60 * 1000;

export interface SliceSpec {
  sliceIndex: number;
  periodStart: Date;
  periodEnd: Date;
  amountCents: number;
  teacherPoolCents: number;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  const day = next.getUTCDate();
  next.setUTCMonth(next.getUTCMonth() + months);
  // 31 January + 1 month: stay at the end of February, not 3 March.
  if (next.getUTCDate() < day) next.setUTCDate(0);
  return next;
}

export const teacherPool = (amountCents: number) => Math.round(amountCents * TEACHER_SHARE);

// One invoice period -> its monthly slices.
export function slicesForPeriod(plan: string, periodStart: Date, periodEnd: Date, amountCents: number): SliceSpec[] {
  if (plan !== 'YEARLY') {
    return [{ sliceIndex: 0, periodStart, periodEnd, amountCents, teacherPoolCents: teacherPool(amountCents) }];
  }
  const base = Math.floor(amountCents / 12);
  return Array.from({ length: 12 }, (_, index) => {
    const amount = index === 11 ? amountCents - base * 11 : base;
    return {
      sliceIndex: index,
      periodStart: addMonths(periodStart, index),
      periodEnd: index === 11 ? periodEnd : addMonths(periodStart, index + 1),
      amountCents: amount,
      teacherPoolCents: teacherPool(amount),
    };
  });
}

// The pool, shared equally among completed courses (whole cents; the
// remainder stays with the platform).
export function splitPool(poolCents: number, completions: number): number[] {
  if (completions <= 0) return [];
  const each = Math.floor(poolCents / completions);
  return Array.from({ length: completions }, () => each);
}

function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Payments are not configured.');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Records the slices of every paid membership invoice not seen before.
export async function syncMembershipInvoices(prisma: PrismaClient, client: Stripe = stripe()): Promise<number> {
  const memberships = await prisma.platformMembership.findMany({ select: { userId: true, plan: true, stripeSubscriptionId: true } });
  let created = 0;
  for (const membership of memberships) {
    const invoices = await client.invoices.list({ subscription: membership.stripeSubscriptionId, status: 'paid', limit: 100 });
    for (const invoice of invoices.data) {
      if (!invoice.id || !invoice.amount_paid) continue;
      const line: any = invoice.lines?.data?.[0];
      const start = Number(line?.period?.start ?? invoice.period_start);
      const end = Number(line?.period?.end ?? invoice.period_end);
      if (!start || !end || end <= start) continue;
      const plan = line?.price?.recurring?.interval === 'year' ? 'YEARLY' : membership.plan;
      const slices = slicesForPeriod(plan, new Date(start * 1000), new Date(end * 1000), invoice.amount_paid);
      const result = await prisma.membershipRevenueSlice.createMany({
        data: slices.map((slice) => ({
          userId: membership.userId,
          plan,
          stripeInvoiceId: invoice.id!,
          currency: (invoice.currency ?? 'chf').toUpperCase(),
          ...slice,
        })),
        skipDuplicates: true,
      });
      created += result.count;
    }
  }
  return created;
}

// Shares out every slice whose month is over.
export async function settleMembershipSlices(prisma: PrismaClient, now = new Date()): Promise<{ settled: number; shares: number }> {
  const due = await prisma.membershipRevenueSlice.findMany({
    where: { settledAt: null, periodEnd: { lte: new Date(now.getTime() - SETTLEMENT_GRACE_MS) } },
    orderBy: { periodEnd: 'asc' },
  });
  let shares = 0;
  for (const slice of due) {
    const completed = await prisma.enrollment.findMany({
      where: {
        userId: slice.userId,
        accessReason: 'MEMBERSHIP',
        completedAt: { gte: slice.periodStart, lt: slice.periodEnd },
        course: { teacherProfileId: { not: null } },
      },
      select: { id: true, courseId: true, course: { select: { teacherProfileId: true } } },
      orderBy: { completedAt: 'asc' },
    });
    const parts = splitPool(slice.teacherPoolCents, completed.length);
    const teachersCents = parts.reduce((sum, part) => sum + part, 0);
    await prisma.$transaction([
      ...completed.map((enrollment: any, index: number) =>
        prisma.membershipTeacherShare.create({
          data: {
            sliceId: slice.id,
            teacherProfileId: enrollment.course.teacherProfileId,
            courseId: enrollment.courseId,
            enrollmentId: enrollment.id,
            amountCents: parts[index],
          },
        }),
      ),
      prisma.membershipRevenueSlice.update({
        where: { id: slice.id },
        data: { settledAt: now, platformCents: slice.amountCents - teachersCents },
      }),
    ]);
    shares += completed.length;
  }
  return { settled: due.length, shares };
}

export async function runMembershipSettlement(prisma: PrismaClient): Promise<{ newSlices: number; settled: number; shares: number }> {
  const newSlices = process.env.STRIPE_SECRET_KEY ? await syncMembershipInvoices(prisma) : 0;
  const { settled, shares } = await settleMembershipSlices(prisma);
  return { newSlices, settled, shares };
}

// Once a day, shortly after the nightly imports.
export function scheduleMembershipSettlement(prisma: PrismaClient): void {
  const run = () =>
    runMembershipSettlement(prisma).then(
      (result) => (result.newSlices || result.settled) && console.log('membership settlement', result),
      (error) => console.error('membership settlement failed', error),
    );
  setTimeout(run, 5 * 60 * 1000).unref();
  setInterval(run, 24 * 60 * 60 * 1000).unref();
}

// Pays every unpaid, settled share to teachers whose Stripe account can
// receive transfers - one transfer per teacher. Teachers without a ready
// account keep their balance until they connect one.
export async function payOutMembershipShares(prisma: PrismaClient, client: Stripe = stripe()) {
  const unpaid = await prisma.membershipTeacherShare.findMany({
    where: { paidAt: null, amountCents: { gt: 0 } },
    include: { teacherProfile: { select: { id: true, stripeAccountId: true, stripePayoutsEnabled: true } }, slice: { select: { currency: true } } },
  });
  const byTeacher = new Map<string, typeof unpaid>();
  for (const share of unpaid) byTeacher.set(share.teacherProfileId, [...(byTeacher.get(share.teacherProfileId) ?? []), share]);
  const result = { paidTeachers: 0, paidCents: 0, waitingTeachers: 0, waitingCents: 0 };
  for (const [teacherProfileId, shares] of byTeacher) {
    const teacher = shares[0].teacherProfile;
    const total = shares.reduce((sum, share) => sum + share.amountCents, 0);
    if (!teacher.stripeAccountId || !teacher.stripePayoutsEnabled) {
      result.waitingTeachers += 1;
      result.waitingCents += total;
      continue;
    }
    const ids = shares.map((share) => share.id).sort();
    const transfer = await client.transfers.create(
      {
        amount: total,
        currency: shares[0].slice.currency.toLowerCase(),
        destination: teacher.stripeAccountId,
        description: 'mymusic.coach Plus - course completions',
        metadata: { type: 'membership_share', teacherProfileId, shares: String(ids.length) },
      },
      { idempotencyKey: `membership-share-${teacherProfileId}-${ids[0]}-${ids[ids.length - 1]}-${ids.length}` },
    );
    await prisma.membershipTeacherShare.updateMany({ where: { id: { in: ids } }, data: { stripeTransferId: transfer.id, paidAt: new Date() } });
    result.paidTeachers += 1;
    result.paidCents += total;
  }
  return result;
}
