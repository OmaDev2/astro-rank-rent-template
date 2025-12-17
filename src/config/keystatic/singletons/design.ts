import { fields, singleton } from '@keystatic/core';

export const design = singleton({
    label: 'Diseño y Tema',
    path: 'src/content/design/global',
    schema: {
        theme: fields.select({
            label: 'Tema de Color',
            description: 'Paleta de colores para toda la web',
            options: [
                { label: 'Industrial (Naranja)', value: 'industrial' },
                { label: 'Corporativo (Azul)', value: 'corporate' },
                { label: 'Naturaleza (Verde)', value: 'nature' },
                { label: 'Urgencia (Rojo)', value: 'urgent' },
                { label: 'Legal (Navy/Oro)', value: 'legal' },
                { label: 'Salud (Turquesa)', value: 'health' },
                { label: 'Lujo (Negro/Oro)', value: 'luxury' },
                { label: 'Estética (Rosa)', value: 'beauty' },
                { label: 'Tech (Violeta)', value: 'tech' },
                { label: 'Clean (Claro/Minimal)', value: 'clean_light' },
                { label: '🏺 Arcilla y Papel (Artesano Cálido)', value: 'clay_paper' },
                { label: '🌿 Bosque y Piedra (Artesano Natural)', value: 'forest_stone' },
                { label: '💎 Taller Clásico (Artesano Premium)', value: 'classic_workshop' },
            ],
            defaultValue: 'industrial',
        }),
        fontPair: fields.select({
            label: 'Tipografía (Fuentes)',
            description: 'Pareja de fuentes para Títulos y Texto',
            options: [
                { label: 'Moderno (Oswald / Inter)', value: 'modern' },
                { label: 'Robusto (Barlow / Roboto)', value: 'robust' },
                { label: 'Elegante (Playfair / Lato)', value: 'elegant' },
                { label: 'Amigable (Nunito / Open Sans)', value: 'friendly' },
                { label: 'Tech (Chakra Petch / Exo 2)', value: 'tech' },
                { label: '🏺 Artesano Cálido (Merriweather / Lora)', value: 'artisan_warm' },
                { label: '🌿 Artesano Natural (Crimson Text / Source Serif)', value: 'artisan_natural' },
                { label: '💎 Artesano Clásico (Cormorant / EB Garamond)', value: 'artisan_classic' },
            ],
            defaultValue: 'modern',
        }),
    },
});
