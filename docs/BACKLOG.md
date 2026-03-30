# Product Backlog — Schnipsels Insel-Architekt

**Product Goal:** Kinder entdecken spielerisch dass Worte Dinge erschaffen. "Außer Text nix gehext." — Tao: Everything flows. Die 5 Elemente sind ein Kreislauf, kein Inventar.

---

## 🔴 P0 — Muss vor erstem echtem Test

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | **Auto-Save** — localStorage speichert Grid alle 30s automatisch | Engineer | ✅ Done |
| 2 | **Accessibility Audit** — Screenreader-Test, Tab-Navigation, Kontraste | Designer + Hick | ✅ Done (ARIA, Escape, Dialoge) |
| 3 | **Mobile Palette** — klappbar oder horizontal scrollbar auf iPad | Designer | ✅ Done |
| 4 | **Toolbar-Overflow auf Mobile** — 7 Buttons brechen auf kleinen Screens | Designer | ✅ Done |
| 5 | **Google Sheet Webhook einrichten** — Testdaten automatisch einsammeln | Engineer | 🔲 Offen |
| 44 | **schatzinsel.app → GitHub Pages** — DNS in Cloudflare auf GitHub IPs, Custom Domain setzen | Engineer | 🔲 Offen |

## 🟡 P1 — Vor Spielplatz-Phase (10 User)

| # | Item | Owner | Status |
|---|------|-------|--------|
| 6 | **NPC-Stimmen schärfen** — Ogilvy: Jeder NPC braucht typographisches Tick | Artist | ✅ Done (Elefant/Krabs/Tommy) |
| 7 | **QR-Code auf Postkarte** — Godin/Welch: Scannen → direkt zum Spiel | Engineer | 🔲 Offen |
| 8 | **Offline-Manifest** — Service Worker für Spielen ohne Internet | Engineer | 🔲 Offen |
| 9 | **Mehr Quests** — 11 Templates sind zu wenig, mindestens 20 | Artist + Leader | 🔲 Offen |
| 10 | **Favicon + Meta-Tags** — Torvalds: "10 Minuten, großer Unterschied" | Engineer | ✅ Done |
| 11 | **Zellteilung game.js** — Sound, Quests, Effects, Stories, Analytics rausziehen | Engineer | 🔲 Offen |

## 🟢 P2 — Vor "100 User"-Phase

| # | Item | Owner | Status |
|---|------|-------|--------|
| 12 | **Voice-Pipeline** — Cartesia + vapi.ai, NPCs sprechen wirklich | Engineer + Scientist | 🔲 Offen |
| 13 | **Mehr Programmiersprachen-Bewohner** — Haskell, Lua, SQL, Scratch | Artist | 🔲 Offen |
| 14 | **Haiku-Bauanleitungen** — Quests in 5-7-5 Silben (Krapweis-Idee) | Artist | 🔲 Offen |
| 15 | **Tutorial ohne Text** — Mandela: Kinder die nicht lesen können | Designer | 🔲 Offen |
| 16 | **Premium-Themes** — 3 weitere Themes als optionaler Kauf | Designer | 🔲 Offen |
| 17 | **Eltern-Dashboard** — Bernd zeigt Spielstatistiken für Eltern | Engineer | 🔲 Offen |
| 18 | **Musik on demand** — Loisach Marci Stil, Hardstyle kinderkompatibel | Artist + Engineer | 🔲 Offen |

## 🔵 P3 — Vision / Irgendwann

