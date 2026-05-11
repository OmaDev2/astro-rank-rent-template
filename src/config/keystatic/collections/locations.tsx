import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { IconPicker } from '../../../components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { statsPreview } from '../../../components/keystatic/StatsPreview';
import { ctaPreview } from '../../../components/keystatic/CtaPreview';
import { featuresPreview } from '../../../components/keystatic/FeaturesPreview';
import { testimonialsPreview } from '../../../components/keystatic/TestimonialsPreview';
import { processPreview } from '../../../components/keystatic/ProcessPreview';
import { noticeField } from '../../../components/keystatic/NoticeField';
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
            hero: {
                label: '🖼️ Hero (Portada)',
                schema: fields.object({
                    content: heroPreview(),
                    backgroundImage: fields.text({
                        label: 'URL Imagen de Fondo',
                        description: 'URL completa (https://...) o ruta local (/images/...)',
                    }),
                    ctaPrimaryLink: fields.text({
                        label: 'Enlace Botón Principal',
                        description: 'Ej: /contacto/',
                    }),
                    ctaSecondaryLink: fields.text({
                        label: 'Enlace Botón Secundario',
                        description: 'Ej: /proyectos/',
                    }),
                })
            },
            features: {
                label: '💎 Características (Por qué elegirnos)',
                schema: fields.object({
                    content: featuresPreview(),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '▦ Cuadrícula con icono (grid)', value: 'grid' },
                            { label: '◧ Título izquierda / Items derecha (split)', value: 'split' },
                            { label: '☰ Lista horizontal (horizontal)', value: 'horizontal' },
                            { label: '⊙ Solo iconos y título (icons_only)', value: 'icons_only' },
                        ],
                        defaultValue: 'grid',
                    }),
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
                    showSidebar: fields.checkbox({ label: 'Mostrar Sidebar de Contacto', defaultValue: true }),
                    showServices: fields.checkbox({ label: 'Mostrar Grid de Servicios Relacionados', defaultValue: true }),
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
                                directory: 'public/images/locations',
                                publicPath: '/images/locations',
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
                        directory: 'public/images/locations',
                        publicPath: '/images/locations',
                    }),
                    imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
            },
            comparison: {
                label: '⚖️ Comparativa (Tabla / Columnas)',
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
                            { label: '☰ Filas en tarjetas (cards)', value: 'cards' },
                            { label: '◧ Dos columnas grandes (split)', value: 'split' },
                        ],
                        defaultValue: 'table',
                    }),
                    leftTitle: fields.text({ label: 'Título columna izquierda', validation: { isRequired: true } }),
                    rightTitle: fields.text({ label: 'Título columna derecha (recomendada)', validation: { isRequired: true } }),
                    rows: fields.array(
                        fields.object({
                            label: fields.text({ label: 'Aspecto / Criterio' }),
                            left: fields.text({ label: 'Valor columna izquierda', multiline: true }),
                            right: fields.text({ label: 'Valor columna derecha', multiline: true }),
                        }),
                        { label: 'Filas de Comparativa', itemLabel: p => p.fields.label.value || 'Fila' }
                    ),
                    conclusion: fields.text({ label: 'Conclusión (Opcional)', multiline: true }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                })
            },
            faq: {
                label: '❓ Preguntas Frecuentes (FAQ)',
                schema: fields.object({
                    title: fields.text({
                        label: 'Título de la Sección (Opcional)',
                        description: 'Deja vacío para usar el título por defecto. Las preguntas se toman del campo FAQ del frontmatter.',
                    }),
                })
            }
        }, {
            label: 'Bloques Manuales (Opcional)',
            description: 'Opcional. Si este listado tiene bloques, se ignorará el preset seleccionado.'
        }),

        content: fields.mdx({
            label: 'Contenido (Texto SEO)',
            description: 'Contenido principal que se mostrará cuando agregues el bloque "Contenido Principal + Sidebar"',
            components: mdxComponentsConfig
        }),
    },
});
