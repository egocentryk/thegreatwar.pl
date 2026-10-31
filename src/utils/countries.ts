// Country pages (src/content/countries, /kraje/<id>) resolved for one
// language, and what each page lists by itself, found by the state's `name`:
// its battle pages (a side's name mentions it), its person pages (`country`),
// its articles (tag) and key dates (milestones), and its rows in
// data/war-numbers.json. Used by the country pages and /kraje.
import { getCollection, type CollectionEntry } from "astro:content"
import type { Lang } from "@/i18n"
import { localBattles, localEvents, localPeople, paths } from "@/i18n/local"
import { listUrl } from "@/utils/filteredPages"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"
import { WAR_NUMBERS, type Row } from "@/utils/warNumbers"

export const SIDES = ["Ententa", "Państwa centralne", "Państwa neutralne"] as const

const cache = new Map<Lang, ReturnType<typeof load>>()
export function localCountries(lang: Lang) {
  if (!cache.has(lang)) cache.set(lang, load(lang))
  return cache.get(lang)!
}

async function load(lang: Lang) {
  const pl = (await getCollection("countries", ({ data }) => !data.draft)).sort(
    (a, b) => SIDES.indexOf(a.data.side) - SIDES.indexOf(b.data.side) || a.data.order - b.data.order,
  )
  const en = await getCollection("countriesEn", ({ data }) => !data.draft)
  const enOf = new Map(en.map((entry) => [entry.data.source.id, entry]))
  return pl.flatMap((source) => {
    const english = enOf.get(source.id)
    if (lang === "en" && !english) return []
    const entry: CollectionEntry<"countries"> | CollectionEntry<"countriesEn"> = lang === "en" ? english! : source
    return [
      {
        id: source.id,
        slug: entry.id,
        href: paths(lang).countryPage(entry.id),
        // The other language's page, when there is one.
        alternate:
          lang === "en" ? paths("pl").countryPage(source.id) : english ? paths("en").countryPage(english.id) : undefined,
        name: entry.data.name,
        title: entry.data.title,
        summary: entry.data.summary,
        brief: entry.data.brief,
        entry,
        source,
      },
    ]
  })
}

export type LocalCountry = Awaited<ReturnType<typeof localCountries>>[number]

// "Niemcy" in "Niemcy i Austro-Węgry" or "Wielka Brytania, Niemcy", as a
// whole name, not as part of a longer one.
function mentions(text: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(?:^|[\\s,(])${escaped}(?=$|[\\s,)])`, "u").test(text)
}

const DATASETS = ["mobilised", "militaryDeaths", "deathsShare"] as const

// Everything a country page lists below its text.
export async function countryFacts(country: LocalCountry, lang: Lang) {
  const { name, numbersAs } = country.source.data

  const plBattles = await getCollection("battles", ({ data }) => !data.draft)
  const battleIds = new Set(
    plBattles.filter((b) => b.data.sides.some((side) => mentions(side.name, name))).map((b) => b.id),
  )
  const battles = (await localBattles(lang))
    .filter((b) => battleIds.has(b.id))
    .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf())

  const people = (await localPeople(lang))
    .filter((p) => p.source.data.country === name)
    .sort((a, b) => a.data.name.localeCompare(b.data.name, lang === "en" ? "en" : "pl"))

  // Tags are matched on the Polish entries; English events keep their ids.
  const tagged = new Set(
    (await getCollection("timeline", ({ data }) => !data.draft && data.tags.includes(name))).map((e) => e.id),
  )
  const events = (await localEvents(lang)).filter((e) => tagged.has(e.id)).sort(compareTimelineEntries)

  const labels = [name, ...numbersAs]
  const numbers = DATASETS.flatMap((key) => {
    const dataset = WAR_NUMBERS[key]
    const row: Row | undefined = dataset?.rows.find((r) => labels.includes(r.label))
    return dataset && row ? [{ key, dataset, row }] : []
  })

  return {
    battles,
    keyBattles: battles.filter((b) => b.data.milestone),
    people,
    articles: events.length,
    keyDates: events.filter((e) => e.data.milestone),
    tagHref: events.length ? listUrl("tag", lang, name) : undefined,
    numbers,
  }
}
