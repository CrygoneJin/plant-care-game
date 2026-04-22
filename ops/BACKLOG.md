# Product Backlog — Schnipsels Insel-Architekt

**Product Goal:** Kinder entdecken spielerisch dass Worte Dinge erschaffen.

**Strategie-Filter (Pereira):** Oscar baut, Oscar hört, Oscar staunt.
Alles was nicht in eine dieser Kategorien fällt → `ARCHIVE.md`.

---

## 🚨 HITL — Till, max 3

Nur Items die **wirklich** Till brauchen (Credentials, Dashboards, Outreach).
Alles andere ist delegiert oder im Eis.

| # | Item | Warum HITL | Zeitbudget |
|---|------|------------|-----------|
| 27 | **Cloudflare Worker deployen** — `cd src/infra && npx wrangler deploy` (siehe Chat 2026-04-22 für How-To) | CF-Login | 5 Min |
| 108 | **Native Speaker Review ES/IT** — 2 Leute anschreiben, NPC-Strings prüfen lassen (FR macht Till selbst) | Outreach an echte Menschen | 10 Min |

**Wenn beide erledigt:** Backlog ist HITL-frei. Agenten können autonom weitermachen.

*Erledigt 2026-04-22:* #92 Requesty-Key-Rotation — Till-Entscheidung: Key darf im Verlauf bleiben.

---

## 🔄 In Progress — delegiert an Agenten

| # | Item | Owner | Status |
|---|------|-------|--------|
| 110 | **PR #430 Lummerland-Reboot Fundament** — Seed, Tao-Only, Decay-Fix, Lummerland-Kanon | Engineer done, Leader reviewt | 🟡 PR offen auf `feat/lummerland-seed-tao-only` |
| 103 | **Live Launch** — Playwright Tests + Stripe Donation + itch.io Upload | Leader | 🤖 In Nacht-Session (2026-04-20) |
| 78 | **Tesla-Nutzertest auswerten** — 1h Video von Oscar im Tesla | Scientist | 🔲 Wartet auf Video-Upload von Till |

---

## 🔥 Epic: Physik-Vollausbau (S98–S101, Einstein-Prio 2026-04-22)

Ein Feature pro Sprint. Kette bricht wenn Oscar S98 nicht anfasst.

| # | Sprint | Item | Owner | Status |
|---|--------|------|-------|--------|
| 110 | S98 | PR #430 Merge + NPC „Der Ratlose" (Krapweis-Hinweis) + Oscar-Smoke | Leader/Artist/Till | 🤖 S98 läuft |
| 117 | S99 | Baryon-Triplet: Proton (Yang+Yang+Yin), Neutron (Yang+Yin+Yin) — Infrastruktur für Atome | Engineer + Scientist (Rule-Order) | 🔲 |
| 118 | S100 | Atom-Cluster-Pattern-Recognizer: H→Ca, Orbital-Ring-Rendering, Ladung emergiert implizit | Engineer + Designer | 🔲 |
| 119 | S101 | Higgs + Raumkrümmung + Blackhole-Einsauger (gebündelt) | Engineer + Designer + Scientist (Perf) | 🔲 |

**Killed (Einstein 2026-04-22):** Ladung als eigenständiger Sprint — emergiert in S100. ~~#112~~

---

## 🟡 P1 — Vor Spielplatz-Phase (10 Kinder)

Alles erledigt. Siehe Archiv unten.

---

## 🟢 P2 — Irgendwann, aber mit Oscar-Outcome

Alles erledigt. Siehe Archiv unten.

---

## ❄️ Icebox — bewusst zurückgestellt

