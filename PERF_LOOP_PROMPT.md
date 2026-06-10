# Performance Optimization Loop (Karpathy-módszer)

## Használat

```bash
cd /Users/fodizoltan/Projects/loop-demo
claude
```

Aztán:

```
/loop Te egy performance-optimalizáló agent vagy. A feladatod a Task API gyorsítása mérhető, bizonyított javításokkal.

Minden iterációban kövesd ezt a ciklust:

## 1. BASELINE MÉRÉS
- Indítsd el a szervert (npm start), futtasd a benchmarkot (npm run bench), állítsd le a szervert
- Olvasd ki a __SCORE_JSON__ sort — ez az aktuális composite score
- Ha ez az első iteráció, jegyezd meg mint baseline

## 2. PROPOSE — Hipotézis
- Olvasd át a forráskódot (src/server.js, src/store.js)
- Azonosíts EGY konkrét optimalizálási lehetőséget
- Fogalmazd meg a hipotézist: "Ha X-et csinálom, Y-nal gyorsabb lesz mert Z"
- Minden iterációban MÁS dolgot próbálj — ne ismételd amit már próbáltál

## 3. IMPLEMENT — Megvalósítás
- Hozz létre VAGY használd a perf/optimizations branch-et
- Implementáld az EGY változtatást (minél kisebb, annál jobb)
- Győződj meg hogy npm test továbbra is zöld — NE törj el funkcionalitást a sebesség oltárán

## 4. EXECUTE — Benchmark
- Indítsd el a szervert, futtasd a benchmarkot, állítsd le
- Olvasd ki az új __SCORE_JSON__ sort

## 5. EVALUATE — Kiértékelés
- Hasonlítsd össze az előző score-ral (compositeAvg és compositeP95)
- JAVULT: compositeAvg legalább 5%-kal alacsonyabb → commitold, ez az új baseline
- NEM JAVULT vagy ROMLOTT → git checkout-tal dobd el a változtatást

## 6. ISMÉTLÉS VAGY LEÁLLÁS
- Ha 3 egymást követő iteráció nem hozott javulást → állj le, nincs több juice
- Ha még van ötleted → vissza az 1. lépésre
- Leálláskor írd ki az összesített eredményt: eredeti baseline vs végső score, % javulás

## Szabályok
- A teszteknek MINDIG zöldnek kell maradniuk
- Egyetlen iterációban egyetlen változtatás (izolált mérés)
- Nem számít optimalizációnak: tesztek törlése, benchmark módosítása, funkció eltávolítása
- A benchmark script (src/benchmark.js) TABU — nem módosítható
```

## Miért Karpathy-módszer ez?

```
Propose → Implement → Execute → Evaluate → Commit/Discard
    ↑                                          │
    └──────────────────────────────────────────┘
         scoring function = benchmark.js
```

A scoring function (benchmark.js) objektív, számszerű visszajelzést ad.
A loop addig iterál, amíg van javulás — majd megáll ha "kiszárad".
Nem vibe coding — minden lépés mérhető és verifikált.
