import { enWikiUrl, plWikiTitle, type Lang } from "@/i18n"
import { localBattles, localPeople } from "@/i18n/local"
import { getPeople } from "@/utils/people"
import type { JsonLdNode } from "@/utils/jsonLd"

// What an article or battle page is about and what it mentions, for the
// `about` and `mentions` of its JSON-LD (utils/jsonLd.ts).
//
// The site's own pages come first: a person with a person page is referenced
// by that page's Person node (@id ".../postacie/<id>#person"), a battle by its
// battle page's Event node (".../bitwy/<id>#event"); those pages carry the
// Wikipedia `sameAs` themselves. A thing the site has no page for (a place, a
// ship, a unit) is named by its Wikipedia article as `sameAs`. English pages
// point to the English pages and en.wikipedia where they exist.

// Links in the Markdown body; English bodies keep the Polish targets.
const PERSON_LINK = /\]\(\/postacie\/([a-z0-9-]+)\)/g
const BATTLE_LINK = /\]\(\/bitwy\/([a-z0-9-]+)\)/g
const WIKI_LINK = /\]\((https?:\/\/pl\.wikipedia\.org\/wiki\/[^\s)]+(?:\([^\s)]*\))?[^\s)]*)\)/g

type Ref = { url: string; name: string }

let cache: Promise<Awaited<ReturnType<typeof build>>> | undefined
async function build() {
  const people = await getPeople()
  const [plPeople, enPeople, plBattles, enBattles] = await Promise.all([
    localPeople("pl"),
    localPeople("en"),
    localBattles("pl"),
    localBattles("en"),
  ])
  const refs = <T extends { id: string; href: string }>(list: T[], name: (item: T) => string) =>
    new Map<string, Ref>(list.map((item) => [item.id, { url: item.href, name: name(item) }]))
  // Tags and Wikipedia titles that stand for a person with a page.
  const personByName = new Map<string, string>()
  const personByWiki = new Map<string, string>()
  for (const person of people) {
    for (const name of [person.data.name, ...person.data.aliases]) personByName.set(name.toLowerCase(), person.id)
    for (const title of person.data.wikiTitles) personByWiki.set(title.replace(/_/g, " "), person.id)
  }
  return {
    people: { pl: refs(plPeople, (p) => p.data.name), en: refs(enPeople, (p) => p.data.name) },
    battles: { pl: refs(plBattles, (b) => b.data.title), en: refs(enBattles, (b) => b.data.title) },
    personByName,
    personByWiki,
  }
}

export async function pageEntities(
  site: URL,
  lang: Lang,
  page: {
    body: string
    // Polish id of the article's battle: the article is about it.
    battleId?: string
    // Polish tags: the people among them are what the article is about.
    tags?: string[]
    // Polish id of the page's own battle (battle pages), left out of mentions.
    selfBattleId?: string
  },
): Promise<{ about: JsonLdNode[]; mentions: JsonLdNode[] }> {
  const data = await (cache ??= build())
  const abs = (path: string) => new URL(path, site).href
  // English page if translated, else the Polish one.
  const ref = (kind: "people" | "battles", id: string) =>
    data[kind][lang].get(id) ?? data[kind].pl.get(id)
  const person = (id: string): JsonLdNode | undefined => {
    const r = ref("people", id)
    return r && { "@type": "Person", "@id": `${abs(r.url)}#person`, name: r.name, url: abs(r.url) }
  }
  const battle = (id: string): JsonLdNode | undefined => {
    const r = ref("battles", id)
    return r && { "@type": "Event", "@id": `${abs(r.url)}#event`, name: r.name, url: abs(r.url) }
  }

  const seen = new Set<string>()
  const add = (list: JsonLdNode[], node: JsonLdNode | undefined, key: string) => {
    if (!node || seen.has(key)) return
    seen.add(key)
    list.push(node)
  }

  const about: JsonLdNode[] = []
  if (page.battleId) add(about, battle(page.battleId), `b:${page.battleId}`)
  for (const tag of page.tags ?? []) {
    const id = data.personByName.get(tag.toLowerCase())
    if (id) add(about, person(id), `p:${id}`)
  }

  const mentions: JsonLdNode[] = []
  if (page.selfBattleId) seen.add(`b:${page.selfBattleId}`)
  for (const [, id] of page.body.matchAll(PERSON_LINK)) add(mentions, person(id), `p:${id}`)
  for (const [, id] of page.body.matchAll(BATTLE_LINK)) add(mentions, battle(id), `b:${id}`)
  for (const [, href] of page.body.matchAll(WIKI_LINK)) {
    const title = plWikiTitle(href)
    if (!title) continue
    // A person with a page here: their page, not Wikipedia.
    const personId = data.personByWiki.get(title)
    if (personId) {
      add(mentions, person(personId), `p:${personId}`)
      continue
    }
    const en = lang === "en" ? enWikiUrl(title) : undefined
    const name = en ? decodeURIComponent(en.split("/wiki/")[1]).replace(/_/g, " ") : title
    add(mentions, { "@type": "Thing", name, sameAs: en ?? href.split("#")[0] }, `w:${title}`)
  }
  return { about, mentions }
}
