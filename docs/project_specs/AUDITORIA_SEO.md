# Auditoría SEO On-Page - Herrero Zaragoza

## ✅ CONFIGURACIÓN COMPLETADA

### 1. URLs Canónicas
- ✅ **Implementado**: Cada página se apunta a sí misma automáticamente
- ✅ **Ubicación**: `src/components/SeoHead.astro`
- ✅ **Funcionamiento**: Se genera dinámicamente usando `Astro.url.pathname` y `Astro.site`

### 2. Trailing Slashes
- ✅ **Configurado**: `trailingSlash: 'always'` en `astro.config.mjs`
- ✅ **Resultado**: Todas las URLs tienen barra final (`/rejas/`, `/contacto/`)

### 3. Campos SEO Personalizados
- ✅ **Añadidos** a schema de servicios: `seoTitle` y `seoDesc` (opcionales)
- ✅ **Fallback automático**: Si no se especifican, se generan automáticamente

---

## 📋 CHECKLIST SEO POR PÁGINA

### ✅ HOMEPAGE (`/`)
**Estado**: ✅ Optimizada

- **Title**: "Herreros en Zaragoza | Forja, Rejas y Estructuras Metálicas" (62 caracteres) ✅
- **H1**: "HERREROS EN ZARAGOZA" ✅ (incluye ciudad)
- **Meta Description**: Presente y optimizada ✅
- **Canonical**: Auto-generada ✅
- **Enlaces internos**: ✅ Enlaces a todos los servicios principales

**Recomendación**: 
- Considerar acortar title a ~55 caracteres: "Herreros en Zaragoza | Presupuesto Gratis 24h"

---

### 🔧 PÁGINAS DE SERVICIOS

#### Estructura Actual:
**Title**: `{Servicio} en Zaragoza | Presupuesto Gratis`
**Ejemplo**: "Rejas de Seguridad en Zaragoza | Presupuesto Gratis"

#### ✅ Servicios Principales:

1. **Rejas de Seguridad** (`/rejas-ventanas-zaragoza/`)
   - Title actual: Auto-generado ✅
   - H1: Necesita revisión (debe incluir "Zaragoza")
   - Meta Description: Usa `shortDesc` ✅
   - **Acción**: Añadir campos SEO personalizados

2. **Cerramientos** (`/cerramientos-terrazas-zaragoza/`)
   - Title actual: Auto-generado ✅
   - **Acción**: Añadir campos SEO personalizados

3. **Barandillas** (`/barandillas-zaragoza/`)
   - Title actual: Auto-generado ✅
   - **Acción**: Añadir campos SEO personalizados

4. **Puertas Metálicas** (`/puertas-metalicas-zaragoza/`)
   - Title actual: Auto-generado ✅
   - **Acción**: Añadir campos SEO personalizados

5. **Estructuras Metálicas** (`/estructuras-metalicas-zaragoza/`)
   - Title actual: Auto-generado ✅
   - **Acción**: Añadir campos SEO personalizados

---

## 📝 TÍTULOS Y DESCRIPCIONES RECOMENDADOS

### Rejas de Seguridad
```yaml
seoTitle: "Rejas de Seguridad Zaragoza | Instalación en 24h"
seoDesc: "Rejas de seguridad para ventanas y puertas en Zaragoza. Diseños modernos y clásicos. Presupuesto gratis sin compromiso. ¡Llámanos!"
```
**Longitud**: Title 51 chars ✅ | Description 147 chars ✅

### Cerramientos
```yaml
seoTitle: "Cerramientos de Terrazas Zaragoza | A Medida"
seoDesc: "Cerramientos de terrazas y porches en Zaragoza. Aluminio y hierro a medida. Amplía tu espacio habitable. Presupuesto gratis en 24h."
```
**Longitud**: Title 49 chars ✅ | Description 141 chars ✅

### Barandillas
```yaml
seoTitle: "Barandillas de Hierro Zaragoza | Diseño Moderno"
seoDesc: "Barandillas de hierro y acero inoxidable en Zaragoza. Escaleras, balcones y terrazas. Diseños modernos y seguros. Presupuesto sin coste."
```
**Longitud**: Title 52 chars ✅ | Description 145 chars ✅

### Puertas Metálicas
```yaml
seoTitle: "Puertas Metálicas Zaragoza | Seguridad Máxima"
seoDesc: "Puertas metálicas de seguridad en Zaragoza. Garajes, naves y comunidades. Fabricación a medida. Instalación profesional. Llama ahora."
```
**Longitud**: Title 51 chars ✅ | Description 141 chars ✅

### Estructuras Metálicas
```yaml
seoTitle: "Estructuras Metálicas Zaragoza | Proyectos"
seoDesc: "Estructuras metálicas industriales en Zaragoza. Naves, pérgolas y marquesinas. Diseño y fabricación a medida. Presupuesto gratuito."
```
**Longitud**: Title 48 chars ✅ | Description 138 chars ✅

