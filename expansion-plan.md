# Expansion plan: content first, then SEO (analysis of 2026-10-29)

How thegreatwar.pl can grow, based on a measurement of the content and the
built site on 2026-10-29. Content comes first: it is what readers come
for, and most SEO gains here follow from it. The four remaining ports from
thesecondwar.pl (sources, places, family history, borders map) are in
`planned-improvements.md` and are not repeated here.

No analytics or Search Console data was available for this analysis, so
the priorities rest on coverage gaps and on what students and Polish
readers search for. Connect Search Console (§B3) and let its query data
reorder this list.

## The site today, in numbers

- **Timeline articles:** 2,624. They run from 28 VI 1914 to 31 XII 1918.
  Only one is dated before July 1914.
  - Every month has 21–158 articles.
  - Median length 516 words; 247 articles are under 300 words.
- **Battle pages:** 310 (161 milestones).
  - By front: Western 138, Eastern 53, Middle East 52, Balkan 31,
    Italian 16, sea 12, Africa 7, Asia 1.
- **Articles by category:**
  - Działania zbrojne 1,381
  - Dyplomacja 452
  - Polityka 401
  - Wojsko 363
  - **Społeczeństwo 27**
- **Person pages:** 242. **Only 9 are Polish:** Piłsudski, Dmowski, Haller,
  Paderewski, Daszyński, Witos, Korfanty, Kakowski, Lubomirski.
- **Other site features:** an English edition of all content, a glossary
  of 84 terms, 8 series, key dates, "Rok w skrócie" and "Wojna w liczbach".
- **Sources:** only person pages have them; none of the 2,934 articles and
  battle pages do (`planned-improvements.md` §1).
- **Sister site:** thesecondwar.pl starts in X 1918 and has only 36
  articles for 1919–1921. These include the peace treaties of 1919–1920
  and the start of the Polish–Bolshevik war.

---

## A. Content

Ranked by value for readers, then by effort.

### A1. Topic guides: long-form overviews for the questions people actually ask (highest value)

The chronicle answers "what happened on 21 February 1916" well. It has no
page that answers "jakie były przyczyny I wojny światowej", "skutki I
wojny światowej", "nowe rodzaje broni", "sprawa polska w czasie I wojny"
or "życie w okopach". These are the most common student and general
searches, and the school curriculum asks exactly these questions. There
is **no article on the causes and none on the results** today.

- A new page type, `/tematy/<slug>` and `/en/topics/<slug>`: 1,500–2,500
  words, sections, a "W skrócie" box, a mini timeline, links to 15–40 of
  our articles, and sources. These pages are the hubs our dated articles
  are missing.
- First set, about 12 guides:
  1. Przyczyny I wojny światowej
  2. Skutki I wojny światowej
  3. Sprawa polska 1914–1918
  4. Nowe rodzaje broni (gaz, czołgi, lotnictwo, okręty podwodne,
     artyleria)
  5. Życie w okopach
  6. Front wschodni na ziemiach polskich
  7. Wojna podwodna
  8. Rewolucje w Rosji
  9. Ludobójstwo Ormian
  10. Kobiety w czasie wojny
  11. Państwa centralne i Ententa
  12. Dlaczego Niemcy przegrały
- Method as for the series: everything taken from our articles is
  quote-checked by script, and anything beyond them is sourced (≥ 2
  sources, opened and read).
- Effort: about 150–250k tokens per guide with research and translation.
- **Done 2026-10-29:** the page type and eight guides: causes, results,
  sprawa polska, new weapons, the war on Polish soil, the Russian
  revolutions, the submarine war, why Germany lost (improvements.md §24).
  Then guides 9–10: Państwa centralne i Ententa, Ludobójstwo Ormian; and
  glossary term pages link their guide. Next: Życie w okopach and Kobiety w
  czasie wojny, after the A4 society batch gives them articles to link.

### A2. Before the war: "Droga do wojny 1871–1914"

The chronicle starts at Sarajevo. The background every reader is taught
is missing:

- the alliances (Dual Alliance 1879, Triple Alliance 1882, Franco-Russian
  1894, Entente cordiale 1904, Anglo-Russian 1907)
- the Moroccan crises of 1905 and 1911
- the Bosnian crisis of 1908
- the Balkan Wars of 1912–1913
- the naval race and the Schlieffen Plan

