# Quality-of-life improvements (port guide)

Improvements made in **thegreatwar.pl**, written so another agent can apply
them to **thesecondwar.pl** (`/Users/lukaszskowron/Code/astro/thesecondwar.pl`).
Both sites share the same Astro architecture: `OnThisDay`, `RandomEvents`,
`RandomBattles`, `TimelineArchive`, `FilteredTimeline`, `src/i18n/local.ts`
(`paths()`), `src/utils/calendarLeaf.ts`, `src/pages/kartki.json.ts` and
`src/pages/en/kartki.json.ts`.

How to use this file:

- Each entry says what was wrong, how it was measured, what changed (with
  file names), how to port it and how to check it.
- Re-measure on the target site first. Content sizes differ, but the same
  problems apply.
- Keep the target site's own names, comments and language, such as Polish
  folder names like `kartki`.
- Entries are listed newest last. The roadmap checklist at the end lists
  every planned item and ticks the finished ones.

---

## 1. Performance (2026-10-26)

### How to measure

```sh
pnpm build
# Raw and gzipped size of the heaviest pages and data files
for p in dist/index.html dist/en/index.html dist/timeline/index.html \
         dist/tag/<biggest-tag>/index.html dist/kategoria/<biggest>/index.html \
         dist/kartki.json dist/szukaj.json; do
  echo "$p raw $(wc -c <$p) gz $(gzip -9c $p | wc -c)"; done
# What fills a page: big inline <script>/<style> blocks, class="" bytes, row count
python3 - <<'EOF'
import re; s=open('dist/index.html').read()
for m in sorted(re.finditer(r'<(script|style)[^>]*>(.*?)</\1>',s,re.S),key=lambda m:-len(m.group(2)))[:3]:
    print(m.group(1),len(m.group(2)),m.group(2)[:60])
print('class bytes',sum(len(x) for x in re.findall(r'class="[^"]*"',s)))
EOF
```

Results in thegreatwar.pl (2,624 events, 310 battles):

| What | Before | After |
|---|---|---|
| Homepage HTML | 282 KB raw / 50 KB gz | 152 KB raw / 21 KB gz |
| Data the homepage downloads on each visit | `kartki.json` 1 MB raw / 243 KB gz | today's file ~2 KB gz + one shard ~18 KB gz + `bitwy.json` 28 KB gz (cached) |
| `/kategoria/dzialania-zbrojne` (1,381 rows) | 1.13 MB raw / 135 KB gz | 669 KB raw / 122 KB gz, off-screen months not laid out |
| `/tag/niemcy` (844 rows) | 747 KB raw | 442 KB raw |
| `/timeline` | 386 KB raw | 250 KB raw |

### 1a. "On this day": one small file per calendar day

**Problem:** `OnThisDay.astro` fetched `/kartki.json`, every event (~1 MB),
on each homepage visit, only to show the entries for today's date.

**Change:**

- New `src/utils/calendarPool.ts`, with `dayPaths(lang)`, `shardPaths(lang)`
  and `json`.
  - For each of the 366 MM-DD keys (a leap year, so 29 February is included),
    it writes the entries for that day.
  - If a day has no entries, the build looks back up to
    `MAX_LOOKBACK_DAYS = 14` days, the same rule the client script used, and
    writes that day instead.
  - The file has the shape `{ day: "MM-DD" | null, leaves: CalendarLeaf[] }`.
- New endpoints, each 4 lines long:
  - `src/pages/kartki/dzien/[day].json.ts`
  - `src/pages/en/kartki/dzien/[day].json.ts`

  Each one is `export const getStaticPaths = dayPaths("pl"|"en"); export const GET = json`.
- `src/utils/calendarLeaf.ts` now also exports `DayFile` and `SHARD_COUNT`.
  The client scripts import them from here, because `calendarPool.ts` pulls
  in `astro:content` and must never be imported by a `<script>`.
- `src/i18n/local.ts`: `paths().leaves` is now a folder, `/kartki` or
  `/en/kartki`, not a file.
- `OnThisDay.astro` script:
  - It fetches `${pool}/dzien/${MM-DD of today}.json`, once.
  - It shows the "nearest earlier day" note when `file.day !== today`.
  - It formats the label from `file.day` with `new Date(2000, m - 1, d)`.
  - The client-side lookback loop and `MAX_LOOKBACK_DAYS` are removed from
    the script.

### 1b. "Pages from the chronicle" (RandomEvents): random shards

