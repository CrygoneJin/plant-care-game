# Energie vs Geld — Visuelles Konzept

**Backlog #100** · Designer: Dieter Rams · Stand: 2026-04-03

---

## Zwei Systeme, zwei Orte

| | NPC-Energie | Muscheln |
|---|---|---|
| **Was** | Chat-Budget pro NPC (Burger, Noten, Glut) | Handelswährung |
| **Metapher** | Batterie — leer = NPC schlaeft | Geldbeutel — leer = kann nichts kaufen |
| **Wo** | Im Chat-Fenster, direkt unter dem NPC-Namen | Im Inventar-Tab + Krabbs-Shop |
| **Wann sichtbar** | Nur wenn Chat offen ist | Immer im Inventar sichtbar |

---

## Energie: Batterie-Balken im Chat

```
+------------------------------+
| SpongeBob               [x]  |
| ========....  6/10 Burger     |  <-- Balken, NPC-Farbe
|                               |
|  Nachrichten ...              |
```

- **Position:** Direkt unter Chat-Header, ueber den Nachrichten. Bleibt wo es ist.
- **Form:** Horizontaler Balken, gefuellt in NPC-Eigenfarbe (gelb fuer SpongeBob, grau fuer Elefant, rot fuer Mephisto).
- **Label:** `{emoji} {Anzahl}/{Max} {Unit}` — z.B. `Burger-Emoji 6/10 Burger`
- **Leer-Zustand:** Balken grau, Text: `Keine Burger mehr! Schliess eine Quest ab!`
- **Kein Zahlenwert in Tokens.** Immer die NPC-Waehrung. Oscar sieht Burger, nicht 1200/2000.

**Warum Balken:** Ein 8-Jaehriger versteht "halb voll" schneller als "1247/2000". Der Balken ist die Tankanzeige. Das Auto faehrt nicht mehr wenn leer.

---

## Muscheln: Geldbeutel im Inventar

```
+- Inventar --------------------+
|                               |
|  Muschel 12 / 42             |  <-- Muschel-Zaehler, eigene Zeile
|  ---------------------------  |
|  Holz x4   Stein x7   Feuer x2  |
|  Blume x3  Glas x1    Tuer x2   |
```

- **Position:** Ganz oben im Inventar-Tab, vor allen Materialien. Visuell abgetrennt.
- **Form:** Grosse Zahl mit Muschel-Emoji. Kein Balken — Geld ist eine Zahl, keine Batterie.
- **Touch-Target:** Die Muschel-Zeile ist tippbar (min 48px hoch) und oeffnet das Krabben-Kontor.
- **Cap-Warnung:** Ab 38/42 wird die Zahl orange. Bei 42/42 rot + Pulsieren.

---

## Trennungsregel

> Energie-Anzeigen erscheinen **nur im Chat**.
> Muscheln erscheinen **nur im Inventar und Shop**.
> Nirgendwo stehen beide nebeneinander.

Das ist die Kernregel. Wenn Oscar Burger sieht, ist er im Gespraech. Wenn er Muscheln sieht, ist er beim Handeln. Zwei Kontexte, zwei Orte, null Verwechslung.

---

## Safe Area & Touch (Apple HIG)

- Energie-Balken: volle Breite des Chat-Fensters, 48px Hoehe, `padding-top: env(safe-area-inset-top)` wenn Chat im Vollbild.
- Muschel-Zeile im Inventar: 48px Mindesthoehe, Tap-Target fuer Kontor-Shortcut.
- Beide Elemente respektieren `dvh` fuer iPad-Viewport.
