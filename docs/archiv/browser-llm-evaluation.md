# Browser-LLM Evaluation: Progressive Loading ELIZA→LLM

**Datum:** 2026-04-01
**Status:** Forschung abgeschlossen — Empfehlung: Transformers.js + SmolLM2-360M-Instruct
**Backlog-Ticket:** #90

---

## Ziel

Wenn kein API-Key vorhanden oder Budget leer: lokales LLM im Browser übernimmt NPC-Dialoge.
Progressive Degradation: `Cloud-LLM → Browser-LLM → ELIZA`

Die harte Anforderung: **muss auf einem iPad laden und auf Kinderdialoge taugen.**

---

## Kandidaten 2026

### 1. Transformers.js (HuggingFace)

- **Beschreibung:** JavaScript-Port der HuggingFace Transformers Library. Läuft direkt im Browser via WebGPU oder WASM-Fallback. Keine Server-Abhängigkeit.
- **Version:** v4 (ab 2025), komplettes WebGPU-Runtime-Rewrite in C++ mit ONNX Runtime
- **Backend:** WebGPU primär, automatischer WASM-Fallback wenn kein WebGPU
- **CDN:** Ja — `https://cdn.jsdelivr.net/npm/@huggingface/transformers`
- **Safari/iPadOS:** Ab Safari 26 (iOS/iPadOS 26, WWDC25 angekündigt). Ältere iOS-Versionen: WASM-Fallback funktioniert.
- **Empfohlenes Modell:** SmolLM2-360M-Instruct (ONNX q4)

### 2. WebLLM (mlc-ai)

- **Beschreibung:** Hochperformante Engine, OpenAI-kompatibles API, kompiliert Modelle via MLC-LLM.
- **Backend:** Ausschließlich WebGPU — kein WASM-Fallback
- **Safari/iPadOS:** Funktioniert ab Safari 26. Auf älteren Geräten/Browsern: kein Fallback.
- **Problem für Schatzinsel:** Geräte-Abdeckung zu eng. Ohne WebGPU = totaler Ausfall.
- **Fazit:** Aussortiert wegen fehlendem WASM-Fallback.

### 3. ONNX Runtime Web (Microsoft)

- **Beschreibung:** Low-level Inference-Engine. WebGPU + WASM.
- **Transformers.js nutzt es intern** in v4 — direkter Einsatz wäre mehr Aufwand ohne Mehrwert.
- **Fazit:** Indirekt via Transformers.js ideal.

### 4. Gemma Nano / Gemma 3 270M (Google)

- **Größe:** ~300 MB quantisiert
- **Qualität:** Besser als SmolLM2-135M, vergleichbar mit SmolLM2-360M
- **Browser:** WebGPU via Transformers.js oder WebLLM
- **Problem:** Google AI Edge primär für native Apps (Android/iOS) optimiert. Browser-Support experimentell.
- **Fazit:** Interessanter Backup-Kandidat, aber weniger reif als SmolLM2 in Transformers.js.

### 5. SmolVLM / andere Multimodal-Modelle

- Für unsere Use Case (Text-Dialoge) überdimensioniert und zu groß.
- Aussortiert.

---

## Modell-Entscheidung: SmolLM2-360M-Instruct

### Varianten und Größen

| Modell | Format | Größe | Anmerkung |
|--------|--------|-------|-----------|
| SmolLM2-135M-Instruct | ONNX q4f16 | ~134 MB | Zu schwach für kohärente Dialoge |
| SmolLM2-135M-Instruct | ONNX q4 | ~200 MB | Grenzwertig schwach |
| SmolLM2-360M-Instruct | ONNX q4f16 | ~190 MB | **Empfehlung** |
| SmolLM2-360M-Instruct | ONNX q8 | ~380 MB | Zu schwer für iPad |
| SmolLM2-1.7B-Instruct | ONNX q4 | ~900 MB | Zu groß, tab-crash-gefährdet |

**Hinweis:** 4bit-Quantisierung degradiert 135M spürbar. Das 360M hält bei q4f16 gute Qualität.

### Warum 360M und nicht 135M?

Das 135M-Modell produziert bei niedrigen Quantisierungsstufen inkohärente Ausgaben. Für kindgerechte NPC-Dialoge (SpongeBob, Maus, Neinhorn) braucht das Modell Kontext-Verständnis und Persona-Treue. Das 360M liefert das zuverlässiger.

### Ladezeiten (geschätzt, 5G/WiFi)

| Szenario | Zeit |
|----------|------|
| Erstladen, kein Cache, 190 MB via CDN | 15–40 s (LTE/5G) |
| Zweitladen nach OPFS-Cache | < 1 s |
| Zweitladen nach Browser-Cache | 1–3 s |

