// Insel Chat Proxy — Cloudflare Worker → n8n Gateway
// CF = Edge (CORS, Validierung), n8n = Gehirn (Routing, Logging, API Key)
// Fallback: direkt zu Langdock wenn n8n down

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: CORS_HEADERS });
    }

    try {
      const body = await request.json();

      // Basis-Validierung am Edge
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return Response.json({ error: 'messages required' }, { status: 400, headers: CORS_HEADERS });
      }

      // Sanitize am Edge (Defense in Depth — n8n validiert auch nochmal)
      const sanitized = {
        model: body.model || 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(body.max_tokens || 150, 300),
        charId: body.charId || 'maus',
        messages: body.messages.slice(-10).map(m => ({
          role: ['user', 'assistant', 'system'].includes(m.role) ? m.role : 'user',
          content: String(m.content || '').slice(0, 500),
        })),
      };

      // 80% Cloudflare direkt (schnell), 20% n8n Gateway (Logging, Analytics)
      const useN8n = env.N8N_WEBHOOK_URL && Math.random() < 0.2;

      if (useN8n) {
        try {
          const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitized),
          });

          if (n8nResponse.ok) {
            const data = await n8nResponse.json();
            return Response.json(data, { headers: CORS_HEADERS });
          }
          // n8n error → fallback to direct
        } catch (e) {
          // n8n down → fallback to direct
        }
      }

      // Route 2: Direkt zu Langdock (Fallback oder wenn kein n8n)
      if (!env.LANGDOCK_KEY) {
        return Response.json({ error: 'No backend configured' }, { status: 503, headers: CORS_HEADERS });
      }

      const response = await fetch('https://api.langdock.com/openai/eu/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.LANGDOCK_KEY}`,
        },
        body: JSON.stringify({
          model: sanitized.model,
          max_tokens: sanitized.max_tokens,
          messages: sanitized.messages,
        }),
      });

      const data = await response.json();
      return Response.json(data, { status: response.status, headers: CORS_HEADERS });

    } catch (err) {
      return Response.json(
        { error: 'Proxy error', message: err.message },
        { status: 502, headers: CORS_HEADERS }
      );
    }
  },
};
