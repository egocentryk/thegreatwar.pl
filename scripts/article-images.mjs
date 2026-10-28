// Downloads the images chosen in the review (scripts/commons-images.mjs) and
// records them for the article and battle pages.
//
// For each chosen candidate that has a caption it saves a JPEG at most
// 1,600 px wide to src/assets/images/<timeline|battles>/<slug>.jpg and adds an
// entry to src/data/images.json: file, caption (pl, en), author, licence,
// licence link and the Commons page (the credit line CC BY / BY-SA requires).
//
// Usage: node scripts/article-images.mjs <selected.json> <captions.json>
//        node scripts/article-images.mjs --clean   (re-clean the authors
//        already in images.json, without downloading)
//   selected.json: chosen candidates ({ code, ref, file, artist, credit,
//                  license, licenseUrl, page, url1600 }), captions.json:
//                  { "<code>": { "pl": "…", "en": "…" } }

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"
import { UNKNOWN, cleanAuthor } from "./lib/commons.mjs"

const ROOT = new URL("..", import.meta.url).pathname
const DATA = join(ROOT, "src/data/images.json")
const UA = "thegreatwar-images/1.0 (+https://thegreatwar.pl)"
const images = existsSync(DATA) ? JSON.parse(readFileSync(DATA, "utf8")) : {}

if (process.argv.includes("--clean")) {
  for (const entry of Object.values(images)) entry.author = cleanAuthor(entry.author)
  writeFileSync(DATA, JSON.stringify(Object.fromEntries(Object.entries(images).sort()), null, 1) + "\n")
  console.log(`cleaned ${Object.keys(images).length} authors`)
  process.exit(0)
}

const [selectedFile, captionsFile] = process.argv.slice(2)
const selected = JSON.parse(readFileSync(selectedFile, "utf8"))
const captions = JSON.parse(readFileSync(captionsFile, "utf8"))

let bytes = 0
for (const item of selected) {
  const caption = captions[item.code]
  if (!caption) continue
  const battle = item.ref.startsWith("bitwy/")
  const slug = battle ? item.ref.slice(6) : item.ref
  const file = `${battle ? "battles" : "timeline"}/${slug}.jpg`
  const path = join(ROOT, "src/assets/images", file)
  mkdirSync(join(path, ".."), { recursive: true })
  const res = await fetch(item.url1600, { headers: { "User-Agent": UA } })
  if (!res.ok) {
    console.log(`!! ${item.ref}: download failed (${res.status})`)
    continue
  }
  const out = await sharp(Buffer.from(await res.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path)
  bytes += out.size
  images[item.ref] = {
    file,
    width: out.width,
    height: out.height,
    caption,
    author: cleanAuthor((item.artist || item.credit || "").replace(/(Unknown author)+/g, UNKNOWN)),
    license: item.license,
    licenseUrl: item.licenseUrl || undefined,
    source: item.page,
  }
  console.log(`${item.ref}: ${out.width}×${out.height}, ${Math.round(out.size / 1024)} KB`)
  await new Promise((r) => setTimeout(r, 300))
}
writeFileSync(DATA, JSON.stringify(Object.fromEntries(Object.entries(images).sort()), null, 1) + "\n")
console.log(`\n${Object.keys(images).length} images, ${(bytes / 1024 / 1024).toFixed(1)} MB downloaded this run`)
