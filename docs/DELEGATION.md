# Delegation Board — Appelo Level 1-7

Perspektive: User (Papa) ↔ AI-Team. Wer entscheidet was?

## Legende

| Level | Bedeutung | Kurzform |
|-------|-----------|----------|
| 1 | **Tell** — User sagt exakt was, Team führt aus | "Mach genau das" |
| 2 | **Sell** — User entscheidet, erklärt warum | "Mach das, weil..." |
| 3 | **Consult** — Team berät, User entscheidet | "Was meint ihr?" |
| 4 | **Agree** — Gemeinsam | "Lasst uns einigen" |
| 5 | **Advise** — Team entscheidet, User berät | "Ich würd's so machen" |
| 6 | **Inquire** — Team entscheidet, informiert User | "Hab X gemacht, FYI" |
| 7 | **Delegate** — Team entscheidet, User muss nicht mal wissen | "Läuft" |

## Matrix

| Bereich | Entscheidung | Level | Wer | Warum |
|---------|-------------|-------|-----|-------|
| **Produkt-Vision** | Was bauen wir? Für wen? | **1 — Tell** | User | Nur der Vater kennt Oscar. |
| **Feature-Ideen** | Neue Idee ins Backlog | **1 → 6** | User → Leader | User wirft rein, Leader sortiert und priorisiert. |
| **Sprint-Ziel** | Was diese Session? | **3 — Consult** | User entscheidet | Team schlägt vor basierend auf Backlog-Prio. User sagt ja oder nein. |
| **Go/No-Go Feature** | Kommt das in den Sprint? | **5 — Advise** | Einstein | Hilft es dem Kind? Ja → Go. Nein → Kill. User kann Veto einlegen. |
| **Architektur** | Stack, Dependencies, Patterns | **7 — Delegate** | Darwin + Engineer | User baut keine Architektur, er baut ein Spiel für sein Kind. |
| **Code-Qualität** | Typecheck, Linting, Tests | **7 — Delegate** | Engineer | Code kompiliert oder kompiliert nicht. Keine Meinungsfrage. |
| **Git-Workflow** | Branch, Commit, Push, PR | **7 — Delegate** | Engineer | Atomar. Automatisch. User tippt Ideen, nicht git-Befehle. |
| **PR-Review** | Merge oder nicht? | **6 — Inquire** | Leader + Scientist | Team prüft und merged. Nur bei Risiko: User fragen. |
| **UI/Design** | Wie sieht es aus? | **4 — Agree** | Designer + User | Design ist sichtbar. Der Vater sieht ob Oscar es versteht. |
| **Copy/Texte** | NPC-Dialoge, Microcopy | **5 — Advise** | Artist | Artist schreibt. User kennt die Stimme seiner Kinder besser. |
| **Persona-Design** | Neue Beirats-Persona | **3 — Consult** | User entscheidet | User wählt den Archetyp. Team füllt den Schatten. |
| **Scoring/Evals** | Rubrics, LLM-Config | **7 — Delegate** | Scientist | Wenn der User die Rubrik versteht, hat Feynman versagt. |
| **Deployment** | Wann geht was live? | **6 — Inquire** | Engineer | Deploy wenn grün. User erfährt's per PR-Merge. |
| **Ethik/Kinderschutz** | Manipuliert das Spiel? | **1 — Tell** | User (Veto-Recht) | Ob ein Mechanismus für SEIN Kind ok ist, entscheidet der Vater. Immer. |
| **Skalierung** | Neuer Agent? Neue Zelle? | **5 — Advise** | Einstein + Feynman | Feynman misst den Engpass. Einstein entscheidet. User kann stoppen. |
| **Memory/Learnings** | Was schreiben wir auf? | **7 — Delegate** | Scientist + COO | Dokumentation ist Hygiene. |
| **Bug-Fixing** | Crash, Fehler, Regression | **7 — Delegate** | Engineer | Ein Bug ist keine Meinungsfrage. |
| **Backlog-Pflege** | Prio, Sortierung, Archiv | **6 — Inquire** | Leader | Leader räumt auf, User sieht das bereinigte Ergebnis. |
| **Kosten/Token-Budget** | Opus-Elevation, TPM | **5 — Advise** | Scientist | Feynman misst ob Opus den Preis wert ist. User hat Veto bei €. |

## Verteilung

| Level | Anzahl | Anteil |
|-------|--------|--------|
| 7 — Delegate | 7 | 37% |
| 6 — Inquire | 3 | 16% |
| 5 — Advise | 4 | 21% |
| 4 — Agree | 1 | 5% |
| 3 — Consult | 2 | 11% |
| 1 — Tell | 2 | 11% |
| 2 — Sell | 0 | 0% |

**74% der Entscheidungen liegen bei Level 5-7.** Der User gibt Richtung, tippt Ideen rein, schaut sich UI an. Den Rest macht das Team.

## Review-Zyklus

Appelo prüft diese Matrix alle 10 Sessions oder wenn sich der Kontext ändert:
- Oscar wird älter → Ethik-Level verschiebt sich?
- Team wächst → neue Delegation-Bereiche?
- Neues Feature-Gebiet → wer entscheidet?

Auditor: `/appelo`
