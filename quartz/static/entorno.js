/* Entorno interactivo (v2): una montana vista de perfil que mira hacia el horizonte. Con la barra de la derecha se cambia
   su altitud (0 a 3000 m) y el dibujo aplica la fisica de la atmosfera:
   - la presion (y el aire que queda por encima) cae como exp(-h / 8500 m): menos extincion y menos brillo del cielo;
   - la bruma y la luz del pueblo quedan atrapadas bajo la capa de inversion (~1500 m, con mar de nubes);
   - el centelleo (turbulencia) se reduce con la altura y el horizonte desciende sqrt(2h/R);
   - la temperatura baja 6,5 C por km; la luz zodiacal solo aparece con el cielo muy limpio.
   La linea de vision (amarillo discontinuo) separa lo que se ve del cielo tapado por el relieve, arboles y edificios.
   window.vcEntorno.mount(host) -> { destroy(), setAlt(m) } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var clamp = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)) }
  var lerp = function (a, b, t) { return a + (b - a) * t }
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function hash1(i) { var h = Math.imul(i, 374761393) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
  function noise1(x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u) }
  function ridge(x, o) { var s = 0, a = .55, f = 1; for (var i = 0; i < o; i++) { var n = 1 - Math.abs(noise1(x * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= .5 } return s }
  var MAXM = 3000, HSCALE = 8500, INV = 1500, REARTH = 6371000

  var CSS = '.en-c{flex:1;min-width:0;height:100%;display:block;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}' +
    '.en-s{flex:none;width:clamp(58px,9vw,84px);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px 12px;border-left:1px solid #343d63;background:linear-gradient(180deg,#0e1430e6,#0a0f26e6);user-select:none;-webkit-user-select:none}' +
    '.en-h{flex:none;font:400 11px/1.2 ' + SERIF + ';color:#8f98c0;text-align:center}' +
    '.en-n{flex:none;font:400 22px/1 ' + SERIF + ';color:#f5f7ff;white-space:nowrap}.en-u{flex:none;font:400 11px/1 ' + SERIF + ';color:#8f98c0;margin-bottom:6px}' +
    '.en-tr{position:relative;flex:1;min-height:0;width:100%;touch-action:none;cursor:pointer;outline:none}' +
    '.en-tr::before{content:"";position:absolute;top:13px;bottom:13px;left:62%;width:1px;background:#343d63}' +
    '.en-f{position:absolute;bottom:13px;left:62%;width:3px;margin-left:-1px;border-radius:2px;background:linear-gradient(0deg,#5b6bb4,#f8d874)}' +
    '.en-t{position:absolute;left:0;width:62%;display:flex;align-items:center;justify-content:flex-end;gap:3px;transform:translateY(-50%);font:400 9.5px/1 ' + SERIF + ';color:#6f78a6;pointer-events:none}' +
    '.en-t::after{content:"";width:6px;height:1px;background:#4a5487}' +
    '.en-k{position:absolute;left:62%;width:24px;height:24px;margin:-12px 0 0 -12px;box-sizing:border-box;border-radius:50%;border:1.5px solid #f8d874;background:#0b1025;box-shadow:0 0 12px rgba(248,216,116,.55);transition:transform .2s ease;pointer-events:none}' +
    '.en-k::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#f8d874}' +
    '.en-tr:hover .en-k,.en-tr:focus-visible .en-k,.en-tr.drag .en-k{transform:scale(1.15)}' +
    '.en-root-short .en-h,.en-root-short .en-u{display:none}.en-root-short .en-t{font-size:8.5px}'

  var GLOW = null
  function glowSprite() {
    if (GLOW) return GLOW
    var c = document.createElement('canvas'); c.width = c.height = 64
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,236,170,1)'); g.addColorStop(.18, 'rgba(248,216,116,.55)'); g.addColorStop(.5, 'rgba(248,200,100,.14)'); g.addColorStop(1, 'rgba(248,190,90,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); GLOW = c; return c
  }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c }

  /* ---------- piezas de dibujo reutilizables ---------- */
  function pine(g, x, y, h, a, tone) {
    var w = h * .5, tiers = h < 14 ? 3 : 4
    g.strokeStyle = 'rgba(150,170,235,' + a * .7 + ')'; g.lineWidth = Math.max(.6, h * .04); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h * .22); g.stroke()
    for (var i = 0; i < tiers; i++) {
      var q = i / tiers, ty = y - h + h * q * .74, bw = w * (.3 + q * .72) / 2, by = ty + h * .4, m = by - ty
      g.beginPath(); g.moveTo(x, ty)
      g.lineTo(x + bw * .55, ty + m * .6); g.lineTo(x + bw * .4, ty + m * .62); g.lineTo(x + bw, by)
      g.quadraticCurveTo(x, by - h * .07, x - bw, by)
      g.lineTo(x - bw * .4, ty + m * .62); g.lineTo(x - bw * .55, ty + m * .6); g.closePath()
      g.fillStyle = i % 2 ? (tone || '#0d1532') : '#101a3c'; g.fill()
      g.strokeStyle = 'rgba(110,126,204,' + a + ')'; g.lineWidth = .7; g.stroke()
    }
  }
  function leafy(g, x, y, h, a) {
    var r = h * .3
    g.strokeStyle = 'rgba(150,170,235,' + a * .7 + ')'; g.lineWidth = Math.max(.6, h * .05); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h * .5); g.stroke()
    ;[[0, -.66, 1], [-.6, -.52, .72], [.6, -.54, .7], [-.22, -.88, .62], [.28, -.86, .58]].forEach(function (b, i) {
      g.fillStyle = i % 2 ? '#0d1532' : '#101a3c'; g.beginPath(); g.arc(x + b[0] * r, y + b[1] * h, r * b[2], 0, 6.283); g.fill()
      g.strokeStyle = 'rgba(110,126,204,' + a + ')'; g.lineWidth = .7; g.stroke()
    })
  }

  function mount(host) {
    if (!document.getElementById('en-css')) { var st = document.createElement('style'); st.id = 'en-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var cv = document.createElement('canvas'); cv.className = 'en-c'; cv.setAttribute('role', 'img')
    var side = document.createElement('div'); side.className = 'en-s'
    side.innerHTML = '<div class="en-h"></div><div class="en-n"></div><div class="en-u">m</div><div class="en-tr" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="' + MAXM + '"><div class="en-f"></div><div class="en-k"></div></div>'
    host.append(cv, side)
    var hH = side.querySelector('.en-h'), nn = side.querySelector('.en-n'), tr = side.querySelector('.en-tr'), knob = side.querySelector('.en-k'), fill = side.querySelector('.en-f')
    for (var m = 0; m <= MAXM; m += 500) { var tk = document.createElement('div'); tk.className = 'en-t'; tk.dataset.m = m; tk.textContent = m; tr.append(tk) }
    var ticks = [].slice.call(tr.querySelectorAll('.en-t'))
    var LBL = {}
    function texts() {
      hH.textContent = T('Altitud'); cv.setAttribute('aria-label', T('Entorno')); tr.setAttribute('aria-label', T('Altitud'))
      LBL = { air: T('Aire por encima'), hor: T('Horizonte'), tmp: T('Temperatura') }
    }
    texts()

    /* ---------- barra de altitud ---------- */
    var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    var target = 1000, cur = 1000, dragging = false
    function place() {
      var r = tr.clientHeight, top = 13, span = Math.max(1, r - 26), p = target / MAXM
      knob.style.top = (top + (1 - p) * span) + 'px'; fill.style.height = (p * span) + 'px'
      ticks.forEach(function (t) { t.style.top = (top + (1 - t.dataset.m / MAXM) * span) + 'px' })
    }
    function setAlt(v, instant) {
      target = clamp(Math.round(v / 50) * 50, 0, MAXM)
      nn.textContent = target
      nn.style.color = 'rgb(' + [Math.round(lerp(219, 248, target / MAXM)), Math.round(lerp(231, 216, target / MAXM)), Math.round(lerp(255, 116, target / MAXM))].join(',') + ')'
      tr.setAttribute('aria-valuenow', target); tr.setAttribute('aria-valuetext', target + ' m')
      if (instant || reduce) cur = target
      place()
    }
    function fromY(y) { var r = tr.getBoundingClientRect(); setAlt((1 - clamp((y - r.top - 13) / Math.max(1, r.height - 26))) * MAXM) }
    tr.addEventListener('pointerdown', function (e) { dragging = true; tr.classList.add('drag'); try { tr.setPointerCapture(e.pointerId) } catch (x) { } fromY(e.clientY) })
    tr.addEventListener('pointermove', function (e) { if (dragging) fromY(e.clientY) })
    var stop = function () { dragging = false; tr.classList.remove('drag') }
    tr.addEventListener('pointerup', stop); tr.addEventListener('pointercancel', stop)
    tr.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 100 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -100 : e.key === 'PageUp' ? 500 : e.key === 'PageDown' ? -500 : 0
      if (e.key === 'Home') { e.preventDefault(); setAlt(0); return } if (e.key === 'End') { e.preventDefault(); setAlt(MAXM); return }
      if (!d) return
      e.preventDefault(); setAlt(target + d)
    })

    /* ---------- escena fija (se rehace al cambiar de tamano) ---------- */
    var W = 0, H = 0, K = 0, dpr = 1, ctx = cv.getContext('2d'), raf = 0, dead = false, S = null, nextShoot = 2500, shoot = null
    function build() {
      var r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); K = Math.min(H, W * 1.25); dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      host.classList.toggle('en-root-short', host.clientHeight < 420)
      place()
      var R = rng(7), yG = H - K * .13, pxm = K * .56 / MAXM, s = { yG: yG, px: W * .18, pxm: pxm }
      /* objetos del cielo: algunos muy bajos, solo visibles desde arriba */
      s.objs = [
        { k: 'planet', x: W * .91, y: yG - K * .115 },
        { k: 'sirius', x: W * .76, y: yG - K * .135 },
        { k: 'orion', x: W * .64, y: yG - K * .25 },
        { k: 'pleiades', x: W * .86, y: yG - K * .33 },
        { k: 'galaxy', x: W * .52, y: yG - K * .47 },
        { k: 'cluster', x: W * .97, y: yG - K * .22 },
        { k: 'neb', x: W * .5, y: yG - K * .17 }
      ]
      s.stars = []
      var nS = Math.round(W * H / 330)
      for (var i = 0; i < nS; i++) {
        var mg = Math.pow(R(), 3.2), tint = R()
        s.stars.push({ x: R() * W, y: Math.pow(R(), 1.1) * yG, r: .35 + mg * 1.5, a: .25 + mg * .75, ph: R() * 6.28, sp: .8 + R() * 2.6, faint: mg < .1, c: tint < .15 ? '255,214,180' : tint > .85 ? '190,210,255' : '232,238,255' })
      }
      /* Via Lactea: banda que sale del horizonte por la derecha, con su nucleo y polvo */
      var mw = mk(cv.width, cv.height), g2 = mw.getContext('2d'); g2.setTransform(dpr, 0, 0, dpr, 0, 0)
      var A = [W * 1.02, yG - K * .06], B = [W * .28, yG - K * 1.15], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L
      for (var j = 0; j < 50; j++) {
        var t = R(), off = (R() - .5) * K * .16 * (1 - t * .4), cx = A[0] + dx * t + nx * off, cy = A[1] + dy * t + ny * off, rr = K * (.05 + R() * .07) * (1.25 - t * .5)
        var gr = g2.createRadialGradient(cx, cy, 0, cx, cy, rr); gr.addColorStop(0, 'rgba(170,185,240,' + (.07 * (1.3 - t)) + ')'); gr.addColorStop(1, 'rgba(170,185,240,0)')
        g2.fillStyle = gr; g2.fillRect(cx - rr, cy - rr, rr * 2, rr * 2)
      }
      for (var k2 = 0; k2 < 3200; k2++) {
        var t2 = R(), o2 = (R() + R() + R() - 1.5) * K * .1 * (1 - t2 * .4), x2 = A[0] + dx * t2 + nx * o2, y2 = A[1] + dy * t2 + ny * o2
        g2.fillStyle = 'rgba(215,224,255,' + (.16 + R() * .45) + ')'; g2.fillRect(x2, y2, .7 + R() * .6, .7 + R() * .6)
      }
      var cg = g2.createRadialGradient(W * .93, yG - K * .1, 0, W * .93, yG - K * .1, K * .14); cg.addColorStop(0, 'rgba(255,226,180,.3)'); cg.addColorStop(1, 'rgba(255,226,180,0)'); g2.fillStyle = cg; g2.fillRect(0, 0, W, H)
      for (var q = 0; q < 50; q++) { var t3 = R() * .7, x3 = A[0] + dx * t3 + nx * (R() - .45) * K * .04, y3 = A[1] + dy * t3 + ny * (R() - .45) * K * .04, r3 = K * (.006 + R() * .014); g2.fillStyle = 'rgba(5,7,18,.13)'; g2.beginPath(); g2.ellipse(x3, y3, r3 * 2, r3, Math.atan2(dy, dx), 0, 6.283); g2.fill() }
      s.mw = mw

      /* ---- paisaje fijo: cordilleras con perspectiva atmosferica, colinas, pueblo, bosque y valle ---- */
      var occ = new Float32Array(Math.ceil(W) + 2).fill(yG)
      var land = mk(cv.width, cv.height), lg = land.getContext('2d'); lg.setTransform(dpr, 0, 0, dpr, 0, 0); lg.lineJoin = 'round'; lg.lineCap = 'round'
      var put = function (x, y) { var i2 = Math.round(x); if (i2 >= 0 && i2 < occ.length && y < occ[i2]) occ[i2] = y }
      var putTri = function (cx, top, w, h) { for (var xx = cx - w / 2; xx <= cx + w / 2; xx++) put(xx, top + Math.abs(xx - cx) / (w / 2) * h) }
      /* cordillera lejana (mas clara, con nieve en las cumbres) */
      var far2 = function (x) { return yG - K * (.04 + .1 * ridge(x / W * 4 + 7.1, 5) * sstep(.3, .62, x / W)) }
      lg.beginPath(); lg.moveTo(W * .28, yG); for (var x = W * .28; x <= W + 2; x += 2) { lg.lineTo(x, far2(x)); put(x, far2(x)) } lg.lineTo(W + 2, yG); lg.closePath()
      lg.fillStyle = '#121a3e'; lg.fill(); lg.strokeStyle = 'rgba(110,126,204,.4)'; lg.lineWidth = .9; lg.stroke()
      lg.save(); lg.clip(); lg.fillStyle = 'rgba(205,218,255,.22)'
      for (x = W * .3; x <= W; x += 2) { var fy = far2(x), pk = far2(x - 3) > fy && far2(x + 3) > fy; if (pk && fy < yG - K * .085) { lg.beginPath(); lg.moveTo(x - K * .02, fy + K * .016); lg.lineTo(x, fy); lg.lineTo(x + K * .02, fy + K * .016); lg.lineTo(x + K * .006, fy + K * .011); lg.lineTo(x - K * .004, fy + K * .014); lg.closePath(); lg.fill() } }
      lg.restore()
      /* cordillera media */
      var far1 = function (x) { return yG - K * (.03 + .07 * ridge(x / W * 6 + 3.3, 4) * sstep(.35, .7, x / W)) }
      lg.beginPath(); lg.moveTo(W * .3, yG); for (x = W * .3; x <= W + 2; x += 2) { lg.lineTo(x, far1(x)); put(x, far1(x)) } lg.lineTo(W + 2, yG); lg.closePath()
      lg.fillStyle = '#0d1433'; lg.fill(); lg.strokeStyle = 'rgba(110,126,204,.55)'; lg.stroke()
      /* colinas cercanas con campos y curvas de nivel */
      var hillY = function (x) { var u = x / W; return yG - K * (.022 + .085 * Math.exp(-Math.pow((u - .84) / .07, 2)) + .06 * Math.exp(-Math.pow((u - .98) / .05, 2))) }
      lg.beginPath(); lg.moveTo(W * .66, yG); for (x = W * .66; x <= W + 2; x += 2) { lg.lineTo(x, hillY(x)); put(x, hillY(x)) } lg.lineTo(W + 2, yG); lg.closePath()
      lg.fillStyle = '#0a1028'; lg.fill(); lg.strokeStyle = 'rgba(138,160,230,.8)'; lg.lineWidth = 1; lg.stroke()
      lg.save(); lg.clip()
      for (var c2 = 1; c2 < 6; c2++) { lg.strokeStyle = 'rgba(91,107,180,' + (.42 - c2 * .05) + ')'; lg.lineWidth = .8; lg.beginPath(); for (x = W * .66; x <= W + 2; x += 3) { var yy = lerp(hillY(x), yG, c2 / 6) + Math.sin(x * .05 + c2) * 1.2; x === W * .66 ? lg.moveTo(x, yy) : lg.lineTo(x, yy) } lg.stroke() }
      /* campos en franjas en la ladera */
      for (var fq = 0; fq < 5; fq++) { var fx0 = W * (.72 + fq * .05); lg.strokeStyle = 'rgba(160,170,140,.18)'; lg.lineWidth = .7; lg.beginPath(); for (var fs = 0; fs < 6; fs++) { var xx1 = fx0 + fs * W * .006; lg.moveTo(xx1, hillY(xx1) + K * .012); lg.lineTo(xx1 + W * .012, yG) } lg.stroke() }
      lg.restore()
      for (var hp = 0; hp < 22; hp++) { var hx = W * (.7 + R() * .3), hb = hillY(hx) + 2, hh = K * (.02 + R() * .018); pine(lg, hx, hb, hh, .6); putTri(hx, hb - hh, hh * .5, hh * .9) }
      /* pueblo: casas con tejado y chimenea, bloques, iglesia con reloj, farolas */
      s.lights = []; s.smokes = []
      var bx = W * .5, churchDone = false
      while (bx < W * .69) {
        var kind = !churchDone && bx > W * .575 ? 'church' : R() < .25 ? 'block' : 'house'
        var bw2 = kind === 'block' ? W * (.022 + R() * .012) : W * (.018 + R() * .016), bh = kind === 'church' ? K * .07 : kind === 'block' ? K * (.055 + R() * .03) : K * (.022 + R() * .018)
        lg.fillStyle = '#0f1736'; lg.strokeStyle = 'rgba(138,180,255,.62)'; lg.lineWidth = .9
        lg.fillRect(bx, yG - bh, bw2, bh); lg.strokeRect(bx, yG - bh, bw2, bh)
        for (var xx2 = bx; xx2 <= bx + bw2; xx2++) put(xx2, yG - bh)
        if (kind === 'church') {
          churchDone = true
          var tw = bw2 * .42, tx = bx + bw2 * .25, th = K * .065, sp = K * .045
          lg.beginPath(); lg.moveTo(bx - 1, yG - bh); lg.lineTo(bx + bw2 / 2, yG - bh - bw2 * .35); lg.lineTo(bx + bw2 + 1, yG - bh); lg.closePath(); lg.fill(); lg.stroke(); putTri(bx + bw2 / 2, yG - bh - bw2 * .35, bw2 + 2, bw2 * .35)
          lg.fillRect(tx - tw / 2, yG - bh - th, tw, th + bh); lg.strokeRect(tx - tw / 2, yG - bh - th, tw, th + bh)
          lg.beginPath(); lg.moveTo(tx - tw / 2 - 1, yG - bh - th); lg.lineTo(tx, yG - bh - th - sp); lg.lineTo(tx + tw / 2 + 1, yG - bh - th); lg.closePath(); lg.fill(); lg.stroke()
          lg.beginPath(); lg.moveTo(tx, yG - bh - th - sp); lg.lineTo(tx, yG - bh - th - sp - K * .012); lg.moveTo(tx - K * .005, yG - bh - th - sp - K * .008); lg.lineTo(tx + K * .005, yG - bh - th - sp - K * .008); lg.stroke()
          /* campanario con arco y reloj */
          lg.fillStyle = '#05070f'; lg.beginPath(); lg.arc(tx, yG - bh - th * .78, tw * .18, Math.PI, 0); lg.lineTo(tx + tw * .18, yG - bh - th * .64); lg.lineTo(tx - tw * .18, yG - bh - th * .64); lg.closePath(); lg.fill(); lg.stroke()
          lg.beginPath(); lg.arc(tx, yG - bh - th * .38, tw * .2, 0, 6.283); lg.stroke(); lg.beginPath(); lg.moveTo(tx, yG - bh - th * .38); lg.lineTo(tx, yG - bh - th * .38 - tw * .14); lg.moveTo(tx, yG - bh - th * .38); lg.lineTo(tx + tw * .1, yG - bh - th * .38); lg.stroke()
          putTri(tx, yG - bh - th - sp, tw + 2, sp); for (xx2 = tx - tw / 2; xx2 <= tx + tw / 2; xx2++) put(xx2, yG - bh - th)
          s.lights.push({ x: tx, y: yG - bh - th * .38, r: 12, a: .5 })
          /* rosetón y puerta */
          lg.beginPath(); lg.arc(bx + bw2 * .68, yG - bh * .62, bw2 * .1, 0, 6.283); lg.stroke()
          lg.fillStyle = '#05070f'; lg.beginPath(); lg.moveTo(bx + bw2 * .6, yG); lg.lineTo(bx + bw2 * .6, yG - bh * .3); lg.arc(bx + bw2 * .68, yG - bh * .3, bw2 * .08, Math.PI, 0); lg.lineTo(bx + bw2 * .76, yG); lg.closePath(); lg.fill(); lg.stroke()
        } else if (kind === 'house') {
          var rh = bw2 * .42
          lg.fillStyle = '#121b40'; lg.beginPath(); lg.moveTo(bx - 1.5, yG - bh); lg.lineTo(bx + bw2 / 2, yG - bh - rh); lg.lineTo(bx + bw2 + 1.5, yG - bh); lg.closePath(); lg.fill(); lg.stroke(); putTri(bx + bw2 / 2, yG - bh - rh, bw2 + 3, rh)
          /* tejas */
          lg.strokeStyle = 'rgba(138,180,255,.25)'; lg.beginPath(); lg.moveTo(bx + bw2 * .22, yG - bh - rh * .45); lg.lineTo(bx + bw2 * .78, yG - bh - rh * .45); lg.stroke()
          if (R() < .7) { var chx = bx + bw2 * .72, chy = yG - bh - rh * .5; lg.fillStyle = '#0f1736'; lg.strokeStyle = 'rgba(138,180,255,.62)'; lg.fillRect(chx - 1.5, chy - K * .012, 3, K * .012 + 2); lg.strokeRect(chx - 1.5, chy - K * .012, 3, K * .012 + 2); s.smokes.push({ x: chx, y: chy - K * .012, ph: R() }) }
          lg.fillStyle = '#05070f'; lg.strokeStyle = 'rgba(138,180,255,.62)'; lg.fillRect(bx + bw2 * .42, yG - bh * .5, bw2 * .16, bh * .5); lg.strokeRect(bx + bw2 * .42, yG - bh * .5, bw2 * .16, bh * .5)
        } else {
          lg.beginPath(); lg.moveTo(bx - 1, yG - bh); lg.lineTo(bx + bw2 + 1, yG - bh); lg.stroke()
        }
        /* ventanas encendidas (con marco) */
        var rows = kind === 'church' ? 0 : Math.max(1, Math.floor(bh / (K * .014))), cols = Math.max(1, Math.floor(bw2 / 7))
        for (var rI = 0; rI < rows; rI++) for (var cI = 0; cI < cols; cI++) {
          var wx = bx + (cI + .5) * bw2 / cols - 1.4, wy = yG - bh + (rI + .3) * bh / rows
          if (kind === 'house' && wy > yG - bh * .55 && Math.abs(wx + 1.4 - (bx + bw2 / 2)) < bw2 * .15) continue
          var on = R() < (kind === 'block' ? .55 : .7)
          lg.fillStyle = on ? '#f8d874' : '#1a2350'; lg.fillRect(wx, wy, 2.8, 2.6)
          lg.strokeStyle = 'rgba(138,180,255,.4)'; lg.lineWidth = .5; lg.strokeRect(wx - .3, wy - .3, 3.4, 3.2); lg.lineWidth = .9
          if (on) s.lights.push({ x: wx + 1.4, y: wy + 1.3, r: 5, a: .55 })
        }
        bx += bw2 + W * (.003 + R() * .006)
      }
      for (var fl = 0; fl < 6; fl++) { var fx = W * (.47 + fl * .045), fh = K * .028; lg.strokeStyle = 'rgba(138,180,255,.75)'; lg.lineWidth = .9; lg.beginPath(); lg.moveTo(fx, yG); lg.lineTo(fx, yG - fh); lg.quadraticCurveTo(fx, yG - fh - 2, fx + 3.5, yG - fh - 1); lg.stroke(); lg.fillStyle = '#f8d874'; lg.fillRect(fx + 2.5, yG - fh - .5, 2, 1.4); s.lights.push({ x: fx + 3.5, y: yG - fh + 1, r: 11, a: .8 }) }
      /* bosque al pie de la montana (pinos y frondosos) */
      for (var fp = 0; fp < 34; fp++) { var px2 = W * (.38 + R() * .12), ph2 = K * (.035 + R() * .045); if (R() < .75) pine(lg, px2, yG + 1, ph2, .75); else leafy(lg, px2, yG + 1, ph2 * .8, .7); putTri(px2, yG + 1 - ph2, ph2 * .5, ph2 * .9) }
      /* valle en perspectiva: suelo con surcos y una carretera */
      var vg = lg.createLinearGradient(0, yG, 0, H); vg.addColorStop(0, '#0a0f26'); vg.addColorStop(1, '#05070f'); lg.fillStyle = vg; lg.fillRect(0, yG, W, H - yG)
      lg.strokeStyle = 'rgba(120,136,212,.85)'; lg.lineWidth = 1.2; lg.beginPath(); lg.moveTo(0, yG); lg.lineTo(W, yG); lg.stroke()
      for (var gl = 1; gl < 5; gl++) { var yq = yG + (H - yG) * Math.pow(gl / 5, 1.6); lg.strokeStyle = 'rgba(79,92,156,' + (.45 - gl * .06) + ')'; lg.lineWidth = .8; lg.beginPath(); lg.moveTo(0, yq); lg.lineTo(W, yq); lg.stroke() }
      lg.strokeStyle = 'rgba(79,92,156,.3)'; lg.beginPath(); for (var pl = -6; pl <= 12; pl++) { var vx = W * .6 + pl * W * .07; lg.moveTo(W * .6 + pl * W * .012, yG); lg.lineTo(vx, H) } lg.stroke()
      s.road = yG + (H - yG) * .32
      lg.strokeStyle = 'rgba(185,201,255,.35)'; lg.lineWidth = 1; lg.setLineDash([6, 6]); lg.beginPath(); lg.moveTo(0, s.road); lg.lineTo(W, s.road); lg.stroke(); lg.setLineDash([])
      s.land = land; s.occ = occ
      /* elementos de la montana (posiciones relativas a la cima) */
      s.mPines = []; for (var mp = 0; mp < 46; mp++) s.mPines.push({ u: R() * 2 - 1, h: .7 + R() * .6, lf: R() < .2 })
      s.spurs = []; for (var sp2 = 0; sp2 < 7; sp2++) s.spurs.push(-1.05 + sp2 * .35 + (R() - .5) * .12)
      s.rocks = []; for (var rk = 0; rk < 14; rk++) s.rocks.push({ u: (R() * 2 - 1) * .55, v: R() })
      S = s
    }

    /* perfil de la montana: cima en punta y laderas concavas, con algo de rugosidad */
    function mountain(alt) {
      var a = alt / MAXM, yG = S.yG, hp = Math.max(K * .012, alt * S.pxm), half = W * lerp(.07, .19, Math.sqrt(a)), px = S.px
      /* explanada en la cima donde se apoyan el observador y el telescopio */
      var pw = 15 * Math.max(.8, K / 520)
      return {
        hp: hp, half: half, top: yG - hp, pw: pw,
        y: function (x) {
          var dd = Math.max(0, Math.abs(x - px) - pw), d = dd / half, u = Math.sqrt(d * d + .0004), sh = u < 1.8 ? Math.pow(1 - u / 1.8, 1.75) / Math.pow(1 - .02 / 1.8, 1.75) : 0
          var rough = sh * (1 - sh) * hp * .12 * (ridge(x / W * 9 + (d < 0 ? 4.2 : 1.7), 3) - .4)
          return yG - hp * sh + rough
        }
      }
    }

    /* ---------- objetos del cielo ---------- */
    function drawObj(o, t, al, tw) {
      var u = Math.max(.7, K / 600)
      ctx.save(); ctx.globalAlpha = al
      if (o.k === 'planet') {
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glowSprite(), o.x - 18 * u, o.y - 18 * u, 36 * u, 36 * u)
        ctx.strokeStyle = 'rgba(255,240,200,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(o.x - 9 * u, o.y); ctx.lineTo(o.x + 9 * u, o.y); ctx.moveTo(o.x, o.y - 9 * u); ctx.lineTo(o.x, o.y + 9 * u); ctx.stroke()
        ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(o.x, o.y, 2.6 * u, 0, 6.283); ctx.fill()
      } else if (o.k === 'sirius') {
        /* estrella brillante baja: centellea con cambios de color (mas cuanto mas aire atraviesa) */
        var ph = t * 9, cr = ['255,170,170', '170,210,255', '255,255,255', '200,255,210'][Math.floor(ph) % 4], j = 1 + tw * Math.sin(t * 23)
        ctx.globalCompositeOperation = 'lighter'
        var sg = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, 9 * u * j); sg.addColorStop(0, 'rgba(' + (tw > .12 ? cr : '230,240,255') + ',.9)'); sg.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = sg; ctx.fillRect(o.x - 10 * u, o.y - 10 * u, 20 * u, 20 * u)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o.x, o.y, 1.9 * u, 0, 6.283); ctx.fill()
      } else if (o.k === 'orion') {
        var P = [[-.035, -.07], [.04, -.065], [-.006, -.004], [.008, 0], [.022, .004], [-.04, .065], [.045, .07]], sc = K
        ctx.strokeStyle = 'rgba(185,201,255,.32)'; ctx.lineWidth = .8; ctx.beginPath()
        ;[[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1], [5, 6]].forEach(function (e) { ctx.moveTo(o.x + P[e[0]][0] * sc, o.y + P[e[0]][1] * sc); ctx.lineTo(o.x + P[e[1]][0] * sc, o.y + P[e[1]][1] * sc) }); ctx.stroke()
        var nx = o.x + .01 * sc, ny = o.y + .035 * sc, ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, .022 * sc); ng.addColorStop(0, 'rgba(255,160,200,.6)'); ng.addColorStop(.5, 'rgba(230,110,170,.22)'); ng.addColorStop(1, 'rgba(230,110,170,0)'); ctx.fillStyle = ng; ctx.beginPath(); ctx.ellipse(nx, ny, .022 * sc, .016 * sc, .4, 0, 6.283); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(nx, ny, 1 * u, 0, 6.283); ctx.fill()
        P.forEach(function (p, i) { var c = i === 0 ? '#ffb98a' : i === 6 ? '#cfe0ff' : '#eef3ff', rr = (i === 0 || i === 6 ? 2.3 : 1.6) * u; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(o.x + p[0] * sc, o.y + p[1] * sc, rr, 0, 6.283); ctx.fill() })
      } else if (o.k === 'neb') {
        var r = K * .026, g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r); g.addColorStop(0, 'rgba(150,220,255,.5)'); g.addColorStop(.5, 'rgba(120,150,255,.18)'); g.addColorStop(1, 'rgba(120,150,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(o.x, o.y, r * 1.4, r * .8, -.4, 0, 6.283); ctx.fill()
        ctx.strokeStyle = 'rgba(150,220,255,.25)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(o.x, o.y, r * .9, r * .45, -.4, .3, 4); ctx.stroke()
      } else if (o.k === 'pleiades') {
        var C = [[0, 0], [.012, -.006], [.02, .004], [.009, .012], [-.008, .009], [.026, -.012], [-.004, -.012]]
        for (var w = 0; w < 4; w++) { var wx = o.x + (w - 1) * K * .009, pg = ctx.createRadialGradient(wx, o.y, 0, wx, o.y, K * .02); pg.addColorStop(0, 'rgba(140,175,255,.16)'); pg.addColorStop(1, 'rgba(140,175,255,0)'); ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(wx, o.y, K * .022, K * .012, -.3, 0, 6.283); ctx.fill() }
        ctx.fillStyle = '#dce7ff'; C.forEach(function (p, i) { ctx.beginPath(); ctx.arc(o.x + p[0] * K, o.y + p[1] * K, (i < 3 ? 1.7 : 1.3) * u, 0, 6.283); ctx.fill() })
      } else if (o.k === 'galaxy') {
        ctx.translate(o.x, o.y); ctx.rotate(-.55); var gr = K * .065, gg = ctx.createRadialGradient(0, 0, 0, 0, 0, gr); gg.addColorStop(0, 'rgba(255,240,215,.8)'); gg.addColorStop(.22, 'rgba(210,205,240,.32)'); gg.addColorStop(1, 'rgba(180,190,240,0)')
        ctx.save(); ctx.scale(1, .3); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, gr, 0, 6.283); ctx.fill()
        ctx.strokeStyle = 'rgba(8,10,24,.55)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, 0, gr * .62, gr * .5, 0, 3.6, 5.9); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, gr * .82, gr * .7, 0, 3.9, 5.6); ctx.stroke()
        ctx.restore(); ctx.fillStyle = 'rgba(230,230,255,.6)'; ctx.beginPath(); ctx.arc(gr * .55, -gr * .18, 1.3 * u, 0, 6.283); ctx.fill()
      } else if (o.k === 'cluster') {
        var R2 = rng(91); ctx.fillStyle = '#f0f4ff'; for (var i = 0; i < 46; i++) { var rr2 = Math.pow(R2(), 1.8) * K * .018, an = R2() * 6.28; ctx.fillRect(o.x + Math.cos(an) * rr2, o.y + Math.sin(an) * rr2, .9, .9) }
        var cg = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, K * .014); cg.addColorStop(0, 'rgba(255,245,220,.55)'); cg.addColorStop(1, 'rgba(255,245,220,0)'); ctx.fillStyle = cg; ctx.fillRect(o.x - K * .02, o.y - K * .02, K * .04, K * .04)
      }
      ctx.restore()
    }

    /* nubes del mar de nubes (capa de inversion) */
    function cloudBand(y, x0, x1, al, tint) {
      var R3 = rng(23)
      for (var i = 0; i < 18; i++) {
        var cx = lerp(x0, x1, (i + R3() * .6) / 18), w = K * (.05 + R3() * .06), h = K * (.008 + R3() * .008), cy = y + (R3() - .5) * K * .02
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w); g.addColorStop(0, 'rgba(' + tint + ',' + al + ')'); g.addColorStop(1, 'rgba(' + tint + ',0)')
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, h / w); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w, 0, 6.283); ctx.fill(); ctx.restore()
        ctx.strokeStyle = 'rgba(185,201,255,' + al * .5 + ')'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(cx, cy - h * .3, w * .6, h * .9, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke()
      }
    }

    function draw(now) {
      var t = now / 1000, s = S, yG = s.yG, alt = cur, a = alt / MAXM, M = mountain(alt)
      /* fisica de la atmosfera */
      var P = Math.exp(-alt / HSCALE)                 // fraccion de aire por encima
      var inHaze = 1 - sstep(INV - 300, INV + 250, alt) // dentro de la capa de bruma
      var B = P * (.35 + .65 * inHaze)                 // brillo del cielo / extincion relativa
      var D = 1 - B                                    // oscuridad del cielo
      var twA = .45 * Math.pow(P, 4) * (.6 + .4 * inHaze) // centelleo
      var yInv = yG - INV * s.pxm
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      var sky = ctx.createLinearGradient(0, 0, 0, yG); sky.addColorStop(0, '#03040c'); sky.addColorStop(.55, 'rgb(' + Math.round(lerp(8, 12, B)) + ',' + Math.round(lerp(12, 17, B)) + ',' + Math.round(lerp(32, 40, B)) + ')'); sky.addColorStop(1, 'rgb(' + Math.round(lerp(16, 46, B)) + ',' + Math.round(lerp(22, 42, B)) + ',' + Math.round(lerp(52, 60, B)) + ')')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      /* resplandor nocturno (airglow) y luz zodiacal: solo con cielos limpios */
      var ag = sstep(.35, .8, D)
      if (ag > 0) {
        var gl = ctx.createLinearGradient(0, yG - K * .2, 0, yG); gl.addColorStop(0, 'rgba(120,220,160,0)'); gl.addColorStop(.7, 'rgba(120,220,160,' + .07 * ag + ')'); gl.addColorStop(1, 'rgba(120,220,160,0)'); ctx.fillStyle = gl; ctx.fillRect(0, yG - K * .2, W, K * .2)
        ctx.save(); ctx.translate(W * .97, yG); ctx.rotate(-.5); var zg = ctx.createRadialGradient(0, 0, 0, 0, 0, K * .5); zg.addColorStop(0, 'rgba(255,240,210,' + .13 * ag + ')'); zg.addColorStop(1, 'rgba(255,240,210,0)'); ctx.scale(.36, 1); ctx.fillStyle = zg; ctx.beginPath(); ctx.arc(0, 0, K * .5, Math.PI, 2 * Math.PI); ctx.fill(); ctx.restore()
      }
      /* extincion: X ~ 1/sin(altura) aire atravesado, escalado con el aire que queda por encima */
      var ext = function (y) { var e = clamp((yG - y) / (yG * .95)); return Math.exp(-.22 * B * (1 / (e + .05) - 1) * .35) }
      ctx.globalAlpha = lerp(.35, 1, D); ctx.drawImage(s.mw, 0, 0, W, H); ctx.globalAlpha = 1
      for (var i = 0; i < s.stars.length; i++) {
        var st = s.stars[i], e = clamp((yG - st.y) / (yG * .95)), tw = twA * (1.6 - e)
        var al = st.a * ext(st.y) * (st.faint ? sstep(.15, .75, D) : 1) * (1 - tw + tw * Math.sin(t * st.sp * (2 - e) + st.ph)); if (al < .03) continue
        ctx.fillStyle = 'rgba(' + st.c + ',' + al + ')'
        if (st.r < .9) ctx.fillRect(st.x, st.y, st.r * 1.4, st.r * 1.4); else { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill() }
      }
      s.objs.forEach(function (o) { drawObj(o, t, ext(o.y) * lerp(.5, 1, D), twA * 2) })
      if (!reduce) {
        if (!shoot && now > nextShoot) { shoot = { x: W * (.4 + Math.random() * .5), y: yG * (.05 + Math.random() * .3), t0: now }; nextShoot = now + 6000 + Math.random() * 9000 }
        if (shoot) { var f = (now - shoot.t0) / 900; if (f > 1) shoot = null; else { var sx = shoot.x - f * W * .2, sy = shoot.y + f * K * .1, sgr = ctx.createLinearGradient(sx, sy, sx + W * .06, sy - K * .03); sgr.addColorStop(0, 'rgba(255,255,255,' + (1 - f) * D + ')'); sgr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = sgr; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + W * .06, sy - K * .03); ctx.stroke() } }
      }
      /* resplandor del pueblo: la luz se dispersa en la bruma bajo la inversion */
      var dome = ctx.createRadialGradient(W * .6, yG, 0, W * .6, yG, K * .5); dome.addColorStop(0, 'rgba(248,216,116,' + (.32 * (.35 + .65 * inHaze)) + ')'); dome.addColorStop(.45, 'rgba(248,200,110,' + (.09 * (.3 + .7 * inHaze)) + ')'); dome.addColorStop(1, 'rgba(248,200,110,0)')
      ctx.fillStyle = dome; ctx.fillRect(0, 0, W, yG)

      /* linea de vision desde el ojo del observador */
      var ex = s.px + 2, ey = M.top - K * .03, occ = s.occ, n = occ.length, yh = new Float32Array(n), mn = Infinity
      for (var x = 0; x < n; x++) {
        if (x <= ex + 3) { yh[x] = -1; continue }
        var o2 = Math.min(occ[x], M.y(x)), sl = (o2 - ey) / (x - ex); if (sl < mn) mn = sl
        yh[x] = ey + mn * (x - ex)
      }
      ctx.beginPath(); ctx.moveTo(ex + 4, H); for (x = Math.ceil(ex + 4); x < n; x += 2) ctx.lineTo(x, yh[x]); ctx.lineTo(W, yh[n - 1]); ctx.lineTo(W, H); ctx.closePath()
      var vg = ctx.createLinearGradient(W * .34, 0, W * .4, 0); vg.addColorStop(0, 'rgba(4,6,16,0)'); vg.addColorStop(1, 'rgba(4,6,16,.74)')
      ctx.fillStyle = vg; ctx.fill()
      ctx.save(); ctx.clip(); ctx.beginPath(); ctx.rect(W * .38, 0, W, H); ctx.clip(); ctx.strokeStyle = 'rgba(91,107,180,.16)'; ctx.lineWidth = 1; ctx.beginPath(); for (var hx = -H; hx < W; hx += 9) { ctx.moveTo(hx, H); ctx.lineTo(hx + H, 0) } ctx.stroke(); ctx.restore()

      /* paisaje, luces, humo y coches */
      ctx.drawImage(s.land, 0, 0, W, H)
      if (!reduce) s.smokes.forEach(function (sm) { for (var k = 0; k < 4; k++) { var ph = (t * .08 + sm.ph + k / 4) % 1; ctx.fillStyle = 'rgba(190,200,235,' + (.12 * (1 - ph)) + ')'; ctx.beginPath(); ctx.arc(sm.x + Math.sin(ph * 3 + sm.ph * 6) * 2 + ph * 5, sm.y - ph * K * .03, 1.2 + ph * 3, 0, 6.283); ctx.fill() } })
      ctx.globalCompositeOperation = 'lighter'; var G = glowSprite()
      s.lights.forEach(function (l, i) { ctx.globalAlpha = l.a * (.9 + .1 * Math.sin(t * 2 + i)); ctx.drawImage(G, l.x - l.r, l.y - l.r, l.r * 2, l.r * 2) })
      if (!reduce) for (var c = 0; c < 3; c++) { var cxp = ((t * (.03 + c * .012) + c * .37) % 1.2 - .1) * W, dir = c % 2 ? -1 : 1, cxx = dir > 0 ? cxp : W - cxp; ctx.globalAlpha = .9; ctx.drawImage(G, cxx - 6, s.road - 6, 12, 12); ctx.drawImage(G, cxx + dir * 10 - 14, s.road - 14, 28, 28) }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
      /* bruma bajo la inversion, sobre el valle y el paisaje lejano (perspectiva atmosferica) */
      var hz = ctx.createLinearGradient(0, yInv - K * .03, 0, yG); hz.addColorStop(0, 'rgba(70,74,100,0)'); hz.addColorStop(.6, 'rgba(90,88,105,.16)'); hz.addColorStop(1, 'rgba(120,110,100,.24)')
      ctx.fillStyle = hz; ctx.fillRect(W * .25, yInv - K * .03, W, yG - yInv + K * .03)
      /* mar de nubes en la capa de inversion: desde abajo tapa algo el cielo, desde arriba queda a tus pies iluminado por el pueblo */
      cloudBand(yInv, W * .3, W * 1.05, .2 + .12 * (1 - inHaze), '205,212,240')
      cloudBand(yInv + K * .012, W * .48, W * .74, .12, '248,216,140')

      /* ---- la montana ---- */
      var x0 = s.px - M.half * 1.9 - M.pw, x1 = s.px + M.half * 1.9 + M.pw, xs = Math.min(-2, x0)
      var path = new Path2D(); path.moveTo(xs, yG + 1); for (x = xs; x <= x1; x += 2) path.lineTo(x, Math.min(yG, M.y(x))); path.lineTo(x1, yG + 1); path.closePath()
      var mg = ctx.createLinearGradient(x0, 0, x1, 0); mg.addColorStop(0, '#0b1129'); mg.addColorStop(.5, '#141d44'); mg.addColorStop(1, '#0e1534'); ctx.fillStyle = mg; ctx.fill(path)
      ctx.save(); ctx.clip(path)
      /* facetas: aristas que bajan de la cima y caras con distinta luz */
      var top = [s.px, M.top], pts = s.spurs.map(function (u) { var xb = s.px + u * M.half * 1.9; return [xb, Math.min(yG, M.y(xb)) + (yG - M.top) * .25] })
      for (var fi = 0; fi < pts.length - 1; fi++) { ctx.fillStyle = 'rgba(150,170,240,' + (fi % 2 ? .07 : .02) + ')'; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(pts[fi][0], pts[fi][1]); ctx.lineTo(pts[fi + 1][0], pts[fi + 1][1]); ctx.closePath(); ctx.fill() }
      ctx.strokeStyle = 'rgba(138,180,255,.3)'; ctx.lineWidth = .9; pts.forEach(function (p) { ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.quadraticCurveTo(lerp(top[0], p[0], .5) + (p[0] - top[0]) * .08, lerp(top[1], p[1], .45), p[0], p[1]); ctx.stroke() })
      /* curvas de nivel cada 250 m */
      for (var cm = 250; cm < alt; cm += 250) {
        var cy = yG - cm * s.pxm
        ctx.strokeStyle = cm % 1000 ? 'rgba(91,107,180,.32)' : 'rgba(138,160,230,.55)'; ctx.lineWidth = cm % 1000 ? .7 : 1
        ctx.beginPath(); for (x = x0; x <= x1; x += 3) { var yy = cy + Math.sin(x * .045 + cm) * 1.6; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy) } ctx.stroke()
      }
      /* nieve por encima de 2300 m, con borde irregular */
      var snowY = yG - 2300 * s.pxm
      if (M.top < snowY - 2) {
        ctx.beginPath(); ctx.moveTo(x0, snowY); for (x = x0; x <= x1; x += 4) ctx.lineTo(x, snowY + (hash1(Math.round(x / 4)) - .3) * K * .02 + Math.sin(x * .08) * K * .006); ctx.lineTo(x1, M.top - 5); ctx.lineTo(x0, M.top - 5); ctx.closePath()
        ctx.save(); ctx.clip(); var sg = ctx.createLinearGradient(0, M.top, 0, snowY + K * .02); sg.addColorStop(0, 'rgba(225,233,255,.55)'); sg.addColorStop(1, 'rgba(200,214,255,.18)'); ctx.fillStyle = sg; ctx.fill(path)
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .8; pts.forEach(function (p) { ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(lerp(top[0], p[0], .3), lerp(top[1], p[1], .3)); ctx.stroke() }); ctx.restore()
      }
      /* rocas y grietas en la parte alta */
      if (M.hp > K * .15) s.rocks.forEach(function (rk) { var rx = s.px + rk.u * M.half, ry = M.y(rx) + (yG - M.y(rx)) * rk.v * .35 + 3, rs = K * .008; ctx.strokeStyle = 'rgba(160,180,240,.35)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(rx - rs, ry + rs * .4); ctx.lineTo(rx - rs * .2, ry - rs * .5); ctx.lineTo(rx + rs, ry + rs * .3); ctx.stroke() })
      ctx.restore()
      ctx.strokeStyle = 'rgba(138,180,255,.95)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (x = xs; x <= x1; x += 2) { var y5 = Math.min(yG, M.y(x)); x === xs ? ctx.moveTo(x, y5) : ctx.lineTo(x, y5) } ctx.stroke()
      /* bosque de la ladera hasta el limite del arbolado (~1900 m) y pradera por encima */
      var treeLine = yG - 1900 * s.pxm
      s.mPines.forEach(function (p, i) {
        var px = s.px + p.u * M.half * 1.65, py = M.y(px); if (py > yG - 3 || py < treeLine || py < M.top + K * .05) return
        var ph = K * .026 * p.h * (1 - .35 * sstep(treeLine + K * .1, treeLine, py)); p.lf ? leafy(ctx, px, py + 1, ph * .85, .7) : pine(ctx, px, py + 1, ph, .7)
      })
      if (alt > 1950) { ctx.strokeStyle = 'rgba(150,170,235,.4)'; ctx.lineWidth = .6; ctx.beginPath(); for (var gi = 0; gi < 26; gi++) { var gx = s.px + (hash1(gi * 7) * 2 - 1) * M.half * 1.2, gy = M.y(gx); if (gy < treeLine && gy > snowY + 4) { ctx.moveTo(gx, gy + 1); ctx.lineTo(gx - 1, gy - 2.5); ctx.moveTo(gx + 1.5, gy + 1); ctx.lineTo(gx + 2, gy - 2) } } ctx.stroke() }
      /* refugio de montana a 1400 m en la ladera izquierda */
      if (alt > 1750) {
        var ry2 = yG - 1400 * s.pxm, rxx = s.px; for (var it = 0; it < 30; it++) { rxx -= M.half * .05; if (M.y(rxx) >= ry2) break }
        var u2 = Math.max(.8, K / 600), hw = 9 * u2, hh2 = 6 * u2, rby = M.y(rxx) + 1
        ctx.fillStyle = '#121b40'; ctx.strokeStyle = 'rgba(185,201,255,.85)'; ctx.lineWidth = .9
        ctx.fillRect(rxx - hw / 2, rby - hh2, hw, hh2); ctx.strokeRect(rxx - hw / 2, rby - hh2, hw, hh2)
        ctx.beginPath(); ctx.moveTo(rxx - hw / 2 - 2, rby - hh2); ctx.lineTo(rxx, rby - hh2 - 5 * u2); ctx.lineTo(rxx + hw / 2 + 2, rby - hh2); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#f8d874'; ctx.fillRect(rxx + 1, rby - hh2 * .7, 2.2 * u2, 2 * u2)
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6; ctx.drawImage(glowSprite(), rxx - 8 * u2, rby - hh2 * .6 - 10 * u2, 20 * u2, 20 * u2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
      }
      /* sendero en zigzag hasta la cima */
      if (M.hp > K * .06) {
        ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(185,201,255,.42)'; ctx.lineWidth = .9; ctx.beginPath()
        for (var k3 = 0; k3 <= 1.0001; k3 += .01) { var side2 = Math.sin(k3 * Math.PI * 7), xk = s.px + M.half * (1.5 * (1 - k3)) * (.35 + .25 * side2), yk = M.y(xk) + 3 * (1 - k3); k3 ? ctx.lineTo(xk, yk) : ctx.moveTo(xk, yk) }
        ctx.stroke(); ctx.setLineDash([])
      }

      /* horizonte astronomico (horizontal desde el ojo) y linea de vision */
      ctx.setLineDash([1.5, 4]); ctx.strokeStyle = 'rgba(220,230,255,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(W, ey); ctx.stroke()
      ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(248,216,116,.8)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex, ey)
      for (x = Math.ceil(ex + 4); x < n; x += 2) ctx.lineTo(x, yh[x]); ctx.stroke(); ctx.setLineDash([])

      /* observador: gorro, abrigo, linterna roja y telescopio refractor en su tripode */
      /* todo apoyado en la explanada de la cima (y = M.top) */
      var u = Math.max(.8, K / 520), bx = s.px - 7 * u, by = M.top
      ctx.strokeStyle = 'rgba(150,170,235,.45)'; ctx.lineWidth = .6; ctx.beginPath(); for (var gq = -12; gq <= 12; gq += 3) { var gx2 = s.px + gq * u; ctx.moveTo(gx2, by); ctx.lineTo(gx2 - .8, by - 2) } ctx.stroke()
      ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(205,215,255,.95)'; ctx.fillStyle = '#0b1025'
      ctx.beginPath(); ctx.moveTo(bx - 3 * u, by - 5.5 * u); ctx.lineTo(bx - 2.6 * u, by - 12 * u); ctx.quadraticCurveTo(bx, by - 13.5 * u, bx + 2.6 * u, by - 12 * u); ctx.lineTo(bx + 3 * u, by - 5.5 * u); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bx - 1.6 * u, by - 5.5 * u); ctx.lineTo(bx - 2 * u, by); ctx.moveTo(bx + 1.6 * u, by - 5.5 * u); ctx.lineTo(bx + 2 * u, by); ctx.stroke()
      ctx.beginPath(); ctx.arc(bx, by - 15.6 * u, 2.4 * u, 0, 6.283); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.arc(bx, by - 16 * u, 2.6 * u, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(bx + 2.4 * u, by - 16.8 * u); ctx.lineTo(bx - 2.4 * u, by - 16.8 * u); ctx.closePath(); ctx.fillStyle = '#1a2552'; ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bx + 2.4 * u, by - 11 * u); ctx.lineTo(bx + 6 * u, by - 9.5 * u); ctx.stroke()
      ctx.globalCompositeOperation = 'lighter'; var rg = ctx.createRadialGradient(bx + 2 * u, by - 16.5 * u, 0, bx + 2 * u, by - 16.5 * u, 6 * u); rg.addColorStop(0, 'rgba(255,70,70,.9)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = rg; ctx.fillRect(bx - 4 * u, by - 23 * u, 12 * u, 12 * u); ctx.globalCompositeOperation = 'source-over'
      var tx = s.px + 7 * u, ty = by - 9 * u
      ctx.strokeStyle = 'rgba(205,215,255,.95)'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 4.5 * u, by); ctx.moveTo(tx, ty); ctx.lineTo(tx + 4.5 * u, by); ctx.moveTo(tx, ty); ctx.lineTo(tx + .5 * u, by); ctx.moveTo(tx - 2.6 * u, ty + 5 * u); ctx.lineTo(tx + 2.6 * u, ty + 5 * u); ctx.stroke()
      ctx.save(); ctx.translate(tx, ty - 1.5 * u); ctx.rotate(-.5)
      ctx.fillStyle = '#121a3c'; ctx.fillRect(-7 * u, -1.8 * u, 16 * u, 3.6 * u); ctx.strokeRect(-7 * u, -1.8 * u, 16 * u, 3.6 * u)
      ctx.fillRect(9 * u, -2.4 * u, 5 * u, 4.8 * u); ctx.strokeRect(9 * u, -2.4 * u, 5 * u, 4.8 * u)
      ctx.beginPath(); ctx.moveTo(-1 * u, -1.8 * u); ctx.lineTo(-1 * u, -4 * u); ctx.lineTo(4 * u, -4 * u); ctx.lineTo(4 * u, -1.8 * u); ctx.stroke()
      ctx.fillStyle = '#f8d874'; ctx.fillRect(-9 * u, -1 * u, 2 * u, 2 * u)
      ctx.restore()

      /* datos fisicos */
      var dip = Math.sqrt(2 * alt / REARTH) * 180 / Math.PI, temp = Math.round(15 - 6.5 * alt / 1000)
      var fz = Math.max(10, Math.min(12, W / 48)), lx = 12, ly = (W < 420 ? 48 : 16)
      ctx.font = '400 ' + fz + 'px ' + SERIF; ctx.textBaseline = 'top'
      ;[[LBL.air, Math.round(P * 100) + ' %'], [LBL.hor, (dip > 0.05 ? '−' : '') + dip.toFixed(1).replace('.', ',') + '°'], [LBL.tmp, temp + ' °C']].forEach(function (r, i) {
        var yy2 = ly + i * (fz + 6); ctx.fillStyle = '#8f98c0'; ctx.fillText(r[0], lx, yy2); var wv = ctx.measureText(r[0] + '  ').width; ctx.fillStyle = '#f5f7ff'; ctx.fillText(r[1], lx + wv, yy2)
      })
    }

    function frame(now) {
      if (dead) return
      if (!cv.isConnected) { dead = true; return }
      if (S && W > 0) { cur += (target - cur) * .1; if (Math.abs(target - cur) < .5) cur = target; draw(now) }
      raf = requestAnimationFrame(frame)
    }
    var resize = function () { if (dead) return; build() }
    var onLang = function () { texts() }
    window.addEventListener('vc-lang', onLang)
    var ro = null
    try { ro = new ResizeObserver(resize); ro.observe(host) } catch (e) { window.addEventListener('resize', resize) }
    build(); setAlt(1000, true)
    raf = requestAnimationFrame(frame)
    return {
      setAlt: setAlt,
      destroy: function () { dead = true; cancelAnimationFrame(raf); window.removeEventListener('vc-lang', onLang); window.removeEventListener('resize', resize); if (ro) ro.disconnect() }
    }
  }
  window.vcEntorno = { mount: mount }
})()
