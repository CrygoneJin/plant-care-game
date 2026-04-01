// === CODE-VIEW + CRYPTO-PANEL — Zellteilung #11 aus game.js ===
// Code-View: zeigt Material-IDs statt Emojis auf dem Canvas.
// Crypto-Panel: MMX/XCH Burn-Adressen als Nerd-Easter-Egg im Code-View.
// Exportiert als window.INSEL_CODE_VIEW

(function () {
    'use strict';

    // === CODE-VIEW RENDERING ===
    // Wird aufgerufen aus draw() in game.js wenn codeViewActive === true.
    // state: { codeViewActive, grid, ROWS, COLS, WATER_BORDER, CELL_SIZE,
    //          totalRows, totalCols, getInventoryCount }
    function draw(ctx, state) {
        const { codeViewActive, grid, ROWS, COLS, WATER_BORDER, CELL_SIZE,
                totalRows, totalCols, getInventoryCount } = state;
        if (!codeViewActive) return;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    const x = (c + WATER_BORDER) * CELL_SIZE;
                    const y = (r + WATER_BORDER) * CELL_SIZE;
                    ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    ctx.fillStyle = '#00FF41'; // Matrix-Grün
                    ctx.font = `bold ${Math.max(8, CELL_SIZE * 0.28)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(grid[r][c], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                }
            }
        }

        // Code-View Label
        const shellsNow = typeof getInventoryCount === 'function' ? getInventoryCount('shell') : 0;
        const adamsMode = shellsNow === 42;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, adamsMode ? 420 : 200, 24);
        ctx.fillStyle = adamsMode ? '#FFD700' : '#00FF41';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(adamsMode
            ? 'DON\'T PANIC · The Answer is 42 · So long, and thanks for all the fish'
            : '</> CODE-VIEW: grid[r][c]', 10, 10);

        // === Crypto Donation Panel — Nerd Easter Egg ===
        const mmxAddr = window.INSEL_MMX_BURN || 'mmx1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5tuzzn';
        const xchAddr = window.INSEL_XCH_BURN || 'xch1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqdlkwut';
        const mmxBal = window._mmxBurnBalance || '?';
        const xchBal = window._xchBurnBalance || '?';
        const panelH = 58;
        const panelW = Math.min(460, totalCols * CELL_SIZE - 10);
        const mmxY = totalRows * CELL_SIZE - panelH - 5;

        ctx.fillStyle = 'rgba(15, 15, 15, 0.88)';
        ctx.fillRect(5, mmxY, panelW, panelH);
        ctx.strokeStyle = '#FF6B00';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, mmxY, panelW, panelH);

        ctx.fillStyle = '#FF6B00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('🔥 MMX  ' + mmxAddr.slice(0, 12) + '...' + mmxAddr.slice(-6) + '  ' + mmxBal + ' MMX', 10, mmxY + 5);

        const shellCount = typeof getInventoryCount === 'function' ? getInventoryCount('shell') : 0;
        const shellMmx = (shellCount * 0.001).toFixed(4);
        ctx.fillStyle = '#888';
        ctx.font = '9px monospace';
        ctx.fillText('Burn: ' + mmxBal + ' MMX  |  Wallet: ' + shellCount + '/42 🐚 ≈ ' + shellMmx + '/0.042 MMX  |  The Answer', 10, mmxY + 22);
        ctx.fillStyle = '#3AAC59';
        ctx.fillText('🌱 XCH  ' + xchAddr.slice(0, 12) + '...' + xchAddr.slice(-6) + '  ' + xchBal + ' XCH', 10, mmxY + 20);

        ctx.fillStyle = '#666';
        ctx.font = '8px monospace';
        ctx.fillText('Schwarze L\u00f6cher. Tokens rein, niemand raus.', 10, mmxY + 38);
        ctx.fillText('Hawking-Strahlung: die Arbeit die rausstrahlt ist das Eigentliche.', 10, mmxY + 48);
    }

    // === CRYPTO BALANCE POLLING ===
    // Alle 60s: MMX + XCH Burn-Adressen abfragen, in window._*BurnBalance speichern.
    // draw() liest daraus beim nächsten Render-Frame.
    (function fetchCryptoBalances() {
        const mmxAddr = window.INSEL_MMX_BURN || 'mmx1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5tuzzn';
        const mmxApi = 'https://api.mmxplorer.com/wapi/address?id=' + mmxAddr;
        function pollMmx() {
            fetch(mmxApi).then(r => r.ok ? r.json() : null).then(data => {
                if (data && data.balances) {
                    const bal = data.balances['MMX'] || data.balance || 0;
                    window._mmxBurnBalance = (bal / 10000).toFixed(4);
                } else {
                    window._mmxBurnBalance = '0.0000';
                }
            }).catch(() => { window._mmxBurnBalance = '—'; });
        }
        const xchAddr = window.INSEL_XCH_BURN || 'xch1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqdlkwut';
        const xchApi = 'https://api2.spacescan.io/1/xch/balance/' + xchAddr;
        function pollXch() {
            fetch(xchApi).then(r => r.ok ? r.json() : null).then(data => {
                if (data && data.xch_balance != null) {
                    window._xchBurnBalance = parseFloat(data.xch_balance).toFixed(6);
                } else {
                    window._xchBurnBalance = '0.000000';
                }
            }).catch(() => { window._xchBurnBalance = '—'; });
        }
        pollMmx(); pollXch();
        setInterval(pollMmx, 60000);
        setInterval(pollXch, 60000);
    })();

    window.INSEL_CODE_VIEW = { draw };
})();
