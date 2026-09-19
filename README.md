# Nordlys

Sitio de portafolio para un estudio de diseño e ingeniería ficticio, construido como
demo técnica de una experiencia web guiada por el scroll: un mundo 3D fijo detrás de toda
la página (cristal líquido con shader propio, fragmentos, anillos, polvo de partículas y un
halo) que cambia de forma, posición y color según la sección que estás leyendo, con
carrusel de proyectos que avanza solo y se sujeta con el clic, manifiesto que se ilumina palabra por palabra, marquesina que
reacciona a la velocidad del scroll y una pantalla de carga con progreso real.

## Cómo correrlo

Requiere Node 18+ y [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). El servidor de desarrollo recompila
al guardar. Nota: si editas archivos dentro de `src/components/scene/` (la escena 3D),
el hot-reload de WebGL a veces se queda colgado — si la pantalla de carga no avanza del
0%, mata el proceso (`Ctrl+C`) y corre `pnpm dev` de nuevo. Es una limitación conocida
de mezclar contextos WebGL con Fast Refresh, no ocurre en producción.

```bash
pnpm build   # build de producción
pnpm start   # sirve el build de producción
pnpm lint    # eslint
```

## Estructura

```
src/
  app/
    layout.tsx        # fuentes, <Providers>, Nav, Footer
    page.tsx           # home: hero, marquesina, 3 capítulos, galería, manifiesto, cierre
    work/ about/ contact/
    globals.css         # tokens de diseño, tema claro/oscuro, grano de película
  components/
    scene/
      scene-root.tsx     # capa fija de WebGL (o brillo CSS si calidad baja / sin WebGL)
      world.tsx           # cristal, halo, polvo, fragmentos, anillos + StoryDriver
      shaders.ts          # GLSL: ruido simplex, paleta aurora, cristal, polvo, fragmentos
    home/                 # chapter, work-gallery (carrusel infinito con arrastre), manifesto, closing
    marquee.tsx  scroll-fade.tsx  parallax.tsx  tilt.tsx  reveal.tsx  stagger-text.tsx
    loading-screen.tsx  smooth-scroll.tsx  scroll-progress.tsx  sound-fx.tsx
    nav.tsx  footer.tsx  settings-menu.tsx  magnetic.tsx  project-art.tsx
  lib/
    story.ts             # keyframes del cristal por sección + estado compartido DOM<->3D
    settings-context.tsx  # tema, sonido, calidad gráfica (persistido en localStorage)
    projects.ts  sound.ts (síntesis WebAudio)  use-loading-progress.ts
```

## Cómo funciona la coreografía 3D

Cada sección de la home lleva `data-story="<clave>"`. En cada frame, `StoryDriver` (en
`world.tsx`) mide dónde está cada sección en pantalla y mezcla los *keyframes* de
`src/lib/story.ts` (posición, tamaño, líquido/facetado/malla, anillos, velocidad del polvo,
color...). Para cambiar lo que hace el cristal en un capítulo, edita su keyframe. Para
añadir una sección nueva a la historia, ponle `data-story` y crea su keyframe.

## Sonido

Apagado por defecto; se activa desde el engranaje. Todo se sintetiza en el navegador (sin archivos de audio): un *glass tick* al pasar por enlaces y botones, un golpe grave y apagado al hacer clic, un *swoosh* de filtro que sube de tono en transiciones de página y al aparecer las tarjetas, y un pad muy tenue en la pantalla de carga que crece con el contador y resuelve en un acorde de Re mayor al abrirse la cortina. Está afinado en pentatónica de Re mayor para que cualquier mezcla sea consonante. Todo vive en `src/lib/sound.ts`. Nota: los navegadores bloquean el audio hasta el primer gesto del usuario, así que el pad de carga solo se oye si el navegador ya permite audio para el sitio.

## Qué tocar para personalizar

- **Contenido de proyectos**: `src/lib/projects.ts`. Cada proyecto tiene `tint`
  (color usado en su preview al hacer hover en `/work`).
- **Colores de marca**: `src/app/globals.css`, bloque `:root` (tema oscuro, por
  defecto) y `:root[data-theme="light"]` (tema claro). `--aurora` es el gradiente
  de firma (usado en el logo, la pantalla de carga y el material 3D).
- **Tipografía**: `src/app/layout.tsx`, usa Geist Sans / Geist Mono vía `next/font`.
- **La escena 3D**: `src/components/scene/world.tsx` y `shaders.ts`. La calidad (alta/media/baja)
  del menú de configuración cambia el detalle del cristal, el número de partículas y la
  resolución. Con calidad "baja" o sin WebGL se muestra un brillo estático en CSS.
- **Textos y copys**: cada página en `src/app/*/page.tsx` tiene el contenido
  directamente en JSX, en español.

## Decisiones técnicas

- **Next.js 15** (App Router) en vez de la 16 recién liberada, para mantenerme
  dentro de las convenciones estables documentadas.
- **Lenis** en vez de `@studio-freight/lenis` (el paquete original fue
  renombrado/absorbido por el mismo equipo bajo el nombre `lenis` en npm).
- El scroll suave alimenta el ticker de GSAP (`gsap.ticker.add`) en vez de tener
  su propio loop de `requestAnimationFrame`, que es la integración que Lenis
  documenta para convivir con ScrollTrigger.
- El canvas de WebGL vive fuera del contenido de cada página, así que al navegar entre
  páginas es el mismo cristal el que se transforma, no un canvas nuevo.
- **No hay cursor personalizado**: se quitó a propósito porque el seguimiento con retraso se
  sentía lento. El cursor nativo se mantiene y el 3D reacciona a él directamente.
- Todo lo que depende de `prefers-reduced-motion` se lee una vez en `SettingsProvider` y se
  expone vía `useSettings().reducedMotion`; los componentes de animación devuelven un estado
  final estático en vez de animar y la galería pasa a un carrusel con scroll nativo.
