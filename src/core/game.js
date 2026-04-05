// @ts-nocheck — schrittweise typen, siehe types.d.ts
// === SCHATZINSEL ===

(function () {
    'use strict';

    // SW Cache-Update: automatisch neu laden wenn neue Version verfügbar
    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', function(e) {
            if (e.data?.type === 'cache-update') {
                // Einmal neu laden damit neue Assets aktiv werden
                if (!sessionStorage.getItem('sw-reloaded')) {
                    sessionStorage.setItem('sw-reloaded', '1');
                    location.reload();
                }
            }
        });
    }

    // Frühe Deklaration — wird ab Zeile ~386 benutzt, Definition in analytics.js
    function trackEvent(name, data) { if (window.trackEvent) window.trackEvent(name, data); }
    function recordMilestone(key) { if (window.recordMilestone) window.recordMilestone(key); }

    // --- Accessibility: reduced-motion ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Konfiguration ---
    // Isometrischer Modus ZUERST lesen — bestimmt Grid-Größe
    let isoMode = localStorage.getItem('insel-iso-mode') === 'true';

    // Grid-Dimensionen: Iso = 64×64, Normal = responsive
    const ASPECT = window.innerWidth / window.innerHeight;
    function getGridDimensions(iso) {
        if (iso) return { cols: 64, rows: 64 };
        if (ASPECT > 1.5) return { cols: 32, rows: 18 };
        if (ASPECT > 1.2) return { cols: 28, rows: 21 };
        return { cols: 18, rows: 28 };
    }
    let { cols: COLS, rows: ROWS } = getGridDimensions(isoMode);
    const WATER_BORDER = 2; // Zellen Wasser um die Insel

    // Dynamische Zellgröße basierend auf Bildschirm
    function calcCellSize() {
        const isMobile = window.innerWidth < 768;
        const totalCols = COLS + WATER_BORDER * 2;
        const totalRows = ROWS + WATER_BORDER * 2;

        if (isMobile) {
            const availW = window.innerWidth - 16;
            const availH = window.innerHeight * 0.55;
            return Math.max(isoMode ? 8 : 12, Math.min(
                Math.floor(availW / totalCols),
                Math.floor(availH / totalRows)
            ));
        }
        // Desktop
        const chatW = document.body.classList.contains('chat-open') ? 320 : 0;
        const availW = window.innerWidth - 320 - chatW;
        const availH = window.innerHeight - 110;
        return Math.max(isoMode ? 10 : 20, Math.min(
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
    function soundSelect(material)   { if (_snd.soundSelect)      _snd.soundSelect(material); }
    function soundFirstBlock()       { if (_snd.soundFirstBlock)  _snd.soundFirstBlock(); }
    function playMaterialSound(mat)  { if (_snd.playMaterialSound) _snd.playMaterialSound(mat); }

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
            uniqueMats: Object.keys(counts).length,
            playerPlaced: playerBlocksPlaced,
            questsDone: typeof completedQuests !== 'undefined' ? completedQuests.length : 0,
            blueprintsDone: typeof completedBlueprints !== 'undefined' ? completedBlueprints.length : 0,
            recipesFound: typeof discoveredRecipes !== 'undefined' ? discoveredRecipes.size : 0,
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

    const MAX_ACTIVE_QUESTS = 2; // #47: max 2 gleichzeitig — mehr = zu wenig Fokus

    function acceptQuest(quest) {
        if (activeQuests.length >= MAX_ACTIVE_QUESTS) {
            showToast(`📜 Erst die laufenden ${MAX_ACTIVE_QUESTS} Quests abschließen!`);
            return;
        }
        // #47: Baseline zum Annehme-Zeitpunkt speichern — verhindert Sofort-Abschluss
        const baseline = {};
        const currentStats = getGridStats();
        for (const mat of Object.keys(quest.needs)) {
            baseline[mat] = currentStats.counts[mat] || 0;
        }
        activeQuests.push({ ...quest, accepted: Date.now(), baseline });
        localStorage.setItem('insel-quests', JSON.stringify(activeQuests));
        showToast(`📜 Quest: ${quest.title}`);
        updateQuestDisplay();
    }

    function checkQuests(stats) {
        if (!stats) stats = getGridStats();
        let completed = [];
        activeQuests = activeQuests.filter(quest => {
            const baseline = quest.baseline || {};
            const done = Object.entries(quest.needs).every(([mat, count]) => {
                const base = baseline[mat] || 0;
                const current = stats.counts[mat] || 0;
                return (current - base) >= count;
            });
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

                    if (q.community) {
                        // Trotzki: Gemeinschaftsquest — ALLE NPCs profitieren!
                        showToast(`🤝 Inselrat: ${q.title} geschafft! ALLE profitieren! ${q.reward}`, 4000);
                        soundQuestComplete();
                        if (window.addTokenBudget) {
                            const allNpcs = Object.keys(NPC_DEFS);
                            const perNpcReward = Math.max(1, Math.round(cappedReward / 2));
                            allNpcs.forEach(npcId => {
                                const bonus = window.getTokenBonus ? window.getTokenBonus(npcId) : 0;
                                const capped = Math.min(perNpcReward, 2000 - bonus);
                                if (capped > 0) window.addTokenBudget(npcId, capped);
                            });
                        }
                    } else if (cappedReward > 0) {
                        showToast(`🎉 Quest geschafft: ${q.title} ${q.reward} +⚡ Energie!`);
                        soundQuestComplete();
                        if (window.addTokenBudget) {
                            window.addTokenBudget(q.npc, cappedReward);
                        }
                    } else {
                        showToast(`🎉 Quest geschafft: ${q.title} ${q.reward}`);
                        soundQuestComplete();
                    }
                    // Memory: Quest-Abschluss für den NPC vermerken
                    if (q.npc) recordNpcQuestDone(q.npc, q.title);
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
            const baseline = q.baseline || {};
            const items = Object.entries(q.needs).map(([mat, need]) => {
                const base = baseline[mat] || 0;
                const current = stats.counts[mat] || 0;
                const have = Math.max(0, current - base); // nur was seit Quest-Annahme gebaut
                const done = have >= need;
                const m = MATERIALS[mat];
                return `<span class="${done ? 'quest-done' : 'quest-todo'}">${m ? m.emoji : mat} ${have}/${need}</span>`;
            }).join(' ');
            const communityTag = q.community ? ' 🤝<em>Inselrat</em>' : '';
            return `<div class="quest-item"><strong>${q.title}${communityTag}</strong><br><small>${items}</small></div>`;
        }).join('');
    }

    // Quest-System für Chat exportieren
    window.questSystem = {
        getAvailable: getAvailableQuest,
        accept: acceptQuest,
        getActive: () => activeQuests,
        getCompleted: () => completedQuests
    };

    // === WEATHER + DAY/NIGHT + ANIMATIONS → effects.js (Zellteilung #11) ===
    const EFFECTS = window.INSEL_EFFECTS;

    // === EASTER EGGS → stories.js (Zellteilung #11) ===
    const STORIES = window.INSEL_STORIES;
    const discoveredEggs = STORIES.getDiscoveredEggs();

    function maybeCodeEasterEgg(material) {
        STORIES.maybeCodeEasterEgg(material, showToast, recordMilestone, trackEvent);
    }

    // --- NPC-Positionen auf der Insel ---
    // Questgeber die auf dem Grid stehen und anklickbar sind
    const NPC_DEFS = {
        spongebob: { emoji: '🧽', name: 'SpongeBob' },
        maus:      { emoji: '🐭', name: 'Maus' },
        floriane:  { emoji: '🧚', name: 'Floriane' },
        bug:       { emoji: '🐛', name: 'Bug' },
        elefant:   { emoji: '🐘', name: 'Elefant' },
        neinhorn:  { emoji: '🦄', name: 'NEINhorn' },
        krabs:     { emoji: '🦀', name: 'Mr. Krabs' },
        tommy:     { emoji: '🦞', name: 'Tommy' },
        mephisto:  { emoji: '😈', name: 'Mephisto' },
        // Bonusfamilie (nur auf Startinsel sichtbar, Spieler benennt sie selbst)
        kraemerin: { emoji: '👩‍🍳', name: 'Krämerin', lummerland: true },
        lokfuehrer:{ emoji: '🚂', name: 'Lokführer', lummerland: true },
    };

    // NPCs im Kreis um die Inselmitte verteilen
    // Positionen werden nach Grid-Init berechnet (siehe unten)
    let npcPositions = {};

    const _isLummerland = new URLSearchParams(location.search).has('lummerland');

    function initNpcPositions() {
        const cx = Math.floor(COLS / 2);
        const cy = Math.floor(ROWS / 2);
        const rx = Math.floor(COLS * 0.3);
        const ry = Math.floor(ROWS * 0.3);
        const ids = Object.keys(NPC_DEFS).filter(id => {
            // Lummerland-NPCs nur auf Lummerland
            if (NPC_DEFS[id].lummerland && !_isLummerland) return false;
            return true;
        });
        npcPositions = {};

        // Lummerland-NPCs bekommen feste Positionen bei ihren Gebäuden
        if (_isLummerland) {
            // Lukas: vor dem Lokschuppen (1 Zeile darunter)
            const schuppenR = cy + Math.floor(ry * 0.1) + 1;
            const schuppenC = cx - Math.floor(rx * 0.1);
            npcPositions['lokfuehrer'] = { r: schuppenR, c: schuppenC };
            if (grid[schuppenR] && grid[schuppenR][schuppenC]) grid[schuppenR][schuppenC] = null;

            // Frau Waas: vor dem Laden (1 Zeile darunter)
            const ladenR = cy + 1;
            const ladenC = cx + Math.floor(rx * 0.15);
            npcPositions['kraemerin'] = { r: ladenR, c: ladenC };
            if (grid[ladenR] && grid[ladenR][ladenC]) grid[ladenR][ladenC] = null;
        }

        // Alle anderen NPCs im Kreis um die Inselmitte
        const circleIds = ids.filter(id => !npcPositions[id]);
        circleIds.forEach((id, i) => {
            const angle = (i / circleIds.length) * Math.PI * 2 - Math.PI / 2;
            let r = Math.min(ROWS - 3, Math.max(2, cy + Math.round(Math.sin(angle) * ry)));
            let c = Math.min(COLS - 3, Math.max(2, cx + Math.round(Math.cos(angle) * rx)));
            // Freie Zelle suchen falls besetzt
            if (grid[r] && grid[r][c]) {
                let found = false;
                for (let d = 1; d <= 3 && !found; d++) {
                    for (const [dr, dc] of [[0,d],[0,-d],[d,0],[-d,0],[d,d],[-d,-d]]) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 2 && nr < ROWS - 2 && nc >= 2 && nc < COLS - 2 && grid[nr] && !grid[nr][nc]) {
                            r = nr; c = nc; found = true; break;
                        }
                    }
                }
            }
            // Zelle für NPC freihalten (vorhandenes Material entfernen)
            if (grid[r] && grid[r][c]) grid[r][c] = null;
            npcPositions[id] = { r, c };
        });
    }

    function getNpcAt(r, c) {
        for (const [id, pos] of Object.entries(npcPositions)) {
            if (pos.r === r && pos.c === c) return id;
        }
        return null;
    }

    function showNpcQuestDialog(npcId) {
        // Bernd das Brot: öffnet das Eltern-Dashboard
        if (npcId === 'bernd') {
            if (window._openDashboardFromBernd) {
                window._openDashboardFromBernd();
            }
            return;
        }
        const npc = NPC_DEFS[npcId];
        if (!npc) return;
        // Memory: Besuch registrieren
        touchNpcMemory(npcId);
        trackEvent('discovery', { type: 'npc', npc: npcId });

        // Session-Begrüßung: beim ersten Klick auf diesen NPC in dieser Session
        const voice = NPC_VOICES[npcId];
        let sessionGreeting = null;
        if (!_sessionGreeted.has(npcId) && voice) {
            sessionGreeting = getNpcMemoryComment(voice, npcId);
            _sessionGreeted.add(npcId);
        }

        const quest = window.questSystem.getAvailable(npcId);
        const active = window.questSystem.getActive().find(q => q.npc === npcId);
        if (active) {
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
                setTimeout(() => showToast(`${npc.emoji} ${npc.name}: Ich warte noch auf "${active.title}"!`, 3000), 3200);
            } else {
                showToast(`${npc.emoji} ${npc.name}: Ich warte noch auf "${active.title}"!`, 3000);
            }
        } else if (quest) {
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
                setTimeout(() => showToast(`${npc.emoji} ${quest.desc}`, 5000), 3200);
            } else {
                showToast(`${npc.emoji} ${quest.desc}`, 5000);
            }
            window.questSystem.accept(quest);
        } else if (npcId === 'bug') {
            if (sessionGreeting) showToast(sessionGreeting, 3000);
            showBugDialog();
        } else if (npcId === 'krabs') {
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
                setTimeout(() => showKrabsShop(), 3200);
            } else {
                showKrabsShop();
            }
        } else if (npcId === 'kraemerin') {
            const shells = getInventoryCount('shell');
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
                setTimeout(() => {
                    if (shells > 0) {
                        removeFromInventory('shell', shells);
                        showToast(`👩‍🍳 Krämerin: ${shells} Muschel${shells > 1 ? 'n' : ''}! Die kommen ins Regal. Danke, Schatz! 🐚`, 4000);
                        updateInventoryDisplay();
                        soundCraft();
                    } else {
                        showToast('👩‍🍳 Krämerin: Bring mir Muscheln vom Strand! Die verkaufen sich wie warme Semmeln! 🐚', 4000);
                    }
                }, 3200);
            } else if (shells > 0) {
                removeFromInventory('shell', shells);
                showToast(`👩‍🍳 Krämerin: ${shells} Muschel${shells > 1 ? 'n' : ''}! Die kommen ins Regal. Danke, Schatz! 🐚`, 4000);
                updateInventoryDisplay();
                soundCraft();
            } else {
                showToast('👩‍🍳 Krämerin: Bring mir Muscheln vom Strand! Die verkaufen sich wie warme Semmeln! 🐚', 4000);
            }
        } else if (npcId === 'lokfuehrer') {
            const stories = [
                '🚂 Lokführer: Meine Lok und ich sind einmal bis zum Ende der Welt gefahren! Naja, fast.',
                '🚂 Lokführer: Weißt du was? Die besten Abenteuer fangen auf kleinen Inseln an!',
                '🚂 Lokführer: Eine Lokomotive braucht drei Dinge: Kohle, Wasser und einen Freund.',
                '🚂 Lokführer: Hör mal — wenn du genug Holz sammelst, bauen wir ein Boot!',
                '🚂 Lokführer: Tschuff tschuff! Steig ein, wir fahren einmal um die Insel!',
            ];
            const story = stories[Math.floor(Math.random() * stories.length)];
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
                setTimeout(() => showToast(story, 5000), 3200);
            } else {
                showToast(story, 5000);
            }
        } else {
            if (sessionGreeting) {
                showToast(sessionGreeting, 3000);
            } else if (voice) {
                const msg = `${npc.emoji} ${voice.prefix} ${voice.ticks[Math.floor(Math.random() * voice.ticks.length)]}`;
                showToast(msg, 3000);
            }
        }
    }

    // === DUNGEON-FRAMEWORK (#50 Höhle = Dungeon) ===
    // IT-Ebenen: Bits → Kernel → Browser. Oscar entdeckt die Welt unter der Insel.
    let _dungeonVisited = JSON.parse(localStorage.getItem('insel-dungeon-visited') || '[]');

    function openDungeon() {
        const dlg = document.getElementById('dungeon-dialog');
        if (!dlg) return;

        // Besuchte Ebenen markieren (progressiv aufdecken)
        const levels = dlg.querySelectorAll('.dungeon-level');
        levels.forEach(function (el) {
            const key = el.dataset.level;
            if (!_dungeonVisited.includes(key)) {
                _dungeonVisited.push(key);
                localStorage.setItem('insel-dungeon-visited', JSON.stringify(_dungeonVisited));
                if (trackEvent) { trackEvent('dungeon_level', { level: key }); trackEvent('discovery', { type: 'dungeon', level: key }); }
            }
        });

        // Alle Ebenen besucht → Geheimnis aufdecken
        const allLevels = ['bits', 'kernel', 'browser'];
        if (allLevels.every(function (k) { return _dungeonVisited.includes(k); })) {
            const secret = document.getElementById('dungeon-secret');
            if (secret) secret.classList.remove('hidden');
        }

        dlg.classList.remove('hidden');
        const closeBtn = dlg.querySelector('#close-dungeon-dialog');
        if (closeBtn) closeBtn.focus();
    }

    // === SEGELBOOT → INSEL-AUSWAHL (#54 Jim Knopfs Welt + S32-1 Schatzkarte) ===

    // 3-Wort-Adressen für jede Insel (Schatzkarte — poetic, einprägsam)
    const _ISLAND_ADDRESSES = {
        home:      'wellen.sand.zuhause',
        lummerland: 'zwei.berge.abenteuer',
        dinobucht:  'knochen.urzeit.staunen',
    };

    function showSailDialog() {
        const existingDlg = document.getElementById('sail-dialog');
        if (existingDlg) { existingDlg.remove(); } // Neu bauen damit discovered-State stimmt

        // Welche Inseln wurden schon besucht?
        const currentIsland = localStorage.getItem('insel-current-island') || 'home';
        const visited = {
            home:       true,
            lummerland: !!localStorage.getItem('insel-archipel-lummerland'),
            dinobucht:  !!localStorage.getItem('insel-archipel-dinobucht'),
        };

        function islandBtn(dest, emoji, label, desc, borderColor, bgColor) {
            const addr = _ISLAND_ADDRESSES[dest] || '';
            const isCurrent = dest === currentIsland;
            const hasVisited = visited[dest];
            const badge = isCurrent
                ? `<span style="font-size:10px;background:#27AE60;color:#fff;border-radius:4px;padding:1px 5px;margin-left:6px;">Du bist hier</span>`
                : hasVisited
                    ? `<span style="font-size:10px;background:#F39C12;color:#fff;border-radius:4px;padding:1px 5px;margin-left:6px;">✓ entdeckt</span>`
                    : '';
            return `
                <button class="sail-dest" data-dest="${dest}" style="padding:10px 12px;font-size:15px;border-radius:8px;border:2px solid ${borderColor};background:${bgColor};cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;">
                    <span style="font-size:22px;">${emoji}</span>
                    <span>
                        <strong>${label}</strong>${badge}<br>
                        <small style="color:#666;">${desc}</small><br>
                        <small style="color:#aaa;font-family:monospace;">${addr}</small>
                    </span>
                </button>`;
        }

        const dlg = document.createElement('div');
        dlg.id = 'sail-dialog';
        dlg.className = 'dialog-overlay';
        dlg.innerHTML = `
            <div class="dialog-content" style="max-width:380px;text-align:center;">
                <h3>⛵ Wohin segeln?</h3>
                <p style="margin:8px 0 14px;font-size:13px;color:#666;">Dein Archipel — ${Object.values(visited).filter(Boolean).length} von ${Object.keys(visited).length} Inseln entdeckt</p>
                <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 16px;">
                    ${islandBtn('home',      '🏠', 'Heimatinsel', 'Deine Insel wartet auf dich',                '#27AE60', '#EAFAF1')}
                    ${islandBtn('lummerland','🏝️', 'Lummerland',  'Eine kleine Insel mit zwei Bergen',          '#2E86C1', '#EBF5FB')}
                    ${islandBtn('dinobucht', '🦕', 'Dino-Bucht',  'Vor 66 Millionen Jahren lebten hier Dinos', '#8E44AD', '#F5EEF8')}
                </div>
                <button id="sail-cancel" style="padding:8px 16px;border:none;background:#eee;border-radius:6px;cursor:pointer;">Noch nicht</button>
            </div>
        `;
        document.body.appendChild(dlg);

        dlg.querySelector('#sail-cancel').addEventListener('click', () => dlg.classList.add('hidden'));
        dlg.querySelectorAll('.sail-dest').forEach(btn => {
            btn.addEventListener('click', () => {
                const dest = btn.dataset.dest;
                dlg.classList.add('hidden');
                sailToIsland(dest);
            });
        });
    }

    // --- Archipel: Insel-State speichern/laden (#103 Phase 1) ---
    function saveIslandState(islandId) {
        const snapshot = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) snapshot.push({ r, c, mat: grid[r][c] });
            }
        }
        localStorage.setItem('insel-archipel-' + islandId, JSON.stringify(snapshot));
    }

    function loadIslandState(islandId) {
        const raw = localStorage.getItem('insel-archipel-' + islandId);
        if (!raw) return false;
        const snapshot = JSON.parse(raw);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) grid[r][c] = null;
        }
        for (const { r, c, mat } of snapshot) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = mat;
        }
        return true;
    }

    function sailToIsland(dest) {
        showToast('⛵ Du segelst los...', 2000);
        soundCraft();

        // Aktuelle Insel vor dem Verlassen speichern
        const currentIsland = localStorage.getItem('insel-current-island') || 'home';
        saveIslandState(currentIsland);

        setTimeout(() => {
            // Ziel-Insel laden oder generieren
            const restored = loadIslandState(dest);

            if (!restored) {
                // Erste Reise: Insel generieren + Genesis-Toasts
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) grid[r][c] = null;
                }
                if (dest === 'lummerland') {
                    generateLummerland();
                    _showIslandGenesis('lummerland');
                } else if (dest === 'dinobucht') {
                    if (window.INSEL_GENERATORS && window.INSEL_GENERATORS.generateDinoIsland) {
                        window.INSEL_GENERATORS.generateDinoIsland(grid, ROWS, COLS, MATERIALS);
                    }
                    _showIslandGenesis('dinobucht');
                } else if (dest === 'home') {
                    showToast('🏠 Du bist wieder zuhause!', 3000);
                }
            } else {
                const label = dest === 'home' ? '🏠 Du bist wieder zuhause — deine Insel wartet!' :
                              dest === 'lummerland' ? '🏝️ Lummerland — wieder da!' :
                              dest === 'dinobucht' ? '🦕 Die Dino-Bucht — du kennst dich hier schon aus!' :
                              '⛵ Angekomm!';
                showToast(label, 3000);
            }

            // NPCs neu platzieren
            initNpcPositions();
            requestRedraw();

            // Speichern
            localStorage.setItem('insel-current-island', dest);
            if (window.INSEL_BUS) window.INSEL_BUS.emit('island:arrived', { dest: dest });
        }, 2000);
    }

    // === KRABS SHOP — Muschelhandel ===
    // 1 Muschel = 0.001 MMX (Nerd-Ebene, Easter Egg). Kinder sehen 🐚.
    const SHELL_TO_MMX = 0.001;

    // Krabbs-Vorrat: endlich, max 20 pro Material (Ricardo #101 S28-2)
    // Wenn Krabbs kein Holz hat, kann er keins verkaufen.
    // Angebot und Nachfrage ohne Erklärung — Oscar sieht es, lernt es.
    const KRABS_STOCK_MAX = 20;
    const KRABS_STOCK_INIT = {
        wood: 8, stone: 6, sand: 12, planks: 4, glass: 3,
        flower: 5, fish: 5, diamond: 2, crystal: 2, honey: 4, apple: 6
    };
    const krabsStock = JSON.parse(localStorage.getItem('insel-krabs-stock') || 'null') || { ...KRABS_STOCK_INIT };
    function saveKrabsStock() { localStorage.setItem('insel-krabs-stock', JSON.stringify(krabsStock)); }

    function showKrabsShop() {
        const shells = getInventoryCount('shell');
        // Welche Materialien kann der Spieler verkaufen?
        const sellable = Object.entries(KRABS_SHOP)
            .filter(([mat]) => getInventoryCount(mat) > 0)
            .map(([mat, price]) => {
                const info = MATERIALS[mat];
                return `${info.emoji} ${info.label}: ${price.sell} 🐚`;
            }).slice(0, 4);

        // Welche kann er kaufen?
        const buyable = Object.entries(KRABS_SHOP)
            .filter(([, price]) => shells >= price.buy)
            .map(([mat, price]) => {
                const info = MATERIALS[mat];
                return `${info.emoji} ${info.label}: ${price.buy} 🐚`;
            }).slice(0, 4);

        // Dialog als Modal
        let existing = document.getElementById('krabs-shop-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'krabs-shop-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        const shopItems = Object.entries(KRABS_SHOP);
        const shopHTML = shopItems.map(([mat, price]) => {
            const info = MATERIALS[mat];
            if (!info) return '';
            const have = getInventoryCount(mat);
            const stock = krabsStock[mat] || 0;
            const stockFull = stock >= KRABS_STOCK_MAX;
            // Lager-Indikator: 🔴 leer, 🟡 wenig (1-3), 🟢 gut (4+)
            const stockDot = stock === 0 ? '🔴' : stock <= 3 ? '🟡' : '🟢';
            const stockLabel = stock === 0 ? 'Ausverkauft!' : `Lager: ${stock}`;
            const stockColor = stock === 0 ? '#c33' : stock <= 3 ? '#e6a800' : '#4caf50';
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #333;${stock === 0 ? 'opacity:0.7;' : ''}">
                <span>${info.emoji} ${info.label} (${have}x) <span style="color:${stockColor};font-size:0.8em;">${stockDot} ${stockLabel}</span></span>
                <span>
                    <button class="krabs-buy" data-mat="${mat}" data-cost="${price.buy}"
                        style="background:#2E7D32;color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;margin:0 2px;"
                        ${shells < price.buy || stock <= 0 ? 'disabled style="opacity:0.4;background:#2E7D32;color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;margin:0 2px;"' : ''}>
                        Kauf ${price.buy}🐚</button>
                    <button class="krabs-sell" data-mat="${mat}" data-earn="${price.sell}"
                        style="background:#C62828;color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;margin:0 2px;"
                        ${have <= 0 || stockFull ? `disabled style="opacity:0.4;background:#C62828;color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;margin:0 2px;" title="${stockFull ? 'Krabbs hat genug!' : ''}"` : ''}>
                        Verkauf ${price.sell}🐚</button>
                </span>
            </div>`;
        }).join('');

        const mmxValue = (shells * SHELL_TO_MMX).toFixed(4);
        const mmxMax = (SHELL_CAP * SHELL_TO_MMX).toFixed(1);
        const capPct = Math.round(shells / SHELL_CAP * 100);
        modal.innerHTML = `<div style="background:#1a1a2e;color:#eee;border-radius:12px;padding:20px;max-width:360px;width:90%;max-height:70vh;overflow-y:auto;font-family:monospace;">
            <h3 style="margin:0 0 8px;text-align:center;">🦀 Krabben-Kontor 💰</h3>
            <p style="text-align:center;margin:0 0 4px;font-size:1.1em;">Dein Vermögen: <strong>${shells} / ${SHELL_CAP} 🐚</strong></p>
            <div style="background:#333;border-radius:4px;height:6px;margin:0 20px 8px;"><div style="background:${capPct >= 90 ? '#FF6B00' : '#2E7D32'};border-radius:4px;height:6px;width:${capPct}%;transition:width 0.3s;"></div></div>
            <p style="text-align:center;margin:0 0 4px;font-size:0.8em;color:#aaa;">Darwin sagt: Handel ist Evolution! Muscheln findest du am Strand!</p>
            <p style="text-align:center;margin:0 0 12px;font-size:0.65em;color:#FF6B00;cursor:help;" title="nerd easter egg · 1 🐚 = ${SHELL_TO_MMX} MMX · mmx.network">≈ ${mmxValue} / ${mmxMax} MMX</p>
            ${shopHTML}
            <p style="text-align:center;margin:12px 0 0;font-size:0.7em;color:#666;">Klick außerhalb zum Schließen</p>
        </div>`;

        document.body.appendChild(modal);

        // Event-Handler für Kauf/Verkauf
        modal.querySelectorAll('.krabs-buy').forEach(btn => {
            btn.addEventListener('click', () => {
                const mat = btn.dataset.mat;
                const cost = parseInt(btn.dataset.cost);
                if ((krabsStock[mat] || 0) <= 0) {
                    showToast(`🦀 Krabbs: "${MATERIALS[mat]?.label}? Hab ich nicht! Komm später!"`, 2500);
                    return;
                }
                if (getInventoryCount('shell') >= cost) {
                    removeFromInventory('shell', cost);
                    addToInventory(mat, 1);
                    unlockMaterial(mat);
                    krabsStock[mat] = (krabsStock[mat] || 0) - 1;
                    saveKrabsStock();
                    showToast(`🦀 DEAL! 1x ${MATERIALS[mat]?.emoji} ${MATERIALS[mat]?.label} für ${cost} 🐚! (${krabsStock[mat]} übrig)`, 2500);
                    modal.remove();
                    showKrabsShop(); // Refresh
                }
            });
        });

        modal.querySelectorAll('.krabs-sell').forEach(btn => {
            btn.addEventListener('click', () => {
                const mat = btn.dataset.mat;
                const earn = parseInt(btn.dataset.earn);
                if ((krabsStock[mat] || 0) >= KRABS_STOCK_MAX) {
                    showToast(`🦀 Krabbs: "Ich hab schon genug ${MATERIALS[mat]?.emoji}! Komm wenn ich leer bin!"`, 2500);
                    return;
                }
                if (getInventoryCount(mat) > 0) {
                    removeFromInventory(mat, 1);
                    addToInventory('shell', earn);
                    unlockMaterial('shell');
                    krabsStock[mat] = Math.min((krabsStock[mat] || 0) + 1, KRABS_STOCK_MAX);
                    saveKrabsStock();
                    showToast(`🦀 VERKAUFT! 1x ${MATERIALS[mat]?.emoji} für ${earn} 🐚! Ahahaha!`, 2000);
                    modal.remove();
                    showKrabsShop(); // Refresh
                }
            });
        });
    }

    // === BUG-NPC: Raupe Nimmersatt Lifecycle ===
    // Phase: caterpillar → cocoon (60s) → butterfly (30s) → caterpillar
    const BUG_STATE_KEY = 'insel-bug-state';
    const BUG_COCOON_MS = 60000;
    const BUG_BUTTERFLY_MS = 30000;

    function loadBugState() {
        try { return JSON.parse(localStorage.getItem(BUG_STATE_KEY) || 'null') || { reports: [], phase: 'caterpillar', cocoonStart: null }; }
        catch { return { reports: [], phase: 'caterpillar', cocoonStart: null }; }
    }

    function saveBugState(state) {
        localStorage.setItem(BUG_STATE_KEY, JSON.stringify(state));
    }

    /** @returns {'caterpillar'|'cocoon'|'butterfly'} */
    function getBugPhase() {
        const s = loadBugState();
        if (s.phase === 'cocoon' && s.cocoonStart) {
            if (Date.now() - s.cocoonStart >= BUG_COCOON_MS) {
                s.phase = 'butterfly';
                s.cocoonStart = null;
                s.butterflyStart = Date.now();
                s.reports = [];
                saveBugState(s);
                showToast('🦋 Bug hat sich verwandelt! Alle Bugs gefressen!', 4000);
                return 'butterfly';
            }
            return 'cocoon';
        }
        if (s.phase === 'butterfly' && s.butterflyStart) {
            if (Date.now() - s.butterflyStart >= BUG_BUTTERFLY_MS) {
                s.phase = 'caterpillar';
                s.butterflyStart = null;
                saveBugState(s);
                return 'caterpillar';
            }
            return 'butterfly';
        }
        return s.phase;
    }

    function getBugEmoji() {
        const phase = getBugPhase();
        if (phase === 'cocoon') return '🫘';
        if (phase === 'butterfly') return '🦋';
        const s = loadBugState();
        const count = s.reports.length;
        if (count >= 5) return '🐛🐛🐛';
        if (count >= 3) return '🐛🐛';
        return '🐛';
    }

    function showBugDialog() {
        const phase = getBugPhase();
        if (phase === 'cocoon') {
            const s = loadBugState();
            const remaining = Math.ceil((BUG_COCOON_MS - (Date.now() - (s.cocoonStart || 0))) / 1000);
            showToast(`🫘 Bug verpuppt sich... noch ${remaining}s`, 3000);
            return;
        }
        if (phase === 'butterfly') {
            showToast('🦋 Bug fliegt herum! Alle Bugs sind weg!', 3000);
            return;
        }

        // Caterpillar: Bug-Report-Dialog
        let existing = document.getElementById('bug-npc-modal');
        if (existing) existing.remove();

        const s = loadBugState();
        const modal = document.createElement('div');
        modal.id = 'bug-npc-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        // Build modal content via DOM API (no innerHTML with user data)
        const container = document.createElement('div');
        container.style.cssText = 'background:#1a2e1a;color:#eee;border-radius:12px;padding:20px;max-width:360px;width:90%;max-height:70vh;overflow-y:auto;font-family:monospace;';

        const title = document.createElement('h3');
        title.style.cssText = 'margin:0 0 8px;text-align:center;';
        title.textContent = getBugEmoji() + ' Bug \u2014 Was ist kaputt?';
        container.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'text-align:center;margin:0 0 12px;font-size:0.8em;color:#aaa;';
        subtitle.textContent = 'Schreib was nicht geht. Bug frisst es!';
        container.appendChild(subtitle);

        const reportsList = document.createElement('div');
        reportsList.style.cssText = 'margin-bottom:12px;';
        if (s.reports.length > 0) {
            s.reports.forEach(r => {
                const row = document.createElement('div');
                row.style.cssText = 'padding:2px 0;font-size:0.85em;';
                row.textContent = '\uD83D\uDC1B ' + r;
                reportsList.appendChild(row);
            });
        } else {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:#888;font-size:0.85em;';
            empty.textContent = 'Noch keine Bugs gemeldet.';
            reportsList.appendChild(empty);
        }
        container.appendChild(reportsList);

        const inputRow = document.createElement('div');
        inputRow.style.cssText = 'display:flex;gap:8px;';
        const input = document.createElement('input');
        input.id = 'bug-report-input';
        input.type = 'text';
        input.placeholder = 'Beschreib den Bug...';
        input.style.cssText = 'flex:1;padding:8px;border-radius:6px;border:1px solid #555;background:#0a1a0a;color:#eee;font-size:0.9em;';
        const submitBtn = document.createElement('button');
        submitBtn.id = 'bug-report-submit';
        submitBtn.textContent = 'Melden';
        submitBtn.style.cssText = 'background:#2E7D32;color:white;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:0.9em;';
        inputRow.appendChild(input);
        inputRow.appendChild(submitBtn);
        container.appendChild(inputRow);

        const counter = document.createElement('p');
        counter.style.cssText = 'text-align:center;margin:12px 0 0;font-size:0.65em;color:#666;';
        counter.textContent = s.reports.length + '/7 \u2014 bei 7 verpuppt sich Bug';
        container.appendChild(counter);

        modal.appendChild(container);
        document.body.appendChild(modal);

        const doSubmit = () => {
            const text = input.value.trim();
            if (!text) return;
            const state = loadBugState();
            state.reports.push(text);
            if (state.reports.length >= 7) {
                state.phase = 'cocoon';
                state.cocoonStart = Date.now();
                saveBugState(state);
                modal.remove();
                showToast('🫘 Bug hat zu viele Bugs gefressen und verpuppt sich! 60 Sekunden...', 4000);
                return;
            }
            saveBugState(state);
            showToast(getBugEmoji() + ' *mampf* \u2014 Bug ' + state.reports.length + '/7', 2000);
            modal.remove();
            showBugDialog();
        };
        submitBtn.addEventListener('click', doSubmit);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
        input.focus();
    }

    // --- NPC-Kommentare beim Bauen ---
    // === GENERATIVE NPC-KOMMENTARE ===
    // Daten in src/world/npc-data.js — wird vor game.js geladen
    const { NPC_VOICES, MAT_ADJECTIVES, REACTIONS, TEMPLATES, STREAK_COMMENTS } = window.INSEL_NPC_DATA;

    // Combo-Tracker: besondere Kommentare bei Serien
    let lastMaterial = null;
    let materialStreak = 0;

    // === NPC-SESSION-GEDÄCHTNIS ===
    // Speichert pro NPC: letztes Lieblingsmaterial, abgeschlossene Quests, letzter Besuch
    // Key: 'insel-npc-memory'
    // Format: { [npcId]: { lastMaterial, lastMaterialKey, lastVisit, questsDone: [] } }

    const NPC_MEMORY_KEY = 'insel-npc-memory';
    /** @type {Set<string>} NPCs die diese Session schon gegrüßt haben */
    const _sessionGreeted = new Set();

    function loadNpcMemory() {
        try { return JSON.parse(localStorage.getItem(NPC_MEMORY_KEY) || '{}'); }
        catch { return {}; }
    }

    function saveNpcMemory(mem) {
        localStorage.setItem(NPC_MEMORY_KEY, JSON.stringify(mem));
    }

    function getNpcMem(npcId) {
        return loadNpcMemory()[npcId] || null;
    }

    // Letzten Besuch für diesen NPC aktualisieren
    function touchNpcMemory(npcId) {
        const mem = loadNpcMemory();
        if (!mem[npcId]) mem[npcId] = { lastVisit: null, lastMaterial: null, lastMaterialKey: null, questsDone: [] };
        mem[npcId].lastVisit = Date.now();
        saveNpcMemory(mem);
    }

    // Quest-Abschluss für diesen NPC vermerken
    function recordNpcQuestDone(npcId, questTitle) {
        const mem = loadNpcMemory();
        if (!mem[npcId]) mem[npcId] = { lastVisit: null, lastMaterial: null, lastMaterialKey: null, questsDone: [] };
        if (!mem[npcId].questsDone.includes(questTitle)) mem[npcId].questsDone.push(questTitle);
        mem[npcId].lastVisit = Date.now();
        saveNpcMemory(mem);
    }

    // Nach jeder Session: Lieblingsmaterial (meistgenutzt) in alle NPC-Memory-Einträge schreiben
    // Wird bei beforeunload aufgerufen
    function flushNpcSessionMemory() {
        const raw = localStorage.getItem('insel-mat-usage');
        if (!raw) return;
        /** @type {Record<string, number>} */
        let usage;
        try { usage = JSON.parse(raw); } catch { return; }
        const sorted = Object.entries(usage).sort((a, b) => b[1] - a[1]);
        const favKey = sorted.length > 0 ? sorted[0][0] : null;
        if (!favKey) return;
        const favLabel = MATERIALS[favKey]?.label || favKey;
        const mem = loadNpcMemory();
        for (const id of Object.keys(NPC_VOICES)) {
            if (!mem[id]) mem[id] = { lastVisit: null, lastMaterial: null, lastMaterialKey: null, questsDone: [] };
            mem[id].lastMaterial = favLabel;
            mem[id].lastMaterialKey = favKey;
        }
        saveNpcMemory(mem);

        // Session-Snapshot: Top 3 Materialien, Block-Count, Quests, Baustil
        saveSessionSnapshot(sorted);
    }

    /**
     * Speichert einen Session-Snapshot in localStorage (max 1KB).
     * Wird von flushNpcSessionMemory aufgerufen.
     * @param {Array<[string, number]>} sortedMats - Materialien sortiert nach Nutzung
     */
    function saveSessionSnapshot(sortedMats) {
        const stats = getGridStats();
        const baustil = localStorage.getItem('insel-baustil') || 'Insel-Architekt';
        const topMaterials = sortedMats.slice(0, 3).map(function (entry) {
            return MATERIALS[entry[0]]?.label || entry[0];
        });
        const questTitles = (typeof completedQuests !== 'undefined' && Array.isArray(completedQuests))
            ? completedQuests.slice(-5)  // letzte 5 Quests reichen
            : [];
        const name = localStorage.getItem('insel-player-name') || 'Spieler';

        /** @type {{ timestamp: number, playerName: string, baustil: string, topMaterials: string[], blocksPlaced: number, questsCompleted: string[], lastChatNpc: string|null }} */
        const snapshot = {
            timestamp: Date.now(),
            playerName: name,
            baustil: baustil,
            topMaterials: topMaterials,
            blocksPlaced: stats.total,
            questsCompleted: questTitles,
            lastChatNpc: window._lastChatNpcId || null,
        };

        // Max 1KB Check — wenn zu groß, Quests kürzen
        let json = JSON.stringify(snapshot);
        if (json.length > 1024) {
            snapshot.questsCompleted = questTitles.slice(-2);
            json = JSON.stringify(snapshot);
        }
        localStorage.setItem('insel-session-snapshot', json);
    }

    // Gedächtnis-Kommentar für NPC erzeugen (gibt null zurück wenn nichts sinnvolles da)
    function getNpcMemoryComment(npc, npcId) {
        const m = getNpcMem(npcId);
        if (!m) return null;
        const hasName = playerName && playerName !== 'Spieler' && playerName !== 'Anonym';
        const nameStr = hasName ? ` ${playerName}` : '';
        const daysSince = m.lastVisit ? Math.floor((Date.now() - m.lastVisit) / 86400000) : null;
        // #62 Mehrsprachige NPCs: gespeicherte Spielersprache nutzen
        const lang = localStorage.getItem('insel-player-lang') || 'de';
        const isEN = lang === 'en';

        if (m.lastMaterial && m.questsDone && m.questsDone.length > 0) {
            return isEN
                ? `${npc.emoji} ${npc.prefix} Hey${nameStr}! Last time you built a lot with ${m.lastMaterial}. And you finished ${m.questsDone.length} quest${m.questsDone.length > 1 ? 's' : ''}!`
                : `${npc.emoji} ${npc.prefix} Hey${nameStr}! Letztes Mal hast du viel mit ${m.lastMaterial} gebaut. Und ${m.questsDone.length} Quest${m.questsDone.length > 1 ? 's' : ''} geschafft!`;
        }
        if (m.lastMaterial) {
            return isEN
                ? `${npc.emoji} ${npc.prefix} Hey${nameStr}! Last time you built a lot with ${m.lastMaterial}...`
                : `${npc.emoji} ${npc.prefix} Hey${nameStr}! Letztes Mal hast du viel mit ${m.lastMaterial} gebaut...`;
        }
        if (daysSince !== null && daysSince >= 1) {
            const dayText = isEN
                ? (daysSince === 1 ? 'yesterday' : `${daysSince} days ago`)
                : (daysSince === 1 ? 'gestern' : `vor ${daysSince} Tagen`);
            return isEN
                ? `${npc.emoji} ${npc.prefix} You were last here ${dayText}${nameStr}!`
                : `${npc.emoji} ${npc.prefix} Schon ${dayText} warst du zuletzt hier${nameStr}!`;
        }
        if (m.questsDone && m.questsDone.length > 0) {
            return isEN
                ? `${npc.emoji} ${npc.prefix} Remember${nameStr}? We already did ${m.questsDone.length} quest${m.questsDone.length > 1 ? 's' : ''} together!`
                : `${npc.emoji} ${npc.prefix} Erinnerst du dich${nameStr}? Wir haben schon ${m.questsDone.length} Quest${m.questsDone.length > 1 ? 's' : ''} zusammen gemacht!`;
        }
        return null;
    }

    // beforeunload: Session-Memory sichern
    window.addEventListener('beforeunload', flushNpcSessionMemory);

    // Context-Kommentare basierend auf Grid-Zustand
    function getContextComment(npc, stats, npcId) {
        // Memory-Kommentar: 30% Chance, damit er nicht bei jedem Baustein kommt
        if (npcId && Math.random() < 0.30) {
            const memComment = getNpcMemoryComment(npc, npcId);
            if (memComment) return memComment;
        }
        if (stats.total === 0) return null;
        if (stats.percent > 80) return `${npc.emoji} ${npc.prefix} Die Insel ist fast voll! ${npc.ticks[0]}`;
        if (stats.total % 25 === 0) return `${npc.emoji} ${npc.prefix} ${stats.total} Blöcke! ${REACTIONS[npc.style][Math.floor(Math.random() * REACTIONS[npc.style].length)]}`;
        // Proportions-Kommentar
        const entries = Object.entries(stats.counts).filter(([,v]) => v > 0);
        if (entries.length >= 2) {
            const sorted = entries.sort((a,b) => b[1] - a[1]);
            if (sorted[0][1] > stats.total * 0.6) {
                const matLabel = MATERIALS[sorted[0][0]]?.label || sorted[0][0];
                const mat2Label = MATERIALS[sorted[1][0]]?.label || sorted[1][0];
                return `${npc.emoji} ${npc.prefix} Sehr viel ${matLabel}! Wie wärs mit ${mat2Label}?`;
            }
        }
        return null;
    }

    function generateNpcComment(material) {
        const npcKeys = Object.keys(NPC_VOICES);
        const npcIdx = Math.floor(Math.random() * npcKeys.length);
        const npcId = npcKeys[npcIdx];
        const npc = NPC_VOICES[npcId];
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

        // Context-Kommentar (10% Chance) — npcId an getContextComment übergeben für Memory
        if (Math.random() < 0.1) {
            const stats = typeof getGridStats === 'function' ? getGridStats() : null;
            if (stats) {
                const ctx = getContextComment(npc, stats, npcId);
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

    // --- Spontan-Hörspiele — delegiert an tts.js ---
    // TTS-Funktionen leben in window.INSEL_TTS (tts.js)
    // playedHoerspiele.length wird noch für Analytics benötigt
    const playedHoerspiele = JSON.parse(localStorage.getItem('insel-hoerspiele') || '[]');

    function stopHoerspiel() {
        if (window.INSEL_TTS) window.INSEL_TTS.stopHoerspiel();
    }
    function maybeHoerspiel(stats) {
        if (window.INSEL_TTS) window.INSEL_TTS.maybeHoerspiel(stats);
    }
    function speakLines(lines, onDone) {
        if (window.INSEL_TTS) window.INSEL_TTS.speakLines(lines, onDone);
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

    // === BAUM-WACHSTUM + WELT-KONSEQUENZEN → nature.js ===
    const treeGrowth = window.INSEL_NATURE.treeGrowth;

    // #19: Evolution-Screensaver → ausgelagert nach conway.js
    // Funktionen startConway, stopConway, resetIdleTimer via window.* verfügbar

    // ============================================================
    // === INVENTAR ===
    // ============================================================
    let inventory = {};

    const SHELL_CAP = 42; // The Answer. 42 🐚 = 0.042 MMX pro Spieler.

    function addToInventory(material, count) {
        count = count || 1;
        if (material === 'shell') {
            const current = inventory['shell'] || 0;
            if (current >= SHELL_CAP) {
                showToast(`🦀 Krabs: "${SHELL_CAP} Muscheln! The Answer! Mehr passt nicht in die Bank! SPAR oder GIB AUS!"`, 3000);
                return;
            }
            count = Math.min(count, SHELL_CAP - current);
        }
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
    // Export für chat.js (Floriane Muschel-Wünsche)
    window.getInventoryCount = getInventoryCount;
    window.removeFromInventory = removeFromInventory;

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
        // Muscheln = Handelswährung → eigener prominenter Block oben
        const shells = inventory['shell'] || 0;
        const shellHeader = shells > 0
            ? `<div class="inv-shell-summary" title="Muscheln — deine Handelswährung bei Mr. Krabs">
                <span class="inv-shell-label">💰 Dein Vermögen</span>
                <span class="inv-shell-amount">🐚 ${shells} Muscheln</span>
               </div>`
            : '';

        // Alle Items außer Muscheln (Muscheln werden im Header angezeigt)
        const otherItems = items.filter(([mat]) => mat !== 'shell');

        container.innerHTML = shellHeader + otherItems.map(([mat, count]) => {
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
                playMaterialSound(mat); // Inventar-Ton beim Auswählen
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
            window.INSEL_BUS && window.INSEL_BUS.emit('craft:success', { result: recipe.result, ingredients: { [a]: 1, [b]: 1 } });
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
        // #64: Elektronen-Blitz — kurze Lichtfunken beim Craften (Amélie: kein Label, kein UI)
        EFFECTS.spawnCraftSparks();

        flashInventoryTab();
        if (result.fromCache === false && isNew) {
            showToast(`🏆 WELTPREMIERE! ${result.emoji} ${result.name} — Entdecker: ${result.discoverer}! → 🎒`, 5000);
        } else if (isNew) {
            showToast(`🔮 Neues Rezept: ${result.emoji} ${result.name}! → Schau ins 🎒 Inventar!`, 4000);
        } else {
            showToast(`⚒️ ${result.emoji} 1x ${result.name} hergestellt!`);
        }

        trackEvent('llm-craft', { name: result.name, fromCache: result.fromCache });
        window.INSEL_BUS && window.INSEL_BUS.emit('craft:success', { result: matId, ingredients: result.ingredients || {} });
        updateCraftingDisplay();
        return matId;
    }

    function showCraftResult(emoji, name, count) {
        const preview = document.getElementById('craft-result');
        if (!preview) return;
        preview.innerHTML = `<span class="craft-emoji">${emoji}</span><span class="craft-result-name">${count > 1 ? count + 'x ' : ''}${escapeHtml(name)}</span><span class="craft-done-label">✅ Fertig!</span>`;
        preview.title = name;
        preview.classList.remove('has-recipe');
        preview.classList.add('craft-success');
        setTimeout(() => preview.classList.remove('craft-success'), 2000);
        // Fly-Animation: Emoji fliegt von Result-Box zum Inventar-Tab
        flyToInventory(preview, emoji);
    }

    // flyToInventory → effects.js
    function flyToInventory(fromEl, emoji) {
        EFFECTS.flyToInventory(fromEl, emoji);
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
            window.INSEL_BUS && window.INSEL_BUS.emit('craft:success', { result: recipe.result, ingredients: recipe.ingredients });
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
                const info = MATERIALS[craftingGrid[i]] || { emoji: '❓', label: craftingGrid[i] };
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
                preview.innerHTML = `<span class="craft-emoji">${info.emoji}</span><span class="craft-result-count">${recipe.resultCount > 1 ? recipe.resultCount + 'x' : ''}</span><span class="craft-preview-label">⚒️ drücken!</span>`;
                preview.title = recipe.name;
                preview.classList.add('has-recipe');
            } else {
                preview.innerHTML = '<span class="craft-question">?</span>';
                preview.title = '';
                preview.classList.remove('has-recipe');
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

    // Globaler Export für conway.js und andere Module
    window.requestRedraw = requestRedraw;
    window.INSEL_DIMS = { ROWS, COLS };

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

    // === SPIELFIGUR (Variablen weiter unten deklariert) ===
    let playerEmoji = localStorage.getItem('insel-player-emoji') || '🧒';

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
                btn.setAttribute('draggable', 'true');
                palette.appendChild(btn);
                btn.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', mat);
                    e.dataTransfer.effectAllowed = 'copy';
                    selectMaterial(mat);
                });
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentMaterial = mat;
                    soundBuild(mat);
                    currentTool = 'build';
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-tool="build"]').classList.add('active');
                });
                // Palette als Instrument: Hovern spielt Materialton (#71)
                btn.addEventListener('mouseenter', () => {
                    playMaterialSound(mat);
                });
            }
        }
        showToast(`✨ Neues Artefakt: ${info.emoji} ${info.label}!`);
        updateDiscoveryCounter();
        checkParticleProgress();
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
    let _genesisQuarksShown = false;
    let _genesisLeptonsShown = false;

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

        // Stufe 3: Teilchen (Charm/Strange/Antimatter/Leptonen)
        const QUARK_MATS = ['charm', 'strange', 'antimatter'];
        const LEPTON_MATS = ['electron', 'muon', 'tau'];
        const hasAnyQuark = QUARK_MATS.some(m => unlockedMaterials.has(m) || (inventory[m] || 0) > 0);
        const hasAnyLepton = LEPTON_MATS.some(m => unlockedMaterials.has(m) || (inventory[m] || 0) > 0);

        if (hasAnyQuark || hasAnyLepton) {
            const heading = document.getElementById('quarks-heading');
            if (heading) heading.style.display = '';
            [...QUARK_MATS, ...LEPTON_MATS].forEach(mat => {
                if (unlockedMaterials.has(mat) || (inventory[mat] || 0) > 0) {
                    const btn = document.querySelector(`.material-btn[data-material="${mat}"]`);
                    if (btn) { btn.style.display = ''; btn.classList.remove('craft-locked'); }
                }
            });
            if (hasAnyQuark && !_genesisQuarksShown) {
                _genesisQuarksShown = true;
                showToast('⚛️ Generation-2-Quarks entdeckt! Der Beschleuniger funktioniert!');
            }
            if (hasAnyLepton && !_genesisLeptonsShown) {
                _genesisLeptonsShown = true;
                showToast('🔹 Leptonen! Teilchen ohne starke Kraft!');
            }
        }

        updateGenesisBadge();
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
        // Sinn: Investitions-Erträge — ROI steigt mit Geduld
        seed:       { material: 'seed', count: 1 },      // Zu früh geerntet: kein Gewinn
        sprout:     { material: 'plant', count: 2 },      // Halbzeit: 2 Pflanzen
        fruit:      { material: 'apple', count: 3 },      // Voll reif: 3 Äpfel (2 Saat → 3 Äpfel!)
        ore:        { material: 'metal', count: 2 },      // Zu früh: 2 Metall zurück
        ingot:      { material: 'ingot', count: 2 },      // Voll reif: 2 Barren
    };

    // === KRABS: Muschelhandel — Preisliste ===
    // Muscheln sind die Insel-Währung. Krabs kauft und verkauft.
    const KRABS_SHOP = {
        // material: { buy: Muscheln die Krabs verlangt, sell: Muscheln die Krabs zahlt }
        wood:     { buy: 2,  sell: 1 },
        stone:    { buy: 3,  sell: 1 },
        sand:     { buy: 1,  sell: 1 },
        planks:   { buy: 4,  sell: 2 },
        glass:    { buy: 5,  sell: 2 },
        flower:   { buy: 3,  sell: 1 },
        fish:     { buy: 4,  sell: 2 },
        diamond:  { buy: 20, sell: 8 },
        crystal:  { buy: 15, sell: 6 },
        honey:    { buy: 8,  sell: 3 },
        apple:    { buy: 6,  sell: 2 },
    };
    let isMouseDown = false;
    let hoverCell = null;
    // animations[] → effects.js

    // --- Spielfigur ---
    let playerName = localStorage.getItem('insel-player-name') || '';
    let playerPos  = JSON.parse(localStorage.getItem('insel-player-pos') || 'null')
                     || { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) };
    let playerDragging = false;
    let playerBlocksPlaced = parseInt(localStorage.getItem('insel-blocks-placed') || '0');

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

    // Wiederkehrende Spieler: Intro wird NACH Canvas-Init ausgeblendet (siehe unten)
    // Hier nur merken, damit kein Flash of unready content auf dem iPhone entsteht
    const isReturningPlayer = !!(localStorage.getItem('insel-projekte') && playerName);
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
        if (isoMode && window.ISO_RENDERER) {
            const size = window.ISO_RENDERER.getIsoCanvasSize(CELL_SIZE, totalCols, totalRows);
            canvas.width = size.width;
            canvas.height = size.height;
            canvas.style.width = size.width + 'px';
            canvas.style.height = size.height + 'px';
        } else {
            canvas.width = totalCols * CELL_SIZE;
            canvas.height = totalRows * CELL_SIZE;
            canvas.style.width = (totalCols * CELL_SIZE) + 'px';
            canvas.style.height = (totalRows * CELL_SIZE) + 'px';
        }
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
        window.grid = grid;
    }

    // Zufalls-Insel generieren — delegiert an island-generators.js (#11)
    function generateStarterIsland() {
        window.INSEL_GENERATORS.generateStarterIsland(grid, ROWS, COLS, MATERIALS);
    }

    // === LUMMERLAND — handgebaute Tutorial-Insel ===
    // Aktivierung: ?lummerland in der URL oder localStorage
    // Delegiert an island-generators.js (#11)
    function generateLummerland() {
        window.INSEL_GENERATORS.generateLummerland(grid, ROWS, COLS, MATERIALS);
    }

    // === GENESIS-TOASTS: Schöpfungsgeschichte Phase 1 (#37) ===
    // Zeigt beim ersten Betreten einer neuen Insel 3 kurze Toasts die die Insel "erschaffen".
    // Nur einmal pro Insel (localStorage-Flag).
    const _ISLAND_GENESIS = {
        home:       ['🌊 Das Wasser weicht zurück...', '🏝️ Eine Insel entsteht!', '🌳 Der erste Baum wächst.'],
        lummerland: ['🌊 Das Meer trennt sich...', '🏝️ Eine kleine Insel erscheint!', '🏔️ Zwei Berge wachsen in den Himmel.'],
        dinobucht:  ['🌊 Das Urmeer weicht zurück...', '🦴 Fossilien tauchen aus dem Sand!', '🦕 Die Dinosaurier sind noch hier!'],
    };

    function _showIslandGenesis(dest) {
        const key = 'insel-genesis-' + dest;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        const msgs = _ISLAND_GENESIS[dest];
        if (!msgs) {
            showToast('⛵ Angekommen!', 2000);
            return;
        }
        msgs.forEach((msg, i) => setTimeout(() => showToast(msg, 2200), i * 1400));
    }

    // --- Zeichnen ---
    function draw() {
        if (!needsRedraw) return;
        needsRedraw = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // === ISOMETRISCHER MODUS ===
        if (isoMode && window.ISO_RENDERER) {
            drawIso();
            return;
        }

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
                    if (prefersReducedMotion) {
                        ctx.fillStyle = '#3498DB';
                    } else {
                        const wave = Math.sin(time * 2 + r * 0.5 + c * 0.3) * 10;
                        const blue = 52 + wave;
                        ctx.fillStyle = `rgb(${blue + 0}, ${blue + 100}, ${blue + 167})`;
                    }
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
                    if (prefersReducedMotion) {
                        ctx.fillStyle = '#3498DB';
                    } else {
                        const wave = Math.sin(time * 2 + (r + WATER_BORDER) * 0.5 + (c + WATER_BORDER) * 0.3) * 10;
                        const blue = 52 + wave;
                        ctx.fillStyle = `rgb(${blue + 0}, ${blue + 100}, ${blue + 167})`;
                    }
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
                    const mat = MATERIALS[grid[r][c]] || { emoji: '❓', label: grid[r][c], color: '#888', border: '#666' };
                    // Subtile Zellgrenze
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                    // Tao-Flackern: instabiles Atom vor dem Zerfall
                    if (grid[r][c] === 'tao') {
                        if (prefersReducedMotion) {
                            ctx.fillStyle = 'rgb(128, 128, 128)';
                        } else {
                            const flicker = Math.sin(time * 8 + r * 3.7 + c * 2.3) * 0.15;
                            const base = 128;
                            const v = Math.round(base + flicker * 80);
                            // Flackert zwischen leichtem Schwarz und leichtem Weiß
                            const bw = Math.sin(time * 3 + r + c) > 0 ? v + 20 : v - 20;
                            ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
                        }
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

        // Fraktale Bäume (L-System) über die Zellen rendern
        if (window.FRACTAL_TREES) {
            window.FRACTAL_TREES.drawAllTrees(ctx, grid, ROWS, COLS, CELL_SIZE, WATER_BORDER, false);
        }

        // Blueprint-Overlay zeichnen (Ghost-Preview)
        drawBlueprintOverlay();

        // Evolution Screensaver — Kreaturen als Emojis auf Terrain-Zonen (conway.js)
        const _conwayOverlay = window.INSEL_CONWAY && window.INSEL_CONWAY.getOverlay();
        if (_conwayOverlay) {
            ctx.font = `${Math.round(CELL_SIZE * 0.62)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!_conwayOverlay[r][c]) continue;
                    const x = (c + WATER_BORDER) * CELL_SIZE;
                    const y = (r + WATER_BORDER) * CELL_SIZE;
                    ctx.fillText(_conwayOverlay[r][c], x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 1);
                }
            }
        }

        // NPCs zeichnen
        for (const [id, pos] of Object.entries(npcPositions)) {
            const npc = NPC_DEFS[id];
            const nx = (pos.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            const ny = (pos.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            // Leichtes Wippen
            const bob = Math.sin(time * 2 + pos.r + pos.c) * 2;
            // Hintergrund-Kreis damit NPCs sichtbar sind
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(nx, ny + bob, CELL_SIZE * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Emoji
            ctx.font = `${CELL_SIZE * 0.6}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(id === 'bug' ? getBugEmoji() : npc.emoji, nx, ny + bob);
            // Name
            ctx.font = `bold ${Math.max(8, CELL_SIZE * 0.25)}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            ctx.strokeText(npc.name, nx, ny - CELL_SIZE * 0.45);
            ctx.fillText(npc.name, nx, ny - CELL_SIZE * 0.45);
            // Quest-Indikator
            const hasQuest = window.questSystem?.getAvailable(id);
            const hasActive = window.questSystem?.getActive().find(q => q.npc === id);
            if (hasQuest) {
                ctx.font = `bold ${CELL_SIZE * 0.35}px sans-serif`;
                ctx.fillStyle = '#F1C40F';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText('❗', nx + CELL_SIZE * 0.3, ny - CELL_SIZE * 0.3);
                ctx.fillText('❗', nx + CELL_SIZE * 0.3, ny - CELL_SIZE * 0.3);
            } else if (hasActive) {
                ctx.font = `bold ${CELL_SIZE * 0.35}px sans-serif`;
                ctx.fillStyle = '#3498DB';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText('❓', nx + CELL_SIZE * 0.3, ny - CELL_SIZE * 0.3);
                ctx.fillText('❓', nx + CELL_SIZE * 0.3, ny - CELL_SIZE * 0.3);
            }
        }

        // Sammelbare Items zeichnen
        for (const ci of collectibles) {
            const cx = (ci.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            const cy = (ci.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            // Schwebendes Glitzern
            const float = Math.sin(time * 3 + ci.r * 2 + ci.c) * 3;
            const glow = 0.6 + Math.sin(time * 4 + ci.c) * 0.2;
            // Leuchtkreis
            ctx.globalAlpha = glow * 0.4;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(cx, cy + float, CELL_SIZE * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Emoji
            ctx.font = `${CELL_SIZE * 0.5}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ci.emoji, cx, cy + float);
        }

        // === BERND-WOLKE (Lakitu-Style) — schwebt oben rechts ===
        {
            const bx = totalCols * CELL_SIZE - CELL_SIZE * 3;
            const by = CELL_SIZE * 1.5;
            const bob = Math.sin(time * 1.5) * 4;
            // Wolke
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.ellipse(bx, by + bob, CELL_SIZE * 1.4, CELL_SIZE * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Bernd Emoji
            ctx.font = `${CELL_SIZE * 0.8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍞', bx, by + bob);
            // Name
            ctx.font = `bold ${Math.max(8, CELL_SIZE * 0.22)}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            ctx.strokeText('Bernd', bx, by + bob + CELL_SIZE * 0.55);
            ctx.fillText('Bernd', bx, by + bob + CELL_SIZE * 0.55);
        }

        // Hover-Vorschau
        if (hoverCell) {
            const hx = (hoverCell.c + WATER_BORDER) * CELL_SIZE;
            const hy = (hoverCell.r + WATER_BORDER) * CELL_SIZE;

            if (currentTool === 'build') {
                const mat = MATERIALS[currentMaterial] || { emoji: '❓', label: currentMaterial, color: '#888', border: '#666' };
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
        EFFECTS.drawAnimations(ctx, CELL_SIZE, WATER_BORDER);

        // Day/Night Overlay
        EFFECTS.updateDayNight();
        const overlay = EFFECTS.getDayNightOverlay();
        if (overlay) {
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Wetter
        EFFECTS.updateWeather();
        EFFECTS.drawWeather(ctx, canvas);

        // Sterne bei Nacht
        const dayTime = EFFECTS.getDayTime();
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
        if (!playerName || !isParticipant()) return;
        const px = (playerPos.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
        const py = (playerPos.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;

        ctx.save();
        // Figur-Emoji
        ctx.font = `${CELL_SIZE * 0.7}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(playerEmoji, px, py);

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

    // === SPIELWELT + SPIELPHASEN ===
    //
    // Welt 1: UNIVERSUM (dunkel, Draufsicht, nur Tao platzieren)
    //   Spieler schaut von oben auf sein Universum.
    //   Tao zerfällt spontan → Automerge + Pauli erzeugen alle Teilchen.
    //   Kein Crafting-Grid. Kein NPC. Nur Physik.
    //   → Alle 11 Standardteilchen freigespielt → Welt wechselt zur Insel.
    //
    // Welt 2: INSEL (hell, Bauspiel, NPCs, Crafting)
    //   Chemie-Erweiterung: Wu Xing Elemente, Crafting-Grid, Rezepte.
    //   Bug (Vergangenheit), Floriane (Zukunft), Bernd (Jetzt) — immer da.
    //   Weitere Wesen erscheinen in 3D (Voxel).
    //
    // Phase observer: Spieler klickt, bricht Symmetrie. Cursor = Wille. Kein Avatar.
    // Phase participant: Avatar materialisiert. WASD. Interaktion mit Wesen.

    const STANDARD_PARTICLES = [
        // Quarks (6 Flavors)
        'yang', 'yin', 'charm', 'strange', 'mountain', 'cave',
        // Leptonen (3 geladen + 3 Neutrinos)
        'electron', 'muon', 'tau', 'neutrino', 'neutrino_mu', 'neutrino_tau',
        // Bosonen (Qi/Gluon + Tao/Higgs schon da, Grid/Graviton = kein Material)
        'photon', 'w_boson', 'z_boson',
        // Antimaterie
        'antimatter',
    ]; // 16 Teilchen + Qi(Gluon) + Tao(Higgs) + Grid(Graviton) = Standardmodell komplett
    let gameWorld = localStorage.getItem('insel-game-world') || 'universe';
    let gamePhase = localStorage.getItem('insel-game-phase') || 'observer';
    // Auto-Participant: Spieler mit Namen auf der Insel sind immer sichtbar
    if (gamePhase === 'observer' && playerName && localStorage.getItem('insel-grid')) {
        gamePhase = 'participant';
        localStorage.setItem('insel-game-phase', 'participant');
    }

    function checkParticleProgress() {
        const discovered = STANDARD_PARTICLES.filter(p => unlockedMaterials.has(p));
        const counter = document.getElementById('particle-counter');
        if (counter) counter.textContent = `⚛️ ${discovered.length} / ${STANDARD_PARTICLES.length}`;

        if (discovered.length >= STANDARD_PARTICLES.length && gameWorld === 'universe') {
            transitionToIsland();
        }
    }

    function transitionToIsland() {
        gameWorld = 'island';
        localStorage.setItem('insel-game-world', 'island');
        showToast('🏝️ Alle Teilchen entdeckt! Die Insel erscheint...');
        soundCraft();

        // Palette: alle Materialien freischalten
        document.querySelectorAll('.material-btn.craft-locked').forEach(btn => {
            btn.style.display = '';
        });
        // Crafting-Grid sichtbar machen
        const craftArea = document.getElementById('craft-area');
        if (craftArea) craftArea.style.display = '';
        // Hintergrund aufhellen
        document.body.classList.remove('universe-mode');
        document.body.classList.add('island-mode');
        requestRedraw();
    }

    function isUniverse() { return gameWorld === 'universe'; }
    function isIsland() { return gameWorld === 'island'; }

    function breakSymmetry() {
        if (gamePhase === 'participant') return;
        gamePhase = 'participant';
        localStorage.setItem('insel-game-phase', 'participant');
        showToast('🔴 Du bist jetzt Teil der Welt. Bewege dich mit den Pfeiltasten.');
        soundCraft();
        // Avatar materialisiert — Spielfigur erscheint
        requestRedraw();
        // Roter Knopf ausblenden
        const btn = document.getElementById('symmetry-break-btn');
        if (btn) btn.style.display = 'none';
    }

    // Öffentlich machen für den Button
    window.breakSymmetry = breakSymmetry;

    function isParticipant() {
        return gamePhase === 'participant';
    }

    function movePlayer(dr, dc) {
        if (!playerName || !isParticipant()) return;
        const nr = playerPos.r + dr;
        const nc = playerPos.c + dc;
        // Spieler bleibt auf bebaubarem Bereich (kein Wasser-Rand)
        if (nr >= 2 && nr < ROWS - 2 && nc >= 2 && nc < COLS - 2) {
            playerPos = { r: nr, c: nc };
            localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
            needsRedraw = true;
            draw(); // sofort zeichnen — nicht auf 100ms-Interval warten (#66)
            checkPlayerProximity();
        }
    }

    // --- Spieler-Abenteuer: Entdecken durch Laufen ---

    // Sammelbare Items auf der Insel
    let collectibles = JSON.parse(localStorage.getItem('insel-collectibles') || '[]');
    let lastNpcGreet = {}; // NPC-ID → timestamp, damit nicht jede Sekunde gegrüßt wird

    function spawnCollectibles() {
        if (collectibles.length >= 5) return; // max 5 gleichzeitig
        const types = [
            { emoji: '💎', name: 'Diamant', material: 'diamond' },
            { emoji: '🔑', name: 'Schlüssel', material: 'key' },
            { emoji: '🍎', name: 'Apfel', material: 'apple' },
            { emoji: '🥚', name: 'Ei', material: 'egg' },
            { emoji: '🍯', name: 'Honig', material: 'honey' },
            { emoji: '🌸', name: 'Blume', material: 'flower' },
            { emoji: '🍄', name: 'Pilz', material: 'mushroom' },
            { emoji: '🔮', name: 'Kristall', material: 'crystal' },
            { emoji: '⭐', name: 'Stern', material: 'star' },
            { emoji: '🐚', name: 'Muschel', material: 'shell' },
            { emoji: '🐚', name: 'Muschel', material: 'shell' },
        ];
        // Zufällige freie Zelle finden
        for (let attempt = 0; attempt < 50; attempt++) {
            const r = 2 + Math.floor(Math.random() * (ROWS - 4));
            const c = 2 + Math.floor(Math.random() * (COLS - 4));
            if (grid[r][c]) continue; // nur auf leeren Zellen
            if (getNpcAt(r, c)) continue;
            if (r === playerPos.r && c === playerPos.c) continue;
            if (collectibles.some(ci => ci.r === r && ci.c === c)) continue;
            const type = types[Math.floor(Math.random() * types.length)];
            collectibles.push({ ...type, r, c });
            localStorage.setItem('insel-collectibles', JSON.stringify(collectibles));
            requestRedraw();
            return;
        }
    }

    function checkPlayerProximity() {
        // Sammelbare Items einsammeln (Spieler steht drauf)
        const collected = collectibles.filter(ci => ci.r === playerPos.r && ci.c === playerPos.c);
        if (collected.length > 0) {
            collected.forEach(ci => {
                addToInventory(ci.material, 1);
                unlockMaterial(ci.material);
                showToast(`${ci.emoji} ${ci.name} gefunden!`, 2000);
                soundCraft();
            });
            collectibles = collectibles.filter(ci => ci.r !== playerPos.r || ci.c !== playerPos.c);
            localStorage.setItem('insel-collectibles', JSON.stringify(collectibles));
            updateInventoryDisplay();
            requestRedraw();
            // Neues Item spawnen (verzögert)
            setTimeout(spawnCollectibles, 3000 + Math.random() * 5000);
        }

        // NPCs in der Nähe (2 Felder) begrüßen + Quest anbieten
        const now = Date.now();
        for (const [id, pos] of Object.entries(npcPositions)) {
            const dist = Math.abs(pos.r - playerPos.r) + Math.abs(pos.c - playerPos.c);
            if (dist <= 2) {
                // Nur alle 15s pro NPC
                if (lastNpcGreet[id] && now - lastNpcGreet[id] < 15000) continue;
                lastNpcGreet[id] = now;
                showNpcQuestDialog(id);
                break; // nur ein NPC pro Schritt
            }
        }
    }

    // addPlaceAnimation + drawAnimations → effects.js

    // --- Isometrische draw()-Funktion ---
    function drawIso() {
        const ISO = window.ISO_RENDERER;
        const time = Date.now() / 1000;

        // Wasser-Hintergrund
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Wasser (outer)
        ISO.drawIsoWater(ctx, totalRows, totalCols, ROWS, COLS, WATER_BORDER, CELL_SIZE, time, prefersReducedMotion);

        // Insel + Materialien als isometrische Würfel
        ISO.drawIsoIsland(ctx, grid, MATERIALS, ROWS, COLS, WATER_BORDER, CELL_SIZE, time, prefersReducedMotion);

        // Fraktale Bäume (L-System) — isometrisch
        if (window.FRACTAL_TREES) {
            window.FRACTAL_TREES.drawAllTrees(ctx, grid, ROWS, COLS, CELL_SIZE, WATER_BORDER, true);
        }

        // Blueprint-Overlay
        drawBlueprintOverlay();

        // Conway overlay
        const _conwayOverlayIso = window.INSEL_CONWAY && window.INSEL_CONWAY.getOverlay();
        if (_conwayOverlayIso) {
            const totalColsN = COLS + WATER_BORDER * 2;
            const originX = (totalColsN * CELL_SIZE) / 2;
            const originY = CELL_SIZE * 2;
            ctx.font = `${Math.round(CELL_SIZE * 0.5)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!_conwayOverlayIso[r][c]) continue;
                    const pos = ISO.gridToIso(r + WATER_BORDER, c + WATER_BORDER, CELL_SIZE, originX, originY);
                    ctx.fillText(_conwayOverlayIso[r][c], pos.x, pos.y - CELL_SIZE * 0.4);
                }
            }
        }

        // Spielfigur (nur als Teilnehmer)
        if (playerName && isParticipant()) {
            ISO.drawIsoEntity(ctx, playerPos.r, playerPos.c, playerEmoji, playerName,
                WATER_BORDER, COLS, CELL_SIZE, time, { shadow: true, fontSize: 0.65 });
        }

        // NPCs
        for (const [id, pos] of Object.entries(npcPositions)) {
            const npc = NPC_DEFS[id];
            const npcEmoji = id === 'bug' ? getBugEmoji() : npc.emoji;
            ISO.drawIsoEntity(ctx, pos.r, pos.c, npcEmoji, npc.name,
                WATER_BORDER, COLS, CELL_SIZE, time, { bob: true, circle: true });
        }

        // Sammelbare Items
        for (const ci of collectibles) {
            const totalColsN = COLS + WATER_BORDER * 2;
            const originX = (totalColsN * CELL_SIZE) / 2;
            const originY = CELL_SIZE * 2;
            const pos = ISO.gridToIso(ci.r + WATER_BORDER, ci.c + WATER_BORDER, CELL_SIZE, originX, originY);
            const float = Math.sin(time * 3 + ci.r * 2 + ci.c) * 3;
            const glow = 0.6 + Math.sin(time * 4 + ci.c) * 0.2;
            ctx.globalAlpha = glow * 0.4;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - CELL_SIZE * 0.4 + float, CELL_SIZE * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.font = `${CELL_SIZE * 0.45}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ci.emoji, pos.x, pos.y - CELL_SIZE * 0.4 + float);
        }

        // Hover-Vorschau
        if (hoverCell) {
            ISO.drawIsoHover(ctx, hoverCell.r, hoverCell.c, MATERIALS, currentMaterial, currentTool, grid,
                WATER_BORDER, COLS, CELL_SIZE);
        }

        // Effects
        EFFECTS.drawAnimations(ctx, CELL_SIZE, WATER_BORDER);
        EFFECTS.updateDayNight();
        const overlay = EFFECTS.getDayNightOverlay();
        if (overlay) {
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        EFFECTS.updateWeather();
        EFFECTS.drawWeather(ctx, canvas);
    }

    // --- Maus → Grid-Koordinaten ---
    function getGridCell(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;

        if (isoMode && window.ISO_RENDERER) {
            return window.ISO_RENDERER.getIsoGridCell(px, py, CELL_SIZE, ROWS, COLS, WATER_BORDER);
        }

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
        // NPCs nicht überbauen
        if (getNpcAt(r, c)) return;

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
                // Wu-Xing Element-Events auf den Bus
                if (window.INSEL_BUS) {
                    var wu = { fire: 'fire', water: 'water', wood: 'wood', metal: 'metal', earth: 'earth' };
                    if (wu[currentMaterial]) window.INSEL_BUS.emit('element:' + currentMaterial, { r: r, c: c, material: currentMaterial });
                    // Dino-Materialien
                    var dinoMats = { fossil: 1, dino: 1, trex: 1, meteor: 1 };
                    if (dinoMats[currentMaterial]) window.INSEL_BUS.emit('material:dino', { r: r, c: c, material: currentMaterial });
                    window.INSEL_BUS.emit('block:placed', { r: r, c: c, material: currentMaterial });
                }
                checkAutomerge(r, c);
                checkBlueprintMatch(r, c);
                const hint = document.getElementById('genesis-hint');
                if (hint) hint.style.display = 'none';
                // Setzling platzieren startet Baumwachstum
                if (currentMaterial === 'sapling') {
                    treeGrowth[r + ',' + c] = Date.now();
                }
                // Saat/Erz platzieren startet Investitions-Wachstum (Sinn)
                if (currentMaterial === 'seed' || currentMaterial === 'ore') {
                    treeGrowth[r + ',' + c] = Date.now();
                }
                // Konsequenz: Wasser/Brunnen zieht nach 10s Blumen an (1-2 Stück)
                if (currentMaterial === 'fountain' || currentMaterial === 'water') {
                    setTimeout(() => {
                        const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
                        const empty = neighbors.map(([dr,dc]) => [r+dr, c+dc])
                            .filter(([nr,nc]) => nr >= 2 && nr < ROWS-2 && nc >= 2 && nc < COLS-2 && !grid[nr][nc]);
                        const count = Math.min(1 + Math.floor(Math.random() * 2), empty.length);
                        for (let i = 0; i < count; i++) {
                            const idx = Math.floor(Math.random() * empty.length);
                            const [fr, fc] = empty.splice(idx, 1)[0];
                            grid[fr][fc] = Math.random() < 0.5 ? 'flower' : 'plant';
                        }
                        if (count > 0) {
                            requestRedraw();
                            if (window.INSEL_BUS) window.INSEL_BUS.emit('consequence:flowers', { r: r, c: c, count: count });
                        }
                    }, 10000);
                }
                // Konsequenz: Feuer neben Holz → Holz verbrennt nach 3s
                if (currentMaterial === 'fire') {
                    const adj = [[-1,0],[1,0],[0,-1],[0,1]];
                    adj.forEach(([dr,dc]) => {
                        const nr = r+dr, nc = c+dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr]?.[nc] === 'wood') {
                            setTimeout(() => {
                                if (grid[nr][nc] === 'wood' && grid[r]?.[c] === 'fire') {
                                    grid[nr][nc] = 'ash'; requestRedraw();
                                    if (window.INSEL_BUS) window.INSEL_BUS.emit('consequence:ash', { r: nr, c: nc });
                                }
                            }, 3000);
                        }
                    });
                }
                // Segelboot platziert → Insel-Auswahl
                if (currentMaterial === 'sailboat') {
                    setTimeout(() => showSailDialog(), 500);
                }
                playerBlocksPlaced++;
                localStorage.setItem('insel-blocks-placed', playerBlocksPlaced);
                EFFECTS.addPlaceAnimation(r, c);
                if (!window.INSEL_ANALYTICS.getSessionClock().firstBlock) {
                    soundFirstBlock();
                } else {
                    soundBuild(currentMaterial);
                }
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
                // Konsequenz: Baum fällen → brauner Stumpf (path) für 5s, dann Setzling/null
                const isTreeLike = ['tree', 'small_tree', 'palm', 'sapling'].includes(cell);
                const afterStump = (cell === 'tree') ? 'sapling' : null;
                grid[r][c] = isTreeLike ? 'path' : null; // path = braun = Stumpf
                delete treeGrowth[r + ',' + c];
                if (isTreeLike) {
                    const sr = r, sc = c;
                    setTimeout(() => {
                        if (grid[sr]?.[sc] === 'path') {
                            grid[sr][sc] = afterStump;
                            if (afterStump === 'sapling') treeGrowth[sr + ',' + sc] = Date.now();
                            requestRedraw();
                        }
                    }, 5000);
                }
                addToInventory(yield_.material, yield_.count);
                unlockMaterial(yield_.material);
                // Krabs: Sand/Wasser ernten → Chance auf Bonus-Muschel (Strandgut!)
                if ((cell === 'sand' || cell === 'water') && Math.random() < 0.3) {
                    addToInventory('shell', 1);
                    unlockMaterial('shell');
                    showToast('🐚 Eine Muschel! Mr. Krabs kauft die...', 2000);
                }
                EFFECTS.addPlaceAnimation(r, c);
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
            const base = (quest.baseline || {})[material] || 0;
            const have = Math.max(0, (stats.counts[material] || 0) - base);
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
            EFFECTS.addPlaceAnimation(cr, cc);

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
            const info = MATERIALS[mat] || { emoji: '❓', label: mat };
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

    // --- Speichern / Laden / AutoSave / URL-Sharing -- delegiert an save.js ---
    // AUTOSAVE_KEY wird noch beim Start-Restore benoetigt
    const AUTOSAVE_KEY = '~autosave~';

    function saveProject() {
        if (window.INSEL_SAVE) window.INSEL_SAVE.saveProject();
    }
    function autoSave() {
        if (window.INSEL_SAVE) window.INSEL_SAVE.autoSave();
    }
    function showLoadDialog() {
        if (window.INSEL_SAVE) window.INSEL_SAVE.showLoadDialog();
    }
    function isValidGrid(g) {
        return window.INSEL_SAVE ? window.INSEL_SAVE.isValidGrid(g) : (Array.isArray(g) && g.length > 0);
    }
    function loadProject(name) {
        if (window.INSEL_SAVE) window.INSEL_SAVE.loadProject(name);
    }
    function deleteProject(name) {
        if (window.INSEL_SAVE) window.INSEL_SAVE.deleteProject(name);
    }
    function newProject() {
        if (window.INSEL_SAVE) window.INSEL_SAVE.newProject();
    }
    setInterval(autoSave, 30000);
    window.addEventListener('beforeunload', autoSave);

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
        if (window.INSEL_BUS) window.INSEL_BUS.emit('merge:result', { result: merge.result, from: fromMats, type: merge.type });
        if (typeof updateGenesisVisibility === 'function') updateGenesisVisibility();
        requestRedraw();

        // Spark animation overlay → effects.js
        EFFECTS.spawnMergeSparks(merge.cells, {
            canvas: canvas,
            COLS: COLS,
            WATER_BORDER: WATER_BORDER,
            extraClass: merge.type === 'triplet' ? 'triplet' : undefined,
        });

        // Chain merge after delay
        setTimeout(() => {
            for (const [mr, mc] of merge.cells) {
                checkAutomerge(mr, mc);
            }
        }, 500);
    }

    // spawnCraftSparks → effects.js

    // ============================================================
    // === BLUEPRINTS — 4×4 Bauplan-Erkennung ===
    // ============================================================
    let activeBlueprint = null; // { id, startR, startC } — aktuell angezeigter Bauplan-Overlay
    let completedBlueprints = JSON.parse(localStorage.getItem('insel-blueprints-done') || '[]');

    function checkBlueprintMatch(r, c) {
        const BP = window.INSEL_BLUEPRINTS;
        if (!BP) return;
        const match = BP.findBlueprint(grid, r, c, ROWS, COLS);
        if (!match) return;

        const { blueprint, startR, startC } = match;

        // Alle 4×4 Zellen zum Gebäude-Material verwandeln
        for (let dr = 0; dr < 4; dr++) {
            for (let dc = 0; dc < 4; dc++) {
                const gr = startR + dr;
                const gc = startC + dc;
                const expected = blueprint.pattern[dr][dc];
                if (expected !== null) {
                    grid[gr][gc] = blueprint.id;
                }
            }
        }

        // Tracking
        if (!completedBlueprints.includes(blueprint.id)) {
            completedBlueprints.push(blueprint.id);
            localStorage.setItem('insel-blueprints-done', JSON.stringify(completedBlueprints));
        }

        unlockMaterial(blueprint.id);
        soundCraft();
        requestRedraw();

        // Animation: Funken auf allen Zellen → effects.js
        {
            const sparkCells = [];
            for (let dr = 0; dr < 4; dr++) {
                for (let dc = 0; dc < 4; dc++) {
                    if (blueprint.pattern[dr][dc] !== null) {
                        sparkCells.push([startR + dr, startC + dc]);
                    }
                }
            }
            EFFECTS.spawnMergeSparks(sparkCells, {
                canvas: canvas,
                COLS: COLS,
                WATER_BORDER: WATER_BORDER,
                extraClass: 'blueprint-spark',
                duration: 1200,
            });
        }

        showToast(`🏗️ Bauplan erkannt: ${blueprint.emoji} ${blueprint.name}! ${blueprint.desc}`, 5000);
        updateBlueprintDisplay();
    }

    // Bauplan-Overlay auf Canvas zeichnen (Ghost-Preview)
    function drawBlueprintOverlay() {
        const BP = window.INSEL_BLUEPRINTS;
        if (!BP || !activeBlueprint) return;

        const bp = BP.BLUEPRINTS.find(b => b.id === activeBlueprint.id);
        if (!bp) return;

        const overlay = BP.getOverlay(grid, activeBlueprint.startR, activeBlueprint.startC, ROWS, COLS, bp.pattern);

        for (const cell of overlay) {
            const x = (cell.c + WATER_BORDER) * CELL_SIZE;
            const y = (cell.r + WATER_BORDER) * CELL_SIZE;

            if (cell.status === 'placed') {
                // Grün: Material ist korrekt platziert
                ctx.fillStyle = 'rgba(39, 174, 96, 0.3)';
            } else if (cell.status === 'wrong') {
                // Rot: Falsches Material
                ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
            } else {
                // Blau-transparent: Material fehlt noch
                ctx.fillStyle = 'rgba(52, 152, 219, 0.25)';
            }
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            // Ghost-Emoji für fehlende Materialien
            if (cell.status === 'missing' && cell.material !== '*') {
                const mat = MATERIALS[cell.material];
                if (mat) {
                    ctx.globalAlpha = 0.4;
                    ctx.font = `${CELL_SIZE * 0.45}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(mat.emoji, x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 1);
                    ctx.globalAlpha = 1;
                }
            }

            // Rand
            ctx.strokeStyle = cell.status === 'placed' ? 'rgba(39,174,96,0.6)' :
                              cell.status === 'wrong' ? 'rgba(231,76,60,0.6)' :
                              'rgba(52,152,219,0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.setLineDash([]);
        }
    }

    function setActiveBlueprint(blueprintId, startR, startC) {
        if (blueprintId === null) {
            activeBlueprint = null;
        } else {
            activeBlueprint = { id: blueprintId, startR, startC };
        }
        requestRedraw();
    }

    function updateBlueprintDisplay() {
        const BP = window.INSEL_BLUEPRINTS;
        const panel = document.getElementById('blueprint-list');
        if (!panel || !BP) return;

        panel.innerHTML = BP.BLUEPRINTS.map(bp => {
            const done = completedBlueprints.includes(bp.id);
            return `<div class="blueprint-item ${done ? 'blueprint-done' : ''}" data-blueprint="${bp.id}">
                <div class="blueprint-header">
                    <span class="blueprint-emoji">${bp.emoji}</span>
                    <strong>${bp.name}</strong>
                    ${done ? '<span class="blueprint-check">✅</span>' : ''}
                </div>
                <small>${bp.desc}</small>
                <div class="blueprint-grid-preview" data-blueprint="${bp.id}"></div>
            </div>`;
        }).join('');

        // Mini-Previews rendern
        panel.querySelectorAll('.blueprint-grid-preview').forEach(preview => {
            const bp = BP.BLUEPRINTS.find(b => b.id === preview.dataset.blueprint);
            if (!bp) return;
            let html = '<div class="bp-mini-grid">';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const mat = bp.pattern[r][c];
                    const info = mat ? MATERIALS[mat] : null;
                    html += `<span class="bp-cell ${mat ? '' : 'bp-empty'}">${info ? info.emoji : ''}</span>`;
                }
            }
            html += '</div>';
            preview.innerHTML = html;
        });
    }

    // Bauplan-Overlay toggle wenn Spieler auf Bauplan in Sidebar klickt
    function handleBlueprintClick(blueprintId) {
        const BP = window.INSEL_BLUEPRINTS;
        if (!BP) return;

        if (activeBlueprint && activeBlueprint.id === blueprintId) {
            // Toggle off
            setActiveBlueprint(null);
            return;
        }

        // Platziere Overlay in der Mitte des Spielfelds (oder bei Spieler)
        const startR = Math.max(2, Math.min(ROWS - 6, (playerPos?.r || Math.floor(ROWS / 2)) - 2));
        const startC = Math.max(2, Math.min(COLS - 6, (playerPos?.c || Math.floor(COLS / 2)) - 2));
        setActiveBlueprint(blueprintId, startR, startC);
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
    // Kante = starke Kopplung ans Higgs (schwere Teilchen)
    // Ecke  = schwache Kopplung ans Higgs (leichte Teilchen, √2 Distanz)
    const EDGE_DIRS = [[0,1],[0,-1],[1,0],[-1,0]];
    const CORNER_DIRS = [[1,1],[1,-1],[-1,1],[-1,-1]];

    function findFreeNeighbor(r, c, dirsPool) {
        const dirs = [...dirsPool];
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

                // Kante (50%) = starke Higgs-Kopplung → schwere Teilchen
                // Ecke  (50%) = schwache Higgs-Kopplung → leichte Teilchen (√2 Distanz)
                const isEdge = Math.random() < 0.5;
                const free = findFreeNeighbor(r, c, isEdge ? EDGE_DIRS : CORNER_DIRS)
                          || findFreeNeighbor(r, c, isEdge ? CORNER_DIRS : EDGE_DIRS);
                if (!free) continue; // Kein Platz → kein Zerfall

                // ZERFALL! Symmetriebrechung.
                const coupling = isEdge ? 'stark' : 'schwach';
                const [yr, yc] = free;
                grid[r][c] = 'yin';
                grid[yr][yc] = 'yang';

                logGenesis({ type: 'decay', from: 'tao', results: ['yin', 'yang'], cells: [[r,c],[yr,yc]], coupling });

                const couplingMsg = isEdge
                    ? '☯️ → ⚫⚪ Kante! Schwere Teilchen!'
                    : '☯️ → ⚫⚪ Ecke! Leichte Teilchen!';
                showToast(couplingMsg);
                soundCraft();
                EFFECTS.addPlaceAnimation(r, c);
                EFFECTS.addPlaceAnimation(yr, yc);

                // Spark-Animation → effects.js
                EFFECTS.spawnMergeSparks([[r,c],[yr,yc]], {
                    canvas: canvas,
                    COLS: COLS,
                    WATER_BORDER: WATER_BORDER,
                });

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
        if (hasTao && !_taoFlickerActive && !prefersReducedMotion) {
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

    // Kosmologischer Zeitstrahl: Spielereignis → Epoche des Universums
    const COSMIC_EPOCHS = [
        { result: 'qi',         epoch: 't = 10⁻¹²s',   label: 'Quark-Gluon-Plasma' },
        { result: 'charm',      epoch: 't = 10⁻⁶s',    label: 'Quark-Ära' },
        { result: 'strange',    epoch: 't = 10⁻⁶s',    label: 'Quark-Ära' },
        { result: 'antimatter', epoch: 't = 1s',        label: 'Annihilation' },
        { result: 'electron',   epoch: 't = 10s',       label: 'Lepton-Ära' },
        { result: 'muon',       epoch: 't = 10s',       label: 'Lepton-Ära' },
        { result: 'tau',        epoch: 't = 10s',       label: 'Lepton-Ära' },
        { result: 'metal',      epoch: 't = 3min',      label: 'Nukleosynthese' },
        { result: 'mountain',   epoch: 't = 380.000y',  label: 'Erste Sterne' },
        { result: 'cave',       epoch: 't = 380.000y',  label: 'Dunkle Materie' },
    ];

    function getCosmicEpoch(event) {
        if (event.type === 'decay') return 't = 10⁻³⁶s';
        const match = COSMIC_EPOCHS.find(e => e.result === event.result);
        if (match) return match.epoch;
        return `+${((event.time - (genesisLog[0]?.time || event.time)) / 1000).toFixed(1)}s`;
    }

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
                <h2>🌌 Genesis — Vom Urknall zur Insel</h2>
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

                // Kosmologische Epoche bestimmen
                const epoch = getCosmicEpoch(event);

                if (event.type === 'decay') {
                    step.innerHTML = `
                        <span class="genesis-time">${epoch}</span>
                        <span class="genesis-icon">☯️ → ⚫⚪</span>
                        <span class="genesis-text">Symmetriebrechung! Aus Eins wird Zwei.</span>
                    `;
                } else if (event.type === 'merge') {
                    const emoji = MATERIALS[event.result]?.emoji || '?';
                    step.innerHTML = `
                        <span class="genesis-time">${epoch}</span>
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

    // Inventory-API für chat.js (Floriane Muschel-Wünsche)
    window.getInselShells = function () { return getInventoryCount('shell'); };
    window.removeInselShells = function (count) { return removeFromInventory('shell', count); };

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
    // === FEYNMAN-MESSPUNKTE === (extrahiert nach analytics.js)
    // ============================================================
    // Tutorial-Puls: Callback für milestone 'firstBlock'
    function startTutorialPulse() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.classList.add('tutorial-pulse');
    }

    function stopTutorialPulse() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.classList.remove('tutorial-pulse');
    }

    // Milestone-Hook: Tutorial-Puls bei firstBlock stoppen
    if (window.INSEL) {
        window.INSEL.on('milestone', function (data) {
            if (data.key === 'firstBlock') stopTutorialPulse();
        });
    }

    // Feynman-Dashboard: game.js-State + analytics.js-Daten
    window.getTestData = function () {
        const s = window.INSEL_ANALYTICS.getSessionClock();
        const elapsed = (key) => s.start && s[key] ? Math.round((s[key] - s.start) / 1000) + 's' : '—';
        const analytics = getAnalytics();
        const events = analytics.events || [];

        return {
            '⏱️ Session-Dauer': s.start ? Math.round((Date.now() - s.start) / 1000) + 's' : '0s',
            '🧱 Zeit bis 1. Block': elapsed('firstBlock'),
            '💬 Zeit bis 1. Chat': elapsed('firstChat'),
            '👨‍💻 Zeit bis Code-View': elapsed('firstCodeView'),
            '🔍 Zeit bis 1. Easter Egg': elapsed('firstEasterEgg'),
            '🧱 Blöcke gebaut': events.filter(e => e.e === 'build').length,
            '💥 Blöcke abgerissen': events.filter(e => e.e === 'demolish').length,
            '🎨 Materialien benutzt': new Set(events.filter(e => e.e === 'build').map(e => e.d?.material)).size,
            '🔍 Easter Eggs entdeckt': events.filter(e => e.e === 'easter_egg').length,
            '🎭 Hörspiele gehört': events.filter(e => e.e === 'hoerspiel').length,
            '✨ Zaubersprüche': events.filter(e => e.e === 'code_zauber').length,
            '📸 Postkarten': events.filter(e => e.e === 'postcard').length,
            '🏆 Achievements': unlockedAchievements.length,
            '📜 Quests abgeschlossen': completedQuests.length,
        };
    };

    // === TUTORIAL-ONBOARDING (#15) — kein Text, nur Icons ===
    // 3 Schritte à 2.5s, Tap überspringt. Nur für Erstbesucher.
    function showTutorialOnboarding() {
        const overlay = document.getElementById('tutorial-onboarding');
        if (!overlay) return;
        overlay.style.display = 'flex';

        const steps = [1, 2, 3];
        let current = 0;

        function showStep(i) {
            steps.forEach(n => {
                const el = document.getElementById('tut-step-' + n);
                if (el) el.style.display = (n === i + 1) ? 'flex' : 'none';
                const dot = document.getElementById('tut-dot-' + n);
                if (dot) dot.style.opacity = (n === i + 1) ? '1' : '0.3';
            });
        }

        function advance() {
            current++;
            if (current >= steps.length) {
                overlay.style.display = 'none';
                return;
            }
            showStep(current);
            timer = setTimeout(advance, 2500);
        }

        showStep(0);
        let timer = setTimeout(advance, 2500);

        overlay.addEventListener('click', function onTap() {
            clearTimeout(timer);
            overlay.removeEventListener('click', onTap);
            current = steps.length; // direkt beenden
            overlay.style.display = 'none';
        }, { once: true });
    }

    // === EVENT LISTENERS ===

    // --- Oscar als 7. Schicht: Baustil-Erkennung ---
    // Analysiert das gespeicherte Grid und erkennt den Baustil des Spielers.
    // Gibt { stil, emoji, blockCount } zurück.
    function analysiereBaustil(g) {
        const counts = {};
        let total = 0;

        // Materialien nach Kategorie gruppieren
        const kategorien = {
            gaertner:    ['tree', 'small_tree', 'sapling', 'plant', 'flower', 'garden', 'wood', 'cactus', 'mushroom', 'butterfly', 'bee', 'honey', 'apple', 'nest', 'egg'],
            seefahrer:   ['water', 'wave', 'fish', 'flyfish', 'boat', 'dock', 'fountain', 'bridge', 'rain', 'rainbow', 'shell'],
            bergbauer:   ['stone', 'mountain', 'cave', 'stalactite', 'gem', 'diamond', 'metal', 'earth', 'ash', 'crystal'],
            feuertaenzer:['fire', 'volcano', 'phoenix', 'lightning', 'forge', 'firecake', 'dragoncake', 'tornado'],
        };

        // Alle Zellen zählen
        for (let r = 0; r < (g ? g.length : 0); r++) {
            for (let c = 0; c < (g[r] ? g[r].length : 0); c++) {
                const mat = g[r][c];
                if (mat) {
                    counts[mat] = (counts[mat] || 0) + 1;
                    total++;
                }
            }
        }

        if (total === 0) return { stil: 'Insel-Architekt', emoji: '🏝️', blockCount: 0 };

        // Score pro Kategorie berechnen
        const scores = {};
        for (const [kat, mats] of Object.entries(kategorien)) {
            scores[kat] = mats.reduce((sum, m) => sum + (counts[m] || 0), 0);
        }

        const maxScore = Math.max(...Object.values(scores));
        const dominant = Object.entries(scores).find(([, v]) => v === maxScore)?.[0];

        // Mindest-Schwelle: 15% der platzierten Blöcke müssen in eine Kategorie fallen
        const threshold = total * 0.15;
        let stil, stilEmoji;
        if (maxScore >= threshold && dominant) {
            const stilMap = {
                gaertner:    { label: 'Gärtner',    emoji: '🌳' },
                seefahrer:   { label: 'Seefahrer',  emoji: '⛵' },
                bergbauer:   { label: 'Bergbauer',  emoji: '⛏️' },
                feuertaenzer:{ label: 'Feuertänzer',emoji: '🔥' },
            };
            stil      = stilMap[dominant].label;
            stilEmoji = stilMap[dominant].emoji;
        } else {
            stil      = 'Insel-Architekt';
            stilEmoji = '🏝️';
        }

        return { stil, emoji: stilEmoji, blockCount: total };
    }

    // Baustil speichern + personalisierten Toast anzeigen (nur für Wiederkehrende)
    function zeigeWillkommensToast(name) {
        const { stil, emoji, blockCount } = analysiereBaustil(grid);
        // Baustil in Spieler-Profil persistieren
        localStorage.setItem('insel-baustil', stil);
        const msg = `${emoji} Willkommen zurück, ${name} der ${stil}! Deine Insel hat ${blockCount} Blöcke.`;
        setTimeout(() => showToast(msg, 5000), 800);
    }

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
                playerName = 'Spieler';
                localStorage.setItem('insel-player-name', playerName);
            }
        }
        // Gewähltes Avatar-Emoji übernehmen
        const activeAvatar = document.querySelector('.avatar-btn.active');
        if (activeAvatar) {
            playerEmoji = activeAvatar.dataset.avatar;
            localStorage.setItem('insel-player-emoji', playerEmoji);
        }

        // Big Bang Countdown — nur für Erstbesucher
        const isFirstVisit = !localStorage.getItem('insel-grid');
        const BB = window.INSEL_BIGBANG;
        if (isFirstVisit && BB) {
            BB.startCountdown();
            // Warten bis Countdown fertig, dann Grid zeigen
            const checkDone = setInterval(() => {
                if (!BB.isActive()) {
                    clearInterval(checkDone);
                    finishIntro(isFirstVisit);
                }
            }, 100);
        } else {
            finishIntro(isFirstVisit);
        }
    }

    function finishIntro(isFirstVisit) {
        introOverlay.classList.add('hiding');
        setTimeout(() => {
            introOverlay.style.display = 'none';
            // Pulse nur wenn noch kein Block platziert wurde
            const hasBlocks = grid.some(row => row && row.some(cell => cell !== null));
            if (!hasBlocks) startTutorialPulse();
            // Tutorial-Onboarding nur für Erstbesucher
            if (isFirstVisit) showTutorialOnboarding();
            // Heimatinsel-Genesis: nur beim allerersten Start
            _showIslandGenesis('home');
        }, 300);
        // Spieler ist nach Intro immer Teilnehmer — Figur sichtbar machen
        breakSymmetry();
        window.startSessionClock();
    }

    // Avatar-Picker: Klick = auswählen
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.avatar-btn').forEach(b => {
                b.style.borderColor = 'transparent';
                b.classList.remove('active');
            });
            btn.style.borderColor = 'rgba(255,255,255,0.9)';
            btn.classList.add('active');
        });
    });

    // Name-Input: Enter-Taste = Spiel starten
    const playerNameInput = document.getElementById('player-name-input');
    if (playerNameInput) {
        playerNameInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') startGame();
        });
    }

    startButton.addEventListener('click', startGame);

    // Big Bang Canvas initialisieren für Erstbesucher
    if (!localStorage.getItem('insel-grid') && window.INSEL_BIGBANG) {
        window.INSEL_BIGBANG.init(introOverlay);
    }

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
        updateGenesisBadge();
    }

    // Genesis-Stufen Fortschrittsanzeige (#69)
    // 道→⚫⚪→五行→✨→万+ zeigt Oscar wo er in der Schöpfung steht
    function updateGenesisBadge() {
        const badge = document.getElementById('genesis-badge');
        if (!badge) return;
        const crafted = unlockedMaterials.size;
        const hasQuarks = ['charm', 'strange'].some(m => unlockedMaterials.has(m));
        const hasLeptons = ['electron', 'muon', 'tau'].some(m => unlockedMaterials.has(m));
        const hasAntimatter = unlockedMaterials.has('antimatter');
        let label, tip;
        if (!_genesisYinYangShown) {
            label = '道'; tip = 'Am Anfang war ein Punkt... — Lege ☯️ auf die Insel';
        } else if (!_genesisQiShown) {
            label = '⚫⚪'; tip = 'Symmetriebrechung (t=10⁻³⁶s) — Yin + Yang';
        } else if (!hasQuarks && crafted < 10) {
            label = '五行'; tip = 'Nukleosynthese (t=3min) — Die 5 Elemente';
        } else if (hasQuarks && !hasLeptons) {
            label = '⚛️'; tip = 'Quark-Ära — Charm & Strange entdeckt!';
        } else if (hasLeptons && !hasAntimatter) {
            label = '🔹'; tip = 'Lepton-Ära — Teilchen ohne starke Kraft';
        } else if (hasAntimatter) {
            label = '💥'; tip = `Materie-Antimaterie — E=mc² (${crafted} entdeckt)`;
        } else if (crafted < 20) {
            label = `✨${crafted}`; tip = `Genesis: ${crafted} Dinge erschaffen`;
        } else {
            label = '万+'; tip = `万物 — 10.000 Dinge (${crafted} entdeckt)`;
        }
        badge.textContent = label;
        badge.title = tip;
    }

    function selectMaterial(mat) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        const target = document.querySelector(`.material-btn[data-material="${mat}"]`);
        if (target) target.classList.add('active');
        // Tao-Glow stoppen nach erstem Klick
        const taoBtn = document.querySelector('.material-btn[data-material="tao"]');
        if (taoBtn) taoBtn.classList.add('tao-clicked');
        currentMaterial = mat;
        soundSelect(currentMaterial);
        currentTool = 'build';
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="build"]').classList.add('active');
    }

    // Material-Buttons — Klick = Ton spielen (Palette als Klavier)
    document.querySelectorAll('.material-btn').forEach(btn => {
        // Drag & Drop: Material aus Palette auf Canvas ziehen (Oscar's Wunsch)
        btn.setAttribute('draggable', 'true');
        btn.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', btn.dataset.material);
            e.dataTransfer.effectAllowed = 'copy';
            selectMaterial(btn.dataset.material);
        });

        btn.addEventListener('click', () => {
            selectMaterial(btn.dataset.material);
        });

        // Palette als Instrument: Hovern spielt Materialton (#71)
        btn.addEventListener('mouseenter', () => {
            playMaterialSound(btn.dataset.material);
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
        if (window.resetIdleTimer) window.resetIdleTimer();
        // TTS Hörspiel stoppen bei Canvas-Interaktion (Backlog #87)
        if (window.INSEL_TTS && window.INSEL_TTS.hoerspielSpeaking) stopHoerspiel();
        isMouseDown = true;
        undoPushedThisStroke = false;
        // Bernd-Wolke Klick (oben rechts)
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        const bwx = totalCols * CELL_SIZE - CELL_SIZE * 3;
        const bwy = CELL_SIZE * 1.5;
        if (Math.abs(mx - bwx) < CELL_SIZE * 1.4 && Math.abs(my - bwy) < CELL_SIZE * 0.7) {
            isMouseDown = false;
            if (window.openChat) window.openChat('bernd');
            return;
        }
        const cell = getGridCell(e);
        if (cell) {
            const npcId = getNpcAt(cell.r, cell.c);
            if (npcId) { showNpcQuestDialog(npcId); isMouseDown = false; return; }
            // Höhle → Dungeon-Eingang (#50)
            if (grid[cell.r]?.[cell.c] === 'cave' && currentTool === 'build') {
                openDungeon(); isMouseDown = false; return;
            }
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
    // Swipe-Tracking für Code-Layer-Wechsel (S21-2)
    let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
    let touchWasPainting = false;
    const SWIPE_MIN_X = 50;
    const SWIPE_MAX_Y = 40;

    canvas.addEventListener('touchstart', (e) => {
        if (window.resetIdleTimer) window.resetIdleTimer();
        e.preventDefault();
        undoPushedThisStroke = false;
        touchWasPainting = false;
        const touch = e.touches[0];
        touchStartX = touchEndX = touch.clientX;
        touchStartY = touchEndY = touch.clientY;
        const cell = getGridCell(touch);
        if (!cell) return;
        // NPC antippen → Quest-Dialog
        const npcId = getNpcAt(cell.r, cell.c);
        if (npcId) { showNpcQuestDialog(npcId); return; }
        // Höhle antippen → Dungeon-Eingang (#50)
        if (grid[cell.r]?.[cell.c] === 'cave' && currentTool === 'build') {
            openDungeon(); return;
        }
        // Spielfigur-Drag: Berühre die Spieler-Zelle → Figur ziehen
        if (playerName && isParticipant() && cell.r === playerPos.r && cell.c === playerPos.c) {
            playerDragging = true;
            return;
        }
        isMouseDown = true;
        touchWasPainting = true;
        applyTool(cell.r, cell.c);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;
        const cell = getGridCell(touch);
        if (playerDragging && cell) {
            // Spieler auf neue Position ziehen (kein Wasser-Rand)
            if (cell.r >= 2 && cell.r < ROWS - 2 && cell.c >= 2 && cell.c < COLS - 2) {
                playerPos = { r: cell.r, c: cell.c };
                localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
                requestRedraw();
                checkPlayerProximity();
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
        // Swipe → Code-Layer wechseln (nur wenn nicht gemalt und nicht Figur gezogen)
        if (!touchWasPainting && !playerDragging) {
            const dx = touchEndX - touchStartX;
            const dy = Math.abs(touchEndY - touchStartY);
            if (Math.abs(dx) >= SWIPE_MIN_X && dy < SWIPE_MAX_Y) {
                if (codeViewActive) {
                    // Links-Swipe (dx < 0) = nächste Ebene, Rechts-Swipe = vorherige
                    if (dx < 0) {
                        window.nextCodeLayer();
                    } else {
                        window.prevCodeLayer();
                    }
                } else {
                    // Code-View noch nicht aktiv → einschalten
                    window.toggleCodeView();
                }
            }
        }
        isMouseDown = false;
        playerDragging = false;
        hoverCell = null;
    });

    // Drag & Drop: Material aus Palette auf Canvas ziehen
    canvas.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        const mat = e.dataTransfer.getData('text/plain');
        if (!mat || !MATERIALS[mat]) return;
        selectMaterial(mat);
        const cell = getGridCell(e);
        if (cell) applyTool(cell.r, cell.c);
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
            const BANNER_H = 90; // 10px mehr für QR-Code-Platz
            pc.height = canvas.height + BANNER_H;

            // Insel kopieren
            pcCtx.drawImage(canvas, 0, 0);

            // Postkarten-Banner unten
            pcCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            pcCtx.fillRect(0, canvas.height, pc.width, BANNER_H);

            // QR-Code rechts im Banner (schatzinsel.app, scanbar für Eltern)
            const QR_SIZE = 82; // Pixel inkl. Quiet-Zone
            const qrX = pc.width - QR_SIZE - 6;
            const qrY = canvas.height + 4;
            if (window.QRCode) window.QRCode.draw(pcCtx, 'https://schatzinsel.app', qrX, qrY, QR_SIZE);

            // Text links/mittig neben QR-Code
            const textWidth = pc.width - QR_SIZE - 12;
            pcCtx.fillStyle = '#F9E79F';
            pcCtx.font = 'bold 17px Fredoka, sans-serif';
            pcCtx.textAlign = 'center';
            pcCtx.fillText(`📸 Grüße von der Insel Java!`, textWidth / 2, canvas.height + 26);

            pcCtx.fillStyle = '#FFFFFF';
            pcCtx.font = '12px Comic Neue, sans-serif';
            const discoveries = discoveredEggs.length;
            pcCtx.fillText(
                `🏗️ ${stats.total} Blöcke · 🎨 ${stats.uniqueMats} Materialien · 🔍 ${discoveries} entdeckt`,
                textWidth / 2, canvas.height + 47
            );
            pcCtx.fillText(
                `🏆 ${unlockedAchievements.length} Erfolge`,
                textWidth / 2, canvas.height + 63
            );

            pcCtx.font = '10px Comic Neue, sans-serif';
            pcCtx.fillStyle = '#AAA';
            pcCtx.fillText('Außer Text nix gehext. 🏝️', textWidth / 2, canvas.height + 80);

            // QR-Code auf Postkarte (#7)
            function renderPostcard() {
                const link = document.createElement('a');
                link.download = `postkarte-von-java-${name.replace(/\s+/g, '-')}.png`;
                link.href = pc.toDataURL('image/png');
                link.click();
            }

            if (window.QRCode) {
                try {
                    const qrSize = 64;
                    const qrMargin = 8;
                    const qrContainer = document.createElement('div');
                    new window.QRCode(qrContainer, {
                        text: 'https://schatzinsel.app/',
                        width: qrSize, height: qrSize,
                        colorDark: '#000000', colorLight: '#ffffff',
                        correctLevel: window.QRCode.CorrectLevel.M
                    });
                    const qrCanvas = qrContainer.querySelector('canvas');
                    if (qrCanvas) {
                        // Weißer Hintergrund hinter QR
                        const qrX = pc.width - qrSize - qrMargin;
                        const qrY = canvas.height + (80 - qrSize) / 2;
                        pcCtx.fillStyle = '#FFFFFF';
                        pcCtx.fillRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
                        pcCtx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
                    }
                } catch (_) { /* QR nicht verfügbar — kein Problem */ }
            }

            renderPostcard();

            showToast('📸 Postkarte gespeichert! Zeig sie deinen Freunden!');
            trackEvent('postcard', { blocks: stats.total, discoveries });
        });
    }

    // --- #22: Projekt-Sharing via URL -- delegiert an save.js ---
    function encodeGridToURL() {
        return window.INSEL_SAVE ? window.INSEL_SAVE.encodeGridToURL() : '';
    }
    function decodeGridFromURL(encoded) {
        return window.INSEL_SAVE ? window.INSEL_SAVE.decodeGridFromURL(encoded) : false;
    }

    // Share-Button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const encoded = encodeGridToURL();
            const url = `${location.origin}${location.pathname}?insel=${encoded}`;
            navigator.clipboard.writeText(url)
                .then(() => showToast('🔗 Link kopiert! Schick ihn deinen Freunden!', 3000))
                .catch(() => {
                    // Fallback: URL anzeigen
                    prompt('Link kopieren:', url);
                });
            trackEvent('share', { blocks: getGridStats().total });
        });
    }

    // === Schatzkarte — Eltern-Dashboard via Shared Secret ===
    // Oscar erstellt einen Code, sagt ihn Papa, Papa sieht Stats.
    // 4 Wörter, 256^4 = 4 Mrd. Kombinationen, 24h TTL.
    let karteCode = localStorage.getItem('karteCode') || null;

    function getWorkerUrl() {
        return (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy)
            || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
    }

    async function createSchatzkarte() {
        const stats = getGridStats();
        const payload = {
            blocks:    stats.total,
            shells:    typeof getInventoryCount === 'function' ? getInventoryCount('shell') : 0,
            quests:    stats.questsDone || 0,
            minutes:   window._sessionMinutes || 0,
            materials: stats.uniqueMats || 0,
            player:    localStorage.getItem('playerName') || 'Anonym',
        };

        try {
            const res = await fetch(getWorkerUrl() + '/karte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.ok && data.code) {
                karteCode = data.code;
                localStorage.setItem('karteCode', karteCode);
                navigator.clipboard.writeText(karteCode)
                    .then(() => showToast(`🗺️ Schatzkarte: ${karteCode}\nKopiert! Sag den Code deinen Eltern!`, 6000))
                    .catch(() => showToast(`🗺️ Schatzkarte: ${karteCode}`, 8000));
            }
        } catch (e) {
            showToast('🗺️ Schatzkarte konnte nicht erstellt werden (offline?)', 3000);
        }
    }

    async function updateSchatzkarte() {
        if (!karteCode) return;
        const stats = getGridStats();
        const payload = {
            blocks:    stats.total,
            shells:    typeof getInventoryCount === 'function' ? getInventoryCount('shell') : 0,
            quests:    stats.questsDone || 0,
            minutes:   window._sessionMinutes || 0,
            materials: stats.uniqueMats || 0,
        };
        try {
            await fetch(getWorkerUrl() + '/karte/' + karteCode, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch { /* still — kein Toast bei Update-Fehler */ }
    }

    // Auto-Update alle 60s wenn Karte aktiv
    setInterval(() => { if (karteCode) updateSchatzkarte(); }, 60000);

    // Schatzkarte-Button (neben Share-Button)
    const karteBtn = document.getElementById('karte-btn');
    if (karteBtn) {
        karteBtn.addEventListener('click', createSchatzkarte);
    }

    // URL-Sharing: beim Start ?insel= Parameter prüfen und Grid laden
    const sharedGrid = new URLSearchParams(location.search).get('insel');
    if (sharedGrid) {
        const ok = decodeGridFromURL(sharedGrid);
        if (ok && introOverlay) {
            introOverlay.style.display = 'none';
            if (window.startSessionClock) window.startSessionClock();
            const hasBlocks = grid.some(row => row && row.some(cell => cell !== null));
            if (!hasBlocks) startTutorialPulse();
            showToast('🏝️ Geteilte Insel geladen!', 3000);
            // URL sauber halten — Parameter entfernen
            history.replaceState({}, '', location.pathname);
        }
    }

    // Lade-Dialog Events
    document.getElementById('close-load-dialog').addEventListener('click', () => {
        loadDialog.classList.add('hidden');
    });

    // Dungeon-Dialog schließen (#50)
    const dungeonDialog = document.getElementById('dungeon-dialog');
    if (dungeonDialog) {
        document.getElementById('close-dungeon-dialog').addEventListener('click', () => {
            dungeonDialog.classList.add('hidden');
        });
        dungeonDialog.addEventListener('click', (e) => {
            if (e.target === dungeonDialog) dungeonDialog.classList.add('hidden');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (window.resetIdleTimer) window.resetIdleTimer();
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
    const THEMES = ['tropical', 'night', 'candy', 'ocean', 'retro', 'neon', 'sakura', 'arctic', 'jungle', 'volcano', 'ice'];
    const THEME_NAMES = ['🏝️ Tropeninsel', '🌙 Nachtmodus', '🍭 Candy Pop', '🌊 Ozean', '🕹️ Retro', '⚡ Neon', '🌸 Sakura', '❄️ Arctic', '🌿 Dschungel', '🌋 Vulkan', '🧊 Eiskristall'];
    let currentTheme = localStorage.getItem('insel-theme') || 'tropical';
    const userChoseTheme = localStorage.getItem('insel-theme-manual') === '1';

    function applyTheme(theme, manual = false) {
        document.documentElement.setAttribute('data-theme', theme);
        if (manual) {
            document.documentElement.setAttribute('data-theme-manual', '');
            localStorage.setItem('insel-theme-manual', '1');
        }
        currentTheme = theme;
        localStorage.setItem('insel-theme', theme);
        requestRedraw();
        // Analytics
        trackEvent('theme_change', { theme });
    }

    // Apple HIG #8: Dark Mode — respect OS preference when user hasn't chosen manually
    if (!userChoseTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('night');
    }

    // Live-Switch: OS wechselt zwischen Light/Dark → Theme folgt (nur wenn nicht manuell)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('insel-theme-manual') === '1') return;
        applyTheme(e.matches ? 'night' : 'tropical');
    });

    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
            applyTheme(THEMES[idx], true);
            showToast(`${THEME_NAMES[idx]} aktiviert!`);
        });
    }

    // --- Code-View-Button ---
    // --- Iso-Toggle (Tetraeder-Gitter) ---
    const isoBtn = document.getElementById('iso-btn');
    if (isoBtn) {
        if (isoMode) isoBtn.classList.add('active');
        isoBtn.addEventListener('click', () => {
            // Grid-Migration: alte Blöcke in neues Grid übertragen
            const oldGrid = grid.map(row => row.slice());
            const oldRows = ROWS, oldCols = COLS;
            isoMode = !isoMode;
            localStorage.setItem('insel-iso-mode', isoMode);
            isoBtn.classList.toggle('active', isoMode);
            // Neue Dimensionen setzen
            const dims = getGridDimensions(isoMode);
            COLS = dims.cols; ROWS = dims.rows;
            CELL_SIZE = calcCellSize();
            initGrid();
            // Blöcke zentriert übertragen
            const offR = Math.max(0, Math.floor((ROWS - oldRows) / 2));
            const offC = Math.max(0, Math.floor((COLS - oldCols) / 2));
            const srcOffR = Math.max(0, Math.floor((oldRows - ROWS) / 2));
            const srcOffC = Math.max(0, Math.floor((oldCols - COLS) / 2));
            for (let r = 0; r < Math.min(oldRows, ROWS); r++) {
                for (let c = 0; c < Math.min(oldCols, COLS); c++) {
                    const sr = r + srcOffR, sc = c + srcOffC;
                    const dr = r + offR, dc = c + offC;
                    if (sr < oldRows && sc < oldCols && dr < ROWS && dc < COLS && oldGrid[sr]?.[sc]) {
                        grid[dr][dc] = oldGrid[sr][sc];
                    }
                }
            }
            window.grid = grid;
            initNpcPositions();
            resizeCanvas();
            if (isoMode) {
                showToast('🔷 Iso-Modus: 64×64 Grid!', 2000);
            } else {
                showToast('🎨 Normal-Modus: ' + COLS + '×' + ROWS, 2000);
            }
        });
    }

    const codeViewBtn = document.getElementById('code-view-btn');
    if (codeViewBtn) {
        codeViewBtn.addEventListener('click', () => {
            window.toggleCodeView();
            codeViewBtn.classList.toggle('active', codeViewActive);
        });
    }

    // --- Tutorial-Button ---
    const tutorialBtn = document.getElementById('tutorial-btn');
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            if (window.INSEL_TUTORIAL) window.INSEL_TUTORIAL.open();
        });
    }

    // --- Wetter-Button ---
    const weatherBtn = document.getElementById('weather-btn');
    const WEATHER_TYPES = ['sun', 'rain', 'rainbow'];
    const WEATHER_EMOJIS = ['☀️', '🌧️', '🌈'];
    if (weatherBtn) {
        weatherBtn.addEventListener('click', () => {
            const idx = (WEATHER_TYPES.indexOf(EFFECTS.getWeather()) + 1) % WEATHER_TYPES.length;
            EFFECTS.setWeather(WEATHER_TYPES[idx]);
            EFFECTS.resetWeatherTimer();
            weatherBtn.textContent = WEATHER_EMOJIS[idx];
            showToast(`Wetter: ${WEATHER_EMOJIS[idx]}`);
        });
    }

    // --- Mute-Button (stoppt auch TTS Hörspiele, Backlog #87) ---
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const nowMuted = !INSEL_SOUND.isMuted();
            INSEL_SOUND.setMuted(nowMuted);
            if (nowMuted && window.speechSynthesis) window.speechSynthesis.cancel();
            muteBtn.textContent = nowMuted ? '🔇' : '🔊';
            // TTS sofort stoppen wenn gemutet
            if (nowMuted) {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                if (window.INSEL_TTS && window.INSEL_TTS.hoerspielSpeaking) window.INSEL_TTS.stopHoerspiel();
                INSEL_SOUND.setMasterVolume(1.0);
            }
            showToast(nowMuted ? 'Ton aus (+ Hörspiele)' : 'Ton an');
        });
    }

    // === GENRE-TONSEQUENZEN (Backlog #85) ===
    const genreBtn = document.getElementById('genre-btn');
    if (genreBtn && _snd.setGenre && _snd.getGenreNames) {
        const genreNames = _snd.getGenreNames();
        let genreIndex = genreNames.indexOf(_snd.getGenre ? _snd.getGenre() : genreNames[0]);
        if (genreIndex < 0) genreIndex = 0;

        function updateGenreBtn() {
            const active = _snd.getGenreMode && _snd.getGenreMode();
            genreBtn.textContent = active ? '🎼' : '🎶';
            genreBtn.title = active
                ? `Genre: ${genreNames[genreIndex]} — klicken für nächstes`
                : 'Musik-Genre aktivieren — klicken';
            genreBtn.style.opacity = active ? '1' : '0.6';
        }
        updateGenreBtn();

        genreBtn.addEventListener('click', () => {
            const wasActive = _snd.getGenreMode && _snd.getGenreMode();
            if (!wasActive) {
                // Aktivieren
                _snd.setGenreMode(true);
                showToast(`🎼 ${genreNames[genreIndex]}`);
            } else {
                // Nächstes Genre
                genreIndex = (genreIndex + 1) % genreNames.length;
                _snd.setGenre(genreNames[genreIndex]);
                const atEnd = genreIndex === genreNames.length - 1;
                if (atEnd) {
                    // Einmal durch alle → deaktivieren beim nächsten Klick klar machen
                    _snd.setGenreMode(false);
                    showToast('🔇 Genre-Modus aus');
                } else {
                    showToast(`🎼 ${genreNames[genreIndex]}`);
                }
            }
            updateGenreBtn();
        });
    }

    // === REPLAY-SONG — Bauwerk als Melodie abspielen ===
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            // Alle belegten Zellen von oben-links nach unten-rechts sammeln
            const cells = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (grid[r][c]) cells.push({ r, c, mat: grid[r][c] });
                }
            }
            if (cells.length === 0) {
                showToast('🎵 Nichts zu spielen — bau erst etwas!');
                return;
            }
            replayBtn.disabled = true;
            replayBtn.textContent = '⏳';
            const STEP_MS = Math.max(40, Math.min(200, 4000 / cells.length));
            cells.forEach(({ r, c, mat }, i) => {
                setTimeout(() => {
                    soundBuild(mat);
                    // Kurzes visuelles Highlight: Zelle blinkt
                    replayHighlight(r, c);
                    if (i === cells.length - 1) {
                        setTimeout(() => {
                            replayBtn.disabled = false;
                            replayBtn.textContent = '🎵';
                        }, 400);
                    }
                }, i * STEP_MS);
            });
        });
    }

    // === REWIND / ZEITREISE (Backlog #77) ===
    // Baugeschichte rückwärts abspielen wie Kassettenrekorder
    const rewindBtn = document.getElementById('rewind-btn');
    if (rewindBtn) {
        rewindBtn.addEventListener('click', () => {
            if (undoStack.length === 0) {
                showToast('⏪ Keine Geschichte zum Zurückspulen!');
                return;
            }
            rewindBtn.disabled = true;
            rewindBtn.textContent = '⏳';

            // Aktuellen Zustand merken für Forward am Ende
            const currentGrid = JSON.stringify(grid);
            const snapshots = undoStack.slice(); // Kopie
            snapshots.push(currentGrid); // Aktuell als letzten Frame

            // Rückwärts abspielen
            let idx = snapshots.length - 1;
            const STEP_MS = Math.max(80, Math.min(300, 5000 / snapshots.length));

            function stepRewind() {
                if (idx < 0) {
                    // Vorwärts zurück zum Ist-Zustand
                    let fwd = 0;
                    function stepForward() {
                        if (fwd >= snapshots.length) {
                            rewindBtn.disabled = false;
                            rewindBtn.textContent = '⏪';
                            showToast('⏪ Zeitreise beendet!');
                            return;
                        }
                        grid = JSON.parse(snapshots[fwd]);
                        window.grid = grid;
                        requestRedraw();
                        if (!INSEL_SOUND.isMuted()) INSEL_SOUND.soundBuild('qi');
                        fwd++;
                        setTimeout(stepForward, STEP_MS / 2);
                    }
                    setTimeout(stepForward, 400);
                    return;
                }
                grid = JSON.parse(snapshots[idx]);
                window.grid = grid;
                requestRedraw();
                if (!INSEL_SOUND.isMuted()) INSEL_SOUND.soundDemolish(() => ({ percent: (idx / snapshots.length) * 100 }));
                idx--;
                setTimeout(stepRewind, STEP_MS);
            }

            showToast('⏪ Zeitreise...');
            stepRewind();
        });
    }

    // Kurzes Highlight auf einer Canvas-Zelle (weißer Flash)
    function replayHighlight(r, c) {
        const x = (c + WATER_BORDER) * CELL_SIZE;
        const y = (r + WATER_BORDER) * CELL_SIZE;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        ctx.restore();
        setTimeout(() => requestRedraw(), 80);
    }

    // ============================================================
    // === ANALYTICS === (extrahiert nach analytics.js)
    // ============================================================
    // trackEvent + recordMilestone: oben deklariert (Zeile 8-9) wegen TDZ
    function getAnalytics() { return window.INSEL_ANALYTICS.getAnalytics(); }
    function trackSession() { window.INSEL_ANALYTICS.trackSession(currentTheme); }
    function assignABTest() { return window.INSEL_ANALYTICS.assignABTest(THEMES, applyTheme); }

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
            sessionDuration: window.INSEL_ANALYTICS.getSessionClock().start ? Math.round((Date.now() - window.INSEL_ANALYTICS.getSessionClock().start) / 1000) : 0,
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
                        EFFECTS.addPlaceAnimation(r, c);
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
            EFFECTS.setWeather(w);
            EFFECTS.resetWeatherTimer();
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
                    EFFECTS.addPlaceAnimation(r, c);
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
    // Layer 0 = aus, 1 = Material-Key, 2 = Koordinaten, 3 = Farb-Hex
    let codeViewActive = false;
    let codeViewLayer = 1;
    const CODE_LAYERS = [
        { id: 'key',   label: 'grid[r][c]',     color: '#00FF41' },  // Matrix-Grün
        { id: 'coord', label: '[row, col]',      color: '#00BFFF' },  // Deep Sky Blue
        { id: 'hex',   label: 'color: #hex',     color: '#FF6B9D' },  // Pink
    ];
    let codeViewSwipeHintShown = !!localStorage.getItem('insel-code-swipe-hint');

    window.toggleCodeView = function () {
        codeViewActive = !codeViewActive;
        if (codeViewActive) {
            showToast('👨‍💻 Code-Ansicht AN — ' + CODE_LAYERS[codeViewLayer - 1].label);
            recordMilestone('firstCodeView');
            trackEvent('code_view_toggle', { state: 'on', layer: codeViewLayer });
            // Touch-Hint beim ersten Mal auf Touch-Geräten
            if (!codeViewSwipeHintShown && ('ontouchstart' in window)) {
                setTimeout(function () {
                    showToast('← swipe → zum Ebenen-Wechsel', 3000);
                }, 800);
                codeViewSwipeHintShown = true;
                localStorage.setItem('insel-code-swipe-hint', '1');
            }
        } else {
            showToast('🎨 Normal-Ansicht');
        }
    };
    window.isCodeViewActive = function () { return codeViewActive; };

    /** Nächste Code-Ebene (Swipe links) */
    window.nextCodeLayer = function () {
        if (!codeViewActive) return;
        codeViewLayer = (codeViewLayer % CODE_LAYERS.length) + 1;
        showToast('</> ' + CODE_LAYERS[codeViewLayer - 1].label);
        requestRedraw();
    };

    /** Vorherige Code-Ebene (Swipe rechts) */
    window.prevCodeLayer = function () {
        if (!codeViewActive) return;
        codeViewLayer = ((codeViewLayer - 2 + CODE_LAYERS.length) % CODE_LAYERS.length) + 1;
        showToast('</> ' + CODE_LAYERS[codeViewLayer - 1].label);
        requestRedraw();
    };

    // Code-View Rendering in draw() einhängen — überschreibt Emoji-Darstellung
    const _originalDraw = draw;

    // Erweiterte draw-Funktion mit Code-View-Overlay
    function drawCodeOverlay() {
        if (!codeViewActive) return;
        const layer = CODE_LAYERS[codeViewLayer - 1];
        const layerColor = layer.color;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    const x = (c + WATER_BORDER) * CELL_SIZE;
                    const y = (r + WATER_BORDER) * CELL_SIZE;
                    // Dunkler Hintergrund
                    ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    // Code-Text je nach Layer
                    ctx.fillStyle = layerColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    var cellText = '';
                    if (layer.id === 'key') {
                        ctx.font = 'bold ' + Math.max(8, CELL_SIZE * 0.28) + 'px monospace';
                        cellText = grid[r][c];
                    } else if (layer.id === 'coord') {
                        ctx.font = 'bold ' + Math.max(7, CELL_SIZE * 0.22) + 'px monospace';
                        cellText = r + ',' + c;
                    } else if (layer.id === 'hex') {
                        var mat = MATERIALS[grid[r][c]];
                        ctx.font = 'bold ' + Math.max(7, CELL_SIZE * 0.22) + 'px monospace';
                        cellText = mat ? mat.color : '?';
                    }
                    ctx.fillText(cellText, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                }
            }
        }
        // Code-View Label
        const shellsNow = typeof getInventoryCount === 'function' ? getInventoryCount('shell') : 0;
        const adamsMode = shellsNow === 42;
        const labelText = adamsMode
            ? 'DON\'T PANIC \u00b7 The Answer is 42 \u00b7 So long, and thanks for all the fish'
            : '</> ' + layer.label + '  [' + codeViewLayer + '/' + CODE_LAYERS.length + ']';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, adamsMode ? 420 : 260, 24);
        ctx.fillStyle = adamsMode ? '#FFD700' : layerColor;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(labelText, 10, 10);

        // === Crypto Donation Panel — Nerd Easter Egg ===
        drawBurnPanel(ctx, 5, totalRows * CELL_SIZE - 63, Math.min(460, totalCols * CELL_SIZE - 10));
    }

    // Burn-Panel als eigene Funktion — auch ohne Code-View nutzbar
    function drawBurnPanel(ctx, x, y, w) {
        const mmxAddr = window.INSEL_MMX_BURN || 'mmx1dvufsshkk2vyujjs2uwarsk99as8qp4he7srf529yu0ulhm904jskmthxq';
        const mmxBal = window._mmxBurnBalance || '?';
        const panelH = 48;

        // Panel-Hintergrund
        ctx.fillStyle = 'rgba(15, 15, 15, 0.88)';
        ctx.fillRect(x, y, w, panelH);
        ctx.strokeStyle = '#FF6B00';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, panelH);

        // Zeile 1: MMX (Nerd-Ebene — kein Goldstandard, nur Energiebeweis)
        ctx.fillStyle = '#FF6B00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('\uD83D\uDD25 ' + mmxBal + ' MMX gefarmt  [nerd easter egg]', x + 5, y + 5);

        // Zeile 2: Wu Xing Kreislauf
        ctx.fillStyle = '#666';
        ctx.font = '8px monospace';
        ctx.fillText('\u2600\uFE0F Sonne \u2192 \uD83C\uDF31 Farmer \u2192 \uD83E\uDE99 Token \u2192 \uD83D\uDD73\uFE0F Loch \u2192 \uD83C\uDFDD\uFE0F Spiel', x + 5, y + 22);
        ctx.fillText('\u706B        \u6728        \u91D1        \u6C34        \u571F', x + 5, y + 34);
    }

    // Crypto Balance-Polling alle 60s — über unseren Worker-Proxy
    // (mmxplorer + spacescan blocken direkte Browser-Requests)
    let _lastKnownMmxBal = null;
    (function fetchCryptoBalances() {
        const proxy = (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy) || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
        function poll() {
            fetch(proxy + '/burn').then(r => r.ok ? r.json() : null).then(data => {
                if (!data) return;
                const newBal = data.mmx != null ? data.mmx.toFixed(4) : null;
                // Toast bei Balance-Änderung (nicht beim ersten Load)
                if (_lastKnownMmxBal !== null && newBal !== _lastKnownMmxBal && newBal !== null) {
                    showToast('\uD83D\uDD25 Schwarzes Loch: ' + newBal + ' MMX verschlungen!', 5000);
                }
                _lastKnownMmxBal = newBal;
                window._mmxBurnBalance = newBal || '\u2014';
                requestRedraw();
            }).catch(() => {
                window._mmxBurnBalance = '\u2014';
            });
        }
        poll();
        setInterval(poll, 60000);
    })();

    // Monkey-patch requestAnimationFrame callback to add overlay
    const origRAF = window.requestAnimationFrame;

    // --- Testdaten + Bug-Reporter: extrahiert nach analytics.js ---
    // Game-Stats Callback registrieren für collectTestData()
    window.INSEL_ANALYTICS.setGameStatsFn(function () {
        const stats = getGridStats();
        return {
            total: stats.total,
            uniqueMats: stats.uniqueMats,
            achievements: unlockedAchievements.length,
            questsDone: completedQuests.length,
            questsActive: activeQuests.length,
            easterEggs: discoveredEggs.length,
            hoerspiele: playedHoerspiele.length,
        };
    });
    window.INSEL_ANALYTICS.initTestUI(showToast);

    // --- Block-Tracking ---

    // --- save.js Context registrieren ---
    if (window.INSEL_SAVE) {
        window.INSEL_SAVE.registerContext({
            ROWS: ROWS,
            COLS: COLS,
            getGrid: function() { return grid; },
            setGrid: function(g) { grid = g; },
            getTreeGrowth: function() { return treeGrowth; },
            setTreeGrowth: function(tg) {
                Object.keys(treeGrowth).forEach(function(k) { delete treeGrowth[k]; });
                Object.assign(treeGrowth, tg);
            },
            getInventory: function() { return inventory; },
            setInventory: function(inv) { inventory = inv; },
            getUnlockedMaterials: function() { return unlockedMaterials; },
            setUnlockedMaterials: function(s) { unlockedMaterials = s; },
            getDiscoveredRecipes: function() { return discoveredRecipes; },
            setDiscoveredRecipes: function(s) { discoveredRecipes = s; },
            getPlayerPos: function() { return playerPos; },
            resetPlayerPos: function() {
                playerPos = { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) };
                localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
            },
            getMaterials: function() { return MATERIALS; },
            getProjectName: function() { return projectNameInput ? projectNameInput.value.trim() : ''; },
            setProjectName: function(n) { if (projectNameInput) projectNameInput.value = n; },
            initGrid: initGrid,
            generateStarterIsland: generateStarterIsland,
            saveInventory: saveInventory,
            saveUnlocked: saveUnlocked,
            saveDiscoveredRecipes: saveDiscoveredRecipes,
            setWindowGrid: function() { window.grid = grid; },
            migrateUnlocked: migrateUnlocked,
            updateStats: updateStats,
            updateInventoryDisplay: updateInventoryDisplay,
            updatePaletteVisibility: updatePaletteVisibility,
            updateGenesisVisibility: updateGenesisVisibility,
            updateDiscoveryCounter: updateDiscoveryCounter,
            requestRedraw: requestRedraw,
            requestStatsUpdate: requestStatsUpdate,
            resetGenesisFlags: function() {
                _genesisYinYangShown = false;
                _genesisQiShown = false;
            },
        });
    }

    // --- save.js Context registrieren ---
    if (window.INSEL_SAVE) {
        window.INSEL_SAVE.registerContext({
            ROWS: ROWS,
            COLS: COLS,
            getGrid: function() { return grid; },
            setGrid: function(g) { grid = g; },
            getTreeGrowth: function() { return treeGrowth; },
            setTreeGrowth: function(tg) {
                Object.keys(treeGrowth).forEach(function(k) { delete treeGrowth[k]; });
                Object.assign(treeGrowth, tg);
            },
            getInventory: function() { return inventory; },
            setInventory: function(inv) { inventory = inv; },
            getUnlockedMaterials: function() { return unlockedMaterials; },
            setUnlockedMaterials: function(s) { unlockedMaterials = s; },
            getDiscoveredRecipes: function() { return discoveredRecipes; },
            setDiscoveredRecipes: function(s) { discoveredRecipes = s; },
            getPlayerPos: function() { return playerPos; },
            resetPlayerPos: function() {
                playerPos = { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) };
                localStorage.setItem('insel-player-pos', JSON.stringify(playerPos));
            },
            getMaterials: function() { return MATERIALS; },
            getProjectName: function() { return projectNameInput ? projectNameInput.value.trim() : ''; },
            setProjectName: function(n) { if (projectNameInput) projectNameInput.value = n; },
            initGrid: initGrid,
            generateStarterIsland: generateStarterIsland,
            saveInventory: saveInventory,
            saveUnlocked: saveUnlocked,
            saveDiscoveredRecipes: saveDiscoveredRecipes,
            setWindowGrid: function() { window.grid = grid; },
            migrateUnlocked: migrateUnlocked,
            updateStats: updateStats,
            updateInventoryDisplay: updateInventoryDisplay,
            updatePaletteVisibility: updatePaletteVisibility,
            updateGenesisVisibility: updateGenesisVisibility,
            updateDiscoveryCounter: updateDiscoveryCounter,
            requestRedraw: requestRedraw,
            requestStatsUpdate: requestStatsUpdate,
            resetGenesisFlags: function() {
                _genesisYinYangShown = false;
                _genesisQiShown = false;
            },
        });
    }

    // === START ===
    initGrid();

    // Inventar + freigeschaltete Materialien laden
    loadInventory();
    loadUnlocked();

    // Auto-Save wiederherstellen wenn vorhanden
    const savedProjects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
    if (savedProjects[AUTOSAVE_KEY] && isValidGrid(savedProjects[AUTOSAVE_KEY].grid)) {
        const savedGrid = savedProjects[AUTOSAVE_KEY].grid;
        const savedRows = savedGrid.length;
        const savedCols = savedGrid[0] ? savedGrid[0].length : 0;
        // Grid-Dimensionen können sich ändern (Desktop→Mobile, Portrait→Landscape)
        if (savedRows !== ROWS || savedCols !== COLS) {
            // Inhalte übertragen soweit sie passen, Rest bleibt null
            for (let r = 0; r < Math.min(savedRows, ROWS); r++) {
                for (let c = 0; c < Math.min(savedCols, COLS); c++) {
                    if (savedGrid[r] && savedGrid[r][c]) grid[r][c] = savedGrid[r][c];
                }
            }
        } else {
            grid = savedGrid;
        }
        // treeGrowth ist shared reference → clear + assign
        Object.keys(treeGrowth).forEach(function(k) { delete treeGrowth[k]; });
        Object.assign(treeGrowth, savedProjects[AUTOSAVE_KEY].treeGrowth || {});
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
        // Baustil-Erkennung beim Laden — Oscar als 7. Schicht
        if (playerName) {
            zeigeWillkommensToast(playerName);
        } else {
            showToast('🔄 Letzte Insel wiederhergestellt');
        }
    } else {
        // Lummerland oder Zufalls-Insel
        if (new URLSearchParams(location.search).has('lummerland')) {
            generateLummerland();
            setTimeout(() => showToast('🏝️ Willkommen auf Lummerland! Eine kleine Insel mit zwei Bergen...', 4000), 1000);
        } else {
            generateStarterIsland();
            setTimeout(() => showToast('🏝️ Deine Insel wartet... Bau los!', 3500), 2000);
        }
    }

    // NPCs auf freie Zellen platzieren (nach Grid-Init + Auto-Save-Restore)
    initNpcPositions();

    // Sammelbare Items spawnen (Schätze, Materialien zum Einsammeln)
    if (collectibles.length === 0) {
        for (let i = 0; i < 3; i++) spawnCollectibles();
    }

    // Dirty-flag statt rAF-Loop — CPU 20%→<5%
    // var (nicht let) damit requestRedraw() via hoisting schon in resizeCanvas() nutzbar ist
    needsRedraw = true;
    setInterval(draw, 100);
    // Collectibles + NPCs animieren (Glitzern/Wippen)
    setInterval(() => { if (collectibles.length > 0) requestRedraw(); }, 200);

    // === Progressive Disclosure (Hick's Law) ===
    // Toolbar, Sidebar, Chat erscheinen mit Spielfortschritt.
    // Kein Button ohne Funktion. Kein Menü ohne Inhalt.
    function updateProgressiveDisclosure() {
        const blocksPlaced = playerBlocksPlaced || 0;
        const matCount = unlockedMaterials.size;
        const hasRecipe = discoveredRecipes && discoveredRecipes.size > 0;
        const hasQuest = activeQuests && activeQuests.length > 0;
        const completedQuestCount = completedQuests ? completedQuests.length : 0;

        // Stufe 1: Erstbesuch — nur Malen-Button
        // Stufe 2: Tao platziert (1+ Blöcke) — + Bernd Chat
        // Stufe 3: Qi entdeckt (Wu Xing da) — + Insel-Info Sidebar
        // Stufe 4: Erstes Rezept — + Werkbank, Inventar
        // Stufe 5: Erste Quest — + Quests-Tab, NPCs
        // Stufe 6: 10+ Materialien — + Rest

        const stufe = blocksPlaced === 0 ? 1
            : !hasRecipe && matCount < 5 ? 2
            : !hasRecipe ? 3
            : completedQuestCount === 0 && !hasQuest ? 4
            : matCount < 10 ? 5
            : 6;

        // Toolbar
        const harvest = document.querySelector('[data-tool="harvest"]');
        const fill = document.querySelector('[data-tool="fill"]');
        const craftBtn = document.getElementById('craft-btn');
        const craftGroup = document.getElementById('craft-group');
        const viewGroup = document.getElementById('view-group');
        const overflowGroup = document.getElementById('overflow-group');
        const discoveryGroup = document.getElementById('discovery-group');

        if (harvest) harvest.style.display = stufe >= 2 ? '' : 'none';
        if (fill) fill.style.display = stufe >= 3 ? '' : 'none';
        if (craftGroup) craftGroup.style.display = stufe >= 4 ? '' : 'none';
        if (viewGroup) viewGroup.style.display = stufe >= 4 ? '' : 'none';
        if (overflowGroup) overflowGroup.style.display = stufe >= 5 ? '' : 'none';
        if (discoveryGroup) discoveryGroup.style.display = stufe >= 3 ? '' : 'none';

        // Chat-Bubble
        const chatBubble = document.getElementById('chat-bubble');
        if (chatBubble) chatBubble.style.display = stufe >= 2 ? '' : 'none';

        // Sidebar-Tabs — nur zeigen wenn Inhalt da
        const sidebarTabs = document.querySelectorAll('.sidebar-tab');
        sidebarTabs.forEach(tab => {
            const target = tab.dataset.tab;
            if (target === 'quests') tab.style.display = stufe >= 5 ? '' : 'none';
            if (target === 'achievements') tab.style.display = stufe >= 6 ? '' : 'none';
        });
    }

    // Alle 2s Fortschritt prüfen (leichtgewichtig)
    updateProgressiveDisclosure();
    setInterval(updateProgressiveDisclosure, 2000);

    // Wiederkehrende Spieler: Intro JETZT ausblenden — Canvas ist bereit
    if (isReturningPlayer && introOverlay) {
        // Ersten Frame zeichnen bevor Overlay weg ist
        draw();
        introOverlay.style.display = 'none';
        if (window.startSessionClock) window.startSessionClock();
        // Pulse nur wenn noch kein Block platziert wurde (leere Insel)
        const hasBlocks = grid.some(row => row && row.some(cell => cell !== null));
        if (!hasBlocks) startTutorialPulse();
        else stopTutorialPulse();
    }

    // Safety: Pulse entfernen falls durch alten Cache-Code gesetzt
    const blocksExist = grid.some(row => row && row.some(cell => cell !== null));
    if (blocksExist) stopTutorialPulse();

    updateAchievementDisplay();
    updateQuestDisplay();
    updateInventoryDisplay();
    updatePaletteVisibility();
    updateGenesisVisibility();
    updateDiscoveryCounter();

    // Genesis-Replay Button
    const genesisReplayBtn = document.getElementById('genesis-replay-btn');
    if (genesisReplayBtn) genesisReplayBtn.addEventListener('click', playGenesisReplay);

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

    // --- Marketplace Button ---
    const marketBtn = document.getElementById('market-btn');
    if (marketBtn) marketBtn.addEventListener('click', function () {
        if (window.INSEL_MARKETPLACE) window.INSEL_MARKETPLACE.open();
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

    // --- Blueprint Sidebar Events ---
    updateBlueprintDisplay();
    document.getElementById('blueprint-list')?.addEventListener('click', (e) => {
        const item = e.target.closest('.blueprint-item');
        if (item) {
            handleBlueprintClick(item.dataset.blueprint);
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

    // Genre-Toast bei Wechsel (Backlog #85)
    const GENRE_LABELS = {
        klassik: '🎻 Klassik', jazz: '🎷 Jazz', blues: '🎸 Blues',
        rock: '🤘 Rock', elektro: '⚡ Elektro', reggae: '🌴 Reggae',
        country: '🤠 Country', funk: '🕺 Funk', walzer: '💃 Walzer',
        schlaflied: '🌙 Schlaflied', marsch: '🥁 Marsch', samba: '🌶️ Samba',
        ambient: '🌊 Ambient', piraten: '🏴‍☠️ Piraten', zirkus: '🎪 Zirkus',
    };
    if (window.INSEL_SOUND && window.INSEL_SOUND.setOnGenreChange) {
        window.INSEL_SOUND.setOnGenreChange((genre) => {
            showToast(GENRE_LABELS[genre] || genre, 2000);
        });
    }

    // Nature-Modul starten (Baumwachstum + Welt-Konsequenzen)
    window.INSEL_NATURE.start(grid, ROWS, COLS, MATERIALS, {
        addPlaceAnimation: function(r, c) { EFFECTS.addPlaceAnimation(r, c); },
        unlockMaterial: unlockMaterial,
        updateStats: updateStats,
        showToast: showToast,
        requestRedraw: requestRedraw
    });

    // ============================================================
    // === ELTERN-DASHBOARD (#17) ===
    // Bernd das Brot zeigt trockene Statistiken für Eltern
    // ============================================================

    // Session-Log: jede Session in localStorage persistieren
    (function initSessionLog() {
        const key = 'insel-session-log';
        const log = JSON.parse(localStorage.getItem(key) || '[]');
        const sessionStart = window.INSEL_ANALYTICS.getSessionClock().start || Date.now();
        // Beim Seiten-Verlassen: aktuelle Session in Log schreiben
        window.addEventListener('beforeunload', function () {
            const duration = Math.round((Date.now() - sessionStart) / 1000);
            if (duration < 5) return; // Kurz-Bounces ignorieren
            const stats = getGridStats();
            const entry = {
                ts: sessionStart,
                duration_s: duration,
                blocks: stats.playerPlaced || 0,
                quests: stats.questsDone || 0,
            };
            const updated = [entry, ...log].slice(0, 20); // max 20 Einträge
            localStorage.setItem(key, JSON.stringify(updated));
        });
    })();

    function getBaustil(counts) {
        // Oscar 7. Schicht: Baustil aus Materialverteilung ableiten
        if (!counts || Object.keys(counts).length === 0) return '—';
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        if (total === 0) return '—';

        // Kategorien
        const natur = ['tree', 'palm', 'plant', 'flower', 'mushroom', 'sapling', 'wood', 'earth'];
        const wasser = ['water', 'fish', 'boat', 'bridge', 'fountain'];
        const struktur = ['stone', 'planks', 'roof', 'door', 'window_pane', 'fence', 'path', 'glass'];
        const licht = ['lamp', 'fire', 'qi'];

        const score = (keys) => keys.reduce((s, k) => s + (counts[k] || 0), 0) / total;

        const scores = {
            'Naturpark': score(natur),
            'Seemacht': score(wasser),
            'Festungsbauer': score(struktur),
            'Lichtarchitekt': score(licht),
        };
        const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        if (top[1] < 0.15) return 'Generalist';
        return top[0];
    }

    function formatDuration(seconds) {
        if (!seconds || seconds < 60) return seconds + ' Sek.';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return h + ' Std. ' + m + ' Min.';
        return m + ' Min.';
    }

    function formatDate(ts) {
        return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }

    function openDashboard() {
        const overlay = document.getElementById('dashboard-overlay');
        if (!overlay) return;

        const analytics = getAnalytics();
        const stats = getGridStats();
        const metrics = window.getMetrics ? window.getMetrics() : {};
        const sessionLog = JSON.parse(localStorage.getItem('insel-session-log') || '[]');
        const matUsage = JSON.parse(localStorage.getItem('insel-mat-usage') || '{}');

        // Spielzeit gesamt: aus Session-Log summieren + aktuelle Session
        const historicSeconds = sessionLog.reduce((s, e) => s + (e.duration_s || 0), 0);
        const currentSeconds = window.INSEL_ANALYTICS.getSessionClock().start
            ? Math.round((Date.now() - window.INSEL_ANALYTICS.getSessionClock().start) / 1000)
            : 0;
        const totalSeconds = historicSeconds + currentSeconds;

        // Lieblingsmaterial
        const sorted = Object.entries(matUsage).sort((a, b) => b[1] - a[1]);
        const favKey = sorted.length > 0 ? sorted[0][0] : null;
        const favLabel = favKey ? (MATERIALS[favKey]?.emoji || '') + ' ' + (MATERIALS[favKey]?.label || favKey) : '—';

        // Baustil
        const baustil = getBaustil(stats.counts);

        // Engagement-Score
        const engagement = metrics.engagement || 0;

        // DOM befüllen
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('dash-total-time', totalSeconds > 0 ? formatDuration(totalSeconds) : '—');
        set('dash-sessions', analytics.sessions || '—');
        set('dash-blocks', localStorage.getItem('insel-blocks-placed') || stats.playerPlaced || '—');
        set('dash-quests', (typeof completedQuests !== 'undefined' ? completedQuests.length : 0).toString());
        set('dash-fav-material', favLabel);
        set('dash-baustil', baustil);
        set('dash-engagement', engagement + ' / 100');
        set('dash-materials', Object.keys(matUsage).length > 0 ? Object.keys(matUsage).length.toString() : '—');

        const fill = document.getElementById('dash-engagement-fill');
        if (fill) fill.style.width = engagement + '%';

        // Chat-Nutzung pro NPC
        const chatStatsEl = document.getElementById('dash-chat-stats');
        if (chatStatsEl) {
            const chatStats = JSON.parse(localStorage.getItem('insel-chat-stats') || '{}');
            const chatEntries = Object.entries(chatStats).sort((a, b) => b[1] - a[1]);
            chatStatsEl.textContent = '';
            if (chatEntries.length === 0) {
                var emptyP = document.createElement('p');
                emptyP.className = 'dashboard-empty';
                emptyP.textContent = 'Noch keine Chat-Nachrichten gesendet.';
                chatStatsEl.appendChild(emptyP);
            } else {
                var chars = window.INSEL_CHARACTERS || {};
                chatEntries.forEach(function (entry) {
                    var npcId = entry[0], count = entry[1];
                    var npcVoice = NPC_VOICES[npcId];
                    var charInfo = chars[npcId];
                    var emoji = (npcVoice && npcVoice.emoji) || (charInfo && charInfo.emoji) || '';
                    var name = (charInfo && charInfo.name) || (npcVoice && npcVoice.prefix.replace(':', '')) || npcId;

                    var row = document.createElement('div');
                    row.className = 'dashboard-session-row';
                    var nameSpan = document.createElement('span');
                    nameSpan.className = 'dashboard-session-date';
                    nameSpan.textContent = emoji + ' ' + name;
                    var metaSpan = document.createElement('span');
                    metaSpan.className = 'dashboard-session-meta';
                    var countSpan = document.createElement('span');
                    countSpan.textContent = count + ' Nachrichten';
                    metaSpan.appendChild(countSpan);
                    row.appendChild(nameSpan);
                    row.appendChild(metaSpan);
                    chatStatsEl.appendChild(row);
                });
            }
        }

        // Session-Verlauf
        const listEl = document.getElementById('dash-sessions-list');
        if (listEl) {
            if (sessionLog.length === 0) {
                listEl.innerHTML = '<p class="dashboard-empty">Noch keine Session-Daten gespeichert.</p>';
            } else {
                listEl.innerHTML = sessionLog.slice(0, 5).map(s => `
                    <div class="dashboard-session-row">
                        <span class="dashboard-session-date">${formatDate(s.ts)}</span>
                        <span class="dashboard-session-meta">
                            <span>${formatDuration(s.duration_s)}</span>
                            <span>${s.blocks} Blöcke</span>
                            <span>${s.quests} Quests</span>
                        </span>
                    </div>
                `).join('');
            }
        }

        overlay.classList.remove('hidden');
        document.getElementById('dashboard-close-btn')?.focus();
    }

    function closeDashboard() {
        const overlay = document.getElementById('dashboard-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    // Bernd ist KEIN Grid-NPC — er schwebt als Lakitu-Wolke über der Insel
    // Klick auf die Wolke öffnet Dashboard/Support-Chat

    // Dashboard-Button in Toolbar
    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', openDashboard);
    }

    // Bernd-NPC-Klick: Dashboard öffnen statt Quest-Dialog
    const _origShowNpcQuestDialog = showNpcQuestDialog;
    // showNpcQuestDialog bereits per Closure definiert — Bernd-Branch via global
    window._openDashboardFromBernd = function () {
        showToast('🍞 Bernd: "Schau dir das an. Ich schon nicht mehr."', 3000);
        setTimeout(openDashboard, 400);
    };

    // Close-Buttons
    document.getElementById('dashboard-close-btn')?.addEventListener('click', closeDashboard);
    document.getElementById('dashboard-close-btn-2')?.addEventListener('click', closeDashboard);
    document.getElementById('dashboard-overlay')?.addEventListener('click', function (e) {
        if (e.target === this) closeDashboard();
    });

    // Keyboard: Escape schließt Dashboard
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('dashboard-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                closeDashboard();
            }
        }
    });

})();
