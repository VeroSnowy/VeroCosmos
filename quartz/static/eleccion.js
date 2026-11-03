/* Eleccion del lugar interactiva: un telescopio en primer plano junto a un camino que baja al valle. Tres controles:
   acceso (publico / privado: valla, senal de prohibido y una silueta con linterna en el camino), luces parasitas (foco de una
   granja y torre de alta tension con balizas que parpadean) y terreno (roca firme / barro: el tripode se hunde, se ladea y la
   imagen del ocular vibra). Si todo esta bien aparece el "punto optimo" en verde.
   window.vcEleccion.mount(host) -> { destroy() } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var clamp = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)) }
  var lerp = function (a, b, t) { return a + (b - a) * t }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function hash1(i) { var h = Math.imul(i | 0, 374761393) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
  var GREEN = '#7fe0a6', RED = '#ff5d6c'

  var CSS = '.el-c{flex:1;min-width:0;height:100%;display:block;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}' +
    '.el-s{flex:none;width:clamp(84px,11vw,112px);box-sizing:border-box;display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:10px 6px 12px;border-left:1px solid #343d63;background:linear-gradient(180deg,#0e1430e6,#0a0f26e6);user-select:none;-webkit-user-select:none}' +
    '.el-g{flex:none;display:flex;flex-direction:column;align-items:center;gap:4px}' +
    '.el-ic{width:20px;height:20px;color:#b9c9ff}.el-ic svg{width:100%;height:100%;display:block}' +
    '.el-h{font:400 9.5px/1.15 ' + SERIF + ';color:#8f98c0;text-align:center;overflow-wrap:anywhere}' +
    '.el-b{width:100%;box-sizing:border-box;padding:5px 2px;border:1px solid #343d63;border-radius:8px;background:#0b1025;color:#b9c9ff;font:400 10.5px/1.1 ' + SERIF + ';cursor:pointer;transition:background .2s,border-color .2s,color .2s}' +
    '.el-b:hover,.el-b:focus-visible{border-color:#8ab4ff;outline:none}' +
    '.el-b[aria-pressed="true"]{background:#5b6bb4;border-color:#b9c9ff;color:#fff}' +
    '.el-l{flex:1;min-height:60px}' +
    '.el-tr{position:relative;flex:1;min-height:0;width:100%;touch-action:none;cursor:pointer;outline:none}' +
    '.el-tr::before{content:"";position:absolute;top:12px;bottom:12px;left:50%;width:1px;background:#343d63}' +
    '.el-f{position:absolute;bottom:12px;left:50%;width:3px;margin-left:-1px;border-radius:2px;background:linear-gradient(0deg,#5b6bb4,#f8d874)}' +
    '.el-k{position:absolute;left:50%;width:22px;height:22px;margin:-11px 0 0 -11px;box-sizing:border-box;border-radius:50%;border:1.5px solid #f8d874;background:#0b1025;box-shadow:0 0 12px rgba(248,216,116,.5);transition:transform .2s;pointer-events:none}' +
    '.el-k::after{content:"";position:absolute;inset:5px;border-radius:50%;background:#f8d874}' +
    '.el-tr:hover .el-k,.el-tr:focus-visible .el-k,.el-tr.drag .el-k{transform:scale(1.15)}' +
    '.el-n{font:400 14px/1 ' + SERIF + ';color:#f5f7ff;text-align:center}'
  var IC_GATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V6M20 20V6M4 9h16M4 15h16M9 9v6M15 9v6"/></svg>'
  var IC_BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.8c.6.5 1 1.2 1 2V16h5v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" stroke="#f8d874"/></svg>'
  var IC_ROCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19l4-8 4 3 3-6 7 11z"/><path d="M2 21h20"/></svg>'

  var GLOW = null
  function glowSprite() {
    if (GLOW) return GLOW
    var c = document.createElement('canvas'); c.width = c.height = 64
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.2, 'rgba(255,230,170,.45)'); g.addColorStop(.55, 'rgba(240,220,180,.1)'); g.addColorStop(1, 'rgba(240,220,180,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); GLOW = c; return c
  }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c }

  function mount(host) {
    if (!document.getElementById('el-css')) { var st = document.createElement('style'); st.id = 'el-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var cv = document.createElement('canvas'); cv.className = 'el-c'; cv.setAttribute('role', 'img')
    var side = document.createElement('div'); side.className = 'el-s'
    host.append(cv, side)
    var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    /* estado: acceso publico, sin luces parasitas, suelo firme */
    var st2 = { priv: false, soft: false, light: 0 }, cur = { priv: 0, soft: 0, light: 0 }
    var groups = []
    function toggle(icon, keyName, opts, key) {
      var g = document.createElement('div'); g.className = 'el-g'
      g.innerHTML = '<div class="el-ic">' + icon + '</div><div class="el-h"></div>'
      var bs = opts.map(function (o, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'el-b'; b.addEventListener('click', function () { st2[key] = !!i; sync() }); g.append(b); return b })
      side.append(g)
      groups.push({ h: g.querySelector('.el-h'), name: keyName, bs: bs, opts: opts, key: key })
    }
    toggle(IC_GATE, 'Acceso', ['Público', 'Privado'], 'priv')
    toggle(IC_ROCK, 'Terreno', ['Firme', 'Blando'], 'soft')
    /* deslizador de luces parasitas */
    var lg = document.createElement('div'); lg.className = 'el-g el-l'
    lg.innerHTML = '<div class="el-ic">' + IC_BULB + '</div><div class="el-h"></div><div class="el-n"></div><div class="el-tr" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"><div class="el-f"></div><div class="el-k"></div></div>'
    side.append(lg)
    var tr = lg.querySelector('.el-tr'), knob = lg.querySelector('.el-k'), fill = lg.querySelector('.el-f'), ln = lg.querySelector('.el-n'), lh = lg.querySelector('.el-h'), drag = false
    function placeL() { var span = Math.max(1, tr.clientHeight - 24); knob.style.top = (12 + (1 - st2.light) * span) + 'px'; fill.style.height = (st2.light * span) + 'px'; ln.textContent = Math.round(st2.light * 100); tr.setAttribute('aria-valuenow', Math.round(st2.light * 100)) }
    function setL(p) { st2.light = clamp(p); placeL() }
    var fromY = function (y) { var r = tr.getBoundingClientRect(); setL(1 - (y - r.top - 12) / Math.max(1, r.height - 24)) }
    tr.addEventListener('pointerdown', function (e) { drag = true; tr.classList.add('drag'); try { tr.setPointerCapture(e.pointerId) } catch (x) { } fromY(e.clientY) })
    tr.addEventListener('pointermove', function (e) { if (drag) fromY(e.clientY) })
    var stop = function () { drag = false; tr.classList.remove('drag') }
    tr.addEventListener('pointerup', stop); tr.addEventListener('pointercancel', stop)
    tr.addEventListener('keydown', function (e) { var d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? .1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -.1 : 0; if (!d) return; e.preventDefault(); setL(st2.light + d) })
    function sync() { groups.forEach(function (g) { g.bs.forEach(function (b, i) { b.setAttribute('aria-pressed', String(!!i === st2[g.key])) }) }) }
    var LBL = {}
    function texts() {
      groups.forEach(function (g) { g.h.textContent = T(g.name); g.bs.forEach(function (b, i) { b.textContent = T(g.opts[i]) }) })
      lh.textContent = T('Luces parásitas'); tr.setAttribute('aria-label', T('Luces parásitas')); cv.setAttribute('aria-label', T('Elección del lugar'))
      LBL = { acc: T('Acceso'), luz: T('Luces parásitas'), ter: T('Terreno'), libre: T('Libre y legal'), restr: T('Restringido'), ninguna: T('Ninguna'), leves: T('Leves'), fuertes: T('Fuertes'), firme: T('Firme'), blando: T('Blando'), opt: T('Punto óptimo') }
    }
    sync(); texts()

    /* ---------- escena fija ---------- */
    var W = 0, H = 0, K = 0, dpr = 1, ctx = cv.getContext('2d'), raf = 0, dead = false, S = null, lastDraw = 0
    function build() {
      var r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); K = Math.min(H, W * 1.25); dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); placeL()
      var R = rng(11), narrow = W < 420, yH = H - K * .42, yG = H - K * .17, s = { yH: yH, yG: yG, narrow: narrow }
      s.stars = []; for (var i = 0, n = Math.round(W * yH / 380); i < n; i++) { var mg = Math.pow(R(), 3); s.stars.push({ x: R() * W, y: Math.pow(R(), 1.1) * yH, r: .35 + mg * 1.4, a: .3 + mg * .7, ph: R() * 6.28 }) }
      /* paisaje fijo: montes lejanos, valle y ladera cercana con el camino */
      var land = mk(cv.width, cv.height), g = land.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineJoin = 'round'
      /* sombra de contacto: todo lo que esta en el suelo lleva una, asi nada parece flotar */
      var shadow = function (x2, y2, w2, a2) { g.fillStyle = 'rgba(2,3,10,' + (a2 || .55) + ')'; g.beginPath(); g.ellipse(x2, y2, w2, w2 * .22, 0, 0, 6.283); g.fill() }
      var depth = function (y2) { return clamp((y2 - yH) / (H - yH)) }
      /* dos cordilleras: la lejana mas clara (perspectiva atmosferica) y otra mas cercana con curvas de nivel y arboles */
      var far2 = function (x) { return yH - K * (.12 + .06 * Math.sin(x / W * 3 + 2.4) + .03 * Math.sin(x / W * 9 + 1)) }
      var far = function (x) { return yH - K * (.06 + .04 * Math.sin(x / W * 4 + 1.2) + .025 * Math.sin(x / W * 11)) }
      g.beginPath(); g.moveTo(0, yH + 2); for (var x = 0; x <= W + 2; x += 3) g.lineTo(x, far2(x)); g.lineTo(W + 2, yH + 2); g.closePath(); g.fillStyle = '#111a3d'; g.fill(); g.strokeStyle = 'rgba(110,126,204,.35)'; g.lineWidth = .9; g.stroke()
      g.beginPath(); g.moveTo(0, yH + 2); for (x = 0; x <= W + 2; x += 3) g.lineTo(x, far(x)); g.lineTo(W + 2, yH + 2); g.closePath(); g.fillStyle = '#0c1331'; g.fill(); g.strokeStyle = 'rgba(138,160,230,.6)'; g.lineWidth = 1; g.stroke()
      g.save(); g.clip(); for (var c0 = 1; c0 < 4; c0++) { g.strokeStyle = 'rgba(91,107,180,' + (.3 - c0 * .06) + ')'; g.lineWidth = .7; g.beginPath(); for (x = 0; x <= W + 2; x += 4) { var yc = lerp(far(x), yH, c0 / 4) + Math.sin(x * .04 + c0) * 1.2; x ? g.lineTo(x, yc) : g.moveTo(x, yc) } g.stroke() } g.restore()
      /* bosques del fondo: pinos con pisos dentados y copas redondas sobre las crestas, mas tenues cuanto mas lejos */
      var miniPine = function (x2, y2, h, fill, line) {
        var w = h * .46
        g.strokeStyle = line; g.lineWidth = .5; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2, y2 - h * .2); g.stroke()
        for (var i8 = 0; i8 < 3; i8++) {
          var q = i8 / 3, ty = y2 - h + h * q * .7, bw = w * (.35 + q * .65) / 2, by = ty + h * .42
          g.beginPath(); g.moveTo(x2, ty); g.lineTo(x2 + bw * .55, ty + (by - ty) * .6); g.lineTo(x2 + bw * .38, ty + (by - ty) * .62); g.lineTo(x2 + bw, by); g.lineTo(x2 - bw, by); g.lineTo(x2 - bw * .38, ty + (by - ty) * .62); g.lineTo(x2 - bw * .55, ty + (by - ty) * .6); g.closePath()
          g.fillStyle = fill; g.fill(); g.strokeStyle = line; g.stroke()
        }
      }
      var miniLeafy = function (x2, y2, h, fill, line) {
        var r2 = h * .32
        g.strokeStyle = line; g.lineWidth = .5; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2, y2 - h * .4); g.stroke()
        ;[[0, -.62, 1], [-.55, -.48, .7], [.55, -.5, .68]].forEach(function (b6) { g.fillStyle = fill; g.beginPath(); g.arc(x2 + b6[0] * r2, y2 + b6[1] * h, r2 * b6[2], 0, 6.283); g.fill(); g.strokeStyle = line; g.stroke() })
      }
      /* cordillera lejana: una fila tenue */
      for (var x8 = 2; x8 < W; x8 += 2 + R() * 3.5) { if (R() < .3) continue; var y8 = far2(x8) + 1.5 + R() * 2, h8 = K * (.008 + R() * .009); (R() < .2 ? miniLeafy : miniPine)(x8, y8, h8, '#111a3d', 'rgba(110,126,204,.28)') }
      /* monte cercano: dos filas densas en la cresta y masas de bosque bajando por la ladera */
      for (var row = 0; row < 2; row++) for (var x7 = 1; x7 < W; x7 += 2.2 + R() * 3.2) {
        if (R() < .18) continue
        var y7 = far(x7) + 1 + row * K * (.008 + R() * .006), h7 = K * (.011 + R() * .012) * (1 + row * .15)
        ;(R() < .25 ? miniLeafy : miniPine)(x7, y7, h7, row ? '#0b1230' : '#0d1535', 'rgba(110,126,204,' + (row ? .5 : .42) + ')')
      }
      for (var cl = 0; cl < 5; cl++) {
        var ccx = R() * W, cn = 10 + Math.floor(R() * 12)
        for (var ci = 0; ci < cn; ci++) {
          var xx9 = ccx + (R() - .5) * W * .12, top9 = far(xx9), y9 = lerp(top9 + K * .015, yH - 1, Math.pow(R(), .8)), h9 = K * (.012 + R() * .012)
          if (y9 > yH - 1) continue
          ;(R() < .35 ? miniLeafy : miniPine)(xx9, y9, h9, '#0b1230', 'rgba(110,126,204,.55)')
        }
      }
      /* valle: suelo con degradado y surcos en perspectiva */
      var vg = g.createLinearGradient(0, yH, 0, H); vg.addColorStop(0, '#0c122b'); vg.addColorStop(1, '#05070f'); g.fillStyle = vg; g.fillRect(0, yH, W, H - yH)
      g.strokeStyle = 'rgba(120,136,212,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, yH); g.lineTo(W, yH); g.stroke()
      for (var c = 1; c < 7; c++) { var yy = yH + (H - yH) * Math.pow(c / 7, 1.7); g.strokeStyle = 'rgba(79,92,156,' + (.4 - c * .045) + ')'; g.lineWidth = .8; g.beginPath(); for (x = 0; x <= W; x += 4) { var y4 = yy + Math.sin(x * .025 + c * 1.7) * 1.6; x ? g.lineTo(x, y4) : g.moveTo(x, y4) } g.stroke() }
      /* campos de cultivo junto a la granja: franjas que convergen hacia el horizonte */
      var farmX = W * (narrow ? .33 : .29), fy0 = yH + K * .012, fy1 = yH + K * .09
      g.save(); g.beginPath(); g.moveTo(W * .02, fy1); g.lineTo(farmX - W * .04, fy1); g.lineTo(farmX - W * .02, fy0); g.lineTo(W * .06, fy0); g.closePath(); g.fillStyle = 'rgba(120,130,100,.08)'; g.fill(); g.clip()
      g.strokeStyle = 'rgba(170,175,140,.3)'; g.lineWidth = .7; g.beginPath(); for (var fl = 0; fl < 14; fl++) { var fxa = lerp(W * .02, farmX - W * .04, fl / 13), fxb = lerp(W * .06, farmX - W * .02, fl / 13); g.moveTo(fxa, fy1); g.lineTo(fxb, fy0) } g.stroke(); g.restore()
      /* camino de tierra: sale por abajo a la derecha y serpentea hasta la granja, con piedras en los bordes */
      s.path = function (t) { var e = Math.pow(t, .7); return { x: lerp(W * .66, farmX + W * .03, e) + Math.sin(e * Math.PI * 1.6) * W * .09 * (1 - e), y: lerp(H + 4, yH + K * .03, Math.pow(t, .8)), w: lerp(W * .09, W * .005, Math.pow(t, .5)) } }
      g.beginPath(); for (var t = 0; t <= 1.0001; t += .02) { var p = s.path(t); t ? g.lineTo(p.x - p.w, p.y) : g.moveTo(p.x - p.w, p.y) } for (t = 1; t >= -.0001; t -= .02) { var p2 = s.path(t); g.lineTo(p2.x + p2.w, p2.y) } g.closePath()
      var pg = g.createLinearGradient(0, yH, 0, H); pg.addColorStop(0, 'rgba(150,138,115,.12)'); pg.addColorStop(1, 'rgba(150,138,115,.26)'); g.fillStyle = pg; g.fill(); g.strokeStyle = 'rgba(200,190,165,.5)'; g.lineWidth = .9; g.stroke()
      /* rodadas y piedras */
      ;[-.45, .45].forEach(function (o) { g.strokeStyle = 'rgba(30,26,22,.45)'; g.lineWidth = 1.2; g.beginPath(); for (var t2 = 0; t2 <= .95; t2 += .02) { var q = s.path(t2); t2 ? g.lineTo(q.x + o * q.w, q.y) : g.moveTo(q.x + o * q.w, q.y) } g.stroke() })
      for (var st = 0; st < 60; st++) { var tt = Math.pow(R(), 1.4) * .9, q2 = s.path(tt), side2 = R() < .5 ? -1 : 1, rs = (1.2 + R() * 2.2) * (1 - tt * .8); var sx2 = q2.x + side2 * q2.w * (1 + R() * .25), sy2 = q2.y + (R() - .5) * 3; g.fillStyle = '#151c3a'; g.strokeStyle = 'rgba(170,180,220,.5)'; g.lineWidth = .6; g.beginPath(); g.ellipse(sx2, sy2, rs * 1.3, rs * .8, 0, 0, 6.283); g.fill(); g.stroke() }
      /* hierba y matojos por todo el valle (mas grandes cuanto mas cerca) */
      for (var gq = 0; gq < 260; gq++) {
        var gx = R() * W, gyy = yH + Math.pow(R(), .8) * (H - yH), d = depth(gyy), pp = s.path(clamp(1 - d)); if (Math.abs(gx - pp.x) < pp.w * 1.15) continue
        var gl = 2 + d * 9; g.strokeStyle = 'rgba(110,126,204,' + (.18 + d * .35) + ')'; g.lineWidth = .5 + d * .6; g.beginPath()
        for (var bl = 0; bl < 3; bl++) { var lean = (R() - .5) * gl * .6; g.moveTo(gx + bl * 1.2, gyy); g.quadraticCurveTo(gx + bl * 1.2 + lean * .3, gyy - gl * .6, gx + bl * 1.2 + lean, gyy - gl) }
        g.stroke()
      }
      /* pinos dispersos, cada uno con su sombra y su tronco hasta el suelo */
      var pine = function (x2, y2, h) {
        shadow(x2, y2 + 1, h * .32, .5)
        g.strokeStyle = 'rgba(150,170,235,.55)'; g.lineWidth = Math.max(.6, h * .045); g.beginPath(); g.moveTo(x2, y2 + .5); g.lineTo(x2, y2 - h * .25); g.stroke()
        var w = h * .5; for (var i2 = 0; i2 < 4; i2++) { var q = i2 / 4, ty = y2 - h + h * q * .72, bw = w * (.32 + q * .7) / 2, by = ty + h * .4, m = by - ty; g.beginPath(); g.moveTo(x2, ty); g.lineTo(x2 + bw * .55, ty + m * .6); g.lineTo(x2 + bw * .4, ty + m * .62); g.lineTo(x2 + bw, by); g.quadraticCurveTo(x2, by - h * .06, x2 - bw, by); g.lineTo(x2 - bw * .4, ty + m * .62); g.lineTo(x2 - bw * .55, ty + m * .6); g.closePath(); g.fillStyle = i2 % 2 ? '#0d1532' : '#101a3c'; g.fill(); g.strokeStyle = 'rgba(110,126,204,.75)'; g.lineWidth = .7; g.stroke() }
      }
      /* arbol de copa redonda (para mezclar con los pinos en los bosques) */
      var leafy = function (x2, y2, h) {
        shadow(x2, y2 + 1, h * .38, .5)
        var r2 = h * .3
        g.strokeStyle = 'rgba(150,170,235,.55)'; g.lineWidth = Math.max(.6, h * .05); g.beginPath(); g.moveTo(x2, y2 + .5); g.lineTo(x2, y2 - h * .5); g.moveTo(x2, y2 - h * .36); g.lineTo(x2 + r2 * .5, y2 - h * .56); g.stroke()
        ;[[0, -.66, 1], [-.6, -.52, .72], [.6, -.54, .7], [-.22, -.88, .62], [.28, -.86, .58]].forEach(function (b5, i5) {
          g.fillStyle = i5 % 2 ? '#0d1532' : '#101a3c'; g.beginPath(); g.arc(x2 + b5[0] * r2, y2 + b5[1] * h, r2 * b5[2], 0, 6.283); g.fill()
          g.strokeStyle = 'rgba(110,126,204,.7)'; g.lineWidth = .7; g.stroke()
        })
      }
      /* bosques: muchos arboles en una zona, ordenados de atras hacia delante para que se tapen bien entre si */
      var trees = []
      var forest = function (cx, cy, rx, ry, n, size, leafyPart) {
        for (var k5 = 0; k5 < n * 3 && n > 0; k5++) {
          var a5 = R() * 6.283, rr5 = Math.sqrt(R()), px5 = cx + Math.cos(a5) * rx * rr5, py5 = cy + Math.sin(a5) * ry * rr5
          if (py5 < yH + 1 || py5 > H) continue
          var pp5 = s.path(clamp(1 - depth(py5))); if (Math.abs(px5 - pp5.x) < pp5.w + W * .02) continue
          if (px5 > s.farmBox[0] && px5 < s.farmBox[1] && py5 < s.farmBox[2]) continue
          var h5 = K * size * (.7 + R() * .6) * (1 + depth(py5) * 1.6) * (1 - .35 * rr5)
          trees.push([px5, py5, h5, R() < leafyPart]); n--
        }
      }
      s.farmBox = [W * (narrow ? .22 : .18), W * (narrow ? .42 : .38), yH + K * .06]
      forest(W * .08, yH + K * .05, W * .12, K * .04, 34, .035, .25)       /* bosque a la izquierda, detras de la granja */
      forest(W * .74, yH + K * .1, W * .14, K * .05, 40, .04, .3)          /* bosque entre el camino y la torre */
      forest(W * .97, yH + K * .2, W * .09, K * .07, 18, .05, .2)          /* borde derecho, mas cerca */
      forest(W * .5, yH + K * .03, W * .05, K * .02, 10, .028, .4)         /* bosquete lejano junto al camino */
      for (var k6 = 0; k6 < 6; k6++) forest(R() * W, yH + (H - yH) * (.1 + R() * .3), W * .02, K * .01, 1, .04, .5)   /* arboles sueltos */
      trees.sort(function (a3, b3) { return a3[1] - b3[1] }).forEach(function (tq) { (tq[3] ? leafy : pine)(tq[0], tq[1], tq[2]) })
      /* granja: establo con puerta y ventana, silo, cerca de madera y el foco montado en su poste */
      s.farm = { x: W * (narrow ? .27 : .23), y: yH + K * .03 }
      var fx = s.farm.x, fy = s.farm.y, fw = K * .055
      shadow(fx + fw * .7, fy + 1, fw * .95, .6)
      g.fillStyle = '#121b40'; g.strokeStyle = 'rgba(138,180,255,.8)'; g.lineWidth = .9
      g.fillRect(fx, fy - fw * .55, fw, fw * .55); g.strokeRect(fx, fy - fw * .55, fw, fw * .55)
      g.beginPath(); g.moveTo(fx - 2, fy - fw * .55); g.lineTo(fx + fw / 2, fy - fw * .92); g.lineTo(fx + fw + 2, fy - fw * .55); g.closePath(); g.fill(); g.stroke()
      g.fillStyle = '#05070f'; g.fillRect(fx + fw * .36, fy - fw * .34, fw * .28, fw * .34); g.strokeRect(fx + fw * .36, fy - fw * .34, fw * .28, fw * .34)
      g.beginPath(); g.moveTo(fx + fw * .36, fy - fw * .34); g.lineTo(fx + fw * .64, fy); g.moveTo(fx + fw * .64, fy - fw * .34); g.lineTo(fx + fw * .36, fy); g.stroke()
      g.fillStyle = '#f8d874'; g.fillRect(fx + fw * .12, fy - fw * .44, fw * .12, fw * .1); g.fillRect(fx + fw * .76, fy - fw * .44, fw * .12, fw * .1)
      g.fillStyle = '#121b40'; g.fillRect(fx + fw * 1.1, fy - fw * 1.1, fw * .3, fw * 1.1); g.strokeRect(fx + fw * 1.1, fy - fw * 1.1, fw * .3, fw * 1.1)
      g.beginPath(); g.arc(fx + fw * 1.25, fy - fw * 1.1, fw * .15, Math.PI, 0); g.fill(); g.stroke()
      g.strokeStyle = 'rgba(138,180,255,.35)'; g.lineWidth = .6; g.beginPath(); for (var sb = 1; sb < 5; sb++) { g.moveTo(fx + fw * 1.1, fy - fw * 1.1 * sb / 5); g.lineTo(fx + fw * 1.4, fy - fw * 1.1 * sb / 5) } g.stroke()
      /* cerca alrededor */
      g.strokeStyle = 'rgba(185,175,150,.6)'; g.lineWidth = .8; g.beginPath()
      for (var fp = 0; fp <= 8; fp++) { var cx3 = fx - fw * .5 + fp * fw * .3, cy3 = fy + K * .012; g.moveTo(cx3, cy3); g.lineTo(cx3, cy3 - fw * .22) }
      g.moveTo(fx - fw * .5, fy + K * .012 - fw * .08); g.lineTo(fx + fw * 1.9, fy + K * .012 - fw * .08); g.moveTo(fx - fw * .5, fy + K * .012 - fw * .17); g.lineTo(fx + fw * 1.9, fy + K * .012 - fw * .17); g.stroke()
      /* poste del foco (la luz parasita sale de aqui) */
      s.flood = { x: fx + fw * 1.75, y: fy - fw * 1.35 }
      shadow(s.flood.x, fy + 1, fw * .12, .5)
      g.strokeStyle = 'rgba(185,195,235,.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(s.flood.x, fy); g.lineTo(s.flood.x, s.flood.y); g.lineTo(s.flood.x + fw * .12, s.flood.y + fw * .02); g.stroke()
      g.fillStyle = '#1a2350'; g.beginPath(); g.moveTo(s.flood.x + fw * .06, s.flood.y - fw * .05); g.lineTo(s.flood.x + fw * .22, s.flood.y - fw * .02); g.lineTo(s.flood.x + fw * .18, s.flood.y + fw * .08); g.lineTo(s.flood.x + fw * .04, s.flood.y + fw * .05); g.closePath(); g.fill(); g.stroke()
      s.flood.x += fw * .14; s.flood.y += fw * .03
      /* torres de alta tension: una cercana y otra lejana unidas por los cables (que no acaban en el aire) */
      var tower = function (x2, y2, th) {
        var tb = th * .22
        shadow(x2, y2 + 1, tb * .75, .55)
        g.fillStyle = '#1a2350'; g.fillRect(x2 - tb * .55, y2 - 2, tb * .14, 3); g.fillRect(x2 + tb * .41, y2 - 2, tb * .14, 3)
        g.strokeStyle = 'rgba(160,175,230,.72)'; g.lineWidth = .8; g.beginPath()
        g.moveTo(x2 - tb / 2, y2); g.lineTo(x2 - tb * .08, y2 - th); g.moveTo(x2 + tb / 2, y2); g.lineTo(x2 + tb * .08, y2 - th)
        for (var lv = 0; lv < 7; lv++) { var f1 = lv / 7, f2 = (lv + 1) / 7, wa = lerp(tb / 2, tb * .08, f1), wb = lerp(tb / 2, tb * .08, f2), ya = y2 - th * f1, yb = y2 - th * f2; g.moveTo(x2 - wa, ya); g.lineTo(x2 + wb, yb); g.moveTo(x2 + wa, ya); g.lineTo(x2 - wb, yb) }
        ;[.72, .9].forEach(function (f) { var y5 = y2 - th * f, a2 = th * (f > .8 ? .2 : .26); g.moveTo(x2 - a2, y5); g.lineTo(x2 + a2, y5); g.moveTo(x2 - a2, y5); g.lineTo(x2 - a2, y5 + th * .03); g.moveTo(x2 + a2, y5); g.lineTo(x2 + a2, y5 + th * .03) })
        g.stroke()
      }
      s.tower = { x: W * (narrow ? .84 : .82), y: yH + K * .05, h: K * .2 }
      var t2x = W * (narrow ? .52 : .55), t2y = yH + K * .005, t2h = K * .09
      tower(t2x, t2y, t2h); tower(s.tower.x, s.tower.y, s.tower.h)
      g.strokeStyle = 'rgba(160,175,230,.35)'; g.lineWidth = .7; g.beginPath()
      ;[[.72, .26], [.9, .2]].forEach(function (lv2) { [-1, 1].forEach(function (sg) {
        var ax = s.tower.x + sg * s.tower.h * lv2[1], ay = s.tower.y - s.tower.h * lv2[0] + s.tower.h * .03, bx2 = t2x + sg * t2h * lv2[1], by2 = t2y - t2h * lv2[0] + t2h * .03
        g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx2) / 2, Math.max(ay, by2) + K * .02, bx2, by2)
        g.moveTo(ax, ay); g.quadraticCurveTo(ax + (W + 20 - ax) / 2, ay + K * .05, W + 20, ay + K * .07)
      }) })
      g.stroke()
      /* ladera del primer plano donde esta el telescopio */
      var fgY = function (x2) { return yG - K * .03 + Math.sin(x2 / W * 3 + .6) * K * .012 }
      s.tx = W * (narrow ? .26 : .3)
      g.beginPath(); g.moveTo(-2, H + 2); g.lineTo(-2, fgY(0)); for (x = 0; x <= W * .5; x += 3) g.lineTo(x, fgY(x)); g.quadraticCurveTo(W * .56, fgY(W * .5) + K * .04, W * .6, H + 2); g.closePath()
      var hg = g.createLinearGradient(0, yG - K * .04, 0, H); hg.addColorStop(0, '#0e1533'); hg.addColorStop(1, '#06081a'); g.fillStyle = hg; g.fill(); g.strokeStyle = 'rgba(120,136,212,.8)'; g.lineWidth = 1.1; g.stroke()
      g.save(); g.clip()
      for (var c2 = 1; c2 < 4; c2++) { g.strokeStyle = 'rgba(79,92,156,' + (.4 - c2 * .08) + ')'; g.lineWidth = .8; g.beginPath(); for (x = 0; x <= W * .6; x += 4) { var yq = fgY(x) + c2 * K * .035; x ? g.lineTo(x, yq) : g.moveTo(x, yq) } g.stroke() }
      for (var gq2 = 0; gq2 < 90; gq2++) { var gx2 = R() * W * .55, gy2 = fgY(gx2) + R() * (H - fgY(gx2)), gl2 = 5 + R() * 9; if (Math.abs(gx2 - s.tx) < K * .09 && gy2 < yG + K * .03) continue; g.strokeStyle = 'rgba(110,126,204,' + (.3 + R() * .3) + ')'; g.lineWidth = .8; g.beginPath(); for (var b4 = 0; b4 < 3; b4++) { var ln2 = (R() - .5) * 5; g.moveTo(gx2 + b4 * 1.4, gy2); g.quadraticCurveTo(gx2 + b4 * 1.4 + ln2 * .3, gy2 - gl2 * .6, gx2 + b4 * 1.4 + ln2, gy2 - gl2) } g.stroke() }
      g.restore()
      s.yG = yG = fgY(s.tx) + K * .012
      s.land = land
      S = s
    }

    function draw(now) {
      var t = now / 1000, s = S, yH = s.yH, yG = s.yG, pv = cur.priv, sf = cur.soft, li = cur.light
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      var sky = ctx.createLinearGradient(0, 0, 0, yH); sky.addColorStop(0, '#03040c'); sky.addColorStop(.6, '#0a1027'); sky.addColorStop(1, 'rgb(' + Math.round(lerp(18, 60, li)) + ',' + Math.round(lerp(24, 50, li)) + ',' + Math.round(lerp(52, 60, li)) + ')')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      for (var i = 0; i < s.stars.length; i++) { var st = s.stars[i], low = st.y / yH, al = st.a * (1 - li * .7 * Math.pow(low, 1.5)) * (.85 + .15 * Math.sin(t * 1.5 + st.ph)); if (al < .04) continue; ctx.fillStyle = 'rgba(232,238,255,' + al + ')'; if (st.r < .9) ctx.fillRect(st.x, st.y, st.r * 1.4, st.r * 1.4); else { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill() } }
      ctx.drawImage(s.land, 0, 0, W, H)
      var G = glowSprite()
      /* luces parasitas: foco de la granja (con su cono) y balizas rojas de la torre */
      if (li > .01) {
        var fx = s.flood.x, fy = s.flood.y
        ctx.save(); ctx.globalCompositeOperation = 'lighter'
        var cone = ctx.createLinearGradient(fx, fy, fx, fy + K * .12); cone.addColorStop(0, 'rgba(255,240,200,' + .35 * li + ')'); cone.addColorStop(1, 'rgba(255,240,200,0)')
        ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(fx - 2, fy); ctx.lineTo(fx + 2, fy); ctx.lineTo(fx + K * .09, fy + K * .12); ctx.lineTo(fx - K * .07, fy + K * .12); ctx.closePath(); ctx.fill()
        var gr = K * (.03 + .16 * li); ctx.globalAlpha = .5 + .5 * li; ctx.drawImage(G, fx - gr, fy - gr, gr * 2, gr * 2)
        /* destellos en estrella del foco */
        ctx.strokeStyle = 'rgba(255,245,215,' + .5 * li + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx - gr * .9, fy); ctx.lineTo(fx + gr * .9, fy); ctx.moveTo(fx, fy - gr * .6); ctx.lineTo(fx, fy + gr * .6); ctx.stroke()
        var tw = s.tower, bl = Math.sin(t * Math.PI * 1.2) > .2 ? 1 : .15
        ;[[0, 1], [-.26, .72], [.26, .72]].forEach(function (b) { var bx = tw.x + b[0] * tw.h, by = tw.y - tw.h * b[1], rr = K * (.012 + .03 * li) * bl; ctx.globalAlpha = Math.min(1, .3 + li) * bl; var rg = ctx.createRadialGradient(bx, by, 0, bx, by, rr); rg.addColorStop(0, 'rgba(255,90,90,1)'); rg.addColorStop(1, 'rgba(255,60,60,0)'); ctx.fillStyle = rg; ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2) })
        ctx.restore()
        /* velo de luz que ensucia la escena */
        ctx.fillStyle = 'rgba(248,216,140,' + .08 * li + ')'; ctx.fillRect(0, 0, W, H)
      }
      /* zona restringida: valla con senal de prohibido cortando el camino */
      if (pv > .01) {
        ctx.save(); ctx.globalAlpha = pv
        var p = s.path(.45), fw = p.w * 3.2, fyy = p.y
        ctx.strokeStyle = 'rgba(200,210,240,.85)'; ctx.lineWidth = 1.2; ctx.beginPath()
        for (var k = 0; k <= 6; k++) { var xx = p.x - fw + k * fw / 3; ctx.moveTo(xx, fyy); ctx.lineTo(xx, fyy - K * .045) }
        ;[.015, .03, .042].forEach(function (h) { ctx.moveTo(p.x - fw, fyy - K * h); ctx.lineTo(p.x + fw, fyy - K * h) })
        ctx.stroke()
        /* alambre de espino */
        ctx.lineWidth = .7; ctx.beginPath(); for (var b2 = 0; b2 < 16; b2++) { var xb = p.x - fw + b2 * fw / 8; ctx.moveTo(xb - 1.5, fyy - K * .042 - 1.5); ctx.lineTo(xb + 1.5, fyy - K * .042 + 1.5); ctx.moveTo(xb + 1.5, fyy - K * .042 - 1.5); ctx.lineTo(xb - 1.5, fyy - K * .042 + 1.5) } ctx.stroke()
        var sr = K * .028, sx = p.x + fw * .15, sy = fyy - K * .09
        ctx.strokeStyle = 'rgba(200,210,240,.85)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx, fyy); ctx.lineTo(sx, sy + sr); ctx.stroke()
        ctx.fillStyle = '#f3f5ff'; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.283); ctx.fill()
        ctx.strokeStyle = RED; ctx.lineWidth = sr * .28; ctx.beginPath(); ctx.arc(sx, sy, sr * .82, 0, 6.283); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(sx - sr * .58, sy + sr * .58); ctx.lineTo(sx + sr * .58, sy - sr * .58); ctx.stroke()
        ctx.restore()
      }
      /* zona conflictiva o con luces fuertes: una silueta con linterna en el camino */
      var who = Math.max(pv, (li - .55) / .45)
      if (who > .02) {
        var pp = s.path(.3), hx = pp.x + pp.w * .3 + Math.sin(t * .4) * pp.w * .2, hy = pp.y, hh = K * .05
        ctx.save(); ctx.globalAlpha = Math.min(1, who)
        ctx.fillStyle = '#04050c'; ctx.strokeStyle = 'rgba(185,201,255,.55)'; ctx.lineWidth = .8
        ctx.beginPath(); ctx.arc(hx, hy - hh * .88, hh * .12, 0, 6.283); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(hx - hh * .16, hy - hh * .74); ctx.lineTo(hx - hh * .2, hy - hh * .32); ctx.lineTo(hx - hh * .12, hy); ctx.lineTo(hx + hh * .12, hy); ctx.lineTo(hx + hh * .2, hy - hh * .32); ctx.lineTo(hx + hh * .16, hy - hh * .74); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.globalCompositeOperation = 'lighter'; var fl = .7 + .3 * Math.sin(t * 9) * Math.sin(t * 3.7), lx = hx - hh * .3, ly = hy - hh * .45
        var bm = ctx.createLinearGradient(lx, ly, lx - K * .12, ly + K * .03); bm.addColorStop(0, 'rgba(255,245,215,' + .5 * fl + ')'); bm.addColorStop(1, 'rgba(255,245,215,0)')
        ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - K * .12, ly - K * .015); ctx.lineTo(lx - K * .12, ly + K * .06); ctx.closePath(); ctx.fill()
        ctx.drawImage(G, lx - K * .02, ly - K * .02, K * .04, K * .04)
        ctx.restore()
      }

      /* suelo bajo el telescopio: losa de roca o barro */
      var u = Math.max(.9, K / 470), tx = s.tx, gy = yG
      if (sf < .99) {
        ctx.save(); ctx.globalAlpha = 1 - sf
        ctx.fillStyle = '#141b3a'; ctx.strokeStyle = 'rgba(160,175,230,.75)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(tx - 34 * u, gy + 6 * u); ctx.lineTo(tx - 26 * u, gy - 3 * u); ctx.lineTo(tx + 8 * u, gy - 5 * u); ctx.lineTo(tx + 30 * u, gy - 1 * u); ctx.lineTo(tx + 36 * u, gy + 7 * u); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.strokeStyle = 'rgba(120,136,212,.5)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(tx - 10 * u, gy - 4 * u); ctx.lineTo(tx - 6 * u, gy + 1 * u); ctx.lineTo(tx - 9 * u, gy + 5 * u); ctx.moveTo(tx + 16 * u, gy - 3 * u); ctx.lineTo(tx + 19 * u, gy + 3 * u); ctx.stroke()
        ctx.restore()
      }
      if (sf > .01) {
        ctx.save(); ctx.globalAlpha = sf
        ;[[0, 4, 34, 7], [-18, 7, 14, 4], [20, 8, 12, 3.5]].forEach(function (m) { ctx.fillStyle = 'rgba(70,58,48,.75)'; ctx.beginPath(); ctx.ellipse(tx + m[0] * u, gy + m[1] * u, m[2] * u, m[3] * u, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = 'rgba(190,170,140,.35)'; ctx.lineWidth = .7; ctx.stroke() })
        ctx.strokeStyle = 'rgba(210,200,180,.35)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(tx - 6 * u, gy + 3 * u, 8 * u, 1.6 * u, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
        ctx.restore()
      }
      /* telescopio: con suelo blando se hunde, se ladea y vibra */
      var sink = 5 * u * sf, tilt = (-.11 + .02 * Math.sin(t * 1.3)) * sf, jit = sf * (Math.sin(t * 23) * .8 + Math.sin(t * 37) * .5) * u
      ctx.save(); ctx.translate(tx + jit, gy + sink); ctx.rotate(tilt)
      var ty = -26 * u
      ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(205,215,255,.95)'
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(-12 * u, 0); ctx.moveTo(0, ty); ctx.lineTo(12 * u, 0); ctx.moveTo(0, ty); ctx.lineTo(2 * u, 0); ctx.moveTo(-7 * u, ty + 14 * u); ctx.lineTo(7 * u, ty + 14 * u); ctx.stroke()
      ctx.fillStyle = '#121a3c'; ctx.beginPath(); ctx.arc(0, ty, 3.4 * u, 0, 6.283); ctx.fill(); ctx.stroke()
      ctx.save(); ctx.translate(0, ty - 2 * u); ctx.rotate(-.75)
      ctx.fillRect(-16 * u, -3.8 * u, 38 * u, 7.6 * u); ctx.strokeRect(-16 * u, -3.8 * u, 38 * u, 7.6 * u)
      ctx.fillRect(22 * u, -4.6 * u, 10 * u, 9.2 * u); ctx.strokeRect(22 * u, -4.6 * u, 10 * u, 9.2 * u)
      ctx.beginPath(); ctx.moveTo(-2 * u, -3.8 * u); ctx.lineTo(-2 * u, -7.5 * u); ctx.lineTo(10 * u, -7.5 * u); ctx.lineTo(10 * u, -3.8 * u); ctx.stroke()
      ctx.fillStyle = '#f8d874'; ctx.fillRect(-19 * u, -1.6 * u, 3 * u, 3.2 * u)
      ctx.restore(); ctx.restore()
      /* punto optimo: acceso libre, sin luces parasitas y suelo firme */
      var ok = (1 - pv) * (1 - sf) * clamp(1 - li / .15)
      if (ok > .02) {
        var ox = tx, oy = gy - 64 * u, orr = 9 * u, pul = 1 + .08 * Math.sin(t * 3)
        ctx.save(); ctx.globalAlpha = ok
        ctx.strokeStyle = 'rgba(127,224,166,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ox, oy, orr * 1.6 * pul, 0, 6.283); ctx.stroke()
        ctx.fillStyle = 'rgba(20,60,40,.85)'; ctx.strokeStyle = GREEN; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(ox, oy, orr, 0, 6.283); ctx.fill(); ctx.stroke()
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox - orr * .45, oy); ctx.lineTo(ox - orr * .1, oy + orr * .38); ctx.lineTo(ox + orr * .5, oy - orr * .35); ctx.stroke()
        ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(127,224,166,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(ox, oy + orr); ctx.lineTo(ox, gy - 34 * u); ctx.stroke(); ctx.setLineDash([])
        ctx.font = '400 ' + Math.max(10, 11 * u) + 'px ' + SERIF; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = GREEN; ctx.fillText(LBL.opt, ox, oy - orr * 1.8)
        ctx.restore()
      }

      /* ocular: estrellas nitidas con suelo firme; con barro tiemblan y dejan estela; las luces aclaran el fondo */
      var oR = Math.max(32, Math.min(W * (s.narrow ? .2 : .13), H * .15)), ocx = W - oR - 12, ocy = (s.narrow ? 150 : 14) + oR
      ctx.save(); ctx.beginPath(); ctx.arc(ocx, ocy, oR, 0, 6.283); ctx.clip()
      ctx.fillStyle = 'rgb(' + Math.round(lerp(3, 40, li)) + ',' + Math.round(lerp(4, 36, li)) + ',' + Math.round(lerp(12, 40, li)) + ')'; ctx.fillRect(ocx - oR, ocy - oR, oR * 2, oR * 2)
      var amp = sf * oR * .07, R2 = rng(5)
      for (var k2 = 0; k2 < 26; k2++) {
        var sx2 = ocx + (R2() * 2 - 1) * oR * .85, sy2 = ocy + (R2() * 2 - 1) * oR * .85, br = .4 + R2() * .6, rr2 = (.6 + br * 1.4) * Math.max(1, oR / 60)
        if (br * (1 - li * .8) < .12) continue
        ctx.globalAlpha = br * (1 - li * .6)
        if (amp > .3) { ctx.strokeStyle = 'rgba(230,238,255,.5)'; ctx.lineWidth = rr2; ctx.beginPath(); for (var q = 0; q < 6; q++) { var ph = t * 22 - q * .25, dx = Math.sin(ph) * amp, dy = Math.cos(ph * 1.3) * amp * .6; q ? ctx.lineTo(sx2 + dx, sy2 + dy) : ctx.moveTo(sx2 + dx, sy2 + dy) } ctx.stroke() }
        ctx.fillStyle = '#eef3ff'; ctx.beginPath(); ctx.arc(sx2 + Math.sin(t * 22) * amp, sy2 + Math.cos(t * 28.6) * amp * .6, rr2, 0, 6.283); ctx.fill()
      }
      ctx.restore()
      ctx.strokeStyle = 'rgba(138,180,255,.9)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(ocx, ocy, oR, 0, 6.283); ctx.stroke()
      ctx.strokeStyle = 'rgba(91,107,180,.6)'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(ocx, ocy, oR + 3, 0, 6.283); ctx.stroke()
      ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(138,180,255,.25)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(tx + 20 * u, gy - 50 * u); ctx.lineTo(ocx - oR * .7, ocy + oR * .7); ctx.stroke(); ctx.setLineDash([])

      /* indicadores con su estado */
      var fz = Math.max(10, Math.min(12, W / 50)), lx = 12, ly = s.narrow ? 48 : 16
      ctx.font = '400 ' + fz + 'px ' + SERIF; ctx.textBaseline = 'top'; ctx.textAlign = 'left'
      var lt = li < .15 ? LBL.ninguna : li < .55 ? LBL.leves : LBL.fuertes
      ;[[LBL.acc, st2.priv ? LBL.restr : LBL.libre, !st2.priv], [LBL.luz, lt, li < .15], [LBL.ter, st2.soft ? LBL.blando : LBL.firme, !st2.soft]].forEach(function (r, i) {
        var yy = ly + i * (fz + 7); ctx.fillStyle = r[2] ? GREEN : RED; ctx.beginPath(); ctx.arc(lx + 3, yy + fz * .55, 3, 0, 6.283); ctx.fill()
        ctx.fillStyle = '#8f98c0'; ctx.fillText(r[0], lx + 11, yy); var wv = ctx.measureText(r[0] + '  ').width; ctx.fillStyle = '#f5f7ff'; ctx.fillText(r[1], lx + 11 + wv, yy)
      })
    }

    function frame(now) {
      if (dead) return
      if (!cv.isConnected) { dead = true; return }
      if (S && W > 0) {
        var moving = false, tg = { priv: st2.priv ? 1 : 0, soft: st2.soft ? 1 : 0, light: st2.light }
        ;['priv', 'soft', 'light'].forEach(function (k) { if (reduce) cur[k] = tg[k]; cur[k] += (tg[k] - cur[k]) * .12; if (Math.abs(tg[k] - cur[k]) < .003) cur[k] = tg[k]; else moving = true })
        /* en reposo basta con 30 fotogramas por segundo */
        if (moving || now - lastDraw > 31) { lastDraw = now; draw(now) }
      }
      raf = requestAnimationFrame(frame)
    }
    var resize = function () { if (!dead) build() }
    var onLang = function () { texts() }
    window.addEventListener('vc-lang', onLang)
    var ro = null
    try { ro = new ResizeObserver(resize); ro.observe(host) } catch (e) { window.addEventListener('resize', resize) }
    build()
    raf = requestAnimationFrame(frame)
    return { destroy: function () { dead = true; cancelAnimationFrame(raf); window.removeEventListener('vc-lang', onLang); window.removeEventListener('resize', resize); if (ro) ro.disconnect() } }
  }
  window.vcEleccion = { mount: mount }
})()
