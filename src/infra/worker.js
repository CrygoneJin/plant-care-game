// Cloudflare Worker — API-Proxy für Insel-Architekt
// Direkt → Requesty (kritischer Pfad)
// Fire & forget → Logging (direkt, per Schalter)
//
// Setup:
// 1. https://dash.cloudflare.com → Workers & Pages → Create
// 2. Code reinkopieren
// 3. Environment Variables setzen:
//    API_KEY             = sk-...      (Requesty Key von requesty.ai)
//    LOGGING_MODE        = direct
//    AIRTABLE_TOKEN      = pat...       (nur bei LOGGING_MODE=direct)
//    AIRTABLE_BASE_ID    = appWiMxA1w46Mi1jC
//    AIRTABLE_TABLE_NAME = Feynman Sessions
// 4. D1 Binding: METRICS_DB → schatzinsel-metrics (6374055b-88fc-4632-966d-ed7f2ddb3d1d)
// 5. Deploy
// 6. In config.js PROXY auf die Worker-URL setzen
//
// Free Tier: 100k Requests/Tag. Reicht für Demos.

const API_URL = 'https://router.requesty.ai/v1/chat/completions';

// Rate Limit: max Requests pro IP pro Stunde
const RATE_LIMIT = 60;
const RATE_WINDOW = 3600;

export default {
    async fetch(request, env) {
        // CORS Preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders() });
        }

        // URL-basiertes Routing (vor POST-Guard, da /discoveries auch GET erlaubt)
        const { pathname } = new URL(request.url);
        if (pathname === '/discoveries') {
            return handleDiscoveries(env);
        }
        if (pathname.startsWith('/karte')) {
            return handleKarte(request, env);
        }
        if (pathname === '/bugs') {
            return handleBugs(request, env);
        }
        if (pathname === '/tts') {
            return handleTTS(request, env);
        }
        if (pathname === '/metrics') {
            return handleMetrics(request, env);
        }
        if (pathname === '/metrics/ingest') {
            return handleMetricsIngest(request, env);
        }
        // Burn-Balance Proxy — mmxplorer blockt direkte Browser-Requests (Cloudflare Challenge)
        if (pathname === '/burn') {
            return handleBurnBalance(request, env);
        }
        // Manueller Balance-Eintrag (wenn API dauerhaft blockt)
        if (pathname === '/burn/set' && request.method === 'POST') {
            return handleBurnSet(request, env);
        }
        // Marketplace endpoints
        if (pathname === '/market/items') {
            return handleMarketItems(request, env);
        }
        if (pathname.startsWith('/market/item/')) {
            return handleMarketItem(request, env, pathname);
        }
        if (pathname === '/market/list') {
            return handleMarketList(request, env);
        }
        if (pathname === '/market/buy') {
            return handleMarketBuy(request, env);
        }

        // Nur POST
        if (request.method !== 'POST') {
            return json({ error: 'POST only' }, 405);
        }

        // Rate Limit (KV optional — wenn nicht konfiguriert, kein Limit)
        // TODO: RATE_LIMIT_KV als KV Namespace Binding setzen für Produktion
        if (env.RATE_LIMIT_KV) {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const key = `rate:${ip}`;
            const count = parseInt(await env.RATE_LIMIT_KV.get(key) || '0');
            if (count >= RATE_LIMIT) {
                return json({ error: 'Zu viele Anfragen. Versuch es in einer Stunde nochmal.' }, 429);
            }
            await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
        }

        if (pathname === '/craft') {
            return handleCraft(request, env);
        }

        const apiKey = env['schatzinsel-requesty'] || env.API_KEY;
        if (!apiKey) {
            return json({ error: 'Server nicht konfiguriert (kein API Key)' }, 500);
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return json({ error: 'Ungültiger Request-Body' }, 400);
        }

        // Sicherheit: max Tokens begrenzen, kein Streaming
        body.max_tokens = Math.min(body.max_tokens || 300, 500);
        body.stream = false;

        // Meta-Kontext für Logging
        const meta = {
            ip:      request.headers.get('cf-connecting-ip') || 'unknown',
            country: request.headers.get('cf-ipcountry') || 'unknown',
            ts:      new Date().toISOString(),
        };

        // Fire & forget — Logging läuft parallel, blockiert nichts
        logAsync(body, meta, env).catch(() => {});

        // Direkt → Requesty (kritischer Pfad)
        try {
            // _feynman nicht an Requesty weiterschicken
            const apiBody = { ...body };
            delete apiBody._feynman;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(apiBody),
            });

            const data = await response.json();
            return json(data, response.status);

        } catch (e) {
            return json({ error: 'Proxy-Fehler: ' + e.message }, 500);
        }
    },
};

