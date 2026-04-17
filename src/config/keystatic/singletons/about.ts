import { fields, singleton } from '@keystatic/core';
import { IconPicker } from '../../../components/keystatic/IconPicker';
import { mdxComponentsConfig } from '../mdx-components';

export const about = singleton({
    label: '👥 Sobre Nosotros',
    path: 'src/content/about/index',
    format: { data: 'json' },
    schema: {
        // Hero Section
        hero: fields.object({
            title: fields.text({ label: 'Título Hero', defaultValue: 'Sobre Nosotros' }),
            description: fields.text({ label: 'Descripción Hero', defaultValue: 'Profesionales comprometidos con la calidad, la seguridad y la satisfacción del cliente.', multiline: true }),
            image: fields.image({
                label: 'Imagen de Fondo Hero',
                directory: 'public/images/about',
                publicPath: '/images/about/'
            }),
        }, { label: 'Hero Principal' }),

        // Main Image & Stats Label
        mainImage: fields.object({
            image: fields.image({
                label: 'Imagen Principal',
                directory: 'public/images/about',
                publicPath: '/images/about/'
            }),
            experienceBadge: fields.text({ label: 'Etiqueta de Experiencia (ej: +15 Años)', defaultValue: '+15 Años' }),
        }, { label: 'Imagen Destacada' }),

        // History Section
        history: fields.object({
            subtitle: fields.text({ label: 'Subtítulo', defaultValue: 'Nuestra Historia' }),
            title: fields.text({ label: 'Título Principal', defaultValue: 'Profesional desde 2010' }),
            content: fields.mdx({
                label: 'Contenido de Historia',
                options: {
                    image: false,
                },
                components: mdxComponentsConfig
            }),
            stats: fields.array(
                fields.object({
                    value: fields.text({ label: 'Valor (ej: 500+)' }),
                    label: fields.text({ label: 'Etiqueta (ej: Proyectos)' }),
                }),
                {
                    label: 'Estadísticas',
                    itemLabel: (props) => `${props.fields.value.value} - ${props.fields.label.value}`,
                }
            ),
        }, { label: 'Sección Historia' }),

        // Values Section
        values: fields.object({
            title: fields.text({ label: 'Título Valores', defaultValue: 'Nuestros Valores' }),
            description: fields.text({ label: 'Descripción Valores', defaultValue: 'Los principios que guían nuestro trabajo cada día' }),
            items: fields.array(
                fields.object({
                    icon: IconPicker({ label: 'Icono', defaultValue: 'Shield' }),
                    title: fields.text({ label: 'Título' }),
                    description: fields.text({ label: 'Descripción', multiline: true }),
                }),
                {
                    label: 'Lista de Valores',
                    itemLabel: (props) => props.fields.title.value,
                }
            )
        }, { label: 'Sección Valores' }),

        // Why Choose Us Section
        whyChooseUs: fields.object({
            title: fields.text({ label: 'Título', defaultValue: '¿Por Qué Elegirnos?' }),
            items: fields.array(
                fields.object({
                    title: fields.text({ label: 'Título' }),
                    description: fields.text({ label: 'Descripción', multiline: true }),
                }),
                {
                    label: 'Razones',
                    itemLabel: (props) => props.fields.title.value,
                }
            )
        }, { label: 'Sección Por Qué Elegirnos' }),

        // Team Section
        team: fields.object({
            title: fields.text({ label: 'Título Equipo', defaultValue: 'Equipo Profesional' }),
            description: fields.text({ label: 'Descripción Equipo', multiline: true, defaultValue: 'Nuestro equipo está formado por técnicos certificados y con años de experiencia.' }),
        }, { label: 'Sección Equipo' }),

        seo: fields.object({
            title: fields.text({ label: 'Título SEO' }),
            description: fields.text({ label: 'Descripción SEO', multiline: true }),
        }, { label: 'SEO Config' }),
    },
});
