# Product Backlog — Schnipsels Insel-Architekt

**Product Goal:** Kinder entdecken spielerisch dass Worte Dinge erschaffen. "Außer Text nix gehext."

---

## 🔴 P0 — Muss vor erstem echtem Test

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | **Auto-Save** — localStorage speichert Grid alle 30s automatisch | Engineer | ✅ Done |
| 2 | **Accessibility Audit** — Screenreader-Test, Tab-Navigation, Kontraste | Designer + Hick | ✅ Done (ARIA, Escape, Dialoge) |
| 3 | **Mobile Palette** — klappbar oder horizontal scrollbar auf iPad | Designer | ✅ Done |
| 4 | **Toolbar-Overflow auf Mobile** — 7 Buttons brechen auf kleinen Screens | Designer | ✅ Done |
| 5 | **Google Sheet Webhook einrichten** — Testdaten automatisch einsammeln | Engineer | 🔲 Offen |

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

---

## Priorisierungs-Regel

**Einstein entscheidet.** Bei Gleichstand: Mandela-Bedingung gewinnt (Zugänglichkeit vor Features). Feynman misst ob es sich gelohnt hat.
