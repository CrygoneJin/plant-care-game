// === VIRTUAL GAMEPAD — Zelda-Feeling auf Touch ===
// D-Pad links, A/B rechts. Wie ein Gameboy. Nur ohne Batterien.

(function () {
    'use strict';

    // Nur auf Touch-Geräten anzeigen
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    // State
    let activeDirection = null;
    let moveInterval = null;
    const MOVE_REPEAT_MS = 150; // Wiederholrate bei gehaltenem D-Pad
    let gameboyMode = false;

    function createGamepad() {
        // Container
        const pad = document.createElement('div');
        pad.id = 'virtual-gamepad';
        pad.innerHTML = `
            <div class="gamepad-dpad">
                <button class="dpad-btn dpad-up" data-dir="up" aria-label="Hoch">▲</button>
                <div class="dpad-middle">
                    <button class="dpad-btn dpad-left" data-dir="left" aria-label="Links">◀</button>
                    <div class="dpad-center"></div>
                    <button class="dpad-btn dpad-right" data-dir="right" aria-label="Rechts">▶</button>
                </div>
                <button class="dpad-btn dpad-down" data-dir="down" aria-label="Runter">▼</button>
            </div>
            <div class="gamepad-buttons">
                <button class="action-btn-gp btn-b" data-action="b" aria-label="B — Aufnehmen">B</button>
                <button class="action-btn-gp btn-a" data-action="a" aria-label="A — Bauen">A</button>
            </div>
            <div class="gamepad-select">
                <button class="select-btn" data-action="select" aria-label="Material wechseln">SELECT</button>
                <button class="select-btn" data-action="start" aria-label="Menü">START</button>
            </div>
        `;
        document.body.appendChild(pad);

        // --- D-Pad Events ---
        const dirMap = {
            up:    { dr: -1, dc: 0 },
            down:  { dr: 1, dc: 0 },
            left:  { dr: 0, dc: -1 },
            right: { dr: 0, dc: 1 },
        };

        function startMove(dir) {
            if (activeDirection === dir) return;
            stopMove();
            activeDirection = dir;
            const { dr, dc } = dirMap[dir];
            // Sofort bewegen
            doMove(dr, dc);
            // Bei Halten: wiederholen
            moveInterval = setInterval(() => doMove(dr, dc), MOVE_REPEAT_MS);
        }

        function stopMove() {
            activeDirection = null;
            if (moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        }

        function doMove(dr, dc) {
            // Koop: Wenn Spieler 2 aktiv und Touch → P2 steuern? Nein, Touch = immer P1.
            if (typeof window.movePlayer === 'function') {
                window.movePlayer(dr, dc);
            }
        }

        // D-Pad Touch Events
        pad.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                startMove(btn.dataset.dir);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
                stopMove();
            });
            btn.addEventListener('touchcancel', () => {
                btn.classList.remove('pressed');
                stopMove();
            });
        });

        // --- Action Buttons ---
        pad.querySelectorAll('.action-btn-gp').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                const action = btn.dataset.action;
                if (action === 'a') {
                    // A = Bauen an Spielerposition
                    if (window.applyToolAt && window.playerPos) {
                        const pos = window.playerPos();
                        window.applyToolAt(pos.r, pos.c, 'build');
                    }
                } else if (action === 'b') {
                    // B = Ernten an Spielerposition
                    if (window.applyToolAt && window.playerPos) {
                        const pos = window.playerPos();
                        window.applyToolAt(pos.r, pos.c, 'harvest');
                    }
                }
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
        });

        // --- Select/Start ---
        pad.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                const action = btn.dataset.action;
                if (action === 'select') {
                    // SELECT = Nächstes Material durchschalten
                    if (window.cycleMaterial) window.cycleMaterial();
                } else if (action === 'start') {
                    // START = Werkbank öffnen
                    const craftBtn = document.getElementById('craft-btn');
                    if (craftBtn) craftBtn.click();
                }
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
        });

        return pad;
    }

    // --- Gameboy-Modus Toggle ---
    function enableGameboyMode() {
        gameboyMode = true;
        document.documentElement.setAttribute('data-gameboy', 'true');
        const pad = document.getElementById('virtual-gamepad');
        if (pad) pad.classList.add('visible');
        // Toolbar minimieren auf Touch
        const toolbar = document.getElementById('toolbar');
        if (toolbar) toolbar.classList.add('gameboy-compact');
        if (window.showToast) window.showToast('🎮 Gameboy-Modus aktiviert!');
    }

    function disableGameboyMode() {
        gameboyMode = false;
        document.documentElement.removeAttribute('data-gameboy');
        const pad = document.getElementById('virtual-gamepad');
        if (pad) pad.classList.remove('visible');
        const toolbar = document.getElementById('toolbar');
        if (toolbar) toolbar.classList.remove('gameboy-compact');
    }

    // --- Init ---
    let padElement = null;

    function init() {
        padElement = createGamepad();
        // Auto-Enable auf Touch-Geräten
        if (isTouchDevice) {
            enableGameboyMode();
        }
    }

    // Warten bis DOM fertig
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --- Public API ---
    window.Gamepad = {
        enable: enableGameboyMode,
        disable: disableGameboyMode,
        get active() { return gameboyMode; },
        get isTouch() { return isTouchDevice; },
    };

})();