Above all, the **Polish pre-war preparations** are missing. They are the
roots of the Legions and the 1918 state:

- Związek Walki Czynnej (1908)
- Związek Strzelecki and Polskie Drużyny Strzeleckie (1910–1911)
- the Drużyny Bartoszowe and Sokół
- the Komisja Tymczasowa Skonfederowanych Stronnictw Niepodległościowych
  (1912)

The plan:

- 40–60 timeline articles for 1871–1914 (sparser further back), a few
  battle pages for the Balkan Wars, and a new era "Droga do wojny" on
  `/timeline`.
- Year pages, "Rok w skrócie" and key dates extend naturally, since they
  are built from the data.
- Effort: about 3–4M tokens, as one batch with the usual writer and
  fact-check pipeline (workflow.md).
- **Done 2026-10-30 (slim version, owner's choice):** 20 articles
  1879–1913 on one era page, "Przed wojną" (`/timeline/przed-wojna`), with
  its own "W skrócie"; no Balkan battle pages, no Schlieffen article (the
  glossary and the causes guide cover it). Improvements.md §36.
- **Boundary with thesecondwar.pl (owner, 2026-10-30):** the sister site
  covers the roots of the Second World War in Asia from 1895 (Queen Min,
  Portsmouth 1905, Korea 1910). Before 1914 this site covers only the
  European and Polish origins of the Great War; Asia stays there, so the
  two sites don't duplicate topics. Don't edit the sister project from
  here without the owner's say-so.

### A3. The Polish thread: gaps on a Polish site

- **Polish people.** Nine person pages is far too few. Candidates, with
  how many of our articles already mention them:
  - Kucharzewski (11)
  - Kuk (9)
  - Roja (8)
  - Dowbor-Muśnicki (8)
  - Szeptycki (7)
  - Ostrowski (regent, 7)
  - Seyda (6)
  - Moraczewski (6)
  - Sosnkowski (5)
  - also Rydz-Śmigły, Rozwadowski, Sikorski, Żeligowski, Zieliński,
    Studnicki, Bobrzyński, Głąbiński, Grabski

  These will rise when A2 adds the pre-war people (Piłsudska, Kukiel,
  Sikorski as an organiser of the Riflemen). Aim for 40+ Polish person
  pages.
- **The Prussian partition.** Śląsk, Pomorze/Gdańsk and Wielkopolska are
  the subject of only 9 article titles in all, before XII 1918. Missing
  topics include:
  - Poles in the German army
  - the Polish deputies in the Reichstag and Korfanty's speech of
    25 X 1918
  - the Naczelna Rada Ludowa
  - wartime Poznań
- **Polish organisations.** Polska Organizacja Wojskowa (POW) is mentioned
  in 10 articles but has none of its own: founding in 1914, its actions,
  the disarming of the Germans in XI 1918. Also missing are the Ochotnicza
  Legia Kobiet (XI 1918), the Rada Narodowa in Kraków, and the
  Centralny Komitet Obywatelski.
- **Others in the Polish lands.** Jews have 7 titles, Lithuanians 7. Their
  wartime fate in the Polish lands is missing: deportations of 1915, the
  occupation, the Lwów pogrom of XI 1918.
- Effort: about 1.5–2M tokens as one "sprawa polska" batch.
- **Done 2026-10-29 (part 1):** 29 Polish person pages with portraits, PL
  and EN; Polish person pages 9 → 36 (improvements.md §25).
- **Done 2026-10-29 (part 2):** 14 articles (improvements.md §31), covering:
  the timeline articles — POW, the Prussian partition (Korfanty's Reichstag
  speech, the NRL), Cieszyn, Jews and Lithuanians in the Polish lands, the
  Ochotnicza Legia Kobiet, the women's vote of 28 XI 1918.

### A4. Society, home front and culture

"Społeczeństwo" is 27 of 2,624 articles. Famous episodes are missing as
articles. Each line below gives the number of articles that mention the
topic (and, where the topic is a person, whether they have a page):

- **The Spanish flu:** 0 titles, 21 mentions. It is a top search on its
  own; it needs the waves of 1918 and its effect on the armies.
- **Richthofen's death** (21 IV 1918): 8 mentions, no article, no person
  page.
- **Mata Hari's execution** (15 X 1917): 1 mention.
- **The Paris Gun** (from 23 III 1918): 0 mentions.
- **Edith Cavell:** an article, no person page.
- **The taxis of the Marne:** 5 mentions, no article.
- **"In Flanders Fields"** (V 1915) and the war poets: McCrae has 4
  mentions; Owen 3.
- **Women:** munitions workers, nurses, suffrage after the war. 7 titles
  in all.
- **Propaganda, rationing and hunger on the home fronts, strikes**
  (Vienna I 1918, Berlin I 1918), **science and medicine.**

Plan a batch of 50–80 "Społeczeństwo" articles across all fronts and
years. These are also the stories most shared on social media.

**Done 2026-10-29 (batch 1):** 17 articles (the flu, the air aces, spies
and propaganda, Saint-Gervais) and person pages for Richthofen, Mata Hari
and Cavell (improvements.md §27). Next (batch 2): women (the Right to
Serve march, the Women's Battalion of Death, suffrage in Britain and
Germany, Elsie Inglis, Skłodowska-Curie's X-ray cars), the home fronts
(German bread cards, the turnip winter, the Vienna and Berlin strikes,
DORA and British rationing, summer time, hunger in Warsaw and Łódź) and
culture ("In Flanders Fields", Wilfred Owen), then the guides "Życie w
okopach" and "Kobiety w czasie wojny".

**Done 2026-10-29 (batch 2):** all of the above — 17 articles, Curie's
page, and both guides (improvements.md §28). "Społeczeństwo": 27 → 49.

### A5. Campaign overviews and thin fronts

- The overview battle pages that articles keep linking to Wikipedia for
  are missing:
  - the Gallipoli campaign: 30 links; only the landing and evacuation have
    pages
  - the Mesopotamian campaign: 35 links
  - the Sinai and Palestine campaign
  - the Arab Revolt: 17 links
  - the East African campaign
  - the Nivelle Offensive: 20 links
  - the Hundred Days: 11 links
  - the Battles of the Isonzo as a whole
- Thin fronts:
  - Italy: 53 articles, 16 battles
  - Africa: 7 battles
  - Asia and the Pacific: 48 articles, 1 battle (Tsingtao, Coronel,
    the Emden, Japan's role)
- Effort: about 1M tokens for 10–12 overview pages plus translation.
- **Done 2026-10-29:** Gallipoli, Mesopotamia, Sinai–Palestine, the Arab
  Revolt, East Africa, plus campaign navigation on every battle page
  (improvements.md §23). Then (§33): the Nivelle Offensive, the Hundred
  Days, the Battles of the Isonzo, the Pacific 1914 overview, and three
  Italian battles (Ortigara, Col di Lana, Third Monte Grappa).

### A6. After 1918: decide with thesecondwar.pl (owner's call)

The war did not end everywhere on 11 XI 1918. These conflicts are thin on
both sites:

- the Polish–Ukrainian and Polish–Soviet wars
- the Silesian uprisings and the plebiscites
- the Russian Civil War
- the Greco-Turkish War and Lausanne (1923)
- the Irish War of Independence
- Fiume

thesecondwar.pl has 36 articles for 1919–1921. Two options:

- **(a)** extend thegreatwar.pl to 1919–1923 as an era "Wojna po wojnie",
  densely, with thesecondwar.pl linking to it for those years; or
- **(b)** fill 1919–1921 on thesecondwar.pl and only cross-link from here.

(a) fits this site's readers and its peace-treaty and independence
thread. (b) avoids two sites covering the same years. **Decide before
writing anything for 1919+.** Either way, the 1918 articles both sites
have (Compiègne, the German revolution, the Greater Poland Uprising)
should link to each other (§B8).

### A7. Smaller, steady additions

- Glossary: 84 terms. Add the A1–A4 terms (Związek Strzelecki, POW,
  ochotnicza legia, hiszpanka, Paryska armata, U-Boot types…).
  **Done 2026-10-30:** 50 terms, 134 in all (improvements.md §35).
- New series once A2–A5 exist:
  - Droga do wojny
  - Wojna na morzu
  - Gallipoli
  - Bliski Wschód i powstanie arabskie
  - Kobiety na wojnie
  - Gaz i nowa broń
- Short articles: 247 are under 300 words. Expand the milestone ones first
  when sourcing them (`planned-improvements.md` §1).
  **Done 2026-10-29:** the 10 short milestones and 20 key short articles,
  with sources (improvements.md §34). Next: the ~400-word 1914 battle
  pages (Mons, Charleroi, the Ardennes, Lorraine, Miluza).

---

## B. SEO

The basics are in good shape. Measured on the build:

- 7,376 pages, 7,252 in the sitemap, 122 `noindex`
- 0 broken internal links
- every page has a description and exactly one `<h1>`
- hreflang pairs and JSON-LD on all pages
- `max-image-preview:large` in the robots meta tag

The 320 "duplicate titles" are Polish and English person pages sharing a
name-and-years title, which is fine. The images with empty alt text are
decorative portraits next to the person's name, which is correct.

The gains left are mostly content-shaped:

### B1. Topic guides (A1)

The single largest SEO opportunity. Our dated articles rank for specific
events, while the high-volume queries ("przyczyny I wojny światowej",
"skutki…", "broń…", "Polska w I wojnie światowej") have no page here.

### B2. Link to ourselves, not to Wikipedia

**163 links in 141 articles point to pl.wikipedia for 39 topics we have
our own page for.** The most linked:

- Bitwa nad Sommą: 21
- Ofensywa Brusiłowa: 12
- Bitwa pod Verdun: 10
- Messines: 8
- Lys 1918, Loos: 6 each
- Yser, Vimy, Jutland, Coronel, Tannenberg, Gorlice, Drina, Limanowa: 5
  each

**Update 2026-10-29:** `scripts/wiki-to-internal.py` does this under the
workflow's link rules. Only 13 of these files may change: 120 links are in
articles dated before the battle, which must not link forward. It hasn't
been run for them yet (improvements.md §23). The campaign pages (A5) moved
63 more articles to internal links. Person links (`wikiTitles`) are not
covered by the script yet. Each new page from A3 and A5 makes more links
internal.

### B3. Search Console and Bing Webmaster Tools

Connect both, submit the sitemap, and after 4–6 weeks read:

- the queries with impressions but low position, the next articles to
  improve;
- the pages not indexed;
- the click-through rate of long titles.

That data should reorder section A.

### B4. Dates

Pages have no `datePublished` / `dateModified`, and the sitemap has no
`lastmod`. Add a `published` field (and `updated` when an article is
revised), then use it in Article JSON-LD and the sitemap. Alternatively,
set `VERCEL_DEEP_CLONE=true` and use git dates. This also makes an RSS
feed of new articles possible later.

### B5. E-E-A-T: authors and method

The author pages are a name and a list. Add:

- a short bio and what the work is based on;
- a `Person` node with `sameAs` links to public profiles;
- on `/about`, how articles are written and checked: the fact-check
  pipeline, quote-checked summaries, and sources once §1 of
  `planned-improvements.md` is done.

The "report an error" link already supports this.

### B6. Long titles

153 `<title>`s are over 70 characters, mostly long article titles plus
" · TheGreatWar.pl". Drop the site name from article titles over about 60
characters, or allow a shorter `seoTitle`. Check the click-through rate in
Search Console first (B3).

### B7. Images and social cards

Of the 423 milestone articles and battle pages, 230 still have no image
of their own: other archives, NAC, IWM, the Bundesarchiv, Library of
Congress, Gallica. A branded 1200×630 card (title and date) for pages
without a photo would lift sharing. That matters for A4 stories and
"on this day" posts.

### B8. The two sites together

Topics both sites cover, such as Compiègne, the German revolution and the
Greater Poland Uprising, compete with each other in search. Settle the
owner of each topic (A6). Then give the other site's article a clear
"see the full story on …" link, or keep one short and link to the other.
Add a "1918 → thesecondwar.pl" bridge on the 1918 year page and the
"Droga do niepodległości" series.

---

## Suggested order

1. **Sources for milestones** (planned-improvements §1): trust, and it
   finds errors.
2. **Topic guides A1**, the first 4: causes, results, sprawa polska, new
   weapons.
3. **B2 internal links** and **B3 Search Console**: small effort, starts
   the data.
4. **A3 Polish thread** (people, the Prussian partition, POW), then
   **Miejsca** (planned-improvements §2), which A3 fills.
5. **A2 pre-war era**, then **A4 society**, then **A5 campaigns**.
6. **A6** once the owner decides; family history and borders
   (planned-improvements §3–4) when the Polish thread is fuller.
7. Throughout: B4–B8 as small tasks between content batches.
