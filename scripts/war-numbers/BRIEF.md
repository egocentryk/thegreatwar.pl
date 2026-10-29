# Brief: "Wojna w liczbach" datasets for thegreatwar.pl

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War (PL + EN). The page `/wojna-w-liczbach` shows a few
headline figures and ranked horizontal bar charts. Disputed figures are
**ranges** (low–high): the bar is solid to the low estimate and lighter to
the high one, and a table under each chart lists every row's sources.

Model: thesecondwar.pl's version for WWII,
`/Users/lukaszskowron/Code/astro/thesecondwar.pl/src/data/war-numbers.json`
(read two datasets there for the tone of titles, notes and row notes).

You research **only your datasets** (named in your task) and write them to
`scripts/war-numbers/<your-part>.json` as `{ "<datasetKey>": Dataset, ... }`.
Do not edit anything else in the repo.

## Dataset format

```json
{
  "title": "Polegli żołnierze według państw", "titleEn": "Military deaths by country",
  "unit": "osób", "unitEn": "people",
  "note": "What exactly is counted (who, which borders, which years, what is excluded), and that the range is the spread of estimates in the sources.",
  "noteEn": "…",
  "rows": [
    { "label": "Niemcy", "labelEn": "Germany", "low": 1800000, "high": 2040000,
      "note": "Short: whose figure is which (e.g. 'Reichsarchiv: 2,04 mln; …')", "noteEn": "…",
      "sources": ["https://…", "https://…"] }
  ]
}
```

- 5–12 rows per chart, one unit per chart (people, boats, aircraft, %, …).
  Rows are ranked by the high value automatically (unless told otherwise).
- `low` = `high` when the sources agree; otherwise the honest spread of the
  serious estimates (not every outlier). Integers; % may have one decimal.
- Polish: decimal comma in notes ("2,04 mln"), English: "2.04 m".
- Labels: Polish country names as the site's articles use them
  ("Austro-Węgry", "Imperium Osmańskie", "Rosja", "Wielka Brytania" or
  "Imperium Brytyjskie" — say which in the note).

## The one hard rule: sources

- **Every row has ≥ 2 sources, at least one not Wikipedia**, and you
  **opened and read each one** (WebFetch) and saw the figure there. Never
  from memory or from search snippets alone. If a figure can't be confirmed
  in two opened sources, leave the row out.
- Good sources: national/official histories, IWM, CWGC, Australian War
  Memorial, Britannica, 1914-1918-online (may block bots), Polish:
  dzieje.pl, IPN, PWN encyclopedia, Muzeum Historii Polski, academic pages;
  en/pl Wikipedia tables are fine as one of the two, and to find the others.
- Then check the site's own articles: `grep -rn "<key figure or word>"
  src/content/timeline src/content/battles`. If an article gives a clearly
  different figure for the same thing, report it (file + figure) — don't
  edit it.

## Report back (short)

The datasets and row counts, any row you left out and why, sources that
refused automated reading, and conflicts with our articles (file + what).
