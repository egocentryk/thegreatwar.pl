import type { CollectionEntry } from "astro:content"

type TimelineEntry = CollectionEntry<"timeline">

export interface TimelineMonthGroup {
  month: number
  slug: string
  label: string
  entries: TimelineEntry[]
}

export interface TimelineYearGroup {
  year: number
  months: TimelineMonthGroup[]
}

const monthFormatter = new Intl.DateTimeFormat("pl-PL", {
  month: "long",
  timeZone: "UTC",
})

function compareSameDayOrder(a: TimelineEntry, b: TimelineEntry) {
  return (b.data.dayOrder ?? 0) - (a.data.dayOrder ?? 0)
}

export function getTimelineMonthSlug(month: number) {
  return String(month + 1).padStart(2, "0")
}

export function groupTimelineEntries(entries: TimelineEntry[]) {
  const sortedEntries = [...entries].sort((a, b) => {
    const dateDifference = a.data.date.valueOf() - b.data.date.valueOf()

    if (dateDifference !== 0) {
      return dateDifference
    }

    return compareSameDayOrder(a, b)
  })

  return sortedEntries
    .reduce<TimelineYearGroup[]>((years, entry) => {
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
          label: monthFormatter.format(entry.data.date),
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
          entries: [...monthGroup.entries].sort((a, b) => {
            const dateDifference = a.data.date.valueOf() - b.data.date.valueOf()

            if (dateDifference !== 0) {
              return dateDifference
            }

            return compareSameDayOrder(a, b)
          }),
        })),
    }))
}
