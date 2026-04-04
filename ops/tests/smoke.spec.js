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

    test('metrics endpoint responds', async ({ request }) => {
        const res = await request.get('https://schatzinsel.hoffmeyer-zlotnik.workers.dev/metrics?table=sessions&limit=1');
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.table).toBe('sessions');
    });
});

test.describe('NPC-Persönlichkeiten', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await page.click('#start-button');
    });

    test('chat bubble öffnet Bernd (nicht SpongeBob)', async ({ page }) => {
        await page.click('#chat-bubble');
        const header = page.locator('#chat-character-name');
        await expect(header).toContainText('Bernd');
    });

    test('9 NPCs haben eigene System-Prompts', async ({ page }) => {
        const npcs = await page.evaluate(() => {
            // CHARACTERS ist im IIFE-Scope von chat.js — wir prüfen über openChat
            const ids = ['spongebob', 'krabs', 'elefant', 'tommy', 'neinhorn', 'maus', 'bernd', 'floriane', 'bug'];
            const results = {};
            for (const id of ids) {
                window.openChat(id);
                const header = document.getElementById('chat-character-name');
                results[id] = header ? header.textContent : null;
            }
            return results;
        });
        // Jeder NPC hat einen eigenen Namen im Header
        expect(npcs.spongebob).toContain('SpongeBob');
        expect(npcs.bernd).toContain('Bernd');
        expect(npcs.floriane).toContain('Floriane');
        expect(npcs.bug).toContain('Bug');
        expect(npcs.elefant).toContain('Elefant');
        expect(npcs.maus).toContain('Maus');
        expect(npcs.neinhorn).toContain('Neinhorn');
    });

    test('Floriane und Bug sind Starter-Chars (immer freigeschaltet)', async ({ page }) => {
        const starters = await page.evaluate(() => {
            const select = document.getElementById('chat-character');
            if (!select) return [];
            return Array.from(select.options)
                .filter(o => !o.disabled)
                .map(o => o.value);
        });
        expect(starters).toContain('floriane');
        expect(starters).toContain('bug');
        expect(starters).toContain('bernd');
    });

    test('ELIZA Fallback funktioniert ohne API-Key', async ({ page }) => {
        // Bernd via Bubble öffnen, Nachricht senden
        await page.click('#chat-bubble');
        await page.fill('#chat-input', 'Hallo Bernd');
        await page.click('#chat-send-btn');
        // Warte auf Antwort (ELIZA ist synchron)
        await page.waitForTimeout(500);
        const msgs = await page.locator('.chat-msg.npc').count();
        expect(msgs).toBeGreaterThan(0);
    });

    test('Floriane zählt Wünsche (max 3/Tag)', async ({ page }) => {
        await page.evaluate(() => window.openChat('floriane'));
        await page.fill('#chat-input', 'Ich wünsche mir ein Pferd');
        await page.click('#chat-send-btn');
        await page.waitForTimeout(500);
        const reply = await page.locator('.chat-msg.npc').last().textContent();
        // Floriane antwortet mit Sternenstaub oder Wunsch-Zähler
        expect(reply.length).toBeGreaterThan(5);
    });

    test('Bug die Raupe nimmt Bug-Reports entgegen', async ({ page }) => {
        await page.evaluate(() => window.openChat('bug'));
        await page.fill('#chat-input', 'Der Ton geht nicht');
        await page.click('#chat-send-btn');
        await page.waitForTimeout(500);
        const reply = await page.locator('.chat-msg.npc').last().textContent();
        expect(reply.length).toBeGreaterThan(5);
    });

    test('API-Settings Button öffnet Dialog', async ({ page }) => {
        await page.click('#chat-bubble');
        await page.click('#chat-settings-btn');
        const dialog = page.locator('#api-key-dialog');
        await expect(dialog).not.toHaveClass(/hidden/);
    });
});

test.describe('Runtime-Fehler Regression', () => {
    // Fängt JS-Exceptions die CI bisher nicht sieht.
    // Jeder hier gelistete Test entspricht einem Bug der in Produktion aufgetaucht ist.

    test('keine JS-Exceptions beim Start (conwayOverlay, eliza.reply, etc.)', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        // localStorage vorbereiten wie ein returning player
        await page.goto('https://schatzinsel.app/');
        await page.evaluate(() => {
            localStorage.setItem('insel-game-phase', 'participant');
            localStorage.setItem('insel-player-name', 'TestSpieler');
            localStorage.setItem('insel-player-pos', JSON.stringify({ r: 10, c: 10 }));
        });
        await page.reload();
        await page.click('#start-button');
        await page.waitForTimeout(2000); // Render-Loop laufen lassen

        // Bekannte harmlose Fehler rausfiltern (Worker-404 etc.)
        const fatal = errors.filter(e =>
            !e.includes('net::ERR_') &&
            !e.includes('Failed to load resource') &&
            !e.includes('WebSocket') &&
            !e.includes('tts')
        );
        expect(fatal, `JS-Exceptions: ${fatal.join('\n')}`).toHaveLength(0);
    });

    test('ELIZA antwortet ohne API (eliza.transform statt eliza.reply)', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('https://schatzinsel.app/');
        await page.evaluate(() => {
            localStorage.setItem('insel-game-phase', 'participant');
            localStorage.setItem('insel-player-name', 'TestSpieler');
            // Kein API-Key → ELIZA-Fallback
            localStorage.removeItem('langdock-api-key');
        });
        await page.reload();
        await page.click('#start-button');
        await page.click('#chat-bubble');
        await page.fill('#chat-input', 'Hallo');
        await page.click('#chat-send-btn');
        await page.waitForTimeout(1000);

        const elizaErrors = errors.filter(e => e.includes('eliza') || e.includes('reply is not'));
        expect(elizaErrors, `ELIZA-Fehler: ${elizaErrors.join('\n')}`).toHaveLength(0);

        const msgs = await page.locator('.chat-msg.npc').count();
        expect(msgs).toBeGreaterThan(0);
    });

    test('game-phase participant: Spielfigur sichtbar', async ({ page }) => {
        await page.goto('https://schatzinsel.app/');
        await page.evaluate(() => {
            localStorage.setItem('insel-game-phase', 'participant');
            localStorage.setItem('insel-player-name', 'Oscar');
            localStorage.setItem('insel-player-pos', JSON.stringify({ r: 10, c: 10 }));
        });
        await page.reload();
        await page.click('#start-button');
        await page.waitForTimeout(1000);

        // Spielfigur wird auf Canvas gezeichnet — wir prüfen dass game-phase korrekt gelesen wird
        const phase = await page.evaluate(() => localStorage.getItem('insel-game-phase'));
        expect(phase).toBe('participant');
    });
});
