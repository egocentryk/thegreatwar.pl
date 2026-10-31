// Place pages (src/content/places, /miejsca/<id>) resolved for one language,
// and what each page lists by itself: the articles that link it, the battle
// pages that link it or were fought within `radiusKm` of its point
// (data/battle-coords.json). Used by the place pages and /miejsca.
import { getCollection, type CollectionEntry } from "astro:content"
import coords from "@/data/battle-coords.json"
import type { Lang } from "@/i18n"
import { localBattles, localEvents, paths } from "@/i18n/local"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"

const cache = new Map<Lang, ReturnType<typeof load>>()
export function localPlaces(lang: Lang) {
  if (!cache.has(lang)) cache.set(lang, load(lang))
  return cache.get(lang)!
}

async function load(lang: Lang) {
  const pl = (await getCollection("places", ({ data }) => !data.draft)).sort((a, b) =>
    a.data.name.localeCompare(b.data.name, "pl"),
  )
  const en = await getCollection("placesEn", ({ data }) => !data.draft)
  const enOf = new Map(en.map((entry) => [entry.data.source.id, entry]))
  const list = pl.flatMap((source) => {
    const english = enOf.get(source.id)
    if (lang === "en" && !english) return []
    const entry: CollectionEntry<"places"> | CollectionEntry<"placesEn"> = lang === "en" ? english! : source
    return [
      {
        id: source.id,
        slug: entry.id,
        href: paths(lang).placePage(entry.id),
        // The other language's page, when there is one.
        alternate: lang === "en" ? paths("pl").placePage(source.id) : english ? paths("en").placePage(english.id) : undefined,
        name: entry.data.name,
        title: entry.data.title,
        summary: entry.data.summary,
        brief: entry.data.brief,
        entry,
        source,
      },
    ]
  })
  return lang === "en" ? list.sort((a, b) => a.name.localeCompare(b.name, "en")) : list
}

export type LocalPlace = Awaited<ReturnType<typeof localPlaces>>[number]

// Great-circle distance in km.
function km(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

// Everything a place page lists below its text. Links are found in the
// Polish bodies (the English ones keep the same targets).
export async function placeFacts(place: LocalPlace, lang: Lang) {
  const { lat, lon, radiusKm } = place.source.data
  const link = `](/miejsca/${place.id})`

  const linking = new Set(
    (await getCollection("timeline", ({ data, body }) => !data.draft && (body ?? "").includes(link))).map((e) => e.id),
  )
  const articles = (await localEvents(lang)).filter((e) => linking.has(e.id)).sort(compareTimelineEntries)

  const at = coords as Record<string, { lat: number; lon: number }>
  const battleIds = new Set(
    (await getCollection("battles", ({ data }) => !data.draft))
      .filter((b) => (b.body ?? "").includes(link) || (at[b.id] && km(lat, lon, at[b.id].lat, at[b.id].lon) <= radiusKm))
      .map((b) => b.id),
  )
  const battles = (await localBattles(lang))
    .filter((b) => battleIds.has(b.id))
    .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf())

  return { articles, keyArticles: articles.filter((e) => e.data.milestone), battles }
}
