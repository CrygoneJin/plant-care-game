// === FARBRAUM-EVOLUTION — Die Insel lernt Farben sehen ===
// Wie die Geschichte der Displays:
// Bleistift → Schwarz-Weiß → Gameboy → Gameboy Color → Vollfarbe
//
// Fortschritt schaltet Farben frei. Die Welt wird bunter je mehr du baust.

(function () {
    'use strict';

    // Die 5 Ären der Farbe
    const ERAS = [
        { id: 'gray', name: 'Skizze',          emoji: '✏️',  threshold: 0,   desc: 'Alles beginnt als Bleistift-Zeichnung' },
        { id: 'bw',   name: 'Schwarz-Weiß',    emoji: '📺',  threshold: 10,  desc: 'Die ersten Kontraste entstehen' },
        { id: 'dmg',  name: 'Gameboy',          emoji: '🎮',  threshold: 30,  desc: 'Vier Grüntöne — mehr braucht kein Held' },
        { id: 'gbc',  name: 'Gameboy Color',    emoji: '🌈',  threshold: 60,  desc: 'Die Welt bekommt Farbe' },
        { id: 'full', name: 'Vollfarbe',        emoji: '🎨',  threshold: 100, desc: 'Alle Farben freigeschaltet!' },
    ];

    let currentEra = 'gray';
    let announcedEras = new Set(JSON.parse(localStorage.getItem('insel-color-eras') || '["gray"]'));

    function getProgress() {
        const grid = window.grid;
        if (!grid) return 0;

        // Fortschritt = Kombination aus:
        // - Anzahl platzierter Blöcke (40%)
        // - Verschiedene Materialien benutzt (30%)
        // - Abgeschlossene Quests (30%)
        const totalCells = grid.length * grid[0].length;
        let placed = 0;
        const materials = new Set();

        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c]) {
                    placed++;
                    materials.add(grid[r][c]);
                }
            }
        }

        const completedQuests = JSON.parse(localStorage.getItem('insel-quests-done') || '[]').length;
        const maxQuests = 20; // Nach 20 Quests = volle Punktzahl

        const blockScore = Math.min(100, (placed / totalCells) * 250); // 40% der Insel = 100 Punkte
        const matScore = Math.min(100, (materials.size / 15) * 100);   // 15 verschiedene = 100 Punkte
        const questScore = Math.min(100, (completedQuests / maxQuests) * 100);

        return Math.round(blockScore * 0.4 + matScore * 0.3 + questScore * 0.3);
    }

    function getEraForProgress(progress) {
        let era = ERAS[0];
        for (const e of ERAS) {
            if (progress >= e.threshold) era = e;
        }
        return era;
    }

    function update() {
        const progress = getProgress();
        const era = getEraForProgress(progress);

        if (era.id !== currentEra) {
            currentEra = era.id;
            document.documentElement.setAttribute('data-color-era', era.id);

            // Erstmalige Freischaltung → Toast + Feier
            if (!announcedEras.has(era.id)) {
                announcedEras.add(era.id);
                localStorage.setItem('insel-color-eras', JSON.stringify([...announcedEras]));

                if (window.showToast) {
                    window.showToast(`${era.emoji} ${era.name} freigeschaltet! ${era.desc}`);
                }

                // Bei Vollfarbe: kurzes Feuerwerk
                if (era.id === 'full') {
                    celebrateFullColor();
                }
            }
        }
    }

    function celebrateFullColor() {
        // Canvas kurz blinken lassen
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        canvas.style.transition = 'filter 0.5s';
        canvas.style.filter = 'brightness(1.5) saturate(1.5)';
        setTimeout(() => {
            canvas.style.filter = '';
            canvas.style.transition = 'filter 2s ease-in-out';
        }, 1000);
    }

    // --- Init ---
    function init() {
        // Gespeicherte Era laden
        const savedEras = JSON.parse(localStorage.getItem('insel-color-eras') || '["gray"]');
        announcedEras = new Set(savedEras);

        // Sofort prüfen
        update();

        // Alle 5 Sekunden prüfen (leichtgewichtig)
        setInterval(update, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Kurz warten bis grid initialisiert ist
        setTimeout(init, 500);
    }

    // --- Public API ---
    window.ColorEra = {
        update: update,
        get current() { return currentEra; },
        get progress() { return getProgress(); },
        get eras() { return ERAS; },
        // Manuell setzen (für Tests / Cheats)
        set: function (eraId) {
            const era = ERAS.find(e => e.id === eraId);
            if (era) {
                currentEra = eraId;
                document.documentElement.setAttribute('data-color-era', eraId);
            }
        },
    };

})();