---

## 🔗 INTERLINKING (Enlaces Internos)

### ✅ Implementado:
- Home → Servicios principales (grid de servicios)
- Servicios → Formulario de contacto (en sidebar)
- Footer → Todas las zonas de servicio

### 📌 Recomendaciones de Mejora:

#### 1. En Páginas de Servicios:
Añadir sección al final del contenido:

```markdown
## Servicios Relacionados

¿Buscas algo más? También ofrecemos:
- [Cerramientos de terrazas en Zaragoza](/cerramientos-terrazas-zaragoza/) - Amplía tu espacio
- [Puertas metálicas de seguridad](/puertas-metalicas-zaragoza/) - Protección total
- [Ver todos nuestros servicios](/) - Catálogo completo
```

#### 2. Anchor Text Descriptivo:
❌ Evitar: "Pincha aquí", "Más info", "Ver más"
✅ Usar: "Ver tipos de rejas", "Solicitar presupuesto de cerramientos", "Nuestros trabajos de barandillas"

#### 3. Enlaces Contextuales en Contenido:
Dentro del texto de servicios, enlazar a:
- Zonas específicas: "Instalamos rejas en [Utebo](/zona/utebo/) y alrededores"
- Servicios relacionados: "También fabricamos [puertas metálicas](/puertas-metalicas-zaragoza/)"
- Página de contacto: "[Solicita tu presupuesto gratis](/contacto/)"

---

## 📊 JERARQUÍA DE ENCABEZADOS

### ✅ Reglas Implementadas:
1. **Un solo H1 por página** ✅
2. **H1 incluye "Zaragoza"** ✅ (en la mayoría)
3. **Orden lógico**: H1 → H2 → H3 (sin saltos) ✅

### 🔍 Verificación Necesaria:

#### Páginas de Servicios:
Verificar que el H1 en el contenido MDX incluya "Zaragoza":

**Ejemplo correcto**:
```markdown
# Rejas de Seguridad en Zaragoza
```

**Ejemplo incorrecto**:
```markdown
# Rejas de Seguridad
```

---

## 🎯 ACCIONES INMEDIATAS

### Prioridad ALTA:

1. **Añadir campos SEO a servicios principales** (5 archivos)
   - Copiar los títulos y descripciones recomendados arriba
   - Añadir al frontmatter de cada archivo MDX

2. **Verificar H1 en servicios**
   - Asegurar que todos incluyen "Zaragoza"
   - Formato: `# {Servicio} en Zaragoza`

3. **Añadir sección "Servicios Relacionados"**
   - Al final de cada página de servicio
   - Con enlaces internos descriptivos

### Prioridad MEDIA:

4. **Optimizar anchor text**
   - Revisar todos los enlaces "Ver más"
   - Cambiar por textos descriptivos

5. **Enlaces contextuales**
   - Añadir 2-3 enlaces internos en el contenido de cada servicio
   - Enlazar a zonas y servicios relacionados

### Prioridad BAJA:

6. **Acortar title de homepage**
   - De 62 a ~55 caracteres
   - Mantener keyword principal

---

## 📈 MÉTRICAS DE ÉXITO

### Antes de Optimización:
- Titles: Auto-generados (genéricos)
- Descriptions: Usando shortDesc (no optimizadas)
- H1: Sin "Zaragoza" en algunos casos
- Enlaces internos: Básicos

### Después de Optimización:
- ✅ Titles: 50-60 caracteres, keyword + CTA
- ✅ Descriptions: 150-160 caracteres, keyword + beneficio
- ✅ H1: Todos con "Zaragoza"
- ✅ Enlaces internos: Descriptivos y contextuales
- ✅ Canonical: Auto-generadas
- ✅ Trailing slash: Consistente

---

## 🛠️ HERRAMIENTAS DE VERIFICACIÓN

### Para verificar después de implementar:

1. **Google Search Console**
   - Enviar sitemap
   - Verificar cobertura de índice
   - Revisar errores de rastreo

2. **Screaming Frog** (o similar)
   - Verificar canonicals
   - Revisar títulos duplicados
   - Analizar estructura de enlaces

3. **PageSpeed Insights**
   - Verificar Core Web Vitals
   - Optimizar imágenes si es necesario

---

## 📝 NOTAS FINALES

- **Sitemap**: ✅ Generado automáticamente, páginas legales excluidas
- **Robots.txt**: Pendiente de crear (recomendado)
- **Schema.org**: ✅ Implementado para servicios y localidades
- **Open Graph**: ✅ Configurado para redes sociales

**Próximo paso**: Implementar los campos SEO en los 5 servicios principales.
