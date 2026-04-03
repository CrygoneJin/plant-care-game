# Burn-Detektor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MMX/XCH Burn-Balance live im Spiel anzeigen — der Detektor der beweist dass Tokens im Schwarzen Loch angekommen sind.

**Architecture:** Worker-Proxy `/burn` existiert schon, gibt aber `null` zurück weil mmxplorer Cloudflare-Challenge blockt. Fix: MMX-Node RPC direkt ansprechen oder alternativen Explorer nutzen. Fallback: manueller Balance-Eintrag via Worker-Endpoint.

**Tech Stack:** Cloudflare Worker (worker.js), Canvas 2D (game.js), Playwright (smoke test)

---

### Task 1: MMX-Balance über alternativen API-Pfad

**Files:**
- Modify: `worker.js:759-793` (handleBurnBalance)

- [ ] **Step 1: Recherche — welche MMX APIs existieren**

```bash
# MMX Node RPC Docs: https://docs.mmx.network
# Prüfe ob es eine öffentliche Node gibt
curl -s 'https://rpc.mmx.network/' 2>&1 | head -5
curl -s 'https://api.mmx.network/v1/address/mmx1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5tuzzn' 2>&1 | head -5
```

Dokumentiere welche Endpoints antworten (200) und welche blocken (403/Challenge).

- [ ] **Step 2: Wenn öffentliche API existiert — Worker umstellen**

In `worker.js` die `handleBurnBalance`-Funktion updaten:

```javascript
// Variante A: MMX Node RPC
const mmxRes = await fetch('https://rpc.mmx.network/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        method: 'get_balance',
        params: { address: mmxAddr }
    })
});
```

- [ ] **Step 3: Wenn keine öffentliche API — Fallback: manueller Balance-Eintrag**

Neuer Endpoint `POST /burn/set` mit Secret-Key:

```javascript
if (pathname === '/burn/set' && request.method === 'POST') {
    const url = new URL(request.url);
    const secret = url.searchParams.get('key');
    if (!secret || secret !== (env.BUGS_SECRET || '')) {
        return json({ error: 'Nicht autorisiert' }, 401);
    }
    const body = await request.json();
    // Balance in KV speichern (TTL 24h)
    await env.CRAFT_KV.put('burn:mmx', JSON.stringify({
        balance: body.mmx || 0,
        ts: Date.now()
    }), { expirationTtl: 86400 });
    await env.CRAFT_KV.put('burn:xch', JSON.stringify({
        balance: body.xch || 0,
        ts: Date.now()
    }), { expirationTtl: 86400 });
    return json({ ok: true });
}
```

`handleBurnBalance` liest dann zuerst aus KV, dann versucht API:

```javascript
async function handleBurnBalance(request) {
    const results = { mmx: null, xch: null, ts: Date.now() };

    // 1. KV-Cache prüfen (manuell gesetzt oder letzter erfolgreicher API-Call)
    const kvMmx = await env.CRAFT_KV.get('burn:mmx', 'json');
    if (kvMmx) results.mmx = kvMmx.balance;

    const kvXch = await env.CRAFT_KV.get('burn:xch', 'json');
    if (kvXch) results.xch = kvXch.balance;

    // 2. API versuchen (überschreibt KV wenn erfolgreich)
    try {
        // ... API-Call wie bisher, bei Erfolg → KV updaten
    } catch (e) { /* KV-Fallback reicht */ }

    return json(results, 200, {
        ...corsHeaders(),
        'Cache-Control': 'public, max-age=60'
    });
}
```

- [ ] **Step 4: Syntax-Check**

```bash
node --check worker.js
```

Expected: keine Ausgabe (= OK)

- [ ] **Step 5: Deploy + Test**

```bash
wrangler deploy
sleep 3
curl -s https://schatzinsel.hoffmeyer-zlotnik.workers.dev/burn
```

Expected: `{"mmx":0,"xch":0,"ts":...}` (nicht `null`)

- [ ] **Step 6: Commit**

```bash
git add worker.js
git commit -m "fix: Burn-Detektor — KV-Fallback wenn API blockt"
git push
```

---

### Task 2: Burn-Panel im Spiel sichtbar machen (ohne Code-View)

**Files:**
- Modify: `game.js:4373-4412` (Burn-Panel Rendering)
- Modify: `index.html` (optionaler Button)

