# Merge-Marathon 2026-04-19/20 (Nacht-Sprint N1)

**Start**: 2026-04-19 ~22:00 GMT
**Ziel**: Backlog clearance bis 2026-04-20 06:00 GMT
**Owner**: Leader (autonomous)

## Ausgangslage
- 57 PRs CLEAN, 6 DIRTY, 6 UNKNOWN (insgesamt 69 offen)
- Quest-PRs editieren alle `src/world/quests.js + ops/MEMORY.md + ops/SPRINT.md`
  → Cascade-Konflikt nach jedem Merge erwartet
- Phantom-Branches (Runde 62-67, sprint-60..64) NICHT löschen ohne Freigabe

## Strategie
1. Audio-PRs (#377, #378) zuerst — eigenständig, kein Konflikt mit Quests
2. Quest-PRs in numerischer Reihenfolge versuchen, ab niedrigster
3. Konflikt → skip + protokollieren
4. Branches bleiben stehen für morgen-früh-Triage

## Log

| PR | Branch | Status | Notiz |
|----|--------|--------|-------|
| #313 | feat/sprint-64 | MERGED | clean |
| #315 | feat/sprint-60-runde-20-fresh | MERGED | clean |
| #317 | feat/quests-runde-22 | MERGED | clean |
| #320 | feat/quests-runde-24 | MERGED | clean |
| #322 | feat/quests-runde-26 | MERGED | clean |
| #324 | feat/quests-runde-28 | MERGED | clean |
| #326 | feat/quests-runde-30 | MERGED | clean |
| #328 | feat/quests-runde-32 | MERGED | clean |
| #330 | feat/quests-runde-34 | MERGED | clean |
| #332 | feat/quests-runde-36 | MERGED | clean |
| #335 | feat/quests-runde-38 | MERGED | clean |
| #337 | feat/quests-runde-40 | MERGED | clean |
| #343 | feat/quests-runde-46 | MERGED | clean |
| #346 | feat/quests-runde-49 | MERGED | clean |
| #348 | feat/quests-runde-51 | MERGED | clean |
| #350 | feat/quests-runde-53 | MERGED | clean |
| #352 | feat/quests-runde-55 | MERGED | clean |
| #354 | feat/quests-runde-57 | MERGED | clean |
| #356 | feat/quests-runde-59 | MERGED | clean |
| #358 | feat/quests-runde-61 | MERGED | clean |
| #360 | feat/quests-runde-63 | MERGED | clean |
| #362 | feat/quests-runde-65 | MERGED | clean |
| #364 | feat/quests-runde-67 | MERGED | clean |
| #365 | feat/quests-runde-42-s82 | MERGED | clean |
| #368 | feat/quests-runde-45 | MERGED | clean |
| #370 | feat/quests-runde-48-s88 | MERGED | clean |
| #372 | feat/quests-runde-50-s90 | MERGED | clean |
| #374 | feat/quests-runde-52-s92 | MERGED | clean |
| #375 | feat/quests-runde-48-canonical | MERGED | clean |
| #379 | docs/nacht-sprint-metrics-2026-04-19 | MERGED | clean (Pull-Fail war local-only — Branch-Switch-Konflikt) |

## Endstand 2026-04-19 22:42 GMT

- **31 PRs gemerged** (29 Quest-PRs + 2 Audio-PRs #377/#378 + Docs-PR #379)
- **11 PRs DIRTY** (offen für Triage):
  - #380 (neu, Runde 68 — gerade entstanden während Batch lief)
  - #367 #345 #341 #340 #339 (Phantom-Branches mit Konflikten)
  - #314 #312 #311 #310 #309 #308 (alte Sprint-Branches mit Konflikten)
- **0 PRs FAILED** echt (der eine "FAIL" war local-only nach Branch-Switch)

## Empfehlung Triage morgen

1. Phantom-Branches (#314 #312 #311 #310 #309 #308) — wahrscheinlich obsolet (Quest-Inhalt durch andere Runden bereits eingebaut). Prüfen ob die Quest-IDs schon in main existieren, sonst Cherry-Pick.
2. #380 ist neu und wahrscheinlich aktuell — rebasen + mergen.
3. #367 #345 #341 #340 #339 — gleiche Runden-Nummer wie bereits gemergte → wahrscheinlich Duplikate, schließen.
