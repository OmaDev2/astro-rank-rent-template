import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { mdxComponentsConfig } from '../mdx-components';

export const serviceAreas = collection({
    label: '📍 Servicio × Zona (long-tail)',
    slugField: 'title',
    path: 'src/content/serviceAreas/*',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        title: fields.slug({
            name: {
                label: 'Título del combo *',
                description: 'Ej: Rejas de seguridad en Utebo. Define el slug del archivo.',
                validation: { length: { min: 1 } },
            },
        }),
        service: fields.relationship({
            label: 'Servicio *',
            description: 'Servicio existente al que pertenece este combo.',
            collection: 'services',
        }),
        zona: fields.relationship({
            label: 'Zona / Municipio *',
            description: 'Zona existente (municipio) de este combo.',
            collection: 'locations',
        }),
        description: fields.text({
            label: 'Meta description',
            description: 'Descripción para Google (150-160 caracteres). Opcional.',
            multiline: true,
        }),
        heroImage: fields.image({
            label: 'Imagen (opcional)',
            directory: 'public/images/serviceAreas',
            publicPath: '/images/serviceAreas',
        }),
        faq: fields.array(
            fields.object({
                question: fields.text({ label: 'Pregunta' }),
                answer: fields.text({ label: 'Respuesta', multiline: true }),
            }),
            {
                label: 'FAQ (opcional)',
                itemLabel: (props) => props.fields.question.value || 'Pregunta',
            }
        ),
        seo: SeoPreview({
            label: 'SEO Google Preview',
            description: 'Previsualiza cómo se verá este combo en los resultados de búsqueda.',
        }),
        content: fields.mdx({
            label: 'Contenido único del combo (mín. 250 palabras)',
            description: 'Por qué este servicio en esta zona: casos locales, materiales, precios, particularidades del municipio.',
            options: {
                image: {
                    directory: 'public/images/serviceAreas',
                    publicPath: '/images/serviceAreas',
                },
            },
            components: mdxComponentsConfig,
        }),
    },
});
