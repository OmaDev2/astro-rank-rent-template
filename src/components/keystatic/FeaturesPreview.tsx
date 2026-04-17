import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';
import { IconPickerUI } from './IconPicker';
import * as LucideIcons from 'lucide-react';

type FeatureItem = { title: string; description: string; icon: string };
type FeaturesState = { title: string; features: FeatureItem[]; titleTag: 'h1' | 'h2' | 'h3' };

const DEFAULTS: FeaturesState = {
    title: 'Por Qué Elegirnos',
    features: [
        { title: 'Experiencia', description: 'Más de 15 años en el sector.', icon: 'Award' },
        { title: 'Calidad', description: 'Acabados perfectos garantizados.', icon: 'ShieldCheck' },
        { title: 'Rapidez', description: 'Cumplimos con todos los plazos.', icon: 'Clock' },
        { title: 'Limpieza', description: 'Dejamos todo impecable.', icon: 'Sparkles' },
    ],
    titleTag: 'h2'
};

// Helper para renderizar el icono de Lucide si existe
const IconRenderer = ({ name, color, size = 24 }: { name: string, color: string, size?: number }) => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) return <Icon color={color} size={size} strokeWidth={1.5} />;
    return <div style={{ width: size, height: size, background: `${color}22`, borderRadius: '4px' }} />;
};

function FeaturesPreviewUI({ state }: { state: FeaturesState }) {
    const theme = getPreviewTheme();
    
    return (
        <div style={{
            background: theme.secondary,
            borderRadius: '12px 12px 0 0',
            padding: '40px',
            fontFamily: theme.fontBody,
            border: `1px solid ${theme.primary}33`,
            borderBottom: 'none'
        }}>
            <link rel="stylesheet" href={theme.googleFontsUrl} />
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
            </div>
            <h3 style={{ 
                margin: '0 0 32px', 
                color: theme.textMain, 
                fontSize: '28px', 
                fontWeight: 900, 
                textAlign: 'center',
                fontFamily: theme.fontHeading,
                textTransform: 'uppercase'
            }}>
                {state.title}
            </h3>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '24px' 
            }}>
                {state.features.map((f, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        gap: '16px',
                        background: `${theme.surface}44`,
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.primary}11`
                    }}>
                        <div style={{ 
                            background: `${theme.primary}15`, 
                            padding: '12px', 
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 'fit-content'
                        }}>
                            <IconRenderer name={f.icon} color={theme.primary} size={28} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 6px', color: theme.textMain, fontSize: '16px', fontWeight: 700 }}>{f.title}</h4>
                            <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px', lineHeight: 1.5 }}>{f.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FeaturesInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): FeaturesState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<FeaturesState>(() => parse(value));

    const update = (key: keyof FeaturesState, val: any) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updateFeature = (index: number, key: keyof FeatureItem, val: string) => {
        const nextFeatures = [...state.features];
        nextFeatures[index] = { ...nextFeatures[index], [key]: val };
        update('features', nextFeatures);
    };

    const addFeature = () => {
        update('features', [...state.features, { title: 'Nueva Ventaja', description: 'Detalle de la ventaja...', icon: 'CheckCircle' }]);
    };

    const removeFeature = (idx: number) => {
        update('features', state.features.filter((_, i) => i !== idx));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0',
        fontSize: '13px', width: '100%', boxSizing: 'border-box'
    };
    const sel: React.CSSProperties = {
        ...inp, cursor: 'pointer', appearance: 'none'
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="💎 Ventajas/Características (Vista Previa)">
            <div>
                <FeaturesPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            {lbl('Título Sección')}
                            <input style={inp} value={state.title} onChange={e => update('title', e.target.value)} />
                        </div>
                        <div>
                            {lbl('Etiqueta SEO (H2 recom.)')}
                            <select style={sel} value={state.titleTag} onChange={e => update('titleTag', e.target.value as any)}>
                                <option value="h1">H1 (Principal)</option>
                                <option value="h2">H2 (Secundario)</option>
                                <option value="h3">H3 (Terciario)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        {state.features.map((f, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '12px' }}>
                                    <input style={inp} placeholder="Título de la ventaja" value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)} />
                                    <button onClick={() => removeFeature(i)} style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444', borderRadius: '4px', padding: '0 10px', cursor: 'pointer', height: '35px' }}>×</button>
                                </div>
                                
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Elegir Icono Profesional</div>
                                    <IconPickerUI 
                                        value={f.icon} 
                                        onChange={v => updateFeature(i, 'icon', v)} 
                                    />
                                </div>

                                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} placeholder="Descripción detallada..." value={f.description} onChange={e => updateFeature(i, 'description', e.target.value)} />
                            </div>
                        ))}
                        <button onClick={addFeature} style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981', borderRadius: '6px', padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', marginTop: '10px' }}>+ Añadir Ventaja</button>
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function featuresPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Features Preview',
        Input({ value, onChange }) { return <FeaturesInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
