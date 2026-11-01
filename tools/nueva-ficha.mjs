/*
 * Crea o actualiza una ficha completa a partir de una plantilla de texto (tools/plantilla-ficha.md), sin tocar JSON a mano.
 *
 * 1) node tools/nueva-ficha.mjs mi-ficha.md          genera la entrada de fichas.json (incluida la "Ubicacion celeste"),
 *                                                     sube la version del atlas y lista los textos que faltan por traducir
 *                                                     (tools/pendientes-traduccion.json y .md)
 * 2) (se rellenan en y fr en pendientes-traduccion.json)
 * 3) node tools/nueva-ficha.mjs --aplicar            copia esas traducciones a quartz/static/vc-i18n.js
 *
 * Opciones: --simular (no escribe nada, solo ensaya) · --reemplazar (sustituye una ficha que ya existe)
 *           --sin-version (no sube la version del atlas)
 */
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STATIC = path.join(ROOT, 'quartz', 'static')
const FICHAS = path.join(STATIC, 'fichas.json')
const I18N = path.join(STATIC, 'vc-i18n.js')
const PEND = path.join(ROOT, 'tools', 'pendientes-traduccion.json')
const PEND_MD = path.join(ROOT, 'tools', 'pendientes-traduccion.md')
const args = process.argv.slice(2)
const flag = f => args.includes(f)
const simular = flag('--simular')
const fail = msg => { console.error('\n✗ ' + msg + '\n'); process.exit(1) }

const ps1 = fs.readFileSync(path.join(ROOT, '..', 'publicar.ps1'), 'utf8').match(/\$vault\s*=\s*"([^"]+)"/)
if (!ps1) fail('No encuentro la ruta del vault en publicar.ps1')
const VAULT = ps1[1]

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const atlasActual = () => fs.readdirSync(STATIC).map(f => f.match(/^VeroCosmos_(\d+)\.(\d+)\.(\d+)\.html$/)).filter(Boolean)
  .sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[3] - b[3]).pop()[0]
const subir = (file, re) => { /* sube el ?v=N de una referencia */
  const f = path.join(STATIC, file), t = fs.readFileSync(f, 'utf8'), m = t.match(re)
  if (!m) return
  fs.writeFileSync(f, t.replace(re, (_, p, n) => p + (+n + 1)))
}

/* ---------------- modo --aplicar: pasar las traducciones a vc-i18n.js ---------------- */
if (flag('--aplicar')) {
  if (!fs.existsSync(PEND)) fail('No hay ' + PEND + '. Primero genera la ficha.')
  const pend = JSON.parse(fs.readFileSync(PEND, 'utf8'))
  const falta = pend.filter(p => !p.en || !p.fr)
  if (falta.length) fail('Faltan traducciones (en/fr) en:\n' + falta.map(p => '  ' + p.n + '. ' + p.es).join('\n'))
  let v = fs.readFileSync(I18N, 'utf8')
  const D = new Function(v.slice(v.indexOf('const DICT='), v.indexOf('\nconst DICTH')) + ';return DICT')()
  const nuevas = pend.filter(p => !(p.es in D.en) && !(p.es in D.fr))
  const i1 = v.indexOf('\n  },\n  fr:{'), i2 = v.indexOf('\n  }\n};')
  if (i1 < 0 || i2 < 0) fail('No reconozco la estructura de vc-i18n.js')
  /* la coma inicial solo si el diccionario no acaba ya en coma */
  const bloque = (l, antes) => nuevas.map((p, i) => (i || !/,\s*$/.test(antes) ? ',' : '') + '\n    ' + JSON.stringify(p.es) + ':' + JSON.stringify(p[l])).join('')
  v = v.slice(0, i1) + bloque('en', v.slice(0, i1)) + v.slice(i1, i2) + bloque('fr', v.slice(0, i2)) + v.slice(i2)
  new Function(v)
  console.log(`Traducciones añadidas: ${nuevas.length} (ya existían: ${pend.length - nuevas.length})`)
  if (!simular && nuevas.length) {
    fs.writeFileSync(I18N, v)
    const atlas = atlasActual()
    for (const f of [atlas, 'ficha.html', 'quienes-somos.html']) subir(f, /(vc-i18n\.js\?v=)(\d+)/)
    console.log('Subido ?v= de vc-i18n.js en ' + atlas + ', ficha.html y quienes-somos.html')
    fs.rmSync(PEND, { force: true }); fs.rmSync(PEND_MD, { force: true })
  }
  process.exit(0)
}

