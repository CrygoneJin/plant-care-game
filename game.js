// === SCHNIPSELS INSEL-ARCHITEKT ===

(function () {
    'use strict';

    // --- Konfiguration ---
    // Responsive grid dimensions
    const ASPECT = window.innerWidth / window.innerHeight;
    let COLS, ROWS;
    if (ASPECT > 1.5) {
        // PC/Mac landscape 16:9
        COLS = 32; ROWS = 18;
    } else if (ASPECT > 1.2) {
        // iPad landscape 4:3
        COLS = 28; ROWS = 21;
    } else {
        // Portrait / iPhone
        COLS = 18; ROWS = 28;
    }
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

    // --- Materialien (aus materials.js) ---
    const MATERIALS = window.INSEL_MATERIALS;

    // --- Infinite Craft: Worker-URL ---
    const CRAFT_URL = (window.INSEL_CONFIG?.proxy || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev') + '/craft';

    // --- LLM-Materialien aus localStorage laden/speichern ---
    function loadLlmMaterials() {
        try {
            const stored = JSON.parse(localStorage.getItem('insel-llm-materials') || '{}');
            for (const [id, mat] of Object.entries(stored)) {
                if (!MATERIALS[id]) MATERIALS[id] = mat;
            }
        } catch (e) { /* ignore corrupt data */ }
    }

    function saveLlmMaterials() {
        const llm = {};
        for (const [id, mat] of Object.entries(MATERIALS)) {
            if (id.startsWith('llm_')) llm[id] = mat;
        }
        localStorage.setItem('insel-llm-materials', JSON.stringify(llm));
    }

    loadLlmMaterials();

    // ============================================================
    // === SOUND === (aus sound.js, Fallback-Stubs wenn nicht geladen)
    // ============================================================
    const _snd = window.INSEL_SOUND || {};
    function soundBuild(material)    { if (_snd.soundBuild)       _snd.soundBuild(material); }
    function soundDemolish()         { if (_snd.soundDemolish)    _snd.soundDemolish(getGridStats); }
    function soundAchievement()      { if (_snd.soundAchievement) _snd.soundAchievement(); }
    function soundQuestComplete()    { if (_snd.soundQuestComplete) _snd.soundQuestComplete(); }
    function soundChop()             { if (_snd.soundChop)        _snd.soundChop(); }
    function soundCraft()            { if (_snd.soundCraft)       _snd.soundCraft(); }

    // ============================================================
    // === ACHIEVEMENTS === (aus achievements.js)
    // ============================================================
    const ACHIEVEMENTS = window.INSEL_ACHIEVEMENTS;

    let unlockedAchievements = JSON.parse(localStorage.getItem('insel-achievements') || '[]');

    function checkAchievements(stats) {
        if (!stats) stats = getGridStats();
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
    // === QUESTS === (aus quests.js)
    // ============================================================
    const QUEST_TEMPLATES = window.INSEL_QUEST_TEMPLATES;

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

    function checkQuests(stats) {
        if (!stats) stats = getGridStats();
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
            '🪨 Im Stein ist geritzt: "C war hier. Erster!" Daneben, viel kleiner: "War ich nicht. Fortran."',
            '🪨 Jemand ist gegen den Stein gelaufen. Daneben steht "C++" geritzt.',
            '🪨 BASIC sitzt auf dem Stein und zählt: "10, 20, 30..." Warum? "Jeder fängt mit mir an!"',
            '🪨 Am Stein lehnt eine uralte Tafel: "Pythagoras war hier. 2500 Jahre vor euch." Alle schweigen.',
        ],
        tree: [
            '🐍 Hinter dem Baum raschelt es! Eine Schlange zwinkert: "Hallo, ich bin Python!"',
            '🐍 Python gähnt: "Ich bin zwar laaangsam, aber jeder versteht mich!"',
            '🐍 Python wickelt sich um den Baum: "Die anderen rennen. Ich denke nach."',
        ],
        flower: [
            '💎 Zwischen den Blumen glitzert ein roter Edelstein! "Ruby" steht drauf.',
            '📿 Im Blumenbeet liegt eine Perlenkette. Auf dem Verschluss steht "PERL".',
        ],
        boat: [
            '🦀 Unter dem Boot sitzt ein kleiner Krebs mit einem Zahnrad. "Ich bin Rust!"',
            '⚓ Am Anker steht "Rust" geritzt. Der Krebs nickt stolz: "Ich roste NIE."',
        ],
        fence: [
            '🐦 Ein Vogel schießt über den Zaun! "Ich bin Swift!" Zack, weg.',
            '🧮 Am Zaun zählt jemand Latten: "1, 10, 11, 100..." Das ist kein Quatsch, das ist Binär!',
        ],
        fish: [
            '🦈 Ein Fisch flüstert: "Pass auf Makro auf! Der Hai macht alles RIESIG!"',
            '🐟 Der Fisch schwimmt Kreise. Immer wieder. Das nennt man eine Schleife!',
        ],
        path: [
            '🧮 Am Wegrand zählt R Kieselsteine. In Binär. Niemand hat ihn darum gebeten.',
            '🌍 Geo die Geologin kniet am Weg: "Schicht 1, Schicht 2!" R daneben: "47 Steine. In Binär: 101111."',
        ],
        bridge: [
            '🎲 Unter der Brücke spielen zwei Krabben ein Brettspiel. Das heißt Go!',
            '🌉 Auf der Brücke streiten sich zwei: "ICH baue die Brücke!" "Nee, ICH!" Am Ende braucht man beide.',
        ],
        water: [
            '☕ Das Wasser dampft! "Auf der Insel Java trinkt man viel Kaffee", murmelt C.',
            '🦈 Makro der Hai taucht auf: "ICH MACHE ALLES GRÖSSER!" Python: "Deswegen mag dich keiner."',
            '🦈 "Vorsicht vor Makro!" warnt Rust. "Sieht klein aus, wird dann RIESIG!"',
        ],
        mushroom: [
            '🍄 Unter dem Pilz sitzt eine kleine Elfe. "Ich spreche Elixir!"',
            '🍄 Hinter dem Pilz murmelt jemand: "+++++[>++<-]>!" Das ist Hirnfitz. Keiner versteht ihn.',
            '🍄 "Was hat Hirnfitz gesagt?" fragt Python. C: "Hallo. Dafür braucht er 100 Zeichen."',
        ],
        lamp: [
            '💡 Die Lampe flackert. In der Birne steht winzig: "Powered by JavaScript".',
            '💡 JavaScript wurde in 10 Tagen erfunden. Auf einer Insel! Passt ja.',
            '💡 TypeScript korrigiert JavaScript: "Da fehlt ein Typ!" JavaScript: "Ich funktioniere AUCH SO!"',
        ],
        cactus: [
            '🦜 Auf dem Kaktus sitzt ein Papagei: "Ich bin FORTRAN! Fort ran ich, nie zurück!"',
            '🦜 Fortran krächzt: "Was macht ein Baum im Internet? Er LOGGT sich ein!"',
            '🦜 "Warum können Geister nicht lügen? Man DURCH-C-T sie!" Fortran lacht allein.',
            '🦜 "Warum sitze ich auf dem Kaktus? Der STACK ist übergelaufen!"',
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

    // ============================================================
    // === INVENTAR ===
    // ============================================================
    let inventory = {};

    function addToInventory(material, count) {
        count = count || 1;
        inventory[material] = (inventory[material] || 0) + count;
        updateInventoryDisplay();
        saveInventory();
        // Genesis-Stufen prüfen (Qi oder Yin/Yang neu im Inventar)
        if (material === 'qi' || material === 'yin' || material === 'yang') {
            updateGenesisVisibility();
        }
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
            return `<div class="inv-item" data-material="${mat}" title="${info.label}: ${count}" draggable="true">
                <span class="inv-emoji">${info.emoji}</span>
                <span class="inv-count">${count}</span>
            </div>`;
        }).join('');

        // Drag & Drop Crafting (Desktop) + Tap-Tap (Touch)
        container.querySelectorAll('.inv-item').forEach(item => {
            // Desktop: Drag & Drop
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', item.dataset.material);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                container.querySelectorAll('.inv-item').forEach(i => i.classList.remove('drop-target'));
            });
            item.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = container.querySelector('.dragging');
                if (dragging && dragging !== item) {
                    item.classList.add('drop-target');
                }
            });
            item.addEventListener('dragleave', () => {
                item.classList.remove('drop-target');
            });
            item.addEventListener('drop', async e => {
                e.preventDefault();
                item.classList.remove('drop-target');
                const a = e.dataTransfer.getData('text/plain');
                const b = item.dataset.material;
                if (a && b && a !== b) {
                    await quickCraft(a, b);
                }
            });

            // Touch/Click: Tap-Tap Crafting (nur mit Bestätigung)
            item.addEventListener('click', async () => {
                const mat = item.dataset.material;
                if (craftTapFirst && craftTapFirst !== mat) {
                    // Zweites Material angeklickt — Bestätigung zeigen statt sofort craften
                    const infoA = MATERIALS[craftTapFirst];
                    const infoB = MATERIALS[mat];
                    container.querySelectorAll('.inv-item').forEach(i => i.classList.remove('tap-selected'));
                    item.classList.add('tap-selected');
                    // Bestätigungs-Toast mit Craft-Frage
                    showToast(`⚒️ ${infoA?.emoji || '?'} + ${infoB?.emoji || '?'} mischen? Nochmal tippen zum Craften!`);
                    // Drittes Tippen auf dasselbe Item = Craft bestätigen
                    craftTapPending = { a: craftTapFirst, b: mat };
                    craftTapFirst = null;
                } else if (craftTapPending && craftTapPending.b === mat) {
                    // Bestätigung: nochmal auf B getippt → jetzt wirklich craften
                    const { a, b } = craftTapPending;
                    craftTapPending = null;
                    container.querySelectorAll('.inv-item').forEach(i => i.classList.remove('tap-selected'));
                    await quickCraft(a, b);
                } else {
                    // Erstes Material auswählen
                    container.querySelectorAll('.inv-item').forEach(i => i.classList.remove('tap-selected'));
                    craftTapFirst = mat;
                    craftTapPending = null;
                    item.classList.add('tap-selected');
                }
            });
        });
    }

    let craftTapFirst = null;
    let craftTapPending = null;

    // Inventar-Tab blinken lassen wenn etwas reinkommt
    function flashInventoryTab() {
        const tab = document.querySelector('.sidebar-tab[data-tab="inventory"]');
        if (!tab) return;
        tab.classList.add('tab-flash');
        setTimeout(() => tab.classList.remove('tab-flash'), 2000);
    }

    // Quick Craft — Drag Material A auf Material B
    async function quickCraft(a, b) {
        // Prüfe ob Inventar reicht
        if ((inventory[a] || 0) < 1 || (inventory[b] || 0) < 1) {
            showToast('🤔 Nicht genug Material!');
            return;
        }

        // Festes Rezept suchen (nur 2er-Kombination)
        const recipe = CRAFTING_RECIPES.find(r => {
            const keys = Object.keys(r.ingredients);
            if (keys.length !== 2) return false;
            const [k1, k2] = keys;
            return (k1 === a && k2 === b && r.ingredients[k1] === 1 && r.ingredients[k2] === 1)
                || (k1 === b && k2 === a && r.ingredients[k1] === 1 && r.ingredients[k2] === 1);
        });

        if (recipe) {
            inventory[a]--;
            inventory[b]--;
            addToInventory(recipe.result, recipe.resultCount);
            unlockMaterial(recipe.result);
            const isNew = !discoveredRecipes.has(recipe.name);
            discoveredRecipes.add(recipe.name);
            saveDiscoveredRecipes();
            saveInventory();
            soundCraft();
            const info = MATERIALS[recipe.result];
            if (isNew) {
                showToast(`🔮 ${info.emoji} ${recipe.desc}! → Schau ins 🎒 Inventar!`, 4000);
            } else {
                showToast(`⚒️ ${info.emoji} ${recipe.resultCount}x ${info.label}! → Im 🎒 Inventar`, 3000);
            }
            flashInventoryTab();
            trackEvent('quick-craft', { a, b, result: recipe.result });
            updateInventoryDisplay();
            return;
        }

        // Kein festes Rezept → LLM fragen
        const pair = [a, b].sort().join('+');
        const localKey = `llm-craft:${pair}`;
        const localCached = localStorage.getItem(localKey);

        if (localCached) {
            inventory[a]--;
            inventory[b]--;
            saveInventory();
            applyLlmCraft(JSON.parse(localCached));
            updateInventoryDisplay();
            return;
        }

        showToast('🔮 Die Insel denkt nach...');
        try {
            const playerName = localStorage.getItem('insel-player-name') || 'Anonym';
            const res = await fetch(CRAFT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ a, b, discoverer: playerName }),
            });
            if (!res.ok) { showToast('🤔 Kein Rezept gefunden!'); return; }
            const craft = await res.json();
            if (craft.error) { showToast('🤔 Kein Rezept gefunden!'); return; }

            localStorage.setItem(localKey, JSON.stringify(craft));
            inventory[a]--;
            inventory[b]--;
            saveInventory();
            applyLlmCraft(craft);
            updateInventoryDisplay();
        } catch (e) {
            showToast('🤔 Kein Rezept gefunden!');
        }
    }

    // ============================================================
    // === CRAFTING === 3x3 Werkbank
    // ============================================================
    const CRAFTING_RECIPES = window.INSEL_CRAFTING_RECIPES;

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

    function applyLlmCraft(result) {
        // Material-ID aus Name erzeugen
        const safeName = result.name
            .toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        const matId = 'llm_' + safeName;

        const isNew = !MATERIALS[matId];
        if (isNew) {
            MATERIALS[matId] = {
                emoji: result.emoji,
                label: result.name,
                color: result.color || '#D2B4DE',
                border: result.border || '#BB8FCE',
            };
            saveLlmMaterials();
        }

        addToInventory(matId, 1);
        unlockMaterial(matId);
        soundCraft();
        showCraftResult(result.emoji, result.name, 1);

        flashInventoryTab();
        if (result.fromCache === false && isNew) {
            showToast(`🏆 WELTPREMIERE! ${result.emoji} ${result.name} — Entdecker: ${result.discoverer}! → 🎒`, 5000);
        } else if (isNew) {
            showToast(`🔮 Neues Rezept: ${result.emoji} ${result.name}! → Schau ins 🎒 Inventar!`, 4000);
        } else {
            showToast(`⚒️ ${result.emoji} 1x ${result.name} hergestellt!`);
        }

        trackEvent('llm-craft', { name: result.name, fromCache: result.fromCache });
        updateCraftingDisplay();
        return matId;
    }

    function showCraftResult(emoji, name, count) {
        const preview = document.getElementById('craft-result');
        if (!preview) return;
        preview.innerHTML = `<span class="craft-emoji">${emoji}</span><span class="craft-result-name">${count > 1 ? count + 'x ' : ''}${name}</span>`;
        preview.title = name;
        preview.classList.add('craft-success');
        setTimeout(() => preview.classList.remove('craft-success'), 800);
    }

    async function doCraft() {
        const recipe = findMatchingRecipe();
        if (recipe) {
            // Festes Rezept gefunden — normaler Crafting-Ablauf
            craftingGrid = Array(9).fill(null);
            addToInventory(recipe.result, recipe.resultCount);
            unlockMaterial(recipe.result);
            const isNew = !discoveredRecipes.has(recipe.name);
            discoveredRecipes.add(recipe.name);
            saveDiscoveredRecipes();
            soundCraft();
            const info = MATERIALS[recipe.result];
            showCraftResult(info.emoji, info.label, recipe.resultCount);
            if (isNew) {
                showToast(`🔮 Neues Rezept entdeckt: ${info.emoji} ${recipe.desc}! → Schau ins 🎒 Inventar!`, 4000);
            } else {
                showToast(`⚒️ ${info.emoji} ${recipe.resultCount}x ${info.label} hergestellt! → Im 🎒 Inventar`, 3000);
            }
            flashInventoryTab();
            trackEvent('craft', { recipe: recipe.name, result: recipe.result });
            updateCraftingDisplay();
            return;
        }

        // Kein festes Rezept — LLM-Fallback
        const placed = getCraftingIngredients();
        const placedKeys = Object.keys(placed).sort();
        if (placedKeys.length < 2) {
            showToast('🤔 Kein Rezept gefunden!');
            return;
        }

        const a = placedKeys[0];
        const b = placedKeys[1];
        const pairKey = 'llm-craft:' + a + '+' + b;
        const cached = localStorage.getItem(pairKey);

        if (cached) {
            try {
                const result = JSON.parse(cached);
                craftingGrid = Array(9).fill(null);
                applyLlmCraft(result);
            } catch (e) {
                localStorage.removeItem(pairKey);
                showToast('🤔 Cache-Fehler, bitte nochmal versuchen!');
            }
            return;
        }

        // Worker anfragen
        const craftBtn = document.getElementById('craft-btn');
        if (craftBtn) craftBtn.disabled = true;
        showToast('🔮 Die Insel denkt nach...');

        try {
            const discoverer = localStorage.getItem('insel-player-name') || 'Unbekannt';
            const response = await fetch(CRAFT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ a, b, discoverer }),
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);

            const result = await response.json();
            localStorage.setItem(pairKey, JSON.stringify(result));
            craftingGrid = Array(9).fill(null);
            applyLlmCraft(result);
        } catch (err) {
            showToast('🤔 Kein Rezept gefunden!');
        } finally {
            if (craftBtn) craftBtn.disabled = false;
        }
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
                return `<div class="craft-inv-item${selected}" data-material="${mat}" title="${info.label}">
                    <span class="inv-emoji">${info.emoji}</span>
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

        // Crafting-Hints: Zeige bis zu 3 machbare Rezepte (Ergebnis bleibt ???)
        const hintsBox = document.getElementById('craft-hints');
        if (hintsBox) {
            const craftable = CRAFTING_RECIPES.filter(r => {
                // Prüfe ob alle Zutaten im Inventar vorhanden (inklusive Grid-Inhalt nicht abziehen)
                return Object.entries(r.ingredients).every(([mat, needed]) => {
                    return (inventory[mat] || 0) >= needed;
                });
            });
            if (craftable.length === 0) {
                hintsBox.innerHTML = '<p class="craft-hint-empty">🤔 Sammle mehr Materialien!</p>';
            } else {
                const shown = craftable.slice(0, 3);
                const lines = shown.map(r => {
                    const parts = Object.entries(r.ingredients).map(([mat, count]) => {
                        const info = MATERIALS[mat];
                        return count > 1 ? `${info.emoji}×${count}` : info.emoji;
                    });
                    return `<div class="craft-hint-line">${parts.join(' + ')} → ???</div>`;
                }).join('');
                hintsBox.title = '💡 Probier mal';
                hintsBox.innerHTML = lines;
            }
        }
    }

    // --- Dirty-flag (var-gehoisted, damit requestRedraw() überall nutzbar) ---
    var needsRedraw = true;
    function requestRedraw() { needsRedraw = true; }

    // --- Zustand ---
    let grid = [];
    let currentMaterial = 'metal';
    let currentTool = 'build';

    // Ursprung + 5 Elemente — immer in der Palette sichtbar
    const BASE_MATERIALS = ['tao', 'yin', 'yang', 'qi', 'metal', 'wood', 'fire', 'water', 'earth'];

    // Starter-Set: nur Genesis-Materialien sichtbar, alles andere wird gecraftet
    const STARTER_MATERIALS = [...BASE_MATERIALS];

    // Freigeschaltete Materialien (durch Ernten oder Crafting)
    let unlockedMaterials = new Set();

    // === SPIELFIGUR (deklariert in Zeile ~1357, nach Animationen) ===

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
            if (!btn.title) btn.title = info.label;
        } else {
            // Dynamisch neuen Palette-Button erzeugen
            const palette = document.getElementById('palette');
            if (palette) {
                btn = document.createElement('button');
                btn.className = 'material-btn craft-unlocked';
                btn.dataset.material = mat;
                btn.title = info.label;
                btn.innerHTML = `<span class="mat-emoji">${info.emoji}</span>`;
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
        updateDiscoveryCounter();
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

    // === GENESIS-SICHTBARKEIT ===
    // Yin/Yang erscheinen sobald Tao auf dem Grid liegt oder im Inventar.
    // Qi erscheint sobald Qi im Inventar. Wu Xing erscheinen mit Qi.
    let _genesisYinYangShown = false;
    let _genesisQiShown = false;

    function updateGenesisVisibility() {
        // Tao irgendwo auf dem Grid?
        let taoOnGrid = false;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] === 'tao') { taoOnGrid = true; break; }
            }
            if (taoOnGrid) break;
        }
        const hasYin  = (inventory['yin']  || 0) > 0;
        const hasYang = (inventory['yang'] || 0) > 0;
        const hasQi   = (inventory['qi']   || 0) > 0;

        // Stufe 1: Yin + Yang
        if (taoOnGrid || hasYin || hasYang || hasQi) {
            const yinBtn  = document.querySelector('.material-btn[data-material="yin"]');
            const yangBtn = document.querySelector('.material-btn[data-material="yang"]');
            if (yinBtn)  yinBtn.style.display  = '';
            if (yangBtn) yangBtn.style.display = '';
            if (!_genesisYinYangShown && (yinBtn || yangBtn)) {
                _genesisYinYangShown = true;
                showToast('⚫⚪ Yin und Yang erscheinen…');
            }
        }

        // Stufe 2: Qi + Wu Xing
        if (hasQi) {
            const qiBtn  = document.querySelector('.material-btn[data-material="qi"]');
            const heading = document.getElementById('wuxing-heading');
            const wuxing = ['metal', 'wood', 'fire', 'water', 'earth'];
            if (qiBtn)  qiBtn.style.display  = '';
            if (heading) heading.style.display = '';
            wuxing.forEach(mat => {
                const btn = document.querySelector(`.material-btn[data-material="${mat}"]`);
                if (btn) btn.style.display = '';
            });
            if (!_genesisQiShown) {
                _genesisQiShown = true;
                showToast('五行 Die 5 Elemente erwachen!');
                // Qi direkt selektierbar machen, falls metal noch aktiv
                const metalBtn = document.querySelector('.material-btn[data-material="metal"]');
                if (metalBtn && !document.querySelector('.material-btn.active')) {
                    metalBtn.classList.add('active');
                    currentMaterial = 'metal';
                }
            }
        }
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
        palm:       { material: 'wood', count: 2 },
    };
    let isMouseDown = false;
    let hoverCell = null;
    let animations = [];

    // --- Spielfigur ---
    let playerName = localStorage.getItem('insel-player-name') || '';
    let playerPos  = JSON.parse(localStorage.getItem('insel-player-pos') || 'null')
                     || { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) };
    let playerDragging = false;

    // --- DOM-Elemente ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const introOverlay = document.getElementById('intro-overlay');
    const startButton = document.getElementById('start-button');

    // Name-Gruppe im Intro nur bei Erst-Besuch zeigen
    const nameGroup = document.getElementById('player-name-group');
    if (nameGroup && playerName) {
        nameGroup.style.display = 'none';
    }

    // Wiederkehrende Spieler: Intro überspringen → direkt ins Spiel
    if (localStorage.getItem('insel-projekte') && playerName && introOverlay) {
        introOverlay.style.display = 'none';
        if (window.startSessionClock) window.startSessionClock();
    }
    const statsContent = document.getElementById('stats-content');
    const projectNameInput = document.getElementById('project-name');
    const loadDialog = document.getElementById('load-dialog');
    const savedProjectsList = document.getElementById('saved-projects-list');
    const toast = document.getElementById('toast');

    // --- Echtes Atlantik-Wetter via Open-Meteo (29°N, 31°W) ---
    fetch('https://api.open-meteo.com/v1/forecast?latitude=29&longitude=-31&current=temperature_2m,rain,cloud_cover,wind_speed_10m')
        .then(r => r.json())
        .then(data => {
            const c = data.current;
            const cloud = c.cloud_cover || 0;
            const rain = c.rain || 0;
            const wind = c.wind_speed_10m || 0;

            // Map to game weather
            if (rain > 0.5) {
                if (typeof window.triggerWeather === 'function') window.triggerWeather('rain');
            } else if (cloud > 70) {
                // overcast - darken background slightly
                document.querySelector('#canvas-wrapper').style.filter = 'brightness(0.85)';
            }
            // Show weather info in stats
            const statsContent = document.getElementById('stats-content');
            if (statsContent) {
                const icon = rain > 0.5 ? '🌧️' : cloud > 70 ? '⛅' : wind > 40 ? '💨' : '☀️';
                const tempEl = document.createElement('p');
                tempEl.innerHTML = `${icon} ${Math.round(c.temperature_2m)}°C auf der Insel`;
                tempEl.style.cssText = 'font-size:11px; opacity:0.7; text-align:center;';
                statsContent.parentElement.insertBefore(tempEl, statsContent);
            }
        })
        .catch(() => {}); // Wetter ist optional, fail silently

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
        requestRedraw();
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
        // 8 Starter-Bäume am Rand verteilt (Insel fühlt sich bewachsen an)
        const starterTrees = [
            { r: 1,        c: 2        },
            { r: 1,        c: COLS - 3 },
            { r: ROWS - 2, c: 2        },
            { r: ROWS - 2, c: COLS - 3 },
            { r: Math.floor(ROWS / 2) - 1, c: 1        },
            { r: Math.floor(ROWS / 2) + 1, c: COLS - 2 },
            { r: 2,        c: Math.floor(COLS / 2) - 2 },
            { r: ROWS - 3, c: Math.floor(COLS / 2) + 2 },
        ];
        starterTrees.forEach(({ r, c }) => { grid[r][c] = 'palm'; });
        window.grid = grid; // Chat-Integration aktuell halten
    }

    // --- Zeichnen ---
    function draw() {
        if (!needsRedraw) return;
        needsRedraw = false;
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

        // Insel (Sand-Hintergrund, Strand-Rand, Wasser-Rand)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const x = (c + WATER_BORDER) * CELL_SIZE;
                const y = (r + WATER_BORDER) * CELL_SIZE;

                const isWaterEdge = r < 2 || r >= ROWS - 2 || c < 2 || c >= COLS - 2;
                const isBeachEdge = !isWaterEdge && (r === 2 || r === ROWS - 3 || c === 2 || c === COLS - 3);

                if (isWaterEdge) {
                    // Wasser-Rand: gleiche Wellen-Animation wie äußeres Wasser
                    const wave = Math.sin(time * 2 + (r + WATER_BORDER) * 0.5 + (c + WATER_BORDER) * 0.3) * 10;
                    const blue = 52 + wave;
                    ctx.fillStyle = `rgb(${blue + 0}, ${blue + 100}, ${blue + 167})`;
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    // Kein Grid-Gitter, kein Material auf Wasser-Rand
                    continue;
                }

                // Sand oder Strand (Strand etwas dunkler)
                const sandVariation = ((r * 7 + c * 13) % 5) * 2; // deterministisches Rauschen
                const sandBase = isBeachEdge ? [220, 185, 100] : [245, 222, 179];
                ctx.fillStyle = `rgb(${sandBase[0] - sandVariation}, ${sandBase[1] - sandVariation}, ${sandBase[2] - sandVariation})`;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                // Material zeichnen (Grid-Linie nur auf belegten Zellen — kein Spreadsheet-Look)
                if (grid[r][c]) {
                    const mat = MATERIALS[grid[r][c]];
                    // Subtile Zellgrenze
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                    // Tao-Flackern: instabiles Atom vor dem Zerfall
                    if (grid[r][c] === 'tao') {
                        const flicker = Math.sin(time * 8 + r * 3.7 + c * 2.3) * 0.15;
                        const base = 128;
                        const v = Math.round(base + flicker * 80);
                        // Flackert zwischen leichtem Schwarz und leichtem Weiß
                        const bw = Math.sin(time * 3 + r + c) > 0 ? v + 20 : v - 20;
                        ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
                    } else {
                        ctx.fillStyle = mat.color;
                    }
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

        // Spielfigur zeichnen
        if (playerName) {
            const px = (playerPos.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            const py = (playerPos.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            // Schatten
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(px, py + CELL_SIZE * 0.35, CELL_SIZE * 0.25, CELL_SIZE * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Figur
            ctx.font = `${CELL_SIZE * 0.65}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧒', px, py);
            // Name
            ctx.font = `bold ${Math.max(10, CELL_SIZE * 0.3)}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 3;
            ctx.strokeText(playerName, px, py - CELL_SIZE * 0.52);
            ctx.fillText(playerName, px, py - CELL_SIZE * 0.52);
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

        // Spielfigur zuletzt zeichnen (immer sichtbar über allem)
        drawPlayer();

    }

    // === SPIELFIGUR — Zeichnen + Bewegen ===
    function drawPlayer() {
        if (!playerName) return;
        const px = (playerPos.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
        const py = (playerPos.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;

        ctx.save();
        // Figur-Emoji
        ctx.font = `${CELL_SIZE * 0.7}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧒', px, py);

        // Name-Label
        const fontSize = Math.max(9, CELL_SIZE * 0.27);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(playerName, px, py - CELL_SIZE * 0.35);
        ctx.fillStyle = 'white';
        ctx.fillText(playerName, px, py - CELL_SIZE * 0.35);
        ctx.restore();
    }

    function movePlayer(dr, dc) {
        if (!playerName) return;
        const nr = playerPos.r + dr;
        const nc = playerPos.c + dc;
        // Spieler bleibt auf bebaubarem Bereich (kein Wasser-Rand)
        if (nr >= 2 && nr < ROWS - 2 && nc >= 2 && nc < COLS - 2) {
            playerPos = { r: nr, c: nc };
            requestRedraw(); // sofort zeichnen — kein Warten auf 100ms-Interval
        }
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
        requestRedraw();
    }

    // --- Aktion auf Zelle ---
    let undoPushedThisStroke = false;

    function applyTool(r, c) {
        // Wasser-Rand (äußere 2 Reihen/Spalten) ist nicht bebaubar
        if (r < 2 || r >= ROWS - 2 || c < 2 || c >= COLS - 2) return;

        if (currentTool === 'build') {
            // Hinweis: Klick auf Baum/Pflanze im Bau-Modus → Ernte-Tipp (max 1x pro 30s)
            const clickedCell = grid[r][c];
            if (clickedCell && ['tree', 'small_tree', 'sapling', 'plant', 'flower', 'mushroom'].includes(clickedCell)) {
                const now = Date.now();
                if (currentMaterial !== clickedCell && (!applyTool._lastHarvestHint || now - applyTool._lastHarvestHint > 30000)) {
                    applyTool._lastHarvestHint = now;
                    const info = MATERIALS[clickedCell];
                    showToast(`💡 Tipp: Wähle ⛏️ (Taste E) um ${info?.emoji || ''} ${info?.label || clickedCell} zu ernten!`, 3000);
                }
            }
            if (grid[r][c] !== currentMaterial) {
                // Nicht-Basis-Materialien brauchen Inventar
                if (!BASE_MATERIALS.includes(currentMaterial)) {
                    if ((inventory[currentMaterial] || 0) <= 0) {
                        showToast(`Kein ${MATERIALS[currentMaterial]?.label || currentMaterial} im Inventar!`);
                        return;
                    }
                    inventory[currentMaterial]--;
                    if (inventory[currentMaterial] <= 0) delete inventory[currentMaterial];
                    updateInventoryDisplay();
                }
                if (!undoPushedThisStroke) { pushUndo(); undoPushedThisStroke = true; }
                grid[r][c] = currentMaterial;
                checkAutomerge(r, c);
                const hint = document.getElementById('genesis-hint');
                if (hint) hint.style.display = 'none';
                // Setzling platzieren startet Baumwachstum
                if (currentMaterial === 'sapling') {
                    treeGrowth[r + ',' + c] = Date.now();
                }
                // Brunnen zieht nach 10 Sekunden Blumen an
                if (currentMaterial === 'fountain') {
                    setTimeout(() => {
                        for (let dr = -2; dr <= 2; dr++) {
                            for (let dc = -2; dc <= 2; dc++) {
                                const nr = r + dr, nc = c + dc;
                                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc] && Math.random() < 0.3) {
                                    grid[nr][nc] = 'flower';
                                }
                            }
                        }
                        requestRedraw();
                    }, 10000);
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
                // Baum hinterlässt Setzling statt leerer Zelle
                grid[r][c] = (cell === 'tree') ? 'sapling' : null;
                delete treeGrowth[r + ',' + c];
                if (cell === 'tree') treeGrowth[r + ',' + c] = Date.now();
                addToInventory(yield_.material, yield_.count);
                unlockMaterial(yield_.material);
                addPlaceAnimation(r, c);
                soundChop();
                const info = MATERIALS[yield_.material];
                if (info) showToast(`⛏️ ${yield_.count}x ${info.emoji} ${info.label} geerntet! → Im 🎒 Inventar`, 3000);
                flashInventoryTab();
                trackEvent('harvest', { source: cell, result: yield_.material, count: yield_.count });
            }
        } else if (currentTool === 'fill') {
            pushUndo();
            floodFill(r, c, grid[r][c], currentMaterial);
            soundBuild(currentMaterial);
        }
        // Teure Checks nur alle 200ms (nicht bei jedem Pixel beim Drag)
        requestStatsUpdate();
        requestRedraw();
        updateGenesisVisibility();
    }

    let statsUpdatePending = false;
    function requestStatsUpdate() {
        if (statsUpdatePending) return;
        statsUpdatePending = true;
        setTimeout(() => {
            statsUpdatePending = false;
            const stats = getGridStats();
            updateStats();
            checkAchievements(stats);
            checkQuests(stats);
            maybeQuestHint(currentMaterial, stats);
            maybeHoerspiel(stats);
        }, 200);
    }

    // Dusch-Prinzip: "Wärmer/Kälter" bei Quest-Fortschritt
    let lastQuestHintTime = 0;
    function maybeQuestHint(material, stats) {
        if (Date.now() - lastQuestHintTime < 5000) return; // Max alle 5s
        if (!stats) stats = getGridStats();
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
            // Wasser-Rand nicht überschreiben
            if (cr < 2 || cr >= ROWS - 2 || cc < 2 || cc >= COLS - 2) continue;
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
            html += `<p>${info.emoji} <strong>${count}</strong></p>`;
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
            playerPos: playerPos,
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
            updateGenesisVisibility();
            updateDiscoveryCounter();
            requestRedraw();
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
        playerPos = { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) };
        localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
        saveInventory();
        saveUnlocked();
        saveDiscoveredRecipes();
        projectNameInput.value = '';
        _genesisYinYangShown = false;
        _genesisQiShown = false;
        updateStats();
        updateInventoryDisplay();
        updatePaletteVisibility();
        updateGenesisVisibility();
        updateDiscoveryCounter();
        requestRedraw();
        showToast('🆕 Neue Insel!');
    }

    // --- Automerge (delegiert an automerge.js Modul) ---
    function checkAutomerge(r, c) {
        const AM = window.INSEL_AUTOMERGE;
        if (!AM) return;
        const merge = AM.checkMerge(grid, r, c, ROWS, COLS);
        if (!merge) return;

        // Apply merge
        const fromMats = merge.cells.map(([mr, mc]) => grid[mr][mc]);
        for (const [mr, mc] of merge.cells) {
            grid[mr][mc] = merge.result;
        }

        // Genesis-Log
        logGenesis({ type: 'merge', from: fromMats, result: merge.result, cells: merge.cells, msg: merge.msg });

        showToast(merge.msg);
        soundCraft();
        unlockMaterial(merge.result);
        if (typeof updateGenesisVisibility === 'function') updateGenesisVisibility();
        requestRedraw();

        // Spark animation overlay
        const wrapper = document.getElementById('canvas-wrapper');
        if (wrapper) {
            for (const [mr, mc] of merge.cells) {
                const spark = document.createElement('div');
                spark.className = 'merge-spark' + (merge.type === 'triplet' ? ' triplet' : '');
                const cellSize = canvas.offsetWidth / (COLS + WATER_BORDER * 2);
                spark.style.left = ((mc + WATER_BORDER) * cellSize + cellSize/2 - 20) + 'px';
                spark.style.top = ((mr + WATER_BORDER) * cellSize + cellSize/2 - 20) + 'px';
                wrapper.appendChild(spark);
                setTimeout(() => spark.remove(), 1000);
            }
        }

        // Chain merge after delay
        setTimeout(() => {
            for (const [mr, mc] of merge.cells) {
                checkAutomerge(mr, mc);
            }
        }, 500);
    }

    // ============================================================
    // === GENESIS-LOG + SPONTANER TAO-ZERFALL ===
    // ============================================================
    // Einstein: "Grau IST bereits Schwarz und Weiß."
    // Feynman: "Spontaner Zerfall mit Halbwertszeit. Wie radioaktiver Zerfall."
    // Pauli: "Yin und Yang können nicht am selben Ort sein."

    const genesisLog = [];

    function logGenesis(event) {
        genesisLog.push({ ...event, time: Date.now() });
        // Replay-Button zeigen sobald es was zu sehen gibt
        const btn = document.getElementById('genesis-replay-btn');
        const group = document.getElementById('genesis-group');
        if (btn && group && genesisLog.length > 0) {
            group.style.display = '';
        }
    }

    // Freie Nachbarzelle finden (Pauli: Yin und Yang nicht am selben Ort)
    function findFreeNeighbor(r, c) {
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        // Zufällige Reihenfolge — welche Richtung ist nicht vorhersagbar
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 2 && nr < ROWS - 2 && nc >= 2 && nc < COLS - 2 && !grid[nr][nc]) {
                return [nr, nc];
            }
        }
        return null; // Kein Platz — Pauli sagt: warten
    }

    // Spontaner Zerfall: ~5% pro Sekunde → mittlere Wartezeit ~20s
    const TAO_DECAY_CHANCE = 0.05;

    function tickTaoDecay() {
        let hasTao = false;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] !== 'tao') continue;
                hasTao = true;
                if (Math.random() > TAO_DECAY_CHANCE) continue;

                // Pauli-Check: freie Nachbarzelle?
                const free = findFreeNeighbor(r, c);
                if (!free) continue; // Kein Platz → kein Zerfall

                // ZERFALL! Symmetriebrechung.
                const [yr, yc] = free;
                grid[r][c] = 'yin';
                grid[yr][yc] = 'yang';

                logGenesis({ type: 'decay', from: 'tao', results: ['yin', 'yang'], cells: [[r,c],[yr,yc]] });

                showToast('☯️ → ⚫⚪ ZAUBER! Aus Eins wird Zwei!');
                soundCraft();
                addPlaceAnimation(r, c);
                addPlaceAnimation(yr, yc);

                // Spark-Animation
                const wrapper = document.getElementById('canvas-wrapper');
                if (wrapper) {
                    const cellSize = canvas.offsetWidth / (COLS + WATER_BORDER * 2);
                    for (const [sr, sc] of [[r,c],[yr,yc]]) {
                        const spark = document.createElement('div');
                        spark.className = 'merge-spark';
                        spark.style.left = ((sc + WATER_BORDER) * cellSize + cellSize/2 - 20) + 'px';
                        spark.style.top = ((sr + WATER_BORDER) * cellSize + cellSize/2 - 20) + 'px';
                        wrapper.appendChild(spark);
                        setTimeout(() => spark.remove(), 1000);
                    }
                }

                updateGenesisVisibility();

                // Automerge-Kettenreaktion: Yin + Yang nebeneinander → Qi
                setTimeout(() => {
                    checkAutomerge(r, c);
                    checkAutomerge(yr, yc);
                }, 800);

                requestRedraw();
                return; // Ein Zerfall pro Tick — nicht alle auf einmal
            }
        }
        // Tao auf dem Grid → muss flackern → dirty flag (200ms = 5 FPS, genug für Flicker)
        if (hasTao && !_taoFlickerActive) {
            _taoFlickerActive = true;
            _taoFlickerInterval = setInterval(requestRedraw, 200);
        } else if (!hasTao && _taoFlickerActive) {
            _taoFlickerActive = false;
            clearInterval(_taoFlickerInterval);
        }
    }

    let _taoFlickerActive = false;
    let _taoFlickerInterval = null;

    // Alle 1 Sekunde prüfen
    setInterval(tickTaoDecay, 1000);

    // Genesis-Replay: Urknall in Zeitlupe abspielen
    function playGenesisReplay() {
        if (genesisLog.length === 0) {
            showToast('Noch keine Genesis passiert. Lege ☯️ auf die Insel!');
            return;
        }

        // Modal erstellen
        const overlay = document.createElement('div');
        overlay.className = 'genesis-replay-overlay';
        overlay.innerHTML = `
            <div class="genesis-replay-modal">
                <h2>🌌 Genesis — Der Urknall in Zeitlupe</h2>
                <div class="genesis-timeline" id="genesis-timeline"></div>
                <button class="genesis-replay-close" id="genesis-replay-close">Schließen</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const timeline = overlay.querySelector('#genesis-timeline');
        const close = overlay.querySelector('#genesis-replay-close');
        close.addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Schritte nacheinander einblenden
        const startTime = genesisLog[0]?.time || Date.now();
        genesisLog.forEach((event, i) => {
            setTimeout(() => {
                const step = document.createElement('div');
                step.className = 'genesis-step';
                const elapsed = ((event.time - startTime) / 1000).toFixed(1);

                if (event.type === 'decay') {
                    step.innerHTML = `
                        <span class="genesis-time">+${elapsed}s</span>
                        <span class="genesis-icon">☯️ → ⚫⚪</span>
                        <span class="genesis-text">Aus Eins wird Zwei! Hell und Dunkel.</span>
                    `;
                } else if (event.type === 'merge') {
                    const emoji = MATERIALS[event.result]?.emoji || '?';
                    step.innerHTML = `
                        <span class="genesis-time">+${elapsed}s</span>
                        <span class="genesis-icon">${event.from.map(m => MATERIALS[m]?.emoji || '?').join(' + ')} → ${emoji}</span>
                        <span class="genesis-text">${event.msg || event.result}</span>
                    `;
                }

                timeline.appendChild(step);
                step.scrollIntoView({ behavior: 'smooth' });
            }, i * 1500); // 1.5s pro Schritt — Zeitlupe
        });
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
        // Spielernamen aus dem Intro-Eingabefeld übernehmen
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            const typed = nameInput.value.trim().slice(0, 8);
            if (typed) {
                playerName = typed;
                localStorage.setItem('insel-player-name', playerName);
            } else if (!playerName) {
                playerName = 'Oskar';
                localStorage.setItem('insel-player-name', playerName);
            }
        }
        introOverlay.classList.add('hiding');
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 600);
        window.startSessionClock();
    }

    // Name-Input: Enter-Taste = Spiel starten
    const playerNameInput = document.getElementById('player-name-input');
    if (playerNameInput) {
        playerNameInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') startGame();
        });
    }

    startButton.addEventListener('click', startGame);

    // Werkzeug-Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            requestRedraw();
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
        bar.title = 'Zuletzt benutzt';
        bar.innerHTML = '' +
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

    function updateDiscoveryCounter() {
        const el = document.getElementById('discovery-counter');
        if (!el) return;
        const total = Object.keys(MATERIALS).length;
        const discovered = unlockedMaterials.size + BASE_MATERIALS.length;
        el.textContent = `🔬 ${discovered} / ${total} entdeckt`;
    }

    function selectMaterial(mat) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        const target = document.querySelector(`.material-btn[data-material="${mat}"]`);
        if (target) target.classList.add('active');
        // Tao-Glow stoppen nach erstem Klick
        const taoBtn = document.querySelector('.material-btn[data-material="tao"]');
        if (taoBtn) taoBtn.classList.add('tao-clicked');
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

        // Palette als Drop-Target: Inventar-Item auf Palette-Element droppen = Craft
        btn.addEventListener('dragover', e => {
            e.preventDefault();
            btn.classList.add('drop-target-palette');
        });
        btn.addEventListener('dragleave', () => {
            btn.classList.remove('drop-target-palette');
        });
        btn.addEventListener('drop', async e => {
            e.preventDefault();
            btn.classList.remove('drop-target-palette');
            const a = e.dataTransfer.getData('text/plain');
            const b = btn.dataset.material;
            if (a && b && a !== b) {
                await quickCraft(a, b);
            }
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
        requestRedraw();
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
        requestRedraw();
    });

    // Touch-Events für Tablet
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        undoPushedThisStroke = false;
        const touch = e.touches[0];
        const cell = getGridCell(touch);
        if (!cell) return;
        // Spielfigur-Drag: Berühre die Spieler-Zelle → Figur ziehen
        if (playerName && cell.r === playerPos.r && cell.c === playerPos.c) {
            playerDragging = true;
            return;
        }
        isMouseDown = true;
        applyTool(cell.r, cell.c);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = getGridCell(touch);
        if (playerDragging && cell) {
            // Spieler auf neue Position ziehen (kein Wasser-Rand)
            if (cell.r >= 2 && cell.r < ROWS - 2 && cell.c >= 2 && cell.c < COLS - 2) {
                playerPos = { r: cell.r, c: cell.c };
                localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
                requestRedraw();
            }
            return;
        }
        hoverCell = cell;
        requestRedraw();
        if (isMouseDown && hoverCell && currentTool !== 'fill') {
            applyTool(hoverCell.r, hoverCell.c);
        }
    });

    canvas.addEventListener('touchend', () => {
        isMouseDown = false;
        playerDragging = false;
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
        // Strg+S / Cmd+S = Speichern
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
            return;
        }

        switch (e.key) {
            case '1': selectMaterial('metal'); break;
            case '2': selectMaterial('wood'); break;
            case '3': selectMaterial('fire'); break;
            case '4': selectMaterial('water'); break;
            case '5': selectMaterial('earth'); break;
            case 'b': case 'B': selectTool('build'); break;
            case 'e': case 'E': selectTool('harvest'); break;
            case 'f': case 'F': selectTool('fill'); break;
            // Spielfigur-Steuerung
            case 'ArrowUp':    e.preventDefault(); movePlayer(-1, 0); break;
            case 'ArrowDown':  e.preventDefault(); movePlayer(1, 0); break;
            case 'ArrowLeft':  e.preventDefault(); movePlayer(0, -1); break;
            case 'ArrowRight': e.preventDefault(); movePlayer(0, 1); break;
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
        requestRedraw();
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

    // --- Mute-Button ---
    const muteBtn = document.getElementById('mute-btn');
    let muted = localStorage.getItem('insel-muted') === 'true';
    if (muteBtn) {
        muteBtn.textContent = muted ? '🔇' : '🔊';
        muteBtn.addEventListener('click', () => {
            muted = !muted;
            localStorage.setItem('insel-muted', String(muted));
            muteBtn.textContent = muted ? '🔇' : '🔊';
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

        // "baue/zaubere X [material]" — platziert X Blöcke zufällig
        const baueMatch = cmd.match(/^(?:baue?|zauber[en]?|hexe?|erschaffe?)\s+(\d+)\s+(.+)/);
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

        // "mach/zaubere regen/sonne/regenbogen"
        if (cmd.match(/^(?:mach|zauber[en]?|hexe?)\s+(regen|sonne|regenbogen)/)) {
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
        if (bugBtn) bugBtn.style.display = '';
        localStorage.setItem('insel-testmode', '1');
    }

    // Aktivieren per Konsole: localStorage.setItem('insel-testmode', '1'); location.reload()
    // Webhook setzen: localStorage.setItem('insel-webhook', 'https://...')

    // --- Bug-Reporter: window.reportBug('text') oder 🐛-Button ---
    const BUGS_URL = (window.INSEL_CONFIG?.proxy || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev') + '/bugs';

    window.reportBug = function(msg) {
        if (!msg || !msg.trim()) { showToast('🐛 Bitte beschreibe den Bug!'); return; }
        const bug = {
            msg: msg.trim(),
            page: window.location.href,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            reporter: localStorage.getItem('insel-spielername') || 'Anonym',
        };
        fetch(BUGS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bug),
        }).then(r => r.json()).then(d => {
            if (d.ok) showToast('🐛 Bug gemeldet! Danke!');
            else showToast('🐛 Fehler beim Melden.');
        }).catch(() => showToast('🐛 Kein Netz — Bug nicht gemeldet.'));
    };

    // 🐛 Button (nur im Testmodus sichtbar)
    const bugBtn = document.getElementById('bug-btn');
    if (bugBtn) {
        bugBtn.addEventListener('click', () => {
            const msg = prompt('🐛 Was ist kaputt?');
            if (msg) window.reportBug(msg);
        });
    }

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
        if (savedProjects[AUTOSAVE_KEY].playerPos) {
            playerPos = savedProjects[AUTOSAVE_KEY].playerPos;
        }
        window.grid = grid;
        migrateUnlocked();
        showToast('🔄 Letzte Insel wiederhergestellt');
    } else {
        // Starter-Insel: kein Save — Oskar soll sofort eine echte Insel sehen
        grid[2][11] = 'sand';   grid[2][12] = 'sand';   // Strand oben
        grid[13][11] = 'sand';  grid[13][12] = 'sand';  // Strand unten
        grid[2][6]  = 'sand';   grid[13][6]  = 'sand';  // Strand seitlich
        grid[2][17] = 'sand';   grid[13][17] = 'sand';
        grid[3][11] = 'tree';   grid[3][12]  = 'tree';  // Palmen oben
        grid[12][11]= 'tree';   grid[12][12] = 'tree';  // Palmen unten
        grid[3][6]  = 'tree';   grid[12][6]  = 'tree';  // Palmen links
        grid[3][17] = 'tree';   grid[12][17] = 'tree';  // Palmen rechts
        window.grid = grid;
        setTimeout(() => showToast('🏝️ Deine Insel wartet... Bau los!', 3500), 2000);
    }

    // Dirty-flag statt rAF-Loop — CPU 20%→<5%
    // var (nicht let) damit requestRedraw() via hoisting schon in resizeCanvas() nutzbar ist
    needsRedraw = true;
    setInterval(draw, 100);
    updateAchievementDisplay();
    updateQuestDisplay();
    updateInventoryDisplay();
    updatePaletteVisibility();
    updateGenesisVisibility();
    updateDiscoveryCounter();

    // Genesis-Replay Button
    const replayBtn = document.getElementById('genesis-replay-btn');
    if (replayBtn) replayBtn.addEventListener('click', playGenesisReplay);

    // --- Sidebar Tabs ---
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById('panel-' + tab.dataset.tab);
            if (panel) panel.classList.add('active');
        });
    });

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
