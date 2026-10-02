import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { toCalendarLeaf } from "@/utils/calendarLeaf"

// Pool for the homepage "Kartki z kroniki" reroll, fetched on demand so the
// homepage HTML doesn't carry every event.
export const GET: APIRoute = async () => {
  const entries = await getCollection("timeline", ({ data }) => !data.draft)
  return new Response(JSON.stringify(entries.map(toCalendarLeaf)), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
