// Regression coverage for the fix accompanying user-reported feedback:
// "the payment and check-out process for bookings is not working yet."
// Before this, bookSession decided CONFIRMED-vs-PENDING purely from the
// teacher's auto-approve setting, with no regard for whether the lesson was
// paid at all - a teacher with auto-approve on got a CONFIRMED booking for
// a priced lesson with no payment ever collected. "Payment state is a state
// machine; Stripe - never the browser redirect - confirms payment"
// (CLAUDE.md) - so a booking that needs its own payment (no
// covering package credit, and the teacher actually charges for lessons)
// must never be created CONFIRMED here regardless of auto-approve; only
// handleStripeWebhook's 'booking' branch (see stripe-booking-webhook.test.ts)
// attaches payment; the teacher's confirmBooking action confirms it.
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { bookingResolvers } from '../resolvers/bookings';

const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

// A real future Date whose weekday matches an availability window this test
// controls, computed the same way bookSession itself derives weekday/hour
// from a timezone (Intl.DateTimeFormat) - rather than assuming a fixed
// calendar date stays "10 days from now" forever.
function futureLessonStart(): Date {
  const candidate = new Date();
  candidate.setDate(candidate.getDate() + 10);
  candidate.setHours(9, 0, 0, 0);
  return candidate;
}

function weekdayAndHour(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = weekdayNames.indexOf(parts.find((p) => p.type === 'weekday')?.value ?? '');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? -1);
  return { dayOfWeek, hour };
}

