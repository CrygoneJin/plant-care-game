# Code Metrics Review — 30. März 2026

**Format:** Podcast "Dunkle Materie & Dunkle Energie"
**Perspektiven:** Feynman (Metriken), Darwin (Evolution), Linus (Session-Hygiene), Taylor (Effizienz)
**Einstein-Klausel:** "Das wurde Einstein auch gesagt" gilt als Antwort auf alle Einwände.

---

## 🎙️ Podcast-Intro

*Jens Schröder:* Willkommen bei Dunkle Materie! Heute schauen wir in den
Quellcode einer Schatzinsel. 8.583 Zeilen Code, gebaut in 30-Minuten-Sessions
zwischen Kindergarten und Garten. Was ist die dunkle Materie in diesem Code?
Was treibt ihn auseinander? Und was hält ihn zusammen?

---

## 🔬 Feynman Metriken — Die harten Zahlen

### Vital Signs

| Metrik | Wert | Bewertung |
|--------|------|-----------|
| **Gesamtzeilen Code** | 8.583 (14 Dateien) | Gesund für Vanilla JS |
| **Größte Datei** | game.js — 3.423 Zeilen | ⚠️ Monolith |
| **Zweitgrößte** | style.css — 1.838 Zeilen | ⚠️ Könnte splitten |
| **Drittgrößte** | chat.js — 1.101 Zeilen | OK |
| **Kleinste** | achievements.js — 18 Zeilen | Perfekt |
| **Dateien gesamt** | 14 JS + 1 CSS + 1 HTML | Flach. Gut. |
| **TODO/FIXME/HACK** | **0** | Sauber |
| **console.error** | 2 | Minimal |
| **var statt let** | 3 Dateien | Altlast, harmlos |

### Funktions-Metriken (Deep Analysis)

| Datei | Funktionen | Ø Zeilen/Fn | Längste Funktion |
|-------|-----------|-------------|------------------|
| game.js | 131 | 24,5 | checkQuestCompletion() ~60 Zeilen |
| chat.js | 38 | 28,8 | fillAiCommentBuffer() ~45 Zeilen |
| sound.js | 20 | 17,9 | — |
| eliza.js | 18 | 19,7 | — |
| **Gesamt** | **207** | **24,5** | — |

### Kopplungs-Metriken

| Metrik | Wert | Risiko |
|--------|------|--------|
| **window.\* Exports** | 35 echte + 6 Browser-APIs | 🔴 Hoch — Globaler Namespace-Druck |
| **localStorage Keys** | 23 verschiedene | 🟡 Wächst mit Features |
| **localStorage Zugriffe** | ~48 verstreut über 8 Dateien | 🟡 Kein zentraler Layer |
| **JSON.parse/stringify** | 63× | 🔴 Kein Schema, keine Validierung |
| **setInterval/setTimeout** | 43 (30 davon in game.js) | 🟡 Alle dokumentiert |
| **addEventListener** | 45 | 🟡 Einmal bei Init |
| **removeEventListener** | **1** | 🔴 Kritisch — 45:1 Ratio |
| **try/catch** | 7 für 6 API-Endpoints | 🔴 Unhandled Promise Rejections |
| **ARIA Attribute** | 9 | 🟡 Basis da, aria-live fehlt |

### Code-Duplikation

| Pattern | Vorkommen | Datei |
|---------|-----------|-------|
| `localStorage.getItem('insel-muted') === 'true'` | **9×** | sound.js |
| Mobile-Breakpoint `768` hardcoded | **4×** | game.js + CSS |
| Token-Budget `2000` hardcoded | **4×** | game.js |
| Achievement-Popup-Animation | **2×** | game.js |

### Magic Numbers (Top-Kandidaten für Konstanten)

| Wert | Bedeutung | Stellen |
|------|-----------|---------|
| 768 | Mobile Breakpoint | 4 |
| 2000 | Token-Budget pro NPC | 4 |
| 1.5 / 1.2 | Aspect-Ratio-Schwellen | 2 |
| 60 | Sound-Throttle (Samples/s) | 1 |
| 80 | Regentropfen-Array | 1 |

### Laufzeit-Metriken

