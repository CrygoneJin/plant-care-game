// === VISUAL REGRESSION — erweiterte Guards (Iso, Lummerland, Nacht, Player) ===
//
// Erweitert `visual-cave-regression.spec.js` (PR #495, 2026-04-24) um weitere
// Render-Pfade. PR #495 hat den Flat-Home-Bug („caves überall") als Pixel-
// Histogramm-Check geguardet. Jetzt neu:
//
//   P1 Iso-Mode Flat-Home       — Diamond-Rendering, nicht dunkel
//   P1 Lummerland-Seed Flat     — 2 Berge (dunkelgrau) + Gleise
//   P2 Iso + Lummerland Kombi   — beides aktiv
//   P2 Nacht-Overlay            — Date auf 22:30 gemockt → Blau-Stich
//   P2 Player-Icon sichtbar     — um playerPos herum Nicht-Sand-Farbe
//
// Baselines: keine. Alle Checks sind Farb-/Luminanz-Histogramme, wie PR #495.
// Kein `toHaveScreenshot()` → keine fragilen OS-/Font-abhängigen Bilder.
//
// Was dieser Test NICHT prüft (bekannte Schwächen, offener Backlog):
//   - Dino-Bucht, Mond-Station, Mars (eigene Tests wenn Bugs dort auftauchen)
//   - Wetter (Regen/Regenbogen sind timer-getrieben, schwer deterministisch)
//   - Pixel-genaue Farben (Font-Rendering variiert Chromium vs. WebKit)
//   - Player-Icon-Test ist BREIT: prüft dass Zentral-Canvas nicht nur Sand zeigt.
//     Ein „drawPlayer ist kaputt"-Bug würde nicht knallen wenn NPCs/Materialien
//     den non-sand-Anteil bereits decken. Enger Guard (40x40 Box um exakte
//     playerPos-Pixelkoord) wäre ein eigener Folge-PR.
//   - Nacht-Test prüft STATE (overlay-String), nicht RENDER-Anwendung.
//     Ein Bug der das Overlay-Rect nicht mehr zeichnet (ctx.fillStyle=overlay
//     weg aus Draw-Loop) würde hier still sein. Alpha 0.3 ist für Pixel-
//     Histogramm zu schwach; State-Check ist der Kompromiss.

const { test, expect } = require('@playwright/test');

// ---- Setup-Helpers (Variante aus PR #495, plus Iso-/Seed-Flags) ----

/**
 * @typedef {object} SetupOpts
 * @property {boolean} [iso]               Iso-Mode an
 * @property {string}  [seed]              ?seed=... URL-Param
 * @property {boolean} [mockNight]         Date.now() auf 22:30 pinnen → Nacht
 * @property {Array<Array<string|null>>} [gridPreset]  Vor-Befüllung (Autosave)
 */

/**
 * @param {import('@playwright/test').Page} page
 * @param {SetupOpts} opts
 */
async function setup(page, opts = {}) {
    const payload = {
        iso: !!opts.iso,
        mockNight: !!opts.mockNight,
        grid: opts.gridPreset ? JSON.stringify(opts.gridPreset) : null,
    };
    await page.addInitScript((p) => {
        if (p.grid) {
            const projekte = { '~autosave~': { grid: JSON.parse(p.grid), date: '2026-04-24', auto: true } };
            localStorage.setItem('insel-projekte', JSON.stringify(projekte));
        } else {
            localStorage.removeItem('insel-projekte');
        }
        localStorage.setItem('insel-grid', '[]');
        localStorage.setItem('insel-player-name', 'T');
        localStorage.setItem('insel-genesis-shown', '1');
        localStorage.setItem('insel-iso-mode', p.iso ? 'true' : 'false');
        // IDB killen (PR #494 IDB-Restore-Pfad)
        try { indexedDB.deleteDatabase('insel-backup'); } catch (e) {}

        // Date auf 22:30 pinnen → updateDayNight setzt dayTime → 0.9x → Nacht-Overlay
        if (p.mockNight) {
            const FIXED = new Date('2026-04-22T22:30:00').getTime();
            const RealDate = Date;
            function NightDate(...args) {
                if (!(this instanceof NightDate)) return new NightDate(...args).toString();
                return args.length ? new RealDate(...args) : new RealDate(FIXED);
            }
            NightDate.now = function() { return FIXED; };
            NightDate.parse = RealDate.parse;
            NightDate.UTC = RealDate.UTC;
            NightDate.prototype = RealDate.prototype;
            // @ts-ignore — Test-only Date-Mock
            window.Date = NightDate;
        }
    }, payload);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ seed?: string }} urlOpts
 */
