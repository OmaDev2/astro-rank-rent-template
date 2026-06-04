import { collection, fields } from '@keystatic/core';
import { citySlug } from '@/config/citySlug';
import { SeoPreview } from '@/components/keystatic/SeoPreview';
import { IconPicker } from '@/components/keystatic/IconPicker';
import { noticeField } from '@/components/keystatic/NoticeField';
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

export const services = collection({
    label: '🛠️ Servicios',
    slugField: 'title',
    path: 'src/content/services/*',
    previewUrl: '/servicios/{slug}',
    format: { contentField: 'empty' },
    schema: {
        title: fields.slug({
            name: {
                label: 'Título Interno / Identificador',
                validation: { length: { min: 1 } }
            },
            slug: {
                label: 'URL / Slug',
                description: `Se genera automático con la ciudad al final (ej: cerramientos-de-aluminio-${citySlug}).`,
                generate: (name) => {
                    const base = name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                    return base.endsWith(`-${citySlug}`) ? base : `${base}-${citySlug}`;
                },
            }
        }),
        heroImage: fields.image({
            label: 'Imagen Principal (Cards)',
            directory: 'public/images/services',
            publicPath: '/images/services',
        }),
        heroImageAlt: fields.text({
            label: 'Texto Alt Imagen Hero (Opcional)',
            description: 'Deja vacío para SEO automático.',
        }),

        // Metadatos globales (no cambian de posición)
        seo: SeoPreview({
            label: 'SEO Google Preview',
            description: 'Si lo dejas vacío, se genera automáticamente desde el título del servicio y la ciudad. Rellénalo solo si quieres personalizar lo que ve Google.',
        }),
        icon: IconPicker({ label: 'Icono Principal (Lucide)' }),
        shortDesc: fields.text({ label: 'Descripción Corta (Cards)', multiline: true }),
        featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

        pagePreset: fields.select({
            label: '⚡ Preset de Página',
            description: 'Estructura automática para páginas rápidas. Si añades bloques manualmente abajo, el preset se ignora.',
            options: [
                { label: '— Sin preset (bloques manuales o default) —', value: '' },
                { label: '✅ Estándar — Hero + Problema/Solución + Precios + FAQ + CTA', value: 'standard_service' },
                { label: '🖼️ Visual — Hero + Galería + Materiales + Antes/Después + Testimonios + CTA', value: 'visual_service' },
                { label: '🔧 Técnico — Hero + Materiales + Comparativa + Proceso + Precios + FAQ + CTA', value: 'technical_service' },
                { label: '💶 Precios — Hero + Confianza + Factores de precio + Comparativa + Testimonios + CTA', value: 'price_focused_service' },
            ],
            defaultValue: '',
        }),

        _notice: noticeField({
            message: 'Los bloques manuales tienen prioridad sobre el preset. Si añades al menos un bloque, el preset se ignora completamente.',
            tone: 'warning',
        }),

        // CONSTRUCTOR DE BLOQUES MEJORADO
        blocks: fields.blocks({
            hero: heroBlock('public/images/services'),
            features: featuresBlock(),
            process: processBlock(),
            stats: statsBlock(),
            about: aboutBlock('public/images/services'),
            testimonials: testimonialsBlock(),
            cta: ctaBlock(),
            pricing: pricingBlock(),
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
                        directory: 'public/images/services',
                        publicPath: '/images/services',
                    }),
                    beforeAlt: fields.text({ label: 'Texto Alt Antes (Opcional)' }),
                    afterImage: fields.image({
                        label: 'Imagen Después',
                        directory: 'public/images/services',
                        publicPath: '/images/services',
                    }),
                    afterAlt: fields.text({ label: 'Texto Alt Después (Opcional)' }),
                    beforeLabel: fields.text({ label: 'Etiqueta Antes', defaultValue: 'Antes' }),
                    afterLabel: fields.text({ label: 'Etiqueta Después', defaultValue: 'Después' }),
                })
            },
            content: {
                label: '📝 Bloque de Texto y MDX',
                schema: fields.object({
                    title: fields.text({ label: 'Título del bloque de texto' }),
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
            service_locations: {
                label: '🗺️ Zonas donde ofrecemos este servicio (Interlinking)',
                schema: fields.object({
                    title: fields.text({
                        label: 'Título (Opcional)',
                        description: 'Deja vacío para generar automáticamente: "[Servicio] en todas nuestras zonas"',
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
            materials: {
                label: '🧱 Materiales y Acabados',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
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
                            { label: '▦ Tarjetas en cuadrícula (grid)', value: 'grid' },
                            { label: '☰ Lista compacta (list)', value: 'list' },
                            { label: '◧ Título izquierda / Items derecha (split)', value: 'split' },
                        ],
                        defaultValue: 'grid',
                    }),
                    items: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Nombre del Material / Acabado' }),
                            description: fields.text({ label: 'Descripción (Opcional)', multiline: true }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                            image: fields.image({
                                label: 'Imagen (Opcional)',
                                directory: 'public/images/services',
                                publicPath: '/images/services',
                            }),
                            imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                        }),
                        { label: 'Materiales / Acabados', itemLabel: p => p.fields.title.value || 'Material' }
                    ),
                    note: fields.text({ label: 'Nota al pie (Opcional)', multiline: true }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
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
                                directory: 'public/images/services',
                                publicPath: '/images/services',
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
            comparison: {
                label: '⚖️ Comparativa (vs)',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
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
                            { label: '▦ Tabla responsive (table)', value: 'table' },
                            { label: '☰ Fila a fila en cards (cards)', value: 'cards' },
                            { label: '◧ Dos columnas grandes (split)', value: 'split' },
                        ],
                        defaultValue: 'table',
                    }),
                    leftTitle: fields.text({ label: 'Título Opción A (izquierda)', validation: { isRequired: true } }),
                    rightTitle: fields.text({ label: 'Título Opción B (derecha, destacada)', validation: { isRequired: true } }),
                    rows: fields.array(
                        fields.object({
                            label: fields.text({ label: 'Aspecto a comparar' }),
                            left: fields.text({ label: 'Valor Opción A', multiline: true }),
                            right: fields.text({ label: 'Valor Opción B', multiline: true }),
                        }),
                        { label: 'Filas de Comparativa', itemLabel: p => p.fields.label.value || 'Fila' }
                    ),
                    conclusion: fields.text({ label: 'Conclusión (Opcional)', multiline: true }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
            },
            price_factors: {
                label: '💰 Factores de Precio',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
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
                            { label: '▦ Tarjetas con icono (cards)', value: 'cards' },
                            { label: '① Lista numerada (numbered)', value: 'numbered' },
                            { label: '≡ Cuadrícula densa (compact)', value: 'compact' },
                        ],
                        defaultValue: 'cards',
                    }),
                    intro: fields.text({ label: 'Introducción (Opcional)', multiline: true }),
                    factors: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Factor' }),
                            description: fields.text({ label: 'Descripción (Opcional)', multiline: true }),
                            icon: IconPicker({ label: 'Icono (Lucide)' }),
                        }),
                        { label: 'Factores de Precio', itemLabel: p => p.fields.title.value || 'Factor' }
                    ),
                    footerText: fields.text({ label: 'Texto al pie (Opcional)', multiline: true }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
            },
            problem_solution: {
                label: '⚡ Problema / Solución',
                schema: fields.object({
                    eyebrow: fields.text({ label: 'Eyebrow (Opcional)' }),
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '◧ Texto izquierda / Visual derecha (split)', value: 'split' },
                            { label: '▦ Dos tarjetas enfrentadas (cards)', value: 'cards' },
                            { label: '▣ Bloque compacto destacado (highlight)', value: 'highlight' },
                        ],
                        defaultValue: 'split',
                    }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                        ],
                        defaultValue: 'h2',
                    }),
                    problemTitle: fields.text({ label: 'Título columna Problema', defaultValue: 'El problema' }),
                    problemText: fields.text({ label: 'Texto del Problema', multiline: true }),
                    problems: fields.array(
                        fields.text({ label: 'Punto' }),
                        { label: 'Lista de Problemas', itemLabel: p => p.value || 'Problema' }
                    ),
                    solutionTitle: fields.text({ label: 'Título columna Solución', defaultValue: 'Nuestra solución' }),
                    solutionText: fields.text({ label: 'Texto de la Solución', multiline: true }),
                    solutions: fields.array(
                        fields.text({ label: 'Punto' }),
                        { label: 'Lista de Soluciones', itemLabel: p => p.value || 'Solución' }
                    ),
                    image: fields.image({
                        label: 'Imagen (Opcional, variante split)',
                        directory: 'public/images/services',
                        publicPath: '/images/services',
                    }),
                    imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
            }
        }, {
            label: 'Bloques Manuales (Opcional)',
            description: 'Opcional. Si este listado tiene bloques, se ignorará el preset seleccionado.'
        }),

        empty: fields.emptyContent({ extension: 'mdx' }),

    },
});
