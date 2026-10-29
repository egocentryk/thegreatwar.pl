#!/usr/bin/env python3
"""Check a topic guide (src/content/topics/<slug>.md) against its evidence
file (scripts/evidence/topics/<slug>.json).

Usage: python3 -I scripts/checks/topics.py . <slug> [more slugs...]

Evidence format:
{
  "slug": "przyczyny-i-wojny-swiatowej",
  "paragraphs": [
    {"start": "the first ~50 characters of the paragraph, as written",
     "quotes": [
       {"file": "src/content/timeline/1914/07/x.md", "quote": "verbatim from our article"},
       {"url": "https://…", "quote": "verbatim from a page in the guide's sources"}
     ]}
  ]
}

Checks: every paragraph (every block of the body that is not a heading) has an
evidence entry; every quote from our content is found verbatim in its file;
every quoted URL is listed in the guide's `sources:`; every number in a
paragraph appears in one of its quotes; every internal link points to an
existing page (an article, battle, person or another guide); every number in the "W skrócie" points appears in the body.
Web quotes cannot be re-checked offline: they are the writer's record of what
the opened page says.
"""
import glob, json, os, re, sys

def norm(s):
    s = re.sub(r"!?\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)", r"\1", s)  # links -> text
    s = s.replace("*", "").replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip()

NUM = re.compile(r"\d+(?:[ ., ]\d{3})*(?:[.,]\d+)?")
def numbers(s):
    return [re.sub(r"[ ., ]", "", m) for m in NUM.findall(s)]

def split(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    return m.group(1), m.group(2)

def check(repo, slug):
    problems = []
    guide = os.path.join(repo, "src/content/topics", f"{slug}.md")
    ev_path = os.path.join(repo, "scripts/evidence/topics", f"{slug}.json")
    if not os.path.exists(guide) or not os.path.exists(ev_path):
        return [f"missing {guide if not os.path.exists(guide) else ev_path}"]
    fm, body = split(guide)
    sources = re.findall(r'^\s+- "?(https?://[^"\s]+)"?\s*$', fm, re.M)
    brief = re.findall(r'^\s+- "(.*)"\s*$', fm.split("sources:")[0].split("brief:")[-1], re.M) if "brief:" in fm else []
    evidence = json.load(open(ev_path, encoding="utf-8"))["paragraphs"]
    used = set()
    cache = {}

    blocks = [b.strip() for b in re.split(r"\n\s*\n", body) if b.strip() and not b.strip().startswith("#")]
    for i, block in enumerate(blocks):
        text = norm(block)
        tag = f"p{i + 1} «{text[:50]}»"
        match = [j for j, e in enumerate(evidence) if text.startswith(norm(e["start"])[:40])]
        if not match:
            problems.append(f"{tag}: no evidence entry")
            continue
        j = match[0]
        used.add(j)
        qnums = set()
        for q in evidence[j].get("quotes", []):
            qnums.update(numbers(norm(q["quote"])))
            if "file" in q:
                p = os.path.join(repo, q["file"])
                if not os.path.exists(p):
                    problems.append(f"{tag}: no such file {q['file']}")
                    continue
                cache.setdefault(p, norm(open(p, encoding="utf-8").read()))
                if norm(q["quote"]) not in cache[p]:
                    problems.append(f"{tag}: quote not in {q['file']}: {q['quote'][:70]}")
            elif q.get("url") not in sources:
                problems.append(f"{tag}: quoted URL not in sources: {q.get('url')}")
        if not evidence[j].get("quotes"):
            problems.append(f"{tag}: no quotes")
        for n in numbers(text):
            if n not in qnums:
                problems.append(f"{tag}: number {n} not in its quotes")
    for j, e in enumerate(evidence):
        if j not in used:
            problems.append(f"evidence entry not matching any paragraph: «{e['start'][:50]}»")

    pages = {os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/timeline/**/*.md", recursive=True)}
    pages |= {"bitwy/" + os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/battles/*/*.md")}
    pages |= {"postacie/" + os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/postacie/*.md")}
    pages |= {"tematy/" + os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/topics/*.md")}
    for ref in re.findall(r"\]\(/((?:bitwy/|postacie/|tematy/)?[a-z0-9-]+)(?:#[^)]*)?\)", body):
        if ref not in pages:
            problems.append(f"link to a page that doesn't exist: /{ref}")
    if len(sources) < 4:
        problems.append(f"{len(sources)} sources (want at least 4)")
    body_nums = set(numbers(norm(body)))
    for point in brief:
        for n in numbers(point):
            if n not in body_nums:
                problems.append(f"brief number {n} not in the body: {point[:60]}")
    words = len(norm(body).split())
    internal = len(set(re.findall(r"\]\(/[^)]+\)", body)))
    print(f"{slug}: {words} words, {len(blocks)} paragraphs, {len(sources)} sources, {internal} internal links")
    return problems

def main():
    repo, slugs = sys.argv[1], sys.argv[2:]
    total = 0
    for slug in slugs:
        problems = check(repo, slug)
        for p in problems:
            print("  !!", p)
        total += len(problems)
    print(f"{total} problem(s)")
    sys.exit(1 if total else 0)

main()
