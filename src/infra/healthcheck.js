// === HEALTHCHECK — DNA-Autoreparatur für die Insel ===
// Mismatch Repair, Telomere, Apoptose, Immunsystem.
// Läuft alle 60s im Hintergrund. Kein UI, kein Overhead.

(function () {
    'use strict';

    // --- Telomere: harte Budgets ---
    const MAX_LLM_CRAFT_KEYS = 200;
    const MAX_LLM_MATERIALS = 500;
    const MAX_EASTER_EGGS = 100;
    const STORAGE_WARN_BYTES = 3 * 1024 * 1024; // 3MB
    const CHECKUP_INTERVAL = 60000; // 60s

    // --- Mismatch Repair: localStorage LRU ---
    function pruneLocalStorageLRU() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('llm-craft:')) {
                keys.push(key);
            }
        }

        if (keys.length <= MAX_LLM_CRAFT_KEYS) return 0;

        // Älteste zuerst löschen (kein Timestamp → FIFO nach Einfügereihenfolge)
        // localStorage hat keine Sortiergarantie, aber Praxis: chronologisch.
        // Sicherheitshalber: zufällig die Hälfte löschen (besser als Crash).
        const toDelete = keys.slice(0, keys.length - MAX_LLM_CRAFT_KEYS);
        for (const key of toDelete) {
            localStorage.removeItem(key);
        }
        return toDelete.length;
    }

    // --- Mismatch Repair: LLM-Materialien begrenzen ---
    function pruneLlmMaterials() {
        try {
            const stored = JSON.parse(localStorage.getItem('insel-llm-materials') || '{}');
            const keys = Object.keys(stored);
            if (keys.length <= MAX_LLM_MATERIALS) return 0;

            // Älteste löschen (Object-Keys sind in Einfügereihenfolge seit ES2015)
            const toDelete = keys.slice(0, keys.length - MAX_LLM_MATERIALS);
            for (const key of toDelete) {
                delete stored[key];
            }
            localStorage.setItem('insel-llm-materials', JSON.stringify(stored));
            return toDelete.length;
        } catch (e) {
            return 0;
        }
    }

    // --- Excision Repair: Easter-Eggs FIFO ---
    function pruneEasterEggs() {
        try {
            const eggs = JSON.parse(localStorage.getItem('insel-easter-eggs') || '[]');
            if (eggs.length <= MAX_EASTER_EGGS) return 0;
            const trimmed = eggs.slice(eggs.length - MAX_EASTER_EGGS);
            localStorage.setItem('insel-easter-eggs', JSON.stringify(trimmed));
            return eggs.length - trimmed.length;
        } catch (e) {
            return 0;
        }
    }

    // --- Grid-Integrität: unbekannte Material-IDs → null ---
    function repairGrid() {
        const grid = window.grid;
        const materials = window.INSEL_MATERIALS;
        if (!grid || !materials) return 0;

        let repaired = 0;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < (grid[r]?.length || 0); c++) {
                const cell = grid[r][c];
                if (cell && !materials[cell]) {
                    grid[r][c] = null;
                    repaired++;
                }
            }
        }
        return repaired;
    }

    // --- Immunsystem: localStorage-Größe schätzen ---
    function estimateStorageSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                total += key.length + (localStorage.getItem(key) || '').length;
            }
        }
        return total * 2; // UTF-16 = 2 Bytes pro Char
    }

    // --- Hauptroutine ---
    function checkup() {
        const report = {
            ts: new Date().toISOString(),
            craftKeysPruned: pruneLocalStorageLRU(),
            llmMatsPruned: pruneLlmMaterials(),
            eggsPruned: pruneEasterEggs(),
            gridRepaired: repairGrid(),
            storageBytes: estimateStorageSize(),
        };

        // Immunsystem: warnen bei hohem Speicherverbrauch
        if (report.storageBytes > STORAGE_WARN_BYTES) {
            console.warn('[Healthcheck] localStorage bei ' +
                Math.round(report.storageBytes / 1024 / 1024 * 10) / 10 + 'MB — Limit ist 5MB');
        }

        // Nur loggen wenn Reparaturen stattfanden
        const totalRepairs = report.craftKeysPruned + report.llmMatsPruned +
            report.eggsPruned + report.gridRepaired;
        if (totalRepairs > 0) {
            console.log('[Healthcheck] Repariert:', report);
            if (typeof window.requestRedraw === 'function') window.requestRedraw();
        }

        return report;
    }

    // Erster Checkup nach 5s (nicht beim Laden blockieren)
    setTimeout(checkup, 5000);
    // Dann alle 60s
    setInterval(checkup, CHECKUP_INTERVAL);

    // Vor dem Schließen nochmal aufräumen
    window.addEventListener('beforeunload', checkup);

    // Export für Tests / Feynman-Audit
    window.INSEL_HEALTHCHECK = { checkup, estimateStorageSize };
})();
