import { singleton, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { featuresPreview } from '../../../components/keystatic/FeaturesPreview';
import { statsPreview } from '../../../components/keystatic/StatsPreview';
import { ctaPreview } from '../../../components/keystatic/CtaPreview';
import { processPreview } from '../../../components/keystatic/ProcessPreview';
import { noticeField } from '../../../components/keystatic/NoticeField';
import { IconPicker } from '../../../components/keystatic/IconPicker';

export const serviciosPage = singleton({
    label: '🛠️ Página de Servicios (Listado)',
    path: 'src/content/pages/servicios',
    format: { contentField: 'content' },
    schema: {
        seoControls: SeoPreview({
            label: 'SEO Google Preview',
            description: 'Título y descripción para buscadores.',
        }),

        _notice: noticeField({
            message: 'Los bloques se renderizan antes del listado automático de servicios. Si no hay bloques, se muestra un hero genérico.',
            tone: 'info',
        }),

        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero (Portada)',
                schema: fields.object({
                    content: heroPreview(),
                }),
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
                }),
            },
            features: {
                label: '⭐ Ventajas / Características',
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
                }),
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
                }),
            },
            stats: {
                label: '📊 Números / Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
                }),
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
                        options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }],
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
                        directory: 'public/images/pages/servicios',
                        publicPath: '/images/pages/servicios',
                    }),
                    imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                }),
            },
            comparison: {
                label: '⚖️ Comparativa',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }],
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
                    leftTitle: fields.text({ label: 'Título Opción A', validation: { isRequired: true } }),
                    rightTitle: fields.text({ label: 'Título Opción B (destacada)', validation: { isRequired: true } }),
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
                }),
            },
            materials: {
                label: '🧱 Materiales y Acabados',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }],
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
                                directory: 'public/images/pages/servicios',
                                publicPath: '/images/pages/servicios',
                            }),
                            imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                        }),
                        { label: 'Materiales / Acabados', itemLabel: p => p.fields.title.value || 'Material' }
                    ),
                    note: fields.text({ label: 'Nota al pie (Opcional)', multiline: true }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                }),
            },
            price_factors: {
                label: '💰 Factores de Precio',
                schema: fields.object({
                    title: fields.text({ label: 'Título', validation: { isRequired: true } }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }],
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
                }),
            },
            gallery: {
                label: '🖼️ Galería de Imágenes',
                schema: fields.object({
                    title: fields.text({ label: 'Título (Opcional)' }),
                    subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
                    titleTag: fields.select({
                        label: 'Nivel de Encabezado',
                        options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }],
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
                                directory: 'public/images/pages/servicios',
                                publicPath: '/images/pages/servicios',
                            }),
                            alt: fields.text({ label: 'Texto Alt (obligatorio)', validation: { isRequired: true } }),
                            caption: fields.text({ label: 'Pie de foto (Opcional)' }),
                        }),
                        { label: 'Imágenes', itemLabel: p => p.fields.alt.value || 'Imagen' }
                    ),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
                }),
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
                            itemLabel: p => p.fields.question.value || 'Pregunta',
                        }
                    ),
                }),
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA Final)',
                schema: fields.object({
                    content: ctaPreview(),
                }),
            },
        }, {
            label: 'Bloques de la Página',
            description: 'Se renderizan antes del listado automático de servicios.',
        }),

        content: fields.mdx({
            label: 'Contenido Adicional (MDX)',
            options: {
                image: {
                    directory: 'public/images/pages/servicios',
                    publicPath: '/images/pages/servicios',
                },
            },
        }),
    },
});
