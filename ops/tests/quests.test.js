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
    };
}

function load(ctx) {
    ctx.window = ctx;
    const code = fs.readFileSync(path.join(SRC, 'world/quests.js'), 'utf-8');
    vm.runInNewContext(code, ctx, { filename: 'quests.js' });
    return ctx.INSEL_QUEST_TEMPLATES;
}

describe('Quest Templates', () => {
    let quests;

    beforeEach(() => {
        const ctx = createBrowserContext();
        quests = load(ctx);
    });

    it('ist ein nicht-leeres Array', () => {
        assert.ok(Array.isArray(quests));
        assert.ok(quests.length > 30, `Erwartet >30 Quests, hat ${quests.length}`);
    });

    it('jeder Quest hat npc, title, desc, needs, reward', () => {
        for (const q of quests) {
            assert.ok(q.npc, `Quest braucht npc: ${JSON.stringify(q)}`);
            assert.ok(q.title, `Quest braucht title`);
            assert.ok(q.desc, `Quest braucht desc`);
            assert.ok(q.needs && typeof q.needs === 'object', `${q.title}: braucht needs`);
            assert.ok(Object.keys(q.needs).length > 0, `${q.title}: needs darf nicht leer sein`);
            assert.ok(q.reward, `${q.title}: braucht reward`);
        }
    });

    it('alle NPC-IDs sind gültige NPCs', () => {
        const validNpcs = ['spongebob', 'maus', 'elefant', 'neinhorn', 'krabs', 'tommy',
                           'bernd', 'floriane', 'bug', 'mephisto', 'kraemerin', 'lokfuehrer'];
        for (const q of quests) {
            assert.ok(validNpcs.includes(q.npc),
                `${q.title}: NPC "${q.npc}" ist kein gültiger NPC`);
        }
    });

    it('Floriane hat Quests', () => {
        const florianeQuests = quests.filter(q => q.npc === 'floriane');
        assert.ok(florianeQuests.length >= 2, `Floriane hat ${florianeQuests.length} Quests`);
    });

    it('Bug hat Quests', () => {
        const bugQuests = quests.filter(q => q.npc === 'bug');
        assert.ok(bugQuests.length >= 2, `Bug hat ${bugQuests.length} Quests`);
    });

    it('Mephisto hat Quests', () => {
        const mephistoQuests = quests.filter(q => q.npc === 'mephisto');
        assert.ok(mephistoQuests.length >= 3, `Mephisto hat ${mephistoQuests.length} Quests`);
    });

    it('keine doppelten Titles', () => {
        const titles = quests.map(q => q.title);
        const uniqueTitles = new Set(titles);
        const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
        // Schatzkammer ist doppelt (Krabs + Maus) — bekannt
        const knownDupes = ['Schatzkammer'];
        const unexpected = dupes.filter(d => !knownDupes.includes(d));
        assert.equal(unexpected.length, 0,
            `Doppelte Quest-Titles: ${unexpected.join(', ')}`);
    });

    it('alle needs-Mengen sind positiv', () => {
        for (const q of quests) {
            for (const [mat, count] of Object.entries(q.needs)) {
                assert.ok(count > 0, `${q.title}: ${mat} hat Menge ${count}`);
                assert.ok(Number.isInteger(count), `${q.title}: ${mat} muss Integer sein`);
            }
        }
    });

    it('Community-Quests haben community: true', () => {
        const communityQuests = quests.filter(q => q.community);
        assert.ok(communityQuests.length >= 3,
            `Erwartet mindestens 3 Community-Quests, hat ${communityQuests.length}`);
        for (const q of communityQuests) {
            assert.equal(q.community, true);
        }
    });

    it('jeder Haupt-NPC hat mindestens 2 Quests', () => {
        const mainNpcs = ['spongebob', 'maus', 'elefant', 'neinhorn', 'krabs', 'tommy'];
        for (const npc of mainNpcs) {
            const count = quests.filter(q => q.npc === npc).length;
            assert.ok(count >= 2, `${npc} hat nur ${count} Quests (min 2)`);
        }
    });

    it('needs-Keys sind lowercase material-IDs', () => {
        for (const q of quests) {
            for (const mat of Object.keys(q.needs)) {
                assert.ok(/^[a-z_]+$/.test(mat),
                    `${q.title}: Material "${mat}" hat ungültige Zeichen`);
            }
        }
    });
});
