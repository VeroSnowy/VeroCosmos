/*
 * Bitacora del Cielo: convierte las notas de la carpeta "Bitácora" del vault en quartz/static/bitacora.json
 * (lo que lee la seccion de la web) y prepara las traducciones al ingles y al frances.
 *
 * Cada nota es una entrada (evento o noticia); ver tools/plantilla-bitacora.md.
 * Las imagenes se copian reducidas a .webp en quartz/static/bitacora/ (las originales no se tocan).
 *
 * Uso:
 *   node tools/bitacora.mjs              genera bitacora.json y lista en tools/pendientes-bitacora.json
 *                                        los textos sin traducir (rellenar "en" y "fr")
 *   node tools/bitacora.mjs --aplicar    guarda las traducciones rellenadas y vuelve a generar
 *   node tools/bitacora.mjs --simular    solo muestra lo que haria, sin escribir nada
 *   --carpeta <ruta>                     leer las notas de otra carpeta (para pruebas)
 *
 * Despues: subir la version del atlas (node tools/nueva-version.mjs) y el ?v= de bitacora.json en el atlas.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STATIC = path.join(ROOT, 'quartz', 'static')
const OUT = path.join(STATIC, 'bitacora.json')
const IMG_DIR = path.join(STATIC, 'bitacora')
const TR_FILE = path.join(ROOT, 'tools', 'data', 'bitacora-traducciones.json')
const PEND_FILE = path.join(ROOT, 'tools', 'pendientes-bitacora.json')
const args = process.argv.slice(2)
const SIMULAR = args.includes('--simular'), APLICAR = args.includes('--aplicar')
const ci = args.indexOf('--carpeta')

/* el vault se lee de publicar.ps1 para no repetir la ruta */
function vault() {
  const ps1 = path.join(ROOT, '..', 'publicar.ps1')
  const m = fs.existsSync(ps1) && fs.readFileSync(ps1, 'utf8').match(/\$vault\s*=\s*"([^"]+)"/)
  if (!m) throw new Error('No encuentro la ruta del vault en ' + ps1 + '. No inventes una: avisa a la dueña.')
  return m[1]
}
/* las notas van en la carpeta "bitacora-del-cielo" del vault (con subcarpetas eventos, noticias, viajes, curiosidades,
   por anos...). Se admite tambien la antigua "Bitácora". La pagina de la seccion (bitacora-del-cielo.md) va FUERA, en la raiz */
function carpetaVault() {
  const v = vault()
  for (const n of ['bitacora-del-cielo', 'Bitácora', 'Bitacora']) if (fs.existsSync(path.join(v, n))) return path.join(v, n)
  return path.join(v, 'bitacora-del-cielo')
}
const CARPETA = ci >= 0 ? path.resolve(args[ci + 1]) : carpetaVault()

const leer = f => JSON.parse(fs.readFileSync(f, 'utf8'))
/* lluvias de estrellas que la web calcula sola (ids de quartz/static/lluvias.js) */
const LLUVIAS = ['cuadrantidas', 'liridas', 'eta-acuaridas', 'perseidas', 'orionidas', 'leonidas', 'geminidas']
const TR = fs.existsSync(TR_FILE) ? leer(TR_FILE) : {}

/* --aplicar: pasa las traducciones rellenadas de pendientes al almacen */
if (APLICAR && fs.existsSync(PEND_FILE)) {
  const pend = leer(PEND_FILE); let n = 0
  for (const p of pend) if (p.es && p.en && p.fr) { TR[p.es] = { en: p.en, fr: p.fr }; n++ }
  if (!SIMULAR) fs.writeFileSync(TR_FILE, JSON.stringify(TR, null, 2) + '\n')
  console.log(`Traducciones guardadas: ${n} de ${pend.length}`)
}

/* cabecera YAML sencilla: "clave: valor" (comentarios con " #") */
function cabecera(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(txt)
  if (!m) return { fm: {}, cuerpo: txt }
  const fm = {}
  for (const l of m[1].split(/\r?\n/)) {
    const k = /^([A-Za-zÀ-ÿ_]+)\s*:\s*(.*)$/.exec(l); if (!k) continue
    let v = k[2].replace(/\s+#.*$/, '').trim()
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1)
    fm[k[1].toLowerCase()] = v
  }
  return { fm, cuerpo: m[2] }
}

