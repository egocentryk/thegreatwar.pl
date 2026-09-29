import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

// "timeline" entries live in src/content/timeline/<year>/<month>/*.md
// Each file's `id` is derived from its filename only (folders are ignored),
// e.g. 1914/07/studio-os.md -> "studio-os", which becomes the URL at /studio-os.
// Filenames must therefore be unique across all folders.
const timeline = defineCollection({
  loader: glob({
    base: "./src/content/timeline",
    pattern: "**/*.md",
    generateId: ({ entry }) => entry.split("/").pop()!.replace(/\.md$/, ""),
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
      front: z
        .enum([
          "Front zachodni",
          "Front wschodni",
          "Front bałkański",
          "Front włoski",
          "Bliski Wschód",
          "Wojna na morzu",
          "Afryka",
          "Azja i Pacyfik",
        ])
        .optional(),
      date: z.coerce.date(),
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

export const collections = { timeline }
