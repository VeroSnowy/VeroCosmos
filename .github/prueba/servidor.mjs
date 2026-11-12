// Servidor estático mínimo que imita GitHub Pages: /ruta -> ruta.html o ruta/index.html
import http from 'http'; import fs from 'fs'; import path from 'path'
const [dir, port] = [process.argv[2], +process.argv[3]]
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const cands = [p, p + '.html', path.join(p, 'index.html')].map(c => path.join(dir, c))
  const f = cands.find(c => fs.existsSync(c) && fs.statSync(c).isFile())
  if (!f) { res.writeHead(404); return res.end('404') }
  res.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
}).listen(port)