/* hora peninsular -> instante con su desfase (+01:00 en invierno, +02:00 en verano) */
function madrid(s) {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?$/.exec(s.trim())
  if (!m) throw new Error('Fecha con formato raro (usa 2026-11-17 o 2026-11-17T22:00): ' + s)
  const [, Y, Mo, D, h = '00', mi = '00'] = m
  for (const off of ['+01:00', '+02:00']) {
    const d = new Date(`${Y}-${Mo}-${D}T${h.padStart(2, '0')}:${mi}:00${off}`)
    const loc = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
    if (loc === `${h.padStart(2, '0')}:${mi}`) return `${Y}-${Mo}-${D}T${h.padStart(2, '0')}:${mi}:00${off}`
  }
  return `${Y}-${Mo}-${D}T${h.padStart(2, '0')}:${mi}:00+01:00`
}

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* parrafos del cuerpo: se separan por lineas en blanco; se quitan titulos (#), enlaces internos [[...]] y comentarios */
function parrafos(cuerpo) {
  return cuerpo.replace(/%%[\s\S]*?%%/g, '').replace(/<!--[\s\S]*?-->/g, '')
    /* los titulos ("## ...") van siempre en su propio parrafo, aunque no lleven linea en blanco alrededor */
    .replace(/^(#{1,6}\s.*)$/gm, '\n$1\n')
    .split(/\r?\n\s*\r?\n/)
    /* las lineas se unen con un espacio, salvo las de lista ("- ..."), que conservan su salto */
    .map(p => p.split(/\r?\n/).map(l => l.trim().replace(/[ \t]+/g, ' ')).filter(Boolean)
      .reduce((acc, l) => acc + (acc ? (/^[-*] /.test(l) ? '\n' : ' ') : '') + l.replace(/^\* /, '- '), ''))
    .filter(p => p && !/^#\s/.test(p) && !/^(\[\[[^\]]+\]\]\s*)+$/.test(p))
    /* las fotos (![[foto.jpg]]) se quedan tal cual: se procesan aparte */
    .map(p => /^!\[\[/.test(p) ? p : p.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').trim())
}

function buscarImagen(nombre, dirNota) {
  if (!nombre) return null
  nombre = nombre.replace(/^!?\[\[|\]\]$/g, '').trim()
  const cand = [path.join(dirNota, nombre), path.join(dirNota, 'imagenes', nombre), path.join(CARPETA, nombre), path.join(CARPETA, 'imagenes', nombre)]
  return cand.find(f => fs.existsSync(f)) || null
}

const avisos = []
if (!fs.existsSync(CARPETA)) {
  console.log('No existe la carpeta de la Bitácora: ' + CARPETA + '\nCréala en el vault (con ese nombre) y pon dentro las notas. Se genera la sección vacía.')
}
const notas = []
;(function rec(d) {
  if (!fs.existsSync(d)) return
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name)
    if (e.isDirectory()) { if (e.name !== 'imagenes' && e.name !== 'temporadas') rec(f) } else if (/\.md$/i.test(e.name)) notas.push(f)
  }
})(CARPETA)

const pendientes = [], usados = new Set()
function t3(es) {
  es = String(es || '').trim(); if (!es) return null
  const t = TR[es]
  if (!t || !t.en || !t.fr) { if (!pendientes.some(p => p.es === es)) pendientes.push({ es, en: '', fr: '' }) }
  usados.add(es)
  return { es, en: (t && t.en) || es, fr: (t && t.fr) || es }
}

let sharp = null
const items = []
for (const f of notas) {
  const { fm, cuerpo } = cabecera(fs.readFileSync(f, 'utf8'))
  const nombre = path.basename(f, '.md')
  if (/^(bitacora-del-cielo|index)$/i.test(nombre) || /<iframe/i.test(cuerpo)) { avisos.push(`${nombre}: es una página, no una entrada; se ignora`); continue }
  if (/^plantilla/i.test(nombre) || fm.borrador === 'si' || fm.borrador === 'sí' || fm.borrador === 'true') continue
  /* tipo: el de la cabecera o, si no lo pone, el de la carpeta (eventos, noticias, viajes, curiosidades) */
  const dirs = path.relative(CARPETA, path.dirname(f)).toLowerCase().split(/[\\/]/)
  const porCarpeta = dirs.some(d => d.startsWith('evento')) ? 'evento' : dirs.some(d => d.startsWith('viaje')) ? 'viaje' : dirs.some(d => d.startsWith('curiosidad')) ? 'curiosidad' : dirs.some(d => d.startsWith('cronica') || d.startsWith('crónica')) ? 'cronica' : 'noticia'
  const tt = (fm.tipo || porCarpeta).toLowerCase()
  /* evento | noticia | viaje | curiosidad (viajes y curiosidades van juntos en su seccion; "cronica" vale como sinonimo) */
  const tipo = tt.startsWith('ev') ? 'evento' : /^(cr|vi|cu)/.test(tt) ? 'cronica' : 'noticia'
  const sub = tipo === 'cronica' ? (tt.startsWith('vi') ? 'viaje' : tt.startsWith('cu') ? 'curiosidad' : null) : null
  const titulo = fm.title || fm.titulo || nombre
  const it = { id: slug(fm.id || titulo), tipo, fecha: fm.fecha || null }
  /* lluvias de estrellas: la web las calcula sola (quartz/static/lluvias.js). Una nota de una lluvia se junta con la
     automatica de ese ano si su id coincide ("leonidas-2026") o si lleva "lluvia: leonidas"; entonces no necesita fechas */
  const ll = fm.lluvia ? slug(fm.lluvia) : LLUVIAS.find(x => it.id === x || it.id.startsWith(x + '-'))
  if (ll && tipo === 'evento') {
    const yy = ((fm.inicio || fm.fecha || '').match(/^\d{4}/) || [String(new Date().getFullYear())])[0]
    it.id = ll + '-' + yy; it.lluvia = ll
  }
  if (sub) it.sub = sub
  if (!it.fecha) { avisos.push(`${nombre}: falta "fecha" (cuándo se publica); uso la de hoy`); it.fecha = new Date().toISOString().slice(0, 10) }
  if (tipo === 'evento') {
    if (!fm.inicio && !it.lluvia) { avisos.push(`${nombre}: es un evento pero falta "inicio"; no se incluye`); continue }
    if (fm.inicio) { it.inicio = madrid(fm.inicio); it.fin = madrid(fm.fin || fm.inicio) }
    if (fm.hora) it.hora = t3(fm.hora)
  }
  it.t = t3(titulo)
  it.d = t3(fm.description || fm.descripcion || '')
  /* parrafos de texto y fotos dentro del texto: "![[foto.jpg]]" y, en la misma linea o justo debajo, su pie de foto */
  it.p = []
  let nf = 0
  for (const par of parrafos(cuerpo)) {
    const m = /^!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]\s*([\s\S]*)$/.exec(par)
    if (!m) {
      /* "## Subtitulo" (de 2 a 6 almohadillas) -> subtitulo en la entrada */
      const h = /^#{2,6}\s+(.+)$/.exec(par)
      if (h) { const x = t3(h[1].replace(/\s*#+$/, '')); x.h = 1; it.p.push(x) } else it.p.push(t3(par))
      continue
    }
    const src = buscarImagen(m[1], path.dirname(f))
    if (!src) { avisos.push(`${nombre}: no encuentro la foto "${m[1]}" del texto`); continue }
    const out = 'bitacora/' + slug(fm.id || titulo) + '-' + (++nf) + '.webp'
    if (!SIMULAR) {
      sharp = sharp || (await import('sharp')).default
      fs.mkdirSync(IMG_DIR, { recursive: true })
      await sharp(src).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(STATIC, out))
    }
    const cap = m[2].replace(/^[*_]+|[*_]+$/g, '').trim()
    it.p.push(cap ? { img: out, cap: t3(cap) } : { img: out })
  }
  /* fuente: un enlace o varios separados por comas */
  if (fm.fuente) { const fu = String(fm.fuente).split(/[\s,]+/).filter(Boolean); it.fuente = fu.length > 1 ? fu : fu[0] }
  if (fm.credito || fm['crédito']) it.credito = t3(fm.credito || fm['crédito'])
  const img = buscarImagen(fm.imagen, path.dirname(f))
  if (fm.imagen && !img) avisos.push(`${nombre}: no encuentro la imagen "${fm.imagen}"`)
  if (img) {
    it.img = 'bitacora/' + it.id + '.webp'
    if (!SIMULAR) {
      sharp = sharp || (await import('sharp')).default
      fs.mkdirSync(IMG_DIR, { recursive: true })
      await sharp(img).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(STATIC, it.img))
    }
  }
  /* "banner: imagen.jpg": imagen de fondo para el banner de temporada mientras dura el evento */
  const bimg = buscarImagen(fm.banner, path.dirname(f))
  if (fm.banner && !bimg) avisos.push(`${nombre}: no encuentro la imagen del banner "${fm.banner}"`)
  if (bimg) {
    it.banner = 'bitacora/' + it.id + '-banner.webp'
    if (!SIMULAR) {
      sharp = sharp || (await import('sharp')).default
      fs.mkdirSync(IMG_DIR, { recursive: true })
      await sharp(bimg).rotate().resize({ width: 1600, height: 600, fit: 'cover', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(STATIC, it.banner))
    }
  }
  if (items.some(x => x.id === it.id)) { avisos.push(`${nombre}: ya hay otra entrada con el id "${it.id}"; pon un "id:" distinto`); continue }
  items.push(it)
}
/* noticias y eventos: los mas recientes primero (la web ya separa proximos y pasados) */
items.sort((a, b) => (b.inicio || b.fecha).localeCompare(a.inicio || a.fecha))

/* banners de temporada: imagenes en bitacora-del-cielo/temporadas/ con el nombre de la temporada
   (navidad.jpg, leonidas.jpg, primavera.jpg...) = fondo del banner; <temporada>-vero.png = Vero de esa temporada
   (si tiene fondo blanco, se le quita). Ver quartz/static/temporadas.js para las claves */
const temporadas = {}
const TDIR = path.join(CARPETA, 'temporadas'), TOUT = path.join(IMG_DIR, 'temporadas')
if (fs.existsSync(TDIR)) {
  for (const e of fs.readdirSync(TDIR)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(e)) continue
    const clave = e.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    temporadas[clave] = 'bitacora/temporadas/' + clave + '.webp'
    if (SIMULAR) continue
    sharp = sharp || (await import('sharp')).default
    fs.mkdirSync(TOUT, { recursive: true })
    const src = path.join(TDIR, e), dst = path.join(TOUT, clave + '.webp')
    if (/-vero(-(es|en|fr))?$/.test(clave)) {
      /* personaje: se quita el fondo blanco que toca los bordes (relleno desde fuera, con borde suave) */
      const { data: px, info } = await sharp(src).rotate().resize({ height: 720, withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const W = info.width, H = info.height, fuera = new Uint8Array(W * H), cola = []
      const blanco = i => Math.min(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) > 228
      for (let x = 0; x < W; x++) { cola.push(x, (H - 1) * W + x) }
      for (let y = 0; y < H; y++) { cola.push(y * W, y * W + W - 1) }
      while (cola.length) {
        const i = cola.pop(); if (fuera[i] || !blanco(i)) continue
        fuera[i] = 1; const x = i % W, y = (i / W) | 0
        if (x > 0) cola.push(i - 1); if (x < W - 1) cola.push(i + 1); if (y > 0) cola.push(i - W); if (y < H - 1) cola.push(i + W)
      }
      for (let i = 0; i < W * H; i++) {
        if (fuera[i]) { px[i * 4 + 3] = 0; continue }
        const x = i % W, y = (i / W) | 0
        const junto = (x > 0 && fuera[i - 1]) || (x < W - 1 && fuera[i + 1]) || (y > 0 && fuera[i - W]) || (y < H - 1 && fuera[i + W])
        if (junto) { const m = Math.min(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]); if (m > 190) px[i * 4 + 3] = Math.round(255 * (255 - m) / 65) }
      }
      await sharp(px, { raw: { width: W, height: H, channels: 4 } }).trim().webp({ quality: 85, alphaQuality: 90 }).toFile(dst)
    } else {
      await sharp(src).rotate().resize({ width: 2400, height: 600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(dst)
    }
  }
  if (Object.keys(temporadas).length) console.log('Banners de temporada: ' + Object.keys(temporadas).join(', '))
}
const data = { v: 1, generado: new Date().toISOString(), items, temporadas }
const NOM = { evento: 'Evento ', noticia: 'Noticia', cronica: 'Crónica' }
console.log(`Entradas: ${items.length} (${items.filter(i => i.tipo === 'evento').length} eventos, ${items.filter(i => i.tipo === 'noticia').length} noticias, ${items.filter(i => i.tipo === 'cronica').length} crónicas)`)
for (const i of items) console.log(`  · ${NOM[i.tipo]}  ${i.id}  ${i.inicio || i.fecha}`)
if (avisos.length) console.log('\nAvisos:\n  - ' + avisos.join('\n  - '))
if (SIMULAR) { console.log('\n(simulación: no se ha escrito nada)'); process.exit(0) }
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n')
fs.writeFileSync(PEND_FILE, JSON.stringify(pendientes, null, 2) + '\n')
/* imagenes de entradas que ya no existen */
const usadas = new Set(); items.forEach(i => { if (i.img) usadas.add(i.img); if (i.banner) usadas.add(i.banner); (i.p || []).forEach(x => { if (x && x.img) usadas.add(x.img) }) })
Object.values(temporadas).forEach(v => usadas.add(v))
if (fs.existsSync(IMG_DIR)) for (const e of fs.readdirSync(IMG_DIR, { withFileTypes: true })) if (e.isFile() && !usadas.has('bitacora/' + e.name)) fs.unlinkSync(path.join(IMG_DIR, e.name))
if (fs.existsSync(TOUT)) for (const e of fs.readdirSync(TOUT)) if (!usadas.has('bitacora/temporadas/' + e)) fs.unlinkSync(path.join(TOUT, e))
console.log(`\nEscrito ${path.relative(ROOT, OUT)}`)
console.log(pendientes.length ? `Textos sin traducir: ${pendientes.length} -> rellena "en" y "fr" en ${path.relative(ROOT, PEND_FILE)} y ejecuta: node tools/bitacora.mjs --aplicar` : 'Todo traducido.')
