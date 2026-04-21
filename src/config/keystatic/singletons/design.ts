import { ThemeManager } from "../../../components/keystatic/ThemeManager";
import { FontPicker } from "../../../components/keystatic/FontPicker";
import { RadiusPicker } from "../../../components/keystatic/RadiusPicker";
import { ButtonStylePicker } from "../../../components/keystatic/ButtonStylePicker";
import { TypographyScalePicker } from "../../../components/keystatic/TypographyScalePicker";
import { ShadowPicker } from "../../../components/keystatic/ShadowPicker";
import { SpacingPicker } from "../../../components/keystatic/SpacingPicker";
import { AnimationPicker } from "../../../components/keystatic/AnimationPicker";
import { NavbarStylePicker } from "../../../components/keystatic/NavbarStylePicker";
import { DividerPicker } from "../../../components/keystatic/DividerPicker";
import { TexturePicker } from "../../../components/keystatic/TexturePicker";
import { HeroStylePicker } from "../../../components/keystatic/HeroStylePicker";
import { HeadingStylePicker } from "../../../components/keystatic/HeadingStylePicker";
import { fields, singleton } from '@keystatic/core';

export const design = singleton({
    label: '🎨 Diseño y Tema',
    path: 'src/content/design/global',
    format: { data: 'yaml' },
    schema: {
        identity: fields.object({
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
        }, { label: '🖌️ Identidad Visual' }),

        layout: fields.object({
            navbarStyle: NavbarStylePicker({
                label: 'Estilo del Menú de Navegación',
                description: 'Aspecto visual de la barra de navegación.',
            }),
            footerStyle: fields.select({
                label: 'Estilo del Footer',
                options: [
                    { label: 'Completo (4 Columnas SEO)', value: 'full' },
                    { label: 'Simple (Solo Legales)', value: 'simple' },
                ],
                defaultValue: 'full',
            }),
            heroStyle: HeroStylePicker({
                label: 'Estilo del Hero',
                description: 'Layout del bloque principal de cada página.',
            }),
            headingStyle: HeadingStylePicker({
                label: 'Tratamiento de Títulos',
                description: 'Estilo visual de los encabezados h1/h2 en toda la web.',
            }),
            sectionSpacing: SpacingPicker({
                label: 'Espaciado entre Secciones',
                description: 'Controla el padding vertical de todas las secciones de la página.',
            }),
        }, { label: '📐 Estructura y Layout' }),

        effects: fields.object({
            borderRadius: RadiusPicker({
                label: 'Esquinas',
                description: 'Controla la redondez de tarjetas y botones. Afecta a todo el sitio.',
            }),
            buttonStyle: ButtonStylePicker({
                label: 'Estilo de Botón Principal',
                description: 'Aspecto de los botones CTA (llamar, presupuesto, etc.).',
            }),
            shadowStyle: ShadowPicker({
                label: 'Sombras / Elevación',
                description: 'Profundidad visual de tarjetas y elementos elevados.',
            }),
            heroOverlayOpacity: fields.number({
                label: 'Opacidad del Hero (Fondo Oscuro)',
                description: '0.0 (Transparente) a 1.0 (Totalmente negro). Recomendado: 0.6',
                validation: { min: 0, max: 1 },
                defaultValue: 0.6,
            }),
            animationStyle: AnimationPicker({
                label: 'Animaciones de Scroll',
                description: 'Controla los efectos de entrada de las secciones al hacer scroll.',
            }),
            sectionDivider: DividerPicker({
                label: 'Separadores de Sección',
                description: 'Forma del borde superior entre secciones.',
            }),
            bgTexture: TexturePicker({
                label: 'Textura de Fondo',
                description: 'Patrón sutil superpuesto en los fondos de sección.',
            }),
        }, { label: '✨ Efectos e Interactividad' }),

        contact: fields.object({
            stickyPhoneMobile: fields.checkbox({
                label: 'Teléfono flotante en móvil',
                description: 'Muestra el botón de llamada flotante en pantallas pequeñas.',
                defaultValue: true,
            }),
            stickyPhoneDesktop: fields.checkbox({
                label: 'Teléfono flotante en escritorio',
                description: 'Muestra el botón de llamada flotante en pantallas grandes.',
                defaultValue: false,
            }),
            whatsappMobile: fields.checkbox({
                label: 'WhatsApp flotante en móvil',
                description: 'Muestra el botón de WhatsApp flotante en pantallas pequeñas.',
                defaultValue: true,
            }),
            whatsappDesktop: fields.checkbox({
                label: 'WhatsApp flotante en escritorio',
                description: 'Muestra el botón de WhatsApp flotante en pantallas grandes.',
                defaultValue: true,
            }),
        }, { label: '📞 Botones de Contacto Flotantes' }),

        advanced: fields.object({
            favicon: fields.image({
                label: 'Favicon del Sitio',
                description: 'Icono que aparece en la pestaña del navegador. Recomendado: 512x512 PNG, ICO o SVG.',
                directory: 'public/favicons',
                publicPath: '/favicons/',
            }),
            themeColor: fields.text({
                label: 'Color Barra Móvil (Theme-Color)',
                description: 'Color hex (ej: #dc2626). Si está vacío, usa el color primario del tema.',
            }),
            customCss: fields.text({
                label: 'Custom CSS Global',
                description: 'Añade reglas CSS personalizadas. Ejemplo: .btn { text-transform: uppercase; }',
                multiline: true,
            }),
        }, { label: '🛠️ Ajustes Avanzados' }),
    },
});
