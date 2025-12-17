import { singleton, fields } from '@keystatic/core';

export const homepage = singleton({
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

        // --- LISTA DE SERVICIOS (ONE PAGE MODE) ---
        servicesList: fields.array(
            fields.object({
                title: fields.text({ label: 'Título del Servicio' }),
                description: fields.text({ label: 'Descripción', multiline: true }),
            }),
            {
                label: 'Lista de Servicios (Modo One Page)',
                itemLabel: (props) => props.fields.title.value || 'Servicio',
            }
        ),

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

        // --- TESTIMONIOS ---
        testimonials: fields.array(
            fields.object({
                quote: fields.text({
                    label: 'Testimonio',
                    multiline: true
                }),
                author: fields.text({ label: 'Nombre del Cliente' }),
                location: fields.text({ label: 'Ubicación (Barrio/Ciudad)' }),
                initials: fields.text({
                    label: 'Iniciales',
                    description: 'Ej: JP para Juan Pérez'
                }),
            }),
            {
                label: 'Testimonios de Clientes',
                description: 'Reseñas y opiniones de clientes satisfechos',
                itemLabel: (props) => props.fields.author.value || 'Testimonio',
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

        // --- PROCESO DE TRABAJO ---
        process: fields.object({
            title: fields.text({ label: 'Título Sección' }),
            description: fields.text({ label: 'Descripción', multiline: true }),
            steps: fields.array(
                fields.object({
                    title: fields.text({ label: 'Título del Paso' }),
                    description: fields.text({ label: 'Descripción', multiline: true }),
                }),
                {
                    label: 'Pasos del Proceso',
                    itemLabel: (props) => props.fields.title.value || 'Paso',
                }
            ),
        }, { label: 'Sección Proceso de Trabajo' }),

        // --- SECCIÓN CONTACTO (HOME) ---
        contactSection: fields.object({
            title: fields.text({ label: 'Título Sección' }),
            subtitle: fields.text({ label: 'Subtítulo / Descripción', multiline: true }),
        }, { label: 'Sección Contacto (Home)' }),

        // --- SECCIÓN ZONAS (HOME) ---
        locationsSection: fields.object({
            title: fields.text({ label: 'Título Sección' }),
            subtitle: fields.text({ label: 'Subtítulo / Descripción', multiline: true }),
        }, { label: 'Sección Zonas (Home)' }),

        // --- OPCIONES EXTRA ---
        stickyPhone: fields.checkbox({
            label: '📞 Mostrar Botón de Llamada Flotante (Móvil)',
            description: 'Añade un botón de "Llamar Ahora" fijo en la parte inferior para móviles (ideal urgencias).',
            defaultValue: true
        }),

        // --- NUEVO: PAGE BUILDER PARA HOMEPAGE ---
        blocks: fields.blocks({
            hero: {
                label: 'Hero Principal',
                schema: fields.empty()
            },
            services: {
                label: 'Grilla de Servicios',
                schema: fields.empty()
            },
            services_list: {
                label: 'Lista de Servicios (One Page)',
                schema: fields.empty()
            },
            about: {
                label: 'Sección Sobre Nosotros',
                schema: fields.empty()
            },
            features: {
                label: 'Características (Iconos)',
                schema: fields.empty()
            },
            contact: {
                label: 'Sección Contacto/Presupuesto',
                schema: fields.empty()
            },
            testimonials: {
                label: 'Carrusel de Testimonios',
                schema: fields.empty()
            },
            content: {
                label: 'Contenido SEO (Texto)',
                schema: fields.empty()
            },
            faq: {
                label: 'Preguntas Frecuentes',
                schema: fields.empty()
            },
            process: {
                label: 'Proceso de Trabajo',
                schema: fields.empty()
            },
            locations: {
                label: 'Listado de Zonas',
                schema: fields.empty()
            },
            cta: {
                label: 'CTA Final',
                schema: fields.empty()
            },
        }, {
            label: 'Constructor de Página (Orden de Secciones)',
            description: 'Define qué secciones mostrar y en qué orden aparecerán en la página de inicio'
        }),
    }
});
