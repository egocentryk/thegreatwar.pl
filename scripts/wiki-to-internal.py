#!/usr/bin/env python3
"""Point pl.wikipedia links at our own battle and person pages.

Usage: python3 -I scripts/wiki-to-internal.py [--write] [--only slug,slug]

A link `[text](https://pl.wikipedia.org/wiki/<Title>)` becomes
`[text](/bitwy/<slug>)` when <Title> is one of our battle pages (its title
with underscores, or an alias in ALIASES, where pl.wiki names a campaign
differently), or `[text](/postacie/<slug>)` when <Title> is in a person
page's `wikiTitles`. Timeline articles, battle pages, topic guides and person
pages are edited; the English file of the same page gets the same edit
(English bodies keep the Polish link targets; the build maps them).

The workflow's link rules are kept (workflow.md §4, "Links"):
- battles: only links to earlier content (a timeline article from the
  battle's start date on, a battle page whose own start is on or after the
  target's); guides and person pages are not dated and may link any battle;
- people: no date rule (person pages are reference pages);
- never the page itself, never a timeline article's own `battle`;
- no duplicate: skipped if the file already links the target page.

Without --write it only reports. After --write, re-stamp the English files
it lists: node scripts/i18n-status.mjs --stamp=<english-slug> (one per file).
"""
import glob, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# pl.wikipedia title -> our battle slug, where the titles differ.
ALIASES = {
    "Bitwa_o_Gallipoli": "kampania-gallipolijska",
    "Kampania_mezopotamska": "kampania-mezopotamska",
    "Kampania_synajska_i_palestyńska": "kampania-synajsko-palestynska",
    "Powstanie_arabskie_(1916–1918)": "powstanie-arabskie",
    "Ofensywa_Nivelle’a": "ofensywa-nivellea",
    "Ofensywa_stu_dni": "ofensywa-stu-dni",
    "Bitwy_nad_Isonzo": "bitwy-nad-isonzo",
}

LINK = re.compile(r"\]\((https://pl\.wikipedia\.org/wiki/((?:[^()\s#]|\([^()\s]*\))+))\)")

def front(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    data = {}
    for line in (m.group(1) if m else "").splitlines():
        if line and not line.startswith(" ") and ":" in line:
            k, v = line.split(":", 1)
            data[k.strip()] = v.strip().strip('"')
    return data

def main():
    write = "--write" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))

    battles = {}  # slug -> start date
    targets = {}  # wiki title -> (path prefix, slug)
    for f in glob.glob(f"{ROOT}/src/content/battles/*/*.md"):
        slug = os.path.basename(f)[:-3]
        d = front(open(f, encoding="utf-8").read())
        battles[slug] = d["startDate"]
        targets[d["title"].replace(" ", "_")] = ("bitwy", slug)
    for title, slug in ALIASES.items():
        if slug in battles:
            targets[title] = ("bitwy", slug)
    for f in glob.glob(f"{ROOT}/src/content/postacie/*.md"):
        m = re.search(r"^wikiTitles:\s*\[(.*)\]", open(f, encoding="utf-8").read(), re.M)
        for title in (m.group(1).split(",") if m else []):
            title = title.strip().strip("\"'")
            if title:
                targets[title] = ("postacie", os.path.basename(f)[:-3])
    if only:
        targets = {t: v for t, v in targets.items() if v[1] in only}

    # Polish folder -> English folder.
    EN_DIR = {"timeline": "timeline", "battles": "battles", "topics": "topics", "postacie": "people"}
    en_of = {}
    for f in glob.glob(f"{ROOT}/src/content/en/*/*.md"):
        src = front(open(f, encoding="utf-8").read()).get("source")
        if src:
            en_of[(f.split("/")[-2], src)] = f

    changed, skipped = [], []
    files = (
        glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True)
        + glob.glob(f"{ROOT}/src/content/battles/*/*.md")
        + glob.glob(f"{ROOT}/src/content/topics/*.md")
        + glob.glob(f"{ROOT}/src/content/postacie/*.md")
    )
    for f in sorted(files):
        text = open(f, encoding="utf-8").read()
        d = front(text)
        slug = os.path.basename(f)[:-3]
        kind = f.split("/src/content/")[1].split("/")[0]
        when = d.get("startDate") if kind == "battles" else d.get("date") if kind == "timeline" else None
        edits = []
        for url, raw in LINK.findall(text):
            title = urllib.parse.unquote(raw)
            if title not in targets:
                continue
            prefix, target = targets[title]
            why = None
            own = {"battles": "bitwy", "postacie": "postacie"}.get(kind)
            if own == prefix and target == slug:
                why = "own page"
            elif prefix == "bitwy" and kind == "timeline" and d.get("battle") == target:
                why = "the article's own battle"
            elif f"](/{prefix}/{target})" in text:
                why = "already linked"
            elif prefix == "bitwy" and when and when < battles[target]:
                why = f"dated {when}, before the battle ({battles[target]})"
            if why:
                skipped.append((os.path.relpath(f, ROOT), target, why))
            elif (url, prefix, target) not in edits:
                edits.append((url, prefix, target))
        if not edits:
            continue
        en_path = en_of.get((EN_DIR[kind], slug))
        en_text = open(en_path, encoding="utf-8").read() if en_path else None
        for url, prefix, target in edits:
            text = text.replace(f"]({url})", f"](/{prefix}/{target})", 1)
            if en_text is not None:
                if f"]({url})" not in en_text:
                    sys.exit(f"{en_path}: link {url} missing in English; fix by hand first")
                en_text = en_text.replace(f"]({url})", f"](/{prefix}/{target})", 1)
        changed.append((os.path.relpath(f, ROOT), en_path and os.path.relpath(en_path, ROOT), [t for _, _, t in edits]))
        if write:
            open(f, "w", encoding="utf-8").write(text)
            if en_text is not None:
                open(en_path, "w", encoding="utf-8").write(en_text)

    for pl, en, ts in changed:
        print(f"{'edit' if write else 'would edit'} {pl} -> {', '.join(ts)}  (en: {en or 'none'})")
    for path, target, why in skipped:
        print(f"skip {path} -> {target}: {why}")
    print(f"{len(changed)} file(s) {'edited' if write else 'to edit'}, {len(skipped)} link(s) kept")

main()
