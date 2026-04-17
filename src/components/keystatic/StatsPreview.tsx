import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';

type StatItem = { label: string; value: string; suffix: string; icon: string };
type StatsState = { title: string; subtitle: string; stats: StatItem[] };

const DEFAULTS: StatsState = {
    title: 'Nuestros Logros',
    subtitle: 'Expertos profesionales a tu servicio',
    stats: [
        { label: 'Años Experience', value: '15', suffix: '+', icon: '🏆' },
        { label: 'Proyectos', value: '500', suffix: '+', icon: '🏠' },
        { label: 'Valoración', value: '4.9', suffix: '/5', icon: '⭐' },
    ]
};

function StatsPreviewUI({ state }: { state: StatsState }) {
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
            <h3 style={{ 
                margin: '0 0 8px', 
                color: theme.textMain, 
                fontSize: '24px', 
                fontWeight: 800,
                fontFamily: theme.fontHeading
            }}>{state.title}</h3>
            <p style={{ margin: '0 0 24px', color: theme.textMuted, fontSize: '14px' }}>{state.subtitle}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {state.stats.map((s, i) => (
                    <div key={i} style={{ 
                        background: theme.surface, 
                        border: `1px solid ${theme.primary}22`, 
                        borderRadius: '10px', 
                        padding: '15px' 
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                        <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 900, 
                            color: theme.primary,
                            fontFamily: theme.fontHeading
                        }}>
                            {s.value}<span style={{ fontSize: '14px' }}>{s.suffix}</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatsInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): StatsState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<StatsState>(() => parse(value));

    const updateField = (key: 'title' | 'subtitle', val: string) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updateStat = (index: number, key: keyof StatItem, val: string) => {
        const nextStats = [...state.stats];
        nextStats[index] = { ...nextStats[index], [key]: val };
        const next = { ...state, stats: nextStats };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0',
        fontSize: '12px', width: '100%', boxSizing: 'border-box'
    };

    return (
        <FieldPrimitive label="📊 Estadísticas (Vista Previa)">
            <StatsPreviewUI state={state} />
            <div style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input style={inp} placeholder="Título" value={state.title} onChange={e => updateField('title', e.target.value)} />
                    <input style={inp} placeholder="Subtítulo" value={state.subtitle} onChange={e => updateField('subtitle', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {state.stats.map((s, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input style={{ ...inp, width: '35px' }} value={s.icon} onChange={e => updateStat(i, 'icon', e.target.value)} />
                                <input style={inp} value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input style={inp} value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} />
                                <input style={{ ...inp, width: '45px' }} value={s.suffix} onChange={e => updateStat(i, 'suffix', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function statsPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Stats Preview',
        Input({ value, onChange }) { return <StatsInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
    };
}
