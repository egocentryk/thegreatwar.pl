import { defineCollection, reference } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { BATTLE_PHASE_SLUGS } from "./data/battlePhases"

// Theatres of war, shared by timeline entries and battles.
const FRONTS = [
  "Front zachodni",
  "Front wschodni",
  "Front bałkański",
  "Front włoski",
  "Bliski Wschód",
  "Wojna na morzu",
  "Afryka",
  "Azja i Pacyfik",
] as const

// Entry ids come from the filename only (folders are ignored), so filenames
// must be unique across all folders of a collection.
const idFromFilename = ({ entry }: { entry: string }) =>
  entry.split("/").pop()!.replace(/\.md$/, "")

// "timeline" entries live in src/content/timeline/<year>/<month>/*.md
// e.g. 1914/07/studio-os.md -> "studio-os", which becomes the URL at /studio-os.
const timeline = defineCollection({
  loader: glob({
    base: "./src/content/timeline",
    pattern: "**/*.md",
    generateId: idFromFilename,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(160),
      // What kind of event this is.
      category: z.enum([
        "Dyplomacja",
        "Polityka",
        "Wojsko",
        "Działania zbrojne",
        "Społeczeństwo",
      ]),
      // Theatre of war; only for events tied to one.
      front: z.enum(FRONTS).optional(),
      // Battle this event belongs to; links the entry and the battle page.
      battle: reference("battles").optional(),
      date: z.coerce.date(),
      authors: z.array(z.string()).min(1),
      dayOrder: z.number().int().nonnegative().default(0),
      headerImage: z.string().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      url: z.url().optional(),
      repo: z.url().optional(),
      // Key moment of the war; highlighted in the timeline and on its page.
      milestone: z.boolean().default(false),
      // "W skrócie": 3–5 short points shown above the text (milestones).
      brief: z.array(z.string()).max(5).default([]),
      // Pages the article was researched from, shown as "Źródła" / "Sources".
      sources: z.array(z.url()).default([]),
      draft: z.boolean().default(false),
    }),
})

