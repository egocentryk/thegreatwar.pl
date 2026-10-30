# Brief: country pages ("Kraje w wojnie"), Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **country page**
(`/kraje/<slug>`, `/en/countries/<slug>`) tells one belligerent state's war
in one text: why and when it went to war, what it fought for, its fronts,
its home front, how its war ended and what it cost. Today countries exist on
the site only as tags; this page is the hub. You write the pages of your
group in Polish, their evidence files, and their English translations.
Scratch files go in the scratch folder the coordinator gives you, **outside
the repo**. Don't edit any other repo file, don't run the build, don't
commit, never touch `../thesecondwar.pl`.

## What the page shows by itself (don't repeat it as lists)

Under your text the page lists automatically, by the state's `name`: its
battle pages (where it is one of the sides), its person pages (`country:`),
its key dates (milestone articles with its tag), a link to all its tagged
articles, and its rows in "Wojna w liczbach" (`src/data/war-numbers.json`:
mobilised, military deaths, deaths as a share of the population). Your text
is the narrative that connects them. Where it gives those figures, they must
agree with the rows for your state (read them first).

## Read first

- `workflow.md` §4 (tone, links), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md` for the English part.
- `scripts/briefs/topics.md`: country pages work like topic guides (same
  evidence format, same checker). Model of form: a guide in
  `src/content/topics/` with its evidence in `scripts/evidence/topics/`.
- Your state's material on the site: its tag
  (`grep -rl "tags:.*<Name>" src/content/timeline`), milestone articles,
  battle pages, person pages (`grep -l "^country: <Name>" src/content/postacie/*`),
  the guides (`ls src/content/topics`) and the pre-war articles
  (`src/content/timeline/18*`, `190*`, `1910`–`1913`). **The page must not
  contradict them.** Where a source contradicts one of our pages, write
  what is certain and report the conflict (file + what); don't edit it.

## The Polish page: `src/content/countries/<slug>.md`

```yaml
---
name: Serbia                       # exactly as in the table (it is the tag)
title: Serbia w I wojnie światowej
summary: ≤160 characters, the state's war in one sentence
brief:
  - "3–5 points, one sentence each, numbers only as the body gives them"
side: Ententa                      # or: Państwa centralne
entered: 1914-07-28                # first day at war
left: 1918-11-11                   # the day it stopped fighting (armistice, separate peace, capitulation)
numbersAs: []                      # only if the table says so
order: 1
updated: 2026-10-30
authors: [Natalia]
sources:
  - "https://…"                    # 4–10 pages you opened and read, most important first, at least 2 not Wikipedia
---
```

`entered` / `left`: verify them. Where the end is not one day (Romania's
armistice, peace and re-entry; Russia's armistice and Brest-Litovsk;
Montenegro's capitulation), pick the day it stopped fighting and explain the
rest in the text.

Body, **1,000–1,600 words**:

- First paragraph (no heading): the state's war in 3–4 sentences, the part
  search engines quote.
- Then 4–6 `##` sections, for example: `## Droga do wojny` (short; the
  pre-war background in a paragraph or two), `## Przystąpienie do wojny`,
  one or two sections on its fronts, `## Front wewnętrzny` (politics,
  economy, society, occupation where relevant), `## Koniec wojny i bilans`.
  Plain encyclopaedic Polish, short paragraphs (3–6 sentences).
- **Poles:** where Polish matters touch the state (the partitioning powers,
  the Polish units in France or Russia), give them a paragraph, linking our
  Polish-thread pages; don't retell the guide "Sprawa polska".
- **Links:** a reference page, like the guides: link our pages generously
  (`/<timeline-slug>`, `/bitwy/<slug>`, `/postacie/<slug>`, `/tematy/<slug>`)
  at first mention, no date restriction, at least 15 of our pages. pl.wikipedia
  (checked: exists, not a disambiguation page, right subject) only for what we
  have no page for. First mention only, no duplicate targets. No pointer
  sentences.
- Figures as ranges with attribution where sources differ.

## Evidence: `scripts/evidence/countries/<slug>.json`

Exactly the guides' format (`scripts/briefs/topics.md`, "Evidence"): every
paragraph has an entry with 1–5 verbatim quotes that back every fact in it,
from our own pages (preferred) or from web pages in `sources:` that you
opened and read. Every number in a paragraph must appear in one of its
quotes. Check until it prints `0 problem(s)`:

    python3 -I scripts/checks/topics.py . --countries <slug>

## English: `src/content/en/countries/<english-slug>.md`

Front matter only `title`, `name` (English name of the state), `summary`,
`brief`, `source: <polish-slug>`. Translate per `translation-brief.md`;
links byte for byte as in Polish. Then stamp it and check:

    node scripts/i18n-status.mjs --stamp=<english-slug>
    node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"     # prints nothing

(Run the stamp once per file, not chained with `&&`: it exits 1 while any
other file in the repo has a problem, but it stamps.)

## The pages

| grp | name | slug | english slug | side | order | author | dates to check |
|---|---|---|---|---|---|---|---|
| A | Serbia | serbia | serbia | Ententa | 1 | Natalia | 28 VII 1914 – the armistices of XI 1918 |
| A | Czarnogóra | czarnogora | montenegro | Ententa | 2 | Łukasz Skowroń | entry VIII 1914 – capitulation I 1916 |
| A | Rumunia | rumunia | romania | Ententa | 10 | Natalia | 27 VIII 1916 – Focșani XII 1917 / Bucharest V 1918 / re-entry 10 XI 1918 |
| A | Grecja | grecja | greece | Ententa | 11 | Łukasz Skowroń | the National Schism; formal entry VI/VII 1917 – XI 1918 |
| B | Niemcy | niemcy | germany | Państwa centralne | 1 | Łukasz Skowroń | 1 VIII 1914 – 11 XI 1918 |
| B | Austro-Węgry | austro-wegry | austria-hungary | Państwa centralne | 2 | Natalia | 28 VII 1914 – 3/4 XI 1918 (Villa Giusti) |
| B | Imperium Osmańskie | imperium-osmanskie | ottoman-empire | Państwa centralne | 3 | Łukasz Skowroń | 29 X / 2 XI 1914 – Mudros 30/31 X 1918 |
| B | Bułgaria | bulgaria | bulgaria | Państwa centralne | 4 | Natalia | 14 X 1915 – Salonika 29/30 IX 1918 |
| C | Francja | francja | france | Ententa | 3 | Łukasz Skowroń | 3 VIII 1914 – 11 XI 1918 |
| C | Wielka Brytania | wielka-brytania | united-kingdom | Ententa | 4 | Natalia | 4 VIII 1914 – 11 XI 1918; `numbersAs: [Imperium Brytyjskie]` (the empire and dominions in a paragraph) |
| C | Rosja | rosja | russia | Ententa | 5 | Łukasz Skowroń | 1 VIII 1914 – armistice XII 1917 / Brest III 1918 (Julian dates!) |
| C | Belgia | belgia | belgium | Ententa | 6 | Natalia | 4 VIII 1914 – 11 XI 1918; occupation, the Yser front, Congo |
| D | Japonia | japonia | japan | Ententa | 7 | Łukasz Skowroń | 23 VIII 1914 – XI 1918 |
| D | Włochy | wlochy | italy | Ententa | 8 | Łukasz Skowroń | 24 V 1915 (Austria-Hungary; Germany VIII 1916) – 4 XI 1918 |
| D | Portugalia | portugalia | portugal | Ententa | 9 | Natalia | 9 III 1916 (Africa fighting from 1914) – XI 1918 |
| D | Stany Zjednoczone | stany-zjednoczone | united-states | Ententa | 12 | Łukasz Skowroń | 6 IV 1917 – 11 XI 1918 |

## Report (short)

Per page: paths, word count, sections, sources, the `entered`/`left` you
chose and why, conflicts with our pages (file + what), anything left out.
