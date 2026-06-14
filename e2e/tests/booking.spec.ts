import { test, expect, pickAvailableSlot, bookSlot, openFirstEventType } from './helpers.js';
import { randomUUID } from 'node:crypto';

test.describe('Guest booking — happy path', () => {
  test('complete booking flow from event list to confirmation', async ({ page }) => {
    const uid = randomUUID().slice(0, 8);

    await openFirstEventType(page);

    // Booking page with calendar should appear
    await expect(page.locator('text=Select a date')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Select a time slot')).toBeVisible({ timeout: 5000 });

    // Pick a date and time slot
    const slotLabel = await pickAvailableSlot(page);

    // Booking form appears
    await expect(page.locator('text=Your details')).toBeVisible({ timeout: 5000 });

    // Fill and book
    await bookSlot(page, 'Test Guest', `guest-${uid}@test.com`, 'Automated e2e test');

    // Confirmation
    await expect(page.locator('text=Booking confirmed!')).toBeVisible({ timeout: 10000 });

    // Back to event types list
    await page.click('text=Book another call');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Book a call')).toBeVisible({ timeout: 5000 });
  });
});
