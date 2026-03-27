# Claude Code Best Practices
## Für Väter die coden, während das Haus auseinanderfällt

---

## Dein Profil

Du bist ein Vater mit:
- Einer Frau (Lehrerin) die weiß, wann du schummeln willst
- Einem Mädchen und zwei Jungs die jederzeit den Stecker ziehen
- Einem riesigen Garten der nie fertig ist
- Einem Haus das immer irgendwo kaputt ist
- Einem unaufhaltsamen Drang, alles zu automatisieren

Du hasst es, Dinge zweimal zu tun. Auch wenn die Automatisierung
10x länger dauert als die manuelle Aufgabe. Auch wenn du sie
danach nie wieder brauchst. Der Weg ist das Ziel. Bis jemand
den Mac ausstöpselt.

---

## Regel 1: Session-Resilienz

**Deine Kinder WERDEN den Stecker ziehen.**

Das ist keine Frage des Ob, sondern des Wann. Deshalb:

### Commit early, commit often

```bash
# Nach JEDEM funktionierenden Zwischenstand:
git add -A && git commit -m "WIP: [was gerade funktioniert]"
```

Claude Code Einstellung dafür:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude wartet auf dich\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### Warum

Wenn dein 5-Jähriger den Mac ausstöpselt während Claude gerade
ein 400-Zeilen Refactoring macht, willst du nicht bei Null anfangen.
Git ist dein Undo-Button gegen Kinder.

### Die "Ich bin gleich fertig"-Falle

Du bist nie "gleich fertig". Deine Frau weiß das. Deine Kinder
wissen das. Nur du weißt es nicht. Commit JETZT.

---

## Regel 2: Automations-Hygiene

Du wirst alles automatisieren wollen. Das ist ok. Aber sei ehrlich:

### Der Automatisierungs-Entscheidungsbaum

```
Muss ich das nochmal machen?
├── Ja, morgen schon → Automatisieren. Klar.
├── Ja, in 6 Monaten → STOPP. Du weißt in 6 Monaten nicht
│                       mehr wie dein Script funktioniert.
│                       Schreib eine CLAUDE.md stattdessen.
├── Nein, nie wieder → Mach es manuell.
│                      Ja, wirklich.
│                      Nein, du brauchst kein Script dafür.
│                      Leg den Editor weg.
│                      ...
│                      Ok, du machst es trotzdem. Viel Spaß.
└── Ich bin mir nicht sicher → Du automatisierst es sowieso.
                               Wenigstens ein README schreiben.
```

### Das "Spaß-Budget"

Du automatisierst nicht weil es effizient ist. Du automatisierst
weil es Spaß macht. Das ist LEGITIM. Aber sag es dir selbst:

> "Ich baue das jetzt nicht weil es sinnvoll ist, sondern weil
> ich Bock drauf habe."

Dann gibt es keinen Frust wenn es nicht wiederverwendbar ist.
Es war Hobby, nicht Arbeit.

---

## Regel 3: Claude Code Session-Strategie

### Die "Garten-Session" (30 Min max)

Deine Frau gibt dir 30 Minuten. Nutze sie:

```
Minute 0-2:   Claude liest CLAUDE.md, versteht den Kontext
Minute 2-5:   Du sagst was du willst (ein konkretes Ding)
Minute 5-25:  Claude baut, du reviewst
Minute 25-28: Commit + Push
Minute 28-30: CLAUDE.md updaten mit dem Stand der Dinge
```

**Niemals** in Minute 25 noch "ach und kannst du noch schnell..."

### Die "Kinder-schlafen-Session" (unbegrenzt, bis Stecker)

Das ist deine Spielwiese. Hier darfst du:
- 3 Agents parallel spawnen
- Einen Proxy aufsetzen den du nie wieder brauchst
- Ein Bash-Script schreiben das ein Python-Script generiert
  das ein Shell-Script aufruft

Aber: **Commit vor dem Rabbit Hole.**

### Die "Sonntagmorgen-Session" (Goldene Zeit)

Frau schläft, Kinder schlafen, Kaffee ist fertig. Das ist
Premium-Zeit. Nutze sie für:
- Architektur-Entscheidungen (Opus-Level)
- Große Refactorings
- Die eine Automatisierung die du seit 3 Wochen aufschiebst

**Nicht** für: "Mal kurz den Proxy-Config anpassen" (das frisst
den ganzen Morgen und du weißt es).

---

## Regel 4: CLAUDE.md als Gedächtnis

Du wirst unterbrochen. Immer. Dein Kontext geht verloren.
Claude Code's Kontext geht auch verloren (Session-Ende).

**CLAUDE.md ist euer gemeinsames Gedächtnis.**

Am Ende jeder Session, schreib rein:

```markdown
## Stand [Datum]
- Was funktioniert: [...]
- Was offen ist: [...]
- Nächster Schritt: [...]
- WARNUNG: [was nicht anfassen, was kaputt ist]
```

