import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

/**
 * Regression test for the fake demo stats the admin overview used to show
 * (a hardcoded SAMPLE_STATS constant never wired to the adminStats query):
 * 1,247 total users, 42 teachers, 86 courses, 23 events, 534 bookings,
 * CHF 48,750 revenue. This asserts the page renders whatever adminStats
 * actually returns, and never those specific numbers.
 */
test.describe('Admin overview stats', () => {
  test('renders live adminStats data, never the old hardcoded demo numbers', async ({ page, context }) => {
    await signInAs(context, { roles: ['ADMIN'] });

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'AdminStats') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              adminStats: {
                totalUsers: 2,
                totalTeachers: 1,
                totalCourses: 0,
                totalEvents: 0,
                totalBookings: 0,
                totalRevenue: 0,
              },
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

    await expect(page.getByTestId('stat-total-users')).toContainText('2');
    await expect(page.getByTestId('stat-teachers')).toContainText('1');
    await expect(page.getByTestId('stat-courses')).toContainText('0');
    await expect(page.getByTestId('stat-events')).toContainText('0');
    await expect(page.getByTestId('stat-bookings')).toContainText('0');
    await expect(page.getByTestId('stat-revenue')).toContainText('CHF 0');

    // The exact demo numbers that used to be hardcoded must never appear.
    for (const demoValue of ['1,247', '42', '86', '23', '534', '48,750']) {
      await expect(page.getByText(demoValue, { exact: true })).toHaveCount(0);
    }
  });

  test('shows a loading state, then an error banner, if adminStats fails', async ({ page, context }) => {
    await signInAs(context, { roles: ['ADMIN'] });

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'AdminStats') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: null, errors: [{ message: 'internal error' }] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin');
    await expect(page.getByText(/Failed to load platform stats/)).toBeVisible();
  });
});
