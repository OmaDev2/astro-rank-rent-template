import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ── Color helpers ────────────────────────────────────────────────────────────

/** Convierte "R G B" o "#rrggbb" a "#rrggbb" para satori */
function toHex(color: string): string {
    if (!color) return '#6366f1';
    if (color.startsWith('#')) return color;
    const parts = color.split(' ').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
        return '#' + parts.map(n => n.toString(16).padStart(2, '0')).join('');
    }
    return '#6366f1';
}

/** Oscurece un hex color mezclándolo con negro */
function darken(hex: string, amount = 0.85): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `#${Math.round(r * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(g * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(b * (1 - amount)).toString(16).padStart(2, '0')}`;
}

// ── Font cache ────────────────────────────────────────────────────────────────

let _fontCache: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
    if (_fontCache) return _fontCache;
    try {
        // Inter Bold — fuente limpia y universal, GDPR-friendly desde bunny.net
        const res = await fetch('https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff');
        if (!res.ok) throw new Error('font fetch failed');
        _fontCache = await res.arrayBuffer();
    } catch {
        // Fallback: usar la fuente de respaldo de forma segura
        const res = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2');
        _fontCache = await res.arrayBuffer();
    }
    return _fontCache;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type OgVariant = 'accent-left' | 'badge-top' | 'frame';

export interface OgOptions {
    title: string;
    subtitle?: string;
    label?: string;
    siteName?: string;
    primaryColor?: string;  // "R G B" o "#hex"
    secondaryColor?: string; // "R G B" o "#hex" — usado como fondo base
    variant?: OgVariant;    // si no se pasa, se elige por hash de siteName (estable por clon)
}

// Variante determinística por clon: mismo sitio → siempre la misma; clones distintos
// → layouts distintos (evita que todas las webs de la red tengan la OG idéntica).
const VARIANTS: OgVariant[] = ['accent-left', 'badge-top', 'frame'];
export function pickVariant(seed = ''): OgVariant {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return VARIANTS[h % VARIANTS.length];
}

// ── Generator ─────────────────────────────────────────────────────────────────

export async function generateOgImage(opts: OgOptions): Promise<ArrayBuffer> {
    const {
        title,
        subtitle,
        label,
        siteName = '',
        primaryColor = '99 102 241',
        secondaryColor = '10 10 10',
    } = opts;
    const variant = opts.variant || pickVariant(siteName || title);

    const primary = toHex(primaryColor);
    const bg = darken(toHex(secondaryColor), 0.7); // siempre oscuro
    const fontData = await getFont();

    // Tamaño de fuente adaptativo
    const titleSize = title.length > 40 ? 54 : title.length > 25 ? 64 : 76;

    // Piezas comunes a todas las variantes
    const labelEl = label && (
        <div style={{
            fontSize: '16px',
            color: variant === 'badge-top' ? '#ffffff' : primary,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            marginBottom: '14px',
            display: 'flex',
            fontWeight: 700,
            ...(variant === 'badge-top' ? {
                background: primary,
                padding: '8px 22px',
                borderRadius: '999px',
                letterSpacing: '3px',
            } : {}),
        }}>
            {label}
        </div>
    );
    const titleEl = (
        <div style={{
            fontSize: `${titleSize}px`,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: subtitle ? '20px' : '0',
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
            ...(variant === 'badge-top' ? { justifyContent: 'center', textAlign: 'center' } : {}),
        }}>
            {title}
        </div>
    );
    const subtitleEl = subtitle && (
        <div style={{
            fontSize: '26px',
            color: 'rgba(255,255,255,0.55)',
            display: 'flex',
            maxWidth: '700px',
            ...(variant === 'badge-top' ? { justifyContent: 'center', textAlign: 'center' } : {}),
        }}>
            {subtitle}
        </div>
    );
    const siteNameEl = siteName && (
        <div style={{
            position: 'absolute',
            bottom: '52px',
            ...(variant === 'badge-top' ? { left: '0', right: '0', justifyContent: 'center' } : { right: '88px' }),
            fontSize: '20px',
            color: 'rgba(255,255,255,0.35)',
            display: 'flex',
        }}>
            {siteName}
        </div>
    );

    // Decoración según variante
    const decoration =
        variant === 'accent-left' ? (
            <>
                <div style={{ position: 'absolute', right: '-120px', bottom: '-120px', width: '520px', height: '520px', borderRadius: '50%', background: primary, opacity: 0.08, display: 'flex' }} />
                <div style={{ position: 'absolute', right: '180px', top: '40px', width: '200px', height: '200px', borderRadius: '50%', background: primary, opacity: 0.06, display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px', background: primary, display: 'flex' }} />
            </>
        ) : variant === 'badge-top' ? (
            <>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '10px', background: primary, display: 'flex' }} />
                <div style={{ position: 'absolute', left: '-160px', bottom: '-160px', width: '420px', height: '420px', borderRadius: '50%', background: primary, opacity: 0.07, display: 'flex' }} />
                <div style={{ position: 'absolute', right: '-160px', top: '-160px', width: '420px', height: '420px', borderRadius: '50%', background: primary, opacity: 0.07, display: 'flex' }} />
            </>
        ) : (
            // frame: marco fino con acento en dos esquinas
            <>
                <div style={{ position: 'absolute', top: '32px', left: '32px', right: '32px', bottom: '32px', border: `2px solid ${primary}55`, borderRadius: '18px', display: 'flex' }} />
                <div style={{ position: 'absolute', top: '32px', left: '32px', width: '140px', height: '10px', background: primary, borderRadius: '4px', display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '140px', height: '10px', background: primary, borderRadius: '4px', display: 'flex' }} />
            </>
        );

    // Barra acento izquierda solo en accent-left
    const accentBar = variant === 'accent-left' && (
        <div style={{ width: '6px', height: '72px', background: primary, borderRadius: '3px', marginBottom: '28px', display: 'flex' }} />
    );

    const svg = await satori(
        <div
            style={{
                width: '1200px',
                height: '630px',
                background: bg,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: variant === 'badge-top' ? 'center' : 'flex-start',
                padding: variant === 'frame' ? '80px 104px' : '64px 88px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'Inter',
            }}
        >
            {decoration}
            {accentBar}
            {labelEl}
            {titleEl}
            {subtitleEl}
            {siteNameEl}
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
        }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();
    return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}
