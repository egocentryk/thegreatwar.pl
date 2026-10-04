import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { formatDate, formatDateRange } from "@/utils/formatDate"

// Search index for the homepage and /szukaj, fetched only when someone
// starts searching. Short keys keep the file small.
export interface SearchDoc {
  h: string // href
  t: string // title
  s: string // summary
  d: string // date label
  k: string // sort key (ISO start date)
  y: "e" | "b" // event or battle
  g: string // tags, front and category, space-separated
  m: boolean // milestone
}

export const GET: APIRoute = async () => {
  const entries = await getCollection("timeline", ({ data }) => !data.draft)
  const battles = await getCollection("battles", ({ data }) => !data.draft)

  const docs: SearchDoc[] = [
    ...entries.map((entry) => ({
      h: `/${entry.id}`,
      t: entry.data.title,
      s: entry.data.summary,
      d: formatDate(entry.data.date),
      k: entry.data.date.toISOString().slice(0, 10),
      y: "e" as const,
      g: [...entry.data.tags, entry.data.front ?? "", entry.data.category].join(
        " ",
      ),
      m: entry.data.milestone,
    })),
    ...battles.map((battle) => ({
      h: `/bitwy/${battle.id}`,
      t: battle.data.title,
      s: battle.data.summary,
      d: formatDateRange(battle.data.startDate, battle.data.endDate),
      k: battle.data.startDate.toISOString().slice(0, 10),
      y: "b" as const,
      g: [
        battle.data.front,
        battle.data.location,
        ...battle.data.sides.flatMap((side) => [side.name, ...side.commanders]),
      ].join(" "),
      m: battle.data.milestone,
    })),
  ]

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
