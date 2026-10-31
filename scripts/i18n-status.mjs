// English edition status: for every file in src/content/en, checks that its
// Polish source exists, that it has the same links, and whether the Polish
// text changed since translation (sourceHash = SHA-1 of the Polish file
// without its `sources:` list, which English pages share untranslated).
//
// Usage: node scripts/i18n-status.mjs           (report)
//        node scripts/i18n-status.mjs --stamp   (record the current hash in
//                                                files that have none)
//        node scripts/i18n-status.mjs --stamp=<english-slug>  (re-stamp one
//                                                file after updating it)
//        node scripts/i18n-status.mjs --ci      (GitHub Actions: problems as
//                                                warning annotations, exit 0)
//
// Also lists published Polish entries that have no English version yet.

import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join, basename } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const KINDS = { timeline: "timeline", battles: "battles", people: "postacie", topics: "topics", countries: "countries", places: "places" }
const stampArg = process.argv.find((a) => a.startsWith("--stamp"))
const stampOne = stampArg?.includes("=") ? stampArg.split("=")[1] : null
const ci = process.argv.includes("--ci")

// Names that contain a word the Polish-words check looks for.
const NAME_EXCEPTIONS = [/\bOraz Serdar\b/g]

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

// { file, message } — file is repo-relative, for CI annotations.
const problems = []
const report = (file, message) => problems.push({ file: file.replace(ROOT, ""), message })
let total = 0
let stale = 0
let missingCount = 0
for (const [kind, plDir] of Object.entries(KINDS)) {
  let plFiles = new Map()
  try {
    plFiles = new Map(walk(join(ROOT, "src/content", plDir)).map((f) => [basename(f, ".md"), f]))
  } catch {}
  let enFiles = []
  try {
    enFiles = walk(join(ROOT, "src/content/en", kind))
  } catch {}
  // Published Polish entries no English file points to.
  const translated = new Set(enFiles.map((f) => field(readFileSync(f, "utf8"), "source")))
  for (const [slug, plFile] of plFiles) {
    if (translated.has(slug) || field(readFileSync(plFile, "utf8"), "draft") === "true") continue
    missingCount++
    report(plFile, `${kind}/${slug}: no English translation`)
  }
  for (const f of enFiles) {
    total++
    const slug = basename(f, ".md")
    let en = readFileSync(f, "utf8")
    const source = field(en, "source")
    const plFile = plFiles.get(source)
    const where = `en/${kind}/${slug}`
    if (!plFile) {
      report(f, `${where}: no Polish source "${source}"`)
      continue
    }
    const pl = readFileSync(plFile, "utf8")
    const hash = createHash("sha1").update(pl.replace(/^sources:\n(?: {2}- .*\n)*/m, "")).digest("hex")

    const a = links(pl).join("\n")
    const b = links(en).join("\n")
    if (a !== b) {
      const pa = links(pl), pb = links(en)
      const missing = pa.filter((x) => !pb.includes(x))
      const extra = pb.filter((x) => !pa.includes(x))
      report(f, `${where}: links differ (${pa.length} pl, ${pb.length} en)` +
        (missing.length ? `\n    missing: ${missing.join(", ")}` : "") +
        (extra.length ? `\n    extra: ${extra.join(", ")}` : ""))
    }
    // Unquoted scalar values must not contain ": " or start with a YAML indicator.
    for (const line of (en.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "").split("\n")) {
      const v = line.match(/^\s*(?:- )?[A-Za-z]+: (.+)$/)?.[1]
      if (v && !/^["'\[]/.test(v) && (/: /.test(v) || /^[*&#!|>%@`{]/.test(v)))
        report(f, `${where}: unquoted YAML value needs quotes: ${line.trim().slice(0, 60)}`)
    }
    const summary = field(en, "summary") ?? ""
    if (summary.length > 160) report(f, `${where}: summary ${summary.length} > 160`)

    let body = en.replace(/^---[\s\S]*?\n---\n/, "").replace(/\]\([^)]*\)/g, "]")
    for (const name of NAME_EXCEPTIONS) body = body.replace(name, "")
    const polish = body.match(/(?<![\p{L}])(?:się|oraz|że|który|która|które|jest|był|była|było|przez|został|została)(?![\p{L}])/giu)
    if (polish) report(f, `${where}: Polish words left: ${[...new Set(polish)].join(", ")}`)

    const current = field(en, "sourceHash")
    if (stampArg && (stampOne ? stampOne === slug : !current)) {
      en = current
        ? en.replace(/^sourceHash:.*$/m, `sourceHash: ${hash}`)
        : en.replace(/^source:.*$/m, (line) => `${line}\nsourceHash: ${hash}`)
      writeFileSync(f, en)
    } else if (!current) {
      report(f, `${where}: no sourceHash (run with --stamp)`)
    } else if (current !== hash) {
      stale++
      report(f, `${where}: Polish source changed since translation`)
    }
  }
}

const summaryLine = `${total} English files, ${missingCount} untranslated, ${stale} stale, ${problems.length} problems`
if (ci) {
  // https://docs.github.com/actions/reference/workflow-commands-for-github-actions
  const escape = (text) => text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")
  for (const p of problems) console.log(`::warning file=${p.file},title=English edition::${escape(p.message)}`)
  console.log(summaryLine)
} else {
  for (const p of problems) console.log(p.message)
  console.log(`\n${summaryLine}`)
  process.exitCode = problems.length ? 1 : 0
}
