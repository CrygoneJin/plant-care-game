const { test, expect } = require('@playwright/test');

// Hilfsfunktion: Big-Bang überspringen + Progressive Disclosure State setzen
async function skipBigBang(page, stufe = 1) {
    await page.addInitScript((s) => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
        if (s >= 2) localStorage.setItem('insel-blocks-placed', '5');
        if (s >= 3) localStorage.setItem('insel-unlocked-materials', '["qi","feuer","wasser","erde","holz"]');
        if (s >= 4) localStorage.setItem('insel-discovered-recipes', '["Qi"]');
        if (s >= 5) localStorage.setItem('insel-quests-done', '["Seed-Quest"]');
    }, stufe);
}

async function startGame(page, stufe = 1) {
    await skipBigBang(page, stufe);
    await page.goto('/');
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });
}

// ─── Block-Placement Tests ────────────────────────────────────────────────────

test.describe('Block-Placement — Tools', () => {

    test('Build-Tool ist beim Start aktiv', async ({ page }) => {
        await startGame(page);
        const buildBtn = page.locator('.tool-btn[data-tool="build"]');
        await expect(buildBtn).toBeVisible({ timeout: 5000 });
        await expect(buildBtn).toHaveClass(/active/);
    });

    test('Harvest-Tool wird nach Klick aktiv', async ({ page }) => {
        await startGame(page);

        const harvestBtn = page.locator('.tool-btn[data-tool="harvest"]');
        await expect(harvestBtn).toBeVisible({ timeout: 5000 });
        await harvestBtn.click();

        await expect(harvestBtn).toHaveClass(/active/);
        // Build-Tool darf nicht mehr aktiv sein
        const buildBtn = page.locator('.tool-btn[data-tool="build"]');
        await expect(buildBtn).not.toHaveClass(/active/);
    });

    test('Fill-Tool wird nach Klick aktiv', async ({ page }) => {
        await startGame(page);

        const fillBtn = page.locator('.tool-btn[data-tool="fill"]');
        await expect(fillBtn).toBeVisible({ timeout: 5000 });
        await fillBtn.click();

        await expect(fillBtn).toHaveClass(/active/);
    });

    test('Tool-Wechsel von Fill zurück zu Build funktioniert', async ({ page }) => {
        await startGame(page);

        const buildBtn = page.locator('.tool-btn[data-tool="build"]');
        const fillBtn = page.locator('.tool-btn[data-tool="fill"]');

        await fillBtn.click();
        await expect(fillBtn).toHaveClass(/active/);

        await buildBtn.click();
        await expect(buildBtn).toHaveClass(/active/);
        await expect(fillBtn).not.toHaveClass(/active/);
    });

});

test.describe('Block-Placement — blocks-placed Counter', () => {

    test('insel-blocks-placed steigt nach Block-Klick', async ({ page }) => {
        await startGame(page);

        const vorher = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );

        // Tao auswählen und Block platzieren
        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

        // block:placed Event abwarten
        await page.waitForFunction(() => {
            const current = parseInt(localStorage.getItem('insel-blocks-placed') || '0');
            return current > 0;
        }, { timeout: 5000 });

        const nachher = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );
        expect(nachher, 'blocks-placed muss nach Block-Klick steigen').toBeGreaterThan(vorher);
    });

    test('Mehrere Blöcke erhöhen den Counter entsprechend', async ({ page }) => {
        await startGame(page);

        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();

        // 3 verschiedene Canvas-Positionen klicken
        await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.5);
        await page.waitForTimeout(200);
        await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3);
        await page.waitForTimeout(200);
        await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5);
        await page.waitForTimeout(500);

        const count = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );
        expect(count, 'Nach 3 Block-Klicks muss Counter >= 1 sein').toBeGreaterThanOrEqual(1);
    });

});

