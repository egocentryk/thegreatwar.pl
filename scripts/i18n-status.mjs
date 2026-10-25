// English edition status: for every file in src/content/en, checks that its
// Polish source exists, that it has the same links, and whether the Polish
// text changed since translation (sourceHash = SHA-1 of the Polish file).
//
// Usage: node scripts/i18n-status.mjs           (report)
//        node scripts/i18n-status.mjs --stamp   (record the current hash in
//                                                files that have none)
//        node scripts/i18n-status.mjs --stamp=<english-slug>  (re-stamp one
//                                                file after updating it)

import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join, basename } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const KINDS = { timeline: "timeline", battles: "battles", people: "postacie" }
const stampArg = process.argv.find((a) => a.startsWith("--stamp"))
const stampOne = stampArg?.includes("=") ? stampArg.split("=")[1] : null

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith(".md")) out.push(p)
  }
  return out
}

const links = (s) => [...s.matchAll(/\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g)].map((m) => m[1]).sort()
const field = (s, name) => s.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]?.replace(/^"|"$/g, "")

const problems = []
let total = 0
let stale = 0
for (const [kind, plDir] of Object.entries(KINDS)) {
  const plFiles = new Map(walk(join(ROOT, "src/content", plDir)).map((f) => [basename(f, ".md"), f]))
  let enFiles = []
  try {
    enFiles = walk(join(ROOT, "src/content/en", kind))
  } catch {}
  for (const f of enFiles) {
    total++
    const slug = basename(f, ".md")
    let en = readFileSync(f, "utf8")
    const source = field(en, "source")
    const plFile = plFiles.get(source)
    const where = `en/${kind}/${slug}`
    if (!plFile) {
      problems.push(`${where}: no Polish source "${source}"`)
      continue
    }
    const pl = readFileSync(plFile, "utf8")
    const hash = createHash("sha1").update(pl).digest("hex")

    const a = links(pl).join("\n")
    const b = links(en).join("\n")
    if (a !== b) {
      const pa = links(pl), pb = links(en)
      const missing = pa.filter((x) => !pb.includes(x))
      const extra = pb.filter((x) => !pa.includes(x))
      problems.push(`${where}: links differ (${pa.length} pl, ${pb.length} en)` +
        (missing.length ? `\n    missing: ${missing.join(", ")}` : "") +
        (extra.length ? `\n    extra: ${extra.join(", ")}` : ""))
    }
    // Unquoted scalar values must not contain ": " or start with a YAML indicator.
    for (const line of (en.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "").split("\n")) {
      const v = line.match(/^\s*(?:- )?[A-Za-z]+: (.+)$/)?.[1]
      if (v && !/^["'\[]/.test(v) && (/: /.test(v) || /^[*&#!|>%@`{]/.test(v)))
        problems.push(`${where}: unquoted YAML value needs quotes: ${line.trim().slice(0, 60)}`)
    }
    const summary = field(en, "summary") ?? ""
    if (summary.length > 160) problems.push(`${where}: summary ${summary.length} > 160`)

    const body = en.replace(/^---[\s\S]*?\n---\n/, "").replace(/\]\([^)]*\)/g, "]")
    const polish = body.match(/(?<![\p{L}])(?:się|oraz|że|który|która|które|jest|był|była|było|przez|został|została)(?![\p{L}])/giu)
    if (polish) problems.push(`${where}: Polish words left: ${[...new Set(polish)].join(", ")}`)

    const current = field(en, "sourceHash")
    if (stampArg && (stampOne ? stampOne === slug : !current)) {
      en = current
        ? en.replace(/^sourceHash:.*$/m, `sourceHash: ${hash}`)
        : en.replace(/^source:.*$/m, (line) => `${line}\nsourceHash: ${hash}`)
      writeFileSync(f, en)
    } else if (!current) {
      problems.push(`${where}: no sourceHash (run with --stamp)`)
    } else if (current !== hash) {
      stale++
      problems.push(`${where}: Polish source changed since translation`)
    }
  }
}

for (const p of problems) console.log(p)
console.log(`\n${total} English files, ${stale} stale, ${problems.length} problems`)
process.exitCode = problems.length ? 1 : 0
