# Configuración de Settings - Estructura Modular

## 📋 Descripción

La configuración del sitio está ahora organizada en **5 singletons separados** para facilitar la gestión y edición:

### 1. 📊 **Información del Negocio** (`business`)
Datos principales del negocio:
- Nombre del negocio
- Nicho/sector
- Logo
- URL del sitio
- Tipo de negocio (Schema.org)
- Ciudad y dirección
- Coordenadas GPS
- Teléfono, WhatsApp, Email
- Horario de atención
- NIF/CIF
- Texto del botón CTA

**Archivo**: `src/content/settings/business.yaml`

### 2. 🎨 **Diseño y Tema** (`design`)
Configuración visual:
- Tema de color (industrial, corporate, nature, etc.)

**Archivo**: `src/content/settings/design.yaml`

### 3. 📱 **Redes Sociales** (`social`)
Enlaces a redes sociales:
- Facebook URL
- Instagram URL

**Archivo**: `src/content/settings/social.yaml`

### 4. 📈 **Analytics y Tracking** (`analytics`)
Herramientas de análisis:
- Google Analytics 4 ID
- Google Tag Manager ID

**Archivo**: `src/content/settings/analytics.yaml`

### 5. 🔍 **Schema.org - SEO Avanzado** (`schema`)
Datos estructurados para mejorar el SEO:
- Rango de precios (€, €€, €€€)
- Horario de apertura detallado (por días)
- Áreas de servicio
- Métodos de pago aceptados
- Año de fundación
- Eslogan/lema del negocio

**Archivo**: `src/content/settings/schema.yaml`

**Beneficios SEO**:
- 🌟 Rich Snippets en Google
- 📍 Google Business Profile mejorado
- 💳 Información de pagos visible
- ⏰ Horarios estructurados
- 📊 Mejor posicionamiento local

---

## 🔧 Cómo Usar en el Código

### Opción 1: Helper Unificado (Recomendado)
```typescript
import { getSettings } from '@/lib/settings';

const settings = await getSettings();
// Accede a todos los campos como antes:
const { siteName, theme, facebook, googleAnalyticsId } = settings;
```

### Opción 2: Acceso Individual
```typescript
import { getEntry } from 'astro:content';

const business = await getEntry('business', 'global');
const design = await getEntry('design', 'global');
const social = await getEntry('social', 'global');
const analytics = await getEntry('analytics', 'global');

const siteName = business?.data?.siteName;
const theme = design?.data?.theme;
```

---

## 📂 Estructura de Archivos

```
src/content/
├── business/
│   └── global.yaml      # Información del negocio
├── design/
│   └── global.yaml      # Tema visual
├── social/
│   └── global.yaml      # Redes sociales
├── analytics/
│   └── global.yaml      # Analytics y tracking
└── schema/
    └── global.yaml      # Schema.org (SEO avanzado)
```

---

## ✅ Beneficios

1. **Organización clara**: Cada categoría en su propio archivo
2. **Fácil de editar**: Formularios más pequeños y enfocados en Keystatic
3. **Mejor UX**: Los editores encuentran rápidamente lo que buscan
4. **Mantenible**: Más fácil de extender en el futuro
5. **Navegación intuitiva**: Agrupado lógicamente en el panel de Keystatic

---

## 🔄 Migración

Los datos del antiguo `settings/global.yaml` han sido migrados automáticamente a los nuevos archivos separados.

Si necesitas actualizar el código existente que usa `getEntry('settings', 'global')`, reemplázalo por:
```typescript
import { getSettings } from '@/lib/settings';
const settings = await getSettings();
```
