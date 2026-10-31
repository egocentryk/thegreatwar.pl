// Localised views of the collections, shared by the Polish and English pages.
//
// Polish: every entry, linked to its Polish page.
// English: only translated entries, with the English text and URL; dates,
// flags and relations still come from the Polish source.
//
// Entries keep the `{ id, data }` shape of collection entries (id = Polish id)
// so the grouping helpers and TimelineArchive work on both; `href` is the
// page URL in the chosen language.

import { getCollection, type CollectionEntry } from "astro:content"
import { categoryEn, enPath, frontEn, plPath, translatedTimeline, type Lang } from "@/i18n"
import { CURATED_EN } from "@/i18n/data-en"
import { compareTimelineEntries, eraOf, type Era } from "@/utils/groupTimelineEntries"
import { getPeople } from "@/utils/people"
import { requireBattle, requireTimeline } from "@/utils/requireEntry"
import { slugify } from "@/utils/slugify"

export interface LocalEvent {
  id: string
  href: string
  body: string
  data: {
    title: string
    summary: string
    date: Date
    dayOrder: number
    milestone: boolean
    category: string
    front?: string
    // Polish front and category names, for grouping and counting.
    frontKey?: string
    categoryKey: string
    battleId?: string
    tags: string[]
    authors: string[]
  }
}

export interface LocalBattle {
  id: string
  href: string
  body: string
  data: {
    title: string
    summary: string
    startDate: Date
    endDate: Date
    front: string
    frontKey: string
    phase: string
    milestone: boolean
    location: string
    result: string
    sides: { name: string; commanders: string[] }[]
    // Polish commander names, in the same order, for person lookups.
    commandersPl: string[][]
  }
}

export interface LocalPerson {
  id: string
  href: string
  source: CollectionEntry<"people">
  data: {
    name: string
    summary: string
    role: string
    country: string
    aliases: string[]
  }
}

// Page URLs in each language.
export function paths(lang: Lang) {
  const en = lang === "en"
  const eras: Record<Era, string> = {
    pre: en ? "/en/timeline/before-the-war" : "/timeline/przed-wojna",
    post: en ? "/en/timeline/after-the-war" : "/timeline/po-wojnie",
  }
  return {
    home: en ? "/en" : "/",
    timeline: en ? "/en/timeline" : "/timeline",
    // The years before and after the war share one page per era; a month
    // there is an anchor.
    era: eras.pre,
    eraAfter: eras.post,
    eraPage: (era: Era) => eras[era],
    year: (year: number | string) => {
      const era = eraOf(year)
      return era ? eras[era] : `${en ? "/en" : ""}/timeline/${year}`
    },
    month: (year: number | string, month: string) => {
      const era = eraOf(year)
      return era ? `${eras[era]}#${year}-${month}` : `${en ? "/en" : ""}/timeline/${year}/${month}`
    },
    battles: en ? "/en/battles" : "/bitwy",
    front: (name: string) => (en ? `/en/front/${slugify(frontEn(name))}` : `/front/${slugify(name)}`),
    // Anchor of a front on the battles page.
    frontAnchor: (name: string) => slugify(en ? frontEn(name) : name),
    people: en ? "/en/people" : "/postacie",
    topics: en ? "/en/topics" : "/tematy",
    topicPage: (slug: string) => (en ? `/en/topics/${slug}` : `/tematy/${slug}`),
    countries: en ? "/en/countries" : "/kraje",
    countryPage: (slug: string) => (en ? `/en/countries/${slug}` : `/kraje/${slug}`),
    places: en ? "/en/places" : "/miejsca",
    placePage: (slug: string) => (en ? `/en/places/${slug}` : `/miejsca/${slug}`),
    series: en ? "/en/series" : "/serie",
    seriesPage: (slug: string) => (en ? `/en/series/${slug}` : `/serie/${slug}`),
    search: en ? "/en/search" : "/szukaj",
    // Folder of the homepage calendar files (utils/calendarPool.ts).
    leaves: en ? "/en/kartki" : "/kartki",
    searchIndex: en ? "/en/search.json" : "/szukaj.json",
    battleCards: en ? "/en/battles.json" : "/bitwy.json",
    personCards: en ? "/en/people.json" : "/postacie.json",
  }
}

const cache = new Map<string, Promise<unknown>>()
function cached<T>(key: string, load: () => Promise<T>) {
  if (!cache.has(key)) cache.set(key, load())
  return cache.get(key) as Promise<T>
}

function plEvent(entry: CollectionEntry<"timeline">): LocalEvent {
  const d = entry.data
  return {
    id: entry.id,
    href: plPath.timeline(entry.id),
    body: entry.body ?? "",
    data: {
      title: d.title,
      summary: d.summary,
      date: d.date,
      dayOrder: d.dayOrder ?? 0,
      milestone: d.milestone,
      category: d.category,
      front: d.front,
      frontKey: d.front,
      categoryKey: d.category,
      battleId: d.battle?.id,
      tags: d.tags,
      authors: d.authors,
    },
  }
}

