# 🧰 Scripts del template — referencia completa

> Qué hace cada script de `scripts/`, cómo se usa y qué necesita.
> Ordenados por momento de uso en el ciclo de vida de una web.

## Vista rápida

| Comando | Script | Para qué | Cuándo |
|---|---|---|---|
| `npm run init-niche` | `init-niche.mjs` | Crear un nicho nuevo (datos + ADN de diseño) | Al empezar un clon |
| `npm run design-dna` | `utils/design-dna.mjs` | Proponer/aplicar recetas de diseño | Al empezar o rediseñar |
| `npm run seo-wizard` | `seo-wizard.mjs` | ⭐ Pipeline SEO por fases: contexto → plan → home → outline/write por página | Todo el contenido |
| `npm run strategy-wizard` | `strategy-wizard.mjs` | (legacy) Planificación SEO con Gemini (UI web) | Sustituido por seo-wizard |
| `npm run content-wizard` | `content-wizard.mjs` | (legacy) Página suelta de servicio/zona | Sustituido por seo-wizard |
| `npm run images:prepare` | `optimize-to-folder.mjs` | Optimizar fotos nuevas antes de subirlas | Al preparar imágenes |
| `npm run optimize-images` | `optimize-images.mjs` | Convertir a WebP lo ya subido en `public/images/` | Mantenimiento |
| `npm run setup-fonts` | `setup-fonts.mjs` | Self-hostear el par de fuentes elegido | Una vez por clon |
| `npm run check:site` | `preflight.mjs` | Validar calidad/SEO sin build | Antes de publicar |
| `npm run build` | `preflight.mjs` + astro | Preflight + build de producción | Al publicar |
| `npm run indexnow` | `indexnow.mjs` | Notificar URLs a Bing/IA | Después de publicar |
| `npm run export -- <carpeta>` | `utils/export_client.js` | Copia limpia para entregar (sin scripts de IA) | Al entregar a cliente |
| `npm run reset` (= `fresh`) | `utils/reset.js` | ⚠️ Resetear el template a placeholders | Solo en el repo template |

---

## Ciclo de vida: nuevo clon

### `npm run init-niche` — asistente de nuevo nicho
Hace 8 preguntas (nombre, servicio, ciudad, teléfono…) y:
- Rellena `src/content/business/global.yaml`
- Reemplaza placeholders en home/servicios/zonas
- Crea un servicio y una zona starter
- **Propone un ADN de diseño** (Enter = aceptar, `r` = otra, `s` = saltar)

No sobreescribe servicios/zonas que ya existan.

### `npm run design-dna` — recetas de diseño
10 combinaciones curadas de tema + fuentes + hero + efectos. Escribe en
`src/content/design/global.yaml` (preserva tu configuración de botones flotantes).

```bash
npm run design-dna              # interactivo: propone al azar
npm run design-dna -- --list    # ver las 10 recetas
npm run design-dna -- --apply forja_oscura
```

### `npm run setup-fonts` — fuentes self-hosted
Lee el par de fuentes activo en `design/global.yaml`, instala los paquetes
`@fontsource` correspondientes, genera `src/styles/fonts-local.css` y activa
`selfHostFonts: true` (deja de cargar Google Fonts → mejor LCP, GDPR-friendly).

```bash
npm run setup-fonts             # instala y activa
npm run setup-fonts -- --dry    # solo muestra qué haría
```

Si cambias de par de fuentes en el CMS, vuelve a ejecutarlo.

---

## Ciclo de vida: contenido con IA

### `npm run seo-wizard` — ⭐ el pipeline recomendado (Claude CLI)

> 📘 **Guía completa con ejemplos reales:** [SEO-WIZARD.md](./SEO-WIZARD.md)

Flujo completo por fases donde **cada fase alimenta a la siguiente** (sigue el playbook
Rank Masters al pie de la letra: el contexto se extrae del cliente sin inventar, los
buyer personas los genera la IA desde ese contexto). Todo se guarda numerado en
`seo-proyecto/` para revisar en orden.

