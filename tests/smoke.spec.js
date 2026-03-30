const { test, expect } = require('@playwright/test');

test.describe('Schatzinsel Smoke Test', () => {
    test('page loads with correct title', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await expect(page).toHaveTitle(/Schatzinsel/);
    });

    test('intro screen shows Los button', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        const losBtn = page.locator('#start-button');
        await expect(losBtn).toBeVisible();
        await expect(losBtn).toContainText('Los');
    });

    test('game starts after clicking Los', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await page.click('#start-button');
        // Canvas should be visible
        const canvas = page.locator('#game-canvas');
        await expect(canvas).toBeVisible();
        // Palette should have 5 Wu Xing elements
        const palette = page.locator('#palette');
        await expect(palette).toBeVisible();
    });

    test('Wu Xing elements are in palette', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await page.click('#start-button');
        for (const mat of ['metal', 'wood', 'fire', 'water', 'earth']) {
            await expect(page.locator(`[data-material="${mat}"]`)).toBeVisible();
        }
    });

    test('chat bubble is visible', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await page.click('#start-button');
        const chatBubble = page.locator('#chat-bubble');
        await expect(chatBubble).toBeVisible();
    });

    test('craft endpoint responds', async ({ request }) => {
        const res = await request.post('https://schatzinsel.hoffmeyer-zlotnik.workers.dev/craft', {
            data: { a: 'fire', b: 'water', discoverer: 'Smoke-Test' }
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.emoji).toBeTruthy();
        expect(body.name).toBeTruthy();
    });

    test('discoveries endpoint responds', async ({ request }) => {
        const res = await request.get('https://schatzinsel.hoffmeyer-zlotnik.workers.dev/discoveries');
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(typeof body.total).toBe('number');
    });
});
