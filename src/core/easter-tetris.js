// easter-tetris.js — Konami-Code Easter Egg: Mini Tetris
// Aktivierung: ↑ ↑ ↓ ↓ ← → ← → b a
(function () {
    'use strict';

    // --- Konami-Code Sequenz ---
    const KONAMI = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', function (e) {
        if (e.key === KONAMI[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === KONAMI.length) {
                konamiIndex = 0;
                openTetris();
            }
        } else {
            konamiIndex = (e.key === KONAMI[0]) ? 1 : 0;
        }
    });

    // --- Tetris Konfiguration ---
    const COLS = 10;
    const ROWS = 20;
    const CELL = 24;
    const COLORS = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c'];

    // Tetrominoes [type][rotation] als flat arrays (col-major, COLS=4 grid)
    const PIECES = [
        null,
        { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 1 }, // I
        { shape: [[1,1],[1,1]], color: 2 },                               // O
        { shape: [[0,1,0],[1,1,1],[0,0,0]], color: 3 },                   // T
        { shape: [[0,1,1],[1,1,0],[0,0,0]], color: 4 },                   // S
        { shape: [[1,1,0],[0,1,1],[0,0,0]], color: 5 },                   // Z
        { shape: [[1,0,0],[1,1,1],[0,0,0]], color: 6 },                   // J
        { shape: [[0,0,1],[1,1,1],[0,0,0]], color: 7 },                   // L
    ];

    let gameLoop = null;
    let keyHandler = null;

    function openTetris() {
        if (document.getElementById('tetris-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'tetris-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:20000;display:flex;align-items:center;justify-content:center;';

        const box = document.createElement('div');
        box.style.cssText = 'background:#1a1a2e;border-radius:12px;padding:16px;color:#eee;font-family:monospace;text-align:center;';

        const title = document.createElement('div');
        title.style.cssText = 'font-size:18px;margin-bottom:8px;';
        title.textContent = '🎮 Tetris — geheimes Easter Egg!';

        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:11px;color:#888;margin-bottom:10px;';
        hint.textContent = '← → bewegen · ↑ drehen · ↓ schnell · Esc schließen';

        const canvas = document.createElement('canvas');
        canvas.width = COLS * CELL;
        canvas.height = ROWS * CELL;
        canvas.style.cssText = 'display:block;border:2px solid #444;';

        const scoreEl = document.createElement('div');
        scoreEl.style.cssText = 'margin-top:8px;font-size:14px;';
        scoreEl.textContent = 'Punkte: 0';

        box.appendChild(title);
        box.appendChild(hint);
        box.appendChild(canvas);
        box.appendChild(scoreEl);
        modal.appendChild(box);
        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeTetris();
        });

        startGame(canvas, scoreEl);
    }

    function closeTetris() {
        if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
        if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
        const modal = document.getElementById('tetris-modal');
        if (modal) modal.remove();
    }

    function startGame(canvas, scoreEl) {
        const ctx = canvas.getContext('2d');
        let board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
        let score = 0;
        let current = spawnPiece();
        let gameOver = false;

        function spawnPiece() {
            const type = Math.floor(Math.random() * 7) + 1;
            const p = PIECES[type];
            return {
                shape: p.shape,
                color: p.color,
                x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
                y: 0
            };
        }

        function rotate(shape) {
            const rows = shape.length;
            const cols = shape[0].length;
            const rotated = Array.from({ length: cols }, () => new Array(rows).fill(0));
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    rotated[c][rows - 1 - r] = shape[r][c];
                }
            }
            return rotated;
        }

        function fits(shape, x, y) {
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (!shape[r][c]) continue;
                    const nx = x + c;
                    const ny = y + r;
                    if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
                    if (ny >= 0 && board[ny][nx]) return false;
                }
            }
            return true;
        }

        function lock() {
            for (let r = 0; r < current.shape.length; r++) {
                for (let c = 0; c < current.shape[r].length; c++) {
                    if (!current.shape[r][c]) continue;
                    const ny = current.y + r;
                    if (ny < 0) { gameOver = true; return; }
                    board[ny][current.x + c] = current.color;
                }
            }
            // Volle Zeilen löschen
            let cleared = 0;
            board = board.filter(row => {
                if (row.every(c => c !== 0)) { cleared++; return false; }
                return true;
            });
            while (board.length < ROWS) board.unshift(new Array(COLS).fill(0));
            score += [0, 100, 300, 500, 800][cleared] || 0;
            scoreEl.textContent = 'Punkte: ' + score;
            current = spawnPiece();
            if (!fits(current.shape, current.x, current.y)) gameOver = true;
        }

        function draw() {
            ctx.fillStyle = '#0d0d1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Board
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c]) {
                        ctx.fillStyle = COLORS[board[r][c]];
                        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
                    }
                }
            }

            // Aktuelles Teil
            for (let r = 0; r < current.shape.length; r++) {
                for (let c = 0; c < current.shape[r].length; c++) {
                    if (!current.shape[r][c]) continue;
                    ctx.fillStyle = COLORS[current.color];
                    ctx.fillRect((current.x + c) * CELL + 1, (current.y + r) * CELL + 1, CELL - 2, CELL - 2);
                }
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
                ctx.font = '14px monospace';
                ctx.fillText('Esc zum Schließen', canvas.width / 2, canvas.height / 2 + 16);
            }
        }

        function tick() {
            if (gameOver) return;
            if (fits(current.shape, current.x, current.y + 1)) {
                current.y++;
            } else {
                lock();
            }
            draw();
        }

        keyHandler = function (e) {
            if (e.key === 'Escape') { closeTetris(); return; }
            if (gameOver) return;
            if (e.key === 'ArrowLeft') {
                if (fits(current.shape, current.x - 1, current.y)) current.x--;
            } else if (e.key === 'ArrowRight') {
                if (fits(current.shape, current.x + 1, current.y)) current.x++;
            } else if (e.key === 'ArrowDown') {
                if (fits(current.shape, current.x, current.y + 1)) current.y++;
                else lock();
            } else if (e.key === 'ArrowUp') {
                const rotated = rotate(current.shape);
                if (fits(rotated, current.x, current.y)) current.shape = rotated;
            } else if (e.key === ' ') {
                // Hard drop
                while (fits(current.shape, current.x, current.y + 1)) current.y++;
                lock();
            }
            if (!gameOver) draw();
            e.preventDefault();
        };

        document.addEventListener('keydown', keyHandler);

        draw();
        gameLoop = setInterval(tick, 500);
    }

})();
