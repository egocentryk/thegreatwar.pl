import { json, shardPaths } from "@/utils/calendarPool"

// One shard of the "Pages from the chronicle" reroll pool (see utils/calendarPool.ts).
export const getStaticPaths = shardPaths("pl")
export const GET = json
