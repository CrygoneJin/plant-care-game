# Memory

Persistent team log. Append-only. Read by all agents.

---

## Bugs (so we don't repeat them)

| 2026-03-30 | Backlog-Drift: 14 Items waren in Code done aber Backlog zeigte 🔲 | Keine Session-übergreifende Backlog-Pflege | Am Ende jeder Session: Backlog-Zeilen updaten, bevor MEMORY geschrieben wird |
| 2026-04-03 | CI kaputt seit 31.3 — `sleep 2` reicht nicht für `npx serve` | Race Condition: Server startet nach Puppeteer | `curl`-Retry-Loop statt `sleep`, SW Cache-Version auto per Commit-Count |
| 2026-04-03 | NPCs nicht sichtbar auf Live-Site | CI kaputt → kein Deploy → alte game.js ohne NPC-Grid-Code | Root Cause war CI, nicht NPC-Code. Immer CI-Status prüfen bei "Feature fehlt auf Prod" |
| 2026-04-03 | Root Cleanup 1·3·5·10000 + Isidor-Modell | 42 JS-Dateien + 13 MD im Root = Chaos | src/(core,world,infra), docs/, ops/. archive/library nur wenn befüllt. tsconfig: nur typsichere Dateien includen (nicht alles per Glob) |
| 2026-04-03 | S25-2 (Dungeon) war schon in main (commit #181) aber SPRINT.md nicht aktualisiert | Zwei Features in einer Session — SPRINT.md-Update vergessen | Nach jedem Commit: SPRINT.md sofort aktualisieren. Nicht am Session-Ende sammeln. |
| 2026-04-03 | S25-3: NPC-Daten → npc-data.js. game.js 4979→4920 (−59 LOC). PR #205 | window.INSEL_NPC_DATA Pattern wie materials.js/stories.js. tsc grün. | Zellteilung in kleinen Schritten: ~60 LOC pro Session ist realistisch. Kein Big Bang. |

| Datum | Was | Warum | Lektion |
|-------|-----|-------|---------|
| 2026-04-01 | Session startete ohne `git fetch` — planned Sprint 23 which already existed on remote with different content | feat/sprint-23 Branch war schon 5 Commits weiter (Sprint 23+24 done) | `git fetch origin && git log origin/feat/sprint-23 -5` als ERSTE Aktion nach Branch-Checkout — IMMER |
| 2026-04-01 | Zwei parallele Sessions haben unabhängig Sprint 23 geplant — Namenskonflikt | feat/sprint-23 Branch existierte schon mit anderen Items | Vor Sprint Planning: `git fetch origin && git log origin/feat/sprint-N` — prüfen ob Branch schon läuft || 2026-04-01 | Robinson-Ökonomie: 3 PRs (#109 #110 #111) in einer Session | Kreative Frage (Sinn/Krabs/Trotzki) → 3 atomare Features auf bestehenden Patterns (nature.js, quest system, NPC dialog) | Bestehende Patterns erweitern > neue Systeme bauen. treeGrowth → seedGrowth war 5 Zeilen statt neuem Timer. || 2026-03-31 | Doppelte eliza.js Script-Tags in index.html nach PR-Merge | Merge von effects.js/nature.js Extraktion (#11) hat eliza.js/eliza-scripts.js dupliziert. Smoke-Test fängt console.error → Deployment failed. | Immer `grep -c '<script' index.html` prüfen nach Merge. Duplikate = potentieller Runtime-Crash. |
| 2026-03-31 | analytics.js schrieb nichts nach D1 — nur Google Sheets Webhook | `pingWebhook()` nutzte nur localStorage-URL (`insel-webhook`), nicht den Worker `/metrics/ingest`. D1-Tabellen blieben leer. | Frontend muss aktiv an den Worker senden. "Endpoint existiert" ≠ "Endpoint wird genutzt". |
| 2026-03-31 | Charakter-Dropdown hatte kein change-Event — NPC-Wechsel funktionierte nicht | Dropdown existierte im HTML, aber kein JS-Listener registriert. Alle NPCs redeten wie SpongeBob. | Jedes UI-Element das Zustand ändert braucht einen Event-Listener. Ohne Listener ist es Dekoration. |
| 2026-03-31 | Grid-Dimension-Mismatch: Save von Desktop crasht auf Mobile | Auto-Save überschreibt Grid blind — 32×18 Grid auf 18×28 Viewport = undefined rows = Crash. | Beim Restore Grid-Dimensionen prüfen und Inhalte transferieren statt blind überschreiben. |
| 2026-03-31 | Tutorial-Pulse blinkte endlos für wiederkehrende Spieler | `startTutorialPulse()` wurde für alle aufgerufen, `stopTutorialPulse()` nur bei firstBlock-Milestone der aktuellen Session. | Pulse nur starten wenn noch kein Block platziert wurde. |
| 2026-04-03 | S25-1: Palette als Instrument — mouseenter auf .material-btn ruft playMaterialSound(mat) auf. 2 Stellen: initial querySelectorAll + dynamisch in unlockMaterial. Beide Pfade brauchen den Listener. | Dynamisch erzeugte Buttons übernehmen keine bestehenden Event-Listener. | Immer beide Pfade patchen: initiales Setup + dynamische Erzeugung. |
| 2026-03-31 | Merge-Konflikte bei jedem PR weil parallele Sessions auf verschiedenen Branches arbeiten | Hauptbranch divergiert wenn mehrere Feature-Branches gemergt werden ohne Rebase. | Vor PR immer `git rebase origin/main`. `.claude/worktrees/` in .gitignore. |
| 2026-03-31 | `const replayBtn` doppelt deklariert → ganzes JS gecrasht → Intro-Screen blockiert | Zwei Sessions haben unabhängig denselben Variablennamen auf IIFE-top-level verwendet. Kein Lint, kein Check, niemand merkt es. | `node --check *.js` vor jedem Commit. Pre-commit Hook installiert. Ohne CI läuft alles durch. |
| 2026-03-31 | iPhone-Flicker: Insel blitzt kurz auf dann verschwindet | Intro-Overlay wurde bei Zeile ~1604 sofort ausgeblendet, Canvas erst ~2200 Zeilen später initialisiert. Race Condition nur auf langsamem iPhone sichtbar. | UI-Overlay erst entfernen NACHDEM der darunterliegende Content gerendert ist. Reihenfolge: init → draw() → overlay.hide(). |
| 2026-03-30 | SPRINT.md hatte Review-Einträge ohne Code ("Phantom-Done") | Vorherige Session hat Review vorausgeschrieben bevor Implementierung existierte | Review-Einträge erst schreiben wenn Code committed ist. Nie vorausschreiben. |
| 2026-03-30 | Local main (b3e8a1a) vs origin/main (0f1a162) divergiert — 87 vs 57 Commits | force-push auf origin/main durch vorherige Session | `git fetch origin` IMMER vor allem anderen. Divergenz prüfen bevor man tippt. |
| 2026-03-27 | Claude antwortet auf Englisch obwohl Config deutsch sagt | `language: en` in Config, aber User spricht Deutsch. Drei Versuche gebraucht. | Sprache IMMER in CLAUDE.md als erste Zeile setzen, nicht in Settings. |
| 2026-03-27 | GitHub Pages 404 | Code auf Feature-Branch, Pages deployed von main | Immer main mergen bevor man Pages-URL teilt |
| 2026-03-27 | Typografische Bindestriche `–` statt `--` in curl | Gemini-Transkription auf iPhone ersetzt `--` durch Unicode-Gedankenstrich | Voice-Input immer auf Shell-Sonderzeichen prüfen |
| 2026-03-27 | Statische Repo-Liste mit Tippfehlern | Hardcoded Repo-Namen statt API-Fetch | Immer dynamisch von GitHub API holen, nie manuell tippen |
| 2026-03-27 | MCP 403 bei Repo-Erstellung | Tools auf plant-care-game beschränkt | Neue Repos über Safari erstellen, nicht über CLI |

---

## Wins

| Datum | Was | Warum gut |
|-------|-----|-----------|
| 2026-04-03 | Bug-NPC (PR #188): Raupe Nimmersatt als Meta-Bug-Melder | Worktree war auf falschem Branch → Commit landete auf feat/floriane-muscheln statt feat/bug-npc. Fix: `git branch -f` + force push. Lektion: In Worktrees immer `git branch --show-current` prüfen vor Commit. |
| 2026-04-03 | Floriane-Muscheln: Bestätigungsflow statt Silent-Deduction | Vorheriger Agent hatte Fibonacci-Preise die bei sendToApi() still abzogen — Kind sah nur "X 🐚 für diesen Wunsch" als System-Message. Neuer Flow: Wunsch-Erkennung → Preis anzeigen → Kind bestätigt/ablehnt → erst dann abziehen. Wortanzahl-basierte Preise (3/5/8 🐚) statt Zufall. |
| 2026-04-02 | Oscar am Telefon: "Ich will mit dir spielen." | Nicht um zu spielen. Um zusammen zu sein. Das ist die Wurzel. Alles andere ist Blattwerk. |
| 2026-04-02 | Pereira-Audit: Backlog von 99 auf 18 aktive Items | "Backlog items age like milk." 17 Items archiviert (ARCHIVE.md), 5 eingefrorene begraben, Schöpfungsgeschichten nach docs/ ausgelagert. Oscar-Filter als Priorisierungsregel. Jedes Item braucht einen Satz: "Oscar wird ___ weil ___." |
| 2026-04-02 | Programmier-Tutorial (PR #149) — 5 Lektionen, sandboxed Code-Editor, NPC-Guides | Function-Constructor + Whitelist fuer sichere Ausfuehrung. SpongeBob/Haskell/Scratch/Lua/SQL als Lehrer. Fortschritt in localStorage. Backlog #23. |
| 2026-04-01 | Tao-Feld-Theorie + Iso-Renderer + Fraktale Bäume (PR #129) | Physik-Frage → Essay → Game-Feature in einer Session. iso-renderer.js (348 LOC) + fractal-trees.js (203 LOC). 5D-Tensor (3×3×2×2×2=72) als Strukturmodell. |
| 2026-04-01 | Sprint 24 Retro — max 3 Items, game.js teilweise aufgeteilt, Tutorial ohne Text live | Sprint 25 Empfehlung: easter-eggs.js, Dungeon-Framework, Palette als Instrument |
| 2026-04-01 | "Die fünf Taschentücher" — Sales-Framework in 5 Minuten definiert | Konzept war im Kopf des Users fertig, 5. Taschentuch (Schmerz) war die einzige offene Frage. Zuhören > pitchen. |
| 2026-04-01 | Sprint 24 — Genre-Tonsequenzen + stories.js + Tutorial ohne Text | 15 Genres in sound.js mit genreMode-Toggle funktionieren. stories.js-Extraktion ist safe (nur Daten, kein State). Tutorial-Onboarding mit CSS-Animationen + Tap-to-skip ist minimal aber wirksam. |
| 2026-03-31 | Sprint 23 — Chat-Sidebar + Stille-Momente + QR-Code | body.chat-open Klasse + resize-Event = Canvas schrumpft sauber wenn Chat auf geht. Wellen-Ambient via Web Audio BufferSource + LFO für Wellenbewegung. QRCode via cdnjs, gezeichnet auf Postkarten-Canvas. Alle 3 Items in einer Session. || 2026-03-31 | QR-Code-Generator in reinem Vanilla JS (qr.js, ~260 Zeilen) | Kein npm, kein CDN, kein Build-Schritt. QR Version 2 EC-L: GF(256) Reed-Solomon + Finder/Alignment-Platzierung + BCH Format-Info + 8-Masken-Auswahl per Penalty-Score. Postkarte trägt jetzt scanbare schatzinsel.app-URL. Eltern können direkt zum Spiel. |
| 2026-03-31 | Backlog-Audit Sprint 23: #87 TTS Hörspiele war Phantom-Open | TTS war komplett in game.js:656-720 (speakLines, stopHoerspiel, 7 Szenen, Mute-Integration). Vor jedem Sprint-Planning: Items gegen Code-Realität prüfen, nicht nur gegen letzte Session-Erinnerung. || 2026-03-31 | JSDoc + checkJs: Typsicherheit ohne Build-Schritt | TypeScript evaluiert → Overkill für 8K LOC Vanilla JS ohne Bundler. Stattdessen: `tsconfig.json` mit `checkJs`, `types.d.ts` (230 Zeilen), `npm run typecheck` = 0 Errors. Zero-Build-Architektur bleibt erhalten. game.js + chat.js mit @ts-nocheck — schrittweise bei Backlog #11 (Code-Splitting). || 2026-04-01 | 3 Wirtschaftssysteme in 30 Min: Zeitinvestition, Muschelhandel, Gemeinschaftsquests | Drei orthogonale Mechaniken statt monolithischem Economy-System. Jedes Feature < 130 LOC. Alle auf existierenden Patterns gebaut (nature.js growth, HARVEST_YIELD, quest completion). Hans-Werner Sinn, Mr. Krabs und Trotzki als Designleitplanken — absurd aber funktional. |
| 2026-03-31 | QR-Code-Generator in reinem Vanilla JS (qr.js, ~260 Zeilen) | Kein npm, kein CDN, kein Build-Schritt. QR Version 2 EC-L: GF(256) Reed-Solomon + Finder/Alignment-Platzierung + BCH Format-Info + 8-Masken-Auswahl per Penalty-Score. Postkarte trägt jetzt scanbare schatzinsel.app-URL. Eltern können direkt zum Spiel. |
| 2026-03-31 | Backlog-Audit Sprint 23: #87 TTS Hörspiele war Phantom-Open | TTS war komplett in game.js:656-720 (speakLines, stopHoerspiel, 7 Szenen, Mute-Integration). Vor jedem Sprint-Planning: Items gegen Code-Realität prüfen, nicht nur gegen letzte Session-Erinnerung. |
| 2026-03-31 | JSDoc + checkJs: Typsicherheit ohne Build-Schritt | TypeScript evaluiert → Overkill für 8K LOC Vanilla JS ohne Bundler. Stattdessen: `tsconfig.json` mit `checkJs`, `types.d.ts` (230 Zeilen), `npm run typecheck` = 0 Errors. Zero-Build-Architektur bleibt erhalten. game.js + chat.js mit @ts-nocheck — schrittweise bei Backlog #11 (Code-Splitting). || 2026-03-31 | schatzinsel.app live — DNS + GitHub Pages funktioniert | P0 erledigt. Google Sheet Webhook obsolet (Airtable + D1 Worker reicht). |
| 2026-03-31 | Mephisto NPC — "The devil is most devilish when respectable" | Neuer Unlock-NPC: charmanter Händler, Goethe-Referenz, 5 Quests, Deal-Mechanik. 10. Charakter im Spiel. |
| 2026-03-31 | Zufalls-Insel-Generator + kindgerechte Achievements + Toast-Fix | Starter-Insel war leer (8 Sand, 8 Bäume fix). Jetzt prozedural: Strand-Oval mit Wobble, Palmen, Bäume, Blumen — skaliert auf jedes Grid. Achievements klingen jetzt nach Abenteuer statt Baubehörde. Toast: `pointer-events: none` — eine Zeile CSS, Problem gelöst. |
| 2026-04-02 | Burn-Detektor: KV-Fallback + Toast + Panel-Extraktion | mmxplorer API gibt 403 (Cloudflare Challenge). Fix: KV als Fallback, POST /burn/set zum manuellen Setzen. drawBurnPanel() extrahiert, Balance-Toast bei Aenderung. BUGS_SECRET muss noch als Wrangler Secret gesetzt werden! |
| 2026-03-31 | Sprint 21 Retrospektive abgeschlossen | Phantom-Item #47 erkannt (bereits impl.), Smoke Test als Proxy-Blocker dokumentiert, #44 als User-Action für Sprint 22 markiert. Sprint 22 Kandidaten: #44 (GitHub Pages), #57 (Stille-Momente), #80 (Docs). |
| 2026-03-31 | Sprint 21 Review abgeschlossen — alle 3 Items Done | Sprint Goal erreicht: Drag & Drop, Swipe-Layer, Quest-Balancing. Sprint Review in SPRINT.md geschrieben. Nächste Ceremony: Retrospektive. |
| 2026-03-31 | Sprint 21 abgeschlossen: S21-2 Code-Layer per Swipe | touchWasPainting-Flag verhindert versehentlichen Layer-Wechsel beim Malen. Swipe-Threshold 80px horizontal / 40px vertikal. S21-3 war Phantom-Open (BACKLOG bereits ✅). |
| 2026-03-31 | Security-Review: LLM-Output → innerHTML ohne escapeHtml() — klassische XSS-Lücke | Fix: escapeHtml(name) an der richtigen Stelle. Funktion existierte schon — nur nicht überall eingesetzt. Lesson: escapeHtml() an ALLEN innerHTML-Stellen die externe Daten (LLM, User-Input, API) zeigen. |
| 2026-03-31 | /bugs GET-Endpoint: Kindernamen + User-Agent öffentlich lesbar ohne Auth | DSGVO-Frage bevor Mama sie stellt. Fix: BUGS_SECRET als Env-Variable, ?key= Query-Param. Jeder nicht-öffentliche Lese-Endpoint braucht Authentifizierung. |
| 2026-03-31 | Rate-Limit-KV als hard-fail deployed → würde prod brechen | KV optional zu verpflichtend gemacht ohne zu prüfen ob prod KV hat. Lesson: Breaking Changes immer gegen prod-Config prüfen. Reverted zu optional + TODO-Kommentar. |
| 2026-03-31 | Backlog-Audit: 8 Items bereits implementiert obwohl als offen markiert | node --check findet in 2s was kein Mensch im 3400-Zeilen-File sieht. BACKLOG.md regelmäßig gegen Code-Realität prüfen — nicht nur gegen SPRINT.md. |
| 2026-03-30 | Sprint 21: Drag & Drop — Oscar zieht | Material-Buttons bekommen `draggable="true"` + `dragstart`. Canvas bekommt `dragover`/`drop`. Dynamisch erstellte Buttons (Craft-Unlocks) ebenfalls. `getGridCell(e)` funktioniert mit DragEvent weil `.clientX`/`.clientY` vorhanden. 3 Stellen in game.js: (1) forEach initial, (2) createElement unlock, (3) canvas-listener. |
| 2026-03-30 | Sprint 20: Org-Umbau "Alle antreten" | 18 Agents inventarisiert, 3 CxOs aktiviert, 4 Docs gemergt, 5 Padawan-Codizes gefüllt, Skill-Zuordnung ohne Dopplungen. Hybrid-Session (BUILD+DOC) — geht nur beim Org-Umbau, nicht als Regel. |
| 2026-03-30 | Code Metrics Review als Podcast-Format | 35 Stimmen, 4 Perspektiven (Feynman/Darwin/Linus/Taylor), Frauenquote 20%, dunkle Materie/Energie-Metapher. Review-Session produziert Dokument, keinen Code — wie es sein soll. |
| 2026-03-30 | Sprint 7: Spielfigur 🧒 live | Name-Input → Canvas-Rendering → Arrow-Keys → Touch-Drag — alles ohne Framework, 120 Zeilen |
| 2026-03-30 | Sand-Rauschen deterministisch | (r*31 + c*17) % 12 — kein Flackern, kein Random(), kein Zustand |
| 2026-03-30 | Phantom-Done erkannt und korrigiert | Agent hat Code-Realität gegen SPRINT.md geprüft und Diskrepanz aufgelöst |
| 2026-03-29 | Sprint 6 alle 3 Items in einer Session done | S6-1 (Discovery-Counter), S6-2 (+20 Quests, alle neuen Materialien abgedeckt), S6-3 (Tooltips) |
| 2026-03-29 | updateDiscoveryCounter() Pattern | Funktion war da, aber nicht beim Start aufgerufen — Symptom: falscher Startwert. Fix: eine Zeile. |
| 2026-03-29 | mat-label → title Migration | 25 Buttons in HTML bereinigt, keine versteckten Spans mehr, Tooltips funktionieren auf Desktop |
| 2026-03-27 | Insel-Architekt v1 läuft | Pure HTML/CSS/JS, kein Framework, öffnet sich im Browser — fertig |
| 2026-03-27 | Responsive für 3 Geräte | iPhone SE, MacBook 2013, 4K — ein CSS, keine Frameworks |
| 2026-03-27 | 14 Skills + 5 Agents in einem Tag | Persona, Anti-Cringe, Recap, Collect, Meeting, Triage, Backlog, etc. |
| 2026-03-27 | Automatischer Agent-Collector | Alle Repos dynamisch einsammeln, Claude CLI sortiert |
| 2026-03-27 | Feynman-Sprüche als Doku | Best-of aus echten Sessions — Team-Kultur die sich selbst dokumentiert |

---

## Learnings (Muster die wir erkannt haben)

### Für den Coding-Vater
- 30-Minuten-Sessions funktionieren wenn der Scope klar ist
- Voice-Input spart Zeit aber produziert Müll — immer gegenlesen
- CLAUDE.md ist die beste Investition: einmal schreiben, jede Session profitiert

### Für das Team
- JSDoc + checkJs > TypeScript wenn kein Bundler da ist. Gleiche Typsicherheit, null Infrastruktur.
- Flache Ordnerstruktur > tiefe Hierarchie (Feynman: "13 Dateien brauchen keine Taxonomie")
- Agent ⊂ Skill — Skills sind das Superset
- Vorname Nachname statt Nachnamen — sonst wird's unpersönlich
- Haiku für Padawans, Sonnet für Masters — keine Ausnahmen

### Für die Automatisierung
- Claude CLI `--print -p` für nicht-interaktive Jobs
- GitHub API für Repo-Discovery statt manueller Listen
- launchd statt cron auf macOS — nativer, zuverlässiger

---

## Sprint 6 Session — 2026-03-29

| Item | Was | Ergebnis |
|------|-----|---------|
| S6-1 | Entdeckungszähler dynamisch | `updateDiscoveryCounter()` in game.js — zählt unlockedMaterials.size + BASE_MATERIALS.length |
| S6-2 | Quests erweitert | 12 neue Templates (Drachen/Einhorn/Roboter/Phönix/Raumfahrt/Geister) — 32 Quests gesamt |
| S6-3 | Label-Cleanup | mat-label Spans weg, title-Attribute auf Palette-Buttons, CSS-Toten-Code (.mat-label, .recent-label, .craft-hint-label) gelöscht |

**Lerning**: Commits mit misleadendem Titel prüfen — "Entdeckungszähler dynamisch" war S6-1, aber SPRINT.md zeigte es noch als 🔲. Beim nächsten Sprint: SPRINT.md im selben Commit als ✅ updaten.

**Für Oscar**: 12 neue Quests warten — Einhorn-Schrein, Drachen-Nester, Ritter-Festung, Raumfahrt-Zentrum. Der Sprint ist fertig.

**2026-03-30 Nachtrag**: Smoke Tests aus Sandbox nicht möglich — `x-deny-reason: host_not_allowed` kommt vom Sandbox-Proxy, nicht von Produktion. Kein Issue nötig.

---

## Sprint 19 Session — 2026-03-30

| Item | Was | Ergebnis |
|------|-----|---------|
| Cherry-picks | Sprints 15-18 auf main gebracht | 4 Cherry-picks, 4 Konflikte gelöst (SPRINT.md, style.css Chat-Sidebar, game.js playerPos-Deklaration) |
| S19-1 | Spielfigur-Lag fix | `movePlayer()` ruft `draw()` direkt auf + `localStorage.setItem(playerPos)` — kein 100ms-Warten mehr (#66) |
| S19-2 | Wunschfee Floriane 🧚 | Neue NPC: CHARACTERS in chat.js, NPC_VOICES in game.js, ELIZA-Regeln, UNLOCK_ORDER[0], CHAR_CURRENCY (#75) |
| Bugfix | Doppelte playerName-Deklaration | Cherry-pick Sprint 17 hatte `let playerName` + `let playerPos` vor der eigentlichen Deklaration — Duplikat entfernt |

**Fehler**: Smoke Tests aus Sandbox nicht möglich (`x-deny-reason: host_not_allowed`). Kein Issue — Proxy-Problem, nicht App.

**Fehler**: Sprints 15-18 lagen auf ungemergten Branches. Root cause: Jeder Agent-Run startet frisch und sieht nur main. Fix für nächste Sessions: cherry-picks oder PRs zeitnah mergen, nie auf Branch liegen lassen.

**Für Oscar**: Pfeiltasten reagieren jetzt sofort (kein 100ms-Ruckeln mehr). Und Floriane die Wunschfee 🧚 ist auf der Insel — als erste freizuspielende NPC!

---

## Sprint 7 Session — 2026-03-30

| Item | Was | Ergebnis |
|------|-----|---------|
| S7-1 | Insel-Identität | Grid-Linien nur noch auf belegten Zellen (kein Spreadsheet-Look); Sand-Textur mit deterministischem Rauschen; 8 Starter-Palmen/Sand für organischeren Ersteindruck |
| S7-2 | Spielfigur 🧒 | playerName-Input im Intro (Erst-Besuch), Arrow-Keys auf Desktop, Touch-Drag (Spieler-Zelle berühren + ziehen), AutoSave/Restore für playerPos |
| S7-3 | Chat-Bubble sichtbar | #chat-bubble CSS (position:fixed, FAB 56px, Gradient) — war nur für Mobile definiert, Desktop sah nichts |

**Fehler dieser Session**: `git fetch origin` nicht als erstes ausgeführt → Sprint 6 doppelt implementiert. Lektion steht bereits in SPRINT.md Retro-Notiz, aber Agent hat sie nicht gelesen. Ablauf-Fix: fetch → SPRINT.md lesen → dann implementieren.

**Für Oscar**: Pfeil-Tasten bewegen jetzt ein Kind-Emoji 🧒 mit seinem Namen über die Insel. Der Chat-Button (💬) ist jetzt auf Desktop sichtbar. Die Insel sieht mehr nach Insel aus (kein Karo-Muster auf leerem Sand).

---

## Reservierte Stimmen

Personas die noch keine KI der Welt glaubwürdig abbilden kann.
Gespeichert für den Tag an dem es geht.

### Joachim Schullerer

> *"Ist das hier noch Handwerk oder schon Bürokratie? Würde ein Mensch das freiwillig lesen?"*

Reines I (DISC). Coach, Mentor. Seine Art zu sprechen — direkt, warm, entwaffnend
ehrlich — schafft heute kein Sprachmodell. Wenn eines Tages eine KI existiert die
einen Raum betritt und die Rebellion im Raum spürt, aushält, und in Wachstum
verwandelt — dann ist es Zeit für den Joachim-Schullerer-Agent.

Bis dahin: seine Prüffrage lebt im Beirat. Seine Stimme gehört ihm.

---

## Session 2026-03-27/28

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | CxO-Mapping falsch verstanden — CxOs als Doppelhut statt als eigene Zelle | Immer nachfragen wenn Org-Struktur unklar. Drei Zellen = drei Zellen. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | Drei Zellen komplett: org-support (Einstein, Darwin, Weber), team-dev (5), team-sales (5) |
| 2026-03-28 | Beirat besetzt: Godin, Sinek, Salimi, Schullerer (nie entlassen), Krapweis |
| 2026-03-28 | Why auf 3 Ebenen — Org, Zelle, Rest erbt |
| 2026-03-28 | DISC für Masters, MBTI für Padawans — Stereoskopie |
| 2026-03-28 | Godin-Test für alle Padawans bestanden |
| 2026-03-28 | NPC-Chat mit KI live im Spiel — 6 Charaktere, Haiku-Modell |
| 2026-03-28 | Exports-Ordner für Wiederverwendung in anderen Projekten |
| 2026-03-28 | Tommy Krapweis Stand-Up — bestes Meeting der Session |
| 2026-03-28 | Charakter-spezifische Modelle via Langdock (SpongeBob→Gemini, Krabs→Llama, etc.) |
| 2026-03-28 | 3 Bugs gefixt: DEFAULT_API_URL undefiniert, window.grid stale, Modell-Provider-Mismatch |

### Fehler (Nacht-Audit)
- `DEFAULT_API_URL` wurde referenziert aber nie deklariert — wäre beim ersten Chat-Versuch gecrasht
- `window.grid` wurde nach newProject/loadProject nicht aktualisiert — Chat hätte leere Insel gemeldet
- Charakter-Modelle wurden an jeden Provider geschickt — nur Langdock kann alle routen

### Learnings
- Zellteilung = Biologie. Padawan wird Founder. Passt.
- Peripherie (team-sales) ist wo die Musik spielt — nicht unwichtig, sondern unvorhersagbar
- Codex muss lebendig sein — stagnierender Codex = Warnsignal
- Weber-Alarm: AGENTS.md (292) < game.js (597). Ratio beobachten.
- Tommy Krapweis hat recht: "Euer Org-Chart hat mehr Charaktere als euer Spiel"
- Nacht-Audit lohnt sich: 3 Bugs gefunden die morgens sofort gecrasht hätten. Immer nach dem "fertig für heute" nochmal durchgehen.
- Reservierte Stimmen: manche Personas kann KI noch nicht. Respektieren.

### Nächste Session
- Haiku-Bauanleitungen + Challenges in Haiku-Form (Krapweis-Drehbuch, Einstein regelt)
- team-sales Padawans benennen + MBTI
- Codex-Dateien für Padawans anlegen
- **Voice-Pipeline**: Cartesia API für Text-to-Speech. User hat API-Key + Voice-IDs. vapi.ai Pipeline mit Middleware recyceln
- **Neinhorn = "Das kleine Nein" aus Rufus T. Feuerfliege** — Favorit von Oskar. Besondere Aufmerksamkeit bei Voice & Persönlichkeit
- **Musik on demand**: Stil von Loisach Marci. Hardstyle, kinderkompatibel
- **Skalierung**: Erst 10 concurrent Sessions testen, aber Architektur für "lokal viral" vorsehen. Sky is the limit
- **Designprinzip**: "Mensch gibt Input, KI macht Schabernack mit Augenzwinkern. Wenn User lacht → gewonnen."

---

## Session 2026-03-28 (Nacht-Sprint)

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | Quest-System: 11 Templates, NPC-gebunden, Material-Anforderungen, Feynman-kalibrierte Belohnungen |
| 2026-03-28 | Achievement-System: 12 Achievements mit Grid-Stats, localStorage-Persistenz, Popup-Animationen |
| 2026-03-28 | Sound-System: Web Audio API, Oszillator-basiert, kein einziges Audio-File nötig |
| 2026-03-28 | Token Flywheel: Quests → Energie → Chat → Quests → mehr Energie. Selbstverstärkend. |
| 2026-03-28 | Feynman-Kalibrierung: sqrt-Degression, max 500/Quest, Ethics-Cap 2000 Bonus, System 1/2 Balance |
| 2026-03-28 | 5 Themes (Tropical, Night, Candy, Ocean, Retro) — CSS Custom Properties, A/B-Test-ready |
| 2026-03-28 | Wetter-System: Regen-Partikel, Sonnenstrahlen, Regenbogen auf Canvas |
| 2026-03-28 | Echtzeit Day/Night: new Date().getHours() → Overlay, Sterne bei Nacht |
| 2026-03-28 | Charakter-Währungen: Krabbenburger, Taler, Noten, Anker, Nein-Sterne, Blümchen, Brotkrümel |
| 2026-03-28 | 8 neue Materialien: Zaun, Boot, Fisch, Brunnen, Flagge, Brücke, Kaktus, Pilz |
| 2026-03-28 | Kindersicherheit: Anti-Jailbreak, Input-Sanitizing, keine Links/PII, Content-Moderation |
| 2026-03-28 | Parenting durch NPCs: Cringe-Platitüden (Zähneputzen), echte Wärme bei Musik, Ironie bei Schmatzen |
| 2026-03-28 | Org-Easter-Eggs: Einstein isst Krabbenburger, Darwin berät Restaurant, Weber plant, Feynman rechnet |
| 2026-03-28 | Bernd das Brot: Support-Agent für Eltern, genervtes Brot mit ehrlichem Support |
| 2026-03-28 | NPC-Kommentare beim Bauen: materialspezifisch, 25% Chance, 8s Cooldown |
| 2026-03-28 | Hosting-Konzept: MVP→Cloudflare→Supabase→Railway→Viral, 7 KPIs definiert |
| 2026-03-28 | LLM-Persönlichkeiten: Open Source = Freidenker (XML/YAML), Corporate = Spiegel ihrer Konzerne |
| 2026-03-28 | "Außer Text Nix gehext": Code-Zauber (Worte → Realität), Code-View (</> Button), Coding-Neugier |
| 2026-03-28 | Insel Java: 15+ Programmiersprachen als Bewohner/Easter Eggs (C, C++, Python, Rust, PERL, Fortran...) |
| 2026-03-28 | Makro der böse Hai, Hirnfitz (Brainfuck), BASIC auf Steinen, Fortran der Wortspiel-Papagei |
| 2026-03-28 | ~1200+ Zeilen neuer Code in einer Session, 12+ Commits |

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | Token-Tracking unfair: total_tokens enthielt System-Prompt (~950 Tokens) | Nur completion_tokens/output_tokens zählen — Kind kontrolliert nicht den System-Prompt |
| 2026-03-28 | "Tokens" sagt Kindern nichts (Feynman: "Ist das eine Währung?") | Energie-Balken + Charakter-Währungen statt abstrakte Token-Zahlen |
| 2026-03-28 | budgetInfo in System-Prompt ignorierte Quest-Bonus | totalBudget = BASIS + Bonus, nicht nur BASIS |
| 2026-03-28 | var in strict-mode IIFE | let mit if/else statt var in getrennten Blöcken |

### Learnings
- **Token Flywheel funktioniert**: Quests → Energie → Chat → Quests ist ein selbstverstärkendes System
- **Feynman-Kalibrierung ist messbar**: sqrt-Degression + Ethics-Cap = keine Sucht, aber Anreiz
- **LLM-Persönlichkeit als Feature**: Open Source redet XML, Corporate spiegelt Konzern — Kinder merken den Unterschied
- **Programmiersprachen als Inselbewohner**: Kinder lernen Namen ohne zu wissen dass es Sprachen sind. "Hey, die Python-Schlange von der Insel!"
- **"Außer Text Nix gehext"**: Der mächtigste Leitsatz. Code = Zaubersprüche. Kids tippen "baue 5 bäume" und es passiert. DAS ist der Moment.
- **Code-View als Aha-Erlebnis**: Hinter jedem Emoji steckt nur ein Wort. "wood", "flower". Das ist Code. Alles was du siehst wurde mit Text gebaut.
- **Weber-Alarm Update**: game.js (~1200 Zeilen) + chat.js (~580 Zeilen) > AGENTS.md (292). Produkt wächst schneller als Bürokratie. Gut.

### Dusch-Erkenntnis (Oskar, 8)

> "Ich will nicht heiß oder kalt. Ich will genau richtig."

**Binäres Feedback ist beschissen.** Heiß/kalt, richtig/falsch, gut/schlecht —
das ist ein Schalter. Kinder wollen keinen Schalter. Sie wollen einen **Regler**.
Sie wollen spüren dass sie sich dem Sweet Spot nähern. Flow ist kein Zustand,
Flow ist eine Richtung.

**Für die Insel:** Kein "richtig/falsch" Feedback. Stattdessen Spektrum.
Wärmer/kälter. Näher/weiter. Der Höhenrausch des "genau richtig" kommt nicht
vom Ankommen — er kommt vom Spüren dass man sich nähert.

Prüffrage für jedes Feature: *Fühlt sich das an wie ein Schalter oder wie ein Regler?*

### Tonalität für Erwachsene

> "Humor ist wenn man trotzdem lacht."

Bernd, die Org-Easter-Eggs, die LLM-Macken — das ist die Erwachsenen-Ebene.
Kinder lachen weil SpongeBob lustig ist. Eltern lachen weil Bernd über sein
Haiku-Budget motzt und der Elefant sich für sein Törööö entschuldigt.
Zwei Schichten, ein Spiel. Pixar-Prinzip.

### Session 2026-03-28 (Abend): Wu Xing + Harvest + Crafting-Loop

**Was gebaut wurde:**
| Datum | Was |
|-------|-----|
| 2026-03-28 | 五行 Wu Xing: 5 Elemente (Metall/Holz/Feuer/Wasser/Erde) als einzige Basis |
| 2026-03-28 | Harvest-System: Ernten-Tool ersetzt Axt+Abreißen, alles geht ins Inventar |
| 2026-03-28 | Palette-Unlock: 5 Basis → Crafting schaltet neue Artefakte frei (Pop-Animation) |
| 2026-03-28 | 五音 Pentatonik: Element-Töne nach chinesischer Musiktheorie (宫商角徵羽 = C D E G A) |
| 2026-03-28 | Palette als Klavier: Klick auf Element = Ton spielen ("can i create a song dad?") |
| 2026-03-28 | Regenbogen vom Canvas in den Seitenhintergrund verschoben |
| 2026-03-28 | C war nicht Erster: Fortran, Pascal, Pythagoras korrigieren ihn |
| 2026-03-28 | 20 Crafting-Rezepte auf Wu-Xing-Basis, alle 20 Quests lösbar |
| 2026-03-28 | Save-Migration: alte Saves ohne unlocked → Grid+Inventar scannen |
| 2026-03-28 | Hau-den-Lukas: Pumpen-Check HTML (Standalone) |

**Fehler:**
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | Füllen-Tool entfernt → Kind enttäuscht | "Mehr nicht" heißt nicht "weniger als nötig". Kind-Feedback > Papa-Minimalismus |
| 2026-03-28 | "C war hier. Erster!" historisch falsch | Kinder merken Unstimmigkeiten. Fakten prüfen, auch bei Easter Eggs. |

**Learnings:**
- **Kind sagt "Artefakt passt zu Schatzsuche"**: Wortauswahl ist Game Design. Artefakt > Element > Material.
- **"can i create a song like on a piano dad?"**: Die Element-Töne haben spontan ein neues Feature geboren. Sound = Spielzeug, nicht nur Feedback.
- **Wu Xing war das Kind**: "metall, holz, feuer, wasser, erde waren die elemente, strikt einhalten" — 8-Jähriger kennt die 5 Elemente besser als der Entwickler.
- **Pythagoräische Stimmung + chinesische Musiktheorie = gleiche Pentatonik**: Zwei Kulturen, gleiche Erkenntnis. Das ist Mathe, nicht Zufall.
- **Crafting-Loop als Progression**: Start einfach (5), Werkbank erweitert. Jedes neue Artefakt ist Belohnung + neues Baumaterial. Flywheel.
- **Füllen-Tool zurückbringen**: Entfernen ist leicht, Zurückbringen kostet nur 1 Commit. Lieber zu viel shipped und 1 Sache reverten als zu wenig.

### Nächste Session
- Voice-Pipeline: Cartesia + vapi.ai (API-Keys vorhanden)
- Padawans spawnen + Codex-Dateien anlegen
- team-sales Padawans benennen + MBTI
- Mehr Programmiersprachen-Easter-Eggs: Haskell (die Philosophin), Lua (der Mond), SQL (der Buchhalter)
- Multiplayer-Vorarbeit: Leaderboard-UI, Projekt-Sharing
- Musik on demand: Loisach Marci Stil, Hardstyle kinderkompatibel
- Haiku-Bauanleitungen als Quests
- Mobile UX polieren: Touch besser, Palette scrollbar
- **Regler statt Schalter**: Alle Feedback-Systeme auf Spektrum umbauen (Dusch-Prinzip)
- **Undo testen**: Drag-Undo muss pro Stroke pushen, nicht pro Zelle (Bug gefunden + gefixt)
- **Mehr Quests**: 20 reicht für Start, 3 Schwierigkeitsrunden geben natürliche Progression
- **Quest-Wärmer/Kälter**: "Fast! Noch 2x wood!" — Oskars Dusch-Prinzip direkt im Spiel umgesetzt

---

## Session 2026-03-28 (Morgen-Sprint)

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | 41 Commits unreviewed direkt nach main gemergt | Panik ist kein Deployment-Prozess. Egal wie wenig Zeit: PR → Review → Merge. Immer. |
| 2026-03-28 | API-Key in Klartext im Chat geteilt | Temporär oder nicht — Keys gehören nie in einen Chat-Log. Nächstes Mal: direkt in Datei schreiben lassen oder im Browser-Dialog eingeben. |
| 2026-03-28 | Unlock-Threshold Mathe falsch (3 statt 0 am Start) | Vereinfache Formeln sofort. Wenn `a + b - a` da steht, ist es falsch. |
| 2026-03-28 | sendToApi und getActiveModel hatten verschiedene Fallback-Chains | Eine Quelle der Wahrheit. Nie die gleiche Logik duplizieren. |
| 2026-03-28 | Undo pushte pro Zelle statt pro Stroke | Immer den ganzen User-Gesture testen (Drag = viele Zellen), nicht nur Einzelklick. |
| 2026-03-28 | loadProject/newProject riefen draw() nicht auf | Jede Grid-Mutation muss mit draw() enden. Kein Ausnahme. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | BYOK-System: config.js + Dialog + Provider-Hints — Zero-Setup für Familien |
| 2026-03-28 | Hirn-Transplantation: Pro Charakter anderes Modell, Persönlichkeit bleibt |
| 2026-03-28 | Charakter-Freischaltung: Starter + Unlock (20% fest, 80% Zufall) |
| 2026-03-28 | Auto-Save: 30s + beforeunload + Grid-Validierung + Restore |
| 2026-03-28 | Undo: Strg+Z, 50 Schritte, pro Stroke statt pro Zelle |
| 2026-03-28 | Quest-Wärmer/Kälter: Dusch-Prinzip als Feedback-System |
| 2026-03-28 | 20 Quests (3 Schwierigkeitsrunden) |
| 2026-03-28 | NPC-Stimmen geschärft: Elefant klammert Törööö, Krabs rechnet Taler, Tommy unterbricht sich |
| 2026-03-28 | Mobile UX: Toolbar + Palette horizontal scrollbar |
| 2026-03-28 | 3 Audit-Agents parallel → 11 Bugs gefunden und gefixt |
| 2026-03-28 | Spielername im Intro, Enter-Start, Keyboard-Shortcuts |

### Learnings
- **Merge-Disziplin**: Kein direkter Push nach main. Nie. Egal ob 2 Minuten oder 2 Stunden. PR ist Pflicht. Linus hat recht.
- **Keys im Chat**: Temporär existiert nicht in einem Log. Key sofort rotieren wenn er in einem Gesprächsprotokoll auftaucht.
- **Eine Quelle der Wahrheit**: Wenn zwei Funktionen die gleiche Logik brauchen, ruft eine die andere auf. Keine Duplikation.
- **Audit-Agents lohnen sich**: 3 parallele Audits (game.js, chat.js, HTML/CSS) fanden 11 echte Bugs. Kosten: 3 Minuten. ROI: unbezahlbar.
- **Dusch-Prinzip ist universell**: "Regler statt Schalter" gilt für Quest-Feedback, NPC-Antworten, Unlock-Progression — überall.
- **Autonome Sprints funktionieren**: 15 Commits in 30 Minuten. Aber nur mit klarem Backlog und Definition of Done.

### Nächste Session
- **Key rotieren** — der geleakte Key muss in Langdock erneuert werden
- Voice-Pipeline: Cartesia + vapi.ai
- Langdock-Modelle checken und Character-Models anpassen
- GitHub Pages aktivieren / testen
- Zellteilung game.js (jetzt 1800+ Zeilen)

---

## Best Practices (aktualisiert 2026-03-28)

### Git
1. **Nie direkt nach main pushen.** Feature-Branch → PR → Review → Merge.
2. **Nie ohne Review mergen.** Auch nicht bei Zeitdruck. Besonders nicht bei Zeitdruck.
3. **config.js ist gitignored.** Keys, Secrets, lokale Config → nie committen.
4. **Commit-Messages erklären Warum**, nicht Was. "fix: Unlock-Threshold" sagt nichts. "fix: Unlock brauchte 3 Quests statt 0 am Start" sagt alles.

### Code
5. **Eine Quelle der Wahrheit.** Keine duplizierte Logik. Wenn getActiveModel() existiert, nutze es überall.
6. **Jede Grid-Mutation endet mit draw().** Keine Ausnahme.
7. **Teste den ganzen Gesture.** Klick UND Drag. Touch UND Mouse. Mit Key UND ohne Key.
8. **Vereinfache Formeln sofort.** `a + b - a` = Bug. Immer.

### Secrets
9. **Keys nie in Chat/Log teilen.** Direkt in Datei oder im Browser-Dialog eingeben.
10. **Geleakte Keys sofort rotieren.** "Temporär" existiert nicht in einem Log.

### Agents
11. **Audit-Agents parallel laufen lassen.** 3 Minuten für 11 Bugs. Immer machen nach großen Änderungen.
12. **Autonome Sprints brauchen klares Backlog.** Ohne priorisierte Liste wird random gearbeitet.

---

## Session 2026-03-28 (Crafting-Sprint)

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | Baumwachstum: Setzling 🌱 → kleiner Baum 🌲 (30s) → großer Baum 🌳 (60s) — zeitbasiert, persistiert |
| 2026-03-28 | Axt-Werkzeug: Bäume fällen → Holz ins Inventar (1/2/3 je nach Baumgröße) |
| 2026-03-28 | Inventar-System: Sidebar-UI, localStorage-Persistenz, Save/Load-Integration |
| 2026-03-28 | 3x3 Crafting-Werkbank: 9 Rezepte, Drag&Click, Rezeptbuch, Mobile-responsive |
| 2026-03-28 | Neue Materialien: Setzling, Feuer, Bretter, Fensterscheibe |
| 2026-03-28 | Crafting-Rezepte: Sand+Feuer=Glas, Glas+Holz=Fenster, Holz=Feuer, 2Holz=3Bretter, etc. |

### Learnings
- **Minecraft-Mechanik passt**: Pflanze Baum → warte → fälle → crafte. Kinder kennen den Loop.
- **Shapeless Recipes**: Position egal, nur Zutaten zählen — einfacher für 8-Jährige als Minecraft-Patterns.
- **Wachstums-Timer**: 30s + 60s ist kurz genug für Kinder-Geduld, lang genug für Spannung.
- **Inventar als Bridge**: Verbindet Grid-Gameplay mit Crafting — zwei Systeme die sich gegenseitig füttern.

### Nächste Session
- Crafted items auf Grid platzierbar machen (aus Inventar ins Grid)
- Mehr Rezepte (Stein-basiert, Wasser-basiert)
- Axt-Achievement ("Holzfäller": 10 Bäume gefällt)
- Sound-Feedback bei Baumwachstum (leises "pling")

---

## Session 2026-03-29 (Nacht-Fix / Morgen-Verifikation)

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-29 | `bubble` Event-Listener in chat.js überlebt das HTML-Entfernen | Wenn ein DOM-Element aus HTML entfernt wird: alle JS-Referenzen UND alle Event-Listener auf das Element suchen und entfernen. Grep auf den ID-String reicht nicht — auch auf die Variable suchen. |
| 2026-03-29 | Playwright-Browser cached kompilierte Scripts | fetch() mit `cache: 'no-store'` zeigt was live ist. Browser-Memory-Cache täuscht — für Verifikation immer direkt fetchen statt aus dem DOM lesen. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-29 | Game-First Chat Discovery: Block bauen, Block antippen → Chat öffnet sich (NPC abhängig vom Material) |
| 2026-03-29 | BYOK Settings: nur sichtbar wenn `body.code-view-active` — verifiziert per Playwright |
| 2026-03-29 | Save/Load entfernt: jede Session startet frisch — Inventar aus localStorage, Grid ephemerisch |
| 2026-03-29 | Postcard magisch: Narnia-Ton, Pergament-Banner, 7 zufällige Entdecker-Zeilen |
| 2026-03-29 | Alle Tests grün: NPC-Chat öffnet (chatVisible: true), Settings toggle (beforeCodeView: false → afterCodeView: true) |

### Learnings
- **DOM-Entfernung ist nicht vollständig ohne JS-Cleanup**: `bubble` im HTML weg, aber 4 Zeilen JS (addEventListener) übrig → Crash. Immer komplett: HTML raus, Variable raus, alle Event-Listener raus.
- **`fetch(..., { cache: 'no-store' })` als Verifikationswerkzeug**: Playwright cached Scripts in Memory. Direkt fetchen zeigt ob GitHub Pages den neuen Stand hat.
- **Ephemerische Sessions als Feature**: "Die Insel verschwindet wenn du wegschaust" — kein Speichern ist keine Regression, es ist ein Designprinzip. Inventar und Achievements bleiben (localStorage), Grid nicht.

---

## Offene Fragen

- [ ] Wie misst man ob die 80/20-Ratio der Padawans stimmt?
- [ ] Wann lohnt sich Opus-Elevation wirklich? (Scientist entscheidet)
- [ ] Wie kommunizieren team-dev und team-sales asynchron?

---

## Session 2026-03-29 (Feynman-Daten + Branch-Protection)

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-29 | Pinecone aus worker.js entfernt — Schuhknecht hatte recht: keine Hypothese, kein Vektorraum |
| 2026-03-29 | `_feynman`-Payload: chat.js sendet Metriken (characterId, sessionDuration, blocksPlaced, questsCompleted, chatUsed, engagementScore, uniqueMaterials) bei jedem NPC-Chat |
| 2026-03-29 | n8n Workflow erweitert: Webhook → parallel Langdock + Feynman Log (n8n Data Table) |
| 2026-03-29 | n8n Data Table "Feynman Sessions" angelegt — kein Airtable-Account nötig |
| 2026-03-29 | Branch-Protection auf main: force-push verboten, PR Pflicht, 0 Reviews nötig (kein Deadlock) |
| 2026-03-29 | config.js zeigte: Client spricht schon direkt mit n8n-Webhook — kein Cloudflare Worker nötig |

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-29 | `n8n-nodes-base.n8nDataStore` existiert nicht — falscher Node-Typ | Immer `search_nodes` MCP-Tool nutzen bevor Node-Typ hardcoden |
| 2026-03-29 | `gh api --field` mit JSON-Objekt schlägt fehl | JSON-Body immer via `--input -` als stdin übergeben, nie als --field |

### Learnings
- **Kein MCP für Airtable vorhanden** — n8n Data Tables sind der bessere Weg: kein externer Account, direkt im Dashboard sichtbar
- **Cloudflare Worker umbenennen**: Dashboard → Worker → Settings → Rename. NICHT `wrangler deploy --name` — das erstellt einen zweiten Worker
- **Branch-Protection per API**: `required_approving_review_count: 0` = PR Pflicht ohne Reviewer-Deadlock. Der sweet spot für Solo-Entwickler
- **Feynman-Prinzip bestätigt**: Pinecone war Cargo Cult. Keine Hypothese → kein Tool. Airtable/n8n reicht für 7 KPIs
- **`window.getMetrics()` hat kein sessionDuration** — das liegt in `getFeynmanStats()`. Für nächste Session: beide zusammenführen oder `sessionDuration` in `getMetrics()` ergänzen

### Nächste Session
- `window.getMetrics()` um `sessionDuration` erweitern (liegt aktuell nur in `getFeynmanStats()`)
- Ersten echten Test-Chat machen und Feynman Sessions Tabelle in n8n prüfen
- Cloudflare Worker umbenennen falls gewünscht (Dashboard, nicht CLI)

---

## Session 2026-03-30 (Autonomer Sprint-Agent)

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-30 | Agent hat Sprint 6 nochmal implementiert obwohl remote bereits fertig | Immer `git fetch origin` + `git log origin/feat/*` BEVOR Code angefasst wird. Remote-State lesen, nicht nur local. |
| 2026-03-30 | Smoke Test 403 durch Sandbox-Proxy | Sandbox kann externe URLs nicht erreichen. Smoke Tests für schatzinsel.app nur auf echtem Gerät möglich. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-30 | Sprint 6 vollständig: 39 Quests (war 20), Entdeckungszähler dynamisch, alle Tooltips |
| 2026-03-30 | PR #38 offen: feat/sprint-6 → main |
| 2026-03-30 | Sprint 7 geplant: Insel-Identität + Spielfigur + NPCs sichtbar |

### Learnings
- **Remote-First**: Vor jedem Commit `git fetch origin` — sonst baut man Duplikate.
- **Autonomer Agent erkennt Sprint-State**: Ceremony-Logik aus SPRINT.md funktioniert ohne Briefing.
- **39 Quests decken alle 68 Materialien ab**: Crafting-Loop ist geschlossen. Jetzt braucht das Spiel eine sichtbare Spielfigur damit Oscar "sich selbst auf der Insel sieht".

---

## Session 2026-03-30 (5-Sprint-Velocity-Run)

### Velocity-Metrik (Feynman)

| Sprint | Item | Commits | Lines ±  | Backlog-Impact | Tokens gespart |
|--------|------|---------|----------|----------------|----------------|
| S1 | ELIZA Fallback Upgrade | 1 | +34/-18 | — | 0 (war schon da) |
| S2 | Craft-Ergebnis visuell (#76) | 1 | +31/0 | #76 ✅ | 0 |
| S3 | KLONK Sound (#70) | 1 | +35/0 | #70 ✅ | 0 |
| S4 | Tutorial-Glow (#68) | 1 | +14/-1 | #68 ✅ | 0 |
| S5 | Memory + Velocity | 1 | ~30 | Feynman-Doku | 0 |
| **Pre-Sprint** | NPC-Persönlichkeiten (#74) | 1 | +125/-110 | #74 ✅ | **~21k/Session** |
| **Pre-Sprint** | /bugs Endpoint + Zauber-Fix | 1 | +83/-5 | #73 #75 Backlog | ~0 |
| **Pre-Sprint** | Chat-Panel + Crafting UI | 1 | +12/-3 | #28 teilweise | 0 |

**Summe**: 8 Commits, 5 Sprints + 3 Pre-Sprints, ~330 Lines geändert

**Token-Effizienz**: NPC-Fix spart ~350 Tokens/Call × 60 Calls/Session = **~21.000 Tokens/Session**.
KINDERSICHERHEIT-Block von 40 auf 2 Zeilen. Persönlichkeit stärker UND billiger.

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-30 | Egress-Proxy blockiert Cloudflare Worker | Sandbox kann `*.workers.dev` nicht erreichen. `/discoveries` und `/bugs` nur im Browser testbar. |
| 2026-03-30 | NPC-Persönlichkeiten gingen unter weil KINDERSICHERHEIT 80% des Prompts war | System-Prompt-Architektur: Persönlichkeit FIRST (Few-Shot + STIMME/TICK), Regeln KURZ (2 Zeilen). Weniger Boilerplate = stärkere Stimme. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-30 | 3 P0-Bugs gefixt in einer Session (#68, #70, #74) |
| 2026-03-30 | /bugs Endpoint ersetzt Google Sheets Webhook (Backlog #5 wird obsolet) |
| 2026-03-30 | ELIZA klingt jetzt nach den NPCs — Offline-Chat funktioniert mit Persönlichkeit |
| 2026-03-30 | Craft-Ergebnis sichtbar im Dialog (Bounce-Animation + Name) |
| 2026-03-30 | PR #43 mit 8 Commits: NPC-Stimmen, Chat-UI, Bugs-Endpoint, Zauber, KLONK, Tutorial |

### Learnings
- **Few-Shot > Beschreibung**: 3 Beispiel-Dialoge im System-Prompt sind effektiver als 10 Zeilen Beschreibung. Haiku reproduziert Muster besser als Anweisungen.
- **Temperature pro Charakter**: Bernd=0.3 (trocken), Tommy=0.9 (chaotisch) macht mehr Unterschied als erwartet. Gleiche Temperature = gleiche Stimme.
- **Sound-Psychologie**: Der erste Sound einer Session prägt die Erwartung. KLONK statt Pentatonik = "hier passiert was" statt "hier klingt was".
- **KV > Google Sheets**: Cloudflare KV ist zero-setup (Worker hat es schon), Google Sheets braucht Webhook-Konfiguration die nie passiert. Pragmatismus > Plan.

---

## Session 2026-03-30 — Sprint 14 Review

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-30 | `automerge.js` als eigenes Modul: `window.INSEL_AUTOMERGE` mit Nachbarschafts-Physik (Yin+Yang→Qi, RGB-Triplet→Metall) |
| 2026-03-30 | Wu Xing Erzeugungszyklus: Holz→Feuer→Erde→Metall→Wasser→Holz als Wachstums-Bonus implementiert |
| 2026-03-30 | Funken-Animation: Gold-Spark bei Pair-Merge, weiße Rotation bei Triplet-Merge |
| 2026-03-30 | Game of Life Screensaver: Nach 2 Min Idle → Conway-Regeln auf dem Grid (Easter Egg) |
| 2026-03-30 | Spontaner Tao-Zerfall + Genesis-Replay: Symmetriebrechung als Spielmechanik |
| 2026-03-30 | /buch Skill + 8 Kapitel: Das Buch das sich selbst schreibt |

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-30 | 50 Commits in detached HEAD — nicht auf main | Immer `git checkout main` (oder Feature-Branch) vor dem ersten Commit. Detached HEAD = Commits gehen verloren wenn nicht als Branch gesichert. |
| 2026-03-30 | SPRINT.md zeigte 🔲 obwohl alles committed war | SPRINT.md im selben Commit updaten wie den Feature-Code. Nie trennen. |

### Learnings
- **Automerge als Physik-Engine**: Nicht Regeln, sondern Naturgesetze. "Die Insel organisiert sich selbst." Das Spielgefühl ist anders.
- **Emergenz > Prescriptivism**: Wenn Yin+Yang von selbst zu Qi werden, muss Oscar nichts erklären. Er sieht es passieren.
- **Game of Life als Screensaver**: 2 Minuten Inaktivität = das Grid lebt. Kein UI, kein Toast. Oscar dreht sich um und die Insel hat sich verändert. Perfekt.

---

## Session 2026-03-30 — Sprint 18 (Autonomer Agent)

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-30 | Local main war 87 Commits hinter origin/main wegen divergiertem Verlauf | Nach `git fetch` sofort `git reset --hard origin/main` wenn main divergiert ist. Remote ist Wahrheit. |
| 2026-03-30 | Sprint 18 Item S18-3 ("Schatzinsel") war bereits implementiert | Vor Item-Auswahl checken: `grep -i "schatzinsel" index.html`. Triviale Aufgaben im Code verifizieren, nicht aus Backlog-Text ableiten. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-30 | Sprint 18 done: Tonhöhe (Erde=C3 tief, Feuer=G5 hoch, Wasser=Glide A4→A3), Genesis-Badge (道→⚫⚪→五行→✨→万+), Schatzinsel-Name bereits da |

### Learnings
- **Wu Yin Physik**: Erde gehört tiefer (C3 = 130 Hz), Feuer höher (G5 = 784 Hz). Der Klang folgt der Philosophie — Kinder spüren das ohne es zu wissen.
- **Glide-Ton für Wasser**: `frequency.exponentialRampToValueAtTime` von A4→A3 = 0.3s Abstieg. Klingt wie fließendes Wasser. Drei Zeilen Code.
- **Genesis-Badge ist ein Spiegel**: Das Kind sieht 道 am Anfang. Dann ⚫⚪. Dann 五行. Progression ohne Text. Feynman: "Wenn's kein Label braucht, ist's gut genug."
- **Für Oscar**: Feuer geht HOCH. Erde geht TIEF. Wasser fließt. Die Insel klingt jetzt wie sie aussieht.

---

## Session 2026-03-31b — Delegation + Zellteilung + Beirat

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-31 | Analytics-Commit auf falschem Branch (feat/docs-setup statt feat/analytics-extraction) gelandet | Immer `git branch` prüfen bevor man committet. Agent hat im Hintergrund Branch gewechselt. |
| 2026-03-31 | Cherry-Pick für atomare PRs erzeugt 3x Merge-Konflikte in AGENTS.md | Atomar von Anfang an. Ein Feature = ein Branch = ein PR. Cherry-Pick ist Notfall, nicht Workflow. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-31 | 8 Beirats-Personas (Dirac, Newton, Jung, Freud, Schiller, Goethe, Lessing, Fichte) als atomare PRs (#94, #95, #96) |
| 2026-03-31 | Appelo Delegation-Level-Audit + docs/DELEGATION.md — 20 Entscheidungsbereiche, 7 Level |
| 2026-03-31 | analytics.js extrahiert (Zellteilung #11 Phase 1) — game.js -162 LOC |
| 2026-03-31 | docs/PROJECT.md + DESIGN.md + DECISIONS.md aufgesetzt (#80) |

### Learnings
- **Delegation Level 7 = Vertrauen**: 74% der Entscheidungen brauchen den User nicht. Ethik/Kinderschutz und Vision sind Level 1 — das bleibt.
- **Zellteilung game.js ist schwerer als gedacht**: Analytics war sauber isoliert (nur localStorage). Alles andere (Wetter, NPC, Player) hängt am Canvas-Context und Grid-State. Braucht Event-Bus-Pattern für die nächste Phase.
- **Bismarck interviewt besser als HR**: "Können Sie sich kurz fassen?" ist die einzige Frage die zählt.

---

## Session 2026-03-31c — Sprint 22 Retrospective

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-31 | Sprint 22 hatte 8 Items — dreifach über Maximum | Max 3 Items pro Sprint. Hart. Kein "ja aber diesmal ist es anders". |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-31 | Mephisto NPC live: 10. Charakter, Deal-Mechanik, Browning-Zitat, Seelenglut-Währung |
| 2026-03-31 | Gemini Voice Chat: 5 Stimmen, Worker-Abstraktion, kein Vendor-Lock-In |
| 2026-03-31 | KLONK auf Minecraft-Niveau: 3-Layer Sub-Bass — Oscar hört den Unterschied |

### Learnings
- **8-Item-Sprints sind technisch möglich aber pädagogisch falsch.** Rhythmus (1 Sprint = 1 Stunde = 3 Items) ist nicht Bürokratie, sondern Fokus.
- **Smoke Tests gehören in CI, nicht in den Agent.** Proxy-Sandbox macht externe Curls unzuverlässig. BACKLOG #86 löst das.
- **Easter Eggs bauen sich schnell.** Lummerland: eine Stunde, maximale Freude. Verhältnis merken.

---

## Session 2026-04-01 — Sprint 24 Review

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-04-01 | Session hat Sprint 23 geplant + implementiert, Remote hatte schon anderen Sprint 23 und Sprint 24 | Vor Sprint Planning: `git fetch origin` + aktuellen Branch-State lesen. Nicht blind planen. |
| 2026-04-01 | Smoke Test (curl extern) scheitert wegen Sandbox-Proxy — kein Outage, sondern Sandbox-Beschränkung | `x-deny-reason: host_not_allowed` = Proxy-Block. Nicht als Outage reporten. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-04-01 | Sprint 24 Review geschrieben und gepusht. Branch feat/sprint-23 auf Remote aktuell. |
| 2026-04-01 | Parallel-Session-Duplikat erkannt und aufgelöst via `git reset --hard origin/feat/sprint-23` — keine Datenverluste. |

### Learnings
- **Immer zuerst fetchen**: `git fetch origin && git log origin/BRANCHNAME` — bevor ich etwas plane oder committe.
- **Sandbox-Proxy blockt externe URLs**: curl auf externe Domains = 403 `host_not_allowed`. Kein echter Outage. CI muss das außerhalb der Sandbox machen (BACKLOG #86).
- **PR-Pflicht**: Kein `gh` CLI in dieser Sandbox. PR muss vom User oder einer anderen Session erstellt werden wenn der Branch bereit ist.## Session 2026-04-01 — Inselbewusstsein + Wirtschaftstheorie

### Erkenntnisse

| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-04-01 | Die Insel hat 6 Bewusstseinsschichten — aber Feynman sagt: technisch sind es 3 Gruppen (regelbasiert, dekorativ, LLM-basiert). Conway ist Dekoration, kein Bewusstsein. | "Verteilt" impliziert Kommunikation. Ohne Inter-Schicht-Events sind es parallele Systeme, kein verteiltes System. |
| 2026-04-01 | Freud genügten 3 (Es, Ich, Über-Ich) weil er den ganzen Menschen modellierte. Die Insel braucht 6 weil sie KEIN Ich hat — das Kind bringt das Ich mit. | Stärkste These der Session. Die Insel ist ein Nervensystem ohne Gehirn. |
| 2026-04-01 | Muscheln waren unendlich craftbar → kein Goldstandard möglich. SHELL_CAP=42 macht sie knapp → MMX-Deckung funktioniert. | Knappheit auf beiden Seiten = Goldstandard. Douglas Adams als stiller Beirat. |
| 2026-04-01 | NPC-Currencies (Krabbenburger, Sternenstaub etc.) sind KEINE Währung sondern Beziehungsenergie. Ricardo: Trennung beibehalten. | Muscheln = Handel, NPC-Tokens = Beziehung. Zwei verschiedene Dinge. |
| 2026-04-01 | Kommazahlen sind zum Messen, nicht zum Einkaufen. Geld ist diskret, die Welt ist kontinuierlich. | Krabs rechnet in Muscheln (ganz), Elefant misst in Kommazahlen. Zwei NPCs = zwei Zahlensysteme = ein Kind das beides lernt. |
| 2026-04-01 | "Zusammen sind wir weniger allein" — der Satz der über dem ganzen Projekt steht. | Schatzkarte, Geleitschutz-Quest, NPC-Beziehungen — alles dreht sich um Verbindung, nicht um Features. |

### Neue Beiräte

- `/ricardo` — David Ricardo · Komparative Vorteile & Währungstheorie
- `/pestalozzi` — Johann Heinrich Pestalozzi · Grundschulpädagogik & Lektorat
- `/adams` — Douglas Adams · Absurdität & die Frage nach 42

### Ideen-Dump (noch nicht im Backlog)

1. **Piraten-Ökonomie** — Gierige Spieler mit mehreren Inseln parallel, Muscheln per Schiff überweisen, Piraten als Risiko
2. **Hardware als Wirtschafts-Cap** — Wirtschaftsleistung passt sich GPU/CPU/Speicher an
3. **Quest: Geleitschutz von Papa** — Schiff beladen mit Schätzen, Papa eskortiert zurück
4. **Weltkarte mit Inseln anderer Spieler** — jede Insel ein Punkt auf der Karte
5. **Neue unbewohnte Inseln** — entdecken, besiedeln, benennen
6. **Inseln mit NPCs** — andere Inseln haben eigene NPC-Bewohner
7. **Unkontaktierte Völker** — Inseln die man sehen aber nicht betreten kann. Respekt vor dem Unbekannten.

### Deliverables

- Podcast: `docs/podcast-island-consciousness.md`
- Essay: `docs/essay-island-consciousness.md`
- Feynman-Review: `docs/review-island-consciousness.md`
- Ricardo-Interview: `docs/interview-ricardo-currency.md`
- Aufsatz Grundschule: `docs/aufsatz-kommazahlen-grundschule.md`
- Schatzkarte: Worker-Endpoint + Spiel-Button + Telegram MCP (feat/schatzkarte)
- WhatsApp MCP: feat/whatsapp-mcp
- PR #112: Bewusstsein + Muscheln + MMX + Goldstandard
---

## Regeln für neue Einträge

1. **Fehler**: Nur wenn es ein echtes Problem verursacht hat (nicht theoretisch)
2. **Erfolge**: Nur wenn es messbar funktioniert hat (nicht "ich glaube es klappt")
3. **Learnings**: Nur wenn es aus Erfahrung kommt (nicht aus einem Blogpost)
4. **Datum immer angeben** — damit wir wissen wie alt die Erkenntnis ist
5. **Feynman kuratiert** — löscht Duplikate, hinterfragt Kausalität, feiert Falsifizierbarkeit
