#!/usr/bin/env python3
"""Check a reading-series draft and turn the drafts into src/data/series.ts.

Usage: python3 -I scripts/series/check.py . scripts/series/<slug>.json [more...]
       python3 -I scripts/series/check.py . --build src/data/series.ts scripts/series/*.json

Draft format (one series per file):
{
  "slug": "legiony-polskie", "slugEn": "polish-legions",
  "title": "...", "titleEn": "...",
  "lead": "One line, no figures.", "leadEn": "...",
  "intro": [ {"text": "Zdanie.", "quotes": [{"file": "src/content/...", "quote": "..."}]} ],
  "introEn": [ ... same, quotes from English files ... ],
  "overview": "bitwy/<slug>",          # optional: a battle page telling the whole story
  "steps": [
    {"ref": "<timeline slug>" | "bitwy/<slug>",
     "note": {"pl": "...", "en": "..."},
     "quote": {"pl": "verbatim from the step's Polish file", "en": "verbatim from its English file"}}
  ]
}
Every note is backed by a verbatim quote from the step's own article (in that
language); every number in a note or intro sentence must be in its quotes.
"""
import glob, json, os, re, sys

def norm(s):
    s = re.sub(r"!?\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)", r"\1", s)  # links -> text
    s = s.replace("*", "").replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip()

NUM = re.compile(r"\d+(?:[ ., ]\d{3})*(?:[.,]\d+)?")
def numbers(s):
    return [re.sub(r"[ ., ]", "", m) for m in NUM.findall(s)]

