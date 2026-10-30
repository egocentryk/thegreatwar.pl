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
  `scripts/checks/year-intros.py` checks every quote against its file (links
  stripped) and that every number in a sentence appears in its quotes, then
  builds the JSON. The drafts with their quotes are kept beside it
  (`scripts/evidence/year-intros/19xx.json`), so an intro can be edited and checked
  again:

      python3 -I scripts/checks/year-intros.py . --build src/data/year-intros.json scripts/evidence/year-intros/19*.json

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
- **How:** one writer agent per series (brief in `scripts/briefs/series.md`).
  Drafts in `scripts/evidence/series/<slug>.json`: every intro sentence backed by
  verbatim quotes, every note by one verbatim quote from its own article in
  the same language. `scripts/checks/series.py` checks the quotes, the
  numbers, the English pages, the date order and 8–18 steps, then writes
  `src/data/series.ts`:

      python3 -I scripts/checks/series.py . --build src/data/series.ts scripts/evidence/series/{lato-1914,legiony-polskie,droga-do-niepodleglosci,wojna-na-ziemiach-polskich,verdun,bitwa-nad-somma,rosja-1917,1918-ostatni-rok-wojny}.json

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
- **How:** five research agents (brief in `scripts/briefs/war-numbers.md`),
  each row with ≥ 2 sources opened and read, at least one not Wikipedia;
  disputed figures as ranges. `scripts/checks/war-numbers.py` checks the
  rules and writes the JSON from the parts (`scripts/evidence/war-numbers/*.json`).
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
- **How:** one writer agent per guide (brief: `scripts/briefs/topics.md`).
  Every paragraph has an evidence entry in `scripts/evidence/topics/<slug>.json`:
  verbatim quotes from our articles (checked by script) or from opened web
  pages listed in the guide's `sources:`; every number in a paragraph must be
  in its quotes. `python3 -I scripts/checks/topics.py . <slug>` checks that,
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

### Second batch (same day): guides 5–8

- Wojna na ziemiach polskich, Rewolucje w Rosji 1917, Wojna podwodna
  1914–1918, Dlaczego Niemcy przegrały wojnę; PL and EN, 2,077–2,642 words,
  53–81 links to our pages (the brief now says "at least 20, no cap" and
  has the `question:` field). Eight guides in all; the "Temat" box is on
  271 pages in each language.
- Two guides went back for sources: "Rewolucje" had web quotes taken from
  the fetch tool's summary; they were re-checked against the raw pages and
  the debate section got a UW article (Kulecka, *Klio*). "Dlaczego Niemcy
  przegrały" had only en.wikipedia; five LeMO (Deutsches Historisches
  Museum) pages now back most web claims. The first batch's "Sprawa polska"
  web quotes were re-checked against the raw pages: 4 of 4 verbatim.
- Fixed in "Nowe rodzaje broni": "U-Booty zatopiły 7677 statków" (uboat.net
  counts ships hit, also damaged and captured) → "prawie 5 tysięcy".
- April 1917 shipping losses (the three conflicting U-boat articles):
  Fayle, *Seaborne Trade* III: 881,027 tons lost to enemy action, of which
  ~847,000 to submarines (the rest mines); 834,549 / 860,000 come from
  unsourced secondary works. Suggested fixes, not made:
  `1917/01/niemcy-oglaszaja-nieograniczona-wojne-podwodna` "ponad 860
  tysięcy" → "zależnie od zestawienia od około 835 do ponad 880 tysięcy";
  `1917/02/poczatek-nieograniczonej-wojny-podwodnej` "880 tysięcy" is
  right (all enemy action); `1917/05/komitet-do-spraw-konwojow` "z innych
  przyczyn" → "razem z ofiarami min".
- Other notes: `1918/08/dymisja-capellego` quotes Scheer's ~500,000 tons a
  month in summer 1918 vs Fayle's 271,000 average (attributed, not wrong);
  the University of Warsaw evacuated to Rostov-on-Don (our article) vs
  Ryazan (rp.pl); bieżeństwo 3 million incl. 500,000 Poles (rp.pl) vs
  2–3.5 million, ~1 million Poles (Chwalba, war-numbers); English guides
  use both "Lemberg" and "Lwów" — pick one.

### Third batch: guides 9–10, and guides on glossary pages

- Państwa centralne i Ententa ("Kto z kim walczył w I wojnie
  światowej?"; 2,423 words, 140 links to our pages, about 75 of them the
  declarations of war and broken relations) and Ludobójstwo Ormian ("Co
  spotkało Ormian w czasie I wojny światowej?"; 2,701 words, ten non-wiki
  sources: Kévorkian/Sciences Po, USHMM, the Armenian National Institute,
  genocide-museum.am, dzieje.pl; every figure a range or attributed).
- Glossary term pages show the guides: `see` in `glossary.json` may now
  hold `tematy/<id>`, shown first in the sidebar as "Temat" with the
  question (`GlossaryTerm.astro`). 57 terms link their guide (gas warfare,
  tanks → new weapons; Bolsheviks, Cheka → the revolutions; the Regency
  Council, the Legions → the Polish question…).
- Dev server: after adding a schema field (`question`) the running
  `astro dev` kept old cached entries without it; `astro dev --force`
  (clears the content cache) fixes it. The build was right.
- Writers' notes: `1915/05/wlochy-wypowiadaja-wojne-austro-wegrom` says
  Salandra and Sonnino signed the London pact "w Londynie" — it was Grey,
  Cambon, Benckendorff and Imperiali (as `wlochy-podpisuja-pakt-londynski`
  says); `abdykacja-krola-konstantyna`: title says abdication, summary says
  he formally didn't abdicate; Talat and the others sentenced 5 VII 1919
  (our page, Kévorkian) vs 10 VI (Armenian National Institute); Djemal
  died 21 VII 1922 (our page) vs 25 VII (Kévorkian).

## 25. Polish thread: 29 Polish person pages with portraits (2026-10-29)

New here (expansion-plan.md §A3, first part).

