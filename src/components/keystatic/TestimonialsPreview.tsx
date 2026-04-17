import React, { useState } from 'react';
import { FieldPrimitive } from '@keystar/ui/field';
import type { BasicFormField } from '@keystatic/core';
import { getPreviewTheme } from './themeUtils';
import * as LucideIcons from 'lucide-react';

type TestimonialItem = { 
    quote: string; 
    author: string; 
    initials: string; 
    location: string; 
    date: string; 
    rating: number; 
    service: string; 
    size: string; 
    verified: boolean;
};
type TestimonialsState = { title: string; subtitle: string; testimonials: TestimonialItem[]; titleTag: 'h1' | 'h2' | 'h3' };

const DEFAULTS: TestimonialsState = {
    title: 'Lo Que Dicen Nuestros Clientes',
    subtitle: 'Testimonios reales de personas que han confiado en nosotros.',
    testimonials: [
        { 
            quote: 'Un trabajo impecable. Las paredes han quedado como nuevas y fueron muy limpios.', 
            author: 'Juan Pérez', 
            initials: 'JP', 
            location: 'Madrid', 
            date: 'Mayo 2024', 
            rating: 5, 
            service: 'Quitar Gotelé', 
            size: '80m2', 
            verified: true 
        },
    ],
    titleTag: 'h2'
};

// Componente de Estrellas
const Stars = ({ rating, color }: { rating: number, color: string }) => {
    const { Star } = LucideIcons;
    return (
        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={14} 
                    fill={i < rating ? color : 'transparent'} 
                    color={i < rating ? color : '#334155'} 
                />
            ))}
        </div>
    );
};

function TestimonialsPreviewUI({ state }: { state: TestimonialsState }) {
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
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: theme.primary, color: '#white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{state.titleTag}</span>
                </div>
                <h3 style={{ 
                    margin: '0 0 8px', 
                    color: theme.textMain, 
                    fontSize: '28px', 
                    fontWeight: 900, 
                    fontFamily: theme.fontHeading,
                    textTransform: 'uppercase'
                }}>
                    {state.title}
                </h3>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{state.subtitle}</p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px' 
            }}>
                {state.testimonials.map((t, i) => (
                    <div key={i} style={{ 
                        background: `${theme.surface}55`,
                        padding: '24px',
                        borderRadius: '16px',
                        border: `1px solid ${theme.primary}15`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '14px'
                            }}>
                                {t.initials || t.author.charAt(0)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: theme.textMain, fontWeight: 700, fontSize: '15px' }}>{t.author}</span>
                                    {t.verified && (
                                        <div title="Verificado" style={{ background: theme.primary, borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <LucideIcons.Check color="#fff" size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t.location} • {t.date}</div>
                            </div>
                        </div>

                        <Stars rating={t.rating} color={theme.primary} />
                        
                        <p style={{ 
                            margin: '0 0 16px', 
                            color: theme.textMain, 
                            fontSize: '13px', 
                            lineHeight: 1.6, 
                            fontStyle: 'italic',
                            flexGrow: 1
                        }}>
                            "{t.quote}"
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {t.service && (
                                <span style={{ background: `${theme.primary}15`, color: theme.textMain, padding: '4px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, border: `1px solid ${theme.primary}22` }}>
                                    {t.service}
                                </span>
                            )}
                            {t.size && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', color: theme.textMuted, padding: '4px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>
                                    Piso: {t.size}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TestimonialsInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const parse = (v: string): TestimonialsState => {
        try { return v ? JSON.parse(v) : { ...DEFAULTS }; }
        catch { return { ...DEFAULTS }; }
    };
    const [state, setState] = useState<TestimonialsState>(() => parse(value));

    const update = (key: keyof TestimonialsState, val: any) => {
        const next = { ...state, [key]: val };
        setState(next);
        onChange(JSON.stringify(next));
    };

    const updateItem = (idx: number, key: keyof TestimonialItem, val: any) => {
        const nextItems = [...state.testimonials];
        nextItems[idx] = { ...nextItems[idx], [key]: val };
        update('testimonials', nextItems);
    };

    const addItem = () => {
        update('testimonials', [...state.testimonials, { 
            quote: '', author: 'Nuevo Cliente', initials: 'NC', location: 'Barcelona', date: 'Julio 2024', rating: 5, service: '', size: '', verified: true 
        }]);
    };

    const removeItem = (idx: number) => {
        update('testimonials', state.testimonials.filter((_, i) => i !== idx));
    };

    const inp: React.CSSProperties = {
        background: '#1e293b', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0',
        fontSize: '13px', width: '100%', boxSizing: 'border-box'
    };
    const lbl = (t: string) => (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>{t}</div>
    );

    return (
        <FieldPrimitive label="⭐ Testimonios y Reseñas (Vista Previa)">
            <div>
                <TestimonialsPreviewUI state={state} />
                <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '16px', marginBottom: '24px' }}>
                        <div>{lbl('Título Principal')}<input style={inp} value={state.title} onChange={e => update('title', e.target.value)} /></div>
                        <div>{lbl('Subtítulo')}<input style={inp} value={state.subtitle} onChange={e => update('subtitle', e.target.value)} /></div>
                        <div>
                            {lbl('Etiqueta SEO (H2 recom.)')}
                            <select style={{ ...inp, cursor: 'pointer', appearance: 'none' }} value={state.titleTag} onChange={e => update('titleTag', e.target.value as any)}>
                                <option value="h1">H1 (Principal)</option>
                                <option value="h2">H2 (Secundario)</option>
                                <option value="h3">H3 (Terciario)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {state.testimonials.map((t, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px auto', gap: '10px', marginBottom: '12px' }}>
                                    <div>{lbl('Cliente')}<input style={inp} value={t.author} onChange={e => updateItem(i, 'author', e.target.value)} /></div>
                                    <div>{lbl('Inic.')}<input style={inp} value={t.initials} onChange={e => updateItem(i, 'initials', e.target.value)} /></div>
                                    <div>{lbl('Estrellas')}<input type="number" min="1" max="5" style={inp} value={t.rating} onChange={e => updateItem(i, 'rating', parseInt(e.target.value))} /></div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button onClick={() => removeItem(i)} style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444', borderRadius: '6px', height: '35px', padding: '0 12px', cursor: 'pointer' }}>×</button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                    <div>{lbl('Ubicación')}<input style={inp} value={t.location} onChange={e => updateItem(i, 'location', e.target.value)} /></div>
                                    <div>{lbl('Servicio')}<input style={inp} value={t.service} onChange={e => updateItem(i, 'service', e.target.value)} /></div>
                                    <div>{lbl('Metros m2')}<input style={inp} value={t.size} onChange={e => updateItem(i, 'size', e.target.value)} /></div>
                                </div>
                                <div>{lbl('Testimonio')}<textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={t.quote} onChange={e => updateItem(i, 'quote', e.target.value)} /></div>
                            </div>
                        ))}
                        <button onClick={addItem} style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}>+ Añadir Nueva Reseña</button>
                    </div>
                </div>
            </div>
        </FieldPrimitive>
    );
}

export function testimonialsPreview(): BasicFormField<string> {
    return {
        kind: 'form',
        label: 'Testimonials Preview',
        Input({ value, onChange }) { return <TestimonialsInput value={value} onChange={onChange} />; },
        defaultValue() { return JSON.stringify(DEFAULTS); },
        parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        serialize(val) { return { value: val }; },
        validate(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        reader: {
            parse(val) { return typeof val === 'string' ? val : JSON.stringify(DEFAULTS); },
        },
    };
}
