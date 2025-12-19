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
                label: 'Bloque de Texto SEO / Contenido Estructurado',
                schema: fields.object({
                    title: fields.text({ label: 'Título del Bloque' }),
                    sections: fields.array(
                        fields.object({
                            heading: fields.text({ label: 'Encabezado' }),
                            content: fields.mdx({
                                label: 'Contenido',
                                extension: 'mdx',
                            }),
                        }),
                        { label: 'Secciones de Contenido', itemLabel: (p) => p.fields.heading.value || 'Sección' }
                    ),
                })
            },
            service_areas: {
                label: 'Zonas de Servicio',
                schema: fields.object({
                    title: fields.text({ label: 'Título Principal' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    areas: fields.object({
                        barcelona: fields.object({
                            title: fields.text({ label: 'Título Barcelona' }),
                            description: fields.text({ label: 'Descripción Barcelona' }),
                            districts: fields.array(
                                fields.object({
                                    name: fields.text({ label: 'Nombre Distrito' }),
                                    description: fields.text({ label: 'Descripción', multiline: true }),
                                    icon: fields.text({ label: 'Icono (Lucide)' }),
                                    popular: fields.checkbox({ label: '¿Es zona popular?', defaultValue: false }),
                                }),
                                { label: 'Distritos', itemLabel: (p) => p.fields.name.value || 'Distrito' }
                            ),
                        }),
                        metropolitan: fields.object({
                            title: fields.text({ label: 'Título Área Metropolitana' }),
                            description: fields.text({ label: 'Descripción Área Metropolitana' }),
                            cities: fields.array(
                                fields.object({
                                    name: fields.text({ label: 'Nombre Ciudad' }),
                                    supplement: fields.text({ label: 'Suplemento/Precio' }),
                                    icon: fields.text({ label: 'Icono (Lucide)' }),
                                }),
                                { label: 'Ciudades', itemLabel: (p) => p.fields.name.value || 'Ciudad' }
                            ),
                        }),
                    }),
                })
            },
            pricing: {
                label: 'Tabla de Precios',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    plans: fields.array(
                        fields.object({
                            name: fields.text({ label: 'Nombre del Plan' }),
                            price: fields.text({ label: 'Precio (Ej: 99€)' }),
                            description: fields.text({ label: 'Descripción Corta' }),
                            isPopular: fields.checkbox({ label: '¿Es el plan más popular?', defaultValue: false }),
                            features: fields.array(fields.text({ label: 'Característica' }), {
                                label: 'Características',
                                itemLabel: p => p.value || 'Característica'
                            }),
                            buttonText: fields.text({ label: 'Texto del Botón', defaultValue: 'Solicitar Ahora' }),
                            buttonLink: fields.text({ label: 'Enlace (Opcional)', defaultValue: '#contacto' }),
                        }),
                        { label: 'Planes', itemLabel: p => p.fields.name.value || 'Plan' }
                    )
                })
            },
            stats: {
                label: 'Números / Estadísticas',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección (Opcional)' }),
                    stats: fields.array(
                        fields.object({
                            label: fields.text({ label: 'Etiqueta (Ej: Clientes)' }),
                            value: fields.text({ label: 'Valor (Ej: 500)' }),
                            suffix: fields.text({ label: 'Sufijo (Ej: +)' }),
                        }),
                        { label: 'Estadísticas', itemLabel: p => `${p.fields.value.value}${p.fields.suffix.value} ${p.fields.label.value}` }
                    )
                })
            },
            logos: {
                label: 'Logos de Confianza / Partners',
                schema: fields.object({
                    title: fields.text({ label: 'Título (Opcional)' }),
                    logos: fields.array(
                        fields.object({
                            alt: fields.text({ label: 'Nombre Empresa' }),
                            image: fields.image({
                                label: 'Logo',
                                directory: 'public/images/logos',
                                publicPath: '/images/logos',
                            }),
                        }),
                        { label: 'Logos', itemLabel: p => p.fields.alt.value || 'Logo' }
                    )
                })
            },
            before_after: {
                label: 'Antes y Después (Comparativa)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    beforeImage: fields.image({
                        label: 'Imagen Antes',
                        directory: 'public/images/comparativas',
                        publicPath: '/images/comparativas',
                    }),
                    afterImage: fields.image({
                        label: 'Imagen Después',
                        directory: 'public/images/comparativas',
                        publicPath: '/images/comparativas',
                    }),
                    beforeLabel: fields.text({ label: 'Etiqueta Antes', defaultValue: 'Antes' }),
                    afterLabel: fields.text({ label: 'Etiqueta Después', defaultValue: 'Después' }),
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
