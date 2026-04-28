# Gestión de imágenes en el template Astro

Este documento explica cómo preparar, optimizar, nombrar y usar imágenes en una web creada con este template.

---

## 1. Regla principal

En este template hay dos formas de manejar imágenes:

### Imágenes en `public/images`

Se usan con rutas públicas.

Archivo real:

```txt
public/images/services/ventanas/imagen.jpg
```

URL en la web:

```txt
/images/services/ventanas/imagen.jpg
```

Nunca usar:

```txt
/public/images/...
```

---

### Imágenes en `src/assets`

Se usan cuando Astro debe procesarlas directamente con `astro:assets`.

Ejemplo:

```astro
---
import { Image } from "astro:assets";
import heroImage from "../assets/images/hero-home.png";
---

<Image src={heroImage} alt="Texto descriptivo" />
```

---

## 2. Uso recomendado

Para imágenes editables desde Keystatic, MDX o contenido:

```txt
public/images/
```

Para imágenes fijas importadas en componentes Astro:

```txt
src/assets/images/
```

En este template, muchas imágenes de contenido, servicios, home y páginas editables van en:

```txt
public/images/
```

Por eso la URL final siempre empieza por:

```txt
/images/
```

---

## 3. Estructura recomendada de carpetas

Ejemplo para METALISUR:

```txt
public/images/
  services/
    ventanas-de-aluminio-malaga/
    puertas-de-aluminio-malaga/
    cerramientos-aluminio-malaga/
    persianas-de-aluminio-malaga/
    barandillas-metalicas-malaga/
    armarios-aluminio-malaga/
    cocinas-exteriores-aluminio-malaga/
  metalisur/
    taller/
  home/
  about/
  blog/
```

Para otra web, adaptar las carpetas al negocio.

Ejemplo para fontanería:

```txt
public/images/services/desatascos/
public/images/services/fontaneria-urgente/
public/images/services/reparacion-fugas/
```

Ejemplo para reformas:

```txt
public/images/services/reformas-integrales/
public/images/services/reformas-banos/
public/images/services/reformas-cocinas/
```

---

## 4. Nombres de archivo

Los nombres deben ser claros, descriptivos y sin caracteres raros.

Correcto:

```txt
ventanas-aluminio-gris-listas-instalacion-taller-metalisur.jpg
cerramiento-acristalado-aluminio-blanco-oficina-metalisur.jpg
puerta-aluminio-cristal-exterior-vivienda-metalisur.jpg
```

Incorrecto:

```txt
IMG_1234.jpg
WhatsApp Image 2026.jpeg
foto nueva copia.png
Captura de pantalla.png
```

Reglas:

```txt
- Usar minúsculas
- No usar espacios
- No usar acentos
- No usar ñ
- Separar palabras con guiones
- Incluir el servicio o contexto
- Incluir ciudad si tiene sentido SEO
- Incluir marca si aporta contexto
```

---

## 5. Alt text

Cada imagen debe tener un `alt` descriptivo.

Ejemplo bueno:

```txt
Ventanas de aluminio gris listas para instalación en el taller de Metalisur
```

Ejemplos malos:

```txt
imagen
foto
ventana
metalisur
```

Reglas para el alt:

```txt
- Describir lo que se ve
- No repetir palabras clave de forma artificial
- No escribir frases demasiado largas
- No usar "imagen de" salvo que aporte claridad
- Incluir servicio, material o contexto real
```

---

## 6. Caption

El caption puede ser más comercial o explicativo.

Ejemplo:

```txt
Carpintería de aluminio terminada y organizada antes de salir a obra.
```

Diferencia:

```txt
Alt = describe la imagen.
Caption = explica o vende el trabajo.
```

---

## 7. Ejemplo completo

Archivo real:

```txt
public/images/services/ventanas-de-aluminio-malaga/ventanas-aluminio-gris-listas-instalacion-taller-metalisur.jpg
```

URL para usar en contenido:

```txt
/images/services/ventanas-de-aluminio-malaga/ventanas-aluminio-gris-listas-instalacion-taller-metalisur.jpg
```

Alt:

```txt
Ventanas de aluminio gris listas para instalación en el taller de Metalisur
```

Caption:

```txt
Carpintería de aluminio terminada y organizada antes de salir a obra.
```

---

## 8. Uso en Markdown o MDX

