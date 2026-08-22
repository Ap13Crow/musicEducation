import pino from 'pino';

const sendMail = jest.fn();
jest.mock('../lib/mailer.js', () => ({ sendMail: (...args: any[]) => sendMail(...args) }));

// Imported after the mock so mail-dispatch.ts picks up the mocked sendMail.
import { mailDispatchJob } from '../jobs/mail-dispatch.js';

function baseMessage(overrides: Record<string, any> = {}) {
  return {
    id: 'msg-1',
    kind: 'BOOKING_CONFIRMATION',
    bookingId: 'booking-1',
    recipients: ['student@example.com'],
    subject: 'Your lesson is confirmed',
    html: '<p>hi</p>',
    status: 'PENDING',
    attempts: 0,
    maxAttempts: 8,
    nextAttemptAt: new Date(0),
    ...overrides,
  };
}

describe('mailDispatchJob', () => {
  const logger = pino({ level: 'silent' });

  beforeEach(() => {
    sendMail.mockReset();
  });

  it('is registered with a valid cron schedule', () => {
    expect(mailDispatchJob.key).toBe('mail-dispatch');
    expect(mailDispatchJob.schedule).toMatch(/^[\d*/,\- ]+$/);
  });

  it('does nothing when no message is due', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const update = jest.fn();
    await mailDispatchJob.run({ prisma: { mailOutboxMessage: { findMany, update } } as any, logger });
    expect(update).not.toHaveBeenCalled();
  });

  it('marks a successful delivery SENT and joins recipients into one To header', async () => {
    const message = baseMessage({ recipients: ['a@example.com', 'b@example.com'] });
    const findMany = jest.fn().mockResolvedValue([message]);
    const update = jest.fn().mockResolvedValue({});
    sendMail.mockResolvedValue(undefined);

    await mailDispatchJob.run({ prisma: { mailOutboxMessage: { findMany, update } } as any, logger });

    expect(sendMail).toHaveBeenCalledWith({ to: 'a@example.com, b@example.com', subject: message.subject, html: message.html });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({ status: 'SENT', attempts: 1, lastError: null }),
    });
  });

  it('retries with backoff (stays FAILED, not DEAD_LETTER) while attempts remain', async () => {
    const message = baseMessage({ attempts: 2, maxAttempts: 8 });
    const findMany = jest.fn().mockResolvedValue([message]);
    const update = jest.fn().mockResolvedValue({});
    sendMail.mockRejectedValue(new Error('ECONNREFUSED'));

    await mailDispatchJob.run({ prisma: { mailOutboxMessage: { findMany, update } } as any, logger });

    const data = update.mock.calls[0][0].data;
    expect(data.status).toBe('FAILED');
    expect(data.attempts).toBe(3);
    expect(data.lastError).toMatch(/ECONNREFUSED/);
    expect(data.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('moves to DEAD_LETTER once attempts are exhausted, never silently dropping the message', async () => {
    const message = baseMessage({ attempts: 7, maxAttempts: 8 });
    const findMany = jest.fn().mockResolvedValue([message]);
    const update = jest.fn().mockResolvedValue({});
    sendMail.mockRejectedValue(new Error('Auth failed'));

    await mailDispatchJob.run({ prisma: { mailOutboxMessage: { findMany, update } } as any, logger });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({ status: 'DEAD_LETTER', attempts: 8, lastError: expect.stringMatching(/Auth failed/) }),
    });
  });

  it('one failing message does not block the rest of the batch', async () => {
    const ok = baseMessage({ id: 'msg-ok' });
    const bad = baseMessage({ id: 'msg-bad', attempts: 7, maxAttempts: 8 });
    const findMany = jest.fn().mockResolvedValue([bad, ok]);
    const update = jest.fn().mockResolvedValue({});
    sendMail.mockImplementation(async ({ to }: { to: string }) => {
      if (to.includes('student')) return undefined;
    });
    // First call (bad) rejects, second (ok) resolves.
    sendMail.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined);

    await mailDispatchJob.run({ prisma: { mailOutboxMessage: { findMany, update } } as any, logger });

    expect(update).toHaveBeenCalledTimes(2);
    expect(update.mock.calls[0][0].data.status).toBe('DEAD_LETTER');
    expect(update.mock.calls[1][0].data.status).toBe('SENT');
  });
});
