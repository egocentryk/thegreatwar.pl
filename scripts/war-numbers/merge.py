#!/usr/bin/env python3
"""Check the researchers' datasets and merge them into src/data/war-numbers.json.

Usage: python3 -I scripts/war-numbers/merge.py [--write]

Rules (BRIEF.md): every row has low <= high, both labels, and at least two
sources of which one is not Wikipedia (rows of computed figures, like the
days of war, have no sources and must say so in the note).
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
PARTS = ["headline", "deaths", "poland", "battles", "sea-production"]

merged, problems = {}, []
for part in PARTS:
    path = os.path.join(HERE, f"{part}.json")
    if not os.path.exists(path):
        problems.append(f"{part}.json missing")
        continue
    for key, ds in json.load(open(path, encoding="utf-8")).items():
        if key in merged:
            problems.append(f"{key}: defined twice")
        for field in ("title", "titleEn", "unit", "unitEn", "note", "noteEn"):
            if not ds.get(field):
                problems.append(f"{key}: no {field}")
        for row in ds.get("rows", []):
            tag = f"{key} / {row.get('label')}"
            if not row.get("labelEn"):
                problems.append(f"{tag}: no labelEn")
            if not isinstance(row.get("low"), (int, float)) or not isinstance(row.get("high"), (int, float)):
                problems.append(f"{tag}: low/high not numbers")
            elif row["low"] > row["high"]:
                problems.append(f"{tag}: low > high")
            sources = row.get("sources", [])
            if not sources:
                if "oblicz" not in (row.get("note") or "").lower():
                    problems.append(f"{tag}: no sources and not marked as computed")
                continue
            if len(sources) < 2:
                problems.append(f"{tag}: {len(sources)} source(s)")
            if all("wikipedia.org" in s for s in sources):
                problems.append(f"{tag}: only Wikipedia")
        merged[key] = ds
        print(f"{key}: {len(ds.get('rows', []))} rows")

print(f"{len(problems)} problem(s)")
for p in problems:
    print("  !!", p)
if "--write" in sys.argv and not problems:
    out = os.path.join(REPO, "src/data/war-numbers.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(merged, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print("wrote", out)
sys.exit(1 if problems else 0)
