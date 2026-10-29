# Brief: battle pages and campaign overviews (Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. You write the
battle pages in your task (a campaign overview that groups existing battles,
or a single battle) in Polish, then their English translations. Scratch
files (downloads, temporary scripts) go in a scratch folder **outside the
repo** (the scratchpad path the coordinator gives you, or `mktemp -d`; never
inside the repo). Don't edit any other repo file, don't run the build,
don't commit.

## Read first

- `workflow.md` §4 (hard rules: front matter, links, battles), §6 (accuracy),
  §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (the English battle page section).
- The model campaign page: `src/content/battles/1914/kampania-serbska-1914.md`
  and its English `src/content/en/battles/serbian-campaign-of-1914.md`.
- **Every existing battle page of your campaign** (listed in your task) and
  the key timeline articles on it (`grep -ril "<keyword>" src/content/timeline`).
  Your page tells the whole campaign in one text; it must **not contradict**
  these pages. Where sources disagree with them, say so in your report.

## The Polish page

`src/content/battles/<startYear>/<slug>.md`, front matter in the workflow
order (title, summary ≤ 160 chars, front, phase, startDate, endDate,
location, sides, result, authors, tags, milestone: false, sources). Slug,
dates, phase and author are fixed in your task — if research shows a date
is wrong, keep the slug, choose the defensible date, explain it in
"## Nazwa i daty" and report it.

- Body: a campaign overview 2,000–3,000 words, a single battle 1,000–2,000: `## Nazwa i daty`, `## Tło`, then the course in
  3–5 chronological `##` sections, `## Straty`, `## Znaczenie`.
- `sources:` 4–8 URLs you **opened and read** (official histories on
  archive.org, naval-history.net, AWM, nzhistory, Wikipedia in other
  languages only for cross-checking…). Never from memory or snippets.
- Tags: 3–4 from the existing vocabulary, each already used by at least one
  timeline article (`grep -rh '^tags:' src/content/timeline | …`).
- Links: pl.wikipedia only, checked (exists, not a disambiguation page,
  right subject); first mention only; `/postacie/<slug>` for people who have
  a page. **Internal links (`/slug`, `/bitwy/slug`) only to content dated
  before your page's startDate** — so do not link the campaign's own
  sub-battles or its timeline articles (they are listed automatically on
  the page). No pointer sentences.
- Plain, encyclopaedic Polish like the model; figures as ranges with
  attribution where sources differ.

## The English page

Translate it following `translation-brief.md` (battle pages section):
`src/content/en/battles/<english-slug>.md`, only title, summary, location,
sides, result, source. Links byte for byte as in Polish. Then run
`node scripts/i18n-status.mjs 2>&1 | grep -v "no sourceHash" | grep -i "<english-slug>"`
— it must print nothing for your file.

## Single battles

For a single battle that belongs to a larger one (e.g. a part of Vittorio
Veneto), read the larger page first and keep consistent with it; you may
link it if it started before or on your start date (the workflow's
precedent for sub-battles). Model: `src/content/battles/1916/bitwa-pod-asiago.md`.

## Report (short)

Polish and English paths, word count, the sources, any date you changed and
why, conflicts with existing pages (file + what), suggested coordinates
(lat/lon of a sensible centre point for the map).
