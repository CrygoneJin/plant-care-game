const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Mock browser globals
function createBrowserContext() {
    const storage = new Map();
    const context = {
        window: {},
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
        },
        localStorage: {
            getItem: (k) => storage.get(k) ?? null,
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k),
            get length() { return storage.size; },
            key: (i) => [...storage.keys()][i],
            clear: () => storage.clear(),
        },
        console,
        setTimeout,
        Date,
        Math,
        JSON,
        Map,
        Array,
        Object,
        String,
        Number,
        Error,
        TypeError,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        undefined,
    };
    context.window = context; // window === globalThis in browser
    return context;
}

function loadScript(filePath, context) {
    const code = fs.readFileSync(filePath, 'utf-8');
    vm.runInNewContext(code, context, { filename: filePath });
}


// ============================================================
// 1. INSEL namespace (insel.js)
// ============================================================
describe('INSEL namespace', () => {
    let ctx;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(ROOT, 'insel.js'), ctx);
    });

    it('register() makes module accessible on INSEL', () => {
        ctx.INSEL.register('test', { foo: 1 });
        assert.deepStrictEqual(ctx.INSEL.test, { foo: 1 });
    });

    it('register() twice warns but overwrites', () => {
        const warnings = [];
        ctx.console = { ...console, warn: (...args) => warnings.push(args.join(' ')) };
        // reload with patched console
        ctx.window = ctx;
        loadScript(path.join(ROOT, 'insel.js'), ctx);

        ctx.INSEL.register('dup', { v: 1 });
        ctx.INSEL.register('dup', { v: 2 });
        assert.equal(ctx.INSEL.dup.v, 2);
        assert.ok(warnings.some(w => w.includes('dup')), 'should warn about overwrite');
    });

    it('on() + emit() delivers data to handler', () => {
        let received = null;
        ctx.INSEL.on('evt', (data) => { received = data; });
        ctx.INSEL.emit('evt', { x: 42 });
        assert.deepStrictEqual(received, { x: 42 });
    });

    it('off() removes handler', () => {
        let count = 0;
        const fn = () => { count++; };
        ctx.INSEL.on('evt', fn);
        ctx.INSEL.emit('evt');
        assert.equal(count, 1);
        ctx.INSEL.off('evt', fn);
        ctx.INSEL.emit('evt');
        assert.equal(count, 1, 'handler should not fire after off()');
    });

    it('emit() on unknown event does not throw', () => {
        assert.doesNotThrow(() => ctx.INSEL.emit('nonexistent', {}));
    });

    it('error in one listener does not break others', () => {
        let called = false;
        ctx.INSEL.on('evt', () => { throw new Error('boom'); });
        ctx.INSEL.on('evt', () => { called = true; });
        // suppress console.error from the try/catch inside emit
        ctx.console = { ...console, error: () => {} };
        ctx.INSEL.emit('evt');
        assert.ok(called, 'second listener should still run');
    });
});


