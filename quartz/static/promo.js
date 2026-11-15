/* Vero Cosmos: avisos temporales en la portada (sorteos, eventos de la Bitacora del Cielo)
   - Aviso debajo del lema, que se puede cerrar con la ×. Vero lo anuncia una vez (vero.js lee window.vcPromo).
   - Los eventos de la Bitacora salen solos 2 dias antes de empezar y tienen prioridad (caducan antes);
     cuando pasan, vuelve el aviso que hubiera (por ejemplo, un sorteo).
   - Todo se apaga solo en su fecha de fin: no hace falta volver a publicar para quitarlo.
   Para un sorteo nuevo: cambia "id" (asi vuelve a salir a quien cerro el anterior), fechas, enlaces y textos
   (los textos en espanol se traducen en vc-i18n.js). */
(function () {
  var P = {
    id: 'sorteo-planisferio-2026',
    fin: Date.parse('2026-11-22T23:59:59+01:00'),   /* 22 de noviembre a las 23:59 (hora peninsular, CET) */
    /* enlace por idioma; si falta uno, se usa el ingles */
    url: {
      es: 'https://www.instagram.com/p/Dfk5vFwkV9G/',
      en: 'https://www.instagram.com/p/Dfk72IDEd9R/',
      fr: 'https://www.instagram.com/p/DflFyMEjOI2/'
    },
    img: 'sorteo/planisferio.webp',
    tipo: 'Sorteo',
    titulo: '¡Sorteamos un planisferio celeste!',
    texto: 'Participa en Instagram hasta el 22 de noviembre.',
    boton: 'Participar',
    vero: '¡Psst! Estamos sorteando un planisferio celeste en Instagram. Puedes participar hasta el 22 de noviembre. ¡Mucha suerte!',
    veroBoton: 'Ver el sorteo en Instagram'
  }
  var ANTES = 2 * 864e5   /* los eventos se anuncian 2 dias antes */
  var EV = {
    es: { more: 'Ver más', vero: '¡Psst! Apunta esto en tu calendario: {t}. {d}', btn: 'Ver en la Bitácora', x: 'Cerrar aviso' },
    en: { more: 'Read more', vero: 'Psst! Mark your calendar: {t}. {d}', btn: 'See it in the Sky Log', x: 'Close notice' },
    fr: { more: 'En savoir plus', vero: 'Psst ! Notez-le dans votre agenda : {t}. {d}', btn: 'Voir dans le Journal du ciel', x: 'Fermer l’avis' }
  }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch (e) { return null } }
  function lang() { var l = (window.vcI18n && window.vcI18n.lang) || document.documentElement.lang || 'es'; return EV[l] ? l : 'es' }

  /* cada aviso: id, fin, textos (funciones: se recalculan al cambiar de idioma), enlace externo (url) o interno (go) */
  var sorteo = {
    id: P.id, fin: P.fin, img: P.img, i18n: true,
    tipo: function () { return P.tipo }, titulo: function () { return P.titulo }, texto: function () { return P.texto }, boton: function () { return P.boton },
    url: function () { var l = lang(); return P.url[l] || P.url.en || P.url.es },
    vero: function () { return P.vero }, veroBoton: function () { return P.veroBoton }
  }
  function evento(it) {
    var B = window.vcBitacora, tx = function (o) { return B.tx(o) }
    return {
      id: 'bitacora-' + it.id, fin: Date.parse(it.fin || it.inicio), img: it.img || 'vero/g-telescopio.webp', i18n: false, ev: it,
      tipo: function () { return B.chip(it) || B.ui('ev') }, titulo: function () { return tx(it.t) }, texto: function () { return tx(it.d) },
      boton: function () { return EV[lang()].more },
      url: function () { return B.PATH + '#' + encodeURIComponent(it.id) },
      go: function () { if (window.vcGoLog) window.vcGoLog(it.id); else try { window.top.location.href = B.PATH + '#' + encodeURIComponent(it.id) } catch (e) { location.href = B.PATH } },
      vero: function () { return EV[lang()].vero.replace('{t}', tx(it.t)).replace('{d}', tx(it.d)) },
      veroBoton: function () { return EV[lang()].btn }
    }
  }
  var LIST = [sorteo]
  function vivos() { var now = Date.now(); return LIST.filter(function (a) { return now < a.fin }) }
  function actual(pred) { return vivos().filter(pred)[0] || null }
  /* para vero.js: el aviso que aun no ha anunciado (se marca al pulsar el enlace o al abrir el consejo grande) */
  function paraVero() { return actual(function (a) { return !ls('vc-promo-vero-' + a.id) }) }
  window.vcPromo = {
    activo: function () { return !!vivos().length },
    pendiente: function () { return !!paraVero() },
    get texto() { var a = paraVero(); return a ? a.vero() : '' },
    get boton() { var a = paraVero(); return a ? a.veroBoton() : '' },
    get go() { var a = paraVero(); return a && a.go ? a.go : null },
    url: function () { var a = paraVero(); return a ? a.url() : '' },
    visto: function () { var a = paraVero(); if (a) ls('vc-promo-vero-' + a.id, '1') }
  }

  var CSS =
    '#vc-promo-w{position:relative;z-index:3;flex:none;width:min(460px,calc(100% - 36px));height:0;margin:0;overflow:hidden;transition:height .55s cubic-bezier(.22,.8,.25,1),margin-top .55s cubic-bezier(.22,.8,.25,1)}' +
    '#vc-promo-w.on{margin-top:26px}#vc-promo-w.fin{overflow:visible}' +
    '#vc-promo{position:relative;display:flex;align-items:center;gap:14px;margin:0;padding:10px 12px 10px 10px;opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .5s cubic-bezier(.22,.8,.25,1);border:1px solid #5b6bb4;border-radius:16px;background:linear-gradient(120deg,#16204ae6,#0b1025e6);box-shadow:0 12px 34px #0005,0 0 26px #5b6bb433;backdrop-filter:blur(12px);color:#eef1ff;text-align:left}' +
    '#vc-promo-w.on #vc-promo{opacity:1;transform:none;transition-delay:.15s,.1s}' +
    '#vc-promo img{flex:none;width:64px;height:64px;border-radius:12px;object-fit:cover;object-position:50% 20%;border:1px solid #414e7a}' +
    '#vc-promo .pr-c{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}' +
    '#vc-promo .pr-k{color:#f8d874;font-size:10.5px;font-weight:650;letter-spacing:.17em;text-transform:uppercase}' +
    '#vc-promo .pr-t{font:400 18px/1.2 "Iowan Old Style",Georgia,serif;color:#f5f7ff}' +
    '#vc-promo .pr-s{font-size:12.5px;line-height:1.4;color:#aeb9dd;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '#vc-promo .pr-a{flex:none;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:#f8d874;color:#1a1500;font-size:13.5px;font-weight:650;text-decoration:none;transition:background .18s ease,transform .18s ease}' +
    '#vc-promo .pr-a:hover,#vc-promo .pr-a:focus-visible{background:#ffe59a;transform:translateY(-1px);outline:none}' +
    '#vc-promo .pr-x{position:absolute;top:-9px;right:-9px;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:1px solid #5b6bb4;border-radius:50%;background:#0b1025;color:#b9c9ff;font:16px/1 sans-serif;cursor:pointer}' +
    '#vc-promo .pr-x:hover,#vc-promo .pr-x:focus-visible{border-color:#b9c9ff;color:#fff;outline:none}' +
    '@media(max-width:520px){#vc-promo{flex-wrap:wrap;gap:10px 12px}#vc-promo img{width:56px;height:56px}#vc-promo .pr-a{width:100%;justify-content:center;padding:10px 14px}}' +
    '@media(max-width:700px){body.principal-page #vc-promo-w{order:2;max-width:420px}}' +
    /* sin sitio entre el lema y las tarjetas de abajo (ordenador con ventana baja): no se muestra */
    '#vc-promo-w.nf{height:0!important;margin-top:0!important;overflow:hidden!important;visibility:hidden}' +
    '@media(prefers-reduced-motion:reduce){#vc-promo-w,#vc-promo{transition:none!important}}'

  function mount(A) {
    if (!A || document.getElementById('vc-promo')) return
    var sub = document.getElementById('principal-subtitle'); if (!sub) return
    if (!document.getElementById('vc-promo-css')) { var st = document.createElement('style'); st.id = 'vc-promo-css'; st.textContent = CSS; document.head.append(st) }
    var d = document.createElement('aside'); d.id = 'vc-promo'
    /* los textos de los eventos ya vienen en el idioma de la web; los del sorteo los traduce vc-i18n.js */
    if (!A.i18n) d.setAttribute('data-no-i18n', '')
    d.innerHTML = '<img alt="" src="' + A.img + '" decoding="async" width="64" height="64">' +
      '<div class="pr-c"><span class="pr-k"></span><span class="pr-t"></span><span class="pr-s"></span></div>' +
      '<a class="pr-a"><span></span><span aria-hidden="true">→</span></a>' +
      '<button type="button" class="pr-x" aria-label="Cerrar aviso">×</button>'
    var a = d.querySelector('.pr-a')
    function textos() {
      d.setAttribute('aria-label', A.tipo())
      d.querySelector('.pr-k').textContent = A.tipo()
      d.querySelector('.pr-t').textContent = A.titulo()
      d.querySelector('.pr-s').textContent = A.texto()
      a.querySelector('span').textContent = A.boton(); a.href = A.url()
      if (!A.i18n) d.querySelector('.pr-x').setAttribute('aria-label', EV[lang()].x)
    }
    textos()
    if (A.go) a.addEventListener('click', function (e) { e.preventDefault(); A.go() })
    else { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.addEventListener('click', function () { a.href = A.url() }) }
    window.addEventListener('vc-lang', textos)
    var w = document.createElement('div'); w.id = 'vc-promo-w'; w.append(d)
    sub.parentNode.insertBefore(w, sub.nextSibling)
    var rm = matchMedia('(prefers-reduced-motion: reduce)'), pv = sub.parentNode
    /* En ordenador, el titulo, el lema y el aviso van centrados, y las tarjetas de abajo (herramientas y contacto)
       van pegadas al borde inferior. Se calcula cuanto hay que subir el bloque central (con padding-bottom) para que
       el aviso no las pise sin que el titulo se meta bajo los botones de arriba. Devuelve -1 si no cabe. */
    function hueco() {
      if (window.innerWidth <= 700) return 0
      if (!document.body.classList.contains('principal-page')) return null
      var ttl = document.getElementById('principal-title'); if (!ttl) return 0
      var pr = pv.getBoundingClientRect(), V = pv.clientHeight
      var total = sub.getBoundingClientRect().bottom - ttl.getBoundingClientRect().top + 26 + d.offsetHeight
      var cw = Math.min(460, pv.clientWidth - 36), x0 = pr.left + (pv.clientWidth - cw) / 2, x1 = x0 + cw, B = V
      ;['featured-tools', 'contacts'].forEach(function (id) {
        var e = document.getElementById(id); if (!e) return
        var r = e.getBoundingClientRect(); if (!r.height) return
        if (r.right > x0 - 10 && r.left < x1 + 10) B = Math.min(B, r.top - pr.top)
      })
      var pmin = V + total - 2 * (B - 18), pmax = V - total - 2 * 64
      return pmin > pmax ? -1 : Math.max(0, Math.ceil(pmin))
    }
    function ajustar() {
      if (!w.parentNode || !w.classList.contains('on')) return
      var F = window.vcFitHome
      if (F) {
        /* el mismo calculo que la portada, contando el aviso; si no cabe, se oculta y la portada se ajusta sin el */
        var r = F.calc(26 + d.offsetHeight); if (!r) return
        w.classList.toggle('nf', !r.ok)
        if (r.ok) F.apply(r.p); else { var r0 = F.calc(0); F.apply(r0 ? r0.p : 0) }
        return
      }
      var p = hueco(); if (p === null) return
      w.classList.toggle('nf', p < 0)
      pv.style.paddingBottom = p > 0 ? p + 'px' : ''
    }
    if (!rm.matches) pv.style.transition = 'padding-bottom .55s cubic-bezier(.22,.8,.25,1)'
    window.addEventListener('resize', ajustar)
    new MutationObserver(ajustar).observe(document.body, { attributes: true, attributeFilter: ['class'] })
    function fin(el, cb) { var done = false, go = function () { if (!done) { done = true; cb() } }; el.addEventListener('transitionend', function (e) { if (e.target === el && e.propertyName === 'height') go() }); setTimeout(go, 800) }
    function abrir() {
      w.classList.add('on'); ajustar()
      if (rm.matches || w.classList.contains('nf')) { w.style.height = 'auto'; w.classList.add('fin'); return }
      w.style.height = d.offsetHeight + 'px'
      fin(w, function () { w.style.height = 'auto'; w.classList.add('fin') })
    }
    function cerrar() {
      if (!w.parentNode) return
      if (window.vcFitHome) { var r0 = window.vcFitHome.calc(0); window.vcFitHome.apply(r0 ? r0.p : 0) } else pv.style.paddingBottom = ''
      if (rm.matches || w.classList.contains('nf')) { w.remove(); return }
      w.style.height = w.offsetHeight + 'px'; w.classList.remove('fin'); void w.offsetHeight
      w.classList.remove('on'); w.style.height = '0px'
      fin(w, function () { w.remove() })
    }
    /* sale un momento despues de cargar, cuando ya se ve la portada */
    setTimeout(function () { requestAnimationFrame(abrir) }, 600)
    d.querySelector('.pr-x').addEventListener('click', function () { ls('vc-promo-x-' + A.id, '1'); window.removeEventListener('vc-lang', textos); cerrar() })
    /* si la pagina sigue abierta cuando acaba, se quita */
    setTimeout(function () { window.removeEventListener('vc-lang', textos); cerrar() }, Math.min(A.fin - Date.now(), 2147483000))
  }
  /* primero se esperan los eventos de la Bitacora (como mucho 1,5 s) y se elige el aviso que toca */
  function start() {
    var B = window.vcBitacora, done = false
    function go() {
      if (done) return; done = true
      mount(actual(function (a) { return !ls('vc-promo-x-' + a.id) }))
    }
    if (!B) { go(); return }
    setTimeout(go, 1500)
    B.load().then(function (j) {
      var now = Date.now()
      var evs = ((j && j.items) || []).filter(function (it) { return it.tipo === 'evento' && Date.parse(it.inicio) - ANTES <= now && now < Date.parse(it.fin || it.inicio) })
        .sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })
      LIST = evs.map(evento).concat([sorteo])
      go()
    }, go)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start()
})()
