import { expect, test } from '@playwright/test';

test('teacher profile keeps video and availability inside a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://www.youtube.com/**', (route) => route.abort());
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.operationName !== 'PublicTeacher') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          teacher: {
            id: 'teacher-profile-mobile', userId: 'teacher-user-mobile', headline: 'Conservatory-trained pianist',
            teachingBio: 'Piano lessons for all levels.', hourlyRate: 80, currency: 'CHF', instruments: ['Piano'],
            specializations: [], teachingFormats: ['ONLINE'], isAvailable: true, avgRating: 0, totalReviews: 0,
            yearsExperience: 2, introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            locationCity: 'Zug', locationCountry: 'Switzerland', publicImageUrl: null,
            memberSince: '2026-01-01T00:00:00.000Z', distinctStudentCount: 1, publishedResourceCount: 0,
            certifications: [], availability: [], instrumentCapacities: [],
            bookableSlots: [{ startsAt: '2026-09-02T13:00:00.000Z', endsAt: '2026-09-02T14:00:00.000Z', timezone: 'Europe/Zurich' }],
            user: { id: 'teacher-user-mobile', email: 'teacher@example.com', displayName: 'Helene Bruneau', eventsPublished: { nodes: [] } },
          },
          courses: { nodes: [] },
          reviews: { nodes: [], pageInfo: { totalCount: 0 } },
          teacherPackageOffers: [],
          teacherSubscriptionOffers: [],
        },
      }),
    });
  });

  await page.goto('/teachers/teacher-profile-mobile');
  await expect(page.getByRole('heading', { name: 'Helene Bruneau' })).toBeVisible();
  const iframe = page.getByTitle('Helene Bruneau — presentation video');
  await expect(iframe).toBeVisible();

  const viewport = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.pageWidth).toBeLessThanOrEqual(viewport.viewportWidth);

  const videoBox = await iframe.boundingBox();
  expect(videoBox).not.toBeNull();
  expect(videoBox!.width).toBeLessThanOrEqual(358);
  expect(videoBox!.width / videoBox!.height).toBeCloseTo(16 / 9, 1);

  const calendar = page.getByTestId('weekly-slot-calendar-scroll');
  await expect(calendar).toBeVisible();
  const calendarWidths = await calendar.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    right: element.getBoundingClientRect().right,
  }));
  expect(calendarWidths.scrollWidth).toBeGreaterThan(calendarWidths.clientWidth);
  expect(calendarWidths.right).toBeLessThanOrEqual(viewport.viewportWidth);
});
