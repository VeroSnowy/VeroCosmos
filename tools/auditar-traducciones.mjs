/* Auditoria de traducciones: claves duplicadas, vacias o iguales al espanol, tipografia francesa. Uso: node tools/auditar-traducciones.mjs */
import fs from 'fs'
import { fileURLToPath } from 'url'
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const v = fs.readFileSync(ROOT + 'quartz/static/vc-i18n.js', 'utf8')
const a = v.indexOf('const DICT='), b = v.indexOf('\nconst DICTH')
const src = v.slice(a, b)
const i1 = src.indexOf('\n  en:{'), i2 = src.indexOf('\n  fr:{')
const blocks = { en: src.slice(i1, i2), fr: src.slice(i2) }
const DICT = new Function(src + ';return DICT')()
for (const [lang, blk] of Object.entries(blocks)) {
  const keys = [...blk.matchAll(/^ {4}("(?:[^"\\]|\\.)*"):/gm)].map(m => JSON.parse(m[1]))
  const cnt = new Map(); for (const k of keys) cnt.set(k, (cnt.get(k) || 0) + 1)
  const dups = [...cnt].filter(([k, n]) => n > 1)
  console.log(lang, 'claves', keys.length, 'duplicadas', dups.length)
  for (const [k, n] of dups) console.log('   dup x' + n + ':', k.slice(0, 60), '=>', JSON.stringify(DICT[lang][k]).slice(0, 60))
}
const eq = []
for (const l of ['en', 'fr']) for (const [k, t] of Object.entries(DICT[l])) if (!t || t === k) eq.push(l + ': ' + k.slice(0, 50))
console.log('vacias o iguales:', eq.length); console.log(eq.slice(0, 30).join('\n'))
console.log('Panama:', DICT.en['Panamá'], '/', DICT.fr['Panamá'])
/* tipografia francesa: dos puntos / ? ! ; sin espacio fino delante */
const frBad = Object.entries(DICT.fr).filter(([k, t]) => /[^\s\u00a0][:;?!]/.test(t.replace(/https?:\/\/\S+/g, '')) && !/\d:\d/.test(t)).slice(0, 15)
console.log('fr sin espacio antes de : ; ? !  (los corrige frTypo al mostrar):', frBad.length)