Das Ziel "< 10s" ist beim **Erstladen nicht erreichbar**. Mit OPFS-Caching nach dem ersten Download: ja.
**Strategie:** Im Hintergrund vorladen und cachen, sobald der Spieler das erste Mal die Chat-Oberfläche öffnet — nicht erst wenn Budget leer ist.

---

## Browser-Kompatibilität

| Browser | WebGPU | WASM-Fallback | Bewertung |
|---------|--------|----------------|-----------|
| Chrome 113+ (Desktop) | Ja | Ja | Voll |
| Firefox 141+ (Windows) | Ja | Ja | Voll |
| Safari 26 (macOS/iOS/iPadOS) | Ja | Ja | Voll ab iOS 26 |
| Safari < 26 (alte iPads) | Nein | Ja (WASM) | Langsam aber funktional |
| Samsung Internet | Nein | Ja (WASM) | Funktional |

**Kritischer Punkt Safari < 26:** WASM-Inference läuft, aber 3–5× langsamer als WebGPU. Token-Generierung auf altem iPad Air 2 (A8): ~2–5 tok/s. Das ist für kurze NPC-Antworten (50–100 Tokens) tolerierbar (~10–50 s), aber kein Spaß.

**Empfehlung für alte Safari:** WASM-Fallback aktivieren, aber Antworten kürzer halten (max. 80 Tokens). Streaming-Output via `TextDecoder` sodass etwas erscheint, bevor alles fertig ist.

---

## Proof-of-Concept: Integrationsplan

### Architektur

```
chat.js (bestehend)
  └── LLM Provider Chain:
        1. Cloud API (Requesty/Anthropic/Gemini) — wenn API-Key + Budget vorhanden
        2. Browser-LLM (NEU) — wenn kein Key oder Budget erschöpft
        3. ELIZA (bestehend) — wenn Browser-LLM nicht geladen/verfügbar
```

### Neue Datei: `browser-llm.js`

```javascript
// browser-llm.js — Lazy-Loading Browser-Inferenz via Transformers.js
(function () {
  'use strict';

  const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';
  const MODEL_DTYPE = 'q4f16';

  let pipeline = null;
  let loadState = 'idle'; // idle | loading | ready | error

  window.BROWSER_LLM = {
    isReady: () => loadState === 'ready',
    getState: () => loadState,

    // Vorladen im Hintergrund — z.B. beim ersten Chat-Öffnen
    preload: async function (onProgress) {
      if (loadState !== 'idle') return;
      loadState = 'loading';
      try {
        const { pipeline: createPipeline } = await import(
          'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4'
        );
        pipeline = await createPipeline('text-generation', MODEL_ID, {
          dtype: MODEL_DTYPE,
          device: 'webgpu',       // automatischer WASM-Fallback
          progress_callback: onProgress
        });
        loadState = 'ready';
      } catch (err) {
        loadState = 'error';
        console.warn('[BrowserLLM] Fehler:', err);
      }
    },

    // Antwort generieren — gibt Promise<string> zurück
    generate: async function (messages, charPersona) {
      if (!pipeline) throw new Error('Model nicht geladen');

      const systemPrompt = buildSystemPrompt(charPersona);
      const prompt = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-4) // Nur letzte 4 Nachrichten als Kontext
      ];

      const result = await pipeline(prompt, {
        max_new_tokens: 80,
        temperature: 0.8,
        do_sample: true,
        repetition_penalty: 1.2
      });

      return result[0].generated_text.at(-1).content;
    }
  };

  function buildSystemPrompt(charId) {
    // Vereinfachte Persona-Beschreibungen (vollständige kommen aus eliza-scripts.js)
    const personas = {
      spongebob: 'Du bist SpongeBob. Enthusiastisch, fröhlich, kindgerecht. Kurze Sätze.',
      maus: 'Du bist die Maus aus der Sendung mit der Maus. Neugierig, erklärt Dinge einfach.',
      neinhorn: 'Du bist das Neinhorn. Sagst zu allem Nein, aber auf witzige Art.',
      default: 'Du bist ein freundlicher NPC in einem Kinderspiel. Antworte kurz und kindgerecht auf Deutsch.'
    };
    return personas[charId] || personas.default;
  }
})();
```

### Integration in chat.js

In `chat.js` die bestehende Provider-Chain erweitern:

```javascript
// Nach API-Key-Check, vor ELIZA-Fallback:
if (!apiKey || budget.isExhausted()) {
  if (window.BROWSER_LLM?.isReady()) {
    return window.BROWSER_LLM.generate(messages, charId);
  }
  // ELIZA bleibt letzter Fallback
  return elizaFallback(input);
}
```

