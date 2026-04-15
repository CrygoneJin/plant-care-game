const { test, expect } = require('@playwright/test');

// Externe Integration-Tests — brauchen Netzwerkzugang zu Live-URLs.
// In GitHub Actions CI überspringen (CI=true), weil externe Hosts nicht
// garantiert erreichbar sind und die Tests flaky werden.
test.describe('Burn-Panel Extern', () => {

    test.skip(!!process.env.CI, 'Externe URL-Tests laufen nicht in CI');

    test('Burn-Balance wird geladen', async ({ page }) => {
        await page.goto('https://schatzinsel.app');
        // Warte auf Balance-Poll (max 5s)
        await page.waitForFunction(() =>
            window._mmxBurnBalance !== undefined && window._mmxBurnBalance !== '?',
            { timeout: 5000 }
        ).catch(() => {}); // OK wenn Timeout — API kann blocken

        const bal = await page.evaluate(() => window._mmxBurnBalance);
        // Balance ist entweder eine Zahl oder '—' (API blockiert)
        expect(bal).toBeDefined();
        expect(bal).not.toBe('?');
    });

    test('Burn-Proxy Worker antwortet', async ({ request }) => {
        const res = await request.get('https://schatzinsel.hoffmeyer-zlotnik.workers.dev/burn');
        expect(res.ok()).toBeTruthy();
        const data = await res.json();
        expect(data).toHaveProperty('ts');
        expect(data).toHaveProperty('mmx');
    });

});
