# Brief: place pages ("Miejsca"), Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **place page**
(`/miejsca/<slug>`, `/en/places/<slug>`) tells what one city, river,
island, canal or sea meant **in the war**: why it mattered, what happened
there and when, how the war changed it. It replaces the pl.wikipedia link
our articles give for the place today (expansion-plan.md C). It is not a
geography or history entry: no founding dates, population tables or
centuries of history beyond a sentence of context. You write the pages of
your group in Polish, their evidence files, and their English translations.
Scratch files go in the scratch folder the coordinator gives you, **outside
the repo**. Don't edit any other repo file, don't run the build, don't
commit, never touch `../thesecondwar.pl`.

## Our own writing, never copied

Every page is our own text, written from the sources, not paraphrased
sentence by sentence from one of them. The checker fetches the pl.wikipedia
article of every `wikiTitles` entry and flags every run of 8 or more words
the page shares with it. Read Wikipedia for orientation if you like, then
write from the other sources and our own articles.

## What the page shows by itself (don't repeat it as lists)

Under your text the page lists automatically: the battle pages that link
the place or were fought within `radiusKm` of its point, and every timeline
article that links the place, by year (after this pilot, the links our
articles give to the place's pl.wikipedia page are pointed here). There is
a locator map from `lat`/`lon`. Your text is the narrative that connects
them: link the key ones in the text, don't list them.

## Read first

- `workflow.md` §4 (tone, links), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md` for the English part.
- `scripts/briefs/topics.md`: place pages use the same evidence format and
  checker as guides and country pages. Model of form: a country page in
  `src/content/countries/` with its evidence in `scripts/evidence/countries/`.
- Your place on the site: the articles that link it today
  (`grep -rl "pl.wikipedia.org/wiki/<Title>" src/content/timeline src/content/battles`,
  with the title as in `wikiTitles`, URL-encoded or not), the battle pages
  nearby, the person pages, guides and country pages that mention it. **The
  page must not contradict them.** Where a source contradicts one of our
  pages, write what is certain and report the conflict (file + what); don't
  edit it.

## The Polish page: `src/content/places/<slug>.md`

```yaml
---
name: Saloniki                     # as our articles name it
title: Saloniki w I wojnie światowej
summary: ≤160 characters, the place's war in one sentence
brief:
  - "3–5 points, one sentence each, numbers only as the body gives them"
kind: miasto                       # miasto | rzeka | region | wyspa | akwen | kanał
in1914: Grecja                     # the state it belonged to in 1914, as the table says
today: Grecja
front: Front bałkański             # as the table says
lat: 40.64
lon: 22.94
radiusKm: 40
wikiTitles: ["Saloniki"]
updated: 2026-10-31
authors: [Natalia]
sources:
  - "https://…"                    # 4–10 pages you opened and read, most important first, at least 2 not Wikipedia
---
```

Body: **400–900 words**. A first paragraph (no heading) with the answer in
3–4 sentences: what the place was in the war. Then 2–5 `##` sections in
time order (for example: before the war, the war years in 2–3 phases, what
the war left). Plain encyclopaedic Polish, short paragraphs. Figures as
ranges with attribution where sources differ.

Links: our pages at their first mention, **at least 5 different ones** (the
articles, battle pages, people, guides and country pages of the place's
war); a place page is a reference page, so it may link any date. pl.wikipedia
only for things we have no page for (checked: exists, not a disambiguation
page, right subject), never the place's own article. No pointer sentences.

## Evidence: `scripts/evidence/places/<slug>.json`

Exactly the format of `scripts/briefs/topics.md` (every paragraph, 1–5
verbatim quotes, every number in a quote; prefer our own articles; web
quotes only from pages you opened, listed in `sources`).

## Check

    cd /Users/lukaszskowron/Code/astro/thegreatwar.pl && python3 -I scripts/checks/topics.py . --places <slug>

must print `0 problem(s)`. It checks the evidence, the links, the sources
(2+ not Wikipedia), the length, the 5+ internal links and the copy check.

## English: `src/content/en/places/<english-slug>.md`

Front matter only `title`, `summary`, `brief`, `name` (the English name),
`source: <polish-slug>`. Body translated per `translation-brief.md`, links
byte for byte as in Polish. Then:

    node scripts/i18n-status.mjs --stamp=<english-slug>
    node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"     # must print nothing

## The pilot (2026-10-31)

| grp | slug / English slug | name (PL / EN) | kind | in1914 / today | front | lat, lon | radiusKm | wikiTitles | author |
|---|---|---|---|---|---|---|---|---|---|
| A | `saloniki` / `salonika` | Saloniki / Salonika | miasto | Grecja / Grecja | Front bałkański | 40.64, 22.94 | 40 | Saloniki | Natalia |
| A | `korfu` / `corfu` | Korfu / Corfu | wyspa | Grecja / Grecja | Front bałkański | 39.62, 19.92 | 30 | Korfu | Łukasz Skowroń |
| B | `ypres` / `ypres` | Ypres / Ypres | miasto | Belgia / Belgia | Front zachodni | 50.85, 2.885 | 15 | Ieper | Łukasz Skowroń |
| C | `kanal-sueski` / `suez-canal` | Kanał Sueski / Suez Canal | kanał | Egipt / Egipt | Bliski Wschód | 30.6, 32.33 | 60 | Kanał_Sueski | Natalia |
| C | `bagdad` / `baghdad` | Bagdad / Baghdad | miasto | Imperium Osmańskie / Irak | Bliski Wschód | 33.31, 44.36 | 60 | Bagdad | Łukasz Skowroń |

Notes:
- Saloniki: the Allied landing (1915), the "Armée d'Orient" and the
  entrenched camp, Venizelos's government (1916), the great fire (1917), the
  offensive of 1918; the city of many nations.
- Korfu: the Serbian army's evacuation and recovery (1916), the "island of
  death" (Vido), the Corfu Declaration (1917), the French naval base.
- Ypres: the salient and its five battles (link the battle pages, don't
  retell them), the destroyed Cloth Hall, gas in 1915, the city's ruin and
  memory (Menin Gate only if the date is within or shortly after the war;
  one sentence).
- Kanał Sueski: why it mattered to Britain, the Ottoman attacks (1915,
  1916), its defence and shipping; Egypt's status (British occupation, the
  protectorate of December 1914) in a sentence; the city of Suez is not
  this page.
- Bagdad: the goal of the Mesopotamian campaign, the 1915 advance and
  Ctesiphon, Kut, the capture in March 1917 and Maude's proclamation, the
  railway (Bagdadbahn) in a sentence.

## Report (short)

Per page: paths, words, sources, internal links, conflicts with our pages
(file + what), anything left out and why.
