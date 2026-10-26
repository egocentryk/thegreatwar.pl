import { getCollection } from "astro:content"
import type { Lang } from "@/i18n"
import { localEvents, type LocalEvent } from "@/i18n/local"
import { compareTimelineEntries } from "@/utils/groupTimelineEntries"
import { getPeople } from "@/utils/people"

// Links between timeline articles and people, worked out once per build from
// the Polish content (English pages map the Polish ids to their own entries):
//   meanwhile(id)       articles from the same days on other fronts
//   related(id)         articles sharing a battle, people or rare tags
//   personMentions(id)  articles that link or tag a person, battles whose text
//                       links them, and the people they appear with most

export const MEANWHILE_DAYS = 3
export const MEANWHILE_COUNT = 4
export const RELATED_COUNT = 4
// Below this, an article gets no "related" block rather than weak picks.
const MIN_SCORE = 3
// Rare tags matter, common ones ("Wielka Brytania", 945 articles) barely.
const MAX_TAG_WEIGHT = 4
// A shared person or tag counts half after a year apart.
const DECAY_DAYS = 365
// Person pages list at most this many articles (key events always kept).
export const MENTIONS_CAP = 40
export const CO_PEOPLE_COUNT = 5

const DAY = 86_400_000

interface Item {
  id: string
  date: Date
  front?: string
  battle?: string
  milestone: boolean
  dayOrder: number
  tags: string[] // tags that are not people
  // Person page id -> links to it in the text (0 when only tagged).
  people: Map<string, number>
}

const PERSON_LINK = /\]\(\/postacie\/([a-z0-9-]+)\)/g

async function build() {
  const [entries, people, battles] = await Promise.all([
    getCollection("timeline", ({ data }) => !data.draft),
    getPeople(),
    getCollection("battles", ({ data }) => !data.draft),
  ])
  // Person names and aliases (lower case) -> person id, to read tags.
  const personByTag = new Map<string, string>()
  for (const person of people) {
    for (const name of [person.data.name, ...person.data.aliases]) {
      personByTag.set(name.toLowerCase(), person.id)
    }
  }
  const personIds = new Set(people.map((person) => person.id))

  // Person id -> their tags with use counts (for the "all articles" link).
  const personTags = new Map<string, Map<string, number>>()

  const items: Item[] = entries.sort(compareTimelineEntries).map((entry) => {
    const linked = new Map<string, number>()
    for (const [, id] of (entry.body ?? "").matchAll(PERSON_LINK)) {
      if (personIds.has(id)) linked.set(id, (linked.get(id) ?? 0) + 1)
    }
    const tags: string[] = []
    for (const tag of entry.data.tags) {
      const person = personByTag.get(tag.toLowerCase())
      if (!person) {
        tags.push(tag)
        continue
      }
      if (!linked.has(person)) linked.set(person, 0)
      const counts = personTags.get(person) ?? new Map<string, number>()
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
      personTags.set(person, counts)
    }
    return {
      id: entry.id,
      date: entry.data.date,
      front: entry.data.front,
      battle: entry.data.battle?.id,
      milestone: entry.data.milestone,
      dayOrder: entry.data.dayOrder ?? 0,
      tags,
      people: linked,
    }
  })

  const index = new Map(items.map((item, i) => [item.id, i]))
  const byPerson = new Map<string, Item[]>()
  const byTag = new Map<string, Item[]>()
  const byBattle = new Map<string, Item[]>()
  const add = <K>(map: Map<K, Item[]>, key: K, item: Item) =>
    map.set(key, [...(map.get(key) ?? []), item])
  for (const item of items) {
    for (const person of item.people.keys()) add(byPerson, person, item)
    for (const tag of item.tags) add(byTag, tag, item)
    if (item.battle) add(byBattle, item.battle, item)
  }
  const tagWeight = (tag: string) =>
    Math.min(MAX_TAG_WEIGHT, Math.log(items.length / (byTag.get(tag)?.length ?? 1)))

  // Battles whose own text links a person.
  const battlesByPerson = new Map<string, string[]>()
  for (const battle of battles) {
    for (const id of new Set([...(battle.body ?? "").matchAll(PERSON_LINK)].map((m) => m[1]))) {
      if (personIds.has(id)) battlesByPerson.set(id, [...(battlesByPerson.get(id) ?? []), battle.id])
    }
  }

  return { items, index, byPerson, byTag, byBattle, tagWeight, battlesByPerson, personTags }
}

let graph: ReturnType<typeof build> | undefined
const load = () => (graph ??= build())

const daysApart = (a: Item, b: Item) => Math.abs(a.date.valueOf() - b.date.valueOf()) / DAY

