# Brief: "Siły zbrojne" pages, Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **force page**
(`/sily-zbrojne/<slug>`, `/en/armed-forces/<slug>`) tells one army, fleet or
air service across the war: when and why it was formed, what it was made
of, who commanded it, where it fought, how it changed, what became of it.
It replaces the pl.wikipedia link our articles give for the force today
(expansion-plan.md C). It is not an order of battle: no lists of units,
ships or aircraft types beyond the few that tell its story. You write the
page of your force in Polish, its evidence file and its English translation.
Scratch files go in the scratch folder the coordinator gives you, **outside
the repo**. Don't edit any other repo file, don't run the build, don't
commit, never touch `../thesecondwar.pl`.

**The rules of `scripts/briefs/places.md` apply** (read it whole): our own
writing, never copied (the same copy check against pl.wikipedia); read
first; must not contradict our pages (report conflicts, don't edit); the
evidence format; the English part and stamping. What differs is below.

## What the page shows by itself (don't repeat it as lists)

Header: kind, state (a link to its country page), period (`formed` –
`disbanded`), author, date. Beside the text: "Dowódcy i ludzie", the person
pages listed in `people` with their role line. Under the text: the battle
pages and every timeline article that link the force, by year (after the
pilot, the links our articles give to the force's pl.wikipedia page are
pointed here). Your text is the narrative that connects them: link the key
ones in the text, don't list them.

## The Polish page: `src/content/forces/<slug>.md`

```yaml
---
name: Grand Fleet                  # as our articles name it
title: Grand Fleet w I wojnie światowej
summary: "≤160 characters, the force's war in one sentence"   # always in double quotes (a colon breaks the YAML)
brief:
  - "3–5 points, one sentence each, numbers only as the body gives them"
kind: flota                        # armia | flota | lotnictwo | korpus | formacja
country: wielka-brytania           # a file name in src/content/countries; omit if the force had no state
formed: 1914-08-04                 # verified; the day it came into being under this name; omit if centuries old
disbanded: 1919-04-07              # verified; omit if it outlived the war as the same force
people: [john-jellicoe, david-beatty]   # existing files in src/content/postacie, in order of importance
wikiTitles: ["Grand_Fleet"]
updated: 2026-10-31
authors: [Natalia]
sources:
  - "https://…"                    # 4–10 pages you opened and read, at least 2 not Wikipedia
---
```

Body: **500–900 words**. A first paragraph (no heading) with the answer in
3–4 sentences: what the force was and what it did in the war. Then 3–5 `##`
sections in time order (for example: origins and 1914, the war years in
2–3 phases, the end). Figures (strength, losses) as ranges with attribution
where sources differ. **At least 5 different internal links**; never the
force's own pl.wikipedia article. The glossary has terms for many things
(`src/data/glossary.json`, link `/slownik/<slug>`), the site has place
pages (`/miejsca/<slug>`) and country pages (`/kraje/<slug>`).

## Evidence, check, English

- Evidence: `scripts/evidence/forces/<slug>.json`, the format of
  `scripts/briefs/topics.md`.
- Check: `python3 -I scripts/checks/topics.py . --forces <slug>` must print
  `0 problem(s)`.
- English: `src/content/en/forces/<english-slug>.md`, front matter only
  `title`, `summary`, `brief`, `name` (English), `source: <polish-slug>`;
  links byte for byte as in Polish; then
  `node scripts/i18n-status.mjs --stamp=<english-slug>` and
  `node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"` prints nothing.

## The pilot (2026-10-31)

| slug / English slug | name (PL / EN) | kind | country | wikiTitles | author |
|---|---|---|---|---|---|
| `royal-flying-corps` / `royal-flying-corps` | Royal Flying Corps / Royal Flying Corps | lotnictwo | wielka-brytania | Royal_Flying_Corps | Łukasz Skowroń |
| `grand-fleet` / `grand-fleet` | Grand Fleet / Grand Fleet | flota | wielka-brytania | Grand_Fleet | Natalia |
| `flota-pelnomorska` / `high-seas-fleet` | Flota Pełnomorska / High Seas Fleet | flota | niemcy | Hochseeflotte | Łukasz Skowroń |

Notes:
- Royal Flying Corps: formed 1912 (army wing; the naval wing became the
  RNAS), the squadrons in France in August 1914 and reconnaissance at Mons
  and the Marne, growth under Trenchard, the "Fokker scourge" and "Bloody
  April" 1917 (glossary/articles), the home defence against airships and
  Gothas, the merger with the RNAS into the RAF on 1 April 1918. The RNAS
  and the RAF are not this page (one sentence each).
- Grand Fleet: formed at the outbreak from the Home Fleets, the base at
  Scapa Flow (and Rosyth), Jellicoe, the distant blockade's backbone,
  Jutland (`bitwa-jutlandzka` if it exists; check `src/content/battles`),
  Beatty from November 1916, the American battleships (6th Battle
  Squadron), the surrender of the High Seas Fleet in November 1918, its
  end in April 1919.
- Flota Pełnomorska: Tirpitz's fleet and the naval race (two sentences),
  the "fleet in being", Ingenohl, Pohl, Scheer, the raids on the English
  coast and Dogger Bank, Jutland, the U-boat war taking its men and role,
  the mutinies of 1917 and November 1918 (Kiel), internment at Scapa Flow
  and the scuttling of 21 June 1919. Our articles call it "High Seas
  Fleet" in 42 places and "Flota Pełnomorska" in 26: use "Flota
  Pełnomorska (Hochseeflotte)" at first mention, then "Flota Pełnomorska".
- The glossary has one term for both fleets (`/slownik/grand-fleet`,
  "Grand Fleet i Flota Pełnomorska"): don't contradict it; you may link it
  once.

## Batch 2 (2026-10-31)

The owner approved the pilot's form (layout, people beside the text,
800–900 words). Same approach. Before writing, check that no battle or
campaign page of ours already tells the force's whole war (then report it
instead of writing).

