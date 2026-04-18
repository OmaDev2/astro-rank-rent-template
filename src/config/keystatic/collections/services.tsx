import { collection, fields } from '@keystatic/core';
import { SeoPreview } from '@/components/keystatic/SeoPreview';
import { IconPicker } from '@/components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';
import { heroPreview } from '@/components/keystatic/HeroPreview';
import { featuresPreview } from '@/components/keystatic/FeaturesPreview';
import { statsPreview } from '@/components/keystatic/StatsPreview';
import { ctaPreview } from '@/components/keystatic/CtaPreview';
import { pricingPreview } from '@/components/keystatic/PricingPreview';
import { processPreview } from '@/components/keystatic/ProcessPreview';

export const services = collection({
    label: '🛠️ Servicios',
    slugField: 'title',
    path: 'src/content/services/*',
    previewUrl: '/servicios/{slug}',
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
        title: fields.slug({
            name: {
                label: 'Título Interno / Identificador',
                validation: { length: { min: 1 } }
            },
            slug: {
                label: 'URL / Slug',
                description: 'Se genera automático.'
            }
        }),
        heroImage: fields.image({
            label: 'Imagen Principal (Cards)',
            directory: 'public/images/services',
            publicPath: '/images/services',
        }),
        heroImageAlt: fields.text({
            label: 'Texto Alt Imagen Hero (Opcional)',
            description: 'Deja vacío para SEO automático.',
        }),

        // Metadatos globales (no cambian de posición)
        seo: SeoPreview({
            label: 'SEO Google Preview',
        }),
        icon: IconPicker({ label: 'Icono Principal (Lucide)' }),
        shortDesc: fields.text({ label: 'Descripción Corta (Cards)', multiline: true }),
        featured: fields.checkbox({ label: 'Destacado en Home', defaultValue: false }),

        // CONSTRUCTOR DE BLOQUES MEJORADO
        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero (Portada)',
                schema: fields.object({
                    content: heroPreview(),
                })
            },
            features: {
                label: '💎 Características (Beneficios)',
                schema: fields.object({
                    content: featuresPreview(),
                })
            },
            process: {
                label: '👷 Método de Trabajo (Proceso)',
                schema: fields.object({
                    content: processPreview(),
                })
            },
            stats: {
                label: '📊 Números / Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
                })
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA)',
                schema: fields.object({
                    content: ctaPreview(),
                })
            },
            pricing: {
                label: '💰 Tabla de Precios',
                schema: fields.object({
                    content: pricingPreview(),
                })
            },
            content: {
                label: '📝 Bloque de Texto y MDX',
                schema: fields.object({
                    title: fields.text({ label: 'Título del bloque de texto' }),
                    showSidebar: fields.checkbox({ label: 'Mostrar Sidebar de Contacto', defaultValue: true }),
                })
            },
            faq: {
                label: '❓ Preguntas Frecuentes',
                schema: fields.object({
                    title: fields.text({ label: 'Título Sección FAQ' }),
                    faqs: fields.array(
                        fields.object({
                            question: fields.text({ label: 'Pregunta' }),
                            answer: fields.text({ label: 'Respuesta', multiline: true }),
                        }),
                        {
                            label: 'Preguntas',
                            itemLabel: (props) => props.fields.question.value || 'Pregunta',
                        }
                    )
                })
            }
        }, {
            label: 'Constructor Visual de Página',
            description: 'Añade y ordena los bloques que compondrán la página de este servicio.'
        }),

        content: fields.mdx({
            label: 'Cuerpo del Texto (MDX)',
            description: 'Utilizado por el bloque "Contenido y MDX"',
            options: {
                image: {
                    directory: 'public/images/services',
                    publicPath: '/images/services',
                }
            },
            components: mdxComponentsConfig
        }),
    },
});
