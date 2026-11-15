/* Vero Cosmos: calendario automatico de lluvias de estrellas
   Cada lluvia tiene su maximo cuando el Sol alcanza la misma longitud ecliptica (longitud solar, J2000),
   asi que la fecha y la hora del maximo se calculan cada ano sin depender de nadie.
   Datos de la lista de trabajo de la IMO (Organizacion Internacional de Meteoros): imo.net, Meteor Shower Calendar.
   Funciona en el navegador (window.vcLluvias) y en node (tools/lluvias.mjs, para la revision semanal). */
(function (root) {
  'use strict'
  /* lon: longitud solar del maximo (grados, J2000) · zhr: meteoros por hora en condiciones ideales
     rad: constelacion del radiante · v: velocidad (km/s) · padre: cuerpo del que vienen · act: periodo de actividad
     noche: la mejor hora (madrugada) · sur: si se ven mejor desde el hemisferio sur (ETA: pocos desde Espana) */
  /* lon: longitud solar del maximo (grados, J2000) · zhr: meteoros por hora en condiciones ideales · v: velocidad (km/s)
     act: periodo de actividad (mes-dia) · rad: constelacion del radiante (con su preposicion) · padre: de donde vienen
     hora: la mejor hora para verlas · sur: desde Espana se ven pocas (radiante bajo) */
  var MAD = { es: 'Lo mejor es a partir de medianoche, cuando el radiante está más alto.', en: 'Best after midnight, when the radiant is highest.', fr: 'Le mieux est après minuit, quand le radiant est le plus haut.' }
  var HALLEY = { es: 'el cometa Halley', en: 'Halley’s Comet', fr: 'la comète de Halley' }
  var LISTA = [
    { id: 'cuadrantidas', lon: 283.15, zhr: 80, v: 41, act: ['12-28', '01-12'], nom: { es: 'Cuadrántidas', en: 'Quadrantids', fr: 'Quadrantides' },
      rad: { es: 'del Boyero', en: 'Boötes', fr: 'du Bouvier' }, padre: { es: 'el asteroide 2003 EH1, que podría ser un cometa apagado', en: 'asteroid 2003 EH1, possibly an extinct comet', fr: 'l’astéroïde 2003 EH1, peut-être une comète éteinte' },
      hora: { es: 'Lo mejor es la madrugada, cuando el radiante está más alto.', en: 'Best in the early morning hours, when the radiant is highest.', fr: 'Le mieux est en fin de nuit, quand le radiant est le plus haut.' } },
    { id: 'liridas', lon: 32.32, zhr: 18, v: 49, act: ['04-14', '04-30'], nom: { es: 'Líridas', en: 'Lyrids', fr: 'Lyrides' },
      rad: { es: 'de Lira', en: 'Lyra', fr: 'de la Lyre' }, padre: { es: 'el cometa Thatcher (C/1861 G1)', en: 'Comet Thatcher (C/1861 G1)', fr: 'la comète Thatcher (C/1861 G1)' }, hora: MAD },
    { id: 'eta-acuaridas', lon: 45.5, zhr: 50, v: 66, act: ['04-19', '05-28'], sur: true, nom: { es: 'Eta Acuáridas', en: 'Eta Aquariids', fr: 'Êta Aquarides' },
      rad: { es: 'de Acuario', en: 'Aquarius', fr: 'du Verseau' }, padre: HALLEY,
      hora: { es: 'Solo en la última hora antes del amanecer, mirando hacia el este.', en: 'Only in the last hour before dawn, looking east.', fr: 'Seulement dans la dernière heure avant l’aube, en regardant vers l’est.' } },
    { id: 'perseidas', lon: 140.0, zhr: 100, v: 59, act: ['07-17', '08-24'], nom: { es: 'Perseidas', en: 'Perseids', fr: 'Perséides' },
      rad: { es: 'de Perseo', en: 'Perseus', fr: 'de Persée' }, padre: { es: 'el cometa 109P/Swift-Tuttle', en: 'Comet 109P/Swift-Tuttle', fr: 'la comète 109P/Swift-Tuttle' }, hora: MAD },
    { id: 'orionidas', lon: 208, zhr: 20, v: 66, act: ['10-02', '11-07'], nom: { es: 'Oriónidas', en: 'Orionids', fr: 'Orionides' },
      rad: { es: 'de Orión', en: 'Orion', fr: 'd’Orion' }, padre: HALLEY, hora: MAD },
    { id: 'leonidas', lon: 235.27, zhr: 15, v: 71, act: ['11-06', '11-30'], nom: { es: 'Leónidas', en: 'Leonids', fr: 'Léonides' },
      rad: { es: 'de Leo', en: 'Leo', fr: 'du Lion' }, padre: { es: 'el cometa 55P/Tempel-Tuttle', en: 'Comet 55P/Tempel-Tuttle', fr: 'la comète 55P/Tempel-Tuttle' }, hora: MAD },
    { id: 'geminidas', lon: 262.2, zhr: 150, v: 35, act: ['12-04', '12-20'], nom: { es: 'Gemínidas', en: 'Geminids', fr: 'Géminides' },
      rad: { es: 'de Géminis', en: 'Gemini', fr: 'des Gémeaux' }, padre: { es: 'el asteroide (3200) Faetón', en: 'asteroid (3200) Phaethon', fr: 'l’astéroïde (3200) Phaéton' },
      hora: { es: 'Se ven toda la noche; lo mejor, hacia las 2 de la madrugada.', en: 'Visible all night; best around 2 a.m.', fr: 'Visibles toute la nuit ; le mieux vers 2 h du matin.' } }
  ]
  /* dibujos de las constelaciones de los radiantes (generados con tools/constelaciones-lluvias.mjs desde tools/data/cielo.json; caja 120x90) */
  var CONST = {"cuadrantidas":{"c":"Boo","d":"M78.9 74.8L75.9 72.9L67.3 71.4L60.7 49.7L60.6 34.3L48.4 30.2L42.9 44L55.4 56.1L67.3 71.4L56.9 82M60.6 34.3L67 19.2L68.2 8.1L63.4 8L67 19.2","s":[[67.3,71.4,2.6],[55.4,56.1,1.5],[75.9,72.9,1.4],[60.6,34.3,1.3],[48.4,30.2,1],[42.9,44,1],[60.7,49.7,1],[56.9,82,0.9],[63.4,8,0.8],[67,19.2,0.8]],"r":[41.1,13.5]},"liridas":{"c":"Lyr","d":"M34.9 31.3L35.6 12.6L49.7 20.3L34.9 31.3L16.4 38L8 77.4L24.8 71.2L34.9 31.3","s":[[49.7,20.3,2.6],[8,77.4,1.1],[24.8,71.2,1],[16.4,38,0.8],[34.9,31.3,0.8],[35.6,12.6,0.8]],"r":[112,65.2]},"eta-acuaridas":{"c":"Aqr","d":"M112 44L109 42.8L85.8 34.5L65.3 21.8L55.9 24.4L51.6 21L47.7 21.3L37.4 39.4L22.2 43.3L27.3 72.4M85.8 34.5L64.9 54.6M65.3 21.8L58.7 39.9M51.6 21L53.7 17.6M19.2 69.8L22.2 43.3L8 64.2","s":[[85.8,34.5,1.3],[65.3,21.8,1.3],[51.6,21,1],[37.4,39.4,0.9],[27.3,72.4,0.9],[112,44,0.9],[55.9,24.4,0.8],[47.7,21.3,0.8],[19.2,69.8,0.8],[58.7,39.9,0.8]],"r":[49.7,23.4]},"perseidas":{"c":"Per","d":"M37.4 80.8L32.5 82L30.1 70.9L30.6 59L37 51.7L38.1 36.9L41.3 35.8L47.4 31.1L57.2 20.7L64.3 13.9L62.5 22.8L55.1 31.8L54.9 45.2L55.5 56.3L54 60.1L57.1 62.3L60.3 60L59.8 56.1L55.5 56.3M26.2 29.7L22.1 35.2L25.2 37.2L38.1 36.9M55.1 31.8L67.6 32.8L97.9 28.7","s":[[47.4,31.1,1.8],[55.5,56.3,1.7],[32.5,82,1.3],[30.6,59,1.3],[57.2,20.7,1.3],[38.1,36.9,1.3],[57.1,62.3,1.1],[37.4,80.8,0.9],[37,51.7,0.9],[64.3,13.9,0.9]],"r":[53.6,8]},"orionidas":{"c":"Ori","d":"M39.9 21.6L48 8L42.2 8.3L37.2 23L43.1 34.3L47.6 39.8L66 42.4L84.6 33M82.4 53.9L85 52.1L86.9 44.2L87.7 40.9L87.3 36.1L84.6 33L83.7 24.7L78.7 20.1L75.5 19.6M72.5 78.4L66.4 64L61.8 58.8L66 42.4L59.9 33.6L47.6 39.8L56.4 62.9L52.1 82M56.4 62.9L59.2 61.1L61.8 58.8","s":[[72.5,78.4,2.5],[47.6,39.8,2.4],[66,42.4,1.9],[56.4,62.9,1.8],[59.2,61.1,1.8],[52.1,82,1.7],[61.8,58.8,1.6],[87.7,40.9,1.2],[66.4,64,1.1],[59.9,33.6,1.1]],"r":[32.3,18.6]},"leonidas":{"c":"Leo","d":"M93 70.1L93.9 53L83.2 42L37.5 39.5L8 60.8L37.4 57.7L93 70.1M83.2 42L86 29.2L106.2 19.9L112 27.9","s":[[93,70.1,2],[83.2,42,1.7],[8,60.8,1.7],[37.5,39.5,1.4],[112,27.9,1.3],[37.4,57.7,1.1],[86,29.2,1.1],[93.9,53,1],[106.2,19.9,0.8]],"r":[93.3,34.3]},"geminidas":{"c":"Gem","d":"M98.3 46.6L91.5 46.6L73.7 37L50.7 18.1L30.8 12.1L21.7 26.3L29.6 30.5L43 48.6L56.6 53.8L79 69.1L72.6 82M43 48.6L44.8 68.6","s":[[21.7,26.3,2.1],[30.8,12.1,1.9],[79,69.1,1.7],[91.5,46.6,1.3],[73.7,37,1.2],[98.3,46.6,1.1],[72.6,82,1.1],[43,48.6,1],[44.8,68.6,1],[56.6,53.8,0.8]],"r":[36.4,8]}}
  var D2R = Math.PI / 180
  function norm(a) { a %= 360; return a < 0 ? a + 360 : a }
  /* longitud aparente del Sol referida al equinoccio J2000 (Meeus, cap. 25; error < 0,01 grados) */
  function solarLon(ms) {
    var jd = ms / 864e5 + 2440587.5, T = (jd - 2451545) / 36525
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * D2R) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * D2R) + 0.000289 * Math.sin(3 * M * D2R)
    var lon = L0 + C
    /* de equinoccio de la fecha a J2000 (precesion) */
    lon -= 1.396971 * T + 0.0003086 * T * T
    return norm(lon)
  }
  /* instante (ms, UT) en que el Sol llega a la longitud "lon" cerca del dia "aprox" */
  function whenLon(lon, aprox) {
    var t = aprox
    for (var i = 0; i < 8; i++) {
      var d = norm(lon - solarLon(t) + 180) - 180
      t += d / 0.98565 * 864e5
      if (Math.abs(d) < 1e-6) break
    }
    return t
  }
  /* fraccion iluminada de la Luna (0-1) en un instante (aproximacion de Meeus, suficiente para "molesta o no") */
  function moonIllum(ms) {
    var jd = ms / 864e5 + 2440587.5, T = (jd - 2451545) / 36525
    var D = norm(297.8501921 + 445267.1114034 * T), M = norm(357.5291092 + 35999.0502909 * T), Mp = norm(134.9633964 + 477198.8675055 * T)
    var i = 180 - D - 6.289 * Math.sin(Mp * D2R) + 2.1 * Math.sin(M * D2R) - 1.274 * Math.sin((2 * D - Mp) * D2R) - 0.658 * Math.sin(2 * D * D2R) - 0.214 * Math.sin(2 * Mp * D2R) - 0.11 * Math.sin(D * D2R)
    return (1 + Math.cos(i * D2R)) / 2
  }
  /* hora local peninsular (Europe/Madrid) de un instante: {y, m, d, h} */
  function madrid(ms) {
    var p = {}
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value })
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour }
  }
  /* instante de una hora local peninsular concreta */
  function atMadrid(y, m, d, h) {
    /* la hora peninsular es UT+1 (invierno) o UT+2 (verano): se prueba la que encaja */
    for (var off = 1; off <= 2; off++) { var t = Date.UTC(y, m - 1, d, h - off), q = madrid(t); if (q.h === h && q.d === d) return t }
    return Date.UTC(y, m - 1, d, h - 1)
  }
  /* las lluvias de un ano: maximo (UT), la noche en que mejor se ve (de 22:00 a 07:00, hora peninsular) y la Luna */
  function ofYear(y) {
    return LISTA.map(function (s) {
      /* dia aproximado: se busca la longitud alrededor del 1 de su mes de actividad */
      var mm = +s.act[0].slice(0, 2), aprox = Date.UTC(s.id === 'cuadrantidas' ? y : y, s.id === 'cuadrantidas' ? 0 : mm - 1, s.id === 'cuadrantidas' ? 3 : 15)
      var peak = whenLon(s.lon, aprox)
      var lp = madrid(peak)
      /* si el maximo cae de dia o por la tarde (antes de las 12), cuenta la noche anterior; si no, la que empieza ese dia */
      var night = new Date(Date.UTC(lp.y, lp.m - 1, lp.d))
      if (lp.h < 12) night = new Date(night.getTime() - 864e5)
      var ny = night.getUTCFullYear(), nm = night.getUTCMonth() + 1, nd = night.getUTCDate()
      var next = new Date(night.getTime() + 864e5)
      var ini = atMadrid(ny, nm, nd, 22), fin = atMadrid(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 7)
      var moon = moonIllum(ini + 3 * 36e5)
      return { id: s.id + '-' + ny, base: s, year: ny, peak: peak, inicio: ini, fin: fin, moon: moon }
    })
  }

  /* ---------- textos de la entrada automatica (es/en/fr) ---------- */
  var LOC = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR' }
  function dm(ms, l) { return new Intl.DateTimeFormat(LOC[l], { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long' }).format(new Date(ms)) }
  function dOnly(ms) { return +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', day: 'numeric' }).format(new Date(ms)) }
  function sameMonth(a, b) { var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', month: 'numeric' }); return f.format(new Date(a)) === f.format(new Date(b)) }
  /* "17 al 18 de noviembre" / "17–18 November" / "17 au 18 novembre" */
  function nightTxt(r, l) {
    var a = r.inicio, b = r.fin
    if (sameMonth(a, b)) {
      if (l === 'es') return dOnly(a) + ' al ' + dm(b, 'es')
      if (l === 'en') return dOnly(a) + '–' + dm(b, 'en')
      return dOnly(a) + ' au ' + dm(b, 'fr')
    }
    if (l === 'es') return dm(a, 'es') + ' al ' + dm(b, 'es')
    if (l === 'en') return dm(a, 'en') + '–' + dm(b, 'en')
    return dm(a, 'fr') + ' au ' + dm(b, 'fr')
  }
  function actMs(y, md, endOfRange, peak) {
    var m = +md.slice(0, 2), d = +md.slice(3)
    var t = Date.UTC(y, m - 1, d, 12)
    /* el periodo puede cruzar el ano (Cuadrantidas: 28 dic - 12 ene) */
    if (!endOfRange && t > peak) t = Date.UTC(y - 1, m - 1, d, 12)
    if (endOfRange && t < peak) t = Date.UTC(y + 1, m - 1, d, 12)
    return t
  }
  function lunaTxt(m, l) {
    var p = Math.round(m * 100)
    if (m < 0.25) return { es: ', y este año la Luna apenas molesta', en: ', and this year the Moon barely gets in the way', fr: ', et cette année la Lune gêne à peine' }[l]
    if (m < 0.6) return { es: ', aunque la Luna (iluminada al ' + p + ' %) quitará algunos de los más débiles', en: ', although the Moon (' + p + '% lit) will hide some of the fainter ones', fr: ', même si la Lune (éclairée à ' + p + ' %) masquera certains des plus faibles' }[l]
    return { es: ', aunque este año la Luna, muy iluminada (' + p + ' %), dejará ver solo los más brillantes', en: ', although this year the very bright Moon (' + p + '% lit) will only let the brightest ones through', fr: ', même si cette année la Lune très lumineuse (éclairée à ' + p + ' %) ne laissera voir que les plus brillants' }[l]
  }
  function tri(fn) { return { es: fn('es'), en: fn('en'), fr: fn('fr') } }
  function iso(ms) {
    var p = {}
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset' }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value })
    var off = (p.timeZoneName || 'GMT+01:00').replace('GMT', '') || '+00:00'
    return p.year + '-' + p.month + '-' + p.day + 'T' + p.hour + ':' + p.minute + ':00' + off
  }
  function day(ms) { return iso(ms).slice(0, 10) }
  /* una entrada de la Bitacora para una lluvia de un ano */
  function entry(r) {
    var s = r.base, y = r.year
    var a = actMs(y, s.act[0], false, r.peak), b = actMs(y, s.act[1], true, r.peak)
    return {
      id: r.id, tipo: 'evento', auto: true, lluvia: s.id,
      /* sale en la Bitacora 10 dias antes */
      fecha: day(r.inicio - 10 * 864e5), inicio: iso(r.inicio), fin: iso(r.fin),
      t: tri(function (l) { return s.nom[l] + ' ' + y }),
      hora: s.hora,
      d: tri(function (l) {
        var n = nightTxt(r, l), z = s.zhr, m = lunaTxt(r.moon, l)
        if (l === 'es') return 'Las ' + s.nom.es + ' tienen su máximo la noche del ' + n + '. Con cielo oscuro se pueden ver hasta unos ' + z + ' meteoros por hora' + m + '.' + (s.sur ? ' Desde España se ven menos, porque su radiante sube poco antes de que amanezca.' : '')
        if (l === 'en') return 'The ' + s.nom.en + ' peak on the night of ' + n + '. Under dark skies you can see up to about ' + z + ' meteors per hour' + m + '.' + (s.sur ? ' From Spain you see fewer, because the radiant only rises shortly before dawn.' : '')
        return 'Les ' + s.nom.fr + ' atteignent leur maximum la nuit du ' + n + '. Sous un ciel sombre, on peut voir jusqu’à environ ' + z + ' météores par heure' + m + '.' + (s.sur ? ' Depuis l’Espagne, on en voit moins, car le radiant ne se lève que peu avant l’aube.' : '')
      }),
      p: [
        tri(function (l) {
          if (l === 'es') return 'Los meteoros parecen salir de la constelación ' + s.rad.es + ' y son restos que dejó ' + s.padre.es + '. Entran en la atmósfera a unos ' + s.v + ' km/s.'
          if (l === 'en') return 'The meteors seem to come from the constellation ' + s.rad.en + ' and are debris left behind by ' + s.padre.en + '. They enter the atmosphere at about ' + s.v + ' km/s.'
          return 'Les météores semblent provenir de la constellation ' + s.rad.fr + ' et sont des débris laissés par ' + s.padre.fr + '. Ils entrent dans l’atmosphère à environ ' + s.v + ' km/s.'
        }),
        tri(function (l) {
          if (l === 'es') return 'Para verlas no hace falta telescopio: busca un sitio oscuro, túmbate y mira a una zona amplia del cielo (no hace falta mirar justo al radiante). ' + s.hora.es + ' Deja que tus ojos se acostumbren a la oscuridad unos 20 minutos.'
          if (l === 'en') return 'No telescope needed: find a dark spot, lie back and look at a wide area of the sky (you don’t need to look right at the radiant). ' + s.hora.en + ' Let your eyes adapt to the dark for about 20 minutes.'
          return 'Pas besoin de télescope : trouvez un endroit sombre, allongez-vous et regardez une grande zone du ciel (inutile de fixer le radiant). ' + s.hora.fr + ' Laissez vos yeux s’habituer à l’obscurité une vingtaine de minutes.'
        }),
        tri(function (l) {
          var sm = sameMonth(a, b)
          if (l === 'es') return 'Están activas del ' + (sm ? dOnly(a) : dm(a, 'es')) + ' al ' + dm(b, 'es') + ', así que en las noches de alrededor del máximo también puedes ver alguna.'
          if (l === 'en') return 'They are active from ' + (sm ? dOnly(a) : dm(a, 'en')) + ' to ' + dm(b, 'en') + ', so you may also catch some on the nights around the peak.'
          return 'Elles sont actives du ' + (sm ? dOnly(a) : dm(a, 'fr')) + ' au ' + dm(b, 'fr') + ' : vous pourrez aussi en voir quelques-unes les nuits autour du maximum.'
        }),
        tri(function (l) {
          return { es: '*Fechas y Luna calculadas por Vero Cosmos con los datos de la Organización Internacional de Meteoros (IMO).*', en: '*Dates and Moon calculated by Vero Cosmos from International Meteor Organization (IMO) data.*', fr: '*Dates et Lune calculées par Vero Cosmos à partir des données de l’Organisation internationale des météores (IMO).*' }[l]
        })
      ],
      fuente: 'https://www.imo.net/'
    }
  }
  /* entradas automaticas para la Bitacora: las del ultimo ano (pasadas) y las del proximo */
  function items(now) {
    now = now || Date.now()
    var y = new Date(now).getUTCFullYear(), out = []
    ;[y - 1, y, y + 1].forEach(function (yy) {
      ofYear(yy).forEach(function (r) { if (r.fin > now - 330 * 864e5 && r.inicio < now + 366 * 864e5) out.push(entry(r)) })
    })
    return out
  }
  /* color de cada lluvia (cuenta atras de la Bitacora) */
  var COLOR = { cuadrantidas: '#b9a2ff', liridas: '#ff9fc9', 'eta-acuaridas': '#62e2d2', perseidas: '#74e6ad', orionidas: '#ff8d5e', leonidas: '#f8c45c', geminidas: '#a6d8ff' }
  /* estilo de una lluvia: color, dibujo de la constelacion (SVG) y posicion del radiante (en % de la caja) */
  function style(id) {
    var c = CONST[id]; if (!c) return null
    var svg = '<svg viewBox="0 0 120 90" aria-hidden="true"><path d="' + c.d + '" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      c.s.map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#fff" opacity=".85"/>' }).join('') +
      '<circle cx="' + c.r[0] + '" cy="' + c.r[1] + '" r="5" fill="currentColor" opacity=".25"/><circle cx="' + c.r[0] + '" cy="' + c.r[1] + '" r="2.2" fill="currentColor"/></svg>'
    return { color: COLOR[id], svg: svg, rx: c.r[0] / 120 * 100, ry: c.r[1] / 90 * 100 }
  }
  var api = { LISTA: LISTA, ofYear: ofYear, items: items, style: style, solarLon: solarLon, whenLon: whenLon, moonIllum: moonIllum }
  root.vcLluvias = api
})(typeof window !== 'undefined' ? window : this)
