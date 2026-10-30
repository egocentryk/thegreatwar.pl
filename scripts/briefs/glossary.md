# Brief: new glossary terms (Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Its glossary
("Słownik", `/slownik`, `/en/glossary`) has 84 terms in
`src/data/glossary.json`. Each term gets a page, and its first mention in
every article is marked with a hover card. You write the terms in your
task, in Polish and English. Scratch files go in the scratch folder the
coordinator gives you, **outside the repo**. Write only your evidence
file; don't edit `glossary.json` or anything else, don't run the build,
don't commit.

## Read first

- `src/utils/glossary.ts` (how patterns become JavaScript regexes) and
  `scripts/checks/glossary.py` (what is checked).
- At least six existing entries in `src/data/glossary.json`, e.g. `pow`,
  `ententa`, `haubica`, `blokada`, `racjonowanie`, `kryzys-lipcowy`. Match
  their tone, length and structure exactly.
- The existing terms' patterns: don't duplicate a term that is already
  there, and don't overlap one (e.g. `drednot` already matches
  "pancernik", `gaz-bojowy` matches "iperyt", `mlodoturcy` matches
  "Komitet Jedności i Postępu", `haubica` is "Artyleria ciężka").
- The articles that use your term: `grep -rli "<stem>" src/content/timeline
  src/content/battles src/content/postacie`. The definition must not
  contradict them; report it if one of them is wrong.

## An entry

`{"slug", "slugEn", "term", "termEn", "category", "pattern", "patternEn",
"expansion", "expansionEn", "short", "shortEn", "long", "longEn", "see",
"sources"}` and, only when needed, `"exclude"`.

- `slug`: Polish, lowercase, transliterated; `slugEn`: English.
- `category`: `sprawa-polska`, `wojsko`, `bron`, `morze`, `polityka`,
  `rewolucja` or `okupacja` (Occupation and civilians, incl. the home front).
- `expansion`: the full form of an abbreviation, else `""`.
- `short` (the hover card): one or two sentences, 120–220 characters, what
  it is and its role in this war.
- `long`: exactly 2 paragraphs, 600–1,150 characters together: origin,
  how it worked or developed in 1914–1918, key dates and figures, what came
  of it. Figures as ranges with attribution where sources differ.
- `see`: 1–6 refs: a timeline slug, `bitwy/<slug>`, `postacie/<slug>` or
  `tematy/<slug>`. **The first is the term's main page**: the article most
  about it, which the pattern must match (the term isn't marked there).
  Add a guide (`ls src/content/topics`) or person page when relevant.
- `sources`: 2–6 URLs you **opened and read**, at least one not Wikipedia
  (dzieje.pl, PWN-like encyclopedias that load, muzea, IWM/AWM/nzhistory
  if they load, archive.org books, academic articles, official sites).
  Never from memory or search snippets.

## Patterns (the hard part)

`pattern` matches the term in Polish article text, with all inflected forms;
`patternEn` in English. Case-sensitive, no flags. Use `\w` and `\b` the way
existing entries do (`glossary.ts` makes them Unicode-aware). Prefer stems
with `\w*` (`Lig\w* Narodów`), alternatives with `|`, a negative lookahead
for known collisions. Then **look at every match** (the checker prints
counts and samples; also grep yourself): a pattern that marks the wrong
thing is worse than one that misses a form. Known traps from the first
batch: "twierdza" vs "twierdzić", "gaz" vs "gazeta", "Duma" vs "Dumba",
"Czeka" vs "czekać"; naval mines vs tunnel mines. Where a pattern means
something else on a page, list that page in `exclude` (timeline slug or
`bitwy/<slug>`). Each pattern must match at least 3 pages in its language;
if a term really occurs in fewer, drop it and say so.

## Output and check

Write a JSON list of your entries to `scripts/evidence/glossary/<group>.json`
(UTF-8, `ensure_ascii=False`, indent 1). Run
`python3 -I scripts/checks/glossary.py . scripts/evidence/glossary/<group>.json`;
it must end with `0 problem(s)`. Read its sample matches.

## Report (short)

Per term: slug, PL/EN page counts, main page, any term dropped or merged
and why, figures where sources disagree (what you chose), thin sourcing,
anything wrong you noticed in existing articles (file + what).
