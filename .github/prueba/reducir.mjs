// reduce una captura usando el propio navegador: node reducir.mjs entrada.jpg salida.jpg ancho
import { chromium } from 'playwright'
import fs from 'fs'
const [inp, out, w] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: 100 } })
await p.setContent(`<body style="margin:0"><img id="i" style="width:${w}px;display:block" src="data:image/jpeg;base64,${fs.readFileSync(inp).toString('base64')}"></body>`)
await p.waitForFunction(() => document.getElementById('i').complete)
await (await p.$('#i')).screenshot({ path: out, quality: 40 })
await b.close()
