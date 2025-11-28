import { config, fields, collection, singleton } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image } from 'lucide-react';

export default config({
    storage: {
        kind: 'local',
    },

    // --- INTERFAZ DE USUARIO ---
    ui: {
        // Marca personalizada
        brand: {
            name: 'Rank & Rent Template',
        },

        // Navegación organizada
        navigation: {
            '📝 Contenido': ['services', 'locations', 'projects', 'testimonials', 'homepage'],
            '---': [],
            '⚙️ Configuración': ['business', 'design', 'social', 'analytics', 'schema'],
        },
    },

    // --- SINGLETONS (Configuración Global) ---
    singletons: {
        // 1. INFORMACIÓN DEL NEGOCIO
        business: singleton({
            label: 'Información del Negocio',
            path: 'src/content/business/global',
            schema: {
                siteName: fields.text({ label: 'Nombre del Negocio' }),
                niche: fields.text({ label: 'Nicho (ej: Fontanería, Herrería)' }),

                logo: fields.image({
                    label: 'Logo del Negocio',
                    description: 'Recomendado: PNG transparente, mínimo 200x200px',
                    directory: 'src/assets/images',
                    publicPath: '@assets/images',
                }),

                siteUrl: fields.text({
                    label: 'URL del Sitio',
                    description: 'Con https:// (ej: https://midominio.com)',
                }),

                businessType: fields.select({
                    label: 'Tipo de Negocio (Schema.org)',
                    description: 'Ayuda a Google a entender tu negocio',
                    options: [
                        { label: 'Cerrajería', value: 'Locksmith' },
                        { label: 'Fontanería', value: 'Plumber' },
                        { label: 'Electricista', value: 'Electrician' },
                        { label: 'Herrería / Metalurgia', value: 'LocalBusiness' },
                        { label: 'Limpieza', value: 'LocalBusiness' },
                        { label: 'Reformas / Construcción', value: 'HomeAndConstructionBusiness' },
                        { label: 'Abogados / Legal', value: 'LegalService' },
                        { label: 'Clínica / Salud', value: 'MedicalBusiness' },
                        { label: 'Estética / Belleza', value: 'HealthAndBeautyBusiness' },
                        { label: 'Otro (Genérico)', value: 'LocalBusiness' },
                    ],
                    defaultValue: 'LocalBusiness',
                }),

                city: fields.text({ label: 'Ciudad Principal' }),
                address: fields.text({ label: 'Dirección Completa' }),

                coordinates: fields.object({
                    lat: fields.text({ label: 'Latitud', description: 'Ej: 41.6488' }),
                    lng: fields.text({ label: 'Longitud', description: 'Ej: -0.8891' }),
                }, {
                    label: 'Coordenadas GPS',
                    description: 'Para Google Maps. Búscalas en Google Maps > clic derecho > coordenadas'
                }),

                phone: fields.text({ label: 'Teléfono' }),
                whatsapp: fields.text({ label: 'WhatsApp (ej: 34600000000)' }),
                email: fields.text({ label: 'Email' }),
                schedule: fields.text({
                    label: 'Horario de Atención',
                    description: 'Ej: Lun-Vie 9:00-20:00, Sáb 10:00-14:00'
                }),

                nif: fields.text({ label: 'NIF / CIF' }),

                ctaText: fields.text({
                    label: 'Texto Botón CTA',
                    description: 'Ej: Pedir Presupuesto, Llamar Ahora'
                }),
            },
        }),

        // 2. DISEÑO Y TEMA
        design: singleton({
            label: 'Diseño y Tema',
            path: 'src/content/design/global',
            schema: {
                theme: fields.select({
                    label: 'Tema de Color',
                    description: 'Paleta de colores para toda la web',
                    options: [
                        { label: 'Industrial (Naranja)', value: 'industrial' },
                        { label: 'Corporativo (Azul)', value: 'corporate' },
                        { label: 'Naturaleza (Verde)', value: 'nature' },
                        { label: 'Urgencia (Rojo)', value: 'urgent' },
                        { label: 'Legal (Navy/Oro)', value: 'legal' },
                        { label: 'Salud (Turquesa)', value: 'health' },
                        { label: 'Lujo (Negro/Oro)', value: 'luxury' },
                        { label: 'Estética (Rosa)', value: 'beauty' },
                        { label: 'Tech (Violeta)', value: 'tech' },
                        { label: 'Clean (Claro/Minimal)', value: 'clean_light' },
                    ],
                    defaultValue: 'industrial',
                }),
                fontPair: fields.select({
                    label: 'Tipografía (Fuentes)',
                    description: 'Pareja de fuentes para Títulos y Texto',
                    options: [
                        { label: 'Moderno (Oswald / Inter)', value: 'modern' },
                        { label: 'Robusto (Barlow / Roboto)', value: 'robust' },
                        { label: 'Elegante (Playfair / Lato)', value: 'elegant' },
                        { label: 'Amigable (Nunito / Open Sans)', value: 'friendly' },
                        { label: 'Tech (Chakra Petch / Exo 2)', value: 'tech' },
                    ],
                    defaultValue: 'modern',
                }),
            },
        }),

        // 3. REDES SOCIALES
        social: singleton({
            label: 'Redes Sociales',
            path: 'src/content/social/global',
            schema: {
                facebook: fields.text({
                    label: 'Facebook URL',
                    description: 'URL completa (ej: https://facebook.com/tunegocio)'
                }),
                instagram: fields.text({
                    label: 'Instagram URL',
                    description: 'URL completa (ej: https://instagram.com/tunegocio)'
                }),
            },
        }),

        // 4. ANALYTICS Y TRACKING
        analytics: singleton({
            label: 'Analytics y Tracking',
            path: 'src/content/analytics/global',
            schema: {
                googleAnalyticsId: fields.text({
                    label: 'Google Analytics 4 ID',
                    description: 'Ej: G-XXXXXXXXXX'
                }),
                gtmId: fields.text({
                    label: 'Google Tag Manager ID',
                    description: 'Ej: GTM-XXXXXXX'
                }),
                searchConsoleVerification: fields.text({
                    label: 'Google Search Console - Código de Verificación',
                    description: 'Código meta tag de verificación (solo el contenido, sin <meta>). Ej: abc123def456...',
                }),
            },
        }),

        // 5. SCHEMA.ORG (DATOS ESTRUCTURADOS)
        schema: singleton({
            label: 'Schema.org (SEO Avanzado)',
            path: 'src/content/schema/global',
            schema: {
                priceRange: fields.text({
                    label: 'Rango de Precios',
                    description: 'Ej: €€ o $$ (ayuda a Google a mostrar info de precios)',
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
                        opens: fields.text({
                            label: 'Hora de Apertura',
                            description: 'Formato 24h (ej: 09:00)',
                        }),
                        closes: fields.text({
                            label: 'Hora de Cierre',
                            description: 'Formato 24h (ej: 18:00)',
                        }),
                    }),
                    {
                        label: 'Horario de Apertura (Schema.org)',
                        description: 'Define los horarios para Google Business',
                        itemLabel: (props) => {
                            const days = props.fields.dayOfWeek.value || [];
                            const opens = props.fields.opens.value || '';
                            const closes = props.fields.closes.value || '';
                            return days.length > 0
                                ? `${days.join(', ')}: ${opens} - ${closes}`
                                : 'Nuevo horario';
                        },
                    }
                ),

                areaServed: fields.array(
                    fields.text({ label: 'Ciudad/Zona' }),
                    {
                        label: 'Áreas de Servicio',
                        description: 'Ciudades o zonas donde ofreces servicio (para Schema.org)',
                        itemLabel: (props) => props.value || 'Nueva área',
                    }
                ),

                paymentAccepted: fields.multiselect({
                    label: 'Métodos de Pago Aceptados',
                    description: 'Selecciona todos los que apliquen',
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

                foundingDate: fields.text({
                    label: 'Año de Fundación',
                    description: 'Ej: 1995 (añade credibilidad)',
                }),

                slogan: fields.text({
                    label: 'Eslogan/Lema',
                    description: 'Frase que representa tu negocio',
                    multiline: true,
                }),
            },
        }),


        homepage: singleton({
            label: '🏠 Página de Inicio',
            path: 'src/content/pages/home',
            format: { contentField: 'content' },
            entryLayout: 'content',
            schema: {
                // --- HERO SECTION ---
                hero: fields.object({
                    heading: fields.text({ label: 'Hero: Título Principal (Parte Blanca)' }),
                    headingHighlight: fields.text({ label: 'Hero: Título Destacado (Parte Color)' }),
                    subheading: fields.text({ label: 'Hero: Subtítulo', multiline: true }),
                    backgroundImage: fields.image({
                        label: 'Imagen de Fondo',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                        validation: { isRequired: false }
                    }),
                }, { label: 'Hero Section' }),

                // --- SECCIÓN SERVICIOS ---
                servicesSection: fields.object({
                    title: fields.text({ label: 'Título Sección (Parte Blanca)' }),
                    titleHighlight: fields.text({ label: 'Título Destacado (Parte Color)' }),
                    subtitle: fields.text({ label: 'Subtítulo / Descripción', multiline: true }),
                }, { label: 'Sección Servicios' }),

                // --- SECCIÓN SOBRE NOSOTROS (NUEVA) ---
                aboutSection: fields.object({
                    title: fields.text({ label: 'Título Principal' }),
                    image: fields.image({
                        label: 'Imagen Principal',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                    yearsExperience: fields.text({ label: 'Años de Experiencia (Badge)' }),
                    description: fields.text({
                        label: 'Descripción (Markdown soportado)',
                        multiline: true,
                    }),
                    features: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Título Característica' }),
                            description: fields.text({ label: 'Descripción Característica' }),
                        }),
                        { label: 'Lista de Características' }
                    ),
                    buttonText: fields.text({ label: 'Texto Botón' }),
                    buttonLink: fields.text({ label: 'Enlace Botón' }),
                }, { label: 'Sección Sobre Nosotros' }),

                // --- POR QUÉ ELEGIRNOS ---
                features: fields.array(
                    fields.object({
                        title: fields.text({ label: 'Título' }),
                        description: fields.text({ label: 'Descripción', multiline: true }),
                        icon: fields.text({ label: 'Icono (Lucide name)' }),
                    }),
                    {
                        label: 'Beneficios / Por qué elegirnos',
                        itemLabel: (props) => props.fields.title.value || 'Beneficio',
                    }
                ),

                // --- SEO CONTENT ---
                seoContentTitle: fields.text({ label: 'Título Sección SEO (Texto Final)' }),
                content: fields.mdx({ label: 'Contenido SEO (Texto Final)' }),

                // --- FAQ ---
                faq: fields.array(
                    fields.object({
                        question: fields.text({ label: 'Pregunta' }),
                        answer: fields.text({ label: 'Respuesta', multiline: true }),
                    }),
                    {
                        label: 'Preguntas Frecuentes (Home)',
                        itemLabel: (props) => props.fields.question.value || 'Pregunta',
                    }
                ),
            }
        })
    },

    // --- COLECCIONES ---
    collections: {
        // 1. SERVICIOS (Optimizado con Slug automático)
        services: collection({
            label: 'Servicios',
            slugField: 'title', // <--- CAMBIO IMPORTANTE: El slug depende del título
            path: 'src/content/services/*',
            format: { contentField: 'content' },
            entryLayout: 'content',
            schema: {
                // FUSIÓN: Este campo maneja el Título (H1) Y el Slug al mismo tiempo
                title: fields.slug({
                    name: {
                        label: 'Título Principal (H1)',
                        validation: { length: { min: 1 } }
                    },
                    slug: {
                        label: 'URL / Slug',
                        description: 'Se genera automático. Haz clic en el candado para editarlo manualmente.'
                    }
                }),

                // Nota: Ya no necesitamos un campo 'slug' separado aquí.

                heroImage: fields.image({
                    label: 'Imagen Destacada (Hero)',
                    description: 'Imagen principal que aparece en el hero del servicio. Recomendado: 1920x1080px',
                    directory: 'public/images/services',
                    publicPath: '/images/services',
                    validation: { isRequired: false }
                }),

                seoTitle: fields.text({ label: 'SEO Title (Meta)' }),
                seoDesc: fields.text({ label: 'SEO Description', multiline: true }),
                icon: fields.text({ label: 'Icono (Lucide)' }),
                shortDesc: fields.text({ label: 'Descripción Corta', multiline: true }),
                featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

                faq: fields.array(
                    fields.object({
                        question: fields.text({ label: 'Pregunta' }),
                        answer: fields.text({ label: 'Respuesta', multiline: true }),
                    }),
                    {
                        label: 'Preguntas Frecuentes',
                        itemLabel: (props) => props.fields.question.value || 'Pregunta',
                    }
                ),

                content: fields.mdx({
                    label: 'Contenido Completo',
                    options: {
                        image: {
                            directory: 'public/images/services',
                            publicPath: '/images/services',
                        }
                    },
                    components: {
                        CtaBlock: {
                            label: 'Botón de Llamada a la Acción (CTA)',
                            kind: 'block',
                            icon: <MousePointer2 />,
                            schema: {
                                text: fields.text({
                                    label: 'Texto del botón',
                                    validation: { length: { min: 1 } },
                                }),
                                url: fields.text({ label: 'URL de Destino (ej: /contacto o https://wa.me/34600000000)' }),
                                type: fields.select({
                                    label: 'Estilo',
                                    options: [
                                        { label: 'Primario (Color Principal)', value: 'primary' },
                                        { label: 'Secundario (Borde)', value: 'secondary' },
                                        { label: 'WhatsApp (Verde)', value: 'whatsapp' },
                                    ],
                                    defaultValue: 'primary',
                                }),
                                alignment: fields.select({
                                    label: 'Alineación',
                                    options: [
                                        { label: 'Izquierda', value: 'left' },
                                        { label: 'Centro', value: 'center' },
                                        { label: 'Derecha', value: 'right' },
                                    ],
                                    defaultValue: 'center',
                                }),
                                size: fields.select({
                                    label: 'Tamaño',
                                    options: [
                                        { label: 'Pequeño', value: 'small' },
                                        { label: 'Mediano', value: 'medium' },
                                        { label: 'Grande', value: 'large' },
                                    ],
                                    defaultValue: 'large',
                                }),
                                isFullWidth: fields.checkbox({
                                    label: 'Ancho Completo (Full Width)',
                                    defaultValue: false,
                                }),
                            },
                        },

                        AlertBlock: {
                            label: 'Caja de Alerta / Aviso',
                            kind: 'block',
                            icon: <AlertTriangle />,
                            schema: {
                                title: fields.text({ label: 'Título de la Alerta' }),
                                content: fields.text({
                                    label: 'Contenido',
                                    multiline: true,
                                }),
                                type: fields.select({
                                    label: 'Tipo de Alerta',
                                    options: [
                                        { label: 'Información (Azul)', value: 'info' },
                                        { label: 'Advertencia (Amarillo)', value: 'warning' },
                                        { label: 'Éxito (Verde)', value: 'success' },
                                        { label: 'Peligro (Rojo)', value: 'error' },
                                    ],
                                    defaultValue: 'info',
                                }),
                            },
                        },

                        PhoneBlock: {
                            label: '📞 Teléfono Dinámico',
                            kind: 'block',
                            icon: <Phone />,
                            schema: {}, // No necesita campos
                        },

                        BusinessNameBlock: {
                            label: '🏢 Nombre del Negocio',
                            kind: 'block',
                            icon: <Building />,
                            schema: {}, // No necesita campos
                        },

                        CustomImageBlock: {
                            label: 'Imagen con Estilo',
                            kind: 'block',
                            icon: <Image />,
                            schema: {
                                image: fields.image({
                                    label: 'Imagen',
                                    directory: 'public/images/content',
                                    publicPath: '/images/content',
                                }),
                                alt: fields.text({ label: 'Texto Alternativo (SEO)' }),
                                caption: fields.text({ label: 'Pie de Foto (Opcional)' }),
                                objectFit: fields.select({
                                    label: 'Ajuste de Imagen (Object Fit)',
                                    options: [
                                        { label: 'Cubrir (Cover)', value: 'cover' },
                                        { label: 'Contener (Contain)', value: 'contain' },
                                        { label: 'Estirar (Fill)', value: 'fill' },
                                    ],
                                    defaultValue: 'cover',
                                }),
                                borderRadius: fields.select({
                                    label: 'Bordes Redondeados',
                                    options: [
                                        { label: 'Ninguno', value: 'none' },
                                        { label: 'Pequeño', value: 'sm' },
                                        { label: 'Mediano', value: 'md' },
                                        { label: 'Grande', value: 'lg' },
                                        { label: 'Extra Grande', value: 'xl' },
                                        { label: 'Completo (Círculo)', value: 'full' },
                                    ],
                                    defaultValue: 'xl',
                                }),
                                shadow: fields.select({
                                    label: 'Sombra',
                                    options: [
                                        { label: 'Ninguna', value: 'none' },
                                        { label: 'Pequeña', value: 'sm' },
                                        { label: 'Mediana', value: 'md' },
                                        { label: 'Grande', value: 'lg' },
                                        { label: 'Extra Grande', value: 'xl' },
                                    ],
                                    defaultValue: 'lg',
                                }),
                            },
                        },
                    }
                }),
            },
        }),

        // 2. ZONAS (Optimizado igual)
        locations: collection({
            label: 'Zonas de Servicio',
            slugField: 'name', // Usamos 'name' como el campo principal aquí
            path: 'src/content/locations/*',
            format: { contentField: 'content' },
            entryLayout: 'content',
            schema: {
                // Fusión para Zonas
                name: fields.slug({
                    name: { label: 'Nombre de la Zona' },
                }),

                type: fields.select({
                    label: 'Tipo de Zona',
                    options: [
                        { label: 'Residencial', value: 'residencial' },
                        { label: 'Industrial', value: 'industrial' },
                        { label: 'Centro Urbano', value: 'centro' },
                    ],
                    defaultValue: 'residencial',
                }),
                seoTitle: fields.text({ label: 'Meta Title' }),
                seoDesc: fields.text({ label: 'Meta Description', multiline: true }),

                heroImage: fields.image({
                    label: 'Imagen Hero de la Zona',
                    description: 'Imagen representativa de la zona. Recomendado: 1920x1080px',
                    directory: 'public/images/locations',
                    publicPath: '/images/locations',
                    validation: { isRequired: false }
                }),

                coordinates: fields.object({
                    lat: fields.text({ label: 'Latitud', description: 'Ej: 41.6488' }),
                    lng: fields.text({ label: 'Longitud', description: 'Ej: -0.8891' }),
                }, {
                    label: 'Coordenadas GPS de la Zona',
                    description: 'Para centrar el mapa en esta zona específica'
                }),

                zipCodes: fields.array(fields.text({ label: 'Código Postal' }), {
                    label: 'Códigos Postales',
                    itemLabel: (props) => props.value,
                }),

                faq: fields.array(
                    fields.object({
                        question: fields.text({ label: 'Pregunta' }),
                        answer: fields.text({ label: 'Respuesta', multiline: true }),
                    }),
                    {
                        label: 'Preguntas Frecuentes de la Zona',
                        description: 'FAQ específicas para esta zona (mejora SEO local)',
                        itemLabel: (props) => props.fields.question.value || 'Pregunta',
                    }
                ),

                content: fields.mdx({
                    label: 'Contenido',
                    components: {
                        CtaBlock: {
                            label: 'Botón de Llamada a la Acción (CTA)',
                            kind: 'block',
                            icon: <MousePointer2 />,
                            schema: {
                                text: fields.text({
                                    label: 'Texto del botón',
                                    validation: { length: { min: 1 } },
                                }),
                                url: fields.text({ label: 'URL de Destino (ej: /contacto o https://wa.me/34600000000)' }),
                                type: fields.select({
                                    label: 'Estilo',
                                    options: [
                                        { label: 'Primario (Color Principal)', value: 'primary' },
                                        { label: 'Secundario (Borde)', value: 'secondary' },
                                        { label: 'WhatsApp (Verde)', value: 'whatsapp' },
                                    ],
                                    defaultValue: 'primary',
                                }),
                                alignment: fields.select({
                                    label: 'Alineación',
                                    options: [
                                        { label: 'Izquierda', value: 'left' },
                                        { label: 'Centro', value: 'center' },
                                        { label: 'Derecha', value: 'right' },
                                    ],
                                    defaultValue: 'center',
                                }),
                                size: fields.select({
                                    label: 'Tamaño',
                                    options: [
                                        { label: 'Pequeño', value: 'small' },
                                        { label: 'Mediano', value: 'medium' },
                                        { label: 'Grande', value: 'large' },
                                    ],
                                    defaultValue: 'large',
                                }),
                                isFullWidth: fields.checkbox({
                                    label: 'Ancho Completo (Full Width)',
                                    defaultValue: false,
                                }),
                            },
                        },

                        AlertBlock: {
                            label: 'Caja de Alerta / Aviso',
                            kind: 'block',
                            icon: <AlertTriangle />,
                            schema: {
                                title: fields.text({ label: 'Título de la Alerta' }),
                                content: fields.text({
                                    label: 'Contenido',
                                    multiline: true,
                                }),
                                type: fields.select({
                                    label: 'Tipo de Alerta',
                                    options: [
                                        { label: 'Información (Azul)', value: 'info' },
                                        { label: 'Advertencia (Amarillo)', value: 'warning' },
                                        { label: 'Éxito (Verde)', value: 'success' },
                                        { label: 'Peligro (Rojo)', value: 'error' },
                                    ],
                                    defaultValue: 'info',
                                }),
                            },
                        },

                        PhoneBlock: {
                            label: '📞 Teléfono Dinámico',
                            kind: 'block',
                            icon: <Phone />,
                            schema: {}, // No necesita campos
                        },

                        BusinessNameBlock: {
                            label: '🏢 Nombre del Negocio',
                            kind: 'block',
                            icon: <Building />,
                            schema: {}, // No necesita campos
                        },

                        CustomImageBlock: {
                            label: 'Imagen con Estilo',
                            kind: 'block',
                            icon: <Image />,
                            schema: {
                                image: fields.image({
                                    label: 'Imagen',
                                    directory: 'public/images/content',
                                    publicPath: '/images/content',
                                }),
                                alt: fields.text({ label: 'Texto Alternativo (SEO)' }),
                                caption: fields.text({ label: 'Pie de Foto (Opcional)' }),
                                objectFit: fields.select({
                                    label: 'Ajuste de Imagen (Object Fit)',
                                    options: [
                                        { label: 'Cubrir (Cover)', value: 'cover' },
                                        { label: 'Contener (Contain)', value: 'contain' },
                                        { label: 'Estirar (Fill)', value: 'fill' },
                                    ],
                                    defaultValue: 'cover',
                                }),
                                borderRadius: fields.select({
                                    label: 'Bordes Redondeados',
                                    options: [
                                        { label: 'Ninguno', value: 'none' },
                                        { label: 'Pequeño', value: 'sm' },
                                        { label: 'Mediano', value: 'md' },
                                        { label: 'Grande', value: 'lg' },
                                        { label: 'Extra Grande', value: 'xl' },
                                        { label: 'Completo (Círculo)', value: 'full' },
                                    ],
                                    defaultValue: 'xl',
                                }),
                                shadow: fields.select({
                                    label: 'Sombra',
                                    options: [
                                        { label: 'Ninguna', value: 'none' },
                                        { label: 'Pequeña', value: 'sm' },
                                        { label: 'Mediana', value: 'md' },
                                        { label: 'Grande', value: 'lg' },
                                        { label: 'Extra Grande', value: 'xl' },
                                    ],
                                    defaultValue: 'lg',
                                }),
                            },
                        },
                    }
                }),
            },
        }),

        // 3. PROYECTOS (Optimizado igual)
        projects: collection({
            label: 'Portafolio',
            slugField: 'title', // Usamos 'title' aquí
            path: 'src/content/projects/*',
            format: { contentField: 'content' },
            entryLayout: 'content',
            schema: {
                // Fusión para Proyectos
                title: fields.slug({
                    name: { label: 'Título del Proyecto' },
                }),

                image: fields.image({
                    label: 'Imagen',
                    directory: 'src/assets/projects',
                    publicPath: '@assets/projects',
                }),
                locationTag: fields.text({ label: 'Etiqueta de Ubicación' }),
                content: fields.mdx({ label: 'Detalles' }),
            },
        }),


        // 4. TESTIMONIOS
        testimonials: collection({
            label: '⭐ Testimonios',
            slugField: 'name',
            path: 'src/content/testimonials/*',
            schema: {
                name: fields.slug({
                    name: { label: 'Nombre del Cliente' },
                }),
                initials: fields.text({
                    label: 'Iniciales',
                    description: 'Ej: JP para Juan Pérez',
                }),
                rating: fields.integer({
                    label: 'Estrellas (1-5)',
                    defaultValue: 5,
                    validation: { min: 1, max: 5 },
                }),
                text: fields.text({
                    label: 'Testimonio',
                    multiline: true,
                }),
                featured: fields.checkbox({
                    label: 'Mostrar en páginas de servicios',
                    defaultValue: true,
                }),
            },
        }),

    },
});