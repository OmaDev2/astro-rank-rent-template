import { collection, fields } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image, Layout, Star, HelpCircle, ArrowRight } from 'lucide-react';

export const services = collection({
    label: '🛠️ Servicios',
    slugField: 'title',
    path: 'src/content/services/*',
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
        seoTitle: fields.text({ label: 'SEO Title (Meta)' }),
        seoDesc: fields.text({ label: 'SEO Description', multiline: true }),
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
                    description: fields.text({ label: 'Descripción', multiline: true }),
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
