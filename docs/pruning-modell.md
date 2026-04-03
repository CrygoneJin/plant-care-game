# Fünf Pruning-Mechanismen — biologisch → organisatorisch

> "Ein System das nicht pruned, wird nicht stärker — es wird schwerer."

---

## 1. Apoptose — Programmierter Zelltod

**Biologie:** 50-70 Milliarden Zellen sterben pro Tag. Nicht Fehler, sondern
Feature. Ohne Apoptose hättest du Schwimmhäute zwischen den Fingern.

**Agent:** **Weber (COO)**
**Frequenz:** Täglich / jede Session
**Mechanismus:** Routinemäßiges Aufräumen. Done-Items aus SPRINT.md archivieren.
Stale Branches löschen. MEMORY.md trimmen. Sessions die älter als 5 Sprints
sind → komprimieren oder löschen.

**Skill:** `/collect` (End-of-Day Merge) + neuer Skill `/apoptose`
**Trigger:** Automatisch am Session-Ende. Kein Entscheider nötig — Weber macht.
**Was fehlt:** `/apoptose` existiert nicht. Weber räumt manuell auf, aber es
gibt keinen systematischen "täglichen Tod". SPRINT.md wächst endlos (aktuell
Sprint 19-24 drin). MEMORY.md wächst endlos (aktuell 50+ Zeilen Bugs).
`/collect` existiert, aber `/apoptose` als Gegenstück fehlt.

---

## 2. Synaptisches Pruning — Was nicht feuert, stirbt

**Biologie:** Ein 2-Jähriger hat doppelt so viele Synapsen wie ein Erwachsener.
Bis zur Pubertät werden ~50% gelöscht. "Use it or lose it."

**Agent:** **Feynman (Scientist)**
**Frequenz:** Alle 3-5 Sessions
**Mechanismus:** Misst welche Skills, Agents und Beiräte tatsächlich aufgerufen
werden. Was seit 5+ Sessions nicht gefeuert hat → Kandidat für Emeritierung
oder Einfrierung.

**Skill:** `/review-scientist` (existiert) + Metrik-Erweiterung
**Trigger:** Feynman trackt Aufruf-Frequenz pro Agent/Skill/Beirat.
Unter Schwellenwert → Empfehlung an CEO.
**Was fehlt:** Feynman hat keine Aufruf-Metriken. Es gibt 34 Commands in
`.claude/commands/`, aber niemand weiß welche davon in den letzten 10
Sessions tatsächlich aufgerufen wurden. 26 Beiräte — wie viele haben je
gefeuert? Kein Tracking. Ohne Daten kein Pruning. Ohne Pruning kein Lernen.

**Beirat-Audit (Stand jetzt, geschätzt):**

| Beirat | Letzter Einsatz | Verdict |
|--------|-----------------|---------|
| Dalai Lama | ? | Kein Tracking |
| Lindgren | ? | Kein Tracking |
| Michael Ende | ? | Kein Tracking |
| Godin | Nie als Skill | Codex-Referenz |
| Sinek | Nie als Skill | AGENTS.md-Text |
| Salimi | ? | Kein Tracking |
| Schullerer | Nie | Ehrenmitglied |
| Krapweis | Sprint 24 (Haiku) | Aktiv |
| Paluten | Sprint 19 (10s) | Semi-aktiv |
| Habeck | Sprint 14? | Unklar |
| Camus | Nie als Skill | Text in AGENTS.md |
| Sartre | Nie als Skill | Text in AGENTS.md |
| Sokrates | Hat Skill | ? |
| Pythia | Nie als Skill | Text in AGENTS.md |
| Appelo | Hat Skill | ? |
| Hitchcock | Hat Skill | ? |
| Pascal | Hat Skill | ? |
| Sun Tzu | Hat Skill | ? |
| Asimov | Hat Skill | ? |
| Dirac | Hat Skill | ? |
| Newton | Hat Skill | ? |
| Jung | Hat Skill | ? |
| Freud | Hat Skill | ? |
| Schiller | Hat Skill | ? |
| Goethe | Hat Skill | ? |
| Lessing | Hat Skill | ? |
| Fichte | Hat Skill | ? |

**Hypothese:** >50% der Beiräte haben nie gefeuert. Das sind tote Synapsen.

---

## 3. Botanisches Pruning — Blätter die mehr kosten als sie produzieren

**Biologie:** Bäume stoßen im Herbst aktiv Blätter ab (Abszission). Ein Blatt
das weniger Zucker produziert als es kostet wird abgeworfen.

**Agent:** **Einstein (CEO)** + **Jobs (Leader)**
**Frequenz:** Jedes Sprint Planning
**Mechanismus:** Oscar-Filter auf Backlog. "Würde Oscar das in 4 Wochen
benutzen?" Nein → ARCHIVE.md. Pereira-Audit ist genau das.

