// Phases group battles on the /bitwy page, in this order.
// A battle's `phase` field must be one of these slugs.
export const BATTLE_PHASES = [
  {
    slug: "1914-pierwsze-starcia",
    title: "1914: Pierwsze starcia i bitwy graniczne",
    front: "Front zachodni",
    dates: "4–26 sierpnia 1914",
    intro:
      "W pierwszych tygodniach wojny na zachodzie zderzyły się dwa plany. Niemcy, zgodnie z planem Schlieffena, uderzyły przez Belgię, by obejść francuskie fortyfikacje i okrążyć armię francuską. Francja, realizując własny plan ofensywny, zaatakowała w Alzacji i Lotaryngii, a następnie w Ardenach. Po oporze Belgów pod Liège seria krwawych starć na granicach zakończyła się klęską Francuzów i Brytyjczyków, którzy rozpoczęli wielki odwrót w kierunku Marny.",
  },
] as const

export type BattlePhaseSlug = (typeof BATTLE_PHASES)[number]["slug"]

export const BATTLE_PHASE_SLUGS = BATTLE_PHASES.map((phase) => phase.slug) as [
  BattlePhaseSlug,
  ...BattlePhaseSlug[],
]
