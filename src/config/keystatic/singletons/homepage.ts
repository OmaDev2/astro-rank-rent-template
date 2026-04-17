import { singleton, fields } from '@keystatic/core';
import { IconPicker } from '../../../components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { statsPreview } from '../../../components/keystatic/StatsPreview';
import { ctaPreview } from '../../../components/keystatic/CtaPreview';
import { featuresPreview } from '../../../components/keystatic/FeaturesPreview';
import { testimonialsPreview } from '../../../components/keystatic/TestimonialsPreview';
import { processPreview } from '../../../components/keystatic/ProcessPreview';
import { aboutPreview } from '../../../components/keystatic/AboutPreview';
import { pricingPreview } from '../../../components/keystatic/PricingPreview';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';

export const homepage = singleton({
    label: '🏠 Página de Inicio',
    path: 'src/content/pages/home',
    previewUrl: '/',
    format: { contentField: 'content' },
    entryLayout: 'form',
    schema: {
        // --- 🎯 SEO y METADATOS DE LA PÁGINA ---
        seoControls: SeoPreview({
            label: 'Configuración SEO Visual',
        }),
        canonicalUrl: fields.text({
            label: 'URL Canonica (Opcional)',
            description: 'URL preferida para evitar contenido duplicado.',
        }),

        // --- CONSTRUCTOR DE BLOQUES (UNIFICADO Y COLAPSABLE) ---
        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero — Cabecera Principal',
                schema: fields.object({
                    content: heroPreview(),
                    backgroundImage: fields.image({
                        label: 'Imagen de Fondo del Hero',
                        directory: 'public/images/home',
                        publicPath: '/images/home',
                    }),
                    ctaPrimaryLink: fields.text({
                        label: '🔗 Enlace Botón Principal',
                        defaultValue: '#presupuesto',
                    }),
                    ctaSecondaryLink: fields.text({
                        label: '🔗 Enlace Botón Secundario (WhatsApp)',
                        defaultValue: '',
                    }),
                })
            },
            services_grid: {
                label: 'Grilla de Servicios (Links)',
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
                                    link: fields.text({ label: 'Enlace a Página' }),
                                    isPopular: fields.checkbox({ label: '¿Destacar?', defaultValue: false }),
                                    image: fields.image({
                                        label: 'Imagen Card',
                                        directory: 'public/images/services',
                                        publicPath: '/images/services',
                                    }),
                                    features: fields.array(fields.text({ label: 'Característica' }), {
                                        label: 'Características',
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
                            itemLabel: (props) => props?.discriminant === 'manual' ? props?.value?.fields?.title?.value : props?.value?.fields?.service?.value || 'Servicio',
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
                label: '🏢 Sobre Nosotros (Historia)',
                schema: fields.object({
                    content: aboutPreview(),
                })
            },
            features: {
                label: '💎 Por Qué Elegirnos (Ventajas)',
                schema: fields.object({
                    content: featuresPreview(),
                })
            },
            testimonials: {
                label: '⭐ Opiniones de Clientes (Testimonios)',
                schema: fields.object({
                    content: testimonialsPreview(),
                })
            },
            process: {
                label: '👷 Método Paso a Paso (Proceso)',
                schema: fields.object({
                    content: processPreview(),
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
                    content: ctaPreview(),
                })
            },
            contact: {
                label: 'Sección de Contacto (SEO)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    description: fields.text({ label: 'Descripción / Zonas', multiline: true }),
                    phone: fields.text({ 
                        label: 'Teléfono',
                        description: 'Si se deja vacío (o con XXX), se usará el teléfono global de Mi Negocio.' 
                    }),
                    whatsapp: fields.text({ 
                        label: 'WhatsApp',
                        description: 'Si se deja vacío (o con XXX), se usará el WhatsApp global de Mi Negocio.' 
                    }),
                    email: fields.text({ 
                        label: 'Email',
                        description: 'Si se deja vacío, se usará el email global de Mi Negocio.' 
                    }),
                    schedule: fields.text({ 
                        label: 'Horarios', 
                        multiline: true,
                        description: 'Si se deja vacío, se usará el horario global de Mi Negocio.' 
                    }),
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
                label: 'Zonas de Servicio (Dual)',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección (Ej: Dónde trabajamos)' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    group1: fields.object({
                        title: fields.text({ label: 'Título del Grupo 1 (Ej: Málaga Capital)' }),
                        description: fields.text({ label: 'Descripción', multiline: true }),
                        items: fields.array(
                            fields.object({
                                name: fields.text({ label: 'Nombre' }),
                                description: fields.text({ label: 'Detalle (Opcional)', multiline: true }),
                                icon: IconPicker({ label: 'Icono (Lucide)' }),
                                popular: fields.checkbox({ label: '¿Destacar?', defaultValue: false }),
                            }),
                            { label: 'Elementos Grupo 1', itemLabel: p => p.fields.name.value || 'Zona' }
                        ),
                    }),
                    group2: fields.object({
                        title: fields.text({ label: 'Título del Grupo 2 (Ej: Costa del Sol)' }),
                        description: fields.text({ label: 'Descripción', multiline: true }),
                        note: fields.text({ label: 'Nota / Suplementos (Opcional)' }),
                        items: fields.array(
                            fields.object({
                                name: fields.text({ label: 'Nombre' }),
                                supplement: fields.text({ label: 'Extra (Ej: +30€)' }),
                                icon: IconPicker({ label: 'Icono (Lucide)' }),
                            }),
                            { label: 'Elementos Grupo 2', itemLabel: p => p.fields.name.value || 'Zona' }
                        ),
                    }),
                })
            },
            pricing: {
                label: '💰 Tabla de Precios (Planes)',
                schema: fields.object({
                    content: pricingPreview(),
                })
            },
            stats: {
                label: '📊 Contador de Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
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
