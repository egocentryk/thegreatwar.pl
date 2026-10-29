# Brief: the Polish thread, part 2 (timeline articles, Polish + English)

Same rules as `scripts/briefs/society-1.md`: read its "Read first" and
"Timeline articles" sections and follow them exactly (dates verified in
several sources, dayOrder below the existing ones on that day, sources
opened and read with at least 2 not Wikipedia, links only backwards, person
pages any time, English translation, no build, no commit). This batch fills
gaps in the Polish thread: the POW, the Prussian partition, Cieszyn Silesia,
Lithuania, Jews in the Polish lands, and the Ochotnicza Legia Kobiet.
Scratch folders: a scratch folder **outside the repo** (the scratchpad path the coordinator gives you, or `mktemp -d`; never inside the repo) (delete when done).

**Read also:** the guides "Sprawa polska w czasie I wojny światowej" and
"Wojna na ziemiach polskich" (src/content/topics/), and the person pages of
the people involved (`ls src/content/postacie`): Piłsudski, Rydz-Śmigły,
Sosnkowski, Aleksandra Szczerbińska, Korfanty, Trąmpczyński, Seyda,
Moraczewski, Daszyński, Roja, Leon Wasilewski… Link them (`/postacie/<slug>`)
and don't contradict them.

**Duplicates.** Before each row, search titles, summaries and bodies in all
word forms. If the event already has its own article, don't write it again:
report it. Known neighbours to link back to rather than repeat:
`ustawa-o-samorzadzie-miejskim-w-krolestwie-polskim`, `deklaracja-taryby`
(11 XII 1917), `niemcy-zajmuja-wilno`, `polacy-zdobywaja-lwow` (22 XI 1918,
mentions the pogrom in three sentences — the new pogrom article must agree
with it), `sejm-dzielnicowy-w-poznaniu` (3 XII 1918),
`odzyskanie-niepodleglosci-przez-polske` (11 XI 1918, mentions disarming the
Germans), `poczatek-walk-o-lwow`, `niemcy-zajmuja-warszawe`.

**Sensitive topics** (the pogroms, expulsions): sober and precise, as in our
articles; numbers as ranges with attribution; name perpetrators as the
sources do (soldiers, civilians, militia); no euphemism and no exaggeration.

## The batch (dates to verify)

| grp | date | title | slug | category | author |
|---|---|---|---|---|---|
| A | 1914 (verify: founding) | Powstanie Polskiej Organizacji Wojskowej | powstanie-polskiej-organizacji-wojskowej | Wojsko | Łukasz Skowroń |
| A | 1915 (verify) | POW po wkroczeniu Niemców do Warszawy | pow-po-wkroczeniu-niemcow-do-warszawy | Wojsko | Łukasz Skowroń |
| A | 1916-07 (verify) | Wybory do rady miejskiej Warszawy | wybory-do-rady-miejskiej-warszawy | Polityka | Łukasz Skowroń |
| B | 1918-10-25 | Przemówienie Korfantego w Reichstagu | przemowienie-korfantego-w-reichstagu | Polityka | Natalia |
| B | 1918-11 (verify) | Powstanie Naczelnej Rady Ludowej | powstanie-naczelnej-rady-ludowej | Polityka | Natalia |
| B | 1918-11 (verify) | Polacy w radach żołnierskich w Poznaniu | polacy-w-radach-zolnierskich-w-poznaniu | Polityka | Natalia |
| C | 1918-10-19 | Rada Narodowa Księstwa Cieszyńskiego | rada-narodowa-ksiestwa-cieszynskiego | Polityka | Łukasz Skowroń |
| C | 1918-11-05 | Polsko-czeskie porozumienie w sprawie Śląska Cieszyńskiego | porozumienie-w-sprawie-slaska-cieszynskiego | Dyplomacja | Łukasz Skowroń |
| C | 1917-09 (verify: 18–22 IX) | Konferencja wileńska | konferencja-wilenska | Polityka | Łukasz Skowroń |
| C | 1918-02-16 | Akt niepodległości Litwy | akt-niepodleglosci-litwy | Polityka | Łukasz Skowroń |
| D | 1915 (verify) | Rosyjskie wysiedlenia Żydów z pasa przyfrontowego | wysiedlenia-zydow-przez-armie-rosyjska | Społeczeństwo | Natalia |
| D | 1918-11-11 (verify) | Pogrom w Kielcach | pogrom-w-kielcach | Społeczeństwo | Natalia |
| D | 1918-11-22 | Pogrom we Lwowie | pogrom-we-lwowie | Społeczeństwo | Natalia |
| D | 1918-11 (verify) | Ochotnicza Legia Kobiet | ochotnicza-legia-kobiet | Wojsko | Natalia |

Notes per row:
- **POW, 1915:** pick the defining, datable moment after the Russians left
  Warsaw (e.g. the POW coming out of hiding, its battalions joining the
  Legions, or its sabotage before the evacuation); say why.
- **Rada miejska Warszawy:** the first elections under the 1915 law (with
  the curiae and the national lists, Polish and Jewish); link the law's
  article.
- **Naczelna Rada Ludowa / rady żołnierskie:** the NRL formed in November
  1918 out of the Poznań Citizens' Committee; the Sejm Dzielnicowy (3–5 XII)
  then elected its new composition — don't duplicate that article. For the
  soldiers' councils: Poles taking over the Poznań workers' and soldiers'
  councils after 9–11 XI. If research shows the two rows are one event,
  merge them into one article and report it.
- **Konferencja wileńska:** elected the Taryba; `deklaracja-taryby` (11 XII
  1917) comes after it — link forward is not allowed, so mention the
  December declaration only as a look ahead.
- **Pogrom we Lwowie:** 22–24 XI 1918; casualty figures differ widely by
  source and commission (Polish, Jewish, the Morgenthau mission later):
  give them as ranges with attribution. Same day as `polacy-zdobywaja-lwow`:
  give yours a lower dayOrder so you may link it.
- **Ochotnicza Legia Kobiet:** formed in Lwów in November 1918 during the
  fighting for the city (Aleksandra Zagórska); verify the founding date.

## Report (short)

Per file: path, final date (and why, if changed), dayOrder, word count,
sources, conflicts with existing pages (file and what), anything left out.
