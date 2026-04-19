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

## ⚠️ KRITISCHER BEFUND — bitte morgen früh ZUERST lesen

Die 29 "MERGED" Quest-PRs sind **STACKED PRs** mit `base != main`:

- PR #313: base=`feat/sprint-63`, head=`feat/sprint-64` — wurde in feat/sprint-63 gemerged, NICHT in main
- PR #374: base=`feat/quests-runde-51-s91`, head=`feat/quests-runde-52-s92`
- usw. für alle 29 Quest-PRs

**Konsequenz**: Die Merges sind technisch erfolgt, aber **Quest-Content ist NICHT auf main**.
`src/world/quests.js` auf main ist immer noch bei **196 Quests, Runde 19**
(letzter echter main-PR war #307 "Runde 13-19 (70 neue Quests)" vom April).

**Nur diese 3 PRs landeten echt auf main:**
- #377 (Audio: Insel-Musik durchgehend)
- #378 (Audio: Element-Tonlängen)
- #379 (Docs: Tracking-Docs)

## Endstand 2026-04-19 22:42 GMT

- **3 PRs echt auf main** (Audio + Docs)
- **29 PRs in Stack-Branches gemerged** (Content liegt in Intermediate-Branches, nicht in main)
- **11 PRs offen** (DIRTY — die "Bottom-of-Stack" PRs die main bräuchten)
  - 6 mit `base=main` aber CONFLICTING: #380 #314 #312 #311 #310 #309 #308
  - 5 mit `base=feat/quests-runde-XX` (Stack-Tip ohne Boden): #367 #345 #341 #340 #339

## Empfehlung Triage morgen

**Stop Merge-Cascading.** Die Stacked-PR-Strategie produziert Phantom-Merges
ohne Effekt auf main. Stattdessen:

1. **Cherry-Pick statt Stack-Merge.** Quest-Content aus den intermediären
   Branches direkt in einen neuen `consolidate/quests-runde-20-68` Branch
   gegen main cherry-picken. Eine konsolidierte PR.
2. **Stack-PRs schließen.** Alle 29 "merged" PRs sind funktional dead-ends.
   Ihre Branches existieren noch — können als Source für Cherry-Picks dienen.
3. **Bottom-Stack-PRs (#308-#314)**: Inhalte vermutlich veraltet. Prüfen ob
   die Quest-Strings schon im consolidate-Branch sind, sonst dazu nehmen.
4. **#380 (Runde 68)**: Aktuell, base=main aber DIRTY → in den consolidate-
   Branch ziehen.
5. **Phantom-Duplikate (#339-#367)**: Gleiche Runden-Nummern wie andere PRs →
   zu Vergleichszwecken behalten, in consolidate die ältere Version wählen
   (oder die mit besserer Story).

## Lessons learned (für ops/MEMORY.md)

- `gh pr merge` macht keinen Check ob `base == main` — silent stack-merge.
- Massen-Merge nur wenn alle PRs `base=main` haben. Vorher prüfen!
- Stacked PRs brauchen Bottom-up Merge, nicht Top-down. Oder noch besser:
  Konsolidieren statt Stacken.
