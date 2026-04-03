// @ts-check
// effects.js — Wetter, Day/Night, Animationen (Zellteilung #11)
(function() {
    'use strict';

    // === DAY/NIGHT ===
    var dayTime = 0; // 0-1

    function updateDayNight() {
        var hour = new Date().getHours();
        var minute = new Date().getMinutes();
        var decimal = hour + minute / 60;
        // 6:00 = Morgen (0), 12:00 = Mittag (0.5), 18:00 = Abend (0.7), 22:00 = Nacht (0.9)
        if (decimal >= 6 && decimal < 12) {
            dayTime = (decimal - 6) / 12; // 0 → 0.5
        } else if (decimal >= 12 && decimal < 20) {
            dayTime = 0.5 + (decimal - 12) / 16; // 0.5 → 1.0
        } else {
            dayTime = 0.9 + Math.min(0.1, (decimal >= 20 ? decimal - 20 : decimal + 4) / 40);
        }
    }

    function getDayNightOverlay() {
        // 0-0.3: Morgen (warm), 0.3-0.7: Tag (hell), 0.7-1: Nacht (blau)
        if (dayTime < 0.3) {
            var t = dayTime / 0.3;
            return 'rgba(255, 200, 100, ' + (0.15 * (1 - t)) + ')';
        } else if (dayTime > 0.7) {
            var t2 = (dayTime - 0.7) / 0.3;
            return 'rgba(20, 20, 80, ' + (0.3 * t2) + ')';
        }
        return null;
    }

    /** @returns {number} */
    function getDayTime() {
        return dayTime;
    }

    // === WEATHER ===
    var weather = 'sun'; // 'sun', 'rain', 'rainbow'
    /** @type {Array<{x: number, y: number, speed: number, length: number}>} */
    var raindrops = [];
    var weatherTimer = 0;
    var WEATHER_CHANGE_INTERVAL = 60000; // Alle 60 Sekunden prüfen

    function initRaindrops() {
        raindrops = [];
        for (var i = 0; i < 80; i++) {
            raindrops.push({
                x: Math.random() * 1000,
                y: Math.random() * 800,
                speed: 3 + Math.random() * 4,
                length: 6 + Math.random() * 10,
            });
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     */
    function drawWeather(ctx, canvas) {
        if (weather === 'rain') {
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
            ctx.lineWidth = 1;
            for (var d = 0; d < raindrops.length; d++) {
                var drop = raindrops[d];
                drop.y += drop.speed;
                drop.x += drop.speed * 0.2;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + drop.speed * 0.3, drop.y + drop.length);
                ctx.stroke();
            }
            // Dunkles Overlay für Regen
            ctx.fillStyle = 'rgba(30, 40, 60, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (weather === 'sun') {
            // Sonnenstrahlen aus der Ecke
            var time = Date.now() / 2000;
            var rayAlpha = 0.05 + Math.sin(time) * 0.02;
            ctx.fillStyle = 'rgba(255, 240, 150, ' + rayAlpha + ')';
            for (var i = 0; i < 5; i++) {
                var angle = -0.3 + i * 0.15 + Math.sin(time + i) * 0.05;
                ctx.save();
                ctx.translate(0, 0);
                ctx.rotate(angle);
                ctx.fillRect(0, -5, canvas.width * 1.5, 10 + i * 3);
                ctx.restore();
            }
        }

        // Regenbogen als Hintergrund-Effekt (nicht auf Canvas)
        var rainbowBg = document.getElementById('rainbow-bg');
        if (rainbowBg) {
            if (weather === 'rainbow') {
                rainbowBg.classList.add('rainbow-visible');
                rainbowBg.classList.remove('rainbow-hidden');
            } else {
                rainbowBg.classList.remove('rainbow-visible');
                rainbowBg.classList.add('rainbow-hidden');
            }
        }
    }

    function updateWeather() {
        weatherTimer += 16; // ~60fps
        if (weatherTimer > WEATHER_CHANGE_INTERVAL) {
            weatherTimer = 0;
            var roll = Math.random();
            if (roll < 0.5) weather = 'sun';
            else if (roll < 0.85) weather = 'rain';
            else weather = 'rainbow'; // 15% Chance auf Regenbogen!
        }
    }

    initRaindrops();

    // === ANIMATIONS ===
    /** @type {Array<{r: number, c: number, startTime: number, duration: number}>} */
    var animations = [];

    /**
     * @param {number} r
     * @param {number} c
     */
    function addPlaceAnimation(r, c) {
        animations.push({
            r: r,
            c: c,
            startTime: Date.now(),
            duration: 300,
        });
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} CELL_SIZE
     * @param {number} WATER_BORDER
     */
    function drawAnimations(ctx, CELL_SIZE, WATER_BORDER) {
        var now = Date.now();
        animations = animations.filter(function(anim) {
            var elapsed = now - anim.startTime;
            if (elapsed > anim.duration) return false;

            var progress = elapsed / anim.duration;
            var scale = progress < 0.5
                ? 0.5 + progress * 1.4
                : 1.2 - (progress - 0.5) * 0.4;

            var x = (anim.c + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;
            var y = (anim.r + WATER_BORDER) * CELL_SIZE + CELL_SIZE / 2;

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

    // #64: Elektronen = Crafting-Blitz — Lichtfunken beim LLM-Craft
    // Kein UI, kein Label. Amélie. Ladungsaustausch sichtbar machen.
    function spawnCraftSparks() {
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        var wrapper = document.getElementById('canvas-wrapper');
        var craftDialog = document.getElementById('craft-dialog');
        var target = craftDialog || wrapper;
        if (!target) return;
        var rect = target.getBoundingClientRect();
        for (var i = 0; i < 8; i++) {
            (function(idx) {
                setTimeout(function() {
                    var spark = document.createElement('div');
                    spark.className = 'merge-spark craft-spark';
                    spark.style.left = (Math.random() * rect.width - 20) + 'px';
                    spark.style.top  = (Math.random() * rect.height - 20) + 'px';
                    target.style.position = 'relative';
                    target.appendChild(spark);
                    setTimeout(function() { spark.remove(); }, 800);
                }, idx * 80);
            })(i);
        }
    }

    // #11: Merge/Blueprint Spark-Animation — DOM-basierte Funken auf Canvas-Zellen
    // Extrahiert aus game.js (3x identischer Code für merge, blueprint, genesis)
    /**
     * @param {Array<[number, number]>} cells - [[row, col], ...] Zellen die funkeln
     * @param {object} opts
     * @param {HTMLCanvasElement} opts.canvas
     * @param {number} opts.COLS
     * @param {number} opts.WATER_BORDER
     * @param {string} [opts.extraClass] - z.B. 'triplet' oder 'blueprint-spark'
     * @param {number} [opts.duration] - ms, default 1000
     */
    function spawnMergeSparks(cells, opts) {
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        var wrapper = document.getElementById('canvas-wrapper');
        if (!wrapper || !opts.canvas) return;
        var cellSize = opts.canvas.offsetWidth / (opts.COLS + opts.WATER_BORDER * 2);
        var duration = opts.duration || 1000;
        var extraClass = opts.extraClass ? ' ' + opts.extraClass : '';
        for (var i = 0; i < cells.length; i++) {
            var mr = cells[i][0];
            var mc = cells[i][1];
            var spark = document.createElement('div');
            spark.className = 'merge-spark' + extraClass;
            spark.style.left = ((mc + opts.WATER_BORDER) * cellSize + cellSize / 2 - 20) + 'px';
            spark.style.top = ((mr + opts.WATER_BORDER) * cellSize + cellSize / 2 - 20) + 'px';
            wrapper.appendChild(spark);
            (function(s, d) { setTimeout(function() { s.remove(); }, d); })(spark, duration);
        }
    }

    // #11: Fly-Animation — Emoji fliegt von einem Element zum Inventar-Tab
    /**
     * @param {HTMLElement} fromEl - Quell-Element
     * @param {string} emoji - Emoji das fliegt
     */
    function flyToInventory(fromEl, emoji) {
        var target = document.querySelector('.sidebar-tab[data-tab="inventory"]');
        if (!fromEl || !target) return;
        var fromRect = fromEl.getBoundingClientRect();
        var toRect = target.getBoundingClientRect();
        var flyer = document.createElement('div');
        flyer.className = 'craft-flyer';
        flyer.textContent = emoji;
        flyer.style.left = (fromRect.left + fromRect.width / 2) + 'px';
        flyer.style.top = (fromRect.top + fromRect.height / 2) + 'px';
        document.body.appendChild(flyer);
        var dx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
        var dy = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
        flyer.style.setProperty('--fly-dx', dx + 'px');
        flyer.style.setProperty('--fly-dy', dy + 'px');
        flyer.addEventListener('animationend', function() { flyer.remove(); });
    }

    // === PUBLIC API ===
    window.INSEL_EFFECTS = {
        updateDayNight: updateDayNight,
        getDayNightOverlay: getDayNightOverlay,
        getDayTime: getDayTime,
        drawWeather: drawWeather,
        updateWeather: updateWeather,
        addPlaceAnimation: addPlaceAnimation,
        drawAnimations: drawAnimations,
        spawnCraftSparks: spawnCraftSparks,
        spawnMergeSparks: spawnMergeSparks,
        flyToInventory: flyToInventory,
        /** @param {string} w */
        setWeather: function(w) { weather = w; },
        getWeather: function() { return weather; },
        resetWeatherTimer: function() { weatherTimer = 0; },
    };

    if (window.INSEL) window.INSEL.register('effects', window.INSEL_EFFECTS);
})();
