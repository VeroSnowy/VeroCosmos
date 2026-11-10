/* Vero Cosmos: avisos temporales (sorteos, novedades)
   - Aviso en la portada (debajo del lema), que se puede cerrar con la ×.
   - Vero lo anuncia una vez (vero.js lee window.vcPromo).
   - Se apaga solo al llegar a "fin": no hace falta volver a publicar para quitarlo.
   Para un aviso nuevo: cambia "id" (asi vuelve a salir a quien cerro el anterior), fechas, enlaces y textos
   (los textos en espanol se traducen en vc-i18n.js). */
(function () {
  var P = {
    id: 'sorteo-planisferio-2026',
    fin: Date.parse('2026-11-22T23:59:59+01:00'),   /* 22 de noviembre a las 23:59 (hora peninsular, CET) */
    /* enlace por idioma; si falta uno, se usa el ingles */
    url: {
      es: 'https://www.instagram.com/p/Dfk5vFwkV9G/',
      en: 'https://www.instagram.com/p/Dfk72IDEd9R/'
    },
    img: 'sorteo/planisferio.webp',
    tipo: 'Sorteo',
    titulo: '¡Sorteamos un planisferio celeste!',
    texto: 'Participa en Instagram hasta el 22 de noviembre.',
    boton: 'Participar',
    vero: '¡Psst! Estamos sorteando un planisferio celeste en Instagram. Puedes participar hasta el 22 de noviembre. ¡Mucha suerte!',
    veroBoton: 'Ver el sorteo en Instagram'
  }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch (e) { return null } }
  function lang() { return (window.vcI18n && window.vcI18n.lang) || document.documentElement.lang || 'es' }
  function activo() { return Date.now() < P.fin }
  function url() { var l = lang(); return P.url[l] || P.url.en || P.url.es }
  /* para vero.js: se anuncia hasta que se pulsa el enlace o se abre el consejo grande una vez */
  window.vcPromo = {
    activo: activo, url: url, texto: P.vero, boton: P.veroBoton,
    pendiente: function () { return activo() && !ls('vc-promo-vero-' + P.id) },
    visto: function () { ls('vc-promo-vero-' + P.id, '1') }
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
    '#vc-promo .pr-s{font-size:12.5px;line-height:1.4;color:#aeb9dd}' +
    '#vc-promo .pr-a{flex:none;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:#f8d874;color:#1a1500;font-size:13.5px;font-weight:650;text-decoration:none;transition:background .18s ease,transform .18s ease}' +
    '#vc-promo .pr-a:hover,#vc-promo .pr-a:focus-visible{background:#ffe59a;transform:translateY(-1px);outline:none}' +
    '#vc-promo .pr-x{position:absolute;top:-9px;right:-9px;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:1px solid #5b6bb4;border-radius:50%;background:#0b1025;color:#b9c9ff;font:16px/1 sans-serif;cursor:pointer}' +
    '#vc-promo .pr-x:hover,#vc-promo .pr-x:focus-visible{border-color:#b9c9ff;color:#fff;outline:none}' +
    '@media(max-width:520px){#vc-promo{flex-wrap:wrap;gap:10px 12px}#vc-promo img{width:56px;height:56px}#vc-promo .pr-a{width:100%;justify-content:center;padding:10px 14px}}' +
    '@media(max-width:700px){body.principal-page #vc-promo-w{order:2;max-width:420px}}' +
    /* en pantallas de ordenador bajas no cabe entre el lema y las tarjetas de abajo */
    '@media(min-width:701px) and (max-height:620px){#vc-promo-w{display:none}}' +
    '@media(prefers-reduced-motion:reduce){#vc-promo-w,#vc-promo{transition:none!important}}'

  function mount() {
    if (!activo() || ls('vc-promo-x-' + P.id) || document.getElementById('vc-promo')) return
    var sub = document.getElementById('principal-subtitle'); if (!sub) return
    var st = document.createElement('style'); st.id = 'vc-promo-css'; st.textContent = CSS; document.head.append(st)
    var d = document.createElement('aside'); d.id = 'vc-promo'; d.setAttribute('aria-label', P.tipo)
    d.innerHTML = '<img alt="" src="' + P.img + '" decoding="async" width="64" height="64">' +
      '<div class="pr-c"><span class="pr-k"></span><span class="pr-t"></span><span class="pr-s"></span></div>' +
      '<a class="pr-a" target="_blank" rel="noopener noreferrer"><span></span><span aria-hidden="true">→</span></a>' +
      '<button type="button" class="pr-x" aria-label="Cerrar aviso">×</button>'
    d.querySelector('.pr-k').textContent = P.tipo
    d.querySelector('.pr-t').textContent = P.titulo
    d.querySelector('.pr-s').textContent = P.texto
    var a = d.querySelector('.pr-a'); a.querySelector('span').textContent = P.boton; a.href = url()
    a.addEventListener('click', function () { a.href = url() })
    window.addEventListener('vc-lang', function () { a.href = url() })
    var w = document.createElement('div'); w.id = 'vc-promo-w'; w.append(d)
    sub.parentNode.insertBefore(w, sub.nextSibling)
    var rm = matchMedia('(prefers-reduced-motion: reduce)')
    function fin(el, cb) { var done = false, go = function () { if (!done) { done = true; cb() } }; el.addEventListener('transitionend', function (e) { if (e.target === el && e.propertyName === 'height') go() }); setTimeout(go, 800) }
    function abrir() {
      if (rm.matches) { w.style.height = 'auto'; w.classList.add('on', 'fin'); return }
      w.style.height = d.offsetHeight + 'px'; w.classList.add('on')
      fin(w, function () { w.style.height = 'auto'; w.classList.add('fin') })
    }
    function cerrar() {
      if (!w.parentNode) return
      if (rm.matches) { w.remove(); return }
      w.style.height = w.offsetHeight + 'px'; w.classList.remove('fin'); void w.offsetHeight
      w.classList.remove('on'); w.style.height = '0px'
      fin(w, function () { w.remove() })
    }
    /* sale un momento despues de cargar, cuando ya se ve la portada */
    setTimeout(function () { requestAnimationFrame(abrir) }, 600)
    d.querySelector('.pr-x').addEventListener('click', function () { ls('vc-promo-x-' + P.id, '1'); cerrar() })
    /* si la pagina sigue abierta cuando acaba, se quita */
    setTimeout(cerrar, Math.min(P.fin - Date.now(), 2147483000))
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount()
})()
