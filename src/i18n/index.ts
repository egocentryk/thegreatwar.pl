// English edition: labels, Polish ↔ English lookups and link rewriting.
//
// English articles keep their links exactly as in the Polish source
// (/slug, /bitwy/slug, /postacie/slug, https://pl.wikipedia.org/wiki/…).
// rewriteEnHtml() turns them into English links on every build, so a link
// starts pointing at the English page as soon as that page is translated.

import { getCollection, type CollectionEntry } from "astro:content"
import wikiEn from "@/data/wiki-en.json"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"
import { pluralPl } from "@/utils/pluralPl"

export type Lang = "pl" | "en"

// Language alternates of a page, for <link hreflang> and the switcher.
export type Alternates = { pl?: string; en?: string }

export const CATEGORY_EN: Record<string, string> = {
  Dyplomacja: "Diplomacy",
  Polityka: "Politics",
  Wojsko: "Military",
  "Działania zbrojne": "Military operations",
  Społeczeństwo: "Society",
}

export const FRONT_EN: Record<string, string> = {
  "Front zachodni": "Western Front",
  "Front wschodni": "Eastern Front",
  "Front bałkański": "Balkan Front",
  "Front włoski": "Italian Front",
  "Bliski Wschód": "Middle East",
  "Wojna na morzu": "War at sea",
  Afryka: "Africa",
  "Azja i Pacyfik": "Asia and the Pacific",
}

export const SIDE_EN: Record<string, string> = {
  Ententa: "The Entente",
  "Państwa centralne": "The Central Powers",
  "Sprawa polska": "The Polish cause",
}

export const categoryEn = (c: string) => CATEGORY_EN[c] ?? c
export const frontEn = (f: string) => FRONT_EN[f] ?? f
export const sideEn = (s: string) => SIDE_EN[s] ?? s

export const enPath = {
  timeline: (slug: string) => `/en/${slug}`,
  battles: (slug: string) => `/en/battles/${slug}`,
  people: (slug: string) => `/en/people/${slug}`,
  topics: (slug: string) => `/en/topics/${slug}`,
}

export const plPath = {
  timeline: (id: string) => `/${id}`,
  battles: (id: string) => `/bitwy/${id}`,
  people: (id: string) => `/postacie/${id}`,
  topics: (id: string) => `/tematy/${id}`,
}

type Kind = keyof typeof enPath

// Polish id -> English slug, per collection. Cached for the whole build.
let mapsPromise: Promise<Record<Kind, Map<string, string>>> | undefined
export function enSlugMaps() {
  mapsPromise ??= (async () => {
    const [t, b, p, g] = await Promise.all([
      getCollection("timelineEn", ({ data }) => !data.draft),
      getCollection("battlesEn", ({ data }) => !data.draft),
      getCollection("peopleEn", ({ data }) => !data.draft),
      getCollection("topicsEn", ({ data }) => !data.draft),
    ])
    return {
      timeline: new Map(t.map((e) => [e.data.source.id, e.id])),
      battles: new Map(b.map((e) => [e.data.source.id, e.id])),
      people: new Map(p.map((e) => [e.data.source.id, e.id])),
      topics: new Map(g.map((e) => [e.data.source.id, e.id])),
    }
  })()
  return mapsPromise
}

// English URL of a Polish entry, or undefined if it is not translated yet.
export async function enUrlFor(kind: Kind, plId: string) {
  const slug = (await enSlugMaps())[kind].get(plId)
  return slug ? enPath[kind](slug) : undefined
}

const WIKI = wikiEn as Record<string, string | null>

// pl.wikipedia URL -> article title ("Isoroku Yamamoto"), or null.
export function plWikiTitle(href: string) {
  const m = href.match(/^https?:\/\/pl\.wikipedia\.org\/wiki\/([^#?]+)/)
  if (!m) return null
  let t = m[1]
  try {
    t = decodeURIComponent(t)
  } catch {}
  return t.replace(/_/g, " ").trim()
}

// en.wikipedia URL for a pl.wikipedia title, if there is a counterpart.
export function enWikiUrl(plTitle: string) {
  const en = WIKI[plTitle]
  return en ? `https://en.wikipedia.org/wiki/${encodeURIComponent(en.replace(/ /g, "_"))}` : undefined
}

const PL_MARK = ' <span class="lang-mark" title="W języku polskim / in Polish">(PL)</span>'

// Rewrites the links of a rendered English article:
//   /slug, /bitwy/slug, /postacie/slug -> English page if translated,
//     otherwise kept and marked (PL);
//   pl.wikipedia -> en.wikipedia if there is a counterpart,
//     otherwise kept and marked (PL).
export async function rewriteEnHtml(html: string) {
  const maps = await enSlugMaps()
  return html.replace(
    /<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g,
    (whole, rawHref: string, attrs: string, text: string) => {
      const href = rawHref.replace(/&amp;/g, "&")
      const wikiTitle = plWikiTitle(href)
      if (wikiTitle !== null) {
        // Section anchors of the Polish article do not exist in the English one.
        const url = enWikiUrl(wikiTitle)
        if (url) return `<a href="${url}"${attrs}>${text}</a>`
        return `${whole}${PL_MARK}`
      }
      const internal = href.match(/^\/(?:(bitwy|postacie|tematy)\/)?([a-z0-9-]+)(#[^"]*)?$/)
      if (internal) {
        const kind: Kind =
          internal[1] === "bitwy"
            ? "battles"
            : internal[1] === "postacie"
              ? "people"
              : internal[1] === "tematy"
                ? "topics"
                : "timeline"
        const slug = maps[kind].get(internal[2])
        if (slug) return `<a href="${enPath[kind](slug)}${internal[3] ?? ""}"${attrs}>${text}</a>`
        return `${whole}${PL_MARK}`
      }
      return whole
    },
  )
}

// Translated entries paired with their Polish source, sorted like the timeline.
export async function translatedTimeline() {
  const [en, pl] = await Promise.all([
    getCollection("timelineEn", ({ data }) => !data.draft),
    getCollection("timeline", ({ data }) => !data.draft),
  ])
  const byId = new Map(pl.map((e) => [e.id, e]))
  return en
    .map((entry) => ({ entry, source: byId.get(entry.data.source.id)! }))
    .filter((x) => x.source)
    .sort((a, b) => compareTimelineEntries(a.source, b.source)) as { entry: CollectionEntry<"timelineEn">; source: CollectionEntry<"timeline"> }[]
}

// "5 bitew" / "5 battles": the count's noun in the page language.
export function plural(
  lang: Lang,
  count: number,
  pl: [one: string, few: string, many: string],
  en: [one: string, many: string],
) {
  if (lang === "en") return count === 1 ? en[0] : en[1]
  return pluralPl(count, ...pl)
}

export const locale = (lang: Lang) => (lang === "en" ? "en-GB" : "pl-PL")
