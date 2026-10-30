#!/usr/bin/env python3
"""Check new glossary terms and merge them into src/data/glossary.json.

Usage: python3 -I scripts/checks/glossary.py . scripts/evidence/glossary/<group>.json [more…] [--merge]

Each evidence file is a JSON list of entries in the glossary.json format
(slug, slugEn, term, termEn, category, pattern, patternEn, expansion,
expansionEn, short, shortEn, long, longEn, see, sources, optional exclude).

Checks per entry:
- every field present; slug and slugEn unique (also against glossary.json);
  category one of the seven;
- short / shortEn 120–220 characters; long / longEn exactly 2 paragraphs,
  600–1,150 characters together;
- 2–6 sources, at least one not on wikipedia.org, no duplicates;
- `see`: 1–6 refs that exist (a timeline slug, bitwy/, postacie/, tematy/);
  the pattern matches the main page (see[0]) unless it is a person or guide;
- both patterns compile (also as JavaScript `u` regexes: no escapes of
  ordinary characters); the Polish one matches at least 3 Polish pages
  and the English one at least 3 English pages (articles, battles, people;
  the main page and `exclude` not counted).
It prints, per entry, the page counts and three sample matches with context,
to spot false positives. With --merge (and 0 problems) the entries are added
to glossary.json (indent 1, the file's order kept, new entries appended).
"""
import glob, json, os, re, sys

ROOT = sys.argv[1]
MERGE = "--merge" in sys.argv
FILES = [a for a in sys.argv[2:] if a != "--merge"]
CATS = {"sprawa-polska", "wojsko", "bron", "morze", "polityka", "rewolucja", "okupacja"}
FIELDS = ["slug", "slugEn", "term", "termEn", "category", "pattern", "patternEn", "expansion",
          "expansionEn", "short", "shortEn", "long", "longEn", "see", "sources"]

def body(path):
    t = open(path, encoding="utf-8").read()
    m = re.match(r"---\n.*?\n---\n(.*)", t, re.S)
    return re.sub(r"\]\([^)]*\)", "]", m.group(1) if m else t)

def source_of(path):
    m = re.search(r"^source:\s*(\S+)", open(path, encoding="utf-8").read(), re.M)
    return m and m.group(1)

# ref -> body, per language
pl, en = {}, {}
for f in glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True):
    pl[os.path.basename(f)[:-3]] = body(f)
for f in glob.glob(f"{ROOT}/src/content/battles/*/*.md"):
    pl["bitwy/" + os.path.basename(f)[:-3]] = body(f)
for f in glob.glob(f"{ROOT}/src/content/postacie/*.md"):
    pl["postacie/" + os.path.basename(f)[:-3]] = body(f)
for kind, prefix in (("timeline", ""), ("battles", "bitwy/"), ("people", "postacie/")):
    for f in glob.glob(f"{ROOT}/src/content/en/{kind}/*.md"):
        en[prefix + source_of(f)] = body(f)
topics = {"tematy/" + os.path.basename(f)[:-3] for f in glob.glob(f"{ROOT}/src/content/topics/*.md")}

existing = json.load(open(f"{ROOT}/src/data/glossary.json", encoding="utf-8"))
taken = {e["slug"] for e in existing} | {e["slugEn"] for e in existing}

problems = 0
def bad(slug, msg):
    global problems
    problems += 1
    print(f"  ! {slug}: {msg}")

new = []
for path in FILES:
    for e in json.load(open(path, encoding="utf-8")):
        s = e.get("slug", "?")
        print(f"{s} ({e.get('term')})")
        for k in FIELDS:
            if k not in e:
                bad(s, f"missing {k}")
        if any(k not in e for k in FIELDS):
            continue
        for v in {e["slug"], e["slugEn"]}:
            if v in taken:
                bad(s, f"slug {v} already used")
        taken |= {e["slug"], e["slugEn"]}
        if e["category"] not in CATS:
            bad(s, f"category {e['category']}")
        for k in ("short", "shortEn"):
            if not 120 <= len(e[k]) <= 220:
                bad(s, f"{k} {len(e[k])} chars (120–220)")
        for k in ("long", "longEn"):
            n = len(" ".join(e[k]))
            if len(e[k]) != 2 or not 600 <= n <= 1150:
                bad(s, f"{k}: {len(e[k])} paragraphs, {n} chars (2, 600–1150)")
        src = e["sources"]
        if not 2 <= len(src) <= 6 or len(set(src)) != len(src):
            bad(s, f"{len(src)} sources (2–6, no duplicates)")
        if all("wikipedia.org" in u for u in src):
            bad(s, "all sources are Wikipedia")
        if not 1 <= len(e["see"]) <= 6:
            bad(s, f"{len(e['see'])} see refs (1–6)")
        for ref in e["see"]:
            if ref not in pl and ref not in topics:
                bad(s, f"see: no page {ref}")
        for k in ("pattern", "patternEn"):
            # JavaScript's u flag rejects escapes of ordinary characters (\")
            m = re.search(r"\\([^dDwWsSbBpPnrtfvu0-9\\^$.*+?()[\]{}|/-])", e[k])
            if m:
                bad(s, f"{k}: escape \\{m.group(1)} is invalid in JavaScript")
        try:
            rp, re_en = re.compile(e["pattern"]), re.compile(e["patternEn"])
        except re.error as err:
            bad(s, f"pattern: {err}")
            continue
        main = e["see"][0] if e["see"] else None
        if main in pl and not main.startswith("postacie/") and not rp.search(pl[main]):
            bad(s, f"pattern doesn't match its main page {main}")
        skip = set(e.get("exclude", [])) | {main}
        for lang, pages, r in (("pl", pl, rp), ("en", en, re_en)):
            hits = [(ref, m) for ref, b in pages.items() if ref not in skip for m in [r.search(b)] if m]
            print(f"    {lang}: {len(hits)} pages")
            for ref, m in hits[:: max(1, len(hits) // 3)][:3]:
                ctx = pages[ref][max(0, m.start() - 40): m.end() + 40].replace("\n", " ")
                print(f"      {ref}: …{ctx}…")
            if len(hits) < 3:
                bad(s, f"{lang} pattern matches only {len(hits)} pages")
        new.append({k: e[k] for k in FIELDS + (["exclude"] if "exclude" in e else [])})

print(f"{len(new)} entries, {problems} problem(s)")
if MERGE:
    if problems:
        sys.exit("not merged: fix the problems first")
    with open(f"{ROOT}/src/data/glossary.json", "w", encoding="utf-8") as f:
        json.dump(existing + new, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"merged: glossary.json now has {len(existing) + len(new)} terms")