| grp | slug / English slug | name (PL / EN) | kind | country | wikiTitles | author |
|---|---|---|---|---|---|---|
| M | `royal-navy` / `royal-navy` | Royal Navy / Royal Navy | flota | wielka-brytania | Royal_Navy | Natalia |
| M | `royal-naval-air-service` / `royal-naval-air-service` | Royal Naval Air Service / Royal Naval Air Service | lotnictwo | wielka-brytania | Royal_Naval_Air_Service | Łukasz Skowroń |
| N | `royal-air-force` / `royal-air-force` | Royal Air Force / Royal Air Force | lotnictwo | wielka-brytania | Royal_Air_Force | Łukasz Skowroń |
| N | `brytyjski-korpus-ekspedycyjny` / `british-expeditionary-force` | Brytyjski Korpus Ekspedycyjny / British Expeditionary Force | armia | wielka-brytania | Brytyjski_Korpus_Ekspedycyjny | Natalia |
| O | `9-armia-niemiecka` / `german-ninth-army` | 9 Armia / Ninth Army | armia | niemcy | 9_Armia_(Cesarstwo_Niemieckie) | Natalia |
| O | `11-armia-niemiecka` / `german-eleventh-army` | 11 Armia / Eleventh Army | armia | niemcy | 11_Armia_(Cesarstwo_Niemieckie) | Łukasz Skowroń |
| P | `4-armia-niemiecka` / `german-fourth-army` | 4 Armia / Fourth Army | armia | niemcy | 4_Armia_(Cesarstwo_Niemieckie) | Łukasz Skowroń |
| P | `armia-poludniowa` / `south-army` | Armia Południowa / South Army | armia | niemcy | Armia_Południowa_(Państwa_Centralne) | Natalia |
| Q | `3-armia-rosyjska` / `russian-third-army` | 3 Armia / Third Army | armia | rosja | 3_Armia_(Imperium_Rosyjskie) | Natalia |
| Q | `8-armia-rosyjska` / `russian-eighth-army` | 8 Armia / Eighth Army | armia | rosja | 8_Armia_(Imperium_Rosyjskie) | Łukasz Skowroń |
| R | `legion-czechoslowacki` / `czechoslovak-legion` | Legion Czechosłowacki / Czechoslovak Legion | formacja | (none) | Korpus_Czechosłowacki | Łukasz Skowroń |
| R | `gurkhowie` / `gurkhas` | Gurkhowie / Gurkhas | formacja | wielka-brytania | Gurkhowie | Natalia |