/* ---------------- modo normal: leer la plantilla ---------------- */
const archivo = args.find(a => !a.startsWith('--'))
if (!archivo) fail('Uso: node tools/nueva-ficha.mjs mi-ficha.md   (copia antes tools/plantilla-ficha.md y rellénala)')
const texto = fs.readFileSync(archivo, 'utf8').replace(/^﻿/, '').split(/\r?\n/)
const SECCIONES = ['datos', 'etiquetas', 'curiosidades', 'otros objetos']
const campos = {}, sec = {}
let actual = null
for (const raw of texto) {
  const l = raw.trim()
  if (!l || l.startsWith('#') || l.startsWith('>')) continue
  const m = l.match(/^([^:|\-][^:]*):\s*(.*)$/)
  if (m && !l.startsWith('- ')) {
    const k = norm(m[1])
    if (SECCIONES.includes(k)) { actual = k; sec[k] = []; continue }
    campos[k] = m[2].trim(); actual = null; continue
  }
  if (l.startsWith('- ') && actual) sec[actual].push(l.slice(2).trim())
}
const req = (k, n) => { if (!campos[k]) fail(`Falta el campo "${n}".`); return campos[k] }
const nota = req('nota', 'Nota'), nombre = req('nombre', 'Nombre'), modeloEs = req('modelo', 'Modelo')
const consEs = req('constelacion', 'Constelación'), tipo = req('tipo', 'Tipo')
const MODELOS = { nebulosa: 'nebula', nebula: 'nebula', galaxia: 'galaxy', galaxy: 'galaxy', globular: 'globular', 'cumulo globular': 'globular' }
const model = MODELOS[norm(modeloEs)]
if (!model) fail(`Modelo "${modeloEs}" no válido. Usa: nebulosa, galaxia o globular.`)

