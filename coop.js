// === KOOP-MODUS — Zwei Spieler, eine Insel ===
// Phase 1: Selbes Gerät (Couch-Koop)
// Phase 2: Zwei Geräte (WebRTC P2P)
//
// D&D-Regel: Zusammen ist besser als allein.

(function () {
    'use strict';

    // --- Koop-State ---
    let coopActive = false;
    let player2 = {
        name: '',
        pos: { r: 8, c: 6 }, // Links von der Mitte
        emoji: '👨',          // Papa-Emoji (oder frei wählbar)
        material: 'wood',
        tool: 'build',
        color: '#e74c3c',     // Rot für P2
    };

    // Player 1 Farbe
    const P1_COLOR = '#3498db'; // Blau

    // --- WebRTC State (Phase 2) ---
    let peerConnection = null;
    let dataChannel = null;
    let isHost = false;
    let netMode = 'local'; // 'local' | 'host' | 'guest'

    // --- Koop starten (selbes Gerät) ---
    function startLocalCoop(name2) {
        player2.name = name2 || 'Papa';
        player2.pos = { r: 8, c: 6 };
        coopActive = true;
        netMode = 'local';

        if (window.showToast) {
            window.showToast(`🎮 Koop-Modus! ${player2.name} ist auf der Insel!`);
        }

        if (window.requestRedraw) window.requestRedraw();
    }

    function stopCoop() {
        coopActive = false;
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
            dataChannel = null;
        }
        netMode = 'local';
        if (window.showToast) {
            window.showToast('🎮 Koop beendet');
        }
        if (window.requestRedraw) window.requestRedraw();
    }

    // --- Spieler 2 zeichnen ---
    function drawPlayer2(ctx, cellSize, waterBorder) {
        if (!coopActive || !player2.name) return;

        const px = (player2.pos.c + waterBorder) * cellSize + cellSize / 2;
        const py = (player2.pos.r + waterBorder) * cellSize + cellSize / 2;

        ctx.save();

        // Leichter Glow für P2 (damit man sie unterscheiden kann)
        ctx.shadowColor = player2.color;
        ctx.shadowBlur = 8;

        // Figur-Emoji
        ctx.font = `${cellSize * 0.7}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player2.emoji, px, py);
        ctx.shadowBlur = 0;

        // Name-Label
        const fontSize = Math.max(9, cellSize * 0.27);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(player2.name, px, py - cellSize * 0.35);
        ctx.fillStyle = player2.color;
        ctx.fillText(player2.name, px, py - cellSize * 0.35);
        ctx.restore();
    }

    // --- Spieler 2 Bewegung (WASD) ---
    function movePlayer2(dr, dc) {
        if (!coopActive) return;
        const rows = window.grid?.length || 17;
        const cols = window.grid?.[0]?.length || 25;
        const nr = player2.pos.r + dr;
        const nc = player2.pos.c + dc;
        if (nr >= 2 && nr < rows - 2 && nc >= 2 && nc < cols - 2) {
            player2.pos = { r: nr, c: nc };
            if (netMode !== 'local' && dataChannel?.readyState === 'open') {
                dataChannel.send(JSON.stringify({ type: 'move', pos: player2.pos }));
            }
            if (window.requestRedraw) window.requestRedraw();
        }
    }

    // --- Spieler 2 baut (Space) ---
    function player2Build() {
        if (!coopActive) return;
        const grid = window.grid;
        if (!grid) return;

        const { r, c } = player2.pos;
        if (player2.tool === 'build' && player2.material) {
            // Bauen wie Spieler 1 — nutzt die globale applyTool Funktion
            if (window.applyToolAt) {
                window.applyToolAt(r, c, player2.tool, player2.material);
            }
        } else if (player2.tool === 'harvest') {
            if (window.applyToolAt) {
                window.applyToolAt(r, c, 'harvest');
            }
        }
        if (netMode !== 'local' && dataChannel?.readyState === 'open') {
            dataChannel.send(JSON.stringify({
                type: 'build',
                r, c,
                tool: player2.tool,
                material: player2.material,
            }));
        }
    }

    // --- Tastatur-Handler (WASD + Space für P2) ---
    function handleCoopKey(e) {
        if (!coopActive) return false;

        // Nicht abfangen wenn ein Input-Feld fokussiert ist
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false;

        switch (e.key) {
            case 'w': case 'W': e.preventDefault(); movePlayer2(-1, 0); return true;
            case 's': case 'S':
                // S ist nicht 'save' im Koop-Modus — sondern Spieler 2 runter
                e.preventDefault(); movePlayer2(1, 0); return true;
            case 'a': case 'A': e.preventDefault(); movePlayer2(0, -1); return true;
            case 'd': case 'D': e.preventDefault(); movePlayer2(0, 1); return true;
            case ' ':
                // Space = P2 baut (nur wenn Koop aktiv und kein Dialog offen)
                if (!document.querySelector('.dialog-overlay:not(.hidden)')) {
                    e.preventDefault();
                    player2Build();
                    return true;
                }
                return false;
            case 'q': case 'Q':
                // Q = P2 wechselt Werkzeug (build → harvest → build)
                player2.tool = player2.tool === 'build' ? 'harvest' : 'build';
                if (window.showToast) {
                    window.showToast(`${player2.emoji} ${player2.name}: ${player2.tool === 'build' ? '🖌️ Bauen' : '⛏️ Aufnehmen'}`);
                }
                return true;
        }
        return false;
    }

    // --- Material-Wechsel für P2 (Zifferntasten Shift+1-5) ---
    function handleCoopMaterialKey(e) {
        if (!coopActive || !e.shiftKey) return false;
        const materialMap = {
            '!': 'metal', '@': 'wood', '#': 'fire', '$': 'water', '%': 'earth',
        };
        // Shift+1-5 erzeugt verschiedene Zeichen je nach Tastaturlayout
        // Alternativ: Numpad
        const numMap = { '1': 'metal', '2': 'wood', '3': 'fire', '4': 'water', '5': 'earth' };
        const mat = materialMap[e.key] || (e.shiftKey && numMap[e.key]);
        if (mat) {
            player2.material = mat;
            if (window.showToast) {
                const info = window.MATERIALS?.[mat];
                window.showToast(`${player2.emoji} ${player2.name}: ${info?.emoji || ''} ${info?.label || mat}`);
            }
            return true;
        }
        return false;
    }

    // ============================================
    // === PHASE 2: WebRTC P2P (Zwei Geräte) ===
    // ============================================

    const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

    // Host erstellt Angebot → zeigt Code an
    async function hostGame() {
        isHost = true;
        netMode = 'host';
        coopActive = true;

        peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        dataChannel = peerConnection.createDataChannel('coop');
        setupDataChannel(dataChannel);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Warte auf ICE Candidates
        return new Promise((resolve) => {
            peerConnection.onicecandidate = (e) => {
                if (!e.candidate) {
                    // Alle Candidates gesammelt → Offer als String
                    const offerStr = btoa(JSON.stringify(peerConnection.localDescription));
                    resolve(offerStr);
                }
            };
        });
    }

    // Host empfängt Antwort vom Gast
    async function hostAcceptAnswer(answerStr) {
        const answer = JSON.parse(atob(answerStr));
        await peerConnection.setRemoteDescription(answer);
    }

    // Gast verbindet sich mit Host-Angebot
    async function joinGame(offerStr) {
        isHost = false;
        netMode = 'guest';
        coopActive = true;

        peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        peerConnection.ondatachannel = (e) => {
            dataChannel = e.channel;
            setupDataChannel(dataChannel);
        };

        const offer = JSON.parse(atob(offerStr));
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Warte auf ICE Candidates
        return new Promise((resolve) => {
            peerConnection.onicecandidate = (e) => {
                if (!e.candidate) {
                    const answerStr = btoa(JSON.stringify(peerConnection.localDescription));
                    resolve(answerStr);
                }
            };
        });
    }

    function setupDataChannel(ch) {
        ch.onopen = () => {
            if (window.showToast) window.showToast('🌐 Verbunden! Zusammen bauen!');
            // Host sendet Grid-State an Gast
            if (isHost && window.grid) {
                ch.send(JSON.stringify({ type: 'sync', grid: window.grid }));
            }
        };
        ch.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            handleNetMessage(msg);
        };
        ch.onclose = () => {
            if (window.showToast) window.showToast('🌐 Verbindung getrennt');
            coopActive = false;
            netMode = 'local';
        };
    }

    function handleNetMessage(msg) {
        switch (msg.type) {
            case 'move':
                player2.pos = msg.pos;
                if (window.requestRedraw) window.requestRedraw();
                break;
            case 'build':
                if (window.applyToolAt) {
                    window.applyToolAt(msg.r, msg.c, msg.tool, msg.material);
                }
                break;
            case 'sync':
                // Grid-State vom Host übernehmen
                if (msg.grid && window.grid) {
                    for (let r = 0; r < msg.grid.length; r++) {
                        for (let c = 0; c < msg.grid[r].length; c++) {
                            window.grid[r][c] = msg.grid[r][c];
                        }
                    }
                    if (window.requestRedraw) window.requestRedraw();
                }
                break;
        }
    }

    // --- Public API ---
    window.Coop = {
        // Phase 1: Lokaler Koop
        start: startLocalCoop,
        stop: stopCoop,
        get active() { return coopActive; },
        get player2() { return { ...player2 }; },
        draw: drawPlayer2,
        handleKey: handleCoopKey,
        handleMaterialKey: handleCoopMaterialKey,

        // Spieler 2 Material von außen setzen
        setP2Material: function (mat) { player2.material = mat; },
        setP2Emoji: function (emoji) { player2.emoji = emoji; },

        // Phase 2: Netzwerk-Koop
        host: hostGame,
        acceptAnswer: hostAcceptAnswer,
        join: joinGame,
        get mode() { return netMode; },
        get connected() { return dataChannel?.readyState === 'open'; },

        // Save/Load Support
        getState: function () {
            return coopActive ? { name: player2.name, pos: player2.pos, emoji: player2.emoji } : null;
        },
        restoreState: function (state) {
            if (state) {
                player2.name = state.name;
                player2.pos = state.pos;
                player2.emoji = state.emoji || '👨';
                coopActive = true;
            }
        },
    };

})();
