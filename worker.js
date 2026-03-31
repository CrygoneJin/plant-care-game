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
//    AIRTABLE_BASE_ID    = app...       (nur bei LOGGING_MODE=direct)
//    AIRTABLE_TABLE_NAME = Feynman Sessions
// 4. Deploy
// 5. In config.js PROXY auf die Worker-URL setzen
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
        if (pathname === '/bugs') {
            return handleBugs(request, env);
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
        await env.CRAFT_KV.put(cacheKey, JSON.stringify(entry));
    }

    return json({ ...entry, fromCache: false });
}

// --- Discoveries Endpoint ---

async function handleDiscoveries(env) {
    if (!env.CRAFT_KV) return json({ error: 'KV nicht konfiguriert' }, 500);

    const list = await env.CRAFT_KV.list({ prefix: 'craft:' });
    const discoveries = [];

    for (const key of list.keys) {
        const val = await env.CRAFT_KV.get(key.name, 'json');
        if (val) discoveries.push(val);
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
    const bugs = [];
    for (const key of list.keys) {
        const val = await env.CRAFT_KV.get(key.name, 'json');
        if (val) bugs.push({ id: key.name, ...val });
    }
    bugs.sort((a, b) => (b.created || '').localeCompare(a.created || ''));

    return json({ total: bugs.length, bugs });
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
