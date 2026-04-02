// === MULTIPLAYER — Phase 1: Insel-Sharing via Room-ID + Polling ===
// Room erstellen, beitreten, Grid-Sync alle 2s via Worker.
(function () {
    'use strict';

    var PROXY = (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy) || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
    var POLL_INTERVAL = 2000; // 2s
    var PLAYER_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#E91E63'];

    var roomId = null;
    var isHost = false;
    var pollTimer = null;
    var playerId = generatePlayerId();
    var playerColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
    var playerName = localStorage.getItem('insel-player-name') || 'Anonym';
    var remotePlayers = {}; // { playerId: { name, color, cursor: {r, c}, lastSeen } }
    var lastGridHash = '';

    function generatePlayerId() {
        return 'p-' + Math.random().toString(36).slice(2, 8);
    }

    function generateRoomId() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 confusion
        var id = '';
        for (var i = 0; i < 6; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    // --- Grid Serialization (sparse, nur belegte Zellen) ---

    function serializeGrid() {
        if (!window.INSEL_DIMS) return null;
        var grid = window.grid;
        if (!grid) return null;
        var cells = [];
        for (var r = 0; r < grid.length; r++) {
            for (var c = 0; c < grid[r].length; c++) {
                if (grid[r][c]) {
                    cells.push([r, c, grid[r][c]]);
                }
            }
        }
        return {
            rows: window.INSEL_DIMS.ROWS,
            cols: window.INSEL_DIMS.COLS,
            cells: cells
        };
    }

    function applyGrid(gridData) {
        if (!gridData || !gridData.cells || !window.grid) return;
        var grid = window.grid;
        // Grid leeren
        for (var r = 0; r < grid.length; r++) {
            for (var c = 0; c < grid[r].length; c++) {
                grid[r][c] = null;
            }
        }
        // Zellen setzen
        for (var i = 0; i < gridData.cells.length; i++) {
            var cell = gridData.cells[i];
            var row = cell[0], col = cell[1], mat = cell[2];
            if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
                grid[row][col] = mat;
            }
        }
        if (window.requestRedraw) window.requestRedraw();
    }

    function gridHash() {
        var grid = window.grid;
        if (!grid) return '';
        var parts = [];
        for (var r = 0; r < grid.length; r++) {
            for (var c = 0; c < grid[r].length; c++) {
                if (grid[r][c]) parts.push(r + ',' + c + ',' + grid[r][c]);
            }
        }
        return parts.join('|');
    }

    // --- API Calls ---

    function apiPost(path, body) {
        return fetch(PROXY + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(function (r) { return r.json(); });
    }

    function apiGet(path) {
        return fetch(PROXY + path).then(function (r) { return r.json(); });
    }

    // --- Room erstellen (Host) ---

    function createRoom() {
        var id = generateRoomId();
        var gridData = serializeGrid();
        if (!gridData) {
            if (window.showToast) window.showToast('Grid nicht bereit');
            return;
        }

        apiPost('/room/create', {
            roomId: id,
            grid: gridData,
            host: { id: playerId, name: playerName, color: playerColor }
        }).then(function (res) {
            if (res.error) {
                if (window.showToast) window.showToast('Fehler: ' + res.error);
                return;
            }
            roomId = id;
            isHost = true;
            lastGridHash = gridHash();

            // URL updaten
            var url = new URL(window.location.href);
            url.searchParams.set('room', id);
            window.history.replaceState({}, '', url.toString());

            startPolling();
            showRoomUI();

            if (window.showToast) window.showToast('Room ' + id + ' erstellt! Teile den Link.');
        }).catch(function (err) {
            if (window.showToast) window.showToast('Netzwerkfehler');
        });
    }

    // --- Room beitreten (Gast) ---

    function joinRoom(id) {
        apiGet('/room/' + id).then(function (res) {
            if (res.error) {
                if (window.showToast) window.showToast('Room nicht gefunden oder abgelaufen');
                return;
            }
            roomId = id;
            isHost = false;

            // Grid vom Host laden
            if (res.grid) {
                applyGrid(res.grid);
            }
            lastGridHash = gridHash();

            startPolling();
            showRoomUI();

            if (window.showToast) window.showToast('Room ' + id + ' beigetreten!');
        }).catch(function (err) {
            if (window.showToast) window.showToast('Netzwerkfehler');
        });
    }

    // --- Polling ---

    function startPolling() {
        stopPolling();
        pollTimer = setInterval(pollRoom, POLL_INTERVAL);
    }

    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function pollRoom() {
        if (!roomId) return;

        var currentHash = gridHash();
        var gridChanged = currentHash !== lastGridHash;

        if (gridChanged) {
            // Lokale Aenderungen hochladen
            lastGridHash = currentHash;
            apiPost('/room/' + roomId + '/update', {
                playerId: playerId,
                playerName: playerName,
                playerColor: playerColor,
                grid: serializeGrid(),
                cursor: getCursorPos()
            }).catch(function () {});
        } else {
            // Nur Cursor-Update + Remote-State abholen
            apiPost('/room/' + roomId + '/update', {
                playerId: playerId,
                playerName: playerName,
                playerColor: playerColor,
                cursor: getCursorPos()
            }).then(function (res) {
                if (!res || res.error) return;
                // Remote Grid anwenden (wenn jemand anders gebaut hat)
                if (res.grid) {
                    applyGrid(res.grid);
                    lastGridHash = gridHash();
                }
                // Remote Spieler updaten
                if (res.players) {
                    remotePlayers = {};
                    for (var pid in res.players) {
                        if (pid !== playerId) {
                            remotePlayers[pid] = res.players[pid];
                        }
                    }
                    drawRemoteCursors();
                }
            }).catch(function () {});
        }
    }

    function getCursorPos() {
        // Spielerposition aus game.js (global via window)
        if (window.INSEL_PLAYER_POS) {
            return window.INSEL_PLAYER_POS;
        }
        return null;
    }

    // --- Remote Cursor Rendering ---

    function drawRemoteCursors() {
        // Overlay-Canvas fuer Remote-Spieler
        var overlay = document.getElementById('mp-cursor-overlay');
        if (!overlay) {
            overlay = document.createElement('canvas');
            overlay.id = 'mp-cursor-overlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:50;';
            var container = document.getElementById('game-canvas');
            if (container && container.parentNode) {
                container.parentNode.style.position = 'relative';
                container.parentNode.appendChild(overlay);
            }
        }

        var gameCanvas = document.getElementById('game-canvas');
        if (!gameCanvas || !window.INSEL_DIMS) return;

        overlay.width = gameCanvas.width;
        overlay.height = gameCanvas.height;
        var ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        var cellW = gameCanvas.width / (window.INSEL_DIMS.COLS + 4); // +4 for water border
        var cellH = gameCanvas.height / (window.INSEL_DIMS.ROWS + 4);

        for (var pid in remotePlayers) {
            var p = remotePlayers[pid];
            if (!p.cursor) continue;

            var x = (p.cursor.c + 2) * cellW; // +2 for water border offset
            var y = (p.cursor.r + 2) * cellH;

            // Farbiger Kreis
            ctx.beginPath();
            ctx.arc(x + cellW / 2, y + cellH / 2, Math.max(cellW, cellH) * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = p.color || '#E74C3C';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Name-Label
            ctx.font = 'bold 11px Fredoka, sans-serif';
            ctx.fillStyle = p.color || '#E74C3C';
            ctx.textAlign = 'center';
            ctx.fillText(p.name || 'Gast', x + cellW / 2, y - 4);
        }
    }

    // --- UI ---

    function showRoomUI() {
        var existing = document.getElementById('mp-room-info');
        if (existing) existing.remove();

        var div = document.createElement('div');
        div.id = 'mp-room-info';
        div.style.cssText = 'position:fixed;top:8px;right:8px;background:rgba(44,62,80,0.92);color:white;padding:8px 14px;border-radius:12px;font-family:Fredoka,sans-serif;font-size:14px;z-index:200;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.3);';

        var badge = document.createElement('span');
        badge.textContent = '👥 Room: ' + roomId;
        badge.style.fontWeight = '600';

        var copyBtn = document.createElement('button');
        copyBtn.textContent = '📋';
        copyBtn.title = 'Link kopieren';
        copyBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:16px;padding:2px;';
        copyBtn.addEventListener('click', function () {
            var url = new URL(window.location.href);
            url.searchParams.set('room', roomId);
            navigator.clipboard.writeText(url.toString()).then(function () {
                if (window.showToast) window.showToast('Link kopiert!');
            });
        });

        var leaveBtn = document.createElement('button');
        leaveBtn.textContent = '✕';
        leaveBtn.title = 'Room verlassen';
        leaveBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:16px;color:#E74C3C;padding:2px;';
        leaveBtn.addEventListener('click', leaveRoom);

        div.appendChild(badge);
        div.appendChild(copyBtn);
        div.appendChild(leaveBtn);
        document.body.appendChild(div);
    }

    function hideRoomUI() {
        var el = document.getElementById('mp-room-info');
        if (el) el.remove();
        var overlay = document.getElementById('mp-cursor-overlay');
        if (overlay) overlay.remove();
    }

    function leaveRoom() {
        stopPolling();
        roomId = null;
        isHost = false;
        remotePlayers = {};
        hideRoomUI();

        // URL-Parameter entfernen
        var url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());

        if (window.showToast) window.showToast('Room verlassen');
    }

    // --- Multiplayer Button Dialog ---

    function showMultiplayerDialog() {
        if (roomId) {
            // Bereits in einem Room → kopiere Link
            var url = new URL(window.location.href);
            url.searchParams.set('room', roomId);
            navigator.clipboard.writeText(url.toString()).then(function () {
                if (window.showToast) window.showToast('Link kopiert!');
            });
            return;
        }

        // Simple Dialog: Room erstellen oder beitreten
        var existing = document.getElementById('mp-dialog');
        if (existing) existing.remove();

        var dialog = document.createElement('div');
        dialog.id = 'mp-dialog';
        dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9000;display:flex;align-items:center;justify-content:center;';

        var box = document.createElement('div');
        box.style.cssText = 'background:#2C3E50;border-radius:16px;padding:24px;color:white;font-family:Fredoka,sans-serif;text-align:center;min-width:280px;box-shadow:0 4px 24px rgba(0,0,0,0.5);';

        box.innerHTML = '<h3 style="margin:0 0 16px;font-size:20px;">👥 Multiplayer</h3>'
            + '<button id="mp-create-btn" style="display:block;width:100%;padding:12px;border:none;border-radius:10px;background:#27AE60;color:white;font-size:16px;font-family:inherit;cursor:pointer;margin-bottom:10px;">🏝️ Insel teilen</button>'
            + '<div style="display:flex;gap:6px;margin-bottom:10px;">'
            + '<input id="mp-join-input" type="text" maxlength="6" placeholder="Room-Code" style="flex:1;padding:10px;border:2px solid rgba(255,255,255,0.3);border-radius:10px;background:rgba(255,255,255,0.1);color:white;font-size:16px;font-family:inherit;text-align:center;text-transform:uppercase;" autocomplete="off">'
            + '<button id="mp-join-btn" style="padding:10px 16px;border:none;border-radius:10px;background:#3498DB;color:white;font-size:16px;font-family:inherit;cursor:pointer;">Beitreten</button>'
            + '</div>'
            + '<button id="mp-close-btn" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:14px;font-family:inherit;padding:4px;">Abbrechen</button>';

        dialog.appendChild(box);
        document.body.appendChild(dialog);

        // Event Listener
        document.getElementById('mp-create-btn').addEventListener('click', function () {
            dialog.remove();
            createRoom();
        });

        document.getElementById('mp-join-btn').addEventListener('click', function () {
            var code = document.getElementById('mp-join-input').value.trim().toUpperCase();
            if (code.length !== 6) {
                if (window.showToast) window.showToast('Room-Code muss 6 Zeichen haben');
                return;
            }
            dialog.remove();
            joinRoom(code);
        });

        document.getElementById('mp-join-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                document.getElementById('mp-join-btn').click();
            }
        });

        document.getElementById('mp-close-btn').addEventListener('click', function () {
            dialog.remove();
        });

        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.remove();
        });
    }

    // --- Init ---

    function init() {
        // Toolbar-Button einfügen
        var projectGroup = document.getElementById('project-group');
        if (projectGroup) {
            var btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.id = 'mp-btn';
            btn.title = 'Multiplayer — gemeinsam bauen';
            btn.textContent = '👥';
            btn.addEventListener('click', showMultiplayerDialog);
            // Nach share-btn einfügen
            var shareBtn = document.getElementById('share-btn');
            if (shareBtn && shareBtn.nextSibling) {
                projectGroup.insertBefore(btn, shareBtn.nextSibling);
            } else {
                projectGroup.appendChild(btn);
            }
        }

        // Auto-Join wenn ?room= in URL
        var params = new URLSearchParams(window.location.search);
        var roomParam = params.get('room');
        if (roomParam && roomParam.length === 6) {
            // Kurz warten bis Grid initialisiert ist
            setTimeout(function () {
                joinRoom(roomParam.toUpperCase());
            }, 1500);
        }
    }

    // DOM-Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exports
    window.INSEL_MULTIPLAYER = {
        createRoom: createRoom,
        joinRoom: joinRoom,
        leaveRoom: leaveRoom,
        isInRoom: function () { return !!roomId; },
        getRoomId: function () { return roomId; },
        showDialog: showMultiplayerDialog,
    };

})();
