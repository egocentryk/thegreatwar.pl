// The glossary ("Słownik", /slownik and /en/glossary): terms from
// data/glossary.json with a short definition for the hover card, a longer one
// for the term's page, related pages and sources. Each term has a match
// pattern per language (inflected Polish forms), used to mark its first
// mention in an article (components/GlossaryMarks.astro) and to list the
// articles that use it.
import data from "@/data/glossary.json"
import type { Lang } from "@/i18n"
import { localBattles, localEvents } from "@/i18n/local"

export interface GlossaryEntry {
  slug: string
  slugEn: string
  term: string
  termEn: string
  category: Category
  pattern: string
  patternEn: string
  expansion: string
  expansionEn: string
  short: string
  shortEn: string
  long: string[]
  longEn: string[]
  see: string[]
  sources: string[]
  // Pages where the pattern means something else ("kryzys lipcowy" is
  // also the July Days of 1917): the term is neither marked nor listed there.
  exclude?: string[]
}

export type Category = "sprawa-polska" | "wojsko" | "bron" | "morze" | "polityka" | "rewolucja" | "okupacja"

export const CATEGORIES: Record<Category, { pl: string; en: string }> = {
  "sprawa-polska": { pl: "Sprawa polska", en: "The Polish question" },
  wojsko: { pl: "Wojsko", en: "Military" },
  bron: { pl: "Broń i technika", en: "Weapons and technology" },
  morze: { pl: "Wojna na morzu", en: "War at sea" },
  polityka: { pl: "Polityka i dyplomacja", en: "Politics and diplomacy" },
  rewolucja: { pl: "Rosja i rewolucja", en: "Russia and revolution" },
  okupacja: { pl: "Okupacja i ludność", en: "Occupation and civilians" },
}

export const GLOSSARY = (data as GlossaryEntry[]).sort((a, b) => a.term.localeCompare(b.term, "pl"))

export const glossaryPath = (lang: Lang) => (lang === "en" ? "/en/glossary" : "/slownik")
export const termPath = (lang: Lang, entry: GlossaryEntry) =>
  lang === "en" ? `/en/glossary/${entry.slugEn}` : `/slownik/${entry.slug}`
export const termName = (lang: Lang, entry: GlossaryEntry) => (lang === "en" ? entry.termEn : entry.term)

// Patterns are written with \w and \b; JavaScript's are ASCII-only, so \w
// becomes "a letter or digit" and \b "no letter on that side" (Polish
// letters included). Source shared with the script that marks the text.
export function patternSource(pattern: string) {
  return (
    "(?<!\\p{L})(?:" +
    pattern
      .replace(/\\w/g, "[\\p{L}\\p{N}_]")
      .replace(/(^|\|)\\b/g, "$1(?<!\\p{L})")
      .replace(/\\b/g, "(?!\\p{L})") +
    ")"
  )
}
const regexCache = new Map<string, RegExp>()
export function termRegex(entry: GlossaryEntry, lang: Lang) {
  const key = `${lang}:${entry.slug}`
  if (!regexCache.has(key)) regexCache.set(key, new RegExp(patternSource(lang === "en" ? entry.patternEn : entry.pattern), "u"))
  return regexCache.get(key)!
}

// Visible text of a markdown body: link targets removed.
const visible = (body: string) => body.replace(/\]\([^)]*\)/g, "]")

// Terms used in a text, for the marks on its page. `self`: the page's own
// ref (a timeline slug, "bitwy/<id>" or "postacie/<id>"); a term whose main
// page this is isn't marked there.
export function termsIn(body: string, lang: Lang, self?: string) {
  const text = visible(body)
  return GLOSSARY.filter(
    (entry) => entry.see[0] !== self && !(self && entry.exclude?.includes(self)) && termRegex(entry, lang).test(text),
  ).map((entry) => ({
    slug: entry.slug,
    term: termName(lang, entry),
    short: lang === "en" ? entry.shortEn : entry.short,
    href: termPath(lang, entry),
    pattern: patternSource(lang === "en" ? entry.patternEn : entry.pattern),
  }))
}
export type MarkedTerm = ReturnType<typeof termsIn>[number]

// Articles and battle pages that use a term (found in the Polish text), in
// date order, as listed in the given language.
export async function articlesUsing(entry: GlossaryEntry, lang: Lang) {
  const re = termRegex(entry, "pl")
  const [plEvents, plBattles, events, battles] = await Promise.all([
    localEvents("pl"),
    localBattles("pl"),
    localEvents(lang),
    localBattles(lang),
  ])
  const skip = new Set(entry.exclude ?? [])
  const usedEvents = new Set(plEvents.filter((e) => !skip.has(e.id) && re.test(visible(e.body))).map((e) => e.id))
  const usedBattles = new Set(
    plBattles.filter((b) => !skip.has(`bitwy/${b.id}`) && re.test(visible(b.body))).map((b) => b.id),
  )
  return [
    ...events.filter((e) => usedEvents.has(e.id)).map((e) => ({ href: e.href, title: e.data.title, date: e.data.date })),
    ...battles.filter((b) => usedBattles.has(b.id)).map((b) => ({ href: b.href, title: b.data.title, date: b.data.startDate })),
  ].sort((a, b) => a.date.valueOf() - b.date.valueOf())
}