| # | Item | Owner | Status |
|---|------|-------|--------|
| 19 | **Game of Life Screensaver** — Conway-Regeln auf dem Grid wenn idle. Zellen leben, sterben, wachsen. Touch = Reset auf statische Insel. Perfekt für Auto-Display, Wartezimmer, Ladestation. | Engineer | 🔲 Offen |
| 20 | **Multiplayer** — Inseln besuchen, gemeinsam bauen | Engineer | 🔲 Offen |
| 21 | **Leaderboard** — Meiste Blöcke, meiste Entdeckungen, kreativstes Bauwerk | Engineer | 🔲 Offen |
| 22 | **Projekt-Sharing** — URL die eine Insel teilt (Base64-encoded Grid) | Engineer | 🔲 Offen |
| 23 | **Programmier-Tutorial** — NPCs bringen echtes JavaScript bei | Scientist + Engineer | 🔲 Offen |
| 24 | **AR-Modus** — Insel auf dem Tisch via WebXR | Engineer | 🔲 Offen |
| 25 | **Hörspiel-Aufnahmen** — Professionelle Sprecher für die Hörspiele | Artist | 🔲 Offen |
| 26 | **ZKM-Ausstellung** — "Mensch, Maschine, KI" als Installation | Leader + alle | 🔲 Offen |

---

## Done (diese Session)

| # | Was | Commit |
|---|-----|--------|
| ✅ | Quest-System (11 Templates, Feynman-kalibriert) | 70d6e1f |
| ✅ | Achievement-System (12 Achievements) | 70d6e1f |
| ✅ | Sound-System (Web Audio API) | 70d6e1f |
| ✅ | Token Flywheel (Quests → Energie → Chat) | 70d6e1f |
| ✅ | 5 Themes (Tropical, Night, Candy, Ocean, Retro) | 70d6e1f |
| ✅ | Wetter-System (Regen, Sonne, Regenbogen) | 70d6e1f |
| ✅ | Day/Night Cycle (Echtzeit) | caf8bb4 |
| ✅ | Charakter-Währungen (7 NPCs) | 3a3f083 |
| ✅ | Kindersicherheit (Anti-Jailbreak, Input-Sanitizing) | 70d6e1f |
| ✅ | NPC-Parenting (Cringe-Platitüden) | 70d6e1f |
| ✅ | Bernd das Brot (Eltern-Support) | 5f5a5a1 |
| ✅ | LLM-Persönlichkeiten (Open Source = Freidenker) | bcb528f |
| ✅ | Code-Zauber ("baue 5 bäume" → es passiert) | 8aeca3a |
| ✅ | Code-View (</> Button) | 8aeca3a |
| ✅ | Insel Java (18 Programmiersprachen-Bewohner) | c762ffa..a3f9cc0 |
| ✅ | Spontan-Hörspiele (6 Szenen) | e086f8c |
| ✅ | Postkarte von Java (PNG-Download) | 5af4f2b |
| ✅ | Toast-Queue (Weber-Fix) | 5519cc2 |
| ✅ | Intro gekürzt (Salimi-Fix) | 306ba5c |
| ✅ | ARIA-Labels (Mandela-Fix) | a9ea3f2 |
| ✅ | Padawan-Codex-Dateien (5 Padawans) | f64b33b |
| ✅ | Testkonzept (5 Testkinder, 5 Hypothesen) | e0695e6 |
| ✅ | Feynman-Messpunkte (Session-Uhr + Milestones) | 63d09be |
| ✅ | Anonyme Testdaten-Sammlung (Clipboard + Webhook) | 94f612c |
| ✅ | Favicon + Meta + Schnittmarkierungen | 5144a9b |
| ✅ | BYOK Dialog (Bring Your Own Key) | d0c011a |
| ✅ | config.js Zero-Setup (Key einmal, nie wieder) | e5cfb5b |
| ✅ | Hirn-Transplantation (pro Charakter anderes Modell) | 141eb7d |
| ✅ | Charakter-Freischaltung (Starter + Unlock durch Quests) | 3e1f7b2 |
| ✅ | Auto-Save (30s + beforeunload + Restore) | 7f4ce66 |
| ✅ | Mobile Toolbar + Palette (horizontal scroll) | 5a5fa51 |
| ✅ | Accessibility (ARIA Dialoge, Escape-Key) | f017d5a |
| ✅ | Spielername + Intro-Polish | a12bed1 |
| ✅ | Undo (Strg+Z, 50 Schritte) | 30faac3 |
| ✅ | Keyboard-Shortcuts (B/D/F) | 30faac3 |
| ✅ | NPC-Stimmen geschärft (Elefant/Krabs/Tommy) | 899cb9d |
| ✅ | Bug-Fixes: Unlock-Threshold, Model-Selection | f017d5a |
| ✅ | 五行 Wu Xing: 5 Elemente (Metall/Holz/Feuer/Wasser/Erde) | 0cc40e7 |
| ✅ | Harvest-System: Ernten ersetzt Axt+Abreißen | 789fd1a |
| ✅ | Palette-Unlock: Crafting schaltet Artefakte frei | 789fd1a |
| ✅ | 五音 Element-Töne (pythagoräische Pentatonik) | f7f17d0 |
| ✅ | Palette als Klavier (Kind-Feature-Request) | 6b53fd3 |
| ✅ | Regenbogen als Hintergrund-Effekt | 61dda7a |
| ✅ | 20 Crafting-Rezepte, alle Quests lösbar | e743185 |
| ✅ | Save-Migration (alte Saves ohne unlocked) | be08f18 |
| ✅ | Infinite Craft — LLM-generierte Rezepte mit KV-Cache | 695eff10 |
| ✅ | Entdecker-System — Erster Finder steht am Rezept | 695eff10 |
| ✅ | /discoveries Leaderboard-Endpoint | 8cf45f0c |
| ✅ | Labels weg + Erde braun + Wasser blau | a75cb576 |
| ✅ | Requesty Migration (Langdock → Requesty) | 01a52fb |
| ✅ | Wu Xing Farben korrekt (Holz=Qing) | 01a52fb |
| ✅ | Easter Egg Fix: C war nicht Erster | 38a711b |

