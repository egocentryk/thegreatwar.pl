// "Siły zbrojne" pages (src/content/forces, /sily-zbrojne/<id>) resolved for
// one language, and what each page lists by itself: its people, the battle
// pages and the articles that link it. Used by the force pages and
// /sily-zbrojne.
import { getCollection, type CollectionEntry } from "astro:content"
import type { Lang } from "@/i18n"
import { localBattles, localEvents, localPeople, paths } from "@/i18n/local"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"

const cache = new Map<Lang, ReturnType<typeof load>>()
export function localForces(lang: Lang) {
  if (!cache.has(lang)) cache.set(lang, load(lang))
  return cache.get(lang)!
}

async function load(lang: Lang) {
  const pl = (await getCollection("forces", ({ data }) => !data.draft)).sort((a, b) =>
    a.data.name.localeCompare(b.data.name, "pl"),
  )
  const en = await getCollection("forcesEn", ({ data }) => !data.draft)
  const enOf = new Map(en.map((entry) => [entry.data.source.id, entry]))
  const list = pl.flatMap((source) => {
    const english = enOf.get(source.id)
    if (lang === "en" && !english) return []
    const entry: CollectionEntry<"forces"> | CollectionEntry<"forcesEn"> = lang === "en" ? english! : source
    return [
      {
        id: source.id,
        slug: entry.id,
        href: paths(lang).forcePage(entry.id),
        // The other language's page, when there is one.
        alternate: lang === "en" ? paths("pl").forcePage(source.id) : english ? paths("en").forcePage(english.id) : undefined,
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

export type LocalForce = Awaited<ReturnType<typeof localForces>>[number]

// Everything a force page lists below its text. Links are found in the
// Polish bodies (the English ones keep the same targets).
export async function forceFacts(force: LocalForce, lang: Lang) {
  const link = `](/sily-zbrojne/${force.id})`

  const linking = new Set(
    (await getCollection("timeline", ({ data, body }) => !data.draft && (body ?? "").includes(link))).map((e) => e.id),
  )
  const articles = (await localEvents(lang)).filter((e) => linking.has(e.id)).sort(compareTimelineEntries)

  const battleIds = new Set(
    (await getCollection("battles", ({ data, body }) => !data.draft && (body ?? "").includes(link))).map((b) => b.id),
  )
  const battles = (await localBattles(lang))
    .filter((b) => battleIds.has(b.id))
    .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf())

  // People in the order of `people`; untranslated ones from the Polish list.
  const [local, polish] = await Promise.all([localPeople(lang), localPeople("pl")])
  const people = force.source.data.people.flatMap(({ id }) => {
    const person = local.find((p) => p.id === id) ?? polish.find((p) => p.id === id)
    return person ? [{ ...person, pl: !local.includes(person) }] : []
  })

  return { articles, battles, people }
}