// --- Craft Endpoint ---

async function handleCraft(request, env) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return json({ error: 'Ungültiger Request-Body' }, 400);
    }

    const { a, b, discoverer } = body;
    if (!a || !b) {
        return json({ error: 'a und b sind erforderlich' }, 400);
    }

    // Fix 1: Prompt Injection — Materialbezeichnungen validieren
    const MAX_MAT_LEN = 40;
    const SAFE_MAT = /^[\p{L}\p{N}\s\-_]+$/u;
    if (!SAFE_MAT.test(a) || !SAFE_MAT.test(b) || a.length > MAX_MAT_LEN || b.length > MAX_MAT_LEN) {
        return json({ error: 'Ungültige Materialbezeichnung' }, 400);
    }

    const apiKey = env['schatzinsel-requesty'] || env.API_KEY;
    if (!apiKey) {
        return json({ error: 'Server nicht konfiguriert (kein API Key)' }, 500);
    }

    // Fix 4: Discoverer validieren
    const safeDiscoverer = typeof discoverer === 'string' ? discoverer.trim().slice(0, 30) : 'Anonym';

    // Fix 3: Cache-Keys normalisieren (trim + lowercase)
    const na = a.trim().toLowerCase();
    const nb = b.trim().toLowerCase();
    const pair = [na, nb].sort().join('+');
    const cacheKey = `craft:${pair}`;

    // Cache-Check (KV optional)
    if (env.CRAFT_KV) {
        const cached = await env.CRAFT_KV.get(cacheKey, 'json');
        if (cached) {
            return json({ ...cached, fromCache: true });
        }
    }

    // LLM-Aufruf via Requesty
    const prompt = `Crafting-System für ein Kinderspiel. Ein Kind kombiniert "${na}" + "${nb}".
Was entsteht? Antworte NUR mit diesem JSON, kein anderer Text:
{"emoji": "...", "name": "...", "color": "#hex", "border": "#hex"}

Regeln:
- name: EIN deutsches Wort, max 12 Buchstaben. Kein Doppelwort, keine Wiederholung der Zutaten.
- emoji: GENAU EIN einzelnes Emoji-Zeichen. Kein Paar, keine Kombination. Muss zum Ergebnis passen, NICHT zu einer Zutat.
- color: Die Hauptfarbe des Ergebnisses als Hex.
- border: Etwas dunkler als color.
- Kindgerecht. Kein Grusel, keine Gewalt, nichts Trauriges.
- Kreativ aber logisch: Feuer+Wasser=Dampf, nicht Feuerwasser.
- Wu Xing (五行): Holz=Wachstum/Expansion→grün, Feuer=Energie/Aktion→rot, Erde=Wandlung/Nährend→braun, Metall=Reife/Reinheit→silber, Wasser=Ruhe/Fließen→blau. Spiegle diese Energie im Ergebnis wenn eines der Elemente beteiligt ist.

Beispiele:
fire+water → {"emoji":"💨","name":"Dampf","color":"#D5D8DC","border":"#AEB6BF"}
earth+fire → {"emoji":"🧱","name":"Stein","color":"#95A5A6","border":"#7F8C8D"}
dragon+ice → {"emoji":"🐲","name":"Eisdrache","color":"#87CEEB","border":"#5DADE2"}
wood+water → {"emoji":"🌿","name":"Sprössling","color":"#27AE60","border":"#1E8449"}
metal+fire → {"emoji":"⚗️","name":"Schmelze","color":"#E8DAEF","border":"#A569BD"}`;

    let result;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'anthropic/claude-haiku-4-5-20251001',
                max_tokens: 100,
                temperature: 0.3,
                stream: false,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        // Fix 5: LLM response.ok prüfen
        if (!response.ok) {
            return json({ error: 'LLM nicht erreichbar' }, 502);
        }
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || '';
        const match = content.match(/{[\s\S]*}/);
        if (!match) {
            return json({ error: 'LLM hat kein gültiges JSON zurückgegeben', raw: content }, 502);
        }
        result = JSON.parse(match[0]);
    } catch (e) {
        // Fix 6: Keine Error-Details an den Client
        return json({ error: 'Craft-Fehler' }, 500);
    }

    // In KV speichern
    const entry = {
        emoji:      [...(result.emoji || '✨')][0],
        name:       result.name       || 'Unbekannt',
        color:      result.color      || '#cccccc',
        border:     result.border     || '#999999',
        a,
        b,
        discoverer: safeDiscoverer,
        created:    new Date().toISOString(),
    };

    if (env.CRAFT_KV) {
        await env.CRAFT_KV.put(cacheKey, JSON.stringify(entry), {
            metadata: { name: entry.name, emoji: entry.emoji, color: entry.color, border: entry.border, a, b, discoverer: safeDiscoverer, created: entry.created }
        });
    }

    // D1 Metrics (fire & forget)
    if (env.METRICS_DB) {
        env.METRICS_DB.prepare(
            'INSERT INTO craft_events (input_a, input_b, result, source, cached) VALUES (?, ?, ?, ?, ?)'
        ).bind(na, nb, entry.name, 'llm', 0).run().catch(() => {});
    }

    return json({ ...entry, fromCache: false });
}