// Neighbours in timeline order: the article page already links them.
function neighbours(items: Item[], i: number) {
  return new Set([items[i - 1]?.id, items[i + 1]?.id].filter(Boolean))
}

// Articles from the same days (±MEANWHILE_DAYS) on other fronts, closest
// first, key events first.
export async function meanwhile(id: string): Promise<string[]> {
  const { items, index } = await load()
  const i = index.get(id)
  if (i === undefined) return []
  const item = items[i]
  const skip = neighbours(items, i)
  const found: Item[] = []
  for (const step of [-1, 1]) {
    for (let j = i + step; items[j] && daysApart(items[j], item) <= MEANWHILE_DAYS; j += step) {
      const other = items[j]
      if (other.front !== item.front && !skip.has(other.id)) found.push(other)
    }
  }
  return found
    .sort(
      (a, b) =>
        daysApart(a, item) - daysApart(b, item) ||
        Number(b.milestone) - Number(a.milestone) ||
        a.date.valueOf() - b.date.valueOf(),
    )
    .slice(0, MEANWHILE_COUNT)
    .map((other) => other.id)
}

// Articles that share the battle (+5), people (+3 each) or tags (rarer counts
// more) with this one, plus 1 for the same front; weaker the further apart.
// Skips the neighbours and the "meanwhile" articles.
export async function related(id: string): Promise<string[]> {
  const { items, index, byPerson, byTag, byBattle, tagWeight } = await load()
  const i = index.get(id)
  if (i === undefined) return []
  const item = items[i]
  const skip = new Set([id, ...neighbours(items, i), ...(await meanwhile(id))])

  const scores = new Map<Item, number>()
  const bump = (other: Item, points: number) => {
    if (!skip.has(other.id)) scores.set(other, (scores.get(other) ?? 0) + points)
  }
  if (item.battle) for (const other of byBattle.get(item.battle) ?? []) bump(other, 5)
  for (const person of item.people.keys()) for (const other of byPerson.get(person) ?? []) bump(other, 3)
  for (const tag of item.tags) for (const other of byTag.get(tag) ?? []) bump(other, tagWeight(tag))

  return [...scores]
    .map(([other, score]) => ({
      other,
      score: (score + (other.front && other.front === item.front ? 1 : 0)) / (1 + daysApart(other, item) / DECAY_DAYS),
    }))
    .filter(({ score }) => score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || daysApart(a.other, item) - daysApart(b.other, item))
    .slice(0, RELATED_COUNT)
    .map(({ other }) => other.id)
}

export interface PersonMentions {
  // Article ids in timeline order; capped at MENTIONS_CAP when the person
  // has a tag page to show the rest.
  articles: string[]
  total: number
  // The person's most used tag (Polish), for an "all articles" link.
  tag?: { name: string; count: number }
  // Battles whose text links the person (commanders listed separately).
  battles: string[]
  // People who appear in the same articles most often.
  coPeople: { id: string; count: number }[]
}

export async function personMentions(personId: string): Promise<PersonMentions> {
  const { index, byPerson, battlesByPerson, personTags } = await load()
  const all = byPerson.get(personId) ?? []
  const [tagName, tagCount] =
    [...(personTags.get(personId) ?? [])].sort((a, b) => b[1] - a[1])[0] ?? []
  const tag = tagName ? { name: tagName, count: tagCount! } : undefined

  // Too many: keep key events, then the articles that link the person most.
  let articles = all
  if (all.length > MENTIONS_CAP && tag) {
    articles = [...all]
      .sort(
        (a, b) =>
          Number(b.milestone) - Number(a.milestone) ||
          b.people.get(personId)! - a.people.get(personId)! ||
          a.date.valueOf() - b.date.valueOf(),
      )
      .slice(0, MENTIONS_CAP)
      .sort((a, b) => index.get(a.id)! - index.get(b.id)!)
  }

  const counts = new Map<string, number>()
  for (const item of all) {
    for (const other of item.people.keys()) {
      if (other !== personId) counts.set(other, (counts.get(other) ?? 0) + 1)
    }
  }
  const coPeople = [...counts]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, CO_PEOPLE_COUNT)
    .map(([id, count]) => ({ id, count }))

  return {
    articles: articles.map((item) => item.id),
    total: all.length,
    tag,
    battles: battlesByPerson.get(personId) ?? [],
    coPeople,
  }
}

// Localised events by Polish id, for rendering the ids above.
const byIdCache = new Map<Lang, Promise<Map<string, LocalEvent>>>()
export function eventsById(lang: Lang) {
  if (!byIdCache.has(lang)) {
    byIdCache.set(
      lang,
      localEvents(lang).then((events) => new Map(events.map((event) => [event.id, event]))),
    )
  }
  return byIdCache.get(lang)!
}
