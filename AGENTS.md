# Astro Rank & Rent Template — Instrucciones para Codex

## Propósito del proyecto

Template Astro 5 para construir sitios web de **rank & rent local SEO** para negocios de servicios en España (electricistas, herreros, fontaneros, pintores, etc.). Cada nuevo cliente es una copia de este template con los datos cambiados.

## Stack

- **Astro 5** — framework principal, `output: 'static'` con opt-in SSR por ruta
- **Tailwind CSS v3** + **DaisyUI** — estilos y componentes
- **Keystatic** — CMS headless, solo activo en `dev` (nunca en build)
- **Netlify** — deploy + Netlify Image CDN en producción
- **React** — solo para componentes interactivos (Keystatic UI, formularios)
- **MDX** — para páginas con contenido mixto (páginas, blog)

## Arquitectura en una frase

Un **único punto de verdad** (`business/global.yaml` + `design/global.yaml`) alimenta un **sistema de bloques** (discriminatedUnion) que genera páginas dinámicas para servicios (`/servicios/[slug]`) y zonas/localidades (`/zona/[slug]`).

## Directorios clave

```
src/
  content/           ← TODAS las colecciones de contenido (YAML + MDX)
    business/        ← global.yaml — datos del negocio (nombre, teléfono, ciudad…)
    design/          ← global.yaml — tema visual (colores, fuentes, layout…)
    services/        ← un .yaml por servicio (slug = nombre de archivo)
    locations/       ← un .yaml por zona/localidad (slug = nombre de archivo)
    pages/           ← home.mdx, servicios.mdx, zonas.mdx — bloques de página
    testimonials/    ← un .yaml por testimonio
    navigation/      ← global.yaml — menú de navegación
    footer/          ← global.yaml — pie de página
    about/           ← global.yaml — datos de "sobre nosotros"
    form/            ← global.yaml — configuración del formulario de contacto
  components/        ← componentes .astro y .tsx
    sections/        ← bloques de sección reutilizables
    layout/          ← Header, Footer, Layout base
    ui/              ← botones, cards, badges…
    seo/             ← MetaTags, Schema, OG
  lib/
    settings.ts      ← getSettings() — SIEMPRE usar esto para datos globales
    seo.ts           ← buildHomeGraph(), buildServiceGraph()… — schema.org
    og.tsx           ← generador de imágenes OG dinámicas
  pages/             ← rutas de Astro
    index.astro
    servicios/[slug].astro
    zona/[slug].astro
    blog/[...slug].astro
    contacto.astro
    nosotros.astro
    aviso-legal.astro / privacidad.astro / cookies.astro
scripts/             ← scripts Node.js de utilidad (no son parte del build)
```

## Regla de oro: getSettings()

**Nunca** leer `business/global.yaml` ni `design/global.yaml` directamente en las páginas.
Usar siempre el helper centralizado:

```astro
---
import { getSettings } from "@/lib/settings";
const config = await getSettings();
// config.siteName, config.phone, config.city, config.seoTitle, etc.
---
```

## Regla de oro: imágenes

Ver [@mis docs para Codex/astro-images.md](@mis%20docs%20para%20claude/astro-images.md).
- `src/assets/` para imágenes optimizadas — siempre `<Image />` o `<Picture />`
- `public/` solo para favicon, SVG estáticos, robots.txt
- Nunca `<img>` nativo para imágenes del proyecto

## Regla de oro: no tocar config.ts sin querer

`src/content/config.ts` define los **schemas Zod** de todas las colecciones. Solo editar si:
- Se añade un campo nuevo a una colección
- Se añade una colección nueva
- Se añade un bloque nuevo al discriminatedUnion

Ver [@mis docs para Codex/astro-content-collections.md](@mis%20docs%20para%20claude/astro-content-collections.md).

## Regla de oro: bloques de página

Las páginas se construyen con un array `blocks:` en el YAML/MDX. Cada bloque tiene `discriminant` + `value`. El `BlockRenderer.astro` los renderiza en orden.

Ver [@mis docs para Codex/astro-block-system.md](@mis%20docs%20para%20claude/astro-block-system.md).

## Configurar un nuevo cliente

Ver [@mis docs para Codex/astro-new-client-checklist.md](@mis%20docs%20para%20claude/astro-new-client-checklist.md).

Archivos mínimos a editar para cada nuevo cliente:
1. `src/content/business/global.yaml` — nombre, teléfono, ciudad, URL…
2. `src/content/design/global.yaml` — colores, fuentes, estilo visual
3. `src/content/services/*.yaml` — los servicios del negocio
4. `src/content/locations/*.yaml` — las zonas que cubre
5. `src/content/pages/home.mdx` — bloques y textos de la home
6. `astro.config.mjs` — `site:` se lee automáticamente de `business/global.yaml`

## Scripts disponibles

```bash
npm run dev              # Servidor de desarrollo con Keystatic
npm run build            # Preflight check + build estático
npm run seo-wizard       # ⭐ Pipeline SEO por fases: contexto → plan → home → servicios/zonas
npm run init-niche       # Asistente de nuevo nicho (datos + ADN de diseño)
npm run design-dna       # Recetas de diseño (--list, --apply <key>)
npm run setup-fonts      # Self-hostear el par de fuentes elegido
npm run images:prepare   # Optimiza fotos nuevas: incoming-images/ → optimized-images/
npm run optimize-images  # Convierte a WebP lo ya subido en public/images/
npm run indexnow         # Notificar URLs a Bing/IA tras el deploy
npm run export           # Exporta el sitio para entrega al cliente (sin scripts de IA)
npm run reset            # ⚠ Limpia contenido y vuelve al estado plantilla (pide confirmación)
```

Detalle de cada script en [docs/SCRIPTS.md](docs/SCRIPTS.md).
`content-wizard` y `strategy-wizard` son legacy — usa `seo-wizard`.

## SEO y schema.org

Ver [@mis docs para Codex/astro-seo-schema.md](@mis%20docs%20para%20claude/astro-seo-schema.md).

- Schema se genera en `src/lib/seo.ts` — usar las funciones `build*Graph()`
- Sitemap configurado en `astro.config.mjs` con prioridades por tipo de página
- `robots.txt` generado por `astro-robots-txt` — IA bots bloqueados por defecto
- OG images dinámicas en `/src/pages/og/[...slug].png.ts`

## Routing y URLs

Ver [@mis docs para Codex/astro-routing.md](@mis%20docs%20para%20claude/astro-routing.md).

| Ruta | Fuente |
|------|--------|
| `/` | `pages/home.mdx` |
| `/servicios/[slug]` | `content/services/[slug].yaml` |
| `/zona/[slug]` | `content/locations/[slug].yaml` |
| `/blog/[...slug]` | `content/blog/**/*.{md,mdx}` |
| `/nosotros` | `content/about/global.yaml` |
| `/contacto` | Página estática con datos de `getSettings()` |

## Configuración visual

Ver [@mis docs para Codex/astro-design-config.md](@mis%20docs%20para%20claude/astro-design-config.md).

## Prohibido

- `<img src="...">` nativo para imágenes del proyecto
- Leer `business/global.yaml` directamente con `getEntry()` en páginas (usar `getSettings()`)
- Editar archivos de `node_modules/`
- Subir `.env` al repositorio
- Activar Keystatic en producción
- Usar `any` en TypeScript excepto en `value:` de bloques (el schema lo permite)
- Añadir dependencias de producción sin evaluar impacto en bundle size
