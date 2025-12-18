import { singleton, fields } from '@keystatic/core';

export const homepage = singleton({
    label: '🏠 Página de Inicio',
    path: 'src/content/pages/home',
    previewUrl: '/',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        // --- CONSTRUCTOR DE BLOQUES (NUEVO MODELO DE DATOS) ---
        blocks: fields.blocks({
            hero: {
                label: 'Hero Principal',
                schema: fields.object({
                    heading: fields.text({ label: 'Título Principal (Parte Blanca)' }),
                    headingHighlight: fields.text({ label: 'Título Destacado (Parte Color)' }),
                    subheading: fields.text({ label: 'Subtítulo', multiline: true }),
                    backgroundImage: fields.image({
                        label: 'Imagen de Fondo',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                })
            },
            services_grid: {
                label: 'Grilla de Servicios Automática',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección (Parte Blanca)' }),
                    titleHighlight: fields.text({ label: 'Título Destacado (Parte Color)' }),
                    subtitle: fields.text({ label: 'Resumen', multiline: true }),
                })
            },
            services_list: {
                label: 'Lista de Servicios (Manual/OnePage)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    items: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Nombre Servicio' }),
                            description: fields.text({ label: 'Descripción', multiline: true }),
                            image: fields.image({
                                label: 'Imagen (Opcional)',
                                directory: 'public/images/services',
                                publicPath: '/images/services',
                            }),
                        }),
                        { label: 'Servicios Manuales', itemLabel: p => p.fields.title.value || 'Servicio' }
                    )
                })
            },
            about: {
                label: 'Sección Sobre Nosotros',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    description: fields.text({ label: 'Biografía / Historia', multiline: true }),
                    yearsExperience: fields.text({ label: 'Años (Badge)' }),
                    image: fields.image({
                        label: 'Imagen Principal',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                    features: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Título' }),
                            description: fields.text({ label: 'Detalle' }),
                        }),
                        { label: 'Puntos Clave' }
                    ),
                    buttonText: fields.text({ label: 'Texto del Botón' }),
                    buttonLink: fields.text({ label: 'Enlace del Botón' }),
                })
            },
            features: {
                label: 'Características / Beneficios',
                schema: fields.array(
                    fields.object({
                        title: fields.text({ label: 'Título' }),
                        description: fields.text({ label: 'Descripción', multiline: true }),
                        icon: fields.text({ label: 'Icono (Lucide name)' }),
                    }),
                    { label: 'Beneficios', itemLabel: p => p.fields.title.value || 'Beneficio' }
                )
            },
            testimonials: {
                label: 'Carrusel de Testimonios',
                schema: fields.array(
                    fields.object({
                        quote: fields.text({ label: 'Testimonio', multiline: true }),
                        author: fields.text({ label: 'Nombre' }),
                        location: fields.text({ label: 'Ubicación' }),
                        initials: fields.text({ label: 'Iniciales' }),
                    }),
                    { label: 'Opiniones', itemLabel: p => p.fields.author.value || 'Reseña' }
                )
            },
            process: {
                label: 'Proceso de Trabajo',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    steps: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Paso' }),
                            description: fields.text({ label: 'Descripción', multiline: true }),
                        }),
                        { label: 'Pasos', itemLabel: p => p.fields.title.value || 'Paso' }
                    )
                })
            },
            faq: {
                label: 'Preguntas Frecuentes',
                schema: fields.array(
                    fields.object({
                        question: fields.text({ label: 'Pregunta' }),
                        answer: fields.text({ label: 'Respuesta', multiline: true }),
                    }),
                    { label: 'FAQs', itemLabel: p => p.fields.question.value || 'Pregunta' }
                )
            },
            locations: {
                label: 'Mapas / Zonas',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Descripción' }),
                })
            },
            cta: {
                label: 'Llamada a la Acción (CTA)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    buttonText: fields.text({ label: 'Botón' }),
                })
            },
            contact: {
                label: 'Sección de Contacto (Formulario)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                })
            },
            content: {
                label: 'Bloque de Texto SEO (Usa el contenido de abajo)',
                schema: fields.object({
                    title: fields.text({ label: 'Título del Bloque' }),
                })
            }
        }, {
            label: 'Constructor de Portada',
            description: 'Diseña la estructura de tu página de inicio arrastrando y configurando bloques.'
        }),

        // Contenido MDX para el bloque de texto
        content: fields.mdx({ label: 'Contenido Adicional (Opcional)' }),

        // Campos adicionales para SEO y UI
        seoContentTitle: fields.text({ label: 'Título del Bloque Seo (Opcional)' }),
        stickyPhone: fields.checkbox({ label: 'Mostrar Botón de WhatsApp flotante', defaultValue: true }),
    }
});
