// Fetches portraits from Wikimedia Commons for the people listed in
// PHOTOS (and in src/data/person-photos.json) and writes, for each one:
//   src/assets/postacie/<slug>.jpg   600×800 black-and-white portrait
//   public/og/postacie/<slug>.jpg    1200×630 social card (portrait + name)
// and prints the `photo:` front-matter block (credit, licence, source) to
// paste into src/content/postacie/<slug>.md.
//
// Usage: node scripts/person-photos.mjs [slug ...]   (no slugs: all)
//        --write          also put the `photo:` block into the person page
//                         (after `wikiTitles`), replacing an existing one
//        --preview <dir>  only render the portrait and card into <dir>,
//                         for review; nothing in the repo changes
// Only use public-domain or CC-licensed files and keep the credit.

import { existsSync, readFileSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"
import { cleanAuthor } from "./lib/commons.mjs"

// slug → Commons file name (without "File:"), and per-person framing:
// [window width as a fraction of the 3:4 crop, window centre x, window top],
// all as fractions of that crop. The list lives in src/data/person-photos.json.
const PHOTOS = {}
const FRAME = {}

// Chosen in review: { "<slug>": { "file": "…", "frame"?: […] } }.
const MORE = "src/data/person-photos.json"
if (existsSync(MORE)) {
  for (const [slug, { file, frame }] of Object.entries(JSON.parse(readFileSync(MORE, "utf8")))) {
    PHOTOS[slug] ??= file
    if (frame) FRAME[slug] ??= frame
  }
}

const UA = { "User-Agent": "TheGreatWarPhotos/1.0 (https://thegreatwar.pl)" }
const W = 600
const H = 800
const OG_W = 1200
const OG_H = 630
// Dark theme tokens from src/styles/global.css.
const COLORS = { paper: "#101114", ink: "#f2f1ed", soft: "#9a9ca6", signal: "#7b7bff" }

const stripHtml = (html) =>
  html
    .replace(/<span[^>]*display:\s*none[^>]*>.*?<\/span>/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()

const escapeXml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Greedy word wrap by an estimated average glyph width.
const wrap = (text, fontSize, width, maxLines) => {
  const perLine = Math.floor(width / (fontSize * 0.5))
  const lines = []
  for (const word of text.split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last && (last + " " + word).length <= perLine) lines[lines.length - 1] += " " + word
    else lines.push(word)
  }
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"
  }
  return lines
}

const frontMatter = async (slug) => {
  const text = await readFile(`src/content/postacie/${slug}.md`, "utf8")
  const field = (key) =>
    text.match(new RegExp(`^${key}:\\s*"?(.*?)"?$`, "m"))?.[1] ?? ""
  return {
    name: field("name"),
    role: field("role"),
    born: field("born").slice(0, 4),
    died: field("died").slice(0, 4),
  }
}

async function commonsInfo(file) {
  const params = new URLSearchParams({
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1400",
    format: "json",
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: UA })
  const page = Object.values((await res.json()).query.pages)[0]
  const info = page.imageinfo?.[0]
  if (!info) throw new Error(`Not on Commons: ${file}`)
  const meta = info.extmetadata
  return {
    url: info.thumburl ?? info.url,
    source: info.descriptionurl,
    license: stripHtml(meta.LicenseShortName?.value ?? "").replace(/^public domain$/i, "domena publiczna").replace(/ ([a-z]{2})$/, (_, c) => " " + c.toUpperCase()),
    // Polish, as on the site: "autor nieznany", "domena publiczna".
    credit: cleanAuthor(stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? "")).replace(/^autor nieznany \/ unknown author$/, "autor nieznany"),
  }
}

async function portrait(buffer, slug) {
  const image = sharp(buffer).rotate()
  const { width, height } = await image.metadata()
  let crop
  if (width / height > W / H) {
    const w = Math.round((height * W) / H)
    crop = { left: Math.round((width - w) / 2), top: 0, width: w, height }
  } else {
    const h = Math.round((width * H) / W)
    crop = { left: 0, top: Math.round((height - h) * 0.2), width, height: h }
  }
  const frame = FRAME[slug]
  if (frame) {
    const [scale, cx, top] = frame
    const w = Math.round(crop.width * scale)
    const h = Math.round((w * H) / W)
    const left = Math.round(crop.left + crop.width * cx - w / 2)
    crop = {
      left: Math.min(Math.max(left, crop.left), crop.left + crop.width - w),
      top: Math.round(crop.top + crop.height * top),
      width: w,
      height: h,
    }
  }
  return image
    .extract(crop)
    .resize(W, H)
    .grayscale()
    .normalise({ lower: 1, upper: 99 })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
}

