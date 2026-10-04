import { getEntry, type CollectionEntry } from "astro:content"

// getEntry() for hand-picked slugs: fails the build on a typo or a renamed
// article instead of quietly rendering nothing.
export async function requireTimeline(slug: string) {
  const entry = await getEntry("timeline", slug)
  if (!entry) throw new Error(`Homepage: unknown timeline slug "${slug}"`)
  return entry as CollectionEntry<"timeline">
}

export async function requireBattle(slug: string) {
  const entry = await getEntry("battles", slug)
  if (!entry) throw new Error(`Homepage: unknown battle slug "${slug}"`)
  return entry as CollectionEntry<"battles">
}

// About 200 words a minute; never less than one minute.
export function readingMinutes(body: string | undefined) {
  const words = (body ?? "").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
