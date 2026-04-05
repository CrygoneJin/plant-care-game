# Product Backlog — Schnipsels Insel-Architekt

**Product Goal:** Kinder entdecken spielerisch dass Worte Dinge erschaffen.

**Strategie-Filter (Pereira):** Oscar baut, Oscar hört, Oscar staunt.
Alles was nicht in eine dieser Kategorien fällt → `ARCHIVE.md`.

---

## 🔴 P0 — Jetzt

| # | Item | Owner | Status |
|---|------|-------|--------|
| 103 | **Live Launch** — Playwright Tests + Stripe Donation + itch.io Upload | alle | 🔄 In Progress |
| 78 | **Tesla-Nutzertest auswerten** — 1h Video von Oscar im Tesla. Echte Nutzerdaten. Da ist Gold drin. | Scientist + Leader | 🔲 Offen |
| 27 | **Cloudflare Worker CORS** — User muss worker.js im Dashboard deployen | User | 🔲 Human Input |
| 92 | **Requesty Key rotieren** — Alter Key im Git-Verlauf. Sicherheitsrisiko. | Engineer | 🔲 Human Input |

## 🟡 P1 — Vor Spielplatz-Phase (10 Kinder)

| # | Item | Owner | Status | Oscar-Outcome |
|---|------|-------|--------|---------------|
| 11 | **Zellteilung game.js** — NPC-Daten in npc-data.js. game.js: 5196→5128. Grid/Effects noch drin. | Engineer | ✅ Done (S25-3, PR #212) | Oscar merkt nichts. Aber ohne das wird alles langsamer. |
| 50 | **Höhle = Dungeon** — Berg+Wasser=Höhle. IT-Ebenen Bits→Kernel→Browser im Dialog. | alle | ✅ Done (Commit #181, S25-2) | Oscar entdeckt eine neue Welt unter der Insel. |
| 71 | **Palette = Instrument** — mouseenter auf Palette-Buttons spielt Ton. Oscar spielt Melodie durch Hovern. | alle | ✅ Done (S25-1, PR #196) | Oscar spielt Musik und baut gleichzeitig. |
| 54 | **Jim Knopfs Welt** — Segelboot craften → Insel-Auswahl. Lummerland erreichbar. | alle | ✅ Done (S26-3, PR #220) | Oscar segelt zu neuen Inseln. |
| 95 | **Wu-Xing→NPC-Events** — NPCs reagieren auf Element-Events. Max 3x/Session, 15s Throttle. | Engineer + Artist | ✅ Done (S26-2, PR #219) | Mephisto flüstert wenn Oscar Feuer macht. |
| 96 | **NPC-Session-Gedächtnis** — NPCs erinnern sich an letzte Session via localStorage. | Engineer + Scientist | ✅ Done (S26-1, PR #218) | "Hey Oscar, gestern hast du viel Holz gebaut!" |
| 100 | **Energie vs Geld trennen** — NPC-Currencies (Burger, Noten, Glut) visuell von Muscheln trennen. Zwei Orte, zwei Konzepte. (Ricardo) | Designer | ✅ Done (S28-1, PR #238) | Oscar versteht sofort: Burger = Reden, Muschel = Kaufen. |
| 101 | **Krabbs-Vorrat sichtbar** — Krabbs hat endliches Inventar. Kein Holz → kein Verkauf. Angebot und Nachfrage ohne Erklärung. (Ricardo) | Engineer | ✅ Done (S28-2, PR #239) | Oscar lernt: wenn Krabbs kein Holz hat, muss er warten. |
| 102 | **MMX = Nerd-Easter-Egg** — Burn-Panel ehrlich labeln. Keine Goldstandard-Behauptung. (Ricardo) | Designer + Engineer | ✅ Done (S29-1, PR #241) | Nerds freuen sich. Oscar merkt nichts. |

## 🟢 P2 — Irgendwann, aber mit Oscar-Outcome

| # | Item | Owner | Status | Oscar-Outcome |
|---|------|-------|--------|---------------|
| 17 | **Eltern-Dashboard** — Bernd zeigt Spielstatistiken für Eltern | Engineer | ✅ Done (📊-Button + Bernd-NPC-Klick + Schatzkarte 🗺️) | Mama sieht was Oscar gebaut hat. |
| 33 | **Header-Title "Schatzinsel"** | Designer | ✅ Done (h1 + title-Tag existieren) | Kosmetik. 5 Minuten. |
| 34 | **NPCs in User-Sprache** — Eingabe Englisch → Antwort Englisch | Scientist | ✅ Done (S30-2, PR #243) | Oscars englischsprachige Freunde können mitspielen. |
| 37 | **Schöpfungsgeschichte als Tutorial** — 7 Level, Insel beginnt als Wasser | Leader | 🔄 Phase 1 Done (S31-2: Genesis-Toasts beim Ankommen) | Oscar erlebt wie seine Insel entsteht. |
| 42 | **Werkbank als Canvas-Drag** — Infinite Craft Pattern | Engineer | ✅ Done (Palette→Canvas drag + Inventar drag-drop existieren) | Oscar zieht Feuer auf Wasser statt Modal. |
| 62 | **Mehrsprachige NPCs** | Scientist | ✅ Done (S30-2 + S32-3: 5 Sprachen DE/EN/FR/ES/IT + englische NPC-Greetings) | Spielplatz-Phase mit nicht-deutschen Kindern. |
| 18 | **Musik on demand** | Artist + Engineer | ✅ Done (genre-btn + setGenre() existieren) | Oscar wählt seinen Soundtrack. |
| 23 | **Programmier-Tutorial** — NPCs bringen JavaScript bei | Scientist + Engineer | ✅ Done (PR #149 — 5 Lektionen, sandboxed Code-Editor, NPC-Guides) | Oscar lernt coden durch Spielen. |
| 19 | **Conway→Gameplay** — Lebende Zellen → Blumen, Glider → Wolken | Engineer + Scientist | ✅ Done (conway.js: bloom/stone/glider Events → Blöcke auf Grid) | Die Insel lebt auch wenn Oscar nicht baut. |
| 32 | **Code-Ebenen per Touch** — Swipe statt Rechtsklick | Engineer | ✅ Done |
| 103 | **Insel-Archipel** — Phase 1 (S29): Save/Load. Phase 2 (S31): Dino-Bucht. Phase 3 (S32): Schatzkarte mit 3-Wort-Adressen + Entdeckt-Badge. | alle | ✅ Done (S32-1, PR #245) | Oscar entdeckt mit dem Gelernten immer neue Welten — und findet immer den Weg nach Hause. |

---

## ✅ Erledigt (kompakt)

<details>
<summary>66 erledigte Items (klick zum Aufklappen)</summary>

| # | Item |
|---|------|
| 1 | Auto-Save |
| 2 | Accessibility Audit |
| 3 | Mobile Palette |
| 4 | Toolbar-Overflow |
| 5 | ~~Google Sheet~~ → Airtable |
| 6 | NPC-Stimmen geschärft |
| 7 | QR-Code auf Postkarte |
| 8 | Offline-Manifest |
| 9 | Mehr Quests (45) |
| 10 | Favicon + Meta-Tags |
| 12 | Voice-Pipeline (Gemini) |
| 13 | Programmiersprachen-NPCs |
| 14 | Haiku-Bauanleitungen |
| 15 | Tutorial ohne Text |
| 22 | Projekt-Sharing |
| 28 | Chat-Sidebar |
| 29 | NPC-Emoji eindeutig |
| 30 | Tonhöhe zu Elementen |
| 31 | Bauen/Ernten/Füllen Icons |
| 32 | Code-Ebenen per Touch |
| 40 | Insel-Identität |
| 41 | Sidebar Tabs |
| 43 | Save-System |
| 44 | schatzinsel.app |
| 45 | Canvas responsive |
| 46 | Drag & Drop Crafting |
| 47 | Quest-Balance |
| 48 | NPCs sichtbar |
| 49 | Bernd Support-Chat |
| 51 | Wu Xing im Craft-Prompt |
| 53 | Echtes Atlantik-Wetter |
| 55 | Spielfigur auf der Insel |
| 57 | Stille-Momente |
| 58 | Unsinn-Rezepte |
| 59 | 10-Sekunden-Erster-Moment |
| 61 | Konsequenz-System |
| 63 | KLONK |
| 64 | Crafting-Blitz |
| 66 | Spielfigur-Lag fix |
| 67 | Automerge wie 2048 |
| 68 | Tutorial pulsiert |
| 69 | Genesis-Badge |
| 70 | KLONK vor erstem Block |
| 74 | NPC-Persönlichkeiten |
| 75 | Wunschfee Floriane |
| 76 | Craft-Ergebnis visuell |
| 80 | Projekt-Docs |
| 81 | Inventar-Töne |
| 82 | Bau-Trommel |
| 83 | Urknall-Crafting |
| 84 | Höhlen + Edelsteine |
| 85 | Genre-Tonsequenzen |
| 86 | CI/CD Pipeline |
| 87 | TTS Hörspiele |
| 88 | Floriane |
| 94 | Crypto Dust Donations |
| 97 | Oscar als 7. Schicht |

</details>

---

## Priorisierungs-Regel

**Oscar-Filter:** "Würde Oscar das in 4 Wochen benutzen?"
Ja → bleibt. Nein → `ARCHIVE.md`.
Bei Gleichstand: Zugänglichkeit vor Features (Mandela).
Feynman misst ob es sich gelohnt hat.

---

*Pereira-Audit: 2026-04-02. Backlog von 99 auf 18 aktive Items reduziert.*
*Archivierte Items: siehe `ARCHIVE.md`*
