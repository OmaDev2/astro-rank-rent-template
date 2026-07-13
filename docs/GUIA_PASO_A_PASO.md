# 🚀 Guía paso a paso: monta tu web con el template

> **Para quién es esta guía:** para cualquier persona, aunque no sea técnica. Vamos de cero
> (ordenador vacío) a **web publicada en internet**. Copia y pega los comandos tal cual.
>
> **Tiempo estimado:** 1-2 horas la primera vez (luego, 30-45 min por web).
>
> Si en algún momento quieres el detalle técnico de una sección, tienes la
> [Guía Completa](./GUIA_COMPLETA.md). Esta guía es la versión "para no perderse".

---

## 🗺️ El plan en 1 minuto

La web se monta así:

1. **Preparas tu ordenador** una sola vez (instalar 2 programas).
2. **Copias el template** a una carpeta nueva.
3. **Rellenas los datos del negocio** con un asistente que te hace preguntas.
4. **Editas el contenido** en un panel visual (como WordPress, pero local).
5. **Revisas** que todo está bien.
6. **Publicas** en internet (gratis, con Netlify).

No necesitas saber programar. Sí vas a usar la **Terminal** (una ventana negra donde escribes
comandos) para 4 o 5 comandos. Te los doy todos hechos.

---

## 📋 Glosario mínimo (para no asustarse)

| Palabra | Qué es, en cristiano |
|---|---|
| **Terminal** | Una ventana donde escribes órdenes al ordenador. En Mac se llama "Terminal". |
| **Comando** | Una orden que escribes en la Terminal y ejecutas con Enter. |
| **CMS** | El panel visual donde editas textos e imágenes sin tocar código. |
| **npm** | El programa que instala y arranca todo. Viene con Node.js. |
| **Deploy / desplegar** | Publicar la web en internet. |
| **Repo (repositorio)** | La carpeta de tu web guardada en GitHub (una copia de seguridad en la nube). |

---

## FASE 0 — Preparar el ordenador (solo la primera vez de tu vida)

Instala estos dos programas. Después de instalarlos, **no tendrás que volver a hacerlo nunca**.