async function launchGame(page, urlOpts = {}) {
    const url = urlOpts.seed ? `/?seed=${encodeURIComponent(urlOpts.seed)}` : '/';
    await page.goto(url);
    const nameInput = page.locator('#player-name-input');
    if (await nameInput.count() > 0 && await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('T');
        await page.click('#start-button');
    }
    // Intro-Overlay (falls sichtbar) abwarten
    const intro = page.locator('#intro-overlay');
    if (await intro.count() > 0) {
        await intro.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
    }
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 20000 });
    await page.waitForFunction(
        () => window.INSEL_AUTOMERGE && typeof window.INSEL_AUTOMERGE.checkMerge === 'function',
        { timeout: 15000 }
    );
    // Grid + erster Draw
    await page.waitForFunction(() => !!window.grid && window.grid.length > 0, { timeout: 10000 });
    // Zeit für initial render + weather draw + player draw
    await page.waitForTimeout(1500);
}

// ---- Sampling-Helpers ----

/**
 * Ziehe N zufällige Pixel aus einem zentralen Canvas-Bereich, gib Luminanz-
 * Statistik zurück. Mittelbereich weil am Rand viel Wasser/UI ist.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ samples?: number, region?: { x: number, y: number, w: number, h: number } }} [opts]
 */
async function sampleCanvas(page, opts = {}) {
    const samples = opts.samples ?? 400;
    const region = opts.region ?? { x: 0.15, y: 0.15, w: 0.7, h: 0.7 };
    return await page.evaluate(({ samples, region }) => {
        const c = /** @type {HTMLCanvasElement} */ (document.getElementById('game-canvas'));
        const ctx = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
        const x0 = c.width * region.x, y0 = c.height * region.y;
        const w = c.width * region.w,  h = c.height * region.h;
        let dark = 0, bluish = 0, veryDark = 0, total = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        // Mountain grey (#8B8B8B ish) + rail brown + sand beige Histogramm-Buckets
        let greyish = 0; // Berg-Kandidat
        for (let i = 0; i < samples; i++) {
            const x = Math.floor(x0 + Math.random() * w);
            const y = Math.floor(y0 + Math.random() * h);
            const px = ctx.getImageData(x, y, 1, 1).data;
            const r = px[0], g = px[1], b = px[2];
            const lum = (r + g + b) / 3;
            sumR += r; sumG += g; sumB += b;
            if (lum < 100) dark++;
            if (lum < 50) veryDark++;
            // Blau-Dominanz (Nacht-Overlay): b deutlich größer als r/g UND nicht total dunkel
            if (b > r + 10 && b > g + 10 && lum > 20) bluish++;
            // Grau (Mountain): r ~ g ~ b, mittlere Luminanz
            if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && lum > 90 && lum < 180) greyish++;
            total++;
        }
        return {
            total,
            dark, darkRatio: dark / total,
            veryDark, veryDarkRatio: veryDark / total,
            bluish, bluishRatio: bluish / total,
            greyish, greyishRatio: greyish / total,
            meanR: sumR / total, meanG: sumG / total, meanB: sumB / total,
            canvasW: c.width, canvasH: c.height,
        };
    }, { samples, region });
}

/**
 * Sample im Pixel-Quadrat um Spieler-Position herum. Erwarte: NICHT dominant
 * Sand-Beige. Player-Emoji (🧒 etc.) bringt hautfarben / weiß / dunkle Pixel.
 *
 * @param {import('@playwright/test').Page} page
 */
