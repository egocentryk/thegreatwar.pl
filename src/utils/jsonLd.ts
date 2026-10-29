import wikiEn from "@/data/wiki-en.json"
import type { Lang } from "@/i18n"
import { SITE } from "@/site.config"
import { slugify } from "@/utils/slugify"

// schema.org structured data (JSON-LD) for search engines. Pages pass a list
// of nodes to BaseLayout (`jsonLd`), BaseHead prints them as one @graph.
// Every node uses absolute URLs, so `site` is Astro.site.

export type JsonLdNode = Record<string, unknown>

const abs = (site: URL, path: string) => new URL(path, site).href
const inLanguage = (lang: Lang) => (lang === "en" ? "en-GB" : "pl-PL")
const home = (lang: Lang) => (lang === "en" ? "/en" : "/")
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

const websiteId = (site: URL, lang: Lang) => `${abs(site, home(lang))}#website`
const publisherId = (site: URL) => `${abs(site, "/")}#publisher`

function publisher(site: URL): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": publisherId(site),
    name: SITE.name,
    url: abs(site, "/"),
    logo: abs(site, "/web-app-manifest-512x512.png"),
    email: SITE.email,
  }
}

// Homepage: the site and who publishes it.
export function websiteLd(site: URL, lang: Lang): JsonLdNode[] {
  return [
    {
      "@type": "WebSite",
      "@id": websiteId(site, lang),
      name: SITE.name,
      url: abs(site, home(lang)),
      description: lang === "en" ? SITE.descriptionEn : SITE.description,
      inLanguage: inLanguage(lang),
      publisher: { "@id": publisherId(site) },
    },
    publisher(site),
  ]
}

// Home › section › … › current page.
export function breadcrumbLd(
  site: URL,
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(site, item.path),
    })),
  }
}

// Author pages exist only in Polish (/autor/<slug>).
const authorLd = (site: URL, name: string): JsonLdNode => ({
  "@type": "Person",
  name,
  url: abs(site, `/autor/${slugify(name)}`),
})

// A timeline article: an Article about one day of the war.
export function articleLd(
  site: URL,
  a: {
    lang: Lang
    path: string
    title: string
    summary: string
    date: Date
    authors: string[]
    tags?: string[]
    image?: string
    // What the article is about and what it mentions (utils/pageEntities.ts).
    about?: JsonLdNode[]
    mentions?: JsonLdNode[]
  },
): JsonLdNode {
  return {
    "@type": "Article",
    "@id": `${abs(site, a.path)}#article`,
    headline: a.title,
    description: a.summary,
    url: abs(site, a.path),
    mainEntityOfPage: abs(site, a.path),
    inLanguage: inLanguage(a.lang),
    // The day the article is about (the site has no publication dates).
    temporalCoverage: isoDay(a.date),
    author: a.authors.map((name) => authorLd(site, name)),
    publisher: { "@id": publisherId(site) },
    isPartOf: { "@id": websiteId(site, a.lang) },
    image: abs(site, a.image ?? SITE.ogImage),
    ...(a.tags?.length ? { keywords: a.tags.join(", ") } : {}),
    ...(a.about?.length ? { about: a.about } : {}),
    ...(a.mentions?.length ? { mentions: a.mentions } : {}),
  }
}

// A topic guide (/tematy/<id>): an Article about the whole war, with the
// date of its last revision.
export function topicLd(
  site: URL,
  a: {
    lang: Lang
    path: string
    title: string
    summary: string
    updated: Date
    authors: string[]
    about?: JsonLdNode[]
    mentions?: JsonLdNode[]
  },
): JsonLdNode {
  return {
    "@type": "Article",
    "@id": `${abs(site, a.path)}#article`,
    headline: a.title,
    description: a.summary,
    url: abs(site, a.path),
    mainEntityOfPage: abs(site, a.path),
    inLanguage: inLanguage(a.lang),
    temporalCoverage: "1914/1918",
    dateModified: isoDay(a.updated),
    author: a.authors.map((name) => authorLd(site, name)),
    publisher: { "@id": publisherId(site) },
    isPartOf: { "@id": websiteId(site, a.lang) },
    image: abs(site, SITE.ogImage),
    ...(a.about?.length ? { about: a.about } : {}),
    ...(a.mentions?.length ? { mentions: a.mentions } : {}),
  }
}

