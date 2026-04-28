import { fields } from '@keystatic/core';
import { MousePointer2, AlertTriangle, Phone, Building, Image } from 'lucide-react';
import React from 'react';

export const mdxComponentsConfig = {
    CtaBlock: {
        label: 'Botón de Llamada a la Acción (CTA)',
        kind: 'block' as const,
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
        kind: 'block' as const,
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
        kind: 'block' as const,
        icon: <Phone />,
        schema: {},
    },

    BusinessNameBlock: {
        label: '🏢 Nombre del Negocio',
        kind: 'block' as const,
        icon: <Building />,
        schema: {},
    },

    CustomImageBlock: {
        label: 'Imagen con Estilo',
        kind: 'block' as const,
        icon: <Image />,
        schema: {
            image: fields.image({
                label: 'Imagen',
                directory: 'public/images/content',
                publicPath: '/images/content',
            }),
            alt: fields.text({ label: 'Texto Alternativo (SEO)' }),
            caption: fields.text({ label: 'Pie de Foto (Opcional)' }),
            size: fields.select({
                label: 'Tamaño',
                options: [
                    { label: 'Completo (100%)', value: 'full' },
                    { label: 'Grande (960px)', value: 'large' },
                    { label: 'Mediano (720px)', value: 'medium' },
                    { label: 'Pequeño (480px)', value: 'small' },
                ],
                defaultValue: 'large',
            }),
            aspectRatio: fields.select({
                label: 'Proporción',
                options: [
                    { label: 'Automático (altura natural)', value: 'auto' },
                    { label: '16:9 — Panorámico', value: '16:9' },
                    { label: '4:3 — Clásico', value: '4:3' },
                    { label: '1:1 — Cuadrado', value: '1:1' },
                    { label: '3:4 — Retrato', value: '3:4' },
                ],
                defaultValue: 'auto',
            }),
            align: fields.select({
                label: 'Alineación',
                options: [
                    { label: 'Izquierda', value: 'left' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Derecha', value: 'right' },
                ],
                defaultValue: 'center',
            }),
            objectFit: fields.select({
                label: 'Ajuste de imagen dentro del recorte',
                options: [
                    { label: 'Cubrir (Cover)', value: 'cover' },
                    { label: 'Contener (Contain)', value: 'contain' },
                ],
                defaultValue: 'cover',
            }),
            shadow: fields.checkbox({
                label: 'Sombra',
                defaultValue: true,
            }),
            rounded: fields.checkbox({
                label: 'Bordes redondeados',
                defaultValue: true,
            }),
        },
    },
};
