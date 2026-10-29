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

## 3. Performance: long list pages split by year (2026-10-26)

**Problem:** about 20 tag, category, author and front pages rendered
300–1,400 rows at once:

| Page | Rows | Size |
|---|---|---|
| `/kategoria/dzialania-zbrojne` | 1,381 | 669 KB |
| `/tag/niemcy` | 844 | 442 KB |

**Change:**

- New `src/utils/filteredPages.ts`:
  - `SPLIT_THRESHOLD = 300`.
  - `yearLinks(entries, base)` returns the year menu (`{ year, href, count }`)
    of a list longer than the threshold. The first year's href is the main
    page itself, so no content exists at two URLs.
  - `extraYears(entries, base)` returns the years that get their own page,
    which is every year except the first.
  - The group builders `tagGroups`, `categoryGroups`, `authorGroups`,
    `frontGroups` and `frontGroupsEn` return `{ slug, name, entries }`. They
    replace the grouping code that each route used to have.
- `FilteredTimeline.astro` takes two new props:
  - `base`, the main page URL;
  - `year`, set on a year page.

  When the list is split, it shows a year menu with counts under the section
  heading, renders only the active year, and puts the year in the title
  ("Tag: Niemcy (1916)") and the description.
- Main routes now use the shared groups and pass `base`:
  - `src/pages/tag/[tag].astro`
  - `src/pages/kategoria/[category].astro`
  - `src/pages/autor/[author].astro`
  - `src/pages/front/[front].astro`
  - `src/pages/en/front/[front].astro`
- New year routes, next to the main routes:
  - `src/pages/tag/[tag]/[year].astro`
  - `src/pages/kategoria/[category]/[year].astro`
  - `src/pages/autor/[author]/[year].astro`
  - `src/pages/front/[front]/[year].astro`
  - `src/pages/en/front/[front]/[year].astro`
- Front year pages link to the other language's page for the same year, and
  only when that list is split too. So hreflang never points at a missing
  page.

**Result:** 64 year pages in total.

| Page | Before | After (first year) |
|---|---|---|
| `/kategoria/dzialania-zbrojne` | 1,381 rows, 669 KB | 315 rows, 166 KB raw / 31 KB gz |
| `/tag/niemcy` | 844 rows, 442 KB | 196 rows, 120 KB |

Every old URL still exists; the slugs were compared with the previous build.

**Port:** thesecondwar.pl covers more years, so lists split into more pages.
Check that the year menu wraps well on a phone (390 px); in thegreatwar.pl it
wraps into two lines.

## 4. Performance: packed search index (2026-10-26)

**Problem:** `szukaj.json` (1.2 MB raw / 325 KB gz) and `en/search.json`
(1.06 MB / 268 KB gz) were arrays of objects:
- every key was repeated in every document;
- tags, fronts, places and commanders were repeated as text;
- every event carried a date label that can be derived from its ISO date.

**Change:**

- New `src/utils/searchIndex.ts`. It has no Astro imports, because the
  browser bundles it.
  - `SearchDoc` is the shape the search script uses (unchanged).
  - `SearchSource` is what the endpoints provide.
  - `PackedIndex` is the columnar file format:
    - `terms` is a dictionary of tags, fronts, places and commanders;
    - `h`, `t`, `s` and `k` are arrays;
    - `f` holds bit flags: 1 = battle, 2 = milestone;
    - `g` holds term ids per document;
    - `d` holds date labels for battles only, which are ranges.
  - `packIndex(docs)` writes the format; `unpackIndex(index, locale)` reads
    it.
  - Event date labels are made in the browser with
    `Intl.DateTimeFormat(locale, { timeZone: "UTC", dateStyle: "long" })`,
    the same call as `formatDate()` on the server.
- `src/pages/szukaj.json.ts` and `src/pages/en/search.json.ts` build
  `SearchSource[]` (`g` as an array, `d` only for battles) and return
  `packIndex(docs)`. The `SearchDoc` type moved from `szukaj.json.ts` to the
  util.
- `Search.astro`:
  - `loadIndex(url, locale)` unpacks the index, then builds the same
    `Indexed` items as before.
  - The script text gets `locale` (`pl-PL`, or `en-GB` on the English page).
  - Search, ranking, stemming and highlighting are unchanged.

**Result:**

| Index | Before | After |
|---|---|---|
| Polish | 1.20 MB raw / 325 KB gz | 857 KB / 278 KB gz |
| English | 1.06 MB / 268 KB gz | 816 KB / 244 KB gz |

About half of the remaining size is summaries, which search needs for
matching and display.

**Verify:**
- Unpack the new file and compare it with the old JSON. Copy the old
  `dist/szukaj.json` before building, and normalise spaces in `g`, because
  empty fronts no longer leave a double space. In thegreatwar.pl, 2,934 docs
  per language had 0 differences.
- Then search in the browser: `/szukaj?q=Verdun`, `/en/search?q=Pilsudski`,
  and the homepage box with "Warszawę". Check the date labels and the counts.

**Not done (option):** load in two stages. First load titles, terms and dates
(about 110 KB gz) and show results at once; then load summaries and re-run
the search. Pagefind was ruled out: it would replace the custom Polish
stemming and ranking.

---

## 5. English edition: tag, category and author pages (2026-10-26)

**Problem:** only fronts had English list pages. English articles showed the
category and authors as plain text and no tags. The English homepage's
"Poland" link went to the Polish tag page, marked "(PL)".

**Change:**

- **Tag translations.** `src/i18n/data-en.ts` has a new `TAGS_EN` map (276
  Polish tag → English name) and `tagEn(tag)`.
  - People follow their English person pages (e.g. "Konstantyn I Grecki" →
    "Constantine I of Greece").
  - Places follow the English edition's conventions ("Lwów" → "Lemberg",
    "Nisz" → "Niš").
  - Concept tags stay lower-case ("okręty podwodne" → "submarines").
  - Every English slug is unique; check this when adding entries.
  - Categories use the existing `categoryEn`; author names don't change.
- **One helper for all list pages.** `src/utils/filteredPages.ts` now covers
  every list in both languages.
  - `Kind` is `"tag" | "category" | "author" | "front"`.
  - Bases: `/tag` ↔ `/en/tag`, `/kategoria` ↔ `/en/category`, `/autor` ↔
    `/en/author`, `/front` ↔ `/en/front`.
  - `LABELS` holds the page labels.
  - `groups(kind, lang)` builds the groups from `localEvents(lang)` and
    caches them. Each group is `{ key: Polish name, name: shown name, slug,
    base, entries }`.
  - `listUrl(kind, lang, key)` gives the URL of one list, e.g.
    `listUrl("tag", "en", "Polska")` → `/en/tag/poland`.
  - `counterpart(kind, lang, key, year?)` gives the same list in the other
    language. For a year page, it returns the same year only when the other
    list is split too.
  - `mainPaths(kind, lang, param)` and `yearPaths(kind, lang, param)` are the
    `getStaticPaths` functions.
- **Events know their authors.** `LocalEvent.data` has a new `authors` field
  (`src/i18n/local.ts`).
- **`FilteredTimeline.astro`** now takes `{ kind, group, year?, lang }`. It
  works out the label, title, description and hreflang alternates itself.
- **Sixteen thin route files.** There is a main and a year route for each of
  `tag/[tag]`, `kategoria/[category]`, `autor/[author]`, `front/[front]`,
  `en/tag/[tag]`, `en/category/[category]`, `en/author/[author]` and
  `en/front/[front]`.

  Each file is two lines of logic:

  ```astro
  export const getStaticPaths = mainPaths("tag", "en", "tag")
  const { group } = Astro.props as { group: Group }
  ---
  <FilteredTimeline kind="tag" group={group} lang="en" />
  ```
- **Links:**
  - English articles (`src/pages/en/[slug].astro`) link their category and
    authors, and have a new "Tags" row (`listUrl` + `tagEn`).
  - `PolishThread.astro` links to the tag page in the page's own language and
    counts that language's events.
  - `/en/about` links to `/en/author/…`.

**Result:**
- English has 276 tag, 5 category and 2 author pages, plus 48 year pages.
- The Polish URLs are unchanged.
- None of the new links is broken. The only links from English list pages to
  Polish lists are the language switchers.

**Port:**
- thesecondwar.pl has its own tag list. Generate the list from the content,
  map people through its English person pages, then translate the rest by
  hand.
- Check that the English slugs are unique.

## 6. English edition: translation status in CI (2026-10-26)

**Change** (`scripts/i18n-status.mjs`, `.github/workflows/ci.yml`):

- **Missing translations.** The checker now also lists published Polish
  entries with no English file ("no English translation"). The summary line
  shows untranslated, stale and problem counts.
- **`--ci` mode.** Every problem is printed as a GitHub
  `::warning file=…,title=English edition::…` annotation. The exit code is
  always 0, so the warnings appear on the run and the PR but never block it.
  Without `--ci`, the script still exits 1 when there are problems, for local
  use.
- **Name exceptions.** `NAME_EXCEPTIONS` (`/\bOraz Serdar\b/`) removes names
  that contain a word from the Polish-words check, which used to give two
  false positives.
- **CI step.** A new "English edition status" step runs
  `node scripts/i18n-status.mjs --ci` before the build.

**Verify:** delete one English file and append a line to one Polish source.
`--ci` should print two warnings and exit 0. Then restore both files.

---

## 7. Reader features: "Meanwhile", "Related" and richer person pages (2026-10-26)

**Problem:**
- Articles linked only to the previous and next event.
- Person pages scanned every article body on each render, to find links to
  the person. They missed articles that only tag the person, and battles
  whose text mentions them.
- Person pages listed every mention, which for Haig is 166 rows.

**Change:**

- **New `src/utils/related.ts`.** It builds a graph once per build from the
  Polish content.
  - Each article has its person-page links, counted from
    `](/postacie/<id>)` in the body. Tags that are person names or aliases
    count as people too.
  - Each article also has its other tags, its battle and its front.
  - Lookup tables map person → articles, tag → articles and
    battle → articles, so only articles that share something are compared.