- 29 person pages, PL and EN (`src/content/postacie/`, `src/content/en/people/`),
  ~850–1,400 words each, sources opened and read (iPSB/PSB where it loaded,
  IPN, dzieje.pl, museum and journal articles: Annales UMCS, Klio, Dzieje
  Najnowsze, Niepodległość i Pamięć, Galicja…). Chosen by how often our
  articles already mention them, plus a few central to the Polish story:
  - Regency and governments: Kucharzewski, Józef Ostrowski,
    Steczkowski, Mikułowski-Pomorski, Świeżyński, Ponikowski, Stecki,
    Moraczewski, Studnicki, Thugutt;
  - the military: Rydz-Śmigły, Sosnkowski, Sikorski, Zygmunt Zieliński,
    Dowbor-Muśnicki, Szeptycki, Tadeusz Rozwadowski, Roja, and Aleksandra
    Szczerbińska (later Piłsudska; the brief's "Szczepanowska" was wrong);
  - Galicia, Vienna, the KNP, the Prussian partition: Bobrzyński, Biliński,
    Juliusz Leo, Wasilewski, Seyda, Maurycy Zamoyski, Trąmpczyński,
    Sienkiewicz; and two non-Poles central to it: Karl Kuk (Lublin) and
    Adam Tarnowski (Austro-Hungarian ambassador in Washington).
  Polish person pages: 9 → 36 (Kuk and Tarnowski are Austro-Hungarian; 271 people in all).
- Portraits for all 29: the main image of the person's pl.wikipedia page,
  all public domain on Commons (`src/data/person-photos.json`,
  `node scripts/person-photos.mjs --write <slugs>`); six seated or
  half-length photos framed by hand (`frame` in the JSON): Ostrowski, Leo,
  Kuk, Biliński, Studnicki, Trąmpczyński.
- `scripts/wiki-to-internal.py` now also converts person links (a page's
  `wikiTitles`; no date rule) in timeline articles, battle pages, topic
  guides and person pages, and their English files: 54 pages now link the
  new people (Ostrowski 8, Dowbor-Muśnicki 7, Sosnkowski, Kuk, Tarnowski 5…).
- Brief: `scripts/briefs/people.md`; workflow.md §2 and §4 updated (counts,
  the link and portrait scripts).

**Later:** Mikułowski-Pomorski (photo c. 1894) and Bobrzyński (an 1888
engraving) have portraits from long before the war; look for later ones.

### Writers' notes (for the review list)

- `sejm-dzielnicowy-w-poznaniu`: Bolesław Krysiewicz chaired "the
  presidium" — of the Sejm, not the NRL? Several biographies make
  Trąmpczyński president of the NRL (8 XII 1918); the page says "some
  biographers".
- `postacie/ignacy-jan-paderewski`: the Vevey committee was founded in
  Lausanne (9 I 1915) and moved to Vevey at the end of January.
- `1915/05/panstwa-centralne-zdobywaja-jaroslaw`: "według polskich
  opracowań" Rozwadowski commanded the 12th Division's artillery; Kułacz
  (Klio 2022, archives): Dobner, then Riedl; Rozwadowski's post unclear
  (the Gorlice battle page already follows Kułacz).
- `wyzwolenie-krakowa`: Antoni Stawarz in the 93rd vs "austriacki 9 pp"
  (Kozłowska).
- `bitwa-pod-rarancza`: the Austrians arrested Zieliński with his staff vs
  his own legionnaires detained him first (Przystanek Historia).
- Kucharzewski: resignation 11 II (our article, pl.wiki) vs 12 II (Goclon);
  cabinet papers handed over 13 XII (our article) vs 2 I 1918 (Goclon).
- Ponikowski's provisional government: 27 II 1918 (our articles) vs 17 II
  (Warsaw Polytechnic biography).
- Thugutt: the January 1919 coup on the night of 4–5 I (our articles) vs
  5–6 I (Marcinkowska).
- Tarnowski left the USA in the first half of May 1917 (Horčička: sailed
  8 V; en.wiki 4 V); `1917/04/austro-wegry-zrywaja-stosunki-z-usa` says
  "na przełomie kwietnia i maja".
- pl.wikipedia errors avoided: Karl_Kuk (Act of 5 November proclaimed in
  Warsaw — it was Lublin), Tadeusz_Rozwadowski (Gorlice role as fact,
  anachronisms), Stanisław_Szeptycki (Polska Siła Zbrojna command),
  Maurycy_Zamoyski (joined the KNP in 1918 — he was a founder in 1917).

## 26. People index as a portrait wall (2026-10-29)

New here (owner's choice of three proposals).

- `/postacie` and `/en/people` (`PeopleIndex.astro`): the big cards in
  country columns (very long; "Sprawa polska", one country, filled one
  column of three) are replaced by a grid of portraits, 3 per row on phones
  up to 8 on desktop, with name and years; the role shows over the portrait
  on hover or focus and in the link title. Grouped by side, the Polish cause
  first, people A–Z by surname within a side.
- Filters (only with JavaScript; without it everyone is listed): chips for
  side, chips for country (a select on phones, where the chip row ran to six
  lines), and a name search that ignores diacritics. Sides with no match are
  hidden and their counts follow the filters.
- Each side fills full rows, so no column stands empty.

**Port to thesecondwar.pl:** the same component (its people index has the
same card layout).

## 27. Society, batch 1: the flu, the air aces, spies and propaganda (2026-10-29)

New here (expansion-plan.md §A4, first batch; brief `scripts/briefs/society-1.md`).

- 17 timeline articles, PL and EN, our own batch (not from the British
  chronology), each with 3–9 sources opened and read:
  - the Spanish flu (6): the first cases at Camp Funston (4 III 1918), the
    "Spanish" name (22 V), the second wave (27 VIII), the flu in the Polish
    lands (24 X: Kraków, Warsaw, Poznań; Mieszkowski's 68–130 thousand
    deaths), the deaths of Egon Schiele and Guillaume Apollinaire
    (Kostrowicki);
  - the air war (7, category Działania zbrojne): Garros's first kill
    through the propeller, Immelmann's and Boelcke's deaths, Richthofen's
    first victory, Bloody April (dated 30 IV 1917), Richthofen wounded,
    Guynemer missing;
  - spies and propaganda (3): the Bryce Report, the "Battle of the Somme"
    film, Mata Hari's arrest;
  - the Paris Gun (1): the shell that hit Saint-Gervais (29 III 1918).
  "Społeczeństwo" grows from 27 to 37 articles.
- Person pages with portraits: Manfred von Richthofen, Mata Hari (her guilt
  disputed, said on the page), Edith Cavell; 8 pages now link them
  (`wiki-to-internal.py`). Mata Hari's pl.wiki photo is a full-length dance
  shot, so the en.wiki one, framed.
- Four planned articles already existed and were not written again (the
  writers checked; the coordinator's search had missed them): the first
  and last shelling of Paris, Mata Hari's execution, Richthofen's death
  ("Śmierć Czerwonego Barona"). **Search titles in all inflections before
  planning a batch.**
- New tags: grypa hiszpanka, Hiszpania, kultura, wywiad, propaganda,
  zbrodnie wojenne, Holandia, Manfred von Richthofen; new person country:
  Holandia / Netherlands.

### Writers' notes (for the review list)

- `battles/1917/bitwa-pod-arras-1917`: the RFC air offensive "od 5
  kwietnia"; the official history (*The War in the Air* vol. 3): 4 April.
- `postacie/oswald-boelcke`: Jasta 2 formed near Bertincourt; the official
  history: Lagnicourt, 30 VIII 1916.
- A namesake: the cavalry general Manfred von Richthofen (1915) appears
  unlinked in `bitwa-pod-szawlami` and `poczatek-bitwy-pod-kupiszkami`;
  never link him to the airman's page.
- Saint-Gervais: 88 dead (Miller) vs 91 (the plaque, our August article) vs
  92 (fr.wiki) — the new article gives all three.
- Cavell arrested 5 VIII (our article, KUMC) vs 6 VIII (en.wiki).

## 28. Society, batch 2, and guides 11–12 (2026-10-29)

New here (expansion-plan.md §A4, second batch; brief `scripts/briefs/society-2.md`).

- 17 timeline articles, PL and EN:
  - women (7): the "Right to Serve" march (17 VII 1915), Skłodowska-Curie's
    X-ray cars (1 XI 1914, one source for the day — said in the text), the
    Women's Battalion of Death (the banner blessing, 4 VII 1917), Elsie
    Inglis's death, the vote in Britain (6 II 1918), Germany (12 XI) and
    Poland (28 XI); new tag "kobiety";
  - the home fronts (6): DORA (8 VIII 1914), bread cards in Germany
    (22 II 1915), summer time (30 IV 1916), the turnip winter (the potato
    ordinance of 1 XII 1916, from the newspaper text), British rationing
    (25 II 1918), hunger in Warsaw and Łódź (Glasenapp's food decree,
    9 X 1915); new tag "racjonowanie";
  - culture (4): "In Flanders Fields", Barbusse's "Le Feu" and the Goncourt,
    Sassoon's protest (read in the Commons 30 VII 1917), Owen's death.
  "Społeczeństwo": 37 → 49.
- Person page with portrait: Maria Skłodowska-Curie (country Francja, born
  in Warsaw, said on the page).
- Duplicate check done properly this time (stems in titles and summaries,
  and every planned date): the two January 1918 strikes already existed and
  were left out.
- Guides 11–12, PL and EN: Życie w okopach ("Jak wyglądało życie żołnierza
  w okopach?"; Canadian War Museum, our battle and society articles) and
  Kobiety w czasie I wojny światowej ("Jak wojna zmieniła życie kobiet?";
  1914-1918-online's women's mobilisation articles); twelve guides in all.
  Glossary: okopy, ziemia niczyja, wojna pozycyjna → the trenches guide;
  racjonowanie → the women guide.

**Done (§30):** guides can link each other.

### Writers' notes (for the review list)

- CKO dissolved September 1915 (`1915/08/niemcy-zajmuja-warszawe`, the
  Beseler page) vs liquidated 12 IX 1916 when the RGO was founded (IPN).
- Glossary "racjonowanie": German bread cards "w styczniu 1915" — the
  decree was 25 I, the cards came in February (Berlin 22 II, Reich 1 III).
- Michaelis page: War Grain Company board November 1914 vs founded
  December 1914 (DHM).
- Barbusse's Goncourt on 15 XII 1916 rests on fr.wiki alone (others:
  "December 1916").
- Women in the first Sejm: "eight in all, with the supplementary
  elections" (our article) vs eight at the first sitting (National
  Geographic); who demanded the vote from Piłsudski: Moraczewska (our
  article) or Budzińska-Tylicka (National Geographic) — the guide names both.

## 29. Homepage topics: one featured guide and a list (2026-10-29)

Owner's choice of three proposals. The homepage section repeated the full
/tematy list (12 entries with summaries and sections, about two screens).

- `HomeTopics.astro` (homepage only): one guide in a panel (number and
  title, the question, the opening answer, "7 rozdziałów · 24 daty · ok.
  13 min", "Czytaj →") beside a numbered one-line list of the other
  questions and "Wszystkie tematy →"; about a third of the old height.
- Every guide's panel is in the HTML; a script features a random one on
  each visit and hides it from the list (without JavaScript: the first).
- `TopicCards.astro` is now only the /tematy list (its homepage mode removed).

## 30. Guides link each other (2026-10-29)

- `rewriteEnHtml` (`src/i18n/index.ts`) maps `/tematy/<id>` to the English
  guide, like `/bitwy/` and `/postacie/` (`enPath.topics`, `plPath.topics`,
  `topicsEn` in `enSlugMaps`). Before, an English guide linking another
  guide would have sent readers to the Polish one, so no guide did.
- `scripts/checks/topics.py` checks `/tematy/` links (the target guide must
  exist); the guide brief allows them.
- 15 cross-links in the guides, PL and EN, each on a phrase already in the
  text (first unlinked mention, never a new sentence), reviewed in context:
  e.g. "linia okopów" → Życie w okopach, "czołgi" → Nowe rodzaje broni,
  "bolszewicy" → Rewolucje w Rosji, "ziemie polskie" → Wojna na ziemiach
  polskich, "nieograniczona wojna podwodna" → Wojna podwodna. Two candidates
  were dropped for the wrong sense ("niepodległość" of Finland and the
  Baltics; "skutkiem" meaning "as a result").

**Port to thesecondwar.pl:** with the guides (§24).

## 31. Polish thread, part 2: 14 timeline articles (2026-10-29)

New here (expansion-plan.md §A3, part 2; brief `scripts/briefs/polish-thread-2.md`).

- PL and EN, our own batch, sources opened and read (IPN, Polish history
  journals, Lithuanian encyclopaedia and LRT, the Korfanty Institute's
  Reichstag record, Morgenthau's report…):
  - the POW: its founding (22 X 1914, Żuliński in Warsaw), the Warsaw
    battalion marching to the Legions (22 VIII 1915);
  - Warsaw city council elections (14 VII 1916; held under a German
    ordinance of May 1916 — the 1915 Russian law never took effect, as the
    brief wrongly assumed);
  - the Prussian partition: Korfanty's Reichstag speech (25 X 1918), Poles
    in the Poznań soldiers' councils (13 XI), the Naczelna Rada Ludowa
    (14 XI);
  - Cieszyn Silesia: the Rada Narodowa Księstwa Cieszyńskiego (19 X 1918),
    the Polish–Czech agreement (5 XI); Lithuania: the Vilnius conference
    (18–22 IX 1917), the act of independence (16 II 1918);
  - Jews in the Polish lands: the Russian expulsions from the front zone
    (anchored on the Kovno deadline, 18 V 1915), the pogroms in Kielce
    (11 XI 1918) and Lwów (22–24 XI; every death toll attributed);
  - the Ochotnicza Legia Kobiet (28 XI 1918, the first muster; other
    founding dates given).
- New tags: Śląsk Cieszyński, Żydzi. 28 XI 1918 renumbered (dayOrder 0–4).

### Writers' notes (for the review list)

- `deklaracja-taryby`: the Vilnius conference "18–23 września" — 18–22 IX
  (the 23rd comes from an error in the act's text).
- `polacy-zdobywaja-lwow` and `battles/1918/obrona-lwowa-1918`: the
  "polska komisja rządowa" figure of 150 dead is the Foreign Ministry
  delegates' (Chrzanowski, Wasercug); the government commission (Rymowicz)
  gave about 50.
- `postacie/wojciech-korfanty`: "the last speech by a Polish deputy in the
  Reichstag" is stated flatly; sources support it only in part.
- The NRL's precursor (the Poznań Citizens' Committee): founded / named in
  1916 (our pages) vs named in July 1918 (Czub).

---

## 32. Scripts tidied: checks, briefs, evidence (2026-10-29)

Owner's request ("don't make a mess in the repo").

- `scripts/checks/` (with a README): `year-intros.py`, `series.py`,
  `topics.py`, `war-numbers.py` — moved from per-feature folders.
  `scripts/briefs/`: every writer brief. `scripts/evidence/<kind>/`: the
  quote and source files the checks read. Paths updated in the scripts,
  briefs, workflow.md and this file; all four checks pass and regenerate
  `series.ts` and `year-intros.json` byte for byte.
- Writers' scratch work goes outside the repo (the briefs now say so);
  `scripts/**/tmp-*/`, `venv/`, `.venv/` and `__pycache__/` are gitignored
  as a safety net (a writer's pip venv had appeared in a tmp folder).

## 33. Campaign overviews, second set; the Polish thread woven in (2026-10-29)

- Seven battle pages, PL and EN (brief `scripts/briefs/battles.md`):
  - overviews: Ofensywa Nivelle'a (16 IV – 9 V 1917; 2nd Aisne, 3rd
    Champagne; Arras stays a separate British page), Ofensywa stu dni
    (8 VIII – 11 XI 1918; 15 existing battles under it), Bitwy nad Isonzo
    (all twelve, Caporetto the twelfth; casualties as in war-numbers),
    Zajęcie niemieckich kolonii w Azji i na Pacyfiku (29 VIII – 7 XI 1914;
    Samoa, New Guinea, Micronesia, Tsingtao under it);
  - the thin Italian front: Bitwa o Ortigarę (10–29 VI 1917), Walki o Col
    di Lana (8 VII 1915 – 18 IV 1916, the mine), Trzecia bitwa o Monte
    Grappa (24 X – 1 XI 1918, under Vittorio Veneto).
  31 sub-battles registered in `battleParents.ts`; map points added (the
  Pacific overview on the world map, centred on Chuuk). `wiki-to-internal.py`
  aliases for Ofensywa_Nivelle’a, Ofensywa_stu_dni, Bitwy_nad_Isonzo: 20
  articles now link our pages (18 links kept: dated before the battle).
- The 14 Polish-thread articles (§31) woven in: 13 links from the guides
  "Sprawa polska", "Wojna na ziemiach polskich" and "Kobiety" (a few short
  sentences added, each with evidence quotes); the series "Droga do
  niepodległości" gains Korfanty in the Reichstag and the Naczelna Rada
  Ludowa (18 steps). Not linked from any guide: the Vilnius conference,
  the Lithuanian act, the Poznań soldiers' councils.

### Writers' notes (for the review list)

- `battles/1918/bitwa-pod-vittorio-veneto`: Giardino "halted after three
  days" — the 4th Army attacked again on 29 X (Edmonds, it.wiki).
- `battles/1917/pierwsza-bitwa-nad-piawa`: links "alpini" to the generic
  Strzelcy_alpejscy (on the traps list).
- Nivelle dismissed 15 V (our article, fr.wiki) vs 16 V (en.wiki).
- Pacific: AN&MEF 1,000 + 500 (our articles, AWM encyclopedia) vs 1,500 +
  500 (AWM media kit); New Ireland occupied 17 X
  (`kapitulacja-niemieckiej-nowej-gwinei`) vs the Nusa taken at Kavieng in
  September (`australijczycy-zdobywaja-komet`); Japanese name order differs
  between the Tsingtao page (Western) and the Yap article (Japanese).

## 34. Short articles expanded (2026-10-29)

- 30 of the 242 articles under 300 words rewritten at full length, PL and
  EN (brief `scripts/briefs/expand-short.md`, checker
  `scripts/checks/expand.py`): the 10 short milestones (Mons, Charleroi,
  the Ardennes, Morhange–Sarrebourg, Miluza, Gete, three declarations of
  war, the Kraśnik battle page) and 20 short articles on key events (the
  July crisis mobilizations and ultimatums, Belgium and Luxembourg, the
  German–Ottoman alliance, Italian neutrality, the Japanese ultimatum,
  Hindenburg, the first days on the Kingdom's border, Kitchener's army,
  the first bomb on England, Haller in France). 210–293 → 474–772 words
  (Kraśnik 290 → 1,226), each with 3–8 `sources:` actually opened; these
  are the first timeline articles with sources (planned-improvements §1).
- Front matter unchanged except `sources:`; five summaries and three
  "W skrócie" lists corrected where facts were wrong. The other ~210 short
  articles are minor events whose length fits; the "Początek/Koniec
  bitwy…" pointers stay short (their battle pages carry the story).
- Corrections in the old texts: Grey on 24 VII proposed four-power
  mediation, the conference came on 26 VII; Dease and Godley's VCs were
  "among the first" (also on the Mons battle page; Wright and Jarvis
  added); 22 VIII French dead "about 27,000, at least 25,000 by other
  counts" (also on the Ardennes page and the Frontiers article); French
  mobilization "nearly 2.9 million 1–15 VIII"; unverifiable claims removed
  (the German state of imminent war handing power to the army, the Adolphe
  Bridge meeting, the Prostki "first shots", Kitchener's "7 VIII, ages
  19–30" appeal, a wounded boy at Dover). Two pl.wiki links converted to
  our pages (Leon Biliński, Liège).
- Port note: the checker compares front matter with `git HEAD`, so run it
  before committing.

### Writers' notes (for the review list)

- `austro-wegry-wypowiadaja-wojne-belgii` (22 VIII): the note is dated The
  Hague, 28 VIII (Grey Book No. 77, FRUS, Rauchensteiner); only British
  chronicles give 22 VIII. Kept on 22 VIII with the facts in the text;
  consider moving it.
- `pierwsze-walki-na-granicy-krolestwa-polskiego` (1 VIII): no real
  fighting that day; the title is loose (the text says so).
- `general-haller-we-francji`: the Le Havre landing rests on the notes to
  Dmowski's post-war edition only.
- `japonia-oglasza-stan-wojny-z-austro-wegrami` (25 VIII): Rauchensteiner
  says it was unclear for months whether the two were at war.
- `wielka-brytania-wypowiada-wojne-niemcom`: "23:00 London" deadline not
  in the primary texts ("12 o'clock to-night").
- `pierwszy-niemiecki-nalot-na-anglie`: pilot "Stephan von Prondzynski"
  (Castle) vs "Alfred", not the pilot (Dover Society).
- Battle pages: `bitwa-nad-gete` withdrawal "around 16.30" vs the Belgian
  official account ("till late in the evening"); `bitwa-pod-liege` "all
  forts fell by 16 VIII" vs 16–17 VIII. The Mons, Charleroi, Ardennes,
  Lorraine and Miluza battle pages are ~400 words: next candidates.

## 35. Glossary, second batch: 50 terms (2026-10-30)

- `src/data/glossary.json`: 84 → 134 terms, PL/EN (brief
  `scripts/briefs/glossary.md`, entries in `scripts/evidence/glossary/`,
  checker and merge `scripts/checks/glossary.py`). Candidates were chosen
  by how many articles use them (a count over all articles, battles and
  people); each new term matches at least 3 pages per language.
  - Sprawa polska: Akt 5 listopada, Związek Strzelecki, Sokół, Naczelna
    Rada Ludowa, Rada Polska Zjednoczenia Międzypartyjnego.
  - Wojsko: askarysi, Schutztruppe, Kozacy, Armia Wschodu, kawaleria
    wielbłądzia, Yıldırım, Krzyż Wiktorii, Pour le Mérite, wojna minowa,
    zasieki.
  - Broń: Gruba Berta, działo paryskie, bombowiec, wodnosamolot, samochód
    pancerny, szrapnel, działo kolejowe, moździerz okopowy.
  - Morze: krążownik pomocniczy, kontrabanda wojenna, niszczyciel, statek
    szpitalny, okręt-baza wodnosamolotów.
  - Polityka: Liga Narodów, traktat wersalski, paryska konferencja
    pokojowa, system mandatowy, reparacje, wojny bałkańskie, kryzysy
    marokańskie, gabinet wojenny.
  - Rewolucja: Ukraińska Centralna Rada, Hetmanat, bataliony śmierci,
    Ochrana, rewolucja listopadowa, Związek Spartakusa, legenda o ciosie
    w plecy.
  - Ludność: rekwizycje, propaganda wojenna, cenzura, Czerwony Krzyż,
    pożyczki wojenne, prawa wyborcze kobiet, cmentarze wojenne (the West
    Galician cemeteries first).
- Dropped: Trójprzymierze (already in `panstwa-centralne`), nerwica
  frontowa (under 3 pages).
- Existing patterns narrowed so they don't mark the new terms: `haubica`
  no longer matches Gruba Berta, trench or Stokes mortars (also when a link
  splits "[moździerzy] okopowych"); `rajder` no longer matches auxiliary
  cruisers.
- The checker now also rejects pattern escapes that JavaScript's `u` flag
  refuses (`\"` passed Python but broke two English patterns).
- Collisions handled by the writers (examples for the port): "Liga
  Narodowa" (Dmowski) vs Liga Narodów; parliamentary vs League mandates;
  "konferencja pokojowa" also means Brest, Bucharest, The Hague; "wojna
  minowa" at sea; "bombers" = grenade throwers in English battle pages
  (15 excluded); "działa dalekonośne" in general (9 excluded); Askari the
  surname; the destroyer *Cossack*; "rewolucja w Niemczech" hoped for by
  the Bolsheviks (6 excluded); propaganda and censorship outside the war
  (Nazi, Soviet, Boer War: excluded).

**Port back to thesecondwar.pl:** the checker (`scripts/checks/glossary.py`:
page counts, sample matches, JS-escape check, `--merge`).

### Writers' notes (for the review list)

- `1917/08/francja-uznaje-komitet-narodowy-polski` (PL/EN): the Rada Polska
  Zjednoczenia Międzypartyjnego "w Piotrogrodzie"; its seat was Moscow (pl.wiki,
  Tarasiuk/IPN; our Haller and Kaniów articles say Moscow).
- Liman von Sanders took over Yıldırım 1 III 1918 (our articles) vs 24/25 II
  (en/tr.wiki); the entry says "24 II – 1 III".
- Thin sourcing: Pour le Mérite (no non-Wikipedia WWI source), Kozacy,
  Ochrana (Spartacus Educational), niszczyciel, bombowiec, samochód
  pancerny, wodnosamolot, reparation payments (Wikipedia only). Britannica,
  IWM, 1914-1918-online, nzhistory and PWN again refused automated reading.

---

## 36. Before the war: the "Przed wojną" era, 20 articles (2026-10-30)

- 20 timeline articles, 1879–1913, PL and EN (brief
  `scripts/briefs/before-the-war.md`, checked with `scripts/checks/expand.py`):
  the alliances (Dual Alliance, Triple Alliance, the Reinsurance Treaty's
  lapse, the Franco-Russian alliance), Britain and the naval race (first
  Navy Law, Entente cordiale, HMS Dreadnought, the 1907 convention), the
  crises (Tangier, Algeciras, Bosnia, Agadir), the Balkans (the
  Italo-Turkish war, both Balkan Wars, the treaties of London and
  Bucharest) and the Polish preparations (ZWC, Związek Strzelecki, KTSSN).
  468–673 words, 3–8 sources each; no milestones, no battle pages, no
  `front`. Two new tags: "wojny bałkańskie", "kryzysy marokańskie".
- Scope agreed with the owner: thesecondwar.pl covers the roots of WWII in
  Asia from 1895 (Queen Min, Portsmouth, Korea), so this era is European
  and Polish only; the Russo-Japanese War gets a clause at most.
- One era page instead of a page per year: `/timeline/przed-wojna`,
  `/en/timeline/before-the-war`, "Przed wojną" / "Before the war" first in
  the year menu. `WAR_START_YEAR` / `isPreWar` in
  `src/utils/groupTimelineEntries.ts`; `paths().year()` and `.month()`
  send pre-war years to the era page (months as anchors `#1908-10`), so
  breadcrumbs, person-page and glossary lists link correctly; year and
  month pages are not generated for those years. The era page reuses the
  year-page layout (heading and "W skrócie" in a sticky column, years and
  months beside it); the month list is now its own component,
  `TimelineMonth.astro`.
- Kept to the war itself: `/timeline` opens at 1914, the homepage period
  ("VI 1914 – XII 1918"), "On this day" and the random days skip pre-war
  articles (`calendarPool.ts`); long tag/category lists keep pre-war
  entries on their first page (`listYear` in `filteredPages.ts`).
- "W skrócie" for the era: `scripts/evidence/year-intros/przed-wojna.json`
  (`"year": "przed-wojna"`), every sentence backed by quotes, built into
  `src/data/year-intros.json` with the year intros.
- Links into the era: `wiki-to-internal.py` gained `EVENTS` (pl.wiki title →
  timeline article, linked only from later content): 94 files (articles,
  battles, guides, people, PL and EN) now link our articles for the Dual
  and Triple Alliances, the Franco-Russian alliance, the Entente cordiale,
  Dreadnought, the Bosnian crisis, the Italo-Turkish and Balkan Wars, the
  1913 treaties, ZWC, Związek Strzelecki and KTSSN. Glossary main pages
  moved to the new articles for kryzysy marokańskie, wojny bałkańskie,
  Związek Strzelecki and drednot; ententa and państwa centralne list them.
- Fixes from the writers' research: Serbia "nearly doubled its territory"
  (not territory and population) in the causes guide and the glossary; the
  Balkan allies joined on 18 X (glossary); the second Moroccan crisis ended
  in November (guide); KTSSN, not the Galician "Komisja Skonfederowanych…",
  appointed Piłsudski on 1 XII 1912 (person page); Adrianople went back to
  Turkey by the September 1913 treaty, not Bucharest (Ferdinand page).
- Regression fixed: the §34 rewrites had broken 25 verbatim quotes in the
  guide, series and year-intro evidence (checkers now 0 problems). Two
  guide sentences changed to match the corrected articles: French
  mobilisation "nearly three million", Kalisz "many inhabitants fled" (by
  22 VIII). Port note: after rewriting articles, re-run `topics.py`,
  `series.py` and `year-intros.py`.

### Writers' notes (for the review list)

- Dates the writers chose where sources differ: ZWC 17 VI 1908 (only MHP
  gives the day); Związek Strzelecki 23 IV 1910 (also 25 IV, and 23 III for
  the permit); Bosnia 6 X 1908 (4, 5, 6 and 7 X all in the literature);
  Bulgaria's attack 29 VI 1913 (the night of 29/30); Navy Law 10 IV 1898
  (the law itself; Reichstag vote late March).
- `postacie/konstantyn-i` and `elefterios-wenizelos`: Greece's territory
  "nearly doubled" in 1913; sources give about +68%.
- `panstwa-centralne-i-ententa` and glossary `ententa`: "sojusz
  francusko-rosyjski z 1892 roku" — the convention was signed in 1892 but
  binding only from 4 I 1894.
- pl.wiki pages missing for Aehrenthal, Kiderlen-Waechter, Holstein,
  Giers, Kálnoky, Narodna Odbrana, Bregalnica, Kilkis, the 1913 Treaty of
  Constantinople; "SMS Panther", "Mansion House", "Sazonow", "Tybet" are
  disambiguation pages.

---

## 37. Wikipedia links to our own pages: the rest (2026-10-30)

- `scripts/wiki-to-internal.py --write` over all content: the last 14
  files (11 timeline articles, 3 battle pages, PL and EN) now link our
  battle and person pages (Somme, Brusilov, Verdun, Loos, Yser, Jutland,
  Coronel, Tannenberg, Michael, François Anthoine). A dry run now reports
  0 files; the 211 links kept are forward links in time (165), a page's
  own subject (38) or an article's own battle (8).
- Closes expansion-plan B2; B1 (topic guides) was already delivered as A1.
- Port note: run the script after every batch that adds battle, person or
  event pages; dry run first, then `--write`, then re-stamp the English
  files it lists.

---

## 38. Three known errors fixed (2026-10-30)

- `1917/09/francja-uznaje-komitet-narodowy-polski` (PL/EN): the Rada Polska
  Zjednoczenia Międzypartyjnego sat in Moscow, not Petrograd (pl.wiki: set
  up at a congress in Moscow; our Haller and Kaniów articles agree). From
  §35's notes.
- Battle pages checked against the Belgian official account (*The War of
  1914: Military Operations of Belgium*, 1915, archive.org
  `warof1914militar01belg`): `bitwa-nad-gete` — the 2nd Brigade held
  Hautem-Sainte-Marguerite "till late in the evening" and covered the
  division's withdrawal; the "16.30" retreat is now given as some studies'
  version, and Tienen was taken before that attack, not "in the evening".
  `bitwa-pod-liege` — "the last of the forts fell on the 16th and 17th
  August": result, text and `endDate` (16 → 17 VIII) changed; also
  `bitwa-graniczna` ("held out until 16–17 August"). PL/EN. From §34's
  notes.
- Guide "Sprawa polska": the summary no longer repeats the question's
  "Jak" ("Wojna trzech zaborców doprowadziła…"; EN "A war between…").

---

## 39. Five 1914 battle pages expanded (2026-10-30)

- Mons, Charleroi, the Ardennes, Lorraine and Mulhouse (Miluza): 305–395
  → 1,317–1,500 words, PL and EN, each with the battle-page sections
  (Nazwa i daty, Tło, the course, Straty, Znaczenie) and 5–8 `sources:`
  (Edmonds, Der Weltkrieg vol. 1, Lanrezac, Spears, the Michelin guide,
  regimental accounts; Gallica blocked automated reading, so the French
  official history could not be used). Brief `scripts/briefs/expand-short.md`,
  checker `scripts/checks/expand.py` (0 problems).
- Corrections in the old texts: Lorraine — no deliberate German trap
  (Der Weltkrieg: Rupprecht dropped the withdrawal behind the Saar and
  attacked on 20 VIII); Mons — the canal salient held by the 4th
  Middlesex and 4th Royal Fusiliers, the "first and last soldier" at St
  Symphorien hedged, the Angels of Mons traced to Machen's story;
  Mulhouse — the Army of Alsace disbanded 25 or 26 VIII (not 28 VIII; also
  in `niemcy-ponownie-odbijaja-miluze`, where an unverified 22 VIII
  hand-over was removed), Mulhouse back in France on 17 XI 1918; Ardennes —
  a forward link to the Meuse battle page removed. `bitwa-graniczna`:
  Lunéville taken 22–23 VIII.

### Writers' notes (for the review list)

- `bitwa-pod-miluza` endDate 25 VIII: the French evacuation is dated
  24–26 VIII; 26 VIII is better supported (Der Weltkrieg, en.wiki). Kept,
  with the uncertainty in "Nazwa i daty".
- `poczatek-bitwy-pod-charleroi`: "French intelligence counted five German
  corps north of the Meuse against thirteen"; Edmonds p. 52 says the Allied
  command was correctly informed of the German corps in Belgium.
- `oblezenie-namuru`: the Belgian 4th Division left "in the evening" of
  23 VIII; Spears relays a midday evacuation.
- `poczatek-bitwy-w-ardenach`: 63 civilians killed at Tintigny vs 93 shot
  (2e RIC account); the Semois bridge "destroyed" vs shelled and
  impassable.
- The two Morhange–Sarrebourg timeline articles still say the Germans
  "deliberately withdrew, drawing the French in"; Der Weltkrieg shows the
  plan was dropped (the battle page now says so).

---

## 40. Country pages, "Kraje w wojnie" (2026-10-30)

- New collection `countries` (`src/content/countries/<slug>.md`, English
  `src/content/en/countries/`), pages `/kraje`, `/kraje/<slug>`,
  `/en/countries`, `/en/countries/<slug>`: 16 belligerents (Serbia,
  Montenegro, Romania, Greece, France, the UK, Russia, Belgium, Japan,
  Italy, Portugal, the US; Germany, Austria-Hungary, the Ottoman Empire,
  Bulgaria), 1,016–1,242 words each, PL and EN, every paragraph backed by
  verbatim quotes (`scripts/evidence/countries/`), 4–7 sources each, at
  least 2 not Wikipedia (mostly 1914-1918-online). Brief
  `scripts/briefs/countries.md`.
- Front matter: `name` (the state as the tags name it), `side`,
  `entered` / `left` (first day at war, day it stopped fighting; the text
  explains armistice vs peace), `numbersAs` (other labels in
  war-numbers.json, e.g. "Imperium Brytyjskie"), `order`, `updated`.
- The page lists by itself, matched on `name` (`src/utils/countries.ts`):
  its figures from "Wojna w liczbach" (mobilised, military deaths, share of
  population), its battle pages (a side's name mentions the state; key
  battles shown, the rest folded), its person pages (`country:`), its key
  dates (milestones with its tag) and a link to all its tagged articles.
  `CountryPage.astro`, `CountryCards.astro` (the index in two columns,
  Entente and Central Powers).
- Wiring: "Kraje" / "Countries" in the header; a link on /timeline next to
  "Tematy"; tag pages of a state link its country page; `/kraje/<slug>`
  links map to English (`rewriteEnHtml`); `i18n-status.mjs` knows the new
  kind; `topics.py --countries <slug>` checks the pages (the guides' rules
  plus 2 sources outside Wikipedia).
- Port note: thesecondwar.pl can reuse the whole set (collection, util,
  component, checker flag) with its own states.

### Writers' notes (for the review list)

- `1918/11/zgromadzenie-w-podgoricy`: 26 XI (ours) vs 24 XI (1914-1918-online).
- `rzad-tymczasowy-wypowiada-wojne-niemcom-i-bulgarii`: 23 XI 1916 (ours)
  vs 24 XI (1914-1918-online).
- `kapitulacja-greckiego-iv-korpusu-w-kawali`: surrendered to the Germans
  (ours) vs to the Bulgarian army (Hassiotis).
- Romania in 1914-1918-online: Bucharest fell 9 XII 1916 (ours 6 XII),
  Focșani 7 XII 1917 (ours 9 XII), Mărăști 24 VII (ours 22 VII).
- Dobro Pole 14 IX (1914-1918-online) vs 15 IX (ours: bombardment 14th,
  attack 15th); Bulgarian mobilisation 15 IX 1915 vs our 21/22 IX;
  Przemyśl garrison 110,000 (encyclopedia) vs our ~120,000 prisoners.
- Radomir republic: proclaimed by Stamboliyski (pl.wiki) vs Daskalov
  (`postacie/aleksandyr-malinow`).
- Portugal: Naulila incident 19 X and battle 18 XII 1914 (ours) vs both in
  December (encyclopedia); Lettow-Vorbeck nine vs ten months in
  Mozambique; Austria-Hungary's "declaration" of 15 III 1916 (en.wiki) vs
  none (ours).
- `brytyjczycy-odbijaja-mons`: title says "Brytyjczycy", the summary says
  the Canadians entered Mons.

---

## 41. "Głosy z frontu", pilot: August 1914 (2026-10-30)

- 12 first-hand quotes for August 1914 (`src/data/voices.json`), from 8
  nations, 4 Polish: Piłsudski, Luboń-Kamiński's diary of the Kadrówka,
  Grand Duke Nicholas's proclamation, Bandrowski in Lwów, Mildred Aldrich,
  Albert I, Giraudoux, Hoffmann, Bloem, Smith-Dorrien, Gibson at Leuven,
  Paléologue/Sazonov after Tannenberg. Public domain only (author died
  1955 or earlier); every quote copied from a digitised text (Wikisource,
  archive.org, Gutenberg), with the original language kept for translations.
- Data and check: brief `scripts/briefs/voices.md`, evidence
  `scripts/evidence/voices/`, checker and merge `scripts/checks/voices.py`
  (fields, article exists and is within 10 days, at most 2 per article,
  author's death year, 15–70 words, Polish/English text matches the
  original, source not Wikipedia).
- Display: `VoiceBox.astro` under the article text (PL and EN), with the
  original of a translated quote folded under it; `/glosy` and
  `/en/voices` (`VoiceList.astro`) list all voices. Not in the menu yet: a
  pilot for the owner to judge before scaling up.
- Batch 1 (IX 1914 – III 1915, owner chose "key articles first, then
  months"): 31 more voices, 43 in all. Three groups (Western Front;
  Flanders, the sea and home fronts; the East, Polish lands and Ottoman
  fronts), 6 Polish voices (Piłsudski ×3, Żeromski, Bandrowski, a Lublin
  woman via Kondruszkin), Witkop's *Kriegsbriefe gefallener Studenten*,
  Gleichen, Lintier, Moltke's letters, Macnaughtan, Michaelsburg in
  Przemyśl. Two duplicates dropped at merge. The checker now has an
  `odezwa` kind and compares long quotes correctly (`autojunk=False`).
  Key articles left without a voice (no public-domain source found):
  Grand Couronné, Albert, Artois, Arras, Armentières, first Champagne,
  Messines, Langemarck, Nonne Bosschen, Givenchy, Łowczówek; no Serbian or
  Belgian voice yet.
- Owner's rules after batch 1: no cap on voices per author; orders,
  letters and proclamations may be up to 14 days from their article (the
  checker enforces it). Added Piłsudski's order after Łowczówek.
- Batch 2 (IV – XII 1915): 37 voices, 81 in all. Western Front (McCrae,
  Lauriat on the Lusitania, Seeger, Sorley, Chapin, Gibson on Cavell, Boelcke),
  the south (Hamilton, Beeston at Anzac, Knapp at Van, Rößler on the
  Armenians, Boselli, Borsi, Stobart in Serbia, Żostow, Townshend at Kut),
  the East (Słomka, Orkan, Rodziewiczówna, Gippius, Pares, Hoffmann,
  Michaelsburg). One weak voice (a reaction piece, not first-hand) dropped.
  No public-domain voice found for Hill 60, Gravenstafel, Frezenberg,
  Aubers, second Artois, Le Linge, the first raid on London, Salonika,
  Italy's war on Turkey, the Gallipoli evacuation, Rarańcza, the Legions in
  Volhynia. Van: our article has Cevdet demanding about 4,000 men, Knapp
  3,000.
- Batch 3 (I – VIII 1916): 42 voices, 123 in all, four groups. Verdun and
  the home fronts (Raynal at Fort Vaux, Stephens and Mrs Norway in Dublin,
  Jellicoe, the Kaiser's Skagerrak speech, Earl Russell on conscription),
  the Somme (Seeger, Olive Dent, Carver, Lee, H. E. Williams before
  Fromelles, the Raws brothers, Schmidt at Guillemont), the south (King
  Nikola, Bell on Kut and Mecca, Townshend, Fahreddin, the Sharif's
  proclamation, Brett Young, Barzini at Gorizia, Queen Marie, King
  Ferdinand), the East (Brusilov, Hoffmann, Daszyński, Piłsudski on
  Kostiuchnówka and on the second anniversary). One undated retrospective
  sketch dropped. Weakest source: Lee's letter, from a memorial website's
  transcription. Content gap: no article on Kostiuchnówka / Polska Góra
  (VII 1916); its voices sit on `koniec-bitwy-pod-baranowiczami`. No voice
  for Lochnagar, Bazentin, the Sussex, the Gallipoli evacuation, Lovćen,
  Mora, Kilimanjaro, Sykes–Picot, Portugal.
- Batches 4–8 (IX 1916 – XII 1918, owner: "cover the whole war"): 231
  voices, **354 in all**, on 301 articles (150 of the 260 key articles
  since VIII 1914), 185 authors, 15 languages (en 167, de 60, pl 53, fr
  34, ru 19, it 10, and ro, uk, bg, zh, pt, cs, tr, sk, hu). Groups by
  theatre plus a Polish group for 1917–1918; two batches ran in parallel,
  each writer told the other groups' key articles. Highlights: Reed,
  Beatty and Gippius in Petrograd, Czernin and Hoffmann at Brest, Rommel
  at Caporetto, Weizmann on the Balfour Declaration, Lawrence at Aqaba,
  Megiddo and Damascus, Monash, Owen's last letters, Nicholas II's last
  diary entries, Lloyd George on 11 XI, Słomka on 1 XI 1918, Rzepecki in
  Poznań.
- Rules added on the way: quote originals, or a period translation only if
  its translator is named and died by 1955, or unnamed and published by
  1955 (anonymous: 70 years from publication); `died: null` with a
  `licence` note for texts freed by their heirs (Durville, PD-heirs on
  Commons) and for official documents (Regency Council, Provisional Council
  of State, governments, IV Universal, Alba Iulia; Polish copyright act
  art. 4) — 17 such voices. A guessed death year is not accepted.
- Overlaps cleaned at merge: duplicate ids renamed, four voices dropped
  where two groups chose the same articles (batch 4), two weak voices
  dropped (not first-hand, undated).
- For the owner: Tormay (Hungarian, Villa Giusti) wrote a far-right,
  antisemitic diary; the quote is soldiers' talk, flagged in `why`.
- Content gaps found: no article on Kostiuchnówka (VII 1916), the Lost
  Battalion, Rarańcza 1915, the Legions in Volhynia 1915.
- Possible fixes to our articles reported by the writers (for the review
  list): Compiègne signing at 5.12–5.20 (Erzberger) vs "kilka minut po
  piątej"; the Kucharzewski cabinet resigned 11/12 II and the Regency
  Council's proclamation is dated 14 II (not 13 II); Piłsudski reached
  Warsaw 12 vs 15 XII 1916; Selous buried under a baobab (Buchanan), not a
  tamarind; Van: Cevdet's demand 4,000 vs 3,000 men; Rommel's "over 1,000
  guns" at Tolmein vs "setki dział"; Daszyński on the 27/28 V 1917 votes;
  Arleux zero hour 4.25 vs 4.30.
- Display redesign (owner: the single page with 354 voices was far too
  long; a hub with card grids was tried and rejected; chose "like the
  timeline"): `VoiceTimeline.astro` uses the timeline's own `tl-*` classes —
  year and month menus, months as sections, a dot and day number per day.
  Each voice is headed by the title of its article as a real link (as
  timeline entries are; owner: link the article, not a toggle, for SEO),
  then the full quote, author (person page link), role, kind and source;
  the original of a translation is folded. Full container width. `/glosy` shows 1914 with the
  intro (as `/timeline` opens at its first year), `/glosy/1915` … the other
  years; an article's box links to its voice there (`voiceHref`, `#<id>`). Linked from the homepage next to "Wojna w liczbach"
  ("Głosy z frontu →" / "Voices from the front →"); not in the main menu.

### Writers' notes (for the review list)

- `bitwa-pod-le-cateau`: Wilson's call "about 7.00" and Smith-Dorrien's
  "too late" reply follow the Official History; his memoir has 6.45, a
  reply that he would try to break off, and Wilson's "Good luck to you;
  yours is the first cheerful voice I have heard for three days."
- No first-hand Kalisz voice found whose author certainly died by 1955
  (the 1914 "Na zgliszczach Kalisza" is signed only "W. Z.").

---

## 42. English edition: Lviv (2026-10-30)

- Owner's rule: the English name of the city is **Lviv** (Lemberg is
  German, Lwów Polish). Replaced in 138 English files (articles, battles,
  people, guides: Lemberg 311×, Lwów 158×, plus `location`/`result`/`role`
  fields), the English glossary texts, `data-en.ts` (phase intro, homepage
  texts, the tag name) and, through their evidence, the English year
  intros and series (rebuilt; checkers 0 problems).
- Kept: established battle names ("the Battle of Lemberg" for 1914,
  "Battles of Lemberg"), historical proper names (Lwów Eaglets, Lwów
  Polytechnic), words inside quotations and the voices, link targets
  (pl.wikipedia URLs stay byte for byte as in Polish), and "Lvov" for the
  people (Georgy and Vladimir Lvov) and the Russian "Galich–Lvov operation".
- The English tag page moved from `/en/tag/lemberg` to `/en/tag/lviv`;
  `vercel.json` redirects the old URL (301). Rule recorded in
  `translation-brief.md`.

---

## 43. The Legions 1915–1916 and the Lost Battalion (2026-10-30)

- Gaps found while collecting voices, filled PL/EN (brief
  `scripts/briefs/legions-and-argonne.md`, checker `expand.py`, 0 problems):
  - **Rarańcza 1915:** battle page `bitwa-pod-rarancza-1915` (12–15 VI
    1915, phase 1915-gorlice; the slug avoids the 1918 article) and the
    start/end articles (12 and 15 VI), with the uhlans' charge at Rokitna.
  - **Volhynia 1915:** `legiony-zdobywaja-kukle` (22 X),
    `legiony-zdobywaja-kamieniuche` (27 X; sources 27–29 X),
    `legiony-zdobywaja-polska-gore` (10 XI; the name dates from this
    capture). No battle page: no single fight supports one.
  - **Kostiuchnówka:** battle page `bitwa-pod-kostiuchnowka` (4–6 VII 1916,
    phase 1916-front-wschodni) and the start/end articles.
  - **The Lost Battalion:** `zaginiony-batalion-okrazony-w-argonnach` (3 X
    1918) and `odsiecz-dla-zaginionego-batalionu` (7 X), under the
    Meuse-Argonne battle; "Go to hell" presented as legend.
- Wiring: 9 pages now link the Kostiuchnówka battle page instead of
  pl.wikipedia (`wiki-to-internal.py`); Piłsudski's page and the "Sprawa
  polska" guide link the Volhynia articles; Zieliński's page and the 1918
  Rarańcza article link the 1915 battle; the two Kostiuchnówka voices moved
  to `koniec-bitwy-pod-kostiuchnowka`; "Kościuchnówką" → "Kostiuchnówką" on
  the Brusilov page; Mościska articles reordered (dayOrder 2) on 12 and 15
  VI 1915. Map coordinates: Kostiuchnówka from pl.wiki, Rarańcza by hand
  (the village, today Ridkiwci).
- Milestones (owner): the Kostiuchnówka battle page and its 4 VII article,
  each with a "W skrócie" of four points, PL/EN.

### Writers' notes (for the review list)

- `postacie/kazimierz-sosnkowski`: "dowodził jedną z grup I Brygady nad
  Styrem" in autumn 1915; Klimecki gives the detached group to Rydz-Śmigły.
- The Russian XLVI Corps at Kostiuchnówka was in Lesh's 3rd Army (ru.wiki
  after Kersnovsky), not Kaledin's 8th (pl.wiki infobox).
- `timeline/1918/02/bitwa-pod-rarancza` has no `sources:` yet.
- pl.wiki traps: `Zaginiony_batalion` is the 2001 film (use
  `Zagubiony_Batalion`); `Nikołaj_Istomin` is an NKVD officer; `Polska_Góra`
  and `Wołczeck` are disambiguation pages; the village is `Kamienucha`.

---

## 44. "Po wojnie": the war after the war, 1919–1923 (2026-10-30)

- Owner chose A6 option (a): this site covers the armed conflicts that
  carried the Great War on, above all Poland's wars for its borders, up to
  the recognition of the eastern border (15 III 1923); thesecondwar.pl keeps
  the political road to the next war (and was not edited).
- 53 timeline articles and 2 battle pages, PL/EN (brief
  `scripts/briefs/after-the-war.md`, checker `expand.py`, 0 problems), by
  seven writers: Eastern Galicia and Vilnius 1919; Cieszyn, Trier,
  Versailles for Poland, Pomerania and the Warmia–Masuria plebiscite; the
  Silesian uprisings and plebiscite; the Polish–Soviet war in two parts
  (battle pages `bitwa-warszawska` and `bitwa-nad-niemnem`, new phase
  `1920-wojna-polsko-bolszewicka`); the Russian Civil War and the Allied
  intervention; Ireland, the Baltic, the Greco-Turkish war, Klaipėda.
- Era code generalised: `eraOf` / `isOutsideWar` / `warYear` in
  `groupTimelineEntries.ts`; `paths().eraAfter`; "Po wojnie" / "After the
  war" last in the year menu; `/timeline/po-wojnie`,
  `/en/timeline/after-the-war` with its own "W skrócie"
  (`scripts/evidence/year-intros/po-wojnie.json`). Post-war years are kept
  out of the homepage period, "On this day" and the random days; split tag
  lists fold them into 1918. The battle map's year chips come from the data
  (a 1920 chip); the battle Gantt chart (`/bitwy/os-czasu`) keeps to the war
  years. Map coordinates for the 1920 battles by hand (Warsaw, Grodno).
- Links in: 9 person pages via `wiki-to-internal.py` (new `EVENTS` entries
  for the uprisings, plebiscites, Trier, Riga, Żeligowski…), hand links on
  Denikin, Gajda, Rydz-Śmigły, Yudenich and the "Skutki" guide. 1918
  articles cannot link forward (workflow rule). New tags: "wojna
  polsko-bolszewicka", "powstania śląskie", "wojna domowa w Rosji".
- Owner decisions: milestones (with "W skrócie", PL/EN) for Versailles for
  Poland, the start of the Polish–Soviet war, the Battle of Warsaw page and
  its start, the Peace of Riga, the third Silesian uprising, the division of
  Upper Silesia, the end of the Polish–Ukrainian war, Vilnius 1919 and the
  1923 recognition; the end of the siege of Lviv stays on 19 III 1919 (the
  corridor reopened; the text explains 22 V).

### Writers' notes (for the review list)

- `1918/12/bolszewicy-zajmuja-minsk`: Red Army entry 10 XII vs 11 XII
  (pl.wiki).
- `postacie/aleksandr-kolczak`: "po dziewięciu dniach przesłuchań" — the
  interrogations ran ~2 weeks (perhaps nine sessions).
- Sources' errors not repeated: dzieje.pl dates Neuilly 27 X (27 XI) and
  Belina's order "16 marca" (16 IV); Przystanek Historia dates the
  Białystok agreement 5 I (5 II); en.wiki's "2,500 rebels killed" (IPN:
  all dead).
- pl.wiki traps: `Traktat_ryski` is a disambiguation page (use
  `Traktat_ryski_(1921)`); `Seán_Treacy`, `Ligowo`, `Krasnaja_Gorka`,
  `Wiatka` (the river), `Centrum_Polityczne`, `Erskine_Childers` (the son)
  are other subjects; `Wacław_Iwaszkiewicz`, `Stryj`, `Sakarya`, `Narwa`,
  `Teodozja`, `Bitwa_pod_Kiesią` are disambiguations.

---

## 45. Reading progress, stage 1 (2026-10-31)

- Owner approved the proposal with its recommendations: off until the
  reader turns it on; an article counts as read at the end of its text;
  the switch in the footer and offered once under an article.
- Kept only in the browser: `localStorage` key `tgw:reading`,
  `{ v: 1, on, read: { <Polish id>: <day number> } }`
  (`src/utils/readingProgress.ts`). No server, cookies or analytics. Every
  read and write is in try/catch; with storage blocked the feature hides
  itself. `on: false` records a "no", so the offer is not shown again;
  turning it off deletes the list. The version lets the format change later.
- One script for every page (`ReadingProgress.astro`, in `BaseLayout`),
  run on `astro:page-load`; open tabs follow each other through the
  `storage` event. The HTML is the same for every reader: the status line
  and counters are `hidden` until the script shows them, so readers who
  never turn it on see nothing and search engines see the same page.
- Article pages, PL and EN (`ReadStatus.astro`, under the text): the
  offer, then "Oznacz jako przeczytane", or "✓ Przeczytane · <date> ·
  cofnij". Reaching `[data-read-end]` counts after a minimum time on the
  page (words ÷ 20 s, between 8 and 60 s), so opening a short article and
  leaving doesn't count. A manual mark or undo stops the automatic mark for
  that visit (the first test found undo being re-marked at once).
- Lists: every timeline list goes through `TimelineMonth.astro` (year,
  month, era, tag, category, front, author and overview pages); its links
  carry `data-read-id` (the Polish id, on English lists too). Read entries
  get a ✓ in full colour and the whole entry dimmed (title, summary and
  label at ink-soft/55, owner's request) on screen only (global.css
  `.is-read`), and "(przeczytane)" / "(read)" for screen readers.
- Counters (`ReadCount.astro`): "Przeczytane: X z Y", the percentage on
  the right ("<1%" rather than "0%" once anything is read), a thin bar under
  each year heading and the era headings, counted from the links in its
  `[data-read-scope]` section, so no extra data is downloaded.
- Settings page `/postep-czytania`, `/en/reading-progress` (noindex,
  `ReadingSettings.astro`): how it works, the status, the total, "Wyłącz i
  usuń postęp" and "Usuń zapisany postęp"; footer link "Postęp czytania" /
  "Reading progress" (footer links now wrap on phones).
- Tested in headless Chromium: offer → on → automatic mark → undo stays →
  manual mark → year-page ✓ and counter → the English list and article
  share the record → settings → off deletes it; a fresh visitor gets no
  storage and no visible change. No script errors; light and dark checked.
- Next stages: series progress with "Czytaj dalej", guide progress; then
  export/import between devices.

---

## 46. Timeline dots cut in half (2026-10-31)

- The dots on the timeline line showed only their right half. Cause:
  `content-visibility: auto` on `.tl-month` (§1, performance) also turns on
  paint containment, which clips everything drawn outside the month's box,
  and the line sits on the box's left edge. Fix in global.css: `.tl-month`
  gets `-ml-3 pl-3`, room for the dots (the milestone dot with its halo
  reaches 10.5px left of the line) with no change to the layout. Checked at
  1280 and 390px.
- Port note: thesecondwar.pl has the same `.tl-month` rule if it took §1.

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
- [x] Polish thread, part 1: 29 Polish person pages with portraits, PL/EN;
  54 pages now link them (§25)
- [x] People index as a portrait wall with filters (§26)
- [x] Society, batch 1: 17 articles (flu, air aces, spies, Paris Gun) and 3
  person pages, PL/EN (§27)
- [x] Society, batch 2: 17 articles (women, home fronts, culture), Curie's
  page, and guides 11–12 (trenches, women), PL/EN (§28)
- [x] Polish thread, part 2: 14 articles (POW, Prussian partition, Cieszyn,
  Lithuania, Jews in the Polish lands, Legia Kobiet), PL/EN (§31)
- [x] Campaign overviews, second set (Nivelle, Hundred Days, Isonzo, the
  Pacific 1914) and three Italian battles; Polish-thread articles linked
  from the guides and the series (§33)
- [x] Short articles expanded: 10 milestones and 20 key events, with
  sources, PL/EN (§34)
- [x] Glossary, second batch: 50 terms (134 in all), PL/EN (§35)
- [x] Before the war: "Przed wojną" era page, 20 articles 1879–1913, PL/EN (§36)
- [x] Wikipedia links to our own pages: the last 14 files (§37)
- [x] Known errors: Rada Polska seat, Gete and Liège details, guide summary (§38)
- [x] Five 1914 battle pages expanded: Mons, Charleroi, Ardennes, Lorraine, Mulhouse (§39)
- [x] Country pages "Kraje w wojnie": 16 states, PL/EN (§40)
- [x] "Głosy z frontu": pilot (12 voices, VIII 1914) and batches 1–8: 354 voices, VIII 1914 – XII 1918 (§41)
- [x] English edition: Lviv instead of Lemberg/Lwów (§42)
- [x] Legions 1915–1916 (Rarańcza, Volhynia, Kostiuchnówka) and the Lost Battalion (§43)
- [x] "Po wojnie": the war after the war 1919–1923, 53 articles and 2 battle pages, PL/EN (§44)
- [x] Reading progress, stage 1: opt-in, in the browser only; ✓ in timeline lists, year counters, article status line, settings page (§45)
- [ ] Reading progress, stage 2: series progress with "Czytaj dalej", guide progress
- [ ] Reading progress, stage 3: export/import between devices

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