// "battles" live in src/content/battles/<year>/*.md and are served at /bitwy/<id>.
const battles = defineCollection({
  loader: glob({
    base: "./src/content/battles",
    pattern: "**/*.md",
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(160),
    front: z.enum(FRONTS),
    phase: z.enum(BATTLE_PHASE_SLUGS),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    location: z.string(),
    // Opposing sides, each with its commanders.
    sides: z
      .array(
        z.object({
          name: z.string(),
          commanders: z.array(z.string()).default([]),
        }),
      )
      .min(2),
    result: z.string(),
    authors: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    milestone: z.boolean().default(false),
    // "W skrócie": 3–5 short points shown above the text (milestones).
    brief: z.array(z.string()).max(5).default([]),
    // Pages the article was researched from, shown as "Źródła" / "Sources".
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

// "people" live in src/content/postacie/*.md and are served at /postacie/<id>.
// Reference pages outside the timeline: any article may link them, and they
// may link any article or battle.
const people = defineCollection({
  loader: glob({
    base: "./src/content/postacie",
    pattern: "**/*.md",
    generateId: idFromFilename,
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string().max(160),
      // Role during the war, one line: "Naczelny wódz armii francuskiej (1914–1916)".
      role: z.string(),
      country: z.string(),
      side: z.enum(["Ententa", "Państwa centralne", "Sprawa polska"]),
      born: z.coerce.date(),
      died: z.coerce.date(),
      // Only the year is reliably known: pages show "1863", not a made-up day.
      bornYearOnly: z.boolean().default(false),
      diedYearOnly: z.boolean().default(false),
      birthPlace: z.string().optional(),
      deathPlace: z.string().optional(),
      // Forms used in battle `commanders` lists, so battles can link here.
      aliases: z.array(z.string()).default([]),
      // pl.wikipedia titles (with underscores) whose links this page replaces.
      wikiTitles: z.array(z.string()).default([]),
      // Black-and-white portrait from Wikimedia Commons, written by
      // scripts/person-photos.mjs; the same script writes the social card
      // to public/og/postacie/<id>.jpg.
      photo: z
        .object({
          src: image(),
          credit: z.string(),
          license: z.string(),
          source: z.url(),
        })
        .optional(),
      authors: z.array(z.string()).min(1),
      tags: z.array(z.string()).default([]),
      // Pages the article was researched from, shown as "Źródła" / "Sources".
      sources: z.array(z.url()).default([]),
      draft: z.boolean().default(false),
    }),
})

// "countries" live in src/content/countries/*.md and are served at /kraje/<id>:
// one page per belligerent state. Like the guides they are reference pages:
// they may link any article, battle or person page. The page lists the
// state's battles, people, key dates and figures automatically by its `name`
// (a tag, a `country` of person pages, a word in battle sides, a row label of
// data/war-numbers.json).
const countries = defineCollection({
  loader: glob({ base: "./src/content/countries", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    // The state as the site's tags name it: "Serbia", "Imperium Osmańskie".
    name: z.string(),
    title: z.string(),
    summary: z.string().max(160),
    brief: z.array(z.string()).max(5).default([]),
    // A neutral state that was still a battlefield or a theatre of the war
    // (Persia) is "Państwa neutralne".
    side: z.enum(["Ententa", "Państwa centralne", "Państwa neutralne"]),
    // In the war: the first day at war, the day it stopped fighting
    // (armistice, separate peace or capitulation); none for a neutral state.
    entered: z.coerce.date().optional(),
    left: z.coerce.date().optional(),
    // Other row labels for it in data/war-numbers.json ("Imperium Brytyjskie").
    numbersAs: z.array(z.string()).default([]),
    // pl.wikipedia titles (with underscores) whose links this page replaces
    // (scripts/wiki-to-internal.py).
    wikiTitles: z.array(z.string()).default([]),
    // Position on /kraje within its side (lower first).
    order: z.number().int(),
    updated: z.coerce.date(),
    authors: z.array(z.string()).min(1),
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

// "topics" live in src/content/topics/*.md and are served at /tematy/<id>:
// long guides to one broad question ("Przyczyny I wojny światowej"). Not
// tied to a date, so they may link any article, battle or person; every
// article a guide links shows a "Temat" box (utils/topics.ts).
const topics = defineCollection({
  loader: glob({
    base: "./src/content/topics",
    pattern: "**/*.md",
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
    // The guide's question as readers ask it ("Dlaczego wybuchła I wojna
    // światowa?"), the headline on /tematy and the homepage.
    question: z.string(),
    summary: z.string().max(160),
    brief: z.array(z.string()).max(5).default([]),
    // Position on /tematy (lower first).
    order: z.number().int(),
    // Last substantive revision, shown on the page and in structured data.
    updated: z.coerce.date(),
    // Related reading series (data/series.ts slug).
    series: z.string().optional(),
    // pl.wikipedia titles (with underscores) whose links this page replaces
    // (scripts/wiki-to-internal.py).
    wikiTitles: z.array(z.string()).default([]),
    authors: z.array(z.string()).min(1),
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

// ─── English translations ────────────────────────────────────────────
// src/content/en/<collection>/<english-slug>.md. Each file holds only the
// translated text; dates, categories, battle links and the rest come from
// the Polish entry named in `source`. `sourceHash` is the SHA-1 of the Polish
// file the translation was made from (scripts/i18n-status.mjs lists stale ones).
const enBase = {
  title: z.string(),
  summary: z.string().max(160),
  brief: z.array(z.string()).max(5).default([]),
  sourceHash: z.string().optional(),
  draft: z.boolean().default(false),
}

const timelineEn = defineCollection({
  loader: glob({ base: "./src/content/en/timeline", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ ...enBase, source: reference("timeline") }),
})

const battlesEn = defineCollection({
  loader: glob({ base: "./src/content/en/battles", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    ...enBase,
    source: reference("battles"),
    location: z.string(),
    sides: z
      .array(z.object({ name: z.string(), commanders: z.array(z.string()).default([]) }))
      .min(2),
    result: z.string(),
  }),
})

const peopleEn = defineCollection({
  loader: glob({ base: "./src/content/en/people", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    name: z.string(),
    summary: z.string().max(160),
    role: z.string(),
    country: z.string(),
    birthPlace: z.string().optional(),
    deathPlace: z.string().optional(),
    sourceHash: z.string().optional(),
    draft: z.boolean().default(false),
    source: reference("people"),
  }),
})

const topicsEn = defineCollection({
  loader: glob({ base: "./src/content/en/topics", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ ...enBase, question: z.string(), source: reference("topics") }),
})

// "places" live in src/content/places/*.md and are served at /miejsca/<id>:
// a city, river, strait or region told from the war's point of view
// (expansion-plan.md C). Reference pages, like the guides: they may link any
// article. The page lists by itself the articles and battle pages that link
// it, and the battles within `radiusKm` of its point.
const places = defineCollection({
  loader: glob({ base: "./src/content/places", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    // The place as articles name it: "Saloniki", "Isonzo".
    name: z.string(),
    title: z.string(),
    summary: z.string().max(160),
    brief: z.array(z.string()).max(5).default([]),
    kind: z.enum(["miasto", "rzeka", "region", "wyspa", "akwen", "kanał"]),
    // The state it belonged to in 1914, and today.
    in1914: z.string(),
    today: z.string(),
    // The front its war belongs to (FRONT_STYLE in utils/battleMap.ts).
    front: z.string(),
    // A point for the locator map and the nearby battles.
    lat: z.number(),
    lon: z.number(),
    radiusKm: z.number().default(40),
    // pl.wikipedia titles (with underscores) whose links this page replaces
    // (scripts/wiki-to-internal.py).
    wikiTitles: z.array(z.string()).default([]),
    updated: z.coerce.date(),
    authors: z.array(z.string()).min(1),
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

// "Siły zbrojne" (src/content/forces/*.md, /sily-zbrojne/<id>): an army,
// a fleet or an air service told across the war: formed when, under whom,
// its battles, its fate (expansion-plan.md C). Reference pages: they may
// link any article. The page lists by itself its people (`people`) and the
// articles and battle pages that link it.
const forces = defineCollection({
  loader: glob({ base: "./src/content/forces", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    // The force as articles name it: "Grand Fleet", "Royal Flying Corps".
    name: z.string(),
    title: z.string(),
    summary: z.string().max(160),
    brief: z.array(z.string()).max(5).default([]),
    kind: z.enum(["armia", "flota", "lotnictwo", "korpus", "formacja"]),
    // The country page of the state it served; none for a force without a
    // state (the Czechoslovak Legion).
    country: reference("countries").optional(),
    // Formed and disbanded (or merged) on; no `disbanded` if it outlived 1918
    // as the same force, no `formed` if it is centuries old (the Royal Navy).
    formed: z.coerce.date().optional(),
    disbanded: z.coerce.date().optional(),
    // Person pages of its commanders and people, in order.
    people: z.array(reference("people")).default([]),
    // pl.wikipedia titles (with underscores) whose links this page replaces
    // (scripts/wiki-to-internal.py).
    wikiTitles: z.array(z.string()).default([]),
    updated: z.coerce.date(),
    authors: z.array(z.string()).min(1),
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

// Longer texts for the most linked glossary terms (expansion-plan.md C):
// src/content/glossary/<glossary slug>.md, shown on /slownik/<slug> in place
// of the two short paragraphs of data/glossary.json, which stays the
// source of the term itself (name, patterns, hover definition).
const glossary = defineCollection({
  loader: glob({ base: "./src/content/glossary", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({
    term: z.string(),
    // pl.wikipedia titles (with underscores) whose links this page replaces
    // (scripts/wiki-to-internal.py).
    wikiTitles: z.array(z.string()).default([]),
    updated: z.coerce.date(),
    authors: z.array(z.string()).min(1),
    sources: z.array(z.url()).default([]),
    draft: z.boolean().default(false),
  }),
})

const countriesEn = defineCollection({
  loader: glob({ base: "./src/content/en/countries", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ ...enBase, name: z.string(), source: reference("countries") }),
})

const placesEn = defineCollection({
  loader: glob({ base: "./src/content/en/places", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ ...enBase, name: z.string(), source: reference("places") }),
})

const forcesEn = defineCollection({
  loader: glob({ base: "./src/content/en/forces", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ ...enBase, name: z.string(), source: reference("forces") }),
})

const glossaryEn = defineCollection({
  loader: glob({ base: "./src/content/en/glossary", pattern: "**/*.md", generateId: idFromFilename }),
  schema: z.object({ term: z.string(), sourceHash: z.string().optional(), draft: z.boolean().default(false), source: reference("glossary") }),
})

export const collections = {
  timeline,
  battles,
  people,
  topics,
  countries,
  places,
  forces,
  glossary,
  timelineEn,
  battlesEn,
  peopleEn,
  topicsEn,
  countriesEn,
  placesEn,
  forcesEn,
  glossaryEn,
}