// Timeline events in chronological order.
export function localEvents(lang: Lang): Promise<LocalEvent[]> {
  return cached(`events:${lang}`, async () => {
    if (lang === "pl") {
      const entries = await getCollection("timeline", ({ data }) => !data.draft)
      return entries.sort(compareTimelineEntries).map(plEvent)
    }
    return (await translatedTimeline()).map(({ entry, source }) => {
      const base = plEvent(source)
      return {
        ...base,
        href: enPath.timeline(entry.id),
        data: {
          ...base.data,
          title: entry.data.title,
          summary: entry.data.summary,
          category: categoryEn(source.data.category),
          front: source.data.front ? frontEn(source.data.front) : undefined,
        },
      }
    })
  })
}

function plBattle(battle: CollectionEntry<"battles">): LocalBattle {
  const d = battle.data
  return {
    id: battle.id,
    href: plPath.battles(battle.id),
    body: battle.body ?? "",
    data: {
      title: d.title,
      summary: d.summary,
      startDate: d.startDate,
      endDate: d.endDate,
      front: d.front,
      frontKey: d.front,
      phase: d.phase,
      milestone: d.milestone,
      location: d.location,
      result: d.result,
      sides: d.sides,
      commandersPl: d.sides.map((side) => side.commanders),
    },
  }
}

// Battles in order of their start date.
export function localBattles(lang: Lang): Promise<LocalBattle[]> {
  return cached(`battles:${lang}`, async () => {
    const pl = (await getCollection("battles", ({ data }) => !data.draft)).sort(
      (a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf(),
    )
    if (lang === "pl") return pl.map(plBattle)
    const en = await getCollection("battlesEn", ({ data }) => !data.draft)
    const bySource = new Map(en.map((e) => [e.data.source.id, e]))
    return pl.flatMap((battle) => {
      const tr = bySource.get(battle.id)
      if (!tr) return []
      const base = plBattle(battle)
      return [
        {
          ...base,
          href: enPath.battles(tr.id),
          data: {
            ...base.data,
            title: tr.data.title,
            summary: tr.data.summary,
            front: frontEn(battle.data.front),
            location: tr.data.location,
            result: tr.data.result,
            sides: tr.data.sides,
          },
        },
      ]
    })
  })
}

// People, unsorted.
export function localPeople(lang: Lang): Promise<LocalPerson[]> {
  return cached(`people:${lang}`, async () => {
    const pl = await getPeople()
    const plView = (person: CollectionEntry<"people">): LocalPerson => ({
      id: person.id,
      href: plPath.people(person.id),
      source: person,
      data: {
        name: person.data.name,
        summary: person.data.summary,
        role: person.data.role,
        country: person.data.country,
        aliases: person.data.aliases,
      },
    })
    if (lang === "pl") return pl.map(plView)
    const en = await getCollection("peopleEn", ({ data }) => !data.draft)
    const bySource = new Map(en.map((e) => [e.data.source.id, e]))
    return pl.flatMap((person) => {
      const tr = bySource.get(person.id)
      if (!tr) return []
      return [
        {
          id: person.id,
          href: enPath.people(tr.id),
          source: person,
          data: {
            name: tr.data.name,
            summary: tr.data.summary,
            role: tr.data.role,
            country: tr.data.country,
            aliases: [tr.data.name, ...person.data.aliases],
          },
        },
      ]
    })
  })
}

// A hand-picked event or battle for the homepage. English falls back to the
// Polish page with an English title from CURATED_EN; `pl` marks the fallback.
export async function curated(lang: Lang, kind: "timeline" | "battles", slug: string) {
  if (kind === "timeline") {
    const source = await requireTimeline(slug)
    const local = (await localEvents(lang)).find((e) => e.id === slug)
    const fallback = lang === "en" ? CURATED_EN[`timeline:${slug}`] : undefined
    if (lang === "en" && !local && !fallback) throw new Error(`CURATED_EN: missing timeline:${slug}`)
    return {
      href: local?.href ?? plPath.timeline(slug),
      title: local?.data.title ?? fallback?.title ?? source.data.title,
      summary: local?.data.summary ?? fallback?.summary ?? source.data.summary,
      date: source.data.date,
      endDate: source.data.date,
      milestone: source.data.milestone,
      body: source.body,
      pl: lang === "en" && !local,
    }
  }
  const source = await requireBattle(slug)
  const local = (await localBattles(lang)).find((b) => b.id === slug)
  const fallback = lang === "en" ? CURATED_EN[`battles:${slug}`] : undefined
  if (lang === "en" && !local && !fallback) throw new Error(`CURATED_EN: missing battles:${slug}`)
  return {
    href: local?.href ?? plPath.battles(slug),
    title: local?.data.title ?? fallback?.title ?? source.data.title,
    summary: local?.data.summary ?? fallback?.summary ?? source.data.summary,
    date: source.data.startDate,
    endDate: source.data.endDate,
    milestone: source.data.milestone,
    body: source.body,
    pl: lang === "en" && !local,
  }
}
