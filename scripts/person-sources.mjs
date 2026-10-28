// Adds `sources:` to person pages that have none: the person's own
// pl.wikipedia biography (from `wikiTitles`) and its en.wikipedia
// counterpart. Both are checked against the Wikipedia API, so missing pages
// and redirects never end up in the list.
//
// Usage: node scripts/person-sources.mjs --dry   report only
//        node scripts/person-sources.mjs         write `sources:`

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const DRY = process.argv.includes("--dry")
const DIR = join(new URL("..", import.meta.url).pathname, "src/content/postacie")
const UA = "TheGreatWar-sources/1.0 (+https://thegreatwar.pl)"

const wikiUrl = (lang, title) => `https://${lang}.wikipedia.org/wiki/${title.replace(/ /g, "_")}`

// Person files without `sources:`, with their pl.wikipedia titles.
const people = []
for (const name of readdirSync(DIR).filter((n) => n.endsWith(".md"))) {
  const path = join(DIR, name)
  const src = readFileSync(path, "utf8")
  const end = src.indexOf("\n---", 3)
  const head = src.slice(0, end)
  if (/^sources:/m.test(head)) continue
  const list = head.match(/^wikiTitles: *\[(.*)\]$/m)?.[1]
  const titles = (list ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^["']|["']$/g, "").replace(/_/g, " "))
    .filter(Boolean)
  if (titles.length) people.push({ path, titles })
}

// pl title → { title: resolved pl title, en: en title or null }, or absent if missing.
const found = new Map()
const all = [...new Set(people.flatMap((p) => p.titles))]
for (let i = 0; i < all.length; i += 50) {
  const batch = all.slice(i, i + 50)
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "langlinks",
    lllang: "en",
    lllimit: "max",
    titles: batch.join("|"),
  })
  let data
  for (let attempt = 0; attempt < 4 && !data; attempt++) {
    const res = await fetch(`https://pl.wikipedia.org/w/api.php?${params}`, { headers: { "User-Agent": UA } })
    if (res.ok) data = await res.json()
    else await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
  }
  if (!data) throw new Error(`request failed for batch starting ${batch[0]}`)
  const q = data.query ?? {}
  const forward = new Map([...(q.normalized ?? []), ...(q.redirects ?? [])].map((n) => [n.from, n.to]))
  const resolve = (t) => {
    for (let k = 0; k < 5 && forward.has(t); k++) t = forward.get(t)
    return t
  }
  const pages = new Map((q.pages ?? []).filter((p) => !p.missing).map((p) => [p.title, p.langlinks?.[0]?.title ?? null]))
  for (const t of batch) {
    const title = resolve(t)
    if (pages.has(title)) found.set(t, { title, en: pages.get(title) })
  }
  await new Promise((r) => setTimeout(r, 300))
}

let written = 0
let withEn = 0
const missing = []
for (const { path, titles } of people) {
  const hits = titles.flatMap((t) => found.get(t) ?? [])
  if (!hits.length) {
    missing.push(path.split("/").pop())
    continue
  }
  const urls = [...new Set([...hits.map((h) => wikiUrl("pl", h.title)), ...hits.flatMap((h) => (h.en ? [wikiUrl("en", h.en)] : []))])]
  if (urls.some((u) => u.startsWith("https://en."))) withEn++
  written++
  if (DRY) {
    console.log(`${path.split("/").pop()}: ${urls.join(" ")}`)
    continue
  }
  const src = readFileSync(path, "utf8")
  const end = src.indexOf("\n---", 3)
  writeFileSync(path, src.slice(0, end) + `\nsources:\n${urls.map((u) => `  - ${JSON.stringify(u)}`).join("\n")}` + src.slice(end))
}
console.log(`${DRY ? "Would write" : "Wrote"} ${written} person pages (${withEn} with en.wikipedia)`)
if (missing.length) console.log(`No Wikipedia page found: ${missing.join(", ")}`)
