# Vero Cosmos — guía para Claude

Web astronómica de Vero Snowy: atlas astrofotográfico interactivo en 3D y Guía Astronómica para quien empieza desde cero.
Publicada en https://verocosmos.com (GitHub Pages, despliegue automático al hacer push a `main`).
Idiomas: español (por defecto), inglés y francés. Responde a Vero siempre en español.

## Arquitectura (léela antes de tocar nada)

- **Base:** Quartz v5 (`quartz/`, `quartz.config.yaml`). Casi todo lo propio NO es Quartz: es HTML/JS estático en `quartz/static/`.
- **`content/`** son las notas de Obsidian. Las páginas principales (`index.md`, `atlas-astrofotografico.md`,
  `guia-astronomica.md`, `quienes-somos.md`) son solo un `<iframe>` a pantalla completa hacia
  `static/VeroCosmos_X.Y.Z.html` + un bloque de texto/JSON-LD para SEO. No meter lógica ahí.
- **El vault de Obsidian vive fuera del repo.** Su ruta se lee de `../publicar.ps1` (variable `$vault`), y
  `publicar.ps1` es lo que sincroniza y publica. Los scripts de `tools/` fallan si no lo encuentran
  (p. ej. en un entorno en la nube): en ese caso, no inventar rutas; avisar a Vero.

### `quartz/static/`
| Archivo | Qué es |
|---|---|
| `VeroCosmos_X.Y.Z.html` | La app principal (portada, atlas, guía) en un solo archivo. Solo se edita la versión MÁS ALTA. |
| `ficha.html` | Página de ficha de objeto con modelo 3D (`nebula`, `galaxy`, `globular`; paletas opcionales `orion`, `flame`). |
| `fichas.json` | Datos de cada ficha. Clave = ruta de la nota en minúsculas con guiones (`catálogos/messier/descripciones/m_42/m42---nebulosa-de-orión`). Campos: `name`, `model`, `facts` (pares `[nombre, valor]`), `cats`, `trivia`, … |
| `guias.json` | Guías de observación, con textos `{es, en, fr}` dentro del propio JSON. |
| `vc-i18n.js` | Traducciones. `DICT.en` / `DICT.fr`: clave = texto EXACTO en español. `DICTH` = bloques HTML largos. `frTypo` añade el espacio fino del francés automáticamente. |
| `ajustes.js` | Ajustes sin cuenta en localStorage: `vc-vero` (off/on/full), `vc-anim`, `vc-geo`, `vc-3d`. Se carga en `<head>` antes que todo. |
| `vero.js` + `vero/` | Mascota Vero Andromedasis (ilustraciones `.webp`). |
| `milugar.js`, `meteo.js`, `luna.js`, `bortle.js`, `entorno.js`, `mochila.js`, `eleccion.js`, `promo.js` | Herramientas y módulos de la Guía (Mi Lugar, meteo, fase lunar, contaminación lumínica, sorteo…). |

### Caché: `?v=N`
Los scripts se enlazan con `?v=N` (p. ej. `vc-i18n.js?v=62`). **Al cambiar un `.js` hay que subir su `?v=` en todos
los HTML que lo cargan** (`VeroCosmos_*.html`, `ficha.html`, `quienes-somos.html`, `guia.html`), o los navegadores
seguirán usando la versión vieja.

## Flujos de trabajo (usa los scripts, no edites JSON a mano)

- **Nueva versión del atlas:** `node tools/nueva-version.mjs` (parche) o `node tools/nueva-version.mjs 1.1.0`.
  Copia el HTML a la nueva versión, actualiza las 4 páginas y `quienes-somos.html` y borra versiones antiguas
  (conserva las 2 últimas y la 0.2.24). Después se edita el archivo NUEVO.
- **Nueva ficha:** copiar `tools/plantilla-ficha.md`, rellenarla en español y ejecutar
  `node tools/nueva-ficha.mjs mi-ficha.md` (primero con `--simular`). Rellenar `en`/`fr` en
  `tools/pendientes-traduccion.json` y luego `node tools/nueva-ficha.mjs --aplicar`.
  La nota y su foto deben existir ya en el vault. Opciones: `--reemplazar`, `--sin-version`.
  El proceso completo (incluida la traducción de la `description` y los párrafos de la nota) está en la skill
  `.claude/skills/nueva-ficha/SKILL.md`.
- **Revisar traducciones:** `node tools/auditar-traducciones.mjs` (duplicadas, vacías, iguales al español).
- **Ubicación celeste:** `tools/data/cielo.json` (generado por `tools/construir-cielo.mjs`; no regenerarlo sin motivo).
- **Comprobar antes de terminar:** `npm run check` (tsc + prettier) si se tocó código de Quartz.

## Convenciones

- Todo texto visible nuevo se escribe en español y se añade a `vc-i18n.js` en inglés y francés en el mismo cambio.
  Nombres propios de objetos con su forma habitual en cada idioma (Nebulosa de Orión → Orion Nebula → Nébuleuse d'Orion).
- Fotos: el nombre lleva la fecha (`M_42_S50_2026-10-24.jpg`); la "última foto" es la de fecha más reciente.
- Formato de datos astronómicos: `5h 35m 17s`, `−5° 23′ 28″` (signo menos y primas tipográficas), decimales con coma (`+4,0`).
- Estilo: sin punto y coma, ancho 100, finales de línea `lf` (`.prettierrc`). Imitar el estilo del archivo que se edita.
- Rendimiento: todo debe cargar rápido; nada de librerías pesadas nuevas sin preguntar.
- Móvil es de primera clase: un toque abre un objeto, sin previsualizaciones al pasar el dedo, paneles a pantalla completa en vertical.
- Respetar los ajustes: si `vc-anim` está en `off`, nada de animaciones; si `vc-3d` está en `off`, fichas con foto; si `vc-vero` está en `off`, sin mascota.
- Mascota: **Vero Andromedasis** es un personaje independiente (no la autora), de Antequera. Su horquilla con el logo VC y su halo no se cambian. Aparece solo en algunas partes y nunca sale sola.
- Commits en español, describiendo el cambio y la versión del atlas si cambia (p. ej. `… (atlas 1.0.38)`).
