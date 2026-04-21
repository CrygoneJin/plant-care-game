// @ts-check
// particle-snap.js — 2048-Snap fuer fliegende Partikel
//
// Prinzip (Tesla/2048): Zwei Partikel vom gleichen Material kollidieren im Flug
// und verschmelzen. Wenn eine Merge-Regel in INSEL_AUTOMERGE existiert
// (Yang+Yang -> Charm), entsteht das naechstgroessere Material. Sonst wachst
// der bestehende Partikel (Size x 1.3) und bleibt gleiches Material.
//
// KEIN Tile-Grid. KEIN placed material. Nur fliegende Partikel — die physische
// Ebene ueber dem Grid.
//
// Exportiert als window.INSEL_PARTICLE_SNAP.
(function () {
    'use strict';

    /**
     * @typedef {object} Particle
     * @property {number} id
     * @property {string} material
     * @property {number} x
     * @property {number} y
     * @property {number} vx
     * @property {number} vy
     * @property {number} size          aktueller Radius in Pixeln
     * @property {number} baseSize      Start-Radius (fuer Alters-Fade)
     * @property {number} born          timestamp ms
     * @property {number} ttl           ms bis Tod
     * @property {boolean} dead
     */

    /** @type {Array<Particle>} */
    var particles = [];
    var nextId = 1;

    var GRAVITY = 0.0;              // kein Fall by default; optional via config
    var DAMPING = 0.985;            // Luftreibung pro Frame
    var DEFAULT_TTL = 4000;         // 4s
    var DEFAULT_SIZE = 8;           // px
    var MERGE_PAD = 2;              // zusaetzliche px beim Kollisionstest
    var MAX_SIZE = 40;              // Kappe fuer Grow-ohne-Rule
    var GROW_FACTOR = 1.3;          // Size-Multiplikator bei Non-Rule-Merge

    /**
     * Liefert Merge-Ergebnis fuer (a,b) aus INSEL_AUTOMERGE.MERGE_RULES.
     * @param {string} a
     * @param {string} b
     * @returns {string|null} Ziel-Material oder null
     */
    function lookupMergeResult(a, b) {
        var AM = typeof window !== 'undefined' ? window.INSEL_AUTOMERGE : null;
        if (!AM || !AM.MERGE_RULES) return null;
        for (var i = 0; i < AM.MERGE_RULES.length; i++) {
            var rule = AM.MERGE_RULES[i];
            if ((rule.a === a && rule.b === b) || (rule.a === b && rule.b === a)) {
                return rule.result;
            }
        }
        return null;
    }

    /**
     * Spawn einen Partikel.
     * @param {string} material
     * @param {number} x
     * @param {number} y
     * @param {object} [opts]
     * @param {number} [opts.vx]
     * @param {number} [opts.vy]
     * @param {number} [opts.size]
     * @param {number} [opts.ttl]
     * @returns {Particle}
     */
    function spawn(material, x, y, opts) {
        opts = opts || {};
        var p = {
            id: nextId++,
            material: material,
            x: x,
            y: y,
            vx: typeof opts.vx === 'number' ? opts.vx : (Math.random() - 0.5) * 2,
            vy: typeof opts.vy === 'number' ? opts.vy : (Math.random() - 0.5) * 2,
            size: typeof opts.size === 'number' ? opts.size : DEFAULT_SIZE,
            baseSize: typeof opts.size === 'number' ? opts.size : DEFAULT_SIZE,
            born: Date.now(),
            ttl: typeof opts.ttl === 'number' ? opts.ttl : DEFAULT_TTL,
            dead: false,
        };
        particles.push(p);
        return p;
    }

    /**
     * Integrator-Schritt. Bewegt Partikel, altert sie, merged Kollisionen.
     * @param {number} [dtMs] optional; default 16
     * @returns {{ moved: number, merged: number, dead: number }}
     */
    function update(dtMs) {
        var dt = typeof dtMs === 'number' ? dtMs / 16.667 : 1;
        var now = Date.now();

        // 1) Bewegung + Altern
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.dead) continue;
            p.vx *= DAMPING;
            p.vy = p.vy * DAMPING + GRAVITY * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (now - p.born > p.ttl) p.dead = true;
        }

        // 2) Paar-Kollisionen (O(n^2) — bei < ~200 Partikel unproblematisch)
        var mergedCount = 0;
        for (var a = 0; a < particles.length; a++) {
            var pa = particles[a];
            if (pa.dead) continue;
            for (var b = a + 1; b < particles.length; b++) {
                var pb = particles[b];
                if (pb.dead) continue;
                var dx = pa.x - pb.x;
                var dy = pa.y - pb.y;
                var r = pa.size + pb.size + MERGE_PAD;
                if (dx * dx + dy * dy > r * r) continue;

                // Kollision! 2048-Snap versuchen.
                if (pa.material === pb.material) {
                    var result = lookupMergeResult(pa.material, pb.material);
                    if (result) {
                        // Rule-Merge: neues Material, beide Partikel tot, Nachfolger spawnt
                        var nx = (pa.x + pb.x) * 0.5;
                        var ny = (pa.y + pb.y) * 0.5;
                        var nSize = Math.min(MAX_SIZE, (pa.size + pb.size) * 0.7);
                        spawn(result, nx, ny, {
                            vx: (pa.vx + pb.vx) * 0.5,
                            vy: (pa.vy + pb.vy) * 0.5,
                            size: nSize,
                            ttl: DEFAULT_TTL,
                        });
                        pa.dead = true;
                        pb.dead = true;
                        mergedCount++;

                        // Event fuer UI (optional)
                        if (window.INSEL_BUS) {
                            window.INSEL_BUS.emit('particle:merge', {
                                from: pa.material,
                                result: result,
                                x: nx,
                                y: ny,
                            });
                        }
                    } else {
                        // Gleiches Material, aber keine Regel: wachsen lassen, nicht transformieren
                        pa.size = Math.min(MAX_SIZE, pa.size * GROW_FACTOR);
                        pa.x = (pa.x + pb.x) * 0.5;
                        pa.y = (pa.y + pb.y) * 0.5;
                        pa.vx = (pa.vx + pb.vx) * 0.5;
                        pa.vy = (pa.vy + pb.vy) * 0.5;
                        pb.dead = true;
                        mergedCount++;
                    }
                } else if (lookupMergeResult(pa.material, pb.material)) {
                    // Unterschiedliche Materialien mit Merge-Regel (z.B. Yin+Yang -> Qi)
                    var rm = lookupMergeResult(pa.material, pb.material);
                    if (rm) {
                        var mx = (pa.x + pb.x) * 0.5;
                        var my = (pa.y + pb.y) * 0.5;
                        var mSize = Math.min(MAX_SIZE, (pa.size + pb.size) * 0.7);
                        spawn(rm, mx, my, {
                            vx: (pa.vx + pb.vx) * 0.5,
                            vy: (pa.vy + pb.vy) * 0.5,
                            size: mSize,
                            ttl: DEFAULT_TTL,
                        });
                        pa.dead = true;
                        pb.dead = true;
                        mergedCount++;
                        if (window.INSEL_BUS) {
                            window.INSEL_BUS.emit('particle:merge', {
                                from: pa.material + '+' + pb.material,
                                result: rm,
                                x: mx,
                                y: my,
                            });
                        }
                    }
                }
            }
        }

        // 3) Tote raus
        var deadCount = 0;
        var alive = [];
        for (var k = 0; k < particles.length; k++) {
            if (particles[k].dead) { deadCount++; continue; }
            alive.push(particles[k]);
        }
        particles = alive;

        return { moved: particles.length, merged: mergedCount, dead: deadCount };
    }

    /**
     * Rendert alle lebenden Partikel auf ctx.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} [materials] optional override; default window.INSEL_MATERIALS
     */
    function draw(ctx, materials) {
        var mats = materials || (typeof window !== 'undefined' ? window.INSEL_MATERIALS : {});
        var now = Date.now();
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.dead) continue;
            var age = (now - p.born) / p.ttl;
            var alpha = age < 0.2 ? age / 0.2 : (age > 0.8 ? (1 - age) / 0.2 : 1);
            if (alpha < 0) alpha = 0;
            if (alpha > 1) alpha = 1;
            var mat = mats && mats[p.material];
            var color = (mat && mat.color) || '#FFFFFF';

            ctx.save();
            ctx.globalAlpha = alpha;

            // Fuellung
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Rand
            ctx.strokeStyle = (mat && mat.border) || '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Emoji bei groesseren Partikeln
            if (p.size >= 10 && mat && mat.emoji) {
                ctx.font = Math.round(p.size * 1.2) + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(mat.emoji, p.x, p.y);
            }

            ctx.restore();
        }
    }

    function clear() {
        particles = [];
    }

    function count() {
        return particles.length;
    }

    /** @returns {Array<Particle>} Kopie fuer Tests/Inspection */
    function snapshot() {
        return particles.map(function (p) { return Object.assign({}, p); });
    }

    window.INSEL_PARTICLE_SNAP = {
        spawn: spawn,
        update: update,
        draw: draw,
        clear: clear,
        count: count,
        snapshot: snapshot,
        // Fuer Tests und fine-tuning
        _setGravity: function (g) { GRAVITY = g; },
        _setDamping: function (d) { DAMPING = d; },
        _lookupMergeResult: lookupMergeResult,
    };
})();
