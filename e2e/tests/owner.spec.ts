import { test, expect, pickAvailableSlot, bookSlot, openFirstEventType } from './helpers.js';
import { randomUUID } from 'node:crypto';

test.describe('Owner admin panel', () => {
  test('owner creates an event type and guest sees it', async ({ page }) => {
    const title = `E2E Test ${randomUUID().slice(0, 6)}`;
    const desc = 'Created by Playwright test';

    // 1. Open admin event types page
    await page.goto('/admin/event-types');
    await expect(page.locator('text=Create Event Type')).toBeVisible({ timeout: 10000 });

    // 2. Fill form and create
    await page.fill('input[placeholder*="consultation"]', title);
    await page.fill('textarea', desc);
    await page.click('button[type="submit"]');

    // 3. Notification
    await expect(page.locator('text=Event type created')).toBeVisible({ timeout: 10000 });

    // 4. New event type visible in admin list
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 5000 });

    // 5. Guest homepage — new event type visible
    await page.goto('/');
    await expect(page.locator('text=Book a call')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 5000 });
  });

  test('owner sees booked meeting on dashboard', async ({ page }) => {
    const uid = randomUUID().slice(0, 8);
    const email = `dash-${uid}@test.com`;

    // 1. Book a call as guest
    await openFirstEventType(page);
    await expect(page.locator('text=Select a date')).toBeVisible({ timeout: 10000 });

    await pickAvailableSlot(page);
    await expect(page.locator('text=Your details')).toBeVisible({ timeout: 5000 });
    await bookSlot(page, 'Dashboard Test', email, 'For dashboard check');
    await expect(page.locator('text=Booking confirmed!')).toBeVisible({ timeout: 10000 });

    // 2. Navigate to admin dashboard
    await page.goto('/admin');
    await expect(page.locator('text=Welcome, Daria')).toBeVisible({ timeout: 10000 });

    // 3. Should see the booking in the list
    await expect(page.locator('text=Dashboard Test')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${email}`)).toBeVisible({ timeout: 5000 });
  });
});
