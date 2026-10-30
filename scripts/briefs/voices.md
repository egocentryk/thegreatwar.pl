# Brief: "Głosy z frontu" (first-hand quotes), by batches

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl, a Polish chronicle of
the First World War with a complete English edition. "Głosy z frontu" are
short first-hand quotes (a diary, a letter, a memoir, a speech, an order)
attached to our dated articles: a box under the article text and a list
page `/glosy` (`/en/voices`). The pilot (12 voices for August 1914, in
`src/data/voices.json`) was accepted; read it as the model. The site now
adds voices batch by batch: first one voice for most **key articles**
(`milestone: true`), plus voices for the Polish thread and the other
fronts. Quality and variety matter more than numbers: an article without a
good voice gets none. You find the voices of your group (the coordinator's
prompt gives the period and the group). Scratch files go in the scratch folder the coordinator gives you,
**outside the repo**. Write only your evidence file; don't edit anything
else, don't run the build, don't commit, never touch `../thesecondwar.pl`.

## What a good voice is

- **First-hand and of the moment:** written or spoken by someone who was
  there, at the time (a diary entry, a letter, an order of the day, a
  speech) or in a memoir about that day. Prefer the moment over memory.
- **Short and telling:** 1–4 sentences (in Polish 15–70 words) that make the
  reader feel the day: what people saw, feared, hoped. Not a summary of
  events our article already gives.
- **Public domain, beyond doubt:** the author died **in 1955 or earlier**
  (70 years after death; for the pilot we only take what is certainly
  free). Official documents of the time (orders, proclamations) are fine.
- **Verbatim from a text you opened and read:** a digitised book or
  document (Polona, archive.org, Project Gutenberg, Wikisource,
  firstworldwar.com primary documents, national digital libraries such as
  Gallica if it loads). **Never from memory, a search snippet or a
  quotation site.** Wikipedia is not a source for a voice.
- **Originals, not old translations:** quote the text in the language it
  was written in. A period translation (e.g. a 1920 English edition of a
  German memoir) has its own copyright. Use it only if the translator is
  named and died in 1955 or earlier, or is not named at all and the
  translation was published in 1955 or earlier (an anonymous work is
  protected 70 years from publication); say which in `why`.
- **Not invented attributions:** famous lines often circulate with the
  wrong author or date. If you can't find it in the original text, drop it.

## The data: one entry per voice

```json
{
  "id": "pilsudski-kadrowka-1914",          // author-subject-year, lowercase ASCII
  "article": "<timeline slug>",              // an existing article of August 1914
  "date": "1914-08-06",                     // when the words were written or spoken (memoir: the day it describes)
  "author": "Józef Piłsudski",
  "person": "jozef-pilsudski",               // `ls src/content/postacie`; omit if no page
  "role": "komendant 1 Kompanii Kadrowej",   // Polish, as at the time
  "roleEn": "commander of the First Cadre Company",
  "kind": "rozkaz",                          // dziennik | list | wspomnienia | przemówienie | rozkaz | odezwa | relacja
  "pl": "Polish text of the quote",
  "en": "English text of the quote",
  "originalLang": "pl",                      // pl | en | fr | de | ru | …
  "original": "the quote exactly as printed in the source, in its language",
  "source": "https://… the page or scan you read",
  "sourceTitle": "Author, Title, place year, p. 12",
  "died": 1935,                              // the author's year of death; never guess it
  // or "died": null with "licence": "…" when the rights holders freed the text
  // (e.g. "PD-heirs on Wikimedia Commons: <file URL>")
  "why": "one sentence for the owner: why this voice"
}
```

- `original` is the evidence: copy it **exactly** from the source (keep the
  old spelling). If the source is Polish, `pl` is the same text (you may
  modernise spelling only, and say so in `why`); if English, `en` is the
  same text. Otherwise translate into both, faithfully, without improving.
- `role`: only what the source (or our person page) says; never from
  memory. If the words are someone else's, reported by the author
  (an ambassador noting a minister's words), say so in `role`.
- `date` may be up to 10 days from the article's date, 14 for an order, a
  letter or a proclamation.
- The same author may appear more than once.
- `article`: the article whose day and subject the voice belongs to. At
  most 2 voices per article (count the voices already in
  `src/data/voices.json`). Read the article; the voice must not contradict
  it, and should add something it doesn't say.
- No links inside the quotes.

## Groups

The coordinator's prompt gives your period and group (for example "W:
Western Front key articles", "E: the East, the Polish lands and the
Balkans"). For key articles: `grep -l "milestone: true"` in the month
folders of your period. Polish sources: Polona (polona.pl), the regional
digital libraries, Wikisource pl; Legion diaries and memoirs printed
1914–1918 are the richest seam (check each author's death year). Spread the
voices over the period and over nations; at least one woman's voice per
group where the sources allow.

## Output and check

Write a JSON list of your entries (UTF-8, `ensure_ascii=False`, indent 1)
to `scripts/evidence/voices/<batch>-<group>.json` (e.g. `b1-W.json`). Run

    python3 -I scripts/checks/voices.py . scripts/evidence/voices/<group>.json

until it ends with `0 problem(s)`.

## Report (short)

A table: id, date, author (died), article, kind, first words of the quote,
source. Then: voices you rejected and why (wrong attribution, copyright,
couldn't find the original), and anything in our articles your sources
contradict (file + what).
