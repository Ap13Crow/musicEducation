import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

test.describe('Admin Classictic sync', () => {
  test('shows provider status and lets an admin trigger a manual sync', async ({ page, context }) => {
    await signInAs(context, { roles: ['ADMIN'] });
    let syncRequested = false;

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'AdminNavBadges') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              teacherApplications: [],
              mailOutbox: [],
            },
          }),
        });
        return;
      }
      if (body?.operationName === 'ClassicticProviderStatus') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              externalEventProviderStatus: {
                provider: 'CLASSICTIC',
                configured: true,
                enabled: true,
                totalEvents: 12,
                activeEvents: syncRequested ? 15 : 12,
                lastFetchedAt: '2026-08-29T12:00:00.000Z',
                source: 'api',
              },
            },
          }),
        });
        return;
      }
      if (body?.operationName === 'RunClassicticIngest') {
        syncRequested = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              runExternalEventIngest: {
                provider: 'CLASSICTIC',
                configured: true,
                enabled: true,
                source: 'api',
                fetched: 3,
                upserted: 3,
                withdrawn: 0,
                message: 'Classictic api ingest completed.',
              },
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Content' }).click();

    const card = page.getByTestId('classictic-sync-card');
    await expect(card).toContainText('Classictic discovery');
    await expect(card).toContainText('Configured');
    await expect(card).toContainText('12');

    await card.getByRole('button', { name: 'Sync now' }).click();
    await expect(card).toContainText('Fetched 3, upserted 3, withdrew 0.');
    expect(syncRequested).toBe(true);
  });
});
