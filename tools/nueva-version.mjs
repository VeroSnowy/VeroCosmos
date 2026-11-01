/*
 * Sube la version del atlas: copia VeroCosmos_<actual>.html a <nueva>, apunta a ella las 4 paginas del vault y
 * quienes-somos.html, y borra las versiones antiguas (se conservan las 2 ultimas y la 0.2.24, que lleva las cartillas).
 *
 * Uso:  node tools/nueva-version.mjs            (siguiente version de parche: 0.3.8 -> 0.3.9)
 *       node tools/nueva-version.mjs 0.4.0      (version concreta)
 *       node tools/nueva-version.mjs --simular  (no cambia nada, solo cuenta lo que haria)
 * Despues se edita el archivo NUEVO (nunca el anterior) y se publica con publicar.ps1.
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STATIC = path.join(ROOT, 'quartz', 'static')
const PAGINAS = ['index', 'atlas-astrofotografico', 'guia-astronomica', 'quienes-somos']
const CONSERVAR = ['0.2.24']
const simular = process.argv.includes('--simular')
const pedida = process.argv.slice(2).find(a => /^\d+\.\d+\.\d+$/.test(a))

/* el vault se lee de publicar.ps1 para no repetir la ruta */
const ps1 = path.join(ROOT, '..', 'publicar.ps1')
const m = fs.existsSync(ps1) && fs.readFileSync(ps1, 'utf8').match(/\$vault\s*=\s*"([^"]+)"/)
if (!m) throw new Error('No encuentro la ruta del vault en ' + ps1)
const VAULT = m[1]

const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0 }
const versiones = fs.readdirSync(STATIC).map(f => f.match(/^VeroCosmos_(\d+\.\d+\.\d+)\.html$/)).filter(Boolean).map(r => r[1]).sort(cmp)

const indice = fs.readFileSync(path.join(VAULT, 'index.md'), 'utf8')
const actual = (indice.match(/VeroCosmos_(\d+\.\d+\.\d+)\.html/) || [])[1]
if (!actual) throw new Error('index.md no apunta a ningun VeroCosmos_X.Y.Z.html')
const [a, b, c] = actual.split('.').map(Number)
const nueva = pedida || `${a}.${b}.${c + 1}`
if (versiones.includes(nueva)) throw new Error('La version ' + nueva + ' ya existe')
if (cmp(nueva, actual) <= 0) throw new Error('La nueva version debe ser mayor que ' + actual)

console.log(`Version actual: ${actual}  ->  nueva: ${nueva}${simular ? '  (SIMULACION)' : ''}`)
const destinos = [...PAGINAS.map(p => path.join(VAULT, p + '.md')), path.join(STATIC, 'quienes-somos.html')]
for (const f of destinos) if (!fs.readFileSync(f, 'utf8').includes(`VeroCosmos_${actual}.html`)) throw new Error('No apunta a ' + actual + ': ' + f)

if (!simular) {
  fs.copyFileSync(path.join(STATIC, `VeroCosmos_${actual}.html`), path.join(STATIC, `VeroCosmos_${nueva}.html`))
  for (const f of destinos) fs.writeFileSync(f, fs.readFileSync(f, 'utf8').split(`VeroCosmos_${actual}.html`).join(`VeroCosmos_${nueva}.html`))
}
console.log('Paginas apuntadas a la nueva: ' + destinos.length)

/* se conservan las 2 ultimas (la nueva y la actual) y las de CONSERVAR */
const todas = [...versiones, nueva].sort(cmp)
const borrar = todas.filter(v => !todas.slice(-2).includes(v) && !CONSERVAR.includes(v))
for (const v of borrar) {
  const f = path.join(STATIC, `VeroCosmos_${v}.html`)
  if (!simular) { try { execSync(`git rm -q -f "${f}"`, { cwd: ROOT, stdio: 'ignore' }) } catch { fs.rmSync(f, { force: true }) } }
}
console.log(`Versiones borradas (${borrar.length}): ${borrar.join(', ') || 'ninguna'}`)
console.log(`Quedan: ${todas.filter(v => !borrar.includes(v)).join(', ')}`)
console.log(`\nSiguiente paso: edita quartz/static/VeroCosmos_${nueva}.html, prueba en local y publica con publicar.ps1.`)
