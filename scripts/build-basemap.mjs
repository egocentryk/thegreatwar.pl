// Builds the battle map's base maps from Natural Earth (public domain,
// https://www.naturalearthdata.com) land and lakes:
//   src/data/basemap.json   projected land paths + projection settings, used
//                           by BattleMap.astro and BattleLocator.astro
//   public/mapa/<name>.svg  the same land as a standalone SVG, used as a CSS
//                           mask by the small locator map on battle pages
//
// Two maps: "europa" (Europe and the Middle East, 1:50m) and "swiat" (the
// rest of the world at 1:110m, for battles outside the main map).
//
// Usage: node scripts/build-basemap.mjs <ne_50m_land.geojson> <ne_50m_lakes.geojson> <ne_110m_land.geojson>
// (download from github.com/nvkelso/natural-earth-vector/tree/master/geojson)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const [land50, lakes50, land110] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")))

// lon0..lon1, lat0..lat1; width in SVG units; x is scaled by cos(latRef).
const MAPS = {
  europa: { lon: [0, 53], lat: [29, 60], latRef: 45, width: 1000, land: land50, lakes: lakes50, tolerance: 0.5 },
  swiat: { lon: [-82, 128], lat: [-58, 62], latRef: 0, width: 1000, land: land110, lakes: null, tolerance: 0.8 },
}

const rings = (geojson) =>
  geojson.features.flatMap((f) =>
    f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat(),
  )

// Douglas–Peucker on projected points. Rings are closed (first point = last),
// so start from two halves split at the point farthest from the first.
function simplify(points, tolerance) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length)
  const last = points.length - 1
  let far = 1
  for (let i = 1; i < last; i++) {
    const d = (p) => Math.hypot(p[0] - points[0][0], p[1] - points[0][1])
    if (d(points[i]) > d(points[far])) far = i
  }
  keep[0] = keep[far] = keep[last] = 1
  const stack = [
    [0, far],
    [far, last],
  ]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = points[a]
    const [bx, by] = points[b]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    let max = 0
    let index = -1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len
      if (d > max) [max, index] = [d, i]
    }
    if (max > tolerance && index > 0) {
      keep[index] = 1
      stack.push([a, index], [index, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

const basemap = {}
mkdirSync(join(ROOT, "public/mapa"), { recursive: true })
for (const [name, m] of Object.entries(MAPS)) {
  const kx = Math.cos((m.latRef * Math.PI) / 180)
  const scale = m.width / ((m.lon[1] - m.lon[0]) * kx)
  const height = Math.round((m.lat[1] - m.lat[0]) * scale)
  const project = ([lon, lat]) => [(lon - m.lon[0]) * kx * scale, (m.lat[1] - lat) * scale]
  // Points far outside the view are clamped to a margin box: smaller files,
  // and the clamped edges are never visible.
  const margin = 20
  const clamp = ([x, y]) => [
    Math.min(m.width + margin, Math.max(-margin, x)),
    Math.min(height + margin, Math.max(-margin, y)),
  ]
  const visible = (ring) =>
    ring.some(([x, y]) => x >= -margin && x <= m.width + margin && y >= -margin && y <= height + margin)

  const toPath = (geojson) =>
    rings(geojson)
      .map((ring) => ring.map(project))
      .filter(visible)
      .map((ring) => simplify(ring.map(clamp), m.tolerance))
      .filter((ring) => ring.length >= 4)
      .map((ring) => "M" + ring.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z")
      .join("")

  // Lakes inside the land become holes with fill-rule evenodd.
  const d = toPath(m.land) + (m.lakes ? toPath(m.lakes) : "")
  basemap[name] = { lon: m.lon, lat: m.lat, latRef: m.latRef, width: m.width, height, d }
  writeFileSync(
    join(ROOT, `public/mapa/${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${height}"><path fill-rule="evenodd" d="${d}"/></svg>\n`,
  )
  console.log(`${name}: ${m.width}×${height}, ${(d.length / 1024).toFixed(0)} KB path`)
}
writeFileSync(join(ROOT, "src/data/basemap.json"), JSON.stringify(basemap) + "\n")
