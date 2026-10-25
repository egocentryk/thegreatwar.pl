import type { APIRoute } from "astro"
import { localEvents } from "@/i18n/local"
import { toCalendarLeaf } from "@/utils/calendarLeaf"

// English pool for the homepage calendar sections: translated events only.
export const GET: APIRoute = async () => {
  const entries = await localEvents("en")
  return new Response(
    JSON.stringify(entries.map((entry) => toCalendarLeaf(entry, "en-GB"))),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  )
}
