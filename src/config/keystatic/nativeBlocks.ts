/**
 * Schemas nativos de Keystatic para los bloques del page builder.
 * Reemplaza el patrón antiguo de `content: previewComponent()` (JSON en string)
 * por campos YAML nativos que Keystatic lee y escribe directamente.
 */
import { fields } from '@keystatic/core';
import { IconPicker } from '../../components/keystatic/IconPicker';

const titleTagField = fields.select({
    label: 'Nivel de Encabezado',
    options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
    ],
    defaultValue: 'h2',
});

const titleTagH1Field = fields.select({
    label: 'Nivel de Encabezado',
    options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
    ],
    defaultValue: 'h1',
});

// ── Hero ─────────────────────────────────────────────────────────────────────

export const heroBlock = (imageDir = 'public/images') => ({
    label: '🖼️ Hero — Cabecera Principal',
    schema: fields.object({
        heading: fields.text({
            label: 'Encabezado (parte normal)',
            defaultValue: 'SERVICIO en',
        }),
        headingHighlight: fields.text({
            label: 'Encabezado destacado (parte de color)',
            defaultValue: 'CIUDAD',
        }),
        subheading: fields.text({
            label: 'Subtítulo',
            multiline: true,
            defaultValue: 'Descripción breve del servicio.',
        }),
        ctaPrimaryText: fields.text({ label: 'Texto Botón Principal', defaultValue: 'Pedir Presupuesto' }),
        ctaPrimaryLink: fields.text({ label: 'Enlace Botón Principal', defaultValue: '#contacto' }),
        ctaSecondaryText: fields.text({ label: 'Texto Botón Secundario', defaultValue: 'WhatsApp' }),
        ctaSecondaryLink: fields.text({ label: 'Enlace Botón Secundario', defaultValue: '' }),
        features: fields.array(
            fields.text({ label: 'Elemento' }),
            { label: 'Bullets del Hero', itemLabel: p => p.value || 'Elemento' }
        ),
        titleTag: titleTagH1Field,
        backgroundImage: fields.image({
            label: 'Imagen de Fondo (Opcional)',
            directory: imageDir,
            publicPath: imageDir.replace('public', ''),
        }),
        backgroundImageAlt: fields.text({
            label: 'Texto Alt Imagen de Fondo',
            defaultValue: '',
        }),
    }),
});

// ── Features ─────────────────────────────────────────────────────────────────

export const featuresBlock = () => ({
    label: '💎 Por Qué Elegirnos (Ventajas)',
    schema: fields.object({
        title: fields.text({ label: 'Título', defaultValue: 'Por qué confiar en nosotros' }),
        subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
        titleTag: titleTagField,
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
        features: fields.array(
            fields.object({
                title: fields.text({ label: 'Título' }),
                description: fields.text({ label: 'Descripción', multiline: true }),
                icon: IconPicker({ label: 'Icono (Lucide)' }),
            }),
            { label: 'Ventajas', itemLabel: p => p.fields.title.value || 'Ventaja' }
        ),
    }),
});

// ── Stats ─────────────────────────────────────────────────────────────────────

export const statsBlock = () => ({
    label: '📊 Contador de Estadísticas',
    schema: fields.object({
        title: fields.text({ label: 'Título', defaultValue: 'Expertos en SERVICIO' }),
        subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
        titleTag: titleTagField,
        stats: fields.array(
            fields.object({
                label: fields.text({ label: 'Etiqueta' }),
                value: fields.text({ label: 'Valor (número)', defaultValue: '10' }),
                suffix: fields.text({ label: 'Sufijo (ej: +, %)', defaultValue: '+' }),
                icon: IconPicker({ label: 'Icono (Lucide)' }),
            }),
            { label: 'Estadísticas', itemLabel: p => p.fields.label.value || 'Stat' }
        ),
    }),
});

// ── Process ───────────────────────────────────────────────────────────────────

