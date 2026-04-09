# 03 — Pod Demo: Was zeigen, was sagen

## Owner: /jobs (flow) + /ogilvy (words) + /feynman (honesty)

## Time: 3 Minuten pro Durchlauf

## Prerequisite: LED Board funktioniert (02), Crowd da (01)

-----

## Die Regel

**Zeigen. Nicht erklären.** Wer fragt, bekommt eine Antwort. Wer nicht fragt, sieht LEDs. Das reicht.

-----

## Setup auf dem Tisch

```
┌──────────────────────────────┐
│                              │
│   [Igor]     [Pod LEDs]     │
│   (laut)     (leise)        │
│              R  Y  G         │
│                              │
│   [Laptop]   [Pitch Cards]  │
│   (pod.py)   (Stapel)       │
│                              │
└──────────────────────────────┘
```

Igor links (laut, Crowd-Magnet). Pod rechts (leise, für die Neugierigen). Kontrast ist die Botschaft.

-----

## Demo-Sequenz (wenn jemand fragt)

### Stufe 1 — Die Frage (10 Sekunden)

**Jemand:** "Was ist das?"

**Till:** "Ein Solarsystem das lernt was du brauchst. Drei LEDs, kein Display."

*Nicht mehr sagen. Warten.*

### Stufe 2 — Interesse (30 Sekunden)

**Jemand:** "Wie funktioniert das?"

**Till:** *(zeigt auf LEDs)*

- "Grün heißt: geh zu deinem Sohn. Alles läuft."
- "Gelb heißt: ich arbeite dran."
- "Rot heißt: handle jetzt."

*(LED-States durchschalten lassen — pod.py auf Laptop)*

"Das System lernt deine Prioritäten. Ohne App, ohne Internet."

### Stufe 3 — Tiefes Interesse (2 Minuten)

**Jemand:** "Für wen ist das?"

**Till:** "Ein Vater im Südsudan benutzt sein Handy als Taschenlampe. Pod gibt ihm die Entscheidung zurück: Licht für den Sohn, Wärme für die Frau, Konnektivität für ihn. 398 Euro."

*(Pitch Card geben → Deliverable 04)*

### Stufe 4 — Der Richtige (selten)

**Jemand:** "Ist das deine Abschlussarbeit?"

**Till:** "Promotion. Ich suche eine Betreuung."

*(PhD One-Pager geben → Deliverable 05)*

-----

## pod.py Demo-Modus

Für die Demo ohne Victron-Hardware — simulierter VE.Direct-Datenstrom:

```bash
# Terminal 1: Fake serial data
python3 -c "
import time, random
while True:
    soc = random.randint(10, 100)
    cs = random.choice([3, 4, 5])
    print(f'SoC: {soc}% | CS: {cs} | LED: ', end='')
    if soc > 40: print('GREEN SOLID')
    elif soc > 20: print('YELLOW PULSING')
    else: print('RED BLINKING')
    time.sleep(2)
"
```

Oder besser: LED Board direkt an RPi/Laptop GPIO (wenn RPi vorhanden), pod.py im Testmodus mit simulierten VE.Direct Frames.

### Minimaler Demo-Modus ohne RPi

```python
#!/usr/bin/env python3
"""Pod LED Demo — LAN Party Modus. Kein VE.Direct nötig."""
import time, sys

STATES = [
    ("GREEN",  "SOLID",    "Alles gut. Geh zu deinem Sohn.", 3),
    ("GREEN",  "PULSING",  "Energie fließt. Sommer.", 3),
    ("YELLOW", "TAPERING", "Nacht. Kein Panel. Seed State.", 3),
    ("YELLOW", "PULSING",  "Batterie wird knapp. Achtung.", 3),
    ("RED",    "BLINKING", "Fehler. Handle jetzt.", 2),
    ("RED",    "SOLID",    "BMS Cutoff. Winter. Warte auf Sonne.", 3),
    ("GREEN",  "SOLID",    "Frühling. Pod lebt.", 5),
]

print("Pod 器 qì — Demo Mode")
print("=" * 40)
for color, state, meaning, wait in STATES:
    print(f"\n  [{color:6s}] [{state:8s}]")
    print(f"  → {meaning}")
    # Hier: GPIO setzen wenn Hardware da
    time.sleep(wait)

print("\n\nDas ist Pod. 398€. Drei LEDs. Schweigen.")
```

-----

## Was man NICHT sagt

- Nicht: "Das ist ein Raspberry Pi mit einem MPPT-Controller"
- Nicht: "Ich nutze ein Hidden Markov Model mit vier latenten Zuständen"
- Nicht: "Das ist mein PhD-Projekt"
- Nicht: "Kennst du Machine Learning?"

Technik nur wenn gefragt. Menschen zuerst. Immer.

-----

## /ogilvy's Regel für die Demo

Wenn du mehr als 30 Sekunden redest ohne dass die andere Person eine Frage stellt, hör auf. Du hast sie verloren. Lächle und sag: "Willst du eine Karte?"

## /feynman's Anmerkung

Die Demo zeigt simulierte Daten. Sag das wenn jemand fragt. "Das sind simulierte Werte. Die echte Hardware kommt diese Woche." Ehrlichkeit ist keine Schwäche — sie ist Vertrauen.

-----

## Kosten: 0€
## Zeitaufwand: 5 min Setup, dann passiv
## Abhängigkeit: LED Board (02) ODER Laptop mit Terminal
## Ermöglicht: Pitch Card (04) hat einen Anlass zum Verteilen
