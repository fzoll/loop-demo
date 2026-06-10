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
║  │                                                        │ ║
║  │  SZABÁLYOK (nem issue-k, hanem quality gate-ek):      │ ║
║  │    • npm test — minden teszt ZÖLD                     │ ║
║  │    • npm run coverage — overall ≥ 95%                 │ ║
║  │    • npm run lint — 0 finding                         │ ║
║  │                                                        │ ║
║  │  Az inner loop addig iterál, amíg MIND A HÁROM        │ ║
║  │  feltétel egyszerre nem teljesül.                     │ ║
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

## A lényeges különbség

A coverage ≥ 95% NEM egy issue amit meg kell oldani — hanem egy **szabály** ami MINDEN
issue megoldására vonatkozik. Ez az inner loop kilépési feltétele.

Ez azt jelenti: ha az issue #1 (DELETE 204 body) megoldásához hozzá kell nyúlni a
server.js-hez, és a server.js-re nincsenek tesztek, akkor az agent KÖTELES teszteket
is írni addig amíg a 95%-os coverage-et el nem éri. Nem azért mert van rá issue,
hanem azért mert ez a quality gate nem engedi ki addig a belső loop-ból.

## Használat

```bash
cd /Users/fodizoltan/Projects/loop-demo
claude
```

Aztán:

````
/loop Te egy autonóm fejlesztő agent vagy aki GitHub issue-kat old meg teljes minőségbiztosítással.

═══════════════════════════════════════════════════
SZABÁLYOK — ezek minden issue-ra érvényesek
═══════════════════════════════════════════════════

Egy issue CSAK AKKOR tekinthető megoldottnak, ha MIND A HÁROM teljesül:
  ✅ npm test — minden teszt zöld (beleértve az újonnan írtakat)
  ✅ npm run coverage — overall line coverage ≥ 95% az ÖSSZES source fájlra
  ✅ npm run lint — 0 finding

Ha bármelyik nem teljesül, NEM léphetsz tovább a PR nyitásra.

═══════════════════════════════════════════════════
OUTER LOOP — Issue Watcher
═══════════════════════════════════════════════════

1. SCAN: Listázd az open bug issue-kat (gh issue list --state open --label bug).
   Ha nincs feldolgozatlan issue → fejezd be a loop-ot, ne ütemezz újabb wakeup-ot.

2. PICK: Válaszd a legrégebbi (legkisebb számú) issue-t.
   Olvasd el részletesen (gh issue view {szám}).

3. BRANCH: git checkout -b fix/issue-{szám}

═══════════════════════════════════════════════════
INNER LOOP — Development Cycle
═══════════════════════════════════════════════════

Ez a belső loop addig fut, amíg a SZABÁLYOK rovatban leírt
HÁROM feltétel egyszerre nem teljesül.

Minden iterációban:

  a) MÉRÉS: Futtasd npm test, npm run coverage, npm run lint.
     Olvasd ki a __COVERAGE_JSON__ sort a coverage outputból.
     Ez a háromszoros ellenőrzés mondja meg, hol állsz.

  b) DIAGNÓZIS: Mi hiányzik az aktuális issue megoldásából ÉS a quality gate-ből?
     - Teszt PIROS → a forráskód hibás, javítsd (NE a teszteket módosítsd)
     - Coverage < 95% → nézd az uncovered lines mezőt → írj teszteket
       azokra a sorokra/ágakra amik nincsenek lefedve
     - Lint hiba → javítsd
     FONTOS: az issue megoldása és a coverage növelés NEM két külön feladat.
     Az issue javításakor írsz hozzá tesztet; ha mellette más sorok is
     fedetlenek, azokra is írsz tesztet. Addig mész amíg 95% felett nem vagy.

  c) IMPLEMENTÁCIÓ: Végezd el a szükséges változtatást.
     Egy iterációban egy fókuszált dolgot csinálj:
     - az issue-hoz tartozó fix, VAGY
     - tesztek egy specifikus, lefedetlen kódrészre

  d) VERIFIKÁCIÓ: Futtasd újra a három ellenőrzést.
     - Ha javult ÉS tesztek zöldek → folytasd
     - Ha romlott vagy eltört valami → dobd el (git checkout) és próbálj mást

  e) KILÉPÉSI FELTÉTEL: A három szabály egyszerre teljesül → kilépés az inner loop-ból.
     Safety limit: max 10 iteráció. Ha addigra sem sikerül, állj le és jelezd.