**Problem:** the shuffle section also loaded the full `/kartki.json` to show
4 random cards.

**Change:**

- `shardPaths(lang)` splits the events round-robin into `SHARD_COUNT = 16`
  shards (~65 KB raw / ~18 KB gz each), so each shard spans the whole war.
- New endpoints:
  - `src/pages/kartki/losowe/[shard].json.ts`
  - `src/pages/en/kartki/losowe/[shard].json.ts`
- `RandomEvents.astro` script:
  - `loadShard(base)` fetches `${base}/losowe/${random 0..15}.json` on each
    turn.
  - It caches fetched shards in a `Map`, which also survives client-side
    navigation.
  - `data-pool` holds the folder (`/en/kartki` on the English page).
- Removed `src/pages/kartki.json.ts` and `src/pages/en/kartki.json.ts`.
  Nothing else used them. Run `grep -rn "kartki.json"` first on the target
  site.

### 1c. Battle cards out of the homepage HTML

**Problem:** `RandomBattles.astro` inlined every battle card as JSON in the
homepage (125 KB raw, 28 KB gz) on every page view, in both languages.

**Change:**

- New `src/utils/battleCard.ts`:
  - `BattleCard`, a type the client script imports.
  - `toBattleCard(battle, lang)`, moved out of the component.
  - `battleCards(lang)`, an `APIRoute`.
- New endpoints `src/pages/bitwy.json.ts` (`/bitwy.json`) and
  `src/pages/en/battles.json.ts` (`/en/battles.json`).
- `paths().battleCards` holds those two URLs.
- `RandomBattles.astro`:
  - The section gets `data-pool={to.battleCards}`.
  - The inline `<script type="application/json" data-battles>` is gone.
  - The script loads the pool with `fetch` (cached per URL) inside an async
    `show()`.
  - The build-time random pick is still rendered, so the section works
    without JavaScript.

### 1d. Short CSS classes for timeline rows

**Problem:** `TimelineArchive.astro` repeated ~600 bytes of Tailwind utilities
on every event row. Class attributes were ~57% of the HTML on tag, category,
author, front and year pages.

**Change:**

- `src/styles/global.css` has a new `@layer components` block, which uses
  Tailwind v4 `@apply` with variants (`group-hover:`, `not-last:`,
  `has-[…]:`):
  - row classes: `.tl-day`, `.tl-dot`, `.tl-dot-key` (milestone day),
    `.tl-day-grid`, `.tl-day-num`, `.tl-entry`;
  - text classes: `.tl-key-label`, `.tl-title`, `.tl-title-key`
    (milestone), `.tl-summary`.
- `TimelineArchive.astro`'s day/entry markup uses those classes. The markup
  structure is unchanged, and so is the look.

**Port:** copy the class strings from the target's own `TimelineArchive.astro`
into the `@apply` rules, because they may differ slightly. Then check that the
built CSS contains `.tl-title:is(:where(.group):hover *)`, which proves the
`group-hover` variant compiled.

### 1e. `content-visibility` for long lists

**Problem:** about 20 pages render 300–1,400 rows. These are the author
pages, the "Działania zbrojne" category, the biggest country tags and the
fronts.

**Change:**

- Each month `<section>` in `TimelineArchive.astro` gets `class="tl-month"`.
- The rule is `.tl-month { content-visibility: auto; contain-intrinsic-size: auto 1200px; }`.
- The browser skips layout and paint for months far from the viewport.
  Find-in-page, anchors and the URLs keep working.
- Splitting the longest pages into per-year pages was considered and left in
  the backlog. Gzip already makes their transfer size modest (80–120 KB).

### How to verify (after porting)

Serve `dist` with `python3 -m http.server 4399` and drive it with Playwright,
using a fixed date:

```js
await ctx.addInitScript("{const D=Date;const t=new D('2026-05-20T12:00:00').getTime();globalThis.Date=class extends D{constructor(...a){super(...(a.length?a:[t]))} static now(){return t}}}")
```

Check these on both `/` and `/en/`:

- **On this day:** the day label and year list fill in, and on a date with
  no entries (20 May in thegreatwar.pl) the "nearest earlier day" note
  appears.
- **Shuffle buttons:** clicking the "Pages from the chronicle" and battles
  buttons changes the cards.
- **Requests:** the only JSON requests are `dzien/MM-DD.json`,
  `losowe/N.json` and the battle pool.
- **Console:** no errors.

