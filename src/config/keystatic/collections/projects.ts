import { collection, fields } from '@keystatic/core';

export const projects = collection({
    label: '💼 Portafolio / Proyectos',
    slugField: 'title',
    path: 'src/content/projects/*',
    previewUrl: '/proyectos/{slug}',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        title: fields.slug({
            name: {
                label: 'Título del Proyecto *',
                description: 'Ej: Reforma integral piso en Gracia, Instalación eléctrica local comercial',
                validation: { length: { min: 1 } },
            },
        }),

        image: fields.image({
            label: 'Imagen Principal *',
            description: 'Foto del resultado final. Recomendado: 1200×800px, formato WebP o JPG.',
            directory: 'public/images/projects',
            publicPath: '/images/projects',
        }),

        locationTag: fields.text({
            label: 'Zona / Ciudad',
            description: 'Ej: Barcelona, Gracia, Sabadell — aparece como etiqueta en la tarjeta.',
        }),

        serviceType: fields.text({
            label: 'Tipo de Servicio',
            description: 'Ej: Reforma de baño, Instalación eléctrica, Pintura interior',
        }),

        date: fields.date({
            label: 'Fecha del Proyecto',
            description: 'Mes y año en que se realizó el trabajo.',
            defaultValue: { kind: 'today' },
        }),

        featured: fields.checkbox({
            label: 'Destacado en la galería',
            description: 'Los proyectos destacados aparecen primero.',
            defaultValue: false,
        }),

        seoTitle: fields.text({
            label: 'Título SEO',
            description: 'Máx. 60 caracteres. Si lo dejas vacío se usa el título del proyecto.',
            validation: { length: { max: 60 } },
        }),

        seoDesc: fields.text({
            label: 'Descripción SEO',
            description: 'Máx. 160 caracteres. Describe el trabajo realizado y la zona.',
            multiline: true,
            validation: { length: { max: 160 } },
        }),

        content: fields.mdx({
            label: 'Descripción del Proyecto',
            description: 'Detalla el trabajo realizado: qué se hizo, materiales usados, duración, resultado.',
            options: {
                image: {
                    directory: 'public/images/projects',
                    publicPath: '/images/projects',
                },
            },
        }),
    },
});
