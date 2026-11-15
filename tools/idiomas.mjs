/*
 * Paginas por idioma para Google. Se ejecuta DESPUES de "npx quartz build" y de "node tools/seo-fichas.mjs"
 * (en el despliegue) y solo escribe en public/:
 *   - las paginas principales en ingles (/en/...) y frances (/fr/...), con su titulo, descripcion y texto
 *   - una pagina por ficha (/atlas-astrofotografico/m42-nebulosa-de-orion, /en/astrophotography-atlas/m42-orion-nebula...)
 *   - una pagina por entrada de la Bitacora (/bitacora-del-cielo/leonidas-2026, /en/sky-log/leonids-2026...)
 *   - en todas: enlaces hreflang a sus otras versiones y direccion canonica
 *   - el sitemap con todas las versiones, el trozo de URL de cada ficha en fichas.json y la pagina 404
 * Todas las paginas generadas cargan el mismo atlas (el iframe de la pagina en espanol): el atlas lee el idioma
 * y la seccion de la direccion (quartz/static/rutas.js). Los textos salen del diccionario de la web (vc-i18n.js),
 * de bitacora.json, de lluvias.js y de tools/data/paginas-idiomas.json.
 * No toca las notas de Obsidian. Uso: node tools/idiomas.mjs [carpeta]   (por defecto public)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { traducir, vcRutas as R, vcLluvias } from './lib-i18n.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = path.resolve(ROOT, process.argv[2] || 'public')
const SITE = 'https://verocosmos.com'
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'data', 'paginas-idiomas.json'), 'utf8'))
const LANGS = ['es', 'en', 'fr']
const KEYS = ['principal', 'atlas', 'guide', 'lugar', 'log', 'about']
const NOMBRE = { atlas: 'Atlas Astrofotográfico', guide: 'Guía Astronómica', lugar: 'Lugar para observar', log: 'Bitácora del Cielo', about: '¿Quiénes somos?' }
const LOCALE = { es: 'es_ES', en: 'en_GB', fr: 'fr_FR' }
const INTL = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR' }
const avisos = [], sinTraducir = new Set()

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>'
const abs = p => SITE + encodeURI(p)
const tx = (o, l) => o == null ? '' : typeof o === 'string' ? o : (o[l] || o.es || '')
const corta = (s, n = 158) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, '') + '…' }
const nombre = (k, l) => k === 'principal' ? 'Vero Cosmos' : traducir(NOMBRE[k], l)
const titulo = (k, l) => k === 'principal' ? 'Vero Cosmos' : nombre(k, l) + ' · Vero Cosmos'
/* archivo de public/ que sirve una direccion: "/" -> index.html, "/en/" -> en/index.html, "/en/sky-log" -> en/sky-log.html */
const archivo = p => path.join(OUT, ...(p.endsWith('/') ? (p.slice(1) + 'index.html') : (p.slice(1) + '.html')).split('/').filter(Boolean))
const leer = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null
function escribir(f, s) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s) }