// --- Discoveries Endpoint ---

async function handleDiscoveries(env) {
    if (!env.CRAFT_KV) return json({ error: 'KV nicht konfiguriert' }, 500);

    // KV.list gibt Keys + Metadata in einem Call — kein get() nötig
    const list = await env.CRAFT_KV.list({ prefix: 'craft:' });
    const discoveries = [];
    const needFetch = [];

    for (const key of list.keys) {
        if (key.metadata && key.metadata.name) {
            discoveries.push(key.metadata);
        } else {
            needFetch.push(key.name);
        }
    }

    // Fallback: alte Einträge ohne Metadata parallel holen
    if (needFetch.length > 0) {
        const values = await Promise.all(
            needFetch.map(k => env.CRAFT_KV.get(k, 'json'))
        );
        for (const val of values) {
            if (val) discoveries.push(val);
        }
    }

    // Neueste zuerst
    discoveries.sort((a, b) => (b.created || '').localeCompare(a.created || ''));

    // Entdecker-Ranking
    const ranking = {};
    for (const d of discoveries) {
        const name = d.discoverer || 'Anonym';
        ranking[name] = (ranking[name] || 0) + 1;
    }

    return json({
        total: discoveries.length,
        ranking,
        recent: discoveries.slice(0, 20),
    });
}

// --- Schatzkarte Endpoint ---
// PUT /karte/:code → Stats speichern (24h TTL)
// GET /karte/:code → Stats lesen (anonym, kein Auth)

const KARTE_WORTLISTE = [
    'meer','wald','blitz','stern','mond','berg','wolf','adler','fuchs','hase',
    'wind','stein','gold','silber','kupfer','eisen','feuer','eis','sand','koralle',
    'palme','anker','segel','kompass','leuchtturm','muschel','perle','krabbe','wal','delfin',
    'donner','nebel','tau','frost','glut','asche','flamme','funke','blume','moos',
    'pilz','wurzel','krone','schwert','schild','turm','brücke','quelle','höhle','riff',
    'möwe','rabe','eule','falke','bär','hirsch','lachs','otter','igel','marder',
    'eiche','birke','tanne','buche','linde','weide','efeu','farn','klee','distel',
    'rubin','saphir','smaragd','opal','jade','bernstein','granit','basalt','quarz','marmor',
    'harfe','trommel','flöte','glocke','horn','pfeife','laute','geige','orgel','pauke',
    'drache','phoenix','greif','einhorn','hydra','sphinx','troll','zwerg','riese','elfe',
    'orbit','komet','nova','pulsar','nebula','quasar','aurora','zenit','nadir','eklipse',
    'morgen','abend','dämmerung','mittag','stunde','welle','strömung','brandung','flut','ebbe',
    'friede','kraft','mut','treue','ehre','stolz','freude','hoffnung','gnade','weisheit',
    'zimt','honig','minze','salbei','thymian','vanille','safran','nelke','ingwer','kakao',
    'atlas','chronik','fabel','legende','mythos','saga','rune','siegel','chiffre','echo',
    'tinten','feder','pergament','papyrus','tafel','kreide','pinsel','leinwand','rahmen','skizze',
    'amboss','zange','meißel','hobel','säge','nadel','spindel','webstuhl','anker','lot',
    'flagge','banner','wimpel','fackel','laterne','kerze','ampel','spiegel','prisma','linse',
    'garten','wiese','heide','steppe','tundra','oase','lagune','fjord','delta','bucht',
    'ziegel','balken','giebel','pfeiler','bogen','kuppel','zinne','erker','söller','graben',
    'reise','pfad','fährte','spur','kreuzung','hafen','kai','pier','mole','steg',
    'herbst','lenz','ernte','saat','knospe','trieb','laub','rinde','harz','pollen',
    'kobalt','titan','neon','argon','helium','lithium','bor','carbon','phosphor','schwefel',
    'takt','rhythmus','melodie','akkord','terz','quinte','oktave','synkope','kadenz','coda',
    'anmut','eleganz','würde','demut','güte','milde','wärme','tiefe','stille','klarheit',
    'dampf','rauch','dunst','schaum','staub','splitter',
]; // 256 Wörter

