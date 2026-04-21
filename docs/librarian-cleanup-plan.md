# Librarian Cleanup-Plan — docs/ & Root-Ordnung

**Auftrag:** Isidor-Modell auf `docs/` anwenden. Keine Code-Dateien. Nur Markdown + Assets in docs/.

**Vorher:** `docs/` hat 34 Dateien auf Top-Level + Unterordner (buch/, essays/, metrics/, padawans/, stories/, superpowers/).

**Nachher:** Top-Level nur Produkt-Docs (ARCHITECTURE, PROJECT, DESIGN, USERS, DECISIONS, AGENTS, DONE, BRANCH-ARCHIVE, ARCHIVE, README). Alles andere in thematischen Subordnern.

## Struktur (Ziel)

```
docs/
├── README.md                 — NEU, Inhaltsverzeichnis
├── PROJECT.md · USERS.md · ARCHITECTURE.md · DESIGN.md · DECISIONS.md
├── DONE.md · AGENTS.md · ARCHIVE.md · BRANCH-ARCHIVE.md
├── archiv/                   — NEU (veraltete Docs, User entscheidet später)
├── buch/                     — BESTAND (Pitch/Exposés/Anfragen)
├── essays/                   — BESTAND, erweitert (alle essay-*.md dorthin)
├── interviews/               — NEU
├── metrics/                  — BESTAND
├── padawans/                 — BESTAND
├── podcasts/                 — NEU (podcast-*.md)
├── reviews/                  — NEU (review-*.md, format-review-*.md)
├── screenshots/              — NEU (*.png)
├── sonstiges/                — NEU (pruning, schoepfung, aufsatz)
├── stories/                  — BESTAND
└── superpowers/              — BESTAND (plans/ + specs/, Engineering-Artefakte)
```

**Begründung `archiv/` (klein, deutsch):** Vermeidet Namenskollision mit `ARCHIVE.md` auf case-insensitive Filesystems (macOS). Passt zum Isidor-Geist.

## File-Map (was wohin)

### → `docs/essays/` (8 Files aus Top-Level)
- `essay-island-consciousness.md`
- `essay-quantum-dimensions.md`
- `essay-quantum-field-universe.md`
- `essay-synthese-dialektik.md`
- `essay-tao-higgs-field-analysis.md`
- `essay-unter-der-unterscheidung.md`
- `essay-vier-kraefte-spielmechanik.md`
- `essay-zipfelmuetze-und-leeres-dreieck.md`

### → `docs/podcasts/` (2 Files)
- `podcast-island-consciousness.md`
- `podcast-quantum-dimensions.md`

### → `docs/reviews/` (2 Files)
- `review-island-consciousness.md`
- `format-review-ogilvy-jens.md`

### → `docs/interviews/` (1 Datei — Dupe wandert ins Archiv)
- `interview-ricardo-currency.md` (neuere Version mit 🐚 Emoji)

### → `docs/screenshots/` (6 PNGs)
- `screenshot-01-startseite.png` … `screenshot-06-codeview.png`

### → `docs/sonstiges/` (3 Files — einzelne Konzeptnotizen)
- `pruning-modell.md`
- `schoepfungsgeschichten.md`
- `aufsatz-kommazahlen-grundschule.md`

### → `docs/archiv/` (veraltete/duplizierte Docs)
- `interview-ricardo-waehrungsarchitektur.md` (Dupe von currency, ältere Fassung ohne Emoji)
- `browser-llm-evaluation.md` (abgeschlossenes Evaluations-Memo Sprint 90, siehe MEMORY.md)
- `STRIPE_MCP_PREP.md` (Preparation-Notiz, kein laufendes Dokument)
- `MMX_STATS.md` (alter Snapshot, 527 Bytes)
- `FUENF-TASCHENTUECHER.md` (grosser Essay ohne aktuelle Referenz)
- `DEVICES.md` · `DISTRIBUTION.md` · `ITCH-IO-COPY.md` (Launch-Prep, Sprint 90 abgeschlossen)

### BLEIBEN auf Top-Level `docs/`
- `PROJECT.md` · `USERS.md` · `ARCHITECTURE.md` · `DESIGN.md` · `DECISIONS.md`
- `DONE.md` · `AGENTS.md` · `ARCHIVE.md` (Backlog-Friedhof, aktiv referenziert)
- `BRANCH-ARCHIVE.md` (Branch-SHAs für Restore, aktiv referenziert)
- Neuer `README.md` (Inhaltsverzeichnis)

### NICHT ANGEFASST
- `icon.svg` / `preview.svg` am Root (`preview.svg` in index.html mit absoluter URL referenziert, `icon.svg` ist ein untracked Working-Asset — keine Risiken)
- `bigbang.js`, `config.js`, `index.html`, `sw.js`, `style.css`, `manifest.json`, `package*.json`, `tsconfig.json` — Code, tabu
- `docs/padawans/` — bleibt, inkl. neuem `tolkien-padawan.md`
- `docs/buch/`, `docs/stories/`, `docs/superpowers/` — bleiben strukturell

## Commits (logisch getrennt)

1. `chore(docs): essays in docs/essays/ konsolidiert`
2. `chore(docs): podcasts/reviews/interviews in Subordner`
3. `chore(docs): screenshots + sonstiges in Subordner`
4. `chore(docs): archiv/ für veraltete Launch-Prep und Dupes`
5. `chore(docs): README.md als Inhaltsverzeichnis`

## Nach Abschluss
- PR `chore/docs-cleanup` → main
- `ops/MEMORY.md` Zeile
