# Product Backlog — Schnipsels Insel-Architekt

**Product Goal:** Kinder entdecken spielerisch dass Worte Dinge erschaffen.

**Strategie-Filter (Pereira):** Oscar baut, Oscar hört, Oscar staunt.
Alles was nicht in eine dieser Kategorien fällt → `ARCHIVE.md`.

---

## 🚨 HITL — Till

Nur Items die **wirklich** Till brauchen (sein Kind beobachten, Browser-Settings, Copyright-Entscheidungen).

| # | Item | Warum HITL | Zeitbudget |
|---|------|------------|-----------|
| 1 | **Oscar-Smoke nach Caves-Fix** — morgen früh iPad hinlegen, weggucken. 1 Satz. | Kind beobachten | 10 Min |
| 2 | **Analytics-Opt-in aktivieren** auf Oscars Device: `localStorage.setItem('insel-analytics-optin', 'true')` + reload. | Privacy-by-default | 2 Min |
| 3 | **IDB-Persistenz verifizieren** — Tesla-Browser Console-Log nach erstem Auto-Aus+An. Greift der Restore? | Nur im echten Tesla | 3 Min |
| 4 | **Buch v2 skimmen** — `docs/buch/schatzinsel-v2-2026-04-23.md`, go/no-go für v3 | Autoren-Urteil | 30 Min |
| 5 | **Michael-Ende-Copyright** — falls Buch publiziert: Namen generisch oder Rechte klären | Nur bei Publikation | 5 Min + evtl. Verlagsmail |

*Erledigt 2026-04-22:* #27 CF-Worker-Deploy — **automatisiert** via PR #438 (GitHub Actions bei push:main).
*Erledigt 2026-04-22:* #92 Requesty-Key-Rotation — Till-Entscheidung: Key darf im Verlauf bleiben.
*Erledigt 2026-04-23:* HITL #108 — Wittgenstein-Opus-Review ersetzt Native-Speaker-Review (zwei IT/ES-Grammatik-Bugs nebenbei gefixt).

---

## 🔄 In Progress — delegiert an Agenten

| # | Item | Owner | Status |
|---|------|-------|--------|
| 78 | **Tesla-Nutzertest auswerten** — 1h Video von Oscar im Tesla | Scientist | 🔲 Wartet auf Video-Upload von Till |
| K15 | **Hörspiel Kapitel 15 — Die Katze** (Lindgren-Anregung, Buch hat sie, Hörspiel nicht) | Artist → Tommy Krab | 🤖 Nacht-Spawn 2026-04-24 |
| 120 | **Neutrino-Mu/Tau-Recipes** — nach Pauli-Selbstupgrade-Fix (PR #495) fehlen Gen-Upgrade-Pfade für Neutrino-Familie | Scientist/Planck | 🤖 Nacht-Spawn 2026-04-24 |
| 121 | **Visuelle Regression-Tests erweitern** — Cave-Test existiert (PR #495), fehlt: Iso-Mode, Lummerland-Seed, andere Insel-Typen, Nacht/Tag | Engineer/Kernighan | 🤖 Nacht-Spawn 2026-04-24 |

*Archiviert:* #103 Live Launch (alter Eintrag von 2026-04-20, Status überholt — itch.io-Deploy läuft via PR #438-Pattern automatisch über GitHub Actions).

---

## ✅ Epic: Physik-Vollausbau — abgeschlossen (S98–S101)

| # | Sprint | Item | Status |
|---|--------|------|--------|
| 110 | S98 | Lummerland-Reboot + NPC „Der Ratlose" + Oscar-Smoke (HITL offen) | ✅ PR #430 + #432 gemergt |
| 117 | S99 | Baryon-Triplet: Proton (Yang+Yang+Yin), Neutron (Yang+Yin+Yin) | ✅ PR #434 gemergt |
| 118 | S100 | Atom-Cluster-Pattern-Recognizer: H, He-3, He-4, Orbital-Ring | ✅ PR #435 gemergt |
| 119 | S101 | Higgs + Raumkrümmung + Blackhole-Einsauger | ✅ PR #436 gemergt |

**17 Standardmodell-Teilchen + 31 Hauptgruppen-Elemente live. Oscar-Smoke (HITL) noch ausstehend.**
**S102-Kette: CEO-Input nach Oscar-Smoke-Ergebnis.**

---

## 🟡 P1 — Vor Spielplatz-Phase (10 Kinder)

Alles erledigt. Siehe Archiv unten.

---

## 🟢 P2 — Irgendwann, aber mit Oscar-Outcome

Alles erledigt. Siehe Archiv unten.

---

## ❄️ Icebox — bewusst zurückgestellt

_Leer — ES/IT NPC-Strings 2026-04-23 durch Opus auf Native-Niveau poliert (HITL #108 aufgelöst). AR/HE NPC-Memory-Strings sind nicht implementiert (nur i18n.js hat UI AR/HE), separates Ticket bei Bedarf._

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
