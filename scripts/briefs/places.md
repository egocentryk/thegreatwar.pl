# Brief: place pages ("Miejsca"), Polish + English

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. A **place page**
(`/miejsca/<slug>`, `/en/places/<slug>`) tells what one city, river,
island, canal or sea meant **in the war**: why it mattered, what happened
there and when, how the war changed it. It replaces the pl.wikipedia link
our articles give for the place today (expansion-plan.md C). It is not a
geography or history entry: no founding dates, population tables or
centuries of history beyond a sentence of context. You write the pages of
your group in Polish, their evidence files, and their English translations.
Scratch files go in the scratch folder the coordinator gives you, **outside
the repo**. Don't edit any other repo file, don't run the build, don't
commit, never touch `../thesecondwar.pl`.

## Our own writing, never copied

Every page is our own text, written from the sources, not paraphrased
sentence by sentence from one of them. The checker fetches the pl.wikipedia
article of every `wikiTitles` entry and flags every run of 8 or more words
the page shares with it. Read Wikipedia for orientation if you like, then
write from the other sources and our own articles.

## What the page shows by itself (don't repeat it as lists)

Under your text the page lists automatically: the battle pages that link
the place or were fought within `radiusKm` of its point, and every timeline
article that links the place, by year (after this pilot, the links our
articles give to the place's pl.wikipedia page are pointed here). There is
a locator map from `lat`/`lon`. Your text is the narrative that connects
them: link the key ones in the text, don't list them.

## Read first

- `workflow.md` §4 (tone, links), §6 (accuracy), §8 (pl.wikipedia traps).
- `translation-brief.md` for the English part.
- `scripts/briefs/topics.md`: place pages use the same evidence format and
  checker as guides and country pages. Model of form: a country page in
  `src/content/countries/` with its evidence in `scripts/evidence/countries/`.
- Your place on the site: the articles that link it today
  (`grep -rl "pl.wikipedia.org/wiki/<Title>" src/content/timeline src/content/battles`,
  with the title as in `wikiTitles`, URL-encoded or not), the battle pages
  nearby, the person pages, guides and country pages that mention it. **The
  page must not contradict them.** Where a source contradicts one of our
  pages, write what is certain and report the conflict (file + what); don't
  edit it.

## The Polish page: `src/content/places/<slug>.md`

```yaml
---
name: Saloniki                     # as our articles name it
title: Saloniki w I wojnie światowej
summary: ≤160 characters, the place's war in one sentence
brief:
  - "3–5 points, one sentence each, numbers only as the body gives them"
kind: miasto                       # miasto | rzeka | region | wyspa | akwen | kanał
in1914: Grecja                     # the state it belonged to in 1914, as the table says
today: Grecja
front: Front bałkański             # as the table says
lat: 40.64
lon: 22.94
radiusKm: 40
wikiTitles: ["Saloniki"]
updated: 2026-10-31
authors: [Natalia]
sources:
  - "https://…"                    # 4–10 pages you opened and read, most important first, at least 2 not Wikipedia
---
```

Body: **400–900 words**. A first paragraph (no heading) with the answer in
3–4 sentences: what the place was in the war. Then 2–5 `##` sections in
time order (for example: before the war, the war years in 2–3 phases, what
the war left). Plain encyclopaedic Polish, short paragraphs. Figures as
ranges with attribution where sources differ.

Links: our pages at their first mention, **at least 5 different ones** (the
articles, battle pages, people, guides and country pages of the place's
war); a place page is a reference page, so it may link any date. pl.wikipedia
only for things we have no page for (checked: exists, not a disambiguation
page, right subject), never the place's own article. No pointer sentences.

## Evidence: `scripts/evidence/places/<slug>.json`

Exactly the format of `scripts/briefs/topics.md` (every paragraph, 1–5
verbatim quotes, every number in a quote; prefer our own articles; web
quotes only from pages you opened, listed in `sources`).

## Check

    cd /Users/lukaszskowron/Code/astro/thegreatwar.pl && python3 -I scripts/checks/topics.py . --places <slug>

must print `0 problem(s)`. It checks the evidence, the links, the sources
(2+ not Wikipedia), the length, the 5+ internal links and the copy check.

## English: `src/content/en/places/<english-slug>.md`

Front matter only `title`, `summary`, `brief`, `name` (the English name),
`source: <polish-slug>`. Body translated per `translation-brief.md`, links
byte for byte as in Polish. Then:

    node scripts/i18n-status.mjs --stamp=<english-slug>
    node scripts/i18n-status.mjs 2>&1 | grep "<english-slug>"     # must print nothing

## The pilot (2026-10-31)

| grp | slug / English slug | name (PL / EN) | kind | in1914 / today | front | lat, lon | radiusKm | wikiTitles | author |
|---|---|---|---|---|---|---|---|---|---|
| A | `saloniki` / `salonika` | Saloniki / Salonika | miasto | Grecja / Grecja | Front bałkański | 40.64, 22.94 | 40 | Saloniki | Natalia |
| A | `korfu` / `corfu` | Korfu / Corfu | wyspa | Grecja / Grecja | Front bałkański | 39.62, 19.92 | 30 | Korfu | Łukasz Skowroń |
| B | `ypres` / `ypres` | Ypres / Ypres | miasto | Belgia / Belgia | Front zachodni | 50.85, 2.885 | 15 | Ieper | Łukasz Skowroń |
| C | `kanal-sueski` / `suez-canal` | Kanał Sueski / Suez Canal | kanał | Egipt / Egipt | Bliski Wschód | 30.6, 32.33 | 60 | Kanał_Sueski | Natalia |
| C | `bagdad` / `baghdad` | Bagdad / Baghdad | miasto | Imperium Osmańskie / Irak | Bliski Wschód | 33.31, 44.36 | 60 | Bagdad | Łukasz Skowroń |

Notes:
- Saloniki: the Allied landing (1915), the "Armée d'Orient" and the
  entrenched camp, Venizelos's government (1916), the great fire (1917), the
  offensive of 1918; the city of many nations.
- Korfu: the Serbian army's evacuation and recovery (1916), the "island of
  death" (Vido), the Corfu Declaration (1917), the French naval base.
- Ypres: the salient and its five battles (link the battle pages, don't
  retell them), the destroyed Cloth Hall, gas in 1915, the city's ruin and
  memory (Menin Gate only if the date is within or shortly after the war;
  one sentence).
- Kanał Sueski: why it mattered to Britain, the Ottoman attacks (1915,
  1916), its defence and shipping; Egypt's status (British occupation, the
  protectorate of December 1914) in a sentence; the city of Suez is not
  this page.
