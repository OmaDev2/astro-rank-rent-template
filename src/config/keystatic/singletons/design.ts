import { ThemeManager } from "../../../components/keystatic/ThemeManager";
import { FontPicker } from "../../../components/keystatic/FontPicker";
import { RadiusPicker } from "../../../components/keystatic/RadiusPicker";
import { ButtonStylePicker } from "../../../components/keystatic/ButtonStylePicker";
import { TypographyScalePicker } from "../../../components/keystatic/TypographyScalePicker";
import { ShadowPicker } from "../../../components/keystatic/ShadowPicker";
import { SpacingPicker } from "../../../components/keystatic/SpacingPicker";
import { fields, singleton } from '@keystatic/core';

export const design = singleton({
    label: '🎨 Diseño y Tema',
    path: 'src/content/design/global',
    format: { data: 'yaml' },
    schema: {
        themeSettings: ThemeManager({
            label: 'Colores del Tema',
            description: 'Elige una base visual y personaliza los colores de tu sitio.',
        }),

        fontPair: FontPicker({
            label: 'Tipografía (Fuentes)',
            description: 'Elige la pareja de fuentes. La previsualización muestra el aspecto real.',
        }),

        typographyScale: TypographyScalePicker({
            label: 'Escala Tipográfica',
            description: 'Ajusta el tamaño global de los encabezados y textos.',
        }),


        borderRadius: RadiusPicker({
            label: 'Esquinas',
            description: 'Controla la redondez de tarjetas y botones. Afecta a todo el sitio.',
        }),

        buttonStyle: ButtonStylePicker({
            label: 'Estilo de Botón Principal',
            description: 'Aspecto de los botones CTA (llamar, presupuesto, etc.).',
        }),

        heroOverlayOpacity: fields.number({
            label: 'Opacidad del Hero (Fondo Oscuro)',
            description: '0.0 (Transparente) a 1.0 (Totalmente negro). Recomendado: 0.6',
            validation: { min: 0, max: 1 },
            defaultValue: 0.6,
        }),

        shadowStyle: ShadowPicker({
            label: 'Sombras / Elevación',
            description: 'Profundidad visual de tarjetas y elementos elevados.',
        }),

        sectionSpacing: SpacingPicker({
            label: 'Espaciado entre Secciones',
            description: 'Controla el padding vertical de todas las secciones de la página.',
        }),
    },
});
