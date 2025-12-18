import { collection, fields } from '@keystatic/core';
import { FileText, Image, MousePointer2, AlertTriangle } from 'lucide-react';

export const blog = collection({
    label: '📰 Blog',
    slugField: 'title',
    path: 'src/content/blog/*',
    previewUrl: '/blog/{slug}',
    entryLayout: 'content',
    format: { contentField: 'content' }, // Usamos 'content' como el campo principal para el editor visual
    // El script generador usará 'content' para el cuerpo del artículo.


    schema: {
        title: fields.slug({
            name: {
                label: 'Título del Artículo',
                validation: { length: { min: 1 } }
            },
        }),

        pubDate: fields.date({
            label: 'Fecha de Publicación',
            defaultValue: { kind: 'today' }
        }),

        description: fields.text({
            label: 'Meta Descripción (SEO)',
            multiline: true,
            validation: { length: { min: 10, max: 160 } }
        }),

        author: fields.text({
            label: 'Autor',
            defaultValue: 'Admin'
        }),

        image: fields.image({
            label: 'Imagen Destacada',
            directory: 'public/images/blog',
            publicPath: '/images/blog',
            validation: { isRequired: false }
        }),

        category: fields.text({
            label: 'Categoría',
            defaultValue: 'General'
        }),

        tags: fields.array(
            fields.text({ label: 'Tag' }),
            {
                label: 'Etiquetas (Tags)',
                itemLabel: (props) => props.value
            }
        ),

        featured: fields.checkbox({
            label: 'Destacado',
            defaultValue: false
        }),

        intro: fields.text({
            label: 'Introducción (Extracto)',
            description: 'Breve texto para la tarjeta del blog y meta descripción.',
            multiline: true
        }),

        content: fields.mdx({
            label: 'Contenido del Artículo',
            description: 'Escribe aquí tu artículo completo. Soporta imágenes, encabezados y formato rico.',
            options: {
                image: {
                    directory: 'public/images/blog',
                    publicPath: '/images/blog',
                }
            }
        }),
    },
});