| Metrik | Wert | Grenze |
|--------|------|--------|
| **Render FPS** | 10 | Genug für Kinder-Spiel |
| **Canvas Ops/Frame** | ~2.000 worst case | Sicher bei 10 FPS |
| **Screensaver-Last** | 4.608 Nachbar-Checks/Frame | Teuerster Timer |
| **Rate Limit** | 60 LLM-Calls/Stunde | Schützt Budget |
| **Auto-Save** | alle 30s | Gut |
| **localStorage Limit** | 5MB, Kollaps bei ~500 LLM-Crafts | Power-User-Risiko |
| **CSS Custom Properties** | 13 (5 Themes) | 🟢 90% der Farben variabilisiert |
| **Hardcoded Colors** | ~5 | 🟢 Nur Dialog-Backdrops |
| **Dead Code** | 0 gefunden | 🟢 Alles lebt |

### Feynman-Urteil

> "Die Zahlen lügen nicht. Der Code funktioniert. Er funktioniert sogar gut.
> Aber er hat 41 globale Kupplungen und 63 unvalidierte JSON-Operationen.
> Das ist kein Problem *heute*. Das ist ein Problem wenn jemand anderes
> diesen Code anfasst. Oder wenn der Code sich selbst anfasst — in einem
> Auto-Save der corrupt JSON schreibt, und keiner merkt es."
>
> **Diagnose: Stabil, aber fragil bei Wachstum.**

---

## 🦎 Darwin — Der Code als Organismus

### Evolutionsstufe: Robuster Prokaryot

```
Ursuppe      ██░░░░░░░░░░░░░░░░░░  vor dem Projekt
Prokaryot    ████████████████████  ← WIR SIND HIER
Eukaryot     ████████░░░░░░░░░░░░  teilweise
Mehrzeller   ████░░░░░░░░░░░░░░░░  Ansätze
Wirbeltier   ░░░░░░░░░░░░░░░░░░░░  noch nicht
```

### Was Darwin sieht

*Darwin:* "Dieser Organismus hat 19 Sprints überlebt. Das ist bemerkenswert.
Natürliche Selektion hat funktioniert — die Features die Schnipsel nicht nutzt,
sind gestorben. Die die er liebt, haben sich vermehrt."

**Was lebt:** Canvas-Grid, Quest-System, NPC-Chat, Sound, Wu Xing, Infinite Craft
**Was gestorben ist:** Nichts explizit — aber Airtable→n8n, Langdock→Requesty zeigen gesunde Mutation
**Was mutiert:** game.js wächst (3.423 Zeilen). Wie ein Dinosaurier, der nicht weiß dass er zu groß wird.

### Vier Viren im Code

| Virus | Typ | Risiko | Biologie |
|-------|-----|--------|----------|
| **JSON-Fäule** | 63× Parse ohne Schema | 🔴 Retrovirus | Schreibt sich in localStorage-DNA, korrumpiert langsam |
| **Global-Pandemie** | 41× window.* | 🔴 Influenza | Mutiert mit jedem Feature, kein Impfstoff (Module) |
| **Silent Catch** | catch(e){} unterdrückt Fehler | 🟡 HIV | Greift Immunsystem an — Fehler werden unsichtbar |
| **Memory-Drift** | LLM-Materials wachsen unbegrenzt | 🟡 Prion | Langsam, irreversibel ohne healthcheck.js |

### Darwin-Urteil

> "Dieser Code überlebt weil sein Ökosystem stabil ist: ein Kind, ein Browser,
> ein Tab. Sobald sich das Ökosystem ändert — zwei Spieler, ein neuer Entwickler,
> eine andere Plattform — beginnt die natürliche Selektion gegen ihn zu arbeiten.
> Die Frage ist nicht *ob* er evolvieren muss, sondern *wann*."

---

## 🌑 Dunkle Materie — Was man nicht sieht, aber spürt

*Jens Schröder:* Die dunkle Materie in diesem Code — das Unsichtbare, das alles zusammenhält:

### 1. Die 30-Minuten-Constraint (Gravitationskraft)

