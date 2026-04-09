# 02 — LED-Perfboard: Woz's Schaltplan

## Owner: /woz (design) + /linus (GPIO verification)

## Time to build: 30 Minuten löten

## Prerequisite: Teile angekommen (LED Kit), Lötstation im Makerspace

-----

## Warum das Perfboard zweites?

Während Igor die Crowd unterhält, lötet Till. Maker sehen Maker löten und kommen dazu. "Was baust du?" ist der natürlichste Satz in einem Makerspace. Die Antwort führt zu Pod.

-----

## Schaltplan

```
         +12V (from battery)
          │
          ┤ R1 (510Ω)          R2 (510Ω)          R3 (510Ω)
          │                     │                    │
         LED (Red)            LED (Yellow)         LED (Green)
          │                     │                    │
          ┤ Drain               ┤ Drain              ┤ Drain
      ┌───┤ 2N7000          ┌───┤ 2N7000         ┌───┤ 2N7000
      │   ┤ Gate             │   ┤ Gate            │   ┤ Gate
      │   │                  │   │                 │   │
      │   ├── GPIO 17        │   ├── GPIO 27       │   ├── GPIO 22
      │   │   (RPi CM4)      │   │                 │   │
      │   ┤ Source            │   ┤ Source           │   ┤ Source
      │   │                  │   │                 │   │
      └───┴──────────────────┴───┴─────────────────┴───┴──── GND
```

### Wie es funktioniert

1. RPi GPIO setzt 3.3V auf Gate des 2N7000
1. 2N7000 schaltet durch (Vgs(th) = 0.8-3V, 3.3V reicht)
1. Strom fließt: +12V → Widerstand → LED → Drain → Source → GND
1. LED leuchtet
1. GPIO auf 0V → 2N7000 sperrt → LED aus

### Warum N-Channel MOSFET statt NPN?

- 2N7000: Gate-Strom ≈ 0 (MOSFET). RPi GPIO liefert maximal 16mA — kein Problem.
- NPN (z.B. BC547): Basis-Strom nötig, braucht Basis-Widerstand, mehr Teile.
- 2N7000 ist einfacher und kostet €0.05.

-----

## Stückliste (aus vorhandenen Teilen)

| Teil                  | Anzahl         | Quelle                                 | Status         |
|-----------------------|----------------|----------------------------------------|----------------|
| LED 5mm Rot           | 1              | LED Kit (bestellt)                     | ✅ kommt morgen |
| LED 5mm Gelb          | 1              | LED Kit                                | ✅              |
| LED 5mm Grün          | 1              | LED Kit                                | ✅              |
| 2N7000 N-MOSFET       | 3 (+2 Reserve) | Makerspace fragen / Bestand            | ❓              |
| Widerstand 510Ω       | 3              | Makerspace / LED Kit enthält oft welche| ❓              |
| Perfboard 30×70mm     | 1              | Makerspace                             | ❓              |
| Jumper-Kabel (female) | 6              | Makerspace                             | ❓              |
| Pinheader (male)      | 1 Leiste       | Makerspace                             | ❓              |

### Was wenn 2N7000 nicht da ist?

Alternativen im Makerspace:

1. **BS170** — Pin-kompatibel, gleiche Spezifikation. Drop-in.
1. **IRLZ44N** — Overkill (47A statt 200mA) aber funktioniert.
1. **BC547 + 1kΩ Basis-Widerstand** — NPN-Alternative, braucht 3 extra Widerstände.
1. **Direkt von GPIO** — NICHT EMPFOHLEN. 3.3V reicht nicht für 12V-LEDs. Nur als Notfall mit 3.3V-LEDs.

### Was wenn 510Ω nicht da?

LED Vorwiderstand = (V_supply - V_forward) / I_target

| LED   | V_forward | I_target | R bei 12V | Nächster E24-Wert |
|-------|-----------|----------|-----------|-------------------|
| Rot   | 2.0V      | 20mA     | 500Ω      | 510Ω              |
| Gelb  | 2.1V      | 20mA     | 495Ω      | 510Ω              |
| Grün  | 3.2V      | 20mA     | 440Ω      | 470Ω              |

Alles zwischen 330Ω und 680Ω funktioniert. Heller bzw. dunkler, aber nichts brennt durch.

-----

## Layout auf Perfboard (30×70mm)

```
    ┌──────────────────────────────┐
    │  [R]  [Y]  [G]              │  ← LEDs oben (sichtbar)
    │   │    │    │                │
    │  510  510  510               │  ← Widerstände
    │   │    │    │                │
    │  Q1   Q2   Q3               │  ← 2N7000 MOSFETs
    │  │G│  │G│  │G│              │
    │   │    │    │                │
    │  ─┴────┴────┴── GND-Rail    │  ← Masse-Schiene
    │                              │
    │  [PIN HEADER: GND 17 27 22] │  ← Anschluss an RPi
    └──────────────────────────────┘
```

### Montagepunkte

- 2× M2.5 Löcher in den Ecken (passend zu Standoffs die bestellt sind)
- Befestigung auf RPi CM4 Carrier Board oder direkt im Peli-Case

-----

## Lötanleitung (30 min)

1. Widerstände einlöten (R1-R3)
1. 2N7000 einlöten (Flache Seite = Beschriftung nach vorne. Links=Source, Mitte=Gate, Rechts=Drain)
1. LEDs einlöten (langes Bein = Anode = +12V Seite)
1. GND-Rail durchverbinden
1. Pin-Header einlöten
1. Jumper-Kabel: GND → RPi GND, GPIO 17/27/22 → Gate Q1/Q2/Q3
1. +12V von Batterie an Widerstand-Oberseite

### Test ohne RPi

12V Labornetzteil (Makerspace hat eins) + Jumper von Gate direkt auf 3.3V (RPi 3.3V Pin oder Labornetzteil zweiter Kanal). LED muss leuchten.

-----

## /woz's Anmerkung

Thermal Pad unter den MOSFETs ist nicht nötig — bei 20mA dissipiert jeder 2N7000 weniger als 1mW. Handwarm wird hier nichts.

## /linus's Anmerkung

GPIO 17, 27, 22 sind verifiziert: kein Konflikt mit UART (14/15), I2C (2/3), oder 1-Wire (4). Alle auf BCM-Nummerierung. `pigpio` addressiert BCM direkt.

-----

## Kosten: ~€0.50 (wenn 2N7000 im Makerspace vorhanden)
## Zeitaufwand: 30 min löten + 10 min testen
## Abhängigkeit: LED Kit muss angekommen sein
## Ermöglicht: Pod Demo (03), weil LEDs funktionieren
