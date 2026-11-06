/* Meteorologia interactiva: un telescopio en el campo apunta a Saturno. Dos barras controlan la turbulencia (seeing) y la
   humedad/nubes. Arriba a la izquierda se ven el seeing (0,8" a 4,0"), la humedad relativa, el punto de rocio (formula de
   Magnus con el aire a 8 C) y el viento. En los oculares de la esquina, Saturno ondula y se desenfoca con mala estabilidad y
   una estrella brillante pasa de disco de Airy a una mancha que hierve; con humedad aparecen cirros, halos y niebla al suelo.
   window.vcMeteo.mount(host) -> { destroy() } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var clamp = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)) }
  var lerp = function (a, b, t) { return a + (b - a) * t }
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function hash1(i) { var h = Math.imul(i | 0, 374761393) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
  function noise1(x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u) * 2 - 1 }
  var TAIR = 8 // temperatura del aire de la noche (C)

  var CSS = '.mt-c{flex:1;min-width:0;height:100%;display:block;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}' +
    '.mt-s{flex:none;width:clamp(84px,11vw,112px);box-sizing:border-box;display:flex;gap:2px;padding:10px 2px 12px;border-left:1px solid #343d63;background:linear-gradient(180deg,#0e1430e6,#0a0f26e6);user-select:none;-webkit-user-select:none}' +
    '.mt-col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px}' +
    '.mt-ic{flex:none;width:22px;height:22px;color:#b9c9ff}.mt-ic svg{width:100%;height:100%;display:block}' +
    '.mt-h{flex:none;font:400 9px/1.15 ' + SERIF + ';color:#8f98c0;text-align:center;overflow-wrap:anywhere;max-width:100%}' +
    '.mt-n{flex:none;font:400 15px/1 ' + SERIF + ';color:#f5f7ff;margin-bottom:4px}' +
    '.mt-tr{position:relative;flex:1;min-height:0;width:100%;touch-action:none;cursor:pointer;outline:none}' +
    '.mt-tr::before{content:"";position:absolute;top:12px;bottom:12px;left:50%;width:1px;background:#343d63}' +
    '.mt-f{position:absolute;bottom:12px;left:50%;width:3px;margin-left:-1px;border-radius:2px}' +
    '.mt-k{position:absolute;left:50%;width:22px;height:22px;margin:-11px 0 0 -11px;box-sizing:border-box;border-radius:50%;border:1.5px solid #f8d874;background:#0b1025;box-shadow:0 0 12px rgba(248,216,116,.5);transition:transform .2s ease;pointer-events:none}' +
    '.mt-k::after{content:"";position:absolute;inset:5px;border-radius:50%;background:#f8d874}' +
    '.mt-tr:hover .mt-k,.mt-tr:focus-visible .mt-k,.mt-tr.drag .mt-k{transform:scale(1.15)}' +
    '.mt-short .mt-h{display:none}@media(max-width:700px){.mt-h{display:none}}@media(min-width:701px) and (max-width:1000px){.mt-s{width:124px}.mt-h{overflow-wrap:normal}}'
  var IC_WIND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>'
  var IC_DROP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" stroke="#f8d874"/></svg>'

  var GLOW = null
  function glowSprite() {
    if (GLOW) return GLOW
    var c = document.createElement('canvas'); c.width = c.height = 64
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.2, 'rgba(255,230,170,.45)'); g.addColorStop(.55, 'rgba(240,220,180,.1)'); g.addColorStop(1, 'rgba(240,220,180,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); GLOW = c; return c
  }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c }
  /* Saturno con sus bandas y anillos (division de Cassini), dibujado una vez */
  var SAT = null
  function saturn() {
    if (SAT) return SAT
    var S = 320, c = mk(S, S), g = c.getContext('2d'), cx = S / 2, cy = S / 2, pr = S * .2, rx = S * .47, ry = S * .16, tilt = -.38
    var ring = function (front) {
      g.save(); g.translate(cx, cy); g.rotate(tilt)
      g.beginPath(); g.rect(-S, front ? 0 : -S, S * 2, S); g.clip()
      ;[[1, .86, 'rgba(222,205,160,.95)'], [.84, .8, 'rgba(20,18,30,.85)'], [.79, .64, 'rgba(236,220,178,.98)'], [.63, .56, 'rgba(170,150,110,.55)']].forEach(function (r) {
        g.beginPath(); g.ellipse(0, 0, rx * r[0], ry * r[0], 0, 0, 6.283); g.ellipse(0, 0, rx * r[1], ry * r[1], 0, 0, 6.283, true); g.fillStyle = r[2]; g.fill()
      })
      g.restore()
    }
    ring(false)
    g.save(); g.beginPath(); g.arc(cx, cy, pr, 0, 6.283); g.clip()
    var pg = g.createLinearGradient(cx, cy - pr, cx, cy + pr); pg.addColorStop(0, '#d9c58e'); pg.addColorStop(.5, '#f0e2b6'); pg.addColorStop(1, '#b89f68'); g.fillStyle = pg; g.fillRect(cx - pr, cy - pr, pr * 2, pr * 2)
    g.translate(cx, cy); g.rotate(tilt)
    ;[[-.55, .12, 'rgba(160,130,80,.45)'], [-.25, .1, 'rgba(180,150,95,.4)'], [.18, .08, 'rgba(170,140,90,.35)'], [.5, .14, 'rgba(140,115,75,.45)']].forEach(function (b) { g.fillStyle = b[2]; g.fillRect(-pr * 1.2, b[0] * pr, pr * 2.4, b[1] * pr) })
    g.setTransform(1, 0, 0, 1, 0, 0)
    var sh = g.createRadialGradient(cx - pr * .35, cy - pr * .35, pr * .2, cx, cy, pr * 1.05); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.55)'); g.fillStyle = sh; g.fillRect(0, 0, S, S)
    g.restore()
    ring(true)
    SAT = c; return c
  }

  function mount(host) {
    if (!document.getElementById('mt-css')) { var st = document.createElement('style'); st.id = 'mt-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var cv = document.createElement('canvas'); cv.className = 'mt-c'; cv.setAttribute('role', 'img')
    var side = document.createElement('div'); side.className = 'mt-s'
    host.append(cv, side)
    var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    /* ---------- dos barras: turbulencia y humedad ---------- */
    var val = { turb: .3, hum: .35 }, cur = { turb: .3, hum: .35 }, sliders = []
    function slider(key, icon, grad) {
      var col = document.createElement('div'); col.className = 'mt-col'
      col.innerHTML = '<div class="mt-ic">' + icon + '</div><div class="mt-h"></div><div class="mt-n"></div><div class="mt-tr" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"><div class="mt-f" style="background:' + grad + '"></div><div class="mt-k"></div></div>'
      side.append(col)
      var tr = col.querySelector('.mt-tr'), k = col.querySelector('.mt-k'), f = col.querySelector('.mt-f'), n = col.querySelector('.mt-n'), h = col.querySelector('.mt-h'), drag = false
      var sObj = {
        key: key, h: h, tr: tr,
        place: function () { var span = Math.max(1, tr.clientHeight - 24), p = val[key]; k.style.top = (12 + (1 - p) * span) + 'px'; f.style.height = (p * span) + 'px'; n.textContent = Math.round(p * 100); tr.setAttribute('aria-valuenow', Math.round(p * 100)) }
      }
      var set = function (p) { val[key] = clamp(p); if (reduce) cur[key] = val[key]; sObj.place() }
      var fromY = function (y) { var r = tr.getBoundingClientRect(); set(1 - (y - r.top - 12) / Math.max(1, r.height - 24)) }
      tr.addEventListener('pointerdown', function (e) { drag = true; tr.classList.add('drag'); try { tr.setPointerCapture(e.pointerId) } catch (x) { } fromY(e.clientY) })
      tr.addEventListener('pointermove', function (e) { if (drag) fromY(e.clientY) })
      var stop = function () { drag = false; tr.classList.remove('drag') }
      tr.addEventListener('pointerup', stop); tr.addEventListener('pointercancel', stop)
      tr.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? .05 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -.05 : 0
        if (e.key === 'Home') { e.preventDefault(); set(0); return } if (e.key === 'End') { e.preventDefault(); set(1); return }
        if (!d) return; e.preventDefault(); set(val[key] + d)
      })
      sliders.push(sObj); return sObj
    }
    slider('turb', IC_WIND, 'linear-gradient(0deg,#5b6bb4,#b9c9ff)')
    slider('hum', IC_DROP, 'linear-gradient(0deg,#5b6bb4,#f8d874)')
    var LBL = {}
    function texts() {
      sliders[0].h.textContent = T('Turbulencia'); sliders[0].tr.setAttribute('aria-label', T('Turbulencia'))
      sliders[1].h.textContent = T('Humedad'); sliders[1].tr.setAttribute('aria-label', T('Humedad'))
      cv.setAttribute('aria-label', T('Meteorología'))
      LBL = { see: T('Seeing'), rh: T('Humedad relativa'), dew: T('Punto de rocío'), wind: T('Viento'), lens: T('Rocío en la lente') }
    }
    texts()
    function placeAll() { sliders.forEach(function (s) { s.place() }) }

    /* ---------- escena fija ---------- */
    var W = 0, H = 0, K = 0, dpr = 1, ctx = cv.getContext('2d'), raf = 0, dead = false, S = null, lastDraw = 0
    function build() {
      var r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); K = Math.min(H, W * 1.25); dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      host.classList.toggle('mt-short', host.clientHeight < 380)
      placeAll()
      var R = rng(5), yG = H - K * .16, s = { yG: yG }
      /* oculares: Saturno grande y una estrella brillante, en la esquina superior derecha */
      var narrow = W < 420
      s.oR = Math.max(36, Math.min(W * (narrow ? .23 : .16), H * .19)); s.oX = W - s.oR - 12; s.oY = (narrow ? 150 : 14) + s.oR
      s.o2R = s.oR * .55; s.o2X = s.oX - s.oR * .5; s.o2Y = s.oY + s.oR + s.o2R + 12
      /* posiciones en el cielo de Saturno y de la estrella (Vega) */
      s.sat = { x: W * (narrow ? .55 : .58), y: yG - K * .5 }
      s.star = { x: W * (narrow ? .3 : .4), y: yG - K * .7 }
      s.stars = []
      for (var i = 0, n = Math.round(W * yG / 420); i < n; i++) { var mg = Math.pow(R(), 3); s.stars.push({ x: R() * W, y: Math.pow(R(), 1.1) * (yG - 4), r: .35 + mg * 1.5, a: .3 + mg * .7, ph: R() * 6.28, f: .7 + R() * 1.6, c: R() < .15 ? '255,214,180' : R() > .85 ? '190,210,255' : '232,238,255' }) }
      /* paisaje: colinas y pinos (los pinos se mueven con el viento, se dibujan cada fotograma) */
      var land = mk(cv.width, cv.height), g = land.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineJoin = 'round'
      var hill = function (x, k2, a2) { return yG - K * (a2 + .05 * Math.sin(x / W * 5 + k2) + .03 * Math.sin(x / W * 13 + k2 * 2)) }
      g.beginPath(); g.moveTo(0, yG); for (var x = 0; x <= W + 2; x += 3) g.lineTo(x, hill(x, 1.3, .1)); g.lineTo(W + 2, yG); g.closePath(); g.fillStyle = '#0d1433'; g.fill(); g.strokeStyle = 'rgba(110,126,204,.5)'; g.lineWidth = 1; g.stroke()
      g.beginPath(); g.moveTo(0, yG); for (x = 0; x <= W + 2; x += 3) g.lineTo(x, hill(x, 4.1, .05)); g.lineTo(W + 2, yG); g.closePath(); g.fillStyle = '#0a1028'; g.fill(); g.strokeStyle = 'rgba(138,160,230,.7)'; g.stroke()
      var vg = g.createLinearGradient(0, yG, 0, H); vg.addColorStop(0, '#0a0f26'); vg.addColorStop(1, '#05070f'); g.fillStyle = vg; g.fillRect(0, yG, W, H - yG)
      g.strokeStyle = 'rgba(120,136,212,.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, yG); g.lineTo(W, yG); g.stroke()
      for (var gl = 1; gl < 4; gl++) { var yq = yG + (H - yG) * Math.pow(gl / 4, 1.5); g.strokeStyle = 'rgba(79,92,156,' + (.4 - gl * .08) + ')'; g.lineWidth = .8; g.beginPath(); for (x = 0; x <= W; x += 4) { var y4 = yq + Math.sin(x * .03 + gl * 2) * 1.4; x ? g.lineTo(x, y4) : g.moveTo(x, y4) } g.stroke() }
      s.land = land
      s.pines = []; for (var p = 0; p < 9; p++) s.pines.push({ x: W * (narrow ? .55 + R() * .45 : .62 + R() * .38), h: K * (.06 + R() * .07), ph: R() * 6.28 })
      s.pines.sort(function (a, b) { return a.h - b.h })
      s.tx = W * (narrow ? .2 : .2); s.cir = []; for (var c = 0; c < 7; c++) s.cir.push({ y: yG * (.12 + R() * .55), x: R(), w: .35 + R() * .5, th: K * (.006 + R() * .01), sp: .4 + R() * .8 })
      S = s
    }

    function pine(x, y, h, sway) {
      var w = h * .5
      ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, sway, 1, 0, 0)
      ctx.strokeStyle = 'rgba(150,170,235,.5)'; ctx.lineWidth = Math.max(.6, h * .04); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h * .22); ctx.stroke()
      for (var i = 0; i < 4; i++) {
        var q = i / 4, ty = -h + h * q * .74, bw = w * (.3 + q * .72) / 2, by = ty + h * .4, m = by - ty
        ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(bw * .55, ty + m * .6); ctx.lineTo(bw * .4, ty + m * .62); ctx.lineTo(bw, by); ctx.quadraticCurveTo(0, by - h * .07, -bw, by); ctx.lineTo(-bw * .4, ty + m * .62); ctx.lineTo(-bw * .55, ty + m * .6); ctx.closePath()
        ctx.fillStyle = i % 2 ? '#0d1532' : '#101a3c'; ctx.fill(); ctx.strokeStyle = 'rgba(110,126,204,.75)'; ctx.lineWidth = .7; ctx.stroke()
      }
      ctx.restore()
    }

    /* ocular: circulo con Saturno, que ondula y se desenfoca con la turbulencia y pierde contraste con la humedad */
    function eyepieceSaturn(t, tu, hu) {
      var s = S, R = s.oR, cx = s.oX, cy = s.oY, img = saturn(), sz = R * 1.75
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.clip()
      ctx.fillStyle = '#03040c'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
      var jx = tu * R * .05 * noise1(t * 3.1), jy = tu * R * .05 * noise1(t * 2.7 + 9)
      var amp = tu * R * .035, blur = tu * R * .028, slices = 36, sh = sz / slices
      var copies = blur > .4 ? [[-blur, 0], [blur, 0], [0, -blur], [0, blur], [0, 0]] : [[0, 0]]
      ctx.globalAlpha = (copies.length > 1 ? .32 : 1) * (1 - .45 * hu)
      for (var c = 0; c < copies.length; c++) for (var i = 0; i < slices; i++) {
        var yy = i * sh, dx = amp * Math.sin(i * .55 + t * (4 + 10 * tu)) + amp * .6 * noise1(i * .3 + t * 6)
        ctx.drawImage(img, 0, i * img.height / slices, img.width, img.height / slices + .5, cx - sz / 2 + dx + jx + copies[c][0], cy - sz / 2 + yy + jy + copies[c][1], sz, sh + .5)
      }
      ctx.globalAlpha = 1
      /* lunas de Saturno (Titan) */
      ctx.fillStyle = 'rgba(240,230,200,.8)'; ctx.beginPath(); ctx.arc(cx - R * .62 + jx, cy + R * .2 + jy, Math.max(1, R * .018 + tu * 1.2), 0, 6.283); ctx.fill()
      /* humedad: velo que quita contraste */
      if (hu > .05) { ctx.fillStyle = 'rgba(120,130,165,' + (.22 * hu) + ')'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2) }
      ctx.restore()
      ctx.strokeStyle = 'rgba(138,180,255,.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke()
      ctx.strokeStyle = 'rgba(91,107,180,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R + 3, 0, 6.283); ctx.stroke()
    }
    /* ocular de la estrella: disco de Airy con su anillo cuando el aire esta quieto; motas (speckles) que hierven si hay turbulencia */
    function eyepieceStar(t, tu, hu) {
      var s = S, R = s.o2R, cx = s.o2X, cy = s.o2Y, r0 = R * .06
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.clip()
      ctx.fillStyle = '#03040c'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
      ctx.globalCompositeOperation = 'lighter'
      var spread = r0 * (1 + 9 * tu), n = Math.round(2 + 26 * tu), fr = Math.floor(t * (8 + 22 * tu))
      if (tu < .25) { ctx.strokeStyle = 'rgba(220,230,255,' + (.5 * (1 - tu / .25)) + ')'; ctx.lineWidth = Math.max(.6, r0 * .35); ctx.beginPath(); ctx.arc(cx, cy, r0 * 2.4, 0, 6.283); ctx.stroke() }
      for (var i = 0; i < n; i++) {
        var a = hash1(fr * 97 + i * 13) * 6.283, d = Math.sqrt(hash1(fr * 31 + i * 7)) * spread * (tu > .02 ? 1 : 0), rr = r0 * (.9 + hash1(i + fr) * .8)
        var gg = ctx.createRadialGradient(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr * 2)
        var col = ['200,220,255', '255,255,255', '255,210,210', '210,255,230'][(i + fr) % 4]
        gg.addColorStop(0, 'rgba(' + (tu > .3 ? col : '235,242,255') + ',' + (i === 0 ? 1 : .55) + ')'); gg.addColorStop(1, 'rgba(200,220,255,0)')
        ctx.fillStyle = gg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
      }
      /* halo por humedad */
      if (hu > .4) { var hg = ctx.createRadialGradient(cx, cy, r0, cx, cy, R * .9); hg.addColorStop(0, 'rgba(200,210,240,' + (.35 * sstep(.4, 1, hu)) + ')'); hg.addColorStop(1, 'rgba(200,210,240,0)'); ctx.fillStyle = hg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2) }
      ctx.restore()
      ctx.strokeStyle = 'rgba(138,180,255,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke()
      ctx.strokeStyle = 'rgba(91,107,180,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R + 2.5, 0, 6.283); ctx.stroke()
    }
    /* linea de llamada desde un astro hasta su ocular (lineas tangentes, como una lupa) */
    function callout(px, py, cx, cy, R) {
      var dx = cx - px, dy = cy - py, d = Math.hypot(dx, dy); if (d <= R) return
      var a = Math.atan2(dy, dx), b = Math.asin(R / d)
      ctx.strokeStyle = 'rgba(138,180,255,.28)'; ctx.lineWidth = .8; ctx.setLineDash([3, 4]); ctx.beginPath()
      ;[-1, 1].forEach(function (sg) { var tl = Math.sqrt(d * d - R * R), an = a + sg * b; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(an) * tl, py + Math.sin(an) * tl) })
      ctx.stroke(); ctx.setLineDash([])
    }

    function draw(now) {
      var t = now / 1000, s = S, yG = s.yG, tu = cur.turb, hu = cur.hum
      /* magnitudes fisicas */
      var seeing = .8 + 3.2 * tu, wind = 3 + 42 * tu * tu + 6 * tu, rh = 30 + 68 * hu
      var bM = 17.62, cM = 243.12, gam = Math.log(rh / 100) + bM * TAIR / (cM + TAIR), dew = cM * gam / (bM - gam)
      var dewRisk = sstep(3, .8, TAIR - dew)
      var cirrus = sstep(.4, .9, hu), fog = sstep(.6, .95, hu) * (1 - .7 * sstep(.3, .8, tu)), trans = 1 - .55 * sstep(.25, 1, hu)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      var sky = ctx.createLinearGradient(0, 0, 0, yG); sky.addColorStop(0, '#03040c'); sky.addColorStop(.6, '#0a1027'); sky.addColorStop(1, 'rgb(' + Math.round(lerp(18, 40, hu)) + ',' + Math.round(lerp(24, 40, hu)) + ',' + Math.round(lerp(52, 62, hu)) + ')')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      /* estrellas: centellean mas rapido y con mas amplitud cuanto peor es el seeing; la humedad apaga las debiles */
      var fq = 1 + 9 * tu, am = .08 + .62 * tu
      for (var i = 0; i < s.stars.length; i++) {
        var st = s.stars[i], low = clamp(st.y / yG), al = st.a * trans * (st.r < .7 ? lerp(1, .25, hu) : 1) * (1 - am * (.5 + .5 * low) * (.5 + .5 * Math.sin(t * fq * st.f * 2 + st.ph)))
        if (al < .03) continue
        var jx = tu > .5 ? noise1(t * 5 + i) * (tu - .5) * 1.6 : 0
        ctx.fillStyle = 'rgba(' + st.c + ',' + al + ')'
        if (st.r < .9) ctx.fillRect(st.x + jx, st.y, st.r * 1.4, st.r * 1.4); else { ctx.beginPath(); ctx.arc(st.x + jx, st.y, st.r, 0, 6.283); ctx.fill() }
      }
      /* astros brillantes del cielo: Saturno (amarillento) y Vega; con humedad, resplandor y halo */
      var G = glowSprite()
      ;[[s.sat, '255,236,190', 2.4], [s.star, '225,235,255', 2.2]].forEach(function (b, k) {
        var o = b[0], tw = 1 - (.15 + .6 * tu) * (.5 + .5 * Math.sin(t * fq * (k ? 3.1 : 1.7)))
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55 * tw + .4 * hu; var gr = 12 + 30 * hu; ctx.drawImage(G, o.x - gr, o.y - gr, gr * 2, gr * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = 'rgba(' + b[1] + ',' + (.95 * tw) + ')'; ctx.beginPath(); ctx.arc(o.x, o.y, b[2], 0, 6.283); ctx.fill()
        if (cirrus > .25) { var hr = K * .07; ctx.strokeStyle = 'rgba(210,220,255,' + (.18 * sstep(.25, .9, cirrus)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x, o.y, hr, 0, 6.283); ctx.stroke(); ctx.strokeStyle = 'rgba(255,200,170,' + (.08 * cirrus) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(o.x, o.y, hr - 2.5, 0, 6.283); ctx.stroke() }
      })
      /* cirros altos: bandas finas que avanzan con el viento */
      if (cirrus > .01) s.cir.forEach(function (c2, k) {
        var x0 = ((c2.x + t * .004 * c2.sp * (1 + wind / 10)) % 1.6 - .3) * W, w = c2.w * W, y = c2.y
        ctx.save(); ctx.translate(x0, y); ctx.rotate(-.08)
        for (var j = 0; j < 4; j++) {
          var yy = j * c2.th * 1.4, gr2 = ctx.createLinearGradient(0, 0, w, 0); gr2.addColorStop(0, 'rgba(190,200,235,0)'); gr2.addColorStop(.3, 'rgba(190,200,235,' + (.16 * cirrus) + ')'); gr2.addColorStop(.7, 'rgba(190,200,235,' + (.12 * cirrus) + ')'); gr2.addColorStop(1, 'rgba(190,200,235,0)')
          ctx.fillStyle = gr2; ctx.beginPath(); ctx.ellipse(w / 2 + j * w * .05, yy, w / 2, c2.th * .6, 0, 0, 6.283); ctx.fill()
        }
        ctx.strokeStyle = 'rgba(205,215,250,' + (.18 * cirrus) + ')'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(w * .15, -c2.th); ctx.quadraticCurveTo(w * .5, -c2.th * 2.2, w * .9, -c2.th * .6); ctx.stroke()
        ctx.restore()
      })
      /* paisaje y pinos que se mecen con el viento */
      ctx.drawImage(s.land, 0, 0, W, H)
      s.pines.forEach(function (p) { pine(p.x, yG + 1, p.h, (wind / 45) * (.12 + .08 * Math.sin(t * (1 + wind / 15) + p.ph))) })

      /* telescopio en su tripode apuntando a Saturno, con el observador */
      var u = Math.max(.9, K / 480), tx = s.tx, by = yG, ty = by - 22 * u, ang = Math.atan2(s.sat.y - ty, s.sat.x - tx)
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(205,215,255,.95)'
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 10 * u, by); ctx.moveTo(tx, ty); ctx.lineTo(tx + 10 * u, by); ctx.moveTo(tx, ty); ctx.lineTo(tx + 1.5 * u, by); ctx.moveTo(tx - 6 * u, ty + 12 * u); ctx.lineTo(tx + 6 * u, ty + 12 * u); ctx.stroke()
      ctx.fillStyle = '#121a3c'; ctx.beginPath(); ctx.arc(tx, ty, 3 * u, 0, 6.283); ctx.fill(); ctx.stroke()
      ctx.save(); ctx.translate(tx, ty - 2 * u); ctx.rotate(ang)
      ctx.fillStyle = '#121a3c'; ctx.fillRect(-14 * u, -3.4 * u, 34 * u, 6.8 * u); ctx.strokeRect(-14 * u, -3.4 * u, 34 * u, 6.8 * u)
      ctx.fillRect(20 * u, -4.2 * u, 10 * u, 8.4 * u); ctx.strokeRect(20 * u, -4.2 * u, 10 * u, 8.4 * u)
      /* cinta calefactora anti-rocio (se enciende en ambar con riesgo de rocio) */
      ctx.fillStyle = dewRisk > .2 ? 'rgba(248,170,90,' + (.5 + .4 * dewRisk) + ')' : '#1a2350'; ctx.fillRect(17 * u, -3.8 * u, 2.6 * u, 7.6 * u)
      ctx.beginPath(); ctx.moveTo(-2 * u, -3.4 * u); ctx.lineTo(-2 * u, -7 * u); ctx.lineTo(9 * u, -7 * u); ctx.lineTo(9 * u, -3.4 * u); ctx.stroke()
      ctx.fillStyle = '#f8d874'; ctx.fillRect(-17 * u, -1.5 * u, 3 * u, 3 * u)
      /* gotas de rocio en el parasol */
      if (dewRisk > .05) { ctx.fillStyle = 'rgba(200,225,255,' + (.8 * dewRisk) + ')'; for (var dd = 0; dd < 7; dd++) { ctx.beginPath(); ctx.arc(21 * u + hash1(dd) * 8 * u, -4.2 * u + hash1(dd + 9) * 8.4 * u, (.6 + hash1(dd + 4) * .7) * u, 0, 6.283); ctx.fill() } }
      ctx.restore()
      /* linea de punteria */
      ctx.setLineDash([2, 5]); ctx.strokeStyle = 'rgba(248,216,116,.45)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(tx + Math.cos(ang) * 30 * u, ty - 2 * u + Math.sin(ang) * 30 * u); ctx.lineTo(s.sat.x, s.sat.y); ctx.stroke(); ctx.setLineDash([])
      var px = tx - 14 * u
      ctx.strokeStyle = 'rgba(205,215,255,.95)'; ctx.fillStyle = '#0b1025'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(px - 3.4 * u, by - 7 * u); ctx.lineTo(px - 3 * u, by - 15 * u); ctx.quadraticCurveTo(px, by - 17 * u, px + 3 * u, by - 15 * u); ctx.lineTo(px + 3.4 * u, by - 7 * u); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(px - 1.8 * u, by - 7 * u); ctx.lineTo(px - 2.2 * u, by); ctx.moveTo(px + 1.8 * u, by - 7 * u); ctx.lineTo(px + 2.2 * u, by); ctx.moveTo(px + 3 * u, by - 13.5 * u); ctx.lineTo(tx - 13 * u, ty - 1 * u); ctx.stroke()
      ctx.beginPath(); ctx.arc(px, by - 19.6 * u, 2.8 * u, 0, 6.283); ctx.fill(); ctx.stroke()
      ctx.globalCompositeOperation = 'lighter'; var rg = ctx.createRadialGradient(px + 2.2 * u, by - 20.5 * u, 0, px + 2.2 * u, by - 20.5 * u, 6 * u); rg.addColorStop(0, 'rgba(255,70,70,.9)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = rg; ctx.fillRect(px - 4 * u, by - 27 * u, 12 * u, 12 * u); ctx.globalCompositeOperation = 'source-over'

      /* niebla a ras de suelo: se forma con mucha humedad y poco viento */
      if (fog > .01) {
        var fg = ctx.createLinearGradient(0, yG - K * .09, 0, H); fg.addColorStop(0, 'rgba(170,180,215,0)'); fg.addColorStop(.45, 'rgba(170,180,215,' + (.3 * fog) + ')'); fg.addColorStop(1, 'rgba(150,160,200,' + (.4 * fog) + ')')
        ctx.fillStyle = fg; ctx.fillRect(0, yG - K * .09, W, H - yG + K * .09)
        ctx.strokeStyle = 'rgba(205,215,250,' + (.35 * fog) + ')'; ctx.lineWidth = .9
        for (var fl = 0; fl < 4; fl++) { var fy = yG - K * (.015 + fl * .018), off = (t * (8 + wind) * (fl % 2 ? -1 : 1)) % 60; ctx.beginPath(); for (var x = -60; x <= W + 60; x += 6) { var yy2 = fy + Math.sin((x + off) * .045 + fl) * 2.2; x === -60 ? ctx.moveTo(x + off, yy2) : ctx.lineTo(x + off, yy2) } ctx.stroke() }
      }

      /* oculares y sus lineas de llamada */
      callout(s.sat.x, s.sat.y, s.oX, s.oY, s.oR); callout(s.star.x, s.star.y, s.o2X, s.o2Y, s.o2R)
      eyepieceSaturn(t, tu, hu); eyepieceStar(t, tu, hu)

      /* indicadores */
      var es = !(window.vcI18n && vcI18n.lang === 'en'), fmt = function (v, d) { var s2 = v.toFixed(d); return es ? s2.replace('.', ',') : s2 }
      var fz = Math.max(10, Math.min(12, W / 50)), lx = 12, ly = W < 420 ? 48 : 16
      ctx.font = '400 ' + fz + 'px ' + SERIF; ctx.textBaseline = 'top'
      ;[[LBL.see, fmt(seeing, 1) + '″', tu > .6], [LBL.rh, Math.round(rh) + ' %', false], [LBL.dew, fmt(dew, 1) + ' °C', dewRisk > .3], [LBL.wind, Math.round(wind) + ' km/h', wind > 25]].forEach(function (r, i) {
        var yy3 = ly + i * (fz + 6); ctx.fillStyle = '#8f98c0'; ctx.fillText(r[0], lx, yy3); var wv = ctx.measureText(r[0] + '  ').width; ctx.fillStyle = r[2] ? '#f8d874' : '#f5f7ff'; ctx.fillText(r[1], lx + wv, yy3)
      })
      if (dewRisk > .3) { ctx.fillStyle = 'rgba(248,216,116,' + (.6 + .4 * Math.sin(t * 4)) + ')'; ctx.fillText('● ' + LBL.lens, lx, ly + 4 * (fz + 6) + 2) }
    }

    function frame(now) {
      if (dead) return
      if (!cv.isConnected) { dead = true; return }
      if (S && W > 0) {
        var moving = false
        ;['turb', 'hum'].forEach(function (k) { cur[k] += (val[k] - cur[k]) * .12; if (Math.abs(val[k] - cur[k]) < .002) cur[k] = val[k]; else moving = true })
        /* con las barras quietas basta con 30 fotogramas por segundo (menos consumo) */
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
  window.vcMeteo = { mount: mount }
})()
