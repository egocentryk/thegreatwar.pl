// Themed series (data/series.ts) resolved for one language: titles, links,
// dates and reading time of every step. Used by the series pages, the
// homepage cards and the "Z serii" box on articles.
import { SERIES, type Series } from "@/data/series"
import { locale, type Lang } from "@/i18n"
import { curated, paths } from "@/i18n/local"
import { formatDate, formatDateRange } from "@/utils/formatDate"
import { readingMinutes } from "@/utils/requireEntry"

const step = (ref: string) =>
  ref.startsWith("bitwy/")
    ? { kind: "battles" as const, slug: ref.slice("bitwy/".length) }
    : { kind: "timeline" as const, slug: ref }

async function item(lang: Lang, ref: string) {
  const { kind, slug } = step(ref)
  const entry = await curated(lang, kind, slug)
  const battle = kind === "battles"
  return {
    ref,
    battle,
    href: entry.href,
    title: entry.title,
    summary: entry.summary,
    pl: entry.pl,
    milestone: entry.milestone,
    year: entry.date.getUTCFullYear(),
    when: battle
      ? formatDateRange(entry.date, entry.endDate, locale(lang))
      : formatDate(entry.date, "long", undefined, locale(lang)),
    minutes: readingMinutes(entry.body),
  }
}

export type SeriesItem = Awaited<ReturnType<typeof item>>

// Every article page asks for its series: resolve each one once per language.
const cache = new Map<string, ReturnType<typeof resolve>>()
export function resolveSeries(series: Series, lang: Lang) {
  const key = `${lang}:${series.slug}`
  if (!cache.has(key)) cache.set(key, resolve(series, lang))
  return cache.get(key)!
}

async function resolve(series: Series, lang: Lang) {
  const en = lang === "en"
  const steps = await Promise.all(
    series.steps.map(async (ref) => ({ ...(await item(lang, ref)), note: series.notes?.[ref]?.[lang] })),
  )
  const overview = series.overview ? await item(lang, series.overview) : undefined
  const years = steps.map((s) => s.year)
  return {
    slug: series.slug,
    href: paths(lang).seriesPage(en ? series.slugEn : series.slug),
    alternate: en ? paths("pl").seriesPage(series.slug) : paths("en").seriesPage(series.slugEn),
    title: en ? series.titleEn : series.title,
    lead: en ? series.leadEn : series.lead,
    intro: en ? series.introEn : series.intro,
    overview,
    steps,
    years: Math.min(...years) === Math.max(...years) ? `${years[0]}` : `${Math.min(...years)}–${Math.max(...years)}`,
    minutes: [...steps, ...(overview ? [overview] : [])].reduce((sum, s) => sum + s.minutes, 0),
  }
}

export type ResolvedSeries = Awaited<ReturnType<typeof resolveSeries>>

export const allSeries = (lang: Lang) => Promise.all(SERIES.map((series) => resolveSeries(series, lang)))

// The series a page belongs to (as a step or as the overview), with its
// position and neighbours. `ref` is a timeline slug or "bitwy/<slug>".
export async function seriesOf(ref: string, lang: Lang) {
  const found = SERIES.filter((series) => series.steps.includes(ref) || series.overview === ref)
  return Promise.all(
    found.map(async (series) => {
      const resolved = await resolveSeries(series, lang)
      const index = series.steps.indexOf(ref)
      return {
        series: resolved,
        index,
        previous: index > 0 ? resolved.steps[index - 1] : undefined,
        next: index >= 0 ? resolved.steps[index + 1] : resolved.steps[0],
      }
    }),
  )
}
