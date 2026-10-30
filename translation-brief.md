# Brief: translating thegreatwar.pl articles into English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl — a Polish chronicle of the First World War (Astro). We are adding an English edition. You translate Polish timeline articles into English files.

## Input / output
- Polish source: `src/content/timeline/<YYYY>/<MM>/<polish-slug>.md`.
- English file: `src/content/en/timeline/<english-slug>.md` (flat folder, no year/month subfolders).
- `<english-slug>`: lowercase ASCII kebab-case of the English title (strip diacritics, drop apostrophes, no "the-" at the start unless needed for sense). Must be unique — check `ls src/content/en/timeline` before writing.

## English front-matter (exactly these fields, this order)
```
---
title: Austria-Hungary declares war on Serbia
summary: On 28 July 1914 Austria-Hungary declared war on Serbia by telegram, a month after Sarajevo. It was the first declaration of war of the Great War.
source: austro-wegry-wypowiadaja-wojne-serbii
---
```
- `title`: sentence case (capitalise only proper nouns), natural English headline, present tense like the Polish.
- `summary`: ≤ 160 characters (hard limit, count it), same facts as the Polish summary.
- `source`: the Polish slug (filename without .md).
- Do NOT copy any other field (date, category, tags, authors, dayOrder, battle, milestone…) — they come from the Polish file automatically. Do not add `sourceHash` (stamped later by script).
- YAML: if a value contains `: ` or starts with a YAML indicator character (`*&#!|>%@\`{`), wrap it in double quotes.

## Body
- Faithful, natural British English (British spelling: "mobilisation", "defence", "honour"). Same facts, same paragraphs, same `##` section structure. No additions, no omissions, no commentary.
- Dates: "28 July 1914"; times "5 p.m."; numbers with comma thousands separator ("3,000").
- **Links: keep every link target EXACTLY as in Polish** — internal links (`/slug`, `/bitwy/slug`, `/postacie/slug`) and `https://pl.wikipedia.org/wiki/...` URLs unchanged, byte for byte, same count, same order where possible. Only translate the link text. A build step rewrites them to English pages / en.wikipedia automatically. Every link in the Polish file must appear in the English file, and no new links may be added.
- Names: use the established English forms as on en.wikipedia for WWI (Franz Ferdinand, Franz Joseph, Wilhelm II, Nicholas II, Sir Edward Grey, Berchtold, Conrad von Hötzendorf, Sazonov, Poincaré, Belgrade, Niš, Sarajevo, the High Seas Fleet, the Grand Fleet, the Admiralty, the War Office, the Triple Entente, Dual Monarchy…). Polish place names of the period: use the English/en.wiki form for that period (**Lviv** for the city, never Lemberg or Lwów, owner's rule of 2026-10-30, except established battle names — "the Battle of Lemberg" for 1914 — historical proper names such as the Lwów Eaglets and the Lwów Polytechnic, and words inside quotations; Kaniów, Rarańcza with diacritics, Kraków, Przemyśl, Warsaw). Keep Polish names of Polish people with diacritics (Józef Piłsudski).
- Polish-specific phrasing: "Wielka Wojna" → "the Great War"; "I wojna światowa" → "the First World War"; "zabory/zaborcy" → "the partitions/partitioning powers".
- Italic ship names stay italic (`*Goeben*`); "SMS", "HMS" prefixes as in source.
- Do not leave any Polish words in the body (a checker flags się, oraz, że, który, jest, był, przez, został…). Polish proper names and quoted Polish titles are fine.
- If the Polish text contains an evident factual error, translate faithfully but report it (file + what is wrong) in your final message. Do not edit Polish files.

## Checks before you finish
Run from repo root: `node scripts/i18n-status.mjs 2>&1 | grep -v "no sourceHash"` — it must print no problems for your files (links differ, summary > 160, unquoted YAML, Polish words left). Ignore "no sourceHash" lines and problems in files that are not yours.

## Report
List: Polish slug → English slug for each file, any suspected source errors, any doubtful name choices. Keep it short.

## Battle pages
- Source: `src/content/battles/<YYYY>/<slug>.md` → `src/content/en/battles/<english-slug>.md` (slug from the English title, e.g. `battle-of-the-frontiers`, `siege-of-liege`).
- Front-matter, exactly these fields in this order:
```
---
title: Battle of Galicia
summary: ≤160 chars
location: translated location line
sides:
  - name: Russian Empire
    commanders: [Nikolai Ivanov, Mikhail Alekseyev, …]
  - name: Austria-Hungary
    commanders: [Franz Conrad von Hötzendorf, …]
result: translated result line
source: bitwa-galicyjska
---
```
- `sides`: same number of sides, same order; `commanders` same count and same order as Polish (the page matches them by position), names in en.wiki form. Side names: Russian Empire / Russia, Germany / German Empire, Austria-Hungary, France, United Kingdom, Belgium, Serbia, Ottoman Empire, etc. — follow what en.wiki's infobox for that battle uses.
- Do not copy front, phase, startDate, endDate, authors, tags, milestone.

## Person pages
- Source: `src/content/postacie/<slug>.md` → `src/content/en/people/<english-slug>.md` (slug from the English name, e.g. `franz-joseph-i`, `jozef-pilsudski`).
- Front-matter, exactly these fields in this order (omit birthPlace/deathPlace if the Polish has none):
```
---
name: Franz Joseph I
summary: ≤160 chars
role: translated role line
country: Austria-Hungary
birthPlace: Vienna (Austrian Empire)
deathPlace: Vienna
source: franciszek-jozef-i
---
```
- Do not copy side, born, died, *YearOnly, aliases, wikiTitles, authors, tags.