| # | Item | Grund |
|---|------|-------|
| — | **ES/IT NPC-Strings** — Spanische + Italienische NPC-Gedächtnis-Texte | Kein Native Speaker Review (siehe HITL #108). Supported: DE/EN/FR/AR/HE. |

---

## ✅ Erledigt — alle historischen P0/P1/P2 Items

<details>
<summary>85+ Items (klick zum Aufklappen)</summary>

**P0 historisch:**
| # | Item | PR/Commit |
|---|------|-----------|
| 104 | Onboarding "Wo spielen?" | S37-1, PR #251 |
| 105 | Long-Press = Fill, Mausrad = Tool-Wechsel | S37-2, PR #251 |
| 106 | Palette-Duplikat entfernen | S37-3, PR #251 |
| 107 | Tetris + Snake Easter Egg | S39-1 PR #253, S40-1 |

**P1 historisch:**
| # | Item | PR/Commit | Oscar-Outcome |
|---|------|-----------|---------------|
| 11 | Zellteilung game.js | S25-3, PR #212 | Merkt Oscar nicht, aber wichtig. |
| 50 | Höhle = Dungeon | Commit #181, S25-2 | Neue Welt unter der Insel. |
| 71 | Palette = Instrument | S25-1, PR #196 | Musik + Bauen gleichzeitig. |
| 54 | Jim Knopfs Welt | S26-3, PR #220 | Segeln zu Lummerland. |
| 95 | Wu-Xing→NPC-Events | S26-2, PR #219 | Mephisto flüstert bei Feuer. |
| 96 | NPC-Session-Gedächtnis | S26-1, PR #218 | NPCs erinnern sich. |
| 100 | Energie vs Geld trennen | S28-1, PR #238 | Burger ≠ Muschel. |
| 101 | Krabbs-Vorrat sichtbar | S28-2, PR #239 | Kein Holz = kein Verkauf. |
| 102 | MMX = Nerd-Easter-Egg | S29-1, PR #241 | Nerds freuen sich. |

**P2 historisch:**
| # | Item | PR/Commit |
|---|------|-----------|
| 17 | Eltern-Dashboard (📊 + Bernd + Schatzkarte) | Done |
| 33 | Header-Title "Schatzinsel" | Done |
| 34 | NPCs in User-Sprache | S30-2, PR #243 |
| 37 | Schöpfungsgeschichte als Tutorial | S31-2 + S38-3, PR #252 |
| 42 | Werkbank als Canvas-Drag | Done |
| 62 | Mehrsprachige NPCs (5 Sprachen) | S30-2 + S32-3 |
| 18 | Musik on demand | Done |
| 23 | Programmier-Tutorial (5 Lektionen) | PR #149 |
| 19 | Conway→Gameplay | Done |
| 32 | Code-Ebenen per Touch | Done |
| 103 (alt) | Insel-Archipel | S32-1, PR #245 |

**Ur-Backlog (66 Items):**
Auto-Save · Accessibility Audit · Mobile Palette · Toolbar-Overflow · Airtable (ex-Sheet) · NPC-Stimmen · QR-Code · Offline-Manifest · 45 Quests · Favicon+Meta · Voice-Pipeline · Programmiersprachen-NPCs · Haiku-Bauanleitungen · Tutorial ohne Text · Projekt-Sharing · Chat-Sidebar · NPC-Emoji eindeutig · Tonhöhe zu Elementen · Icons (Bauen/Ernten/Füllen) · Code-Ebenen Touch · Insel-Identität · Sidebar Tabs · Save-System · schatzinsel.app · Canvas responsive · Drag & Drop Crafting · Quest-Balance · NPCs sichtbar · Bernd Support-Chat · Wu Xing Craft-Prompt · Atlantik-Wetter · Spielfigur · Stille-Momente · Unsinn-Rezepte · 10s-Erster-Moment · Konsequenz-System · KLONK · Crafting-Blitz · Spielfigur-Lag · Automerge · Tutorial pulsiert · Genesis-Badge · KLONK vor erstem Block · NPC-Persönlichkeiten · Wunschfee Floriane · Craft-Ergebnis visuell · Projekt-Docs · Inventar-Töne · Bau-Trommel · Urknall-Crafting · Höhlen+Edelsteine · Genre-Tonsequenzen · CI/CD · TTS Hörspiele · Floriane · Crypto Dust Donations · Oscar als 7. Schicht

**Quest-Konsolidierung (April 2026):**
- PR #381 — 196→696 Quests (Runden 20-68)
- PR #382 — ISO-Renderer Fix (Tesla-Canvas)
- PR #383 — 696→706 (Runde 69)
- PR #387 — 706→716 (Runde 70)
- PR #390 — 716→726 (Runde 69 erweitert)
- PR #392 — 726→736 (Runde 72)
- PR #393 — 736→775 (Konsolidierung alter PRs #308-#367)

</details>

---

## Priorisierungs-Regel

**Oscar-Filter:** "Würde Oscar das in 4 Wochen benutzen?"
Ja → bleibt. Nein → `ARCHIVE.md`.
Bei Gleichstand: Zugänglichkeit vor Features (Mandela).
Feynman misst ob es sich gelohnt hat.

---

*Letzte Reorganisation: 2026-04-20 (Session 98, Nacht-AFK).*
*Prinzip: HITL-Items sind das was wirklich Till braucht. Alles andere ist delegiert oder im Eis.*
*Archivierte Items: siehe `ARCHIVE.md`*
