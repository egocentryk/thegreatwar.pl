# Brief: "Wojna po wojnie" — articles 1919–1923 (Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Its timeline ends in
December 1918, but the war did not end everywhere on 11 November. We add
about 55 articles and 2 battle pages on the wars that carried it on,
1919–1923, above all Poland's wars for its borders. They get their own era
on the timeline ("Po wojnie"); the coordinator builds that page. You write
the files of your group, in Polish and English. Scratch files go in the
scratch folder the coordinator gives you, **outside the repo**. Don't edit
any other repo file (report what other pages should change), don't run the
build, don't commit, **never touch `../thesecondwar.pl`**.

## Scope and the sister site

thesecondwar.pl covers the political road to the Second World War in these
years (the peace treaties in full, Spartacus, the Hungarian Soviet Republic,
Fiume, Kapp, the NSDAP, Mussolini, the Ruhr). This era is the **war after
the war**: armed conflicts that continued the Great War, and Poland's
borders up to their recognition in March 1923. Where a topic is also on the
sister site (the start of the Polish–Soviet war, Żeligowski, Riga,
Versailles, Smyrna), tell it from this site's angle (for Versailles: what
it meant for Poland), not as a general history. No links to thesecondwar.pl.

## Read first

- `workflow.md` §4 (front matter, dayOrder, authors, tags, links, battles,
  milestones), §6 (accuracy), §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline and battle pages; the English edition
  writes **Lviv**, Polish names otherwise as there).
- Models: timeline `src/content/timeline/1917/04/krwawy-kwiecien.md`; battle
  page `src/content/battles/1914/bitwa-pod-mons.md`.
- The end of the 1918 thread, so you continue it without contradiction:
  `ls src/content/timeline/1918/11 1918/12`, the battle pages
  `battles/1918/obrona-lwowa-1918.md` and `battles/1918/powstanie-wielkopolskie.md`,
  the guide `src/content/topics/sprawa-polska-w-czasie-i-wojny-swiatowej.md`
  and `skutki-i-wojny-swiatowej.md`, and the person pages (`ls src/content/postacie`).

## The articles

Slugs are fixed (other writers link them). Dates are expected, not certain:
**verify them**; if sources give another day, use it (the slug stays, the
folder follows the month) and report it. Front matter as workflow.md §4:
`front: Front wschodni` only for the Polish–Ukrainian and Polish–Soviet
wars, otherwise no `front`; `milestone: false` (offer milestone status in
your report where it seems deserved); `dayOrder: 0` unless the day has
other articles of this batch (then follow the table order: earlier rows
higher); `sources:` at the end (3–8 URLs actually opened, at least 2 not
Wikipedia). Tags 3–4 from the existing vocabulary (`Polska`, `Józef
Piłsudski`, `Rosja`, `Niemcy`, `Wielka Brytania`, `Francja`, `Litwa`,
`Czechosłowacja`, `Ukraina`, `Wielkopolska`…); new tags allowed only:
**"wojna polsko-bolszewicka"**, **"powstania śląskie"**, **"wojna domowa w
Rosji"**.

