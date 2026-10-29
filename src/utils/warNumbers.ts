// "Wojna w liczbach" (/wojna-w-liczbach, /en/war-in-numbers): datasets of
// sourced figures in data/war-numbers.json. Disputed figures are ranges
// (low–high); every row lists the pages it was checked against.
import data from "@/data/war-numbers.json"
import type { Lang } from "@/i18n"

export interface Row {
  label: string
  labelEn: string
  low: number
  high: number
  note?: string
  noteEn?: string
  sources: string[]
}

export interface Dataset {
  title: string
  titleEn: string
  unit: string
  unitEn: string
  note: string
  noteEn: string
  rows: Row[]
}

export const WAR_NUMBERS = data as Record<string, Dataset>

export const warNumbersPath = (lang: Lang) => (lang === "en" ? "/en/war-in-numbers" : "/wojna-w-liczbach")

// "5,6 mln", "950 tys.", "17,2%", "324 750" (en: "5.6m", "950k", "17.2%",
// "324,750"). `bare` drops the unit word, for the first half of a range.
export function formatFigure(n: number, unit: string, lang: Lang, bare = false) {
  const en = lang === "en"
  const loc = en ? "en-GB" : "pl-PL"
  if (unit === "%") return `${n.toLocaleString(loc, { maximumFractionDigits: 1 })}${bare ? "" : "%"}`
  if (n >= 1_000_000) {
    const v = (n / 1_000_000).toLocaleString(loc, { maximumFractionDigits: n >= 10_000_000 ? 0 : 1 })
    return bare ? v : en ? `${v}m` : `${v} mln`
  }
  if (n >= 10_000) {
    const v = Math.round(n / 1000).toLocaleString(loc)
    return bare ? v : en ? `${v}k` : `${v} tys.`
  }
  return n.toLocaleString(loc)
}

// "5,6–5,8 mln"; both ends in full when they fall on different scales
// ("950 tys.–1,1 mln").
export function formatRange(low: number, high: number, unit: string, lang: Lang) {
  if (low === high) return formatFigure(low, unit, lang)
  const scale = (n: number) => (n >= 1_000_000 ? 2 : n >= 10_000 ? 1 : 0)
  const same = scale(low) === scale(high)
  return `${formatFigure(low, unit, lang, same)}–${formatFigure(high, unit, lang)}`
}
