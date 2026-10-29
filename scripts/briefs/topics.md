# Brief: one topic guide (Polish + English) for thegreatwar.pl

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **topic guide**
(`/tematy/<slug>`) answers one broad question in one text: "Przyczyny I
wojny światowej", "Sprawa polska 1914–1918"… It is what a student or a
curious reader searches for, and the hub that leads into our dated articles.
You write one guide in Polish, its evidence file, and its English translation.
Scratch files go in a scratch folder **outside the repo** (the scratchpad path the coordinator gives you, or `mktemp -d`; never inside the repo) (delete it when done). Don't
edit any other repo file, don't run the build, don't commit.

## Read first

- `workflow.md` §4 (tone, links, tags), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md` for the English part.
- The articles, battle pages and person pages your guide draws on (find them
  with grep on titles, tags and bodies). **The guide must not contradict
  them.** Where a source contradicts one of our articles, write what is
  certain, and report the conflict.
- Tone and length model for a long text: `src/content/battles/1916/bitwa-nad-somma.md`.
- The four published guides in `src/content/topics/` (and their evidence in
  `scripts/evidence/topics/*.json`): match their form, and don't contradict them
  where your topic overlaps.

## The Polish guide: `src/content/topics/<slug>.md`

Front matter, this order:

```yaml
---
title: Przyczyny I wojny światowej
question: "Dlaczego wybuchła I wojna światowa?"   # the question as readers search it; headline on /tematy
summary: ≤160 chars, answers the question in one sentence (shown under the title and in search results)
brief:
  - "3–5 points, each one sentence, numbers only as the body gives them"
order: 1
updated: 2026-10-29
series: lato-1914          # optional, a slug from src/data/series.ts
authors: [Łukasz Skowroń]
sources:
  - "https://…"            # 4–10 pages you opened and read, most important first
---
```

Body, 1,800–2,800 words:

- First paragraph (no heading): the answer in 3–4 sentences. It is the part
  search engines quote.
- Then 5–8 `##` sections in a logical order, plain encyclopaedic Polish,
  short paragraphs (3–6 sentences). End with a section on how historians see
  it, if there is a real debate (attribute views: "Fritz Fischer uważał…").
- **Links:** link our pages generously, since this is the hub. Use
  `/<timeline-slug>`, `/bitwy/<slug>` and `/postacie/<slug>` at their first
  mention. No date restriction here: a guide may link any article. Link at
  least 20 of our pages; 40–50 is fine when the text needs them (person
  pages included). There is no hard cap. Other guides may be linked as `/tematy/<slug>` (the build maps them to the English guide). Use pl.wikipedia (checked: exists, not a disambiguation page,
  right subject) only for things we have no page for. First mention only, no
  duplicate targets.
- No pointer sentences ("więcej w artykule…"). The links carry the reader.
- Figures as ranges with attribution where sources differ.

## Evidence: `scripts/evidence/topics/<slug>.json`

Every paragraph needs an entry, with 1–5 verbatim quotes that together back
every fact in it:

```json
{"slug": "przyczyny-i-wojny-swiatowej", "paragraphs": [
  {"start": "first ~50 characters of the paragraph exactly as written",
   "quotes": [
     {"file": "src/content/timeline/1914/07/x.md", "quote": "verbatim from our article"},
     {"url": "https://… (must be in sources)", "quote": "verbatim from that page"}]}
]}
```

- Prefer our own articles as evidence. Use web quotes for what our articles
  don't cover (for example everything before 28 VI 1914: we have no articles
  for 1871–1913).
- Every number in a paragraph must appear in one of its quotes, written the
  same way.
- **Web quotes only from pages you opened and read** (WebFetch). Never from
  memory or search snippets.

Check until it prints `0 problem(s)`:

    cd /Users/lukaszskowron/Code/astro/thegreatwar.pl && python3 -I scripts/checks/topics.py . <slug>

## English: `src/content/en/topics/<english-slug>.md`

Translate per `translation-brief.md`: front matter only `title`, `question`,
`summary`, `brief`, `source: <polish-slug>` (no order, updated, series, authors,
sources). Links byte for byte as in Polish. Then this must print nothing for
your file:

    node scripts/i18n-status.mjs 2>&1 | grep -v "no sourceHash" | grep "<english-slug>"

## Report (short)

Paths, word count, the sections, sources, conflicts with our articles
(file + what), anything you left out and why.
