# Brief: expand short articles (Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. Most of the first
articles (1914) were written short, before the site's depth rules settled.
You rewrite the body of the articles in your task at full length, with
sources, then update their English translations. Scratch files (downloads,
temporary scripts) go in the scratch folder the coordinator gives you,
**outside the repo**. Don't edit any other repo file, don't run the build,
don't commit.

## Read first

- `workflow.md` §4 (hard rules: links, front matter), §6 (accuracy), §8
  (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline articles; battle pages section for a
  battle page).
- A model of the length and tone wanted: `src/content/timeline/1917/04/krwawy-kwiecien.md`.
- For each article: its current text, its English file
  (`grep -rl "^source: <slug>$" src/content/en`), its `battle:` page if it
  has one, and **the neighbouring articles** — the same and adjacent days on
  the same subject (`ls src/content/timeline/1914/07 …`, `grep -ril
  "<keyword>" src/content/timeline/1914`). The expanded text must not
  contradict them, and must not retell in detail what a neighbour covers:
  give that context in a sentence and keep the article on its own event.

## What to write

- **Keep the front matter as it is**: title, category, front, battle, date,
  authors, dayOrder, tags, milestone, draft. The slug and the date stay.
  Add `sources:` at the end of the front matter (format as in the model).
  `summary` (≤ 160 characters) and `brief` ("W skrócie", 3–4 points) change
  only if a fact in them turns out wrong or no longer matches the text —
  every number in `brief` must appear in the body.
- **Length**: milestone articles 600–900 words, other articles 450–700, a
  battle page 1,000–1,500 (sections `## Nazwa i daty`, `## Tło`, the course
  in 2–4 `##` sections, `## Straty`, `## Znaczenie`). Timeline articles use
  2–4 `##` sections after an opening paragraph, as in the model. Length
  comes from substance — background, who decided what and why, the forces,
  what happened that day, the immediate consequences, quotations from
  documents where they matter (the text of an ultimatum, a declaration) —
  never from padding or repetition.
- **Hindsight**: a timeline article tells that day's events; later events
  only as a short look ahead.
- Keep the useful existing links; add new ones by the rules: pl.wikipedia
  only (checked: exists, not a disambiguation page, right subject), first
  mention only, `/postacie/<slug>` for people with a page (`ls
  src/content/postacie`), internal links (`/<slug>`, `/bitwy/<slug>`) **only
  backwards in time** — earlier articles, or the same date with a higher
  dayOrder; battles that started on or before the date; never the
  article's own `battle`. No pointer sentences.
- **Accuracy**: every fact from sources you **opened and read** (official
  histories on archive.org, the British Documents / Die Deutschen Dokumente
  / Diplomatische Aktenstücke / FRUS where relevant, firstworldwar.com
  primary documents, naval-history.net, longlongtrail, Polish sources for
  Polish topics; Wikipedia in other languages only for cross-checking).
  Hours, numbers and casualties where sources differ: soften or give the
  range with attribution. Julian vs Gregorian dates for Russia. Never from
  memory or search snippets.
- `sources:` 3–8 URLs actually opened, most important first, at least 2 not
  Wikipedia.
- If the existing text is wrong somewhere, fix it and list it in your
  report. If the date itself is wrong, keep it, say what sources show in
  the text (workflow.md §6), and report it.

## English

Translate the new body following `translation-brief.md`, into the existing
English file (keep its front matter; update its `summary`/`brief` only if
the Polish ones changed). Links byte for byte as in Polish. Then stamp it:
`node scripts/i18n-status.mjs --stamp=<english-slug>` and check
`node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` prints nothing.

## Check

`python3 -I scripts/checks/expand.py . <slug> [bitwy/<slug>] …` must end
with `0 problem(s)` for all your articles (a "note:" line is fine).

## Report (short)

Per article: slug, old → new word count, sources count, any fact you
corrected in the old text (what and why), any date problem, conflicts with
other pages (file + what).
