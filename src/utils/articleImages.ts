// Images of articles and battle pages from Wikimedia Commons, chosen in review
// and saved by scripts/article-images.mjs: the file in src/assets/images and
// its caption, author and licence (data/images.json).
import type { ImageMetadata } from "astro"
import data from "@/data/images.json"

export interface ArticleImage {
  asset: ImageMetadata
  caption: { pl: string; en: string }
  author: string
  license: string
  licenseUrl?: string
  source: string
}

const files = import.meta.glob<{ default: ImageMetadata }>("/src/assets/images/{timeline,battles}/*.jpg", { eager: true })
const entries = data as Record<string, Omit<ArticleImage, "asset"> & { file: string }>

// `ref`: a timeline id, or "bitwy/<id>" for a battle page.
export function articleImage(ref: string): ArticleImage | undefined {
  const entry = entries[ref]
  const asset = entry && files[`/src/assets/images/${entry.file}`]?.default
  return asset && { ...entry, asset }
}