- **`meanwhile(id)`.** Up to 4 articles within ±3 days on a different
  front. Articles with no front count as their own group.
  - It skips the previous and next articles, which the page already links.
  - Order: closest day first, then key events.
- **`related(id)`.** Scores the candidates and keeps up to 4.
  - Same battle: +5. Each shared person: +3.
  - Each shared tag: + min(4, ln(N / tag uses)), so rare tags count a lot
    and "Wielka Brytania" (945 uses) barely.
  - Same front: +1.
  - The total is divided by (1 + days apart / 365).
  - It skips the article itself, its neighbours and the "meanwhile" picks.
  - Articles scoring under 3 are dropped, so weak matches never fill the
    block.
  - In thegreatwar.pl, 2,622 of 2,624 articles get 4 picks.
- **`personMentions(id)`.** Returns:
  - `articles`: articles that link or tag the person.
  - `total`.
  - `tag`: the person's most used tag.
  - `battles`: battles whose text links the person.
  - `coPeople`: the top 5 people seen in the same articles at least twice.

  When there are more than 40 articles and the person has a tag page, the
  list is cut to key events plus the articles that link the person most
  often. It is shown in chronological order.
- **`eventsById(lang)`.** Turns Polish ids into the localised `LocalEvent`,
  so English pages show English titles. Both languages get the same picks.
- **New `src/components/RelatedEvents.astro`** (`id` = the Polish id,
  `lang`). It renders "W tym samym czasie" / "Meanwhile" and "Powiązane
  wydarzenia" / "Related events" as two-column cards (date · front or
  category, title, two-line summary).
  - It is placed above the previous/next links in `src/pages/[id].astro`
    and `src/pages/en/[slug].astro`.
- **Person pages** (`src/pages/postacie/[id].astro`,
  `src/pages/en/people/[slug].astro`) use `personMentions` instead of
  scanning the bodies. New sections:
  - "W opisach bitew" / "Mentioned in battles": battles whose text links
    the person, minus the ones they commanded. English falls back to the
    Polish battle page, marked "(PL)".
  - "Najczęściej obok" / "Often appears with": people chips with counts.
  - "Na osi czasu" / "On the timeline": the heading shows the full count,
    and a capped list explains itself, for example "40 najważniejszych z
    166 wydarzeń. Wszystkie z tagiem „Douglas Haig” (62) →", linking to
    `listUrl("tag", lang, tag)`.

**Result:** article pages grew from 40 KB to 48 KB of plain HTML, with no
JavaScript. The build time is unchanged.

**Port:**
- thesecondwar.pl covers longer periods. Check `DECAY_DAYS` (365) and
  `MEANWHILE_DAYS` (3) against how dense its timeline is (thegreatwar.pl
  has about 2 articles per day).
- Check the person-link pattern and that tag names match person names or
  aliases.
- To calibrate, add a temporary endpoint that dumps `meanwhile` and
  `related` for every article, then spot-check famous events and the share
  of articles with an empty block.

---

## 8. Reader features: battle timeline (Gantt chart) per front (2026-10-26)

**What it is:** all 310 battles on one time axis per front, at
`/bitwy/os-czasu` and `/en/battles/timeline`.
- Each battle is a bar from its start date to its end date, and each bar
  links to the battle page.
- Fronts are stacked in the order of the battle phases.
- Sub-battles sit indented under their parent operation, e.g. the twelve
  Somme battles under "Bitwa nad Sommą".
- `/bitwy` and `/en/battles` link to it.

**Change:**

- **New `src/data/battleParents.ts`.** `BATTLE_PARENTS` maps a child battle
  id to its parent battle id (97 entries).
  - It is curated from official groupings (the British Battles Nomenclature
    Committee for the Somme, Ypres, Arras and 1918, plus the Galician battle,
    the 1914 Serbian campaign, the conquests of Serbia and Montenegro, the
    Siege of Kut with its relief battles, and the Vardar offensive).
  - It is kept out of the battle files so English translations don't go
    stale.
  - Inferring parents was tried and rejected.
    - Date containment alone gives wrong parents ("Meuse-Argonne → Selle",
      "Obrona Osowca → Kowno").
    - "Contained, same phase, and the child links the parent" is about 85%
      right but still wrong in places ("Grand Couronné → Marne",
      "Łódź → Kraków", and sub-battles under a sibling).
    - Use those rules only to draft the list, then check it by hand.
- **New `src/components/BattleTimeline.astro`** (`lang`). It is static HTML
  and CSS, with no script.
  - The axis runs from the first month with a battle to the month after the
    last one, with year lines and labels; the first year is labelled at the
    start.
  - Rows are per front. Top-level battles are ordered by start date, each
    followed by its sub-battles, recursively and indented 0.875rem per
    level.
  - Bars are absolutely positioned with `left` and `width` as percentages.
    The width includes the end day, and `min-w-1` keeps one-day battles
    visible.
  - Key battles use the accent colour, other battles grey, and sub-battles
    a thinner light bar.
  - The page has a legend and front jump links.
  - Each row link has `title` (name: dates) and screen-reader-only dates.
  - The build fails if `battleParents.ts` names a battle that doesn't
    exist.
- **Styles** (`src/styles/global.css`, `@layer components`):
  - `.gantt` sets `--gantt-label`, the width of the name column: 9rem on
    phones, 13rem from 40rem up.
  - `.gantt-row` is a grid of that column and the track.
  - `.gantt-label` is sticky on the left with a paper background, so names
    stay visible while the chart scrolls sideways.
  - `.gantt-grid` draws the year lines.
  - `.gantt-bar`, `.gantt-bar-key` and `.gantt-bar-part` style the bars.
  - The chart scrolls inside `overflow-x-auto` with `min-w-[44rem]`.
- **Pages:** `src/pages/bitwy/os-czasu.astro` and
  `src/pages/en/battles/timeline.astro`, with hreflang between them. The
  link from the battles overview is in `BattlesOverview.astro`.

**Result:** 153 KB raw / 18 KB gzipped per language. 310 rows, 97 of them
sub-battles. Checked in a browser at 1200 px and 390 px.

**Port:**
- thesecondwar.pl needs its own `battleParents.ts`. Draft it with the rule
  above (containment + same phase + child links parent), then review every
  entry.
- Its longer time span makes short battles thinner. If the overview gets too
  dense, consider one chart per year range.

---

## 9. Reader features: battle map and locator maps (2026-10-26)

**What it is:**
- **`/bitwy/mapa` and `/en/battles/map`:** all 310 battles on a static SVG
  map in three views.
  - Europe and the Middle East.
  - "Front zachodni z bliska": a zoomed crop of Flanders–Champagne, marked
    on the main map with a dashed box.
  - The rest of the world: Africa, the Pacific, the South Atlantic,
    Tsingtao, Mecca.
- **Markers:**
  - colour = front;
  - hollow diamond = naval battle;
  - ring = campaign or operation (a battle with sub-battles in
    `battleParents.ts`);
  - larger = key battle.
- **Controls:** front toggles with counts, year buttons, and "Odtwórz
  przebieg wojny" / "Play the course of the war", with a date slider.
- **Interaction:** tooltips on hover and keyboard focus;
  `#b-<battle-id>` highlights and focuses a battle.
- **Locator on every battle page:** a small regional map with a dot, under
  "Miejsce" / "Location", linking to the battle on the big map.

**Data:**

