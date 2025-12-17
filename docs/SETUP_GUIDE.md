# 🎯 Guía de Configuración - Template Rank & Rent

Esta guía te ayudará a configurar rápidamente un nuevo sitio usando este template.

## 📋 Checklist de Configuración

### 1. Instalación Inicial
- [ ] Clonar el repositorio
- [ ] Ejecutar `npm install`
- [ ] Copiar `.env.example` a `.env` (si es necesario)
- [ ] Ejecutar `npm run dev` para verificar que funciona

### 2. Configuración Básica en Keystatic

Accede a `http://localhost:4321/keystatic` y configura:

#### Settings → Business Info
- [ ] Nombre de la empresa
- [ ] Teléfono de contacto
- [ ] Email de contacto
- [ ] Dirección completa
- [ ] WhatsApp (número con código de país, ej: 34612345678)
- [ ] Horario de atención

#### Settings → SEO
- [ ] Título del sitio
- [ ] Descripción del sitio
- [ ] Keywords principales
- [ ] URL del sitio (para producción)

#### Settings → Social Media (opcional)
- [ ] Facebook
- [ ] Instagram
- [ ] LinkedIn

### 3. Personalización de Contenido

#### 
- [ ] Editar título y subtítulo del Hero
- [ ] Actualizar sección "Sobre Nosotros"
- [ ] Añadir/editar testimonios
- [ ] Configurar FAQs

#### Servicios
- [ ] Eliminar servicios de ejemplo
- [ ] Crear servicios relevantes para tu negocio
- [ ] Añadir imágenes de cada servicio (recomendado: 1200x800px)
- [ ] Escribir descripciones SEO-optimizadas

### 4. Imágenes y Branding

- [ ] Reemplazar logo en `/public/images/logo.png`
- [ ] Añadir favicon en `/public/favicon.ico`
- [ ] Subir imágenes de servicios a `/public/images/`
- [ ] Actualizar imagen del hero

### 5. Personalización de Diseño (Opcional)

Si quieres cambiar colores o tipografía:

- [ ] Editar `tailwind.config.mjs` para cambiar colores
- [ ] Actualizar fuentes en el layout principal

### 6. SEO Avanzado

- [ ] Verificar que `robots.txt` está configurado correctamente
- [ ] Revisar el sitemap generado automáticamente
- [ ] Configurar Google Analytics (opcional)
- [ ] Añadir Google Search Console después del deploy

### 7. Testing Local

- [ ] Probar todas las páginas
- [ ] Verificar enlaces de WhatsApp
- [ ] Comprobar formularios de contacto
- [ ] Revisar responsive design (móvil, tablet, desktop)
- [ ] Ejecutar `npm run build` para verificar que compila sin errores

### 8. Deployment

#### Preparación
- [ ] Crear nuevo repositorio en GitHub
- [ ] Hacer push del código
- [ ] Crear cuenta en Netlify (si no la tienes)

#### En Netlify
- [ ] Conectar repositorio de GitHub
- [ ] Configurar build settings (ya están en `netlify.toml`)
- [ ] Deploy!
- [ ] Configurar dominio personalizado (opcional)

#### Post-Deployment
- [ ] Actualizar URL del sitio en Keystatic settings
- [ ] Verificar que `/keystatic` funciona en producción
- [ ] Configurar Google Search Console
- [ ] Enviar sitemap a Google

### 9. Optimización Post-Launch

- [ ] Verificar velocidad en PageSpeed Insights
- [ ] Comprobar Schema.org con Rich Results Test de Google
- [ ] Revisar indexación en Google Search Console
- [ ] Configurar Google My Business (si aplica)

## 🎨 Personalización de Colores

Para cambiar el esquema de colores, edita `tailwind.config.mjs`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#tu-color-principal',
        dark: '#version-oscura',
      },
      secondary: '#tu-color-secundario',
    }
  }
}
```

## 📝 Contenido Recomendado

### Para cada Servicio:
- Título claro y descriptivo
- Descripción de 300-500 palabras
- 3-5 imágenes de calidad
- Lista de beneficios
- Call-to-action claro

### Para Testimonios:
- Nombre del cliente
- Servicio contratado
- Testimonio de 50-150 palabras
- Foto (opcional)

### Para FAQs:
- Mínimo 5 preguntas frecuentes
- Respuestas claras y concisas
- Incluir keywords relevantes

## 🚀 Tips para Rank & Rent

1. **Localización**: Asegúrate de incluir la ciudad/zona en títulos y contenido
2. **Keywords**: Investiga keywords locales antes de crear contenido
3. **NAP Consistency**: Nombre, dirección y teléfono deben ser consistentes
4. **Google My Business**: Crea y optimiza el perfil
5. **Backlinks**: Consigue enlaces de directorios locales
6. **Reviews**: Genera reseñas en Google My Business

## ❓ Problemas Comunes

### El CMS no carga
- Verifica que estás en `/keystatic` (con la barra final)
- Limpia caché: `rm -rf .astro node_modules && npm install`

### Errores de build
- Ejecuta `npm run build` localmente primero
- Revisa que todas las imágenes existen
- Verifica que no hay contenido con formato incorrecto

### Imágenes no se ven
- Asegúrate de que están en `/public/images/`
- Verifica las rutas en Keystatic
- Comprueba que los nombres no tienen espacios ni caracteres especiales

## 📞 Soporte

Si encuentras problemas, revisa:
1. La documentación de Astro: https://docs.astro.build
2. La documentación de Keystatic: https://keystatic.com/docs
3. Abre un issue en el repositorio del template

---

**¡Buena suerte con tu proyecto Rank & Rent! 🚀**
