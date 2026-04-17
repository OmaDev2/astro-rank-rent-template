/**
 * Pares de fuentes disponibles para el template.
 *
 * MODO GOOGLE FONTS (por defecto, activo en desarrollo y demo):
 *   Se usa `googleFontsUrl` → carga desde fonts.googleapis.com.
 *
 * MODO SELF-HOSTED (recomendado en producción, GDPR-compliant):
 *   1. Instala los dos paquetes del par elegido:
 *      npm install @fontsource/oswald @fontsource/inter   (ejemplo: par "modern")
 *   2. Añade las importaciones en src/styles/fonts-local.css:
 *      @import "@fontsource/oswald/400.css";
 *      @import "@fontsource/oswald/700.css";
 *      @import "@fontsource/inter/400.css";
 *      @import "@fontsource/inter/600.css";
 *   3. Importa ese archivo en Layout.astro (en lugar del <link> de Google Fonts):
 *      import "../styles/fonts-local.css";
 *
 *   El campo `fontsource` indica los nombres exactos de los paquetes a instalar.
 */

export const fontPairs = {
    modern: {
        label: 'Moderno (Oswald / Inter)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Oswald:wght@400;500;700',
        fontHeading: "'Oswald', sans-serif",
        fontBody: "'Inter', sans-serif",
        fontsource: ['@fontsource/oswald', '@fontsource/inter'],
        fontsourceImports: [
            '@fontsource/oswald/400.css',
            '@fontsource/oswald/700.css',
            '@fontsource/inter/400.css',
            '@fontsource/inter/600.css',
        ],
    },
    robust: {
        label: 'Robusto (Barlow / Roboto)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800&family=Roboto:wght@300;400;500',
        fontHeading: "'Barlow Condensed', sans-serif",
        fontBody: "'Roboto', sans-serif",
        fontsource: ['@fontsource/barlow-condensed', '@fontsource/roboto'],
        fontsourceImports: [
            '@fontsource/barlow-condensed/500.css',
            '@fontsource/barlow-condensed/700.css',
            '@fontsource/roboto/400.css',
            '@fontsource/roboto/500.css',
        ],
    },
    elegant: {
        label: 'Elegante (Playfair / Lato)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@500;700',
        fontHeading: "'Playfair Display', serif",
        fontBody: "'Lato', sans-serif",
        fontsource: ['@fontsource/playfair-display', '@fontsource/lato'],
        fontsourceImports: [
            '@fontsource/playfair-display/500.css',
            '@fontsource/playfair-display/700.css',
            '@fontsource/lato/400.css',
            '@fontsource/lato/700.css',
        ],
    },
    friendly: {
        label: 'Amigable (Nunito / Open Sans)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@600;800&family=Open+Sans:wght@400;600',
        fontHeading: "'Nunito', sans-serif",
        fontBody: "'Open Sans', sans-serif",
        fontsource: ['@fontsource/nunito', '@fontsource/open-sans'],
        fontsourceImports: [
            '@fontsource/nunito/600.css',
            '@fontsource/nunito/800.css',
            '@fontsource/open-sans/400.css',
            '@fontsource/open-sans/600.css',
        ],
    },
    tech: {
        label: 'Tech (Chakra Petch / Exo 2)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Exo+2:wght@300;400;600',
        fontHeading: "'Chakra Petch', sans-serif",
        fontBody: "'Exo 2', sans-serif",
        fontsource: ['@fontsource/chakra-petch', '@fontsource/exo-2'],
        fontsourceImports: [
            '@fontsource/chakra-petch/500.css',
            '@fontsource/chakra-petch/700.css',
            '@fontsource/exo-2/400.css',
            '@fontsource/exo-2/600.css',
        ],
    },
    artisan_warm: {
        label: 'Artesano Cálido (Merriweather / Lora)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Lora:wght@400;500;600',
        fontHeading: "'Merriweather', serif",
        fontBody: "'Lora', serif",
        fontsource: ['@fontsource/merriweather', '@fontsource/lora'],
        fontsourceImports: [
            '@fontsource/merriweather/700.css',
            '@fontsource/merriweather/900.css',
            '@fontsource/lora/400.css',
            '@fontsource/lora/500.css',
        ],
    },
    artisan_natural: {
        label: 'Artesano Natural (Crimson Text / Source Serif)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600;700&family=Source+Serif+4:wght@400;500;600',
        fontHeading: "'Crimson Text', serif",
        fontBody: "'Source Serif 4', serif",
        fontsource: ['@fontsource/crimson-text', '@fontsource/source-serif-4'],
        fontsourceImports: [
            '@fontsource/crimson-text/600.css',
            '@fontsource/crimson-text/700.css',
            '@fontsource/source-serif-4/400.css',
            '@fontsource/source-serif-4/500.css',
        ],
    },
    artisan_classic: {
        label: 'Artesano Clásico (Cormorant / EB Garamond)',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@600;700&family=EB+Garamond:wght@400;500;600',
        fontHeading: "'Cormorant', serif",
        fontBody: "'EB Garamond', serif",
        fontsource: ['@fontsource/cormorant', '@fontsource/eb-garamond'],
        fontsourceImports: [
            '@fontsource/cormorant/600.css',
            '@fontsource/cormorant/700.css',
            '@fontsource/eb-garamond/400.css',
            '@fontsource/eb-garamond/500.css',
        ],
    },
};
