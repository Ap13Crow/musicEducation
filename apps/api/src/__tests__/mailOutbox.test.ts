import { isValidEmail, recipientAddresses, enqueueMail } from '../lib/mailOutbox';

describe('isValidEmail', () => {
  it('accepts a plausible address', () => {
    expect(isValidEmail('student@example.com')).toBe(true);
  });
  it.each([undefined, null, '', '   ', 'not-an-email', 'missing-domain@', '@missing-local.com'])(
    'rejects %p',
    (value) => {
      expect(isValidEmail(value as any)).toBe(false);
    },
  );
});

describe('recipientAddresses', () => {
  it('returns just the account email when no notification email is set', () => {
    expect(recipientAddresses('jens@example.com', null)).toEqual(['jens@example.com']);
  });

  it('returns both when they differ', () => {
    const result = recipientAddresses('jens@example.com', 'jens.private@example.com');
    expect(result.sort()).toEqual(['jens.private@example.com', 'jens@example.com']);
  });

  it('never sends a duplicate copy to the same address (case-insensitive)', () => {
    const result = recipientAddresses('Jens@Example.com', 'jens@example.com');
    expect(result).toEqual(['jens@example.com']);
  });

  it('drops a malformed notificationEmail rather than losing the valid account email', () => {
    expect(recipientAddresses('jens@example.com', 'not-an-email')).toEqual(['jens@example.com']);
  });

  it('returns an empty set when neither address is valid', () => {
    expect(recipientAddresses(null, undefined)).toEqual([]);
  });
});

describe('enqueueMail', () => {
  it('skips writing a row when there are no valid recipients', async () => {
    const create = jest.fn();
    await enqueueMail({ mailOutboxMessage: { create } } as any, {
      kind: 'BOOKING_CONFIRMATION',
      recipients: [],
      subject: 'x',
      html: '<p>x</p>',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('writes exactly the deduped recipients passed in', async () => {
    const create = jest.fn().mockResolvedValue({});
    await enqueueMail({ mailOutboxMessage: { create } } as any, {
      kind: 'BOOKING_CONFIRMATION',
      bookingId: 'booking-1',
      recipients: ['a@example.com', 'b@example.com'],
      subject: 'Your lesson is confirmed',
      html: '<p>hi</p>',
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        kind: 'BOOKING_CONFIRMATION',
        bookingId: 'booking-1',
        recipients: ['a@example.com', 'b@example.com'],
        subject: 'Your lesson is confirmed',
        html: '<p>hi</p>',
      },
    });
  });
});
