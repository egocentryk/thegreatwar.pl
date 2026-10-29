# Brief: one reading series for thegreatwar.pl

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **series** is a
hand-picked reading path through existing articles on one subject, shown on
`/serie/<slug>` (and `/en/series/<slugEn>`) as an intro plus numbered steps
grouped by year; each step has a one-sentence "why read this" note. Member
articles get a "Z serii" box with previous / next. Model: the series of
thesecondwar.pl (`/Users/lukaszskowron/Code/astro/thesecondwar.pl/src/data/series.ts`,
read the "wrzesien-1939" entry for tone and length).

You write **one** series (subject in your task). Write only your own draft
file `scripts/series/<slug>.json`; do not edit anything else in the repo.

## Choosing the steps

- 8–18 steps (aim for 10–16), in date order, from existing pages only:
  timeline articles (`src/content/timeline/YYYY/MM/<slug>.md`, ref
  `<slug>`) and battle pages (`src/content/battles/YYYY/<slug>.md`, ref
  `bitwy/<slug>`). Find candidates with grep on titles, summaries and tags,
  e.g. `grep -l "Legion" -r src/content/timeline | xargs grep -h "^title:"`.
- Prefer the articles that carry the story: beginnings, turning points,
  ends, consequences. Mix events and battle pages. Don't pad: every step
  must earn its place. A milestone (`milestone: true`) is a good sign, not a
  requirement.
- `overview` (optional): one battle page that tells the whole story in one
  text (e.g. `bitwy/bitwa-pod-verdun` for Verdun). It is not also a step.
- Every step needs an English page (`src/content/en/{timeline,battles}/*.md`
  whose front matter has `source: <polish slug>`); the checker tells you.

## Writing

- `title` / `titleEn`: short, a name a reader would search for.
- `lead` / `leadEn`: one line for cards (≤ 90 chars), no figures.
- `intro` / `introEn`: 3–5 sentences (60–110 words in Polish): what happened,
  why it matters, and what the series walks through ("Seria prowadzi od … po
  …"). Each sentence backed by 1–3 verbatim quotes from the articles
  (Polish sentences from Polish files, English from English files).
- `note` per step, PL and EN, ≤ 220 characters, **why this step is in the
  series** (its role in the story), not a summary of the summary. Each note
  in each language is backed by **one verbatim quote from that step's own
  article** (the same language file) that supports what the note says.
  The first notes round on the other site skimmed summaries and invented
  links between steps; read the article before writing its note.
- Every number (dates, figures) in a note or intro sentence must appear in
  its quote(s), written the same way. Markdown links are stripped before
  matching, so quote the link text.
- Plain, factual Polish, as in the articles; English British spelling as in
  the English articles. Use the names as the articles spell them.

## Output format

```json
{
  "slug": "legiony-polskie", "slugEn": "polish-legions",
  "title": "Legiony Polskie", "titleEn": "The Polish Legions",
  "lead": "…", "leadEn": "…",
  "intro": [ {"text": "Zdanie.", "quotes": [{"file": "src/content/timeline/1914/08/x.md", "quote": "…"}]} ],
  "introEn": [ {"text": "Sentence.", "quotes": [{"file": "src/content/en/timeline/x.md", "quote": "…"}]} ],
  "overview": "bitwy/…",
  "steps": [
    {"ref": "pierwsza-kompania-kadrowa", "note": {"pl": "…", "en": "…"},
     "quote": {"pl": "verbatim from the Polish article", "en": "verbatim from the English article"}}
  ]
}
```

Check until it prints `0 problem(s)`:

    cd /Users/lukaszskowron/Code/astro/thegreatwar.pl && python3 -I scripts/series/check.py . scripts/series/<slug>.json

Report back briefly: the steps (ref + one-line why), what you left out and
why, and any inconsistencies you noticed between articles (file + what).