test.describe('Block-Placement — Undo', () => {

    test('Strg+Z nach Block-Klick erzeugt keinen JS-Fehler', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await startGame(page);

        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);

        await page.keyboard.press('Control+z');
        await page.waitForTimeout(300);

        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404')
        );
        expect(fatal, `Undo-JS-Fehler: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('Strg+Z ohne vorherigen Block erzeugt keinen JS-Fehler', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await startGame(page);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(300);

        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404')
        );
        expect(fatal, `Undo-JS-Fehler: ${fatal.join('\n')}`).toHaveLength(0);
    });

});

// ─── Quest-Progress Tests ─────────────────────────────────────────────────────

test.describe('Quest-Progress — Initialer State', () => {

    test('getActive() gibt leeres Array zurück bei frischem Spiel', async ({ page }) => {
        await startGame(page);

        const active = await page.evaluate(() => window.questSystem.getActive());
        expect(Array.isArray(active), 'getActive() muss Array zurückgeben').toBe(true);
        expect(active.length, 'Keine aktiven Quests bei frischem Spiel').toBe(0);
    });

    test('getCompleted() gibt leeres Array zurück bei frischem Spiel', async ({ page }) => {
        await startGame(page);

        const completed = await page.evaluate(() => window.questSystem.getCompleted());
        expect(Array.isArray(completed), 'getCompleted() muss Array zurückgeben').toBe(true);
        expect(completed.length, 'Keine abgeschlossenen Quests bei frischem Spiel').toBe(0);
    });

    test('getCompleted() lädt pre-populated Quests aus localStorage', async ({ page }) => {
        const preloadedQuest = 'Spongebobs Seifenblasen-Fabrik';
        await page.addInitScript((title) => {
            localStorage.setItem('insel-genesis-shown', '1');
            localStorage.removeItem('insel-player-name');
            localStorage.setItem('insel-quests-done', JSON.stringify([title]));
        }, preloadedQuest);

        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
        await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });

        const completed = await page.evaluate(() => window.questSystem.getCompleted());
        expect(completed, 'getCompleted() muss pre-loaded Quest enthalten').toContain(preloadedQuest);
    });

});

test.describe('Quest-Progress — Annehmen und Status', () => {

    test('Angenommene Quest erscheint in getActive() mit Titel und NPC', async ({ page }) => {
        await startGame(page);

        const result = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return { error: 'Keine Quest für spongebob verfügbar' };
            window.questSystem.accept(quest);
            const active = window.questSystem.getActive();
            const found = active.find(q => q.title === quest.title);
            return {
                found: !!found,
                hasNpc: found ? !!found.npc : false,
                hasNeeds: found ? typeof found.needs === 'object' : false,
                title: quest.title
            };
        });

        expect(result.error, result.error).toBeUndefined();
        expect(result.found, `Quest "${result.title}" nicht in getActive()`).toBe(true);
        expect(result.hasNpc, 'Quest muss npc-Feld haben').toBe(true);
        expect(result.hasNeeds, 'Quest muss needs-Objekt haben').toBe(true);
    });

    test('Angenommene Quest persistiert in localStorage', async ({ page }) => {
        await startGame(page);

        const questTitle = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return null;
            window.questSystem.accept(quest);
            return quest.title;
        });

        expect(questTitle, 'Keine Quest für spongebob verfügbar').not.toBeNull();

        const stored = await page.evaluate(() => {
            const raw = localStorage.getItem('insel-quests');
            return raw ? JSON.parse(raw) : [];
        });
        const found = stored.some(q => q.title === questTitle);
        expect(found, `Quest "${questTitle}" nicht in localStorage gespeichert`).toBe(true);
    });

    test('getAvailable(npcId) gibt null zurück wenn Quest bereits aktiv', async ({ page }) => {
        await startGame(page);

        const result = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return { error: 'Keine Quest verfügbar' };
            window.questSystem.accept(quest);
            // Jetzt nochmal versuchen
            const second = window.questSystem.getAvailable('spongebob');
            return { secondIsNull: second === null || second === undefined };
        });

        expect(result.error, result.error).toBeUndefined();
        expect(result.secondIsNull, 'getAvailable() muss null zurückgeben wenn Quest bereits aktiv').toBe(true);
    });

});