async function ogCard(photo, person) {
  const photoW = Math.round((OG_H * W) / H)
  const x = photoW + 64
  const textW = OG_W - x - 64
  const nameLines = wrap(person.name, 60, textW, 3)
  const roleLines = wrap(person.role, 24, textW, 3)
  let y = 150
  const parts = [
    `<rect width="${OG_W}" height="${OG_H}" fill="${COLORS.paper}"/>`,
    `<text x="${x}" y="${y}" font-family="Menlo, monospace" font-size="18" letter-spacing="4" fill="${COLORS.signal}">THEGREATWAR.PL · POSTACIE</text>`,
  ]
  y += 80
  for (const line of nameLines) {
    parts.push(`<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="60" fill="${COLORS.ink}">${escapeXml(line)}</text>`)
    y += 70
  }
  y += 10
  parts.push(`<text x="${x}" y="${y}" font-family="Menlo, monospace" font-size="22" fill="${COLORS.soft}">${person.born}–${person.died}</text>`)
  y += 50
  for (const line of roleLines) {
    parts.push(`<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="24" fill="${COLORS.soft}">${escapeXml(line)}</text>`)
    y += 34
  }
  parts.push(`<rect x="${photoW}" y="0" width="4" height="${OG_H}" fill="${COLORS.signal}"/>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">${parts.join("")}</svg>`
  return sharp(Buffer.from(svg))
    .composite([{ input: await sharp(photo).resize(photoW, OG_H).toBuffer(), left: 0, top: 0 }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
}

const args = process.argv.slice(2)
const write = args.includes("--write")
const previewAt = args.indexOf("--preview")
const preview = previewAt >= 0 ? args[previewAt + 1] : null
const listed = args.filter((a, i) => !a.startsWith("--") && !(previewAt >= 0 && i === previewAt + 1))
const slugs = listed.length ? listed : Object.keys(PHOTOS)
const photoDir = preview ?? "src/assets/postacie"
const cardDir = preview ?? "public/og/postacie"
await mkdir(photoDir, { recursive: true })
await mkdir(cardDir, { recursive: true })

// A failed download is reported and skipped, so one bad file doesn't stop a
// long run.
async function download(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: UA })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
  }
  throw new Error(`download failed: ${url}`)
}

for (const slug of slugs) {
  const file = PHOTOS[slug]
  if (!file) throw new Error(`No photo listed for ${slug}`)
  let info, buffer
  try {
    info = await commonsInfo(file)
    buffer = await download(info.url)
  } catch (e) {
    console.log(`!! ${slug}: ${e.message}`)
    continue
  }
  const photo = await portrait(buffer, slug)
  await writeFile(`${photoDir}/${slug}.jpg`, photo)
  await writeFile(`${cardDir}/${preview ? `${slug}-card` : slug}.jpg`, await ogCard(photo, await frontMatter(slug)))
  // Plain values as in the hand-written blocks; quoted only when YAML needs it.
  const yaml = (v) => (/: |^[\s"'#&*!|>%@`{[\]-]|\s$/.test(v) ? JSON.stringify(v) : v)
  const block = `photo:
  src: ../../assets/postacie/${slug}.jpg
  credit: ${yaml(info.credit)}
  license: ${yaml(info.license)}
  source: ${info.source}`
  if (write && !preview) {
    const path = `src/content/postacie/${slug}.md`
    const text = await readFile(path, "utf8")
    const end = text.indexOf("\n---", 3)
    let head = text.slice(0, end).replace(/\nphoto:\n(?: {2}.*\n?)+/, "\n")
    head = /^wikiTitles:.*$/m.test(head) ? head.replace(/^(wikiTitles:.*)$/m, `$1\n${block}`) : `${head}\n${block}`
    await writeFile(path, head.replace(/\n+$/, "") + text.slice(end))
    console.log(`${slug}: ${info.license}, ${info.credit}`)
  } else if (!preview) {
    console.log(`# ${slug}\n${block}`)
  } else {
    console.log(`${slug}: preview`)
  }
}
