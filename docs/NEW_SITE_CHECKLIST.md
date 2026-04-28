# Checklist para crear una nueva web con esta plantilla

Este documento detalla el proceso paso a paso para configurar y lanzar un nuevo sitio web utilizando esta plantilla de Astro + Keystatic, minimizando la necesidad de tocar código y trabajando principalmente desde el CMS.

## 1. Configuración inicial del negocio

- Revisar `src/content/business/global.yaml` desde Keystatic.
- Cambiar:
  - Nombre del negocio.
  - Nicho.
  - Ciudad principal.
  - Teléfono.
  - WhatsApp.
  - Email.
  - Dirección.
  - Horario.
  - Zonas de cobertura (`areaServed`).
  - `servicePriority`: orden de servicios en hubs, footer y bloques relacionados.
  - `locationPriority`: orden de zonas en hubs, footer y bloques relacionados.
  - `ctaTagline`: mensaje corto usado en CTAs globales.

## 2. Identidad visual

- Cambiar logo (ajustes de diseño).
- Cambiar favicon.
- Revisar colores (colores de marca y acento).
- Revisar tipografías.
- Revisar estilo de botones (redondeados, cuadrados, etc.).
- Revisar radius/sombras de las tarjetas.
- Revisar imágenes base.

## 3. Navegación

- Revisar el menú de navegación (Navbar) desde Keystatic.
- Revisar los enlaces del pie de página (Footer).
- Confirmar enlaces básicos:
  - `/` (Home)
  - `/servicios/`
  - `/zonas/`
  - `/nosotros/`
  - `/proyectos/`
  - `/contacto/`
- Comprobar que no haya rutas 404 en el menú.

## 4. Home

- Editar la página de inicio desde Keystatic.
- Revisar bloque a bloque:
  - Hero (título, descripción, imagen).
  - Servicios destacados.
  - Zonas destacadas.
  - Proceso de trabajo.
  - Ventajas/Diferenciadores.
  - FAQ (Preguntas frecuentes).
  - CTA final.
- **Importante**: Confirmar que los textos no mencionen el negocio anterior.

## 5. Servicios

- Crear o editar los servicios en `src/content/services/`.
- Para cada servicio revisar:
  - Título y SEO Title.
  - Meta description única.
  - Hero (título, descripción e imagen).
  - Contenido principal (detalles técnicos, beneficios).
  - Imágenes y galerías.
  - Alt text de todas las imágenes.
  - FAQ específica del servicio.
  - CTA (llamada a la acción).
  - Orden de bloques.
- Añadir los slugs prioritarios en `servicePriority`.
- Revisar la página hub `/servicios/`.

## 6. Zonas

- Crear o editar zonas en `src/content/locations/`.
- Para cada zona revisar:
  - Name (Nombre de la localidad).
  - Type (residencial, industrial, etc.).
  - SEO Title y Meta description.
  - Hero personalizado para la zona.
  - Contenido local único (referencias a la zona).
  - FAQ de la zona.
  - Mapa/Coordenadas.
  - Imágenes locales si aplica.
- Añadir los slugs prioritarios en `locationPriority`.
- Revisar la página hub `/zonas/`.
- **Recordatorio**:
  - Zonas con página individual = Se generan enlaces automáticos.
  - Zonas listadas pero sin página = Aparecen como texto/badge sin enlace.

## 7. Página Nosotros

- Editar el singleton "Nosotros" desde Keystatic.
- Revisar:
  - Hero (título e imagen).
  - Historia (contenido MDX).
  - Stats (Estadísticas: Proyectos, años, etc.).
  - Valores del negocio.
  - Equipo (descripción y miembros si aplica).
  - CTA final específico.
  - SEO.
- Confirmar que no queda contenido genérico de la plantilla.

## 8. Contacto

- Revisar la página de contacto.
- Confirmar:
  - Teléfono y enlaces de WhatsApp.
  - Email de contacto.
  - Dirección física si existe.
  - Funcionamiento del formulario.
  - Asunto de los mensajes/Automatización.
  - Mapa de Google Maps.

## 9. Proyectos / Trabajos

- Decidir si se utilizará la sección de proyectos.
- Añadir trabajos reales (fotos antes/después, descripción).
- Revisar imágenes y alt text.
- **Regla de oro**: Si no hay proyectos reales todavía, es mejor ocultar la sección que mostrar ejemplos ficticios.

