import { collection, fields } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image } from 'lucide-react';

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
        seoTitle: fields.text({ label: 'Meta Title' }),
        seoDesc: fields.text({ label: 'Meta Description', multiline: true }),

        heroImage: fields.image({
            label: 'Imagen Hero de la Zona',
            description: 'Imagen representativa de la zona. Recomendado: 1920x1080px',
            directory: 'public/images/locations',
            publicPath: '/images/locations',
            validation: { isRequired: false }
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

        blocks: fields.blocks({
            hero: {
                label: 'Hero (Portada)',
                schema: fields.empty()
            },
            features: {
                label: 'Características (Por qué elegirnos)',
                schema: fields.empty()
            },
            map: {
                label: 'Mapa de Ubicación',
                schema: fields.empty()
            },
            content: {
                label: 'Contenido Principal + Sidebar',
                schema: fields.empty()
            },
            cta: {
                label: 'Llamada a la Acción (CTA Final)',
                schema: fields.empty()
            },
        }, {
            label: 'Constructor de Página (Orden de Secciones)',
            description: 'Define qué secciones mostrar y en qué orden aparecerán en la página'
        }),

        content: fields.mdx({
            label: 'Contenido (Texto SEO)',
            description: 'Contenido principal que se mostrará cuando agregues el bloque "Contenido Principal + Sidebar"',
            components: {
                CtaBlock: {
                    label: 'Botón de Llamada a la Acción (CTA)',
                    kind: 'block',
                    icon: <MousePointer2 />,
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
