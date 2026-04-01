// === BIBLIOTHEK VON ALEXANDRIA — Schriftrollen-Challenges ===
// Backlog #56: Gebäude auf der Insel, Schriftrollen statt Bücher,
// jede Rolle = Wiki-Game-Challenge.
// Exportiert als window.INSEL_BIBLIOTHEK

(function () {
    'use strict';

    var STORAGE_KEY = 'insel-bibliothek-progress';

    // --- Die 5 Schriftrollen ---
    var SCROLLS = [
        {
            id: 'wasser-zu-drache',
            title: '🐉 Von Wasser zu Drache',
            desc: 'Finde den Crafting-Pfad von Wasser bis zum Drachen!',
            hint: 'Wasser → Yin → ... → Feuer → Ei → Drache',
            check: function (inv, grid, discovered) {
                return !!discovered['dragon'];
            },
            reward: { material: 'dragon', count: 1 },
            rewardLabel: '🐉 Drache',
        },
        {
            id: 'fuenf-elemente',
            title: '☯ Die 5 Elemente',
            desc: 'Sammle alle Wu-Xing Materialien: Metall, Holz, Feuer, Wasser, Erde.',
            hint: 'Tao → Yin + Yang → Qi → die 5 Elemente',
            check: function (inv, grid, discovered) {
                var elemente = ['metal', 'wood', 'fire', 'water', 'earth'];
                return elemente.every(function (e) { return !!discovered[e]; });
            },
            reward: { material: 'crystal', count: 1 },
            rewardLabel: '💎 Kristall',
        },
        {
            id: 'turmhoch',
            title: '🗼 Turmhoch',
            desc: 'Baue einen Turm! (4×4 Bauplan mit Stein, Lampe und Tür)',
            hint: 'Lampen oben, Stein in der Mitte, Tür unten.',
            check: function (inv, grid, discovered) {
                // Prüfe ob ein Turm-Blueprint jemals gebaut wurde
                var done = [];
                try { done = JSON.parse(localStorage.getItem('insel-blueprints-done') || '[]'); } catch (e) { /* */ }
                return done.indexOf('tower') !== -1;
            },
            reward: { material: 'star', count: 1 },
            rewardLabel: '⭐ Stern',
        },
        {
            id: 'meeresfreund',
            title: '🌊 Meeresfreund',
            desc: 'Platziere 10 Wasser-Zellen nebeneinander auf der Insel.',
            hint: 'Baue einen See oder Fluss — mindestens 10 Wasser zusammenhängend.',
            check: function (inv, grid) {
                if (!grid) return false;
                // BFS: finde die größte zusammenhängende Wasser-Gruppe
                var rows = grid.length, cols = grid[0].length;
                var visited = [];
                for (var i = 0; i < rows; i++) {
                    visited[i] = [];
                    for (var j = 0; j < cols; j++) visited[i][j] = false;
                }
                var maxSize = 0;
                for (var r = 2; r < rows - 2; r++) {
                    for (var c = 2; c < cols - 2; c++) {
                        if (grid[r][c] === 'water' && !visited[r][c]) {
                            var size = 0;
                            var queue = [[r, c]];
                            visited[r][c] = true;
                            while (queue.length > 0) {
                                var pos = queue.shift();
                                var cr = pos[0], cc = pos[1];
                                size++;
                                var neighbors = [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]];
                                for (var n = 0; n < neighbors.length; n++) {
                                    var nr = neighbors[n][0], nc = neighbors[n][1];
                                    if (nr >= 2 && nr < rows - 2 && nc >= 2 && nc < cols - 2 &&
                                        grid[nr][nc] === 'water' && !visited[nr][nc]) {
                                        visited[nr][nc] = true;
                                        queue.push([nr, nc]);
                                    }
                                }
                            }
                            if (size > maxSize) maxSize = size;
                        }
                    }
                }
                return maxSize >= 10;
            },
            reward: { material: 'fish', count: 3 },
            rewardLabel: '🐟 3 Fische',
        },
        {
            id: 'geheimschrift',
            title: '🔮 Geheimschrift',
            desc: 'Finde das Easter Egg! Crafte etwas Magisches.',
            hint: 'Pilz + Wasser + Feuer = ???',
            check: function (inv, grid, discovered) {
                return !!discovered['potion'];
            },
            reward: { material: 'unicorn', count: 1 },
            rewardLabel: '🦄 Einhorn',
        },
    ];

    // --- Persistenz ---
    function loadProgress() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
    }

    function saveProgress(progress) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    // --- UI ---
    var panel = null;
    var isOpen = false;

    function createPanel() {
        if (panel) return panel;

        var el = document.createElement('div');
        el.id = 'bibliothek-panel';
        el.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
            'width:92vw;max-width:440px;max-height:85vh;background:#2a1a0e;color:#f5e6ca;' +
            'border:3px solid #c9a96e;border-radius:16px;z-index:10000;overflow-y:auto;' +
            'font-family:"Fredoka","Comic Neue",sans-serif;padding:0;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

        el.innerHTML = buildPanelHTML();
        document.body.appendChild(el);
        panel = el;

        // Close-Button
        panel.querySelector('#bibliothek-close').addEventListener('click', close);

        // Scroll-Buttons
        panel.querySelectorAll('.scroll-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var scrollId = btn.dataset.scroll;
                toggleScrollDetail(scrollId);
            });
        });

        return panel;
    }

    function buildPanelHTML() {
        var progress = loadProgress();
        var html = [
            '<div style="padding:16px 20px;border-bottom:2px solid #5a3a1a;background:linear-gradient(135deg,#3a2510,#2a1a0e);">',
            '  <div style="display:flex;justify-content:space-between;align-items:center;">',
            '    <span style="font-size:18px;font-weight:bold;">🏛️ Bibliothek von Alexandria</span>',
            '    <button id="bibliothek-close" style="background:none;border:none;color:#c9a96e;font-size:22px;cursor:pointer;padding:4px 8px;">&times;</button>',
            '  </div>',
            '  <div style="font-size:12px;color:#a08060;margin-top:4px;">5 Schriftrollen — löse die Rätsel, gewinne seltene Schätze!</div>',
            '</div>',
            '<div id="bibliothek-scrolls" style="padding:12px 16px;">',
        ];

        for (var i = 0; i < SCROLLS.length; i++) {
            var s = SCROLLS[i];
            var solved = !!progress[s.id];
            var statusIcon = solved ? '✅' : '📜';
            var statusClass = solved ? 'scroll-solved' : 'scroll-open';

            html.push(
                '<div class="scroll-item ' + statusClass + '" style="margin-bottom:8px;">',
                '  <button class="scroll-btn" data-scroll="' + s.id + '" style="' +
                    'width:100%;text-align:left;padding:12px 16px;border-radius:10px;cursor:pointer;' +
                    'border:2px solid ' + (solved ? '#4a7a4a' : '#5a4a2a') + ';' +
                    'background:' + (solved ? 'linear-gradient(135deg,#2a4a2a,#1a3a1a)' : 'linear-gradient(135deg,#3a2a1a,#2a1a0a)') + ';' +
                    'color:#f5e6ca;font-family:inherit;font-size:14px;transition:all 0.2s;">',
                '    <span>' + statusIcon + ' ' + s.title + '</span>',
                '    <span style="float:right;font-size:11px;color:#a08060;">' + (solved ? s.rewardLabel : '???') + '</span>',
                '  </button>',
                '  <div class="scroll-detail" id="scroll-detail-' + s.id + '" style="display:none;padding:10px 16px;' +
                    'background:rgba(0,0,0,0.3);border-radius:0 0 10px 10px;margin-top:-2px;border:1px solid #3a2a1a;">',
                '    <p style="margin:0 0 6px 0;font-size:13px;">' + s.desc + '</p>',
                '    <p style="margin:0 0 8px 0;font-size:11px;color:#a08060;font-style:italic;">💡 ' + s.hint + '</p>',
                (solved
                    ? '<p style="margin:0;font-size:12px;color:#6a6;">✅ Gelöst! Belohnung: ' + s.rewardLabel + '</p>'
                    : '<button class="scroll-check-btn" data-scroll="' + s.id + '" style="' +
                        'padding:6px 14px;border-radius:8px;border:1px solid #c9a96e;background:#4a3a2a;' +
                        'color:#f5e6ca;cursor:pointer;font-family:inherit;font-size:12px;">🔍 Prüfen</button>'),
                '  </div>',
                '</div>'
            );
        }

        html.push('</div>');
        return html.join('\n');
    }

    function toggleScrollDetail(scrollId) {
        var detail = panel.querySelector('#scroll-detail-' + scrollId);
        if (!detail) return;
        var isVisible = detail.style.display !== 'none';
        // Alle schließen
        panel.querySelectorAll('.scroll-detail').forEach(function (d) { d.style.display = 'none'; });
        if (!isVisible) {
            detail.style.display = 'block';
            // Check-Button Event binden
            var checkBtn = detail.querySelector('.scroll-check-btn');
            if (checkBtn) {
                checkBtn.onclick = function () { checkScroll(scrollId); };
            }
        }
    }

    function checkScroll(scrollId) {
        var progress = loadProgress();
        if (progress[scrollId]) return; // Bereits gelöst

        var scroll = SCROLLS.find(function (s) { return s.id === scrollId; });
        if (!scroll) return;

        // Grid und Inventar aus dem Spielzustand holen
        var grid = window.grid || null;
        var inv = window.inventory || {};
        var discovered = {};

        // Entdeckte Materialien aus dem Spiel holen
        try {
            var discoveredList = JSON.parse(localStorage.getItem('insel-discovered') || '[]');
            discoveredList.forEach(function (m) { discovered[m] = true; });
        } catch (e) { /* */ }

        if (scroll.check(inv, grid, discovered)) {
            // Gelöst!
            progress[scrollId] = { solved: true, ts: Date.now() };
            saveProgress(progress);

            // Belohnung ins Inventar
            if (scroll.reward && window.inventory !== undefined) {
                var mat = scroll.reward.material;
                var count = scroll.reward.count || 1;
                window.inventory[mat] = (window.inventory[mat] || 0) + count;
                if (typeof window.updateInventoryDisplay === 'function') {
                    window.updateInventoryDisplay();
                }
            }

            // Toast
            if (typeof window.showToast === 'function') {
                window.showToast('📜 Schriftrolle gelöst: ' + scroll.title + ' → ' + scroll.rewardLabel + '!', 5000);
            }

            // Sound
            if (typeof window.soundCraft === 'function') {
                window.soundCraft();
            }

            // Bus-Event
            if (window.INSEL_BUS) {
                window.INSEL_BUS.emit('bibliothek:scroll-solved', { scrollId: scrollId, reward: scroll.reward });
            }

            // Panel neu rendern
            refreshPanel();
        } else {
            // Noch nicht geschafft
            if (typeof window.showToast === 'function') {
                window.showToast('📜 Noch nicht geschafft... ' + scroll.hint, 3000);
            }
        }
    }

    function refreshPanel() {
        if (!panel) return;
        panel.innerHTML = buildPanelHTML();
        // Events neu binden
        panel.querySelector('#bibliothek-close').addEventListener('click', close);
        panel.querySelectorAll('.scroll-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                toggleScrollDetail(btn.dataset.scroll);
            });
        });
    }

    function open() {
        createPanel();
        refreshPanel();
        panel.style.display = 'block';
        isOpen = true;
    }

    function close() {
        if (panel) panel.style.display = 'none';
        isOpen = false;
    }

    function isOpenFn() {
        return isOpen;
    }

    // --- Public API ---
    window.INSEL_BIBLIOTHEK = {
        open: open,
        close: close,
        isOpen: isOpenFn,
        SCROLLS: SCROLLS,
    };
})();
