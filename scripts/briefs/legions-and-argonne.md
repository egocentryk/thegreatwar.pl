# Brief: new articles and battle pages — the Legions 1915–1916, the Lost Battalion

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Four gaps found while
collecting first-hand quotes: the Legions' fighting at Rarańcza (1915), in
Volhynia (autumn 1915) and at Kostiuchnówka (July 1916), and the American
"Lost Battalion" in the Argonne (October 1918). You write the files of your
group, in Polish and English. Scratch files go in the scratch folder the
coordinator gives you, **outside the repo**. Don't edit any other repo file
(report what other pages should change), don't run the build, don't commit,
never touch `../thesecondwar.pl`.

## Read first

- `workflow.md` §4 (front matter, dayOrder, authors, tags, links, battles,
  milestones), §6 (accuracy), §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline articles and battle pages sections).
- Models: timeline `src/content/timeline/1917/04/krwawy-kwiecien.md`; battle
  page `src/content/battles/1914/bitwa-pod-mons.md` (sections `## Nazwa i
  daty`, `## Tło`, the course in 2–4 sections, `## Straty`, `## Znaczenie`).
- Neighbours, so you don't contradict them: `grep -rli "<keyword>"
  src/content` (Legiony, Piłsudski, Haller, brygada, Rarańcza, Kostiuchnówka,
  Styr, Argonne, Whittlesey), the guide `src/content/topics/sprawa-polska-w-czasie-i-wojny-swiatowej.md`,
  the person pages of the commanders, and for the voices already collected:
  `grep -n "<article-slug>" src/data/voices.json`.

## The files

Dates: **verify them**; the table gives what is expected, not what is
certain. If sources give other days, use the right ones (the slug stays,
the folder follows the month) and report it. `dayOrder`: check the day's
existing articles (`grep -l "^date: <date>" -r src/content/timeline`) and
report the order you'd give; don't edit the other files.

| grp | file | expected date | author | notes |
|---|---|---|---|---|
| K | battle page `battles/1916/bitwa-pod-kostiuchnowka.md` | 4–6 VII 1916 | Natalia | phase `1916-front-wschodni`; I and III Brigades, Polska Góra, the Russian attack in the Kovel direction during the Brusilov offensive; losses (often given ~2,000), its place in the Legions' history and the oath crisis that followed |
| K | timeline `timeline/1916/07/poczatek-bitwy-pod-kostiuchnowka.md` | 4 VII 1916 | Natalia | `battle: bitwa-pod-kostiuchnowka`, front Front wschodni |
| K | timeline `timeline/1916/07/koniec-bitwy-pod-kostiuchnowka.md` | 6 VII 1916 | Łukasz Skowroń | the withdrawal; `battle:` as above |
| R | battle page `battles/1915/bitwa-pod-rarancza-1915.md` | summer 1915 (verify) | Łukasz Skowroń | phase `1915-gorlice`; the II Brigade in Bukovina near Czernowitz; the slug ends in `-1915` because `bitwa-pod-rarancza` is the February 1918 article |
| R | timeline `timeline/1915/<MM>/poczatek-bitwy-pod-rarancza.md` | first day (verify) | Łukasz Skowroń | `battle: bitwa-pod-rarancza-1915` |
| R | (optional) timeline end-of-battle article | last day | Natalia | only if the battle lasted several days and sources support a distinct ending |
| V | timeline articles `timeline/1915/<MM>/…` on the Legions in Volhynia | IX–XI 1915 (verify) | mix | 2–3 articles, one per main battle (Kukle, Kamieniucha, Kołki on the Styr — check which are best attested); slug = title per workflow.md; front Front wschodni |
| V | (optional) battle page `battles/1915/<slug>.md` | | Natalia | for the largest of them only if sources support a full page (≥900 words); phase `1915-odwrot-rosjan` |
| L | timeline `timeline/1918/10/zaginiony-batalion-okrazony-w-argonnach.md` | 2–3 X 1918 (verify) | Łukasz Skowroń | `battle: ofensywa-moza-argonne`, front Front zachodni; Whittlesey, the 77th Division, the pigeon Cher Ami only if sourced |
| L | timeline `timeline/1918/10/odsiecz-dla-zaginionego-batalionu.md` | 7–8 X 1918 (verify) | Natalia | `battle: ofensywa-moza-argonne`; numbers in and out, Medals of Honor |

Front matter exactly as workflow.md §4 (field order, `milestone: false`
— offer milestone status in your report if you think it deserves it —,
`draft: false`), plus `sources:` at the end (3–8 URLs actually opened, at
least 2 not Wikipedia, in double quotes). Tags 3–4 from the existing
vocabulary ("Legiony Polskie", "Józef Piłsudski", "Rosja",
"Austro-Węgry", "Bukowina", "Stany Zjednoczone", "Niemcy"…); one new tag is
allowed: **"Wołyń"** (groups K and V).

Length: timeline articles 450–700 words in 2–4 `##` sections after an
opening paragraph; battle pages 1,000–1,500 words.

Links (workflow.md §4): pl.wikipedia only, checked; `/postacie/<slug>`
for people with a page; internal links only backwards in time (an article
links earlier articles and battles that started on or before its date,
never its own `battle`; a battle page links content dated before its
start). No pointer sentences.

Accuracy (workflow.md §6): Polish sources first for the Legions (Legion
memoirs and histories printed 1915–1939 on Polona, archive.org, Wikisource,
academic articles, IPN, Muzeum Piłsudskiego), the Austrian official history
(*Österreich-Ungarns letzter Krieg*) where reachable, Russian sources for
the other side; for the Lost Battalion the American official records and
the 77th Division history (archive.org), Medal of Honor citations. Julian
vs Gregorian for Russian dates. Ranges with attribution where sources
differ. Never from memory or search snippets.

## English

For each Polish file, write its English file per `translation-brief.md`
(`src/content/en/timeline/<english-slug>.md`, `src/content/en/battles/<english-slug>.md`;
check the slug is free), links byte for byte as in Polish. The English
edition writes **Lviv** for the city (see translation-brief.md). Stamp each:
`node scripts/i18n-status.mjs --stamp=<english-slug>` (one call per file),
then `node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` must print
nothing.

## Check

`python3 -I scripts/checks/expand.py . <slug> [bitwy/<slug>] …` must end
with `0 problem(s)` for all your files.

## Report (short)

Per file: path, English slug, words, sources, the dates you used and where
sources disagree, the dayOrder you'd give, tags; suggested links from
existing pages to yours (file + sentence); anything wrong in existing pages
(file + what); whether a milestone is warranted.
