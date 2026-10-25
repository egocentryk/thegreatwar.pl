import type { APIRoute } from "astro"
import { localEvents } from "@/i18n/local"
import { toCalendarLeaf } from "@/utils/calendarLeaf"

// Pool for the homepage "Kartki z kroniki" reroll, fetched on demand so the
// homepage HTML doesn't carry every event.
export const GET: APIRoute = async () => {
  const entries = await localEvents("pl")
  return new Response(JSON.stringify(entries.map((entry) => toCalendarLeaf(entry))), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
