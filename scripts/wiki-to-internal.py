#!/usr/bin/env python3
"""Point pl.wikipedia links at our own battle, person and event pages.

Usage: python3 -I scripts/wiki-to-internal.py [--write] [--only slug,slug]

A link `[text](https://pl.wikipedia.org/wiki/<Title>)` becomes
`[text](/bitwy/<slug>)` when <Title> is one of our battle pages (its title
with underscores, or an alias in ALIASES, where pl.wiki names a campaign
differently), or `[text](/postacie/<slug>)`, `[text](/tematy/<slug>)`,
`[text](/kraje/<slug>)`, `[text](/miejsca/<slug>)`, `[text](/slownik/<slug>)`
when <Title> is in the `wikiTitles` of a person page, a topic guide, a
country page, a place page or a glossary term's longer text, or `[text](/<slug>)` when <Title> is
in EVENTS (a timeline article about the same event). Timeline articles,
battle pages, topic guides, country, place and person pages are edited; the
English file of the same page gets the same edit (English bodies keep the
Polish link targets; the build maps them).

The workflow's link rules are kept (workflow.md §4, "Links"):
- battles: only links to earlier content (a timeline article from the
  battle's start date on, a battle page whose own start is on or after the
  target's); guides and person pages are not dated and may link any battle;
- people, guides, countries, places, glossary: no date rule (reference pages);
- events: only from content dated after the event (guides and person
  pages: always);
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
    # The river: its war is the twelve battles (expansion-plan.md C).
    "Socza": "bitwy-nad-isonzo",
    "Kras_(płaskowyż)": "bitwy-nad-isonzo",
    # The peninsula: its war is the campaign (links before it keep pl.wiki).
    "Gallipoli_(półwysep)": "kampania-gallipolijska",
}

# pl.wikipedia title -> our timeline article about that event, for events
# with no battle page: the articles before the war ("Przed wojną").
EVENTS = {
    "Dwuprzymierze": "niemcy-i-austro-wegry-zawieraja-dwuprzymierze",
    "Trójprzymierze": "niemcy-austro-wegry-i-wlochy-zawieraja-trojprzymierze",
    "Sojusz_francusko-rosyjski": "wchodzi-w-zycie-sojusz-francusko-rosyjski",
    "Entente_cordiale": "wielka-brytania-i-francja-zawieraja-entente-cordiale",
    "HMS_Dreadnought_(1906)": "wodowanie-hms-dreadnought",
    "Kryzys_bośniacki": "austro-wegry-oglaszaja-aneksje-bosni-i-hercegowiny",
    "Wojna_włosko-turecka": "wybucha-wojna-wlosko-turecka",
    "I_wojna_bałkańska": "czarnogora-rozpoczyna-pierwsza-wojne-balkanska",
    "II_wojna_bałkańska": "bulgaria-rozpoczyna-druga-wojne-balkanska",
    "Traktat_reasekuracyjny": "niemcy-nie-odnawiaja-traktatu-reasekuracyjnego",
    "Traktat_w_Algeciras": "konferencja-w-algeciras-konczy-pierwszy-kryzys-marokanski",
    "Traktat_londyński_(1913)": "traktat-londynski-konczy-pierwsza-wojne-balkanska",
    "Traktat_w_Bukareszcie_(1913)": "pokoj-bukaresztenski-konczy-druga-wojne-balkanska",
    "Związek_Walki_Czynnej": "powstaje-zwiazek-walki-czynnej",
    "Związek_Strzelecki": "powstaje-zwiazek-strzelecki",
    # After the war ("Po wojnie", 1919–1923); generic links (the whole
    # Polish–Soviet or Polish–Ukrainian war, the Treaty of Versailles) stay.
    "Wojna_polsko-czechosłowacka": "czechoslowacja-atakuje-slask-cieszynski",
    "Rozejm_w_Trewirze": "rozejm-w-trewirze",
    "Zaślubiny_Polski_z_morzem": "zaslubiny-polski-z-morzem",
    "Plebiscyt_na_Warmii,_Mazurach_i_Powiślu": "plebiscyt-na-warmii-mazurach-i-powislu",
    "I_powstanie_śląskie": "wybuch-pierwszego-powstania-slaskiego",
    "II_powstanie_śląskie": "wybuch-drugiego-powstania-slaskiego",
    "III_powstanie_śląskie": "wybuch-trzeciego-powstania-slaskiego",
    "Plebiscyt_na_Górnym_Śląsku": "plebiscyt-na-gornym-slasku",
    "Powstanie_sejneńskie": "powstanie-sejnenskie",
    "Ofensywa_czortkowska": "ofensywa-czortkowska",
    "Wyprawa_kijowska": "poczatek-wyprawy-kijowskiej",
    "Rada_Obrony_Państwa": "powstanie-rady-obrony-panstwa",
    "Bitwa_pod_Zadwórzem": "bitwa-pod-zadworzem",
    "Bunt_Żeligowskiego": "bunt-zeligowskiego",
    "Traktat_ryski_(1921)": "pokoj-ryski",
    "Powstanie_kłajpedzkie": "powstanie-w-klajpedzie",
    "Komisja_Tymczasowa_Skonfederowanych_Stronnictw_Niepodległościowych": "powstaje-komisja-tymczasowa-skonfederowanych-stronnictw-niepodleglosciowych",
    # The war (expansion-plan.md C, step 1): institutions and treaties whose
    # founding or signing has an article of its own.
    "Traktat_londyński_(1915)": "wlochy-podpisuja-pakt-londynski",
    "Rada_Regencyjna": "powolanie-rady-regencyjnej",
    "Rząd_Tymczasowy_Rosji": "powstanie-rzadu-tymczasowego",
    "Komitet_Narodowy_Polski_(1917–1919)": "powstanie-komitetu-narodowego-polskiego",
    "Rewolucja_lutowa_(1917)": "rewolucja-lutowa",
    "Rewolucja_październikowa": "rewolucja-pazdziernikowa",
    "Bajończycy": "polscy-ochotnicy-wstepuja-do-legii-cudzoziemskiej",
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
    for folder, prefix in (("postacie", "postacie"), ("topics", "tematy"), ("countries", "kraje"), ("places", "miejsca"), ("glossary", "slownik")):
        for f in glob.glob(f"{ROOT}/src/content/{folder}/*.md"):
            m = re.search(r"^wikiTitles:\s*\[(.*)\]", open(f, encoding="utf-8").read(), re.M)
            for title in (m.group(1).split(",") if m else []):
                title = title.strip().strip("\"'")
                if title:
                    targets[title] = (prefix, os.path.basename(f)[:-3])
    events = {}  # slug -> date
    for f in glob.glob(f"{ROOT}/src/content/timeline/**/*.md", recursive=True):
        events[os.path.basename(f)[:-3]] = front(open(f, encoding="utf-8").read())["date"]
    for title, slug in EVENTS.items():
        if slug in events:
            targets[title] = ("", slug)
    if only:
        targets = {t: v for t, v in targets.items() if v[1] in only}

    # Polish folder -> English folder.
    EN_DIR = {"timeline": "timeline", "battles": "battles", "topics": "topics", "postacie": "people", "countries": "countries", "places": "places", "glossary": "glossary"}
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
        + glob.glob(f"{ROOT}/src/content/countries/*.md")
        + glob.glob(f"{ROOT}/src/content/places/*.md")
        + glob.glob(f"{ROOT}/src/content/glossary/*.md")
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
            own = {"battles": "bitwy", "postacie": "postacie", "timeline": "", "topics": "tematy", "countries": "kraje", "places": "miejsca", "glossary": "slownik"}.get(kind)
            href = f"/{prefix}/{target}" if prefix else f"/{target}"
            if own == prefix and target == slug:
                why = "own page"
            elif prefix == "bitwy" and kind == "timeline" and d.get("battle") == target:
                why = "the article's own battle"
            elif f"]({href})" in text:
                why = "already linked"
            elif prefix == "bitwy" and when and when < battles[target]:
                why = f"dated {when}, before the battle ({battles[target]})"
            elif not prefix and when and when <= events[target]:
                why = f"dated {when}, not after the event ({events[target]})"
            if why:
                skipped.append((os.path.relpath(f, ROOT), target, why))
            elif (url, href, target) not in edits:
                edits.append((url, href, target))
        if not edits:
            continue
        en_path = en_of.get((EN_DIR[kind], slug))
        en_text = open(en_path, encoding="utf-8").read() if en_path else None
        for url, href, target in edits:
            text = text.replace(f"]({url})", f"]({href})", 1)
            if en_text is not None:
                if f"]({url})" not in en_text:
                    sys.exit(f"{en_path}: link {url} missing in English; fix by hand first")
                en_text = en_text.replace(f"]({url})", f"]({href})", 1)
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