function fakePrismaForBookSession(overrides: {
  hourlyRate: number | null;
  autoApproveNewStudents: boolean;
  isPublic?: boolean;
  availabilityHours?: number;
}) {
  const timezone = 'Europe/Zurich';
  const startsAt = futureLessonStart();
  const { dayOfWeek, hour } = weekdayAndHour(startsAt, timezone);
  const availabilityHours = overrides.availabilityHours ?? 1;

  const bookingCreate = jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'booking-new', ...data }));
  // $queryRaw: reserveInstrumentCapacity's own TeacherInstrumentCapacity
  // lookup - empty result means "no cap configured," a no-op, whenever the
  // autoApprove path actually reaches it (a payment-gated PENDING booking
  // never does).
  const tx = {
    booking: {
      create: bookingCreate,
      // notifyBookingConfirmed's own internal lookup, only reached on the
      // free-lesson auto-confirm path here - null is a harmless early
      // return, this test isn't exercising email content (see ics.test.ts).
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const teacherProfile = {
    id: 'tp-1',
    userId: 'teacher-1',
    isPublic: overrides.isPublic ?? true,
    isAvailable: true,
    leadDays: 0,
    hourlyRate: overrides.hourlyRate,
    autoApproveNewStudents: overrides.autoApproveNewStudents,
    autoApproveRecurringStudents: overrides.autoApproveNewStudents,
    instruments: ['Piano'],
    availability: [
      { dayOfWeek, startTime: `${String(hour).padStart(2, '0')}:00`, endTime: `${String(hour + availabilityHours).padStart(2, '0')}:00`, timezone },
    ],
    instrumentCapacities: [],
    user: { role: 'TEACHER', status: 'ACTIVE', profile: { timezone } },
  };

  const prisma: any = {
    lessonPackagePurchase: { findUnique: jest.fn() },
    teacherProfile: { findUnique: jest.fn().mockResolvedValue(teacherProfile) },
    teacherAvailability: {
      findMany: jest.fn().mockResolvedValue([
        { dayOfWeek, startTime: `${String(hour).padStart(2, '0')}:00`, endTime: `${String(hour + availabilityHours).padStart(2, '0')}:00`, timezone },
      ]),
    },
    // isRecurringStudent calls findFirst; concrete slot discovery reads the
    // bounded active-booking list. Both are empty for these tests.
    booking: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
    teacherUnavailability: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
    personalAppointment: { findMany: jest.fn().mockResolvedValue([]) },
    externalBusyInterval: { findMany: jest.fn().mockResolvedValue([]) },
    // Prisma's $transaction has two call shapes: a callback (the booking
    // create below) and an array (awardXpOnce's XP-grant transaction,
    // fired-and-forgotten after every successful booking) - both must
    // resolve for bookSession to complete.
    $transaction: jest.fn((arg: any) => (typeof arg === 'function' ? arg(tx) : Promise.resolve([]))),
    // awardXpOnce's "found a teacher" XP grant, fired after every
    // successful booking regardless of payment status - not the behavior
    // under test here, just plumbing it needs to complete without throwing.
    xpAward: { create: jest.fn() },
    gamificationProfile: { update: jest.fn() },
  };

  return { prisma, bookingCreate, startsAt };
}

describe('bookSession - payment gates confirmation', () => {
  it('creates a PENDING booking, not CONFIRMED, for a priced lesson even when the teacher auto-approves', async () => {
    const { prisma, bookingCreate, startsAt } = fakePrismaForBookSession({ hourlyRate: 60, autoApproveNewStudents: true });

    await bookingResolvers.Mutation.bookSession(
      null,
      { input: { teacherProfileId: 'tp-1', startsAt: startsAt.toISOString(), durationMin: 60, format: 'ONLINE', instrument: 'Piano' } },
      { prisma, user: studentUser } as any,
    );

    expect(bookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'PENDING', packagePurchaseId: null }),
    });
  });

  it('still auto-confirms immediately for a free lesson (hourlyRate 0) with auto-approve on - unchanged from before', async () => {
    const { prisma, bookingCreate, startsAt } = fakePrismaForBookSession({ hourlyRate: 0, autoApproveNewStudents: true });

    await bookingResolvers.Mutation.bookSession(
      null,
      { input: { teacherProfileId: 'tp-1', startsAt: startsAt.toISOString(), durationMin: 60, format: 'ONLINE', instrument: 'Piano' } },
      { prisma, user: studentUser } as any,
    );

    expect(bookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'CONFIRMED' }),
    });
  });

  it('allows an unlisted but available teacher to accept direct or returning-student bookings', async () => {
    const { prisma, bookingCreate, startsAt } = fakePrismaForBookSession({
      hourlyRate: 0,
      autoApproveNewStudents: true,
      isPublic: false,
    });

    await bookingResolvers.Mutation.bookSession(
      null,
      { input: { teacherProfileId: 'tp-1', startsAt: startsAt.toISOString(), durationMin: 60, format: 'ONLINE', instrument: 'Piano' } },
      { prisma, user: studentUser } as any,
    );

    expect(bookingCreate).toHaveBeenCalled();
  });

  it('still respects auto-approve=false for a free lesson - PENDING awaiting teacher approval, not payment', async () => {
    const { prisma, bookingCreate, startsAt } = fakePrismaForBookSession({ hourlyRate: 0, autoApproveNewStudents: false });

    await bookingResolvers.Mutation.bookSession(
      null,
      { input: { teacherProfileId: 'tp-1', startsAt: startsAt.toISOString(), durationMin: 60, format: 'ONLINE', instrument: 'Piano' } },
      { prisma, user: studentUser } as any,
    );

    expect(bookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'PENDING' }),
    });
  });

  it('allows a longer booking when every adjacent one-hour opening is available', async () => {
    const { prisma, bookingCreate, startsAt } = fakePrismaForBookSession({
      hourlyRate: 60,
      autoApproveNewStudents: false,
      availabilityHours: 2,
    });

    await bookingResolvers.Mutation.bookSession(
      null,
      { input: { teacherProfileId: 'tp-1', startsAt: startsAt.toISOString(), durationMin: 120, format: 'ONLINE', instrument: 'Piano' } },
      { prisma, user: studentUser } as any,
    );

    expect(bookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        durationMin: 120,
        endsAt: new Date(startsAt.getTime() + 120 * 60_000),
      }),
    });
  });
});
