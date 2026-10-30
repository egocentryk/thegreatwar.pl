import type { GetStaticPaths } from "astro"
import { categoryEn, frontEn, type Lang } from "@/i18n"
import { tagEn } from "@/i18n/data-en"
import { localEvents, type LocalEvent } from "@/i18n/local"
import { WAR_START_YEAR } from "@/utils/groupTimelineEntries"
import { slugify } from "@/utils/slugify"

// Timeline pages for one tag, category, author or front, in both languages
// (FilteredTimeline.astro). Lists longer than SPLIT_THRESHOLD are split by
// year: the main page shows the first year, every later year gets
// <base>/<year>.

export const SPLIT_THRESHOLD = 300
// A tag page with fewer articles than this is kept out of search engines
// ("noindex, follow"): it adds little beyond the articles themselves (and,
// for a person, beyond the person page). It becomes indexable again once the
// tag grows.
export const MIN_INDEXED = 3
export const isThin = (kind: Kind, group: Group) => kind === "tag" && group.entries.length < MIN_INDEXED

export type Kind = "tag" | "category" | "author" | "front"

const BASES: Record<Kind, Record<Lang, string>> = {
  tag: { pl: "/tag", en: "/en/tag" },
  category: { pl: "/kategoria", en: "/en/category" },
  author: { pl: "/autor", en: "/en/author" },
  front: { pl: "/front", en: "/en/front" },
}

export const LABELS: Record<Kind, Record<Lang, string>> = {
  tag: { pl: "Tag", en: "Tag" },
  category: { pl: "Kategoria", en: "Category" },
  author: { pl: "Autor", en: "Author" },
  front: { pl: "Front", en: "Front" },
}

// Polish keys an event is listed under.
const KEYS: Record<Kind, (event: LocalEvent) => string[]> = {
  tag: (e) => e.data.tags,
  category: (e) => [e.data.categoryKey],
  author: (e) => e.data.authors,
  front: (e) => (e.data.frontKey ? [e.data.frontKey] : []),
}

// Name shown on the page; Polish pages show the key itself.
export function displayName(kind: Kind, lang: Lang, key: string) {
  if (lang === "pl") return key
  if (kind === "tag") return tagEn(key)
  if (kind === "category") return categoryEn(key)
  if (kind === "front") return frontEn(key)
  return key
}

// URL of the page for one key, e.g. listUrl("tag", "en", "Polska") -> "/en/tag/poland".
export const listUrl = (kind: Kind, lang: Lang, key: string) =>
  `${BASES[kind][lang]}/${slugify(displayName(kind, lang, key))}`

export interface Group {
  key: string // Polish name
  name: string // name shown on the page
  slug: string
  base: string // URL of the main page
  entries: LocalEvent[]
}

const cache = new Map<string, Promise<Group[]>>()
export function groups(kind: Kind, lang: Lang): Promise<Group[]> {
  const id = `${kind}:${lang}`
  if (!cache.has(id)) {
    cache.set(
      id,
      localEvents(lang).then((events) => {
        const bySlug = new Map<string, Group>()
        for (const event of events) {
          for (const key of KEYS[kind](event)) {
            const name = displayName(kind, lang, key)
            const slug = slugify(name)
            const group = bySlug.get(slug) ?? { key, name, slug, base: listUrl(kind, lang, key), entries: [] }
            group.entries.push(event)
            bySlug.set(slug, group)
          }
        }
        return [...bySlug.values()]
      }),
    )
  }
  return cache.get(id)!
}

type Dated = { data: { date: Date } }

// Year of an entry in a split list; the years before the war count as the
// first war year, so they stay on the main page.
export const listYear = (date: Date) => Math.max(date.getUTCFullYear(), WAR_START_YEAR)

export interface YearLink {
  year: number
  href: string
  count: number
}

// Year menu of a split list, or undefined when the list fits on one page.
export function yearLinks(entries: Dated[], base: string): YearLink[] | undefined {
  if (entries.length <= SPLIT_THRESHOLD) return undefined
  const counts = new Map<number, number>()
  for (const entry of entries) {
    const year = listYear(entry.data.date)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts]
    .sort(([a], [b]) => a - b)
    .map(([year, count], i) => ({ year, count, href: i === 0 ? base : `${base}/${year}` }))
}

// The same list in the other language: its main page, or for a year page the
// page of that year when the other list is split too. Undefined if missing.
export async function counterpart(kind: Kind, lang: Lang, key: string, year?: number) {
  const other: Lang = lang === "pl" ? "en" : "pl"
  const group = (await groups(kind, other)).find((g) => g.key === key)
  if (!group) return undefined
  if (year === undefined) return group.base
  return yearLinks(group.entries, group.base)?.find((link) => link.year === year)?.href
}

// getStaticPaths for <base>/[param].astro and <base>/[param]/[year].astro.
export const mainPaths =
  (kind: Kind, lang: Lang, param: string): GetStaticPaths =>
  async () =>
    (await groups(kind, lang)).map((group) => ({
      params: { [param]: group.slug },
      props: { group },
    }))

// Later years of a long list; the first year is on the main page.
export const yearPaths =
  (kind: Kind, lang: Lang, param: string): GetStaticPaths =>
  async () =>
    (await groups(kind, lang)).flatMap((group) =>
      (yearLinks(group.entries, group.base) ?? []).slice(1).map(({ year }) => ({
        params: { [param]: group.slug, year: String(year) },
        props: { group, year },
      })),
    )