/* traduccion de un texto de la web: diccionario propio de esta herramienta, el de la web y algunos patrones */
function T(s, l) {
  if (l === 'es' || !s || !/[a-záéíóúñ]/i.test(s)) return s
  const m0 = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), t = m0[2]
  const pre = /^[:·,]\s*/.exec(t), core = pre ? t.slice(pre[0].length) : t
  const local = D.fichas[l] || {}
  let r = local[core] ?? null
  if (r == null) { const x = traducir(core, l); if (x !== core) r = x }
  if (r == null && /:$/.test(core)) { const x = traducir(core.slice(0, -1), l); if (x !== core.slice(0, -1)) r = x + (l === 'fr' ? ' :' : ':') }
  if (r == null) {
    let m
    if ((m = /^Ver (.+) en el atlas 3D de Vero Cosmos →$/.exec(core))) r = l === 'en' ? `See ${T(m[1], l)} in the Vero Cosmos 3D atlas →` : `Voir ${T(m[1], l)} dans l’atlas 3D de Vero Cosmos →`
    else if ((m = /^(.+), fotografiad[oa] con (?:un |una )?(.+) el (\d{2}\/\d{2}\/\d{4}) · Vero Cosmos$/.exec(core))) r = l === 'en' ? `Photo of ${T(m[1], l)} taken with a ${m[2]} on ${m[3]} · Vero Cosmos` : `Photo de ${T(m[1], l)} prise avec un ${m[2]} le ${m[3]} · Vero Cosmos`
  }
  /* "Nombre: descripcion" (otros objetos de la ficha): cada parte por su lado */
  if (r == null && /^[^:]{1,60}: \S/.test(core)) { const i = core.indexOf(': '); const a = T(core.slice(0, i), l), b = T(core.slice(i + 2), l); r = a + (l === 'fr' ? ' : ' : ': ') + b; return m0[1] + (pre ? pre[0] : '') + r + m0[3] }
  if (r == null) { if (/(^|[\s(«“])[a-záéíóúñ]{4,}/.test(core)) sinTraducir.add(l + ': ' + corta(core, 90)); r = core }
  return m0[1] + (pre ? pre[0] : '') + r + m0[3]
}
/* traduce los textos y los "alt" de un trozo de HTML */
function traducirHtml(html, l) {
  if (l === 'es') return html
  return html.split(/(<[^>]+>)/).map(p => p.startsWith('<')
    ? p.replace(/\balt="([^"]*)"/, (_, a) => 'alt="' + esc(T(a.replace(/&quot;/g, '"').replace(/&amp;/g, '&'), l)) + '"')
    : T(p, l)).join('')
}

/* ---------------- datos ---------------- */
/* la pagina en espanol de cada seccion (la genera Quartz desde el vault) y su iframe del atlas */
const ES = {}
for (const k of KEYS) {
  const f = archivo(R.path(k, 'es')), html = leer(f)
  if (!html) { avisos.push('No encuentro la pagina en espanol de ' + k + ' (' + f + ')'); continue }
  const iframe = (html.match(/<iframe[^>]*VeroCosmos_[\d.]+\.html[^>]*><\/iframe>/) || [])[0]
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
  ES[k] = { f, html, iframe, desc: desc.replace(/&quot;/g, '"').replace(/&amp;/g, '&') }
}
const IFRAME = (ES.principal || ES.atlas || {}).iframe
if (!IFRAME) throw new Error('No encuentro el iframe del atlas en las paginas de Quartz: ¿se ha ejecutado "npx quartz build"?')
const iframeDe = k => (ES[k] && ES[k].iframe) || IFRAME

/* fichas: su trozo de URL en cada idioma (tambien se guarda en public/static/fichas.json para el atlas) */
const FJ = path.join(OUT, 'static', 'fichas.json')
const FICHAS = JSON.parse(fs.readFileSync(FJ, 'utf8'))
const FSLUG = {}
for (const [k, f] of Object.entries(FICHAS)) {
  FSLUG[k] = {}; for (const l of LANGS) FSLUG[k][l] = R.slug(l === 'es' ? f.name : traducir(f.name, l))
  f.slug = FSLUG[k]
}
fs.writeFileSync(FJ, JSON.stringify(FICHAS))
const seg = k => k.split('/').pop()
const fichaPath = (k, l) => R.path('atlas', l, FSLUG[k][l])

/* entradas de la Bitacora: las mismas que ve la web (notas + lluvias automaticas), en el mismo orden */
const BJ = JSON.parse(leer(path.join(OUT, 'static', 'bitacora.json')) || '{"items":[]}')
const AHORA = Date.now(), HOY = new Date(AHORA).toISOString().slice(0, 10)
function merge(notes, auto) {
  const byId = {}, out = []
  notes.forEach(n => { byId[n.id] = n })
  auto.forEach(a => {
    let n = byId[a.id]
    if (n && n.tipo !== 'evento') { out.push({ ...n, id: n.id + '-noticia' }); delete byId[a.id]; n = null }
    if (!n) { out.push(a); return }
    const m = { ...a }
    for (const k in n) { const v = n[k]; if (v != null && v !== '' && !(Array.isArray(v) && !v.length)) m[k] = v }
    m.auto = false; out.push(m); delete byId[a.id]
  })
  notes.forEach(n => { if (byId[n.id] && (n.tipo !== 'evento' || n.inicio)) out.push(n) })
  return out
}
const ITEMS = merge(BJ.items || [], vcLluvias.items(AHORA))
const ERESTS = R.entryRests(ITEMS)
/* con pagina: las notas ya publicadas y las lluvias automaticas */
const publicada = it => it.auto || Date.parse(it.fecha + 'T00:00:00') <= AHORA + 864e5
const ENTRADAS = ITEMS.filter(publicada).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
const entradaPath = (it, l) => R.path('log', l, ERESTS[it.id][l])

