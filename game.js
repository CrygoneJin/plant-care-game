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
        metal:    { emoji: '⚙️', label: 'Metall',   color: '#B0B0B0', border: '#909090' },
        wood:     { emoji: '🌱', label: 'Holz',     color: '#7DCE82', border: '#5CB85C' },
        fire:     { emoji: '🔥', label: 'Feuer',    color: '#E8752A', border: '#C75B1A' },
        water:    { emoji: '🌊', label: 'Wasser',   color: '#4A9BD9', border: '#3585C0' },
        earth:    { emoji: '🟫', label: 'Erde',     color: '#9B7340', border: '#7A5A2F' },
        // === ABGELEITETE MATERIALIEN ===
        stone:    { emoji: '🧱', label: 'Stein',    color: '#B5654A', border: '#964F38' },
        glass:    { emoji: '🪟', label: 'Glas',     color: '#C5E8F7', border: '#A0D4ED' },
        plant:    { emoji: '🌿', label: 'Pflanze',  color: '#5EAA5E', border: '#3D8B3D' },
        sapling:  { emoji: '🌱', label: 'Setzling', color: '#7DCE82', border: '#5CB85C' },
        small_tree: { emoji: '🌲', label: 'Kleiner Baum', color: '#2D7D46', border: '#1F6334' },
        tree:     { emoji: '🌳', label: 'Baum',     color: '#3A8C3A', border: '#2D6E2D' },
        flower:   { emoji: '🌸', label: 'Blume',    color: '#F4B4C4', border: '#E88DA0' },
        door:     { emoji: '🚪', label: 'Tür',      color: '#7B4B2A', border: '#5C3820' },
        roof:     { emoji: '🏠', label: 'Dach',     color: '#D14B4B', border: '#B33A3A' },
        lamp:     { emoji: '💡', label: 'Lampe',    color: '#FCE885', border: '#F5D54A' },
        sand:     { emoji: '⬜', label: 'Sand',     color: '#F0E6D0', border: '#DDD0B5' },
        path:     { emoji: '🟫', label: 'Weg',      color: '#9B7340', border: '#7A5A2F' },
        fence:    { emoji: '🏗️', label: 'Zaun',     color: '#D4A84B', border: '#B89040' },
        boat:     { emoji: '⛵', label: 'Boot',     color: '#5DADE2', border: '#2E86C1' },
        fish:     { emoji: '🐟', label: 'Fisch',    color: '#5BC0B0', border: '#3AA898' },
        fountain: { emoji: '⛲', label: 'Brunnen',  color: '#7FB3D8', border: '#5499C7' },
        flag:     { emoji: '🚩', label: 'Flagge',   color: '#D94040', border: '#B83030' },
        bridge:   { emoji: '🌉', label: 'Brücke',   color: '#C4A04A', border: '#A8883A' },
        cactus:   { emoji: '🌵', label: 'Kaktus',   color: '#4CAD5C', border: '#3A8C48' },
        mushroom: { emoji: '🍄', label: 'Pilz',     color: '#D4785A', border: '#B5604A' },
        planks:   { emoji: '🪵', label: 'Bretter',  color: '#C19A6B', border: '#A0784A' },
        window_pane: { emoji: '🪟', label: 'Fenster', color: '#D4EFFC', border: '#AED6F1' },
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
            questPanel.innerHTML = '<p class="no-quests">Rede mit den Inselbewohnern für Quests! 💬</p>';
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
        if (Math.random() > 0.15) return; // 15% Chance (Game-Design Best Practice)

        lastCommentTime = now;

        // Zufälligen NPC wählen (für Kontext-Übergabe an KI-Puffer)
        const npcKeys = Object.keys(NPC_VOICES);
        const npcId = npcKeys[Math.floor(Math.random() * npcKeys.length)];
        const npc = NPC_VOICES[npcId];

        // Grid-Stats für KI-Kontext (10% der Aufrufe)
        const stats = Math.random() < 0.1 && typeof getGridStats === 'function'
            ? getGridStats()
            : null;

        // KI-Puffer versuchen (nur wenn chat.js geladen und online)
        let comment = null;
        if (typeof window.requestAiComment === 'function') {
            const aiText = window.requestAiComment(material, npcId, stats);
            if (aiText) {
                // KI-Text mit NPC-Emoji versehen
                comment = `${npc.emoji} ${aiText}`;
            }
        }

        // Fallback: Template-System
        if (!comment) {
            comment = generateNpcComment(material);
        }

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
    // Die 5 Elemente (五行 Wu Xing) — immer in der Palette sichtbar
    const BASE_MATERIALS = ['metal', 'wood', 'fire', 'water', 'earth'];

    // === INVENTAR ===
    // ============================================================
    let inventory = {};

    // --- Inventar-Limits: Slots + Stack-Größen in Zweierpotenzen ---
    // Slots starten klein, wachsen still mit (ohne zu sagen warum).
    // Stack-Limit hängt von der Wertigkeit ab: Basis-Elemente stacken hoch,
    // komplexe Artefakte (viele Eltern) stacken niedrig.

    const BASE_INVENTORY_SLOTS = 4; // Start: 4 Slots

    // Crafting-Tiefe: wie viele Eltern-Generationen hat ein Material?
    function getCraftDepth(material, seen) {
        seen = seen || new Set();
        if (seen.has(material)) return 0;
        seen.add(material);
        // Basis-Elemente haben Tiefe 0
        if (BASE_MATERIALS.includes(material)) return 0;
        // Suche das Rezept
        const recipe = CRAFTING_RECIPES.find(r => r.result === material);
        if (!recipe) return 0;
        let maxParentDepth = 0;
        for (const ing of Object.keys(recipe.ingredients)) {
            maxParentDepth = Math.max(maxParentDepth, getCraftDepth(ing, seen));
        }
        return maxParentDepth + 1;
    }

    // Stack-Limit: Zweierpotenzen, je wertvoller desto kleiner
    // Tiefe 0 (Basis): 2^6 = 64
    // Tiefe 1 (Stufe 1): 2^4 = 16
    // Tiefe 2 (Stufe 2): 2^3 = 8
    // Tiefe 3+: 2^1 = 2
    function getStackLimit(material) {
        const depth = getCraftDepth(material);
        if (depth === 0) return 64;  // 2^6
        if (depth === 1) return 16;  // 2^4
        if (depth === 2) return 8;   // 2^3
        return 2;                    // 2^1
    }

    // Inventar-Slots: wachsen still mit Erfahrung
    // Trigger: einzigartige Materialien gecrafter, Achievements, Quests
    function getInventorySlots() {
        const base = BASE_INVENTORY_SLOTS;
        // +2 Slots für je 3 verschiedene gecraftete Materialien
        const uniqueCrafted = Object.keys(inventory).filter(m => !BASE_MATERIALS.includes(m)).length;
        const craftBonus = Math.floor(uniqueCrafted / 3) * 2;
        // +2 Slots pro 5 erledigte Quests
        const questsDone = parseInt(localStorage.getItem('insel-quests-done') || '0');
        const questBonus = Math.floor(questsDone / 5) * 2;
        // +1 pro freigeschaltetem Material über die 5 Basis hinaus
        const unlockBonus = Math.max(0, unlockedMaterials.size - 5);
        // Max 24 Slots (genug für alles)
        return Math.min(24, base + craftBonus + questBonus + unlockBonus);
    }

    function getUsedSlots() {
        return Object.keys(inventory).filter(m => (inventory[m] || 0) > 0).length;
    }

    function addToInventory(material, count) {
        count = count || 1;
        const current = inventory[material] || 0;
        const stackLimit = getStackLimit(material);

        // Neues Material → braucht einen freien Slot
        if (current === 0) {
            const used = getUsedSlots();
            const max = getInventorySlots();
            if (used >= max) {
                showToast(`📦 Inventar voll! (${used}/${max} Slots)`);
                return false;
            }
        }

        // Stack-Limit prüfen
        const newCount = Math.min(current + count, stackLimit);
        const actualAdded = newCount - current;
        if (actualAdded <= 0) {
            showToast(`📦 ${MATERIALS[material]?.label || material} ist voll! (max ${stackLimit})`);
            return false;
        }

        inventory[material] = newCount;
        if (actualAdded < count) {
            showToast(`📦 Nur ${actualAdded}x passt rein (max ${stackLimit})`);
        }
        updateInventoryDisplay();
        saveInventory();
        return true;
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
        const maxSlots = getInventorySlots();
        const used = items.length;

        if (items.length === 0) {
            container.innerHTML = `<p class="inv-empty">Noch nichts gesammelt! (${maxSlots} Slots frei)</p>`;
            return;
        }
        container.innerHTML = items.map(([mat, count]) => {
            const info = MATERIALS[mat];
            if (!info) return '';
            const stackLimit = getStackLimit(mat);
            const full = count >= stackLimit;
            return `<div class="inv-item${full ? ' inv-full' : ''}" data-material="${mat}" title="${info.label}: ${count}/${stackLimit}">
                <span class="inv-emoji">${info.emoji}</span>
                <span class="inv-count">${count}/${stackLimit}</span>
            </div>`;
        }).join('') + `<div class="inv-slots" title="Inventar-Plätze">${used}/${maxSlots}</div>`;
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
    ];

    let craftingGrid = Array(9).fill(null); // 3x3 = 9 Slots

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

        // Add result to inventory + unlock in palette
        addToInventory(recipe.result, recipe.resultCount);
        unlockMaterial(recipe.result);
        soundCraft();

        const info = MATERIALS[recipe.result];
        showToast(`⚒️ ${info.emoji} ${recipe.resultCount}x ${info.label} hergestellt!`);
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

        // Update recipe book
        const recipeBook = document.getElementById('recipe-book');
        if (recipeBook) {
            recipeBook.innerHTML = CRAFTING_RECIPES.map(r => {
                const info = MATERIALS[r.result];
                return `<div class="recipe-entry">${info.emoji} ${r.desc}</div>`;
            }).join('');
        }
    }

    // --- Zustand ---
    let grid = [];
    let currentMaterial = 'metal';
    let currentTool = 'build';

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
        // Button in Palette sichtbar machen
        const btn = document.querySelector(`.material-btn[data-material="${mat}"]`);
        if (btn) {
            btn.classList.remove('craft-locked');
            btn.classList.add('craft-unlocked');
        }
        const info = MATERIALS[mat];
        if (info) showToast(`✨ Neues Artefakt: ${info.emoji} ${info.label}!`);
    }

    function updatePaletteVisibility() {
        document.querySelectorAll('.material-btn').forEach(btn => {
            const mat = btn.dataset.material;
            if (BASE_MATERIALS.includes(mat) || btn.dataset.base) return;
            if (unlockedMaterials.has(mat)) {
                btn.classList.remove('craft-locked');
                btn.classList.add('craft-unlocked');
            } else {
                btn.classList.add('craft-locked');
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
            statsContent.innerHTML = '<p>Noch nichts gebaut!</p><p>Fang einfach an! 🏗️</p>';
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
        saveInventory();
        saveUnlocked();
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

    // Material-Buttons — Klick = Ton spielen (Palette als Klavier)
    document.querySelectorAll('.material-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMaterial = btn.dataset.material;
            // Ton spielen!
            soundBuild(currentMaterial);
            // Automatisch auf "Bauen" wechseln
            currentTool = 'build';
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-tool="build"]').classList.add('active');
        });
    });

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
        achList.innerHTML = Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
            const unlocked = unlockedAchievements.includes(id);
            return `<span class="ach-badge ${unlocked ? '' : 'ach-locked'}" title="${ach.title}: ${ach.desc}">${ach.emoji}</span>`;
        }).join('');
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

    // --- Abstraktions-Aufzug-Button ---
    const codeViewBtn = document.getElementById('code-view-btn');
    if (codeViewBtn) {
        codeViewBtn.addEventListener('click', () => {
            window.toggleCodeView();
            codeViewBtn.classList.toggle('active', codeViewActive);
        });
        // Rechtsklick = eine Ebene hoch (Aufzug ▲)
        codeViewBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (abstractionLevel > 0) {
                abstractionLevel -= 2; // -2 weil toggleCodeView +1 macht
                if (abstractionLevel < -1) abstractionLevel = ABSTRACTION_LEVELS.length - 2;
                window.toggleCodeView();
                codeViewBtn.classList.toggle('active', codeViewActive);
            }
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

    // --- Abstraction Level Explorer: Aufzug durch die Computer-Ebenen ---
    // Der volle Stack: User → Browser → Netzwerk → OS → Worte → ASCII → Hex → Byte → Nibble → Bit
    // Plus Index (Haustür) und Server (Zuhause)
    const ABSTRACTION_LEVELS = [
        { id: 'user',    label: '🎮 User',      desc: 'So siehst du die Insel' },
        { id: 'browser', label: '🦎 Browser',   desc: 'Hier wohnt die Webseite — die Eidechse liest den Index!' },
        { id: 'netz',    label: '📡 Netzwerk',  desc: 'So telefonieren die Bewohner nach Hause' },
        { id: 'os',      label: '🏗️ System',    desc: 'Das Betriebssystem — der Hausmeister' },
        { id: 'worte',   label: '📝 Worte',     desc: 'Hinter jedem Emoji steckt ein Wort' },
        { id: 'ascii',   label: '🔤 ASCII',     desc: 'Jeder Buchstabe hat eine Nummer' },
        { id: 'hex',     label: '🔢 Hex',       desc: 'Computer zählen mit 16 Ziffern' },
        { id: 'byte',    label: '📦 Byte',      desc: '8 Bits = 1 Byte = 1 Buchstabe' },
        { id: 'nibble',  label: '🧩 Nibble',    desc: 'Ein halbes Byte — zum Anknabbern' },
        { id: 'bit',     label: '💡 Bit',       desc: 'An oder Aus. 1 oder 0. Das ist alles.' },
    ];

    let abstractionLevel = 0; // 0 = User (normal), 9 = Bit (tiefste Ebene)
    let codeViewActive = false; // Backward compat
    let bitFlips = []; // { r, c, charIdx, bitIdx, original, flipped, time }
    const CRC_REPAIR_MS = 3000; // CRC-Polizei repariert nach 3 Sekunden

    // Text-Encoder: Material-Key → Bytes für tiefe Ebenen
    function textToBytes(text) {
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            bytes.push(text.charCodeAt(i));
        }
        return bytes;
    }

    function byteToBits(byte) {
        return byte.toString(2).padStart(8, '0');
    }

    function byteToHex(byte) {
        return byte.toString(16).toUpperCase().padStart(2, '0');
    }

    function byteToNibbles(byte) {
        const hi = (byte >> 4) & 0xF;
        const lo = byte & 0xF;
        return [hi.toString(16).toUpperCase(), lo.toString(16).toUpperCase()];
    }

    // Abstraktionsebene wechseln (Aufzug)
    window.toggleCodeView = function () {
        abstractionLevel++;
        if (abstractionLevel >= ABSTRACTION_LEVELS.length) {
            abstractionLevel = 0;
        }
        codeViewActive = abstractionLevel > 0;
        const lvl = ABSTRACTION_LEVELS[abstractionLevel];
        showToast(`${lvl.label} / ${lvl.desc}`);

        // Button-Text aktualisieren
        const btn = document.getElementById('code-view-btn');
        if (btn) {
            if (abstractionLevel === 0) {
                btn.innerHTML = '&lt;/&gt;';
            } else {
                btn.textContent = '/' + abstractionLevel;
            }
        }

        if (abstractionLevel === 1) {
            recordMilestone('firstCodeView');
            trackEvent('abstraction_level', { level: lvl.id });
        } else if (abstractionLevel > 1) {
            trackEvent('abstraction_level', { level: lvl.id });
        }
    };

    // Bit flippen — nur auf Bit-Ebene (Level 9)
    function flipBitAt(r, c) {
        if (abstractionLevel !== 9 || !grid[r][c]) return;
        const text = grid[r][c];
        const charIdx = Math.floor(Math.random() * text.length);
        const bitIdx = Math.floor(Math.random() * 8);
        const origByte = text.charCodeAt(charIdx);
        const flippedByte = origByte ^ (1 << bitIdx);
        const flippedChar = String.fromCharCode(flippedByte);
        const flippedText = text.substring(0, charIdx) + flippedChar + text.substring(charIdx + 1);

        // Temporär Grid verändern — Konsequenz sichtbar auf ALLEN Ebenen
        const original = grid[r][c];
        grid[r][c] = flippedText;

        bitFlips.push({
            r, c, charIdx, bitIdx,
            original: original,
            flipped: flippedText,
            origByte, flippedByte,
            time: Date.now()
        });

        showToast(`⚡ Bit geflippt! ${byteToBits(origByte)} → ${byteToBits(flippedByte)}`);
        trackEvent('bit_flip', { material: original, result: flippedText });

        // CRC-Polizei repariert nach 3 Sekunden
        setTimeout(() => {
            // Nur reparieren wenn der Flip noch aktiv ist
            if (grid[r][c] === flippedText) {
                grid[r][c] = original;
                showToast('🧬 ECC-Polizei: Fehler erkannt & repariert! Doppelhelix-Backup.');
            }
            bitFlips = bitFlips.filter(f => !(f.r === r && f.c === c && f.time === bitFlips.find(bf => bf.r === r && bf.c === c)?.time));
        }, CRC_REPAIR_MS);
    }

    // Rendering für jede Abstraktionsebene
    function drawCodeOverlay() {
        if (abstractionLevel === 0) return;

        const lvl = ABSTRACTION_LEVELS[abstractionLevel];
        const now = Date.now();

        // Browser-Ebene (/1): index.html + DOM-Baum
        if (abstractionLevel === 1) {
            drawBrowserLevel(now);
        }

        // Netzwerk-Ebene (/2): HTTP-Pakete fliegen
        if (abstractionLevel === 2) {
            drawNetworkLevel(now);
        }

        // OS-Ebene (/3): Prozesse, Dateisystem
        if (abstractionLevel === 3) {
            drawOSLevel(now);
        }

        // Ab Worte-Ebene (/4+): Zellen-Inhalte transformieren
        if (abstractionLevel >= 4) {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!grid[r][c]) continue;
                    const x = (c + WATER_BORDER) * CELL_SIZE;
                    const y = (r + WATER_BORDER) * CELL_SIZE;
                    const material = grid[r][c];
                    const bytes = textToBytes(material);

                    // Ist dieses Feld gerade bit-geflippt? (Glitch-Effekt)
                    const activeFlip = bitFlips.find(f => f.r === r && f.c === c);
                    const isGlitched = !!activeFlip;

                    // Hintergrundfarbe: normal = dunkel, glitched = rot pulsierend
                    if (isGlitched) {
                        const pulse = Math.sin(now * 0.01) * 0.2 + 0.5;
                        ctx.fillStyle = `rgba(200, 30, 30, ${0.7 + pulse * 0.2})`;
                    } else {
                        ctx.fillStyle = 'rgba(30, 30, 30, 0.88)';
                    }
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

                    const dataColor = isGlitched ? '#FF4444' : '#00FF41';
                    const fontSize = Math.max(7, CELL_SIZE * 0.22);
                    ctx.fillStyle = dataColor;
                    ctx.font = `bold ${fontSize}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    switch (abstractionLevel) {
                        case 4: // Worte — Material-Key als Text
                            ctx.fillText(material, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                            break;
                        case 5: // ASCII — Zeichencodes
                            ctx.font = `bold ${Math.max(6, CELL_SIZE * 0.18)}px monospace`;
                            ctx.fillText(bytes.join(' '), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                            break;
                        case 6: // Hex — die HEXen zählen hier
                            ctx.font = `bold ${Math.max(6, CELL_SIZE * 0.18)}px monospace`;
                            ctx.fillText(bytes.map(byteToHex).join(' '), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                            break;
                        case 7: // Byte — Binär
                            ctx.font = `bold ${Math.max(5, CELL_SIZE * 0.12)}px monospace`;
                            ctx.fillText(bytes.map(byteToBits).join(' '), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                            break;
                        case 8: // Nibble — Halbe Bytes
                            ctx.font = `bold ${Math.max(6, CELL_SIZE * 0.16)}px monospace`;
                            const nibbles = bytes.flatMap(byteToNibbles);
                            ctx.fillText(nibbles.join(' '), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                            break;
                        case 9: // Bit — Einzelne Bits, klickbar
                            drawBitLevel(x, y, bytes, isGlitched, activeFlip);
                            break;
                    }
                }
            }
        }

        // Grid-Koordinaten als "Programm" (cyan) ab ASCII-Ebene
        if (abstractionLevel >= 5) {
            ctx.fillStyle = '#00DDFF';
            ctx.font = `${Math.max(6, CELL_SIZE * 0.15)}px monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            for (let r = 0; r < ROWS; r++) {
                const y = (r + WATER_BORDER) * CELL_SIZE;
                ctx.fillText(`[${r}]`, 2, y + 2);
            }
            for (let c = 0; c < COLS; c++) {
                const x = (c + WATER_BORDER) * CELL_SIZE;
                ctx.fillText(`[${c}]`, x + 2, 2);
            }
        }

        // Dungeon-Bewohner zeichnen
        drawDungeonNPCs();

        // Level-Anzeige (Aufzug-Display)
        const labelW = 300;
        const labelH = abstractionLevel >= 5 ? 42 : 28;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(5, 5, labelW, labelH);
        ctx.strokeStyle = '#00FF41';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, labelW, labelH);

        ctx.fillStyle = '#00FF41';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`/${abstractionLevel} ${lvl.label} — ${lvl.desc}`, 10, 9);

        // Programm/Daten Legende ab ASCII-Ebene
        if (abstractionLevel >= 5) {
            ctx.fillStyle = '#00DDFF';
            ctx.fillText('■ Programm (Adressen)', 10, 26);
            ctx.fillStyle = '#00FF41';
            ctx.fillText('■ Daten (Inhalt)', 190, 26);
        }
    }

    // --- Browser-Ebene (/1): Die Eidechse (Gecko) liest den Index ---
    function drawBrowserLevel(now) {
        const canvasW = (COLS + WATER_BORDER * 2) * CELL_SIZE;
        const canvasH = (ROWS + WATER_BORDER * 2) * CELL_SIZE;

        // Dunkler Hintergrund
        ctx.fillStyle = 'rgba(20, 20, 35, 0.85)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // index.html als "Haustür" oben
        const doorW = 200;
        const doorH = 50;
        const doorX = canvasW / 2 - doorW / 2;
        const doorY = 40;

        // Haustür
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, doorW, doorH);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏠 index.html', doorX + doorW / 2, doorY + 15);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#AAA';
        ctx.fillText('Die Haustür — ohne mich nur Salat!', doorX + doorW / 2, doorY + 35);

        // DOM-Baum: Äste von index.html zu den Grid-Zellen
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
        ctx.lineWidth = 1;
        const gridStartY = (WATER_BORDER) * CELL_SIZE;
        for (let c = 0; c < COLS; c += 3) {
            const x = (c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            ctx.beginPath();
            ctx.moveTo(doorX + doorW / 2, doorY + doorH);
            ctx.lineTo(x, gridStartY);
            ctx.stroke();
        }

        // Eidechse (Gecko) wandert durch den DOM
        const geckoX = doorX + doorW / 2 + Math.sin(now * 0.001) * 80;
        const geckoY = doorY + doorH + 15 + Math.sin(now * 0.0015) * 10;
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦎', geckoX, geckoY);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#00FF41';
        ctx.fillText('Gecko liest den DOM...', geckoX, geckoY + 14);

        // Die Zellen als <div>-Tags anzeigen
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c]) continue;
                const x = (c + WATER_BORDER) * CELL_SIZE;
                const y = (r + WATER_BORDER) * CELL_SIZE;
                ctx.fillStyle = 'rgba(30, 50, 30, 0.8)';
                ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = '#00FF41';
                ctx.font = `bold ${Math.max(6, CELL_SIZE * 0.16)}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`<${grid[r][c]}>`, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }

        // Server-Hinweis unten
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvasW / 2 - 120, canvasH - 30, 240, 25);
        ctx.fillStyle = '#00DDFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📡 Daten kommen von: localhost (Zuhause!)', canvasW / 2, canvasH - 15);
    }

    // --- Netzwerk-Ebene (/2): HTTP-Pakete fliegen hin und her ---
    let httpPackets = [];

    function drawNetworkLevel(now) {
        const canvasW = (COLS + WATER_BORDER * 2) * CELL_SIZE;
        const canvasH = (ROWS + WATER_BORDER * 2) * CELL_SIZE;

        ctx.fillStyle = 'rgba(10, 10, 30, 0.85)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Browser (links) und Server (rechts)
        const browserX = 40;
        const serverX = canvasW - 100;
        const midY = canvasH / 2;

        // Browser-Box
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(10, midY - 50, 80, 100);
        ctx.strokeStyle = '#00FF41';
        ctx.strokeRect(10, midY - 50, 80, 100);
        ctx.fillStyle = '#00FF41';
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦎', browserX + 10, midY - 15);
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Browser', browserX + 10, midY + 15);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('(Dein Computer)', browserX + 10, midY + 28);

        // Server-Box
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(serverX - 30, midY - 50, 80, 100);
        ctx.strokeStyle = '#00DDFF';
        ctx.strokeRect(serverX - 30, midY - 50, 80, 100);
        ctx.fillStyle = '#00DDFF';
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏠', serverX + 10, midY - 15);
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Server', serverX + 10, midY + 15);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('(Zuhause)', serverX + 10, midY + 28);

        // Pakete spawnen
        if (Math.random() < 0.03) {
            const goingRight = Math.random() < 0.5;
            httpPackets.push({
                x: goingRight ? browserX + 50 : serverX - 40,
                y: midY - 20 + Math.random() * 40,
                dx: goingRight ? 2.5 : -2.5,
                label: goingRight ? 'GET /index.html' : '200 OK 🦎',
                color: goingRight ? '#00FF41' : '#00DDFF',
                born: now,
            });
        }

        // Pakete zeichnen und bewegen
        httpPackets = httpPackets.filter(p => {
            p.x += p.dx;
            const age = now - p.born;
            if (age > 5000 || p.x < 0 || p.x > canvasW) return false;

            // Paket-Briefumschlag
            ctx.fillStyle = p.color;
            ctx.font = '14px serif';
            ctx.textAlign = 'center';
            ctx.fillText('📨', p.x, p.y);
            ctx.font = '7px monospace';
            ctx.fillText(p.label, p.x, p.y + 12);
            return true;
        });

        // Verbindungslinie
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.moveTo(browserX + 50, midY);
        ctx.lineTo(serverX - 40, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Protokoll-Stack (TCP/IP Schichten)
        const stackX = canvasW / 2 - 80;
        const stackY = canvasH - 120;
        const layers = [
            { name: 'HTTP', desc: 'Briefe schreiben', color: '#00FF41', emoji: '✉️' },
            { name: 'TCP',  desc: 'Briefe nummerieren', color: '#00DD41', emoji: '📋' },
            { name: 'IP',   desc: 'Adresse draufschreiben', color: '#00BB41', emoji: '📮' },
            { name: 'Kabel', desc: 'Postbote fährt los', color: '#009941', emoji: '🚚' },
        ];
        for (let i = 0; i < layers.length; i++) {
            const ly = stackY + i * 22;
            ctx.fillStyle = 'rgba(0, 30, 0, 0.8)';
            ctx.fillRect(stackX, ly, 160, 20);
            ctx.strokeStyle = layers[i].color;
            ctx.strokeRect(stackX, ly, 160, 20);
            ctx.fillStyle = layers[i].color;
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${layers[i].emoji} ${layers[i].name}: ${layers[i].desc}`, stackX + 5, ly + 14);
        }

        // Grid-Zellen als Netzwerk-Datenpakete
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c]) continue;
                const x = (c + WATER_BORDER) * CELL_SIZE;
                const y = (r + WATER_BORDER) * CELL_SIZE;
                ctx.fillStyle = 'rgba(20, 30, 50, 0.6)';
                ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = '#00DDFF';
                ctx.font = `${Math.max(6, CELL_SIZE * 0.14)}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`📨${grid[r][c]}`, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }
    }

    // --- OS-Ebene (/3): Der Hausmeister verwaltet alles ---
    function drawOSLevel(now) {
        const canvasW = (COLS + WATER_BORDER * 2) * CELL_SIZE;
        const canvasH = (ROWS + WATER_BORDER * 2) * CELL_SIZE;

        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Prozess-Tabelle oben
        ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
        ctx.fillRect(10, 10, canvasW - 20, 60);
        ctx.strokeStyle = '#FFD700';
        ctx.strokeRect(10, 10, canvasW - 20, 60);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏗️ BETRIEBSSYSTEM — Der Hausmeister', 20, 28);

        const processes = [
            { pid: 1, name: 'init', desc: 'Der Erste — startet alle anderen' },
            { pid: 42, name: 'browser', desc: '🦎 Hier wohnt die Insel!' },
            { pid: 99, name: 'scheduler', desc: '⏰ Wer ist als nächstes dran?' },
        ];
        ctx.font = '9px monospace';
        ctx.fillStyle = '#00FF41';
        const procY = 42;
        for (let i = 0; i < processes.length; i++) {
            const px = 20 + i * (canvasW / 3 - 15);
            ctx.fillText(`PID ${processes[i].pid}: ${processes[i].name}`, px, procY);
            ctx.fillStyle = '#888';
            ctx.fillText(processes[i].desc, px, procY + 12);
            ctx.fillStyle = '#00FF41';
        }

        // Dateisystem: Grid-Zellen als Dateien
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c]) continue;
                const x = (c + WATER_BORDER) * CELL_SIZE;
                const y = (r + WATER_BORDER) * CELL_SIZE;
                ctx.fillStyle = 'rgba(25, 25, 40, 0.8)';
                ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = '#FFD700';
                ctx.font = `${Math.max(6, CELL_SIZE * 0.15)}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`📁 ${grid[r][c]}`, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }

        // Speicher-Balken unten
        const usedCells = grid.flat().filter(Boolean).length;
        const totalCells = ROWS * COLS;
        const pct = (usedCells / totalCells * 100).toFixed(0);
        const barW = canvasW - 40;
        const barH = 16;
        const barY = canvasH - 30;
        ctx.fillStyle = '#333';
        ctx.fillRect(20, barY, barW, barH);
        ctx.fillStyle = pct > 80 ? '#FF4444' : '#00FF41';
        ctx.fillRect(20, barY, barW * usedCells / totalCells, barH);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(20, barY, barW, barH);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Speicher: ${usedCells}/${totalCells} Zellen belegt (${pct}%)`, canvasW / 2, barY + 12);
    }

    // Bit-Ebene: Jedes Bit einzeln, Matrix-Regen-Stil
    function drawBitLevel(x, y, bytes, isGlitched, activeFlip) {
        const allBits = bytes.map(byteToBits).join('');
        const fontSize = Math.max(5, CELL_SIZE * 0.1);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const chW = fontSize * 0.65;
        const chH = fontSize * 1.2;
        const colsPerRow = Math.floor((CELL_SIZE - 4) / chW);
        const now = Date.now();

        for (let i = 0; i < allBits.length; i++) {
            const col = i % colsPerRow;
            const row = Math.floor(i / colsPerRow);
            const bx = x + 2 + col * chW;
            const by = y + 2 + row * chH;

            if (by > y + CELL_SIZE - 2) break;

            // Matrix-Regen-Effekt: Bits flackern leicht
            const flicker = Math.sin(now * 0.003 + i * 0.5) * 0.15;
            const bit = allBits[i];

            if (isGlitched && activeFlip) {
                // Geflipptes Bit rot hervorheben
                const byteIdx = Math.floor(i / 8);
                const bitInByte = 7 - (i % 8);
                if (byteIdx === activeFlip.charIdx && bitInByte === activeFlip.bitIdx) {
                    ctx.fillStyle = '#FF0000';
                    ctx.font = `bold ${fontSize * 1.5}px monospace`;
                } else {
                    ctx.fillStyle = `rgba(255, 68, 68, ${0.6 + flicker})`;
                }
            } else {
                ctx.fillStyle = bit === '1'
                    ? `rgba(0, 255, 65, ${0.7 + flicker})`
                    : `rgba(0, 180, 40, ${0.3 + flicker * 0.5})`;
            }

            ctx.fillText(bit, bx, by);
            ctx.font = `bold ${fontSize}px monospace`;
        }
    }

    // --- Dungeon-Bewohner: NPCs die auf verschiedenen Ebenen leben ---
    // Inspiriert von Schnipsels Sohn: HEXen, ASCIIs, Hüte, Kernel-Bewohner

    const DUNGEON_NPCS = [
        // === Browser-Ebene (/1) — Wo die Webseite wohnt ===
        { id: 'gecko',       emoji: '🦎',    name: 'Gecko die Eidechse', level: 1, type: 'friend',
          say: 'Ich lese den Index! Ohne mich ist alles nur Salat — unsortierte Dateien!', speed: 1.0 },
        { id: 'dom_baum',    emoji: '🌳',    name: 'DOM-Baum',           level: 1, type: 'friend',
          say: 'Ich bin der Stammbaum der Webseite. Jedes Element hängt an einem Ast!', speed: 0.2 },
        { id: 'cookie',      emoji: '🍪',    name: 'Cookie',             level: 1, type: 'friend',
          say: 'Ich merke mir wer du bist! Aber nur mit deiner Erlaubnis.', speed: 0.8 },

        // === Netzwerk-Ebene (/2) — So telefonieren sie nach Hause ===
        { id: 'postbote',    emoji: '📮',    name: 'HTTP-Postbote',      level: 2, type: 'friend',
          say: 'GET /index.html — ich hole die Post vom Server! 200 OK = alles gut!', speed: 1.4 },
        { id: 'tcp_trucker', emoji: '🚚',    name: 'TCP-Trucker',        level: 2, type: 'friend',
          say: 'Ich nummeriere jedes Paket. Kommt eins nicht an, schick ich es nochmal!', speed: 1.2 },
        { id: 'dns_navi',    emoji: '🗺️',    name: 'DNS-Navi',           level: 2, type: 'friend',
          say: 'schatzinsel.de? Das ist 192.168.1.1! Ich übersetze Namen in Adressen.', speed: 0.9 },
        { id: 'firewall',    emoji: '🧱',    name: 'Firewall Frieda',    level: 2, type: 'friend',
          say: 'Halt! Wer will hier rein? Nur wer auf der Liste steht darf durch!', speed: 0.0 },

        // === OS-Ebene (/3) — Der Hausmeister ===
        { id: 'hausmeister', emoji: '🏗️',    name: 'OS Hausmeister',     level: 3, type: 'friend',
          say: 'Ich verwalte alles: Speicher, Dateien, Prozesse. Ohne mich herrscht Chaos!', speed: 0.6 },
        { id: 'init',        emoji: '👶',    name: 'PID 1 — Init',       level: 3, type: 'kernel',
          say: 'Ich bin der Erste! Alle anderen Prozesse sind meine Kinder.', speed: 0.0 },

        // === Worte-Ebene (/4) ===
        { id: 'wort_wilma',  emoji: '📖',    name: 'Wort-Wilma',         level: 4, type: 'friend',
          say: 'Worte sind Zaubersprüche. Schreib eins und die Welt verändert sich!', speed: 0.6 },

        // === ASCII-Ebene (/5) — Voller Energie ===
        { id: 'ascii_alex',  emoji: '⚡',    name: 'ASCII Alex',         level: 5, type: 'friend',
          say: 'Ich bin voller Energie! 65 66 67 — A B C!', speed: 1.5 },
        { id: 'ascii_anna',  emoji: '💃',    name: 'ASCII Anna',         level: 5, type: 'friend',
          say: 'Jeder Buchstabe hat Power! 65=A, 97=a — ich tanze zwischen Groß und Klein!', speed: 1.3 },

        // === Hex-Ebene (/6) — Die netten HEXen ===
        { id: 'hexe_hilda',  emoji: '🧙‍♀️', name: 'Hilda die HEXe',     level: 6, type: 'friend',
          say: 'Hex hex! Ich verwandle alles in Sechzehner-Zahlen!', speed: 0.8 },
        { id: 'hexe_hexa',   emoji: '🧙',   name: 'Hexa die HEXe',     level: 6, type: 'friend',
          say: '0x48 0x65 0x78 — das bin ICH als Hex!', speed: 1.1 },

        // === Byte-Ebene (/7) — Die Hüte ===
        { id: 'white_hat',   emoji: '🤠',    name: 'Weißer Hut',         level: 7, type: 'hat_white',
          say: 'Ich finde Fehler und repariere sie. Das ist mein Job.', speed: 1.0 },
        { id: 'red_hat',     emoji: '👹',    name: 'Red Hat — der Sonderling', level: 7, type: 'hat_red',
          say: 'Ich bin anders. Open Source! Jeder darf meinen Code lesen. Kommt rein!', speed: 0.5 },
        { id: 'overflow',    emoji: '🫠',    name: 'Buffer Overflow',    level: 7, type: 'villain',
          say: 'Ich quetsche mich in Bytes die mir nicht gehören! Platzmangel? Egal!', speed: 1.8 },

        // === Nibble-Ebene (/8) — Grauzone ===
        { id: 'grey_hat',    emoji: '🎩',    name: 'Grauer Hut',         level: 8, type: 'hat_grey',
          say: 'Hmm... ich schau mal ob hier Lücken sind. Nur gucken!', speed: 1.2 },
        { id: 'spion',       emoji: '👀',    name: 'Seiten-Kanal-Spion', level: 8, type: 'villain',
          say: 'Pssst... ich schau beim Nachbar-Nibble ab! Stückchen für Stückchen...', speed: 0.7 },

        // === Bit-Ebene (/9) — Die Tiefste. Kernel sitzt fest. ===
        { id: 'flipper',     emoji: '👾',    name: 'Bit-Flipper',        level: 9, type: 'villain',
          say: 'Hehe! Ich dreh deine Bits um! Aus 0 wird 1!', speed: 2.0 },
        { id: 'black_hat',   emoji: '🕵️',    name: 'Schwarzer Hut',      level: 9, type: 'hat_black',
          say: 'Die Lücke gehört mir! *lacht böse*', speed: 1.6 },
        { id: 'kernel_karl', emoji: '🔒',    name: 'Kernel Karl',        level: 9, type: 'kernel',
          say: 'Ich darf hier NICHT raus. Ich bewache die tiefste Ebene. Ohne mich läuft nichts.', speed: 0.0 },
        { id: 'kernel_kira', emoji: '⚙️',    name: 'Kernel Kira',        level: 9, type: 'kernel',
          say: 'Ring 0 — hier unten entscheidet sich alles. Ich starte den ganzen Computer.', speed: 0.0 },
        { id: 'scheduler',   emoji: '⏰',    name: 'Der Scheduler',      level: 8, type: 'kernel',
          say: 'Ich sage wer wann dran ist. Ohne mich reden alle durcheinander.', speed: 0.3 },
        { id: 'ecc_polizei', emoji: '🧬',    name: 'ECC-Polizei',        level: 9, type: 'friend',
          say: 'Ich finde geflippte Bits und repariere sie! Doppelhelix-Backup — wie in der DNA!', speed: 0.4 },
    ];

    // NPC-Positionen (wandern am Canvas-Rand oder zwischen Zellen)
    const npcStates = DUNGEON_NPCS.map(npc => ({
        ...npc,
        x: Math.random() * (COLS + WATER_BORDER * 2) * CELL_SIZE,
        y: Math.random() * (ROWS + WATER_BORDER * 2) * CELL_SIZE,
        dx: (Math.random() - 0.5) * npc.speed,
        dy: (Math.random() - 0.5) * npc.speed,
        showBubble: false,
        bubbleTimer: 0,
    }));

    // NPC-Bewegung updaten
    function updateNPCs(now) {
        const canvasW = (COLS + WATER_BORDER * 2) * CELL_SIZE;
        const canvasH = (ROWS + WATER_BORDER * 2) * CELL_SIZE;

        for (const npc of npcStates) {
            if (npc.speed === 0) continue; // Kernel-Bewohner sitzen fest

            // Leichte Richtungsänderung (organisches Wandern)
            npc.dx += (Math.random() - 0.5) * 0.1;
            npc.dy += (Math.random() - 0.5) * 0.1;
            const maxSpd = npc.speed;
            const spd = Math.sqrt(npc.dx * npc.dx + npc.dy * npc.dy);
            if (spd > maxSpd) {
                npc.dx = (npc.dx / spd) * maxSpd;
                npc.dy = (npc.dy / spd) * maxSpd;
            }

            npc.x += npc.dx;
            npc.y += npc.dy;

            // Bounce an Rändern
            if (npc.x < 0 || npc.x > canvasW - 20) npc.dx *= -1;
            if (npc.y < 0 || npc.y > canvasH - 20) npc.dy *= -1;
            npc.x = Math.max(0, Math.min(canvasW - 20, npc.x));
            npc.y = Math.max(0, Math.min(canvasH - 20, npc.y));

            // Sprechblase timeout
            if (npc.showBubble && now - npc.bubbleTimer > 4000) {
                npc.showBubble = false;
            }
        }
    }

    // NPCs auf ihrer Ebene zeichnen
    function drawDungeonNPCs() {
        if (abstractionLevel === 0) return;
        const now = Date.now();
        updateNPCs(now);

        const emojiSize = Math.max(14, CELL_SIZE * 0.6);

        for (const npc of npcStates) {
            // Nur NPCs der aktuellen Ebene zeigen (± 1 Ebene = halbtransparent)
            const dist = Math.abs(npc.level - abstractionLevel);
            if (dist > 1) continue;
            const alpha = dist === 0 ? 1.0 : 0.3;

            ctx.globalAlpha = alpha;

            // Typ-abhängige Effekte
            if (npc.type === 'villain') {
                // Villains: leichtes rotes Glühen
                const glow = Math.sin(now * 0.005 + npc.x) * 3 + 5;
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = glow;
            } else if (npc.type === 'kernel') {
                // Kernel: goldenes Leuchten, sitzen fest
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 4;
            } else if (npc.type.startsWith('hat_')) {
                // Hüte: farbiger Schimmer je nach Hut
                const hatColors = { hat_white: '#FFFFFF', hat_grey: '#888888', hat_black: '#333333', hat_red: '#FF2200' };
                ctx.shadowColor = hatColors[npc.type] || '#888';
                ctx.shadowBlur = 6;
            } else {
                ctx.shadowColor = '#00FF41';
                ctx.shadowBlur = 3;
            }

            // Emoji zeichnen
            ctx.font = `${emojiSize}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(npc.emoji, npc.x, npc.y);

            // Name (klein, unter dem NPC)
            ctx.shadowBlur = 0;
            ctx.font = `bold ${Math.max(7, CELL_SIZE * 0.18)}px monospace`;
            ctx.fillStyle = npc.type === 'villain' ? '#FF6666' :
                           npc.type === 'kernel' ? '#FFD700' :
                           npc.type === 'hat_red' ? '#FF4444' :
                           '#00FF41';
            ctx.fillText(npc.name, npc.x, npc.y + emojiSize * 0.6);

            // Sprechblase
            if (npc.showBubble) {
                drawSpeechBubble(npc.x, npc.y - emojiSize * 0.8, npc.say, npc.type);
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    // Sprechblase zeichnen
    function drawSpeechBubble(x, y, text, type) {
        const maxW = 180;
        const padding = 6;
        const fontSize = 9;
        ctx.font = `${fontSize}px monospace`;

        // Text umbrechen
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            const test = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(test).width > maxW - padding * 2) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = test;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineH = fontSize + 3;
        const bubbleW = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2);
        const bubbleH = lines.length * lineH + padding * 2;
        const bx = x - bubbleW / 2;
        const by = y - bubbleH;

        // Hintergrund
        const bgColor = type === 'villain' ? 'rgba(80, 0, 0, 0.9)' :
                        type === 'kernel' ? 'rgba(40, 30, 0, 0.9)' :
                        'rgba(0, 30, 0, 0.9)';
        ctx.fillStyle = bgColor;
        ctx.fillRect(bx, by, bubbleW, bubbleH);
        ctx.strokeStyle = type === 'villain' ? '#FF4444' : '#00FF41';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bubbleW, bubbleH);

        // Dreieck (Pfeil nach unten)
        ctx.beginPath();
        ctx.moveTo(x - 5, by + bubbleH);
        ctx.lineTo(x, by + bubbleH + 6);
        ctx.lineTo(x + 5, by + bubbleH);
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Text
        ctx.fillStyle = type === 'villain' ? '#FF8888' : '#00FF41';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], bx + padding, by + padding + i * lineH);
        }
    }

    // Klick auf NPC → Sprechblase
    canvas.addEventListener('click', function npcClickHandler(e) {
        if (abstractionLevel === 0) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        const emojiSize = Math.max(14, CELL_SIZE * 0.6);

        for (const npc of npcStates) {
            const dist = Math.abs(npc.level - abstractionLevel);
            if (dist > 1) continue;
            const dx = mx - npc.x;
            const dy = my - npc.y;
            if (Math.sqrt(dx * dx + dy * dy) < emojiSize) {
                npc.showBubble = true;
                npc.bubbleTimer = Date.now();
                trackEvent('dungeon_npc_talk', { npc: npc.id, level: abstractionLevel });
                showToast(`${npc.emoji} ${npc.name}: "${npc.say.substring(0, 40)}..."`);
                return; // Nur ein NPC pro Klick
            }
        }
    });

    // Click-Handler für Bit-Flip
    const origCanvasClick = canvas.onclick;
    canvas.addEventListener('click', function bitFlipHandler(e) {
        if (abstractionLevel !== 9) return;
        const cell = getGridCell(e);
        if (cell && grid[cell.r] && grid[cell.r][cell.c]) {
            flipBitAt(cell.r, cell.c);
        }
    });

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
        window.grid = grid;
        migrateUnlocked();
        showToast('🔄 Letzte Insel wiederhergestellt');
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
