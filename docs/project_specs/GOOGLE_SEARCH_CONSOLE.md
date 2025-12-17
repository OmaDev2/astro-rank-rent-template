# Configuración de Google Search Console

## 📋 ¿Qué es Google Search Console?

Google Search Console es una herramienta gratuita de Google que te permite:
- 📊 Monitorear el rendimiento de tu sitio en búsquedas
- 🔍 Ver qué palabras clave traen tráfico
- 🐛 Detectar errores de indexación
- 📈 Mejorar el SEO de tu sitio
- 🗺️ Enviar sitemaps

---

## 🚀 Cómo Configurar

### Paso 1: Obtener el Código de Verificación

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Haz clic en **"Añadir propiedad"**
3. Selecciona **"Prefijo de URL"** e ingresa tu dominio completo (ej: `https://tudominio.com`)
4. Selecciona el método de verificación **"Etiqueta HTML"**
5. Copia el código que aparece en `content="..."` (solo el contenido, sin las comillas ni el resto del meta tag)

**Ejemplo:**
```html
<meta name="google-site-verification" content="abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" />
```

**Copia solo:** `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### Paso 2: Añadir el Código en Keystatic

1. Abre el panel de Keystatic: `/keystatic`
2. Ve a **⚙️ Configuración > Analytics y Tracking**
3. Pega el código en el campo **"Google Search Console - Código de Verificación"**
4. Guarda los cambios

### Paso 3: Verificar en Google

1. Vuelve a Google Search Console
2. Haz clic en **"Verificar"**
3. ✅ ¡Listo! Tu sitio está verificado

---

## 🔧 Implementación Técnica

El código de verificación se añade automáticamente en el `<head>` de todas las páginas mediante el componente:

**Archivo:** `src/components/SearchConsoleVerification.astro`

**Uso en Layout:**
```astro
import SearchConsoleVerification from "../components/SearchConsoleVerification.astro";

<head>
    <SearchConsoleVerification />
</head>
```

El componente genera automáticamente:
```html
<meta name="google-site-verification" content="TU_CODIGO_AQUI" />
```

---

## 📊 Qué Hacer Después de Verificar

1. **Enviar Sitemap**
   - En Search Console, ve a "Sitemaps"
   - Añade: `https://tudominio.com/sitemap-index.xml`

2. **Solicitar Indexación**
   - Ve a "Inspección de URLs"
   - Ingresa URLs importantes
   - Haz clic en "Solicitar indexación"

3. **Monitorear Rendimiento**
   - Revisa la sección "Rendimiento" semanalmente
   - Identifica palabras clave que funcionan
   - Optimiza contenido basado en datos

4. **Revisar Cobertura**
   - Verifica que no haya errores de indexación
   - Corrige URLs bloqueadas o con problemas

---

## ✅ Checklist de Configuración

- [ ] Obtener código de verificación de Google Search Console
- [ ] Añadir código en Keystatic (⚙️ Configuración > Analytics y Tracking)
- [ ] Verificar el sitio en Google Search Console
- [ ] Enviar sitemap (`/sitemap-index.xml`)
- [ ] Solicitar indexación de páginas principales
- [ ] Configurar alertas de email en Search Console

---

## 🆘 Solución de Problemas

**Error: "No se pudo verificar"**
- Asegúrate de copiar solo el contenido del `content="..."`
- Verifica que el sitio esté publicado y accesible
- Espera unos minutos y vuelve a intentar

**El meta tag no aparece**
- Verifica que guardaste los cambios en Keystatic
- Limpia la caché del navegador
- Inspecciona el código fuente de tu sitio (`Ctrl+U`)

**Verificación exitosa pero no aparecen datos**
- Los datos pueden tardar 24-48 horas en aparecer
- Asegúrate de tener tráfico en el sitio
- Verifica que el sitemap esté enviado

---

## 📚 Recursos Adicionales

- [Documentación oficial de Search Console](https://support.google.com/webmasters)
- [Guía de verificación](https://support.google.com/webmasters/answer/9008080)
- [Cómo enviar un sitemap](https://support.google.com/webmasters/answer/183668)
