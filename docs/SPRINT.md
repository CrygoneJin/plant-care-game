# Sprint 6 — "Weniger ist mehr" ✅

**Sprint Goal:** Aufräumen, Performance, Polish — das Spiel wird schlanker und schneller.

**Start:** 2026-03-29
**Ende:** 2026-03-29 (Speed-Sprint)

---

## Sprint Backlog

| # | Item | Owner | Status |
|---|------|-------|--------|
| S6-1 | **Entdeckungszähler korrekt** — "0 / 68 entdeckt" ist falsch, muss dynamisch sein | Engineer | ✅ Done |
| S6-2 | **Mehr Quests** — 55+ Crafting-Rezepte brauchen mehr Quest-Templates | Artist | ✅ Done |
| S6-3 | **Tooltip statt Label überall** — alle verbleibenden Text-Labels durch title-Attribute ersetzen | Designer | ✅ Done |

---

## Standup Log

### 2026-03-29 (Sprint 6 Planning)
- Sprint 5 done (Chat-Bubble, Drag&Drop auf Palette, Labels weg).
- Sprint 6: Polish + Content.

### 2026-03-29 (Sprint 6 Review — alle Items Done)
- S6-1: updateDiscoveryCounter() beim Start aufgerufen + dynamisch (kein hardcoded "68" mehr).
- S6-2: 18 neue Quest-Templates (Runden 4-6, alle neuen Materialien: dragon, unicorn, phoenix, cloud, ice, snow, rain, butterfly, bee, apple, cake, potion usw.) — 38 Quests gesamt.
- S6-3: mat-label Spans entfernt, title-Attribute auf alle Palette-Buttons, auch beim JS-Unlock.
- Oscar sieht: Tooltips auf Palette, viel mehr Quests, korrekter Zähler.

### 2026-03-30 (Sprint 6 Retrospektive)
**Was gut lief:**
- Autonomer Agent hat Sprint 6 selbstständig erkannt und erledigt — ohne Briefing.
- Feynman-Prinzip: Pinecone-Cargo-Cult vermieden, n8n reicht.
- 39 Quests decken jetzt alle 68 Materialien ab — kein Quest mehr der ein Material verlangt das man nicht craften kann.

**Was nicht gut lief:**
- Doppelarbeit: Session-Start erkannte nicht dass Sprint 6 remote bereits fertig war (kein fetch vor Beginn).
- Smoke-Test blockiert durch Sandbox-Proxy — echte 403-Diagnose braucht man auf dem Gerät des Users.

**Lektion:** Immer `git fetch origin` als erstes — vor Code-Lesen.

---

---

# Sprint 7 — "Oscar steht auf der Insel"

**Sprint Goal:** Oscar sieht sich selbst auf der Insel. Die Insel fühlt sich wie eine Insel an — Wasser drumherum, Strand, Palmen. NPC-Buttons erscheinen wenn man einen Block antippt.

**Start:** 2026-03-30
**Ende:** 2026-03-30

---

## Sprint Backlog

| # | Item | Owner | Status |
|---|------|-------|--------|
| S7-1 | **Insel-Identität** (#40) — Wasser-Rand sichtbar, Strand-Gradient, Canvas fühlt sich an wie Insel nicht wie Spreadsheet | Designer + Engineer | 🔲 To do |
| S7-2 | **Spielfigur** (#55) — Kind benennt selbst (max 8 Buchst.), bewegt sich mit Pfeiltasten (PC) oder Finger-Drag (Touch) | Engineer + Designer | 🔲 To do |
| S7-3 | **NPCs sichtbar** (#48+#49) — NPC-Chat-Buttons tauchen nicht auf bei schatzinsel.app, Bernd fehlt | Engineer | 🔲 To do |

---

## Standup Log

### 2026-03-30 (Sprint 7 Planning)
- Sprint 6 Review done, PR #38 offen.
- Sprint 7: "Oscar steht auf der Insel." Drei Items, alle sichtbar für ein 8-jähriges Kind.
- S7-1 zuerst (visuell, kein State). S7-2 danach (Feature, braucht Canvas-Arbeit). S7-3 parallel prüfen.
