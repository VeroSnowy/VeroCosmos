/* "Mi Lugar": el visitante escribe coordenadas o una direccion (y elige el dia) y recibe un informe de esa noche:
   - en el centro, un mapa topografico circular que se puede arrastrar, con alturas reales (Open-Meteo, zona de 20 x 20 km)
     y las luces cercanas vistas por satelite (NASA Black Marble);
   - alrededor, lo visto en cada seccion: contaminacion luminica (luces nocturnas de la NASA con un nucleo de distancia
     d^-2.5 como la ley de Walker, calibrado con lugares conocidos), entorno (altitud, aire por encima, horizonte despejado),
     meteorologia de esa noche (Open-Meteo), eleccion del lugar (pendiente, orientacion, camino mas cercano de OpenStreetMap),
     Luna y Sol (calculo propio) y una preparacion adaptada;
   - debajo, lo mas destacado del cielo esa noche (planetas, cielo profundo y constelaciones), con enlace a su entrada del atlas.
   window.vcMiLugar.mount(host) -> { destroy() } */
(function () {
  'use strict'
  var T = function (k) { return window.vcI18n ? vcI18n.t(k) : k }
  var LANG = function () { return window.vcI18n ? vcI18n.lang : 'es' }
  var LI = function () { return { es: 0, en: 1, fr: 2 }[LANG()] || 0 }
  var SERIF = '"Iowan Old Style",Georgia,serif'
  var Y = '#f8d874', L2 = '#8ab4ff', M = '#5b6bb4'
  var RAD = Math.PI / 180
  var clamp = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)) }
  var lerp = function (a, b, t) { return a + (b - a) * t }
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') }
  var num = function (v, d) { var s = v.toFixed(d == null ? 0 : d); return LANG() === 'en' ? s : s.replace('.', ',') }
  var pad = function (x) { return String(x).padStart(2, '0') }
  var DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'], DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  var dirName = function (az) { var i = Math.round(((az % 360) + 360) % 360 / 45) % 8; return (LANG() === 'es' ? DIRS : DIRS_EN)[i] }

  /* ---------- astronomia ---------- */
  var jd = function (ms) { return ms / 86400000 + 2440587.5 }, Tc = function (t) { return (jd(t) - 2451545) / 36525 }
  var OBL = function (t) { return (23.439291 - .0130042 * Tc(t)) * RAD }
  function eclToEq(lon, lat, t) { var e = OBL(t), l = lon * RAD, b = lat * RAD, x = Math.cos(b) * Math.cos(l), y = Math.cos(b) * Math.sin(l) * Math.cos(e) - Math.sin(b) * Math.sin(e), z = Math.cos(b) * Math.sin(l) * Math.sin(e) + Math.sin(b) * Math.cos(e); return { ra: ((Math.atan2(y, x) / RAD) + 360) % 360, dec: Math.asin(z) / RAD } }
  function sunLon(t) { var n = jd(t) - 2451545, L0 = 280.460 + .9856474 * n, g = (357.528 + .9856003 * n) * RAD; return ((L0 + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)) % 360 + 360) % 360 }
  function moonPos(t) {
    var T0 = Tc(t), d = function (x) { return x * RAD }, Lp = 218.3164477 + 481267.88123421 * T0, D = 297.8501921 + 445267.1114034 * T0, Mm = 357.5291092 + 35999.0502909 * T0, Mp = 134.9633964 + 477198.8675055 * T0, F = 93.272095 + 483202.0175233 * T0
    var lon = ((Lp + 6.289 * Math.sin(d(Mp)) + 1.274 * Math.sin(d(2 * D - Mp)) + .658 * Math.sin(d(2 * D)) + .214 * Math.sin(d(2 * Mp)) - .186 * Math.sin(d(Mm)) - .114 * Math.sin(d(2 * F))) % 360 + 360) % 360
    var lat = 5.128 * Math.sin(d(F)) + .281 * Math.sin(d(Mp + F)) + .278 * Math.sin(d(Mp - F)) + .173 * Math.sin(d(2 * D - F))
    var q = eclToEq(lon, lat, t); q.lon = lon; return q
  }
  function lst(t, lon) { return ((280.46061837 + 360.98564736629 * (jd(t) - 2451545) + lon) % 360 + 360) % 360 }
  function altAz(ra, dec, t, lat, lon) {
    var ha = (lst(t, lon) - ra) * RAD, la = lat * RAD, de = dec * RAD
    var alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(ha))
    var az = Math.atan2(-Math.sin(ha) * Math.cos(de), Math.cos(la) * Math.sin(de) - Math.sin(la) * Math.cos(de) * Math.cos(ha))
    return { alt: alt / RAD, az: ((az / RAD) + 360) % 360 }
  }
  function sunAlt(t, lat, lon) { var q = eclToEq(sunLon(t), 0, t); return altAz(q.ra, q.dec, t, lat, lon).alt }
  function moonAlt(t, lat, lon) { var q = moonPos(t); return altAz(q.ra, q.dec, t, lat, lon).alt }
  var elong = function (t) { return (((moonPos(t).lon - sunLon(t)) % 360) + 360) % 360 }
  var illum = function (t) { return (1 - Math.cos(elong(t) * RAD)) / 2 }
  var PHASES = ['Luna nueva', 'Luna creciente', 'Cuarto creciente', 'Gibosa creciente', 'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Luna menguante']
  function phaseName(t) { var el = elong(t), f = illum(t), wax = el < 180; return PHASES[f < .05 ? 0 : f > .95 ? 4 : f < .45 ? (wax ? 1 : 7) : f <= .55 ? (wax ? 2 : 6) : (wax ? 3 : 5)] }
  /* planetas: elementos orbitales aproximados (JPL, validos 1800-2050) */
  var ELS = {
    mercurio: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
    venus: [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    tierra: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
    marte: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
    jupiter: [5.20288700, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
    saturno: [9.53667594, -0.00125060, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794]
  }
  function helio(k, t) {
    var e0 = ELS[k], T0 = Tc(t), a = e0[0] + e0[1] * T0, e = e0[2] + e0[3] * T0, I = (e0[4] + e0[5] * T0) * RAD, Lm = e0[6] + e0[7] * T0, wb = e0[8] + e0[9] * T0, Om = (e0[10] + e0[11] * T0) * RAD
    var Mn = ((Lm - wb) % 360) * RAD, w = (wb * RAD) - Om, E = Mn
    for (var i = 0; i < 8; i++) E = E - (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E))
    var xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E)
    return [(Math.cos(w) * Math.cos(Om) - Math.sin(w) * Math.sin(Om) * Math.cos(I)) * xp + (-Math.sin(w) * Math.cos(Om) - Math.cos(w) * Math.sin(Om) * Math.cos(I)) * yp,
      (Math.cos(w) * Math.sin(Om) + Math.sin(w) * Math.cos(Om) * Math.cos(I)) * xp + (-Math.sin(w) * Math.sin(Om) + Math.cos(w) * Math.cos(Om) * Math.cos(I)) * yp,
      (Math.sin(w) * Math.sin(I)) * xp + (Math.cos(w) * Math.sin(I)) * yp]
  }
  function planetEq(k, t) {
    var p = helio(k, t), e = helio('tierra', t), x = p[0] - e[0], y = p[1] - e[1], z = p[2] - e[2], ob = OBL(t)
    var ye = y * Math.cos(ob) - z * Math.sin(ob), ze = y * Math.sin(ob) + z * Math.cos(ob)
    return { ra: ((Math.atan2(ye, x) / RAD) + 360) % 360, dec: Math.atan2(ze, Math.hypot(x, ye)) / RAD }
  }
  /* cuando el Sol cruza una altura dada (cada 5 min, con interpolacion) */
  function sunCross(lat, lon, from, to, h, down) {
    var step = 5 * 60000, prev = sunAlt(from, lat, lon) - h
    for (var t = from + step; t <= to; t += step) { var v = sunAlt(t, lat, lon) - h; if (down ? (prev >= 0 && v < 0) : (prev < 0 && v >= 0)) return t - step * v / (v - prev); prev = v }
    return null
  }
  /* la noche del dia elegido: de su tarde a la manana siguiente */
  function nightOf(lat, lon, noon) {
    var end = noon + 26 * 3600000, n = { sunset: sunCross(lat, lon, noon, end, -.833, true), naut: sunCross(lat, lon, noon, end, -12, true), civil: sunCross(lat, lon, noon, end, -6, true), dusk: sunCross(lat, lon, noon, end, -18, true) }
    n.dawn = n.dusk ? sunCross(lat, lon, n.dusk, end, -18, false) : null
    n.sunrise = sunCross(lat, lon, (n.sunset || noon) + 3600000, end, -.833, false)
    n.astro = !!(n.dusk && n.dawn)
    if (!n.astro) { n.dusk = n.naut || n.civil || noon + 10 * 3600000; n.dawn = n.dusk + 6 * 3600000 }
    return n
  }
  function moonInfo(lat, lon, n) {
    var step = 10 * 60000, dark = 0, up = 0, rise = null, set = null, prev = null
    for (var t = n.dusk; t <= n.dawn; t += step) {
      var h = moonAlt(t, lat, lon) - .125; if (h > 0) up += step; else dark += step
      if (prev !== null) { if (prev < 0 && h >= 0 && rise === null) rise = t; if (prev >= 0 && h < 0 && set === null) set = t }
      prev = h
    }
    var mid = (n.dusk + n.dawn) / 2
    return { phase: phaseName(mid), illum: illum(mid), age: elong(mid) / 360 * 29.53, up: up, dark: dark, rise: rise, set: set }
  }

  /* ---------- objetos destacados (J2000: AR en horas, Dec en grados) ---------- */
  /* [clave del atlas, nombre es, en, fr, tipo, AR, Dec, magnitud] */
  var DSO = [
    ['m_31', 'M31 · Galaxia de Andrómeda', 'M31 · Andromeda Galaxy', 'M31 · Galaxie d\'Andromède', 'g', 0.712, 41.27, 3.4], ['m_33', 'M33 · Galaxia del Triángulo', 'M33 · Triangulum Galaxy', 'M33 · Galaxie du Triangle', 'g', 1.564, 30.66, 5.7],
    ['m_42', 'M42 · Nebulosa de Orión', 'M42 · Orion Nebula', 'M42 · Nébuleuse d\'Orion', 'n', 5.588, -5.39, 4.0], ['m_45', 'M45 · Pléyades', 'M45 · Pleiades', 'M45 · Pléiades', 'a', 3.790, 24.12, 1.6],
    ['m_1', 'M1 · Nebulosa del Cangrejo', 'M1 · Crab Nebula', 'M1 · Nébuleuse du Crabe', 's', 5.575, 22.01, 8.4], ['m_2', 'M2 · Cúmulo globular', 'M2 · Globular cluster', 'M2 · Amas globulaire', 'c', 21.558, -0.82, 6.5],
    ['m_3', 'M3 · Cúmulo globular', 'M3 · Globular cluster', 'M3 · Amas globulaire', 'c', 13.703, 28.38, 6.2], ['m_5', 'M5 · Cúmulo globular', 'M5 · Globular cluster', 'M5 · Amas globulaire', 'c', 15.309, 2.08, 5.6],
    ['m_6', 'M6 · Cúmulo de la Mariposa', 'M6 · Butterfly Cluster', 'M6 · Amas du Papillon', 'a', 17.668, -32.25, 4.2], ['m_7', 'M7 · Cúmulo de Ptolomeo', 'M7 · Ptolemy Cluster', 'M7 · Amas de Ptolémée', 'a', 17.898, -34.79, 3.3],
    ['m_8', 'M8 · Nebulosa de la Laguna', 'M8 · Lagoon Nebula', 'M8 · Nébuleuse de la Lagune', 'n', 18.063, -24.38, 6.0], ['m_11', 'M11 · Cúmulo del Pato Salvaje', 'M11 · Wild Duck Cluster', 'M11 · Amas du Canard sauvage', 'a', 18.851, -6.27, 5.8],
    ['m_13', 'M13 · Gran Cúmulo de Hércules', 'M13 · Great Hercules Cluster', 'M13 · Grand amas d\'Hercule', 'c', 16.695, 36.46, 5.8], ['m_15', 'M15 · Cúmulo globular', 'M15 · Globular cluster', 'M15 · Amas globulaire', 'c', 21.500, 12.17, 6.2],
    ['m_16', 'M16 · Nebulosa del Águila', 'M16 · Eagle Nebula', 'M16 · Nébuleuse de l\'Aigle', 'n', 18.313, -13.79, 6.0], ['m_17', 'M17 · Nebulosa Omega', 'M17 · Omega Nebula', 'M17 · Nébuleuse Oméga', 'n', 18.346, -16.18, 6.0],
    ['m_20', 'M20 · Nebulosa Trífida', 'M20 · Trifid Nebula', 'M20 · Nébuleuse Trifide', 'n', 18.043, -23.03, 6.3], ['m_22', 'M22 · Cúmulo globular', 'M22 · Globular cluster', 'M22 · Amas globulaire', 'c', 18.607, -23.90, 5.1],
    ['m_27', 'M27 · Nebulosa Dumbbell', 'M27 · Dumbbell Nebula', 'M27 · Nébuleuse de l\'Haltère', 'p', 19.993, 22.72, 7.4], ['m_35', 'M35 · Cúmulo abierto', 'M35 · Open cluster', 'M35 · Amas ouvert', 'a', 6.148, 24.33, 5.3],
    ['m_37', 'M37 · Cúmulo abierto', 'M37 · Open cluster', 'M37 · Amas ouvert', 'a', 5.873, 32.55, 5.6], ['m_44', 'M44 · Cúmulo del Pesebre', 'M44 · Beehive Cluster', 'M44 · Amas de la Ruche', 'a', 8.670, 19.67, 3.7],
    ['m_51', 'M51 · Galaxia del Remolino', 'M51 · Whirlpool Galaxy', 'M51 · Galaxie du Tourbillon', 'g', 13.498, 47.20, 8.4], ['m_57', 'M57 · Nebulosa del Anillo', 'M57 · Ring Nebula', 'M57 · Nébuleuse de l\'Anneau', 'p', 18.893, 33.03, 8.8],
    ['m_81', 'M81 · Galaxia de Bode', 'M81 · Bode\'s Galaxy', 'M81 · Galaxie de Bode', 'g', 9.926, 69.07, 6.9], ['m_82', 'M82 · Galaxia del Cigarro', 'M82 · Cigar Galaxy', 'M82 · Galaxie du Cigare', 'g', 9.931, 69.68, 8.4],
    ['m_83', 'M83 · Molinete Austral', 'M83 · Southern Pinwheel', 'M83 · Moulinet austral', 'g', 13.617, -29.87, 7.5], ['m_92', 'M92 · Cúmulo globular', 'M92 · Globular cluster', 'M92 · Amas globulaire', 'c', 17.285, 43.14, 6.4],
    ['m_101', 'M101 · Galaxia del Molinete', 'M101 · Pinwheel Galaxy', 'M101 · Galaxie du Moulinet', 'g', 14.053, 54.35, 7.9], ['m_104', 'M104 · Galaxia del Sombrero', 'M104 · Sombrero Galaxy', 'M104 · Galaxie du Sombrero', 'g', 12.666, -11.62, 8.0],
    ['ngc_869', 'NGC 869/884 · Doble Cúmulo de Perseo', 'NGC 869/884 · Double Cluster', 'NGC 869/884 · Double amas de Persée', 'a', 2.333, 57.13, 4.3], ['ngc_7000', 'NGC 7000 · Nebulosa Norteamérica', 'NGC 7000 · North America Nebula', 'NGC 7000 · Nébuleuse de l\'Amérique du Nord', 'n', 20.980, 44.33, 4.0],
    ['ngc_253', 'NGC 253 · Galaxia Moneda de Plata', 'NGC 253 · Silver Coin Galaxy', 'NGC 253 · Galaxie du Sculpteur', 'g', 0.793, -25.29, 7.1], ['ngc_2024', 'NGC 2024 · Nebulosa de la Flama', 'NGC 2024 · Flame Nebula', 'NGC 2024 · Nébuleuse de la Flamme', 'n', 5.698, -1.85, 10],
    ['ngc_5139', 'Omega Centauri', 'Omega Centauri', 'Oméga du Centaure', 'c', 13.447, -47.48, 3.9], ['ngc_104', '47 Tucanae', '47 Tucanae', '47 Toucan', 'c', 0.401, -72.08, 4.1],
    ['ngc_3372', 'Nebulosa de Carina', 'Carina Nebula', 'Nébuleuse de la Carène', 'n', 10.752, -59.87, 1.0], ['lmc', 'Gran Nube de Magallanes', 'Large Magellanic Cloud', 'Grand Nuage de Magellan', 'g', 5.392, -69.76, 0.9],
    ['smc', 'Pequeña Nube de Magallanes', 'Small Magellanic Cloud', 'Petit Nuage de Magellan', 'g', 0.877, -72.83, 2.7], ['albireo', 'Albireo · Estrella doble', 'Albireo · Double star', 'Albireo · Étoile double', 'd', 19.512, 27.96, 3.1]
  ]
  var TYPES = { g: ['Galaxia', 'Galaxy', 'Galaxie'], n: ['Nebulosa', 'Nebula', 'Nébuleuse'], a: ['Cúmulo abierto', 'Open cluster', 'Amas ouvert'], c: ['Cúmulo globular', 'Globular cluster', 'Amas globulaire'], p: ['Nebulosa planetaria', 'Planetary nebula', 'Nébuleuse planétaire'], s: ['Resto de supernova', 'Supernova remnant', 'Rémanent de supernova'], d: ['Estrella doble', 'Double star', 'Étoile double'], pl: ['Planeta', 'Planet', 'Planète'], mo: ['Satélite', 'Moon', 'Satellite'] }
  var PLANETS = [['mercurio', 'Mercurio', 'Mercury', 'Mercure', 0], ['venus', 'Venus', 'Venus', 'Vénus', -4.2], ['marte', 'Marte', 'Mars', 'Mars', .6], ['jupiter', 'Júpiter', 'Jupiter', 'Jupiter', -2.3], ['saturno', 'Saturno', 'Saturn', 'Saturne', .7]]
  var CONS = [['Orión', 'Orion', 'Orion', 5.6, 5], ['Tauro', 'Taurus', 'Taureau', 4.7, 15], ['Géminis', 'Gemini', 'Gémeaux', 7, 22], ['Can Mayor', 'Canis Major', 'Grand Chien', 6.8, -22], ['Leo', 'Leo', 'Lion', 10.7, 15], ['Osa Mayor', 'Ursa Major', 'Grande Ourse', 11.3, 51], ['Boyero', 'Boötes', 'Bouvier', 14.7, 31], ['Virgo', 'Virgo', 'Vierge', 13.4, -4], ['Escorpio', 'Scorpius', 'Scorpion', 16.9, -27], ['Sagitario', 'Sagittarius', 'Sagittaire', 19.1, -28], ['Cisne', 'Cygnus', 'Cygne', 20.6, 42], ['Lira', 'Lyra', 'Lyre', 18.9, 36], ['Águila', 'Aquila', 'Aigle', 19.7, 3], ['Hércules', 'Hercules', 'Hercule', 17.4, 27], ['Casiopea', 'Cassiopeia', 'Cassiopée', 1, 62], ['Andrómeda', 'Andromeda', 'Andromède', 0.8, 38], ['Pegaso', 'Pegasus', 'Pégase', 22.7, 20], ['Perseo', 'Perseus', 'Persée', 3.2, 45], ['Auriga', 'Auriga', 'Cocher', 6, 42], ['Cruz del Sur', 'Crux', 'Croix du Sud', 12.4, -60], ['Centauro', 'Centaurus', 'Centaure', 13.1, -47], ['Acuario', 'Aquarius', 'Verseau', 22.3, -11]]

  /* ---------- datos externos ---------- */
  function parseCoords(s) {
    var m = s.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/)
    if (!m) return null
    var la = parseFloat(m[1].replace(',', '.')), lo = parseFloat(m[2].replace(',', '.'))
    if (Math.abs(la) > 90 || Math.abs(lo) > 180) return null
    return { lat: la, lon: lo, name: null }
  }
  var jget = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json() }) }
  function geocode(q) {
    var c = parseCoords(q); if (c) return Promise.resolve(c)
    return jget('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=' + LANG() + '&q=' + encodeURIComponent(q)).then(function (j) { if (!j.length) throw new Error('nf'); return { lat: +j[0].lat, lon: +j[0].lon, name: j[0].display_name } })
  }
  function reverse(lat, lon) { return jget('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&accept-language=' + LANG() + '&lat=' + lat + '&lon=' + lon).then(function (j) { return j.display_name || null }).catch(function () { return null }) }
  /* rejilla de alturas de 21 x 21 puntos cada 1 km (20 x 20 km): el circulo muestra 10 km y se puede arrastrar */
  var GN = 21, GKM = 1.0, VIEW = 10
  function elevGrid(lat, lon) {
    var dLat = GKM / 111.2, dLon = GKM / (111.2 * Math.cos(lat * RAD)), lats = [], lons = [], c = (GN - 1) / 2
    for (var j = 0; j < GN; j++) for (var i = 0; i < GN; i++) { lats.push((lat + (c - j) * dLat).toFixed(5)); lons.push((lon + (i - c) * dLon).toFixed(5)) }
    var reqs = []
    var one = function (k, tries) { return jget('https://api.open-meteo.com/v1/elevation?latitude=' + lats.slice(k, k + 100).join(',') + '&longitude=' + lons.slice(k, k + 100).join(',')).catch(function (er) { if (tries <= 0) throw er; return new Promise(function (ok) { setTimeout(ok, 1500) }).then(function () { return one(k, tries - 1) }) }) }
    var chain = Promise.resolve(); for (var k = 0; k < lats.length; k += 100) (function (k2) { chain = chain.then(function () { return one(k2, 2).then(function (r) { reqs.push(r) }) }) })(k)
    return chain.then(function () { return reqs }).then(function (rs) { var e = []; rs.forEach(function (r) { e = e.concat(r.elevation) }); if (e.length !== GN * GN) throw new Error('elev'); var g = []; for (var j2 = 0; j2 < GN; j2++) g.push(e.slice(j2 * GN, j2 * GN + GN)); return g })
  }
  var WXV = 'temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_gusts_10m,wind_speed_250hPa,visibility,precipitation_probability,precipitation,soil_moisture_0_to_1cm,snow_depth,boundary_layer_height,temperature_850hPa,freezing_level_height,surface_pressure'
  /* pronostico del dia elegido (Open-Meteo llega a 16 dias); fuera de rango solo se pide la zona horaria */
  function weather(lat, lon, ymd0, ymd2, inRange) {
    if (!inRange) return jget('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=sunrise&forecast_days=1&timezone=auto').then(function (j) { return { tzOnly: true, timezone: j.timezone } })
    return jget('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&hourly=' + WXV + '&timezone=auto&timeformat=unixtime&start_date=' + ymd0 + '&end_date=' + ymd2)
  }
  function airq(lat, lon, ymd, ymd2) { return jget('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon + '&hourly=aerosol_optical_depth,dust,pm10,pm2_5&timezone=auto&timeformat=unixtime&start_date=' + ymd + '&end_date=' + ymd2) }
  /* caminos de OpenStreetMap (Overpass): servidor principal y uno de respaldo */
  var OVP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
  function ovp(q, k) {
    k = k || 0; if (k >= OVP.length) return Promise.reject(new Error('ovp'))
    var ac = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort() }, 25000)
    return fetch(OVP[k], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ac ? ac.signal : undefined })
      .then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json() })
      .catch(function () { clearTimeout(tm); return ovp(q, k + 1) })
  }
  function roads(lat, lon) { return ovp('[out:json][timeout:25];way(around:4000,' + lat + ',' + lon + ')[highway~"^(motorway|trunk|primary|secondary|tertiary|unclassified|track|path)$"];out geom 600 qt;').then(function (o) { return o.elements || [] }) }
  /* luces nocturnas de la NASA (VIIRS Black Marble) leidas pixel a pixel */
  var BM = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_Black_Marble/default/2016-01-01/500m/', TILES = {}
  function bmTile(Lv, r, c) {
    var k = Lv + '/' + r + '/' + c
    if (!TILES[k]) TILES[k] = fetch(BM + k + '.png').then(function (x) { return x.blob() }).then(function (b) { return createImageBitmap(b) }).then(function (bm) {
      var cv = document.createElement('canvas'); cv.width = bm.width; cv.height = bm.height; var g = cv.getContext('2d'); g.drawImage(bm, 0, 0); return g.getImageData(0, 0, bm.width, bm.height).data
    })
    return TILES[k]
  }
  function bmSampler(Lv, lat, lon, km) {
    var res = .5625 / Math.pow(2, Lv), dLat = km / 111.2, dLon = km / (111.2 * Math.cos(lat * RAD)), have = {}
    var r0 = Math.floor((90 - (lat + dLat)) / res / 512), r1 = Math.floor((90 - (lat - dLat)) / res / 512), c0 = Math.floor((lon - dLon + 180) / res / 512), c1 = Math.floor((lon + dLon + 180) / res / 512)
    var ps = []; for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) ps.push(bmTile(Lv, r, c).then((function (rr, cc) { return function (d) { have[rr + '/' + cc] = d } })(r, c)))
    return Promise.all(ps).then(function () {
      return { res: res, at: function (la, lo) { var gx = (lo + 180) / res, gy = (90 - la) / res, cc = Math.floor(gx / 512), rr = Math.floor(gy / 512), d = have[rr + '/' + cc]; if (!d) return 0; return d[((Math.floor(gy) - rr * 512) * 512 + (Math.floor(gx) - cc * 512)) * 4] } }
    })
  }
  /* brillo artificial del cielo: suma de luces con nucleo d^-2.5 (ley de Walker), calibrada con Calar Alto, Navacerrada y Madrid */
  function skyGlow(lat, lon) {
    return bmSampler(6, lat, lon, 70).then(function (s) {
      var n = Math.ceil(70 / 111.2 / s.res), kx = 111.2 * Math.cos(lat * RAD) * s.res, ky = 111.2 * s.res, sum = 0, sec = [0, 0, 0, 0, 0, 0, 0, 0]
      for (var j = -n; j <= n; j++) for (var i = -n; i <= n; i++) {
        var dx = i * kx, dy = -j * ky, d = Math.hypot(dx, dy); if (d > 70) continue
        var v = s.at(lat - j * s.res, lon + i * s.res); if (!v) continue
        var c = Math.pow(v / 255, 3) * Math.pow(Math.max(d, 1), -2.5) * kx * ky; sum += c
        if (d > 1.5) sec[Math.round(((Math.atan2(dx, dy) / RAD + 360) % 360) / 45) % 8] += c
      }
      var R = 10 * sum, sqm = Math.max(16, 21.9 - 2.5 * Math.log10(1 + R))
      var b = sqm > 21.75 ? 1 : sqm > 21.6 ? 2 : sqm > 21.3 ? 3 : sqm > 20.8 ? 4 : sqm > 20.3 ? 5 : sqm > 19.25 ? 6 : sqm > 18.5 ? 7 : sqm > 18 ? 8 : 9
      var nelm = 7.93 - 5 * Math.log10(Math.pow(10, 4.316 - sqm / 5) + 1), mx = 0, mi = 0; sec.forEach(function (v2, k) { if (v2 > mx) { mx = v2; mi = k } })
      return { sqm: sqm, bortle: b, nelm: nelm, dir: mx > sum * .2 && sum > .003 ? mi * 45 : null }
    })
  }
  function localLights(lat, lon) {
    return bmSampler(8, lat, lon, 11).then(function (s) {
      var out = [], n = Math.ceil(11 / 111.2 / s.res)
      for (var j = -n; j <= n; j++) for (var i = -n; i <= n; i++) { var la = lat - j * s.res, lo = lon + i * s.res, v = s.at(la, lo); if (v > 25) out.push([la, lo, v]) }
      return out
    })
  }
  var kmBetween = function (a1, o1, a2, o2) { var x = (o2 - o1) * Math.cos((a1 + a2) / 2 * RAD) * 111.2, y = (a2 - a1) * 111.2; return Math.hypot(x, y) }

  /* ---------- terreno ---------- */
  function bilinear(g, x, y) { x = clamp(x, 0, GN - 1.001); y = clamp(y, 0, GN - 1.001); var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j; return lerp(lerp(g[j][i], g[j][i + 1], fx), lerp(g[j + 1][i], g[j + 1][i + 1], fx), fy) }
  /* horizonte: para 24 direcciones, la mayor elevacion angular del relieve hasta 10 km (con la curvatura de la Tierra) */
  function horizon(g) {
    var c = (GN - 1) / 2, h0 = g[c][c] + 1.7, out = []
    for (var a = 0; a < 24; a++) {
      var az = a * 15 * RAD, mx = -2
      for (var dk = .25; dk <= 10; dk += .25) { var x = c + Math.sin(az) * dk / GKM, y = c - Math.cos(az) * dk / GKM, h = bilinear(g, x, y) - dk * dk * 1000 / (2 * 6371); mx = Math.max(mx, Math.atan2(h - h0, dk * 1000) / RAD) }
      out.push(mx)
    }
    return out
  }
  function slope(g) { var c = (GN - 1) / 2, dx = (g[c][c + 1] - g[c][c - 1]) / (2000 * GKM), dy = (g[c - 1][c] - g[c + 1][c]) / (2000 * GKM); return { pct: Math.hypot(dx, dy) * 100, aspect: (Math.atan2(-dx, -dy) / RAD + 360) % 360 } }
  var HWY = { motorway: 'Autovía', trunk: 'Autovía', primary: 'Carretera', secondary: 'Carretera', tertiary: 'Carretera', unclassified: 'Carretera local', track: 'Pista', path: 'Sendero' }
  function nearestWay(ways, lat, lon) { var best = null; ways.forEach(function (w) { (w.geometry || []).forEach(function (p) { var d = kmBetween(lat, lon, p.lat, p.lon); if (!best || d < best.d) best = { d: d, type: HWY[w.tags.highway] || 'Camino' } }) }); return best }
  function nightWeather(wx, n) {
    if (!wx || wx.tzOnly || !wx.hourly) return null
    var h = wx.hourly, idx = []
    for (var i = 0; i < h.time.length; i++) { var t = h.time[i] * 1000; if (t >= n.dusk - 1800000 && t <= n.dawn + 1800000) idx.push(i) }
    if (!idx.length) return null
    var avg = function (k) { var s = 0, c = 0; idx.forEach(function (i2) { var v = h[k] && h[k][i2]; if (v != null) { s += v; c++ } }); return c ? s / c : null }
    var mxOf = function (k) { var m = null; idx.forEach(function (i2) { var v = h[k] && h[k][i2]; if (v != null && (m === null || v > m)) m = v }); return m }
    var jet = avg('wind_speed_250hPa'), wind = avg('wind_speed_10m')
    return { cloud: avg('cloud_cover'), low: avg('cloud_cover_low'), mid: avg('cloud_cover_mid'), high: avg('cloud_cover_high'), rh: avg('relative_humidity_2m'), dew: avg('dew_point_2m'), temp: avg('temperature_2m'),
      minT: Math.min.apply(null, idx.map(function (i2) { return h.temperature_2m[i2] })), wind: wind, gust: mxOf('wind_gusts_10m'), vis: avg('visibility'), rain: mxOf('precipitation_probability'),
      rain24: (function () { var s = 0; for (var i3 = 0; i3 < h.time.length; i3++) { var t3 = h.time[i3] * 1000; if (t3 > n.dusk - 24 * 3600000 && t3 <= n.dusk && h.precipitation && h.precipitation[i3] != null) s += h.precipitation[i3] } return s })(),
      soil: avg('soil_moisture_0_to_1cm'), snow: mxOf('snow_depth'), blh: avg('boundary_layer_height'), t850: avg('temperature_850hPa'), frz: avg('freezing_level_height'), pres: avg('surface_pressure'),
      seeing: clamp(.7 + .011 * (jet == null ? 60 : jet) + .02 * (wind || 5), .8, 4), hours: idx.map(function (i2) { return { t: h.time[i2] * 1000, c: h.cloud_cover[i2] } }) }
  }
  function nightAir(aq, n) {
    if (!aq || !aq.hourly) return null
    var h = aq.hourly, idx = []; for (var i = 0; i < h.time.length; i++) { var t = h.time[i] * 1000; if (t >= n.dusk - 1800000 && t <= n.dawn + 1800000) idx.push(i) }
    if (!idx.length) return null
    var avg = function (k) { var s = 0, c = 0; idx.forEach(function (i2) { var v = h[k] && h[k][i2]; if (v != null) { s += v; c++ } }); return c ? s / c : null }
    return { aod: avg('aerosol_optical_depth'), dust: avg('dust'), pm10: avg('pm10'), pm25: avg('pm2_5') }
  }
  /* lo mas destacado de la noche: altura maxima en la noche cerrada y su hora */
  function highlights(lat, lon, n, nelm, moon) {
    var step = 20 * 60000, t0 = n.dusk, t1 = n.dawn, out = []
    var best = function (radec) { var bh = -90, bt = t0, baz = 0; for (var t = t0; t <= t1; t += step) { var r = radec(t), q = altAz(r.ra, r.dec, t, lat, lon); if (q.alt > bh) { bh = q.alt; bt = t; baz = q.az } } return { alt: bh, t: bt, az: baz } }
    PLANETS.forEach(function (p) { var b = best(function (t) { return planetEq(p[0], t) }); if (b.alt < 8) return; out.push({ key: p[0], name: p.slice(1, 4), type: 'pl', mag: p[4], alt: b.alt, t: b.t, az: b.az, score: 100 + b.alt - p[4] * 5 }) })
    var mb = best(function (t) { return moonPos(t) }); if (mb.alt > 5) out.push({ key: 'luna', name: ['Luna', 'Moon', 'Lune'], type: 'mo', mag: -10, alt: mb.alt, t: mb.t, az: mb.az, score: 90 })
    var limit = nelm + 4.5 /* con prismaticos o un telescopio pequeno */
    DSO.forEach(function (o) {
      if (o[7] > limit) return
      var b = best(function () { return { ra: o[5] * 15, dec: o[6] } }); if (b.alt < 22) return
      var faint = /g|n/.test(o[4]) && o[7] > 6
      out.push({ key: o[0], name: [o[1], o[2], o[3]], type: o[4], mag: o[7], alt: b.alt, t: b.t, az: b.az, faint: faint, score: b.alt * .6 - o[7] * 4 + (faint && moon.illum > .5 ? -12 : 0) })
    })
    out.sort(function (a, b) { return b.score - a.score })
    var cons = CONS.map(function (c) { var b = best(function () { return { ra: c[3] * 15, dec: c[4] } }); return { name: c.slice(0, 3), alt: b.alt } }).filter(function (c) { return c.alt > 35 }).sort(function (a, b) { return b.alt - a.alt }).slice(0, 8)
    return { objs: out.slice(0, 10), cons: cons }
  }

  /* ---------- estilos ---------- */
  var CSS = '.ml{position:absolute;inset:0;overflow:auto;color:#eef1ff;font-family:' + SERIF + ';-webkit-overflow-scrolling:touch;overscroll-behavior:contain}' +
    '.ml-top{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:min(600px,calc(100% - 28px));display:flex;flex-direction:column;align-items:center;gap:8px;transition:top .7s cubic-bezier(.7,0,.2,1),transform .7s cubic-bezier(.7,0,.2,1);z-index:3}' +
    '.ml.has-res .ml-top{top:10px;transform:translate(-50%,0)}' +
    '.ml-q{width:100%;box-sizing:border-box;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 18px;border:1px solid #5b6bb4;border-radius:999px;background:#0b1025e6;box-shadow:0 0 40px rgba(91,107,180,.25);transition:box-shadow .3s,border-color .3s}' +
    '.ml-q:focus-within{border-color:#8ab4ff;box-shadow:0 0 44px rgba(138,180,255,.35)}' +
    '.ml-q input{flex:1;min-width:0;background:none;border:0;outline:none;color:#f5f7ff;font:400 clamp(16px,2.2vw,22px)/1.3 ' + SERIF + ';padding:8px 0}' +
    '.ml-q input::placeholder{color:rgba(185,201,255,.42);font-style:italic}' +
    '.ml-q button{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid #343d63;background:#121a3c;color:#b9c9ff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .2s,color .2s}' +
    '.ml-q button:hover,.ml-q button:focus-visible{border-color:' + Y + ';color:' + Y + ';outline:none}.ml-q svg{width:20px;height:20px}' +
    '.ml-dt{display:flex;align-items:center;gap:8px;font-size:13px;color:#8f98c0}.ml-dt input{background:#0b1025;border:1px solid #343d63;border-radius:999px;color:#eef1ff;font:400 13px ' + SERIF + ';padding:5px 12px;color-scheme:dark;outline:none}.ml-dt input:focus{border-color:' + Y + '}' +
    '.ml-msg{font-size:13px;color:#8f98c0;text-align:center;min-height:16px}' +
    '.ml-res{position:absolute;left:0;right:0;top:150px;padding:0 16px 24px;opacity:0;transition:opacity .6s ease .35s;pointer-events:none}' +
    '.ml.has-res .ml-res{opacity:1;pointer-events:auto}' +
    '.ml-head{text-align:center;margin:0 auto 8px;max-width:900px}' +
    '.ml-name{font-size:14px;color:#cfd6f5;line-height:1.3}.ml-co{font-size:11.5px;color:#8f98c0;margin-top:2px}' +
    '.ml-ver{display:inline-flex;align-items:center;gap:8px;margin-top:6px;padding:4px 12px;border:1px solid #343d63;border-radius:999px;font-size:13px;color:#eef1ff;background:#0e1430}.ml-ver b{font-weight:400;color:' + Y + ';font-size:16px}' +
    '.ml-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,1.2fr) minmax(0,1fr);gap:12px;max-width:1240px;margin:0 auto;align-items:center;--ov:0px}' +
    '.ml-col{display:flex;flex-direction:column;gap:12px}' +
    '.ml-col.l{margin-right:calc(var(--ov) * -1);position:relative;z-index:1}.ml-col.r{margin-left:calc(var(--ov) * -1);position:relative;z-index:1}' +
    '.ml-mapw{position:relative;z-index:2;margin:12px}.ml-mapw::before{content:"";position:absolute;inset:-11px;border-radius:50%;border:1px solid #343d63;pointer-events:none}.ml-mapw::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px dashed rgba(248,216,116,.35);pointer-events:none}' +
    '.ml-map{position:relative;aspect-ratio:1/1;border:1px solid #5b6bb4;border-radius:50%;overflow:hidden;background:#070a19;box-shadow:0 0 40px rgba(91,107,180,.25)}' +
    '.ml-map canvas{width:100%;height:100%;display:block;cursor:grab;touch-action:none}.ml-map canvas.drag{cursor:grabbing}' +
    '.ml-card{border:1px solid #343d63;border-radius:12px;background:linear-gradient(180deg,#0f1634e6,#0a0f26e6);padding:11px 13px 12px}' +
    '.ml-ct{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#f5f7ff;margin-bottom:7px}.ml-ct svg{width:18px;height:18px;color:#b9c9ff;flex:none}' +
    '.ml-big{font-size:22px;line-height:1.15;color:#f5f7ff}.ml-big small{font-size:12px;color:#8f98c0;margin-left:5px}' +
    '.ml-row{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;line-height:1.55;color:#aab3d8}.ml-row span:last-child{color:#eef1ff;text-align:right}' +
    '.ml-note{font-size:11.5px;line-height:1.4;color:#8f98c0;margin-top:6px}' +
    '.ml-bar{display:flex;gap:2px;margin:6px 0 4px}.ml-bar i{flex:1;height:6px;border-radius:2px;background:#1a2350}.ml-bar i.on{background:' + Y + '}' +
    '.ml-hrs{display:flex;align-items:flex-end;gap:2px;height:30px;margin:6px 0 2px}.ml-hrs i{flex:1;border-radius:2px 2px 0 0;min-height:2px}' +
    '.ml-chk{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;line-height:1.35;color:#d6dcf7;padding:3px 0;cursor:pointer}.ml-chk input{accent-color:' + Y + ';margin-top:2px}.ml-chk em{display:block;font-style:normal;font-size:11px;color:#8f98c0}' +
    '.ml-sky{margin:6px 0 0}' +
    '.ml-objs{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin-top:4px}' +
    '.ml-o{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #232a4f;border-radius:10px;background:#0b1027;text-align:left;color:inherit;font:inherit;width:100%;box-sizing:border-box}' +
    'button.ml-o{cursor:pointer;transition:border-color .2s,background .2s}button.ml-o:hover,button.ml-o:focus-visible{border-color:' + Y + ';background:#111a3d;outline:none}' +
    '.ml-oi{flex:none;width:28px;height:28px;color:#b9c9ff}.ml-oi svg{width:100%;height:100%}' +
    '.ml-on{font-size:13px;color:#f5f7ff;line-height:1.25}.ml-om{font-size:11px;color:#8f98c0;line-height:1.35}.ml-ol{margin-left:auto;flex:none;color:' + Y + ';font-size:16px}' +
    '.ml-cons{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.ml-cons span{font-size:12px;padding:3px 10px;border:1px solid #343d63;border-radius:999px;color:#cfd6f5}.ml-cons span b{font-weight:400;color:#8f98c0;margin-left:4px}' +
    '.ml-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8f98c0;font-size:13px;pointer-events:none}' +
    '.ml-spin{width:26px;height:26px;margin-right:10px;color:' + Y + ';animation:mlSpin 1.6s linear infinite}@keyframes mlSpin{to{transform:rotate(360deg)}}' +
    '.ml.fit{overflow:hidden}.ml.fit .ml-res{padding-bottom:6px;transform-origin:50% 0}.ml:not(.mob):not(.nar) .ml-grid{grid-template-columns:minmax(0,1fr) minmax(320px,1.15fr) minmax(0,1fr);grid-template-areas:"l m r" "p s s";row-gap:10px}.ml:not(.mob):not(.nar) .ml-col.l{grid-area:l}.ml:not(.mob):not(.nar) .ml-mapw{grid-area:m}.ml:not(.mob):not(.nar) .ml-col.r{grid-area:r}.ml:not(.mob):not(.nar) .ml-pr{grid-area:p;align-self:stretch}.ml:not(.mob):not(.nar) .ml-sky{grid-area:s;align-self:stretch}.ml-sky{margin:0;position:relative;z-index:2}.ml-sky .ml-objs{grid-template-columns:repeat(5,minmax(0,1fr))}.ml-sky .ml-o{padding:5px 8px;gap:8px}.ml-sky .ml-oi{width:22px;height:22px}.ml-sky .ml-on{font-size:12.5px}.ml:not(.mob) .ml-grid .ml-card.ml-wx{grid-template-columns:repeat(3,minmax(0,1fr))}.ml:not(.mob):not(.nar) .ml-sky .ml-bt{display:none}.ml:not(.mob):not(.nar) .ml-sky>.ml-note:last-child{display:none}.ml:not(.mob):not(.nar) .ml-wx .ml-note{display:none}.ml:not(.mob):not(.nar) .ml-sky .ml-ty{display:none}.ml:not(.mob):not(.nar) .ml-sky .ml-o{min-height:0}.ml:not(.mob):not(.nar) .ml-pr,.ml:not(.mob):not(.nar) .ml-sky{align-self:start}.ml:not(.mob):not(.nar) .ml-grid .ml-card .ml-note{font-size:11px;line-height:1.35}.ml.nar .ml-grid{display:flex;flex-direction:column;max-width:560px;gap:10px}.ml.nar .ml-col{display:contents}.ml.nar .ml-mapw{order:-2;width:min(calc(100% - 24px),var(--mw,380px));margin:12px auto 4px}.ml.nar .ml-sky .ml-objs{grid-template-columns:1fr 1fr}.ml.has-res .ml-top{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:6px 12px;width:min(860px,calc(100% - 28px))}.ml.has-res .ml-q{flex:1 1 300px;width:auto;padding:3px 3px 3px 14px}.ml.has-res .ml-q input{font-size:17px;padding:4px 0}.ml.has-res .ml-q button{width:34px;height:34px}.ml.has-res .ml-msg:empty{display:none}.ml-head{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px 12px}.ml-head .ml-name{max-width:46%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ml-head .ml-co{margin:0}.ml-head .ml-ver{margin:0}.ml-vw{border:1px solid #343d63;border-radius:999px;background:#0b1025;color:#b9c9ff;font:400 12px ' + SERIF + ';padding:4px 12px;cursor:pointer;transition:border-color .2s,color .2s}.ml-vw:hover,.ml-vw:focus-visible{border-color:' + Y + ';color:' + Y + ';outline:none}.ml-card{padding:10px 12px 11px}.ml-row{font-size:12.5px;line-height:1.5}.ml:not(.mob) .ml-grid .ml-card{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;row-gap:3px;align-content:start}.ml:not(.mob) .ml-grid .ml-card>*{grid-column:1/-1}.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis){grid-column:auto;display:block;line-height:1.25;padding:1px 0}.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis) span{display:block;text-align:left}.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis) span:first-child{font-size:10.5px;color:#8f98c0}.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis) span:last-child{font-size:13px}.ml:not(.mob) .ml-grid .ml-card>.ml-chk{grid-column:auto}' +
    '.ml-tabs{display:none}.ml-tabs button{width:38px;height:38px;border-radius:50%;border:1px solid #343d63;background:#0b1025;color:#b9c9ff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:border-color .2s,color .2s,box-shadow .2s}.ml-tabs button svg{width:18px;height:18px}.ml-tabs button.on{border-color:' + Y + ';color:' + Y + ';box-shadow:0 0 10px rgba(248,216,116,.35)}' +
    '.ml.mob .ml-grid{display:flex;flex-direction:column;max-width:560px;gap:10px}.ml.mob .ml-col{display:contents}.ml.mob .ml-mapw{order:-2;width:min(calc(100% - 24px),var(--mw,380px));margin:12px auto 4px}.ml.mob .ml-tabs{order:-1;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding-top:14px}.ml.mob .ml-card[data-t]:not(.on){display:none}.ml.mob .ml-head{margin-bottom:0}.ml.mob .ml-name{font-size:12.5px}.ml.mob .ml-sky{margin:0}.ml.mob .ml-sky .ml-o:nth-child(n+7){display:flex}.ml.mob .ml-objs{grid-template-columns:1fr}' +
    '@media(max-width:900px){.ml-grid{grid-template-columns:1fr;max-width:560px}.ml-mapw{order:-1;margin:16px auto;width:min(calc(100% - 24px),420px)}.ml-sky{max-width:560px}}' +
    '@media(max-width:520px){.ml-q{padding:4px 4px 4px 14px}.ml-q button{width:36px;height:36px}.ml-res{padding:0 10px 20px}.ml-objs{grid-template-columns:1fr}.ml-big{font-size:20px}}' +
    '/* vista completa: columnas laterales anchas, datos en tres columnas, sin notas y con letra grande */' +
    '.ml:not(.mob):not(.nar) .ml-grid{grid-template-columns:minmax(0,1.3fr) minmax(280px,.85fr) minmax(0,1.3fr)}.ml:not(.mob):not(.nar) .ml-grid .ml-card{grid-template-columns:repeat(3,minmax(0,1fr));padding:12px 14px}.ml:not(.mob):not(.nar) .ml-grid .ml-card .ml-note{display:none}' +
    '.ml:not(.mob):not(.nar) .ml-ct{font-size:15px;margin-bottom:8px}.ml:not(.mob):not(.nar) .ml-big{font-size:26px}.ml:not(.mob):not(.nar) .ml-big small{font-size:13px}' +
    '.ml:not(.mob):not(.nar) .ml-grid .ml-card>.ml-row:not(.ml-axis) span:first-child{font-size:12px}.ml:not(.mob):not(.nar) .ml-grid .ml-card>.ml-row:not(.ml-axis) span:last-child{font-size:15px}.ml:not(.mob):not(.nar) .ml-row{font-size:14px}.ml:not(.mob):not(.nar) .ml-chk{font-size:14px}.ml:not(.mob):not(.nar) .ml-chk em{font-size:12px}' +
    '.ml:not(.mob):not(.nar) .ml-sky .ml-on{font-size:14px}.ml:not(.mob):not(.nar) .ml-sky .ml-om{font-size:12.5px}.ml:not(.mob):not(.nar) .ml-sky .ml-oi{width:26px;height:26px}.ml:not(.mob):not(.nar) .ml-cons span{font-size:13px}.ml:not(.mob):not(.nar) .ml-hrs{height:24px}.ml:not(.mob):not(.nar) .ml-name{font-size:15px}.ml:not(.mob):not(.nar) .ml-co{font-size:12.5px}' +
    '/* mapa grande en el centro con Preparacion debajo; laterales a todo lo alto; el cielo a lo ancho */' +
    '.ml:not(.mob):not(.nar) .ml-grid{grid-template-columns:minmax(0,1.1fr) minmax(330px,1fr) minmax(0,1.1fr);grid-template-areas:"l m r" "l p r" "s s s"}.ml:not(.mob):not(.nar) .ml-col.l,.ml:not(.mob):not(.nar) .ml-col.r{align-self:center}.ml:not(.mob):not(.nar) .ml-mapw{align-self:end}.ml:not(.mob):not(.nar) .ml-pr{align-self:start;margin:0 calc(var(--ov) * .5)}.ml:not(.mob):not(.nar) .ml-grid .ml-card.ml-pr{grid-template-columns:repeat(2,minmax(0,1fr))}' +
    '.ml:not(.mob):not(.nar) .ml-grid{max-width:none}.ml:not(.mob):not(.nar) .ml-grid .ml-card .ml-note.ml-fail{display:block}.ml:not(.mob):not(.nar) .ml-sky .ml-objs{grid-template-columns:repeat(var(--oc,5),minmax(0,1fr))}' +
    '.ml.mob.wide .ml-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);grid-template-rows:auto 1fr;max-width:none;gap:14px 24px;align-items:start}.ml.mob.wide .ml-col{display:contents}.ml.mob.wide .ml-mapw{grid-column:1;grid-row:1/span 2;width:min(calc(100% - 24px),var(--mw,380px));margin:12px auto;align-self:center}.ml.mob.wide .ml-tabs{grid-column:2;grid-row:1;justify-content:flex-start}.ml.mob.wide .ml-card.on{grid-column:2;grid-row:2}' +
    '.ml.mob.wide .ml-grid .ml-card.on{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:14px;row-gap:4px;align-content:start;padding:14px 16px}.ml.mob.wide .ml-grid .ml-card>*{grid-column:1/-1}.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis){grid-column:auto;display:block;line-height:1.25;padding:2px 0}.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis) span{display:block;text-align:left}.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis) span:first-child{font-size:12px;color:#8f98c0}.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis) span:last-child{font-size:15px}.ml.mob.wide .ml-grid .ml-card>.ml-chk{grid-column:auto;font-size:14px}' +
    '.ml.mob.wide .ml-ct{font-size:15px}.ml.mob.wide .ml-big{font-size:26px}.ml.mob.wide .ml-note{font-size:12.5px}.ml.mob.wide .ml-sky .ml-objs{grid-template-columns:repeat(var(--oc,3),minmax(0,1fr))}.ml.mob.wide .ml-sky .ml-on{font-size:14px}.ml.mob.wide .ml-sky .ml-om{font-size:12px}.ml.mob.wide .ml-tabs button{width:42px;height:42px}' +
    '.ml.ring.fit.has-res:not(.mob) .ml-grid{display:grid;max-width:none;grid-template-columns:minmax(0,1fr) var(--mapc,420px) minmax(0,1fr);grid-template-areas:"lp m wx" "en m wx" "el m mo" "pr m mo" "s s s";gap:clamp(6px,1.3vh,16px) clamp(8px,1.1vw,20px);align-items:stretch}.ml.ring.fit.has-res:not(.mob) .ml-col{display:contents}.ml.ring.fit.has-res:not(.mob) .ml-tabs{display:none}.ml.ring.fit.has-res:not(.mob) .ml-grid .ml-card{margin:0;min-width:0;align-self:stretch}.ml.ring.fit.has-res:not(.mob) .ml-mapw{grid-area:m;align-self:center;justify-self:center;width:var(--mapc,420px);max-width:none;margin:0}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="0"]{grid-area:lp}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="1"]{grid-area:en}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="2"]{grid-area:el}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="3"]{grid-area:wx}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="4"]{grid-area:mo}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="5"]{grid-area:pr}.ml.ring.fit.has-res:not(.mob) .ml-card[data-t="6"]{grid-area:s}' +
    '.ml.ring.fit.has-res.nar:not(.mob) .ml-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:"lp en" "el pr" "m m" "wx mo" "s s"}.ml.ring.fit.has-res.nar:not(.mob) .ml-mapw{margin:4px 0}' +
    '.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="0"],.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="1"],.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="2"],.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="5"]{margin-right:calc(-1 * var(--ov2,0px))}.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="3"],.ml.ring.fit.has-res:not(.mob):not(.nar) .ml-card[data-t="4"]{margin-left:calc(-1 * var(--ov2,0px))}' +
    '.ml .ml-card{border:1.5px solid #5b6bb4;border-radius:13px;background:linear-gradient(120deg,#111a35,#0b1025);box-shadow:0 8px 22px #05060f99;transition:border-color .25s,box-shadow .25s}.ml .ml-card:hover{border-color:#8ab4ff;box-shadow:0 8px 22px #05060f99,0 0 18px #5b7bff33}' +
    '.ml .ml-ct{gap:11px;font:400 17px/1.25 ' + SERIF + ';color:#f5f7ff;padding-bottom:9px;margin-bottom:10px;border-bottom:1px solid #343d63}.ml .ml-ct svg{box-sizing:border-box;flex:none;width:38px;height:38px;padding:5px;border:1px solid #414e7a;border-radius:9px;background:#192443;color:#b9c9ff}' +
    '.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis),.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis){border-left:1px solid #343d63;padding-left:9px;transition:border-color .2s}.ml:not(.mob) .ml-grid .ml-card>.ml-row:not(.ml-axis):hover,.ml.mob.wide .ml-grid .ml-card>.ml-row:not(.ml-axis):hover{border-left-color:' + Y + '}.ml .ml-big{font-family:' + SERIF + ';letter-spacing:.01em}.ml .ml-bar i{height:5px;border-radius:3px}' +
    '.ml .ml-o{border-color:#343d63;background:#0d1430}.ml .ml-o:hover{border-color:' + Y + ';background:#111a3d}.ml .ml-oi{color:#8ab4ff}' +
    '.ml .ac{stroke:' + Y + '}.ml .ml-cut{display:none!important}' +
    '.ml.mob:not(.wide) .ml-sky .ml-objs{grid-template-columns:1fr 1fr;gap:6px}.ml.mob:not(.wide) .ml-sky .ml-ty{display:none}.ml.mob:not(.wide) .ml-sky>.ml-note:last-child{display:none}.ml.mob:not(.wide) .ml-sky .ml-o{padding:6px 8px;gap:7px}.ml.mob:not(.wide) .ml-sky .ml-oi{width:20px;height:20px}.ml.mob:not(.wide) .ml-sky .ml-ol{display:none}' +
    '@media(prefers-reduced-motion:reduce){.ml-top,.ml-res{transition:none}.ml-spin{animation:none}}'
  var IC = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    locate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    bulb: '<svg viewBox="0.00 -0.85 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18.5h6M10 21.5h4"/><path class="ac" d="M12 3.6a5.9 5.9 0 0 0-3.5 10.7c.6.5 1 1.2 1 2V17h5v-.7c0-.8.4-1.5 1-2A5.9 5.9 0 0 0 12 3.6z"/><path class="ac" d="M12 .8v1M3.4 4.6l.8.7M20.6 4.6l-.8.7M1.2 10.6h1.1M21.7 10.6h1.1"/></svg>',
    mount: '<svg viewBox="-0.05 2.20 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.8 19.5l6.6-10.6 4.2 6.3 2.6-3.6 6.9 7.9z"/><path d="M17.6 9.6l-2 3h1.2l-1.5 2.4h4.6l-1.5-2.4h1.2z"/></svg>',
    cloud: '<svg viewBox="-1.91 1.10 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle class="ac" cx="15" cy="14" r="5.2"/><path class="ac" d="M15 4.2v2.2M5.2 14h2.2M7.9 7l1.6 1.6M22.1 7l-1.6 1.6"/><path d="M13 34.5h19.5a6.8 6.8 0 0 0 .8-13.5A9.6 9.6 0 0 0 15.4 23.4 5.6 5.6 0 0 0 13 34.5z" fill="#192443"/><path class="ac" d="M26 31l-5 8h4.2l-2.4 7 7.6-9.5h-4.4l2.6-5.5z"/></svg>',
    pin: '<svg viewBox="0.00 -2.25 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 39h42"/><path d="M5 39V30h10v9M3.5 30.5 10 24l6.5 6.5"/><path d="M33 39V31h10v8M31.5 31.5 38 25l6.5 6.5"/><path d="M18 39V26h12v13"/><path d="M20 26V17h8v9"/><path d="M19 17l5-7 5 7"/><path class="ac" d="M24 10V4.5M21.8 6.5h4.4"/><path d="M22 39v-5a2 2 0 0 1 4 0v5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" stroke="' + Y + '"/></svg>',
    pack: '<svg viewBox="-1.05 2.50 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13.5l11.5-6 2.2 4.3-11.5 6z"/><path d="M14.4 8.6l2.2 4.3M5 13.5l-1.8 1M12.9 15L9 21.5M12.9 15l3.6 6.5M12.9 15v6.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l2.4 6 6.4.4-5 4 1.7 6.3L12 16.2 6.5 19.7l1.7-6.3-5-4 6.4-.4z"/></svg>',
    sky: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" stroke="' + Y + '"/><circle cx="5" cy="18" r="1"/><circle cx="18" cy="17" r="1.3"/><circle cx="20" cy="4" r=".8"/></svg>',
    o_g: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="14" cy="14" rx="11" ry="4.5" transform="rotate(-25 14 14)"/><ellipse cx="14" cy="14" rx="5" ry="2" transform="rotate(-25 14 14)" fill="' + Y + '" stroke="none" opacity=".85"/></svg>',
    o_n: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 17c0-6 5-10 9-8s4-4 8-1 2 11-5 12-12 2-12-3z"/><circle cx="14" cy="14" r="1.6" fill="' + Y + '" stroke="none"/></svg>',
    o_a: '<svg viewBox="0 0 28 28" fill="currentColor"><circle cx="9" cy="10" r="1.6"/><circle cx="15" cy="8" r="1.3"/><circle cx="19" cy="13" r="1.8" fill="' + Y + '"/><circle cx="12" cy="15" r="1.2"/><circle cx="16" cy="19" r="1.4"/><circle cx="8" cy="18" r="1"/></svg>',
    o_c: '<svg viewBox="0 0 28 28" fill="currentColor"><circle cx="14" cy="14" r="4" fill="' + Y + '" opacity=".85"/><circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 2.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" stroke-width=".7" stroke-dasharray="1 3.5"/></svg>',
    o_p: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="14" cy="14" rx="8" ry="6.5"/><circle cx="14" cy="14" r="1.3" fill="' + Y + '" stroke="none"/></svg>',
    o_s: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 14l4-5 3 3 4-6 2 5 4 1-3 4 2 5-5-1-3 4-2-5-5 1 2-4z"/><circle cx="14" cy="14" r="1.4" fill="' + Y + '" stroke="none"/></svg>',
    o_d: '<svg viewBox="0 0 28 28"><circle cx="11" cy="13" r="3.4" fill="' + Y + '"/><circle cx="18" cy="16" r="2.4" fill="#8ab4ff"/></svg>',
    o_pl: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="14" cy="14" r="6" fill="' + Y + '" fill-opacity=".25"/><ellipse cx="14" cy="14" rx="11" ry="3.5" transform="rotate(-18 14 14)"/></svg>',
    o_mo: '<svg viewBox="0 0 28 28" fill="none" stroke="' + Y + '" stroke-width="1.5"><path d="M20 17A8 8 0 1 1 11 7a6.5 6.5 0 0 0 9 10z"/></svg>'
  }

  function mount(host) {
    if (!document.getElementById('ml-css')) { var st = document.createElement('style'); st.id = 'ml-css'; st.textContent = CSS; document.head.append(st) }
    host.innerHTML = ''
    var root = document.createElement('div'); root.className = 'ml'
    var today = new Date(), ymdOf = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
    root.innerHTML = '<div class="ml-top"><form class="ml-q" role="search"><input type="text" autocomplete="off" spellcheck="false"><button type="button" class="ml-loc">' + IC.locate + '</button><button type="submit" class="ml-go">' + IC.search + '</button></form>' +
      '<label class="ml-dt"><span class="ml-dl"></span><input type="date" value="' + ymdOf(today) + '"></label><div class="ml-msg" aria-live="polite"></div></div><div class="ml-res"></div>'
    host.append(root)
    var top = root.querySelector('.ml-top'), form = root.querySelector('form'), input = form.querySelector('input'), dateI = root.querySelector('.ml-dt input'), dl = root.querySelector('.ml-dl'), msg = root.querySelector('.ml-msg'), res = root.querySelector('.ml-res'), locB = root.querySelector('.ml-loc'), goB = root.querySelector('.ml-go')
    var dead = false, run = 0, last = null, mapCanvas = null, mapData = null, ro = null, loc = null, ox = 0, oy = 0, rafM = 0, tab = 0, scale = 1, view = null, tabFit = null
    function texts() {
      input.placeholder = T('¿Dónde vamos hoy?'); input.setAttribute('aria-label', T('¿Dónde vamos hoy?'))
      locB.setAttribute('aria-label', T('Usar mi ubicación')); locB.title = T('Usar mi ubicación'); goB.setAttribute('aria-label', T('Buscar'))
      dl.textContent = T('Noche del'); dateI.setAttribute('aria-label', T('Noche del'))
      if (!root.classList.contains('has-res') && !msg.dataset.k) msg.textContent = T('Escribe una dirección o unas coordenadas (p. ej. 40.42, -3.70)')
      if (last) render(last)
    }
    setTimeout(function () { try { input.focus({ preventScroll: true }) } catch (e) { } }, 50)
    function search(q) {
      var id = ++run
      msg.dataset.k = 'busy'; msg.textContent = T('Buscando…')
      return geocode(q).then(function (l) { if (id !== run || dead) return; loc = l; ox = oy = 0; go(id) }).catch(function () { if (id === run) { msg.dataset.k = 'err'; msg.textContent = T('No encontramos ese lugar. Prueba con otra dirección o con coordenadas.') } })
    }
    /* informe para el lugar y el dia elegidos */
    function go(id) {
      if (!loc) return
      id = id || ++run
      root.classList.add('has-res'); msg.dataset.k = 'ok'; msg.textContent = ''
      var lat = loc.lat, lon = loc.lon, p = (dateI.value || ymdOf(today)).split('-').map(Number)
      var noon = Date.UTC(p[0], p[1] - 1, p[2], 12) - lon / 15 * 3600000, n = nightOf(lat, lon, noon), mo = moonInfo(lat, lon, n)
      var d0 = Date.UTC(p[0], p[1] - 1, p[2]), days = (d0 - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000
      var ymd = new Date(d0).toISOString().slice(0, 10), ymd0 = new Date(d0 - 86400000).toISOString().slice(0, 10), ymd2 = new Date(d0 + 86400000).toISOString().slice(0, 10), inRange = days >= -60 && days <= 14, aqRange = days >= -60 && days <= 4
      var data = { lat: lat, lon: lon, name: loc.name, ymd: ymd, night: n, moon: mo, grid: null, wx: null, glow: null, lights: null, ways: null, aq: null, inRange: inRange, aqRange: aqRange, sky: null }
      last = data; render(data)
      var upd = function () { if (id === run && !dead) render(data) }
      if (!loc.name) reverse(lat, lon).then(function (nm) { if (nm) { loc.name = nm; data.name = nm; upd() } })
      elevGrid(lat, lon).then(function (g) { data.grid = g }).catch(function () { data.grid = false }).then(upd)
      if (aqRange) airq(lat, lon, ymd, ymd2).then(function (q) { data.aq = q }).catch(function () { data.aq = false }).then(upd); else data.aq = false
      weather(lat, lon, ymd0, ymd2, inRange).then(function (w) { data.wx = w }).catch(function () { data.wx = false }).then(upd)
      skyGlow(lat, lon).then(function (g) { data.glow = g }).catch(function () { data.glow = false }).then(upd)
      localLights(lat, lon).then(function (l) { data.lights = l }).catch(function () { data.lights = false }).then(upd)
      roads(lat, lon).then(function (w) { data.ways = w }).catch(function () { data.ways = false }).then(upd)
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (q) search(q) })
    dateI.addEventListener('change', function () { if (loc) go() })
    locB.addEventListener('click', function () {
      if (!navigator.geolocation) return
      msg.dataset.k = 'busy'; msg.textContent = T('Buscando tu ubicación…')
      navigator.geolocation.getCurrentPosition(function (q) { input.value = q.coords.latitude.toFixed(4) + ', ' + q.coords.longitude.toFixed(4); loc = { lat: q.coords.latitude, lon: q.coords.longitude, name: null }; ox = oy = 0; go() }, function () { msg.dataset.k = 'err'; msg.textContent = T('No se pudo obtener tu ubicación.') }, { timeout: 10000 })
    })

    /* ---------- informe ---------- */
    function tzOff(ms, tz) { try { var q = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(ms)).reduce(function (o, x) { o[x.type] = x.value; return o }, {}); return (Date.UTC(+q.year, +q.month - 1, +q.day, +q.hour, +q.minute) - Math.floor(ms / 60000) * 60000) / 1000 } catch (e) { return null } }
    function fmtTime(ms, d) { if (ms == null) return '—'; var off = d.wx && d.wx.timezone ? tzOff(ms, d.wx.timezone) : null; if (off == null) off = Math.round(d.lon / 15) * 3600; var x = new Date(ms + off * 1000); return pad(x.getUTCHours()) + ':' + pad(x.getUTCMinutes()) }
    function fmtDur(ms) { var h = Math.floor(ms / 3600000), m = Math.round((ms % 3600000) / 60000); return h + ' h ' + pad(m) + ' min' }
    function row(a, b) { return '<div class="ml-row"><span>' + esc(a) + '</span><span>' + b + '</span></div>' }
    function card(icon, title, body, cls) { return '<div class="ml-card' + (cls ? ' ' + cls : '') + '"><div class="ml-ct">' + icon + '<span>' + esc(T(title)) + '</span></div>' + body + '</div>' }
    var loadingBody = function () { return '<div class="ml-row"><span>' + esc(T('Calculando…')) + '</span></div>' }
    var fail = function () { return '<div class="ml-note ml-fail">' + esc(T('Sin datos ahora mismo. Inténtalo de nuevo más tarde.')) + '</div>' }
    function render(d) {
      var nw = nightWeather(d.wx, d.night), lp = d.glow || null, air = nightAir(d.aq, d.night)
      var hz = d.grid ? horizon(d.grid) : null, c = (GN - 1) / 2, alt = d.grid ? d.grid[c][c] : null
      if (!d.sky && (lp || d.glow === false)) d.sky = highlights(d.lat, d.lon, d.night, lp ? lp.nelm : 6, d.moon)
      var score = null
      if (lp) {
        var moonF = d.moon.illum * (d.moon.up / Math.max(1, d.night.dawn - d.night.dusk)), cl = nw ? nw.cloud / 100 : .3
        if (air && air.aod != null) cl = Math.min(1, cl + clamp((air.aod - .15) / .5) * .3)
        score = 10 * (.34 * (1 - cl) + .26 * (1 - (lp.bortle - 1) / 8) + .2 * (1 - moonF) + .1 * (nw ? 1 - clamp(nw.wind / 40) : .7) + .1 * (nw ? 1 - clamp((nw.rh - 60) / 40) : .7))
      }
      var dateTxt = new Date(d.ymd + 'T12:00:00Z').toLocaleDateString({ es: 'es-ES', en: 'en-GB', fr: 'fr-FR' }[LANG()], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      var verdict = score == null ? '' : '<div class="ml-ver">' + esc(T('Valoración de la noche')) + ' <b>' + num(score, 1) + '/10</b> · ' + esc(T(score >= 8 ? 'Excelente' : score >= 6 ? 'Buena' : score >= 4 ? 'Regular' : 'Mala')) + '</div>'
      var head = '<div class="ml-head"><div class="ml-name">' + esc(d.name || T('Ubicación sin nombre')) + '</div><div class="ml-co">' + num(d.lat, 4) + '°, ' + num(d.lon, 4) + '°' + (alt != null ? ' · ' + Math.round(alt) + ' m' : '') + ' · ' + esc(dateTxt) + (d.wx && d.wx.timezone ? ' · ' + esc(d.wx.timezone) : '') + '</div>' + verdict + '</div>'
      var cLP = card(IC.bulb, 'Contaminación Lumínica', d.glow === null ? loadingBody() : !lp ? fail() :
        '<div class="ml-big">Bortle ' + lp.bortle + '<small>' + num(lp.sqm, 2) + ' mag/arcsec²</small></div><div class="ml-bar">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<i class="' + (i <= lp.bortle ? 'on' : '') + '"></i>' }).join('') + '</div>' +
        row(T('Magnitud límite a simple vista'), num(lp.nelm, 1)) + row(T('Resplandor principal hacia el'), lp.dir != null ? dirName(lp.dir) : esc(T('ninguno destacable'))) +
        '<div class="ml-note">' + esc(T(lp.bortle <= 3 ? 'Cielo oscuro: buena opción para galaxias y nebulosas.' : lp.bortle <= 5 ? 'Cielo de transición: bien para cúmulos, planetas y objetos brillantes.' : 'Cielo contaminado: mejor planetas, Luna y estrellas dobles, o busca un sitio más alejado.')) + ' ' + esc(T('Estimación a partir de las luces nocturnas vistas por satélite (NASA).')) + '</div>')
      var cEN = card(IC.mount, 'Entorno', d.grid === null ? loadingBody() : !hz ? fail() : (function () {
        var clear = hz.filter(function (a) { return a < 3 }).length / hz.length, worst = 0, wi = 0; hz.forEach(function (a, i) { if (a > worst) { worst = a; wi = i } })
        var P = Math.exp(-Math.max(0, alt) / 8500)
        var poly = hz.map(function (a, i) { var r = 34 - clamp(a, 0, 20) * 1.3, an = i * 15 * RAD; return (40 + Math.sin(an) * r).toFixed(1) + ',' + (40 - Math.cos(an) * r).toFixed(1) }).join(' ')
        var svg = '<svg viewBox="0 0 80 80" width="78" height="78" style="flex:none"><circle cx="40" cy="40" r="34" fill="#070a19" stroke="' + M + '"/><circle cx="40" cy="40" r="21" fill="none" stroke="' + M + '" stroke-dasharray="2 3" opacity=".6"/><polygon points="' + poly + '" fill="rgba(91,107,180,.35)" stroke="' + L2 + '" stroke-width="1"/><text x="40" y="10" text-anchor="middle" font-size="7" fill="' + Y + '">N</text><circle cx="40" cy="40" r="2" fill="' + Y + '"/></svg>'
        return '<div style="display:flex;gap:12px;align-items:center">' + svg + '<div style="flex:1;min-width:0"><div class="ml-big">' + Math.round(alt) + ' m</div>' + row(T('Aire por encima'), Math.round(P * 100) + ' %') + row(T('Presión'), Math.round(1013 * P) + ' hPa') + row(T('Horizonte despejado'), Math.round(clear * 100) + ' %') + '</div></div>' +
          '<div class="ml-note">' + esc(worst > 3 ? T('El relieve tapa hasta') + ' ' + num(worst, 0) + '° ' + T('hacia el') + ' ' + dirName(wi * 15) + '.' : T('Horizonte libre de relieve en todas direcciones.')) + '</div>'
      })())
      var cEL = card(IC.pin, 'Elección del lugar', (function () {
        var s = d.grid ? slope(d.grid) : null, w = d.ways ? nearestWay(d.ways, d.lat, d.lon) : null
        return (d.grid === null ? row(T('Pendiente del entorno'), '…') : s ? row(T('Pendiente del entorno'), num(s.pct, 0) + ' %') + (s.pct > 3 ? row(T('Ladera orientada al'), dirName(s.aspect)) : '') : '') +
          (nw ? row(T('Estado del suelo'), (function () { var wet = (nw.rain24 || 0) > 5 || (nw.soil != null && nw.soil > .32); return '<span style="color:' + (wet || nw.snow > .02 ? Y : 'inherit') + '">' + esc(T(nw.snow > .02 ? 'nieve' : wet ? 'blando o embarrado' : 'firme y seco')) + '</span>' })()) + row(T('Lluvia en las últimas 24 h'), num(nw.rain24 || 0, 1) + ' mm') + (nw.snow > .005 ? row(T('Nieve'), Math.round(nw.snow * 100) + ' cm') : '') : '') +
          row(T('Camino más cercano'), d.ways === null ? esc(T('Calculando…')) : w ? (w.d < 1 ? Math.round(w.d * 1000) + ' m' : num(w.d, 1) + ' km') + ' · ' + esc(T(w.type)) : d.ways ? '> 4 km' : '—') +
          '<div class="ml-note">' + esc(T(s && s.pct > 15 ? 'Terreno con pendiente: busca una zona llana y firme para el trípode.' : 'Terreno relativamente llano.')) + ' ' + esc(T('Comprueba que el acceso es libre y legal y evita zonas aisladas o conflictivas.')) + '</div>'
      })())
      var cWX = card(IC.cloud, 'Meteorología', d.wx === null ? loadingBody() : !d.inRange ? '<div class="ml-note">' + esc(T('El pronóstico solo llega a 16 días vista: vuelve a consultarlo más cerca de la fecha.')) + '</div>' : !nw ? fail() : (function () {
        var bars = nw.hours.map(function (h) { return '<i style="height:' + Math.max(2, h.c / 100 * 30) + 'px;background:' + (h.c > 60 ? '#5b6bb4' : h.c > 25 ? '#8ab4ff' : Y) + '"></i>' }).join('')
        var dewRisk = nw.temp - nw.dew < 2.5
        return '<div class="ml-big">' + Math.round(nw.cloud) + ' %<small>' + esc(T('nubes')) + '</small></div><div class="ml-hrs">' + bars + '</div><div class="ml-row ml-axis"><span>' + fmtTime(d.night.dusk, d) + '</span><span>' + fmtTime(d.night.dawn, d) + '</span></div>' +
          row(T('Nubes bajas / medias / altas'), Math.round(nw.low) + ' / ' + Math.round(nw.mid) + ' / ' + Math.round(nw.high) + ' %') + (nw.rain != null ? row(T('Probabilidad de lluvia'), Math.round(nw.rain) + ' %') : '') +
          row(T('Seeing estimado'), num(nw.seeing, 1) + '″') + row(T('Humedad relativa'), Math.round(nw.rh) + ' %') +
          row(T('Punto de rocío'), '<span style="color:' + (dewRisk ? Y : 'inherit') + '">' + num(nw.dew, 1) + ' °C</span>') + row(T('Temperatura'), num(nw.temp, 0) + ' °C (' + T('mín.') + ' ' + num(nw.minT, 0) + ' °C)') +
          row(T('Viento'), Math.round(nw.wind) + ' km/h' + (nw.gust != null ? ' (' + T('ráfagas') + ' ' + Math.round(nw.gust) + ')' : '')) + (nw.vis != null ? row(T('Visibilidad'), num(nw.vis / 1000, 0) + ' km') : '') +
          (air && air.aod != null ? row(T('Transparencia'), '<span style="color:' + (air.aod > .3 ? Y : 'inherit') + '">' + esc(T(air.aod < .1 ? 'Excelente' : air.aod < .2 ? 'Buena' : air.aod < .35 ? 'Regular' : 'Mala')) + ' (AOD ' + num(air.aod, 2) + ')</span>') : '') +
          (air && air.dust != null ? row(T('Polvo en suspensión'), Math.round(air.dust) + ' µg/m³' + (air.dust > 50 ? ' · ' + esc(T('calima')) : '')) : '') + (air && air.pm10 != null ? row('PM10 / PM2,5', Math.round(air.pm10) + ' / ' + Math.round(air.pm25 || 0) + ' µg/m³') : '') +
          (nw.t850 != null && nw.temp != null ? row(T('Inversión térmica'), nw.t850 > nw.temp ? '<span style="color:' + Y + '">' + esc(T('sí: posible mar de nubes')) + '</span>' : esc(T('no'))) : '') +
          (nw.blh != null ? row(T('Capa de mezcla'), Math.round(nw.blh) + ' m') : '') + (nw.frz != null ? row(T('Isoterma de 0 °C'), Math.round(nw.frz) + ' m') : '') + (nw.pres != null ? row(T('Presión en superficie'), Math.round(nw.pres) + ' hPa') : '')
      })(), 'ml-wx')
      var mo = d.moon, n = d.night, cMO = card(IC.moon, 'Luna y Sol',
        '<div class="ml-big">' + esc(T(mo.phase)) + '<small>' + Math.round(mo.illum * 100) + ' % · ' + num(mo.age, 1) + ' ' + esc(T('días')) + '</small></div>' +
        row(T('Puesta de Sol'), fmtTime(n.sunset, d)) + row(T('Noche cerrada'), n.astro ? fmtTime(n.dusk, d) + ' – ' + fmtTime(n.dawn, d) : esc(T('sin noche astronómica'))) + row(T('Salida del Sol'), fmtTime(n.sunrise, d)) +
        row(T('Luna sobre el horizonte'), fmtDur(mo.up)) + row(T('Oscuridad sin Luna'), '<span style="color:' + Y + '">' + fmtDur(mo.dark) + '</span>') +
        (mo.rise ? row(T('Sale la Luna'), fmtTime(mo.rise, d)) : '') + (mo.set ? row(T('Se pone la Luna'), fmtTime(mo.set, d)) : '') +
        '<div class="ml-note">' + esc(T(mo.illum > .6 && mo.up > 2 * 3600000 ? 'La Luna iluminará buena parte de la noche: aprovecha las horas sin Luna para el cielo profundo.' : 'Buena noche para objetos de cielo profundo en las horas sin Luna.')) + '</div>')
      var items = [['Ropa de abrigo', nw ? T('mínima de') + ' ' + num(nw.minT, 0) + ' °C' : ''], ['Linterna de pilas', ''], ['Baterías portátiles', nw && nw.minT < 5 ? T('el frío reduce su autonomía') : ''], ['Agua y comida', ''], ['Carta celeste y plan', T('noche') + ' ' + fmtTime(n.dusk, d) + '–' + fmtTime(n.dawn, d)]]
      if (nw && nw.temp - nw.dew < 3) items.splice(1, 0, ['Sistema anti-rocío', T('riesgo de rocío esta noche')])
      if (nw && ((nw.rain24 || 0) > 5 || (nw.soil != null && nw.soil > .32) || nw.snow > .02)) items.push(['Calzado y base firme para el trípode', T('el suelo estará blando')])
      if (air && air.dust > 50) items.push(['Tapas para la óptica', T('polvo en suspensión (calima)')])
      var cPR = card(IC.pack, 'Preparación', items.map(function (it, i) { return '<label class="ml-chk"><input type="checkbox" data-i="' + i + '"><span>' + esc(T(it[0])) + (it[1] ? '<em>' + esc(it[1]) + '</em>' : '') + '</span></label>' }).join(''), 'ml-pr')
      var atlas = window.vcAtlas, li = LI()
      var cSKY = !d.sky ? '' : card(IC.sky, 'Lo más destacado esa noche',
        '<div class="ml-objs">' + d.sky.objs.map(function (o) {
          var has = atlas && atlas.find(o.key), tp = TYPES[o.type] ? TYPES[o.type][li] : ''
          var meta = '<span class="ml-bt">' + esc(T('mejor hacia las')) + ' </span>' + fmtTime(o.t, d) + ' · ' + num(o.alt, 0) + '° ' + dirName(o.az) + '<span class="ml-ty"><br>' + tp + (o.type !== 'mo' ? ' · mag ' + num(o.mag, 1) : '') + (o.faint && d.moon.illum > .5 ? '<br>' + esc(T('mejor en las horas sin Luna')) : '') + '</span>'
          var inner = '<span class="ml-oi">' + (IC['o_' + o.type] || IC.o_g) + '</span><span><span class="ml-on">' + esc(o.name[li]) + '</span><br><span class="ml-om">' + meta + '</span></span>' + (has ? '<span class="ml-ol" aria-hidden="true">›</span>' : '')
          return has ? '<button type="button" class="ml-o" data-k="' + esc(o.key) + '">' + inner + '</button>' : '<div class="ml-o">' + inner + '</div>'
        }).join('') + '</div>' +
        (d.sky.cons.length ? '<div class="ml-note" style="margin-top:10px">' + esc(T('Constelaciones bien situadas')) + '</div><div class="ml-cons">' + d.sky.cons.map(function (c2) { return '<span>' + esc(c2.name[li]) + '<b>' + num(c2.alt, 0) + '°</b></span>' }).join('') + '</div>' : '') +
        '<div class="ml-note">' + esc(T('Altura máxima durante la noche cerrada. Pulsa un objeto con › para abrir su ficha del atlas.')) + '</div>', 'ml-sky')
      var mapBox = '<div class="ml-mapw"><div class="ml-map"><canvas aria-label="' + esc(T('Arrastra para mover el mapa')) + '"></canvas>' + (d.grid === null ? '<div class="ml-load"><span class="ml-spin">' + IC.star + '</span>' + esc(T('Dibujando el relieve…')) + '</div>' : d.grid === false ? '<div class="ml-load">' + esc(T('No se pudo cargar el relieve.')) + '</div>' : '') + '</div></div>'
      var checked = [].map.call(res.querySelectorAll('.ml-chk input'), function (x) { return x.checked }), sc = root.scrollTop
      var TABS = [[IC.bulb, 'Contaminación Lumínica'], [IC.mount, 'Entorno'], [IC.pin, 'Elección del lugar'], [IC.cloud, 'Meteorología'], [IC.moon, 'Luna y Sol'], [IC.pack, 'Preparación'], [IC.sky, 'Lo más destacado esa noche']]
      var tabs = '<div class="ml-tabs" role="tablist">' + TABS.map(function (t2, i) { return '<button type="button" role="tab" data-t="' + i + '" aria-label="' + esc(T(t2[1])) + '" title="' + esc(T(t2[1])) + '">' + t2[0] + '</button>' }).join('') + '</div>'
      tabFit = null; res.innerHTML = head.replace(/<\/div>$/, '<button type="button" class="ml-vw"></button></div>') + '<div class="ml-grid"><div class="ml-col l">' + cLP + cEN + cEL + '</div>' + mapBox + tabs + '<div class="ml-col r">' + cWX + cMO + '</div>' + cPR + cSKY + '</div>'
      res.querySelector('.ml-vw').addEventListener('click', function () { view = root.classList.contains('mob') ? 'full' : 'tabs'; fit() })
      var order = [0, 1, 2, 3, 4, 5, 6]; res.querySelectorAll('.ml-card').forEach(function (cd, i) { cd.setAttribute('data-t', order[i]) })
      var setTab = function () { res.querySelectorAll('.ml-card[data-t]').forEach(function (cd) { cd.classList.toggle('on', +cd.getAttribute('data-t') === tab) }); res.querySelectorAll('.ml-tabs button').forEach(function (b) { var on = +b.getAttribute('data-t') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)) }) }
      res.querySelectorAll('.ml-tabs button').forEach(function (b) { b.addEventListener('click', function () { tab = +b.getAttribute('data-t'); setTab(); fit() }) })
      setTab()
      res.querySelectorAll('.ml-chk input').forEach(function (x, i) { if (checked[i]) x.checked = true })
      res.querySelectorAll('button.ml-o').forEach(function (b) { b.addEventListener('click', function () { if (window.vcAtlas) window.vcAtlas.open(b.getAttribute('data-k')) }) })
      res.style.top = (top.offsetHeight + 22) + 'px'; root.scrollTop = sc
      mapCanvas = res.querySelector('.ml-map canvas'); mapData = d
      dragMap(mapCanvas)
      if (ro) ro.disconnect(); try { ro = new ResizeObserver(function () { fit() }); ro.observe(host) } catch (e) { }
      fit()
    }
    /* todo cabe sin desplazarse: en pantallas estrechas o altas se usa la vista por pestanas y, si aun asi no cabe, se reduce la escala */
    var fitting = false
    function fit() {
      if (fitting || !res.firstChild) return; fitting = true
      try {
        var HW = host.clientWidth, HH = host.clientHeight, narrow = HW < 760 || HH > HW * 1.15, mob = view ? view === 'tabs' : narrow
        root.classList.add('fit', 'ring'); root.classList.toggle('mob', mob); root.classList.toggle('nar', narrow && !mob); var wide = mob && HW > HH * 1.05; root.classList.toggle('wide', wide)
        if (narrow && !wide) res.style.setProperty('--mw', Math.round(Math.min(380, HH * .4, HW - 40)) + 'px')
        var vb = res.querySelector('.ml-vw'); if (vb) vb.textContent = T(mob ? 'Vista completa' : 'Vista por pestañas')
        res.style.transform = ''; res.style.width = ''; res.style.left = ''; scale = 1
        var grd = res.querySelector('.ml-grid'); if (grd) grd.style.minHeight = ''
        res.querySelectorAll('.ml-card[data-t]').forEach(function (c) { c.style.zoom = '' }); res.querySelectorAll('.ml-cut').forEach(function (o) { o.classList.remove('ml-cut') })
        res.style.top = (top.offsetHeight + 16) + 'px'
        cutouts()
        var mf = .6, avail = HH - res.offsetTop - 12, full = !mob && !narrow, big = full || wide, maxS = big ? Math.min(1.5, HW / 900) : 1
        var apply = function (s2) { scale = s2; res.style.transform = s2 === 1 ? '' : 'scale(' + s2 + ')'; res.style.width = s2 === 1 ? '' : (100 / s2) + '%'; res.style.left = s2 === 1 ? '' : ((100 - 100 / s2) / 2) + '%'; cutouts() }
        /* columnas de las fichas segun el ancho real de cada tarjeta */
        var cols = function () {
          res.querySelectorAll('.ml-grid .ml-card').forEach(function (cd) { if (mob && !wide || cd.classList.contains('ml-sky')) { cd.style.gridTemplateColumns = ''; return } cd.style.gridTemplateColumns = 'repeat(' + Math.max(1, Math.min(5, Math.floor((cd.clientWidth - (parseFloat(cd.style.paddingLeft) || 13) - (parseFloat(cd.style.paddingRight) || 13)) / 150))) + ',minmax(0,1fr))' })
          var sk = res.querySelector('.ml-sky'); if (sk) sk.style.setProperty('--oc', !mob || wide ? Math.max(2, Math.min(10, Math.floor(sk.clientWidth / 180))) : '')
          /* el mapa no pasa del 58 % del alto disponible (si no, empuja todo hacia abajo) */
          var mw = res.querySelector('.ml-mapw'); if (mw) { mw.style.maxWidth = wide ? Math.round((HH - res.offsetTop) * .8 / scale) + 'px' : ''; mw.style.margin = wide ? '12px auto' : ''; mw.style.width = wide ? 'calc(100% - 24px)' : '' }
          var mapc = Math.round((full ? Math.min((HH - res.offsetTop) * mf, HW * .34) : Math.min(HW * .6, (HH - res.offsetTop) * .3)) / scale); res.style.setProperty('--ov2', full ? Math.round(mapc * .45) + 'px' : '0px')
          res.style.setProperty('--mapc', Math.round((full ? Math.min((HH - res.offsetTop) * mf, HW * .34) : Math.min(HW * .6, (HH - res.offsetTop) * .3)) / scale) + 'px')
        }
        /* ningun texto por debajo de 15 px */
        root.querySelectorAll('[data-ff]').forEach(function (e) { e.style.fontSize = ''; e.removeAttribute('data-ff') })
        root.querySelectorAll('*').forEach(function (e) { if (e.closest('svg,canvas') || !Array.prototype.some.call(e.childNodes, function (c) { return c.nodeType === 3 && c.textContent.trim() }) && !/^(INPUT|BUTTON|SELECT)$/.test(e.tagName)) return; if (parseFloat(getComputedStyle(e).fontSize) < 15) { e.style.fontSize = '15px'; e.setAttribute('data-ff', '') } })
        cutouts(); cols()
        /* letra minima proporcional a la pantalla: 15 px en 1920x1080 (la letra base es de 15 px, asi que la escala no debe bajar de esta proporcion) */
        var minS = Math.min(innerWidth / 1920, innerHeight / 1080), s
        var tallest = function () {
          if (!mob) return res.scrollHeight
          var cds = res.querySelectorAll('.ml-card[data-t]'), hm = 0
          cds.forEach(function (cd) { cds.forEach(function (c2) { c2.classList.toggle('on', c2 === cd) }); cols(); hm = Math.max(hm, res.scrollHeight) })
          cds.forEach(function (c2) { c2.classList.toggle('on', +c2.getAttribute('data-t') === tab) }); cols()
          return hm
        }
        for (var tries = 0; tries < 6; tries++) {
          var key = HW + 'x' + HH + (wide ? 'w' : '')
          if (mob && !wide) {
            var con = res.querySelector('.ml-card.on'), base = res.scrollHeight - (con ? con.offsetHeight : 0)
            apply(Math.floor(Math.min(1, (avail - 240) / Math.max(1, base)) * 50) / 50); cols()
            var free = function () { return (root.getBoundingClientRect().top + root.clientHeight - 10 - con.getBoundingClientRect().top) / scale }
            if (con && con.classList.contains('ml-sky')) { var os = con.querySelector('.ml-objs').children, vis = os.length, room0 = free(); while (con.offsetHeight > room0 && vis > 4) { vis -= 2; for (var oi = vis; oi < os.length; oi++) os[oi].classList.add('ml-cut') } }
            if (con) { var room = free(); if (con.offsetHeight > room) con.style.zoom = Math.max(.25, room / con.offsetHeight); if (root.scrollHeight > root.clientHeight + 1) con.style.zoom = Math.max(.25, con.style.zoom * root.clientHeight / root.scrollHeight - .01) }
            break
          }
          if (mob && tabFit && tabFit.k === key) { apply(tabFit.s); cols(); if (root.scrollHeight <= root.clientHeight + 1) { if (grd) grd.style.minHeight = Math.floor(avail / scale - grd.offsetTop) + 'px'; break } tabFit = null }
          s = Math.min(maxS, avail / Math.max(1, tallest()))
          for (var it = 0; it < 4 && s !== scale; it++) { apply(s); cols(); s = Math.min(maxS, avail / Math.max(1, tallest())) }
          if (s !== scale) apply(s)
          /* si aun sobra por abajo (los recortes cambian los altos), se reduce un poco */
          for (var it3 = 0; it3 < 6 && root.scrollHeight > root.clientHeight + 1; it3++) { apply(scale * Math.min(.97, root.clientHeight / root.scrollHeight)); cols() }
          if (mob) { tabFit = { k: key, s: scale }; if (grd) grd.style.minHeight = Math.floor(avail / scale - grd.offsetTop) + 'px'; break }
          if (scale >= minS - .005 || mf <= .3) break
          mf = Math.max(.3, mf - .06); cols()
        }
        drawMap()
      } finally { fitting = false }
    }
    /* recortes circulares en las tarjetas que tocan el mapa (mascara + margen interior para que el texto no se corte) */
    function cutouts() {
      var wrap = res.querySelector('.ml-mapw'), grid = res.querySelector('.ml-grid'); if (!wrap || !grid) return
      var single = root.classList.contains('mob') || root.classList.contains('nar') || getComputedStyle(grid).gridTemplateColumns.split(' ').length < 3
      grid.style.setProperty('--ov', '0px') /* sin solapes: cada bloque en su sitio */
      for (var pass = 0; pass < 2; pass++) {
        var mr = wrap.getBoundingClientRect(), cx = mr.left + mr.width / 2, cy = mr.top + mr.height / 2, R = mr.width / 2 / scale + 11
        res.querySelectorAll('.ml-grid .ml-card').forEach(function (cd) {
          var r0 = cd.getBoundingClientRect(), r = { width: r0.width / scale, height: r0.height / scale }, lx = (cx - r0.left) / scale, ly = (cy - r0.top) / scale, nx = clamp(lx, 0, r.width), ny = clamp(ly, 0, r.height), left = r0.left + r0.width / 2 < cx
          if (single || cd.classList.contains('ml-sky') || Math.hypot(lx - nx, ly - ny) >= R) { cd.style.webkitMaskImage = cd.style.maskImage = ''; cd.style.paddingLeft = cd.style.paddingRight = ''; cd.style.background = ''; return }
          cd.style.background = 'radial-gradient(circle ' + (R + 2.5) + 'px at ' + lx + 'px ' + ly + 'px, transparent ' + (R - .5) + 'px, transparent ' + (R + .5) + 'px, #5b6bb4 ' + (R + .6) + 'px, #5b6bb4 ' + (R + 2) + 'px, transparent ' + (R + 2.1) + 'px), linear-gradient(120deg,#111a35,#0b1025)'
          var m = 'radial-gradient(circle ' + R + 'px at ' + lx + 'px ' + ly + 'px, transparent ' + (R - .5) + 'px, #000 ' + (R + .5) + 'px)'
          cd.style.webkitMaskImage = m; cd.style.maskImage = m
          var mx = 0; for (var yy = 0; yy <= r.height; yy += 4) { var dy = ly - yy; if (Math.abs(dy) < R) { var half = Math.sqrt(R * R - dy * dy); mx = Math.max(mx, left ? r.width - (lx - half) : lx + half) } }
          cd.style[left ? 'paddingRight' : 'paddingLeft'] = (13 + Math.max(0, mx) + 6) + 'px'; cd.style[left ? 'paddingLeft' : 'paddingRight'] = ''
        })
      }
    }
    /* arrastrar el mapa: se desplaza dentro de la zona de 20 x 20 km; doble clic vuelve al punto */
    function dragMap(cv) {
      var st = null
      cv.addEventListener('pointerdown', function (e) { st = { x: e.clientX, y: e.clientY, ox: ox, oy: oy }; cv.classList.add('drag'); try { cv.setPointerCapture(e.pointerId) } catch (x) { } })
      cv.addEventListener('pointermove', function (e) {
        if (!st) return
        var kx = cv.getBoundingClientRect().width / VIEW, lim = ((GN - 1) * GKM - VIEW) / 2
        ox = clamp(st.ox - (e.clientX - st.x) / kx, -lim, lim); oy = clamp(st.oy + (e.clientY - st.y) / kx, -lim, lim)
        if (!rafM) rafM = requestAnimationFrame(function () { rafM = 0; drawMap() })
      })
      var end = function () { st = null; cv.classList.remove('drag') }
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end)
      cv.addEventListener('dblclick', function () { ox = oy = 0; drawMap() })
    }

    /* ---------- mapa topografico circular ---------- */
    function drawMap() {
      var cv = mapCanvas, d = mapData; if (!cv || !d || !cv.isConnected) return
      var W = Math.max(10, cv.clientWidth), H = Math.max(10, cv.clientHeight), dpr = Math.min(2, window.devicePixelRatio || 1) * Math.max(1, 1 / Math.max(.5, scale))
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr) }
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.fillStyle = '#080c1f'; g.fillRect(0, 0, W, H)
      if (!d.grid) { g.strokeStyle = 'rgba(91,107,180,.25)'; for (var k = 1; k < 8; k++) { g.beginPath(); g.arc(W / 2, H / 2, k * W / 16, 0, 6.283); g.stroke() } return }
      var N = 96, F = [], mn = 1e9, mx = -1e9, c0 = (GN - 1) / 2
      for (var j = 0; j <= N; j++) { var rowA = []; for (var i = 0; i <= N; i++) { var kmX = -VIEW / 2 + VIEW * i / N + ox, kmY = VIEW / 2 - VIEW * j / N + oy; rowA.push(bilinear(d.grid, c0 + kmX / GKM, c0 - kmY / GKM)) } F.push(rowA) }
      for (var it2 = 0; it2 < 3; it2++) { var F2 = F.map(function (a) { return a.slice() }); for (j = 1; j < N; j++) for (i = 1; i < N; i++) F2[j][i] = (F[j][i] * 4 + F[j - 1][i] + F[j + 1][i] + F[j][i - 1] + F[j][i + 1]) / 8; F = F2 }
      F.forEach(function (rw) { rw.forEach(function (v2) { mn = Math.min(mn, v2); mx = Math.max(mx, v2) }) })
      var cw = W / N, ch = H / N
      /* sombreado de relieve (luz del noroeste) */
      for (j = 0; j < N; j++) for (i = 0; i < N; i++) {
        var hv = (F[j][i] - mn) / Math.max(1, mx - mn), sh = clamp(.75 + ((F[j][i] - F[j][i + 1]) + (F[j][i] - F[j + 1][i])) * .012, .45, 1.15)
        g.fillStyle = 'rgb(' + Math.round(lerp(10, 30, hv) * sh) + ',' + Math.round(lerp(15, 40, hv) * sh) + ',' + Math.round(lerp(36, 84, hv) * sh) + ')'; g.fillRect(Math.floor(i * cw), Math.floor(j * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1)
      }
      var span = Math.max(1, mx - mn), steps = [2, 5, 10, 20, 25, 50, 100, 200], step = steps[steps.length - 1]
      for (k = 0; k < steps.length; k++) if (span / steps[k] <= 18) { step = steps[k]; break }
      g.lineCap = 'round'; g.lineJoin = 'round'
      for (var lv = Math.ceil(mn / step) * step; lv <= mx; lv += step) {
        var major = Math.round(lv / step) % 5 === 0
        g.strokeStyle = major ? 'rgba(138,180,255,.9)' : 'rgba(91,107,180,.7)'; g.lineWidth = major ? 1.3 : .8; g.beginPath()
        for (j = 0; j < N; j++) for (i = 0; i < N; i++) {
          var a = F[j][i], b = F[j][i + 1], c2 = F[j + 1][i + 1], dd = F[j + 1][i], code = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c2 > lv ? 2 : 0) | (dd > lv ? 1 : 0)
          if (code === 0 || code === 15) continue
          var x0 = i * cw, y0 = j * ch, f = function (p, q) { return (lv - p) / (q - p) }
          var T1 = [x0 + f(a, b) * cw, y0], R1 = [x0 + cw, y0 + f(b, c2) * ch], B1 = [x0 + f(dd, c2) * cw, y0 + ch], L1 = [x0, y0 + f(a, dd) * ch]
          var seg = function (p, q) { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]) }
          switch (code) { case 1: case 14: seg(L1, B1); break; case 2: case 13: seg(B1, R1); break; case 3: case 12: seg(L1, R1); break; case 4: case 11: seg(T1, R1); break; case 6: case 9: seg(T1, B1); break; case 7: case 8: seg(L1, T1); break; case 5: seg(L1, T1); seg(B1, R1); break; case 10: seg(T1, R1); seg(L1, B1); break }
        }
        g.stroke()
      }
      var kx = W / VIEW, lonK = 111.2 * Math.cos(d.lat * RAD), P = function (la, lo) { return [W / 2 + ((lo - d.lon) * lonK - ox) * kx, H / 2 - ((la - d.lat) * 111.2 - oy) * kx] }
      /* luces cercanas (satelite) como resplandores amarillos */
      if (d.lights && d.lights.length) {
        g.save(); g.globalCompositeOperation = 'lighter'
        d.lights.forEach(function (l) { var p = P(l[0], l[1]); if (p[0] < -20 || p[1] < -20 || p[0] > W + 20 || p[1] > H + 20) return; var rr = 3 + l[2] / 255 * 12, gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr); gr.addColorStop(0, 'rgba(248,216,116,' + (l[2] / 255 * .55) + ')'); gr.addColorStop(1, 'rgba(248,216,116,0)'); g.fillStyle = gr; g.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2) })
        g.restore()
      }
      /* caminos de OpenStreetMap */
      if (d.ways && d.ways.length) {
        d.ways.forEach(function (w) {
          var tp = w.tags.highway, maj = /motorway|trunk|primary|secondary/.test(tp), trk = tp === 'track' || tp === 'path'
          g.strokeStyle = maj ? 'rgba(248,216,116,.6)' : trk ? 'rgba(200,190,165,.55)' : 'rgba(185,201,255,.5)'; g.lineWidth = maj ? 1.8 : 1; g.setLineDash(trk ? [3, 3] : []); g.beginPath()
          ;(w.geometry || []).forEach(function (p2, k2) { var q = P(p2.lat, p2.lon); k2 ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]) })
          g.stroke()
        })
        g.setLineDash([])
      }
      /* tu punto: estrella amarilla con halo */
      var pt = P(d.lat, d.lon), cx = pt[0], cy = pt[1], gl = g.createRadialGradient(cx, cy, 0, cx, cy, 26); gl.addColorStop(0, 'rgba(248,216,116,.55)'); gl.addColorStop(1, 'rgba(248,216,116,0)'); g.fillStyle = gl; g.fillRect(cx - 26, cy - 26, 52, 52)
      g.fillStyle = Y; g.beginPath(); for (var p3 = 0; p3 < 8; p3++) { var rr2 = p3 % 2 ? 3.2 : 9, an = p3 * Math.PI / 4 - Math.PI / 2; g.lineTo(cx + Math.cos(an) * rr2, cy + Math.sin(an) * rr2) } g.closePath(); g.fill()
      g.strokeStyle = 'rgba(248,216,116,.5)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 14, 0, 6.283); g.stroke()
      /* escala, norte y rango de alturas dentro del circulo */
      var sx0 = W / 2 - kx / 2, sy0 = H * .86
      g.strokeStyle = 'rgba(238,241,255,.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(sx0 + kx, sy0); g.moveTo(sx0, sy0 - 4); g.lineTo(sx0, sy0 + 4); g.moveTo(sx0 + kx, sy0 - 4); g.lineTo(sx0 + kx, sy0 + 4); g.stroke()
      g.font = '400 11px ' + SERIF; g.textAlign = 'center'; g.fillStyle = 'rgba(238,241,255,.9)'; g.fillText('1 km', W / 2, sy0 - 7)
      g.fillStyle = 'rgba(143,152,192,.95)'; g.font = '400 10px ' + SERIF; g.fillText(Math.round(mn) + '–' + Math.round(mx) + ' m · ' + step + ' m', W / 2, H * .93)
      g.save(); g.translate(W / 2, H * .085); g.strokeStyle = 'rgba(238,241,255,.85)'; g.beginPath(); g.moveTo(0, 10); g.lineTo(0, -6); g.stroke(); g.fillStyle = Y; g.beginPath(); g.moveTo(0, -12); g.lineTo(4, -4); g.lineTo(-4, -4); g.closePath(); g.fill(); g.fillStyle = 'rgba(238,241,255,.9)'; g.fillText('N', 10, 4); g.restore(); g.textAlign = 'left'
    }

    texts()
    var onLang = function () { texts() }
    window.addEventListener('vc-lang', onLang)
    return { destroy: function () { dead = true; run++; if (ro) ro.disconnect(); window.removeEventListener('vc-lang', onLang) } }
  }
  window.vcMiLugar = { mount: mount }
})()