// A battle page: a historical Event, plus the Article that describes it.
export function battleLd(
  site: URL,
  b: {
    lang: Lang
    path: string
    title: string
    summary: string
    startDate: Date
    endDate: Date
    location: string
    authors: string[]
    // People, battles and other things the page mentions (utils/pageEntities.ts).
    mentions?: JsonLdNode[]
  },
): JsonLdNode[] {
  const url = abs(site, b.path)
  return [
    {
      "@type": "Event",
      "@id": `${url}#event`,
      name: b.title,
      description: b.summary,
      startDate: isoDay(b.startDate),
      endDate: isoDay(b.endDate),
      location: { "@type": "Place", name: b.location },
      url,
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: b.title,
      description: b.summary,
      url,
      mainEntityOfPage: url,
      inLanguage: inLanguage(b.lang),
      temporalCoverage: `${isoDay(b.startDate)}/${isoDay(b.endDate)}`,
      about: { "@id": `${url}#event` },
      ...(b.mentions?.length ? { mentions: b.mentions } : {}),
      author: b.authors.map((name) => authorLd(site, name)),
      publisher: { "@id": publisherId(site) },
      isPartOf: { "@id": websiteId(site, b.lang) },
      image: abs(site, SITE.ogImage),
    },
  ]
}

// A list page (year, month, tag, category, author, front, battles):
// a CollectionPage whose main entity is the list of pages it links, in order.
// `items` is left out for very long hub pages (/postacie).
export function collectionLd(
  site: URL,
  c: { lang: Lang; path: string; name: string; description: string; items?: string[] },
): JsonLdNode {
  const url = abs(site, c.path)
  return {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name: c.name,
    description: c.description,
    url,
    inLanguage: inLanguage(c.lang),
    isPartOf: { "@id": websiteId(site, c.lang) },
    ...(c.items?.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: c.items.length,
            itemListElement: c.items.map((path, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: abs(site, path),
            })),
          },
        }
      : {}),
  }
}

// A person page: the Person, with Wikipedia as sameAs.
export function personLd(
  site: URL,
  p: {
    lang: Lang
    path: string
    name: string
    summary: string
    role: string
    country: string
    born: Date
    died: Date
    bornYearOnly: boolean
    diedYearOnly: boolean
    birthPlace?: string
    deathPlace?: string
    wikiTitles: string[]
    image?: string
  },
): JsonLdNode {
  const url = abs(site, p.path)
  const day = (date: Date, yearOnly: boolean) =>
    yearOnly ? String(date.getUTCFullYear()) : isoDay(date)
  const wiki = p.wikiTitles.flatMap((title) => {
    if (p.lang === "pl") return [`https://pl.wikipedia.org/wiki/${title}`]
    const en = (wikiEn as Record<string, string | null>)[title.replace(/_/g, " ")]
    return en ? [`https://en.wikipedia.org/wiki/${en.replace(/ /g, "_")}`] : []
  })
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: p.name,
    description: p.summary,
    jobTitle: p.role,
    nationality: { "@type": "Country", name: p.country },
    birthDate: day(p.born, p.bornYearOnly),
    deathDate: day(p.died, p.diedYearOnly),
    ...(p.birthPlace ? { birthPlace: { "@type": "Place", name: p.birthPlace } } : {}),
    ...(p.deathPlace ? { deathPlace: { "@type": "Place", name: p.deathPlace } } : {}),
    url,
    mainEntityOfPage: url,
    ...(p.image ? { image: abs(site, p.image) } : {}),
    ...(wiki.length ? { sameAs: wiki } : {}),
  }
}

// A list page's nodes: its CollectionPage and the breadcrumbs from the
// homepage through `trail` to the page itself.
export function listPageLd(
  site: URL,
  p: {
    lang: Lang
    path: string
    name: string
    description: string
    trail?: { name: string; path: string }[]
    items?: string[]
  },
): JsonLdNode[] {
  const homeCrumb = { name: p.lang === "en" ? "Home" : "Strona główna", path: home(p.lang) }
  return [
    collectionLd(site, p),
    breadcrumbLd(site, [homeCrumb, ...(p.trail ?? []), { name: p.name, path: p.path }]),
  ]
}
