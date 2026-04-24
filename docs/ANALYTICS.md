# Analytics — Till-Dashboard (S103-2)

Minimale, datenschutzkonforme Telemetrie für die Schatzinsel. Aggregiert, opt-in,
keine Drittanbieter.

## Was gemessen wird

### Ohne Opt-in (Status Quo, Sessions-Grundstats)

Wird seit Session 77 bei `beforeunload` an den eigenen Cloudflare Worker
gepingt. Reine Aggregate, keine PII:

- Spielername (freier Text, vom Nutzer selbst gesetzt, kein Default-Identifier)
- Session-Dauer (Sekunden)
- Blöcke platziert / geerntet (Gesamt-Zähler)
- Quests abgeschlossen
- Chat-Messages (Anzahl, keine Inhalte)
- Engagement-Score (0–100, aggregierte Formel)
- Neutrino-Score (0.0–1.0, aggregierte Formel)
- Discovery-Count (Anzahl Entdeckungen, keine Details)

Begründung: Diese Daten sind bereits PII-frei aggregiert, sie enthalten weder
Klickkoordinaten noch Zeitstempel einzelner Interaktionen. Sie wurden seit
Monaten für Tills Priorisierung genutzt und werden NICHT durch Opt-in gated.

### Mit Opt-in (feingranular, neu)

Sobald `localStorage.setItem('insel-analytics-optin', '1')` auf dem Gerät
gesetzt ist, werden zusätzlich diese **aggregierten Zähler pro Session**
übertragen:

- `placements_by_material` — `{ stone: 17, wood: 4, ... }`: Anzahl
  Platzierungen pro Material pro Session
- `npc_taps` — `{ bernd: 3, spongebob: 1, ... }`: Anzahl Chat-Öffnungen pro NPC
- `crafting_successes` — `{ dampf: 2, eisdrache: 1, ... }`: erfolgreiche
  Crafts pro Rezept
- `session_id` — anonyme Client-generierte ID (kein Account-Link), nur damit
  der Worker periodische Updates innerhalb einer Session dedupliziert

Batching: Buffer wird in-memory gehalten, alle 30s per `sendBeacon` an
`/metrics/ingest` gepusht. Der Worker macht Upsert per `session_id`, so dass
finale `beforeunload`-Flushs idempotent sind.

## Was nicht gemessen wird

Niemals. Weder mit noch ohne Opt-in:

- Chat-Inhalte (weder eigene noch KI-Antworten)
- Screenshots oder Canvas-Snapshots
- IP-Adresse, User-Agent, Geo-Lokalisation
- Einzelne Klick-Koordinaten oder Mausbewegungen
- Zeitstempel einzelner Interaktionen

Granularität ist auf **Zähler-pro-Kategorie-pro-Session** begrenzt. Wenn Oscar
heute 17 Steine platziert, sehen wir `{ stone: 17 }` — wann er sie platziert
hat oder wohin, wird nie gespeichert.

## Opt-in aktivieren

Das Flag ist pro Browser-Gerät. Till aktiviert es auf **Oscars Gerät** so:

```js
// Browser-Konsole auf dem Gerät öffnen (Desktop: F12 → Console)
localStorage.setItem('insel-analytics-optin', '1');
```

Deaktivieren:

```js
localStorage.removeItem('insel-analytics-optin');
```

Default: **aus**. Ohne Opt-in verlassen 0 Bytes feingranulare Daten den
Browser.

## Datenfluss

```
Browser (analytics.js)
  ├─ Buffer in-memory (placements/npc_taps/crafts)
  ├─ Opt-in prüfen → wenn aus: Buffer bleibt leer
  └─ alle 30s + beforeunload
       ↓ sendBeacon (fire-and-forget)
Cloudflare Worker (/metrics/ingest)
  └─ UPSERT via session_id
       ↓
D1 (schatzinsel-metrics, Tabelle sessions)
  └─ JSON-Spalten: placements_by_material, npc_taps, crafting_successes
       ↓
Till-Dashboard (docs/dashboard/index.html)
  └─ GET /metrics?table=sessions&limit=200
     → clientseitige Aggregation + Bar-Charts (SVG via DOM)
```

Keine Drittanbieter. Keine Google Analytics, kein Plausible-Cloud, kein
Segment, kein Mixpanel.

## Dashboard

`docs/dashboard/index.html` kann direkt im Browser geöffnet werden (lokal via
`file://` oder deployed). Es fragt `/metrics?table=sessions&limit=200` ab und
aggregiert clientseitig:

- Überblick: Gesamt-Platzierungen, unterschiedliche Materialien, NPC-Taps,
  Crafts, Median-Session-Länge
- Bar-Chart: Platzierungen pro Material (Top 20)
- Bar-Chart: NPC-Nutzung
- Bar-Chart: Crafts (Top 10)
- Histogramm: Session-Länge-Buckets
- Tabelle: Letzte 20 Sessions mit Top-3-Materialien

## Tests

`ops/tests/analytics-optin.test.js` deckt ab:

- Opt-in-Gate (ohne Flag → keine Buffer-Counts)
- Key-Sanitizing (Länge, Sonderzeichen)
- Event-Bus-Verdrahtung (`block:placed`, `openChat`)
- `trackEvent`-Interception für Crafts
- Dashboard-Aggregation (`aggregateSessions`, `parseJson`, `sumValues`)

Lauf: `npm run test:unit`.

## Referenzen

- Client: `src/infra/analytics.js` (Opt-in-Logik, Buffer, Flush)
- Worker: `src/infra/worker.js` (`handleMetricsIngest` + D1-Schema-Migration)
- Wrangler: `src/infra/wrangler.toml` (D1-Binding `METRICS_DB`)
- Dashboard: `docs/dashboard/index.html` + `docs/dashboard/aggregate.js`
