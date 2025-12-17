import { fields, singleton } from '@keystatic/core';

export const navigation = singleton({
    label: '🧭 Navegación (Menú)',
    path: 'src/content/navigation/main',
    format: 'json',
    schema: {
        menuItems: fields.array(
            fields.object({
                label: fields.text({ label: 'Texto del Enlace' }),
                url: fields.text({ label: 'URL (ej: /contacto o #servicios)' }),
                type: fields.select({
                    label: 'Tipo de Enlace',
                    options: [
                        { label: 'Enlace Simple', value: 'link' },
                        { label: 'Desplegable de Servicios (Automático)', value: 'services_dropdown' },
                        { label: 'Desplegable de Zonas (Automático)', value: 'locations_dropdown' },
                    ],
                    defaultValue: 'link',
                }),
            }),
            {
                label: 'Elementos del Menú Principal',
                itemLabel: (props) => props.fields.label.value || 'Enlace',
            }
        ),
    },
});
