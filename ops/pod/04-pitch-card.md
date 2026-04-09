# 04 — Pitch Card: Was du in die Hand drückst

## Owner: /ogilvy (copy) + /rams (design) + /jobs (final cut)

## Format: Visitenkarte 85×55mm

## Prerequisite: Drucker im Makerspace (oder zuhause vorher drucken)

-----

## Warum physisch?

Digitale Links vergisst man. QR-Codes scannt man auf Parties nicht. Eine Karte bleibt in der Hosentasche. Morgen früh findet man sie beim Schlüssel-Suchen und denkt: "Achja, die gelbe Box."

-----

## Layout

### Vorderseite (Safran #C17E0D auf Weiß)

```
┌─────────────────────────────────┐
│                                 │
│           器 qì                 │
│            Pod                  │
│                                 │
│     ●  ●  ●                     │
│    rot gelb grün                │
│                                 │
│                                 │
└─────────────────────────────────┘
```

- 器 qì in Safran, 24pt
- Pod in Schwarz, 18pt, bold
- Drei Kreise: ● rot ● gelb ● grün (echte Farben, 8pt)
- Sonst: nichts. Weißraum ist die Botschaft.

### Rückseite (Schwarz auf Weiß)

```
┌─────────────────────────────────┐
│                                 │
│  Pod gibt dir Zeit zurück.      │
│                                 │
│  398€. Kein Glas.               │
│  Kein Gesicht. Kein Bullshit.   │
│                                 │
│  schatzinsel.app                │
│                                 │
└─────────────────────────────────┘
```

- Pitch in 11pt, linksbündig
- URL in Safran, 10pt
- Kein Name, keine Email, keine Telefonnummer
- Die Karte gehört Pod, nicht Till

-----

## Druckhinweise

### Option A: Makerspace-Drucker

- A4 Papier, 10 Karten pro Blatt
- Schneidemaschine oder Cutter + Lineal
- 160g/m² Papier wenn vorhanden (Kopierpapier geht auch)

### Option B: Zuhause vorher

- Gleich, aber in Ruhe schneiden

### Option C: Handgeschrieben

- Wenn kein Drucker: 器 qì + Pod + schatzinsel.app auf leere Visitenkarten
- Handschrift ist ehrlicher als Druck

-----

## Druckvorlage (10 Karten pro A4)

```html
<!DOCTYPE html>
<html>
<head>
<style>
  @page { margin: 10mm; }
  body { font-family: Arial, sans-serif; }
  .card {
    width: 85mm; height: 55mm;
    border: 0.5pt solid #ccc;
    display: inline-block;
    margin: 2mm;
    padding: 8mm;
    box-sizing: border-box;
    vertical-align: top;
    page-break-inside: avoid;
  }
  .front .qi  { color: #C17E0D; font-size: 24pt; text-align: center; margin-top: 4mm; }
  .front .pod { font-size: 18pt; font-weight: bold; text-align: center; }
  .front .dots { text-align: center; font-size: 14pt; margin-top: 6mm; }
  .front .dot-r { color: #CC0000; }
  .front .dot-y { color: #C17E0D; }
  .front .dot-g { color: #228B22; }
  .back { font-size: 9pt; line-height: 1.5; }
  .back .url { color: #C17E0D; margin-top: 4mm; }
</style>
</head>
<body>
  <div class="card front">
    <div class="qi">器 qì</div>
    <div class="pod">Pod</div>
    <div class="dots">
      <span class="dot-r">●</span>&nbsp;
      <span class="dot-y">●</span>&nbsp;
      <span class="dot-g">●</span>
    </div>
  </div>

  <div class="card back">
    <p><strong>Pod gibt dir Zeit zurück.</strong></p>
    <p>398€. Kein Glas.<br>
    Kein Gesicht. Kein Bullshit.</p>
    <p class="url">schatzinsel.app</p>
  </div>
</body>
</html>
```

-----

## Wie viele drucken?

10 Stück reichen. Auf einer LAN-Party interessieren sich maximal 3-5 Leute. Rest ist Reserve für Makerspace-Aushang, Patrick, und den nächsten Zufallskontakt.

-----

## /jobs's Regel

Wenn du mehr als 5 Karten an einem Abend verteilst, verteilst du zu viele. Jede Karte muss verdient sein — nur an Leute die gefragt haben.

## /ogilvy's Anmerkung

Kein Name auf der Karte. Kein "Till, KSB SupremeServ." Das ist keine Selbstdarstellung. Das ist ein Produkt. Wer Till finden will, geht auf schatzinsel.app.

-----

## Kosten: ~€0.50 (Papier + Druck)
## Zeitaufwand: 15 min drucken + schneiden
## Abhängigkeit: Drucker (Makerspace oder zuhause)
## Ermöglicht: PhD One-Pager (05) hat einen Vorboten
