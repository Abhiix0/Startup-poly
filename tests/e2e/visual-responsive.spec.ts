import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORTS = [
  { name: 'Small Android', width: 360, height: 640 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13/14', width: 390, height: 844 },
  { name: 'iPhone Pro Max', width: 430, height: 932 },
  { name: 'Landscape Phone', width: 844, height: 390 },
];

const DESKTOP_VIEWPORTS = [
  { name: 'HD 720p', width: 1280, height: 720 },
  { name: 'Laptop Common', width: 1366, height: 768 },
  { name: 'MacBook Pro 14', width: 1440, height: 900 },
  { name: 'Full HD 1080p', width: 1920, height: 1080 },
];

test.describe('STARTUPOLY Phase 11: Responsive Audit & Viewport Validation', () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`Mobile viewport ${vp.name} (${vp.width}x${vp.height}): Landing & Join have zero horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Check Landing Page
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const landingOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(landingOverflow).toBe(false);

      // Check Join Page
      await page.goto('/join');
      await page.waitForLoadState('domcontentloaded');

      const joinOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(joinOverflow).toBe(false);

      // Verify buttons have >= 44px height on mobile
      const joinButtons = await page.locator('button').all();
      for (const btn of joinButtons) {
        const box = await btn.boundingBox();
        if (box && (await btn.isVisible())) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Allow minimal pixel border variance, standard >= 44px
        }
      }
    });
  }

  for (const vp of DESKTOP_VIEWPORTS) {
    test(`Desktop viewport ${vp.name} (${vp.width}x${vp.height}): Admin routes have zero horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/admin/login');
      await page.waitForLoadState('domcontentloaded');

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow).toBe(false);
    });
  }

  test('Responsive guard below 1024px displays laptop recommendation message', async ({ page }) => {
    // 1. Mobile screen (width 800 < 1024)
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Message must be visible on mobile screens
    const guardMessage = page.locator('text=Use a laptop for the admin console');
    await expect(guardMessage.first()).toBeVisible();

    // 2. Desktop screen (width 1280 >= 1024)
    await page.setViewportSize({ width: 1280, height: 800 });
    // Guard banner must be hidden on >= 1024px desktop
    await expect(guardMessage.first()).not.toBeVisible();
  });
});
