import type { CollectionEntry } from "astro:content"

type TimelineEntry = CollectionEntry<"timeline">

// Anything with a date and same-day order: collection entries and the
// localised events of src/i18n/local.ts.
type Dated = { data: { date: Date; dayOrder?: number } }

// What the timeline lists show of an entry: collection entries (Polish
// pages) or localised events (src/i18n/local.ts), which carry their own href.
export type ArchiveEntry = {
  id: string
  href?: string
  data: {
    title: string
    summary: string
    date: Date
    dayOrder?: number
    milestone: boolean
  }
}

export interface TimelineMonthGroup<T extends Dated = TimelineEntry> {
  month: number
  slug: string
  label: string
  entries: T[]
}

export interface TimelineYearGroup<T extends Dated = TimelineEntry> {
  year: number
  months: TimelineMonthGroup<T>[]
}

const monthFormatters = new Map<string, Intl.DateTimeFormat>()
const monthFormatter = (locale: string) => {
  if (!monthFormatters.has(locale)) {
    monthFormatters.set(
      locale,
      new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }),
    )
  }
  return monthFormatters.get(locale)!
}

function compareSameDayOrder(a: Dated, b: Dated) {
  return (b.data.dayOrder ?? 0) - (a.data.dayOrder ?? 0)
}

// Chronological order of the timeline: by date, then higher dayOrder first.
export function compareTimelineEntries(a: Dated, b: Dated) {
  const dateDifference = a.data.date.valueOf() - b.data.date.valueOf()

  if (dateDifference !== 0) {
    return dateDifference
  }

  return compareSameDayOrder(a, b)
}

// The chronicle proper covers 1914–1918. Articles outside it share an era
// page instead of a page per year and month: "Przed wojną" (1879–1913) and
// "Po wojnie" (1919–1923, the wars that carried the Great War on).
export const WAR_START_YEAR = 1914
export const WAR_END_YEAR = 1918
export type Era = "pre" | "post"
export const eraOf = (year: number | string): Era | undefined =>
  Number(year) < WAR_START_YEAR ? "pre" : Number(year) > WAR_END_YEAR ? "post" : undefined
export const isPreWar = (year: number | string) => eraOf(year) === "pre"
export const isOutsideWar = (year: number | string) => eraOf(year) !== undefined
// A year as the war's year menus show it: years outside the war go with the
// nearest war year (split tag and category lists keep them on its page).
export const warYear = (year: number) => Math.min(Math.max(year, WAR_START_YEAR), WAR_END_YEAR)

export function getTimelineMonthSlug(month: number) {
  return String(month + 1).padStart(2, "0")
}

export function groupTimelineEntries<T extends Dated = TimelineEntry>(
  entries: T[],
  locale = "pl-PL",
) {
  const sortedEntries = [...entries].sort(compareTimelineEntries)

  return sortedEntries
    .reduce<TimelineYearGroup<T>[]>((years, entry) => {
      const year = entry.data.date.getUTCFullYear()
      const month = entry.data.date.getUTCMonth()

      let yearGroup = years.find((item) => item.year === year)
      if (!yearGroup) {
        yearGroup = { year, months: [] }
        years.push(yearGroup)
      }

      let monthGroup = yearGroup.months.find((item) => item.month === month)
      if (!monthGroup) {
        monthGroup = {
          month,
          slug: getTimelineMonthSlug(month),
          label: monthFormatter(locale).format(entry.data.date),
          entries: [],
        }
        yearGroup.months.push(monthGroup)
      }

      monthGroup.entries.push(entry)
      return years
    }, [])
    .map((yearGroup) => ({
      ...yearGroup,
      months: yearGroup.months
        .sort((a, b) => a.month - b.month)
        .map((monthGroup) => ({
          ...monthGroup,
          entries: [...monthGroup.entries].sort(compareTimelineEntries),
        })),
    }))
}
