import { chromium } from 'playwright'
import fs from 'fs'
const fichas = Object.keys(JSON.parse(fs.readFileSync('quartz/static/fichas.json', 'utf8')))
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
const pagina = async (w, h) => (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage()
const textoFicha = async (port, slug) => {
  const p = await pagina(1280, 900)
  await p.goto(`http://localhost:${port}/static/ficha.html#${encodeURIComponent(slug)}`)
  await p.waitForFunction(() => document.getElementById('desc') && document.getElementById('desc').children.length > 0, null, { timeout: 20000 }).catch(() => {})
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => ({ desc: [...document.querySelectorAll('#desc p')].map(x => x.textContent), foto: (document.querySelector('img[src*="_s50_" i], img[src*="S50"]') || {}).src || '' }))
  return { r, p }
}
const informe = []
fs.mkdirSync('resultados', { recursive: true })
for (const [i, slug] of fichas.entries()) {
  const a = await textoFicha(8001, slug), d = await textoFicha(8002, slug)
  const igual = JSON.stringify(a.r.desc) === JSON.stringify(d.r.desc)
  informe.push({ slug, igual, antes: a.r.desc, despues: d.r.desc })
  if (i === 0) await d.p.screenshot({ path: 'resultados/2-ficha-3d-despues.jpg', quality: 55 })
    await a.p.close(); await d.p.close()
}
// atlas: panel lateral (primer parrafo) — se comprueba con la misma extraccion que usa el atlas
const nota = await pagina(1280, 900)
await nota.goto(`http://localhost:8002/${fichas[0]}`)
await nota.waitForTimeout(1500)
await nota.screenshot({ path: 'resultados/3-pagina-google-despues.jpg', quality: 55 })
await nota.evaluate(() => document.querySelector('.vc-seo-ficha')?.scrollIntoView())
await nota.waitForTimeout(500)
await nota.screenshot({ path: 'resultados/5-pagina-google-abajo.jpg', quality: 55 })
const movil = await pagina(390, 844)
await movil.goto(`http://localhost:8002/${fichas[0]}`)
await movil.waitForTimeout(1500)
await movil.screenshot({ path: 'resultados/4-pagina-google-movil.jpg', quality: 50 })
const extraccion = async port => {
  const p = await pagina(800, 600)
  await p.goto(`http://localhost:${port}/static/ficha.html`)
  const out = []
  for (const slug of fichas) out.push(await p.evaluate(async slug => {
    const u = new URL(('../' + slug.split('/').map(encodeURIComponent).join('/')), location.href).href
    const doc = new DOMParser().parseFromString(await (await fetch(u)).text(), 'text/html')
    const art = doc.querySelector('article') || doc.body
    const noLinks = x => { const c = x.cloneNode(true); c.querySelectorAll('a').forEach(a => a.remove()); return c.textContent.trim() }
    const md = ((doc.querySelector('meta[name="description"]') || {}).content || '').trim()
    const ps = [...art.querySelectorAll('p')].filter(x => noLinks(x).length > 20).map(x => x.textContent.trim()).filter(x => x !== md)
    return { panel: ps[0] || md, preview: md || ps[0] || '', img: (art.querySelector('img') || {}).getAttribute?.('src') || '' }
  }, slug))
  return out
}
const pa = await extraccion(8001), pd = await extraccion(8002)
const paneles = fichas.map((s, i) => ({ slug: s, igual: JSON.stringify(pa[i]) === JSON.stringify(pd[i]) }))
fs.writeFileSync('resultados/informe.json', JSON.stringify({ fichas3d: informe, panelYPreview: paneles }, null, 1))
console.log('fichas 3D iguales:', informe.filter(x => x.igual).length, '/', informe.length)
console.log('panel y preview iguales:', paneles.filter(x => x.igual).length, '/', paneles.length)
for (const x of informe) console.log(x.igual ? 'OK ' : 'DIF', x.slug, x.despues.length, 'parrafos')
await b.close()
