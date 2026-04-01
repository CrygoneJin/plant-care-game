// === HAU-DEN-LUKAS MINI-GAME (#79) ===
// Pump-Check: so schnell wie möglich klicken/tippen um den Balken hochzutreiben.
// Belohnung in 3 Stufen: Bronze / Silber / Gold.
// Exportiert window.INSEL_LUKAS

(function () {
    'use strict';

    // --- Konfiguration ---
    const GAME_DURATION_MS = 5000;      // 5 Sekunden pumpen
    const DECAY_PER_FRAME = 0.4;        // Balken sinkt pro Frame
    const PUMP_AMOUNT = 6;              // Balken steigt pro Klick
    const MAX_HEIGHT = 100;             // 100% = Glocke

    // Schwellen (% des Balkens am Ende)
    const THRESHOLDS = {
        gold:   { min: 75, label: '🥇 Gold!',   rewards: { stone: 5, metal: 3, shell: 2 } },
        silver: { min: 45, label: '🥈 Silber!',  rewards: { stone: 3, metal: 1, shell: 1 } },
        bronze: { min: 1,  label: '🥉 Bronze!',  rewards: { stone: 1 } },
    };

    let overlay = null;
    let running = false;
    let height = 0;
    let startTime = 0;
    let animFrame = null;
    let lastFrame = 0;

    // --- Overlay DOM erstellen ---
    function createOverlay() {
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.id = 'lukas-overlay';
        overlay.innerHTML = `
            <div class="lukas-box">
                <h2>🔨 Hau den Lukas!</h2>
                <p class="lukas-hint">Klicke/tippe so schnell du kannst!</p>
                <div class="lukas-meter-wrap">
                    <div class="lukas-meter">
                        <div class="lukas-fill" id="lukas-fill"></div>
                        <div class="lukas-bell" id="lukas-bell">🔔</div>
                    </div>
                    <div class="lukas-marks">
                        <span class="lukas-mark" style="bottom:75%">🥇</span>
                        <span class="lukas-mark" style="bottom:45%">🥈</span>
                        <span class="lukas-mark" style="bottom:1%">🥉</span>
                    </div>
                </div>
                <div class="lukas-timer" id="lukas-timer">5.0s</div>
                <button class="lukas-pump-btn" id="lukas-pump">💪 HAU!</button>
                <div class="lukas-result" id="lukas-result" style="display:none"></div>
                <button class="lukas-close-btn" id="lukas-close" style="display:none">Weiter</button>
            </div>
        `;
        overlay.style.cssText = `
            position:fixed; inset:0; z-index:8500;
            background:rgba(0,0,0,0.85);
            display:flex; align-items:center; justify-content:center;
            font-family:Fredoka,Comic Neue,sans-serif;
        `;

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            .lukas-box {
                background: linear-gradient(135deg, #2C3E50, #34495E);
                border-radius: 24px; padding: 28px 36px; text-align: center;
                color: #ECF0F1; max-width: 340px; width: 90%;
                box-shadow: 0 8px 40px rgba(0,0,0,0.5);
            }
            .lukas-box h2 { margin: 0 0 8px; font-size: 28px; }
            .lukas-hint { margin: 0 0 16px; opacity: 0.7; font-size: 14px; }
            .lukas-meter-wrap {
                display: flex; justify-content: center; align-items: flex-end;
                gap: 8px; height: 260px; margin-bottom: 12px;
            }
            .lukas-meter {
                width: 60px; height: 240px; background: #1a1a2e;
                border-radius: 30px; position: relative; overflow: hidden;
                border: 3px solid #F1C40F;
            }
            .lukas-fill {
                position: absolute; bottom: 0; left: 0; right: 0;
                background: linear-gradient(to top, #E74C3C, #F39C12, #2ECC71);
                border-radius: 0 0 27px 27px; transition: height 0.05s linear;
                height: 0%;
            }
            .lukas-bell {
                position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
                font-size: 24px; opacity: 0.3; transition: opacity 0.2s;
            }
            .lukas-bell.ring {
                opacity: 1; animation: lukasBellRing 0.3s ease-in-out 3;
            }
            @keyframes lukasBellRing {
                0%, 100% { transform: translateX(-50%) rotate(0deg); }
                25% { transform: translateX(-50%) rotate(15deg); }
                75% { transform: translateX(-50%) rotate(-15deg); }
            }
            .lukas-marks {
                display: flex; flex-direction: column; position: relative;
                height: 240px; justify-content: flex-end;
            }
            .lukas-mark {
                position: absolute; font-size: 18px; left: 0;
            }
            .lukas-timer {
                font-size: 22px; font-weight: 700; margin-bottom: 12px;
                color: #F1C40F;
            }
            .lukas-pump-btn {
                font-size: 28px; padding: 14px 40px; border: none;
                border-radius: 16px; cursor: pointer; font-family: inherit;
                background: linear-gradient(135deg, #E74C3C, #C0392B);
                color: white; font-weight: 700;
                box-shadow: 0 4px 15px rgba(231,76,60,0.4);
                user-select: none; -webkit-user-select: none;
                touch-action: manipulation;
                transition: transform 0.05s;
            }
            .lukas-pump-btn:active { transform: scale(0.93); }
            .lukas-result {
                margin-top: 16px; font-size: 20px; font-weight: 700;
                line-height: 1.5;
            }
            .lukas-close-btn {
                margin-top: 12px; padding: 10px 28px; border: none;
                border-radius: 12px; cursor: pointer; font-family: inherit;
                background: #2ECC71; color: white; font-size: 16px;
                font-weight: 600;
            }
        `;
        overlay.appendChild(style);
        document.body.appendChild(overlay);
    }

    // --- Spiel starten ---
    function startGame() {
        createOverlay();
        overlay.style.display = 'flex';
        height = 0;
        running = true;
        startTime = performance.now();
        lastFrame = startTime;

        const fill = document.getElementById('lukas-fill');
        const bell = document.getElementById('lukas-bell');
        const timerEl = document.getElementById('lukas-timer');
        const pumpBtn = document.getElementById('lukas-pump');
        const resultEl = document.getElementById('lukas-result');
        const closeBtn = document.getElementById('lukas-close');

        fill.style.height = '0%';
        bell.classList.remove('ring');
        bell.style.opacity = '0.3';
        timerEl.textContent = (GAME_DURATION_MS / 1000).toFixed(1) + 's';
        pumpBtn.style.display = '';
        resultEl.style.display = 'none';
        closeBtn.style.display = 'none';

        // Pump-Handler
        function pump(e) {
            e.preventDefault();
            if (!running) return;
            height = Math.min(MAX_HEIGHT, height + PUMP_AMOUNT);
        }
        pumpBtn.onpointerdown = pump;
        // Keyboard: Space/Enter auch als Pump
        function keyPump(e) {
            if (!running) return;
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                height = Math.min(MAX_HEIGHT, height + PUMP_AMOUNT);
                pumpBtn.style.transform = 'scale(0.93)';
                setTimeout(() => { pumpBtn.style.transform = ''; }, 50);
            } else if (e.code === 'Escape') {
                endGame(true);
            }
        }
        document.addEventListener('keydown', keyPump);

        // Animation Loop
        function frame(now) {
            if (!running) return;
            const dt = (now - lastFrame) / 16.67; // normalisiert auf ~60fps
            lastFrame = now;

            // Decay
            height = Math.max(0, height - DECAY_PER_FRAME * dt);

            // Update UI
            fill.style.height = height + '%';
            if (height >= 95) {
                bell.classList.add('ring');
                bell.style.opacity = '1';
            }

            const remaining = Math.max(0, GAME_DURATION_MS - (now - startTime));
            timerEl.textContent = (remaining / 1000).toFixed(1) + 's';

            if (remaining <= 0) {
                endGame(false);
                document.removeEventListener('keydown', keyPump);
                return;
            }
            animFrame = requestAnimationFrame(frame);
        }
        animFrame = requestAnimationFrame(frame);

        function endGame(cancelled) {
            running = false;
            if (animFrame) cancelAnimationFrame(animFrame);
            pumpBtn.style.display = 'none';

            if (cancelled) {
                overlay.style.display = 'none';
                document.removeEventListener('keydown', keyPump);
                return;
            }

            // Ergebnis berechnen
            const finalHeight = height;
            let tier = null;
            for (const [key, t] of Object.entries(THRESHOLDS)) {
                if (finalHeight >= t.min) { tier = { key, ...t }; break; }
            }

            if (!tier) {
                resultEl.innerHTML = '😅 Nicht genug Power!<br>Nächstes Mal schneller!';
                resultEl.style.display = '';
                closeBtn.style.display = '';
                closeBtn.onclick = () => { overlay.style.display = 'none'; };
                return;
            }

            // Belohnungen vergeben
            const rewardLines = [];
            for (const [mat, count] of Object.entries(tier.rewards)) {
                if (window.addToInventory) {
                    window.addToInventory(mat, count);
                }
                const info = window.INSEL_MATERIALS && window.INSEL_MATERIALS[mat];
                const emoji = info ? info.emoji : '';
                const label = info ? info.label : mat;
                rewardLines.push(`${emoji} ${count}x ${label}`);
            }

            // Achievement-Sound
            if (window.INSEL_SOUND && window.INSEL_SOUND.soundAchievement) {
                window.INSEL_SOUND.soundAchievement();
            }

            resultEl.innerHTML = `${tier.label}<br>${rewardLines.join('<br>')}`;
            resultEl.style.display = '';
            closeBtn.style.display = '';
            closeBtn.onclick = () => {
                overlay.style.display = 'none';
                document.removeEventListener('keydown', keyPump);
            };

            if (window.showToast) {
                window.showToast(`🔨 Hau den Lukas: ${tier.label}`, 3000);
            }

            // Analytics
            if (window.trackEvent) {
                window.trackEvent('lukas_complete', {
                    tier: tier.key,
                    height: Math.round(finalHeight),
                });
            }
        }
    }

    // --- Button-Binding ---
    function bindButton() {
        const btn = document.getElementById('lukas-btn');
        if (btn) btn.addEventListener('click', startGame);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButton);
    } else {
        bindButton();
    }

    // --- API exportieren ---
    window.INSEL_LUKAS = {
        start: startGame,
    };
})();
