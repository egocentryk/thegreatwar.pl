# Planned improvements: the four remaining ports from thesecondwar.pl

Four features that thesecondwar.pl has and thegreatwar.pl doesn't yet. Each
section says what the feature is there, what it should be here for the
First World War, what to build, how to fill it, how to check it, and a
rough cost. When one ships, move its notes to `improvements.md` (new
numbered section) and tick it in the checklist there.

The reference implementation for all four is in
`/Users/lukaszskowron/Code/astro/thesecondwar.pl`. Its `seo.md` (§11, §14,
§17) and `roadmap.md` (§1, §2, §4b) describe how each was built there.

Suggested order: **1 → 2 → 3 → 4**. Sources come first: they are the
biggest trust gap, and they feed the other three (places and guides link
to articles, the map links to treaties).

---

## 1. Sources on milestone articles and battle pages

### Where we are

The `sources:` field and the "Źródła / Sources" list exist (`Sources.astro`,
improvements.md §11), but **no timeline article and no battle page has any
sources yet** (0 of 2,624 and 0 of 310). Only the 242 person pages have
them, from their Wikipedia biographies (`scripts/person-sources.mjs`).
thesecondwar.pl recovered sources for 730 pages from writer transcripts.
That isn't possible here, because only 7 transcripts are left.

### What to do

Research sources for the **423 milestones** (262 events, 161 battles), as
thesecondwar.pl did for its 282:

- One agent per batch of about 20 milestones. For each page, fetch 3–5
  sources, of which at least 2 are not Wikipedia. Check the article's key
  facts against them: dates, figures, names, outcome. Then write `sources:`
  (most important first, at most 12, URLs in double quotes).
- Report every fact the sources contradict: file, claim, what the sources
  say. **Don't fix articles in the same pass.** The fixes go on a review list
  first, as in improvements.md §12, §19, §21 and §22.
- **Never list a source from memory or from a search snippet.** Only pages
  that were opened and read count.
- Add `scripts/check-sources.mjs`. It checks that every milestone has at least
  3 sources and at least 2 that aren't Wikipedia, that URLs are valid and
  not duplicated, and that the list has no more than 12.

### Known obstacles

Britannica, IWM, 1914-1918-online, nzhistory and PWN refused automated
reading in the war-numbers research (improvements.md §22). Plan around
them. Use national and official histories (the British Official History,
Reichsarchiv, the Austrian *Österreich-Ungarns letzter Krieg* as digitised),
CWGC, the Australian War Memorial, firstworldwar.com (its certificate had
expired, so retry), the Great War Forum and Polish sources (dzieje.pl, MHP,
IPN, academic journals). Wikipedia in other languages counts as Wikipedia.

### Cost and check

- About 2.5–3M tokens for 423 pages. On thesecondwar.pl, 282 milestones
  cost about 1.7M.
- Check: the checker passes on all 423, and the review list is in
  improvements.md.
- Then the other ~2,500 events, over time or whenever an article is
  revisited (tens of millions of tokens; no deadline).

---

## 2. "Miejsca" — the war on Polish soil, place by place

### On thesecondwar.pl

`/miejsca` and `/miejsca/<slug>` (`PlacesIndex.astro`, `PlacePage.astro`,
`utils/places.ts`, `PlaceLinks.astro`, data `src/data/places.json`,
`places-index.json`, `place-intros.json`, scripts `places-report.mjs`,
`places-index.mjs`). 41 places, each with its articles and battles by
year, people born or died there, and a locator map. Places with fewer than
5 items are `noindex`. Each place has a short intro, PL and EN, every fact
backed by a quote checked by script.

### Here

The Polish lands were a battlefield in 1914–1915 and an occupied country
until 1918. "Kraków w czasie I wojny", "Przemyśl twierdza" and "Gorlice
1915" are things people search for. Likely places, to be confirmed by the
report:

- **Kraków** (the fortress, Kadrówka, NKN, 31 X 1918)
- **Warszawa** (V 1915, the German occupation, the Regency Council, 11 XI)
- **Lwów** (1914 and 1915, XI 1918)
- **Przemyśl** (two sieges)
- **Łódź** (the battle, the occupation)
- **Kalisz** (destroyed in VIII 1914)
- **Gorlice and Tarnów** (V 1915)
- **Limanowa**
- **Lublin** (the Austrian Government General, Daszyński's government)
- **Dęblin / Iwangorod**
- **Sochaczew, Bolimów and the Rawka** (the gas attacks of 1915)
- **Białystok** (bieżeństwo)
- **Brześć** (the treaties)
- **Olsztyn, Mazury and Tannenberg** (East Prussia, now in Poland)
- **Poznań** (XII 1918)
- **Wilno**, and Legion battlefields outside today's Poland (Kostiuchnówka,
  Rarańcza) if the report supports them

### Steps

1. Port `scripts/places-report.mjs` and build `src/data/places.json`:
   candidate places with Wikidata coordinates and their name forms
   (Polish inflections, the German and Russian names the articles use,
   such as Iwangorod/Dęblin and Lemberg/Lwów).
2. Run the report and review the link-only and mention-only pairs, as
   there: keep what an article is really about, drop passing mentions.
   Build `places-index.json`.
3. Port the pages, `PlaceLinks.astro` ("Miejsca" on article and battle
   pages), and a link from `/timeline`. Put "Miejsca" in the top menu if it
   still fits. Six items fit now; check widths at 1024 px.
4. Intros: 2–4 sentences per place, PL and EN, only from the place's own
   articles, every fact backed by a verbatim quote, checked by script (the
   same pattern as `scripts/checks/year-intros.py`).
