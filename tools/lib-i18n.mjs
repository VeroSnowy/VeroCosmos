/*
 * Utilidades compartidas por las herramientas en Node:
 *  - traducir(es, lang): el mismo diccionario que la web (quartz/static/vc-i18n.js), sin navegador
 *  - vcRutas: las rutas por idioma (quartz/static/rutas.js)
 *  - vcLluvias: las lluvias de estrellas automaticas (quartz/static/lluvias.js)
 */
import fs from 'fs'
import vm from 'vm'
import { fileURLToPath } from 'url'

const STATIC = fileURLToPath(new URL('../quartz/static/', import.meta.url))
const leer = f => fs.readFileSync(STATIC + f, 'utf8')

/* diccionario: se ejecuta solo el trozo de vc-i18n.js que define DICT y las funciones de traduccion */
const src = leer('vc-i18n.js')
const trozo = src.slice(src.indexOf('const DICT='), src.indexOf('function doText('))
const ctx = { navigator: { languages: ['es'], language: 'es' }, Intl, Date, Math, localStorage: { getItem: () => null } }
const I = vm.runInNewContext('(function(){' + trozo + ';return {DICT,tr0,frTypo,setL:function(l){lang=l}}})()', ctx)
export function traducir(es, lang) {
  if (!es || lang === 'es') return es
  I.setL(lang)
  const r = I.tr0(es)
  return lang === 'fr' && r !== es ? I.frTypo(r) : r
}
/* true si el diccionario tiene esa frase traducida a ese idioma */
export const traducido = (es, lang) => lang === 'es' || traducir(es, lang) !== es
export const DICT = I.DICT

function cargar(f, nombre) {
  const c = { Intl, Date, Math, console }
  vm.runInNewContext(leer(f), c)
  return c[nombre]
}
export const vcRutas = cargar('rutas.js', 'vcRutas')
export const vcLluvias = cargar('lluvias.js', 'vcLluvias')
