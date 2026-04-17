import { fontPairs } from '../../config/fonts';

// NOTA: Importamos directamente el YAML del diseño. 
// Vite (procesador de Keystatic) lo convertirá en un objeto JS automáticamente.
// @ts-ignore
import designData from '../../content/design/global.yaml';

export type PreviewTheme = {
    primary: string;
    secondary: string;
    surface: string;
    accent: string;
    textMain: string;
    textMuted: string;
    fontHeading: string;
    fontBody: string;
    googleFontsUrl: string;
};

const DEFAULT_COLORS = {
    primary: '#ef4444',
    secondary: '#0f172a',
    surface: '#1e293b',
    accent: '#f97316',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
};

export function getPreviewTheme(): PreviewTheme {
    let themeId = 'industrial';
    let colors = { ...DEFAULT_COLORS };
    let fontPairId = 'modern';

    try {
        if (designData) {
            // Parsear settings del tema
            if (designData.themeSettings) {
                const settings = typeof designData.themeSettings === 'string' 
                    ? JSON.parse(designData.themeSettings) 
                    : designData.themeSettings;
                
                themeId = settings.theme || themeId;
                if (settings.colors) {
                    colors = {
                        primary: settings.colors.primary || colors.primary,
                        secondary: settings.colors.secondary || colors.secondary,
                        surface: settings.colors.surface || colors.surface,
                        accent: settings.colors.accent || colors.accent,
                        textMain: settings.colors.textMain || colors.textMain,
                        textMuted: settings.colors.textMuted || colors.textMuted,
                    };
                }
            }
            // Parsear tipografía
            fontPairId = designData.fontPair || fontPairId;
        }
    } catch (e) {
        console.error("Error cargando tema para preview:", e);
    }

    const fontPair = fontPairs[fontPairId as keyof typeof fontPairs] || fontPairs.modern;

    return {
        ...colors,
        fontHeading: fontPair.fontHeading,
        fontBody: fontPair.fontBody,
        googleFontsUrl: fontPair.googleFontsUrl,
    };
}