function generateKarteCode() {
    const indices = new Uint8Array(4);
    crypto.getRandomValues(indices);
    return Array.from(indices).map(i => KARTE_WORTLISTE[i]).join('-');
}

async function handleKarte(request, env) {
    if (!env.CRAFT_KV) return json({ error: 'KV nicht konfiguriert' }, 500);

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean); // ['karte', 'meer-wald-blitz-stern']
    const code = parts[1] || null;

    // POST /karte → neuen Code generieren + Stats speichern
    if (request.method === 'POST' && !code) {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Ungültiger Body' }, 400); }

        const newCode = generateKarteCode();
        const karte = {
            blocks:    body.blocks || 0,
            shells:    body.shells || 0,
            quests:    body.quests || 0,
            minutes:   body.minutes || 0,
            materials: body.materials || 0,
            player:    (body.player || 'Anonym').slice(0, 20),
            created:   new Date().toISOString(),
        };

        await env.CRAFT_KV.put(`karte:${newCode}`, JSON.stringify(karte), {
            expirationTtl: 60 * 60 * 24 // 24h TTL — wie eine Schatzkarte die im Regen verblasst
        });

        return json({ ok: true, code: newCode, expires: '24h' }, 201, corsHeaders());
    }

    // PUT /karte/:code → Stats aktualisieren (Code muss existieren)
    if (request.method === 'PUT' && code) {
        const existing = await env.CRAFT_KV.get(`karte:${code}`, 'json');
        if (!existing) return json({ error: 'Schatzkarte nicht gefunden' }, 404);

        let body;
        try { body = await request.json(); } catch { return json({ error: 'Ungültiger Body' }, 400); }

        const updated = {
            ...existing,
            blocks:    body.blocks ?? existing.blocks,
            shells:    body.shells ?? existing.shells,
            quests:    body.quests ?? existing.quests,
            minutes:   body.minutes ?? existing.minutes,
            materials: body.materials ?? existing.materials,
            updated:   new Date().toISOString(),
        };

        await env.CRAFT_KV.put(`karte:${code}`, JSON.stringify(updated), {
            expirationTtl: 60 * 60 * 24
        });

        return json({ ok: true }, 200, corsHeaders());
    }

    // GET /karte/:code → Stats lesen (anonym, kein Auth nötig)
    if (request.method === 'GET' && code) {
        const karte = await env.CRAFT_KV.get(`karte:${code}`, 'json');
        if (!karte) return json({ error: 'Schatzkarte nicht gefunden oder abgelaufen' }, 404);
        return json(karte, 200, corsHeaders());
    }

    return json({ error: 'Ungültiger Request' }, 400);
}

// --- Bugs Endpoint ---

