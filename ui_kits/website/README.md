# Heirs of the Collapse — Website UI Kit

Mock del sitio público de **Heirs of the Collapse**, un webcómic de **Álvaro Serrano Sierra** publicado los domingos. Construido como kit reutilizable React + CSS, mapeable 1-a-1 contra **Prismic** (Slice Machine).

## Cómo abrirlo

Abre `index.html` en cualquier navegador. Se sirve estático (sin build) usando React 18 + Babel standalone.

## Rutas en el mock

- `home` · ParallaxHero + ticker + bloques editoriales + grid de personajes
- `episodes` · índice de capítulos
- `reader` (capítulo) · secuencia de páginas verticales 1080px max, sin costuras
- `characters` / `character/:slug` · grid + perfil con parallax (fondo + portrait + texto)
- `lore` (Worldbuilding) · 3 secciones tipo grid: **Environments**, **Props**, **Illustrations**
- `lore-item/:kind/:slug` · perfil de entorno / prop / ilustración
- `store` · grid de productos
- `about`

Idiomas: **EN/ES** con switcher en el header (persistido en `localStorage`).

## Cómo editar contenido (Prismic + Slice Machine)

Los modelos JSON están listos para arrancar Slice Machine sin tocar nada:

```
prismic/
  customtypes/
    page.json          ← documento page con SliceZone
    episode.json       ← capítulo: número, título, sinopsis, cover, pages[]
    character.json     ← personaje: portrait, cover, atributos, bio, gallery
    lore_item.json     ← entornos / props / ilustraciones (kind: select)
    product.json       ← producto de la tienda
    settings.json      ← logo, socials, paleta, navegación
  slices/
    parallax_hero/model.json
    text_with_image/model.json
    image_ticker/model.json
    character_grid/model.json
    callout/model.json
    quote/model.json
    cta_block/model.json
    newsletter/model.json
    gallery/model.json
    image_cards/model.json
    feature_grid/model.json
    image_full/model.json
    lore_section/model.json
```

### Setup paso a paso

1. `npx @slicemachine/init@latest` en la raíz de tu proyecto Next/Nuxt.
2. Conecta Slice Machine al repositorio Prismic. Verás aparecer los slices.
3. Copia los `customtypes/*.json` a tu carpeta `customtypes/` del proyecto Slice Machine.
4. Copia los `slices/*/model.json` a tu carpeta `slices/`.
5. Abre Slice Machine (`npm run slicemachine`) → **Push to Prismic**.
6. Crea documentos en Prismic. Cada Page contiene una **Slice Zone** que arrastras y sueltas (Parallax Hero → Image Ticker → Text with Image → etc.).
7. Para los **capítulos**, sube las tiras 1080×N como imágenes en el grupo `pages`. La página puede tener desde 1 hasta indefinidas tiras secuenciales.

### Localización ES/EN

En Prismic: **Settings → Translations & locales** → añade `es-ES` y `en-US`. Prismic crea variantes automáticas de cada documento. El kit ya conmuta con `lang === "es"` / `"en"` y persiste la elección en `localStorage`.

Mientras Prismic no esté conectado, los textos UI vienen del diccionario en `i18n.js` y los textos de contenido (capítulos, personajes, etc.) de `data.js`.

## Cómo editar la paleta

Toda la paleta vive en CSS variables en **`/colors_and_type.css`** (raíz del proyecto). Cambias una vez y todos los componentes la recogen.

Tokens principales:

```css
--hotc-ember:    #F26B2B;   /* naranja brasa — acento principal, CTAs, FX */
--hotc-cyan:     #1FB8D1;   /* tensión, contraste frío */
--hotc-magenta:  #E8336E;   /* atardeceres, FX rojos */
--hotc-sfx:      #FFC233;   /* amarillo onomatopeyas */
--hotc-ink:      #0B0B0E;   /* tinta del cómic, texto */
--hotc-paper:    #F5EFE6;   /* crema cálido del cómic publicado */
--hotc-slate-950:#07080B;   /* fondo del lector (modo cinema) */
```

Si quieres exponer estos colores en Prismic para que el cliente los toque desde el panel, el `customtypes/settings.json` ya incluye campos `Color` para los seis canónicos. En el front, lee `prismic.settings.brand.ember` y emítelo como `<style>` en el `<head>`:

```jsx
<style>{`:root { --hotc-ember: ${settings.brand.ember}; }`}</style>
```

## Capítulos: tiras 1080×13000px

El componente **`EpisodeSequence`** muestra páginas verticales `<img>` apiladas:

- En desktop, ancho **limitado a 1080px** (`--hotc-reader-max`) y centrado.
- En móvil, ocupa el 100% del viewport.
- **Sin gaps, sin sombras y sin bordes redondeados entre páginas** → se ven como una sola tira continua aunque sean 1, 2 o N imágenes.
- `loading="lazy"` en todas menos las dos primeras.
- `width`/`height` en cada `<img>` para evitar layout shift.

Cargar 1 sola tira de 1080×13000 funciona; cargar 5 tiras de 1080×2600 funciona igual (sin costuras visibles).

## Hero portada con parallax

`ParallaxHero` acepta:

- `bgImage` · imagen de fondo
- `bgVideo` · MP4 de fondo (con `bgImage` como poster fallback)
- `foreground` · PNG con alpha (un personaje recortado, p.ej.) que se desplaza más rápido que el fondo

Tres planos a velocidades distintas → ilusión de profundidad. Respeta `prefers-reduced-motion`.

## Atribución

Copyright a **Álvaro Serrano Sierra** (no "AlDraws"). Footer enlaza a `https://www.alvaro-serrano.com`.

Redes sociales del cómic: **Instagram**, **TikTok**, **Webtoon Canvas**.