- **`scripts/battle-coords.mjs` → `src/data/battle-coords.json`**
  (`{ id: { lat, lon, source } }`).
  - Lookup order: the pl.wikipedia article with the battle's title, then
    "title (year)"; then en.wikipedia with the English title, then "title
    (year)" (Wikipedia disambiguates, e.g. "Battle of Megiddo (1918)").
  - Each match must have a Wikidata date between 1914 and 1919, or no date,
    so same-named battles from other centuries are skipped (pl.wiki "Bitwa
    pod Jafą" is 1192).
  - An article without coordinates falls back to its Wikidata P625, then to
    the P625 of its location (P276).
  - Result: 198 of 310 automatic.
  - Linked articles in the battle text were tried and dropped, because they
    are often a different battle ("Podbój Serbii" → Gallipoli, "Walki nad
    Rawką i Bzurą" → Gorlice).
  - Location (P276) fallbacks can land on a whole country or the wrong
    city; review them.
  - English titles that redirect to a parent article give the parent's
    point (all the Lys sub-battles on one spot); review those too.
  - **112 entries are `"source": "manual"`**, set from each page's
    `location` text (main town or centre of the fighting). The script never
    overwrites them; `--all` re-checks everything else.
- **`scripts/build-basemap.mjs` → `src/data/basemap.json` +
  `public/mapa/europa.svg` and `public/mapa/swiat.svg`**, from Natural Earth
  (public domain).
  - `europa`: 1:50m land + lakes (lakes become holes with evenodd),
    0–53°E and 29–60°N, x scaled by cos 45°.
  - `swiat`: 1:110m land, 82°W–128°E and 58°S–62°N.
  - Clipped to a margin box, Douglas–Peucker simplified (0.5 / 0.8 units).
    A closed ring must be split at its farthest point first, or the
    simplification collapses it.
  - Sizes: europa 40 KB raw / 17 KB gz, swiat 20 KB / 8 KB.
- **`src/utils/battleMap.ts`:**
  - `project(map, lat, lon)`;
  - `battlePoint(id)`: Europe if inside its extent, else world;
  - `isCampaign(id)`;
  - `FRONT_STYLE`, the front → palette key.

**Colours** (dataviz skill, reference palette, validated with
`validate_palette.js` in both themes):

- On a map any two markers can touch, and 8 hues cannot pass all pairs.
  - The validator was therefore run on the pairs of fronts that meet
    geographically: Western–Eastern, Eastern–Balkan, Balkan–Middle East,
    Italian–Balkan, Italian–Western, Africa–Middle East.
  - "War at sea" touches every front, so it has no hue: a neutral hollow
    diamond.
  - Result: Western blue, Eastern red, Balkan violet, Middle East orange,
    Italian magenta, Africa aqua, Asia and Pacific yellow.
- The failing pairs never meet: Eastern–Middle East (red/orange),
  Western–Balkan (blue/violet).
- Three light colours are under 3:1 contrast. The mitigation is legend
  names, tooltips and links to the list and timeline (a table view).
- **Map surfaces** are theme tokens in `global.css`:
  - `--map-sea` and `--map-land`, with land lighter than the sea in dark
    mode (inverting them made inland locators look like open sea).
  - Markers have a 1.5px paper ring, and the stroke doesn't scale
    (`vector-effect: non-scaling-stroke`).

**Components:**

- **`src/components/BattleMap.astro`** (`lang`).
  - The land paths are defined once in `<defs>` and drawn with `<use>` in
    each view.
  - Marker radii are in viewBox units per view, so markers look the same
    size on screen.
  - Each marker is an `<a>` with `data-front/start/end/title/dates` and an
    `aria-label`.
  - The close-up duplicates are `tabindex=-1` inside an `aria-hidden` SVG.
  - Hit areas are bigger than the marks. For rings the hit area is only the
    ring stroke (`pointer-events: stroke`), otherwise an operation's ring
    covers the battles inside it (Meuse-Argonne over Verdun).
  - About 3 KB of script: filters, play, tooltip, hash target.
  - **Playback** runs continuously with `requestAnimationFrame`.
    - Speed: 45 days per second, so 1914–1919 plays in about 40 s.
    - A battle shows from its first day until 10 days after its last
      (`LINGER`), so one-day battles don't flash by.
    - The date label shows the day; the `<input type="range">` slider moves
      with it and can be dragged (that pauses); Play continues from the
      slider position.
    - Class toggles happen only on a change, not every frame.
    - While playing, the status line has `aria-live="off"` so screen readers
      aren't flooded.
  - **Transitions:** hidden markers fade and shrink (`opacity` + `scale`
    with `transform-box: fill-box`, 450 ms), then become
    `visibility: hidden`, which takes them out of the focus order. With
    `prefers-reduced-motion` there are no transitions.
    - The first version used month steps every 700 ms with
      `display: none`, which looked jerky.
  - **The dashed box** on the main map (the area of the Western Front
    close-up) is a link to the close-up with the label "Zbliżenie poniżej ↓"
    / "Close-up below ↓". Its fill is transparent so the whole box is
    clickable, while markers sit above it. Without a label, readers took it
    for a stray rectangle.
  - The build fails if a battle has no coordinates.
  - The main view has `min-w-[40rem]` and scrolls sideways on phones.
- **`src/components/BattleLocator.astro`** (`id`, `frontKey`, `lang`).
  - A 3:2 window (260×173 units on europa, 300×200 on swiat), clamped
    inside the map.
  - The land is a div with `background: var(--map-land)` and
    `mask-image: url(/mapa/<map>.svg)` (plus the -webkit- variants).
  - `mask-size` = map width / window width × 100%.
  - `mask-position` = offset / (map size − window size) × 100% on each axis.
  - The dot is positioned in % of the window; naval battles get a diamond.
  - The SVG is cached once for all battle pages; each page carries about
    1 KB of markup.
- **Pages:** `src/pages/bitwy/mapa.astro` and
  `src/pages/en/battles/map.astro` (hreflang between them). The locator sits
  in `src/pages/bitwy/[id].astro` and `src/pages/en/battles/[slug].astro`.
  The battles overview links to the map next to the timeline.

**Result:** the map page is 291 KB raw / 58 KB gz (the land paths plus 460
markers). Tested in a browser:
- year 1916 → 54 battles; 1916 + Eastern → 3;
- play reaches October 1914 → 16;
- tooltip, hash focus, light and dark themes, a 390 px phone; no console
  errors.

**Port:**
- thesecondwar.pl covers WWII, so the extent differs: Europe, North Africa,
  the Eastern Front to the Volga, plus the Pacific as a second detailed map
  rather than an inset. Re-run `build-basemap.mjs` with its own `MAPS`.
- Redo `battle-coords.mjs` and review the fallbacks the same way.
- Re-validate the front colours on its own neighbouring-front pairs.

## 10. SEO: port of thesecondwar.pl's SEO work (2026-10-26)

The opposite direction from the rest of this file: `seo.md` §1–7 describes
SEO changes made on thesecondwar.pl, and they are now applied here. `seo.md`
has the problems, the changes and the check scripts; this entry records only
what differs on this site and the numbers measured here.

**Differences from thesecondwar.pl:**

- No `src/data/eras.ts`: every year is a war year, so `periodMeta` has no
  "road to the war" title. Wording: "I wojna światowa dzień po dniu" /
  "the First World War day by day", "w kronice Wielkiej Wojny" / "in the
  chronicle of the Great War".
- No battle phase pages, so `BattlePhasePage.astro` was not ported.
- No `/autor/lukasz-skowron` redirect in `astro.config.mjs`.
- The hub pages (`/bitwy`, `/postacie`, `/timeline`) keep their own
  descriptions; `/timeline` is now titled "Oś czasu".
- Year pages lead with milestone battles that have the most articles. Here,
  coverage of the Somme is spread over its sub-battles, so the 1916
  description names the Brusilov offensive, Montenegro and Kilimanjaro
  rather than the Somme.

**Result (7,182 pages):**

- Exactly one `<h1>` on every page; no shared descriptions; no duplicate
  titles. 20 battle pages (10 per language) share a title with the article
  about the same day and now get " – przebieg bitwy" / " – the battle".
- 645 titles over 60 characters. These are long article titles that now
  appear without the site name.
- 5,868 pages with `og:type` `article`, and no broken author links.
- JSON-LD: 820 `CollectionPage`s, 5,864 nodes with `mentions` and 3,254 with
  `about`. All 18,784 references to the site's own pages resolve.
- 122 noindex pages (120 tag pages with fewer than 3 articles, plus the two
  search pages). None are in the sitemap, which now has 7,060 URLs. 154 tag
  pages link to their person page.

**Follow-up, not in `seo.md` (port these to thesecondwar.pl):**

- `BaseHead.astro`: indexable pages have `max-image-preview:large` in the
  robots meta tag, so Google may show large image previews (Discover).
- `FilteredTimeline.astro`: tag, category and front pages are titled after
  the subject and the war: "Kamerun – I wojna światowa", "War at sea in the
  First World War". Before, they were "Tag: Kamerun" and "Front: …". Author
  pages keep "Autor: …". The `<h1>` and the JSON-LD names are unchanged.
- `postacie/[id].astro`: a person's own tag is linked only when it has a tag
  page. 8 person pages linked a tag that no article carries, which gave 404s.
  The page now has no broken internal links.
- Longer descriptions for `/timeline` and `/about` in both languages. Every
  description under 70 characters is now on a noindex tag page.

---

## 11. Trust and print: sources, "report an error", print styles, complete Event references (2026-10-28)

Ported from thesecondwar.pl (`seo.md` §8–10 and `roadmap.md` §1 and §4), plus
one new feature to port back.

**Ported:**

- `sources:` on events, battles and people (`src/content.config.ts`) and a
  "Źródła / Sources" list under the text (`src/components/Sources.astro`) on
  the six detail pages; English pages show the Polish list.
  `scripts/i18n-status.mjs` leaves `sources:` out of the translation hash, so
  adding sources never makes an English page stale. Writers add `sources:`
  to new articles (`workflow.md` §4).
- `scripts/person-sources.mjs`: the person's pl.wikipedia biography (from
  `wikiTitles`) and its en.wikipedia counterpart, checked against the API
  (redirects resolved, missing pages skipped). It wrote 241 of 242 person
  pages, all with both languages; none is a disambiguation page. Charles
  Lanrezac has no pl.wikipedia page and got en and fr by hand.
- Print styles (`global.css`): black on white in either theme; no header,
  footer or anything marked `print:hidden` (the coffee button, the
  year/month navigation); month blocks drop `content-visibility` so the
  whole list prints. `PrintButton.astro` sits beside the `<h1>` of every year
  and month page (this site has no key dates or series pages yet).
- `pageEntities.ts`: Event references to battles in `about` / `mentions`
  carry the summary, start and end dates and location, so Search Console
  doesn't report incomplete Events (`seo.md` §10). The build has 4,692 Event
  nodes, and none of them lacks `startDate` or `location`.

**New here (port to thesecondwar.pl):**

- `ReportError.astro`: "Widzisz błąd? Zgłoś go" / "Spotted a mistake? Report
  an error" under the sources on articles, battles and person pages, in both
  languages. It is a `mailto:` to `SITE.email` with the page title in the
  subject and the page URL in the body. It is hidden in print.

**Not ported:** `scripts/extract-sources.mjs` (sources from writer
transcripts). Only 7 transcripts are left for this project, so milestone
sources need the research method (fetch 3–5 sources and check the facts).

---

## 12. "W skrócie / In brief" on every milestone (2026-10-28)

Ported from thesecondwar.pl (`seo.md` §9, `roadmap.md` §4).

- `brief:` (at most 5 strings) on `timeline` and `battles` and on the
  English `timelineEn` / `battlesEn` (it is translated, so it counts in
  `sourceHash`). `src/components/InBrief.astro` shows it as a box above the
  text on event and battle pages in both languages.
- Filled for all 423 milestones (262 events, 161 battles): 2,060 points per
  language, 3–5 per page, 186 characters on average, none over 260.
- **How:** 10 writer agents, about 43 milestones each, read the Polish and the
  English article in full and wrote the points only from the article's own
  text. A checker script compared every number in a point with the same
  language's article (title, summary and body; the `result:` field is not read, so
  figures found only there were left out). All 423 passed with 0 problems.
  Name spellings were then normalised in the points (Rupprecht, Franchet
  d'Espérey), and the 423 English files were re-stamped with
  `i18n-status.mjs --stamp=<slug>`.
- To re-run for a new milestone: write the points from the article, keep
  every number as the article gives it, and re-stamp its English file.

**Not in thesecondwar.pl (port back):** the writers also reported
inconsistencies in the existing articles. They are in the review list
below; none were fixed in this change.

### Review list: inconsistencies found by the "In brief" writers

Check each one against the sources, then fix it or add a cautious note. Paths
are relative to `src/content/` (PL unless marked EN).

- [ ] battles/1916/ofensywa-kilimandzarska (Kahe 21 III): PL "niemieckie kontrataki je odparły" reads as Germans repulsing the squadrons; EN: squadrons beat off counter-attacks.
- [ ] battles/1916/bitwa-nad-somma: PL "kilkanaście miesięcy szkolenia" vs EN "a year or so".
- [ ] en/battles/brusilov-offensive: sides "Karl von Pflanzer-Baltin" vs body/PL "Karl Pflanzer-Baltin".
- [ ] en/timeline/zimmermann-telegram: "despite his reservations" ambiguous (Kemnitz vs Montgelas); PL clearly Montgelas.
- [ ] battles/1916/szosta-bitwa-nad-isonzo: lede 9 VIII entry into Gorizia vs body 8 VIII flag at station.
- [ ] battles/1916/bitwa-pod-morval: lede "w południe" vs body zero hour 12.35.
- [ ] battles/1916/bitwa-o-grzbiet-thiepval: "ponad dwa tygodnie" vs "zdobywano przez trzy tygodnie".
- [ ] timeline/1916/11/koniec-bitwy-nad-somma: "cztery i pół miesiąca" vs "pięciu miesięcy walk".
- [ ] timeline/1916/11/smierc-franciszka-jozefa: heading "Siedemdziesiąt lat historii" vs "prawie 68 lat" reign.
- [ ] timeline/1916/12/upadek-bukaresztu: "north-eastern" forts vs Mogoșoaia / north-western sector.
- [ ] battles/1916/pierwsza-ofensywna-bitwa-pod-verdun: "dwa moździerze kalibru 400 mm" vs "haubice kolejowe" elsewhere.
- [ ] battles/1916/bitwa-pod-fromelles (PL): "Ruprechta" vs "Rupprecht".
- [ ] Minor: EN army naming "4th Army" vs "Fourth Army" (bazentin vs delville/flers), "3rd Army" vs "Third Army" (erzurum vs trebizond).
- [ ] nalot-sterowcow-i-zestrzelenie-sl-11 (PL "North Mimms") vs EN "North Mymms".
- [ ] poczatek-bitwy-o-grzbiet-pozieres: Walker PL "Brytyjczyk" vs EN "an Englishman".
- [ ] en winter-battle-in-the-carpathians: sides "Karl von Pflanzer-Baltin" vs body "Karl Pflanzer-Baltin".
- [ ] bulgaria-wypowiada-wojne-rumunii (PL): "przyznał jej południową Dobrudżę" ambiguous.
- [ ] poczatek-bitwy-pod-morval: "O 12.35, w samo południe" (PL+EN).
- [ ] zabojstwo-premiera-stuergkha: prosecution vs defence on Adler's insanity reads contradictory.
- [ ] poczatek-bitwy-jutlandzkiej: balance says four German torpedo boats lost, body names two (V 27, V 29).
- [ ] rumunia-wypowiada-wojne-austro-wegrom "34 tysiące karabinów" vs niemcy-wypowiadaja-wojne-rumunii "34 tysięcy żołnierzy".
- [ ] Falkenhayn's expected date of Romania's entry: hindenburg-szefem-sztabu-generalnego (after harvest / October) vs niemcy-wypowiadaja-wojne-rumunii (not before mid-September).
- [ ] Hindenburg summoned: Lyncker phone 28 VIII (hindenburg-szefem…) vs Kaiser evening 27 VIII (niemcy-wypowiadaja…).
- [ ] turcja-wypowiada-wojne-rumunii: German interests handed over "trzy dni wcześniej" = 27 VIII, before Germany's 28 VIII declaration — check.
- [ ] Weather 1 X 1916: poczatek-bitwy-o-wzgorza-nad-ancre (rain, mud) vs poczatek-bitwy-o-grzbiety-transloy (fine; rain from 2 X).
- [ ] en capture-of-ginchy "4th Army" vs "Fourth Army".
- [ ] battles/1918/bitwa-pod-villers-bretonneux: "Nazwa i daty" last gap closed night before 27 IV vs course: night before 26 IV (60th Bn straightening 27 IV).
- [ ] battles/1918/bitwa-pod-vittorio-veneto: result "400 do ponad 430 tysięcy" vs Straty "400 do 480 tysięcy" / 436 674.
- [ ] battles/1918/bitwa-pod-saint-quentin-1918: ~38k (intro) vs ~38.5k (Straty) — minor.
- [ ] battles/1918/ofensywa-moza-argonne: First Army "około 117 000" vs 26 000 + ~96 000 ≈ 122 000.
- [ ] saint-quentin-1918: PL "kilkunastu, kilkudziesięciu metrów" vs EN "a few dozen metres".
- [ ] EN vardar-offensive, third-battle-of-the-aisne: "d'Espèrey" → "d'Espérey".
- [ ] ofensywa-nad-wardarem: PL "Meglena" vs EN "Moglena".
- [ ] Hindenburg Line battles: 12 IX–9 X (bitwa-pod-epehy) vs 12 IX–12 X (bitwa-pod-havrincourt).
- [ ] Australian 5th Brigade: ~1300 (druga-bitwa-nad-somma-1918) vs 70 officers + 1250 men (druga-bitwa-pod-bapaume-1918) — roughly agree.
- [ ] Last BEF corps to Flanders: III Corps (poczatek-bitwy-pod-armentieres) vs I Corps (poczatek-bitwy-pod-langemarck, poczatek-pierwszej-bitwy-pod-ypres).
- [ ] Artois end: 10 X (poczatek-bitwy-pod-arras) vs 12 X British chronology (poczatek-pierwszej-bitwy-w-artois).
- [ ] poczatek-pierwszej-bitwy-pod-albert: lead ends 29 IX vs later "British chronology ends 25 IX".
- [ ] poczatek-pierwszej-bitwy-w-artois: "Tego samego dnia… oblężenie Antwerpii" after 26 IX; Antwerp article: 27 IX.
- [ ] PL "Ruprechta" in albert, artois, gheluvelt (start+end) → "Rupprechta".
- [ ] EN "d'Espèrey" in germans-retreat-from-the-marne, battle-of-the-marne-begins → "d'Espérey".
- [ ] bitwa-nad-gete: PL "Haelen" vs EN "Halen".
- [ ] serbia-wypowiada-wojne-niemcom: "a week earlier" vs 28 VII → 6 VIII (nine days).
- [ ] poczatek-bitwy-pod-broodseinde: Peeler PL "kapral" vs EN "Lance Corporal"; rain "w południe" vs "Pół godziny po południu" (12.30).
- [ ] rajd-na-zeebrugge: Frank Brock PL "komandor porucznik" vs EN "Wing Commander".
- [ ] poczatek-bitwy-pod-bailleul: 214th Division 7.00 vs 5 a.m. assault on 75th Brigade.
- [ ] "Hamiltona-Gordona" (niemcy-zdobywaja-messines-1918) vs "Hamilton-Gordona" (poczatek-bitwy-pod-bailleul).
- [ ] de Mitry: "Oddział Armii Północ" vs "Oddział Armijny Północ" (kemmel articles); EN likewise.
- [ ] walki-nad-ancre: Rupprecht PL "Książę" vs EN "Crown Prince".
- [ ] kostaryka- vs nikaragua-wypowiada-wojne-niemcom: Panama counted as Central American in one, Guatemala "first" in the other.
- [ ] zdobycie-grzbietu-outtersteene: summary "w południe" vs body 11.00.
- [ ] poczatek-bitwy-pod-amiens: "ponad dwa tysiące dział" vs "około 2 tysięcy dział".
- [ ] battles/1915/bitwa-pod-st-julien: "około tysiąca zabitych, z czego 3058 jednego tylko dnia" — impossible; probably 3058 of total losses on 24 IV.
- [ ] battles/1915/oblezenie-al-kutu: intro ~13 thousand prisoners vs Niewola ~12 thousand.
- [ ] EN battle-of-neuve-chapelle: title "Neuve Chapelle" vs body "Neuve-Chapelle".
- [ ] battles/1915/podboj-serbii (PL): "VIII Korps", "XIX Korps" → "Korpus".
- [ ] battles/1915/druga-bitwa-w-szampanii: misplaced sentence (official history 30 IX) makes "Kazał" refer to it.
- [ ] bitwa-pod-gorlicami: PL "od kilkunastu do około 20 tysięcy" vs EN "some fifteen" (battle) / "more than ten thousand" (timeline).
- [ ] PL "Kitcheners' Wood" vs EN "Kitchener's Wood" (gravenstafel, druga-bitwa-pod-ypres, wzgorze-60).
- [ ] Festubert: French's quote "deliberate and unremitting" vs "deliberate and persistent" (EN).
- [ ] Artois EN: "Bayonne men" vs "Bayonnais"; "Tenth Army" vs "10th Army".
- [ ] Smith-Dorrien removal told differently in druga-bitwa-pod-ypres vs bitwa-pod-st-julien (not a contradiction).
- [ ] bitwa-pod-poelcappelle: PL "100–200 metrów przed linią wyjściową" vs EN "beyond the start line".
- [ ] druga-bitwa-pod-passchendaele: PL "półtora kilometra" vs EN "a mile and a half".
- [ ] pierwsza-bitwa-pod-passchendaele: PL "ponad półtora kilometra" vs EN "more than a mile and a half".
- [ ] trzecia-bitwa-pod-ypres: PL "półtora kilometra" vs EN "a mile and a half" (Polygon Wood EN: "a kilometre and a half").
- [ ] druga-bitwa-nad-aisne: PL "Gerarda Nicholsona" → Gerald (G.W.L. Nicholson).
- [ ] bitwa-pod-cambrai-1917: "more than half the tanks lost on day one" vs 179 of 378.
- [ ] zdobycie-jerozolimy: Mount of Olives cleared in fighting 10 XII vs found abandoned 10 XII.
- [ ] timeline/1914/12/obrona-givenchy: lead "Germans had taken Givenchy by noon" vs body/battle page "after 1 p.m.".
- [ ] bitwa-pod-sarykamyszem: PL "Georgij Bergmann" vs EN "Georgy Berkhman" (EN Russia-declares-war: "Bergmann").
- [ ] bitwa-pod-gheluvelt: PL "około półtora kilometra" vs EN "about a mile and a half".
- [ ] drugie-oblezenie-przemysla: horses "od około 10 do kilkunastu tysięcy" vs EN "nearly 20,000"; "kilkanaście tysięcy cywilów" vs later 18,000–30,000.
- [ ] EN first-battle-of-the-marne: "d'Espèrey".
- [ ] Place names: Bikschote/Bixschoote, Passendale/Passchendaele, Geluveld/Gheluvelt.
- [ ] bitwa-pod-lowczowkiem: "Po bitwie pod Marcinkowicami 12–13 grudnia" reads as battle on 12–13 XII; limanowa: 5–6 XII, Nowy Sącz 12 XII.
- [ ] EN "d'Espèrey" in armistice-of-salonica, Dobro Pole battle page.
- [ ] zgromadzenie-w-alba-iulia: PL "Vaida-Voievod" vs EN "Vaida-Voevod".
- [ ] poczatek-bitwy-pod-kortrijk: PL "półtora kilometra" vs EN "a mile and a half".
- [ ] EN Canal du Nord battle page: leftover sentence about the name in "Polish literature".
- [ ] rozejm-w-compiegne: "balcony of the Reichstag" vs rewolucja-w-berlinie: first-floor window.
- [ ] Kemmel hand-over: 19 IV (bitwa-o-scherpenberg) vs 18–21 IV (bitwa-nad-lys-1918).

---

## 13. Article layout: sidebar and coffee buttons (2026-10-28)

Ported from thesecondwar.pl (commits "sidebars on article, battle and person
pages" and "more ways to buy us a coffee"): the text on the left, the
sidebar on the right.

- Event pages (`[id].astro`, `en/[slug].astro`): on wide screens (lg+) a grid
  `42rem | 1fr`, so the text keeps its reading width and the sidebar takes
  the rest of the row; both line up with the header's edges.
  The back link, title, header image and facts row span the full width
  above the grid; the sidebar starts at the first paragraph (`pt-10`). `ArticleSidebar.astro` holds the
  date (large day, month and year, weekday) with previous/next, "W skrócie",
  the people linked in the text (initial and life years; no portraits on this
  site yet), the battle with its locator map, and a support card that stays
  in view (`sticky top-24`) while the text scrolls. On smaller screens the
  sidebar is hidden and the text column shows "W skrócie", the floating
  coffee button and a `SupportCard.astro` after the sources instead.
- Coffee button in the header on every page (round, accent colour, same as
  thesecondwar.pl). `SITE.support` is the one support link; `CoffeeIcon.astro`
  is shared by the header, `CoffeeButton`, `SupportCard` and the sidebar.
- `BattleLocator.astro`: `full` fills the sidebar's width.
- Header and footer widened to `max-w-6xl` to match the article grid. Other
  pages keep their `max-w-3xl` content for now.
- Battle pages (`bitwy/[id].astro`, `en/battles/[slug].astro`):
  `BattleSidebar.astro`, an infobox with the locator map, dates, front (linked
  to its front page), place, the sides with their commanders and the result,
  then "W skrócie". Person pages (`postacie/[id].astro`,
  `en/people/[slug].astro`): `PersonSidebar.astro` with the facts (born, died,
  country and side, role), up to 6 battles commanded (with a link down to the
  full list) and up to 6 people most often alongside. On wide screens the
  facts table above the text gives way to one row with the authors and tags;
  on smaller screens the pages are unchanged.
- `SidebarSupport.astro`: the support card that stays in view, shared by the
  three sidebars.
- Not ported yet: places and series in the sidebars (this site has neither
  yet), portraits (commanders and people show their initial).

**Port back to thesecondwar.pl:** none.

---

## 14. One width for every page; multi-column homepage (2026-10-28)

Ported from thesecondwar.pl (commits "wider multi-column homepage, one width
for every page" and "more ways to buy us a coffee").

- Every page container is `max-w-6xl`, like the header and footer: list
  pages (timeline, year and month pages, battles, people, tags, categories,
  fronts, authors, search), about and 404. Article text keeps its reading
  width. The battle map and battle timeline stay at `max-w-5xl`, as on
  thesecondwar.pl.
- Homepage (`Home.astro`), about half the length:
  - hero in two columns: headline and buttons; the counts and the blue
    support card (`SupportCard` variant `home`, `stacked`);
  - search below the hero (`Search` `bare`);
  - "Tego dnia" in three columns;
  - war years as five cards in one row (`WarYears`), keeping this site's
    highlighted events per year;
  - "Od czego zacząć" as dark covers, four per row. thesecondwar.pl puts
    the article's photo on each; this site has no photos yet, so they are
    typographic. Below lg they grow with their text (`min-h-64`) instead of
    a fixed 3:4, so long titles are not cut off on phones;
  - fronts as a fronts × years heatmap (1914–1918);
  - the Polish thread beside the random battles (thesecondwar.pl puts
    family history and series there, which this site does not have), then
    the chronicle pages;
  - a last row with "Wesprzyj kronikę" (`SupportBand.astro`), about and
    contact.
- `PeopleIndex`: the countries of each side flow into two or three columns,
  so countries with one or two people no longer leave half a row empty.
- Section components (`OnThisDay`, `WarYears`, `TurningPoints`,
  `ReadingPath`, `Fronts`, `PolishThread`, `RandomEvents`, `RandomBattles`)
  no longer set their own container; the homepage does.

**Port back to thesecondwar.pl:** the `min-h-64` covers below lg (its long
titles are cut off on phones too, when an article has no photo).

---

## 15. Images from Wikimedia Commons (2026-10-28)

Ported from thesecondwar.pl (`seo.md` §12): the same scripts, component and
data format.

- 311 pages show a freely licensed photo, painting or map from Wikimedia
  Commons (`ArticleFigure.astro`, data `src/data/images.json`, files
  `src/assets/images/{timeline,battles}/`), with a caption in both languages
  and the credit line its licence needs (author, licence link, Commons page).
  It is also the page's `og:image` and the `image` of its Article JSON-LD.
  281 are public domain, the rest CC BY / CC BY-SA / CC0. 257 photos or
  paintings, 54 maps. 7 of the 8 "Od czego zacząć" covers now show their
  article's photo (`ReadingPath.astro`, as on thesecondwar.pl).
- Scope: all 310 battle pages and the 262 milestone events (572 pages).
  The finder (`scripts/commons-images.mjs`) found free candidates for 541;
  review agents chose an image for 311 and left 230 without one (candidates
  from the wrong page, modern photos, memorials, other periods). The owner
  took the picks as they are, to be improved later.
- Pipeline (as on thesecondwar.pl): `commons-images.mjs` (candidates) →
  320 px thumbnails → review agents (one image per page or none, captions
  only from the Commons description and the page summary) → an approval
  gallery → `scripts/article-images.mjs` (1,600 px JPEG, credits;
  `--clean` tidies author fields).
- This site's milestones have no `sources:` yet, so the exact Wikipedia
  page comes from the article's own pl.wikipedia links: only a link that
  names an event ("Bitwa…", "Oblężenie…", "Rozejm…", "Traktat…",
  "Rewolucja…"), covers 75% of the title's content words and has no year
  after 1919 (16 pages). The others are found by searching the English
  title, cleaned of "begins", "Start of the" etc. (`enSearch`, new in
  `commons-images.mjs`).
- Wikimedia rate-limits downloads (HTTP 429); re-running the importer on
  the missing refs fills them in.
- `src/assets/images` is 66 MB; the first build after new images takes
  about a minute instead of 35 s (Astro caches the resized files).

**Port back to thesecondwar.pl:** `enSearch` in `commons-images.mjs`; two
rules in `scripts/lib/commons.mjs` `cleanAuthor` (" - Author wrote the
Story…" and "This work was published on territory of…" notices).

**Later:**
- The 230 pages without an image, and the 31 with no candidates at all:
  other archives (NAC, IWM, Bundesarchiv, Library of Congress) or a better
  Wikipedia page per item.
- Repeated images: 8 files are used for different subjects (e.g. one
  Ypres-salient map on 9 pages). Keep each on its best pages.
- About 30 picks the reviewers doubted (photo from near, not of, the event)
  and 3 graphic images: check or replace.
- The Kronstadt map ("Die Schlacht bei Kronstadt, 7–9 Oktober 1916") fits
  the Brașov battle page; it is only a candidate on the Transylvania page.

---

## 16. Portraits of people and hover previews (2026-10-28)

Ported from thesecondwar.pl (`seo.md` §13, commits "black-and-white
portraits", "portraits and social cards for all person pages", "hover
previews of people").

- 240 of 242 person pages have a portrait: the main image of the person's
  own pl.wikipedia page (else en.wikipedia), only when it is on Commons
  under a free licence (222 public domain, the rest CC BY-SA / CC BY / CC0 /
  "no restrictions"). `scripts/person-photos.mjs` makes a 600×800
  black-and-white crop (`src/assets/postacie/<slug>.jpg`), a 1200×630 social
  card (`public/og/postacie/<slug>.jpg`, the page's `og:image` and the
  Person JSON-LD `image` in both languages) and writes the `photo:` block
  (credit, licence, Commons page). The chosen files are listed in
  `src/data/person-photos.json`.
- Shown on the person page (beside the title below lg, at the top of the
  sidebar on wide screens, with the credit), in the people index, in the
  event sidebar ("Postacie w tekście"), the battle infobox (commanders) and
  the person sidebar ("Najczęściej obok").
- Hover previews (`PersonPreviews.astro`): a person link in the text of an
  article, battle or person page shows a card with the portrait, years and
  role; on touch screens the first tap opens it. Each page carries only the
  people it links. The text blocks carry `data-glossary-scope`, the
  attribute thesecondwar.pl's previews (and glossary) look for.
- No portrait: Fritz von Below and Alexander von Linsingen (their only
  Commons images are under 200 px wide). Four small ones (252–297 px) are
  used: Hutier, Liman von Sanders, Lambros, Wynnyczenko. Roger Casement's
  ("No restrictions", Flickr Commons) and Charles Lanrezac's (GIF, en.wiki
  only) were added by hand.
- Option a (the pl.wikipedia image) everywhere; 122 people also have an
  option b from en.wikipedia. The review gallery
  (`dist/_review/people`, built by the review script) shows both.
- Credits: Bundesarchiv files (CC BY-SA 3.0 DE) are credited "Bundesarchiv,
  Bild <number>" with the photographer when known, as their licence asks;
  the same for the 7 Bundesarchiv article images (§15).

**Port back to thesecondwar.pl:** new rules in `scripts/lib/commons.mjs`
`cleanAuthor` (uploader notes, "Unknown (X)" → X, ", publisher", and
"Unknown / Inconnu", "Photographer not credited" and similar → unknown
author); the Bundesarchiv credit format (check its article images and
portraits).

**Later:** option b for anyone whose portrait is from long after the war
(e.g. a 1930s photo), and a portrait for von Below and Linsingen from
another archive.

---

## 17. Homepage: "Ludzie Wielkiej Wojny" (2026-10-28)

New here (not on thesecondwar.pl).

- `RandomPeople.astro`, above "Lata wojny": six people with their portraits,
  country, years and role. A new set on every visit, on the "Wylosuj innych"
  button, and every 7 s while the section is on screen. Rotation pauses on
  hover or focus and is off with `prefers-reduced-motion`; only a set the
  reader asked for is announced (`aria-live`). New portraits load before
  the swap, so no card flashes empty.
- Like the random battles (§1c), the pool is a static file the browser
  caches (`/postacie.json`, `/en/people.json`, 70 KB raw, from
  `utils/personCard.ts`): only people with a portrait, each with a 300×400
  WebP. The homepage carries just the six on screen.

**Port to thesecondwar.pl:** same files; it has portraits for every person.

---

## 18. Glossary ("Słownik") (2026-10-28)

Ported from thesecondwar.pl (`seo.md` §15), with WWI terms.

- 84 terms PL/EN in seven categories (Sprawa polska, Wojsko, Broń i
  technika, Wojna na morzu, Polityka i dyplomacja, Rosja i rewolucja,
  Okupacja i ludność), in `src/data/glossary.json`: short and long
  definitions, full forms, related pages, sources (each checked in at least
  two, one not Wikipedia).
- `/slownik` and `/en/glossary` (A–Z, category filter) and a page per term
  listing every article that uses it; titles "<term> – co to jest? Słownik
  I wojny światowej". Articles, battles and person pages mark the first
  mention of each term in the browser, with a hover/tap card
  (`GlossaryMarks.astro`): a median of 3 terms per article, at most 13.
- "Słownik" in the top menu; the full menu now starts at 1024 px.
- How: candidate terms with Polish patterns for inflected forms
  (`seed.py`), counted in the articles (`measure.py`), 6 writer agents with
  the second site's brief, a merge script that checks length, related
  pages and sources. Many patterns had to be narrowed after the writers
  checked them in the articles: "twierdza" vs the verb "twierdzić", "gaz"
  vs "gazeta", "Stawka" (the Russian high command) vs "stawka" (a stake),
  "Duma" vs Dumba / Dumbarton, "Czeka" vs "czekać", "myśliwiec" vs
  "myśliwy", naval mines vs tunnel mines, "Front zachodni" (France) vs the
  Russian Western Front.
- New: `exclude` on a term lists pages where its pattern means something
  else ("kryzys lipcowy" is also the July Days of 1917); the term is
  neither marked nor listed there.

**Port back to thesecondwar.pl:** the `exclude` field (`utils/glossary.ts`).

**Later:** Britannica, IWM, PWN and 1914-1918-online refused automated
reading, so a pass with those sources would strengthen several entries,
above all those with thin sourcing below.

### Writers' notes (figures rounded or left out, thin sourcing)

#### Group A (14)
- bajonczycy termEn → "Bayonne men" (as the EN articles).
- krolestwo-polskie covers Congress Poland (1815–1915) and the 1916–18 Kingdom; zabory covers partitions and the 1914 zones.
- Disagreements rounded: Kadrówka ~150 (144 vs 145–168); Legions "at their peak over 20,000"; TRS end "end of August"; first Kucharzewski government date left out.
- Kadrówka main page: austro-wegry-wypowiadaja-wojne-rosji (the Kadrówka article mentions it in one sentence).
- Thin sourcing: Kingdom 1916–18 (pl.wiki page didn't load); Kadrówka in Kielce, Bayonne banner, Blue Army in the Vosges rest on Wikipedia + our articles; "Kraków annexed by Austria in 1846" from general knowledge only.
- PWN inactive, 1914-1918-online blocked, Britannica 403 for this writer.
#### Group E (14)
- kryzys-lipcowy: also the name of the July Days 1917; excluded on dni-lipcowe-w-piotrogrodzie (new `exclude` field); PL long notes the double name.
- traktat-brzeski pattern narrowed to skip the peace with Ukraine.
- rozejm, neutralnosc: general terms (257 / 479 articles), kept.
- Bolsheviks renamed Russian Communist Party: "March 1918" (7th Congress).
- Brest annulled 13 XI 1918 (a TVP snippet's 13 IX is wrong).
#### Group B (14)
- szturmowcy termEn → "Storm troops"; patternEn widened to "storm troop(s)".
- stawka pattern: only after a lowercase word or comma ("Stawka" = stake / rate at sentence start).
- Disagreements: Russian partial mobilisation 28 vs 29 VII (date left out); Hindenburg Line built from IX 1916, broken IX–X 1918; Falkenhayn's "bleed white" intent disputed; Zuber debate on the Schlieffen Plan noted.
- Britannica, IWM 403; 1914-1918-online anti-AI check (not bypassed).
#### Group C (14)
- Patterns fixed: twierdza (verb twierdzić excluded), gaz-bojowy (gazeta excluded), front-wojskowy (only clearly Russian fronts; "Western Front" / "Front zachodni" mean France).
- drednot covers battleships (pattern matches "pancernik"); korpus, dywizja, grupa-armii without a main page.
- Rounded: U-boats "more than 370 built", "several thousand ships"; POWs 7–9 million; Cambrai "several hundred tanks" (our article: 476); Flers tank counts 9–32 across sources; Landsturm ages only "up to 45" (Germany).
- Unconfirmed: whether the Legions formally belonged to the Landsturm (left out).
#### Group F (14)
- biezenstwo termEn → "Bezhenstvo" (as the EN articles).
- Patterns fixed: czeka (verb czekać), duma (Dumba, Dumbarton…), biali (adjective), czerwona-armia (Finnish Red Guard), GG warszawskie (only Warsaw/Lublin; not Belgium), hiszpanka (no "pandemia"), racjonowanie (no "głód"), EN Bezhenstvo (not every refugee).
- Disagreements worded around: Sovnarkom "night of 8–9 XI 1917"; Petrograd Soviet "March 1917"; flu deaths "dziesiątki milionów" / 25–50 million+; Cheka victims (official just under 13,000, historians tens of thousands to over 100,000); Ober Ost HQ Kovno (pl.wiki: Königsberg); Czechoslovak Legion 40–50 thousand (our figure).
- Thin sourcing: Ober Ost (histclo weak; rests on Wikipedia + our articles), Czechoslovak Legion (en.wiki, zpe, our articles).
#### Group D (14)
- Patterns fixed: samolot-mysliwski (not "myśliwy" = hunter), mina-morska (naval only; not tunnel mines), haubica (not trench mortars).
- panstwa-centralne also matches "Trójprzymierze" (Italy was a member; the definition explains). blokada, rajder cover wider uses, explained in the long text.
- Rounded: Vickers range "kilka kilometrów"; Fiedler "na początku XX wieku"; North Sea mine barrage "ponad 70 tysięcy".

---

## 19. "Rok w skrócie / The year in brief" on year pages (2026-10-29)

Ported from thesecondwar.pl (`roadmap.md` §6, commit `1a05d79f`).

- `src/data/year-intros.json`: an intro for each of 1914–1918, two
  paragraphs (the war that year, then "Dla Polski"), Polish 309–330 words,
  English 393–433. Every fact comes from the year's own articles.
- `TimelineArchive.astro` takes an `intro` prop. With an intro, the year
  heading (with its print button) and the intro form a left column that
  stays in view on wide screens (`lg:sticky`, scrolls on its own if taller
  than the screen), and the months run beside it; smaller screens keep both
  above the months. Month pages and `/timeline` show no intro. The two year
  pages read their language from the JSON.
- **How:** one writer agent per year, with the second site's brief. Each
  sentence carries 1–4 verbatim quotes from the year's articles (Polish
  sentences from Polish files, English from English files).
  `scripts/year-intros/check.py` checks every quote against its file (links
  stripped) and that every number in a sentence appears in its quotes, then
  builds the JSON. The drafts with their quotes are kept beside it
  (`scripts/year-intros/19xx.json`), so an intro can be edited and checked
  again:

      python3 -I scripts/year-intros/check.py . --build src/data/year-intros.json scripts/year-intros/19*.json

- One fix after review: the Versailles declaration (1918) now reads
  "trwałego i sprawiedliwego pokoju" / "a solid and just peace", as both
  articles quote it (the drafts had "trwałego" vs "just").

**Port back to thesecondwar.pl:** the checker and the kept drafts (that
site's checker was not committed); the print button beside the heading
when an intro is shown.

**Later:** re-write a year's intro when its articles change a lot.

### Writers' notes (dates worded around; for the review list)

- 1914: Marne end 10 IX (`koniec-bitwy-nad-marna`) vs 6–12 IX (battle
  page); Tannenberg 26–30 VIII (battle page) vs 31 VIII (timeline); Łódź
  ends 6 XII (battle page) vs 15 XII (`koniec-bitwy-pod-lodzia`).
- 1915: Gorlice summary "armii Mackensena" (singular) vs brief "armie"
  (plural).
- 1916: `battles/1916/ofensywa-brusilowa` link text "Kościuchnówka" vs
  "Kostiuchnówka" in the text; the EN battle page likewise.
- 1917: no contradictions; the articles already flag disputed dates
  (Kerensky offensive, US recognition of the KNP, Piłsudski's arrest).
- 1918: no contradictions; articles flag Lwów 22 vs 23 XI, Piłsudski's
  arrival 7.00 vs 7.30, the Bulgarian request 24 vs 25 IX, the flag
  ceremony at Mailly vs Brienne-le-Château.

---

## 20. Key dates page ("Najważniejsze daty") (2026-10-29)

Ported from thesecondwar.pl (`seo.md` §9).

- `src/components/KeyDates.astro`, pages `/najwazniejsze-daty` and
  `/en/key-dates`: all 262 milestone events, 1914–1918, year by year, each
  with its date, title and summary; a print button (the print styles from
  §11 apply). `listPageLd` with breadcrumbs Home › Oś czasu › page and an
  `ItemList` of the articles; hreflang pair; in the sitemap.
- Linked from the top of `/timeline` and `/en/timeline`
  (`TimelineOverview.astro`).
- Changes from the original: titles "… I wojny światowej" / "… First World
  War"; the lead names the real span ("od zamachu w Sarajewie po powstanie
  wielkopolskie"); the series link (no series here yet) points to the
  timeline instead.

**When series exist here:** switch the second link back to `to.series`.
(Done in §21.)

---

## 21. Reading series ("Serie") (2026-10-29)

Ported from thesecondwar.pl (`seo.md` §8, `roadmap.md` §3).

- Code as there: `src/data/series.ts`, `src/utils/series.ts`,
  `SeriesPage.astro`, `SeriesCards.astro`, `SeriesBox.astro`; pages
  `/serie`, `/serie/<slug>`, `/en/series`, `/en/series/<slugEn>`;
  `paths().series` / `seriesPage`. "Serie" / "Series" in the top menu; the
  compact list on the homepage beside the Polish thread (with the random
  battles under it); the key dates page links to the series again.
- New here: `SidebarSeries.astro`, the "Z serii · część X z N" entry in the
  article and battle sidebars on wide screens (`ArticleSidebar` takes the
  Polish `id` for it); `SeriesBox` stays under the text on smaller screens.
  On thesecondwar.pl the same block sits inside `SidebarExtras`.
- Eight series, 126 steps, PL/EN, each with an intro and a "why read this"
  note per step: Lato 1914, Legiony Polskie, Droga do niepodległości, Wojna
  na ziemiach polskich, Verdun 1916 (overview: `bitwy/bitwa-pod-verdun`),
  Bitwa nad Sommą (overview: `bitwy/bitwa-nad-somma`), Rosja 1917, 1918:
  ostatni rok wojny.
- **How:** one writer agent per series (brief in `scripts/series/BRIEF.md`).
  Drafts in `scripts/series/<slug>.json`: every intro sentence backed by
  verbatim quotes, every note by one verbatim quote from its own article in
  the same language. `scripts/series/check.py` checks the quotes, the
  numbers, the English pages, the date order and 8–18 steps, then writes
  `src/data/series.ts`:

      python3 -I scripts/series/check.py . --build src/data/series.ts scripts/series/{lato-1914,legiony-polskie,droga-do-niepodleglosci,wojna-na-ziemiach-polskich,verdun,bitwa-nad-somma,rosja-1917,1918-ostatni-rok-wojny}.json

  (The file order is the order of the series on the pages.)

**Port back to thesecondwar.pl:** the checker (notes there were
quote-checked by an uncommitted script).

### Writers' notes (for the review list)

- Verdun: Fort Vaux abandoned 2 XI (`pierwsza-ofensywna-bitwa-pod-verdun`)
  vs article dated 3 XI (consistent: left 2 XI, entered 3 XI); "Nivelle’a"
  (curly) in the battle summary vs "Nivelle'a" in the articles.
- Somme: Delville Wood figures differ between `bitwa-nad-somma` (3100+ in,
  780 at roll call) and `bitwa-o-las-delville` (121 officers + 3032 men,
  ~750); Bean's quote worded differently in `bitwa-nad-somma` and
  `bitwa-o-grzbiet-pozieres`; EN "Flers–Courcelette" (en dash) vs
  "Flers-Courcelette" elsewhere.
- 1918: `rozejm-w-salonikach` dated 30 IX, signed 29 IX (fighting stopped
  30 IX); "d’Espérey" curly in PL, straight in EN.
- Legions (EN): "legionaries" vs "legionnaires"; "Second Brigade" vs
  "II Brigade"; "von Pflanzer-Baltin" in `austrians-take-stanislawow`.
- Polish soil: Przemyśl civilians "kilkanaście tysięcy" in the lead of
  `poczatek-oblezenia-przemysla` vs 18–30 thousand later; Łódź civilian
  deaths "ponad stu" (`niemcy-zajmuja-lodz`) vs 135/155 (battle page).
- Summer 1914: Liège "almost two weeks" (summary) vs "a few days"
  (`bitwa-graniczna`).

---

## 22. "Wojna w liczbach" (2026-10-29)

Ported from thesecondwar.pl (`seo.md` §16).

- Code as there: `WarInNumbers.astro`, `RangeBars.astro`,
  `utils/warNumbers.ts`, pages `/wojna-w-liczbach` and `/en/war-in-numbers`,
  a link in the homepage hero. Sections and texts rewritten for WWI.
- `src/data/war-numbers.json`: four headline figures (military dead
  8,5–11 mln, civilian dead 5–13 mln without the 1918 flu, mobilised
  65–70 mln, 1568 days from 28 VII 1914 to 11 XI 1918) and nine charts:
  military deaths by country (11), deaths as % of the 1914 population (10),
  Poles under arms by army and formation (8), Polish losses and refugees
  (5), men mobilised (11), the costliest battles (10, Isonzo I–XI and
  Caporetto apart so Caporetto isn't counted twice), Verdun and the Somme
  by side (5), U-boats (5), aircraft production (7).
- **How:** five research agents (brief in `scripts/war-numbers/BRIEF.md`),
  each row with ≥ 2 sources opened and read, at least one not Wikipedia;
  disputed figures as ranges. `scripts/war-numbers/merge.py` checks the
  rules and writes the JSON from the parts (`scripts/war-numbers/*.json`).
- Left out for thin sourcing: Gorlice–Tarnów casualties, merchant shipping
  sunk by flag, artillery and shell production, Polish civilian deaths (one
  estimate only), Spanish flu deaths (not a war loss), buildings destroyed.
- Britannica, IWM, 1914-1918-online, nzhistory and PWN refused automated
  reading; several rows (spring offensive, Isonzo, Marne, Brusilov, aircraft
  of Italy, the USA, Austria-Hungary and Russia) rest on popular sites plus
  Wikipedia. A pass with those sources would strengthen them.

**Port back to thesecondwar.pl:** `merge.py` (the same checks there).

### Conflicts with our articles (for the review list)

- `battles/1917/dwunasta-bitwa-nad-isonzo`: 293 tys. Italian prisoners
  (Austrian official history) vs 265–275 tys. in the sources.
- `battles/1917/dziesiata-bitwa-nad-isonzo`: Isonzo Army losses 76 300 vs
  ~125 tys. (en.wikipedia per-battle table).
- `battles/1914/pierwsza-bitwa-nad-marna`: ~250 tys. German losses vs
  298 tys. (Clodfelter).
- `battles/1916/bitwa-pod-verdun`: French 360–380 tys., German 330–340 tys.
  vs upper estimates 400 and 355 tys.; `trzecia-bitwa-pod-ypres`: British
  245–275 tys. vs NAM ~300 tys.
- `timeline/1918/05/walki-pod-kaniowem`: II Corps "about 12 tys." (Polish
  Army Museum) vs 6 918 on 1 V 1918 (CAW, Wrzosek).
- `timeline/1917/10/wlochy-uznaja-komitet-narodowy-polski`: over 30 tys.
  from the camps in Italy vs ~25 tys. (pl.wikipedia).
- `battles/1918/powstanie-wielkopolskie`: "kilkaset tysięcy" Poles in the
  German army vs 800–850 tys.
- `timeline/1917/01/niemcy-oglaszaja-nieograniczona-wojne-podwodna`: 111
  boats in II 1917 (British official history) vs 105 (Morrow).

---

## 23. Campaign overview pages and campaign navigation (2026-10-29)

New here (expansion-plan.md §A5).

- Five overview battle pages, PL and EN, ~2,450–2,700 words each, 6–7
  sources opened and read (British official histories on archive.org,
  Lettow-Vorbeck's memoir, Hansard, AWM): Kampania gallipolijska
  (19 II 1915 – 9 I 1916), Kampania mezopotamska (6 XI 1914 – 10 XI 1918;
  Moberly and our Mosul pages give 10 XI, en.wiki's 14 XI not used),
  Kampania synajsko-palestyńska (26 I 1915 – 30 X 1918), Powstanie arabskie
  (10 VI 1916 – 30 X 1918; Medina held to 9/10 I 1919, said in the text),
  Kampania wschodnioafrykańska (8 VIII 1914 – 25 XI 1918). `milestone:
  false` (the owner decides milestones). Map points in `battle-coords.json`.
- `battleParents.ts`: 44 existing battle pages put under the five
  campaigns (Kut keeps its relief battles, Third Gaza keeps Beersheba).
- `BattleFamily.astro` on every battle page (PL and EN), new: under the
  text "Wchodzi w skład · n/N" with the parent and the previous / next
  battle of the same parent; on a parent page a "Bitwy i etapy" list of all
  its battles (sub-battles indented). Until now the grouping was visible
  only on the battle timeline; it now also links the 31 existing parent
  battles (e.g. Kampania serbska 1914, Bitwa graniczna) with their 141
  sub-battles.
- `scripts/wiki-to-internal.py`: rewrites `pl.wikipedia` links to our own
  battle page (title match or `ALIASES` for campaign names that differ on
  pl.wiki), in the Polish file and the same link in its English file, under
  the workflow's link rules (no link to a battle that hasn't started by the
  article's date, not the article's own `battle`, no duplicates). Run here
  with `--only` the four campaigns pl.wiki has pages for: 63 files edited
  (and their 63 English files, re-stamped); 26 links kept — mostly articles
  dated before the campaign began (e.g. Kitchener's 1914 letter to the
  Sharif, Sykes–Picot), which the rule keeps on Wikipedia.
- Measured on the same script: of the 163 links to pages we already had
  (expansion-plan §B2), only 13 files may change; 120 are articles dated
  before the battle (planning, forecasts), 20 battle pages linking their own
  pl.wiki article, 8 the article's own battle. Not run yet; one command:
  `python3 -I scripts/wiki-to-internal.py --write` (then re-stamp the listed
  English files one by one, `--stamp=<english-slug>`).

**Port to thesecondwar.pl:** `BattleFamily.astro` and `wiki-to-internal.py`
(its battleParents has campaigns too).

### Writers' notes (for the review list)

- Name spellings: "Dżewad Pasza" (`bitwa-pod-megiddo`) vs "Cevat Pasza"
  (`bitwa-pod-jafa`, the Gallipoli page); "Australijska Lekka Kawaleria"
  vs "Lekka Konnica" (`bitwa-pod-beer-szewa`); "Ahmed Dżemal Pasza"
  (`atak-na-kanal-sueski`) vs "Dżemal Pasza"; EN "Ali Ihsan Pasha" vs
  "Ali İhsan Bey".
- Dates: Muslimiya taken 29 X (Falls) vs article dated 28 X (the article
  says so); Moshi entered 14 III (Hordern, `ofensywa-kilimandzarska`) vs
  `brytyjczycy-zajmuja-moshi` dated 13 III.
- Mecca 1916: MacMunn & Falls (garrison taken 13 VI) vs Antonius (fort
  4 VII, barracks 9 VII); `bitwa-o-mekke` follows Antonius and says so.
- pl.wiki `Kampania_synajska_i_palestyńska` is wrong on Romani (the
  23 IV 1916 Katia raid); pl.wiki `Kampania_mezopotamska` is in the traps
  list — both now replaced by our pages where the rules allow.
- Allied battleships lost at the Dardanelles: six (en.wiki infobox: seven).

---

## 24. Topic guides ("Tematy") (2026-10-29)

New here (expansion-plan.md §A1).

- A new page type for broad questions: content collections `topics`
  (`src/content/topics/<slug>.md`, PL) and `topicsEn`
  (`src/content/en/topics/`, `source:` + `sourceHash` like other
  translations; `scripts/i18n-status.mjs` now checks them too). Fields:
  title, summary, brief, order, updated, series, authors, sources.
- Pages: `/tematy`, `/tematy/<slug>`, `/en/topics`, `/en/topics/<slug>`
  (`TopicPage.astro`, `TopicCards.astro`, `utils/topics.ts`). A guide page
  has: a lead that answers the question, "W skrócie", a contents list (in
  the sidebar on wide screens), the text with glossary marks and person
  previews, "Najważniejsze daty" (every article and battle page the text
  links, in date order), sources, and the related series. JSON-LD: an
  Article with `dateModified` (`topicLd`) and breadcrumbs.
- `/tematy` and the homepage section are a list of questions, not cards
  (owner's choice, so they don't look like the series): number, guide title,
  the question in the display font (`question:` field, PL and EN, phrased
  as readers search: "Dlaczego wybuchła I wojna światowa?"), the opening
  answer, the section titles (on /tematy), and "7 rozdziałów · 24 daty ·
  ok. 13 min". On the homepage two columns, without the sections line.
- Links in: "Tematy" in the top menu, a section on the homepage after
  "Od czego zacząć", a link on `/timeline`, and a "Temat" box
  (`TopicBox.astro`) under the text and in the sidebar of every article and
  battle page a guide links, automatically (125 pages in each language).
- Guides are not dated, so unlike articles they may link any page.
- Four guides, PL and EN, 2,150–2,650 words each, 39–40 links to our pages:
  Przyczyny I wojny światowej, Skutki I wojny światowej, Sprawa polska w
  czasie I wojny światowej, Nowe rodzaje broni w I wojnie światowej.
- **How:** one writer agent per guide (brief: `scripts/topics/BRIEF.md`).
  Every paragraph has an evidence entry in `scripts/topics/<slug>.json`:
  verbatim quotes from our articles (checked by script) or from opened web
  pages listed in the guide's `sources:`; every number in a paragraph must be
  in its quotes. `python3 -I scripts/topics/check.py . <slug>` checks that,
  the internal links and the brief's numbers. Figures agree with
  `war-numbers.json` and the year intros, which the guides quote.

- Top menu: "O projekcie" / "About" moved from the menu to the footer (the
  footer link follows the page language); the menu has six items.

**Port to thesecondwar.pl:** the whole set; its curriculum topics are the
same kind of question (przyczyny, skutki, okupacja, Zagłada).

### Writers' notes (for the review list)

- U-boat war, April 1917 shipping losses: "ponad 860 tysięcy"
  (`niemcy-oglaszaja-nieograniczona-wojne-podwodna`) vs "880 tysięcy"
  (`poczatek-nieograniczonej-wojny-podwodnej`) vs "od około 835 do ponad 860
  tysięcy" (`komitet-do-spraw-konwojow`); en.wiki 881,027.
- Bruchmüller: "podpułkownik" (Riga article) vs "pułkownik" (glossary).
- Gas injuries: glossary "ponad milion" vs OPCW "close to a million".
- The 15–40 link range was read as a hard cap: the writers dropped person
  links (Lenin, Ebert, Masaryk, Ludendorff…) and battle links; they can be
  added back.

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
- [x] Split the longest list pages (more than 300 rows) into per-year pages
  (§3)
- [x] Make the search index smaller: packed columnar format, −29% raw / −14% gz
  (§4)
- [ ] Optional: load the search index in two stages (titles first, then
  summaries) for faster first results (see §4)

### 2. English edition gaps
- [x] English tag, category and author pages (§5)
- [x] CI step reporting untranslated, stale or broken English files as warnings
  (§6)

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
- [x] The SEO work of thesecondwar.pl (`seo.md` §1–7): year and month page
  titles, descriptions and `<h1>`, Open Graph article tags, shorter titles,
  list-page JSON-LD with `about` / `mentions`, list-page descriptions, and
  noindex on search and small tag pages (§10)
- [x] Complete Event references in `about` / `mentions` (`seo.md` §10) (§11)

### 4. Reader features
- [x] "Meanwhile" (same days, other fronts) and "Related" (battle, people,
  rare tags) blocks on articles (§7)
- [x] Person pages: mentions from links and tags, "Mentioned in battles",
  "Often appears with", and long lists capped at 40 with a link to the tag
  page (§7)
- [x] Battle map (static SVG, three views, front/year filters, month-by-month
  play) and a locator map on every battle page (§9)
- [x] Battle timeline (Gantt chart) per front, with sub-battles under their
  parent operation (§8)
- [x] "W skrócie / In brief" boxes on all 423 milestones, PL and EN (§12)
- [x] Event pages: sidebar (date, "W skrócie", people, battle, a support
  card that stays in view); coffee button in the header (§13)
- [x] Battle and person pages: sidebars like the event pages (§13)
- [x] One width for every page; multi-column homepage with a support band (§14)
- [x] Images from Wikimedia Commons, with captions and credits: 311 pages (§15)
  - [ ] The 230 milestones and battles still without an image; repeated and
    doubtful picks (§15)
- [x] Portraits for 240 of 242 people, with social cards, and hover previews of
  people in the text (§16)
- [x] Homepage "Ludzie Wielkiej Wojny": six rotating people with portraits (§17)
- [x] Glossary ("Słownik"): 84 terms PL/EN with hover cards in the text (§18)
- [x] "Rok w skrócie": quote-checked intros on the five year pages, PL/EN (§19)
- [x] Key dates page: all 262 milestones on one printable page, PL/EN (§20)
- [x] Reading series: 8 series, 126 steps with quote-checked notes, PL/EN (§21)
- [x] "Wojna w liczbach": 4 headline figures and 9 sourced charts, PL/EN (§22)
- [x] Campaign overviews (Gallipoli, Mesopotamia, Sinai–Palestine, Arab Revolt,
  East Africa) and campaign navigation on every battle page (§23)
- [x] Topic guides ("Tematy"): causes, results, the Polish question, new
  weapons, PL/EN, with "Temat" boxes on 125 pages (§24)

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
- [x] Add a proper-name allowlist to `scripts/i18n-status.mjs` (the "Oraz
  Serdar" false positive) (§6)
- [x] Remove `plq.json` (a leftover Wikipedia API response, never tracked).

### 6. Content quality
- [ ] Go through the 82 inconsistencies found by the "In brief" writers
  (§12 review list).
- [ ] One review list of the ~115 open fact-check items (sources disagree, or
  the claim is defensible) left by the 1918 fact-checks. Decide on each, or
  add a "sources differ" note.
- [ ] A visible "Sources" section on each article.
  - [x] Field, list and person pages from Wikipedia (§11).
  - [ ] Milestones (262 events, 161 battles): fetch 3–5 sources, check
    the key facts.
  - [ ] The other events, over time.
- [x] "Report an error" link on articles, battles and people (§11)
- [x] Print styles and a print button on year and month pages (§11)
