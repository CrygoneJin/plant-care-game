// === WORKER-SUPABASE — Cloud-Save-Endpunkte ===
// Separates Modul, damit Merge-Konflikte mit dem großen worker.js klein bleiben.
// Integration: worker.js importiert { handleSupabaseSave, handleSupabaseLoad }
// und ruft sie für /save bzw. /save/list.
//
// Secrets (via `wrangler secret put`):
//   SUPABASE_URL         — z.B. https://xxxxx.supabase.co
//   SUPABASE_SERVICE_KEY — service_role JWT (NIE ins Frontend!)

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonOk(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS },
    });
}

function jsonErr(msg, status = 400) {
    return jsonOk({ error: msg }, status);
}

function checkEnv(env) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
        return 'Supabase nicht konfiguriert (SUPABASE_URL / SUPABASE_SERVICE_KEY fehlen)';
    }
    return null;
}

function sbHeaders(env, extra = {}) {
    return {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        ...extra,
    };
}

// Upsert Player by device_id, returns player row (with id).
async function ensurePlayer(env, deviceId, name) {
    const url = `${env.SUPABASE_URL}/rest/v1/players?on_conflict=device_id`;
    const body = [{ device_id: deviceId, name: name || null, last_seen_at: new Date().toISOString() }];
    const res = await fetch(url, {
        method: 'POST',
        headers: sbHeaders(env, {
            'Prefer': 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`player upsert failed (${res.status}): ${txt}`);
    }
    const rows = await res.json();
    if (!rows?.[0]?.id) throw new Error('player upsert: kein id zurueck');
    return rows[0];
}

// POST /save  { device_id, name?, slot?, payload }
export async function handleSupabaseSave(request, env) {
    const envErr = checkEnv(env);
    if (envErr) return jsonErr(envErr, 503);

    let body;
    try { body = await request.json(); }
    catch { return jsonErr('invalid json'); }

    const deviceId = (body.device_id || '').toString().trim();
    if (!deviceId || deviceId.length < 6) return jsonErr('device_id fehlt/zu kurz');
    const slot = (body.slot || 'autosave').toString().slice(0, 64);
    if (!body.payload || typeof body.payload !== 'object') return jsonErr('payload fehlt');
    // blocks_count ist generated column in saves — muss in payload existieren.
    if (typeof body.payload.blocks_count !== 'number') body.payload.blocks_count = 0;

    try {
        const player = await ensurePlayer(env, deviceId, body.name);
        const url = `${env.SUPABASE_URL}/rest/v1/saves?on_conflict=player_id,slot`;
        const saveRow = [{
            player_id: player.id,
            slot,
            payload: body.payload,
            updated_at: new Date().toISOString(),
        }];
        const res = await fetch(url, {
            method: 'POST',
            headers: sbHeaders(env, {
                'Prefer': 'resolution=merge-duplicates,return=representation',
            }),
            body: JSON.stringify(saveRow),
        });
        if (!res.ok) {
            const txt = await res.text();
            return jsonErr(`save upsert failed (${res.status}): ${txt}`, 502);
        }
        const rows = await res.json();
        return jsonOk({
            ok: true,
            player_id: player.id,
            slot,
            updated_at: rows?.[0]?.updated_at,
        });
    } catch (e) {
        return jsonErr(String(e?.message || e), 500);
    }
}

// GET /save?device_id=...&slot=...        → einzelner Slot
// GET /save?device_id=...&list=1          → alle Slots (ohne payload)
// GET /save/list?device_id=...            → alle Slots (ohne payload)
export async function handleSupabaseLoad(request, env) {
    const envErr = checkEnv(env);
    if (envErr) return jsonErr(envErr, 503);

    const url = new URL(request.url);
    const deviceId = (url.searchParams.get('device_id') || '').trim();
    if (!deviceId) return jsonErr('device_id fehlt');
    const slot = (url.searchParams.get('slot') || 'autosave').slice(0, 64);
    const wantList = url.pathname.endsWith('/list') || url.searchParams.get('list') === '1';

    try {
        // Player lookup (kein upsert beim Laden)
        const pRes = await fetch(
            `${env.SUPABASE_URL}/rest/v1/players?select=id&device_id=eq.${encodeURIComponent(deviceId)}`,
            { headers: sbHeaders(env) },
        );
        if (!pRes.ok) {
            const txt = await pRes.text();
            return jsonErr(`player lookup failed (${pRes.status}): ${txt}`, 502);
        }
        const players = await pRes.json();
        if (!players?.[0]?.id) {
            return jsonOk({ found: false, slots: [] });
        }
        const playerId = players[0].id;

        if (wantList) {
            const lRes = await fetch(
                `${env.SUPABASE_URL}/rest/v1/saves?select=slot,updated_at,blocks_count&player_id=eq.${playerId}&order=updated_at.desc`,
                { headers: sbHeaders(env) },
            );
            if (!lRes.ok) {
                const txt = await lRes.text();
                return jsonErr(`list failed (${lRes.status}): ${txt}`, 502);
            }
            const slots = await lRes.json();
            return jsonOk({ found: true, player_id: playerId, slots });
        }

        const sRes = await fetch(
            `${env.SUPABASE_URL}/rest/v1/saves?select=slot,payload,updated_at&player_id=eq.${playerId}&slot=eq.${encodeURIComponent(slot)}&limit=1`,
            { headers: sbHeaders(env) },
        );
        if (!sRes.ok) {
            const txt = await sRes.text();
            return jsonErr(`save fetch failed (${sRes.status}): ${txt}`, 502);
        }
        const saves = await sRes.json();
        if (!saves?.[0]) {
            return jsonOk({ found: false, player_id: playerId, slot });
        }
        return jsonOk({
            found: true,
            player_id: playerId,
            slot: saves[0].slot,
            payload: saves[0].payload,
            updated_at: saves[0].updated_at,
        });
    } catch (e) {
        return jsonErr(String(e?.message || e), 500);
    }
}

// CORS preflight helper
export function handleSupabaseOptions() {
    return new Response(null, { status: 204, headers: CORS });
}
