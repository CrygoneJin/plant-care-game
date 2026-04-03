const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function createBrowserContext() {
    return {
        window: {},
        document: { getElementById: () => null },
        localStorage: { getItem: () => null, setItem: () => {} },
        console, setTimeout, Date, Math, JSON, Map, Set, Array, Object, String, Number,
        Error, TypeError, parseInt, parseFloat, isNaN, isFinite, undefined,
        RegExp,
    };
}

function loadAll(ctx) {
    ctx.window = ctx;
    const elizaCode = fs.readFileSync(path.join(SRC, 'world/eliza.js'), 'utf-8');
    vm.runInNewContext(elizaCode, ctx, { filename: 'eliza.js' });
    const scriptsCode = fs.readFileSync(path.join(SRC, 'world/eliza-scripts.js'), 'utf-8');
    vm.runInNewContext(scriptsCode, ctx, { filename: 'eliza-scripts.js' });
    return ctx.INSEL_ELIZA;
}

describe('ELIZA Kern', () => {
    let eliza;
    let ctx;

    beforeEach(() => {
        ctx = createBrowserContext();
        eliza = loadAll(ctx);
    });

    it('exportiert create, register, getEliza, reflect', () => {
        assert.equal(typeof eliza.create, 'function');
        assert.equal(typeof eliza.register, 'function');
        assert.equal(typeof eliza.getEliza, 'function');
        assert.equal(typeof eliza.reflect, 'function');
    });

    it('create() gibt Objekt mit transform() und reset()', () => {
        const instance = eliza.create({ keywords: [] });
        assert.equal(typeof instance.transform, 'function');
        assert.equal(typeof instance.reset, 'function');
    });

    it('transform() gibt immer ein Objekt mit reply + confidence', () => {
        const instance = eliza.create({ keywords: [] });
        const result = instance.transform('test');
        assert.ok(result, 'transform gibt Ergebnis');
        assert.equal(typeof result.reply, 'string');
        assert.equal(typeof result.confidence, 'number');
    });

    it('Pronomen-Spiegelung: ich → du', () => {
        const reflected = eliza.reflect('ich bin müde');
        assert.ok(reflected.includes('du'), `"${reflected}" sollte "du" enthalten`);
    });

    it('Pronomen-Spiegelung: mein → dein', () => {
        const reflected = eliza.reflect('mein haus');
        assert.ok(reflected.includes('dein'), `"${reflected}" sollte "dein" enthalten`);
    });

    it('reset() setzt Zustand zurück ohne Fehler', () => {
        const instance = eliza.create({ keywords: [] });
        instance.transform('eins');
        instance.transform('zwei');
        assert.doesNotThrow(() => instance.reset());
        const result = instance.transform('drei');
        assert.equal(typeof result.reply, 'string');
    });

    it('SIGMA_THRESHOLD ist eine Zahl zwischen 0 und 1', () => {
        assert.equal(typeof eliza.SIGMA_THRESHOLD, 'number');
        assert.ok(eliza.SIGMA_THRESHOLD > 0);
        assert.ok(eliza.SIGMA_THRESHOLD <= 1);
    });
});

describe('ELIZA NPC-Skripte', () => {
    let eliza;

    beforeEach(() => {
        const ctx = createBrowserContext();
        eliza = loadAll(ctx);
    });

    it('SCRIPTS Registry hat Einträge nach Script-Load', () => {
        assert.ok(Object.keys(eliza.SCRIPTS).length > 0, 'SCRIPTS sollte nicht leer sein');
    });

    it('hat Scripts für alle 10 Haupt-NPCs', () => {
        const expectedNpcs = ['spongebob', 'maus', 'elefant', 'neinhorn', 'krabs',
                              'tommy', 'bernd', 'floriane', 'bug', 'mephisto'];
        for (const npc of expectedNpcs) {
            assert.ok(eliza.SCRIPTS[npc], `Script für "${npc}" fehlt`);
        }
    });

    it('jedes Script hat initial-Nachricht', () => {
        for (const [npc, script] of Object.entries(eliza.SCRIPTS)) {
            assert.ok(script.initial, `${npc}: braucht initial-Nachricht`);
            assert.equal(typeof script.initial, 'string');
        }
    });

    it('getEliza() gibt Instanz für jeden NPC', () => {
        for (const npc of Object.keys(eliza.SCRIPTS)) {
            const instance = eliza.getEliza(npc);
            assert.ok(instance, `Instanz für ${npc}`);
            assert.equal(typeof instance.transform, 'function');
        }
    });

    it('jeder NPC antwortet auf "hallo"', () => {
        for (const npc of Object.keys(eliza.SCRIPTS)) {
            const instance = eliza.getEliza(npc);
            const result = instance.transform('hallo');
            assert.equal(typeof result.reply, 'string', `${npc}: transform gibt String`);
            assert.ok(result.reply.length > 0, `${npc}: Antwort nicht leer`);
        }
    });

    it('getEliza() für unbekannten NPC gibt null', () => {
        assert.equal(eliza.getEliza('unbekannt'), null);
    });

    it('Floriane-Initial erwähnt Wünsche oder Magie', () => {
        const script = eliza.SCRIPTS.floriane;
        const hasWish = script.initial.includes('Wünsch') || script.initial.includes('wünsch') ||
                        script.initial.includes('✨') || script.initial.includes('Fee');
        assert.ok(hasWish, `Floriane initial: "${script.initial}"`);
    });

    it('Bernd klingt genervt', () => {
        const script = eliza.SCRIPTS.bernd;
        const genervt = script.initial.includes('Mist') || script.initial.includes('seufz') ||
                        script.initial.includes('Brot') || script.initial.includes('toll');
        assert.ok(genervt, `Bernd initial: "${script.initial}"`);
    });

    it('Bug-Script hat Bug-Bezug', () => {
        const script = eliza.SCRIPTS.bug;
        const hasBug = script.initial.includes('Bug') || script.initial.includes('🐛') ||
                       script.initial.includes('Raupe') || script.initial.includes('mampf');
        assert.ok(hasBug, `Bug initial: "${script.initial}"`);
    });
});
