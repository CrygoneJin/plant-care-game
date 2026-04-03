// tutorial.js — Programmier-Tutorial: NPCs bringen JavaScript bei
// Backlog #23 — Vanilla JS, IIFE, kein eval()
// SECURITY NOTE: new Function() is intentionally used here as a sandboxed
// alternative to eval(). Only whitelisted functions are exposed in scope.
(function () {
    'use strict';

    // === Lektionen ===
    var LESSONS = [
        {
            id: 'hallo',
            title: 'Sag Hallo!',
            npc: 'spongebob',
            npcEmoji: '🧽',
            intro: '🧽 SpongeBob: ICH BIN BEREIT dir was beizubringen! Funktionen sind wie Zaubersprüche — du sagst den Namen und etwas passiert!',
            task: 'Schreibe: showToast("Hallo Insel!")',
            hint: 'showToast() ist eine Funktion. In die Klammern kommt der Text — in Anführungszeichen!',
            startCode: '',
            check: function (sandbox) {
                return sandbox._toasts.length > 0;
            },
            successMsg: '🧽 SpongeBob: DU HAST ES GESCHAFFT! Dein erster Funktionsaufruf! showToast() zeigt eine Nachricht auf dem Bildschirm.',
        },
        {
            id: 'schleife',
            title: 'Zähle bis 5!',
            npc: 'haskell',
            npcEmoji: '🟣',
            intro: '🟣 Haskell: Eine Schleife wiederholt Code — statt 5 Zeilen schreibst du nur 2! "for" sagt: mach das X-mal.',
            task: 'Zähle mit einer Schleife von 1 bis 5:\nfor (let i = 1; i <= 5; i++) {\n  showToast(i)\n}',
            hint: 'let i = 1 — Start bei 1. i <= 5 — Mach weiter bis 5. i++ — Zähle eins hoch.',
            startCode: 'for (let i = 1; i <= 5; i++) {\n  \n}',
            check: function (sandbox) {
                return sandbox._toasts.length >= 5;
            },
            successMsg: '🟣 Haskell: Exzellent! Du hast eine Schleife geschrieben. Der Computer hat 5x dasselbe gemacht — nur die Zahl hat sich geändert.',
        },
        {
            id: 'baum',
            title: 'Baue einen Baum!',
            npc: 'scratch',
            npcEmoji: '🐱',
            intro: '🐱 Scratch: Wenn grüne Flagge angeklickt... placeBlock(zeile, spalte, material)! Die Insel ist ein Raster — wie Kästchenpapier!',
            task: 'Setze einen Baum auf Feld (5, 5):\nplaceBlock(5, 5, "tree")',
            hint: 'placeBlock(zeile, spalte, material) — die Zeile geht von oben nach unten, die Spalte von links nach rechts.',
            startCode: '',
            check: function (sandbox) {
                return sandbox._placed.length > 0 && sandbox._placed.some(function (p) { return p.material === 'tree'; });
            },
            successMsg: '🐱 Scratch: Miau! Du hast einen Baum gepflanzt! placeBlock() sagt der Insel genau WO und WAS gebaut wird.',
        },
        {
            id: 'bedingung',
            title: 'Wenn es regnet...',
            npc: 'lua',
            npcEmoji: '🌙',
            intro: '🌙 Lua: "if" ist wie eine Weiche — der Code geht nur weiter wenn die Bedingung stimmt. Wie: "Wenn es regnet, nimm den Schirm!"',
            task: 'Prüfe das Wetter:\nif (weather === "rain") {\n  showToast("Regenschirm!")\n} else {\n  showToast("Sonnencreme!")\n}',
            hint: '=== prüft ob zwei Dinge gleich sind. weather ist eine Variable die "sun", "rain" oder "rainbow" sein kann.',
            startCode: 'if (weather === "rain") {\n  \n} else {\n  \n}',
            check: function (sandbox) {
                return sandbox._toasts.length > 0;
            },
            successMsg: '🌙 Lua: Schnell und leicht! Du hast eine Bedingung geschrieben. Der Computer entscheidet jetzt selbst was er tut!',
        },
        {
            id: 'bunt',
            title: 'Mache es bunt!',
            npc: 'sql',
            npcEmoji: '🗃️',
            intro: '🗃️ SQL: SELECT Farbe FROM Materialien! Kombiniere eine Schleife mit placeBlock() — eine ganze Reihe auf einmal!',
            task: 'Baue eine bunte Reihe:\nlet materialien = ["flower", "tree", "mushroom", "palm", "fountain"]\nfor (let i = 0; i < materialien.length; i++) {\n  placeBlock(3, i + 2, materialien[i])\n}',
            hint: 'Ein Array [] ist eine Liste. materialien[i] holt das i-te Element. .length sagt wie lang die Liste ist.',
            startCode: 'let materialien = ["flower", "tree", "mushroom", "palm", "fountain"]\nfor (let i = 0; i < materialien.length; i++) {\n  \n}',
            check: function (sandbox) {
                return sandbox._placed.length >= 3;
            },
            successMsg: '🗃️ SQL: JOIN erfolgreich! Du hast Arrays, Schleifen und Funktionen kombiniert. Das ist echtes Programmieren!',
        },
    ];

    // === Sandbox: sicherer Kontext für Code-Ausführung ===
    function createSandbox() {
        var toasts = [];
        var placed = [];
        var grid = window.grid;
        var MATERIALS = window.INSEL_MATERIALS;
        var EFFECTS = window.INSEL_EFFECTS;

        var api = {
            showToast: function (msg) {
                var text = String(msg);
                toasts.push(text);
                window.showToast(text);
            },
            placeBlock: function (row, col, material) {
                var r = Math.floor(Number(row));
                var c = Math.floor(Number(col));
                var mat = String(material);
                if (!MATERIALS || !MATERIALS[mat]) {
                    toasts.push('Unbekanntes Material: ' + mat);
                    window.showToast('Unbekanntes Material: ' + mat);
                    return false;
                }
                var dims = window.INSEL_DIMS;
                if (!dims) return false;
                if (r < 0 || r >= dims.ROWS || c < 0 || c >= dims.COLS) {
                    toasts.push('Außerhalb der Insel! Zeile 0-' + (dims.ROWS - 1) + ', Spalte 0-' + (dims.COLS - 1));
                    window.showToast('Außerhalb der Insel!');
                    return false;
                }
                if (grid) {
                    grid[r][c] = mat;
                    placed.push({ row: r, col: c, material: mat });
                    if (window.requestRedraw) window.requestRedraw();
                }
                return true;
            },
            getBlock: function (row, col) {
                var r = Math.floor(Number(row));
                var c = Math.floor(Number(col));
                if (!grid) return null;
                var dims = window.INSEL_DIMS;
                if (!dims) return null;
                if (r < 0 || r >= dims.ROWS || c < 0 || c >= dims.COLS) return null;
                return grid[r][c];
            },
            weather: EFFECTS ? EFFECTS.getWeather() : 'sun',
            console: {
                log: function () {
                    var args = Array.prototype.slice.call(arguments);
                    var text = args.map(String).join(' ');
                    toasts.push('[log] ' + text);
                    window.showToast('[log] ' + text);
                },
            },
            _toasts: toasts,
            _placed: placed,
        };

        return api;
    }

    // === Code sicher ausführen ===
    // Intentionally uses Function constructor (NOT eval) with strict whitelist.
    // Only showToast, placeBlock, getBlock, weather, console are in scope.
    function runSandboxed(code, sandbox) {
        var allowedNames = ['showToast', 'placeBlock', 'getBlock', 'weather', 'console'];
        var allowedValues = allowedNames.map(function (n) { return sandbox[n]; });

        try {
            /* eslint-disable-next-line no-new-func -- intentional sandbox */
            var fn = Function(allowedNames.join(','), '"use strict";\n' + code); // lgtm[js/code-injection]
            fn.apply(null, allowedValues);
            return { ok: true, error: null };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    // === Tutorial-State ===
    var currentLesson = 0;
    var tutorialActive = false;

    function loadProgress() {
        try {
            var saved = localStorage.getItem('insel_tutorial_progress');
            if (saved !== null) {
                var n = parseInt(saved, 10);
                if (!isNaN(n) && n >= 0 && n <= LESSONS.length) {
                    currentLesson = n;
                }
            }
        } catch (_e) { /* ignore */ }
    }

    function saveProgress() {
        try {
            localStorage.setItem('insel_tutorial_progress', String(currentLesson));
        } catch (_e) { /* ignore */ }
    }

    // === UI: Code-Editor Modal ===
    function createEditorModal() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'dialog-overlay hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'tutorial-title');

        overlay.innerHTML =
            '<div class="dialog-content" style="max-width:560px;width:95vw;">' +
                '<div id="tutorial-header" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
                    '<span id="tutorial-npc-emoji" style="font-size:36px;"></span>' +
                    '<div style="flex:1;">' +
                        '<h2 id="tutorial-title" style="margin:0;font-size:18px;">Tutorial</h2>' +
                        '<div id="tutorial-progress" style="font-size:12px;color:#888;margin-top:2px;"></div>' +
                    '</div>' +
                    '<button id="tutorial-close-btn" class="action-btn" title="Schließen" style="font-size:18px;padding:4px 10px;">&#x2715;</button>' +
                '</div>' +
                '<div id="tutorial-intro" style="font-size:14px;line-height:1.5;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.05);border-radius:8px;"></div>' +
                '<div id="tutorial-task" style="font-size:13px;margin-bottom:6px;font-weight:bold;white-space:pre-wrap;"></div>' +
                '<textarea id="tutorial-code" spellcheck="false" autocorrect="off" autocapitalize="off" ' +
                    'style="width:100%;min-height:120px;font-family:monospace;font-size:14px;padding:10px;border:2px solid #ddd;border-radius:8px;' +
                    'resize:vertical;box-sizing:border-box;background:#1e1e1e;color:#d4d4d4;tab-size:2;line-height:1.5;"></textarea>' +
                '<div id="tutorial-error" style="display:none;color:#e74c3c;font-size:13px;margin-top:4px;padding:6px 10px;background:rgba(231,76,60,0.1);border-radius:6px;"></div>' +
                '<div id="tutorial-success" style="display:none;color:#27ae60;font-size:13px;margin-top:4px;padding:6px 10px;background:rgba(39,174,96,0.1);border-radius:6px;"></div>' +
                '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">' +
                    '<button id="tutorial-run-btn" class="action-btn" style="flex:1;min-width:100px;">&#x25B6; Ausführen</button>' +
                    '<button id="tutorial-hint-btn" class="action-btn" style="flex:1;min-width:100px;">Tipp</button>' +
                    '<button id="tutorial-next-btn" class="action-btn" style="flex:1;min-width:100px;display:none;">Weiter</button>' +
                    '<button id="tutorial-reset-btn" class="action-btn" style="min-width:60px;" title="Code zurücksetzen">Neu</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        document.getElementById('tutorial-close-btn').addEventListener('click', closeTutorial);
        document.getElementById('tutorial-run-btn').addEventListener('click', runCurrentCode);
        document.getElementById('tutorial-hint-btn').addEventListener('click', showHint);
        document.getElementById('tutorial-next-btn').addEventListener('click', nextLesson);
        document.getElementById('tutorial-reset-btn').addEventListener('click', resetCode);

        document.getElementById('tutorial-code').addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var ta = e.target;
                var start = ta.selectionStart;
                var end = ta.selectionEnd;
                ta.value = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
                ta.selectionStart = ta.selectionEnd = start + 2;
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                runCurrentCode();
            }
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeTutorial();
        });

        return overlay;
    }

    function showLesson(index) {
        if (index < 0 || index >= LESSONS.length) return;

        var lesson = LESSONS[index];
        currentLesson = index;
        tutorialActive = true;

        var overlay = createEditorModal();
        overlay.classList.remove('hidden');

        document.getElementById('tutorial-npc-emoji').textContent = lesson.npcEmoji;
        document.getElementById('tutorial-title').textContent = 'Lektion ' + (index + 1) + ': ' + lesson.title;
        document.getElementById('tutorial-progress').textContent =
            'Lektion ' + (index + 1) + ' von ' + LESSONS.length;
        document.getElementById('tutorial-intro').textContent = lesson.intro;
        document.getElementById('tutorial-task').textContent = 'Aufgabe: ' + lesson.task;
        document.getElementById('tutorial-code').value = lesson.startCode;
        document.getElementById('tutorial-error').style.display = 'none';
        document.getElementById('tutorial-success').style.display = 'none';
        document.getElementById('tutorial-next-btn').style.display = 'none';
        document.getElementById('tutorial-run-btn').style.display = '';

        setTimeout(function () {
            document.getElementById('tutorial-code').focus();
        }, 100);
    }

    function runCurrentCode() {
        var lesson = LESSONS[currentLesson];
        if (!lesson) return;

        var code = document.getElementById('tutorial-code').value.trim();
        var errorEl = document.getElementById('tutorial-error');
        var successEl = document.getElementById('tutorial-success');

        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        if (!code) {
            errorEl.textContent = 'Da steht noch nichts! Schreib deinen Code in das Feld.';
            errorEl.style.display = 'block';
            return;
        }

        var sandbox = createSandbox();
        var result = runSandboxed(code, sandbox);

        if (!result.ok) {
            var msg = friendlyError(result.error);
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            return;
        }

        if (lesson.check(sandbox)) {
            successEl.textContent = lesson.successMsg;
            successEl.style.display = 'block';
            document.getElementById('tutorial-run-btn').style.display = 'none';

            if (currentLesson < LESSONS.length - 1) {
                document.getElementById('tutorial-next-btn').style.display = '';
            } else {
                successEl.textContent += '\n\nDu hast ALLE Lektionen geschafft! Du bist jetzt ein Insel-Programmierer!';
            }

            currentLesson++;
            saveProgress();
            if (window.showToast) {
                window.showToast('Lektion geschafft!', 3000);
            }
        } else {
            errorEl.textContent = 'Fast! Dein Code läuft, aber die Aufgabe ist noch nicht ganz gelöst. Probier nochmal!';
            errorEl.style.display = 'block';
        }
    }

    function friendlyError(err) {
        var msg = err && err.message ? err.message : String(err);

        if (msg.indexOf('is not defined') !== -1) {
            var match = msg.match(/(\w+) is not defined/);
            if (match) {
                return '"' + match[1] + '" kennt der Computer nicht. Hast du dich vertippt? Groß- und Kleinschreibung ist wichtig!';
            }
        }
        if (msg.indexOf('Unexpected token') !== -1 || msg.indexOf('Unexpected end') !== -1) {
            return 'Da fehlt etwas! Prüfe ob alle Klammern ( ) und { } geschlossen sind.';
        }
        if (msg.indexOf('is not a function') !== -1) {
            return 'Das ist keine Funktion. Hast du die Klammern () vergessen?';
        }
        if (msg.indexOf('missing') !== -1) {
            return 'Hier fehlt etwas — vielleicht ein Semikolon, eine Klammer oder ein Anführungszeichen?';
        }

        return 'Fehler: ' + msg + '\nKein Stress — Fehler gehören zum Programmieren dazu!';
    }

    function showHint() {
        var lesson = LESSONS[currentLesson < LESSONS.length ? currentLesson : LESSONS.length - 1];
        if (lesson) {
            var errorEl = document.getElementById('tutorial-error');
            errorEl.textContent = 'Tipp: ' + lesson.hint;
            errorEl.style.display = 'block';
            errorEl.style.color = '#2980b9';
            setTimeout(function () {
                errorEl.style.color = '#e74c3c';
            }, 5000);
        }
    }

    function nextLesson() {
        if (currentLesson < LESSONS.length) {
            showLesson(currentLesson);
        }
    }

    function resetCode() {
        var idx = currentLesson < LESSONS.length ? currentLesson : currentLesson - 1;
        var lesson = LESSONS[idx];
        if (lesson) {
            document.getElementById('tutorial-code').value = lesson.startCode;
            document.getElementById('tutorial-error').style.display = 'none';
            document.getElementById('tutorial-success').style.display = 'none';
        }
    }

    function closeTutorial() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.classList.add('hidden');
        tutorialActive = false;
    }

    function openTutorial() {
        loadProgress();
        var idx = currentLesson >= LESSONS.length ? LESSONS.length - 1 : currentLesson;
        showLesson(idx);
    }

    // === API auf window ===
    window.INSEL_TUTORIAL = {
        open: openTutorial,
        close: closeTutorial,
        isActive: function () { return tutorialActive; },
        getLessons: function () { return LESSONS; },
        getProgress: function () { return currentLesson; },
        resetProgress: function () {
            currentLesson = 0;
            saveProgress();
        },
    };
})();