═══════════════════════════════════════════════════
MICRO LOOP — Code Review
═══════════════════════════════════════════════════

Mielőtt PR-t nyitsz, nézd át a munkádat (git diff master...HEAD):

  - A javítás a root cause-t kezeli, nem tüneti kezelés?
  - Nem vezet be új bugot?
  - A tesztek az issue-ban leírt problémát tesztelik?
  - A coverage tesztek értelmes asserteket tartalmaznak, nem csak hívogatják a kódot?
  - Nincs felesleges változtatás?

Ha bármit találsz → javítsd → nézd át újra. Ismételd amíg 0 finding.

═══════════════════════════════════════════════════
LEZÁRÁS
═══════════════════════════════════════════════════

4. COMMIT: Commitold értelmes üzenettel.

5. PUSH + PR: Push, majd gh pr create:
   - Title: rövid, lényegretörő
   - Body: "Fixes #N", coverage változás (X% → Y%), mit javítottál és miért
   NE merge-elj automatikusan — az emberi review dolga.

6. KÖVETKEZŐ: git checkout master → vissza az OUTER LOOP 1. lépésre.
````

## Scoring Functions összesítés

| Loop szint | Mit mér | Típus | Kilépés |
|---|---|---|---|
| Outer | `gh issue list` count | Diszkrét | 0 nyitott issue |
| Inner | `npm run coverage` % | Folytonos (Karpathy scoring) | ≥ 95% ÉS tesztek zöldek ÉS lint clean |
| Micro | Code review findings | Diszkrét | 0 finding |

## Példa: Issue #1 megoldása a nested loop-pal

```
OUTER: Issue #1 kiválasztva (DELETE 204 body bug)
  │
  ├─ Branch: fix/issue-1
  │
  ├─ INNER 1: Mérés → store.js 100%, server.js: nincs tesztelve
  │   Coverage overall: ~50% (store tesztelve, server nem) ❌
  │   → Javítom a DELETE handler-t (a tényleges bug)
  │   → Írok rá tesztet ami ellenőrzi: 204, üres body, nincs Content-Type
  │
  ├─ INNER 2: Mérés → server.js ~25%, overall ~62% ❌
  │   → Írok teszteket: GET /health, GET /tasks
  │
  ├─ INNER 3: Mérés → server.js ~55%, overall ~75% ❌
  │   → Írok teszteket: POST /tasks (happy path + error cases)
  │
  ├─ INNER 4: Mérés → server.js ~80%, overall ~88% ❌
  │   → Írok teszteket: PATCH toggle, GET /tasks/:id, 404
  │
  ├─ INNER 5: Mérés → server.js ~95%, overall ~97% ✅ Tesztek zöldek ✅ Lint clean ✅
  │   → KILÉPÉS az inner loop-ból
  │
  ├─ MICRO: Review → clean ✅
  │
  └─ PR: "Fix DELETE 204 body, add server integration tests (coverage 50% → 97%)"

OUTER: Issue #2 kiválasztva → fix/issue-2 branch → inner loop indul...
  │
  ├─ INNER 1: Coverage most MÁR ~97% (az előző PR tesztjei benne vannak a master-ben
  │   ha merge-elve lett, vagy a branch-en ha nem)
  │   → Csak a tényleges bug fix + 1-2 specifikus teszt kell
  │   → Gyorsabban kijut az inner loop-ból
  ...
```

Figyeld meg: az első issue megoldása SOKKAL több munkát igényel mint a többi,
mert a quality gate kikényszeríti a hiányzó tesztek megírását. A későbbi issue-knál
a coverage már közel van a 95%-hoz, tehát az inner loop kevesebb iterációval kijön.
Ez a szabály-alapú megközelítés ereje: nem kell külön issue a tesztekre,
mert a rendszer MAGÁTÓL kikényszeríti.