```md
![Ventanas de aluminio gris listas para instalación en el taller de Metalisur](/images/services/ventanas-de-aluminio-malaga/ventanas-aluminio-gris-listas-instalacion-taller-metalisur.jpg)
```

---

## 9. Uso en frontmatter MDX

```yaml
heroImage: /images/services/ventanas-de-aluminio-malaga/ventanas-aluminio-gris-listas-instalacion-taller-metalisur.jpg
heroImageAlt: Ventanas de aluminio gris listas para instalación en el taller de Metalisur
```

---

## 10. Optimización de imágenes

Flujo seguro:

```txt
incoming-images/ → optimized-images/ → public/images/...
```

No optimizar directamente sobre `public/images` salvo que el script esté muy controlado.

---

## 11. Carpetas temporales

Crear carpetas:

```bash
mkdir -p incoming-images optimized-images
```

Añadir a `.gitignore`:

```gitignore
incoming-images/
optimized-images/
```

---

## 12. Script recomendado

Usar:

```txt
scripts/optimize-to-folder.mjs
```

Ejecutar:

```bash
node scripts/optimize-to-folder.mjs
```

Entrada:

```txt
incoming-images/
```

Salida:

```txt
optimized-images/
```

Resultado esperado:

```txt
optimized-images/
  imagen-optimizada.jpg
  imagen-optimizada.webp
```

---

## 13. Formatos recomendados

Para uso normal en el template:

```txt
.jpg  → imagen principal segura
.webp → versión ligera opcional
```

En Keystatic o contenido, normalmente usar:

```txt
.jpg
```

Mantener también `.webp` puede servir para futuras mejoras.

---

## 14. Cuidado con las extensiones

Nunca debe ocurrir esto:

```txt
imagen.jpg con contenido real WebP
imagen.png con contenido real WebP
```

Para comprobarlo:

```bash
find public/images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | xargs -0 file | grep -Ei "web/p|riff|webp"
```

Resultado correcto:

```txt
Sin salida
```

Si aparece algo, hay archivos con extensión incorrecta.

---

## 15. Comprobar formato real de una imagen

```bash
file public/images/ruta/imagen.jpg
```

Correcto:

```txt
JPEG image data
```

Correcto para PNG:

```txt
PNG image data
```

Incorrecto:

```txt
RIFF data, Web/P image
```

---

## 16. Antes de hacer commit

Ejecutar build:

```bash
npm run build
```

Comprobar estado:

```bash
git status --short
```

Comprobar extensiones incorrectas:

```bash
find public/images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | xargs -0 file | grep -Ei "web/p|riff|webp"
```

Si no hay salida y el build pasa, se puede hacer commit.

---

## 17. Checklist para una nueva web

```txt
[ ] Crear carpetas de imágenes por servicio
[ ] Guardar originales fuera del repo o en incoming-images
[ ] Renombrar archivos con nombres SEO limpios
[ ] Recortar capturas con bandas negras o interfaz móvil
[ ] Optimizar imágenes con scripts/optimize-to-folder.mjs
[ ] Mover imágenes optimizadas a public/images/...
[ ] Usar URLs sin public: /images/...
[ ] Añadir alt descriptivo
[ ] Añadir caption si hay galería o bloque visual
[ ] Ejecutar comprobación de extensiones
[ ] Ejecutar npm run build
[ ] Revisar preview
[ ] Hacer commit
```

---

## 18. Ejemplos de rutas finales

Archivo real:

```txt
public/images/services/ventanas-de-aluminio-malaga/ventana-aluminio-blanca.jpg
```

URL en la web:

```txt
/images/services/ventanas-de-aluminio-malaga/ventana-aluminio-blanca.jpg
```

Archivo real:

```txt
public/images/metalisur/taller/perfiles-aluminio-taller-carpinteria-metalica-metalisur.jpg
```

URL en la web:

```txt
/images/metalisur/taller/perfiles-aluminio-taller-carpinteria-metalica-metalisur.jpg
```

---

## 19. Recomendación final

Para publicar rápido y sin romper el template:

```txt
Usar public/images para imágenes editables o gestionadas desde contenido.
Usar src/assets solo para imágenes importadas directamente en componentes Astro.
Optimizar siempre antes de mover a public/images.
No subir incoming-images ni optimized-images al repo.
```
