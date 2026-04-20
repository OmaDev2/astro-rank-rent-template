import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { mdxComponentsConfig } from '../mdx-components';

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
            directory: 'src/assets/images/projects',
            publicPath: '../../assets/images/projects',
        }),
        imageAlt: fields.text({
            label: 'Texto Alt Imagen (Opcional)',
            description: 'Deja vacío para usar el título del proyecto automáticamente.',
        }),

        gallery: fields.array(
            fields.object({
                image: fields.image({
                    label: 'Imagen',
                    directory: 'src/assets/images/projects',
                    publicPath: '../../assets/images/projects',
                }),
                alt: fields.text({
                    label: 'Texto descriptivo (Alt)',
                    description: 'Importante para SEO y accesibilidad.',
                }),
            }),
            {
                label: 'Galería de Imágenes',
                description: 'Sube fotos adicionales del proyecto para mostrar el proceso o detalles.',
                itemLabel: (props) => props.fields.alt.value || 'Imagen de galería',
            }
        ),

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

        seo: SeoPreview({
            label: 'SEO Google Preview',
            description: 'Previsualiza cómo se verá este proyecto en los resultados de búsqueda.',
        }),

        content: fields.mdx({
            label: 'Descripción del Proyecto',
            description: 'Detalla el trabajo realizado: qué se hizo, materiales usados, duración, resultado.',
            options: {
                image: {
                    directory: 'src/assets/images/projects',
                    publicPath: '../../assets/images/projects',
                },
            },
            components: mdxComponentsConfig
        }),
    },
});
