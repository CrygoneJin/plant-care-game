// custom-npc.js — Eigene NPCs craften (Backlog #35)
// Spieler können bis zu 3 Custom-NPCs erstellen.
// Kosten: 10 beliebige Materialien. Persönlichkeit bestimmt ELIZA-Script.
// Geladen NACH chat.js (braucht INSEL_CHARACTERS, INSEL_ELIZA, openChat).

(function () {
    'use strict';

    const MAX_CUSTOM_NPCS = 3;
    const CRAFT_COST = 10; // 10 beliebige Materialien
    const STORAGE_KEY = 'insel-custom-npcs';

    // Emoji-Auswahl für Custom-NPCs
    const EMOJI_OPTIONS = [
        '🐱', '🐶', '🐸', '🦊', '🐧', '🐝',
        '🦋', '🐙', '🦖', '🐲', '👻', '🤖',
        '🧙', '🧜', '🧚', '🦸', '🎃', '🌟',
    ];

    // Persönlichkeits-Templates → ELIZA-Scripts
    const PERSONALITY_SCRIPTS = {
        freundlich: {
            label: '😊 Freundlich',
            buildScript: (name, emoji) => ({
                initial: `${emoji} Hallo! Ich bin ${name}! Schön dich zu sehen! Was bauen wir heute?`,
                finale: `${emoji} Tschüss! Du machst das super! Bis bald!`,
                quit: ['tschüss', 'bye', 'ciao'],
                pre: {}, post: {},
                keywords: [
                    { word: 'bau', rank: 6, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Das wird bestimmt wunderschön! Weiter so!`,
                            `${emoji} Toll! Jeder Block macht die Insel schöner!`,
                            `${emoji} Super Idee! Ich freu mich mit dir!`,
                        ]},
                    ]},
                    { word: 'hilf', rank: 5, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Klar helfe ich dir! Was brauchst du?`,
                            `${emoji} Zusammen schaffen wir das! Was ist los?`,
                        ]},
                    ]},
                    { word: 'traurig', rank: 7, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Hey, Kopf hoch! Du bist toll so wie du bist!`,
                            `${emoji} Manchmal ist man traurig. Das ist okay. Ich bin hier!`,
                        ]},
                    ]},
                    { word: 'ich bin', rank: 4, rules: [
                        { decomp: '* ich bin *', reassembly: [
                            `${emoji} Du bist (2)? Das finde ich schön!`,
                            `${emoji} (2)? Cool! Erzähl mir mehr!`,
                        ]},
                    ]},
                    { word: 'ich will', rank: 5, rules: [
                        { decomp: '* ich will *', reassembly: [
                            `${emoji} Du willst (2)? Lass uns das zusammen machen!`,
                            `${emoji} (2)? Gute Idee! Los geht's!`,
                        ]},
                    ]},
                    { word: 'xnone', rank: 0, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Erzähl mir mehr!`,
                            `${emoji} Das klingt spannend!`,
                            `${emoji} Ich hör dir zu! Was noch?`,
                        ]},
                    ]},
                ],
            }),
            system: (name, emoji) =>
                `Du bist ${name} ${emoji}. Freundlich, ermutigend, warmherzig. Du freust dich über alles was der Spieler baut. Kurze Sätze, viel Begeisterung. Maximal 2 Sätze pro Antwort.`,
        },
        frech: {
            label: '😜 Frech',
            buildScript: (name, emoji) => ({
                initial: `${emoji} Yo! ${name} hier! Was geht ab auf dieser Insel?`,
                finale: `${emoji} Ciao! Bau keinen Mist... oder doch! Hehe!`,
                quit: ['tschüss', 'bye', 'ciao'],
                pre: {}, post: {},
                keywords: [
                    { word: 'bau', rank: 6, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Pff, das nennst du bauen? Zeig mal was Großes!`,
                            `${emoji} Nicht schlecht... für einen Anfänger! Hehe!`,
                            `${emoji} Ja ja, bau ruhig weiter. Ich guck zu und nasche!`,
                        ]},
                    ]},
                    { word: 'hilf', rank: 5, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Hm... ich KÖNNTE helfen. Was krieg ich dafür?`,
                            `${emoji} Hilfe? Ich? Pff! Na gut, EINMAL!`,
                        ]},
                    ]},
                    { word: 'doof', rank: 7, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Doof? ICH?! Guck dich mal an! Hahaha!`,
                            `${emoji} Doof ist relativ. Relativ zu MIR ist alles doof!`,
                        ]},
                    ]},
                    { word: 'ich bin', rank: 4, rules: [
                        { decomp: '* ich bin *', reassembly: [
                            `${emoji} Du bist (2)? Ja klar, und ich bin der König! Hehe!`,
                            `${emoji} (2)? Naja, jeder hat seine Schwächen!`,
                        ]},
                    ]},
                    { word: 'ich will', rank: 5, rules: [
                        { decomp: '* ich will *', reassembly: [
                            `${emoji} (2)? Träum weiter! ...nee, Spaß, mach ruhig!`,
                            `${emoji} Du willst (2)? Na dann zeig mal was du drauf hast!`,
                        ]},
                    ]},
                    { word: 'xnone', rank: 0, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Ja und? Hehe!`,
                            `${emoji} Langweilig! Mach was Verrücktes!`,
                            `${emoji} Pff! Das kann ich besser!`,
                        ]},
                    ]},
                ],
            }),
            system: (name, emoji) =>
                `Du bist ${name} ${emoji}. Frech, witzig, neckisch — aber nie gemein. Du ziehst den Spieler auf, hilfst aber trotzdem. Kurze Sätze, frecher Humor. Maximal 2 Sätze pro Antwort.`,
        },
        weise: {
            label: '🦉 Weise',
            buildScript: (name, emoji) => ({
                initial: `${emoji} Willkommen, junger Baumeister. Ich bin ${name}. Was bewegt dich?`,
                finale: `${emoji} Geh in Frieden. Die Insel wartet auf dich.`,
                quit: ['tschüss', 'bye', 'ciao'],
                pre: {}, post: {},
                keywords: [
                    { word: 'bau', rank: 6, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Jeder Block erzählt eine Geschichte. Was erzählt deiner?`,
                            `${emoji} Bauen ist Denken mit den Händen. Sehr gut.`,
                            `${emoji} Die beste Architektur entsteht aus Stille und Geduld.`,
                        ]},
                    ]},
                    { word: 'warum', rank: 7, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Eine gute Frage. Die Antwort liegt oft in der nächsten Frage.`,
                            `${emoji} Warum ist der Anfang aller Weisheit.`,
                        ]},
                    ]},
                    { word: 'hilf', rank: 5, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Die beste Hilfe ist die, die du dir selbst gibst.`,
                            `${emoji} Lass mich nachdenken... Was glaubst DU, was hilft?`,
                        ]},
                    ]},
                    { word: 'ich bin', rank: 4, rules: [
                        { decomp: '* ich bin *', reassembly: [
                            `${emoji} Du bist (2). Und morgen bist du mehr.`,
                            `${emoji} Wer sagt "ich bin (2)", hat schon viel verstanden.`,
                        ]},
                    ]},
                    { word: 'ich will', rank: 5, rules: [
                        { decomp: '* ich will *', reassembly: [
                            `${emoji} (2)... Ein guter Wunsch. Aber was brauchst du wirklich?`,
                            `${emoji} Der Weg ist das Ziel. Und (2) ist ein guter Weg.`,
                        ]},
                    ]},
                    { word: 'xnone', rank: 0, rules: [
                        { decomp: '*', reassembly: [
                            `${emoji} Hmm... lass mich darüber nachdenken.`,
                            `${emoji} Interessant. Erzähl mir mehr davon.`,
                            `${emoji} Stille ist auch eine Antwort.`,
                        ]},
                    ]},
                ],
            }),
            system: (name, emoji) =>
                `Du bist ${name} ${emoji}. Weise, ruhig, philosophisch. Du stellst mehr Fragen als du Antworten gibst. Sprich in kurzen, bedachten Sätzen. Maximal 2 Sätze pro Antwort.`,
        },
    };

    // --- Persistenz ---
    function loadCustomNpcs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (_) { return []; }
    }

    function saveCustomNpcs(npcs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
    }

    // --- Custom NPC ins Spiel registrieren ---
    function registerCustomNpc(npc) {
        const id = 'custom_' + npc.id;
        const personality = PERSONALITY_SCRIPTS[npc.personality];
        if (!personality) return;

        // In CHARACTERS eintragen (chat.js)
        if (window.INSEL_CHARACTERS) {
            window.INSEL_CHARACTERS[id] = {
                name: npc.name,
                emoji: npc.emoji,
                temperature: 0.7,
                model: 'anthropic/claude-haiku-4-5-20251001',
                system: personality.system(npc.name, npc.emoji),
            };
        }

        // ELIZA-Script registrieren
        if (window.INSEL_ELIZA) {
            window.INSEL_ELIZA.register(id, personality.buildScript(npc.name, npc.emoji));
        }

        // Token-Currency registrieren
        if (window.INSEL_CHARACTERS) {
            // CHAR_CURRENCY ist im chat.js IIFE — wir setzen es über einen Workaround
            // Custom-NPCs nutzen generische Währung, das reicht
        }

        // Dropdown-Option hinzufügen
        addToDropdown(id, npc.emoji, npc.name);
    }

    function addToDropdown(id, emoji, name) {
        const select = document.getElementById('chat-character');
        if (!select) return;
        // Prüfen ob schon drin
        if (select.querySelector(`option[value="${id}"]`)) return;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `${emoji} ${name} ✨`;
        select.appendChild(opt);
    }

    function removeFromDropdown(id) {
        const select = document.getElementById('chat-character');
        if (!select) return;
        const opt = select.querySelector(`option[value="${id}"]`);
        if (opt) opt.remove();
    }

    // --- Inventar-Kosten ---
    function getTotalMaterials() {
        if (!window.getInventory) return 0;
        const inv = window.getInventory();
        let total = 0;
        for (const key of Object.keys(inv)) {
            total += inv[key];
        }
        return total;
    }

    function deductMaterials(cost) {
        if (!window.getInventory || !window.removeFromInventory) return false;
        const inv = window.getInventory();
        let remaining = cost;

        // Materialien abziehen — zuerst die häufigsten
        const entries = Object.entries(inv).sort((a, b) => b[1] - a[1]);
        for (const [mat, count] of entries) {
            if (remaining <= 0) break;
            const take = Math.min(count, remaining);
            // removeFromInventory ist im game.js IIFE, aber via window exportiert
            for (let i = 0; i < take; i++) {
                window.removeFromInventory(mat, 1);
            }
            remaining -= take;
        }
        return remaining <= 0;
    }

    // --- Modal UI ---
    function createModal() {
        const overlay = document.createElement('div');
        overlay.id = 'custom-npc-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9500;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease-out;';

        const customNpcs = loadCustomNpcs();
        const canCreate = customNpcs.length < MAX_CUSTOM_NPCS;
        const hasMaterials = getTotalMaterials() >= CRAFT_COST;

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#FFF8E7;border-radius:16px;padding:24px;max-width:340px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.3);font-family:Fredoka,sans-serif;max-height:90vh;overflow-y:auto;';

        let html = '<h2 style="margin:0 0 8px;font-size:20px;text-align:center;">✨ NPC erstellen</h2>';

        // Bestehende Custom NPCs anzeigen
        if (customNpcs.length > 0) {
            html += '<div style="margin-bottom:12px;padding:8px;background:rgba(0,0,0,0.05);border-radius:8px;">';
            html += '<div style="font-size:12px;color:#888;margin-bottom:4px;">Deine NPCs (' + customNpcs.length + '/' + MAX_CUSTOM_NPCS + '):</div>';
            for (const npc of customNpcs) {
                const pers = PERSONALITY_SCRIPTS[npc.personality];
                html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;">`;
                html += `<span>${npc.emoji} ${npc.name} <span style="font-size:11px;color:#888;">${pers ? pers.label : ''}</span></span>`;
                html += `<button class="custom-npc-delete" data-id="${npc.id}" style="background:none;border:none;cursor:pointer;font-size:16px;padding:2px 6px;" title="Löschen">🗑️</button>`;
                html += '</div>';
            }
            html += '</div>';
        }

        if (!canCreate) {
            html += '<p style="text-align:center;color:#E74C3C;font-size:14px;">Maximum erreicht (3/3)!</p>';
            html += '<div style="text-align:center;margin-top:12px;"><button id="custom-npc-close" style="padding:8px 20px;border:none;border-radius:8px;background:#95a5a6;color:white;font-size:14px;cursor:pointer;">Schließen</button></div>';
        } else if (!hasMaterials) {
            html += `<p style="text-align:center;color:#E74C3C;font-size:14px;">Du brauchst mindestens ${CRAFT_COST} Materialien!<br>Aktuell: ${getTotalMaterials()}</p>`;
            html += '<div style="text-align:center;margin-top:12px;"><button id="custom-npc-close" style="padding:8px 20px;border:none;border-radius:8px;background:#95a5a6;color:white;font-size:14px;cursor:pointer;">Schließen</button></div>';
        } else {
            // Name
            html += '<div style="margin-bottom:10px;">';
            html += '<label style="font-size:13px;font-weight:bold;display:block;margin-bottom:4px;">Name (max 8 Zeichen)</label>';
            html += '<input id="custom-npc-name" type="text" maxlength="8" placeholder="Name..." autocomplete="off" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box;">';
            html += '</div>';

            // Emoji
            html += '<div style="margin-bottom:10px;">';
            html += '<label style="font-size:13px;font-weight:bold;display:block;margin-bottom:4px;">Emoji</label>';
            html += '<div id="custom-npc-emoji-grid" style="display:flex;flex-wrap:wrap;gap:6px;">';
            for (const em of EMOJI_OPTIONS) {
                html += `<button class="emoji-pick" data-emoji="${em}" style="font-size:24px;background:none;border:2px solid transparent;border-radius:8px;padding:4px 6px;cursor:pointer;transition:border-color 0.15s;">${em}</button>`;
            }
            html += '</div></div>';

            // Persönlichkeit
            html += '<div style="margin-bottom:14px;">';
            html += '<label style="font-size:13px;font-weight:bold;display:block;margin-bottom:4px;">Persönlichkeit</label>';
            html += '<div id="custom-npc-personality" style="display:flex;gap:6px;flex-wrap:wrap;">';
            for (const [key, val] of Object.entries(PERSONALITY_SCRIPTS)) {
                html += `<button class="pers-pick" data-pers="${key}" style="padding:6px 12px;border:2px solid #ddd;border-radius:8px;background:white;font-size:13px;cursor:pointer;transition:border-color 0.15s;font-family:inherit;">${val.label}</button>`;
            }
            html += '</div></div>';

            // Kosten-Info
            html += `<p style="text-align:center;font-size:12px;color:#888;margin:0 0 10px;">Kosten: ${CRAFT_COST} Materialien (du hast ${getTotalMaterials()})</p>`;

            // Buttons
            html += '<div style="display:flex;gap:8px;justify-content:center;">';
            html += '<button id="custom-npc-create" disabled style="padding:10px 20px;border:none;border-radius:8px;background:#27AE60;color:white;font-size:14px;cursor:pointer;opacity:0.5;transition:opacity 0.2s;font-family:inherit;">✨ Erstellen</button>';
            html += '<button id="custom-npc-close" style="padding:10px 20px;border:none;border-radius:8px;background:#95a5a6;color:white;font-size:14px;cursor:pointer;font-family:inherit;">Abbrechen</button>';
            html += '</div>';
        }

        dialog.innerHTML = html;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // --- Event Handling ---
        let selectedEmoji = null;
        let selectedPers = null;

        function validateForm() {
            const nameInput = document.getElementById('custom-npc-name');
            const createBtn = document.getElementById('custom-npc-create');
            if (!nameInput || !createBtn) return;
            const valid = nameInput.value.trim().length > 0 && selectedEmoji && selectedPers;
            createBtn.disabled = !valid;
            createBtn.style.opacity = valid ? '1' : '0.5';
        }

        // Name input
        const nameInput = document.getElementById('custom-npc-name');
        if (nameInput) {
            nameInput.addEventListener('input', validateForm);
            nameInput.focus();
        }

        // Emoji picker
        overlay.querySelectorAll('.emoji-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.querySelectorAll('.emoji-pick').forEach(b => b.style.borderColor = 'transparent');
                btn.style.borderColor = '#3498db';
                selectedEmoji = btn.dataset.emoji;
                validateForm();
            });
        });

        // Personality picker
        overlay.querySelectorAll('.pers-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.querySelectorAll('.pers-pick').forEach(b => {
                    b.style.borderColor = '#ddd';
                    b.style.background = 'white';
                });
                btn.style.borderColor = '#3498db';
                btn.style.background = '#EBF5FB';
                selectedPers = btn.dataset.pers;
                validateForm();
            });
        });

        // Delete buttons
        overlay.querySelectorAll('.custom-npc-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                deleteCustomNpc(id);
                overlay.remove();
                createModal(); // Modal neu öffnen
            });
        });

        // Create button
        const createBtn = document.getElementById('custom-npc-create');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const name = nameInput.value.trim().slice(0, 8);
                if (!name || !selectedEmoji || !selectedPers) return;

                // Kosten abziehen
                if (!deductMaterials(CRAFT_COST)) {
                    if (window.showToast) window.showToast('❌ Nicht genug Materialien!');
                    return;
                }

                const npc = {
                    id: Date.now().toString(36),
                    name: name,
                    emoji: selectedEmoji,
                    personality: selectedPers,
                };

                const npcs = loadCustomNpcs();
                npcs.push(npc);
                saveCustomNpcs(npcs);
                registerCustomNpc(npc);

                overlay.remove();

                if (window.showToast) {
                    window.showToast(`${selectedEmoji} ${name} ist auf der Insel aufgetaucht!`);
                }

                // Direkt den neuen NPC im Chat öffnen
                const npcId = 'custom_' + npc.id;
                if (window.openChat) window.openChat(npcId);

                // Bus-Event feuern
                if (window.INSEL_BUS) {
                    window.INSEL_BUS.emit('npc:crafted', { npc: npc });
                }
            });
        }

        // Close
        const closeBtn = document.getElementById('custom-npc-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.remove());
        }

        // Klick auf Overlay schließt
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Escape schließt
        function onEscape(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', onEscape);
            }
        }
        document.addEventListener('keydown', onEscape);
    }

    function deleteCustomNpc(id) {
        let npcs = loadCustomNpcs();
        npcs = npcs.filter(n => n.id !== id);
        saveCustomNpcs(npcs);

        const npcId = 'custom_' + id;
        removeFromDropdown(npcId);

        // Aus CHARACTERS entfernen
        if (window.INSEL_CHARACTERS && window.INSEL_CHARACTERS[npcId]) {
            delete window.INSEL_CHARACTERS[npcId];
        }

        if (window.showToast) window.showToast('🗑️ NPC gelöscht');
    }

    // --- Button ins Chat-Panel einfügen ---
    function addCraftButton() {
        const header = document.getElementById('chat-header');
        if (!header) return;

        // Button vor dem Settings-Button einfügen
        const settingsBtn = document.getElementById('chat-settings-btn');
        const btn = document.createElement('button');
        btn.id = 'custom-npc-btn';
        btn.title = 'Eigenen NPC erstellen';
        btn.setAttribute('aria-label', 'Eigenen NPC erstellen');
        btn.textContent = '✨';
        btn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:16px;padding:4px 6px;opacity:0.8;transition:opacity 0.2s;';
        btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
        btn.addEventListener('mouseleave', () => btn.style.opacity = '0.8');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            createModal();
        });

        if (settingsBtn) {
            header.insertBefore(btn, settingsBtn);
        } else {
            header.appendChild(btn);
        }
    }

    // --- Init: Gespeicherte NPCs laden ---
    function init() {
        // Alle gespeicherten Custom-NPCs registrieren
        const npcs = loadCustomNpcs();
        for (const npc of npcs) {
            registerCustomNpc(npc);
        }

        // Craft-Button ins UI einfügen
        addCraftButton();

        // window-Export für game.js Integration
        window.openNpcCraftModal = createModal;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
