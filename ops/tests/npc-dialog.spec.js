const { test, expect } = require('@playwright/test');

async function startGameWithChat(page) {
    await page.addInitScript(() => {
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.removeItem('insel-player-name');
        localStorage.setItem('insel-blocks-placed', '5');
        localStorage.setItem('insel-unlocked-materials', '["qi","feuer","wasser","erde","holz"]');
        localStorage.setItem('insel-discovered-recipes', '["qi"]');
        localStorage.setItem('insel-quests-done', '["Seed-Quest"]');
        localStorage.setItem('insel-chat-consent', 'yes');
        localStorage.removeItem('langdock-api-key');
    });

    await page.route('**/schatzinsel.hoffmeyer-zlotnik.workers.dev/**', route => route.abort());

    await page.goto('/');
    await page.fill('#player-name-input', 'Testpirat');
    await page.click('#start-button');
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.waitForFunction(() => typeof window.questSystem === 'object', { timeout: 10000 });
}

test.describe('NPC-Dialog — openChat API', () => {

    test('window.openChat("spongebob") öffnet Panel und setzt _lastChatNpcId', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('spongebob'));

        const panel = page.locator('#chat-panel');
        await expect(panel).toBeVisible({ timeout: 3000 });
        await expect(panel).not.toHaveClass(/hidden/);

        const lastId = await page.evaluate(() => window._lastChatNpcId);
        expect(lastId, '_lastChatNpcId muss "spongebob" sein').toBe('spongebob');
    });

    test('Chat-Header zeigt NPC-Name nach openChat', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('bernd'));

        const header = page.locator('#chat-character-name');
        await expect(header).toBeVisible({ timeout: 3000 });
        const text = await header.textContent();
        expect(text, 'Header muss Bernd-Name enthalten').toContain('Bernd');
    });

    test('Greeting-Nachricht erscheint im chat-messages nach openChat', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('maus'));

        const messages = page.locator('#chat-messages');
        await expect(messages).toBeVisible({ timeout: 3000 });
        await expect(messages.locator('.chat-msg.system')).toContainText('ist da!', { timeout: 3000 });
    });

});

test.describe('NPC-Dialog — NPC-Wechsel', () => {

    test('openChat mit neuem NPC zeigt aktualisierten Header', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('spongebob'));
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 3000 });

        await page.evaluate(() => window.openChat('bernd'));

        const header = page.locator('#chat-character-name');
        const text = await header.textContent();
        expect(text, 'Header muss nach Wechsel Bernd zeigen').toContain('Bernd');

        const lastId = await page.evaluate(() => window._lastChatNpcId);
        expect(lastId, '_lastChatNpcId muss nach Wechsel "bernd" sein').toBe('bernd');
    });

    test('Nach NPC-Wechsel erscheint Greeting des neuen NPC', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('spongebob'));
        await page.evaluate(() => window.openChat('elefant'));

        const messages = page.locator('#chat-messages');
        await expect(messages.locator('.chat-msg.system').last()).toContainText('ist da!', { timeout: 3000 });

        const lastSystem = await messages.locator('.chat-msg.system').last().textContent();
        expect(lastSystem, 'Greeting muss Elefant-Emoji enthalten').toContain('🐘');
    });

});

test.describe('NPC-Dialog — Nachricht senden', () => {

    test('User-Nachricht erscheint sofort im DOM nach Send-Klick', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('bernd'));
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 3000 });

        const input = page.locator('#chat-input');
        await input.fill('Hallo Bernd!');
        await page.locator('#chat-send-btn').click();

        await expect(page.locator('#chat-messages .chat-msg.user')).toContainText('Hallo Bernd!', { timeout: 3000 });
    });

    test('NPC antwortet via ELIZA wenn Proxy geblockt', async ({ page }) => {
        await startGameWithChat(page);

        await page.evaluate(() => window.openChat('spongebob'));
        await expect(page.locator('#chat-panel')).toBeVisible({ timeout: 3000 });

        await page.locator('#chat-input').fill('Hallo!');
        await page.locator('#chat-send-btn').click();

        const npcMsg = page.locator('#chat-messages .chat-msg.npc');
        await expect(npcMsg).toBeVisible({ timeout: 8000 });

        const text = await npcMsg.first().textContent();
        expect(text, 'NPC-Antwort muss SpongeBob-Emoji enthalten').toContain('🧽');
    });

});

test.describe('NPC-Dialog — INSEL_CHARACTERS', () => {

    test('window.INSEL_CHARACTERS hat alle 10 Kern-NPCs mit emoji und name', async ({ page }) => {
        await startGameWithChat(page);

        const result = await page.evaluate(() => {
            const chars = window.INSEL_CHARACTERS;
            if (!chars) return { error: 'window.INSEL_CHARACTERS fehlt' };

            const expected = ['spongebob', 'maus', 'elefant', 'neinhorn', 'krabs',
                'tommy', 'bernd', 'floriane', 'mephisto', 'bug'];
            const missing = expected.filter(id => !chars[id]);
            const noEmoji = expected.filter(id => chars[id] && !chars[id].emoji);
            const noName  = expected.filter(id => chars[id] && !chars[id].name);

            return { missing, noEmoji, noName };
        });

        expect(result.error, result.error).toBeUndefined();
        expect(result.missing, `NPCs fehlen: ${result.missing}`).toHaveLength(0);
        expect(result.noEmoji, `NPCs ohne emoji: ${result.noEmoji}`).toHaveLength(0);
        expect(result.noName,  `NPCs ohne name: ${result.noName}`).toHaveLength(0);
    });

    test('window.INSEL_ELIZA ist geladen und kann NPC-Antwort produzieren', async ({ page }) => {
        await startGameWithChat(page);

        const result = await page.evaluate(() => {
            if (!window.INSEL_ELIZA) return { error: 'window.INSEL_ELIZA fehlt' };
            const eliza = window.INSEL_ELIZA.getEliza('bernd');
            if (!eliza) return { error: 'getEliza("bernd") gibt null zurück' };
            const response = eliza.transform('Hallo');
            if (!response || !response.reply) return { error: 'ELIZA gibt keine Antwort auf "Hallo"' };
            return { reply: response.reply };
        });

        expect(result.error, result.error).toBeUndefined();
        expect(result.reply, 'ELIZA-Antwort darf nicht leer sein').toBeTruthy();
        expect(typeof result.reply, 'ELIZA-Antwort muss ein String sein').toBe('string');
    });

});
