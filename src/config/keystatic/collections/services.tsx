import { collection, fields } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image } from 'lucide-react';

export const services = collection({
    label: '🛠️ Servicios',
    slugField: 'title',
    path: 'src/content/services/*',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        title: fields.slug({
            name: {
                label: 'Título Principal (H1)',
                validation: { length: { min: 1 } }
            },
            slug: {
                label: 'URL / Slug',
                description: 'Se genera automático. Haz clic en el candado para editarlo manualmente.'
            }
        }),

        heroImage: fields.image({
            label: 'Imagen Destacada (Hero)',
            description: 'Imagen principal que aparece en el hero del servicio. Recomendado: 1920x1080px',
            directory: 'public/images/services',
            publicPath: '/images/services',
            validation: { isRequired: false }
        }),

        seoTitle: fields.text({ label: 'SEO Title (Meta)' }),
        seoDesc: fields.text({ label: 'SEO Description', multiline: true }),
        icon: fields.text({ label: 'Icono (Lucide)' }),
        shortDesc: fields.text({ label: 'Descripción Corta', multiline: true }),
        featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

        faq: fields.array(
            fields.object({
                question: fields.text({ label: 'Pregunta' }),
                answer: fields.text({ label: 'Respuesta', multiline: true }),
            }),
            {
                label: 'Preguntas Frecuentes',
                itemLabel: (props) => props.fields.question.value || 'Pregunta',
            }
        ),

        blocks: fields.blocks({
            hero: {
                label: 'Hero (Portada)',
                schema: fields.empty()
            },
            features: {
                label: 'Características (Por qué elegirnos)',
                schema: fields.empty()
            },
            content: {
                label: 'Contenido Principal + Sidebar',
                schema: fields.empty()
            },
            faq: {
                label: 'Preguntas Frecuentes',
                schema: fields.empty()
            },
            cta: {
                label: 'Llamada a la Acción (CTA Final)',
                schema: fields.empty()
            },
        }, {
            label: 'Constructor de Página (Orden de Secciones)',
            description: 'Define qué secciones mostrar y en qué orden aparecerán en la página del servicio'
        }),

        content: fields.mdx({
            label: 'Contenido (Texto SEO)',
            description: 'Contenido principal que se mostrará cuando agregues el bloque "Contenido Principal + Sidebar"',
            options: {
                image: {
                    directory: 'public/images/services',
                    publicPath: '/images/services',
                }
            },
            components: {
                CtaBlock: {
                    label: 'Botón de Llamada a la Acción (CTA)',
                    kind: 'block',
                    icon: <MousePointer2 />, // Lucide Component
                    schema: {
                        text: fields.text({
                            label: 'Texto del botón',
                            validation: { length: { min: 1 } },
                        }),
                        url: fields.text({ label: 'URL de Destino (ej: /contacto o https://wa.me/34600000000)' }),
                        type: fields.select({
                            label: 'Estilo',
                            options: [
                                { label: 'Primario (Color Principal)', value: 'primary' },
                                { label: 'Secundario (Borde)', value: 'secondary' },
                                { label: 'WhatsApp (Verde)', value: 'whatsapp' },
                            ],
                            defaultValue: 'primary',
                        }),
                        alignment: fields.select({
                            label: 'Alineación',
                            options: [
                                { label: 'Izquierda', value: 'left' },
                                { label: 'Centro', value: 'center' },
                                { label: 'Derecha', value: 'right' },
                            ],
                            defaultValue: 'center',
                        }),
                        size: fields.select({
                            label: 'Tamaño',
                            options: [
                                { label: 'Pequeño', value: 'small' },
                                { label: 'Mediano', value: 'medium' },
                                { label: 'Grande', value: 'large' },
                            ],
                            defaultValue: 'large',
                        }),
                        isFullWidth: fields.checkbox({
                            label: 'Ancho Completo (Full Width)',
                            defaultValue: false,
                        }),
                    },
                },

                AlertBlock: {
                    label: 'Caja de Alerta / Aviso',
                    kind: 'block',
                    icon: <AlertTriangle />,
                    schema: {
                        title: fields.text({ label: 'Título de la Alerta' }),
                        content: fields.text({
                            label: 'Contenido',
                            multiline: true,
                        }),
                        type: fields.select({
                            label: 'Tipo de Alerta',
                            options: [
                                { label: 'Información (Azul)', value: 'info' },
                                { label: 'Advertencia (Amarillo)', value: 'warning' },
                                { label: 'Éxito (Verde)', value: 'success' },
                                { label: 'Peligro (Rojo)', value: 'error' },
                            ],
                            defaultValue: 'info',
                        }),
                    },
                },

                PhoneBlock: {
                    label: '📞 Teléfono Dinámico',
                    kind: 'block',
                    icon: <Phone />,
                    schema: {},
                },

                BusinessNameBlock: {
                    label: '🏢 Nombre del Negocio',
                    kind: 'block',
                    icon: <Building />,
                    schema: {},
                },

                CustomImageBlock: {
                    label: 'Imagen con Estilo',
                    kind: 'block',
                    icon: <Image />,
                    schema: {
                        image: fields.image({
                            label: 'Imagen',
                            directory: 'public/images/content',
                            publicPath: '/images/content',
                        }),
                        alt: fields.text({ label: 'Texto Alternativo (SEO)' }),
                        caption: fields.text({ label: 'Pie de Foto (Opcional)' }),
                        objectFit: fields.select({
                            label: 'Ajuste de Imagen (Object Fit)',
                            options: [
                                { label: 'Cubrir (Cover)', value: 'cover' },
                                { label: 'Contener (Contain)', value: 'contain' },
                                { label: 'Estirar (Fill)', value: 'fill' },
                            ],
                            defaultValue: 'cover',
                        }),
                        borderRadius: fields.select({
                            label: 'Bordes Redondeados',
                            options: [
                                { label: 'Ninguno', value: 'none' },
                                { label: 'Pequeño', value: 'sm' },
                                { label: 'Mediano', value: 'md' },
                                { label: 'Grande', value: 'lg' },
                                { label: 'Extra Grande', value: 'xl' },
                                { label: 'Completo (Círculo)', value: 'full' },
                            ],
                            defaultValue: 'xl',
                        }),
                        shadow: fields.select({
                            label: 'Sombra',
                            options: [
                                { label: 'Ninguna', value: 'none' },
                                { label: 'Pequeña', value: 'sm' },
                                { label: 'Mediana', value: 'md' },
                                { label: 'Grande', value: 'lg' },
                                { label: 'Extra Grande', value: 'xl' },
                            ],
                            defaultValue: 'lg',
                        }),
                    },
                },
            }
        }),
    },
});
