// Topic guides (src/content/topics, /tematy/<id>) resolved for one language,
// and the articles each guide covers: every timeline article and battle page
// its text links. Used by the guide pages, /tematy, the homepage cards and the
// "Temat" boxes on articles and battle pages.
import { getCollection, type CollectionEntry } from "astro:content"
import { locale, type Lang } from "@/i18n"
import { localBattles, localEvents, paths } from "@/i18n/local"
import { formatDate, formatDateRange } from "@/utils/formatDate"
import { readingMinutes } from "@/utils/requireEntry"

// Internal link targets in a body, in order of first appearance:
// "<timeline id>", "bitwy/<id>", "postacie/<id>". English bodies keep the
// Polish targets, so the Polish body serves both languages.
export function refsIn(body: string) {
  const refs: string[] = []
  for (const m of body.matchAll(/\]\(\/((?:bitwy\/|postacie\/)?[a-z0-9-]+)(?:#[^)]*)?\)/g)) {
    if (!refs.includes(m[1])) refs.push(m[1])
  }
  return refs
}

const cache = new Map<Lang, ReturnType<typeof load>>()
export function localTopics(lang: Lang) {
  if (!cache.has(lang)) cache.set(lang, load(lang))
  return cache.get(lang)!
}

async function load(lang: Lang) {
  const pl = (await getCollection("topics", ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order)
  const en = await getCollection("topicsEn", ({ data }) => !data.draft)
  const enOf = new Map(en.map((entry) => [entry.data.source.id, entry]))
  return pl.flatMap((source) => {
    const english = enOf.get(source.id)
    if (lang === "en" && !english) return []
    const entry: CollectionEntry<"topics"> | CollectionEntry<"topicsEn"> = lang === "en" ? english! : source
    return [
      {
        id: source.id,
        slug: entry.id,
        href: paths(lang).topicPage(entry.id),
        // The other language's page, when there is one.
        alternate:
          lang === "en" ? paths("pl").topicPage(source.id) : english ? paths("en").topicPage(english.id) : undefined,
        title: entry.data.title,
        question: entry.data.question,
        summary: entry.data.summary,
        // Section headings of the text, for the contents line on /tematy.
        sections: [...(entry.body ?? "").matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()),
        minutes: readingMinutes(entry.body),
        brief: entry.data.brief,
        refs: refsIn(source.body ?? ""),
        entry,
        source,
      },
    ]
  })
}

export type LocalTopic = Awaited<ReturnType<typeof localTopics>>[number]

// The guides that link a page. `ref` is a timeline id or "bitwy/<id>".
export async function topicsOf(ref: string, lang: Lang) {
  return (await localTopics(lang)).filter((topic) => topic.refs.includes(ref))
}

// A guide's articles and battle pages in date order, for its "Najważniejsze
// daty" list. Pages without a translation are left out of the English list.
export async function readingList(topic: LocalTopic, lang: Lang) {
  const loc = locale(lang)
  const events = new Map((await localEvents(lang)).map((e) => [e.id, e]))
  const battles = new Map((await localBattles(lang)).map((b) => [b.id, b]))
  return topic.refs
    .flatMap((ref) => {
      if (ref.startsWith("postacie/")) return []
      if (ref.startsWith("bitwy/")) {
        const b = battles.get(ref.slice("bitwy/".length))
        return b
          ? [{ ref, battle: true, href: b.href, title: b.data.title, summary: b.data.summary, date: b.data.startDate, when: formatDateRange(b.data.startDate, b.data.endDate, loc) }]
          : []
      }
      const e = events.get(ref)
      return e
        ? [{ ref, battle: false, href: e.href, title: e.data.title, summary: e.data.summary, date: e.data.date, when: formatDate(e.data.date, "long", undefined, loc) }]
        : []
    })
    .sort((a, b) => a.date.valueOf() - b.date.valueOf())
}
