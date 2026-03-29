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

        // Nur POST
        if (request.method !== 'POST') {
            return json({ error: 'POST only' }, 405);
        }

        // Rate Limit (Cloudflare KV optional, sonst skip)
        if (env.RATE_LIMIT_KV) {
            const ip = request.headers.get('cf-connecting-ip') || 'unknown';
            const key = `rate:${ip}`;
            const count = parseInt(await env.RATE_LIMIT_KV.get(key) || '0');
            if (count >= RATE_LIMIT) {
                return json({ error: 'Zu viele Anfragen. Versuch es in einer Stunde nochmal.' }, 429);
            }
            await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
        }

        const apiKey = env.API_KEY;
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
