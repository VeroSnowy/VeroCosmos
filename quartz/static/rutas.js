/*
 * Rutas de la web por idioma (window.vcRutas). Lo usan el atlas, la Bitacora, las fichas, vc-i18n y,
 * desde Node, tools/idiomas.mjs (que genera las paginas en ingles y frances despues de "npx quartz build").
 *  - Espanol sin prefijo; ingles en /en/ y frances en /fr/, con los nombres traducidos.
 *  - Las fichas de los objetos cuelgan del atlas y las entradas de la Bitacora de la Bitacora:
 *      /atlas-astrofotografico/m42-nebulosa-de-orion   /en/astrophotography-atlas/m42-orion-nebula
 *      /bitacora-del-cielo/leonidas-2026               /en/sky-log/leonids-2026
 *  - El idioma de una pagina lo decide su direccion.
 */
;(function (root) {
  var LANGS = ['es', 'en', 'fr']
  var PAGES = {
    principal: { es: '', en: 'en', fr: 'fr' },
    atlas: { es: 'atlas-astrofotografico', en: 'en/astrophotography-atlas', fr: 'fr/atlas-astrophotographique' },
    guide: { es: 'guia-astronomica', en: 'en/astronomy-guide', fr: 'fr/guide-astronomique' },
    lugar: { es: 'guia-astronomica/lugar-para-observar', en: 'en/astronomy-guide/observing-site', fr: 'fr/guide-astronomique/lieu-d-observation' },
    log: { es: 'bitacora-del-cielo', en: 'en/sky-log', fr: 'fr/journal-du-ciel' },
    about: { es: 'quienes-somos', en: 'en/about-us', fr: 'fr/qui-sommes-nous' }
  }
  /* de mas largo a mas corto, para que "lugar" gane a "guide" */
  var ORDER = Object.keys(PAGES).sort(function (a, b) { return PAGES[b].es.length - PAGES[a].es.length })

  /* nombre -> trozo de URL: sin tildes, en minusculas, con guiones */
  function slug(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[’'·]/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
  /* direccion de una pagina (con "/" delante; la portada acaba en "/") */
  function path(key, lang, rest) {
    var p = (PAGES[key] || PAGES.principal)[lang] || PAGES[key].es
    if (rest) return '/' + (p ? p + '/' : '') + rest
    return p ? '/' + p + (key === 'principal' ? '/' : '') : '/'
  }
  function clean(p) {
    try { p = decodeURIComponent(p) } catch (e) { }
    return String(p || '').replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '')
  }
  /* direccion -> { lang, key, rest } (rest: la entrada o la ficha, si la hay) */
  function parse(p) {
    var c = clean(p), lang = /^(en|fr)(\/|$)/.test(c) ? c.slice(0, 2) : 'es'
    for (var i = 0; i < ORDER.length; i++) {
      var k = ORDER[i], b = PAGES[k][lang]
      if (k === 'principal') continue
      if (c === b) return { lang: lang, key: k, rest: '' }
      if ((k === 'atlas' || k === 'log') && c.indexOf(b + '/') === 0) return { lang: lang, key: k, rest: c.slice(b.length + 1) }
    }
    if (c === PAGES.principal[lang]) return { lang: lang, key: 'principal', rest: '' }
    return { lang: lang, key: null, rest: c }
  }
  /* las tres direcciones de una pagina: { es, en, fr } */
  function alts(key, rests) {
    var o = {}
    LANGS.forEach(function (l) { o[l] = path(key, l, rests ? rests[l] : '') })
    return o
  }
  /* entradas de la Bitacora: trozo de URL de cada una en los tres idiomas (espanol: su id; ingles y frances: su titulo).
     Si dos coinciden en un idioma, la segunda lleva "-2" */
  function entryRests(items) {
    var out = {}, seen = { es: {}, en: {}, fr: {} }
    ;(items || []).forEach(function (it) {
      var r = {}
      LANGS.forEach(function (l) {
        var t = it.t && (it.t[l] || it.t.es), b = l === 'es' ? slug(it.id) : slug(t) || slug(it.id), s = b, n = 1
        while (seen[l][s]) s = b + '-' + (++n)
        seen[l][s] = 1; r[l] = s
      })
      out[it.id] = r
    })
    return out
  }
  /* en el navegador: pone en la cabecera de la pagina los enlaces a sus versiones (hreflang) y su direccion canonica */
  function setAlts(doc, a) {
    var o = (doc.location && doc.location.origin) || 'https://verocosmos.com', h = doc.head
    function link(rel, hl, href) {
      var sel = 'link[rel="' + rel + '"]' + (hl ? '[hreflang="' + hl + '"]' : ''), l = h.querySelector(sel)
      if (!l) { l = doc.createElement('link'); l.rel = rel; if (hl) l.hreflang = hl; h.appendChild(l) }
      l.href = o + href
    }
    LANGS.forEach(function (l) { link('alternate', l, a[l]) })
    link('alternate', 'x-default', a.es)
    var cur = parse(doc.location.pathname).lang
    link('canonical', '', a[cur])
  }
  root.vcRutas = { LANGS: LANGS, PAGES: PAGES, slug: slug, path: path, parse: parse, clean: clean, alts: alts, entryRests: entryRests, setAlts: setAlts }
})(typeof window !== 'undefined' ? window : this)
