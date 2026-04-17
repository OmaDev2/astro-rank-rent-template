import { fields, singleton } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';

export const quickstart = singleton({
    label: '🚀 Inicio Rápido',
    path: 'src/content/quickstart/global',
    schema: {

        // ── 1. NEGOCIO ────────────────────────────────────────────────────────
        siteName: fields.text({
            label: '🏢 Nombre del Negocio *',
            description: 'El nombre que aparecerá en toda la web y en Google. Ej: Fontaneros Madrid Pro',
            validation: { length: { min: 2 } },
        }),

        niche: fields.text({
            label: '🔧 Servicio / Nicho *',
            description: 'Qué hace el negocio. Ej: Fontanería, Electricidad, Limpieza de hogar',
            validation: { length: { min: 2 } },
        }),

        city: fields.text({
            label: '📍 Ciudad Principal *',
            description: 'Ciudad donde opera principalmente. Ej: Madrid, Barcelona, Sevilla',
        }),

        phone: fields.text({
            label: '📞 Teléfono *',
            description: 'Número de contacto principal. Ej: 600 123 456',
        }),

        whatsapp: fields.text({
            label: '💬 WhatsApp *',
            description: 'Con código de país, sin espacios ni "+". Ej: 34600123456',
        }),

        email: fields.text({
            label: '📧 Email de Contacto',
            description: 'Email para recibir los formularios. Ej: hola@minegocio.com',
        }),

        siteUrl: fields.text({
            label: '🌐 URL del Sitio *',
            description: 'Dominio final con https://. Ej: https://fontanerosmadridpro.com',
        }),

        logo: fields.image({
            label: '🖼️ Logo del Negocio',
            description: 'PNG transparente recomendado. Mínimo 200×200px.',
            directory: 'src/assets/images',
            publicPath: '@assets/images',
        }),

        ctaText: fields.text({
            label: '🎯 Texto del Botón Principal',
            description: 'El texto que aparece en los botones de llamada a la acción. Ej: Pedir Presupuesto, Llamar Ahora',
            defaultValue: 'Pedir Presupuesto',
        }),

        businessType: fields.select({
            label: '🏷️ Tipo de Negocio',
            description: 'Ayuda a Google a entender qué tipo de empresa es. Elige el más cercano.',
            options: [
                { label: 'Fontanería / Plomería', value: 'Plumber' },
                { label: 'Electricista', value: 'Electrician' },
                { label: 'Cerrajería', value: 'Locksmith' },
                { label: 'Pintores / Decoración', value: 'HousePainter' },
                { label: 'Reformas / Construcción', value: 'HomeAndConstructionBusiness' },
                { label: 'Contratista General', value: 'GeneralContractor' },
                { label: 'Reparación de Techos', value: 'RoofingContractor' },
                { label: 'Clínica Dental', value: 'Dentist' },
                { label: 'Clínica Médica', value: 'MedicalBusiness' },
                { label: 'Peluquería / Barbería', value: 'HairSalon' },
                { label: 'Estética / Belleza', value: 'HealthAndBeautyBusiness' },
                { label: 'Restaurante', value: 'Restaurant' },
                { label: 'Taller / Reparación de Coches', value: 'AutoRepair' },
                { label: 'Mudanzas', value: 'MovingCompany' },
                { label: 'Abogado / Legal', value: 'LegalService' },
                { label: 'Gestoría / Contabilidad', value: 'AccountingService' },
                { label: 'Inmobiliaria', value: 'RealEstateAgent' },
                { label: 'Veterinario', value: 'VeterinaryCare' },
                { label: 'Otro servicio local', value: 'LocalBusiness' },
            ],
            defaultValue: 'LocalBusiness',
        }),

        // ── 2. SEO BÁSICO ─────────────────────────────────────────────────────
        seo: SeoPreview({
            label: '🔍 SEO Google Preview',
            description: 'Ajusta tu título y descripción SEO con previsualización en vivo.',
        }),

        // ── 3. DISEÑO ─────────────────────────────────────────────────────────
        fontPair: fields.select({
            label: '🔤 Tipografía',
            description: 'Elige las fuentes que mejor encajan con el sector del negocio.',
            options: [
                { label: 'Moderno (Oswald / Inter) — Para servicios técnicos', value: 'modern' },
                { label: 'Robusto (Barlow / Roboto) — Para construcción, reformas', value: 'robust' },
                { label: 'Elegante (Playfair / Lato) — Para salud, belleza, legal', value: 'elegant' },
                { label: 'Amigable (Nunito / Open Sans) — Para limpieza, cuidados', value: 'friendly' },
                { label: 'Tech (Chakra Petch / Exo 2) — Para tecnología, electrónica', value: 'tech' },
                { label: 'Artesano Cálido (Merriweather / Lora) — Para carpintería, artes', value: 'artisan_warm' },
            ],
            defaultValue: 'modern',
        }),

        // ── 4. TRACKING & ANALYTICS ───────────────────────────────────────────
        googleAnalyticsId: fields.text({
            label: '📊 Google Analytics 4 ID',
            description: 'Empieza por G-. Ej: G-XXXXXXXXXX. Déjalo vacío si no tienes GA4.',
        }),

        gtmId: fields.text({
            label: '🏷️ Google Tag Manager ID',
            description: 'Empieza por GTM-. Ej: GTM-XXXXXXX. Solo necesario si usas GTM.',
        }),

        n8nWebhookUrl: fields.text({
            label: '🔗 n8n Webhook (Tracking de Leads)',
            description: 'URL de tu webhook n8n para registrar cada clic en WhatsApp y teléfono. Muy útil para demostrar leads a clientes.',
        }),

        // ── 5. REDES SOCIALES ─────────────────────────────────────────────────
        facebook: fields.text({
            label: '👤 Facebook URL',
            description: 'URL completa de la página. Ej: https://facebook.com/tunegocio. Déjalo vacío si no tiene.',
        }),

        instagram: fields.text({
            label: '📸 Instagram URL',
            description: 'URL completa del perfil. Ej: https://instagram.com/tunegocio. Déjalo vacío si no tiene.',
        }),
    },
});
