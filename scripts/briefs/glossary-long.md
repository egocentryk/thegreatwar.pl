# Brief: longer glossary texts, Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. The glossary
(`/slownik/<slug>`, `/en/glossary/<slugEn>`, data in `src/data/glossary.json`)
gives each term a hover definition (`short`) and two short paragraphs
(`long`, ~130 words) on its page. Our articles still link the most used
terms to pl.wikipedia: Krzyż Wiktorii alone 161 times. The term's page gets
a **longer text** of our own (300–600 words, with links into the site), and
those links are then pointed at it (expansion-plan.md C). You write the
texts of your group in Polish, their evidence files, and their English
translations. Scratch files go in the scratch folder the coordinator gives
you, **outside the repo**. Don't edit any other repo file (not
`glossary.json` either), don't run the build, don't commit, never touch
`../thesecondwar.pl`.

## Our own writing, never copied

Every text is our own, written from the sources, not paraphrased sentence
by sentence from one of them. The checker fetches the pl.wikipedia article
of every `wikiTitles` entry and flags every run of 8 or more words the text
shares with it. Read Wikipedia for orientation if you like, then write from
the other sources and our own articles.

## What the page shows by itself (don't repeat it)

Above your text: the term, its expansion, the hover definition (`short`,
which stays). Beside it: "Zobacz też" (the entry's `see`) and other terms of
the category. Below: every article that uses the term, by year. Your text
replaces the two `long` paragraphs: it must cover what they say (don't
contradict them, nor the `short`) and go further: what the thing was, how
it worked in this war, what it meant, with the war's own examples. It is a
glossary text, not a history of the institution: centuries before 1914 in
a sentence or two, after 1918 in a sentence or two (Traktat wersalski and
Liga Narodów naturally reach 1919–1920).

## Read first

- `workflow.md` §4 (tone, links), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md` for the English part.
- `scripts/briefs/topics.md`: the same evidence format and checker as the
  guides. Model of form: a place page, e.g. `src/content/places/kotor.md`
  with `scripts/evidence/places/kotor.json`.
- The term's entry in `src/data/glossary.json` (`short`, `long`, `see`,
  `sources`) and the articles that link the wikiTitles today
  (`grep -rl "pl.wikipedia.org/wiki/<Title>" src/content`, title URL-encoded
  or not). **The text must not contradict our pages.** Where a source
  contradicts one of them, write what is certain and report the conflict
  (file + what); don't edit it.

## The Polish text: `src/content/glossary/<glossary slug>.md`

```yaml
---
term: Krzyż Wiktorii              # as in glossary.json
wikiTitles: ["Krzyż_Wiktorii"]    # the coordinator's list
updated: 2026-10-31
authors: [Natalia]
sources:
  - "https://…"                   # 4–8 pages you opened and read, most important first, at least 2 not Wikipedia
---
```

Body: **300–600 words**. A first paragraph (no heading) that says what the
term means in 2–3 sentences, then either plain paragraphs or 2–3 `##`
sections (for example: what it was, in this war, what it left). Plain
encyclopaedic Polish, short paragraphs. Figures as ranges with attribution
where sources differ; never write a figure in words to get past the number
check.

Links: our pages at their first mention, **at least 4 different ones**
(articles, battle pages, people, guides, countries, places, other glossary
terms as `/slownik/<slug>`); a glossary text is a reference page, so it may
link any date. pl.wikipedia only for things we have no page for (checked:
exists, not a disambiguation page, right subject), never the term's own
article. No pointer sentences ("see also…").

## Evidence: `scripts/evidence/glossary/<glossary slug>.json`

Exactly the format of `scripts/briefs/topics.md` (every paragraph, 1–5
verbatim quotes, every number in a quote; prefer our own articles; web
quotes only from pages you opened, listed in `sources`).

## Check

    cd /Users/lukaszskowron/Code/astro/thegreatwar.pl && python3 -I scripts/checks/topics.py . --glossary <slug>

must print `0 problem(s)`.

## English: `src/content/en/glossary/<slugEn>.md`

Front matter only `term` (the English `termEn`) and `source: <glossary
slug>`. Body translated per `translation-brief.md`, links byte for byte as
in Polish. Then:

    node scripts/i18n-status.mjs --stamp=<slugEn>
    node scripts/i18n-status.mjs 2>&1 | grep "<slugEn>"     # must print nothing

## New terms (Kalendarz juliański, Izba Gmin)

They have no glossary entry yet. Write the entry first, in the format and
limits of `scripts/briefs/glossary.md` (read it), as one JSON list in
`scripts/evidence/glossary/<file the coordinator names>.json`, and check it:

    python3 -I scripts/checks/glossary.py . scripts/evidence/glossary/<file>.json

(0 problems, **without `--merge`**: the coordinator merges). Then the
longer text as above, with the slug you chose. Until the merge, the
checker can't see links to `/slownik/<new slug>` from other texts: don't
link one new term from the other.

## Batch 1 (2026-10-31)

| grp | glossary slug / slugEn | wikiTitles | author |
|---|---|---|---|
| H | `krzyz-wiktorii` / `victoria-cross` | Krzyż_Wiktorii | Łukasz Skowroń |
| H | `pour-le-merite` / `pour-le-merite` | Pour_le_Mérite | Natalia |
| H | `askarysi` / (as in glossary.json) | Askarysi | Łukasz Skowroń |
| I | new: kalendarz juliański | Kalendarz_juliański, Kalendarz_gregoriański | Natalia |
| I | new: Izba Gmin | Izba_Gmin | Łukasz Skowroń |
| I | `pow` / (as in glossary.json) | Polska_Organizacja_Wojskowa | Natalia |
| J | `traktat-wersalski` / `treaty-of-versailles` | Traktat_wersalski | Łukasz Skowroń |
| J | `liga-narodow` / (as in glossary.json) | Liga_Narodów | Natalia |
| J | `plan-schlieffena` / (as in glossary.json) | Plan_Schlieffena | Łukasz Skowroń |
| K | `sterowiec` / (as in glossary.json) | Sterowiec | Natalia |
| K | `miotacz-ognia` / (as in glossary.json) | Miotacz_ognia | Łukasz Skowroń |
| K | `mina-morska` / (as in glossary.json) | Mina_morska | Natalia |
| L | `blokada` / (as in glossary.json) | Blokada_morska | Łukasz Skowroń |
| L | `statek-szpitalny` / (as in glossary.json) | Statek_szpitalny | Natalia |
| L | `krazownik-pomocniczy` / (as in glossary.json) | Krążownik_pomocniczy | Łukasz Skowroń |

Notes:
- Krzyż Wiktorii: who got it and for what, how many in this war (sources
  differ: give the range), the dominions' and India's recipients, a few of
  our articles' recipients as examples (link them), posthumous awards.
- Pour le Mérite: officers only, the airmen's "Blue Max" and the rule of
  victories (Boelcke, Immelmann, Richthofen), the U-boat captains, the oak
  leaves; its end with the monarchy in 1918.
- Askarysi: the Schutztruppe's African soldiers and porters, Lettow-Vorbeck,
  the British side's African troops (KAR) in a sentence, the cost to the
  porters and civilians.
- Kalendarz juliański: why Russia (and the Balkan states, the Ottoman
  Empire's own calendars in a sentence) used other dates, the 13-day
  difference in 1914–1918, how our chronicle dates events (the
  revolutions: "lutowa" in March, "październikowa" in November), the
  Soviet switch in February 1918.
- Izba Gmin: the House of Commons in the war: the parliament that voted
  credits and conscription, the Asquith and Lloyd George governments, the
  secret sessions, the 1918 franchise and the "coupon election". One
  sentence on the Lords; the Lords is not this term.
- POW: Piłsudski's secret organisation 1914–1918, its role in 1914–1915,
  after the oath crisis, November 1918 disarming the Germans; don't retell
  the formations guide (`tematy/polskie-formacje-wojskowe`): link it.
- Traktat wersalski: how it was made (the conference, the Big Four), the
  main terms (territory, the army, reparations, "war guilt" article 231),
  what it gave Poland, the ratification and the US refusal; the treaties
  with the other Central Powers in one sentence.
- Liga Narodów: Wilson's idea and the fourteen points, the Covenant as part
  of the treaties, the seat in Geneva, the US absence; its later work in a
  sentence or two only.
- Plan Schlieffena: the idea (France first, through Belgium), Moltke's
  changes, how it went in August–September 1914 and why it failed (the
  Marne); historians' debate in a sentence.
- Sterowiec: rigid airships (Zeppelin, Schütte-Lanz), the navy's and army's
  raids on Britain, the defences and losses, other uses (scouting at sea,
  the L 59 Africa flight if our pages mention it).
- Miotacz ognia: the German Flammenwerfer, first uses (Malancourt 1915,
  Hooge 1915), the specialist units, other armies' versions, its effect.
- Mina morska: contact mines, minefields (the North Sea barrages, the
  Dardanelles), the minelayers and sweepers, famous losses (link them).
- Blokada: the British distant blockade, the Declaration of London and its
  abandonment, contraband and neutrals, its effect on Germany (the hunger
  of 1916–1918; figures as ranges), the German answer (U-boats: link the
  guide).
- Statek szpitalny: the Hague rules, the markings, the sinkings (Britannic,
  Anglia, Llandovery Castle; link them) and the disputes over them.
- Krążownik pomocniczy: armed merchant ships, German raiders and British
  cruisers of the blockade; the cases our pages tell (link them).

## Report (short)

Per text: paths, words, sources, internal links, conflicts with our pages
(file + what), anything left out and why. For the new terms also the
glossary.py result and the slugs chosen.
