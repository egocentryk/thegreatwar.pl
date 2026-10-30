#!/usr/bin/env python3
"""Check "Głosy z frontu" entries and merge them into src/data/voices.json.

Usage: python3 -I scripts/checks/voices.py . scripts/evidence/voices/<group>.json [more…] [--merge]

Each evidence file is a JSON list of voices (format in scripts/briefs/voices.md).
Checks per voice:
- every field present (`person` optional); `id` unique, lowercase ASCII,
  also against voices.json; `kind` one of the seven;
- `article` is an existing timeline article; `date` within 10 days of the
  article's date (14 for orders, letters and proclamations); at most 2
  voices per article;
- `person`, when given, is an existing person page;
- `died` is 1955 or earlier (public domain: 70 years after death), or
  `died` is null and `licence` says how the rights holders freed the text;
- `pl` 15–70 words, `en` present; `original` present; when `originalLang`
  is pl or en, the text in that language matches `original` up to
  punctuation, case and spelling of single letters (modernised spelling);
- `source` is an https URL and not Wikipedia (Wikisource is fine);
- no links in the quotes.
The source text itself can't be re-read offline: `original` is the writer's
record of what the opened page says.
With --merge (and 0 problems) the entries are added to src/data/voices.json,
sorted by date (indent 1).
"""
import difflib, glob, json, os, re, sys

ROOT = sys.argv[1]
MERGE = "--merge" in sys.argv
FILES = [a for a in sys.argv[2:] if a != "--merge"]
KINDS = {"dziennik", "list", "wspomnienia", "przemówienie", "rozkaz", "odezwa", "relacja"}
FIELDS = ["id", "article", "date", "author", "role", "roleEn", "kind", "pl", "en",
          "originalLang", "original", "source", "sourceTitle", "died", "why"]
OUT = os.path.join(ROOT, "src/data/voices.json")

dates = {}
for f in glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True):
    m = re.search(r"^date:\s*(\S+)", open(f, encoding="utf-8").read(), re.M)
    dates[os.path.basename(f)[:-3]] = m.group(1) if m else None
people = {os.path.basename(f)[:-3] for f in glob.glob(f"{ROOT}/src/content/postacie/*.md")}
existing = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else []
taken = {v["id"] for v in existing}
per_article = {}
for v in existing:
    per_article[v["article"]] = per_article.get(v["article"], 0) + 1

def days(a, b):
    from datetime import date
    return abs((date.fromisoformat(a) - date.fromisoformat(b)).days)

def letters(s):
    return re.sub(r"[^\w]", "", s.lower())

problems = 0
def bad(vid, msg):
    global problems
    problems += 1
    print(f"  ! {vid}: {msg}")

new = []
for path in FILES:
    for v in json.load(open(path, encoding="utf-8")):
        vid = v.get("id", "?")
        print(f"{vid} ({v.get('author')}, {v.get('date')})")
        missing = [k for k in FIELDS if not v.get(k) and v.get(k) != 0 and not (k == "died" and v.get("licence"))]
        if missing:
            bad(vid, f"missing {', '.join(missing)}")
            continue
        if not re.fullmatch(r"[a-z0-9-]+", vid):
            bad(vid, "id must be lowercase ASCII with hyphens")
        if vid in taken:
            bad(vid, "id already used")
        taken.add(vid)
        if v["kind"] not in KINDS:
            bad(vid, f"kind {v['kind']}")
        art = v["article"]
        if art not in dates:
            bad(vid, f"no article {art}")
        else:
            per_article[art] = per_article.get(art, 0) + 1
            if per_article[art] > 2:
                bad(vid, f"more than 2 voices for {art}")
            try:
                # Orders, letters and proclamations often come a week or two
                # after the event they answer.
                limit = 14 if v["kind"] in ("rozkaz", "list", "odezwa") else 10
                if days(v["date"], dates[art]) > limit:
                    bad(vid, f"date {v['date']} more than {limit} days from the article ({dates[art]})")
            except ValueError:
                bad(vid, f"bad date {v['date']}")
        if v.get("person") and v["person"] not in people:
            bad(vid, f"no person page {v['person']}")
        # A text released by its rights holders (e.g. PD-heirs on Commons)
        # gives its `licence` instead of the author's death year.
        if v.get("licence"):
            if v["died"] is not None and (not isinstance(v["died"], int) or v["died"] > 1955):
                bad(vid, f"author died {v['died']}")
        elif not isinstance(v["died"], int) or v["died"] > 1955:
            bad(vid, f"author died {v['died']}: not certainly public domain")
        n = len(v["pl"].split())
        if not 15 <= n <= 70:
            bad(vid, f"pl quote {n} words (15–70)")
        for k in ("pl", "en", "original"):
            if "](" in v[k] or "http" in v[k]:
                bad(vid, f"link in {k}")
        lang = v["originalLang"]
        if lang in ("pl", "en"):
            ratio = difflib.SequenceMatcher(None, letters(v[lang]), letters(v["original"]), autojunk=False).ratio()
            if ratio < 0.9:
                bad(vid, f"{lang} text differs from original ({ratio:.2f}); it should be the same quote")
        src = v["source"]
        if not src.startswith("https://") and not src.startswith("http://"):
            bad(vid, f"source not a URL: {src}")
        if "wikipedia.org" in src:
            bad(vid, "Wikipedia is not a source for a voice")
        print(f"    {v['kind']}, {v['originalLang']}, {n} words, died {v['died']} -> {art}")
        new.append(v)

print(f"{len(new)} voices, {problems} problem(s)")
if MERGE:
    if problems:
        sys.exit("not merged: fix the problems first")
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(sorted(existing + new, key=lambda v: (v["date"], v["id"])), f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"merged: voices.json now has {len(existing) + len(new)} voices")