/* ---------------- piezas de las paginas ---------------- */
const SEOSTYLE = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: auto; z-index: 0; background: #05060f; color: #cfd6ff; font-family: system-ui, sans-serif; padding: 24px; box-sizing: border-box;'
function hreflangs(alts) {
  return LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${abs(alts[l])}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${abs(alts.es)}">`
}
function menu(l) {
  const M = D.menu[l]
  return `<nav><h2>${esc(M.titulo)}</h2><ul>` + KEYS.filter(k => k !== 'principal').map(k => `<li><a href="${abs(R.path(k, l))}">${esc(nombre(k, l))}</a>: ${esc(M[k])}</li>`).join('') +
    `</ul><p><a href="${abs(R.path('principal', l))}">${esc(M.volver)}</a></p></nav>`
}
function listaFichas(l) {
  return `<h2>${esc(D.menu[l].fichas)}</h2><ul>` + Object.keys(FICHAS).map(k => `<li><a href="${abs(fichaPath(k, l))}">${esc(l === 'es' ? FICHAS[k].name : traducir(FICHAS[k].name, l))}</a></li>`).join('') + '</ul>'
}
function listaEntradas(l) {
  if (!ENTRADAS.length) return ''
  return `<h2>${esc(D.menu[l].entradas)}</h2><ul>` + ENTRADAS.map(it => `<li><a href="${abs(entradaPath(it, l))}">${esc(tx(it.t, l))}</a></li>`).join('') + '</ul>'
}
const UMAMI = '<script defer src="https://cloud.umami.is/script.js" data-website-id="b535d0a8-042e-45e0-9038-bce94b809332" data-auto-track="true"></script>'
function pagina({ l, title, description, p, alts, iframe, body, json, image, type }) {
  const url = abs(p), img = image || SITE + '/static/og-image.png'
  return `<!DOCTYPE html>
<html lang="${l}" dir="ltr"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-visual">
<meta name="color-scheme" content="dark"><meta name="theme-color" content="#05060f">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">${hreflangs(alts)}
<meta property="og:site_name" content="Vero Cosmos"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${type || 'website'}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${LOCALE[l]}">
<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(img)}">
<link rel="icon" type="image/png" href="/static/favicon.png">
${UMAMI}
${json ? ld(json) : ''}
<style>html,body{margin:0;background:#05060f}.vc-seo-page a{color:#8ab4ff}.vc-seo-page img{max-width:100%;height:auto}</style>
</head><body>
${iframe}
<div class="vc-seo-page" style="${SEOSTYLE}">${body}</div>
</body></html>
`
}
/* pagina de Quartz en espanol: se le anaden los hreflang (y, si no tiene texto propio, el texto para Google) */
function completarEs(html, alts, extra) {
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '')
  html = html.replace('</head>', hreflangs(alts) + '</head>')
  if (extra && !/class="vc-seo-page"/.test(html)) html = html.replace(/<\/body>/, `<div class="vc-seo-page" style="${SEOSTYLE}">${extra}</div></body>`)
  return html
}

