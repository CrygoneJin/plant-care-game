// hex-marble.js — Murmel-Physik auf Hex-Grid (Gravitrax)
// Murmel folgt dem Gradienten zum niedrigsten Nachbar-Hex
(function () {
    'use strict';

    var TICK_MS = 300;      // Murmel bewegt sich alle 300ms
    var MAX_STEPS = 100;    // Endlos-Schutz

    function createMarble(q, r) {
        return {
            q: q, r: r,
            active: true,
            path: [{ q: q, r: r }],
            speed: 1,
            steps: 0
        };
    }

    function tickMarble(marble, grid) {
        if (!marble.active) return;
        marble.steps++;
        if (marble.steps > MAX_STEPS) {
            marble.active = false;
            return;
        }

        var current = grid.get(marble.q, marble.r);
        if (!current) { marble.active = false; return; }

        var neighbors = grid.neighbors(marble.q, marble.r);
        var lowest = null;
        var lowestHeight = current.height;

        for (var i = 0; i < neighbors.length; i++) {
            var nq = neighbors[i][0], nr = neighbors[i][1];
            var ncell = grid.get(nq, nr);
            if (ncell && ncell.height < lowestHeight) {
                lowestHeight = ncell.height;
                lowest = { q: nq, r: nr };
            }
        }

        // Flach oder aufwaerts -> Murmel bleibt liegen
        if (!lowest) {
            marble.active = false;
            return;
        }

        // Terrain-Effekte
        var target = grid.get(lowest.q, lowest.r);
        if (target.surface === 'water' || target.surface === 'wave') {
            marble.speed = Math.max(0.5, marble.speed * 0.7); // Wasser verlangsamt
        } else if (target.surface === 'fire' || target.surface === 'volcano') {
            marble.speed = Math.min(3, marble.speed * 1.5); // Feuer beschleunigt
        }

        // Hoehle: teleportiert zur tiefsten erreichbaren Zelle
        if (target.surface === 'cave') {
            var deepest = findDeepest(grid);
            if (deepest) {
                lowest = deepest;
            }
        }

        marble.q = lowest.q;
        marble.r = lowest.r;
        marble.path.push({ q: lowest.q, r: lowest.r });

        // See (h:0 + Wasser) -> Splash, Murmel stoppt
        if (target.height === 0 && (target.surface === 'water' || target.surface === 'wave')) {
            marble.active = false;
        }
    }

    function findDeepest(grid) {
        var minH = Infinity;
        var result = null;
        grid.forEach(function (cell, q, r) {
            if (cell.surface && cell.surface !== 'cave' && cell.height < minH) {
                minH = cell.height;
                result = { q: q, r: r };
            }
        });
        return result;
    }

    // Animation-Loop: ruft tickMarble wiederholt auf
    function animateMarble(marble, grid, onTick, onDone) {
        var interval = setInterval(function () {
            tickMarble(marble, grid);
            if (onTick) onTick(marble);
            if (!marble.active) {
                clearInterval(interval);
                if (onDone) onDone(marble);
            }
        }, TICK_MS / marble.speed);
        return interval;
    }

    window.INSEL_MARBLE = {
        createMarble: createMarble,
        tickMarble: tickMarble,
        animateMarble: animateMarble,
        TICK_MS: TICK_MS
    };
})();
