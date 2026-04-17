import { collection, fields } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image, Layout, Star, HelpCircle, ArrowRight } from 'lucide-react';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';

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
                description: 'Se genera automático.'
            }
        }),
        heroImage: fields.image({
            label: 'Imagen Principal (Cards)',
            directory: 'public/images/services',
            publicPath: '/images/services',
        }),

        // Metadatos globales (no cambian de posición)
        seo: SeoPreview({
            label: 'SEO Google Preview',
        }),
        icon: fields.text({ label: 'Icono (Lucide)' }),
        shortDesc: fields.text({ label: 'Descripción Corta (Cards)', multiline: true }),
        featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

        // CONSTRUCTOR DE BLOQUES MEJORADO
        blocks: fields.blocks({
            hero: {
                label: 'Hero (Portada)',
                schema: fields.object({
                    title: fields.text({ label: 'Título H1 (Sobreescribir)' }),
                    subtitle: fields.text({ label: 'Subtítulo / Lead', multiline: true }),
                    heroImage: fields.image({
                        label: 'Imagen Hero',
                        directory: 'public/images/services',
                        publicPath: '/images/services',
                    }),
                })
            },
            features: {
                label: 'Características (Beneficios)',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    items: fields.array(
                        fields.object({
                            title: fields.text({ label: 'Característica' }),
                            desc: fields.text({ label: 'Detalle', multiline: true }),
                            icon: fields.text({ label: 'Icono (Lucide)' }),
                        }),
                        {
                            label: 'Lista de Beneficios',
                            itemLabel: (props) => props.fields.title.value || 'Beneficio',
                        }
                    )
                })
            },
            content: {
                label: 'Contenido y MDX',
                schema: fields.object({
                    title: fields.text({ label: 'Título del bloque de texto' }),
                    showSidebar: fields.checkbox({ label: 'Mostrar Sidebar de Contacto', defaultValue: true }),
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
            faq: {
                label: 'Preguntas Frecuentes',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección FAQ' }),
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
            cta: {
                label: 'Llamada a la Acción (CTA)',
                schema: fields.object({
                    title: fields.text({ label: 'Título del CTA' }),
                    subtitle: fields.text({ label: 'Texto descriptivo' }),
                    buttonText: fields.text({ label: 'Texto del Botón' }),
                    buttonLink: fields.text({ label: 'Enlace (ej: /contacto)' }),
                })
            },
            locations_grid: {
                label: 'Cuadrícula de Zonas',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    description: fields.text({ label: 'Descripción', multiline: true }),
                })
            },
            price_from: {
                label: '🏷️ Precio Desde',
                schema: fields.object({
                    price: fields.text({ label: 'Precio (Ej: 18)', validation: { length: { min: 1 } } }),
                    unit: fields.text({ label: 'Unidad (Ej: /m2)', defaultValue: '/m2' }),
                    title: fields.text({ label: 'Título Grande (Ej: Hormigón Impreso)' }),
                    subtitle: fields.text({ label: 'Subtítulo Pequeño (Ej: Precio Profesional)' }),
                    buttonText: fields.text({ label: 'Texto Botón', defaultValue: 'Pedir Presupuesto' }),
                    buttonLink: fields.text({ label: 'Enlace Botón', defaultValue: '#contacto' }),
                    isOffer: fields.checkbox({ label: '¿Es una oferta?', defaultValue: true }),
                })
            },
            pricing: {
                label: 'Tabla de Precios',
                schema: fields.object({
                    title: fields.text({ label: 'Título' }),
                    subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
                    plans: fields.array(
                        fields.object({
                            name: fields.text({ label: 'Nombre del Plan' }),
                            price: fields.text({ label: 'Precio (Ej: 99€)' }),
                            description: fields.text({ label: 'Descripción Corta' }),
                            isPopular: fields.checkbox({ label: '¿Es el plan más popular?', defaultValue: false }),
                            features: fields.array(fields.text({ label: 'Característica' }), {
                                label: 'Características',
                                itemLabel: p => p.value || 'Característica'
                            }),
                            buttonText: fields.text({ label: 'Texto del Botón', defaultValue: 'Solicitar Ahora' }),
                            buttonLink: fields.text({ label: 'Enlace (Opcional)', defaultValue: '#contacto' }),
                        }),
                        { label: 'Planes', itemLabel: p => p.fields.name.value || 'Plan' }
                    )
                })
            },
            stats: {
                label: 'Números / Estadísticas',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección (Opcional)' }),
                    stats: fields.array(
                        fields.object({
                            label: fields.text({ label: 'Etiqueta (Ej: Clientes)' }),
                            value: fields.text({ label: 'Valor (Ej: 500)' }),
                            suffix: fields.text({ label: 'Sufijo (Ej: +)' }),
                        }),
                        { label: 'Estadísticas', itemLabel: p => `${p.fields.value.value}${p.fields.suffix.value} ${p.fields.label.value}` }
                    )
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
            label: 'Constructor Visual',
            description: 'Añade y ordena los bloques que compondrán la página.'
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
            components: {
                CtaBlock: {
                    label: 'Botón CTA',
                    kind: 'block',
                    icon: <MousePointer2 />,
                    schema: {
                        text: fields.text({ label: 'Texto' }),
                        url: fields.text({ label: 'URL' }),
                        type: fields.select({
                            label: 'Color',
                            options: [
                                { label: 'Principal', value: 'primary' },
                                { label: 'Secundario', value: 'secondary' },
                                { label: 'WhatsApp', value: 'whatsapp' },
                            ],
                            defaultValue: 'primary',
                        }),
                    },
                },
                AlertBlock: {
                    label: 'Alerta',
                    kind: 'block',
                    icon: <AlertTriangle />,
                    schema: {
                        title: fields.text({ label: 'Título' }),
                        content: fields.text({ label: 'Contenido', multiline: true }),
                        type: fields.select({
                            label: 'Nivel',
                            options: [
                                { label: 'Info', value: 'info' },
                                { label: 'Warning', value: 'warning' },
                                { label: 'Error', value: 'error' },
                            ],
                            defaultValue: 'info',
                        }),
                    },
                },
                PhoneBlock: { label: '📞 Teléfono Situacional', kind: 'block', icon: <Phone />, schema: {} },
                BusinessNameBlock: { label: '🏢 Nombre Local', kind: 'block', icon: <Building />, schema: {} },
            }
        }),
    },
});