---

## 🌍 Schöpfungsgeschichten — Konzepte für Insel-Genesis

Idee: Die leere Insel (nur Wasser) wird in einer Sequenz erschaffen. Verschiedene Schöpfungs-Mythen als A/B-Varianten. Alle kindgerecht, alle mit demselben Gameplay-Unterbau.

### Variante A — Bibel (monotheistisch)
> "Am Anfang war das Wort. Und das Wort war bei Gott. Und die Erde war wüst und leer."

- Tag 1: Licht (Tageszeit-System schaltet sich ein)
- Tag 2: Himmel und Wasser (Ozean erscheint, Hintergrund wird blau)
- Tag 3: Erde (erste Inselkacheln tauchen auf, Pflanzen erscheinen)
- Tag 4: Sonne, Mond, Sterne (Wetter-System, Day/Night-Cycle)
- Tag 5: Fische und Vögel (Fisch-Material freigeschaltet)
- Tag 6: Tiere und der Mensch / Schnipsel kommt auf die Insel
- Tag 7: Ruhetag (Sonntag) — **Postkarte wird freigeschaltet**. Insel "rastet". Eigenmotivation: Kinder schließen das Tutorial ab, weil die Postkarte wartet — nicht weil sie müssen. Bernd ist für alle Fragen da, kein Hilfetext im Tutorial selbst.

### Variante B — Griechische Mythologie
> "Am Anfang war das Chaos — formlos, unendlich, dunkel."

- Gaia (Erde) steigt aus dem Chaos: Insel erscheint
- Kronos (Zeit): Day/Night-Cycle schaltet sich ein
- Poseidon: Ozean erscheint drumherum, Boote werden freigeschaltet
- Hephaistos (Feuer + Metall): Erste Handwerksmaterialien
- Demeter (Ernte): Pflanzen, Bäume, Harvest-System
- Prometheus gibt Feuer → Code-Zauber schaltet sich ein (Worte werden Dinge)
- "Du bist der neue Architekt. Die Götter haben gebaut. Jetzt du."

### Variante C — Maori (Ozeanisch)
> "Te Kore — die Leere. Te Pō — die Nacht. Te Ao — das Licht."

