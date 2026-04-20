const { test, expect } = require('@playwright/test');

// Hilfsfunktion: Spiel mit vorgesetztem Inventar starten
// inventarItems: { yin: 3, yang: 3 } etc. — wird in localStorage gesetzt
// Stufe 5 = Werkbank sichtbar (hasRecipe + blocksPlaced > 0)
async function startGameWithInventar(page, inventarItems = {}) {
    await page.addInitScript((items) => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
        localStorage.setItem('insel-blocks-placed', '5');
        localStorage.setItem('insel-unlocked-materials', '["qi","yin","yang","feuer","wasser","erde","holz"]');
        localStorage.setItem('insel-discovered-recipes', '["Qi"]');
        localStorage.setItem('insel-quests-done', '["Seed-Quest"]');
        if (items && Object.keys(items).length > 0) {
            localStorage.setItem('insel-inventar', JSON.stringify(items));
        }
    }, inventarItems);

    await page.goto('/');
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });
}

test.describe('Werkbank — Dialog öffnen und schließen', () => {

    test('#craft-btn öffnet den Werkbank-Dialog', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        const craftBtn = page.locator('#craft-btn');
        await expect(craftBtn).toBeVisible({ timeout: 5000 });
        await craftBtn.click();

        const dialog = page.locator('#crafting-dialog');
        await expect(dialog).toBeVisible({ timeout: 3000 });
    });

    test('#close-crafting-dialog schließt den Dialog', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        await page.locator('#close-crafting-dialog').click();
        await expect(page.locator('#crafting-dialog')).toHaveClass(/hidden/, { timeout: 2000 });
    });

    test('Werkbank-Inventar zeigt vorhandene Items', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        const invItems = page.locator('#craft-inventory .craft-inv-item');
        const count = await invItems.count();
        expect(count, 'Werkbank muss Inventar-Items zeigen').toBeGreaterThan(0);

        await expect(page.locator('#craft-inventory .craft-inv-item[data-material="yin"]')).toBeVisible();
    });

});

test.describe('Werkbank — Rezept craften', () => {

    test('Klick auf Inventar-Item + Slot → Slot wird "filled"', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        await page.locator('#craft-inventory .craft-inv-item[data-material="yin"]').click();
        await page.locator('#craft-slot-0').click();

        await expect(page.locator('#craft-slot-0')).toHaveClass(/filled/, { timeout: 2000 });
    });

    test('yin + yang → Rezept-Preview mit has-recipe Klasse', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        await page.locator('#craft-inventory .craft-inv-item[data-material="yin"]').click();
        await page.locator('#craft-slot-0').click();
        await page.locator('#craft-inventory .craft-inv-item[data-material="yang"]').click();
        await page.locator('#craft-slot-1').click();

        await expect(page.locator('#craft-result')).toHaveClass(/has-recipe/, { timeout: 2000 });
    });

    test('#do-craft-btn → craft:success BUS-Event mit result="qi"', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        await page.evaluate(() => {
            window._testCraftResult = null;
            window.INSEL_BUS.on('craft:success', (data) => { window._testCraftResult = data; });
        });

        await page.locator('#craft-inventory .craft-inv-item[data-material="yin"]').click();
        await page.locator('#craft-slot-0').click();
        await page.locator('#craft-inventory .craft-inv-item[data-material="yang"]').click();
        await page.locator('#craft-slot-1').click();

        await page.locator('#do-craft-btn').click();

        await page.waitForFunction(() => window._testCraftResult !== null, { timeout: 3000 });

        const result = await page.evaluate(() => window._testCraftResult);
        expect(result.result, 'Ergebnis-Material muss "qi" sein').toBe('qi');
    });

    test('Nach doCraft ist qi im Inventar (getInventoryCount > 0)', async ({ page }) => {
        await startGameWithInventar(page, { yin: 3, yang: 3 });

        await page.locator('#craft-btn').click();
        await expect(page.locator('#crafting-dialog')).toBeVisible({ timeout: 3000 });

        await page.locator('#craft-inventory .craft-inv-item[data-material="yin"]').click();
        await page.locator('#craft-slot-0').click();
        await page.locator('#craft-inventory .craft-inv-item[data-material="yang"]').click();
        await page.locator('#craft-slot-1').click();
        await page.locator('#do-craft-btn').click();

        await page.waitForFunction(
            () => typeof window.getInventoryCount === 'function' && window.getInventoryCount('qi') > 0,
            { timeout: 3000 }
        );

        const qiCount = await page.evaluate(() => window.getInventoryCount('qi'));
        expect(qiCount, 'qi muss nach Craft im Inventar sein').toBeGreaterThan(0);
    });

});
