/*
 * Moldes de las nebulosas 3D: reduce cada foto del vault a un mapa pequeño de brillo (96x96) y color (24x24), sin estrellas ni
 * rotulos, y los guarda en quartz/static/nebulosas.json. ficha.html reparte los puntos del modelo segun esos mapas, asi que el
 * modelo tiene la forma real de la nebulosa. Las fotos no se tocan.
 *
 * Uso: node tools/nebulosas.mjs        (despues hay que subir el ?v= de nebulosas.json en ficha.html)
 *
 * Cada nebulosa: f = foto, caja = [x, y, lado] en fracciones del ancho de la foto, tapa = [[x, y, radio]] zonas que se borran
 * (estrellas con halo), en las mismas fracciones; gamma = contraste.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const VAULT = fs.readFileSync(path.join(ROOT, '..', 'publicar.ps1'), 'utf8').match(/\$vault\s*=\s*"([^"]+)"/)[1]
const N = 96, C = 24, B = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
const NEB = {
  orion: { f: 'Catálogos/messier/imagenes/M_42/Seestar_S50/M_42_S50_2026-10-24.jpg', caja: [0.035, 0.055, 0.855], tapa: [], bajo: 0.3, alto: 0.985 },
  flame: { f: 'Catálogos/ngc/imagenes/NGC_2024/Seestar-S50/NGC_2024_S50_2026-10-24.jpg', caja: [0.2, 0.15, 0.68], tapa: [[0.85, 0.426, 0.12]], bajo: 0.42, alto: 0.995 },
  pacman: { f: 'Catálogos/ngc/imagenes/NGC_281/Seestar_S50/NGC_281_S50_2026-11-19.jpg', caja: [0.2, 0.17, 0.68], tapa: [], bajo: 0.38, alto: 0.995 },
}
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))] }
const out = {}
for (const [k, n] of Object.entries(NEB)) {
  const src = path.join(VAULT, n.f), m = await sharp(src).metadata(), w = m.width
  const L = Math.min(Math.round(n.caja[2] * w), m.width - Math.round(n.caja[0] * w), m.height - Math.round(n.caja[1] * w))
  const S = 576
  /* la mediana borra las estrellas (puntos) y deja el gas */
  const base = await sharp(src).extract({ left: Math.round(n.caja[0] * w), top: Math.round(n.caja[1] * w), width: L, height: L }).resize(S, S).removeAlpha().toBuffer()
  let im = sharp(base).median(19)
  im = sharp(await im.png().toBuffer()).median(11).blur(1.2)
  const { data } = await sharp(await im.png().toBuffer()).resize(N, N, { kernel: 'cubic' }).raw().toBuffer({ resolveWithObject: true })
  const lum = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    const x = (i % N + .5) / N, y = (Math.floor(i / N) + .5) / N
    let l = data[i * 3] * .45 + data[i * 3 + 1] * .35 + data[i * 3 + 2] * .2
    for (const [tx, ty, tr] of n.tapa) { const d = Math.hypot(n.caja[0] + x * n.caja[2] - tx, n.caja[1] + y * n.caja[2] - ty) / tr; if (d < 1) l *= Math.max(0, (d - .55) / .45) }
    lum[i] = l
  }
  const lo = pct(lum, n.bajo), hi = pct(lum, n.alto)
  let s = ''
  for (let i = 0; i < N * N; i++) {
    const x = (i % N + .5) / N - .5, y = (Math.floor(i / N) + .5) / N - .5, r = Math.max(Math.abs(x), Math.abs(y)) * 2
    const v = Math.max(0, Math.min(1, (lum[i] - lo) / (hi - lo))) * Math.min(1, Math.max(0, (1 - r) / .16))   /* bordes suaves, para que no se note el cuadrado */
    s += B[Math.round(Math.sqrt(v) * 63)]
  }
  const { data: col } = await sharp(await im.png().toBuffer()).resize(C, C, { kernel: 'cubic' }).raw().toBuffer({ resolveWithObject: true })
  let c = ''
  for (let i = 0; i < C * C; i++) { const p = [0, 1, 2].map(j => Math.max(1, col[i * 3 + j])), mx = Math.max(...p); c += p.map(v => B[Math.round(v / mx * 63)]).join('') }
  out[k] = { l: s, c }
  console.log(k, 'caja', L, 'px · fondo', lo.toFixed(1), '· máximo', hi.toFixed(1))
  await sharp(Buffer.from([...s].flatMap(ch => { const v = Math.round((B.indexOf(ch) / 63) ** 2 * 255); return [v, v, v] })), { raw: { width: N, height: N, channels: 3 } }).resize(480, 480, { kernel: 'nearest' }).png().toFile(path.join(process.env.TEMP || '.', 'neb-' + k + '.png'))
}
fs.writeFileSync(path.join(ROOT, 'quartz', 'static', 'nebulosas.json'), JSON.stringify(out) + '\n')
console.log('→ quartz/static/nebulosas.json', fs.statSync(path.join(ROOT, 'quartz', 'static', 'nebulosas.json')).size, 'bytes')
