# Brief: "Droga do wojny" — articles before 1914 (Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Its timeline starts
at Sarajevo (28 VI 1914). We add about 20 articles on the road to the war,
1879–1913: the alliances, the naval race, the great-power crises, the
Balkan Wars and the Polish pre-war preparations. They get their own era on
the timeline ("Przed wojną"); the coordinator builds that page. You write
the articles of your group, in Polish and English. Scratch files go in the
scratch folder the coordinator gives you, **outside the repo**. Don't edit
any other repo file, don't run the build, don't commit. **Never touch the
sister project `../thesecondwar.pl`.**

## Scope

The sister site thesecondwar.pl covers the roots of the Second World War
in Asia (Japan, Korea, Portsmouth 1905). Leave Asia out: the Russo-Japanese
War gets at most a clause where it explains Europe (Russia weakened in
1905). Each article is about European (or Polish) origins of 1914, told on
its own day.

## Read first

- `workflow.md` §4 (hard rules: front matter, links, tags, authors), §6
  (accuracy), §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline articles).
- Model of length and tone: `src/content/timeline/1917/04/krwawy-kwiecien.md`
  and its English file `src/content/en/timeline/bloody-april.md`.
- What the site already says about the period, so you don't contradict it:
  the guides `src/content/topics/przyczyny-i-wojny-swiatowej.md` and
  `panstwa-centralne-i-ententa.md`, the glossary entries `ententa`,
  `panstwa-centralne`, `kryzysy-marokanskie`, `wojny-balkanskie`,
  `plan-schlieffena`, `drednot`, `mlodoturcy`, `zwiazek-strzelecki`, `sokol`
  in `src/data/glossary.json`, and the Sarajevo article
  `src/content/timeline/1914/06/arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie.md`.
  Polish group: also `src/content/postacie/jozef-pilsudski.md`,
  `kazimierz-sosnkowski.md` and the August 1914 Legion articles
  (`grep -rli "strzel" src/content/timeline/1914/08`). Report anything in
  them your research shows is wrong (file + what); don't edit them.

## The articles

Slugs are fixed (other writers may link them). The date is the most-cited
day of the event; **verify it**. If sources show a different day, use it and
report it (the slug stays). If only the month is certain, take the day most
sources give and say in the text that dates differ. Front matter as in
workflow.md §4: no `front`, no `battle`, `milestone: false`, `dayOrder: 0`,
no `brief`; `sources:` at the end (3–8 URLs actually opened, most important
first, at least 2 not Wikipedia, in double quotes).