### Preloading-Trigger

```javascript
// In chat.js beim ersten Öffnen des Chat-Dialogs:
if (!window.BROWSER_LLM?.isReady()) {
  window.BROWSER_LLM?.preload((progress) => {
    // Optional: Mini-Ladebalken im UI
    console.log(`[BrowserLLM] Lade: ${Math.round(progress.progress)}%`);
  });
}
```

---

## Risiken und Fallstricke

### 1. Erstladezeit
**Problem:** 190 MB sind bei schlechtem Netz 30–60+ Sekunden.
**Mitigation:** OPFS-Caching (Transformers.js macht das automatisch nach dem ersten Download). Service Worker für Cache-First-Strategie.

### 2. Speicher auf alten iPads
**Problem:** iPad Air 2 (2014, 2 GB RAM) kann bei WASM evtl. OOM-Fehler produzieren.
**Mitigation:** Try/Catch mit graceful Degradation zu ELIZA. Im Fehlerfall `loadState = 'error'` und nicht nochmal versuchen.

### 3. Modellqualität bei kurzen Antworten
**Problem:** 360M ist gut, aber kein Claude. Kann aus der Persona fallen.
**Mitigation:** Strikter System-Prompt. `repetition_penalty: 1.2` gegen Endlosschleifen. Max 80 Tokens — kurze Antworten sind besser als lange schlechte.

### 4. Safari < 26 (ältere iPads)
**Problem:** Kein WebGPU, WASM sehr langsam.
**Mitigation:** WASM-Fallback nutzen, aber Streaming-Output für wahrgenommene Geschwindigkeit. User sieht Tokens erscheinen, nicht auf Volltext warten.

### 5. Content Security Policy
**Problem:** ESM-Import von CDN könnte durch CSP geblockt werden.
**Mitigation:** Entweder `script-src cdn.jsdelivr.net` whitelisten oder Transformers.js als lokale Dependency bundeln (aber +190 KB JS).

---

## Empfehlung: Phasenweise Umsetzung

### Phase 1 — Spike (2–4h)
- `browser-llm.js` als Standalone-Datei
- Hardcoded SmolLM2-360M-Instruct laden
- Im Browser testen: lädt es, generiert es, klingt es kindgerecht?
- iPad (alt + neu) testen

### Phase 2 — Integration (4–6h)
- In chat.js einbinden als mittlere Fallback-Stufe
- OPFS-Caching verifizieren
- Ladebalken im UI wenn Browser-LLM lädt
- Fehlerbehandlung + Degradation zu ELIZA

### Phase 3 — Qualitäts-Tuning (2–3h)
- Persona-Prompts für alle NPC-Charaktere
- Antwortlänge optimieren
- Streaming-Output für Safari WASM

---

## Fazit

**Browser-LLM ist machbar und sinnvoll für Schatzinsel.**

- **Transformers.js v4 + SmolLM2-360M-Instruct (ONNX q4f16, ~190 MB)** ist der beste Kandidat.
- Safari-Kompatibilität ist gegeben: WebGPU ab Safari 26, WASM-Fallback für ältere Geräte.
- Das 10s-Ziel beim Erstladen ist unrealistisch — aber mit OPFS-Caching ist jeder Folgeladen < 1s.
- Die Modellqualität reicht für kurze, kindgerechte NPC-Dialoge als Notfall-Fallback.
- Integration ist nicht invasiv: bestehender ELIZA-Code bleibt letzter Anker.

**Nächster Schritt:** Phase 1 Spike — `browser-llm.js` bauen und auf iPad testen.

---

## Quellen

- [WebLLM — mlc-ai/web-llm (GitHub)](https://github.com/mlc-ai/web-llm)
- [WebLLM Paper — arXiv 2412.15803](https://arxiv.org/abs/2412.15803)
- [Transformers.js v4 Preview (HuggingFace Blog)](https://huggingface.co/blog/transformersjs-v4)
- [WebKit Blog: Safari 26 Beta / WebGPU](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)
- [WebGPU in iOS 26 (App Developer Magazine)](https://appdevelopermagazine.com/webgpu-in-ios-26/)
- [SmolLM2-360M-Instruct (HuggingFace)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [SmolLM2-135M-Instruct (HuggingFace)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Intel Developer Guide: In-Browser LLMs](https://www.intel.com/content/www/us/en/developer/articles/technical/web-developers-guide-to-in-browser-llms.html)
- [Optimizing Transformers.js for Production (SitePoint)](https://www.sitepoint.com/optimizing-transformers-js-production/)
- [Gemma 3 on Mobile and Web (Google Developers)](https://developers.googleblog.com/en/gemma-3-on-mobile-and-web-with-google-ai-edge/)
