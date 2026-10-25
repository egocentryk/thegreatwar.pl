import type { LocalEvent } from "@/i18n/local"

// One timeline event as a tear-off calendar page, shared by the homepage
// section (RandomEvents.astro) and the /kartki.json pool it rerolls from.
export interface CalendarLeaf {
  href: string
  title: string
  summary: string
  category: string
  front: string | null
  day: string
  month: string
  year: string
  milestone: boolean
  // ISO date (YYYY-MM-DD) and same-day order, used by the homepage
  // "Tego dnia" section to match today's day and month.
  date: string
  dayOrder: number
}

// Standalone month name, as printed on a calendar: "czerwiec", not "czerwca".
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

export function toCalendarLeaf(entry: LocalEvent, locale = "pl-PL"): CalendarLeaf {
  const { title, summary, category, front, date, milestone, dayOrder } =
    entry.data
  return {
    href: entry.href,
    title,
    summary,
    category,
    front: front ?? null,
    day: String(date.getUTCDate()),
    month: monthFormatter(locale).format(date),
    year: String(date.getUTCFullYear()),
    milestone,
    date: date.toISOString().slice(0, 10),
    dayOrder,
  }
}
