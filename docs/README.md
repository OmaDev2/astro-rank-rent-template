# Astro Rank & Rent Template

Template de sitio web para negocios de servicios locales (Rank & Rent / lead generation), construido con Astro 5, Keystatic CMS y Tailwind CSS. Incluye SEO local avanzado, schema @graph, OG images dinámicas, sistema de temas y un CMS visual completo.

---

## Características principales

- **Page Builder visual** — 15+ bloques de contenido configurables vía CMS sin tocar código
- **SEO local avanzado** — Schema.org Knowledge Graph (@graph) en todas las páginas, sitemap priorizado, robots.txt configurado (crawlers de IA permitidos)
- **OG images dinámicas** — Generadas en build time para la home, cada servicio y cada zona, con 3 layouts que varían por sitio (nunca hay que subir una OG a mano)
- **ADN de diseño** — 10 recetas curadas (tema + fuentes + hero + efectos) propuestas por `init-niche` para que cada clon nazca visualmente distinto (`npm run design-dna`)
- **Multi-tema** — 21 temas de color predefinidos + 9 pares de fuentes, cambiables desde el CMS; self-hosting de fuentes con `npm run setup-fonts`
- **Interlinking SEO** — Bloques automáticos de servicios-por-zona y zonas-por-servicio, más páginas curadas Servicio × Zona para long-tail local
- **Blog con paginación** — Schema `BlogPosting`, canonicals correctos y feed RSS en `/rss.xml`
- **Botones flotantes globales** — WhatsApp y teléfono configurables por dispositivo desde el CMS
- **Tracking de leads sin footprint** — proxy same-domain `/api/track` hacia n8n (el webhook no aparece en el HTML)
- **Google Tag Manager** vía Partytown (sin impacto en Core Web Vitals)
- **Preflight de calidad** — `npm run check:site` valida datos, SEO, peso de OG, robots e índice antes de cada build
- **IndexNow** — notificación de URLs a Bing/buscadores de IA tras el deploy (`npm run indexnow`)

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Astro 5](https://astro.build) | Framework SSG |
| [Keystatic 0.5](https://keystatic.com) | CMS headless local/GitHub |
| [Tailwind CSS 3](https://tailwindcss.com) | Estilos |
| [React 18](https://react.dev) | Componentes de UI interactivos en el CMS |
| [Lucide React](https://lucide.dev) | Iconografía |
| Netlify | Despliegue y SSR edge |

---

## Inicio rápido

```bash
# 1. Clonar o duplicar el repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git mi-sitio
cd mi-sitio

# 2. Instalar dependencias
npm install

# 3. Arrancar servidor de desarrollo
npm run dev
```

- **Sitio:** `http://localhost:4321`
- **CMS:** `http://localhost:4321/keystatic`

---

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` (incluye preflight) |
| `npm run preview` | Preview del build en local |
| `npm run init-niche` | Asistente de nuevo nicho (datos + ADN de diseño) |
| `npm run design-dna` | Proponer/aplicar recetas de diseño (`--list`, `--apply <key>`) |
| `npm run setup-fonts` | Self-hostear el par de fuentes elegido (GDPR + LCP) |
| `npm run check:site` | Preflight de calidad sin hacer build |
| `npm run content-wizard` | Generar servicios/zonas con IA |
| `npm run indexnow` | Notificar URLs a IndexNow tras el deploy (necesita `INDEXNOW_KEY`) |

---

## Cómo usar el CMS (Keystatic)

Accede a `http://localhost:4321/keystatic`. Todo el contenido se gestiona desde aquí sin tocar código.

### Secciones del CMS

```
⚙️ Configuración
├── 🏢 Mi Negocio        → Nombre, teléfono, email, ciudad, WhatsApp, horarios, redes
└── 🎨 Diseño y Tema     → Colores, fuentes, navbar, footer, botones flotantes

📝 Contenido
├── 🏠 Página de Inicio  → Bloques de la home
├── 👥 Sobre Nosotros    → Historia, valores, equipo
├── 📍 Página de Zonas   → Texto introductorio del listado de zonas
├── 🛠️ Servicios         → Cada servicio con su page builder
├── 📍 Zonas de Servicio → Cada zona con su page builder
├── 💼 Proyectos         → Galería de trabajos
├── ⭐ Testimonios       → Reseñas de clientes
└── 📰 Blog              → Artículos

📄 Páginas Legales
├── 🧭 Navegación (Menú)
├── 🦶 Footer
├── ⚖️ Aviso Legal
├── 🛡️ Política de Privacidad
└── 🍪 Política de Cookies
```

---

## Configuración inicial de un nuevo negocio

### 1. Mi Negocio
Rellena los datos del negocio: nombre, teléfono, WhatsApp (con código de país, ej: `34675568148`), email, ciudad, dirección y URL del sitio.

> ⚠️ La URL del sitio es importante: afecta a todos los `@id` del schema y a las OG images. Actualízala antes del deploy.

### 2. Diseño y Tema
- **Identidad Visual** — Elige un tema de color base y personaliza los colores, fuentes y escala tipográfica.
- **Estructura y Layout** — Estilo de navbar, footer, hero y espaciado entre secciones.
- **Efectos** — Esquinas, sombras, animaciones y separadores de sección.
- **Botones de Contacto Flotantes** — Activa o desactiva el teléfono y WhatsApp flotante de forma independiente en móvil y escritorio.
- **Ajustes Avanzados** — Favicon, color de barra móvil y CSS personalizado.

### 3. Navegación
Configura el menú principal. Tipos de enlace disponibles:
- `Enlace Simple` — URL directa
- `Desplegable de Servicios` — Se genera automáticamente con todos los servicios
- `Desplegable de Zonas` — Se genera automáticamente con todas las zonas

---

## Gestión de Servicios

Cada servicio es una entrada en la colección **Servicios** del CMS.

### Campos del servicio
- **Título / Slug** — Nombre del servicio y su URL (`/servicios/slug`)
- **Imagen Principal** — Usada en las cards y como fallback del hero
- **Icono** — Icono Lucide que aparece en las cards y navegación
- **Descripción Corta** — Texto de la card en listings
- **Destacado** — Aparece en la home si está marcado
- **SEO Preview** — Título y descripción para Google
- **Constructor de Página** — Bloques que componen la página del servicio

### Bloques disponibles en Servicios
| Bloque | Descripción |
|---|---|
| 🖼️ Hero | Portada con imagen de fondo, headline y CTAs |
| 💎 Características | Grid de beneficios con icono |
| 👷 Método de Trabajo | Pasos del proceso |
| 📊 Estadísticas | Contadores animados |
| 🎯 CTA | Llamada a la acción final |
| 💰 Tabla de Precios | Planes y precios |
| 📝 Texto y MDX | Bloque de contenido libre |
| 🗺️ Zonas donde ofrecemos este servicio | Interlinking automático a zonas |
| ❓ Preguntas Frecuentes | FAQ con schema integrado |

### Cómo funciona el page builder

1. En el **Constructor de Página**, pulsa **Add** para añadir un bloque.
2. Selecciona el bloque que quieres y configura su contenido.
3. Arrastra el icono `⠿` para reordenar los bloques.
4. Pulsa el icono 🗑️ para eliminar un bloque.
5. Guarda con el botón **Save**.

> **Nota:** Si un servicio no tiene ningún bloque configurado, la página mostrará automáticamente un conjunto de bloques por defecto (hero, características, contenido, CTA). En cuanto añades aunque sea un bloque desde Keystatic, la página usa exactamente lo que hayas definido.

---

## Gestión de Zonas

Cada zona es una entrada en la colección **Zonas de Servicio**.

### Campos de la zona
- **Nombre / Slug** — Nombre de la zona y su URL (`/zona/slug`)
- **Tipo de Zona** — Agrupa el listado de `/zonas` en secciones:
  - `Residencial` — Barrios y municipios residenciales (badge azul)
  - `Industrial` — Polígonos y zonas industriales (badge ámbar)
  - `Centro Urbano` — Ciudad principal o centro (badge primario, aparece primero)
- **Imagen Hero** — Imagen representativa de la zona
- **Coordenadas GPS** — Para centrar el mapa en esa zona
- **Códigos Postales** — Para el schema y el bloque de mapa
- **Preguntas Frecuentes** — FAQ específicas de la zona (mejora SEO local)
- **SEO Preview** — Título y descripción para Google
- **Constructor de Página** — Bloques que componen la página de la zona

### Bloques disponibles en Zonas
| Bloque | Descripción |
|---|---|
| 🖼️ Hero | Portada con imagen de fondo y CTAs |
| 💎 Características | Por qué elegirnos |
| 📍 Mapa de Ubicación | Mapa centrado en las coordenadas de la zona |
| 📝 Contenido + Sidebar | Texto SEO con barra lateral de contacto |
| 🎯 CTA | Llamada a la acción final |
| 💰 Tabla de Precios | Precios para esta zona |
| 📊 Estadísticas | Contadores |
| 🤝 Logos | Logos de partners o certificaciones |
| 🔗 Servicios en esta Zona | Interlinking automático a servicios |
| 🔄 Antes y Después | Comparativa de imágenes |

> **Nota:** Al igual que los servicios, si la zona no tiene bloques configurados se muestran 5 bloques por defecto. Una vez añades bloques desde Keystatic, manda tu configuración.

---

## Temas de color disponibles

Seleccionables desde **Diseño → Identidad Visual** sin tocar código:

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
| `clay_paper` | Arcilla / Papel |
| `forest_stone` | Bosque / Piedra |
| `workshop` | Taller clásico |
| `sky_white` | Cielo / Blanco |
| `sand_terracotta` | Arena / Terracota |

---

## Botones flotantes (WhatsApp y Teléfono)

Se configuran globalmente desde **Diseño → Botones de Contacto Flotantes**:

| Ajuste | Por defecto |
|---|---|
| Teléfono flotante en móvil | ✅ Activado |
| Teléfono flotante en escritorio | ❌ Desactivado |
| WhatsApp flotante en móvil | ✅ Activado |
| WhatsApp flotante en escritorio | ✅ Activado |

---

## SEO

### Schema @graph
Cada tipo de página emite un bloque `@graph` con entidades interconectadas:

| Página | Entidades |
|---|---|
| Home | `WebSite`, `LocalBusiness`, `WebPage`, `BreadcrumbList`, `FAQPage` |
| Servicio | `WebSite`, `LocalBusiness`, `WebPage`, `Service`, `BreadcrumbList`, `FAQPage` |
| Zona | `WebSite`, `LocalBusiness`, `WebPage`, `BreadcrumbList`, `FAQPage` |
| Blog post | `WebSite`, `LocalBusiness`, `BlogPosting`, `BreadcrumbList` |
| Contacto | `WebSite`, `LocalBusiness`, `ContactPage`, `BreadcrumbList` |

### OG Images dinámicas
Generadas automáticamente en build time para cada servicio y zona.

### Sitemap
Prioridades configuradas en `astro.config.mjs`:
- Home: `1.0` · Zonas: `0.9` · Servicios: `0.8` · Blog: `0.6–0.7`

---

## Estructura del proyecto

```
/
├── public/
│   └── images/                # Imágenes estáticas subidas desde el CMS
├── src/
│   ├── components/
│   │   ├── blocks/            # Bloques del page builder
│   │   └── keystatic/         # UI personalizada del CMS
│   ├── config/
│   │   ├── themes.ts          # 15 temas de color
│   │   └── keystatic/         # Schemas de colecciones y singletons
│   ├── content/               # Contenido gestionado por Keystatic
│   │   ├── business/          # Datos del negocio
│   │   ├── design/            # Tema y diseño global
│   │   ├── services/          # Servicios (.mdx)
│   │   ├── locations/         # Zonas (.mdx)
│   │   ├── projects/          # Trabajos realizados
│   │   ├── testimonials/      # Reseñas
│   │   ├── blog/              # Artículos
│   │   ├── pages/             # Home y otras páginas
│   │   ├── about/             # Página sobre nosotros
│   │   └── legal/             # Páginas legales
│   ├── layouts/               # Layouts por tipo de página
│   ├── lib/
│   │   ├── seo.ts             # Schema @graph builders
│   │   └── settings.ts        # Configuración global (punto único de verdad)
│   └── pages/
│       ├── servicios/         # Páginas de servicio dinámicas
│       ├── zona/              # Páginas de zona dinámicas
│       ├── blog/              # Blog paginado
│       └── api/               # Endpoints (formulario, generador IA)
├── keystatic.config.tsx       # Config principal del CMS
├── astro.config.mjs
└── tailwind.config.mjs
```

---

## Despliegue en Netlify

El proyecto incluye `netlify.toml` preconfigurado.

1. Sube el código a GitHub
2. Conecta el repositorio en Netlify
3. Build command: `npm run build` · Publish directory: `dist`
4. Actualiza `siteUrl` en **Mi Negocio** con la URL de producción

> ⚠️ El CMS (`/keystatic`) solo funciona en modo desarrollo local o con soporte de SSR activo en Netlify. En sitios estáticos puros, edita directamente los archivos `.mdx` y `.yaml` del directorio `src/content/`.

---

## Demo incluida

El template incluye un negocio demo completo (**Fontanería García, Madrid**) con servicios, zonas, proyectos, testimonios y blog configurados. Úsalo como referencia y sustitúyelo con los datos reales de tu negocio.

---

## Licencia

MIT — libre uso para proyectos de Rank & Rent y lead generation.
