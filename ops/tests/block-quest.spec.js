const { test, expect } = require('@playwright/test');

async function skipBigBang(page, stufe = 1) {
    await page.addInitScript((s) => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
        if (s >= 2) localStorage.setItem('insel-blocks-placed', '5');
        if (s >= 3) localStorage.setItem('insel-unlocked-materials', '["qi","feuer","wasser","erde","holz"]');
        if (s >= 4) localStorage.setItem('insel-discovered-recipes', '["qi"]');
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

async function placeTaoBlock(page) {
    const taoBtn = page.locator('.material-btn[data-material="tao"]');
    await expect(taoBtn).toBeVisible({ timeout: 5000 });
    await taoBtn.click();
    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
}

// ── Block-Placement Tools ───────────────────────────────────────────────────

test.describe('Block-Placement Tools', () => {

    test('Build-Tool ist beim Start aktiv', async ({ page }) => {
        await startGame(page);
        await expect(page.locator('[data-tool="build"]')).toHaveClass(/active/);
    });

    test('Harvest-Tool wird nach Klick aktiv', async ({ page }) => {
        // Stufe 4 damit Progressive Disclosure harvest/fill/craft sichtbar macht
        await startGame(page, 4);
        const harvestBtn = page.locator('[data-tool="harvest"]');
        await expect(harvestBtn).toBeVisible({ timeout: 5000 });
        await harvestBtn.click();
        await expect(harvestBtn).toHaveClass(/active/);
    });

    test('Fill-Tool wird nach Klick aktiv', async ({ page }) => {
        await startGame(page, 4);
        const fillBtn = page.locator('[data-tool="fill"]');
        await expect(fillBtn).toBeVisible({ timeout: 5000 });
        await fillBtn.click();
        await expect(fillBtn).toHaveClass(/active/);
    });

    test('Tool-Wechsel Fill → Build: Build aktiv, Fill nicht mehr', async ({ page }) => {
        await startGame(page, 4);
        const buildBtn = page.locator('[data-tool="build"]');
        const fillBtn = page.locator('[data-tool="fill"]');
        await expect(fillBtn).toBeVisible({ timeout: 5000 });
        await fillBtn.click();
        await expect(fillBtn).toHaveClass(/active/);
        await buildBtn.click();
        await expect(buildBtn).toHaveClass(/active/);
        await expect(fillBtn).not.toHaveClass(/active/);
    });

    test('Alle drei Tool-Buttons sind im DOM vorhanden', async ({ page }) => {
        await startGame(page, 4);
        await expect(page.locator('[data-tool="build"]')).toBeVisible();
        await expect(page.locator('[data-tool="harvest"]')).toBeVisible();
        await expect(page.locator('[data-tool="fill"]')).toBeVisible();
    });

    test('Nur ein Tool aktiv gleichzeitig', async ({ page }) => {
        await startGame(page, 4);
        const harvestBtn = page.locator('[data-tool="harvest"]');
        await expect(harvestBtn).toBeVisible({ timeout: 5000 });
        await harvestBtn.click();
        const activeCount = await page.locator('[data-tool].active').count();
        expect(activeCount).toBe(1);
    });

});

// ── Block-Placement Counter ─────────────────────────────────────────────────

test.describe('Block-Placement Counter', () => {

    test('insel-blocks-placed steigt nach Canvas-Klick', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('insel-grid', '[]');
            localStorage.setItem('insel-genesis-shown', '1');
            localStorage.removeItem('insel-player-name');
            localStorage.setItem('insel-blocks-placed', '0');
        });
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
        await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });

        const before = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );
        await placeTaoBlock(page);
        const after = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );
        expect(after).toBeGreaterThan(before);
    });

    test('Drei Canvas-Klicks erhöhen Counter um mindestens 2', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('insel-grid', '[]');
            localStorage.setItem('insel-genesis-shown', '1');
            localStorage.removeItem('insel-player-name');
            localStorage.setItem('insel-blocks-placed', '0');
        });
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
        await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });

        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();
        await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4);
        await page.waitForTimeout(200);
        await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await page.waitForTimeout(200);
        await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.6);
        await page.waitForTimeout(300);

        const count = await page.evaluate(() =>
            parseInt(localStorage.getItem('insel-blocks-placed') || '0')
        );
        expect(count).toBeGreaterThanOrEqual(2);
    });

});

