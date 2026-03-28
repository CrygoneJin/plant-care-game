// Cloudflare Worker — API-Proxy für Insel-Architekt
// Key bleibt serverseitig. User braucht keinen eigenen.
//
// Setup:
// 1. https://dash.cloudflare.com → Workers & Pages → Create
// 2. Code reinkopieren
// 3. Environment Variable setzen: LANGDOCK_API_KEY = sk-...
// 4. Deploy
// 5. In chat.js PROXY_URL auf die Worker-URL setzen
//
// Free Tier: 100k Requests/Tag. Reicht für Demos.

const LANGDOCK_URL = 'https://api.langdock.com/openai/v1/chat/completions';

// Rate Limit: max Requests pro IP pro Stunde
const RATE_LIMIT = 60;
const RATE_WINDOW = 3600; // Sekunden

export default {
    async fetch(request, env) {
        // CORS Preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders(),
            });
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

        // API Key aus Environment
        const apiKey = env.LANGDOCK_API_KEY;
        if (!apiKey) {
            return json({ error: 'Server nicht konfiguriert (kein API Key)' }, 500);
        }

        try {
            const body = await request.json();

            // Sicherheit: nur erlaubte Modelle, max Tokens begrenzen
            body.max_tokens = Math.min(body.max_tokens || 300, 500);
            body.stream = false; // Kein Streaming im Proxy

            const response = await fetch(LANGDOCK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            return json(data, response.status);
        } catch (e) {
            return json({ error: 'Proxy-Fehler: ' + e.message }, 500);
        }
    },
};

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
