# Architektur-Entscheidungen

Warum es so gebaut ist wie es gebaut ist.

## Stack: Vanilla JS + JSDoc

**Entscheidung:** Kein Framework, kein Build-Tool, kein npm.
`index.html` im Browser oeffnen -- fertig.

**Warum:**
- Zero Overhead. Papa hat 30 Minuten. `npm install` nach 3 Wochen Pause ist keine Option.
- 256 GB Mac Mini. Kein Platz fuer aufgeblaehte node_modules.
- Kinderspiel. Keine Enterprise-Architektur noetig.
- JSDoc + `checkJs` in tsconfig fuer Typsicherheit ohne TypeScript-Build.

## Kein Framework (kein React, kein Vue)

**Entscheidung:** Zero Dependencies.

**Warum:** Ein Kinderspiel braucht kein Virtual DOM. Canvas + Vanilla JS
reicht. Weniger Abstraktion = weniger Fehlerquellen = schnellere Iteration.

## localStorage statt IndexedDB

**Entscheidung:** Spielstand in localStorage.

**Warum:** Einfacher. Synchron. Reicht fuer Single-Player mit einem Grid.
Auto-Save alle 30s + beforeunload. Kein Backend noetig.

## ELIZA als LLM-Fallback

**Entscheidung:** Wenn kein API-Key vorhanden oder offline, antwortet
ELIZA (Pattern-Matching, kein LLM).

**Warum:** Kinder spielen ueberall -- auch ohne Internet. ELIZA braucht
keinen API-Call, keine Kosten, keine Latenz. Funktioniert immer.

## Requesty als LLM-Proxy

**Entscheidung:** LLM-Calls gehen ueber Requesty (vorher Langdock).

**Warum:** Migration von Langdock wegen Kosten. Requesty erlaubt
Modell-Routing pro NPC-Charakter (Hirn-Transplantation). BYOK-Dialog
fuer eigenen API-Key.

## Wu Xing statt westliche Elemente

**Entscheidung:** 5 chinesische Elemente (Holz, Feuer, Erde, Metall, Wasser)
statt Feuer/Wasser/Erde/Luft.

**Warum:** Wu Xing ist ein Kreislauf -- jedes Element erzeugt und
kontrolliert ein anderes. Westliche Elemente sind ein Inventar (4 Dinge
in einer Liste). Kreislauf ist Spielmechanik, Liste ist Spreadsheet.
Philosophie statt Physik. Tao: Everything flows.

## Infinite Craft mit KV-Cache

**Entscheidung:** Crafting-Rezepte werden beim ersten Mal vom LLM
generiert, dann im Cloudflare KV-Cache gespeichert.

**Warum:** Deterministisch nach der ersten Entdeckung. Gleiche Kombination
= gleiches Ergebnis, egal wer craftet. Erster Finder steht am Rezept
(Entdecker-System). Spart API-Calls, spart Geld.

## Automerge wie 2048

**Entscheidung:** Gleiche Materialien nebeneinander verschmelzen automatisch.

**Warum:** Starke Kernkraft als Metapher. Oscar liebt 2048 auf dem
Tesla-Bildschirm. Emergentes Gameplay: Muster entstehen beim Bauen
ohne dass man sie plant.

## Service Worker fuer Offline

**Entscheidung:** sw.js + manifest.json fuer Offline-Spiel.

**Warum:** Kinder spielen im Auto, auf dem Spielplatz, im Wartezimmer.
Kein Internet = trotzdem spielen. ELIZA faengt die Chat-Funktionen auf.

## Keine User-Accounts

**Entscheidung:** Kein Login, kein Account, keine Registrierung.

**Warum:** Privacy first. Kinderspiel. DSGVO/COPPA vermeiden.
Spielername wird lokal gespeichert, nirgends sonst.

## game.js Monolith (bekannte Schuld)

**Status:** game.js ist zu gross. Sound, Quests, Effects, Achievements,
Recipes, Automerge sind bereits ausgelagert (sound.js, quests.js, etc.).
Grid-Logik ist noch drin.

**Plan:** Backlog #11 (Zellteilung game.js). Grid-Rendering und
Game-State als naechstes rausziehen.

## Offene Fragen

- **Requesty Key rotieren** -- alter Key im Git-Verlauf, neuer noetig (#92)
- **Browser-LLM** -- SmolLM2 lokal im Browser als ELIZA-Upgrade? Feynman muss testen (#90)
- **Urknall-Crafting** -- Masse+Energie+Licht als Basis statt Wu Xing? Design-Entscheidung offen (#83)
