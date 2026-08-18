import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('events page renders without a live API', async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /Concerts, Workshops, and Masterclasses/i })).toBeVisible();
  });

  test('admin dashboard requires sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Access Required' })).toBeVisible();
  });
});
