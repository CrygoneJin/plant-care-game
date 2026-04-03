// bigbang.js — Vom Urknall zur Insel
// 1D (Singularität) → Name → Countdown (Planck-Zeit) → 2D (Grid)
// Kein Zurück nach dem Countdown.
(function () {
    'use strict';

    const COUNTDOWN_FROM = 10;
    // Kosmologische Epochen für jeden Countdown-Schritt
    const EPOCHS = [
        { t: 10, label: 'Planck-Ära',           emoji: '·',  color: '#ffffff' },
        { t: 9,  label: 'Große Vereinigung',     emoji: '✦',  color: '#ffffcc' },
        { t: 8,  label: 'Inflation',             emoji: '◯',  color: '#ffddaa' },
        { t: 7,  label: 'Symmetriebrechung',     emoji: '⚫⚪', color: '#aaddff' },
        { t: 6,  label: 'Quark-Ära',             emoji: '💫🌀', color: '#e8b4f8' },
        { t: 5,  label: 'Leptonen-Ära',          emoji: '🔹',  color: '#0080ff' },
        { t: 4,  label: 'Nukleosynthese',        emoji: '⚛️',  color: '#ffd700' },
        { t: 3,  label: 'Erste Atome',           emoji: '☯️',  color: '#c0c0c0' },
        { t: 2,  label: 'Erstes Licht',          emoji: '☀️',  color: '#f5c800' },
        { t: 1,  label: 'Sterne & Galaxien',     emoji: '⭐',  color: '#f9e79f' },
    ];

    let _canvas = null;
    let _ctx = null;
    let _animFrame = null;
    let _phase = 'idle'; // idle | singularity | countdown | bang | done
    let _countdownValue = COUNTDOWN_FROM;
    let _singularityRadius = 2;
    let _bangTime = 0;
    let _startTime = 0;

    function createCanvas(container) {
        _canvas = document.createElement('canvas');
        _canvas.id = 'bigbang-canvas';
        _canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;';
        container.style.position = 'relative';
        container.insertBefore(_canvas, container.firstChild);
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!_canvas) return;
        _canvas.width = _canvas.offsetWidth * (window.devicePixelRatio || 1);
        _canvas.height = _canvas.offsetHeight * (window.devicePixelRatio || 1);
        _ctx = _canvas.getContext('2d');
        _ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    // === Phase 1: Singularität — ein Punkt pulsiert ===
    function drawSingularity(time) {
        if (!_ctx) return;
        const w = _canvas.offsetWidth;
        const h = _canvas.offsetHeight;
        _ctx.clearRect(0, 0, w, h);

        // Schwarzer Hintergrund
        _ctx.fillStyle = '#000';
        _ctx.fillRect(0, 0, w, h);

        // Horizontale 1D-Linie (schwach)
        const cx = w / 2;
        const cy = h / 2 - 40;
        _ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        _ctx.lineWidth = 1;
        _ctx.beginPath();
        _ctx.moveTo(0, cy);
        _ctx.lineTo(w, cy);
        _ctx.stroke();

        // Pulsierender Punkt
        const pulse = 1 + 0.3 * Math.sin(time * 0.003);
        const r = _singularityRadius * pulse;
        const gradient = _ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        _ctx.fillStyle = gradient;
        _ctx.beginPath();
        _ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
        _ctx.fill();

        // Harter Kern
        _ctx.fillStyle = '#fff';
        _ctx.beginPath();
        _ctx.arc(cx, cy, r, 0, Math.PI * 2);
        _ctx.fill();
    }

    // === Phase 2: Countdown — Expansion ===
    function drawCountdown(time) {
        if (!_ctx) return;
        const w = _canvas.offsetWidth;
        const h = _canvas.offsetHeight;
        const cx = w / 2;
        const cy = h / 2;

        _ctx.clearRect(0, 0, w, h);
        _ctx.fillStyle = '#000';
        _ctx.fillRect(0, 0, w, h);

        // Expandierender Kreis
        const elapsed = (Date.now() - _startTime) / 1000;
        const progress = Math.min(elapsed / COUNTDOWN_FROM, 1);
        const maxRadius = Math.max(w, h) * 0.6;
        const radius = _singularityRadius + progress * maxRadius;

        // Farbiger Nebel — wächst mit dem Countdown
        const epoch = EPOCHS[COUNTDOWN_FROM - _countdownValue] || EPOCHS[0];
        const gradient = _ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, epoch.color);
        gradient.addColorStop(0.3, epoch.color + '88');
        gradient.addColorStop(0.7, epoch.color + '22');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        _ctx.fillStyle = gradient;
        _ctx.beginPath();
        _ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        _ctx.fill();

        // Partikel (Quarks, Leptonen fliegen raus)
        const particleCount = Math.floor(progress * 50);
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.001;
            const dist = radius * (0.2 + 0.6 * ((i * 7 + 13) % 17) / 17);
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            const size = 1 + (i % 3);
            const alpha = 0.3 + 0.5 * (1 - dist / radius);
            _ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            _ctx.beginPath();
            _ctx.arc(px, py, size, 0, Math.PI * 2);
            _ctx.fill();
        }

        // Countdown-Zahl
        _ctx.fillStyle = '#fff';
        _ctx.font = 'bold 120px Fredoka, sans-serif';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.globalAlpha = 0.9;
        _ctx.fillText(String(_countdownValue), cx, cy - 20);
        _ctx.globalAlpha = 1;

        // Epoche-Label
        _ctx.font = '18px Fredoka, sans-serif';
        _ctx.fillStyle = epoch.color;
        _ctx.fillText(epoch.emoji + ' ' + epoch.label, cx, cy + 60);
    }

    // === Phase 3: Bang — Weißer Flash ===
    function drawBang(time) {
        if (!_ctx) return;
        const w = _canvas.offsetWidth;
        const h = _canvas.offsetHeight;

        const elapsed = Date.now() - _bangTime;
        const progress = Math.min(elapsed / 1500, 1); // 1.5s flash

        _ctx.clearRect(0, 0, w, h);

        // Flash: weiß → transparent
        if (progress < 0.3) {
            _ctx.fillStyle = `rgba(255,255,255,${1 - progress / 0.3})`;
            _ctx.fillRect(0, 0, w, h);
        }
    }

    // === Animation Loop ===
    function animate(time) {
        if (_phase === 'singularity') {
            drawSingularity(time);
        } else if (_phase === 'countdown') {
            drawCountdown(time);
        } else if (_phase === 'bang') {
            drawBang(time);
            if (Date.now() - _bangTime > 1500) {
                _phase = 'done';
                cleanup();
                return;
            }
        } else {
            return;
        }
        _animFrame = requestAnimationFrame(animate);
    }

    function cleanup() {
        if (_animFrame) cancelAnimationFrame(_animFrame);
        if (_canvas) _canvas.remove();
        window.removeEventListener('resize', resize);
        _canvas = null;
        _ctx = null;
    }

    // === Countdown-Tick ===
    function countdownTick() {
        _countdownValue--;

        if (_countdownValue <= 0) {
            // BANG!
            _phase = 'bang';
            _bangTime = Date.now();
            // Sound
            if (window.INSEL_SOUND && window.INSEL_SOUND.playCraft) {
                window.INSEL_SOUND.playCraft();
            }
            return;
        }

        setTimeout(countdownTick, 1000);
    }

    // === Öffentliche API ===

    /**
     * Initialisiert die Big-Bang-Sequenz auf dem Intro-Overlay.
     * Gibt ein Promise zurück das resolved wenn der Countdown fertig ist.
     * @param {HTMLElement} container - Das Intro-Overlay-Element
     * @returns {Promise<void>}
     */
    function init(container) {
        return new Promise((resolve) => {
            createCanvas(container);
            _phase = 'singularity';
            _animFrame = requestAnimationFrame(animate);

            // Warte auf startCountdown() Aufruf
            window._bigbangResolve = () => {
                resolve();
            };
        });
    }

    function startCountdown() {
        _phase = 'countdown';
        _countdownValue = COUNTDOWN_FROM;
        _startTime = Date.now();

        // UI-Elemente ausblenden während Countdown
        const nameGroup = document.getElementById('player-name-group');
        const startBtn = document.getElementById('start-button');
        const title = document.querySelector('.intro-content h1');
        const subtitle = document.querySelector('.intro-subtitle');
        if (nameGroup) nameGroup.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
        if (title) title.style.display = 'none';
        if (subtitle) subtitle.style.display = 'none';

        setTimeout(countdownTick, 1000);

        // Warten bis Bang fertig
        const checkDone = setInterval(() => {
            if (_phase === 'done') {
                clearInterval(checkDone);
                if (window._bigbangResolve) {
                    window._bigbangResolve();
                    delete window._bigbangResolve;
                }
            }
        }, 100);
    }

    function isActive() {
        return _phase !== 'idle' && _phase !== 'done';
    }

    window.INSEL_BIGBANG = {
        init,
        startCountdown,
        isActive,
    };
})();
