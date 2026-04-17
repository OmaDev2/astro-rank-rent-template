import React, { useState, useCallback } from 'react';

// ── Spintax Engine ─────────────────────────────────────────────────────────────
function spin(text: string): string {
    if (!text || typeof text !== 'string') return text;
    const regex = /\{([^{}]+)\}/g;
    let processedText = text;
    let safety = 0;
    while (regex.test(processedText) && safety < 50) {
        processedText = processedText.replace(/\{([^{}]+)\}/g, (_match, content) => {
            const options = content.split('|');
            return options[Math.floor(Math.random() * options.length)];
        });
        safety++;
    }
    return processedText;
}

function countVariations(text: string): number {
    if (!text) return 0;
    const matches = text.match(/\{([^{}]+)\}/g);
    if (!matches) return 1;
    return matches.reduce((acc, match) => {
        const options = match.slice(1, -1).split('|');
        return acc * options.length;
    }, 1);
}

function highlightSpintax(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\{([^{}]+)\}/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
            parts.push(
                <span key={key++} style={{ color: '#e2e8f0' }}>
                    {text.slice(lastIndex, match.index)}
                </span>
            );
        }
        // The spintax group
        const options = match[1].split('|');
        parts.push(
            <span key={key++} style={{
                background: 'rgba(99,102,241,0.18)',
                border: '1px solid rgba(99,102,241,0.45)',
                borderRadius: '4px',
                padding: '1px 3px',
                fontSize: '0.93em',
            }}>
                <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>{'{'}  </span>
                {options.map((opt, i) => (
                    <React.Fragment key={i}>
                        <span style={{ color: '#c7d2fe' }}>{opt}</span>
                        {i < options.length - 1 && (
                            <span style={{ color: '#6366f1', fontWeight: 'bold', margin: '0 2px' }}>|</span>
                        )}
                    </React.Fragment>
                ))}
                <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>  {'}'}</span>
            </span>
        );
        lastIndex = match.index + match[0].length;
    }
    // Text after last match
    if (lastIndex < text.length) {
        parts.push(
            <span key={key++} style={{ color: '#e2e8f0' }}>
                {text.slice(lastIndex)}
            </span>
        );
    }
    return parts;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function SpintaxPreview() {
    const EXAMPLE = 'Somos {líderes|expertos|referentes|profesionales} en {fontanería|reparaciones del hogar} en {Madrid|Barcelona|Valencia}. {Contáctanos|Llámanos|Escríbenos} para un {presupuesto gratuito|presupuesto sin compromiso}.';

    const [text, setText] = useState(EXAMPLE);
    const [preview, setPreview] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const variations = countVariations(text);

    const generate = useCallback(() => {
        const result = spin(text);
        setPreview(result);
        setHistory(prev => [result, ...prev].slice(0, 8));
    }, [text]);

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const btnBase: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: 'none',
    };

    return (
        <div style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            background: '#0f172a',
            borderRadius: '16px',
            padding: '24px',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.2)',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '22px' }}>🔄</span>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                        Simulador de Spintax
                    </h2>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    Escribe texto con variaciones usando el formato <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', color: '#a5b4fc' }}>{'{opción A|opción B|opción C}'}</code>. Soporta anidamiento.
                </p>
            </div>

            {/* Input */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Texto Spintax
                </label>
                <textarea
                    value={text}
                    onChange={e => { setText(e.target.value); setPreview(''); }}
                    rows={4}
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '10px',
                        padding: '12px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none',
                    }}
                    placeholder="Ej: Somos {expertos|líderes} en {fontanería|electricidad} en {Madrid|Barcelona}..."
                />

                {/* Live highlight */}
                {text.trim() && (
                    <div style={{
                        marginTop: '8px',
                        background: '#131e35',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        lineHeight: 1.7,
                        overflowWrap: 'break-word',
                    }}>
                        <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                            Vista de estructura:
                        </span>
                        {highlightSpintax(text)}
                    </div>
                )}
            </div>

            {/* Stats + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{
                    background: '#1e293b',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: variations > 1 ? '#a5b4fc' : '#64748b',
                    border: '1px solid rgba(99,102,241,0.2)',
                }}>
                    <span style={{ fontWeight: 700, color: '#818cf8' }}>
                        {variations > 9999 ? '9999+' : variations.toLocaleString()}
                    </span>{' '}
                    variaciones posibles
                </div>

                <button
                    onClick={generate}
                    disabled={!text.trim()}
                    style={{
                        ...btnBase,
                        background: text.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
                        color: text.trim() ? '#fff' : '#475569',
                        boxShadow: text.trim() ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
                    }}
                >
                    ▶ Generar variación
                </button>

                <button
                    onClick={() => { setText(EXAMPLE); setPreview(''); setHistory([]); }}
                    style={{ ...btnBase, background: '#1e293b', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)' }}
                >
                    Ejemplo
                </button>
            </div>

            {/* Result */}
            {preview && (
                <div style={{
                    background: '#0d1f3c',
                    border: '1px solid rgba(99,102,241,0.35)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    position: 'relative',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ✨ Resultado
                        </span>
                        <button
                            onClick={() => copyToClipboard(preview)}
                            style={{ ...btnBase, padding: '4px 10px', fontSize: '12px', background: copied ? '#064e3b' : '#1e293b', color: copied ? '#34d399' : '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }}
                        >
                            {copied ? '✓ Copiado' : '📋 Copiar'}
                        </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#f1f5f9' }}>
                        {preview}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                        {preview.length} caracteres
                    </div>
                </div>
            )}

            {/* History */}
            {history.length > 1 && (
                <div>
                    <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        Últimas variaciones generadas
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {history.slice(1).map((item, i) => (
                            <div
                                key={i}
                                onClick={() => copyToClipboard(item)}
                                style={{
                                    background: '#1e293b',
                                    border: '1px solid rgba(99,102,241,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                title="Clic para copiar"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Keystatic Custom Field ─────────────────────────────────────────────────────
import type { BasicFormField } from '@keystatic/core';
import { FieldPrimitive } from '@keystar/ui/field';

export function spintaxSimulator(): BasicFormField<string, undefined, string> {
    return {
        kind: 'form',
        formKind: undefined,
        defaultValue() { return ''; },
        Input({ onChange, value, autoFocus }: {
            onChange: (val: string) => void;
            value: string;
            autoFocus?: boolean;
        }) {
            return (
                <FieldPrimitive label="Simulador de Spintax">
                    <SpintaxPreview />
                </FieldPrimitive>
            );
        },
        parse(val: unknown) { return typeof val === 'string' ? val : ''; },
        serialize(val: string) { return { value: val ?? '' }; },
        validate(val: unknown) { return typeof val === 'string' ? val : ''; },
        reader: {
            parse(val: unknown) { return typeof val === 'string' ? val : ''; },
        },
    };
}