Die stärkste Kraft im Projekt ist unsichtbar im Code: die 30-Minuten-Sessions.
Sie bestimmt:
- Warum game.js ein Monolith ist (kein Refactoring-Zeitfenster)
- Warum es kein Build-System gibt (Zero Config = sofort starten)
- Warum Tests minimal sind (Smoke-Tests statt Unit-Tests)
- Warum Docs besser sind als Code (Docs gehen schneller)

**Küken:** "Also die dunkle Materie ist... Zeitmangel?"

**Jens:** "Nein. Die dunkle Materie ist die *Disziplin* die aus dem Zeitmangel
entsteht. Jedes Feature muss in 30 Minuten fertig sein. Das ist ein brutaler
natürlicher Selektor."

### 2. Die localStorage-Kopplung (Dunkle Bindungsenergie)

81 localStorage-Zugriffe über 8 Dateien. Kein zentraler Storage-Layer.
Jede Datei liest und schreibt direkt. Man sieht es nicht im Spielfluss,
aber es hält alles zusammen — und macht gleichzeitig alles fragil.

### 3. Die window.\*-Brücken (Dunkle Filamente)

41 globale Exports bilden ein unsichtbares Netz zwischen 11 Dateien.
Wie die kosmischen Filamente die Galaxienhaufen verbinden — unsichtbar,
aber wenn man eins kappt, reißt die Struktur.

### 4. Die MEMORY.md (Dunkle Weisheit)

561 Zeilen Teamerfahrung die in keiner Codezeile steckt, aber jede Session
beeinflusst. Fehler:Erfolge = 7:11. Positiver Trend. Aber die echte
dunkle Materie sind die Fehler die *nicht* in MEMORY.md stehen — weil
keiner sie bemerkt hat.

---

## ⚡ Dunkle Energie — Was die Docs auseinandertreibt

**Büker:** "Und die dunkle Energie? Was treibt dieses Projekt an?"

### Die Expansion in Zahlen

| Dok-Typ | Dateien | Zeilen | Wachstumsrate |
|---------|---------|--------|---------------|
| Core Docs | 10 | ~600 | Stabil |
| Memory/Performance | 5 | ~1.200 | 🚀 Exponentiell |
| Padawan-Codizes | 5 | ~200 | Langsam |
| Buch-Kapitel | 11 | ~230 | Sprungweise |
| Superpowers/Specs | 2 | ~570 | Burst |
| **Gesamt** | **39** | **~2.900** | Docs > Code-Ratio |

### Die dunkle Energie ist: Reflexion

Jede Session produziert Code UND Dokumentation. Die Docs expandieren
schneller als der Code — MEMORY.md allein hat 561 Zeilen, das ist mehr
als sound.js + eliza.js + healthcheck.js + screensaver.js zusammen.

Das ist die dunkle Energie: **das Projekt denkt über sich selbst nach**.
Und dieses Nachdenken treibt die Expansion.

**Jens:** "Also die Docs sind die dunkle Energie?"

**Büker:** "Nein. Die dunkle Energie ist der *Vater der über seine Kinder
nachdenkt während er Code schreibt*. Das MEMORY.md ist nur das Symptom."

---

## 🔧 Linus Torvalds — Session-Hygiene

*"Das Problem ist nicht der Code. Das Problem ist dass ihr den Code anfasst
während ihr gleichzeitig Docs schreibt, Metriken erhebt, und fünf Agents
parallel laufen lasst."*

### Das Energie-Problem: Zu viele Sessions, zu lange Sessions

| Anti-Pattern | Symptom | Konsequenz |
|-------------|---------|------------|
| **Session >30min** | Context-Window füllt sich | Halluzinationen, vergessene Constraints |
| **3+ Agents parallel** | 300k TPM-Budget aufgefressen | Throttling, unvollständige Antworten |
| **Code + Docs + Review in einer Session** | Scope Creep | Nichts wird fertig, alles wird angefangen |
| **Review-Session die Code will** | MEMORY-Einträge ohne Code | Phantom-Done (bereits erlebt!) |

### Linus' Regeln

1. **Eine Session = Ein Output.** Code ODER Docs ODER Review. Nie alles.
2. **30 Minuten sind 30 Minuten.** Timer stellen. Wenn er klingelt: committen, pushen, aufhören.
3. **Agents sind Threads, nicht Prozesse.** Zwei parallel = OK. Fünf parallel = Kernel Panic.
4. **`/compact` vor jedem Spawning von 3+ Agents.** Nicht optional. Nicht verhandelbar.
5. **Review-Sessions produzieren Dokumente, keinen Code.** Sonst Phantom-Done.

