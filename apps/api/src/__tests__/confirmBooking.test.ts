// Regression coverage for a Copilot review finding on PR #47: confirmBooking
// used to re-run capacity reservation, credit consumption, and the
// confirmation-email enqueue unconditionally on every call - a repeat call
// (double-click, client retry) wrote a second MailOutboxMessage row (a
// duplicate confirmation email/ICS invite) every time. Fixed with the same
// atomic-claim shape (updateMany WHERE status = 'PENDING') the Stripe
// webhook path already uses for the same class of problem.
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { bookingResolvers } from '../resolvers/bookings';

const teacherUser = { id: 'teacher-1', role: 'TEACHER' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  const bookingUpdateMany = overrides.bookingUpdateMany ?? jest.fn().mockResolvedValue({ count: 1 });
  const currentBooking = overrides.currentBooking ?? { id: 'booking-1', status: 'CONFIRMED' };
  const tx = {
    booking: {
      updateMany: bookingUpdateMany,
      findUniqueOrThrow: jest.fn().mockResolvedValue(currentBooking),
      // notifyBookingConfirmed's own internal lookup - null makes it a
      // harmless early return, this test isn't exercising email content.
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const prisma: any = {
    booking: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'booking-1',
        instrument: null,
        packagePurchaseId: null,
        holdExpiresAt: null,
        teacherProfileId: 'tp-1',
        userId: 'student-1',
        teacherProfile: { userId: 'teacher-1' },
      }),
    },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(tx)),
  };
  return { prisma, tx, bookingUpdateMany };
}

describe('confirmBooking', () => {
  it('claims the PENDING->CONFIRMED transition exactly once via an atomic updateMany', async () => {
    const { prisma, bookingUpdateMany } = fakePrisma();
    await bookingResolvers.Mutation.confirmBooking(null, { bookingId: 'booking-1' }, { prisma, user: teacherUser } as any);
    expect(bookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'booking-1', status: 'PENDING' },
      data: { status: 'CONFIRMED', holdExpiresAt: null },
    });
  });

  it('a repeat call (claim already lost, booking already CONFIRMED) is a harmless no-op - does not re-run the transition side effects', async () => {
    const bookingUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
    const { prisma } = fakePrisma({ bookingUpdateMany, currentBooking: { id: 'booking-1', status: 'CONFIRMED' } });
    const result = await bookingResolvers.Mutation.confirmBooking(null, { bookingId: 'booking-1' }, { prisma, user: teacherUser } as any);
    expect(result).toEqual({ id: 'booking-1', status: 'CONFIRMED' });
  });

  it('rejects confirming a booking that moved to a non-CONFIRMED status (e.g. cancelled) since it was read', async () => {
    const bookingUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
    const { prisma } = fakePrisma({ bookingUpdateMany, currentBooking: { id: 'booking-1', status: 'CANCELLED' } });
    await expect(
      bookingResolvers.Mutation.confirmBooking(null, { bookingId: 'booking-1' }, { prisma, user: teacherUser } as any),
    ).rejects.toThrow('no longer pending approval');
  });
});
