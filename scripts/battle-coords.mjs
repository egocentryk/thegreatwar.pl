// Finds coordinates for battle pages (src/content/battles) on Wikipedia and
// writes them to src/data/battle-coords.json for the battle map.
//
// For each battle, the first match wins:
//   1. pl.wikipedia article with the battle's title, then "<title> (<year>)"
//   2. en.wikipedia article with the English title (src/content/en/battles),
//      then "<title> (<year>)" ("Battle of Megiddo (1918)")
// An article without coordinates falls back to its Wikidata item's
// coordinates (P625), then to those of its location (P276).
// A match is skipped when its Wikidata item is dated outside 1914–1919
// (P580/P585/P582), so same-named battles from other centuries never match.
// Undated matches are kept with "check": true for a manual look.
//
// (Articles linked from the battle's text were tried and dropped: they are
// often a different battle, e.g. "Podbój Serbii" -> Gallipoli.)
//
// Entries already in the JSON are kept (they may be hand-corrected); only
// missing battles are looked up. Battles still missing are printed: add them
// by hand with "source": "manual".
//
// Usage: node scripts/battle-coords.mjs [--all]   (--all re-checks everything
//        except "manual" entries)

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { join, basename } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, "src/data/battle-coords.json")
const UA = "thegreatwar.pl-battle-map/1.0 (https://thegreatwar.pl)"
const all = process.argv.includes("--all")

const field = (s, name) => s.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]?.replace(/^"|"$/g, "")
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : d.name.endsWith(".md") ? [join(dir, d.name)] : [],
  )

const battles = walk(join(ROOT, "src/content/battles")).map((file) => {
  const text = readFileSync(file, "utf8")
  return {
    id: basename(file, ".md"),
    title: field(text, "title"),
    year: field(text, "startDate").slice(0, 4),
  }
})
const enTitles = new Map(
  walk(join(ROOT, "src/content/en/battles")).map((file) => {
    const text = readFileSync(file, "utf8")
    return [field(text, "source"), field(text, "title")]
  }),
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } })
    if (res.ok) return res.json()
    await sleep(2000 * (attempt + 1))
  }
  throw new Error(`HTTP error for ${url}`)
}

// Title -> { lat?, lon?, qid, title } for one wiki, 50 titles per request.
async function wikiCoords(lang, titles) {
  const out = new Map()
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50)
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1` +
      `&prop=coordinates|pageprops&ppprop=wikibase_item&colimit=max&titles=${encodeURIComponent(batch.join("|"))}`
    const data = await get(url)
    const resolved = new Map(batch.map((t) => [t, t]))
    for (const step of [...(data.query.normalized ?? []), ...(data.query.redirects ?? [])]) {
      for (const [from, to] of resolved) if (to === step.from) resolved.set(from, step.to)
    }
    const pages = new Map((data.query.pages ?? []).map((p) => [p.title, p]))
    for (const [asked, final] of resolved) {
      const page = pages.get(final)
      if (!page || page.missing) continue
      const c = page.coordinates?.[0]
      out.set(asked, { lat: c?.lat, lon: c?.lon, qid: page.pageprops?.wikibase_item, title: final })
    }
    await sleep(300)
  }
  return out
}

// Wikidata item -> { year, coord, location } from its start/point-in-time/
// end date (P580/P585/P582), coordinates (P625) and location (P276).
async function entities(qids) {
  const out = new Map()
  const list = [...new Set(qids.filter(Boolean))]
  for (let i = 0; i < list.length; i += 50) {
    const data = await get(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${list.slice(i, i + 50).join("|")}`,
    )
    for (const [qid, entity] of Object.entries(data.entities ?? {})) {
      const value = (prop) => entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value
      const time = ["P580", "P585", "P582"].map((p) => value(p)?.time).find(Boolean)
      const coord = value("P625")
      out.set(qid, {
        year: time ? Number(time.slice(1, 5)) : undefined,
        coord: coord ? { lat: coord.latitude, lon: coord.longitude } : undefined,
        location: value("P276")?.id,
      })
    }
    await sleep(300)
  }
  return out
}

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {}
const todo = battles.filter((b) => all ? existing[b.id]?.source !== "manual" : !existing[b.id])
console.log(`${battles.length} battles, ${todo.length} to look up`)

const withYear = (title, year) => (/\(\d{4}\)$/.test(title) ? [] : [`${title} (${year})`])
const [plHits, enHits] = await Promise.all([
  wikiCoords("pl", todo.flatMap((b) => [b.title, ...withYear(b.title, b.year)])),
  wikiCoords(
    "en",
    todo.flatMap((b) => {
      const en = enTitles.get(b.id)
      return en ? [en, ...withYear(en, b.year)] : []
    }),
  ),
])
const hits = [...plHits.values(), ...enHits.values()]
const items = await entities(hits.map((h) => h.qid))
const places = await entities([...items.values()].map((item) => item.location))
// Coordinates of a hit: the article's, else its Wikidata item's, else its location's.
const coordOf = (hit) => {
  if (hit.lat !== undefined) return { lat: hit.lat, lon: hit.lon, via: "" }
  const item = items.get(hit.qid)
  if (item?.coord) return { ...item.coord, via: " (wikidata)" }
  const place = item?.location && places.get(item.location)?.coord
  return place ? { ...place, via: " (location)" } : undefined
}
const yearOf = (hit) => items.get(hit.qid)?.year
const inWar = (hit) => {
  const year = yearOf(hit)
  return year === undefined || (year >= 1914 && year <= 1919)
}

const result = { ...existing }
const missing = []
for (const b of todo) {
  const en = enTitles.get(b.id)
  const candidates = [
    ...[b.title, ...withYear(b.title, b.year)].map((t) => ["pl", plHits.get(t)]),
    ...(en ? [en, ...withYear(en, b.year)] : []).map((t) => ["en", enHits.get(t)]),
  ]
  // Dated matches first, then undated ones; each needs coordinates.
  const usable = candidates.filter(([, h]) => h && inWar(h) && coordOf(h))
  const [source, hit] = usable.find(([, h]) => yearOf(h) !== undefined) ?? usable[0] ?? []
  if (!hit) {
    missing.push(b)
    continue
  }
  const coord = coordOf(hit)
  result[b.id] = {
    lat: Math.round(coord.lat * 1e4) / 1e4,
    lon: Math.round(coord.lon * 1e4) / 1e4,
    source: `${source}:${hit.title}${coord.via}`,
    ...(yearOf(hit) !== undefined ? {} : { check: true }),
  }
}

const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n")
console.log(`${Object.keys(sorted).length} with coordinates, ${missing.length} missing:`)
for (const b of missing) console.log(`  ${b.id}  (${b.title})`)
