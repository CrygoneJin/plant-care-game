# Sprint 2 — "Oskar entdeckt"

**Sprint Goal:** Oskar entdeckt neue Materialien durch Crafting und sieht seinen Fortschritt wachsen.

**Start:** 2026-03-29
**Ende:** 2026-04-12

---

## Sprint Backlog

| # | Item | Owner | Status |
|---|------|-------|--------|
| S2-1 | Discovery-Counter — "🔬 5 / 50+ entdeckt" oben sichtbar | Engineer (Torvalds) | 🔲 To do |
| S2-2 | Crafting-Fanfare — neues Material = Popup + Sound + "Du bist ein Alchemist!" | Artist (Ogilvy) + Engineer | 🔲 To do |
| S2-3 | game.js aufbrechen — MATERIALS, QUESTS, ACHIEVEMENTS, SOUND als eigene Dateien | Engineer (Torvalds) | 🔲 To do |
| S2-4 | GitHub Actions Deploy-Workflow — .github/workflows/deploy.yml | Engineer (Torvalds) | 🔲 To do |
| S2-5 | Feynman H2 — uniqueMaterials vs. blocksPlaced als Engagement-Indikator | Scientist (Feynman) | 🔲 To do |

---

## Dependencies

- S2-5 braucht S2-1 (Discovery-Counter muss zählen bevor Feynman messen kann)

## Definition of Done

- [ ] Funktioniert es im Browser?
- [ ] Committed und gepusht?
- [ ] Memory-Eintrag geschrieben?

---

## Standup Log

### 2026-03-29 (Sprint 2 Planning)
- Sprint geplant. 5 Items committed.
- Jobs dispatcht: Torvalds (S2-1, S2-3, S2-4), Ogilvy (S2-2 Texte) parallel
- S2-5 wartet auf S2-1

---

## Feynman Messpunkte (Sprint 2)

### Hypothese H2
> Kinder mit uniqueMaterials > 5 haben höheren engagementScore als Kinder mit blocksPlaced > 50 aber uniqueMaterials ≤ 5.

**Metriken:** uniqueMaterials, blocksPlaced, engagementScore (aus n8n Data Table)
**Minimum N:** 20 Sessions
**Falsifizierbar:** Wenn engagementScore-Median bei der Discovery-Gruppe ≤ Builder-Gruppe → verworfen
**Datenquelle:** n8n Dashboard → Data Tables → Feynman Sessions

### Verifizierte Datenflüsse (Sprint 2)
- [ ] getMetrics() gibt uniqueMaterials zurück ✅
- [ ] _feynman.uniqueMaterials wird an Proxy gesendet ✅
- [ ] Discovery-Counter zählt korrekt ❌ (S2-1 noch nicht implementiert — zählt aktuell Materialien im Grid, nicht freigeschaltete)
