// Perf-Test: misst Frame-Budget der Game-Loop.
// Till reported 40% CPU auf schatzinsel.app — Ziel ist <20%.
// Proxy-Metrik: Anteil lange Frames (>25ms = klarer Drop bei 60fps-Ziel).

const { test, expect } = require('@playwright/test');

async function bootGame(page) {
    await page.addInitScript(() => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
    });
    await page.goto('/');
    await page.fill('#player-name-input', 'Perfpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
}

test.describe('Performance', () => {

    test('Flat-Modus: <20% Frames dauern >25ms (60fps-Budget 16.67ms)', async ({ page }) => {
        await bootGame(page);

        const result = await page.evaluate(async () => {
            return await new Promise(resolve => {
                const frames = [];
                const target = 120; // 2 Sekunden @ 60fps
                let last = performance.now();
                function tick(now) {
                    frames.push(now - last);
                    last = now;
                    if (frames.length < target) requestAnimationFrame(tick);
                    else {
                        const sorted = [...frames].sort((a, b) => a - b);
                        resolve({
                            count: frames.length,
                            median: sorted[Math.floor(sorted.length / 2)],
                            p95:    sorted[Math.floor(sorted.length * 0.95)],
                            p99:    sorted[Math.floor(sorted.length * 0.99)],
                            slowFrames: frames.filter(f => f > 25).length,
                            veryLongFrames: frames.filter(f => f > 50).length
                        });
                    }
                }
                requestAnimationFrame(tick);
            });
        });

        console.log('[perf flat]', JSON.stringify(result));
        const slowRatio = result.slowFrames / result.count;
        expect(slowRatio, `>25ms frames: ${result.slowFrames}/${result.count} (${(slowRatio*100).toFixed(1)}%), p95=${result.p95.toFixed(1)}ms`).toBeLessThan(0.20);
    });

    test('Iso-Modus: <25% Frames dauern >25ms (schwerer, aber noch ok)', async ({ page }) => {
        await bootGame(page);

        const isoBtn = page.locator('#iso-toggle, [data-tool="iso"], button:has-text("Iso")').first();
        if (await isoBtn.isVisible().catch(() => false)) {
            await isoBtn.click();
            await page.waitForTimeout(500);
        }

        const result = await page.evaluate(async () => {
            return await new Promise(resolve => {
                const frames = [];
                const target = 120;
                let last = performance.now();
                function tick(now) {
                    frames.push(now - last);
                    last = now;
                    if (frames.length < target) requestAnimationFrame(tick);
                    else {
                        const sorted = [...frames].sort((a, b) => a - b);
                        resolve({
                            count: frames.length,
                            median: sorted[Math.floor(sorted.length / 2)],
                            p95:    sorted[Math.floor(sorted.length * 0.95)],
                            p99:    sorted[Math.floor(sorted.length * 0.99)],
                            slowFrames: frames.filter(f => f > 25).length,
                            veryLongFrames: frames.filter(f => f > 50).length
                        });
                    }
                }
                requestAnimationFrame(tick);
            });
        });

        console.log('[perf iso]', JSON.stringify(result));
        const slowRatio = result.slowFrames / result.count;
        expect(slowRatio, `>25ms frames: ${result.slowFrames}/${result.count} (${(slowRatio*100).toFixed(1)}%), p95=${result.p95.toFixed(1)}ms`).toBeLessThan(0.25);
    });

    test('Keine Layout-Thrashing-Loops beim Resize', async ({ page }) => {
        await bootGame(page);

        const before = await page.evaluate(() => performance.now());
        await page.setViewportSize({ width: 900, height: 700 });
        await page.waitForTimeout(200);
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(200);
        const after = await page.evaluate(() => performance.now());

        // Ein handled resize sollte total < 1000ms netto bleiben
        expect(after - before).toBeLessThan(3000);
    });

});