Dann kann Claude (und du nach 3 Wochen Pause) sofort weitermachen.

---

## Regel 5: Model-Wahl für Väter

| Situation | Model | Grund |
|-----------|-------|-------|
| "Schnell was fixen vor dem Abendessen" | Haiku | Schnell, billig, reicht |
| "Feature bauen während Kinder spielen" | Sonnet | Guter Kompromiss |
| "Sonntagmorgen Architektur-Session" | Opus | Die Ruhe nutzen |
| "Automatisierung die keiner braucht" | Haiku | Sei ehrlich zu dir |
| "Dem Kind ein Spiel bauen" | Sonnet | Für Schnipsel nur das Beste |

---

## Regel 6: Garten- und Haus-Automatisierung

Du wirst versuchen, Garten und Haus mit Code zu lösen.
Hier ist die Wahrheit:

### Funktioniert
- Bewässerungssteuerung (Home Assistant + Magnetventile)
- Einkaufsliste automatisch aus Kalender-Events
- "Haus-TODO" Board das die ganze Familie sieht

### Funktioniert nicht
- Script das berechnet wann der Rasen gemäht werden muss
  (Spoiler: JETZT. Er muss JETZT gemäht werden.)
- Automatische Priorisierung von Haus-Reparaturen
  (Deine Frau priorisiert. Immer. Korrekt.)
- Bot der den Kindern antwortet damit du weiter coden kannst
  (Wurde versucht. Stecker wurde gezogen.)

---

## Regel 7: Die Stecker-Zieh-Checkliste

Für den Moment in dem es passiert (und es WIRD passieren):

```
□ War mein letzter Commit vor weniger als 10 Minuten?
  → Ja: Alles gut. Steh auf, geh zu den Kindern.
  → Nein: Nächstes Mal besser. Steh trotzdem auf.

□ Hatte Claude gerade eine große Änderung am Laufen?
  → git stash oder git checkout . beim nächsten Start

□ Bin ich sauer?
  → Ja: Das ist normal. Atme. Die Kinder sind wichtiger
    als dein Bash-Script das ein Python-Script generiert.
  → Nein: Du lügst. Aber gut, geh trotzdem.
```

---

## Regel 8: Pair-Programming mit Kindern

Schnipsel will Architekt werden. Er wird auch coden wollen.

### Dos
- Lass ihn den "Los geht's"-Button drücken
- Lass ihn Farben aussuchen ("Welche Farbe soll das Dach haben?")
- Erkläre NICHT wie der Code funktioniert (er fragt wenn er will)
- Zeig ihm das Ergebnis, nicht den Prozess

### Don'ts
- Nicht "gleich, ich muss nur noch..." (Du musst NIE "nur noch")
- Nicht sein Spiel als Testumgebung für deine Proxy-Config nutzen
- Nicht enttäuscht sein wenn er nach 5 Minuten weg ist
  (Er kommt wieder. Immer.)

---

## Regel 9: Reuse-Realismus

Deine Automatisierungen haben eine Halbwertszeit:

| Typ | Halbwertszeit | Reuse-Chance |
|-----|---------------|--------------|
| Shell-Script | 2 Wochen | 10% |
| Claude Agent Config | 1 Monat | 40% |
| CLAUDE.md Doku | 6 Monate | 90% |
| Gut benanntes Git-Repo | Jahre | 95% |
| "Ich merk mir das" | 0 Tage | 0% |

**Erkenntnis**: Die Dokumentation überlebt den Code.
Schreib eine gute CLAUDE.md, nicht ein cleveres Script.

---

## Regel 10: Die Lehrerinnen-Frau-Regel

Deine Frau ist Lehrerin. Sie erkennt:
- Wenn du "recherchierst" statt arbeitest
- Wenn du "kurz was fixt" und 3 Stunden weg bist
- Wenn du sagst "das spart uns langfristig Zeit"
- Wenn du ein Tool baust um ein Tool zu konfigurieren
  das ein anderes Tool steuert

**Sie hat immer recht.** Bau das in dein System ein:

```
Wenn [Frau sagt "ist das nötig?"]
  → Wahrscheinlich nicht.
  → Aber du machst es trotzdem.
  → Also: Timer auf 45 Min, commit, Feierabend.
```

---

## Zusammenfassung

```
1. Commit vor dem Rabbit Hole
2. CLAUDE.md ist dein Gedächtnis
3. Timer setzen (deine Frau hat recht)
4. Haiku für Spielereien, Opus für Sonntagmorgen
5. Kinder > Code (auch wenn es weh tut)
6. Automatisierung ist Hobby, nicht Effizienz
7. Die Doku überlebt den Code
8. Du bist nie "gleich fertig"
9. Git Push bevor der Stecker gezogen wird
10. Spaß haben. Dafür ist es da.
```