Names: `name` is as our articles name the force; for the numbered armies
the title says whose ("9 Armia niemiecka w I wojnie światowej", "The German
Ninth Army in the First World War") and the first mention in the text too.

Notes:
- Royal Navy: the navy as a whole (the Admiralty, Churchill and Fisher,
  the fleets and stations, the blockade, convoys, the Dardanelles, the
  U-boat war, its size 1914 vs 1918 as ranges); the Grand Fleet has its
  own page (`/sily-zbrojne/grand-fleet`): link it, don't retell it. No
  `formed`.
- RNAS: the naval wing from 1914 (formed 1 VII 1914), the Antwerp and
  Dunkirk squadrons, the raids on Zeppelin sheds (Cuxhaven, Friedrichshafen),
  home defence until 1916, seaplanes and carriers, the Dardanelles, the
  merger into the RAF on 1 IV 1918.
- RAF: formed 1 IV 1918 from the RFC and the RNAS (link both: the RFC page
  exists, the RNAS page is written in parallel: link
  `/sily-zbrojne/royal-naval-air-service` only if the file exists when you
  run the check), the Air Ministry and Smuts, the Independent Force and
  strategic bombing, the 1918 battles, its size in November 1918; no
  `disbanded`.
- BEF: the expeditionary army in France and Belgium 1914–1918: the 1914
  divisions, Mons, the retreat, Ypres, the New Armies, the Somme,
  Passchendaele, 1918; French and Haig; the glossary has an entry (`bef`,
  link it once); the end in 1919 if a source gives it.
- 9 Armia: its successive wars (East Prussia and Poland 1914 under
  Hindenburg and then Mackensen, Łódź, the Bzura and Rawka, 1915, Romania
  1916 under Falkenhayn, 1918 in the west); link the battle pages.
- 11 Armia: formed in 1915 for Gorlice (Mackensen), the Serbian campaign
  1915, Macedonia (Salonika front) until 1918.
- 4 Armia: Duke Albrecht of Württemberg in the Ardennes 1914, Flanders and
  the Yser, Ypres (gas 1915), Passchendaele, the Lys 1918; Sixt von Armin.
- Armia Południowa (Südarmee): the German–Austro-Hungarian army in the
  Carpathians and eastern Galicia from 1915, Linsingen, Bothmer, the
  Brusilov offensive, 1917.
- 3 Armia: Ruzski in Galicia 1914 (Lwów), Radko Dimitriew, Gorlice 1915,
  later years in a few sentences.
- 8 Armia: Brusilov in Galicia 1914 and the Carpathians, Kaledin and the
  1916 offensive (Łuck), Kornilov in 1917, the end.
- Legion Czechosłowacki: from the Družina (1914) to the corps in Russia,
  Zborów 1917, the march across Siberia and the revolt of May 1918, Kazan,
  the French and Italian legions in a sentence, evacuation by 1920.
  `formed`: the day the Czechoslovak Corps was formed in Russia, if
  verified. The glossary has an entry (`legion-czechoslowacki`): don't
  contradict it; link it once at most.
- Gurkhowie: the Gurkha regiments of the Indian Army: Nepal and
  recruitment, numbers (ranges), France 1914–1915 (Neuve Chapelle, Loos),
  Gallipoli (Sari Bair), Mesopotamia, Palestine; no `formed`.

## Report (short)

Per page: paths, words, sources, internal links, people listed, the
`formed`/`disbanded` dates with their source, conflicts with our pages
(file + what), anything left out and why.