/* ---------------- 1) paginas principales ---------------- */
const contador = { principales: 0, fichas: 0, entradas: 0 }
for (const k of KEYS) {
  if (!ES[k]) continue
  const alts = R.alts(k)
  const extra = l => (k === 'atlas' ? listaFichas(l) : '') + (k === 'log' ? listaEntradas(l) : '')
  /* espanol: la pagina de Quartz, con sus hreflang y, salvo la portada (que ya trae su texto), el texto para Google */
  let hes = completarEs(ES[k].html, alts, k === 'principal' ? null : `<h1>${esc(nombre(k, 'es'))}</h1><p>${esc(ES[k].desc)}</p>${extra('es')}${menu('es')}`)
  /* portada (verocosmos.com): la primera visita va al idioma del navegador; despues, al que se haya elegido con el
     selector. Nunca a los buscadores, para que Google siga leyendo la portada en espanol */
  if (k === 'principal' && !hes.includes('data-vc-idioma')) hes = hes.replace(/<head>/, '<head><script data-vc-idioma>(function(){try{' +
    'if(location.pathname!=="/"||navigator.webdriver||/bot|crawl|spider|slurp|google|bing|yandex|baidu|duckduck|facebookexternal|headless|lighthouse|preview/i.test(navigator.userAgent))return;' +
    'var s=localStorage,c=s.getItem("vc-lang"),t=null;' +
    'if(c==="en"||c==="fr")t=c;else if(!c&&!s.getItem("vc-visto")){var l=String((navigator.languages&&navigator.languages[0])||navigator.language||"").toLowerCase();t=l.indexOf("es")===0?null:l.indexOf("fr")===0?"fr":"en"}' +
    's.setItem("vc-visto","1");if(t)location.replace("/"+t+"/"+location.search+location.hash)}catch(e){}})()</script>')
  escribir(ES[k].f, hes)
  for (const l of ['en', 'fr']) {
    const desc = D.paginas[k][l].description
    const body = `<h1>${esc(nombre(k, l))}</h1>` + (k === 'principal' ? D.portada[l] : `<p>${esc(desc)}</p>`) + extra(l) + menu(l)
    const json = k === 'principal'
      ? { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Vero Cosmos', url: abs(alts[l]), description: desc, inLanguage: l, publisher: { '@type': 'Person', name: 'Vero Snowy', sameAs: ['https://www.instagram.com/vero_cosmos/', 'https://github.com/VeroSnowy/VeroCosmos'] } }
      : { '@context': 'https://schema.org', '@type': 'WebPage', name: titulo(k, l), url: abs(alts[l]), description: desc, inLanguage: l, isPartOf: { '@type': 'WebSite', name: 'Vero Cosmos', url: abs(R.path('principal', l)) } }
    escribir(archivo(alts[l]), pagina({ l, title: titulo(k, l), description: desc, p: alts[l], alts, iframe: iframeDe(k), body, json }))
    contador.principales++
  }
}

/* ---------------- 2) fichas ---------------- */
const norm = s => s.normalize('NFC').toLowerCase()
const htmlPorSlug = {}
;(function recorrer(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name)
    if (f.isDirectory()) recorrer(p)
    else if (f.name.endsWith('.html')) htmlPorSlug[norm(path.relative(OUT, p).replace(/\\/g, '/').replace(/\.html$/, ''))] = p
  }
})(OUT)
for (const [k, F] of Object.entries(FICHAS)) {
  const f = htmlPorSlug[norm(k)], html = f && leer(f)
  if (!html) { avisos.push('No encuentro la pagina de la ficha ' + k); continue }
  const art = (html.match(/<article[^>]*>([\s\S]*?)<\/article>/) || [])[1] || ''
  const base = SITE + '/' + encodeURI(k)
  const descEs = ((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  const alts = {}; for (const l of LANGS) alts[l] = fichaPath(k, l)
  for (const l of LANGS) {
    let a = art.replace(/<svg[\s\S]*?<\/svg>/g, '')
    /* enlaces: a otras fichas -> su pagina en este idioma; relativos -> absolutos */
    a = a.replace(/\b(href|src)="([^"]+)"/g, (m0, at, u) => {
      let full; try { full = new URL(u.replace(/&amp;/g, '&'), base + '/x').href } catch (e) { return m0 }
      const h = /^https:\/\/verocosmos\.com\/atlas-astrofotografico#(.+)$/.exec(full)
      if (h) { const kk = Object.keys(FICHAS).find(x => seg(x) === decodeURIComponent(h[1])); if (kk) return `${at}="${abs(fichaPath(kk, l))}"` }
      if (full.startsWith(SITE + '/')) {
        const pth = norm(decodeURIComponent(new URL(full).pathname.slice(1)))
        const kk = Object.keys(FICHAS).find(x => norm(x) === pth)
        if (kk) return `${at}="${abs(fichaPath(kk, l))}"`
      }
      return `${at}="${esc(full)}"`
    }).replace(/\s(class|data-slug|id)="[^"]*"/g, '')
    a = traducirHtml(a, l)
    const nm = l === 'es' ? F.name : traducir(F.name, l)
    const img = (a.match(/<img[^>]*src="([^"]+)"/) || [])[1]
    let desc = l === 'es' ? descEs : traducir(descEs, l)
    if (l !== 'es' && desc === descEs) { const p1 = (a.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || ''; desc = p1.replace(/<[^>]+>/g, '') || nm }
    desc = corta(desc)
    const body = `<h1>${esc(nm)}</h1>` + a + menu(l)
    const json = { '@context': 'https://schema.org', '@type': 'WebPage', name: nm + ' · Vero Cosmos', url: abs(alts[l]), description: desc, inLanguage: l, ...(img ? { image: img } : {}), isPartOf: { '@type': 'WebSite', name: 'Vero Cosmos', url: abs(R.path('principal', l)) } }
    escribir(archivo(alts[l]), pagina({ l, title: nm + ' · Vero Cosmos', description: desc, p: alts[l], alts, iframe: iframeDe('atlas'), body, json, image: img }))
    contador.fichas++
  }
  /* la pagina antigua de Quartz (la que lee el atlas para sus textos) apunta como canonica a la nueva en espanol */
  escribir(f, html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${abs(alts.es)}"/>`).replace(/(<meta property="og:url" content=")[^"]*/, '$1' + abs(alts.es)))
}

/* ---------------- 3) entradas de la Bitacora ---------------- */
function md(s) {
  return esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
    .split('\n').map(x => x.trim()).filter(Boolean).map(x => /^- /.test(x) ? `<li>${x.slice(2)}</li>` : `<p>${x}</p>`).join('')
}
function cuando(it, l) {
  if (!it.inicio) return ''
  const o = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }
  const f = new Intl.DateTimeFormat(INTL[l], o)
  const a = f.format(new Date(it.inicio)), b = it.fin ? f.format(new Date(it.fin)) : ''
  return (b ? a + ' – ' + b : a) + (it.hora ? ' · ' + tx(it.hora, l) : '')
}
const imgUrl = s => !s ? '' : /^https?:/.test(s) ? s : SITE + '/static/' + encodeURI(s.replace(/^\/?(static\/)?/, ''))
for (const it of ENTRADAS) {
  const alts = {}; for (const l of LANGS) alts[l] = entradaPath(it, l)
  for (const l of LANGS) {
    const B = D.bitacora[l], t = tx(it.t, l), d = tx(it.d, l)
    let body = `<article><h1>${esc(t)}</h1>`
    const w = cuando(it, l); if (w) body += `<p><b>${esc(B.cuando)}:</b> ${esc(w)}</p>`
    if (it.img) body += `<figure><img src="${imgUrl(it.img)}" alt="${esc(t)}">${it.credito ? `<figcaption>${esc(tx(it.credito, l))}</figcaption>` : ''}</figure>`
    if (d) body += `<p><b>${esc(d)}</b></p>`
    for (const p of it.p || []) {
      if (p.img) body += `<figure><img src="${imgUrl(p.img)}" alt="${esc(tx(p.cap, l) || t)}">${p.cap ? `<figcaption>${esc(tx(p.cap, l))}</figcaption>` : ''}</figure>`
      else if (p.h) body += `<h2>${esc(tx(p, l))}</h2>`
      else body += md(tx(p, l))
    }
    const fu = [].concat(it.fuente || []).filter(Boolean)
    if (fu.length) body += `<p>${esc(B.fuente)}: ` + fu.map(u => `<a href="${esc(u)}" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, ''))}</a>`).join(', ') + '</p>'
    body += `<p><a href="${abs(R.path('log', l))}">← ${esc(nombre('log', l))}</a></p></article>` + menu(l)
    const desc = corta(d || t), img = it.img ? imgUrl(it.img) : null
    const json = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: t, description: desc, inLanguage: l, url: abs(alts[l]), mainEntityOfPage: abs(alts[l]), ...(it.fecha && it.fecha <= HOY ? { datePublished: it.fecha } : {}), ...(img ? { image: img } : {}), author: { '@type': 'Person', name: 'Vero Snowy' }, publisher: { '@type': 'Organization', name: 'Vero Cosmos', logo: { '@type': 'ImageObject', url: SITE + '/static/logo.png' } }, isPartOf: { '@type': 'WebPage', name: titulo('log', l), url: abs(R.path('log', l)) } }
    escribir(archivo(alts[l]), pagina({ l, title: t + ' · ' + nombre('log', l) + ' · Vero Cosmos', description: desc, p: alts[l], alts, iframe: iframeDe('log'), body, json, image: img, type: 'article' }))
    contador.entradas++
  }
}

