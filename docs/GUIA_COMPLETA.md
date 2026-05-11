# Guía Completa — Rank & Rent Template

Template Astro + Keystatic para crear webs de servicios locales rápidamente. Cada nicho nuevo se configura desde el CMS sin tocar código.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Iniciar un nuevo nicho](#3-iniciar-un-nuevo-nicho)
4. [Panel CMS — Keystatic](#4-panel-cms--keystatic)
5. [Configuración obligatoria](#5-configuración-obligatoria)
6. [Diseño y tema visual](#6-diseño-y-tema-visual)
7. [Páginas principales](#7-páginas-principales)
8. [Colecciones de contenido](#8-colecciones-de-contenido)
9. [Imágenes](#9-imágenes)
10. [SEO](#10-seo)
11. [Deploy en Netlify](#11-deploy-en-netlify)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)

---

## 1. Requisitos previos

- **Node.js 18 o superior** — [descargar](https://nodejs.org)
- **npm 9 o superior** (incluido con Node.js)
- Una cuenta en **Netlify** para el deploy (gratuita)
- Git instalado (opcional pero recomendado)

Verificar versiones:

```bash
node --version   # debe ser v18 o superior
npm --version    # debe ser v9 o superior
```

---

## 2. Instalación

```bash
# 1. Clonar o descargar el template
git clone <url-del-repo> mi-nuevo-nicho
cd mi-nuevo-nicho

# 2. Instalar dependencias
npm install
```

---

## 3. Iniciar un nuevo nicho

Antes de arrancar el servidor, ejecuta el script de inicialización. Te hace 8 preguntas y genera los archivos base automáticamente:

```bash
npm run init-niche
```

Ejemplo de sesión:

```text
  Nombre del negocio:                    Fontanería García
  Servicio principal (ej: fontanería):   fontanería
  Ciudad principal:                      Málaga
  Teléfono:                              600 123 456
  WhatsApp (enter = mismo):              [enter]
  Email:                                 info@fontaneria-malaga.com
  URL del sitio (opcional):              https://fontaneria-malaga.com
  Slogan corto (opcional):               Fontaneros de confianza en Málaga

  ✓  src/content/business/global.yaml actualizado
  ✓  src/content/services/fontaneria-malaga.mdx creado
  ✓  src/content/locations/malaga.mdx creado
```

El script genera:

- `business/global.yaml` — rellena nombre, servicio, ciudad, teléfono, email y URL
- Un servicio starter con slug `[servicio]-[ciudad].mdx`
- Una zona starter con el nombre de la ciudad

> A partir de aquí, todo se gestiona desde el CMS.

---

## 4. Panel CMS — Keystatic

### Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre en el navegador:

- **Web:** `http://localhost:4321`
- **CMS:** `http://localhost:4321/keystatic`

> El CMS solo está disponible en desarrollo. En producción no existe la ruta `/keystatic`.

### Estructura del panel

El CMS tiene tres secciones en el menú lateral:

| Sección | Contenido |
| --- | --- |
| ⚙️ **Configuración** | Mi Negocio, Diseño y Tema |
| 📝 **Contenido** | Páginas, Servicios, Zonas, Proyectos, Testimonios, Blog |
| 📄 **Páginas Legales** | Navegación, Footer, Aviso Legal, Privacidad, Cookies |

---

## 5. Configuración obligatoria

### 5.1 Mi Negocio (`⚙️ Configuración > Mi Negocio`)

Es el archivo central del template. Si ejecutaste `init-niche`, los campos básicos ya están rellenos. Revisa y completa el resto:

**Campos obligatorios** — sin estos el sitio no funciona correctamente:

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| Nombre del Negocio | Aparece en header, footer y SEO | `Fontanería García` |
| Servicio / Nicho | Tipo de servicio en minúsculas | `fontanería` |
| Tipo de Negocio | Schema.org para Google | `Plumber` |
| URL del Sitio | URL final sin barra al final | `https://fontaneria-malaga.com` |
| Teléfono | Con prefijo si es internacional | `600 123 456` |
| WhatsApp | Número para el botón flotante | `34600123456` |
| Ciudad Principal | Ciudad del negocio | `Málaga` |

**Campos importantes** — rellénalos para SEO y confianza:

| Campo | Descripción |
| --- | --- |
| Dirección | Calle y número completo |
| Coordenadas GPS | Latitud y longitud (busca en Google Maps) |
| Horario de Atención | Ej: `Lun–Vie 9:00–18:00` |
| Email de Contacto | Para el formulario de contacto |
| Eslogan / Lema | Aparece en el footer si no hay descripción personalizada |
| Año de Fundación | Para el Schema.org |
| Ciudades de cobertura | Lista de zonas donde trabajas |

**Campos opcionales** — solo si los usas:

| Campo | Descripción |
| --- | --- |
| Logo | Imagen del logo (PNG transparente recomendado) |
| Facebook / Instagram | URLs completas de tus perfiles |
| Google Analytics 4 ID | Ej: `G-XXXXXXXXXX` |
| Google Tag Manager ID | Ej: `GTM-XXXXXXX` |
| n8n Webhook | Para tracking de leads si usas n8n |

---

## 6. Diseño y tema visual

### `⚙️ Configuración > Diseño y Tema`

Todo el aspecto visual se controla desde aquí, sin tocar código.

### 🖌️ Identidad Visual

#### Colores del Tema

- Elige un tema base (industrial, sky\_white, forest, etc.)
- Puedes personalizar cada color individualmente: primario, secundario, acento, textos
- Los cambios afectan a toda la web en el próximo build

#### Tipografía

- Selecciona la pareja de fuentes: `modern`, `classic`, `sans`, etc.
- La previsualización muestra el aspecto real en el CMS

#### Escala tipográfica

- Controla el tamaño global de encabezados y textos
- Opciones: pequeño, normal, grande

### 📐 Estructura y Layout

| Ajuste | Opciones |
| --- | --- |
| Estilo del menú | Transparente (glass), sólido, minimal |
| Estilo del footer | Completo 4 columnas (SEO) / Simple solo legales |
| Estilo del hero | Con formulario lateral, centrado, ancho completo... |
| Tratamiento de títulos | Normal, subrayado, degradado, con badge... |
| Espaciado entre secciones | Compacto, normal, amplio |

### ✨ Efectos e Interactividad

| Ajuste | Opciones |
| --- | --- |
| Esquinas | Cuadradas, ligeramente redondeadas, muy redondeadas |
| Estilo de botones | Sólido, outline, con sombra, degradado |
| Sombras | Sin sombra, sutil, pronunciada |
| Opacidad del hero | 0.0 (transparente) a 1.0 (negro total) |
| Animaciones de scroll | Sin animaciones, fade, slide, completas |
| Separadores de sección | Recto, diagonal, curvo, zigzag... |
| Textura de fondo | Sin textura, ruido, puntos, rejilla |

### 📞 Botones flotantes de contacto

Activa o desactiva el teléfono flotante y el botón de WhatsApp, tanto en móvil como en escritorio.

### 🛠️ Ajustes avanzados

| Ajuste | Descripción |
| --- | --- |
| Favicon | Icono de la pestaña del navegador. PNG 512×512 |
| Color barra móvil | Color hex para la barra del navegador en Android |
| CSS personalizado | Reglas CSS adicionales si necesitas algo muy específico |

---

## 7. Páginas principales

Las tres páginas principales (Home, Servicios, Zonas) ya vienen con estructura de bloques completa. Solo tienes que rellenar el texto.

### 7.1 Página de Inicio (`📝 Contenido > Página de Inicio`)

Viene pre-construida con 12 bloques en este orden:

| # | Bloque | Qué editar |
| --- | --- | --- |
| 1 | **Hero** | Título, subtítulo, texto del botón, features rápidas |
| 2 | **Intro SEO** | Párrafo de 2-3 frases con ciudad y servicio |
| 3 | **Ventajas** | 3 tarjetas de confianza (título, descripción, icono) |
| 4 | **Servicios** | Se rellena automáticamente desde la colección |
| 5 | **Estadísticas** | Años de experiencia, proyectos, satisfacción |
| 6 | **Sobre nosotros** | Descripción de la empresa, imagen, dos puntos clave |
| 7 | **Proceso** | 4 pasos de cómo trabajas |
| 8 | **Testimonios** | Se rellena desde la colección de Testimonios |
| 9 | **Zonas** | Grupos de zonas donde trabajas |
| 10 | **FAQ** | 4 preguntas frecuentes con respuesta |
| 11 | **Contacto** | Teléfono, horario, tiempo de respuesta |
| 12 | **CTA final** | Llamada a la acción con tres puntos clave |

> **SEO:** Si dejas el campo SEO vacío, el título y descripción se generan automáticamente desde los datos del negocio. Solo rellénalo si quieres personalizar lo que ve Google.

### 7.2 Página de Servicios (`📝 Contenido > Servicios Hub`)

Viene con 5 bloques: Hero → Franja de confianza → Ventajas → FAQ → CTA.

El listado de servicios se añade automáticamente debajo de los bloques desde la colección.

### 7.3 Página de Zonas (`📝 Contenido > Zonas Hub`)

Viene con 4 bloques: Hero → Franja de confianza → Ventajas → CTA.

El listado de zonas se añade automáticamente desde la colección.

### 7.4 Página Nosotros (`📝 Contenido > Nosotros`)

Edita directamente los campos: título, historia, valores, por qué elegirnos y CTA.

---

## 8. Colecciones de contenido

### 8.1 Servicios (`📝 Contenido > Servicios`)

Cada servicio es una página independiente con su propia URL (`/servicios/[slug]`).

Para crear un nuevo servicio:

1. Clic en "Añadir entrada"
2. Escribe el título — el slug se genera automático con la ciudad al final
3. Rellena los campos básicos:
   - **Icono:** Nombre de un icono Lucide (Wrench, Hammer, Shield, etc.)
   - **Descripción corta:** 1-2 frases para las tarjetas de la home
   - **Destacado:** Actívalo para que aparezca en la home
4. Usa los bloques para construir la página del servicio

**Campos SEO del servicio:** Si lo dejas vacío, se genera desde el título y la ciudad.

### 8.2 Zonas de Servicio (`📝 Contenido > Zonas de Servicio`)

Cada zona tiene su propia página (`/zona/[slug]`).

Para crear una nueva zona:

1. Clic en "Añadir entrada"
2. Nombre de la zona (barrio, municipio, etc.)
3. Tipo: Residencial, Industrial o Centro Urbano
4. Opcional: imagen hero, coordenadas, código postal

Las zonas aparecen automáticamente en el footer y en la página de zonas.

### 8.3 Testimonios (`📝 Contenido > Testimonios`)

Los testimonios se muestran en el bloque de testimonios de la home.

Campos:

- Nombre del cliente
- Texto del testimonio
- Puntuación (1-5 estrellas)
- Servicio contratado
- Fecha

### 8.4 Proyectos (`📝 Contenido > Proyectos`)

Galería de trabajos realizados. Aparece en `/proyectos/`.

Campos:

- Título del proyecto
- Imagen principal (se sube a `public/images/projects/`)
- Galería de fotos adicionales
- Descripción del trabajo

### 8.5 Blog (`📝 Contenido > Blog`)

Artículos de blog en `/blog/`. Útil para SEO de cola larga.

---

## 9. Imágenes

### Cómo funciona la optimización

Las imágenes del template se gestionan en dos niveles:

- **Imágenes del código** (`src/assets/`) — iconos, decorativas, fondos del tema. Las optimiza Astro en tiempo de build con el componente `<Image>`.
- **Imágenes de contenido** (`public/images/`) — las que subes desde Keystatic. Las sirve **Netlify Image CDN** automáticamente en producción: convierte a WebP, redimensiona según el dispositivo y las cachea en el edge.

No tienes que ejecutar ningún script manual. En producción todas las imágenes se sirven optimizadas automáticamente.

> En desarrollo local las imágenes se sirven tal cual (sin optimización). Eso es normal.

### Flujo para subir una imagen

```text
1. Prepara la imagen en tu ordenador (ver tamaños abajo)
2. Keystatic → el campo de imagen del servicio/zona/bloque
3. Sube desde el selector de archivos de Keystatic
4. Keystatic la guarda en public/images/[colección]/
5. git add . → git commit → git push
6. Netlify despliega y el CDN optimiza automáticamente
```

No toques la carpeta `public/images/` a mano. Usa siempre Keystatic para subir imágenes de contenido.

### Tamaños recomendados

| Tipo de imagen | Tamaño | Peso máximo |
| --- | --- | --- |
| Hero (fondo de página) | 1920×1080 px | 200 KB |
| Thumbnail servicio / zona | 800×600 px | 80 KB |
| Imagen de galería | 800×600 px | 80 KB |
| Blog / Open Graph | 1200×630 px | 150 KB |
| Logo empresa | SVG o 400×200 px | 20 KB |
| Favicon | PNG 512×512 px | 20 KB |

### Nomenclatura de archivos

El nombre del archivo es una señal SEO. Antes de subir, renombra siguiendo estas reglas:

- Minúsculas siempre
- Guiones en lugar de espacios (`-` no `_` ni espacios)
- Sin acentos ni ñ (`malaga` no `málaga`)
- Descriptivo: incluye el servicio y/o ciudad

```text
✅ hero-ventanas-aluminio-malaga.jpg
✅ cerramiento-terraza-marbella.jpg
✅ puerta-corredera-aluminio.jpg

❌ IMG_4821.jpg
❌ foto 1.jpg
❌ WhatsApp Image 2024-05-11.jpg
```

### Herramientas gratuitas para preparar imágenes

| Herramienta | Uso |
| --- | --- |
| [squoosh.app](https://squoosh.app) | Comprimir y convertir a WebP en el navegador |
| [tinypng.com](https://tinypng.com) | Comprimir JPG y PNG con un clic |
| [birme.net](https://www.birme.net) | Redimensionar por lotes |

El flujo habitual: abres la foto en Squoosh, eliges formato WebP, bajas la calidad a 80-85 y descargas. Sin instalar nada.

### Carpetas por colección

| Colección | Carpeta en `public/` |
| --- | --- |
| Servicios | `public/images/services/` |
| Zonas | `public/images/locations/` |
| Blog | `public/images/blog/` |
| Proyectos | `public/images/projects/` |
| Páginas (inicio, zonas…) | `public/images/pages/` |
| Logos de clientes | `public/images/logos/` |

Keystatic selecciona la carpeta correcta automáticamente según el campo donde subas la imagen.

---

## 10. SEO

### Funcionamiento automático

El template genera automáticamente sin que hagas nada:

- **Title tag** — `[Servicio] en [Ciudad] | [Nombre del negocio]`
- **Meta description** — Generada desde el servicio, ciudad y nombre
- **Schema.org LocalBusiness** — Desde los datos de `Mi Negocio`
- **Schema.org FAQPage** — Desde los bloques de preguntas frecuentes
- **Sitemap XML** — Se regenera en cada build
- **Open Graph** — Para compartir en redes sociales
- **Imágenes OG dinámicas** — Por servicio y zona

### Personalizar SEO por página

Cada página y cada servicio/zona tiene un campo "SEO Google Preview" en Keystatic con previsualización en tiempo real. Si lo dejas vacío, se usa el automático. Si lo rellenas, sobrescribe el automático.

### Campos SEO clave en `Mi Negocio`

- **SEO Google Preview** — Título y descripción para la home
- **Ciudades de cobertura** — Afecta al Schema.org `areaServed`
- **Coordenadas GPS** — Para Google Maps y Schema.org
- **Horario Schema.org** — Para el panel de Google Business

---

## 11. Deploy en Netlify

### Primera vez

1. Sube el repositorio a GitHub (o GitLab)
2. En [netlify.com](https://netlify.com): "Add new site" → "Import an existing project"
3. Conecta el repositorio
4. La configuración de build ya está definida en `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20
5. Clic en "Deploy site"

### Dominio personalizado

1. En Netlify: "Domain settings" → "Add custom domain"
2. Configura los DNS en tu registrador apuntando a Netlify
3. El certificado SSL se activa automáticamente

### Actualizaciones de contenido

Cada vez que guardes cambios en Keystatic (en local), los archivos MDX/YAML se actualizan en tu repositorio. Para publicar:

```bash
git add .
git commit -m "feat: actualizar contenido"
git push
```

Netlify detecta el push y re-deploya automáticamente en 1-2 minutos.

---

## 12. Preguntas frecuentes

### ¿Puedo usar el template para más de un nicho?

Sí. Clona el repositorio en una carpeta nueva y ejecuta `npm run init-niche` para cada nicho.

### ¿Keystatic guarda los datos en una base de datos?

No. Todo se guarda en archivos de texto (MDX, YAML, JSON) dentro del propio repositorio. Es lo que permite el deploy estático.

### ¿Puedo tener el CMS online sin correr el servidor local?

El CMS de Keystatic solo funciona en desarrollo local. En producción, el sitio es estático. Si necesitas un CMS online, considera Keystatic Cloud (de pago) o cambiar a un headless CMS.

### ¿Qué pasa si dejo campos SEO vacíos?

El sistema genera títulos y descripciones automáticamente desde los datos del negocio. El sitio no saldrá sin SEO aunque no rellenes nada.

### ¿Cómo cambio el color de la marca?

`⚙️ Configuración > Diseño y Tema > Colores del Tema`. Cambia el color primario y el resto de la web se actualiza al próximo build.

### El build falla, ¿qué hago?

Ejecuta `npm run check:site` para ver errores antes del build. Los más comunes son campos obligatorios vacíos o imágenes que no existen.

### ¿Puedo añadir páginas que no están en el template?

Sí, creando archivos `.astro` en `src/pages/`. Para que tengan soporte en el CMS hay que crear el singleton o colección correspondiente en Keystatic.

---

## Flujo de trabajo resumido

```text
1.  npm install
2.  npm run init-niche          ← rellena datos básicos
3.  npm run dev                 ← arranca servidor
4.  localhost:4321/keystatic    ← abre el CMS
5.  ⚙️  Mi Negocio              ← completa los campos
6.  ⚙️  Diseño y Tema           ← elige colores y fuentes
7.  📝 Servicios                ← crea los servicios
8.  📝 Zonas                    ← crea las zonas
9.  📝 Testimonios              ← añade 3-5 testimonios
10. 📝 Página de Inicio         ← rellena los textos
11. git push                    ← publica en Netlify
```

---

*Template desarrollado por Olga Millán para rankrent.online*
*Template desarrollado con Astro 5 + Keystatic + Tailwind CSS + Netlify.*
