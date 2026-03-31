# Schnipsels Insel-Architekt

**URL:** schatzinsel.app

**Vision:** "Ausser Text nix gehext" -- Kinder entdecken dass Worte Dinge erschaffen.

## Origin

Ein Vater baut mit KI Dinge fuer seine Kinder. Schnipsel (Oscar, 8) will
Architekt werden und liebt es zu bauen. Also hat Papa ihm eine Insel gebaut
auf der Worte zu Dingen werden.

## Was es ist

Ein browserbasieres Bauspiel. Kein Login, kein Account, keine Werbung.
`index.html` oeffnen -- spielen. Vanilla JS, kein Build-Step, kein Framework.

### Kern-Mechanik: Wu Xing (五行)

Die fuenf Elemente -- Holz, Feuer, Erde, Metall, Wasser -- bilden einen
Kreislauf, kein Inventar. Jedes Element erzeugt das naechste, kontrolliert
ein anderes. Philosophie, nicht Physik.

```
     Holz
    ↗    ↘
Wasser    Feuer
    ↑       ↓
Metall ← Erde
```

Aus den 5 Elementen entstehen durch Crafting (Infinite Craft Pattern) alle
weiteren Materialien. LLM generiert neue Rezepte, KV-Cache macht sie
deterministisch nach der ersten Entdeckung. Wer zuerst entdeckt, steht
am Rezept.

Automerge (wie 2048): Gleiche Materialien nebeneinander verschmelzen
automatisch -- starke Kernkraft als Spielmechanik.

### Zielgruppe

- **Primaer:** Oscar (Schnipsel), 8 Jahre, Spielplatz-Kinder
- **Sekundaer:** Familie (Schwester, Bruder, Mama als Quality Gate)
- **Tertiaer:** Spielplatz-Test (10 Kinder, 5 Hypothesen)

Details zu den Nutzern: `docs/USERS.md`

## Warum es existiert

Weil ein Kind gesagt hat: "Du sagst immer warum warum warum -- ich will
einfach bauen!" Also bauen wir. Mit Worten.