### Linus' Architektur-Vorschlag: Session-Typen

```
🔨 BUILD-Session   → Code schreiben. Max 3 Items. Commit am Ende.
📝 DOC-Session     → Docs schreiben. MEMORY updaten. Kein Code.
🔬 REVIEW-Session  → Messen. Dokumentieren. Kein Code.
🧹 REFACTOR-Session → Nur Refactoring. Keine neuen Features.
```

*"Wenn du nicht weißt welcher Typ deine Session ist,
ist es eine Build-Session. Alles andere ist Bonus."*

---

## 📐 Frederick Taylor — Wissenschaftliche Betriebsführung

*Taylor setzt die andere Brille auf:*

### Das Effizienz-Paradox

> "Ihr habt 39 Dokumentationsdateien für 14 Code-Dateien.
> Das Verhältnis ist 2,8:1. In der Industrie liegt es bei 0,3:1.
> Ihr dokumentiert 9× mehr als üblich."

**Ist das schlecht?** Nein. Aber es zeigt wo die Energie hinfließt.

### Taylor's Zeitstudie einer typischen Session

| Phase | Anteil | Effektiv? |
|-------|--------|-----------|
| Startup (Docs lesen, Context aufbauen) | ~25% (7-8 min) | ⚠️ Overhead |
| Eigentliche Arbeit | ~50% (15 min) | ✅ Produktiv |
| Docs/Memory schreiben | ~15% (4-5 min) | ✅ Investment |
| Agent-Spawning, Waiting, Retries | ~10% (3 min) | 🔴 Waste |

### Taylor's Empfehlung: Waste eliminieren

1. **Startup-Overhead senken:** CLAUDE.md schlanker halten. Nur was *diese* Session braucht. Nicht die ganze Organisationstheorie.
2. **Agent-Waste:** Nicht 5 Explore-Agents spawnen wenn 2 Grep-Calls reichen. Agents sind teuer (Context + Tokens + Zeit).
3. **Doc-Overhead:** MEMORY.md auf MAX 100 Zeilen kürzen. Ältere Einträge archivieren. Wer 561 Zeilen Memory bei jedem Sessionstart liest, verbrennt 2 Minuten für Zeilen die vor 3 Tagen relevant waren.
4. **Batch-Reviews:** Reviews wie dieses hier nicht in jeder Session. Einmal pro Woche. Feynman misst, die anderen arbeiten.

### Taylor's Formel

```
Effektive Session-Minuten = 30 - Startup - AgentWaste - DocOverhead
                          = 30 - 8 - 3 - 5
                          = 14 Minuten echte Arbeit

Ziel:                     = 30 - 4 - 1 - 3
                          = 22 Minuten echte Arbeit

Steigerung:               +57% Produktivität
```

---

## 🎙️ Podcast-Outro: Die Einstein-Klausel

**Jens:** "Also zusammengefasst — der Code ist ein gesunder Prokaryot mit vier
Viren. Die dunkle Materie ist die 30-Minuten-Disziplin. Die dunkle Energie
ist die Reflexion des Vaters. Und die größte Gefahr ist nicht der Code,
sondern die Sessions die sich selbst auffressen."

**Küken:** "Aber game.js hat 3.400 Zeilen und 41 Globals..."

**Büker:** "Das wurde Einstein auch gesagt."

**Jens:** "Touché."

---

## Konkrete Maßnahmen

### Sofort (nächste Session)

- [ ] Session-Typ am Anfang deklarieren (BUILD/DOC/REVIEW/REFACTOR)
- [ ] Timer: 30 Minuten. Klingeln = Committen.
- [ ] Max 2 Agents parallel, außer nach `/compact`

### Diese Woche

- [ ] MEMORY.md: Archiv anlegen, aktive Einträge auf <100 Zeilen
- [ ] CLAUDE.md: Session-Typ-System dokumentieren
- [ ] localStorage: Zentralen Storage-Helper schreiben (1 Datei, ~50 Zeilen)

