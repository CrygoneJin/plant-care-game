# Nutzer & Stakeholder

## Primärer Nutzer: Schnipsel

| Feld               | Wert                          |
|--------------------|-------------------------------|
| Name               | Schnipsel                     |
| Alter              | 8 Jahre                       |
| Sprache            | Deutsch (Muttersprache)       |
| Traumberuf         | Architekt                     |
| Lieblings-YouTuber | Paluten (Simulator-Spiele)    |

### Interessen (nach Begeisterung sortiert)

1. **Bauen & Konstruieren** -- Häuser, Türme, alles was man zusammensetzen kann
2. **Pflanzen** -- findet Bäume, Blumen und Gärten faszinierend
3. **Holz** -- das Lieblings-Baumaterial, weil es "echt" ist
4. **Basteln & Werken** -- mit den Händen etwas erschaffen
5. **Simulator-Spiele** -- wie Paluten sie spielt: lustig, bunt, ein bisschen chaotisch

### Lieblings-Figuren

- **SpongeBob Schwammkopf** -- kennt alle Folgen
- **Die Sendung mit dem Elefanten** -- der blaue Elefant, die Maus, die Ente
- **Das Neinhorn** -- das freche Einhorn aus dem Kinderbuch
- **Loisach Marci** -- mag die Musik

### Wie Schnipsel spielt

- **Entdecker-Typ**: will sofort loslegen, nicht lange Anleitungen lesen
- **Kreativ**: baut lieber frei als nach Vorgabe
- **Stolz auf Ergebnisse**: will sehen, was er geschafft hat (Statistiken, Fortschritt)
- **Kurze Aufmerksamkeitsspanne**: Feedback muss sofort kommen
- **Mag Humor**: findet es lustig, wenn Figuren freche Sprüche sagen

### Zitate (O-Ton Schnipsel)

> "Architekt ist einfach ein cooler Beruf."
> "Du sagst immer warum warum warum -- ich will einfach bauen!"

### Design-Implikationen

- Große Klickflächen (min. 48px), Emojis statt Text wo möglich
- Deutsche Labels, kurze Wörter, kein Tippen nötig zum Spielen
- Touch-Support, kein Login, kein Account, keine Werbung
- **Nicht belehren, nicht ausfragen, feiern statt bewerten**
- **Paluten-Ton**: Ein bisschen lustig, ein bisschen übertrieben, nie langweilig

---

## Stakeholder: Die Familie

| Wer | Rolle | Einfluss auf das Projekt |
|-----|-------|--------------------------|
| **Papa** (Entwickler) | Baut das Spiel, automatisiert alles | Technische Entscheidungen, Sessions zwischen Kindern und Gartenarbeit |
| **Mama** (Lehrerin) | Quality Gate, Zeitwächterin | Sagt wann Feierabend ist. Hat immer recht. Erkennt pädagogischen Wert (oder Unsinn). |
| **Schwester** | Mittesterin, Meinungsgeberin | Wird das Spiel auch spielen. Andere Perspektive als Schnipsel. |
| **Bruder** | Mitttester, Chaosagent | Drückt alle Buttons gleichzeitig. Bester QA-Tester. |

---

## Infrastruktur

| Komponente | Spec |
|------------|------|
| **Rechner** | Mac Mini M4 |
| **Speicher** | 256 GB |
| **Display** | 27" 4K Monitor |
| **Maus** | Kaputt. Seit Wochen. Wird irgendwann repariert. |
| **Tastatur** | Alt und dreckig. Funktioniert aber. |
| **Entwicklung** | Claude Code CLI + LiteLLM/Langdock Proxy |
| **Deployment** | GitHub Pages |

### Spielgeräte (darauf wird gezockt)

| Gerät | Display | Wer | Hinweise |
|-------|---------|-----|----------|
| Mac Mini M4 + 27" 4K | 3840x2160 | Schnipsel, Familie | Hauptgerät, Maus+Tastatur |
| MacBook Pro 13" (2013) | 2560x1600 | Schnipsel, Testgerät | macOS Monterey (gepatcht), älterer Browser, Trackpad |
| iPhone SE | 4.7" (750x1334) | Tochter | Winziger Bildschirm! Touch only. |

### KI-Ökosystem im Haushalt

| Gerät | KI | Nutzer |
|-------|----|--------|
| Papas iPhone | Gemini (Spracheingabe) | Papa diktiert Denglisch |
| Mamas iPhone | ChatGPT | Mama fragt praktische Dinge |
| Mac Mini | Claude Code CLI | Papa codet |

**Wichtig**: Input kommt oft per Spracheingabe -- Transkriptionsfehler,
Kindersprache, Denglisch und Hintergrundlärm sind normal. Claude Code
muss mit fragmentiertem, bilingualem Input klarkommen.

### Design-Implikationen der Spielgeräte

- **4K 27"**: Canvas muss scharf skalieren, kein Pixel-Matsch
- **MacBook 2013**: Ältere GPU, Safari 16 -- keine fancy CSS-Features. Performance zählt.
- **iPhone SE**: Layout MUSS stacken (Palette oben, Canvas darunter). Sidebar geht nicht. Buttons extra groß.
- **Alle drei**: Touch + Maus/Trackpad müssen funktionieren

### Design-Implikationen

- **4K Display**: Spiel muss auf 3840x2160 gut aussehen -- keine pixeligen Elemente, Canvas skaliert sauber
- **Mac Mini M4**: Mehr als genug Power, keine Performance-Sorgen
- **256 GB**: Kein Platz für aufgeblähte node_modules -- Vanilla JS war die richtige Entscheidung
- **Auch genutzt auf**: iPad/iPhone (Touch-Support wichtig)

### Entwickler-Workflow

```
Papa hat 30-Minuten-Fenster zwischen:
  - Gartenarbeit
  - Haus reparieren
  - Kinder bespaßen
  - Frau überzeugen dass "nur noch 5 Minuten" stimmt

Ergo:
  - Sessions müssen schnell starten (CLAUDE.md = sofort Kontext)
  - Commits müssen häufig sein (Stecker wird gezogen)
  - Code muss ohne Build-Tools laufen (kein "npm install" nach 3 Wochen Pause)
```

Siehe `docs/BEST-PRACTICES.md` für die vollständigen Entwickler-Regeln.
