// === SOUND — Audio-Funktionen ===
// Alle Sound-Funktionen als window.INSEL_SOUND exportiert (Vanilla JS, kein Build-Tool)
// Pentatonik-Töne, Kirchentonarten, Pythagoräische Stimmung

(function () {
    'use strict';

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    let lastSoundTime = 0;
    const SOUND_THROTTLE = 60; // Max ~16 Töne/Sekunde, verhindert Oszillator-Überlauf

    let masterVolume = 1.0;

    function setMasterVolume(v) { masterVolume = Math.max(0, Math.min(1, v)); }
    function getMasterVolume() { return isMuted() ? 0 : masterVolume; }
    function setMuted(m) { localStorage.setItem('insel-muted', m ? 'true' : 'false'); }
    function isMuted() { return localStorage.getItem('insel-muted') === 'true'; }

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
        if (isMuted()) return;
        try {
            const ctx = ensureAudio();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime((vol || 0.15) * masterVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* Audio nicht verfügbar — kein Problem */ }
    }

    // Glide-Ton: Frequenz fließt von startFreq zu endFreq (für Wasser)
    function playGlideTone(startFreq, endFreq, duration, type, vol) {
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            for (let detune of [0, 7]) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(startFreq, t);
                osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
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

    // Reicherer Sound: 2 Oszillatoren + leichtes Detune = Chorus-Effekt
    function playRichTone(freq, duration, type, vol) {
        if (isMuted()) return;
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            for (let detune of [0, 7]) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type || 'sine';
                osc.frequency.value = freq;
                osc.detune.value = detune;
                gain.gain.setValueAtTime((vol || 0.1) * 0.6 * masterVolume, t);
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
    // === GENESIS-Töne: Stille → Tiefe → Höhe → Akkord → Pentatonik ===
    const C2 = 65.41;   // Tiefes C
    const C3 = 130.81;  // Tiefes Mittleres C
    const C5 = 523.25;  // Hohes C
    const ELEMENT_TONES = {
        // 道 Tao = Stille. Kein Ton. Lindgren: "Manchmal ist Stille der schönste Moment."
        tao:    null,
        // ⚫ Yin = tief, dunkel, empfangend
        yin:    { freq: C2,         wave: 'sine',     dur: 0.5,  vol: 0.12 },
        // ⚪ Yang = hoch, hell, gebend
        yang:   { freq: C5,         wave: 'sine',     dur: 0.3,  vol: 0.08 },
        // ✨ Qi = Yin+Yang Akkord (wird in soundBuild als Doppelton gespielt)
        qi:     { freq: C2,         wave: 'sine',     dur: 0.4,  vol: 0.10, chord: C5 },
        // === 五音 Wu Yin — Pentatonik: 宫商角徵羽 (Gōng Shāng Jué Zhǐ Yǔ) ===
        // Pythagoräische Stimmung — Sprint 18: Erde tiefer, Feuer höher, Wasser fließend
        // 土 Erde = 宫 Gōng — tief, geerdet, Fundament (eine Oktave tiefer als vorher)
        earth:  { freq: C3,         wave: 'triangle', dur: 0.20, vol: 0.12 },
        // 金 Metall = 商 Shāng — klar, glockenartig (Quinte über Erde)
        metal:  { freq: C3 * 3/2,   wave: 'square',   dur: 0.10, vol: 0.08 },
        // 木 Holz = 角 Jué — warm, wachsend (C4, Frühling)
        wood:   { freq: C4,         wave: 'triangle', dur: 0.14, vol: 0.09 },
        // 火 Feuer = 徵 Zhǐ — höchster Ton, aufsteigend, heiß (G5 = C4 * 3)
        fire:   { freq: C4 * 3,     wave: 'sawtooth', dur: 0.06, vol: 0.06 },
        // 水 Wasser = 羽 Yǔ — fließend (glide: A4→A3, absteigende Energie)
        water:  { freq: C4 * 27/16, wave: 'sine',     dur: 0.30, vol: 0.09, glide: C3 * 27/16 },
    };

    // Erster Sound = KLONK. Laut. Befriedigend. Minecraft-Niveau.
    let firstSoundPlayed = false;

    function playKlonk() {
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            // Tiefer Schlag
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(180, t);
            osc1.frequency.exponentialRampToValueAtTime(60, t + 0.15);
            g1.gain.setValueAtTime(0.35, t);
            g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc1.connect(g1); g1.connect(ctx.destination);
            osc1.start(t); osc1.stop(t + 0.2);
            // Heller Klick obendrauf
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = 800;
            g2.gain.setValueAtTime(0.2, t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc2.connect(g2); g2.connect(ctx.destination);
            osc2.start(t); osc2.stop(t + 0.08);
        } catch (e) {}
    }

    function soundBuild(material) {
        if (isMuted()) return;
        if (!canPlaySound()) return;
        // Erster Sound der Session = KLONK (Paluten: "muss in 30 Sek auffallen")
        if (!firstSoundPlayed) {
            firstSoundPlayed = true;
            playKlonk();
            return;
        }
        const tone = ELEMENT_TONES[material];
        if (tone === null) return; // Tao = Stille
        if (tone) {
            if (tone.glide) {
                // Fließend: Frequenz gleitet von freq zu glide (Wasser)
                playGlideTone(tone.freq, tone.glide, tone.dur, tone.wave, tone.vol);
            } else {
                // Element-Ton + leichte Variation
                const freq = tone.freq * (1 + (Math.random() - 0.5) * 0.02);
                playRichTone(freq, tone.dur + Math.random() * 0.04, tone.wave, tone.vol);
            }
            // Qi-Akkord: zweiter Ton dazu
            if (tone.chord) {
                playRichTone(tone.chord * (1 + (Math.random() - 0.5) * 0.02), tone.dur, tone.wave, tone.vol * 0.7);
            }
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

    function soundDemolish(getGridStats) {
        if (isMuted()) return;
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
        if (isMuted()) return;
        // Zelda-Chest-artig: aufsteigende Fanfare mit Chorus
        playRichTone(523, 0.12, 'sine', 0.12);
        setTimeout(() => playRichTone(659, 0.12, 'sine', 0.12), 100);
        setTimeout(() => playRichTone(784, 0.25, 'triangle', 0.14), 200);
    }

    function soundQuestComplete() {
        if (isMuted()) return;
        // Mario-Level-Complete-artig: längere Fanfare
        const notes = [392, 523, 659, 784, 880];
        notes.forEach((f, i) => {
            setTimeout(() => playRichTone(f, i === notes.length - 1 ? 0.4 : 0.1, 'sine', 0.12), i * 100);
        });
    }

    function soundChop() {
        if (isMuted()) return;
        if (!canPlaySound()) return;
        playRichTone(180, 0.15, 'sawtooth', 0.1);
        setTimeout(() => playTone(120, 0.2, 'square', 0.08), 80);
    }

    function soundCraft() {
        if (isMuted()) return;
        if (!canPlaySound()) return;
        playRichTone(440, 0.1, 'sine', 0.1);
        setTimeout(() => playRichTone(554, 0.1, 'sine', 0.1), 100);
        setTimeout(() => playRichTone(659, 0.2, 'triangle', 0.12), 200);
    }

    // KLONK — lautes befriedigendes Geräusch beim Auswählen eines Materials.
    // Minecraft-Niveau: tief, körperlich, sofort. Kein Throttle — jeder Klick klingt.
    const KLONK_FREQS = {
        earth:  65,   // C2 — tief, geerdet (Sprint 18: tiefer)
        metal:  196,  // G3 — klar, glockenartig
        wood:   147,  // D3 — warm, organisch
        fire:   440,  // A4 — hoch, heiß (Sprint 18: höher)
        water:  110,  // A2 — ruhig, fließend (Sprint 18: tiefer)
        tao:    null,
        yin:    80,
        yang:   330,
        qi:     165,
    };
    function soundSelect(material) {
        if (isMuted()) return;
        const freq = KLONK_FREQS[material] || 140;
        if (freq === null) return;
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            // Hauptschlag: sawtooth, kurz, laut
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.value = freq;
            g1.gain.setValueAtTime(0.35, t);
            g1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc1.connect(g1);
            g1.connect(ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.18);
            // Oberton: leichter square-Ping
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(0.12, t + 0.01);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.start(t + 0.01);
            osc2.stop(t + 0.12);
        } catch (e) {}
    }

    // Allererster Block: tiefer Punch-Akkord — Minecraft-Moment
    function soundFirstBlock() {
        if (isMuted()) return;
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            // Tiefer Punch (180→80 Hz, triangle)
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(180, t);
            osc1.frequency.exponentialRampToValueAtTime(80, t + 0.12);
            g1.gain.setValueAtTime(0.45, t);
            g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc1.connect(g1); g1.connect(ctx.destination);
            osc1.start(t); osc1.stop(t + 0.22);
            // Knackiger Oberton (540→270 Hz, square)
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(540, t);
            osc2.frequency.exponentialRampToValueAtTime(270, t + 0.06);
            g2.gain.setValueAtTime(0.15, t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc2.connect(g2); g2.connect(ctx.destination);
            osc2.start(t); osc2.stop(t + 0.08);
            lastSoundTime = performance.now();
        } catch (e) {}
    }

    // === INVENTAR-TÖNE — Jedes Material hat einen eigenen Ton beim Auswählen ===
    // Oscar O-Ton: "Inventar sind Töne"
    // Kurze, charakteristische Sounds die sich gut anfühlen beim Durchklicken.
    function playMaterialSound(materialId) {
        if (isMuted()) return;
        try {
            const ctx = ensureAudio();
            const t = ctx.currentTime;
            switch (materialId) {
                case 'wood': {
                    // Warmer Holz-Knock: niedrige Frequenz, kurzer Attack, weich
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, t);
                    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
                    g.gain.setValueAtTime(0.25 * masterVolume, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(t); osc.stop(t + 0.15);
                    break;
                }
                case 'fire': {
                    // Zisch-Sound: hohe Frequenz, schnell abklingend, sawtooth
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(1200, t);
                    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
                    g.gain.setValueAtTime(0.12 * masterVolume, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(t); osc.stop(t + 0.1);
                    break;
                }
                case 'water': {
                    // Tropfen-Sound: Frequenz-Sweep abwärts, sine, weich
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, t);
                    osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
                    g.gain.setValueAtTime(0.18 * masterVolume, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(t); osc.stop(t + 0.25);
                    break;
                }
                case 'earth': {
                    // Dumpfer Thud: sehr niedrige Frequenz, kurz
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(80, t);
                    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
                    g.gain.setValueAtTime(0.30 * masterVolume, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(t); osc.stop(t + 0.18);
                    break;
                }
                case 'metal': {
                    // Heller Klang: hohe Frequenz, nachhallend, square + Oberton
                    const osc1 = ctx.createOscillator();
                    const g1 = ctx.createGain();
                    osc1.type = 'square';
                    osc1.frequency.value = 880;
                    g1.gain.setValueAtTime(0.10 * masterVolume, t);
                    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc1.connect(g1); g1.connect(ctx.destination);
                    osc1.start(t); osc1.stop(t + 0.35);
                    // Oberton für Glocken-Effekt
                    const osc2 = ctx.createOscillator();
                    const g2 = ctx.createGain();
                    osc2.type = 'sine';
                    osc2.frequency.value = 880 * 2.76; // Inharmonischer Oberton = glockenartig
                    g2.gain.setValueAtTime(0.06 * masterVolume, t);
                    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                    osc2.connect(g2); g2.connect(ctx.destination);
                    osc2.start(t); osc2.stop(t + 0.3);
                    break;
                }
                default: {
                    // Andere Materialien: Ton basierend auf Material-Name-Hash
                    // Erzeugt einen konsistenten, aber unterschiedlichen Ton pro Material
                    let hash = 0;
                    for (let i = 0; i < materialId.length; i++) {
                        hash = ((hash << 5) - hash + materialId.charCodeAt(i)) | 0;
                    }
                    const freq = 200 + (Math.abs(hash) % 600); // 200-800 Hz
                    const waves = ['sine', 'triangle', 'square'];
                    const wave = waves[Math.abs(hash) % waves.length];
                    const dur = 0.1 + (Math.abs(hash) % 15) / 100; // 0.10-0.25s
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = wave;
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.15 * masterVolume, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(t); osc.stop(t + dur);
                    break;
                }
            }
        } catch (e) { /* Audio nicht verfügbar */ }
    }

    // === GENRE-TONSEQUENZEN (Backlog #85) ===
    // 15 Musik-Genres mit eigenen 5-Noten-Sequenzen beim Block-Platzieren.
    // Jedes Genre hat: Tonfolge, Wellenform, Tempo, Lautstärke.
    // Wird zufällig gewechselt alle ~40 Blöcke oder manuell per setGenre().
    const GENRES = {
        // Klassik — Mozart-artig, aufsteigend, Dreiklang
        klassik:    { notes: [261.63, 329.63, 392.00, 523.25, 659.25], wave: 'sine',     dur: 0.18, vol: 0.08 },
        // Jazz — Blue Notes, Swing-Feeling
        jazz:       { notes: [220.00, 261.63, 311.13, 370.00, 440.00], wave: 'triangle', dur: 0.14, vol: 0.07 },
        // Blues — Moll-Pentatonik, klagend
        blues:      { notes: [196.00, 233.08, 261.63, 293.66, 349.23], wave: 'sawtooth', dur: 0.16, vol: 0.06 },
        // Rock — Power Chords, hart
        rock:       { notes: [146.83, 196.00, 220.00, 293.66, 392.00], wave: 'square',   dur: 0.08, vol: 0.09 },
        // Elektro — Synth-Arpeggios, hoch
        elektro:    { notes: [440.00, 523.25, 659.25, 783.99, 1046.50], wave: 'sawtooth', dur: 0.06, vol: 0.06 },
        // Reggae — Offbeat, warm, relaxed
        reggae:     { notes: [174.61, 220.00, 261.63, 329.63, 349.23], wave: 'triangle', dur: 0.20, vol: 0.07 },
        // Country — Dur-Pentatonik, fröhlich
        country:    { notes: [261.63, 293.66, 329.63, 392.00, 440.00], wave: 'triangle', dur: 0.12, vol: 0.08 },
        // Funk — Slap-Bass-artig, groovy
        funk:       { notes: [98.00, 130.81, 146.83, 196.00, 261.63], wave: 'square',   dur: 0.08, vol: 0.09 },
        // Walzer — 3/4-Takt-Feeling, elegant
        walzer:     { notes: [261.63, 329.63, 392.00, 329.63, 261.63], wave: 'sine',     dur: 0.22, vol: 0.07 },
        // Lullaby — Schlaflied, sanft, langsam
        schlaflied: { notes: [261.63, 293.66, 261.63, 196.00, 174.61], wave: 'sine',     dur: 0.28, vol: 0.05 },
        // Marsch — Militärisch, rhythmisch
        marsch:     { notes: [261.63, 261.63, 329.63, 392.00, 523.25], wave: 'square',   dur: 0.10, vol: 0.08 },
        // Samba — Brasilianisch, feurig
        samba:      { notes: [293.66, 349.23, 440.00, 523.25, 587.33], wave: 'triangle', dur: 0.08, vol: 0.08 },
        // Ambient — Schwebend, Drone-artig
        ambient:    { notes: [130.81, 164.81, 196.00, 220.00, 261.63], wave: 'sine',     dur: 0.35, vol: 0.04 },
        // Piraten — Yo-ho-ho, abenteuerlich
        piraten:    { notes: [196.00, 246.94, 293.66, 349.23, 392.00], wave: 'sawtooth', dur: 0.12, vol: 0.08 },
        // Zirkus — Verrückt, hüpfend
        zirkus:     { notes: [329.63, 440.00, 329.63, 523.25, 392.00], wave: 'square',   dur: 0.09, vol: 0.07 },
    };

    const GENRE_NAMES = Object.keys(GENRES);
    let currentGenre = GENRE_NAMES[Math.floor(Math.random() * GENRE_NAMES.length)];
    let genreNoteIndex = 0;
    let genreBlockCounter = 0;

    function setGenre(name) {
        if (GENRES[name]) {
            currentGenre = name;
            genreNoteIndex = 0;
        }
    }

    function getGenre() { return currentGenre; }
    function getGenreNames() { return GENRE_NAMES.slice(); }

    // Spielt die nächste Note der aktuellen Genre-Sequenz
    function soundGenreNote() {
        if (isMuted()) return;
        if (!canPlaySound()) return;

        // Genre-Wechsel alle ~40 Blöcke
        genreBlockCounter++;
        if (genreBlockCounter > 35 + Math.floor(Math.random() * 15)) {
            genreBlockCounter = 0;
            currentGenre = GENRE_NAMES[Math.floor(Math.random() * GENRE_NAMES.length)];
            genreNoteIndex = 0;
        }

        const genre = GENRES[currentGenre];
        const freq = genre.notes[genreNoteIndex % genre.notes.length];
        genreNoteIndex = (genreNoteIndex + 1) % genre.notes.length;

        // Leichte Variation für organischeres Gefühl
        const varFreq = freq * (1 + (Math.random() - 0.5) * 0.015);
        playRichTone(varFreq, genre.dur + Math.random() * 0.03, genre.wave, genre.vol);
    }

    window.INSEL_SOUND = {
        soundBuild,
        soundDemolish,
        soundAchievement,
        soundQuestComplete,
        soundChop,
        soundCraft,
        soundSelect,
        soundFirstBlock,
        playMaterialSound,
        // Volume-Steuerung
        setMasterVolume,
        getMasterVolume,
        setMuted,
        isMuted,
        // Genre-Tonsequenzen (Backlog #85)
        soundGenreNote,
        setGenre,
        getGenre,
        getGenreNames,
        // Low-level für Erweiterungen
        playTone,
        playRichTone,
        canPlaySound,
    };

})();
