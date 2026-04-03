const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const SRC_INFRA = path.join(__dirname, '../../src/infra');

function createBrowserContext() {
    const storage = new Map();
    return {
        window: {},
        document: {
            getElementById: () => null,
            querySelector: () => null,
            body: { appendChild: () => {} },
        },
        localStorage: {
            getItem: (k) => storage.get(k) ?? null,
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k),
            clear: () => storage.clear(),
            _storage: storage,
        },
        console,
        setTimeout,
        requestAnimationFrame: (fn) => setTimeout(fn, 0),
        Date,
        Math,
        JSON,
        Map,
        Set,
        Array,
        Object,
        String,
        Number,
        Error,
        TypeError,
        parseInt,
        parseFloat,
        isNaN,
        btoa: (s) => Buffer.from(s).toString('base64'),
        atob: (s) => Buffer.from(s, 'base64').toString(),
        encodeURIComponent,
        decodeURIComponent,
        escape: (s) => s,
        unescape: (s) => s,
        Response: class { constructor() {} },
        undefined,
    };
}

function loadSave(ctx) {
    ctx.window = ctx;
    const code = fs.readFileSync(path.join(SRC_INFRA, 'save.js'), 'utf8');
    vm.runInNewContext(code, ctx);
    return ctx.window.INSEL_SAVE;
}

describe('save.js', () => {
    let ctx, save;

    beforeEach(() => {
        ctx = createBrowserContext();
        save = loadSave(ctx);
    });

    it('exportiert alle erwarteten Funktionen', () => {
        assert.ok(save.safeParse, 'safeParse fehlt');
        assert.ok(save.safeSet, 'safeSet fehlt');
        assert.ok(save.saveProject);
        assert.ok(save.autoSave);
        assert.ok(save.loadProject);
        assert.ok(save.deleteProject);
        assert.ok(save.newProject);
    });

    describe('safeParse', () => {
        it('parsed gültiges JSON', () => {
            ctx.localStorage.setItem('test', '{"a":1}');
            const result = save.safeParse('test', {});
            assert.deepStrictEqual(result, { a: 1 });
        });

        it('gibt Fallback bei korruptem JSON', () => {
            ctx.localStorage.setItem('test', '{kaputt!!!');
            const result = save.safeParse('test', { fallback: true });
            assert.deepStrictEqual(result, { fallback: true });
        });

        it('gibt Fallback bei fehlendem Key', () => {
            const result = save.safeParse('gibts-nicht', []);
            assert.deepStrictEqual(result, []);
        });
    });

    describe('safeSet', () => {
        it('schreibt Wert ins localStorage', () => {
            const ok = save.safeSet('key', { x: 1 });
            assert.equal(ok, true);
            assert.equal(ctx.localStorage.getItem('key'), '{"x":1}');
        });

        it('schreibt String direkt', () => {
            save.safeSet('key', 'hello');
            assert.equal(ctx.localStorage.getItem('key'), 'hello');
        });

        it('fängt QuotaExceededError ab', () => {
            // Simuliere vollen Speicher
            const origSet = ctx.localStorage.setItem;
            ctx.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
            let toastMsg = null;
            ctx.window.showToast = (msg) => { toastMsg = msg; };
            const ok = save.safeSet('key', 'data');
            assert.equal(ok, false);
            assert.ok(toastMsg && toastMsg.includes('Speicher voll'));
            ctx.localStorage.setItem = origSet;
        });
    });

    describe('Projekt-Funktionen mit safeParse', () => {
        it('saveProject überlebt korruptes localStorage', () => {
            ctx.localStorage.setItem('insel-projekte', 'KAPUTT');
            // registerContext mit Mock
            save.registerContext({
                getProjectName: () => 'Test',
                getGrid: () => [[null]],
                getTreeGrowth: () => ({}),
                getInventory: () => ({}),
                getUnlockedMaterials: () => new Set(),
                getDiscoveredRecipes: () => new Set(),
                saveInventory: () => {},
                saveUnlocked: () => {},
            });
            // Sollte nicht crashen
            save.saveProject();
            const stored = JSON.parse(ctx.localStorage.getItem('insel-projekte'));
            assert.ok(stored.Test, 'Projekt wurde gespeichert trotz korruptem Vorher-Zustand');
        });
    });
});
