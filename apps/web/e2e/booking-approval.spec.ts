import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

test.describe('paid booking approval lifecycle', () => {
  test('teacher can accept a paid request', async ({ page, context }) => {
    await signInAs(context, { roles: ['TEACHER'] });
    let accepted = false;
    let acceptedId: string | null = null;
    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'TeacherBookings') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: {
            me: { id: 'teacher-user-1' },
            myBookings: [{
              id: 'booking-1', status: accepted ? 'CONFIRMED' : 'PENDING', instrument: 'Piano',
              startsAt: '2026-09-10T09:00:00.000Z', format: 'ONLINE', paymentId: 'payment-1',
              packagePurchaseId: null, student: { id: 'student-1', displayName: 'Tom Test', avatarUrl: null },
              teacher: { hourlyRate: 60 },
            }],
          } }),
        });
        return;
      }
      if (body?.operationName === 'TeacherConfirmBooking') {
        acceptedId = body.variables.bookingId;
        accepted = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { confirmBooking: { id: 'booking-1', status: 'CONFIRMED' } } }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard/teacher');
    await expect(page.getByText('AWAITING APPROVAL')).toBeVisible();
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    await expect.poll(() => acceptedId).toBe('booking-1');
    await expect(page.getByText('CONFIRMED')).toBeVisible();
  });

  test('student return page reconciles payment and explains teacher approval', async ({ page, context }) => {
    await signInAs(context, { roles: ['STUDENT'] });
    let reconciled = false;
    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'ReconcileBookingPayment') {
        reconciled = body.variables.sessionId === 'cs_test_booking_1';
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { reconcileBookingPayment: { id: 'booking-1', status: 'PENDING', paymentId: 'payment-1' } } }) });
        return;
      }
      if (body?.operationName === 'PaymentSuccessBooking') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { booking: {
            id: 'booking-1', status: 'PENDING', paymentId: reconciled ? 'payment-1' : null,
            teacher: { user: { displayName: 'Jens Apel' } },
          } } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/payment/success?session_id=cs_test_booking_1&type=booking&ref=booking-1');
    await expect(page.getByRole('heading', { name: 'Payment successful' })).toBeVisible();
    await expect(page.getByText(/booking request was sent to Jens Apel/i)).toBeVisible();
    await expect(page.getByText(/email you again once it is accepted/i)).toBeVisible();
  });
});
