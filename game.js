// === SCHNIPSELS INSEL-ARCHITEKT ===

(function () {
    'use strict';

    // --- Konfiguration ---
    const COLS = 24;
    const ROWS = 16;
    const WATER_BORDER = 2; // Zellen Wasser um die Insel

    // Dynamische Zellgröße basierend auf Bildschirm
    function calcCellSize() {
        const isMobile = window.innerWidth < 768;
        const totalCols = COLS + WATER_BORDER * 2;
        const totalRows = ROWS + WATER_BORDER * 2;

        if (isMobile) {
            // Canvas soll die volle Breite nutzen, mit etwas Padding
            const availW = window.innerWidth - 16;
            const availH = window.innerHeight * 0.55; // ~55% der Höhe für Canvas
            return Math.max(12, Math.min(
                Math.floor(availW / totalCols),
                Math.floor(availH / totalRows)
            ));
        }
        // Desktop: verfügbare Höhe abzüglich Header+Toolbar (~100px), mit Seitenleisten (~300px)
        const availW = window.innerWidth - 320;
        const availH = window.innerHeight - 110;
        return Math.max(20, Math.min(
            Math.floor(availW / totalCols),
            Math.floor(availH / totalRows)
        ));
    }

    let CELL_SIZE = calcCellSize();

    // --- Materialien ---
    const MATERIALS = {
        // === DIE 5 ELEMENTE (五行 Wu Xing) ===
        metal:    { emoji: '⚙️', label: 'Metall',   color: '#C0C0C0', border: '#A0A0A0' },
        wood:     { emoji: '🪵', label: 'Holz',     color: '#8B5E3C', border: '#6B3F1F' },
        fire:     { emoji: '🔥', label: 'Feuer',    color: '#E67E22', border: '#D35400' },
        water:    { emoji: '🌊', label: 'Wasser',   color: '#3498DB', border: '#2980B9' },
        earth:    { emoji: '🟫', label: 'Erde',     color: '#8B6914', border: '#6B4F0A' },
        // === ABGELEITETE MATERIALIEN ===
        stone:    { emoji: '🧱', label: 'Stein',    color: '#95A5A6', border: '#7F8C8D' },
        glass:    { emoji: '🪟', label: 'Glas',     color: '#AED6F1', border: '#85C1E9' },
        plant:    { emoji: '🌿', label: 'Pflanze',  color: '#52BE80', border: '#27AE60' },
        sapling:  { emoji: '🌱', label: 'Setzling', color: '#7DCEA0', border: '#52BE80' },
        small_tree: { emoji: '🌲', label: 'Kleiner Baum', color: '#229954', border: '#1E8449' },
        tree:     { emoji: '🌳', label: 'Baum',     color: '#1E8449', border: '#196F3D' },
        flower:   { emoji: '🌸', label: 'Blume',    color: '#F1948A', border: '#E74C3C' },
        door:     { emoji: '🚪', label: 'Tür',      color: '#6E3B1A', border: '#4A2510' },
        roof:     { emoji: '🏠', label: 'Dach',     color: '#E74C3C', border: '#C0392B' },
        lamp:     { emoji: '💡', label: 'Lampe',    color: '#F9E79F', border: '#F1C40F' },
        sand:     { emoji: '⬜', label: 'Sand',     color: '#F5DEB3', border: '#DCC89E' },
        path:     { emoji: '🟫', label: 'Weg',      color: '#A0522D', border: '#8B4513' },
        fence:    { emoji: '🏗️', label: 'Zaun',     color: '#C4A265', border: '#A08040' },
        boat:     { emoji: '⛵', label: 'Boot',     color: '#5DADE2', border: '#2E86C1' },
        fish:     { emoji: '🐟', label: 'Fisch',    color: '#48C9B0', border: '#1ABC9C' },
        fountain: { emoji: '⛲', label: 'Brunnen',  color: '#7FB3D8', border: '#5499C7' },
        flag:     { emoji: '🚩', label: 'Flagge',   color: '#E74C3C', border: '#B03A2E' },
        bridge:   { emoji: '🌉', label: 'Brücke',   color: '#B7950B', border: '#9A7D0A' },
        cactus:   { emoji: '🌵', label: 'Kaktus',   color: '#28B463', border: '#1D8348' },
        mushroom: { emoji: '🍄', label: 'Pilz',     color: '#E59866', border: '#CA6F1E' },
        planks:   { emoji: '🪵', label: 'Bretter',  color: '#C19A6B', border: '#A0784A' },
        window_pane: { emoji: '🪟', label: 'Fenster', color: '#D4EFFC', border: '#AED6F1' },
        // === MAGISCHE ARTEFAKTE ===
        steam:    { emoji: '💨', label: 'Dampf',    color: '#D5D8DC', border: '#AEB6BF' },
        ice:      { emoji: '🧊', label: 'Eis',      color: '#D6EAF8', border: '#AED6F1' },
        snow:     { emoji: '❄️', label: 'Schnee',   color: '#EBF5FB', border: '#D6EAF8' },
        cloud:    { emoji: '☁️', label: 'Wolke',    color: '#F2F4F4', border: '#D5D8DC' },
        rain:     { emoji: '🌧️', label: 'Regen',   color: '#85C1E9', border: '#5DADE2' },
        rainbow:  { emoji: '🌈', label: 'Regenbogen', color: '#F9E79F', border: '#F4D03F' },
        sun:      { emoji: '☀️', label: 'Sonne',    color: '#F9E79F', border: '#F1C40F' },
        star:     { emoji: '⭐', label: 'Stern',    color: '#F9E79F', border: '#F4D03F' },
        moon:     { emoji: '🌙', label: 'Mond',     color: '#F7DC6F', border: '#F1C40F' },
        lightning:{ emoji: '⚡', label: 'Blitz',    color: '#F7DC6F', border: '#F4D03F' },
        volcano:  { emoji: '🌋', label: 'Vulkan',   color: '#E74C3C', border: '#C0392B' },
        mountain: { emoji: '🏔️', label: 'Berg',    color: '#95A5A6', border: '#7F8C8D' },
        diamond:  { emoji: '💎', label: 'Diamant',  color: '#AED6F1', border: '#85C1E9' },
        sword:    { emoji: '⚔️', label: 'Schwert',  color: '#BDC3C7', border: '#95A5A6' },
        shield:   { emoji: '🛡️', label: 'Schild',  color: '#F0B27A', border: '#E59866' },
        crown:    { emoji: '👑', label: 'Krone',    color: '#F9E79F', border: '#F4D03F' },
        key:      { emoji: '🔑', label: 'Schlüssel', color: '#F9E79F', border: '#F4D03F' },
        treasure: { emoji: '💰', label: 'Schatz',   color: '#F9E79F', border: '#F4D03F' },
        dragon:   { emoji: '🐉', label: 'Drache',   color: '#27AE60', border: '#1E8449' },
        unicorn:  { emoji: '🦄', label: 'Einhorn',  color: '#D2B4DE', border: '#BB8FCE' },
        ghost:    { emoji: '👻', label: 'Geist',    color: '#F2F4F4', border: '#D5D8DC' },
        alien:    { emoji: '👽', label: 'Alien',    color: '#82E0AA', border: '#58D68D' },
        robot:    { emoji: '🤖', label: 'Roboter',  color: '#AEB6BF', border: '#85929E' },
        potion:   { emoji: '🧪', label: 'Trank',    color: '#AF7AC5', border: '#8E44AD' },
        crystal:  { emoji: '🔮', label: 'Kristall', color: '#D2B4DE', border: '#BB8FCE' },
        egg:      { emoji: '🥚', label: 'Ei',       color: '#FDEBD0', border: '#FAD7A0' },
        nest:     { emoji: '🪺', label: 'Nest',     color: '#D4AC0D', border: '#B7950B' },
        butterfly:{ emoji: '🦋', label: 'Schmetterling', color: '#85C1E9', border: '#5DADE2' },
        bee:      { emoji: '🐝', label: 'Biene',    color: '#F9E79F', border: '#F4D03F' },
        honey:    { emoji: '🍯', label: 'Honig',    color: '#F0B27A', border: '#E59866' },
        apple:    { emoji: '🍎', label: 'Apfel',    color: '#E74C3C', border: '#C0392B' },
        cake:     { emoji: '🎂', label: 'Kuchen',   color: '#F1948A', border: '#E74C3C' },
        music:    { emoji: '🎵', label: 'Musik',    color: '#AF7AC5', border: '#8E44AD' },
        heart:    { emoji: '❤️', label: 'Herz',     color: '#E74C3C', border: '#C0392B' },
        skull:    { emoji: '💀', label: 'Skelett',  color: '#F2F4F4', border: '#D5D8DC' },
        poop:     { emoji: '💩', label: 'Haufen',   color: '#8B6914', border: '#6B4F0A' },
        rocket:   { emoji: '🚀', label: 'Rakete',   color: '#E74C3C', border: '#C0392B' },
        ufo:      { emoji: '🛸', label: 'UFO',      color: '#82E0AA', border: '#58D68D' },
        tornado:  { emoji: '🌪️', label: 'Tornado', color: '#AEB6BF', border: '#85929E' },
        wave:     { emoji: '🌊', label: 'Tsunami',  color: '#2980B9', border: '#1F618D' },
        phoenix:  { emoji: '🔥', label: 'Phönix',   color: '#F39C12', border: '#E67E22' },
    };

    // ============================================================
    // === SOUND === (→ sound.js bei Zellteilung)
    // ============================================================
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    let lastSoundTime = 0;
    const SOUND_THROTTLE = 60; // Max ~16 Töne/Sekunde, verhindert Oszillator-Überlauf

    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function canPlaySound() {
        const now = performance.now();
        if (now - lastSoundTime < SOUND_THROTTLE) return false;
        lastSoundTime = now;
        return true;
    }

    function playTone(freq, duration, type, vol) {
        try {
            const ctx = ensureAudio();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* Audio nicht verfügbar — kein Problem */ }
    }

    // Reicherer Sound: 2 Oszillatoren + leichtes Detune = Chorus-Effekt
    function playRichTone(freq, duration, type, vol) {
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            for (let detune of [0, 7]) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type || 'sine';
                osc.frequency.value = freq;
                osc.detune.value = detune;
                gain.gain.setValueAtTime((vol || 0.1) * 0.6, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + duration);
            }
        } catch (e) {}
    }

    // Modi — Kirchentonarten, Pythagoräische Stimmverhältnisse ab C4
    // Grundton × Intervall = reine Frequenz (Pythagoras + Bach)
    const C4 = 261.63;
    const SCALES = {
        // Dorisch (D-Modus): 1 9/8 32/27 4/3 3/2 27/16 16/9 2
        dorian:     [C4, C4*9/8, C4*32/27, C4*4/3, C4*3/2, C4*27/16, C4*16/9, C4*2, C4*9/4, C4*32/13.5, C4*8/3, C4*3],
        // Lydisch (F-Modus): 1 9/8 81/64 729/512 3/2 27/16 243/128 2
        lydian:     [C4, C4*9/8, C4*81/64, C4*729/512, C4*3/2, C4*27/16, C4*243/128, C4*2, C4*9/4, C4*81/32, C4*729/256, C4*3],
        // Mixolydisch (G-Modus): 1 9/8 81/64 4/3 3/2 27/16 16/9 2
        mixolydian: [C4, C4*9/8, C4*81/64, C4*4/3, C4*3/2, C4*27/16, C4*16/9, C4*2, C4*9/4, C4*81/32, C4*8/3, C4*3],
    };
    const SCALE_NAMES = Object.keys(SCALES);
    let currentScale = SCALES[SCALE_NAMES[Math.floor(Math.random() * SCALE_NAMES.length)]];
    let scaleChangeCounter = 0;

    const BUILD_WAVES = ['sine', 'triangle', 'square'];
    let lastBuildNote = -1;
    let buildNoteDir = 1;

    // === 五音 (Wǔ Yīn) — Die 5 Töne der chinesischen Pentatonik ===
    // Jedes Element hat seinen Ton: 宫商角徵羽 (Gōng Shāng Jué Zhǐ Yǔ)
    // Pythagoräische Stimmung aus reinen Quinten: C D E G A
    const ELEMENT_TONES = {
        // 土 Erde = 宫 Gōng (C) — Grundton, Fundament, Mitte
        earth:  { freq: C4,         wave: 'triangle', dur: 0.14, vol: 0.10 },
        // 金 Metall = 商 Shāng (D) — klar, schneidend, rein
        metal:  { freq: C4 * 9/8,   wave: 'square',   dur: 0.10, vol: 0.07 },
        // 木 Holz = 角 Jué (E) — warm, organisch, wachsend
        wood:   { freq: C4 * 81/64, wave: 'triangle', dur: 0.14, vol: 0.08 },
        // 火 Feuer = 徵 Zhǐ (G) — hell, energisch, aufsteigend
        fire:   { freq: C4 * 3/2,   wave: 'sawtooth', dur: 0.06, vol: 0.06 },
        // 水 Wasser = 羽 Yǔ (A) — fließend, weich, tief
        water:  { freq: C4 * 27/16, wave: 'sine',     dur: 0.18, vol: 0.08 },
    };

    function soundBuild(material) {
        if (!canPlaySound()) return;
        const tone = ELEMENT_TONES[material];
        if (tone) {
            // Element-Ton + leichte Variation
            const freq = tone.freq * (1 + (Math.random() - 0.5) * 0.02);
            playRichTone(freq, tone.dur + Math.random() * 0.04, tone.wave, tone.vol);
            return;
        }
        // Nicht-Basis-Materialien: melodische Skala wie bisher
        scaleChangeCounter++;
        if (scaleChangeCounter > 25 + Math.floor(Math.random() * 15)) {
            scaleChangeCounter = 0;
            currentScale = SCALES[SCALE_NAMES[Math.floor(Math.random() * SCALE_NAMES.length)]];
        }

        let idx;
        if (lastBuildNote < 0) {
            idx = Math.floor(Math.random() * currentScale.length);
        } else {
            if (Math.random() < 0.3) buildNoteDir *= -1;
            idx = lastBuildNote + buildNoteDir * (1 + Math.floor(Math.random() * 2));
            if (idx >= currentScale.length) { idx = currentScale.length - 2; buildNoteDir = -1; }
            if (idx < 0) { idx = 1; buildNoteDir = 1; }
        }
        lastBuildNote = idx;
        const type = BUILD_WAVES[Math.floor(Math.random() * BUILD_WAVES.length)];
        playRichTone(currentScale[idx], 0.06 + Math.random() * 0.06, type, 0.06 + Math.random() * 0.04);
    }
    function soundDemolish() {
        if (!canPlaySound()) return;
        const stats = typeof getGridStats === 'function' ? getGridStats() : { percent: 50 };
        const fillPercent = stats.percent || 0;
        const baseFreq = 120 + (fillPercent / 100) * 380;
        const freq = baseFreq + Math.random() * 60;
        const type = fillPercent < 20 ? 'sine' : 'sawtooth';
        playRichTone(freq, 0.18, type, 0.07);
        setTimeout(() => playTone(freq * 0.6, 0.12, type, 0.04), 60);
    }
    function soundAchievement() {
        // Zelda-Chest-artig: aufsteigende Fanfare mit Chorus
        playRichTone(523, 0.12, 'sine', 0.12);
        setTimeout(() => playRichTone(659, 0.12, 'sine', 0.12), 100);
        setTimeout(() => playRichTone(784, 0.25, 'triangle', 0.14), 200);
    }
    function soundQuestComplete() {
        // Mario-Level-Complete-artig: längere Fanfare
        const notes = [392, 523, 659, 784, 880];
        notes.forEach((f, i) => {
            setTimeout(() => playRichTone(f, i === notes.length - 1 ? 0.4 : 0.1, 'sine', 0.12), i * 100);
        });
    }

    // ============================================================
    // === ACHIEVEMENTS === (→ achievements.js bei Zellteilung)
    // ============================================================
    const ACHIEVEMENTS = {
        firstBlock:    { emoji: '⭐', title: 'Erster Block!', desc: 'Platziere deinen ersten Block', check: (s) => s.total >= 1 },
        builder10:     { emoji: '🏗️', title: 'Kleiner Baumeister', desc: '10 Blöcke gebaut', check: (s) => s.total >= 10 },
        builder50:     { emoji: '🏘️', title: 'Siedlungsbauer', desc: '50 Blöcke gebaut', check: (s) => s.total >= 50 },
        builder100:    { emoji: '🏙️', title: 'Stadtplaner', desc: '100 Blöcke gebaut', check: (s) => s.total >= 100 },
        halfIsland:    { emoji: '🌍', title: 'Halbe Insel!', desc: '50% der Insel bebaut', check: (s) => s.percent >= 50 },
        fullIsland:    { emoji: '🌟', title: 'Insel-Meister!', desc: '100% der Insel bebaut', check: (s) => s.percent >= 100 },
        allMaterials:  { emoji: '🎨', title: 'Materialkenner', desc: 'Alle Original-Materialien benutzt', check: (s) => s.uniqueMats >= 12 },
        gardenLover:   { emoji: '🌺', title: 'Gärtner', desc: '10 Pflanzen, Bäume oder Blumen', check: (s) => (s.counts.plant || 0) + (s.counts.tree || 0) + (s.counts.flower || 0) >= 10 },
        waterWorld:    { emoji: '🏊', title: 'Wasserwelt', desc: '15 Wasserblöcke', check: (s) => (s.counts.water || 0) >= 15 },
        architect:     { emoji: '👷', title: 'Architekt', desc: 'Haus gebaut (Holz+Tür+Dach+Glas)', check: (s) => (s.counts.wood || 0) >= 4 && (s.counts.door || 0) >= 1 && (s.counts.roof || 0) >= 2 && (s.counts.glass || 0) >= 1 },
        fisherman:     { emoji: '🎣', title: 'Fischer', desc: '5 Fische im Wasser', check: (s) => (s.counts.fish || 0) >= 5 },
        explorer:      { emoji: '🧭', title: 'Entdecker', desc: '15 verschiedene Materialien benutzt', check: (s) => s.uniqueMats >= 15 },
    };

    let unlockedAchievements = JSON.parse(localStorage.getItem('insel-achievements') || '[]');

    function checkAchievements() {
        const stats = getGridStats();
        let newUnlocks = [];
        for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
            if (!unlockedAchievements.includes(id) && ach.check(stats)) {
                unlockedAchievements.push(id);
                newUnlocks.push(ach);
            }
        }
        if (newUnlocks.length > 0) {
            localStorage.setItem('insel-achievements', JSON.stringify(unlockedAchievements));
            updateAchievementDisplay();
            newUnlocks.forEach((ach, i) => {
                setTimeout(() => {
                    showAchievementPopup(ach);
                    soundAchievement();
                }, i * 1500);
            });
        }
    }

    function showAchievementPopup(ach) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `<span class="ach-emoji">${ach.emoji}</span><div><strong>${ach.title}</strong><br><small>${ach.desc}</small></div>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 10);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }

    function getGridStats() {
        const counts = {};
        let total = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    counts[grid[r][c]] = (counts[grid[r][c]] || 0) + 1;
                    total++;
                }
            }
        }
        return {
            counts,
            total,
            percent: Math.round((total / (ROWS * COLS)) * 100),
            uniqueMats: Object.keys(counts).length
        };
    }

    // ============================================================
    // === QUESTS === (→ quests.js bei Zellteilung)
    // ============================================================
    const QUEST_TEMPLATES = [
        { npc: 'spongebob', title: 'Burger-Stand', desc: 'ICH BIN BEREIT einen Burger-Stand zu bauen! Der Professor will wiederkommen!', needs: { wood: 4, roof: 2, door: 1 }, reward: '⭐⭐' },
        { npc: 'spongebob', title: 'Krabbenburger-Küche', desc: 'Die Küche muss GLÄNZEN! Glas für die Fenster damit man die Burger sieht!', needs: { stone: 6, lamp: 2, glass: 2 }, reward: '⭐⭐⭐' },
        { npc: 'krabs', title: 'Handelshafen', desc: 'Boote = Kunden = GELD! Darwin sagt: wer keinen Hafen hat, stirbt aus!', needs: { wood: 6, water: 4, boat: 2 }, reward: '💰💰' },
        { npc: 'krabs', title: 'Schatzkammer', desc: 'Meine Tokens brauchen ein ZUHAUSE! Stein! Dick! Sicher!', needs: { stone: 8, door: 2, lamp: 1 }, reward: '💰💰💰' },
        { npc: 'elefant', title: 'Musik-Garten', desc: 'Törööö! Blumen die man hört! Also... die man SIEHT. Aber ich höre sie trotzdem!', needs: { flower: 5, tree: 3, path: 4 }, reward: '🎵🎵' },
        { npc: 'elefant', title: 'Musik-Turm', desc: 'Ein Turm so hoch dass mein Törööö die ganze Insel erreicht! Der Weber hätte Baupläne gemacht. Ich mach einfach!', needs: { stone: 8, glass: 4, lamp: 3 }, reward: '🎵🎵🎵' },
        { npc: 'tommy', title: 'Boot-Parkplatz', desc: 'Klick-klack! DREI Boote! MINDESTENS! Das ist WISSENSCHAFT! Der lockige Mann hat gesagt!', needs: { water: 6, boat: 3, bridge: 1 }, reward: '⚓⚓' },
        { npc: 'neinhorn', title: 'Geheimversteck', desc: 'NEIN ich will kein Versteck! ...ok doch. Aber mit Pilzen! Die sind gruselig-schön!', needs: { fence: 4, tree: 4, mushroom: 2 }, reward: '🌈🌈' },
        { npc: 'neinhorn', title: 'Regenbogen-Turm', desc: 'NEIN kein Turm! ...gut EINEN Turm. Aber mit Flaggen! Der Nein-Sager-Chef wäre neidisch!', needs: { glass: 6, flower: 4, flag: 2, lamp: 2 }, reward: '🌈🌈🌈' },
        { npc: 'maus', title: 'Blumen-Wiese', desc: '*pieps* Die Maus will Blumen! *quak* Die Ente will einen Brunnen! Weniger ist mehr! Das hat DIE ENTE erfunden!', needs: { flower: 8, plant: 4, fountain: 1 }, reward: '🌻🌻' },
        { npc: 'maus', title: 'Enten-Teich', desc: '*quak quak!* WASSER! FISCHE! *pieps* Und eine Brücke damit die Maus trockene Füße behält!', needs: { water: 8, fish: 3, bridge: 1, plant: 3 }, reward: '🦆🦆🦆' },
        // Runde 2: Schwerer, mehr Material, kreativere Kombos
        { npc: 'spongebob', title: 'Strandpromenade', desc: 'Suchergebnis: 0 Promenaden gefunden! Das muss sich SOFORT ändern!', needs: { path: 8, lamp: 4, flower: 3, fence: 2 }, reward: '⭐⭐⭐⭐' },
        { npc: 'krabs', title: 'Fischmarkt', desc: 'Fische fangen sich nicht von allein, Junge! Das sind mindestens 500 Krabben-Taler Umsatz!', needs: { fish: 5, wood: 4, roof: 2, water: 4 }, reward: '💰💰💰💰' },
        { npc: 'elefant', title: 'Botanischer Garten', desc: 'Törööö... stell dir vor: jede Pflanze hat ihre eigene Melodie... Törööö!', needs: { plant: 6, flower: 6, tree: 4, path: 6, fountain: 1 }, reward: '🎵🎵🎵🎵' },
        { npc: 'tommy', title: 'Leuchtturm', desc: 'Klick-klack! Ein — klick-klack! — RIESIGER Turm! Damit die Boote uns — klick-klack! — FINDEN!', needs: { stone: 6, glass: 4, lamp: 4, flag: 1 }, reward: '⚓⚓⚓' },
        { npc: 'neinhorn', title: 'Labyrinth', desc: 'NEIN kein Labyrinth! ...ok aber eins wo man sich WIRKLICH verläuft! Mon Dieu!', needs: { fence: 12, mushroom: 3, lamp: 2 }, reward: '🌈🌈🌈🌈' },
        { npc: 'maus', title: 'Spielplatz', desc: '*pieps* Sand zum Buddeln! *quak* Und Wasser zum Plantschen! *pieps* Weniger ist — *quak* MEHR WASSER!', needs: { sand: 6, water: 4, fence: 4, tree: 2 }, reward: '🌻🌻🌻' },
        // Runde 3: Gemeinschafts-Quests (beliebiger NPC)
        { npc: 'spongebob', title: 'Insel-Fest', desc: 'PARTY! Suchergebnis: Noch keine Party gefunden! Flaggen, Lampen, ALLES!', needs: { flag: 4, lamp: 6, flower: 4, path: 4 }, reward: '🎉🎉🎉' },
        { npc: 'tommy', title: 'Hafen-Erweiterung', desc: 'Klick-klack! FÜNF Boote! Der lockige Mann hat — klick-klack! — gesagt mehr ist besser!', needs: { boat: 5, water: 8, bridge: 2, wood: 4 }, reward: '⚓⚓⚓⚓' },
        { npc: 'krabs', title: 'Luxus-Resort', desc: 'Glasdächer! Springbrunnen! Das kostet... [RECHNET LAUT] ...2000 Krabben-Taler Bau, 10000 Taler Gewinn!', needs: { glass: 8, fountain: 2, flower: 6, lamp: 4, door: 3 }, reward: '💎💎💎' },
    ];

    let activeQuests = JSON.parse(localStorage.getItem('insel-quests') || '[]');
    let completedQuests = JSON.parse(localStorage.getItem('insel-quests-done') || '[]');

    function getAvailableQuest(npcId) {
        return QUEST_TEMPLATES.find(q =>
            q.npc === npcId &&
            !completedQuests.includes(q.title) &&
            !activeQuests.some(a => a.title === q.title)
        );
    }

    function acceptQuest(quest) {
        activeQuests.push({ ...quest, accepted: Date.now() });
        localStorage.setItem('insel-quests', JSON.stringify(activeQuests));
        showToast(`📜 Quest: ${quest.title}`);
        updateQuestDisplay();
    }

    function checkQuests() {
        const stats = getGridStats();
        let completed = [];
        activeQuests = activeQuests.filter(quest => {
            const done = Object.entries(quest.needs).every(([mat, count]) =>
                (stats.counts[mat] || 0) >= count
            );
            if (done) {
                completed.push(quest);
                completedQuests.push(quest.title);
                return false;
            }
            return true;
        });
        if (completed.length > 0) {
            localStorage.setItem('insel-quests', JSON.stringify(activeQuests));
            localStorage.setItem('insel-quests-done', JSON.stringify(completedQuests));
            completed.forEach((q, i) => {
                setTimeout(() => {
                    // Feynman-kalibriert: degressive Belohnung
                    // System 1: kleine Quests (< 10 Blöcke) = sofort spürbar
                    // System 2: große Quests (10+ Blöcke) = mehr Belohnung, aber nicht linear
                    const blockCount = Object.values(q.needs).reduce((a, b) => a + b, 0);
                    const baseReward = blockCount * 40;
                    // Degression: sqrt-Kurve statt linear, max 500 pro Quest
                    const tokenReward = Math.min(500, Math.round(baseReward * Math.sqrt(blockCount) / blockCount));
                    // Ethik-Deckel: max 2000 Bonus-Tokens total (= 1x Basis-Budget)
                    const currentBonus = window.getTokenBonus ? window.getTokenBonus(q.npc) : 0;
                    const cappedReward = Math.min(tokenReward, 2000 - currentBonus);

                    if (cappedReward > 0) {
                        showToast(`🎉 Quest geschafft: ${q.title} ${q.reward} +⚡ Energie!`);
                    } else {
                        showToast(`🎉 Quest geschafft: ${q.title} ${q.reward}`);
                    }
                    soundQuestComplete();
                    if (window.addTokenBudget && cappedReward > 0) {
                        window.addTokenBudget(q.npc, cappedReward);
                    }
                    // Hirn-Transplantation: Neuen Charakter freischalten?
                    if (window.tryCharacterUnlock) {
                        const unlocked = window.tryCharacterUnlock();
                        if (unlocked && window.onCharacterUnlock) {
                            setTimeout(() => window.onCharacterUnlock(unlocked), 1500);
                        }
                    }
                }, i * 2000);
            });
            updateQuestDisplay();
        }
    }

    function updateQuestDisplay() {
        const questPanel = document.getElementById('quest-list');
        if (!questPanel) return;
        if (activeQuests.length === 0) {
            questPanel.innerHTML = '<p class="no-quests">Bau was — die Bewohner melden sich! 💬</p>';
            return;
        }
        const stats = getGridStats();
        questPanel.innerHTML = activeQuests.map(q => {
            const items = Object.entries(q.needs).map(([mat, need]) => {
                const have = stats.counts[mat] || 0;
                const done = have >= need;
                const m = MATERIALS[mat];
                return `<span class="${done ? 'quest-done' : 'quest-todo'}">${m ? m.emoji : mat} ${have}/${need}</span>`;
            }).join(' ');
            return `<div class="quest-item"><strong>${q.title}</strong><br><small>${items}</small></div>`;
        }).join('');
    }

    // Quest-System für Chat exportieren
    window.questSystem = {
        getAvailable: getAvailableQuest,
        accept: acceptQuest,
        getActive: () => activeQuests,
        getCompleted: () => completedQuests
    };

    // ============================================================
    // === WEATHER + DAY/NIGHT === (→ effects.js bei Zellteilung)
    // ============================================================
    let dayTime = 0; // 0-1

    function updateDayNight() {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const decimal = hour + minute / 60;
        // 6:00 = Morgen (0), 12:00 = Mittag (0.5), 18:00 = Abend (0.7), 22:00 = Nacht (0.9)
        if (decimal >= 6 && decimal < 12) {
            dayTime = (decimal - 6) / 12; // 0 → 0.5
        } else if (decimal >= 12 && decimal < 20) {
            dayTime = 0.5 + (decimal - 12) / 16; // 0.5 → 1.0
        } else {
            dayTime = 0.9 + Math.min(0.1, (decimal >= 20 ? decimal - 20 : decimal + 4) / 40);
        }
    }

    function getDayNightOverlay() {
        // 0-0.3: Morgen (warm), 0.3-0.7: Tag (hell), 0.7-1: Nacht (blau)
        if (dayTime < 0.3) {
            const t = dayTime / 0.3;
            return `rgba(255, 200, 100, ${0.15 * (1 - t)})`;
        } else if (dayTime > 0.7) {
            const t = (dayTime - 0.7) / 0.3;
            return `rgba(20, 20, 80, ${0.3 * t})`;
        }
        return null;
    }

    // --- Wetter-System ---
    let weather = 'sun'; // 'sun', 'rain', 'rainbow'
    let raindrops = [];
    let weatherTimer = 0;
    const WEATHER_CHANGE_INTERVAL = 60000; // Alle 60 Sekunden prüfen

    function initRaindrops() {
        raindrops = [];
        for (let i = 0; i < 80; i++) {
            raindrops.push({
                x: Math.random() * 1000,
                y: Math.random() * 800,
                speed: 3 + Math.random() * 4,
                length: 6 + Math.random() * 10,
            });
        }
    }

    function drawWeather() {
        if (weather === 'rain') {
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
            ctx.lineWidth = 1;
            for (const drop of raindrops) {
                drop.y += drop.speed;
                drop.x += drop.speed * 0.2;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + drop.speed * 0.3, drop.y + drop.length);
                ctx.stroke();
            }
            // Dunkles Overlay für Regen
            ctx.fillStyle = 'rgba(30, 40, 60, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (weather === 'sun') {
            // Sonnenstrahlen aus der Ecke
            const time = Date.now() / 2000;
            const rayAlpha = 0.05 + Math.sin(time) * 0.02;
            ctx.fillStyle = `rgba(255, 240, 150, ${rayAlpha})`;
            for (let i = 0; i < 5; i++) {
                const angle = -0.3 + i * 0.15 + Math.sin(time + i) * 0.05;
                ctx.save();
                ctx.translate(0, 0);
                ctx.rotate(angle);
                ctx.fillRect(0, -5, canvas.width * 1.5, 10 + i * 3);
                ctx.restore();
            }
        }

        // Regenbogen als Hintergrund-Effekt (nicht auf Canvas)
        const rainbowBg = document.getElementById('rainbow-bg');
        if (rainbowBg) {
            if (weather === 'rainbow') {
                rainbowBg.classList.add('rainbow-visible');
                rainbowBg.classList.remove('rainbow-hidden');
            } else {
                rainbowBg.classList.remove('rainbow-visible');
                rainbowBg.classList.add('rainbow-hidden');
            }
        }
    }

    function updateWeather() {
        weatherTimer += 16; // ~60fps
        if (weatherTimer > WEATHER_CHANGE_INTERVAL) {
            weatherTimer = 0;
            const roll = Math.random();
            if (roll < 0.5) weather = 'sun';
            else if (roll < 0.85) weather = 'rain';
            else weather = 'rainbow'; // 15% Chance auf Regenbogen!
        }
    }

    initRaindrops();

    // ============================================================
    // === EASTER EGGS + HÖRSPIELE === (→ stories.js bei Zellteilung)
    // ============================================================
    // Kinder entdecken sie beim Bauen — lernen die Namen spielerisch
    const CODE_EASTER_EGGS = {
        stone: [
            '🪨 Du findest eine Inschrift im Stein: "C war hier. Erster!" Daneben hat jemand gekritzelt: "LÜGNER! — Fortran, seit 1957"',
            '🪨 Autsch! Jemand ist hier gegen den Stein gelaufen. Daneben steht "C++" geritzt.',
            '🪨 In den Stein ist geritzt: "10 PRINT HALLO 20 GOTO 10" — "Das ist BASIC!" ruft C. "Mit dem hab ich angefangen!" Fortran krächzt: "ICH war 15 Jahre vor dir da!"',
            '🪨 BASIC sitzt auf dem Stein und zählt: "10... 20... 30..." — "Was machst du?" — "Ich bin die einfachste Sprache der Insel! Jeder fängt mit mir an!"',
            '🪨 Am Stein lehnt eine alte Tafel: "Pythagoras war hier. 2500 Jahre vor euch ALLEN." C schweigt. Fortran schweigt. Sogar BASIC schweigt.',
            '🪨 Pascal sitzt auf dem Stein und rechnet. "Blaise Pascal! 1642! MEIN Rechner war der ERSTE!" C murmelt: "Ja, aber konntest du Schleifen?" Pascal: "Ich konnte ADDIEREN. Das reicht."',
        ],
        tree: [
            '🐍 Hinter dem Baum raschelt es! Eine freundliche Schlange: "Hallo, ich bin Python!"',
            '🐍 Python die Schlange zwinkert dir zu: "Ich bin leicht zu verstehen, oder?"',
            '🐍 Python gähnt: "Ich bin zwar laaangsam... aber ich verstehe jeden! Und jeder versteht mich!"',
            '🐍 Python wickelt sich gemütlich um den Baum: "Die anderen rennen. Ich denke. Wer ist schlauer?"',
        ],
        flower: [
            '💎 Zwischen den Blumen glitzert etwas Rotes! Ein Edelstein: "Ruby"!',
            '📿 Im Blumenbeet liegt eine Perlenkette! "PERL" steht auf dem Verschluss. Hübsch!',
            '📿 "Meine PERLenkette!" ruft eine alte Schildkröte. "Die hab ich 1987 hier verloren!"',
        ],
        boat: [
            '⚓ Am Boot hängt ein rostiger Anker. Jemand hat "Rust" draufgeritzt. "Ich war mal neu!"',
            '🦀 Unter dem Boot sitzt ein kleiner Krebs mit einem Zahnrad. "Ich bin Rust!"',
        ],
        fence: [
            '🐦 Ein schneller Vogel fliegt über den Zaun! "Ich bin Swift!" Zack, schon weg.',
            '🧮 Am Zaun lehnt ein Mann mit Brille und zählt Latten: "1, 10, 11, 100..." — "Robert, das ist Binär!" — "Ich bin R! Ich zähle wie ich WILL!"',
            '🧮 R zählt die Zaunpfähle in Tertiär: "1, 2, 10, 11, 12, 20..." Seine Frau ruft: "ROBERT! Hör auf zu zählen und hilf mir beim EINLOGGEN!"',
            '🌍 Geo die Geologin klopft auf den Zaun: "Interessantes Gestein! Schicht 1, Schicht 2..." R seufzt: "Sie loggt sich ÜBERALL ein."',
        ],
        fish: [
            '🦈 Ein Fisch flüstert: "Psst! Pass auf Makro auf! Der große Hai macht alles RIESIG!"',
            '🐟 Der Fisch schwimmt Kreise: "Ich bin eine Schleife! while(schwimmen) { schwimm(); }"',
        ],
        path: [
            '🧮 R sitzt am Wegrand und zählt Wanderer in Quartär: "1, 2, 3, 10, 11..." Geo zieht ihn weiter: "Robert, komm, die Gesteinsschichten warten!"',
            '🌍 Geo die Geologin kniet am Weg: "Sediment! Tertiär! QUARTÄR!" R daneben: "Ich hab 47 Kieselsteine gezählt. In Binär: 101111."',
        ],
        bridge: [
            '🎲 Unter der Brücke spielen zwei Krabben ein Brettspiel. "Das heißt Go!"',
            '🌉 Auf der Brücke stehen zwei Figuren. Der Große sagt: "Ich baue die Brücke die du nicht sehen kannst." Der Kleine: "Und ICH baue die Brücke die du SEHEN kannst!" Beide lachen.',
            '🌉 "Es gibt zwei Arten von Architekten", sagt C. "Die einen bauen Häuser. Die anderen bauen die Sprache, in der man Häuser beschreibt."',
        ],
        water: [
            '☕ Das Wasser dampft! "Auf der Insel Java wird viel Kaffee getrunken", murmelt C.',
            '🦈 Im Wasser schwimmt ein Schatten! "MAKRO!" ruft C. "Der böse Hai! Er frisst alles und macht es RIESIG!"',
            '🦈 Makro der Hai taucht auf: "ICH MACHE ALLES GRÖSSER!" Python zischt: "Genau deswegen mag dich keiner."',
            '🦈 "Vorsicht vor Makro!" warnt Rust. "Er sieht klein aus, aber dann EXPLODIERT alles!"',
        ],
        mushroom: [
            '🍄 Unter dem Pilz sitzt eine kleine Elfe. "Ich spreche Elixir!"',
            '🍄 Hinter dem Pilz sitzt ein wirres Wesen und murmelt: "++++++++[>++++<-]>+. Ich bin... äh... HIRNFITZ!" Keiner versteht ihn. Aber er lächelt.',
            '🍄 Hirnfitz redet wieder: ">><< ..++--!!" Die anderen Inselbewohner nicken höflich. "Ja, Hirnfitz. Sehr gut."',
            '🍄 "Was hat Hirnfitz gesagt?" fragt Python. "Ich glaube: Hallo." — "Dafür braucht er 100 Zeichen?!" — C',
        ],
        lamp: [
            '💡 Die Lampe flackert. In der Birne steht winzig: "Powered by JavaScript".',
            '💡 "Wusstest du: JavaScript wurde in 10 Tagen erfunden? Auf einer Insel!" — C++',
            '💡 Unter der Lampe sitzt ein Typ und tippt. "Ich bin TypeScript! Ich lerne Drehbuch bei Tommy!" Tommy: "Klick-klack! Er schreibt alles DOPPELT auf!"',
            '💡 TypeScript korrigiert JavaScript: "Du hast einen TYPO! Da fehlt ein Typ!" JavaScript: "Lass mich, ich funktioniere AUCH SO!" TypeScript: *seufz*',
            '💡 Tommy zeigt TypeScript sein Drehbuch: "Szene 1: Boot. Szene 2: MEHR Boote!" TypeScript: "Das braucht ein Interface... Boot { segel: boolean; flaggen: number }"',
        ],
        cactus: [
            '🦜 Auf dem Kaktus sitzt ein alter Papagei: "Ich bin FORTRAN! Fort-ran ich, und kam nie zurück!"',
            '🦜 Fortran der Papagei krächzt: "Was macht ein Baum im Internet? Er LOGGT sich ein!"',
            '🦜 Fortran flattert auf: "Warum können Geister nicht lügen? Weil man durch sie DURCH-C-T!" *krächz*',
            '🦜 "Was ist das Lieblings-Essen eines Programmierers? SPAM! Fort-ran ich zum Kühlschrank!" *krächz*',
            '🦜 Fortran der Papagei: "Welche Sprache sprechen Fische? BUBB-L! Fort-ran der Witz!"',
            '🦜 "Warum sitze ich auf dem Kaktus? Weil der STACK übergelaufen ist!" *krächz-krächz*',
        ],
    };

    let lastEasterEggTime = 0;
    let discoveredEggs = JSON.parse(localStorage.getItem('insel-easter-eggs') || '[]');

    function maybeCodeEasterEgg(material) {
        const now = Date.now();
        if (now - lastEasterEggTime < 20000) return; // Max alle 20 Sekunden
        if (Math.random() > 0.12) return; // 12% Chance

        const eggs = CODE_EASTER_EGGS[material];
        if (!eggs) return;

        // Neue Eggs bevorzugen
        const unseen = eggs.filter(e => !discoveredEggs.includes(e));
        const pool = unseen.length > 0 ? unseen : eggs;
        const egg = pool[Math.floor(Math.random() * pool.length)];

        lastEasterEggTime = now;
        if (!discoveredEggs.includes(egg)) {
            discoveredEggs.push(egg);
            localStorage.setItem('insel-easter-eggs', JSON.stringify(discoveredEggs));
        }
        showToast(egg, 5000);
        recordMilestone('firstEasterEgg');
        trackEvent('easter_egg', { material, egg: egg.slice(0, 30) });
    }

    // --- NPC-Kommentare beim Bauen ---
    // === GENERATIVE NPC-KOMMENTARE ===
    // Baustein-System: Satzteile werden live gemischt = unendliche Kombinationen
    // Kein API-Call, kein Data-Leak, rein clientseitig.
    const NPC_VOICES = {
        spongebob: { emoji: '🧽', prefix: 'SpongeBob:', ticks: ['ICH BIN BEREIT', 'Das ist der BESTE Tag!', 'Hihihi!'], style: 'caps' },
        maus:      { emoji: '🐭', prefix: 'Maus:', ticks: ['*pieps*', '*quak*'], style: 'cute' },
        elefant:   { emoji: '🐘', prefix: 'Elefant:', ticks: ['Törööö!', 'Hmm, ich möchte sicherstellen...'], style: 'careful' },
        neinhorn:  { emoji: '🦄', prefix: 'Neinhorn:', ticks: ['NEIN!', '...ok,', 'Mon Dieu!'], style: 'nein' },
        krabs:     { emoji: '🦀', prefix: 'Krabs:', ticks: ['💰', 'Taler!', 'Geld!'], style: 'money' },
        tommy:     { emoji: '🎬', prefix: 'Tommy:', ticks: ['Klick-klack!', 'JA!', 'CUT!'], style: 'chaos' },
        bernd:     { emoji: '🍞', prefix: 'Bernd:', ticks: ['*seufz*', 'Mist.', 'Toll.'], style: 'grumpy' },
    };

    const MAT_ADJECTIVES = {
        wood: ['rustikales', 'solides', 'gemütliches', 'warmes', 'klassisches'],
        stone: ['robuster', 'starker', 'massiver', 'ewiger', 'grauer'],
        glass: ['durchsichtiges', 'glänzendes', 'funkelndes', 'modernes', 'schickes'],
        plant: ['grüne', 'lebendige', 'frische', 'wilde', 'wuchernde'],
        tree: ['großer', 'schattenspendender', 'alter', 'stolzer', 'knorriger'],
        flower: ['bunte', 'duftende', 'leuchtende', 'zarte', 'wilde'],
        water: ['blaues', 'plätscherndes', 'kühles', 'tiefes', 'glitzerndes'],
        fence: ['ordentlicher', 'stabiler', 'gerader', 'praktischer'],
        boat: ['schnelles', 'kleines', 'mutiges', 'abenteuerlustiges'],
        fish: ['glitschiger', 'flinker', 'neugieriger', 'bunter'],
        bridge: ['verbindende', 'elegante', 'starke', 'kühne'],
        flag: ['wehende', 'stolze', 'bunte', 'mutige'],
        fountain: ['sprudelnder', 'fröhlicher', 'magischer', 'singender'],
        mushroom: ['geheimnisvoller', 'leuchtender', 'seltsamer', 'kuscheliger'],
        door: ['einladende', 'mysteriöse', 'offene', 'knarrende'],
        roof: ['schützendes', 'rotes', 'stabiles', 'gemütliches'],
        lamp: ['helle', 'warme', 'leuchtende', 'einladende'],
        sand: ['goldener', 'weicher', 'warmer', 'endloser'],
        path: ['verschlungener', 'einladender', 'spannender', 'neuer'],
        cactus: ['stacheliger', 'zäher', 'trotziger', 'cooler'],
    };

    const REACTIONS = {
        caps:    ['Das ist FANTASTISCH!', 'MEHR DAVON!', 'Der beste Block ALLER ZEITEN!', 'SO toll!', 'WOW!'],
        cute:    ['*freu*', '*hüpf*', '*kicher*', '*staun*', 'Oh!', 'Schööön!'],
        careful: ['Sehr schön gemacht.', 'Ganz sorgfältig, ja.', 'Das passt gut hierhin.', 'Ich bin zufrieden.'],
        nein:    ['...ist eigentlich gut.', '...naja. Geht so. OK es ist toll.', '...NEIN! Doch. Ja.', '...pfff. Hübsch.'],
        money:   ['Das bringt Kunden!', 'Wertsteigerung!', 'Cha-ching!', 'Investment!', 'Rendite!'],
        chaos:   ['SCHNITT! Nochmal! BESSER!', 'Das wird im Film GEIL!', 'KAMERA LÄUFT!', 'Action!'],
        grumpy:  ['Na toll.', 'Muss das sein?', 'Kann man machen.', 'Hab ich auch mal probiert. War schlecht.'],
    };

    const TEMPLATES = [
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${npc.ticks[0]} ${adj} ${mat}! ${react}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${react} ${adj} ${mat}!`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} Oh! ${adj} ${mat}. ${npc.ticks[Math.min(1, npc.ticks.length-1)]}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${adj} ${mat}? ${react}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${npc.ticks[0]} Noch mehr ${mat}! ${react}`,
    ];

    // Combo-Tracker: besondere Kommentare bei Serien
    let lastMaterial = null;
    let materialStreak = 0;

    const STREAK_COMMENTS = [
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} ${n}x ${mat} am Stück? ${npc.ticks[0]}`,
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} Noch mehr ${mat}?! Das wird ja eine ${mat}-Stadt!`,
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} ${n} ${mat}! Jemand hat einen Plan!`,
    ];

    // Context-Kommentare basierend auf Grid-Zustand
    function getContextComment(npc, stats) {
        if (stats.total === 0) return null;
        if (stats.percent > 80) return `${npc.emoji} ${npc.prefix} Die Insel ist fast voll! ${npc.ticks[0]}`;
        if (stats.total % 25 === 0) return `${npc.emoji} ${npc.prefix} ${stats.total} Blöcke! ${REACTIONS[npc.style][Math.floor(Math.random() * REACTIONS[npc.style].length)]}`;
        // Proportions-Kommentar
        const entries = Object.entries(stats.counts).filter(([,v]) => v > 0);
        if (entries.length >= 2) {
            const sorted = entries.sort((a,b) => b[1] - a[1]);
            if (sorted[0][1] > stats.total * 0.6) {
                return `${npc.emoji} ${npc.prefix} Sehr viel ${sorted[0][0]}! Wie wärs mit ${sorted[1][0]}?`;
            }
        }
        return null;
    }

    function generateNpcComment(material) {
        const npcKeys = Object.keys(NPC_VOICES);
        const npc = NPC_VOICES[npcKeys[Math.floor(Math.random() * npcKeys.length)]];
        const matLabel = MATERIALS[material]?.label || material;

        // Streak-Check
        if (material === lastMaterial) {
            materialStreak++;
            if (materialStreak >= 5 && Math.random() < 0.5) {
                const tmpl = STREAK_COMMENTS[Math.floor(Math.random() * STREAK_COMMENTS.length)];
                return tmpl(npc, matLabel, materialStreak);
            }
        } else {
            lastMaterial = material;
            materialStreak = 1;
        }

        // Context-Kommentar (10% Chance)
        if (Math.random() < 0.1) {
            const stats = typeof getGridStats === 'function' ? getGridStats() : null;
            if (stats) {
                const ctx = getContextComment(npc, stats);
                if (ctx) return ctx;
            }
        }

        // Generativer Kommentar aus Bausteinen
        const adjs = MAT_ADJECTIVES[material] || ['tolles'];
        const adj = adjs[Math.floor(Math.random() * adjs.length)];
        const reactions = REACTIONS[npc.style];
        const react = reactions[Math.floor(Math.random() * reactions.length)];
        const tmpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
        return tmpl(npc, adj, matLabel, react);
    }

    // --- Spontan-Hörspiele: Mini-Szenen bei besonderen Anlässen ---
    // "Mensch, Maschine, KI" — wie im ZKM Karlsruhe
    const HOERSPIELE = {
        firstBlock: [
            '🪨 C: "Da baut jemand! Zum ersten Mal seit ich hier bin!"',
            '🐍 Python: "Willkommen auf Java! Ich versteeeehe dich."',
            '🦜 Fortran: "Fort-ran die Langeweile! Jemand BAUT!"',
            '🧮 R: "Block Nummer 1. In Binär: 1. In Tertiär: 1. Immer noch 1."',
            '🌍 Geo: "Robert, NICHT jetzt!"',
        ],
        tenBlocks: [
            '💡 JavaScript: "10 Blöcke! Genau wie ich — in 10 Tagen geboren!"',
            '📝 TypeScript: "Korrekt wäre: blöcke: number = 10;"',
            '💡 JavaScript: "LASS MICH."',
            '🦈 Makro: *taucht kurz auf* "Zehn? Ich mache HUNDERT draus!" *taucht ab*',
            '🐍 Python: "Ignoriert den Hai. Zehn ist gut. Zehn ist... gemütlich."',
        ],
        fiftyBlocks: [
            '🧽 SpongeBob: "ICH BIN BEREIT zu sagen: DAS ist eine STADT!"',
            '🦀 Mr. Krabs: "Stadt = Kunden = <umsatz>VIEL GELD</umsatz>!"',
            '🐘 Elefant: "Hmm, ich möchte sicherstellen... ja. Törööö! Das ist schön."',
            '🪨 C: "50 Blöcke. Zu meiner Zeit haben wir mit EINEM Byte angefangen."',
            '🪨 C++: "Und dann bin ich gegen den Stein gelaufen und alles wurde besser!"',
            '🪨 C: "...definiere besser."',
        ],
        hundredBlocks: [
            '🦄 Neinhorn: "NEIN das sind nicht 100 Blöcke! ...doch? Mon Dieu!"',
            '🧮 R: "100 in Binär: 1100100. In Oktal: 144. In—"',
            '🌍 Geo: "ROBERT."',
            '🐭 Maus: "*pieps* Hundert Blöcke / Die Insel wird zur Stadt / Weniger war mehr *pieps*"',
            '🦆 Ente: "*quak* Was soll das mit den Silben SCHON WIEDER?!"',
            '🍄 Hirnfitz: "++++++[>++++++++++<-]>++++. !" (Das heißt: "d!" — er versucht "du bist toll" zu sagen)',
            '🍞 Bernd: "*seufz* 100 Blöcke. Und ich muss immer noch Support machen."',
        ],
        halfIsland: [
            '— HÖRSPIEL: Mensch, Maschine, KI — Live von der Insel Java —',
            '🐍 Python: "Die halbe Insel ist bebaut. Ein Mensch hat das gemacht. Mit Klicks."',
            '💡 JavaScript: "Aber WIR haben die Klicks VERARBEITET! Ohne mich wäre das nur Sand!"',
            '📝 TypeScript: "Ohne mich hättest DU drei Bugs. Mindestens."',
            '🪨 C: "Ohne MICH gäbe es euch alle nicht."',
            '🐍 Python: "Die Frage ist: Wer baut hier wirklich? Der Mensch? Die Maschine? Oder die KI im Chat?"',
            '🧽 SpongeBob: "ICH glaube der Baumeister baut! Und wir helfen! ICH BIN BEREIT ZU HELFEN!"',
            '🦄 Neinhorn: "NEIN! ...aber ja. Zusammen ists schöner."',
            '— Applaus von der Insel Java. Nächste Vorstellung bei 100%. —',
        ],
        fullIsland: [
            '— GROSSES FINALE: Mensch, Maschine, KI — Insel Java Uraufführung —',
            '🪨 C: "Ich erinnere mich an den Tag als hier NICHTS war."',
            '🐍 Python: "Ein leeres Grid. Null Blöcke. None."',
            '🧮 R: "Genau 0. In jedem Zahlensystem."',
            '💡 JavaScript: "Und dann hat jemand geklickt. Ein Mensch. Ein WORT wurde zu einem BLOCK."',
            '📝 TypeScript: "grid[0][0] = \'wood\' — der erste Zauberspruch."',
            '🦜 Fortran: "Fort-ran die Leere! Her-kam die Stadt!"',
            '🧽 SpongeBob: "Alles nur mit WORTEN! Kein Hammer, kein Bagger! Nur: Klick. Text. MAGIE!"',
            '🐘 Elefant: "Törööö! Und die ganze Insel hat zugehört."',
            '🦄 Neinhorn: "NEIN ich weine nicht! ...es regnet. Auf mein Gesicht. Nur da."',
            '🍞 Bernd: "*seufz* Gut, DAS war schön. Sag ich nur einmal. Nie wieder."',
            '🦈 Makro: *ganz leise aus dem Wasser* "...ich fand es auch schön."',
            '— Standing Ovation auf der Insel Java. Grüße ans ZKM Karlsruhe. —',
        ],
    };

    let playedHoerspiele = JSON.parse(localStorage.getItem('insel-hoerspiele') || '[]');

    function maybeHoerspiel(stats) {
        let key = null;
        if (stats.total === 1 && !playedHoerspiele.includes('firstBlock')) key = 'firstBlock';
        else if (stats.total === 10 && !playedHoerspiele.includes('tenBlocks')) key = 'tenBlocks';
        else if (stats.total === 50 && !playedHoerspiele.includes('fiftyBlocks')) key = 'fiftyBlocks';
        else if (stats.total === 100 && !playedHoerspiele.includes('hundredBlocks')) key = 'hundredBlocks';
        else if (stats.percent === 50 && !playedHoerspiele.includes('halfIsland')) key = 'halfIsland';
        else if (stats.percent >= 100 && !playedHoerspiele.includes('fullIsland')) key = 'fullIsland';

        if (!key) return;

        playedHoerspiele.push(key);
        localStorage.setItem('insel-hoerspiele', JSON.stringify(playedHoerspiele));

        const lines = HOERSPIELE[key];
        lines.forEach((line, i) => {
            setTimeout(() => {
                showToast(line, 4000);
                if (i === 0) soundAchievement();
            }, i * 4500);
        });
        trackEvent('hoerspiel', { scene: key, blocks: stats.total });
    }

    let lastCommentTime = 0;

    function maybeNpcComment(material) {
        const now = Date.now();
        if (now - lastCommentTime < 10000) return; // Max alle 10 Sekunden
        if (Math.random() > 0.20) return; // 20% Chance (weniger spam)

        lastCommentTime = now;
        const comment = generateNpcComment(material);
        // Kurzer Toast (2s) — verschwindet sofort bei nächstem Klick
        showToast(comment, 2000);
    }

    // ============================================================
    // === BAUM-WACHSTUM === Setzling → kleiner Baum → großer Baum
    // ============================================================
    const TREE_GROWTH_TIME_1 = 30000; // Setzling → kleiner Baum: 30s
    const TREE_GROWTH_TIME_2 = 60000; // Kleiner Baum → großer Baum: 60s
    let treeGrowth = {}; // { "r,c": timestamp }

    function updateTreeGrowth() {
        const now = Date.now();
        let changed = false;
        for (const key of Object.keys(treeGrowth)) {
            const [r, c] = key.split(',').map(Number);
            if (r >= ROWS || c >= COLS || r < 0 || c < 0) {
                delete treeGrowth[key];
                continue;
            }
            const planted = treeGrowth[key];
            const age = now - planted;
            const cell = grid[r]?.[c];

            if (cell === 'sapling' && age >= TREE_GROWTH_TIME_1) {
                grid[r][c] = 'small_tree';
                addPlaceAnimation(r, c);
                changed = true;
            } else if (cell === 'small_tree' && age >= TREE_GROWTH_TIME_1 + TREE_GROWTH_TIME_2) {
                grid[r][c] = 'tree';
                delete treeGrowth[key];
                addPlaceAnimation(r, c);
                unlockMaterial('tree');
                changed = true;
            } else if (cell !== 'sapling' && cell !== 'small_tree') {
                delete treeGrowth[key];
            }
        }
        if (changed) updateStats();
    }

    // Alle 5s prüfen
    setInterval(updateTreeGrowth, 5000);

    function soundChop() {
        if (!canPlaySound()) return;
        playRichTone(180, 0.15, 'sawtooth', 0.1);
        setTimeout(() => playTone(120, 0.2, 'square', 0.08), 80);
    }

    function soundCraft() {
        if (!canPlaySound()) return;
        playRichTone(440, 0.1, 'sine', 0.1);
        setTimeout(() => playRichTone(554, 0.1, 'sine', 0.1), 100);
        setTimeout(() => playRichTone(659, 0.2, 'triangle', 0.12), 200);
    }

    // ============================================================
    // === INVENTAR ===
    // ============================================================
    let inventory = {};

    function addToInventory(material, count) {
        count = count || 1;
        inventory[material] = (inventory[material] || 0) + count;
        updateInventoryDisplay();
        saveInventory();
    }

    function removeFromInventory(material, count) {
        count = count || 1;
        if ((inventory[material] || 0) < count) return false;
        inventory[material] -= count;
        if (inventory[material] <= 0) delete inventory[material];
        updateInventoryDisplay();
        saveInventory();
        return true;
    }

    function getInventoryCount(material) {
        return inventory[material] || 0;
    }

    function saveInventory() {
        localStorage.setItem('insel-inventar', JSON.stringify(inventory));
    }

    function loadInventory() {
        inventory = JSON.parse(localStorage.getItem('insel-inventar') || '{}');
    }

    function updateInventoryDisplay() {
        const container = document.getElementById('inventory-content');
        if (!container) return;
        const items = Object.entries(inventory).filter(([, count]) => count > 0);
        if (items.length === 0) {
            container.innerHTML = '<p class="inv-empty">Ernte Bäume für Holz! ⛏️</p>';
            return;
        }
        container.innerHTML = items.map(([mat, count]) => {
            const info = MATERIALS[mat];
            if (!info) return '';
            return `<div class="inv-item" data-material="${mat}" title="${info.label}: ${count}">
                <span class="inv-emoji">${info.emoji}</span>
                <span class="inv-count">${count}</span>
            </div>`;
        }).join('');
    }

    // ============================================================
    // === CRAFTING === 3x3 Werkbank
    // ============================================================
    const CRAFTING_RECIPES = [
        // Stufe 1: Aus den 5 Elementen (五行)
        { name: 'Stein',    result: 'stone',      resultCount: 2, ingredients: { earth: 2, fire: 1 },  desc: '2 Erde + Feuer = 2 Stein' },
        { name: 'Sand',     result: 'sand',       resultCount: 2, ingredients: { earth: 1, water: 1 }, desc: 'Erde + Wasser = 2 Sand' },
        { name: 'Bretter',  result: 'planks',     resultCount: 3, ingredients: { wood: 2 },            desc: '2 Holz = 3 Bretter' },
        { name: 'Setzling', result: 'sapling',    resultCount: 1, ingredients: { wood: 1, water: 1 },  desc: 'Holz + Wasser = Setzling' },
        { name: 'Pflanze',  result: 'plant',      resultCount: 2, ingredients: { earth: 1, wood: 1 },  desc: 'Erde + Holz = 2 Pflanzen' },
        { name: 'Blume',    result: 'flower',     resultCount: 2, ingredients: { plant: 1, fire: 1 },  desc: 'Pflanze + Feuer = 2 Blumen' },
        { name: 'Pilz',     result: 'mushroom',   resultCount: 2, ingredients: { earth: 1, water: 1, wood: 1 }, desc: 'Erde + Wasser + Holz = 2 Pilze' },
        // Stufe 2: Aus Stufe-1-Artefakten
        { name: 'Glas',     result: 'glass',      resultCount: 1, ingredients: { sand: 1, fire: 1 },   desc: 'Sand + Feuer = Glas' },
        { name: 'Lampe',    result: 'lamp',       resultCount: 1, ingredients: { glass: 1, fire: 1 },  desc: 'Glas + Feuer = Lampe' },
        { name: 'Fenster',  result: 'window_pane', resultCount: 1, ingredients: { glass: 1, wood: 1 }, desc: 'Glas + Holz = Fenster' },
        { name: 'Tür',      result: 'door',       resultCount: 1, ingredients: { planks: 2 },          desc: '2 Bretter = Tür' },
        { name: 'Zaun',     result: 'fence',      resultCount: 2, ingredients: { planks: 1, wood: 1 }, desc: 'Bretter + Holz = 2 Zäune' },
        { name: 'Weg',      result: 'path',       resultCount: 3, ingredients: { sand: 1, stone: 1 },  desc: 'Sand + Stein = 3 Wege' },
        { name: 'Dach',     result: 'roof',       resultCount: 2, ingredients: { planks: 1, stone: 1 },desc: 'Bretter + Stein = 2 Dächer' },
        { name: 'Flagge',   result: 'flag',       resultCount: 1, ingredients: { wood: 1, fire: 1 },   desc: 'Holz + Feuer = Flagge' },
        { name: 'Boot',     result: 'boat',       resultCount: 1, ingredients: { planks: 2, metal: 1 },desc: '2 Bretter + Metall = Boot' },
        { name: 'Fisch',    result: 'fish',       resultCount: 2, ingredients: { water: 2, wood: 1 },  desc: '2 Wasser + Holz = 2 Fische' },
        { name: 'Brunnen',  result: 'fountain',   resultCount: 1, ingredients: { stone: 3, water: 1 }, desc: '3 Stein + Wasser = Brunnen' },
        { name: 'Brücke',   result: 'bridge',     resultCount: 1, ingredients: { planks: 2, metal: 1 },desc: '2 Bretter + Metall = Brücke' },
        // === NATUR & WETTER (Feynman-approved) ===
        { name: 'Dampf',       result: 'steam',     resultCount: 1, ingredients: { water: 1, fire: 1 },    desc: 'Wasser + Feuer = Dampf' },
        { name: 'Eis',         result: 'ice',       resultCount: 1, ingredients: { water: 2, metal: 1 },   desc: '2 Wasser + Metall = Eis' },
        { name: 'Schnee',      result: 'snow',      resultCount: 1, ingredients: { ice: 1, cloud: 1 },     desc: 'Eis + Wolke = Schnee' },
        { name: 'Wolke',       result: 'cloud',     resultCount: 1, ingredients: { steam: 2 },             desc: '2 Dampf = Wolke' },
        { name: 'Regen',       result: 'rain',      resultCount: 1, ingredients: { cloud: 1, water: 1 },   desc: 'Wolke + Wasser = Regen' },
        { name: 'Regenbogen',  result: 'rainbow',   resultCount: 1, ingredients: { rain: 1, fire: 1 },     desc: 'Regen + Feuer = Regenbogen' },
        { name: 'Blitz',       result: 'lightning',  resultCount: 1, ingredients: { cloud: 1, metal: 1 },  desc: 'Wolke + Metall = Blitz' },
        { name: 'Tornado',     result: 'tornado',   resultCount: 1, ingredients: { cloud: 2, fire: 1 },    desc: '2 Wolken + Feuer = Tornado' },
        { name: 'Vulkan',      result: 'volcano',   resultCount: 1, ingredients: { mountain: 1, fire: 2 }, desc: 'Berg + 2 Feuer = Vulkan' },
        { name: 'Berg',        result: 'mountain',  resultCount: 1, ingredients: { stone: 3, earth: 2 },   desc: '3 Stein + 2 Erde = Berg' },
        { name: 'Sonne',       result: 'sun',       resultCount: 1, ingredients: { fire: 3 },              desc: '3 Feuer = Sonne' },
        { name: 'Mond',        result: 'moon',      resultCount: 1, ingredients: { stone: 2, fire: 1 },    desc: '2 Stein + Feuer = Mond' },
        { name: 'Stern',       result: 'star',      resultCount: 1, ingredients: { sun: 1, metal: 1 },     desc: 'Sonne + Metall = Stern' },
        // === LEBEN (absurd aber logisch) ===
        { name: 'Ei',          result: 'egg',       resultCount: 1, ingredients: { earth: 1, fire: 1, water: 1 }, desc: 'Erde + Feuer + Wasser = Ei' },
        { name: 'Nest',        result: 'nest',      resultCount: 1, ingredients: { wood: 2, plant: 1 },    desc: '2 Holz + Pflanze = Nest' },
        { name: 'Schmetterling', result: 'butterfly', resultCount: 1, ingredients: { flower: 1, cloud: 1 },desc: 'Blume + Wolke = Schmetterling' },
        { name: 'Biene',       result: 'bee',       resultCount: 1, ingredients: { flower: 2, sun: 1 },    desc: '2 Blumen + Sonne = Biene' },
        { name: 'Honig',       result: 'honey',     resultCount: 1, ingredients: { bee: 1, flower: 1 },    desc: 'Biene + Blume = Honig' },
        { name: 'Apfel',       result: 'apple',     resultCount: 2, ingredients: { tree: 1, sun: 1 },      desc: 'Baum + Sonne = 2 Äpfel' },
        { name: 'Kuchen',      result: 'cake',      resultCount: 1, ingredients: { apple: 1, honey: 1, fire: 1 }, desc: 'Apfel + Honig + Feuer = Kuchen' },
        // === MAGIE (absurd und wunderbar) ===
        { name: 'Trank',       result: 'potion',    resultCount: 1, ingredients: { mushroom: 1, water: 1, fire: 1 }, desc: 'Pilz + Wasser + Feuer = Trank' },
        { name: 'Kristall',    result: 'crystal',   resultCount: 1, ingredients: { diamond: 1, potion: 1 },desc: 'Diamant + Trank = Kristall' },
        { name: 'Diamant',     result: 'diamond',   resultCount: 1, ingredients: { stone: 3, fire: 3 },    desc: '3 Stein + 3 Feuer = Diamant' },
        { name: 'Drache',      result: 'dragon',    resultCount: 1, ingredients: { fire: 3, egg: 1 },      desc: '3 Feuer + Ei = Drache' },
        { name: 'Einhorn',     result: 'unicorn',   resultCount: 1, ingredients: { rainbow: 1, potion: 1 },desc: 'Regenbogen + Trank = Einhorn' },
        { name: 'Phönix',      result: 'phoenix',   resultCount: 1, ingredients: { fire: 2, egg: 1, star: 1 }, desc: '2 Feuer + Ei + Stern = Phönix' },
        // === DINGE & ABENTEUER ===
        { name: 'Schwert',     result: 'sword',     resultCount: 1, ingredients: { metal: 2, fire: 1 },    desc: '2 Metall + Feuer = Schwert' },
        { name: 'Schild',      result: 'shield',    resultCount: 1, ingredients: { metal: 2, wood: 1 },    desc: '2 Metall + Holz = Schild' },
        { name: 'Krone',       result: 'crown',     resultCount: 1, ingredients: { metal: 1, diamond: 1 }, desc: 'Metall + Diamant = Krone' },
        { name: 'Schlüssel',   result: 'key',       resultCount: 1, ingredients: { metal: 1, fire: 1 },    desc: 'Metall + Feuer = Schlüssel' },
        { name: 'Schatz',      result: 'treasure',  resultCount: 1, ingredients: { key: 1, earth: 2 },     desc: 'Schlüssel + 2 Erde = Schatz' },
        // === ABSURD (💩🚀👻👽🤖) ===
        { name: 'Geist',       result: 'ghost',     resultCount: 1, ingredients: { cloud: 1, moon: 1 },    desc: 'Wolke + Mond = Geist' },
        { name: 'Skelett',     result: 'skull',     resultCount: 1, ingredients: { stone: 2, lightning: 1 },desc: '2 Stein + Blitz = Skelett' },
        { name: 'Haufen',      result: 'poop',      resultCount: 1, ingredients: { earth: 2, water: 2 },   desc: '2 Erde + 2 Wasser = ...du weißt schon' },
        { name: 'Rakete',      result: 'rocket',    resultCount: 1, ingredients: { metal: 2, fire: 2 },    desc: '2 Metall + 2 Feuer = Rakete' },
        { name: 'UFO',         result: 'ufo',       resultCount: 1, ingredients: { rocket: 1, star: 1 },   desc: 'Rakete + Stern = UFO' },
        { name: 'Alien',       result: 'alien',     resultCount: 1, ingredients: { ufo: 1, egg: 1 },       desc: 'UFO + Ei = Alien' },
        { name: 'Roboter',     result: 'robot',     resultCount: 1, ingredients: { metal: 3, lightning: 1 },desc: '3 Metall + Blitz = Roboter' },
        { name: 'Musik',       result: 'music',     resultCount: 1, ingredients: { wood: 1, metal: 1, wind: 1 }, desc: 'Holz + Metall + Wind = Musik' },
        { name: 'Herz',        result: 'heart',     resultCount: 1, ingredients: { fire: 1, water: 1, flower: 1 }, desc: 'Feuer + Wasser + Blume = Herz' },
    ];

    let craftingGrid = Array(9).fill(null); // 3x3 = 9 Slots

    // Entdeckte Rezepte — Spieler sieht nur was er schon gefunden hat
    let discoveredRecipes = new Set(JSON.parse(localStorage.getItem('insel-discovered-recipes') || '[]'));

    function saveDiscoveredRecipes() {
        localStorage.setItem('insel-discovered-recipes', JSON.stringify([...discoveredRecipes]));
    }

    function getCraftingIngredients() {
        const counts = {};
        for (const slot of craftingGrid) {
            if (slot) counts[slot] = (counts[slot] || 0) + 1;
        }
        return counts;
    }

    function findMatchingRecipe() {
        const placed = getCraftingIngredients();
        const placedKeys = Object.keys(placed);
        if (placedKeys.length === 0) return null;

        for (const recipe of CRAFTING_RECIPES) {
            const needed = recipe.ingredients;
            const neededKeys = Object.keys(needed);
            // Exact match: same ingredients, same counts
            if (neededKeys.length !== placedKeys.length) continue;
            let match = true;
            for (const key of neededKeys) {
                if ((placed[key] || 0) !== needed[key]) { match = false; break; }
            }
            if (match) return recipe;
        }
        return null;
    }

    function doCraft() {
        const recipe = findMatchingRecipe();
        if (!recipe) {
            showToast('🤔 Kein Rezept gefunden!');
            return;
        }

        // Remove items from crafting grid
        craftingGrid = Array(9).fill(null);

        // Add result to inventory + unlock in palette + discover recipe
        addToInventory(recipe.result, recipe.resultCount);
        unlockMaterial(recipe.result);
        const isNew = !discoveredRecipes.has(recipe.name);
        discoveredRecipes.add(recipe.name);
        saveDiscoveredRecipes();
        soundCraft();

        const info = MATERIALS[recipe.result];
        if (isNew) {
            showToast(`🔮 Neues Rezept entdeckt: ${info.emoji} ${recipe.desc}!`);
        } else {
            showToast(`⚒️ ${info.emoji} ${recipe.resultCount}x ${info.label} hergestellt!`);
        }
        trackEvent('craft', { recipe: recipe.name, result: recipe.result });
        updateCraftingDisplay();
    }

    function openCraftingDialog() {
        const dialog = document.getElementById('crafting-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
            updateCraftingDisplay();
        }
    }

    function closeCraftingDialog() {
        const dialog = document.getElementById('crafting-dialog');
        if (dialog) dialog.classList.add('hidden');
        // Return crafting grid items to inventory
        for (let i = 0; i < 9; i++) {
            if (craftingGrid[i]) {
                addToInventory(craftingGrid[i]);
                craftingGrid[i] = null;
            }
        }
    }

    let selectedInventoryItem = null;

    function updateCraftingDisplay() {
        // Update crafting grid slots
        for (let i = 0; i < 9; i++) {
            const slot = document.getElementById('craft-slot-' + i);
            if (!slot) continue;
            if (craftingGrid[i]) {
                const info = MATERIALS[craftingGrid[i]];
                slot.innerHTML = `<span class="craft-emoji">${info.emoji}</span>`;
                slot.classList.add('filled');
            } else {
                slot.innerHTML = '';
                slot.classList.remove('filled');
            }
        }

        // Update recipe preview
        const recipe = findMatchingRecipe();
        const preview = document.getElementById('craft-result');
        if (preview) {
            if (recipe) {
                const info = MATERIALS[recipe.result];
                preview.innerHTML = `<span class="craft-emoji">${info.emoji}</span><span class="craft-result-count">${recipe.resultCount > 1 ? recipe.resultCount + 'x' : ''}</span>`;
                preview.title = recipe.name;
            } else {
                preview.innerHTML = '<span class="craft-question">?</span>';
                preview.title = '';
            }
        }

        // Update inventory items in crafting dialog
        const invList = document.getElementById('craft-inventory');
        if (invList) {
            const items = Object.entries(inventory).filter(([, count]) => count > 0);
            invList.innerHTML = items.map(([mat, count]) => {
                const info = MATERIALS[mat];
                if (!info) return '';
                const selected = selectedInventoryItem === mat ? ' selected' : '';
                return `<div class="craft-inv-item${selected}" data-material="${mat}">
                    <span class="inv-emoji">${info.emoji}</span>
                    <span class="inv-label">${info.label}</span>
                    <span class="inv-count">${count}</span>
                </div>`;
            }).join('') || '<p class="inv-empty">Inventar leer!</p>';
        }

        // Update recipe book — nur entdeckte Rezepte zeigen
        const recipeBook = document.getElementById('recipe-book');
        if (recipeBook) {
            const discovered = CRAFTING_RECIPES.filter(r => discoveredRecipes.has(r.name));
            if (discovered.length === 0) {
                recipeBook.innerHTML = '<p class="craft-discover-hint">Mische die Elemente und finde heraus was entsteht!</p>';
            } else {
                recipeBook.innerHTML = discovered.map(r => {
                    const info = MATERIALS[r.result];
                    return `<div class="recipe-entry">${info.emoji} ${r.desc}</div>`;
                }).join('') + `<p class="craft-discover-hint">${discovered.length}/${CRAFTING_RECIPES.length} entdeckt</p>`;
            }
        }
    }

    // --- Zustand ---
    let grid = [];
    let currentMaterial = 'metal';
    let currentTool = 'build';

    // Die 5 Elemente (五行 Wu Xing) — immer in der Palette sichtbar
    const BASE_MATERIALS = ['metal', 'wood', 'fire', 'water', 'earth'];

    // Starter-Set: 5 Wu-Xing + erste 3 Crafting-Ergebnisse — von Anfang an sichtbar
    const STARTER_MATERIALS = [...BASE_MATERIALS, 'stone', 'sand', 'glass'];

    // Freigeschaltete Materialien (durch Ernten oder Crafting)
    let unlockedMaterials = new Set();

    function saveUnlocked() {
        localStorage.setItem('insel-unlocked-materials', JSON.stringify([...unlockedMaterials]));
    }

    function loadUnlocked() {
        const saved = JSON.parse(localStorage.getItem('insel-unlocked-materials') || '[]');
        unlockedMaterials = new Set(saved);
    }

    function unlockMaterial(mat) {
        if (BASE_MATERIALS.includes(mat) || unlockedMaterials.has(mat)) return;
        unlockedMaterials.add(mat);
        saveUnlocked();
        const info = MATERIALS[mat];
        if (!info) return;
        // Button in Palette sichtbar machen oder dynamisch erzeugen
        let btn = document.querySelector(`.material-btn[data-material="${mat}"]`);
        if (btn) {
            btn.style.display = '';
            btn.classList.remove('craft-locked');
            btn.classList.add('craft-unlocked');
        } else {
            // Dynamisch neuen Palette-Button erzeugen
            const palette = document.getElementById('palette');
            if (palette) {
                btn = document.createElement('button');
                btn.className = 'material-btn craft-unlocked';
                btn.dataset.material = mat;
                btn.title = info.label;
                btn.innerHTML = `<span class="mat-emoji">${info.emoji}</span><span class="mat-label">${info.label}</span>`;
                palette.appendChild(btn);
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentMaterial = mat;
                    soundBuild(mat);
                    currentTool = 'build';
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-tool="build"]').classList.add('active');
                });
            }
        }
        showToast(`✨ Neues Artefakt: ${info.emoji} ${info.label}!`);
    }

    function updatePaletteVisibility() {
        document.querySelectorAll('.material-btn').forEach(btn => {
            const mat = btn.dataset.material;
            if (BASE_MATERIALS.includes(mat) || btn.dataset.base) return;
            if (unlockedMaterials.has(mat)) {
                // Durch Crafting/Quests freigeschaltet → sichtbar + animiert
                btn.style.display = '';
                btn.classList.remove('craft-locked');
                btn.classList.add('craft-unlocked');
            } else if (STARTER_MATERIALS.includes(mat)) {
                // Starter-Artefakte (stone/sand/glass): sichtbar aber ausgegraut bis gecraftet
                btn.style.display = '';
                btn.classList.add('craft-locked');
                btn.classList.remove('craft-unlocked');
            } else {
                // Noch nicht freigeschaltet und kein Starter → verstecken
                btn.style.display = 'none';
                btn.classList.remove('craft-unlocked');
            }
        });
    }

    // Save-Migration: alte Saves ohne unlocked → Grid + Inventar scannen
    function migrateUnlocked() {
        if (unlockedMaterials.size > 0) return; // Schon migriert
        // Grid scannen: alle vorhandenen Materialien freischalten
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                const cell = grid[r]?.[c];
                if (cell && !BASE_MATERIALS.includes(cell) && MATERIALS[cell]) {
                    unlockedMaterials.add(cell);
                }
            }
        }
        // Inventar scannen
        for (const mat of Object.keys(inventory)) {
            if (inventory[mat] > 0 && !BASE_MATERIALS.includes(mat) && MATERIALS[mat]) {
                unlockedMaterials.add(mat);
            }
        }
        if (unlockedMaterials.size > 0) {
            saveUnlocked();
            updatePaletteVisibility();
        }
    }

    // Was gibt Ernten? Bäume → Holz, alles andere → sich selbst
    const HARVEST_YIELD = {
        tree:       { material: 'wood', count: 3 },
        small_tree: { material: 'wood', count: 2 },
        sapling:    { material: 'wood', count: 1 },
    };
    let isMouseDown = false;
    let hoverCell = null;
    let animations = [];

    // --- DOM-Elemente ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const introOverlay = document.getElementById('intro-overlay');
    const startButton = document.getElementById('start-button');
    const statsContent = document.getElementById('stats-content');
    const projectNameInput = document.getElementById('project-name');
    const loadDialog = document.getElementById('load-dialog');
    const savedProjectsList = document.getElementById('saved-projects-list');
    const toast = document.getElementById('toast');

    // --- Canvas Größe ---
    const totalCols = COLS + WATER_BORDER * 2;
    const totalRows = ROWS + WATER_BORDER * 2;

    function resizeCanvas() {
        CELL_SIZE = calcCellSize();
        canvas.width = totalCols * CELL_SIZE;
        canvas.height = totalRows * CELL_SIZE;
        // CSS-Größe für scharfe Darstellung auf HiDPI/4K
        canvas.style.width = (totalCols * CELL_SIZE) + 'px';
        canvas.style.height = (totalRows * CELL_SIZE) + 'px';
        // Auf Mobilgeräten Canvas in den Container einpassen
        if (window.innerWidth < 768) {
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Grid initialisieren ---
    function initGrid() {
        grid = [];
        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            for (let c = 0; c < COLS; c++) {
                grid[r][c] = null;
            }
        }
        window.grid = grid; // Chat-Integration aktuell halten
    }

    // --- Zeichnen ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Wasser-Hintergrund
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Wasser-Wellen (einfache Animation)
        const time = Date.now() / 1000;
        for (let r = 0; r < totalRows; r++) {
            for (let c = 0; c < totalCols; c++) {
                const isIsland = r >= WATER_BORDER && r < WATER_BORDER + ROWS &&
                                 c >= WATER_BORDER && c < WATER_BORDER + COLS;
                if (!isIsland) {
                    const wave = Math.sin(time * 2 + r * 0.5 + c * 0.3) * 10;
                    const blue = 52 + wave;
                    ctx.fillStyle = `rgb(${blue + 0}, ${blue + 100}, ${blue + 167})`;
                    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // Insel (Sand-Hintergrund)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const x = (c + WATER_BORDER) * CELL_SIZE;
                const y = (r + WATER_BORDER) * CELL_SIZE;

                // Sand
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                // Leichtes Grid
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                // Material zeichnen
                if (grid[r][c]) {
                    const mat = MATERIALS[grid[r][c]];
                    ctx.fillStyle = mat.color;
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

                    // Rand
                    ctx.strokeStyle = mat.border;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

                    // Emoji
                    ctx.font = `${CELL_SIZE * 0.55}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(mat.emoji, x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 1);
                }
            }
        }

        // Hover-Vorschau
        if (hoverCell) {
            const hx = (hoverCell.c + WATER_BORDER) * CELL_SIZE;
            const hy = (hoverCell.r + WATER_BORDER) * CELL_SIZE;

            if (currentTool === 'build') {
                const mat = MATERIALS[currentMaterial];
                ctx.fillStyle = mat.color;
                ctx.globalAlpha = 0.4;
                ctx.fillRect(hx + 1, hy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.globalAlpha = 1;
                ctx.font = `${CELL_SIZE * 0.55}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.5;
                ctx.fillText(mat.emoji, hx + CELL_SIZE / 2, hy + CELL_SIZE / 2 + 1);
                ctx.globalAlpha = 1;
            } else if (currentTool === 'harvest') {
                const cell = grid[hoverCell.r]?.[hoverCell.c];
                if (cell !== null) {
                    ctx.strokeStyle = '#F39C12';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(hx + 2, hy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    ctx.font = `${CELL_SIZE * 0.4}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('⛏️', hx + CELL_SIZE / 2, hy + CELL_SIZE / 2);
                }
            } else if (currentTool === 'fill') {
                ctx.strokeStyle = '#F39C12';
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(hx + 2, hy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.setLineDash([]);
            }
        }

        // Animationen zeichnen
        drawAnimations();

        // Day/Night Overlay
        updateDayNight();
        const overlay = getDayNightOverlay();
        if (overlay) {
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Wetter
        updateWeather();
        drawWeather();

        // Sterne bei Nacht
        if (dayTime > 0.8) {
            const starAlpha = (dayTime - 0.8) / 0.2;
            ctx.fillStyle = `rgba(255, 255, 200, ${starAlpha * 0.8})`;
            const seed = 42;
            for (let i = 0; i < 20; i++) {
                const sx = ((seed * (i + 1) * 7) % canvas.width);
                const sy = ((seed * (i + 1) * 13) % (canvas.height * 0.4));
                const twinkle = Math.sin(Date.now() / 500 + i) * 0.5 + 0.5;
                ctx.globalAlpha = starAlpha * twinkle;
                ctx.fillRect(sx, sy, 2, 2);
            }
            ctx.globalAlpha = 1;
        }

        // Code-View Overlay (zeigt Quellcode statt Emojis)
        drawCodeOverlay();

        requestAnimationFrame(draw);
    }

    // --- Animationen ---
    function addPlaceAnimation(r, c) {
        animations.push({
            r: r,
            c: c,
            startTime: Date.now(),
            duration: 300,
        });
    }

    function drawAnimations() {
        const now = Date.now();
        animations = animations.filter(anim => {
            const elapsed = now - anim.startTime;
            if (elapsed > anim.duration) return false;

            const progress = elapsed / anim.duration;
            const scale = progress < 0.5
                ? 0.5 + progress * 1.4
                : 1.2 - (progress - 0.5) * 0.4;

            const x = (anim.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            const y = (anim.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = 1 - progress * 0.5;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(0, 0, CELL_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            return true;
        });
    }

    // --- Maus → Grid-Koordinaten ---
    function getGridCell(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;

        const c = Math.floor(px / CELL_SIZE) - WATER_BORDER;
        const r = Math.floor(py / CELL_SIZE) - WATER_BORDER;

        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            return { r, c };
        }
        return null;
    }

    // --- Undo: Strg+Z / Cmd+Z ---
    const undoStack = [];
    const MAX_UNDO = 50;

    function pushUndo() {
        undoStack.push(JSON.stringify(grid));
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    }

    function undo() {
        if (undoStack.length === 0) return;
        grid = JSON.parse(undoStack.pop());
        window.grid = grid;
        updateStats();
        draw();
    }

    // --- Aktion auf Zelle ---
    let undoPushedThisStroke = false;

    function applyTool(r, c) {
        if (currentTool === 'build') {
            if (grid[r][c] !== currentMaterial) {
                if (!undoPushedThisStroke) { pushUndo(); undoPushedThisStroke = true; }
                grid[r][c] = currentMaterial;
                // Setzling platzieren startet Baumwachstum
                if (currentMaterial === 'sapling') {
                    treeGrowth[r + ',' + c] = Date.now();
                }
                addPlaceAnimation(r, c);
                soundBuild(currentMaterial);
                trackMaterialUsage(currentMaterial);
                maybeNpcComment(currentMaterial);
                maybeCodeEasterEgg(currentMaterial);
                recordMilestone('firstBlock');
            }
        } else if (currentTool === 'harvest') {
            const cell = grid[r][c];
            if (cell !== null) {
                if (!undoPushedThisStroke) { pushUndo(); undoPushedThisStroke = true; }
                const yield_ = HARVEST_YIELD[cell] || { material: cell, count: 1 };
                grid[r][c] = null;
                delete treeGrowth[r + ',' + c];
                addToInventory(yield_.material, yield_.count);
                unlockMaterial(yield_.material);
                addPlaceAnimation(r, c);
                soundChop();
                const info = MATERIALS[yield_.material];
                if (info) showToast(`⛏️ ${yield_.count}x ${info.emoji} ${info.label} geerntet!`);
                trackEvent('harvest', { source: cell, result: yield_.material, count: yield_.count });
            }
        } else if (currentTool === 'fill') {
            pushUndo();
            floodFill(r, c, grid[r][c], currentMaterial);
            soundBuild(currentMaterial);
        }
        // Teure Checks nur alle 200ms (nicht bei jedem Pixel beim Drag)
        requestStatsUpdate();
    }

    let statsUpdatePending = false;
    function requestStatsUpdate() {
        if (statsUpdatePending) return;
        statsUpdatePending = true;
        setTimeout(() => {
            statsUpdatePending = false;
            updateStats();
            checkAchievements();
            checkQuests();
            maybeQuestHint(currentMaterial);
            maybeHoerspiel(getGridStats());
        }, 200);
    }

    // Dusch-Prinzip: "Wärmer/Kälter" bei Quest-Fortschritt
    let lastQuestHintTime = 0;
    function maybeQuestHint(material) {
        if (Date.now() - lastQuestHintTime < 5000) return; // Max alle 5s
        const stats = getGridStats();
        for (const quest of activeQuests) {
            if (!quest.needs[material]) continue;
            const have = stats.counts[material] || 0;
            const need = quest.needs[material];
            if (have >= need) continue; // Schon erfüllt
            const percent = Math.round((have / need) * 100);
            if (percent >= 80) {
                showToast(`🔥 Fast! Noch ${need - have}x ${material} für "${quest.title}"!`);
                lastQuestHintTime = Date.now();
            } else if (percent >= 50 && have === Math.ceil(need / 2)) {
                showToast(`👀 Halbzeit! ${have}/${need} ${material} für "${quest.title}"`);
                lastQuestHintTime = Date.now();
            }
            break;
        }
    }

    // --- Flood Fill ---
    function floodFill(r, c, targetMat, fillMat) {
        if (targetMat === fillMat) return;

        const stack = [{ r, c }];
        const visited = new Set();

        while (stack.length > 0) {
            const { r: cr, c: cc } = stack.pop();
            const key = `${cr},${cc}`;

            if (visited.has(key)) continue;
            if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
            if (grid[cr][cc] !== targetMat) continue;

            visited.add(key);
            grid[cr][cc] = fillMat;
            addPlaceAnimation(cr, cc);

            stack.push({ r: cr - 1, c: cc });
            stack.push({ r: cr + 1, c: cc });
            stack.push({ r: cr, c: cc - 1 });
            stack.push({ r: cr, c: cc + 1 });
        }
    }

    // --- Statistiken aktualisieren ---
    function updateStats() {
        const counts = {};
        let total = 0;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    const mat = grid[r][c];
                    counts[mat] = (counts[mat] || 0) + 1;
                    total++;
                }
            }
        }

        if (total === 0) {
            statsContent.innerHTML = '<p>Deine Insel wartet! 🏝️</p><p>Klick links, bau los!</p>';
            return;
        }

        let html = `<p class="stat-count">Gesamt: ${total} Blöcke</p>`;

        for (const [mat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
            const info = MATERIALS[mat];
            html += `<p>${info.emoji} ${info.label}: <strong>${count}</strong></p>`;
        }

        // Fortschritt
        const percent = Math.round((total / (ROWS * COLS)) * 100);
        html += `<p style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 8px;">`;
        html += `🏝️ Insel bebaut: <strong>${percent}%</strong></p>`;

        if (percent >= 75) {
            html += '<p>🎉 Mega-Stadt!</p>';
        } else if (percent >= 50) {
            html += '<p>🏘️ Große Stadt!</p>';
        } else if (percent >= 25) {
            html += '<p>🏡 Kleine Siedlung!</p>';
        } else if (percent >= 10) {
            html += '<p>🛖 Erste Hütten!</p>';
        } else {
            html += '<p>⛺ Gerade angefangen!</p>';
        }

        statsContent.innerHTML = html;
    }

    // --- Speichern ---
    function saveProject() {
        const name = projectNameInput.value.trim() || 'Mein Bauwerk';
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');

        projects[name] = {
            grid: grid,
            date: new Date().toLocaleDateString('de-DE'),
            treeGrowth: treeGrowth,
            inventory: inventory,
            unlocked: [...unlockedMaterials],
            discovered: [...discoveredRecipes],
        };

        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        saveInventory();
        saveUnlocked();
        showToast(`💾 "${name}" gespeichert!`);
    }

    // --- Auto-Save: alle 30s still im Hintergrund ---
    const AUTOSAVE_KEY = '~autosave~';
    let lastSaveHash = '';
    function autoSave() {
        if (!grid || !grid.length) return;
        const hasContent = grid.some(row => row.some(cell => cell !== null));
        if (!hasContent) return;
        // Nur speichern wenn sich was geändert hat
        const hash = JSON.stringify(grid);
        if (hash === lastSaveHash) return;
        lastSaveHash = hash;
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        projects[AUTOSAVE_KEY] = {
            grid: grid,
            date: new Date().toLocaleDateString('de-DE'),
            auto: true,
            treeGrowth: treeGrowth,
            inventory: inventory,
            unlocked: [...unlockedMaterials],
            discovered: [...discoveredRecipes],
        };
        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        // Subtiler Indikator: Save-Button blinkt kurz
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.style.transition = 'opacity 0.3s';
            saveBtn.style.opacity = '0.5';
            setTimeout(() => { saveBtn.style.opacity = '1'; }, 600);
        }
    }
    setInterval(autoSave, 30000);
    window.addEventListener('beforeunload', autoSave);

    // --- Laden-Dialog ---
    function showLoadDialog() {
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        const names = Object.keys(projects);

        if (names.length === 0) {
            savedProjectsList.innerHTML = '<p class="no-projects">Keine Projekte gespeichert!</p>';
        } else {
            savedProjectsList.innerHTML = names.map(name => {
                const proj = projects[name];
                const displayName = name === AUTOSAVE_KEY ? '🔄 Letzte Session (Auto)' : escapeHtml(name);
                return `
                    <div class="saved-project-item" data-name="${escapeHtml(name)}">
                        <div>
                            <div class="saved-project-name">${displayName}</div>
                            <div class="saved-project-date">${proj.date}</div>
                        </div>
                        <button class="saved-project-delete" data-delete="${escapeHtml(name)}" title="Löschen">🗑️</button>
                    </div>
                `;
            }).join('');
        }

        loadDialog.classList.remove('hidden');
    }

    function isValidGrid(g) {
        return Array.isArray(g) && g.length === ROWS && g[0]?.length === COLS;
    }

    function loadProject(name) {
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        if (projects[name]) {
            const saved = projects[name].grid;
            if (isValidGrid(saved)) {
                grid = saved;
            } else {
                initGrid(); // Fallback bei kaputtem Grid
            }
            treeGrowth = projects[name].treeGrowth || {};
            inventory = projects[name].inventory || {};
            if (projects[name].unlocked) {
                unlockedMaterials = new Set(projects[name].unlocked);
                saveUnlocked();
            } else {
                unlockedMaterials = new Set();
            }
            if (projects[name].discovered) {
                discoveredRecipes = new Set(projects[name].discovered);
                saveDiscoveredRecipes();
            }
            window.grid = grid;
            migrateUnlocked();
            projectNameInput.value = name === AUTOSAVE_KEY ? '' : name;
            updateStats();
            updateInventoryDisplay();
            updatePaletteVisibility();
            draw();
            loadDialog.classList.add('hidden');
            showToast(`📂 "${name}" geladen!`);
        }
    }

    function deleteProject(name) {
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        delete projects[name];
        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        showLoadDialog(); // Dialog aktualisieren
        showToast(`🗑️ "${name}" gelöscht!`);
    }

    function newProject() {
        initGrid();
        treeGrowth = {};
        inventory = {};
        unlockedMaterials = new Set();
        discoveredRecipes = new Set();
        saveInventory();
        saveUnlocked();
        saveDiscoveredRecipes();
        projectNameInput.value = '';
        updateStats();
        updateInventoryDisplay();
        updatePaletteVisibility();
        draw();
        showToast('🆕 Neue Insel!');
    }

    // --- Toast-Queue (Weber: "Ein Toast nach dem anderen. Ordnung muss sein.") ---
    const toastQueue = [];
    let toastBusy = false;

    function showToast(message, duration) {
        toastQueue.push({ message, duration: duration || 2500 });
        if (!toastBusy) processToastQueue();
    }
    window.showToast = showToast;

    function processToastQueue() {
        if (toastQueue.length === 0) {
            toastBusy = false;
            return;
        }
        toastBusy = true;
        const { message, duration } = toastQueue.shift();
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            dismissToast();
        }, duration);
    }

    function dismissToast() {
        clearTimeout(toast._timeout);
        toast.classList.add('hidden');
        toastQueue.length = 0; // Queue leeren — nicht nachladen beim Bauen
        toastBusy = false;
    }

    // Toast verschwindet sofort bei Canvas-Interaktion
    canvas.addEventListener('mousedown', dismissToast);
    canvas.addEventListener('touchstart', dismissToast);

    // --- Hilfsfunktionen ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================================
    // === FEYNMAN-MESSPUNKTE === (Testprotokoll-Daten)
    // ============================================================
    const sessionClock = { start: null, firstBlock: null, firstChat: null, firstCodeView: null, firstEasterEgg: null };

    window.startSessionClock = function () {
        sessionClock.start = Date.now();
        trackEvent('clock_start', {});
    };

    function recordMilestone(key) {
        if (sessionClock.start && !sessionClock[key]) {
            sessionClock[key] = Date.now();
            const elapsed = Math.round((sessionClock[key] - sessionClock.start) / 1000);
            trackEvent('milestone', { key, seconds: elapsed });
        }
    }

    // Exportieren für chat.js
    window.recordMilestone = recordMilestone;

    // Feynman-Dashboard: alle Messpunkte auf einmal
    window.getTestData = function () {
        const s = sessionClock;
        const elapsed = (key) => s.start && s[key] ? Math.round((s[key] - s.start) / 1000) + 's' : '—';
        const analytics = getAnalytics();
        const events = analytics.events || [];
        const builds = events.filter(e => e.e === 'build').length;
        const demolishes = events.filter(e => e.e === 'demolish').length;
        const uniqueMats = new Set(events.filter(e => e.e === 'build').map(e => e.d?.material)).size;
        const easterEggs = events.filter(e => e.e === 'easter_egg').length;
        const hoerspiele = events.filter(e => e.e === 'hoerspiel').length;
        const codeZauber = events.filter(e => e.e === 'code_zauber').length;
        const postcards = events.filter(e => e.e === 'postcard').length;
        const sessionDuration = s.start ? Math.round((Date.now() - s.start) / 1000) : 0;

        return {
            '⏱️ Session-Dauer': sessionDuration + 's',
            '🧱 Zeit bis 1. Block': elapsed('firstBlock'),
            '💬 Zeit bis 1. Chat': elapsed('firstChat'),
            '👨‍💻 Zeit bis Code-View': elapsed('firstCodeView'),
            '🔍 Zeit bis 1. Easter Egg': elapsed('firstEasterEgg'),
            '🧱 Blöcke gebaut': builds,
            '💥 Blöcke abgerissen': demolishes,
            '🎨 Materialien benutzt': uniqueMats,
            '🔍 Easter Eggs entdeckt': easterEggs,
            '🎭 Hörspiele gehört': hoerspiele,
            '✨ Zaubersprüche': codeZauber,
            '📸 Postkarten': postcards,
            '🏆 Achievements': unlockedAchievements.length,
            '📜 Quests abgeschlossen': completedQuests.length,
        };
    };

    // === EVENT LISTENERS ===

    // Intro — Session-Uhr starten
    function startGame() {
        introOverlay.classList.add('hiding');
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 600);
        window.startSessionClock();
    }

    startButton.addEventListener('click', startGame);

    // Werkzeug-Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    // --- Zuletzt benutzt: die 5 meistgenutzten Materialien oben ---
    let materialUsage = JSON.parse(localStorage.getItem('insel-mat-usage') || '{}');

    function trackMaterialUsage(mat) {
        materialUsage[mat] = (materialUsage[mat] || 0) + 1;
        localStorage.setItem('insel-mat-usage', JSON.stringify(materialUsage));
        updateRecentBar();
    }

    function updateRecentBar() {
        const bar = document.getElementById('recent-materials');
        if (!bar) return;

        // Top 5 nach Nutzung, nur freigeschaltete, keine Basis-Elemente (die sind eh da)
        const sorted = Object.entries(materialUsage)
            .filter(([mat]) => !BASE_MATERIALS.includes(mat) && MATERIALS[mat] && unlockedMaterials.has(mat))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sorted.length === 0) {
            bar.style.display = 'none';
            return;
        }

        bar.style.display = '';
        // Label behalten, Buttons neu bauen
        bar.innerHTML = '<span class="recent-label">Zuletzt</span>' +
            sorted.map(([mat]) => {
                const info = MATERIALS[mat];
                return `<button class="material-btn recent-btn" data-material="${mat}" title="${info.label}">
                    <span class="mat-emoji">${info.emoji}</span>
                </button>`;
            }).join('');

        // Click-Handler für die neuen Buttons
        bar.querySelectorAll('.material-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectMaterial(btn.dataset.material);
            });
        });
    }

    function selectMaterial(mat) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        // Active-Klasse auf den passenden Button setzen
        const target = document.querySelector(`.material-btn[data-material="${mat}"]`);
        if (target) target.classList.add('active');
        currentMaterial = mat;
        soundBuild(currentMaterial);
        currentTool = 'build';
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="build"]').classList.add('active');
    }

    // Material-Buttons — Klick = Ton spielen (Palette als Klavier)
    document.querySelectorAll('.material-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectMaterial(btn.dataset.material);
        });
    });

    // Beim Start die Leiste füllen
    updateRecentBar();

    // Canvas Maus-Events
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        undoPushedThisStroke = false;
        const cell = getGridCell(e);
        if (cell) {
            applyTool(cell.r, cell.c);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        hoverCell = getGridCell(e);
        if (isMouseDown && hoverCell && currentTool !== 'fill') {
            applyTool(hoverCell.r, hoverCell.c);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        hoverCell = null;
    });

    // Touch-Events für Tablet
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        undoPushedThisStroke = false;
        const touch = e.touches[0];
        const cell = getGridCell(touch);
        if (cell) {
            isMouseDown = true;
            applyTool(cell.r, cell.c);
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        hoverCell = getGridCell(touch);
        if (isMouseDown && hoverCell && currentTool !== 'fill') {
            applyTool(hoverCell.r, hoverCell.c);
        }
    });

    canvas.addEventListener('touchend', () => {
        isMouseDown = false;
        hoverCell = null;
    });

    // Aktions-Buttons
    document.getElementById('save-btn').addEventListener('click', saveProject);
    document.getElementById('load-btn').addEventListener('click', showLoadDialog);
    document.getElementById('new-btn').addEventListener('click', () => {
        if (confirm('Wirklich eine neue Insel anfangen? Nicht gespeicherte Änderungen gehen verloren!')) {
            newProject();
        }
    });

    // --- Postkarte von Java (Godin: "Ein Share-Moment fehlt") ---
    const postcardBtn = document.getElementById('postcard-btn');
    if (postcardBtn) {
        postcardBtn.addEventListener('click', () => {
            const stats = getGridStats();
            const name = projectNameInput.value.trim() || 'Meine Insel';

            // Temporäres Canvas für Postkarte
            const pc = document.createElement('canvas');
            const pcCtx = pc.getContext('2d');
            pc.width = canvas.width;
            pc.height = canvas.height + 80;

            // Insel kopieren
            pcCtx.drawImage(canvas, 0, 0);

            // Postkarten-Banner unten
            pcCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            pcCtx.fillRect(0, canvas.height, pc.width, 80);

            pcCtx.fillStyle = '#F9E79F';
            pcCtx.font = 'bold 18px Fredoka, sans-serif';
            pcCtx.textAlign = 'center';
            pcCtx.fillText(`📸 Grüße von der Insel Java!`, pc.width / 2, canvas.height + 28);

            pcCtx.fillStyle = '#FFFFFF';
            pcCtx.font = '14px Comic Neue, sans-serif';
            const discoveries = discoveredEggs.length;
            pcCtx.fillText(
                `🏗️ ${stats.total} Blöcke · 🎨 ${stats.uniqueMats} Materialien · 🔍 ${discoveries} Bewohner entdeckt · 🏆 ${unlockedAchievements.length} Erfolge`,
                pc.width / 2, canvas.height + 52
            );

            pcCtx.font = '11px Comic Neue, sans-serif';
            pcCtx.fillStyle = '#AAA';
            pcCtx.fillText('Außer Text nix gehext. 🏝️', pc.width / 2, canvas.height + 72);

            // Download
            const link = document.createElement('a');
            link.download = `postkarte-von-java-${name.replace(/\s+/g, '-')}.png`;
            link.href = pc.toDataURL('image/png');
            link.click();

            showToast('📸 Postkarte gespeichert! Zeig sie deinen Freunden!');
            trackEvent('postcard', { blocks: stats.total, discoveries });
        });
    }

    // Lade-Dialog Events
    document.getElementById('close-load-dialog').addEventListener('click', () => {
        loadDialog.classList.add('hidden');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !loadDialog.classList.contains('hidden')) {
            loadDialog.classList.add('hidden');
            return;
        }
        // Nicht triggern wenn Input/Textarea fokussiert
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Strg+Z / Cmd+Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
            return;
        }
        // Werkzeug-Shortcuts: B=Bauen, E=Ernten, F=Füllen
        if (e.key === 'b' || e.key === 'B') {
            selectTool('build');
        } else if (e.key === 'e' || e.key === 'E') {
            selectTool('harvest');
        } else if (e.key === 'f' || e.key === 'F') {
            selectTool('fill');
        }
    });

    savedProjectsList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.saved-project-delete');
        if (deleteBtn) {
            e.stopPropagation();
            const name = deleteBtn.dataset.delete;
            if (confirm(`"${name}" wirklich löschen?`)) {
                deleteProject(name);
            }
            return;
        }

        const item = e.target.closest('.saved-project-item');
        if (item) {
            loadProject(item.dataset.name);
        }
    });

    // Tastatur-Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.key) {
            case '1': selectMaterial('metal'); break;
            case '2': selectMaterial('wood'); break;
            case '3': selectMaterial('fire'); break;
            case '4': selectMaterial('water'); break;
            case '5': selectMaterial('earth'); break;
            case 'b': selectTool('build'); break;
            case 'e': selectTool('harvest'); break;
            case 'f': selectTool('fill'); break;
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    saveProject();
                }
                break;
        }
    });

    function selectMaterial(mat) {
        currentMaterial = mat;
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-material="${mat}"]`);
        if (btn) btn.classList.add('active');
        currentTool = 'build';
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="build"]').classList.add('active');
    }

    function selectTool(tool) {
        currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-tool="${tool}"]`);
        if (btn) btn.classList.add('active');
    }

    // --- Achievement-Liste rendern ---
    function updateAchievementDisplay() {
        const achList = document.getElementById('achievement-list');
        if (!achList) return;
        achList.innerHTML = '';
        Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
            const unlocked = unlockedAchievements.includes(id);
            const span = document.createElement('span');
            span.className = 'ach-badge' + (unlocked ? '' : ' ach-locked');
            if (unlocked) {
                span.title = ach.title + ': ' + ach.desc;
                span.textContent = ach.emoji;
            } else {
                span.title = '???';
                span.textContent = '❓';
                span.style.opacity = '0.4';
            }
            achList.appendChild(span);
        });
    }

    // --- Theme-Switcher ---
    const THEMES = ['tropical', 'night', 'candy', 'ocean', 'retro'];
    const THEME_NAMES = ['🏝️ Tropeninsel', '🌙 Nachtmodus', '🍭 Candy Pop', '🌊 Ozean', '🕹️ Retro'];
    let currentTheme = localStorage.getItem('insel-theme') || 'tropical';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('insel-theme', theme);
        // Analytics
        trackEvent('theme_change', { theme });
    }

    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
            applyTheme(THEMES[idx]);
            showToast(`${THEME_NAMES[idx]} aktiviert!`);
        });
    }

    // --- Code-View-Button ---
    const codeViewBtn = document.getElementById('code-view-btn');
    if (codeViewBtn) {
        codeViewBtn.addEventListener('click', () => {
            window.toggleCodeView();
            codeViewBtn.classList.toggle('active', codeViewActive);
        });
    }

    // --- Wetter-Button ---
    const weatherBtn = document.getElementById('weather-btn');
    const WEATHER_TYPES = ['sun', 'rain', 'rainbow'];
    const WEATHER_EMOJIS = ['☀️', '🌧️', '🌈'];
    if (weatherBtn) {
        weatherBtn.addEventListener('click', () => {
            const idx = (WEATHER_TYPES.indexOf(weather) + 1) % WEATHER_TYPES.length;
            weather = WEATHER_TYPES[idx];
            weatherTimer = 0; // Reset auto-change
            weatherBtn.textContent = WEATHER_EMOJIS[idx];
            showToast(`Wetter: ${WEATHER_EMOJIS[idx]}`);
        });
    }

    // ============================================================
    // === ANALYTICS === (→ analytics.js bei Zellteilung)
    // ============================================================
    function getAnalytics() {
        return JSON.parse(localStorage.getItem('insel-analytics') || '{}');
    }

    function trackEvent(event, data) {
        const analytics = getAnalytics();
        if (!analytics.events) analytics.events = [];
        analytics.events.push({
            e: event,
            d: data || {},
            t: Date.now(),
        });
        // Max 500 Events speichern
        if (analytics.events.length > 500) {
            analytics.events = analytics.events.slice(-500);
        }
        localStorage.setItem('insel-analytics', JSON.stringify(analytics));
    }

    function trackSession() {
        const analytics = getAnalytics();
        analytics.sessions = (analytics.sessions || 0) + 1;
        analytics.lastVisit = Date.now();
        analytics.theme = currentTheme;
        if (!analytics.firstVisit) analytics.firstVisit = Date.now();
        localStorage.setItem('insel-analytics', JSON.stringify(analytics));
    }

    // A/B-Test: Neuen Usern zufälliges Theme zuweisen
    function assignABTest() {
        const analytics = getAnalytics();
        if (!analytics.abGroup) {
            const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
            analytics.abGroup = randomTheme;
            localStorage.setItem('insel-analytics', JSON.stringify(analytics));
            applyTheme(randomTheme);
            return randomTheme;
        }
        return analytics.abGroup;
    }

    // Kennzahlen exportieren (für Feynman)
    // trackEvent für chat.js exportieren
    window.trackEvent = trackEvent;

    window.getMetrics = function () {
        const analytics = getAnalytics();
        const stats = getGridStats();
        return {
            sessions: analytics.sessions || 0,
            firstVisit: analytics.firstVisit ? new Date(analytics.firstVisit).toLocaleDateString('de-DE') : 'nie',
            lastVisit: analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleDateString('de-DE') : 'nie',
            abGroup: analytics.abGroup || 'keiner',
            theme: currentTheme,
            blocksPlaced: stats.total,
            uniqueMaterials: stats.uniqueMats,
            achievements: unlockedAchievements.length + '/' + Object.keys(ACHIEVEMENTS).length,
            questsCompleted: completedQuests.length,
            questsActive: activeQuests.length,
            events: (analytics.events || []).length,
            sessionDuration: sessionClock.start ? Math.round((Date.now() - sessionClock.start) / 1000) : 0,
            // Engagement-Score (0-100)
            engagement: Math.min(100, Math.round(
                (stats.total * 0.3) +
                (unlockedAchievements.length * 5) +
                (completedQuests.length * 10) +
                (stats.uniqueMats * 2)
            )),
        };
    };

    // --- Code-Zauber: Chat-Befehle → Grid-Aktionen ---
    // "Außer Text Nix gehext" — Worte werden Realität
    window.codeZauber = function (command) {
        const cmd = command.toLowerCase().trim();
        let result = null;

        // "baue X [material]" — platziert X Blöcke zufällig
        const baueMatch = cmd.match(/^baue?\s+(\d+)\s+(.+)/);
        if (baueMatch) {
            const count = Math.min(parseInt(baueMatch[1]), 20); // Max 20 auf einmal
            const matName = baueMatch[2].trim();
            const matKey = Object.entries(MATERIALS).find(([k, v]) =>
                v.label.toLowerCase() === matName ||
                k === matName
            );
            if (matKey) {
                let placed = 0;
                for (let i = 0; i < count * 10 && placed < count; i++) {
                    const r = Math.floor(Math.random() * ROWS);
                    const c = Math.floor(Math.random() * COLS);
                    if (!grid[r][c]) {
                        grid[r][c] = matKey[0];
                        addPlaceAnimation(r, c);
                        placed++;
                    }
                }
                soundBuild(matKey[0]);
                updateStats();
                checkAchievements();
                checkQuests();
                result = { type: 'build', placed, material: matKey[1].label };
            }
        }

        // "mach regen/sonne/regenbogen"
        if (cmd.match(/^mach\s+(regen|sonne|regenbogen)/)) {
            const w = cmd.includes('regen') && !cmd.includes('regenbogen') ? 'rain'
                    : cmd.includes('regenbogen') ? 'rainbow' : 'sun';
            weather = w;
            weatherTimer = 0;
            const weatherBtn = document.getElementById('weather-btn');
            if (weatherBtn) weatherBtn.textContent = w === 'rain' ? '🌧️' : w === 'rainbow' ? '🌈' : '☀️';
            result = { type: 'weather', weather: w };
        }

        // "lösche alles" / "reset"
        if (cmd === 'lösche alles' || cmd === 'reset') {
            initGrid();
            updateStats();
            result = { type: 'reset' };
        }

        // "party" — zufällige bunte Blöcke
        if (cmd === 'party') {
            const partyMats = ['flower', 'lamp', 'flag', 'fountain', 'mushroom'];
            for (let i = 0; i < 15; i++) {
                const r = Math.floor(Math.random() * ROWS);
                const c = Math.floor(Math.random() * COLS);
                if (!grid[r][c]) {
                    grid[r][c] = partyMats[Math.floor(Math.random() * partyMats.length)];
                    addPlaceAnimation(r, c);
                }
            }
            soundAchievement();
            updateStats();
            result = { type: 'party' };
        }

        // "zeig code" / "quellcode" — toggle Code-View
        if (cmd === 'zeig code' || cmd === 'quellcode' || cmd === 'code') {
            window.toggleCodeView();
            result = { type: 'codeview' };
        }

        return result;
    };

    // --- Code-View: zeigt den "Quellcode" hinter den Blöcken ---
    let codeViewActive = false;

    window.toggleCodeView = function () {
        codeViewActive = !codeViewActive;
        showToast(codeViewActive ? '👨‍💻 Code-Ansicht AN — so sieht ein Programmierer die Insel!' : '🎨 Normal-Ansicht');
        if (codeViewActive) {
            recordMilestone('firstCodeView');
            trackEvent('code_view_toggle', { state: 'on' });
        }
    };

    // Code-View Rendering in draw() einhängen — überschreibt Emoji-Darstellung
    const _originalDraw = draw;

    // Erweiterte draw-Funktion mit Code-View-Overlay
    function drawCodeOverlay() {
        if (!codeViewActive) return;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    const x = (c + WATER_BORDER) * CELL_SIZE;
                    const y = (r + WATER_BORDER) * CELL_SIZE;
                    // Dunkler Hintergrund
                    ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    // Code-Text (Material-Key)
                    ctx.fillStyle = '#00FF41'; // Matrix-Grün
                    ctx.font = `bold ${Math.max(8, CELL_SIZE * 0.28)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(grid[r][c], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                }
            }
        }
        // Code-View Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 200, 24);
        ctx.fillStyle = '#00FF41';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('</> CODE-VIEW: grid[r][c]', 10, 10);
    }

    // Monkey-patch requestAnimationFrame callback to add overlay
    const origRAF = window.requestAnimationFrame;

    // --- Testdaten: Export + anonymer Ping ---
    // Einfachste Persistenz: Clipboard + optional Google Sheet Webhook

    // Anonyme Test-ID (pro Gerät, nicht pro Person)
    function getAnonId() {
        let id = localStorage.getItem('insel-anon-id');
        if (!id) {
            id = 'T' + Math.random().toString(36).slice(2, 8);
            localStorage.setItem('insel-anon-id', id);
        }
        return id;
    }

    function collectTestData() {
        const s = sessionClock;
        const analytics = getAnalytics();
        const events = analytics.events || [];
        const stats = getGridStats();
        const elapsed = (key) => s.start && s[key] ? Math.round((s[key] - s.start) / 1000) : null;

        return {
            id: getAnonId(),
            ts: new Date().toISOString(),
            session: analytics.sessions || 1,
            theme: currentTheme,
            abGroup: analytics.abGroup || null,
            duration_s: s.start ? Math.round((Date.now() - s.start) / 1000) : 0,
            ms_firstBlock: elapsed('firstBlock'),
            ms_firstChat: elapsed('firstChat'),
            ms_firstCodeView: elapsed('firstCodeView'),
            ms_firstEasterEgg: elapsed('firstEasterEgg'),
            blocks: stats.total,
            materials: stats.uniqueMats,
            achievements: unlockedAchievements.length,
            quests_done: completedQuests.length,
            quests_active: activeQuests.length,
            easter_eggs: discoveredEggs.length,
            hoerspiele: playedHoerspiele.length,
            builds: events.filter(e => e.e === 'build').length,
            demolishes: events.filter(e => e.e === 'demolish').length,
            zauber: events.filter(e => e.e === 'code_zauber').length,
            postcards: events.filter(e => e.e === 'postcard').length,
        };
    }

    // Export: Kopiert JSON in die Zwischenablage
    const testdataBtn = document.getElementById('testdata-btn');
    if (testdataBtn) {
        testdataBtn.addEventListener('click', () => {
            const data = collectTestData();
            const json = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(json).then(() => {
                showToast('📊 Testdaten kopiert! Einfügen mit Strg+V.');
            }).catch(() => {
                // Fallback: Download
                const blob = new Blob([json], { type: 'application/json' });
                const link = document.createElement('a');
                link.download = `testdaten-${data.id}.json`;
                link.href = URL.createObjectURL(blob);
                link.click();
                showToast('📊 Testdaten heruntergeladen!');
            });
        });
    }

    // Anonymer Ping: POST an konfigurierbaren Webhook (Google Sheet / Supabase / etc.)
    // Aktivieren: localStorage.setItem('insel-webhook', 'https://script.google.com/...')
    function pingWebhook() {
        const url = localStorage.getItem('insel-webhook');
        if (!url) return;
        try {
            const data = collectTestData();
            navigator.sendBeacon(url, JSON.stringify(data));
        } catch (e) { /* Stille — kein Tracking ist besser als kaputtes Tracking */ }
    }

    // Ping bei Session-Ende (Tab schließen / Navigation)
    window.addEventListener('beforeunload', pingWebhook);

    // Testdaten-Button nur zeigen wenn ?test in URL oder localStorage
    if (window.location.search.includes('test') || localStorage.getItem('insel-testmode')) {
        if (testdataBtn) testdataBtn.style.display = '';
        localStorage.setItem('insel-testmode', '1');
    }

    // Aktivieren per Konsole: localStorage.setItem('insel-testmode', '1'); location.reload()
    // Webhook setzen: localStorage.setItem('insel-webhook', 'https://...')

    // --- Block-Tracking ---

    // === START ===
    initGrid();

    // Inventar + freigeschaltete Materialien laden
    loadInventory();
    loadUnlocked();

    // Auto-Save wiederherstellen wenn vorhanden
    const savedProjects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
    if (savedProjects[AUTOSAVE_KEY] && isValidGrid(savedProjects[AUTOSAVE_KEY].grid)) {
        grid = savedProjects[AUTOSAVE_KEY].grid;
        treeGrowth = savedProjects[AUTOSAVE_KEY].treeGrowth || {};
        inventory = savedProjects[AUTOSAVE_KEY].inventory || inventory;
        if (savedProjects[AUTOSAVE_KEY].unlocked) {
            unlockedMaterials = new Set(savedProjects[AUTOSAVE_KEY].unlocked);
        } else {
            unlockedMaterials = new Set();
        }
        if (savedProjects[AUTOSAVE_KEY].discovered) {
            discoveredRecipes = new Set(savedProjects[AUTOSAVE_KEY].discovered);
        }
        window.grid = grid;
        migrateUnlocked();
        showToast('🔄 Letzte Insel wiederhergestellt');
    } else {
        // Starter-Insel: kein Save vorhanden — Oskar soll sofort verstehen was zu tun ist
        grid[12][5] = 'sand';
        grid[12][6] = 'sand';
        grid[12][7] = 'sand';
        grid[10][6] = 'tree';
        grid[13][6] = 'water';
        window.grid = grid;
        setTimeout(() => showToast('🏝️ Hier fehlt noch was... Bau los!', 3500), 2000);
    }

    draw();
    updateAchievementDisplay();
    updateQuestDisplay();
    updateInventoryDisplay();
    updatePaletteVisibility();

    // --- Crafting Dialog Events ---
    const craftBtn = document.getElementById('craft-btn');
    if (craftBtn) craftBtn.addEventListener('click', openCraftingDialog);

    const craftCloseBtn = document.getElementById('close-crafting-dialog');
    if (craftCloseBtn) craftCloseBtn.addEventListener('click', closeCraftingDialog);

    const craftDoBtn = document.getElementById('do-craft-btn');
    if (craftDoBtn) craftDoBtn.addEventListener('click', doCraft);

    const craftClearBtn = document.getElementById('clear-craft-btn');
    if (craftClearBtn) craftClearBtn.addEventListener('click', () => {
        for (let i = 0; i < 9; i++) {
            if (craftingGrid[i]) {
                addToInventory(craftingGrid[i]);
                craftingGrid[i] = null;
            }
        }
        updateCraftingDisplay();
    });

    // Crafting grid slot clicks
    document.getElementById('crafting-dialog')?.addEventListener('click', (e) => {
        // Click on crafting slot → remove item back to inventory
        const slot = e.target.closest('.craft-slot');
        if (slot) {
            const idx = parseInt(slot.dataset.index);
            if (craftingGrid[idx]) {
                addToInventory(craftingGrid[idx]);
                craftingGrid[idx] = null;
                updateCraftingDisplay();
            } else if (selectedInventoryItem && getInventoryCount(selectedInventoryItem) > 0) {
                removeFromInventory(selectedInventoryItem);
                craftingGrid[idx] = selectedInventoryItem;
                updateCraftingDisplay();
            }
            return;
        }

        // Click on inventory item → select it
        const invItem = e.target.closest('.craft-inv-item');
        if (invItem) {
            selectedInventoryItem = invItem.dataset.material;
            updateCraftingDisplay();
            return;
        }
    });

    // Escape closes crafting dialog
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const craftDialog = document.getElementById('crafting-dialog');
            if (craftDialog && !craftDialog.classList.contains('hidden')) {
                closeCraftingDialog();
            }
        }
    });

    // Theme anwenden (gespeichertes oder A/B-Test)
    if (!localStorage.getItem('insel-theme')) {
        assignABTest();
    } else {
        applyTheme(currentTheme);
    }
    trackSession();
    trackEvent('session_start', { theme: currentTheme });

    // Grid für Chat-Integration exportieren
    window.grid = grid;

})();
