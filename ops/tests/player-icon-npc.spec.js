// Oscar-Feedback: Spieler-Icon + NPC-Chat bei Seed-Start.
// Tesla-Morgenritual: ?seed=Lummerland muss sofort fertig sein.
// 1. Avatar sichtbar auf saubere Spawn-Zelle (nicht auf Bahnhof).
// 2. NPC-Klick öffnet Chat ohne Proximity/Kollision.
const { test, expect } = require('@playwright/test');

// Fresh-Load mit ?seed=Lummerland, BigBang überspringen, Start-Button klicken
async function startLummerland(page) {
    await page.addInitScript(() => {
        localStorage.clear();
        // BigBang-Countdown überspringen — Flag setzen das finishIntro direkt fährt
        localStorage.setItem('insel-genesis-shown', '1');
    });
    await page.goto('/?seed=Lummerland');
    // Auf Start-Button warten und klicken (Oscar ohne Namen)
    await page.locator('#start-button').click();
    // Warten bis Intro weg ist — BigBang-Countdown dauert ~3s
    await expect(page.locator('#intro-overlay')).not.toBeVisible({ timeout: 20000 });
    await page.waitForFunction(() => window.grid && window.grid.length > 0, { timeout: 10000 });
    // Kurz warten damit ensureSafePlayerSpawn + initNpcPositions fertig sind
    await page.waitForTimeout(500);
}

test.describe('Oscar-Fix — Spieler-Icon bei ?seed=Lummerland', () => {

    test('Spieler hat einen Default-Namen', async ({ page }) => {
        await startLummerland(page);
        const name = await page.evaluate(() => localStorage.getItem('insel-player-name'));
        expect(name, 'playerName muss gesetzt sein').toBeTruthy();
        // Default ist 'Spieler' oder 'du' — beides OK, Hauptsache nicht leer
        expect(['Spieler', 'du']).toContain(name);
    });

    test('gamePhase ist participant nach Intro', async ({ page }) => {
        await startLummerland(page);
        const phase = await page.evaluate(() => localStorage.getItem('insel-game-phase'));
        expect(phase, 'Ohne participant-Phase wird Avatar nicht gezeichnet').toBe('participant');
    });

    test('Spieler-Position ist begehbar, nicht auf Bahnhof/Berg/Wasser', async ({ page }) => {
        await startLummerland(page);
        // Wir warten aktiv bis playerPos im LS geschrieben wurde oder
        // die Welt fertig ist. ensureSafePlayerSpawn läuft im Init-Block.
        await page.waitForFunction(() => !!window.grid && window.grid.length > 0, { timeout: 5000 });
        const info = await page.evaluate(() => {
            const pos = JSON.parse(localStorage.getItem('insel-player-pos') || 'null');
            const grid = window.grid;
            return {
                pos,
                hasGrid: !!grid,
                cell: pos && grid ? (grid[pos.r]?.[pos.c] ?? null) : 'no-grid-or-pos',
            };
        });
        expect(info.hasGrid, 'Grid muss geladen sein').toBe(true);
        expect(info.pos, 'playerPos muss gesetzt sein nach Safe-Spawn-Fix').not.toBeNull();
        const BLOCKED = ['station', 'shop', 'train', 'rail', 'mountain', 'stone', 'castle', 'cave', 'ocean', 'water', 'lava'];
        expect(BLOCKED, `Spieler-Spawn auf ${info.cell} ist nicht begehbar (pos=${JSON.stringify(info.pos)})`).not.toContain(info.cell);
    });

});

test.describe('Oscar-Fix — NPC-Klick öffnet Chat', () => {

    test('showNpcQuestDialog öffnet Chat-Panel', async ({ page }) => {
        await startLummerland(page);
        // Chat muss geschlossen sein zu Beginn
        const initiallyHidden = await page.evaluate(() =>
            document.getElementById('chat-panel')?.classList.contains('hidden'));
        expect(initiallyHidden, 'Chat startet geschlossen').toBe(true);

        // Sicherstellen dass openChat und _showNpcQuestDialog verfügbar sind
        await page.waitForFunction(() =>
            typeof window.openChat === 'function' &&
            typeof window._showNpcQuestDialog === 'function',
            { timeout: 10000 }
        );

        // SpongeBob via Window-API antippen (simuliert Canvas-Touch auf NPC-Zelle)
        await page.evaluate(() => { window._showNpcQuestDialog('spongebob'); });

        // Max. 5s warten bis Chat öffnet (setTimeout 400ms oder 3200ms bei sessionGreeting + Buffer)
        await page.waitForFunction(
            () => !document.getElementById('chat-panel')?.classList.contains('hidden'),
            { timeout: 5000 }
        );

        const chatNpc = await page.evaluate(() =>
            document.getElementById('chat-character')?.value);
        expect(chatNpc, 'Chat muss auf SpongeBob wechseln').toBe('spongebob');
    });

});
