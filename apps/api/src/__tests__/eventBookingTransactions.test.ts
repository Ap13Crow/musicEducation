process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

const mockAwardXpOnce = jest.fn().mockResolvedValue(undefined);
jest.mock('../resolvers/xp.js', () => ({
  awardXpOnce: (...args: any[]) => mockAwardXpOnce(...args),
}));

import { eventResolvers } from '../resolvers/events';

const authenticatedUser = { id: 'student-1', role: 'STUDENT' } as const;

function eventFixture() {
  return {
    id: 'event-1',
    title: 'Autumn Chamber Concert',
    isPublished: true,
    price: 0,
    maxCapacity: 20,
    currentCapacity: 3,
    startsAt: new Date('2026-10-10T18:00:00.000Z'),
    format: 'IN_PERSON',
    venueName: 'Music Hall',
    venueAddress: '1 Main Street',
    city: 'Zug',
    onlineMeetingUrl: null,
    publisher: {
      email: 'organizer@example.com',
      profile: { displayName: 'Organizer Name', notificationEmail: null },
    },
  };
}

function notificationBooking(status: 'CONFIRMED' | 'CANCELLED' = 'CONFIRMED') {
  return {
    id: 'event-booking-1',
    eventId: 'event-1',
    userId: 'student-1',
    email: null,
    status,
    user: {
      email: 'student@example.com',
      profile: { displayName: 'Student Name', notificationEmail: null },
    },
    event: eventFixture(),
  };
}

describe('event booking state and email outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('commits a free event booking, capacity change, and both confirmation messages in one transaction', async () => {
    const bookingCreate = jest.fn().mockResolvedValue({
      id: 'event-booking-1',
      eventId: 'event-1',
      userId: 'student-1',
      status: 'CONFIRMED',
    });
    const eventUpdate = jest.fn().mockResolvedValue({});
    const outboxCreate = jest.fn().mockResolvedValue({});
    const tx = {
      eventBooking: {
        create: bookingCreate,
        findUnique: jest.fn().mockResolvedValue(notificationBooking()),
      },
      event: { update: eventUpdate },
      mailOutboxMessage: { create: outboxCreate },
    };
    const prisma: any = {
      event: { findUnique: jest.fn().mockResolvedValue(eventFixture()) },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
    };

    await eventResolvers.Mutation.bookEvent(
      null,
      { eventId: 'event-1' },
      { prisma, user: authenticatedUser } as any,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(bookingCreate).toHaveBeenCalledWith({
      data: { userId: 'student-1', eventId: 'event-1', status: 'CONFIRMED' },
    });
    expect(eventUpdate).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { currentCapacity: { increment: 1 } },
    });
    expect(outboxCreate).toHaveBeenCalledTimes(2);
    expect(outboxCreate.mock.calls.map(([call]) => call.data.kind)).toEqual([
      'EVENT_CONFIRMATION',
      'EVENT_CONFIRMATION',
    ]);
  });

  it('commits cancellation, capacity release, and both cancellation messages in one transaction', async () => {
    const eventUpdate = jest.fn().mockResolvedValue({});
    const bookingUpdate = jest.fn().mockResolvedValue({
      id: 'event-booking-1',
      eventId: 'event-1',
      userId: 'student-1',
      status: 'CANCELLED',
    });
    const outboxCreate = jest.fn().mockResolvedValue({});
    const tx = {
      eventBooking: {
        update: bookingUpdate,
        findUnique: jest.fn().mockResolvedValue(notificationBooking('CANCELLED')),
      },
      event: { update: eventUpdate },
      mailOutboxMessage: { create: outboxCreate },
    };
    const prisma: any = {
      eventBooking: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'event-booking-1',
          eventId: 'event-1',
          userId: 'student-1',
          status: 'CONFIRMED',
        }),
      },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
    };

    await eventResolvers.Mutation.cancelEventBooking(
      null,
      { bookingId: 'event-booking-1' },
      { prisma, user: authenticatedUser } as any,
    );

    expect(eventUpdate).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { currentCapacity: { decrement: 1 } },
    });
    expect(bookingUpdate).toHaveBeenCalledWith({
      where: { id: 'event-booking-1' },
      data: { status: 'CANCELLED' },
    });
    expect(outboxCreate.mock.calls.map(([call]) => call.data.kind)).toEqual([
      'EVENT_CANCELLED',
      'EVENT_CANCELLED',
    ]);
  });

  it('does not decrement capacity or send another email for an already-cancelled booking', async () => {
    const transaction = jest.fn();
    const cancelled = {
      id: 'event-booking-1',
      eventId: 'event-1',
      userId: 'student-1',
      status: 'CANCELLED',
    };
    const prisma: any = {
      eventBooking: { findUnique: jest.fn().mockResolvedValue(cancelled) },
      $transaction: transaction,
    };

    await expect(eventResolvers.Mutation.cancelEventBooking(
      null,
      { bookingId: 'event-booking-1' },
      { prisma, user: authenticatedUser } as any,
    )).resolves.toBe(cancelled);
    expect(transaction).not.toHaveBeenCalled();
  });
});