To find which days fall back to an earlier date:
`python3 -c "import json,glob; print([f for f in glob.glob('dist/kartki/dzien/*.json') if json.load(open(f))['day']!=f[-10:-5]])"`

---

## 2. SEO: structured data and sitemap hreflang (2026-10-26)

### 2a. JSON-LD structured data

**Problem:** pages had no schema.org data, so search engines had to guess
what each page is about.

**Change:**

- New `src/utils/jsonLd.ts` with node builders. Every builder takes
  `Astro.site` and returns absolute URLs.
  - `websiteLd(site, lang)`: `WebSite` plus the publisher `Organization`
    (`SITE.name`, `SITE.email`, logo `/web-app-manifest-512x512.png`). Used
    on `/` and `/en`.
  - `articleLd(site, {...})`: `Article` for a timeline entry.
    - It has headline, description, `inLanguage` (`pl-PL` / `en-GB`),
      author and keywords (the tags).
    - Authors are `Person` nodes linking to `/autor/<slug>`.
    - The image is the header image, or `SITE.ogImage`.
    - `temporalCoverage` holds the day the article is about. The site has no
      publication dates, so `datePublished` is left out on purpose.
  - `battleLd(site, {...})`: an `Event` (start/end date, `Place`), plus the
    `Article` that describes it (`about` points to the event,
    `temporalCoverage: "start/end"`).
  - `personLd(site, {...})`: `Person`.
    - It has birth and death dates (only the year when
      `bornYearOnly` / `diedYearOnly` is set), places, `jobTitle` (the role)
      and `nationality`.
    - `sameAs` links to Wikipedia: Polish pages use pl.wikipedia from
      `wikiTitles`; English pages map those titles through
      `src/data/wiki-en.json` to en.wikipedia.
  - `breadcrumbLd(site, items)`: `BreadcrumbList`.
- `BaseLayout.astro` has a new optional `jsonLd?: JsonLdNode[]` prop, which
  it passes on to `BaseHead.astro`.
  - `BaseHead.astro` prints one `<script type="application/ld+json">` with
    `{"@context": "https://schema.org", "@graph": [...]}`.
  - `<` is escaped as `\u003c`.
- Pages that pass `jsonLd`:
  - `src/pages/index.astro` and `src/pages/en/index.astro` (website);
  - `src/pages/[id].astro` and `src/pages/en/[slug].astro` (article plus the
    breadcrumb Home › Timeline › year › title);
  - `src/pages/bitwy/[id].astro` and `src/pages/en/battles/[slug].astro`
    (event plus article plus breadcrumb);
  - `src/pages/postacie/[id].astro` and `src/pages/en/people/[slug].astro`
    (person plus breadcrumb).

  Each of these computes
  `const pagePath = Astro.url.pathname.replace(/(.)\/+$/, "$1")`.
- English pages take dates, authors and places that are not translated from
  the Polish `source` entry, and translated text (title, summary, location,
  role, country, places) from the English entry.

**Port:** in thesecondwar.pl, check the person schema field names (`born`,
`died`, `bornYearOnly`, `wikiTitles`, …). Also check `SITE.email` and the
logo file name.

**Verify:**

```sh
python3 - <<'PY'
import re,json,glob
def ld(p):
    m=re.search(r'<script type="application/ld\+json">(.*?)</script>',open(p).read(),re.S)
    return json.loads(m.group(1)) if m else None
for pat in ['dist/bitwy/*/index.html','dist/postacie/*/index.html','dist/en/battles/*/index.html','dist/en/people/*/index.html']:
    fs=glob.glob(pat); print(pat,len(fs),'without ld',sum(1 for f in fs if not ld(f)))
print([n['@type'] for n in ld('dist/index.html')['@graph']])
PY
```

Then paste a built page into https://validator.schema.org or Google's Rich
Results Test.

### 2b. hreflang alternates in the sitemap

**Problem:** the sitemap listed every URL but not its other-language version.
Polish and English slugs differ (`/bitwy/pierwsza-bitwa-nad-marna` ↔
`/en/battles/first-battle-of-the-marne`), so `@astrojs/sitemap`'s `i18n`
option, which assumes `/en` + the same path, can't be used.

**Change** (`astro.config.mjs`):

- `sitemap({ serialize: withHreflang })`.
- The sitemap is written after the build, so `withHreflang` reads
  `dist/<path>/index.html` and copies its
  `<link rel="alternate" hreflang=… href=…>` tags into `item.links`.