1. **Node.js** → entra en [nodejs.org](https://nodejs.org) y descarga la versión **LTS**
   (el botón grande de la izquierda). Instálalo dándole a "Siguiente" a todo.
2. **Un editor de texto** (opcional pero recomendado): [Visual Studio Code](https://code.visualstudio.com).

**Comprobar que Node se instaló bien:** abre la Terminal (en Mac: `Cmd + Espacio`, escribe
"Terminal", Enter) y escribe:

```bash
node --version
```

Si te sale algo como `v20.11.0` (un número igual o mayor a 18), ✅ perfecto. Si da error,
reinstala Node.js.

> 💡 **Cuenta de Netlify:** crea una cuenta gratis en [netlify.com](https://netlify.com)
> (puedes entrar con tu Google). La necesitarás al final para publicar. También necesitarás
> una cuenta en [github.com](https://github.com) (gratis).

---

## FASE 1 — Copiar el template a una carpeta nueva

Cada web es una copia del template. En la Terminal, escribe estos comandos **uno a uno**
(cambia `fontaneria-malaga` por el nombre de tu proyecto, sin espacios ni tildes):

```bash
cd ~/Desktop
git clone https://github.com/OmaDev2/astro-rank-rent-template.git fontaneria-malaga
cd fontaneria-malaga
```

- `cd ~/Desktop` → nos movemos al Escritorio.
- `git clone ...` → descarga una copia del template en la carpeta `fontaneria-malaga`.
- `cd fontaneria-malaga` → entramos en esa carpeta.

> A partir de aquí, **la Terminal tiene que estar siempre dentro de esa carpeta.** Si cierras
> la Terminal, vuelve a abrirla y escribe `cd ~/Desktop/fontaneria-malaga`.

---

## FASE 2 — Instalar y arrancar

Instala todo lo que la web necesita (esto tarda 1-2 minutos la primera vez):

```bash
npm install
```

Verás mucho texto. Cuando pare y vuelva a aparecer la línea para escribir, está listo.

---

## FASE 3 — El asistente de inicio (rellena los datos básicos)

Este asistente te hace **8 preguntas** y crea los archivos base solo. Ejecuta:

```bash
npm run init-niche
```

Te preguntará, una a una (pulsa Enter tras cada respuesta):

```text
  Nombre del negocio:                    Fontanería García
  Servicio principal (ej: fontanería):   fontanería
  Ciudad principal:                      Málaga
  Teléfono:                              600 123 456
  WhatsApp (enter = mismo):              [pulsa Enter si es el mismo]
  Email:                                 info@fontaneria-malaga.com
  URL del sitio (opcional):              https://fontaneria-malaga.com
  Slogan corto (opcional):               Fontaneros de confianza en Málaga
```

**Al final te propondrá un diseño** (colores + fuentes + estilo) elegido para que tu web
no se parezca a otras hechas con el mismo template:

```text
  🎨 Tierra cálida (terracota, mediterráneo)
  ¿Aplicar? (Enter = sí · r = otra propuesta · s = saltar):
```

- **Enter** → lo acepta (podrás retocarlo después en el panel).
- **r** → te enseña otra propuesta distinta.
- **s** → lo salta (elegirás el diseño a mano en la FASE 6).

Cuando termine, habrá creado los datos del negocio, el diseño, un servicio y una zona de
ejemplo. ✅

---

## FASE 4 — Encender la web y el panel de edición

Arranca el "modo edición" (mantén esta Terminal abierta mientras trabajas):

```bash
npm run dev
```

Ahora abre el navegador (Chrome, Safari…) en estas dos direcciones:

- 👀 **Tu web (vista previa):** http://localhost:4321
- ✏️ **El panel de edición (CMS):** http://localhost:4321/keystatic

> ⚠️ El panel `/keystatic` **solo funciona aquí, en tu ordenador**. En la web publicada no
> existe, así que nadie de fuera puede entrar a editar. Es seguro.

Cada vez que guardes un cambio en el panel, la vista previa se actualiza sola. Si algo no
cambia, refresca la página del navegador.

> 💡 **¿Cómo paro el servidor?** En la Terminal, pulsa `Ctrl + C`. Para volver a arrancar:
> `npm run dev`.

---

## FASE 5 — Rellenar "Mi Negocio" (lo más importante)

En el panel (`/keystatic`), menú lateral → **⚙️ Configuración → Mi Negocio**. Rellena:

- **Nombre, teléfono, WhatsApp, email, ciudad, dirección** (si tienes local físico).
- **Horario** y **zonas que atiendes** (`areaServed`): añade los municipios donde trabajas.
  👉 Cada municipio que pongas aquí genera automáticamente su página de zona.
- **Título y descripción SEO** (lo que sale en Google).
- **Redes sociales, Google Analytics** (si tienes).

Pulsa **Save** (arriba). Los cambios se guardan en tu carpeta al instante.

---

## FASE 6 — Elegir el diseño (colores y fuentes)

Si aceptaste la propuesta de diseño del asistente (FASE 3), esta fase es solo un repaso.
Si la saltaste, elige aquí tu diseño.

Menú → **⚙️ Configuración → Diseño y Tema**:

- **Colores:** elige un tema o pon los colores de tu marca.
- **Par de fuentes:** elige uno de los estilos (Moderno, Robusto, Forja…).
- **Layout y efectos:** estilo de cabecera, botones, bordes redondeados, etc.

Guarda y mira la vista previa. Juega hasta que te guste.

> 💡 También puedes pedir propuestas de diseño completas desde la Terminal:
> `npm run design-dna` (Enter para aceptar, `r` para ver otra).

---

## FASE 7 — Crear los servicios

Menú → **📝 Contenido → Servicios → + Create**. Por cada servicio:

- **Título** (ej: "Reparación de fugas en Málaga").
- **Descripción corta**, **icono**, **imagen**.
- El **contenido** de la página (usa el editor de bloques: hero, características, FAQ, CTA…).

Crea entre 4 y 8 servicios. Guarda cada uno.

---

## FASE 8 — Crear las zonas

Menú → **📝 Contenido → Zonas de Servicio → + Create**. Por cada municipio importante:

- **Nombre** del municipio, **códigos postales**, **imagen**.
- Contenido con particularidades de esa zona (mejor texto único, no copiar-pegar).

> 💡 Las zonas que pusiste en **Mi Negocio → areaServed** ya aparecen enlazadas en la home
> aunque no les crees página. Crea página propia solo para las zonas que más te interesen.

---

## FASE 9 — Montar la Home y el resto de páginas

- **📝 Contenido → Página de Inicio:** ordena los bloques (hero, servicios, sobre nosotros,
  testimonios, CTA, contacto). Escribe títulos y textos.
- **Nosotros, Servicios Hub, Zonas Hub:** rellena sus textos.
- **📄 Páginas Legales:** Aviso legal, Privacidad, Cookies (obligatorio en España) y el
  Footer y menú de Navegación.

---

## FASE 10 — Imágenes

- Súbelas desde el propio panel (cada campo de imagen tiene botón para subir).
- **Antes de subir**, optimízalas: formato **WebP o JPG**, **máx. 150-200 KB** cada una.
  Herramienta gratis: [squoosh.app](https://squoosh.app).
- Pon siempre el **texto alternativo (alt)**: describe la foto (bien para SEO y accesibilidad).

Detalle de tamaños recomendados: ver [Guía Completa, sección 9](./GUIA_COMPLETA.md).

---

## FASE 11 — (Opcional, avanzado) Extras SEO

Solo si quieres exprimir el SEO. Puedes saltarte esta fase la primera vez.

### 🔤 Fuentes propias (mejor velocidad, sin depender de Google)
Después de elegir el par de fuentes en el CMS, ejecuta una vez:

```bash
npm run setup-fonts
```

Descarga las fuentes a tu web y deja de cargarlas de Google (mejora la velocidad).

### 📍 Páginas "servicio en municipio" (long-tail local)
Para captar búsquedas como *"reparación de fugas en Rincón de la Victoria"*. En el panel →
**📝 Contenido → 📍 Servicio × Zona → + Create**: elige el **servicio** y la **zona** de las
listas, y escribe un texto **único de mínimo 250 palabras**.

> ⚠️ No crees todas las combinaciones posibles: solo 2-3 servicios estrella × 3-4 zonas
> buenas, cada una con texto propio. Muchas páginas iguales perjudican el SEO.

---

## FASE 12 — Revisar antes de publicar

Con esto el sistema revisa que no falte nada importante. Ejecuta (necesitas otra Terminal o
para primero el `dev` con `Ctrl+C`):

```bash
npm run check:site
```

- Si sale **"Todo OK"** → listo para publicar. ✅
- Si salen **⚠ advertencias amarillas** → recomendaciones, no obligatorio corregir.
- Si sale **✗ error rojo** → hay que corregirlo (te dice qué falta) antes de publicar.

Luego repasa a ojo la web en http://localhost:4321 (móvil y escritorio). Checklist completo:
[NEW_SITE_CHECKLIST.md](./NEW_SITE_CHECKLIST.md).

---

## FASE 13 — Publicar en internet (Netlify)

### 13.1 Subir tu web a GitHub

Crea un repositorio nuevo (vacío) en [github.com](https://github.com/new) — ponle un nombre,
déjalo **Private**, y **NO** marques ninguna casilla de "Add README". Copia la URL que te da
(algo como `https://github.com/tuusuario/fontaneria-malaga.git`) y en la Terminal:

```bash
git add .
git commit -m "Web lista para publicar"
git branch -M main
git remote add origin https://github.com/tuusuario/fontaneria-malaga.git
git push -u origin main
```

> Si te pide usuario/contraseña de GitHub, usa tu usuario y un **token** (GitHub ya no acepta
> la contraseña normal). Guía: [crear token](https://github.com/settings/tokens).

### 13.2 Conectar Netlify

1. Entra en [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
2. Elige **GitHub** y selecciona tu repositorio.
3. Netlify detecta la configuración sola (`netlify.toml` ya está incluido). No cambies nada.
4. Pulsa **Deploy**. En 1-2 minutos tu web estará online en una dirección tipo
   `https://algo-aleatorio.netlify.app`. 🎉

### 13.3 Poner tu dominio propio

En Netlify → **Domain settings → Add custom domain** → escribe tu dominio y sigue los pasos
para apuntar los DNS. El candado SSL (https) se activa solo.

---

## FASE 14 — Después de publicar

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)):
   añade tu dominio y envía el sitemap: `https://tudominio.com/sitemap-index.xml`.
2. **(Opcional) IndexNow** — avisa a Bing y buscadores de IA para que te indexen rápido.
   Genera una clave, ponla en el archivo `.env` como `INDEXNOW_KEY=...`, vuelve a desplegar y
   ejecuta `npm run indexnow`.
3. **Ficha de Google Business Profile** (Google Maps) con los mismos nombre, dirección y
   teléfono que la web. Es lo que más mueve el SEO local.

---

## 🔄 Cómo cambiar contenido más adelante

Cada vez que quieras editar la web ya publicada:

```bash
cd ~/Desktop/fontaneria-malaga   # entrar en la carpeta
npm run dev                       # arrancar el editor
```

Edita en http://localhost:4321/keystatic, y cuando termines, para el servidor (`Ctrl+C`) y
publica los cambios:

```bash
git add .
git commit -m "Actualizo textos"
git push
```

Netlify vuelve a publicar solo en 1-2 minutos. ✨

---

## 🆘 Problemas típicos

| Síntoma | Solución |
|---|---|
| `command not found: npm` | No se instaló Node.js. Vuelve a la FASE 0. |
| La Terminal dice "no such file or directory" | No estás dentro de la carpeta. Escribe `cd ~/Desktop/tu-carpeta`. |
| El panel `/keystatic` no carga | ¿Está corriendo `npm run dev`? Debe estar activo en una Terminal. |
| `npm run build` da error rojo | Léelo: casi siempre es un dato que falta en "Mi Negocio". Corrígelo y repite. |
| Cambié algo y no se ve | Refresca el navegador. Si nada, para (`Ctrl+C`) y arranca `npm run dev` otra vez. |
| Publiqué pero sale la web antigua | Espera 2 min y refresca con `Cmd+Shift+R`. Netlify tarda un poco. |

---

## 📚 Para profundizar

- **[Guía Completa](./GUIA_COMPLETA.md)** — cada opción del CMS al detalle.
- **[Checklist de nueva web](./NEW_SITE_CHECKLIST.md)** — lista para no olvidar nada.
- **[README técnico](./README.md)** — stack y arquitectura.
