import React, { useState, useEffect } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';

// ─── Types ────────────────────────────────────────────────────────────────────
type HeroState = {
    heading: string;
    headingHighlight: string;
    subheading: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    features: string;
    bgColor: string;
};

const DEFAULTS: HeroState = {
    heading: 'Tu Servicio Profesional',
    headingHighlight: 'en tu Ciudad',
    subheading: '⚠️ Escribe aquí tu subtítulo para ver la previsualización del Hero.',
    ctaPrimaryText: 'Pedir Presupuesto',
    ctaSecondaryText: 'WhatsApp',
    features: 'Servicio Rápido\nGarantía Total\nPresupuesto Gratis',
    bgColor: '#0a0a0a',
};

// ─── Preview Component ─────────────────────────────────────────────────────────
function HeroPreviewUI({ state }: { state: HeroState }) {
    const featureList = state.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .slice(0, 6);

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '380px',
                background: state.bgColor || '#0a0a0a',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                padding: '40px 48px',
                fontFamily: 'Inter, system-ui, sans-serif',
                border: '1px solid rgba(239,68,68,0.18)',
            }}
        >
            {/* Gradient overlay — simulates the left dark fade */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.75) 55%, transparent 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Grid texture */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none',
                }}
            />

            {/* Corner badge */}
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '10px',
                    color: '#f87171',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}
            >
                Vista Previa Hero
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                {/* H1 */}
                <h2
                    style={{
                        fontSize: 'clamp(28px, 4vw, 52px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '16px',
                        color: '#f8fafc',
                        margin: '0 0 16px',
                    }}
                >
                    {state.heading || DEFAULTS.heading}{' '}
                    <br />
                    <span
                        style={{
                            background: 'linear-gradient(135deg, #ef4444, #f97316)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {state.headingHighlight || DEFAULTS.headingHighlight}
                    </span>
                </h2>

                {/* Subheading */}
                <p
                    style={{
                        fontSize: '15px',
                        color: 'rgba(248,250,252,0.88)',
                        marginBottom: '20px',
                        fontWeight: 600,
                        paddingLeft: '14px',
                        borderLeft: '3px solid #ef4444',
                        lineHeight: 1.55,
                        margin: '0 0 20px',
                    }}
                >
                    {state.subheading || DEFAULTS.subheading}
                </p>

                {/* Features checklist */}
                {featureList.length > 0 && (
                    <ul
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '6px 20px',
                            marginBottom: '24px',
                            padding: 0,
                            listStyle: 'none',
                        }}
                    >
                        {featureList.map((feat, i) => (
                            <li
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#f8fafc',
                                }}
                            >
                                <span
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        background: 'rgba(239,68,68,0.2)',
                                        border: '1.5px solid rgba(239,68,68,0.5)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        fontSize: '9px',
                                        color: '#ef4444',
                                    }}
                                >
                                    ✓
                                </span>
                                {feat}
                            </li>
                        ))}
                    </ul>
                )}

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                        style={{
                            padding: '11px 24px',
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
                        }}
                    >
                        📞 {state.ctaPrimaryText || DEFAULTS.ctaPrimaryText}
                    </span>
                    <span
                        style={{
                            padding: '11px 24px',
                            border: '1.5px solid rgba(248,250,252,0.25)',
                            color: '#f8fafc',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        💬 {state.ctaSecondaryText || DEFAULTS.ctaSecondaryText}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Input widget ──────────────────────────────────────────────────────────────
function HeroPreviewInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const parse = (v: string): HeroState => {
        try {
            return v ? { ...DEFAULTS, ...JSON.parse(v) } : { ...DEFAULTS };
        } catch {
            return { ...DEFAULTS };
        }
    };

    const [state, setState] = useState<HeroState>(() => parse(value));

    // Sync if parent resets
    useEffect(() => {
        setState(parse(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const update = (key: keyof HeroState, val: string) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1e293b',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#e2e8f0',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        outline: 'none',
        lineHeight: 1.5,
    };

    const label = (text: string) => (
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {text}
        </div>
    );

    return (
        <FieldPrimitive label="🎨 Vista Previa del Hero (Edición Rápida)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', fontFamily: 'inherit' }}>

                {/* Info banner */}
                <div style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px 10px 0 0',
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>✏️</span>
                    <span>
                        Edita los textos aquí y verás el resultado <strong style={{ color: '#a5b4fc' }}>en tiempo real</strong>.
                        Cuando termines, pulsa <strong style={{ color: '#a5b4fc' }}>Save</strong> para guardar todos los cambios.
                    </span>
                </div>

                {/* Main 2-col layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 420px',
                    gap: '0',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                }}>
                    {/* LEFT: Live Preview */}
                    <div style={{ padding: '0' }}>
                        <HeroPreviewUI state={state} />
                    </div>

                    {/* RIGHT: Controls */}
                    <div style={{
                        background: '#0f172a',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        borderLeft: '1px solid rgba(99,102,241,0.12)',
                        overflowY: 'auto',
                        maxHeight: '520px',
                    }}>
                        <div>
                            {label('Título (parte blanca)')}
                            <input type="text" value={state.heading} onChange={e => update('heading', e.target.value)}
                                style={inputStyle} placeholder="Ej: Reformas Profesionales" />
                        </div>

                        <div>
                            {label('Parte roja (gradiente)')}
                            <input type="text" value={state.headingHighlight} onChange={e => update('headingHighlight', e.target.value)}
                                style={inputStyle} placeholder="Ej: en Madrid" />
                        </div>

                        <div>
                            {label('Subtítulo')}
                            <input type="text" value={state.subheading} onChange={e => update('subheading', e.target.value)}
                                style={inputStyle} placeholder="Frase corta de apoyo" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                {label('Botón 1')}
                                <input type="text" value={state.ctaPrimaryText} onChange={e => update('ctaPrimaryText', e.target.value)}
                                    style={inputStyle} placeholder="Pedir Presupuesto" />
                            </div>
                            <div>
                                {label('Botón 2')}
                                <input type="text" value={state.ctaSecondaryText} onChange={e => update('ctaSecondaryText', e.target.value)}
                                    style={inputStyle} placeholder="WhatsApp" />
                            </div>
                        </div>

                        <div>
                            {label('✓ Checks (uno por línea, máx. 6)')}
                            <textarea rows={5} value={state.features} onChange={e => update('features', e.target.value)}
                                style={{ ...inputStyle, resize: 'vertical' }}
                                placeholder={'Servicio Rápido\nGarantía Total\nPresupuesto Gratis\nAtención 24h'} />
                        </div>

                        <div>
                            {label('Color fondo base')}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="color" value={state.bgColor || '#0a0a0a'}
                                    onChange={e => update('bgColor', e.target.value)}
                                    style={{ width: '42px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: 0 }} />
                                <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
                                    {state.bgColor || '#0a0a0a'}
                                </span>
                            </div>
                        </div>

                        <div style={{ paddingTop: '4px', borderTop: '1px solid rgba(99,102,241,0.1)', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                            💡 Recuerda también configurar la <strong style={{ color: '#6366f1' }}>imagen de fondo</strong> y el <strong style={{ color: '#6366f1' }}>enlace de los botones</strong> en el bloque <em>Hero Principal</em> del Constructor de abajo.
                        </div>
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

// ─── Keystatic Field ───────────────────────────────────────────────────────────
export function heroPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        formKind: undefined,
        label: 'Vista Previa Hero',
        Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
            return <HeroPreviewInput value={value} onChange={onChange} />;
        },
        defaultValue() {
            return JSON.stringify(DEFAULTS);
        },
        parse(val: FormFieldStoredValue) {
            if (val === undefined || val === null) return JSON.stringify(DEFAULTS);
            if (typeof val !== 'string') throw new Error('Expected string');
            return val;
        },
        serialize(val: string) {
            return { value: val ?? JSON.stringify(DEFAULTS) };
        },
        validate(val: unknown) {
            return typeof val === 'string' ? val : JSON.stringify(DEFAULTS);
        },
        reader: {
            parse(val: unknown) {
                if (typeof val === 'string') return val;
                return JSON.stringify(DEFAULTS);
            },
        },
    };
}