| grp | date | title | slug | category | author |
|---|---|---|---|---|---|
| A | 1879-10-07 | Niemcy i Austro-Węgry zawierają dwuprzymierze | niemcy-i-austro-wegry-zawieraja-dwuprzymierze | Dyplomacja | Łukasz Skowroń |
| A | 1882-05-20 | Niemcy, Austro-Węgry i Włochy zawierają trójprzymierze | niemcy-austro-wegry-i-wlochy-zawieraja-trojprzymierze | Dyplomacja | Łukasz Skowroń |
| A | 1890-06-18 | Niemcy nie odnawiają traktatu reasekuracyjnego | niemcy-nie-odnawiaja-traktatu-reasekuracyjnego | Dyplomacja | Łukasz Skowroń |
| A | 1894-01-04 | Wchodzi w życie sojusz francusko-rosyjski | wchodzi-w-zycie-sojusz-francusko-rosyjski | Dyplomacja | Łukasz Skowroń |
| B | 1898-04-10 | Niemcy uchwalają pierwszą ustawę morską | niemcy-uchwalaja-pierwsza-ustawe-morska | Wojsko | Natalia |
| B | 1904-04-08 | Wielka Brytania i Francja zawierają entente cordiale | wielka-brytania-i-francja-zawieraja-entente-cordiale | Dyplomacja | Natalia |
| B | 1906-02-10 | Wodowanie HMS Dreadnought | wodowanie-hms-dreadnought | Wojsko | Natalia |
| B | 1907-08-31 | Wielka Brytania i Rosja podpisują konwencję petersburską | wielka-brytania-i-rosja-podpisuja-konwencje-petersburska | Dyplomacja | Natalia |
| C | 1905-03-31 | Wilhelm II ląduje w Tangerze | wilhelm-ii-laduje-w-tangerze | Dyplomacja | Łukasz Skowroń |
| C | 1906-04-07 | Konferencja w Algeciras kończy pierwszy kryzys marokański | konferencja-w-algeciras-konczy-pierwszy-kryzys-marokanski | Dyplomacja | Łukasz Skowroń |
| C | 1908-10-06 | Austro-Węgry ogłaszają aneksję Bośni i Hercegowiny | austro-wegry-oglaszaja-aneksje-bosni-i-hercegowiny | Polityka | Łukasz Skowroń |
| C | 1911-07-01 | Niemiecka kanonierka „Panther” wpływa do Agadiru | niemiecka-kanonierka-panther-wplywa-do-agadiru | Dyplomacja | Łukasz Skowroń |
| D | 1911-09-29 | Wybucha wojna włosko-turecka | wybucha-wojna-wlosko-turecka | Działania zbrojne | Łukasz Skowroń |
| D | 1912-10-08 | Czarnogóra rozpoczyna pierwszą wojnę bałkańską | czarnogora-rozpoczyna-pierwsza-wojne-balkanska | Działania zbrojne | Łukasz Skowroń |
| D | 1913-05-30 | Traktat londyński kończy pierwszą wojnę bałkańską | traktat-londynski-konczy-pierwsza-wojne-balkanska | Dyplomacja | Łukasz Skowroń |
| E | 1913-06-29 | Bułgaria rozpoczyna drugą wojnę bałkańską | bulgaria-rozpoczyna-druga-wojne-balkanska | Działania zbrojne | Łukasz Skowroń |
| E | 1913-08-10 | Pokój bukareszteński kończy drugą wojnę bałkańską | pokoj-bukaresztenski-konczy-druga-wojne-balkanska | Dyplomacja | Natalia |
| F | 1908-06-?? | Powstaje Związek Walki Czynnej | powstaje-zwiazek-walki-czynnej | Wojsko | Natalia |
| F | 1910-??-?? | Powstaje Związek Strzelecki | powstaje-zwiazek-strzelecki | Wojsko | Natalia |
| F | 1912-11-?? | Powstaje Komisja Tymczasowa Skonfederowanych Stronnictw Niepodległościowych | powstaje-komisja-tymczasowa-skonfederowanych-stronnictw-niepodleglosciowych | Polityka | Natalia |

Folder: `src/content/timeline/<YYYY>/<MM>/<slug>.md`.

Research hints:
- **A**: the Dual Alliance's secret text (published 1888); the Triple
  Alliance renewals; Bismarck's dismissal (March 1890) vs the treaty's
  expiry (the article sits on the expiry); the Franco-Russian military
  convention of 1892 and its ratification by exchange of letters (Dec 1893
  / Jan 1894: check, and check Julian vs Gregorian).
- **B**: Tirpitz's first Navy Law (Reichstag vote vs promulgation: pick the
  day sources tie to it, say the other); the three conventions of 8 IV 1904
  (Egypt, Morocco, Newfoundland) — not an alliance; Dreadnought launched by
  Edward VII at Portsmouth, built in about a year; the 1907 convention's
  three parts (Persia, Afghanistan, Tibet). Link the person pages
  `/postacie/alfred-von-tirpitz`, `/postacie/john-fisher`,
  `/postacie/edward-grey` where they appear.
- **C**: Tangier and Delcassé's fall; Algeciras General Act (signed 7 IV
  1906); Austria's annexation proclamation (dated 5 X, announced 6/7 X:
  check) with Bulgaria's independence (5 X) and the 1909 Russian climb-down
  as a look ahead; the Panther's arrival at Agadir (1 VII 1911), Lloyd
  George's Mansion House speech (21 VII) and the 4 XI 1911 treaty as a look
  ahead.
- **D**: Italy's ultimatum and declaration (29 IX 1911), its look ahead to
  the Treaty of Ouchy (18 X 1912) and how it set off the Balkan League;
  Montenegro's declaration (8 X 1912) and the others joining (17–18 X);
  Treaty of London (30 V 1913): Albania, the Enos–Midia line.
