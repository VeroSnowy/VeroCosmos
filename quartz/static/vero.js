/* Vero: mascota de Vero Cosmos. Icono flotante con un consejo y el "dato del dia". Se oculta mientras esta abierto Mi Lugar. */
(function () {
  'use strict'
  if (window.vcVero) return
  var BASE = 'vero/'
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
    '#vc-vero{position:fixed;top:12px;right:64px;z-index:18;display:none;font:400 16px/1.4 "Iowan Old Style","Palatino Linotype",Georgia,serif}' +
    'body.guide-page:not(.lugar-on) #vc-vero{display:block}' +
    '#vc-vero .vv-i{position:relative;display:block;width:40px;height:40px;padding:0;border:1px solid #232846;border-radius:10px;background:#0e1226ef;cursor:pointer;overflow:visible;transition:border-color .18s,background .18s}' +
    '#vc-vero .vv-i:hover,#vc-vero .vv-i:focus-visible{border-color:#5b6bb4;background:#141a3a;outline:none}' +
    '#vc-vero .vv-i img{display:block;width:100%;height:100%;border-radius:9px;object-fit:cover;pointer-events:none}' +
    '#vc-vero .vv-p{position:absolute;right:-3px;top:-3px;width:11px;height:11px;border-radius:50%;background:#f8d874;box-shadow:0 0 8px #f8d874}' +
    '#vc-vero .vv-p[hidden]{display:none}' +
    '#vc-vero .vv-b{position:fixed;top:60px;right:12px;width:min(310px,calc(100vw - 24px));padding:12px 16px;border:1.5px solid #5b6bb4;border-radius:16px;background:#0b1025;color:#e8edff;box-shadow:0 12px 30px #02030acc;display:none}' +
    '#vc-vero .vv-b.on{display:block;animation:vvin .3s both}' +
    '#vc-vero .vv-b:before{content:"";position:absolute;top:-8px;right:var(--vv-ax,40px);width:14px;height:14px;background:#0b1025;border:1.5px solid #5b6bb4;border-bottom:0;border-right:0;transform:rotate(45deg)}' +
    '#vc-vero .vv-n{font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:#f8d874;margin-bottom:2px}' +
    '#vc-vero .vv-d{margin-top:10px;padding-top:8px;border-top:1px solid #232a4f}' +
    '#vc-vero .vv-x{position:absolute;right:6px;top:2px;width:30px;height:30px;border:0;background:none;color:#8f98c0;font-size:20px;cursor:pointer}' +
    '#vc-vero .vv-h{display:block;margin-top:10px;padding:0;border:0;background:none;color:#8f98c0;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}' +
    '@keyframes vvin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
    '@media(prefers-reduced-motion:reduce){#vc-vero *{animation:none!important;transition:none!important}}'
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch (e) { return null } }
  function dayN() { var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) }
  function mount() {
    if (document.getElementById('vc-vero')) return
    try { if (sessionStorage.getItem('vc-vero-off') === '1') return } catch (e) { }
    var st = document.createElement('style'); st.textContent = CSS; document.head.append(st)
    var w = document.createElement('div'); w.id = 'vc-vero'
    w.innerHTML = '<button type="button" class="vv-i" aria-label="Vero: un consejo y el dato del día"><span class="vv-p"></span><img alt="" src="' + BASE + 'a-feliz.webp" decoding="async"></button>' +
      '<div class="vv-b" role="dialog" aria-label="Vero"><button type="button" class="vv-x" aria-label="Cerrar">×</button><div class="vv-n">Vero</div><div class="vv-t"></div><div class="vv-d"><div class="vv-n">Dato del día</div><div class="vv-f"></div></div><button type="button" class="vv-h">Ocultar a Vero por ahora</button></div>'
    document.body.append(w)
    var b = w.querySelector('.vv-b'), t = w.querySelector('.vv-t'), f = w.querySelector('.vv-f'), ic = w.querySelector('.vv-i'), pt = w.querySelector('.vv-p')
    var day = dayN(), seen = ls('vc-vero-seen')
    pt.hidden = String(day) === seen
    /* el icono se coloca a la izquierda del selector de idioma, que es donde acaban los controles de la cabecera */
    function place() {
      var lg = document.querySelector('.vc-lang'), r = lg ? lg.getBoundingClientRect() : null
      var R = r && r.width ? Math.round(document.documentElement.clientWidth - r.left + 8) : 64
      w.style.right = R + 'px'; b.style.setProperty('--vv-ax', (R + 1) + 'px')
    }
    place(); addEventListener('resize', place)
    new MutationObserver(place).observe(document.body, { attributes: true, attributeFilter: ['class'] })
    var ti = Math.floor(Math.random() * TIPS.length), clicks = 0, ct = 0
    function open() {
      t.textContent = TIPS[ti++ % TIPS.length]
      f.textContent = FACTS[((day % FACTS.length) + FACTS.length) % FACTS.length]
      b.classList.add('on'); pt.hidden = true; ls('vc-vero-seen', String(day))
    }
    ic.addEventListener('click', function () {
      clearTimeout(ct); clicks++; ct = setTimeout(function () { clicks = 0 }, 1500)
      if (clicks >= 5) { clicks = 0; t.textContent = '¡Eh, que me despeinas!'; f.textContent = FACTS[(day + 3) % FACTS.length]; b.classList.add('on'); return }
      if (b.classList.contains('on')) b.classList.remove('on'); else open()
    })
    w.querySelector('.vv-x').addEventListener('click', function () { b.classList.remove('on') })
    w.querySelector('.vv-h').addEventListener('click', function () { try { sessionStorage.setItem('vc-vero-off', '1') } catch (e) { } w.remove() })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') b.classList.remove('on') })
  }
  window.vcVero = { mount: mount }
  function start() { (window.requestIdleCallback || function (fn) { setTimeout(fn, 1200) })(mount) }
  if (document.readyState === 'complete') start(); else addEventListener('load', start)
})()
