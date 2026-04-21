const { test, expect } = require('@playwright/test');

test('Debug: Welche pageerrors nach startGame OHNE Undo?', async ({ page }) => {
    const errors = [];
    const warns = [];
    page.on('pageerror', err => errors.push({ msg: err.message, stack: err.stack }));
    page.on('console', msg => {
        if (msg.type() === 'warn' || msg.type() === 'error') {
            warns.push(`[${msg.type()}] ${msg.text()}`);
        }
    });

    await page.addInitScript(() => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
    });
    await page.goto('/?nocache=' + Date.now());
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('BASELINE ERRORS (nach startGame, keine Interaktion):');
    errors.forEach((e, i) => console.log(`  [${i}] ${e.msg}\n      ${(e.stack || '').split('\n').slice(0, 3).join(' | ')}`));
    console.log('BASELINE WARNS/ERRORS (Browser Console):');
    warns.slice(0, 10).forEach((w, i) => console.log(`  [${i}] ${w}`));

    // Jetzt Ctrl+Z drücken
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    console.log('NACH CTRL+Z:');
    errors.forEach((e, i) => console.log(`  [${i}] ${e.msg}\n      ${(e.stack || '').split('\n').slice(0, 3).join(' | ')}`));
});