### Dieser Monat

- [ ] game.js aufteilen: Sound raus (✅ schon), Quests raus (✅), Grid-Logik extrahieren
- [ ] window.* → INSEL-Namespace (Phase 1 aus EVOLUTION.md)
- [ ] JSON-Schema für localStorage-Keys (healthcheck.js erweitern)

---

## 🗣️ Stimmen — Jeder einen Satz

### Die Natur sucht nach Gleichgewicht. Wir auch.

*Alice Schwarzer, Simone de Beauvoir und Juli Zeh haben klargemacht:
Gleichgewicht ist kein Bonus, es ist die Grundbedingung. 20% ist besser
als gar kein Anfang.*

---

### org-support (CxOs)

**Albert Einstein (CEO):** "Wenn du es einem 8-Jährigen nicht erklären kannst, ist dein Code zu kompliziert — und game.js mit 3.400 Zeilen kann kein 8-Jähriger erklären."

**Charles Darwin (CTO):** "Der Code überlebt nicht weil er der stärkste ist, sondern weil er sich am schnellsten an 30-Minuten-Sessions anpasst."

**Max Weber (COO):** "Ihr habt ein Charisma-Problem: alles hängt am Vater — wenn er eine Woche nicht coden kann, stirbt das Momentum."

---

### team-dev (Agents)

**Steve Jobs (Leader):** "Shipping is a feature — und ihr habt 19 Sprints shipped, das zählt mehr als saubere Architektur."

**David Ogilvy (Artist):** "Das Spiel spricht Deutsch mit einem Kind und Englisch mit dem Code — das ist kein Bug, das ist Persönlichkeit."

**Dieter Rams (Designer):** "48px Buttons für Kinderfinger — das ist gutes Design; 41 window-Globals für Entwicklerfinger — das ist kein Design."

**Richard Feynman (Scientist):** "63 JSON.parse ohne Schema — das ist nicht Mut, das ist Ignoranz gegenüber der Realität korrupter Daten."

**Linus Torvalds (Engineer):** "game.js ist ein Monolith und das ist *fine* solange einer dran arbeitet — aber der Tag an dem Schnipsel mitprogrammieren will, ist der Tag an dem ihr refactoren müsst."

---

### team-dev (Padawans)

