// genesis.js — Schöpfungsgeschichte als Tutorial (#37)
// 7 Schritte, rein visuell, keine Texte. Aktivierung: ?genesis=1
(function () {
    'use strict';

    // Nur starten wenn ?genesis=1 in URL oder localStorage-Flag
    var params = new URLSearchParams(window.location.search);
    var genesisRequested = params.get('genesis') === '1' ||
        localStorage.getItem('insel-genesis-mode') === '1';

    // Menü-Option: genesis-Modus aktivieren/deaktivieren
    window.INSEL_GENESIS = {
        isActive: function () { return genesisRequested; },
        enable: function () {
            localStorage.setItem('insel-genesis-mode', '1');
            genesisRequested = true;
        },
        disable: function () {
            localStorage.removeItem('insel-genesis-mode');
            genesisRequested = false;
        },
        toggle: function () {
            if (genesisRequested) {
                window.INSEL_GENESIS.disable();
            } else {
                window.INSEL_GENESIS.enable();
            }
            return genesisRequested;
        },
        /** Wird von game.js aufgerufen statt showTutorialOnboarding() */
        run: runGenesisTutorial,
    };

    // === 7-Schritt Genesis ===
    var STEP_DURATION = 1500; // ms pro Schritt
    var FADE_DURATION = 800;

    function runGenesisTutorial() {
        if (!genesisRequested) return false;

        var grid = window.grid;
        var dims = window.INSEL_DIMS;
        var EFFECTS = window.INSEL_EFFECTS;
        var MATERIALS = window.INSEL_MATERIALS;
        if (!grid || !dims) return false;

        var ROWS = dims.ROWS;
        var COLS = dims.COLS;

        // Overlay erstellen
        var overlay = document.createElement('div');
        overlay.id = 'genesis-overlay';
        overlay.style.cssText =
            'position:fixed;inset:0;z-index:9500;pointer-events:all;' +
            'background:rgba(0,0,0,0.95);transition:background ' + FADE_DURATION + 'ms ease;' +
            'display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(overlay);

        // Emoji-Anzeige im Overlay
        var stepEmoji = document.createElement('div');
        stepEmoji.style.cssText =
            'font-size:120px;opacity:0;transition:opacity 0.5s ease,transform 0.5s ease;' +
            'transform:scale(0.5);text-align:center;';
        overlay.appendChild(stepEmoji);

        // Fortschritts-Dots
        var dotsRow = document.createElement('div');
        dotsRow.style.cssText =
            'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);' +
            'display:flex;gap:14px;';
        for (var d = 0; d < 7; d++) {
            var dot = document.createElement('div');
            dot.className = 'genesis-dot';
            dot.style.cssText =
                'width:12px;height:12px;border-radius:50%;background:white;' +
                'opacity:0.2;transition:opacity 0.4s ease;';
            dot.dataset.index = String(d);
            dotsRow.appendChild(dot);
        }
        overlay.appendChild(dotsRow);

        // Hilfsfunktionen
        function showEmoji(emoji) {
            stepEmoji.textContent = emoji;
            stepEmoji.style.opacity = '1';
            stepEmoji.style.transform = 'scale(1)';
            setTimeout(function () {
                stepEmoji.style.opacity = '0';
                stepEmoji.style.transform = 'scale(0.5)';
            }, STEP_DURATION - 400);
        }

        function activateDot(index) {
            var dots = dotsRow.querySelectorAll('.genesis-dot');
            for (var i = 0; i < dots.length; i++) {
                dots[i].style.opacity = (i <= index) ? '1' : '0.2';
            }
        }

        // === Die 7 Schritte ===

        // 1. Licht — Hintergrund von dunkel zu hell
        function step1_licht(cb) {
            showEmoji('💡');
            activateDot(0);
            // Overlay wird heller
            setTimeout(function () {
                overlay.style.background = 'rgba(255,245,200,0.7)';
            }, 200);
            setTimeout(cb, STEP_DURATION);
        }

        // 2. Wasser — Ozean erscheint (Grid bleibt null = Wasser im Renderer)
        function step2_wasser(cb) {
            showEmoji('🌊');
            activateDot(1);
            overlay.style.background = 'rgba(30,100,180,0.5)';
            // Grid ist schon null = Wasser. Redraw erzwingen.
            if (window.requestRedraw) window.requestRedraw();
            setTimeout(cb, STEP_DURATION);
        }

        // 3. Erde — Insel-Zellen tauchen auf (Sand/Erde im mittleren Bereich)
        function step3_erde(cb) {
            showEmoji('🏝️');
            activateDot(2);
            overlay.style.background = 'rgba(194,178,128,0.4)';

            var cx = Math.floor(COLS / 2);
            var cy = Math.floor(ROWS / 2);
            var rx = Math.floor(COLS * 0.3);
            var ry = Math.floor(ROWS * 0.3);

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    var dx = (c - cx) / rx;
                    var dy = (r - cy) / ry;
                    if (dx * dx + dy * dy < 1) {
                        // Rand = Sand, Mitte = Erde
                        var dist = dx * dx + dy * dy;
                        grid[r][c] = dist > 0.7 ? 'sand' : 'earth';
                    }
                }
            }
            if (window.requestRedraw) window.requestRedraw();
            setTimeout(cb, STEP_DURATION);
        }

        // 4. Pflanzen — Bäume erscheinen automatisch
        function step4_pflanzen(cb) {
            showEmoji('🌳');
            activateDot(3);
            overlay.style.background = 'rgba(34,139,34,0.3)';

            // Zufällig ein paar Bäume auf Erde-Zellen
            var planted = 0;
            var maxTrees = Math.max(5, Math.floor(ROWS * COLS * 0.01));
            for (var r = 0; r < ROWS && planted < maxTrees; r++) {
                for (var c = 0; c < COLS && planted < maxTrees; c++) {
                    if (grid[r][c] === 'earth' && Math.random() < 0.08) {
                        var treeType = Math.random() < 0.5 ? 'tree' : 'palm';
                        // Nur wenn Material existiert
                        if (MATERIALS && MATERIALS[treeType]) {
                            grid[r][c] = treeType;
                            planted++;
                        }
                    }
                }
            }
            if (window.requestRedraw) window.requestRedraw();
            setTimeout(cb, STEP_DURATION);
        }

        // 5. Tiere — Fisch-Material wird freigeschaltet
        function step5_tiere(cb) {
            showEmoji('🐟');
            activateDot(4);
            overlay.style.background = 'rgba(0,150,200,0.3)';

            // Fisch-Button sichtbar machen (craft-locked entfernen)
            var fishBtn = document.querySelector('.material-btn[data-material="fish"]');
            if (fishBtn) {
                fishBtn.classList.remove('craft-locked');
                fishBtn.style.display = '';
            }

            // Ein paar Fische ins Wasser (null-Zellen am Rand)
            var placed = 0;
            for (var r = 0; r < ROWS && placed < 3; r++) {
                for (var c = 0; c < COLS && placed < 3; c++) {
                    if (grid[r][c] === null && Math.random() < 0.02) {
                        if (MATERIALS && MATERIALS.fish) {
                            grid[r][c] = 'fish';
                            placed++;
                        }
                    }
                }
            }
            if (window.requestRedraw) window.requestRedraw();
            setTimeout(cb, STEP_DURATION);
        }

        // 6. Mensch — Spielfigur erscheint
        function step6_mensch(cb) {
            var emoji = localStorage.getItem('insel-player-emoji') || '🧒';
            showEmoji(emoji);
            activateDot(5);
            overlay.style.background = 'rgba(255,220,100,0.25)';

            // Spielfigur in die Mitte der Insel setzen (als visueller Marker)
            var cy = Math.floor(ROWS / 2);
            var cx = Math.floor(COLS / 2);
            if (grid[cy] && grid[cy][cx]) {
                // Lasse Erde stehen — Spielfigur wird nicht ins Grid gesetzt,
                // nur visuell angedeutet
            }
            if (window.requestRedraw) window.requestRedraw();
            setTimeout(cb, STEP_DURATION);
        }

        // 7. Ruhetag — Postkarte freigeschaltet
        function step7_ruhetag(cb) {
            showEmoji('📸');
            activateDot(6);
            overlay.style.background = 'rgba(255,255,255,0.1)';

            // Postkarten-Button highlighten
            var postcardBtn = document.getElementById('postcard-btn');
            if (postcardBtn) {
                postcardBtn.style.animation = 'tutGlow 1s infinite alternate';
                setTimeout(function () {
                    postcardBtn.style.animation = '';
                }, 3000);
            }

            setTimeout(cb, STEP_DURATION);
        }

        // === Sequenz starten ===
        var steps = [
            step1_licht,
            step2_wasser,
            step3_erde,
            step4_pflanzen,
            step5_tiere,
            step6_mensch,
            step7_ruhetag,
        ];

        var currentStep = 0;

        function runNext() {
            if (currentStep >= steps.length) {
                // Fertig — Overlay ausblenden
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.6s ease';
                setTimeout(function () {
                    overlay.remove();
                }, 700);
                // Genesis-Flag für "gesehen" setzen
                localStorage.setItem('insel-genesis-seen', '1');
                return;
            }
            steps[currentStep](function () {
                currentStep++;
                runNext();
            });
        }

        // Skip bei Klick/Tap
        overlay.addEventListener('click', function skipGenesis() {
            overlay.removeEventListener('click', skipGenesis);
            // Restliche Schritte schnell durchlaufen
            currentStep = steps.length;
            // Trotzdem Grid füllen falls noch leer
            if (!gridHasContent(grid, ROWS, COLS)) {
                step3_erde(function () {
                    step4_pflanzen(function () {
                        step5_tiere(function () {});
                    });
                });
            }
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.4s ease';
            setTimeout(function () { overlay.remove(); }, 500);
            localStorage.setItem('insel-genesis-seen', '1');
        });

        runNext();
        return true;
    }

    function gridHasContent(grid, rows, cols) {
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (grid[r] && grid[r][c] !== null) return true;
            }
        }
        return false;
    }

})();
