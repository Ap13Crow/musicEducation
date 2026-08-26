process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { notifyEventBookingConfirmed, notifyEventBookingCancelled } from '../resolvers/events';

function notificationFixture() {
  const create = jest.fn().mockResolvedValue({});
  const booking = {
    id: 'event-booking-1',
    email: null,
    user: {
      email: 'attendee@example.com',
      profile: { displayName: 'Attendee Name', notificationEmail: 'attendee.private@example.com' },
    },
    event: {
      title: 'Summer Piano Recital',
      startsAt: new Date('2026-09-10T18:00:00.000Z'),
      format: 'IN_PERSON',
      venueName: 'Music Hall',
      venueAddress: '1 Main Street',
      city: 'Zug',
      onlineMeetingUrl: null,
      publisher: {
        email: 'organizer@example.com',
        profile: { displayName: 'Organizer Name', notificationEmail: null },
      },
    },
  };
  const tx = {
    eventBooking: { findUnique: jest.fn().mockResolvedValue(booking) },
    mailOutboxMessage: { create },
  };
  return { tx, create };
}

describe('event booking notifications', () => {
  it('queues confirmation mail for the attendee and organizer', async () => {
    const { tx, create } = notificationFixture();

    await notifyEventBookingConfirmed(tx as any, 'event-booking-1');

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        kind: 'EVENT_CONFIRMATION',
        eventBookingId: 'event-booking-1',
        recipients: ['attendee@example.com', 'attendee.private@example.com'],
        subject: 'Your event booking is confirmed',
      }),
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        kind: 'EVENT_CONFIRMATION',
        eventBookingId: 'event-booking-1',
        recipients: ['organizer@example.com'],
        subject: 'A new event booking was confirmed',
      }),
    });
  });

  it('queues cancellation mail for both parties', async () => {
    const { tx, create } = notificationFixture();

    await notifyEventBookingCancelled(tx as any, 'event-booking-1');

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls.map(([call]) => call.data.kind)).toEqual([
      'EVENT_CANCELLED',
      'EVENT_CANCELLED',
    ]);
  });
});
