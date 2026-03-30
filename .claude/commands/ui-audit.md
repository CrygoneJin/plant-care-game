---
description: "UI prüfen: 10 Prinzipien + WCAG AA + Hick's Law + Responsive (Watch→8K)"
---

# /ui-audit — Dieter Rams prüft die Oberfläche

*Weniger, aber besser.*

## Before you start

Read these files:
- `docs/STORY.md` — Design-Prinzipien & Tonalität
- `docs/USERS.md` — Schnipsel (8 Jahre), Geräte (4K, MacBook 2013, iPhone SE)
- `index.html` — DOM-Struktur
- `style.css` — Styling, Themes, Responsive

---

## Was dieser Skill tut

Prüft die gesamte UI gegen drei Regelwerke:

1. **Rams' 10 Prinzipien** — Ist es gut?
2. **WCAG AA** — Ist es zugänglich?
3. **Hick's Law** — Ist es einfach?

Ergebnis: Ein Audit-Report mit konkreten Befunden und Fixes.

---

## Audit-Checkliste

### 1. Rams' 10 Prinzipien

Für jedes sichtbare UI-Element (Toolbar, Palette, Sidebar, Dialoge, Chat):

| # | Prinzip | Prüffrage | Methode |
|---|---------|-----------|---------|
| 1 | Innovativ | Löst es ein echtes Problem? | Lies BACKLOG — gibt es einen User-Request? |
| 2 | Nützlich | Kann Schnipsel damit bauen? | Wenn nein → Kandidat zum Entfernen |
| 3 | Ästhetisch | Stört es das Gesamtbild? | Visueller Check: Farben, Abstände, Hierarchie |
| 4 | Verständlich | Versteht ein 8-Jähriger es in 1 Blick? | Emoji + Label ausreichend? |
| 5 | Unaufdringlich | Steht es dem Bauen im Weg? | Canvas-Fläche vs. UI-Fläche messen |
| 6 | Ehrlich | Keine falschen Affordances? | Sieht ein Button aus wie ein Button? |
| 7 | Langlebig | Trend oder zeitlos? | CSS Custom Properties statt hardcoded? |
| 8 | Durchdacht | Alle Zustände abgedeckt? | Loading, Error, Empty, Success, Disabled |
| 9 | Umweltfreundlich | Performant? | CSS-Animationen statt JS? Repaints minimiert? |
| 10 | Wenig Design | Kann etwas weg? | Jedes Element rechtfertigen oder streichen |

### 2. WCAG AA Prüfung

| Check | Was | Wie |
|-------|-----|-----|
| **Kontrast** | Text auf Hintergrund ≥ 4.5:1 | CSS Custom Properties gegen Themes prüfen |
| **Touch-Targets** | Min 44×44px (besser 48×48px für Kinder) | `.tool-btn`, `.material-btn`, `.sidebar-tab` messen |
| **ARIA** | Alle interaktiven Elemente gelabelt | `role`, `aria-label`, `aria-modal` zählen |
| **Keyboard** | Tab-Reihenfolge logisch, Escape schließt Dialoge | `tabindex`, `keydown`-Handler prüfen |
| **Farbe** | Nicht einziger Indikator | 🔒 Lock-Emoji → hat es auch Text-Alternative? |
| **aria-live** | Dynamische Inhalte angekündigt | Toast, Achievements, Quest-Updates |
| **Focus** | Sichtbarer Focus-Ring | `:focus-visible` in CSS? |

### 3. Hick's Law Check

| Screen | Max. Optionen | Aktuell | Hick-Alarm |
|--------|--------------|---------|------------|
| Toolbar | ≤7 Gruppen | Zählen | >7 = gruppieren |
| Palette | ≤7 sichtbar | Zählen (inkl. locked) | >7 = Tabs/Scroll |
| Sidebar | ≤4 Tabs | 4 | ✅ OK wenn ≤4 |
| Dialoge | ≤3 Actions | Zählen | >3 = vereinfachen |
| Chat | ≤1 Eingabe | 1 Input + 1 Send | ✅ OK |

### 4. Responsive Breakpoints — Von Watch bis 8K

Jedes Layout muss auf ALLEN Stufen funktionieren. Kein Gerät ist Edge-Case.

| Stufe | Viewport | Gerät | Grid | Layout | Touch-Target |
|-------|----------|-------|------|--------|-------------|
| **XS** | <272px | Apple Watch Ultra | 8×12 | Nur Canvas + 1 FAB | 64px min |
| **S** | 272–414px | iPhone SE, kleine Androids | 18×28 portrait | Canvas oben, Palette horizontal scroll, kein Sidebar | 48px |
| **M** | 414–768px | iPhone Pro Max, iPad Mini | 24×24 | Canvas + Palette links, Chat als Sheet | 48px |
| **L** | 768–1280px | iPad, Laptops | 28×21 | Canvas + Palette + Sidebar | 44px |
| **XL** | 1280–2560px | Desktop, 27" 4K | 32×18 | Vollansicht, alle Panels | 44px |
| **XXL** | 2560–3840px | 4K Monitore | 48×27 | Mehr Grid, größere Emojis | 44px |
| **XXXL** | 3840–7680px | 8K Displays, 60" TVs | 64×36 | Kino-Modus: Canvas zentriert, Panels als Overlays | 64px (Fernbedienung) |

**Aspect-Ratio-Logik (statt Pixel-Breakpoints):**

```
portrait  (< 1.0)  → Canvas oben, alles darunter stacken
square    (1.0–1.3) → Canvas links, Sidebar rechts, Palette unten
landscape (1.3–1.8) → Standard 3-Spalten (Palette | Canvas | Sidebar)
ultra-wide (> 1.8)  → Canvas zentriert, Panels schweben links/rechts
```

**Prüfpunkte pro Stufe:**
- [ ] Canvas skaliert sauber (kein Pixel-Matsch, kein Overflow)
- [ ] Palette erreichbar (nicht abgeschnitten, nicht versteckt)
- [ ] Toolbar bricht nicht (Gruppen wrappen oder collapsieren)
- [ ] Chat nicht über Canvas (Sheet/Sidebar, nie Overlay auf Canvas)
- [ ] Emojis lesbar (min 16px bei XS, skaliert proportional)
- [ ] Touch-Targets eingehalten (Tabelle oben)
- [ ] Kein horizontaler Scroll auf der Hauptseite

---

## Output-Format

```markdown
# 🔍 Rams UI-Audit — [Datum]

## Zusammenfassung
- Prinzipien: X/10 bestanden
- WCAG AA: X/7 bestanden
- Hick: X/5 Screens OK

## Befunde

### 🔴 Kritisch (Fix sofort)
[Konkrete Zeile, konkreter Fix]

### 🟡 Verbesserung (Fix diese Woche)
[Konkrete Zeile, konkreter Fix]

### 🟢 Gut (kein Fix nötig)
[Was funktioniert und warum]

## Rams-Urteil
[Ein Satz. Weniger ist mehr.]
```

---

## Regeln

- **Messen, nicht meinen.** Pixel zählen, nicht "fühlt sich zu eng an."
- **Konkret, nicht abstrakt.** "Zeile 52: Button 32×32px, muss 48×48px" statt "Buttons könnten größer sein."
- **Streichen > Hinzufügen.** Wenn du einen Fix vorschlägst der etwas hinzufügt, begründe warum Entfernen nicht reicht.
- **Ein 8-Jähriger ist der Test.** Nicht du. Nicht der Vater. Schnipsel.
