# Standardmodell komplett — alle 17 Teilchen gemappt

Datum: 2026-04-22
Branch: `feat/standardmodell-komplett`
Commits: materials + automerge + tests + docs

## Motiv

Oscar (8) soll morgen früh sagen können: „ich kenne alle Teilchen".
Nach S99/S100/S101 fehlten noch: Higgs als spawnbares Material,
Mesonen (Pion/Kaon) und das Positron als eigenes Anti-Teilchen.

## Mapping: Standardmodell → Schatzinsel

### Fermionen (Materie, spin 1/2)

| Standardmodell        | Schatzinsel-Material | Emoji | Art     |
|-----------------------|----------------------|-------|---------|
| Up-Quark (Gen 1)      | `yang`               | ⚪    | Material |
| Down-Quark (Gen 1)    | `yin`                | ⚫    | Material |
| Charm-Quark (Gen 2)   | `charm`              | 💫    | Material |
| Strange-Quark (Gen 2) | `strange`            | 🌀    | Material |
| Top-Quark (Gen 3)     | `mountain` (Berg)    | 🏔️    | Material |
| Bottom-Quark (Gen 3)  | `cave` (Höhle)       | 🕳️    | Material |
| Elektron (Gen 1)      | `electron`           | 🔹    | Material |
| Myon (Gen 2)          | `muon`               | 🔸    | Material |
| Tau (Gen 3)           | `tau`                | 🔻    | Material |
| e-Neutrino            | `neutrino`           | 👻    | Material |
| μ-Neutrino            | `neutrino_mu`        | 👻    | Material |
| τ-Neutrino            | `neutrino_tau`       | 👻    | Material |

### Bosonen (Kraftteilchen)

| Standardmodell        | Schatzinsel-Material | Emoji | spin | Bemerkung |
|-----------------------|----------------------|-------|------|-----------|
| Photon (γ)            | `photon`             | 💛    | 1    | Masselos |
| W-Boson               | `w_boson`            | 🔀    | 1    | 80 GeV |
| Z-Boson               | `z_boson`            | ⚖️    | 1    | 91 GeV |
| Gluon                 | `qi` (Qi)            | ✨    | 1    | Doppel-Name Dao+Physik |
| Higgs-Boson (neu)     | `higgs_boson`        | 🫧    | 0    | 125 GeV |
| Graviton (hypothet.)  | — (das Grid selbst)  | —     | —    | Raumzeit, kein Material |

### Zusammengesetzte Teilchen (Composites)

| Standardmodell        | Schatzinsel           | Weg          |
|-----------------------|----------------------|--------------|
| Proton (uud)          | `proton` 🔴           | Triplet-Merge |
| Neutron (udd)         | `neutron` ⭕          | Triplet-Merge |
| Pion (neu)            | `pion` 🎯             | Pair-Merge |
| Kaon (neu)            | `kaon` 🪩             | Pair-Merge |
| Positron (neu)        | `positron` 🟠         | Pair-Merge |
| Antimaterie (generisch)| `antimatter` ⚛️      | Pair-Merge |

### Atome (Cluster-Recognizer, nicht via Merge)

| Atom          | Schatzinsel-Cluster           |
|---------------|-------------------------------|
| Wasserstoff H | 1 proton + 1 electron         |
| H⁺ (Ion)      | 1 proton                      |
| Helium-3      | 2 proton + 1 neutron + 2 electron |
| Helium-4      | 2 proton + 2 neutron + 2 electron |

## 17 Teilchen-Check

Das Standardmodell zählt klassisch 17 Elementarteilchen:
- 6 Quarks (up/down/charm/strange/top/bottom) → alle gemappt
- 6 Leptonen (e/μ/τ + 3 Neutrinos) → alle gemappt
- 4 Gauge-Bosonen (γ/W/Z/Gluon) → alle gemappt
- 1 Higgs-Boson → jetzt gemappt (neu in diesem PR)

Anti-Teilchen existieren als generisches `antimatter` + `positron` (neu).
Mesonen (`pion`, `kaon`) sind Composites, kein Teil der 17 — Bonus für Oscar.

## Neue Merge-Regeln

```
mountain + cave        → higgs_boson  (Top+Bottom-Fusion, 125 GeV)
yang + electron        → pion         (leichtestes Meson)
strange + electron     → kaon         (seltsames Meson)
antimatter + electron  → positron     (Dirac 1928)
```

## Scientist-Gate (Kollisions-Check)

Muster aus PR #434 angewandt. Alle vier neuen Regeln kollisionsfrei:

- `mountain×mountain` und `cave×cave` haben keine Pair-Regel → Higgs nicht überschrieben
- `yang+electron` und `strange+electron` waren vorher frei
- `antimatter+electron` war vorher frei (nur `antimatter+yang → electron` existiert)
- `electron+yin → neutrino` steht weiterhin WEITER UNTEN und bleibt unverändert
- Baryon-Triplet (TRIPLET_RULES) läuft VOR Pair-Merges → Proton/Neutron unberührt

Rule-Order-Hinweis: Wenn Oscar Yang+Electron+Yin zusammen setzt, greift die
erste passende Pair-Rule. Pion (yang+electron) steht vor Neutrino (electron+yin),
also gewinnt Pion in dieser Konfiguration. Beabsichtigt: Meson als
Zwischenschritt zur Atom-Bildung erhöht Oscars Entdeckungspfad.

## Tests

- 23 automerge-Tests grün (10 bestehend + 13 neu)
- 44 verwandte Tests grün (atom-recognizer, mass-map, unit)
- `tsc --noEmit` grün (Material-Interface um `spin?` erweitert)
