import { fields, singleton } from '@keystatic/core';

export const footer = singleton({
    label: 'Pie de Página (Footer)',
    path: 'src/content/footer/main',
    format: 'json',
    schema: {
        description: fields.text({
            label: 'Texto de Descripción',
            description: 'Pequeño texto bajo el logo. Si lo dejas vacío, se genera uno automático.',
            multiline: true,
        }),

        footerLinks: fields.array(
            fields.object({
                label: fields.text({ label: 'Texto del Enlace' }),
                url: fields.text({ label: 'URL' }),
            }),
            {
                label: 'Enlaces Legales (Fondo)',
                itemLabel: (props) => props.fields.label.value || 'Enlace',
            }
        ),

        disclaimer: fields.text({
            label: 'Texto Legal / Disclaimer',
            description: 'Texto pequeño al final (ej: "Este sitio actúa como intermediario...")',
            multiline: true,
        }),
    },
});
