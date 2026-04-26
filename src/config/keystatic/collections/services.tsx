import { collection, fields } from '@keystatic/core';
import { citySlug } from '@/config/citySlug';
import { SeoPreview } from '@/components/keystatic/SeoPreview';
import { IconPicker } from '@/components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '@/components/keystatic/HeroPreview';
import { featuresPreview } from '@/components/keystatic/FeaturesPreview';
import { statsPreview } from '@/components/keystatic/StatsPreview';
import { ctaPreview } from '@/components/keystatic/CtaPreview';
import { pricingPreview } from '@/components/keystatic/PricingPreview';
import { processPreview } from '@/components/keystatic/ProcessPreview';

export const services = collection({
    label: '🛠️ Servicios',
    slugField: 'title',
    path: 'src/content/services/*',
    previewUrl: '/servicios/{slug}',
    format: { contentField: 'content' },
    entryLayout: 'content',
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
        }),
        icon: IconPicker({ label: 'Icono Principal (Lucide)' }),
        shortDesc: fields.text({ label: 'Descripción Corta (Cards)', multiline: true }),
        featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

        // CONSTRUCTOR DE BLOQUES MEJORADO
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
                label: '💎 Características (Beneficios)',
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
            process: {
                label: '👷 Método de Trabajo (Proceso)',
                schema: fields.object({
                    content: processPreview(),
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '↔ Línea de tiempo alternada (timeline)', value: 'timeline' },
                            { label: '▦ Tarjetas numeradas (cards)', value: 'cards' },
                            { label: '☰ Lista compacta (compact)', value: 'compact' },
                            { label: '◧ Título izquierda / Pasos derecha (split)', value: 'split' },
                        ],
                        defaultValue: 'timeline',
                    }),
                })
            },
            stats: {
                label: '📊 Números / Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
                })
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA)',
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
            label: 'Constructor Visual de Página',
            description: 'Añade y ordena los bloques que compondrán la página de este servicio.'
        }),

        content: fields.mdx({
            label: 'Cuerpo del Texto (MDX)',
            description: 'Utilizado por el bloque "Contenido y MDX"',
            options: {
                image: {
                    directory: 'public/images/services',
                    publicPath: '/images/services',
                }
            },
            components: mdxComponentsConfig
        }),
    },
});
