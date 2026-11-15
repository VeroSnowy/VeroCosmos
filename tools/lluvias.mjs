/*
 * Calendario de lluvias de estrellas (el mismo calculo que usa la web, quartz/static/lluvias.js).
 * Uso:  node tools/lluvias.mjs [ano]        tabla de un ano (por defecto, el actual)
 *       node tools/lluvias.mjs --proximas N  lluvias cuyo maximo cae en los proximos N dias (revision semanal)
 */
import fs from 'fs'
import vm from 'vm'
/* lluvias.js es un script de navegador: se ejecuta en un contexto aparte y se recoge lo que deja en window.vcLluvias */
const ctx = { Intl, Date, Math }
vm.runInNewContext(fs.readFileSync(new URL('../quartz/static/lluvias.js', import.meta.url), 'utf8'), ctx)
const L = ctx.vcLluvias

const args = process.argv.slice(2)
const f = (ms, o) => new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', ...o }).format(new Date(ms))
const fila = r => ({
  lluvia: r.base.nom.es,
  maximoUT: new Date(r.peak).toISOString().slice(0, 16).replace('T', ' ') + ' UT',
  maximoPeninsular: f(r.peak, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
  nocheBuena: f(r.inicio, { weekday: 'short', day: 'numeric', month: 'short' }) + ' 22:00 → ' + f(r.fin, { weekday: 'short', day: 'numeric' }) + ' 07:00',
  luna: Math.round(r.moon * 100) + ' %',
  zhr: r.base.zhr
})
const pi = args.indexOf('--proximas')
if (pi >= 0) {
  const n = +args[pi + 1] || 10, now = Date.now(), y = new Date().getFullYear()
  const r = [...L.ofYear(y - 1), ...L.ofYear(y), ...L.ofYear(y + 1)].filter(x => x.peak > now - 864e5 && x.peak < now + n * 864e5)
  console.log(r.length ? JSON.stringify(r.map(fila), null, 1) : `Ninguna lluvia con maximo en los proximos ${n} dias.`)
} else {
  const y = +args[0] || new Date().getFullYear()
  console.table(L.ofYear(y).map(fila))
}