- **E**: Bulgaria's attack on the night of 29/30 June 1913 (choose the day,
  say the night), Romania and the Ottomans joining; the Treaty of
  Bucharest (10 VIII 1913) and the Treaty of Constantinople (29 IX) as a
  look ahead; why Bulgaria joined the Central Powers in 1915 only as one
  sentence of hindsight at most.
- **F**: Polish sources first (dzieje.pl, PSB-like biographies, IPN, Muzeum
  Piłsudskiego, Polona/academic articles). ZWC: Lwów, 1908, Sosnkowski,
  Piłsudski, PPS-Frakcja Rewolucyjna; Związek Strzelecki (Lwów) and
  "Strzelec" (Kraków), registered by the Austrian authorities in 1910;
  mention the Polskie Drużyny Strzeleckie (1911) and the Drużyny
  Bartoszowe in a paragraph without retelling them; KTSSN (Komisja
  Tymczasowa Skonfederowanych Stronnictw Niepodległościowych), 1912 —
  check where and when it was set up (Zakopane conference in August vs
  the November founding). Link `/postacie/jozef-pilsudski`,
  `/postacie/kazimierz-sosnkowski` and other person pages that exist (`ls
  src/content/postacie`).

## What to write

- **Length**: 450–700 words, in 2–4 `##` sections after an opening
  paragraph, as in the model. Substance: background, who decided what and
  why, what happened that day, the immediate consequences, a quotation from
  a document where it matters. No padding.
- **Hindsight**: the article tells that day. 1914 may appear only as a
  short closing look ahead (one or two sentences), never as the theme.
- **Tags**: 3–4, from the existing vocabulary (workflow.md §4 has the
  command): countries ("Niemcy", "Austro-Węgry", "Wielka Brytania",
  "Serbia", "Bułgaria", "Imperium Osmańskie", "Królestwo Polskie"…),
  people with a tag ("Wilhelm II", "Edward Grey", "Józef Piłsudski"),
  "Royal Navy", "Legiony Polskie" only where they really fit. Two new tags
  are allowed: **"wojny bałkańskie"** (groups D and E, Balkan Wars only) and
  **"kryzysy marokańskie"** (Tangier, Algeciras, Agadir). No other new tags.
- **Links** (workflow.md §4): pl.wikipedia only, checked (exists, not a
  disambiguation page, right subject), first mention only, no target twice;
  `/postacie/<slug>` for people with a page; internal links **only
  backwards in time**: to the articles of this table with an earlier date
  (they will exist when we check), never to 1914+ articles or battles.
  Links to the guides (`/tematy/<slug>`) are allowed but use them sparingly.
  No pointer sentences.
- **Accuracy** (workflow.md §6): every fact from sources you opened and
  read — treaty texts (Avalon Project, firstworldwar.com primary documents,
  Yale/EuroDocs), the British Documents on the Origins of the War and
  Grosse Politik on archive.org, academic articles, Polish sources for
  Polish topics; Wikipedia in other languages only to cross-check. Dates in
  Russian sources: Julian vs Gregorian. Where sources differ, soften or give
  both with attribution. Never from memory or search snippets. WebSearch is
  shared by all writers: use it sparingly, prefer WebFetch of known sources.

## English

Create the English file following `translation-brief.md`:
`src/content/en/timeline/<english-slug>.md` (check the slug is free),
front matter `title`, `summary` (≤ 160), `source: <polish-slug>`; links byte
for byte as in Polish. Then stamp it:
`node scripts/i18n-status.mjs --stamp=<english-slug>` (one call per file,
not chained with `&&`), and check
`node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` prints nothing.

## Check

`python3 -I scripts/checks/expand.py . <slug> [more…]` must end with
`0 problem(s)` for your articles. (It is the checker for expanded articles;
for new files it skips the comparison with git.) Your own links to other
groups' articles may show "no article" until they finish: list them in your
report instead of removing them.

## Report (short)

Per article: slug, English slug, word count, sources count, the date you
used and whether sources disagree on it, tags, links to other groups'
articles, and anything wrong you noticed in existing pages (file + what).
