<!--
COLECCIÓN serviceAreas — páginas CURADAS servicio×zona (long-tail local).

Genera páginas del tipo "{servicio} en {municipio}", p. ej. /servicios/rejas-de-seguridad/utebo/.
Solo se crean las que definas aquí: NO es un producto cartesiano automático. Esto evita
contenido fino e index bloat (8 servicios × 10 zonas = 80 páginas sería penalizable).

REGLA DE ORO: cada combo necesita contenido ÚNICO (mín. 250 palabras). Curar 2-3 servicios
estrella × las 3-4 zonas con más búsqueda funciona mucho mejor que 80 páginas plantilla.
El preflight (npm run check:site) avisa si un combo es demasiado corto.

Formato de cada archivo (p. ej. rejas-de-seguridad-utebo.mdx):

---
service: rejas-de-seguridad      # slug de un servicio existente en src/content/services/
zona: utebo                      # slug de una zona existente en src/content/locations/
title: Rejas de seguridad en Utebo | HerreroZaragoza   # opcional (si no, se autogenera)
description: Instalación de rejas de seguridad en Utebo…  # opcional (meta description)
heroImage: /images/services/rejas/hero.webp             # opcional
faq:                                                     # opcional (schema FAQPage)
  - question: ¿Cuánto tarda la instalación en Utebo?
    answer: Normalmente 24-48h desde la medición…
---

Aquí va el contenido ÚNICO del combo: por qué este servicio en esta zona, casos locales,
materiales, precios orientativos, particularidades del municipio, etc. (mín. 250 palabras).

Las páginas se enlazan solas entre sí (mismo servicio en otras zonas / otros servicios en
esta zona) y hacia el servicio y la zona padre. Se incluyen en el sitemap automáticamente.
-->
