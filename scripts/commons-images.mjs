// Finds freely licensed images on Wikimedia Commons for articles and battle
// pages, for review before any are used.
//
// For each item of the input list it collects: the main image of its
// pl.wikipedia and en.wikipedia pages, up to eight more photos used on the
// English page, and, for battles, maps found on Commons. The pages are the
// ones given (`enWiki`, `plWiki`, e.g. from the article's sources); only
// without them is the title searched, which can find the wrong page. It reads each file's licence, author and
// description from Commons and keeps free ones only (public domain, CC0,
// CC BY, CC BY-SA); "public domain in the US" files are kept but flagged,
// since they may not be free in Poland.
//
// Usage: node scripts/commons-images.mjs <input.json> <out-dir>
//   input.json: [{ "ref": "slug" | "bitwy/slug", "title": "…", "titleEn": "…",
//                  "enWiki"?: "Page title", "plWiki"?: "Tytuł strony",
//                  "enSearch"?: "what to search for without enWiki" }]
//   writes <out-dir>/candidates.json and <out-dir>/gallery.html

import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const [input, out] = process.argv.slice(2)
const items = JSON.parse(readFileSync(input, "utf8"))
const UA = "thegreatwar-images/1.0 (+https://thegreatwar.pl)"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } })
    if (res.ok) return res.json()
    await sleep(1500 * (attempt + 1))
  }
  throw new Error(`request failed: ${url}`)
}

// A page (exact title, or else the first search hit), with its main image and
// other files.
async function wikiPage(lang, exact, search) {
  if (!exact && !search) return null
  const data = await api(`${lang}.wikipedia.org`, {
    action: "query",
    ...(exact ? { titles: exact, redirects: "1" } : { generator: "search", gsrsearch: search, gsrlimit: "1" }),
    prop: "pageimages|images",
    piprop: "name",
    imlimit: "40",
  })
  const page = data.query?.pages?.[0]
  if (!page) return null
  return { title: page.title, main: page.pageimage, files: (page.images ?? []).map((i) => i.title.replace(/^[^:]+:/, "")) }
}

async function commonsSearch(query, limit = 4) {
  const data = await api("commons.wikimedia.org", { action: "query", list: "search", srsearch: query, srnamespace: "6", srlimit: String(limit) })
  return (data.query?.search ?? []).map((s) => s.title.replace(/^File:/, ""))
}

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
const SKIP = /(flag|coat[_ ]of[_ ]arms|herb|logo|icon|symbol|emblem|signature|podpis|commons-logo|wiki|question|edit-|ambox|padlock)/i
const FREE = /(public domain|^pd|cc0|cc[- ]by)/i

async function fileInfo(names) {
  const info = new Map()
  for (let i = 0; i < names.length; i += 40) {
    const data = await api("commons.wikimedia.org", {
      action: "query",
      titles: names.slice(i, i + 40).map((n) => `File:${n}`).join("|"),
      prop: "imageinfo",
      iiprop: "url|size|extmetadata",
      iiurlwidth: "480",
    })
    for (const page of data.query?.pages ?? []) {
      const ii = page.imageinfo?.[0]
      if (!ii) continue
      const m = ii.extmetadata ?? {}
      const license = m.LicenseShortName?.value ?? ""
      info.set(page.title.replace(/^File:/, ""), {
        license,
        usOnly: /pd-?us|united states|USA/i.test(`${license} ${m.UsageTerms?.value ?? ""}`) && !/government|federal/i.test(`${license} ${m.UsageTerms?.value ?? ""}`),
        free: FREE.test(license) && !/fair use|non-free/i.test(license),
        artist: strip(m.Artist?.value).slice(0, 120),
        credit: strip(m.Credit?.value).slice(0, 160),
        description: strip(m.ImageDescription?.value).slice(0, 300),
        date: strip(m.DateTimeOriginal?.value).slice(0, 40),
        width: ii.width,
        height: ii.height,
        thumb: ii.thumburl,
        page: ii.descriptionurl,
      })
    }
    await sleep(300)
  }
  return info
}

