/**
 * Convierte un color HEX (#RRGGBB) a formato RGB puros de Tailwind (R G B)
 * Esto es necesario porque nuestra configuración de Tailwind usa <alpha-value>
 * @example hexToRgb('#ef4444') -> '239 68 68'
 */
export function hexToRgb(hex: string): string {
    if (!hex) return '';

    // Eliminar #
    hex = hex.replace('#', '');

    // Parsear
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r} ${g} ${b}`;
}

export function getThemeColors(activeTheme: any, customColors: any) {
    // Si el tema no es "custom", devolvemos los colores del preset
    if (activeTheme && activeTheme.colors) {
        return activeTheme.colors;
    }

    // Si es custom, intentamos usar los overrides
    if (customColors && customColors.primary) {
        return {
            primary: hexToRgb(customColors.primary),
            secondary: hexToRgb(customColors.secondary),
            surface: hexToRgb(customColors.surface),
            accent: hexToRgb(customColors.accent),
            textMain: hexToRgb(customColors.textMain),
            textMuted: hexToRgb(customColors.textMuted),
        };
    }

    // Fallback: Devolver industrial si algo falla
    return {
        primary: '217 119 6',   // Amber 600
        secondary: '15 23 42',  // Slate 900
        surface: '30 41 59',    // Slate 800
        accent: '234 179 8',    // Yellow 500
        textMain: '255 255 255',
        textMuted: '148 163 184',
    };
}
