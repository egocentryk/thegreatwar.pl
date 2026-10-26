import type { APIRoute } from "astro"
import { locale, type Lang } from "@/i18n"
import { localBattles, type LocalBattle } from "@/i18n/local"
import { formatDateRange } from "@/utils/formatDate"

// One battle as a homepage card (RandomBattles.astro). The shuffle pool is a
// separate static file (/bitwy.json, /en/battles.json), cached by the browser,
// instead of JSON inlined in every homepage.
export interface BattleCard {
  href: string
  title: string
  front: string
  dates: string
  summary: string
  sides: string
  verdict: string
  milestone: boolean
}

export function toBattleCard(battle: LocalBattle, lang: Lang): BattleCard {
  return {
    href: battle.href,
    title: battle.data.title,
    front: battle.data.front,
    dates: formatDateRange(battle.data.startDate, battle.data.endDate, locale(lang)),
    summary: battle.data.summary,
    sides: battle.data.sides
      .map((side) => side.name)
      .join(lang === "en" ? " vs " : " kontra "),
    // "Zwycięstwo Wielkiej Brytanii. Niemcy stracili…" -> "Zwycięstwo Wielkiej Brytanii"
    verdict: battle.data.result.split(".")[0],
    milestone: battle.data.milestone,
  }
}

export const battleCards =
  (lang: Lang): APIRoute =>
  async () =>
    new Response(
      JSON.stringify((await localBattles(lang)).map((battle) => toBattleCard(battle, lang))),
      { headers: { "Content-Type": "application/json; charset=utf-8" } },
    )
