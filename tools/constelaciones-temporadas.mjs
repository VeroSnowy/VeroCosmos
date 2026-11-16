/*
 * Dibujos de constelaciones para los banners de temporada (quartz/static/temporadas.js), desde tools/data/cielo.json:
 *   osa-mayor (primavera), triangulo-verano (Lira + Cisne + Aguila con el Triangulo de verano), cruz-sur (Hispanidad)
 * Uso: node tools/constelaciones-temporadas.mjs   -> escribe el bloque CIELO dentro de quartz/static/temporadas.js
 */
import fs from 'fs'
const cielo = JSON.parse(fs.readFileSync(new URL('./data/cielo.json', import.meta.url), 'utf8'))
const PAD = 6
function dibujo(claves, W, H, triangulo) {
  const segs = [], stars = []
  claves.forEach(c => { cielo[c].segs.forEach(s => segs.push(s)); cielo[c].stars.forEach(s => stars.push(s)) })
  const pts = []; segs.forEach(s => s.forEach(p => pts.push(p))); stars.forEach(s => pts.push([s[1], s[2]]))
  const ras = pts.map(p => p[0]), des = pts.map(p => p[1])
  let rc = (Math.max(...ras) + Math.min(...ras)) / 2
  const dc = (Math.max(...des) + Math.min(...des)) / 2, cosd = Math.cos(dc * Math.PI / 180)
  const pr = ([ra, de]) => { let d = ra - rc; if (d > 180) d -= 360; if (d < -180) d += 360; return [-d * cosd, -(de - dc)] }
  const P = pts.map(pr), xs = P.map(p => p[0]), ys = P.map(p => p[1])
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys)
  const sc = Math.min((W - 2 * PAD) / (maxx - minx || 1), (H - 2 * PAD) / (maxy - miny || 1))
  const ox = (W - (maxx - minx) * sc) / 2, oy = (H - (maxy - miny) * sc) / 2
  const T = p => { const q = pr(p); return [+((q[0] - minx) * sc + ox).toFixed(1), +((q[1] - miny) * sc + oy).toFixed(1)] }
  const d = segs.map(s => 'M' + s.map(p => T(p).join(' ')).join('L')).join('')
  const s = stars.map(x => { const [a, b] = T([x[1], x[2]]); return [a, b, +Math.max(0.8, 2.8 - x[3] * 0.5).toFixed(1)] })
  const out = { w: W, h: H, d, s }
  if (triangulo) {
    const v = triangulo.map(n => stars.find(x => x[0] === n)).filter(Boolean).map(x => T([x[1], x[2]]))
    if (v.length === 3) out.t = 'M' + v.map(p => p.join(' ')).join('L') + 'Z'
  }
  return out
}
const out = {
  'osa-mayor': dibujo(['UMa'], 160, 90),
  'triangulo-verano': dibujo(['Lyr', 'Cyg', 'Aql'], 120, 110, ['Vega', 'Deneb', 'Altair']),
  'cruz-sur': dibujo(['Cru'], 70, 90)
}
for (const [k, v] of Object.entries(out)) console.log(k, v.s.length, 'estrellas', v.t ? '(con triangulo)' : '')
const js = '  /* constelaciones de los banners (generadas con tools/constelaciones-temporadas.mjs desde tools/data/cielo.json) */\n  var CIELO = ' + JSON.stringify(out) + '\n'
const f = new URL('../quartz/static/temporadas.js', import.meta.url)
let s = fs.readFileSync(f, 'utf8')
s = s.replace(/  \/\* constelaciones de los banners[^\n]*\n  var CIELO = [^\n]*\n/, '')
s = s.replace('  /* ---------------- escenas animadas ---------------- */', js + '  /* ---------------- escenas animadas ---------------- */')
fs.writeFileSync(f, s)
console.log('CIELO escrito')
