import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';

type CtaState = {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    features: string;
    style: 'red' | 'dark' | 'gradient';
};

const DEFAULTS: CtaState = {
    title: 'Pide tu Presupuesto Gratis',
    subtitle: 'Sin compromiso. Respuesta en menos de 24 horas.',
    buttonText: '📞 Llamar Ahora',
    buttonLink: 'tel:+34600000000',
    features: 'Presupuesto sin compromiso\nRespuesta en 24h\nMás de 500 clientes satisfechos',
    style: 'red',
};

const STYLE_BG: Record<string, string> = {
    red: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
};

function CtaPreviewUI({ state }: { state: CtaState }) {
    const feats = state.features.split('\n').map(f => f.trim()).filter(Boolean).slice(0, 4);
    return (
        <div style={{
            background: STYLE_BG[state.style] || STYLE_BG.red,
            borderRadius: '12px 12px 0 0',
            padding: '40px 36px',
            fontFamily: 'Inter, system-ui, sans-serif',
            border: '1px solid rgba(239,68,68,0.2)',
            borderBottom: 'none',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Grid texture */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 800, lineHeight: 1.2 }}>
                        {state.title || DEFAULTS.title}
                    </h3>
                    <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5 }}>
                        {state.subtitle || DEFAULTS.subtitle}
                    </p>
                    {feats.length > 0 && (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {feats.map((f, i) => (
                                <li key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                                    <span style={{ color: '#fca5a5' }}>✓</span> {f}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#991b1b',
                        padding: '14px 28px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '15px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                        whiteSpace: 'nowrap',
                    }}>
                        {state.buttonText || DEFAULTS.buttonText}
                    </span>
                </div>
            </div>
            <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '10px', background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Vista Previa CTA
            </div>
        </div>
    );
}

function CtaInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const parse = (v: string): CtaState => {
        try { return v ? { ...DEFAULTS, ...JSON.parse(v) } : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<CtaState>(() => parse(value));
    const update = (key: keyof CtaState, val: string) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '6px', padding: '8px 10px', color: '#e2e8f0',
        fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="🎯 Llamada a la Acción CTA (Vista Previa)">
            <CtaPreviewUI state={state} />
            <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.15)', borderTop: '1px solid rgba(99,102,241,0.08)', borderRadius: '0 0 12px 12px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    {lbl('Título principal')}
                    <input style={inp} value={state.title} onChange={e => update('title', e.target.value)} placeholder="Pide tu Presupuesto Gratis" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    {lbl('Subtítulo')}
                    <input style={inp} value={state.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="Sin compromiso. Respuesta en 24h." />
                </div>
                <div>
                    {lbl('Texto del botón')}
                    <input style={inp} value={state.buttonText} onChange={e => update('buttonText', e.target.value)} placeholder="📞 Llamar Ahora" />
                </div>
                <div>
                    {lbl('Enlace del botón')}
                    <input style={inp} value={state.buttonLink} onChange={e => update('buttonLink', e.target.value)} placeholder="tel:+34600123456" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    {lbl('✓ Características (una por línea, máx 4)')}
                    <textarea rows={4} style={{ ...inp, resize: 'vertical' }} value={state.features} onChange={e => update('features', e.target.value)} placeholder={'Presupuesto sin compromiso\nRespuesta en 24h\nMás de 500 clientes satisfechos'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    {lbl('Estilo de fondo')}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['red', 'dark', 'gradient'] as const).map(s => (
                            <button key={s} onClick={() => update('style', s)} style={{
                                padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                background: state.style === s ? STYLE_BG[s] : '#1e293b',
                                border: state.style === s ? '2px solid rgba(239,68,68,0.6)' : '1px solid rgba(99,102,241,0.2)',
                                color: state.style === s ? '#fff' : '#94a3b8',
                            }}>
                                {{ red: '🔴 Rojo', dark: '⬛ Oscuro', gradient: '🌅 Gradiente' }[s]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function ctaVisualEditor(): BasicFormField<string> {
    return {
        kind: 'form',
        formKind: undefined,
        label: 'CTA Visual',
        Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
            return <CtaInput value={value} onChange={onChange} />;
        },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val: FormFieldStoredValue) {
            if (val === undefined || val === null) return JSON.stringify(DEFAULTS);
            if (typeof val !== 'string') throw new Error('Expected string');
            return val;
        },
        serialize(val: string) { return { value: val ?? JSON.stringify(DEFAULTS) }; },
        validate(val: unknown) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val: unknown) {
                return typeof val === 'string' ? val : JSON.stringify(DEFAULTS);
            },
        },
    };
}
