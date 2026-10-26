import { getCollection, type CollectionEntry } from "astro:content"
import { frontEn } from "@/i18n"
import { localEvents, type LocalEvent } from "@/i18n/local"
import { slugify } from "@/utils/slugify"

// Timeline pages for one tag, category, author or front (FilteredTimeline).
// Lists longer than SPLIT_THRESHOLD are split by year: the main page shows
// the first year, every later year gets <base>/<year>.

export const SPLIT_THRESHOLD = 300

type Dated = { data: { date: Date } }

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
    const year = entry.data.date.getUTCFullYear()
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts]
    .sort(([a], [b]) => a - b)
    .map(([year, count], i) => ({ year, count, href: i === 0 ? base : `${base}/${year}` }))
}

// Years that get their own page (all but the first of a split list).
export const extraYears = (entries: Dated[], base: string) =>
  (yearLinks(entries, base) ?? []).slice(1).map((link) => link.year)

export interface Group<T> {
  slug: string
  name: string
  entries: T[]
}

type Entry = CollectionEntry<"timeline">

const published = () => getCollection("timeline", ({ data }) => !data.draft)

function collect<T>(items: T[], keys: (item: T) => string[]) {
  const groups = new Map<string, Group<T>>()
  for (const item of items) {
    for (const name of keys(item)) {
      const slug = slugify(name)
      const group = groups.get(slug) ?? { slug, name, entries: [] }
      group.entries.push(item)
      groups.set(slug, group)
    }
  }
  return [...groups.values()]
}

export const tagGroups = async () => collect<Entry>(await published(), (e) => e.data.tags)
export const categoryGroups = async () => collect<Entry>(await published(), (e) => [e.data.category])
export const authorGroups = async () => collect<Entry>(await published(), (e) => e.data.authors)
// Polish front names, e.g. "Front zachodni".
export const frontGroups = async () =>
  collect<Entry>(await published(), (e) => (e.data.front ? [e.data.front] : []))
// English fronts; `name` stays the Polish key, the page shows frontEn(name).
export const frontGroupsEn = async () =>
  collect<LocalEvent>(await localEvents("en"), (e) => (e.data.frontKey ? [e.data.frontKey] : [])).map(
    (group) => ({ ...group, slug: slugify(frontEn(group.name)) }),
  )
