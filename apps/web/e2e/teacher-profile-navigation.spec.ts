import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

/**
 * Regression test for Phase 2: the teacher workspace's "Teacher profile"
 * card used to link to /dashboard/profile (the general account profile),
 * and the public teacher profile's "Manage teacher profile" button did the
 * same. Both must land on the dedicated /dashboard/teacher/profile route,
 * and that route's back link must return to /dashboard/teacher.
 */
test.describe('Teacher profile navigation', () => {
  test('workspace "Teacher profile" card links to /dashboard/teacher/profile, not the general profile', async ({ page, context }) => {
    await signInAs(context, { roles: ['TEACHER'] });

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'TeacherBookings') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { me: { id: 'teacher-user-1' }, myBookings: [] } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard/teacher');
    const profileCard = page.getByRole('link', { name: /Teacher profile/i });
    await expect(profileCard).toBeVisible();
    await expect(profileCard).toHaveAttribute('href', '/dashboard/teacher/profile');
  });

  test('/dashboard/teacher/profile back link returns to /dashboard/teacher, not /dashboard', async ({ page, context }) => {
    await signInAs(context, { roles: ['TEACHER'] });

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.operationName === 'TeacherProfessionalProfile') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: 'teacher-user-1',
                profile: { city: null, country: null },
                teacherProfile: {
                  id: 'teacher-profile-1', headline: null, teachingBio: null, hourlyRate: null, currency: 'CHF',
                  instruments: [], specializations: [], teachingFormats: [], isAvailable: true,
                  publicImageUrl: null, introVideoUrl: null, introVideoVisible: true,
                  avgRating: 0, totalReviews: 0, memberSince: '2026-01-01T00:00:00.000Z',
                  distinctStudentCount: 0, publishedResourceCount: 0,
                },
              },
              myBookings: [],
              storageConfigured: false,
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard/teacher/profile');
    const backLink = page.getByRole('link', { name: /Teacher workspace/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/dashboard/teacher');
  });
});
