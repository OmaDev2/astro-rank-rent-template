import { FieldPrimitive } from "@keystar/ui/field";
import { Grid } from "@keystar/ui/layout";
import { Text } from "@keystar/ui/typography";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useState } from "react";
import { themes } from "../../config/themes";

function parseAsJsonField(value: FormFieldStoredValue) {
    if (value === undefined) return null;
    if (typeof value !== "string") throw new Error("Must be a string");
    try { return JSON.parse(value); } catch { return null; }
}

function rgbStringToHex(rgbStr: string): string {
    if (!rgbStr || rgbStr.startsWith('#')) return rgbStr || '#000000';
    const [r, g, b] = rgbStr.split(' ').map(Number);
    const toHex = (n: number) => Math.max(0, Math.min(255, n || 0)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgbString(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
}

// ---- Sub-components ----

const ColorSwatch = ({ color, size = 20 }: { color: string; size?: number }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        background: color, border: '1.5px solid rgba(0,0,0,0.12)',
        flexShrink: 0,
    }} />
);

const ThemeCard = ({
    themeKey, theme, isSelected, onClick
}: { themeKey: string; theme: typeof themes[keyof typeof themes]; isSelected: boolean; onClick: () => void }) => {
    const colors = Object.values(theme.colors).slice(0, 5).map(rgbStringToHex);
    const [primary, secondary, surface] = colors;

    return (
        <div
            onClick={onClick}
            title={theme.label}
            style={{
                cursor: 'pointer',
                border: isSelected ? '2.5px solid #6366f1' : '2px solid #e2e8f0',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                transition: 'all 0.15s',
                background: '#fff',
                position: 'relative',
            }}
        >
            {/* Mini preview strip */}
            <div style={{ background: secondary, height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0 8px' }}>
                <div style={{ background: primary, borderRadius: '3px', height: '16px', width: '32px' }} />
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '3px', height: '10px', width: '20px' }} />
            </div>
            {/* Color dots */}
            <div style={{ display: 'flex', gap: '4px', padding: '8px 8px 4px' }}>
                {colors.map((c, i) => <ColorSwatch key={i} color={c} size={14} />)}
            </div>
            {/* Label */}
            <div style={{ padding: '2px 8px 8px', fontSize: '10px', fontWeight: isSelected ? '700' : '500', color: '#374151', lineHeight: 1.3 }}>
                {theme.label}
            </div>
            {/* Selected checkmark */}
            {isSelected && (
                <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: '#6366f1', borderRadius: '50%',
                    width: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', color: '#fff',
                }}>✓</div>
            )}
        </div>
    );
};