5. Gaps: if a place central to the Polish story has fewer than 5 items, add
   articles rather than lowering the threshold. Likely gaps are
   Śląsk/Katowice, Pomorze/Gdańsk and Wielkopolska before XII 1918; see
   `expansion-plan.md` §A3.

### Cost and check

- Code: half a day.
- Report review and intros: about 0.5M tokens.
- Check: every indexed place has at least 5 items and an intro passing the
  checker, `PlaceLinks` shows on member articles, and the sitemap includes
  only indexed places.

---

## 3. "Szukasz przodka?" — finding a relative who lived through the Great War

### On thesecondwar.pl

`/szukasz-przodka` and `/szukasz-przodka/<slug>` (`RelativesIndex.astro`,
`RelativeGuidePage.astro`, `RelativeLinks.astro`, `FamilyHistory.astro`,
data `src/data/relatives.json`, `utils/relatives.ts`). 10 guides, one per
wartime fate: which archive or database to search, how to search it, and
our articles on that fate. Every archive link was opened and checked. The
homepage has a band for it, and member articles have a pointer.

### Here: WWI fates

For many Polish families, the First World War is the war of a great-
grandfather in a "foreign" army. These are the likely guides. **Each
archive below is a candidate to verify by opening it, not a checked
claim:**

| Guide | Where to look (to verify) |
|---|---|
| A soldier of the Austro-Hungarian army | Verlustlisten Österreich-Ungarns (casualty lists, digitised in ÖNB ANNO); Kriegsarchiv in Vienna; war cemeteries of Western Galicia |
| A soldier of the Russian army | the Russian database of WWI casualties and awards (gwar.mil.ru, "Памяти героев Великой войны"); Polish regional archives (conscription lists) |
| A soldier of the German army | Verlustlisten 1. Weltkrieg (searchable at des.genealogy.net); Volksbund grave search; Bavarian and Württemberg records |
| A legionnaire | CAW (Centralne Archiwum Wojskowe): Legions personnel files, Krzyż i Medal Niepodległości applications; lists of the Legions' fallen |
| A soldier of Haller's Army | the PIASA archive (Polish American volunteers); CAW; French records |
| A prisoner of war | the ICRC archive of First World War prisoners (grandeguerre.icrc.org) |
| A refugee of 1915 (bieżeństwo) | relief-committee records; Russian and Polish archives; repatriation lists of 1918–1922 |
| A soldier's grave | Volksbund, CWGC, Mémoire des hommes, Polish war-grave registers, the Galician cemetery database |

### Steps

1. Port the components and pages and `utils/relatives.ts`, plus `paths()`
   entries.
2. Research the guides: one agent per 2–3 guides. Open every link, check
   what it holds, what search terms work and what it costs, and record
   access notices, for example "service suspended" or "reading room
   closed". Link each guide to our articles on that fate: the Legions
   series, bieżeństwo, the Blue Army, the Przemyśl capitulation, POW
   articles.
3. Add the "Szukasz przodka?" pointer on member articles and the homepage
   band. In the homepage layout it can share the row with the series list.
4. Re-check the links about twice a year. thesecondwar.pl has the same
   reminder for its links.

### Cost and check

- About 0.5–0.8M tokens of research, plus half a day of code.
- Check: every external link was opened in the research pass and is listed
  with its check date, every guide links at least 2 of our articles, and
  the pointer appears on those articles.

---

## 4. "Granice" — the map of the Polish lands, 1914–1918

### On thesecondwar.pl

`/granice` and `/en/borders` (`BordersPage.astro`, `BordersMap.astro`, data
`src/data/borders.json` from `scripts/build-borders.mjs`, which takes
public-domain borders from OpenHistoricalMap). Four moments with a
switcher, `?moment=` links, and the pre-war border dashed on each.
`BordersLink.astro` on the articles about each change opens the map at
the right moment.

### Here: suggested moments

1. **VII 1914:** the three partitions on the eve of war, with the Austrian,
   Prussian and Russian borders through the Polish lands.
2. **Autumn 1915:** the front after the Great Retreat; the German General
   Government of Warsaw, the Austrian General Government of Lublin and
   Ober Ost.
3. **III 1918:** Brest-Litovsk; the Chełm Land given to Ukraine
   (9 II 1918), the "fourth partition".
4. **XI–XII 1918:** the reborn state's actual extent at the end of the war
   (Warsaw, Kraków and Galicia west of the San, contested Lwów, Wielkopolska
   from 27 XII), with the 1914 partition borders dashed.

### Steps

1. **Check the data first.** OpenHistoricalMap must have the 1914 partition
   borders, the 1915 occupation zones and the Brest line as relations. The
   1914 empires are likely there; the occupation zones and Brest may be
   missing. If they are, draw them from a cited historical map and say so
   on the page. Don't present invented lines as precise.
2. Port `build-borders.mjs` and the components with these four moments.
3. Add `BordersLink` on the articles for each change: the occupation
   decrees of 1915, the Act of 5 November, Brest with Ukraine,
   the Brest-Litovsk treaty, 11 XI 1918, the defence of Lwów, the Greater
   Poland Uprising.
4. Link it from the "Droga do niepodległości" and "Wojna na ziemiach
   polskich" series pages.

### Cost and check

- One day of code and data if OpenHistoricalMap has the lines; more if
  they must be drawn.
- Check: every moment cites its border sources on the page, `?moment=`
  works, and `BordersLink` appears on the listed articles.