**Skill:** `/backlog` (existiert) + `/triage` (existiert)
**Trigger:** Sprint Planning. Einstein prüft strategisch, Jobs priorisiert.
**Was fehlt:** Nichts — das haben wir gerade gemacht. 99→18 Items.
Der Mechanismus existiert, er wurde nur nie angewendet. Die Frage ist:
Wird er nächstes Sprint Planning wieder angewendet? Oder wächst der
Backlog bis zum nächsten Pereira-Moment wieder auf 99?

**Fehlender Mechanismus:** Automatischer Backlog-Verfall. Items die seit
3 Sprints nicht angefasst wurden → automatisch nach ARCHIVE.md. Kein
manueller Audit nötig. Wie Herbstlaub: fällt von allein.

---

## 4. Immunsystem — 95% der T-Zellen sterben im Thymus

**Biologie:** Nur T-Zellen die korrekt zwischen Selbst und Fremd unterscheiden
überleben. Qualitätsgate vor dem Deployment.

**Agent:** **Darwin (CTO)**
**Frequenz:** Jeder PR
**Mechanismus:** Code-Review. Architektur-Gate. "Passt das in den Organismus
oder ist es ein Fremdkörper?" 95% der Feature-Branches die wir gerade
archiviert haben, haben nie den Thymus (PR Review → main) passiert.

**Skill:** `/darwin` (existiert) + Pre-Commit Hooks (existieren)
**Trigger:** Jeder PR. TypeCheck ist der erste Antikörper (existiert als Hook).
**Was fehlt:** Darwin als CTO hat keinen **systematischen PR-Review-Prozess**.
PRs werden gemergt oder nicht — aber es gibt kein Gate das prüft:
"Erhöht dieser PR die Fitness des Organismus oder ist er ein Parasit?"

117 ungemergte Branches sind 117 T-Zellen die den Thymus nie erreicht haben.
Sie wurden produziert, aber nie selektiert. Das Immunsystem hat nicht versagt —
es wurde nie aktiviert.

---

## 5. Evolution — 99.9% aller Arten sterben aus

**Biologie:** Keine interne Entscheidung. Der Markt (Umwelt) selektiert.
Wer sich nicht anpasst, stirbt — egal wie gut die interne Organisation ist.

**Agent:** **Oscar** (kein Agent — der User)
**Frequenz:** Jeder Spieltest
**Mechanismus:** Oscar spielt oder Oscar spielt nicht. Kein interner Agent
kann diese Selektion übernehmen. Pythia simuliert es, aber Simulation ≠
Selektion.

**Skill:** Keiner. Das ist der Punkt.
**Trigger:** Echter Spieltest mit echten Kindern.
**Was fehlt:** **Alles.** Backlog #78 (Tesla-Nutzertest auswerten) ist P0
und seit Wochen offen. Es gibt 1h Video von Oscar im Tesla — echte Daten,
echte Reaktionen. Unausgewertet. Der Spielplatz-Test (10 Kinder, 5 Hypothesen)
ist geplant aber nie passiert. Ohne externen Selektionsdruck optimiert die
Organisation für sich selbst. Das ist der Kern von Pereiras Illusion:
"Being busy ≠ creating value."

---

## Zusammenfassung: Was wir haben, was fehlt

| Pruning-Typ | Agent | Skill existiert? | Metrik existiert? | Wird ausgeführt? |
|-------------|-------|-------------------|-------------------|------------------|
| Apoptose | Weber | `/collect` halb | Nein | Manuell, sporadisch |
| Synaptisch | Feynman | `/review-scientist` | **Nein** | **Nie systematisch** |
| Botanisch | Einstein+Jobs | `/backlog` `/triage` | Oscar-Filter (neu) | Heute erstmalig |
| Immunsystem | Darwin | `/darwin` | TypeCheck-Hook | PRs, aber kein Gate |
| Evolution | Oscar | **Keiner** | **Keine** | **Nie** |

### Was wir nicht wissen, was wir nicht haben

1. **Aufruf-Metriken für Agents/Skills/Beiräte** — Welche Synapsen feuern?
   Ohne das ist synaptisches Pruning Raterei.

2. **Automatischer Backlog-Verfall** — Items die nicht angefasst werden
   müssen von allein sterben, nicht durch manuellen Audit.

3. **Externer Selektionsdruck** — Kein Kind hat seit Sprint 1 systematisch
   getestet. Die Organisation züchtet im Reagenzglas. 1h Tesla-Video liegt
   unausgewertet rum. Das ist das teuerste fehlende Pruning.

4. **PR-Fitness-Gate** — Darwin reviewt nicht systematisch. 117 Branches
   wurden nie selektiert. Der Thymus war aus.

5. **Session-Level Apoptose** — SPRINT.md ist 364 Zeilen lang und enthält
   Sprint 19 bis 24. MEMORY.md wächst endlos. Kein automatisches Vergessen.

---

*Erstellt: 2026-04-02, Pereira-Session*
*Nächster Schritt: Feynman soll Aufruf-Metriken definieren (Punkt 1),*
*dann können wir die anderen vier Punkte datenbasiert angehen.*