- The sitemap therefore always matches the page heads: `pl`, `en` and
  `x-default`, only when both languages exist.
- The function needs a JSDoc type
  (`/** @param {import('@astrojs/sitemap').SitemapItem} item */`), because
  `astro check` type-checks the config.

**Verify:** count the `<url>` entries with `xhtml:link` in
`dist/sitemap-0.xml`. In thegreatwar.pl, 6,499 of 6,783 have links. The rest
are tag, category and author pages, which have no English version.

---

## Roadmap (checklist)

The full improvement plan, agreed with the owner on 2026-10-26. A checked
item has a numbered section above, with port notes. When an item is
finished, tick it here and add its section above.

### 1. Performance
- [x] On this day: one small file per calendar day instead of the 1 MB event
  pool (§1a)
- [x] "Pages from the chronicle" shuffle: random shards instead of the full
  pool (§1b)
- [x] Random battles: a separate cached file instead of inline JSON (§1c)
- [x] Timeline list rows: short component classes, ~40% smaller list pages
  (§1d)
- [x] Long lists: `content-visibility` on month blocks (§1e)
- [ ] Split the longest list pages (more than ~300 rows) into per-year pages.
  - Example: `/tag/niemcy/1916`.
  - The main page would keep a year list with counts.
  - Candidates: the author pages, `/kategoria/dzialania-zbrojne`, the big
    country tags and fronts.
- [ ] Make the search index smaller (`szukaj.json` 1.2 MB / 325 KB gz,
  `en/search.json` 1.06 MB). It loads only when someone starts searching.
  Options:
  - drop the `d` field (date label) and format it from `k` on the client;
  - split the index by year;
  - switch to Pagefind.

### 2. English edition gaps
- [ ] English tag, category and author pages (`/en/tag/…`,
  `/en/category/…`, `/en/author/…`).
  - The English homepage and articles still link to Polish tag pages.
  - Tag names need translating, for example a `TAGS_EN` map in
    `src/i18n/data-en.ts`.
- [ ] A CI step running `node scripts/i18n-status.mjs`, to flag new or edited
  Polish content with no up-to-date translation (warn, don't fail).

### 3. SEO and discovery
- [ ] Open Graph image per article and battle, generated at build (for
  example with satori or `@vercel/og`). Postponed until the articles have
  images.
- [x] JSON-LD structured data: WebSite, Article, Event, Person and
  BreadcrumbList (§2a)
- [ ] RSS feed. Postponed for two reasons:
  - there are no publication dates in the content, and the chronicle is
    complete, so a feed sorted by event date would never change;
  - git dates are unreliable on Vercel's shallow clone.

  Add a `published` front-matter field first.
- [x] hreflang alternates in the sitemap (§2b)

### 4. Reader features
- [ ] A "related" block on articles: the same battle, the same people, the
  same week on other fronts. Only previous/next links exist now.
- [ ] "Mentioned in" lists on person pages, built from the links articles
  already make to `/postacie/...`.
- [ ] Interactive battle map (Leaflet or static SVG). Needs coordinates on
  battle pages.
- [ ] Gantt-style battle timeline per front, fed by `src/data/battlePhases.ts`.
- [ ] Public-domain images from Wikimedia Commons, with captions and credits.

### 5. Template leftovers and code health
- [ ] Replace the starter leftovers:
  - the `package.json` name, author, description and repository URLs
    (`portfolio-starter`, `your-username`);
  - `README.md`, which should become a project README (adding and
    translating articles, checks, a pointer to `workflow.md`);
  - `SITE.role`.
- [ ] CI on `develop` as well as `main` (`.github/workflows`), plus content
  checks: `i18n-status`, summary length and a check for broken internal and
  Wikipedia links.
- [ ] Move `workflow.md`, `translation-brief.md` and
  `translation-factcheck-brief.md` into `docs/`. Turn the session commit-list
  helper into a real `scripts/i18n-commit.mjs`.
- [ ] Add a proper-name allowlist to `scripts/i18n-status.mjs`. It flags
  "Oraz" in "Oraz Serdar" in `action-at-kaakha` and `british-occupy-merv`.
- [ ] Remove `plq.json` or add it to `.gitignore`. It has been untracked since
  before the English edition.

### 6. Content quality
- [ ] One review list of the ~115 open fact-check items (sources disagree, or
  the claim is defensible) left by the 1918 fact-checks. Decide on each, or
  add a "sources differ" note.
- [ ] A visible "Sources" section on each article.