- Bagdad: the goal of the Mesopotamian campaign, the 1915 advance and
  Ctesiphon, Kut, the capture in March 1917 and Maude's proclamation, the
  railway (Bagdadbahn) in a sentence.

## Batch 2 (2026-10-31)

The owner approved the pilot's form: same length, tone and approach.

| grp | slug / English slug | name (PL / EN) | kind | in1914 / today | front | lat, lon | radiusKm | wikiTitles | author |
|---|---|---|---|---|---|---|---|---|---|
| D | `gorycja` / `gorizia` | Gorycja / Gorizia | miasto | Austro-Węgry / Włochy | Front włoski | 45.94, 13.62 | 20 | Gorycja | Natalia |
| D | `triest` / `trieste` | Triest / Trieste | miasto | Austro-Węgry / Włochy | Front włoski | 45.65, 13.78 | 25 | Triest | Łukasz Skowroń |
| E | `antwerpia` / `antwerp` | Antwerpia / Antwerp | miasto | Belgia / Belgia | Front zachodni | 51.22, 4.40 | 25 | Antwerpia | Łukasz Skowroń |
| E | `amiens` / `amiens` | Amiens / Amiens | miasto | Francja / Francja | Front zachodni | 49.89, 2.30 | 25 | Amiens | Natalia |
| F | `moza` / `meuse` | Moza / Meuse | rzeka | Francja i Belgia / Francja i Belgia | Front zachodni | 49.16, 5.38 | 30 | Moza | Natalia |
| F | `kotor` / `kotor` | Kotor / Kotor | miasto | Austro-Węgry / Czarnogóra | Wojna na morzu | 42.42, 18.77 | 25 | Kotor | Łukasz Skowroń |
| G | `dardanele` / `dardanelles` | Dardanele / Dardanelles | akwen | Imperium Osmańskie / Turcja | Bliski Wschód | 40.2, 26.4 | 40 | Dardanele | Łukasz Skowroń |
| G | `mudros` / `mudros` | Mudros / Mudros | akwen | Grecja / Grecja | Bliski Wschód | 39.85, 25.27 | 20 | Mudros | Natalia |