| grp | date | title | slug | author |
|---|---|---|---|---|
| A | 1919-03 (verify) | Koniec oblężenia Lwowa | koniec-oblezenia-lwowa | Natalia |
| A | 1919-04-19 | Polacy zdobywają Wilno | polacy-zdobywaja-wilno | Łukasz Skowroń |
| A | 1919-05-14 | Polska ofensywa we wschodniej Galicji | polska-ofensywa-we-wschodniej-galicji | Łukasz Skowroń |
| A | 1919-06-07 | Ofensywa czortkowska | ofensywa-czortkowska | Natalia |
| A | 1919-06-25 | Rada Najwyższa zezwala Polsce na zajęcie Galicji Wschodniej | rada-najwyzsza-zezwala-na-zajecie-galicji-wschodniej | Łukasz Skowroń |
| A | 1919-07-17 | Koniec wojny polsko-ukraińskiej | koniec-wojny-polsko-ukrainskiej | Natalia |
| A | 1919-08-23 | Powstanie sejneńskie | powstanie-sejnenskie | Łukasz Skowroń |
| B | 1919-01-23 | Czechosłowacja atakuje Śląsk Cieszyński | czechoslowacja-atakuje-slask-cieszynski | Natalia |
| B | 1919-02-16 | Rozejm w Trewirze | rozejm-w-trewirze | Łukasz Skowroń — `battle: powstanie-wielkopolskie` (its last day) |
| B | 1919-02-20 | Sejm Ustawodawczy uchwala małą konstytucję | sejm-ustawodawczy-uchwala-mala-konstytucje | Natalia |
| B | 1919-06-28 | Polska podpisuje traktat wersalski | polska-podpisuje-traktat-wersalski | Łukasz Skowroń |
| B | 1920-02-10 | Zaślubiny Polski z morzem | zaslubiny-polski-z-morzem | Natalia |
| B | 1920-07-11 | Plebiscyt na Warmii, Mazurach i Powiślu | plebiscyt-na-warmii-mazurach-i-powislu | Łukasz Skowroń |
| B | 1920-07-28 | Podział Śląska Cieszyńskiego | podzial-slaska-cieszynskiego | Łukasz Skowroń |
| C | 1919-08-16 | Wybuch pierwszego powstania śląskiego | wybuch-pierwszego-powstania-slaskiego | Natalia |
| C | 1920-08-19 | Wybuch drugiego powstania śląskiego | wybuch-drugiego-powstania-slaskiego | Łukasz Skowroń |
| C | 1921-03-20 | Plebiscyt na Górnym Śląsku | plebiscyt-na-gornym-slasku | Natalia |
| C | 1921-05-02 | Wybuch trzeciego powstania śląskiego | wybuch-trzeciego-powstania-slaskiego | Łukasz Skowroń |
| C | 1921-05-21 | Bitwa o Górę Świętej Anny | bitwa-o-gore-swietej-anny | Łukasz Skowroń |
| C | 1921-10-20 | Rada Ambasadorów dzieli Górny Śląsk | rada-ambasadorow-dzieli-gorny-slask | Natalia |
| C | 1922-06-20 | Wojsko polskie wkracza do Katowic | wojsko-polskie-wkracza-do-katowic | Łukasz Skowroń |
| D | 1919-02-14 | Początek wojny polsko-bolszewickiej | poczatek-wojny-polsko-bolszewickiej | Łukasz Skowroń |
| D | 1919-08-08 | Polacy zdobywają Mińsk | polacy-zdobywaja-minsk | Natalia |
| D | 1920-04-21 | Sojusz Piłsudskiego z Petlurą | sojusz-pilsudskiego-z-petlura | Łukasz Skowroń |
| D | 1920-04-25 | Początek wyprawy kijowskiej | poczatek-wyprawy-kijowskiej | Łukasz Skowroń |
| D | 1920-05-07 | Polacy wkraczają do Kijowa | polacy-wkraczaja-do-kijowa | Natalia |
| D | 1920-06-05 | Konarmia Budionnego przełamuje front | konarmia-budionnego-przelamuje-front | Łukasz Skowroń |
| D | 1920-07-01 | Powstanie Rady Obrony Państwa | powstanie-rady-obrony-panstwa | Natalia |
| D | 1920-07-04 | Ofensywa Tuchaczewskiego | ofensywa-tuchaczewskiego | Łukasz Skowroń |
| E | battle page 13–25 VIII 1920 | Bitwa Warszawska | battles/1920/bitwa-warszawska | Natalia |
| E | 1920-08-13 | Początek Bitwy Warszawskiej | poczatek-bitwy-warszawskiej | Łukasz Skowroń — `battle: bitwa-warszawska` |
| E | 1920-08-16 | Kontruderzenie znad Wieprza | kontruderzenie-znad-wieprza | Natalia — `battle: bitwa-warszawska` |
| E | 1920-08-17 | Bitwa pod Zadwórzem | bitwa-pod-zadworzem | Łukasz Skowroń |
| E | 1920-08-31 | Bitwa pod Komarowem (1920) | bitwa-pod-komarowem-1920 | Natalia |
| E | battle page 20–26 IX 1920 | Bitwa nad Niemnem | battles/1920/bitwa-nad-niemnem | Łukasz Skowroń |
| E | 1920-09-20 | Początek bitwy nad Niemnem | poczatek-bitwy-nad-niemnem | Natalia — `battle: bitwa-nad-niemnem` |
| E | 1920-10-09 | Bunt Żeligowskiego | bunt-zeligowskiego | Łukasz Skowroń |
| E | 1920-10-12 | Rozejm w Rydze | rozejm-w-rydze | Natalia |
| E | 1921-03-18 | Pokój ryski | pokoj-ryski | Łukasz Skowroń |
| F | 1919-03-04 | Wiosenna ofensywa Kołczaka | wiosenna-ofensywa-kolczaka | Łukasz Skowroń |
| F | 1919-07-03 | Dyrektywa moskiewska Denikina | dyrektywa-moskiewska-denikina | Natalia |
| F | 1919-09-27 | Alianci ewakuują Archangielsk | alianci-ewakuuja-archangielsk | Łukasz Skowroń |
| F | 1919-10 (verify) | Judenicz pod Piotrogrodem | judenicz-pod-piotrogrodem | Natalia |
| F | 1919-11-14 | Upadek Omska | upadek-omska | Łukasz Skowroń |
| F | 1920-02-07 | Rozstrzelanie Kołczaka | rozstrzelanie-kolczaka | Natalia |
| F | 1920-09 (verify) | Koniec ewakuacji Legionu Czechosłowackiego | koniec-ewakuacji-legionu-czechoslowackiego | Łukasz Skowroń |
| F | 1920-11-14 | Ewakuacja armii Wrangla z Krymu | ewakuacja-armii-wrangla-z-krymu | Łukasz Skowroń |
| G | 1919-01-21 | Wybuch irlandzkiej wojny o niepodległość | wybuch-irlandzkiej-wojny-o-niepodleglosc | Natalia |
| G | 1921-12-06 | Traktat angielsko-irlandzki | traktat-angielsko-irlandzki | Łukasz Skowroń |
| G | 1919-06-23 | Bitwa pod Kiesią | bitwa-pod-kiesia | Łukasz Skowroń |
| G | 1920-02-02 | Pokój w Tartu | pokoj-w-tartu | Natalia |
| G | 1921-08-23 | Bitwa nad Sakarią | bitwa-nad-sakaria | Łukasz Skowroń |
| G | 1922-09-09 | Turcy odbijają Smyrnę | turcy-odbijaja-smyrne | Natalia |
| G | 1923-01-10 | Powstanie w Kłajpedzie | powstanie-w-klajpedzie | Łukasz Skowroń |
| G | 1923-03-15 | Rada Ambasadorów uznaje wschodnią granicę Polski | rada-ambasadorow-uznaje-wschodnia-granice-polski | Natalia |

