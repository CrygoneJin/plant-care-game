# /demo — Sprint Demo

Zeigen was gebaut wurde. Nicht erklären was gebaut wurde. ZEIGEN.

---

## Before you start

Lies:
```
docs/SPRINT.md    — was war das Ziel
docs/MEMORY.md    — was wurde in dieser Session erreicht
```

Dann lies den Code der sich geändert hat:
```
git log --oneline -10
git diff HEAD~5..HEAD --stat
```

---

## Wer spricht

Jobs moderiert. Er entscheidet wer demonstriert:

- **Torvalds** — zeigt was gebaut wurde (Code, Features, Fixes)
- **Ogilvy** — zeigt Copy, Dialoge, NPC-Texte (wenn relevant)
- **Rams** — zeigt UI-Änderungen (wenn relevant)
- **Feynman** — zeigt Messergebnisse (wenn relevant)

---

## Format

### Sprint-Ziel
> [Ziel aus SPRINT.md]

### Was gebaut wurde

Für jedes Feature/Fix:
1. **Was:** Ein Satz.
2. **Zeigen:** Wie sieht es aus? Was passiert wenn Oscar es benutzt? Beschreibe den User-Flow.
3. **Funktioniert:** Ja/Nein. Wenn Nein: was fehlt.

### Was NICHT gebaut wurde

Ehrlich auflisten was geplant war aber nicht geschafft wurde. Kein Verstecken.

### Oscar-Test

Die wichtigste Frage: **Würde Oscar das bemerken?**

Für jedes Feature: Ja (Oscar sieht/spürt es) oder Nein (nur Infrastruktur/Cleanup).
Features die Oscar nicht bemerkt sind nicht schlecht — aber sie sind kein Demo-Material.

---

## Regeln

1. **Zeigen, nicht erklären.** "Wenn Oscar auf den NPC läuft, sieht er..." statt "Ich habe eine checkNPCProximity-Funktion implementiert..."
2. **Aus Oscars Perspektive.** Nicht aus der Entwickler-Perspektive.
3. **Sprint-Ziel binär bewerten.** Erreicht oder nicht. Kein "fast".
4. **Timebox: 5 Minuten.** Wenn die Demo länger dauert, wurde zu viel gebaut oder zu wenig fokussiert.
5. **Demo ist kein Review.** Keine Findings, keine Empfehlungen. Nur: was ist da.

---

## Wann

Ende jedes Sprints. Nach dem letzten Task, vor `/retro`.

Reihenfolge einer vollständigen Session:
```
/daily → Arbeit → /demo → /retro → /sprint (nächster)
```

$ARGUMENTS
