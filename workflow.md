# workflow.md — how content is produced for thegreatwar.pl

Handover document for the next Claude agent. Read it fully before doing anything.
Last updated: 2026-10-02, after the December 1915 batch.

---

## 1. The project in one paragraph

thegreatwar.pl is a **Polish-language chronicle of the First World War**, built with Astro (static site, content collections, Zod schema). The owner (Łukasz Skowroń) goes through the British official chronology **"Principal Events 1914–1918"** month by month. He pastes one month's list of events into the chat. For **every event** we write **one Polish timeline article**, and for important battles we also write **battle pages**. The site is for Polish readers: everything published is in Polish. Chat with the owner is in English.

## 2. Where things live

| What | Where |
|---|---|
| Timeline articles | `src/content/timeline/<YYYY>/<MM>/<slug>.md` → served at `/<slug>` |
| Battle pages | `src/content/battles/<YYYY>/<slug>.md` (year the battle **starts**) → served at `/bitwy/<slug>` |
| Schema (source of truth for front-matter) | `src/content.config.ts` |
| Battle phases (groups on the /bitwy page) | `src/data/battlePhases.ts` |
| Article page | `src/pages/[id].astro` |
| Persistent memory (rules) | `~/.claude/projects/-Users-lukaszskowron-Code-astro-thegreatwar-pl/memory/` (`MEMORY.md` is the index) |

Entry ids come **from the filename only** (folders are ignored), so every slug must be **unique across all folders** of a collection.

## 3. Status (what is done)

- Timeline written for **June 1914 → December 1915** (folders `1914/06` … `1915/12`). Every month is committed (latest commit: `feat(content): finish december 1915 events`, bab62f1). December 1915 = (58 articles incl. the 2 pre-placed and the added Chantilly, minus Kangavar moved to January + 5 battle pages: `bitwa-pod-kosturino` 6–12 XII, `ewakuacja-gallipoli` 18 XII 1915 – 9 I 1916, `oblezenie-al-kutu` 7 XII 1915 – 29 IV 1916, `bitwa-na-jeziorze-tanganika` 26 XII 1915 – 9 II 1916, `pierwsza-bitwa-pod-durres` 29 XII). November = 49 articles (incl. the added 21 XI Kačanik end; Goltz moved out) + 4 battle pages (also in that batch: pre-placed `1915/12/utrata-sterowca-lz-39.md` and `1915/12/von-der-goltz-dowodca-w-mezopotamii.md` (12 XII), backdated `1915/09/porozumienie-z-holenderskim-trustem-zamorskim.md`, small fixes listed in item 21).
- **Pre-placed future file:** `src/content/timeline/1915/12/utrata-sterowca-lz-39.md` (17 XII 1915, dayOrder 1). Chronology put it on 5 XI near Grodno (false; LZ 39 was hit over Rovno 17 XII and dismantled near Łuck). Include in the December batch, renumber 17 XII, no duplicate.
- Battle pages: `src/content/battles/1914/` (≈65 pages) and `src/content/battles/1915/` (Dogger Bank, Bolimów, Soissons, Jasin, Suez Canal attack, Mazury winter battle, Przasnysz, Carpathians winter battle, Dardanelles naval operation, Neuve-Chapelle, Second Ypres + Gravenstafel + St. Julien, Hill 60, Shaiba, Van, Gallipoli landing, First Krithia, and from May: Gorlice, San, Odbicie Przemyśla, Frezenberg, Bellewaarde, Second Artois, Aubers, Festubert, Second Krithia, Second Al-Kurna, Stryj; from June: Mościska–Lubaczów, Odbicie Lwowa, Third Krithia, Gully Ravine, First Isonzo, Gniła Lipa; from July: Second Kraśnik, Krasnystaw, Narew–Biebrza, Second Przasnysz, Szawle, Second Isonzo, Gotland, Rufiji delta, An-Nasirijja, Le Linge; from August: Sari Bair, Suvla, Scimitar Hill, Kowno, Nowogieorgijewsk, Gulf of Riga, Obrona Osowca; from September: Loos, Third Artois, Second Champagne, Wilno, Dźwińsk, Tarnopol, First Al-Kut; from October: Podbój Serbii (umbrella, 6 X – 4 XII), Obrona Belgradu, Krivolak, Third Isonzo).
- **Pre-placed future file:** `src/content/timeline/1915/08/sad-pryzowy-uznaje-zajecie-dacii.md` (5 VIII 1915, dayOrder 1). It was moved there from March because the real ruling date is August. When the August 1915 list arrives, include it in the batch table, renumber 5 VIII dayOrders if other events share the day, and **don't write a duplicate**.
- **Pre-placed future file:** `src/content/timeline/1915/09/traktat-sojuszniczy-w-sofii.md` (6 IX 1915, dayOrder 1). Chronology put the Bulgarian alliance on 17 VII (and claimed Albania for Bulgaria); real treaties are 6 IX. Include in the September batch, renumber 6 IX, no duplicate. The chronology's "Durazzo reoccupied by Serbs" (31 VIII) is false: the Serbs never entered Durrës (see `1915/07/serbowie-w-srodkowej-albanii.md`).
- July batch moved: Bukoba raid to its real date **22 VI** (`1915/06/brytyjczycy-zdobywaja-bukobe.md`, 22 VI renumbered); Pelagosa from 26 VII to **11 VII**; the chronology's "Serbs evacuate Durazzo" (17 VII) was dropped as a non-event (folded into the 4 VII article).
- **Pre-placed future file:** `src/content/timeline/1915/10/kikujiro-ishii-ministrem-spraw-zagranicznych.md` (13 X 1915, dayOrder 1). Chronology put it on 21 IX. Include it in October, renumber 13 X, no duplicate. **The chronology's "Third Allied attack on Mora 30 X – 4 XI 1915" looks false** (1914 events a year late; Moberly has no Allied attack on Mora in Oct–Nov 1915) — verify before writing.
- September batch renames: "Drugi atak na Morę" → `nieudany-szturm-na-more` (it was at least the 4th attempt); "Początek drugiego marszu na Jaunde" → `rozkaz-do-drugiego-marszu-na-jaunde` (orders 22 IX, march began 6 X — October may have Wum Biagas 9 X / start 6 X); "Bułgaria ogłasza częściową mobilizację" → `bulgaria-postanawia-oglosic-mobilizacje` (no separate partial mobilisation). Loos page ends 8 X: the October "Hohenzollern Redoubt 13 X" item must NOT set `battle: bitwa-pod-loos` (link it in the body). Third Artois page ends 15 X; Second Champagne ends 6 XI; Dźwińsk ends 1 XI; Wilno ends 2 X.
- August batch: the chronology's "Durazzo reoccupied by Serbs" (31 VIII) was dropped (false). Ajn od-Dole's dismissal moved from 17 VIII to its real date **21 VII** (`1915/07/dymisja-rzadu-ajn-od-dole.md`). The 1 VIII "Constantinople harbour raided" is unconfirmed — written as `doniesienia-o-ataku-na-port-w-konstantynopolu.md`. Osowiec was evacuated, not stormed.
- New tag **"wielki odwrót 1915"** for the 1915 Russian retreat; the old "wielki odwrót" tag is the 1914 Allied retreat in France — don't mix them.
- (Done in July) Pre-placed `src/content/timeline/1915/07/pierwsza-konferencja-w-calais.md` (6 VII 1915, dayOrder 1). Chronology put it on 5 VI; real date 6 VII. Include it in the July batch table and renumber 6 VII dayOrders (e.g. "Battle of Krasnostav begins"); don't write a duplicate.
- June batch also moved the Customs (Exportation Restriction) Act from 3 VI to its real date **24 VI** (`1915/06/brytyjska-ustawa-o-eksporcie-do-holandii.md`), and San Marino's "declaration of war" (3 VI) was written as a myth: `rzekoma-wojna-san-marino-z-austro-wegrami.md` (owner decided: **milestone false**).
- Similarly the "rubber agreement" (chronology: 29 III 1915) was **backdated** to its real date, 8 I 1915 (`1915/01/porozumienie-w-sprawie-kauczuku.md`). Owner's rule: **misdated chronology events go to their real date** (when the difference is big and the article can't honestly sit on the chronology date). For small differences (a day or two), keep the chronology date and explain the discrepancy in the text.

