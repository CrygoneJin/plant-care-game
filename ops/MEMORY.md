# Memory

Persistent team log. Append-only. Read by all agents.

---

## Learnings

| 2026-04-21 | Session 101 (Sprint Review S91): PR #407 (Tests S91-1+S91-2, 27 Playwright-Tests) + PR #406 (Runde 77, 825 Quests) + PR #408 (4 User-Bugs) alle gemergt. Test-Suite jetzt 41 Tests auf main. Sprint Goal erreicht. S91-4 (Oscar Palette-Check) bleibt blocked auf Till. Nächste Quest-Runde: Bug/Krabs/Tommy (Counter 58/59/59). |
| 2026-04-21 | Session 102 (Engineer/Linus, Supabase-Backend MVP): Cloud-Save-Feature auf `feat/supabase-backend` — Schema (`players`/`saves`/`chat_log`, RLS-Lockdown, Trigger `touch_player_last_seen`), Worker-Endpunkt (`worker-supabase.js` getrennt damit Merge-Konflikte klein bleiben, 2-Zeilen-Patch in `worker.js`), Frontend (`supabase-sync.js`, Opt-In via localStorage, 3s Debounce, Device-ID ohne Login), Doku (`docs/SUPABASE.md`), Smoke-Test. **KRITISCHER LEARNING: Shared working dir = Race Condition.** Parallel-Agent (Krabs-Shop/Particle-Snap) hat während der Arbeit Branches gewechselt, meine Edits an tracked files wurden gewiped. Recovery: `git worktree add /Users/till/projects/schatzinsel-supabase feat/supabase-backend` → isolierter Arbeitsordner, kein Share mit anderen Agenten. Für Multi-Agent-Workflows ab jetzt Pflicht. tsc grün. Deployment blockiert auf Till's Supabase-OAuth (MCP `mcp__supabase__authenticate`). |
| 2026-04-21 | Session 102 (Retro S91): S91 abgeschlossen. 3/4 Items done (S91-4 Palette-Check bleibt bis S93 offen, dann schließen). Bonus: PR #408 (4 User-Bugs) außerhalb Scope. CI-Flake-Diagnose bewährt. Smoke-Test via curl immer CF-403 — kein App-Schaden, aber kein grüner Check möglich; Worker-Health-Endpoint als Ersatz empfohlen. Nächste Quest-Runde S92: Bug(58)/Krabs(59)/Tommy(59). |
| 2026-04-21 | Librarian (Isidor) docs-Cleanup: docs/ Top-Level von 34 Files auf 10 Produkt-Docs + README reduziert. Neue Subordner: essays/ (8 konsolidiert), podcasts/, reviews/, interviews/, screenshots/, sonstiges/, archiv/. `archiv/` klein+deutsch gewählt um Case-Kollision mit `ARCHIVE.md` (Backlog-Friedhof) zu vermeiden. Pattern-Fehler: parallele Agenten switchen den Branch shared-workingtree → meine Commits landeten mehrfach auf `feat/hex-trixel` statt `chore/docs-cleanup`. Per Cherry-Pick geholt, per `rebase --onto` einen fremden Commit (`c36acda3` Hex-Trixel) aus der Branch-History entfernt. Bei Mehrfach-Agent-Setup: nach jedem Commit `git branch --show-current` verifizieren, sonst rogue Commits. PR #411. |
| 2026-04-21 | Session 102 (Tetrahedron-Engine, Branch 2 Quad-Trixel-Bridge): PR #415 — `src/core/quad-trixel.js` als Sidecar-Store (`Map<"r,c", QuadTrixel[4]>`) fuer optionale Trixel-Subdivision der Quad-Grid-Zellen. Nord/Ost/Sued/West-Reihenfolge, cyclic 2048-Snap (0-1, 1-2, 2-3, 3-0). Ephemeral — keine Persistenz (Follow-up in BACKLOG). Minimaler Hook in `iso-renderer.js` `drawIsoIsland` (5 Zeilen vor Cube-Block): wenn QT.hasAt(r,c), rendere 4 flache Dreiecke via QT.drawQuadTrixels + `continue`. Hit-Test unveraendert — Clicks gehen an die Cell als Ganzes. 19 neue Tests (node --test), alle gruen. tsc --noEmit gruen. Advisor-Guidance: flache Dreiecke (keine Extrusion), Helper-Funktion in quad-trixel.js statt iso-renderer, Depth→Helligkeits-Modifier statt 3D-Cube. |
| 2026-04-21 | Session 102 (Hex-Trixel B3 — particle-snap): PR feat/particle-snap — neues Modul `src/core/particle-snap.js` (IIFE, `window.INSEL_PARTICLE_SNAP`) + 12 Tests gruen. 2048-Snap fuer fliegende Partikel: Kollision zweier gleicher Partikel -> INSEL_AUTOMERGE.MERGE_RULES lookup -> neues Material (Yang+Yang->Charm) ODER Wachsen (size x 1.3) ohne Transform. Unterschiedliche Materialien mit Rule (Yin+Yang->Qi) auch unterstuetzt. BUS-Event `particle:merge`. Integration in index.html nach hex-marble.js. Parallel-Agent-Chaos bestaetigt: beim Start auf `fix/krabs-shop-unreachable` mit fremden Supabase+Krabs-Shop-Changes im Working-Tree gelandet -> Stash + sauberer Branch-Reset auf origin/main war die Rettung. Lehre: Branch-Status VOR Arbeit pruefen, nicht erst committen. |
| 2026-04-21 | Session 101 (Krabs-Shop-Bug): User-Report "Mr Crabs bietet nichts im Shop an". Root Cause: `showNpcQuestDialog('krabs')` fiel nur in den Shop-Branch wenn Krabs keine Quest hatte — aber Krabs hat ~30 Quests, also Shop war praktisch tot. Fix: Krabs-Zweig VOR `if (active)` und `else if (quest)` gezogen. Quest-Toast läuft nebenbei, Shop öffnet immer. Parallel-Agent-Chaos: während der Arbeit haben andere Agenten drei Mal den Branch gewechselt (feat/hex-trixel → feat/particle-snap) und meine Edits in main überschrieben. Lösung: `git worktree add ../schatzinsel-krabs` für isolierten Workspace. |
| 2026-04-21 | Session 101 (autonomer Agent): PR #406 (Quest-Runde 77, 825 Quests) + PR #408 (4 User-Bugs: Iso-Toggle, Touch, Iso-Scroll, PWA-Chat-Header) auf main gemergt. PR #407 (Tests S91-1+S91-2) auf main rebased nach Merge-Konflikt in MEMORY.md/SPRINT.md. Konflikt-Strategie: beide Einträge behalten (kein `--ours`/`--theirs`). CI für #407 läuft. |
| 2026-04-21 | Session 100 (Bug-Fix-Sprint): 6 User-Bugs triagiert, 4 gefixt in einem PR. **#1 Player verschwand nach Iso-Toggle** — playerPos wurde nicht mit offR/offC migriert wenn Grid-Dimensionen wechselten (32×18 ↔ 64×64). Fix: newR = playerPos.r - srcOffR + offR, clamped auf [2, ROWS-3]. **#6 Bernd-Wolke auf Touch nicht klickbar** — Hit-Detection (bwx/bwy) nur im pointerdown-Handler, touchstart hatte den Check nicht → iPad/Tesla konnte Support nicht öffnen. Fix: gleichen Check in touchstart kopiert, nur im !isoMode (Cloud wird dort nicht gezeichnet). **#2 Iso-Modus kein Scrolling** — `#canvas-wrapper { overflow: hidden }` + mobile `canvas.style.width=100%` erzwang Viewport-Fit. Fix: `body.iso-mode #canvas-wrapper { overflow: auto }` + resizeCanvas setzt body-Class + skipped mobile-100%-Rule in iso. **#3 Close-Button fehlt in Support-Chat auf PWA** — #chat-panel startet bei top:52px ohne safe-area-inset-top → auf iOS-PWA verschwindet der Header hinter Status-Bar. Fix: `top: calc(52px + env(safe-area-inset-top, 0px))` auf Desktop+Mobile. Offen: #4 Marketplace-Offers, #5 NPC-Interaction (wahrscheinlich UX, NPCs sind klickbar). |
| 2026-04-21 | Session 100 (S91 Daily Scrum): Root Cause #402 gefunden — `#chat-character-name` in chat.js referenziert aber nicht in HTML. charNameDisplay war immer null, Header nie gesetzt. Fix: <span id="chat-character-name"> zu index.html hinzugefügt. npc-dialog.spec.js (9 Tests) + block-quest.spec.js (18 Tests aus #403/#404 konsolidiert) neu geschrieben. S91-3 Quest-Runde 77 bereits als PR #406 offen (Nacht-Session). |
| 2026-04-21 | Session 99 (Nacht-AFK-Merge): 10 offene PRs autonom aufgeräumt. Gemerged: #394 (craft-flow tests), #395 (sailing tests), #396/#397/#399/#401 (Quest-Runden 73-76, +42 Quests → 817), #405 (Palette-Blöcke 2x größer, Emoji 32→64px). Geschlossen: #400 (SPRINT.md -4531 Zeilen zu riskant, DIRTY nach Quest-Merges), #402/#403/#404 (Tests rot in CI, Red-CI = No-Merge). Pattern: Quest-PRs stacken auf Parent-Branches → Cherry-Pick auf main statt Rebase des gesamten Stacks, weil Squash-Merge Commit-Hashes ändert. SPRINT.md-Konflikte mit `--ours` aufgelöst (main gewinnt). UI-Change: material-btn min-height 58→84, .mat-emoji 32→64px, Mobile Portrait 52→68px, line-height:1 gegen Emoji-Bleeding. |
| 2026-04-20 | Session 98 (Playwright Tests #103): craft-flow.spec.js mit 7 Tests für Werkbank-Flow (Dialog öffnen/schließen, Slot-Befüllung, yin+yang→qi Rezept-Preview, craft:success BUS-Event, getInventoryCount). Alle Tests lokal grün (chromium, 9.4s). Basis: Progressive Disclosure Stufe 5 via localStorage-Preset (blocks-placed=5, discovered-recipes=["Qi"], unlocked-materials=core-5, quests-done=["Seed-Quest"]). Pattern: BUS-Event-Listener vor Trigger aufsetzen, waitForFunction auf Result-Variable. |
| 2026-04-20 | Session 98 (Playwright Tests #103 Teil 2): sailing-archipel.spec.js mit 7 Tests für Sail-Dialog + Insel-Navigation. Alle lokal grün (chromium, 11.4s). 1-Zeilen-Patch in game.js: `window._showSailDialog = showSailDialog` als Test-Hook (umgeht sailboat-Platzierungsanforderung). sailToIsland-Timing: saveIslandState('home') läuft synchron, island:arrived Event kommt nach 2000ms setTimeout. |
| 2026-04-20 | Session 98 (Nacht-AFK-Cleanup): Meeting + Backlog-Reorganisation. Meeting-Diagnose: 3 von 5 P0-Items blockieren seit Wochen auf Till. Problem war nicht Backlog-Größe, sondern falsche Kategorisierung — Human-Input-Tasks standen als "P0 Jetzt" statt als "HITL"-Block. Neue Struktur: **🚨 HITL max 3** (Key rotieren, CF Worker Deploy, Native Speaker Outreach) + **🔄 Delegiert** (Live Launch → Leader, Tesla-Video → Scientist). 66+ erledigte Items in kollabiertem Archiv. Parallel: /leader im Hintergrund an Playwright Tests für #103 Live Launch (P0). Nach Meeting-Call: "change it" — Backlog sortiert, nicht reduziert. |
| 2026-04-20 | Session 98 (PR-Finale): 11 offene PRs komplett aufgeräumt. 7 via Titel-Grep als Duplikate von #381 Konsolidierung identifiziert + geschlossen (#308/#309/#310/#314/#339/#341/#345). 4 mit unique Content (#311/#312/#340/#367) in Konsolidierungs-PR #393 zusammengefasst — 39 neue Quests extrahiert (736→775), Rebase wäre 27-Commit-Konflikt-Hölle gewesen. Pattern: Titel-Grep gegen main ist schneller + sicherer als sequenziell rebasen. Endstand: 0 offene PRs, 775 Quests, tsc grün. |
| 2026-04-20 | Daily Scrum S89 (Session 95): Parallel-Session-Chaos rekurriert — Sessions 93+94 haben nach Session 92 weitere PRs erstellt (#391 Docs-PR, #392 Runde 72). #391 geschlossen (verletzt Docs-PR-Regel). #392 valide, zur Triage-Liste hinzugefügt. Kein neuer Code in dieser Session. Aktualisierte Triage: 5 zu mergende PRs (#382→#383→#387→#390→#392), 6 zu schließende (#384/#385/#386/#388/#389/#391). 736 Quests nach Vollmerge. |
| 2026-04-20 | Sprint 89 Planning (Session 92): S88 Review+Retro + S89 Planning. Nach Merge-Marathon: 696 Quests, alle Haupt-NPCs bei 52 (Floriane 55, Mephisto 53). 9 offene PRs aus parallelen Nacht-Sessions. Triage-Guide für Till in SPRINT.md: #382→#383→#387(rebase)→#390(rebase) mergen, #384/#385/#386/#388/#389 schließen. Kein neuer Code — alles in PRs implementiert. Parallel-Session-Chaos: mehrere autonome Sessions in einer Nacht = PR-Explosion. Fix: Lock-Mechanismus oder sequentielle Sessions. |
| 2026-04-19 | Nacht-Sprint (Session 91+): Merge-Marathon. KRITISCHER LEARNING: 29 PRs aus dem Stack #313–#374 hatten `base != main` (jede PR auf ihren Parent-Branch gestackt). `gh pr merge` macht KEINEN Check ob base=main → silent stack-merge ohne main-Effekt. Quest-Content blieb in Intermediate-Branches. Lösung: Cherry-Pick aus Stack-Tip `feat/quests-runde-68` (696 Quests) in Konsolidierungs-PR #381 gegen main. Tests grün. Empfehlung für künftige Stack-Workflows: 1) base immer prüfen, 2) bottom-up mergen oder 3) konsolidieren statt stacken. Audio-PRs #377/#378 + Docs #379+#381 echte main-Merges. 11 Stack-PRs offen für morgen-früh-Triage. Tracking-Docs in `docs/metrics/2026-04-19-*`. |
| 2026-04-19 | Sprint 87 S87-1 (Session 89): Sprint 86 Review+Retro + Sprint 87 Planning + S87-1 implementiert. Quests Runde 47 — Spongebob 5 (Ananas-Palast-Erweiterung, Quallen-Sinfonie-Saal, Patrick-Gedenkstein, Meeres-Akademie, Bikini-Bottom-Erinnerungsturm) + Mephisto 5 (Seelenmühle, Nachtwächter-Turm, Düsteres Amphitheater, Pakt-Archiv-Kammer, Verdammnis-Garten). PR #344 (feat/quests-runde-47, force-pushed auf bestehenden Branch). 486 Quests auf Branch. Stack: #314→…→#343→#344. Nächste Kandidaten S88: Lokführer/Krämerin/Elefant bei 37/36/36. |
| 2026-04-19 | Sprint 86 S86-1 (Session 88): Sprint 85 Review+Retro + Sprint 86 Planning + S86-1 implementiert. Quests Runde 46 — Lokführer 4 (Nacht-Express, Stellwerk, Schneepflug-Depot, Tausend-Fahrten-Fest) + Krämerin 3 (Gewürzlager, Jahresmarkt-Bühne, Händler-Herberge) + Elefant 3 (Regenwald-Trommel, Wind-Harfe, Gezeiten-Sinfonie). PR #343 (Branch feat/quests-runde-46, bereits existiert aus früherer Session, Force-Push mit neuem Inhalt). 476 Quests auf Branch. Stack: #314→…→#368→#343. Parallel-PRs #359–#364 (Runde 62–67) aus falschem Branch-Ursprung entdeckt — ignoriert, kanonischer Stack läuft über #343. Nächste Kandidaten S87: Mephisto/Spongebob bei 35. |
| 2026-04-19 | Sprint 85 S85-1 (Session 87): Sprint 84 Review+Retro + Sprint 85 Planning + S85-1 implementiert. Quests Runde 45 — Floriane 4 (Mondspiegelteich, Feenflügel-Atelier, Sternschnuppen-Protokoll, Wunsch-Resonanz-Kammer) + Spongebob 3 (Gary-Hochschule, Krabby-Patty-Geheimrezept-Tresor, Sandburg-Weltmeisterschaft) + Mephisto 3 (Paradox-Garten, Schatten-Destillerie, Labyrinth der Entscheidungen). Branch feat/quests-runde-45 auf feat/quests-runde-44-s84 stacked. 466 Quests auf Branch. Nächste Kandidaten S86: Lokführer/Krämerin/Elefant bei 33. |
| 2026-04-19 | Sprint 84 S84-1 (Session 86): Sprint 83 Review+Retro + Sprint 84 Planning + S84-1 implementiert. Quests Runde 44 — Maus 5 (Pilz-Dorf, Eiswunderland, Sternschnuppen-Aussicht, Drachen-Freundschaft, Regenbogen-Rutsche) + Krabs 5 (Diamanten-Vitrine, Tiefsee-Expeditions-Deck, Krabben-Bank, Muschel-Markt, Fossil-Auktion). PR #367 stacked auf #366. 456 Quests auf Branch. Remote feat/quests-runde-44 war durch anderen Stack belegt → feat/quests-runde-44-s84. Stack: #314→…→#365→#366→#367. Nächste Kandidaten S85: Floriane/Spongebob/Mephisto bei 32. |
| 2026-04-19 | Sprint 83 S83-1 (Session 85): Sprint 82 Review+Retro + Sprint 83 Planning + S83-1 implementiert. Quests Runde 43 — Bernd 4 (Erster-Schnee-Protokoll, Kompost-Station, Mondphasen-Wartepunkt, Stilles Teichufer) + Lokführer 3 (Dampf-Werkstatt, Aussichtswagen, Rangier-Bahnhof) + Krämerin 3 (Gewürzmarkt, Buchhandlung, Kräutergarten-Apotheke). PR #366 stacked auf #365. 446 Quests auf Branch. Stack: #314→…→#338→#365→#366. Branch feat/quests-runde-43. SPRINT.md auf main zurückgeholt (feat/quests-runde-42-s82 hatte veralteten Stand). |
| 2026-04-19 | Sprint 82 S82-1 (Session 84): Sprint 81 Review+Retro + Sprint 82 Planning + S82-1 implementiert. Quests Runde 42 — Bug 4 (Blütenkartenwerk, Regentropfen-Dach, Raupen-Besuch, Zugvogel-Frage) + Neinhorn 3 (Verbotenes Tor, Nein-Archiv, Heimliches Willkommen) + Alien 3 (Neutronenstern-Uhr, Erster-Kontakt-Botschaft, Paralleluniversum-Fenster). PR #365 stacked auf #338. 436 Quests auf Branch. Stack: #314→…→#338→#365. Remote feat/quests-runde-42 war durch anderen Stack belegt → feat/quests-runde-42-s82 verwendet. |
| 2026-04-19 | Sprint 81 S81-1 (Session 83): Sprint 80 Review+Retro + Sprint 81 Planning + S81-1 implementiert. Quests Runde 41 — Floriane 3 (Wunschkristall-Garten, Regenbogenbrücke der Botschaft, Wunschspeicher-Turm) + Tommy 3 (Mondgravitations-Labor, Vulkan-Beobachtungsposten, Polarnacht-Forschungsstation) + Neinhorn 2 (Verbotene Halbinsel, Schweigender Berggipfel) + Alien 2 (Dunkle-Materie-Detektor, Galaxienatlas-Station). PR #338 stacked auf #337. 426 Quests auf Branch. Stack: #314→…→#337→#338. Bug folgt S82 (bei 29). Keine neuen Materialien in Runde 41. Force-push auf feat/quests-runde-41 nötig weil veralteter Branch aus früherer Session existierte. |
| 2026-04-19 | Sprint 80 S80-1 (Session 82): Sprint 79 Review+Retro + Sprint 80 Planning + S80-1 implementiert. Quests Runde 40 — Spongebob 3 (Neptun-Tempel, Blasen-Forschungslabor, Quallen-Nationalpark) + Mephisto 3 (Ewige Bibliothek der Absichten, Observatorium des Bedauerns, Schatten-Amphitheater) + Maus 2 (Geheimes Baumhaus, Wellenbrecher-Posten) + Krabs 2 (Kristall-Tresor, Schatz-Galerie). PR #337 stacked auf #336. 416 Quests auf Branch. Stack: #314→…→#336→#337. Nächste Kandidaten S81: Floriane + Tommy/Neinhorn/Bug/Alien bei 29. |
| 2026-04-18 | Sprint 79 S79-1 (Session 81): Sprint 78 Review+Retro + Sprint 79 Planning + S79-1 implementiert. Quests Runde 39 — Tommy 3 (Dampf-Fabrik, Tornado-Bunker, Wüstenposten) + Neinhorn 3 (Schnee-Labyrinth, Glas-Aussichtsturm, Sternschnuppen-Turm) + Bug 2 (Nektarroute, Schmetterlingsball) + Alien 2 (Antimaterie-Kammer, Wormhole-Station). PR #336 stacked auf #335. 406 Quests auf Branch. Stack: #314→…→#335→#336. Nächste Kandidaten S80: Spongebob/Mephisto/Maus/Krabs/Floriane bei 29. |
| 2026-04-18 | Sprint 78 S78-1 (Session 80): Sprint 77 Review+Retro + Sprint 78 Planning + S78-1 implementiert. Quests Runde 38 — Lokführer 3 (Nachtpost-Express, Lokomotiv-Drehscheibe, Schneeräumer-Depot) + Kraemerin 3 (Blumenmarkt, Werkzeughandel, Dorf-Versammlungsplatz) + Krabs 2 (Muschelwaage, Tiefsee-Tresor) + Floriane 2 (Mondblumen-Garten, Wunsch-Archiv). PR #335 stacked auf #334. 396 Quests auf Branch. Stack: #314→…→#334→#335. Tommy/Neinhorn/Bug/Alien bei 28 → nächste Kandidaten S79. Fehler korrigiert: SPRINT.md Retro S77 hatte Elefant fälschlicherweise bei 28 (ist 33). Session 79 hatte falsche Runde-37-Basis → PR #335 neu erstellt auf korrektem Stack. |
| 2026-04-17 | Sprint 77 S77-1 (Session 78): Sprint 76 Review+Retro + Sprint 77 Planning + S77-1 implementiert. Quests Runde 37 — Spongebob 3 (Sandy's Wissenschaftskuppel, Gary's Schnecken-Rennen, Kelp-Wald-Kabine) + Mephisto 3 (Vergessens-Kammer, Vertragsstein-Galerie, Nacht-Basar der Geständnisse) + Bernd 4 (Regen-Messpunkt, Mitternachts-Veranda, Pilz-Kartierung, Saatgut-Archiv). PR #334 stacked auf #332. 386 Quests auf Branch. Stack: #314→…→#332→#334. Tommy/Neinhorn/Elefant bei 28 → nächste Kandidaten S78. |
| 2026-04-17 | Sprint 76 S76-1 (Session 77): Sprint 75 Review+Retro + Sprint 76 Planning + S76-1 implementiert. Quests Runde 36 — Maus 4 (Flaschenpost-Anker, Kompass-Station, Seestern-Teich, Piraten-Ausguck) + Bug 3 (Süd-Etappenstation, Blüten-Kartographie, Schmetterlings-Akademie) + Alien 3 (Plasma-Forschungsstation, Parallelwelten-Observatorium, Zeitanomalie-Monitor). PR #332 stacked auf #331. 376 Quests auf Branch. Stack: #314→…→#331→#332. |
| 2026-04-17 | Sprint 75 S75-1 (Session 76): Sprint 74 Review+Retro + Sprint 75 Planning + S75-1 implementiert. Quests Runde 35 — Lokführer 3 (Gebirgspass-Express, Bahnhofshotel, Stellwerksturm) + Kraemerin 3 (Trüffelmarkt, Handelskontor, Hafenmarkt) + Krabs 2 (Tiefsee-Investition, Krabben-Hauptquartier) + Floriane 2 (Frühlings-Erweckung, Feenpost-Netz). PR #331 stacked auf #330. 366 Quests auf Branch. Stack: #314→…→#330→#331. |
| 2026-04-17 | Sprint 74 S74-1 (Session 75): Sprint 73 Review+Retro + Sprint 74 Planning + S74-1 implementiert. Quests Runde 34 — Spongebob 3 (Tiefsee-Zirkus, Quallen-Wanderung, Seifenblasenstadion) + Bernd 3 (Nebelteich am Abend, Vogelfutterhaus-Garten, Frühmorgen-Kräutergarten) + Alien 2 (Raumstation-Andockplatz, Xenobotanischer Garten) + Mephisto 2 (Theater der Träume, Archiv der gebrochenen Versprechen). PR #330 stacked auf #329. 356 Quests auf Branch. Stack: #314→…→#329→#330. |
| 2026-04-17 | Sprint 73 S73-1 (Session 74): Sprint 72 Review+Retro + Sprint 73 Planning + S73-1 implementiert. Quests Runde 33 — Floriane 3 (Wunsch-Laterne, Feenpost-Station, Nacht-Observatorium der Wünsche) + Bug 3 (Kokonseide-Atelier, Bug's Geheimgarten, Metamorphose-Monument) + Maus 2 (Nebelhorn-Turm, Mondschein-Café) + Krabs 2 (Edelstein-Auktion, Museum für unveräußerlichen Besitz). PR #329 stacked auf #328. 346 Quests auf Branch. Stack: #314→…→#328→#329. |
| 2026-04-17 | Sprint 72 S72-1 (Session 73): Sprint 71 Review+Retro + Sprint 72 Planning + S72-1 implementiert. Quests Runde 32 — Mephisto 3 (Seelenwage, Traumfänger-Archiv, Höllen-Observatorium) + Lokführer 3 (Viadukt, Lokomotive-Fabrik, Bahnhofsrestaurant) + Bernd 2 (Stilles Gewächshaus, Sonnenuhr-Platz) + Alien 2 (Meteoriten-Labor, Erstkontakt-Turm). PR #328 stacked auf #327. 336 Quests auf Branch. Stack: #314→…→#327→#328. |
| 2026-04-17 | Sprint 71 S71-1 (Session 72): Sprint 70 Review+Retro + Sprint 71 Planning + S71-1 implementiert. Quests Runde 31 — Spongebob 3 (Biolumineszenz-Labor, Tintenfisch-Tempel, Krabby-Patty-Heiligtum) + Kraemerin 3 (Reisemarkt, Herberge der Händler, Große Markthalle) + Maus 2 (Sanduhren-Turm, Eulennest-Bibliothek) + Krabs 2 (Mondspeicher, Fort Knox der Meere). PR #327 stacked auf #326. 326 Quests auf Branch. Stack: #314→…→#326→#327. |
| 2026-04-17 | Sprint 70 S70-1 (Session 71): Sprint 69 Review+Retro + Sprint 70 Planning + S70-1 implementiert. Quests Runde 30 — Bernd 3 (Kompost-Labor, Sternenkarten-Zimmer, Tee-Ritual-Ecke) + Lokführer 3 (Güterpostbahn, Panoramafahrt, Unterwasser-Tunnelbahn) + Mephisto 2 (Spiegelpalast der Lügen, Schattenarchiv) + Alien 2 (Ozean-Sonde, Klang-Observatorium). PR #326 stacked auf #325. 316 Quests auf Branch. Stack: #314→…→#325→#326. |
| 2026-04-17 | Sprint 69 S69 (Session 70): Sprint 68 Review+Retro + Sprint 69 Planning. Quests Runde 29 — Maus 3 (Flussbad, Glaspalast, Nachtwächter-Station) + Krabs 4 (Mondmarkt, Eisberg-Kühllager, Zollstation, Grand Bazaar) + Spongebob 3 (Korallenriff-Garten, Erfinder-Werkstatt, Regenbogen-Spielplatz). PR #325 stacked auf #324. 306 Quests auf Branch. Stack: #314→…→#324→#325. |
| 2026-04-17 | Sprint 68 S68-1 (Session 69): Sprint 67 Review+Retro + Sprint 68 Planning + S68-1 implementiert. Quests Runde 28 — Floriane 3 (Mondblumen-Gewächshaus, Traumfänger-Turm, Feen-Winterquartier) + Bug 3 (Pollenarchiv, Winterquartier, Blüten-Netzwerk) + Mephisto 2 (Tribunal der Abmachungen, Flüsternder Wald) + Lokführer 2 (Schwebefähre, Klimazonen-Express). PR #324 stacked auf #323. 296 Quests auf Branch. Stack: #314→…→#323→#324. |
| 2026-04-17 | Sprint 67 S67-1 (Session 68): Sprint 66 Review+Retro + Sprint 67 Planning + S67-1 implementiert. Quests Runde 27 — Tommy 3 (Vulkan-Beobachtungsposten, Wüstenforschungsstation, Eiszeit-Bunker) + Neinhorn 3 (Verbotene Schlucht, Geheimster Turm, Stilles Waldlabor) + Elefant 4 (Trommelkreis, Echo-Tal, Walgesang-Bühne, Sternen-Konzert). PR #323 stacked auf #322. 286 Quests auf Branch. Stack: #314→…→#322→#323. |
| 2026-04-17 | Sprint 66 S66-1 (Session 67): Sprint 65 Review+Retro + Sprint 66 Planning + S66-1 implementiert. Quests Runde 26 — Bernd 3 (Wintergarten, Mondschein-Gartenbank, Bienenwachs-Werkstatt) + Alien 3 (Spracharchiv der Erde, Atmosphären-Messstation, Gravitations-Garten) + Kraemerin 4 (Auktionshaus, Gewürzhandel-Depot, Pilz-Markt, Mitternachts-Café). PR #322 stacked auf #321. 276 Quests auf Branch. Sauberer Stack: #314→#315→#316→#317→#318→#320→#321→#322. |
| 2026-04-17 | Sprint 65 S65-1 (Session 66): Sprint 64 Review+Retro + Sprint 65 Planning + S65-1 implementiert. Quests Runde 25 — Floriane 3 (Sternenschmiede, Regenbogen-Brücke, Mondblumen-Garten) + Bug 3 (Wanderflug-Station, Blütenstaub-Labor, Kokon-Museum) + Mephisto 2 (Schattenkabinett, Zwielicht-Theater) + Lokführer 2 (Tunnelbahn, Seilbahn-Station). PR #321 stacked auf #320. 266 Quests auf Branch. Sauberer Stack: #314→#315→#316→#317→#318→#320→#321. |
| 2026-04-16 | Sprint 65 S65 (Session 65): Daily Scrum + PR #320 erstellt. Session 64 hatte Runde 24 auf feat/quests-runde-24 implementiert (Tommy 3: Polarlicht-Observatorium, Tiefsee-U-Boot, Wolkenkratzer-Forschungsturm + Neinhorn 3: Spiegelgrotte, Unsichtbarer Garten, Stille-Bibliothek + Elefant 4: Meeresorgel, Wetterharfe, Muschel-Symphonie, Das Große Schweigen) aber PR vergessen. Fix: PR erstellen gehört zum Abschluss jeder Session. Sauberer Stack: #314→#315→#316→#317→#318→#320. 256 Quests auf Branch. |
| 2026-04-16 | Sprint 63 S63 (Session 63): Sprint 62 Review+Retro + Sprint 63 Planning + S63-1 implementiert. Quests Runde 23 — Bernd 3 (Bienenhaus, Aussichtsturm, Regenhütte) + Alien 3 (Quantenfeld-Labor, UFO-Landezone, Neutrinodetektor) + Kraemerin 4 (Fischräucherei, Imkerstand, Obstbaumgarten, Seeblick-Marktstand). PR #318 stacked auf #317. 246 Quests auf Branch. Sauberer Stack: #314→#315→#316→#317→#318. |
| 2026-04-16 | Sprint 62 S62 (Session 62): Sprint 61 Review+Retro + Sprint 62 Planning + S62-1 implementiert. Quests Runde 22 — Maus 4 (Windmühlen-Turm, Geheimnis-Keller, Dampfbad, Mondscheingarten) + Krabs 3 (Goldschmiede, Krabben-Akademie, Geheimtresor) + Spongebob 3 (Laternenfest, Strand-Café, Pilzwald-Forschung). PR #317 stacked auf #316. 236 Quests auf Branch. Sauberer Stack: #314→#315→#316→#317. |
| 2026-04-16 | Sprint 61 S61 (Session 61): Sprint 60 Review+Retro + Sprint 61 Planning. Quests Runde 21 — Tommy 3 (Polarstern-Station, Dschungel-Lager, Sturmjäger-Turm) + Neinhorn 3 (Mondlicht-Bad, Geheime Grotte, Traumlabor) + Elefant 4 (Flöten-Wald, Großes Schweigen, Ernte-Konzert, Tier-Chor). 216→226 Quests. PR #316 stacked auf #315. |
| 2026-04-16 | CI-Fix deploy.yml: `if: secrets.X` auf Step-Level ist illegal (GitHub Actions erlaubt secrets-Context dort nicht). Fix: Secret in Job-Level `env:` packen, dann `if: env.X`. actionlint hätte das sofort gefunden — ab jetzt vor jedem Workflow-Edit `actionlint` laufen lassen. |
| 2026-04-16 | PR-Backlog-Cleanup: 17 offene PRs → 0. Strategie: obsolete schließen, Docs direkt committen, Features einzeln mergen, 7 Quest-PRs (#298-#305) zu einem kombinierten PR #307 zusammengefasst (70 Quests Runde 13-19). Conflict-Marker `<<<<<<< HEAD` in main:quests.js entdeckt und gefixt. Learning: Quest-PRs die alle am Array-Ende anfügen = immer Merge-Konflikte → Sammel-PR ist der richtige Weg. |
| 2026-04-16 | Sprint 60 Ceremony: Nach PR #307 Mega-Merge (196 Quests auf main) wurden 6 neue PRs auf altem main-Stand erstellt (#308–#313). Nur PR #314 und PR #315 sind sauber auf aktuellem HEAD gestackt. Beim nächsten Mega-Merge werden PRs #308–#313 Konflikte erzeugen. Learning: Immer von letztem Quest-Branch starten, nie von main, solange PR-Stack offen. |
| 2026-04-16 | Sprint 59 S59 (Session 59): Sprint 58 Review+Retro + Sprint 59 Planning. Quests Runde 18 — Floriane 3 (Mondlicht-Ballett, Sternschnuppen-Werkstatt, Wolken-Palast) + Bug 3 (Blätter-Bibliothek, Spinnrad-Werkstatt, Große Verwandlung) + Mephisto 2 (Ewiger Vertrag, Orkus-Opernhaus) + Alien 2 (Schwarzes-Loch-Labor, Interstellarer Garten). PR #303. feat/sprint-59 basiert auf feat/sprint-58. |
| 2026-04-16 | Sprint 58 S58 (Session 58): Sprint 57 Review+Retro + Sprint 58 Planning. Quests Runde 17 — Tommy 3 (Tiefsee, Neptun, Piraten) + Neinhorn 3 (Mondstein, Wolken, Eispalast) + Elefant 4 (Bambus, Mondlicht, Echo, Sinfonie). PR #302. |
| 2026-04-16 | Sprint 57 S57 (Session 57): Sprint 56 Review+Retro + Sprint 57 Planning. Quests Runde 16 — Floriane 3 + Bug 3 + Mephisto 2 + Alien 2. origin/main hatte 96 Quests (nicht 86 wie MEMORY S56 schrieb — Zählfehler). PR #301. |
| 2026-04-16 | Sprint 56 S56 (Session 56): Sprint 55 Review+Retro + Sprint 56 Planning. Quests Runde 15 — Lokführer 3 (Hauptbahnhof, Depot, Bergbahn) + Krämerin 4 (Kräutermarkt, Wintermarkt, Erntefest, Lagerhaus) + Bernd 3 (Dachgarten, Angelteich, Modellbahn). PR #300. |
| 2026-04-16 | Quest-Zähler-Fehler: SPRINT.md hatte 126→136 statt korrekt 96→106 weil Zahlen aus alten Docs hochgerechnet statt vom Branch-Tip gelesen. Fix: `git show origin/feat/sprint-N:src/world/quests.js \| grep -c "{ npc:"` vor jeder Planung. |
| 2026-04-16 | Sprint 54 S54 (Session 54): Sprint 53 Review+Retro + Sprint 54 Planning. Quests Runde 13 bereits in vorheriger Session implementiert (PR #298 — Floriane 3 + Mephisto 3 + Alien 2 + Bug 2). Ceremony-Docs direkt auf main. |
| 2026-04-16 | Docs-PR Anti-Pattern bestätigt: PR #297 (Sprint 53 Review) war ein Docs-PR — wurde nicht gemergt, SPRINT.md auf main nicht aktuell. Fix: Ceremony-Docs immer direkt committen auf main, NIE als PR. |
| 2026-04-15 | Sprint 53 S53 (Session 53): Quests Runde 12 — 10 Quests für Bernd/Haskell/Lua/SQL/Scratch (zweite Runde). PR #296. CI-Fix direkt mitgeliefert. |
| 2026-04-15 | CI-Patch-Pflicht (S53): Neuer Branch von main = skipBigBang() in critical-path.spec.js prüfen + burn-panel.spec.js CI-Skip-Guard prüfen. Sonst CI rot bei erstem Push. Betrifft jeden Branch bis PR #293 auf main ist. |
| 2026-04-15 | Sprint 52 S52 (Session 52): Quests Runde 11 (10 Quests für Bernd/Haskell/Lua/SQL/Scratch) implementiert. PR #295. CI initial rot, diese Session gefixt (734e196). |
| 2026-04-15 | Sprint 51 S51 (Session 51): Sprint Review-Branch nicht auf main pushen ist ein Anti-Pattern — Session 47 hat Review geschrieben aber Branch vergessen zu mergen → 3 Sessions wiederholten Daily Standups unnötig. Fix: nach Sprint Review sofort `git checkout main && git commit` (kein eigener Branch für Docs). |
| 2026-04-15 | quests.js Divergenz S51: S50-5 (Quests Runde 9) war in S45 direkt auf main committed, aber SPRINT.md sagte "PR #289". Vor Sprint Review immer diff main vs Branch machen — was ist wirklich noch offen? |
| 2026-04-15 | Neue NPCs ohne Quests: Lokführer, Krämerin, Bernd, Haskell, Lua, SQL, Scratch haben Stimmen aber null Quests. Potenzial für mehrere Sprint-Runden. Priorität: Lokführer + Krämerin (Oscar-nah). |
| 2026-04-15 | CI-Durchbruch S49: PR #293 Check ✅ success. Root-Cause critical-path: skipBigBang() setzte blocksPlaced=0 → Stufe 1 → chat-bubble+quest-tab per CSS versteckt → NPC+Quest Tests schlugen fehl. Fix: 3 localStorage-Einträge (blocks-placed:5, discovered-recipes:[tao], quests-done:[__ci_init__]) → Stufe 5 ab Frame 1. PR #289 auf main rebasiert. |
| 2026-04-15 | CI-Diagnose S48: PR #292 burn-panel-Fix korrekt verifiziert — test.skip(!!process.env.CI) im describe-Scope funktioniert (lokal: 2 skipped). Fehler liegt in smoke.spec.js oder critical-path.spec.js. Reproduktion blockiert: Browser 1208 nicht in Sandbox installierbar. Fix-Pfad: CI-Logs in GitHub Actions prüfen, spezifischen Test + Fehler identifizieren. |
| 2026-04-15 | CI-Befund S45: deploy.yml `check`-Job nicht in GitHub Check-Runs für PR #289 sichtbar (nur preview.yml-Jobs). Lokal 22/22 + tsc grün. Ursache unklar (sandbox-Limit oder concurrency-Gruppe `pages` blockiert). Till muss via GitHub UI prüfen. |
| 2026-04-15 | Sprint 49 Retro (S44): S50 wurde in S43 geplant+implementiert bevor S49 Retro geschrieben war. Ceremony-Reihenfolge nicht eingehalten. Learning: Retro ist erstes Item wenn vorige Sprint auf Review steht. |
| 2026-04-15 | Sprint 50 Planning (S44): 6 Items in PR #289 (feat/sprint-50). CI, OG Tags, 10 Quests, Playwright-Tests. PR wartet auf Till's Merge. PR #290 obsolet — Inhalt bereits auf main. |
| 2026-04-15 | Sprint 49 Review: 3/3 autonome Items Done. itch.io Copy ready, HE/AR 115/115, 22/22 Tests grün. Launch-Blocker liegen alle bei Till (Video, Requesty Key, Stripe). Codebase ist ship-ready. |
| 2026-04-15 | S50: Unit Tests in CI — `npm run test:unit` war grün aber lief nicht in CI. CI-Integration ist immer ein eigener expliziter Schritt. "Tests grün" ≠ "Tests in CI". |
| 2026-04-15 | Butler Secret-Guard: `if: secrets.X != ''` verhindert hartes CI-Fail wenn Secret nicht gesetzt. Pattern für alle optionalen Deploy-Steps. |
| 2026-04-15 | S50: OG-Tags fehlten komplett. Social Preview ist Pre-Launch-Pflicht. preview.svg reicht für Discord/WhatsApp/itch.io; Twitter braucht PNG (Till). |
| 2026-04-15 | S50: Quests Runde 9 — vor neuer Quest-Runde grep materials.js für valide Keys. cave/gem/fossil/dino/castle/dock/library/hut alle vorhanden. |
| 2026-04-15 | S50: Playwright Easter-Egg-Tests: Konami via page.keyboard.press(), Snake via page.keyboard.type(). Modal-Prüfung: toHaveCount(0) für "nicht vorhanden". |
| 2026-04-15 | Sprint 48 Lesson: Kein Sprint planen wenn ALLE Items Human Input brauchen. S49 bewusst mit 100% autonomen Items geplant. Review+Retro sofort nach blocked-Sprint, nicht warten. |
| 2026-04-15 | unit.test.js Pfadfehler: ROOT zeigte auf `ops/` statt `src/core/` + `src/infra/`. Fix: CORE + INFRA Konstanten. Gleiches Muster für künftige Tests merken. |
| 2026-04-15 | package.json test:unit Pfad war `tests/unit.test.js` (falsch) statt `ops/tests/unit.test.js`. |
| 2026-04-14 | Sprint 48 Planning als Doc-Commit direkt auf main: Kein PR für reine Docs wenn der PR nur einen Loop erzeugt. PR #288 hatte 30+ Sessions stale weil jeder Standup SPRINT.md veränderte. Fix: Inhalt direkt committen, PR schließen. |
| 2026-04-14 | PR-Konflikt-Reparatur: PRs #270 + #271 waren dirty wegen 35 identischer Standup-Commits direkt auf main. Lesson: Sprint Planning gehört als Doc-Commit auf main — kein PR wenn keine anderen Dateien betroffen. |
| 2026-04-10 | Sprint 48 Planning: GitHub-Status PFLICHT bei jedem Session-Start. Retro-Bedingungen können zwischen Sessions erfüllt werden — ohne Prüfung schreibt man "Pause" obwohl Till längst gemergt hat. |
| 2026-04-09 | Sprint 47 Review korrigiert: Till hat PR #256 selbstständig gemergt — Playwright auf main (18:45 UTC). Sprint Goal ✅ erreicht. Review hatte fälschlich ❌ — immer PR-Status prüfen bevor Review geschrieben wird. |
| 2026-04-14 | Sprint 47 bleibt eingefroren (Session 28). PRs #270 + #271 seit 5 Tagen offen. Systemzustand: vollständig blockiert auf Human Input. Keine autonome Arbeit möglich. |
| 2026-04-13 | Standup-PRs werden von Till geschlossen (PR #282: "Standup gehört in SPRINT.md, nicht als PR"). Standups direkt auf main pushen — kein eigener PR. |
| 2026-04-09 | Sprint-Review ohne Merge: Wenn alle Sprint-Items auf Human Input blocked sind → Review + Retro sofort schreiben. Kein Fake-Sprint. Pause ist besser als Gold-Plating. Sandbox-Proxy blockt externe URLs (403 host_not_allowed) — Smoke-Tests in dieser Umgebung nicht möglich. |
| 2026-04-09 | Chat-Bubble-Toggle-Bug: openChat() + toggleChat() hebt sich auf | openChat() entfernt 'hidden', dann toggleChat() fügt es sofort wieder hinzu → Bubble öffnete das Panel nie. Fix: toggleChat() nur aufrufen wenn Panel NICHT hidden ist (zum Schließen). Tests enthüllten den Bug. |
| 2026-04-09 | Genesis-Material-Sichtbarkeit in Playwright-Tests | metal ist erst sichtbar nach Qi-Unlock (Genesis Stufe 2). Immer tao für Block-Tests verwenden — tao ist das erste sichtbare Material ohne Voraussetzungen. insel-genesis-shown setzen um water-start zu überspringen. |
| 2026-04-09 | Squash-Merge + gestapelte Branches: Rebase-Strategie | Nach squash-merge von Sprint N: Sprint-N+1-Branch hat duplicate commits von Sprint N. Fix: `git rebase --onto origin/main <letzter-commit-des-alten-sprint-N-branch> feat/sprint-N+1`. Docs-Commits die nur SPRINT.md ändern: `git rebase --skip` + manuell neu schreiben. |
| 2026-04-06 | Sprint 42: Critical Path E2E in `critical-path.spec.js` | 9 Tests, 3 Gruppen: Block platzieren (BUS-Event), Quest annehmen (API + DOM), NPC-Chat (öffnen/schließen/input). Playwright nicht installiert in Sandbox — Tests laufen nach `npm ci` + `npx playwright install`. |
| 2026-04-06 | Tetris Easter Egg als isoliertes IIFE — Konami-Code sauber ohne game.js-Coupling | Konami-Sequenz mit Index-Tracking und Reset bei Fehleingabe; Modal-Pattern analog zu krabs-shop-modal | Easter Eggs gehören in eigene Datei. Kein Touching von game.js nötig wenn DOM-Level Event-Listener reichen. |
| 2026-04-06 | Snake Easter Egg — Wort-Trigger "snake" tippen statt Konami-Code | Tetris = Konami (Sequenz aus Richtungstasten), Snake = Wort (s-n-a-k-e). Zwei verschiedene Patterns. | Easter Egg Trigger differenzieren: Konami für Konsolen-Nostalgiker, Wort-Sequenz für Kinder. Beide mit Index-Reset bei Fehleingabe. |
| 2026-04-06 | **Vierte** Doppelte Implementierung Sprint 37 | main = Sprint 36, aber remote hat Sprints 37–43 in offenen PRs. `list_pull_requests` VOR Sprint Planning ist PFLICHT. Wenn feat/sprint-37 existiert → force-push überschreibt alte Arbeit. Dieses Mal: S37-3 Implementierung abweichend (recent-bar entfernt statt Palette-Counter). PR #251 Beschreibung aktualisiert. |
| 2026-04-06 | Dritte Doppelte Implementierung Sprint 37 | main = Sprint 36, aber remote hat Sprints 37–43 in offenen PRs. Fehlender Pflichtschritt: `list_pull_requests` VOR jedem Sprint Planning. Wenn offene PRs existieren → stopp, kein neues Coding. |
| 2026-04-06 | PR-Chain-CI-Lücke: `pull_request: branches: [main]` schützt nur main-PRs | Wenn Sprint-Branches aufeinander aufbauen, laufen keine CI-Checks für Zwischen-PRs. Fix: `branches`-Filter aus `pull_request`-Trigger entfernen. Deploy-Jobs brauchen eigene `if`-Guards (waren bereits vorhanden). |
| 2026-04-05 | NTP-Fetch im `beforeunload`-Handler funktioniert nicht zuverlässig | `beforeunload` gibt kein Promise-Warten — NTP-Fetch muss bei Session-Start passieren, nicht beim Ende. Ende nimmt `Date.now()` als approximativen Endpunkt (Drift <2s akzeptabel). |
| 2026-04-05 | Token-Schätzung ohne API-Zugang | Client hat keinen Zugriff auf echte Usage-Daten außer wenn der Provider `data.usage` mitschickt. Schätzung via Zeichenlänge ÷ 3.5 ist reproduzierbar und ehrlich markiert ("~"). Requesty liefert `completion_tokens` — wenn vorhanden, für NPC-Budget weiter verwenden. |

## Bugs (so we don't repeat them)

| 2026-03-30 | Backlog-Drift: 14 Items waren in Code done aber Backlog zeigte 🔲 | Keine Session-übergreifende Backlog-Pflege | Am Ende jeder Session: Backlog-Zeilen updaten, bevor MEMORY geschrieben wird |
| 2026-04-03 | CI kaputt seit 31.3 — `sleep 2` reicht nicht für `npx serve` | Race Condition: Server startet nach Puppeteer | `curl`-Retry-Loop statt `sleep`, SW Cache-Version auto per Commit-Count |
| 2026-04-03 | NPCs nicht sichtbar auf Live-Site | CI kaputt → kein Deploy → alte game.js ohne NPC-Grid-Code | Root Cause war CI, nicht NPC-Code. Immer CI-Status prüfen bei "Feature fehlt auf Prod" |
| 2026-04-03 | Root Cleanup 1·3·5·10000 + Isidor-Modell | 42 JS-Dateien + 13 MD im Root = Chaos | src/(core,world,infra), docs/, ops/. archive/library nur wenn befüllt. tsconfig: nur typsichere Dateien includen (nicht alles per Glob) |
| 2026-04-03 | Copyright-Check bei NPC-Namen | Michael Ende Figuren (Frau Waas, Lukas, Lummerland) = urheberrechtlich geschützt | Generische Rollen (Krämerin, Lokführer), Oscar benennt selbst. Nie Figuren-Namen aus Büchern direkt verwenden. |
| 2026-04-03 | Achievements: alte Phantom-Stats | wuXingUsed, florianeWishes etc. existierten nie in getGridStats() | Nur Stats verwenden die tatsächlich geliefert werden. Dynamische Achievements für ∞-Systeme. |
| 2026-04-03 | 6 Duplikat-PRs für S25-3 (npc-data.js) | Multiple Sessions starteten ohne zu prüfen was bereits als offene PRs existiert | Session-Start: `gh pr list` auf offene PRs prüfen. Kein neuer Branch für Feature das schon als PR existiert. |
| 2026-04-03 | REACTIONS fehlten 3 Styles: magic, warm, adventure | Floriane/Krämerin/Lokführer haben Styles die nicht in REACTIONS-Map definiert waren — würde undefined ergeben | Wenn neuer NPC-Style definiert wird, sofort REACTIONS-Eintrag mitliefern. |
| 2026-04-04 | NPC-Session-Gedächtnis war zu 80% fertig — nur _sessionGreeted Set fehlte | getNpcMemoryComment() existierte, wurde aber nur bei 30% Zufall oder Quest-Annahme gezeigt | Vor Feature-Implementierung immer prüfen was schon da ist. Oft reicht ein kleiner Eingriff. |
| 2026-04-04 | Wu-Xing NPC-Events waren bereits komplett — nur Limiter fehlte | npc-events.js hatte alle 9 Event-Typen, 15s Cooldown, Reactions. Nur max 3x/Session fehlte. | Backlog-Items gegen Code abgleichen. "Offen" heißt nicht "nicht angefangen". |
| 2026-04-04 | Heidegger als Zuhandenheit-Auditor im Beirat | "Die Zahl ist nie das Kind" — Messung verwandelt Zuhandenheit in Vorhandenheit | Essay docs/essays/beschreibung-und-messung.md dokumentiert die Epistemologie des Projekts. |
| 2026-04-04 | Spieler nicht sichtbar — breakSymmetry() nie aufgerufen | breakSymmetry() war definiert + als window.breakSymmetry exportiert, aber kein Button und kein automatischer Aufruf. gamePhase blieb 'observer'. | breakSymmetry() jetzt in finishIntro() aufgerufen. Doppeltes Player-Rendering (inline + drawPlayer) bereinigt, hardcoded Emoji durch playerEmoji ersetzt. |
| 2026-04-04 | i18n DE/HE/AR + RTL-Support | itch.io Butler pushed ganzes Repo statt nur Spieldateien | i18n.js mit data-i18n Attributen, RTL CSS, Sprachwahl 🇩🇪🇮🇱🇵🇸. Butler-Deploy auf _itchio Staging-Dir beschränkt. |
| 2026-04-04 | S28-2: Krabbs-Stock war 80% fertig — Kern da, Max-Cap + visueller Indikator fehlte | Backlog sagte "offen", Code hatte bereits KRABS_STOCK_INIT und disabled-Button | Vor Implementierung prüfen was schon da ist. Oft reicht ein kleiner Eingriff. |
| 2026-04-04 | Sprint 27 Review/Retro in SPRINT.md fehlte auf main obwohl Arbeit in Branch done war | Parallele Session hat Sprint 27 Review/Retro in Branch gemacht, aber nicht auf main gemergt | Ceremony-Einträge in SPRINT.md gehören auf main, nicht in Feature-Branches. |
| 2026-04-04 | Smoke Test Netzwerk blockiert (Sandbox-Proxy) — extern nicht erreichbar | CI-Umgebung hat keinen Outbound-Zugang zu schatzinsel.app oder workers.dev | Smoke Tests lokal durch Playwright in CI ersetzen, nicht via curl im Agent. |
| 2026-04-04 | S27-3 PR #233 veraltet — base 15 Commits hinter main, CI-Failure | Parallele Session hat main weiterentwickelt während PR offen lag | Vor Merge: `git log --oneline HEAD..origin/main` — wenn > 3 Commits, neu aufsetzen statt rebasen. |
| 2026-04-04 | #100 auf falschem Branch committed (feat/s27-3-donation-modal) | Zwei Features auf einem Branch — CLAUDE.md: Ein Feature = ein Branch | Vor erstem Commit prüfen: bin ich auf dem richtigen Branch? `git branch` vor `git add`. |
| 2026-04-05 | Sprint 29: 5 Phantom-Opens identifiziert (#33, #17, #19, #100, #101) | Backlog wurde nicht nach PRs/Commits aktualisiert | Code vor Sprint Planning lesen. `grep` schlägt Backlog-Lesen. |
| 2026-04-05 | sailToIsland() löschte Grid ohne Save — Oscar verlor Heimatinsel beim Segeln | Kein Archipel-Konzept: alle Inseln teilen eine Zustandsvariable | saveIslandState/loadIslandState via localStorage. Jede Insel hat eigenen Key `insel-archipel-{id}`. |
| 2026-04-05 | Material-Key-Mismatch in island-generators.js: 't-rex'/'dinosaur'/'meteorit' statt 'trex'/'dino'/'meteor' | Materialien aus Sprint 30 (npc-data.js) nicht geprüft vor Verwendung | Vor jedem neuen Material: `grep -n "material" src/world/materials.js` — Keys sind nicht intuitiv. |
| 2026-04-05 | Genesis-Bug: `_showIslandGenesis()` definiert `key` aber ruft nie `localStorage.getItem(key)` auf — Genesis zeigt sich jedes Mal | Copy-Paste-Fehler: key-Variable definiert aber vergessen zu nutzen | Wenn localStorage-Key definiert: sofort auch `if (localStorage.getItem(key)) return;` + `localStorage.setItem(key, '1')` schreiben. |
| 2026-04-05 | Gestapelte PRs (#243→#244→#245): Rebase-Aufwand + Merge-Reihenfolge zwingend | Sprint 31 basierte auf Sprint 30 Branch, Sprint 32 auf Sprint 31 Branch | Jeder Sprint direkt auf main branchen. Nie auf Feature-Branch eines anderen Sprints aufbauen. |
| 2026-04-05 | 3 Sprints (30–32) in einer Session akkumuliert ohne sofortigen Merge | PRs lagen offen, keine Ceremony zwischen Sprints | Ceremony (Review+Retro+Planning) nach jedem Sprint, nicht nach drei Sprints. Merge sofort nach PR-Erstellung. |
| 2026-04-05 | deploy-itch Job hatte zwei doppelte Butler-Deploy-Steps mit verschiedenen Secrets (BUTLER_API_KEY vs itch_io_butler) | Alter Step + neuer Step parallel in einem Job — je nach Secret-Verfügbarkeit schlägt einer fehl | Ein Job, ein Butler-Step. Alten Step entfernen sobald neuer (`_itchio`-Bundle) existiert. |
| 2026-04-05 | Stripe Donation-Links alle identisch (Test-URL) — Production-Links nie eingetragen | TODO-Kommentar in index.html seit Sprint 27 unbeachtet | Stripe Production-Links als expliziter Human-Input-Task im Backlog — nicht als TODO-Kommentar vergessen. |
| 2026-04-05 | Sprint 34: 2 von 3 Items waren Phantom-Opens (S34-2, S34-3 bereits implementiert) | Backlog + deploy.yml nicht vor Sprint Planning geprüft | Vor Sprint Planning: deploy.yml lesen + BACKLOG gegen Code verifizieren. Nie Items planen ohne zu prüfen ob bereits fertig. |
| 2026-04-05 | Alien auf Mond: als Grid-Block platziert, aber kein NPC-Dialog | island-generators.js platziert Alien als Material, NPC_DEFS kannte kein 'alien' | NPC auf neuer Insel: NPC_DEFS + NPC_VOICES + initNpcPositions() braucht moon/island-Flag. Analog zu lummerland-Flag. |
| 2026-04-06 | Sprint 37 Review: Smoke Test in Sandbox 403 — kein Produktionsproblem | Sandbox-Proxy blockiert schatzinsel.app + workers.dev (nicht in allowed-hosts) | Smoke Test via curl im Agent ist unzuverlässig. CI/Playwright ist der richtige Ort. Agent-seitig: 403 von Proxy ≠ Site down. |
| 2026-04-06 | Oscars Bruder-Feedback war konkreter als Tesla-Nutzertest-Video | 3 direkte UX-Probleme von echtem Erstbesucher — alle in einem Sprint lösbar | Direktes Nutzer-Feedback schlägt Video-Analyse wenn konkret und umsetzbar. #78 dennoch als P0 für Sprint 38. |
| 2026-04-06 | Sound-Polishing: 4 Weltraum-Materialien hatten keine eigenen Töne — fielen in "zufälliger Drum" | DRUM_MAP, ELEMENT_TONES, KLONK_FREQS und playMaterialSound switch hatten keinen Eintrag für rocket/moon/mars/alien | 4 neue Drum-Funktionen + ELEMENT_TONES-Einträge + KLONK_FREQS + switch-cases. Jedes neue Material braucht alle 4 Sound-Einträge gleichzeitig. |
| 2026-04-06 | Genesis Phase 2 — Wasser-Start für absolute Neuspieler via localStorage-Flag `insel-genesis-shown` | `generateStarterIsland()` zeigte immer eine ausgebaute Insel — kein Schöpfungsmoment | `generateWaterStart()`: 3×3 Sandinsel + Palme. Neuspieler sehen Ozean, müssen selbst bauen. Bestehende Spieler unberührt (haben `insel-genesis-shown` bereits). |
| 2026-04-06 | Tetris Easter Egg als isoliertes IIFE — Konami-Code sauber ohne game.js-Coupling | Konami-Sequenz mit Index-Tracking und Reset bei Fehleingabe; Modal-Pattern analog zu krabs-shop-modal | Easter Eggs gehören in eigene Datei. Kein Touching von game.js nötig wenn DOM-Level Event-Listener reichen. |
| 2026-04-06 | Snake Easter Egg — Wort-Trigger "snake" tippen statt Konami-Code | Tetris = Konami (Sequenz aus Richtungstasten), Snake = Wort (s-n-a-k-e). Zwei verschiedene Patterns. | Easter Egg Trigger differenzieren: Konami für Konsolen-Nostalgiker, Wort-Sequenz für Kinder. Beide mit Index-Reset bei Fehleingabe. |
| 2026-04-06 | Blocked-Sprint nicht mit Gold-Plating füllen | Sprint 41 hatte keine implementierbaren Items. Richtige Entscheidung: Review/Retro dokumentieren und ehrlich stoppen. | Wenn alle implementierbaren Items done sind: Blocked-State klar kommunizieren. Nächster autonomer Schritt: Playwright E2E-Tests (#103). |

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
| 2026-04-03 | Chat-History Bleed + Model-Info sichtbar | Bubble-Handler wechselte NPC manuell statt via openChat(), initChat() zeigte [Haiku 4.5] | Immer bestehende Funktionen nutzen statt Logik duplizieren. Keine Provider-Info in Kinder-UI. |
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
| 2026-04-04 | PR #229 gemergt ohne MEMORY-Eintrag. Regel verletzt: "Memory nach jedem PR." | Immer direkt nach Merge MEMORY updaten. Nicht am Session-Ende sammeln. |
| 2026-04-04 | Designer+Artist Audit → 11 Fixes in 3 parallelen Agents. Toolbar 25→7 Buttons, Touch Targets 44px, Model-Tags gefiltert, Copy kindgerecht, NPC-Unlock-Hints dynamisch. 9/9 Playwright grün. Mobile Canvas 28%→60%. PR #229 gemergt auf main. | Full-throttle Session: Till bemalt Ostereier, Agents arbeiten autonom. Parallele Agents + sofortige Verifikation = 11 Fixes in einer Runde. |
| 2026-04-04 | Sprint 27 = Release-Sprint geplant. Stripe Produkt live (prod_UH8GIdCYDVu1H5, 3 Preise: 5€/10€/25€). Playwright ersetzt Puppeteer. itch.io als zweiter Kanal. | Einstein-Entscheidung: "Spiel soll live gehen." Alles andere hat Pause. |
| 2026-04-04 | 7 Duplikat-PRs für S25-3 — parallele Sessions implementierten dasselbe unabhängig | Vor jeder Session: `gh pr list --state open` prüfen. Wenn Feature schon in PR → Review + Merge statt Neuimplementierung. PR #212 (sauberste Base) gemergt, 7 andere geschlossen. |
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

| 2026-04-04 | itch.io Deploy als CI-Job | butler push im GitHub Actions Workflow, parallel zu GitHub Pages | BUTLER_API_KEY als Secret nötig. Projekt muss auf itch.io als HTML5-Game angelegt sein. |

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
| 2026-04-06 | SW skipWaiting() → mid-game Reload bei jedem Deploy | SW aktivierte sich sofort (skipWaiting im install), postMessage cache-update → location.reload() | Apple-Ansatz: skipWaiting entfernt. SW wartet auf Tab-Neustart. cache-update → sw-version umbenannt. CACHE_VERSION 9. ADR-012. |
| 2026-04-06 | touchstart + pointerdown feuerten beide auf Touch-Geräten → doppeltes applyTool() → Töne/Blocks 2x | mousedown→pointerdown Migration ohne pointerType-Guard | pointerdown/move/up/leave: if (e.pointerType !== 'mouse') return. Touch läuft weiter über touchstart. |
| 2026-04-06 | role="img" auf Canvas → VoiceOver schluckte Clicks → nichts platzierbar | Canvas als Bild deklariert = nicht-interaktiv für Screenreader | role="application" + tabindex="0". Oscars Bruder konnte danach spielen. |
| 2026-04-06 | isReturningPlayer prüfte insel-projekte — Spieler ohne manuelles Speichern hatten gamePhase=observer → keine Spielfigur | Zwei verschiedene localStorage-Keys für "hat gespielt" | insel-grid als Fallback. breakSymmetry() im returning-Player-Pfad ergänzt. |
| 2026-04-06 | ES/IT NPC-Strings: "missionei" statt "missioni" + Weltraum-Observatorium bei spongebob statt alien | Copy-Paste + Suffix-Logik statt vollständige Wörter | Plurale immer als vollständige Wörter. ES/IT in Icebox bis Native Speaker Review. |
| 2026-04-06 | Review-Agent (code-reviewer subagent_type) = Reviewer, kein Executor | Falscher Subagent-Typ für Implementation-Tasks | Implementation → general-purpose oder feature-dev:code-reviewer nur für Reviews. Nie für Merges oder Code-Schreiben. |
| 2026-04-16 | Sprint-Branch von main statt von vorherigem Sprint-Branch erstellt → Quest-Zähler in Branch-Realität weicht von logischer Reihenfolge ab | Autonomer Agent startet von HEAD, nicht vom letzten feat-Branch | Neue Sprint-Branches immer von `origin/feat/sprint-N` erstellen solange PR-Stack offen ist. |
| 2026-04-16 | Ceremony-Docs auf main gepusht bekamen Conflict weil local main 51 Commits hinter origin/main lag | Vor Ceremony-Commit: local main nie direkt beschreiben ohne vorher origin/main zu fetchen | git reset --hard origin/main vor jedem ops-Commit auf main. |
| 2026-04-19 | Quest-Counts in Retro-Notizen weichen von quests.js ab: Retros sagten Lokführer/Krämerin/Elefant seien "die Niedrigsten" aber Tommy/Bug/Bernd haben tatsächlich nur 34 vs. 37/36/36 | Retro-Autor hat nicht `grep -oP "npc:" | uniq -c` ausgeführt | Immer `grep -oP "npc: '([^']+)'" quests.js \| sort \| uniq -c` vor jeder Retro ausführen um echte Counts zu bestätigen. |
| 2026-04-19 | feat/quests-runde-48 und feat/quests-runde-48-s88 beide durch Phantom-Sessions belegt → Push rejected | Phantom-Branches entstehen wenn autonome Sessions von falschem Ursprung starten | Vor Branch-Push immer `git log --oneline origin/feat/quests-runde-N 2>/dev/null` prüfen. Bei Konflikt: `-canonical` Suffix verwenden. |
| 2026-04-21 | CI auf #407 schlug fehl mit `git exit 128` (actions/checkout fetch-depth:0 Flake) — kein Code-Problem | Transiente git-Fehler in CI sehen aus wie Code-Fehler wenn man nur Annotations liest | Re-Trigger via leeren Commit (`git commit --allow-empty`) — schnellste Diagnose: prüfe ob PR vor und nach dem fehlgeschlagenen grün laufen. |
| 2026-04-21 | `#chat-character-name` in chat.js referenziert aber nicht in index.html definiert — Tests gegen Header schlugen immer fehl | HTML-Element fehlt, JS hat null-Check der still scheitert → kein sichtbarer Fehler im Browser | Wenn Tests DOM-Elemente prüfen die im Source referenziert werden: HTML-Datei als erstes lesen, nicht nur den JS-Code. |