const results = []
for (const item of items) {
  const battle = item.ref.startsWith("bitwy/")
  const [pl, en] = [
    // pl.wikipedia only when the exact page is known: its title search often
    // lands on the wrong page.
    await wikiPage("pl", item.plWiki, null),
    await wikiPage("en", item.enWiki, item.enWiki ? null : (item.enSearch ?? item.titleEn.replace(/^The /, ""))),
  ]
  const photos = [pl?.main, en?.main, ...(en?.files ?? []).filter((f) => /\.(jpe?g|png|tif)$/i.test(f)).slice(0, 8)]
  const maps = battle ? await commonsSearch(`${(item.enSearch ?? item.titleEn).replace(/^(The |Battle of |Battles of )/, "")} map`) : []
  const names = [...new Set([...photos, ...maps].filter(Boolean))].filter((n) => !SKIP.test(n) && (!/\.svg$/i.test(n) || /map|mapa/i.test(n)))
  const info = await fileInfo(names)
  const candidates = names
    .map((name) => ({ name, kind: maps.includes(name) || /map|mapa/i.test(name) ? "map" : "photo", ...info.get(name) }))
    .filter((c) => c.free && c.width >= 700)
    .slice(0, 8)
  results.push({ ...item, wiki: { pl: pl?.title, en: en?.title }, candidates })
  console.log(`${item.ref}: ${candidates.length} free candidates (pl: ${pl?.title ?? "–"}, en: ${en?.title ?? "–"})`)
  await sleep(400)
}

// Each candidate gets a code like 07b for the review.
results.forEach((r, i) => r.candidates.forEach((c, j) => (c.code = `${String(i + 1).padStart(2, "0")}${"abcdefgh"[j]}`)))
writeFileSync(join(out, "candidates.json"), JSON.stringify(results, null, 1))

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Image review</title><style>
body{font:14px/1.45 system-ui,sans-serif;margin:24px;background:#f7f6f3;color:#15161b}
h2{font:600 18px Georgia,serif;margin:36px 0 4px}.meta{color:#5b5d66;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:10px}
.card{background:#fff;border:1px solid #e4e2dc;border-radius:4px;padding:8px}
.card img{width:100%;height:180px;object-fit:contain;background:#efeeea}
.code{font:700 15px ui-monospace,monospace;color:#3d3dff}.flag{color:#b00;font-weight:600}
.small{font-size:12px;color:#444;margin-top:4px}.none{color:#888}
</style></head><body>
<h1>Image review — trial</h1>
<p>Reply with the codes you want (one photo per article, plus one map per battle), e.g. <b>01a, 03c, 21b+21e</b>. Items you skip get no image.</p>
${results
  .map(
    (r, i) => `<h2>${String(i + 1).padStart(2, "0")}. ${esc(r.title)}</h2>
<div class="meta">${esc(r.ref)} · wiki: ${esc(r.wiki.pl ?? "–")} / ${esc(r.wiki.en ?? "–")}</div>
${
  r.candidates.length
    ? `<div class="grid">${r.candidates
        .map(
          (c) => `<div class="card"><a href="${esc(c.page)}" target="_blank"><img src="${esc(c.thumb)}" loading="lazy" alt=""></a>
<div><span class="code">${c.code}</span> · ${c.kind} · ${c.width}×${c.height}</div>
<div class="small"><b>${esc(c.license)}</b>${c.usOnly ? ' <span class="flag">US-only PD?</span>' : ""} · ${esc(c.artist || c.credit)}</div>
<div class="small">${esc(c.description)}</div></div>`,
        )
        .join("")}</div>`
    : `<p class="none">No free candidates found.</p>`
}`,
  )
  .join("\n")}
</body></html>`
writeFileSync(join(out, "gallery.html"), html)
console.log(`\n${results.reduce((n, r) => n + r.candidates.length, 0)} candidates for ${results.length} items → ${join(out, "gallery.html")}`)
