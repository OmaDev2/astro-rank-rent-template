import { collection, fields } from '@keystatic/core';
import { FileText, Image, MousePointer2, AlertTriangle } from 'lucide-react';

export const blog = collection({
    label: 'Blog',
    slugField: 'title',
    path: 'src/content/blog/*',
    format: { contentField: 'intro' }, // Usamos intro como el 'content' principal si queremos, o mejor, usamos blocks para todo.
    // En el script de generacion usamos "intro" + "sectionsMd".
    // Para Keystatic, lo ideal sería que el usuario pueda editar todo.
    // Si usamos MDX, el contenido libre va al final.
    // Vamos a definir 'intro' como un campo de texto y 'content' como el body mdx.

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

        intro: fields.mdx({
            label: 'Introducción',
            description: 'El primer párrafo del artículo que aparece antes del contenido principal.'
        }),

        blocks: fields.blocks({
            content: {
                label: 'Sección de Contenido (H2 + Texto)',
                schema: fields.object({
                    title: fields.text({ label: 'Subtítulo (H2)' }),
                    content: fields.mdx({ label: 'Contenido' })
                })
            },
            faq: {
                label: 'Preguntas Frecuentes',
                schema: fields.object({
                    question: fields.text({ label: 'Pregunta' }),
                    answer: fields.text({ label: 'Respuesta', multiline: true })
                })
            },
            cta: {
                label: 'Llamada a la Acción (CTA)',
                schema: fields.object({
                    text: fields.text({ label: 'Texto del Botón' }),
                    link: fields.text({ label: 'Enlace' })
                })
            }
        }, {
            label: 'Bloques de Contenido',
            description: 'Añade secciones, FAQs o CTAs al artículo.'
        }),
    },
});
