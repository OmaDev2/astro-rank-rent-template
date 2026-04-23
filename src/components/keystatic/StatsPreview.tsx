import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';
import { IconPickerUI } from './IconPicker';
import * as LucideIcons from 'lucide-react';

type StatItem = { label: string; value: string; suffix: string; icon: string };
type StatsState = { title: string; subtitle: string; stats: StatItem[]; titleTag: 'h1' | 'h2' | 'h3' };

const DEFAULTS: StatsState = {
    title: 'Nuestros Logros',
    subtitle: 'Expertos profesionales a tu servicio',
    stats: [
        { label: 'Años Experience', value: '15', suffix: '+', icon: 'Award' },
        { label: 'Proyectos', value: '500', suffix: '+', icon: 'CheckCircle' },
        { label: 'Valoración', value: '4.9', suffix: '/5', icon: 'Star' },
    ],
    titleTag: 'h2'
};

// Helper para renderizar el icono de Lucide si existe
const IconRenderer = ({ name, color, size = 24 }: { name: string, color: string, size?: number }) => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) return <Icon color={color} size={size} strokeWidth={2} />;
    return <div style={{ width: size, height: size, background: `${color}11`, borderRadius: '4px' }} />;
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
            </div>
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
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <IconRenderer name={s.icon} color={theme.primary} size={32} />
                        </div>
                        <div style={{ 
                            fontSize: '22px', 
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

    const update = (next: StatsState) => { setState(next); onChange(JSON.stringify(next)); };

    const updateField = (key: 'title' | 'subtitle' | 'titleTag', val: string) =>
        update({ ...state, [key]: val });

    const updateStat = (i: number, key: keyof StatItem, val: string) => {
        const stats = [...state.stats];
        stats[i] = { ...stats[i], [key]: val };
        update({ ...state, stats });
    };

    const addStat = () => update({
        ...state,
        stats: [...state.stats, { label: 'Nueva estadística', value: '0', suffix: '+', icon: 'Star' }]
    });

    const removeStat = (i: number) => {
        const stats = state.stats.filter((_, idx) => idx !== i);
        update({ ...state, stats });
    };

    const moveStat = (i: number, dir: -1 | 1) => {
        const stats = [...state.stats];
        const j = i + dir;
        if (j < 0 || j >= stats.length) return;
        [stats[i], stats[j]] = [stats[j], stats[i]];
        update({ ...state, stats });
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '6px', padding: '10px', color: '#e2e8f0',
        fontSize: '13px', width: '100%', boxSizing: 'border-box'
    };
    const btn = (color: string): React.CSSProperties => ({
        background: 'transparent', border: `1px solid ${color}44`, borderRadius: '4px',
        color, cursor: 'pointer', fontSize: '12px', padding: '3px 7px', lineHeight: 1,
    });

    return (
        <FieldPrimitive label="📊 Estadísticas (Vista Previa)">
            <div>
                <StatsPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Título / subtítulo / tag */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {(['title', 'subtitle'] as const).map(k => (
                            <div key={k}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>{k === 'title' ? 'Título' : 'Subtítulo'}</div>
                                <input style={inp} value={(state as any)[k]} onChange={e => updateField(k, e.target.value)} />
                            </div>
                        ))}
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Etiqueta SEO</div>
                            <select style={{ ...inp, cursor: 'pointer' }} value={state.titleTag} onChange={e => updateField('titleTag', e.target.value)}>
                                <option value="h1">H1</option>
                                <option value="h2">H2 (recomendado)</option>
                                <option value="h3">H3</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {state.stats.map((s, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Fila superior: icono + controles */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <IconPickerUI value={s.icon} onChange={v => updateStat(i, 'icon', v)} />
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button style={btn('#94a3b8')} onClick={() => moveStat(i, -1)} title="Subir">▲</button>
                                        <button style={btn('#94a3b8')} onClick={() => moveStat(i, 1)} title="Bajar">▼</button>
                                        <button style={btn('#ef4444')} onClick={() => removeStat(i)} title="Eliminar">✕</button>
                                    </div>
                                </div>
                                {/* Etiqueta */}
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Etiqueta</div>
                                    <input style={inp} placeholder="Ej: Clientes satisfechos" value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} />
                                </div>
                                {/* Valor + Sufijo */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Valor</div>
                                        <input style={inp} placeholder="Ej: 98" value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Sufijo</div>
                                        <input style={inp} placeholder="Ej: %" value={s.suffix} onChange={e => updateStat(i, 'suffix', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Añadir stat */}
                    <button onClick={addStat} style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', padding: '10px', width: '100%' }}>
                        + Añadir estadística
                    </button>
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
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
