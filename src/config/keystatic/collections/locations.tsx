import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { statsPreview } from '../../../components/keystatic/StatsPreview';
import { ctaPreview } from '../../../components/keystatic/CtaPreview';
import { featuresPreview } from '../../../components/keystatic/FeaturesPreview';
import { testimonialsPreview } from '../../../components/keystatic/TestimonialsPreview';
import { processPreview } from '../../../components/keystatic/ProcessPreview';
import { aboutPreview } from '../../../components/keystatic/AboutPreview';
import { pricingPreview } from '../../../components/keystatic/PricingPreview';

export const locations = collection({
    label: '📍 Zonas de Servicio',
    slugField: 'name',
    path: 'src/content/locations/*',
    previewUrl: '/zona/{slug}',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
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
        seo: SeoPreview({
            label: 'SEO Google Preview',
            description: 'Ajusta tu título y descripción SEO con previsualización en vivo.',
        }),

        heroImage: fields.image({
            label: 'Imagen Hero de la Zona',
            description: 'Imagen representativa de la zona. Recomendado: 1920x1080px',
            directory: 'public/images/locations',
            publicPath: '/images/locations',
            validation: { isRequired: false }
        }),
        heroImageAlt: fields.text({
            label: 'Texto Alt de Imagen Hero (Opcional)',
            description: 'Deja vacío para generar un Alt automático ideal para el SEO local.',
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

        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero (Portada)',
                schema: fields.object({
                    content: heroPreview(),
                })
            },
            features: {
                label: '💎 Características (Por qué elegirnos)',
                schema: fields.object({
                    content: featuresPreview(),
                })
            },
            map: {
                label: '📍 Mapa de Ubicación',
                schema: fields.empty()
            },
            content: {
                label: '📝 Contenido Principal + Sidebar',
                schema: fields.object({
                    urgencyBoxStyle: fields.select({
                        label: 'Estilo de Caja de Urgencia',
                        options: [
                            { label: 'Ninguno', value: 'none' },
                            { label: 'Éxito (Verde)', value: 'success' },
                            { label: 'Urgente (Rojo)', value: 'urgent' },
                            { label: 'Tema Principal', value: 'primary' },
                            { label: 'Tema Acento', value: 'accent' },
                        ],
                        defaultValue: 'none',
                    }),
                })
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA Final)',
                schema: fields.object({
                    content: ctaPreview(),
                })
            },
            pricing: {
                label: '💰 Tabla de Precios',
                schema: fields.object({
                    content: pricingPreview(),
                })
            },
            stats: {
                label: '📊 Números / Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
                })
            },
            logos: {
                label: '🤝 Logos de Confianza / Partners',
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
            location_services: {
                label: '🔗 Servicios en esta Zona (Interlinking)',
                schema: fields.object({
                    title: fields.text({
                        label: 'Título (Opcional)',
                        description: 'Deja vacío para generar automáticamente: "Nuestros Servicios en [Zona]"',
                    }),
                    subtitle: fields.text({
                        label: 'Subtítulo (Opcional)',
                        multiline: true,
                    }),
                })
            },
            before_after: {
                label: '🔄 Antes y Después (Comparativa)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    beforeImage: fields.image({
                        label: 'Imagen Antes',
                        directory: 'public/images/comparativas',
                        publicPath: '/images/comparativas',
                    }),
                    beforeAlt: fields.text({ label: 'Texto Alt Antes (Opcional)' }),
                    afterImage: fields.image({
                        label: 'Imagen Después',
                        directory: 'public/images/comparativas',
                        publicPath: '/images/comparativas',
                    }),
                    afterAlt: fields.text({ label: 'Texto Alt Después (Opcional)' }),
                    beforeLabel: fields.text({ label: 'Etiqueta Antes', defaultValue: 'Antes' }),
                    afterLabel: fields.text({ label: 'Etiqueta Después', defaultValue: 'Después' }),
                })
            }
        }, {
            label: 'Constructor de Página (Orden de Secciones)',
            description: 'Define qué secciones mostrar y en qué orden aparecerán en la página'
        }),

        content: fields.mdx({
            label: 'Contenido (Texto SEO)',
            description: 'Contenido principal que se mostrará cuando agregues el bloque "Contenido Principal + Sidebar"',
            components: mdxComponentsConfig
        }),
    },
});
