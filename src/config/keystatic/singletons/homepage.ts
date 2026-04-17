import { singleton, fields } from '@keystatic/core';
import { IconPicker } from '../../../components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { statsVisualEditor } from '../../../components/keystatic/StatsPreview';
import { ctaVisualEditor } from '../../../components/keystatic/CtaPreview';
import { pricingVisualEditor } from '../../../components/keystatic/PricingPreview';

export const homepage = singleton({
    label: '🏠 Página de Inicio',
    path: 'src/content/pages/home',
    previewUrl: '/',
    format: { contentField: 'content' },
    entryLayout: 'form',
    schema: {
        // ─── EDITORES VISUALES (arriba del Constructor) ──────────────────────────
        _heroPreview: heroPreview(),
        _statsPreview: statsVisualEditor(),
        _ctaPreview: ctaVisualEditor(),
        _pricingPreview: pricingVisualEditor(),

        // --- CONSTRUCTOR DE BLOQUES (NUEVO MODELO DE DATOS) ---
        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero — Imagen y Enlace de Botones',
                schema: fields.object({
                    backgroundImage: fields.image({
                        label: 'Imagen de Fondo del Hero',
                        description: 'El texto del Hero (título, subtítulo, botones, checks) se edita arriba en la "Vista Previa del Hero".',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                    ctaPrimaryLink: fields.text({
                        label: '🔗 Enlace Botón Principal',
                        description: 'Ej: tel:+34600123456  o  #presupuesto',
                        defaultValue: '#presupuesto',
                    }),
                    ctaSecondaryLink: fields.text({
                        label: '🔗 Enlace Botón Secundario (WhatsApp)',
                        description: 'Ej: https://wa.me/34600123456',
                        defaultValue: '',
                    }),
                })
            },
            services_grid: {
                label: 'Grilla de Servicios (Enlaces a Páginas)',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección (Parte Blanca)' }),
                    titleHighlight: fields.text({ label: 'Título Destacado (Parte Color)' }),
                    subtitle: fields.text({ label: 'Resumen', multiline: true }),
                    services: fields.array(
                        fields.conditional(
                            fields.select({
                                label: 'Modo de Configuración',
                                options: [
                                    { label: 'Manual (Escribir todo)', value: 'manual' },
                                    { label: 'Automático (Seleccionar Servicio)', value: 'auto' },
                                ],
                                defaultValue: 'manual',
                            }),
                            {
                                manual: fields.object({
                                    title: fields.text({ label: 'Nombre' }),
                                    description: fields.text({ label: 'Descripción', multiline: true }),
                                    icon: IconPicker({ label: 'Icono (Lucide)' }),
                                    price: fields.text({ label: 'Precio (Ej: Desde 12€/m²)' }),
                                    link: fields.text({ label: 'Enlace a Página (Ej: /servicios/alisar)' }),
                                    isPopular: fields.checkbox({ label: '¿Es el plan más popular?', defaultValue: false }),
                                    image: fields.image({
                                        label: 'Imagen Card',
                                        directory: 'public/images/services',
                                        publicPath: '/images/services',
                                    }),
                                    features: fields.array(fields.text({ label: 'Característica' }), {
                                        label: 'Características',
                                        itemLabel: p => p.value || 'Opción'
                                    }),
                                }),
                                auto: fields.object({
                                    service: fields.relationship({
                                        label: 'Seleccionar Servicio',
                                        collection: 'services',
                                    }),
                                    overrideTitle: fields.text({ label: 'Sobrescribir Título (Opcional)' }),
                                    overridePrice: fields.text({ label: 'Mostrar Precio (Opcional)' }),
                                    isPopular: fields.checkbox({ label: '¿Destacar?', defaultValue: false }),
                                }),
                            }
                        ),
                        {
                            label: 'Servicios de la Grilla',
                            itemLabel: (props) => {
                                const mode = props?.discriminant;
                                if (mode === 'manual') {
                                    return props?.value?.fields?.title?.value || 'Servicio Manual';
                                }
                                if (mode === 'auto') {
                                    const serviceName = props?.value?.fields?.service?.value;
                                    return serviceName ? `🔗 ${serviceName}` : 'Servicio Auto';
                                }
                                return 'Configurar Servicio';
                            },
                        }
                    )
                })
            },
            services_list: {
                label: 'Lista de Servicios (Manual/OnePage)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    items: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Nombre Servicio' }),
                            description: fields.text({ label: 'Descripción', multiline: true }),
                            image: fields.image({
                                label: 'Imagen (Opcional)',
                                directory: 'public/images/services',
                                publicPath: '/images/services',
                            }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                        }),
                        { label: 'Servicios Manuales', itemLabel: p => p.fields.title.value || 'Servicio' }
                    )
                })
            },
            about: {
                label: 'Sección Sobre Nosotros',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    titleHighlight: fields.text({ label: 'Título Destacado' }),
                    description: fields.text({ label: 'Biografía / Historia', multiline: true }),
                    yearsExperience: fields.text({ label: 'Años (Badge)' }),
                    projectsCompleted: fields.text({ label: 'Pisos/Proyectos Completados' }),
                    image: fields.image({
                        label: 'Imagen Principal',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                    features: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Título' }),
                            description: fields.text({ label: 'Detalle' }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                        }),
                        { label: 'Puntos Clave', itemLabel: p => p.fields.title.value || 'Punto' }
                    ),
                    buttonText: fields.text({ label: 'Texto del Botón' }),
                    buttonLink: fields.text({ label: 'Enlace del Botón' }),
                })
            },
            features: {
                label: 'Características Destacadas (Íconos)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    features: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Título' }),
                            description: fields.text({ label: 'Detalle' }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                        }),
                        { label: 'Ventajas', itemLabel: p => p.fields.title.value || 'Ventaja' }
                    ),
                })
            },
            testimonials: {
                label: 'Carrusel de Testimonios',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    testimonials: fields.array(
                        fields.object({
                            quote: fields.text({ label: 'Testimonio', multiline: true }),
                            author: fields.text({ label: 'Cliente' }),
                            initials: fields.text({ label: 'Iniciales (Ej: MP)' }),
                            location: fields.text({ label: 'Ubicación' }),
                            date: fields.text({ label: 'Fecha' }),
                            rating: fields.integer({ label: 'Estrellas (1-5)', defaultValue: 5 }),
                            service: fields.text({ label: 'Servicio Contratado' }),
                            size: fields.text({ label: 'Tamaño Piso' }),
                            verified: fields.checkbox({ label: 'Perfil Verificado', defaultValue: true }),
                        }),
                        { label: 'Opiniones', itemLabel: p => p.fields.author.value || 'Testimonio' }
                    ),
                })
            },
            process: {
                label: 'Proceso de Trabajo / Metodología',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    steps: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Título' }),
                            description: fields.text({ label: 'Detalle', multiline: true }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                            duration: fields.text({ label: 'Duración (Opcional)' }),
                        }),
                        { label: 'Pasos', itemLabel: p => p.fields.title.value || 'Paso' }
                    ),
                    note: fields.text({ label: 'Nota Informativa', multiline: true }),
                })
            },
            faq: {
                label: 'Preguntas Frecuentes (FAQ)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    questions: fields.array(
                        fields.object({
                            question: fields.text({ label: 'Pregunta' }),
                            answer: fields.text({ label: 'Respuesta', multiline: true }),
                            category: fields.text({ label: 'Categoría (Opcional)' }),
                        }),
                        { label: 'Preguntas', itemLabel: p => p.fields.question.value || 'Faq' }
                    ),
                })
            },
            locations: {
                label: 'Mapas / Zonas',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Descripción' }),
                })
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA)',
                schema: fields.object({
                    _note: fields.text({ label: 'ℹ️ Edita el CTA arriba en “🎯 Llamada a la Acción CTA”', defaultValue: '' }),
                })
            },
            contact: {
                label: 'Sección de Contacto (SEO)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    description: fields.text({ label: 'Descripción / Zonas', multiline: true }),
                    phone: fields.text({ label: 'Teléfono' }),
                    whatsapp: fields.text({ label: 'WhatsApp' }),
                    email: fields.text({ label: 'Email' }),
                    schedule: fields.text({ label: 'Horarios', multiline: true }),
                    responseTime: fields.text({ label: 'Tiempo de Respuesta' }),
                })
            },
            content: {
                label: 'Bloque de Texto SEO / Contenido Estructurado',
                schema: fields.object({
                    title: fields.text({ label: 'Título del Bloque' }),
                    sections: fields.array(
                        fields.object({
                            heading: fields.text({ label: 'Encabezado' }),
                            content: fields.text({
                                label: 'Contenido (Markdown)',
                                multiline: true,
                            }),
                        }),
                        { label: 'Secciones de Contenido', itemLabel: (p) => p.fields.heading.value || 'Sección' }
                    ),
                })
            },
            service_areas: {
                label: 'Zonas de Servicio',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    areas: fields.object({
                        barcelona: fields.object({
                            title: fields.text({ label: 'Título Principal' }),
                            description: fields.text({ label: 'Descripción', multiline: true }),
                            districts: fields.array(
                                fields.object({
                                    name: fields.text({ label: 'Barrio/Distrito' }),
                                    description: fields.text({ label: 'Detalle (Opcional)', multiline: true }),
                                    icon: IconPicker({ label: 'Icono (Lucide)' }),
                                    popular: fields.checkbox({ label: '¿Es zona destacada?', defaultValue: false }),
                                }),
                                { label: 'Barrios', itemLabel: p => p.fields.name.value || 'Distrito' }
                            ),
                        }),
                        metropolitan: fields.object({
                            title: fields.text({ label: 'Título Principal' }),
                            description: fields.text({ label: 'Descripción', multiline: true }),
                            note: fields.text({ label: 'Nota / Suplementos (Opcional)' }),
                            cities: fields.array(
                                fields.object({
                                    name: fields.text({ label: 'Municipio' }),
                                    supplement: fields.text({ label: 'Extra (Ej: +30€)' }),
                                    icon: IconPicker({ label: 'Icono (Lucide)' }),
                                }),
                                { label: 'Municipios', itemLabel: p => p.fields.name.value || 'Ciudad' }
                            ),
                        }),
                    }),
                })
            },
            pricing: {
                label: '💰 Tabla de Precios (Planes)',
                schema: fields.object({
                    _note: fields.text({ label: 'ℹ️ Edita los planes arriba en “💰 Tabla de Precios”', defaultValue: '' }),
                })
            },
            stats: {
                label: '📊 Contador de Estadísticas',
                schema: fields.object({
                    _note: fields.text({ label: 'ℹ️ Edita los contadores arriba en “📊 Estadísticas / Contadores”', defaultValue: '' }),
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
        content: fields.mdx({
            label: 'Contenido Adicional (Opcional)',
            components: mdxComponentsConfig
        }),

        // Campos adicionales para SEO y UI
        seoContentTitle: fields.text({ label: 'Título del Bloque Seo (Opcional)' }),
        stickyPhone: fields.checkbox({ label: 'Mostrar Teléfono Sticky', defaultValue: true }),
        whatsappFloat: fields.checkbox({ label: 'Mostrar WhatsApp Flotante', defaultValue: true }),
    }
});
