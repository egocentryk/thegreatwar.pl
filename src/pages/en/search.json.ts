import type { APIRoute } from "astro"
import type { SearchDoc } from "@/pages/szukaj.json"
import { localBattles, localEvents } from "@/i18n/local"
import { formatDate, formatDateRange } from "@/utils/formatDate"

// English search index: translated events and battles only.
export const GET: APIRoute = async () => {
  const [events, battles] = await Promise.all([
    localEvents("en"),
    localBattles("en"),
  ])
  const docs: SearchDoc[] = [
    ...events.map((e) => ({
      h: e.href,
      t: e.data.title,
      s: e.data.summary,
      d: formatDate(e.data.date, "long", undefined, "en-GB"),
      k: e.data.date.toISOString().slice(0, 10),
      y: "e" as const,
      g: [e.data.front ?? "", e.data.category].join(" "),
      m: e.data.milestone,
    })),
    ...battles.map((b) => ({
      h: b.href,
      t: b.data.title,
      s: b.data.summary,
      d: formatDateRange(b.data.startDate, b.data.endDate, "en-GB"),
      k: b.data.startDate.toISOString().slice(0, 10),
      y: "b" as const,
      g: [
        b.data.front,
        b.data.location,
        ...b.data.sides.flatMap((side) => [side.name, ...side.commanders]),
      ].join(" "),
      m: b.data.milestone,
    })),
  ]
  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
