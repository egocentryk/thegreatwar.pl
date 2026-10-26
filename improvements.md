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

### 4. Reader features
- [x] "Meanwhile" (same days, other fronts) and "Related" (battle, people,
  rare tags) blocks on articles (§7)
- [x] Person pages: mentions from links and tags, "Mentioned in battles",
  "Often appears with", and long lists capped at 40 with a link to the tag
  page (§7)
- [ ] Interactive battle map (Leaflet or static SVG). Needs coordinates on
  battle pages.
- [x] Battle timeline (Gantt chart) per front, with sub-battles under their
  parent operation (§8)
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
- [x] Add a proper-name allowlist to `scripts/i18n-status.mjs` (the "Oraz
  Serdar" false positive) (§6)
- [ ] Remove `plq.json` or add it to `.gitignore`. It has been untracked since
  before the English edition.

### 6. Content quality
- [ ] One review list of the ~115 open fact-check items (sources disagree, or
  the claim is defensible) left by the 1918 fact-checks. Decide on each, or
  add a "sources differ" note.
- [ ] A visible "Sources" section on each article.