```bash
npm run seo-wizard preguntas                       # cuestionario de discovery para el cliente
npm run seo-wizard contexto -- --transcript t.txt  # 01: estructura su transcripción (Prompt 01, no inventa)
npm run seo-wizard personas                        # 02: genera buyer personas desde el contexto
npm run seo-wizard plan                            # 03: arquitectura + keywords validadas
npm run seo-wizard plan -- --csv carpeta-csvs/     #     (con CSVs de Google Keyword Planner)
npm run seo-wizard home                            # genera la HOME (pipeline dedicado)
npm run seo-wizard outline service <slug>          # 05+06+07: competencia + jerarquía + maquetación
npm run seo-wizard write service <slug>            # 08+09+10: texto + copy + FAQ GEO, desde el outline aprobado
npm run seo-wizard outline zona <slug>             # igual para zonas
npm run seo-wizard write zona <slug>
npm run seo-wizard status                          # progreso (○ pendiente · ◐ outline · ✓ generada)
```

Qué hace cada fase:

- **preguntas** — genera el cuestionario para mandarle al cliente por WhatsApp.
- **contexto** — SOLO estructura lo que aporta el cliente (transcripción o pegado), nunca
  inventa: lo que falta queda como `(sin datos — completar)`. **Revísalo a mano.**
- **personas** — la IA sí genera aquí los buyer personas, a partir del contexto ya
  revisado, con sus frases de búsqueda en Google (alimentan el keyword research).
- **plan** — brainstorm de arquitectura (solo keywords transaccionales), validación con
  volúmenes reales (DataForSEO o CSVs del Keyword Planner), clustering por intención y
  variantes exhaustivas, con **auditoría de canibalización par-a-par** (fusiona páginas
  que compiten por la misma intención, ej. "pérgola" y "cerramiento de porche"), y añade
  las zonas de `areaServed`. Muestra la hipótesis y pide confirmación antes de gastar en
  validación. **Revisa/edita `seo-proyecto/plan.json` antes de continuar.**
- **home** — pipeline dedicado en un solo paso (usa componentes propios de la home).
- **outline** (service/zona) — analiza los 3 primeros competidores de Google (DataForSEO
  SERP + claude WebFetch, o `--competitors u1,u2,u3`), define la jerarquía H1/H2/H3, y
  elige qué bloques usar de un catálogo (`trust_strip`, `problem_solution`, `materials`,
  `comparison`, `process`, `price_factors`, `stats`, `content`, + `faq`/`cta` siempre).
  Los bloques `materials`/`comparison` son la pieza clave contra la canibalización: cubren
  variantes de producto (tipos, opción A vs B) *dentro* de una página en vez de partirlas
  en dos. Guarda `seo-proyecto/outline-<tipo>-<slug>.json` — **no escribe ningún .mdx
  todavía. Revísalo y edítalo antes de continuar.**
- **write** (service/zona) — escribe el texto siguiendo el outline aprobado, aplica una
  **capa de copy en llamada separada** (paso 09 del playbook), genera el FAQ GEO,
  verifica cobertura de keywords (reintegra las que falten) y descarta bloques repetidos
  si el modelo se excede. **Prohibido afirmar nada no confirmado en el contexto** (taller
  propio, garantías, plazos...). Escribe el MDX final con backup del anterior.

Flags: `--dry-run` (muestra el JSON sin escribir), `--competitors url1,url2,url3`,
`--yes` (plan: no pedir confirmación de la arquitectura).

Pendiente manual tras generar: imágenes hero y **testimonios reales** (nunca se
generan testimonios inventados). Guía completa: [SEO-WIZARD.md](./SEO-WIZARD.md).

**Requiere:** `claude` CLI con sesión. Opcional: DataForSEO en `.env`.

### `npm run strategy-wizard` — planificación SEO (UI web) · legacy
Abre una interfaz en `http://localhost:3333` para planificar la estrategia completa
del nicho: análisis de competencia (scrapea URLs), clustering de keywords y plan de
contenidos. Genera `src/content/business/avatar.yaml` (el "avatar" del negocio que
usan los prompts) y páginas MDX.

**Requiere:** `GEMINI_API_KEY` en `.env`.

### `npm run content-wizard` — generador de servicios/zonas · legacy
Genera páginas MDX de servicio o zona con bloques y SEO listos, usando el CLI de
Claude (necesita sesión activa) y opcionalmente datos reales de keywords vía
DataForSEO.