## 10. Imágenes

- Sustituir todas las imágenes de relleno (placeholder).
- Usar imágenes reales del taller/obra siempre que sea posible.
- Optimizar peso para web (usar herramientas de compresión).
- Revisar formatos (preferiblemente WebP).
- Revisar alt text para accesibilidad y SEO.
- Revisar Hero images (alta calidad).
- Revisar galerías de servicios y zonas.

## 11. SEO on-page

- Confirmar un único `<h1>` por página.
- Confirmar Titles únicos y atractivos.
- Confirmar Meta Descriptions únicas que inciten al clic.
- Revisar Breadcrumbs (migas de pan).
- Revisar esquemas automáticos (FAQ, Service, LocalBusiness).
- Revisar Sitemap generado automáticamente.
- Revisar `robots.txt`.
- Revisar URLs canónicas.

## 12. Enlazado interno

- La Home debe enlazar a los hubs de `/servicios/` y `/zonas/`.
- El hub `/servicios/` enlaza a cada servicio individual.
- El hub `/zonas/` enlaza a cada zona con página.
- Los Servicios enlazan a las Zonas automáticamente (RelatedLocations).
- Las Zonas enlazan a los Servicios automáticamente (RelatedServices).
- El Footer debe tener enlaces a las páginas legales y hubs principales.
- El Navbar debe dar acceso a lo más importante.
- **Evitar**: Enlazar a zonas que no tienen contenido/página propia.

## 13. Legal

- Revisar y adaptar:
  - Aviso Legal.
  - Política de Privacidad.
  - Política de Cookies.
- Configurar el Banner de Cookies.
- Asegurar que figuran los datos fiscales correctos (NIF, Razón Social).
- Comprobar que no quedan datos de ejemplo (direcciones de Barcelona, etc.).

## 14. Reactivar blog

Si se quieren publicar artículos:

1. Restaurar loader glob de la colección blog en `src/content/config.ts`.
2. Reactivar `getStaticPaths` en `src/pages/blog/[...page].astro` y `src/pages/blog/[...slug].astro`.
3. Crear posts reales en `src/content/blog/`.
4. Ejecutar `npm run build`.

## 15. Revisión técnica

- Ejecutar en local: `npm run build`.
- Si el proyecto incluye preflight: `npm run preflight`.
- Revisar:
  - Ausencia de errores de TypeScript.
  - Rutas generadas en `dist/`.
  - Integridad del `sitemap-index.xml`.
  - Imágenes rotas o recursos no cargados.
  - Enlaces internos (que todos funcionen).
  - Errores 404 en consola.

## 16. Revisión visual

- Revisar en Desktop y Móvil (Responsive):
  - Página de inicio.
  - Hub de servicios y un servicio individual.
  - Hub de zonas y una zona individual.
  - Página de Nosotros.
  - Página de Contacto.
  - Menús y Footer.
  - Formularios de contacto.
  - Botones de WhatsApp y llamada.

## 17. Publicación

- Configurar dominio (DNS).
- Configurar hosting (Netlify, Vercel, etc.).
- Revisar variables de entorno (API keys, webhooks).
- Enviar Sitemap a Google Search Console.
- Configurar Google Analytics / Tag Manager.
- Revisar/Crear ficha en Google Business Profile.
- Añadir el enlace de la web en la ficha de Google.
- Subir fotos reales a Google Maps.
- Pedir las primeras reseñas reales.

## 18. Checklist final antes de publicar

- [ ] No quedan textos de "Metalisur" o la plantilla anterior.
- [ ] No quedan imágenes placeholder.
- [ ] No hay enlaces que den 404.
- [ ] Todos los CTAs tienen destino.
- [ ] No se enlazan zonas vacías.
- [ ] Los datos de contacto son correctos y funcionan (clic en teléfono/WA).
- [ ] No hay testimonios ficticios o no verificados.
- [ ] El Build es limpio y sin errores.
- [ ] `sitemap-index.xml` se genera correctamente.
- [ ] La web carga rápido y se ve bien en móvil.

---

## Orden recomendado de trabajo

1. Configuración global.
2. Identidad visual.
3. Servicios.
4. Zonas.
5. Home.
6. Nosotros.
7. Contacto.
8. SEO.
9. Revisión visual.
10. Publicación.