- Ranginui (Himmel) und Papatūānuku (Erde) werden getrennt → Licht entsteht
- Tāne (Wälder): Bäume wachsen, Wald-Materialien freigeschaltet
- Tangaroa (Ozean): Wasser erscheint, Fische kommen
- Rongo (Pflanzen): Garten-Materialien
- "Die Insel singt. Baue damit sie bleibt."

### Variante D — Nordisch
> "Im Anfang war Ginnungagap — die gähnende Leere."

- Aus Eis und Feuer entsteht Yggdrasil (Baum der Welt): erster Baum erscheint
- Odin, Vili, Ve formen die Welt: Insel wächst
- Dwarfs (Zwerge) schmieden: Metall-Crafting freigeschaltet
- Thor: Wetter-System, Blitz bei Regen
- Loki: Easter Eggs, versteckte Dinge auf der Insel
- "Ragnarök kommt irgendwann — die Insel verschwindet. Heute nicht."

### Variante E — Tao / Wu Xing (bereits im Spiel)
> "Das Tao gebar das Eine. Das Eine gebar das Zwei. Das Zwei gebar das Drei. Das Drei gebar die zehntausend Dinge."

- Bereits umgesetzt als 五行 (Metall, Holz, Feuer, Wasser, Erde)
- Könnte als "Origin Story" verpackt werden statt nur als Materialien

### Nächste Schritte (wenn bereit)
- A/B Test: Bibel vs. Griechisch (welche kommt bei Kindern besser an?)
- Feynman definiert Messpunkt: "Wie lange bis erstes freies Bauen nach Tutorial?"
- Ogilvy formuliert die Texte (kindgerecht, maximal 1 Satz pro Schritt)
- Rams entscheidet: 7 Level Tutorial oder 3? (Kinder verlieren nach 3 Klicks Geduld)

---

## 🔧 Offene Punkte aus Session 2026-03-29

