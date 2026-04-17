import { singleton, fields } from '@keystatic/core';
import { SeoPreview } from '../../../components/keystatic/SeoPreview';
import { heroPreview } from '../../../components/keystatic/HeroPreview';
import { statsPreview } from '../../../components/keystatic/StatsPreview';
import { ctaPreview } from '../../../components/keystatic/CtaPreview';

export const zonasPage = singleton({
    label: '📍 Página de Zonas (Listado)',
    path: 'src/content/pages/zonas',
    format: { contentField: 'content' },
    schema: {
        seoControls: fields.text({
            label: 'SEO Google Preview',
            multiline: true,
        }),
        content: fields.mdx({
            label: 'Introducción / Texto SEO',
            options: {
                image: {
                    directory: 'public/images/pages/zonas',
                    publicPath: '/images/pages/zonas',
                },
            },
        }),
        blocks: fields.blocks({
            hero: {
                label: '🖼️ Hero (Portada)',
                schema: fields.object({
                    content: heroPreview(),
                })
            },
            stats: {
                label: '📊 Números / Estadísticas',
                schema: fields.object({
                    content: statsPreview(),
                })
            },
            cta: {
                label: '🎯 Llamada a la Acción (CTA Final)',
                schema: fields.object({
                    content: ctaPreview(),
                })
            }
        }, {
            label: 'Bloques de la Página',
        })
    },
});
