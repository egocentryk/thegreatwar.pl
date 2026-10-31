# Brief: "Siły zbrojne" pages, Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **force page**
(`/sily-zbrojne/<slug>`, `/en/armed-forces/<slug>`) tells one army, fleet or
air service across the war: when and why it was formed, what it was made
of, who commanded it, where it fought, how it changed, what became of it.
It replaces the pl.wikipedia link our articles give for the force today
(expansion-plan.md C). It is not an order of battle: no lists of units,
ships or aircraft types beyond the few that tell its story. You write the
page of your force in Polish, its evidence file and its English translation.
Scratch files go in the scratch folder the coordinator gives you, **outside
the repo**. Don't edit any other repo file, don't run the build, don't
commit, never touch `../thesecondwar.pl`.

**The rules of `scripts/briefs/places.md` apply** (read it whole): our own
writing, never copied (the same copy check against pl.wikipedia); read
first; must not contradict our pages (report conflicts, don't edit); the
evidence format; the English part and stamping. What differs is below.

## What the page shows by itself (don't repeat it as lists)

Header: kind, state (a link to its country page), period (`formed` –
`disbanded`), author, date. Beside the text: "Dowódcy i ludzie", the person
pages listed in `people` with their role line. Under the text: the battle
pages and every timeline article that link the force, by year (after the
pilot, the links our articles give to the force's pl.wikipedia page are
pointed here). Your text is the narrative that connects them: link the key
ones in the text, don't list them.

## The Polish page: `src/content/forces/<slug>.md`

```yaml
---
name: Grand Fleet                  # as our articles name it
title: Grand Fleet w I wojnie światowej
summary: ≤160 characters, the force's war in one sentence
brief:
  - "3–5 points, one sentence each, numbers only as the body gives them"
kind: flota                        # armia | flota | lotnictwo | korpus | formacja
country: wielka-brytania           # a file name in src/content/countries
formed: 1914-08-04                 # verified; the day it came into being under this name
disbanded: 1919-04-07              # verified; omit if it outlived the war as the same force
people: [john-jellicoe, david-beatty]   # existing files in src/content/postacie, in order of importance
wikiTitles: ["Grand_Fleet"]
updated: 2026-10-31
authors: [Natalia]
sources:
  - "https://…"                    # 4–10 pages you opened and read, at least 2 not Wikipedia
---
```

Body: **500–900 words**. A first paragraph (no heading) with the answer in
3–4 sentences: what the force was and what it did in the war. Then 3–5 `##`
sections in time order (for example: origins and 1914, the war years in
2–3 phases, the end). Figures (strength, losses) as ranges with attribution
where sources differ. **At least 5 different internal links**; never the
force's own pl.wikipedia article. The glossary has terms for many things
(`src/data/glossary.json`, link `/slownik/<slug>`), the site has place
pages (`/miejsca/<slug>`) and country pages (`/kraje/<slug>`).

## Evidence, check, English

- Evidence: `scripts/evidence/forces/<slug>.json`, the format of
  `scripts/briefs/topics.md`.
- Check: `python3 -I scripts/checks/topics.py . --forces <slug>` must print
  `0 problem(s)`.
- English: `src/content/en/forces/<english-slug>.md`, front matter only
  `title`, `summary`, `brief`, `name` (English), `source: <polish-slug>`;
  links byte for byte as in Polish; then
  `node scripts/i18n-status.mjs --stamp=<english-slug>` and
  `node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` prints nothing.

## The pilot (2026-10-31)

| slug / English slug | name (PL / EN) | kind | country | wikiTitles | author |
|---|---|---|---|---|---|
| `royal-flying-corps` / `royal-flying-corps` | Royal Flying Corps / Royal Flying Corps | lotnictwo | wielka-brytania | Royal_Flying_Corps | Łukasz Skowroń |
| `grand-fleet` / `grand-fleet` | Grand Fleet / Grand Fleet | flota | wielka-brytania | Grand_Fleet | Natalia |
| `flota-pelnomorska` / `high-seas-fleet` | Flota Pełnomorska / High Seas Fleet | flota | niemcy | Hochseeflotte | Łukasz Skowroń |

Notes:
- Royal Flying Corps: formed 1912 (army wing; the naval wing became the
  RNAS), the squadrons in France in August 1914 and reconnaissance at Mons
  and the Marne, growth under Trenchard, the "Fokker scourge" and "Bloody
  April" 1917 (glossary/articles), the home defence against airships and
  Gothas, the merger with the RNAS into the RAF on 1 April 1918. The RNAS
  and the RAF are not this page (one sentence each).
- Grand Fleet: formed at the outbreak from the Home Fleets, the base at
  Scapa Flow (and Rosyth), Jellicoe, the distant blockade's backbone,
  Jutland (`bitwa-jutlandzka` if it exists; check `src/content/battles`),
  Beatty from November 1916, the American battleships (6th Battle
  Squadron), the surrender of the High Seas Fleet in November 1918, its
  end in April 1919.
- Flota Pełnomorska: Tirpitz's fleet and the naval race (two sentences),
  the "fleet in being", Ingenohl, Pohl, Scheer, the raids on the English
  coast and Dogger Bank, Jutland, the U-boat war taking its men and role,
  the mutinies of 1917 and November 1918 (Kiel), internment at Scapa Flow
  and the scuttling of 21 June 1919. Our articles call it "High Seas
  Fleet" in 42 places and "Flota Pełnomorska" in 26: use "Flota
  Pełnomorska (Hochseeflotte)" at first mention, then "Flota Pełnomorska".
- The glossary has one term for both fleets (`/slownik/grand-fleet`,
  "Grand Fleet i Flota Pełnomorska"): don't contradict it; you may link it
  once.

## Report (short)

Per page: paths, words, sources, internal links, people listed, the
`formed`/`disbanded` dates with their source, conflicts with our pages
(file + what), anything left out and why.