Notes:
- Gorycja: the Italian goal across eleven battles, the front line at its
  edge, the capture in August 1916 (sixth Isonzo), the ruined town, lost
  again after Caporetto; the Isonzo battles are one campaign page
  (`bitwy-nad-isonzo`) plus a page per battle: link, don't retell.
- Triest: the Austro-Hungarian port and the Italian war aim
  (irredentism, the Treaty of London), the city under the front's guns,
  November 1918.
- Antwerpia: the national redoubt (August 1914), the sorties, the
  government's seat, the siege (`oblezenie-antwerpii`: link it, don't
  retell it), the flight of civilians to the Netherlands, the occupation.
- Amiens: the BEF's base, the brief German occupation in 1914, the
  objective of the 1918 spring offensive (Villers-Bretonneux), the
  battle of 8 August 1918 (`bitwa-pod-amiens`: link it).
- Moza: a river page across the war: the crossings of 1914 (Liège, Namur,
  Dinant, Sedan; `bitwa-nad-moza`), Verdun, the Saint-Mihiel salient, the
  Meuse–Argonne offensive. Link the battle pages; the page is the thread
  that ties them.
- Kotor: the Austro-Hungarian navy's southern base in the Bay of Kotor,
  Lovćen above it (`bitwa-o-lovcen`), the U-boats, the sailors' mutiny of
  February 1918. Our articles call it Kotor; the English page may say
  "Kotor (Cattaro)" at first mention.
