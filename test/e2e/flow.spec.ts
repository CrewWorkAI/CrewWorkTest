import { test, expect } from '@playwright/test';

// The goal is to exercise a very small portion of the UI to
// ensure the app is rendering and the home page loads.
test.describe('Basic UI sanity', () => {
  test('should display the homepage title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    // The backend may return a generic title; we only check it exists
    expect(title.length).toBeGreaterThan(0);
  });
});

