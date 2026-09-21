import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('STARTUPOLY Phase 11: Accessibility Audit (axe-core)', () => {
  test('Landing Page (/) has zero serious or critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousOrCritical).toEqual([]);
  });

  test('Team Join Page (/join) has zero serious or critical a11y violations', async ({ page }) => {
    await page.goto('/join');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousOrCritical).toEqual([]);
  });

  test('Admin Login Page (/admin/login) has zero serious or critical a11y violations', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
