import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

// "timeline" entries live in src/content/timeline/*.md
// Each file's `id` is derived from its filename, e.g. studio-os.md -> "studio-os",
// which becomes the URL at /studio-os.
const timeline = defineCollection({
  loader: glob({ base: "./src/content/timeline", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(160),
      role: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      url: z.url().optional(),
      repo: z.url().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
})

export const collections = { timeline }
