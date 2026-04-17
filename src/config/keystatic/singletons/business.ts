import { fields, singleton } from '@keystatic/core';

export const business = singleton({
    label: '🏢 Mi Negocio',
    path: 'src/content/business/global',
    schema: {

        // ── 1. INFORMACIÓN BÁSICA ─────────────────────────────────────────────
        siteName: fields.text({
            label: 'Nombre del Negocio *',
            description: 'El nombre que aparecerá en toda la web y en Google. Ej: Fontaneros Madrid Pro',
            validation: { length: { min: 2 } },
        }),

        niche: fields.text({
            label: 'Servicio / Nicho *',
            description: 'Qué hace el negocio. Ej: Fontanería, Electricidad, Limpieza de hogar',
        }),

        businessType: fields.select({
            label: 'Tipo de Negocio (Schema.org)',
            description: 'Ayuda a Google a entender qué tipo de empresa es.',
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
                { label: 'Peluquería', value: 'HairSalon' },
                { label: 'Barbería', value: 'BarberShop' },
                { label: 'Estética / Belleza', value: 'HealthAndBeautyBusiness' },
                { label: 'Restaurante', value: 'Restaurant' },
                { label: 'Taller / Reparación de Coches', value: 'AutoRepair' },
                { label: 'Mudanzas', value: 'MovingCompany' },
                { label: 'Abogado / Legal', value: 'LegalService' },
                { label: 'Gestoría / Contabilidad', value: 'AccountingService' },
                { label: 'Inmobiliaria', value: 'RealEstateAgent' },
                { label: 'Veterinario', value: 'VeterinaryCare' },
                { label: 'Jardinería / Paisajismo', value: 'LocalBusiness' },
                { label: 'Limpieza', value: 'ProfessionalService' },
                { label: 'Seguridad', value: 'LocalBusiness' },
                { label: 'Otro servicio local', value: 'LocalBusiness' },
            ],
            defaultValue: 'LocalBusiness',
        }),

        logo: fields.image({
            label: 'Logo del Negocio',
            description: 'PNG transparente recomendado. Mínimo 200×200px.',
            directory: 'src/assets/images',
            publicPath: '@assets/images',
        }),

        siteUrl: fields.text({
            label: 'URL del Sitio *',
            description: 'Dominio final con https://. Ej: https://fontanerosmadridpro.com',
        }),

        ctaText: fields.text({
            label: 'Texto del Botón Principal',
            description: 'Texto que aparece en los botones de llamada a la acción.',
            defaultValue: 'Pedir Presupuesto',
        }),

        // ── 2. CONTACTO ───────────────────────────────────────────────────────
        phone: fields.text({
            label: 'Teléfono *',
            description: 'Número de contacto principal. Ej: 600 123 456',
        }),

        whatsapp: fields.text({
            label: 'WhatsApp *',
            description: 'Con código de país, sin espacios ni "+". Ej: 34600123456',
        }),

        email: fields.text({
            label: 'Email de Contacto',
            description: 'Email para recibir los formularios. Ej: hola@minegocio.com',
        }),

        city: fields.text({
            label: 'Ciudad Principal *',
            description: 'Ciudad donde opera principalmente. Ej: Madrid, Barcelona, Sevilla',
        }),

        address: fields.text({
            label: 'Dirección',
            description: 'Dirección completa (si tiene local físico). Déjalo vacío para negocios sin local.',
        }),

        coordinates: fields.object({
            lat: fields.text({ label: 'Latitud', description: 'Ej: 41.3851' }),
            lng: fields.text({ label: 'Longitud', description: 'Ej: 2.1734' }),
        }, {
            label: 'Coordenadas GPS',
            description: 'Para Google Maps. Búscalas en maps.google.com → clic derecho sobre el punto.',
        }),

        schedule: fields.text({
            label: 'Horario de Atención (texto)',
            description: 'Texto libre que aparece en el sitio. Ej: Lun-Vie 9:00-20:00, Sáb 10:00-14:00',
        }),

        nif: fields.text({
            label: 'NIF / CIF',
            description: 'Necesario para la página de Aviso Legal.',
        }),

        // ── 3. SEO ────────────────────────────────────────────────────────────
        seoTitle: fields.text({
            label: 'Título SEO Principal *',
            description: '⚠️ Entre 50 y 60 caracteres. Aparece en Google como título del enlace. Ej: Fontanero en Madrid | Urgencias 24h | Sin Esperas',
            validation: { length: { min: 10, max: 60 } },
        }),

        seoDescription: fields.text({
            label: 'Descripción SEO Principal *',
            description: '⚠️ Entre 120 y 160 caracteres. Es el texto que ve el usuario en Google bajo el título. Incluye ciudad, servicio y llamada a la acción.',
            multiline: true,
            validation: { length: { min: 50, max: 160 } },
        }),

        slogan: fields.text({
            label: 'Eslogan / Lema',
            description: 'Frase que representa el negocio. Se usa en Schema.org y puede aparecer en el hero.',
        }),

        foundingDate: fields.text({
            label: 'Año de Fundación',
            description: 'Ej: 2010 — añade credibilidad en Schema.org.',
        }),

        // ── 4. REDES SOCIALES ─────────────────────────────────────────────────
        facebook: fields.text({
            label: 'Facebook URL',
            description: 'URL completa. Ej: https://facebook.com/tunegocio — Vacío si no tiene.',
        }),

        instagram: fields.text({
            label: 'Instagram URL',
            description: 'URL completa. Ej: https://instagram.com/tunegocio — Vacío si no tiene.',
        }),

        // ── 5. ANALYTICS Y TRACKING ───────────────────────────────────────────
        googleAnalyticsId: fields.text({
            label: 'Google Analytics 4 ID',
            description: 'Empieza por G-. Ej: G-XXXXXXXXXX. Vacío si no tienes GA4.',
        }),

        gtmId: fields.text({
            label: 'Google Tag Manager ID',
            description: 'Empieza por GTM-. Ej: GTM-XXXXXXX. Solo si usas GTM.',
        }),

        searchConsoleVerification: fields.text({
            label: 'Google Search Console — Código de Verificación',
            description: 'Solo el contenido del meta tag, sin etiquetas HTML. Ej: abc123def456...',
        }),

        n8nWebhookUrl: fields.text({
            label: 'n8n Webhook (Tracking de Leads)',
            description: 'URL de tu webhook n8n para registrar clics en WhatsApp y teléfono. Muy útil para demostrar leads a clientes rank & rent.',
        }),

        // ── 6. SCHEMA.ORG — ÁREA DE SERVICIO ─────────────────────────────────
        areaServed: fields.array(
            fields.text({ label: 'Ciudad / Zona' }),
            {
                label: 'Ciudades donde ofreces servicio',
                description: 'Añade cada ciudad o barrio donde trabajas. Mejora el SEO local.',
                itemLabel: (props) => props.value || 'Nueva ciudad',
            }
        ),

        serviceRadius: fields.integer({
            label: 'Radio de Servicio (km)',
            description: 'Alternativa a la lista de ciudades: define un radio en km desde tus coordenadas. Ponlo en 0 si prefieres usar la lista de ciudades.',
            defaultValue: 0,
        }),

        // ── 7. SCHEMA.ORG — DATOS ADICIONALES ────────────────────────────────
        priceRange: fields.text({
            label: 'Rango de Precios',
            description: 'Ej: €€ — Ayuda a Google a mostrar el nivel de precios en resultados.',
        }),

        paymentAccepted: fields.multiselect({
            label: 'Métodos de Pago Aceptados',
            description: 'Selecciona todos los que apliquen.',
            options: [
                { label: 'Efectivo', value: 'Cash' },
                { label: 'Tarjeta de Crédito', value: 'Credit Card' },
                { label: 'Tarjeta de Débito', value: 'Debit Card' },
                { label: 'Transferencia Bancaria', value: 'Bank Transfer' },
                { label: 'Bizum', value: 'Bizum' },
                { label: 'PayPal', value: 'PayPal' },
            ],
            defaultValue: ['Cash', 'Credit Card'],
        }),

        openingHours: fields.array(
            fields.object({
                dayOfWeek: fields.multiselect({
                    label: 'Días',
                    options: [
                        { label: 'Lunes', value: 'Monday' },
                        { label: 'Martes', value: 'Tuesday' },
                        { label: 'Miércoles', value: 'Wednesday' },
                        { label: 'Jueves', value: 'Thursday' },
                        { label: 'Viernes', value: 'Friday' },
                        { label: 'Sábado', value: 'Saturday' },
                        { label: 'Domingo', value: 'Sunday' },
                    ],
                    defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                }),
                opens: fields.text({ label: 'Hora de Apertura', description: 'Formato 24h. Ej: 09:00' }),
                closes: fields.text({ label: 'Hora de Cierre', description: 'Formato 24h. Ej: 18:00' }),
            }),
            {
                label: 'Horario Schema.org (para Google Business)',
                description: 'Define los horarios exactos que Google muestra en los resultados locales.',
                itemLabel: (props) => {
                    const days = props.fields.dayOfWeek.value || [];
                    return days.length > 0
                        ? `${days.join(', ')}: ${props.fields.opens.value} - ${props.fields.closes.value}`
                        : 'Nuevo horario';
                },
            }
        ),
    },
});
