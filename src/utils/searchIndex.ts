// Search index format, shared by the index endpoints (szukaj.json.ts,
// en/search.json.ts) and the browser script (Search.astro). No Astro imports:
// the browser bundles this file.
//
// The index is columnar to keep it small: one array per field instead of an
// object per document; tags, fronts, places and commanders are stored once in
// `terms` and referenced by number; event date labels are formatted in the
// browser from the ISO date.

// One document as the search script uses it.
export interface SearchDoc {
  h: string // href
  t: string // title
  s: string // summary
  d: string // date label
  k: string // sort key (ISO start date)
  y: "e" | "b" // event or battle
  g: string // tags, front and category (battles: front, place, sides, commanders)
  m: boolean // milestone
}

// What an endpoint provides for each document.
export interface SearchSource {
  h: string
  t: string
  s: string
  k: string
  y: "e" | "b"
  m: boolean
  g: string[]
  // Date label, only for battles (a range); events get theirs in the browser.
  d?: string
}

export interface PackedIndex {
  terms: string[]
  h: string[]
  t: string[]
  s: string[]
  k: string[]
  // Bit 1: battle, bit 2: milestone.
  f: number[]
  g: number[][]
  // Date labels by document position (battles only).
  d: Record<number, string>
}

export function packIndex(docs: SearchSource[]): PackedIndex {
  const terms: string[] = []
  const termIds = new Map<string, number>()
  const termId = (term: string) => {
    if (!termIds.has(term)) termIds.set(term, terms.push(term) - 1)
    return termIds.get(term)!
  }
  const packed: PackedIndex = { terms, h: [], t: [], s: [], k: [], f: [], g: [], d: {} }
  docs.forEach((doc, i) => {
    packed.h.push(doc.h)
    packed.t.push(doc.t)
    packed.s.push(doc.s)
    packed.k.push(doc.k)
    packed.f.push((doc.y === "b" ? 1 : 0) | (doc.m ? 2 : 0))
    packed.g.push(doc.g.filter(Boolean).map(termId))
    if (doc.d) packed.d[i] = doc.d
  })
  return packed
}

export function unpackIndex(index: PackedIndex, locale: string): SearchDoc[] {
  // Same output as formatDate(date) on the server ("3 października 1918").
  const day = new Intl.DateTimeFormat(locale, { timeZone: "UTC", dateStyle: "long" })
  return index.h.map((h, i) => ({
    h,
    t: index.t[i],
    s: index.s[i],
    d: index.d[i] ?? day.format(new Date(`${index.k[i]}T00:00:00Z`)),
    k: index.k[i],
    y: index.f[i] & 1 ? "b" : "e",
    g: index.g[i].map((id) => index.terms[id]).join(" "),
    m: (index.f[i] & 2) !== 0,
  }))
}
