import { singleton, fields } from '@keystatic/core';

// import.meta.glob se resuelve en tiempo de build por Vite — no usa Node fs
const _servicePaths = Object.keys(
    import.meta.glob('/src/content/services/*.mdx')
);

const serviceCheckboxFields = Object.fromEntries(
    _servicePaths
        .map(p => p.split('/').pop()!.replace('.mdx', ''))
        .sort()
        .map((slug, idx) => [
            slug,
            fields.object({
                enabled:       fields.checkbox({ label: slug.replace(/-/g, ' '), defaultValue: false }),
                isPopular:     fields.checkbox({ label: '⭐ Destacar (Badge)', defaultValue: false }),
                order:         fields.integer({ label: 'Posición (1 = primero)', defaultValue: idx + 1 }),
                overrideTitle: fields.text({ label: 'Título alternativo (Opcional)', description: 'Reemplaza el título del servicio solo en esta card.' }),
                anchorText:    fields.text({ label: 'Texto del enlace CTA (Opcional)', description: 'Ej: "Ver precios", "Solicitar instalación". Por defecto: "Ver [título]".' }),
            }),
        ])
);
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
            description: 'Si lo dejas vacío, el título se genera automáticamente como "[Servicio] en [Ciudad] | [Negocio]" y la descripción también. Rellénalo solo si quieres personalizar lo que ve Google.',
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
                    backgroundImageAlt: fields.text({ label: 'Texto Alt de Fondo Hero (Opcional)', description: 'Deja vacío si es meramente decorativo.' }),
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
                    variant: fields.select({
                        label: 'Variante Visual',
                        options: [
                            { label: '▦ Cards con imagen (grid)', value: 'grid' },
                            { label: '☰ Lista compacta (list)', value: 'list' },
                            { label: '⭐ Primera card grande (featured)', value: 'featured' },
                            { label: '🔗 Links SEO compactos (compact_links)', value: 'compact_links' },
                        ],
                        defaultValue: 'grid',
                    }),
                    title: fields.text({ label: 'Título Sección (Parte Blanca)' }),
                    titleHighlight: fields.text({ label: 'Título Destacado (Parte Color)' }),
                    subtitle: fields.text({ label: 'Resumen', multiline: true }),
                    services: fields.object(serviceCheckboxFields)
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
            faq: {
                label: 'Preguntas Frecuentes (FAQ)',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
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
            home_intro: {
                label: '📝 Intro SEO (Texto Introductorio)',
                schema: fields.object({
                    heading: fields.text({
                        label: 'Encabezado H2',
                        description: 'Título introductorio visible bajo el hero. No debe repetir el H1.',
                        defaultValue: 'Carpintería metálica en Málaga a medida',
                    }),
                    paragraph: fields.text({
                        label: 'Párrafo Introductorio',
                        multiline: true,
                        description: 'Texto descriptivo breve que presenta la empresa o el servicio.',
                    }),
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
                                directory: 'public/images/home',
                                publicPath: '/images/home',
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
                                directory: 'public/images',
                                publicPath: '/images',
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
            problem_solution: {
                label: '⚡ Problema / Solución',
                schema: fields.object({
                    eyebrow: fields.text({ label: 'Eyebrow (Opcional)', description: 'Texto pequeño sobre el título' }),
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
                        directory: 'public/images',
                        publicPath: '/images',
                    }),
                    imageAlt: fields.text({ label: 'Texto Alt Imagen (Opcional)' }),
                    ctaText: fields.text({ label: 'Texto del Botón CTA (Opcional)' }),
                    ctaLink: fields.text({ label: 'Enlace CTA', defaultValue: '/contacto/' }),
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
