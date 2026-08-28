import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

test.describe('server-authoritative booking availability', () => {
  test('publishes and books a quarter-hour-anchored slot without rounding it', async ({ page, context }) => {
    await signInAs(context, { roles: ['STUDENT'], email: 'student@example.test' });
    await page.clock.setFixedTime(new Date('2026-09-07T06:00:00.000Z'));

    let bookingInput: any = null;
    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'BookTeacher') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              teacher: {
                id: 'teacher-1',
                headline: 'Piano teacher',
                teachingBio: null,
                hourlyRate: null,
                currency: 'CHF',
                instruments: ['Piano'],
                teachingFormats: ['ONLINE'],
                isAvailable: true,
                leadDays: 0,
                cancellationDays: 2,
                instrumentCapacities: [{ id: 'cap-1', instrument: 'Piano', maxActiveStudents: 5, activeStudentCount: 1, remainingCapacity: 4 }],
                bookableSlots: [{ startsAt: '2026-09-07T09:15:00.000Z', endsAt: '2026-09-07T10:15:00.000Z', timezone: 'Europe/Zurich' }],
                user: { email: 'teacher@example.test', displayName: 'Quarter Hour Teacher' },
              },
              teacherUnavailability: [],
            },
          }),
        });
        return;
      }
      if (body?.operationName === 'Book') {
        bookingInput = body.variables.input;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { bookSession: { id: 'booking-1', status: 'CONFIRMED', startsAt: bookingInput.startsAt, endsAt: '2026-09-07T10:15:00.000Z' } } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/book/teacher-1');
    await page.getByRole('button', { name: /Book .*09:15/ }).click();
    await page.getByRole('button', { name: 'Request this lesson' }).click();

    await expect.poll(() => bookingInput).not.toBeNull();
    expect(bookingInput).toMatchObject({
      teacherProfileId: 'teacher-1',
      startsAt: '2026-09-07T09:15:00.000Z',
      durationMin: 60,
      instrument: 'Piano',
      format: 'ONLINE',
    });
  });
});
