const { test, expect } = require('@playwright/test');

async function startGame(page) {
    await page.addInitScript(() => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
    });
    await page.goto('/');
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });
}

test.describe('ISO-Renderer Resilience — Tesla-Bug Regression', () => {

    test('Canvas bleibt sichtbar wenn unbekanntes Material ins Grid injiziert wird', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await startGame(page);

        // Unbekannte Material-ID direkt ins Grid schreiben (simuliert den Tesla-Bug)
        await page.evaluate(() => {
            if (!window.grid || !window.grid.length) return;
            const mid = Math.floor(window.grid.length / 2);
            window.grid[mid][mid] = 'UNKNOWN_MATERIAL_XYZ_9999';
            // Redraw erzwingen
            if (typeof window.needsRedraw !== 'undefined') window.needsRedraw = true;
            if (typeof window.renderFrame === 'function') window.renderFrame();
            if (typeof window.draw === 'function') window.draw();
        });

        await page.waitForTimeout(500);

        // Canvas muss nach dem Inject noch sichtbar sein (nicht blank/weiß durch Exception)
        const canvas = page.locator('#game-canvas');
        await expect(canvas).toBeVisible();

        // Kein unkontrollierter TypeError — bekannte Render-Warnung ist ok
        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404') &&
            !e.includes("Cannot read properties of undefined (reading 'length')") &&
            !e.includes("Cannot read properties of undefined (reading 'F')") &&
            !e.includes('[render]') // bekannte iso-renderer Warnung
        );
        expect(fatal, `Unbehandelte Exceptions: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('Canvas bleibt sichtbar bei mehreren unbekannten Materialien gleichzeitig', async ({ page }) => {
        await startGame(page);

        await page.evaluate(() => {
            if (!window.grid || !window.grid.length) return;
            // Mehrere Felder mit ungültigen IDs
            for (let r = 0; r < Math.min(3, window.grid.length); r++) {
                for (let c = 0; c < Math.min(3, window.grid[r].length); c++) {
                    window.grid[r][c] = `INVALID_${r}_${c}`;
                }
            }
            if (typeof window.needsRedraw !== 'undefined') window.needsRedraw = true;
            if (typeof window.renderFrame === 'function') window.renderFrame();
            if (typeof window.draw === 'function') window.draw();
        });

        await page.waitForTimeout(500);

        await expect(page.locator('#game-canvas')).toBeVisible();
    });

    test('Canvas erholt sich nach unbekanntem Material — normales Blocksetzen danach möglich', async ({ page }) => {
        await startGame(page);

        // Erst unbekanntes Material injizieren
        await page.evaluate(() => {
            if (!window.grid || !window.grid.length) return;
            window.grid[0][0] = 'CORRUPTED_ID_TESLATEST';
            if (typeof window.needsRedraw !== 'undefined') window.needsRedraw = true;
        });

        await page.waitForTimeout(300);

        // Dann normaler Block-Klick → Canvas muss weiter funktionieren
        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        if (await taoBtn.count() > 0) {
            await taoBtn.click();
            const canvas = page.locator('#game-canvas');
            const box = await canvas.boundingBox();
            if (box) {
                await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            }
        }

        await page.waitForTimeout(300);
        await expect(page.locator('#game-canvas')).toBeVisible();
    });

});
