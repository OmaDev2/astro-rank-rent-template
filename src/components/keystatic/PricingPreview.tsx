import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';

type Plan = { title: string; price: string; priceUnit: string; description: string; isPopular: boolean; features: string; badge: string };
type PricingState = { title: string; subtitle: string; plans: Plan[]; titleTag: 'h1' | 'h2' | 'h3' };

const DEFAULTS: PricingState = {
    title: 'Nuestros Precios',
    subtitle: 'Elige el plan que mejor se adapte a ti',
    plans: [
        { title: 'Básico', price: '18', priceUnit: '€/m2', description: 'Ideal para habitaciones pequeñas', isPopular: false, features: 'Material incluido\nMano de obra\nLimpieza', badge: '' },
        { title: 'Estándar', price: '1500', priceUnit: '€', description: 'Piso completo de 80m2', isPopular: true, features: 'Todo incluido\nGarantía 2 años\nPrioridad', badge: 'MÁS POPULAR' },
        { title: 'Premium', price: '1800', priceUnit: '€', description: 'Piso de 100m2', isPopular: false, features: 'Acabado de lujo\nRetirada escombros\nGarantía 5 años', badge: '' },
    ],
    titleTag: 'h2'
};

function PricingPreviewUI({ state }: { state: PricingState }) {
    const theme = getPreviewTheme();
    return (
        <div style={{
            background: theme.secondary,
            borderRadius: '12px 12px 0 0',
            padding: '30px',
            fontFamily: theme.fontBody,
            border: `1px solid ${theme.primary}33`,
            borderBottom: 'none',
            textAlign: 'center'
        }}>
            <link rel="stylesheet" href={theme.googleFontsUrl} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
            </div>
            <h3 style={{ margin: '0 0 8px', color: theme.textMain, fontSize: '24px', fontWeight: 800, fontFamily: theme.fontHeading }}>{state.title}</h3>
            <p style={{ margin: '0 0 24px', color: theme.textMuted, fontSize: '14px' }}>{state.subtitle}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {state.plans.map((p, i) => (
                    <div key={i} style={{ 
                        background: p.isPopular ? theme.surface : 'transparent', 
                        border: `1px solid ${p.isPopular ? theme.primary : theme.primary + '22'}`, 
                        borderRadius: '12px', 
                        padding: '20px',
                        position: 'relative',
                        transform: p.isPopular ? 'scale(1.05)' : 'none',
                        zIndex: p.isPopular ? 2 : 1
                    }}>
                        {p.isPopular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: theme.primary, color: '#fff', fontSize: '8px', fontWeight: 900, padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{p.badge || 'POPULAR'}</div>}
                        <div style={{ fontSize: '12px', fontWeight: 700, color: theme.textMain, marginBottom: '10px', textTransform: 'uppercase' }}>{p.title}</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: theme.primary, fontFamily: theme.fontHeading }}>
                            {p.price}<span style={{ fontSize: '14px', color: theme.textMuted }}>{p.priceUnit}</span>
                        </div>
                        <p style={{ fontSize: '10px', color: theme.textMuted, margin: '10px 0', minHeight: '30px' }}>{p.description}</p>
                        <hr style={{ border: 'none', borderTop: `1px solid ${theme.primary}11`, margin: '15px 0' }} />
                        <div style={{ fontSize: '10px', color: theme.textMain, textAlign: 'left' }}>
                            {(Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? p.features.split('\n').filter(Boolean) : [])).map((f: any, j: number) => (
                                <div key={j} style={{ marginBottom: '4px' }}>✓ {f}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PricingInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): PricingState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<PricingState>(() => parse(value));

    const update = (key: keyof PricingState, val: any) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updatePlan = (idx: number, key: keyof Plan, val: any) => {
        const plans = [...state.plans];
        plans[idx] = { ...plans[idx], [key]: val };
        update('plans', plans);
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0',
        fontSize: '11px', width: '100%', boxSizing: 'border-box'
    };

    return (
        <FieldPrimitive label="💰 Tabla de Precios (Preview)">
            <div>
                <PricingPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(59,130,246,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Título</div>
                            <input style={inp} placeholder="Título" value={state.title} onChange={e => update('title', e.target.value)} />
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Subtítulo</div>
                            <input style={inp} placeholder="Subtítulo" value={state.subtitle} onChange={e => update('subtitle', e.target.value)} />
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Etiqueta SEO (H2 recom.)</div>
                            <select style={{ ...inp, cursor: 'pointer', appearance: 'none' }} value={state.titleTag} onChange={e => update('titleTag', e.target.value as any)}>
                                <option value="h1">H1</option>
                                <option value="h2">H2</option>
                                <option value="h3">H3</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {state.plans.map((p, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '6px', 
                                background: 'rgba(255,255,255,0.03)', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: p.isPopular ? `1px solid ${getPreviewTheme().primary}` : 'none' 
                            }}>
                                <input style={inp} value={p.title} onChange={e => updatePlan(i, 'title', e.target.value)} />
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input style={inp} value={p.price} onChange={e => updatePlan(i, 'price', e.target.value)} />
                                    <input style={{ ...inp, width: '45px' }} value={p.priceUnit} onChange={e => updatePlan(i, 'priceUnit', e.target.value)} />
                                </div>
                                <textarea style={{ ...inp, resize: 'none' }} rows={2} value={p.description} onChange={e => updatePlan(i, 'description', e.target.value)} />
                                <label style={{ fontSize: '9px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input type="checkbox" checked={p.isPopular} onChange={e => updatePlan(i, 'isPopular', e.target.checked)} /> Destacado
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function pricingPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Pricing Preview',
        Input({ value, onChange }) { return <PricingInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
