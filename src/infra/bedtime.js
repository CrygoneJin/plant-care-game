// === BEDTIME — Gute-Nacht-Geschichten von Tommy Krab ===
// Tommy erzählt Kapitel basierend auf dem was das Kind gebaut hat.
// Papa liest vor. Großer Text, ruhiges Design.
// Exportiert als window.INSEL_BEDTIME

(function () {
    'use strict';

    const STORAGE_KEY = 'insel-bedtime-chapters';
    const overlay = document.getElementById('bedtime-overlay');
    const storyEl = document.getElementById('bedtime-story');
    const chapterTitle = document.getElementById('bedtime-chapter-title');
    const closeBtn = document.getElementById('bedtime-close-btn');
    const newBtn = document.getElementById('bedtime-new-btn');
    const prevBtn = document.getElementById('bedtime-prev-btn');
    const nextBtn = document.getElementById('bedtime-next-btn');
    const loadingEl = document.getElementById('bedtime-loading');

    if (!overlay || !storyEl) return;

    let chapters = loadChapters();
    let currentIndex = chapters.length - 1;
    let generating = false;

    // --- Persistence ---
    function loadChapters() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }

    function saveChapters() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
    }

    // --- Grid lesen (gleiche Logik wie chat.js getGridContext) ---
    function getIslandSummary() {
        const grid = window.grid;
        if (!grid) return { text: 'Die Insel ist noch leer.', materials: [], total: 0, percent: 0 };

        const counts = {};
        let total = 0;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c]) {
                    counts[grid[r][c]] = (counts[grid[r][c]] || 0) + 1;
                    total++;
                }
            }
        }

        if (total === 0) return { text: 'Die Insel ist noch leer.', materials: [], total: 0, percent: 0 };

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 8).map(([m, n]) => `${n}x ${m}`).join(', ');
        const percent = Math.round((total / (grid.length * grid[0].length)) * 100);

        return {
            text: `Die Insel ist zu ${percent}% bebaut (${total} Blöcke). Materialien: ${top}.`,
            materials: sorted.map(([m]) => m),
            total,
            percent
        };
    }

    // --- Quest-Kontext ---
    function getQuestSummary() {
        const qs = window.questSystem;
        if (!qs) return '';
        const completed = qs.getCompleted();
        if (completed.length === 0) return '';
        const names = completed.slice(-3).map(q => q.title).join(', ');
        return `Abgeschlossene Quests: ${names}.`;
    }

    // --- Spielername ---
    function getPlayerName() {
        return localStorage.getItem('insel-player-name') || 'der Baumeister';
    }

    // --- Bisherige Kapitel-Zusammenfassung ---
    function getPreviousChaptersSummary() {
        if (chapters.length === 0) return '';
        const last = chapters.slice(-2);
        const summaries = last.map((ch, i) =>
            `Kapitel ${chapters.length - last.length + i + 1}: ${ch.text.substring(0, 150)}...`
        ).join('\n');
        return `Bisherige Kapitel (Kurzfassung):\n${summaries}`;
    }

    // --- LLM-Call (gleiche Infrastruktur wie chat.js) ---
    async function generateChapter() {
        const island = getIslandSummary();
        const quests = getQuestSummary();
        const player = getPlayerName();
        const prevSummary = getPreviousChaptersSummary();
        const chapterNum = chapters.length + 1;

        const systemPrompt = `Du bist Tommy Krab, ein kleiner roter Krebs auf der Insel Java.
Aber jetzt ist Abend. Du sitzt am Strand, die Wellen rauschen, und du erzählst eine Gute-Nacht-Geschichte.

STIMME: Immer noch Tommy — aber ruhiger. "Klick-klack" kommt nur noch leise, wie ein zufriedenes Schnalzen.
Du bist warmherzig, ein bisschen albern, und du liebst Abenteuer.
Ab und zu rutschst du ins Englische: "Das war so... klick-klack... magical."

REGELN:
- Erzähle ein Kapitel einer fortlaufenden Geschichte über die Abenteuer auf der Insel Java.
- Der Held heißt ${player}. Er/Sie baut eine Insel.
- Verwende was wirklich auf der Insel gebaut wurde als Grundlage.
- Jedes Kapitel: 8-12 Absätze, ~400-500 Wörter. Perfekt zum Vorlesen (3-5 Min).
- Schreibe so, dass ein Papa es einem 8-Jährigen vorlesen kann.
- Ende jedes Kapitel mit einem kleinen Cliffhanger oder einer Frage für morgen.
- Kapitel ${chapterNum}. ${prevSummary ? 'Setze die Geschichte fort.' : 'Dies ist das erste Kapitel — stelle die Insel und Tommy vor.'}
- Kein Grusel, keine Gewalt. Abenteuer, Humor, Freundschaft.
- Kinderspiel (6-10 J.). Kein Grusel, keine Links, keine persönlichen Daten.

INSEL-STATUS: ${island.text}
${quests}
${prevSummary}`;

        const userMsg = chapterNum === 1
            ? `Erzähl mir das erste Kapitel! Wie Tommy Krab auf die Insel kam und ${player} kennengelernt hat.`
            : `Erzähl Kapitel ${chapterNum}! Was passiert als nächstes auf der Insel?`;

        // Config aus chat.js übernehmen
        const CFG = window.INSEL_CONFIG || {};
        const hasProxy = !!CFG.proxy;
        const proxyUrl = hasProxy ? CFG.proxy.replace(/\/+$/, '') : '';

        let apiUrl, headers, body;

        if (hasProxy) {
            apiUrl = proxyUrl.includes('/v1/') || proxyUrl.includes('/completions')
                ? proxyUrl
                : proxyUrl.includes('localhost') || proxyUrl.includes('127.0.0.1')
                    ? proxyUrl + '/v1/chat/completions'
                    : proxyUrl;
            headers = { 'Content-Type': 'application/json' };
            if (CFG.proxyKey) headers['Authorization'] = `Bearer ${CFG.proxyKey}`;
            body = JSON.stringify({
                model: 'anthropic/claude-haiku-4-5-20251001',
                max_tokens: 800,
                temperature: 0.8,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMsg }
                ]
            });
        } else {
            const key = localStorage.getItem('langdock-api-key') || CFG.apiKey || '';
            if (!key) throw new Error('Kein API-Key. Geh in den Chat (💬) und stell einen Key ein (⚙️).');
            apiUrl = 'https://router.requesty.ai/v1/chat/completions';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            };
            body = JSON.stringify({
                model: 'anthropic/claude-haiku-4-5-20251001',
                max_tokens: 800,
                temperature: 0.8,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMsg }
                ]
            });
        }

        const resp = await fetch(apiUrl, { method: 'POST', headers, body });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(`Fehler ${resp.status}: ${err.error?.message || resp.statusText}`);
        }

        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content
            || data.content?.[0]?.text
            || '';

        return text.trim();
    }

    // --- Rendering ---
    function renderChapter(index) {
        if (chapters.length === 0) {
            chapterTitle.textContent = 'Noch keine Geschichte';
            storyEl.innerHTML = '<p class="bedtime-empty">Drück auf "Neues Kapitel" und Tommy erzählt dir eine Gute-Nacht-Geschichte!</p>';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        const ch = chapters[index];
        const num = index + 1;
        chapterTitle.textContent = `Kapitel ${num} von ${chapters.length}`;

        // Markdown-artige Absätze → HTML
        const paragraphs = ch.text.split(/\n\n+/).filter(Boolean);
        storyEl.innerHTML = paragraphs.map(p =>
            `<p>${p.replace(/\n/g, '<br>')}</p>`
        ).join('');

        prevBtn.style.display = index > 0 ? '' : 'none';
        nextBtn.style.display = index < chapters.length - 1 ? '' : 'none';
    }

    function showLoading(show) {
        loadingEl.style.display = show ? 'flex' : 'none';
        storyEl.style.display = show ? 'none' : '';
        newBtn.disabled = show;
    }

    // --- Actions ---
    async function createNewChapter() {
        if (generating) return;
        generating = true;
        showLoading(true);

        try {
            const text = await generateChapter();
            const chapter = {
                text,
                date: new Date().toISOString(),
                island: getIslandSummary().percent
            };
            chapters.push(chapter);
            saveChapters();
            currentIndex = chapters.length - 1;
            renderChapter(currentIndex);
        } catch (err) {
            storyEl.innerHTML = `<p class="bedtime-error">🦞 Klick-klack... da ging was schief:<br>${err.message}</p>`;
            storyEl.style.display = '';
        } finally {
            showLoading(false);
            generating = false;
        }
    }

    function open() {
        chapters = loadChapters();
        currentIndex = Math.max(0, chapters.length - 1);
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (chapters.length === 0) {
            renderChapter(0);
        } else {
            renderChapter(currentIndex);
        }
    }

    function close() {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // --- Events ---
    closeBtn.addEventListener('click', close);
    newBtn.addEventListener('click', createNewChapter);
    prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            renderChapter(currentIndex);
        }
    });
    nextBtn.addEventListener('click', function () {
        if (currentIndex < chapters.length - 1) {
            currentIndex++;
            renderChapter(currentIndex);
        }
    });

    // Escape schließt
    overlay.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });

    // --- Button in der Toolbar ---
    const storyBtn = document.getElementById('bedtime-btn');
    if (storyBtn) storyBtn.addEventListener('click', open);

    // --- Export ---
    window.INSEL_BEDTIME = { open, close };

})();
