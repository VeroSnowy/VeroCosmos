---
name: nueva-ficha
description: Crear, actualizar o revisar la ficha de un objeto astronómico de Vero Cosmos (fichas.json + traducciones EN/FR) a partir de su nombre. Úsala cuando Vero pida "hazme la ficha de M31", "añade NGC 7000 al atlas" o "actualiza la ficha de M42".
---

# Nueva ficha de Vero Cosmos

Objetivo: con solo el nombre de un objeto (p. ej. "M31" o "NGC 7000"), dejar su ficha lista en los tres idiomas
usando los scripts del repo, sin editar JSON a mano. Lee antes el `CLAUDE.md` del repo.

## Qué texto sale en cada sitio (regla de la web)
| Dónde | Texto |
|---|---|
| Previsualización al pasar el ratón (escritorio) | `description` del frontmatter de la nota (se corta a ~320 caracteres) |
| Panel lateral al hacer clic | Primer párrafo del cuerpo de la nota |
| Ficha completa | Todos los párrafos del cuerpo + `facts`, `cats` y `trivia` de `fichas.json` |

Se ignoran los párrafos que solo tienen enlaces (`[[Catálogo Messier]]`) y los idénticos a la `description`.
La foto mostrada es la de fecha más reciente en el nombre (`M_42_S50_2026-10-24.jpg`).

Así que una buena nota tiene: `description` de 1–3 frases que se entiendan solas (gancho para la previsualización),
un primer párrafo completo pero autónomo (panel) y, si se quiere, más párrafos para la ficha completa.

## Requisitos
- Los scripts leen la ruta del vault desde `../publicar.ps1`, así que solo funcionan en el ordenador de Vero.
  Si no existe (entorno en la nube), preparar la plantilla y las traducciones igualmente, dejarlas en una pull
  request y decirle qué comandos ejecutar.
- La nota del objeto y su foto deben existir en el vault. Si no existen, ofrecer redactar la nota (description +
  párrafos, con el estilo de las notas existentes) para que Vero la revise y la añada a Obsidian.

## Pasos
1. **Leer la nota** (`Catálogos/<catálogo>/descripciones/<ID>/<ID> - <Nombre>.md`) y una o dos notas existentes
   como referencia de estilo.
2. **Contrastar los datos** con fuentes fiables (SIMBAD, NASA/IPAC NED, SEDS Messier; Wikipedia como apoyo):
   ascensión recta y declinación (J2000), magnitud aparente, distancia, tamaño, tipo y constelación.
   Si la nota y las fuentes no coinciden, avisar a Vero en vez de elegir en silencio. Preferir valores recientes
   (paralajes VLBI/Gaia, TRGB) a valores antiguos.
3. **Rellenar una copia de `tools/plantilla-ficha.md`** (p. ej. `tools/ficha-<id>.md`):
   - `Nombre:` con formato `M42 · Nebulosa de Orión`.
   - `Modelo:` `nebulosa`, `galaxia` o `globular`. Preguntar si el objeto no encaja (cúmulo abierto, planeta…).
   - Datos: `5h 35m 17s`, `−5° 23′ 28″` (signo menos real y primas), decimales con coma (`+4,0`), miles con punto
     (`22.200 años luz`).
   - Etiquetas: tipo, catálogo(s), `Constelación de …` y visibilidad (simple vista / prismáticos / telescopio).
   - Mínimo 3 curiosidades: cortas, divulgativas, comprobadas, para quien empieza desde cero.
   - Otros objetos cercanos o relacionados, enlazando la nota del vault si existe.
4. **Ensayar:** `node tools/nueva-ficha.mjs tools/ficha-<id>.md --simular`. `--reemplazar` solo si Vero quiere
   sustituir una ficha existente.
5. **Generar:** el mismo comando sin `--simular` (crea la entrada en `fichas.json`, sube la versión del atlas y
   escribe `tools/pendientes-traduccion.json`).
6. **Traducir** los pendientes al inglés y al francés:
   - Nombres habituales en cada idioma (Orion Nebula / Nébuleuse d'Orion; Hercules / Hercule).
   - Inglés: `+4.0`, `22,200 light-years`. Francés: `+4,0`, `22 200 années-lumière`.
   - Mirar en `quartz/static/vc-i18n.js` cómo se tradujeron términos parecidos, para ser coherentes.
7. **Traducir también la nota.** `nueva-ficha.mjs` NO incluye la `description` ni los párrafos de la nota en los
   pendientes. Añadirlos a mano a `DICT.en` y `DICT.fr` de `vc-i18n.js`:
   - La clave es el texto tal como lo muestra la web: Quartz convierte las comillas rectas `"…"` en tipográficas
     `“…”`, así que la clave debe llevar `“ ”` aunque la nota tenga `"`. Los espacios múltiples se reducen a uno.
   - Subir el `?v=` de `vc-i18n.js` en todos los HTML que lo cargan (ver `CLAUDE.md`).
8. **Comprobar:** `node tools/nueva-ficha.mjs --aplicar` y luego `node tools/auditar-traducciones.mjs`.
9. **Resumir a Vero** en pocas líneas: objeto, versión nueva del atlas, datos dudosos y recordarle que publique
   con `publicar.ps1`. Commit en español: `Ficha de <ID> · <Nombre> (atlas X.Y.Z)`.

## Revisar fichas existentes
Si Vero pide revisar fichas: comprobar que la `description` y cada párrafo de cada nota estén en `DICT.en` y
`DICT.fr` (con la regla de las comillas), y contrastar los datos de `fichas.json` con las fuentes. Proponer los
cambios de datos antes de aplicarlos: los textos de las notas viven en el vault y son de Vero.