```bash
npm run content-wizard          # interactivo
node scripts/content-wizard.mjs --type service --keyword "fontanería urgente" --city "Sevilla"
node scripts/content-wizard.mjs --type location --city "Triana" --niche "fontanería"
node scripts/content-wizard.mjs --keyword "carpintería" --city "Madrid" --dry-run
```

**Requiere:** `claude` CLI con sesión. Opcional: `DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD` en `.env`.

---

## Ciclo de vida: imágenes

Flujo recomendado: fotos crudas → `images:prepare` → subir las optimizadas desde Keystatic.

### `npm run images:prepare` — optimizar fotos ANTES de subirlas
Coge todo lo que pongas en la carpeta `incoming-images/` (fotos de cliente, con
cualquier nombre) y deja en `optimized-images/` versiones listas para web:
- Redimensiona a máx. 1600px, corrige la rotación EXIF (fotos de móvil)
- Genera `.jpg` (mozjpeg progresivo, q80) y `.webp` (q80)
- Limpia los nombres: `Foto Reja Ñuño (1).JPG` → `foto-reja-nuno-1.jpg`

### `npm run optimize-images` — convertir a WebP lo ya subido
Recorre `public/images/{services,locations,blog,projects,testimonials,uploads,serviceAreas}`
y crea un `.webp` (máx. 1200px, q85) junto a cada `.jpg/.png` que encuentre.
No borra los originales.

---

## Ciclo de vida: publicar

### `npm run check:site` — preflight de calidad
Valida sin hacer build. Errores (bloquean `npm run build`) y avisos:
- Datos del negocio completos y sin placeholders
- SEO title/description presentes y con longitud correcta
- robots.txt sin bloqueos a crawlers de IA
- Imágenes OG estáticas < 300 KB
- `areaServed` con municipios
- Páginas Servicio × Zona con 250+ palabras

### `npm run indexnow` — notificar tras el deploy
Envía las URLs del sitemap a IndexNow (Bing, Yandex, buscadores de IA).
Necesita `INDEXNOW_KEY` en `.env` (genera una con `openssl rand -hex 16`).
Sin clave no hace nada (no rompe ningún flujo). Ejecutar **después** de desplegar.

---

## Entrega y mantenimiento

### `npm run export -- <nombre-carpeta>` — entregar a cliente
Crea una copia del proyecto en `../<nombre-carpeta>` lista para entregar:
- Excluye `node_modules`, `.git`, `.env`, `dist` y **toda la carpeta `scripts/`**
  (la "salsa secreta" de IA no se entrega)
- Mantiene Keystatic para que el cliente pueda editar contenido
- Limpia `package.json` (quita `reset` y `export`) e inicializa un git nuevo

```bash
npm run export -- cliente-pintores-bcn
```

### `npm run reset` (alias: `npm run fresh`) — ⚠️ DESTRUCTIVO
Devuelve el template al estado placeholder: **borra** servicios, zonas, blog,
proyectos, testimonios, imágenes no esenciales, `avatar.yaml` y el plan de
estrategia, y resetea `business/global.yaml` y las páginas a plantilla.

- Pide confirmación (escribe `SI`); para automatizar: `npm run reset -- --yes`
- **Solo tiene sentido en el repo del template.** Nunca lo ejecutes en la carpeta
  de una web de cliente: perderías todo el contenido.

---

## Internos / sin comando npm

| Archivo | Qué es |
|---|---|
| `scripts/utils/design-dna.mjs` | Módulo del ADN de diseño (también CLI, ver arriba) |
| `scripts/strategy-wizard-ui.html` | La interfaz web que sirve strategy-wizard en :3333 |
| `scripts/maintenance/` | Migraciones puntuales ya ejecutadas (histórico) |

## Requisitos externos por script

| Script | Necesita |
|---|---|
| seo-wizard | `claude` CLI con sesión activa; opcional DataForSEO en `.env` |
| content-wizard | `claude` CLI con sesión activa; opcional DataForSEO en `.env` |
| strategy-wizard | `GEMINI_API_KEY` en `.env` |
| indexnow | `INDEXNOW_KEY` en `.env` |
| export | `rsync` (incluido en macOS/Linux) |
| setup-fonts, images:* | ninguno (todo local) |