| # | Item | Prio | Owner |
|---|------|------|-------|
| 27 | **Cloudflare Worker CORS fixen** — User muss worker.js im Dashboard deployen | P0 | User |
| 28 | **Chat-Fenster nicht überlappend** — als Sidebar oder unten, kein Overlay über Canvas | P1 | Designer |
| 29 | **NPC-Emoji eindeutig** — Tommy=🦞 ✅, alle anderen prüfen, kein Doppler | P1 | Artist |
| 30 | **Tonhöhe zu Elementen** — Feuer=höher, Erde=tiefer, Wasser=fließend | P1 | Scientist |
| 31 | **Bauen/Ernten/Füllen Icons** — universelle Symbole statt Text-Labels | P1 | Designer |
| 32 | **Code-Ebenen per Touch** — Rechts/Links-Swipe statt Rechtsklick | P1 | Engineer |
| 33 | **Header-Title "Schatzinsel"** — aktuell "Schnipsels Insel-Architekt" | P2 | Designer |
| 34 | **NPCs antworten in User-Sprache** — Eingabe Englisch → Antwort Englisch | P2 | Scientist |
| 35 | **Eigene NPCs craften** — Custom-Charakter aus Materialien bauen | P3 | alle |
| 36 | **Wigald Boning & Willy Astor** — noch kein Symbol, kein Slot, kein Konzept | P3 | Artist |
| 37 | **Schöpfungsgeschichte als Tutorial** — 7 Level, Insel beginnt als reines Wasser | P2 | Leader |
| 38 | **A/B Test Mythologie** — Bibel vs. Griechisch vs. Maori vs. Nordisch | P2 | Scientist |
| 39 | **Tutorial-Gating: Postkarte erst in Schritt 7 (Sonntag)** — Motivation, Tutorium ohne Hilfetext abzuschließen | P2 | Engineer |
| 40 | **Insel-Identität zurückbringen** — Wasser-Rand sichtbar, Strand-Gradient, Palmen-Starter, Canvas fühlt sich an wie Insel nicht wie Spreadsheet | P0 | Designer + Engineer |
| 41 | **Sidebar Tabs** — nur eine Sektion sichtbar (Inventar/Quests/Erfolge als Tabs), nicht alles gestapelt | P1 | Designer |
| 42 | **Werkbank als Canvas-Drag** — Drag Element-A auf Element-B statt 3×3 Modal (Infinite Craft Pattern) | P2 | Engineer |
| 43 | **Save-System** — localStorage Grid-Persist, Oskar baut nicht nochmal | P0 | Engineer |
| 45 | **Canvas 16:9 auf PC, iPad-Ratio auf iPad, iPhone-Ratio auf iPhone** — Grid-Dimensionen responsive | P1 | Engineer + Designer |
| 46 | **Drag & Drop Crafting** — Materialien auf Canvas ziehen statt Klick (Oscars Wunsch) | P1 | Engineer |
| 47 | **Quests/Achievements zu schnell** — Schwierigkeitsgrad erhöhen, passen nicht zur leeren Insel | P1 | Scientist |
| 48 | **NPCs nicht sichtbar** — Chat-Button/NPCs tauchen nicht auf bei schatzinsel.app | P0 | Engineer |
| 49 | **Bernd Support-Chat fehlt** — Bernd als Hilfe-NPC nicht erreichbar | P0 | Engineer |
| 50 | **Höhle = Abenteuer-Dungeon** — 10 emergente Ebenen, je tiefer desto fantastischer + unsichtbar technischer (Amélie-Prinzip). Pilze in Binärmuster, Fackeln in Hex-Farben, Drache bewacht CPU-Zyklen. **Bürokraten-Ebene** (Jim Knopf Bonzen): Stempel-Crafting-Puzzle, Formulare in dreifacher Ausfertigung, Haiku-Genehmigungen — tragisch-komisch, nicht nur Satire (Weber: Regeln haben Gründe). **Ebene 9 = Mandelbrot** (zoombar, Wu-Xing-Farben, endlos). PR #13 als Basis. | P1 | alle |
| 51 | **Wu Xing Philosophie im Craft-Prompt** — Holz=Expansion, Feuer=Aktion, Erde=Wandlung, Metall=Reife, Wasser=Ruhe | P1 | Scientist |
| 52 | **Kung Fu Panda Wuxi** — Ästhetik-Inspiration für Wu Xing Elemente | P2 | Artist |
| 53 | **Echtes Atlantik-Wetter** — Open-Meteo API (29°N, 31°W — halber Weg Martinique↔Bayonne), 🌊 im Meer wetterabhängig | P1 | Engineer |
| 54 | **Jim Knopfs Welt als offene Inselkarte** — Lummerland (Tutorial) → Meer → Mandala/Ping → Wüste (Turtur, Modelleisenbahn craften!) → Drachenstadt → Kummerland → Schatzinsel. Nicht linear, nicht gescriptet. Oscar wählt wohin. Jede Station: eigene Materialien, NPCs, Rezepte. Boot craften = nächste Insel erreichbar. Zahlenreihe: 0/1→3→5→10.000. | P1 | alle |
| 55 | **Spielfigur auf der Insel** — Kind benennt selbst (max 8 Buchstaben), bewegbar mit Pfeiltasten (PC) oder Finger-Drag (Touch) | P1 | Engineer + Designer |
| 56 | **Bibliothek von Alexandria** — Gebäude auf der Insel (Stein+Bretter+Wissen), Schriftrollen statt Bücher, jede Rolle = Wiki-Game-Challenge ("Von Wasser zu Drache in X Schritten"). Timbuktu als zweite Bibliothek — wer beide baut verbindet zwei Wissenswelten. Papyrus vor Gutenberg. Wikipedia von damals. | P2 | alle |

---

## Priorisierungs-Regel

**Einstein entscheidet.** Bei Gleichstand: Mandela-Bedingung gewinnt (Zugänglichkeit vor Features). Feynman misst ob es sich gelohnt hat.
