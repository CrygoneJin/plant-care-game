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
        wood:   { emoji: '🪵', label: 'Holz',    color: '#8B5E3C', border: '#6B3F1F' },
        stone:  { emoji: '🧱', label: 'Stein',   color: '#95A5A6', border: '#7F8C8D' },
        glass:  { emoji: '🪟', label: 'Glas',    color: '#AED6F1', border: '#85C1E9' },
        plant:  { emoji: '🌿', label: 'Pflanze', color: '#52BE80', border: '#27AE60' },
        tree:   { emoji: '🌳', label: 'Baum',    color: '#1E8449', border: '#196F3D' },
        flower: { emoji: '🌸', label: 'Blume',   color: '#F1948A', border: '#E74C3C' },
        door:   { emoji: '🚪', label: 'Tür',     color: '#6E3B1A', border: '#4A2510' },
        roof:   { emoji: '🏠', label: 'Dach',    color: '#E74C3C', border: '#C0392B' },
        lamp:   { emoji: '💡', label: 'Lampe',   color: '#F9E79F', border: '#F1C40F' },
        sand:   { emoji: '⬜', label: 'Sand',    color: '#F5DEB3', border: '#DCC89E' },
        water:  { emoji: '🌊', label: 'Wasser',  color: '#3498DB', border: '#2980B9' },
        path:   { emoji: '🟫', label: 'Weg',     color: '#A0522D', border: '#8B4513' },
    };

    // --- Zustand ---
    let grid = [];
    let currentMaterial = 'wood';
    let currentTool = 'build';
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
            } else if (currentTool === 'demolish') {
                ctx.strokeStyle = '#E74C3C';
                ctx.lineWidth = 3;
                ctx.strokeRect(hx + 2, hy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                // X markierung
                ctx.beginPath();
                ctx.moveTo(hx + 8, hy + 8);
                ctx.lineTo(hx + CELL_SIZE - 8, hy + CELL_SIZE - 8);
                ctx.moveTo(hx + CELL_SIZE - 8, hy + 8);
                ctx.lineTo(hx + 8, hy + CELL_SIZE - 8);
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();
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

    // --- Aktion auf Zelle ---
    function applyTool(r, c) {
        if (currentTool === 'build') {
            if (grid[r][c] !== currentMaterial) {
                grid[r][c] = currentMaterial;
                addPlaceAnimation(r, c);
            }
        } else if (currentTool === 'demolish') {
            if (grid[r][c] !== null) {
                grid[r][c] = null;
                addPlaceAnimation(r, c);
            }
        } else if (currentTool === 'fill') {
            floodFill(r, c, grid[r][c], currentMaterial);
        }
        updateStats();
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
        };

        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        showToast(`💾 "${name}" gespeichert!`);
    }

    // --- Laden-Dialog ---
    function showLoadDialog() {
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        const names = Object.keys(projects);

        if (names.length === 0) {
            savedProjectsList.innerHTML = '<p class="no-projects">Keine Projekte gespeichert!</p>';
        } else {
            savedProjectsList.innerHTML = names.map(name => {
                const proj = projects[name];
                return `
                    <div class="saved-project-item" data-name="${escapeHtml(name)}">
                        <div>
                            <div class="saved-project-name">${escapeHtml(name)}</div>
                            <div class="saved-project-date">${proj.date}</div>
                        </div>
                        <button class="saved-project-delete" data-delete="${escapeHtml(name)}" title="Löschen">🗑️</button>
                    </div>
                `;
            }).join('');
        }

        loadDialog.classList.remove('hidden');
    }

    function loadProject(name) {
        const projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        if (projects[name]) {
            grid = projects[name].grid;
            window.grid = grid; // Chat-Integration aktuell halten
            projectNameInput.value = name;
            updateStats();
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
        projectNameInput.value = '';
        updateStats();
        showToast('🆕 Neue Insel!');
    }

    // --- Toast ---
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }

    // --- Hilfsfunktionen ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === EVENT LISTENERS ===

    // Intro
    startButton.addEventListener('click', () => {
        introOverlay.classList.add('hiding');
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 600);
    });

    // Werkzeug-Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    // Material-Buttons
    document.querySelectorAll('.material-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMaterial = btn.dataset.material;
            // Automatisch auf "Bauen" wechseln
            currentTool = 'build';
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-tool="build"]').classList.add('active');
        });
    });

    // Canvas Maus-Events
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
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

    // Lade-Dialog Events
    document.getElementById('close-load-dialog').addEventListener('click', () => {
        loadDialog.classList.add('hidden');
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
            case '1': selectMaterial('wood'); break;
            case '2': selectMaterial('stone'); break;
            case '3': selectMaterial('glass'); break;
            case '4': selectMaterial('plant'); break;
            case '5': selectMaterial('tree'); break;
            case '6': selectMaterial('flower'); break;
            case '7': selectMaterial('door'); break;
            case '8': selectMaterial('roof'); break;
            case '9': selectMaterial('lamp'); break;
            case 'b': selectTool('build'); break;
            case 'd': selectTool('demolish'); break;
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

    // === START ===
    initGrid();
    draw();

    // Grid für Chat-Integration exportieren
    window.grid = grid;

})();
