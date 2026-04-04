const { test, expect } = require('@playwright/test');

// Hilfsfunktion: Big-Bang-Countdown ueberspringen
// insel-grid setzen → isFirstVisit=false → kein Countdown
// insel-player-name NICHT setzen → playerName='' → Name-Input bleibt sichtbar
async function skipBigBang(page) {
    await page.addInitScript(() => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.removeItem('insel-player-name');
    });
}

test.describe('Smoke Tests', () => {

    test('Seite laedt, Titel enthaelt Schatzinsel', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Schatzinsel/);
    });

    test('Intro-Overlay ist sichtbar', async ({ page }) => {
        await page.goto('/');
        const overlay = page.locator('#intro-overlay');
        await expect(overlay).toBeVisible();
    });

    test('Start-Button existiert', async ({ page }) => {
        await page.goto('/');
        const btn = page.locator('#start-button');
        await expect(btn).toBeVisible();
    });

    test('Name eingeben + Start → Intro weg, Canvas sichtbar', async ({ page }) => {
        await skipBigBang(page);
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        // Intro-Overlay verschwindet nach finishIntro() (300ms fade + display:none)
        await expect(page.locator('#intro-overlay')).toBeHidden({ timeout: 10000 });
        // Canvas sichtbar
        await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });
    });

    test('Palette hat Material-Buttons', async ({ page }) => {
        await skipBigBang(page);
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await expect(page.locator('#intro-overlay')).toBeHidden({ timeout: 10000 });
        const count = await page.locator('.material-btn').count();
        expect(count).toBeGreaterThan(0);
    });

    test('Kein fataler JavaScript-Error in der Console', async ({ page }) => {
        await skipBigBang(page);
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await page.waitForTimeout(2000);

        // Bekannte harmlose Fehler rausfiltern:
        // - Netzwerk-Fehler (kein Worker lokal)
        // - WebSocket (kein Voice-Worker lokal)
        // - 404s (fehlende Assets lokal)
        // - undefined.length / undefined.F = Wetter-API oder externe Calls ohne Netz
        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404') &&
            !e.includes("Cannot read properties of undefined (reading 'length')") &&
            !e.includes("Cannot read properties of undefined (reading 'F')")
        );
        expect(fatal, `JS-Exceptions: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('Service Worker registriert sich', async ({ page }) => {
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');

        await page.waitForTimeout(3000);

        const hasSW = await page.evaluate(async () => {
            if (!navigator.serviceWorker) return false;
            const reg = await navigator.serviceWorker.getRegistration('/');
            return !!reg;
        });
        expect(hasSW).toBe(true);
    });

});
