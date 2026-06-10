# Nested Loop — Issue Watcher + Development Cycle

## Architektúra

```
╔══════════════════════════════════════════════════════════════╗
║  OUTER LOOP — Issue Watcher                                 ║
║  Trigger: van nyitott bug issue                             ║
║  Kilépés: nincs több issue                                  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │  INNER LOOP — Development Cycle (Karpathy-módszer)    │ ║
║  │  Trigger: teszt piros VAGY coverage < 95%             │ ║
║  │  Kilépés: teszt zöld ÉS coverage ≥ 95%               │ ║
║  │  Scoring: coverage % (folytonos, numerikus)           │ ║
║  │                                                        │ ║
║  │  ┌──────────────────────────────────────────────────┐ │ ║
║  │  │  MICRO LOOP — Code Review                       │ │ ║
║  │  │  Trigger: van finding                            │ │ ║
║  │  │  Kilépés: 0 finding                              │ │ ║
║  │  └──────────────────────────────────────────────────┘ │ ║
║  └────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════╝
```

## Használat

```bash
cd /Users/fodizoltan/Projects/loop-demo
claude
```

Aztán:

````
/loop Te egy autonóm fejlesztő agent vagy aki GitHub issue-kat old meg teljes minőségbiztosítással.

═══════════════════════════════════════════════
OUTER LOOP — Issue Watcher
═══════════════════════════════════════════════

1. SCAN: Listázd az open bug issue-kat (gh issue list --state open --label bug).
   Ha nincs feldolgozatlan issue → fejezd be a loop-ot, ne ütemezz újabb wakeup-ot.

2. PICK: Válaszd a legrégebbi (legkisebb számú) issue-t.
   Olvasd el részletesen (gh issue view {szám}).

3. BRANCH: git checkout -b fix/issue-{szám}

═══════════════════════════════════════════════
INNER LOOP — Development Cycle
═══════════════════════════════════════════════

Ez a belső loop addig fut, amíg MINDKÉT feltétel nem teljesül:
  ✅ npm test — minden teszt zöld
  ✅ npm run coverage — overall coverage ≥ 95%

Minden inner iterációban:

  a) MÉRÉS: Futtasd npm test és npm run coverage.
     Olvasd ki a __COVERAGE_JSON__ sort.

  b) DIAGNÓZIS: Mi hiányzik?
     - Ha teszt PIROS → a forráskód hibás, javítsd a src/*.js fájlokat (NE a teszteket)
     - Ha coverage < 95% → nézd meg melyik fájlnál alacsony és mely sorok nincsenek lefedve
       (az uncovered lines mező megmondja) → írj teszteket ezekre az ágakra
     - Ha mindkettő → először javítsd a hibát, aztán növeld a coverage-et

  c) IMPLEMENTÁCIÓ: Végezd el a szükséges változtatást. Egy iterációban EGY dolgot csinálj:
     vagy egy bug fix, vagy tesztek egy specifikus endpoint-ra.

  d) ELLENŐRZÉS: Futtasd újra npm test + npm run coverage.
     - Ha javult ÉS tesztek zöldek → jegyezd meg az új coverage-et, folytasd
     - Ha romlott vagy tesztek eltörtek → git checkout-tal dobd el és próbálj mást

  e) KILÉPÉS: Ha npm test zöld ÉS coverage ≥ 95% → lépj ki az inner loop-ból.
     Maximum 10 iteráció — ha addigra sem sikerül, állj le és jelezd mi a probléma.

═══════════════════════════════════════════════
MICRO LOOP — Code Review
═══════════════════════════════════════════════

Mielőtt PR-t nyitsz, nézd át a saját munkádat (git diff master...HEAD):

  - A javítás a root cause-t kezeli?
  - Nem vezet be új bugot?
  - A tesztek tényleg az issue-ban leírt problémát tesztelik?
  - Nincs felesleges változtatás?

Ha találsz problémát → javítsd → nézd át újra.
Ismételd amíg nincs finding.

═══════════════════════════════════════════════
LEZÁRÁS
═══════════════════════════════════════════════

4. COMMIT: Commitold a változtatásokat értelmes üzenettel.

5. PUSH + PR: Push-old és nyiss PR-t:
   - Title: rövid, lényegretörő
   - Body: hivatkozd az issue-t ("Fixes #N")
   - Írd bele a coverage változást (X% → Y%)
   NE merge-elj automatikusan.

6. KÖVETKEZŐ: Vissza az OUTER LOOP 1. lépésére.
````

## Scoring Functions összesítés

| Loop szint | Scoring | Típus | Kilépés |
|---|---|---|---|
| Outer | `gh issue list` count | Diszkrét (van/nincs) | 0 nyitott issue |
| Inner | `npm run coverage` → `__COVERAGE_JSON__` | Folytonos (%) | ≥ 95% ÉS tesztek zöldek |
| Micro | Code review finding count | Diszkrét (van/nincs) | 0 finding |