// ── Undo ────────────────────────────────────────────────────────────────────

test.describe('Undo', () => {

    test('Strg+Z nach Block-Klick: kein JS-Fehler', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await startGame(page);
        await placeTaoBlock(page);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(300);

        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404')
        );
        expect(fatal, `JS-Fehler nach Undo: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('Strg+Z ohne vorherigen Block: kein JS-Fehler', async ({ page }) => {
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
        expect(fatal, `JS-Fehler bei Undo ohne Block: ${fatal.join('\n')}`).toHaveLength(0);
    });

});

// ── Quest State ─────────────────────────────────────────────────────────────

test.describe('Quest State', () => {

    test('getActive() = [] bei frischem Spiel', async ({ page }) => {
        await startGame(page);
        const active = await page.evaluate(() => window.questSystem.getActive());
        expect(active).toEqual([]);
    });

    test('getCompleted() = [] bei frischem Spiel', async ({ page }) => {
        await startGame(page);
        const completed = await page.evaluate(() => window.questSystem.getCompleted());
        expect(completed).toEqual([]);
    });

    test('getCompleted() lädt pre-populated Quests aus localStorage', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('insel-grid', '[]');
            localStorage.setItem('insel-genesis-shown', '1');
            localStorage.removeItem('insel-player-name');
            localStorage.setItem('insel-quests-done', JSON.stringify(['Burger-Stand', 'Handelshafen']));
        });
        await page.goto('/');
        await page.fill('#player-name-input', 'Testpirat');
        await page.click('#start-button');
        await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
        await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });

        const completed = await page.evaluate(() => window.questSystem.getCompleted());
        expect(completed).toContain('Burger-Stand');
        expect(completed).toContain('Handelshafen');
    });

});

// ── Quest Accept + Persist ──────────────────────────────────────────────────

test.describe('Quest Accept + Persist', () => {

    test('Angenommene Quest hat npc + needs-Felder', async ({ page }) => {
        await startGame(page);
        const result = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return null;
            window.questSystem.accept(quest);
            return window.questSystem.getActive().find(q => q.npc === 'spongebob') || null;
        });
        expect(result).not.toBeNull();
        expect(result.npc).toBe('spongebob');
        expect(result.needs).toBeDefined();
        expect(typeof result.needs).toBe('object');
    });

    test('Angenommene Quest persistiert in localStorage', async ({ page }) => {
        await startGame(page);
        await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('krabs');
            if (quest) window.questSystem.accept(quest);
        });
        const stored = await page.evaluate(() =>
            JSON.parse(localStorage.getItem('insel-quests') || '[]')
        );
        expect(stored.length).toBeGreaterThan(0);
        expect(stored[0].npc).toBeDefined();
    });

    test('Angenommene Quest erscheint nicht mehr in getAvailable()', async ({ page }) => {
        // Ein NPC kann mehrere Quests haben. Nach accept() darf die
        // angenommene Quest nicht mehr via getAvailable() zurückkommen —
        // es darf aber die NÄCHSTE Quest desselben NPCs kommen.
        await startGame(page);
        const result = await page.evaluate(() => {
            const first = window.questSystem.getAvailable('elefant');
            if (!first) return { phase: 'no-first' };
            window.questSystem.accept(first);
            const second = window.questSystem.getAvailable('elefant');
            return { first, second };
        });
        if (result.phase === 'no-first') return; // kein Elefant-Quest-Pool
        // Zweite Quest darf null sein (Pool leer) ODER eine andere Quest
        if (result.second !== null) {
            expect(result.second.title).not.toBe(result.first.title);
        }
    });

    test('Quest-Title ist ein nicht-leerer String', async ({ page }) => {
        await startGame(page);
        const title = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('maus');
            return quest ? quest.title : null;
        });
        expect(title).not.toBeNull();
        expect(typeof title).toBe('string');
        expect(title.length).toBeGreaterThan(0);
    });

    test('getActive() gibt immer ein Array zurück', async ({ page }) => {
        await startGame(page);
        const active = await page.evaluate(() => window.questSystem.getActive());
        expect(Array.isArray(active)).toBe(true);
    });

});
