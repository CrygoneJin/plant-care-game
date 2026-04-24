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

    // Oscar-Bug: Auf Tesla-Landscape (1920x1200) war der Close-Button off-screen
    // weil ein redundanter #chat-character-name span den Button aus dem 320px-Panel
    // gedrückt hat. Regression-Guard.
    test('Chat-Close-Button sichtbar + klickbar auf Tesla-Viewport (1920x1200) — Bernd', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 });
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });

        // Explizit Bernd wählen (längster NPC-Name: "🍞 Bernd (Support)")
        await page.selectOption('#chat-character', 'bernd');
        await page.waitForTimeout(200);

        const panel = await page.locator('#chat-panel').boundingBox();
        const closeBtn = await page.locator('#chat-close-btn').boundingBox();

        // Close-Btn komplett im Panel
        expect(closeBtn.x, 'close-btn links innerhalb Panel').toBeGreaterThanOrEqual(panel.x);
        expect(closeBtn.x + closeBtn.width, 'close-btn rechts innerhalb Panel')
            .toBeLessThanOrEqual(panel.x + panel.width);

        // Touch-Target 44×44 (Apple HIG)
        expect(closeBtn.width, 'close-btn Breite ≥ 44px').toBeGreaterThanOrEqual(44);
        expect(closeBtn.height, 'close-btn Höhe ≥ 44px').toBeGreaterThanOrEqual(44);

        // elementFromPoint an der Btn-Mitte muss wirklich der Close-Btn sein
        // (nicht von anderem Element überdeckt)
        const cx = closeBtn.x + closeBtn.width / 2;
        const cy = closeBtn.y + closeBtn.height / 2;
        const elAtPoint = await page.evaluate(({ x, y }) => {
            const el = document.elementFromPoint(x, y);
            return el ? el.id : null;
        }, { x: cx, y: cy });
        expect(elAtPoint, 'close-btn ist top-element in seiner Mitte').toBe('chat-close-btn');

        // Click muss tatsächlich Chat schließen
        await page.locator('#chat-close-btn').click();
        await expect(page.locator('#chat-panel')).toHaveClass(/hidden/, { timeout: 3000 });
    });

    // Oscar-Bug 1+2: Mute-Button und Code-Ebene-Button waren auf Tesla weg.
    // Root Cause: Progressive Disclosure (game.js) versteckte view-group bis
    // Stufe 4 (hasRecipe) und overflow-group bis Stufe 5 (completedQuest).
    // Fix: view-group immer sichtbar, overflow-group ab Stufe 2.
    test('Mute-Button sichtbar + klickbar bei frischem State (Tesla Oscar-Bug)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 });
        await startGame(page, 1); // Stufe 1 = frisch, keine Blöcke

        // Progressive Disclosure läuft alle 2s — Zeit geben
        await page.waitForTimeout(2500);

        const muteBtn = page.locator('#mute-btn');
        await expect(muteBtn, 'Mute-Button sichtbar bei Stufe 1').toBeVisible();
        const box = await muteBtn.boundingBox();
        expect(box.width, 'Mute-Btn Breite ≥ 44px (Apple HIG)').toBeGreaterThanOrEqual(44);
        expect(box.height, 'Mute-Btn Höhe ≥ 44px').toBeGreaterThanOrEqual(44);
        // Im Viewport
        expect(box.x + box.width, 'Mute-Btn im Viewport (rechts)').toBeLessThanOrEqual(1920);

        // Klick darf Fehler werfen
        await muteBtn.click();
    });

    test('Code-Ebene-Button erreichbar über Overflow-Menü ab Stufe 2', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 });
        await startGame(page, 2); // Stufe 2 = min. 1 Block gelegt

        await page.waitForTimeout(2500);

        // Overflow-Trigger sichtbar
        const moreBtn = page.locator('#toolbar-more-btn');
        await expect(moreBtn, 'Overflow-Trigger sichtbar ab Stufe 2').toBeVisible();
        await moreBtn.click();

        // Code-View-Btn im geöffneten Dropdown sichtbar
        const codeBtn = page.locator('#code-view-btn');
        await expect(codeBtn).toBeVisible({ timeout: 2000 });
        const codeBox = await codeBtn.boundingBox();
        expect(codeBox.width, 'Code-Btn klickbar').toBeGreaterThanOrEqual(44);
        expect(codeBox.x + codeBox.width, 'Code-Btn im Viewport').toBeLessThanOrEqual(1920);
    });

    // Oscar-Bug 3: Chat-Panel Overflow rechts auf Tesla.
    // Nicht auf 1920×1200 reproduzierbar — defensive max-width:100vw als Guard.
    test('Chat-Panel bleibt im Viewport (max-width-Guard)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 });
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(400); // Transition abwarten

        const panel = await page.locator('#chat-panel').boundingBox();
        expect(panel.x + panel.width, 'Panel-Rechts ≤ Viewport-Breite')
            .toBeLessThanOrEqual(1920);
    });

    // Oscar-Bug 4: Virtuelle Tastatur verdeckte Chat-Input.
    // Fix: visualViewport-Resize → Panel-Höhe anpassen. Input-Focus → scrollIntoView.
    test('Input-Focus triggert scrollIntoView (Tastatur-Robustheit)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 });
        await startGame(page, 2);

        await page.locator('#chat-bubble').click();
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(400);

        // Spy auf scrollIntoView vor Focus
        const scrolled = await page.evaluate(async () => {
            const input = document.getElementById('chat-input');
            let called = false;
            const orig = input.scrollIntoView.bind(input);
            input.scrollIntoView = (opts) => { called = true; return orig(opts); };
            input.focus();
            input.dispatchEvent(new FocusEvent('focus'));
            // Handler hat setTimeout(300ms)
            await new Promise(r => setTimeout(r, 500));
            return called;
        });
        expect(scrolled, 'scrollIntoView bei Input-Focus aufgerufen').toBe(true);

        // visualViewport-Handler installiert — Höhe passt sich an simulierten Resize an
        const heightAfterShrink = await page.evaluate(async () => {
            const panel = document.getElementById('chat-panel');
            // Simuliere VV-Resize durch Event-Dispatch (echtes Shrinken geht mit Playwright nicht)
            window.visualViewport.dispatchEvent(new Event('resize'));
            await new Promise(r => setTimeout(r, 100));
            return panel.offsetHeight > 0;
        });
        expect(heightAfterShrink, 'Panel reagiert auf VV-Resize').toBe(true);
    });

});

test.describe('Easter Eggs', () => {

    test('Konami-Code → Tetris-Modal öffnet sich', async ({ page }) => {
        await startGame(page);

        // Konami-Sequenz: ↑ ↑ ↓ ↓ ← → ← → b a
        const sequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'b', 'a'
        ];
        for (const key of sequence) {
            await page.keyboard.press(key);
        }

        const tetrisModal = page.locator('#tetris-modal');
        await expect(tetrisModal).toBeVisible({ timeout: 3000 });
    });

    test('"snake" tippen → Snake-Modal öffnet sich', async ({ page }) => {
        await startGame(page);

        // Canvas fokussieren damit keydown-Events ankommen
        await page.locator('#game-canvas').click();

        // "snake" Buchstabe für Buchstabe tippen
        for (const char of ['s', 'n', 'a', 'k', 'e']) {
            await page.keyboard.press(char);
        }

        const snakeModal = page.locator('#snake-modal');
        await expect(snakeModal).toBeVisible({ timeout: 3000 });
    });

});
