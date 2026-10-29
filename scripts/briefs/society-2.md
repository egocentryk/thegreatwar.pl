# Brief: society batch 2 (women, the home fronts, culture)

Same rules as `scripts/briefs/society-1.md`: read its "Read first",
"Timeline articles" and "Person pages" sections and follow them exactly
(dates verified, dayOrder below the existing ones on that day, sources
opened and read with at least 2 not Wikipedia, links only backwards,
English translation, no build, no commit). Only the batch table is
different: this one replaces the table in BRIEF.md.

Scratch folders: a scratch folder **outside the repo** (the scratchpad path the coordinator gives you, or `mktemp -d`; never inside the repo) (delete when done).

**Duplicates.** Before writing a row, search titles and summaries for the
event in all its word forms (e.g. `grep -rliE "Curie|Skłodowsk|rentgen"
src/content/timeline`). If the event already has an article, don't write
it again: report it (path) and, if useful, link the existing one. Known
existing articles you should link back to rather than repeat: the January
strikes (`strajk-styczniowy-w-austro-wegrzech`, `strajk-styczniowy-w-niemczech`,
1918), `ustawa-o-amunicji-wojennej` (2 VII 1915), `rewolucja-lutowa`, and the
flu articles of batch 1.

## Person page in this batch

| slug | person | group |
|---|---|---|
| maria-sklodowska-curie | Maria Skłodowska-Curie | E |

Country Polska… or Francja? Use **Francja** for country (she worked and
served in France) and **Ententa** for side, and say in the page that she
was Polish-born. No `photo:`. Focus on 1914–1918 (the radiology service,
the X-ray cars, training nurses), with her earlier life short.

## The batch (dates to verify)

| grp | date | title | slug | front | category | author |
|---|---|---|---|---|---|---|
| E | 1915-07-17 | Marsz kobiet „o prawo do służby” | marsz-kobiet-o-prawo-do-sluzby | — | Społeczeństwo | Natalia |
| E | 1914-10/11 (verify) | Samochody rentgenowskie Marii Skłodowskiej-Curie | samochody-rentgenowskie-marii-sklodowskiej-curie | Front zachodni | Społeczeństwo | Natalia |
| E | 1917-06 (verify) | Kobiecy batalion śmierci | kobiecy-batalion-smierci | — | Wojsko | Natalia |
| E | 1917-11-26 | Śmierć Elsie Inglis | smierc-elsie-inglis | — | Społeczeństwo | Natalia |
| E | 1918-02-06 | Brytyjki otrzymują prawo głosu | brytyjki-otrzymuja-prawo-glosu | — | Polityka | Natalia |
| E | 1918-11-12 | Kobiety w Niemczech otrzymują prawa wyborcze | kobiety-w-niemczech-otrzymuja-prawa-wyborcze | — | Polityka | Natalia |
| E | 1918-11-28 | Polki otrzymują prawa wyborcze | polki-otrzymuja-prawa-wyborcze | — | Polityka | Natalia |
| F | 1914-08-08 | Ustawa o obronie królestwa | ustawa-o-obronie-krolestwa | — | Polityka | Łukasz Skowroń |
| F | 1915-01/02 (verify) | Kartki na chleb w Niemczech | kartki-na-chleb-w-niemczech | — | Społeczeństwo | Łukasz Skowroń |
| F | 1916-04-30 | Niemcy wprowadzają czas letni | niemcy-wprowadzaja-czas-letni | — | Społeczeństwo | Łukasz Skowroń |
| F | 1916/17 (verify: the defining moment) | Zima brukwiowa | zima-brukwiowa | — | Społeczeństwo | Łukasz Skowroń |
| F | 1918-02 (verify) | Racjonowanie żywności w Wielkiej Brytanii | racjonowanie-zywnosci-w-wielkiej-brytanii | — | Społeczeństwo | Łukasz Skowroń |
| F | verify | Głód w Warszawie i Łodzi | glod-w-warszawie-i-lodzi | — | Społeczeństwo | Łukasz Skowroń |
| G | 1915-05-03 | John McCrae pisze „In Flanders Fields” | in-flanders-fields | Front zachodni | Społeczeństwo | Łukasz Skowroń |
| G | 1916-12-15 | „Ogień” Barbusse'a z Nagrodą Goncourtów | ogien-barbussea-z-nagroda-goncourtow | — | Społeczeństwo | Łukasz Skowroń |
| G | 1917-07-30 | Protest Siegfrieda Sassoona | protest-siegfrieda-sassoona | — | Społeczeństwo | Łukasz Skowroń |
| G | 1918-11-04 | Śmierć Wilfreda Owena | smierc-wilfreda-owena | Front zachodni | Społeczeństwo | Łukasz Skowroń |

Notes per row:
- **Kobiecy batalion śmierci:** Maria Boczkariowa's 1st Women's Battalion
  of Death (formed in Petrograd in June 1917, in action near Smorgoń in
  July). Choose the defining date (its formation or blessing, or its first
  battle) and say why. `battle:` only if the date falls inside one of our
  battle pages (the Kerensky offensive?); otherwise link it.
- **Polki otrzymują prawa wyborcze:** the decree of 28 XI 1918 on the
  elections to the Legislative Sejm. Link the Moraczewski government and
  Piłsudski articles and person pages.
- **Zima brukwiowa:** a winter, not a day: pin it to a dated moment the
  sources name (e.g. the potato shortage figures or the official switch to
  swedes), and tell the whole winter in the text.
- **Głód w Warszawie i Łodzi:** pin it to a dated event (a hunger riot, a
  relief measure, an official ration cut) in 1915–1917; if the sources give
  no datable event, report it instead of inventing one.
- **Ustawa o amunicji wojennej** (2 VII 1915) already covers women in
  munitions partly: the march of 17 VII 1915 should link it.

## Report (short)

As in BRIEF.md: per file path, final date (and why, if changed), dayOrder,
word count, sources, conflicts with existing pages, anything left out.
