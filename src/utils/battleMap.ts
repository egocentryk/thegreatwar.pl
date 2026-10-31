import basemap from "@/data/basemap.json"
import coords from "@/data/battle-coords.json"
import { BATTLE_PARENTS } from "@/data/battleParents"

// Battle map helpers (BattleMap.astro, BattleLocator.astro). Base maps are
// built by scripts/build-basemap.mjs, coordinates by scripts/battle-coords.mjs
// (plus manual entries).

export type MapName = keyof typeof basemap
export const BASEMAP = basemap

// Fronts in palette order. Colours are the dataviz reference palette, chosen
// so fronts that meet on the map stay distinguishable (CVD-validated in both
// themes); naval battles use a neutral diamond instead of a hue.
export const FRONT_STYLE: Record<string, { key: string; sea?: boolean }> = {
  "Front zachodni": { key: "west" },
  "Front wschodni": { key: "east" },
  "Front bałkański": { key: "balkan" },
  "Bliski Wschód": { key: "mideast" },
  "Front włoski": { key: "italy" },
  Afryka: { key: "africa" },
  "Azja i Pacyfik": { key: "asia" },
  "Wojna na morzu": { key: "sea", sea: true },
}

export interface Point {
  map: MapName
  x: number
  y: number
}

export function project(map: MapName, lat: number, lon: number) {
  const m = BASEMAP[map]
  const kx = Math.cos((m.latRef * Math.PI) / 180)
  const scale = m.width / ((m.lon[1] - m.lon[0]) * kx)
  return { x: (lon - m.lon[0]) * kx * scale, y: (m.lat[1] - lat) * scale }
}

const inside = (map: MapName, lat: number, lon: number) => {
  const m = BASEMAP[map]
  return lon >= m.lon[0] && lon <= m.lon[1] && lat >= m.lat[0] && lat <= m.lat[1]
}

// Where a battle is drawn: the Europe map when it fits, else the world map.
export function battlePoint(id: string): Point | undefined {
  const c = (coords as Record<string, { lat: number; lon: number }>)[id]
  if (!c) return undefined
  const map: MapName = inside("europa", c.lat, c.lon) ? "europa" : "swiat"
  return { map, ...project(map, c.lat, c.lon) }
}

// Where any point is drawn (place pages): as for battles.
export function pointAt(lat: number, lon: number): Point {
  const map: MapName = inside("europa", lat, lon) ? "europa" : "swiat"
  return { map, ...project(map, lat, lon) }
}

// Campaigns and operations made of several battles: drawn as rings.
const parents = new Set(Object.values(BATTLE_PARENTS))
export const isCampaign = (id: string) => parents.has(id)
