import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
type HeroState = {
    heading: string;
    headingHighlight: string;
    subheading: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    features: string;
    bgColor: string;
    titleTag: 'h1' | 'h2' | 'h3';
};

const DEFAULTS: HeroState = {
    heading: 'Tu Título Principal',
    headingHighlight: 'Destacado',
    subheading: '⚠️ Escribe aquí tu subtítulo para ver la previsualización del Hero.',
    ctaPrimaryText: 'Pedir Presupuesto',
    ctaSecondaryText: 'WhatsApp',
    features: 'Servicio Rápido\nGarantía Total\nPresupuesto Gratis',
    bgColor: '#0a0a0a',
    titleTag: 'h1',
};

// ─── Component ──────────────────────────────────────────────────────────────
function HeroPreviewUI({ state }: { state: HeroState }) {
    const theme = getPreviewTheme();
    const feats = Array.isArray(state.features) 
        ? state.features 
        : (typeof state.features === 'string' ? state.features.split('\n').map(f => f.trim()).filter(Boolean).slice(0, 6) : []);
    
    return (
        <div style={{
            background: theme.secondary,
            borderRadius: '12px 12px 0 0',
            padding: '40px',
            fontFamily: theme.fontBody,
            border: `1px solid ${theme.primary}33`,
            borderBottom: 'none',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '320px',
            display: 'flex',
            alignItems: 'center'
        }}>
            {/* Inject Theme Fonts */}
            <link rel="stylesheet" href={theme.googleFontsUrl} />
            
            {/* Background Texture */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
            
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '90%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
                </div>
                <h2 style={{ 
                    margin: 0, 
                    color: theme.textMain, 
                    fontSize: '36px', 
                    fontWeight: 900, 
                    lineHeight: 1,
                    fontFamily: theme.fontHeading,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em'
                }}>
                    {state.heading} <br/>
                    <span style={{ 
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {state.headingHighlight}
                    </span>
                </h2>
                <p style={{ margin: '16px 0 24px', color: theme.textMuted, fontSize: '15px', lineHeight: 1.6, maxWidth: '500px' }}>
                    {state.subheading}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ background: theme.primary, color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, boxShadow: `0 4px 15px ${theme.primary}44`, display: 'inline-block' }}>
                        {state.ctaPrimaryText}
                    </span>
                    {state.ctaSecondaryText && (
                        <span style={{ border: `1px solid ${theme.textMuted}66`, color: theme.textMain, padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, display: 'inline-block' }}>
                            {state.ctaSecondaryText}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {feats.map((f, i) => (
                        <div key={i} style={{ fontSize: '11px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ color: theme.primary, fontSize: '14px' }}>✓</span> {f}
                        </div>
                    ))}
                </div>
            </div>
            
            <div style={{ position: 'absolute', top: 12, right: 20, fontSize: '9px', color: theme.primary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', background: `${theme.primary}11`, padding: '4px 10px', borderRadius: '4px' }}>
                Vista Previa Hero
            </div>
        </div>
    );
}

// ─── Form Input ───────────────────────────────────────────────────────────
function HeroInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): HeroState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<HeroState>(() => parse(value));

    const update = (key: keyof HeroState, val: string) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0',
        fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
    };
    const sel: React.CSSProperties = {
        ...inp, cursor: 'pointer', appearance: 'none'
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="🚀 Hero Principal (Vista Previa)">
            <div>
                <HeroPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>{lbl('Título Base')}<input style={inp} value={state.heading} onChange={e => update('heading', e.target.value)} /></div>
                    <div>{lbl('Texto Destacado')}<input style={inp} value={state.headingHighlight} onChange={e => update('headingHighlight', e.target.value)} /></div>
                    <div>{lbl('Subtítulo')}<input style={inp} value={state.subheading} onChange={e => update('subheading', e.target.value)} /></div>
                    <div>
                        {lbl('Etiqueta SEO (H1 recom.)')}
                        <select style={sel} value={state.titleTag} onChange={e => update('titleTag', e.target.value as any)}>
                            <option value="h1">H1 (Principal)</option>
                            <option value="h2">H2 (Secundario)</option>
                            <option value="h3">H3 (Terciario)</option>
                        </select>
                    </div>
                    <div>{lbl('Texto Botón 1')}<input style={inp} value={state.ctaPrimaryText} onChange={e => update('ctaPrimaryText', e.target.value)} /></div>
                    <div>{lbl('Texto Botón 2')}<input style={inp} value={state.ctaSecondaryText} onChange={e => update('ctaSecondaryText', e.target.value)} /></div>
                    <div style={{ gridColumn: '1 / -1' }}>{lbl('✓ Características (una por línea)')}<textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={state.features} onChange={e => update('features', e.target.value)} /></div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function heroPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Hero Preview',
        Input({ value, onChange }) { return <HeroInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