export const processBlock = () => ({
    label: '👷 Método Paso a Paso (Proceso)',
    schema: fields.object({
        title: fields.text({ label: 'Título', defaultValue: 'Cómo trabajamos' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        titleTag: titleTagField,
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
        steps: fields.array(
            fields.object({
                title: fields.text({ label: 'Título del Paso' }),
                description: fields.text({ label: 'Descripción', multiline: true }),
                icon: IconPicker({ label: 'Icono (Lucide)' }),
                duration: fields.text({ label: 'Duración / Detalle (Opcional)', defaultValue: '' }),
            }),
            { label: 'Pasos', itemLabel: p => p.fields.title.value || 'Paso' }
        ),
    }),
});

// ── About ─────────────────────────────────────────────────────────────────────

export const aboutBlock = (imageDir = 'public/images') => ({
    label: '🏢 Sobre Nosotros (Historia)',
    schema: fields.object({
        title: fields.text({ label: 'Título (parte normal)', defaultValue: 'NOMBRE_EMPRESA — SERVICIO en' }),
        titleHighlight: fields.text({ label: 'Título destacado (parte de color)', defaultValue: 'CIUDAD' }),
        titleTag: titleTagField,
        description: fields.text({ label: 'Descripción', multiline: true }),
        yearsExperience: fields.text({ label: 'Años de experiencia', defaultValue: '10+' }),
        projectsCompleted: fields.text({ label: 'Proyectos completados', defaultValue: '500+' }),
        image: fields.image({
            label: 'Foto del equipo / empresa (Opcional)',
            directory: imageDir,
            publicPath: imageDir.replace('public', ''),
        }),
        features: fields.array(
            fields.object({
                title: fields.text({ label: 'Título' }),
                description: fields.text({ label: 'Descripción', multiline: true }),
                icon: IconPicker({ label: 'Icono (Lucide)' }),
            }),
            { label: 'Diferenciadores', itemLabel: p => p.fields.title.value || 'Punto' }
        ),
        buttonText: fields.text({ label: 'Texto del Botón', defaultValue: 'Quiénes somos' }),
        buttonLink: fields.text({ label: 'Enlace del Botón', defaultValue: '/nosotros/' }),
    }),
});

// ── Testimonials ──────────────────────────────────────────────────────────────

export const testimonialsBlock = () => ({
    label: '⭐ Opiniones de Clientes (Testimonios)',
    schema: fields.object({
        title: fields.text({ label: 'Título', defaultValue: 'Lo que dicen nuestros clientes' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        titleTag: titleTagField,
        testimonials: fields.array(
            fields.object({
                quote: fields.text({ label: 'Opinión', multiline: true }),
                author: fields.text({ label: 'Nombre del cliente' }),
                initials: fields.text({ label: 'Iniciales (ej: MG)', defaultValue: 'AB' }),
                location: fields.text({ label: 'Ciudad / Barrio' }),
                date: fields.text({ label: 'Año o fecha', defaultValue: '2025' }),
                rating: fields.integer({ label: 'Valoración (1-5)', defaultValue: 5 }),
                service: fields.text({ label: 'Servicio contratado (Opcional)' }),
                verified: fields.checkbox({ label: 'Verificado', defaultValue: true }),
            }),
            { label: 'Testimonios', itemLabel: p => p.fields.author.value || 'Testimonio' }
        ),
    }),
});

// ── CTA ───────────────────────────────────────────────────────────────────────

export const ctaBlock = () => ({
    label: '🎯 Llamada a la Acción (CTA)',
    schema: fields.object({
        title: fields.text({ label: 'Título', defaultValue: '¿Necesitas SERVICIO en CIUDAD?' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        titleTag: titleTagField,
        buttonText: fields.text({ label: 'Texto del Botón', defaultValue: 'Presupuesto gratuito · Sin compromiso' }),
        buttonLink: fields.text({ label: 'Enlace del Botón', defaultValue: '/contacto/' }),
        style: fields.select({
            label: 'Estilo Visual',
            options: [
                { label: '🌈 Degradado (gradient)', value: 'gradient' },
                { label: '■ Sólido (solid)', value: 'solid' },
                { label: '□ Borde (outline)', value: 'outline' },
                { label: '◼ Oscuro (dark)', value: 'dark' },
            ],
            defaultValue: 'gradient',
        }),
        features: fields.array(
            fields.text({ label: 'Elemento' }),
            { label: 'Puntos de apoyo', itemLabel: p => p.value || 'Elemento' }
        ),
    }),
});

// ── Pricing ───────────────────────────────────────────────────────────────────

export const pricingBlock = () => ({
    label: '💰 Tabla de Precios (Planes)',
    schema: fields.object({
        title: fields.text({ label: 'Título' }),
        subtitle: fields.text({ label: 'Subtítulo (Opcional)', multiline: true }),
        titleTag: titleTagField,
        note: fields.text({ label: 'Nota al pie (Opcional)', multiline: true }),
        plans: fields.array(
            fields.object({
                name: fields.text({ label: 'Nombre del plan' }),
                price: fields.text({ label: 'Precio (ej: desde 299€)' }),
                description: fields.text({ label: 'Descripción', multiline: true }),
                features: fields.array(
                    fields.text({ label: 'Elemento incluido' }),
                    { label: 'Qué incluye', itemLabel: p => p.value || 'Elemento' }
                ),
                highlighted: fields.checkbox({ label: 'Destacar este plan', defaultValue: false }),
                ctaText: fields.text({ label: 'Texto del Botón' }),
                ctaLink: fields.text({ label: 'Enlace del Botón', defaultValue: '/contacto/' }),
            }),
            { label: 'Planes', itemLabel: p => p.fields.name.value || 'Plan' }
        ),
    }),
});
