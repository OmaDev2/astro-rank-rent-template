import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';

type CtaState = { title: string; subtitle: string; buttonText: string; buttonLink: string; features: string; style: 'red' | 'dark' | 'gradient' };

const DEFAULTS: CtaState = {
    title: '¿Listo para empezar?',
    subtitle: 'Consigue tu presupuesto gratuito hoy mismo.',
    buttonText: 'Pedir Presupuesto',
    buttonLink: '#contacto',
    features: 'Rápido\nSeguro\nProfesional',
    style: 'red'
};

function CtaPreviewUI({ state }: { state: CtaState }) {
    const theme = getPreviewTheme();
    const feats = state.features.split('\n').filter(Boolean);
    
    const bg = state.style === 'red' ? theme.primary : state.style === 'gradient' ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : theme.surface;
    const text = (state.style === 'red' || state.style === 'gradient') ? '#fff' : theme.textMain;

    return (
        <div style={{
            background: theme.secondary,
            borderRadius: '12px 12px 0 0',
            padding: '24px',
            fontFamily: theme.fontBody,
            border: `1px solid ${theme.primary}33`,
            borderBottom: 'none'
        }}>
            <link rel="stylesheet" href={theme.googleFontsUrl} />
            <div style={{ 
                background: bg, 
                borderRadius: '12px', 
                padding: '30px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ margin: '0 0 10px', color: text, fontSize: '22px', fontWeight: 800, fontFamily: theme.fontHeading }}>{state.title}</h3>
                <p style={{ margin: '0 0 20px', color: text, opacity: 0.8, fontSize: '14px' }}>{state.subtitle}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {feats.map((f, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: text }}>
                            ✓ {f}
                        </div>
                    ))}
                </div>

                <div style={{ 
                    display: 'inline-block', 
                    background: state.style === 'dark' ? theme.primary : '#fff', 
                    color: state.style === 'dark' ? '#fff' : theme.primary,
                    padding: '12px 24px', 
                    borderRadius: '8px', 
                    fontWeight: 800, 
                    fontSize: '14px' 
                }}>
                    {state.buttonText}
                </div>
            </div>
        </div>
    );
}

function CtaInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): CtaState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<CtaState>(() => parse(value));

    const update = (key: keyof CtaState, val: string) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0',
        fontSize: '12px', width: '100%', boxSizing: 'border-box'
    };

    return (
        <FieldPrimitive label="🎯 Llamada a la Acción (Preview)">
            <CtaPreviewUI state={state} />
            <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input style={{...inp, gridColumn: '1/-1'}} placeholder="Título" value={state.title} onChange={e => update('title', e.target.value)} />
                <input style={{...inp, gridColumn: '1/-1'}} placeholder="Subtítulo" value={state.subtitle} onChange={e => update('subtitle', e.target.value)} />
                <input style={inp} placeholder="Texto Botón" value={state.buttonText} onChange={e => update('buttonText', e.target.value)} />
                <select style={inp} value={state.style} onChange={e => update('style', e.target.value as any)}>
                    <option value="red">Estilo Primario</option>
                    <option value="dark">Estilo Oscuro</option>
                    <option value="gradient">Estilo Gradiente</option>
                </select>
                <textarea style={{...inp, gridColumn: '1/-1'}} placeholder="Features (una por línea)" rows={2} value={state.features} onChange={e => update('features', e.target.value)} />
            </div>
        </FieldPrimitive>
    );
}

export function ctaPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'CTA Preview',
        Input({ value, onChange }) { return <CtaInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
    };
}
