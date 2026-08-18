import { test, expect } from '@playwright/test';
import { signInAs } from './fixtures/auth';

/**
 * Regression test for: "Variable "$slots" got invalid value ... Field
 * "__typename" is not defined by type "AvailabilitySlotInput"". The
 * availability page seeded its editable slot state straight from the
 * Apollo query result, so every edited/saved slot carried Apollo's
 * `__typename` and the row's `id` — neither of which the mutation's input
 * type accepts. This drives the real save button and inspects exactly what
 * left the browser.
 */
test.describe('Teacher availability save', () => {
  test('sends only AvailabilitySlotInput fields, never __typename or id', async ({ page, context }) => {
    await signInAs(context, { roles: ['TEACHER'] });

    let saveVariables: any = null;

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON();

      if (body?.operationName === 'TeacherSchedule') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                teacherProfile: {
                  id: 'teacher-profile-1',
                  availability: [
                    {
                      __typename: 'TeacherAvailability',
                      id: 'existing-slot-1',
                      dayOfWeek: 1,
                      startTime: '09:00',
                      endTime: '10:00',
                    },
                  ],
                },
              },
            },
          }),
        });
        return;
      }

      if (body?.operationName === 'SaveTeacherSlots') {
        saveVariables = body.variables;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              setAvailability: (body.variables.slots as any[]).map((slot, i) => ({
                __typename: 'TeacherAvailability',
                id: `saved-slot-${i}`,
                ...slot,
              })),
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/dashboard/teacher/availability');
    await expect(page.getByRole('button', { name: 'Publish availability' })).toBeVisible();

    await page.getByRole('button', { name: 'Publish availability' }).click();

    await expect.poll(() => saveVariables).not.toBeNull();
    expect(Array.isArray(saveVariables.slots)).toBe(true);
    expect(saveVariables.slots.length).toBeGreaterThan(0);

    for (const slot of saveVariables.slots) {
      expect(slot).not.toHaveProperty('__typename');
      expect(slot).not.toHaveProperty('id');
      expect(Object.keys(slot).sort()).toEqual(['dayOfWeek', 'endTime', 'startTime', 'timezone']);
    }
  });
});
