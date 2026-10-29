# Brief: Polish person pages (Polish + English) for thegreatwar.pl

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Person pages
(`/postacie/<slug>`) are reference pages outside the timeline. Only 9 of
242 are Polish people, and this batch adds 30 people of the Polish thread.
You write the people in your group: each one as a Polish page, then its
English translation. Scratch files go in a scratch folder **outside the repo** (the scratchpad path the coordinator gives you, or `mktemp -d`; never inside the repo)
(delete it when done). Don't edit any other repo file, don't run the build,
don't commit. **Portraits are not your job**: leave out `photo:`, since the
coordinator adds it later with `scripts/person-photos.mjs`.

## Read first

- `workflow.md` §2 (the person-pages paragraph), §4 (rules: tone, links,
  tags), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md`, the "Person pages" section.
- The models: `src/content/postacie/wojciech-korfanty.md` and
  `src/content/postacie/jozef-haller.md`, and their English files in
  `src/content/en/people/` (`grep -l "source: wojciech-korfanty" src/content/en/people/*`).
- **Every article that mentions your person**:
  `grep -rl "<surname>" src/content/timeline src/content/battles src/content/topics`.
  The page must not contradict them. Where a source contradicts one, write
  what is certain and report the conflict (file and what it says).

## The Polish page: `src/content/postacie/<slug>.md`

Slug = the name, lowercase, Polish letters transliterated, hyphens
(`jan-kucharzewski`, `jozef-dowbor-musnicki`). Front matter in the model's
order:

```yaml
---
name: Jan Kucharzewski
summary: ≤160 chars, who they were in the war, one sentence
role: one line with dates, e.g. "Prezes Rady Ministrów Królestwa Polskiego (1917–1918)"
country: Polska                    # Austro-Węgry for Karl Kuk and Adam Tarnowski
side: Sprawa polska                # Państwa centralne for Kuk and Tarnowski
born: 1876-05-27
died: 1952-07-04
bornYearOnly: false                # only if just the year is known
birthPlace: Wysokie Mazowieckie (Królestwo Polskie)
deathPlace: Nowy Jork
aliases: [Jan Kucharzewski]        # forms used in battle `commanders` lists, if any
wikiTitles: [Jan_Kucharzewski]     # the pl.wikipedia title(s) our articles link for this person, checked via API
authors: [<your group's author>]
tags: [3–4 from the existing vocabulary; include the person's own tag only if timeline articles use it]
sources:
  - "https://pl.wikipedia.org/wiki/Jan_Kucharzewski"
  - "…3–6 pages you opened and read, at least 2 not Wikipedia (iPSB/Polski Słownik Biograficzny, Muzeum Historii Polski, dzieje.pl, IPN, Sejm/Senat biographies, university pages, Encyklopedia PWN if it loads)"
---
```

- `wikiTitles` matters: a script will turn every pl.wikipedia link in our
  articles for these titles into a link to the new page. Collect the exact
  titles our articles use (`grep -rho "pl.wikipedia.org/wiki/[^)]*Kucharzewsk[^)]*" src/content | sort -u`),
  including redirects and variants, and check them with the API.
- Body: 800–1,600 words, following the models: an opening paragraph (who and
  why they matter), then `## Przed wojną`, one or more sections on 1914–1918
  (the core of the page, in the most detail), `## Po wojnie` (short), and
  `## Ocena` where historians assess them.
- Links: link our articles (`/<slug>`, `/bitwy/<slug>`) and other person
  pages (`/postacie/<slug>`) generously. Person pages may link any page,
  with no date rule. Use pl.wikipedia (checked: exists, not a disambiguation
  page, right subject) for anything we have no page for. First mention only,
  no duplicate targets. **Other people in this batch** (list below) will have
  pages: link them as `/postacie/<their-slug>`, using the slugs below exactly.
- Dates and figures as the sources give them; where sources differ, give
  both with attribution, or soften the wording.

## The English page: `src/content/en/people/<english-slug>.md`

Per `translation-brief.md`: `name`, `summary` (≤160), `role`, `country`,
`birthPlace`, `deathPlace`, `source: <polish-slug>`. The slug is usually the
same as the Polish one. Links byte for byte as in Polish. Then this must
print nothing for your files:

    node scripts/i18n-status.mjs 2>&1 | grep -v "no sourceHash" | grep -i "<english-slug>"

## Everyone in this batch (fixed slugs)

| slug | person |
|---|---|
| jan-kucharzewski | Jan Kucharzewski |
| jozef-ostrowski | Józef Ostrowski (regent) |
| jan-kanty-steczkowski | Jan Kanty Steczkowski |
| jozef-mikulowski-pomorski | Józef Mikułowski-Pomorski |
| jozef-swiezynski | Józef Świeżyński |
| jedrzej-moraczewski | Jędrzej Moraczewski |
| antoni-ponikowski | Antoni Ponikowski |
| jan-stecki | Jan Stecki |
| wladyslaw-studnicki | Władysław Studnicki |
| stanislaw-thugutt | Stanisław Thugutt |
| edward-rydz-smigly | Edward Rydz-Śmigły |
| kazimierz-sosnkowski | Kazimierz Sosnkowski |
| wladyslaw-sikorski | Władysław Sikorski |
| zygmunt-zielinski | Zygmunt Zieliński (general) |
| aleksandra-szczepanowska | Aleksandra Szczepanowska (later Piłsudska) |
| jozef-dowbor-musnicki | Józef Dowbor-Muśnicki |
| stanislaw-szeptycki | Stanisław Szeptycki |
| tadeusz-rozwadowski | Tadeusz Rozwadowski |
| boleslaw-roja | Bolesław Roja |
| karl-kuk | Karl Kuk |
| michal-bobrzynski | Michał Bobrzyński |
| leon-bilinski | Leon Biliński |
| juliusz-leo | Juliusz Leo |
| adam-tarnowski | Adam Tarnowski (Austro-Hungarian diplomat) |
| leon-wasilewski | Leon Wasilewski |
| marian-seyda | Marian Seyda |
| maurycy-zamoyski | Maurycy Zamoyski |
| wojciech-trampczynski | Wojciech Trąmpczyński |
| henryk-sienkiewicz | Henryk Sienkiewicz |

Check first that no page exists already: `ls src/content/postacie | grep <surname>`.

## Report (short)

For each person: paths, word count, `wikiTitles`, sources, conflicts with
our articles (file and what), anything you left out and why.
