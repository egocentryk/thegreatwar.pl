#!/usr/bin/env python3
"""Check a topic guide (src/content/topics/<slug>.md) against its evidence
file (scripts/evidence/topics/<slug>.json).

Usage: python3 -I scripts/checks/topics.py . <slug> [more slugs...]
       python3 -I scripts/checks/topics.py . --countries <slug> [more...]
       (country pages: src/content/countries/<slug>.md against
       scripts/evidence/countries/<slug>.json, the same format and checks,
       plus at least 2 sources outside Wikipedia)
       python3 -I scripts/checks/topics.py . --places <slug> [more...]
       (place pages: src/content/places/<slug>.md against
       scripts/evidence/places/<slug>.json; also 2 sources outside
       Wikipedia, 400–900 words, 5+ links to our own pages, and the copy
       check below)

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

Copy check (place pages): the plain text of the pl.wikipedia article of each
`wikiTitles` entry is fetched (cached in $TMPDIR/tgw-wiki) and every run of
8 or more words shared with the page, in the same order, is a problem. Our
pages are our own writing: a shared run means a sentence was taken over.
"""
import glob, hashlib, json, os, re, sys, tempfile, urllib.parse, urllib.request

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

SHINGLE = 8

def words_of(s):
    return re.findall(r"[0-9a-ząćęłńóśźżäöüéèàç]+", norm(s).lower())

def wiki_text(title):
    cache = os.path.join(tempfile.gettempdir(), "tgw-wiki")
    os.makedirs(cache, exist_ok=True)
    path = os.path.join(cache, hashlib.sha1(title.encode()).hexdigest() + ".txt")
    if not os.path.exists(path):
        url = "https://pl.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
            {"action": "query", "prop": "extracts", "explaintext": 1, "redirects": 1,
             "titles": title.replace("_", " "), "format": "json"})
        req = urllib.request.Request(url, headers={"User-Agent": "thegreatwar-checks/1.0"})
        data = json.load(urllib.request.urlopen(req, timeout=30))
        page = next(iter(data["query"]["pages"].values()))
        if "extract" not in page:
            raise LookupError(f"no pl.wikipedia article {title}")
        open(path, "w", encoding="utf-8").write(page["extract"])
    return open(path, encoding="utf-8").read()

def copied_runs(body, title):
    """Runs of SHINGLE+ words shared with the pl.wikipedia article, in order."""
    wiki = words_of(wiki_text(title))
    seen = {tuple(wiki[i:i + SHINGLE]) for i in range(len(wiki) - SHINGLE + 1)}
    ours = words_of(body)
    hit = [tuple(ours[i:i + SHINGLE]) in seen for i in range(len(ours) - SHINGLE + 1)]
    runs, i = [], 0
    while i < len(hit):
        if hit[i]:
            j = i
            while j + 1 < len(hit) and hit[j + 1]:
                j += 1
            runs.append(" ".join(ours[i:j + SHINGLE]))
            i = j + 1
        else:
            i += 1
    return runs

def check(repo, slug):
    problems = []
    guide = os.path.join(repo, "src/content", KIND, f"{slug}.md")
    ev_path = os.path.join(repo, "scripts/evidence", KIND, f"{slug}.json")
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
    pages |= {"kraje/" + os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/countries/*.md")}
    pages |= {"miejsca/" + os.path.basename(f)[:-3] for f in glob.glob(f"{repo}/src/content/places/*.md")}
    for ref in re.findall(r"\]\(/((?:bitwy/|postacie/|tematy/|kraje/|miejsca/)?[a-z0-9-]+)(?:#[^)]*)?\)", body):
        if ref not in pages:
            problems.append(f"link to a page that doesn't exist: /{ref}")
    if len(sources) < 4:
        problems.append(f"{len(sources)} sources (want at least 4)")
    if KIND in ("countries", "places") and sum("wikipedia.org" not in u for u in sources) < 2:
        problems.append("fewer than 2 sources outside Wikipedia")
    body_nums = set(numbers(norm(body)))
    for point in brief:
        for n in numbers(point):
            if n not in body_nums:
                problems.append(f"brief number {n} not in the body: {point[:60]}")
    words = len(norm(body).split())
    internal = len(set(re.findall(r"\]\(/[^)]+\)", body)))
    if KIND == "places":
        if not 400 <= words <= 900:
            problems.append(f"{words} words (want 400–900)")
        if internal < 5:
            problems.append(f"{internal} links to our own pages (want at least 5)")
        m = re.search(r"^wikiTitles:\s*\[(.*)\]", fm, re.M)
        titles = [t.strip().strip("\"'") for t in (m.group(1).split(",") if m else []) if t.strip()]
        if not titles:
            problems.append("no wikiTitles")
        for title in titles:
            try:
                for run in copied_runs(body, title):
                    problems.append(f"copied from pl.wikipedia {title}: «{run[:120]}»")
            except Exception as e:
                problems.append(f"copy check failed for {title}: {e}")
    print(f"{slug}: {words} words, {len(blocks)} paragraphs, {len(sources)} sources, {internal} internal links")
    return problems

KIND = "topics"

def main():
    global KIND
    repo, slugs = sys.argv[1], sys.argv[2:]
    if slugs and slugs[0] in ("--countries", "--places"):
        KIND, slugs = slugs[0][2:], slugs[1:]
    total = 0
    for slug in slugs:
        problems = check(repo, slug)
        for p in problems:
            print("  !!", p)
        total += len(problems)
    print(f"{total} problem(s)")
    sys.exit(1 if total else 0)

main()
