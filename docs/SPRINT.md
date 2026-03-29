# Sprint 1 — "Oskar versteht sofort"

**Sprint Goal:** Oskar kann die Insel im Browser öffnen, versteht sofort was zu tun ist, und Feynman kann messen ob es funktioniert.

**Start:** 2026-03-29
**Ende:** 2026-04-12
**Velocity:** Erste Messung

---

## Sprint Backlog

| # | Item | Owner | Status |
|---|------|-------|--------|
| S1-1 | Palette auf 5+3 reduzieren (Wu Xing + erste Crafting-Ergebnisse) | Designer (Rams) | 🔲 To do |
| S1-2 | Achievements verstecken — nur entdeckte zeigen, Rest "?" | Engineer (Torvalds) | 🔲 To do |
| S1-3 | sessionDuration fixen — window.getMetrics() erweitern | Engineer (Torvalds) | 🔲 To do |
| S1-4 | Starter-Insel — 3 Sand, 1 Baum, NPC sagt "Hier fehlt noch was" | Artist (Ogilvy) + Engineer | 🔲 To do |
| S1-5 | Tote Texte ersetzen — kindgerechte Sidebar-Texte | Artist (Ogilvy) | 🔲 To do |
| S1-6 | Feynman First Hypothesis — chatUsed vs. blocksPlaced Auswertung | Scientist (Feynman) | 🔲 To do |

---

## Dependencies

- S1-4 braucht S1-1 (Palette muss reduziert sein bevor Starter-Insel Sinn ergibt)
- S1-6 braucht S1-3 (sessionDuration muss funktionieren)

## Definition of Done

- [ ] Funktioniert es im Browser?
- [ ] Committed und gepusht?
- [ ] Memory-Eintrag geschrieben?

---

## Standup Log

### 2026-03-29 (Sprint Planning)
- Sprint geplant. 6 Items committed.
- Jobs dispatcht: Rams (S1-1), Torvalds (S1-2 + S1-3), Ogilvy (S1-5) parallel
- S1-4 und S1-6 warten auf Dependencies

---

## Feynman Messpunkte (Sprint 1)

### Hypothese H1
> Kinder mit chatUsed=true platzieren mehr Blöcke als Kinder mit chatUsed=false.

**Metriken:** blocksPlaced, chatUsed (aus n8n Data Table "Feynman Sessions")
**Minimum N:** 20 Sessions
**Falsifizierbar:** Wenn blocksPlaced-Median bei chatUsed=true ≤ chatUsed=false → Hypothese verworfen
**Datenquelle:** n8n Dashboard → Data Tables → Feynman Sessions

### Verifizierte Datenflüsse
- [ ] chat.js sendet _feynman.chatUsed = true ❌ (fehlt — _feynman wird nicht gebaut)
- [ ] chat.js sendet _feynman.blocksPlaced aus getMetrics() ❌ (fehlt — _feynman wird nicht gebaut)
- [ ] chat.js sendet _feynman.sessionDuration aus getMetrics() ❌ (fehlt — _feynman wird nicht gebaut)
- [ ] worker.js leitet _feynman an logAsync weiter ✅ (logAirtable liest f.chatUsed, f.blocksPlaced, f.sessionDuration korrekt)
- [ ] n8n Workflow schreibt in Data Table ✅/❌ (nicht code-verifizierbar, abhängig von n8n-Konfiguration)

### Befund
`game.js` hat `window.getMetrics()` mit `blocksPlaced` und `sessionDuration` (Zeilen 2364/2370). ✅
`worker.js` verarbeitet `_feynman` korrekt in `logAirtable` (Zeilen 123–144). ✅
`chat.js` baut den `_feynman`-Block **nicht** — weder in `fillAiCommentBuffer` noch im Haupt-Chat-Request.
**Blockiert:** S1-6 braucht zuerst einen Fix in chat.js (Task: `_feynman` in Proxy-Request einbauen).
