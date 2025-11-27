import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },

    // --- SINGLETONS (Configuración Global) ---
    singletons: {
        settings: singleton({
            label: '⚙️ Configuración del Negocio',
            path: 'src/content/settings/global',
            schema: {
                theme: fields.select({
                    label: '🎨 Tema de Color',
                    description: 'Elige la paleta de colores para toda la web.',
                    options: [
                        { label: 'Industrial (Naranja)', value: 'industrial' },
                        { label: 'Corporativo (Azul)', value: 'corporate' },
                        { label: 'Naturaleza (Verde)', value: 'nature' },
                        { label: 'Urgencia (Rojo)', value: 'urgent' }
                    ],
                    defaultValue: 'industrial',
                }),
                siteName: fields.text({ label: 'Nombre del Negocio' }),
                niche: fields.text({ label: 'Nicho (ej: Herrería)' }),
                city: fields.text({ label: 'Ciudad Principal' }),
                phone: fields.text({ label: 'Teléfono' }),
                whatsapp: fields.text({ label: 'WhatsApp (ej: 34600000000)' }),
                email: fields.text({ label: 'Email' }),
                address: fields.text({ label: 'Dirección' }),
                nif: fields.text({ label: 'NIF / CIF' }),
                ctaText: fields.text({ label: 'Texto Botón CTA' }),
                facebook: fields.text({ label: 'Facebook URL' }),
                instagram: fields.text({ label: 'Instagram URL' }),
            },
        }),
        homepage: singleton({
            label: '🏠 Página de Inicio',
            path: 'src/content/pages/home',
            format: { contentField: 'content' },
            schema: {
                // --- HERO SECTION ---
                hero: fields.object({
                    heading: fields.text({ label: 'Hero: Título Principal' }),
                    subheading: fields.text({ label: 'Hero: Subtítulo', multiline: true }),
                    backgroundImage: fields.image({
                        label: 'Imagen de Fondo',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                        validation: { isRequired: false }
                    }),
                }, { label: 'Hero Section' }),

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
                seoContentTitle: fields.text({ label: 'Título SEO (Sobre Nosotros)' }),
                content: fields.mdx({ label: 'Contenido SEO / Sobre Nosotros' }),

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
                zipCodes: fields.array(fields.text({ label: 'Código Postal' }), {
                    label: 'Códigos Postales',
                    itemLabel: (props) => props.value,
                }),
                content: fields.mdx({ label: 'Contenido' }),
            },
        }),

        // 3. PROYECTOS (Optimizado igual)
        projects: collection({
            label: 'Portafolio',
            slugField: 'title', // Usamos 'title' aquí
            path: 'src/content/projects/*',
            format: { contentField: 'content' },
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
    },
});