#!/usr/bin/env python3
"""Which pl.wikipedia pages do we link most, and from where?

Usage: python3 -I scripts/wiki-links-report.py [--top N] [--tsv]

Counts the pl.wikipedia links in the Polish content (timeline articles,
battle pages, person pages, topic guides, country pages; the English files
keep the same targets, so they are not counted twice). For each target:
the number of links, the number of pages linking it, the split by kind of
page, and whether we already have a page of our own for it (a battle page,
the `wikiTitles` of a person page, a guide or a country page, an EVENTS
entry in wiki-to-internal.py, or a glossary term of the same name). Links to a target we already cover are
the ones wiki-to-internal.py keeps for the date rule (workflow.md §4).
"""
import collections, glob, json, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINK = re.compile(r"\]\(https://pl\.wikipedia\.org/wiki/((?:[^()\s#]|\([^()\s]*\))+)(?:#[^)\s]*)?\)")
KINDS = {"timeline": "art", "battles": "bitwy", "postacie": "postacie", "topics": "tematy", "countries": "kraje"}


def front(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    return m.group(1) if m else ""


def ours():
    """pl.wikipedia title -> what we have for it."""
    have = {}
    for f in glob.glob(f"{ROOT}/src/content/battles/*/*.md"):
        t = re.search(r"^title:\s*\"?(.*?)\"?$", front(open(f, encoding="utf-8").read()), re.M)
        if t:
            have[t.group(1).replace(" ", "_")] = "bitwy/" + os.path.basename(f)[:-3]
    for folder, prefix in (("postacie", "postacie"), ("topics", "tematy"), ("countries", "kraje")):
        for f in glob.glob(f"{ROOT}/src/content/{folder}/*.md"):
            m = re.search(r"^wikiTitles:\s*\[(.*)\]", open(f, encoding="utf-8").read(), re.M)
            for t in (m.group(1).split(",") if m else []):
                if t.strip().strip("\"'"):
                    have[t.strip().strip("\"'")] = f"{prefix}/" + os.path.basename(f)[:-3]
    src = open(f"{ROOT}/scripts/wiki-to-internal.py", encoding="utf-8").read()
    for block in ("ALIASES", "EVENTS"):
        body = re.search(rf"^{block} = \{{(.*?)^\}}", src, re.S | re.M).group(1)
        for t, slug in re.findall(r'"([^"]+)":\s*"([^"]+)"', body):
            have[t] = ("bitwy/" if block == "ALIASES" else "") + slug
    for term in json.load(open(f"{ROOT}/src/data/glossary.json", encoding="utf-8")):
        have.setdefault(term["term"].replace(" ", "_"), "slownik/" + term["slug"])
    return have


def main():
    top = int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 50
    links = collections.Counter()
    pages = collections.defaultdict(set)
    by_kind = collections.defaultdict(collections.Counter)
    total_files = 0
    for kind in KINDS:
        for f in glob.glob(f"{ROOT}/src/content/{kind}/**/*.md", recursive=True):
            total_files += 1
            for raw in LINK.findall(open(f, encoding="utf-8").read()):
                title = urllib.parse.unquote(raw)
                links[title] += 1
                pages[title].add(f)
                by_kind[title][KINDS[kind]] += 1
    have = ours()
    n = sum(links.values())
    print(f"{n} pl.wikipedia links to {len(links)} pages, in {total_files} Polish files")
    covered = [t for t in links if t in have]
    print(f"{len(covered)} targets ({sum(links[t] for t in covered)} links) already have a page of ours")
    print(f"top {top}: {sum(c for _, c in links.most_common(top))} links "
          f"({100 * sum(c for _, c in links.most_common(top)) / n:.0f}% of all)\n")
    tsv = "--tsv" in sys.argv
    if not tsv:
        print(f"{'#':>3} {'links':>5} {'pages':>5}  {'target':<48} split / ours")
    for i, (t, c) in enumerate(links.most_common(top), 1):
        split = " ".join(f"{k}:{v}" for k, v in by_kind[t].most_common())
        mark = f"  = {have[t]}" if t in have else ""
        if tsv:
            print(f"{i}\t{c}\t{len(pages[t])}\t{t}\t{split}\t{have.get(t, '')}")
        else:
            print(f"{i:>3} {c:>5} {len(pages[t]):>5}  {t:<48} {split}{mark}")


main()
