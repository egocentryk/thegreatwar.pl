import type { CollectionEntry } from "astro:content"

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
const monthFormatter = new Intl.DateTimeFormat("pl-PL", {
  month: "long",
  timeZone: "UTC",
})

export function toCalendarLeaf(entry: CollectionEntry<"timeline">): CalendarLeaf {
  const { title, summary, category, front, date, milestone, dayOrder } =
    entry.data
  return {
    href: `/${entry.id}`,
    title,
    summary,
    category,
    front: front ?? null,
    day: String(date.getUTCDate()),
    month: monthFormatter.format(date),
    year: String(date.getUTCFullYear()),
    milestone,
    date: date.toISOString().slice(0, 10),
    dayOrder: dayOrder ?? 0,
  }
}
