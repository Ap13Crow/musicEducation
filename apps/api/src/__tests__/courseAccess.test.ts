jest.mock('../lib/membership', () => ({ hasActiveMembership: jest.fn(async () => false) }));

import { hasActiveMembership } from '../lib/membership';
import { courseAccessState, enrollWithoutPayment, enrollmentGrantsAccess, freeAccessReason } from '../lib/courseAccess';

const course = { id: 'c1', price: 10, teacherProfileId: 'tp1' };

function fakePrisma(options: { invited?: boolean; booked?: boolean; subscribed?: boolean; enrollment?: any } = {}) {
  let enrollment = options.enrollment ?? null;
  return {
    user: { findUnique: jest.fn(async () => ({ email: 'Student@Example.org' })) },
    courseInvitation: {
      findUnique: jest.fn(async ({ where }: any) => (options.invited && where.courseId_email.email === 'student@example.org' ? { id: 'inv', enrolledAt: null } : null)),
      update: jest.fn(async () => ({})),
    },
    booking: { count: jest.fn(async () => (options.booked ? 1 : 0)) },
    subscriptionPurchase: { count: jest.fn(async () => (options.subscribed ? 1 : 0)) },
    enrollment: {
      findUnique: jest.fn(async () => enrollment),
      upsert: jest.fn(async ({ create }: any) => (enrollment = enrollment ?? { id: 'e1', paymentId: null, ...create })),
      update: jest.fn(async ({ data }: any) => (enrollment = { ...enrollment, ...data })),
    },
  } as any;
}

beforeEach(() => (hasActiveMembership as jest.Mock).mockResolvedValue(false));

describe('free access to a paid course', () => {
  it('is free for nobody by default - the course is bought', async () => {
    expect(await freeAccessReason(fakePrisma(), 'u1', course)).toBeNull();
    expect(await enrollWithoutPayment(fakePrisma(), 'u1', course)).toBeNull();
  });

  it('is free for a course priced 0', async () => {
    expect(await freeAccessReason(fakePrisma(), 'u1', { ...course, price: 0 })).toBe('FREE');
  });

  it('prefers permanent reasons over subscriptions', async () => {
    (hasActiveMembership as jest.Mock).mockResolvedValue(true);
    expect(await freeAccessReason(fakePrisma({ invited: true, subscribed: true }), 'u1', course)).toBe('INVITATION');
    expect(await freeAccessReason(fakePrisma({ booked: true, subscribed: true }), 'u1', course)).toBe('TEACHER_STUDENT');
    expect(await freeAccessReason(fakePrisma({ subscribed: true }), 'u1', course)).toBe('TEACHER_SUBSCRIPTION');
    expect(await freeAccessReason(fakePrisma(), 'u1', course)).toBe('MEMBERSHIP');
  });

  it('enrolls an invited student and marks the invitation used', async () => {
    const prisma = fakePrisma({ invited: true });
    const enrollment = await enrollWithoutPayment(prisma, 'u1', course);
    expect(enrollment).toMatchObject({ accessReason: 'INVITATION' });
    expect(prisma.courseInvitation.update).toHaveBeenCalledWith({ where: { id: 'inv' }, data: expect.objectContaining({ userId: 'u1' }) });
  });
});

describe('access through an existing enrollment', () => {
  it('lasts while the membership does', async () => {
    const enrollment = { userId: 'u1', accessReason: 'MEMBERSHIP', paymentId: null };
    expect(await enrollmentGrantsAccess(fakePrisma(), enrollment, course)).toBe(false);
    (hasActiveMembership as jest.Mock).mockResolvedValue(true);
    expect(await enrollmentGrantsAccess(fakePrisma(), enrollment, course)).toBe(true);
  });

  it('is permanent once bought, invited, or for older enrollments', async () => {
    expect(await enrollmentGrantsAccess(fakePrisma(), { userId: 'u1', accessReason: 'MEMBERSHIP', paymentId: 'p1' }, course)).toBe(true);
    expect(await enrollmentGrantsAccess(fakePrisma(), { userId: 'u1', accessReason: 'INVITATION' }, course)).toBe(true);
    expect(await enrollmentGrantsAccess(fakePrisma(), { userId: 'u1', accessReason: null }, course)).toBe(true);
  });

  it('offers a free way back in when a lapsed member is now a subscriber', async () => {
    const state = await courseAccessState(fakePrisma({ subscribed: true, enrollment: { id: 'e1', userId: 'u1', accessReason: 'MEMBERSHIP', paymentId: null } }), 'u1', course);
    expect(state).toEqual({ enrolled: true, hasAccess: false, reason: 'MEMBERSHIP', freeReason: 'TEACHER_SUBSCRIPTION' });
  });
});

describe('membership state', () => {
  const real = jest.requireActual('../lib/membership');
  it('is active while Stripe says so and the period runs', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(real.membershipIsActive({ status: 'active', currentPeriodEnd: future })).toBe(true);
    expect(real.membershipIsActive({ status: 'past_due', currentPeriodEnd: future })).toBe(true);
    expect(real.membershipIsActive({ status: 'canceled', currentPeriodEnd: future })).toBe(false);
    expect(real.membershipIsActive({ status: 'active', currentPeriodEnd: new Date(Date.now() - 1000) })).toBe(false);
    expect(real.membershipIsActive(null)).toBe(false);
  });

  it('reads the period end from the subscription or its items', () => {
    expect(real.periodEnd({ current_period_end: 1800000000 } as any).getTime()).toBe(1800000000000);
    expect(real.periodEnd({ items: { data: [{ current_period_end: 1800000500 }] } } as any).getTime()).toBe(1800000500000);
  });
});

describe('membership launch threshold', () => {
  const real = jest.requireActual('../lib/membership');
  const prisma = (settings: Record<string, string>, published: number) =>
    ({
      adminSetting: { findMany: jest.fn(async () => Object.entries(settings).map(([key, value]) => ({ key, value }))) },
      course: { findMany: jest.fn(async () => Array.from({ length: published }, (_, index) => ({ id: `c${index}`, translationKey: null }))) },
    }) as any;

  it('stays off sale until more than the threshold of courses is published', async () => {
    const settings = { 'membership.monthlyPrice': '15', 'membership.yearlyPrice': '150', 'membership.launchAfterCourses': '20' };
    expect(await real.membershipOffer(prisma(settings, 12))).toMatchObject({ available: false, monthlyPrice: 15, yearlyPrice: 150, publishedCourses: 12, launchAfterCourses: 20 });
    expect((await real.membershipOffer(prisma(settings, 20))).available).toBe(false);
    expect((await real.membershipOffer(prisma(settings, 21))).available).toBe(true);
  });

  it('counts a course once across its languages', async () => {
    const editions = { adminSetting: { findMany: jest.fn(async () => []) }, course: { findMany: jest.fn(async () => [
      { id: 'a', translationKey: 'bach' }, { id: 'b', translationKey: 'bach' }, { id: 'c', translationKey: 'bach' }, { id: 'd', translationKey: null },
    ]) } } as any;
    expect((await real.membershipOffer(editions)).publishedCourses).toBe(2);
  });

  it('needs a price, and sells right away without a threshold', async () => {
    expect((await real.membershipOffer(prisma({}, 50))).available).toBe(false);
    expect((await real.membershipOffer(prisma({ 'membership.monthlyPrice': '15' }, 0))).available).toBe(true);
  });
});
