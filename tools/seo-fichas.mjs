/*
 * SEO de las fichas: se ejecuta DESPUES de "npx quartz build" (en el despliegue) y completa la pagina publicada
 * de cada objeto de fichas.json para que Google vea lo mismo que la ficha 3D:
 *   - titulo "M42 · Nebulosa de Orion | Vero Cosmos" (tambien og:title y twitter:title)
 *   - texto alternativo en las fotos que no lo tengan
 *   - boton "Ver en el atlas 3D" al principio del articulo
 *   - datos, etiquetas, curiosidades y otros objetos al final del articulo
 *   - datos estructurados (JSON-LD)
 * No toca las notas de Obsidian ni nada fuera de public/. Si una pagina no existe, avisa y sigue.
 * IMPORTANTE: el atlas y ficha.html leen estas mismas paginas y muestran como texto cada <p> del <article>
 * (preview, panel lateral y ficha completa). Por eso aqui no se anade NINGUN <p>: solo div, h2, ul y li.
 *
 * Uso:  node tools/seo-fichas.mjs [carpeta]   (por defecto public)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = path.resolve(ROOT, process.argv[2] || 'public')
const SITE = 'https://verocosmos.com'
const FICHAS = JSON.parse(fs.readFileSync(path.join(ROOT, 'quartz', 'static', 'fichas.json'), 'utf8'))
const MARCA = 'data-vc-seo'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = o => JSON.stringify(o).replace(/</g, '\\u003c')
const fecha = s => (decodeURIComponent(s).match(/\d{4}-\d{2}-\d{2}/) || [''])[0]
const fechaEs = d => d.split('-').reverse().join('/')
/* los valores que empiezan por @ se calculan en vivo en la ficha (fase de la Luna, constelacion de hoy...) */
const fijo = v => typeof v === 'string' && !v.startsWith('@')

/* busca el .html publicado de una clave de fichas.json, sin depender de mayusculas ni de la normalizacion */
const norm = s => s.normalize('NFC').toLowerCase()
const todos = []
;(function recorrer(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name)
    if (f.isDirectory()) recorrer(p)
    else if (f.name.endsWith('.html')) todos.push(p)
  }
})(OUT)
const buscar = clave => {
  const quiero = norm(clave + '.html')
  return todos.filter(p => norm(path.relative(OUT, p).split(path.sep).join('/')) === quiero)
}

let hechas = 0
for (const [clave, f] of Object.entries(FICHAS)) {
  const archivos = buscar(clave)
  if (!archivos.length) {
    console.warn('⚠ No encuentro la pagina publicada de', clave)
    continue
  }
  for (const archivo of archivos) {
    let h = fs.readFileSync(archivo, 'utf8')
    if (h.includes(MARCA)) continue
    /* las paginas de alias (mayusculas) solo redirigen: no se tocan */
    if (/<meta[^>]+name="robots"[^>]+noindex/i.test(h) && !/<article/i.test(h)) continue
    if (!/<article[\s>]/i.test(h)) {
      console.warn('⚠ Sin <article> en', archivo)
      continue
    }

    const url = SITE + '/' + clave.split('/').map(encodeURIComponent).join('/')
    const atlas = SITE + '/atlas-astrofotografico#' + encodeURIComponent(clave.split('/').pop())
    const titulo = f.name + ' | Vero Cosmos'
    const desc = ((h.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [])[1] || '').trim()

    /* 1. titulos */
    h = h.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(titulo)}</title>`)
    h = h.replace(/(<meta[^>]+(?:property|name)="(?:og:title|twitter:title)"[^>]+content=")[^"]*(")/gi, `$1${esc(titulo)}$2`)

    /* 2. fotos: texto alternativo y la mas reciente para el JSON-LD */
    const fotos = []
    h = h.replace(/<img\b[^>]*>/gi, tag => {
      const src = (tag.match(/\bsrc="([^"]+)"/i) || [])[1] || ''
      if (!/\.(jpe?g|png|webp|avif)(\?|$)/i.test(src) || /\/static\//.test(src)) return tag
      const d = fecha(src)
      const s50 = /_s50_/i.test(decodeURIComponent(src))
      const alt = `${f.name}, ${s50 ? 'fotografiada con un Seestar S50' : 'foto de Vero Snowy'}${d ? ' el ' + fechaEs(d) : ''} · Vero Cosmos`
      fotos.push({ src, d, alt })
      if (/\balt="[^"]+"/i.test(tag)) return tag
      /* Quartz deja el alt vacio ("alt" o alt=""): se quita y se pone el nuestro */
      return tag.replace(/\s+alt(?:="")?(?=[\s/>])/gi, '').replace(/<img\b/i, `<img alt="${esc(alt)}"`)
    })
    fotos.sort((a, b) => b.d.localeCompare(a.d))

    /* 3. boton al atlas 3D, al principio del articulo */
    const boton = `<div class="vc-seo-atlas" ${MARCA}><a href="${esc(atlas)}" class="external">Ver ${esc(f.name)} en el atlas 3D de Vero Cosmos →</a></div>`
    h = h.replace(/(<article\b[^>]*>)/i, `$1${boton}`)

    /* 4. datos, etiquetas, curiosidades y otros objetos, al final del articulo */
    const facts = (f.facts || []).filter(([, v]) => fijo(v))
    let extra = `<section class="vc-seo-ficha" ${MARCA}>`
    if (facts.length) extra += `<h2 id="datos">Datos</h2><ul>${facts.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul>`
    if ((f.trivia || []).length) extra += `<h2 id="curiosidades">Curiosidades</h2><ul>${f.trivia.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
    if ((f.others || []).length)
      extra += `<h2 id="otros-objetos">Otros objetos cercanos o relacionados</h2><ul>${f.others
        .map(o => {
          const n = o.s ? `<a href="${esc(SITE + '/' + o.s.split('/').map(encodeURIComponent).join('/'))}" class="internal">${esc(o.n)}</a>` : esc(o.n)
          return `<li>${n}: ${esc(o.d)}</li>`
        })
        .join('')}</ul>`
    if ((f.cats || []).length) extra += `<h2 id="etiquetas">Etiquetas</h2><ul>${f.cats.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`
    extra += `<div><a href="${esc(atlas)}" class="external">Abrir la ficha completa con el modelo 3D →</a></div></section>`
    const fin = h.search(/<\/article>/i)
    h = h.slice(0, fin) + extra + h.slice(fin)

    /* 5. datos estructurados */
    const foto = fotos[0]
    const datos = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: titulo,
      url,
      inLanguage: 'es',
      ...(desc && { description: desc }),
      about: { '@type': 'Thing', name: f.name },
      isPartOf: { '@type': 'WebSite', name: 'Vero Cosmos', url: SITE + '/' },
      author: { '@type': 'Person', name: 'Vero Snowy' },
      ...(foto && {
        primaryImageOfPage: {
          '@type': 'ImageObject',
          contentUrl: new URL(foto.src, url).href,
          caption: foto.alt,
          ...(foto.d && { dateCreated: foto.d }),
          creator: { '@type': 'Person', name: 'Vero Snowy' },
          creditText: 'Vero Snowy · Vero Cosmos',
        },
      }),
    }
    h = h.replace(/<\/head>/i, `<script type="application/ld+json" ${MARCA}>${ld(datos)}</script></head>`)

    fs.writeFileSync(archivo, h)
    hechas++
    console.log('✓', path.relative(OUT, archivo), `(${facts.length} datos, ${(f.trivia || []).length} curiosidades, ${fotos.length} fotos)`)
  }
}
console.log(`\nPaginas de fichas completadas: ${hechas}`)
