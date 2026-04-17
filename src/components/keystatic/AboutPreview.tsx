import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';
import { IconPickerUI } from './IconPicker';
import * as LucideIcons from 'lucide-react';

type FeatureItem = { title: string; description: string; icon: string };
type AboutState = { 
    title: string; 
    titleHighlight: string; 
    description: string; 
    yearsExperience: string; 
    projectsCompleted: string;
    image: string | null;
    features: FeatureItem[];
    buttonText: string;
    buttonLink: string;
    titleTag: 'h1' | 'h2' | 'h3';
};

const DEFAULTS: AboutState = {
    title: 'Transformando hogares con',
    titleHighlight: 'Experiencia',
    description: 'Somos especialistas en quitar gotelé en Barcelona desde 2010. Nuestro compromiso es la limpieza y la perfección en cada acabado.',
    yearsExperience: '15+',
    projectsCompleted: '250+',
    image: null,
    features: [
        { title: 'Acabado Espejo', description: 'Paredes 100% lisas.', icon: 'Sparkles' },
        { title: 'Sin Polvo', description: 'Maquinaria con aspiración.', icon: 'Wind' },
    ],
    buttonText: 'Conócenos más',
    buttonLink: '#contacto',
    titleTag: 'h2'
};

const IconRenderer = ({ name, color, size = 20 }: { name: string, color: string, size?: number }) => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) return <Icon color={color} size={size} strokeWidth={1.5} />;
    return <div style={{ width: size, height: size, background: `${color}22`, borderRadius: '4px' }} />;
};

function AboutPreviewUI({ state }: { state: AboutState }) {
    const theme = getPreviewTheme();
    
    return (
        <div style={{
            background: theme.secondary,
            borderRadius: '12px 12px 0 0',
            padding: '40px',
            fontFamily: theme.fontBody,
            border: `1px solid ${theme.primary}33`,
            borderBottom: 'none',
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 0.8fr) 1.2fr',
            gap: '40px',
            alignItems: 'center'
        }}>
            <link rel="stylesheet" href={theme.googleFontsUrl} />
            
            {/* Column 1: Image & Badge */}
            <div style={{ position: 'relative' }}>
                <div style={{ 
                    aspectRatio: '1/1.2', 
                    background: '#1e293b', 
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.primary}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: state.image ? `url(${state.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    {!state.image && <LucideIcons.Image color={`${theme.primary}44`} size={64} />}
                </div>
                
                {/* Exp Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '-20px',
                    background: theme.primary,
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{state.yearsExperience}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px', opacity: 0.9 }}>Años Experiencia</div>
                </div>
            </div>

            {/* Column 2: Content */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
                </div>
                <h3 style={{ 
                    margin: '0 0 20px', 
                    color: theme.textMain, 
                    fontSize: '36px', 
                    fontWeight: 900, 
                    fontFamily: theme.fontHeading,
                    lineHeight: 1.1
                }}>
                    {state.title} <span style={{ color: theme.primary }}>{state.titleHighlight}</span>
                </h3>
                
                <p style={{ 
                    margin: '0 0 24px', 
                    color: theme.textMuted, 
                    fontSize: '15px', 
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                }}>
                    {state.description}
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: theme.primary }}>{state.projectsCompleted}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase' }}>Pisos Alisados</div>
                    </div>
                    <div style={{ width: '1px', background: `${theme.textMuted}22` }} />
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: theme.primary }}>100%</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase' }}>Satisfacción</div>
                    </div>
                </div>

                {/* Features List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
                    {state.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '2px' }}>
                                <IconRenderer name={f.icon} color={theme.primary} size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: theme.textMain }}>{f.title}</div>
                                <div style={{ fontSize: '12px', color: theme.textMuted }}>{f.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div style={{ 
                    display: 'inline-block',
                    background: theme.primary,
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                }}>
                    {state.buttonText}
                </div>
            </div>
        </div>
    );
}

function AboutInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): AboutState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<AboutState>(() => parse(value));

    const update = (key: keyof AboutState, val: any) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updateFeature = (idx: number, key: keyof FeatureItem, val: string) => {
        const nextFeatures = [...state.features];
        nextFeatures[idx] = { ...nextFeatures[idx], [key]: val };
        update('features', nextFeatures);
    };

    const addFeature = () => {
        update('features', [...state.features, { title: 'Nuevo Punto', description: 'Detalle...', icon: 'CheckCircle' }]);
    };

    const removeFeature = (idx: number) => {
        update('features', state.features.filter((_, i) => i !== idx));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px', padding: '10px', color: '#e2e8f0',
        fontSize: '13px', width: '100%', boxSizing: 'border-box'
    };
    const sel: React.CSSProperties = {
        ...inp, cursor: 'pointer', appearance: 'none'
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="🏢 Sobre Nosotros (Vista Previa)">
            <div>
                <AboutPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>{lbl('Título Base')}<input style={inp} value={state.title} onChange={e => update('title', e.target.value)} /></div>
                        <div>{lbl('Palabra Destacada')}<input style={inp} value={state.titleHighlight} onChange={e => update('titleHighlight', e.target.value)} /></div>
                        <div>
                            {lbl('Etiqueta SEO (H2 recom.)')}
                            <select style={sel} value={state.titleTag} onChange={e => update('titleTag', e.target.value as any)}>
                                <option value="h1">H1 (Principal)</option>
                                <option value="h2">H2 (Secundario)</option>
                                <option value="h3">H3 (Terciario)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        {lbl('Biografía Destacada')}
                        <textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={state.description} onChange={e => update('description', e.target.value)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>{lbl('Años (Badge)')}<input style={inp} value={state.yearsExperience} onChange={e => update('yearsExperience', e.target.value)} /></div>
                        <div>{lbl('Pisos Completados')}<input style={inp} value={state.projectsCompleted} onChange={e => update('projectsCompleted', e.target.value)} /></div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        {lbl('Puntos de Confianza')}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {state.features.map((f, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                                        <div>{lbl('Título')}<input style={inp} value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)} /></div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button onClick={() => removeFeature(i)} style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444', borderRadius: '6px', height: '38px', padding: '0 12px', cursor: 'pointer' }}>×</button>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        {lbl('Icono')}
                                        <IconPickerUI value={f.icon} onChange={v => updateFeature(i, 'icon', v)} />
                                    </div>
                                    <div>{lbl('Descripción corta')}<input style={inp} value={f.description} onChange={e => updateFeature(i, 'description', e.target.value)} /></div>
                                </div>
                            ))}
                            <button onClick={addFeature} style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '12px' }}>+ Añadir Punto de Confianza</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>{lbl('Texto Botón')}<input style={inp} value={state.buttonText} onChange={e => update('buttonText', e.target.value)} /></div>
                        <div>{lbl('Enlace Botón')}<input style={inp} value={state.buttonLink} onChange={e => update('buttonLink', e.target.value)} /></div>
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function aboutPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'About Preview',
        Input({ value, onChange }) { return <AboutInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
