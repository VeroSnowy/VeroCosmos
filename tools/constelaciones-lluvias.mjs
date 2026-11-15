/*
 * Genera los dibujos (SVG) de las constelaciones de los radiantes de las lluvias de estrellas, a partir de
 * tools/data/cielo.json (lineas y estrellas reales), con el radiante marcado en su posicion real (lista IMO).
 * Uso: node tools/constelaciones-lluvias.mjs   -> escribe el bloque CONST dentro de quartz/static/lluvias.js
 */
import fs from 'fs'
const cielo = JSON.parse(fs.readFileSync(new URL('./data/cielo.json', import.meta.url), 'utf8'))
/* lluvia -> constelacion y radiante (alfa, delta en grados; IMO, tabla 5) */
const RAD = {
  cuadrantidas: ['Boo', 230, 49], liridas: ['Lyr', 271, 34], 'eta-acuaridas': ['Aqr', 338, -1], perseidas: ['Per', 48, 58],
  orionidas: ['Ori', 95, 16], leonidas: ['Leo', 152, 22], geminidas: ['Gem', 112, 33]
}
const W = 120, H = 90, PAD = 8
const out = {}
for (const [id, [c, ra0, de0]] of Object.entries(RAD)) {
  const k = cielo[c]
  const pts = []
  k.segs.forEach(s => s.forEach(p => pts.push(p)))
  k.stars.forEach(s => pts.push([s[1], s[2]]))
  pts.push([ra0, de0])
  /* proyeccion sencilla alrededor del centro: este a la izquierda, norte arriba */
  const ras = pts.map(p => p[0]), des = pts.map(p => p[1])
  let rc = (Math.max(...ras) + Math.min(...ras)) / 2
  if (Math.max(...ras) - Math.min(...ras) > 180) rc = 0 /* por si cruza 0h (no pasa con estas) */
  const dc = (Math.max(...des) + Math.min(...des)) / 2, cosd = Math.cos(dc * Math.PI / 180)
  const pr = ([ra, de]) => { let d = ra - rc; if (d > 180) d -= 360; if (d < -180) d += 360; return [-d * cosd, -(de - dc)] }
  const P = pts.map(pr), xs = P.map(p => p[0]), ys = P.map(p => p[1])
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys)
  const sc = Math.min((W - 2 * PAD) / (maxx - minx || 1), (H - 2 * PAD) / (maxy - miny || 1))
  const ox = (W - (maxx - minx) * sc) / 2, oy = (H - (maxy - miny) * sc) / 2
  const T = p => { const q = pr(p); return [+((q[0] - minx) * sc + ox).toFixed(1), +((q[1] - miny) * sc + oy).toFixed(1)] }
  const d = k.segs.map(s => 'M' + s.map(p => T(p).join(' ')).join('L')).join('')
  const stars = k.stars.map(s => { const [x, y] = T([s[1], s[2]]); return [x, y, +Math.max(0.8, 2.6 - s[3] * 0.45).toFixed(1)] })
  const [rx, ry] = T([ra0, de0])
  out[id] = { c, d, s: stars, r: [rx, ry] }
}
const js = '  /* dibujos de las constelaciones de los radiantes (generados con tools/constelaciones-lluvias.mjs desde tools/data/cielo.json; caja 120x90) */\n  var CONST = ' + JSON.stringify(out) + '\n'
const f = new URL('../quartz/static/lluvias.js', import.meta.url)
let s = fs.readFileSync(f, 'utf8')
s = s.replace(/  \/\* dibujos de las constelaciones[^\n]*\n  var CONST = [^\n]*\n/, '')
s = s.replace('  var D2R = Math.PI / 180', js + '  var D2R = Math.PI / 180')
fs.writeFileSync(f, s)
console.log('CONST escrito:', Object.keys(out).join(', '), '·', js.length, 'bytes')
