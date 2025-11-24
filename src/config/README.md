# Configuración del Negocio

Este archivo contiene toda la información centralizada del negocio. **Solo necesitas editar este archivo** y los cambios se aplicarán automáticamente en toda la web.

## 📍 Ubicación del archivo

```
src/config/business.ts
```

## ✏️ Cómo editar

Abre el archivo `src/config/business.ts` y modifica los valores según los datos reales de tu empresa:

### 1. Información Básica
```typescript
name: "Herrero Zaragoza",  // Nombre de tu empresa
tagline: "Expertos en Herrería y Forja desde 2010",
description: "Descripción completa de tu negocio...",
```

### 2. Datos de Contacto
```typescript
contact: {
  phone: "600 000 000",           // Teléfono formateado para mostrar
  phoneRaw: "600000000",          // Teléfono sin espacios para enlaces
  whatsapp: "34600000000",        // Código país + número (sin +)
  email: "info@herrerozaragoza.com",
  address: {
    street: "Calle Ejemplo, 123",
    city: "Zaragoza",
    postalCode: "50001",
    // ...
  }
}
```

### 3. Redes Sociales
```typescript
social: {
  facebook: "https://facebook.com/tuempresa",
  instagram: "https://instagram.com/tuempresa",
  linkedin: "",  // Dejar vacío si no tienes
  youtube: "",   // Dejar vacío si no tienes
}
```

### 4. Horarios
```typescript
schedule: {
  weekdays: "Lunes a Viernes: 8:00 - 18:00",
  saturday: "Sábado: 9:00 - 14:00",
  sunday: "Domingo: Cerrado",
  emergency: "Servicio de urgencias 24/7 disponible"
}
```

### 5. Datos Legales
```typescript
legal: {
  cif: "B-12345678",
  registroMercantil: "Registro Mercantil de Zaragoza...",
  foundedYear: 2010,
}
```

## 🔧 Funciones Helper

El archivo también incluye funciones útiles que puedes usar en cualquier componente:

```typescript
import { businessConfig, getWhatsAppUrl, getPhoneUrl } from '@/config/business';

// Obtener URL de WhatsApp
const whatsappLink = getWhatsAppUrl();
const customWhatsapp = getWhatsAppUrl("Mensaje personalizado");

// Obtener URL de teléfono
const phoneLink = getPhoneUrl();

// Obtener URL de email
const emailLink = getEmailUrl("Asunto del email");

// Acceder a cualquier dato
const companyName = businessConfig.name;
const phone = businessConfig.contact.phone;
```

## 📦 Dónde se usa

Esta configuración se utiliza automáticamente en:

- ✅ Botón flotante de WhatsApp
- ✅ Footer (próximamente)
- ✅ Formularios de contacto (próximamente)
- ✅ Datos de contacto en todas las páginas
- ✅ Schema.org para SEO

## ⚠️ Importante

1. **Número de WhatsApp**: Debe incluir el código de país sin el símbolo `+`
   - ✅ Correcto: `34612345678`
   - ❌ Incorrecto: `+34 612 345 678`

2. **Teléfono**: Mantén dos versiones
   - `phone`: Para mostrar (con espacios): `"600 000 000"`
   - `phoneRaw`: Para enlaces (sin espacios): `"600000000"`

3. **Redes sociales**: Si no tienes alguna red social, deja el campo vacío con `""`

## 🚀 Próximos pasos

Después de editar este archivo, los cambios se verán automáticamente en:
- Toda la web
- Botón de WhatsApp
- Enlaces de contacto
- Información del footer
- Datos estructurados para SEO

No necesitas tocar ningún otro archivo! 🎉
