/* Preparacion interactiva: una mochila de expedicion. Al pulsar cada bolsillo se ilumina su cremallera y salen los objetos
   que guarda (equipo, energia, almacenamiento, abrigo, agua, comida, luz roja y la carta del cielo para planificar).
   El amarillo marca los detalles importantes (tiradores, hebillas, carga de la bateria, ocular, contactos...).
   window.vcMochila.mount(host) -> { destroy() } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var NS = 'http://www.w3.org/2000/svg'
  var Y = '#f8d874', L = '#b9c9ff', L2 = '#8ab4ff', D = '#121a3c', D2 = '#0d1430', M = '#5b6bb4'

  var CSS = '.mo-w{flex:1;min-width:0;height:100%;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none}' +
    '.mo-w svg{width:100%;height:100%;display:block}' +
    '.mo-p{cursor:pointer;outline:none}.mo-p .mo-f{transition:fill .3s,stroke .3s}' +
    '.mo-p:hover .mo-f,.mo-p:focus-visible .mo-f{stroke:' + L + '}' +
    '.mo-p.on .mo-f{stroke:' + Y + ';fill:#1b2552}' +
    '.mo-p .mo-z{transition:stroke .3s,opacity .3s}.mo-p.on .mo-z{stroke:' + Y + ';stroke-dasharray:3 3;filter:drop-shadow(0 0 3px rgba(248,216,116,.8))}' +
    '.mo-i{transition:transform .55s cubic-bezier(.2,.9,.3,1.15),opacity .35s ease;pointer-events:none}' +
    '.mo-c{transition:opacity .4s ease;pointer-events:none}' +
    '.mo-t{font-family:' + SERIF + ';fill:#e8ecff;font-size:13px}.mo-s{font-family:' + SERIF + ';fill:#8f98c0;font-size:12px}' +
    '.mo-b{cursor:pointer}.mo-b rect{transition:stroke .2s}.mo-b:hover rect,.mo-b:focus-visible rect{stroke:' + Y + '}' +
    '.mo-bp{animation:moBob 4.5s ease-in-out infinite}@keyframes moBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}' +
    '.mo-p.hint .mo-f{animation:moGlow 1.5s ease-in-out}@keyframes moGlow{0%,100%{stroke:' + M + ';filter:none}45%{stroke:' + Y + ';filter:drop-shadow(0 0 6px rgba(248,216,116,.7))}}' +
    '.mo-p.hint .mo-z{stroke-dasharray:4 4;animation:moZip 1.5s linear}@keyframes moZip{from{stroke-dashoffset:0;stroke:' + Y + '}to{stroke-dashoffset:-32;stroke:' + L + '}}' +
    '.mo-p .mo-k{transform-box:fill-box;transform-origin:50% 0}.mo-p.hint .mo-k{animation:moPull 1.5s ease-in-out}@keyframes moPull{0%,100%{transform:rotate(0)}20%{transform:rotate(18deg)}40%{transform:rotate(-14deg)}60%{transform:rotate(9deg)}80%{transform:rotate(-4deg)}}' +
    '@media(prefers-reduced-motion:reduce){.mo-i,.mo-c,.mo-p .mo-f,.mo-p .mo-z{transition:none}.mo-bp,.mo-p.hint .mo-f,.mo-p.hint .mo-z,.mo-p.hint .mo-k{animation:none}}'

  /* ---------- objetos (dibujos de linea, centrados en 0,0, unos 80x56) ---------- */
  var ICON = {
    linterna: '<defs><linearGradient id="moBeam" x1="0" x2="1"><stop offset="0" stop-color="#fff3c8" stop-opacity=".8"/><stop offset="1" stop-color="#f8d874" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M8 -8 L44 -22 L44 22 L8 8 Z" fill="url(#moBeam)"/>' +
      '<rect x="-30" y="-7" width="30" height="14" rx="4" fill="' + D + '" stroke="' + L + '"/><path d="M0 -10 h10 v20 h-10 z" fill="' + D2 + '" stroke="' + L + '"/>' +
      '<rect x="-20" y="-11" width="7" height="4" rx="1.5" fill="' + Y + '"/><circle cx="10" cy="0" r="6" fill="#fff3c8"/><circle cx="10" cy="0" r="6" fill="none" stroke="' + Y + '" stroke-width="1.4"/><path d="M-26 -3 h18 M-26 3 h18" stroke="' + M + '"/>',
    carta: '<circle r="25" fill="' + D2 + '" stroke="' + L + '"/><circle r="19" fill="none" stroke="' + M + '" stroke-dasharray="2 2"/>' +
      '<path d="M-10 -8 L-2 -12 L6 -5 L12 -10 M-6 6 L3 9 L10 4" stroke="' + L2 + '" stroke-width=".8" fill="none"/>' +
      '<g fill="' + Y + '"><circle cx="-10" cy="-8" r="1.6"/><circle cx="-2" cy="-12" r="1.3"/><circle cx="6" cy="-5" r="1.8"/><circle cx="12" cy="-10" r="1.2"/><circle cx="-6" cy="6" r="1.4"/><circle cx="3" cy="9" r="1.7"/><circle cx="10" cy="4" r="1.2"/></g>' +
      '<path d="M0 -25 V-21 M25 0 H21 M0 25 V21 M-25 0 H-21" stroke="' + L + '"/><path d="M22 18 l12 -14 l3 3 l-12 14 l-4 1 z" fill="' + D + '" stroke="' + L + '"/><path d="M34 4 l3 3" stroke="' + Y + '" stroke-width="2"/>',
    telescopio: '<path d="M-6 6 L-16 30 M-6 6 L4 30 M-6 6 L-6 30 M-12 20 H0" stroke="' + L + '" fill="none"/>' +
      '<g transform="rotate(-28 -6 4)"><rect x="-30" y="-2" width="52" height="11" rx="2" fill="' + D + '" stroke="' + L + '"/><rect x="22" y="-4" width="14" height="15" rx="1.5" fill="' + D2 + '" stroke="' + L + '"/>' +
      '<rect x="-36" y="1" width="6" height="5" fill="' + Y + '"/><path d="M-12 -2 v-5 h14 v5" fill="none" stroke="' + L + '"/><path d="M14 -2 v11" stroke="' + Y + '"/></g><circle cx="-6" cy="5" r="3" fill="' + D + '" stroke="' + L + '"/>',
    camara: '<rect x="-30" y="-16" width="60" height="36" rx="5" fill="' + D + '" stroke="' + L + '"/><path d="M-12 -16 l4 -7 h16 l4 7" fill="' + D2 + '" stroke="' + L + '"/>' +
      '<circle cy="3" r="13" fill="' + D2 + '" stroke="' + L + '"/><circle cy="3" r="8" fill="#0a0f26" stroke="' + L2 + '"/><circle cx="-3" cy="0" r="2.2" fill="' + L2 + '" opacity=".7"/>' +
      '<rect x="18" y="-22" width="8" height="5" rx="1.5" fill="' + Y + '"/><circle cx="-22" cy="-9" r="2" fill="#ff7070"/>',
    ropa: '<path d="M-14 -24 Q0 -30 14 -24 L30 -14 L36 18 L26 20 L22 0 L22 28 L-22 28 L-22 0 L-26 20 L-36 18 L-30 -14 Z" fill="' + D + '" stroke="' + L + '"/>' +
      '<path d="M-14 -24 Q0 -10 14 -24" fill="none" stroke="' + L + '"/><path d="M0 -17 V28" stroke="' + Y + '" stroke-dasharray="2 1.5"/><rect x="-2" y="-14" width="4" height="6" rx="1" fill="' + Y + '"/>' +
      '<path d="M-18 8 h10 M8 8 h10" stroke="' + M + '"/><path d="M-22 20 h44" stroke="' + L2 + '" stroke-width="2.5" opacity=".6"/>',
    agua: '<path d="M-9 -20 h18 v6 q8 4 8 12 v32 q0 6 -6 6 h-22 q-6 0 -6 -6 v-32 q0 -8 8 -12 z" fill="' + D + '" stroke="' + L + '"/>' +
      '<rect x="-8" y="-28" width="16" height="9" rx="2" fill="' + D2 + '" stroke="' + L + '"/><path d="M-8 -21 h16" stroke="' + Y + '" stroke-width="2"/>' +
      '<path d="M-14 6 q4 -3 7 0 t7 0 t7 0 t7 0 V30 q0 4 -4 4 h-20 q-4 0 -4 -4 z" fill="#2c4a8a" opacity=".55"/><path d="M-11 -6 v26" stroke="#dbe7ff" opacity=".5"/>',
    filtros: '<circle cx="-12" r="18" fill="' + D2 + '" stroke="' + Y + '" stroke-width="2"/><circle cx="-12" r="13" fill="#3a2a6a" opacity=".55"/>' +
      '<circle cx="14" cy="6" r="15" fill="' + D2 + '" stroke="' + L + '" stroke-width="1.6"/><circle cx="14" cy="6" r="10" fill="#7a3040" opacity=".45"/>' +
      '<path d="M-20 -6 l6 -5 M-6 -10 l4 -3" stroke="#dbe7ff" opacity=".6"/><path d="M26 -22 h12 v8 h-6 v14" fill="none" stroke="' + L + '" stroke-width="2"/><circle cx="35" cy="-18" r="1.6" fill="' + Y + '"/>',
    baterias: '<rect x="-30" y="-16" width="56" height="32" rx="6" fill="' + D + '" stroke="' + L + '"/><rect x="26" y="-6" width="5" height="12" rx="1.5" fill="' + L + '"/>' +
      '<g fill="' + Y + '"><rect x="-23" y="-9" width="9" height="18" rx="1.5"/><rect x="-11" y="-9" width="9" height="18" rx="1.5"/><rect x="1" y="-9" width="9" height="18" rx="1.5"/></g><rect x="13" y="-9" width="9" height="18" rx="1.5" fill="none" stroke="' + Y + '"/>' +
      '<path d="M-4 22 l-4 8 h6 l-3 8" fill="none" stroke="' + Y + '" stroke-width="1.6"/>',
    tarjetas: '<path d="M-24 -22 h30 l10 10 v34 h-40 z" fill="' + D + '" stroke="' + L + '"/><g fill="' + Y + '"><rect x="-19" y="-18" width="4" height="8"/><rect x="-13" y="-18" width="4" height="8"/><rect x="-7" y="-18" width="4" height="8"/><rect x="-1" y="-18" width="4" height="8"/></g>' +
      '<rect x="-18" y="2" width="28" height="12" rx="2" fill="' + D2 + '" stroke="' + M + '"/><text x="-4" y="11" text-anchor="middle" font-size="8" fill="' + L + '" font-family="sans-serif">SD</text>' +
      '<rect x="10" y="-6" width="26" height="30" rx="2" fill="' + D2 + '" stroke="' + L + '" transform="rotate(14 23 9)"/><path d="M14 0 h18" stroke="' + Y + '" transform="rotate(14 23 9)"/>',
    cables: '<path d="M-20 -6 c-14 -4 -14 22 0 18 c14 -4 14 22 0 18 M-20 -6 c14 4 30 -8 26 -18" fill="none" stroke="' + L + '" stroke-width="2.4"/>' +
      '<ellipse cx="6" cy="6" rx="18" ry="12" fill="none" stroke="' + M + '" stroke-width="2"/><ellipse cx="6" cy="6" rx="12" ry="8" fill="none" stroke="' + M + '" stroke-width="2"/>' +
      '<rect x="2" y="-30" width="10" height="9" rx="2" fill="' + D + '" stroke="' + L + '" transform="rotate(-20 7 -25)"/><path d="M4 -32 v-4 M9 -33 v-4" stroke="' + Y + '" stroke-width="1.6" transform="rotate(-20 7 -25)"/>' +
      '<rect x="24" y="2" width="12" height="7" rx="1.5" fill="' + Y + '"/>',
    comida: '<rect x="-34" y="-8" width="40" height="28" rx="5" fill="' + D + '" stroke="' + L + '"/><path d="M-34 0 h40" stroke="' + L + '"/><rect x="-18" y="-12" width="8" height="5" rx="1.5" fill="' + Y + '"/>' +
      '<path d="M-28 6 h28 M-28 12 h28" stroke="' + M + '"/><path d="M12 -18 q22 2 24 24 q-8 -14 -24 -18 z" fill="' + Y + '" stroke="#c9a640"/><path d="M12 -18 l-2 -3" stroke="#8a6d20" stroke-width="1.6"/>' +
      '<circle cx="20" cy="16" r="9" fill="#5a2a40" stroke="' + L + '"/><path d="M20 7 q2 -4 5 -4" stroke="' + L + '" fill="none"/>'
  }
  /* bolsillos y lo que guarda cada uno; cada objeto tiene un hueco fijo alrededor de la mochila */
  var LX = 92, RX = 548
  var POCKETS = [
    { id: 'lid', name: 'Bolsillo superior', a: [320, 150], items: [['linterna', 'Linterna de pilas', LX, 92], ['carta', 'Carta celeste y plan', RX, 92]] },
    { id: 'main', name: 'Compartimento principal', a: [320, 240], items: [['telescopio', 'Telescopio', LX, 206], ['camara', 'Cámara', LX, 318], ['ropa', 'Ropa de abrigo', RX, 206]] },
    { id: 'small', name: 'Bolsillo pequeño', a: [320, 285], items: [['comida', 'Comida', LX, 542]] },
    { id: 'left', name: 'Bolsillo lateral izquierdo', a: [200, 420], items: [['agua', 'Agua', LX, 430]] },
    { id: 'right', name: 'Bolsillo lateral derecho', a: [440, 420], items: [['filtros', 'Filtros y accesorios', RX, 318]] },
    { id: 'front', name: 'Bolsillo frontal', a: [320, 420], items: [['baterias', 'Baterías portátiles', RX, 430], ['tarjetas', 'Tarjetas de memoria', RX, 542], ['cables', 'Cables', 320, 618]] }
  ]

  /* logo de Vero Cosmos estilizado como parche de la mochila: V y C entrelazadas, una orbita y la estrella de cuatro puntas */
  var LOGO = '<g transform="translate(318 414)" pointer-events="none">' +
    '<path d="M15 -17 A21 21 0 1 0 17 15" fill="none" stroke="' + L + '" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M11 -13 A16 16 0 1 0 13 12" fill="none" stroke="' + M + '" stroke-width="1"/>' +
    '<path d="M-22 -22 L-4 16" stroke="' + L + '" stroke-width="3.2" stroke-linecap="round"/><path d="M-4 16 L19 -25" stroke="' + L2 + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M-26 -22 h8 M15 -25 h8" stroke="' + L + '" stroke-width="1.2"/>' +
    '<ellipse rx="30" ry="8" transform="rotate(-22)" fill="none" stroke="' + L2 + '" stroke-width="1" stroke-dasharray="40 4 70 3"/>' +
    '<path d="M30 -27 L32.4 -21.4 L38 -19 L32.4 -16.6 L30 -11 L27.6 -16.6 L22 -19 L27.6 -21.4 Z" fill="' + Y + '"/>' +
    '<circle cx="-30" cy="-6" r="1.3" fill="' + Y + '"/><circle cx="-16" cy="22" r="1.1" fill="' + Y + '"/><path d="M8 22 l1 2.5 l2.5 1 l-2.5 1 l-1 2.5 l-1 -2.5 l-2.5 -1 l2.5 -1 z" fill="' + L + '"/>' +
    '</g>'
  /* ---------- la mochila (bolsillos como botones) ---------- */
  function backpackSVG() {
    var s = ''
    /* correas de los hombros y asa (detras) */
    s += '<path d="M262 150 C238 200 232 300 246 420" fill="none" stroke="#0a0f26" stroke-width="16"/><path d="M378 150 C402 200 408 300 394 420" fill="none" stroke="#0a0f26" stroke-width="16"/>'
    s += '<path d="M262 150 C238 200 232 300 246 420 M378 150 C402 200 408 300 394 420" fill="none" stroke="' + M + '" stroke-width="1"/>'
    s += '<path d="M296 128 q24 -26 48 0" fill="none" stroke="' + L + '" stroke-width="5"/><path d="M296 128 q24 -26 48 0" fill="none" stroke="' + D + '" stroke-width="2.5"/>'
    /* compartimento principal (cuerpo) */
    s += '<g class="mo-p" data-p="main" tabindex="0" role="button"><path class="mo-f" d="M232 168 Q320 136 408 168 L428 512 Q428 548 392 548 L248 548 Q212 548 212 512 Z" fill="' + D + '" stroke="' + M + '" stroke-width="1.6"/>' +
      '<path class="mo-z" d="M236 176 Q320 148 404 176" fill="none" stroke="' + L + '" stroke-width="2" stroke-dasharray="1 0"/><rect class="mo-k" x="398" y="170" width="7" height="13" rx="2" fill="' + Y + '"/>' +
      '<path d="M222 300 Q320 290 418 300" fill="none" stroke="' + M + '" stroke-dasharray="3 3" opacity=".6"/></g>'
    /* base reforzada y cinturon */
    s += '<path d="M214 500 L426 500 L428 512 Q428 548 392 548 L248 548 Q212 548 212 512 Z" fill="#0a0f26" stroke="' + M + '" stroke-width="1.2" pointer-events="none"/>'
    s += '<path d="M190 492 q-14 2 -16 18 l40 4 z M450 492 q14 2 16 18 l-40 4 z" fill="#0a0f26" stroke="' + M + '" pointer-events="none"/><rect x="172" y="502" width="14" height="10" rx="2" fill="' + Y + '" pointer-events="none"/><rect x="454" y="502" width="14" height="10" rx="2" fill="' + Y + '" pointer-events="none"/>'
    /* bolsillos laterales de malla (izquierdo con botella asomando) */
    ;[['left', -1], ['right', 1]].forEach(function (b) {
      var sx = b[1], x0 = sx < 0 ? 214 : 426, xo = x0 + sx * 34
      s += '<g class="mo-p" data-p="' + b[0] + '" tabindex="0" role="button"><path class="mo-f" d="M' + x0 + ' 340 L' + xo + ' 348 Q' + (xo + sx * 6) + ' 420 ' + xo + ' 492 L' + x0 + ' 498 Z" fill="' + D2 + '" stroke="' + M + '" stroke-width="1.4"/>'
      for (var i = 0; i < 6; i++) s += '<path d="M' + x0 + ' ' + (356 + i * 24) + ' L' + xo + ' ' + (350 + i * 24) + '" stroke="' + M + '" opacity=".45"/>'
      for (var j = 1; j < 4; j++) { var xm = x0 + sx * j * 8.5; s += '<path d="M' + xm + ' 346 L' + xm + ' 494" stroke="' + M + '" opacity=".35"/>' }
      s += '<path class="mo-z" d="M' + x0 + ' 340 L' + xo + ' 348" stroke="' + L + '" stroke-width="2"/>'
      if (sx < 0) s += '<rect x="' + (xo + 6) + '" y="322" width="16" height="22" rx="3" fill="' + D + '" stroke="' + L + '"/><path d="M' + (xo + 6) + ' 328 h16" stroke="' + Y + '" stroke-width="2"/>'
      else s += '<path d="M' + (xo - 18) + ' 336 l8 -14 l8 14" fill="none" stroke="' + L + '"/>'
      s += '</g>'
    })
    /* correas de compresion con hebillas amarillas */
    ;[278, 452].forEach(function (y) { s += '<path d="M214 ' + y + ' h30 M396 ' + y + ' h30" stroke="#0a0f26" stroke-width="7" pointer-events="none"/><rect x="236" y="' + (y - 5) + '" width="12" height="10" rx="2" fill="' + Y + '" pointer-events="none"/><rect x="392" y="' + (y - 5) + '" width="12" height="10" rx="2" fill="' + Y + '" pointer-events="none"/>' })
    /* bolsillo pequeno (organizador) */
    s += '<g class="mo-p" data-p="small" tabindex="0" role="button"><rect class="mo-f" x="270" y="250" width="100" height="66" rx="12" fill="' + D2 + '" stroke="' + M + '" stroke-width="1.4"/>' +
      '<path class="mo-z" d="M280 262 H360" stroke="' + L + '" stroke-width="2"/><rect class="mo-k" x="354" y="258" width="10" height="7" rx="2" fill="' + Y + '"/><path d="M278 304 H362" stroke="' + M + '" stroke-dasharray="3 3" opacity=".6"/></g>'
    /* bolsillo frontal grande, con tira reflectante y una estrella bordada */
    s += '<g class="mo-p" data-p="front" tabindex="0" role="button"><path class="mo-f" d="M248 352 Q320 334 392 352 L398 488 Q398 506 380 506 L260 506 Q242 506 242 488 Z" fill="' + D2 + '" stroke="' + M + '" stroke-width="1.4"/>' +
      '<path class="mo-z" d="M254 362 Q320 344 386 362" fill="none" stroke="' + L + '" stroke-width="2"/><rect class="mo-k" x="380" y="356" width="7" height="13" rx="2" fill="' + Y + '"/><rect class="mo-k" x="253" y="356" width="7" height="13" rx="2" fill="' + Y + '"/>' +
      '<path d="M256 468 H384" stroke="' + Y + '" stroke-width="3" opacity=".85"/><path d="M252 496 H388" stroke="' + M + '" stroke-dasharray="3 3" opacity=".6"/>' +
      LOGO + '</g>'
    /* tapa (bolsillo superior) con correas y hebillas */
    s += '<g class="mo-p" data-p="lid" tabindex="0" role="button"><path class="mo-f" d="M226 172 Q320 98 414 172 L410 214 Q320 236 230 214 Z" fill="#141d44" stroke="' + M + '" stroke-width="1.6"/>' +
      '<path class="mo-z" d="M246 190 Q320 168 394 190" fill="none" stroke="' + L + '" stroke-width="2"/><rect class="mo-k" x="388" y="184" width="10" height="7" rx="2" fill="' + Y + '"/>' +
      '<path d="M268 218 v34 M372 218 v34" stroke="#0a0f26" stroke-width="7" pointer-events="none"/><rect x="262" y="236" width="12" height="10" rx="2" fill="' + Y + '"/><rect x="366" y="236" width="12" height="10" rx="2" fill="' + Y + '"/>' +
      '<path d="M236 206 Q320 226 404 206" fill="none" stroke="' + M + '" stroke-dasharray="3 3" opacity=".6"/></g>'
    return s
  }

  function mount(host) {
    if (!document.getElementById('mo-css')) { var st = document.createElement('style'); st.id = 'mo-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var wrap = document.createElement('div'); wrap.className = 'mo-w'; host.append(wrap)
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 640 690'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('role', 'group')
    var html = ''
    /* fondo: suelo con curvas de nivel suaves y algunas estrellas */
    html += '<g class="mo-cs"></g><g class="mo-mv"><g opacity=".55">' + [0, 1, 2, 3].map(function (i) { return '<ellipse cx="320" cy="560" rx="' + (190 + i * 70) + '" ry="' + (34 + i * 14) + '" fill="none" stroke="' + M + '" stroke-opacity="' + (.5 - i * .1) + '"/>' }).join('') + '</g>'
    for (var k = 0; k < 40; k++) { var sx = (k * 137.5) % 640, sy = (k * 71.3) % 280; html += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + (k % 7 === 0 ? 1.4 : .8) + '" fill="' + (k % 9 === 0 ? Y : '#dbe7ff') + '" opacity="' + (k % 5 === 0 ? .7 : .35) + '"/>' }
    html += '<ellipse cx="320" cy="552" rx="150" ry="16" fill="#02030a" opacity=".6"/>'
    html += '<g class="mo-bp">' + backpackSVG() + '</g></g><g class="mo-is"></g>'
    html += '<text class="mo-s mo-cnt" x="16" y="24"></text><text class="mo-s mo-hint" x="16" y="42"></text>'
    html += '<g class="mo-b" tabindex="0" role="button"><rect x="520" y="10" width="108" height="26" rx="8" fill="' + D + '" stroke="' + M + '"/><text class="mo-s mo-bt" x="574" y="28" text-anchor="middle"></text></g>'
    svg.innerHTML = html; wrap.append(svg)
    var gI = svg.querySelector('.mo-is'), gC = svg.querySelector('.mo-cs'), cnt = svg.querySelector('.mo-cnt'), hint = svg.querySelector('.mo-hint'), allB = svg.querySelector('.mo-b'), allT = svg.querySelector('.mo-bt')
    var open = {}, seen = {}, tall = false, DY = 320
    var TALL = { linterna: [80, 95], carta: [240, 95], telescopio: [400, 95], ropa: [560, 95], camara: [80, 228], filtros: [240, 228], agua: [400, 228], comida: [560, 228], baterias: [120, 968], tarjetas: [320, 968], cables: [520, 968] }
    var slot = function (e) { return tall ? TALL[e.it[0]] : [e.it[2], e.it[3]] }
    var anchor = function (p) { return [p.a[0], p.a[1] + (tall ? DY : 0)] }
    var mv = svg.querySelector('.mo-mv')
    /* objetos de cada bolsillo: empiezan escondidos dentro del bolsillo */
    POCKETS.forEach(function (p) {
      p.els = p.items.map(function (it) {
        var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'mo-i')
        g.innerHTML = '<g>' + ICON[it[0]] + '</g><text class="mo-t" y="48" text-anchor="middle"></text>'
        g.style.opacity = '0'
        gI.append(g)
        var c = document.createElementNS(NS, 'path'); c.setAttribute('class', 'mo-c'); c.setAttribute('stroke', Y); c.setAttribute('stroke-opacity', '.35'); c.setAttribute('stroke-dasharray', '3 5'); c.setAttribute('fill', 'none'); c.style.opacity = '0'
        gC.append(c)
        return { g: g, c: c, it: it, label: g.querySelector('text.mo-t') }
      })
    })
    function place(p, e, on) {
      var s = slot(e), an = anchor(p)
      e.g.style.transform = on ? 'translate(' + s[0] + 'px,' + s[1] + 'px) scale(1)' : 'translate(' + an[0] + 'px,' + an[1] + 'px) scale(.15)'
      e.c.setAttribute('d', 'M' + an[0] + ' ' + an[1] + ' L' + s[0] + ' ' + s[1])
    }
    /* distribucion apaisada (objetos a los lados) o vertical (filas encima y debajo) segun la forma del hueco */
    function layout() {
      var r = wrap.getBoundingClientRect(); if (!r.width) return
      var t2 = r.width / r.height < .78; if (t2 === tall && svg.getAttribute('viewBox')) return
      tall = t2; svg.setAttribute('viewBox', tall ? '0 0 640 1030' : '0 0 640 690')
      mv.setAttribute('transform', tall ? 'translate(0 ' + DY + ')' : '')
      POCKETS.forEach(function (p) { p.els.forEach(function (e) { var tr0 = e.g.style.transition; e.g.style.transition = 'none'; place(p, e, !!open[p.id]); void e.g.getBBox(); e.g.style.transition = tr0 }) })
    }
    function setPocket(id, on) {
      var p = POCKETS.filter(function (q) { return q.id === id })[0]; if (!p) return
      open[id] = on; if (on) seen[id] = true
      var b = svg.querySelector('.mo-p[data-p="' + id + '"]'); b.classList.toggle('on', on); b.setAttribute('aria-expanded', String(on))
      p.els.forEach(function (e, i) {
        e.g.style.transitionDelay = on ? (i * .09) + 's' : '0s'
        e.g.style.opacity = on ? '1' : '0'
        place(p, e, on)
        e.c.style.opacity = on ? '1' : '0'
      })
      texts()
    }
    function texts() {
      var n = Object.keys(seen).length
      cnt.textContent = T('Bolsillos revisados') + ': ' + n + ' / ' + POCKETS.length
      cnt.setAttribute('fill', n === POCKETS.length ? Y : '#8f98c0')
      hint.textContent = n ? '' : T('Pulsa un bolsillo para abrirlo')
      var anyOpen = POCKETS.some(function (p) { return open[p.id] })
      allT.textContent = T(anyOpen ? 'Cerrar todo' : 'Abrir todo')
      POCKETS.forEach(function (p) { svg.querySelector('.mo-p[data-p="' + p.id + '"]').setAttribute('aria-label', T(p.name)); p.els.forEach(function (e) { e.label.textContent = T(e.it[1]) }) })
      svg.setAttribute('aria-label', T('Preparación'))
    }
    svg.querySelectorAll('.mo-p').forEach(function (b) {
      var go = function () { var id = b.getAttribute('data-p'); setPocket(id, !open[id]) }
      b.addEventListener('click', go)
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } })
    })
    var all = function () { var anyOpen = POCKETS.some(function (p) { return open[p.id] }); POCKETS.forEach(function (p) { setPocket(p.id, !anyOpen) }) }
    allB.addEventListener('click', all); allB.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); all() } })
    svg.removeAttribute('viewBox'); layout()
    var ro = null; try { ro = new ResizeObserver(layout); ro.observe(wrap) } catch (x) { }
    texts()
    var hintT = 0, hk = 0
    function nudge() {
      var left = POCKETS.filter(function (p) { return !seen[p.id] && !open[p.id] })
      if (left.length && svg.isConnected) {
        var p = left[hk++ % left.length], b = svg.querySelector('.mo-p[data-p="' + p.id + '"]')
        b.classList.remove('hint'); void b.getBBox(); b.classList.add('hint')
        setTimeout(function () { b.classList.remove('hint') }, 1600)
      }
      if (svg.isConnected && Object.keys(seen).length < POCKETS.length) hintT = setTimeout(nudge, 2300)
    }
    hintT = setTimeout(nudge, 900)
    var onLang = function () { texts() }
    window.addEventListener('vc-lang', onLang)
    return { destroy: function () { clearTimeout(hintT); if (ro) ro.disconnect(); window.removeEventListener('vc-lang', onLang) } }
  }
  window.vcMochila = { mount: mount }
})()
