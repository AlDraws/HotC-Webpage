# Handoff: HotC-Webpage — fixes + Patreon/Kickstarter

This package contains the production code (TSX + Slice models) to apply to your
Next.js + Prismic repo, plus a step-by-step guide to plug it in with Claude Code.

## What's inside

```
handoff/
├── src/
│   ├── components/
│   │   ├── Bounded.tsx          ← centered container (fix #2)
│   │   └── BrandLogo.tsx        ← logo with adaptive stroke (fix #1)
│   ├── app/
│   │   └── page.tsx             ← real homepage (replaces the Next.js template)
│   └── slices/
│       ├── parallax_hero/index.tsx     ← hero implementado + foreground centrado
│       ├── image_ticker/index.tsx      ← marquee sin saltos en hover (fix #4)
│       ├── external_support/
│       │   ├── index.tsx               ← Slice nuevo (Patreon, Kickstarter, ...)
│       │   └── model.json              ← modelo de Slice Machine
│       └── index.ts                    ← registro de Slices (con external_support)
└── HANDOFF.md (este archivo)
```

## Resumen de los 4 puntos

| # | Problema | Dónde se arregla |
|---|----------|------------------|
| 1 | Logos pierden grosor al hacer zoom | `src/components/BrandLogo.tsx` — recalcula `stroke-width` con `ResizeObserver` para mantener el grosor visual constante a cualquier escala. |
| 2 | "Recent appearances" se desplaza al zoom out | `src/components/Bounded.tsx` + `parallax_hero/index.tsx` — el contenido vive dentro de `mx-auto max-w-6xl`; el fondo full-bleed va en una capa absoluta separada. |
| 3 | Modularidad para Patreon / Kickstarter | Slice nuevo `external_support` con 3 variaciones (row / cards / banner). Añadir nuevas plataformas no toca código: el editor de Prismic tiene un Select con `Patreon, Kickstarter, Ko-fi, Discord, YouTube, Other`, y campos `label / url / icon / accent`. |
| 4 | Imágenes "saltan" en hover | `src/slices/image_ticker/index.tsx` — la animación es `requestAnimationFrame` (no CSS), el frame del item es de tamaño fijo y el `scale` de hover vive en un hijo interno. La barra nunca reflowa ni resetea. |

---

## Pasos para integrarlo con Claude Code

> Necesitas el repo `AlDraws/HotC-Webpage` clonado en tu máquina y Claude Code instalado.

### 1. Preparar el repo

```bash
git clone git@github.com:AlDraws/HotC-Webpage.git
cd HotC-Webpage
nvm use         # respeta el .nvmrc
npm install
```

### 2. Descargar este paquete de handoff

Desde este proyecto en la app, descárgate la carpeta `handoff/` (botón de
descarga al final). Pégala dentro del repo, en la raíz, junto a `src/`.

```
HotC-Webpage/
├── src/
├── handoff/   ← aquí
├── package.json
└── ...
```

### 3. Lanzar Claude Code dentro del repo

```bash
cd HotC-Webpage
claude
```

### 4. Copia/pega este prompt en Claude Code

```
Tengo en /handoff un paquete de código nuevo para mi proyecto Next.js + Prismic.
Tu tarea:

1. Mover los siguientes archivos sobreescribiendo si ya existen:
   - handoff/src/components/Bounded.tsx        → src/components/Bounded.tsx
   - handoff/src/components/BrandLogo.tsx      → src/components/BrandLogo.tsx
   - handoff/src/app/page.tsx                  → src/app/page.tsx
   - handoff/src/slices/parallax_hero/index.tsx → src/slices/parallax_hero/index.tsx
   - handoff/src/slices/image_ticker/index.tsx  → src/slices/image_ticker/index.tsx

2. Crear el Slice nuevo external_support copiando:
   - handoff/src/slices/external_support/index.tsx     → src/slices/external_support/index.tsx
   - handoff/src/slices/external_support/model.json    → src/slices/external_support/model.json

3. NO sobreescribas src/slices/index.ts manualmente: lo regenera Slice Machine
   en el siguiente paso. Pero verifica al final que contiene la línea
   `external_support: dynamic(() => import("./external_support"))`.

4. Asegúrate de que tsconfig.json tiene el alias "@/*": ["./src/*"]
   (si no lo tiene, añádelo en compilerOptions.paths). Esto es
   necesario para los imports `@/components/...` y `@/slices`.

5. Borra la carpeta /handoff cuando todo esté movido.

6. Lanza npm run lint y arregla cualquier import roto.

Cuando termines, dime qué archivos has tocado y si has tenido que crear
src/components/ por primera vez.
```

### 5. Sincronizar el modelo nuevo con Prismic

En otra terminal, desde el repo:

```bash
npm run slicemachine
```

Se abre Slice Machine en `http://localhost:9999`. Verás `ExternalSupport`
detectado como Slice nuevo. Pulsa **Push to Prismic** (arriba a la derecha)
para subir el modelo a tu repositorio de Prismic.

A la vez, en otra pestaña: añade el Slice `ExternalSupport` a las páginas
que quieras. Para activarlo en la home:

1. Slice Machine → Custom Types → `page` → pestaña **Slice Zone** → **Update**.
2. Marca `ExternalSupport` (las 3 variaciones aparecen automáticamente).
3. **Save** y **Push** a Prismic.

### 6. Levantar el dev server

```bash
npm run dev
```

Abre `http://localhost:3000`. La home ya muestra `SliceZone`. Si la home
todavía está vacía en Prismic, créala:

1. En tu dashboard de Prismic → **Documents** → **Create new** → tipo `page`.
2. UID: `home`.
3. Añade un Slice `ParallaxHero` y otro `ImageTicker` para probar los fixes.
4. Añade un `ExternalSupport` (variación `cards`) con dos entradas:
   - Patreon (URL, icono, accent `#FF424D`)
   - Kickstarter (URL, icono, accent `#05CE78`)
5. **Publish**.

Recarga `localhost:3000` — todo en su sitio.

### 7. Cuando lances Kickstarter más adelante

No hay que tocar código. En Prismic abres el documento, dentro del Slice
`ExternalSupport` pulsas **Add a new item**, eliges `Kickstarter` en el
Select, rellenas URL e icono, y publicas. Esa es la modularidad que pedías.

---

## Verificación rápida

- Zoom in/out con `Cmd +` / `Cmd -` sobre el header → el wordmark conserva
  el grosor visual del trazo.
- Zoom out al 50% en la home → el bloque `Recent appearances` (cuando lo
  uses dentro de `<Bounded>`) sigue centrado.
- Pasa el ratón por encima del ticker → la fila se pausa suavemente sin
  empujar las imágenes.
- En Prismic, dupliques el Slice `ExternalSupport` cuantas veces quieras
  con plataformas distintas: cada item se renderiza por separado.

## Notas

- `BrandLogo` espera SVG (no PNG) para que la corrección de stroke aplique.
  Si tu logo actual es PNG, exporta una versión SVG con strokes (no `path`
  rellenos) y súbela a `settings.logoLight` en Prismic.
- Si tu logo es un SVG con strokes ya convertidos a `fill` (outline
  vectorizado), no necesita `BrandLogo` — escala perfectamente con un
  `<img>` normal. Úsalo solo si conserva `stroke` en su markup.
- El `accent` color por item permite respetar el branding nativo de cada
  plataforma sin hardcodear colores en el componente.