Folders: `src/content/timeline/<YYYY>/<MM>/<slug>.md`; battle pages
`src/content/battles/1920/<slug>.md` with `phase: 1920-wojna-polsko-bolszewicka`
(the coordinator adds it), `front: Front wschodni`.

## What to write

- **Length:** timeline articles 450–700 words in 2–4 `##` sections after an
  opening paragraph; battle pages 1,000–1,500 words (sections as in the
  model). Substance, not padding.
- **Hindsight:** the article tells its day; later events only as a short
  look ahead.
- **Links** (workflow.md §4): pl.wikipedia only, checked; `/postacie/<slug>`
  for people with a page; internal links only backwards in time — to any
  1914–1918 article or battle, and to earlier rows of this table (they will
  exist when we check). No pointer sentences.
- **Accuracy** (workflow.md §6): Polish sources first for Polish topics
  (IPN, dzieje.pl, Muzeum Historii Polski, Polona and other digital
  libraries, academic articles, the 1920s official histories), FRUS and
  the British Documents for diplomacy, Russian and Ukrainian sources for
  the other side (Julian dates in Soviet Russia ended on 14 II 1918).
  Figures as ranges with attribution where sources differ. Sensitive
  topics (pogroms, the Lwów pogrom of 1918, reprisals): sober and precise.
  Never from memory or search snippets. WebSearch is shared by seven
  writers: use it sparingly, prefer WebFetch of known sources.

## English

For each file write its English file per `translation-brief.md`
(`src/content/en/timeline/<english-slug>.md`, `src/content/en/battles/<english-slug>.md`;
check the slug is free), links byte for byte. Stamp each:
`node scripts/i18n-status.mjs --stamp=<english-slug>` (one call per file),
then `node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` must print
nothing.

## Check

`python3 -I scripts/checks/expand.py . <slug> [bitwy/<slug>] …` must end
with `0 problem(s)` (links to other groups' rows may show "no article"
until they finish: list them instead of removing them).

## Report (short)

Per file: path, English slug, words, sources, the date you used and where
sources disagree, tags; links to other groups' rows; suggested links from
existing 1918 pages to yours (file + sentence); anything wrong in existing
pages (file + what); milestone suggestions.
