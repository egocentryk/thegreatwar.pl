# Brief: Polish military formations 1914–1918 — gap articles and a guide

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. The owner wants a topic
guide "Polskie formacje wojskowe 1914–1918" (`/tematy`). Most formations
already have articles (the Legions and their battles, the oath crisis, the
I Korpus against the Bolsheviks, Bobruisk, Kaniów, Haller's army in France:
the decree, the colours, Haller's arrival, recognition, command). Part 1
fills the gaps; part 2 is the guide. Scratch files go in the scratch folder
the coordinator gives you, **outside the repo**. Don't edit any other repo
file (report what other pages should change), don't run the build, don't
commit, never touch `../thesecondwar.pl`.

## Read first

- `workflow.md` §4 (front matter, dayOrder, authors, tags, links, battles,
  milestones), §6 (accuracy), §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline articles; the English edition writes
  **Lviv** for the city).
- Model: `src/content/timeline/1917/04/krwawy-kwiecien.md`.
- Neighbours, so you don't contradict or repeat them:
  `grep -rliE "Dowbor|Korpus Polski|Puławsk|Bajończy|Bayonne|Błękitn|Brygad[ay] Strzelców|Dywizj[aię] Strzelców Polskich" src/content`,
  in particular `timeline/1915/05/poczatek-drugiej-bitwy-w-artois.md` (the
  Bayonne company at Arras, 9 V 1915 — already told; don't write it again),
  `timeline/1918/01/i-korpus-polski-przeciw-bolszewikom.md`,
  `timeline/1918/02/konwencja-w-bobrujsku.md`,
  `timeline/1918/05/walki-pod-kaniowem.md`,
  `timeline/1917/06/dekret-o-utworzeniu-armii-polskiej-we-francji.md`,
  `timeline/1918/06/sztandary-dla-armii-polskiej-we-francji.md`,
  `timeline/1918/07/general-haller-we-francji.md`,
  `timeline/1918/09/armia-polska-sprzymierzona.md`,
  `timeline/1918/10/haller-naczelnym-wodzem.md`, the person pages
  `postacie/jozef-dowbor-musnicki.md`, `jozef-haller.md`, `roman-dmowski.md`,
  and the guide `topics/sprawa-polska-w-czasie-i-wojny-swiatowej.md`.

## Part 1: the articles

Dates: **verify them**; the table gives what is expected, not what is
certain. If sources give another day, use it (the folder follows the
month; adjust the slug if the title changes) and report it. If an event
turns out to be poorly attested, choose the best-attested event of the same
story and report the swap. `dayOrder`: check the day's existing articles
(`grep -l "^date: <date>" -r src/content/timeline`) and report the order
you'd give; don't edit the other files.

| grp | file (slug = title per workflow.md) | expected date | author | notes |
|---|---|---|---|---|
| R | `timeline/<YYYY>/<MM>/powstaje-legion-pulawski.md` | late 1914 – early 1915 (verify: the Russian consent, the start of recruitment in Puławy) | Łukasz Skowroń | the National Democrats' answer to Piłsudski's Legions; Witold Gorczyński; size; how Russia limited it |
| R | `timeline/1915/<MM>/…` the Puławy Legion's first battle, or its conversion into the Brygada Strzelców Polskich | 1915 (verify which is better attested) | Natalia | e.g. the fighting near Opole Lubelskie / Hołowczyce in July 1915; losses; Polish legionaries on the other side of the front nearby if sourced |
| R | `timeline/1917/<MM>/…` the I Korpus Polski formed, Dowbor-Muśnicki its commander | VII–VIII 1917 (verify the order date) | Łukasz Skowroń | the Naczpol and the military congress in Petrograd (VI 1917); from the Polish rifle division to a corps; numbers |
| R | `timeline/1918/05/…` the end of the I Korpus Polski | V 1918 (verify: the agreement with the Germans, the demobilisation) | Natalia | link back to i-korpus-polski-przeciw-bolszewikom and konwencja-w-bobrujsku; what became of its soldiers |
| W | `timeline/1914/08/…` Polish volunteers in France, the Bayonne company | VIII 1914 (verify: enlistment in Paris / departure to Bayonne / the oath) | Łukasz Skowroń | the Rada Ochotnicza / Komitet Wolontariuszy Polskich in Paris, the Légion étrangère, the banner from Bayonne; end with what came later only as far as the date allows (no forward links) |
| W | `timeline/1918/<MM>/…` the Polish army in France in its first battle | VI–VII 1918 (verify: Vosges / Champagne) | Natalia | the 1st Polish Rifle Division (or regiment) in line; don't repeat general-haller-we-francji and sztandary-dla-armii-polskiej-we-francji |

Front matter exactly as workflow.md §4 (field order, `milestone: false` —
offer milestone status in your report if you think it deserves it —,
`draft: false`), plus `sources:` at the end (3–8 URLs actually opened, at
least 2 not Wikipedia, in double quotes). Tags 3–4 from the existing
vocabulary ("Polska", "Królestwo Polskie", "Rosja", "Francja", "Józef
Piłsudski", "Legiony Polskie", "wojna domowa w Rosji", "Niemcy"…); no new
tags.

Length: 450–700 words in 2–4 `##` sections after an opening paragraph.

Links (workflow.md §4): pl.wikipedia only, checked (exists, not a
disambiguation page, right subject); `/postacie/<slug>` for people with a
page; internal links only backwards in time (an article links earlier
articles and battles that started on or before its date). No pointer
sentences.

Accuracy (workflow.md §6): Polish sources first (histories and memoirs
printed 1915–1939 on Polona, archive.org, Wikisource; academic articles,
IPN / Przystanek Historia, dzieje.pl, Muzeum Piłsudskiego; for Bayonne,
the French sources and the Polish community's publications); Russian
sources for the Russian side. Julian vs Gregorian for Russian dates (say
which you give; Gregorian in the date field). Ranges with attribution where
sources differ. Never from memory or search snippets.

### English

For each Polish file, write its English file per `translation-brief.md`
(`src/content/en/timeline/<english-slug>.md`; check the slug is free),
links byte for byte as in Polish. Stamp each:
`node scripts/i18n-status.mjs --stamp=<english-slug>` (one call per file;
it may exit 1 while other files are stale, the stamp is still written),
then `node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` must print
nothing.

### Check

`python3 -I scripts/checks/expand.py . <slug> …` must end with
`0 problem(s)` for all your files.

### Report (short)

Per file: path, English slug, words, sources, the dates you used and where
sources disagree, the dayOrder you'd give, tags; suggested links from
existing pages to yours (file + sentence); anything wrong in existing pages
(file + what); whether a milestone is warranted.

## Part 2: the guide

Follow `scripts/briefs/topics.md` exactly (front matter, 1,800–2,800 words,
evidence file `scripts/evidence/topics/<slug>.json`, `topics.py` at
`0 problem(s)`, English file). Here:

- Slug `polskie-formacje-wojskowe`, title "Polskie formacje wojskowe
  1914–1918", question as readers search it (e.g. "Jakie polskie formacje
  walczyły w I wojnie światowej?"), `order: 13`, `series: legiony-polskie`,
  `updated:` today. English slug `polish-military-formations`.
- One section per formation, in a logical order (by side, then time): the
  Legions and their brigades (with the Legion Wschodni, the Polish
  Auxiliary Corps and the Polnische Wehrmacht); the Bayonne company; the
  Puławy Legion and the Polish riflemen in Russia (brigade, division); the
  three Polish corps in Russia (I Korpus Dowbor-Muśnicki; II Korpus,
  Rarańcza and Kaniów; III Korpus); the Polish army in France (Haller's,
  "Błękitna"); the formations in Russia after 1918 only in one closing
  paragraph (the 4th Rifle Division, the Siberian division), as the bridge
  to the "Po wojnie" era. Then a section on what they left: the officers
  of the Polish Army of 1918–1920 came from all of them, and the rivalry
  between "legioniści", "hallerczycy" and the former Russian and Austrian
  officers.
- Right after the opening paragraph, a summary table (Markdown) of the
  formations: name, side, years, commander(s), largest size (a range with
  attribution where sources differ), fate. Every number in the table must
  be in the body too (the checker reads the paragraphs, not the table:
  keep the table's facts in the body).
- Link generously (person pages, the articles of part 1, the battle pages
  `bitwa-pod-lowczowkiem`, `bitwa-pod-rarancza-1915`, `bitwa-pod-kostiuchnowka`,
  `bitwa-pod-kaniowem`…, the series via `/serie/legiony-polskie` is not
  needed — `series:` shows it). The guide must not contradict the articles;
  where they disagree with a source, report it.