/* ---------------- 4) sitemap ---------------- */
const smF = path.join(OUT, 'sitemap.xml'), sm = leer(smF) || ''
const viejos = [...sm.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)].map(m => ({ loc: m[1], lastmod: m[2] }))
const fichaViejas = new Set(Object.keys(FICHAS).map(k => norm(k)))
const principalesEs = new Set(KEYS.map(k => abs(R.path(k, 'es'))))
const grupos = []
for (const k of KEYS) if (ES[k]) grupos.push(R.alts(k))
for (const k of Object.keys(FICHAS)) { const a = {}; for (const l of LANGS) a[l] = fichaPath(k, l); grupos.push(a) }
for (const it of ENTRADAS) { const a = {}; for (const l of LANGS) a[l] = entradaPath(it, l); if (it.fecha <= HOY) a.lastmod = it.fecha; grupos.push(a) }
/* carpetas que son una nota (Telescopios/Telescopios.md...): esas si van al sitemap; las demas son solo listados */
const notasCarpeta = new Set()
;(function rec(d, rel) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) {
    const r = rel ? rel + '/' + e.name : e.name
    if (fs.existsSync(path.join(d, e.name, e.name + '.md'))) notasCarpeta.add(norm(r.replace(/ /g, '-')))
    rec(path.join(d, e.name), r)
  }
})(path.join(ROOT, 'content'), '')
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
for (const g of grupos) for (const l of LANGS) {
  xml += `<url><loc>${abs(g[l])}</loc>${g.lastmod ? `<lastmod>${g.lastmod}</lastmod>` : ''}` + LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${abs(g[x])}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(g.es)}"/></url>\n`
}
/* el resto de paginas de Quartz en espanol (catalogos, telescopios...), sin las carpetas ni las fichas antiguas */
for (const v of viejos) {
  const pth = decodeURIComponent(new URL(v.loc).pathname)
  if (principalesEs.has(v.loc) || fichaViejas.has(norm(pth.slice(1)))) continue
  if (pth.endsWith('/') && pth !== '/' && !notasCarpeta.has(norm(pth.slice(1, -1)))) continue
  xml += `<url><loc>${v.loc}</loc>${v.lastmod ? `<lastmod>${v.lastmod}</lastmod>` : ''}</url>\n`
}
xml += '</urlset>\n'
fs.writeFileSync(smF, xml)

/* ---------------- 5) 404: entradas o fichas que ya no estan -> su seccion; /en/... o /fr/... desconocido -> su portada ---------------- */
const f404 = path.join(OUT, '404.html'), h404 = leer(f404)
if (h404 && !h404.includes('data-vc-404')) {
  escribir(f404, h404.replace('</head>', '<script src="/static/rutas.js" data-vc-404></script><script>(function(){try{var R=vcRutas,r=R.parse(location.pathname);if(r.key&&r.rest)location.replace(R.path(r.key,r.lang));else if(!r.key&&r.lang!=="es")location.replace(R.path("principal",r.lang))}catch(e){}})()</script></head>'))
}

console.log(`Paginas: ${contador.principales} principales (en/fr), ${contador.fichas} de fichas, ${contador.entradas} de la Bitacora · sitemap con ${grupos.length * 3} direcciones por idioma`)
if (avisos.length) console.log('Avisos:\n  - ' + avisos.join('\n  - '))
if (sinTraducir.size) console.log('Textos sin traducir (se quedan en espanol):\n  - ' + [...sinTraducir].join('\n  - '))
