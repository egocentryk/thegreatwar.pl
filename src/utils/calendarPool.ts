import type { APIRoute, GetStaticPaths } from "astro"
import type { Lang } from "@/i18n"
import { locale } from "@/i18n"
import { localEvents } from "@/i18n/local"
import { isOutsideWar } from "@/utils/groupTimelineEntries"
import {
  SHARD_COUNT,
  toCalendarLeaf,
  type CalendarLeaf,
  type DayFile,
} from "@/utils/calendarLeaf"

// The homepage calendar sections used to download every event (~1 MB) on
// each visit. Instead they fetch small static files:
//   <base>/dzien/MM-DD.json  "On this day": one file per calendar day
//   <base>/losowe/N.json     "Pages from the chronicle": one random shard

// How far back "On this day" looks when a date has no entries.
export const MAX_LOOKBACK_DAYS = 14

const pad = (n: number) => String(n).padStart(2, "0")

// Every MM-DD of a leap year, so 29 February has a file too.
function allMonthDays() {
  const days: string[] = []
  for (let d = new Date(Date.UTC(2000, 0, 1)); d.getUTCFullYear() === 2000; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(`${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`)
  }
  return days
}

function dayBefore(monthDay: string) {
  const d = new Date(Date.UTC(2000, Number(monthDay.slice(0, 2)) - 1, Number(monthDay.slice(3))))
  d.setUTCDate(d.getUTCDate() - 1)
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

async function leavesOf(lang: Lang) {
  // "On this day" and the random pages are days of the war, 1914–1918.
  return (await localEvents(lang))
    .filter((entry) => !isOutsideWar(entry.data.date.getUTCFullYear()))
    .map((entry) => toCalendarLeaf(entry, locale(lang)))
}

export function dayPaths(lang: Lang): GetStaticPaths {
  return async () => {
    const byDay = new Map<string, CalendarLeaf[]>()
    for (const leaf of await leavesOf(lang)) {
      const key = leaf.date.slice(5)
      byDay.set(key, [...(byDay.get(key) ?? []), leaf])
    }
    return allMonthDays().map((monthDay) => {
      let day = monthDay
      for (let back = 0; back <= MAX_LOOKBACK_DAYS; back++, day = dayBefore(day)) {
        const leaves = byDay.get(day)
        if (leaves) return { params: { day: monthDay }, props: { file: { day, leaves } satisfies DayFile } }
      }
      return { params: { day: monthDay }, props: { file: { day: null, leaves: [] } satisfies DayFile } }
    })
  }
}

export function shardPaths(lang: Lang): GetStaticPaths {
  return async () => {
    const shards: CalendarLeaf[][] = Array.from({ length: SHARD_COUNT }, () => [])
    // Round-robin over the chronological list, so every shard spans the whole war.
    ;(await leavesOf(lang)).forEach((leaf, i) => shards[i % SHARD_COUNT].push(leaf))
    return shards.map((leaves, i) => ({ params: { shard: String(i) }, props: { leaves } }))
  }
}

export const json: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props.file ?? props.leaves), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
