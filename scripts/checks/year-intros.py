#!/usr/bin/env python3
"""Check a year-intro draft: every sentence backed by verbatim quotes, every
number in a sentence present in one of its quotes.

Usage: python3 -I scripts/checks/year-intros.py . scripts/evidence/year-intros/1916.json [more...]
       python3 -I scripts/checks/year-intros.py . --build src/data/year-intros.json scripts/evidence/year-intros/19*.json

Draft format (one year per file, e.g. 1916.json):
{
  "year": 1916,
  "pl": [  # paragraphs
    [ {"text": "Zdanie.", "quotes": [{"file": "src/content/timeline/1916/02/x.md", "quote": "..."}]}, ... ],
  ],
  "en": [ ... same, quotes from src/content/en/timeline/*.md ... ]
}
"""
import json, re, sys, os

def norm(s):
    s = re.sub(r"!?\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)", r"\1", s)  # markdown links -> text
    s = s.replace("*", "").replace(" ", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def body(path):
    text = open(path, encoding="utf-8").read()
    # keep front matter too (title/summary are fair game), but unquote YAML
    return norm(text)

NUM = re.compile(r"\d+(?:[ ., ]\d{3})*(?:[.,]\d+)?")

def numbers(s):
    out = []
    for m in NUM.findall(s):
        out.append(re.sub(r"[ ., ]", "", m))
    return out

def check(repo, draft):
    d = json.load(open(draft, encoding="utf-8"))
    year = str(d["year"])
    problems = []
    cache = {}
    for lang in ("pl", "en"):
        paras = d.get(lang) or []
        if not paras:
            problems.append(f"{lang}: no paragraphs")
        words = 0
        for pi, para in enumerate(paras):
            for si, sent in enumerate(para):
                text = sent["text"]
                words += len(text.split())
                quotes = sent.get("quotes") or []
                if not quotes:
                    problems.append(f"{lang} p{pi+1}s{si+1}: no quotes: {text[:70]}")
                    continue
                qnums = set()
                for q in quotes:
                    f = q["file"]
                    want = "src/content/en/" if lang == "en" else "src/content/timeline/"
                    if not (f.startswith(want) or (lang == "pl" and f.startswith("src/content/battles/"))):
                        problems.append(f"{lang} p{pi+1}s{si+1}: quote from wrong collection: {f}")
                    p = os.path.join(repo, f)
                    if not os.path.exists(p):
                        problems.append(f"{lang} p{pi+1}s{si+1}: missing file {f}")
                        continue
                    if p not in cache:
                        cache[p] = body(p)
                    if norm(q["quote"]) not in cache[p]:
                        problems.append(f"{lang} p{pi+1}s{si+1}: quote not found in {f}: {q['quote'][:80]}")
                    qnums.update(numbers(norm(q["quote"])))
                for n in numbers(text):
                    if n == year or n in qnums:
                        continue
                    # "1 lipca 1916" style: allow the year number from any quote's file name
                    problems.append(f"{lang} p{pi+1}s{si+1}: number {n} not in its quotes: {text[:70]}")
        print(f"{year} {lang}: {words} words")
    return d, problems

def main():
    repo = sys.argv[1]
    args = sys.argv[2:]
    out = None
    if args and args[0] == "--build":
        out, args = args[1], args[2:]
    total = 0
    built = {}
    for draft in args:
        d, problems = check(repo, draft)
        for p in problems:
            print("  !!", p)
        total += len(problems)
        built[str(d["year"])] = {
            lang: [" ".join(s["text"].strip() for s in para) for para in d[lang]]
            for lang in ("pl", "en")
        }
    print(f"{total} problem(s)")
    if out:
        if total:
            sys.exit("not building: fix the problems first")
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(dict(sorted(built.items())), fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print("wrote", out)
    sys.exit(1 if total else 0)

main()
