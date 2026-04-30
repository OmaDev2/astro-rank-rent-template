# Guía de Inicio Rápido

Este template viene con un negocio demo funcional (**Fontanería García, Madrid**) que muestra todas las funcionalidades. Sigue esta checklist para adaptarlo a tu negocio real.

---

## ✅ Checklist de Puesta en Marcha

### 1. Datos del Negocio
**Archivo:** `src/content/business/global.yaml`

- [ ] `siteName` — Nombre real de tu empresa
- [ ] `niche` — Tipo de servicio (ej: "Pintura", "Electricidad", "Reformas")
- [ ] `businessType` — Tipo Schema.org: `Electrician`, `Painter`, `Plumber`, `GeneralContractor`...
- [ ] `siteUrl` — URL de producción (sin barra final)
- [ ] `phone` — Teléfono real
- [ ] `whatsapp` — Número con prefijo internacional (ej: `34675568148`)
- [ ] `email` — Email de contacto
- [ ] `city` — Ciudad principal
- [ ] `address` — Dirección completa
- [ ] `coordinates.lat` / `coordinates.lng` — Coordenadas GPS (busca en Google Maps)
- [ ] `areaServed` — Lista de zonas/barrios que cubres
- [ ] `facebook` / `instagram` — URLs de tus perfiles sociales

### 2. Diseño y Tema
**Vía CMS:** `/admin` → Design → Theme

- [ ] Elige el par de fuentes (`fontPair`) que mejor encaje con tu marca
- [ ] Ajusta los colores primario y secundario a tu paleta corporativa
- [ ] Selecciona el estilo del hero (`heroStyle`): `split_form`, `centered`, `full_width`...

### 3. Servicios
**Carpeta:** `src/content/services/`

- [ ] Elimina los servicios demo (fontanería)
- [ ] Crea un `.mdx` por cada servicio real con hero, features y CTA
- [ ] Marca los 2-3 principales como `featured: true`
- [ ] Añade imágenes reales o usa URLs de Unsplash mientras tanto

### 4. Zonas de Cobertura
**Carpeta:** `src/content/locations/`

- [ ] Elimina las zonas demo (Madrid)
- [ ] Crea un `.mdx` por cada zona real que cubres
- [ ] La zona principal → tipo `centro`, con bloques completos y FAQ
- [ ] Zonas secundarias → tipo `residencial`, con solo hero y texto básico

### 5. Proyectos / Galería
**Carpeta:** `src/content/projects/`

- [ ] Elimina el proyecto demo
- [ ] Añade proyectos reales con foto, título, zona y tipo de servicio
- [ ] Marca los mejores como `featured: true` para la home

### 6. Testimonios
**Carpeta:** `src/content/testimonials/`

- [ ] Actualiza los testimonios con reseñas reales de clientes
- [ ] Mínimo 3 testimonios `featured: true` para la home

### 7. Página de Inicio
**Vía CMS:** `/admin` → Pages → Home

- [ ] Actualiza los textos del hero con tu propuesta de valor real
- [ ] Ajusta la sección de estadísticas con tus números reales
- [ ] Edita las preguntas frecuentes (FAQ) según tu negocio
- [ ] Configura las zonas de servicio en el bloque `service_areas`

### 8. Blog
**Carpeta:** `src/content/blog/`

- [ ] Reemplaza los posts demo con artículos sobre tu sector
- [ ] Mínimo 2-3 posts para el lanzamiento
- [ ] Mantén el blog activo: 1-2 posts mensuales mejoran el SEO local

### 9. SEO y Analytics
**Archivo:** `src/content/business/global.yaml` + CMS

- [ ] `siteUrl` correcto (impacta en todos los schemas)
- [ ] Añade tu ID de Google Tag Manager en el CMS si lo usas
- [ ] Añade tu código de Google Search Console en el CMS
- [ ] Verifica que `robots.txt` no bloquea nada importante en producción

### 10. Antes de Publicar

- [ ] Revisa todos los links del menú de navegación (`src/content/navigation/main.json`)
- [ ] Actualiza el aviso legal (`src/content/legal/aviso-legal.md`) con tus datos fiscales
- [ ] Actualiza la política de privacidad con tu NIF real
- [ ] Prueba el formulario de contacto y verifica que llegan los emails
- [ ] Comprueba que las imágenes cargan bien en móvil

---

## 📁 Estructura de Contenido

```
src/content/
├── business/global.yaml    ← ⭐ Datos del negocio (paso 1)
├── design/global.yaml      ← Tema y diseño (editar vía CMS)
├── services/               ← Un .mdx por servicio
├── locations/              ← Un .mdx por zona de cobertura
├── projects/               ← Galería de trabajos realizados
├── testimonials/           ← Reseñas de clientes (.json)
├── blog/                   ← Artículos del blog (.md o .mdx)
├── pages/
│   ├── home.mdx            ← Contenido de la home (editar vía CMS)
│   └── zonas.mdx           ← Hub de zonas (editar vía CMS)
├── about/index.json        ← Página "Sobre Nosotros"
└── legal/                  ← Aviso legal, privacidad, cookies
```

---

## 🚀 Arranque Local

```bash
npm install
npm run dev
# → http://localhost:4321
# → CMS: http://localhost:4321/admin
```

## 🏗️ Build de Producción

```bash
npm run build
npm run preview  # para verificar antes de subir
```

---

## 💡 Consejos SEO

- **Una zona = una página**: crea páginas individuales para cada zona, no pongas todo en una
- **Una zona + servicio = texto SEO local**: el bloque `location_services` en cada zona enlaza todos los servicios con texto tipo "Fontanería en Vallecas" — muy valioso para SEO local
- **FAQs en servicios y zonas**: el schema FAQ que se genera mejora la visibilidad en Google
- **Blog activo**: 1-2 artículos al mes sobre tu sector y ciudad mejoran la autoridad del dominio

---

*Template desarrollado para negocios de servicios locales. Para soporte o personalizaciones avanzadas, contacta al desarrollador.*