async function handleBugs(request, env) {
    if (!env.CRAFT_KV) return json({ error: 'KV nicht konfiguriert' }, 500);

    // POST = Bug melden, GET = Bugs lesen
    if (request.method === 'POST') {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return json({ error: 'Ungültiger Request-Body' }, 400);
        }

        const bug = {
            msg:       (body.msg || '').slice(0, 500),
            page:      (body.page || '').slice(0, 100),
            ua:        (request.headers.get('user-agent') || '').slice(0, 200),
            screen:    (body.screen || '').slice(0, 30),
            reporter:  (body.reporter || 'Anonym').slice(0, 30),
            created:   new Date().toISOString(),
        };

        const key = `bug:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await env.CRAFT_KV.put(key, JSON.stringify(bug), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 Tage

        return json({ ok: true, id: key });
    }

    // GET = alle Bugs lesen — nur mit Secret-Key
    const url = new URL(request.url);
    const secret = url.searchParams.get('key');
    if (!secret || secret !== (env.BUGS_SECRET || '')) {
        return json({ error: 'Nicht autorisiert' }, 401);
    }
    const list = await env.CRAFT_KV.list({ prefix: 'bug:' });
    const values = await Promise.all(
        list.keys.map(async key => {
            const val = await env.CRAFT_KV.get(key.name, 'json');
            return val ? { id: key.name, ...val } : null;
        })
    );
    const bugs = values.filter(Boolean);
    bugs.sort((a, b) => (b.created || '').localeCompare(a.created || ''));

    return json({ total: bugs.length, bugs });
}

// --- Metrics Endpoint ---

async function handleMetrics(request, env) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);

    const url = new URL(request.url);
    const table = url.searchParams.get('table') || 'sessions';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    const allowed = ['sessions', 'craft_events', 'agent_metrics', 'npc_chats'];
    if (!allowed.includes(table)) return json({ error: 'Ungültige Tabelle' }, 400);

    const rows = await env.METRICS_DB.prepare(
        `SELECT * FROM ${table} ORDER BY ts DESC LIMIT ?`
    ).bind(limit).all();

    return json({ table, count: rows.results.length, rows: rows.results });
}

// --- Metrics Ingest Endpoint ---

async function handleMetricsIngest(request, env) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    let body;
    try { body = await request.json(); } catch (e) {
        return json({ error: 'Ungültiger Request-Body' }, 400);
    }

    const { type } = body;

    if (type === 'session') {
        // neutrino_score: Spalte wird per ALTER TABLE hinzugefügt wenn sie fehlt
        // SQLite ignoriert doppeltes ALTER TABLE nicht, daher try/catch
        try {
            await env.METRICS_DB.prepare(
                `ALTER TABLE sessions ADD COLUMN neutrino_score REAL DEFAULT NULL`
            ).run();
        } catch (e) { /* Spalte existiert bereits — OK */ }

        await env.METRICS_DB.prepare(
            `INSERT INTO sessions (player_name, country, duration_s, blocks_placed, blocks_harvested,
             quests_completed, crafts_total, crafts_llm, chat_messages, unique_materials, engagement_score, neutrino_score)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            body.player_name || 'Anonym', body.country || 'unknown',
            body.duration_s || 0, body.blocks_placed || 0, body.blocks_harvested || 0,
            body.quests_completed || 0, body.crafts_total || 0, body.crafts_llm || 0,
            body.chat_messages || 0, body.unique_materials || 0, body.engagement_score || 0,
            typeof body.neutrino_score === 'number' ? body.neutrino_score : null
        ).run();
        return json({ ok: true, type: 'session' });
    }

    if (type === 'craft') {
        await env.METRICS_DB.prepare(
            `INSERT INTO craft_events (input_a, input_b, result, source, cached)
             VALUES (?, ?, ?, ?, ?)`
        ).bind(body.a || '', body.b || '', body.result || '', body.source || 'recipe', body.cached ? 1 : 0).run();
        return json({ ok: true, type: 'craft' });
    }

    if (type === 'npc_chat') {
        await env.METRICS_DB.prepare(
            `INSERT INTO npc_chats (npc_id, provider, tokens_prompt, tokens_completion, temperature, latency_ms)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
            body.npc_id || '', body.provider || 'api',
            body.tokens_prompt || 0, body.tokens_completion || 0,
            body.temperature || 0.7, body.latency_ms || 0
        ).run();
        return json({ ok: true, type: 'npc_chat' });
    }

    return json({ error: 'Unbekannter type. Erlaubt: session, craft, npc_chat' }, 400);
}

// --- Logging ---

async function logAsync(body, meta, env) {
    const mode = env.LOGGING_MODE || 'n8n';

    if (mode === 'n8n' && env.N8N_WEBHOOK_URL) {
        await fetch(env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, _meta: meta }),
        });
        return;
    }

    if (mode === 'direct') {
        await logAirtable(body, meta, env);
    }
}

async function logAirtable(body, meta, env) {
    if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) return;

    const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME || 'Feynman Sessions');
    const lastMessage = (body.messages || []).at(-1)?.content || '';
    const f = body._feynman || {};

    await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        },
        body: JSON.stringify({
            fields: {
                Timestamp:       meta.ts,
                Country:         meta.country,
                Message:         lastMessage,
                CharacterID:     f.characterId     || 'unknown',
                SessionDuration: f.sessionDuration || 0,
                BlocksPlaced:    f.blocksPlaced    || 0,
                QuestsCompleted: f.questsCompleted || 0,
                ChatUsed:        f.chatUsed        === true,
                EngagementScore: f.engagementScore || 0,
                UniqueMaterials: f.uniqueMaterials || 0,
            },
        }),
    });
}

// --- TTS (Text-to-Speech via Requesty → OpenAI) ---

async function handleTTS(request, env) {
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    // OpenAI TTS direkt (Requesty hat kein /audio/speech)
    const apiKey = env.OPENAI_TTS_KEY || env.OPENAI_API_KEY;
    if (!apiKey) return json({ error: 'Kein OpenAI TTS-Key (OPENAI_TTS_KEY) konfiguriert' }, 500);

    let body;
    try { body = await request.json(); } catch (e) {
        return json({ error: 'Ungültiger Body' }, 400);
    }

    const text = (body.text || '').slice(0, 500); // Max 500 Zeichen pro Request
    if (!text) return json({ error: 'text benötigt' }, 400);

    // Stimmen-Mapping: Charakter → OpenAI Voice
    // alloy=neutral, echo=tief, fable=britisch/warm, onyx=dunkel, nova=warm, shimmer=hell
    const voiceMap = {
        lanz: 'onyx',       // tief, seriös — der Moderator
        precht: 'fable',    // eloquent, nachdenklich — der Philosoph
        merz: 'echo',       // sachlich, tief — der Kanzler
        trump: 'alloy',     // neutral (accent kommt aus dem Text)
        musk: 'shimmer',    // hell, technisch — der Disruptor
        mephisto: 'onyx',   // dunkel, samtig — der Teufel
        default: 'nova',    // warm, freundlich — Erzähler
    };
    const voice = voiceMap[body.voice] || voiceMap.default;
    const speed = body.speed || 1.0;

    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voice,
                speed: Math.max(0.5, Math.min(2.0, speed)),
                response_format: 'mp3',
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            return json({ error: 'TTS fehlgeschlagen: ' + err }, response.status);
        }

        // Audio direkt durchreichen
        return new Response(response.body, {
            headers: {
                'Content-Type': 'audio/mpeg',
                ...corsHeaders(),
            },
        });
    } catch (e) {
        return json({ error: 'TTS-Fehler: ' + e.message }, 500);
    }
}

// --- Marketplace ---

async function handleMarketItems(request, env) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    try {
        await createMarketTable(env);
        const rows = await env.METRICS_DB.prepare(
            `SELECT * FROM marketplace WHERE status = 'active' ORDER BY created_at DESC LIMIT ?`
        ).bind(limit).all();
        return json({ items: rows.results || [] });
    } catch (e) {
        return json({ error: e.message }, 500);
    }
}

async function handleMarketItem(request, env, pathname) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);
    const id = pathname.split('/').pop();

    try {
        const row = await env.METRICS_DB.prepare(
            `SELECT * FROM marketplace WHERE id = ?`
        ).bind(id).first();
        return json({ item: row || null });
    } catch (e) {
        return json({ error: e.message }, 500);
    }
}

async function handleMarketList(request, env) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    let body;
    try { body = await request.json(); } catch (e) {
        return json({ error: 'Ungültiger Body' }, 400);
    }

    if (!body.material_id || !body.name) {
        return json({ error: 'material_id und name benötigt' }, 400);
    }

    // Max 10 aktive Listings pro Seller
    const sellerAddr = body.seller_addr || 'anonym';
    try {
        const count = await env.METRICS_DB.prepare(
            `SELECT COUNT(*) as cnt FROM marketplace WHERE seller_addr = ? AND status = 'active'`
        ).bind(sellerAddr).first();
        if (count && count.cnt >= 10) {
            return json({ error: 'Maximal 10 aktive Angebote pro Wallet' }, 429);
        }
    } catch (e) {
        if (e.message && e.message.includes('no such table')) {
            await createMarketTable(env);
        }
    }

    const id = crypto.randomUUID();
    await env.METRICS_DB.prepare(
        `INSERT INTO marketplace (id, material_id, name, emoji, description, price_mmx, price_xch, price_glut,
         seller_addr, seller_mmx, seller_xch, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    ).bind(
        id, body.material_id, body.name, body.emoji || '✨', body.description || '',
        body.price_mmx || 0, body.price_xch || 0, body.price_glut || 0,
        sellerAddr, body.seller_mmx || '', body.seller_xch || ''
    ).run();

    return json({ ok: true, id });
}

async function handleMarketBuy(request, env) {
    if (!env.METRICS_DB) return json({ error: 'D1 nicht konfiguriert' }, 500);
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    let body;
    try { body = await request.json(); } catch (e) {
        return json({ error: 'Ungültiger Body' }, 400);
    }

    if (!body.listing_id) return json({ error: 'listing_id benötigt' }, 400);

    // Status auf pending setzen
    const result = await env.METRICS_DB.prepare(
        `UPDATE marketplace SET status = 'pending', buyer_addr = ? WHERE id = ? AND status = 'active'`
    ).bind(body.buyer_addr || 'anonym', body.listing_id).run();

    if (result.meta.changes === 0) {
        return json({ error: 'Angebot nicht verfügbar oder bereits verkauft' }, 404);
    }

    return json({ ok: true, listing_id: body.listing_id, status: 'pending' });
}

async function createMarketTable(env) {
    await env.METRICS_DB.prepare(
        'CREATE TABLE IF NOT EXISTS marketplace (id TEXT PRIMARY KEY, material_id TEXT NOT NULL, name TEXT NOT NULL, emoji TEXT DEFAULT \'✨\', description TEXT DEFAULT \'\', price_mmx REAL DEFAULT 0, price_xch REAL DEFAULT 0, price_glut INTEGER DEFAULT 0, seller_addr TEXT DEFAULT \'anonym\', seller_mmx TEXT DEFAULT \'\', seller_xch TEXT DEFAULT \'\', buyer_addr TEXT DEFAULT \'\', status TEXT DEFAULT \'active\', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    ).run();
}

// --- Burn-Balance Proxy ---
// mmxplorer + spacescan blocken direkte Browser-Requests (Cloudflare Challenge).
// Worker-zu-API geht ohne Challenge. Cached 60s.

async function handleBurnBalance(request, env) {
    const url = new URL(request.url);
    const mmxAddr = url.searchParams.get('mmx') || 'mmx1dvufsshkk2vyujjs2uwarsk99as8qp4he7srf529yu0ulhm904jskmthxq';

    const results = { mmx: null, ts: Date.now() };

    // 1. KV-Cache prüfen (manuell gesetzt oder letzter erfolgreicher API-Call)
    try {
        const kvMmx = await env.CRAFT_KV.get('burn:mmx', 'json');
        if (kvMmx) results.mmx = kvMmx.balance;
    } catch (e) { /* KV nicht verfügbar */ }

    // 2. API versuchen — überschreibt KV wenn erfolgreich
    try {
        const mmxRes = await fetch('https://api.mmxplorer.com/wapi/address?id=' + mmxAddr, {
            headers: { 'User-Agent': 'SchatzinselWorker/1.0' }
        });
        if (mmxRes.ok) {
            const data = await mmxRes.json();
            if (data && data.balances) {
                results.mmx = (data.balances['MMX'] || data.balance || 0) / 10000;
                await env.CRAFT_KV.put('burn:mmx', JSON.stringify({
                    balance: results.mmx, ts: Date.now()
                }), { expirationTtl: 86400 });
            }
        }
    } catch (e) { /* API nicht erreichbar — KV-Fallback reicht */ }

    return json(results, 200, {
        ...corsHeaders(),
        'Cache-Control': 'public, max-age=60'
    });
}

// POST /burn/set — manueller Balance-Eintrag via Secret-Key
async function handleBurnSet(request, env) {
    const url = new URL(request.url);
    const secret = url.searchParams.get('key');
    if (!secret || secret !== (env.BUGS_SECRET || '')) {
        return json({ error: 'Nicht autorisiert' }, 401);
    }
    const body = await request.json();
    await env.CRAFT_KV.put('burn:mmx', JSON.stringify({
        balance: body.mmx || 0, ts: Date.now()
    }), { expirationTtl: 86400 });
    return json({ ok: true });
}

// --- Helpers ---

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(),
        },
    });
}
