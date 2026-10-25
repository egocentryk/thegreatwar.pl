// Builds src/data/wiki-en.json: for every pl.wikipedia article linked from
// src/content, the title of its en.wikipedia counterpart (or null if none).
// The English site uses this map to rewrite Wikipedia links at build time.
//
// Usage: node scripts/wiki-langlinks.mjs          (only titles not yet in the map)
//        node scripts/wiki-langlinks.mjs --all    (refresh every title)

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, "src/data/wiki-en.json")
const UA = "TheGreatWar-i18n/1.0 (+https://thegreatwar.pl)"
const refreshAll = process.argv.includes("--all")

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith(".md")) out.push(p)
  }
  return out
}

// "https://pl.wikipedia.org/wiki/Bitwa_nad_Bzurą#Przebieg" -> "Bitwa nad Bzurą"
export function plTitleFromUrl(url) {
  const m = url.match(/^https?:\/\/pl\.wikipedia\.org\/wiki\/([^#?\s]+)/)
  if (!m) return null
  let t = m[1]
  try { t = decodeURIComponent(t) } catch {}
  return t.replace(/_/g, " ").trim()
}

const titles = new Set()
for (const f of walk(join(ROOT, "src/content"))) {
  if (f.includes("/content/en/")) continue
  const s = readFileSync(f, "utf8")
  // Titles may contain one level of parentheses: Bitwa_o_Manilę_(1945).
  for (const m of s.matchAll(/\]\((https?:\/\/pl\.wikipedia\.org\/wiki\/(?:[^()\s]|\([^()\s]*\))+)\)/g)) {
    const t = plTitleFromUrl(m[1])
    if (t) titles.add(t)
  }
}

const map = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {}
// Forget titles no longer linked anywhere.
for (const t of Object.keys(map)) if (!titles.has(t)) delete map[t]
const todo = [...titles].filter((t) => refreshAll || !(t in map)).sort()
console.log(`titles: ${titles.size}, to query: ${todo.length}`)

async function query(batch) {
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
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://pl.wikipedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": UA },
    })
    if (res.ok) return res.json()
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
  }
  throw new Error(`request failed for batch starting ${batch[0]}`)
}

for (let i = 0; i < todo.length; i += 50) {
  const batch = todo.slice(i, i + 50)
  const data = await query(batch)
  const q = data.query ?? {}
  // Follow normalisation and redirects back to the titles we asked for.
  const forward = new Map()
  for (const n of q.normalized ?? []) forward.set(n.from, n.to)
  for (const r of q.redirects ?? []) forward.set(r.from, r.to)
  const resolve = (t) => {
    let cur = t
    for (let k = 0; k < 5 && forward.has(cur); k++) cur = forward.get(cur)
    return cur
  }
  const en = new Map()
  for (const p of q.pages ?? []) {
    const link = (p.langlinks ?? []).find((l) => l.lang === "en")
    en.set(p.title, link ? link.title : null)
  }
  for (const t of batch) map[t] = en.get(resolve(t)) ?? null
  if ((i / 50) % 20 === 0) console.log(`${i + batch.length}/${todo.length}`)
  await new Promise((r) => setTimeout(r, 300))
}

const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]))
writeFileSync(OUT, JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"') + "\n")
const found = Object.values(sorted).filter(Boolean).length
console.log(`done: ${Object.keys(sorted).length} titles, ${found} with an English article`)
