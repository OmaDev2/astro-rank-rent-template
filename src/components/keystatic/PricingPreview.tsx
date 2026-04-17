import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';

type PlanItem = {
    title: string;
    price: string;
    priceUnit: string;
    description: string;
    isPopular: boolean;
    badge: string;
    features: string;
};

type PricingState = {
    title: string;
    subtitle: string;
    plans: PlanItem[];
};

const DEFAULTS: PricingState = {
    title: 'Planes y Precios',
    subtitle: 'Elige la opción que mejor se adapte a tus necesidades',
    plans: [
        {
            title: 'Básico',
            price: '18',
            priceUnit: '€/m²',
            description: 'Ideal para pequeños retoques',
            isPopular: false,
            badge: '',
            features: 'Alisado profesional\nMateriales incluidos\nLimpieza básica',
        },
        {
            title: 'Premium',
            price: '25',
            priceUnit: '€/m²',
            description: 'El acabado más perfecto para tu hogar',
            isPopular: true,
            badge: 'MÁS VENDIDO',
            features: 'Acabado Q4 extra-liso\nPintura incluida\nLimpieza profunda\nGarantía 5 años',
        }
    ],
};

function PlanPreviewCard({ plan }: { plan: PlanItem }) {
    const feats = plan.features.split('\n').map(f => f.trim()).filter(Boolean);
    return (
        <div style={{
            background: plan.isPopular ? '#1e293b' : 'rgba(239,68,68,0.03)',
            border: plan.isPopular ? '2px solid #ef4444' : '1px solid rgba(239,68,68,0.15)',
            borderRadius: '16px',
            padding: '30px 24px',
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: '#f8fafc',
            boxShadow: plan.isPopular ? '0 10px 30px rgba(239,68,68,0.15)' : 'none',
        }}>
            {plan.isPopular && plan.badge && (
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ef4444',
                    color: '#fff',
                    padding: '2px 12px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                }}>
                    {plan.badge}
                </div>
            )}
            <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{plan.title || 'Plan'}</h4>
                <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: '#ef4444' }}>{plan.price || '0'}</span>
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>{plan.priceUnit}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{plan.description}</p>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '16px' }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feats.map((f, i) => (
                        <li key={i} style={{ fontSize: '12px', display: 'flex', gap: '8px', color: '#e2e8f0' }}>
                            <span style={{ color: '#ef4444' }}>✓</span> {f}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function PricingInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const parse = (v: string): PricingState => {
        try { return v ? { ...DEFAULTS, ...JSON.parse(v) } : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<PricingState>(() => parse(value));
    
    const update = (next: PricingState) => { setState(next); onChange(JSON.stringify(next)); };
    const updatePlan = (i: number, key: keyof PlanItem, val: any) => {
        const plans = state.plans.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
        update({ ...state, plans });
    };
    const addPlan = () => update({ ...state, plans: [...state.plans, { title: 'Nuevo', price: '0', priceUnit: '€/m²', description: '', isPopular: false, badge: '', features: '' }] });
    const removePlan = (i: number) => update({ ...state, plans: state.plans.filter((_, idx) => idx !== i) });

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '6px', padding: '7px 10px', color: '#e2e8f0',
        fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="💰 Tabla de Precios (Vista Previa)">
            <div style={{ background: '#0f172a', padding: '30px', border: '1px solid rgba(239,68,68,0.15)', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#f8fafc', fontSize: '24px', fontWeight: 800 }}>{state.title}</h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{state.subtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {state.plans.map((p, i) => <PlanPreviewCard key={i} plan={p} />)}
                </div>
            </div>
            
            <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0 0 12px 12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>{lbl('Título Sección')}<input style={inp} value={state.title} onChange={e => update({ ...state, title: e.target.value })} /></div>
                    <div>{lbl('Subtítulo')}<input style={inp} value={state.subtitle} onChange={e => update({ ...state, subtitle: e.target.value })} /></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {lbl(`Planes (${state.plans.length})`)}
                    {state.plans.map((p, i) => (
                        <div key={i} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                                <div>{lbl('Nombre Plan')}<input style={inp} value={p.title} onChange={e => updatePlan(i, 'title', e.target.value)} /></div>
                                <div>{lbl('Precio')}<input style={inp} value={p.price} onChange={e => updatePlan(i, 'price', e.target.value)} /></div>
                                <div>{lbl('Unidad')}<input style={inp} value={p.priceUnit} onChange={e => updatePlan(i, 'priceUnit', e.target.value)} /></div>
                                <button onClick={() => removePlan(i)} style={{ alignSelf: 'end', background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                                <div>{lbl('Descripción')}<input style={inp} value={p.description} onChange={e => updatePlan(i, 'description', e.target.value)} /></div>
                                <div>{lbl('Etiqueta (Badge)')}<input style={inp} value={p.badge} onChange={e => updatePlan(i, 'badge', e.target.value)} /></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '20px' }}>
                                    <input type="checkbox" checked={p.isPopular} onChange={e => updatePlan(i, 'isPopular', e.target.checked)} />
                                    {lbl('Popular')}
                                </div>
                            </div>
                            <div>
                                {lbl('Características (una por línea)')}
                                <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={p.features} onChange={e => updatePlan(i, 'features', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <button onClick={addPlan} style={{ background: 'rgba(239,68,68,0.1)', border: '1px dashed #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>+ Añadir Plan</button>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function pricingVisualEditor(): BasicFormField<string> {
    return {
        kind: 'form',
        formKind: undefined,
        label: 'Precios en Tabla',
        Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
            return <PricingInput value={value} onChange={onChange} />;
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