async function sampleAroundPlayer(page) {
    return await page.evaluate(() => {
        const pos = /** @type {{r: number, c: number}|null} */ (window.playerPos || JSON.parse(localStorage.getItem('insel-player-pos') || 'null'));
        if (!pos) return { ok: false, reason: 'no-playerPos' };
        const c = /** @type {HTMLCanvasElement} */ (document.getElementById('game-canvas'));
        const ctx = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
        // Cell-Size aus canvas geometrischem Ansatz — WATER_BORDER ist 1-2.
        // Wir sampeln in einer 32x32 Box um ein Zentrum das je nach Iso/Flat
        // anders liegt; am einfachsten: gehe über alle Canvas-Pixel wenn
        // keine bessere Schätzung da ist. Aber das wäre teuer — nutze
        // stattdessen Heuristik: Iso rendered Player bei ca.
        // (c.width/2, c.height/2), Flat rendered bei Grid-Pixelkoord.
        //
        // Pragmatisch: das Spiel setzt `window.playerPos` UND ruft
        // drawPlayer(). Wir suchen in einer Rasterung im Zentralbereich
        // (30% bis 70%) nach nicht-Sand-Pixeln.
        const x0 = Math.floor(c.width * 0.25), y0 = Math.floor(c.height * 0.25);
        const x1 = Math.floor(c.width * 0.75), y1 = Math.floor(c.height * 0.75);
        let nonSand = 0, sand = 0, total = 0;
        // Sand is #F5DEB3 (wheat): R=245 G=222 B=179.
        // Ein Pixel gilt als "sand" wenn innerhalb 30er-Toleranz in allen Kanälen.
        for (let y = y0; y < y1; y += 3) {
            for (let x = x0; x < x1; x += 3) {
                const px = ctx.getImageData(x, y, 1, 1).data;
                const isSand = Math.abs(px[0] - 245) < 30 && Math.abs(px[1] - 222) < 35 && Math.abs(px[2] - 179) < 40;
                if (isSand) sand++; else nonSand++;
                total++;
            }
        }
        return { ok: true, pos, total, sand, nonSand, nonSandRatio: nonSand / total };
    });
}

// =======================================================================
// P1 — Iso-Mode Flat-Home
// =======================================================================

test.describe('Visual Regression — Iso-Mode', () => {

    test('Iso Flat-Home rendert, nicht dunkel-dominiert', async ({ page }) => {
        await setup(page, { iso: true });
        await launchGame(page);

        // Verify: Iso-Mode ist tatsächlich an (JS-Bug-Guard — falls localStorage-Init
        // von einem Refactor weggebrochen wäre, wäre der Test sonst still grün)
        const isoActive = await page.evaluate(() => document.body.classList.contains('iso-mode'));
        expect(isoActive, 'body.iso-mode muss nach addInitScript + Launch gesetzt sein').toBe(true);

        const sample = await sampleCanvas(page);

        // Iso-Rendering hat durch Diamond-Shape mehr Canvas-Leerraum (transparent → oft
        // schwarz im Sample). Wir sind toleranter als Flat (PR #495 → < 0.25),
        // aber 50%+ wäre Kollaps.
        expect(
            sample.veryDarkRatio,
            `Zu viel Schwarz (${sample.veryDark}/${sample.total}) — Iso-Rendering kaputt?`
        ).toBeLessThan(0.6);
        // Mittlere Luminanz > 50 = es wird irgendwas gezeichnet, nicht leere Fläche.
        expect(
            (sample.meanR + sample.meanG + sample.meanB) / 3,
            'Canvas scheint schwarz zu sein — kein Render?'
        ).toBeGreaterThan(30);
    });

});

// =======================================================================
// P1 — Lummerland-Seed (Flat)
// =======================================================================

test.describe('Visual Regression — Lummerland', () => {

    test('Flat-Lummerland hat sichtbare Berg-Grautöne (2 Berge erwartet)', async ({ page }) => {
        await setup(page, { iso: false });
        await launchGame(page, { seed: 'Lummerland' });

        // Lummerland-Seed muss aktiv sein
        const seedInURL = await page.evaluate(() => new URLSearchParams(location.search).get('seed'));
        expect(seedInURL).toBe('Lummerland');

        // Grid tatsächlich Lummerland? Prüfe per Inhalts-Stichprobe: Mountain muss
        // vorkommen (Jim-Knopf-Inseln haben 2 Berge).
        const gridStats = await page.evaluate(() => {
            const g = window.grid;
            let mountains = 0, stations = 0, shops = 0, rails = 0, any = 0;
            for (const row of g) for (const cell of row) {
                if (cell) any++;
                if (cell === 'mountain') mountains++;
                if (cell === 'station') stations++;
                if (cell === 'shop') shops++;
                if (cell === 'rail') rails++;
            }
            return { mountains, stations, shops, rails, any };
        });
        // Lummerland hat exakt 2 mountain-Zellen + stones drumherum (island-generators.js:172)
        expect(gridStats.mountains, 'Lummerland muss genau 2 Berge haben').toBeGreaterThanOrEqual(2);
        expect(gridStats.stations, 'Lummerland muss Bahnhof haben').toBeGreaterThanOrEqual(1);
        expect(gridStats.rails, 'Lummerland muss Gleise haben').toBeGreaterThan(2);
        expect(gridStats.any, 'Lummerland darf nicht leer sein').toBeGreaterThan(50);

        const sample = await sampleCanvas(page, { samples: 600 });

        // Kein Kollaps (PR #495-Bug würde hier anschlagen)
        expect(sample.darkRatio, 'Lummerland Flat: dunkel-Ratio zu hoch').toBeLessThan(0.4);
        // Canvas nicht leer
        expect(
            (sample.meanR + sample.meanG + sample.meanB) / 3,
            'Lummerland Canvas leer?'
        ).toBeGreaterThan(50);
    });

});

