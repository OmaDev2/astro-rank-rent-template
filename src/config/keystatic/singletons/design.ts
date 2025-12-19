import { ThemeManager } from "../../../components/keystatic/ThemeManager";
import { fields, singleton } from '@keystatic/core';

export const design = singleton({
    label: '🎨 Diseño y Tema',
    path: 'src/content/design/global',
    schema: {

        // WAIT: The previous ColorPicker implementation returned BasicFormField<string> and was assigned to fields.object keys.
        // Here we want to assign directly to a key.
        // Let's redefine:

        themeSettings: ThemeManager({
            label: 'Gestor de Tema',
            description: 'Elige un tema para cargar sus colores, o edítalos libremente.'
        }),

        heroOverlayOpacity: fields.number({
            label: 'Opacidad del Hero (Fondo Oscuro)',
            description: '0.0 (Transparente) a 1.0 (Totalmente negro). Recomendado: 0.6',
            validation: { min: 0, max: 1 },
            defaultValue: 0.6,
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
