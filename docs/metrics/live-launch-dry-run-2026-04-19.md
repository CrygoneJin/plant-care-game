---
type: dry-run-checklist
date: 2026-04-19
owner: Engineer
status: prepared (not executed)
---

# Live-Launch Dry-Run — Schatzinsel 2026

## Befund (Read-only Inspektion)

### Test-Infrastruktur
- ✅ Playwright (`ops/tests/playwright.config.js`) installiert (v1.58.2)
- ✅ Smoke + Critical-Path Specs vorhanden (`smoke.spec.js`, `critical-path.spec.js`, `features.spec.js`, `burn-panel.spec.js`)
- ✅ Unit-Tests via `node --test`
- ✅ Typecheck: `tsc --noEmit`
- ❌ Kein dediziertes `e2e/` Verzeichnis — alles liegt unter `ops/tests/`

### Stripe-Integration
- ⚠️ Nur **Vorbereitung** in `docs/STRIPE_MCP_PREP.md`
- Keine Stripe-Keys, keine Webhooks, keine Payment-Links produktiv eingebunden
- MCP-Server-Konfig dokumentiert, aber nicht aktiv

### Hosting-Status
- Cloudflare Workers: `/metrics` Endpoint (#27 noch offen für CORS-Deploy)
- D1 für Sessions
- Frontend wahrscheinlich statisch (Vite-Build), kein Hosting-Pfad in Repo dokumentiert

## Dry-Run Checkliste (für Morgen, nicht heute Nacht)

### Phase 1 — Pre-Flight (T-15min)
- [ ] `npm run test:unit` grün
- [ ] `npm run typecheck` grün
- [ ] `npm run test:e2e` smoke + critical-path grün
- [ ] `git status` clean auf main
- [ ] CHANGELOG / DECISIONS.md Eintrag für Launch-Day vorbereitet

### Phase 2 — Build (T-10min)
- [ ] `npm run build` (Vite) — Output in `dist/`
- [ ] Bundle-Size < 1MB total verifiziert
- [ ] `dist/index.html` öffnet lokal (file://) ohne Console-Errors

### Phase 3 — Hosting Smoke (T-5min)
- [ ] Cloudflare Worker `/metrics` reachable (OPTIONS + POST)
- [ ] D1 schreibt eine Test-Session (manueller curl)
- [ ] CORS Header korrekt für Production-Origin

### Phase 4 — Stripe Stub (separate, vor Launch)
- [ ] Stripe Test-Mode-Keys in env
- [ ] Mindestens 1 Payment-Link erstellt (€4.99 "Schatzinsel Vollversion"?)
- [ ] Webhook-Endpoint (Worker-basiert) für `checkout.session.completed`
- [ ] Test-Kauf mit `4242 4242 4242 4242` durchgespielt
- [ ] D1: `purchases` Tabelle bekommt Eintrag

### Phase 5 — Go-Live
- [ ] DNS / Custom Domain
- [ ] PWA Manifest + Icons (icon.svg vorhanden — untracked!)
- [ ] Sentry / Error-Tracking optional
- [ ] Analytics-Opt-In (DSGVO!) klar im UI

## Open Questions für Triage

1. **Hosting**: Cloudflare Pages oder Workers Static Assets oder GitHub Pages?
2. **Domain**: Existiert eine? (schatzinsel.app? .de? .game?)
3. **Stripe**: Wirklich Stripe oder Itch.io Pay-What-You-Want?
4. **Launch-Datum**: Wann real? (Backlog spricht von "launch-ready" seit Sprint ~50)

## Heute Nacht NICHT ausgeführt
- Kein Build
- Kein Deploy
- Kein Stripe-Setup
- Reine Inspection + Plan
