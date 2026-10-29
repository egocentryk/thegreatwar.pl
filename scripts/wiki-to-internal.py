#!/usr/bin/env python3
"""Point pl.wikipedia links at our own battle pages where we have one.

Usage: python3 -I scripts/wiki-to-internal.py [--write] [--only slug,slug]

A link `[text](https://pl.wikipedia.org/wiki/<Title>)` becomes
`[text](/bitwy/<slug>)` when <Title> is one of our battle pages: its title
with underscores, or an alias in ALIASES (pl.wiki names a campaign
differently). The English file of the same article gets the same edit
(English bodies keep the Polish link targets; the build maps them).

The workflow's link rules are kept (workflow.md §4, "Links"):
- only links to earlier content: a timeline article from the battle's start
  date on, a battle page whose own start is on or after the target's;
- never the page itself, never a timeline article's own `battle`;
- no duplicate: skipped if the file already links /bitwy/<slug>.

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
    targets = {}  # wiki title -> slug
    for f in glob.glob(f"{ROOT}/src/content/battles/*/*.md"):
        slug = os.path.basename(f)[:-3]
        d = front(open(f, encoding="utf-8").read())
        battles[slug] = d["startDate"]
        targets[d["title"].replace(" ", "_")] = slug
    for title, slug in ALIASES.items():
        if slug in battles:
            targets[title] = slug
    if only:
        targets = {t: s for t, s in targets.items() if s in only}

    en_of = {}
    for f in glob.glob(f"{ROOT}/src/content/en/*/*.md"):
        src = front(open(f, encoding="utf-8").read()).get("source")
        if src:
            en_of[(f.split("/")[-2], src)] = f

    changed, skipped = [], []
    files = glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True) + glob.glob(
        f"{ROOT}/src/content/battles/*/*.md"
    )
    for f in sorted(files):
        text = open(f, encoding="utf-8").read()
        d = front(text)
        slug = os.path.basename(f)[:-3]
        is_battle = "/battles/" in f
        when = d.get("startDate") if is_battle else d.get("date")
        edits = []
        for url, raw in LINK.findall(text):
            title = urllib.parse.unquote(raw)
            target = targets.get(title)
            if not target:
                continue
            why = None
            if is_battle and target == slug:
                why = "own page"
            elif not is_battle and d.get("battle") == target:
                why = "the article's own battle"
            elif f"](/bitwy/{target})" in text:
                why = "already linked"
            elif when < battles[target]:
                why = f"dated {when}, before the battle ({battles[target]})"
            if why:
                skipped.append((os.path.relpath(f, ROOT), target, why))
            else:
                edits.append((url, target))
        if not edits:
            continue
        en_path = en_of.get(("battles" if is_battle else "timeline", slug))
        en_text = open(en_path, encoding="utf-8").read() if en_path else None
        for url, target in edits:
            text = text.replace(f"]({url})", f"](/bitwy/{target})", 1)
            if en_text is not None:
                if f"]({url})" not in en_text:
                    sys.exit(f"{en_path}: link {url} missing in English; fix by hand first")
                en_text = en_text.replace(f"]({url})", f"](/bitwy/{target})", 1)
        changed.append((os.path.relpath(f, ROOT), en_path and os.path.relpath(en_path, ROOT), [t for _, t in edits]))
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