### Open items to offer the owner (not done, owner didn't decide)
1. `battles/1914/obrona-givenchy.md` dates the BEF split into two armies to 27 XII 1914; most sources say 26 XII.
2. `battles/1915/morska-operacja-w-dardanelach.md` gives 11.00 for the opening fire on 18 III; Corbett says ~11.30.
3. `timeline/1915/03/john-nixon-dowodca-w-mezopotamii.md` says Barrett "soon" handed the 6th Division to Townshend; actually Fry held it temporarily (Barrett left 12 IV, Townshend arrived 22 IV).
4. `timeline/1915/03/poludniowoafrykanczycy-zajmuja-aus.md`: "185 km in four days" isn't confirmed by the SA official account; also spells "Bethanie" while pl.wiki is "Bethanien".
5. The Gallipoli landing (25 IV 1915) is `milestone: false` because the owner didn't highlight it — offer to flip it.
6. `1914/08/prinz-eitel-friedrich-wyplywa-z-tsingtao.md`: "kilkanaście statków" — en.wiki lists 11 (loose).
7. (May batch) `timeline/1915/04/alianci-ruszaja-na-garue.md` (17 IV) tells the whole siege and fall of Garua. Owner said **leave it as is** — don't offer again.
8. (May batch) Owner made Gorlice a milestone and approved a Stryj battle page (`bitwa-nad-stryjem`). Items 9–11 below: owner will answer later.
9. (May batch) `battles/1915/bitwa-pod-st-julien.md` dates the Canadian withdrawal from Gravenstafel to 25 IV; Edmonds says 26 IV (night 25/26) — minor.
10. (May batch) `1914/09/rosjanie-zajmuja-jaroslaw.md` says Jarosław retaken 15 V 1915; entered 16 V — minor.
11. (May batch) `1914/09/walki-pod-karonga.md` dates the first Guendolen action 13 VIII 1914; History Today says 14 VIII — minor.
12. (June batch) `battles/1915/druga-bitwa-w-artois.md` gives German losses 65–75 thousand and cites "archiwa Pas-de-Calais: 19 czerwca"; the Pas-de-Calais page says ~45 thousand and that Foch stopped on 18 VI — minor.
13. (June batch) Owner approved a Gniła Lipa battle page: `bitwa-nad-gnila-lipa` (27 VI – 1 VII, phase `1915-gorlice`) — written.
14. (July batch) `timeline/1914/11/potyczka-pod-miranshah.md` says the Niedermayer–Hentig mission reached Kabul "we wrześniu 1915"; en.wiki gives 2 X 1915 — minor.
16. (September batch) Owner decided: Tsar takes supreme command (5 IX) is a milestone; Lord Derby article moved to 11 X (`1915/10/lord-derby-przejmuje-werbunek.md`, pre-placed for October). The pl.wiki "II_bitwa_w_Szampanii" stub was unlinked from 3 older pages.
15. (August batch) Owner decided: Warsaw (5 VIII) is a milestone; L 12 article renamed `utrata-sterowca-l-12`; the unconfirmed 1 VIII Constantinople article stays.
17. (October batch) Not written: chronology "Third Allied attack on Mora 30 X 1915" — false (Moberly p. 374: no Allied attack Oct–Nov 1915; it mirrors the 1914 dates). Real October item at Mora: German sortie seizes the Gauala ridge, night 8/9 X 1915 (held to 6 XII) — offered to the owner.
18. (October batch) Renames: "Zatopienie statku Livonia" → `e19-atakuje-parowiec-svionia` (no ship "Livonia"; E19 attacked the Stettin steamer Svionia off Rügen on 3 X, it ran aground, not sunk; "first" claim qualified); "Zdobycie Szabaca" → `austro-wegrzy-zajmuja-sabac` (site spelling Šabac; occupied unopposed 20 X). Venizelos items of 5 X merged into `wenizelos-ponownie-podaje-sie-do-dymisji`. Veles title uses "Wełes".
19. (October batch) Owner decided: Gauala ridge article written (8 X, `niemcy-zajmuja-grzbiet-gauala`, dayOrder 1; 8 X renumbered); 13 X French–Bulgarian clash **kept** on 13 X; 3 X article renamed `pierwsze-oddzialy-ententy-plyna-do-salonik`; milestones set on the invasion of Serbia (6 X + battle page `podboj-serbii`), the Salonika landing (5 X) and Cavell (12 X). Not answered: `podboj-serbii` endDate 4 XII vs 24 XI (kept 4 XII).
20. (October batch) Fixes to existing pages: tag "Horatio Kitchener" → "Herbert Kitchener" (09/ententa-obiecuje-grecji-wojska); 09/bulgaria-oglasza-powszechna-mobilizacje ending softened (only Russia broke relations at once); Gallieni born 1849 (1914/08/gallieni-gubernatorem-paryza); last II_bitwa_w_Szampanii link in 09/poczatek-bitwy-pod-loos → /bitwy/druga-bitwa-w-szampanii.
21. (November batch) Not written: chronology "Third Allied attack on Mora abandoned" (4 XI, false — see 17) and "Rovereto taken by Italian forces" (23 XI, false: town Austrian until XI 1918; ÖULK: Italians didn't reach Mori/Marsilli). Offer: myth article "Rzekome zdobycie Rovereto" (San Marino precedent) or Castel Dante (December, date unknown). Moved: LZ 39 → 17 XII (pre-placed in 1915/12); Dutch trust rationing agreement → real date 23 IX (`1915/09/porozumienie-z-holenderskim-trustem-zamorskim.md`; `grecja-oglasza-mobilizacje` → dayOrder 2; June `brytyjska-ustawa-o-eksporcie-do-holandii` now says "We wrześniu"). Renames: `austriacy-zajmuja-novi-pazar` → `niemcy-i-austriacy-zajmuja-novi-pazar` (Alpenkorps first, 20 XI); `koniec-bitwy-pod-kacanikiem` → `serbowie-odpieraja-bulgarow-pod-kacanikiem` (battle page 5–21 XI); `zdobycie-kragujevaca` → `zdobycie-kragujevca`; `senusi-atakuja-as-sallum` → `bractwo-sanusijja-atakuje-as-sallum` (new tag "Sanusijja"); `pozyczka-ententy-dla-grecji` → `doniesienia-o-pozyczce-ententy-dla-grecji` (£1.6m loan of 8 XI unconfirmed). Fix: 10/bryan-mahon… "Śródziemnomorski Korpus Ekspedycyjny" → "Śródziemnomorskich Sił Ekspedycyjnych". New phase `1915-afryka`.
22. (November batch) Owner decided: 3 XI article retitled `rzad-serbski-opuszcza-kraljevo` (government left Niš ~26 X; 3 XI = Kraljevo → Raška); Goltz moved to **12 XII** (`1915/12/von-der-goltz-dowodca-w-mezopotamii.md`, reached Nureddin's HQ at Kut per Kiesling/Moberly; pre-placed for December); added `koniec-bitwy-pod-kacanikiem` (21 XI); Rovereto dropped. Not answered: milestones (Ctesiphon, Albanian retreat offered). Minor open: `06/warneford-niszczy-sterowiec-lz-37` says LZ 37/38/39 didn't reach England (de.wiki claims LZ 39 bombed Harwich, unverified); `06/alianci-zajmuja-ngaundere` calls Cunliffe "podpułkownik".
23. (December batch) Rename: `wlosi-laduja-w-durres` → `wlosi-obsadzaja-durres` (Savona brigade marched overland from Vlorë). Chronology "Bremen sunk by British submarine" false → Russian mines off Windau (article `zatoniecie-krazownika-bremen`). Neutral zone written once on 14 XII (19 XII duplicate = press date). Goltz file got `battle: oblezenie-al-kutu`. Fixes to existing pages: 11/poczatek-odwrotu-serbow… Peć "około 7 grudnia"; 11/bulgarzy-zajmuja-przelecz-babuna-i-prilep Bitola "na początku grudnia"; 11/grecja-przyjmuje-zadania-ententy "ustne porozumienie zawarto"; 09/archibald-murray… MEF Jan 1916, all Egypt Mar 1916. Owner decided: Möwe moved to 29 XII (dayOrder 1); Kangavar moved to **13 I 1916** (`1916/01/rosjanie-zajmuja-kangawar.md`, pre-placed for January); Castelnau moved to 10 XII (dayOrder 1); France–NOT retitled `doniesienia-o-porozumieniu-francji-z-holenderskim-trustem-zamorskim` (unconfirmed); milestones set on the Kut siege (`poczatek-oblezenia-al-kutu` + page) and the Gallipoli evacuation (`poczatek-ewakuacji-suvli-i-anzac` + page); added `druga-konferencja-w-chantilly` (6 XII, dayOrder 1, Natalia).

## 4. What the owner expects (hard rules)

These come from the owner's explicit instructions over many sessions. Follow all of them.

### Content
- **Polish**, same tone as existing articles. **Historically accurate**: every fact verified on the web in several sources (see section 6).
- **Length fits the event**: minor event ≈ 4–5 paragraphs (headings optional); major event longer, with `##` sections.
- **One article per event** in the owner's list. Merging is allowed only for trivially paired items (e.g. two Persian ministers resigning on the same day) — and you must tell the owner.
- **summary ≤ 160 characters** (schema enforces it; count them).
- Wrap `title`/`summary` in double quotes if they contain `": "`.
- **Slug = title** (lowercase, Polish letters transliterated, hyphens). E.g. title "Kapitulacja Przemyśla" → `kapitulacja-przemysla.md`.

### Front-matter (field order exactly like this)
Timeline:
```yaml
---
title: Początek bitwy pod St. Julien
summary: 24 kwietnia 1915 Niemcy uderzyli chlorem na Kanadyjczyków pod Ypres. Front 1 Dywizji Kanadyjskiej się ugiął, a po południu padła wieś St. Julien.
category: Działania zbrojne        # Dyplomacja | Polityka | Wojsko | Działania zbrojne | Społeczeństwo
front: Front zachodni              # optional; only if tied to a theatre: Front zachodni | Front wschodni | Front bałkański | Front włoski | Bliski Wschód | Wojna na morzu | Afryka | Azja i Pacyfik
battle: bitwa-pod-st-julien        # optional; ONLY if date is within the battle's startDate–endDate
date: 1915-04-24
authors: [Łukasz Skowroń]          # or [Natalia]
dayOrder: 1
tags: [Kanada, Brytyjski Korpus Ekspedycyjny, Niemcy, broń chemiczna]
milestone: true
draft: false
---
```
No `role` field. Optional `headerImage: "file.jpg"` (file in `src/assets/images/`) only if the owner provides an image.

Battle page:
```yaml
---
title: Bitwa pod St. Julien
summary: …≤160 chars…
front: Front zachodni
phase: 1915-ypres                  # must be a slug from src/data/battlePhases.ts
startDate: 1915-04-24
endDate: 1915-05-04                # required even for one-day battles
location: Okolice wsi Sint-Juliaan (St. Julien) … Flandria Zachodnia (Belgia)
sides:
  - name: Wielka Brytania, Kanada i Indie Brytyjskie
    commanders: [John French, Horace Smith-Dorrien, Herbert Plumer]
  - name: Niemcy
    commanders: [Albrecht Wirtemberski]
result: Nierozstrzygnięta. …
authors: [Natalia]
tags: [Kanada, Brytyjski Korpus Ekspedycyjny, Niemcy, broń chemiczna]
milestone: true
---
```
Battle page body sections: `## Nazwa i daty`, `## Tło`, `## Przebieg…` (may be split by day), `## Straty` (optional), `## Znaczenie`. Models: `battles/1915/bitwa-pod-neuve-chapelle.md` (single battle), `battles/1914/pierwsza-bitwa-pod-ypres.md` (umbrella) + `bitwa-pod-langemarck.md` (sub-battle), `battles/1915/druga-bitwa-pod-ypres.md` + `bitwa-o-grzbiet-gravenstafel.md`.

### dayOrder (same-day events)
The site shows **higher dayOrder first**. The owner lists events in order, so the **first listed event gets the highest number** (4 events → 4, 3, 2, 1). When you add an event to a day that already has articles, renumber so the order still matches.

### Authors
Mix every batch: **≈40% `[Natalia]`**, the rest `[Łukasz Skowroń]` (battle pages count too).

### Tags
3–4 per article. **Reuse the existing vocabulary.** To see it, run:
`grep -rh '^tags:' src/content | sed 's/tags: \[//;s/\]//' | tr ',' '\n' | sed 's/^ //' | sort | uniq -c | sort -rn`
Use main countries, key people (full name, as already used, e.g. "Paul von Hindenburg"), and specific themes ("broń chemiczna", "blokada morska", "okręty podwodne"). No catch-alls like "I wojna światowa". Add a new tag only if it's genuinely needed. **Battle-page tags must also be used by at least one timeline article** (battle-only tags have no /tag page).

### Links
- **Polish Wikipedia only** (`https://pl.wikipedia.org/wiki/...`), never en/de/fr.
- Every link: the page **exists**, is **not a disambiguation page**, and is **about the right subject** (check the subject, not just existence — see the traps list in section 8).
- Link the **first mention only**; no duplicate link targets within an article; don't over-link.
- **Internal links** (`/<slug>` for timeline, `/bitwy/<slug>` for battles) point **only to earlier content**:
  - A timeline article may link articles with an earlier date, or the same date with a **higher** dayOrder. Never forward.
  - A battle page may link only content dated **before its startDate**. The owner accepted the precedent that a sub-battle page links its umbrella battle page when they start the same day (Langemarck → First Ypres, Gravenstafel → Second Ypres).
  - **Never link an article's own `battle`** in its body (metadata already links it). Battle pages don't link the timeline entries of that battle (they're listed automatically under "Na osi czasu").
  - Keep internal links sparse and natural. **No pointer sentences** like "Pełny przebieg opisujemy w artykule…".

### Battles
- **Proactively add battle pages** for important battles, even if the owner didn't ask.
- A timeline article gets `battle: <slug>` **only if its date is within the battle's startDate–endDate**. Otherwise, if useful, link `/bitwy/<slug>` in the body instead.
- New phases are added by the **coordinator** (you) in `src/data/battlePhases.ts` (slug, title, front, dates, intro paragraph in Polish), inserted in a sensible position. After adding a phase, tell the owner to **restart the dev server** (otherwise new /bitwy pages 404).
- Keep battle dates consistent with the timeline articles. If sources disagree on dates, pick one and explain it in "## Nazwa i daty".

### Milestones
`milestone: true` **only for events the owner highlights** (he writes "highlight" next to them). Set it on the start article **and** on its battle page. Everything else is `false`. Offer (don't set) milestone for obviously huge events he didn't highlight.

### Working style
- **Build, don't just propose.** When asked for something, implement it end to end, verify it, then report. Stop to ask only for irreversible or outward-facing actions.
- **Commit only when the owner asks** (he often commits himself). Branch is `develop`. Commit message style: `feat(content): finish <month> <year> events`.
- **Privacy:** never put the owner's e-mail address or any personal data into web requests, URLs or User-Agent headers. Use a generic UA such as `thegreatwar-linkcheck/1.0`.

## 5. The batch workflow (step by step)

This is the workflow used for every month since September 1914. It works well — keep it.

1. **Receive the month's list** (pasted). Note "highlight" markers and any extra sources the owner gives (e.g. greatwar.co.uk battle pages).
2. **Survey existing content** that overlaps: `ls src/content/timeline/<prev months>/`, `ls src/content/battles/*/`, grep for topics (e.g. `grep -ril "kamerun" src/content`), check the phases in `battlePhases.ts`, and check that the planned slugs are unique.
3. **Plan the batch** (coordinator):
   - One timeline row per event: date, dayOrder (first listed = highest), Polish title + slug, author (≈40% Natalia), `battle` field, and a short research hint (what to verify, suspicious claims in the chronology, which earlier articles to link back to).
   - **Battle pages** to add (highlighted battles plus important ones proactively): slug (fixed — other writers may link it), dates, author, phase, milestone.
   - **New phases**: add them to `battlePhases.ts` yourself, **before** launching the writers.
4. **Write the brief** to a file in the session scratchpad (e.g. `brief14.md`). Structure (copy from the previous brief if it still exists, else rebuild from this document):
   - Repo paths, schema, model files to read for tone.
   - **All rules from section 4** (writers don't see memory).
   - Accumulated **pl.wiki traps** (section 8) and lessons, plus which earlier articles and battle pages to read so writers don't contradict them.
   - The full batch table with a **group** column (A, B, C…), plus the battle-page table.
   - Instructions: verify everything, soften disagreements, report changes to slugs, don't edit other files, don't run the build, don't commit; deliverable = list of files + 1-line summary each + all source URLs + uncertainties + inconsistencies found in existing pages.
5. **Launch writers in parallel**: about 10–15 `general-purpose` subagents (model `opus`), each owning one group of 3–5 related files (e.g. a battle page + its articles; one theatre; one diplomatic thread). Same-topic files go to the same group so they're complementary. Run them in the background, all in one message. Prompt: "Read the brief at <path>, you are group X, write every row whose grp is X — nothing else; privacy rule; reply with the deliverable."
   - **Lessons from May 1915 (20 writers):** (a) the **WebSearch budget is shared by the whole session (200 calls)** and ran out mid-batch — tell writers to use WebSearch sparingly and prefer WebFetch of known sources (archive.org djvu texts, naval-history.net, FRUS); with 20 writers, ~10 searches each. (b) Writers overwrote each other's helper scripts in the shared scratchpad — tell each writer to use its own subfolder `scratchpad/grp<X>/`. (c) pl.wiki API returns 429 under parallel load — batch titles (50 per request) and retry. (d) Writers sometimes report "errors" in existing pages that aren't there (e.g. a "duplicate section" in the Szuajba page) — check before fixing.
6. **While waiting**: prepare the checkers (section 7) with the month folder and the new battle slugs. Give the owner a short status as each writer reports.
7. **Verify everything when all writers are done:**
   - `check.py` (format, summary length, tag count, unquoted colons, internal-link direction, battle range, non-pl wiki links, duplicate links) → must print no `!!`.
   - dayOrder listing per day matches the owner's order.
   - Author split ≈ 40/60.
   - Rare/new tags; battle tags used by the timeline.
   - `linkchk.py` (pl.wiki API: missing/disambiguation) → `0 bad`. If you hit HTTP 429, wait and rerun.
   - `npx astro check` → 0 errors, 0 warnings.
   - `npm run build` → "Complete!"; check the new pages exist in `dist/`.
   - Fix problems yourself (small edits) or send them back to the writer (SendMessage to the agent).
8. **Act on writers' reports:** accept justified slug/title changes (e.g. transliteration consistent with the site), and update cross-links if a slug changed. Errors found in **existing** pages: fix clear factual errors only if trivial, otherwise list them for the owner.
9. **Report to the owner** (English, concise): counts, new battle pages and phases, milestones, merges or renames, dates where sources disagree with the chronology (table), fixes to existing pages, open questions, and "Should I commit?".
10. **Update this file** (status, traps, open items) and memory if a new rule emerged.

## 6. How to keep articles historically accurate

- **Research every fact** with WebSearch/WebFetch, in several independent sources. The best sources used so far:
  - **British official histories** on archive.org (full djvu text): Edmonds *Military Operations France and Belgium*; Corbett/Newbolt *Naval Operations*; Moberly *Campaign in Mesopotamia* and *Togoland and the Cameroons*; Aspinall-Oglander *Gallipoli*; Nicholson *Canadian Expeditionary Force*; the SA official account of German SW Africa; Naval Staff Monographs.
  - naval-history.net, longlongtrail.co.uk, greatwar.co.uk (including its timeline http://www.greatwar.co.uk/timeline/ww1-events-1915.htm), Hansard (api.parliament.uk/historic-hansard), FRUS, Encyclopaedia Iranica, uboat.net, and Wikipedia in en/de/fr/ru/tr **for cross-checking only** (its infoboxes are often wrong).
  - Polish sources for Polish topics.
- **The chronology is often off by a day or more**, sometimes by months. Verify every date. If research shows a different date:
  - Small difference: keep the article on the owner's date and **say openly** in the text what sources show (models: `1914/10/niemiecka-kawaleria-w-ypres.md`, `1915/04/pierwszy-marsz-na-jaunde.md`).
  - Big difference, so it can't honestly sit there: tell the owner and propose moving it to the real date (as was done with Dacia and the rubber agreement).
  - The event didn't happen as described: don't invent it. Write what really happened and adjust the title (e.g. "Ukaz" → "Ustawa o samorządzie miejskim…"), or report back.
- **Disagreements between sources** (hours, numbers, casualties): **soften** ("po południu", "na początku kwietnia", "według części źródeł", "około") or **give the range or both versions with attribution** ("według brytyjskiej historii oficjalnej… tureckie źródła podają…"). **Never guess.**
- **Julian vs Gregorian calendar** for Russian, Greek and Ottoman dates (13 days' difference in 1915). Check which one a source uses.
- **"First / last" claims** in the chronology (first neutral ship sunk, last raider…) must be checked and qualified.
- **Hindsight:** a timeline article tells **that day's** events. Later developments get only a brief look ahead. Battle pages may describe the whole battle.
- **Sensitive topics** (e.g. the Armenian genocide): sober and precise, use the established terms ("ludobójstwo Ormian"), separate documented facts from estimates, and present contested framings neutrally (e.g. "revolt" at Van is the Ottoman framing; historians describe self-defence).
- **Don't contradict existing pages.** Read related earlier articles and battle pages first. If an existing page is wrong, report it (or fix it if trivial and clear).
- Polish conventions used on the site: submarines "U-9"; "kapitanlejtnant"; Indian forces "Indyjski Korpus Ekspedycyjny „D”"; Persian names "Moszir od-Dole", "Ajn od-Dole", "Moawen od-Dole"; "Sarykamysz"; "Szuajba"; Petersburg → "Piotrogród" after Aug 1914; Ypres in text (pl.wiki page "Ieper").

## 7. Checker scripts

The session scratchpad is wiped between sessions, so the scripts are kept here. Save them to the scratchpad and run them from the **repo root**.

`check.py` — usage: `python3 check.py 1915/05 slug-of-new-battle-1 slug-of-new-battle-2 …`
```python
import re,glob,os,sys
MONTH=sys.argv[1]; NEWB=set(sys.argv[2:])
def fm(p):
    t=open(p).read(); m=re.match(r'---\n(.*?)\n---\n(.*)',t,re.S); d={}
    for l in m.group(1).split('\n'):
        if ':' in l and not l.startswith(' '): k,v=l.split(':',1); d[k]=v.strip().strip('"')
    return d,m.group(2)
tl={};bt={}
for p in glob.glob('src/content/timeline/**/*.md',recursive=True):
    d,b=fm(p); tl[os.path.basename(p)[:-3]]=(d,b,p)
for p in glob.glob('src/content/battles/**/*.md',recursive=True):
    d,b=fm(p); bt[os.path.basename(p)[:-3]]=(d,b,p)
new=[('t',s) for s,(d,b,p) in tl.items() if f'/{MONTH}/' in p]+[('b',s) for s in bt if s in NEWB]
for kind,s in sorted(new,key=lambda x:x[1]):
    d,b,p=(tl if kind=='t' else bt)[s]
    print(f"{s}: len(summary)={len(d['summary'])} authors={d['authors']} date={d.get('date',d.get('startDate'))} do={d.get('dayOrder')} tags={d['tags']} battle={d.get('battle','')} ms={d.get('milestone')}")
    if len(d['summary'])>160: print('  !! summary too long')
    mydate=d.get('date',d.get('startDate')); mydo=int(d.get('dayOrder','0'))
    for m in re.finditer(r'\]\((/[^)]*)\)',b):
        u=m.group(1)
        if u.startswith('/bitwy/'):
            t=u[7:]
            if t not in bt: print('  !! missing battle',u); continue
            if t==d.get('battle'): print('  !! own battle linked',u)
            if bt[t][0]['startDate']>mydate: print('  !! forward battle',u)
        else:
            t=u[1:]
            if t not in tl: print('  !! missing article',u); continue
            td=tl[t][0]
            if kind=='t' and (td['date'],-int(td.get('dayOrder','0')))>=(mydate,-mydo): print('  !! forward/same link',u,td['date'],td.get('dayOrder'))
            if kind=='b' and td['date']>=mydate: print('  !! forward link from battle',u)
    en=[w for w in re.findall(r'https?://[a-z]+\.wikipedia',b) if 'pl.wikipedia' not in w]
    if en: print('  !! non-pl wiki',en)
    links=re.findall(r'\]\((https://pl\.wikipedia\.org/wiki/[^\s]*?)\)(?:[\s.,;:!?\]]|$)',b)
    dup={x for x in links if links.count(x)>1}
    if dup: print('  !! dup links',dup)
    raw=open(p).read().split('---')[1]
    for l in raw.split('\n'):
        if l.startswith(('title:','summary:')) and ': ' in l.split(':',1)[1] and not l.split(':',1)[1].strip().startswith('"'): print('  !! unquoted colon',l[:60])
    nt=len([x for x in d['tags'].strip('[]').split(',') if x.strip()])
    if not 3<=nt<=4: print('  !! tag count',nt)
    if kind=='t' and d.get('battle'):
        bs=d['battle']
        if bs not in bt: print('  !! battle missing',bs)
        elif not (bt[bs][0]['startDate']<=d['date']<=bt[bs][0]['endDate']): print('  !! battle out of range',bs)
```

`linkchk.py` — usage: `python3 linkchk.py 1915/05 slug-of-new-battle-1 …` (checks pl.wiki links: missing, disambiguation)
```python
import re,glob,json,urllib.request,urllib.parse,sys
MONTH=sys.argv[1]
files=glob.glob(f'src/content/timeline/{MONTH}/*.md')+[p for s in sys.argv[2:] for p in glob.glob(f'src/content/battles/*/{s}.md')]
rx=re.compile(r'https://pl\.wikipedia\.org/wiki/([^\s\]()]+(?:\([^\s()]*\)[^\s\]()]*)?)\)')
where={}
for f in files:
    for m in rx.finditer(open(f).read()):
        t=urllib.parse.unquote(m.group(1)).replace('_',' ')
        where.setdefault(t,set()).add(f.split('/')[-1])
titles=sorted(where); bad=0
for i in range(0,len(titles),50):
    q=urllib.parse.urlencode({'action':'query','format':'json','prop':'pageprops','ppprop':'disambiguation','redirects':1,'titles':'|'.join(titles[i:i+50])})
    req=urllib.request.Request('https://pl.wikipedia.org/w/api.php?'+q,headers={'User-Agent':'thegreatwar-linkcheck/1.0'})
    d=json.load(urllib.request.urlopen(req))['query']
    norm={n['from']:n['to'] for n in d.get('normalized',[])}
    for p in d['pages'].values():
        if 'missing' in p or 'invalid' in p or 'pageprops' in p:
            bad+=1; src=[k for k in where if norm.get(k,k)==p.get('title') or k==p.get('title')]
            print('MISSING' if 'missing' in p else 'DISAMBIG' if 'pageprops' in p else 'INVALID',p.get('title'),[sorted(where[s]) for s in src])
print(len(titles),'titles,',bad,'bad')
```
The API check doesn't catch **wrong-subject** pages (e.g. a namesake). Writers must read each page's opening lines.

Other useful one-liners (run from the repo root):
```bash
# dayOrder listing for the month
for f in src/content/timeline/1915/05/*.md; do echo "$(grep -m1 '^date:' $f|cut -c7-) $(grep -m1 '^dayOrder:' $f|cut -c11-) $(basename $f .md)"; done | sort -k1,1 -k2,2nr
# author split
grep -h '^authors:' src/content/timeline/1915/05/*.md | sort | uniq -c
npx astro check && npm run build
```
Note: the shell is **zsh** on macOS. There is no `timeout`. An **unquoted `$VAR` is not word-split** (`B="a b"; cmd $B` passes ONE argument), so type the battle slugs out or use `${=B}`. `[ ... -le ... ]` inside `while read` loops can misbehave, so prefer Python for anything non-trivial. Expected output for a clean batch: no `!!` lines, one line per new file, and `N titles, 0 bad`.

## 8. pl.wikipedia traps found so far (don't repeat them)

- **Disambiguation pages** (use the given alternative):
  - Places:

    | Disambiguation page | Use instead |
    |---|---|
    | Ypres | Ieper |
    | Abbeville | Abbeville_(Francja) |
    | Saint-Omer | Saint-Omer_(Pas-de-Calais) |
    | Le_Havre | Hawr |
    | Nieuwpoort | Nieuwpoort_(Belgia) |
    | Merville | Merville_(Nord) |
    | Yser | IJzer (battle: Bitwa_nad_Yser) |
    | Lys | Leie |
    | Verdun | Verdun_(Moza) |
    | Yola | Yola_(miasto) |
    | Front_włoski | Front_włoski_(I_wojna_światowa) |
    | Halicz | Halicz_(miasto) |
    | Dojran | Dojran_(miasto) / Dojran_(jezioro) |
    | Strumica | Strumica_(miasto) / Strumica_(rzeka) |
    | Seret | Seret_(dopływ_Dniestru) |
    | Strypa | Strypa_(dopływ_Dniestru) |
    | Dubno | Dubno_(miasto) |
    | Brody | Brody_(obwód_lwowski) |
    | Wilia | Wilia_(dopływ_Niemna) |
    | Wilejka | Wilejka_(miasto) |
    | Prypeć | Prypeć_(rzeka) |
    | Pina | Pina_(rzeka) |
    | Falmouth | Falmouth_(Anglia) |
    | Georgi_Todorow | Georgi_Todorow_(generał) |
    | Zwoleń | Zwoleń_(powiat_zwoleński) |
    | Policzna / Gniewoszów / Ryczywół | …_(województwo_mazowieckie) |
    | Wieprz | Wieprz_(rzeka) |
    | Wyżnica | Wyżnica_(rzeka) |
    | Grabowiec | Grabowiec_(powiat_zamojski) |
    | Wojsławice | Wojsławice_(wieś_w_województwie_lubelskim) |
    | Trawniki | Trawniki_(województwo_lubelskie) |
    | Husynne | Husynne_(powiat_hrubieszowski) |
    | Kosmów | Kosmów_(województwo_lubelskie) |
    | Windawa | Windawa_(rzeka) / Windawa_(miasto) |
    | Szadów | Szadów_(Litwa) |
    | Front_Północno-Zachodni | Front_Północno-Zachodni_(Imperium_Rosyjskie) |
    | Maków | Maków_Mazowiecki |
    | Munster | Munster_(Górny_Ren) |
    | Landwehr | Landwehra |
    | Beludżystan | Beludżystan_(kraina_historyczna) |
    | Morawa | Morawa_(prawy_dopływ_Dunaju) |
    | SMS_Magdeburg | SMS_Magdeburg_(1911) |
    | SM_U-4 | SM_U-4_(1908) |
    | Hel | Mierzeja_Helska |
    | Gargano | Promontorio_del_Gargano |
    | Walter_Long | Walter_Long_(1._wicehrabia_Long) |
    | Walter_Runciman | Walter_Runciman_(1._wicehrabia_Runciman_of_Doxford) |
    | Arbitraż | Arbitraż_(prawo) |
    | Pobór | Pobór_(wojsko) |
    | Iwangród (missing) | Twierdza_Dęblin |
    | Uganda (modern state) | Protektorat_Ugandy (for 1915) |
    | Jaworów | Jaworów_(miasto) |
    | Niemirów | Niemirów_(obwód_lwowski) |
    | Magierów | Magierów_(Ukraina) |
    | Kulików | Kulików_(rejon_żółkiewski) |
    | Bóbrka | Bóbrka_(Ukraina) |
    | Front_Południowo-Zachodni | Front_Południowo-Zachodni_(Imperium_Rosyjskie) |
    | Duma_Państwowa | Duma_Państwowa_(Imperium_Rosyjskie) |
    | Duala | Duala_(miasto) |
    | Buc | Buc_(Yvelines) |
    | Darjeeling | Dardżyling |
    | Bawełna | Bawełna_(włókno) |
    | Robert_Cecil | Robert_Cecil_(wicehrabia) |
    | Kras | Kras_(płaskowyż) |
    | Rab | Rab_(wyspa) |
    | Kitchener | Horatio_Kitchener |
    | SM_U-21 | SM_U-21_(1913) |
    | Mikołaj_Mikołajewicz_Romanow_(1856–1929) (missing) | Mikołaj_Romanow_(1856–1929) |
    | Bolechów | Bolechów_(miasto) |
    | SMS_Habsburg | SMS_Habsburg_(1900) |
    | Paolo_Thaon_di_Revel | (admiral's page missing; leave unlinked) |

    Also disambiguation, no alternative found yet: Radomka, Podgórz, Zakrzówek, Strzyżewice, Milejów, Siennica_Różana, Metelin, Janiszki, Popielany, Wenta, Uniszki, Goworowo, Ober-Ost, Kain, Zabol, Serres, Mirdita, Gallipoli, Utö, Pisa, Clyde, Rejestracja, Wywiad, SMS_Albatross, Skniłów, Czerniawa, Starzawa, Wisznia, Bilcze, Slup, Tybet, Rewolucja_lutowa, Henri_Gouraud (general has no page), Gretna, Madan, Hind, Dupleix (Métro station), Krn (village), Kolovrat, Święty_Maryn, Kanton, Port_Arthur, Charles_Townshend, Ezdrasz, Karun, Bailleul, Meerut, Richebourg, Zamczysko, Wietrzno, Stawka, Żurawica, Boże_Ciało, Hackney, Dalston, Jarosław, Sambor, Stryj, Krym, Kaukaz, Medway, Chatham, Al-Kurna, Chost, Umba, Zanzibar, Whitby, Penang, Zandvoorde, Hooge, Kunene, Okawango, Argonne (a Wisconsin town), Hrabstwo_Kent, Łącko, Mionica, Rajac, Kielmy.
  - People:

    | Disambiguation page | Use instead |
    |---|---|
    | Henry_Rawlinson | Henry_Rawlinson_(baron) |
    | Nikołaj_Iwanow | Nikołaj_Iwanow_(generał) |
    | Michaił_Aleksiejew | Michaił_Aleksiejew_(generał) |
    | John_Fisher | John_Arbuthnot_Fisher |
    | Ian_Hamilton | Ian_Hamilton_(generał) |
    | Aleksander_Benckendorff | (none; leave unlinked) |
    | Hindenburg | (none; leave unlinked) |
  - Ships:
    - SMS_Moltke, SMS_Blücher, SMS_Friedrich_Carl, SMS_Amazone, SMS_Möwe, SMS_Meteor, Mecidiye (the ship is Mecidiye_(1903)), SM_U-5, USS_Von_Steuben.
    - HMS_Bulwark is a list page.
  - Other: Reichstag, Zeppelin, Huzar, Honvéd, Skupsztina, Królestwo_Grecji, Wali, Mirage, Neutralność, Konwencja_haska (use Konwencje_haskie_z_1899_i_1907_roku), Dominium (use Dominium_brytyjskie), Kurier_Warszawski, Powstanie_arabskie, Abdullah_I.
- **Wrong subject:**

  | Page | What it actually is | Use instead |
  |---|---|---|
  | Nete | a Greek muse | Nete_(rzeka) |
  | Tygrys | the animal | Tygrys_(rzeka) |
  | Henry_Wilson | a US politician | — |
  | George_Buchanan | a 16th-century humanist | — |
  | Paul_Bronsart_von_Schellendorff | a different person | — |
  | Erskine_Childers | the son | — |
  | Henry_Morgenthau | the son | — |
  | Husajn_ibn_Ali (lowercase i) | the Shia imam | Husajn_Ibn_Ali (the Sharif) |
  | Miranszah | a Timurid ruler | — |
  | Aleksandr_Litwinow | a wrestler | — |
  | Richard_Turner | not the Canadian general | — |
  | Nikołaj_Nikołajew | a 1940s Soviet officer | — |
  | Marasz | a Bulgarian village | — |
  | Gibeon | the biblical city (no Namibian town page exists) | — |
  | Asir | the modern Saudi province | Emirat_Asiru |
  | SM_U-5_(1910) | the German boat | — |
  | Pancernik_Potiomkin | the film | — |
  | SMS_Prinz_Eitel_Friedrich | the Mackensen-class battlecruisers | — |
  | Sikhowie | redirects to Sikhizm (the religion) | — |
  | Bitwa_pod_Łowiczem | the 1656 battle | — |
  | Notre-Dame-de-Lorette | a Paris Métro station (removed from 3 Artois 1914 files) | — |
  | Pilzno | the Czech city Plzeň | Pilzno_(Polska) |
  | Nikołaj_Istomin | a Soviet officer born 1898 | — |
  | John_Smyth | a 17th-century theologian | — |
  | Black_Watch | the modern 3 SCOTS battalion | — |
  | Tłumacz | the translator | Tłumacz_(miasto) |
  | Madżlis / Madżles | the modern Iranian parliament | — |
  | Heinrich_Albert | a 17th-century composer | — |
  | Nieuw_Amsterdam | a town in Suriname | — |
  | Paweł_Ignatiew | a minister born 1797 | — |
  | Mogielnica | the Polish town | — |
  | II_bitwa_w_Szampanii | poor machine-translated stub | link `/bitwy/druga-bitwa-w-szampanii` instead |
  | Jednorożec | the unicorn | Jednorożec_(wieś) |
  | Aleksiej_Czurin | a different Czurin (Wiktorowicz) | — |
  | Okmiany | a Polish village | — |
  | Ishëm | the river | — |
  | Ali_ibn_Husajn | the 4th Shia imam | — |
  | Seistan | redirects to "Wiatr" | Sistan |
  | Guildhall | a Vermont town | — |
  | Bitwa_pod_Krasnymstawem | the 1939 battle | — |
  | Wilkołaz | redirects to Wilkołaz_Pierwszy | — |
  | Bursztyn | amber | Bursztyn_(miasto) |
  | Hruszów | a village near Chełm | — |
  | Wielkie_Błoto | a bog in Lublin province | — |
  | Waterberg | the South African range | — |
  | Augusto_Soares | an East Timorese runner | — |
  | Podgora | a Croatian town | — |
  | John_Maxwell | an American pastor | — |
  | Sikh | redirects to Sikhizm | — |
  | Stawka_Najwyższego_Naczelnego_Dowództwa | the WWII Soviet Stawka | — |
  | Brzuchowice / Szczerzec / Firlejów | other places of the same name | check the subject |

  Inaccurate pages (don't link them): "Kindermord", "I_bitwa_w_Szampanii", "Kryzys_lipcowy" (that is 1917 Petrograd; there is no page on the 1914 July Crisis).
- **Missing pages** (don't link): Horace_Smith-Dorrien, Victor_d'Urbal, Herbert_Plumer (exists as Herbert_Onslow_Plumer), Edwin_Alderson, William_Birdwood, Aylmer_Hunter-Weston, Albert_d'Amade, John_de_Robeck, John_Nixon, Charles_Melliss, Arthur_Barrett, Charles_Dobell, Frederick_Cunliffe, Joseph_Aymerich, Michael_Tighe, Richard_Wapshare, Percy_Cox, Cemal_Pasza, Hans_von_Wangenheim, Otto_von_Lauenstein, Paul_von_Hintze, Süleyman_Askerî, Cevdet_Bey, Aram_Manukian, Wilhelm_Wassmuss, Hasan_Pirnia, Reginald_Bacon, Andriej_Eberhardt.
  Also (May 1915): Victor_d'Urbal (again), Émile_Fayolle, Charles_à_Court_Repington, Charles_Monro, James_Willcocks, Henry_Horne, Cecil_Thursby, Otto_Hersing, Rudolph_Firle, Muavenet-i_Milliye, HMS_Goliath/Triumph/Majestic/Princess_Irene/Queen/London/Implacable, Gaba_Tepe, Isle_of_Grain, Takaaki_Katō, Hioki_Eki, Paul_Reinsch, Joaquim_Pimenta_de_Castro, Álvaro_de_Castro, José_Norton_de_Matos, Machado_Santos, Felix_von_Bothmer, Paul_von_Kneußl, Paul_Puhallo, Arthur_Arz_von_Straussenburg, Karl_von_Plettenberg, Leonid_Lesz, Sándor_Szurmay, Erich_Linnarz, Alfred_Gwynne_Vanderbilt, Old_Head_of_Kinsale, Dywizja_Marokańska, Zuawi (use Żuawi), Grzbiet_Vimy, Bitwa_pod_Festubert, II_bitwa_w_Artois.
  Also (June 1915): Reginald_Warneford, LZ_37, José_de_Castro, Aleksiej_Poliwanow, Siergiej_Miasojedow, Nikołaj_Maklakow, Imperium_Qing, Henry_de_Lisle, Erich_Weber, Hans_Kannengiesser, Royal_Naval_Division, Komitet_Dardanelski, Gully_Ravine, Kereves_Dere, Monte_San_Michele, Monte_Sabotino, I_bitwa_nad_Isonzo, Erwin_Zeidler, Friedrich_von_Gerok, Płaton_Leczycki, Józef_Ferdynand_Habsburg (use Józef_Ferdynand), Korpus_Beskidzki, Talerhof, Victor_Franke, Theodor_Seitz, Coenraad_Brits, Kampania_w_Kamerunie, Ernest_Pretyman, Kontrabanda_wojenna.
  Also: Garua, Krithia/Kritia, Helles, Achi_Baba, Kum_Kale, Sint-Juliaan, Gravenstafel, Frezenberg, Bellewaarde, Wzgórze_60, Léon_Gambetta (cruiser), Dover_Patrol, and most single-battle pages of 1915.
- **Useful existing pages:** II_bitwa_pod_Ypres, Bitwa_o_Gallipoli, Zatoka_Anzac, Sedd_el_Bahr, SS_River_Clyde, Traktat_londyński_(1915), Ludobójstwo_Ormian, Wan_(miasto), Szawle, Jaunde, Limnos (Lemnos), Izmir (Smyrna), Kłajpeda (Memel), Czerniowce, Mehmet_Talaat, İsmail_Enver, Halil_Kut, Mecidiye_(1903), Bombardowanie_Scarborough,_Hartlepool_i_Whitby, Bitwa_nad_Bzurą_(1914), Bitwa_pod_Limanową, Bitwa_nad_Kolubarą, Rada_Państwa_Imperium_Rosyjskiego, Tygodnik_Illustrowany.
- **October 1915 traps:**
  - Disambiguation → use: Sawa → Sawa_(rzeka); Veles → Wełes (and "Weles" is the Slavic god!); Babuna → Babuna_(pasmo); Kosowe_Pole / Kosowo_Pole → Kosowe_Pole_(kotlina); Mitrovica → Mitrowica; Gjakova → Djakowica; Crna_Reka → Crna_Reka_(dopływ_Wardaru); Serres → Seres; Królestwo_Grecji → Królestwo_Grecji_(1832–1924); Wojsko_Królestwa_Serbii → Wojsko_Królestwa_Serbii_(1914); Albert_Thomas → Albert_Thomas_(polityk); Order_Świętego_Jerzego → Order_Świętego_Jerzego_(Imperium_Rosyjskie); Askold → Askold_(1900); Xanthi → Ksanti; Devonport → HMNB_Devonport; Eucharystia → Eucharystia_(sakrament); Związek_Bałkański (missing) → Liga_Bałkańska; Bell_Rock (missing) → Latarnia_morska_Bell_Rock; Anthony_Fokker (missing) → Anton_Fokker; Granat_Millsa → Bomba_Millsa.
  - Disambiguation, no alternative: Konak, Banjica, Kupinovo, Tekija, Banat, Bogdanci, Tikwesz, Lovćen, Medyna, Lansjer, Keith_Murdoch, Marcel_Sembat, Miadzioł, Ober_Ost, Aldwych, Aldgate, Norfolk, West_End, Czerwony_Krzyż, Königsstuhl, HMS_Theseus, Stettin, Tsingtao.
  - Wrong subject: Flotylla_Dunajska (Soviet WWII), Vračar (modern municipality), Synchronizator (gearbox; use Synchronizator_karabinu_maszynowego), Wiszniew (other village), Arkona (Slavic temple), HMS_Triad (1939 sub), Chancery_Lane (metro), Foreign_Office (modern FCO — don't link for 1915), Orșova (Mureș village; Danube town is Orszowa). pl.wiki Aleksandros_Zaimis wrongly says he was premier of "southern Greece" in 1915; pl.wiki Edith_Cavell misdates her "patriotism" words.
  - Missing: Charles_Monro, William_Birdwood, Bryan_Mahon, Maurice_Bailloud, Francis_Elliot, Hugh_O'Beirne, Maurice_Paléologue, Henry_McMahon, Oskar_von_Niedermayer, Mark_Sykes, Kikujirō_Ishii, Mihailo_Živković, Dragutin_Gavrilović, Eugen_von_Falkenhayn, Philippe_Baucq, Brand_Whitlock, Heinrich_Mathy, Percy_Scott, Hugh_Trenchard, Francis_Cromie, Louis_Malvy, Krivolak, Kosturino, Szabac, Alpenkorps, Komitet_Wojenny, Zatoka_Suvla (use Suvla), HMS_Argyll_(1904), Hermann_Kövess_von_Kövessháza (page is …Kövesshaza without accent).
  - Redirects (fine): Niš → Nisz, Imbros → Imroz, Front_macedoński → Front_salonicki, Štip → Sztip, Valandovo → Wałandowo, Ioannis_Metaxas → Joanis_Metaksas, Aleksandretta → İskenderun.
  - Useful: Front_salonicki, Schizma_narodowa, Albańska_Golgota, Bitwa_pod_Kosturino, Twierdza_Smederevo, Umowa_Sykes-Picot, Hugh_Gibson, Moritz_von_Bissing, Peter_Strasser, Royal_Arsenal, Ferdynand_I_Koburg, Arnold_Joseph_Toynbee, Kurt_Wintgens, Nieuport_11, Airco_DH.2.
- **November 1915 traps:**
  - Disambiguation → use: Bitwa_pod_Ktezyfonem (no 1915 page; don't link); SMS_Undine → SMS_Undine_(1902); Charles_Hardinge → Charles_Hardinge_(baron); Kermanszah → Kermanszah_(miasto); Sitnica → Sitnica_(rzeka); Lepenac → Lepenac_(rzeka); Seleucja → Seleucja_nad_Tygrysem; Siwa → Siwa_(oaza); Drachma → Drachma_grecka; Byng → Julian_Byng; Hankey → Maurice_Hankey; Isonzo → Socza (redirect); Senussi → Sanusijja (redirect).
  - Disambiguation, no alternative: Rudnik, Lepenica, Struga, Rugova, Bardija, Benue, Ajas, Arthur_Salter, William_Robertson.
  - Wrong subject: Dijala (province; river is Nahr_Dijala), Muni (ascetic; use Mbini), Monte_Santo (Brazil), Izba_Deputowanych_(Włochy) and Parlament_Grecji (modern), Marka_niemiecka (1871–2001 currency), Thomas_Lodge (poet), Frank_Fay (actor), Kontrabanda (→ Przemyt). Thin/inaccurate (don't link): Ofensywa_kosowska, Kampania_bractwa_sanusijja_w_Egipcie; Albańska_Golgota has errors but is OK for the name.
  - Missing: Horace_Smith-Dorrien, Charles_Townshend, Nikołaj_Baratow, LZ_39, SM_U-38, SS_Ancona, Komitet_Wojenny, Kut_al-Amara, Salman_Pak, Raška_(miasto) (use Raška), Twierdza_Nisz (use Twierdza_w_Niszu), Alpenkorps, Sandżak_Nowopazarski (use Sandżak), Damjan_Popović, Oslavia, Luigi_Capello, Brygada_Sassari, Castel_Dante, Rosslyn_Wemyss, Francis_Elliot, Camille_Barrère, Board_of_Trade, Order_in_Council, Eyre_Crowe, Francis_Cromie, Max_Valentiner, Waldemar_Kophamel, Royal_West_African_Frontier_Force, Archibald_Murray, Guglielmo_Imperiali, Ministerstwo_Amunicji (link `/ministerstwo-amunicji`).
  - Useful: Kazwin, Kragujevac, Nisz, Kačanik, Novi_Pazar, Mitrowica, Prisztina, Prizren, Szkodra, Pociąg_Bałkański, Al-Kut, Ktezyfon, Colmar_von_der_Goltz, Kampania_mezopotamska, As-Sallum, Marsa_Matruh, Sidi_Barrani, SM_U-35, Banyo, Tibati, Dschang, Stefanos_Skuludis, Afonso_Costa, SMS_Undine_(1902), HMHS_Anglia, Bitwy_nad_Isonzo, Portugalski_Korpus_Ekspedycyjny.
- **December 1915 traps:**
  - Disambiguation → use: Bogdanci → Bogdanci_(Macedonia_Północna); Struga/Resen → …_(Macedonia_Północna); Asadabad → Asadabad_(Iran); Lualaba → Lualaba_(rzeka); Afrykańska_królowa → …_(film); SMS_Möwe → SMS_Möwe_(1914); SMS_Helgoland → SMS_Helgoland_(1912); SMS_Novara/Lika/Triglav → …_(1913); Bojana → Buna_(rzeka_w_Albanii); Żyronda → Żyronda_(estuarium); Bitwa_pod_Mons → Bitwa_pod_Mons_(1914); Simla → Shimla; Yunnan → Junnan; Saseno → Sazan; Amara → Al-Amara.
  - Disambiguation, no alternative: Rosoman, Tunel, Rupel, Lekka_kawaleria, Slup, Czarna_lista, Sztab_Generalny, Synaj, Hail, Lone_Pine, Kefalos, Nowik, Cape_Wrath, SMS_Seeadler, HMS_Weymouth, SM_U-15, Ras_al-Ajn.
  - Wrong subject: Najwyższa_Rada_Wojenna (→ Soviet 1918 body), Wielka_Kwatera_Główna (German), Albertville (French town), Meteor, Appam, Wojna_handlowa, Darin (singer; use Tarut), Dżubajl (→ Byblos), Malta (modern state), Metochia (→ Kosowo), Fanshawe, Richard_Butler, Frederick_Maurice, Lacaze. Inaccurate (don't link): Bitwa_pod_Kosturino, Konferencje_w_Chantilly, Cesarstwo_Chińskie_(1915–1916). en.wiki "Senussi campaign" and "Siege of Kut" (Halil 7 XII) unreliable.
  - Missing: William Robertson (general; disambig points to red link), Launcelot_Kiggell, Archibald_Murray, Karl_Boy-Ed, Franz_von_Rintelen, Geoffrey_Spicer-Simson, Graf_von_Götzen, Liemba, HMS_Natal, HMS_Dartmouth, Kosturino, Connaught_Rangers, Fenton_Aylmer, Percy_Lake, Mostowfi_ol-Mamalek, any Farmanfarma page, Alexander_Wallace, Nikola_Ribarow, Kara_Burun, Vittorio_Zupelli, Konferencja_w_Chantilly.
  - Useful: Ghasr-e_Szirin (Qasr-e Shirin), Irańska_Żandarmeria_Rządowa, Abd_al-Aziz_ibn_Su’ud, Nadżd, Tarut, Dżabal_Szammar, Halil_Kut, Czitral, SMS_Bremen, SMS_V_191, SMS_Möwe_(1914), Nikolaus_zu_Dohna-Schlodien, Kordyt, Cromarty_Firth, Kalemie, Lukuga, Kigoma, Lubumbashi, Force_Publique, Monge_(1908), Fresnel_(1908), Quarto_(1911), Anton_Haus, Božo_Petrović-Njegoš, Petar_Bojović, Dimityr_Geszow, Dojran_(miasto), Gewgelija, Demir_Kapija, Półwysep_Chalcydycki, Fosgen, Hrabia_Ypres, Aleksandr_Izwolski, Jules_Cambon, Bitwa_o_Gallipoli.
- **URL syntax:** a URL with parentheses must be written exactly, e.g. `[Sawę](https://pl.wikipedia.org/wiki/Sawa_(rzeka))`. A link inside parentheses: `([Landsturmu](https://pl.wikipedia.org/wiki/Landsturm))`.

## 9. Battle phases currently defined (`src/data/battlePhases.ts`)

| Slug | Front | Dates |
|---|---|---|
| 1914-pierwsze-starcia | Front zachodni | Aug 1914 |
| 1914-wielki-odwrot | Front zachodni | Aug–Sep 1914 |
| 1914-bitwa-nad-marna | Front zachodni | Sep 1914 |
| 1914-nad-aisne-i-wyscig-do-morza | Front zachodni | Sep–Oct 1914 |
| 1914-obrona-antwerpii | Front zachodni | Aug–Oct 1914 |
| 1914-flandria | Front zachodni | Oct–Nov 1914 |
| 1914-zima-na-froncie-zachodnim | Front zachodni | Dec 1914 – Mar 1915 |
| 1915-ypres | Front zachodni | Apr–May 1915 |
| 1915-artois | Front zachodni | May–Jun 1915 (Second Artois, Aubers, Festubert) |
| 1914-pierwsza-inwazja-na-serbie / druga / trzecia | Front bałkański | 1914 |
| 1915-podboj-serbii | Front bałkański | Oct–Dec 1915 (umbrella `podboj-serbii`, `obrona-belgradu`, `bitwa-pod-krivolakiem`; Kačanik 5–21 XI; Kosturino 6–12 XII; Salonika front battles of late 1915 go here) |
| 1914-prusy-wschodnie, 1914-bitwa-galicyjska, 1914-przemysl-san-i-wisla, 1914-lodz-i-krakow (to Jul 1915, includes Rawka–Bzura) | Front wschodni | 1914–1915 |
| 1915-karpaty | Front wschodni | Jan–Apr 1915 |
| 1915-mazury-i-przasnysz | Front wschodni | Feb 1915 |
| 1915-gorlice | Front wschodni | from May 1915 (Gorlice, San, Przemyśl, Stryj, Mościska–Lubaczów, Lwów; use for the summer retreat) |
| 1915-isonzo | Front włoski | from June 1915 (First Isonzo 23 VI – 7 VII, Second Isonzo 18 VII – 3 VIII, Third Isonzo 18 X – 4 XI, Fourth Isonzo 10 XI – 2 XII) |
| 1915-odwrot-rosjan | Front wschodni | from July 1915 (Kraśnik, Krasnystaw, Narew–Biebrza, Przasnysz II, Szawle; use for Warsaw/Iwangród/Nowogeorgijewsk/Kowno/Brześć) |
| 1915-wogezy | Front zachodni | 1915 (Le Linge 20 VII – 16 X) |
| 1915-jesienna-ofensywa | Front zachodni | Sep–Nov 1915 (Loos 25 IX – 8 X, Third Artois 25 IX – 15 X, Second Champagne 25 IX – 6 XI) |
| 1914-daleki-wschod-i-pacyfik | Azja i Pacyfik | 1914 |
| 1914-wojna-na-morzu, 1915-wojna-na-morzu | Wojna na morzu | 1914; from Jan 1915 (First Durrës 29 XII 1915) |
| 1914-afryka | Afryka | Aug 1914 – Jan 1915 |
| 1915-afryka | Afryka | from Feb 1915 (Banyo 4–6 XI 1915; Lake Tanganyika 26 XII 1915 – 9 II 1916; Cameroon, East Africa) |
| 1914-imperium-osmanskie | Bliski Wschód | Nov 1914 – Feb 1915 |
| 1915-dardanele | Bliski Wschód | from Feb 1915 (Gallipoli goes here; `ewakuacja-gallipoli` 18 XII 1915 – 9 I 1916 covers Helles 8/9 I) |
| 1915-bliski-wschod | Bliski Wschód | from Apr 1915 (Mesopotamia, Persia, Caucasus; Ctesiphon 22–25 XI; siege of Kut 7 XII 1915 – 29 IV 1916) |

Always grep `slug:` in the file before using a phase.

## 10. Next steps

1. December 1915 is committed (bab62f1). **Wait for the owner to paste JANUARY 1916.**
2. **January 1916 carry-overs:** pre-placed `1916/01/rosjanie-zajmuja-kangawar.md` (13 I 1916, dayOrder 1 — renumber 13 I, no duplicate). Running battles `ewakuacja-gallipoli` (to 9 I — Helles evacuation 8/9 I goes in it), `oblezenie-al-kutu` (to 29 IV; relief battles Sheikh Sa'ad 6–8 I, Wadi 13 I, Hanna 21 I — consider battle pages), `bitwa-na-jeziorze-tanganika` (to 9 II; Hedwig von Wissmann). Likely items: Montenegro campaign (Lovćen 8–11 I, Cetinje 13 I, capitulation), Military Service Act (conscription), King Edward VII mined (6 I, Möwe's field), Papen's papers at Falmouth, Halazin (23 I, Senussi), Yunnan revolt / Yuan, Kermanshah, Erzurum offensive (Yudenich, from 10 I), Serbian army to Corfu. New year → `src/content/timeline/1916/01/`, battle pages in `src/content/battles/1916/`; new 1916 phases may be needed.
3. Batch number: the next brief is **brief22** (December was brief21; notes in `scratchpad/coord/dec_notes.md` while the session lasts).
4. Offer the open items in section 3.
5. After each batch: update sections 3, 8, 9 and 10 of this file.
6. **Rate limits / stalls:** in November all writers but one hit the account session limit; resuming each with SendMessage after the reset worked. December (16 writers) ran without limits, 6–50 min each. Tell writers to grep and print small ranges and save each file as soon as drafted. The Agent launch can hit a transient "classifier gave no verdict" error — retry one launch, then the rest in smaller batches.
