import { fontPairs } from '../../config/fonts';

// Importamos el YAML como string bruto para evitar problemas de compatibilidad con plugins de Vite
// @ts-ignore
import designYaml from '../../content/design/global.yaml?raw';

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
        if (designYaml) {
            const lines = designYaml.split('\n');
            
            // Extractor robusto para themeSettings (manejando >-)
            let themeSettingsRaw = '';
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('themeSettings:')) {
                    const inline = lines[i].split('themeSettings:')[1].trim();
                    if (inline && inline !== '>-') {
                        themeSettingsRaw = inline;
                    } else if (lines[i+1]) {
                        themeSettingsRaw = lines[i+1].trim();
                    }
                    break;
                }
            }

            if (themeSettingsRaw) {
                // Limpiar posibles comillas del YAML antes de parsear JSON
                const cleanJson = themeSettingsRaw.replace(/^['"]|['"]$/g, '');
                try {
                    const settings = JSON.parse(cleanJson);
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
                } catch(e) {}
            }

            // Extractor para fontPair
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('fontPair:')) {
                    fontPairId = lines[i].split('fontPair:')[1].trim().replace(/^['"]|['"]$/g, '');
                    break;
                }
            }
        }
    } catch (e) {
        console.error("Error procesando tema para preview:", e);
    }

    const fontPair = fontPairs[fontPairId as keyof typeof fontPairs] || fontPairs.modern;

    return {
        ...colors,
        fontHeading: fontPair.fontHeading,
        fontBody: fontPair.fontBody,
        googleFontsUrl: fontPair.googleFontsUrl,
    };
}
