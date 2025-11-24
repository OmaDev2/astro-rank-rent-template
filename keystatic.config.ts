import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        locations: collection({
            label: 'Zonas de Servicio',
            slugField: 'name',
            path: 'src/content/locations/*',
            format: { contentField: 'content' },
            schema: {
                name: fields.slug({ name: { label: 'Nombre' } }),
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
                zipCodes: fields.array(fields.text({ label: 'Código Postal' }), {
                    label: 'Códigos Postales',
                    itemLabel: (props) => props.value,
                }),
                content: fields.mdx({
                    label: 'Contenido',
                }),
            },
        }),
        services: collection({
            label: 'Servicios',
            slugField: 'title',
            path: 'src/content/services/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Título' } }),
                icon: fields.text({ label: 'Icono (Lucide)' }),
                shortDesc: fields.text({ label: 'Descripción Corta', multiline: true }),
                featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),
                content: fields.mdx({
                    label: 'Descripción Completa',
                }),
            },
        }),
        projects: collection({
            label: 'Portafolio',
            slugField: 'title',
            path: 'src/content/projects/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Título del Trabajo' } }),
                image: fields.image({
                    label: 'Imagen',
                    directory: 'src/assets/projects',
                    publicPath: '@assets/projects',
                }),
                locationTag: fields.text({ label: 'Etiqueta de Ubicación' }),
                content: fields.mdx({ label: 'Detalles (Opcional)' }),
            },
        }),
    },
});
