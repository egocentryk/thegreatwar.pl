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
      image: z.string().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      url: z.url().optional(),
      repo: z.url().optional(),
      // Key moment of the war; highlighted in the timeline and on its page.
      milestone: z.boolean().default(false),
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
    draft: z.boolean().default(false),
  }),
})

export const collections = { timeline, battles }
