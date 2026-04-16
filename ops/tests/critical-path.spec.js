const { test, expect } = require('@playwright/test');

// Hilfsfunktion: Big-Bang-Countdown überspringen + Genesis-Start setzen
// stufe bestimmt den Progressions-State (default 1 = Erstbesuch)
async function skipBigBang(page, stufe = 1) {
    await page.addInitScript((s) => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1'); // water-start überspringen
        localStorage.removeItem('insel-player-name');
        // Progressive Disclosure braucht passenden State
        if (s >= 2) localStorage.setItem('insel-blocks-placed', '5');
        if (s >= 3) localStorage.setItem('insel-unlocked-materials', '["qi","feuer","wasser","erde","holz"]');
        if (s >= 4) localStorage.setItem('insel-discovered-recipes', '["qi"]');
        if (s >= 5) localStorage.setItem('insel-quests-done', '["Seed-Quest"]');
    }, stufe);
}

// Hilfsfunktion: Spiel starten und auf Canvas + questSystem warten
async function startGame(page, stufe = 1) {
    await skipBigBang(page, stufe);
    await page.goto('/');
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    // Canvas sichtbar warten
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    // Intro-Overlay vollständig weg (300ms fade + Puffer)
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    // questSystem muss initialisiert sein
    await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });
}

test.describe('Critical Path — Block platzieren', () => {

    test('Tao-Button aktiv, Canvas reagiert auf Klick ohne Fehler', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await startGame(page);

        // Tao ist das erste sichtbare Material — kein Inventar nötig
        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        // Canvas-Mitte klicken
        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();

        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

        // Kurz warten damit Events verarbeitet werden
        await page.waitForTimeout(500);

        // Kein fataler JS-Fehler
        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts') &&
            !e.includes('404') &&
            !e.includes("Cannot read properties of undefined (reading 'length')") &&
            !e.includes("Cannot read properties of undefined (reading 'F')")
        );
        expect(fatal, `JS-Fehler nach Block-Klick: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('block:placed Event wird nach Canvas-Klick gefeuert', async ({ page }) => {
        await startGame(page);

        // BUS-Event abhören bevor Klick
        await page.evaluate(() => {
            window._testBlockPlaced = false;
            window.INSEL_BUS.on('block:placed', () => { window._testBlockPlaced = true; });
        });

        // Tao auswählen und Canvas-Mitte klicken
        const taoBtn = page.locator('.material-btn[data-material="tao"]');
        await expect(taoBtn).toBeVisible({ timeout: 5000 });
        await taoBtn.click();

        const canvas = page.locator('#game-canvas');
        const box = await canvas.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);

        const placed = await page.evaluate(() => window._testBlockPlaced);
        expect(placed, 'block:placed Event muss nach Canvas-Klick kommen').toBe(true);
    });

});

test.describe('Critical Path — Quest annehmen', () => {

    test('questSystem ist nach Spielstart verfügbar', async ({ page }) => {
        await startGame(page);

        const hasQuestSystem = await page.evaluate(() => {
            return typeof window.questSystem === 'object' &&
                typeof window.questSystem.accept === 'function' &&
                typeof window.questSystem.getAvailable === 'function' &&
                typeof window.questSystem.getActive === 'function';
        });
        expect(hasQuestSystem, 'window.questSystem fehlt oder unvollständig').toBe(true);
    });

    test('Quest annehmen via API → erscheint in getActive()', async ({ page }) => {
        await startGame(page);

        const result = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return { error: 'Keine Quest für spongebob gefunden' };
            window.questSystem.accept(quest);
            const active = window.questSystem.getActive();
            return {
                accepted: active.some(q => q.title === quest.title),
                questTitle: quest.title
            };
        });

        expect(result.error, result.error).toBeUndefined();
        expect(result.accepted, `Quest "${result.questTitle}" nicht in getActive()`).toBe(true);
    });

    test('Angenommene Quest erscheint im Quest-Panel DOM', async ({ page }) => {
        await startGame(page, 5);

        // Quest via API annehmen
        const questTitle = await page.evaluate(() => {
            const quest = window.questSystem.getAvailable('spongebob');
            if (!quest) return null;
            window.questSystem.accept(quest);
            return quest.title;
        });

        expect(questTitle, 'Keine Quest für spongebob verfügbar').not.toBeNull();

        // Quest-Panel-Tab öffnen
        await page.locator('.sidebar-tab[data-tab="quests"]').click();
        await page.waitForTimeout(300);

        const questPanel = page.locator('#quest-list');
        await expect(questPanel).toContainText(questTitle, { timeout: 3000 });
    });

});

test.describe('Critical Path — NPC-Chat', () => {

    test('Chat-Bubble öffnet Chat-Panel', async ({ page }) => {
        await startGame(page, 2);

        const chatBubble = page.locator('#chat-bubble');
        await expect(chatBubble).toBeVisible({ timeout: 5000 });
        await chatBubble.click();

        const chatPanel = page.locator('#chat-panel');
        await expect(chatPanel).not.toHaveClass(/hidden/, { timeout: 3000 });
        await expect(chatPanel).toBeVisible();
    });

    test('Chat-Input ist beschreibbar und Send-Button ist aktiv', async ({ page }) => {
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });

        const input = page.locator('#chat-input');
        await expect(input).toBeVisible();
        await expect(input).toBeEditable();

        await input.fill('Hallo SpongeBob!');
        await expect(input).toHaveValue('Hallo SpongeBob!');

        const sendBtn = page.locator('#chat-send-btn');
        await expect(sendBtn).toBeVisible();
        await expect(sendBtn).toBeEnabled();
    });

    test('Chat-Charakter-Auswahl hat NPCs', async ({ page }) => {
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });

        const charSelect = page.locator('#chat-character');
        await expect(charSelect).toBeVisible();

        const optionCount = await charSelect.locator('option').count();
        expect(optionCount, 'Chat braucht mindestens einen NPC').toBeGreaterThan(0);
    });

    test('Chat schließen via X-Button', async ({ page }) => {
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });

        await page.locator('#chat-close-btn').click();
        await expect(page.locator('#chat-panel')).toHaveClass(/hidden/, { timeout: 3000 });
    });

});
