/*
 * Genera tools/data/cielo.json: para cada constelacion, su nombre en espanol, las lineas que la dibujan y sus estrellas
 * mas brillantes con nombre. nueva-ficha.mjs lo usa para rellenar sola la "Ubicacion celeste" de cada ficha.
 * Datos: d3-celestial (licencia BSD-3, https://github.com/ofrohn/d3-celestial). Solo hace falta ejecutarlo una vez
 * (o para regenerar): node tools/construir-cielo.mjs
 */
import fs from 'fs'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASE = 'https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/'
const get = async f => { const r = await fetch(BASE + f); if (!r.ok) throw new Error(f + ' -> ' + r.status); return r.json() }
const [cons, lines, stars, names] = await Promise.all(['constellations.json', 'constellations.lines.json', 'stars.6.json', 'starnames.json'].map(get))

const ra360 = x => +(((x % 360) + 360) % 360).toFixed(2)
const grid = new Map()
for (const s of stars.features) {
  const [lon, lat] = s.geometry.coordinates, k = Math.round(lon * 20) + ',' + Math.round(lat * 20)
  ;(grid.get(k) || grid.set(k, []).get(k)).push({ id: s.id, lon, lat, mag: s.properties.mag })
}
const near = (lon, lat) => {
  let best = null
  for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1])
    for (const s of grid.get(Math.round(lon * 20) + dx + ',' + (Math.round(lat * 20) + dy)) || [])
      if (Math.abs(s.lon - lon) < 0.02 && Math.abs(s.lat - lat) < 0.02 && (!best || s.mag < best.mag)) best = s
  return best
}
const esOf = new Map(cons.features.map(c => [c.id, c.properties.es]))

const out = {}
for (const f of lines.features) {
  const abbr = f.id, es = esOf.get(abbr)
  if (!es) continue
  const segs = f.geometry.coordinates.map(l => l.map(([lo, la]) => [ra360(lo), +la.toFixed(2)]))
  const seen = new Map()
  for (const l of f.geometry.coordinates) for (const [lo, la] of l) {
    const s = near(lo, la)
    if (!s || s.mag > 4.7 || seen.has(s.id)) continue
    const nm = names[s.id] || {}
    const label = nm.name || (nm.bayer ? nm.bayer + ' ' + es : '')
    if (label) seen.set(s.id, [label, ra360(s.lon), +s.lat.toFixed(2), +s.mag.toFixed(1)])
  }
  out[abbr] = { es, segs, stars: [...seen.values()].sort((a, b) => a[3] - b[3]).slice(0, 10) }
}
fs.mkdirSync(ROOT + 'tools/data', { recursive: true })
fs.writeFileSync(ROOT + 'tools/data/cielo.json', JSON.stringify(out))
console.log('Constelaciones:', Object.keys(out).length, '· Orion:', out.Ori.stars.map(s => s[0]).join(', '))
console.log('Escultor:', out.Scl && out.Scl.stars.map(s => s[0]).join(', '))
