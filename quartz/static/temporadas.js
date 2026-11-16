/*
 * Banner de temporada de la Bitacora del Cielo (window.vcTemporadas).
 * Cada dia elige una temporada, por orden de prioridad:
 *   1) un evento especial escrito en la Bitacora (eclipse, conjuncion...) desde su fecha de publicacion hasta que acaba
 *   2) una fiesta (ver fiestas(): algunas solo en un idioma). Si en esos dias hay una lluvia u otro evento, se avisa debajo
 *   3) la temporada de una lluvia de estrellas (desde que se publica, 10 dias antes, hasta que acaba)
 *   4) la estacion del ano (equinoccios y solsticios calculados): es el banner por defecto
 * El dibujo es una escena animada hecha con codigo; si en el vault hay una imagen para esa temporada
 * (bitacora-del-cielo/temporadas/<clave>.jpg, o "banner:" en la nota del evento), se usa la imagen.
 */
;(function () {
  var DAY = 864e5
  /* ---------------- textos ---------------- */
  var TXT = {
    es: {
      lluvia: 'Temporada de estrellas fugaces · {n}', evento: 'Evento especial', go: 'Ver la entrada', next: 'Próximo: {t} · {c}',
      navidad: ['Temporada navideña', '¡Felices fiestas bajo las estrellas!', 'Gracias por mirar el cielo con Vero Cosmos este año.'],
      reyes: ['Noche de Reyes', 'Siguiendo la estrella', 'Los Reyes Magos se guiaron por una estrella: esta noche, busca la tuya.'],
      carnaval: ['Carnaval', 'El cielo también se disfraza', 'Nebulosas de mil colores y cúmulos que brillan: descúbrelos en el atlas.'],
      'semana-santa': ['Semana Santa', 'Una fiesta que marca la Luna', 'El Domingo de Pascua es el primero tras la luna llena de la primavera: este año, el {d}.'],
      halloween: ['Halloween', 'La noche más misteriosa del cielo', 'Murciélagos, lunas naranjas y nebulosas con forma de fantasma.'],
      fallas: ['Fallas', 'Fuego, pólvora y una noche estrellada', 'La Cremà del 19 de marzo llega justo antes del equinoccio de primavera: ¡adiós al invierno!'],
      'feria-de-abril': ['Feria de Abril', 'Farolillos bajo las estrellas', 'Sevilla se llena de luces: ¿verás alguna estrella entre tanto farolillo?'],
      rocio: ['El Rocío', 'Camino bajo las estrellas', 'Las carretas avanzan de noche hacia la aldea: el mejor momento para mirar arriba.'],
      'san-fermin': ['San Fermín', 'Del chupinazo a las estrellas', 'Del 6 al 14 de julio Pamplona no duerme… y el cielo de verano tampoco.'],
      tomatina: ['La Tomatina', 'Hoy todo se tiñe de rojo', 'Como Marte, el planeta rojo… que debe su color al óxido de hierro, ¡no a los tomates!'],
      'san-juan': ['Noche de San Juan', 'La noche más corta del año', 'Hogueras, deseos y el solsticio de verano: el Sol llega a su punto más alto del año.'],
      hispanidad: ['Día de la Hispanidad', 'Un cielo compartido a ambos lados del océano', 'Desde España y América miramos las mismas estrellas… ¡casi! En el sur brilla la Cruz del Sur.'],
      primavera: ['Primavera en el cielo', 'Noches templadas y galaxias', 'Es la estación de las galaxias: Leo, Virgo y la Osa Mayor están altas.'],
      verano: ['Verano en el cielo', 'La Vía Láctea en todo su esplendor', 'Noches cálidas para tumbarse a mirar el centro de nuestra galaxia.'],
      otono: ['Otoño en el cielo', 'Noches más largas para mirar las estrellas', 'Andrómeda, las Pléyades y el regreso de Orión de madrugada.'],
      invierno: ['Invierno en el cielo', 'Orión manda en las noches frías', 'Las noches más largas y las estrellas más brillantes del año.']
    },
    en: {
      lluvia: 'Meteor shower season · {n}', evento: 'Special event', go: 'Read the entry', next: 'Next: {t} · {c}',
      navidad: ['Holiday season', 'Happy holidays under the stars!', 'Thank you for watching the sky with Vero Cosmos this year.'],
      reyes: ['Twelfth Night', 'Following the star', 'The Three Wise Men followed a star: tonight, look for yours.'],
      carnaval: ['Carnival', 'The sky dresses up too', 'Nebulae in a thousand colours and sparkling clusters: discover them in the atlas.'],
      'semana-santa': ['Holy Week', 'A holiday set by the Moon', 'Easter Sunday is the first Sunday after the spring full moon: this year, {d}.'],
      halloween: ['Halloween', 'The most mysterious night in the sky', 'Bats, orange moons and ghost-shaped nebulae.'],
      hispanidad: ['Hispanic Day', 'A sky shared on both sides of the ocean', 'From Spain and the Americas we look at the same stars… almost! In the south shines the Southern Cross.'],
      fallas: ['Fallas', 'Fire, fireworks and a starry night', 'The Cremà on 19 March comes just before the spring equinox: goodbye, winter!'],
      'feria-de-abril': ['Seville April Fair', 'Lanterns under the stars', 'Seville fills with lights: will you spot a star among so many lanterns?'],
      rocio: ['El Rocío pilgrimage', 'On the road under the stars', 'The wagons travel by night towards the village: the best time to look up.'],
      'san-fermin': ['San Fermín', 'From the chupinazo to the stars', 'From 6 to 14 July Pamplona never sleeps… and neither does the summer sky.'],
      tomatina: ['La Tomatina', 'Everything turns red today', 'Just like Mars, the red planet… which owes its colour to iron oxide, not tomatoes!'],
      primavera: ['Spring skies', 'Mild nights and galaxies', 'It’s galaxy season: Leo, Virgo and the Big Dipper are riding high.'],
      verano: ['Summer skies', 'The Milky Way in all its glory', 'Warm nights to lie back and look at the heart of our galaxy.'],
      otono: ['Autumn skies', 'Longer nights for stargazing', 'Andromeda, the Pleiades and Orion returning before dawn.'],
      invierno: ['Winter skies', 'Orion rules the cold nights', 'The longest nights and the brightest stars of the year.']
    },
    fr: {
      lluvia: 'Saison des étoiles filantes · {n}', evento: 'Événement spécial', go: 'Lire l’article', next: 'Prochain : {t} · {c}',
      navidad: ['Saison des fêtes', 'Joyeuses fêtes sous les étoiles !', 'Merci d’avoir regardé le ciel avec Vero Cosmos cette année.'],
      reyes: ['Épiphanie', 'En suivant l’étoile', 'Les Rois mages ont suivi une étoile : ce soir, cherchez la vôtre.'],
      carnaval: ['Carnaval', 'Le ciel se déguise aussi', 'Des nébuleuses de mille couleurs et des amas scintillants : découvrez-les dans l’atlas.'],
      'semana-santa': ['Semaine sainte', 'Une fête fixée par la Lune', 'Le dimanche de Pâques est le premier après la pleine lune du printemps : cette année, le {d}.'],
      halloween: ['Halloween', 'La nuit la plus mystérieuse du ciel', 'Des chauves-souris, des lunes orange et des nébuleuses en forme de fantôme.'],
      hispanidad: ['Jour de l’Hispanité', 'Un ciel partagé des deux côtés de l’océan', 'Depuis l’Espagne et l’Amérique, nous regardons les mêmes étoiles… ou presque ! Au sud brille la Croix du Sud.'],
      fallas: ['Les Fallas', 'Du feu, de la poudre et une nuit étoilée', 'La Cremà du 19 mars arrive juste avant l’équinoxe de printemps : adieu l’hiver !'],
      'feria-de-abril': ['Feria d’avril de Séville', 'Des lampions sous les étoiles', 'Séville s’illumine : verrez-vous une étoile parmi tant de lampions ?'],
      rocio: ['Pèlerinage d’El Rocío', 'En chemin sous les étoiles', 'Les charrettes avancent de nuit vers le village : le meilleur moment pour lever les yeux.'],
      'san-fermin': ['San Fermín', 'Du chupinazo aux étoiles', 'Du 6 au 14 juillet, Pampelune ne dort pas… et le ciel d’été non plus.'],
      tomatina: ['La Tomatina', 'Aujourd’hui, tout se teinte de rouge', 'Comme Mars, la planète rouge… qui doit sa couleur à l’oxyde de fer, pas aux tomates !'],
      '14-juillet': ['14 Juillet', 'Des feux d’artifice sous les étoiles', 'Ce soir, entre deux fusées, cherchez le Triangle d’été : Véga, Deneb et Altaïr.'],
      chandeleur: ['La Chandeleur', 'À mi-chemin entre l’hiver et le printemps', 'Le 2 février tombe presque à mi-chemin entre le solstice d’hiver et l’équinoxe de printemps… et les crêpes sont rondes comme la pleine lune !'],
      primavera: ['Le ciel du printemps', 'Nuits douces et galaxies', 'C’est la saison des galaxies : le Lion, la Vierge et la Grande Ourse sont hauts.'],
      verano: ['Le ciel d’été', 'La Voie lactée dans toute sa splendeur', 'Des nuits chaudes pour s’allonger et contempler le cœur de notre galaxie.'],
      otono: ['Le ciel d’automne', 'Des nuits plus longues pour observer les étoiles', 'Andromède, les Pléiades et le retour d’Orion avant l’aube.'],
      invierno: ['Le ciel d’hiver', 'Orion règne sur les nuits froides', 'Les nuits les plus longues et les étoiles les plus brillantes de l’année.']
    }
  }
  var LOC = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR' }
  function frT(l, s) { return l === 'fr' ? s.replace(/ ([?!:;])/g, ' $1') : s }

  /* ---------------- calendario ---------------- */
  /* Domingo de Pascua (algoritmo de Meeus/Jones/Butcher) */
  function pascua(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
    var mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(y, mes - 1, dia)
  }
  function dia(y, m, d) { return new Date(y, m - 1, d) }
  function mas(dt, n) { var x = new Date(dt); x.setDate(x.getDate() + n); return x }
  function dentro(now, a, b) { return now >= a.getTime() && now < mas(b, 1).getTime() } /* de a (00:00) a b (23:59) */
  /* ultimo miercoles de agosto (la Tomatina) */
  function tomatina(y) { var d = dia(y, 8, 31); while (d.getDay() !== 3) d = mas(d, -1); return d }
  /* fiestas: [clave, desde, hasta, idiomas (si solo salen en alguno)]. Las primeras ganan si coinciden */
  function fiestas(y) {
    var P = pascua(y), T = tomatina(y)
    return [
      ['san-juan', dia(y, 6, 22), dia(y, 6, 24), ['es']],
      ['hispanidad', dia(y, 10, 11), dia(y, 10, 12)],
      ['14-juillet', dia(y, 7, 13), dia(y, 7, 14), ['fr']],
      ['chandeleur', dia(y, 2, 1), dia(y, 2, 2), ['fr']],
      ['fallas', dia(y, 3, 15), dia(y, 3, 19)],
      ['feria-de-abril', mas(P, 13), mas(P, 20)],
      ['rocio', mas(P, 45), mas(P, 50)],
      ['san-fermin', dia(y, 7, 6), dia(y, 7, 14)],
      ['tomatina', mas(T, -1), T],
      ['halloween', dia(y, 10, 25), dia(y, 11, 1)],
      ['navidad', dia(y, 12, 15), dia(y, 12, 31)],
      ['navidad', dia(y, 1, 1), dia(y, 1, 1)],
      ['reyes', dia(y, 1, 2), dia(y, 1, 6)],
      ['carnaval', mas(P, -52), mas(P, -46)],
      ['semana-santa', mas(P, -7), mas(P, 1)]
    ]
  }
  function fiesta(now, lang) {
    var y = new Date(now).getFullYear(), F = fiestas(y)
    for (var i = 0; i < F.length; i++) {
      var f = F[i]
      if ((!f[3] || f[3].indexOf(lang) >= 0) && dentro(now, f[1], f[2])) return { k: f[0], pascua: pascua(y) }
    }
    return null
  }
  /* estacion astronomica: equinoccios y solsticios a partir de la longitud del Sol (lluvias.js) */
  function estacion(now) {
    var L = window.vcLluvias, y = new Date(now).getUTCFullYear()
    function inst(lon, m, d) {
      var ap = Date.UTC(y, m - 1, d); if (!L || !L.whenLon) return ap
      var T = (ap / DAY + 2440587.5 - 2451545) / 36525
      return L.whenLon((lon - 1.396971 * T + 360) % 360, ap) /* equinoccio de la fecha -> referido a J2000 */
    }
    var pri = inst(0, 3, 20), ver = inst(90, 6, 21), oto = inst(180, 9, 22), inv = inst(270, 12, 21)
    if (now >= inv || now < pri) return 'invierno'
    if (now < ver) return 'primavera'
    if (now < oto) return 'verano'
    return 'otono'
  }
  /* temporada de hoy. items: entradas de la Bitacora (notas + lluvias), ya combinadas */
  function elegir(items, now, lang) {
    now = now || Date.now(); lang = lang || 'es'
    var ev = (items || []).filter(function (i) { return i.tipo === 'evento' && i.inicio && Date.parse(i.fin || i.inicio) > now && Date.parse((i.fecha || '1970-01-01') + 'T00:00:00') <= now })
      .sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })
    var esp = ev.filter(function (i) { return !i.lluvia })[0]
    if (esp) return { k: 'evento', it: esp }
    /* una fiesta gana a la temporada de una lluvia; si esa noche hay maximo, se avisa debajo (ver "next") */
    var ll = ev.filter(function (i) { return i.lluvia })
    var f = fiesta(now, lang); if (f) return f
    if (ll[0]) return { k: 'lluvia', it: ll[0] }
    return { k: estacion(now) }
  }

  /* constelaciones de los banners (generadas con tools/constelaciones-temporadas.mjs desde tools/data/cielo.json) */
  var CIELO = {"osa-mayor":{"w":160,"h":90,"d":"M52.1 20.9L82.2 9.2L83 22.5L61.2 29.2L52.1 20.9L35.9 23.6L23.4 26.1L13.5 40M61.2 29.2L64.4 43.8L76 80.1L76.1 84M64.4 43.8L79.7 51.9L99.5 59.3M79.7 51.9L101.7 55.8M82.2 9.2L120.9 6L146.5 11.8L112.7 15.9L83 22.5M83 22.5L112.2 28.3L120.3 34.2L134.4 43.2M132.5 45.3L120.3 34.2","s":[[82.2,9.2,1.9],[35.9,23.6,1.9],[13.5,40,1.8],[23.4,26.1,1.7],[83,22.5,1.6],[61.2,29.2,1.6],[79.7,51.9,1.3],[99.5,59.3,1.2],[134.4,43.2,1.2],[120.3,34.2,1.2]]},"triangulo-verano":{"w":120,"h":110,"d":"M86.9 32.5L87.1 29.1L89.9 30.5L86.9 32.5L83.2 33.7L81.5 40.8L84.9 39.7L86.9 32.5M30.1 44.9L40.3 38.6L49.5 28.1L63.8 19.9L69.7 8.8L74.5 6M42.2 19.6L49.5 28.1L59.5 36.8L69.3 48.7M63.3 77.9L61.6 80.9L59.8 85L53.7 97.2L60.9 94.1L71.3 90.6L79 72.5L61.6 80.9L71.3 90.6L78.7 104","s":[[89.9,30.5,2.8],[81.5,40.8,1.1],[84.9,39.7,1],[83.2,33.7,0.8],[86.9,32.5,0.8],[87.1,29.1,0.8],[42.2,19.6,2.1],[49.5,28.1,1.7],[40.3,38.6,1.5],[63.8,19.9,1.3],[69.3,48.7,1.3],[30.1,44.9,1.2],[69.7,8.8,0.9],[74.5,6,0.9],[59.5,36.8,0.8],[61.6,80.9,2.4],[63.3,77.9,1.4],[79,72.5,1.3],[53.7,97.2,1.2],[71.3,90.6,1.1],[78.7,104,1.1],[59.8,85,0.9],[60.9,94.1,0.8]],"t":"M89.9 30.5L42.2 19.6L61.6 80.9Z"},"cruz-sur":{"w":70,"h":90,"d":"M8.6 39.6L61.4 27.4M42.9 84L35.5 6","s":[[42.9,84,2.4],[8.6,39.6,2.1],[35.5,6,2],[61.4,27.4,1.4]]}}
  /* ---------------- escenas animadas ---------------- */
  var SCN = {
    lluvia: { bg: 'radial-gradient(ellipse at 82% 20%,color-mix(in srgb,var(--acc) 26%,transparent),transparent 60%),linear-gradient(120deg,#0b1025,color-mix(in srgb,var(--acc) 10%,#141c46))', fx: ['estrellas', 'fugaces'] },
    evento: { bg: 'radial-gradient(ellipse at 80% 30%,#f8d87422,transparent 60%),linear-gradient(120deg,#0b1025,#1b2656)', fx: ['estrellas', 'fugaces'] },
    navidad: { acc: '#f8d874', bg: 'radial-gradient(ellipse at 85% 10%,#f8d87430,transparent 55%),linear-gradient(160deg,#16244f,#0b1025 70%)', fx: ['estrellas', 'nieve', 'guirnalda'] },
    reyes: { acc: '#f8d874', bg: 'radial-gradient(ellipse at 60% 110%,#ff9a5a38,transparent 55%),radial-gradient(ellipse at 52% 10%,#ffe9a81f,transparent 45%),linear-gradient(180deg,#0f1640 0%,#2a1d48 58%,#4b2d40 100%)', fx: ['estrellas', 'arena'] },
    carnaval: { acc: '#f8d874', bg: 'radial-gradient(ellipse at 72% 100%,#ffcf7a2e,transparent 55%),radial-gradient(ellipse at 15% 20%,#ff9fc91f,transparent 50%),linear-gradient(180deg,#1c0d22,#120a1c)', fx: ['confeti'] },
    'semana-santa': { acc: '#f4ecd2', bg: 'radial-gradient(circle at 80% 38%,#f4ecd226,transparent 40%),linear-gradient(180deg,#121a44,#0b1025 80%)', fx: ['estrellas'] },
    halloween: { acc: '#ff8d3a', bg: 'radial-gradient(circle at 82% 35%,#ff8d3a40,transparent 42%),linear-gradient(180deg,#1d1238,#0b0a1a 80%)', fx: ['estrellas', 'murcielagos'] },
    fallas: { acc: '#ff9a3c', bg: 'radial-gradient(ellipse at 34% 125%,#ff6a2a55,transparent 58%),radial-gradient(ellipse at 70% 110%,#ff9a3c22,transparent 50%),linear-gradient(180deg,#121640,#24122c)', fx: ['estrellas', 'cohetes', 'brasas'], cada: 600, pal: ['#ffd36b', '#ff8d3a', '#ff5d6c', '#fff'] },
    'feria-de-abril': { acc: '#f8d874', bg: 'radial-gradient(ellipse at 50% 0%,#f8d87422,transparent 60%),linear-gradient(180deg,#121a46,#0b1025)', fx: ['estrellas', 'farolillos'] },
    rocio: { acc: '#f2c27a', bg: 'radial-gradient(ellipse at 75% 90%,#ffe9b833,transparent 50%),linear-gradient(180deg,#0c1438,#1d1a3a 70%,#2a2240)', fx: ['estrellas', 'fugaces'] },
    'san-fermin': { acc: '#ff4d5e', bg: 'radial-gradient(ellipse at 40% 0%,#ff4d5e26,transparent 55%),linear-gradient(180deg,#141a46,#1d1430)', fx: ['estrellas', 'cohetes', 'confeti'], pal: ['#ff4d5e', '#fff', '#ff4d5e', '#ffd2d6'], cada: 1400 },
    tomatina: { acc: '#ff5a3c', bg: 'radial-gradient(circle at 82% 40%,#ff5a3c33,transparent 45%),radial-gradient(ellipse at 50% 120%,#ff5a3c22,transparent 60%),linear-gradient(120deg,#1e1236,#0b1025)', fx: ['estrellas', 'lanzar'] },
    'san-juan': { acc: '#ffb347', bg: 'radial-gradient(ellipse at 50% 115%,#ff8d3a55,transparent 58%),linear-gradient(180deg,#141c4c,#0b1025 75%)', fx: ['estrellas', 'brasas'] },
    hispanidad: { acc: '#f8d874', bg: 'radial-gradient(ellipse at 80% 20%,#f8d87422,transparent 55%),linear-gradient(180deg,#0e1a46,#0a1636)', fx: ['estrellas', 'fugaces'] },
    '14-juillet': { acc: '#8ab4ff', bg: 'radial-gradient(ellipse at 85% 100%,#4f7dff2a,transparent 55%),linear-gradient(180deg,#121a4a,#0b1025)', fx: ['estrellas', 'fuegos'], pal: ['#4f7dff', '#fff', '#ff4d5e'], cada: 650 },
    chandeleur: { acc: '#f8d874', bg: 'radial-gradient(circle at 82% 40%,#f8d87430,transparent 42%),linear-gradient(160deg,#152150,#0b1025)', fx: ['estrellas', 'nieve'] },
    primavera: { acc: '#9be8b0', bg: 'radial-gradient(ellipse at 20% 0%,#9be8b026,transparent 55%),radial-gradient(ellipse at 90% 100%,#ff9fc922,transparent 55%),linear-gradient(120deg,#0e1a3e,#0b1025)', fx: ['estrellas', 'petalos'] },
    verano: { acc: '#ffc98a', bg: 'linear-gradient(115deg,transparent 30%,#c9b6ff1c 45%,#ffd9a826 52%,#c9b6ff18 60%,transparent 72%),linear-gradient(180deg,#0d1236,#0b1025)', fx: ['estrellas', 'via'] },
    otono: { acc: '#ff9a4d', bg: 'radial-gradient(ellipse at 85% 15%,#ff9a4d26,transparent 55%),linear-gradient(120deg,#1a1634,#0b1025)', fx: ['estrellas', 'hojas'] },
    invierno: { acc: '#a6d8ff', bg: 'radial-gradient(ellipse at 80% 20%,#a6d8ff26,transparent 55%),linear-gradient(160deg,#122150,#0b1025 70%)', fx: ['estrellas', 'nieve'] }
  }
  var UID = 0
  function svgEstrella(c) { var g = 'bnG' + (++UID); return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="' + g + '"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="' + c + '" stop-opacity=".7"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="40" fill="url(#' + g + ')" opacity=".55"/><path d="M50 8 54 44 92 50 54 56 50 92 46 56 8 50 46 44Z" fill="#fff" opacity=".95"/><path d="M50 26 52.5 47.5 74 50 52.5 52.5 50 74 47.5 52.5 26 50 47.5 47.5Z" fill="' + c + '" transform="rotate(45 50 50)" opacity=".8"/></svg>' }
  function svgLuna(c, dark) { var g = 'bnL' + (++UID); return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="' + g + '" cx=".42" cy=".4"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".7" stop-color="' + c + '"/><stop offset="1" stop-color="' + (dark || c) + '"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="' + c + '" opacity=".12"/><circle cx="50" cy="50" r="34" fill="url(#' + g + ')"/><circle cx="40" cy="42" r="5" fill="#000" opacity=".08"/><circle cx="60" cy="58" r="7" fill="#000" opacity=".07"/><circle cx="58" cy="36" r="3" fill="#000" opacity=".08"/></svg>' }
  var CALABAZA = '<svg viewBox="0 0 100 80" aria-hidden="true"><path d="M50 14c3-8 9-11 13-10-5 3-7 6-8 11" fill="none" stroke="#7cb86a" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="48" rx="22" ry="26" fill="#e9761f"/><ellipse cx="66" cy="48" rx="22" ry="26" fill="#e9761f"/><ellipse cx="50" cy="48" rx="20" ry="29" fill="#f88d2c"/><path d="M38 40l7 8h-12zM62 40l5 8h-12zM34 58q16 12 32 0l-5 2-4-3-4 4-4-4-4 4-4-4-4 3z" fill="#ffd36b"/></svg>'
  var DUNAS = '<svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40Q60 18 130 34T270 30T400 24V60H0Z" fill="#2b1f33"/><path d="M0 50Q90 34 190 46T400 40V60H0Z" fill="#1d1526"/><g fill="#14101c"><path d="M250 36c4-6 9-7 12-4l3-6 3 1-2 7c3 0 4 3 3 6l-2 1v6h-2v-5h-8v5h-2v-6c-3-1-5-3-5-5z"/><path d="M286 34c4-6 9-7 12-4l3-6 3 1-2 7c3 0 4 3 3 6l-2 1v6h-2v-5h-8v5h-2v-6c-3-1-5-3-5-5z"/><path d="M322 37c4-6 9-7 12-4l3-6 3 1-2 7c3 0 4 3 3 6l-2 1v6h-2v-5h-8v5h-2v-6c-3-1-5-3-5-5z"/></g></svg>'
  var HORIZONTE = '<svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30Q50 22 100 28T200 24T300 27T400 22V40H0Z" fill="#070a1a"/></svg>'
  /* constelacion de CIELO como SVG (lineas del color de la temporada, estrellas blancas; el triangulo de verano, a trazos) */
  function svgCielo(k) {
    var c = CIELO[k]; if (!c) return ''
    return '<svg viewBox="0 0 ' + c.w + ' ' + c.h + '" aria-hidden="true"><path d="' + c.d + '" fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>' +
      (c.t ? '<path d="' + c.t + '" fill="none" stroke="#f8d874" stroke-width=".7" stroke-dasharray="2.5 2" opacity=".75"/>' : '') +
      c.s.map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#fff" opacity=".9"/>' }).join('') + '</svg>'
  }
  var HOGUERA = '<svg viewBox="0 0 100 90" aria-hidden="true"><circle cx="50" cy="56" r="40" fill="#ff8d3a" opacity=".16"/>' +
    '<g class="b-fl"><path d="M50 8C62 28 78 36 74 58C72 72 62 80 50 80C38 80 28 72 26 58C24 40 40 32 50 8Z" fill="#ff6a2a"/><path d="M50 26C58 40 66 46 64 60C62 70 56 76 50 76C44 76 38 70 37 61C36 50 46 42 50 26Z" fill="#ffb347"/><path d="M50 44C55 52 58 58 57 64C56 70 53 73 50 73C47 73 44 70 44 65C44 58 48 52 50 44Z" fill="#fff1b0"/></g>' +
    '<rect x="22" y="75" width="56" height="8" rx="4" fill="#5a3a24" transform="rotate(-12 50 79)"/><rect x="22" y="75" width="56" height="8" rx="4" fill="#4a2f1d" transform="rotate(12 50 79)"/></svg>'
  var EIFFEL = '<svg viewBox="0 0 60 120" aria-hidden="true"><path d="M30 2L32 20L34 40L38 62L44 84L56 118H44Q30 96 16 118H4L16 84L22 62L26 40L28 20Z" fill="#0a0d22" stroke="#8ab4ff" stroke-width=".8" stroke-opacity=".55"/><rect x="20" y="60" width="20" height="3" fill="#0a0d22" stroke="#8ab4ff" stroke-width=".6" stroke-opacity=".5"/><rect x="13" y="83" width="34" height="4" fill="#0a0d22" stroke="#8ab4ff" stroke-width=".6" stroke-opacity=".5"/><circle cx="30" cy="3" r="1.6" fill="#ffd36b"/></svg>'
  var TORRE = '<svg viewBox="0 0 40 120" aria-hidden="true"><g fill="#070a1a" stroke="#f4ecd2" stroke-width=".6" stroke-opacity=".35"><path d="M20 0L28 15H12Z"/><rect x="12" y="15" width="16" height="12"/><rect x="8" y="27" width="24" height="17"/><rect x="10" y="44" width="20" height="76"/></g><path d="M14 31h4v9h-4zM22 31h4v9h-4z" fill="#ffd98a" opacity=".55"/><rect x="18" y="60" width="4" height="7" fill="#ffd98a" opacity=".4"/></svg>'
  var VELAS = '<svg viewBox="0 0 90 60" aria-hidden="true">' + [[14, 26], [42, 18], [70, 30]].map(function (v) {
    return '<circle cx="' + (v[0] + 4) + '" cy="' + (v[1] - 6) + '" r="9" fill="#f8d874" opacity=".18"/><g class="b-fl"><ellipse cx="' + (v[0] + 4) + '" cy="' + (v[1] - 6) + '" rx="3" ry="6" fill="#ffb347"/><ellipse cx="' + (v[0] + 4) + '" cy="' + (v[1] - 5) + '" rx="1.4" ry="3" fill="#fff6c8"/></g><rect x="' + v[0] + '" y="' + v[1] + '" width="8" height="' + (60 - v[1]) + '" rx="2" fill="#f4ecd2"/>'
  }).join('') + '</svg>'
  /* Navidad: arbol grande con estrella y bolas que parpadean, arboles nevados al fondo y regalos (escena de 300x150, abajo a la derecha) */
  function pino(x, base, alto, ancho, color, nieve) {
    var t = '', n = 4
    for (var i = 0; i < n; i++) {
      var y0 = base - alto * (i / n) * .92, y1 = base - alto * ((i + 1.45) / n) * .92, w = ancho * (1 - i / (n + .6))
      t += '<path d="M' + (x - w / 2) + ' ' + y0.toFixed(1) + 'Q' + x + ' ' + (y0 + 4).toFixed(1) + ' ' + (x + w / 2) + ' ' + y0.toFixed(1) + 'L' + x + ' ' + Math.max(base - alto, y1).toFixed(1) + 'Z" fill="' + color + '"/>'
      if (nieve) t += '<path d="M' + (x - w / 2 + 2) + ' ' + (y0 - 1).toFixed(1) + 'Q' + x + ' ' + (y0 + 2.5).toFixed(1) + ' ' + (x + w / 2 - 2) + ' ' + (y0 - 1).toFixed(1) + '" stroke="#e8f0ff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".75"/>'
    }
    return t
  }
  function regalo(x, y, w, h, c, lazo) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + c + '"/><rect x="' + (x - 1) + '" y="' + y + '" width="' + (w + 2) + '" height="' + (h * .22) + '" rx="1" fill="' + c + '" opacity=".85"/>' +
      '<rect x="' + (x + w / 2 - 1.6) + '" y="' + y + '" width="3.2" height="' + h + '" fill="' + lazo + '"/>' +
      '<path d="M' + (x + w / 2) + ' ' + y + 'c-5 -6 -9 -1 -6 1zM' + (x + w / 2) + ' ' + y + 'c5 -6 9 -1 6 1z" fill="' + lazo + '"/>'
  }
  /* Papa Noel volando hacia la izquierda: trineo con patin rizado, saco de regalos, gorro con borla, barba y riendas;
     tres renos al galope con astas (el primero, con la nariz roja que brilla). Silueta con borde de luz */
  var PAPA = (function () {
    function reno(x, y, rojo) {
      return '<g transform="translate(' + x + ' ' + y + ')">' +
        '<path d="M0 6C1 4 3 3 5 3.5L7 4.5C8 6 9 7 11 7C14 6 19 6 22 7C24 7.5 25 9 25 10.5L27 9.5L26.5 11.5C25.5 12 24.5 12.3 24 12.5L26 17L24.5 17.5L22 13.2C19 13.8 15 13.8 12 13.3L9 17.5L7.5 17L9.6 12.4C8 11.5 7 10 6.5 8.5C5 8 3 7.8 1.5 7.6Z"/>' +
        '<path d="M5 3.6L4 .5M4.4 1.6L2.4 .6M4.6 2.2L6.6 0M5.9 1.2L7.6 1.4" fill="none" stroke-width=".8"/>' +
        '<path d="M12 9.5H21" stroke="#f8d874" stroke-opacity=".55" stroke-width=".7" fill="none"/>' +
        (rojo ? '<circle class="b-rud" cx="0.6" cy="6.6" r="1.6" fill="#ff4d5e" stroke="none"/>' : '') + '</g>'
    }
    return '<svg viewBox="-2 -3 108 36" aria-hidden="true"><g fill="#070a18" stroke="#c9d6ff" stroke-opacity=".6" stroke-width=".45" stroke-linejoin="round">' +
      reno(0, 6, 1) + reno(23, 4) + reno(46, 6) +
      /* riendas */
      '<path d="M8 10Q30 7 48 11Q62 13 76 12" fill="none" stroke-opacity=".5" stroke-width=".5"/>' +
      /* saco */
      '<path d="M91 15Q90 5 96 4.5Q102 5 100 15Z"/><path d="M93 6.5Q96 8 99 6.5" fill="none" stroke="#f8d874" stroke-opacity=".5" stroke-width=".6"/>' +
      /* Papa Noel: cuerpo, cabeza, gorro con borla, barba y brazo con las riendas */
      '<path d="M79 15Q79 7 84.5 6Q90 7 90 15Z" fill="#2a0c16"/><circle cx="84.5" cy="4.2" r="2.6"/>' +
      '<path d="M82.2 2.6Q85 -2.4 89.6 -.4L91.6 2.8" fill="#2a0c16"/><circle cx="92" cy="3.2" r="1.1" fill="#e8f0ff" stroke="none" opacity=".85"/>' +
      '<path d="M82.4 5.2Q84.6 10 87.4 5.4" fill="#e8f0ff" stroke="none" opacity=".7"/>' +
      '<path d="M80.5 9.5L75.5 11.8" fill="none" stroke-width="1.6"/>' +
      /* trineo */
      '<path d="M72 26L74 16Q75 14 78 14H97Q101 14 102 18L103 26Z"/><path d="M74 16Q69 13 71 9Q73 6.5 75.5 8.5" fill="none" stroke-width="1.2"/>' +
      '<path d="M76 19H100" fill="none" stroke="#f8d874" stroke-opacity=".6" stroke-width=".7"/>' +
      '<path d="M66 29.5Q62.5 29.5 63 26.5Q63.5 24 66.5 25.2M66 29.5H101Q105 29.5 105 25.5" fill="none" stroke-width="1.3"/><path d="M76 26V29.5M98 26V29.5" fill="none" stroke-width="1"/>' +
      '</g></svg>'
  })()
  var ARBOL = (function () {
    var bolas = [[178, 58, '#ff5d6c'], [196, 74, '#f8d874'], [164, 82, '#8ab4ff'], [186, 92, '#c9a6ff'], [206, 104, '#ff5d6c'], [154, 106, '#f8d874'], [176, 114, '#7ee08a'], [214, 124, '#8ab4ff'], [146, 126, '#ff9fc9'], [190, 128, '#f8d874'], [170, 70, '#7ee08a'], [200, 116, '#ff9fc9']]
    return '<svg viewBox="0 0 300 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
      /* arboles del fondo (oscuros, con nieve) */
      pino(46, 150, 62, 40, '#152c47', 1) + pino(88, 150, 84, 52, '#183552', 1) + pino(118, 150, 52, 34, '#132941', 1) + pino(262, 150, 70, 44, '#152c47', 1) +
      /* resplandor y arbol grande */
      '<ellipse cx="180" cy="96" rx="70" ry="58" fill="#f8d874" opacity=".08"/>' +
      '<rect x="174" y="132" width="12" height="14" fill="#5a3a24"/>' +
      pino(180, 136, 118, 96, '#1f6b4a', 0) +
      '<path d="M150 112Q180 124 212 108M158 88Q182 98 204 84M166 64Q182 72 196 60" stroke="#f8d874" stroke-width="1.4" fill="none" opacity=".8"/>' +
      bolas.map(function (b, i) { return '<circle class="b-tw" style="animation-delay:' + (i * .37 % 2.4).toFixed(2) + 's" cx="' + b[0] + '" cy="' + b[1] + '" r="3.2" fill="' + b[2] + '"/>' }).join('') +
      /* estrella en la punta */
      '<g class="b-st"><circle cx="180" cy="17" r="13" fill="#f8d874" opacity=".22"/><path d="M180 5L183.5 13.5 192.5 14 185.5 19.6 187.9 28.4 180 23.4 172.1 28.4 174.5 19.6 167.5 14 176.5 13.5Z" fill="#ffe27a" stroke="#fff3b0" stroke-width=".6"/></g>' +
      /* regalos */
      regalo(140, 132, 18, 14, '#c9405a', '#f8d874') + regalo(160, 138, 14, 10, '#8a6bd6', '#fff') + regalo(196, 134, 20, 12, '#2f7fb5', '#ff9fc9') + regalo(218, 139, 13, 9, '#f8d874', '#c9405a') + regalo(126, 140, 12, 8, '#3a9a6a', '#fff') +
      '</svg>'
  })()
  /* Reyes: desierto con dunas, palmeras, el portal de Belen iluminado, la estrella delante guiando y los tres Reyes en camello */
  function camello(x, y, sc, corona, capa, d) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><g class="b-cam" style="animation-delay:' + d + 's">' +
      /* camello mirando a la izquierda (hacia la estrella) */
      '<path d="M6 14C4 12 5 9 8 9L12 10C14 11 15 14 15 17C16 21 18 23 22 23C25 16 31 13 36 16C40 18 44 19 47 21C50 22 51 25 50 28L49 33L50 45H48L46 34H44V45H42L41 33H27L26 45H24L23 34H21L20 45H18V32C15 30 13 26 12 22C11 19 10 16 8 16Z" fill="#120c1c"/>' +
      '<path d="M43 22C46 24 47 27 47 30" stroke="#120c1c" stroke-width="1.4" fill="none"/>' +
      /* manta y rey con corona y capa al viento */
      '<path d="M26 18H41L40 24H27Z" fill="' + capa + '" opacity=".75"/>' +
      '<path d="M37 9C42 11 45 15 47 20L39 16Z" fill="' + capa + '" opacity=".85"/>' +
      '<path d="M29 16C29 10 31.5 6.5 33.5 6.5C35.5 6.5 38 10 38 16Z" fill="#120c1c"/><circle cx="33.5" cy="4.6" r="2.4" fill="#120c1c"/>' +
      '<path d="M31.2 3.1L31.6 0.4L32.6 2L33.5 -0.3L34.4 2L35.4 0.4L35.8 3.1Z" fill="' + corona + '"/>' +
      '</g></g>'
  }
  function palmera(x, y, sc) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')" fill="#150e1f"><path d="M0 0C1 -14 3 -26 7 -36L9 -35C6 -25 4 -13 3 0Z"/>' +
      '<path d="M8 -36C2 -40 -6 -38 -10 -33C-4 -36 2 -36 8 -35ZM8 -36C14 -42 22 -40 25 -34C19 -37 13 -37 8 -35ZM8 -36C6 -44 0 -48 -6 -47C0 -45 5 -41 8 -36ZM8 -36C12 -45 19 -48 24 -45C18 -44 12 -41 8 -36ZM8 -36C3 -34 -2 -28 -3 -22C1 -27 5 -32 8 -35ZM8 -36C13 -33 17 -27 17 -21C14 -27 11 -31 8 -35Z"/></g>'
  }
  var DESIERTO = '<svg viewBox="0 0 400 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
    '<defs><radialGradient id="bnBel"><stop offset="0" stop-color="#ffd98a"/><stop offset="1" stop-color="#ff9a4d" stop-opacity="0"/></radialGradient></defs>' +
    /* estrella con su cola, delante de los Reyes, sobre el portal */
    '<g class="b-st2"><path d="M96 26L150 6" stroke="#ffe9a8" stroke-width="1.2" opacity=".35"/><path d="M96 26L144 14" stroke="#ffe9a8" stroke-width=".7" opacity=".25"/>' +
    '<circle cx="96" cy="26" r="16" fill="#ffe9a8" opacity=".14"/><circle cx="96" cy="26" r="7" fill="#ffe9a8" opacity=".3"/>' +
    '<path d="M96 12L98.2 23.8 110 26 98.2 28.2 96 40 93.8 28.2 82 26 93.8 23.8Z" fill="#fff6d6"/><path d="M96 19L97.4 24.6 103 26 97.4 27.4 96 33 94.6 27.4 89 26 94.6 24.6Z" fill="#ffe27a" transform="rotate(45 96 26)"/></g>' +
    /* rayo de luz hasta el portal */
    '<path d="M96 34L82 118H110Z" fill="#ffe9a8" opacity=".06"/>' +
    /* portal de Belen */
    '<ellipse cx="96" cy="116" rx="34" ry="14" fill="url(#bnBel)" opacity=".55"/>' +
    /* establo: tejado de paja sobre postes de madera, abierto por delante, con el pesebre iluminado, el buey y la mula */
    '<rect x="72" y="99" width="48" height="25" fill="#1a1018"/>' +
    '<path d="M72 106H120M72 112H120M72 118H120" stroke="#2a1c22" stroke-width=".8"/>' +
    '<ellipse cx="96" cy="114" rx="22" ry="11" fill="#ffcf7a" opacity=".55"/><ellipse cx="96" cy="115" rx="12" ry="6" fill="#ffe9b8" opacity=".6"/>' +
    /* mula (izquierda) y buey (derecha), en silueta contra la luz */
    '<path d="M76 124V112Q76 106 81 105L80 100L82 103L83 99.5L84.5 104Q88 105 88 109L86 111Q84 110 83 112V124Z" fill="#120a14"/>' +
    '<path d="M117 124V113Q117 108 112 107Q109 106 107 108L105 106L104.5 108.5Q104 111 106 112L108 113V124Z" fill="#120a14"/><path d="M108 107.5Q105 104 103 105M112.5 107Q114 103 116.5 104" stroke="#120a14" stroke-width="1.2" fill="none"/>' +
    /* pesebre con paja */
    '<path d="M89 117H103L101 121H91Z" fill="#3a2614"/><path d="M90.5 121L89 124M101.5 121L103 124" stroke="#3a2614" stroke-width="1.1"/>' +
    '<path d="M89.5 117Q92 114.5 94 116.5Q96 114 98.5 116.3Q100.5 114.6 102.5 117Z" fill="#f2c96a"/>' +
    /* postes y tejado de paja */
    '<path d="M70 124V100M84 124V97M108 124V97M122 124V100" stroke="#2c1c12" stroke-width="2.6"/>' +
    '<path d="M60 102L96 83L132 102L128 105L96 88L64 105Z" fill="#3b2a1c"/>' +
    '<path d="M66 100L69 104M72 97L75 101M78 94L81 98M84 91L87 95M90 88L92 92M100 88L102 92M106 91L108 95M112 94L114 98M118 97L120 101M124 100L126 104" stroke="#8a6638" stroke-width=".8" opacity=".8"/>' +
    '<path d="M60 102L96 83L132 102" stroke="#c9a060" stroke-width=".9" fill="none" opacity=".5"/>' +
    '<path d="M74 124L78 121M80 124L82 121.5M110 124L113 121M116 124L118 121.5" stroke="#d8b064" stroke-width=".7" opacity=".7"/>' +
    palmera(134, 126, 1.05) + palmera(48, 128, .85) + palmera(338, 130, .95) +
    /* los tres Reyes, caminando hacia la estrella */
    camello(146, 72, 1.18, '#f8d874', '#c9405a', 0) + camello(210, 75, 1.12, '#f8d874', '#3f7fc9', .45) + camello(270, 78, 1.06, '#f8d874', '#3a9a6a', .9) +
    '</svg>'
  var DUNAS2 = '<svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M0 30Q70 12 150 26T300 22T400 18V60H0Z" fill="#3a2838"/><path d="M0 30Q70 12 150 26T300 22T400 18" stroke="#e8b47a" stroke-width=".8" fill="none" opacity=".35"/>' +
    '<path d="M0 44Q90 28 200 40T400 34V60H0Z" fill="#2a1d2c"/><path d="M0 44Q90 28 200 40T400 34" stroke="#e8b47a" stroke-width=".7" fill="none" opacity=".25"/>' +
    '<path d="M0 54Q120 44 250 52T400 48V60H0Z" fill="#1d1420"/></svg>'
  /* Carnaval como un escenario (el Gran Teatro Falla de Cadiz): bambalina roja con fleco dorado y mascaras, telones a los lados, focos y candilejas */
  var BAMBALINA = '<svg viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bnTel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a0f1f"/><stop offset="1" stop-color="#b3192f"/></linearGradient></defs>' +
    '<path d="M0 0H400V14' + (function () { var d = ''; for (var i = 20; i >= 0; i--) d += 'Q' + (i * 20 + 10) + ' 24 ' + (i * 20) + ' 14'; return d })() + 'Z" fill="url(#bnTel)"/>' +
    '<path d="M0 14' + (function () { var d = ''; for (var i = 0; i < 20; i++) d += 'Q' + (i * 20 + 10) + ' 24 ' + (i * 20 + 20) + ' 14'; return d })() + '" stroke="#f8d874" stroke-width="1.6" fill="none"/>' +
    '<path d="M0 3H400" stroke="#f8d874" stroke-width=".8" opacity=".6"/></svg>'
  function telon(der) {
    return '<svg viewBox="0 0 60 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bnTl' + (der ? 'd' : 'i') + '" x1="0" x2="1"><stop offset="0" stop-color="#6a0c1a"/><stop offset=".25" stop-color="#b3192f"/><stop offset=".5" stop-color="#7a0f1f"/><stop offset=".75" stop-color="#c22038"/><stop offset="1" stop-color="#6a0c1a"/></linearGradient></defs>' +
      '<g' + (der ? '' : ' transform="translate(60 0) scale(-1 1)"') + '><path d="M60 0H8Q14 40 30 66Q38 78 60 84Z" fill="url(#bnTl' + (der ? 'd' : 'i') + ')"/><path d="M60 84Q40 92 34 150H60Z" fill="url(#bnTl' + (der ? 'd' : 'i') + ')"/>' +
      '<path d="M30 66Q44 70 60 70" stroke="#f8d874" stroke-width="2.2" fill="none"/><circle cx="31" cy="67" r="3" fill="#f8d874"/><path d="M31 69L28 80M31 69L33 80" stroke="#f8d874" stroke-width="1.2"/></g></svg>'
  }
  var MASCARAS = '<svg viewBox="0 0 60 30" aria-hidden="true"><g fill="#f8d874" stroke="#7a0f1f" stroke-width=".6">' +
    '<path d="M6 4Q18 0 28 5Q28 18 17 26Q6 18 6 4Z"/><path d="M34 6Q44 1 55 6Q55 19 44 27Q34 19 34 6Z"/></g>' +
    '<g fill="#7a0f1f"><path d="M10 10Q12 8 14 10Q12 12 10 10ZM20 10Q22 8 24 10Q22 12 20 10Z"/><path d="M11 16Q17 23 23 16Q17 19 11 16Z"/>' +
    '<path d="M38 12Q40 10 42 12Q40 13 38 12ZM47 12Q49 10 51 12Q49 13 47 12Z"/><path d="M39 21Q44 16 50 21Q44 19 39 21Z"/></g></svg>'
  var ESCENARIO = '<svg viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bnTab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3420"/><stop offset="1" stop-color="#2a170e"/></linearGradient></defs>' +
    '<rect y="6" width="400" height="14" fill="url(#bnTab)"/><path d="M0 6H400" stroke="#f8d874" stroke-width="1" opacity=".7"/>' +
    (function () { var d = ''; for (var i = 1; i < 16; i++) d += '<path d="M' + (i * 25) + ' 7V20" stroke="#1d0f08" stroke-width=".6"/>'; for (i = 0; i < 20; i++) d += '<ellipse class="b-cand" style="animation-delay:' + (i * .13).toFixed(2) + 's" cx="' + (i * 20 + 10) + '" cy="6" rx="5" ry="2.4" fill="#ffe9a8"/>'; return d })() + '</svg>'
  var FOCOS = '<svg viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bnFoco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></linearGradient></defs>' +
    '<g class="b-foco"><path d="M250 0L262 0L330 150H270Z" fill="url(#bnFoco)"/></g><g class="b-foco b-foco2"><path d="M380 0L392 0L320 150H262Z" fill="url(#bnFoco)"/></g></svg>'
  /* ---------- Semana Santa en espanol: ciudad antigua al fondo, el Calvario con olivos y tres cruces (la de Cristo con la
     sabana y el INRI, iluminada), y una procesion: cruz de guia con incienso, nazarenos con velas y un paso de palio ---------- */
  function nazareno(x, y, sc, d, tunica) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">' +
      '<path d="M0 -38L-4.5 -22H4.5Z" fill="' + tunica + '"/><path d="M0 -38L-1.2 -24" stroke="#ffffff" stroke-opacity=".08" stroke-width="1"/>' +
      '<path d="M-4.5 -22Q-6 -14 -8 0H8Q6 -14 4.5 -22Z" fill="' + tunica + '"/><path d="M-3 -21Q-4 -10 -5 0M2.5 -21Q3.5 -10 4.5 0" stroke="#000" stroke-opacity=".25" stroke-width=".7" fill="none"/>' +
      '<path d="M-5.4 -14H5.4" stroke="#d8c8a0" stroke-width=".9" opacity=".7"/>' +
      '<circle cx="-1.6" cy="-27" r=".7" fill="#000"/><circle cx="1.6" cy="-27" r=".7" fill="#000"/>' +
      '<path d="M-6.5 -11H-4.5" stroke="' + tunica + '" stroke-width="2.2"/><rect x="-8" y="-24" width="1.6" height="13" rx=".6" fill="#efe3c4"/>' +
      '<circle cx="-7.2" cy="-26" r="7" fill="#ffd98a" opacity=".14"/>' +
      '<g class="b-fl" style="animation-delay:' + d + 's"><ellipse cx="-7.2" cy="-26.2" rx="1.4" ry="2.8" fill="#ffb347"/><ellipse cx="-7.2" cy="-25.8" rx=".6" ry="1.3" fill="#fff4c8"/></g></g>'
  }
  function olivo(x, y, sc) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M0 0C-1 -6 2 -9 0 -14C-1 -17 1 -19 2 -21M0 -12C3 -14 5 -15 7 -18" stroke="#1a1410" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<g fill="#1f2c26"><ellipse cx="-4" cy="-22" rx="7" ry="4.5"/><ellipse cx="4" cy="-25" rx="8" ry="5"/><ellipse cx="9" cy="-20" rx="5.5" ry="3.6"/><ellipse cx="-1" cy="-28" rx="5" ry="3.4"/></g>' +
      '<g fill="#3d5246" opacity=".6"><ellipse cx="2" cy="-27" rx="3" ry="1.2"/><ellipse cx="-5" cy="-23" rx="2.4" ry="1"/><ellipse cx="8" cy="-21.5" rx="2.2" ry=".9"/></g></g>'
  }
  function cruz(x, y, h, w, g) {
    return '<rect x="' + (x - g / 2) + '" y="' + (y - h) + '" width="' + g + '" height="' + h + '" fill="#0b0816"/><rect x="' + (x - w / 2) + '" y="' + (y - h * .78) + '" width="' + w + '" height="' + (g * .95) + '" fill="#0b0816"/>'
  }
  var PASO = (function () {
    var x0 = 304, t = ''
    /* palio: varales, techo con caida y bambalinas con fleco */
    for (var i = 0; i < 6; i++) t += '<path d="M' + (x0 + 4 + i * 11) + ' 128V92" stroke="#d8b064" stroke-width=".9"/>'
    t += '<path d="M' + (x0 - 2) + ' 92H' + (x0 + 66) + 'V99Q' + (x0 + 60) + ' 102 ' + (x0 + 55) + ' 99Q' + (x0 + 49) + ' 102 ' + (x0 + 44) + ' 99Q' + (x0 + 38) + ' 102 ' + (x0 + 33) + ' 99Q' + (x0 + 27) + ' 102 ' + (x0 + 22) + ' 99Q' + (x0 + 16) + ' 102 ' + (x0 + 11) + ' 99Q' + (x0 + 5) + ' 102 ' + (x0 - 2) + ' 99Z" fill="#3a0f22"/>'
    t += '<path d="M' + (x0 - 2) + ' 95H' + (x0 + 66) + '" stroke="#d8b064" stroke-width=".7"/>'
    /* imagen de la Virgen bajo el palio: manto en cono con corona */
    t += '<path d="M' + (x0 + 32) + ' 104L' + (x0 + 24) + ' 128H' + (x0 + 40) + 'Z" fill="#141022"/><circle cx="' + (x0 + 32) + '" cy="104" r="2.4" fill="#141022"/><path d="M' + (x0 + 29) + ' 101.5L' + (x0 + 30) + ' 99L' + (x0 + 32) + ' 100.5L' + (x0 + 34) + ' 99L' + (x0 + 35) + ' 101.5Z" fill="#f8d874"/>'
    t += '<circle cx="' + (x0 + 32) + '" cy="110" r="14" fill="#ffd98a" opacity=".12"/>'
    /* candeleria: velas en gradas con llamas */
    for (var r = 0; r < 3; r++) for (var c = 0; c < 6 - r; c++) {
      var cx = x0 + 6 + r * 4 + c * (52 - r * 8) / (5 - r || 1) * (r === 2 ? .9 : 1), cy = 128 - r * 4
      if (Math.abs(cx - (x0 + 32)) < 7) continue
      t += '<rect x="' + (cx - .7) + '" y="' + (cy - 6) + '" width="1.4" height="6" fill="#efe3c4"/><g class="b-fl" style="animation-delay:' + ((r * 6 + c) * .17 % 1.1).toFixed(2) + 's"><ellipse cx="' + cx + '" cy="' + (cy - 7.2) + '" rx=".9" ry="1.8" fill="#ffc35c"/></g>'
    }
    /* canasto y faldon de terciopelo con fleco dorado; pies de los costaleros */
    t += '<rect x="' + (x0 - 4) + '" y="128" width="72" height="5" fill="#d8b064"/><path d="M' + (x0 - 4) + ' 133H' + (x0 + 68) + 'V142H' + (x0 - 4) + 'Z" fill="#4a1229"/><path d="M' + (x0 - 4) + ' 142H' + (x0 + 68) + '" stroke="#d8b064" stroke-width="1.1" stroke-dasharray="1.2 1"/>'
    for (var k = 0; k < 8; k++) t += '<path d="M' + (x0 + 2 + k * 8.5) + ' 143V148" stroke="#0e0a14" stroke-width="2.4"/>'
    return t
  })()
  var CALVARIO = '<svg viewBox="0 0 400 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
    '<defs><radialGradient id="bnCruz"><stop offset="0" stop-color="#fff2cf" stop-opacity=".6"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient></defs>' +
    /* ciudad antigua al fondo: murallas, cupulas y torres */
    '<path d="M0 150V128H14V120H20V128H34Q40 116 46 128H58V122H64V114H68V122H74V128H170V124H182Q188 112 194 124H206V118H210V110L213 104L216 110V118H220V124H238V128H252Q258 119 264 128H400V150Z" fill="#110d22"/>' +
    '<g fill="#ffd98a" opacity=".35"><rect x="17" y="124" width="1.4" height="2"/><rect x="61" y="118" width="1.4" height="2"/><rect x="212" y="114" width="1.4" height="2"/><rect x="186" y="126" width="1.4" height="2"/></g>' +
    /* resplandor y rayos detras de la cruz de Cristo */
    '<circle class="b-halo" cx="110" cy="56" r="48" fill="url(#bnCruz)"/>' +
    '<g stroke="#fff2cf" stroke-width=".7" opacity=".24">' + (function () { var t = ''; for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283; t += '<path d="M' + (110 + Math.cos(a) * 14).toFixed(1) + ' ' + (56 + Math.sin(a) * 14).toFixed(1) + 'L' + (110 + Math.cos(a) * (i % 2 ? 40 : 52)).toFixed(1) + ' ' + (56 + Math.sin(a) * (i % 2 ? 40 : 52)).toFixed(1) + '"/>' } return t })() + '</g>' +
    /* el monte con olivos */
    '<path d="M24 150Q66 106 110 98Q156 106 200 150Z" fill="#0d0a1c"/><path d="M50 132Q86 106 110 102Q136 106 172 132" stroke="#3a2c4a" stroke-width=".8" fill="none" opacity=".6"/>' +
    olivo(54, 138, .8) + olivo(166, 140, .85) + olivo(40, 146, .6) +
    /* las tres cruces; la central con el INRI y la sabana */
    cruz(86, 106, 34, 16, 3) + cruz(134, 106, 34, 16, 3) + cruz(110, 102, 68, 32, 4.8) +
    '<rect x="105" y="37" width="10" height="5" rx=".6" fill="#d8c8a0"/><text x="110" y="40.8" font-size="3.4" text-anchor="middle" fill="#3a2a1a" font-family="Georgia,serif">INRI</text>' +
    '<path d="M95 50Q102 57 110 52Q118 57 125 50L126.5 55Q121 64 117 61Q114 72 110 64Q106 72 103 61Q99 64 93.5 55Z" fill="#f2ead8" opacity=".92"/>' +
    '<path d="M103 61Q106 66 110 64M117 61Q114 66 110 64" stroke="#cfc3a8" stroke-width=".5" fill="none"/>' +
    /* procesion: cruz de guia con incensario, nazarenos de morado y negro, y el paso de palio */
    '<g transform="translate(206 146) scale(.95)"><path d="M0 -38L-4.5 -22H4.5Z" fill="#2a1440"/><path d="M-4.5 -22Q-6 -14 -8 0H8Q6 -14 4.5 -22Z" fill="#2a1440"/><path d="M-6 -12L-7 -48M-11 -42H-3" stroke="#d8b064" stroke-width="1.6"/></g>' +
    '<g class="b-humo"><circle cx="196" cy="128" r="3" fill="#cfc6d8" opacity=".25"/><circle cx="194" cy="122" r="4" fill="#cfc6d8" opacity=".18"/><circle cx="191" cy="115" r="5" fill="#cfc6d8" opacity=".12"/></g>' +
    '<path d="M198 136V130" stroke="#d8b064" stroke-width=".8"/><circle cx="198" cy="137" r="1.6" fill="#d8b064"/>' +
    nazareno(224, 147, .93, .35, '#120a18') + nazareno(240, 146, .95, .7, '#2a1440') + nazareno(256, 147, .92, .2, '#120a18') + nazareno(272, 146, .94, .55, '#2a1440') + nazareno(288, 147, .92, .9, '#120a18') +
    PASO + '</svg>'
  /* ---------- Pascua en otros idiomas: pradera con arboles en flor, valla de madera, tulipanes y margaritas,
     huevos pintados, una cesta, un pollito, mariposas y tres conejitos (uno comiendo una zanahoria y otro saltando) ---------- */
  function huevo(x, y, c1, c2, r, tipo) {
    var dib = tipo === 1 ? '<path d="M-4.6 -1L-3 -2.6L-1.4 -1L0 -2.6L1.6 -1L3 -2.6L4.6 -1" stroke="' + c2 + '" stroke-width="1" fill="none"/><path d="M-4.4 2.6H4.4" stroke="' + c2 + '" stroke-width="1"/>'
      : tipo === 2 ? '<circle cx="-2" cy="-2" r="1" fill="' + c2 + '"/><circle cx="2" cy="0" r="1" fill="' + c2 + '"/><circle cx="-1.4" cy="2.6" r="1" fill="' + c2 + '"/><circle cx="2.2" cy="-3.6" r=".8" fill="' + c2 + '"/>'
      : '<path d="M-4.8 -1Q0 1 4.8 -1M-4.6 2.4Q0 4.4 4.6 2.4" stroke="' + c2 + '" stroke-width="1.1" fill="none"/><circle cy="-3.6" r=".9" fill="' + c2 + '"/>'
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><ellipse rx="5" ry="6.6" fill="' + c1 + '"/>' + dib + '<ellipse cx="-1.8" cy="-3" rx="1.2" ry="2" fill="#fff" opacity=".35"/></g>'
  }
  function conejo(c) {
    return '<g fill="' + c + '"><ellipse cx="0" cy="-8" rx="10" ry="7.5"/><circle cx="-8.5" cy="-14" r="5"/>' +
      '<g class="b-oreja"><ellipse cx="-10" cy="-24" rx="1.9" ry="7" transform="rotate(-12 -10 -24)"/><ellipse cx="-10" cy="-24" rx=".8" ry="5" fill="#ffc6dd" transform="rotate(-12 -10 -24)"/></g><g class="b-oreja b-oreja2"><ellipse cx="-6.6" cy="-24" rx="1.9" ry="7.4" transform="rotate(8 -6.6 -24)"/><ellipse cx="-6.6" cy="-24" rx=".8" ry="5.2" fill="#ffc6dd" transform="rotate(8 -6.6 -24)"/></g>' +
      '<circle cx="10" cy="-9" r="2.8" fill="#fff"/><ellipse cx="-3" cy="-1.4" rx="4" ry="1.6"/><ellipse cx="5" cy="-1.6" rx="3.4" ry="1.6"/></g>' +
      '<circle cx="-10.6" cy="-15" r=".9" fill="#2a1d33"/><circle cx="-10.3" cy="-15.3" r=".3" fill="#fff"/><circle class="b-nariz" cx="-13.2" cy="-13.2" r=".8" fill="#ff9fc9"/>' +
      '<path d="M-13 -12.6L-16 -13.4M-13 -12.2L-16 -11.6" stroke="#cfc3e0" stroke-width=".3"/><ellipse cx="-7" cy="-11" rx="1.6" ry=".8" fill="#ffc6dd" opacity=".6"/>'
  }
  function arbolFlor(x, y, sc) {
    var t = '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">' +
      '<path d="M0 0C-1 -10 2 -18 0 -28M0 -18C4 -21 7 -24 9 -30M0 -22C-4 -25 -7 -28 -9 -33" stroke="#4a3022" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    var bolas = [[-10, -36, 9], [0, -42, 11], [10, -36, 9], [-4, -32, 8], [6, -30, 7], [-14, -30, 6], [14, -30, 6]]
    bolas.forEach(function (b, i) { t += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + ['#ffb7d2', '#ffc6dd', '#ffd9e8'][i % 3] + '"/>' })
    for (var k = 0; k < 26; k++) { var a = k * 2.4, r = 4 + (k * 5) % 12; t += '<circle cx="' + (Math.cos(a) * r).toFixed(1) + '" cy="' + (-36 + Math.sin(a) * r * .7).toFixed(1) + '" r="' + (k % 3 ? .9 : 1.3) + '" fill="' + (k % 2 ? '#fff' : '#ff8fbf') + '" opacity=".85"/>' }
    return t + '</g>'
  }
  function tulipan(x, y, c) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M0 0V-12" stroke="#3f7a52" stroke-width="1"/><path d="M0 -5Q-4 -8 -5 -11Q-1 -9 0 -6" fill="#3f7a52"/><path d="M-3 -12Q-3 -17 0 -18Q3 -17 3 -12Q0 -10 -3 -12Z" fill="' + c + '"/><path d="M0 -18V-12" stroke="#000" stroke-opacity=".15" stroke-width=".5"/></g>'
  }
  function margarita(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M0 0V-7" stroke="#3f7a52" stroke-width=".8"/><g transform="translate(0 -8)">' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<ellipse rx=".9" ry="2.2" cy="-2" fill="#fff" transform="rotate(' + a + ')"/>' }).join('') + '<circle r="1.1" fill="#f8d874"/></g></g>'
  }
  var PASCUA = '<svg viewBox="36 78 364 72" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
    /* colinas y arboles en flor */
    '<path d="M20 150Q90 118 170 128T330 120T400 124V150Z" fill="#1a3428"/>' +
    arbolFlor(210, 128, .8) + arbolFlor(70, 140, 1.05) + arbolFlor(318, 130, .95) +
    '<path d="M40 150Q120 132 200 138T400 132V150Z" fill="#22432f"/>' +
    /* valla de madera */
    '<g stroke="#8a6438" stroke-width="1.4">' + (function () { var t = ''; for (var i = 0; i < 9; i++) t += '<path d="M' + (226 + i * 9) + ' 141V129"/>'; return t })() + '<path d="M224 132H302M224 137H302" stroke-width="1.1"/></g>' +
    /* hierba */
    (function () { var t = ''; for (var i = 0; i < 64; i++) { var x = 40 + i * 5.6, h = 5 + (i * 7) % 7; t += '<path d="M' + x.toFixed(1) + ' 150Q' + (x + 1).toFixed(1) + ' ' + (150 - h) + ' ' + (x + (i % 2 ? 3 : -2)).toFixed(1) + ' ' + (148 - h) + '" stroke="' + (i % 3 ? '#3f7a52' : '#5a9a64') + '" stroke-width="1.2" fill="none"/>' } return t })() +
    /* flores */
    tulipan(100, 148, '#ff5d8a') + tulipan(106, 147, '#f8d874') + tulipan(250, 148, '#c9a6ff') + tulipan(256, 149, '#ff9fc9') + tulipan(356, 148, '#ff5d8a') +
    margarita(88, 147) + margarita(160, 148) + margarita(198, 147) + margarita(280, 148) + margarita(340, 147) + margarita(372, 148) +
    /* huevos pintados y cesta */
    huevo(118, 142, '#ff9fc9', '#fff', -12, 0) + huevo(176, 144, '#8ab4ff', '#f8d874', 10, 1) + huevo(240, 144, '#9be8b0', '#8a6bd6', 14, 2) + huevo(300, 145, '#c9a6ff', '#fff', -10, 1) + huevo(364, 143, '#f8d874', '#ff5d8a', 8, 2) +
    '<g transform="translate(150 146)"><path d="M-11 -8Q0 -24 11 -8" stroke="#c9a060" stroke-width="1.6" fill="none"/>' + huevo(-5, -10, '#ff9fc9', '#fff', -15, 2) + huevo(4, -11, '#8ab4ff', '#fff', 12, 0) + '<path d="M-12 -8H12L9 0H-9Z" fill="#c9a060"/><path d="M-11 -5H11M-10 -2.5H10" stroke="#8a6438" stroke-width=".6"/><path d="M-5 -8L-6 0M0 -8V0M5 -8L6 0" stroke="#8a6438" stroke-width=".5"/></g>' +
    /* pollito */
    '<g transform="translate(196 146)"><ellipse cx="0" cy="-4" rx="4.6" ry="4" fill="#ffe066"/><circle cx="-3" cy="-8.4" r="3" fill="#ffe066"/><path d="M-6 -8.6L-7.6 -8L-6 -7.4Z" fill="#ff9a3c"/><circle cx="-3.8" cy="-9.2" r=".5" fill="#2a1d33"/><path d="M1 -5Q4 -6 4.5 -3" stroke="#f2c94c" stroke-width=".8" fill="none"/></g>' +
    /* conejitos: uno sentado, otro comiendo una zanahoria y otro saltando */
    '<g transform="translate(134 147)"><g class="b-quieto">' + conejo('#ece6ff') + '</g></g>' +
    '<g transform="translate(272 147) scale(-.9 .9)"><g class="b-come">' + conejo('#e8d8c4') + '</g></g><g transform="translate(278 140) rotate(-30)"><path d="M0 0L-7 1.6L0 3Z" fill="#ff8a3c"/><path d="M0 1.5L2 -.8M0 1.5L2.6 1.5" stroke="#5a9a64" stroke-width=".8"/></g>' +
    '<g transform="translate(350 147) scale(.85)"><g class="b-salta">' + conejo('#f5efe0') + '</g></g>' +
    /* mariposas */
    '<g class="b-mari" style="--mx:30px"><g transform="translate(120 98)"><g class="b-ala"><path d="M0 0Q-5 -6 -7 -1Q-5 3 0 0ZM0 0Q5 -6 7 -1Q5 3 0 0Z" fill="#ff9fc9"/></g><path d="M0 -2V2" stroke="#2a1d33" stroke-width=".6"/></g></g>' +
    '<g class="b-mari" style="--mx:-40px;animation-delay:-3s"><g transform="translate(290 92)"><g class="b-ala" style="animation-delay:-.1s"><path d="M0 0Q-5 -6 -7 -1Q-5 3 0 0ZM0 0Q5 -6 7 -1Q5 3 0 0Z" fill="#f8d874"/></g><path d="M0 -2V2" stroke="#2a1d33" stroke-width=".6"/></g></g>' +
    '</svg>'
  /* suelo a todo el ancho del banner para que la escena no se corte: pradera (Pascua) y ciudad (Semana Santa en espanol) */
  /* pradera: casi a ras de suelo bajo el texto (izquierda) y creciendo hacia la escena (derecha), para que se lea la frase */
  var PRADO = '<svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 36Q120 34 220 24T400 14V40H0Z" fill="#1a3428"/><path d="M0 38Q140 36 260 28T400 22V40H0Z" fill="#22432f"/>' +
    (function () { var t = ''; for (var i = 0; i < 130; i++) { var x = i * 3.1, k = Math.max(0, (x - 120) / 280), h = 1.5 + k * (8 + (i * 7) % 6); t += '<path d="M' + x.toFixed(1) + ' 40L' + (x + (i % 2 ? 1.2 : -.9)).toFixed(1) + ' ' + (40 - h - 2 - k * 6).toFixed(1) + '" stroke="' + (i % 3 ? '#3f7a52' : '#5a9a64') + '" stroke-width="1"/>' } return t })() + '</svg>'
  var SUELO_SS = '<svg viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8H14V2H20V8H34Q40 -2 46 8H58V4H64V8H400V30H0Z" fill="#110d22"/><path d="M0 22H400V30H0Z" fill="#0d0a1c"/></svg>'
  /* ---------- Feria de Abril (escena de 440x140): noria al fondo, portada con bombillas y banderines, casetas con farolillos,
     geranios y una pareja bailando sevillanas, tiovivo con caballitos, guitarrista, bailaora girando y un caballo con
     jinete y una flamenca a la grupa ---------- */
  function bombillas(pts, d0, col) {
    return pts.map(function (q, i) { return '<circle class="b-bomb" style="animation-delay:' + ((d0 + i * .19) % 1.6).toFixed(2) + 's" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (q[2] || 1) + '" fill="' + (q[3] || col || '#ffe27a') + '"/>' }).join('')
  }
  function linea(x0, y0, x1, y1, paso) { var n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / paso)), r = []; for (var i = 0; i <= n; i++) r.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]); return r }
  function arcoPts(cx, base, w, h, paso) {
    var r = w / 2, pts = [], top = base - h + r
    for (var i = 0; i <= 10; i++) { var a = Math.PI - i / 10 * Math.PI; pts.push([cx + Math.cos(a) * (r + 1.8), top - Math.sin(a) * (r + 1.8)]) }
    return pts.concat(linea(cx - r - 1.8, top, cx - r - 1.8, base, paso), linea(cx + r + 1.8, top, cx + r + 1.8, base, paso))
  }
  var PORTADA = (function () {
    var t = '<g>', bs = []
    /* cuerpo: alas laterales, cuerpo central con remate y pinaculos */
    t += '<path d="M10 150V70H20V60L25 52L30 60V70H42V48H50V40L56 30L64 22L72 30L78 40V48H86V70H98V60L103 52L108 60V70H118V150Z" fill="#2a1830"/>'
    t += '<path d="M10 70H118M42 48H86M10 98H118M42 70V150M86 70V150" stroke="#6a4a64" stroke-width=".6" fill="none"/>'
    /* rombos decorativos en los paneles */
    ;[[26, 84], [102, 84], [64, 58]].forEach(function (c) { t += '<path d="M' + c[0] + ' ' + (c[1] - 7) + 'L' + (c[0] + 7) + ' ' + c[1] + 'L' + c[0] + ' ' + (c[1] + 7) + 'L' + (c[0] - 7) + ' ' + c[1] + 'Z" fill="#3a2440" stroke="#f8d874" stroke-width=".5"/>'; bs.push([c[0], c[1], 1.6, '#ff5d6c']) })
    /* arcos */
    ;[[26, 150, 18, 44], [64, 150, 30, 70], [102, 150, 18, 44]].forEach(function (a) {
      var r = a[2] / 2, top = a[1] - a[3] + r
      t += '<path d="M' + (a[0] - r) + ' ' + a[1] + 'V' + top + 'A' + r + ' ' + r + ' 0 0 1 ' + (a[0] + r) + ' ' + top + 'V' + a[1] + 'Z" fill="#0f0a16"/>'
      t += '<path d="M' + (a[0] - r) + ' ' + a[1] + 'V' + top + 'A' + r + ' ' + r + ' 0 0 1 ' + (a[0] + r) + ' ' + top + 'V' + a[1] + '" stroke="#f8d874" stroke-width=".5" fill="none" opacity=".6"/>'
      bs = bs.concat(arcoPts(a[0], a[1], a[2], a[3], 4.5))
    })
    /* contorno en bombillas */
    bs = bs.concat(linea(10, 70, 20, 70, 4), linea(20, 60, 25, 52, 3), linea(25, 52, 30, 60, 3), linea(30, 70, 42, 70, 4), linea(42, 48, 50, 48, 4), linea(50, 40, 56, 30, 3.5), linea(56, 30, 64, 22, 3.5), linea(64, 22, 72, 30, 3.5), linea(72, 30, 78, 40, 3.5), linea(78, 48, 86, 48, 4), linea(86, 70, 98, 70, 4), linea(98, 60, 103, 52, 3), linea(103, 52, 108, 60, 3), linea(108, 70, 118, 70, 4), linea(10, 98, 118, 98, 4.2))
    t += bombillas(bs, 0)
    /* banderines en los pinaculos */
    ;[[25, 52], [64, 22], [103, 52]].forEach(function (b, k) { t += '<path d="M' + b[0] + ' ' + b[1] + 'V' + (b[1] - 10) + '" stroke="#d8b064" stroke-width=".6"/><path class="b-band" style="animation-delay:-' + k * .4 + 's" d="M' + b[0] + ' ' + (b[1] - 10) + 'L' + (b[0] + 8) + ' ' + (b[1] - 8) + 'L' + b[0] + ' ' + (b[1] - 6) + 'Z" fill="' + ['#e8423f', '#f8d874', '#2fa35b'][k] + '"/>' })
    return t + '</g>'
  })()
  function geranio(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-3 0H3L2.2 -4H-2.2Z" fill="#b4562e"/><g fill="#3f7a52"><circle cx="-2" cy="-5.5" r="1.8"/><circle cx="2" cy="-5.5" r="1.8"/><circle cy="-6.8" r="1.8"/></g><g fill="#e8423f"><circle cx="-1.6" cy="-7.6" r="1.1"/><circle cx="1.6" cy="-7.8" r="1.1"/><circle cx="0" cy="-9" r="1.1"/></g></g>'
  }
  function caseta(x, w, c, dentro) {
    var y = 150, h = 34, t = '<g>'
    t += '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="#f2ead8"/>'
    for (var i = 0; i < w; i += 7) t += '<rect x="' + (x + i) + '" y="' + (y - h) + '" width="3.5" height="' + h + '" fill="' + c + '"/>'
    /* tejado a dos aguas con rayas y festón */
    t += '<path d="M' + (x - 3) + ' ' + (y - h) + 'L' + (x + w / 2) + ' ' + (y - h - 15) + 'L' + (x + w + 3) + ' ' + (y - h) + 'Z" fill="#f2ead8"/>'
    for (i = 0; i < 6; i++) { var a = (x - 3) + (w + 6) * i / 6, b = (x - 3) + (w + 6) * (i + .5) / 6; t += '<path d="M' + a.toFixed(1) + ' ' + (y - h) + 'L' + (x + w / 2) + ' ' + (y - h - 15) + 'L' + b.toFixed(1) + ' ' + (y - h) + 'Z" fill="' + c + '"/>' }
    var fest = ''; for (var k = 0; k < Math.ceil((w + 6) / 6); k++) fest += 'q3 5 6 0'
    t += '<path d="M' + (x - 3) + ' ' + (y - h) + fest + 'Z" fill="' + c + '"/><path d="M' + (x - 3) + ' ' + (y - h + 1) + fest + '" stroke="#f2ead8" stroke-width=".7" fill="none"/>'
    /* interior iluminado con mesa y sillas, o pareja bailando */
    var ix = x + w * .2, iw = w * .6, iy = y - h + 11
    t += '<rect x="' + ix + '" y="' + iy + '" width="' + iw + '" height="' + (y - iy) + '" fill="#ffcf7a"/><rect x="' + ix + '" y="' + iy + '" width="' + iw + '" height="' + (y - iy) + '" fill="url(#bnCas)"/>'
    t += '<path d="M' + ix + ' ' + iy + 'Q' + (ix + iw * .25) + ' ' + (iy + 8) + ' ' + (ix + 1) + ' ' + (y - 2) + 'V' + iy + 'ZM' + (ix + iw) + ' ' + iy + 'Q' + (ix + iw * .75) + ' ' + (iy + 8) + ' ' + (ix + iw - 1) + ' ' + (y - 2) + 'V' + iy + 'Z" fill="' + c + '" opacity=".9"/>'
    if (dentro === 'baile') {
      var cx = ix + iw / 2
      t += '<g class="b-baile" style="transform-origin:' + (cx - 3) + 'px ' + y + 'px"><path d="M' + (cx - 3) + ' ' + (y - 14) + 'L' + (cx - 8) + ' ' + (y - 1) + 'Q' + (cx - 3) + ' ' + (y + 1) + ' ' + (cx + 2) + ' ' + (y - 1) + 'Z" fill="#7a1222"/><circle cx="' + (cx - 3) + '" cy="' + (y - 16) + '" r="1.7" fill="#2a1712"/><path d="M' + (cx - 4) + ' ' + (y - 13) + 'L' + (cx - 7) + ' ' + (y - 20) + '" stroke="#2a1712" stroke-width=".9"/></g>'
      t += '<g class="b-baile b-baile2" style="transform-origin:' + (cx + 4) + 'px ' + y + 'px"><path d="M' + (cx + 3) + ' ' + y + 'V' + (y - 9) + 'H' + (cx + 5.6) + 'V' + y + 'Z" fill="#1a1216"/><path d="M' + (cx + 2.4) + ' ' + (y - 9) + 'L' + (cx + 3) + ' ' + (y - 15) + 'H' + (cx + 5.6) + 'L' + (cx + 6.2) + ' ' + (y - 9) + 'Z" fill="#1a1216"/><circle cx="' + (cx + 4.3) + '" cy="' + (y - 16.8) + '" r="1.6" fill="#2a1712"/><path d="M' + (cx + 6) + ' ' + (y - 14) + 'L' + (cx + 8.6) + ' ' + (y - 20) + '" stroke="#1a1216" stroke-width=".9"/></g>'
    } else {
      t += '<rect x="' + (ix + iw * .3) + '" y="' + (y - 7) + '" width="' + (iw * .4) + '" height="1.4" fill="#5a3a24"/><path d="M' + (ix + iw * .34) + ' ' + (y - 5.6) + 'V' + y + 'M' + (ix + iw * .66) + ' ' + (y - 5.6) + 'V' + y + '" stroke="#5a3a24" stroke-width=".8"/>' +
        '<path d="M' + (ix + iw * .18) + ' ' + (y - 9) + 'V' + y + 'H' + (ix + iw * .26) + 'M' + (ix + iw * .82) + ' ' + (y - 9) + 'V' + y + 'H' + (ix + iw * .74) + '" stroke="#5a3a24" stroke-width=".8" fill="none"/>'
    }
    /* farolillos colgados delante */
    var cols = ['#2fa35b', '#f2f2f2', '#e8423f', '#f8d874']
    t += '<path d="M' + x + ' ' + (y - h + 4) + 'Q' + (x + w / 2) + ' ' + (y - h + 9) + ' ' + (x + w) + ' ' + (y - h + 4) + '" stroke="#5a4a3a" stroke-width=".4" fill="none"/>'
    for (k = 0; k < 4; k++) { var fx = x + w * (k + .5) / 4, fy = y - h + 5.5 + Math.sin((k + .5) / 4 * Math.PI) * 2.6; t += '<ellipse class="b-bomb" style="animation-delay:' + (k * .3) + 's" cx="' + fx.toFixed(1) + '" cy="' + fy.toFixed(1) + '" rx="1.8" ry="2.3" fill="' + cols[k] + '"/>' }
    t += geranio(x + 2, y) + geranio(x + w - 2, y)
    return t + '</g>'
  }
  var NORIA = (function () {
    var cx = 214, cy = 78, r = 44, t = '<g opacity=".95"><path d="M' + (cx - 26) + ' 150L' + cx + ' ' + cy + 'L' + (cx + 26) + ' 150M' + (cx - 18) + ' 120H' + (cx + 18) + '" stroke="#3a2a44" stroke-width="3" fill="none"/>'
    t += '<g class="b-noria" style="transform-origin:' + cx + 'px ' + cy + 'px"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="#6a5a7a" stroke-width="1.8" fill="none"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" stroke="#6a5a7a" stroke-width=".8" fill="none"/>'
    var cols = ['#ff5d6c', '#f8d874', '#7ee08a', '#8ab4ff', '#c9a6ff', '#ff9fc9']
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * 6.283, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
      t += '<path d="M' + cx + ' ' + cy + 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + '" stroke="#6a5a7a" stroke-width=".7"/>'
      t += '<circle class="b-bomb" style="animation-delay:' + (i * .1).toFixed(2) + 's" cx="' + (cx + Math.cos(a + .2) * r).toFixed(1) + '" cy="' + (cy + Math.sin(a + .2) * r).toFixed(1) + '" r="1.3" fill="' + cols[i % 6] + '"/>'
      if (i % 2 === 0) t += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><g class="b-cabina"><path d="M0 0V3" stroke="#6a5a7a" stroke-width=".6"/><path d="M-4.5 3H4.5L3.6 9H-3.6Z" fill="' + cols[(i / 2) % 6] + '"/><path d="M-5 3H5" stroke="#fff" stroke-width=".6" opacity=".6"/></g></g>'
    }
    return t + '<circle cx="' + cx + '" cy="' + cy + '" r="3.4" fill="#f8d874"/></g></g>'
  })()
  var TIOVIVO = (function () {
    var cx = 382, t = '<g>'
    t += '<path d="M' + (cx - 30) + ' 108L' + cx + ' 90L' + (cx + 30) + ' 108Z" fill="#e8423f"/>'
    for (var i = 0; i < 6; i++) t += '<path d="M' + (cx - 30 + i * 10) + ' 108L' + cx + ' 90L' + (cx - 25 + i * 10) + ' 108Z" fill="#f2ead8"/>'
    var fest = ''; for (var k = 0; k < 10; k++) fest += 'q3 4 6 0'
    t += '<path d="M' + (cx - 30) + ' 108' + fest + 'Z" fill="#f8d874"/><circle cx="' + cx + '" cy="88" r="2" fill="#f8d874"/><path d="M' + cx + ' 88V84" stroke="#f8d874" stroke-width=".7"/>'
    t += '<path d="M' + cx + ' 110V146" stroke="#d8b064" stroke-width="2"/><rect x="' + (cx - 32) + '" y="144" width="64" height="6" rx="2" fill="#5a2a3a"/><path d="M' + (cx - 32) + ' 144H' + (cx + 32) + '" stroke="#f8d874" stroke-width=".8"/>'
    t += bombillas(linea(cx - 29, 113, cx + 29, 113, 5), .3)
    ;[[-20, 0], [0, .5], [20, 1]].forEach(function (c) {
      var hx = cx + c[0]
      t += '<path d="M' + hx + ' 112V144" stroke="#d8b064" stroke-width=".8"/>'
      t += '<g class="b-caballito" style="animation-delay:-' + c[1] + 's"><g transform="translate(' + hx + ' 132)"><path d="M-6 -2Q-6 -5 -2 -5H4L6 -9L8 -8L7 -4Q8 -1 6 0L5 5H3.6L3.4 1H-2.6L-3.6 5H-5L-4.6 0Q-6.4 0 -6 -2Z" fill="#f2ead8"/><path d="M6 -9L5 -6M-6 -2L-9 1" stroke="#e8423f" stroke-width="1"/><path d="M-1 -5H3V-3H-1Z" fill="#e8423f"/></g></g>'
    })
    return t + '</g>'
  })()
  var JINETES = '<g transform="translate(160 150)"><g class="b-cab">' +
    /* caballo andaluz: cuello arqueado, crin larga, cola, manta y bridas */
    '<path d="M8 -22Q10 -29 19 -29H32Q38 -29 40 -23Q41 -17 38 -15L38.6 -7L37.4 0H35.6L36.2 -7L34.6 -14H29.6L30 -7L28.8 0H27L27.6 -7L26 -14H15L14.4 -7L15.6 0H13.8L12.6 -7L12 -14H9.6L10.4 -7L9.4 0H7.6L8.2 -7L7 -15Q5.6 -19 6.4 -21.4Z" fill="#3a2016"/>' +
    '<path d="M8 -22L4.4 -32Q3 -37 0 -36.6L-3.4 -34.4Q-4.8 -32.4 -2.8 -31.4L1.2 -30L5.4 -22Z" fill="#3a2016"/>' +
    '<path d="M3 -36Q7 -31 9 -25Q11 -21 12 -19M4.4 -35Q9 -30 10.6 -24" stroke="#1a0c08" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M40 -23Q47 -20 45 -4Q43 -12 39 -16Z" fill="#1a0c08"/><circle cx="-1.2" cy="-33.6" r=".5" fill="#fff"/>' +
    '<path d="M-2.6 -31.6L6 -24.6" stroke="#d8b064" stroke-width=".5"/>' +
    '<path d="M19 -29H33L32 -24H20Z" fill="#c9405a"/><path d="M20 -24H32" stroke="#f8d874" stroke-width=".8" stroke-dasharray="1 1"/>' +
    /* jinete con traje corto y sombrero cordobes */
    '<path d="M22 -29L23.4 -39.6Q24.4 -41.6 26 -41.6L28 -39.6L29 -29Z" fill="#141018"/><path d="M23.4 -38L28 -38" stroke="#f2ead8" stroke-width=".7"/>' +
    '<path d="M24 -29L22.6 -19.4H25L26 -27Z" fill="#141018"/><path d="M22.6 -19.4L22 -17.6H25.2" stroke="#2a1a10" stroke-width="1.2"/>' +
    '<circle cx="25.8" cy="-43.8" r="2.4" fill="#e8c4a0"/><rect x="21" y="-47" width="9.6" height="1.3" rx=".5" fill="#141018"/><rect x="23.6" y="-50" width="4.4" height="3.2" fill="#141018"/>' +
    '<path d="M23.6 -36L18.6 -31" stroke="#141018" stroke-width="1.5"/><path d="M18.6 -31L6 -25.6" stroke="#d8b064" stroke-width=".4"/>' +
    /* flamenca a la grupa, sentada de lado, con traje de volantes y flor */
    '<path d="M32 -29L33 -38Q34 -40 35.4 -40L37 -38.6L37.4 -29Z" fill="#c9302c"/>' +
    '<path d="M31 -29Q34 -27 30.4 -22Q35 -22 31.6 -16Q37 -16 33.6 -11Q38 -12 40.6 -15Q39 -19 41 -22Q38.6 -25 39.6 -29Z" fill="#c9302c"/>' +
    '<path d="M31 -24Q35 -23 39.4 -24.6M31.4 -18Q35.4 -17 40.4 -18.6M33.6 -12.4Q37 -12 40.4 -14" stroke="#fff" stroke-width=".7" fill="none" opacity=".85"/>' +
    '<g fill="#fff" opacity=".9"><circle cx="34" cy="-34" r=".5"/><circle cx="36" cy="-31" r=".5"/><circle cx="33.6" cy="-26" r=".5"/><circle cx="37" cy="-20.6" r=".5"/><circle cx="35" cy="-15" r=".5"/></g>' +
    '<circle cx="35.4" cy="-42.4" r="2.3" fill="#e8c4a0"/><path d="M33 -43.4Q35 -46.6 38 -43.6Q37.6 -40 37.8 -38.6" fill="#1a1216"/><circle cx="37.6" cy="-44.6" r="1.2" fill="#e8423f"/>' +
    '</g></g>'
  var GUITARRISTA = '<g transform="translate(130 150)">' +
    '<path d="M-6 0V-9H2V0M-6 -9H2" stroke="#5a3a24" stroke-width="1" fill="none"/><path d="M-5 -9V-16" stroke="#5a3a24" stroke-width="1"/>' +
    '<path d="M-4 -9L-2 -20Q-1 -22 1 -22L3 -20L4 -11Z" fill="#141018"/><path d="M2 -10L7 -10L7.4 0" stroke="#141018" stroke-width="1.8" fill="none"/>' +
    '<circle cx="1" cy="-24.4" r="2.4" fill="#e8c4a0"/><path d="M-1.4 -25.6Q1 -28.6 3.4 -25.4" fill="#1a1216"/>' +
    '<g transform="translate(2 -13) rotate(-28)"><path d="M0 0C-4 0 -5 -4.6 -2.4 -6.4C-4 -8 -3.2 -11 0 -11C3.2 -11 4 -8 2.4 -6.4C5 -4.6 4 0 0 0Z" fill="#c98a3c"/><circle cy="-7" r="1.2" fill="#3a2414"/><rect x="-.6" y="-22" width="1.2" height="11" fill="#3a2414"/><rect x="-1.1" y="-25" width="2.2" height="3" rx=".4" fill="#2a1a10"/></g>' +
    '<g class="b-rasgueo"><path d="M2 -19L4.6 -13" stroke="#141018" stroke-width="1.3"/></g>' +
    '</g>' +
    '<g class="b-nota" ><circle cx="140" cy="122" r="1.5" fill="#f8d874"/><path d="M141.4 122v-6" stroke="#f8d874" stroke-width=".7"/></g>' +
    '<g class="b-nota b-nota2"><path d="M136 120v-6l4.6 -1.2v6" stroke="#ffe27a" stroke-width=".7" fill="none"/><circle cx="134.8" cy="120" r="1.3" fill="#ffe27a"/><circle cx="139.4" cy="118.8" r="1.3" fill="#ffe27a"/></g>' +
    '<g class="b-nota b-nota3"><circle cx="146" cy="124" r="1.5" fill="#f8d874"/><path d="M147.4 124v-6l2.4 1" stroke="#f8d874" stroke-width=".7" fill="none"/></g>'
  var BAILAORA = '<g transform="translate(336 150)"><g class="b-giro">' +
    '<path d="M0 -30L-3 -16L3 -16Z" fill="#c9302c"/>' +
    '<path d="M-3 -16Q-9 -10 -11 -2Q-6 0 0 -1Q6 0 11 -2Q9 -10 3 -16Z" fill="#c9302c"/>' +
    '<path d="M-6 -10Q0 -8 6 -10M-9 -5Q0 -2.6 9 -5M-11 -2Q0 1 11 -2" stroke="#fff" stroke-width=".7" fill="none"/>' +
    '<g fill="#fff"><circle cx="-1" cy="-24" r=".45"/><circle cx="1" cy="-20" r=".45"/><circle cx="-4" cy="-12" r=".45"/><circle cx="3" cy="-11" r=".45"/><circle cx="-6" cy="-6" r=".45"/><circle cx="6" cy="-6" r=".45"/><circle cx="0" cy="-7" r=".45"/></g>' +
    '<path d="M-2.4 -26Q-9 -30 -8 -38M2.4 -26Q8 -31 6 -38" stroke="#e8c4a0" stroke-width="1.2" fill="none"/>' +
    '<circle cy="-32.6" r="2.4" fill="#e8c4a0"/><path d="M-2.6 -33.4Q0 -37 2.6 -33.4L2.4 -31Q4 -31 3.6 -29.4Q2 -30.4 1.4 -31.6" fill="#1a1216"/><circle cx="2.4" cy="-35" r="1.2" fill="#e8423f"/>' +
    '<path d="M-3 -28Q0 -25 3 -28L3.4 -25Q0 -23 -3.4 -25Z" fill="#f8d874"/>' +
    '</g></g>'
  /* casetas del fondo, mas pequenas y en penumbra: dan profundidad de calle */
  function casetaFondo(x, c) { return '<g opacity=".55" transform="translate(' + x + ' 147) scale(.62) translate(' + (-x) + ' -150)">' + caseta(x, 46, c) + '</g>' }
  var FERIA = '<svg viewBox="114 30 326 120" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><defs><linearGradient id="bnCas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a4d" stop-opacity=".1"/><stop offset="1" stop-color="#7a3a1a" stop-opacity=".45"/></linearGradient></defs>' +
    NORIA + casetaFondo(150, '#e8423f') + casetaFondo(258, '#2fa35b') + casetaFondo(300, '#e8423f') + TIOVIVO + caseta(124, 52, '#2fa35b') + caseta(180, 52, '#e8423f', 'baile') + caseta(236, 52, '#2fa35b') +
    '<path d="M124 120Q152 128 180 120Q208 128 236 120Q264 128 288 120" stroke="#5a4a3a" stroke-width=".4" fill="none"/>' +
    bombillas([[136, 123.4, 1.3, '#e8423f'], [152, 125.6, 1.3, '#2fa35b'], [168, 123.4, 1.3, '#f8d874'], [194, 123.4, 1.3, '#2fa35b'], [208, 125.6, 1.3, '#e8423f'], [222, 123.4, 1.3, '#f2f2f2'], [250, 123.4, 1.3, '#e8423f'], [264, 125.6, 1.3, '#f8d874'], [278, 123.4, 1.3, '#2fa35b']], .2) +
    GUITARRISTA + JINETES + BAILAORA + '</svg>'
  var ALBERO = '<svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 37Q140 35 240 28T400 22V40H0Z" fill="#c99a4a"/><path d="M0 39Q160 37 280 32T400 30V40H0Z" fill="#e0b660"/></svg>'
  /* ---------- El Rocio (Almonte), de noche: la marisma de Donana con flamencos y pinos, la aldea, la ermita blanca con su
     espadana y la Virgen del Rocio con el Pastorcito en la puerta (y gente a la reja), y la romeria: el tamborilero delante,
     un caballista, la carreta del Simpecado de plata con velas y flores, carretas con toldo, bueyes con frontiles y
     campanillas, el boyero con su vara y peregrinos ---------- */
  function pinoDonana(x, y, sc) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M0 0C1 -8 -1 -14 1 -22M1 -16C4 -18 7 -20 9 -23M0 -18C-3 -20 -6 -21 -8 -23" stroke="#1a1410" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M-19 -22Q-16 -31 -6 -33Q2 -36 11 -33Q19 -31 20 -24Q12 -20 2 -21Q-9 -19 -19 -22Z" fill="#14231c"/>' +
      '<path d="M-14 -25Q-6 -30 2 -30M4 -31Q12 -31 16 -26M-10 -22Q0 -24 8 -22" stroke="#24382c" stroke-width="1.2" fill="none"/></g>'
  }
  function flamenco(x, y, d, pata) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="b-flam" style="animation-delay:' + d + 's">' +
      '<path d="M0 0V-9' + (pata ? 'M1 -5L3 -7' : 'M1.2 0V-9') + '" stroke="#e8889a" stroke-width=".5"/>' +
      '<path d="M-3 -10Q-1 -14 4 -12Q5 -9 1 -9Q-2 -8.6 -3 -10Z" fill="#ffb0c0"/><path d="M3 -12Q5 -18 3 -20Q1 -21 0 -19.6" stroke="#ffb0c0" stroke-width="1" fill="none"/>' +
      '<path d="M0 -19.6L-1.8 -18.6" stroke="#1a1216" stroke-width=".8"/></g></g>'
  }
  function rueda(cx, cy, r) {
    var t = '<g class="b-rueda"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#6a4426" stroke-width="1.6"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 1.4) + '" fill="none" stroke="#3a2414" stroke-width=".4"/>'
    for (var i = 0; i < 8; i++) { var a = i / 8 * 3.1416; t += '<path d="M' + (cx - Math.cos(a) * r).toFixed(1) + ' ' + (cy - Math.sin(a) * r).toFixed(1) + 'L' + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1) + '" stroke="#5a3a24" stroke-width=".55"/>' }
    return t + '<circle cx="' + cx + '" cy="' + cy + '" r="1.6" fill="#3a2414"/><circle cx="' + cx + '" cy="' + cy + '" r=".6" fill="#d8b064"/></g>'
  }
  function buey(x, y, d, color) {
    var c = color || '#e8dcc8'
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="b-paso" style="animation-delay:' + d + 's">' +
      '<path d="M0 -14Q0 -20.4 8 -20.4H21Q25 -20.4 26.6 -16.6L29.4 -17.4Q32.8 -16 32 -12L28 -10.4L27.4 -4L28 0H25.8L25 -4.6L24 -9H10L9.4 -4L10 0H7.8L7 -4.6L6 -9Q0 -9 0 -14Z" fill="' + c + '"/>' +
      '<path d="M8 -12Q16 -10 24 -12" stroke="#000" stroke-opacity=".12" stroke-width="1.6" fill="none"/><path d="M14 -9Q15 -6.4 17 -9" fill="' + c + '"/>' +
      '<path d="M27.2 -18Q28.6 -23.4 33 -22.6M26.2 -18Q24 -23.2 20.8 -22.4" stroke="#f6efe2" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
      '<circle cx="29.8" cy="-14.8" r=".55" fill="#2a1d18"/><path d="M31.4 -12.4Q32.6 -11.4 31.6 -10.8" stroke="#a89880" stroke-width=".5" fill="none"/>' +
      '<path d="M0 -14Q-3.4 -10 -2.4 -4.6" stroke="' + c + '" stroke-width="1" fill="none"/><path d="M-2.4 -4.6L-3.2 -3" stroke="#6a5a4a" stroke-width="1"/>' +
      /* frontil bordado y campanilla */
      '<path d="M25.6 -19.4L30 -21L31.4 -17.6L27.4 -16.2Z" fill="#c9302c"/><path d="M26.4 -19L30.2 -20.4" stroke="#f8d874" stroke-width=".5"/>' +
      '<path d="M27.6 -12V-9.6" stroke="#5a3a24" stroke-width=".4"/><path class="b-campana" d="M26.8 -9.6H28.4L28.6 -7.8H26.6Z" fill="#d8b064"/>' +
      '<path d="M17 -20.4Q19.4 -24.6 22 -20.4" fill="#e8423f"/><circle cx="19.4" cy="-23" r="1.3" fill="#ff9fc9"/><circle cx="17.6" cy="-22.2" r="1" fill="#f8d874"/><circle cx="21.4" cy="-22.4" r="1" fill="#fff"/>' +
      '</g></g>'
  }
  function yugo(x, y) { return '<path d="M' + x + ' ' + (y - 19) + 'H' + (x + 34) + '" stroke="#6a4426" stroke-width="2" stroke-linecap="round"/><path d="M' + (x + 4) + ' ' + (y - 19) + 'V' + (y - 15) + 'M' + (x + 30) + ' ' + (y - 19) + 'V' + (y - 15) + '" stroke="#6a4426" stroke-width=".8"/>' }
  function flores(pts) { var c = ['#ff9fc9', '#fff', '#f8d874', '#ff6b8a', '#e8423f', '#c9a6ff']; return pts.map(function (f, i) { return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="' + (f[2] || 1.5) + '" fill="' + c[i % 6] + '"/>' }).join('') }
  function carreta(x, y, tipo, color) {
    var t = '<g transform="translate(' + x + ' ' + y + ')"><g class="b-carro">'
    t += '<path d="M44 -14H66" stroke="#5a3a24" stroke-width="1.6"/>'
    t += '<rect x="1" y="-19" width="44" height="6" rx="1" fill="#7a5030"/><path d="M1 -16.6H45M8 -19V-13M16 -19V-13M24 -19V-13M32 -19V-13M40 -19V-13" stroke="#4a2c18" stroke-width=".45"/>'
    if (tipo === 'simpecado') {
      /* carreta del Simpecado: plata repujada, cuatro columnas, templete con cupula, velas encendidas y el estandarte */
      t += '<rect x="3" y="-24" width="40" height="5" fill="#cfd3de"/><path d="M3 -22H43" stroke="#9aa0b0" stroke-width=".5" stroke-dasharray="1.2 .8"/>'
      t += '<path d="M7 -24V-46M39 -24V-46M15 -24V-46M31 -24V-46" stroke="#e2e6ee" stroke-width="1.4"/><path d="M7 -24V-46M39 -24V-46" stroke="#9aa0b0" stroke-width=".4"/>'
      t += '<path d="M4 -46H42Q40 -60 23 -62Q6 -60 4 -46Z" fill="#d6dae4"/><path d="M8 -50Q23 -56 38 -50M12 -55Q23 -59 34 -55" stroke="#9aa0b0" stroke-width=".5" fill="none"/>'
      t += '<path d="M4 -46H42" stroke="#f8d874" stroke-width="1"/><path d="M4 -46' + 'q2.4 3 4.75 0'.repeat(8) + '" stroke="#d6dae4" stroke-width=".8" fill="none"/>'
      t += '<circle cx="23" cy="-64" r="2.2" fill="#f8d874"/><path d="M23 -66V-71M20.6 -68.6H25.4" stroke="#f8d874" stroke-width=".9"/>'
      /* estandarte granate con borde de oro, fleco y la Virgen bordada */
      t += '<path d="M15.6 -43H30.4V-28L23 -24.4L15.6 -28Z" fill="#7a1222"/><path d="M15.6 -43H30.4V-28L23 -24.4L15.6 -28Z" fill="none" stroke="#f8d874" stroke-width=".7"/><path d="M16 -28.6L23 -25L30 -28.6" stroke="#f8d874" stroke-width=".5" stroke-dasharray=".6 .6" fill="none"/>'
      t += '<path d="M23 -39L19.4 -29.4H26.6Z" fill="#f2ead8"/><path d="M19.8 -31H26.2" stroke="#f8d874" stroke-width=".4"/><circle cx="23" cy="-39.8" r="1.4" fill="#e8c4a0"/><path d="M20.6 -41.2L21 -42.8L22 -41.8L23 -43.4L24 -41.8L25 -42.8L25.4 -41.2Z" fill="#f8d874"/>'
      /* velas */
      ;[9.6, 12.4, 33.6, 36.4].forEach(function (vx, k) { t += '<rect x="' + (vx - .5) + '" y="-30" width="1" height="5.6" fill="#f2ead8"/><g class="b-fl" style="animation-delay:' + k * .2 + 's"><ellipse cx="' + vx + '" cy="-31.2" rx=".8" ry="1.6" fill="#ffc35c"/></g>' })
      t += flores([[6, -47], [11, -48.4], [16, -49.4], [21, -50], [26, -50], [31, -49.4], [36, -48.4], [41, -47], [5, -25], [10, -25.6], [15, -25.6], [31, -25.6], [36, -25.6], [41, -25], [8, -36, 1.2], [38, -36, 1.2]])
    } else {
      /* carreta con toldo de lona blanca, flores de papel, banderines, cintas y farolillo */
      t += '<path d="M2 -19V-34Q2 -47 23 -47Q44 -47 44 -34V-19Z" fill="#f2ead8"/><path d="M2 -34Q2 -47 23 -47Q44 -47 44 -34" stroke="#d8ccb8" stroke-width=".8" fill="none"/>'
      t += '<path d="M9 -19V-41M16 -19V-45M23 -19V-47M30 -19V-45M37 -19V-41" stroke="#e2d6c0" stroke-width=".5"/>'
      t += '<path d="M8 -19V-31Q8 -38 14 -38H32Q38 -38 38 -31V-19Z" fill="#ffcf7a" opacity=".6"/><path d="M8 -19V-31Q8 -38 14 -38H32Q38 -38 38 -31V-19" stroke="' + color + '" stroke-width="1.2" fill="none"/>'
      t += '<path d="M14 -24Q16 -28 18 -24M26 -24Q28 -28 30 -24" fill="#1a1216" opacity=".55"/>'
      t += flores([[3, -34], [5.6, -39.6], [9.6, -43.6], [15, -46], [23, -47.4, 1.8], [31, -46], [36.4, -43.6], [40.4, -39.6], [43, -34], [2.6, -27], [43.4, -27], [3, -21], [43, -21]])
      t += '<path d="M2 -34L-2 -26M44 -34L48 -27" stroke="' + color + '" stroke-width=".8"/><path d="M44 -34L47 -25" stroke="#f8d874" stroke-width=".6"/>'
      t += '<path d="M16 -46L23 -52L30 -46" stroke="#5a4a3a" stroke-width=".3" fill="none"/>' + [17, 20, 23, 26, 29].map(function (bx, k) { var by = -46 - (3 - Math.abs(k - 2)) * 2; return '<path d="M' + bx + ' ' + by + 'l1.4 3l1.4 -3Z" fill="' + ['#e8423f', '#2fa35b', '#f8d874', '#2fa35b', '#e8423f'][k] + '"/>' }).join('')
      t += '<path d="M44 -30V-26.6" stroke="#5a3a24" stroke-width=".5"/><ellipse class="b-bomb" cx="44" cy="-24.6" rx="1.8" ry="2.2" fill="#2fa35b"/><circle cx="43.6" cy="-25.2" r=".4" fill="#fff"/>'
    }
    t += rueda(11, -9.6, 9.6) + rueda(35, -9.6, 9.6)
    return t + '</g></g>'
  }
  function persona(x, y, tipo, d) {
    var t = '<g transform="translate(' + x + ' ' + y + ')"><g class="b-paso" style="animation-delay:' + d + 's">'
    if (tipo === 'flamenca' || tipo === 'flamenca2') {
      var c = tipo === 'flamenca' ? '#c9302c' : '#2f6fb5'
      t += '<path d="M-2 -13L-6.6 -1Q0 1.4 6.6 -1L2 -13Z" fill="' + c + '"/><path d="M-4.4 -7Q0 -5.6 4.4 -7M-5.6 -4Q0 -2.4 5.6 -4M-6.4 -1.2Q0 .6 6.4 -1.2" stroke="#fff" stroke-width=".55" fill="none"/>'
      t += '<g fill="#fff"><circle cx="-1" cy="-10" r=".35"/><circle cx="1.2" cy="-8.6" r=".35"/><circle cx="-2.6" cy="-5.6" r=".35"/><circle cx="2.8" cy="-3" r=".35"/></g>'
      t += '<path d="M-2 -13L-1.6 -18.6H1.6L2 -13Z" fill="' + c + '"/><path d="M-1.6 -18.4L-3 -15M1.6 -18.4L3 -15" stroke="#f8d874" stroke-width=".9"/>'
      t += '<circle cy="-20.6" r="1.9" fill="#e8c4a0"/><path d="M-2 -21Q0 -23.6 2 -21L1.8 -19.6Q2.8 -19.4 2.6 -18.4Q1.4 -18.8 1 -20" fill="#1a1216"/><circle cx="1.6" cy="-22.4" r=".8" fill="#e8423f"/>'
    } else {
      t += '<path d="M-1.6 0V-8H-.2V0ZM.2 0V-8H1.6V0Z" fill="#2a2a34"/><path d="M-2.2 -8L-1.8 -18.6H1.8L2.2 -8Z" fill="#f2ead8"/><path d="M-2.2 -13.6H2.2" stroke="#141018" stroke-width="1"/><path d="M-.6 -17L0 -15L.6 -17" stroke="#c9302c" stroke-width=".5" fill="none"/>'
      t += '<circle cy="-20.8" r="1.9" fill="#e8c4a0"/><rect x="-3.8" y="-23.2" width="7.6" height=".9" fill="#141018"/><rect x="-1.7" y="-25.2" width="3.4" height="2" fill="#141018"/>'
    }
    /* baston de peregrino con la medalla de la hermandad */
    t += '<path d="M2 -15L5 -10M5 -24V1" stroke="#8a6438" stroke-width=".9"/><path d="M4 -24Q5 -26.2 6 -24" stroke="#f8d874" stroke-width=".6" fill="none"/><path d="M-.8 -17.6L0 -14.4L.8 -17.6" stroke="#d8b064" stroke-width=".4" fill="none"/><circle cy="-14" r=".6" fill="#d8b064"/>'
    return t + '</g></g>'
  }
  var TAMBORILERO = '<g transform="translate(274 149)"><g class="b-paso">' +
    '<path d="M-1.6 0V-8H-.2V0ZM.2 0V-8H1.6V0Z" fill="#2a2a34"/><path d="M-2.4 -8L-2 -19H2L2.4 -8Z" fill="#f2ead8"/><path d="M-2 -19H2L2.2 -15H-2.2Z" fill="#141018"/>' +
    '<circle cy="-21" r="2" fill="#e8c4a0"/><rect x="-4" y="-23.6" width="8" height="1" fill="#141018"/><rect x="-1.8" y="-25.8" width="3.6" height="2.2" fill="#141018"/>' +
    /* flauta y tamboril */
    '<path d="M1 -21.4L8 -24" stroke="#5a3a24" stroke-width=".8"/><ellipse cx="4.4" cy="-10" rx="3.4" ry="4.2" fill="#d8b064"/><path d="M1 -10H7.8M1.4 -12.6L7.4 -7.4M1.4 -7.4L7.4 -12.6" stroke="#8a5a28" stroke-width=".4"/>' +
    '<g class="b-rasgueo"><path d="M-1 -13L4 -15" stroke="#e8c4a0" stroke-width=".9"/><path d="M4 -15L6 -13" stroke="#5a3a24" stroke-width=".6"/></g>' +
    '</g></g>' +
    '<g class="b-nota"><circle cx="286" cy="120" r="1.3" fill="#f8d874"/><path d="M287.2 120v-5" stroke="#f8d874" stroke-width=".6"/></g><g class="b-nota b-nota2"><circle cx="280" cy="118" r="1.3" fill="#ffe27a"/><path d="M281.2 118v-5l2 .8" stroke="#ffe27a" stroke-width=".6" fill="none"/></g>'
  var CABALLISTA = '<g transform="translate(232 150) scale(.82)"><g class="b-cab">' +
    '<path d="M8 -22Q10 -29 19 -29H32Q38 -29 40 -23Q41 -17 38 -15L38.6 -7L37.4 0H35.6L36.2 -7L34.6 -14H29.6L30 -7L28.8 0H27L27.6 -7L26 -14H15L14.4 -7L15.6 0H13.8L12.6 -7L12 -14H9.6L10.4 -7L9.4 0H7.6L8.2 -7L7 -15Q5.6 -19 6.4 -21.4Z" fill="#f2ead8"/>' +
    '<path d="M8 -22L4.4 -32Q3 -37 0 -36.6L-3.4 -34.4Q-4.8 -32.4 -2.8 -31.4L1.2 -30L5.4 -22Z" fill="#f2ead8"/><path d="M3 -36Q7 -31 9 -25Q11 -21 12 -19" stroke="#c8bca8" stroke-width="1.4" fill="none"/>' +
    '<path d="M40 -23Q47 -20 45 -4Q43 -12 39 -16Z" fill="#c8bca8"/><circle cx="-1.2" cy="-33.6" r=".5" fill="#2a1d18"/><path d="M-2.6 -31.6L6 -24.6" stroke="#5a3a24" stroke-width=".5"/>' +
    '<path d="M19 -29H33L32 -24H20Z" fill="#2a2a34"/>' +
    '<path d="M22 -29L23.4 -39.6Q24.4 -41.6 26 -41.6L28 -39.6L29 -29Z" fill="#2a2a34"/><path d="M24 -29L22.6 -19.4H25L26 -27Z" fill="#2a2a34"/>' +
    '<circle cx="25.8" cy="-43.8" r="2.4" fill="#e8c4a0"/><rect x="21" y="-47" width="9.6" height="1.3" rx=".5" fill="#2a1a10"/><rect x="23.6" y="-50" width="4.4" height="3.2" fill="#2a1a10"/>' +
    '<path d="M28.6 -38L34 -47" stroke="#8a6438" stroke-width=".8"/><path d="M34 -47L38 -45.4L34 -43.8Z" fill="#7a1222"/>' +
    '</g></g>'
  var BOYERO = '<g transform="translate(150 149)"><g class="b-paso" style="animation-delay:.2s"><path d="M-1.6 0V-8H-.2V0ZM.2 0V-8H1.6V0Z" fill="#3a2a20"/><path d="M-2.2 -8L-1.8 -18.6H1.8L2.2 -8Z" fill="#e2d6c0"/><path d="M-2.4 -18.6H2.4L2 -16H-2Z" fill="#3a2a20"/>' +
    '<circle cy="-20.8" r="1.9" fill="#e8c4a0"/><path d="M-3.6 -22.6Q0 -25.6 3.6 -22.6Z" fill="#3a2a20"/><path d="M2 -16L8 -6M8 -6L14 6" stroke="#8a6438" stroke-width=".9"/></g></g>'
  var ERMITA = (function () {
    var t = '<circle cx="340" cy="100" r="62" fill="#ffe9b8" opacity=".08"/><circle cx="340" cy="118" r="30" fill="#ffd98a" opacity=".1"/>'
    /* alas con cornisa, pilastras y ventanas */
    t += '<rect x="294" y="102" width="24" height="48" fill="#f4efe4"/><rect x="362" y="102" width="24" height="48" fill="#f4efe4"/>'
    t += '<path d="M292 102H320M360 102H388" stroke="#e2d8c4" stroke-width="2.4"/><path d="M292 102H320M360 102H388" stroke="#d8b064" stroke-width=".7"/>'
    t += '<path d="M297 104V150M315 104V150M365 104V150M383 104V150" stroke="#e2d8c4" stroke-width="1.2"/>'
    ;[[302, 110], [310, 110], [370, 110], [378, 110], [302, 128], [310, 128], [370, 128], [378, 128]].forEach(function (w) { t += '<path d="M' + (w[0] - 2) + ' ' + (w[1] + 9) + 'V' + (w[1] + 2) + 'Q' + w[0] + ' ' + (w[1] - 1) + ' ' + (w[0] + 2) + ' ' + (w[1] + 2) + 'V' + (w[1] + 9) + 'Z" fill="#ffcf7a" opacity=".8"/><path d="M' + (w[0] - 2.6) + ' ' + (w[1] + 9.4) + 'H' + (w[0] + 2.6) + '" stroke="#2a2030" stroke-width=".5"/>' })
    /* cuerpo central, fronton curvo con volutas y espadana de dos campanas */
    t += '<path d="M318 150V92Q318 79 340 74Q362 79 362 92V150Z" fill="#fbf7ee"/>'
    t += '<path d="M318 92Q318 79 340 74Q362 79 362 92" stroke="#d8b064" stroke-width="1.1" fill="none"/><path d="M320 95Q314 90 318 86M360 95Q366 90 362 86" stroke="#e2d8c4" stroke-width="1.4" fill="none"/>'
    t += '<path d="M322 150V96M358 150V96" stroke="#e2d8c4" stroke-width="1.4"/><path d="M326 98H354" stroke="#e2d8c4" stroke-width="1.2"/>'
    t += '<path d="M327 74V58Q327 50 340 46Q353 50 353 58V74Z" fill="#fbf7ee"/><path d="M327 58Q327 50 340 46Q353 50 353 58" stroke="#d8b064" stroke-width=".9" fill="none"/>'
    t += '<path d="M332 68V60.6Q332 57 335 57Q338 57 338 60.6V68ZM342 68V60.6Q342 57 345 57Q348 57 348 60.6V68Z" fill="#1a1428"/>'
    t += '<g class="b-campana2"><path d="M333.6 61.4H336.4L337 65H333Z" fill="#d8b064"/></g><g class="b-campana2" style="animation-delay:-.6s"><path d="M343.6 61.4H346.4L347 65H343Z" fill="#d8b064"/></g>'
    t += '<path d="M340 46V39M337.6 41.4H342.4" stroke="#d8b064" stroke-width="1"/><circle cx="340" cy="83" r="3.6" fill="#ffcf7a" opacity=".85"/><circle cx="340" cy="83" r="3.6" fill="none" stroke="#d8b064" stroke-width=".6"/>'
    /* puerta y la Virgen del Rocio con el Pastorcito, rafaga, corona imperial, rostrillo y media luna */
    t += '<path d="M326 150V114Q326 102 340 102Q354 102 354 114V150Z" fill="#ffcf7a"/><path d="M326 150V114Q326 102 340 102Q354 102 354 114V150" stroke="#d8b064" stroke-width="1" fill="none"/>'
    t += '<g class="b-rafaga"><path d="M340 112' + (function () { var d = ''; for (var i = 0; i < 26; i++) { var a = Math.PI + i / 25 * Math.PI, r = i % 2 ? 10 : 13.6; d += 'L' + (340 + Math.cos(a) * r).toFixed(1) + ' ' + (121 + Math.sin(a) * r).toFixed(1) } return d })() + 'Z" fill="#f8d874"/>' + (function () { var d = ''; for (var i = 0; i < 9; i++) { var a = Math.PI + (i + .5) / 9 * Math.PI; d += '<circle cx="' + (340 + Math.cos(a) * 14.6).toFixed(1) + '" cy="' + (121 + Math.sin(a) * 14.6).toFixed(1) + '" r=".9" fill="#fff6c8"/>' } return d })() + '</g>'
    t += '<path d="M340 113.4L331 141H349Z" fill="#fbf7ee"/><path d="M340 113.4L331 141H349Z" fill="none" stroke="#d8b064" stroke-width=".7"/>'
    t += '<path d="M333.6 133H346.4M334.6 129H345.4M335.6 125H344.4M338 120Q340 124 342 120" stroke="#d8b064" stroke-width=".45" fill="none"/>'
    t += '<path d="M335.6 137.4Q340 134 344.4 137.4" stroke="#d8b064" stroke-width=".6" fill="none"/>'
    t += '<circle cx="340" cy="114.6" r="2.4" fill="#fbf7ee"/><circle cx="340" cy="114.8" r="1.6" fill="#e8c4a0"/>'
    t += '<path d="M337.2 112.6L337.6 110.2L338.6 111.6L340 109.4L341.4 111.6L342.4 110.2L342.8 112.6Z" fill="#f8d874"/><circle cx="340" cy="108.8" r=".6" fill="#f8d874"/>'
    t += '<path d="M340 124L338 129H342Z" fill="#fbf7ee"/><circle cx="340" cy="123.4" r="1" fill="#e8c4a0"/><path d="M339.2 122.6L340 121.6L340.8 122.6Z" fill="#f8d874"/>'
    t += '<path d="M335 141.4Q340 144.6 345 141.4" stroke="#e2e6ee" stroke-width="1.2" fill="none"/>'
    /* la reja con gente asomada */
    t += '<path d="M326 140H354" stroke="#2a2030" stroke-width=".8"/>' + [327, 330, 333, 336, 344, 347, 350, 353].map(function (gx) { return '<path d="M' + gx + ' 140V150" stroke="#2a2030" stroke-width=".5"/>' }).join('')
    t += [[322, 1], [325, 0], [356, 1], [359, 0], [329, 2]].map(function (g, k) { return '<g class="b-paso" style="animation-delay:' + k * .3 + 's"><circle cx="' + g[0] + '" cy="146" r="1.8" fill="#141018"/><path d="M' + (g[0] - 2) + ' 150V148Q' + g[0] + ' 146.6 ' + (g[0] + 2) + ' 148V150Z" fill="' + ['#c9302c', '#f2ead8', '#2f6fb5'][g[1]] + '"/></g>' }).join('')
    return t
  })()
  var ALDEA = (function () {
    var t = ''
    ;[[248, 118, 22, 16, 1], [272, 114, 18, 20, 0], [390, 116, 22, 18, 1], [414, 121, 20, 13, 0]].forEach(function (c) {
      t += '<rect x="' + c[0] + '" y="' + c[1] + '" width="' + c[2] + '" height="' + (150 - c[1]) + '" fill="#e8e2d6"/><path d="M' + (c[0] - 1.4) + ' ' + c[1] + 'H' + (c[0] + c[2] + 1.4) + '" stroke="#b4562e" stroke-width="2.2"/>'
      t += '<rect x="' + c[0] + '" y="' + (150 - 4) + '" width="' + c[2] + '" height="4" fill="#c99a4a" opacity=".5"/>'
      t += '<rect x="' + (c[0] + 4) + '" y="' + (c[1] + 5) + '" width="4" height="5" fill="#ffcf7a" opacity=".85"/><path d="M' + (c[0] + 3) + ' ' + (c[1] + 10.6) + 'H' + (c[0] + 9) + 'M' + (c[0] + 3.4) + ' ' + (c[1] + 10.6) + 'V' + (c[1] + 12.4) + 'M' + (c[0] + 8.6) + ' ' + (c[1] + 10.6) + 'V' + (c[1] + 12.4) + '" stroke="#2a2030" stroke-width=".6"/>'
      t += '<rect x="' + (c[0] + c[2] - 8) + '" y="' + (c[1] + 5) + '" width="4" height="5" fill="#ffcf7a" opacity=".6"/>'
      if (c[4]) t += '<path d="M' + (c[0] + c[2] - 10) + ' 150V' + (c[1] + 14) + 'H' + (c[0] + c[2] - 4) + 'V150" fill="#6a4426"/>' + flores([[c[0] + 2, c[1] + 4, 1.1], [c[0] + c[2] - 2, c[1] + 4, 1.1]])
    })
    return t
  })()
  var ROCIO = '<svg viewBox="0 36 440 114" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
    /* marisma con reflejos y flamencos */
    '<path d="M0 130Q60 128 120 131T240 130T440 131V140H0Z" fill="#1c2c46" opacity=".75"/>' +
    '<path d="M14 133H46M70 135H110M150 132H190M206 135H232M296 134H320" stroke="#8ab4ff" stroke-width=".6" opacity=".35"/><path d="M340 133H352M180 136H200" stroke="#ffe9b8" stroke-width=".7" opacity=".25"/>' +
    flamenco(96, 134, 0, 1) + flamenco(104, 135, -.8, 0) + flamenco(112, 134, -1.6, 1) + flamenco(196, 135, -.4, 0) +
    pinoDonana(18, 132, 1.1) + pinoDonana(60, 130, .85) + pinoDonana(222, 131, .95) + pinoDonana(426, 132, 1) +
    ALDEA + ERMITA +
    /* el camino de arena con roderas */
    '<path d="M0 141Q120 137 320 146V150H0Z" fill="#d9bf86" opacity=".38"/><path d="M0 145Q140 142 300 148" stroke="#b89a62" stroke-width=".6" fill="none" opacity=".6"/>' +
    /* la romeria hacia la ermita */
    persona(8, 148, 'flamenca', 0) + persona(18, 148, 'hombre', .4) +
    carreta(26, 148, 'simpecado') + yugo(72, 148) + buey(72, 148, 0) + buey(88, 149, .3, '#d8c8b0') +
    persona(128, 148, 'flamenca2', .2) + persona(138, 148, 'hombre', .5) + BOYERO +
    carreta(156, 148, 'toldo', '#e8423f') + yugo(202, 148) + buey(202, 148, .15, '#3a2a22') + buey(218, 149, .45) +
    CABALLISTA + persona(262, 149, 'flamenca', .3) + TAMBORILERO +
    '</svg>'
  /* montes al fondo (a todo lo ancho, detras de la escena) */
  var MONTES = '<svg viewBox="0 -14 400 74" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M0 34Q30 18 62 26T130 16T200 24T262 12T330 22T400 14V60H0Z" fill="#342e64"/>' +
    '<path d="M0 34Q30 18 62 26T130 16T200 24T262 12T330 22T400 14" stroke="#b9c9ff" stroke-width=".8" fill="none" opacity=".4"/>' +
    '<path d="M0 44Q44 30 90 38T180 32T270 40T340 30T400 36V60H0Z" fill="#26224a"/>' +
    '</svg>'
  var ARENA = '<svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 37Q140 35 240 29T400 24V40H0Z" fill="#b89a62"/><path d="M0 39Q160 37 280 33T400 31V40H0Z" fill="#d9bf86"/></svg>'
  /* Hispanidad: contornos reales de los 21 paises donde se habla espanol (Natural Earth 1:110m, via world-atlas;
     generado una vez en el scratchpad) y expresiones tipicas de algunos de ellos, que aparecen sobre su pais */
  var HISPANO = {"w":400,"h":288,"d":"M187.0 102.1L187.5 102.9L186.5 103.7L185.6 104.2L185.0 105.0L185.2 106.0L186.1 106.2L185.4 107.0L184.4 107.3L183.6 107.7L183.8 108.8L183.1 109.6L183.7 110.4L184.3 111.1L184.9 111.7L185.2 112.6L184.4 113.2L183.6 113.7L182.6 114.4L181.1 114.8L180.1 114.7L179.2 115.1L179.1 116.1L178.0 115.9L176.9 115.5L175.8 115.4L175.0 114.8L174.0 114.8L174.7 116.2L174.9 117.1L175.1 118.1L175.5 119.0L176.4 119.7L177.3 119.8L176.8 120.6L175.7 121.1L175.2 122.1L174.4 122.6L173.4 123.1L172.4 123.5L171.6 124.2L170.7 123.9L169.8 124.4L168.8 124.5L168.0 123.9L167.3 123.2L167.0 122.2L166.7 121.1L166.3 120.2L165.8 119.3L165.1 118.7L165.4 117.5L165.9 116.7L165.3 116.0L164.8 114.9L164.6 113.9L164.6 112.5L164.5 111.5L165.1 110.7L165.5 109.6L165.3 108.7L164.2 108.7L162.7 109.0L161.3 108.9L160.4 109.2L159.4 108.5L158.6 107.4L157.9 106.7L156.9 106.5L155.9 106.3L155.0 106.6L154.1 106.5L153.1 106.5L152.1 105.8L151.2 105.2L151.2 104.2L151.5 103.2L151.0 102.3L150.4 101.2L150.1 100.4L149.1 100.2L149.2 99.2L149.7 97.8L150.0 96.5L150.5 95.5L151.2 94.7L152.5 93.3L153.3 92.9L154.2 92.7L152.9 93.2L153.0 94.5L153.4 95.5L153.5 96.6L152.9 97.4L152.2 98.4L152.9 99.6L153.3 100.4L154.5 100.4L155.2 99.3L155.2 98.4L154.6 97.5L154.1 96.6L153.8 95.7L154.6 95.0L155.9 94.4L157.6 94.0L158.6 93.8L157.7 93.2L157.6 92.2L158.5 91.8L159.0 93.1L160.5 93.5L161.6 93.8L162.9 94.6L163.1 95.6L163.6 96.5L165.2 96.4L166.5 96.3L169.1 96.1L170.2 97.2L171.3 97.5L172.3 97.7L175.0 96.6L176.0 96.6L175.1 96.3L177.0 96.1L177.9 95.9L179.3 95.8L180.6 95.9L181.6 95.8L180.6 96.1L179.3 96.3L179.4 97.4L180.1 98.2L181.1 98.0L181.8 98.7L182.7 98.4L183.5 99.1L184.5 99.5L184.1 100.4L183.8 101.2L182.4 102.0L183.3 102.5L184.6 102.0L185.7 102.1L186.6 101.9ZM206.1 223.9L205.7 224.7L204.9 225.7L203.8 226.6L201.7 227.3L200.8 227.2L199.5 226.9L198.2 227.3L197.2 226.9L196.1 226.6L195.2 225.9L194.1 225.9L193.2 225.9L192.2 225.0L191.5 223.8L191.8 222.5L192.5 221.7L192.3 220.5L192.5 219.6L192.3 218.7L192.8 217.8L193.0 216.9L193.1 215.9L193.2 214.8L193.8 214.0L195.1 213.9L195.9 213.4L197.4 214.4L198.3 215.2L198.5 216.2L199.4 215.8L200.4 216.1L201.2 216.9L202.6 217.4L203.3 218.1L204.4 218.7L205.2 219.4L205.8 220.3L206.7 220.8L206.1 221.8L205.7 223.2ZM169.4 73.6L170.5 73.7L170.3 74.7L169.4 75.0L168.3 74.9L167.4 75.0L166.3 74.9L166.2 74.0L167.4 73.5L169.2 73.5ZM379.2 31.9L378.2 31.9L378.4 31.4L379.2 31.7ZM387.0 26.3L387.5 26.4L388.0 26.3L388.5 26.4L388.3 27.1L387.7 27.8L387.5 28.3L387.0 28.6L385.8 28.4L385.2 28.3L385.0 27.7L384.4 27.4L383.7 27.8L383.2 27.5L385.2 25.9L385.8 25.7L387.1 25.3L387.2 25.9ZM392.8 26.0L391.1 25.5L390.6 25.4L390.6 24.9L391.6 24.8L392.4 25.0L392.9 25.6ZM378.4 30.7L377.5 30.9L377.7 30.3L377.9 29.8L379.0 29.6L379.3 30.0L378.7 30.6ZM362.1 8.0L362.5 8.5L363.3 8.7L364.1 8.9L363.8 9.5L364.3 9.9L365.2 10.0L366.4 10.3L367.3 10.4L368.2 11.1L368.7 11.1L369.4 10.9L370.1 11.2L370.7 11.6L372.2 11.5L372.7 11.6L373.8 11.7L374.3 11.6L374.4 11.1L375.0 10.9L376.2 11.2L376.7 11.4L377.2 11.5L377.9 11.6L378.3 12.1L378.3 12.8L378.9 12.9L379.6 12.6L380.5 12.8L381.0 13.1L381.7 13.2L382.2 13.0L383.1 13.2L384.1 13.4L384.6 13.1L385.3 13.0L386.1 12.8L387.0 13.0L387.5 13.3L387.8 13.7L387.1 13.8L387.1 14.4L387.5 15.4L387.0 15.8L386.3 16.3L382.8 17.8L381.9 18.5L379.0 19.2L377.2 19.7L376.3 19.8L375.3 20.7L374.7 21.1L375.6 21.6L374.8 22.0L374.2 22.1L373.0 23.6L371.9 24.7L371.4 25.1L370.8 25.8L369.5 27.6L369.5 28.1L370.1 29.9L370.5 30.4L371.0 30.8L371.9 31.1L371.8 31.8L370.9 32.3L369.2 33.1L368.5 33.7L368.4 34.3L367.9 34.5L367.7 35.3L367.4 35.9L367.0 36.4L367.5 37.1L367.0 37.4L366.4 37.4L364.5 37.5L362.9 38.4L362.1 39.1L361.4 40.6L360.5 41.4L359.5 41.2L358.8 41.2L358.1 41.3L357.1 41.8L356.5 41.6L355.3 41.5L354.7 41.6L353.9 41.8L353.1 41.6L351.9 41.6L349.2 41.7L348.5 42.2L347.6 42.8L346.3 42.8L345.1 43.2L344.3 44.2L344.1 44.7L343.6 45.0L342.8 45.2L341.9 44.9L341.1 44.4L340.1 43.7L339.8 43.2L339.6 42.7L339.0 42.1L339.3 41.1L339.9 40.8L339.3 40.8L338.9 41.2L338.5 40.5L336.5 39.3L335.0 39.3L333.8 39.4L333.5 38.2L333.4 37.7L333.7 36.7L334.4 35.8L335.0 35.2L335.5 35.1L336.0 34.7L335.4 34.4L334.2 33.0L334.4 32.4L334.5 31.7L335.3 31.1L335.7 30.7L335.9 30.0L335.0 29.6L334.4 28.5L334.2 27.9L333.6 27.5L333.3 27.0L335.3 26.8L336.0 26.2L336.4 25.5L336.3 24.9L335.8 24.5L336.2 23.9L336.6 23.7L336.7 23.1L336.8 22.1L336.7 21.3L336.6 20.8L336.3 20.1L337.0 19.6L337.5 19.1L338.1 18.6L338.9 18.3L339.5 17.9L339.9 17.5L339.4 16.9L338.5 16.8L338.1 16.2L338.0 15.6L337.4 15.5L336.7 15.3L335.8 15.4L335.2 15.2L334.8 15.6L333.9 16.0L333.3 15.9L332.8 15.8L331.4 15.8L330.4 16.1L329.7 15.6L330.2 15.0L329.8 14.6L329.2 14.5L328.2 14.8L327.4 15.1L326.9 15.4L326.4 15.4L326.4 14.6L327.0 14.1L327.4 13.7L326.8 13.7L327.2 13.0L326.8 12.8L326.8 12.1L325.9 12.2L326.1 11.3L325.6 11.0L325.2 10.8L324.6 10.2L324.9 9.2L325.7 8.9L326.5 8.4L327.5 8.5L328.2 8.4L328.7 8.1L329.6 7.9L329.4 7.4L330.2 6.9L330.8 6.6L331.6 6.5L332.4 6.2L332.9 6.4L333.9 6.6L334.6 7.1L335.6 7.3L336.4 7.1L337.8 7.1L338.5 7.2L339.8 7.0L340.5 7.1L341.7 6.8L342.6 7.1L344.4 7.3L345.4 7.6L348.4 8.0L349.4 8.0L350.9 7.7L351.6 7.6L352.1 7.7L353.0 7.5L353.9 7.8L355.8 8.2L356.3 7.9L358.0 8.0L359.4 8.4L360.1 8.5L361.1 8.3L362.0 8.1ZM305.7 49.7L305.2 50.9L304.8 51.3L304.0 51.6L303.3 50.9L303.0 50.1L303.5 49.8L304.5 49.6L305.7 48.8L306.7 48.7L305.7 49.7ZM318.8 47.0L318.1 47.2L318.3 46.5L319.2 46.0L319.8 45.9L320.1 45.4L320.0 46.6L318.8 47.0ZM316.4 50.8L315.7 51.3L315.0 51.2L315.6 51.0L316.2 50.5L316.6 49.6L317.3 48.5L317.6 47.9L318.3 48.1L318.3 48.7L318.1 49.6L317.8 50.3L316.4 50.8ZM310.4 50.9L310.4 51.7L310.4 52.3L309.5 52.9L308.8 52.7L308.3 52.2L308.3 51.7L308.8 51.3L310.1 50.9ZM301.4 51.5L300.7 51.0L301.0 50.6L301.6 50.8L301.4 51.5ZM297.8 52.6L297.3 53.4L296.7 53.1L297.7 52.4ZM298.1 49.1L297.3 47.8L297.6 47.4L298.3 47.4L298.7 48.0L298.6 48.5L298.1 49.1ZM363.4 208.5L364.3 208.7L366.1 209.8L366.8 210.0L367.5 210.2L368.0 210.3L368.6 210.0L369.2 209.2L369.8 209.3L370.1 210.1L369.6 211.0L369.3 211.5L369.2 213.2L369.2 213.7L369.3 214.1L369.6 214.9L370.3 215.4L370.5 216.0L370.9 216.4L371.1 217.0L370.7 218.3L369.6 220.4L369.1 221.8L368.2 221.9L367.2 222.3L366.6 222.7L366.1 223.1L365.9 223.7L366.2 224.3L366.0 224.8L365.5 225.4L365.4 226.0L365.0 226.5L365.3 227.1L365.8 228.2L366.5 229.4L366.3 230.0L366.3 230.5L366.4 231.1L367.0 232.4L367.3 233.1L367.9 233.6L368.8 234.0L369.5 234.1L369.9 233.7L369.4 233.1L369.9 232.7L370.5 232.3L371.0 231.9L371.8 232.0L372.5 232.2L373.0 232.3L373.5 232.7L373.9 233.3L374.2 233.9L374.1 234.6L374.4 235.1L375.1 235.1L375.4 234.6L375.5 234.1L375.6 233.4L376.2 233.9L377.3 234.3L378.3 234.6L378.2 235.2L377.1 235.3L377.1 236.3L377.7 236.8L378.0 237.2L378.3 237.7L378.1 238.6L379.0 238.6L379.7 239.0L380.0 240.3L379.6 241.6L379.1 241.4L378.6 240.9L378.7 240.2L379.0 239.6L378.2 239.7L377.2 239.7L376.0 239.0L375.5 238.9L375.4 238.0L374.9 237.2L374.7 236.8L373.2 235.9L372.6 235.1L371.6 234.2L371.0 234.1L371.0 234.7L371.1 235.3L371.6 236.1L372.0 237.0L372.0 237.8L371.6 238.1L371.2 237.8L371.1 237.2L370.6 236.5L369.5 235.6L368.7 234.9L367.1 234.1L366.4 234.2L365.6 234.6L365.3 235.3L364.8 235.6L364.0 235.7L363.4 235.5L362.9 235.0L362.0 234.3L361.4 234.3L360.9 234.8L360.8 233.7L360.8 232.7L361.2 232.1L362.5 231.0L362.6 230.2L361.8 229.6L361.3 229.5L360.6 228.9L360.4 229.5L360.6 230.5L360.6 231.1L360.1 231.3L359.6 231.0L359.4 230.4L359.0 230.0L358.8 229.4L358.2 229.3L357.7 228.4L357.6 227.6L357.4 227.0L357.2 226.4L357.0 225.9L356.8 223.7L356.4 223.0L356.1 222.5L356.2 221.4L356.5 221.0L357.0 221.5L357.6 221.8L358.1 222.4L358.9 222.5L359.4 222.2L359.5 221.6L359.2 220.6L359.1 219.9L359.1 219.2L359.2 218.6L359.6 217.5L359.7 216.8L359.7 215.8L359.7 215.2L359.4 214.4L359.4 213.8L360.2 210.9L360.4 210.4L360.6 209.8L360.7 209.0L361.3 208.8L361.9 208.5L362.5 208.6L363.2 208.5ZM342.7 264.1L342.2 264.5L342.4 263.6L342.9 262.6L343.9 261.6L344.3 261.2L345.1 260.5L345.8 259.8L346.4 259.7L347.1 259.2L348.3 257.8L349.4 256.7L350.5 255.4L351.0 255.0L352.1 253.7L352.7 253.4L353.2 253.0L353.5 252.5L353.7 251.8L353.4 251.0L353.6 250.3L354.5 248.5L355.0 248.7L354.9 249.3L355.0 249.9L354.8 250.4L355.3 251.7L355.7 252.6L355.2 253.4L354.3 253.7L353.5 254.2L353.2 254.8L353.0 255.3L351.7 255.6L351.0 255.9L350.6 256.4L350.7 256.9L349.6 258.8L349.2 259.2L348.9 259.7L348.4 260.0L347.7 260.2L347.2 260.5L346.8 261.2L346.4 261.7L345.9 262.2L345.3 262.6L344.7 262.8L344.1 263.0L343.8 263.6L343.3 263.8L342.7 264.1ZM371.1 246.8L371.7 247.0L372.3 246.8L372.9 246.9L373.4 247.2L373.2 247.7L374.4 247.2L374.7 247.7L374.5 248.6L374.2 249.1L373.9 249.5L373.5 249.8L373.0 250.0L372.7 250.5L372.6 251.1L372.0 251.2L371.2 251.8L369.4 252.2L368.9 252.4L368.3 253.1L368.2 252.1L368.1 251.5L368.1 250.8L368.5 250.2L368.6 249.6L368.7 248.3L368.9 246.6L368.0 246.0L367.9 245.5L368.5 245.2L369.9 245.9L370.5 246.3L371.1 246.8ZM374.5 260.7L373.8 260.7L373.1 259.3L372.6 259.0L372.0 258.8L371.4 258.4L370.6 257.3L370.5 256.6L370.9 255.8L371.9 255.7L373.0 255.1L373.1 254.0L373.0 253.4L372.8 252.8L373.3 252.3L373.6 251.8L373.6 251.0L374.0 250.6L375.0 250.2L376.6 250.5L376.9 251.1L376.7 252.0L376.0 253.1L375.7 253.8L375.4 254.9L374.8 256.0L374.7 257.2L374.6 257.8L375.5 259.1L375.4 259.9L375.1 260.4L374.5 260.7ZM382.4 248.2L383.2 248.4L383.8 247.9L384.4 248.1L384.7 248.7L385.0 249.4L385.0 250.4L384.8 251.3L385.2 251.6L385.6 252.1L385.8 253.1L386.2 253.7L385.6 254.1L385.0 253.8L384.8 254.5L384.9 255.4L384.4 255.1L383.7 254.9L383.6 254.1L383.3 253.2L383.6 251.9L383.6 251.3L383.3 250.8L382.9 250.3L382.0 250.7L381.5 249.3L381.3 248.1L381.0 247.5L381.7 247.6L382.3 248.0ZM386.1 241.8L386.5 242.2L386.5 242.9L387.0 243.1L387.7 243.6L387.6 244.4L387.2 244.9L387.3 245.9L387.5 246.5L387.5 247.1L388.0 248.1L387.9 248.6L388.6 249.2L388.8 249.7L388.2 249.4L387.1 249.5L386.5 249.3L385.6 248.7L384.9 248.3L384.4 247.5L384.6 246.6L384.7 245.9L384.1 245.9L383.8 245.5L383.4 245.0L383.0 244.5L382.4 244.4L381.7 243.8L381.4 243.3L381.1 242.4L380.9 241.5L382.4 241.8L383.9 241.7L385.6 241.5L386.1 241.8ZM361.3 236.6L362.4 236.4L363.0 236.8L363.5 237.1L364.0 236.8L364.4 237.1L364.8 237.7L365.3 238.1L365.7 238.5L365.5 239.1L365.5 240.1L365.8 241.2L365.4 241.9L365.1 242.3L365.0 243.0L364.5 243.1L363.7 243.4L363.3 242.8L362.7 242.2L362.4 241.5L362.1 240.8L361.7 240.3L361.6 239.3L361.1 238.5L360.5 238.0L360.0 237.5L359.8 237.0L359.3 236.9L359.6 236.4L361.0 236.5ZM390.3 259.3L390.7 259.6L391.3 259.6L391.3 260.4L391.9 261.3L392.0 261.9L391.6 262.5L391.0 263.1L391.8 263.6L392.2 263.9L392.3 264.8L392.7 265.4L392.5 266.9L392.6 267.5L392.9 267.9L393.3 268.3L393.5 269.0L393.4 270.2L393.2 271.1L392.6 271.9L391.8 272.7L391.3 272.8L391.5 273.5L391.4 274.8L391.3 275.8L391.0 275.3L390.8 274.8L390.6 273.5L390.4 272.9L390.1 272.3L390.0 271.8L389.7 271.4L389.2 270.2L388.5 270.6L388.4 271.1L387.7 271.9L387.3 272.5L386.9 273.1L386.8 273.7L387.1 274.2L387.8 274.8L388.4 276.3L388.4 277.6L388.1 278.2L387.2 279.3L386.7 279.7L386.1 278.8L386.2 277.9L386.2 277.3L385.7 277.2L385.2 278.0L384.6 278.2L382.8 277.5L381.5 276.8L380.4 276.2L379.7 275.3L379.5 274.6L379.5 273.8L379.2 272.8L379.2 272.1L379.5 271.4L379.9 271.1L380.3 270.6L380.4 269.8L379.6 268.9L379.1 268.4L378.0 267.9L377.5 267.5L376.8 267.5L376.4 267.9L376.4 268.4L375.9 269.8L375.4 269.5L374.8 269.1L374.6 268.6L373.8 269.0L373.0 269.1L372.7 268.1L372.2 267.8L371.7 267.8L371.1 268.3L370.8 268.9L370.1 270.2L369.7 271.1L369.3 272.0L368.9 272.5L368.1 272.2L367.8 271.6L367.9 270.9L368.3 270.5L368.6 270.0L369.0 268.4L369.0 267.8L369.7 266.8L370.2 266.4L371.6 266.0L372.0 265.8L372.7 265.8L373.3 265.7L373.8 265.3L373.8 264.6L374.1 264.2L374.6 263.7L375.4 263.6L375.9 263.2L376.2 262.7L376.9 263.0L377.5 263.2L378.1 263.6L378.5 264.2L378.6 265.5L377.9 266.2L378.9 265.8L380.2 265.4L380.5 265.1L380.8 264.4L381.1 263.8L381.5 263.3L382.7 263.7L383.3 263.5L383.4 262.8L383.6 261.8L384.0 261.2L385.0 261.7L385.5 261.8L385.9 260.9L386.8 261.1L387.5 261.0L387.7 260.3L387.5 259.6L387.0 257.4L387.3 256.9L388.3 257.5L389.5 258.3L390.0 258.7L390.3 259.3ZM375.8 258.6L375.6 257.9L376.0 256.2L376.6 254.8L377.1 253.9L377.7 253.0L378.4 251.6L378.9 250.3L379.0 249.7L379.1 249.1L379.5 248.6L379.5 249.5L379.6 250.5L379.4 251.4L379.6 252.4L379.3 253.4L379.0 253.9L378.6 254.2L378.1 254.4L377.6 254.9L377.3 255.5L377.3 256.0L376.5 257.9L375.8 258.6ZM367.9 206.9L367.6 207.3L367.6 206.7L368.0 206.3L367.9 206.9ZM365.7 204.4L365.5 204.9L365.0 204.6L365.7 204.4ZM367.7 196.6L367.4 197.0L367.5 196.3ZM363.8 277.1L364.4 277.4L365.0 277.5L364.5 278.2L364.1 277.8L363.3 278.1L362.5 278.1L362.3 277.4L363.1 277.0L363.8 277.1ZM341.4 267.2L341.2 267.6L340.8 267.1L340.9 266.4L341.4 266.2L341.4 267.2ZM356.9 252.9L356.3 253.1L356.1 252.6L356.6 252.1L357.1 252.3L356.9 252.9ZM358.0 243.7L358.5 243.7L359.3 244.2L358.7 244.6L358.0 244.7L357.2 244.3L356.8 243.7L356.8 243.2L357.8 243.6ZM357.6 246.3L357.1 246.3L356.7 244.9L357.2 244.9L357.8 245.4L357.6 246.3ZM371.9 253.0L371.3 253.3L371.3 252.3L371.8 251.8L372.3 251.7L372.1 252.9ZM382.5 256.8L382.0 256.9L381.5 257.5L380.0 257.8L378.9 257.7L378.3 256.9L378.5 256.3L379.6 255.6L380.2 254.9L381.1 254.7L381.9 255.2L382.4 255.5L382.3 256.3L382.5 256.8ZM358.8 281.6L358.5 282.0L358.0 282.0L357.2 282.5L356.4 282.6L357.3 281.7L357.9 281.5L358.3 281.1L358.8 281.6ZM368.9 275.1L368.3 275.2L367.7 274.7L367.3 274.1L367.9 273.8L368.7 273.4L369.9 274.0L369.4 274.8L368.9 275.1ZM390.5 256.9L390.2 256.5L390.6 255.3L390.9 255.9L391.2 256.7L390.5 256.9ZM388.5 256.1L388.0 255.6L387.7 255.1L387.6 254.6L387.6 253.9L388.1 253.5L388.3 254.3L388.6 255.2L388.5 255.8ZM358.9 235.1L358.0 234.9L358.6 234.7L358.9 235.1ZM367.9 236.2L369.0 236.6L369.0 237.2L368.6 237.7L367.7 237.6L367.3 236.9L367.6 236.1ZM368.9 242.7L368.4 244.1L368.1 243.6L368.0 243.1L368.0 242.5L368.3 241.4L368.9 241.1L369.1 241.7L368.9 242.7ZM371.9 243.0L371.1 242.6L370.7 242.2L371.7 242.0L372.0 242.3L371.9 243.0ZM375.4 240.0L375.8 240.8L375.3 240.2L374.7 239.9L374.1 239.2L373.7 239.0L373.9 238.5L374.9 239.7L375.4 240.0ZM378.0 242.2L377.2 241.5L377.2 241.0L377.7 241.3L378.0 242.2ZM377.7 243.1L378.8 243.7L379.5 244.8L379.6 245.7L378.4 245.1L377.9 245.0L377.5 244.4L376.7 243.6L376.1 243.6L375.4 244.5L374.7 245.1L375.0 244.1L375.2 242.9L375.1 241.9L375.6 241.7L376.3 241.9L376.9 242.2L377.7 243.1ZM381.2 235.7L380.6 236.0L380.2 236.3L379.6 235.9L380.0 234.9L380.0 233.8L380.3 233.4L381.0 234.0L381.6 234.4L381.5 235.1L381.2 235.7ZM369.3 233.4L368.1 232.9L369.3 233.4ZM368.5 228.2L368.2 228.8L368.5 229.6L368.3 230.1L367.9 229.3L367.6 228.7L367.5 228.0L368.2 228.0ZM386.3 255.7L385.6 255.3L385.5 254.8L386.0 255.0L386.3 255.7ZM373.5 269.8L372.9 270.3L372.8 269.7L373.3 269.6ZM389.0 272.2L388.6 271.8L388.7 271.0L389.0 272.2ZM382.6 247.4L381.9 247.5L381.3 246.5L382.1 246.4L382.7 247.1ZM383.7 260.3L382.9 260.3L382.9 259.8L383.6 260.0ZM356.7 247.2L356.6 248.0L355.9 247.8L356.5 247.3ZM377.9 248.6L378.3 249.3L377.7 248.8ZM377.6 259.8L377.7 260.3L377.2 260.5L376.5 260.0L377.2 259.6ZM158.4 138.9L157.4 139.0L156.4 138.7L155.5 139.2L154.5 139.5L153.5 139.6L152.6 139.9L151.8 140.4L150.8 141.1L149.9 141.6L149.8 142.5L149.4 143.4L149.0 144.3L149.3 145.2L148.2 146.0L147.5 146.6L147.6 147.6L146.9 148.3L147.4 149.1L147.8 150.0L148.2 150.9L148.8 151.6L149.4 152.3L149.4 153.4L150.8 153.9L151.7 154.5L152.0 155.5L153.7 155.5L154.7 155.4L155.5 154.8L156.3 154.1L156.4 155.4L156.4 156.6L156.4 157.9L157.1 158.6L158.1 158.4L159.2 158.3L160.1 159.3L160.7 160.3L161.3 161.5L162.1 162.7L161.3 163.6L161.2 165.3L160.9 166.1L161.3 167.1L161.1 168.1L160.4 169.0L160.1 169.8L160.7 170.6L159.9 171.7L160.5 173.2L161.4 173.6L161.1 174.7L160.4 175.3L159.7 176.0L159.7 177.0L158.8 177.6L158.8 178.5L158.1 179.4L157.2 179.5L155.9 178.7L154.4 177.6L154.1 176.7L153.2 176.3L152.2 175.7L151.5 175.0L150.2 174.6L148.9 173.9L147.5 173.4L146.3 172.6L145.2 171.9L143.6 171.1L142.7 170.2L141.8 169.3L141.0 168.5L140.5 167.7L139.9 166.6L140.5 165.6L139.8 164.5L139.4 163.7L138.8 162.8L138.1 161.9L137.7 161.1L137.2 159.9L136.3 159.2L136.0 157.9L135.0 156.3L134.5 155.0L134.0 153.7L133.3 152.6L133.1 151.5L132.3 150.4L131.5 149.5L130.7 148.1L130.2 147.1L129.5 146.2L127.2 144.8L126.2 144.2L127.0 143.3L126.1 141.6L125.8 140.4L125.8 139.2L126.9 137.9L127.6 137.2L128.6 136.5L128.9 137.4L128.5 138.2L128.2 139.2L129.3 139.2L130.3 139.6L131.1 140.4L131.8 141.0L132.6 140.5L133.3 139.9L133.4 139.0L133.8 138.1L134.1 137.1L134.7 136.4L135.4 135.5L136.7 135.0L137.7 134.6L139.1 134.1L140.0 133.4L140.8 132.9L141.3 132.2L142.0 131.3L142.4 130.5L142.7 129.5L143.1 128.6L142.5 127.6L143.2 126.8L144.0 127.3L145.0 127.8L145.7 128.7L146.2 129.6L147.2 130.2L148.0 130.8L148.4 131.7L149.2 132.5L149.4 133.4L150.5 133.6L151.4 133.7L152.4 133.4L153.2 132.9L154.1 133.3L155.1 133.2L156.2 133.5L157.1 133.9L158.0 134.4L157.4 135.6L156.5 137.1L157.1 137.8L157.8 138.4ZM192.3 184.8L192.8 185.7L193.1 186.6L193.3 187.6L193.0 188.6L193.0 189.6L193.3 190.5L194.3 190.6L195.3 190.7L196.3 190.8L197.3 190.3L198.0 190.9L199.0 191.0L199.4 191.8L199.6 192.8L199.8 193.9L200.1 194.9L200.4 195.8L201.5 195.8L202.4 195.3L203.3 195.8L203.5 196.7L203.1 198.3L203.0 199.4L202.5 200.4L202.5 201.6L202.1 203.1L201.4 203.9L200.4 204.4L199.7 205.1L198.7 205.4L197.7 205.7L196.5 205.9L195.4 205.8L193.3 205.4L192.3 205.3L191.1 205.4L191.4 204.4L192.1 203.7L192.2 202.7L193.0 201.8L193.4 201.0L194.0 200.3L193.3 199.1L192.4 198.7L191.3 198.3L189.4 197.5L188.2 196.6L187.4 196.1L186.3 195.9L184.6 195.4L183.9 194.8L183.0 194.3L182.2 193.7L181.5 193.1L180.7 191.8L179.7 191.1L179.7 190.0L180.2 188.4L180.5 187.4L180.5 185.9L181.3 184.9L181.8 183.8L182.7 183.2L183.9 182.9L185.8 182.6L187.0 182.3L188.4 182.3L189.7 182.3L190.7 182.8L192.3 183.8L192.3 184.8ZM137.1 101.8L137.1 102.9L137.6 103.8L136.6 104.9L135.7 105.3L134.8 105.0L134.2 104.0L134.4 103.0L135.4 103.0L134.6 102.5L133.8 101.9L133.0 101.3L132.1 100.8L131.1 100.8L130.3 101.4L129.1 102.7L128.2 103.1L128.7 104.1L129.4 104.8L128.5 105.4L127.6 105.9L126.9 105.3L126.4 104.0L126.0 104.8L124.7 103.6L123.8 103.1L122.7 102.9L121.8 102.8L121.2 103.5L120.9 102.6L121.1 101.5L121.2 100.6L121.0 99.5L122.0 99.3L122.8 100.2L123.5 101.0L124.6 100.7L125.6 101.4L127.1 101.1L127.9 100.6L129.1 100.2L129.9 99.7L130.7 99.1L131.8 99.3L133.2 99.5L135.0 100.1L136.1 101.1L137.1 101.8ZM120.4 83.5L119.8 84.2L120.3 85.4L119.9 86.2L119.4 87.2L119.2 88.4L119.4 89.4L119.3 90.4L119.0 91.3L118.6 92.2L119.0 93.2L118.4 94.0L118.7 95.0L118.2 95.8L117.2 95.3L116.2 94.9L114.6 94.9L113.6 94.6L112.3 94.1L110.9 92.9L110.1 91.7L109.0 90.9L108.0 90.0L109.2 89.3L109.7 88.5L110.0 87.5L111.1 87.1L111.8 86.4L112.8 86.8L113.7 86.1L114.5 85.5L115.0 84.7L115.9 84.3L116.9 84.4L117.8 84.1L118.7 83.9L119.7 83.5ZM22.7 33.0L24.3 32.9L25.9 32.8L27.6 32.7L29.2 32.5L30.6 33.5L32.0 33.9L33.3 34.4L34.7 34.8L36.1 35.2L37.4 35.7L38.8 36.1L40.2 36.5L41.2 36.5L42.2 36.5L43.2 36.5L44.2 36.5L45.3 36.5L46.3 36.5L47.3 36.5L48.3 36.5L48.3 35.5L49.6 35.2L50.8 35.2L52.1 35.2L53.4 35.2L54.2 36.1L55.2 36.7L56.1 37.5L57.3 38.2L58.0 39.0L58.5 39.9L59.0 41.2L59.8 41.8L60.9 42.4L62.1 43.0L63.1 43.1L63.7 42.3L64.1 41.3L65.1 40.9L66.2 40.9L67.3 40.9L68.2 41.4L68.9 41.9L69.8 42.7L70.4 43.7L71.0 44.6L71.6 45.6L72.3 46.5L73.1 47.1L73.4 48.1L74.0 49.3L74.3 50.2L75.2 50.7L76.3 51.2L77.5 51.7L78.9 51.9L80.2 52.0L79.9 53.0L79.4 54.0L78.7 56.5L78.5 57.7L78.4 59.6L78.4 60.6L78.1 61.6L78.3 62.6L78.9 63.9L79.7 64.6L78.9 64.0L79.1 65.0L79.5 65.9L80.0 66.8L81.4 68.6L82.1 69.5L82.4 70.4L83.1 71.4L83.7 72.3L84.5 72.9L85.8 72.9L86.9 73.4L87.6 74.4L88.7 74.3L89.6 74.0L90.5 73.6L91.4 73.6L92.4 73.5L93.6 73.0L94.7 72.9L95.5 73.5L96.6 73.3L96.9 72.4L97.7 71.7L98.6 71.0L98.7 69.9L99.3 69.0L99.3 68.0L99.4 67.1L99.7 66.2L101.0 65.5L103.9 65.0L104.8 64.7L105.8 64.6L107.1 64.7L108.6 65.0L109.6 64.9L110.0 65.8L109.6 66.9L108.7 67.7L108.1 68.5L108.1 69.4L107.4 70.2L107.5 71.3L107.5 72.6L107.2 73.6L106.4 72.8L105.7 73.4L104.8 74.0L104.2 75.0L103.2 75.0L101.5 75.4L100.2 75.4L98.9 75.4L97.9 75.4L97.9 76.5L96.7 77.0L97.5 77.8L98.4 78.4L98.9 79.2L99.4 80.2L97.9 80.4L96.6 80.4L95.5 80.8L94.7 82.1L94.7 83.3L94.5 84.2L93.4 84.0L92.6 83.1L91.6 82.2L90.5 81.4L89.5 80.5L88.5 80.1L87.3 80.1L86.6 79.4L85.9 80.1L85.0 80.7L84.1 81.0L82.8 81.5L81.1 81.4L80.0 80.9L78.4 80.7L77.3 80.0L76.2 79.8L75.5 79.1L73.8 78.7L72.8 78.6L71.9 78.0L70.7 77.6L69.5 77.2L68.6 76.6L67.7 76.0L66.9 75.3L65.6 75.0L64.6 74.8L63.3 74.3L62.0 73.9L61.3 73.1L60.3 72.3L59.3 71.7L57.7 71.1L56.7 70.0L56.2 69.2L55.8 68.2L56.8 67.5L56.1 66.8L56.9 65.9L57.0 64.8L56.0 63.9L55.7 62.4L55.3 61.6L54.0 60.3L53.0 59.2L52.0 57.9L49.6 56.2L48.9 55.6L48.3 54.8L47.6 54.0L46.8 53.5L45.9 53.2L44.9 52.6L45.0 51.4L45.3 50.5L44.7 49.8L43.7 49.6L43.3 48.7L42.4 48.5L41.7 47.8L41.5 46.7L40.5 46.4L39.5 45.7L38.9 45.0L38.1 44.5L37.6 43.7L36.9 42.9L36.3 42.0L35.8 41.1L35.3 40.4L35.0 39.5L34.4 38.4L34.2 37.4L33.1 36.6L32.5 35.9L31.4 36.0L30.1 35.3L29.0 34.8L29.2 35.9L29.1 37.0L29.6 38.1L29.8 39.6L30.5 40.6L31.5 41.4L32.4 42.1L33.0 42.9L33.6 43.6L34.3 44.6L35.1 45.5L35.3 46.6L36.5 47.5L36.9 48.4L37.7 49.4L38.2 50.2L37.9 49.3L38.7 50.2L39.1 51.1L39.3 52.0L39.9 53.1L40.6 54.3L41.2 55.1L41.3 56.6L42.0 57.1L43.1 57.1L43.7 57.8L44.6 58.8L44.7 59.9L44.0 60.5L42.9 60.5L42.6 59.5L42.1 58.7L41.0 58.0L40.2 57.3L39.1 56.7L38.3 56.0L37.2 55.2L37.2 53.8L37.1 52.5L36.3 51.2L34.5 50.2L34.1 49.1L32.8 49.8L32.1 49.1L31.1 48.5L30.2 47.9L29.2 47.1L30.0 46.7L31.0 46.9L31.4 45.4L31.2 44.3L29.7 42.9L29.0 42.2L27.9 41.7L26.8 41.0L26.5 40.1L25.9 39.1L25.7 38.0L25.0 37.3L24.6 36.4L24.0 35.4L23.5 34.6L22.9 33.7ZM37.2 56.0L36.6 55.3L36.9 53.9L36.8 55.0L37.2 55.9ZM120.4 83.5L119.3 83.6L118.4 84.1L117.4 84.3L116.4 84.6L115.5 84.1L114.8 84.8L114.3 85.6L113.4 86.3L112.3 86.5L111.3 87.1L110.1 87.1L110.1 88.1L109.5 88.9L108.4 89.3L107.9 88.5L107.0 88.1L107.3 86.9L106.4 86.7L105.3 86.8L104.4 86.3L103.6 85.7L102.6 85.2L103.0 84.1L103.7 83.1L104.5 82.5L105.4 81.7L106.3 81.3L107.3 80.9L108.3 81.1L109.6 81.3L110.8 81.2L111.7 81.0L112.9 80.6L113.7 80.9L114.6 80.9L116.1 81.0L117.2 81.2L118.6 82.3L117.7 82.1L118.6 82.7L119.4 82.9L120.2 83.4ZM94.3 84.8L94.5 83.8L94.4 82.8L95.1 81.5L95.7 80.4L97.2 80.4L98.7 80.4L99.4 79.9L98.9 79.0L97.9 78.1L97.2 77.4L97.9 76.5L97.9 75.4L98.9 75.4L100.2 75.4L101.5 75.4L102.5 75.4L103.1 76.1L103.1 77.5L103.0 79.1L102.9 80.2L103.8 81.0L104.7 81.3L105.8 81.4L104.9 82.1L104.1 82.8L103.2 83.3L103.1 84.5L102.6 85.2L101.7 85.9L100.9 86.4L99.3 86.7L97.4 86.6L96.0 86.1L94.3 84.8ZM375.3 104.0L376.8 104.0L377.1 104.5L377.1 105.2L375.8 107.1L375.5 108.0L375.0 108.7L373.0 108.3L372.7 107.7L372.8 106.9L373.7 106.6L374.3 105.6L374.4 104.8L374.7 104.2L375.3 104.0ZM397.6 117.8L397.7 119.8L397.7 121.5L397.7 123.3L397.7 125.2L397.7 126.8L397.7 127.9L395.9 127.9L393.6 127.9L391.2 127.9L388.9 127.9L387.7 127.8L386.4 127.8L385.7 128.2L385.0 128.0L384.4 127.7L384.1 127.2L383.4 127.2L382.7 127.6L382.0 126.9L381.4 126.8L380.9 126.7L381.3 125.3L381.8 124.1L382.6 123.2L383.1 122.5L383.8 121.1L384.5 119.9L384.3 118.6L384.5 116.6L384.8 117.1L386.0 117.8L388.9 117.8L390.5 117.8L393.0 117.8L395.7 117.8L397.6 117.8ZM102.6 85.2L103.4 85.5L104.3 86.2L105.1 86.8L106.0 86.4L107.0 86.7L107.1 87.8L106.7 88.8L105.3 88.7L104.0 88.5L102.8 87.9L101.3 87.7L100.4 87.2L101.1 86.3L102.0 85.8ZM143.1 127.0L142.1 127.1L142.7 127.9L143.1 128.8L142.6 129.8L142.2 131.1L141.3 132.2L140.8 132.9L140.0 133.4L139.1 134.1L137.7 134.6L136.7 135.0L135.7 135.3L134.9 136.2L134.1 137.1L133.8 138.0L133.4 139.0L133.3 139.9L132.6 140.5L131.8 141.0L131.1 140.4L130.5 139.6L129.6 139.4L128.7 139.4L128.1 138.7L128.8 138.0L128.8 137.0L129.2 136.1L130.0 134.7L130.0 133.5L129.1 134.0L128.2 134.3L127.5 133.6L126.7 133.0L127.3 132.3L127.2 130.7L126.9 129.8L127.7 129.3L128.2 128.4L128.6 127.2L129.4 126.3L129.3 125.0L130.1 124.1L131.0 123.7L132.7 123.2L133.6 123.2L134.3 123.7L135.1 124.1L136.1 124.3L136.9 125.5L137.8 125.7L138.8 126.0L139.8 126.0L140.8 125.7L141.7 126.5L142.5 126.8ZM97.1 126.6L97.9 127.9L98.4 128.9L97.5 129.7L96.5 129.4L97.4 128.5L96.8 127.5L96.1 126.8L97.1 126.6ZM153.2 74.8L152.9 73.7L153.3 72.8L153.3 71.9L153.4 70.8L153.3 69.9L154.1 69.4L155.2 69.4L156.3 69.7L157.4 70.1L158.4 70.1L158.8 70.9L160.2 71.1L159.4 71.5L160.3 71.9L161.4 72.0L162.7 72.8L162.6 73.8L161.7 73.9L160.4 73.6L159.3 73.6L158.2 73.8L156.9 74.3L155.6 74.0L154.6 75.3L153.8 75.6L153.2 74.8ZM124.2 60.0L125.6 60.1L126.6 60.2L127.6 60.2L128.4 60.6L129.6 60.8L130.8 61.7L131.6 62.2L132.7 62.2L134.8 63.0L135.6 63.6L136.6 64.0L137.5 64.3L138.3 64.9L139.1 65.4L140.3 65.6L141.3 65.9L142.2 66.3L142.9 67.1L144.0 67.2L144.9 67.6L145.7 68.2L144.9 69.0L144.0 69.2L143.1 69.4L142.0 69.3L140.6 69.2L139.5 69.2L138.4 69.3L137.5 69.4L136.1 69.5L137.5 68.3L137.5 67.3L136.4 67.1L135.3 67.1L134.3 66.4L133.7 65.4L133.2 64.5L131.8 64.6L129.8 64.1L128.8 63.7L128.1 63.0L126.7 63.2L125.8 63.0L124.3 62.8L123.5 62.2L124.4 62.0L121.6 61.4L120.8 61.9L120.0 62.5L119.1 62.8L118.2 62.9L117.3 63.7L116.4 63.6L115.4 63.8L116.4 63.3L116.9 62.3L117.6 61.6L120.1 60.6L121.8 60.4L122.7 60.0L124.2 60.0ZM122.1 64.6L121.3 65.0L120.3 64.5L120.9 63.5L121.8 63.9ZM122.1 99.1L121.2 99.4L121.0 100.6L121.1 101.5L120.9 102.6L121.2 103.5L120.5 102.7L120.0 101.8L119.3 102.4L119.1 101.4L118.7 100.4L117.6 99.7L116.6 99.3L115.9 98.2L115.0 97.6L115.4 98.4L114.8 99.1L113.3 98.2L112.7 97.1L113.2 96.1L112.5 95.3L113.2 94.6L114.6 94.9L115.7 95.0L116.8 95.1L117.7 95.7L118.8 95.7L119.6 96.6L120.5 97.8L121.2 98.6L122.1 99.1ZM154.5 92.6L153.3 92.9L152.5 93.3L151.8 94.5L150.9 95.1L150.0 96.5L149.7 97.8L149.5 98.9L148.8 99.9L149.8 100.4L150.4 101.2L151.0 102.3L151.5 103.2L151.2 104.2L151.2 105.2L152.1 105.8L152.8 106.6L154.1 106.5L155.0 106.6L155.9 106.3L156.9 106.5L157.9 106.7L158.6 107.4L159.4 108.5L160.3 109.0L161.3 108.9L162.7 109.0L163.6 108.9L164.8 108.6L165.6 109.4L165.1 110.3L164.6 111.2L164.6 112.5L164.4 113.7L164.7 114.6L165.0 115.6L165.9 116.7L165.4 117.5L164.5 118.4L165.3 119.0L166.0 119.6L166.4 120.5L166.8 121.5L167.1 122.5L166.7 123.3L166.7 122.1L166.0 120.9L164.9 121.2L164.1 121.7L162.8 121.8L161.4 121.8L160.2 121.8L159.3 121.7L158.7 122.9L159.4 123.6L160.4 123.8L160.6 124.7L159.6 124.7L158.7 125.0L158.1 126.2L158.1 127.1L158.8 127.8L159.4 128.4L159.6 129.4L160.0 130.2L159.8 131.4L159.6 132.5L159.2 134.4L159.0 135.4L158.9 136.4L158.5 138.2L157.6 137.9L156.2 137.6L157.1 136.2L157.8 135.0L157.4 134.1L156.4 133.6L155.6 133.1L154.5 133.4L153.5 133.0L152.6 133.4L151.7 133.7L150.7 133.5L149.8 133.6L149.2 132.9L149.1 132.0L148.2 131.6L147.9 130.5L147.0 130.0L146.1 129.5L145.6 128.4L144.8 127.7L143.9 127.2L142.5 126.8L141.7 126.5L140.9 125.8L140.1 125.4L139.3 126.0L138.4 125.9L137.3 125.7L136.8 124.9L135.7 124.3L134.7 123.9L133.8 123.3L132.9 122.6L132.5 121.7L133.6 121.6L133.5 120.1L134.3 119.6L135.2 119.4L135.9 118.7L136.5 117.9L137.1 117.1L137.9 115.4L136.9 115.0L137.1 114.1L137.3 113.1L137.1 112.1L137.0 111.1L137.4 110.1L136.8 108.9L137.1 108.0L136.4 107.0L135.8 106.2L135.9 105.2L137.1 104.5L137.5 103.6L137.0 102.7L138.2 103.0L138.4 103.9L138.8 102.8L138.5 101.9L140.2 100.8L140.9 99.7L142.0 99.5L142.0 98.4L142.3 97.3L142.5 96.4L143.2 95.7L144.1 94.9L145.5 95.1L146.2 94.3L147.4 94.2L148.7 94.2L150.4 93.0L151.7 92.5L152.1 91.6L153.3 91.0L154.6 91.2L155.0 92.0ZM157.1 179.6L158.1 179.4L158.8 178.5L158.8 177.6L159.7 177.1L160.2 178.4L160.8 179.1L161.0 180.1L161.2 181.2L161.8 181.9L162.6 182.5L162.0 183.5L162.3 184.4L162.0 185.3L162.6 186.1L162.8 187.0L163.5 188.1L163.5 189.0L163.8 190.0L164.2 190.9L164.4 191.9L165.2 192.6L166.3 192.4L166.7 193.7L166.3 194.8L166.0 195.7L164.4 196.5L163.3 197.0L162.6 197.7L162.7 198.7L162.3 199.9L162.6 200.9L162.8 201.8L162.4 202.6L162.6 203.5L163.1 204.4L162.3 204.9L161.3 205.6L160.8 206.6L160.2 207.6L159.3 208.6L159.0 209.6L158.8 210.5L158.3 211.8L158.5 212.8L158.6 213.7L157.8 214.2L157.4 215.5L157.0 216.4L156.6 217.2L157.0 218.4L157.3 219.4L157.8 220.2L157.9 221.2L158.0 222.1L158.8 222.6L158.6 223.5L158.6 224.4L158.6 225.4L157.9 226.1L157.5 226.9L157.1 227.9L157.1 229.0L157.1 230.1L156.5 231.0L155.7 231.6L155.1 232.4L155.0 233.4L154.9 234.4L154.9 235.5L155.3 236.7L155.7 237.6L155.1 238.3L154.2 238.9L154.2 239.9L153.8 240.8L153.5 241.7L153.1 242.6L152.9 243.7L152.9 244.8L152.8 245.9L153.0 247.0L153.2 248.0L152.3 248.3L152.2 249.2L152.1 250.5L153.1 251.0L153.0 252.1L153.3 253.0L153.0 254.1L154.5 254.7L154.6 255.6L153.5 255.7L152.3 255.7L153.7 256.3L154.4 257.0L153.9 257.8L153.2 258.4L153.4 259.3L153.3 260.4L152.9 261.5L152.8 262.5L151.7 263.4L151.2 264.3L151.6 265.3L151.1 266.2L150.8 267.1L150.0 267.7L149.2 268.4L148.3 268.7L148.2 269.8L148.2 270.8L148.7 271.8L149.1 272.6L150.2 272.6L151.2 272.5L151.7 273.3L151.7 274.2L151.3 275.2L152.1 275.7L152.7 276.4L154.2 276.5L155.6 276.5L156.9 276.5L158.4 276.5L159.7 276.9L161.4 277.1L162.3 277.3L161.1 277.2L159.9 277.3L159.0 277.9L157.2 278.4L156.0 278.7L155.5 280.0L155.5 281.0L154.5 281.9L153.4 281.7L152.2 281.3L151.4 280.7L152.3 280.1L152.8 280.9L153.3 280.0L154.2 279.7L154.9 279.0L152.8 279.4L151.7 279.7L151.0 280.4L149.6 280.2L149.9 279.2L150.7 278.7L152.2 278.4L153.1 278.4L151.9 278.0L150.7 278.0L149.8 278.7L149.3 279.6L148.3 279.3L148.9 278.5L148.0 278.5L147.0 278.5L146.5 277.6L145.9 276.8L147.2 277.2L148.1 276.9L149.2 276.9L150.1 276.4L150.8 276.9L151.1 276.0L150.3 275.2L149.3 274.9L150.2 275.4L149.1 276.5L148.1 276.6L147.5 275.9L146.3 275.6L147.1 274.6L146.2 274.2L145.1 274.0L143.9 273.3L144.8 272.6L145.7 272.1L146.2 273.0L147.2 273.4L147.7 272.6L146.8 273.1L146.2 272.1L145.3 271.5L145.8 270.6L146.7 270.8L145.8 270.1L146.5 269.4L146.7 268.5L146.1 269.3L145.7 268.0L145.8 266.7L146.7 266.3L145.8 266.4L145.1 265.7L145.6 265.0L147.2 265.1L148.1 265.5L147.8 264.6L146.5 264.8L145.7 264.5L146.4 263.8L145.4 263.3L146.1 262.7L146.2 261.7L144.8 261.7L143.9 261.3L142.9 261.1L142.5 261.9L141.9 261.2L142.6 260.6L143.7 259.9L143.7 258.8L144.9 258.8L145.9 258.6L146.4 257.8L146.9 258.7L146.5 259.6L145.6 259.8L146.9 259.6L147.1 258.8L147.3 260.3L147.8 259.2L147.4 258.1L148.6 257.4L149.7 257.6L149.0 257.1L149.4 256.1L150.4 255.6L150.1 254.6L149.2 254.1L149.0 253.1L149.7 252.4L149.4 251.5L150.0 250.7L150.1 249.6L150.3 248.5L151.3 248.9L151.1 247.6L150.1 247.4L151.1 246.9L150.2 246.4L149.1 247.0L148.1 247.1L147.3 246.3L146.9 245.1L147.4 243.3L147.7 242.2L148.5 241.3L148.9 240.3L148.3 238.0L148.3 236.5L147.7 235.3L147.7 234.3L148.9 233.9L149.2 232.9L149.7 231.9L150.3 230.3L150.7 229.2L151.4 228.2L152.0 227.3L152.4 226.4L152.5 225.5L152.9 224.3L153.6 223.3L153.3 222.0L154.1 220.8L153.9 219.5L153.9 218.3L153.7 217.4L153.5 216.5L153.4 215.3L153.5 214.1L154.2 213.5L154.5 212.1L154.0 210.8L154.0 209.8L154.6 208.8L155.0 207.5L155.2 206.6L155.6 205.4L155.9 204.3L156.2 203.3L156.4 202.2L156.3 201.2L156.4 200.3L157.0 199.4L156.7 198.1L156.7 196.8L156.8 195.7L157.1 194.8L156.6 194.0L157.0 193.1L157.5 191.7L157.6 190.6L157.8 189.7L158.0 188.6L157.7 186.4L157.8 185.0L157.8 183.8L157.7 182.8L157.3 180.9L157.2 179.7ZM162.2 278.4L162.2 280.1L162.2 281.6L162.2 283.2L162.1 284.7L160.9 284.9L159.8 284.7L158.6 284.5L157.6 284.5L156.2 284.4L154.7 284.2L153.0 284.0L154.0 283.5L154.9 283.5L156.0 283.2L157.1 283.7L156.4 283.0L155.8 282.2L156.3 281.5L157.2 282.2L157.6 283.0L158.7 283.3L159.9 283.4L160.9 283.5L158.3 282.6L157.8 281.6L159.2 281.1L160.0 280.8L159.0 280.3L158.0 280.6L157.1 280.2L157.3 279.4L158.0 278.7L159.0 278.6L159.7 277.9L160.7 278.4L161.8 278.1ZM166.7 285.6L165.8 285.9L164.8 285.9L163.8 285.8L163.2 285.1L164.4 284.9L165.7 285.0L166.6 285.3ZM147.4 251.6L146.4 251.6L145.9 250.8L146.3 249.4L146.3 248.5L146.7 247.4L148.1 247.4L148.4 248.2L148.1 249.1L148.2 250.1L147.8 250.9ZM145.4 268.3L145.3 269.6L145.1 270.7L144.2 269.9L144.7 269.1L143.9 269.6L143.0 270.3L142.4 269.6L142.9 268.6L143.8 267.9L144.2 267.1L145.1 267.1L145.4 268.3ZM142.4 267.2L142.4 265.9L142.8 265.0L143.4 266.2L142.6 267.0ZM145.7 279.1L146.6 279.3L147.8 279.6L148.8 280.1L147.4 279.7L146.4 279.6L145.2 279.1ZM145.1 266.7L144.1 266.8L143.5 265.8L143.3 264.9L144.2 264.5L144.7 265.3L145.0 266.2ZM149.9 280.7L151.1 281.1L151.9 281.7L151.2 282.3L150.3 282.5L149.7 281.8L148.8 282.1L148.0 281.2L149.4 280.8ZM144.4 275.4L145.2 276.4L144.8 277.3L143.8 276.6L143.9 275.7ZM159.1 284.9L161.4 285.2L162.7 285.0L163.2 285.9L163.9 286.6L162.7 286.5L161.8 286.4L161.0 285.8L160.1 286.0L159.2 285.7L158.3 285.5L159.1 284.9ZM154.3 282.3L155.3 282.6L154.5 283.1L153.5 282.9L152.3 282.6L153.4 282.0L154.3 282.3ZM147.5 254.6L146.8 255.1L147.4 256.2L147.5 257.1L146.5 257.3L146.0 256.5L145.3 255.6L145.5 254.7L146.5 254.6L147.1 253.8ZM149.7 255.7L148.6 255.8L148.8 254.9L150.1 254.8L149.7 255.7ZM143.6 267.4L142.8 268.3L142.0 267.7L143.0 267.3ZM145.2 274.4L144.3 274.8L143.3 275.2L144.2 274.4L145.1 274.3ZM143.7 271.6L142.6 271.7L142.9 270.8L143.9 271.0ZM145.9 258.3L144.8 258.4L145.3 257.5L145.9 256.8L146.1 258.0ZM155.4 284.7L156.5 285.0L157.5 285.3L156.6 285.4L155.6 285.3L154.6 284.8ZM159.7 177.1L159.3 176.3L160.1 175.7L160.8 174.9L161.4 173.9L160.6 173.3L160.0 172.0L160.3 171.1L160.2 170.0L160.4 169.0L161.0 168.2L161.5 167.3L161.1 166.4L161.2 165.3L161.2 164.1L161.8 163.3L161.7 162.1L161.0 160.9L160.4 159.9L159.8 158.9L161.2 158.4L162.1 158.7L163.1 158.3L163.8 157.5L164.8 157.5L165.7 156.6L166.6 156.3L167.7 155.5L168.6 155.1L170.0 154.9L171.1 154.9L171.7 155.6L171.5 156.7L171.5 157.6L171.7 158.5L171.7 159.5L172.2 160.3L172.7 161.1L173.6 161.7L174.3 162.5L175.4 162.7L176.4 162.7L177.4 163.2L178.3 163.4L179.1 164.2L180.3 164.5L181.5 165.3L182.5 165.7L183.8 165.6L185.0 166.1L185.7 166.6L185.7 167.6L186.1 168.7L186.3 170.2L186.4 171.3L186.5 172.5L186.5 173.6L187.5 173.6L188.7 173.7L190.1 173.7L191.3 173.7L191.5 174.7L191.6 175.9L192.2 176.7L193.1 177.2L193.8 178.4L194.3 179.2L193.6 180.7L193.4 181.6L192.9 182.7L192.4 183.6L193.2 184.3L192.3 184.8L192.3 183.8L191.4 183.3L189.7 182.3L188.4 182.3L187.0 182.3L185.8 182.6L184.5 182.8L182.7 183.2L181.8 183.8L181.3 184.9L180.5 185.9L180.5 187.4L180.2 188.4L179.7 190.0L177.6 190.1L176.5 190.1L175.2 191.1L174.6 192.4L174.2 191.5L173.5 190.6L172.5 190.4L171.3 190.4L170.2 190.1L169.3 189.5L168.7 190.4L167.7 190.7L166.9 191.5L166.4 192.3L165.2 192.6L164.4 192.3L164.2 191.0L163.8 190.0L163.5 189.0L163.5 188.1L162.8 187.0L162.6 186.1L161.8 185.5L161.9 184.6L162.0 183.6L162.6 182.7L161.8 181.9L161.2 181.2L161.0 180.1L160.8 179.1L160.2 178.4L159.7 177.5ZM193.9 213.7L193.3 214.5L193.3 215.6L193.1 216.6L192.7 217.4L192.5 218.4L192.3 219.4L192.2 220.5L192.3 221.6L191.5 222.6L191.2 223.7L191.6 224.6L191.3 225.5L192.0 226.6L193.5 227.2L194.8 228.1L195.2 229.0L194.6 230.1L195.5 231.3L196.4 231.4L196.6 232.5L195.4 234.6L194.5 235.4L194.1 236.4L192.3 237.4L189.9 238.1L188.0 238.5L184.5 239.0L183.1 239.0L181.7 238.9L180.8 238.5L180.3 239.5L181.1 240.1L180.9 241.4L180.1 242.5L180.6 243.9L179.0 244.9L177.8 245.2L176.6 245.3L175.2 244.8L173.7 244.4L172.9 244.0L172.2 244.6L172.6 246.4L172.5 247.6L173.5 248.3L174.3 248.9L175.3 248.8L175.9 248.0L176.7 248.9L176.6 249.8L175.4 250.2L174.8 249.5L173.7 249.2L172.7 249.6L173.7 250.3L174.6 250.5L173.5 251.0L172.7 251.4L171.9 252.2L172.0 253.6L171.8 254.5L170.8 255.3L170.8 256.3L169.2 256.2L168.4 256.7L167.2 257.0L166.2 258.0L165.3 259.1L165.3 260.2L167.6 262.1L169.8 262.3L170.5 263.1L170.1 264.1L169.1 264.5L170.2 264.5L168.7 265.9L167.5 266.5L166.5 266.9L165.6 267.7L164.9 268.5L164.7 270.3L163.6 271.0L162.6 270.7L161.4 270.6L162.3 270.7L161.3 271.8L160.7 272.9L160.1 273.7L161.0 274.5L160.1 275.2L161.1 275.4L162.0 276.5L162.9 277.4L162.0 277.2L160.6 276.9L159.1 276.7L156.9 276.5L155.6 276.5L154.2 276.5L152.7 276.4L152.1 275.7L151.3 275.2L151.7 274.2L151.7 273.3L151.2 272.5L150.2 272.6L149.2 272.8L148.7 271.8L148.2 270.8L148.2 269.8L148.3 268.7L149.2 268.7L149.7 267.8L150.6 267.4L150.8 266.5L151.7 265.6L151.0 264.9L151.5 263.7L152.2 263.1L152.6 262.1L153.3 261.2L153.2 260.1L153.6 259.1L153.2 258.0L154.4 257.3L153.9 256.5L152.4 256.0L153.5 255.7L154.6 255.6L154.8 254.7L153.0 254.5L153.2 253.6L153.1 252.7L152.8 251.8L152.4 250.9L152.2 249.9L152.3 248.7L153.2 248.0L153.0 247.0L152.8 245.9L152.9 244.8L152.9 243.7L153.4 242.9L153.5 242.0L153.4 241.1L154.1 240.2L154.2 239.0L155.1 238.3L155.8 237.7L155.3 236.7L154.9 235.5L155.0 234.6L155.1 233.6L154.9 232.6L155.5 231.8L156.2 231.2L157.1 230.6L157.1 229.3L156.7 228.4L157.3 227.3L157.7 226.3L158.1 225.5L158.6 224.4L158.6 223.5L158.8 222.6L158.0 222.1L157.9 221.2L157.8 220.2L157.3 219.4L157.0 218.4L156.6 217.2L156.9 216.3L157.4 215.5L157.7 214.6L158.5 213.9L158.5 212.8L158.3 211.8L158.6 210.7L159.0 209.6L159.3 208.6L160.0 207.8L160.7 207.1L161.0 206.1L161.5 205.2L162.5 204.7L163.0 203.9L162.4 203.1L162.8 202.0L162.6 200.9L162.3 199.9L162.8 199.1L162.4 198.3L162.8 197.4L163.9 196.7L165.3 196.2L166.3 194.8L166.7 193.7L166.3 192.4L166.8 191.7L167.6 191.1L168.3 190.5L169.1 189.6L170.2 190.1L171.2 190.4L172.5 190.4L173.5 190.6L174.2 191.5L174.6 192.5L174.9 191.5L175.6 190.3L177.6 190.1L178.9 190.1L179.5 190.8L180.7 191.8L181.5 193.1L182.2 193.7L183.0 194.3L183.9 194.8L184.6 195.4L185.6 195.7L186.7 195.9L188.2 196.6L189.4 197.5L190.7 198.1L191.6 198.4L192.9 198.9L193.8 199.7L193.6 200.6L193.1 201.5L192.5 202.2L192.3 203.3L191.8 204.2L191.0 204.9L192.3 205.3L193.3 205.4L194.6 205.7L195.8 205.7L196.8 205.8L197.9 205.5L199.0 205.5L199.8 204.9L200.8 204.4L201.5 203.8L202.4 202.5L202.5 200.4L203.6 200.4L204.6 200.6L205.0 201.8L205.1 202.9L205.1 203.9L204.8 204.8L204.0 205.3L203.0 205.8L202.1 206.0L201.3 206.7L200.4 207.2L199.3 207.9L198.8 208.7L197.9 209.5L197.2 210.5L196.3 211.4L195.4 212.3L194.8 212.9L194.1 213.5ZM162.1 284.7L162.2 283.2L162.2 281.6L162.2 280.1L162.2 278.4L163.1 279.1L162.5 279.9L163.6 280.2L164.2 281.1L165.5 282.0L166.7 282.7L167.9 283.1L169.1 283.8L170.5 284.1L171.6 284.1L170.9 284.9L169.9 284.9L169.0 285.1L168.0 285.2L167.1 284.9L164.6 284.7L163.4 284.6L162.2 284.6ZM174.0 284.3L174.9 284.3L175.9 284.3L174.6 284.5L173.7 284.8Z","us":"M29.6 32.5L30.3 31.9L29.7 31.3L30.0 30.1L30.1 29.2L30.7 28.4L30.7 27.5L30.1 26.6L29.9 25.7L29.9 24.7L29.6 23.9L29.5 22.8L30.5 22.6L31.5 22.5L31.5 21.2L31.5 20.2L33.6 20.2L35.9 20.2L39.1 20.2L40.1 20.2L41.8 20.1L44.2 20.2L45.9 20.2L45.9 24.3L45.9 27.3L45.9 28.8L45.9 36.5L43.2 36.5L41.8 36.5L40.1 36.5L36.4 35.3L34.2 34.6L33.1 34.3L29.3 33.1ZM45.9 8.6L48.4 8.6L50.0 8.6L53.4 8.6L55.5 8.6L58.0 8.6L60.3 8.6L63.2 8.6L64.6 8.6L66.0 8.6L66.0 11.5L66.0 12.5L66.0 13.5L66.1 17.1L66.1 20.2L64.2 20.2L61.2 20.2L59.5 20.2L57.6 20.2L54.1 20.2L52.2 20.2L50.6 20.2L48.2 20.2L45.9 20.2L45.9 18.7L45.9 16.8L45.9 15.2L45.9 10.1L45.9 8.6ZM115.1 37.4L115.5 38.3L116.9 38.3L119.6 38.5L121.7 38.6L123.1 38.7L123.9 37.9L124.9 38.2L125.5 39.2L125.7 40.4L126.1 41.6L126.8 42.9L127.5 43.9L128.0 44.8L127.9 45.8L128.4 46.8L128.8 47.9L129.2 48.9L129.4 50.1L129.3 51.1L129.2 52.3L128.6 53.1L128.6 54.1L127.9 54.9L127.2 54.2L126.2 54.2L126.0 53.3L125.5 52.5L124.6 52.3L124.3 51.2L123.7 50.3L123.6 49.3L122.5 48.8L121.9 47.8L122.2 47.0L121.8 46.0L121.9 46.9L121.4 46.0L121.6 45.1L121.8 44.2L121.5 43.2L120.7 42.8L120.2 42.0L119.5 41.3L118.9 40.5L117.9 40.0L116.9 40.3L116.1 40.8L115.1 41.1L114.1 41.3L113.7 40.4L112.9 39.9L112.0 39.4L111.0 39.2L110.1 39.2L108.9 39.4L107.9 39.5L108.2 38.5L107.5 37.9L109.3 37.4L110.7 37.5L112.5 37.5L113.7 37.5L115.1 37.4ZM63.3 21.6L65.5 21.6L67.3 21.6L68.8 21.6L70.7 21.6L71.9 21.6L71.9 27.2L72.8 27.7L73.7 27.5L74.5 28.2L75.4 28.3L76.3 28.6L77.2 28.5L77.9 29.1L78.9 28.9L79.8 29.2L80.8 28.9L81.8 29.1L82.5 29.7L83.6 29.2L84.6 29.0L85.6 29.1L86.5 29.3L87.3 29.7L88.2 30.1L89.1 30.1L89.1 31.6L89.1 34.6L89.7 35.3L90.1 36.2L90.5 37.2L90.3 38.2L89.9 39.2L90.0 40.1L89.4 40.8L87.5 41.9L87.1 41.0L86.3 41.6L86.3 42.5L85.6 43.2L84.4 44.0L83.4 44.4L82.5 44.9L81.6 45.4L80.9 46.0L80.3 46.7L79.7 47.7L79.5 48.8L79.7 50.1L80.0 51.0L79.6 50.0L79.4 48.9L79.5 47.9L80.0 47.0L80.6 46.1L81.3 45.5L82.2 45.1L81.2 44.9L80.8 45.7L80.0 46.6L79.2 46.4L79.6 47.3L79.2 48.1L79.3 49.0L79.3 50.1L79.7 51.0L80.2 52.0L79.3 52.3L78.4 51.7L77.5 51.6L76.6 51.4L75.7 51.1L74.8 50.7L74.2 49.9L73.8 49.2L73.6 48.2L73.3 47.3L72.5 46.8L72.0 46.1L71.3 45.4L70.8 44.6L70.4 43.7L69.8 42.8L69.0 42.1L68.3 41.4L67.5 40.9L66.4 40.9L65.3 40.7L64.3 41.1L63.8 41.9L63.3 42.8L62.4 43.1L61.6 42.7L60.5 42.3L59.7 41.7L58.9 41.3L58.5 40.4L58.2 39.5L57.8 38.6L56.9 38.0L56.0 37.5L55.1 36.6L54.1 36.1L53.6 35.3L52.8 34.9L56.3 34.6L58.9 34.6L61.2 34.6L63.1 34.6L63.1 31.6L63.1 30.6L63.2 29.5L63.2 25.2L63.2 24.1L63.2 22.1ZM45.9 20.2L48.2 20.2L50.6 20.2L52.2 20.2L54.1 20.2L57.2 20.2L59.5 20.2L61.2 20.2L63.3 20.2L63.3 21.3L63.2 24.1L63.2 25.2L63.2 29.0L63.1 30.6L63.1 31.6L63.1 34.6L61.2 34.6L58.9 34.6L56.3 34.6L52.9 34.6L50.9 35.2L48.3 35.2L48.3 36.5L45.9 36.5L45.9 29.4L45.9 27.3L45.9 25.0L45.9 20.2ZM2.3 5.8L3.9 5.8L5.3 5.7L6.8 5.7L8.2 5.7L10.2 5.8L11.4 5.8L13.4 5.8L14.4 5.8L14.4 9.4L14.4 11.3L14.4 12.3L14.4 13.4L14.4 14.4L15.8 15.4L17.0 16.2L18.7 17.4L20.0 18.4L21.9 19.8L25.2 22.2L27.6 24.1L28.3 24.7L29.8 25.9L30.3 26.7L31.0 27.7L30.4 28.5L30.2 29.5L29.8 30.5L29.6 31.4L30.3 32.1L25.3 32.8L22.7 33.0L22.2 32.2L22.0 31.2L21.3 30.6L20.5 30.0L19.6 29.5L18.9 29.0L18.0 28.7L17.0 28.5L16.2 27.9L15.3 27.6L14.4 27.5L13.0 27.5L12.6 26.6L12.6 25.6L11.9 24.9L11.0 24.1L10.3 23.5L9.7 22.7L8.9 22.0L9.2 21.1L8.8 20.2L7.8 19.9L7.4 18.9L7.1 17.9L7.9 18.5L7.7 17.6L6.7 17.6L5.7 17.3L5.6 16.2L4.8 15.7L3.9 14.8L3.6 13.9L3.5 12.8L3.1 11.9L2.6 11.2L1.9 10.6L2.4 9.1L2.6 8.0L2.6 7.1L2.2 6.2ZM14.4 5.8L16.7 5.8L18.1 5.8L21.2 5.8L22.9 5.8L24.8 5.8L27.9 5.8L29.3 5.8L30.3 5.8L31.5 5.8L31.5 8.6L31.5 10.9L31.5 15.3L31.5 16.9L31.5 18.0L31.5 20.2L31.5 21.2L31.5 22.5L30.6 22.6L29.5 22.8L29.7 23.7L29.9 24.7L29.9 25.7L28.3 24.7L27.6 24.1L25.2 22.2L21.9 19.8L20.6 18.8L18.7 17.4L17.7 16.7L15.8 15.4L14.7 14.6L14.4 13.4L14.4 12.3L14.4 11.3L14.4 9.4L14.4 5.8Z","uso":"M115.1 37.4L113.7 37.5L112.5 37.5L110.7 37.5L109.3 37.4L107.6 37.4L108.2 38.4L108.0 39.4M31.5 20.2L33.6 20.2L35.9 20.2L39.1 20.2L40.1 20.2L41.8 20.1L44.2 20.2L45.9 20.2M45.9 36.5L43.2 36.5L41.8 36.5L40.1 36.5L36.4 35.3L34.2 34.6L33.1 34.3L29.3 33.1M45.9 8.6L48.4 8.6L50.0 8.6L53.4 8.6L55.5 8.6L58.0 8.6L60.3 8.6M60.3 8.6L63.2 8.6L64.6 8.6L66.0 8.6L66.0 11.5M66.0 11.5L66.0 12.5L66.0 13.5L66.1 17.1L66.1 20.2M66.1 20.2L64.2 20.2M45.9 20.2L45.9 18.7L45.9 16.8L45.9 15.2L45.9 10.1L45.9 8.6M124.3 56.0L125.3 55.3L124.7 56.0M123.0 49.8L123.7 50.5L123.0 50.0M115.1 37.4L115.5 38.3L116.9 38.3L119.6 38.5L121.7 38.6L123.1 38.7L123.9 37.9L124.9 38.2M125.3 38.3L125.5 39.2L125.7 40.4L126.1 41.6L126.8 42.9L127.5 43.9L128.0 44.8L127.9 45.8L128.4 46.8L128.8 47.9L129.2 48.9L129.4 50.1L129.3 51.1L129.2 52.3L128.6 53.1L128.6 54.1L127.9 54.9L127.2 54.2L126.2 54.2L126.0 53.3L125.5 52.5L124.6 52.3L124.3 51.2L123.7 50.3L123.6 49.3L122.5 48.8L121.9 47.8L122.2 47.0L121.8 46.0L121.9 46.9L121.4 46.0L121.6 45.1L121.8 44.2L121.5 43.2L120.7 42.8L120.2 42.0L119.5 41.3L118.9 40.5L117.9 40.0L116.9 40.3L116.1 40.8L115.1 41.1L114.1 41.3L113.7 40.4L112.9 39.9L112.0 39.4L111.0 39.2L110.1 39.2L108.9 39.4L107.9 39.5M87.8 29.8L86.8 29.5L85.9 29.0L85.0 29.2L84.0 29.2L83.0 29.3L82.0 29.5L81.1 29.2L80.2 29.6L79.3 29.3L78.2 29.2L77.3 28.6L76.3 28.6L75.4 28.3L74.5 28.2L73.7 27.5L72.8 27.7L71.9 27.2L71.9 21.6L70.7 21.6L68.8 21.6L67.3 21.6L65.5 21.6L63.3 21.6M63.3 21.6L63.3 20.2M87.8 29.8L88.8 30.0M89.1 30.1L89.1 31.6M89.1 31.6L89.1 34.6L89.7 35.3L90.1 36.2L90.5 37.2L90.3 38.2L89.9 39.2L90.0 40.1L89.4 40.8M89.7 41.2L87.5 41.9L87.1 41.0L86.3 41.6L86.3 42.5L85.6 43.2L84.4 44.0L83.4 44.4L82.5 44.9L81.6 45.4L80.9 46.0L80.3 46.7L79.7 47.7L79.5 48.8L79.7 50.1L80.0 51.0L79.6 50.0L79.4 48.9L79.5 47.9L80.0 47.0L80.6 46.1L81.3 45.5L82.2 45.1L81.2 44.9L80.8 45.7L80.0 46.6L79.2 46.4L79.6 47.3L79.2 48.1L79.3 49.0L79.3 50.1L79.7 51.0L80.2 52.0L79.3 52.3L78.4 51.7L77.5 51.6L76.6 51.4L75.7 51.1L74.8 50.7L74.2 49.9L73.8 49.2L73.6 48.2L73.3 47.3L72.5 46.8L72.0 46.1L71.3 45.4L70.8 44.6L70.4 43.7L69.8 42.8L69.0 42.1L68.3 41.4L67.5 40.9L66.4 40.9L65.3 40.7L64.3 41.1L63.8 41.9L63.3 42.8L62.4 43.1L61.6 42.7L60.5 42.3L59.7 41.7L58.9 41.3L58.5 40.4L58.2 39.5L57.8 38.6L56.9 38.0L56.0 37.5L55.1 36.6L54.1 36.1L53.6 35.3M53.2 35.2L50.9 35.2L48.3 35.2L48.3 36.5L45.9 36.5M18.4 30.3L19.3 30.7L18.4 30.3M18.4 31.6L19.1 32.2L18.4 31.6M14.6 28.6L15.6 28.7L14.6 28.6M2.3 5.8L3.9 5.8L5.3 5.7L6.8 5.7L8.2 5.7L10.2 5.8L11.4 5.8L13.4 5.8L14.4 5.8M29.6 32.5L25.3 32.8L22.7 33.0L22.2 32.2L22.0 31.2L21.3 30.6L20.5 30.0L19.6 29.5L18.9 29.0L18.0 28.7L17.0 28.5L16.2 27.9L15.3 27.6L14.4 27.5L13.0 27.5L12.6 26.6L12.6 25.6L11.9 24.9L11.0 24.1L10.3 23.5L9.7 22.7L8.9 22.0L9.2 21.1L8.8 20.2L7.8 19.9L7.4 18.9L7.1 17.9L7.9 18.5L7.7 17.6L6.7 17.6L5.7 17.3L5.6 16.2L4.8 15.7L3.9 14.8L3.6 13.9L3.5 12.8L3.1 11.9L2.6 11.2L1.9 10.6L2.4 9.1L2.6 8.0L2.6 7.1L2.2 6.2M22.9 5.8L21.2 5.8L18.4 5.8L16.7 5.8L14.4 5.8M31.5 20.2L31.5 18.0L31.5 16.9L31.5 15.3L31.5 11.2L31.5 9.3L31.5 5.8M31.5 5.8L30.3 5.8L29.3 5.8L27.9 5.8L24.8 5.8L22.9 5.8","arc":"M162.6 60.8Q257.6 5.8 328.1 15.8","ph":[336.7,198.7,61.9,86.4],"gq":[389.6,122.1],"gr":15,"lab":[["¡Olé!",87.3,3.6],["¡Órale!",16.5,20],["¡Chilero!",24.9,28.6],["¡Asere!",33.1,22.1],["¡Wepa!",42.2,25.8],["¡Pura vida!",29.5,34],["¡Qué chimba!",37,39.6],["¡Chévere!",42.3,36.4],["¡Achachay!",33.5,45.6],["¡Causa!",36,53.6],["¡Jallalla!",43.5,60.6],["¡Al tiro!",38.8,77.4],["¡Che!",43.9,80],["¡Ta!",49.6,76.8]]}
  function mapaHispano() {
    var m = document.createElement('span'); m.className = 'b-hmap'; m.setAttribute('aria-hidden', 'true'); m.style.aspectRatio = HISPANO.w + '/' + HISPANO.h
    m.innerHTML = '<svg viewBox="0 0 ' + HISPANO.w + ' ' + HISPANO.h + '"><defs><linearGradient id="bnHis" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8d874" stop-opacity=".5"/><stop offset="1" stop-color="#c9a6ff" stop-opacity=".42"/></linearGradient></defs>' +
      '<path d="' + HISPANO.us + '" fill="url(#bnHis)" opacity=".8"/><path d="' + HISPANO.uso + '" fill="none" stroke="#ffe9a8" stroke-opacity=".6" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="' + HISPANO.d + '" fill="url(#bnHis)" stroke="#ffe9a8" stroke-opacity=".8" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<rect x="' + HISPANO.ph[0] + '" y="' + HISPANO.ph[1] + '" width="' + HISPANO.ph[2] + '" height="' + HISPANO.ph[3] + '" rx="4" fill="none" stroke="#f8d874" stroke-opacity=".35" stroke-width="1" stroke-dasharray="3 4"/>' +
      '<circle cx="' + HISPANO.gq[0] + '" cy="' + HISPANO.gq[1] + '" r="' + HISPANO.gr + '" fill="none" stroke="#f8d874" stroke-opacity=".35" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<path d="' + HISPANO.arc + '" stroke="#f8d874" stroke-opacity=".3" stroke-width="1.4" stroke-dasharray="4 5" fill="none"/></svg>'
    return m
  }
  /* palabras tipicas repartidas por todo el banner (por detras del texto), apareciendo y desvaneciendose */
  /* tres tandas de seis palabras; en cada tanda, una por zona del banner (arriba izquierda, centro y derecha, en medio
     y abajo), para que nunca salgan pegadas */
  var TANDAS = [
    [[5, 13, 17, -6], [47, 9, 15, 5], [89, 15, 16, -5], [64, 58, 18, -4], [24, 92, 14, 3], [70, 92, 16, -6]],
    [[19, 9, 14, 4], [61, 16, 17, -4], [52, 42, 15, 6], [8, 93, 15, -3], [56, 90, 14, 3], [86, 90, 14, 5]],
    [[33, 15, 19, -3], [75, 9, 15, 3], [78, 48, 16, -5], [40, 94, 14, 4], [60, 31, 15, 5], [96, 68, 14, -4]]
  ]
  var MAS = ['¡Vale!', '¡Ándale!', '¡Pana!', '¡Bárbaro!']
  function palabras() {
    var c = document.createElement('span'); c.className = 'b-pals'; c.setAttribute('aria-hidden', 'true')
    var col = ['#f8d874', '#c9a6ff', '#ffb0c8', '#ffe9a8', '#9fd0ff'], txt = HISPANO.lab.map(function (w) { return w[0] }).concat(MAS), n = 0
    TANDAS.forEach(function (t, k) {
      t.forEach(function (p, j) {
        var e = document.createElement('b'); e.className = 'b-pal'; e.textContent = txt[n % txt.length]
        e.style.left = p[0] + '%'; e.style.top = p[1] + '%'; e.style.fontSize = p[2] + 'px'; e.style.setProperty('--r', p[3] + 'deg'); e.style.color = col[n % col.length]
        e.style.animationDelay = (k * 2 + j * .12).toFixed(2) + 's'; c.append(e); n++
      })
    })
    return c
  }
  /* cada palabra, justo antes de aparecer, busca un hueco libre: fuera del texto, del mapa y de Vero, y sin tocar las
     palabras que estan a la vista. Si no hay sitio (pantallas estrechas), esa vez no sale */
  function colocarPalabras(el, c) {
    function caja(e, m) { if (!e) return null; var r = e.getBoundingClientRect(), b = el.getBoundingClientRect(); return { x: r.left - b.left - m, y: r.top - b.top - m, w: r.width + 2 * m, h: r.height + 2 * m } }
    function choca(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h }
    function poner(w) {
      var W = el.clientWidth, H = el.clientHeight
      if (!W) return
      var veto = [caja(el.querySelector('.b-hmap svg'), 0), caja(el.querySelector('.b-bn-vero'), 0)].filter(Boolean)
      c.querySelectorAll('.b-pal').forEach(function (o) { if (o !== w && o.dataset.on === '1' && parseFloat(getComputedStyle(o).opacity) > .04) veto.push({ x: parseFloat(o.dataset.x) - 12, y: parseFloat(o.dataset.y) - 8, w: +o.dataset.w + 24, h: +o.dataset.h + 16 }) })
      var ww = w.offsetWidth + 4, hh = w.offsetHeight + 4
      for (var k = 0; k < 60; k++) {
        var x = 6 + Math.random() * Math.max(0, W - ww - 12), y = 4 + Math.random() * Math.max(0, H - hh - 8), r = { x: x, y: y, w: ww, h: hh }
        if (!veto.some(function (v) { return choca(r, v) })) {
          w.style.left = (x + ww / 2) + 'px'; w.style.top = (y + hh / 2) + 'px'; w.style.visibility = ''
          w.dataset.x = x; w.dataset.y = y; w.dataset.w = ww; w.dataset.h = hh; w.dataset.on = '1'; return
        }
      }
      w.style.visibility = 'hidden'; w.dataset.on = ''
    }
    c.querySelectorAll('.b-pal').forEach(function (w) {
      w.addEventListener('animationstart', function () { w.dataset.on = ''; poner(w) })
      w.addEventListener('animationiteration', function () { w.dataset.on = ''; poner(w) })
    })
    function todas() { c.querySelectorAll('.b-pal').forEach(function (w) { w.dataset.on = '' }); c.querySelectorAll('.b-pal').forEach(poner) }
    requestAnimationFrame(function () { requestAnimationFrame(todas) })
    try { document.fonts.ready.then(todas) } catch (e) { }
    if (window.ResizeObserver) new ResizeObserver(todas).observe(el)
  }
  /* Fallas: las Torres de Serranos (la puerta medieval de Valencia) con la Senyera, y un monumento fallero de colores */
  /* San Fermin: la calle Estafeta con balcones (telas rojas, gente con el panuelo en alto), el Ayuntamiento de Pamplona con el
     chupinazo saliendo del balcon, el encierro (corredores de blanco y rojo y toros) cruzando la calle, empedrado y vallado */
  var PAMPLONA = (function () {
    function casa(x, w, h, c) {
      var y0 = 120 - h, t = ''
      /* tejado de teja con chimenea */
      t += '<path d="M' + (x - 2) + ' ' + y0 + 'L' + (x + 3) + ' ' + (y0 - 6) + 'H' + (x + w - 3) + 'L' + (x + w + 2) + ' ' + y0 + 'Z" fill="#7a3a28"/>'
      for (var tx = x; tx < x + w; tx += 4) t += '<path d="M' + tx + ' ' + (y0 - 5) + 'V' + y0 + '" stroke="#5a2a1c" stroke-width=".5"/>'
      if (w > 38) t += '<rect x="' + (x + w - 12) + '" y="' + (y0 - 12) + '" width="5" height="7" fill="#6a3a2a"/><rect x="' + (x + w - 13) + '" y="' + (y0 - 13) + '" width="7" height="2" fill="#4a2a1c"/>'
      /* fachada, zocalo de piedra y alero con canecillos */
      t += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="' + c + '" stroke="#2a1a24" stroke-width=".6"/>'
      t += '<rect x="' + x + '" y="108" width="' + w + '" height="12" fill="#9a8a7a"/>'
      for (var sx = x; sx < x + w; sx += 6) t += '<path d="M' + sx + ' 108V120" stroke="#7a6a5a" stroke-width=".4"/>'
      t += '<path d="M' + x + ' 114H' + (x + w) + '" stroke="#7a6a5a" stroke-width=".4"/>'
      t += '<path d="M' + (x - 2) + ' ' + (y0 + 1) + 'H' + (x + w + 2) + '" stroke="#5a3a2c" stroke-width="2.4"/>'
      for (var cx = x + 2; cx < x + w; cx += 5) t += '<rect x="' + cx + '" y="' + (y0 + 2) + '" width="1.6" height="2.4" fill="#5a3a2c"/>'
      /* portal con arco */
      t += '<path d="M' + (x + w / 2 - 5) + ' 120V112Q' + (x + w / 2) + ' 106 ' + (x + w / 2 + 5) + ' 112V120Z" fill="#3a2418"/><path d="M' + (x + w / 2 - 6) + ' 120V111.5Q' + (x + w / 2) + ' 104.6 ' + (x + w / 2 + 6) + ' 111.5" fill="none" stroke="#6a5a4a" stroke-width=".8"/>'
      /* ventanas con contraventanas, balcones de forja, telas rojas, macetas y vecinos con el panuelo */
      for (var fy = y0 + 9, k = 0; fy < 98; fy += 18, k++) {
        for (var fx = x + 6; fx + 7 <= x + w - 4; fx += 13) {
          var luz = (fx * 7 + fy * 3) % 5 === 0 ? '#ffe4a0' : '#ffcf7a'
          t += '<rect x="' + (fx - 2.6) + '" y="' + fy + '" width="2.2" height="10" fill="#2f6a4a"/><rect x="' + (fx + 7.4) + '" y="' + fy + '" width="2.2" height="10" fill="#2f6a4a"/>'
          t += '<path d="M' + (fx - 2.2) + ' ' + (fy + 2.5) + 'h1.4M' + (fx - 2.2) + ' ' + (fy + 5) + 'h1.4M' + (fx - 2.2) + ' ' + (fy + 7.5) + 'h1.4M' + (fx + 7.8) + ' ' + (fy + 2.5) + 'h1.4M' + (fx + 7.8) + ' ' + (fy + 5) + 'h1.4M' + (fx + 7.8) + ' ' + (fy + 7.5) + 'h1.4" stroke="#1f4a32" stroke-width=".4"/>'
          t += '<rect x="' + fx + '" y="' + fy + '" width="7" height="10" fill="' + luz + '" opacity=".6"/><path d="M' + (fx + 3.5) + ' ' + fy + 'V' + (fy + 10) + 'M' + fx + ' ' + (fy + 4) + 'H' + (fx + 7) + '" stroke="#5a3a2a" stroke-width=".4"/>'
          t += '<path d="M' + (fx - 1) + ' ' + (fy - .5) + 'H' + (fx + 8) + '" stroke="#3a2a2a" stroke-width="1"/>'
          t += '<rect x="' + (fx - 3) + '" y="' + (fy + 10) + '" width="13" height="1.4" fill="#4a3a32"/>'
          t += '<path d="M' + (fx - 2.5) + ' ' + (fy + 11.4) + 'H' + (fx + 9.5) + 'M' + (fx - 2.5) + ' ' + (fy + 14.4) + 'H' + (fx + 9.5) + '" stroke="#1d1418" stroke-width=".7"/>'
          for (var b = 0; b < 5; b++) t += '<path d="M' + (fx - 2 + b * 3) + ' ' + (fy + 11.4) + 'V' + (fy + 14.4) + '" stroke="#1d1418" stroke-width=".4"/>'
          var m = (fx + fy + k) % 3
          if (m === 0) t += '<path d="M' + (fx - 2) + ' ' + (fy + 14.4) + 'H' + (fx + 9) + 'L' + (fx + 7) + ' ' + (fy + 21) + 'L' + (fx + 3.5) + ' ' + (fy + 17.5) + 'L' + fx + ' ' + (fy + 21) + 'Z" fill="#d61f2f"/><path d="M' + (fx - 2) + ' ' + (fy + 14.4) + 'H' + (fx + 9) + '" stroke="#f2f2f2" stroke-width=".6"/>'
          else if (m === 1) t += '<circle cx="' + (fx - 1) + '" cy="' + (fy + 10) + '" r="1.3" fill="#e8283a"/><circle cx="' + (fx + 1.2) + '" cy="' + (fy + 9.6) + '" r="1" fill="#ff5d6c"/><circle cx="' + (fx + 8) + '" cy="' + (fy + 10) + '" r="1.3" fill="#e8283a"/><path d="M' + (fx - 2) + ' ' + (fy + 10.6) + 'h4M' + (fx + 6) + ' ' + (fy + 10.6) + 'h4" stroke="#3a7a3a" stroke-width=".8"/>'
          if ((fx + 2 * fy) % 4 === 0) t += '<circle cx="' + (fx + 3.5) + '" cy="' + (fy + 5.4) + '" r="1.6" fill="#1d1418"/><path d="M' + (fx + 1.4) + ' ' + (fy + 10) + 'Q' + (fx + 3.5) + ' ' + (fy + 6.4) + ' ' + (fx + 5.6) + ' ' + (fy + 10) + '" fill="#f2f2f2"/><path d="M' + (fx + 5) + ' ' + (fy + 8) + 'L' + (fx + 8) + ' ' + (fy + 2) + 'L' + (fx + 9.6) + ' ' + (fy + 4) + 'Z" fill="#e8283a" class="b-pan"/>'
        }
      }
      return t
    }
    /* portalon de piedra con arco (los toriles): x = borde izquierdo del muro; la boca va de x+6 a x+30 */
    function tunelFondo(x, id, haciaIzq) {
      return '<defs><linearGradient id="' + id + '" x1="' + (haciaIzq ? 1 : 0) + '" x2="' + (haciaIzq ? 0 : 1) + '"><stop offset="0" stop-color="#0a0608" stop-opacity="0"/><stop offset=".55" stop-color="#0a0608" stop-opacity=".85"/><stop offset="1" stop-color="#050304"/></linearGradient></defs>' +
        '<path d="M' + (x + 6) + ' 140V116Q' + (x + 18) + ' 101 ' + (x + 30) + ' 116V140Z" fill="#120c10"/>'
    }
    function tunelFrente(x, id) {
      var t = '<path d="M' + (x + 6) + ' 140V116Q' + (x + 18) + ' 101 ' + (x + 30) + ' 116V140Z" fill="url(#' + id + ')"/>' +
        '<path fill-rule="evenodd" d="M' + x + ' 140V98H' + (x + 36) + 'V140ZM' + (x + 6) + ' 140V116Q' + (x + 18) + ' 101 ' + (x + 30) + ' 116V140Z" fill="#8e7e6c" stroke="#3a2e28" stroke-width=".6"/>'
      for (var r = 0; r < 6; r++) t += '<path d="M' + x + ' ' + (104 + r * 6) + 'H' + (x + 6) + 'M' + (x + 30) + ' ' + (104 + r * 6) + 'H' + (x + 36) + '" stroke="#5e5044" stroke-width=".5"/>'
      for (var j = 0; j < 9; j++) { var a = Math.PI * (j / 8), cx = x + 18, cy = 116; t += '<path d="M' + (cx - 12 * Math.cos(a)).toFixed(1) + ' ' + (cy - 15 * Math.sin(a)).toFixed(1) + 'L' + (cx - 16 * Math.cos(a)).toFixed(1) + ' ' + (cy - 19 * Math.sin(a)).toFixed(1) + '" stroke="#5e5044" stroke-width=".6"/>' }
      return t + '<path d="M' + (x - 1) + ' 98H' + (x + 37) + '" stroke="#5a3a2c" stroke-width="2"/><rect x="' + (x + 14) + '" y="100" width="8" height="4" fill="#d61f2f"/>'
    }
    function farola(x) {
      return '<circle cx="' + x + '" cy="96" r="9" fill="#ffd98a" opacity=".18"/><path d="M' + x + ' 120V98" stroke="#1d1418" stroke-width="1.4"/><path d="M' + (x - 4) + ' 99H' + (x + 4) + 'L' + (x + 3) + ' 93H' + (x - 3) + 'Z" fill="#ffe2a0" stroke="#1d1418" stroke-width=".7"/><path d="M' + (x - 3.5) + ' 93L' + x + ' 90L' + (x + 3.5) + ' 93" fill="#1d1418"/>'
    }
    function banderines(y, x0, x1) {
      var t = '<path d="M' + x0 + ' ' + y + 'Q' + ((x0 + x1) / 2) + ' ' + (y + 8) + ' ' + x1 + ' ' + y + '" stroke="#e8dcc4" stroke-width=".5" fill="none"/>'
      for (var u = .04, n = 0; u < .97; u += .045, n++) {
        var bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2) + u * u * x1, by = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * (y + 8) + u * u * y
        t += '<path d="M' + (bx - 2.2) + ' ' + by.toFixed(1) + 'H' + (bx + 2.2) + 'L' + bx + ' ' + (by + 5).toFixed(1) + 'Z" fill="' + (n % 2 ? '#f2f2f2' : '#d61f2f') + '"/>'
      }
      return t
    }
    function gigante(x) {
      return '<g class="b-baila"><g transform="translate(' + x + ' 0)">' +
        '<path d="M-9 120L-6 92H6L9 120Z" fill="#6a2a8a" stroke="#2a1a24" stroke-width=".6"/><path d="M-8 112H8M-7 104H7" stroke="#f8d874" stroke-width=".8"/>' +
        '<path d="M-7 92Q0 86 7 92L6 98H-6Z" fill="#b8323e"/><path d="M-6 93L-12 104M6 93L12 104" stroke="#b8323e" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="0" cy="83" r="5" fill="#f0c49a" stroke="#2a1a24" stroke-width=".5"/><path d="M-5 82Q0 75 5 82" fill="#3a2214"/><path d="M-4 78L-3 74L-1 77L0 73L1 77L3 74L4 78Z" fill="#f8d874"/><path d="M-2 85Q0 86.5 2 85" stroke="#2a1a24" stroke-width=".5" fill="none"/></g></g>'
    }
    function cabezudo(x) {
      return '<g class="b-baila" style="animation-delay:-.5s"><g transform="translate(' + x + ' 0)">' +
        '<path d="M-3 120V110H3V120Z" fill="#2c3f78"/><path d="M-4 111H4L3 104H-3Z" fill="#3a9a6a"/>' +
        '<circle cx="0" cy="97" r="8" fill="#f0c49a" stroke="#2a1a24" stroke-width=".5"/><path d="M-8 95Q0 85 8 95Q4 90 0 90Q-4 90 -8 95Z" fill="#1d1418"/><path d="M-6 94Q0 87 6 94H-6Z" fill="#1d1418"/><path d="M-9 94H9" stroke="#1d1418" stroke-width="1.4"/>' +
        '<circle cx="-3" cy="97" r="1" fill="#1d1418"/><circle cx="3" cy="97" r="1" fill="#1d1418"/><ellipse cx="0" cy="100" rx="1.6" ry="1.2" fill="#e8a07a"/><path d="M-3 102.5Q0 104.5 3 102.5" stroke="#1d1418" stroke-width=".6" fill="none"/>' +
        '<path d="M4 108L12 102" stroke="#f0c49a" stroke-width="1.4"/><path d="M12 102L16 96" stroke="#c9405a" stroke-width="2" stroke-linecap="round"/></g></g>'
    }
    /* mozo corriendo (mirando a la izquierda): camisa blanca con pliegues, panuelo rojo y faja con las puntas al viento,
       periodico enrollado, pantalon blanco y zapatillas; dos posturas de piernas y brazos que se alternan */
    function corredor(x, d, pelo) {
      var P = function (a) {
        return a ? '<path d="M-1.5 130L-5 134.5L-8.5 138.5M1.5 130L3.5 135L2.5 139.6" stroke="#f4f4f4" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
          '<path d="M-10 138.6H-7M1 139.8H4.6" stroke="#c8102e" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M-2 122.5L-6.5 121L-10 117.6M2.5 122.5L6 126.5L5 129" stroke="#f4f4f4" stroke-width="1.7" stroke-linecap="round" fill="none"/>'
          : '<path d="M-1.5 130L0 135L-2 139.6M1.5 130L5.5 134L9 137.5" stroke="#f4f4f4" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
          '<path d="M-3.6 139.8H0M8 137.6H11" stroke="#c8102e" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M-2 122.5L-5 126L-4 129M2.5 122.5L6.5 120.5L9 117" stroke="#f4f4f4" stroke-width="1.7" stroke-linecap="round" fill="none"/>'
      }
      return '<g class="b-corre" style="animation-delay:-' + d + 's"><g transform="translate(' + x + ' 0) rotate(-8 0 130)">' +
        '<g class="b-pA" style="animation-delay:-' + d + 's">' + P(1) + '<path d="M-10 117.6L-13 115.4" stroke="#dcd6c8" stroke-width="2" stroke-linecap="round"/></g>' +
        '<g class="b-pB" style="animation-delay:-' + d + 's">' + P(0) + '<path d="M9 117L11 114" stroke="#dcd6c8" stroke-width="2" stroke-linecap="round"/></g>' +
        '<path d="M-3.2 120.5C-4.6 124 -4.4 127.5 -3.2 130.4H3.4C4.4 127 4.2 123.4 2.6 120.5Z" fill="#f4f4f4" stroke="#b8b2a4" stroke-width=".35"/>' +
        '<path d="M-1.5 122.5Q-2.2 126 -1.4 129M1 122.5Q1.6 126 1 129" stroke="#c8c2b4" stroke-width=".35" fill="none"/>' +
        '<path d="M-3.6 128.6H3.8V131H-3.6Z" fill="#c8102e"/><path d="M3.6 129.4Q7 129 9 131.6M3.6 130.4Q6.6 131.2 8 133.8" stroke="#c8102e" stroke-width="1" fill="none" class="b-viento"/>' +
        '<circle cx="-.6" cy="117.4" r="2.7" fill="#f0c49a" stroke="#8a5a3a" stroke-width=".3"/><path d="M-3.2 116.6Q-2.6 113.6 .4 114Q2.4 114.4 2.2 117" fill="' + (pelo || '#3a2214') + '"/>' +
        '<circle cx="-2.3" cy="117.3" r=".4" fill="#1d1418"/><path d="M-3.2 118.8Q-2.6 119.3 -2 119" stroke="#8a5a3a" stroke-width=".3" fill="none"/>' +
        '<path d="M-2.6 120.2L2.6 120.2L0 123.6Z" fill="#d61f2f"/><path d="M1.8 120.4Q5 119.6 6.6 121.6M1.6 120.6Q4.4 121.6 5.4 123.4" stroke="#d61f2f" stroke-width=".9" fill="none" class="b-viento"/>' +
        '</g></g>'
    }
    /* toro bravo (mirando a la izquierda): cuerpo con morrillo y musculatura sombreada, cuernos de marfil con la punta oscura,
       oreja, ojo, morro, rabo con borla, pezunas; dos posturas de galope y polvo levantandose */
    function toro(x, d) {
      var pata = function (a) {
        return (a ? '<path d="M-9.5 131L-14 135.5L-18 138.6M-5.5 131.6L-4.5 136L-6.6 139.8M10.5 131.5L15 135L19.4 137.4M14 130.6L12.6 135.8L14.4 139.8"'
                  : '<path d="M-9.5 131L-8 136L-10.6 139.8M-5.5 131.6L-9 135.6L-12.4 138.4M10.5 131.5L9 136.2L10.4 139.8M14 130.6L18 134.4L21 136.6"') +
          ' stroke="#140e12" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
          (a ? '<path d="M-19 138.2l-1.4 .8M-7.4 139.8h-1.6M20.2 137.2l1.2 .9M13.6 139.8h1.8"' : '<path d="M-11.4 139.8h-1.6M-13.2 138l-1.3 .9M9.8 139.8h1.8M21.8 136.4l1.1 1"') + ' stroke="#3a2e2a" stroke-width="1.6" stroke-linecap="round"/>'
      }
      return '<g class="b-corre" style="animation-delay:-' + d + 's"><g transform="translate(' + x + ' 0)">' +
        '<g class="b-polvo" style="animation-delay:-' + d + 's"><circle cx="22" cy="138" r="2.6" fill="#b8a48a" opacity=".35"/><circle cx="26" cy="136.5" r="2" fill="#b8a48a" opacity=".25"/><circle cx="-4" cy="139.5" r="1.8" fill="#b8a48a" opacity=".25"/></g>' +
        '<g class="b-pA" style="animation-delay:-' + d + 's">' + pata(1) + '</g><g class="b-pB" style="animation-delay:-' + d + 's">' + pata(0) + '</g>' +
        /* cuerpo y morrillo */
        '<path d="M-16 127C-17 121 -12 115.5 -4 116C1 112.4 8 112.6 12.6 116C18 119 19.6 124.4 17.6 129.6C16 133 11 133.6 6 133H-10C-14 132.6 -16 130.4 -16 127Z" fill="url(#bnToro)"/>' +
        '<path d="M-12 118.6Q-6 114 0 115.6M-2 120Q2 124 1 130M9 119Q12 124 10.6 131" stroke="#6a5a5a" stroke-width=".5" fill="none" opacity=".7"/>' +
        '<path d="M-14 128Q-8 131.4 0 131.6" stroke="#2a2024" stroke-width=".6" fill="none"/>' +
        /* cabeza baja, morro, oreja, ojo y cuernos */
        '<path d="M-15 121.6C-19 119.4 -25.4 121.4 -26.8 125.6C-27.6 128.4 -24.6 130.2 -21.4 129.8C-18.4 129.4 -16 127.4 -15 125Z" fill="#17101a"/>' +
        '<path d="M-26.6 126.6Q-25.4 129.8 -22 129.8Q-24.6 128 -24.8 125.8Z" fill="#2e2428"/><circle cx="-25.4" cy="127.6" r=".5" fill="#0a0608"/>' +
        '<path d="M-16.6 121.2Q-14.4 118.6 -13.6 121.8Z" fill="#241a1e"/>' +
        '<circle cx="-21.8" cy="123.8" r=".8" fill="#e8dcc4"/><circle cx="-22" cy="123.8" r=".42" fill="#0a0608"/>' +
        '<path d="M-19.4 121.4C-23.4 118.6 -26.6 117.2 -27 113.2" stroke="#efe2c4" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M-26.4 115C-26.9 114.2 -27.1 113.6 -27 113.2" stroke="#2a2024" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M-17.8 120.8C-20.6 117.6 -22.6 116.6 -22.4 112.8" stroke="#d6c8a6" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
        /* rabo con borla */
        '<path d="M17.4 121.4C21.4 120.6 23.4 117.6 23 113.6" stroke="#140e12" stroke-width="1" fill="none" class="b-viento"/><path d="M23 113.6Q21.6 111 23.4 110.4Q25 111.6 23.6 113.8Z" fill="#140e12"/>' +
        '</g></g>'
    }
    return '<svg viewBox="0 0 400 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><defs><radialGradient id="bnToro" cx=".45" cy=".25" r=".8"><stop offset="0" stop-color="#4a3c40"/><stop offset=".5" stop-color="#221820"/><stop offset="1" stop-color="#0e090c"/></radialGradient></defs>' +
      /* calle Estafeta a los lados */
      casa(0, 44, 92, '#d9b48a') + casa(44, 36, 84, '#e6c9a0') + casa(80, 40, 96, '#c98f6e') + casa(232, 38, 90, '#e2c08e') + casa(270, 42, 86, '#d4a07a') + casa(312, 40, 94, '#e6c9a0') + casa(352, 48, 88, '#c98f6e') +
      /* cuerdas de banderines cruzando la calle */
      banderines(30, 0, 122) + banderines(42, 230, 400) + banderines(56, 0, 122) +
      /* Ayuntamiento: fachada barroca de tres pisos, pilastras, balcon con banderas y frontón con estatuas */
      '<g stroke="#3a2a24" stroke-width=".6"><rect x="122" y="30" width="108" height="90" fill="#efe0c2"/>' +
      '<path d="M122 60H230M122 88H230" stroke-width="1.4"/>' +
      /* cornisas con denticulos y zocalo */
      (function () { var t = ''; [30, 60, 88].forEach(function (y) { for (var x = 123; x < 230; x += 3.2) t += '<rect x="' + x + '" y="' + (y + 1) + '" width="1.6" height="1.6" fill="#b89a6a" stroke="none"/>' }); return t })() +
      '<rect x="122" y="110" width="108" height="10" fill="#c9b08a"/>' +
      (function () { var t = ''; for (var x = 128; x <= 224; x += 16) t += '<path d="M' + x + ' 30V120" stroke="#cdb48a" stroke-width="2.2"/><rect x="' + (x - 2.4) + '" y="56" width="4.8" height="2.4" fill="#b89a6a" stroke="none"/><rect x="' + (x - 2.4) + '" y="84" width="4.8" height="2.4" fill="#b89a6a" stroke="none"/>'; return t })() +
      (function () { var t = ''; [136, 152, 184, 200, 216].forEach(function (x) { t += '<path d="M' + (x - 4) + ' 50V40Q' + x + ' 35 ' + (x + 4) + ' 40V50Z" fill="#ffcf7a" opacity=".7"/><path d="M' + (x - 4) + ' 80V68Q' + x + ' 63 ' + (x + 4) + ' 68V80Z" fill="#ffcf7a" opacity=".7"/>' }); return t })() +
      '<path d="M170 120V100Q176 92 182 100V120Z" fill="#5a3a2c"/>' +
      /* balcon principal con banderas */
      '<rect x="160" y="80" width="32" height="3" fill="#2a1d24"/><path d="M162 80V75M168 80V75M174 80V75M180 80V75M186 80V75M190 80V75" stroke="#2a1d24" stroke-width=".6"/><path d="M160 75H192" stroke="#2a1d24" stroke-width=".8"/>' +
      '<path d="M164 83H170V93L167 90L164 93Z" fill="#d61f2f"/><path d="M182 83H188V93L185 90L182 93Z" fill="#c8102e"/><path d="M173 83H179V93L176 90L173 93Z" fill="#f2c94c"/>' +
      /* remate: frontón curvo, jarrones y estatuas */
      '<path d="M140 30Q176 6 212 30Z" fill="#efe0c2"/><path d="M146 30Q176 12 206 30" fill="none" stroke-width=".8"/>' +
      /* reloj en el fronton */
      '<circle cx="176" cy="22" r="5" fill="#fff8e6"/><path d="M176 22V18.6M176 22L178.6 23.4" stroke="#2a1a24" stroke-width=".7"/><path d="M176 17V14" stroke-width="1"/><path d="M174 14H178L176 10Z" fill="#efe0c2"/>' +
      /* balaustrada */
      (function () { var t = '<path d="M124 30H140M212 30H228" stroke-width=".8"/>'; for (var x = 125; x < 140; x += 2.6) t += '<path d="M' + x + ' 30V26" stroke-width=".5"/>'; for (x = 213; x < 228; x += 2.6) t += '<path d="M' + x + ' 30V26" stroke-width=".5"/>'; return t + '<path d="M124 26H140M212 26H228" stroke-width=".8"/>' })() +
      /* escudo de Pamplona sobre el balcon */
      '<path d="M170 64H182V72Q176 77 170 72Z" fill="#c8102e"/><path d="M172 66L180 66M176 65V74" stroke="#f8d874" stroke-width=".7"/><path d="M169 63Q176 59 183 63" fill="none" stroke="#f8d874" stroke-width="1"/>' +
      '<path d="M128 30V23H132V30ZM220 30V23H224V30Z" fill="#efe0c2"/><circle cx="130" cy="21" r="2.2" fill="#efe0c2"/><circle cx="222" cy="21" r="2.2" fill="#efe0c2"/>' +
      '<path d="M150 24V16M150 16L146 12M202 24V16M202 16L206 12" stroke-width="1.4"/><circle cx="150" cy="15" r="1.6" fill="#efe0c2"/><circle cx="202" cy="15" r="1.6" fill="#efe0c2"/></g>' +
      /* el chupinazo: cohete desde el balcon y estallido rojo y blanco */
      '<g class="b-chupi"><path d="M176 74Q170 46 182 18" stroke="#fff4d8" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/><circle cx="182" cy="16" r="9" fill="#fff" opacity=".85"/><circle cx="186" cy="12" r="6" fill="#ff4d5e" opacity=".9"/><circle cx="177" cy="12" r="5" fill="#f2f2f2"/><circle cx="190" cy="19" r="4" fill="#ffd2d6"/></g>' +
      /* farolas */
      farola(42) + farola(118) + farola(236) + farola(310) +
      /* la gente ante el Ayuntamiento, con el panuelo en alto */
      (function () { var t = ''; for (var x = 126; x < 228; x += 4.4) { var h = (x * 13) % 3; t += '<path d="M' + (x - 2.2) + ' 120Q' + x + ' ' + (113 - h) + ' ' + (x + 2.2) + ' 120Z" fill="#f2f2f2"/><circle cx="' + x + '" cy="' + (113.5 - h) + '" r="1.6" fill="' + ['#3a2214', '#1d1418', '#7a4a24'][h] + '"/>'; if ((x * 7) % 3 < 1.2) t += '<path class="b-pan" d="M' + (x + 1) + ' ' + (114 - h) + 'L' + (x + 3) + ' ' + (106 - h) + 'L' + (x + 5) + ' ' + (108 - h) + 'Z" fill="#e8283a"/>' } return t })() +
      /* empedrado y encierro */
      '<rect x="0" y="120" width="400" height="30" fill="#3a2e34"/>' +
      (function () { var t = ''; for (var r = 0; r < 4; r++) for (var x = (r % 2) * 5; x < 400; x += 10) t += '<ellipse cx="' + x + '" cy="' + (124 + r * 6) + '" rx="4.2" ry="2.2" fill="#4c3e44"/>'; return t })() +
      tunelFondo(0, 'bnTunI', 1) + tunelFondo(316, 'bnTunD', 0) +
      '<defs><clipPath id="bnClipEnc"><rect x="18" y="96" width="316" height="54"/></clipPath></defs>' +
      '<g clip-path="url(#bnClipEnc)"><g class="b-encierro">' + corredor(20, 0) + corredor(33, .21, '#7a4a24') + corredor(47, .11, '#1d1418') + toro(76, .15) + corredor(98, .3, '#a8743a') + toro(122, 0) + corredor(144, .25) + toro(168, .1) + corredor(188, .05, '#5a3a24') + '</g></g>' +
      tunelFrente(0, 'bnTunI') + tunelFrente(316, 'bnTunD') +
      /* vallado de madera delante */
      '<path d="M0 141H400M0 146H400" stroke="#8a5a32" stroke-width="2.2"/>' +
      (function () { var t = ''; for (var x = 6; x < 400; x += 22) t += '<path d="M' + x + ' 136V150" stroke="#6e4423" stroke-width="2.6"/>'; return t })() +
      /* confeti cayendo por delante */
      (function () {
        var t = '', c = ['#ff4d5e', '#f2f2f2', '#ff4d5e', '#ffd2d6', '#f8d874']
        for (var i = 0; i < 46; i++) {
          var x = (i * 61.3) % 400, d = ((i * 37) % 70) / 10, dur = 5 + (i * 13) % 4, w = 1.6 + (i % 3) * .5
          t += '<rect class="b-conf" style="animation-duration:' + dur + 's;animation-delay:-' + d + 's" x="' + x.toFixed(1) + '" y="-6" width="' + w + '" height="' + (w * 1.6).toFixed(1) + '" fill="' + c[i % c.length] + '"/>'
        }
        return t
      })() +
      '</svg>'
  })()
  /* guirnalda de panuelos rojos y blancos por arriba */
  var PANUELOS = '<svg viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true"><path d="M0 3Q100 8 200 3T400 3" stroke="#e8dcc4" stroke-width=".8" fill="none"/>' +
    (function () { var t = ''; for (var i = 0; i < 40; i++) { var x = i * 10 + 5, y = 3 + 2.4 * Math.sin((i / 20) * Math.PI) ; t += '<path d="M' + (x - 4) + ' ' + y.toFixed(1) + 'H' + (x + 4) + 'L' + x + ' ' + (y + 11).toFixed(1) + 'Z" fill="' + (i % 2 ? '#f2f2f2' : '#d61f2f') + '"/>' } return t })() + '</svg>'
  /* Halloween: luna llena naranja con la bruja cruzandola, colina con casa encantada, arbol seco, cementerio, calabazas encendidas,
     fantasmas flotando, telarana con su arana y niebla a ras de suelo */
  var HALLOWEEN = (function () {
    function lapida(x, y, w, h, rot, cruz) {
      return '<g transform="rotate(' + rot + ' ' + x + ' ' + (y + h) + ')">' + (cruz
        ? '<path d="M' + (x - 1.6) + ' ' + (y + h) + 'V' + (y + 6) + 'H' + (x - 6) + 'V' + (y + 3) + 'H' + (x - 1.6) + 'V' + y + 'H' + (x + 1.6) + 'V' + (y + 3) + 'H' + (x + 6) + 'V' + (y + 6) + 'H' + (x + 1.6) + 'V' + (y + h) + 'Z" fill="#3a3646" stroke="#5a5668" stroke-width=".5"/>'
        : '<path d="M' + (x - w / 2) + ' ' + (y + h) + 'V' + (y + w / 2) + 'A' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + (x + w / 2) + ' ' + (y + w / 2) + 'V' + (y + h) + 'Z" fill="#3a3646" stroke="#5a5668" stroke-width=".6"/>' +
          '<path d="M' + (x - w * .25) + ' ' + (y + w * .55) + 'H' + (x + w * .25) + 'M' + (x - w * .3) + ' ' + (y + w * .8) + 'H' + (x + w * .3) + 'M' + (x - w * .3) + ' ' + (y + w * 1.05) + 'H' + (x + w * .2) + '" stroke="#262230" stroke-width=".7"/>' +
          '<path d="M' + (x + w * .2) + ' ' + (y + h) + 'Q' + (x + w * .1) + ' ' + (y + h - 4) + ' ' + (x + w * .3) + ' ' + (y + h - 7) + '" stroke="#3e6a3a" stroke-width=".8" fill="none"/>') + '</g>'
    }
    function calabaza(x, y, r, d) {
      return '<g transform="translate(' + x + ' ' + y + ')">' +
        '<ellipse class="b-vela" style="animation-delay:-' + d + 's" cx="0" cy="0" rx="' + (r * 2.6) + '" ry="' + (r * 1.7) + '" fill="#ffb347" opacity=".16"/>' +
        '<ellipse cx="0" cy="0" rx="' + (r * 1.25) + '" ry="' + r + '" fill="url(#bnCalab)" stroke="#6a2a06" stroke-width=".6"/>' +
        '<path d="M' + (-r * .5) + ' ' + (-r * .95) + 'Q' + (-r * .78) + ' 0 ' + (-r * .5) + ' ' + (r * .95) + 'M' + (r * .5) + ' ' + (-r * .95) + 'Q' + (r * .78) + ' 0 ' + (r * .5) + ' ' + (r * .95) + 'M' + (-r * .15) + ' ' + (-r) + 'Q' + (-r * .22) + ' 0 ' + (-r * .15) + ' ' + r + 'M' + (r * .15) + ' ' + (-r) + 'Q' + (r * .22) + ' 0 ' + (r * .15) + ' ' + r + '" stroke="#a8440c" stroke-width=".6" fill="none"/>' +
        '<ellipse cx="' + (-r * .55) + '" cy="' + (-r * .45) + '" rx="' + (r * .3) + '" ry="' + (r * .14) + '" fill="#ffd08a" opacity=".45" transform="rotate(-25 ' + (-r * .55) + ' ' + (-r * .45) + ')"/>' +
        '<path d="M-1 ' + (-r * .9) + 'Q-.6 ' + (-r * 1.45) + ' 1.8 ' + (-r * 1.55) + '" stroke="#4a6a2a" stroke-width="' + (r * .22) + '" fill="none" stroke-linecap="round"/><path d="M1 ' + (-r * 1.2) + 'Q' + (r * .7) + ' ' + (-r * 1.6) + ' ' + (r * .9) + ' ' + (-r * 1.1) + 'Q' + (r * .4) + ' ' + (-r * 1.05) + ' 1 ' + (-r * 1.2) + 'Z" fill="#3e6a2a"/>' +
        '<g class="b-vela" style="animation-delay:-' + d + 's" fill="#fff0a0" stroke="#4a1a04" stroke-width=".45">' +
        '<path d="M' + (-r * .66) + ' ' + (-r * .12) + 'L' + (-r * .32) + ' ' + (-r * .58) + 'L' + (-r * .1) + ' ' + (-r * .12) + 'Z"/><path d="M' + (r * .1) + ' ' + (-r * .12) + 'L' + (r * .32) + ' ' + (-r * .58) + 'L' + (r * .66) + ' ' + (-r * .12) + 'Z"/>' +
        '<path d="M-1 ' + (r * .05) + 'L0 ' + (-r * .2) + 'L1 ' + (r * .05) + 'Z"/>' +
        '<path d="M' + (-r * .78) + ' ' + (r * .18) + 'Q0 ' + (r * .9) + ' ' + (r * .78) + ' ' + (r * .18) + 'L' + (r * .52) + ' ' + (r * .3) + 'L' + (r * .36) + ' ' + (r * .16) + 'L' + (r * .14) + ' ' + (r * .36) + 'L' + (-r * .08) + ' ' + (r * .2) + 'L' + (-r * .3) + ' ' + (r * .38) + 'L' + (-r * .5) + ' ' + (r * .2) + 'Z"/></g></g>'
    }
    function fantasma(x, y, sc, d) {
      return '<g class="b-fant" style="animation-delay:-' + d + 's"><g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">' +
        '<path d="M-9 4C-9 -8 -5 -14 0 -14C5 -14 9 -8 9 4L9 12L6 9L3 13L0 9.5L-3 13L-6 9L-9 12Z" fill="#eef0ff" opacity=".82"/>' +
        '<path d="M-9 0Q-14 -2 -15 3M9 0Q14 -3 15 1" stroke="#eef0ff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".7"/>' +
        '<ellipse cx="-3.2" cy="-5" rx="1.6" ry="2.4" fill="#1d1238"/><ellipse cx="3.2" cy="-5" rx="1.6" ry="2.4" fill="#1d1238"/><ellipse cx="0" cy="1" rx="2" ry="2.8" fill="#1d1238"/>' +
        '</g></g>'
    }
    var casa = '<defs><radialGradient id="bnVent"><stop offset="0" stop-color="#ffcf5a" stop-opacity=".5"/><stop offset="1" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient></defs>' +
      /* resplandor de las ventanas */
      '<circle cx="144" cy="64" r="14" fill="url(#bnVent)"/><circle cx="128" cy="102" r="12" fill="url(#bnVent)"/><circle cx="163" cy="102" r="12" fill="url(#bnVent)"/>' +
      '<g fill="#140c1e" stroke="#2c1e38" stroke-width=".6">' +
      /* chimenea (con humo) y tejados */
      '<path d="M166 84V68H173V84Z"/><path d="M164.6 68H174.4V65.6H164.6Z"/>' +
      '<path d="M116 93L134 76L150 93Z"/><path d="M146 93L162 74L182 93Z"/>' +
      /* cuerpo principal */
      '<path d="M120 116V92H176V116Z"/>' +
      /* torre con tejado en pico */
      '<path d="M136 92V56H152V92Z"/><path d="M133 57L144 30L155 57Z"/></g>' +
      /* tablones de las paredes y tejas */
      '<g stroke="#241632" stroke-width=".5">' + (function () { var t = ''; for (var y = 95; y < 116; y += 3) t += '<path d="M121 ' + y + 'H175"/>'; for (y = 59; y < 92; y += 3) t += '<path d="M137 ' + y + 'H151"/>'; return t })() + '</g>' +
      '<g stroke="#2e2040" stroke-width=".45" fill="none">' + (function () { var t = ''; for (var k = 1; k < 6; k++) { t += '<path d="M' + (134 - k * 3.2) + ' ' + (76 + k * 3) + 'L' + (134 + k * 2.8) + ' ' + (76 + k * 3) + '"/><path d="M' + (162 - k * 3.4) + ' ' + (74 + k * 3.4) + 'L' + (162 + k * 3.6) + ' ' + (74 + k * 3.4) + '"/><path d="M' + (144 - k * 1.9) + ' ' + (30 + k * 4.6) + 'L' + (144 + k * 1.9) + ' ' + (30 + k * 4.6) + '"/>' } return t })() + '</g>' +
      '<path d="M116 93L134 76L150 93M146 93L162 74L182 93M133 57L144 30L155 57" stroke="#3e2c52" stroke-width="1" fill="none"/>' +
      /* veleta */
      '<path d="M144 30V21M141 23H147" stroke="#140c1e" stroke-width=".9"/><path d="M144 21.6L149 22.6L144 23.2Z" fill="#140c1e"/><circle cx="144" cy="21" r=".8" fill="#140c1e"/>' +
      /* humo de la chimenea */
      '<g class="b-humo"><circle cx="169" cy="60" r="3.4" fill="#5a5260"/></g><g class="b-humo" style="animation-delay:-2.2s"><circle cx="169" cy="60" r="3" fill="#5a5260"/></g>' +
      /* ventanas encendidas, la de la torre con arco y cruz */
      '<g class="b-vela" style="animation-delay:-.4s" fill="#ffcf5a"><path d="M140 66V60Q144 56 148 60V66Z"/><rect x="125" y="98" width="6" height="8"/><rect x="160" y="98" width="6" height="8"/></g>' +
      '<g class="b-vela" style="animation-delay:-1.1s" fill="#ffb347"><rect x="141" y="76" width="6" height="7"/><path d="M128 89V85Q130.5 82.5 133 85V89Z"/></g>' +
      '<path d="M144 57V66M140 62H148M125 102H131M128 98V106M160 102H166M163 98V106M141 79.5H147M144 76V83" stroke="#140c1e" stroke-width=".8"/>' +
      /* contraventanas rotas y ventana tapiada con tablas */
      '<path d="M122.6 98L124.4 98L124 106.4L122.4 106Z" fill="#241632"/><path d="M131.6 98.6L134 97L134.4 104L132 105Z" fill="#241632"/><path d="M166.6 98L169 99.4L168.4 106.6L166.2 106Z" fill="#241632"/>' +
      '<rect x="157" y="80" width="8" height="8" fill="#0a0610"/><path d="M156 81L166 87M156 86L166 82M157 84H165" stroke="#5a3a24" stroke-width="1.1"/>' +
      /* ventana redonda en el hastial */
      '<circle cx="134" cy="86" r="2.6" fill="#ffb347" class="b-vela" style="animation-delay:-.8s"/><path d="M131.4 86H136.6M134 83.4V88.6" stroke="#140c1e" stroke-width=".6"/><circle cx="134" cy="86" r="2.6" fill="none" stroke="#2c1e38" stroke-width=".7"/>' +
      /* porche: tejadillo, columnas, escalones, puerta y farol */
      '<path d="M140 104L146 100H158L163 104Z" fill="#1a1026" stroke="#2c1e38" stroke-width=".6"/>' +
      '<path d="M142 104V116M161 104V116" stroke="#2c1e38" stroke-width="1.3"/>' +
      '<path d="M146 116V106.6Q149 103 152 106.6V116Z" fill="#2a1a12"/><circle cx="151" cy="111.6" r=".5" fill="#d9a441"/>' +
      '<path d="M140 116H164V118H140ZM138 118H166V120H138Z" fill="#241632"/>' +
      '<path d="M156.6 106.6H158.6L158.2 109.6H157Z" fill="#ffcf5a" class="b-vela"/><circle cx="157.6" cy="108" r="3.6" fill="#ffcf5a" opacity=".22"/>' +
      /* valla torcida */
      '<g stroke="#140c1e" stroke-width="1.1">' + (function () { var t = ''; for (var x = 104; x < 196; x += 6) if (x < 138 || x > 166) t += '<path d="M' + x + ' 124L' + (x + (x % 12 ? .6 : -.6)) + ' 116"/><path d="M' + (x - 1) + ' 116.6L' + x + ' 114.6L' + (x + 1) + ' 116.6" stroke-width=".7"/>'; return t })() + '<path d="M102 119H137M167 119H196M102 122H137M167 122H196" stroke-width=".7"/></g>'
    var arbol = '<g stroke="#120a16" stroke-linecap="round" fill="none">' +
      '<path d="M268 140C268 124 266 112 270 98" stroke-width="5"/><path d="M269 108C262 100 256 98 248 92" stroke-width="2.4"/><path d="M256 98C252 92 252 86 248 80" stroke-width="1.4"/>' +
      '<path d="M270 100C276 92 284 90 292 84" stroke-width="2.4"/><path d="M284 89C288 82 294 80 300 74" stroke-width="1.4"/><path d="M270 98C270 88 266 80 268 70" stroke-width="2"/><path d="M267 78C262 72 262 66 258 62" stroke-width="1.1"/>' +
      '<path d="M292 84l6 2M248 80l-4 -3M300 74l3 -4M258 62l-2 -4M268 70l3 -5" stroke-width=".8"/></g>' +
      /* cuervo en la rama */
      '<path d="M284 86Q286 82 290 83Q293 81 294 84L297 84.5L294 85.6Q291 88 286 87.6Z" fill="#0c0610"/><circle cx="292" cy="83.4" r=".5" fill="#ffcf5a"/>'
    return '<svg viewBox="0 0 400 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><defs>' +
      '<radialGradient id="bnLunaH" cx=".42" cy=".38"><stop offset="0" stop-color="#fff2c8"/><stop offset=".45" stop-color="#ffb347"/><stop offset="1" stop-color="#d9611a"/></radialGradient>' +
      '<radialGradient id="bnCalab" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ffa040"/><stop offset=".6" stop-color="#e8761f"/><stop offset="1" stop-color="#9a3e0a"/></radialGradient>' +
      '<linearGradient id="bnColina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a3a"/><stop offset="1" stop-color="#120a1a"/></linearGradient></defs>' +
      /* luna */
      '<circle cx="214" cy="48" r="54" fill="#ff8d3a" opacity=".12"/><circle cx="214" cy="48" r="38" fill="#ffb347" opacity=".14"/>' +
      '<circle cx="214" cy="48" r="30" fill="url(#bnLunaH)"/><circle cx="204" cy="40" r="5" fill="#c8541a" opacity=".35"/><circle cx="222" cy="56" r="7" fill="#c8541a" opacity=".3"/><circle cx="224" cy="36" r="3" fill="#c8541a" opacity=".35"/><circle cx="206" cy="58" r="2.6" fill="#c8541a" opacity=".3"/>' +
      /* nubes deshilachadas pasando por delante de la luna */
      '<g class="b-nube"><path d="M150 54Q170 48 192 52Q214 46 236 52Q256 50 268 56Q246 58 226 56Q204 60 182 57Q164 60 150 54Z" fill="#3a2a5a" opacity=".55"/><path d="M176 66Q196 62 214 65Q232 62 250 67Q232 70 212 68Q194 71 176 66Z" fill="#3a2a5a" opacity=".4"/></g>' +
      /* bruja en su escoba cruzando la luna */
      '<g class="b-bruja"><g transform="translate(214 44) scale(1.15)"><g fill="#0c0610" stroke="#ffb070" stroke-width=".35" stroke-opacity=".7" stroke-linejoin="round">' +
      /* escoba: palo, atadura y haz de ramas */
      '<path d="M-22 .6L17 3.6" stroke="#0c0610" stroke-width="1.6" stroke-linecap="round"/><path d="M-22 .6L17 3.6" stroke="#ffb070" stroke-width=".3" stroke-opacity=".5" fill="none"/>' +
      '<path d="M16 1.4L31 -3.4L32.6 -.6L31.2 2.6L33 5.4L31 8.2L16 6.4Z"/><path d="M18 3.2L31.4 -1.6M18 4L32 2.4M18 4.8L31.6 5.6M18 5.6L30 7.6" stroke="#ffb070" stroke-width=".25" stroke-opacity=".55" fill="none"/>' +
      '<path d="M15.2 1.2V6.6M17 1.4V6.4" stroke="#7a3a1a" stroke-width=".9"/>' +
      /* gato en la cola de la escoba */
      '<path d="M10 2.6Q9.4 -1.6 11 -3.4L10.6 -5.6L12 -4.4L13.4 -5.6L13.2 -3.4Q14.6 -1.6 14 2.8Z"/><path d="M14 1.8Q17 .4 16.2 -3Q15.8 -4.4 17 -5.2" fill="none" stroke-width=".9" stroke="#0c0610"/><circle cx="11.6" cy="-2.8" r=".35" fill="#c8ff6a" stroke="none"/>' +
      /* falda y capa al viento */
      '<path d="M-5 2.2Q0 9.6 9 8.2Q4.6 5 3.6 -1.6Z"/>' +
      '<path class="b-capa" d="M-1 -8.6Q6 -9 9 -5Q12 -2 16 -3.4Q13.6 0 9.6 -.2Q12.6 2.6 8 3.2Q4 1 2 -2Z"/>' +
      /* cuerpo, brazo a la escoba y pierna con bota */
      '<path d="M-5 2.4Q-6.6 -5 -2.4 -9H2.6Q4.6 -4 3.8 2.4Z"/>' +
      '<path d="M-2 -6.4Q-6 -4 -9.6 .2" stroke="#0c0610" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="-10" cy=".6" r="1" />' +
      '<path d="M1.6 6.6L-1.6 11.4L-5.6 12.2L-5 13.2L-.6 12.6L3.6 7.4Z"/>' +
      /* cabeza: nariz puntiaguda, barbilla y melena al viento */
      '<path d="M-5.6 -11.6Q-5.4 -14 -2.8 -14.2Q-.4 -14 -.4 -11.4Q-.6 -9 -2.8 -8.8Q-4 -8.8 -4.6 -9.6L-7.6 -10.2L-5 -10.8Z"/>' +
      '<path class="b-capa" d="M-1 -13.4Q4 -14 7 -11Q10 -9 12.6 -10.2Q10.4 -7.4 7 -8.2Q4.6 -7.6 1.6 -9.6Z"/>' +
      /* sombrero de pico doblado con cinta */
      '<path d="M-9.4 -13.6Q-3 -16.4 4.2 -13.4Q-2.6 -12 -9.4 -13.6Z"/><path d="M-5.6 -14.4Q-4.6 -21 -1 -24.6Q2.6 -27.4 5.4 -25Q2 -24.4 .8 -21.6Q.2 -18 1.2 -14.4Z"/>' +
      '<path d="M-5.4 -15.6Q-2 -16.4 1.2 -15.6" stroke="#7a3fb0" stroke-width="1.2" fill="none"/><rect x="-2.4" y="-16.6" width="1.6" height="1.6" fill="#f8d874" stroke="none"/>' +
      '</g></g></g>' +
      /* telarana completa, colgada de tres hilos desde arriba, con su arana bajando por un hilo desde el centro */
      (function () {
        var cx = 44, cy = 30, n = 14, t = '<g stroke="#b9c3e0" stroke-width=".4" fill="none" opacity=".6">', pts = []
        for (var i = 0; i < n; i++) { var a = i / n * 6.283 + .1, rr = 24 + (i % 3) * 1.6; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .92]); t += '<path d="M' + cx + ' ' + cy + 'L' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + '"/>' }
        /* hilos de amarre */
        t += '<path d="M' + pts[10][0].toFixed(1) + ' ' + pts[10][1].toFixed(1) + 'L26 -2M' + pts[11][0].toFixed(1) + ' ' + pts[11][1].toFixed(1) + 'L46 -2M' + pts[12][0].toFixed(1) + ' ' + pts[12][1].toFixed(1) + 'L66 -2"/>'
        /* espiral: anillos que se comban un poco hacia el centro entre radio y radio */
        for (var k = 1; k <= 6; k++) {
          var f = k / 6.4, d = ''
          for (i = 0; i <= n; i++) {
            var p0 = pts[i % n], p1 = pts[(i + 1) % n]
            var x0 = cx + (p0[0] - cx) * f, y0 = cy + (p0[1] - cy) * f, x1 = cx + (p1[0] - cx) * f, y1 = cy + (p1[1] - cy) * f
            var mx = cx + ((x0 + x1) / 2 - cx) * .9, my = cy + ((y0 + y1) / 2 - cy) * .9
            d += (i ? '' : 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1)) + (i < n ? 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1) : '')
          }
          t += '<path d="' + d + '"/>'
        }
        /* gotas de rocio */
        t += '</g><g fill="#dfe6ff" opacity=".7"><circle cx="52" cy="22" r=".6"/><circle cx="34" cy="38" r=".5"/><circle cx="58" cy="36" r=".55"/><circle cx="30" cy="20" r=".45"/></g>'
        return t
      })() +
      '<g class="b-arana"><path d="M44 30V54" stroke="#b9c3e0" stroke-width=".4" opacity=".6"/><ellipse cx="44" cy="56" rx="2.6" ry="3.2" fill="#0c0610"/><circle cx="44" cy="52.4" r="1.6" fill="#0c0610"/>' +
      '<path d="M42 55L38 52M42 56L37.6 56M42 57L38 60M46 55L50 52M46 56L50.4 56M46 57L50 60" stroke="#0c0610" stroke-width=".7"/><circle cx="43.4" cy="52" r=".3" fill="#ff5d6c"/><circle cx="44.6" cy="52" r=".3" fill="#ff5d6c"/></g>' +
      /* colina, casa encantada y arbol */
      '<path d="M40 140Q90 116 150 114Q210 112 260 128Q290 136 320 140Z" fill="url(#bnColina)"/>' +
      casa + arbol +
      /* cementerio */
      lapida(70, 120, 9, 18, -6, 0) + lapida(88, 124, 8, 15, 5, 1) + lapida(232, 122, 10, 18, 4, 0) + lapida(312, 124, 8, 16, -5, 0) + lapida(330, 126, 7, 13, 8, 1) +
      /* gato negro sentado en la lapida, con ojos que brillan */
      '<g transform="translate(232 118)"><path d="M-4 4Q-5 -2 -3 -5L-3.6 -9L-1.6 -7Q0 -7.6 1.6 -7L3.6 -9L3 -5Q5 -2 4 4Z" fill="#06030a"/><path d="M4 3Q9 2 8 -4Q7.4 -6 9 -7" stroke="#06030a" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<g class="b-vela" fill="#c8ff6a"><ellipse cx="-1.4" cy="-4.2" rx=".7" ry=".5"/><ellipse cx="1.4" cy="-4.2" rx=".7" ry=".5"/></g></g>' +
      /* velas en el cementerio */
      (function () { var t = ''; [[80, 136], [96, 137], [322, 138], [340, 139]].forEach(function (v, i) { t += '<rect x="' + (v[0] - 1.2) + '" y="' + (v[1] - 6) + '" width="2.4" height="6" fill="#efe6d4"/><circle cx="' + v[0] + '" cy="' + (v[1] - 8) + '" r="4" fill="#ffcf5a" opacity=".2"/><path class="b-vela" style="animation-delay:-' + (i * .4) + 's" d="M' + v[0] + ' ' + (v[1] - 10.5) + 'Q' + (v[0] + 1.3) + ' ' + (v[1] - 8) + ' ' + v[0] + ' ' + (v[1] - 6.6) + 'Q' + (v[0] - 1.3) + ' ' + (v[1] - 8) + ' ' + v[0] + ' ' + (v[1] - 10.5) + 'Z" fill="#ffd36b"/>' }); return t })() +
      '<path d="M0 140Q60 132 120 136T260 134T400 138V150H0Z" fill="#0e0816"/>' +
      /* calabazas encendidas */
      calabaza(48, 138, 7, 0) + calabaza(112, 136, 5.4, .6) + calabaza(202, 137, 6.4, 1.2) + calabaza(292, 138, 7.4, .3) + calabaza(352, 139, 5, .9) +
      /* fantasmas */
      fantasma(100, 70, .9, 0) + fantasma(318, 66, .75, 1.6) + fantasma(176, 40, .55, .8) +
      '</svg>'
  })()
  var NIEBLA = '<svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><g class="b-niebla"><ellipse cx="60" cy="30" rx="80" ry="10" fill="#c9c3ff" opacity=".1"/><ellipse cx="200" cy="34" rx="110" ry="9" fill="#c9c3ff" opacity=".09"/><ellipse cx="340" cy="30" rx="90" ry="11" fill="#c9c3ff" opacity=".1"/><ellipse cx="480" cy="32" rx="90" ry="10" fill="#c9c3ff" opacity=".08"/></g></svg>'
  /* una llama de varias capas (exterior roja, naranja, amarilla y nucleo claro) que se agita; x,y: base; w,h: tamano; d: retraso */
  function LLAMA(x, y, w, h, d) {
    function f(sc, c, o) {
      var ww = w * sc, hh = h * sc
      return '<path d="M' + (x - ww / 2) + ' ' + y + 'C' + (x - ww / 2) + ' ' + (y - hh * .45) + ' ' + (x - ww * .2) + ' ' + (y - hh * .5) + ' ' + (x - ww * .12) + ' ' + (y - hh * .82) +
        'C' + (x - ww * .02) + ' ' + (y - hh * .62) + ' ' + (x + ww * .08) + ' ' + (y - hh * .7) + ' ' + (x + ww * .02) + ' ' + (y - hh) +
        'C' + (x + ww * .3) + ' ' + (y - hh * .72) + ' ' + (x + ww * .5) + ' ' + (y - hh * .45) + ' ' + (x + ww / 2) + ' ' + y + 'Z" fill="' + c + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'
    }
    return '<g class="b-fl2" style="animation-delay:-' + d + 's">' + f(1.15, '#ff5a1f', .35) + f(1, '#e8431c', .9) + f(.78, '#ff8a2a') + f(.55, '#ffc24a') + f(.32, '#fff0b8') + '</g>'
  }
  var TORRES = (function () {
    function torre(x) {
      var t = '<path d="M' + x + ' 140V54H' + (x + 34) + 'V140Z" fill="#1d1420"/>' +
        '<path d="M' + (x - 3) + ' 54H' + (x + 37) + 'V48H' + (x - 3) + 'Z" fill="#241826"/>'
      for (var i = 0; i < 6; i++) t += '<rect x="' + (x - 3 + i * 7) + '" y="42" width="4.4" height="6" fill="#241826"/>'
      for (var j = 0; j < 10; j++) t += '<path d="M' + x + ' ' + (62 + j * 8) + 'H' + (x + 34) + '" stroke="#2c2030" stroke-width=".6"/>'
      for (j = 0; j < 10; j++) t += '<path d="M' + (x + (j % 2 ? 11 : 22)) + ' ' + (62 + j * 8) + 'V' + (70 + j * 8) + '" stroke="#2c2030" stroke-width=".5"/>'
      t += '<path d="M' + (x + 8) + ' 81V74Q' + (x + 10) + ' 71 ' + (x + 12) + ' 74V81ZM' + (x + 22) + ' 81V74Q' + (x + 24) + ' 71 ' + (x + 26) + ' 74V81ZM' + (x + 15) + ' 108V100Q' + (x + 17) + ' 97 ' + (x + 19) + ' 100V108Z" fill="#ffb05a" opacity=".6"/>'
      return t
    }
    return '<svg viewBox="0 0 400 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' +
      /* resplandor del fuego sobre las torres */
      '<ellipse cx="96" cy="140" rx="90" ry="40" fill="#ff7a2a" opacity=".16"/>' +
      /* lienzo central con el arco apuntado y almenas */
      '<path d="M178 140V70H222V140Z" fill="#191120"/>' +
      (function () { var t = ''; for (var j = 0; j < 8; j++) t += '<path d="M178 ' + (78 + j * 8) + 'H222" stroke="#2a1d2c" stroke-width=".6"/>'; return t })() +
      /* galeria de arcos apuntados (la tracería de la torre) */
      (function () { var t = '<rect x="180" y="74" width="40" height="11" fill="#140c18"/>'; for (var j = 0; j < 5; j++) t += '<path d="M' + (182 + j * 7.6) + ' 85V79Q' + (184.6 + j * 7.6) + ' 75.5 ' + (187.2 + j * 7.6) + ' 79V85Z" fill="#ff9a4d" opacity=".4"/>'; return t })() +
      '<path d="M188 140V104Q200 86 212 104V140Z" fill="#ff9a4d" opacity=".35"/><path d="M185 140V103Q200 82 215 103V140" fill="none" stroke="#3a2a3a" stroke-width="2.6"/>' +
      (function () { var t = ''; for (var j = 0; j < 9; j++) { var a = Math.PI * (1 - j / 8), cx = 200, cy = 104; t += '<path d="M' + (cx + 12 * Math.cos(a)).toFixed(1) + ' ' + (cy - 14 * Math.sin(a)).toFixed(1) + 'L' + (cx + 15 * Math.cos(a)).toFixed(1) + ' ' + (cy - 18 * Math.sin(a)).toFixed(1) + '" stroke="#2a1d2c" stroke-width=".7"/>' } return t })() +
      (function () { var t = ''; for (var i = 0; i < 6; i++) t += '<rect x="' + (178 + i * 7.6) + '" y="64" width="4.4" height="6" fill="#191120"/>'; return t })() +
      torre(144) + torre(222) +
      /* borde de luz anaranjada en la cara que mira al fuego */
      '<path d="M144 140V54M222 140V54M178 140V70" stroke="#ff9a4d" stroke-width="1" opacity=".55"/>' +
      /* Senyera en el mastil de la torre izquierda */
      '<path d="M161 42V18" stroke="#2a1d2c" stroke-width="1.4"/><g class="b-ondea"><path d="M161 19H182V31H161Z" fill="#f2c94c"/><path d="M161 21.5H182M161 24H182M161 26.5H182M161 29H182" stroke="#d23a3a" stroke-width="1.2"/><path d="M161 19H166V31H161Z" fill="#2a5fb0"/></g>' +
      /* la falla de madera: plataforma de tablones, segundo piso con volutas, dos torres de andamiaje y un gran ninot
         tallado (cara con bigote, tricornio, fajin, brazos de viga y antorcha). Arde por varios sitios, con humo y zonas quemadas */
      '<defs><linearGradient id="bnMad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06a3a"/><stop offset="1" stop-color="#5a361a"/></linearGradient>' +
      '<linearGradient id="bnMad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e3a1e"/><stop offset=".45" stop-color="#b07a44"/><stop offset="1" stop-color="#4e2e16"/></linearGradient>' +
      '<linearGradient id="bnMad3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c08850"/><stop offset="1" stop-color="#6a4020"/></linearGradient>' +
      '<radialGradient id="bnLuz" cx=".5" cy=".85" r=".6"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".45"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="72" cy="104" rx="92" ry="62" fill="url(#bnLuz)"/>' +
      /* torres de andamiaje a los lados, con cruces */
      (function () {
        var t = ''
        ;[[8, 22], [122, 136]].forEach(function (tw) {
          t += '<path d="M' + tw[0] + ' 124V46M' + tw[1] + ' 124V46" stroke="#6e4423" stroke-width="2.6"/>'
          for (var y = 124; y > 50; y -= 16) t += '<path d="M' + tw[0] + ' ' + y + 'L' + tw[1] + ' ' + (y - 16) + 'M' + tw[1] + ' ' + y + 'L' + tw[0] + ' ' + (y - 16) + 'M' + tw[0] + ' ' + y + 'H' + tw[1] + '" stroke="#7e5028" stroke-width="1.3"/>'
          t += '<path d="M' + (tw[0] - 3) + ' 47L' + ((tw[0] + tw[1]) / 2) + ' 36L' + (tw[1] + 3) + ' 47Z" fill="url(#bnMad)" stroke="#3a2210" stroke-width=".6"/>'
        })
        return t
      })() +
      /* plataforma de tablones con clavos */
      '<rect x="4" y="124" width="136" height="16" fill="url(#bnMad)"/><path d="M4 124H140" stroke="#d29a5e" stroke-width="1"/>' +
      (function () {
        var t = ''
        for (var r = 0; r < 4; r++) {
          t += '<path d="M4 ' + (128 + r * 4) + 'H140" stroke="#3a2210" stroke-width=".6"/>'
          for (var x = 4 + (r % 2) * 9; x < 140; x += 18) t += '<path d="M' + x + ' ' + (124 + r * 4) + 'V' + (128 + r * 4) + '" stroke="#3a2210" stroke-width=".6"/><circle cx="' + (x + 2) + '" cy="' + (126 + r * 4) + '" r=".45" fill="#1a0e06"/>'
        }
        return t
      })() +
      /* segundo piso: tablas verticales y volutas talladas en las esquinas */
      '<path d="M16 124L24 102H120L128 124Z" fill="url(#bnMad2)" stroke="#3a2210" stroke-width=".7"/>' +
      (function () { var t = ''; for (var x = 30; x < 120; x += 7) t += '<path d="M' + x + ' 103V124" stroke="#4a2c14" stroke-width=".55" opacity=".8"/><path d="M' + (x + 3) + ' 106Q' + (x + 4.5) + ' 113 ' + (x + 3) + ' 120" stroke="#c89058" stroke-width=".35" fill="none" opacity=".6"/>'; return t })() +
      '<rect x="20" y="99" width="104" height="5" fill="#6e4423" stroke="#3a2210" stroke-width=".6"/>' +
      '<path d="M28 116Q22 110 28 106Q34 106 32 112Q30 115 28 112" fill="none" stroke="#d6a064" stroke-width="1.2"/><path d="M116 116Q122 110 116 106Q110 106 112 112Q114 115 116 112" fill="none" stroke="#d6a064" stroke-width="1.2"/>' +
      /* el gran ninot de madera: torso con fajin y remaches, brazos de viga, antorcha */
      '<path d="M44 100L50 70Q72 60 94 70L100 100Z" fill="url(#bnMad2)" stroke="#3a2210" stroke-width=".8"/>' +
      '<path d="M50 74Q72 66 94 74M48 84Q72 76 96 84M46 92Q72 86 98 92" stroke="#4a2c14" stroke-width=".5" fill="none" opacity=".7"/>' +
      '<path d="M52 72L92 98L88 100L48 76Z" fill="#7a1f24" opacity=".85"/>' +
      '<circle cx="62" cy="88" r="1.1" fill="#2a1608"/><circle cx="82" cy="88" r="1.1" fill="#2a1608"/><circle cx="72" cy="94" r="1.1" fill="#2a1608"/>' +
      '<path d="M52 76L30 62" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/><path d="M52 76L30 62" stroke="#a8733f" stroke-width="2" stroke-linecap="round" opacity=".6"/><ellipse cx="28" cy="61" rx="4.4" ry="3.6" fill="url(#bnMad3)" stroke="#3a2210" stroke-width=".6"/>' +
      '<path d="M92 76L112 58" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/><path d="M92 76L112 58" stroke="#a8733f" stroke-width="2" stroke-linecap="round" opacity=".6"/><ellipse cx="113" cy="57" rx="4.2" ry="3.6" fill="url(#bnMad3)" stroke="#3a2210" stroke-width=".6"/>' +
      '<path d="M112 58L120 46" stroke="#4a2c14" stroke-width="3" stroke-linecap="round"/>' +
      /* cabeza tallada: cara, cejas, ojos, nariz, bigote, orejas y tricornio con galon */
      '<ellipse cx="72" cy="50" rx="15" ry="17" fill="url(#bnMad3)" stroke="#3a2210" stroke-width=".8"/>' +
      '<path d="M60 44Q66 40 70 43M74 43Q78 40 84 44" stroke="#3a2210" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="66" cy="47.5" rx="2.2" ry="1.6" fill="#2a1608"/><ellipse cx="78" cy="47.5" rx="2.2" ry="1.6" fill="#2a1608"/><circle cx="66.6" cy="47" r=".5" fill="#ffcf8a"/><circle cx="78.6" cy="47" r=".5" fill="#ffcf8a"/>' +
      '<path d="M72 47Q70 54 68.5 56Q72 58 75.5 56Q74 54 72 47Z" fill="#9a6034" stroke="#3a2210" stroke-width=".6"/>' +
      '<path d="M72 59Q64 56 58 61Q63 60 66 62Q70 61 72 60Q74 61 78 62Q81 60 86 61Q80 56 72 59Z" fill="#3a2210"/><path d="M66 64Q72 67 78 64" stroke="#3a2210" stroke-width=".9" fill="none"/>' +
      '<path d="M57 50Q54 50 55 55Q56 57 58 56M87 50Q90 50 89 55Q88 57 86 56" fill="url(#bnMad3)" stroke="#3a2210" stroke-width=".6"/>' +
      '<path d="M50 37Q72 20 94 37Q86 33 72 35Q58 33 50 37Z" fill="#3a2414" stroke="#1f120a" stroke-width=".7"/><path d="M53 36Q72 27 91 36" stroke="#d9a441" stroke-width="1.1" fill="none"/><circle cx="72" cy="29" r="1.6" fill="#d9a441"/>' +
      /* vetas en la cara */
      '<path d="M62 38Q60 50 63 62M82 38Q84 50 81 62" stroke="#7a4a24" stroke-width=".4" fill="none" opacity=".6"/>' +
      /* zonas chamuscadas junto al fuego */
      '<ellipse cx="18" cy="122" rx="12" ry="5" fill="#140a05" opacity=".55"/><ellipse cx="124" cy="121" rx="13" ry="5" fill="#140a05" opacity=".55"/><ellipse cx="70" cy="102" rx="14" ry="4" fill="#140a05" opacity=".5"/><ellipse cx="88" cy="33" rx="6" ry="3" fill="#140a05" opacity=".5"/>' +
      /* humo */
      '<g class="b-humo"><circle cx="20" cy="84" r="7" fill="#5a5260"/></g><g class="b-humo" style="animation-delay:-1.6s"><circle cx="124" cy="80" r="8" fill="#5a5260"/></g><g class="b-humo" style="animation-delay:-3.1s"><circle cx="16" cy="28" r="6" fill="#5a5260"/></g><g class="b-humo" style="animation-delay:-2.3s"><circle cx="90" cy="18" r="6" fill="#5a5260"/></g>' +
      /* llamas en varios puntos */
      LLAMA(18, 124, 22, 30, 0) + LLAMA(124, 124, 26, 36, .3) + LLAMA(70, 102, 28, 24, .55) + LLAMA(120, 47, 11, 18, .15) + LLAMA(15, 46, 12, 20, .7) + LLAMA(88, 35, 12, 15, .4) + LLAMA(42, 124, 12, 14, .9) +
      '</svg>'
  })()
  function deco(sel, l) {
    var k = sel.k, L = window.vcLluvias
    /* lluvias: sin la constelacion (ya sale en la cuenta atras); solo el resplandor del radiante y muchas fugaces.
       Para cada una se puede poner una ilustracion propia en el vault (temporadas/leonidas.jpg...) */
    if (k === 'lluvia') return { rad: [.84, .2] }
    if (k === 'primavera') return { r: svgCielo('osa-mayor'), cls: 'b-bn-const b-bn-osa' }
    if (k === 'verano') return { r: svgCielo('triangulo-verano'), cls: 'b-bn-const b-bn-tri' }
    if (k === 'hispanidad') return { mapa: 1 }
    if (k === 'san-juan') return { bottom: HORIZONTE, extra: HOGUERA, xcls: 'b-x-hoguera' }
    if (k === '14-juillet') return { extra: EIFFEL, xcls: 'b-x-eiffel' }
    if (k === 'invierno' && L && L.style) { var o = L.style('orionidas'); return o ? { r: o.svg, cls: 'b-bn-const' } : null }
    if (k === 'navidad') return { esc: ARBOL, papa: PAPA }
    if (k === 'feria-de-abril') return { esc: FERIA, ecls: 'b-esc-feria', bottom: ALBERO, bcls: 'b-b-prado' }
    if (k === 'carnaval') return { teatro: 1 }
    if (k === 'reyes') return { esc: DESIERTO, bottom: DUNAS2, ecls: 'b-esc-reyes' }
    /* Semana Santa: en espanol, el Calvario y la procesion; en otros idiomas, Pascua con conejitos y huevos */
    if (k === 'semana-santa') return l === 'es' ? { r: svgLuna('#f4ecd2', '#cfc6a8'), cls: 'b-bn-moon b-ss-luna', esc: CALVARIO, ecls: 'b-esc-ss', bottom: SUELO_SS, bcls: 'b-b-ss' } : { r: svgLuna('#f4ecd2', '#cfc6a8'), cls: 'b-bn-moon b-ss-luna b-pas-luna', esc: PASCUA, ecls: 'b-esc-ss b-esc-pas', bottom: PRADO, bcls: 'b-b-prado' }
    if (k === 'halloween') return { esc: HALLOWEEN, ecls: 'b-esc-hw', bottom: NIEBLA }
    if (k === 'tomatina') return { r: svgLuna('#e0552e', '#9c2f16'), cls: 'b-bn-moon' } /* Marte */
    if (k === 'chandeleur') return { r: svgLuna('#f6d38a', '#d9a94e'), cls: 'b-bn-moon', extra: VELAS, xcls: 'b-x-velas' } /* luna... o crepe; y las velas de la Candelaria */
    if (k === 'rocio') return { esc: ROCIO, ecls: 'b-esc-rocio', bottom: ARENA, bcls: 'b-b-prado', fondo: MONTES }
    if (k === 'fallas') return { esc: TORRES, bottom: HORIZONTE, ecls: 'b-esc-fallas' }
    if (k === 'san-fermin') return { esc: PAMPLONA, ecls: 'b-esc-sf', top: PANUELOS }
    return null
  }

  /* donde esta la figura dentro de cada ilustracion (fracciones de la imagen: x, y, ancho, alto), para poner encima la constelacion */
  /* temporadas en las que la Vero de temporada sale entera */
  var ENTERA = ['reyes', 'san-juan', 'chandeleur']
  /* cuanto se agranda (en % del alto del banner) si hay que ensenar algo mas abajo de la cintura: la Hispanidad, todas las banderas */
  var ALTO = { hispanidad: 146 }
  var FIG = { _: [.45, .06, .5, .86], leonidas: [.44, .05, .5, .86], perseidas: [.55, .03, .38, .92], geminidas: [.55, .02, .26, .95], orionidas: [.56, .02, .29, .95], cuadrantidas: [.58, .02, .27, .94], liridas: [.57, .05, .27, .88], 'eta-acuaridas': [.45, .04, .46, .9] }

  /* motor de particulas en un canvas (se para solo si el banner no se ve o con "menos animaciones") */
  function animar(cv, fx, acc, rad, pal, cada) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, P = [], t0 = 0, raf = 0
    var quieto = false
    try { quieto = matchMedia('(prefers-reduced-motion: reduce)').matches || localStorage.getItem('vc-anim') === 'off' } catch (e) { }
    function size() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1)
      W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    }
    function rnd(a, b) { return a + Math.random() * (b - a) }
    function nuevo(tipo, ini) {
      var p = { t: tipo }
      if (tipo === 'estrella') { p.x = rnd(0, 1); p.y = rnd(0, 1); p.r = rnd(.4, 1.3); p.f = rnd(0, 6.28); p.v = rnd(.6, 1.8) }
      else if (tipo === 'nieve') { p.x = rnd(0, 1); p.y = ini ? rnd(0, 1) : -.05; p.r = rnd(.8, 2.4); p.v = rnd(.03, .08); p.f = rnd(0, 6.28) }
      else if (tipo === 'confeti') { p.x = rnd(0, 1); p.y = ini ? rnd(0, 1) : -.05; p.v = rnd(.05, .11); p.a = rnd(0, 6.28); p.w = rnd(-3, 3); var cc = pal || ['#f8d874', '#ff9fc9', '#62e2d2', '#b9a2ff', '#8ab4ff', '#ff8d5e']; p.c = cc[Math.floor(rnd(0, cc.length))] }
      else if (tipo === 'brasa') { p.x = rnd(.05, .95); p.y = ini ? rnd(.3, 1) : 1.03; p.v = rnd(.07, .16); p.f = rnd(0, 6.28); p.r = rnd(.8, 2); p.c = ['#ffb347', '#ff7a2a', '#ffd36b'][Math.floor(rnd(0, 3))] }
      else if (tipo === 'tomate') { p.x = rnd(0, 1); p.y = ini ? rnd(0, 1) : -.06; p.v = rnd(.05, .1); p.r = rnd(3, 6); p.a = rnd(0, 6.28) }
      else if (tipo === 'chispa') { p.vida = 0 }
      else if (tipo === 'arena') { p.x = ini ? rnd(0, 1) : 1.05; p.y = rnd(.5, 1); p.v = rnd(.12, .3); p.l = rnd(3, 11); p.a = rnd(.25, .6); p.f = rnd(0, 6.28) }
      else if (tipo === 'hoja' || tipo === 'petalo') { p.x = rnd(0, 1); p.y = ini ? rnd(0, 1) : -.08; p.v = rnd(.03, .07); p.a = rnd(0, 6.28); p.w = rnd(-1.5, 1.5); p.f = rnd(0, 6.28); p.s = rnd(.7, 1.3); p.c = tipo === 'hoja' ? ['#ff9a4d', '#e9761f', '#f8c45c', '#c9572a'][Math.floor(rnd(0, 4))] : ['#ffc6dd', '#ff9fc9', '#fff0f6'][Math.floor(rnd(0, 3))] }
      else if (tipo === 'fugaz') { var o = rad || [rnd(.55, .95), rnd(.05, .4)]; p.x = o[0] + rnd(-.04, .04); p.y = o[1] + rnd(-.05, .05); p.a = rnd(2.1, 2.9); p.l = 0; p.v = rnd(.6, 1); p.vida = 0 }
      else if (tipo === 'murcielago') { p.x = ini ? rnd(0, 1) : 1.08; p.y = rnd(.12, .6); p.v = rnd(.05, .09); p.f = rnd(0, 6.28); p.s = rnd(.7, 1.2) }
      return p
    }
    function poblar() {
      P = []
      var n = Math.round(W * H / 2600)
      for (var i = 0; i < n; i++) P.push(nuevo('estrella', 1))
      if (fx.indexOf('nieve') >= 0) for (i = 0; i < Math.round(W / 9); i++) P.push(nuevo('nieve', 1))
      if (fx.indexOf('confeti') >= 0) for (i = 0; i < Math.round(W / 14); i++) P.push(nuevo('confeti', 1))
      if (fx.indexOf('hojas') >= 0) for (i = 0; i < Math.round(W / 40); i++) P.push(nuevo('hoja', 1))
      if (fx.indexOf('petalos') >= 0) for (i = 0; i < Math.round(W / 30); i++) P.push(nuevo('petalo', 1))
      if (fx.indexOf('murcielagos') >= 0) for (i = 0; i < 5; i++) P.push(nuevo('murcielago', 1))
      if (fx.indexOf('brasas') >= 0) for (i = 0; i < Math.round(W / (fx.indexOf('fuegos') >= 0 ? 22 : 12)); i++) P.push(nuevo('brasa', 1))
      if (fx.indexOf('arena') >= 0) for (i = 0; i < Math.round(W / 6); i++) P.push(nuevo('arena', 1))
      if (fx.indexOf('tomates') >= 0) for (i = 0; i < Math.round(W / 45); i++) P.push(nuevo('tomate', 1))
    }
    function luces(t) {
      /* guirnalda de luces que cuelga del borde de arriba */
      var X0 = W * .36, WW = W - X0, n = Math.max(6, Math.round(WW / 46)), cols = ['#ff5d6c', '#f8d874', '#7ee08a', '#8ab4ff']
      ctx.strokeStyle = '#2d3a6e'; ctx.lineWidth = 1.2; ctx.beginPath()
      for (var i = 0; i <= n; i++) { var x = X0 + i / n * WW, y = 6 + Math.sin(i / n * Math.PI * 4) * 3 + 6 * Math.sin(Math.PI * ((i % 4) / 4)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }
      ctx.stroke()
      for (i = 0; i < n; i++) {
        var x2 = X0 + (i + .5) / n * WW, y2 = 9 + Math.sin((i + .5) / n * Math.PI * 4) * 3 + 6 * Math.sin(Math.PI * (((i + .5) % 4) / 4))
        var on = .55 + .45 * Math.sin(t / 420 + i * 1.7), c = cols[i % 4]
        ctx.globalAlpha = on; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10 * on
        ctx.beginPath(); ctx.ellipse(x2, y2 + 5, 3, 4.5, 0, 0, 6.29); ctx.fill()
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1
    }
    function via() {
      /* polvo de la Via Lactea: banda diagonal de estrellitas */
      for (var i = 0; i < 260; i++) {
        var u = (i * 0.618034) % 1, v = ((i * 0.3819) % 1 - .5) * .28
        var x = u * W, y = H * (1 - u) * .9 + v * H + H * .05
        ctx.globalAlpha = .18 + .3 * ((i * 7) % 10) / 10; ctx.fillStyle = i % 5 ? '#fff' : '#ffd9a8'; ctx.fillRect(x, y, 1.1, 1.1)
      }
      ctx.globalAlpha = 1
    }
    function farolillos(t) {
      /* farolillos de feria colgados: verdes, blancos, rojos y amarillos, con lunares */
      /* a todo lo ancho del banner (el texto baja un poco para no taparse con ellos) */
      var n = Math.max(6, Math.round(W / 60)), cols = ['#2fa35b', '#f2f2f2', '#e8423f', '#f8d874']
      ctx.strokeStyle = '#3b467a'; ctx.lineWidth = 1; ctx.beginPath()
      var X0 = 0, WW = W
      for (var i = 0; i <= 160; i++) { var x = X0 + i / 160 * WW, y = 3 + 7 * Math.abs(Math.sin(i / 160 * Math.PI * n)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }
      ctx.stroke()
      for (i = 0; i < n; i++) {
        var x2 = X0 + (i + .5) / n * WW, y2 = 3 + 7 + 10, c = cols[i % 4], sw = Math.sin(t / 900 + i) * .08
        ctx.save(); ctx.translate(x2, y2); ctx.rotate(sw)
        ctx.globalAlpha = .95; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8
        ctx.beginPath(); ctx.ellipse(0, 0, 7, 8.6, 0, 0, 6.29); ctx.fill(); ctx.shadowBlur = 0
        ctx.fillStyle = '#d8b064'; ctx.globalAlpha = .9; ctx.fillRect(-2.4, -10.4, 4.8, 2); ctx.fillRect(-2, 8, 4, 1.6)
        ctx.fillStyle = c === '#f2f2f2' ? '#e8423f' : '#fff'; ctx.globalAlpha = .8
        ;[[-2.4, -3.2], [2.4, -1.6], [-1.6, 2.4], [3, 4], [0, -6.2], [-3.6, 1]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0], q[1], 1, 0, 6.29); ctx.fill() })
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }
    function guirnalda(t) {
      /* guirnalda de espumillon verde colgando en ondas por todo el borde de arriba, con lazos rojos y bombillas */
      var n = Math.max(4, Math.round(W / 85)), cols = ['#ff5d6c', '#f8d874', '#7ee08a', '#8ab4ff', '#c9a6ff'], k = 0
      function q(a, b, c, u) { return (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c }
      for (var i = 0; i < n; i++) {
        var x0 = i / n * W, x1 = (i + 1) / n * W, xm = (x0 + x1) / 2, y0 = 1, yc = 15
        ctx.globalAlpha = 1; ctx.lineCap = 'round'
        ctx.strokeStyle = '#174d36'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(xm, yc, x1, y0); ctx.stroke()
        ctx.strokeStyle = '#2e8b57'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x0, y0 - 1); ctx.quadraticCurveTo(xm, yc - 1, x1, y0 - 1); ctx.stroke()
        for (var u = .2; u < .85; u += .3) {
          var bx = q(x0, xm, x1, u), by = q(y0, yc, y0, u) + 4, c = cols[k++ % cols.length], on = .5 + .5 * Math.sin(t / 380 + k * 1.9)
          ctx.globalAlpha = .45 + .55 * on; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 9 * on
          ctx.beginPath(); ctx.ellipse(bx, by, 2.4, 3.4, 0, 0, 6.29); ctx.fill(); ctx.shadowBlur = 0
        }
        /* lazo rojo en cada punto de cuelgue */
        ctx.globalAlpha = 1; ctx.fillStyle = '#d23a4a'
        ctx.beginPath(); ctx.ellipse(x0 - 3.5, 3, 3.5, 2.2, -.4, 0, 6.29); ctx.ellipse(x0 + 3.5, 3, 3.5, 2.2, .4, 0, 6.29); ctx.fill()
        ctx.fillStyle = '#f8d874'; ctx.beginPath(); ctx.arc(x0, 3, 1.6, 0, 6.29); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    var ultimoFuego = 0
    function fuego() {
      var cx = rnd(.15, .85), cy = rnd(.15, .5), cc = pal || ['#f8d874', '#ff9fc9', '#8ab4ff'], c = cc[Math.floor(rnd(0, cc.length))], n = 34
      for (var i = 0; i < n; i++) { var a = i / n * 6.283, v = rnd(.55, 1); P.push({ t: 'chispa', x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: c, vida: 0 }) }
    }
    /* cohetes: suben con estela y al llegar arriba explotan en chispas con rozamiento y gravedad (se dibujan como trazos: dejan rastro) */
    var COL2 = pal || ['#ffd36b', '#ff8d3a', '#ff5d6c', '#8ab4ff', '#c9a6ff', '#7ee08a', '#fff']
    function cohete() {
      P.push({ t: 'cohete', x: rnd(.12, .9), y: 1.02, vy: -rnd(.55, .8), alto: rnd(.12, .45), c: COL2[Math.floor(rnd(0, COL2.length))], tipo: ['peonia', 'palmera', 'crepitante', 'anillo', 'peonia'][Math.floor(rnd(0, 5))] })
    }
    function explota(p) {
      var n = p.tipo === 'palmera' ? 26 : p.tipo === 'anillo' ? 36 : 54, c2 = COL2[Math.floor(rnd(0, COL2.length))]
      for (var i = 0; i < n; i++) {
        var a = p.tipo === 'anillo' ? i / n * 6.283 : rnd(0, 6.283), v = (p.tipo === 'anillo' ? 150 : p.tipo === 'palmera' ? rnd(95, 145) : rnd(45, 175)) * Math.min(1.3, Math.max(.8, H / 140))
        P.push({ t: 'chispa2', x: p.x * W, y: p.y * H, px: p.x * W, py: p.y * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v * (p.tipo === 'anillo' ? .55 : 1), c: p.tipo === 'palmera' ? '#ffcf6a' : (i % 3 ? p.c : c2), vida: 0, max: p.tipo === 'palmera' ? 2.4 : rnd(1.1, 1.7), g: p.tipo === 'palmera' ? 46 : 30, cr: p.tipo === 'crepitante' })
      }
      P.push({ t: 'flash', x: p.x * W, y: p.y * H, c: p.c, vida: 0 })
    }
    /* Tomatina: tomates lanzados en parabola desde los dos lados; al caer revientan en una salpicadura (gotas, pepitas y chorretones) */
    var ultimoTomate = 0
    function lanzaTomate() {
      var izq = Math.random() < .5, T = rnd(1.1, 1.8), g = 1.7, y0 = rnd(.6, .95), yl = rnd(.72, .98)
      var x0 = izq ? -.04 : 1.04, xl = izq ? rnd(.35, .95) : rnd(.05, .65)
      P.push({ t: 'tomate2', x0: x0, y0: y0, vx: (xl - x0) / T, vy: (yl - y0 - .5 * g * T * T) / T, g: g, T: T, vida: 0, r: rnd(8.5, 13) * Math.max(.75, Math.min(1.3, H / 146)), rot: rnd(0, 6.28), w: rnd(-5, 5) })
    }
    function dibujaTomate(x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
      /* sombra de volumen y cuerpo con brillo */
      var g = ctx.createRadialGradient(-r * .35, -r * .4, r * .15, 0, 0, r * 1.05)
      g.addColorStop(0, '#ff8a6a'); g.addColorStop(.35, '#ef3a22'); g.addColorStop(.8, '#b8180e'); g.addColorStop(1, '#7a0c06')
      ctx.globalAlpha = 1; ctx.fillStyle = g
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.06, r * .94, 0, 0, 6.29); ctx.fill()
      /* gajos */
      ctx.strokeStyle = 'rgba(110,10,6,.45)'; ctx.lineWidth = Math.max(.5, r * .09)
      ctx.beginPath(); ctx.moveTo(-r * .2, -r * .8); ctx.quadraticCurveTo(-r * .55, 0, -r * .25, r * .85); ctx.moveTo(r * .2, -r * .8); ctx.quadraticCurveTo(r * .55, 0, r * .25, r * .85); ctx.stroke()
      /* brillos */
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-r * .42, -r * .38, r * .26, r * .14, -.6, 0, 6.29); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(r * .38, r * .3, r * .1, 0, 6.29); ctx.fill()
      /* caliz verde de cinco hojas y rabito */
      ctx.fillStyle = '#3f8f3a'; ctx.strokeStyle = '#255a22'; ctx.lineWidth = Math.max(.4, r * .06)
      ctx.beginPath()
      for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .14 : r * .5; ctx.lineTo(Math.cos(a) * rr, -r * .78 + Math.sin(a) * rr * .55) }
      ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.strokeStyle = '#2d6a2a'; ctx.lineWidth = Math.max(.8, r * .14); ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(0, -r * .8); ctx.quadraticCurveTo(r * .12, -r * 1.1, r * .3, -r * 1.2); ctx.stroke()
      ctx.restore()
    }
    function salpica(x, y, r) {
      var forma = [], gotas = [], pepitas = [], n = 14
      for (var i = 0; i < n; i++) forma.push(r * (1.15 + Math.random() * .9) * (i % 2 ? .78 : 1))
      for (i = 0; i < 9; i++) { var a = rnd(0, 6.28), dd = r * rnd(2, 3.6); gotas.push([Math.cos(a) * dd, Math.sin(a) * dd * .7, r * rnd(.12, .32)]) }
      for (i = 0; i < 6; i++) pepitas.push([rnd(-r, r) * .9, rnd(-r, r) * .6, rnd(0, 3.14)])
      P.push({ t: 'salpica', x: x, y: y, r: r, forma: forma, gotas: gotas, pepitas: pepitas, chorro: [rnd(-r * .6, r * .6), rnd(r * .6, r * 1.6)], vida: 0 })
    }
    function dibujaSalpica(p) {
      var al = p.vida < .08 ? p.vida / .08 : Math.max(0, 1 - (p.vida - .4) / 1.4), r = p.r, ex = Math.min(1, p.vida / .12)
      if (al <= 0) return
      ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = al * .95
      var g = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 2.2); g.addColorStop(0, '#ff5a3c'); g.addColorStop(.6, '#d42a1a'); g.addColorStop(1, '#8e140c')
      ctx.fillStyle = g; ctx.beginPath()
      for (var i = 0; i < p.forma.length; i++) { var a = i / p.forma.length * 6.283, rr = p.forma[i] * ex; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .62) }
      ctx.closePath(); ctx.fill()
      /* chorreton que cae */
      ctx.fillStyle = '#c4220f'; var cl = p.chorro[1] * Math.min(1, p.vida / .7)
      ctx.beginPath(); ctx.moveTo(p.chorro[0] - r * .14, 0); ctx.lineTo(p.chorro[0] + r * .14, 0); ctx.lineTo(p.chorro[0] + r * .08, cl); ctx.arc(p.chorro[0], cl, r * .12, 0, 3.14); ctx.fill()
      /* gotas alrededor */
      ctx.fillStyle = '#e8321e'
      for (i = 0; i < p.gotas.length; i++) { var q = p.gotas[i]; ctx.beginPath(); ctx.arc(q[0] * ex, q[1] * ex, q[2], 0, 6.29); ctx.fill() }
      /* pulpa clara y pepitas */
      ctx.fillStyle = 'rgba(255,170,120,.55)'; ctx.beginPath(); ctx.ellipse(r * .1, -r * .05, r * .7 * ex, r * .38 * ex, .3, 0, 6.29); ctx.fill()
      ctx.fillStyle = '#f2d27a'
      for (i = 0; i < p.pepitas.length; i++) { var pp = p.pepitas[i]; ctx.beginPath(); ctx.ellipse(pp[0] * ex, pp[1] * ex, r * .1, r * .055, pp[2], 0, 6.29); ctx.fill() }
      ctx.restore()
    }
    var ultimaFugaz = 0, ultimoCohete = 0
    function frame(ts) {
      if (!cv.isConnected) return
      if (!t0) t0 = ts; var dt = Math.min(50, ts - (frame.last || ts)); frame.last = ts
      var vis = cv.offsetParent !== null
      if (!vis) { raf = requestAnimationFrame(frame); return }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
      if (fx.indexOf('via') >= 0) via()
      if (fx.indexOf('lanzar') >= 0 && ts - ultimoTomate > 420 && !quieto) { lanzaTomate(); if (Math.random() < .3) lanzaTomate(); ultimoTomate = ts }
      if (fx.indexOf('cohetes') >= 0 && ts - ultimoCohete > (cada || 900) && !quieto) { cohete(); if (Math.random() < .35) cohete(); ultimoCohete = ts }
      if (fx.indexOf('fuegos') >= 0 && ts - ultimoFuego > (cada || 1300) && !quieto) { fuego(); ultimoFuego = ts }
      if (fx.indexOf('fugaces') >= 0 && ts - ultimaFugaz > (rad ? 700 : 2600) && !quieto) { P.push(nuevo('fugaz')); ultimaFugaz = ts }
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i], s = dt / 1000
        if (p.t === 'estrella') { ctx.globalAlpha = .35 + .4 * Math.sin(p.f + ts / 1000 * p.v); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.29); ctx.fill() }
        else if (p.t === 'nieve') { if (!quieto) { p.y += p.v * s; p.f += s; p.x += Math.sin(p.f) * .0006 } if (p.y > 1.05) P[i] = nuevo('nieve'); ctx.globalAlpha = .75; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.29); ctx.fill() }
        else if (p.t === 'confeti') { if (!quieto) { p.y += p.v * s; p.a += p.w * s } if (p.y > 1.05) P[i] = nuevo('confeti'); ctx.globalAlpha = .9; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.a); ctx.fillRect(-3, -1.5, 6, 3 * Math.abs(Math.cos(p.a * 1.7)) + .6); ctx.restore() }
        else if (p.t === 'hoja' || p.t === 'petalo') { if (!quieto) { p.y += p.v * s; p.f += s * 1.4; p.x += Math.sin(p.f) * .0009 + (p.t === 'petalo' ? .0004 : 0); p.a += p.w * s } if (p.y > 1.1) P[i] = nuevo(p.t); ctx.globalAlpha = .85; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.a); ctx.scale(p.s, p.s * Math.abs(Math.cos(p.f))+.2); ctx.beginPath(); if (p.t === 'hoja') { ctx.moveTo(0, -6); ctx.quadraticCurveTo(6, 0, 0, 6); ctx.quadraticCurveTo(-6, 0, 0, -6) } else ctx.ellipse(0, 0, 4, 2.6, 0, 0, 6.29); ctx.fill(); ctx.restore() }
        else if (p.t === 'murcielago') { if (!quieto) { p.x -= p.v * s; p.f += s * 9 } if (p.x < -.08) P[i] = nuevo('murcielago'); var w = Math.sin(p.f) * 5 * p.s; ctx.globalAlpha = .85; ctx.fillStyle = '#0a0612'; ctx.save(); ctx.translate(p.x * W, p.y * H + Math.sin(p.f / 3) * 4); ctx.scale(p.s, p.s); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-6, -4 - w, -13, -1 - w); ctx.quadraticCurveTo(-8, 0, -6, 3); ctx.quadraticCurveTo(-3, 1, 0, 3); ctx.quadraticCurveTo(3, 1, 6, 3); ctx.quadraticCurveTo(8, 0, 13, -1 - w); ctx.quadraticCurveTo(6, -4 - w, 0, 0); ctx.fill(); ctx.restore() }
        else if (p.t === 'tomate2') {
          p.vida += s; p.rot += p.w * s
          var tx = (p.x0 + p.vx * p.vida) * W, ty = (p.y0 + p.vy * p.vida + .5 * p.g * p.vida * p.vida) * H
          /* estela de movimiento */
          ctx.globalAlpha = .18; ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(tx - p.vx * W * .03, ty - (p.vy + p.g * p.vida) * H * .03, p.r * .8, 0, 6.29); ctx.fill()
          dibujaTomate(tx, ty, p.r, p.rot)
          if (p.vida >= p.T) { salpica(tx, ty, p.r); P.splice(i, 1) }
        }
        else if (p.t === 'salpica') { p.vida += s; dibujaSalpica(p); if (p.vida > 1.9) P.splice(i, 1) }
        else if (p.t === 'cohete') {
          var py0 = p.y; p.y += p.vy * s; p.vy += .22 * s
          ctx.globalAlpha = .9; ctx.strokeStyle = '#ffe3a8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x * W, py0 * H + 10); ctx.lineTo(p.x * W, p.y * H); ctx.stroke()
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 1.4, 0, 6.29); ctx.fill()
          if (p.y <= p.alto || p.vy >= -.05) { explota(p); P.splice(i, 1) }
        }
        else if (p.t === 'chispa2') {
          p.vida += s; p.px = p.x; p.py = p.y
          var dr = Math.pow(.18, s); p.vx *= dr; p.vy = p.vy * dr + p.g * s
          p.x += p.vx * s; p.y += p.vy * s
          var al = Math.max(0, 1 - p.vida / p.max); if (p.cr) al *= Math.random() < .5 ? 1 : .15
          ctx.globalAlpha = al; ctx.strokeStyle = p.c; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.shadowColor = p.c; ctx.shadowBlur = 4
          ctx.beginPath(); ctx.moveTo(p.px - (p.x - p.px) * 2.5, p.py - (p.y - p.py) * 2.5); ctx.lineTo(p.x, p.y); ctx.stroke()
          ctx.shadowBlur = 0
          if (p.vida > p.max) P.splice(i, 1)
        }
        else if (p.t === 'flash') { p.vida += s; ctx.globalAlpha = Math.max(0, .5 - p.vida * 2); var gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40); gr.addColorStop(0, p.c); gr.addColorStop(1, 'transparent'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, 40, 0, 6.29); ctx.fill(); if (p.vida > .25) P.splice(i, 1) }
        else if (p.t === 'chispa') { p.vida += s; var k = p.vida, px = p.x * W + p.vx * 70 * k, py = p.y * H + p.vy * 70 * k + 40 * k * k; ctx.globalAlpha = Math.max(0, 1 - k / 1.3); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 6.29); ctx.fill(); if (k > 1.3) P.splice(i, 1) }
        else if (p.t === 'brasa') { if (!quieto) { p.y -= p.v * s; p.f += s * 3; p.x += Math.sin(p.f) * .0007 } if (p.y < .05) P[i] = nuevo('brasa'); ctx.globalAlpha = Math.min(1, p.y * 1.4) * (.6 + .4 * Math.sin(p.f * 2)); ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.29); ctx.fill(); ctx.shadowBlur = 0 }
        else if (p.t === 'arena') { var rf = .65 + .35 * Math.sin(ts / 1700 + p.y * 6); if (!quieto) { p.x -= p.v * s * rf * 1.6; p.f += s * 2; p.y += Math.sin(p.f) * .0007 } if (p.x < -.05) P[i] = nuevo('arena'); ctx.globalAlpha = p.a * Math.min(1, (p.y - .45) * 4); ctx.strokeStyle = '#e8c48a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(p.x * W + p.l * rf, p.y * H + .6); ctx.stroke() }
        else if (p.t === 'tomate') { if (!quieto) { p.y += p.v * s; p.a += s } if (p.y > 1.08) P[i] = nuevo('tomate'); ctx.globalAlpha = .9; ctx.fillStyle = '#e8402f'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.29); ctx.fill(); ctx.fillStyle = '#5fb760'; ctx.beginPath(); ctx.ellipse(p.x * W, p.y * H - p.r * .85, p.r * .55, p.r * .25, p.a, 0, 6.29); ctx.fill() }
        else if (p.t === 'fugaz') {
          p.vida += s; p.l = Math.min(1, p.vida * 2.4)
          var len = 90 * p.l, x0 = p.x * W + Math.cos(p.a) * p.vida * 260 * p.v, y0 = p.y * H + Math.sin(p.a) * p.vida * 260 * p.v
          var g = ctx.createLinearGradient(x0, y0, x0 - Math.cos(p.a) * len, y0 - Math.sin(p.a) * len)
          var al = Math.max(0, 1 - p.vida / 1.1); g.addColorStop(0, 'rgba(255,255,255,' + al + ')'); g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - Math.cos(p.a) * len, y0 - Math.sin(p.a) * len); ctx.stroke()
          ctx.globalAlpha = al * .5; ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - Math.cos(p.a) * len * .5, y0 - Math.sin(p.a) * len * .5); ctx.stroke()
          if (p.vida > 1.1) P.splice(i, 1)
        }
      }
      ctx.globalAlpha = 1
      if (fx.indexOf('luces') >= 0) luces(ts)
      if (fx.indexOf('guirnalda') >= 0) guirnalda(ts)
      if (fx.indexOf('farolillos') >= 0) farolillos(ts)
      if (quieto) return
      raf = requestAnimationFrame(frame)
    }
    size(); poblar()
    var ro = window.ResizeObserver ? new ResizeObserver(function () { var w0 = W; size(); if (Math.abs(W - w0) > 40) poblar(); if (quieto) frame(performance.now()) }) : null
    if (ro) ro.observe(cv)
    raf = requestAnimationFrame(frame)
  }

  /* ---------------- banner ---------------- */
  var CSS =
    '.b-bn{position:relative;overflow:hidden;display:flex;align-items:flex-end;gap:14px;min-height:96px;padding:16px 20px;border:1px solid color-mix(in srgb,var(--acc) 40%,#343d63);border-radius:16px;background:var(--bg);box-shadow:0 0 34px color-mix(in srgb,var(--acc) 16%,transparent);color:#eef1ff;isolation:isolate}' +
    '.b-bn-cv,.b-bn-img{position:absolute;inset:0;width:100%;height:100%;z-index:-2}' +
    '.b-bn-img{object-fit:cover;object-position:right center}.b-bn.b-hasimg:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#05060fe6 0%,#05060fa6 45%,#05060f1a 80%)}' +
    /* ilustraciones de las lluvias (fondo azul noche): enteras a la derecha, con su constelacion encima */
    /* "lighten": el azul de fondo de la ilustracion no tapa el degradado del banner (solo se ve la figura y sus estrellas) */
    /* con ilustracion, el brillo de color se queda a la izquierda (detras del texto) y a la derecha el azul noche: asi la figura no se pierde */
    '.b-bn.b-ilus{background:radial-gradient(ellipse at 12% 0%,color-mix(in srgb,var(--acc) 24%,transparent),transparent 58%),linear-gradient(100deg,color-mix(in srgb,var(--acc) 12%,#0b1025) 0%,#090f26 52%)}' +
    '.b-bn.b-ilus .b-bn-img{object-fit:contain;object-position:right center;mix-blend-mode:lighten;-webkit-mask-image:linear-gradient(90deg,transparent,#000 18%);mask-image:linear-gradient(90deg,transparent,#000 18%)}.b-bn.b-ilus:after{display:none}' +
    '.b-bn-ov{position:absolute;z-index:0;color:var(--acc);pointer-events:none;filter:drop-shadow(0 0 4px var(--acc))}.b-bn-ov svg{display:block;width:100%;height:100%;overflow:visible}' +
    '.b-bn-ov path{opacity:.9;stroke-width:.7}.b-bn-ov circle{animation:bnTw 3.2s ease-in-out infinite}.b-bn-ov circle:nth-of-type(2n){animation-delay:1.1s}.b-bn-ov circle:nth-of-type(3n){animation-delay:2.1s}' +
    '@keyframes bnTw{50%{opacity:.45}}@media(prefers-reduced-motion:reduce){.b-bn-ov circle{animation:none}}' +
    '.b-bn-d{position:absolute;right:3%;top:50%;z-index:-1;width:min(30%,220px);aspect-ratio:4/3;transform:translateY(-50%);color:var(--acc);pointer-events:none}.b-bn-d svg{display:block;width:100%;height:100%;overflow:visible}' +
    '.b-bn-star{width:min(18%,120px);aspect-ratio:1;top:42%;animation:bnPulse 4s ease-in-out infinite}.b-bn-dreyes{right:8%;top:30%}' +
    '.b-bn-moon{width:min(20%,140px);aspect-ratio:1;top:46%}' +
    '.b-bn-x{position:absolute;right:calc(3% + min(20%,140px) - 30px);bottom:6px;z-index:-1;width:min(9%,64px);pointer-events:none}.b-bn-x svg{display:block;width:100%}' +
    '.b-bn-b{position:absolute;left:0;right:0;bottom:0;height:34%;z-index:-1;pointer-events:none}.b-bn-b svg{display:block;width:100%;height:100%}' +
    '.b-bn-x.b-x-hoguera{right:9%;bottom:2px;width:min(15%,118px)}.b-bn-x.b-x-eiffel{right:9%;bottom:0;width:min(7%,58px)}' +
    '.b-bn-x.b-x-torre{right:calc(3% + min(20%,140px) + 8px);bottom:0;width:min(4.5%,38px)}.b-bn-x.b-x-velas{right:calc(3% + min(20%,140px) + 6px);bottom:2px;width:min(11%,86px)}' +
    '.b-fl{transform-origin:50% 100%;transform-box:fill-box;animation:bnFl 1.1s ease-in-out infinite alternate}@keyframes bnFl{to{transform:scale(.92,1.08) skewX(3deg)}}' +
    '.b-bn-osa{width:min(30%,240px)}.b-bn-tri{width:min(22%,170px);aspect-ratio:12/11}' +
    '.b-bn-hisp{width:min(38%,300px);aspect-ratio:3/1}.b-dos{display:flex;align-items:center;gap:6%;width:100%;height:100%}.b-dos svg{height:100%;width:auto;flex:none}.b-dos svg:first-child{height:80%}.b-dos i{flex:1;align-self:stretch;margin:10% 0;background:linear-gradient(180deg,transparent,#8ab4ff55 48%,#8ab4ff55 52%,transparent);-webkit-mask-image:repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 10px);mask-image:repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 10px)}' +
    '@media(prefers-reduced-motion:reduce){.b-fl{animation:none}}' +
    '.b-bn-esc.b-esc-rocio{width:min(72%,660px)}.b-bn.b-hasvero .b-bn-esc.b-esc-rocio{right:min(15%,160px)}' +
    '.b-rueda{transform-box:fill-box;transform-origin:center;animation:bnRueda 6s linear infinite}@keyframes bnRueda{to{transform:rotate(360deg)}}' +
    '.b-paso{animation:bnPaso 1s ease-in-out infinite alternate}@keyframes bnPaso{to{transform:translateY(-.8px)}}' +
    '.b-carro{animation:bnPaso 1.4s ease-in-out infinite alternate}' +
    '.b-rafaga{transform-box:fill-box;transform-origin:50% 100%;animation:bnRafaga 3s ease-in-out infinite alternate}@keyframes bnRafaga{to{opacity:.65;transform:scale(1.06)}}' +
    '.b-flam{transform-box:fill-box;transform-origin:50% 100%;animation:bnFlam 3s ease-in-out infinite alternate}@keyframes bnFlam{to{transform:rotate(-6deg) translateY(.4px)}}' +
    '.b-campana{transform-box:fill-box;transform-origin:50% 0;animation:bnCamp .7s ease-in-out infinite alternate}@keyframes bnCamp{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}' +
    '.b-campana2{transform-box:fill-box;transform-origin:50% 0;animation:bnCamp 1.2s ease-in-out infinite alternate}' +
    '@media(prefers-reduced-motion:reduce){.b-rueda,.b-paso,.b-carro,.b-rafaga,.b-flam,.b-campana,.b-campana2{animation:none}}' +
    '.b-bn-fondo{position:absolute;left:0;right:0;bottom:0;height:56%;z-index:-2;pointer-events:none}.b-bn-fondo svg{display:block;width:100%;height:100%}' +
    '.b-hmap{position:absolute;bottom:2px;height:calc(100% - 4px);right:min(27%,300px);z-index:-1;pointer-events:none}.b-hmap svg{display:block;width:100%;height:100%;overflow:visible}' +
    '.b-pals{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}' +
    '.b-pal{position:absolute;transform:translate(-50%,-50%) rotate(var(--r));white-space:nowrap;font:italic 600 16px/1 "Iowan Old Style","Palatino Linotype",Georgia,serif;letter-spacing:.01em;text-shadow:0 0 10px currentColor;opacity:0;animation:bnPal 6s ease-in-out infinite}' +
    '@keyframes bnPal{0%{opacity:0;transform:translate(-50%,-30%) rotate(var(--r)) scale(.85)}6%{opacity:.62;transform:translate(-50%,-50%) rotate(var(--r)) scale(1)}28%{opacity:.62}34%,100%{opacity:0;transform:translate(-50%,-72%) rotate(var(--r))}}' +
    '@media(prefers-reduced-motion:reduce){.b-pal{animation:none;opacity:.4}}' +
    '.b-bn.b-t-navidad{padding-top:24px}.b-bn.b-t-feria-de-abril{padding-top:36px}' +
    '.b-bn-esc.b-esc-fallas{width:min(66%,600px)}.b-bn.b-hasvero .b-bn-esc.b-esc-fallas{right:min(13%,140px)}' +
    '.b-bn-top{position:absolute;left:0;right:0;top:0;height:16px;z-index:1;pointer-events:none}.b-bn-top svg{display:block;width:100%;height:100%}' +
    '.b-bn.b-t-san-fermin{padding-top:24px}.b-bn-esc.b-esc-sf{width:min(72%,660px)}.b-bn.b-hasvero .b-bn-esc.b-esc-sf{right:min(13%,140px)}' +
    '.b-encierro{animation:bnEnc 12s linear infinite}@keyframes bnEnc{from{transform:translateX(320px)}to{transform:translateX(-196px)}}' +
    '.b-corre{animation:bnCorre .32s ease-in-out infinite alternate}@keyframes bnCorre{to{transform:translateY(-1.6px)}}' +
    '.b-pA{animation:bnPA .36s steps(1) infinite}.b-pB{animation:bnPB .36s steps(1) infinite}@keyframes bnPA{0%{opacity:1}50%{opacity:0}}@keyframes bnPB{0%{opacity:0}50%{opacity:1}}' +
    '.b-viento{transform-box:fill-box;transform-origin:0 50%;animation:bnViento .24s ease-in-out infinite alternate}@keyframes bnViento{to{transform:rotate(9deg)}}' +
    '.b-polvo{animation:bnPolvo .72s ease-out infinite}@keyframes bnPolvo{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(6px,-4px)}}' +
    '.b-chupi{transform-box:view-box;transform-origin:182px 16px;animation:bnChupi 7s ease-out infinite}@keyframes bnChupi{0%,8%{opacity:0;transform:scale(.3)}16%{opacity:1;transform:scale(1)}55%{opacity:.9}75%,100%{opacity:0;transform:scale(1.6)}}' +
    '.b-conf{transform-box:fill-box;transform-origin:50% 50%;animation:bnConf 6s linear infinite}@keyframes bnConf{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(4px,40px) rotate(180deg)}50%{transform:translate(-3px,80px) rotate(360deg)}75%{transform:translate(3px,120px) rotate(540deg)}100%{transform:translate(0,160px) rotate(720deg)}}' +
    '.b-baila{transform-box:fill-box;transform-origin:50% 100%;animation:bnBaila 1.4s ease-in-out infinite alternate}@keyframes bnBaila{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}' +
    '.b-pan{transform-box:fill-box;transform-origin:0 100%;animation:bnPan .8s ease-in-out infinite alternate}@keyframes bnPan{to{transform:rotate(-14deg)}}' +
    '@media(prefers-reduced-motion:reduce){.b-conf{display:none}.b-encierro,.b-corre,.b-chupi,.b-pan,.b-pA,.b-pB,.b-viento,.b-polvo{animation:none}.b-pB{opacity:0}}' +
    '.b-bn-esc.b-esc-hw{width:min(74%,680px)}.b-bn.b-hasvero .b-bn-esc.b-esc-hw{right:min(12%,130px)}.b-t-halloween .b-bn-b{height:26%;z-index:0}' +
    '.b-vela{animation:bnVela 1.6s ease-in-out infinite alternate}@keyframes bnVela{0%{opacity:1}40%{opacity:.75}55%{opacity:.95}100%{opacity:.6}}' +
    '.b-fant{animation:bnFant 4.2s ease-in-out infinite alternate}@keyframes bnFant{0%{transform:translate(0,0);opacity:.85}50%{opacity:.45}100%{transform:translate(-6px,-7px);opacity:.9}}' +
    '.b-arana{animation:bnArana 5s ease-in-out infinite alternate}@keyframes bnArana{from{transform:translateY(-10px)}to{transform:translateY(8px)}}' +
    '.b-bruja{animation:bnBruja 17s linear 1s infinite}@keyframes bnBruja{0%{transform:translate(150px,10px);opacity:0}6%{opacity:1}50%{transform:translate(0,-4px)}94%{opacity:1}100%{transform:translate(-170px,8px);opacity:0}}' +
    '.b-nube{animation:bnNube 22s ease-in-out infinite alternate}@keyframes bnNube{from{transform:translateX(30px)}to{transform:translateX(-40px)}}' +
    '.b-capa{transform-box:fill-box;transform-origin:0 50%;animation:bnCapa .5s ease-in-out infinite alternate}@keyframes bnCapa{to{transform:scaleY(.82) skewX(-6deg)}}' +
    '.b-niebla{animation:bnNiebla 14s ease-in-out infinite alternate}@keyframes bnNiebla{to{transform:translateX(-60px)}}' +
    '@media(prefers-reduced-motion:reduce){.b-vela,.b-fant,.b-arana,.b-bruja,.b-niebla{animation:none}}' +
    '.b-fl2{transform-origin:50% 100%;transform-box:fill-box;animation:bnFl2 .9s ease-in-out infinite alternate}@keyframes bnFl2{0%{transform:scale(1,1) skewX(0)}50%{transform:scale(.94,1.1) skewX(-4deg)}100%{transform:scale(1.04,.94) skewX(3deg)}}' +
    '.b-humo{transform-box:fill-box;transform-origin:50% 50%;animation:bnHumo 4.6s linear infinite;opacity:0}@keyframes bnHumo{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:.45}100%{transform:translate(-10px,-34px) scale(2.2);opacity:0}}' +
    '@media(prefers-reduced-motion:reduce){.b-fl2,.b-humo{animation:none}}' +
    '.b-ondea{transform-origin:161px 25px;transform-box:view-box;animation:bnOnd 1.6s ease-in-out infinite alternate}@keyframes bnOnd{to{transform:skewY(-5deg) scaleX(.92)}}' +
    '.b-bn-esc.b-esc-feria{width:min(62%,560px)}.b-bn.b-hasvero .b-bn-esc.b-esc-feria{right:min(17%,180px)}' +
    '.b-bomb{animation:bnBomb 1.6s ease-in-out infinite}@keyframes bnBomb{50%{opacity:.35}}' +
    '.b-noria{transform-box:view-box;animation:bnNoria 28s linear infinite}@keyframes bnNoria{to{transform:rotate(360deg)}}' +
    '.b-cab{animation:bnCab .9s ease-in-out infinite alternate}@keyframes bnCab{to{transform:translateY(-1px) rotate(-.6deg)}}' +
    '.b-nota{animation:bnNota 3.2s ease-out infinite}.b-nota2{animation-delay:-.8s}.b-nota3{animation-delay:-1.6s}.b-nota4{animation-delay:-2.4s}@keyframes bnNota{from{transform:translate(0,4px);opacity:0}20%{opacity:1}to{transform:translate(-6px,-26px);opacity:0}}' +
    '.b-cabina{transform-box:fill-box;transform-origin:50% 0;animation:bnCabina 28s linear infinite}@keyframes bnCabina{to{transform:rotate(-360deg)}}' +
    '.b-band{transform-box:fill-box;transform-origin:0 50%;animation:bnBand 1.2s ease-in-out infinite alternate}@keyframes bnBand{to{transform:scaleX(.7) skewY(8deg)}}' +
    '.b-baile{transform-box:view-box;animation:bnBaile 1.4s ease-in-out infinite alternate}.b-baile2{animation-delay:-.7s}@keyframes bnBaile{to{transform:rotate(6deg) translateY(-1px)}}' +
    '.b-caballito{animation:bnCaballito 1.6s ease-in-out infinite alternate}@keyframes bnCaballito{to{transform:translateY(-6px)}}' +
    '.b-rasgueo{transform-box:fill-box;transform-origin:0 0;animation:bnRasgueo .3s ease-in-out infinite alternate}@keyframes bnRasgueo{to{transform:rotate(22deg)}}' +
    '.b-giro{transform-box:fill-box;transform-origin:50% 60%;animation:bnGiro 2.4s ease-in-out infinite}@keyframes bnGiro{0%,100%{transform:none}25%{transform:scaleX(-1)}50%{transform:scaleX(1) rotate(3deg)}75%{transform:scaleX(-1) rotate(-3deg)}}' +
    '@media(prefers-reduced-motion:reduce){.b-bomb,.b-noria,.b-cab,.b-nota,.b-cabina,.b-band,.b-baile,.b-caballito,.b-rasgueo,.b-giro{animation:none}}' +
    '.b-bn-esc.b-esc-ss{width:min(68%,620px)}.b-bn.b-hasvero .b-bn-esc.b-esc-ss{right:min(13%,130px)}' +
    '.b-bn-b.b-b-prado{height:19%;z-index:-2}.b-bn-b.b-b-ss{height:14%;z-index:-2}.b-bn-d.b-ss-luna{right:auto;left:38%;top:34%;width:min(11%,80px)}.b-bn-d.b-pas-luna{left:34%;top:26%;width:min(8%,60px)}.b-bn-esc.b-esc-pas{width:min(54%,500px)}' +
    '.b-halo{animation:bnHalo 4s ease-in-out infinite alternate}@keyframes bnHalo{to{opacity:.6}}' +
    '.b-salta{transform-box:fill-box;transform-origin:50% 100%;animation:bnSalta 11s ease-in-out infinite}' +
    (function () {
      /* 6 saltos: se agacha, sale en arco inclinado estirandose, aterriza aplastandose y descansa */
      var t = '@keyframes bnSalta{0%{transform:translate(0,0);opacity:0}2%{opacity:1}', n = 6, paso = 15, d = 26
      for (var i = 0; i < n; i++) {
        var b = 3 + i * paso, x0 = -i * d, x1 = -(i + 1) * d
        t += (b) + '%{transform:translate(' + x0 + 'px,0) scale(1.12,.82)}' + (b + 3.5) + '%{transform:translate(' + (x0 + x1) / 2 + 'px,-15px) rotate(-12deg) scale(.92,1.1)}' +
          (b + 7) + '%{transform:translate(' + x1 + 'px,0) scale(1.14,.84)}' + (b + 9) + '%{transform:translate(' + x1 + 'px,0) scale(1,1)}'
      }
      return t + '94%{opacity:1;transform:translate(' + (-n * d) + 'px,0)}100%{opacity:0;transform:translate(' + (-n * d) + 'px,0)}}'
    })() +
    '.b-oreja{transform-box:fill-box;transform-origin:50% 100%;animation:bnOreja 5s ease-in-out infinite}.b-oreja2{animation-delay:-2.3s}@keyframes bnOreja{0%,86%,100%{transform:none}90%{transform:rotate(-14deg)}94%{transform:rotate(6deg)}}' +
    '.b-nariz{transform-box:fill-box;transform-origin:center;animation:bnNariz .5s ease-in-out infinite alternate}@keyframes bnNariz{to{transform:scale(1.4)}}' +
    '.b-quieto{transform-box:fill-box;transform-origin:50% 100%;animation:bnQuieto 6s ease-in-out infinite}@keyframes bnQuieto{0%,70%,100%{transform:none}75%{transform:translateY(-6px) scale(.95,1.05)}80%{transform:scale(1.08,.9)}84%{transform:none}}' +
    '.b-come{transform-box:fill-box;transform-origin:20% 100%;animation:bnCome 1.6s ease-in-out infinite}@keyframes bnCome{0%,40%,100%{transform:none}10%,30%{transform:rotate(-6deg)}20%{transform:rotate(-2deg)}}' +
    '.b-humo{animation:bnHumo 4s ease-out infinite}@keyframes bnHumo{from{transform:translate(0,4px);opacity:.2}50%{opacity:1}to{transform:translate(-6px,-14px);opacity:0}}' +
    '.b-mari{animation:bnMari 7s ease-in-out infinite alternate}@keyframes bnMari{50%{transform:translate(calc(var(--mx) / 2),-10px)}to{transform:translate(var(--mx),4px)}}' +
    '.b-ala{transform-box:fill-box;transform-origin:center;animation:bnAla .25s ease-in-out infinite alternate}@keyframes bnAla{to{transform:scaleX(.25)}}' +
    '@media(prefers-reduced-motion:reduce){.b-halo,.b-salta,.b-humo,.b-mari,.b-ala,.b-oreja,.b-nariz,.b-quieto,.b-come{animation:none}}' +
    '.b-bn.b-t-carnaval{padding:30px 20px 20px 52px}.b-t-carnaval .b-bn-vero{right:min(11%,96px);z-index:2}' +
    '.b-te-bam,.b-te-esc,.b-te-tel,.b-te-mas,.b-te-focos{position:absolute;pointer-events:none}.b-te-bam svg,.b-te-esc svg,.b-te-tel svg,.b-te-focos svg{display:block;width:100%;height:100%}' +
    '.b-te-bam{left:0;right:0;top:0;height:22px;z-index:1}.b-te-mas{left:50%;top:1px;width:44px;margin-left:-22px;z-index:2;filter:drop-shadow(0 1px 3px #000a)}' +
    '.b-te-tel{top:0;bottom:0;z-index:1}.b-te-i{left:0;width:min(4.5%,40px)}.b-te-d{right:0;width:min(9%,74px)}' +
    '.b-te-esc{left:0;right:0;bottom:0;height:16px;z-index:-1}.b-te-focos{inset:0;z-index:-1;mix-blend-mode:screen}' +
    '.b-cand{animation:bnTw2 2.2s ease-in-out infinite;filter:blur(.6px)}' +
    '.b-foco{transform-origin:256px 0;transform-box:view-box;animation:bnFoco 6s ease-in-out infinite alternate}.b-foco2{transform-origin:386px 0;animation-delay:-3s}@keyframes bnFoco{to{transform:rotate(-7deg)}}' +
    '@media(prefers-reduced-motion:reduce){.b-foco,.b-cand{animation:none}}' +
    '.b-bn-esc.b-esc-reyes{width:min(70%,640px)}.b-bn.b-hasvero .b-bn-esc.b-esc-reyes{right:min(14%,150px)}.b-t-reyes .b-bn-b{height:38%}' +
    '.b-cam{animation:bnCam 1.4s ease-in-out infinite alternate}@keyframes bnCam{to{transform:translateY(-1.2px)}}' +
    '.b-st2{transform-origin:96px 26px;transform-box:view-box;animation:bnSt 3.4s ease-in-out infinite}' +
    '@media(prefers-reduced-motion:reduce){.b-st2{animation:none}}' +
    '.b-papa{position:absolute;top:24%;left:105%;z-index:-1;width:min(19%,170px);pointer-events:none;filter:drop-shadow(0 0 6px #b9c9ff33);animation:bnPapa 16s linear 2s infinite}.b-papa svg{display:block;width:100%;animation:bnVuelo 1.6s ease-in-out infinite alternate}' +
    '@keyframes bnPapa{0%{left:102%;top:34%;opacity:0}6%{opacity:1}50%{top:20%}80%{opacity:1}100%{left:42%;top:28%;opacity:0}}@keyframes bnVuelo{to{transform:translateY(-3px) rotate(-2deg)}}' +
    '.b-rud{filter:drop-shadow(0 0 2px #ff4d5e);animation:bnRud 1.1s ease-in-out infinite alternate}@keyframes bnRud{to{opacity:.4}}' +
    '@media(prefers-reduced-motion:reduce){.b-papa{display:none}}' +
    '.b-bn-esc{position:absolute;right:0;bottom:0;z-index:-1;height:100%;width:min(64%,560px);pointer-events:none}.b-bn-esc svg{display:block;width:100%;height:100%}' +
    '.b-bn.b-hasvero .b-bn-esc{right:min(12%,120px)}' +
    '.b-tw{animation:bnTw2 2.4s ease-in-out infinite}@keyframes bnTw2{50%{opacity:.35}}' +
    '.b-st{transform-origin:180px 17px;animation:bnSt 3s ease-in-out infinite}@keyframes bnSt{50%{transform:scale(1.12);filter:drop-shadow(0 0 6px #ffe27a)}}' +
    '@media(prefers-reduced-motion:reduce){.b-tw,.b-st{animation:none}}' +
    '@keyframes bnPulse{50%{transform:translateY(-50%) scale(1.06);filter:drop-shadow(0 0 14px var(--acc))}}' +
    '.b-bn-tx{display:flex;flex-direction:column;gap:3px;min-width:0;max-width:min(640px,68%);text-shadow:0 2px 12px #000c}' +
    '.b-bn-k{font:650 11px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}' +
    '.b-bn-t{font:400 clamp(21px,2.1vw,30px)/1.15 "Iowan Old Style",Georgia,serif;color:#fff}' +
    '.b-bn-s{font-size:13.5px;line-height:1.4;color:#c9d2f2}' +
    '.b-bn-go{flex:none;align-self:flex-start;margin-top:7px;padding:7px 14px;border:0;border-radius:999px;background:var(--acc);color:#141833;font:650 13px/1 system-ui,sans-serif;cursor:pointer;transition:transform .18s ease,filter .18s ease}.b-bn-go:hover,.b-bn-go:focus-visible{transform:translateY(-1px);filter:brightness(1.1);outline:none}' +
    '.b-bn.b-hasvero .b-bn-x{display:none}.b-bn-vero.b-ancha{top:auto;bottom:4px;height:96%;object-position:bottom}.b-bn-vero{position:absolute;right:3%;top:10px;z-index:-1;height:175%;max-width:40%;object-fit:contain;object-position:top;filter:drop-shadow(0 6px 18px #000a);pointer-events:none}.b-bn.b-hasvero .b-bn-d{right:30%}' +
    '@media(prefers-reduced-motion:reduce){.b-bn-star{animation:none}}' +
    '@media(max-width:700px){.b-bn{min-height:112px;padding:14px 14px 12px;flex-direction:column;align-items:flex-start;gap:8px}.b-bn-tx{max-width:74%}.b-bn-t{font-size:20px}.b-bn-s{font-size:12.5px}.b-bn-d{width:30%;right:2%}}'

  /* crea el banner. o: { items, lang, imgs (clave -> url), head(it), when(it), chip(it), go(id) } */
  function banner(o) {
    if (!document.getElementById('vc-bn-css')) { var st = document.createElement('style'); st.id = 'vc-bn-css'; st.textContent = CSS; document.head.append(st) }
    var now = Date.now(), sel = api.forzar ? { k: api.forzar, pascua: pascua(new Date().getFullYear()) } : elegir(o.items, now, o.lang), l = TXT[o.lang] ? o.lang : 'es', X = TXT[l], k = sel.k
    var sc = SCN[k] || SCN.evento, L = window.vcLluvias
    var acc = sc.acc || '#f8d874'
    if (k === 'lluvia') { var stl = L && L.style ? L.style(sel.it.lluvia) : null; if (stl) acc = stl.color }
    var el = document.createElement('div'); el.className = 'b-bn b-t-' + k; el.setAttribute('data-no-i18n', '')
    el.style.setProperty('--acc', acc); el.style.setProperty('--bg', sc.bg)
    /* textos */
    var kick, tit, sub = '', it = sel.it
    if (k === 'lluvia' || k === 'evento') {
      var nm = ''
      if (k === 'lluvia') { var r = L && L.LISTA ? L.LISTA.filter(function (x) { return x.id === it.lluvia })[0] : null; nm = r ? (r.nom[l] || r.nom.es) : o.tx(it.t) }
      kick = k === 'lluvia' ? X.lluvia.replace('{n}', nm) : X.evento
      tit = o.tx(it.t); var ch = o.chip(it); sub = (ch ? ch + ' · ' : '') + o.when(it)
    } else {
      var A = X[k] || TXT.fr[k] || TXT.es[k]; kick = A[0]; tit = A[1]; sub = A[2]
      if (k === 'semana-santa') sub = sub.replace('{d}', new Intl.DateTimeFormat(LOC[l], { weekday: 'long', day: 'numeric', month: 'long' }).format(sel.pascua))
      /* fiestas y estaciones: debajo, el proximo evento si lo hay en las proximas semanas */
      var nx = (o.items || []).filter(function (i) { return i.tipo === 'evento' && i.inicio && Date.parse(i.fin || i.inicio) > now && Date.parse(i.inicio) - now < 7 * DAY }).sort(function (a, b) { return Date.parse(a.inicio) - Date.parse(b.inicio) })[0]
      if (nx) { it = nx; sub = X.next.replace('{t}', o.tx(nx.t)).replace('{c}', o.chip(nx) || '') }
    }
    var img = (it && it.banner) || (o.imgs && (o.imgs[k === 'lluvia' ? sel.it.lluvia : k]))
    if (img) {
      var im = document.createElement('img'); im.className = 'b-bn-img'; im.alt = ''; im.src = img; im.decoding = 'async'; el.append(im); el.classList.add('b-hasimg')
      /* lluvia con ilustracion: la constelacion se dibuja encima de la figura */
      var stI = k === 'lluvia' && L && L.style ? L.style(sel.it.lluvia) : null
      if (stI) {
        el.classList.add('b-ilus')
        var ov = document.createElement('span'); ov.className = 'b-bn-ov'; ov.setAttribute('aria-hidden', 'true'); ov.innerHTML = stI.svg; el.append(ov)
        var fg = FIG[sel.it.lluvia] || FIG._
        var colocar = function () {
          if (!im.naturalWidth || !el.isConnected) return
          var H = el.clientHeight, W = el.clientWidth, iw = Math.min(W, H * im.naturalWidth / im.naturalHeight), ih = iw * im.naturalHeight / im.naturalWidth, x0 = W - iw, y0 = (H - ih) / 2
          ov.style.left = (x0 + fg[0] * iw) + 'px'; ov.style.top = (y0 + fg[1] * ih) + 'px'; ov.style.width = (fg[2] * iw) + 'px'; ov.style.height = (fg[3] * ih) + 'px'
        }
        im.addEventListener('load', colocar); requestAnimationFrame(colocar)
        if (window.ResizeObserver) new ResizeObserver(colocar).observe(el)
      }
    }
    else {
      var cv = document.createElement('canvas'); cv.className = 'b-bn-cv'; cv.setAttribute('aria-hidden', 'true'); el.append(cv)
      var dc = deco(sel, l)
      if (dc && dc.r) {
        var d = document.createElement('span'); d.className = 'b-bn-d ' + (dc.cls || ''); d.innerHTML = dc.r; el.append(d)
      }
      if (dc) {
        if (dc.teatro) {
          var add = function (cls, html) { var e = document.createElement('span'); e.className = cls; e.innerHTML = html; el.append(e) }
          add('b-te-focos', FOCOS); add('b-te-esc', ESCENARIO); add('b-te-tel b-te-i', telon(0)); add('b-te-tel b-te-d', telon(1)); add('b-te-bam', BAMBALINA); add('b-te-mas', MASCARAS)
        }
        if (dc.fondo) { var fo = document.createElement('span'); fo.className = 'b-bn-fondo'; fo.innerHTML = dc.fondo; el.insertBefore(fo, el.firstChild.nextSibling) }
        if (dc.mapa) { el.append(mapaHispano()); var pc = palabras(); el.append(pc); colocarPalabras(el, pc) }
        if (dc.papa) { var pn = document.createElement('span'); pn.className = 'b-papa'; pn.innerHTML = dc.papa; el.append(pn) }
        if (dc.top) { var tp = document.createElement('span'); tp.className = 'b-bn-top'; tp.innerHTML = dc.top; el.append(tp) }
        if (dc.esc) { var es = document.createElement('span'); es.className = 'b-bn-esc ' + (dc.ecls || ''); es.innerHTML = dc.esc; el.append(es) }
        if (dc.bottom) { var b = document.createElement('span'); b.className = 'b-bn-b ' + (dc.bcls || ''); b.innerHTML = dc.bottom; el.append(b) }
        if (dc.extra) { var x = document.createElement('span'); x.className = 'b-bn-x ' + (dc.xcls || ''); x.innerHTML = dc.extra; el.append(x) }
      }
      /* las fugaces salen del radiante de la constelacion dibujada */
      requestAnimationFrame(function () {
        var rr = dc && dc.rad ? dc.rad : null
        if (dc && dc.rx != null && el.querySelector('.b-bn-d')) { var db = el.querySelector('.b-bn-d').getBoundingClientRect(), eb = el.getBoundingClientRect(); if (eb.width) rr = [(db.left - eb.left + db.width * dc.rx / 100) / eb.width, (db.top - eb.top + db.height * dc.ry / 100) / eb.height] }
        animar(cv, k === 'semana-santa' && l !== 'es' ? ['estrellas', 'petalos'] : sc.fx, acc, rr, sc.pal, sc.cada)
      })
    }
    /* Vero de temporada (imagen con fondo transparente en el vault: temporadas/<clave>-vero.png) */
    /* Vero de temporada; si hay una para el idioma de la pagina (<clave>-vero-es.png...), esa */
    var vb = (k === 'lluvia' ? sel.it.lluvia : k) + '-vero', vk = o.imgs && (o.imgs[vb + '-' + l] || o.imgs[vb])
    if (vk) { var vv = document.createElement('img'); vv.className = 'b-bn-vero'; vv.alt = ''; vv.src = vk; vv.decoding = 'async'; el.append(vv); el.classList.add('b-hasvero')
      /* Vero de cintura para arriba; entera solo donde la escena lo pide (en camello, en Reyes) */
      if (ENTERA.indexOf(k) >= 0) vv.classList.add('b-ancha'); else if (ALTO[k]) vv.style.height = ALTO[k] + '%' }
    var tx = document.createElement('div'); tx.className = 'b-bn-tx'
    tx.innerHTML = '<span class="b-bn-k"></span><b class="b-bn-t"></b>' + (sub ? '<span class="b-bn-s"></span>' : '')
    tx.querySelector('.b-bn-k').textContent = frT(l, kick); tx.querySelector('.b-bn-t').textContent = frT(l, tit); if (sub) tx.querySelector('.b-bn-s').textContent = frT(l, sub)
    el.append(tx)
    if (it && o.go) { var g = document.createElement('button'); g.type = 'button'; g.className = 'b-bn-go'; g.textContent = X.go + ' →'; g.onclick = function () { o.go(it.id) }; tx.append(g) }
    el.dataset.temporada = k
    /* la escena dibujada nunca pisa el texto: ocupa como mucho el hueco libre entre el final del texto y su borde derecho */
    var esc = el.querySelector('.b-bn-esc')
    if (esc) {
      var ajustar = function () {
        if (!el.isConnected) return
        esc.style.width = ''
        var er = el.getBoundingClientRect(), tr = tx.getBoundingClientRect(), ancho = esc.getBoundingClientRect().width
        if (!er.width) return
        var der = parseFloat(getComputedStyle(esc).right) || 0, libre = er.right - der - tr.right - 14
        if (libre < ancho) esc.style.width = Math.max(0, libre) + 'px'
      }
      requestAnimationFrame(ajustar)
      try { document.fonts.ready.then(ajustar) } catch (e) { }
      if (window.ResizeObserver) new ResizeObserver(ajustar).observe(el)
    }
    return el
  }
  /* api.forzar = 'navidad' (por ejemplo) para ver una temporada concreta al probar */
  var api = { elegir: elegir, pascua: pascua, estacion: estacion, fiestas: fiestas, banner: banner, TXT: TXT, forzar: null }
  window.vcTemporadas = api
})()
