import { collection, fields } from '@keystatic/core';

export const projects = collection({
    label: '💼 Portafolio',
    slugField: 'title',
    path: 'src/content/projects/*',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        title: fields.slug({
            name: { label: 'Título del Proyecto' },
        }),

        image: fields.image({
            label: 'Imagen',
            directory: 'src/assets/projects',
            publicPath: '@assets/projects',
        }),
        locationTag: fields.text({ label: 'Etiqueta de Ubicación' }),
        content: fields.mdx({ label: 'Detalles' }),
    },
});