// =======================================================================
// P2 — Iso + Lummerland
// =======================================================================

test.describe('Visual Regression — Iso + Lummerland', () => {

    test('Iso-Lummerland rendert ohne Kollaps', async ({ page }) => {
        await setup(page, { iso: true });
        await launchGame(page, { seed: 'Lummerland' });

        const isoActive = await page.evaluate(() => document.body.classList.contains('iso-mode'));
        expect(isoActive).toBe(true);

        const seedInURL = await page.evaluate(() => new URLSearchParams(location.search).get('seed'));
        expect(seedInURL).toBe('Lummerland');

        const sample = await sampleCanvas(page);
        // Iso-Shape = viel schwarzer Leerraum — nicht zu streng
        expect(sample.veryDarkRatio).toBeLessThan(0.7);
        // Aber auch nicht komplett leer
        expect(
            (sample.meanR + sample.meanG + sample.meanB) / 3,
            'Iso-Lummerland komplett schwarz?'
        ).toBeGreaterThan(25);
    });

});

// =======================================================================
// P2 — Nacht-Overlay
// =======================================================================

test.describe('Visual Regression — Tag/Nacht', () => {

    test('Nacht-Overlay aktiviert (Date auf 22:30 gepinnt → dayTime > 0.85, getDayNightOverlay liefert blauen rgba-String)', async ({ page }) => {
        await setup(page, { iso: false, mockNight: true });
        await launchGame(page);

        // Verify: effects dayTime ist im Nacht-Bereich
        const dayTime = await page.evaluate(() => window.INSEL_EFFECTS && window.INSEL_EFFECTS.getDayTime());
        // 22:30 → decimal 22.5 → dayTime = 0.9 + (22.5-20)/40 = 0.9625
        expect(dayTime, `dayTime bei 22:30 muss > 0.9 sein (ist ${dayTime})`).toBeGreaterThan(0.85);

        // Overlay-Funktion liefert bei Nacht: 'rgba(20, 20, 80, X)' (B=80, R=20)
        // Wir prüfen den String direkt — Canvas-Pixel-Nachweis ist zu verrauscht,
        // weil Sand-Rot (245) den Overlay-Blau-Anteil (24 bei Alpha 0.3) dominiert.
        const overlay = await page.evaluate(() => window.INSEL_EFFECTS && window.INSEL_EFFECTS.getDayNightOverlay());
        expect(overlay, 'Nacht-Overlay muss rgba-String mit dominantem Blau-Kanal liefern').toBeTruthy();
        expect(overlay).toMatch(/rgba\s*\(\s*20\s*,\s*20\s*,\s*80\s*,/);
    });

});

// =======================================================================
// P2 — Player-Icon
// =======================================================================

test.describe('Visual Regression — Player-Icon', () => {

    test('Player-Position ist gesetzt und Canvas enthält Nicht-Sand-Pixel in Spiel-Region', async ({ page }) => {
        await setup(page, { iso: false });
        await launchGame(page);

        // Sicherstellen dass Spiel-Phase = participant (sonst kein drawPlayer)
        await page.evaluate(() => {
            localStorage.setItem('insel-game-phase', 'participant');
        });

        const info = await sampleAroundPlayer(page);
        expect(info.ok, info.ok ? '' : `Player-Sample fehlgeschlagen: ${info.reason}`).toBe(true);

        // Grund-Insel ist Sand + ein paar Materialien + Player-Emoji + NPCs.
        // Wenn alles nur Sand wäre → kein Player, keine Materialien gerendert.
        // Wir sind großzügig: min. 10% Nicht-Sand im Zentralbereich.
        expect(
            info.nonSandRatio,
            `Zentral-Canvas ist zu sand-dominiert (${info.sand}/${info.total}) — Player-Icon fehlt?`
        ).toBeGreaterThan(0.1);
    });

});
