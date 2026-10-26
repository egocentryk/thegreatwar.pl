import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { formatDateRange } from "@/utils/formatDate"
import { packIndex, type SearchSource } from "@/utils/searchIndex"

// Search index for the homepage and /szukaj, fetched only when someone
// starts searching. Packed format: utils/searchIndex.ts.
export const GET: APIRoute = async () => {
  const entries = await getCollection("timeline", ({ data }) => !data.draft)
  const battles = await getCollection("battles", ({ data }) => !data.draft)

  const docs: SearchSource[] = [
    ...entries.map((entry) => ({
      h: `/${entry.id}`,
      t: entry.data.title,
      s: entry.data.summary,
      k: entry.data.date.toISOString().slice(0, 10),
      y: "e" as const,
      g: [...entry.data.tags, entry.data.front ?? "", entry.data.category],
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
      ],
      m: battle.data.milestone,
    })),
  ]

  return new Response(JSON.stringify(packIndex(docs)), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
