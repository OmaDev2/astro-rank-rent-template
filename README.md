# Astro Rank & Rent Template

Template de sitio web para negocios de servicios locales (Rank & Rent / lead generation), construido con Astro 5, Keystatic CMS y Tailwind CSS. Incluye SEO local avanzado, schema @graph, OG images dinámicas, sistema de temas y un CMS visual completo.

---

## Características principales

- **Page Builder visual** — 15+ bloques de contenido configurables vía CMS sin tocar código
- **SEO local avanzado** — Schema.org Knowledge Graph (@graph) en todas las páginas, sitemap priorizado, robots.txt configurado
- **OG images dinámicas** — Generadas en build time para cada servicio y zona con `satori`
- **Multi-tema** — 15 temas de color predefinidos + 8 pares de fuentes, cambiables desde el CMS
- **Paginación de blog** — Con canonicals correctos y schema `BlogPosting` por artículo
- **Interlinking SEO** — Bloques automáticos de servicios-por-zona y zonas-por-servicio
- **Formulario de contacto** configurable desde CMS con validación de privacidad
- **WhatsApp float + teléfono sticky** activables por página
- **Google Tag Manager** vía Partytown (sin impacto en Core Web Vitals)
- **Trailing slash consistente** — `trailingSlash: always` en todo el sitio

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [Astro](https://astro.build) | 5.x | Framework SSG |
| [Keystatic](https://keystatic.com) | 0.5.x | CMS headless local/GitHub |
| [Tailwind CSS](https://tailwindcss.com) | 3.4.x | Estilos |
| [React](https://react.dev) | 18.x | Componentes de UI interactivos |
| [satori](https://github.com/vercel/satori) + resvg | — | OG images en build time |
| [Lucide React](https://lucide.dev) | — | Iconografía |
| [astro-seo](https://github.com/jonasmerlin/astro-seo) | — | Meta tags y OG |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | — | Sitemap XML |
| [astro-robots-txt](https://github.com/alextim/astro-lib/tree/main/packages/astro-robots-txt) | — | robots.txt |
| Netlify | — | Despliegue y SSR edge |

---

## Requisitos

- Node.js 18+
- npm

---

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/TU_REPO.git mi-sitio
cd mi-sitio

# 2. Instalar dependencias
npm install

# 3. Arrancar servidor de desarrollo
npm run dev
```

- Sitio: `http://localhost:4321`
- CMS: `http://localhost:4321/admin`

Para la configuración inicial del negocio, sigue la [Guía de Inicio](./GETTING_STARTED.md).

---

## Estructura del proyecto

```
/
├── public/
│   └── images/                # Imágenes estáticas
├── src/
│   ├── components/
│   │   ├── blocks/            # Bloques del page builder (15+)
│   │   ├── mdx/               # Componentes para contenido MDX
│   │   └── keystatic/         # UI custom para el CMS
│   ├── config/
│   │   ├── themes.ts          # 15 temas de color predefinidos
│   │   ├── fonts.ts           # 8 pares de fuentes Google
│   │   └── keystatic/         # Configuración de colecciones CMS
│   ├── content/               # Contenido gestionado por Keystatic
│   │   ├── business/          # Datos del negocio (nombre, teléfono, ciudad...)
│   │   ├── design/            # Tema, fuentes y layout
│   │   ├── services/          # Servicios (.mdx con bloques)
│   │   ├── locations/         # Zonas de cobertura (.mdx con bloques)
│   │   ├── projects/          # Galería de trabajos (.md)
│   │   ├── testimonials/      # Reseñas de clientes (.json)
│   │   ├── blog/              # Artículos del blog (.md / .mdx)
│   │   ├── pages/             # Home y páginas hub
│   │   ├── about/             # Contenido de "Sobre Nosotros"
│   │   └── legal/             # Aviso legal, privacidad, cookies
│   ├── layouts/               # Layouts por tipo de página
│   ├── lib/
│   │   ├── seo.ts             # Schema @graph builders
│   │   ├── og.tsx             # Generador de OG images
│   │   └── settings.ts        # Helper de configuración global
│   └── pages/
│       ├── servicios/         # Páginas de servicio dinámicas
│       ├── zona/              # Páginas de zona dinámicas
│       ├── blog/              # Blog paginado ([...page].astro)
│       ├── proyectos/         # Galería de proyectos
│       ├── og/                # Endpoints de OG images (build time)
│       └── api/               # Endpoints de API (formulario, etc.)
├── astro.config.mjs
├── keystatic.config.ts
├── tailwind.config.mjs
├── GETTING_STARTED.md         # Checklist de configuración inicial
└── README.md
```

---

## CMS — Keystatic

El CMS es accesible en `/admin`. Permite gestionar sin código:

| Sección CMS | Qué controla |
|---|---|
| **Business** | Nombre, teléfono, email, ciudad, coordenadas, horarios, redes sociales |
| **Design** | Tema de color, par de fuentes, estilo de navbar/footer/hero |
| **Services** | Cada servicio con su page builder de bloques |
| **Locations** | Cada zona con su page builder, coordenadas y FAQ |
| **Projects** | Galería de trabajos con imagen, zona y tipo de servicio |
| **Testimonials** | Reseñas con nombre, nota y servicio |
| **Blog** | Artículos con imagen, autor, categoría y tags |
| **Pages → Home** | Todos los bloques de la página de inicio |
| **Form** | Campos, textos y URL de éxito del formulario de contacto |
| **Navigation** | Menú principal con soporte de submenús |

---

## Bloques disponibles

Todos los bloques son configurables desde el CMS y se pueden combinar en cualquier orden en servicios, zonas y la home.

| Bloque | Descripción |
|---|---|
| `hero` | Hero con imagen de fondo, headline, subheadline y CTAs |
| `features` | Grid de características con icono, título y descripción |
| `services_list` | Listado de servicios con imagen, icono y descripción |
| `stats` | Contadores animados (proyectos, años, valoración...) |
| `testimonials` | Carrusel/grid de reseñas de clientes |
| `pricing` | Tabla de precios con planes y features |
| `process` | Pasos del proceso de trabajo con duración |
| `faq` | Preguntas frecuentes con schema FAQ integrado |
| `about` | Sección "sobre nosotros" con imagen y puntos fuertes |
| `content` | Texto rico en columnas para SEO on-page |
| `cta` | Llamada a la acción con features y enlace |
| `service_areas` | Mapa de zonas de cobertura con suplementos |
| `location_services` | Grid automático de servicios para una zona (interlinking) |
| `service_locations` | Grid automático de zonas para un servicio (interlinking) |
| `locations` | Listado de zonas (automático desde la colección) |
| `contact` | Formulario de contacto embebido |

---

## SEO

### Schema @graph

Cada tipo de página emite un único bloque `@graph` con entidades interconectadas por `@id`:

| Página | Entidades en el @graph |
|---|---|
| Home | `WebSite`, `LocalBusiness` (con `hasOfferCatalog`), `WebPage`, `BreadcrumbList`, `FAQPage` |
| Servicio | `WebSite`, `LocalBusiness`, `WebPage`, `Service`, `BreadcrumbList`, `FAQPage` |
| Zona | `WebSite`, `LocalBusiness`, `WebPage` (about: [business, City]), `BreadcrumbList`, `FAQPage` |
| Blog post | `WebSite`, `LocalBusiness`, `BlogPosting`, `BreadcrumbList` |
| Contacto | `WebSite`, `LocalBusiness`, `ContactPage`, `BreadcrumbList` |
| Proyectos | `WebSite`, `LocalBusiness`, `CollectionPage` + `ItemList`, `BreadcrumbList` |
| Proyecto | `WebSite`, `LocalBusiness`, `WebPage`, `CreativeWork`, `BreadcrumbList` |

### OG Images dinámicas

Se generan en build time en `src/pages/og/`:
- `/og/servicio/[slug].png` — OG image por servicio
- `/og/zona/[slug].png` — OG image por zona
- Detectadas automáticamente en `SeoHead.astro` según el path

### Sitemap

Prioridades configuradas en `astro.config.mjs`:
- Home: `1.0`
- Zonas: `0.9`
- Servicios individuales: `0.8`
- Hub servicios/zonas: `0.7`
- Blog: `0.6–0.7`

---

## Temas disponibles

Configurables desde el CMS sin tocar código:

| Tema | Paleta |
|---|---|
| `industrial` | Naranja / Gris oscuro |
| `corporate` | Azul / Oscuro |
| `nature` | Verde / Tierra |
| `urgency` | Rojo / Negro |
| `legal` | Navy / Oro |
| `health` | Turquesa |
| `luxury` | Negro / Oro |
| `beauty` | Rosa |
| `tech` | Violeta |
| `clean` | Claro / Minimal |
| `clay_paper` | Arcilla / Papel (artesano cálido) |
| `forest_stone` | Bosque / Piedra (artesano natural) |
| `workshop` | Taller clásico (artesano premium) |
| `sky_white` | Cielo blanco (claro/azul) |
| `sand_terracotta` | Arena / Terracota (cálido claro) |

---

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build en local |

---

## Despliegue

### Netlify (recomendado)

El proyecto incluye `netlify.toml` preconfigurado con soporte de SSR para el CMS.

1. Sube el código a GitHub
2. Conecta el repositorio en Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Actualiza `siteUrl` en el CMS con la URL de producción

### Importante tras el despliegue

- Actualiza `siteUrl` en `src/content/business/global.yaml` con la URL real
- Este campo impacta en todos los `@id` del schema y en las OG images

---

## Demo incluida

El template incluye un negocio demo completo (**Fontanería García, Madrid**) con:
- 3 servicios con page builder completo
- 4 zonas de Madrid (1 completa + 3 básicas)
- 1 proyecto de galería
- 2 testimonios
- 2 artículos de blog
- Home con todos los bloques configurados

Para adaptar el demo a tu negocio real, sigue el checklist en [GETTING_STARTED.md](./GETTING_STARTED.md).

---

## Licencia

MIT — libre uso para proyectos de Rank & Rent y lead generation.
