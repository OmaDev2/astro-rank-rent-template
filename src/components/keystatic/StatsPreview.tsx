import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';

// ─── Types ────────────────────────────────────────────────────────────────────
type StatItem = { value: string; suffix: string; label: string; icon: string };
type StatsState = {
    title: string;
    subtitle: string;
    stats: StatItem[];
};

const DEFAULTS: StatsState = {
    title: 'Nuestros Números',
    subtitle: 'Resultados que hablan por sí solos',
    stats: [
        { value: '15', suffix: '+', label: 'Años de experiencia', icon: '🏆' },
        { value: '500', suffix: '+', label: 'Proyectos completados', icon: '🏠' },
        { value: '4.9', suffix: '/5', label: 'Valoración media', icon: '⭐' },
    ],
};

// ─── Stat Preview Card ─────────────────────────────────────────────────────────
function StatCard({ stat }: { stat: StatItem }) {
    return (
        <div style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            flex: 1,
            minWidth: '120px',
        }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon || '📊'}</div>
            <div style={{
                fontSize: '36px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
            }}>
                {stat.value || '0'}<span style={{ fontSize: '22px' }}>{stat.suffix}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                {stat.label || 'Estadística'}
            </div>
        </div>
    );
}

// ─── Preview UI ────────────────────────────────────────────────────────────────
function StatsPreviewUI({ state }: { state: StatsState }) {
    return (
        <div style={{
            background: '#0f172a',
            borderRadius: '12px 12px 0 0',
            padding: '28px',
            fontFamily: 'Inter, system-ui, sans-serif',
            border: '1px solid rgba(239,68,68,0.15)',
            borderBottom: 'none',
        }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 6px', color: '#f8fafc', fontSize: '20px', fontWeight: 700 }}>
                    {state.title || DEFAULTS.title}
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                    {state.subtitle || DEFAULTS.subtitle}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {state.stats.map((stat, i) => <StatCard key={i} stat={stat} />)}
            </div>
            <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '10px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Vista Previa Stats
            </div>
        </div>
    );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function StatsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const parse = (v: string): StatsState => {
        try { return v ? { ...DEFAULTS, ...JSON.parse(v) } : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<StatsState>(() => parse(value));

    const update = (next: StatsState) => { setState(next); onChange(JSON.stringify(next)); };
    const updateStat = (i: number, key: keyof StatItem, val: string) => {
        const stats = state.stats.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
        update({ ...state, stats });
    };
    const addStat = () => update({ ...state, stats: [...state.stats, { value: '0', suffix: '', label: 'Nuevo', icon: '📌' }] });
    const removeStat = (i: number) => update({ ...state, stats: state.stats.filter((_, idx) => idx !== i) });

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '6px', padding: '7px 10px', color: '#e2e8f0',
        fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="📊 Estadísticas / Contadores (Vista Previa)">
            <StatsPreviewUI state={state} />
            <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.15)', borderTop: '1px solid rgba(99,102,241,0.08)', borderRadius: '0 0 12px 12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>{lbl('Título sección')}<input style={inp} value={state.title} onChange={e => update({ ...state, title: e.target.value })} placeholder="Nuestros Números" /></div>
                    <div>{lbl('Subtítulo')}<input style={inp} value={state.subtitle} onChange={e => update({ ...state, subtitle: e.target.value })} placeholder="Resultados que hablan por sí solos" /></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {lbl(`Contadores (${state.stats.length})`)}
                    {state.stats.map((stat, i) => (
                        <div key={i} style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', display: 'grid', gridTemplateColumns: '60px 80px 1fr 60px auto', gap: '8px', alignItems: 'end' }}>
                            <div>{lbl('Emoji')}<input style={inp} value={stat.icon} onChange={e => updateStat(i, 'icon', e.target.value)} placeholder="🏆" /></div>
                            <div>{lbl('Número')}<input style={inp} value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="15" /></div>
                            <div>{lbl('Etiqueta')}<input style={inp} value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Años de experiencia" /></div>
                            <div>{lbl('Sufijo')}<input style={inp} value={stat.suffix} onChange={e => updateStat(i, 'suffix', e.target.value)} placeholder="+" /></div>
                            <button onClick={() => removeStat(i)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '6px', padding: '7px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', alignSelf: 'end' }}>✕</button>
                        </div>
                    ))}
                    <button onClick={addStat} style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Añadir contador</button>
                </div>
            </div>
        </FieldPrimitive>
    );
}

// ─── Keystatic Field ───────────────────────────────────────────────────────────
export function statsVisualEditor(): BasicFormField<string> {
    return {
        kind: 'form',
        formKind: undefined,
        label: 'Estadísticas',
        Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
            return <StatsInput value={value} onChange={onChange} />;
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
