# Issue Watcher Loop — ezt írd be Claude Code-ba

## Használat

Nyiss egy terminált ebben a mappában, indítsd el a Claude Code-ot, és írd be:

```
/loop Nézd meg a GitHub issue-kat ezen a repo-n (gh issue list --state open --label bug).

Minden iterációban:

1. KERESÉS: Listázd az open + bug labelű issue-kat. Ha nincs feldolgozatlan issue, fejezd be a loop-ot.

2. KIVÁLASZTÁS: Válaszd ki a legrégebbi (legkisebb számú) nyitott issue-t amit még nem kezeltél ebben a session-ben.

3. MEGÉRTÉS: Olvasd el az issue leírását (gh issue view {szám}). Értsd meg pontosan mi a probléma.

4. BRANCH: Hozz létre és válts egy új branch-re: fix/issue-{szám}

5. REPRODUKCIÓ: Írj egy tesztet ami reprodukálja a bugot — ennek PIROSNAK kell lennie (npm test). Ha a teszt zöld, akkor nem értettük jól a bugot, menj vissza a 3. lépésre.

6. JAVÍTÁS: Javítsd ki a forráskódot (NE a teszteket módosítsd). A javítás legyen minimális és fókuszált.

7. VERIFIKÁCIÓ: Futtasd az összes tesztet (npm test) ÉS a lintet (npm run lint). Mindennek zöldnek kell lennie.

8. CODE REVIEW: Nézd át a saját módosításaidat (git diff). Kérdezd meg magadtól:
   - A javítás tényleg a root cause-t kezeli?
   - Nem törik el más funkció?
   - A teszt tényleg a bugot teszteli, nem valami mást?
   Ha találsz problémát, javítsd és térj vissza a 7. lépésre.

9. COMMIT & PR: Commitolj, push-olj, és nyiss PR-t (gh pr create) az issue referenciával a body-ban. NE merge-elj — az emberi review dolga.

10. KÖVETKEZŐ: Térj vissza az 1. lépésre a következő issue-val.
```

## Fontos megjegyzések

- A loop SAJÁT BRANCH-EN dolgozik — nem piszkál bele a master-be
- Minden issue külön branch-et kap → könnyű review-olni
- A loop NEM merge-el automatikusan → a döntés a fejlesztőé
- Ha elfogytak az issue-k → a loop véget ér (nem pollol feleslegesen)
