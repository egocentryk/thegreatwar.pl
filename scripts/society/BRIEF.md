# Brief: society batch 1 (timeline articles + person pages, Polish + English)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. The chronicle covers
the fighting and diplomacy well but has almost nothing on the Spanish flu,
the air aces, spies and propaganda, and the shelling of Paris. This batch
adds them. You write the rows of your group (table below): each article in
Polish, then its English translation; person pages likewise. Scratch files
go in `scripts/society/tmp-<group>/` (delete when done). Don't edit other
repo files, don't run the build, don't commit.

## Read first

- `workflow.md` §4 (hard rules: front matter in the given order, summary
  ≤ 160 characters, tags, links, battles, milestones), §6 (accuracy: verify
  every date, the chronology-style "first/last" claims, soften or attribute
  disagreements), §8 (pl.wikipedia traps). Follow them exactly.
- `translation-brief.md` (timeline articles and person pages).
- For person pages: `scripts/people/BRIEF.md` (the person-page format;
  ignore its batch table) and the model `src/content/postacie/wojciech-korfanty.md`.
- The existing articles around your topic (grep), so you don't contradict
  them and can link back to them.

## Timeline articles

`src/content/timeline/<YYYY>/<MM>/<slug>.md`, slug = title (fixed in the
table; if research shows the title must change, keep the slug unless it
becomes misleading, and report it).

- `category: Społeczeństwo` unless the table says otherwise. `front:` only
  where the event belongs to a theatre (e.g. air war over the Western Front:
  `Front zachodni`). `milestone: false` (the owner decides milestones).
- **The date is the event's real date**, verified in several sources. The
  dates in the table are starting points; if research gives another day,
  use the right one and report it.
- **dayOrder:** look at the articles already on that date
  (`ls src/content/timeline/<YYYY>/<MM>/` and grep `^date: <date>`). These
  articles are additions to an existing day: give yours a dayOrder one lower
  than the lowest one already there (0 is allowed), or 1 if the day is
  empty. Two of yours on the same day: the more important one higher.
- Length fits the event: 4–6 paragraphs for a small event, longer with `##`
  sections for a big one (the flu's second wave, Richthofen's death).
- **`sources:`** 3–8 pages you opened and read, at least 2 not Wikipedia.
- Links: earlier content only (a timeline article may link articles with
  an earlier date or the same date with a higher dayOrder; battle pages
  that have started by its date); person pages (`/postacie/<slug>`) any
  time; pl.wikipedia only when we have no page (checked: exists, not a
  disambiguation page, right subject). First mention only, no duplicates.
  You may link the person pages written in this batch (slugs below).
- Hindsight: an article tells that day's event; later developments only in
  a short look ahead.
- Polish angle where there is one (the flu in Warsaw and Kraków, Polish
  pilots, Polish reactions), never forced.

English: `src/content/en/timeline/<english-slug>.md` per
`translation-brief.md` (title, summary, source; links byte for byte).

## Person pages (in this batch)

| slug | person | group |
|---|---|---|
| manfred-von-richthofen | Manfred von Richthofen | B |
| mata-hari | Mata Hari (Margaretha Zelle) | C |
| edith-cavell | Edith Cavell | C |

No `photo:` (the coordinator adds portraits). Country/side: Richthofen
Niemcy / Państwa centralne; Mata Hari Holandia (country as the site writes
it; check `grep -h "^country:" src/content/postacie/*.md | sort -u`) /
Państwa centralne (she was convicted of spying for Germany — say in the
page that her guilt is disputed); Cavell Wielka Brytania / Ententa.
`wikiTitles` = the pl.wiki titles our articles link for them.

## The batch (Polish titles and slugs; dates to verify)

| grp | date | title | slug | front | author |
|---|---|---|---|---|---|
| A | 1918-03-04 | Pierwsze przypadki grypy w Camp Funston | pierwsze-przypadki-grypy-w-camp-funston | — | Natalia |
| A | 1918-05 (verify) | Grypa w Hiszpanii (skąd nazwa „hiszpanka”) | grypa-w-hiszpanii | — | Natalia |
| A | 1918-08 (verify, late Aug) | Druga fala hiszpanki | druga-fala-hiszpanki | — | Natalia |
| A | 1918-10 (verify) | Hiszpanka na ziemiach polskich | hiszpanka-na-ziemiach-polskich | — | Natalia |
| A | 1918-10-31 | Śmierć Egona Schielego | smierc-egona-schielego | — | Natalia |
| A | 1918-11-09 | Śmierć Guillaume'a Apollinaire'a | smierc-guillaumea-apollinairea | — | Natalia |
| B | 1915-04-01 | Roland Garros zestrzeliwuje samolot przez śmigło | roland-garros-zestrzeliwuje-samolot | Front zachodni | Łukasz Skowroń |
| B | 1916-06-18 | Śmierć Maxa Immelmanna | smierc-maxa-immelmanna | Front zachodni | Łukasz Skowroń |
| B | 1916-09-17 | Pierwsze zwycięstwo Richthofena | pierwsze-zwyciestwo-richthofena | Front zachodni | Łukasz Skowroń |
| B | 1916-10-28 | Śmierć Oswalda Boelckego | smierc-oswalda-boelckego | Front zachodni | Łukasz Skowroń |
| B | 1917-04 (verify) | Krwawy kwiecień | krwawy-kwiecien | Front zachodni | Łukasz Skowroń |
| B | 1917-07-06 | Richthofen ranny | richthofen-ranny | Front zachodni | Łukasz Skowroń |
| B | 1917-09-11 | Zaginięcie Georges'a Guynemera | zaginiecie-georgesa-guynemera | Front zachodni | Łukasz Skowroń |
| B | 1918-04-21 | Śmierć Manfreda von Richthofena | smierc-manfreda-von-richthofena | Front zachodni | Łukasz Skowroń |
| C | 1915-05-12 | Raport Bryce'a | raport-brycea | — | Natalia |
| C | 1916-08-21 | Premiera filmu „Bitwa nad Sommą” | premiera-filmu-bitwa-nad-somma | — | Natalia |
| C | 1917-02-13 | Aresztowanie Maty Hari | aresztowanie-maty-hari | — | Natalia |
| C | 1917-10-15 | Egzekucja Maty Hari | egzekucja-maty-hari | — | Natalia |
| D | 1918-03-23 | Działo paryskie ostrzeliwuje Paryż | dzialo-paryskie-ostrzeliwuje-paryz | Front zachodni | Łukasz Skowroń |
| D | 1918-03-29 | Pocisk trafia w kościół Saint-Gervais | pocisk-trafia-w-kosciol-saint-gervais | Front zachodni | Łukasz Skowroń |
| D | 1918-08 (verify) | Koniec ostrzału Paryża | koniec-ostrzalu-paryza | Front zachodni | Łukasz Skowroń |

Group B also writes the Richthofen person page; group C the Mata Hari and
Edith Cavell pages.

Before writing, check no article on the same event exists
(`grep -rli "<keyword>" src/content/timeline`). For the air articles, read
`koniec-plagi-fokkerow` and the battle pages around them (Verdun, the
Somme, Arras 1917, Amiens/Michael 1918). For the flu, the guide "Skutki I
wojny światowej" (src/content/topics/) and the glossary entry
"grypa-hiszpanka" (src/data/glossary.json): don't contradict them.

## Report (short)

Per file: path, date (and any change from the table), dayOrder, word
count, sources, conflicts with existing pages (file + what), anything left
out and why.
