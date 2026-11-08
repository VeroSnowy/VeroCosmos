/* Vero Andromedasis (Vero): personaje de Vero Cosmos. Icono junto al selector de idioma en toda la web.
   Primera visita: el icono brilla en amarillo y da botes. Primera pulsacion: se presenta y se elige el modo.
   Modos (localStorage "vc-vero"): off = desactivada · on = discreta (icono, fichas y algun consejo en la guia) · full = completa (consejos a menudo).
   Al pulsar el icono: un consejo y el "dato del dia". */
(function () {
  'use strict'
  if (window.vcVero) return
  var BASE = 'vero/', KEY = 'vc-vero', GLOW = 'vc-vero-glow', SEEN = 'vc-vero-seen', TIPDAY = 'vc-vero-tipday'
  var TIPS = [
    'Si no sabes por dónde empezar, prueba «Lugar para observar»: calcula lo oscuro que es tu cielo.',
    'Deja que tus ojos se acostumbren a la oscuridad unos 20 minutos antes de observar.',
    'Las luces rojas molestan menos a la vista que las blancas cuando observas de noche.',
    'Abre cualquier ficha del atlas para ver sus datos y dónde encontrar el objeto en el cielo.'
  ]
  var CTX = {
    inicio: ['Empieza por el Atlas para ver las fotos del cielo, o por la Guía si nunca has observado.', 'Si te pierdes, el menú de arriba a la izquierda te lleva a cualquier sección.'],
    atlas: ['Arrastra para girar el cielo y pulsa cualquier objeto para abrir su ficha.', 'Usa el buscador de arriba si ya sabes qué objeto quieres ver.'],
    guia: ['Antes de salir a observar, mira en «Lugar para observar» qué tal estará tu cielo esta noche.', 'Con Luna llena el cielo se aclara: es buena noche para planetas y para la propia Luna.'],
    lugar: ['Busca un sitio y te calculo la contaminación lumínica, el relieve y el tiempo de esa noche.', 'La «Valoración de la noche» resume en una nota las nubes, la Luna, la oscuridad del cielo, el viento y la humedad.'],
    ficha: ['Mira «Mejores días y horas para observarlo»: te dice cuándo se ve mejor desde tu ubicación.', 'Cambia entre el modelo 3D y la foto con los botones de encima de la imagen.'],
    quien: ['Esta web la hace Vero Snowy, estudiante de Física. ¡Gracias por pasarte!']
  }
  /* poses de Vero que acompanan los consejos del modo completa, segun la seccion */
  var PICS = { inicio: ['saluda', 'chibi'], atlas: ['senala', 'chibi'], guia: ['telescopio', 'piensa'], lugar: ['piensa', 'telescopio'], ficha: ['senala', 'piensa'], quien: ['saluda', 'chibi'] }
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
    /* Vero asomando por el borde (modo completa) y consejo en grande */
    '#vc-peek{position:fixed;bottom:0;z-index:100006;width:150px;padding:0;border:0;background:none;cursor:pointer;transform:translateY(105%);transition:transform .7s cubic-bezier(.2,1.25,.4,1)}' +
    '#vc-peek.on{transform:translateY(24%)}' +
    '#vc-peek.on:hover,#vc-peek.on:focus-visible{transform:translateY(10%);outline:none}' +
    '#vc-peek img{display:block;width:100%;height:auto;filter:drop-shadow(0 0 8px #f8d874aa) drop-shadow(0 0 20px #8ab4ff66);animation:vpk 2.4s ease-in-out infinite}' +
    '#vc-peek .pk-s{position:absolute;right:6px;top:-6px;color:#f8d874;font-size:22px;text-shadow:0 0 10px #f8d874;animation:vps 1.6s ease-in-out infinite}' +
    '@keyframes vpk{50%{filter:drop-shadow(0 0 14px #f8d874dd) drop-shadow(0 0 30px #8ab4ff99)}}' +
    '@keyframes vps{50%{transform:scale(1.35) rotate(20deg);opacity:.7}}' +
    '@media(max-width:520px){#vc-peek{width:120px}}' +
    '#vc-big{position:fixed;inset:0;z-index:100010;display:flex;align-items:center;justify-content:center;padding:16px;font:400 17px/1.5 "Iowan Old Style","Palatino Linotype",Georgia,serif;color:#e8edff}' +
    '#vc-big .vb-bd{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1a2160ee,#03051096 75%),#030510d9;animation:vifade .35s both}' +
    '#vc-big.out .vb-bd,#vc-big.out .vb-in{animation:viout .4s both}' +
    '#vc-big .vb-in{position:relative;display:flex;align-items:center;justify-content:center;gap:clamp(12px,3vw,40px);max-width:900px}' +
    '#vc-big .vb-img{display:block;height:min(66vh,560px);max-width:40vw;width:auto;object-fit:contain;filter:drop-shadow(0 16px 44px #000a) drop-shadow(0 0 30px #5b6bb455)}' +
    '#vc-big .vb-card{width:min(400px,100%);padding:22px 24px;border:1.5px solid #5b6bb4;border-radius:20px;background:#0b1025f2;box-shadow:0 18px 50px #000b;animation:viup .5s .25s both}' +
    '#vc-big .vv-n{font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:#f8d874;margin-bottom:4px}' +
    '#vc-big .vb-t{margin:0 0 16px;font-size:21px;line-height:1.4;color:#fff}' +
    '#vc-big .vb-ok{font:inherit;font-size:16px;padding:9px 22px;border-radius:999px;cursor:pointer;color:#1a1500;background:#f8d874;border:1.5px solid #f8d874;font-weight:600}' +
    '#vc-big .vb-ok:hover,#vc-big .vb-ok:focus-visible{background:#ffe59a;outline:none}' +
    '@media(max-width:700px){#vc-big .vb-in{flex-direction:column;gap:8px}#vc-big .vb-img{height:min(34vh,300px);max-width:70vw}}' +
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
    '#vc-vero-intro .vi-ms{display:flex;flex-direction:column;gap:8px;margin:10px 0 4px}' +
    '#vc-vero-intro .vi-m{display:block;width:100%;text-align:left;padding:10px 14px;border:1.5px solid #343d63;border-radius:12px;background:#0e1430;color:#cfd6ff;font:inherit;cursor:pointer;transition:border-color .18s,background .18s}' +
    '#vc-vero-intro .vi-m b{display:block;font-size:17px;font-weight:600;color:#fff}' +
    '#vc-vero-intro .vi-m span{display:block;font-size:14.5px;color:#a9b3d9}' +
    '#vc-vero-intro .vi-m:hover,#vc-vero-intro .vi-m:focus-visible{border-color:#8ab4ff;outline:none}' +
    '#vc-vero-intro .vi-m[aria-checked="true"]{border-color:#f8d874;background:#1a1f45;box-shadow:0 0 0 1px #f8d87455}' +
    '#vc-vero-intro .vi-go{margin-top:8px;font:inherit;font-size:16px;padding:9px 22px;border-radius:999px;cursor:pointer;color:#1a1500;background:#f8d874;border:1.5px solid #f8d874;font-weight:600}' +
    '#vc-vero-intro .vi-go:disabled{opacity:.4;cursor:default}' +
    '#vc-vero-intro .vi-go:not(:disabled):hover,#vc-vero-intro .vi-go:focus-visible{background:#ffe59a;outline:none}' +
    '#vc-vero-intro .vi-in{transition:gap .5s}' +
    '#vc-vero-intro .vi-img{transition:height .5s cubic-bezier(.2,.8,.2,1),max-width .5s cubic-bezier(.2,.8,.2,1)}' +
    '#vc-vero-intro .vi-pv{flex:0 0 0px;width:0;opacity:0;overflow:hidden;transition:flex-basis .55s cubic-bezier(.2,.8,.2,1),opacity .4s .15s}' +
    '#vc-vero-intro .vi-in.pv{max-width:1240px}' +
    '#vc-vero-intro .vi-in.pv .vi-pv{flex-basis:330px;width:330px;opacity:1}' +
    '#vc-vero-intro .vi-in.pv .vi-img{height:min(62vh,560px);max-width:26vw}' +
    '#vc-vero-intro .vp{width:330px}' +
    '#vc-vero-intro .vp-scr{position:relative;height:214px;border:1.5px solid #343d63;border-radius:14px;background:radial-gradient(ellipse at 50% 30%,#141c44,#070a19);overflow:hidden}' +
    '#vc-vero-intro .vp-bar{display:flex;gap:6px;align-items:center;padding:8px 10px;border-bottom:1px solid #1d2448}' +
    '#vc-vero-intro .vp-bar i{display:block;width:18px;height:18px;border-radius:5px;background:#1a2040}' +
    '#vc-vero-intro .vp-bar .vp-sp{flex:1;background:none}' +
    '#vc-vero-intro .vp-bar .vp-fl{background:linear-gradient(#c60b1e 25%,#ffc400 25% 75%,#c60b1e 75%)}' +
    '#vc-vero-intro .vp-bar .vp-ic{background:#0e1226 url(' + 'vero/icono.webp) center/cover;border:1px solid #5b6bb4;transition:opacity .3s}' +
    '#vc-vero-intro .vp-body{padding:6px 14px}' +
    '#vc-vero-intro .vp-l{height:7px;border-radius:4px;background:#232a4f;margin:7px 0}' +
    '#vc-vero-intro .vp-l.w1{width:60%}#vc-vero-intro .vp-l.w2{width:85%}#vc-vero-intro .vp-l.w3{width:45%;background:#343d63}#vc-vero-intro .vp-l.w4{width:70%;margin:0;background:#3a4580}' +
    '#vc-vero-intro .vp-card{border:1px solid #232a4f;border-radius:8px;padding:4px 10px 8px;margin-top:8px}' +
    '#vc-vero-intro .vp-tc{display:flex;gap:7px;align-items:center;margin-top:6px;padding-top:6px;border-top:1px dashed #343d63;opacity:0;transition:opacity .4s}' +
    '#vc-vero-intro .vp-tc i{flex:none;width:16px;height:16px;border-radius:50%;border:1px solid #5b6bb4;background:#0b1025 url(' + 'vero/a-feliz.webp) center/cover}' +
    '#vc-vero-intro .vp-bb{position:absolute;width:118px;height:36px;border:1.5px solid #5b6bb4;border-radius:10px;background:#0b1025;opacity:0;transform:scale(.6)}' +
    '#vc-vero-intro .vp-bb:before,#vc-vero-intro .vp-bb:after{content:"";position:absolute;left:10px;height:5px;border-radius:3px;background:#3a4580}' +
    '#vc-vero-intro .vp-bb:before{top:9px;right:12px}#vc-vero-intro .vp-bb:after{top:20px;right:40px;background:#f8d87499}' +
    '#vc-vero-intro .vp-bb.b1{top:40px;right:14px;transform-origin:85% 0}#vc-vero-intro .vp-bb.b2{left:12px;bottom:18px;transform-origin:0 100%}#vc-vero-intro .vp-bb.b3{right:20px;bottom:52px;transform-origin:100% 100%}' +
    '#vc-vero-intro .vp-pic{display:none;position:absolute;left:3px;bottom:0;width:30px;height:46px;background:center bottom/contain no-repeat;filter:drop-shadow(0 2px 4px #000a)}' +
    '#vc-vero-intro .vp.m-full .vp-bb{width:136px;height:48px}' +
    '#vc-vero-intro .vp.m-full .vp-bb:before,#vc-vero-intro .vp.m-full .vp-bb:after{left:38px}' +
    '#vc-vero-intro .vp.m-full .vp-bb:before{top:14px}#vc-vero-intro .vp.m-full .vp-bb:after{top:26px}' +
    '#vc-vero-intro .vp.m-full .vp-pic{display:block}' +
    '#vc-vero-intro .vp-pk{display:none;position:absolute;left:44%;bottom:0;width:62px;height:42px;background:url(' + 'vero/p-asoma.webp) center top/contain no-repeat;filter:drop-shadow(0 0 6px #f8d874aa);transform:translateY(100%)}' +
    '#vc-vero-intro .vp.m-full .vp-pk{display:block;animation:vppk 3.2s .6s ease-in-out infinite}' +
    '@keyframes vppk{0%,12%{transform:translateY(100%)}26%,70%{transform:translateY(28%)}84%,100%{transform:translateY(100%)}}' +
    '#vc-vero-intro .vp-new{position:absolute;left:12px;top:44px;padding:2px 9px;border:1px dashed #f8d874;border-radius:999px;font-size:11.5px;color:#f8d874;background:#0b1025;opacity:0}' +
    '#vc-vero-intro .vp-cap{margin:10px 2px 0;font-size:14.5px;line-height:1.45;color:#cfd6ff;min-height:4.4em}' +
    '#vc-vero-intro .vp.m-off .vp-ic{opacity:0}' +
    '#vc-vero-intro .vp.m-on .vp-tc,#vc-vero-intro .vp.m-full .vp-tc{opacity:1}' +
    '#vc-vero-intro .vp.m-on .b1{animation:vpb1 6s 1s infinite}' +
    '#vc-vero-intro .vp.m-full .vp-ic{animation:vvb 1.4s ease-in-out infinite,vvg 1.4s ease-in-out infinite}' +
    '#vc-vero-intro .vp.m-full .b1{animation:vpb 3.2s .2s infinite}#vc-vero-intro .vp.m-full .b2{animation:vpb 3.2s 1.2s infinite}#vc-vero-intro .vp.m-full .b3{animation:vpb 3.2s 2.2s infinite}' +
    '#vc-vero-intro .vp.m-full .vp-new{opacity:1;animation:vpnew 2s ease-in-out infinite}' +
    '@keyframes vpb{0%{opacity:0;transform:scale(.6)}10%,58%{opacity:1;transform:none}72%,100%{opacity:0;transform:scale(.92)}}' +
    '@keyframes vpb1{0%,18%{opacity:0;transform:scale(.6)}28%,58%{opacity:1;transform:none}68%,100%{opacity:0;transform:scale(.92)}}' +
    '@keyframes vpnew{50%{box-shadow:0 0 12px #f8d87488}}' +
    '@media(max-width:1100px){#vc-vero-intro .vi-in.pv .vi-img{display:none}}' +
    '#vc-vero-intro .vi-sp{position:fixed;z-index:100011;pointer-events:none;color:#f8d874;font-size:20px;text-shadow:0 0 8px #f8d874}' +
    '@keyframes vifade{from{opacity:0}to{opacity:1}}' +
    '@keyframes viup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
    '@keyframes viout{to{opacity:0}}' +
    '@media(max-width:700px){#vc-vero-intro{align-items:flex-start;overflow:auto}#vc-vero-intro .vi-in{flex-direction:column;gap:6px;margin:auto 0}#vc-vero-intro .vi-img{height:min(30vh,260px);max-width:70vw}#vc-vero-intro .vi-pv,#vc-vero-intro .vi-in.pv .vi-pv{flex:none;width:100%;max-width:440px;transition:opacity .4s}#vc-vero-intro .vi-pv{height:0}#vc-vero-intro .vi-in.pv .vi-pv{height:auto}#vc-vero-intro .vp{width:100%}}' +
    '@media(prefers-reduced-motion:reduce){#vc-vero *,#vc-vero-intro *,#vc-big *,#vc-peek,#vc-peek *{animation:none!important;transition:none!important}#vc-vero .vv-i.hi{box-shadow:0 0 16px 5px #f8d874e0}#vc-vero-intro .vi-line{opacity:1}}'

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
    pt.hidden = !(ls(KEY) && ls(KEY) !== 'off' && String(day) !== ls(SEEN))
    var dd = w.querySelector('.vv-d')

    /* el icono se coloca a la izquierda del selector de idioma */
    function place() {
      if (!flex) { var r = lg.getBoundingClientRect(); w.style.right = (r.width ? Math.round(document.documentElement.clientWidth - r.left + 8) : 64) + 'px' }
      var ir = ic.getBoundingClientRect()
      /* el bocadillo se abre debajo del icono (sin salirse de la ventana) y la flecha apunta a el */
      var cw = document.documentElement.clientWidth, bw = b.offsetWidth || Math.min(310, cw - 24), cx = ir.left + ir.width / 2
      var R = Math.max(12, Math.min(cw - bw - 12, Math.round(cw - cx - 40)))
      b.style.right = R + 'px'; b.style.top = Math.round(ir.bottom + 10) + 'px'
      b.style.setProperty('--vv-ax', Math.max(14, Math.min(bw - 28, Math.round(cw - cx - R - 7))) + 'px')
    }
    place(); addEventListener('resize', place)
    /* el selector se mueve sin cambiar la ventana (p. ej. al abrirse el panel lateral del atlas): se sigue su contenedor */
    if (window.ResizeObserver && !flex) new ResizeObserver(function () { place() }).observe(lg.offsetParent || document.body)
    document.addEventListener('transitionend', function () { place() }, true)
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
      dd.hidden = false; delete b.dataset.auto; clearTimeout(hideT)
      b.classList.add('on'); pt.hidden = true; ls(SEEN, String(day))
    }

    /* ---------- consejos por su cuenta: a menudo en "completa"; en "discreta", uno al dia en la guia ---------- */
    function ctx() {
      var p = location.pathname, c = document.body.classList
      if (/ficha\.html/.test(p)) return 'ficha'
      if (/quienes-somos/.test(p)) return 'quien'
      if (c.contains('lugar-on')) return 'lugar'
      if (c.contains('principal-page')) return 'inicio'
      if (c.contains('guide-page')) return 'guia'
      return 'atlas'
    }
    var hideT = 0, autoT = 0, every = 0, lastAuto = 0, mute = 0, lastCtx = ctx()
    function busy() { return document.getElementById('vc-vero-intro') || document.getElementById('vc-aj') || document.getElementById('vc-big') || pk || (b.classList.contains('on') && b.dataset.auto !== '1') }
    function auto() {
      var m = ls(KEY); if (!m || m === 'off' || !W || busy() || Date.now() < mute) return
      var c = ctx(), l = CTX[c] || TIPS, tip = l[Math.floor(Math.random() * l.length)]
      lastAuto = Date.now()
      if (m === 'full') { peek(c, tip); return }
      t.textContent = tip; dd.hidden = true; b.dataset.auto = '1'; b.classList.add('on'); place()
      clearTimeout(hideT); hideT = setTimeout(function () { if (b.dataset.auto === '1') b.classList.remove('on') }, 12000)
    }

    /* modo completa: Vero se asoma por el borde inferior, resplandeciendo; si se pulsa, se abre en grande con el consejo */
    var pk = null, pkT = 0
    function peek(c, tip) {
      if (pk || document.getElementById('vc-big')) return
      var ps = PICS[c] || ['saluda'], pose = ps[Math.floor(Math.random() * ps.length)]
      var el = pk = document.createElement('button'); el.type = 'button'; el.id = 'vc-peek'; el.setAttribute('aria-label', 'Vero tiene un consejo para ti')
      el.innerHTML = '<span class="pk-s" aria-hidden="true">✦</span><img alt="" src="' + BASE + 'p-asoma.webp" decoding="async">'
      var vw = document.documentElement.clientWidth, wpk = vw < 520 ? 120 : 150
      el.style.left = Math.round(Math.max(12, Math.min(vw - wpk - 12, vw * (.12 + Math.random() * .58)))) + 'px'
      document.body.append(el)
      var big = new Image(); big.src = BASE + (pose === 'saluda' ? 'saluda' : 'g-' + pose) + '.webp'
      var im = el.querySelector('img'), shown = false
      var show = function () { if (shown || pk !== el) return; shown = true; requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on') }) }) }
      if (im.complete && im.naturalWidth) show(); else { im.onload = show; im.onerror = function () { hidePeek() } }
      clearTimeout(pkT); pkT = setTimeout(hidePeek, 15000)
      el.addEventListener('click', function () { var r = im.getBoundingClientRect(); clearTimeout(pkT); pk = null; el.remove(); bigOpen(tip, big.src, r) })
    }
    function hidePeek() {
      clearTimeout(pkT); if (!pk) return
      var el = pk; pk = null; el.classList.remove('on'); setTimeout(function () { el.remove() }, reduced() ? 0 : 700)
    }
    function bigOpen(tip, src, from) {
      var o = document.createElement('div'); o.id = 'vc-big'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Vero')
      o.innerHTML = '<div class="vb-bd"></div><div class="vb-in"><img class="vb-img" alt="" src="' + src + '"><div class="vb-card"><div class="vv-n">Vero</div><p class="vb-t"></p><button type="button" class="vb-ok">¡Gracias, Vero!</button></div></div>'
      o.querySelector('.vb-t').textContent = tip
      document.body.append(o)
      var img = o.querySelector('.vb-img')
      var pop = function () {
        if (reduced() || !img.animate || !from) return
        var r = img.getBoundingClientRect(), fx = from.left + from.width / 2 - (r.left + r.width / 2), fy = from.top + from.height / 2 - (r.top + r.height / 2)
        img.animate([{ transform: 'translate(' + fx + 'px,' + fy + 'px) scale(.2)', opacity: .2 }, { transform: 'translate(' + fx * .08 + 'px,' + fy * .08 + 'px) scale(1.05)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.22,.9,.3,1)' })
      }
      if (img.complete && img.naturalWidth) pop(); else img.onload = pop
      var closed = false
      function close() {
        if (closed) return; closed = true; document.removeEventListener('keydown', key, true)
        o.classList.add('out'); setTimeout(function () { o.remove() }, reduced() ? 0 : 400)
      }
      function key(e) { if (e.key === 'Escape') { e.stopPropagation(); close() } }
      document.addEventListener('keydown', key, true)
      o.querySelector('.vb-ok').addEventListener('click', close)
      o.querySelector('.vb-bd').addEventListener('click', close)
      setTimeout(function () { try { o.querySelector('.vb-ok').focus({ preventScroll: true }) } catch (e) { } }, reduced() ? 30 : 700)
    }
    function guideTip() {
      if (ls(KEY) !== 'on' || ctx() !== 'guia' || ls(TIPDAY) === String(day)) return
      clearTimeout(autoT); autoT = setTimeout(function () { if (ctx() === 'guia' && ls(TIPDAY) !== String(day)) { ls(TIPDAY, String(day)); auto() } }, 10000)
    }
    function schedule() {
      clearTimeout(autoT); clearInterval(every)
      if (ls(KEY) === 'full') {
        autoT = setTimeout(auto, 7000)
        every = setInterval(function () { if (Date.now() - lastAuto > 170000) auto() }, 30000)
      } else guideTip()
    }
    schedule()
    new MutationObserver(function () {
      var c = ctx(); if (c === lastCtx) return; lastCtx = c
      if (b.dataset.auto === '1') b.classList.remove('on')
      hidePeek()
      if (ls(KEY) === 'full') { clearTimeout(autoT); autoT = setTimeout(auto, 2500) } else guideTip()
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] })
    b.addEventListener('pointerenter', function () { delete b.dataset.auto })
    b.addEventListener('focusin', function () { delete b.dataset.auto })
    W.schedule = schedule
    ic.addEventListener('click', function () {
      ic.classList.remove('hi')
      if (!ls(KEY)) { intro(ic); return }
      clearTimeout(ct); clicks++; ct = setTimeout(function () { clicks = 0 }, 1500)
      if (clicks >= 5) { clicks = 0; place(); t.textContent = '¡Eh, que me despeinas!'; f.textContent = FACTS[(day + 3) % FACTS.length]; b.classList.add('on'); return }
      if (b.classList.contains('on')) b.classList.remove('on'); else open()
    })
    w.querySelector('.vv-x').addEventListener('click', function () { if (b.dataset.auto) mute = Date.now() + 120000; b.classList.remove('on') })
    w.querySelector('.vv-h').addEventListener('click', function () {
      ls(KEY, 'off')
      t.textContent = 'Vero desactivada. Podrás volver a activarla en Ajustes, dentro del menú.'
      w.querySelector('.vv-d').hidden = true; w.querySelector('.vv-h').hidden = true
      setTimeout(off, 2600)
    })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') b.classList.remove('on') })
  }

  function off() { if (W) { W.remove(); W = null } document.body.classList.remove('vero-on') }
  /* cambio de modo (desde la presentacion o desde Ajustes) */
  function setMode(m) {
    ls(KEY, m === 'off' || m === 'full' ? m : 'on')
    if (m === 'off') { off(); return }
    if (!W) { tries = 0; mount() } else if (W.schedule) W.schedule()
  }

  /* presentacion: Vero sale del icono, grande, se presenta y se elige el modo (con vista previa animada) */
  var MODES = [
    ['off', 'Desactivada', 'No aparezco en ningún sitio.', 'La web tal cual, sin mí. Podrás activarme cuando quieras desde Ajustes.'],
    ['on', 'Discreta', 'En mi icono y en las fichas; casi no molesto.', 'Mi icono junto al idioma, datos curiosos en las fichas y, de vez en cuando, un consejo en la guía.'],
    ['full', 'Completa', 'Te acompaño a menudo con consejos.', 'Aparezco a menudo con consejos por toda la web, y aquí llegará todo lo nuevo que prepare.']
  ]
  function intro(ic) {
    if (document.getElementById('vc-vero-intro')) return
    var o = document.createElement('div'); o.id = 'vc-vero-intro'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Vero')
    o.innerHTML = '<div class="vi-bd"></div><div class="vi-in"><img class="vi-img" alt="" src="' + BASE + 'saluda.webp" decoding="async"><div class="vi-card">' +
      '<div class="vv-n">Vero</div><h2 class="vi-h vi-line" style="animation-delay:.5s">¡Hola! Soy Vero Andromedasis</h2>' +
      '<p class="vi-line" style="animation-delay:.8s">Me flipa el cielo, así que te acompaño por la web con consejos para empezar a observar y un dato curioso cada día.</p>' +
      '<p class="vi-q vi-line" style="animation-delay:1.1s">Vivo en este icono, junto al idioma, y tú decides cuánto te acompaño:</p>' +
      '<div class="vi-ms vi-line" role="radiogroup" aria-label="Modo de Vero" style="animation-delay:1.3s">' + MODES.map(function (m) { return '<button type="button" class="vi-m" role="radio" aria-checked="false" data-m="' + m[0] + '"><b>' + m[1] + '</b><span>' + m[2] + '</span></button>' }).join('') + '</div>' +
      '<button type="button" class="vi-go vi-line" style="animation-delay:1.5s" disabled>Elegir este modo</button>' +
      '<p class="vi-s vi-line" style="animation-delay:1.7s">Podrás cambiar tu decisión cuando quieras en Ajustes, dentro del menú.</p></div>' +
      '<div class="vi-pv" aria-hidden="true"><div class="vp"><div class="vp-scr"><div class="vp-bar"><i></i><i class="vp-sp"></i><i class="vp-ic"></i><i class="vp-fl"></i><i></i></div>' +
      '<div class="vp-body"><div class="vp-l w1"></div><div class="vp-l w2"></div><div class="vp-card"><div class="vp-l w3"></div><div class="vp-l w2"></div><div class="vp-tc"><i></i><div class="vp-l w4"></div></div></div></div>' +
      '<div class="vp-bb b1"><i class="vp-pic" style="background-image:url(' + BASE + 'p-saluda.webp)"></i></div><div class="vp-bb b2"><i class="vp-pic" style="background-image:url(' + BASE + 'p-telescopio.webp)"></i></div><div class="vp-bb b3"><i class="vp-pic" style="background-image:url(' + BASE + 'p-senala.webp)"></i></div><div class="vp-new">Próximamente, más cosas</div><i class="vp-pk"></i></div><p class="vp-cap"></p></div></div></div>'
    document.body.append(o)
    var img = o.querySelector('.vi-img'), card = o.querySelector('.vi-card'), inn = o.querySelector('.vi-in'), go = o.querySelector('.vi-go'), vp = o.querySelector('.vp'), cap = o.querySelector('.vp-cap'), done = false, sel = null
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
    /* al elegir un modo, Vero y el cartel se apartan a la izquierda y a la derecha se ve como queda */
    o.querySelector('.vi-ms').addEventListener('click', function (e) {
      var bt = e.target.closest('.vi-m'); if (!bt || done) return
      sel = bt.dataset.m
      ;[].forEach.call(o.querySelectorAll('.vi-m'), function (x) { x.setAttribute('aria-checked', String(x === bt)) })
      vp.className = 'vp m-' + sel
      MODES.forEach(function (m) { if (m[0] === sel) cap.textContent = m[3] })
      inn.classList.add('pv'); go.disabled = false
    })
    function close(cb) {
      if (done) return; done = true
      o.classList.add('out'); setTimeout(function () { o.remove(); if (cb) cb() }, reduced() ? 0 : 500)
    }
    function say(text) {
      inn.classList.remove('pv')
      card.innerHTML = '<div class="vv-n">Vero</div><p class="vi-h" style="font-size:22px;margin:6px 0 0"></p>'
      card.querySelector('.vi-h').textContent = text
    }
    go.addEventListener('click', function () {
      if (done || !sel) return
      var m = sel
      ls(KEY, m)
      if (m === 'off') { say('Entendido, no te molestaré más. Podrás volver a activarme en Ajustes, dentro del menú.'); setTimeout(function () { close(function () { setMode('off') }) }, 2800); return }
      say(m === 'full' ? '¡Genial! Prepárate, que tengo mucho que contarte.' : '¡Genial! Estaré por aquí, sin molestar.'); sparks()
      setTimeout(function () { close(function () { setMode(m) }) }, 1800)
    })
    /* cerrar sin decidir: la presentacion volvera a salir la proxima vez */
    o.querySelector('.vi-bd').addEventListener('click', function () { if (!ls(KEY)) close() })
    var onKey = function (e) { if (e.key === 'Escape' && !done && !ls(KEY)) { document.removeEventListener('keydown', onKey, true); close() } }
    document.addEventListener('keydown', onKey, true)
    setTimeout(function () { var f = o.querySelector('.vi-m'); try { f.focus({ preventScroll: true }) } catch (e) { } }, reduced() ? 50 : 1700)
  }

  window.vcVero = { mount: function () { tries = 0; mount() }, off: off, mode: setMode }
  function start() { (window.requestIdleCallback || function (fn) { setTimeout(fn, 1200) })(mount) }
  if (document.readyState === 'complete') start(); else addEventListener('load', start)
})()
