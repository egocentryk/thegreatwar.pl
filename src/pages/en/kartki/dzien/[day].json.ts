import { dayPaths, json } from "@/utils/calendarPool"

// "On this day" entries for one calendar day (see utils/calendarPool.ts).
export const getStaticPaths = dayPaths("en")
export const GET = json
