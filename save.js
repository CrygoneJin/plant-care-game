// === SAVE -- Projekt-Persistenz & URL-Sharing ===
// Zweite Zellteilung: aus game.js extrahiert.
// Context-Pattern: game.js registriert alle State-Accessors via registerContext().
(function () {
    'use strict';

    var _ctx = null;

    function registerContext(ctx) {
        _ctx = ctx;
    }

    var AUTOSAVE_KEY = '~autosave~';
    var lastSaveHash = '';

    function isValidGrid(g) {
        if (!_ctx) return Array.isArray(g) && g.length > 0;
        return Array.isArray(g) && g.length === _ctx.ROWS && g[0] && g[0].length === _ctx.COLS;
    }

    // Erzeugt Projekt-Listenelement via DOM (kein innerHTML mit Nutzerdaten)
    function createProjectItem(name, proj) {
        var item = document.createElement('div');
        item.className = 'saved-project-item';
        item.dataset.name = name;

        var info = document.createElement('div');
        var nameEl = document.createElement('div');
        nameEl.className = 'saved-project-name';
        nameEl.textContent = name === AUTOSAVE_KEY ? '\uD83D\uDD04 Letzte Session (Auto)' : name;
        var dateEl = document.createElement('div');
        dateEl.className = 'saved-project-date';
        dateEl.textContent = proj.date || '';
        info.appendChild(nameEl);
        info.appendChild(dateEl);

        var delBtn = document.createElement('button');
        delBtn.className = 'saved-project-delete';
        delBtn.dataset.delete = name;
        delBtn.title = 'L\u00F6schen';
        delBtn.textContent = '\uD83D\uDDD1\uFE0F';

        item.appendChild(info);
        item.appendChild(delBtn);
        return item;
    }

    // --- Manuell Speichern ---
    function saveProject() {
        if (!_ctx) return;
        var name = _ctx.getProjectName() || 'Mein Bauwerk';
        var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        projects[name] = {
            grid: _ctx.getGrid(),
            date: new Date().toLocaleDateString('de-DE'),
            treeGrowth: _ctx.getTreeGrowth(),
            inventory: _ctx.getInventory(),
            unlocked: Array.from(_ctx.getUnlockedMaterials()),
            discovered: Array.from(_ctx.getDiscoveredRecipes()),
        };
        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        _ctx.saveInventory();
        _ctx.saveUnlocked();
        if (window.showToast) window.showToast('\uD83D\uDCBE "' + name + '" gespeichert!');
    }

    // --- Auto-Save ---
    function autoSave() {
        if (!_ctx) return;
        var grid = _ctx.getGrid();
        if (!grid || !grid.length) return;
        var hasContent = grid.some(function (row) { return row.some(function (cell) { return cell !== null; }); });
        if (!hasContent) return;
        var hash = JSON.stringify(grid);
        if (hash === lastSaveHash) return;
        lastSaveHash = hash;
        var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        projects[AUTOSAVE_KEY] = {
            grid: grid,
            date: new Date().toLocaleDateString('de-DE'),
            auto: true,
            treeGrowth: _ctx.getTreeGrowth(),
            inventory: _ctx.getInventory(),
            unlocked: Array.from(_ctx.getUnlockedMaterials()),
            discovered: Array.from(_ctx.getDiscoveredRecipes()),
            playerPos: _ctx.getPlayerPos(),
        };
        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        var saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.style.transition = 'opacity 0.3s';
            saveBtn.style.opacity = '0.5';
            setTimeout(function () { saveBtn.style.opacity = '1'; }, 600);
        }
    }

    // --- Laden-Dialog ---
    function showLoadDialog() {
        if (!_ctx) return;
        var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        var names = Object.keys(projects);
        var savedProjectsList = document.getElementById('saved-projects-list');
        var loadDialog = document.getElementById('load-dialog');
        if (!savedProjectsList || !loadDialog) return;

        while (savedProjectsList.firstChild) {
            savedProjectsList.removeChild(savedProjectsList.firstChild);
        }

        if (names.length === 0) {
            var p = document.createElement('p');
            p.className = 'no-projects';
            p.textContent = 'Keine Projekte gespeichert!';
            savedProjectsList.appendChild(p);
        } else {
            names.forEach(function (name) {
                savedProjectsList.appendChild(createProjectItem(name, projects[name]));
            });
        }
        loadDialog.classList.remove('hidden');
    }

    function loadProject(name) {
        if (!_ctx) return;
        var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        if (!projects[name]) return;

        var saved = projects[name].grid;
        if (isValidGrid(saved)) {
            _ctx.setGrid(saved);
        } else {
            _ctx.initGrid();
        }
        _ctx.setTreeGrowth(projects[name].treeGrowth || {});
        _ctx.setInventory(projects[name].inventory || {});
        if (projects[name].unlocked) {
            _ctx.setUnlockedMaterials(new Set(projects[name].unlocked));
            _ctx.saveUnlocked();
        } else {
            _ctx.setUnlockedMaterials(new Set());
        }
        if (projects[name].discovered) {
            _ctx.setDiscoveredRecipes(new Set(projects[name].discovered));
            _ctx.saveDiscoveredRecipes();
        }
        _ctx.setWindowGrid();
        _ctx.migrateUnlocked();
        _ctx.setProjectName(name === AUTOSAVE_KEY ? '' : name);
        _ctx.updateStats();
        _ctx.updateInventoryDisplay();
        _ctx.updatePaletteVisibility();
        _ctx.updateGenesisVisibility();
        _ctx.updateDiscoveryCounter();
        _ctx.requestRedraw();
        var loadDialog = document.getElementById('load-dialog');
        if (loadDialog) loadDialog.classList.add('hidden');
        if (window.showToast) window.showToast('\uD83D\uDCC2 "' + name + '" geladen!');
    }

    function deleteProject(name) {
        var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
        delete projects[name];
        localStorage.setItem('insel-projekte', JSON.stringify(projects));
        showLoadDialog();
        if (window.showToast) window.showToast('\uD83D\uDDD1\uFE0F "' + name + '" gel\u00F6scht!');
    }

    function newProject() {
        if (!_ctx) return;
        _ctx.initGrid();
        _ctx.setTreeGrowth({});
        _ctx.setInventory({});
        _ctx.setUnlockedMaterials(new Set());
        _ctx.setDiscoveredRecipes(new Set());
        _ctx.resetPlayerPos();
        _ctx.saveInventory();
        _ctx.saveUnlocked();
        _ctx.saveDiscoveredRecipes();
        _ctx.setProjectName('');
        _ctx.resetGenesisFlags();
        _ctx.updateStats();
        _ctx.updateInventoryDisplay();
        _ctx.updatePaletteVisibility();
        _ctx.updateGenesisVisibility();
        _ctx.updateDiscoveryCounter();
        _ctx.requestRedraw();
        if (window.showToast) window.showToast('\uD83C\uDD95 Neue Insel!');
    }

    // --- URL-Sharing ---
    function encodeGridToURL() {
        if (!_ctx) return '';
        var grid = _ctx.getGrid();
        var MATERIALS = _ctx.getMaterials();
        var ROWS = _ctx.ROWS;
        var COLS = _ctx.COLS;
        var cells = [];
        var matKeys = Object.keys(MATERIALS);
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    var idx = matKeys.indexOf(grid[r][c]);
                    cells.push([r, c, idx >= 0 ? idx : grid[r][c]]);
                }
            }
        }
        var payload = { v: 1, m: matKeys, g: cells };
        return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    }

    function decodeGridFromURL(encoded) {
        if (!_ctx) return false;
        try {
            var payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
            if (!payload.v || !payload.g) return false;
            var ROWS = _ctx.ROWS;
            var COLS = _ctx.COLS;
            var MATERIALS = _ctx.getMaterials();
            _ctx.initGrid();
            var grid = _ctx.getGrid();
            for (var i = 0; i < payload.g.length; i++) {
                var entry = payload.g[i];
                var r = entry[0], c = entry[1], mat = entry[2];
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    var material = typeof mat === 'number' ? payload.m[mat] : mat;
                    if (material && MATERIALS[material]) grid[r][c] = material;
                }
            }
            _ctx.requestRedraw();
            _ctx.requestStatsUpdate();
            return true;
        } catch (e) {
            return false;
        }
    }

    // Exports
    window.INSEL_SAVE = {
        registerContext: registerContext,
        AUTOSAVE_KEY: AUTOSAVE_KEY,
        isValidGrid: isValidGrid,
        saveProject: saveProject,
        autoSave: autoSave,
        showLoadDialog: showLoadDialog,
        loadProject: loadProject,
        deleteProject: deleteProject,
        newProject: newProject,
        encodeGridToURL: encodeGridToURL,
        decodeGridFromURL: decodeGridFromURL,
    };

    // Flache Exports fuer Kompatibilitaet
    window.autoSave = autoSave;
    window.showLoadDialog = showLoadDialog;
    window.isValidGrid = isValidGrid;
    window.loadProject = loadProject;
    window.deleteProject = deleteProject;
    window.newProject = newProject;
    window.encodeGridToURL = encodeGridToURL;
    window.decodeGridFromURL = decodeGridFromURL;

})();
