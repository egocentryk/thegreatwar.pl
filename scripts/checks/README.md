# Checks

Scripts that verify generated content against the site's own articles and
its sources before it is published. Each one prints its problems and ends
with `N problem(s)`; content goes in only at `0 problem(s)`. Run them from
the repo root. The data they check lives in `scripts/evidence/<kind>/`;
the briefs given to the writers who produce it are in `scripts/briefs/`.

| Script | Checks | Run |
|---|---|---|
| `year-intros.py` | "Rok w skrócie": every sentence backed by verbatim quotes from our articles, every number in its quotes; builds `src/data/year-intros.json` | `python3 -I scripts/checks/year-intros.py . --build src/data/year-intros.json scripts/evidence/year-intros/19*.json` |
| `series.py` | reading series: every note backed by a verbatim quote from its own article, steps exist in both languages and are in date order; builds `src/data/series.ts` | `python3 -I scripts/checks/series.py . scripts/evidence/series/<slug>.json` (add `--build src/data/series.ts` and every file in display order to write) |
| `topics.py` | topic guides: every paragraph backed by quotes (our articles verbatim, web pages listed in `sources:`), numbers in their quotes, internal links exist | `python3 -I scripts/checks/topics.py . <slug> [more…]` |
| `expand.py` | expanded short articles: front matter unchanged except `sources`/`summary`/`brief`, minimum length, 3–12 sources (2+ not Wikipedia), pl.wikipedia-only external links, internal links only backwards in time, "W skrócie" numbers in the body | `python3 -I scripts/checks/expand.py . <slug> [bitwy/<slug>] [more…]` |
| `war-numbers.py` | "Wojna w liczbach": every row ≥ 2 sources, one not Wikipedia, low ≤ high; merges the parts into `src/data/war-numbers.json` | `python3 -I scripts/checks/war-numbers.py [--write]` |

Other tools in `scripts/` change content rather than check it:
`wiki-to-internal.py` (pl.wikipedia links → our battle and person pages),
`person-photos.mjs`, `person-sources.mjs`, `article-images.mjs`,
`i18n-status.mjs` (English edition status and stamps), `wiki-langlinks.mjs`.

Writers' scratch work (downloads, temporary scripts, virtualenvs) never goes
in the repo; `scripts/**/tmp-*/` and `venv/` are gitignored as a safety net.
