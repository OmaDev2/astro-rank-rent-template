import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';
import { IconPickerUI } from './IconPicker';
import * as LucideIcons from 'lucide-react';

type StepItem = { title: string; description: string; icon: string; duration: string };
type ProcessState = { title: string; subtitle: string; steps: StepItem[] };

const DEFAULTS: ProcessState = {
    title: 'Nuestro Método Profesional',
    subtitle: 'Un proceso perfeccionado para maximizar calidad y limpieza.',
    steps: [
        { title: '1. Visita y Presupuesto', description: 'Evaluamos tu piso sin compromiso.', icon: 'ClipboardCheck', duration: '30-45 min' },
        { title: '2. Protección Total', description: 'Protegemos suelos y muebles minuciosamente.', icon: 'Shield', duration: '2-3 horas' },
        { title: '3. Lijado y Alisado', description: 'Eliminamos el gotelé con aspiración industrial.', icon: 'Wind', duration: '1-2 días' },
    ]
};

// Helper para renderizar el icono de Lucide si existe
const IconRenderer = ({ name, color, size = 24 }: { name: string, color: string, size?: number }) => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) return <Icon color={color} size={size} strokeWidth={1.5} />;
    return <div style={{ width: size, height: size, background: `${color}22`, borderRadius: '4px' }} />;
};

function ProcessPreviewUI({ state }: { state: ProcessState }) {
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
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ 
                    margin: '0 0 12px', 
                    color: theme.textMain, 
                    fontSize: '32px', 
                    fontWeight: 900, 
                    textAlign: 'center',
                    fontFamily: theme.fontHeading,
                    textTransform: 'uppercase'
                }}>
                    {state.title}
                </h3>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '15px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {state.subtitle}
                </p>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Timeline Line */}
                <div style={{ 
                    position: 'absolute', 
                    left: '23px', 
                    top: '20px', 
                    bottom: '20px', 
                    width: '2px', 
                    background: `linear-gradient(to bottom, ${theme.primary}33, ${theme.primary}, ${theme.primary}33)`,
                    zIndex: 0
                }} />

                {state.steps.map((s, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        gap: '24px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Step Marker */}
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            background: theme.surface, 
                            border: `2px solid ${theme.primary}`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 0 15px ${theme.primary}22`
                        }}>
                            <IconRenderer name={s.icon} color={theme.primary} size={22} />
                        </div>

                        {/* Step Content */}
                        <div style={{ 
                            background: `${theme.surface}44`,
                            padding: '24px',
                            borderRadius: '16px',
                            border: `1px solid ${theme.primary}11`,
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '20px'
                        }}>
                            <div style={{ flexGrow: 1 }}>
                                <h4 style={{ margin: '0 0 8px', color: theme.textMain, fontSize: '18px', fontWeight: 800 }}>{s.title}</h4>
                                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px', lineHeight: 1.5 }}>{s.description}</p>
                            </div>
                            
                            {s.duration && (
                                <div style={{ 
                                    background: `${theme.primary}15`, 
                                    color: theme.primary,
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    border: `1px solid ${theme.primary}33`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <LucideIcons.Clock size={12} />
                                    {s.duration}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProcessInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): ProcessState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<ProcessState>(() => parse(value));

    const update = (key: keyof ProcessState, val: any) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updateStep = (idx: number, key: keyof StepItem, val: string) => {
        const nextSteps = [...state.steps];
        nextSteps[idx] = { ...nextSteps[idx], [key]: val };
        update('steps', nextSteps);
    };

    const addStep = () => {
        update('steps', [...state.steps, { title: `${state.steps.length + 1}. Nuevo Paso`, description: 'Detalle del proceso...', icon: 'CheckCircle', duration: '1 día' }]);
    };

    const removeStep = (idx: number) => {
        update('steps', state.steps.filter((_, i) => i !== idx));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px', padding: '10px', color: '#e2e8f0',
        fontSize: '13px', width: '100%', boxSizing: 'border-box'
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="👷 Método Paso a Paso (Vista Previa)">
            <ProcessPreviewUI state={state} />
            <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>{lbl('Título Sección')}<input style={inp} value={state.title} onChange={e => update('title', e.target.value)} /></div>
                    <div>{lbl('Subtítulo')}<input style={inp} value={state.subtitle} onChange={e => update('subtitle', e.target.value)} /></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {state.steps.map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '10px', marginBottom: '12px' }}>
                                <div>{lbl(`Paso ${i+1}: Título`)}<input style={inp} value={s.title} onChange={e => updateStep(i, 'title', e.target.value)} /></div>
                                <div>{lbl('Duración Est.')}<input style={inp} value={s.duration} onChange={e => updateStep(i, 'duration', e.target.value)} /></div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button onClick={() => removeStep(i)} style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444', borderRadius: '6px', height: '38px', padding: '0 12px', cursor: 'pointer' }}>×</button>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                                {lbl('Icono del Paso')}
                                <IconPickerUI value={s.icon} onChange={v => updateStep(i, 'icon', v)} />
                            </div>

                            <div>{lbl('Explicación detallada')}<textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={s.description} onChange={e => updateStep(i, 'description', e.target.value)} /></div>
                        </div>
                    ))}
                    <button onClick={addStep} style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}>+ Añadir Nuevo Paso al Proceso</button>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function processPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Process Preview',
        Input({ value, onChange }) { return <ProcessInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
    };
}
