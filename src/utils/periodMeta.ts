import type { Lang } from "@/i18n"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"
import { pluralPl } from "@/utils/pluralPl"

// Titles, headings and descriptions for search results:
//   periodMeta  year and month pages of the timeline (/timeline/<year>,
//               /timeline/<year>/<month> and their English versions):
//               "Marzec 1916 – I wojna światowa dzień po dniu";
//   listMeta    tag, category, author and front pages (FilteredTimeline).
// Both descriptions name key events of the page, as many as fit.

// Search results cut descriptions at about 155–160 characters.
const MAX_DESCRIPTION = 158

type Entry = { data: { title: string; date: Date; dayOrder?: number; milestone: boolean } }

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const events = (lang: Lang, count: number) =>
  lang === "en"
    ? `${count} ${count === 1 ? "event" : "events"}`
    : `${count} ${pluralPl(count, "wydarzenie", "wydarzenia", "wydarzeń")}`

// "<lead>, m.in. „A”, „B” i „C”." with as many of `candidates` as fit under
// MAX_DESCRIPTION (a name that doesn't fit is skipped, a shorter later one may
// still fit). `complete` is used instead when every event is named.
function withNames(
  lang: Lang,
  lead: string,
  candidates: string[],
  complete?: { lead: string; count: number },
) {
  const en = lang === "en"
  const quote = (name: string) => (en ? `“${name}”` : `„${name}”`)
  const join = (list: string[]) =>
    list.length < 2 ? list.join("") : `${list.slice(0, -1).join(", ")} ${en ? "and" : "i"} ${list.at(-1)}`
  const describe = (list: string[]) => {
    if (!list.length) return `${lead}.`
    if (complete && list.length === complete.count) return `${complete.lead}: ${join(list.map(quote))}.`
    return `${lead}, ${en ? "including" : "m.in."} ${join(list.map(quote))}.`
  }
  const names: string[] = []
  for (const name of [...new Set(candidates)].slice(0, 4)) {
    if (describe([...names, name]).length <= MAX_DESCRIPTION) names.push(name)
  }
  return describe(names)
}

export function periodMeta(
  lang: Lang,
  year: number,
  entries: Entry[],
  options: {
    // Standalone month name ("marzec", "March") on a month page.
    monthLabel?: string
    // Names to mention before the key events, e.g. the year's key battles.
    highlights?: string[]
  } = {},
) {
  const en = lang === "en"
  const { monthLabel, highlights = [] } = options
  const period = monthLabel ? `${capitalize(monthLabel)} ${year}` : String(year)
  const title = `${period} – ${en ? "the First World War day by day" : "I wojna światowa dzień po dniu"}`

  const subject = monthLabel ? period : en ? `The year ${year}` : `Rok ${year}`
  const chronicle = en
    ? `${subject} in the chronicle of the Great War`
    : `${subject} w kronice Wielkiej Wojny`
  const dayByDay = `${events(lang, entries.length)} ${en ? "day by day" : "dzień po dniu"}`

  // Highlights, then key events, then the rest in timeline order.
  const sorted = [...entries].sort(compareTimelineEntries)
  const candidates = [
    ...highlights,
    ...sorted.filter((e) => e.data.milestone).map((e) => e.data.title),
    ...sorted.filter((e) => !e.data.milestone).map((e) => e.data.title),
  ]
  // A short month lists every event, without "including".
  const description = withNames(
    lang,
    `${chronicle}: ${dayByDay}`,
    candidates,
    highlights.length ? undefined : { lead: chronicle, count: entries.length },
  )
  return { title, heading: period, description }
}

// Up to `count` items spread evenly over the list (first, …, last), so a list
// covering many years names events from its whole span.
function spread<T>(list: T[], count: number) {
  if (list.length <= count) return list
  return Array.from({ length: count }, (_, i) => list[Math.round((i * (list.length - 1)) / (count - 1))])
}

export function listMeta(
  lang: Lang,
  kind: "tag" | "category" | "author" | "front",
  name: string,
  // The whole list on its main page, one period on a split list's year page.
  entries: Entry[],
  // Label of that period on a year page ("1942").
  period?: string,
) {
  const en = lang === "en"
  const sorted = [...entries].sort(compareTimelineEntries)
  const from = sorted[0]?.data.date.getUTCFullYear()
  const to = sorted.at(-1)?.data.date.getUTCFullYear()
  const years =
    period ?? (from === to ? String(from) : `${from}–${to}`)
  const chronicle = en ? "the chronicle of the Great War" : "kronice Wielkiej Wojny"
  const count = entries.length

  let lead: string
  // Used when every event fits: the names alone, without the count.
  let complete: string
  if (kind === "author") {
    const articles = en
      ? `${count} ${count === 1 ? "article" : "articles"}`
      : `${count} ${pluralPl(count, "artykuł", "artykuły", "artykułów")}`
    lead = en
      ? `Author: ${name}. ${articles} of ${chronicle}, ${years}`
      : `Autor: ${name}. ${articles} w ${chronicle}, ${years}`
    complete = lead
  } else {
    const subject =
      kind === "category"
        ? en
          ? `Category “${name}”`
          : `Kategoria „${name}”`
        : capitalize(name)
    complete = en ? `${subject} in ${chronicle}, ${years}` : `${subject} w ${chronicle}, ${years}`
    lead = `${complete}: ${events(lang, count)}`
  }

  // Key events spread over the span, then other events the same way.
  const candidates = [
    ...spread(sorted.filter((e) => e.data.milestone), 4),
    ...spread(sorted.filter((e) => !e.data.milestone), 4),
  ].map((e) => e.data.title)
  return { description: withNames(lang, lead, candidates, { lead: complete, count }) }
}
