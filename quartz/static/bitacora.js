/* Vero Cosmos: Bitacora del Cielo (noticias, eventos astronomicos, viajes y curiosidades)
   - Pestanas: Pagina principal (lo ultimo en grande, 2 destacados, cuenta atras y archivo), Eventos astronomicos y Viajes y curiosidades.
   - Los datos salen de bitacora.json, que genera tools/bitacora.mjs a partir de las notas de la carpeta "Bitácora" del vault.
   - Proximos eventos (con cuenta atras), noticias y eventos pasados; al pulsar una entrada se abre entera.
   - Cada entrada tiene su direccion: /bitacora-del-cielo#id-de-la-entrada.
   - Los textos vienen ya traducidos en el JSON; la interfaz se traduce aqui (la seccion va con data-no-i18n). */
(function () {
  var SRC = (document.currentScript && document.currentScript.getAttribute('data-src')) || 'bitacora.json'
  /* direcciones por idioma (rutas.js): /bitacora-del-cielo/leonidas-2026, /en/sky-log/leonids-2026, /fr/journal-du-ciel/leonides-2026 */
  var R = window.vcRutas
  function L() { try { return R.parse(T0().location.pathname).lang } catch (e) { return 'es' } }
  var PATH = R ? R.path('log', L()) : '/bitacora-del-cielo'
  var RESTS = {}
  function inLog() { try { return R.parse(T0().location.pathname).key === 'log' } catch (e) { return false } }
  function entryPath(id) { var l = L(); return id && RESTS[id] ? R.path('log', l, RESTS[id][l]) : R.path('log', l) }
  var UI = {
    es: { name: 'Bitácora del Cielo', lead: 'Noticias y eventos astronómicos', up: 'Próximos eventos', news: 'Noticias', past: 'Eventos pasados', noUp: 'Ahora mismo no hay eventos a la vista. ¡Vuelve pronto!', noNews: 'Todavía no hay noticias.', now: '¡Ahora!', tonight: '¡Esta noche!', today: 'Hoy', tomorrow: 'Mañana', inDays: 'Dentro de {n} días', back: 'Volver a la Bitácora', source: 'Fuente', sources: 'Fuentes', best: 'Cuándo', ended: 'Terminado', more: 'Ver más eventos pasados', loading: 'Cargando…', error: 'No se ha podido cargar la Bitácora. Prueba a recargar la página.', ev: 'Evento', nw: 'Noticia', from: 'Del {a} al {b}', tHome: 'Página principal', tEv: 'Eventos astronómicos', tTrips: 'Viajes y curiosidades', tabs: 'Secciones de la Bitácora', cd: 'Cuenta atrás', cdNow: '¡Está pasando ahora!', dd: 'días', d1: 'día', hh: 'horas', h1: 'hora', mm: 'min', arch: 'Otras noticias', noArch: 'Aquí irán las entradas anteriores.', noHome: 'Todavía no hay entradas. ¡Vuelve pronto!', noTrips: 'Pronto habrá viajes y curiosidades. ¡Vuelve pronto!', vj: 'Viaje', cu: 'Curiosidad', cr: 'Crónica', moreA: 'Ver más', noPast: 'Todavía no hay eventos pasados.', bye: '¡Gracias por leer!', hmm: '¿Qué hay de nuevo hoy? Hmm...', bLive: '¡Está pasando ahora! Sal a mirar el cielo.', bTonight: '¡Esta noche, {t}! No te lo pierdas.', bToday: '¡Hoy, {t}! No te lo pierdas.', bTomorrow: '¡Mañana, {t}! No te lo pierdas.', bDays: '¡Faltan {n} días para {t}!', goEntry: 'Ver la entrada', close: 'Cerrar', seeEv: 'Ver el evento', byeS: 'Nos vemos bajo las estrellas.', rel: 'Noticias y eventos relacionados' },
    en: { name: 'Sky Log', lead: 'Astronomy news and events', up: 'Upcoming events', news: 'News', past: 'Past events', noUp: 'There are no events coming up right now. Check back soon!', noNews: 'No news yet.', now: 'Now!', tonight: 'Tonight!', today: 'Today', tomorrow: 'Tomorrow', inDays: 'In {n} days', back: 'Back to the Sky Log', source: 'Source', sources: 'Sources', best: 'When', ended: 'Ended', more: 'Show more past events', loading: 'Loading…', error: 'The Sky Log could not be loaded. Try reloading the page.', ev: 'Event', nw: 'News', from: 'From {a} to {b}', tHome: 'Front page', tEv: 'Astronomical events', tTrips: 'Trips and curiosities', tabs: 'Sky Log sections', cd: 'Countdown', cdNow: 'Happening right now!', dd: 'days', d1: 'day', hh: 'hours', h1: 'hour', mm: 'min', arch: 'More news', noArch: 'Older entries will appear here.', noHome: 'No entries yet. Check back soon!', noTrips: 'Trips and curiosities coming soon. Check back soon!', vj: 'Trip', cu: 'Curiosity', cr: 'Story', moreA: 'Show more', noPast: 'No past events yet.', bye: 'Thanks for reading!', hmm: 'What’s new today? Hmm...', bLive: 'It’s happening now! Go out and look at the sky.', bTonight: 'Tonight: {t}! Don’t miss it.', bToday: 'Today: {t}! Don’t miss it.', bTomorrow: 'Tomorrow: {t}! Don’t miss it.', bDays: 'Only {n} days until {t}!', goEntry: 'Read the entry', close: 'Close', seeEv: 'See the event', byeS: 'See you under the stars.', rel: 'Related news and events' },
    fr: { name: 'Journal du ciel', lead: 'Actualités et événements astronomiques', up: 'Événements à venir', news: 'Actualités', past: 'Événements passés', noUp: 'Aucun événement à venir pour le moment. Revenez bientôt !', noNews: 'Pas encore d’actualités.', now: 'Maintenant !', tonight: 'Ce soir !', today: 'Aujourd’hui', tomorrow: 'Demain', inDays: 'Dans {n} jours', back: 'Retour au Journal du ciel', source: 'Source', sources: 'Sources', best: 'Quand', ended: 'Terminé', more: 'Voir plus d’événements passés', loading: 'Chargement…', error: 'Impossible de charger le Journal du ciel. Essayez de recharger la page.', ev: 'Événement', nw: 'Actualité', from: 'Du {a} au {b}', tHome: 'À la une', tEv: 'Événements astronomiques', tTrips: 'Voyages et curiosités', tabs: 'Rubriques du Journal du ciel', cd: 'Compte à rebours', cdNow: 'C’est en ce moment !', dd: 'jours', d1: 'jour', hh: 'heures', h1: 'heure', mm: 'min', arch: 'Autres actualités', noArch: 'Les articles plus anciens apparaîtront ici.', noHome: 'Pas encore d’articles. Revenez bientôt !', noTrips: 'Des voyages et curiosités arrivent bientôt. Revenez bientôt !', vj: 'Voyage', cu: 'Curiosité', cr: 'Chronique', moreA: 'Voir plus', noPast: 'Pas encore d’événements passés.', bye: 'Merci de votre lecture !', hmm: 'Quoi de neuf aujourd’hui ? Hmm...', bLive: 'C’est en ce moment ! Sortez regarder le ciel.', bTonight: 'Ce soir : {t} ! Ne le manquez pas.', bToday: 'Aujourd’hui : {t} ! Ne le manquez pas.', bTomorrow: 'Demain : {t} ! Ne le manquez pas.', bDays: 'Plus que {n} jours avant {t} !', goEntry: 'Voir l’article', close: 'Fermer', seeEv: 'Voir l’événement', byeS: 'À bientôt sous les étoiles.', rel: 'Actualités et événements liés' }
  }
  var LOC = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR' }
  function lang() { var l = (window.vcI18n && window.vcI18n.lang) || 'es'; return UI[l] ? l : 'es' }
  function u(k, n) { var s = UI[lang()][k]; return n == null ? s : s.replace('{n}', n) }
  function tx(o) { if (!o) return ''; var l = lang(); return o[l] || o.es || '' }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  /* markdown minimo: **negrita**, *cursiva*, [enlace](https://...) y listas con "- " */
  function md(s) {
    var h = esc(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
    var ls = h.split('\n'), out = '', li = false, txt = []
    function flush() { if (txt.length) { out += '<p>' + txt.join(' ') + '</p>'; txt = [] } }
    ls.forEach(function (l) {
      if (/^- /.test(l)) { flush(); if (!li) { out += '<ul>'; li = true } out += '<li>' + l.slice(2) + '</li>' }
      else { if (li) { out += '</ul>'; li = false } txt.push(l) }
    })
    if (li) out += '</ul>'
    flush(); return out
  }
  function T0() { try { var t = window.top; void t.location.pathname; return t } catch (e) { return window } }

  var CSS =
    '#log-view{position:absolute;inset:0;display:none;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#111936 0%,#080b19 45%,#05060f 80%)}' +
    'body.log-page #log-view{display:block}' +
    'body.log-page #cv,body.log-page #search-wrap,body.log-page #nav,body.log-page #msg,body.log-page #recenter{display:none!important}' +
    'body.log-page #head h1{display:none}' +
    /* el contenido empieza por debajo de la franja del titulo y los botones: al bajar, nunca se mete en ella */
    '#b-main{position:absolute;top:62px;left:0;right:0;bottom:0;overflow-y:auto;padding:18px clamp(18px,4vw,48px) 40px;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 16px);mask-image:linear-gradient(180deg,transparent 0,#000 16px);-webkit-overflow-scrolling:touch}' +
    '#b-wrap{max-width:860px;margin:0 auto}' +
    '#b-wrap h2{margin:0 0 8px;font:400 clamp(34px,6vw,64px)/1.08 "Iowan Old Style",Georgia,serif;color:#f5f7ff;text-shadow:0 0 30px #8ab4ff30}' +
    '#b-wrap .b-lead{margin:0 0 30px;color:#b8c4e6;font:400 clamp(16px,2vw,21px)/1.5 "Iowan Old Style",Georgia,serif}' +
    '#b-wrap h3{margin:30px 0 12px;color:#aebbe1;font-size:11px;font-weight:650;letter-spacing:.17em;text-transform:uppercase}' +
    '.b-list{display:grid;gap:12px}' +
    '.b-card{display:flex;gap:16px;align-items:flex-start;width:100%;text-align:left;padding:16px 18px;border:1px solid #343d63;border-radius:13px;background:linear-gradient(120deg,#111a35d9,#0b1025d9);color:#eef1ff;font:inherit;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}' +
    '.b-card:hover,.b-card:focus-visible{transform:translateY(-2px);border-color:#8199d8;background:linear-gradient(120deg,#182448ed,#101832ed);outline:none}' +
    '.b-card.b-next{border-color:#5b6bb4;box-shadow:0 0 26px #5b6bb433}' +
    '.b-date{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;width:58px;height:62px;border:1px solid #414e7a;border-radius:11px;background:#192443;color:#b9c9ff;line-height:1}' +
    '.b-date b{font:400 25px/1 "Iowan Old Style",Georgia,serif;color:#f5f7ff}.b-date small{margin-top:4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase}' +
    '.b-thumb{flex:none;width:62px;height:62px;border-radius:11px;object-fit:cover;border:1px solid #414e7a}' +
    '.b-tx{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}' +
    '.b-tt{font:400 19px/1.25 "Iowan Old Style",Georgia,serif;color:#f5f7ff}' +
    '.b-ds{font-size:13.5px;line-height:1.5;color:#aeb9dd}' +
    '.b-meta{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:12px;color:#8f98c0}' +
    '.b-chip{display:inline-block;padding:3px 9px;border-radius:999px;background:#f8d874;color:#1a1500;font-size:11.5px;font-weight:650}' +
    '.b-chip.b-soft{background:#1d2850;color:#b9c9ff;border:1px solid #414e7a;font-weight:600}' +
    '.b-past .b-card{opacity:.78}.b-past .b-card:hover{opacity:1}' +
    '.b-empty{margin:0;padding:16px 18px;border:1px dashed #343d63;border-radius:13px;color:#8f98c0;font-size:14px}' +
    '.b-more{margin-top:10px;padding:8px 16px;border:1px solid #414e7a;border-radius:999px;background:none;color:#b9c9ff;font:inherit;font-size:13px;cursor:pointer}.b-more:hover,.b-more:focus-visible{border-color:#b9c9ff;color:#fff;outline:none}' +
    /* entrada abierta */
    '.b-art{position:relative;max-width:1240px;margin:0 auto}' +
    /* con entradas relacionadas: la entrada a la izquierda y la columna de relacionadas a la derecha */
    '.b-artw{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) clamp(260px,24vw,340px);gap:0 clamp(24px,3vw,44px);align-items:start}.b-artw>.b-art{max-width:none;margin:0}' +
    '.b-rel{position:sticky;top:0;display:flex;flex-direction:column;gap:12px;padding-top:58px}' +
    '.b-rel h3{margin:0 0 2px;font-size:12px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:#aebbe1}' +
    '.b-rel .b-mini img{height:110px}' +
    /* Vero en la entrada (solo en el modo Completa) */
    '.b-art figure.b-hv{position:relative;margin-top:clamp(44px,5vw,62px)}' +
    '.b-vas{position:absolute;top:0;right:7%;z-index:1;width:clamp(78px,7.6vw,100px);transform:translateY(calc(-100% + 9px));pointer-events:none;animation:bVas .7s cubic-bezier(.2,1.3,.4,1) .7s backwards}' +
    '@keyframes bVas{from{opacity:0;transform:translateY(calc(-100% + 34px))}}' +
    '.b-art .b-sum.b-hv{position:relative;padding-right:clamp(74px,8.5vw,110px)}' +
    '.b-vsn{position:absolute;right:10px;bottom:0;height:clamp(92px,9vw,122px);pointer-events:none}' +
    '.b-art .b-when.b-hv{display:flex;align-items:center;gap:12px}.b-vtl{flex:none;height:clamp(52px,5vw,66px)}' +
    '.b-relh{display:flex;align-items:flex-end;gap:10px}.b-relh img{flex:none;height:58px}.b-relh h3{margin-bottom:6px}' +
    '@media(prefers-reduced-motion:reduce){.b-vas{animation:none}}' +
    '@media(max-width:1000px){.b-artw{display:block}.b-rel{position:static;padding-top:34px;margin-top:30px;border-top:1px solid #343d63}}' +
    '.b-back{display:inline-flex;align-items:center;gap:8px;margin:0 0 20px;padding:7px 14px;border:1px solid #414e7a;border-radius:999px;background:#0b1025cc;color:#b9c9ff;font:inherit;font-size:13.5px;cursor:pointer}.b-back:hover,.b-back:focus-visible{border-color:#b9c9ff;color:#fff;outline:none}' +
    '.b-art h2{margin:6px 0 10px;font:400 clamp(30px,5vw,48px)/1.12 "Iowan Old Style",Georgia,serif!important;color:#f5f7ff}' +
    '.b-art .b-when{margin:0 0 18px;color:#b8c4e6;font:400 17px/1.5 "Iowan Old Style",Georgia,serif}' +
    '.b-art figure{margin:0 0 20px}.b-art figure img:not(.b-vas){display:block;width:100%;height:clamp(140px,42vw,520px);object-fit:cover;object-position:50% 40%;border-radius:14px;border:1px solid #343d63}' +
    '.b-art figcaption{margin-top:6px;font-size:12px;color:#8f98c0}' +
    '.b-art .b-sum{margin:0 0 18px;padding:14px 16px;border-left:3px solid #f8d874;border-radius:4px 12px 12px 4px;background:#111a35b3;color:#e8edff;font:400 18px/1.55 "Iowan Old Style",Georgia,serif}' +
    '.b-body p,.b-body li{color:#d6ddf5;font-size:16px;line-height:1.7}.b-body p{margin:0 0 14px}.b-body ul{margin:0 0 14px;padding-left:22px}' +
    '.b-body a,.b-src a{color:#8ab4ff}.b-body b{color:#f8d874;font-weight:650}' +
    '.b-body .b-h{margin:26px 0 8px;font:400 22px/1.25 "Iowan Old Style",Georgia,serif;letter-spacing:0;text-transform:none;color:#f5f7ff}' +
    /* detalle amarillo: una estrellita delante de cada subtitulo */
    '.b-body .b-h::before{content:"\\2726";display:inline-block;margin-right:9px;font-size:.62em;vertical-align:.22em;color:#f8d874;text-shadow:0 0 10px #f8d87488}' +
    '.b-src{margin-top:22px;padding-top:14px;border-top:1px solid #232a4f;font-size:13px;color:#8f98c0}' +
    '#log-view .b-in{opacity:1}#log-view.play .b-in{animation:bIn .7s cubic-bezier(.2,.8,.2,1) var(--d,0s) backwards}' +
    '@keyframes bIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
    /* pantallas grandes: eventos y noticias en dos columnas */
    '@media(min-width:1200px){#b-wrap{max-width:1180px}.b-cols{display:grid;grid-template-columns:1.15fr .85fr;gap:0 40px;align-items:start}.b-body p,.b-body li{font-size:17.5px}.b-art .b-sum{font-size:19.5px}.b-art .b-when{font-size:18px}}' +
    '#b-sky{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
    /* Vero en la Bitacora (segun su modo: discreta o completa; desactivada, no sale) */
    '#b-wrap{position:relative}' +
    '#bhead{position:absolute;top:18px;left:62px;right:64px;z-index:3;display:flex;align-items:baseline;gap:14px;pointer-events:none}' +
    '#bhead h2{margin:0;font:400 22px/1 "Iowan Old Style",Georgia,serif;letter-spacing:.02em;color:#fff;white-space:nowrap}' +
    '#bhead p{margin:0;color:#b8c4e6;font:400 15px/1.3 "Iowan Old Style",Georgia,serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@media(max-width:700px){#bhead{left:60px}#bhead h2{max-width:calc(100vw - 176px);overflow:hidden;text-overflow:ellipsis}body.vero-on #bhead h2{max-width:calc(100vw - 212px)}#bhead p{display:none}}' +
    '.b-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:0 0 22px}.b-top .b-tabs{margin:0}' +
    '.b-vh{flex:none;margin:0 0 -10px;width:auto;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,#000 78%,transparent);mask-image:linear-gradient(180deg,#000 78%,transparent);filter:drop-shadow(0 10px 24px #0008)}' +
    '.b-vh.m-full{height:clamp(110px,10vw,170px)}.b-vh.m-on{height:clamp(84px,7vw,118px);opacity:.95}' +
    '.b-vt{position:absolute;right:12px;top:calc(-1 * clamp(86px,7vw,116px) + 30px);height:clamp(86px,7vw,116px);width:auto;pointer-events:none;filter:drop-shadow(0 6px 14px #0009)}' +
    '.b-count.b-hasv{margin-top:clamp(56px,4.6vw,86px)}.b-count.b-hasv h3{max-width:calc(100% - 70px)}' +
    '.b-empty.b-ev{display:flex;align-items:center;gap:14px}.b-empty.b-ev img{flex:none;height:78px;width:auto}' +
    '.b-trips{display:flex;gap:24px;align-items:flex-start}.b-trips .b-grid{flex:1;min-width:0}' +
    '.b-tv{flex:none;height:clamp(240px,26vw,360px);width:auto;position:sticky;top:20px;pointer-events:none;filter:drop-shadow(0 12px 26px #0008)}' +
    '.b-bye{display:flex;align-items:center;gap:14px;margin-top:26px;padding:14px 16px;border:1px solid #343d63;border-radius:14px;background:linear-gradient(120deg,#111a35d9,#0b1025d9)}' +
    '.b-bye img{flex:none;height:120px;width:auto;margin:-14px 0 -14px}.b-bye b{display:block;font:400 20px/1.2 "Iowan Old Style",Georgia,serif;color:#f5f7ff}.b-bye span{font-size:13.5px;color:#aeb9dd}' +
    '@media(max-width:700px){.b-vh.m-full{height:104px}.b-vh.m-on{height:80px}.b-trips{flex-direction:column-reverse;align-items:center}.b-tv{position:static;height:170px}}' +
    /* pestanas */
    '.b-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px}' +
    '.b-tab{padding:9px 16px;border:1px solid #343d63;border-radius:999px;background:#0b1025cc;color:#b9c9ff;font:inherit;font-size:14px;cursor:pointer;transition:border-color .2s,background .2s,color .2s}' +
    '.b-tab:hover,.b-tab:focus-visible{border-color:#8199d8;color:#fff;outline:none}' +
    '.b-tabs{position:relative}.b-tab{position:relative;z-index:1}' +
    '.b-tab[aria-selected="true"]{background:#f8d874;border-color:#f8d874;color:#1a1500;font-weight:650}' +
    /* con el indicador ya colocado, el fondo amarillo es el indicador, que se desliza de una pestana a otra */
    '.b-tabs.b-hasind .b-tab[aria-selected="true"]{background:transparent;border-color:transparent}' +
    '.b-ind{position:absolute;z-index:0;left:0;top:0;width:0;height:0;border-radius:999px;background:#f8d874;box-shadow:0 4px 18px #f8d87433;transition:left .38s cubic-bezier(.2,.8,.2,1),top .38s cubic-bezier(.2,.8,.2,1),width .38s cubic-bezier(.2,.8,.2,1),height .38s cubic-bezier(.2,.8,.2,1)}' +
    '.b-ind.b-now{transition:none}' +
    '.b-noanim .b-in{animation:none!important}' +
    '.b-vhw{position:relative;flex:none;display:flex;align-items:flex-end;transition:opacity .3s ease}.b-vhw.b-off{opacity:0}' +
    /* bocadillo de Vero (solo en completa), a la izquierda de su cabeza */
    '.b-bub{position:absolute;right:calc(100% + 12px);top:8%;z-index:2;width:max-content;max-width:min(270px,34vw);padding:8px 13px;border:1.5px solid #5b6bb4;border-radius:14px;background:#0b1025;color:#e8edff;font:400 14.5px/1.35 "Iowan Old Style",Georgia,serif;box-shadow:0 8px 22px #0008;white-space:normal;text-wrap:balance;transform-origin:100% 50%;animation:bBub .45s cubic-bezier(.2,1.4,.4,1) 1s backwards}' +
    /* flechita estrecha hacia Vero: un triangulo del color del borde y, encima, otro del color del fondo */
    '.b-bub:before,.b-bub:after{content:"";position:absolute;top:50%;width:0;height:0;border-style:solid}' +
    '.b-bub:before{right:-10px;margin-top:-5.5px;border-width:5.5px 0 5.5px 10px;border-color:transparent transparent transparent #5b6bb4}' +
    '.b-bub:after{right:-7.4px;margin-top:-4.2px;border-width:4.2px 0 4.2px 9.2px;border-color:transparent transparent transparent #0b1025}' +
    '@keyframes bBub{from{opacity:0;transform:scale(.6) translateX(10px)}to{opacity:1;transform:none}}' +
    '.b-noanim .b-bub{animation:none}' +
    /* si habla de un evento, el bocadillo se puede pulsar */
    '.b-bub.b-go{cursor:pointer;transition:border-color .2s,box-shadow .2s}.b-bub.b-go:hover,.b-bub.b-go:focus-visible{border-color:#b9c9ff;box-shadow:0 8px 22px #0008,0 0 0 3px #5b6bb455;outline:none}' +
    '@media(min-width:701px){.b-bub.b-go:hover:before,.b-bub.b-go:focus-visible:before{border-left-color:#b9c9ff}}' +
    '@media(max-width:700px){.b-bub.b-go:hover:before,.b-bub.b-go:focus-visible:before{border-top-color:#b9c9ff}}' +
    /* previsualizacion del evento */
    '.b-top{position:relative}' +
    /* banner de temporada (temporadas.js): ocupa el hueco a la izquierda de Vero, encima de las pestanas */
    '.b-top.b-hasbn{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"bn vh" "tabs vh";column-gap:16px;row-gap:14px;align-items:end}' +
    '.b-top.b-hasbn>.b-bn{grid-area:bn;align-self:stretch}.b-top.b-hasbn>.b-tabs{grid-area:tabs;justify-self:start}.b-top.b-hasbn>.b-vhw{grid-area:vh}' +
    '.b-top.b-hasbn.b-nov{grid-template-columns:minmax(0,1fr);grid-template-areas:"bn" "tabs"}' +
    '@media(max-width:700px){.b-top.b-hasbn{grid-template-areas:"bn bn" "tabs vh";row-gap:12px}.b-top.b-hasbn.b-nov{grid-template-areas:"bn" "tabs"}}' +
    '.b-prev{position:absolute;right:0;top:calc(100% + 10px);z-index:6;width:min(340px,calc(100vw - 32px));overflow:hidden;border:1.5px solid #5b6bb4;border-radius:16px;background:#0b1025;box-shadow:0 18px 44px #000b;animation:bPrev .3s cubic-bezier(.2,.9,.3,1)}' +
    '@keyframes bPrev{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}' +
    '.b-prev img{display:block;width:100%;height:130px;object-fit:cover}' +
    '.b-prev .b-pb{display:flex;flex-direction:column;gap:7px;padding:14px 16px 16px}' +
    '.b-prev .b-tt{font:400 20px/1.2 "Iowan Old Style",Georgia,serif;color:#f5f7ff}' +
    '.b-prev .b-ds{font-size:13px;line-height:1.5;color:#aeb9dd}' +
    '.b-prev .b-gob{align-self:flex-start;margin-top:4px;padding:8px 16px;border:0;border-radius:999px;background:#f8d874;color:#1a1500;font:inherit;font-size:14px;font-weight:650;cursor:pointer}' +
    '.b-prev .b-gob:hover,.b-prev .b-gob:focus-visible{background:#ffe59a;outline:none}' +
    '.b-prev .b-px{position:absolute;top:8px;right:8px;z-index:1;width:28px;height:28px;padding:0;border:1px solid #5b6bb4;border-radius:50%;background:#0b1025e6;color:#b9c9ff;font:16px/1 sans-serif;cursor:pointer}' +
    '.b-prev .b-px:hover,.b-prev .b-px:focus-visible{border-color:#b9c9ff;color:#fff;outline:none}' +
    '@media(prefers-reduced-motion:reduce){.b-prev{animation:none}}' +
    '@media(max-width:700px){.b-bub{top:auto;bottom:calc(100% + 4px);right:0;width:max-content;max-width:min(210px,56vw);font-size:13px;white-space:normal;transform-origin:85% 100%}.b-bub:before,.b-bub:after{top:100%;margin:0}.b-bub:before{right:22px;border-width:10px 5.5px 0 5.5px;border-color:#5b6bb4 transparent transparent transparent}.b-bub:after{right:23.3px;margin-top:-1.8px;border-width:9.2px 4.2px 0 4.2px;border-color:#0b1025 transparent transparent transparent}}' +
    '@media(prefers-reduced-motion:reduce){.b-bub{animation:none}}' +
    /* pagina principal: columna grande a la izquierda y lateral a la derecha */
    '.b-home{display:grid;gap:18px 32px}' +
    '#b-wrap.b-wide{max-width:1240px}' +
    /* ordenador: siempre dos columnas (la lateral nunca mas estrecha de 240 px) */
    '@media(min-width:701px){.b-home{grid-template-columns:minmax(0,1.75fr) minmax(240px,1fr);align-items:start;gap:18px clamp(16px,2.5vw,32px)}}' +
    '.b-hero{position:relative;display:flex;flex-direction:column;justify-content:flex-end;width:100%;min-height:clamp(260px,38vw,420px);padding:0;overflow:hidden;text-align:left;border:1px solid #414e7a;border-radius:18px;background:radial-gradient(ellipse at 70% 20%,#2a3a7a 0%,#141c40 45%,#0b1025 100%);color:#eef1ff;font:inherit;cursor:pointer;box-shadow:0 14px 40px #0006;transition:transform .25s ease,border-color .25s ease}' +
    '.b-hero:hover,.b-hero:focus-visible{transform:translateY(-3px);border-color:#8199d8;outline:none}' +
    '.b-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}.b-hero:hover img{transform:scale(1.03)}' +
    '.b-hero .b-ic{position:absolute;right:8%;top:14%;width:clamp(90px,14vw,170px);height:auto;color:#5b6bb4;opacity:.55}' +
    '.b-hero .b-hx{position:relative;display:flex;flex-direction:column;gap:8px;padding:clamp(18px,3vw,30px);background:linear-gradient(180deg,#05060f00 0%,#05060fcc 45%,#05060ff2 100%)}' +
    '.b-hero .b-tt{font:400 clamp(26px,3.4vw,40px)/1.12 "Iowan Old Style",Georgia,serif}' +
    '.b-hero .b-ds{font-size:15px;max-width:640px;color:#d6ddf5}' +
    '.b-feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:14px}' +
    '.b-mini{display:flex;flex-direction:column;width:100%;padding:0;overflow:hidden;text-align:left;border:1px solid #343d63;border-radius:14px;background:linear-gradient(120deg,#111a35d9,#0b1025d9);color:#eef1ff;font:inherit;cursor:pointer;transition:transform .2s ease,border-color .2s ease}' +
    '.b-mini:hover,.b-mini:focus-visible{transform:translateY(-2px);border-color:#8199d8;outline:none}' +
    '.b-mini img{display:block;width:100%;height:120px;object-fit:cover}' +
    '.b-mini .b-mx{display:flex;gap:12px;align-items:flex-start;padding:14px 16px}' +
    '.b-mini .b-tt{font-size:17px}.b-mini .b-ds{font-size:12.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    /* lateral: cuenta atras y archivo */
    '.b-side{display:flex;flex-direction:column;gap:14px}' +
    '.b-count{position:relative;padding:16px 18px;border:1px solid #5b6bb4;border-radius:16px;background:linear-gradient(140deg,#1b2656ee,#0b1025ee);box-shadow:0 0 30px #5b6bb433}' +
    '.b-count h3{margin:0 0 10px!important}' +
    '.b-cd{display:block;width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.b-cd+.b-cd{margin-top:14px;padding-top:14px;border-top:1px solid #2a3360}' +
    '.b-cd .b-ct{display:block;font:400 18px/1.25 "Iowan Old Style",Georgia,serif;color:#f5f7ff}.b-cd:hover .b-ct{text-decoration:underline}' +
    '.b-cd .b-cw{display:block;margin-top:3px;font-size:12px;color:#8f98c0}' +
    '.b-dig{display:flex;gap:8px;margin-top:10px}' +
    '.b-dig span{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 4px;border-radius:10px;background:#0b1025;border:1px solid #343d63}' +
    '.b-dig b{font:400 26px/1 "Iowan Old Style",Georgia,serif;color:#f8d874}.b-dig small{margin-top:4px;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#aeb9dd}' +
    '.b-live{margin-top:10px;font-weight:650;color:#f8d874}' +
    /* cada lluvia con su recuadro y su estilo: su color, su constelacion al fondo y estrellas fugaces saliendo del radiante */
    '.b-cd.b-ll{position:relative;overflow:hidden;margin-left:-6px;margin-right:-6px;padding:10px 12px 12px;border:1px solid color-mix(in srgb,var(--acc) 38%,transparent);border-radius:13px;background:radial-gradient(ellipse at 88% 18%,color-mix(in srgb,var(--acc) 24%,transparent),transparent 62%),linear-gradient(160deg,color-mix(in srgb,var(--acc) 9%,#0b1025),#0b1025)}' +
    '.b-cd.b-ll+.b-cd{border-top:1px solid color-mix(in srgb,var(--acc) 38%,transparent)}' +
    '.b-cd.b-ll>span:not(.b-deco){position:relative;z-index:1}' +
    '.b-cd.b-ll .b-ct,.b-cd.b-ll .b-cw{padding-right:clamp(60px,30%,110px)}' +
    '.b-cd.b-ll .b-ct{color:#fff;text-shadow:0 0 18px color-mix(in srgb,var(--acc) 55%,transparent)}' +
    '.b-cd.b-ll .b-dig span{border-color:color-mix(in srgb,var(--acc) 40%,#343d63);background:#0b1025cc}' +
    '.b-cd.b-ll .b-dig b{color:var(--acc);text-shadow:0 0 14px color-mix(in srgb,var(--acc) 45%,transparent)}' +
    '.b-cd.b-ll .b-live{color:var(--acc)}' +
    '.b-deco{position:absolute;top:2px;right:2px;width:min(120px,34%);aspect-ratio:4/3;color:var(--acc);pointer-events:none;z-index:0}' +
    '.b-deco svg{display:block;width:100%;height:100%;overflow:visible}' +
    '.b-mt{position:absolute;left:var(--rx);top:var(--ry);width:48px;height:1.6px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--acc) 70%,#fff);transform-origin:0 50%;opacity:0;animation:bMt 3.6s linear infinite}' +
    '.b-mt:nth-child(2){--a:150deg;animation-delay:.2s}.b-mt:nth-child(3){--a:118deg;animation-delay:1.4s}.b-mt:nth-child(4){--a:178deg;animation-delay:2.5s}' +
    '@keyframes bMt{0%{opacity:0;transform:rotate(var(--a)) translateX(6px) scaleX(.2)}6%{opacity:1}26%{opacity:0;transform:rotate(var(--a)) translateX(78px) scaleX(1)}100%{opacity:0;transform:rotate(var(--a)) translateX(78px)}}' +
    '@media(prefers-reduced-motion:reduce){.b-mt{display:none}}' +
    /* cada lluvia con su estilo: su color, su constelacion al fondo y estrellas fugaces saliendo del radiante */
    '.b-arch h3{margin:4px 0 8px!important}' +
    '.b-row{display:flex;gap:12px;align-items:center;width:100%;padding:10px 10px;border:0;border-bottom:1px solid #1d2448;background:none;color:#eef1ff;font:inherit;text-align:left;cursor:pointer;border-radius:8px}' +
    '.b-row:hover,.b-row:focus-visible{background:#141b3a;outline:none}' +
    '.b-row .b-date{width:44px;height:48px}.b-row .b-date b{font-size:19px}.b-row .b-date small{font-size:9.5px}' +
    '.b-row .b-thumb{width:48px;height:48px}' +
    '.b-row .b-tt{font-size:15.5px}' +
    /* viajes y curiosidades: tarjetas con foto */
    '.b-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}' +
    '.b-grid .b-mini img{height:170px}' +
    '.b-body figure{margin:6px 0 18px}.b-body figure img{display:block;width:100%;max-height:70vh;object-fit:contain;border-radius:12px;border:1px solid #343d63;background:#05060f}' +
    '.b-body figcaption{margin-top:6px;font-size:13px;color:#8f98c0;text-align:center}' +
    '@media(max-width:700px){#b-main{top:62px;padding:48px 16px 32px}.b-card{padding:13px 14px;gap:12px}.b-date{width:50px;height:56px}.b-date b{font-size:22px}.b-thumb{width:54px;height:54px}.b-tt{font-size:17px}}' +
    '@media(prefers-reduced-motion:reduce){#log-view.play .b-in{animation:none}.b-card{transition:none}}'

  var data = null, loading = null, view = null, main = null, pastAll = false, openId = null
  /* las lluvias de estrellas se calculan solas (lluvias.js); si hay una nota de esa lluvia y ese ano, la nota manda */
  function merge(j) {
    var notes = (j && j.items) || [], auto = window.vcLluvias ? window.vcLluvias.items() : [], byId = {}, out = []
    notes.forEach(function (n) { byId[n.id] = n })
    auto.forEach(function (a) {
      var n = byId[a.id]
      if (n && n.tipo !== 'evento') { var nn = {}; for (var q in n) nn[q] = n[q]; nn.id = n.id + '-noticia'; delete byId[a.id]; out.push(nn); n = null }
      if (!n) { out.push(a); return }
      var m = {}; for (var k in a) m[k] = a[k]
      for (var k2 in n) { var v = n[k2]; if (v != null && v !== '' && !(Array.isArray(v) && !v.length)) m[k2] = v }
      m.auto = false; out.push(m); delete byId[a.id]
    })
    notes.forEach(function (n) { if (byId[n.id] && (n.tipo !== 'evento' || n.inicio)) out.push(n) })
    return { v: (j && j.v) || 1, items: out, temporadas: (j && j.temporadas) || {} }
  }
  function load() {
    if (data) return Promise.resolve(data)
    /* si bitacora.json no carga, al menos salen las lluvias calculadas */
    if (!loading) loading = fetch(SRC).then(function (r) { if (!r.ok) throw 0; return r.json() }).catch(function () { return { items: [] } }).then(function (j) { data = merge(j); RESTS = R ? R.entryRests(data.items) : {}; return data })
    return loading
  }
  function evState(it, now) {
    var a = Date.parse(it.inicio), b = Date.parse(it.fin || it.inicio)
    if (now >= b) return { past: true }
    if (now >= a) return { chip: u('now'), live: true }
    var d0 = new Date(now); d0.setHours(0, 0, 0, 0)
    var d1 = new Date(a); d1.setHours(0, 0, 0, 0)
    var days = Math.round((d1 - d0) / 864e5)
    if (days === 0) return { chip: new Date(a).getHours() >= 17 ? u('tonight') : u('today') }
    if (days === 1) return { chip: u('tomorrow') }
    return { chip: u('inDays', days), soft: days > 7 }
  }
  function fmtDay(iso, o) { return new Intl.DateTimeFormat(LOC[lang()], o).format(new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso)) }
  function when(it) {
    if (it.tipo !== 'evento') return fmtDay(it.fecha, { day: 'numeric', month: 'long', year: 'numeric' })
    var a = new Date(it.inicio), b = new Date(it.fin || it.inicio)
    var hm = { hour: '2-digit', minute: '2-digit' }
    var same = a.toDateString() === b.toDateString()
    var da = fmtDay(it.inicio, { weekday: 'long', day: 'numeric', month: 'long' })
    if (same) return da + ', ' + fmtDay(it.inicio, hm) + '–' + fmtDay(it.fin, hm)
    return u('from').replace('{a}', da + ', ' + fmtDay(it.inicio, hm)).replace('{b}', fmtDay(it.fin, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + fmtDay(it.fin, hm))
  }
  var tab = 'home'
  /* modo de Vero: off (no sale), on (discreta) o full (completa); sin decidir cuenta como discreta */
  function vmode() { var m = null; try { m = localStorage.getItem('vc-vero') } catch (e) { } return m === 'off' || m === 'full' ? m : 'on' }
  /* lo que dice Vero en el bocadillo: depende del proximo evento (fechas de inicio y fin de su nota) */
  function bubEvent() {
    var now = Date.now(), its = (data && data.items) || []
    var e = its.filter(function (i) { return i.tipo === 'evento' && Date.parse(i.fin || i.inicio) > now }).sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })[0]
    if (!e) return null
    var d0 = new Date(now); d0.setHours(0, 0, 0, 0); var d1 = new Date(Date.parse(e.inicio)); d1.setHours(0, 0, 0, 0)
    return now >= Date.parse(e.inicio) || Math.round((d1 - d0) / 864e5) <= 7 ? e : null
  }
  /* el bocadillo se puede pulsar cuando habla de un evento: abre una previsualizacion con un boton para ir */
  /* el bocadillo se ajusta al texto: se mide la linea mas larga y ese es su ancho (sin huecos a la derecha) */
  function fitBub(bb) {
    if (!bb || !bb.isConnected || !bb.firstChild) return
    bb.style.width = ''
    var r = document.createRange(); r.selectNodeContents(bb)
    var rs = r.getClientRects(); if (!rs.length) return
    var sc = bb.offsetWidth ? bb.getBoundingClientRect().width / bb.offsetWidth : 1; if (!sc) sc = 1
    var lines = {}, wmax = 0
    ;[].forEach.call(rs, function (q) { var k = Math.round(q.top / sc); lines[k] = Math.max(lines[k] || 0, q.right / sc) - 0; lines[k + 'l'] = Math.min(lines[k + 'l'] == null ? 1e9 : lines[k + 'l'], q.left / sc) })
    Object.keys(lines).forEach(function (k) { if (k.slice(-1) !== 'l') wmax = Math.max(wmax, lines[k] - lines[k + 'l']) })
    var cs = getComputedStyle(bb), extra = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)
    if (wmax) bb.style.width = Math.ceil(wmax + extra + 1) + 'px'
    var vw = bb.parentNode, bar = bb.closest('.b-top')
    if (bar && bar.classList.contains('b-hasbn') && window.innerWidth > 700) { var pad = bb.offsetWidth + 22; vw.style.paddingLeft = pad + 'px'; bb.style.right = 'calc(100% - ' + pad + 'px + 12px)' }
    else if (vw) { vw.style.paddingLeft = ''; bb.style.right = '' }
  }
  function bubSync(bb) {
    var e = bubEvent(), t = bubText()
    if (bb.textContent !== t) { bb.textContent = t; requestAnimationFrame(function () { fitBub(bb) }) }
    bb.classList.toggle('b-go', !!e); bb.dataset.ev = e ? e.id : ''
    if (e) { bb.setAttribute('role', 'button'); bb.tabIndex = 0; bb.setAttribute('aria-label', t + ' · ' + u('seeEv')) }
    else { bb.setAttribute('role', 'note'); bb.removeAttribute('tabindex'); bb.removeAttribute('aria-label'); closePrev() }
  }
  function closePrev() { var pv = main && main.querySelector('.b-prev'); if (pv) pv.remove() }
  function openPrev(bb) {
    var it = it0(bb.dataset.ev); if (!it) return
    var bar = bb.closest('.b-top'); if (!bar) return
    if (bar.querySelector('.b-prev')) { closePrev(); return }
    var pv = document.createElement('div'); pv.className = 'b-prev'; pv.setAttribute('role', 'dialog'); pv.setAttribute('aria-label', tx(it.t))
    var im = pic(it), st = evState(it, Date.now())
    pv.innerHTML = (im ? '<img alt="" src="' + esc(im) + '" decoding="async">' : '') + '<button type="button" class="b-px"></button>' +
      '<div class="b-pb"><span class="b-meta"><span class="b-chip b-soft">' + esc(kind(it)) + '</span>' + (st.past ? '' : '<span class="b-chip">' + esc(st.chip) + '</span>') + '</span>' +
      '<span class="b-tt"></span><span class="b-meta"></span><span class="b-ds"></span><button type="button" class="b-gob"></button></div>'
    pv.querySelector('.b-tt').textContent = tx(it.t)
    pv.querySelectorAll('.b-meta')[1].textContent = when(it)
    pv.querySelector('.b-ds').textContent = tx(it.d)
    var px = pv.querySelector('.b-px'); px.textContent = '×'; px.setAttribute('aria-label', u('close')); px.onclick = function (ev) { ev.stopPropagation(); closePrev(); bb.focus() }
    var go = pv.querySelector('.b-gob'); go.textContent = u('goEntry') + ' →'; go.onclick = function () { closePrev(); open(it.id, true) }
    bar.append(pv)
    try { go.focus({ preventScroll: true }) } catch (e) { }
  }
  function headFor(e) {
    var now = Date.now(), a = Date.parse(e.inicio), t = tx(e.t)
    if (now >= a) return u('bLive')
    var d0 = new Date(now); d0.setHours(0, 0, 0, 0); var d1 = new Date(a); d1.setHours(0, 0, 0, 0)
    var days = Math.round((d1 - d0) / 864e5)
    if (days === 0) return (new Date(a).getHours() >= 17 ? u('bTonight') : u('bToday')).replace('{t}', t)
    if (days === 1) return u('bTomorrow').replace('{t}', t)
    return u('bDays').replace('{n}', days).replace('{t}', t)
  }
  function bubText() {
    var now = Date.now(), its = (data && data.items) || []
    var e = its.filter(function (i) { return i.tipo === 'evento' && Date.parse(i.fin || i.inicio) > now }).sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })[0]
    if (!e) return u('hmm')
    var a = Date.parse(e.inicio), t = tx(e.t)
    if (now >= a) return u('bLive')
    var d0 = new Date(now); d0.setHours(0, 0, 0, 0); var d1 = new Date(a); d1.setHours(0, 0, 0, 0)
    var days = Math.round((d1 - d0) / 864e5)
    if (days === 0) return (new Date(a).getHours() >= 17 ? u('bTonight') : u('bToday')).replace('{t}', t)
    if (days === 1) return u('bTomorrow').replace('{t}', t)
    if (days <= 7) return u('bDays').replace('{n}', days).replace('{t}', t)
    return u('hmm')
  }
  function vimg(cls, src) { var i = document.createElement('img'); i.className = cls; i.alt = ''; i.src = 'vero/' + src; i.decoding = 'async'; return i }
  try { tab = sessionStorage.getItem('vc-b-tab') || 'home' } catch (e) { }
  var archAll = false
  /* nombre del tipo de entrada */
  function kind(it) { return it.tipo === 'evento' ? u('ev') : it.tipo === 'cronica' ? (it.sub === 'viaje' ? u('vj') : it.sub === 'curiosidad' ? u('cu') : u('cr')) : u('nw') }
  /* primera foto de la entrada (la de portada o la primera del texto) */
  function pic(it) { if (it.img) return it.img; var f = (it.p || []).filter(function (x) { return x && x.img })[0]; return f ? f.img : null }
  function dateBox(it) {
    var iso = it.tipo === 'evento' ? it.inicio : it.fecha
    return '<span class="b-date" aria-hidden="true"><b>' + new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso).getDate() + '</b><small>' + esc(fmtDay(iso, { month: 'short' }).replace('.', '')) + '</small></span>'
  }
  function metaHtml(it, now) {
    var m = '<span class="b-chip b-soft">' + esc(kind(it)) + '</span>'
    if (it.tipo === 'evento') { var st = evState(it, now); if (!st.past) m += '<span class="b-chip' + (st.soft ? ' b-soft' : '') + '">' + esc(st.chip) + '</span>' }
    return m + '<span>' + esc(when(it)) + '</span>'
  }
  function anim(el, d) { el.classList.add('b-in'); el.style.setProperty('--d', d + 's'); return el }
  function go(el, it) { el.addEventListener('click', function () { open(it.id, true) }); return el }
  function txts(el, it) { var t = el.querySelector('.b-tt'), d = el.querySelector('.b-ds'); if (t) t.textContent = tx(it.t); if (d) d.textContent = tx(it.d); return el }
  /* tarjeta normal (listas de eventos) */
  function card(it, now, d, cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'b-card' + (cls ? ' ' + cls : '')
    var im = pic(it)
    b.innerHTML = (it.tipo !== 'evento' && im ? '<img class="b-thumb" alt="" src="' + esc(im) + '" loading="lazy" decoding="async">' : dateBox(it)) +
      '<span class="b-tx"><span class="b-meta">' + metaHtml(it, now) + '</span><span class="b-tt"></span><span class="b-ds"></span></span>'
    return anim(go(txts(b, it), it), d)
  }
  /* la grande de la pagina principal */
  function hero(it, now) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'b-hero'
    var im = pic(it)
    b.innerHTML = (im ? '<img alt="" src="' + esc(im) + '" decoding="async">' : '<svg class="b-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><ellipse cx="12" cy="12" rx="9.5" ry="2.6" transform="rotate(-18 12 12)"/><path d="m4 4.5.5 1.2 1.2.5-1.2.5L4 7.9l-.5-1.2-1.2-.5 1.2-.5zM19.5 17l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z"/></svg>') +
      '<span class="b-hx"><span class="b-meta">' + metaHtml(it, now) + '</span><span class="b-tt"></span><span class="b-ds"></span></span>'
    return anim(go(txts(b, it), it), .45)
  }
  /* las dos pequenas de debajo y las de "Viajes y curiosidades" */
  function mini(it, now, d) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'b-mini'
    var im = pic(it)
    b.innerHTML = (im ? '<img alt="" src="' + esc(im) + '" loading="lazy" decoding="async">' : '') +
      '<span class="b-mx">' + (im ? '' : dateBox(it)) + '<span class="b-tx"><span class="b-meta">' + metaHtml(it, now) + '</span><span class="b-tt"></span><span class="b-ds"></span></span></span>'
    return anim(go(txts(b, it), it), d)
  }
  /* fila compacta del archivo */
  function row(it, d) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'b-row'
    var im = pic(it)
    b.innerHTML = (im ? '<img class="b-thumb" alt="" src="' + esc(im) + '" loading="lazy" decoding="async">' : dateBox(it)) +
      '<span class="b-tx"><span class="b-meta"><span>' + esc(kind(it)) + '</span><span>' + esc(when(it)) + '</span></span><span class="b-tt"></span></span>'
    return anim(go(txts(b, it), it), d)
  }
  function h3(t, d) { var h = document.createElement('h3'); h.textContent = t; return anim(h, d) }
  function empty(t, d) {
    var e = document.createElement('p'); e.className = 'b-empty'
    if (vmode() !== 'off') { e.classList.add('b-ev'); e.append(vimg('', 'g-piensa.webp')); var s1 = document.createElement('span'); s1.textContent = t; e.append(s1) } else e.textContent = t
    return anim(e, d)
  }
  /* cuenta atras: dias, horas y minutos; se actualiza sola (tick) */
  function countdown(evs) {
    var box = document.createElement('div'); box.className = 'b-count'
    if (vmode() !== 'off') { box.classList.add('b-hasv'); box.style.position = 'relative'; box.append(vimg('b-vt', 'g-telescopio.webp')) }
    box.append(h3(u('cd'), .5))
    evs.forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'b-cd'; b.dataset.cd = it.id
      b.innerHTML = '<span class="b-ct"></span><span class="b-cw"></span><span class="b-dig"></span>'
      b.querySelector('.b-ct').textContent = tx(it.t); b.querySelector('.b-cw').textContent = when(it)
      /* si es una lluvia de estrellas, va en su recuadro con su estilo */
      var stl = it.lluvia && window.vcLluvias && window.vcLluvias.style ? window.vcLluvias.style(it.lluvia) : null
      if (stl) {
        b.classList.add('b-ll'); b.style.setProperty('--acc', stl.color)
        var dc = document.createElement('span'); dc.className = 'b-deco'; dc.setAttribute('aria-hidden', 'true'); dc.style.setProperty('--rx', stl.rx + '%'); dc.style.setProperty('--ry', stl.ry + '%')
        dc.innerHTML = stl.svg + '<i class="b-mt" style="--a:135deg"></i><i class="b-mt"></i><i class="b-mt"></i><i class="b-mt"></i>'
        b.insertBefore(dc, b.firstChild)
      }
      box.append(anim(go(b, it), .55 + i * .08))
    })
    tick(box)
    return anim(box, .5)
  }
  function tick(root) {
    if (!data) return
    var bb = (main || document).querySelector('.b-bub'); if (bb) bubSync(bb)
    ;[].forEach.call((root || main || document).querySelectorAll('.b-cd'), function (b) {
      var it = it0(b.dataset.cd); if (!it) return
      var now = Date.now(), a = Date.parse(it.inicio), z = Date.parse(it.fin || it.inicio), dg = b.querySelector('.b-dig')
      if (now >= z) { b.remove(); return }
      if (now >= a) { dg.className = 'b-live'; dg.textContent = u('cdNow'); return }
      var t = Math.max(0, a - now), dd = Math.floor(t / 864e5), hh = Math.floor(t % 864e5 / 36e5), mm = Math.floor(t % 36e5 / 6e4)
      dg.className = 'b-dig'
      dg.innerHTML = '<span><b>' + dd + '</b><small>' + esc(dd === 1 ? u('d1') : u('dd')) + '</small></span><span><b>' + String(hh).padStart(2, '0') + '</b><small>' + esc(hh === 1 ? u('h1') : u('hh')) + '</small></span><span><b>' + String(mm).padStart(2, '0') + '</b><small>' + esc(u('mm')) + '</small></span>'
    })
  }
  function tabs() {
    var nav = document.createElement('div'); nav.className = 'b-tabs'; nav.setAttribute('role', 'tablist'); nav.setAttribute('aria-label', u('tabs'))
    var ind = document.createElement('span'); ind.className = 'b-ind b-now'; ind.setAttribute('aria-hidden', 'true'); nav.append(ind)
    ;[['home', u('tHome')], ['events', u('tEv')], ['trips', u('tTrips')]].forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'b-tab'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(tab === t[0])); b.textContent = t[1]
      b.dataset.tab = t[0]
      b.addEventListener('click', function () { switchTab(t[0]) })
      nav.append(b)
    })
    return anim(nav, .25)
  }
  var ORDER = ['home', 'events', 'trips']
  var MIN_NEWS = 3   /* noticias o cronicas necesarias para mostrar "Otras noticias" en la pagina principal */
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) { return false } }
  /* coloca el fondo amarillo detras de la pestana elegida (con "now", sin deslizarse) */
  function moveInd(root, now) {
    var nav = (root || main) && (root || main).querySelector('.b-tabs'); if (!nav) return
    var ind = nav.querySelector('.b-ind'), sel = nav.querySelector('.b-tab[aria-selected="true"]'); if (!ind || !sel) return
    if (now) ind.classList.add('b-now')
    ind.style.left = sel.offsetLeft + 'px'; ind.style.top = sel.offsetTop + 'px'; ind.style.width = sel.offsetWidth + 'px'; ind.style.height = sel.offsetHeight + 'px'
    nav.classList.add('b-hasind')
    if (now) { void ind.offsetWidth; ind.classList.remove('b-now') }
  }
  /* cambio de pestana: el indicador se desliza y el contenido sale hacia un lado y entra por el otro */
  function switchTab(nt) {
    if (tab === nt) return
    var dir = ORDER.indexOf(nt) > ORDER.indexOf(tab) ? 1 : -1
    tab = nt; try { sessionStorage.setItem('vc-b-tab', tab) } catch (e) { }
    closePrev()
    var w = main && main.querySelector('#b-wrap'), old = w && w.querySelector('.b-pane')
    if (!w || !old || reduced()) { draw(true); play(); setTimeout(function () { moveInd(main, true) }, 0); return }
    ;[].forEach.call(w.querySelectorAll('.b-tab'), function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === nt)) })
    moveInd(w)
    var vh = w.querySelector('.b-vhw'); if (vh) vh.classList.toggle('b-off', vmode() === 'full' && nt === 'trips')
    var fresh = renderList(false).querySelector('.b-pane'); fresh.classList.add('b-noanim')
    old.style.transition = 'opacity .18s ease,transform .22s ease'; old.style.opacity = '0'; old.style.transform = 'translateX(' + (-dir * 28) + 'px)'
    setTimeout(function () {
      if (!old.parentNode) return
      fresh.style.opacity = '0'; fresh.style.transform = 'translateX(' + (dir * 28) + 'px)'
      old.replaceWith(fresh); void fresh.offsetWidth
      /* el contenido nuevo puede cambiar el ancho (barra de desplazamiento) y recolocar las pestanas */
      moveInd(w)
      fresh.style.transition = 'opacity .3s ease,transform .36s cubic-bezier(.2,.8,.2,1)'; fresh.style.opacity = '1'; fresh.style.transform = 'none'
      setTimeout(function () { fresh.style.transition = ''; fresh.style.transform = ''; moveInd(w) }, 420)
    }, 190)
  }
  function renderList(first) {
    var now = Date.now(), its = (data && data.items) || []
    var pub = its.filter(function (i) { return Date.parse(i.fecha + 'T00:00:00') <= now + 864e5 }).sort(function (a, b) { return b.fecha.localeCompare(a.fecha) || (Date.parse(b.inicio || 0) - Date.parse(a.inicio || 0)) })
    var up = its.filter(function (i) { return i.tipo === 'evento' && Date.parse(i.fin || i.inicio) > now }).sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })
    var w = document.createElement('div'); w.id = 'b-wrap'; w.className = 'b-wide'
    var vm = vmode()
    /* en "Viajes y curiosidades" (completa) ya sale Vero de viaje: no se repite la del periodico */
    var bar = document.createElement('div'); bar.className = 'b-top'; w.append(bar)
    if (window.vcTemporadas) {
      try {
        var bn = window.vcTemporadas.banner({
          items: its, lang: lang(), imgs: (data && data.temporadas) || {}, tx: tx, when: when, head: headFor,
          chip: function (it) { var st = evState(it, Date.now()); return st.past ? '' : st.chip },
          go: function (id) { open(id, true) }
        })
        bar.append(anim(bn, .2)); bar.classList.add('b-hasbn'); if (vm === 'off') bar.classList.add('b-nov')
      } catch (e) { }
    }
    bar.append(tabs())
    if (vm !== 'off') {
      var vh = document.createElement('span'); vh.className = 'b-vhw'; vh.append(vimg('b-vh m-' + vm, 'm-periodico.webp'))
      if (vm === 'full') { var bub = document.createElement('span'); bub.className = 'b-bub'; bub.setAttribute('role', 'note'); vh.append(bub); bubSync(bub)
        bub.addEventListener('click', function (ev) { if (bub.dataset.ev) { ev.stopPropagation(); openPrev(bub) } })
        bub.addEventListener('keydown', function (ev) { if (bub.dataset.ev && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); openPrev(bub) } }) }
      if (vm === 'full' && tab === 'trips') vh.classList.add('b-off')
      bar.append(anim(vh, .3))
    }
    var pane = document.createElement('div'); pane.className = 'b-pane'; w.append(pane)
    if (tab === 'events') {
      var past = its.filter(function (i) { return i.tipo === 'evento' && Date.parse(i.fin || i.inicio) <= now }).sort(function (a, b) { return Date.parse(b.inicio) - Date.parse(a.inicio) })
      var c = document.createElement('div'); c.className = 'b-cols'
      var c1 = document.createElement('div'), c2 = document.createElement('div'); c.append(c1, c2); pane.append(c)
      c1.append(h3(u('up'), .35)); var l1 = document.createElement('div'); l1.className = 'b-list'; c1.append(l1)
      if (!up.length) l1.append(empty(u('noUp'), .45)); up.forEach(function (it, i) { l1.append(card(it, now, .45 + i * .06, i === 0 ? 'b-next' : '')) })
      c2.append(h3(u('past'), .4)); var l2 = document.createElement('div'); l2.className = 'b-list b-past'; c2.append(l2)
      if (!past.length) l2.append(empty(u('noPast'), .5))
      var lim = pastAll ? past.length : 6
      past.slice(0, lim).forEach(function (it, i) { l2.append(card(it, now, .5 + i * .05)) })
      if (past.length > lim) { var m = document.createElement('button'); m.type = 'button'; m.className = 'b-more'; m.textContent = u('more'); m.onclick = function () { pastAll = true; draw(false) }; c2.append(m) }
      return w
    }
    if (tab === 'trips') {
      var tr = pub.filter(function (i) { return i.tipo === 'cronica' })
      if (!tr.length) {
        if (vm === 'full') { var tw0 = document.createElement('div'); tw0.className = 'b-trips'; var e0 = empty(u('noTrips'), .35); e0.style.flex = '1'; tw0.append(e0, anim(vimg('b-tv', 'g-viaje.webp'), .5)); pane.append(tw0) } else pane.append(empty(u('noTrips'), .35))
        return w
      }
      var g = document.createElement('div'); g.className = 'b-grid'
      if (vm === 'full') { var tw = document.createElement('div'); tw.className = 'b-trips'; tw.append(g, anim(vimg('b-tv', 'g-viaje.webp'), .5)); pane.append(tw) } else pane.append(g)
      tr.forEach(function (it, i) { g.append(mini(it, now, .35 + i * .06)) })
      return w
    }
    /* pagina principal */
    if (!pub.length) { pane.append(empty(u('noHome'), .35)); return w }
    var top = pub[0]
    var feat = up.filter(function (i) { return i !== top }).slice(0, 2)
    pub.forEach(function (i) { if (feat.length < 2 && i !== top && feat.indexOf(i) < 0) feat.push(i) })
    var rest = pub.filter(function (i) { return i !== top && feat.indexOf(i) < 0 })
    var home = document.createElement('div'); home.className = 'b-home'; pane.append(home)
    var left = document.createElement('div'), side = document.createElement('div'); side.className = 'b-side'; home.append(left, side)
    left.append(hero(top, now))
    if (feat.length) { var f = document.createElement('div'); f.className = 'b-feat'; left.append(f); feat.forEach(function (it, i) { f.append(mini(it, now, .6 + i * .08)) }) }
    /* la cuenta atras solo aparece si hay algun evento por llegar */
    if (up.length) side.append(countdown(up.slice(0, 2)))
    /* "Otras noticias" sale solo cuando hay al menos MIN_NEWS noticias o cronicas escritas (las lluvias automaticas no cuentan) */
    var written = pub.filter(function (i) { return i.tipo !== 'evento' }).length
    if (written >= MIN_NEWS) {
      var ar = document.createElement('div'); ar.className = 'b-arch'; side.append(ar)
      ar.append(h3(u('arch'), .6))
      if (!rest.length) ar.append(empty(u('noArch'), .65))
      var lim2 = archAll ? rest.length : 8
      rest.slice(0, lim2).forEach(function (it, i) { ar.append(row(it, .65 + i * .04)) })
      if (rest.length > lim2) { var mm = document.createElement('button'); mm.type = 'button'; mm.className = 'b-more'; mm.textContent = u('moreA'); mm.onclick = function () { archAll = true; draw(false) }; ar.append(mm) }
    }
    return w
  }
  /* relacionadas: otras entradas ya publicadas y las lluvias de estrellas (tambien las automaticas).
     Primero las de la misma lluvia y tipo; luego los proximos eventos (el mas cercano antes) y despues lo mas reciente */
  function related(it) {
    var now = Date.now()
    return ((data && data.items) || []).filter(function (x) {
      return x.id !== it.id && (x.auto || Date.parse(x.fecha + 'T00:00:00') <= now + 864e5)
    }).map(function (x) {
      var fin = Date.parse(x.fin || x.inicio || 0), ini = Date.parse(x.inicio || 0)
      var fut = x.tipo === 'evento' && fin > now
      return { x: x, s: (it.lluvia && x.lluvia === it.lluvia ? 4 : 0) + (x.tipo === it.tipo ? 2 : 0) + (fut ? 1 : 0), k: fut ? -ini : Date.parse(x.fecha + 'T00:00:00') - 1e13 }
    }).sort(function (a, b) { return b.s - a.s || b.k - a.k }).slice(0, 4).map(function (r) { return r.x })
  }
  function renderArt(it) {
    var a = renderArt0(it), rel = related(it)
    if (!rel.length) return a /* por ahora, sin otras entradas, no sale */
    var w = document.createElement('div'); w.className = 'b-artw'
    var side = document.createElement('aside'); side.className = 'b-rel'
    if (vmode() === 'full') { var rh = anim(document.createElement('div'), .5); rh.className += ' b-relh'; var hh = document.createElement('h3'); hh.textContent = u('rel'); rh.append(vimg('', 'm-periodico.webp'), hh); side.append(rh) }
    else side.append(h3(u('rel'), .5))
    var now = Date.now(); rel.forEach(function (x, k) { side.append(mini(x, now, .55 + k * .06)) })
    w.append(a, side); return w
  }
  function renderArt0(it) {
    var a = document.createElement('article'); a.className = 'b-art'
    var st = it.tipo === 'evento' ? evState(it, Date.now()) : null
    a.innerHTML = '<button type="button" class="b-back b-in"><span aria-hidden="true">←</span><span></span></button>' +
      '<div class="b-meta b-in" style="--d:.08s"></div><h2 class="b-in" style="--d:.12s"></h2><p class="b-when b-in" style="--d:.2s"></p>' +
      (it.img ? '<figure class="b-in" style="--d:.28s"><img alt="" src="' + esc(it.img) + '" decoding="async"><figcaption></figcaption></figure>' : '') +
      '<p class="b-sum b-in" style="--d:.34s"></p><div class="b-body b-in" style="--d:.42s"></div>' +
      (it.fuente ? '<p class="b-src b-in" style="--d:.5s"><span></span>: <a target="_blank" rel="noopener noreferrer"></a></p>' : '')
    a.querySelector('.b-back span:last-child').textContent = u('back')
    a.querySelector('.b-back').onclick = function () { close(true) }
    var meta = '<span class="b-chip b-soft">' + esc(kind(it)) + '</span>'
    if (st && !st.past) meta += '<span class="b-chip">' + esc(st.chip) + '</span>'
    else if (st && st.past) meta += '<span>' + esc(u('ended')) + '</span>'
    a.querySelector('.b-meta').innerHTML = meta
    a.querySelector('h2').textContent = tx(it.t)
    a.querySelector('.b-when').textContent = when(it) + (it.hora ? ' · ' + tx(it.hora) : '')
    if (it.img) { var fc = a.querySelector('figcaption'); if (it.credito) fc.textContent = tx(it.credito); else fc.remove() }
    var sum = a.querySelector('.b-sum'); if (it.d) sum.textContent = tx(it.d); else sum.remove()
    a.querySelector('.b-body').innerHTML = (it.p || []).map(function (p) { return p && p.h ? '<h3 class="b-h">' + esc(tx(p)) + '</h3>' : p && p.img ? '<figure><img alt="" src="' + esc(p.img) + '" loading="lazy" decoding="async">' + (p.cap ? '<figcaption>' + esc(tx(p.cap)) + '</figcaption>' : '') + '</figure>' : md(tx(p)) }).join('')
    if (vmode() === 'full') {
      /* Vero se asoma por encima de la foto, apunta a la entradilla y, en los eventos, mira por el telescopio junto a la fecha */
      var fg = a.querySelector('figure'); if (fg) { fg.classList.add('b-hv'); fg.prepend(vimg('b-vas', 'p-asoma.webp')) }
      if (it.d) { sum.classList.add('b-hv'); sum.append(vimg('b-vsn', 'p-senala.webp')) }
      if (it.tipo === 'evento') { var wh = a.querySelector('.b-when'), wt = document.createElement('span'); wt.textContent = wh.textContent; wh.replaceChildren(vimg('b-vtl', 'p-telescopio.webp'), wt); wh.classList.add('b-hv') }
      var by = document.createElement('div'); by.className = 'b-bye b-in'; by.style.setProperty('--d', '.6s')
      by.append(vimg('', 'saluda.webp')); var bt = document.createElement('div'); bt.innerHTML = '<b></b><span></span>'
      bt.querySelector('b').textContent = u('bye'); bt.querySelector('span').textContent = u('byeS'); by.append(bt); a.append(by)
    }
    if (it.fuente) {
      var s = a.querySelector('.b-src'); s.querySelector('span').textContent = u([].concat(it.fuente).length > 1 ? 'sources' : 'source')
      /* una o varias fuentes, separadas por comas */
      var l0 = s.querySelector('a'); [].concat(it.fuente).forEach(function (f, k) {
        var l = k ? l0.cloneNode() : l0; l.href = f; try { l.textContent = new URL(f).hostname.replace(/^www\./, '') } catch (e) { l.textContent = f }
        if (k) s.append(', ', l)
      })
    }
    return a
  }
  /* la foto de la entrada, apaisada: tan alta como quepa sin que la entradilla se salga de la pantalla */
  function fitArtImg() {
    var a = main && main.querySelector('.b-art'), im = a && a.querySelector('figure > img:not(.b-vas)')
    /* que se vean la entradilla y el primer parrafo del texto */
    var sm = a && (a.querySelector('.b-body > p') || a.querySelector('.b-sum'))
    if (!im || !sm) return
    var w = im.clientWidth || a.clientWidth, h0 = im.offsetHeight
    /* con offsetTop (no le afectan las animaciones de entrada); .b-art es relative y su padre (#b-main) absolute */
    var y = sm.offsetHeight; for (var e = sm; e && e !== a; e = e.offsetParent) y += e.offsetTop
    var rest = a.offsetTop + y - h0 + 12 /* todo lo que hay hasta el final de la entradilla, menos la foto */
    var h = Math.round(Math.max(120, Math.min(main.clientHeight - rest, w * 0.56, 620)))
    im.style.height = h + 'px'
  }
  function play() { if (!view) return; view.classList.remove('play'); void view.offsetWidth; view.classList.add('play') }
  function draw(first) {
    if (!main) return
    var it = openId && data && data.items.filter(function (x) { return x.id === openId })[0]
    if (openId && data && !it) openId = null
    main.replaceChildren(it ? renderArt(it) : renderList(first))
    if (it) fitArtImg()
    if (!it) requestAnimationFrame(function () { moveInd(main, true); fitBub(main.querySelector('.b-bub')) })
  }
  function setHash(id, push) {
    var t = T0(); if (t === window) return
    try {
      if (!inLog()) return
      setAlts(id)
      var url = entryPath(id)
      if (R.clean(t.location.pathname) === R.clean(url) && !t.location.hash) return
      /* bl: se abrio desde la lista, asi que "volver" puede usar el boton atras */
      t.history[push ? 'pushState' : 'replaceState']({ vc: 1, bl: push && view && view.dataset.fromList === '1' ? 1 : 0 }, '', url)
      setTitle()
    } catch (e) { }
  }
  /* enlaces a las versiones en otros idiomas de lo que se ve (la lista o la entrada abierta) */
  function setAlts(id) { try { R.setAlts(T0().document, R.alts('log', id && RESTS[id] ? RESTS[id] : null)) } catch (e) { } }
  /* titulo de la pestana: el de la entrada abierta, si la hay */
  function setTitle() {
    var t = T0(); if (t === window) return
    try { if (!inLog()) return; var nm = it0(openId); t.document.title = (nm ? tx(nm.t) + ' · ' : '') + u('name') + ' · Vero Cosmos' } catch (e) { }
  }
  function it0(id) { return id && data ? data.items.filter(function (x) { return x.id === id })[0] : null }
  function open(id, push) { openId = id; draw(true); play(); main.scrollTop = 0; setHash(id, push) }
  function close(push) {
    /* si se llego a la entrada desde la lista, "volver" usa el historial; si se entro directo, se cambia la direccion */
    var t = T0()
    var hs = null; try { hs = t.history.state } catch (e) { }
    if (push && t !== window && hs && hs.bl) { try { t.history.back(); return } catch (e) { } }
    openId = null; draw(false); play(); main.scrollTop = 0; setHash(null, false)
  }
  /* la entrada de la direccion: /en/sky-log/leonids-2026 -> leonidas-2026. La direccion antigua (#leonidas-2026) tambien vale */
  var legacy = false
  function hashId() {
    legacy = false
    try {
      var r = R.parse(T0().location.pathname)
      if (r.key === 'log' && r.rest) for (var id in RESTS) if (RESTS[id][r.lang] === r.rest || RESTS[id].es === r.rest) return id
      var h = decodeURIComponent((T0().location.hash || '').slice(1)); if (h && it0(h)) { legacy = true; return h }
    } catch (e) { }
    return null
  }

  function mount(v) {
    if (view) return
    view = v
    view.setAttribute('data-no-i18n', '')
    /* el mismo cielo vivo de la portada, de fondo */
    if (typeof window.vcSky === 'function') { var sk = document.createElement('canvas'); sk.id = 'b-sky'; sk.setAttribute('aria-hidden', 'true'); view.append(sk); try { window.vcSky(sk, function () { return document.body.classList.contains('log-page') }) } catch (e) { sk.remove() } }
    main = document.createElement('div'); main.id = 'b-main'; view.append(main)
    var hd = document.createElement('div'); hd.id = 'bhead'; hd.innerHTML = '<h2></h2><p></p>'; view.append(hd)
    var head = function () { hd.querySelector('h2').textContent = u('name'); hd.querySelector('p').textContent = u('lead'); if (window.vcFitTitles) window.vcFitTitles() }; head()
    window.addEventListener('vc-lang', head)
    var p = document.createElement('p'); p.className = 'b-empty'; p.style.maxWidth = '860px'; p.style.margin = '0 auto'; p.textContent = u('loading'); main.append(p)
    window.addEventListener('vc-ajustes', function (e) { if (data && e.detail && e.detail.k === 'vero') draw(false) })
    window.addEventListener('vc-lang', function () { if (data) draw(false); view.setAttribute('aria-label', u('name')); if (document.body.classList.contains('log-page')) setTimeout(setTitle, 0) })
    window.addEventListener('resize', function () { if (openId) fitArtImg(); if (!openId) { moveInd(main, true); fitBub(main.querySelector('.b-bub')) } })
    try { document.fonts.ready.then(function () { fitBub(main.querySelector('.b-bub')) }) } catch (e) { }
    document.addEventListener('click', function (ev) { if (!ev.target.closest || !ev.target.closest('.b-prev,.b-bub')) closePrev() })
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePrev() })
    try { document.fonts.ready.then(function () { moveInd(main, true) }) } catch (e) { }
    /* la cuenta atras se actualiza sola cada 20 s (sin redibujar la pagina) */
    setInterval(function () { if (data && document.body.classList.contains('log-page') && !openId) tick() }, 20000)
  }
  /* se llama al entrar en la seccion (fresh: viene de otra seccion) y al cambiar la direccion (atras/adelante) */
  function show(v, fresh) {
    mount(v)
    load().then(function () {
      var id = hashId(), it = it0(id)
      if (fresh) view.dataset.fromList = ''
      var changed = (it ? it.id : null) !== openId
      openId = it ? it.id : null
      if (fresh || changed) { draw(true); play(); main.scrollTop = 0 }
      if (legacy) setHash(openId, false); else setAlts(openId)
      setTitle()
    }).catch(function () { main.replaceChildren(); var e = document.createElement('p'); e.className = 'b-empty'; e.textContent = u('error'); main.append(e) })
  }
  /* al abrir una entrada desde la lista se recuerda, para que "volver" use el boton atras del navegador */
  var _open = open
  open = function (id, push) { if (view) view.dataset.fromList = push && !openId ? '1' : ''; _open(id, push) }
  /* estilos desde el principio (la seccion puede abrirse directamente por su direccion) */
  if (!document.getElementById('vc-bitacora-css')) { var st0 = document.createElement('style'); st0.id = 'vc-bitacora-css'; st0.textContent = CSS; document.head.append(st0) }
  window.vcBitacora = {
    show: show, load: load, PATH: PATH, tx: tx,
    /* direccion de una entrada en el idioma de la pagina (cargada ya la Bitacora) */
    href: function (id) { return entryPath(id) },
    ui: function (k) { return u(k) },
    /* etiqueta de cuenta atras de un evento ("¡Esta noche!", "Dentro de 2 dias"...) o null si ya paso */
    chip: function (it) { var st = evState(it, Date.now()); return st.past ? null : st.chip },
    /* abre una entrada (la seccion ya debe estar visible) */
    _fitBub: function (bb) { fitBub(bb || (main && main.querySelector('.b-bub'))) },
    openEntry: function (id) { load().then(function () { if (it0(id)) open(id, true) }) },
    /* titulo de la pestana con la entrada abierta (lo usa el atlas al poner el titulo de la seccion) */
    title: function () { var nm = it0(openId); return (nm ? tx(nm.t) + ' · ' : '') + u('name') + ' · Vero Cosmos' }
  }
  /* si el atlas abrio la seccion antes de que cargara este archivo, se pinta ahora */
  var lv0 = document.getElementById('log-view')
  if (lv0 && document.body.classList.contains('log-page') && !view) show(lv0, true)
})()
