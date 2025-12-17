import { fields, singleton } from '@keystatic/core';

export const schema = singleton({
    label: 'Schema.org (SEO Avanzado)',
    path: 'src/content/schema/global',
    schema: {
        priceRange: fields.text({
            label: 'Rango de Precios',
            description: 'Ej: €€ o $$ (ayuda a Google a mostrar info de precios)',
        }),

        openingHours: fields.array(
            fields.object({
                dayOfWeek: fields.multiselect({
                    label: 'Días',
                    options: [
                        { label: 'Lunes', value: 'Monday' },
                        { label: 'Martes', value: 'Tuesday' },
                        { label: 'Miércoles', value: 'Wednesday' },
                        { label: 'Jueves', value: 'Thursday' },
                        { label: 'Viernes', value: 'Friday' },
                        { label: 'Sábado', value: 'Saturday' },
                        { label: 'Domingo', value: 'Sunday' },
                    ],
                    defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                }),
                opens: fields.text({
                    label: 'Hora de Apertura',
                    description: 'Formato 24h (ej: 09:00)',
                }),
                closes: fields.text({
                    label: 'Hora de Cierre',
                    description: 'Formato 24h (ej: 18:00)',
                }),
            }),
            {
                label: 'Horario de Apertura (Schema.org)',
                description: 'Define los horarios para Google Business',
                itemLabel: (props) => {
                    const days = props.fields.dayOfWeek.value || [];
                    const opens = props.fields.opens.value || '';
                    const closes = props.fields.closes.value || '';
                    return days.length > 0
                        ? `${days.join(', ')}: ${opens} - ${closes}`
                        : 'Nuevo horario';
                },
            }
        ),

        areaServed: fields.array(
            fields.text({ label: 'Ciudad/Zona' }),
            {
                label: 'Áreas de Servicio',
                description: 'Ciudades o zonas donde ofreces servicio (para Schema.org)',
                itemLabel: (props) => props.value || 'Nueva área',
            }
        ),

        paymentAccepted: fields.multiselect({
            label: 'Métodos de Pago Aceptados',
            description: 'Selecciona todos los que apliquen',
            options: [
                { label: 'Efectivo', value: 'Cash' },
                { label: 'Tarjeta de Crédito', value: 'Credit Card' },
                { label: 'Tarjeta de Débito', value: 'Debit Card' },
                { label: 'Transferencia Bancaria', value: 'Bank Transfer' },
                { label: 'Bizum', value: 'Bizum' },
                { label: 'PayPal', value: 'PayPal' },
            ],
            defaultValue: ['Cash', 'Credit Card'],
        }),

        foundingDate: fields.text({
            label: 'Año de Fundación',
            description: 'Ej: 1995 (añade credibilidad)',
        }),

        slogan: fields.text({
            label: 'Eslogan/Lema',
            description: 'Frase que representa tu negocio',
            multiline: true,
        }),
    },
});
