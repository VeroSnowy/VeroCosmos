/* Vero: mascota de Vero Cosmos. Icono junto al selector de idioma en toda la web.
   Primera visita: el icono brilla en amarillo y da botes. Primera pulsacion: se presenta y pregunta si se queda activa.
   Despues: un consejo y el "dato del dia". La decision se guarda en localStorage ("vc-vero" = on | off). */
(function () {
  'use strict'
  if (window.vcVero) return
  var BASE = 'vero/', KEY = 'vc-vero', GLOW = 'vc-vero-glow', SEEN = 'vc-vero-seen'
  var TIPS = [
    'Si no sabes por dónde empezar, prueba «Lugar para observar»: calcula lo oscuro que es tu cielo.',
    'Deja que tus ojos se acostumbren a la oscuridad unos 20 minutos antes de observar.',
    'Las luces rojas molestan menos a la vista que las blancas cuando observas de noche.',
    'Abre cualquier ficha del atlas para ver sus datos y dónde encontrar el objeto en el cielo.'
  ]
  var FACTS = [
    'La Nebulosa de Orión (M42) se ve a simple vista como la «estrella» borrosa del centro de la Espada de Orión.',
    'Un día en Venus dura más que su año: gira sobre sí misma en unos 243 días terrestres y orbita al Sol en unos 225.',
    'La Luna se aleja de la Tierra unos 3,8 centímetros cada año.',
    'Saturno es menos denso que el agua: si hubiera una piscina lo bastante grande, flotaría.',
    'La galaxia de Andrómeda se acerca a la nuestra a unos 110 km/s, aunque el choque no llegará hasta dentro de miles de millones de años.',
    'La luz del Sol tarda unos 8 minutos y 20 segundos en llegar a la Tierra.',
    'Las Pléyades (M45) son un cúmulo joven: se formaron hace unos 100 millones de años, cuando ya había dinosaurios.',
    'La luz que ves hoy de Andrómeda salió hace unos 2,5 millones de años.'
  ]
  var CSS = '' +
    '#vc-vero{position:fixed;top:12px;right:64px;z-index:18;font:400 16px/1.4 "Iowan Old Style","Palatino Linotype",Georgia,serif}' +
    '#vc-vero.vv-flex{position:static;top:auto;right:auto;flex:none}' +
    'body.lugar-on #vc-vero{z-index:100004}' +
    '#vc-vero .vv-i{position:relative;display:block;width:40px;height:40px;padding:0;border:1px solid #232846;border-radius:10px;background:#0e1226ef;cursor:pointer;overflow:visible;transition:border-color .18s,background .18s}' +
    '#vc-vero .vv-i:hover,#vc-vero .vv-i:focus-visible{border-color:#5b6bb4;background:#141a3a;outline:none}' +
    '#vc-vero .vv-i img{display:block;width:100%;height:100%;border-radius:9px;object-fit:cover;pointer-events:none}' +
    '#vc-vero .vv-i.hi{border-color:#f8d874;animation:vvb 1.4s ease-in-out infinite,vvg 1.4s ease-in-out infinite}' +
    '#vc-vero .vv-p{position:absolute;right:-3px;top:-3px;width:11px;height:11px;border-radius:50%;background:#f8d874;box-shadow:0 0 8px #f8d874}' +
    '#vc-vero .vv-p[hidden]{display:none}' +
    '#vc-vero .vv-b{position:fixed;top:60px;right:12px;width:min(310px,calc(100vw - 24px));padding:12px 16px;border:1.5px solid #5b6bb4;border-radius:16px;background:#0b1025;color:#e8edff;box-shadow:0 12px 30px #02030acc;display:none}' +
    '#vc-vero .vv-b.on{display:block;animation:vvin .3s both}' +
    '#vc-vero .vv-b:before{content:"";position:absolute;top:-8px;right:var(--vv-ax,40px);width:14px;height:14px;background:#0b1025;border:1.5px solid #5b6bb4;border-bottom:0;border-right:0;transform:rotate(45deg)}' +
    '#vc-vero .vv-n,#vc-vero-intro .vv-n{font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:#f8d874;margin-bottom:2px}' +
    '#vc-vero .vv-d{margin-top:10px;padding-top:8px;border-top:1px solid #232a4f}' +
    '#vc-vero .vv-x{position:absolute;right:6px;top:2px;width:30px;height:30px;border:0;background:none;color:#8f98c0;font-size:20px;cursor:pointer}' +
    '#vc-vero .vv-h{display:block;margin-top:10px;padding:0;border:0;background:none;color:#8f98c0;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}' +
    '@keyframes vvin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
    '@keyframes vvb{0%,100%{transform:translateY(0)}18%{transform:translateY(-10px)}36%{transform:translateY(0)}52%{transform:translateY(-5px)}68%{transform:translateY(0)}}' +
    '@keyframes vvg{0%,100%{box-shadow:0 0 6px 1px #f8d87480,0 0 0 0 #f8d87466}50%{box-shadow:0 0 20px 6px #f8d874e0,0 0 0 10px #f8d87400}}' +
    '@media(max-width:480px){#vc-vero .vv-i{width:36px;height:36px}}' +
    /* presentacion */
    '#vc-vero-intro{position:fixed;inset:0;z-index:100010;display:flex;align-items:center;justify-content:center;padding:16px;font:400 17px/1.5 "Iowan Old Style","Palatino Linotype",Georgia,serif;color:#e8edff}' +
    '#vc-vero-intro .vi-bd{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1a2160ee,#03051096 75%),#030510d9;animation:vifade .45s both}' +
    '#vc-vero-intro.out .vi-bd,#vc-vero-intro.out .vi-in{animation:viout .5s both}' +
    '#vc-vero-intro .vi-in{position:relative;display:flex;align-items:center;justify-content:center;gap:clamp(12px,3vw,44px);max-width:960px;max-height:100%}' +
    '#vc-vero-intro .vi-img{display:block;height:min(74vh,640px);max-width:44vw;width:auto;object-fit:contain;filter:drop-shadow(0 16px 44px #000a) drop-shadow(0 0 30px #5b6bb455)}' +
    '#vc-vero-intro .vi-card{position:relative;width:min(440px,100%);padding:22px 24px;border:1.5px solid #5b6bb4;border-radius:20px;background:#0b1025f2;box-shadow:0 18px 50px #000b;animation:viup .6s .35s both}' +
    '#vc-vero-intro .vi-h{margin:0 0 8px;font-weight:500;font-size:clamp(24px,3.4vw,32px);line-height:1.2;color:#fff}' +
    '#vc-vero-intro .vi-card p{margin:0 0 9px;color:#cfd6ff}' +
    '#vc-vero-intro .vi-card p.vi-q{margin-top:14px;color:#fff;font-weight:600}' +
    '#vc-vero-intro .vi-card p.vi-s{margin:12px 0 0;font-size:14px;color:#8f98c0}' +
    '#vc-vero-intro .vi-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}' +
    '#vc-vero-intro .vi-btns button{font:inherit;font-size:16px;padding:9px 20px;border-radius:999px;cursor:pointer;transition:background .18s,border-color .18s}' +
    '#vc-vero-intro .vi-yes{color:#1a1500;background:#f8d874;border:1.5px solid #f8d874;font-weight:600}' +
    '#vc-vero-intro .vi-yes:hover,#vc-vero-intro .vi-yes:focus-visible{background:#ffe59a;outline:none}' +
    '#vc-vero-intro .vi-no{color:#cfd6ff;background:transparent;border:1.5px solid #5b6bb4}' +
    '#vc-vero-intro .vi-no:hover,#vc-vero-intro .vi-no:focus-visible{border-color:#8ab4ff;color:#fff;outline:none}' +
    '#vc-vero-intro .vi-line{opacity:0;animation:viup .5s both}' +
    '#vc-vero-intro .vi-sp{position:fixed;z-index:100011;pointer-events:none;color:#f8d874;font-size:20px;text-shadow:0 0 8px #f8d874}' +
    '@keyframes vifade{from{opacity:0}to{opacity:1}}' +
    '@keyframes viup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
    '@keyframes viout{to{opacity:0}}' +
    '@media(max-width:700px){#vc-vero-intro{align-items:flex-start;overflow:auto}#vc-vero-intro .vi-in{flex-direction:column;gap:6px;margin:auto 0}#vc-vero-intro .vi-img{height:min(30vh,260px);max-width:70vw}}' +
    '@media(prefers-reduced-motion:reduce){#vc-vero *,#vc-vero-intro *{animation:none!important;transition:none!important}#vc-vero .vv-i.hi{box-shadow:0 0 16px 5px #f8d874e0}#vc-vero-intro .vi-line{opacity:1}}'

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch (e) { return null } }
  function dayN() { var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) { return false } }
  var W = null, tries = 0

  function mount() {
    if (ls(KEY) === 'off' || document.getElementById('vc-vero')) return
    var lg = document.querySelector('.vc-lang')
    if (!lg) { if (tries++ < 30) setTimeout(mount, 300); return }
    if (!document.getElementById('vc-vero-css')) { var st = document.createElement('style'); st.id = 'vc-vero-css'; st.textContent = CSS; document.head.append(st) }
    var w = W = document.createElement('div'); w.id = 'vc-vero'
    w.innerHTML = '<button type="button" class="vv-i" aria-label="Vero: un consejo y el dato del día"><span class="vv-p" hidden></span><img alt="" src="' + BASE + 'icono.webp" decoding="async"></button>' +
      '<div class="vv-b" role="dialog" aria-label="Vero"><button type="button" class="vv-x" aria-label="Cerrar">×</button><div class="vv-n">Vero</div><div class="vv-t"></div><div class="vv-d"><div class="vv-n">Dato del día</div><div class="vv-f"></div></div><button type="button" class="vv-h">Desactivar a Vero</button></div>'
    var flex = lg.parentNode && lg.parentNode.classList && lg.parentNode.classList.contains('tools')
    if (flex) { w.classList.add('vv-flex'); lg.parentNode.insertBefore(w, lg) } else document.body.append(w)
    document.body.classList.add('vero-on')
    var b = w.querySelector('.vv-b'), t = w.querySelector('.vv-t'), f = w.querySelector('.vv-f'), ic = w.querySelector('.vv-i'), pt = w.querySelector('.vv-p')
    var day = dayN()
    pt.hidden = !(ls(KEY) === 'on' && String(day) !== ls(SEEN))

    /* el icono se coloca a la izquierda del selector de idioma */
    function place() {
      if (!flex) { var r = lg.getBoundingClientRect(); w.style.right = (r.width ? Math.round(document.documentElement.clientWidth - r.left + 8) : 64) + 'px' }
      var ir = ic.getBoundingClientRect()
      b.style.setProperty('--vv-ax', Math.max(14, Math.round(document.documentElement.clientWidth - ir.right + ir.width / 2 - 12 - 7)) + 'px')
    }
    place(); addEventListener('resize', place)
    new MutationObserver(place).observe(document.body, { attributes: true, attributeFilter: ['class'] })
    /* en "Quienes somos" el selector se desvanece al desplazar: el icono lo sigue */
    function sync() { w.style.opacity = lg.style.opacity || ''; w.style.pointerEvents = lg.style.opacity === '0' ? 'none' : '' }
    new MutationObserver(sync).observe(lg, { attributes: true, attributeFilter: ['style'] }); sync()

    /* primera visita: brillo y botes en amarillo, solo esa vez */
    if (!ls(GLOW)) { ls(GLOW, '1'); ic.classList.add('hi'); setTimeout(function () { ic.classList.remove('hi') }, 16000) }

    var ti = Math.floor(Math.random() * TIPS.length), clicks = 0, ct = 0
    function open() {
      place()
      t.textContent = TIPS[ti++ % TIPS.length]
      f.textContent = FACTS[((day % FACTS.length) + FACTS.length) % FACTS.length]
      b.classList.add('on'); pt.hidden = true; ls(SEEN, String(day))
    }
    ic.addEventListener('click', function () {
      ic.classList.remove('hi')
      if (!ls(KEY)) { intro(ic); return }
      clearTimeout(ct); clicks++; ct = setTimeout(function () { clicks = 0 }, 1500)
      if (clicks >= 5) { clicks = 0; place(); t.textContent = '¡Eh, que me despeinas!'; f.textContent = FACTS[(day + 3) % FACTS.length]; b.classList.add('on'); return }
      if (b.classList.contains('on')) b.classList.remove('on'); else open()
    })
    w.querySelector('.vv-x').addEventListener('click', function () { b.classList.remove('on') })
    w.querySelector('.vv-h').addEventListener('click', function () {
      ls(KEY, 'off')
      t.textContent = 'Vero desactivada. Podrás volver a activarla en Ajustes, dentro del menú.'
      w.querySelector('.vv-d').hidden = true; w.querySelector('.vv-h').hidden = true
      setTimeout(off, 2600)
    })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') b.classList.remove('on') })
  }

  function off() { if (W) { W.remove(); W = null } document.body.classList.remove('vero-on') }

  /* presentacion: Vero sale del icono, grande, se presenta y pregunta si se queda activa */
  function intro(ic) {
    if (document.getElementById('vc-vero-intro')) return
    var o = document.createElement('div'); o.id = 'vc-vero-intro'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Vero')
    o.innerHTML = '<div class="vi-bd"></div><div class="vi-in"><img class="vi-img" alt="" src="' + BASE + 'saluda.webp" decoding="async"><div class="vi-card">' +
      '<div class="vv-n">Vero</div><h2 class="vi-h vi-line" style="animation-delay:.5s">¡Hola! Soy Vero</h2>' +
      '<p class="vi-line" style="animation-delay:.7s">Soy la mascota de Vero Cosmos.</p>' +
      '<p class="vi-line" style="animation-delay:.95s">Te acompañaré por la web con consejos para empezar a observar y con un dato curioso del cielo cada día.</p>' +
      '<p class="vi-line" style="animation-delay:1.2s">Vivo en este icono, junto al idioma, y solo hablo cuando tú me pulsas.</p>' +
      '<p class="vi-q vi-line" style="animation-delay:1.5s">¿Quieres que me quede activa o prefieres desactivarme?</p>' +
      '<div class="vi-btns vi-line" style="animation-delay:1.7s"><button type="button" class="vi-yes">Déjame activa</button><button type="button" class="vi-no">Desactívame</button></div>' +
      '<p class="vi-s vi-line" style="animation-delay:1.9s">Podrás cambiar tu decisión cuando quieras en Ajustes, dentro del menú.</p></div></div>'
    document.body.append(o)
    var img = o.querySelector('.vi-img'), card = o.querySelector('.vi-card'), yes = o.querySelector('.vi-yes'), no = o.querySelector('.vi-no'), done = false
    function sparks() {
      if (reduced()) return
      var ir = ic.getBoundingClientRect(), cx = ir.left + ir.width / 2, cy = ir.top + ir.height / 2
      for (var i = 0; i < 14; i++) {
        var s = document.createElement('div'); s.className = 'vi-sp'; s.textContent = i % 3 ? '✦' : '✧'; s.style.left = cx + 'px'; s.style.top = cy + 'px'; o.append(s)
        var a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 190
        var an = s.animate ? s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + Math.cos(a) * r + 'px),calc(-50% + ' + Math.sin(a) * r + 'px)) scale(1.1)', opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)', delay: Math.random() * 150 }) : null
        if (an) an.onfinish = (function (el) { return function () { el.remove() } })(s); else s.remove()
      }
    }
    function pop() {
      if (reduced() || !img.animate) return
      var ir = ic.getBoundingClientRect(), r = img.getBoundingClientRect()
      var fx = ir.left + ir.width / 2 - (r.left + r.width / 2), fy = ir.top + ir.height / 2 - (r.top + r.height / 2)
      img.animate([
        { transform: 'translate(' + fx + 'px,' + fy + 'px) scale(.06) rotate(-24deg)', opacity: 0 },
        { transform: 'translate(' + fx * .1 + 'px,' + fy * .1 + 'px) scale(1.08) rotate(4deg)', opacity: 1, offset: .72 },
        { transform: 'none', opacity: 1 }
      ], { duration: 900, easing: 'cubic-bezier(.22,.9,.3,1)' })
    }
    if (img.complete) { pop() } else { img.style.opacity = '0'; img.addEventListener('load', function () { img.style.opacity = ''; pop() }); img.addEventListener('error', function () { img.style.display = 'none' }) }
    sparks()
    function close(cb) {
      if (done) return; done = true
      o.classList.add('out'); setTimeout(function () { o.remove(); if (cb) cb() }, reduced() ? 0 : 500)
    }
    function say(text) {
      card.innerHTML = '<div class="vv-n">Vero</div><p class="vi-h" style="font-size:22px;margin:6px 0 0"></p>'
      card.querySelector('.vi-h').textContent = text
    }
    yes.addEventListener('click', function () {
      if (done) return; ls(KEY, 'on'); say('¡Genial! Aquí estaré, en este icono, cuando me necesites.'); sparks()
      setTimeout(function () { close() }, 1800)
    })
    no.addEventListener('click', function () {
      if (done) return; ls(KEY, 'off'); say('Entendido, no te molestaré más. Podrás volver a activarme en Ajustes, dentro del menú.')
      setTimeout(function () { close(off) }, 2800)
    })
    /* cerrar sin decidir: la presentacion volvera a salir la proxima vez */
    o.querySelector('.vi-bd').addEventListener('click', function () { if (!ls(KEY)) close() })
    var onKey = function (e) { if (e.key === 'Escape' && !done && !ls(KEY)) { document.removeEventListener('keydown', onKey, true); close() } }
    document.addEventListener('keydown', onKey, true)
    setTimeout(function () { try { yes.focus({ preventScroll: true }) } catch (e) { } }, reduced() ? 50 : 1900)
  }

  window.vcVero = { mount: function () { tries = 0; mount() }, off: off }
  function start() { (window.requestIdleCallback || function (fn) { setTimeout(fn, 1200) })(mount) }
  if (document.readyState === 'complete') start(); else addEventListener('load', start)
})()
