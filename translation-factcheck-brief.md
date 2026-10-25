# Brief: fact-check and fix suspected source errors (thegreatwar.pl)

Repo: /Users/lukaszskowron/Code/astro/thegreatwar.pl — a Polish WWI chronicle with an English edition in src/content/en/{timeline,battles,people}. Each English file has `source: <polish-slug>` pointing at the Polish file (src/content/timeline/YYYY/MM/<slug>.md, src/content/battles/YYYY/<slug>.md, src/content/postacie/<slug>.md).

Translators flagged suspected errors in the Polish sources. The site owner asked: "correct facts along the way". Your job:

1. Read every report file given to you (sections "Suspected source errors").
2. For each item, verify with the web (WebSearch / WebFetch; prefer en.wikipedia, pl.wikipedia, Britannica, official histories, firstworldwar.com, historyofwar.org). Use your own knowledge only for trivial typos/grammar.
3. Decide:
   - **Fix** when the Polish is clearly wrong (wrong date, number, rank, name, spelling, contradiction with the article's own linked facts) or a plain typo/grammar slip.
   - **Leave** when sources disagree, the claim is defensible, it is a deliberate choice of the article, or you cannot verify it. Never "fix" on a guess.
4. To fix: edit the Polish file minimally (Polish language, keep style, keep every link target byte for byte, keep front-matter fields; if you change `summary`, keep it ≤160 chars). Then make the same correction in the English counterpart (find it with `grep -l "^source: <slug>$" src/content/en/*/*.md`), British English, links unchanged. Use exact string replacement (Python or the Edit tool), not broad sed.
5. Do NOT stamp hashes, build or commit. Do not touch files unrelated to the reported items.
6. Write a log to the output file given to you, one line per item: `FIXED|LEFT — polish-slug — what — why (source URL)`.

Your final message must be ONE line: "<label>: F fixed, L left (see log)".
