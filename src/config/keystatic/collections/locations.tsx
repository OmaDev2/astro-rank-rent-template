import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { IconPicker } from '../../../components/keystatic/IconPicker';
import { noticeField } from '../../../components/keystatic/NoticeField';
import {
    heroBlock,
    featuresBlock,
    statsBlock,
    processBlock,
    aboutBlock,
    testimonialsBlock,
    ctaBlock,
    pricingBlock,
} from '../nativeBlocks';

export const locations = collection({
    label: '📍 Zonas de Servicio',
    slugField: 'name',
    path: 'src/content/locations/*',
    previewUrl: '/zona/{slug}',
    format: { contentField: 'empty' },
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
            description: 'Si lo dejas vacío, se genera automáticamente desde el nombre de la zona y el negocio. Rellénalo solo si quieres personalizar lo que ve Google.',
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

        pagePreset: fields.select({
            label: '⚡ Preset de Página',
            description: 'Estructura automática para páginas rápidas. Si añades bloques manualmente abajo, el preset se ignora.',
            options: [
                { label: '— Sin preset (bloques manuales o default) —', value: '' },
                { label: '✅ Estándar — Hero + Contenido + Servicios + Mapa + CTA', value: 'standard_location' },
                { label: '🔍 SEO — Hero + Contenido + Áreas + Servicios + FAQ + Mapa + CTA', value: 'seo_location' },
                { label: '⭐ Confianza — Hero + Trust Strip + Testimonios + Servicios + FAQ + Mapa + CTA', value: 'trust_location' },
                { label: '⚡ Compacto — Hero + Servicios + Mapa + CTA', value: 'compact_location' },
            ],
            defaultValue: '',
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

        _notice: noticeField({
            message: 'Los bloques manuales tienen prioridad sobre el preset. Si añades al menos un bloque, el preset se ignora completamente.',
            tone: 'warning',
        }),

        blocks: fields.blocks({
            // ── nativeBlocks ──────────────────────────────────────────────────
            hero: heroBlock('public/images/locations'),
            features: featuresBlock(),
            stats: statsBlock(),
            process: processBlock(),
            about: aboutBlock('public/images/locations'),
            testimonials: testimonialsBlock(),
            cta: ctaBlock(),
            pricing: pricingBlock(),

            // ── Bloques específicos de zonas (inline) ─────────────────────────
            map: {
                label: '📍 Mapa de Ubicación',
                schema: fields.empty()
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
            faq: {
                label: '❓ Preguntas Frecuentes',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección FAQ' }),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '▼ Acordeón (accordion)', value: 'accordion' },
                            { label: '▦ Dos columnas (two_columns)', value: 'two_columns' },
                            { label: '☰ Compacto (compact)', value: 'compact' },
                            { label: '⊞ Agrupado por categoría (grouped)', value: 'grouped' },
                        ],
                        defaultValue: 'accordion',
                    }),
                    faqs: fields.array(
                        fields.object({
                            question: fields.text({ label: 'Pregunta' }),
                            answer: fields.text({ label: 'Respuesta', multiline: true }),
                        }),
                        {
                            label: 'Preguntas',
                            itemLabel: (props) => props.fields.question.value || 'Pregunta',
                        }
                    )
                })
            },
            trust_strip: {
                label: '✅ Franja de Confianza (Trust Strip)',
                schema: fields.object({
                    title: fields.text({ label: 'Título (Opcional)' }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                        ],
                        defaultValue: 'h2',
                    }),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '━ Barra horizontal compacta (bar)', value: 'bar' },
                            { label: '▦ Tarjetas con icono (cards)', value: 'cards' },
                            { label: '✓ Lista mínima (minimal)', value: 'minimal' },
                        ],
                        defaultValue: 'cards',
                    }),
                    items: fields.array(
                        fields.object({
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                            label: fields.text({ label: 'Texto Principal' }),
                            description: fields.text({ label: 'Descripción (Opcional)', multiline: true }),
                        }),
                        { label: 'Puntos de Confianza', itemLabel: p => p.fields.label.value || 'Punto' }
                    ),
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
                    ),
                })
            },
            before_after: {
                label: '🔄 Antes y Después',
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
            },
            gallery: {
                label: '🖼️ Galería de Imágenes',
                schema: fields.object({
                    title: fields.text({ label: 'Título (Opcional)' }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                        ],
                        defaultValue: 'h2',
                    }),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '▦ Cuadrícula uniforme (grid)', value: 'grid' },
                            { label: '⊞ Alturas naturales (masonry)', value: 'masonry' },
                            { label: '◧ Primera imagen grande (featured)', value: 'featured' },
                        ],
                        defaultValue: 'grid',
                    }),
                    images: fields.array(
                        fields.object({
                            src: fields.image({
                                label: 'Imagen',
                                directory: 'public/images/locations',
                                publicPath: '/images/locations',
                            }),
                            alt: fields.text({ label: 'Texto Alt (obligatorio)', validation: { isRequired: true } }),
                            caption: fields.text({ label: 'Pie de foto (Opcional)' }),
                        }),
                        { label: 'Imágenes', itemLabel: p => p.fields.alt.value || 'Imagen' }
                    ),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
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
                    showSidebar: fields.checkbox({ label: 'Mostrar Sidebar de Contacto', defaultValue: true }),
                    showServices: fields.checkbox({ label: 'Mostrar Grid de Servicios Relacionados', defaultValue: true }),
                })
            },
        }, {
            label: 'Bloques Manuales (Opcional)',
            description: 'Opcional. Si este listado tiene bloques, se ignorará el preset seleccionado.'
        }),

        empty: fields.emptyContent({ extension: 'mdx' }),

    },
});