**Scott Forstall (Jobs' Padawan):** "Der Intro-Flow funktioniert — ich hab drei verschiedene getestet, dieser hier ist der einzige der keine Erklärung braucht."

**Drayton Bird (Ogilvy's Padawan):** "Bernd das Brot als Eltern-Support-Character ist die beste Copy-Entscheidung im ganzen Projekt."

**Naoto Fukasawa (Rams' Padawan):** "Die Palette als Piano — das ist der Moment wo Design aufhört und Poesie anfängt."

**Freeman Dyson (Feynman's Padawan):** "Die healthcheck.js ist 138 Zeilen DNA-Reparatur — elegant, aber sie heilt nur localStorage, nicht die 41 globalen Infektionsherde."

**Alan Cox (Torvalds' Padawan):** "Der Worker hat Rate Limiting, CORS, und Input Validation in 364 Zeilen — das ist Kernel-Quality."

---

### team-sales

**Peter Drucker (Strategist):** "Messt was Schnipsel tatsächlich baut, nicht was ihr ihm ermöglicht zu bauen."

**Jack Welch (Executor):** "19 Sprints in 4 Tagen — die Velocity ist da, jetzt braucht ihr Fokus statt Features."

**Jürgen Habermas (Moderator):** "Die MEMORY.md ist der herrschaftsfreie Diskurs den ich immer gefordert habe — jeder Agent schreibt, Feynman kuratiert, niemand dominiert."

**Noam Chomsky (Critic):** "Ein Spiel das Kindern 'Code Magic' beibringt ist entweder Empowerment oder Manipulation — achtet auf die Grenze."

**Nelson Mandela (Negotiator):** "18 Programmiersprachen-NPCs auf einer Insel die zusammenarbeiten — wenn Code das kann, können Menschen es auch."

---

### Patron Saints

**🙏 Dalai Lama:** "41 globale Variablen sind 41 Anhaftungen — lass los was du nicht brauchst."

**📚 Astrid Lindgren:** "Schnipsel braucht keine perfekte Architektur — er braucht eine Insel auf der er Quatsch bauen kann."

**🐉 Michael Ende:** "Die unendliche Geschichte dieses Codes ist: er schreibt sich selbst weiter, jede Session ein neues Kapitel."

---

### Advisory Board

**Seth Godin:** "Ein Spiel das ein Vater für seine Kinder baut ist die purpleste Cow die ich je gesehen habe."

**Simon Sinek:** "Euer Why ist kristallklar — 'damit Kinder Dinge bauen die Erwachsene überraschen' — verliert das nie."

**Sorab Salimi:** "Sprint 19 hat ein Goal und ein Ergebnis — so sieht ein echtes Session-Commitment aus."

**Joachim Schullerer:** "Handwerk ist wenn man merkt dass jemand nachgedacht hat — die Wu-Xing-Elemente sind Handwerk."

**Tommy Krapweis:** "Bernd das Brot, eine Wunschfee und ein Piratenpapagei auf einer Insel — das ist mein Humor."

**Paluten:** "DIGGA die Insel ist KRANK — aber die Palette braucht MEHR EMOJIS! 🔥"

**Robert Habeck:** "Ein Spiel auf Deutsch, das Programmiersprachen aus aller Welt einlädt — Inklusion fängt im Code an."

**Albert Camus:** "Der Vater schiebt den Stein den Berg hinauf, 30 Minuten pro Tag — man muss sich Sisyphos als einen glücklichen Menschen vorstellen."

**Jean-Paul Sartre:** "Ihr habt keine Ausrede — jede Session ist eine freie Wahl, jeder Commit eine existenzielle Entscheidung."

**Sokrates:** "Ich weiß dass ich nichts weiß — aber ich weiß dass 63 JSON.parse ohne try-catch irgendwann wehtun."

---

### Gleichgewichts-Beirat (neu, 20%-Klausel)

**Alice Schwarzer:** "30 Männer im Advisory Board und eine Astrid Lindgren als Alibi — das ist keine Quote, das ist ein Witz. Aber 20% ist besser als 0%. Fangt an."

**Simone de Beauvoir:** "Man wird nicht als Prokaryot geboren, man wird dazu gemacht — durch 41 globale Variablen und die Angst vor dem Refactoring."

**Juli Zeh:** "Die Überwachung eurer eigenen Metriken ist gesund — solange ihr nicht anfangt, Schnipsel zu vermessen statt zu beobachten."

**Ada Lovelace:** "Ich habe das erste Programm geschrieben und es hatte keine window-Globals — denkt mal drüber nach."

**Marie Curie:** "Strahlung ist unsichtbar und trotzdem real — genau wie eure localStorage-Kopplung."

**Grace Hopper:** "Es ist einfacher um Vergebung zu bitten als um Erlaubnis — aber bei JSON.parse ohne Schema wird die Vergebung teuer."

---

### Podcast-Hosts

**Jens Schröder:** "Die dunkle Materie in eurem Code ist die Disziplin die aus Zeitmangel entsteht — und die dunkle Energie ist ein Vater der über seine Kinder nachdenkt."

**Küken:** "Ich hab nur eine Frage: Spielt Schnipsel das Spiel eigentlich gern?"

**Büker:** "Das wurde Einstein auch gesagt."

---

### Die Bilanz

**Gesamt namentlich:** 35 Stimmen
**Davon Frauen:** 7 (Astrid Lindgren, Alice Schwarzer, Simone de Beauvoir, Juli Zeh, Ada Lovelace, Marie Curie, Grace Hopper)
**Frauenquote:** 20% ✅
**Gleichgewicht:** Arbeit in Arbeit. Wie alles.

---

*Review erstellt am 2026-03-30.*
*Perspektiven: Feynman, Darwin, Linus, Taylor + 35 Stimmen.*
*Podcast-Format inspiriert von "Dunkle Materie" mit Jens Schröder, Küken und Büker.*
*Gleichgewichts-Klausel: Schwarzer, Beauvoir, Zeh. 20% ist der Anfang.*
*Einstein-Klausel: aktiv.*