const LivePreview = ({ colors }: { colors: Record<string, string> }) => {
    const primary = colors?.primary || '#d97706';
    const secondary = colors?.secondary || '#0f172a';
    const surface = colors?.surface || '#1e293b';
    const textMain = colors?.textMain || '#ffffff';
    const textMuted = colors?.textMuted || '#94a3b8';
    const accent = colors?.accent || '#eab308';

    return (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', fontSize: '11px' }}>
            {/* Header */}
            <div style={{ background: secondary, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: primary }} />
                    <span style={{ color: textMain, fontWeight: '700', fontSize: '11px' }}>Mi Negocio</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Servicios', 'Proyectos', 'Contacto'].map(item => (
                        <span key={item} style={{ color: textMuted, fontSize: '9px' }}>{item}</span>
                    ))}
                    <div style={{ background: primary, color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '700' }}>
                        Llamar
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div style={{ background: secondary, padding: '16px 12px', textAlign: 'center', borderBottom: `2px solid ${primary}` }}>
                <div style={{ color: textMain, fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                    Expertos en <span style={{ color: primary }}>Reformas</span>
                </div>
                <div style={{ color: textMuted, fontSize: '9px', marginBottom: '10px' }}>
                    Presupuesto gratuito en 24 horas · Sin compromiso
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <div style={{ background: primary, color: '#fff', padding: '5px 12px', borderRadius: '5px', fontSize: '9px', fontWeight: '700' }}>
                        Pedir Presupuesto
                    </div>
                    <div style={{ border: `1px solid ${textMuted}`, color: textMain, padding: '5px 12px', borderRadius: '5px', fontSize: '9px' }}>
                        Ver Proyectos
                    </div>
                </div>
            </div>

            {/* Cards row */}
            <div style={{ background: secondary, padding: '8px 12px 12px', display: 'flex', gap: '6px' }}>
                {['Reformas', 'Electricidad', 'Pintura'].map((svc, i) => (
                    <div key={svc} style={{
                        flex: 1, background: surface, borderRadius: '6px', padding: '8px 6px',
                        border: i === 0 ? `1px solid ${primary}30` : '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ color: primary, fontSize: '10px', marginBottom: '2px' }}>●</div>
                        <div style={{ color: textMain, fontWeight: '700', fontSize: '9px', marginBottom: '2px' }}>{svc}</div>
                        <div style={{ color: textMuted, fontSize: '8px' }}>Servicio profesional</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ColorItem = ({ label, color, onChange }: { label: string; color: string; onChange: (val: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ColorSwatch color={color} size={16} />
            <Text size="small" weight="bold">{label}</Text>
        </div>
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', height: '100px' }} />
        <HexColorInput
            color={color}
            onChange={onChange}
            prefixed
            style={{
                width: '100%', padding: '6px', border: '1px solid #e2e8f0',
                borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px',
                boxSizing: 'border-box',
            }}
        />
    </div>
);

// ---- Main Component ----

export function ThemeManager({
    label, description,
}: { label: string; description?: string; }): BasicFormField<string> {
    return {
        kind: "form",
        formKind: undefined,
        label,
        Input(props) {
            const [localState, setLocalState] = useState(() => {
                let initialState: any;
                if (props.value) {
                    try { initialState = JSON.parse(props.value); } catch {}
                }
                if (!initialState) {
                    initialState = { theme: 'industrial', colors: {} };
                }
                // Normalize colors to HEX
                if (initialState.colors) {
                    const normalized: any = {};
                    for (const [key, val] of Object.entries(initialState.colors)) {
                        normalized[key] = rgbStringToHex(val as string);
                    }
                    initialState.colors = normalized;
                }
                // Fill any missing colors from preset
                const preset = themes[initialState.theme as keyof typeof themes] || themes.industrial;
                const filledColors: any = {};
                for (const [key, val] of Object.entries(preset.colors)) {
                    filledColors[key] = initialState.colors?.[key] || rgbStringToHex(val);
                }
                initialState.colors = { ...filledColors, ...initialState.colors };
                return initialState;
            });

            const [showColorPickers, setShowColorPickers] = useState(false);

            const updateState = (newState: any) => {
                setLocalState(newState);
                props.onChange(JSON.stringify(newState));
            };

            const handleThemeChange = (themeKey: string) => {
                const preset = themes[themeKey as keyof typeof themes];
                if (preset) {
                    const hexColors: any = {};
                    Object.entries(preset.colors).forEach(([k, v]) => {
                        hexColors[k] = rgbStringToHex(v);
                    });
                    updateState({ theme: themeKey, colors: hexColors });
                } else {
                    updateState({ ...localState, theme: themeKey });
                }
            };

            const handleColorChange = (key: string, val: string) => {
                updateState({ ...localState, colors: { ...localState.colors, [key]: val } });
            };

            const colorLabels: Record<string, string> = {
                primary: 'Primario (Botones, Links)',
                secondary: 'Secundario (Fondo Principal)',
                surface: 'Superficie (Tarjetas)',
                accent: 'Acento (Detalles)',
                textMain: 'Texto Principal',
                textMuted: 'Texto Secundario',
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* THEME GRID */}
                        <div>
                            <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                Elige una base de colores:
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: '8px',
                            }}>
                                {Object.entries(themes).map(([key, theme]) => (
                                    <ThemeCard
                                        key={key}
                                        themeKey={key}
                                        theme={theme}
                                        isSelected={localState.theme === key}
                                        onClick={() => handleThemeChange(key)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* LIVE PREVIEW */}
                        <div>
                            <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                Previsualización:
                            </div>
                            <LivePreview colors={localState.colors || {}} />
                        </div>

                        {/* COLOR PALETTE STRIP */}
                        <div>
                            <div style={{
                                display: 'flex', gap: '6px', alignItems: 'center',
                                padding: '10px 12px', background: '#f8fafc', borderRadius: '8px',
                                border: '1px solid #e2e8f0', flexWrap: 'wrap',
                            }}>
                                <span style={{ fontSize: '11px', color: '#6b7280', marginRight: '4px', fontWeight: '600' }}>Paleta:</span>
                                {Object.entries(localState.colors || {}).map(([key, color]) => (
                                    <div key={key} title={colorLabels[key] || key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <ColorSwatch color={color as string} size={18} />
                                        <span style={{ fontSize: '9px', color: '#9ca3af' }}>{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FINE-TUNE COLORS (collapsible) */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <button
                                type="button"
                                onClick={() => setShowColorPickers(!showColorPickers)}
                                style={{
                                    width: '100%', padding: '12px 16px', background: '#f8fafc',
                                    border: 'none', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between',
                                    fontSize: '13px', fontWeight: '600', color: '#374151',
                                }}
                            >
                                <span>🎨 Ajuste fino de colores</span>
                                <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {showColorPickers ? '▲ Ocultar' : '▼ Mostrar'}
                                </span>
                            </button>
                            {showColorPickers && (
                                <div style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>
                                        Personaliza los colores individualmente. Los cambios se aplican en tiempo real.
                                    </div>
                                    <Grid gap="large" columns="repeat(auto-fit, minmax(180px, 1fr))">
                                        {Object.entries(colorLabels).map(([key, lbl]) => (
                                            <ColorItem
                                                key={key}
                                                label={lbl}
                                                color={localState.colors?.[key] || '#000000'}
                                                onChange={(v) => handleColorChange(key, v)}
                                            />
                                        ))}
                                    </Grid>
                                </div>
                            )}
                        </div>

                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() {
            return JSON.stringify({ theme: 'industrial', colors: themes.industrial.colors });
        },
        parse(value) { return (value as string) || ""; },
        serialize(value) { return { value: value }; },
        validate(value) { return value; },
        reader: {
            parse(value) { return (value as string) || ""; },
        },
    };
}
