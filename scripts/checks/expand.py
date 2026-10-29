#!/usr/bin/env python3
"""Check expanded articles (short articles rewritten at full length).

Usage: python3 -I scripts/checks/expand.py . <slug> [bitwy/<slug>] [more...]

A bare slug is a timeline article; `bitwy/<slug>` is a battle page (the
two can share a slug).

For each Polish timeline article or battle page <slug>:
- the front matter is the same as in git HEAD, except `sources:` (required
  now) and `summary` / `brief`, which may change (reported, not failed);
- the body has at least 400 words (battle pages: 900);
- `sources:` has 3–12 URLs in double quotes, no duplicates, at least 2 not
  on wikipedia.org;
- external links in the body are pl.wikipedia only, no target is linked
  twice;
- internal links exist and point backwards in time (workflow.md §4): a
  timeline article links earlier articles (or the same date with a higher
  dayOrder) and battles that started on or before its date, never its own
  `battle`; a battle page links articles dated before its startDate and
  battles that started on or before it (a sub-battle and its umbrella);
- every number in the "W skrócie" points appears in the body.
The English file's links and stamp are checked by scripts/i18n-status.mjs.
"""
import glob, os, re, subprocess, sys

ROOT = sys.argv[1]
SLUGS = sys.argv[2:]

def split(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    return m.group(1), m.group(2)

def fields(fm):
    """Top-level keys -> raw text (including indented continuation lines)."""
    out, key = {}, None
    for line in fm.splitlines():
        if line and not line.startswith((" ", "-")) and ":" in line:
            key = line.split(":", 1)[0]
            out[key] = line.split(":", 1)[1].strip()
        elif key:
            out[key] += "\n" + line
    return out

def scalar(fm, k):
    v = fields(fm).get(k, "").split("\n")[0].strip().strip('"')
    return v

NUM = re.compile(r"\d+(?:[ ., ]\d{3})*(?:[.,]\d+)?")
def numbers(s):
    return [re.sub(r"[ ., ]", "", m) for m in NUM.findall(s)]

# Every page: kind, date, dayOrder.
pages = {}
for f in glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True):
    fm, _ = split(open(f, encoding="utf-8").read())
    pages[os.path.basename(f)[:-3]] = ("timeline", scalar(fm, "date"), int(scalar(fm, "dayOrder") or 0), f)
battles = {}
for f in glob.glob(f"{ROOT}/src/content/battles/*/*.md"):
    fm, _ = split(open(f, encoding="utf-8").read())
    battles[os.path.basename(f)[:-3]] = (scalar(fm, "startDate"), f)
people = {os.path.basename(f)[:-3] for f in glob.glob(f"{ROOT}/src/content/postacie/*.md")}
topics = {os.path.basename(f)[:-3] for f in glob.glob(f"{ROOT}/src/content/topics/*.md")}

LINK = re.compile(r"\]\(((?:[^()\s]|\([^()\s]*\))+)\)")
problems = 0
def bad(slug, msg):
    global problems
    problems += 1
    print(f"{slug}: {msg}")

for slug in SLUGS:
    if slug.startswith("bitwy/") and slug[6:] in battles:
        slug = slug[6:]
        kind, (date, path), order = "battle", battles[slug], None
    elif slug in pages:
        kind, date, order, path = pages[slug]
    else:
        bad(slug, "no such article or battle page")
        continue
    fm, body = split(open(path, encoding="utf-8").read())
    rel = os.path.relpath(path, ROOT)
    try:
        old = subprocess.run(["git", "-C", ROOT, "show", f"HEAD:{rel}"], capture_output=True, text=True, check=True).stdout
        ofm, obody = split(old)
        a, b = fields(ofm), fields(fm)
        for k in sorted(set(a) | set(b)):
            if k in ("sources", "summary", "brief"):
                if k != "sources" and a.get(k) != b.get(k):
                    print(f"{slug}: note: {k} changed")
                continue
            if a.get(k) != b.get(k):
                bad(slug, f"front matter `{k}` changed")
        oldw = len(re.findall(r"\w+", LINK.sub("]", obody)))
    except subprocess.CalledProcessError:
        oldw = 0

    words = len(re.findall(r"\w+", LINK.sub("]", body)))
    need = 900 if kind == "battle" else 400
    if words < need:
        bad(slug, f"{words} words, need at least {need}")

    src = re.findall(r"^\s+- (.*)$", fields(fm).get("sources", ""), re.M)
    urls = [s.strip('"') for s in src]
    if not 3 <= len(urls) <= 12:
        bad(slug, f"{len(urls)} sources, need 3–12")
    if any(not (s.startswith('"') and s.endswith('"')) for s in src):
        bad(slug, "sources must be in double quotes")
    if len(set(urls)) != len(urls):
        bad(slug, "duplicate source")
    if sum("wikipedia.org" not in u for u in urls) < 2:
        bad(slug, "fewer than 2 sources outside Wikipedia")

    seen = set()
    own_battle = scalar(fm, "battle")
    for target in LINK.findall(body):
        if target in seen:
            bad(slug, f"linked twice: {target}")
        seen.add(target)
        if target.startswith("http"):
            if not target.startswith("https://pl.wikipedia.org/wiki/"):
                bad(slug, f"external link not on pl.wikipedia: {target}")
            continue
        m = re.match(r"^/(?:(bitwy|postacie|tematy)/)?([a-z0-9-]+)$", target)
        if not m:
            bad(slug, f"odd link: {target}")
            continue
        sect, t = m.groups()
        if sect == "postacie":
            if t not in people:
                bad(slug, f"no person page {t}")
        elif sect == "tematy":
            if t not in topics:
                bad(slug, f"no guide {t}")
        elif sect == "bitwy":
            if t not in battles:
                bad(slug, f"no battle page {t}")
            elif t == own_battle:
                bad(slug, f"links its own battle {t}")
            elif kind == "timeline" and battles[t][0] > date:
                bad(slug, f"forward link to battle {t} ({battles[t][0]})")
            elif kind == "battle" and battles[t][0] > date:
                # same start allowed: a sub-battle may link its umbrella
                bad(slug, f"battle links battle {t} not before its start ({battles[t][0]})")
        else:
            if t not in pages:
                bad(slug, f"no article {t}")
                continue
            _, td, to, _ = pages[t]
            if kind == "timeline" and (td > date or (td == date and to <= order)):
                bad(slug, f"forward link to {t} ({td}, dayOrder {to})")
            if kind == "battle" and td >= date:
                bad(slug, f"battle links article {t} not before its start ({td})")

    plain = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", body)
    for item in re.findall(r'^\s+- "(.*)"$', fields(fm).get("brief", ""), re.M):
        for n in numbers(item):
            if n not in numbers(plain):
                bad(slug, f"number {n} in 'W skrócie' not in the body")

    print(f"{slug}: {oldw} -> {words} words, {len(urls)} sources")

print(f"{problems} problem(s)")
