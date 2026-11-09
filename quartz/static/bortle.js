/* Escala de Bortle interactiva (v2): paisaje en 3D visto desde la ladera de una montana. Un terreno real (mapa de
   alturas) se dibuja en perspectiva con curvas de nivel, como el mapa topografico de la pagina; en el valle hay un rio,
   cultivos, carreteras y varias poblaciones a distintas distancias. Al pasar del nivel 9 al 1 se apagan sus luces y el
   cielo se llena de estrellas, la Via Lactea, galaxias y nebulosas.
   window.vcBortle.mount(host) -> { destroy(), setLevel(n) } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var clamp = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)) }
  var lerp = function (a, b, t) { return a + (b - a) * t }
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  var mix = function (c0, c1, t) { return [0, 1, 2].map(function (i) { return Math.round(lerp(c0[i], c1[i], t)) }) }
  var rgb = function (c, a) { return a == null ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + a + ')' }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2832 * r()) }

  /* ---------- ruido para el relieve ---------- */
  function hash2(i, j) { var h = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    var a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  function fbm(x, y, o) { var s = 0, a = .5, f = 1; for (var i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5 } return s }
  function ridged(x, y, o) { var s = 0, a = .55, f = 1; for (var i = 0; i < o; i++) { var n = 1 - Math.abs(vnoise(x * f, y * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= .5 } return s }
  /* eje del valle (por donde va el rio) */
  var xc = function (z) { return 34 * Math.sin(z / 95 + .6) + 12 * Math.sin(z / 37 + 1.7) }
  function terrain(x, z) {
    var dx = x - xc(z), u = Math.abs(dx) / (z + 60)
    var h = 7 * fbm(x / 45, z / 45, 3)
    var side = sstep(.15, .62, u)
    h += side * (14 + Math.min(z, 340) * .17) * (.6 + .65 * ridged(x / 70 + 3.1, z / 70, 4))
    var far = sstep(400, 720, z); if (far > 0) h += far * (45 + 100 * ridged(x / 115 + 9.7, z / 115 + 2.3, 5))
    var rv = Math.abs(dx) / (4 + z * .012); if (rv < 1) h -= (1 - rv) * (1 - rv) * 5
    return h
  }
  /* mapa de alturas precalculado (se reutiliza entre redimensionados) */
  var HM = null
  function heightmap() {
    if (HM) return HM
    var NX = 420, NZ = 360, X0 = -950, X1 = 950, Z0 = 0, Z1 = 1160, g = new Float32Array(NX * NZ)
    for (var j = 0; j < NZ; j++) { var z = Z0 + (Z1 - Z0) * j / (NZ - 1); for (var i = 0; i < NX; i++) g[j * NX + i] = terrain(X0 + (X1 - X0) * i / (NX - 1), z) }
    HM = { g: g, NX: NX, NZ: NZ, X0: X0, X1: X1, Z0: Z0, Z1: Z1, sx: (NX - 1) / (X1 - X0), sz: (NZ - 1) / (Z1 - Z0) }
    return HM
  }
  function hAt(x, z) {
    var m = HM, fx = (x - m.X0) * m.sx, fz = (z - m.Z0) * m.sz
    if (fx < 0) fx = 0; if (fz < 0) fz = 0; if (fx > m.NX - 1.001) fx = m.NX - 1.001; if (fz > m.NZ - 1.001) fz = m.NZ - 1.001
    var i = fx | 0, j = fz | 0, a = fx - i, b = fz - j, k = j * m.NX + i, g = m.g
    return (g[k] * (1 - a) + g[k + 1] * a) * (1 - b) + (g[k + m.NX] * (1 - a) + g[k + m.NX + 1] * a) * b
  }

  var CSS = '.bz-c{flex:1;min-width:0;height:100%;display:block;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}' +
    '.bz-s{flex:none;width:clamp(58px,9vw,84px);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-left:1px solid #343d63;background:linear-gradient(180deg,#0e1430e6,#0a0f26e6);user-select:none;-webkit-user-select:none}' +
    '.bz-h,.bz-e{flex:none;font:400 11px/1.2 ' + SERIF + ';color:#8f98c0;text-align:center;padding:0 2px}' +
    '.bz-n{flex:none;font:400 26px/1 ' + SERIF + ';color:#f5f7ff}' +
    '.bz-lv{position:relative;flex:1;min-height:0;width:100%;display:flex;flex-direction:column;justify-content:space-between;align-items:center;touch-action:none;padding:2px 0}' +
    '.bz-lv::before{content:"";position:absolute;top:12px;bottom:12px;left:50%;width:1px;background:#343d63}' +
    '.bz-b{position:relative;flex:none;width:var(--bd,28px);height:var(--bd,28px);box-sizing:border-box;margin:0;padding:0;border-radius:50%;border:1.5px solid var(--c,#5b6bb4);background:#0b1025;color:#b9c9ff;font:400 12px/1 ' + SERIF + ';cursor:pointer;outline:none;transition:transform .2s ease,background .2s ease,color .2s ease,box-shadow .2s ease}' +
    '.bz-b:hover,.bz-b:focus-visible{transform:scale(1.12);color:#fff}' +
    '.bz-b.on{background:var(--c,#5b6bb4);color:#05060f;box-shadow:0 0 14px var(--c,#5b6bb4);transform:scale(1.14)}' +
    '.bz-root-short .bz-h,.bz-root-short .bz-e{display:none}.bz-root-tiny .bz-n{display:none}'

  /* sprite de brillo reutilizable (halo amarillo) */
  var GLOW = null
  function glowSprite() {
    if (GLOW) return GLOW
    var c = document.createElement('canvas'); c.width = c.height = 64
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,236,170,1)'); g.addColorStop(.18, 'rgba(248,216,116,.55)'); g.addColorStop(.5, 'rgba(248,200,100,.14)'); g.addColorStop(1, 'rgba(248,190,90,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); GLOW = c; return c
  }

  var CACHE = null, BUILDS = 0, WARMED = false
  var PH = { a: { src: 'bortle-ancho.webp', w: 1716, h: 1000 }, t: { src: 'bortle-alto.webp', w: 700, h: 1700 } }
  /* se descarga ya la imagen fija que corresponde a esta pantalla */
  try { new Image().src = (window.innerWidth / window.innerHeight > 1 ? PH.a : PH.t).src } catch (e) { }
  /* opts.buildDelay: espera antes de calcular el paisaje (para no trabar una animacion; mientras, se ve la imagen fija) */
  function mount(host, opts) {
    var BDU = Date.now() + ((opts && opts.buildDelay) || 0)   /* hasta cuando esperar para el primer calculo */
    if (!document.getElementById('bz-css')) { var st = document.createElement('style'); st.id = 'bz-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var cv = document.createElement('canvas'); cv.className = 'bz-c'; cv.style.opacity = '0'; cv.style.transition = 'opacity .45s ease-out'
    var shown = false; cv.setAttribute('role', 'img')
    var side = document.createElement('div'); side.className = 'bz-s'
    side.innerHTML = '<div class="bz-h"></div><div class="bz-e" data-e="0"></div><div class="bz-n"></div><div class="bz-lv"></div><div class="bz-e" data-e="1"></div>'
    host.append(cv, side)
    var hH = side.querySelector('.bz-h'), eT = side.querySelector('[data-e="0"]'), eB = side.querySelector('[data-e="1"]'), nn = side.querySelector('.bz-n'), lv = side.querySelector('.bz-lv')
    var btns = []
    for (var i = 1; i <= 9; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bz-b'; b.textContent = i
      b.style.setProperty('--c', rgb(mix([91, 107, 180], [248, 216, 116], (i - 1) / 8)))
      b.setAttribute('aria-label', 'Bortle ' + i); b.dataset.l = i; lv.append(b); btns.push(b)
    }
    function texts() {
      hH.textContent = T('Escala de Bortle'); eT.textContent = T('Cielo más oscuro'); eB.textContent = T('Cielo más claro')
      cv.setAttribute('aria-label', T('Escala de Bortle'))
    }
    texts()

    /* ---------- estado y controles ---------- */
    var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    var target = 5, cur = 5, W = 0, H = 0, ctx = cv.getContext('2d'), raf = 0, dead = false, t0 = performance.now()
    var mx = .5, shoot = null, plane = null, nextPlane = 9000, nextShoot = 2500, S = null, buildT = 0, lastMx = .5, lastDraw = 0
    function setLevel(n, instant) {
      target = clamp(Math.round(n), 1, 9)
      btns.forEach(function (b) { b.classList.toggle('on', +b.dataset.l === target) })
      nn.textContent = target; nn.style.color = rgb(mix([219, 231, 255], [248, 216, 116], (target - 1) / 8))
      if (instant || reduce) cur = target
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { setLevel(+b.dataset.l) }) })
    side.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : 0
      if (!d) return
      e.preventDefault(); setLevel(target + d); btns[target - 1].focus()
    })
    var dragging = false
    function fromY(y) { var r = lv.getBoundingClientRect(), p = clamp((y - r.top - 12) / Math.max(1, r.height - 24)); setLevel(1 + Math.round(p * 8)) }
    lv.addEventListener('pointerdown', function (e) { dragging = true; try { lv.setPointerCapture(e.pointerId) } catch (x) { } fromY(e.clientY) })
    lv.addEventListener('pointermove', function (e) { if (dragging) fromY(e.clientY) })
    lv.addEventListener('pointerup', function () { dragging = false })
    lv.addEventListener('pointercancel', function () { dragging = false })

    /* =====================================================================================================
       CONSTRUCCION DE LA ESCENA (al montar y al cambiar de tamano)
       ===================================================================================================== */
    function mkCanvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c }

    function build() {
      var rs = Math.min(1.5, window.devicePixelRatio || 1), rw = Math.round(W * rs), rh = Math.round(H * rs)
      heightmap()
      var sc = {}
      /* camara: de pie en la ladera izquierda, mirando el valle; en pantallas altas el horizonte baja */
      var tall = clamp((H / W - 1.1) / 1.6), F = Math.min(H * .95, W * (1.2 + .6 * tall)) * rs, Hy = rh * (.45 + .12 * clamp((H / W - 1.1) / 1.6)), camX = -26, yaw = .1, camH = 36, cx0 = rw / 2
      sc.rs = rs; sc.Hy = Hy / rs
      var proj = function (x, h, z) { return [(cx0 + (x - camX - yaw * z) * F / z) / rs, (Hy + (camH - h) * F / z) / rs] }
      sc.proj = proj

      /* ---- 1) terreno en perspectiva (raycasting por columnas) ---- */
      var zs = []; for (var z = 11; z < 1120; z += .32 + z * .0105) zs.push(z)
      var nZ = zs.length, occ = new Int16Array(rw * nZ)
      var imD = new ImageData(rw, rh), imP = new ImageData(rw, rh), pD = new Uint32Array(imD.data.buffer), pP = new Uint32Array(imP.data.buffer)
      var pack = function (r, g, b) { return (255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255) }
      var STEP = 11
      for (var sx = 0; sx < rw; sx++) {
        var ybuf = rh, dir = yaw + (sx - cx0) / F, prevBand = null, hidden = true, hPrev = null, zPrev = 0
        for (var k = 0; k < nZ; k++) {
          var zz = zs[k], x = camX + dir * zz, h = hAt(x, zz), y = Math.floor(Hy + (camH - h) * F / zz)
          occ[sx * nZ + k] = ybuf
          var band = Math.floor(h / STEP)
          if (y < ybuf) {
            var yt = y < 0 ? 0 : y
            var fog = Math.pow(clamp((zz - 30) / 900), .72), slope = hPrev == null ? 0 : (h - hPrev) / (zz - zPrev)
            var shade = clamp(.8 + slope * 1.6 + h / 900, .55, 1.3), water = h < -1.6
            var dr = lerp(12, 31, fog) * shade, dg = lerp(17, 38, fog) * shade, db = lerp(42, 78, fog) * shade
            var pr = lerp(30, 112, Math.pow(fog, .6)) * (.85 + .15 * shade), pg = lerp(28, 94, Math.pow(fog, .6)) * (.85 + .15 * shade), pb = lerp(38, 74, Math.pow(fog, .6)) * (.85 + .15 * shade)
            if (water) { dr = 7; dg = 11; db = 30; pr = 26; pg = 24; pb = 34 }
            var cD = pack(dr, dg, db), cP = pack(pr, pg, pb)
            for (var py = yt; py < ybuf; py++) { pD[py * rw + sx] = cD; pP[py * rw + sx] = cP }
            /* linea de silueta (cresta que asoma) o curva de nivel */
            var edge = hidden && k > 0, cont = prevBand !== null && band !== prevBand
            if (edge || cont) {
              var a = edge ? .9 * (1 - fog * .45) : .5 * (1 - fog * .78), lr = edge ? 120 : 76, lg = edge ? 136 : 90, lb = edge ? 212 : 156
              if (water) a *= .4
              pD[yt * rw + sx] = pack(lerp(dr, lr, a), lerp(dg, lg, a), lerp(db, lb, a))
              pP[yt * rw + sx] = pack(lerp(pr, 158, a * .7), lerp(pg, 146, a * .7), lerp(pb, 150, a * .7))
            }
            ybuf = yt; hidden = false
          } else hidden = true
          prevBand = band; hPrev = h; zPrev = zz
          if (ybuf <= 0) { for (var k2 = k + 1; k2 < nZ; k2++) occ[sx * nZ + k2] = 0; break }
        }
      }
      var tD = mkCanvas(rw, rh), tP = mkCanvas(rw, rh)
      tD.getContext('2d').putImageData(imD, 0, 0); tP.getContext('2d').putImageData(imP, 0, 0)
      var idxOf = function (zq) { var lo = 0, hi = nZ - 1; while (lo < hi) { var m = (lo + hi) >> 1; if (zs[m] < zq) lo = m + 1; else hi = m } return lo }
      /* visible si el punto queda por encima de lo que tapa el terreno mas cercano */
      var visible = function (px, py, zq) { var col = Math.round(px * rs); if (col < 0 || col >= rw) return false; return py * rs < occ[col * nZ + idxOf(zq)] - 1 }

      /* ---- 2) el valle: poblaciones con iglesias, cultivos, carreteras y bosques ---- */
      var r = rng(31), lights = [], cars = [], domes = [], smokes = [], glints = []
      var cD2 = tD.getContext('2d'), cP2 = tP.getContext('2d')
      ;[cD2, cP2].forEach(function (c) { c.setTransform(rs, 0, 0, rs, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round' })
      var PAL = [
        { wall: 'rgb(16,22,52)', side: 'rgb(10,14,36)', roof: 'rgb(25,33,72)', roofS: 'rgb(14,19,44)', line: '110,126,204', tree: 'rgb(17,25,58)', tree2: 'rgb(13,19,47)', leaf: '96,114,196', crop: '96,114,190', dark: 'rgb(6,9,24)' },
        { wall: 'rgb(48,44,54)', side: 'rgb(35,32,41)', roof: 'rgb(60,54,62)', roofS: 'rgb(41,37,45)', line: '175,162,152', tree: 'rgb(33,31,38)', tree2: 'rgb(28,27,34)', leaf: '118,110,112', crop: '170,158,142', dark: 'rgb(24,22,30)' }
      ]
      var mc = null
      var both = function (fn) { fn(cD2, PAL[0], 0); fn(cP2, PAL[1], 1); if (mc) fn(mc, PAL[0], 2) }
      var ground = function (x, z) { return hAt(x, z) }
      var scaleAt = function (x, zq) { var gy = ground(x, zq); return proj(x + 1, gy, zq)[0] - proj(x, gy, zq)[0] }
      /* ocupacion del suelo: cada elemento reserva su sitio para que nada se monte encima de otro */
      var taken = []
      var free = function (x, z, rr) { for (var i = 0; i < taken.length; i++) { var o = taken[i], dx = x - o[0], dz = z - o[1], m = rr + o[2]; if (dx * dx + dz * dz < m * m) return false } return true }
      var reserve = function (x, z, rr) { taken.push([x, z, rr]) }
      var inRiver = function (x, z, m) { return Math.abs(x - xc(z)) < 5 + z * .012 + (m || 0) }
      var flat = function (x, z, rr) { var h0 = ground(x, z), k2 = rr * .5; return Math.abs(ground(x + rr, z) - h0) < k2 && Math.abs(ground(x - rr, z) - h0) < k2 && Math.abs(ground(x, z + rr) - h0) < k2 && Math.abs(ground(x, z - rr) - h0) < k2 }
      var seen = function (x, z, up) { var p = proj(x, ground(x, z) + (up || 0), z); return visible(p[0], p[1] - 1, z) ? p : null }
      var ops = [], groundOps = []
      var lw = function (zq, k3) { return clamp((k3 || 22) / zq, .35, 1.5) }

      /* ---- arboles: pinos por pisos con puntas y frondosos de copa redonda ---- */
      var pine = function (g, P, x, y, hh, la) {
        var w = hh * .44
        if (hh < 6) { g.fillStyle = P.tree; g.beginPath(); g.moveTo(x, y - hh); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fill(); if (hh > 2) { g.strokeStyle = 'rgba(' + P.leaf + ',' + .62 * la + ')'; g.lineWidth = .5; g.stroke() } return }
        g.strokeStyle = 'rgba(' + P.line + ',' + .6 * la + ')'; g.lineWidth = Math.max(.6, hh * .035); g.beginPath(); g.moveTo(x, y + .5); g.lineTo(x, y - hh * .22); g.stroke()
        var tiers = hh < 14 ? 3 : hh < 32 ? 4 : 6
        for (var i = 0; i < tiers; i++) {
          var q = i / tiers, ty = y - hh + hh * q * .78, bw = w * (.3 + q * .78) / 2, by = ty + hh * .36, mid = (by - ty)
          g.beginPath(); g.moveTo(x, ty)
          g.lineTo(x + bw * .5, ty + mid * .55); g.lineTo(x + bw * .36, ty + mid * .56); g.lineTo(x + bw * .8, ty + mid * .86); g.lineTo(x + bw * .66, ty + mid * .87); g.lineTo(x + bw, by)
          g.quadraticCurveTo(x, by - hh * .06, x - bw, by)
          g.lineTo(x - bw * .66, ty + mid * .87); g.lineTo(x - bw * .8, ty + mid * .86); g.lineTo(x - bw * .36, ty + mid * .56); g.lineTo(x - bw * .5, ty + mid * .55); g.closePath()
          g.fillStyle = i % 2 ? P.tree2 : P.tree; g.fill()
          g.strokeStyle = 'rgba(' + P.leaf + ',' + la * (.42 + .25 * q) + ')'; g.lineWidth = Math.max(.4, hh * .012); g.stroke()
        }
      }
      var leafy = function (g, P, x, y, hh, la) {
        var rr = hh * .34
        g.strokeStyle = 'rgba(' + P.line + ',' + .6 * la + ')'; g.lineWidth = Math.max(.6, hh * .05); g.beginPath(); g.moveTo(x, y + .5); g.lineTo(x, y - hh * .5); g.moveTo(x, y - hh * .38); g.lineTo(x + rr * .5, y - hh * .58); g.stroke()
        var blobs = [[0, -.64, 1], [-.62, -.5, .74], [.6, -.52, .72], [-.25, -.86, .66], [.3, -.84, .6]]
        blobs.forEach(function (bq, i) {
          g.fillStyle = i % 2 ? P.tree2 : P.tree; g.beginPath(); g.arc(x + bq[0] * rr, y + bq[1] * hh, rr * bq[2], 0, 6.283); g.fill()
          g.strokeStyle = 'rgba(' + P.leaf + ',' + .55 * la + ')'; g.lineWidth = Math.max(.45, hh * .02); g.stroke()
        })
      }
      var addTree = function (x, zq, kind, sizeK) {
        var gy = ground(x, zq), base = proj(x, gy, zq); if (!visible(base[0], base[1] - 1, zq)) return false
        var s = scaleAt(x, zq), hh = (kind === 'pine' ? 6 + 4 * hash2(x * 7 | 0, zq * 3 | 0) : 4 + 2.5 * hash2(x * 5 | 0, zq * 9 | 0)) * s * (sizeK || 1)
        if (hh < 1) return false
        var la = clamp(60 / zq + .35, .35, 1)
        ops.push({ z: zq, f: function () { both(function (g, P) { (kind === 'pine' ? pine : leafy)(g, P, base[0], base[1], hh, la) }) } })
        return true
      }

      /* ---- casas con detalle: fachada con puerta y ventanas, cara lateral, tejado con tejas y chimenea ---- */
      var addHouse = function (x, zq, o) {
        var gy = ground(x, zq), base = proj(x, gy, zq); if (!visible(base[0], base[1] - 1, zq)) return false
        var s = scaleAt(x, zq), W1 = o.w * s, H1 = o.h * s, D1 = o.d * s * .42, rise = o.d * s * .2
        var left = (x - camX - yaw * zq) < 0, sx2 = left ? 1 : -1, x0 = base[0] - W1 / 2, y0 = base[1]
        var ex = left ? x0 + W1 : x0, ex2 = ex + sx2 * D1, flatR = o.roof === 'flat', rh2 = flatR ? 0 : W1 * .42
        var A = [x0 + W1 / 2, y0 - H1 - rh2], B = [A[0] + sx2 * D1, A[1] - rise], C = [ex2, y0 - rise - H1], D = [ex, y0 - H1]
        var floors = o.floors || 1, cols = W1 > 22 ? 3 : W1 > 7 ? 2 : 1
        var wins = []
        for (var fl = 0; fl < floors; fl++) for (var ci = 0; ci < cols; ci++) {
          if (floors === 1 && cols >= 2 && ci === (cols === 3 ? 1 : -1)) continue
          var ws = Math.max(.9, W1 * (cols === 3 ? .13 : .17)), wh = Math.max(.9, H1 / floors * .34)
          var wx = x0 + W1 * ((ci + .5) / cols) - ws / 2 + (cols === 2 && floors === 1 ? (ci ? W1 * .1 : -W1 * .1) : 0), wy = y0 - H1 + H1 / floors * (fl + .3)
          wins.push([wx, wy, ws, wh])
        }
        var door = H1 > 7 && floors === 1 && !flatR ? [x0 + W1 * .5 - W1 * .08, y0 - H1 * .46, W1 * .16, H1 * .46] : null
        if (door) wins = wins.filter(function (w) { return w[0] + w[2] < door[0] - .5 || w[0] > door[0] + door[2] + .5 })
        var chim = !flatR && W1 > 6 && o.chim ? (function () { var p1 = [lerp(A[0], D[0], .45), lerp(A[1], D[1], .45)], p2 = [lerp(B[0], C[0], .45), lerp(B[1], C[1], .45)]; return [lerp(p1[0], p2[0], .4), lerp(p1[1], p2[1], .4)] })() : null
        var la = clamp(40 / zq + .3, .35, 1)
        ops.push({ z: zq, f: function () {
          both(function (g, P) {
            var L1 = 'rgba(' + P.line + ',' + la + ')'; g.lineWidth = lw(zq, 22); g.strokeStyle = L1
            g.fillStyle = P.side; g.beginPath(); g.moveTo(ex, y0); g.lineTo(ex2, y0 - rise); g.lineTo(ex2, y0 - rise - H1); g.lineTo(ex, y0 - H1); g.closePath(); g.fill(); g.stroke()
            g.fillStyle = P.wall; g.fillRect(x0, y0 - H1, W1, H1); g.strokeRect(x0, y0 - H1, W1, H1)
            if (flatR) { g.fillStyle = P.roof; g.beginPath(); g.moveTo(x0, y0 - H1); g.lineTo(x0 + W1, y0 - H1); g.lineTo(x0 + W1 + sx2 * D1, y0 - H1 - rise); g.lineTo(x0 + sx2 * D1, y0 - H1 - rise); g.closePath(); g.fill(); g.stroke() }
            else {
              g.fillStyle = P.roof; g.beginPath(); g.moveTo(x0 - .5, y0 - H1); g.lineTo(A[0], A[1]); g.lineTo(x0 + W1 + .5, y0 - H1); g.closePath(); g.fill(); g.stroke()
              g.fillStyle = P.roofS; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(C[0], C[1]); g.lineTo(D[0], D[1]); g.closePath(); g.fill(); g.stroke()
              if (W1 > 9) { g.lineWidth = lw(zq, 12); g.strokeStyle = 'rgba(' + P.line + ',' + la * .45 + ')'; g.beginPath(); [.33, .66].forEach(function (q) { g.moveTo(lerp(A[0], D[0], q), lerp(A[1], D[1], q)); g.lineTo(lerp(B[0], C[0], q), lerp(B[1], C[1], q)) }); g.stroke(); g.lineWidth = lw(zq, 22); g.strokeStyle = L1 }
            }
            if (chim) { var cw = Math.max(1, W1 * .1), ch = Math.max(1.5, W1 * .22); g.fillStyle = P.wall; g.fillRect(chim[0] - cw / 2, chim[1] - ch, cw, ch); g.strokeRect(chim[0] - cw / 2, chim[1] - ch, cw, ch) }
            if (door) { g.fillStyle = P.dark; g.fillRect(door[0], door[1], door[2], door[3]); g.strokeRect(door[0], door[1], door[2], door[3]) }
            if (W1 > 9) { g.lineWidth = lw(zq, 12); g.strokeStyle = 'rgba(' + P.line + ',' + la * .7 + ')'; wins.forEach(function (w) { g.strokeRect(w[0] - .4, w[1] - .4, w[2] + .8, w[3] + .8); if (w[2] > 3) { g.beginPath(); g.moveTo(w[0] + w[2] / 2, w[1]); g.lineTo(w[0] + w[2] / 2, w[1] + w[3]); g.moveTo(w[0], w[1] + w[3] / 2); g.lineTo(w[0] + w[2], w[1] + w[3] / 2); g.stroke() } }) }
          })
        } })
        wins.forEach(function (w) { lights.push({ x: w[0], y: w[1], w: w[2], h: w[3], r: Math.max(3, w[2] * 4), t: lerp(o.t[0], o.t[1], r()), kind: w[2] < 1.6 ? 'dot' : 'win', z: zq }) })
        if (door) lights.push({ x: door[0] + door[2] * .5 - .6, y: door[1] - Math.max(1, H1 * .08), w: 1.2, h: 1.2, r: Math.max(4, W1 * .5), t: 6.4 + r() * 2.4, kind: 'lamp', z: zq })
        if (chim && r() < .55) smokes.push({ x: chim[0], y: chim[1] - Math.max(1.5, W1 * .22), s: s, ph: r() })
        return true
      }
      /* iglesia: nave con ventanas en arco, torre con campanario, reloj y aguja con cruz */
      var addChurch = function (x, zq, kind) {
        var gy = ground(x, zq), base = proj(x, gy, zq); if (!visible(base[0], base[1] - 1, zq)) return false
        var s = scaleAt(x, zq), big = kind !== 'chapel', cat = kind === 'cathedral'
        addHouse(x + 2, zq + 3, { w: big ? 9 : 6.5, d: big ? 16 : 10, h: big ? 9 : 6.5, floors: 1, roof: 'gable', t: [6.5, 9], chim: false })
        var towers = cat ? [-3.2, 3.2] : [-2.6], la = clamp(40 / zq + .3, .4, 1)
        towers.forEach(function (ox) {
          var tw = (big ? 4 : 3) * s, th = (cat ? 26 : big ? 21 : 13) * s, tx = base[0] + ox * s, ty = proj(x, gy, zq - 1)[1], sp = (big ? 9 : 6) * s
          ops.push({ z: zq - 1.5, f: function () {
            both(function (g, P) {
              g.fillStyle = P.wall; g.strokeStyle = 'rgba(' + P.line + ',' + Math.min(1, la + .15) + ')'; g.lineWidth = lw(zq, 26)
              g.fillRect(tx - tw / 2, ty - th, tw, th); g.strokeRect(tx - tw / 2, ty - th, tw, th)
              /* cornisa y campanario con dos arcos */
              g.beginPath(); g.moveTo(tx - tw / 2 - .8, ty - th * .78); g.lineTo(tx + tw / 2 + .8, ty - th * .78); g.stroke()
              if (tw > 5) { g.fillStyle = P.dark; [-.22, .22].forEach(function (q) { var ax = tx + q * tw - tw * .13, ay = ty - th * .93, aw = tw * .26, ah = th * .11; g.beginPath(); g.moveTo(ax, ay + ah); g.lineTo(ax, ay + aw / 2); g.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw, ay + ah); g.closePath(); g.fill(); g.stroke() }) }
              /* reloj */
              if (tw > 6) { g.beginPath(); g.arc(tx, ty - th * .66, tw * .2, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(tx, ty - th * .66); g.lineTo(tx, ty - th * .66 - tw * .14); g.moveTo(tx, ty - th * .66); g.lineTo(tx + tw * .1, ty - th * .66); g.stroke() }
              /* puerta en arco */
              if (tw > 5) { var dw = tw * .36, dh = th * .14; g.fillStyle = P.dark; g.beginPath(); g.moveTo(tx - dw / 2, ty); g.lineTo(tx - dw / 2, ty - dh); g.arc(tx, ty - dh, dw / 2, Math.PI, 0); g.lineTo(tx + dw / 2, ty); g.closePath(); g.fill(); g.stroke() }
              /* aguja y cruz */
              g.fillStyle = P.roof; g.beginPath(); g.moveTo(tx - tw / 2 - .6, ty - th); g.lineTo(tx, ty - th - sp); g.lineTo(tx + tw / 2 + .6, ty - th); g.closePath(); g.fill(); g.stroke()
              g.beginPath(); g.moveTo(tx, ty - th - sp); g.lineTo(tx, ty - th - sp - 2.4 * s); g.moveTo(tx - .8 * s, ty - th - sp - 1.7 * s); g.lineTo(tx + .8 * s, ty - th - sp - 1.7 * s); g.stroke()
            })
          } })
          lights.push({ x: tx - tw * .25, y: ty - th * .97, w: tw * .5, h: th * .12, r: tw * 2.5, t: 7.4, kind: 'win', z: zq - 1.5 })
          lights.push({ x: tx, y: ty - th * .5, w: 0, h: 0, r: tw * 3.5, t: 8, kind: 'flood', z: zq - 1.5 })
        })
        return true
      }

      /* ---- cultivos con detalle: vinas con sus cepas, huertas, cereal en franjas y frutales ---- */
      var addField = function (x0, z0, wx, wz, ang, type) {
        var ca = Math.cos(ang), sa = Math.sin(ang)
        var W3 = function (u, v) { return [x0 + u * wx * ca - v * wz * sa, z0 + u * wx * sa + v * wz * ca] }
        var P3 = function (u, v) { var q = W3(u, v); return proj(q[0], ground(q[0], q[1]) + .2, q[1]).concat([q[1]]) }
        var c = [P3(0, 0), P3(1, 0), P3(1, 1), P3(0, 1)]
        if (!c.every(function (p) { return visible(p[0], p[1], p[2]) })) return false
        var zc = (c[0][2] + c[2][2]) / 2, rows = type === 'cereal' ? 14 : type === 'frutal' ? 5 : type === 'campo' ? 2 : 9, tone = .05 + r() * .08
        groundOps.push(function () {
          both(function (g, P) {
            g.fillStyle = 'rgba(' + P.crop + ',' + tone + ')'; g.beginPath(); c.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]) }); g.closePath(); g.fill()
            g.strokeStyle = 'rgba(' + P.crop + ',.7)'; g.lineWidth = lw(zc, 26); g.stroke()
            if (type === 'cereal') for (var i = 0; i < rows; i += 2) { var a = P3(i / rows, 0), b = P3((i + 1) / rows, 0), cc = P3((i + 1) / rows, 1), d = P3(i / rows, 1); g.fillStyle = 'rgba(' + P.crop + ',.1)'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(cc[0], cc[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill() }
            g.strokeStyle = 'rgba(' + P.crop + ',.42)'; g.lineWidth = lw(zc, 16); g.beginPath()
            for (var j = 1; j < rows; j++) { var e = P3(j / rows, 0), f2 = P3(j / rows, 1); g.moveTo(e[0], e[1]); g.lineTo(f2[0], f2[1]) }
            g.stroke()
            /* plantas a lo largo de cada surco */
            if (type === 'vina' || type === 'huerta') {
              var sNear = scaleAt(W3(.5, .5)[0], zc)
              if (sNear > 1.6) {
                g.strokeStyle = 'rgba(' + P.crop + ',.85)'; g.fillStyle = 'rgba(' + P.crop + ',.7)'; g.lineWidth = lw(zc, 14)
                for (var j2 = 0; j2 <= rows; j2++) for (var v = .04; v < 1; v += 1.3 / wz) {
                  var p = P3(j2 / rows, v), ps = sNear
                  if (type === 'vina') { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - ps * 1.1); g.stroke(); g.beginPath(); g.arc(p[0], p[1] - ps * 1.2, ps * .42, 0, 6.283); g.fill() }
                  else { g.beginPath(); g.moveTo(p[0] - ps * .45, p[1] - ps * .5); g.lineTo(p[0], p[1]); g.lineTo(p[0] + ps * .45, p[1] - ps * .5); g.stroke() }
                }
              }
            }
            /* seto en un borde */
            if (r() < 1) { var sb = scaleAt(W3(0, .5)[0], zc); if (sb > 1.2) { g.fillStyle = P.tree2; g.strokeStyle = 'rgba(' + P.leaf + ',.5)'; g.lineWidth = .5; for (var u2 = 0; u2 <= 1; u2 += .07) { var hp = P3(u2, 0); g.beginPath(); g.arc(hp[0], hp[1] - sb * .45, sb * .55, 0, 6.283); g.fill(); g.stroke() } } }
          })
        })
        if (type === 'frutal') for (var fi = 0; fi < rows; fi++) for (var fj = 0; fj < 4; fj++) { var q = W3((fi + .5) / rows, (fj + .5) / 4); addTree(q[0], q[1], 'leafy', .65) }
        return true
      }

      /* ---- carreteras con farolas (reservan su franja de suelo) ---- */
      var addRoad = function (pts, lampEvery, tLamp) {
        var P = []
        for (var i = 0; i < pts.length - 1; i++) for (var q = 0; q < 1; q += .03) P.push([lerp(pts[i][0], pts[i + 1][0], q) + Math.sin((i + q) * 4) * 3, lerp(pts[i][1], pts[i + 1][1], q)])
        P.push(pts[pts.length - 1])
        P.forEach(function (p) { reserve(p[0], p[1], 2.8) })
        var S2 = P.map(function (p) { var pp = proj(p[0], ground(p[0], p[1]) + .2, p[1]); return { x: pp[0], y: pp[1], z: p[1], v: visible(pp[0], pp[1], p[1]) } })
        groundOps.push(function () {
          both(function (g, P2) {
            for (var i = 1; i < S2.length; i++) {
              var a = S2[i - 1], c = S2[i]; if (!a.v || !c.v) continue
              var wd = clamp(70 / c.z, .6, 3.4)
              g.strokeStyle = 'rgba(' + P2.line + ',.55)'; g.lineWidth = wd; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke()
              g.strokeStyle = P2.dark; g.lineWidth = wd * .55; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke()
            }
          })
        })
        var acc = 0
        for (var j = 1; j < P.length; j++) {
          acc += Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1])
          var inTown = towns.some(function (tw) { return Math.hypot((P[j][0] - tw.cx) / tw.R[0], (P[j][1] - tw.z) / tw.R[1]) < .85 })
          if (acc >= lampEvery && S2[j].v && inTown) {
            acc = 0; var sz = clamp(60 / S2[j].z, 1, 3), lx = S2[j].x + sz * 3, ly = S2[j].y
            ops.push({ z: S2[j].z, f: (function (lx, ly, sz, zq) { return function () { both(function (g, P2) { g.strokeStyle = 'rgba(' + P2.line + ',.8)'; g.lineWidth = lw(zq, 20); g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly - sz * 5); g.lineTo(lx - sz * 1.2, ly - sz * 5); g.stroke() }) } })(lx, ly, sz, S2[j].z) })
            lights.push({ x: lx - sz * 1.6, y: ly - sz * 5, w: sz * .9, h: sz * .7, r: sz * 7, t: tLamp + r() * 1.6, kind: 'lamp', z: S2[j].z })
          }
        }
        cars.push(S2.filter(function (p) { return p.v }))
      }

      /* las poblaciones */
      var towns = [
        { z: 125, dx: -22, n: 18, R: [32, 18], t: [4, 9], church: 'big', garland: true },
        { z: 205, dx: 34, n: 16, R: [32, 20], t: [3.6, 9], church: 'chapel', pitch: true },
        { z: 300, dx: -24, n: 14, R: [34, 22], t: [3.4, 9], church: 'chapel' },
        { z: 470, dx: 18, n: 58, R: [80, 44], t: [2.6, 8.8], church: 'cathedral', city: true }
      ]
      towns.forEach(function (tw) { tw.cx = xc(tw.z) + tw.dx })
      /* rio: brillos del agua */
      for (var gz = 60; gz < 560; gz += 2.5) { var gxr = xc(gz), pr2 = proj(gxr, ground(gxr, gz) + .1, gz); if (visible(pr2[0], pr2[1], gz)) glints.push({ x: pr2[0], y: pr2[1], s: scaleAt(gxr, gz), ph: r() * 6.28 }) }
      /* carreteras primero: las casas se colocan a sus lados */
      addRoad([[xc(70) - 8, 70], [towns[0].cx + 10, 125], [towns[1].cx - 8, 205], [towns[2].cx + 8, 300], [towns[3].cx, 470]], 9, 5.2)
      addRoad([[towns[0].cx - 22, 132], [xc(165) - 46, 170], [xc(215) - 52, 238]], 12, 6.3)
      /* iglesias en el centro de cada pueblo */
      towns.forEach(function (tw) {
        for (var tr = 0; tr < 40; tr++) {
          var cx2 = tw.cx + (r() - .5) * 14, cz = tw.z + (r() - .5) * 10, rr2 = tw.church === 'chapel' ? 8 : 12
          if (!inRiver(cx2, cz, rr2) && free(cx2, cz, rr2) && flat(cx2, cz, 6)) { if (addChurch(cx2, cz, tw.church)) { reserve(cx2, cz, rr2); tw.plaza = [cx2, cz] } break }
        }
      })
      /* casas: cada una en su parcela, sin solaparse */
      towns.forEach(function (tw) {
        var placed = 0
        for (var tr = 0; tr < tw.n * 40 && placed < tw.n; tr++) {
          var x = tw.cx + gauss(r) * tw.R[0] * .45, zq = tw.z + gauss(r) * tw.R[1] * .45
          var tallB = tw.city && r() < .4, w = tallB ? 7 + r() * 3 : 5 + r() * 3, d = 5 + r() * 3, rr2 = Math.max(w, d) * .62 + 1.2
          if (inRiver(x, zq, rr2) || !free(x, zq, rr2) || !flat(x, zq, rr2)) continue
          var ok = addHouse(x, zq, { w: w, d: d, h: tallB ? 10 + r() * 14 : (r() < .3 ? 6.5 : 4 + r() * 1.5), floors: tallB ? 3 + (r() * 4 | 0) : (r() < .3 ? 2 : 1), roof: tallB ? 'flat' : 'gable', t: tw.t, chim: !tw.city })
          if (ok) { reserve(x, zq, rr2); placed++ }
        }
        var c0 = proj(tw.cx, ground(tw.cx, tw.z), tw.z)
        domes.push({ x: c0[0], y: c0[1], r: (tw.city ? 320 : 100) * F / rs / tw.z, t: tw.city ? 3 : 4.5, a: tw.city ? .55 : .35 })
        /* guirnaldas de bombillas cruzando la plaza */
        if (tw.garland && tw.plaza) {
          for (var gi = 0; gi < 3; gi++) {
            var gz2 = tw.plaza[1] - 7 + gi * 2.5, A = proj(tw.plaza[0] - 9, ground(tw.plaza[0] - 9, gz2) + 5, gz2), B = proj(tw.plaza[0] + 11, ground(tw.plaza[0] + 11, gz2) + 5, gz2)
            var A0 = proj(tw.plaza[0] - 9, ground(tw.plaza[0] - 9, gz2), gz2), B0 = proj(tw.plaza[0] + 11, ground(tw.plaza[0] + 11, gz2), gz2)
            ops.push({ z: gz2, f: (function (A, B, A0, B0, zg) { return function () { both(function (g, P) { g.strokeStyle = 'rgba(' + P.line + ',.75)'; g.lineWidth = lw(zg, 20); g.beginPath(); g.moveTo(A0[0], A0[1]); g.lineTo(A[0], A[1]); g.moveTo(B0[0], B0[1]); g.lineTo(B[0], B[1]); g.stroke(); g.strokeStyle = 'rgba(' + P.line + ',.35)'; g.lineWidth = lw(zg, 12); g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 12, B[0], B[1]); g.stroke() }) } })(A, B, A0, B0, gz2) })
            for (var q = 0; q <= 1.0001; q += 1 / 12) lights.push({ x: lerp(A[0], B[0], q), y: lerp(A[1], B[1], q) + Math.sin(q * Math.PI) * 6, w: 1.5, h: 1.5, r: 6, t: 8.1 + (q * 7 % 1) * .6, kind: 'bulb', z: gz2 - .5 })
          }
        }
        /* campo de futbol con sus focos */
        if (tw.pitch) {
          for (var tr2 = 0; tr2 < 60; tr2++) {
            var px = tw.cx - 40 + (r() - .5) * 30, pz = tw.z + 14 + (r() - .5) * 20
            if (!inRiver(px + 9, pz + 5, 12) && free(px + 9, pz + 5, 11) && flat(px + 9, pz + 5, 9) && addField(px, pz, 18, 11, .15, 'campo')) {
              reserve(px + 9, pz + 5, 11)
              ;[[0, 0], [18, 0], [0, 11], [18, 11]].forEach(function (o) {
                var zf = pz + o[1], gq0 = ground(px + o[0], zf), pq = proj(px + o[0], gq0 + 8, zf), p0 = proj(px + o[0], gq0, zf)
                ops.push({ z: zf, f: function () { both(function (g, P) { var sz = lw(zf, 26); g.strokeStyle = 'rgba(' + P.line + ',.8)'; g.lineWidth = sz; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(pq[0], pq[1]); g.stroke(); g.fillStyle = P.dark; g.fillRect(pq[0] - 1.6, pq[1] - .4, 3.2, 1.8); g.strokeRect(pq[0] - 1.6, pq[1] - .4, 3.2, 1.8) }) } })
                lights.push({ x: pq[0] - 1, y: pq[1], w: 2, h: 1.2, r: 24, t: 8.4, kind: 'flood', z: zf - .5 })
              })
              break
            }
          }
        }
        /* luces sueltas de la ciudad del fondo (calles) */
        if (tw.city) for (var cl = 0; cl < 120; cl++) { var lx = tw.cx + gauss(r) * 44, lz = tw.z + gauss(r) * 28, lp = proj(lx, ground(lx, lz) + 1, lz); if (visible(lp[0], lp[1], lz) && !free(lx, lz, 0)) lights.push({ x: lp[0], y: lp[1], w: 1, h: 1, r: 4, t: 2.6 + r() * 6, kind: 'dot', z: lz }) }
      })
      /* cultivos alrededor de los pueblos */
      var types = ['vina', 'huerta', 'cereal', 'frutal', 'cereal', 'vina']
      for (var fi2 = 0, made = 0; fi2 < 400 && made < 34; fi2++) {
        var twn = towns[fi2 % 3], fz = twn.z + (r() - .5) * 110, fx = xc(fz) + (r() < .5 ? -1 : 1) * (12 + r() * 70), wx2 = 11 + r() * 13, wz2 = 9 + r() * 11, rr3 = Math.hypot(wx2, wz2) * .55
        if (fz < 75) continue
        if (inRiver(fx + wx2 / 2, fz + wz2 / 2, rr3) || !free(fx + wx2 / 2, fz + wz2 / 2, rr3) || !flat(fx + wx2 / 2, fz + wz2 / 2, rr3 * .7)) continue
        if (addField(fx, fz, wx2, wz2, (r() - .5) * .6, types[made % types.length])) { reserve(fx + wx2 / 2, fz + wz2 / 2, rr3); made++ }
      }
      /* casas de campo dispersas */
      for (var fh = 0, fhN = 0; fh < 300 && fhN < 10; fh++) { var hz = 80 + r() * 280, hx = xc(hz) + (r() < .5 ? -1 : 1) * (14 + r() * 80), rr4 = 6; if (!inRiver(hx, hz, rr4) && free(hx, hz, rr4) && flat(hx, hz, 4) && addHouse(hx, hz, { w: 6 + r() * 2, d: 5, h: 4.2, floors: 1, roof: 'gable', t: [5.5, 9], chim: true })) { reserve(hx, hz, rr4); fhN++ } }
      /* bosques: cercanos (pinos y frondosos) y grandes masas a lo lejos en las laderas */
      for (var tq = 0; tq < 3600; tq++) {
        var zq2 = 62 + Math.pow(r(), 1.25) * 310, sgn = r() < .5 ? -1 : 1, xq = xc(zq2) + sgn * (zq2 + 60) * ((zq2 < 140 ? .2 : .12) + r() * .55), clump = fbm(xq / 30, zq2 / 30, 2)
        if (clump < .34 || inRiver(xq, zq2, 2) || !free(xq, zq2, 1.3)) continue
        if (addTree(xq, zq2, r() < .78 ? 'pine' : 'leafy')) reserve(xq, zq2, 1)
      }
      for (var tf = 0; tf < 7000; tf++) {
        var zq3 = 240 + r() * 460, sg2 = r() < .5 ? -1 : 1, xq3 = xc(zq3) + sg2 * (zq3 + 60) * (.12 + r() * .6)
        if (fbm(xq3 / 45, zq3 / 45, 2) < .36 || inRiver(xq3, zq3, 3) || Math.hypot(xq3 - towns[3].cx, zq3 - towns[3].z) < 95) continue
        addTree(xq3, zq3, 'pine', 1.1)
      }
      /* dibujo: primero lo que esta a ras de suelo, luego todo lo demas del fondo hacia delante */
      groundOps.forEach(function (f) { f() })
      var mcv = mkCanvas(tD.width, tD.height); mc = mcv.getContext('2d'); mc.setTransform(rs, 0, 0, rs, 0, 0); mc.lineJoin = 'round'; mc.lineCap = 'round'; mc.globalCompositeOperation = 'destination-out'
      lights.forEach(function (l) { ops.push({ z: l.z - .01, l: l }) })
      ops.sort(function (a, b) { return b.z - a.z }).forEach(function (o) {
        if (!o.l) return o.f()
        mc.globalCompositeOperation = 'source-over'; mc.fillStyle = '#fff'; mc.fillRect(o.l.x + o.l.w / 2 - 1, o.l.y + o.l.h / 2 - 1, 2, 2); mc.globalCompositeOperation = 'destination-out'
      })
      var mdat = mc.getImageData(0, 0, mcv.width, mcv.height).data; mc = null
      lights = lights.filter(function (l) { var px2 = Math.round((l.x + l.w / 2) * rs), py2 = Math.round((l.y + l.h / 2) * rs); if (px2 < 0 || py2 < 0 || px2 >= mcv.width || py2 >= mcv.height) return false; return mdat[(py2 * mcv.width + px2) * 4 + 3] > 110 })
      sc.tD = tD; sc.tP = tP; sc.lights = lights; sc.domes = domes; sc.cars = cars.filter(function (c) { return c.length > 6 }); sc.smokes = smokes; sc.glints = glints

      /* ---- 3) primer plano: la ladera donde estamos, con hierba, flores, rocas, pinos y el equipo de observacion ---- */
      var FW = W + 24, fg = mkCanvas(FW * rs, H * rs), fc = fg.getContext('2d'); fc.setTransform(rs, 0, 0, rs, 0, 0); fc.lineJoin = 'round'; fc.lineCap = 'round'
      var e0 = .7 + .1 * tall
      var edgeY = function (u) { return H * (e0 + (1.1 - e0) * Math.pow(u, 1.35)) + Math.sin(u * 23) * 3 + Math.sin(u * 61) * 1.2 }
      var fgPath = new Path2D(); fgPath.moveTo(0, H + 4); for (var ui = 0; ui <= 1.0001; ui += .005) fgPath.lineTo(ui * FW, edgeY(ui)); fgPath.lineTo(FW, H + 4); fgPath.closePath()
      var gf = fc.createLinearGradient(0, H * e0, 0, H); gf.addColorStop(0, 'rgb(14,19,44)'); gf.addColorStop(1, 'rgb(5,7,18)'); fc.fillStyle = gf; fc.fill(fgPath)
      fc.save(); fc.clip(fgPath)
      ;[9, 20, 34, 52, 74].forEach(function (d, i) { fc.strokeStyle = 'rgba(79,92,156,' + (.42 - i * .07) + ')'; fc.lineWidth = .9; fc.beginPath(); for (var u2 = 0; u2 <= 1.0001; u2 += .01) { var yy = edgeY(u2) + d * (1 + u2 * .4); u2 ? fc.lineTo(u2 * FW, yy) : fc.moveTo(0, yy) } fc.stroke() })
      var rg = rng(77)
      /* hierba: matas mas grandes cuanto mas cerca (mas abajo) */
      for (var gq = 0; gq < 360; gq++) {
        var u3 = rg(), base3 = edgeY(u3), dy3 = Math.pow(rg(), 2) * (H - base3 + 10), gxq = u3 * FW, gyq = base3 + dy3, kq = 1 + dy3 / 40
        fc.strokeStyle = 'rgba(110,126,204,' + (.28 + rg() * .3) + ')'; fc.lineWidth = .6 + kq * .2; fc.beginPath()
        for (var bl = 0; bl < 3; bl++) { var len = (3 + rg() * 6) * kq, lean = (rg() - .5) * 5 * kq; fc.moveTo(gxq + bl * kq, gyq); fc.quadraticCurveTo(gxq + bl * kq + lean * .3, gyq - len * .6, gxq + bl * kq + lean, gyq - len) }
        fc.stroke()
      }
      /* flores pequenas */
      for (var fq = 0; fq < 30; fq++) { var u5 = rg(), fy = edgeY(u5) + Math.pow(rg(), 1.5) * Math.max(0, H - edgeY(u5)), fx2 = u5 * FW, fs = Math.max(.5, 1 + (fy - edgeY(u5)) / 60); fc.fillStyle = rg() < .5 ? 'rgba(207,214,255,.75)' : 'rgba(185,201,255,.6)'; for (var pe = 0; pe < 5; pe++) { var an = pe / 5 * 6.283; fc.beginPath(); fc.arc(fx2 + Math.cos(an) * fs * 1.2, fy - 6 * fs + Math.sin(an) * fs * 1.2, fs * .8, 0, 6.283); fc.fill() } fc.strokeStyle = 'rgba(110,126,204,.6)'; fc.lineWidth = .7; fc.beginPath(); fc.moveTo(fx2, fy); fc.lineTo(fx2, fy - 5 * fs); fc.stroke() }
      /* rocas con grietas */
      for (var rq = 0; rq < 7; rq++) { var u4 = .05 + rq * .14 + rg() * .05, rx = u4 * FW, ry = edgeY(u4) + 8 + rg() * 24, rr = 6 + rg() * 12; fc.fillStyle = 'rgb(12,16,38)'; fc.strokeStyle = 'rgba(110,126,204,.85)'; fc.lineWidth = 1.1; fc.beginPath(); fc.moveTo(rx - rr, ry); fc.quadraticCurveTo(rx - rr * .9, ry - rr * .7, rx - rr * .2, ry - rr * .62); fc.quadraticCurveTo(rx + rr * .6, ry - rr * .8, rx + rr, ry); fc.closePath(); fc.fill(); fc.stroke(); fc.strokeStyle = 'rgba(79,92,156,.7)'; fc.lineWidth = .7; fc.beginPath(); fc.moveTo(rx - rr * .2, ry - rr * .6); fc.lineTo(rx - rr * .05, ry - rr * .3); fc.lineTo(rx - rr * .25, ry - rr * .05); fc.stroke() }
      fc.restore()
      fc.strokeStyle = 'rgba(120,136,212,.95)'; fc.lineWidth = 1.5; fc.beginPath(); for (ui = 0; ui <= 1.0001; ui += .005) { ui ? fc.lineTo(ui * FW, edgeY(ui)) : fc.moveTo(0, edgeY(0)) } fc.stroke()
      /* pinos grandes a la izquierda */
      var PF = PAL[0]
      ;[[2, 1.3], [34, .95], [-14, .8]].forEach(function (pt) { var by = edgeY(Math.max(0, pt[0]) / FW) + 10; pine(fc, PF, pt[0], by, H * .34 * pt[1], 1) })
      /* telescopio en montura ecuatorial, sobre tripode, con buscador y ocular */
      var tsz = clamp(Math.min(W, H) / 560, .5, 1.15), tu = .3, tx0 = FW * tu, ty0 = edgeY(tu) + 14 * tsz
      var L2 = 'rgba(185,201,255,.95)', FD = 'rgb(10,14,34)'
      fc.strokeStyle = L2; fc.fillStyle = FD; fc.lineWidth = 1.4
      var hx2 = tx0, hy2 = ty0 - 58 * tsz
      ;[[-30, 6], [27, 4], [4, 12]].forEach(function (lg) { fc.beginPath(); fc.moveTo(hx2, hy2 + 4 * tsz); fc.lineTo(tx0 + lg[0] * tsz, ty0 + lg[1] * tsz); fc.stroke(); fc.beginPath(); fc.arc(tx0 + lg[0] * tsz, ty0 + lg[1] * tsz, 1.6 * tsz, 0, 6.283); fc.fill(); fc.stroke() })
      fc.beginPath(); fc.moveTo(tx0 - 13 * tsz, ty0 - 22 * tsz); fc.lineTo(tx0 + 12 * tsz, ty0 - 23 * tsz); fc.lineTo(tx0 + 2 * tsz, ty0 - 18 * tsz); fc.closePath(); fc.fill(); fc.stroke()
      fc.beginPath(); fc.rect(hx2 - 6 * tsz, hy2 - 4 * tsz, 12 * tsz, 9 * tsz); fc.fill(); fc.stroke()
      fc.save(); fc.translate(hx2, hy2 - 4 * tsz); fc.rotate(-.62)
      fc.beginPath(); fc.moveTo(0, 0); fc.lineTo(0, 30 * tsz); fc.stroke(); fc.beginPath(); fc.arc(0, 30 * tsz, 5 * tsz, 0, 6.283); fc.fill(); fc.stroke()
      fc.beginPath(); fc.rect(-30 * tsz, -14 * tsz, 66 * tsz, 13 * tsz); fc.fill(); fc.stroke()
      fc.beginPath(); fc.rect(36 * tsz, -15.5 * tsz, 14 * tsz, 16 * tsz); fc.fill(); fc.stroke()
      fc.beginPath(); fc.ellipse(50 * tsz, -7.5 * tsz, 2.4 * tsz, 8 * tsz, 0, 0, 6.283); fc.fill(); fc.stroke()
      fc.beginPath(); fc.rect(-12 * tsz, -21 * tsz, 22 * tsz, 4.5 * tsz); fc.fill(); fc.stroke()
      fc.beginPath(); fc.moveTo(-6 * tsz, -16.5 * tsz); fc.lineTo(-6 * tsz, -14 * tsz); fc.moveTo(5 * tsz, -16.5 * tsz); fc.lineTo(5 * tsz, -14 * tsz); fc.stroke()
      fc.beginPath(); fc.rect(-36 * tsz, -11 * tsz, 6 * tsz, 7 * tsz); fc.fill(); fc.stroke()
      fc.beginPath(); fc.moveTo(-36 * tsz, -7.5 * tsz); fc.lineTo(-42 * tsz, -2 * tsz); fc.lineTo(-40 * tsz, 2 * tsz); fc.stroke()
      ;[-18, 2, 22].forEach(function (q) { fc.beginPath(); fc.moveTo(q * tsz, -14 * tsz); fc.lineTo(q * tsz, -1 * tsz); fc.stroke() })
      fc.restore()
      /* silla plegable y maletin del equipo */
      var chx = tx0 + 70 * tsz, chy = edgeY((tu * FW + 70 * tsz) / FW) + 18 * tsz
      fc.strokeStyle = L2; fc.lineWidth = 1.3; fc.fillStyle = FD
      fc.beginPath(); fc.moveTo(chx - 12 * tsz, chy); fc.lineTo(chx + 10 * tsz, chy - 20 * tsz); fc.moveTo(chx + 12 * tsz, chy); fc.lineTo(chx - 10 * tsz, chy - 20 * tsz); fc.stroke()
      fc.beginPath(); fc.moveTo(chx - 12 * tsz, chy - 20 * tsz); fc.lineTo(chx + 12 * tsz, chy - 20 * tsz); fc.lineTo(chx + 14 * tsz, chy - 38 * tsz); fc.lineTo(chx - 9 * tsz, chy - 36 * tsz); fc.closePath(); fc.fill(); fc.stroke()
      var bx = tx0 - 48 * tsz, by2 = edgeY((tu * FW - 48 * tsz) / FW) + 20 * tsz
      fc.beginPath(); fc.rect(bx - 12 * tsz, by2 - 12 * tsz, 24 * tsz, 12 * tsz); fc.fill(); fc.stroke(); fc.beginPath(); fc.moveTo(bx - 4 * tsz, by2 - 12 * tsz); fc.lineTo(bx - 4 * tsz, by2 - 15 * tsz); fc.lineTo(bx + 4 * tsz, by2 - 15 * tsz); fc.lineTo(bx + 4 * tsz, by2 - 12 * tsz); fc.stroke(); fc.beginPath(); fc.moveTo(bx - 12 * tsz, by2 - 7 * tsz); fc.lineTo(bx + 12 * tsz, by2 - 7 * tsz); fc.stroke()
      sc.fg = fg

      /* ---- 4) cielo: estrellas por magnitudes, Via Lactea y objetos de cielo profundo (texturas) ---- */
      var M = Math.min(W, H), skyH = H * .78
      var rs2 = rng(5), starCols = [[219, 231, 255], [255, 241, 208], [255, 210, 168], [184, 204, 255], [235, 240, 255]]
      var colOf = function () { var q = rs2(); return starCols[q < .5 ? 4 : q < .72 ? 1 : q < .84 ? 0 : q < .94 ? 2 : 3] }
      /* bandas de magnitud: las mas debiles solo aparecen con cielos oscuros */
      var BANDS = [{ n: 50, s: 1.25, a: .95, L: 9.5 }, { n: 120, s: 1, a: .85, L: 7.6 }, { n: 260, s: .85, a: .75, L: 6.4 }, { n: 480, s: .7, a: .65, L: 5.2 }, { n: 800, s: .6, a: .55, L: 4 }, { n: 1300, s: .5, a: .5, L: 2.8 }]
      sc.bands = BANDS.map(function (bd) {
        var c = mkCanvas(W * rs, skyH * rs), g = c.getContext('2d'); g.setTransform(rs, 0, 0, rs, 0, 0)
        for (var i = 0; i < bd.n; i++) { var col = colOf(); g.fillStyle = rgb(col, bd.a * (.6 + .4 * rs2())); var x = rs2() * W, y = Math.pow(rs2(), 1.15) * skyH; g.beginPath(); g.arc(x, y, bd.s * (.7 + .5 * rs2()), 0, 6.283); g.fill() }
        return { c: c, L: bd.L }
      })
      /* estrellas brillantes dinamicas (parpadean, con picos de difraccion) */
      sc.bright = []; for (var bi = 0; bi < 28; bi++) sc.bright.push({ x: rs2() * W, y: Math.pow(rs2(), 1.2) * skyH * .92, s: 1.4 + rs2() * 1.4, col: colOf(), ph: rs2() * 6.3, sp: 1 + rs2() * 2.5, L: 6 + rs2() * 3.4 })
      /* Via Lactea: miles de estrellas en una banda con grumos, nucleo calido y grietas de polvo oscuro */
      var mwC = mkCanvas(W * rs, skyH * rs), mg = mwC.getContext('2d'); mg.setTransform(rs, 0, 0, rs, 0, 0)
      var mwP = function (p) { var a = [-.08 * W, skyH * .6], bq = [.42 * W, -.16 * skyH], c = [1.08 * W, skyH * .14]; return [(1 - p) * (1 - p) * a[0] + 2 * (1 - p) * p * bq[0] + p * p * c[0], (1 - p) * (1 - p) * a[1] + 2 * (1 - p) * p * bq[1] + p * p * c[1]] }
      var mwN = function (p) { var e = .002, a = mwP(p - e), bq = mwP(p + e), dx = bq[0] - a[0], dy = bq[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l] }
      sc.mwP = mwP
      var bw = M * .16
      for (var gb = 0; gb < 150; gb++) {
        var p = rs2(), c0 = mwP(p), nrm = mwN(p), off = gauss(rs2) * .3 * bw, cxq = c0[0] + nrm[0] * off, cyq = c0[1] + nrm[1] * off, rad = bw * (.5 + rs2() * .7)
        var warm = sstep(.25, .45, p) * (1 - sstep(.5, .7, p)), gr = mg.createRadialGradient(cxq, cyq, 0, cxq, cyq, rad)
        gr.addColorStop(0, warm > .3 ? 'rgba(255,236,206,.07)' : 'rgba(200,210,255,.06)'); gr.addColorStop(1, 'rgba(160,170,230,0)')
        mg.fillStyle = gr; mg.fillRect(cxq - rad, cyq - rad, rad * 2, rad * 2)
      }
      for (var ms = 0; ms < 9000; ms++) {
        var p2 = rs2(), q2 = gauss(rs2) * .38, cc = mwP(p2), nn2 = mwN(p2), clump = fbm(p2 * 14, q2 * 4 + 7, 3)
        if (rs2() > clump * 1.5) continue
        var warm2 = sstep(.25, .45, p2) * (1 - sstep(.5, .7, p2))
        mg.fillStyle = warm2 > .4 && rs2() < .6 ? 'rgba(255,238,210,' + (.25 + rs2() * .45) + ')' : 'rgba(215,224,255,' + (.2 + rs2() * .45) + ')'
        mg.fillRect(cc[0] + nn2[0] * q2 * bw, cc[1] + nn2[1] * q2 * bw, rs2() < .1 ? 1.4 : .9, rs2() < .1 ? 1.4 : .9)
      }
      mg.globalCompositeOperation = 'destination-out'
      for (var dl = 0; dl < 320; dl++) {
        var p3 = .05 + rs2() * .9, c3 = mwP(p3), n3 = mwN(p3), o3 = (fbm(p3 * 9, 3, 2) - .5) * .5 * bw + gauss(rs2) * .05 * bw, rr3 = bw * (.03 + rs2() * .08)
        var g3 = mg.createRadialGradient(c3[0] + n3[0] * o3, c3[1] + n3[1] * o3, 0, c3[0] + n3[0] * o3, c3[1] + n3[1] * o3, rr3); g3.addColorStop(0, 'rgba(0,0,0,.38)'); g3.addColorStop(1, 'rgba(0,0,0,0)')
        mg.fillStyle = g3; mg.fillRect(c3[0] + n3[0] * o3 - rr3, c3[1] + n3[1] * o3 - rr3, rr3 * 2, rr3 * 2)
      }
      mg.globalCompositeOperation = 'source-over'; sc.mw = mwC; sc.bw = bw
      /* objetos de cielo profundo, cada uno en su textura */
      var objTex = function (sz, fn) { var c = mkCanvas(sz * 2 * rs, sz * 2 * rs), g = c.getContext('2d'); g.setTransform(rs, 0, 0, rs, 0, 0); g.translate(sz, sz); fn(g, sz); return c }
      var andro = objTex(M * .14, function (g, R) {
        g.save(); g.rotate(-.5); g.scale(1, .32)
        for (var i = 10; i >= 1; i--) { var q = i / 10, gr2 = g.createRadialGradient(0, 0, 0, 0, 0, R * q); gr2.addColorStop(0, 'rgba(255,246,228,' + (.09 / q) + ')'); gr2.addColorStop(1, 'rgba(170,165,230,0)'); g.fillStyle = gr2; g.beginPath(); g.arc(0, 0, R * q, 0, 6.283); g.fill() }
        g.strokeStyle = 'rgba(10,12,30,.55)'; g.lineWidth = R * .035; [.55, .72].forEach(function (q) { g.beginPath(); g.ellipse(0, -R * .05, R * q, R * q * .55, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke() })
        g.strokeStyle = 'rgba(138,180,255,.35)'; g.lineWidth = R * .012; g.beginPath(); g.ellipse(0, 0, R * .88, R * .88 * .6, 0, 0, 6.283); g.stroke()
        g.restore()
        g.fillStyle = 'rgba(255,248,232,.95)'; g.beginPath(); g.arc(0, 0, R * .04, 0, 6.283); g.fill()
        var sat = function (x, y, r2, e) { var gr3 = g.createRadialGradient(x, y, 0, x, y, r2); gr3.addColorStop(0, 'rgba(240,236,255,.55)'); gr3.addColorStop(1, 'rgba(200,200,255,0)'); g.save(); g.translate(x, y); g.scale(1, e); g.translate(-x, -y); g.fillStyle = gr3; g.beginPath(); g.arc(x, y, r2, 0, 6.283); g.fill(); g.restore() }
        sat(R * .22, -R * .02, R * .08, 1); sat(-R * .32, -R * .36, R * .12, .55)
      })
      var orion = objTex(M * .12, function (g, R) {
        var rq = rng(44)
        for (var i = 0; i < 130; i++) {
          var ang = -1.9 + rq() * 3.8, dist = Math.pow(rq(), .7) * R * .85, x = Math.cos(ang) * dist * (ang < 0 ? 1 : .9), y = Math.sin(ang) * dist * .75 + R * .1
          var red = rq() < .7, gr2 = g.createRadialGradient(x, y, 0, x, y, R * (.12 + rq() * .2))
          gr2.addColorStop(0, red ? 'rgba(255,110,150,.11)' : 'rgba(150,180,255,.09)'); gr2.addColorStop(1, 'rgba(255,120,160,0)')
          g.fillStyle = gr2; g.beginPath(); g.arc(x, y, R * .32, 0, 6.283); g.fill()
        }
        var core = g.createRadialGradient(0, 0, 0, 0, 0, R * .22); core.addColorStop(0, 'rgba(210,250,255,.75)'); core.addColorStop(.5, 'rgba(150,220,235,.25)'); core.addColorStop(1, 'rgba(150,220,235,0)')
        g.fillStyle = core; g.beginPath(); g.arc(0, 0, R * .22, 0, 6.283); g.fill()
        g.fillStyle = 'rgba(6,8,20,.55)'; g.beginPath(); g.ellipse(-R * .2, -R * .1, R * .12, R * .2, .5, 0, 6.283); g.fill()
        g.fillStyle = 'rgba(255,255,255,.95)'; [[0, 0], [2.4, 1.4], [-2.2, 1.6], [.8, -2.2]].forEach(function (q) { g.beginPath(); g.arc(q[0], q[1], 1.1, 0, 6.283); g.fill() })
        var m43 = g.createRadialGradient(R * .05, -R * .55, 0, R * .05, -R * .55, R * .14); m43.addColorStop(0, 'rgba(255,140,170,.35)'); m43.addColorStop(1, 'rgba(255,140,170,0)'); g.fillStyle = m43; g.beginPath(); g.arc(R * .05, -R * .55, R * .14, 0, 6.283); g.fill()
      })
      var pleia = objTex(M * .09, function (g, R) {
        var st2 = [[0, 0, 2.6], [-.42, .18, 2.2], [.34, .28, 2.4], [.6, -.12, 1.9], [-.66, -.22, 1.8], [.18, -.36, 2.1], [-.18, .48, 1.6], [.05, .2, 1.3], [-.3, -.45, 1.2]]
        var rq = rng(21); for (var i = 0; i < 22; i++) { g.save(); g.rotate(.35 + (rq() - .5) * .5); g.translate((rq() - .5) * R * .6, (rq() - .5) * R * .6); g.scale(1, .22 + rq() * .2); var gr2 = g.createRadialGradient(0, 0, 0, 0, 0, R * (.45 + rq() * .4)); gr2.addColorStop(0, 'rgba(140,185,255,.09)'); gr2.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = gr2; g.beginPath(); g.arc(0, 0, R * .85, 0, 6.283); g.fill(); g.restore() }
        st2.forEach(function (s) {
          var x = s[0] * R, y = s[1] * R, gr2 = g.createRadialGradient(x, y, 0, x, y, s[2] * 6); gr2.addColorStop(0, 'rgba(170,205,255,.85)'); gr2.addColorStop(1, 'rgba(170,205,255,0)')
          g.fillStyle = gr2; g.beginPath(); g.arc(x, y, s[2] * 6, 0, 6.283); g.fill()
          g.strokeStyle = 'rgba(200,220,255,.5)'; g.lineWidth = .7; g.beginPath(); g.moveTo(x - s[2] * 5, y); g.lineTo(x + s[2] * 5, y); g.moveTo(x, y - s[2] * 5); g.lineTo(x, y + s[2] * 5); g.stroke()
          g.fillStyle = 'rgba(240,247,255,1)'; g.beginPath(); g.arc(x, y, s[2] * .6, 0, 6.283); g.fill()
        })
      })
      var glob = objTex(M * .05, function (g, R) {
        var gr2 = g.createRadialGradient(0, 0, 0, 0, 0, R); gr2.addColorStop(0, 'rgba(255,248,226,.85)'); gr2.addColorStop(.35, 'rgba(230,226,255,.28)'); gr2.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = gr2; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill()
        var rq = rng(9); for (var i = 0; i < 420; i++) { var an = rq() * 6.283, d = Math.abs(gauss(rq)) * R * .32; g.fillStyle = 'rgba(245,240,255,' + (.3 + rq() * .6) + ')'; g.fillRect(Math.cos(an) * d, Math.sin(an) * d, .8, .8) }
      })
      sc.objs = [
        { k: 'Galaxia de Andrómeda', c: andro, x: .2 * W, y: .2 * skyH, R: M * .14, L: 5 },
        { k: 'Pléyades', c: pleia, x: .55 * W, y: .1 * skyH, R: M * .09, L: 7.6 },
        { k: 'Nebulosa de Orión', c: orion, x: .8 * W, y: .3 * skyH, R: M * .12, L: 6.4 },
        { k: 'Cúmulo globular', c: glob, x: .38 * W, y: .3 * skyH, R: M * .05, L: 4.2 }
      ]
      /* la constelacion de Orion alrededor de su nebulosa (estrellas y lineas finas) */
      var oc = sc.objs[2], u = M * .07
      sc.orionStars = [[-1.2, -2.6, [255, 196, 150], 2.4], [1.3, -2.4, [205, 220, 255], 1.9], [-.55, -.65, [220, 230, 255], 1.6], [0, -.75, [220, 230, 255], 1.7], [.55, -.88, [220, 230, 255], 1.6], [-1.1, 2.2, [215, 225, 255], 1.8], [1.4, 2.3, [180, 200, 255], 2.5]].map(function (s) { return { x: oc.x + s[0] * u, y: oc.y + s[1] * u, col: s[2], s: s[3] } })
      sc.orionLines = [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]]
      return sc
    }

    /* imagen fija del mismo paisaje (nivel 5) que se ve al instante mientras se calcula el dibujo animado */
    function placeholder() {
      var p = W / H > 1 ? PH.a : PH.t, k = Math.max(W / p.w, H / p.h), w = p.w * k, h = p.h * k
      host.style.background = '#05060f url(' + p.src + ') ' + Math.round((W - w) / 2) + 'px ' + Math.round(H - h) + 'px/' + Math.round(w) + 'px ' + Math.round(h) + 'px no-repeat'
    }
    function resize() {
      var r = cv.getBoundingClientRect(); W = Math.max(40, Math.round(r.width)); H = Math.max(40, Math.round(r.height))
      var dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      var h = lv.clientHeight, bd = clamp(h / 9 - 4, 14, 30)
      side.style.setProperty('--bd', bd + 'px')
      host.classList.toggle('bz-root-short', side.clientHeight < 440); host.classList.toggle('bz-root-tiny', side.clientHeight < 300)
      /* la escena se reconstruye poco despues (evita rehacerla en cada paso de un redimensionado) */
      /* si ya se construyo un paisaje de este mismo tamano (p. ej. al volver a abrir la seccion), se reutiliza al instante */
      if (!shown) placeholder()
      var key = W + 'x' + H + '@' + Math.min(1.5, window.devicePixelRatio || 1)
      if (CACHE && CACHE.key === key) { clearTimeout(buildT); S = CACHE.sc; return }
      /* si hay uno de tamano parecido (p. ej. el movil ha escondido su barra), se ensena ya y se rehace con calma despues */
      var near = !S && CACHE && Math.abs(CACHE.W - W) / W < .15 && Math.abs(CACHE.H - H) / H < .15
      if (near) S = CACHE.sc
      clearTimeout(buildT); buildT = setTimeout(function () { if (!dead) { S = build(); CACHE = { key: key, sc: S, W: W, H: H }; BUILDS++ } }, near ? 2600 : S ? 140 : Math.max(30, BDU - Date.now()))
    }

    /* =====================================================================================================
       DIBUJO DE CADA FOTOGRAMA
       ===================================================================================================== */
    var on = function (t, L) { return sstep(t - .8, t + .05, L) }
    function draw(now) {
      var L = cur, t = (now - t0) / 1000, k = (L - 1) / 8, dpr = cv.width / W, sc = S
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      /* cielo */
      var top = mix([2, 3, 11], [36, 35, 58], Math.pow(k, 1.2)), hor = mix([10, 14, 36], [136, 106, 58], Math.pow(k, 1.45))
      var gs = ctx.createLinearGradient(0, 0, 0, sc.Hy * 1.15); gs.addColorStop(0, rgb(top)); gs.addColorStop(1, rgb(hor))
      ctx.fillStyle = gs; ctx.fillRect(0, 0, W, H)
      var sx = -(mx - .5) * 6
      /* luz zodiacal y resplandor nocturno (solo en los cielos mas oscuros) */
      var zod = clamp((3.2 - L) / 2)
      if (zod > 0) {
        ctx.save(); ctx.globalAlpha = zod * .55; var zg = ctx.createLinearGradient(W * .05, sc.Hy, W * .35, sc.Hy * .1); zg.addColorStop(0, 'rgba(230,226,205,.22)'); zg.addColorStop(1, 'rgba(230,226,205,0)')
        ctx.fillStyle = zg; ctx.beginPath(); ctx.moveTo(-W * .1, sc.Hy * 1.05); ctx.lineTo(W * .45, sc.Hy * 1.05); ctx.lineTo(W * .28, 0); ctx.closePath(); ctx.fill()
        var ag = ctx.createLinearGradient(0, sc.Hy * .55, 0, sc.Hy * 1.1); ag.addColorStop(0, 'rgba(110,220,170,0)'); ag.addColorStop(1, 'rgba(110,220,170,.07)'); ctx.fillStyle = ag; ctx.fillRect(0, sc.Hy * .55, W, sc.Hy * .6)
        ctx.restore()
      }
      /* estrellas por magnitudes */
      sc.bands.forEach(function (bd) { var a = sstep(bd.L + 1.1, bd.L - .3, L); if (a > 0) { ctx.globalAlpha = a; ctx.drawImage(bd.c, sx * .6, 0, W, H * .78) } })
      /* Via Lactea */
      var mwA = clamp((6.4 - L) / 3.6)
      if (mwA > 0) { ctx.globalAlpha = mwA; ctx.drawImage(sc.mw, sx * .6, 0, W, H * .78) }
      /* objetos de cielo profundo */
      sc.objs.forEach(function (o) {
        var a = clamp((o.L - L) / 1.7); o.a = a; if (a <= 0) return
        ctx.globalAlpha = a; ctx.drawImage(o.c, o.x - o.R + sx * .6, o.y - o.R, o.R * 2, o.R * 2)
      })
      ctx.globalAlpha = 1
      /* Orion: lineas de la constelacion y sus estrellas */
      var orA = clamp((7.6 - L) / 2)
      if (orA > 0) {
        ctx.strokeStyle = 'rgba(79,92,156,' + .5 * orA + ')'; ctx.lineWidth = .8; ctx.beginPath()
        sc.orionLines.forEach(function (l) { var a = sc.orionStars[l[0]], b = sc.orionStars[l[1]]; ctx.moveTo(a.x + sx * .6, a.y); ctx.lineTo(b.x + sx * .6, b.y) }); ctx.stroke()
      }
      var star = function (x, y, s, col, a) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, s * 4); g.addColorStop(0, rgb(col, .55 * a)); g.addColorStop(1, rgb(col, 0))
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 4, 0, 6.283); ctx.fill()
        ctx.fillStyle = rgb(col, a); ctx.beginPath(); ctx.arc(x, y, s * .65, 0, 6.283); ctx.fill()
        if (s > 1.9) { ctx.strokeStyle = rgb(col, .4 * a); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - s * 5, y); ctx.lineTo(x + s * 5, y); ctx.moveTo(x, y - s * 5); ctx.lineTo(x, y + s * 5); ctx.stroke() }
      }
      sc.orionStars.forEach(function (s) { star(s.x + sx * .6, s.y, s.s, s.col, Math.max(.35, orA)) })
      sc.bright.forEach(function (s) {
        var a = sstep(s.L + .6, s.L - .4, L) * .5 + .5 * (L < s.L ? 1 : .25)
        var tw = reduce ? 1 : .75 + .25 * Math.sin(t * s.sp + s.ph)
        star(s.x + sx * .6, s.y, s.s, s.col, a * tw)
      })
      /* estrella fugaz */
      if (!reduce && L <= 4.6) {
        if (!shoot && now - t0 > nextShoot) { shoot = { x: (.15 + Math.random() * .6) * W, y: (.04 + Math.random() * .2) * H, t: now }; nextShoot = now - t0 + 5500 + Math.random() * 5000 }
        if (shoot) {
          var q = (now - shoot.t) / 850
          if (q >= 1) shoot = null
          else { var hx = shoot.x + q * W * .22, hy = shoot.y + q * H * .09, tx = hx - W * .07 * Math.min(1, q * 3), ty = hy - H * .03 * Math.min(1, q * 3); var sg = ctx.createLinearGradient(tx, ty, hx, hy); sg.addColorStop(0, 'rgba(219,231,255,0)'); sg.addColorStop(1, 'rgba(240,246,255,' + (1 - q) + ')'); ctx.strokeStyle = sg; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke() }
        }
      } else shoot = null
      /* avion con luces intermitentes (cuando hay algo de luz en el cielo) */
      if (!reduce && L >= 2.5) {
        if (!plane && now - t0 > nextPlane) { plane = { y: (.08 + Math.random() * .22) * H, t: now, dir: Math.random() < .5 ? 1 : -1 }; nextPlane = now - t0 + 22000 + Math.random() * 14000 }
        if (plane) {
          var pq = (now - plane.t) / 26000
          if (pq >= 1) plane = null
          else {
            var px2 = plane.dir > 0 ? pq * (W + 40) - 20 : W + 20 - pq * (W + 40), py2 = plane.y - pq * H * .04, blink = ((now - plane.t) % 1300) < 110
            ctx.fillStyle = 'rgba(235,240,255,.8)'; ctx.fillRect(px2 - .8, py2 - .8, 1.6, 1.6)
            if (blink) { var bg = ctx.createRadialGradient(px2, py2, 0, px2, py2, 6); bg.addColorStop(0, 'rgba(255,255,255,.95)'); bg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(px2, py2, 6, 0, 6.283); ctx.fill() }
          }
        }
      }
      /* resplandor de los pueblos en el cielo */
      ctx.globalCompositeOperation = 'lighter'
      sc.domes.forEach(function (d) {
        var a = sstep(d.t, 9.2, L) * d.a; if (a <= 0) return
        var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r); g.addColorStop(0, 'rgba(248,210,120,' + a + ')'); g.addColorStop(.4, 'rgba(240,180,90,' + a * .35 + ')'); g.addColorStop(1, 'rgba(240,170,80,0)')
        ctx.fillStyle = g; ctx.fillRect(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2)
      })
      ctx.globalCompositeOperation = 'source-over'
      /* terreno: version oscura y version iluminada por la contaminacion, mezcladas segun el nivel */
      ctx.drawImage(sc.tD, 0, 0, W, H)
      var pk = Math.pow(k, 1.15); if (pk > .01) { ctx.globalAlpha = pk; ctx.drawImage(sc.tP, 0, 0, W, H); ctx.globalAlpha = 1 }
      /* luces */
      var G = glowSprite()
      sc.lights.forEach(function (l) {
        var a = on(l.t, L); if (a <= 0) return
        if (l.w > 0) { ctx.fillStyle = 'rgba(248,216,116,' + a + ')'; ctx.fillRect(l.x, l.y, l.w, l.h) }
      })
      ctx.globalCompositeOperation = 'lighter'
      sc.lights.forEach(function (l) {
        var a = on(l.t, L); if (a <= 0) return
        var rr = l.r * (l.kind === 'flood' ? 1.3 : 1); ctx.globalAlpha = a * (l.kind === 'win' ? .5 : l.kind === 'dot' ? .7 : .85)
        ctx.drawImage(G, l.x + l.w / 2 - rr, l.y + l.h / 2 - rr, rr * 2, rr * 2)
      })
      /* coches con los faros encendidos por las carreteras */
      var ca = on(7.2, L)
      if (ca > 0) sc.cars.forEach(function (path, ci) {
        for (var n = 0; n < 2; n++) {
          var f = ((t * (.025 + ci * .008) + n * .5 + ci * .3) % 1), i0 = Math.floor(f * (path.length - 1)), fr = f * (path.length - 1) - i0, a = path[i0], b = path[Math.min(path.length - 1, i0 + 1)]
          var x = lerp(a.x, b.x, fr), y = lerp(a.y, b.y, fr), sz = clamp(50 / lerp(a.z, b.z, fr), .6, 2.2)
          ctx.globalAlpha = ca * .9; ctx.drawImage(G, x - sz * 5, y - sz * 5 - sz, sz * 10, sz * 10)
        }
      })
      /* brillos en el agua del rio: plateados con cielo oscuro, amarillos con contaminacion */
      sc.glints.forEach(function (gl) {
        var fl = Math.max(0, Math.sin(t * 1.6 + gl.ph)); if (fl < .2) return
        var col = L > 5 ? '248,216,116' : '200,214,255', a = (.12 + .45 * fl) * (L > 5 ? sstep(5, 9, L) * .9 + .25 : .5)
        ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(' + col + ',' + a + ')'; ctx.fillRect(gl.x - gl.s * .7, gl.y, gl.s * 1.4, Math.max(.6, gl.s * .18))
      })
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
      /* humo de las chimeneas, iluminado por las luces del pueblo */
      if (!reduce) sc.smokes.forEach(function (sm) {
        for (var n = 0; n < 4; n++) {
          var ph = (t * .07 + sm.ph + n / 4) % 1, rr = sm.s * (.5 + ph * 2.2), x = sm.x + Math.sin(ph * 3 + sm.ph * 6) * sm.s * .8 + ph * sm.s * 2, y = sm.y - ph * sm.s * 9
          ctx.fillStyle = 'rgba(' + (L > 5 ? '230,215,180' : '190,200,230') + ',' + (.1 * (1 - ph) * (.35 + .65 * k)) + ')'; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill()
        }
      })
      /* bruma amarilla de la contaminacion */
      var fog = sstep(4.5, 9, L) * .3
      if (fog > 0) { var fg = ctx.createLinearGradient(0, sc.Hy * .6, 0, H); fg.addColorStop(0, 'rgba(248,216,116,0)'); fg.addColorStop(.35, 'rgba(248,210,120,' + fog * .8 + ')'); fg.addColorStop(1, 'rgba(240,200,110,' + fog * .3 + ')'); ctx.fillStyle = fg; ctx.fillRect(0, sc.Hy * .6, W, H) }
      /* primer plano: la ladera donde estamos */
      ctx.drawImage(sc.fg, -12 - sx * 1.6, 0, W + 24, H)
      if (fog > 0) { ctx.globalAlpha = fog * .5; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgb(60,48,26)'; ctx.fillRect(0, H * .7, W, H * .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 }
    }

    function frame(now) {
      if (dead) return
      if (!cv.isConnected) { dead = true; return }
      if (S && W > 0) {
        cur += (target - cur) * .09
        if (Math.abs(target - cur) < .004) cur = target
        /* en reposo (nivel fijo y sin mover el raton) basta con 30 fotogramas por segundo: menos consumo */
        var idle = cur === target && mx === lastMx; lastMx = mx
        if (!idle || now - lastDraw > 31) { lastDraw = now; draw(now) }
      } else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height) }
      /* en cuanto hay paisaje calculado, sustituye a la imagen fija con un fundido corto */
      if (S && W > 0 && !shown) { shown = true; cv.style.opacity = '1'; setTimeout(function () { if (!dead) host.style.background = '' }, 700) }
      raf = requestAnimationFrame(frame)
    }

    /* raton: solo un paralaje suave del cielo y del primer plano (en el dibujo no se puede seleccionar nada) */
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = clamp((e.clientX - r.left) / r.width) })
    cv.addEventListener('pointerleave', function () { mx = .5 })
    var onLang = function () { texts() }
    window.addEventListener('vc-lang', onLang)
    var ro = null
    try { ro = new ResizeObserver(resize); ro.observe(host); ro.observe(lv) } catch (e) { window.addEventListener('resize', resize) }
    resize(); setLevel(5, true)
    if (S) cv.style.transition = 'none'   /* ya estaba calculado: sin fundido */
    raf = requestAnimationFrame(frame)
    return {
      setLevel: setLevel,
      destroy: function () { dead = true; clearTimeout(buildT); cancelAnimationFrame(raf); window.removeEventListener('vc-lang', onLang); window.removeEventListener('resize', resize); if (ro) ro.disconnect() }
    }
  }
  /* precarga: construye el paisaje en un hueco invisible del mismo tamano que el real, para que al abrir la seccion salga al instante */
  function warm(host) {
    if (WARMED) return Promise.resolve(true)
    var b0 = BUILDS, m = mount(host)
    return new Promise(function (ok) {
      var t0 = Date.now(), iv = setInterval(function () {
        if (BUILDS > b0 || Date.now() - t0 > 6000) { clearInterval(iv); try { m.destroy() } catch (e) { } WARMED = BUILDS > b0; ok(WARMED) }
      }, 60)
    })
  }
  window.vcBortle = { mount: mount, warm: warm, get warmed() { return WARMED } }
})()
