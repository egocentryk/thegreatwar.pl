// "Głosy z frontu" (/glosy, /en/voices): short first-hand quotes from
// public-domain diaries, letters, memoirs, speeches and orders, each attached
// to a timeline article (data/voices.json, checked and merged by
// scripts/checks/voices.py). Shown under the article text and on the list page.
import data from "@/data/voices.json"
import type { Lang } from "@/i18n"

export interface Voice {
  id: string
  article: string
  date: string
  author: string
  person?: string
  role: string
  roleEn: string
  kind: string
  pl: string
  en: string
  originalLang: string
  original: string
  source: string
  sourceTitle: string
  died: number | null
  // How the text was freed when the author's death year is not the reason.
  licence?: string
}

export const VOICES = (data as Voice[]).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

export const voicesFor = (articleId: string) => VOICES.filter((v) => v.article === articleId)

// The list is split by year like the timeline: /glosy shows the first
// year, /glosy/1915 … the others.
export const VOICE_YEARS = [...new Set(VOICES.map((v) => Number(v.date.slice(0, 4))))].sort()

export const voicesPath = (lang: Lang, year?: number | string) =>
  `${lang === "en" ? "/en/voices" : "/glosy"}${year && Number(year) !== VOICE_YEARS[0] ? `/${year}` : ""}`

// Where a voice is listed: its year page, at its entry.
export const voiceHref = (v: Voice, lang: Lang) => `${voicesPath(lang, v.date.slice(0, 4))}#${v.id}`

export const voicesOfYear = (year: number) => VOICES.filter((v) => v.date.startsWith(`${year}-`))

const KIND: Record<string, [string, string]> = {
  dziennik: ["dziennik", "diary"],
  list: ["list", "letter"],
  wspomnienia: ["wspomnienia", "memoir"],
  przemówienie: ["przemówienie", "speech"],
  rozkaz: ["rozkaz", "order"],
  odezwa: ["odezwa", "proclamation"],
  relacja: ["relacja", "account"],
}
export const kindLabel = (kind: string, lang: Lang) => KIND[kind]?.[lang === "en" ? 1 : 0] ?? kind

// The quote in the page's language, and whether it is a translation.
export const quoteIn = (v: Voice, lang: Lang) => ({ text: lang === "en" ? v.en : v.pl, translated: v.originalLang !== lang })
