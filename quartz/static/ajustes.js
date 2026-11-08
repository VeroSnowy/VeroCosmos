/* Ajustes de Vero Cosmos: se guardan solo en este navegador (localStorage).
   - vc-vero: on | off      (Vero Andromedasis; sin valor = aun no ha decidido)
   - vc-anim: off           (sin animaciones: se aplica como "reducir movimiento" del sistema)
   - vc-geo:  off           (no usar la ubicacion: se borra la guardada y se bloquea el GPS)
   - vc-3d:   off           (las fichas se abren con la foto)
   Se carga en <head>, antes que el resto de scripts, para que el modo sin animaciones llegue a todos. */
(function () {
  'use strict'
  if (window.vcAjustes) return
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch (e) { return null } }
  var get = {
    vero: function () { return ls('vc-vero') !== 'off' },
    anim: function () { return ls('vc-anim') !== 'off' },
    geo: function () { return ls('vc-geo') !== 'off' },
    '3d': function () { return ls('vc-3d') !== 'off' }
  }

  /* ---------- sin animaciones: el sitio ya respeta "reducir movimiento"; aqui se fuerza ---------- */
  var STILL = !get.anim()
  if (STILL) {
    document.documentElement.classList.add('vc-still')
    var mm = window.matchMedia && window.matchMedia.bind(window)
    if (mm) window.matchMedia = function (q) {
      if (/prefers-reduced-motion/.test(String(q))) {
        var on = /reduce/.test(String(q))
        return { matches: on, media: String(q), onchange: null, addListener: function () { }, removeListener: function () { }, addEventListener: function () { }, removeEventListener: function () { }, dispatchEvent: function () { return false } }
      }
      return mm(q)
    }
    /* las reglas CSS "@media (prefers-reduced-motion: reduce)" se copian como reglas normales */
    var seen = typeof WeakSet === 'function' ? new WeakSet() : null, out = null
    var promote = function () {
      if (!seen) return
      var css = ''
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sh = document.styleSheets[i]; if (seen.has(sh) || (out && sh === out.sheet)) continue
        var rules; try { rules = sh.cssRules } catch (e) { continue }
        seen.add(sh)
        for (var j = 0; j < rules.length; j++) {
          var r = rules[j]
          if (r.media && /prefers-reduced-motion\s*:\s*reduce/.test(r.media.mediaText)) for (var k = 0; k < r.cssRules.length; k++) css += r.cssRules[k].cssText + '\n'
        }
      }
      if (!css) return
      if (!out) { out = document.createElement('style'); out.id = 'vc-still-css' }
      out.textContent += css
      ;(document.head || document.documentElement).append(out)
    }
    var watch = function () { promote(); new MutationObserver(function () { promote() }).observe(document.head || document.documentElement, { childList: true, subtree: true, characterData: true }) }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch()
    addEventListener('load', promote)
  }

  /* ---------- ubicacion desactivada: ni GPS ni ubicacion guardada ---------- */
  try {
    var geo = navigator.geolocation
    if (geo) {
      var gcp = geo.getCurrentPosition.bind(geo), wp = geo.watchPosition.bind(geo)
      var deny = function (err) { setTimeout(function () { if (err) err({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: 'Ubicación desactivada en Ajustes' }) }, 0) }
      geo.getCurrentPosition = function (ok, err, opt) { if (!get.geo()) return deny(err); return gcp(ok, err, opt) }
      geo.watchPosition = function (ok, err, opt) { if (!get.geo()) { deny(err); return 0 } return wp(ok, err, opt) }
    }
    if (navigator.permissions && navigator.permissions.query) {
      var pq = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = function (d) { if (d && d.name === 'geolocation' && !get.geo()) return Promise.resolve({ state: 'denied', onchange: null, addEventListener: function () { } }); return pq(d) }
    }
    var setI = Storage.prototype.setItem
    Storage.prototype.setItem = function (k, v) { if (k === 'vc-loc' && this === window.localStorage && !get.geo()) return; return setI.call(this, k, v) }
  } catch (e) { }

  /* ---------- ventana de Ajustes ---------- */
  var ROWS = [
    ['vero', 'Vero Andromedasis', 'Muestra a Vero y sus consejos por la web.'],
    ['anim', 'Animaciones y estrellas', 'Cielo que titila, estrellas fugaces, giros y transiciones. Apágalo si prefieres una web quieta o tu dispositivo va lento.'],
    ['geo', 'Ubicación', 'Permite usar tu ubicación en Lugar para observar y en las fichas. Al desactivarla se borra la ubicación guardada.'],
    ['3d', 'Modelos 3D', 'Las fichas se abren con el modelo 3D. Si lo desactivas, verás primero la foto.']
  ]
  var KEYS = { vero: 'vc-vero', anim: 'vc-anim', geo: 'vc-geo', '3d': 'vc-3d' }
  var CSS = '' +
    '#vc-aj{position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit;color:#eef1ff}' +
    '#vc-aj .aj-bd{position:absolute;inset:0;background:#03051099;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);animation:ajf .25s both}' +
    '#vc-aj .aj-c{position:relative;width:min(600px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:26px 30px 22px;border:1px solid #2a3466;border-radius:18px;background:linear-gradient(180deg,#0e1433,#0a0e24);box-shadow:0 24px 60px #000c;animation:aju .3s cubic-bezier(.2,.8,.2,1) both}' +
    '#vc-aj h2{margin:0;font:400 32px/1.15 "Iowan Old Style","Palatino Linotype",Georgia,serif;color:#fff}' +
    '#vc-aj .aj-s{margin:6px 0 0;color:#a9b3d9;font-size:15.5px}' +
    '#vc-aj .aj-x{position:absolute;top:18px;right:18px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;padding:0;border:1px solid #343d63;border-radius:10px;background:#0e1226;color:#eef1ff;cursor:pointer}' +
    '#vc-aj .aj-x:hover,#vc-aj .aj-x:focus-visible{border-color:#8ab4ff;outline:none}' +
    '#vc-aj .aj-r{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 0;border-top:1px solid #232a4f}' +
    '#vc-aj .aj-r:first-of-type{margin-top:18px}' +
    '#vc-aj .aj-n{font-weight:600;font-size:17.5px;color:#fff}' +
    '#vc-aj .aj-d{margin-top:3px;font-size:15px;line-height:1.55;color:#a9b3d9}' +
    '#vc-aj .aj-t{flex:none;position:relative;width:58px;height:34px;padding:0;border:0;border-radius:999px;background:#2a3150;cursor:pointer;transition:background .2s}' +
    '#vc-aj .aj-t:after{content:"";position:absolute;top:5px;left:5px;width:24px;height:24px;border-radius:50%;background:#e8edff;transition:transform .2s cubic-bezier(.2,.8,.2,1)}' +
    '#vc-aj .aj-t[aria-checked="true"]{background:#2f62d9}' +
    '#vc-aj .aj-t[aria-checked="true"]:after{transform:translateX(24px);background:#fff}' +
    '#vc-aj .aj-t:focus-visible{outline:2px solid #8ab4ff;outline-offset:3px}' +
    '#vc-aj .aj-f{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:20px;border-top:1px solid #232a4f}' +
    '#vc-aj .aj-f button{font:inherit;font-size:17px;padding:12px 20px;border-radius:10px;border:1px solid #3a4580;background:transparent;color:#eef1ff;cursor:pointer}' +
    '#vc-aj .aj-f .aj-ok{background:#18214d}' +
    '#vc-aj .aj-f button:hover,#vc-aj .aj-f button:focus-visible{border-color:#8ab4ff;outline:none}' +
    '#vc-aj .aj-msg{margin:12px 0 0;font-size:14px;color:#f8d874;min-height:1em}' +
    '@keyframes ajf{from{opacity:0}to{opacity:1}}@keyframes aju{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}' +
    '@media(max-width:520px){#vc-aj .aj-c{padding:22px 18px 18px}#vc-aj h2{font-size:28px}#vc-aj .aj-x{top:14px;right:14px}}' +
    '@media(prefers-reduced-motion:reduce){#vc-aj *{animation:none!important;transition:none!important}}' +
    '#page-menu .vc-aj-sep{height:1px;margin:5px 6px;background:#232846}' +
    '#page-menu .vc-aj-a{display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;padding:10px 11px;border:0;border-radius:6px;background:none;color:#eef1ff;font:inherit;text-align:left;white-space:nowrap;cursor:pointer}' +
    '#page-menu .vc-aj-a:hover,#page-menu .vc-aj-a:focus{background:#1a2040;outline:none}' +
    '#page-menu .vc-aj-a svg{width:18px;height:18px;flex:none;color:#a9b9e9}'
  var styled = false
  function style() { if (styled) return; styled = true; var s = document.createElement('style'); s.textContent = CSS; document.head.append(s) }

  function set(id, on) {
    if (id === 'vero') {
      ls('vc-vero', on ? 'on' : 'off')
      if (window.vcVero) { if (on) window.vcVero.mount(); else window.vcVero.off() }
    } else if (id === 'geo') {
      if (on) ls('vc-geo', null); else { ls('vc-geo', 'off'); ls('vc-loc', null) }
    } else ls(KEYS[id], on ? null : 'off')
  }

  function open() {
    if (document.getElementById('vc-aj')) return
    style()
    var anim0 = get.anim()
    var o = document.createElement('div'); o.id = 'vc-aj'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'vc-aj-h')
    o.innerHTML = '<div class="aj-bd"></div><div class="aj-c"><button type="button" class="aj-x" aria-label="Cerrar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<h2 id="vc-aj-h">Ajustes</h2><p class="aj-s">Se guardan solo en este navegador. No necesitas cuenta.</p>' +
      ROWS.map(function (r) { return '<div class="aj-r"><div><div class="aj-n" id="aj-n-' + r[0] + '">' + r[1] + '</div><div class="aj-d">' + r[2] + '</div></div><button type="button" class="aj-t" role="switch" data-k="' + r[0] + '" aria-labelledby="aj-n-' + r[0] + '"></button></div>' }).join('') +
      '<div class="aj-f"><button type="button" class="aj-rs">Restablecer</button><button type="button" class="aj-ok">Listo</button></div><p class="aj-msg" aria-live="polite"></p></div>'
    document.body.append(o)
    var msg = o.querySelector('.aj-msg')
    function paint() { [].forEach.call(o.querySelectorAll('.aj-t'), function (t) { t.setAttribute('aria-checked', String(get[t.dataset.k]())) }) }
    function note() { msg.textContent = get.anim() !== anim0 ? 'Las animaciones cambiarán al cerrar los ajustes.' : '' }
    paint()
    o.addEventListener('click', function (e) {
      var t = e.target.closest('.aj-t')
      if (t) { set(t.dataset.k, !get[t.dataset.k]()); paint(); note(); return }
      if (e.target.closest('.aj-rs')) { ROWS.forEach(function (r) { set(r[0], true) }); paint(); note(); return }
      if (e.target.closest('.aj-ok,.aj-x') || e.target.classList.contains('aj-bd')) close()
    })
    function key(e) { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    document.addEventListener('keydown', key, true)
    function close() {
      document.removeEventListener('keydown', key, true); o.remove()
      if (get.anim() !== anim0) location.reload()
    }
    setTimeout(function () { var f = o.querySelector('.aj-t'); if (f) try { f.focus({ preventScroll: true }) } catch (e) { } }, 30)
  }

  /* entrada "Ajustes" al final del menu de paginas */
  function menu() {
    var pm = document.getElementById('page-menu'); if (!pm) return
    style()
    var sep = document.createElement('div'); sep.className = 'vc-aj-sep'; sep.setAttribute('role', 'separator')
    var b = document.createElement('button'); b.type = 'button'; b.className = 'vc-aj-a'
    b.innerHTML = '<span>Ajustes</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
    b.addEventListener('click', function () {
      pm.classList.remove('open')
      var mt = document.getElementById('menu-toggle'); if (mt) { mt.setAttribute('aria-expanded', 'false'); mt.setAttribute('aria-label', 'Abrir menú de páginas') }
      open()
    })
    pm.append(sep, b)
    /* si el atlas anade enlaces despues, "Ajustes" vuelve al final */
    new MutationObserver(function () { if (pm.lastElementChild !== b) pm.append(sep, b) }).observe(pm, { childList: true })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', menu); else menu()

  window.vcAjustes = { open: open, get: function (k) { return get[k] ? get[k]() : true } }
})()
