import { collection, fields } from '@keystatic/core';

export const testimonials = collection({
    label: '⭐ Testimonios',
    slugField: 'name',
    path: 'src/content/testimonials/*',
    schema: {
        name: fields.slug({
            name: { label: 'Nombre del Cliente' },
        }),
        initials: fields.text({
            label: 'Iniciales',
            description: 'Ej: JP para Juan Pérez',
        }),
        rating: fields.integer({
            label: 'Estrellas (1-5)',
            defaultValue: 5,
            validation: { min: 1, max: 5 },
        }),
        text: fields.text({
            label: 'Testimonio',
            multiline: true,
        }),
        featured: fields.checkbox({
            label: 'Mostrar en páginas de servicios',
            defaultValue: true,
        }),
    },
});