- [ ] **Step 1: Prüfe aktuellen Zustand**

```bash
# Schau dir an wie das Panel aktuell gerendert wird
grep -n 'mmxBurnBalance\|Burn.*Panel\|Crypto.*Panel' game.js | head -10
```

Das Panel ist aktuell nur im Code-View (`</>`) sichtbar. Für den Detektor muss es auch ohne Code-View erreichbar sein.

- [ ] **Step 2: Burn-Panel als eigene Funktion extrahieren**

In `game.js`, extrahiere das Panel-Rendering in eine eigene Funktion:

```javascript
function drawBurnPanel(ctx, x, y, w) {
    const mmxAddr = window.INSEL_MMX_BURN || 'mmx1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5tuzzn';
    const mmxBal = window._mmxBurnBalance || '?';
    const xchBal = window._xchBurnBalance || '?';

    ctx.fillStyle = 'rgba(15, 15, 15, 0.88)';
    ctx.fillRect(x, y, w, 48);
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 48);

    ctx.fillStyle = '#FF6B00';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('🔥 MMX Burn  ' + mmxBal + ' MMX', x + 5, y + 5);
    ctx.fillStyle = '#888';
    ctx.font = '9px monospace';
    ctx.fillText(mmxAddr.slice(0, 16) + '...' + mmxAddr.slice(-6), x + 5, y + 20);
    ctx.fillStyle = '#666';
    ctx.font = '8px monospace';
    ctx.fillText('Tokens rein, niemand raus. Hawking-Strahlung.', x + 5, y + 35);
}
```

- [ ] **Step 3: Burn-Status als Toast bei Änderung**

Wenn sich der Balance ändert (Poll ergibt neuen Wert), Toast anzeigen:

```javascript
let _lastKnownMmxBal = null;

function poll() {
    fetch(proxy + '/burn').then(r => r.ok ? r.json() : null).then(data => {
        if (!data) return;
        const newBal = data.mmx != null ? data.mmx.toFixed(4) : null;
        if (_lastKnownMmxBal !== null && newBal !== _lastKnownMmxBal && newBal !== null) {
            showToast('🔥 Schwarzes Loch: ' + newBal + ' MMX verschlungen!', 5000);
        }
        _lastKnownMmxBal = newBal;
        window._mmxBurnBalance = newBal || '—';
        window._xchBurnBalance = data.xch != null ? data.xch.toFixed(6) : '—';
        requestRedraw();
    }).catch(() => {
        window._mmxBurnBalance = '—';
        window._xchBurnBalance = '—';
    });
}
```

- [ ] **Step 4: Syntax + Type Check**

```bash
node --check game.js && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add game.js
git commit -m "feat: Burn-Detektor — Toast bei Balance-Änderung, Panel extrahiert"
git push
```

---

### Task 3: Playwright Smoke-Test für Burn-Panel

**Files:**
- Create: `tests/burn-panel.spec.js`

- [ ] **Step 1: Smoke-Test schreiben**

```javascript
const { test, expect } = require('@playwright/test');

test('Burn-Balance wird geladen', async ({ page }) => {
    await page.goto('https://schatzinsel.app');
    // Warte auf Balance-Poll (max 5s)
    await page.waitForFunction(() =>
        window._mmxBurnBalance !== undefined && window._mmxBurnBalance !== '?',
        { timeout: 5000 }
    ).catch(() => {}); // OK wenn Timeout — API kann blocken

    const bal = await page.evaluate(() => window._mmxBurnBalance);
    // Balance ist entweder eine Zahl oder '—' (API blockiert)
    expect(bal).toBeDefined();
    expect(bal).not.toBe('?');
});

test('Burn-Proxy Worker antwortet', async ({ request }) => {
    const res = await request.get('https://schatzinsel.hoffmeyer-zlotnik.workers.dev/burn');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('ts');
    expect(data).toHaveProperty('mmx');
    expect(data).toHaveProperty('xch');
});
```

- [ ] **Step 2: Test lokal ausführen**

```bash
npx playwright test tests/burn-panel.spec.js --reporter=line
```

Expected: 2 Tests pass (oder 1 skip wenn keine Browser-Instanz)

- [ ] **Step 3: Commit**

```bash
git add tests/burn-panel.spec.js
git commit -m "test: Burn-Panel Smoke-Test — Balance-Poll + Worker-Proxy"
git push
```