def front(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    data = {}
    for line in (m.group(1) if m else "").splitlines():
        k, _, v = line.partition(":")
        data[k.strip()] = v.strip().strip('"')
    return data, text

def index(repo):
    pl, en = {}, {}
    for f in glob.glob(f"{repo}/src/content/timeline/**/*.md", recursive=True):
        pl[os.path.basename(f)[:-3]] = f
    for f in glob.glob(f"{repo}/src/content/battles/**/*.md", recursive=True):
        pl["bitwy/" + os.path.basename(f)[:-3]] = f
    for kind, prefix in (("timeline", ""), ("battles", "bitwy/")):
        for f in glob.glob(f"{repo}/src/content/en/{kind}/*.md"):
            src = front(f)[0].get("source")
            if src:
                en[prefix + src] = f
    return pl, en

def check(repo, draft, pl, en):
    d = json.load(open(draft, encoding="utf-8"))
    problems, cache = [], {}

    def text_of(path):
        if path not in cache:
            cache[path] = norm(open(path, encoding="utf-8").read())
        return cache[path]

    def sentences(key, want):
        for i, s in enumerate(d.get(key) or []):
            qnums = set()
            for q in s.get("quotes") or []:
                p = os.path.join(repo, q["file"])
                if not q["file"].startswith(want) or not os.path.exists(p):
                    problems.append(f"{key} s{i+1}: bad file {q['file']}")
                    continue
                if norm(q["quote"]) not in text_of(p):
                    problems.append(f"{key} s{i+1}: quote not found in {q['file']}: {q['quote'][:70]}")
                qnums.update(numbers(norm(q["quote"])))
            if not s.get("quotes"):
                problems.append(f"{key} s{i+1}: no quotes")
            for n in numbers(s["text"]):
                if n not in qnums:
                    problems.append(f"{key} s{i+1}: number {n} not in quotes")
        if not d.get(key):
            problems.append(f"{key}: empty")

    for k in ("slug", "slugEn", "title", "titleEn", "lead", "leadEn"):
        if not d.get(k):
            problems.append(f"missing {k}")
    for k in ("lead", "leadEn"):
        if numbers(d.get(k, "")) and not re.fullmatch(r"\d{4}", " ".join(numbers(d[k]))):
            problems.append(f"{k}: keep figures out of the lead")
    sentences("intro", "src/content/")
    sentences("introEn", "src/content/en/")

    ov = d.get("overview")
    if ov and (ov not in pl or ov not in en):
        problems.append(f"overview {ov}: no Polish or English page")
    steps = d.get("steps") or []
    if not 8 <= len(steps) <= 18:
        problems.append(f"{len(steps)} steps (want 8–18)")
    refs = [s["ref"] for s in steps]
    if len(set(refs)) != len(refs):
        problems.append("duplicate steps")
    if ov in refs:
        problems.append("overview is also a step")
    dates = []
    for i, s in enumerate(steps):
        ref = s["ref"]
        tag = f"step {i+1} {ref}"
        if ref not in pl:
            problems.append(f"{tag}: no such Polish page")
            continue
        if ref not in en:
            problems.append(f"{tag}: no English page")
        fm = front(pl[ref])[0]
        dates.append(fm.get("date") or fm.get("startDate") or "")
        for lang, path in (("pl", pl.get(ref)), ("en", en.get(ref))):
            note = (s.get("note") or {}).get(lang, "")
            quote = (s.get("quote") or {}).get(lang, "")
            if not note:
                problems.append(f"{tag}: no {lang} note")
            if len(note) > 260:
                problems.append(f"{tag}: {lang} note {len(note)} chars (max 260)")
            if not quote:
                problems.append(f"{tag}: no {lang} quote")
            elif path and norm(quote) not in text_of(path):
                problems.append(f"{tag}: {lang} quote not in {os.path.relpath(path, repo)}: {quote[:70]}")
            for n in numbers(note):
                if n not in numbers(norm(quote)):
                    problems.append(f"{tag}: {lang} number {n} not in its quote")
    if dates != sorted(dates):
        problems.append("steps not in date order: " + ", ".join(dates))
    return d, problems

def ts_string(s):
    return json.dumps(s, ensure_ascii=False)

def build(drafts):
    out = []
    for d in drafts:
        lines = ["  {"]
        for k in ("slug", "slugEn", "title", "titleEn", "lead", "leadEn"):
            lines.append(f"    {k}: {ts_string(d[k])},")
        lines.append(f"    intro:\n      {ts_string(' '.join(s['text'].strip() for s in d['intro']))},")
        lines.append(f"    introEn:\n      {ts_string(' '.join(s['text'].strip() for s in d['introEn']))},")
        if d.get("overview"):
            lines.append(f"    overview: {ts_string(d['overview'])},")
        lines.append("    steps: [")
        lines += [f"      {ts_string(s['ref'])}," for s in d["steps"]]
        lines.append("    ],")
        lines.append("    notes: {")
        for s in d["steps"]:
            lines.append(f"      {ts_string(s['ref'])}: {{")
            lines.append(f"        pl: {ts_string(s['note']['pl'])},")
            lines.append(f"        en: {ts_string(s['note']['en'])},")
            lines.append("      },")
        lines.append("    },")
        lines.append("  },")
        out.append("\n".join(lines))
    return "\n".join(out)

def main():
    repo, args = sys.argv[1], sys.argv[2:]
    out = None
    if args and args[0] == "--build":
        out, args = args[1], args[2:]
    pl, en = index(repo)
    total, drafts = 0, []
    for draft in args:
        d, problems = check(repo, draft, pl, en)
        print(f"{os.path.basename(draft)}: {len(d.get('steps') or [])} steps, {len(problems)} problem(s)")
        for p in problems:
            print("  !!", p)
        total += len(problems)
        drafts.append(d)
    print(f"{total} problem(s)")
    if out:
        if total:
            sys.exit("not building: fix the problems first")
        text = open(out, encoding="utf-8").read()
        start = text.index("export const SERIES: Series[] = [") + len("export const SERIES: Series[] = [")
        end = text.rindex("]")
        text = text[:start] + "\n" + build(drafts) + "\n" + text[end:]
        open(out, "w", encoding="utf-8").write(text)
        print("wrote", out)
    sys.exit(1 if total else 0)

main()
