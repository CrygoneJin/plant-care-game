// Cloudflare Worker — WebSocket-Proxy für Gemini Live API
// Browser ↔ Worker ↔ Gemini BidiGenerateContent
//
// Setup:
// 1. wrangler.toml: siehe unten
// 2. Secret setzen: wrangler secret put GEMINI_API_KEY
// 3. Deploy: wrangler deploy -c wrangler-voice.toml
//
// wrangler-voice.toml:
//   name = "schatzinsel-voice"
//   main = "gemini-voice-worker.js"
//   compatibility_date = "2026-03-29"
//   [durable_objects]
//   bindings = [{ name = "VOICE_PROXY", class_name = "VoiceProxy" }]
//   [[migrations]]
//   tag = "v1"
//   new_classes = ["VoiceProxy"]

const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const ALLOWED_ORIGINS = [
  'https://schatzinsel.app',
  'https://www.schatzinsel.app',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
];

const MAX_CONCURRENT = 5;

// Global connection counter (per isolate — nicht perfekt, aber reicht)
let activeConnections = 0;

// --- Entrypoint ---

export default {
  async fetch(request, env) {
    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);

    // Health-Check
    if (url.pathname === '/health') {
      return json({ ok: true, connections: activeConnections, max: MAX_CONCURRENT }, 200, request);
    }

    // WebSocket-Upgrade nur auf /ws
    if (url.pathname !== '/ws') {
      return json({ error: 'Nur /ws ist verfügbar' }, 404, request);
    }

    const upgrade = request.headers.get('Upgrade');
    if (!upgrade || upgrade.toLowerCase() !== 'websocket') {
      return json({ error: 'WebSocket-Upgrade erforderlich' }, 426, request);
    }

    // Origin prüfen
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.some(o => origin.startsWith(o)) && origin !== '') {
      return json({ error: 'Origin nicht erlaubt' }, 403, request);
    }

    // API Key prüfen
    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Server nicht konfiguriert (kein GEMINI_API_KEY)' }, 500, request);
    }

    // Rate Limit
    if (activeConnections >= MAX_CONCURRENT) {
      return json({ error: 'Zu viele Verbindungen. Versuch es gleich nochmal.' }, 429, request);
    }

    // Durable Object für stabile bidirektionale Verbindung
    const id = env.VOICE_PROXY.newUniqueId();
    const stub = env.VOICE_PROXY.get(id);
    return stub.fetch(request);
  },
};

// --- Durable Object: hält beide WebSocket-Verbindungen ---

export class VoiceProxy {
  constructor(state, env) {
    this.env = env;
    this.clientWs = null;
    this.geminiWs = null;
    this.closed = false;
  }

  async fetch(request) {
    // WebSocket-Paar für den Client
    const [client, server] = Object.values(new WebSocketPair());

    server.accept();
    this.clientWs = server;
    activeConnections++;

    // Gemini-Verbindung aufbauen
    const apiKey = this.env.GEMINI_API_KEY;
    const geminiUrl = `${GEMINI_WS_URL}?key=${apiKey}`;

    try {
      const geminiResp = await fetch(geminiUrl, {
        headers: { Upgrade: 'websocket' },
      });

      const geminiWs = geminiResp.webSocket;
      if (!geminiWs) {
        this.cleanup('Gemini WebSocket-Verbindung fehlgeschlagen');
        return new Response('Gemini-Verbindung fehlgeschlagen', { status: 502 });
      }

      geminiWs.accept();
      this.geminiWs = geminiWs;

      // Browser → Gemini
      server.addEventListener('message', (evt) => {
        try {
          if (this.geminiWs?.readyState === WebSocket.READY_STATE_OPEN) {
            this.geminiWs.send(evt.data);
          }
        } catch (e) {
          this.cleanup('Fehler beim Senden an Gemini: ' + e.message);
        }
      });

      server.addEventListener('close', () => this.cleanup());
      server.addEventListener('error', () => this.cleanup());

      // Gemini → Browser
      geminiWs.addEventListener('message', (evt) => {
        try {
          if (this.clientWs?.readyState === WebSocket.READY_STATE_OPEN) {
            this.clientWs.send(evt.data);
          }
        } catch (e) {
          this.cleanup('Fehler beim Senden an Browser: ' + e.message);
        }
      });

      geminiWs.addEventListener('close', () => {
        this.cleanup('Gemini hat die Verbindung geschlossen');
      });

      geminiWs.addEventListener('error', () => {
        this.cleanup('Gemini-Verbindungsfehler');
      });

    } catch (e) {
      this.cleanup('Gemini-Verbindung fehlgeschlagen: ' + e.message);
      return new Response('Gemini-Verbindung fehlgeschlagen', { status: 502 });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  cleanup(reason) {
    if (this.closed) return;
    this.closed = true;
    activeConnections = Math.max(0, activeConnections - 1);

    const closeMsg = reason ? JSON.stringify({ type: 'error', message: reason }) : undefined;

    try {
      if (this.clientWs?.readyState === WebSocket.READY_STATE_OPEN) {
        if (closeMsg) this.clientWs.send(closeMsg);
        this.clientWs.close(1000, reason || 'Verbindung beendet');
      }
    } catch (_) {}

    try {
      if (this.geminiWs?.readyState === WebSocket.READY_STATE_OPEN) {
        this.geminiWs.close(1000, 'Client disconnected');
      }
    } catch (_) {}

    this.clientWs = null;
    this.geminiWs = null;
  }
}

// --- Helpers ---

function corsHeaders(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
    },
  });
}