- Dardanele: the strait across the war: its closing in 1914, Goeben and
  Breslau, the naval operation of 1915 (`morska-operacja-w-dardanelach`)
  and the Gallipoli campaign (link, don't retell), the submarines in the
  Marmara, the Breslau and Goeben sortie of January 1918, the opening
  after Mudros.
- Mudros: the harbour on Lemnos: the base of the Dardanelles and
  Gallipoli campaign, its hospitals, the armistice signed there on
  30 October 1918 (`rozejm-w-mudros`). Verify Lemnos's status in 1914 and
  say it in a sentence.

The places `/miejsca/saloniki`, `/miejsca/korfu`, `/miejsca/ypres`,
`/miejsca/kanal-sueski`, `/miejsca/bagdad` exist: link them where natural.

## Batch 3 (2026-10-31)

The owner asked for the 45 places that are still linked to pl.wikipedia
most often (≈20+ links each). Same form, tone and length as batches 1–2.
Each group writes three pages; other groups write in parallel, so link
another new place only if its file exists when you run the check. Put
`summary` and every `brief` point in double quotes (a colon breaks the
YAML). Battle pages that already tell a part of the place's war: link
them, don't retell them. Our place pages, guides, country pages, force
pages (`/sily-zbrojne/<slug>`) and glossary terms (`/slownik/<slug>`) are
all good links.

| grp | slug / English slug | name (PL / EN) | kind | in1914 / today | front | lat, lon | radiusKm | wikiTitles | author |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `tygrys` / `tigris` | Tygrys / Tigris | rzeka | Imperium Osmańskie / Irak | Bliski Wschód | 33.0, 44.6 | 200 | Tygrys_(rzeka) | Natalia |
| 1 | `al-kut` / `kut` | Al-Kut / Kut | miasto | Imperium Osmańskie / Irak | Bliski Wschód | 32.5, 45.82 | 30 | Al-Kut | Łukasz Skowroń |
| 1 | `eufrat` / `euphrates` | Eufrat / Euphrates | rzeka | Imperium Osmańskie / Irak i Syria | Bliski Wschód | 31.0, 46.3 | 150 | Eufrat | Natalia |
| 2 | `basra` / `basra` | Basra / Basra | miasto | Imperium Osmańskie / Irak | Bliski Wschód | 30.5, 47.8 | 60 | Basra | Łukasz Skowroń |
| 2 | `konstantynopol` / `constantinople` | Konstantynopol / Constantinople | miasto | Imperium Osmańskie / Turcja | Bliski Wschód | 41.01, 28.98 | 30 | Konstantynopol | Natalia |
| 2 | `erzurum` / `erzurum` | Erzurum / Erzurum | miasto | Imperium Osmańskie / Turcja | Bliski Wschód | 39.9, 41.27 | 60 | Erzurum | Łukasz Skowroń |
| 3 | `jerozolima` / `jerusalem` | Jerozolima / Jerusalem | miasto | Imperium Osmańskie / Izrael i Palestyna | Bliski Wschód | 31.78, 35.22 | 30 | Jerozolima | Natalia |
| 3 | `kamerun` / `kamerun` | Kamerun / Kamerun | region | Niemcy / Kamerun | Afryka | 5.5, 12.0 | 400 | Kamerun_Niemiecki | Łukasz Skowroń |
| 3 | `niemiecka-afryka-poludniowo-zachodnia` / `german-south-west-africa` | Niemiecka Afryka Południowo-Zachodnia / German South West Africa | region | Niemcy / Namibia | Afryka | -22.5, 17.0 | 500 | Niemiecka_Afryka_Południowo-Zachodnia | Natalia |
| 4 | `arras` / `arras` | Arras / Arras | miasto | Francja / Francja | Front zachodni | 50.29, 2.78 | 20 | Arras_(Francja) | Łukasz Skowroń |
| 4 | `douai` / `douai` | Douai / Douai | miasto | Francja / Francja | Front zachodni | 50.37, 3.08 | 15 | Douai | Natalia |
| 4 | `cambrai` / `cambrai` | Cambrai / Cambrai | miasto | Francja / Francja | Front zachodni | 50.17, 3.23 | 15 | Cambrai | Łukasz Skowroń |
| 5 | `somma` / `somme` | Somma / Somme | rzeka | Francja / Francja | Front zachodni | 49.93, 2.7 | 30 | Somma_(rzeka), Ancre | Natalia |
| 5 | `albert` / `albert` | Albert / Albert | miasto | Francja / Francja | Front zachodni | 50.0, 2.65 | 10 | Albert_(Francja) | Łukasz Skowroń |
| 5 | `bapaume` / `bapaume` | Bapaume / Bapaume | miasto | Francja / Francja | Front zachodni | 50.1, 2.85 | 12 | Bapaume | Natalia |
| 6 | `peronne` / `peronne` | Péronne / Péronne | miasto | Francja / Francja | Front zachodni | 49.93, 2.93 | 12 | Péronne_(Somma) | Łukasz Skowroń |
| 6 | `noyon` / `noyon` | Noyon / Noyon | miasto | Francja / Francja | Front zachodni | 49.58, 3.0 | 15 | Noyon | Natalia |
| 6 | `soissons` / `soissons` | Soissons / Soissons | miasto | Francja / Francja | Front zachodni | 49.38, 3.32 | 15 | Soissons | Łukasz Skowroń |
| 7 | `aisne` / `aisne` | Aisne / Aisne | rzeka | Francja / Francja | Front zachodni | 49.42, 3.5 | 40 | Aisne_(rzeka) | Natalia |
| 7 | `reims` / `reims` | Reims / Reims | miasto | Francja / Francja | Front zachodni | 49.26, 4.03 | 20 | Reims | Łukasz Skowroń |
| 7 | `hazebrouck` / `hazebrouck` | Hazebrouck / Hazebrouck | miasto | Francja / Francja | Front zachodni | 50.72, 2.54 | 15 | Hazebrouck | Natalia |
| 8 | `leie` / `lys` | Leie (Lys) / Lys | rzeka | Francja i Belgia / Francja i Belgia | Front zachodni | 50.7, 2.9 | 25 | Leie | Łukasz Skowroń |
| 8 | `gandawa` / `ghent` | Gandawa / Ghent | miasto | Belgia / Belgia | Front zachodni | 51.05, 3.72 | 20 | Gandawa | Natalia |
| 8 | `ostenda` / `ostend` | Ostenda / Ostend | miasto | Belgia / Belgia | Wojna na morzu | 51.23, 2.92 | 15 | Ostenda | Łukasz Skowroń |
| 9 | `zeebrugge` / `zeebrugge` | Zeebrugge / Zeebrugge | miasto | Belgia / Belgia | Wojna na morzu | 51.33, 3.2 | 15 | Zeebrugge | Natalia |
| 9 | `ciesnina-kaletanska` / `strait-of-dover` | Cieśnina Kaletańska / Strait of Dover | akwen | Wielka Brytania i Francja / Wielka Brytania i Francja | Wojna na morzu | 51.0, 1.45 | 40 | Cieśnina_Kaletańska | Łukasz Skowroń |
| 9 | `hawr` / `le-havre` | Hawr / Le Havre | miasto | Francja / Francja | Front zachodni | 49.49, 0.11 | 20 | Hawr | Natalia |
| 10 | `morze-polnocne` / `north-sea` | Morze Północne / North Sea | akwen | wody międzynarodowe / wody międzynarodowe | Wojna na morzu | 56.0, 3.0 | 400 | Morze_Północne | Łukasz Skowroń |
| 10 | `scapa-flow` / `scapa-flow` | Scapa Flow / Scapa Flow | akwen | Wielka Brytania / Wielka Brytania | Wojna na morzu | 58.9, -3.1 | 30 | Scapa_Flow | Natalia |
| 10 | `brindisi` / `brindisi` | Brindisi / Brindisi | miasto | Włochy / Włochy | Wojna na morzu | 40.64, 17.94 | 30 | Brindisi | Łukasz Skowroń |
| 10 | `murmansk` / `murmansk` | Murmańsk / Murmansk | miasto | Rosja / Rosja | Front wschodni | 68.97, 33.08 | 60 | Murmańsk | Natalia |
| 11 | `wlora` / `vlore` | Wlora / Vlorë | miasto | Albania / Albania | Front bałkański | 40.47, 19.49 | 30 | Wlora | Łukasz Skowroń |
| 11 | `durres` / `durres` | Durrës / Durrës | miasto | Albania / Albania | Front bałkański | 41.32, 19.45 | 25 | Durrës | Natalia |
| 11 | `bitola` / `bitola` | Bitola / Bitola | miasto | Serbia / Macedonia Północna | Front bałkański | 41.03, 21.33 | 30 | Bitola | Łukasz Skowroń |
| 12 | `wardar` / `vardar` | Wardar / Vardar | rzeka | Serbia i Grecja / Macedonia Północna i Grecja | Front bałkański | 41.2, 22.5 | 60 | Wardar | Natalia |
| 12 | `crna-reka` / `crna-reka` | Crna Reka / Crna | rzeka | Serbia / Macedonia Północna | Front bałkański | 41.2, 21.7 | 40 | Crna_Reka_(dopływ_Wardaru) | Łukasz Skowroń |
| 12 | `kawala` / `kavala` | Kawala / Kavala | miasto | Grecja / Grecja | Front bałkański | 40.94, 24.41 | 30 | Kawala | Natalia |
| 13 | `belgrad` / `belgrade` | Belgrad / Belgrade | miasto | Serbia / Serbia | Front bałkański | 44.82, 20.46 | 30 | Belgrad | Łukasz Skowroń |
| 13 | `bukareszt` / `bucharest` | Bukareszt / Bucharest | miasto | Rumunia / Rumunia | Front bałkański | 44.43, 26.1 | 40 | Bukareszt | Natalia |
| 13 | `dobrudza` / `dobruja` | Dobrudża / Dobruja | region | Rumunia / Rumunia i Bułgaria | Front bałkański | 44.2, 28.3 | 120 | Dobrudża | Łukasz Skowroń |
| 14 | `lwow` / `lviv` | Lwów / Lviv | miasto | Austro-Węgry / Ukraina | Front wschodni | 49.84, 24.03 | 40 | Lwów | Natalia |
| 14 | `san` / `san` | San / San | rzeka | Austro-Węgry i Rosja / Polska i Ukraina | Front wschodni | 50.0, 22.6 | 60 | San | Łukasz Skowroń |
| 14 | `dniestr` / `dniester` | Dniestr / Dniester | rzeka | Austro-Węgry i Rosja / Ukraina i Mołdawia | Front wschodni | 48.9, 25.5 | 100 | Dniestr | Natalia |
| 15 | `brzesc` / `brest-litovsk` | Brześć / Brest-Litovsk | miasto | Rosja / Białoruś | Front wschodni | 52.09, 23.69 | 30 | Brześć | Łukasz Skowroń |
| 15 | `mohylew` / `mogilev` | Mohylew / Mogilev | miasto | Rosja / Białoruś | Front wschodni | 53.9, 30.33 | 30 | Mohylew | Natalia |
| 15 | `kurlandia` / `courland` | Kurlandia / Courland | region | Rosja / Łotwa | Front wschodni | 56.9, 22.5 | 150 | Kurlandia | Łukasz Skowroń |
| 15 | `archangielsk` / `arkhangelsk` | Archangielsk / Arkhangelsk | miasto | Rosja / Rosja | Front wschodni | 64.54, 40.54 | 60 | Archangielsk | Natalia |

Notes:
- Tygrys: the river of the Mesopotamian campaign: the advance up it in 1915, Ctesiphon, Kut, the river transport, Baghdad 1917, Sharqat and Mosul 1918; link `kampania-mezopotamska`, `/miejsca/bagdad`, `/miejsca/al-kut` (written in the same group).
- Al-Kut: three battle pages tell its battles (first and second Kut, the siege): the page is the thread; Townshend's surrender, the prisoners' march.
- Eufrat: the second river of Mesopotamia: Qurna, Nasiriyah 1915, Ramadi and Khan al-Baghdadi 1917–1918; the Armenian deportations along it (link the genocide guide, don't retell).
- Basra: the landing of 1914 and why (oil, Abadan), the base and port of the campaign, the hospitals.
- Konstantynopol: the capital: Goeben and Breslau, the Dardanelles threat 1915, the deportation of Armenian notables (24 IV 1915), the war government, the Allied occupation from November 1918.
- Erzurum: the fortress of the Caucasus front: Sarıkamış 1914–1915, the Russian capture in February 1916 (`ofensywa-erzurumska`: link it), the Ottoman return in 1918.
- Jerozolima: the city under Djemal Pasha, its surrender and Allenby's entry in December 1917 (`zdobycie-jerozolimy`, `obrona-jerozolimy`: link, don't retell), the British administration.
- Kamerun: the German colony's war 1914–1916: Douala, the Allied columns, the retreat to Spanish Guinea; check that our English edition says Kamerun or Cameroon and follow it (adjust the English slug and name to match).
- Niemiecka Afryka Południowo-Zachodnia: the South African conquest 1914–1915: the Maritz rebellion, Botha and Smuts, the surrender at Khorab in July 1915; one sentence on the Herero and Nama genocide before the war.
- Arras: the city on the front line for four years: 1914, Artois 1915, the tunnels and the battle of 1917, 1918 (`bitwa-pod-arras-1917`, `pierwsza-bitwa-pod-arras-1918`: link).
- Douai: occupied from 1914 to October 1918: the German base behind Arras and Vimy, the Douai plain, the liberation.
- Cambrai: occupied 1914–1918, the tanks of November 1917 and the battle of 1918 (link both battle pages), the burned city.
- Somma: the river and its tributary the Ancre: 1914, the battle of 1916 (`bitwa-nad-somma`: link, don't retell), the German withdrawal of 1917, March 1918 and August 1918; the Ancre battles.
- Albert: the town behind the British line: the leaning Virgin on the basilica, the battles of Albert 1914, 1916, 1918 (link).
- Bapaume: the goal of 1916, taken in March 1917, lost in March 1918, retaken in August 1918 (link the battle pages).
- Péronne: the town on the Somme: 1914, 1916, March 1917, March 1918, Mont Saint-Quentin and the Australians (1918).
- Noyon: the tip of the German salient nearest Paris 1914–1917 ("the Germans are at Noyon"), Alberich 1917, the battles of 1918 (link).
- Soissons: on the Aisne: 1914 and January 1915, near the Chemin des Dames 1917, lost in May 1918, retaken in August 1918 (`bitwa-pod-soissons`: link).
- Aisne: the river of three battles (1914, 1917 Nivelle, 1918; link the battle pages), the Chemin des Dames ridge above it.
- Reims: the city under the guns for four years, the cathedral shelled in September 1914, the battles of 1918 around it.
- Hazebrouck: the railway junction behind Ypres, the German goal in April 1918 (`bitwa-pod-hazebrouck`: link).
- Leie (Lys): the river of Flanders: Armentières 1914, the battle of the Lys 1918 (`bitwa-nad-lys-1918`), the advance of October 1918; our articles call it Leie or Lys: check and name it as they do.
- Gandawa: occupied 1914–1918: the German base, the Flemish university (1916) and Flamenpolitik, the liberation in November 1918.
- Ostenda: the brief seat of the Belgian government (1914), the German U-boat and destroyer base, the raids of 1918.
- Zeebrugge: the Flanders U-boat base and its canal to Bruges, the raid of 23 April 1918 (link its page if it exists).
- Cieśnina Kaletańska: the shortest crossing and the BEF's lifeline, the Dover Patrol and the barrage, the destroyer raids.
- Hawr: the BEF's main port and base, the seat of the Belgian government in exile (Sainte-Adresse) 1914–1918; check how our English edition names it.
- Morze Północne: the sea between the two fleets: the British military area of November 1914, the minefields, Heligoland, Dogger Bank, Jutland, the Northern Barrage; link the force pages `grand-fleet`, `flota-pelnomorska`.
- Scapa Flow: the Grand Fleet's anchorage, its defences and the U-boat scares, the Vanguard explosion (1917) if our pages tell it, the internment and the scuttling of 1919.
- Brindisi: the Allied base of the Adriatic and the Otranto barrage, the Serbian evacuation (1915–1916), the Benedetto Brin explosion (1915) if our pages tell it.
- Murmańsk: the ice-free port founded in 1916, the railway, the Allied landing of March 1918.
- Wlora: the Italian occupation from December 1914, the Treaty of London's promise, the base on the Adriatic, 1920; check how our English edition names it.
- Durrës: Wied's capital in 1914, Essad Pasha, the Serbian evacuation of 1916, the Austro-Hungarian occupation, the bombardment of October 1918 (link the battle pages).
- Bitola: Monastir: the Bulgarian occupation 1915, the Allied capture in November 1916, the city shelled until 1918; our articles may call it Monastyr: check.
- Wardar: the valley of the Salonika front: the 1915 retreat, the line along it, Doiran, the battles of 1917 and the breakthrough of 1918 (link).
- Crna Reka: the bend of the Crna and the battles of 1916–1918 (Kajmakčalan, the Crna bend, Hill 1050), the Serbian army's return.
- Kawala: the Greek port surrendered to the Bulgarians in 1916 with a Greek corps (the national schism), the occupation until 1918.
- Belgrad: the capital shelled from 28 July 1914, the occupations of December 1914 and October 1915 (`obrona-belgradu`: link), the liberation of 1 November 1918.
- Bukareszt: the capital: the decision of 1916, the Zeppelin raids, the fall on 6 December 1916, the occupation and the peace of Bucharest (May 1918).
- Dobrudża: Mackensen's campaign of 1916 (Turtucaia, Constanța), the Russians and Romanians, the condominium of 1918.
- Lwów: Galicia's capital: the Russian occupation 1914–1915 and the retaking (`odbicie-lwowa`), the city at war's end and the defence of November 1918 (`obrona-lwowa-1918`); our English edition's name for it: check (Lwów / Lemberg / Lviv) and follow it.
- San: the river line of 1914 and 1915: Przemyśl, Jarosław, the crossings of May 1915 after Gorlice.
- Dniestr: the river of the southern front: 1914, the battles of 1915, the Brusilov offensive 1916, 1917.
- Brześć: the fortress given up in August 1915, the German Ober Ost headquarters, the armistice and peace talks of 1917–1918 (link those articles, don't retell).
- Mohylew: the Stavka 1915–1918: Nicholas II as commander, the abdication train, Dukhonin's murder (December 1917).
- Kurlandia: the German occupation from 1915 (Libau, Mitau), Ober Ost, the front on the Dvina, the Baltic Duchy plans of 1918.
- Archangielsk: the White Sea port of Allied supplies, the Allied landing of August 1918 and the North Russia intervention, the withdrawal of 1919.

## Report (short)

Per page: paths, words, sources, internal links, conflicts with our pages
(file + what), anything left out and why.
