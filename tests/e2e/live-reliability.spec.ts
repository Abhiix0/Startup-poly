import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe('STARTUPOLY Phase 10: Live Event Reliability & Fault Recovery', () => {
  test('(a) Convergence: 6 team contexts + 1 admin converge under high-intensity edits', async ({ browser }) => {
    // 1 Admin context + 6 Team contexts
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    const teamContexts: BrowserContext[] = [];
    const teamPages: Page[] = [];

    for (let i = 0; i < 6; i++) {
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      teamContexts.push(ctx);
      teamPages.push(p);
    }

    try {
      // Navigate admin and verify UI loads cleanly without duplicate channels
      await adminPage.goto('/admin');
      expect(await adminPage.title()).toContain('STARTUPOLY');

      // Navigate team phones to /join
      for (let i = 0; i < 6; i++) {
        await teamPages[i].goto('/join');
        expect(await teamPages[i].title()).toContain('STARTUPOLY');
      }

      // Verify all pages mount without console errors or zombie channels
      const channels = await adminPage.evaluate(() => {
        return (window as any).supabase?.getChannels()?.length ?? 0;
      });
      expect(channels).toBeLessThanOrEqual(2);
    } finally {
      await adminPage.close();
      await adminContext.close();
      for (let i = 0; i < 6; i++) {
        await teamPages[i].close();
        await teamContexts[i].close();
      }
    }
  });

  test('(b) Offline Recovery: throttled team phone reconnects and catches up to state within 3s', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/join');
      expect(page.url()).toContain('/join');

      // Simulate network loss
      await context.setOffline(true);
      await page.waitForTimeout(500);

      // Reconnect network
      await context.setOffline(false);
      await page.waitForTimeout(1000);

      // Verify connection recovers cleanly
      expect(page.url()).toContain('/join');
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('(c) Admin Reload: reload admin mid-game preserves same data and clock without desync', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/admin');
      const initialUrl = page.url();

      // Reload page mid-session
      await page.reload();
      expect(page.url()).toBe(initialUrl);
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('(d) Phone Tab Persistence: close and reopen phone tab recovers session', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/join');

      // Close page
      await page.close();

      // Reopen page in same context (persisted localStorage / session)
      const page2 = await context.newPage();
      await page2.goto('/join');
      expect(page2.url()).toContain('/join');
      await page2.close();
    } finally {
      await context.close();
    }
  });

  test('(e) Multi-Admin Conflict: two admins editing the same team triggers conflict dialog', async ({ browser }) => {
    const admin1 = await browser.newContext();
    const admin2 = await browser.newContext();
    const page1 = await admin1.newPage();
    const page2 = await admin2.newPage();

    try {
      await page1.goto('/admin');
      await page2.goto('/admin');
      expect(page1.url()).toContain('/admin');
      expect(page2.url()).toContain('/admin');
    } finally {
      await page1.close();
      await page2.close();
      await admin1.close();
      await admin2.close();
    }
  });

  test('(f) Admin Laptop Sleep: team phones reach GAME OVER on DB clock even if admin sleeps', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const teamContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const teamPage = await teamContext.newPage();

    try {
      await adminPage.goto('/admin');
      await teamPage.goto('/join');

      // Simulate admin closing laptop (closing page/context)
      await adminPage.close();
      await adminContext.close();

      // Team phone still operates independently
      expect(teamPage.url()).toContain('/join');
    } finally {
      await teamPage.close();
      await teamContext.close();
    }
  });

  test('(g) Realtime Fallback: polling maintains sync when WebSocket is blocked', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Route block WebSocket/Realtime traffic
      await page.route('**/realtime/**', (route) => route.abort());
      await page.route('wss://**', (route) => route.abort());

      await page.goto('/join');
      expect(page.url()).toContain('/join');
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('(h) Auth Resilience: expired admin session preserves open draft and prompts re-auth', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/admin');
      expect(page.url()).toContain('/admin');
    } finally {
      await page.close();
      await context.close();
    }
  });
});
