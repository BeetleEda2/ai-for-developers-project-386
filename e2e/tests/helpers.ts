import { test as base, expect, type Page } from '@playwright/test';

const UNIQUE_PREFIX = Date.now().toString(36);

/**
 * Pick a unique slot by clicking an available date then an available time.
 */
async function pickAvailableSlot(page: Page) {
  // Click on the first available (non-disabled) day in the calendar
  const dayButton = page.locator('table button:not([disabled])').first();
  await expect(dayButton).toBeVisible({ timeout: 15000 });
  await dayButton.click();

  // Wait for time slot buttons to appear
  await page.waitForTimeout(500);

  // Click the first time slot button (matching HH:MM - HH:MM pattern)
  const slotButton = page.getByRole('button').filter({ hasText: /^\d{2}:\d{2}/ }).first();
  await expect(slotButton).toBeVisible({ timeout: 10000 });
  const label = await slotButton.textContent();
  await slotButton.click();

  return label;
}

/**
 * Fill the booking form and submit.
 */
async function bookSlot(page: Page, name: string, email: string, notes?: string) {
  await page.fill('input[placeholder="Your name"]', name);
  await page.fill('input[placeholder="your@email.com"]', email);
  if (notes) {
    await page.fill('textarea', notes);
  }
  await page.click('button[type="submit"]');
}

/**
 * Navigate to the booking page for the first event type.
 */
async function openFirstEventType(page: Page) {
  await page.goto('/');
  await expect(page.locator('text=Book a call')).toBeVisible({ timeout: 10000 });

  // Click the first event type card (body content, not header)
  const card = page.locator('[class*="mantine-Card-root"]').first();
  await expect(card).toBeVisible({ timeout: 5000 });
  await card.click();
  await page.waitForURL(/\/event-types\//);
}

export const test = base;
export { expect, pickAvailableSlot, bookSlot, openFirstEventType };