/* la nota debe existir en el vault; la clave de fichas.json es su ruta en minusculas con guiones */
const rutaNota = nota.replace(/\\/g, '/').replace(/\.md$/i, '')
const slugDe = r => r.toLowerCase().replace(/\s/g, '-').replace(/[?#]/g, '')
const existe = r => fs.existsSync(path.join(VAULT, r + '.md'))
if (!existe(rutaNota)) fail(`No encuentro la nota "${rutaNota}.md" en el vault (${VAULT}).\nCrea antes la nota (con su foto) y pon aquí su ruta, p. ej. Catálogos/messier/descripciones/M_13/M13 - Cúmulo de Hércules`)
const clave = slugDe(rutaNota)

/* datos */
const datos = (sec['datos'] || []).map(x => { const i = x.indexOf(':'); return i < 0 ? fail(`En "Datos" falta ":" en: ${x}`) : [x.slice(0, i).trim(), x.slice(i + 1).trim()] })
const dato = n => (datos.find(d => norm(d[0]) === norm(n)) || [])[1]
const raT = dato('Ascensión recta'), deT = dato('Declinación')
if (!raT || !deT) fail('En "Datos" faltan "Ascensión recta" y/o "Declinación" (se usan para la ubicación celeste).')
const mRa = raT.match(/(\d+)\s*h\s*(\d+)\s*m\s*([\d.,]+)?/), mDe = deT.match(/^\s*([+\-−–]?)\s*(\d+)\s*°\s*(\d+)?\s*[′']?\s*([\d.,]+)?/)
if (!mRa) fail(`No entiendo la ascensión recta "${raT}". Formato: 5h 35m 17s`)
if (!mDe) fail(`No entiendo la declinación "${deT}". Formato: −5° 23′ 28″`)
const num = x => parseFloat(String(x || 0).replace(',', '.'))
const ra = +(15 * (num(mRa[1]) + num(mRa[2]) / 60 + num(mRa[3]) / 3600)).toFixed(2)
const dec = +((/[−–-]/.test(mDe[1]) ? -1 : 1) * (num(mDe[2]) + num(mDe[3]) / 60 + num(mDe[4]) / 3600)).toFixed(2)

/* ubicacion celeste desde tools/data/cielo.json */
const cieloF = path.join(ROOT, 'tools', 'data', 'cielo.json')
if (!fs.existsSync(cieloF)) fail('Falta tools/data/cielo.json. Ejecuta: node tools/construir-cielo.mjs')
const cielo = JSON.parse(fs.readFileSync(cieloF, 'utf8'))
const con = Object.values(cielo).find(c => norm(c.es) === norm(consEs))
if (!con) fail(`No conozco la constelación "${consEs}". Prueba con: ${Object.values(cielo).map(c => c.es).filter(e => norm(e)[0] === norm(consEs)[0]).join(', ') || 'su nombre en español, p. ej. Orión'}`)

const curiosidades = sec['curiosidades'] || [], etiquetas = sec['etiquetas'] || []
if (curiosidades.length < 3) fail('Pon al menos 3 curiosidades.')
if (!etiquetas.length) fail('Pon al menos una etiqueta (p. ej. el tipo de objeto y "Constelación de ...").')
const otros = (sec['otros objetos'] || []).map(x => {
  const [n, d, s] = x.split('|').map(p => p.trim())
  if (!n || !d) fail(`En "Otros objetos" cada línea es: Nombre | descripción | (nota opcional). Revisa: ${x}`)
  const o = { n, d }
  if (s) { const r = s.replace(/\\/g, '/').replace(/\.md$/i, ''); if (!existe(r)) fail(`La nota "${r}" de "${n}" no existe en el vault.`); o.s = slugDe(r) }
  return o
})

const entrada = { name: nombre, model }
if (campos['paleta']) entrada.palette = campos['paleta']
entrada.facts = [['Constelación', consEs], ['Tipo', tipo], ...datos]
entrada.cats = etiquetas
entrada.trivia = curiosidades
entrada.others = otros
entrada.sky = { ra, dec, stars: con.stars, segs: con.segs }

/* ---------------- fichas.json ---------------- */
const fichas = JSON.parse(fs.readFileSync(FICHAS, 'utf8'))
if (fichas[clave] && !flag('--reemplazar')) fail(`Ya existe una ficha para ${clave}. Usa --reemplazar para sustituirla.`)
fichas[clave] = entrada

/* ---------------- textos sin traducir ---------------- */
const v = fs.readFileSync(I18N, 'utf8')
const D = new Function(v.slice(v.indexOf('const DICT='), v.indexOf('\nconst DICTH')) + ';return DICT')()
const sinTraducir = s => {
  if (s in D.en && s in D.fr) return false
  if (/^[\d\s.,+−–\-hms°′″±×'"]+$/.test(s)) return false /* coordenadas y cifras */
  if (/^[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúñ'’]*$/.test(s)) return false /* nombre propio de una palabra */
  if (/^(M|NGC|IC|B|Sh2)[\s-]?\d+$/i.test(s)) return false /* codigos de catalogo */
  return true
}
const textos = [entrada.name, ...entrada.facts.flat(), ...entrada.cats, ...entrada.trivia, ...entrada.others.flatMap(o => [o.n, o.d])]
const pendientes = [...new Set(textos)].filter(sinTraducir).map((es, i) => ({ n: i + 1, es, en: '', fr: '' }))

console.log(`${simular ? '[SIMULACIÓN] ' : ''}Ficha: ${nombre}`)
console.log(`  clave:     ${clave}`)
console.log(`  modelo:    ${model}${entrada.palette ? ' · paleta ' + entrada.palette : ''}`)
console.log(`  cielo:     AR ${ra}° · Dec ${dec}° · ${con.es} (${con.stars.length} estrellas, ${con.segs.length} trazos)`)
console.log(`  textos:    ${textos.length} (${pendientes.length} sin traducir)`)
if (simular) { console.log(JSON.stringify(entrada, null, 1).slice(0, 1200)); process.exit(0) }

fs.writeFileSync(FICHAS, JSON.stringify(fichas, null, 1) + '\n')
const atlasAntes = atlasActual()
if (!flag('--sin-version')) {
  console.log('\nSubiendo la versión del atlas...')
  console.log(execFileSync('node', [path.join(ROOT, 'tools', 'nueva-version.mjs')], { encoding: 'utf8' }).split('\n').filter(l => /Version|Quedan|borradas/.test(l)).join('\n'))
}
const atlas = atlasActual()
for (const f of [atlas, 'ficha.html']) subir(f, /(fichas\.json\?v=)(\d+)/)
console.log(`Subido ?v= de fichas.json en ${atlas} y ficha.html`)

if (pendientes.length) {
  fs.writeFileSync(PEND, JSON.stringify(pendientes, null, 1) + '\n')
  fs.writeFileSync(PEND_MD, '# Textos sin traducir\n\nRellena "en" y "fr" en pendientes-traduccion.json (o pídele a Claude que lo haga) y ejecuta:\n`node tools/nueva-ficha.mjs --aplicar`\n\n' + pendientes.map(p => `${p.n}. ${p.es}`).join('\n') + '\n')
  console.log(`\n${pendientes.length} textos sin traducir → tools/pendientes-traduccion.md / .json`)
  pendientes.forEach(p => console.log(`  ${p.n}. ${p.es}`))
} else console.log('\nNo hay textos sin traducir.')
console.log('\nSiguiente paso: añade la nota al catálogo en Obsidian si no está, prueba en local y publica.')