// ============================================================
// 2. INSEL_STORAGE (storage.js)
// ============================================================
describe('INSEL_STORAGE', () => {
    let ctx;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(ROOT, 'storage.js'), ctx);
    });

    it('set() stores with insel- prefix', () => {
        ctx.INSEL_STORAGE.set('key', 'val');
        assert.equal(ctx.localStorage.getItem('insel-key'), 'val');
    });

    it('get() returns stored value', () => {
        ctx.INSEL_STORAGE.set('key', 'val');
        assert.equal(ctx.INSEL_STORAGE.get('key'), 'val');
    });

    it('get() returns fallback when key missing', () => {
        assert.equal(ctx.INSEL_STORAGE.get('nope', 'fb'), 'fb');
    });

    it('get() returns null when key missing and no fallback', () => {
        assert.equal(ctx.INSEL_STORAGE.get('nope'), null);
    });

    it('getJSON() parses valid JSON', () => {
        ctx.INSEL_STORAGE.setJSON('obj', { a: 1 });
        assert.deepStrictEqual(ctx.INSEL_STORAGE.getJSON('obj'), { a: 1 });
    });

    it('getJSON() returns null for invalid JSON (no throw)', () => {
        ctx.localStorage.setItem('insel-bad', '{broken');
        assert.equal(ctx.INSEL_STORAGE.getJSON('bad'), null);
    });

    it('getJSON() returns fallback for invalid JSON', () => {
        ctx.localStorage.setItem('insel-bad', '{broken');
        assert.equal(ctx.INSEL_STORAGE.getJSON('bad', 'default'), 'default');
    });

    it('setJSON() stores JSON string', () => {
        ctx.INSEL_STORAGE.setJSON('data', { a: 1 });
        assert.equal(ctx.localStorage.getItem('insel-data'), '{"a":1}');
    });

    it('remove() deletes key', () => {
        ctx.INSEL_STORAGE.set('key', 'val');
        ctx.INSEL_STORAGE.remove('key');
        assert.equal(ctx.INSEL_STORAGE.get('key'), null);
    });

    it('keys() returns only insel-prefixed keys (without prefix)', () => {
        ctx.localStorage.setItem('other', 'x');
        ctx.INSEL_STORAGE.set('alpha', '1');
        ctx.INSEL_STORAGE.set('beta', '2');
        const k = ctx.INSEL_STORAGE.keys();
        assert.ok(k.includes('alpha'));
        assert.ok(k.includes('beta'));
        assert.ok(!k.includes('other'));
    });

    it('usageBytes() returns a number > 0', () => {
        ctx.INSEL_STORAGE.set('foo', 'bar');
        const bytes = ctx.INSEL_STORAGE.usageBytes();
        assert.equal(typeof bytes, 'number');
        assert.ok(bytes > 0);
    });
});


// ============================================================
// 3. isMuted (sound.js)
// ============================================================
describe('INSEL_SOUND.isMuted', () => {
    let ctx;

    beforeEach(() => {
        ctx = createBrowserContext();

        // Minimal Web Audio API stubs so the IIFE doesn't crash
        const noop = () => {};
        const fakeGain = {
            gain: { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop },
            connect: noop,
        };
        const fakeOsc = {
            type: 'sine',
            frequency: { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop },
            detune: { value: 0 },
            connect: noop,
            start: noop,
            stop: noop,
        };
        ctx.AudioContext = function() {
            return {
                state: 'running',
                currentTime: 0,
                destination: {},
                resume: noop,
                createOscillator: () => ({ ...fakeOsc }),
                createGain: () => ({ ...fakeGain }),
            };
        };
        ctx.webkitAudioContext = ctx.AudioContext;

        // performance.now() stub
        ctx.performance = { now: () => Date.now() };

        loadScript(path.join(ROOT, 'sound.js'), ctx);
    });

    it('isMuted() returns true when localStorage has insel-muted=true', () => {
        ctx.localStorage.setItem('insel-muted', 'true');
        assert.equal(ctx.INSEL_SOUND.isMuted(), true);
    });

    it('isMuted() returns false when insel-muted is not set', () => {
        assert.equal(ctx.INSEL_SOUND.isMuted(), false);
    });

    it('isMuted() returns false when insel-muted is "false"', () => {
        ctx.localStorage.setItem('insel-muted', 'false');
        assert.equal(ctx.INSEL_SOUND.isMuted(), false);
    });

    it('setMuted(true) sets localStorage correctly', () => {
        ctx.INSEL_SOUND.setMuted(true);
        assert.equal(ctx.localStorage.getItem('insel-muted'), 'true');
    });

    it('setMuted(false) sets localStorage correctly', () => {
        ctx.INSEL_SOUND.setMuted(false);
        assert.equal(ctx.localStorage.getItem('insel-muted'), 'false');
    });
});
