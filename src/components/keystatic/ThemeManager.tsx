import { FieldPrimitive } from "@keystar/ui/field";
import { Item } from "@react-stately/collections";
import { Picker } from "@keystar/ui/picker";
import { Grid } from "@keystar/ui/layout";
import { Text } from "@keystar/ui/typography";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { themes } from "../../config/themes";

// Utilities
function parseAsJsonField(value: FormFieldStoredValue) {
    if (value === undefined) return null;
    if (typeof value !== "string") throw new Error("Must be a string");
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

// Sub-component for individual color
const ColorItem = ({ label, color, onChange }: { label: string, color: string, onChange: (val: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Text size="small" weight="bold">{label}</Text>
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', height: '120px' }} />
        <HexColorInput
            color={color}
            onChange={onChange}
            prefixed
            style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
            }}
        />
    </div>
);

// Helper to convert "255 255 255" to "#ffffff"
function rgbStringToHex(rgbStr: string): string {
    if (!rgbStr || rgbStr.startsWith('#')) return rgbStr || '#000000';
    const [r, g, b] = rgbStr.split(' ').map(Number);
    const toHex = (n: number) => {
        const hex = Math.max(0, Math.min(255, n || 0)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function ThemeManager({
    label,
    description,
}: {
    label: string;
    description?: string;
}): BasicFormField<string> {
    return {
        kind: "form",
        formKind: undefined,
        label,
        Input(props) {
            // State initialization
            const [localState, setLocalState] = useState(() => {
                let initialState;
                if (props.value) {
                    try {
                        initialState = JSON.parse(props.value);
                    } catch (e) {
                        console.error('Error parsing theme state', e);
                    }
                }

                if (!initialState) {
                    initialState = {
                        theme: 'industrial',
                        colors: themes.industrial.colors
                    };
                }

                // Normalización: Asegurar que todos los colores sean HEX
                if (initialState.colors) {
                    const normalizedColors: any = {};
                    for (const [key, val] of Object.entries(initialState.colors)) {
                        normalizedColors[key] = rgbStringToHex(val as string);
                    }
                    initialState.colors = normalizedColors;
                }

                return initialState;
            });

            // Updater helper
            const updateState = (newState: any) => {
                setLocalState(newState);
                props.onChange(JSON.stringify(newState));
            };

            // Handle Theme Change
            const handleThemeChange = (newTheme: string) => {
                // Find preset colors
                const preset = themes[newTheme as keyof typeof themes];

                if (preset) {
                    // Convertir los colores del preset (que están en formato RGB space-separated) a HEX
                    const hexColors: any = {};
                    Object.entries(preset.colors).forEach(([k, v]) => {
                        hexColors[k] = rgbStringToHex(v);
                    });

                    // AUTO-HYDRATE: If valid theme, load its colors
                    updateState({
                        theme: newTheme,
                        colors: hexColors
                    });
                } else {
                    // Custom or unknown: just update the theme key, keep current colors
                    updateState({
                        ...localState,
                        theme: newTheme
                    });
                }
            };

            // Handle Color Change
            const handleColorChange = (key: string, val: string) => {
                const newColors = { ...localState.colors, [key]: val };

                // If we edit a color, we are technically "drifting" from the preset.
                // Optionally we could auto-switch theme to 'custom' here, but
                // usually users prefer to keep the label 'Industrial' active while tweaking it.
                // Let's just update the colors.

                updateState({
                    ...localState,
                    colors: newColors
                });
            };

            // Options for Select
            const themeOptions = [
                { label: '✨ Personalizado (Base Industrial)', value: 'custom' },
                ...Object.entries(themes).map(([key, val]) => ({
                    label: val.label,
                    value: key
                }))
            ];

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>

                        {/* THEME SELECTOR */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Text weight="bold">Selecciona una Base:</Text>
                            <Picker
                                label="Selecciona una Base:"
                                onSelectionChange={(k) => handleThemeChange(k as string)}
                                selectedKey={localState.theme}
                            >
                                {themeOptions.map(opt => (
                                    <Item key={opt.value}>
                                        {opt.label}
                                    </Item>
                                ))}
                            </Picker>
                            <Text size="small" color="neutralTertiary">
                                Al cambiar el tema, los colores de abajo se actualizarán automáticamente.
                            </Text>
                        </div>

                        <hr style={{ borderColor: '#e2e8f0' }} />

                        {/* COLOR GRID */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Text weight="bold">Paleta de Colores (Editable):</Text>
                            <Grid gap="large" columns="repeat(auto-fit, minmax(200px, 1fr))">
                                <ColorItem
                                    label="Primario (Botones, Links)"
                                    color={localState.colors?.primary || '#000000'}
                                    onChange={(v) => handleColorChange('primary', v)}
                                />
                                <ColorItem
                                    label="Secundario (Fondos Oscuros)"
                                    color={localState.colors?.secondary || '#000000'}
                                    onChange={(v) => handleColorChange('secondary', v)}
                                />
                                <ColorItem
                                    label="Acento (Detalles)"
                                    color={localState.colors?.accent || '#000000'}
                                    onChange={(v) => handleColorChange('accent', v)}
                                />
                                <ColorItem
                                    label="Superficie (Tarjetas)"
                                    color={localState.colors?.surface || '#000000'}
                                    onChange={(v) => handleColorChange('surface', v)}
                                />
                                <ColorItem
                                    label="Texto Principal"
                                    color={localState.colors?.textMain || '#ffffff'}
                                    onChange={(v) => handleColorChange('textMain', v)}
                                />
                                <ColorItem
                                    label="Texto Secundario"
                                    color={localState.colors?.textMuted || '#94a3b8'}
                                    onChange={(v) => handleColorChange('textMuted', v)}
                                />
                            </Grid>
                        </div>
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() {
            // Default to Industrial
            return JSON.stringify({
                theme: 'industrial',
                colors: themes.industrial.colors
            });
        },
        parse(value) {
            return (value as string) || "";
        },
        serialize(value) {
            return { value: value };
        },
        validate(value) {
            return value;
        },
        reader: {
            parse(value) {
                return (value as string) || "";
            },
        },
    };
}
