# Supabase Backend — Cloud-Save für Schatzinsel

**Status**: MVP-Code fertig, Supabase-Projekt muss noch angelegt werden.
**Scope**: Cloud-Save als Opt-In. Schatzinsel bleibt offline-first. Lokaler
Autosave in `localStorage` ist der Master — Supabase ist zusatz.

---

## Architektur

```
Browser (supabase-sync.js)
        │ POST /save   (device_id, slot, payload)
        │ GET  /save   (device_id, slot)
        ▼
Cloudflare Worker (worker.js → worker-supabase.js)
        │ service_role-Key (niemals im Frontend!)
        ▼
Supabase PostgREST (RLS: lockdown, nur service_role)
        │
        ▼
Postgres (players, saves, chat_log)
```

**Warum CF-Worker dazwischen?** Damit der `SUPABASE_SERVICE_KEY` niemals im
Browser landet. RLS auf Lockdown — ohne Worker kein Zugriff, auch nicht mit
anon-Key.

---

## Schema (Kurzfassung)

| Tabelle | Schlüssel | Zweck |
|---|---|---|
| `players` | `id` (uuid), `device_id` (unique text) | ein Kind pro Gerät, kein Login |
| `saves` | `(player_id, slot)` unique | eine Row pro Slot, `payload` jsonb, `blocks_count` generated |
| `chat_log` | `(player_id, ts)` index | Platzhalter für späteren Chat-Export |

RLS ist auf allen drei Tabellen aktiv mit **keiner** Policy → nur service_role
kommt rein. Details: `src/infra/supabase-schema.sql`.

Trigger `touch_player_last_seen` aktualisiert `players.last_seen_at` bei jedem
Save (nützlich für "Wer hat zuletzt gespielt").

---

## Setup-Schritte (einmalig, Till)

1. **Supabase-Projekt anlegen**
   - Region: `eu-central-1` (Frankfurt)
   - Name: `schatzinsel`
   - Datenbank-Passwort: generieren und in 1Password
   - Via MCP: `mcp__supabase__create_project` nach OAuth-Auth
   - Alternativ: dashboard.supabase.com → New Project

2. **Schema importieren**
   - SQL-Editor → Inhalt von `src/infra/supabase-schema.sql` pasten → Run
   - Oder via MCP: `apply_migration` mit Name `001_initial_schema`

3. **Advisors prüfen**
   - `get_advisors` (MCP) oder Dashboard → Database → Advisors
   - Ziel: 0 Security-Findings

4. **Worker-Secrets setzen**
   ```bash
   cd src/infra
   wrangler secret put SUPABASE_URL          # https://xxxx.supabase.co
   wrangler secret put SUPABASE_SERVICE_KEY  # service_role JWT aus Settings → API
   ```

5. **Worker deployen**
   ```bash
   wrangler deploy
   ```

6. **Smoke-Test**
   ```bash
   ops/tests/supabase-smoke.sh https://schatzinsel.hoffmeyer-zlotnik.workers.dev
   ```

---

## Frontend aktivieren (pro Browser)

Cloud-Sync ist default **aus**. Zum Aktivieren in DevTools:

```js
localStorage.setItem('insel-cloud-sync', '1');
window.INSEL_SUPA.setPlayerName('Oscar');
location.reload();
```

Dann:

```js
window.INSEL_SUPA.pushManual();   // sofort hochladen
window.INSEL_SUPA.pullLatest();   // neuesten Stand holen
window.INSEL_SUPA.listSaves();    // alle Slots listen
```

Der normale Autosave triggert `pushAutosave()` mit 3 s Debounce — solange
Cloud-Sync aktiv ist.

---

## API (Worker-Endpunkte)

### `POST /save`

```jsonc
// Request
{
  "device_id": "dev-abc-...",
  "name": "Oscar",            // optional
  "slot": "autosave",         // optional, default 'autosave'
  "payload": { ... }          // beliebige JSON, wird als jsonb gespeichert
}

// Response
{ "ok": true, "player_id": "uuid", "slot": "autosave", "updated_at": "..." }
```

### `GET /save?device_id=...&slot=...`

```jsonc
// Response (gefunden)
{ "found": true, "player_id": "uuid", "slot": "autosave",
  "payload": { ... }, "updated_at": "..." }

// Response (nicht gefunden)
{ "found": false, "player_id": "uuid", "slot": "autosave" }
```

### `GET /save/list?device_id=...` (oder `?list=1`)

```jsonc
{ "found": true, "player_id": "uuid",
  "slots": [ { "slot": "autosave", "updated_at": "...", "blocks_count": 42 } ] }
```

---

## Security-Checklist (Supabase-Skill)

- [x] RLS auf allen `public.*` Tabellen aktiv
- [x] Keine Policy = Lockdown; nur service_role schreibt/liest
- [x] `security definer`-Funktion (`touch_player_last_seen`) hat explizites
      `search_path = public`  
      (Hinweis: liegt aktuell in `public` — wenn `get_advisors` das flaggt,
      in ein privates Schema verschieben. MVP-Risiko niedrig weil RLS-Lockdown
      anon/authenticated eh blockiert.)
- [x] `service_role`-Key ausschließlich als Wrangler-Secret, nie im Frontend
- [x] Kein `user_metadata` in Policies (keine Policies existieren)
- [x] Keine Views — kein security_invoker-Risiko
- [x] Generierte Spalte `blocks_count` ist `stored` (deterministisch)

---

## Kosten & Limits (Free-Tier)

- 500 MB DB — genug für tausende Saves (JSON eines Grids ~5–20 KB)
- 5 GB Bandbreite/Monat — Oscar & Familie kommen damit klar
- 50k monatlich aktive Nutzer — irrelevant für Home-Scale

Wenn das Grid-JSON groß wird (>50 KB): über Storage-Bucket + `payload_url`
nachdenken. Heute: nicht nötig.

---

## Offene Punkte

- [ ] Supabase-Projekt real anlegen (OAuth fehlt noch)
- [ ] Schema importieren & advisors grün
- [ ] Wrangler-Secrets setzen & deployen
- [ ] UI-Toggle für Cloud-Sync (aktuell nur `localStorage`)
- [ ] Playwright-Test für Roundtrip (erst nach Deploy sinnvoll)
- [ ] Chat-Log-Export aktivieren (Tabelle existiert, kein Endpunkt)
- [ ] Wenn Supabase-Advisor meckert: `touch_player_last_seen` in privates
      Schema verschieben (siehe Security-Checklist)
